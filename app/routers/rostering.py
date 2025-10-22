from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..database import get_session
from ..models import Employee, ScheduleShift


class ShiftCreate(BaseModel):
    employee_id: int
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    role: Optional[str] = None


class ShiftUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    role: Optional[str] = None


router = APIRouter(prefix="/rostering", tags=["rostering"])


@router.get("/shifts", response_model=List[ScheduleShift])
def list_shifts(session: Session = Depends(get_session)) -> List[ScheduleShift]:
    return session.exec(select(ScheduleShift)).all()


@router.get("/employees/{employee_id}", response_model=List[ScheduleShift])
def list_employee_shifts(employee_id: int, session: Session = Depends(get_session)) -> List[ScheduleShift]:
    return session.exec(select(ScheduleShift).where(ScheduleShift.employee_id == employee_id)).all()


@router.post("/shifts", response_model=ScheduleShift, status_code=status.HTTP_201_CREATED)
def create_shift(payload: ShiftCreate, session: Session = Depends(get_session)) -> ScheduleShift:
    employee = session.get(Employee, payload.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if payload.end_time <= payload.start_time:
        raise HTTPException(status_code=400, detail="End time must be after start time")
    shift = ScheduleShift(**payload.dict())
    session.add(shift)
    session.commit()
    session.refresh(shift)
    return shift


@router.put("/shifts/{shift_id}", response_model=ScheduleShift)
def update_shift(shift_id: int, payload: ShiftUpdate, session: Session = Depends(get_session)) -> ScheduleShift:
    shift = session.get(ScheduleShift, shift_id)
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    updates = payload.dict(exclude_none=True)
    if "start_time" in updates or "end_time" in updates:
        start = updates.get("start_time", shift.start_time)
        end = updates.get("end_time", shift.end_time)
        if end <= start:
            raise HTTPException(status_code=400, detail="End time must be after start time")
    for key, value in updates.items():
        setattr(shift, key, value)
    session.add(shift)
    session.commit()
    session.refresh(shift)
    return shift


@router.delete("/shifts/{shift_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shift(shift_id: int, session: Session = Depends(get_session)) -> None:
    shift = session.get(ScheduleShift, shift_id)
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    session.delete(shift)
    session.commit()
