from uuid import uuid4

from fastapi.testclient import TestClient

from app.core.permissions import Permissions
from app.db.session import SessionLocal
from app.main import app
from app.modules.ledger.repository import LedgerEntryRepository
from app.modules.projects.model import Project
from app.modules.roles.repository import RoleRepository
from app.modules.users.repository import UserRepository

client = TestClient(app)


def unique_email(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex}@example.com"


def unique_slug(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex}"


def register_and_login(email: str, password: str = "DemoPass123!") -> str:
    client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Refund Test User",
            "preferred_language": "ru",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 200
    return response.json()["access_token"]


def grant_permission_to_user(email: str, permission_code: str) -> None:
    with SessionLocal() as db:
        users = UserRepository(db)
        roles = RoleRepository(db)

        user = users.get_by_email(email)
        assert user is not None

        permission = roles.get_permission_by_code(permission_code)
        if permission is None:
            permission = roles.create_permission(
                code=permission_code,
                title=permission_code,
                description=f"Permission {permission_code}",
            )

        role = roles.get_role_by_name("finance_manager")
        if role is None:
            role = roles.create_role(
                name="finance_manager",
                title="Financial Manager",
                description="Can manage refunds",
                is_system=True,
            )

        roles.assign_permission_to_role(role, permission)
        roles.assign_role_to_user(user, role)

        db.commit()


def ensure_default_fee_rules() -> None:
    response = client.post("/api/payments/fee-rules/defaults")
    assert response.status_code in {200, 201}


def create_fundraising_project(access_token: str) -> int:
    response = client.post(
        "/api/projects",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "slug": unique_slug("refund-project"),
            "project_type": "preorder",
            "funding_type": "all_or_nothing",
            "city": "Бишкек",
            "goal_amount": "300000.00",
            "currency": "KGS",
            "deadline": "2026-12-31",
            "category_ids": [],
            "translations": [
                {
                    "language": "ru",
                    "title": "Тестовый проект для refund",
                    "short_description": "Проект нужен для проверки test refund.",
                    "description": "Этот проект используется в автотестах refund, ledger и permissions.",
                    "risks": "Это тестовый проект.",
                    "refund_policy": "Платформа работает в тестовом режиме.",
                }
            ],
        },
    )

    assert response.status_code == 201
    project_id = response.json()["id"]

    with SessionLocal() as db:
        project = db.get(Project, project_id)
        assert project is not None

        project.status = "fundraising"
        db.add(project)
        db.commit()

    return project_id


def create_and_confirm_payment(access_token: str, project_id: int) -> int:
    create_response = client.post(
        "/api/payments/mock/create",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "project_id": project_id,
            "amount": "10000.00",
            "currency": "KGS",
            "method": "TEST_CARD",
            "idempotency_key": f"refund-idem-{uuid4().hex}",
            "request_payload": {
                "comment": "Тестовая поддержка перед refund",
                "anonymous": False,
            },
        },
    )

    assert create_response.status_code == 201
    payment_id = create_response.json()["id"]

    confirm_response = client.post(
        "/api/payments/mock/confirm",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"payment_attempt_id": payment_id},
    )

    assert confirm_response.status_code == 200
    assert confirm_response.json()["status"] == "success"

    return payment_id


def test_refund_requires_payments_refund_permission() -> None:
    ensure_default_fee_rules()

    payer_token = register_and_login(unique_email("refund-no-permission"))
    project_id = create_fundraising_project(payer_token)
    payment_id = create_and_confirm_payment(payer_token, project_id)

    response = client.post(
        f"/api/payments/{payment_id}/refund",
        headers={"Authorization": f"Bearer {payer_token}"},
        json={"reason": "Проверка запрета refund без permission"},
    )

    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "PERMISSION_DENIED"


def test_refund_creates_refund_and_reverse_ledger_entry() -> None:
    ensure_default_fee_rules()

    payer_token = register_and_login(unique_email("refund-payer"))
    project_id = create_fundraising_project(payer_token)
    payment_id = create_and_confirm_payment(payer_token, project_id)

    finance_email = unique_email("finance")
    finance_token = register_and_login(finance_email)

    grant_permission_to_user(finance_email, Permissions.PAYMENTS_REFUND)

    response = client.post(
        f"/api/payments/{payment_id}/refund",
        headers={"Authorization": f"Bearer {finance_token}"},
        json={"reason": "Тестовый возврат через finance permission"},
    )

    assert response.status_code == 200

    refund = response.json()

    assert refund["payment_attempt_id"] == payment_id
    assert refund["project_id"] == project_id
    assert refund["amount"] == "10000.00"
    assert refund["reason"] == "Тестовый возврат через finance permission"

    with SessionLocal() as db:
        entries = LedgerEntryRepository(db).list_by_payment_attempt(payment_id)

    entry_types = sorted(entry.type.value for entry in entries)

    assert entry_types == [
        "PLATFORM_FEE",
        "PROJECT_GROSS",
        "PROJECT_NET",
        "REFUND",
    ]

    refund_entries = [entry for entry in entries if entry.type.value == "REFUND"]

    assert len(refund_entries) == 1
    assert str(refund_entries[0].amount) == "-10000.00"


def test_second_refund_for_same_payment_returns_400() -> None:
    ensure_default_fee_rules()

    payer_token = register_and_login(unique_email("refund-second-payer"))
    project_id = create_fundraising_project(payer_token)
    payment_id = create_and_confirm_payment(payer_token, project_id)

    finance_email = unique_email("finance-second")
    finance_token = register_and_login(finance_email)

    grant_permission_to_user(finance_email, Permissions.PAYMENTS_REFUND)

    first_response = client.post(
        f"/api/payments/{payment_id}/refund",
        headers={"Authorization": f"Bearer {finance_token}"},
        json={"reason": "Первый тестовый возврат"},
    )

    assert first_response.status_code == 200

    second_response = client.post(
        f"/api/payments/{payment_id}/refund",
        headers={"Authorization": f"Bearer {finance_token}"},
        json={"reason": "Повторный тестовый возврат"},
    )

    assert second_response.status_code == 400
    assert second_response.json()["detail"]["code"] == "BAD_REQUEST"


def test_project_ledger_summary_after_refund() -> None:
    ensure_default_fee_rules()

    payer_token = register_and_login(unique_email("refund-summary-payer"))
    project_id = create_fundraising_project(payer_token)
    payment_id = create_and_confirm_payment(payer_token, project_id)

    finance_email = unique_email("finance-summary")
    finance_token = register_and_login(finance_email)

    grant_permission_to_user(finance_email, Permissions.PAYMENTS_REFUND)

    refund_response = client.post(
        f"/api/payments/{payment_id}/refund",
        headers={"Authorization": f"Bearer {finance_token}"},
        json={"reason": "Возврат для проверки summary"},
    )

    assert refund_response.status_code == 200

    summary_response = client.get(f"/api/ledger/projects/{project_id}/summary")

    assert summary_response.status_code == 200

    summary = summary_response.json()

    assert summary["gross_collected"] == "0.00"
    assert summary["refunded_amount"] == "10000.00"
    assert summary["platform_fee_amount"] == "700.00"
    assert summary["net_amount"] == "9300.00"
