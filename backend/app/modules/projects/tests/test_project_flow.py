from uuid import uuid4

from fastapi.testclient import TestClient

from app.core.permissions import Permissions
from app.db.session import SessionLocal
from app.main import app
from app.modules.audit.model import AuditLog
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
            "full_name": "Project Test User",
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


def create_project(access_token: str, slug: str | None = None) -> dict:
    response = client.post(
        "/api/projects",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "slug": slug or unique_slug("project"),
            "project_type": "donation",
            "funding_type": "all_or_nothing",
            "city": "Ош",
            "goal_amount": "300000.00",
            "currency": "KGS",
            "deadline": "2026-12-31",
            "category_ids": [],
            "translations": [
                {
                    "language": "ru",
                    "title": "Книги для школьной библиотеки",
                    "short_description": "Собираем поддержку для школьной библиотеки.",
                    "description": "Проект помогает сельской школе обновить библиотеку учебными и художественными книгами.",
                    "risks": "Сроки поставки книг могут измениться.",
                    "refund_policy": "Платформа работает в тестовом режиме.",
                }
            ],
        },
    )

    assert response.status_code == 201

    return response.json()


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

        role = roles.get_role_by_name("project_moderator")
        if role is None:
            role = roles.create_role(
                name="project_moderator",
                title="Project Moderator",
                description="Can moderate projects",
                is_system=True,
            )

        roles.assign_permission_to_role(role, permission)
        roles.assign_role_to_user(user, role)

        db.commit()


def test_author_can_create_project_draft() -> None:
    access_token = register_and_login(unique_email("project-author"))

    project = create_project(access_token)

    assert project["id"]
    assert project["status"] == "draft"
    assert project["author_id"]
    assert project["translations"][0]["language"] == "ru"
    assert project["translations"][0]["title"] == "Книги для школьной библиотеки"


def test_author_can_submit_draft_to_review_and_audit_log_is_created() -> None:
    access_token = register_and_login(unique_email("submit-author"))
    project = create_project(access_token)

    response = client.post(
        f"/api/projects/{project['id']}/submit-review",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200

    submitted_project = response.json()

    assert submitted_project["status"] == "pending_review"
    assert submitted_project["submitted_at"] is not None

    with SessionLocal() as db:
        audit_log = (
            db.query(AuditLog)
            .filter(
                AuditLog.action == "project.status_changed",
                AuditLog.entity_type == "project",
                AuditLog.entity_id == str(project["id"]),
            )
            .order_by(AuditLog.id.desc())
            .first()
        )

        assert audit_log is not None
        assert audit_log.old_values == {"status": "draft"}
        assert audit_log.new_values == {"status": "pending_review"}


def test_submitted_project_cannot_be_edited_as_draft() -> None:
    access_token = register_and_login(unique_email("submitted-edit-author"))
    project = create_project(access_token)

    submit_response = client.post(
        f"/api/projects/{project['id']}/submit-review",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert submit_response.status_code == 200

    update_response = client.patch(
        f"/api/projects/{project['id']}",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "city": "Бишкек",
        },
    )

    assert update_response.status_code == 400
    assert update_response.json()["detail"]["code"] == "BAD_REQUEST"


def test_project_requires_ru_translation() -> None:
    access_token = register_and_login(unique_email("no-ru-author"))

    response = client.post(
        "/api/projects",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "slug": unique_slug("no-ru"),
            "project_type": "donation",
            "funding_type": "all_or_nothing",
            "city": "Ош",
            "goal_amount": "300000.00",
            "currency": "KGS",
            "deadline": "2026-12-31",
            "category_ids": [],
            "translations": [
                {
                    "language": "en",
                    "title": "School library books",
                    "short_description": "Collecting support for school library.",
                    "description": "This project helps a school update its library.",
                    "risks": "Delivery dates may change.",
                    "refund_policy": "The platform works in test mode.",
                }
            ],
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "BAD_REQUEST"


def test_moderator_can_approve_pending_project() -> None:
    author_token = register_and_login(unique_email("approve-author"))
    project = create_project(author_token)

    submit_response = client.post(
        f"/api/projects/{project['id']}/submit-review",
        headers={"Authorization": f"Bearer {author_token}"},
    )

    assert submit_response.status_code == 200

    moderator_email = unique_email("moderator")
    moderator_token = register_and_login(moderator_email)

    grant_permission_to_user(moderator_email, Permissions.PROJECTS_MODERATE)

    response = client.patch(
        f"/api/projects/{project['id']}/status",
        headers={"Authorization": f"Bearer {moderator_token}"},
        json={
            "status": "approved",
            "reason": "Проект соответствует правилам платформы",
        },
    )

    assert response.status_code == 200
    assert response.json()["status"] == "approved"

    with SessionLocal() as db:
        audit_log = (
            db.query(AuditLog)
            .filter(
                AuditLog.action == "project.status_changed",
                AuditLog.entity_type == "project",
                AuditLog.entity_id == str(project["id"]),
            )
            .order_by(AuditLog.id.desc())
            .first()
        )

        assert audit_log is not None
        assert audit_log.old_values == {"status": "pending_review"}
        assert audit_log.new_values == {"status": "approved"}


def test_invalid_status_transition_returns_400() -> None:
    access_token = register_and_login(unique_email("invalid-transition-author"))
    project = create_project(access_token)

    response = client.post(
        f"/api/projects/{project['id']}/submit-review",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200

    second_response = client.post(
        f"/api/projects/{project['id']}/submit-review",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert second_response.status_code == 400
    assert second_response.json()["detail"]["code"] == "BAD_REQUEST"
