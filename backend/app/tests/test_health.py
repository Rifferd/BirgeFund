from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check_returns_ok() -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_root_returns_test_mode_info() -> None:
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "BirgeFund API"
    assert data["mode"] == "TEST_MODE"
    assert data["test_mode"] is True
    assert data["status"] == "running"
