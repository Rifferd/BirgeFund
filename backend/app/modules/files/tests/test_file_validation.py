from io import BytesIO
from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def unique_email(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex}@example.com"


def register_and_login(email: str, password: str = "DemoPass123!") -> str:
    client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "File Test User",
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


def test_upload_rejects_txt_file() -> None:
    access_token = register_and_login(unique_email("file-txt"))

    response = client.post(
        "/api/files/upload?file_type=project_report_file&is_public=true",
        headers={"Authorization": f"Bearer {access_token}"},
        files={
            "file": (
                "test.txt",
                BytesIO(b"BirgeFund test file"),
                "text/plain",
            )
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "BAD_REQUEST"


def test_upload_accepts_png_image() -> None:
    access_token = register_and_login(unique_email("file-png"))

    response = client.post(
        "/api/files/upload?file_type=project_image&is_public=true",
        headers={"Authorization": f"Bearer {access_token}"},
        files={
            "file": (
                "project.png",
                BytesIO(b"\x89PNG\r\n\x1a\n"),
                "image/png",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["file_type"] == "project_image"
    assert data["original_name"] == "project.png"
    assert data["mime_type"] == "image/png"
    assert data["is_public"] is True


def test_upload_rejects_pdf_for_project_image() -> None:
    access_token = register_and_login(unique_email("file-pdf-image"))

    response = client.post(
        "/api/files/upload?file_type=project_image&is_public=true",
        headers={"Authorization": f"Bearer {access_token}"},
        files={
            "file": (
                "document.pdf",
                BytesIO(b"%PDF-1.4"),
                "application/pdf",
            )
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "BAD_REQUEST"


def test_upload_rejects_large_image() -> None:
    access_token = register_and_login(unique_email("file-large-image"))
    large_image = BytesIO(b"0" * (6 * 1024 * 1024))

    response = client.post(
        "/api/files/upload?file_type=project_image&is_public=true",
        headers={"Authorization": f"Bearer {access_token}"},
        files={
            "file": (
                "large.png",
                large_image,
                "image/png",
            )
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "BAD_REQUEST"
