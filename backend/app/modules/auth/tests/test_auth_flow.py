from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def unique_email(prefix: str = "user") -> str:
    return f"{prefix}-{uuid4().hex}@example.com"


def test_register_login_me_and_refresh_flow() -> None:
    email = unique_email("auth")
    password = "DemoPass123!"

    register_response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Auth Test User",
            "preferred_language": "ru",
        },
    )

    assert register_response.status_code == 201

    registered_user = register_response.json()

    assert registered_user["email"] == email
    assert registered_user["full_name"] == "Auth Test User"
    assert "password_hash" not in registered_user

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert login_response.status_code == 200

    tokens = login_response.json()

    assert tokens["token_type"] == "bearer"
    assert tokens["access_token"]
    assert tokens["refresh_token"]

    me_response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )

    assert me_response.status_code == 200
    assert me_response.json()["email"] == email

    refresh_response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": tokens["refresh_token"]},
    )

    assert refresh_response.status_code == 200

    new_tokens = refresh_response.json()

    assert new_tokens["access_token"]
    assert new_tokens["refresh_token"]
    assert new_tokens["refresh_token"] != tokens["refresh_token"]

    old_refresh_response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": tokens["refresh_token"]},
    )

    assert old_refresh_response.status_code == 401


def test_login_with_wrong_password_returns_401() -> None:
    email = unique_email("wrong-password")
    password = "DemoPass123!"

    client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Wrong Password User",
            "preferred_language": "ru",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"]["code"] == "UNAUTHORIZED"
