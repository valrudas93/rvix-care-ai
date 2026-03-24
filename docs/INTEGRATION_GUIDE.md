# Guía de Integración — VARIME

## Arquitectura

```
┌──────────────────────────────────┐
│   Frontend  (React + Vite)       │
│   Puerto 8080                    │
└───────────────┬──────────────────┘
                │ REST / JSON  (JWT Bearer)
┌───────────────▼──────────────────┐
│   Backend  (FastAPI + Python)    │
│   Puerto 8000  — /docs Swagger   │
└───┬───────────────────┬──────────┘
    │ SQLAlchemy ORM    │ Anthropic API (HTTPS)
┌───▼────────────┐  ┌───▼────────────┐
│  PostgreSQL 16 │  │  Claude AI      │
│  Puerto 5432   │  │  claude-opus-4-6│
└────────────────┘  └────────────────┘
```

Todo corre en Docker Compose con tres contenedores: `varime-db`, `varime-backend`, `varime-frontend`.

---

## Variables de entorno

### Raíz del proyecto (docker-compose)

Crear `.env` a partir de `.env.example`:

```bash
cp .env.example .env
# Editar .env con los valores reales
```

Variables mínimas requeridas:

| Variable | Descripción |
|---|---|
| `ANTHROPIC_API_KEY` | Clave API de Anthropic |
| `SECRET_KEY` | Clave secreta JWT (cambiar en producción) |
| `DATABASE_URL` | URL de PostgreSQL |

### Frontend

El frontend lee `VITE_API_URL` en build-time. En desarrollo con Docker no es necesario — el contenedor lo recibe via `docker-compose.yml`.

---

## Endpoints principales

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/register` | Registrar médico | No |
| POST | `/auth/login` | Login → JWT | No |
| GET | `/patients` | Listar pacientes | Sí |
| POST | `/patients` | Crear paciente | Sí |
| GET | `/patients/{id}` | Obtener paciente | Sí |
| PATCH | `/patients/{id}` | Actualizar paciente | Sí |
| POST | `/studies/upload-image` | Subir imagen | Sí |
| POST | `/api/analyze` | Crear job de análisis | Sí |
| GET | `/api/status/{job_id}` | Estado del job | Sí |
| GET | `/api/results/{job_id}` | Resultados del job | Sí |
| GET | `/api/history` | Historial del médico | Sí |
| POST | `/llm/explain-prediction` | Explicación Claude AI | Sí |

Documentación interactiva completa: `http://localhost:8000/docs`

---

## Flujo de análisis

```
POST /api/analyze  (multipart: citology + mri + patient_id?)
  └─→ { jobId: "uuid" }

  Poll: GET /api/status/{jobId}
  └─→ { status: "queued|processing|completed|error", progress: 0-100 }

GET /api/results/{jobId}
  └─→ { status, result: { riskLevel, confidence, detectedRegions,
                           recommendations, model1, model2 } }

POST /llm/explain-prediction
  └─→ { medical_explanation: "markdown..." }
```

---

## Autenticación

Todas las rutas protegidas requieren header:

```
Authorization: Bearer <access_token>
```

El token se obtiene en `/auth/login` y se guarda en `localStorage` con clave `authToken`.

---

## Modelos ViT

Colocar los archivos `.keras` en:

```
backend/app/ai_models/vision_models/vit_sipakmed_final.keras
backend/app/ai_models/vision_models/vit_tcia_heterogeneidad_final.keras
```

Sin los archivos, el sistema devuelve predicciones simuladas (mock) para desarrollo.

Los modelos se cargan en memoria al iniciar el servidor (`vit_loader.py`) — no hay overhead por inferencia.

---

## LLM — Claude AI

Configurado via `LLM_PROVIDER=anthropic` y `ANTHROPIC_API_KEY` en `.env`.

Cambiar de proveedor editando `.env`:

```env
LLM_PROVIDER=mock      # desarrollo sin llamadas externas
LLM_PROVIDER=anthropic # Claude AI (producción)
LLM_PROVIDER=openai    # GPT-4o
```

---

## Base de datos

Migraciones con Alembic:

```bash
# Aplicar schema inicial
docker exec varime-backend alembic upgrade head

# Crear nueva migración tras cambios en modelos
docker exec varime-backend alembic revision --autogenerate -m "descripcion"
```

---

## CORS

Orígenes permitidos (configurado en `ALLOWED_ORIGINS`):

```
http://localhost:5173
http://localhost:3000
http://localhost:8080
```

Para producción, actualizar esta variable con el dominio real.

---

## Construcción para producción

```bash
# Levantar con rebuild completo
docker compose up --build -d

# Ver logs
docker compose logs -f backend

# Detener
docker compose down
```
