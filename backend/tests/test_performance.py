"""
Prueba de rendimiento del sistema VARIME — Tabla XIX del documento.
Mide tiempos de respuesta del endpoint /api/analyze bajo cargas de 10, 25 y 50 solicitudes.

Ejecutar: python tests/test_performance.py
"""
import io
import json
import struct
import time
import zlib
import statistics
import concurrent.futures
import httpx

BASE = "http://localhost:8000"
REGISTER_EMAIL = "perf_test_varime@prueba.com"
REGISTER_PASS = "PerfTest123!"


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_png(width: int = 64, height: int = 64) -> bytes:
    """PNG sintético mínimo válido para el endpoint."""
    def chunk(t, d):
        c = t + d
        return struct.pack(">I", len(d)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    raw = b"".join(
        b"\x00" + bytes([i % 256, (i * 2) % 256, 128] * width)
        for i in range(height)
    )
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", header)
        + chunk(b"IDAT", zlib.compress(raw))
        + chunk(b"IEND", b"")
    )


def _get_token() -> str:
    payload = {
        "nombre": "Dr. Performance Test",
        "email": REGISTER_EMAIL,
        "password": REGISTER_PASS,
        "especialidad": "Pruebas",
        "hospital": "VARIME Test Lab",
    }
    r = httpx.post(f"{BASE}/auth/register", json=payload, timeout=15)
    if r.status_code in (400, 409):
        r = httpx.post(
            f"{BASE}/auth/login",
            json={"email": REGISTER_EMAIL, "password": REGISTER_PASS},
            timeout=15,
        )
    r.raise_for_status()
    return r.json()["access_token"]


def _send_one(token: str, png: bytes) -> dict:
    """Envía una solicitud y espera hasta que el job complete. Retorna métricas."""
    headers = {"Authorization": f"Bearer {token}"}
    t0 = time.perf_counter()

    try:
        r = httpx.post(
            f"{BASE}/api/analyze",
            files={"citology": ("img.png", io.BytesIO(png), "image/png")},
            headers=headers,
            timeout=60,
        )
        if r.status_code != 200:
            return {"error": r.status_code, "elapsed": time.perf_counter() - t0}

        job_id = r.json().get("jobId") or r.json().get("job_id")

        # Polling hasta completar
        for _ in range(60):
            time.sleep(0.5)
            sr = httpx.get(f"{BASE}/api/results/{job_id}", headers=headers, timeout=10)
            if sr.status_code == 200:
                body = sr.json()
                if body.get("status") == "completed":
                    return {"elapsed": time.perf_counter() - t0, "ok": True}
                if body.get("status") == "error":
                    return {"elapsed": time.perf_counter() - t0, "error": "job_error"}

        return {"elapsed": time.perf_counter() - t0, "error": "timeout"}

    except Exception as exc:
        return {"elapsed": time.perf_counter() - t0, "error": str(exc)}


def _run_load(token: str, png: bytes, n: int, workers: int = 10) -> dict:
    """Lanza n solicitudes con concurrencia = workers."""
    print(f"\n  Lanzando {n} solicitudes ({workers} workers concurrentes)...", flush=True)
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(_send_one, token, png) for _ in range(n)]
        for i, f in enumerate(concurrent.futures.as_completed(futures), 1):
            r = f.result()
            results.append(r)
            status = "OK" if r.get("ok") else f"✗({r.get('error')})"
            print(f"    [{i:>3}/{n}] {status}  {r['elapsed']:.2f}s", flush=True)

    times = [r["elapsed"] for r in results if r.get("ok")]
    errors = [r for r in results if not r.get("ok")]
    error_pct = len(errors) / n * 100

    return {
        "n": n,
        "ok": len(times),
        "errors": len(errors),
        "error_pct": round(error_pct, 1),
        "avg": round(statistics.mean(times), 2) if times else None,
        "min": round(min(times), 2) if times else None,
        "max": round(max(times), 2) if times else None,
        "p95": round(sorted(times)[int(len(times) * 0.95)] if len(times) >= 2 else (times[0] if times else 0), 2),
    }


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 65)
    print("  PRUEBA DE RENDIMIENTO — VARIME /api/analyze")
    print("=" * 65)

    print("\n[1/4] Autenticando...", end=" ", flush=True)
    token = _get_token()
    print("OK")

    print("[2/4] Generando imagen de prueba...", end=" ", flush=True)
    png = _make_png(224, 224)
    print(f"OK  ({len(png)} bytes)")

    print("[3/4] Ejecutando cargas progresivas...\n")

    tabla = []
    for n in [10, 25, 50]:
        row = _run_load(token, png, n, workers=min(n, 15))
        tabla.append(row)

    print("\n" + "=" * 65)
    print("  RESULTADOS — TABLA XIX")
    print("=" * 65)
    print(f"  {'Peticiones':>10}  {'Promedio (s)':>13}  {'Mínimo (s)':>11}  {'Máximo (s)':>11}  {'Error %':>8}")
    print("  " + "-" * 60)
    for r in tabla:
        avg = f"{r['avg']:.2f}" if r["avg"] else "N/A"
        mn  = f"{r['min']:.2f}" if r["min"] else "N/A"
        mx  = f"{r['max']:.2f}" if r["max"] else "N/A"
        print(f"  {r['n']:>10}  {avg:>13}  {mn:>11}  {mx:>11}  {r['error_pct']:>7}%")
    print("=" * 65)

    print("\n[4/4] Guardando resultados en tests/performance_results.json...")
    with open("tests/performance_results.json", "w", encoding="utf-8") as f:
        json.dump(tabla, f, indent=2, ensure_ascii=False)
    print("  OK  tests/performance_results.json")

    print("\nPrueba completada.\n")
