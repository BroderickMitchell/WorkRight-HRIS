from datetime import date, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from ..database import get_session
from ..models import Employee, PayrollEntry, PayrollRun


class PayrollRunCreate(BaseModel):
    period_start: date
    period_end: date


class PayrollRunUpdate(BaseModel):
    status: Optional[str] = None


class PayrollEntryCreate(BaseModel):
    payroll_run_id: int
    employee_id: int
    gross_pay: float = Field(ge=0)
    tax_withheld: float = Field(ge=0)


router = APIRouter(prefix="/payroll", tags=["payroll"])


@router.get("/runs", response_model=List[PayrollRun])
def list_runs(session: Session = Depends(get_session)) -> List[PayrollRun]:
    return session.exec(select(PayrollRun)).all()


@router.post("/runs", response_model=PayrollRun, status_code=status.HTTP_201_CREATED)
def create_run(payload: PayrollRunCreate, session: Session = Depends(get_session)) -> PayrollRun:
    payroll_run = PayrollRun(**payload.dict(), status="Draft")
    session.add(payroll_run)
    session.commit()
    session.refresh(payroll_run)
    return payroll_run


@router.post("/entries", response_model=PayrollEntry, status_code=status.HTTP_201_CREATED)
def create_entry(payload: PayrollEntryCreate, session: Session = Depends(get_session)) -> PayrollEntry:
    payroll_run = session.get(PayrollRun, payload.payroll_run_id)
    if not payroll_run:
        raise HTTPException(status_code=404, detail="Payroll run not found")
    employee = session.get(Employee, payload.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    net_pay = payload.gross_pay - payload.tax_withheld
    entry = PayrollEntry(net_pay=net_pay, **payload.dict())
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry


@router.get("/runs/{run_id}/entries", response_model=List[PayrollEntry])
def list_entries(run_id: int, session: Session = Depends(get_session)) -> List[PayrollEntry]:
    payroll_run = session.get(PayrollRun, run_id)
    if not payroll_run:
        raise HTTPException(status_code=404, detail="Payroll run not found")
    return session.exec(select(PayrollEntry).where(PayrollEntry.payroll_run_id == run_id)).all()


@router.post("/runs/{run_id}/finalise", response_model=PayrollRun)
def finalise_run(run_id: int, session: Session = Depends(get_session)) -> PayrollRun:
    payroll_run = session.get(PayrollRun, run_id)
    if not payroll_run:
        raise HTTPException(status_code=404, detail="Payroll run not found")
    payroll_run.status = "Finalised"
    payroll_run.processed_at = datetime.utcnow()
    session.add(payroll_run)
    session.commit()
    session.refresh(payroll_run)
    return payroll_run
