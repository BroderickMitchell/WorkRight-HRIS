from typing import Dict

from fastapi import FastAPI

from .database import init_db
from .routers import (
    departments,
    documents,
    employees,
    onboarding,
    payroll,
    recruitment,
    rostering,
    travel,
    workflow,
)


def create_app() -> FastAPI:
    app = FastAPI(title="WorkRight HRIS", version="1.0.0")

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()

    app.include_router(departments.router)
    app.include_router(employees.router)
    app.include_router(recruitment.router)
    app.include_router(onboarding.router)
    app.include_router(payroll.router)
    app.include_router(rostering.router)
    app.include_router(travel.router)
    app.include_router(workflow.router)
    app.include_router(documents.router)

    @app.get("/")
    def read_root() -> Dict[str, str]:
        return {"message": "WorkRight HRIS API"}

    return app


app = create_app()
