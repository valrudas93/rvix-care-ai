# VARIME
 
Herramienta de apoyo al diagnóstico del cáncer de cuello uterino mediante inteligencia artificial profunda. Integra dos modelos Vision Transformer entrenados sobre datasets clínicos reales con generación de informes asistida por Claude AI.
 
Proyecto de tesis de grado — Ingeniería de Sistemas, Universidad de San Buenaventura, Cali.
 
---
 
## Estructura del monorepo
 
```
rvix-care-ai/
├── backend/          # API REST — FastAPI + Python 3.11
├── frontend/         # Interfaz web — React + Vite + TypeScript
├── docs/             # Documentación técnica adicional
├── docker-compose.yml
├── .env.example      # Plantilla de variables de entorno
├── dev.ps1           # Script de desarrollo (Windows)
└── dev.sh            # Script de desarrollo (macOS/Linux)
```
 
---
 
## Requisitos
 
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) >= 24
- Docker Compose >= 2.20
 
---
 
## Inicio rápido
 
### 1. Clonar y configurar variables de entorno
 
```bash
git clone <URL_DEL_REPO>
cd rvix-care-ai
 
cp .env.example .env
# Editar .env con tus valores reales (mínimo ANTHROPIC_API_KEY)
```
 
### 2. Desplegar
 
```bash
docker compose up --build -d
```
 
| Servicio      | URL                        |
|---------------|----------------------------|
| Frontend      | http://localhost:8080      |
| Backend API   | http://localhost:8000      |
| Swagger / Docs | http://localhost:8000/docs |
 
### 3. Detener
 
```bash
docker compose down
```
 
---
 
## Flujo de uso
 
```
Registro / Login
      ↓
Datos clínicos del paciente
      ↓
Carga de imágenes (citología + resonancia)
      ↓
POST /api/analyze
      ↓
Polling /api/status/{jobId}
      ↓
Resultados: clasificación ViT + explicación Claude AI
      ↓
Descarga PDF  |  Enviar informe al médico tratante
```
 
---
 
## Modelos de IA
 
| Modelo | Dataset | Clases | Tarea |
|--------|---------|--------|-------|
| ViT SIPaKMeD | [SIPaKMeD](https://www.cs.uoi.gr/~marina/sipakmed.html) | Normal / Anormal | Clasificación citológica |
| ViT TCIA | [CC-Tumor-Heterogeneity](https://wiki.cancerimagingarchive.net/display/Public/Cervical-Cancer-Tumor-Heterogeneity-2020) | Bajo / Medio / Alto riesgo | Heterogeneidad tumoral por resonancia |
 
Los archivos `.keras` están incluidos en el repositorio bajo `backend/app/ai_models/vision_models/`. Sin ellos el sistema opera en modo simulado (mock).
 
---
 
## Tecnologías
 
**Backend:** FastAPI · SQLAlchemy · Alembic · TensorFlow/Keras · Anthropic Claude API
 
**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · React Router
 
**Infraestructura:** Docker Compose
 
---
 
## Variables de entorno
 
Ver [`.env.example`](.env.example) para la lista completa.
 
La única variable obligatoria para que el sistema funcione con Claude AI es `ANTHROPIC_API_KEY`. Sin ella el módulo LLM cae a la implementación mock.
 
---
 
## Documentación adicional
 
- [`docs/INTEGRATION_GUIDE.md`](docs/INTEGRATION_GUIDE.md) — integración de modelos y proveedores LLM
- [`docs/QUICK_START.md`](docs/QUICK_START.md) — arranque sin Docker
- [`backend/README.md`](backend/README.md) — documentación técnica del backend