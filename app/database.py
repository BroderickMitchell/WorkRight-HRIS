import os
from typing import Generator

from sqlmodel import Session, SQLModel, create_engine


DATABASE_URL = os.getenv("HRIS_DATABASE_URL", "sqlite:///./hris.db")
CONNECT_ARGS = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=False, connect_args=CONNECT_ARGS)


def init_db() -> None:
    """Create database tables if they do not already exist."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session."""
    with Session(engine) as session:
        yield session
