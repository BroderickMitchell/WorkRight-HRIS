from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..database import get_session
from ..models import Department


class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    cost_center: Optional[str] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cost_center: Optional[str] = None


router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("/", response_model=List[Department])
def list_departments(session: Session = Depends(get_session)) -> List[Department]:
    return session.exec(select(Department)).all()


@router.post("/", response_model=Department, status_code=status.HTTP_201_CREATED)
def create_department(payload: DepartmentCreate, session: Session = Depends(get_session)) -> Department:
    department = Department(**payload.dict(exclude_none=True))
    session.add(department)
    session.commit()
    session.refresh(department)
    return department


@router.get("/{department_id}", response_model=Department)
def get_department(department_id: int, session: Session = Depends(get_session)) -> Department:
    department = session.get(Department, department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.put("/{department_id}", response_model=Department)
def update_department(department_id: int, payload: DepartmentUpdate, session: Session = Depends(get_session)) -> Department:
    department = session.get(Department, department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    for key, value in payload.dict(exclude_none=True).items():
        setattr(department, key, value)
    session.add(department)
    session.commit()
    session.refresh(department)
    return department


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(department_id: int, session: Session = Depends(get_session)) -> None:
    department = session.get(Department, department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    session.delete(department)
    session.commit()
