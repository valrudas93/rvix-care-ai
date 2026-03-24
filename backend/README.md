# Backend FastAPI (CerviAI demo)

1. Crear y activar un virtualenv:
   python -m venv .venv
   .venv\Scripts\activate

2. Instalar deps:
   pip install -r requirements.txt

3. Ejecutar:
   uvicorn app:app --reload --host 0.0.0.0 --port 8000

Endpoints:
- POST /api/analyze       -> acepta archivos (campos 'citology' y 'mri'), devuelve { jobId }
- GET  /api/status/{id}  -> devuelve status/progress
- GET  /api/results/{id} -> devuelve resultado final cuando esté listo
