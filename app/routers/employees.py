from datetime import date
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..database import get_session
from ..models import (
    AccommodationBooking,
    Department,
    Employee,
    EmployeeChangeRequest,
    FlightBooking,
    OnboardingTask,
    PayrollEntry,
    ScheduleShift,
)
from ..utils import employee_context


class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    hire_date: Optional[date] = None
    department_id: Optional[int] = None
    position: Optional[str] = None
    manager_id: Optional[int] = None
    status: Optional[str] = "Active"
    location: Optional[str] = None
    employment_type: Optional[str] = "Full-time"


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    hire_date: Optional[date] = None
    department_id: Optional[int] = None
    position: Optional[str] = None
    manager_id: Optional[int] = None
    status: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None


router = APIRouter(prefix="/employees", tags=["employees"])


def _build_org_node(employee: Employee, session: Session) -> Dict[str, Any]:
    reports = session.exec(select(Employee).where(Employee.manager_id == employee.id)).all()
    return {
        "id": employee.id,
        "name": f"{employee.first_name} {employee.last_name}",
        "position": employee.position,
        "department_id": employee.department_id,
        "reports": [_build_org_node(report, session) for report in reports],
    }


@router.get("/", response_model=List[Employee])
def list_employees(session: Session = Depends(get_session)) -> List[Employee]:
    return session.exec(select(Employee)).all()


@router.post("/", response_model=Employee, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate, session: Session = Depends(get_session)) -> Employee:
    employee = Employee(**payload.dict(exclude_none=True))
    session.add(employee)
    session.commit()
    session.refresh(employee)
    return employee


@router.get("/{employee_id}", response_model=Employee)
def get_employee(employee_id: int, session: Session = Depends(get_session)) -> Employee:
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.put("/{employee_id}", response_model=Employee)
def update_employee(employee_id: int, payload: EmployeeUpdate, session: Session = Depends(get_session)) -> Employee:
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    for key, value in payload.dict(exclude_none=True).items():
        setattr(employee, key, value)

    session.add(employee)
    session.commit()
    session.refresh(employee)
    return employee


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, session: Session = Depends(get_session)) -> None:
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    session.delete(employee)
    session.commit()


@router.get("/{employee_id}/profile")
def employee_profile(employee_id: int, session: Session = Depends(get_session)) -> Dict[str, Any]:
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    manager = session.get(Employee, employee.manager_id) if employee.manager_id else None
    department = session.get(Department, employee.department_id) if employee.department_id else None
    direct_reports = session.exec(select(Employee).where(Employee.manager_id == employee.id)).all()
    tasks = session.exec(select(OnboardingTask).where(OnboardingTask.employee_id == employee.id)).all()
    shifts = session.exec(select(ScheduleShift).where(ScheduleShift.employee_id == employee.id)).all()
    accommodations = session.exec(
        select(AccommodationBooking).where(AccommodationBooking.employee_id == employee.id)
    ).all()
    flights = session.exec(select(FlightBooking).where(FlightBooking.employee_id == employee.id)).all()
    change_requests = session.exec(
        select(EmployeeChangeRequest).where(EmployeeChangeRequest.employee_id == employee.id)
    ).all()
    payroll_entries = session.exec(select(PayrollEntry).where(PayrollEntry.employee_id == employee.id)).all()

    return {
        "employee": employee,
        "manager": manager,
        "department": department,
        "direct_reports": direct_reports,
        "onboarding_tasks": tasks,
        "scheduled_shifts": shifts,
        "accommodation_bookings": accommodations,
        "flight_bookings": flights,
        "change_requests": change_requests,
        "payroll_history": payroll_entries,
    }


@router.get("/org/structure")
def org_structure(session: Session = Depends(get_session)) -> List[Dict[str, Any]]:
    roots = session.exec(select(Employee).where(Employee.manager_id.is_(None))).all()
    return [_build_org_node(employee, session) for employee in roots]


@router.get("/{employee_id}/document-context")
def employee_document_context(employee_id: int, session: Session = Depends(get_session)) -> Dict[str, str]:
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee_context(employee, session)
