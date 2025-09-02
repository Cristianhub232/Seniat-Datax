#!/bin/bash

# Script de gestión para la aplicación SIRONT Frontend
# Autor: Sistema de gestión automático

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}[HEADER]${NC} $1"
}

# Función para mostrar el menú principal
show_menu() {
    clear
    print_header "=== GESTIÓN DE LA APLICACIÓN SIRONT FRONTEND ==="
    echo ""
    echo "1. Ver estado de la aplicación"
    echo "2. Ver logs de la aplicación"
    echo "3. Reiniciar aplicación"
    echo "4. Detener aplicación"
    echo "5. Iniciar aplicación"
    echo "6. Ver estadísticas de PM2"
    echo "7. Actualizar aplicación (pull + rebuild)"
    echo "8. Ver configuración de variables de entorno"
    echo "9. Probar conectividad de la base de datos"
    echo "10. Abrir aplicación en el navegador"
    echo "0. Salir"
    echo ""
    read -p "Selecciona una opción: " choice
}

# Función para ver estado
check_status() {
    print_status "Verificando estado de la aplicación..."
    pm2 status
    echo ""
    print_status "Verificando conectividad..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200"; then
        print_status "✅ La aplicación está respondiendo correctamente en http://localhost:3001"
    else
        print_error "❌ La aplicación no está respondiendo correctamente"
    fi
}

# Función para ver logs
show_logs() {
    print_status "Mostrando logs de la aplicación..."
    echo "Presiona Ctrl+C para salir de los logs"
    pm2 logs siront-frontend --lines 50
}

# Función para reiniciar
restart_app() {
    print_status "Reiniciando aplicación..."
    pm2 restart siront-frontend
    print_status "✅ Aplicación reiniciada exitosamente"
}

# Función para detener
stop_app() {
    print_status "Deteniendo aplicación..."
    pm2 stop siront-frontend
    print_status "✅ Aplicación detenida exitosamente"
}

# Función para iniciar
start_app() {
    print_status "Iniciando aplicación..."
    pm2 start siront-frontend
    print_status "✅ Aplicación iniciada exitosamente"
}

# Función para ver estadísticas
show_stats() {
    print_status "Mostrando estadísticas de PM2..."
    pm2 monit
}

# Función para actualizar aplicación
update_app() {
    print_status "Actualizando aplicación..."
    
    # Verificar si hay cambios en git
    if git status --porcelain | grep -q .; then
        print_warning "Hay cambios sin commitear. ¿Deseas continuar? (y/N)"
        read -p "" confirm
        if [[ $confirm != [yY] ]]; then
            print_status "Actualización cancelada"
            return
        fi
    fi
    
    # Hacer pull de los cambios
    print_status "Obteniendo cambios del repositorio..."
    git pull origin main
    
    # Reinstalar dependencias
    print_status "Reinstalando dependencias..."
    npm ci --production=false
    
    # Reconstruir aplicación
    print_status "Reconstruyendo aplicación..."
    npm run build
    
    # Reiniciar aplicación
    print_status "Reiniciando aplicación..."
    pm2 restart siront-frontend
    
    print_status "✅ Aplicación actualizada exitosamente"
}

# Función para ver configuración
show_config() {
    print_status "Mostrando configuración de variables de entorno..."
    if [ -f ".env.local" ]; then
        echo ""
        echo "=== Variables de entorno ==="
        cat .env.local | grep -v "^#" | grep -v "^$"
        echo ""
    else
        print_error "No se encontró el archivo .env.local"
    fi
}

# Función para probar base de datos
test_database() {
    print_status "Probando conectividad con la base de datos..."
    if npm run sync-db > /dev/null 2>&1; then
        print_status "✅ Conexión a la base de datos exitosa"
    else
        print_error "❌ Error conectando a la base de datos"
        print_warning "Verifica las variables de entorno DATABASE_URL"
    fi
}

# Función para abrir en navegador
open_browser() {
    print_status "Abriendo aplicación en el navegador..."
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:3001
    elif command -v gnome-open &> /dev/null; then
        gnome-open http://localhost:3001
    else
        print_warning "No se pudo abrir el navegador automáticamente"
        print_status "Abre manualmente: http://localhost:3001"
    fi
}

# Bucle principal
while true; do
    show_menu
    
    case $choice in
        1)
            check_status
            ;;
        2)
            show_logs
            ;;
        3)
            restart_app
            ;;
        4)
            stop_app
            ;;
        5)
            start_app
            ;;
        6)
            show_stats
            ;;
        7)
            update_app
            ;;
        8)
            show_config
            ;;
        9)
            test_database
            ;;
        10)
            open_browser
            ;;
        0)
            print_status "Saliendo..."
            exit 0
            ;;
        *)
            print_error "Opción inválida"
            ;;
    esac
    
    echo ""
    read -p "Presiona Enter para continuar..."
done 