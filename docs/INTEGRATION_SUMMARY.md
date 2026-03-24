# Resumen de Integración — VARIME

## Stack completo

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React + TypeScript + Vite | 18 / 5.8 / 5.4 |
| UI | shadcn/ui + Tailwind CSS | — / 3.4 |
| Backend | FastAPI + Python | 0.115 / 3.11 |
| ORM | SQLAlchemy + Alembic | 2.0 / 1.14 |
| Base de datos | PostgreSQL | 16 |
| Modelos IA | TensorFlow/Keras ViT | 2.17 |
| LLM | Claude AI (Anthropic) | claude-opus-4-6 |
| Infraestructura | Docker Compose | — |

---

## Componentes clave del frontend

| Archivo | Responsabilidad |
|---------|----------------|
| `src/lib/api.ts` | Cliente HTTP centralizado con autenticación JWT |
| `src/pages/Login.tsx` | Registro e inicio de sesión |
| `src/pages/ClinicalData.tsx` | Gestión de pacientes (crear / seleccionar) |
| `src/pages/UploadImages.tsx` | Carga de imágenes con barra de progreso |
| `src/pages/Processing.tsx` | Polling de estado del job en tiempo real |
| `src/pages/Results.tsx` | Resultados + explicación Claude AI + PDF + email |
| `src/pages/History.tsx` | Historial de análisis del médico |
| `src/pages/Dashboard.tsx` | Panel con métricas reales del backend |

---

## Servicios del backend

| Servicio | Responsabilidad |
|---------|----------------|
| `auth_service` | Login, registro, hash bcrypt, tokens JWT |
| `patient_service` | CRUD de pacientes |
| `study_service` | Subida y almacenamiento de imágenes |
| `analysis_service` | Gestión de jobs asincrónicos, orquestación |
| `prediction_service` | Inferencia ViT, almacenamiento de predicciones |
| `llm_service` | Llamada a Claude AI, generación de explicaciones |

---

## Flujo de datos end-to-end

```
[Médico]
   │
   ▼
[Login] ──────────────→ JWT token (localStorage)
   │
   ▼
[ClinicalData] ────────→ POST /patients → patient_id
   │
   ▼
[UploadImages] ────────→ POST /api/analyze (multipart)
   │                          └─→ { jobId }
   ▼
[Processing] ──────────→ GET /api/status/{jobId}  (polling 1s)
   │                          └─→ { status, progress, current_step }
   │                     GET /api/results/{jobId}
   │                          └─→ { riskLevel, confidence, model1, model2 }
   ▼
[Results] ─────────────→ POST /llm/explain-prediction
   │                          └─→ { medical_explanation } (Claude AI)
   │
   ├──→ Descargar PDF (window.print)
   └──→ Enviar por email (mailto:)
```

---

## Modelos de IA integrados

### ViT Sipakmed — Clasificación citológica
- **Entrada:** imagen de frotis cervical 224×224 px RGB
- **Salida:** `normal` | `anormal` (2 clases)
- **Mapeo interno:** `normal` → `bajo_riesgo`, `anormal` → `alto_riesgo`

### ViT TCIA Heterogeneidad — Análisis de heterogeneidad tumoral
- **Entrada:** imagen CT/MRI/PET 224×224 px RGB
- **Salida:** `bajo_riesgo` | `medio_riesgo` | `alto_riesgo` (3 clases)

Ambos modelos se cargan en memoria al arrancar (`vit_loader.py`). Si los archivos `.keras` no están presentes, el sistema opera en modo mock devolviendo predicciones simuladas.

---

## Seguridad

- Contraseñas hasheadas con bcrypt (passlib)
- Autenticación mediante JWT (python-jose), expiración configurable
- CORS restringido a orígenes definidos en `ALLOWED_ORIGINS`
- Credenciales en variables de entorno (nunca en código)
- Validación de entrada con Pydantic v2 en todos los endpoints
