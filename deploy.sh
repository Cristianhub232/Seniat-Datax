#!/bin/bash

# Script de despliegue para la aplicación SIRONT Frontend
# Autor: Sistema de despliegue automático
# Fecha: $(date)

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue de SIRONT Frontend..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado. Por favor instala npm primero."
    exit 1
fi

print_status "Versión de Node.js: $(node --version)"
print_status "Versión de npm: $(npm --version)"

# Crear archivo .env.local si no existe
if [ ! -f ".env.local" ]; then
    print_warning "Archivo .env.local no encontrado. Creando archivo de configuración por defecto..."
    cat > .env.local << EOF
# Configuración de la base de datos principal
DATABASE_URL=postgresql://cristian:cristian@172.16.56.79:5432/ciencia_contri

# Configuración de la base de datos de empresas petroleras
PETROLERAS_DATABASE_URL=postgresql://cristian:cristian@172.16.56.79:5432/ciencia_contri

# Configuración de la base de datos XMLS (opcional)
XMLS_DATABASE_URL=postgresql://cristian:cristian@172.16.56.79:5432/ciencia_contri

# Configuración de la aplicación
NODE_ENV=production
URL_BASE=http://172.16.56.79:3000

# Configuración de JWT
JWT_SECRET=siront_jwt_secret_production_$(date +%s)
JWT_EXPIRES_IN=24h

# Configuración del servidor
PORT=3000
HOST=0.0.0.0
EOF
    print_status "Archivo .env.local creado exitosamente."
else
    print_status "Archivo .env.local encontrado."
fi

# Limpiar instalaciones anteriores
print_status "Limpiando instalaciones anteriores..."
rm -rf node_modules
rm -rf .next
rm -rf out

# Instalar dependencias
print_status "Instalando dependencias..."
npm ci --production=false

# Verificar conexión a la base de datos
print_status "Verificando conexión a la base de datos..."
if npm run sync-db > /dev/null 2>&1; then
    print_status "Conexión a la base de datos verificada exitosamente."
else
    print_warning "No se pudo verificar la conexión a la base de datos. Continuando con el despliegue..."
fi

# Construir la aplicación
print_status "Construyendo la aplicación..."
npm run build

# Verificar que la construcción fue exitosa
if [ ! -d ".next" ]; then
    print_error "La construcción falló. No se encontró el directorio .next"
    exit 1
fi

print_status "Construcción completada exitosamente."

# Crear script de inicio del servidor
cat > start-server.sh << 'EOF'
#!/bin/bash

# Script de inicio del servidor
export NODE_ENV=production
export PORT=${PORT:-3000}
export HOST=${HOST:-0.0.0.0}

echo "🚀 Iniciando servidor SIRONT Frontend en puerto $PORT..."
echo "📱 Accede a la aplicación en: http://$HOST:$PORT"

# Iniciar el servidor
npm start
EOF

chmod +x start-server.sh

# Crear script de PM2 para gestión de procesos
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'siront-frontend',
    script: 'npm',
    args: 'start',
    cwd: process.cwd(),
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Crear directorio de logs
mkdir -p logs

# Crear script de gestión con PM2
cat > pm2-deploy.sh << 'EOF'
#!/bin/bash

# Script de despliegue con PM2
echo "🚀 Desplegando con PM2..."

# Instalar PM2 globalmente si no está instalado
if ! command -v pm2 &> /dev/null; then
    echo "Instalando PM2..."
    npm install -g pm2
fi

# Detener aplicación si está corriendo
pm2 stop siront-frontend 2>/dev/null || true
pm2 delete siront-frontend 2>/dev/null || true

# Iniciar aplicación con PM2
pm2 start ecosystem.config.js

# Guardar configuración de PM2
pm2 save

# Configurar PM2 para iniciar automáticamente en el arranque del sistema
pm2 startup

echo "✅ Aplicación desplegada con PM2 exitosamente."
echo "📊 Para ver logs: pm2 logs siront-frontend"
echo "🔄 Para reiniciar: pm2 restart siront-frontend"
echo "⏹️  Para detener: pm2 stop siront-frontend"
EOF

chmod +x pm2-deploy.sh

# Crear script de Docker (opcional)
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
EOF

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  siront-frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOST=0.0.0.0
    env_file:
      - .env.local
    restart: unless-stopped
    networks:
      - siront-network

networks:
  siront-network:
    driver: bridge
EOF

print_status "✅ Despliegue completado exitosamente!"

echo ""
echo "📋 Opciones de inicio del servidor:"
echo "1. Inicio directo: ./start-server.sh"
echo "2. Con PM2 (recomendado): ./pm2-deploy.sh"
echo "3. Con Docker: docker-compose up -d"
echo ""
echo "🌐 La aplicación estará disponible en: http://172.16.56.79:3000"
echo ""
echo "📝 Comandos útiles:"
echo "   - Ver logs: pm2 logs siront-frontend"
echo "   - Reiniciar: pm2 restart siront-frontend"
echo "   - Detener: pm2 stop siront-frontend"
echo "   - Estado: pm2 status" 