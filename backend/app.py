from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from threading import Thread
import time
import shutil
import tempfile
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JOBS: dict = {}

def background_process(job_id: str, files_info: dict):
    total_steps = 4
    step_durations = [2.0, 3.0, 3.0, 2.0]
    JOBS[job_id]["status"] = "processing"
    JOBS[job_id]["progress"] = 0
    elapsed = 0.0
    total_time = sum(step_durations)
    for idx, dur in enumerate(step_durations):
        step_name = [
            "Preprocesamiento de imágenes",
            "Modelo 1: Detección de lesiones tempranas",
            "Modelo 2: Análisis de heterogeneidad tumoral",
            "Generación de informe",
        ][idx]
        JOBS[job_id]["current_step"] = {"index": idx, "name": step_name}
        t = 0.0
        while t < dur:
            time.sleep(0.2)
            t += 0.2
            elapsed += 0.2
            JOBS[job_id]["progress"] = min(100, int((elapsed / total_time) * 100))
        time.sleep(0.15)

    result = {
        "riskLevel": "medio",
        "confidence": 87.5,
        "detectedRegions": ["Zona de transformación", "Células escamosas atípicas"],
        "recommendations": [
            "Realizar seguimiento en 3 meses",
            "Considerar colposcopía para evaluación detallada",
            "Mantener vigilancia regular",
        ],
        "model1": {
            "name": "Detección de Lesiones Tempranas",
            "status": "completado",
            "findings": "Células escamosas atípicas de significado indeterminado (ASC-US) detectadas",
        },
        "model2": {
            "name": "Análisis de Heterogeneidad Tumoral",
            "status": "completado",
            "findings": "Patrón de distribución celular irregular en zona de transformación",
        },
    }

    JOBS[job_id]["status"] = "completed"
    JOBS[job_id]["progress"] = 100
    JOBS[job_id]["result"] = result


@app.post("/api/analyze")
async def analyze(citology: list[UploadFile] | None = File(None), mri: list[UploadFile] | None = File(None)):
    tmpdir = tempfile.mkdtemp(prefix="cerviai_")
    files_info = {"citology": [], "mri": []}
    try:
        if citology:
            for f in citology:
                path = os.path.join(tmpdir, f.filename)
                with open(path, "wb") as out:
                    shutil.copyfileobj(f.file, out)
                files_info["citology"].append(path)
        if mri:
            for f in mri:
                path = os.path.join(tmpdir, f.filename)
                with open(path, "wb") as out:
                    shutil.copyfileobj(f.file, out)
                files_info["mri"].append(path)
    except Exception:
        raise HTTPException(status_code=500, detail="Error saving files")

    job_id = str(uuid4())
    JOBS[job_id] = {
        "status": "queued",
        "progress": 0,
        "result": None,
        "current_step": None,
    }

    thread = Thread(target=background_process, args=(job_id, files_info), daemon=True)
    thread.start()

    return {"jobId": job_id}


@app.get("/api/status/{job_id}")
async def status(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "jobId": job_id,
        "status": job["status"],
        "progress": job["progress"],
        "current_step": job.get("current_step"),
    }


@app.get("/api/results/{job_id}")
async def results(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != "completed":
        return {"status": job["status"], "progress": job["progress"]}
    return {"status": "completed", "result": job["result"]}
