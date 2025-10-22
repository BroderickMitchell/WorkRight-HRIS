# WorkRight HRIS

WorkRight HRIS is a lightweight Human Resources Information System inspired by SAP SuccessFactors. It provides a modular FastAPI backend that covers the core lifecycle of an employee—from recruitment and onboarding through payroll, rostering, travel management, organisational structure, workflow approvals, and document generation.

## Features

- **Recruitment** – Manage job requisitions and track candidates through each requisition.
- **Onboarding** – Assign onboarding tasks to new hires and monitor progress.
- **Employee Profiles** – Maintain rich employee records including departmental placement and reporting lines.
- **Org Structure** – Generate an organisation tree derived from manager relationships.
- **Payroll** – Run payroll cycles, record payslips, and finalise payroll runs.
- **Rostering** – Schedule employee shifts with validation on time windows.
- **Accommodation & Flights** – Track travel logistics for employees on assignment.
- **Workflow** – Capture employee change requests (such as promotions or transfers) and support approvals.
- **Document Generation** – Create reusable templates and generate personalised documents with employee data.

## Project Structure

```
app/
├── database.py         # Database configuration and session dependency
├── main.py             # FastAPI application factory and router registration
├── models.py           # SQLModel ORM models
├── routers/            # Feature-specific routers (employees, recruitment, payroll, etc.)
└── utils.py            # Helper utilities (e.g. document templating)

tests/
└── test_human_resources.py  # End-to-end coverage of key workflows
```

## Getting Started

### 1. Install dependencies

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Run the API locally

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`. Interactive documentation is exposed via the automatically generated Swagger UI at `/docs` and ReDoc at `/redoc`.

### 3. Execute the automated tests

```bash
pytest
```

### 4. Environment configuration

By default the application stores data in `hris.db` using SQLite. Set the `HRIS_DATABASE_URL` environment variable to point to another supported SQLAlchemy database engine if required.


## Document Templates

Document templates support double-brace placeholders such as `{{full_name}}`, `{{department}}`, or `{{position}}`. Generated documents resolve placeholders against the employee context and optional ad-hoc values supplied in the request body.

## API Overview

Each functional domain exposes a dedicated router under `app/routers`. For example:

- `POST /recruitment/jobs` – Create a job requisition
- `POST /onboarding/tasks` – Assign an onboarding task to an employee
- `POST /payroll/entries` – Record a payroll entry for an employee within a payroll run
- `GET /employees/{id}/profile` – Retrieve a consolidated employee profile including tasks, shifts, travel, payroll history, and workflow requests
- `POST /documents/generate` – Generate a personalised document from a template

Refer to the Swagger UI for the full API surface and schema definitions.

## Testing Philosophy

The included end-to-end test ensures the major employee lifecycle features work together. It exercises recruitment, onboarding, payroll, rostering, travel, workflow approval, document generation, and profile aggregation in a single scenario.

## License

This project is provided as-is for demonstration purposes.
