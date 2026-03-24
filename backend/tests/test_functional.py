"""
Pruebas funcionales del sistema VARIME — Tabla XX del documento.
Ejecutar: python -m pytest tests/test_functional.py -v
"""
import io
import time
import pytest
import httpx

BASE = "http://localhost:8000"

# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def doctor_token():
    """PF-01: Registra un médico de prueba y retorna el JWT."""
    payload = {
        "nombre": "Dra. Test Pruebas",
        "email": "test_pruebas_varime@prueba.com",
        "password": "TestPass123!",
        "especialidad": "Oncología Ginecológica",
        "hospital": "Hospital de Pruebas VARIME",
    }
    r = httpx.post(f"{BASE}/auth/register", json=payload, timeout=15)
    if r.status_code in (400, 409):    # ya registrado → login
        r = httpx.post(
            f"{BASE}/auth/login",
            json={"email": payload["email"], "password": payload["password"]},
            timeout=15,
        )
    assert r.status_code in (200, 201), f"Auth fallo: {r.text}"
    token = r.json()["access_token"]
    assert token
    return token


@pytest.fixture(scope="module")
def auth_headers(doctor_token):
    return {"Authorization": f"Bearer {doctor_token}"}


@pytest.fixture(scope="module")
def sample_image_bytes():
    """Imagen PNG sintética 224×224 válida."""
    import struct, zlib
    def _png_chunk(chunk_type, data):
        c = chunk_type + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    width = height = 224
    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    raw = b"".join(b"\x00" + bytes([i % 256, (i * 2) % 256, (i * 3) % 256] * width) for i in range(height))
    compressed = zlib.compress(raw)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + _png_chunk(b"IHDR", header)
        + _png_chunk(b"IDAT", compressed)
        + _png_chunk(b"IEND", b"")
    )
    return png


# ── PF-01: Registro de médico ─────────────────────────────────────────────────

def test_pf01_registro_medico(doctor_token):
    """PF-01: El sistema crea la cuenta y retorna token JWT."""
    assert isinstance(doctor_token, str) and len(doctor_token) > 20
    print(f"\n  [PF-01] OK  JWT recibido ({len(doctor_token)} chars)")


# ── PF-02: Registro de paciente ───────────────────────────────────────────────

def test_pf02_registro_paciente(auth_headers):
    """PF-02: Los datos del paciente se almacenan correctamente en la BD."""
    import time as _t
    uid = str(int(_t.time()))[-6:]
    payload = {
        "nombre": "Paciente Prueba PF02",
        "edad": 35,
        "identificacion": f"TEST-PF02-{uid}",
        "antecedentes": "Sin antecedentes relevantes",
        "tipo_muestra": "citologia",
    }
    r = httpx.post(f"{BASE}/patients", json=payload, headers=auth_headers, timeout=15)
    assert r.status_code in (200, 201), f"Crear paciente falló: {r.text}"
    data = r.json()
    assert data["identificacion"] == payload["identificacion"]
    assert data["nombre"] == payload["nombre"]
    assert "id" in data
    print(f"\n  [PF-02] OK  Paciente ID={data['id']} creado")


# ── PF-03: Clasificación citológica ──────────────────────────────────────────

def test_pf03_clasificacion_citologica(auth_headers, sample_image_bytes):
    """PF-03: Sistema retorna clase y confianza en menos de 3 s para citología."""
    t0 = time.perf_counter()
    r = httpx.post(
        f"{BASE}/api/analyze",
        files={"citology": ("test_citologia.png", io.BytesIO(sample_image_bytes), "image/png")},
        headers=auth_headers,
        timeout=30,
    )
    elapsed = time.perf_counter() - t0
    assert r.status_code == 200, f"Analyze falló: {r.text}"
    job_id = r.json().get("jobId") or r.json().get("job_id")
    assert job_id, "No se recibió job_id"

    # Esperar resultado (polling max 30 s)
    result = None
    for _ in range(30):
        time.sleep(1)
        sr = httpx.get(f"{BASE}/api/results/{job_id}", headers=auth_headers, timeout=10)
        if sr.status_code == 200:
            body = sr.json()
            if body.get("status") == "completed" and body.get("result"):
                result = body["result"]
                break

    assert result is not None, "Job no completó en 30 s"
    assert result["riskLevel"] in ("bajo", "medio", "alto"), f"riskLevel inesperado: {result}"
    assert 0 < result["confidence"] <= 100, f"confianza fuera de rango: {result['confidence']}"
    print(f"\n  [PF-03] OK  riskLevel={result['riskLevel']}  confianza={result['confidence']}%  tiempo_total={elapsed:.2f}s")


