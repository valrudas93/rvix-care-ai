from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(120))
    edad: Mapped[int] = mapped_column(Integer)
    identificacion: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    fecha_registro: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"))

    # clinical extras (from frontend ClinicalData form)
    antecedentes: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    resultados_previos: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    tipo_muestra: Mapped[str | None] = mapped_column(String(60), nullable=True)

    # relationships
    doctor = relationship("Doctor", back_populates="patients")
    studies = relationship("ImageStudy", back_populates="patient", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="patient")
