from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config.settings import settings

# ── Routes ────────────────────────────────────────────────────────────────────
from app.routes import (
    auth_routes,
    patient_routes,
    study_routes,
    prediction_routes,
    llm_routes,
    analysis_routes,
)

# ── Ensure upload directory exists ───────────────────────────────────────────
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

# ── Application ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="VARIME – Backend",
    description="API para el sistema VARIME de apoyo al diagnóstico del cáncer de cuello uterino mediante IA.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files (serve uploaded images) ─────────────────────────────────────
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ── Register routers ──────────────────────────────────────────────────────────
app.include_router(auth_routes.router)
app.include_router(patient_routes.router)
app.include_router(study_routes.router)
app.include_router(prediction_routes.router)
app.include_router(llm_routes.router)
app.include_router(analysis_routes.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "app": "VARIME Backend", "version": "1.0.0"}
