from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    especialidad: Mapped[str] = mapped_column(String(120))
    hospital: Mapped[str] = mapped_column(String(200))
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # relationships
    patients = relationship("Patient", back_populates="doctor", cascade="all, delete-orphan")
    studies = relationship("ImageStudy", back_populates="doctor")
