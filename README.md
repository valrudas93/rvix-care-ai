# VARIME

**Herramienta de apoyo al diagnóstico del cáncer de cuello uterino mediante inteligencia artificial**

Sistema de doble modelo Vision Transformer (ViT) para clasificación citológica y análisis de heterogeneidad tumoral, con generación de informes médicos asistida por Claude AI.

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

### 2. Colocar los modelos ViT

```
backend/app/ai_models/vision_models/vit_sipakmed_final.keras
backend/app/ai_models/vision_models/vit_tcia_heterogeneidad_final.keras
```

> Sin los archivos `.keras` el sistema opera en modo simulado (mock).

### 3. Desplegar

```bash
docker compose up --build -d
```

| Servicio     | URL                          |
|--------------|------------------------------|
| Frontend     | http://localhost:8080        |
| Backend API  | http://localhost:8000        |
| Swagger/Docs | http://localhost:8000/docs   |
| PostgreSQL   | localhost:5432               |

### 4. Detener

```bash
docker compose down
```

---

## Flujo de uso

```
Registro / Login  →  Datos clínicos (paciente)  →  Carga de imágenes
       ↓
  POST /api/analyze   (citología + resonancia)
       ↓
  Polling /api/status/{jobId}
       ↓
  Resultados: clasificación ViT + explicación Claude AI
       ↓
  Descarga informe PDF  |  Enviar por correo al médico tratante
```

---

## Modelos de IA

| Modelo | Dataset | Clases | Tarea |
|--------|---------|--------|-------|
| ViT Sipakmed | SIPaKMeD | Normal / Anormal | Clasificación citológica |
| ViT TCIA | TCIA Heterogeneity | Bajo / Medio / Alto riesgo | Heterogeneidad tumoral |

---

## Tecnologías

**Backend:** FastAPI · SQLAlchemy · PostgreSQL · Alembic · TensorFlow/Keras · Anthropic Claude API

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · React Router

**Infraestructura:** Docker Compose · PostgreSQL 16

---

## Variables de entorno

Ver [`.env.example`](.env.example) para la lista completa de variables requeridas.

---

## Documentación adicional

- [`docs/INTEGRATION_GUIDE.md`](docs/INTEGRATION_GUIDE.md) — Guía de integración de modelos y proveedores LLM
- [`docs/QUICK_START.md`](docs/QUICK_START.md) — Arranque rápido sin Docker
- [`backend/README.md`](backend/README.md) — Documentación técnica del backend
