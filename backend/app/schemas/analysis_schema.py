from typing import Literal
from pydantic import BaseModel


class AnalysisModelSummary(BaseModel):
    name: str
    status: str
    findings: str


class AnalysisResult(BaseModel):
    riskLevel: str
    confidence: float
    detectedRegions: list[str]
    recommendations: list[str]
    model1: AnalysisModelSummary
    model2: AnalysisModelSummary


class AnalyzeResponse(BaseModel):
    jobId: str


class JobStep(BaseModel):
    index: int
    name: str


class JobStatusResponse(BaseModel):
    jobId: str
    status: Literal["queued", "processing", "completed", "error"]
    progress: float
    current_step: JobStep | None = None


class JobResultResponse(BaseModel):
    status: Literal["queued", "processing", "completed", "error"]
    progress: float | None = None
    result: AnalysisResult | None = None


class HistoryItem(BaseModel):
    prediction_id: int
    patient_id: int
    patient_identifier: str
    study_type: str
    risk_level: str
    confidence: float
    date: str
    detected_regions: list[str] = []
    recommendations: list[str] = []
    medical_explanation: str | None = None
