from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..database import get_session
from ..models import Employee, EmployeeChangeRequest


class ChangeRequestCreate(BaseModel):
    employee_id: int
    request_type: str
    details: str


class ChangeRequestUpdate(BaseModel):
    status: Optional[str] = None
    approver_notes: Optional[str] = None


router = APIRouter(prefix="/workflow", tags=["workflow"])


@router.get("/requests", response_model=List[EmployeeChangeRequest])
def list_requests(session: Session = Depends(get_session)) -> List[EmployeeChangeRequest]:
    return session.exec(select(EmployeeChangeRequest)).all()


@router.get("/employees/{employee_id}", response_model=List[EmployeeChangeRequest])
def list_employee_requests(employee_id: int, session: Session = Depends(get_session)) -> List[EmployeeChangeRequest]:
    return session.exec(select(EmployeeChangeRequest).where(EmployeeChangeRequest.employee_id == employee_id)).all()


@router.post("/requests", response_model=EmployeeChangeRequest, status_code=status.HTTP_201_CREATED)
def create_request(payload: ChangeRequestCreate, session: Session = Depends(get_session)) -> EmployeeChangeRequest:
    employee = session.get(Employee, payload.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    request = EmployeeChangeRequest(**payload.dict())
    session.add(request)
    session.commit()
    session.refresh(request)
    return request


@router.post("/requests/{request_id}/decision", response_model=EmployeeChangeRequest)
def decide_request(
    request_id: int, payload: ChangeRequestUpdate, session: Session = Depends(get_session)
) -> EmployeeChangeRequest:
    request = session.get(EmployeeChangeRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Change request not found")
    updates = payload.dict(exclude_none=True)
    if "status" in updates:
        request.status = updates["status"]
        request.decided_at = datetime.utcnow()
    if "approver_notes" in updates:
        request.approver_notes = updates["approver_notes"]
    session.add(request)
    session.commit()
    session.refresh(request)
    return request
