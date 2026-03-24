# Inicio Rápido — VARIME

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) >= 24
- Docker Compose >= 2.20

---

## Paso 1 — Clonar y configurar

```bash
git clone <URL_DEL_REPO>
cd rvix-care-ai

cp .env.example .env
```

Editar `.env` y completar al menos:

```env
ANTHROPIC_API_KEY=sk-ant-...
SECRET_KEY=una-clave-segura-aleatoria
```

---

## Paso 2 — Modelos ViT (opcional)

Sin modelos el sistema opera en modo simulado, lo que es suficiente para probar la interfaz.

Si tienes los archivos `.keras`, colócalos en:

```
backend/app/ai_models/vision_models/vit_sipakmed_final.keras
backend/app/ai_models/vision_models/vit_tcia_heterogeneidad_final.keras
```

---

## Paso 3 — Desplegar

```bash
docker compose up --build -d
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:8080 |
| API REST | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |

---

## Paso 4 — Primer acceso

1. Abrir http://localhost:8080
2. Registrar una cuenta de médico
3. Iniciar sesión
4. **Datos Clínicos** → crear o seleccionar paciente
5. **Subir Imágenes** → cargar citología y/o resonancia
6. Esperar el análisis (polling automático)
7. Ver resultados con explicación de Claude AI

---

## Comandos útiles

```bash
# Ver estado de contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f backend
docker compose logs -f frontend

# Detener
docker compose down

# Detener y borrar datos de la BD
docker compose down -v

# Rebuild solo el backend
docker compose up --build -d backend
```

---

## Desarrollo local (sin Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # editar DATABASE_URL a localhost
python run.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

O usa los scripts de raíz:
- Windows: `.\dev.ps1`
- macOS/Linux: `./dev.sh`
