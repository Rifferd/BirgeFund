from uuid import uuid4

from fastapi.testclient import TestClient

from app.db.session import SessionLocal
from app.main import app
from app.modules.ledger.repository import LedgerEntryRepository
from app.modules.projects.model import Project

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
            "full_name": "Payment Test User",
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


def create_fundraising_project(access_token: str) -> int:
    response = client.post(
        "/api/projects",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "slug": unique_slug("payment-project"),
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
                    "title": "Тестовый проект для оплаты",
                    "short_description": "Проект нужен для проверки mock payment.",
                    "description": "Этот проект используется в автотестах оплаты, ledger и idempotency.",
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


def ensure_default_fee_rules() -> None:
    response = client.post("/api/payments/fee-rules/defaults")
    assert response.status_code in {200, 201}


def test_create_mock_payment_is_idempotent_by_user_and_key() -> None:
    ensure_default_fee_rules()

    access_token = register_and_login(unique_email("payment-idempotent"))
    project_id = create_fundraising_project(access_token)

    payload = {
        "project_id": project_id,
        "amount": "10000.00",
        "currency": "KGS",
        "method": "TEST_CARD",
        "idempotency_key": f"idem-{uuid4().hex}",
        "request_payload": {
            "comment": "Тестовая поддержка",
            "anonymous": False,
        },
    }

    first_response = client.post(
        "/api/payments/mock/create",
        headers={"Authorization": f"Bearer {access_token}"},
        json=payload,
    )

    second_response = client.post(
        "/api/payments/mock/create",
        headers={"Authorization": f"Bearer {access_token}"},
        json=payload,
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 201

    first_payment = first_response.json()
    second_payment = second_response.json()

    assert first_payment["id"] == second_payment["id"]
    assert first_payment["idempotency_key"] == second_payment["idempotency_key"]
    assert first_payment["status"] == "pending"


def test_confirm_mock_payment_does_not_duplicate_ledger_entries() -> None:
    ensure_default_fee_rules()

    access_token = register_and_login(unique_email("payment-confirm-idem"))
    project_id = create_fundraising_project(access_token)

    create_response = client.post(
        "/api/payments/mock/create",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "project_id": project_id,
            "amount": "10000.00",
            "currency": "KGS",
            "method": "TEST_CARD",
            "idempotency_key": f"confirm-idem-{uuid4().hex}",
            "request_payload": {
                "comment": "Тестовая поддержка",
                "anonymous": False,
            },
        },
    )

    assert create_response.status_code == 201
    payment_id = create_response.json()["id"]

    first_confirm = client.post(
        "/api/payments/mock/confirm",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"payment_attempt_id": payment_id},
    )

    second_confirm = client.post(
        "/api/payments/mock/confirm",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"payment_attempt_id": payment_id},
    )

    assert first_confirm.status_code == 200
    assert second_confirm.status_code == 200
    assert first_confirm.json()["id"] == second_confirm.json()["id"]
    assert second_confirm.json()["status"] == "success"

    with SessionLocal() as db:
        entries = LedgerEntryRepository(db).list_by_payment_attempt(payment_id)

    assert len(entries) == 3

    entry_types = sorted(entry.type.value for entry in entries)

    assert entry_types == [
        "PLATFORM_FEE",
        "PROJECT_GROSS",
        "PROJECT_NET",
    ]
