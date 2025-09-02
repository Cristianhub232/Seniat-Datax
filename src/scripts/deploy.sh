#!/bin/bash
set -euxo pipefail
trap 'echo "❌ Error en línea $LINENO. Revisa el log."' ERR

# Ruta raíz del proyecto (dos niveles arriba de src/scripts)
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# Cargar variables de entorno desde la raíz
if [ -f "$PROJECT_ROOT/.env.local" ]; then
  echo "🔄 Cargando variables desde $PROJECT_ROOT/.env.local"
  set -a
  source "$PROJECT_ROOT/.env.local"
  set +a
else
  echo "⚠️ Advertencia: No se encontró $PROJECT_ROOT/.env.local. Continuando sin variables locales."
fi

# Validar usuario actual
if [ "$(whoami)" != "hpena" ]; then
  echo "❌ Este script debe ejecutarse como el usuario 'hpena'. Usuario actual: $(whoami)"
  exit 1
fi

# Validar y mostrar variables requeridas
REQUIRED_VARS=(APP_NAME APP_DIR BASE_URL PORT DATABASE_URL NEXT_PUBLIC_API_URL JWT_SECRET)
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR:-}" ]; then
    echo "❌ Falta la variable de entorno requerida: $VAR"
    exit 1
  else
    echo "✅ $VAR=${!VAR}"
  fi
done

# Ir al directorio de la app
cd "$APP_DIR"

echo "📦 Iniciando despliegue para $APP_NAME"

# Eliminar build anterior y reinstalar dependencias
rm -rf .next || true
npm install

# Forzar compilación de producción
export NODE_ENV=production
echo "🛠️ Ejecutando compilación en entorno $NODE_ENV"
npm run build

# Reiniciar con PM2
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  echo "♻️ Eliminando proceso existente en PM2: $APP_NAME"
  pm2 delete "$APP_NAME"
fi

PORT=$PORT pm2 start npm --name "$APP_NAME" -- start
pm2 save

echo "✅ Despliegue exitoso. App activa en: $BASE_URL:$PORT"
