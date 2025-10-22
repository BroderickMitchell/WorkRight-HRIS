from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..database import get_session
from ..models import Employee, OnboardingTask


class TaskCreate(BaseModel):
    employee_id: int
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    completed: Optional[bool] = None


router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.get("/tasks", response_model=List[OnboardingTask])
def list_tasks(session: Session = Depends(get_session)) -> List[OnboardingTask]:
    return session.exec(select(OnboardingTask)).all()


@router.get("/employees/{employee_id}", response_model=List[OnboardingTask])
def list_employee_tasks(employee_id: int, session: Session = Depends(get_session)) -> List[OnboardingTask]:
    return session.exec(select(OnboardingTask).where(OnboardingTask.employee_id == employee_id)).all()


@router.post("/tasks", response_model=OnboardingTask, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, session: Session = Depends(get_session)) -> OnboardingTask:
    employee = session.get(Employee, payload.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    task = OnboardingTask(**payload.dict())
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.put("/tasks/{task_id}", response_model=OnboardingTask)
def update_task(task_id: int, payload: TaskUpdate, session: Session = Depends(get_session)) -> OnboardingTask:
    task = session.get(OnboardingTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in payload.dict(exclude_none=True).items():
        setattr(task, key, value)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.post("/tasks/{task_id}/complete", response_model=OnboardingTask)
def complete_task(task_id: int, session: Session = Depends(get_session)) -> OnboardingTask:
    task = session.get(OnboardingTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.completed = True
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, session: Session = Depends(get_session)) -> None:
    task = session.get(OnboardingTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(task)
    session.commit()
