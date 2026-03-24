# Script de desarrollo VARIME — Windows
# Ejecuta frontend en modo dev (el backend corre via Docker)

Write-Host "Iniciando VARIME — Modo Desarrollo" -ForegroundColor Magenta
Write-Host ""

$FRONTEND_PORT = 8080
$BACKEND_URL   = "http://localhost:8000"

# Verificar que el backend Docker este corriendo
function Test-Backend {
    try {
        Invoke-WebRequest -Uri "$BACKEND_URL/" -UseBasicParsing -ErrorAction SilentlyContinue | Out-Null
        return $true
    } catch {
        return $false
    }
}

if (-not (Test-Backend)) {
    Write-Host "Backend no detectado en $BACKEND_URL" -ForegroundColor Yellow
    Write-Host "Levantando servicios Docker..." -ForegroundColor Yellow
    docker compose up -d db backend
    Write-Host "Esperando al backend..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
} else {
    Write-Host "Backend OK en $BACKEND_URL" -ForegroundColor Green
}

Write-Host ""

# Verificar Node
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js no esta instalado" -ForegroundColor Red
    exit 1
}

# Instalar dependencias si faltan
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Instalando dependencias del frontend..." -ForegroundColor Yellow
    Push-Location frontend
    npm install
    Pop-Location
}

Write-Host ""
Write-Host "Frontend: http://localhost:$FRONTEND_PORT" -ForegroundColor Cyan
Write-Host "Backend:  $BACKEND_URL" -ForegroundColor Cyan
Write-Host "API Docs: $BACKEND_URL/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Yellow
Write-Host ""

Push-Location frontend
npm run dev
Pop-Location
