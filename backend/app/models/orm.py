"""
app/models/orm.py – SQLAlchemy ORM models
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    """Clinician / admin account."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(200), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now
    )

    patients: Mapped[list["Patient"]] = relationship(back_populates="owner")


class Patient(Base):
    """Patient record – each patient belongs to one clinician."""

    __tablename__ = "patients"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now
    )

    owner_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    owner: Mapped["User"] = relationship(back_populates="patients")
    visits: Mapped[list["Visit"]] = relationship(
        back_populates="patient", order_by="Visit.month"
    )


class Visit(Base):
    """Single clinical visit with liver-function markers."""

    __tablename__ = "visits"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    patient_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("patients.id"), nullable=False
    )
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    ast: Mapped[float] = mapped_column(Float, nullable=False)   # U/L
    alt: Mapped[float] = mapped_column(Float, nullable=False)   # U/L
    platelets: Mapped[float] = mapped_column(Float, nullable=False)  # 10⁹/L
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now
    )

    patient: Mapped["Patient"] = relationship(back_populates="visits")
