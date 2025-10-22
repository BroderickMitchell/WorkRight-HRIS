from datetime import date, datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Department(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    cost_center: Optional[str] = None


class JobRequisition(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    department_id: Optional[int] = Field(default=None, foreign_key="department.id")
    description: Optional[str] = None
    status: str = Field(default="Open")
    openings: int = Field(default=1, ge=1)
    date_opened: date = Field(default_factory=date.today)


class Candidate(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: Optional[int] = Field(default=None, foreign_key="jobrequisition.id")
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    status: str = Field(default="Applied")
    notes: Optional[str] = None


class Employee(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    hire_date: date = Field(default_factory=date.today)
    department_id: Optional[int] = Field(default=None, foreign_key="department.id")
    position: Optional[str] = None
    manager_id: Optional[int] = Field(default=None, foreign_key="employee.id")
    status: str = Field(default="Active")
    location: Optional[str] = None
    employment_type: str = Field(default="Full-time")


class OnboardingTask(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id")
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    completed: bool = Field(default=False)


class PayrollRun(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    period_start: date
    period_end: date
    processed_at: Optional[datetime] = None
    status: str = Field(default="Draft")


class PayrollEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    payroll_run_id: int = Field(foreign_key="payrollrun.id")
    employee_id: int = Field(foreign_key="employee.id")
    gross_pay: float = Field(default=0, ge=0)
    tax_withheld: float = Field(default=0, ge=0)
    net_pay: float = Field(default=0, ge=0)


class ScheduleShift(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id")
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    role: Optional[str] = None


class AccommodationBooking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id")
    check_in: date
    check_out: date
    property_name: str
    reference: Optional[str] = None
    notes: Optional[str] = None


class FlightBooking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id")
    departure_airport: str
    arrival_airport: str
    departure_time: datetime
    arrival_time: datetime
    airline: Optional[str] = None
    confirmation_number: Optional[str] = None


class EmployeeChangeRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id")
    request_type: str
    details: str
    status: str = Field(default="Pending")
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    decided_at: Optional[datetime] = None
    approver_notes: Optional[str] = None


class DocumentTemplate(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    content: str


class GeneratedDocument(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id")
    template_id: int = Field(foreign_key="documenttemplate.id")
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    content: str
    filename: str
