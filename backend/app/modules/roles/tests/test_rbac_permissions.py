from uuid import uuid4

from fastapi.testclient import TestClient

from app.db.session import SessionLocal
from app.main import app
from app.modules.roles.repository import RoleRepository
from app.modules.users.repository import UserRepository


client = TestClient(app)


def unique_email(prefix: str = "rbac") -> str:
    return f"{prefix}-{uuid4().hex}@example.com"


def register_and_login(email: str, password: str = "DemoPass123!") -> str:
    client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "RBAC Test User",
            "preferred_language": "ru",
        },
    )

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert login_response.status_code == 200

    return login_response.json()["access_token"]


def test_permission_required_endpoint_denies_user_without_permission() -> None:
    email = unique_email("no-permission")
    access_token = register_and_login(email)

    response = client.get(
        "/api/debug/admin-only",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "PERMISSION_DENIED"


def test_permission_required_endpoint_allows_user_with_permission() -> None:
    email = unique_email("with-permission")
    access_token = register_and_login(email)

    with SessionLocal() as db:
        users = UserRepository(db)
        roles = RoleRepository(db)

        user = users.get_by_email(email)
        assert user is not None

        permission = roles.get_permission_by_code("users.read")
        if permission is None:
            permission = roles.create_permission(
                code="users.read",
                title="Read users",
                description="Allows reading users",
            )

        role = roles.get_role_by_name("test_admin")
        if role is None:
            role = roles.create_role(
                name="test_admin",
                title="Test Admin",
                description="Test role for RBAC checks",
                is_system=True,
            )

        roles.assign_permission_to_role(role, permission)
        roles.assign_role_to_user(user, role)

        db.commit()

    response = client.get(
        "/api/debug/admin-only",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Permission check passed"
    assert data["required_permission"] == "users.read"
