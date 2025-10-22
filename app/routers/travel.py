from datetime import date, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..database import get_session
from ..models import AccommodationBooking, Employee, FlightBooking


class AccommodationCreate(BaseModel):
    employee_id: int
    property_name: str
    check_in: date
    check_out: date
    reference: Optional[str] = None
    notes: Optional[str] = None


class AccommodationUpdate(BaseModel):
    property_name: Optional[str] = None
    check_in: Optional[date] = None
    check_out: Optional[date] = None
    reference: Optional[str] = None
    notes: Optional[str] = None


class FlightCreate(BaseModel):
    employee_id: int
    departure_airport: str
    arrival_airport: str
    departure_time: datetime
    arrival_time: datetime
    airline: Optional[str] = None
    confirmation_number: Optional[str] = None


class FlightUpdate(BaseModel):
    departure_airport: Optional[str] = None
    arrival_airport: Optional[str] = None
    departure_time: Optional[datetime] = None
    arrival_time: Optional[datetime] = None
    airline: Optional[str] = None
    confirmation_number: Optional[str] = None


router = APIRouter(prefix="/travel", tags=["travel"])


@router.get("/accommodations", response_model=List[AccommodationBooking])
def list_accommodations(session: Session = Depends(get_session)) -> List[AccommodationBooking]:
    return session.exec(select(AccommodationBooking)).all()


@router.post("/accommodations", response_model=AccommodationBooking, status_code=status.HTTP_201_CREATED)
def create_accommodation(
    payload: AccommodationCreate, session: Session = Depends(get_session)
) -> AccommodationBooking:
    employee = session.get(Employee, payload.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if payload.check_out <= payload.check_in:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")
    booking = AccommodationBooking(**payload.dict())
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking


@router.put("/accommodations/{booking_id}", response_model=AccommodationBooking)
def update_accommodation(
    booking_id: int, payload: AccommodationUpdate, session: Session = Depends(get_session)
) -> AccommodationBooking:
    booking = session.get(AccommodationBooking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Accommodation booking not found")
    updates = payload.dict(exclude_none=True)
    if "check_in" in updates or "check_out" in updates:
        check_in = updates.get("check_in", booking.check_in)
        check_out = updates.get("check_out", booking.check_out)
        if check_out <= check_in:
            raise HTTPException(status_code=400, detail="Check-out must be after check-in")
    for key, value in updates.items():
        setattr(booking, key, value)
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking


@router.delete("/accommodations/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_accommodation(booking_id: int, session: Session = Depends(get_session)) -> None:
    booking = session.get(AccommodationBooking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Accommodation booking not found")
    session.delete(booking)
    session.commit()


@router.get("/flights", response_model=List[FlightBooking])
def list_flights(session: Session = Depends(get_session)) -> List[FlightBooking]:
    return session.exec(select(FlightBooking)).all()


@router.post("/flights", response_model=FlightBooking, status_code=status.HTTP_201_CREATED)
def create_flight(payload: FlightCreate, session: Session = Depends(get_session)) -> FlightBooking:
    employee = session.get(Employee, payload.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if payload.arrival_time <= payload.departure_time:
        raise HTTPException(status_code=400, detail="Arrival must be after departure")
    booking = FlightBooking(**payload.dict())
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking


@router.put("/flights/{flight_id}", response_model=FlightBooking)
def update_flight(flight_id: int, payload: FlightUpdate, session: Session = Depends(get_session)) -> FlightBooking:
    booking = session.get(FlightBooking, flight_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Flight booking not found")
    updates = payload.dict(exclude_none=True)
    if "departure_time" in updates or "arrival_time" in updates:
        departure = updates.get("departure_time", booking.departure_time)
        arrival = updates.get("arrival_time", booking.arrival_time)
        if arrival <= departure:
            raise HTTPException(status_code=400, detail="Arrival must be after departure")
    for key, value in updates.items():
        setattr(booking, key, value)
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking


@router.delete("/flights/{flight_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_flight(flight_id: int, session: Session = Depends(get_session)) -> None:
    booking = session.get(FlightBooking, flight_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Flight booking not found")
    session.delete(booking)
    session.commit()
