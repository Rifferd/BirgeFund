from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session

from app.modules.payments.model import PlatformFeeRule
from app.modules.payments.repository import PlatformFeeRuleRepository
from app.modules.payments.schema import PlatformFeeRuleCreate, PlatformFeeRuleUpdate
from app.shared.enums import ProjectType


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
