from datetime import date, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel, Session, create_engine

from app.database import get_session
from app.main import create_app


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
SQLModel.metadata.create_all(engine)


def get_test_session():
    with Session(engine) as session:
        yield session


def create_client() -> TestClient:
    app = create_app()
    app.dependency_overrides[get_session] = get_test_session
    return TestClient(app)


def test_end_to_end_hris_flow():
    client = create_client()

    department_resp = client.post(
        "/departments/",
        json={"name": "Engineering", "description": "Product development"},
    )
    assert department_resp.status_code == 201
    department = department_resp.json()

    employee_resp = client.post(
        "/employees/",
        json={
            "first_name": "Alice",
            "last_name": "Smith",
            "email": "alice@example.com",
            "department_id": department["id"],
            "position": "Software Engineer",
            "hire_date": date.today().isoformat(),
        },
    )
    assert employee_resp.status_code == 201
    employee = employee_resp.json()

    job_resp = client.post(
        "/recruitment/jobs",
        json={
            "title": "QA Analyst",
            "department_id": department["id"],
            "description": "Test software",
            "openings": 2,
        },
    )
    assert job_resp.status_code == 201
    job = job_resp.json()

    candidate_resp = client.post(
        f"/recruitment/jobs/{job['id']}/candidates",
        json={
            "first_name": "Bob",
            "last_name": "Brown",
            "email": "bob@example.com",
            "phone": "+123456789",
        },
    )
    assert candidate_resp.status_code == 201

    task_resp = client.post(
        "/onboarding/tasks",
        json={
            "employee_id": employee["id"],
            "title": "Submit paperwork",
            "due_date": (date.today() + timedelta(days=3)).isoformat(),
        },
    )
    assert task_resp.status_code == 201

    payroll_run_resp = client.post(
        "/payroll/runs",
        json={
            "period_start": (date.today().replace(day=1)).isoformat(),
            "period_end": date.today().isoformat(),
        },
    )
    assert payroll_run_resp.status_code == 201
    payroll_run = payroll_run_resp.json()

    payroll_entry_resp = client.post(
        "/payroll/entries",
        json={
            "payroll_run_id": payroll_run["id"],
            "employee_id": employee["id"],
            "gross_pay": 5000,
            "tax_withheld": 1000,
        },
    )
    assert payroll_entry_resp.status_code == 201

    shift_resp = client.post(
        "/rostering/shifts",
        json={
            "employee_id": employee["id"],
            "start_time": datetime.utcnow().isoformat(),
            "end_time": (datetime.utcnow() + timedelta(hours=8)).isoformat(),
            "location": "HQ",
        },
    )
    assert shift_resp.status_code == 201

    accommodation_resp = client.post(
        "/travel/accommodations",
        json={
            "employee_id": employee["id"],
            "property_name": "Downtown Hotel",
            "check_in": date.today().isoformat(),
            "check_out": (date.today() + timedelta(days=2)).isoformat(),
        },
    )
    assert accommodation_resp.status_code == 201

    flight_resp = client.post(
        "/travel/flights",
        json={
            "employee_id": employee["id"],
            "departure_airport": "JFK",
            "arrival_airport": "LAX",
            "departure_time": datetime.utcnow().isoformat(),
            "arrival_time": (datetime.utcnow() + timedelta(hours=6)).isoformat(),
        },
    )
    assert flight_resp.status_code == 201

    change_request_resp = client.post(
        "/workflow/requests",
        json={
            "employee_id": employee["id"],
            "request_type": "Promotion",
            "details": "Promote to Senior Engineer",
        },
    )
    assert change_request_resp.status_code == 201
    change_request = change_request_resp.json()

    decision_resp = client.post(
        f"/workflow/requests/{change_request['id']}/decision",
        json={"status": "Approved", "approver_notes": "Great performance"},
    )
    assert decision_resp.status_code == 200
    assert decision_resp.json()["status"] == "Approved"

    template_resp = client.post(
        "/documents/templates",
        json={
            "name": "Offer Letter",
            "content": "Welcome {{full_name}} to {{department}} as a {{position}}.",
        },
    )
    assert template_resp.status_code == 201
    template = template_resp.json()

    document_resp = client.post(
        "/documents/generate",
        json={
            "employee_id": employee["id"],
            "template_id": template["id"],
            "filename": "offer-letter.txt",
            "extra_context": {"department": "Engineering"},
        },
    )
    assert document_resp.status_code == 201
    assert "Welcome" in document_resp.json()["content"]

    profile_resp = client.get(f"/employees/{employee['id']}/profile")
    assert profile_resp.status_code == 200
    profile = profile_resp.json()
    assert profile["employee"]["id"] == employee["id"]
    assert len(profile["onboarding_tasks"]) == 1
    assert len(profile["scheduled_shifts"]) == 1
    assert len(profile["accommodation_bookings"]) == 1
    assert len(profile["flight_bookings"]) == 1
    assert len(profile["change_requests"]) == 1
    assert len(profile["payroll_history"]) == 1

    org_resp = client.get("/employees/org/structure")
    assert org_resp.status_code == 200
    org = org_resp.json()
    assert isinstance(org, list)
