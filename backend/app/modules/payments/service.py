from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import BadRequestException, NotFoundException, PermissionDeniedException, TestModeOnlyException
from app.modules.audit.service import AuditActions, AuditLogService, EntityTypes
from app.modules.ledger.service import LedgerService
from app.modules.payments.model import PaymentAttempt, PlatformFeeRule
from app.modules.payments.repository import PaymentAttemptRepository, PlatformFeeRuleRepository
from app.modules.payments.schema import MockPaymentCreateRequest, PlatformFeeRuleCreate, PlatformFeeRuleUpdate
from app.modules.projects.repository import ProjectRepository
from app.modules.users.model import User
from app.shared.enums import PaymentAttemptStatus, ProjectStatus, ProjectType


DEFAULT_PLATFORM_FEE_RULES = [
    PlatformFeeRuleCreate(project_type=ProjectType.DONATION, percent=Decimal("0.00")),
    PlatformFeeRuleCreate(project_type=ProjectType.REWARD, percent=Decimal("5.00")),
    PlatformFeeRuleCreate(project_type=ProjectType.PREORDER, percent=Decimal("7.00")),
    PlatformFeeRuleCreate(project_type=ProjectType.BUSINESS_SUPPORT, percent=Decimal("7.00")),
]


class PlatformFeeService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.rules = PlatformFeeRuleRepository(db)

    def list_rules(self) -> list[PlatformFeeRule]:
        return self.rules.list_all()

    def get_or_default_rule(self, project_type: ProjectType) -> PlatformFeeRule | None:
        return self.rules.get_by_project_type(project_type)

    def calculate_fee(self, *, project_type: ProjectType, amount: Decimal) -> Decimal:
        rule = self.get_or_default_rule(project_type)

        if rule is None or not rule.is_active:
            return Decimal("0.00")

        fee = amount * (rule.percent / Decimal("100"))

        if fee < rule.min_amount:
            fee = rule.min_amount

        return fee.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    def create_default_rules(self) -> list[PlatformFeeRule]:
        created_rules: list[PlatformFeeRule] = []

        for rule_data in DEFAULT_PLATFORM_FEE_RULES:
            existing_rule = self.rules.get_by_project_type(rule_data.project_type)

            if existing_rule is not None:
                continue

            created_rules.append(self.rules.create(rule_data))

        self.db.commit()

        return created_rules

    def upsert_rule(self, data: PlatformFeeRuleCreate) -> PlatformFeeRule:
        existing_rule = self.rules.get_by_project_type(data.project_type)

        if existing_rule is None:
            rule = self.rules.create(data)
        else:
            rule = self.rules.update(
                existing_rule,
                PlatformFeeRuleUpdate(
                    percent=data.percent,
                    min_amount=data.min_amount,
                    is_active=data.is_active,
                ),
            )

        self.db.commit()
        self.db.refresh(rule)

        return rule


class PaymentService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.payments = PaymentAttemptRepository(db)
        self.projects = ProjectRepository(db)
        self.platform_fees = PlatformFeeService(db)
        self.ledger = LedgerService(db)
        self.audit = AuditLogService(db)

    def create_mock_payment(
        self,
        *,
        current_user: User,
        data: MockPaymentCreateRequest,
    ) -> PaymentAttempt:
        if not settings.test_mode:
            raise TestModeOnlyException("Mock payment доступен только в TEST MODE")

        existing_payment = self.payments.get_by_user_and_idempotency_key(
            user_id=current_user.id,
            idempotency_key=data.idempotency_key,
        )

        if existing_payment is not None:
            return existing_payment

        project = self.projects.get_by_id(data.project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        if project.status not in {ProjectStatus.FUNDRAISING}:
            raise BadRequestException("Поддержать можно только проект со статусом fundraising")

        if data.currency != "KGS":
            raise BadRequestException("В demo-версии поддерживается только валюта KGS")

        if data.amount <= 0:
            raise BadRequestException("Сумма поддержки должна быть больше нуля")

        payment_attempt = self.payments.create(
            user_id=current_user.id,
            data=data,
        )

        self.audit.create_log(
            action=AuditActions.PAYMENT_CREATED,
            entity_type=EntityTypes.PAYMENT_ATTEMPT,
            entity_id=payment_attempt.id,
            actor=current_user,
            new_values={
                "project_id": payment_attempt.project_id,
                "amount": str(payment_attempt.amount),
                "currency": payment_attempt.currency,
                "status": payment_attempt.status.value,
            },
        )

        self.db.commit()
        self.db.refresh(payment_attempt)

        return payment_attempt

    def confirm_mock_payment(
        self,
        *,
        current_user: User,
        payment_attempt_id: int,
    ) -> PaymentAttempt:
        if not settings.test_mode:
            raise TestModeOnlyException("Mock payment доступен только в TEST MODE")

        payment_attempt = self.payments.get_by_id(payment_attempt_id)

        if payment_attempt is None:
            raise NotFoundException("Платёжная попытка не найдена")

        if payment_attempt.user_id != current_user.id:
            raise PermissionDeniedException("Можно подтверждать только свою тестовую оплату")

        if payment_attempt.status == PaymentAttemptStatus.SUCCESS:
            return payment_attempt

        if payment_attempt.status != PaymentAttemptStatus.PENDING:
            raise BadRequestException("Подтвердить можно только pending payment attempt")

        project = self.projects.get_by_id(payment_attempt.project_id)

        if project is None:
            raise NotFoundException("Проект не найден")

        if project.status != ProjectStatus.FUNDRAISING:
            raise BadRequestException("Поддержать можно только проект со статусом fundraising")

        if self.ledger.has_entries_for_payment_attempt(payment_attempt.id):
            raise BadRequestException("Ledger entries для этой оплаты уже существуют")

        platform_fee_amount = self.platform_fees.calculate_fee(
            project_type=project.project_type,
            amount=payment_attempt.amount,
        )

        payment_attempt = self.payments.mark_success(payment_attempt)

        self.ledger.create_payment_entries(
            payment_attempt=payment_attempt,
            platform_fee_amount=platform_fee_amount,
            created_by_id=current_user.id,
        )

        self.audit.create_log(
            action=AuditActions.PAYMENT_CONFIRMED,
            entity_type=EntityTypes.PAYMENT_ATTEMPT,
            entity_id=payment_attempt.id,
            actor=current_user,
            old_values={"status": PaymentAttemptStatus.PENDING.value},
            new_values={
                "status": PaymentAttemptStatus.SUCCESS.value,
                "amount": str(payment_attempt.amount),
                "platform_fee_amount": str(platform_fee_amount),
                "project_net_amount": str(payment_attempt.amount - platform_fee_amount),
            },
        )

        self.db.commit()
        self.db.refresh(payment_attempt)

        return payment_attempt

    def list_my_payments(self, current_user: User) -> list[PaymentAttempt]:
        return self.payments.list_by_user(current_user.id)