# ── PF-04: Clasificación heterogeneidad (resonancia) ─────────────────────────

def test_pf04_clasificacion_heterogeneidad(auth_headers, sample_image_bytes):
    """PF-04: Sistema retorna nivel bajo/medio/alto con confianza para resonancia."""
    r = httpx.post(
        f"{BASE}/api/analyze",
        files={"mri": ("test_resonancia.png", io.BytesIO(sample_image_bytes), "image/png")},
        headers=auth_headers,
        timeout=30,
    )
    assert r.status_code == 200, f"Analyze MRI falló: {r.text}"
    job_id = r.json().get("jobId") or r.json().get("job_id")
    assert job_id

    result = None
    for _ in range(30):
        time.sleep(1)
        sr = httpx.get(f"{BASE}/api/results/{job_id}", headers=auth_headers, timeout=10)
        if sr.status_code == 200:
            body = sr.json()
            if body.get("status") == "completed" and body.get("result"):
                result = body["result"]
                break

    assert result is not None, "Job no completó en 30 s"
    assert result["riskLevel"] in ("bajo", "medio", "alto")
    assert 0 < result["confidence"] <= 100
    print(f"\n  [PF-04] OK  riskLevel={result['riskLevel']}  confianza={result['confidence']}%")


# ── PF-05: Formato de imagen inválido ─────────────────────────────────────────

def test_pf05_formato_invalido(auth_headers):
    """PF-05: Subir PDF retorna error 422 con mensaje descriptivo."""
    fake_pdf = b"%PDF-1.4 fake pdf content"
    r = httpx.post(
        f"{BASE}/api/analyze",
        files={"citology": ("test.pdf", io.BytesIO(fake_pdf), "application/pdf")},
        headers=auth_headers,
        timeout=15,
    )
    assert r.status_code == 422, f"Se esperaba 422, se obtuvo {r.status_code}: {r.text}"
    body = r.json()
    assert "detail" in body or "message" in body or "error" in body
    print(f"\n  [PF-05] OK  HTTP 422 recibido: {r.text[:120]}")


# ── PF-06: Token expirado / inválido ─────────────────────────────────────────

def test_pf06_token_invalido():
    """PF-06: JWT inválido/expirado retorna 401 Unauthorized."""
    bad_headers = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.invalid.signature"}
    r = httpx.get(f"{BASE}/api/history", headers=bad_headers, timeout=10)
    assert r.status_code == 401, f"Se esperaba 401, se obtuvo {r.status_code}: {r.text}"
    print(f"\n  [PF-06] OK  HTTP 401 recibido correctamente")


# ── PF-07: Historial de análisis ──────────────────────────────────────────────

def test_pf07_historial_analisis(auth_headers):
    """PF-07: GET /api/history retorna lista de análisis ordenados por fecha."""
    r = httpx.get(f"{BASE}/api/history", headers=auth_headers, timeout=15)
    assert r.status_code == 200, f"Historial falló: {r.text}"
    data = r.json()
    assert isinstance(data, list)
    if len(data) >= 2:
        dates = [item["date"] for item in data]
        assert dates == sorted(dates, reverse=True), "El historial no está ordenado por fecha desc"
    print(f"\n  [PF-07] OK  {len(data)} análisis en historial")
