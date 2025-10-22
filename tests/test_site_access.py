"""Smoke tests for verifying the HRIS API can be viewed locally.

Run ``pytest -k site_access -s`` to see the responses while checking
that the FastAPI application boots correctly.
"""

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root_endpoint_is_accessible() -> None:
    """Ensure the root route returns the welcome message for the site."""

    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "WorkRight HRIS API"}


def test_docs_endpoint_renders_successfully() -> None:
    """The automatically generated docs help "view" the service."""

    response = client.get("/docs")
    assert response.status_code == 200
    assert "Swagger UI" in response.text
