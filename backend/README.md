# VARIME – Backend (FastAPI)

Backend modular para el sistema de diagnóstico de cáncer cervical basado en IA.

---

## Estructura del proyecto

```
backend/
├── app/
│   ├── main.py                          # Aplicación FastAPI, CORS, rutas
│   ├── config/
│   │   ├── settings.py                  # Variables de entorno (Pydantic Settings)
│   │   └── security.py                  # JWT + bcrypt helpers
│   ├── database/
│   │   ├── connection.py                # Motor SQLAlchemy + get_db()
│   │   └── base.py                      # DeclarativeBase
│   ├── models/
│   │   ├── doctor.py                    # ORM: Doctor
│   │   ├── patient.py                   # ORM: Patient
│   │   ├── image_study.py               # ORM: ImageStudy
│   │   └── prediction.py                # ORM: Prediction
│   ├── schemas/
│   │   ├── auth_schema.py
│   │   ├── doctor_schema.py
│   │   ├── patient_schema.py
│   │   ├── study_schema.py
│   │   └── prediction_schema.py
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── patient_routes.py
│   │   ├── study_routes.py
│   │   ├── prediction_routes.py
│   │   └── llm_routes.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── patient_service.py
│   │   ├── study_service.py
│   │   ├── prediction_service.py
│   │   └── llm_service.py
│   ├── ai_models/
│   │   ├── vision_models/
│   │   │   ├── vit_loader.py            # Carga model.keras (singleton)
│   │   │   ├── preprocessing.py         # Resize + normalización para Keras
│   │   │   └── inference.py             # Predicción + recomendaciones
│   │   └── llm/
│   │       ├── llm_interface.py         # Proveedor pluggable (mock/openai/llama/mistral)
│   │       └── llm_prompts.py           # Templates de prompt
│   └── utils/
│       ├── dependencies.py              # Inyección de médico autenticado
│       ├── file_manager.py              # Guardar imágenes subidas
│       └── exceptions.py               # HTTPExceptions tipadas
├── requirements.txt
├── .env.example
└── run.py
```

---

## 1. Instalación

```bash
# Clonar / copiar el proyecto
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

---

## 2. Configuración

```bash
cp .env.example .env
# Editar .env con sus valores reales
```

Variables clave:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de PostgreSQL |
| `SECRET_KEY` | Clave secreta para JWT (cámbiela en producción) |
| `VIT_MODEL_PATH` | Ruta al archivo `.keras` del modelo |
| `LLM_PROVIDER` | `mock` \| `openai` \| `llama` \| `mistral` |
| `OPENAI_API_KEY` | Solo si `LLM_PROVIDER=openai` |

---

## 3. Base de datos

```bash
# Crear la base de datos en PostgreSQL
createdb cervical_ai_db

# Las tablas se crean automáticamente al iniciar (Base.metadata.create_all)
# Para producción use Alembic:
alembic init migrations
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

---

## 4. Ejecutar el servidor

```bash
python run.py
# o directamente:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Documentación interactiva: http://localhost:8000/docs

---

## 5. Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registrar médico |
| POST | `/auth/login` | Login → JWT |
| GET | `/patients` | Listar pacientes del médico |
| POST | `/patients` | Crear paciente |
| GET | `/patients/{id}` | Obtener paciente |
| PATCH | `/patients/{id}` | Actualizar paciente |
| POST | `/studies/upload-image` | Subir imagen médica |
| POST | `/predictions/analyze/{study_id}` | Analizar imagen con ViT |
| GET | `/predictions/history/{patient_id}` | Historial de predicciones |
| POST | `/llm/explain-prediction` | Explicación médica con LLM |

---

## 6. Conectar el frontend

En el frontend (`.env` de Vite):

```env
VITE_API_URL=http://localhost:8000
```

Flujo de autenticación:

```typescript
// 1. Login
const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const { access_token } = await res.json();
localStorage.setItem("token", access_token);

// 2. Peticiones autenticadas
const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
```

Flujo completo de análisis:

```
POST /patients           → patient_id
POST /studies/upload-image (form-data: patient_id, tipo_estudio, file) → study_id
POST /predictions/analyze/{study_id}   → { prediction, confidence, ... }
POST /llm/explain-prediction           → { medical_explanation }
GET  /predictions/history/{patient_id} → lista historial
```

---

## 7. Integrar el modelo ViT (.keras)

1. Coloque su archivo en la ruta definida por `VIT_MODEL_PATH` (default: `app/ai_models/vision_models/model.keras`).

2. El modelo debe producir una salida softmax con **3 clases** en este orden:
   - índice 0 → `bajo_riesgo`
   - índice 1 → `medio_riesgo`
   - índice 2 → `alto_riesgo`

3. Si el orden de sus clases es diferente, edite `CLASS_NAMES` en `inference.py`:
   ```python
   CLASS_NAMES = ["bajo_riesgo", "medio_riesgo", "alto_riesgo"]
   ```

4. La imagen se preprocesa automáticamente a `(224×224, RGB, normalizada [0,1])`.
   Ajuste `IMAGE_SIZE` en `.env` si su modelo usa otra resolución.

5. Sin modelo (`model.keras` ausente) el sistema devuelve predicciones simuladas para desarrollo.

---

## 8. Integrar un LLM en el futuro

Solo se necesitan dos pasos:

**Paso 1 — Cambiar el proveedor en `.env`:**

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

**Paso 2 — (Opcional) Añadir un proveedor propio:**

En `app/ai_models/llm/llm_interface.py`, implementar la función y registrarla:

```python
def _call_mi_modelo(prompt: str) -> str:
    # su lógica aquí
    return texto_generado

_PROVIDERS["mi_modelo"] = _call_mi_modelo
```

Luego en `.env`:
```env
LLM_PROVIDER=mi_modelo
```

Los prompts médicos se encuentran en `llm_prompts.py` y pueden refinarse independientemente.
