from datetime import datetime
from sqlalchemy import String, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    study_id: Mapped[int] = mapped_column(ForeignKey("image_studies.id"))
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"))

    # ViT result
    prediction: Mapped[str] = mapped_column(String(60))      # bajo | medio | alto_riesgo
    confidence: Mapped[float] = mapped_column(Float)
    detected_regions: Mapped[list | None] = mapped_column(JSON, nullable=True)
    recommendations: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # LLM explanation (populated when /llm/explain-prediction is called)
    medical_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)

    fecha_prediccion: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # relationships
    study = relationship("ImageStudy", back_populates="predictions")
    patient = relationship("Patient", back_populates="predictions")
