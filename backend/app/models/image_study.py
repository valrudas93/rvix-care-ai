from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class ImageStudy(Base):
    __tablename__ = "image_studies"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"))
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"))
    image_path: Mapped[str] = mapped_column(String(500))
    fecha_estudio: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    tipo_estudio: Mapped[str] = mapped_column(String(60))   # citologia | resonancia | ambas
    notas_medicas: Mapped[str | None] = mapped_column(Text, nullable=True)

    # relationships
    patient = relationship("Patient", back_populates="studies")
    doctor = relationship("Doctor", back_populates="studies")
    predictions = relationship("Prediction", back_populates="study", cascade="all, delete-orphan")
