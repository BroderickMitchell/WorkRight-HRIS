from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..database import get_session
from ..models import DocumentTemplate, Employee, GeneratedDocument
from ..utils import employee_context, render_document


class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    content: str


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None


class DocumentGenerate(BaseModel):
    employee_id: int
    template_id: int
    filename: str
    extra_context: Optional[Dict[str, str]] = None


router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/templates", response_model=List[DocumentTemplate])
def list_templates(session: Session = Depends(get_session)) -> List[DocumentTemplate]:
    return session.exec(select(DocumentTemplate)).all()


@router.post("/templates", response_model=DocumentTemplate, status_code=status.HTTP_201_CREATED)
def create_template(payload: TemplateCreate, session: Session = Depends(get_session)) -> DocumentTemplate:
    template = DocumentTemplate(**payload.dict(exclude_none=True))
    session.add(template)
    session.commit()
    session.refresh(template)
    return template


@router.put("/templates/{template_id}", response_model=DocumentTemplate)
def update_template(
    template_id: int, payload: TemplateUpdate, session: Session = Depends(get_session)
) -> DocumentTemplate:
    template = session.get(DocumentTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    for key, value in payload.dict(exclude_none=True).items():
        setattr(template, key, value)
    session.add(template)
    session.commit()
    session.refresh(template)
    return template


@router.post("/generate", response_model=GeneratedDocument, status_code=status.HTTP_201_CREATED)
def generate_document(payload: DocumentGenerate, session: Session = Depends(get_session)) -> GeneratedDocument:
    employee = session.get(Employee, payload.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    template = session.get(DocumentTemplate, payload.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    context = employee_context(employee, session)
    if payload.extra_context:
        context.update(payload.extra_context)
    content = render_document(template.content, context)
    document = GeneratedDocument(
        employee_id=employee.id,
        template_id=template.id,
        filename=payload.filename,
        content=content,
    )
    session.add(document)
    session.commit()
    session.refresh(document)
    return document


@router.get("/generated", response_model=List[GeneratedDocument])
def list_generated(session: Session = Depends(get_session)) -> List[GeneratedDocument]:
    return session.exec(select(GeneratedDocument)).all()
