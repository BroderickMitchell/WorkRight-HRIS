from typing import Any, Dict

from sqlmodel import Session, select

from .models import Department, Employee


def employee_context(employee: Employee, session: Session) -> Dict[str, Any]:
    """Return a dictionary with employee information for templating."""
    manager = None
    if employee.manager_id:
        manager = session.exec(select(Employee).where(Employee.id == employee.manager_id)).first()

    department = None
    if employee.department_id:
        department = session.exec(select(Department).where(Department.id == employee.department_id)).first()

    return {
        "first_name": employee.first_name,
        "last_name": employee.last_name,
        "full_name": f"{employee.first_name} {employee.last_name}",
        "email": employee.email,
        "position": employee.position,
        "employment_type": employee.employment_type,
        "department": department.name if department else None,
        "manager": f"{manager.first_name} {manager.last_name}" if manager else None,
        "status": employee.status,
        "location": employee.location,
    }


def render_document(template: str, context: Dict[str, Any]) -> str:
    """Render a template string by replacing {{placeholders}} with values."""
    output = template
    for key, value in context.items():
        placeholder = "{{" + key + "}}"
        output = output.replace(placeholder, str(value) if value is not None else "")
    return output
