#!/usr/bin/env bash
# Script de desarrollo VARIME — macOS / Linux
# Ejecuta frontend en modo dev (el backend corre via Docker)

set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "${GREEN}Iniciando VARIME — Modo Desarrollo${NC}"
echo ""

BACKEND_URL="http://localhost:8000"

check_backend() {
  curl -sf "$BACKEND_URL/" > /dev/null 2>&1
}

if ! check_backend; then
  echo -e "${YELLOW}Backend no detectado en $BACKEND_URL${NC}"
  echo -e "${YELLOW}Levantando servicios Docker...${NC}"
  docker compose up -d db backend
  echo -e "${YELLOW}Esperando al backend...${NC}"
  sleep 5
else
  echo -e "${GREEN}Backend OK en $BACKEND_URL${NC}"
fi

echo ""

if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js no esta instalado${NC}"
  exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
  echo -e "${YELLOW}Instalando dependencias del frontend...${NC}"
  (cd frontend && npm install)
fi

echo ""
echo -e "Frontend: ${CYAN}http://localhost:8080${NC}"
echo -e "Backend:  ${CYAN}$BACKEND_URL${NC}"
echo -e "API Docs: ${CYAN}$BACKEND_URL/docs${NC}"
echo ""
echo "Presiona Ctrl+C para detener"
echo ""

cd frontend && npm run dev
