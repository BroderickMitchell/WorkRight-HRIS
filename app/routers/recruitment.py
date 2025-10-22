from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..database import get_session
from ..models import Candidate, JobRequisition


class JobCreate(BaseModel):
    title: str
    department_id: Optional[int] = None
    description: Optional[str] = None
    openings: int = 1


class JobUpdate(BaseModel):
    title: Optional[str] = None
    department_id: Optional[int] = None
    description: Optional[str] = None
    status: Optional[str] = None
    openings: Optional[int] = None


class CandidateCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    notes: Optional[str] = None


class CandidateUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


router = APIRouter(prefix="/recruitment", tags=["recruitment"])


@router.get("/jobs", response_model=List[JobRequisition])
def list_jobs(session: Session = Depends(get_session)) -> List[JobRequisition]:
    return session.exec(select(JobRequisition)).all()


@router.post("/jobs", response_model=JobRequisition, status_code=status.HTTP_201_CREATED)
def create_job(payload: JobCreate, session: Session = Depends(get_session)) -> JobRequisition:
    job = JobRequisition(**payload.dict(exclude_none=True))
    session.add(job)
    session.commit()
    session.refresh(job)
    return job


@router.put("/jobs/{job_id}", response_model=JobRequisition)
def update_job(job_id: int, payload: JobUpdate, session: Session = Depends(get_session)) -> JobRequisition:
    job = session.get(JobRequisition, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    for key, value in payload.dict(exclude_none=True).items():
        setattr(job, key, value)
    session.add(job)
    session.commit()
    session.refresh(job)
    return job


@router.get("/jobs/{job_id}/candidates", response_model=List[Candidate])
def list_candidates(job_id: int, session: Session = Depends(get_session)) -> List[Candidate]:
    job = session.get(JobRequisition, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return session.exec(select(Candidate).where(Candidate.job_id == job_id)).all()


@router.post("/jobs/{job_id}/candidates", response_model=Candidate, status_code=status.HTTP_201_CREATED)
def add_candidate(job_id: int, payload: CandidateCreate, session: Session = Depends(get_session)) -> Candidate:
    job = session.get(JobRequisition, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    candidate = Candidate(job_id=job_id, **payload.dict(exclude_none=True))
    session.add(candidate)
    session.commit()
    session.refresh(candidate)
    return candidate


@router.patch("/candidates/{candidate_id}", response_model=Candidate)
def update_candidate(candidate_id: int, payload: CandidateUpdate, session: Session = Depends(get_session)) -> Candidate:
    candidate = session.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    for key, value in payload.dict(exclude_none=True).items():
        setattr(candidate, key, value)
    session.add(candidate)
    session.commit()
    session.refresh(candidate)
    return candidate
