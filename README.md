# 🚀 Sistema de Gestión de Ejecutivos y Cartera

Sistema web moderno para la gestión de ejecutivos, cartera de contribuyentes y tickets, desarrollado con Next.js 15 y Oracle Database.

## ✨ Características Principales

- 🔐 **Sistema de Autenticación**: JWT con roles y permisos granulares
- 👥 **Gestión de Usuarios**: Roles de Admin y Ejecutivo con permisos diferenciados
- 📊 **Dashboard Interactivo**: Métricas y estadísticas en tiempo real
- 🎫 **Sistema de Tickets**: Gestión completa de tickets y casos
- 👨‍💼 **Gestión de Ejecutivos**: Administración de ejecutivos y sus carteras
- 📈 **Reportes**: Sistema de reportes y métricas avanzadas
- 🎨 **UI Moderna**: Interfaz construida con Tailwind CSS y Radix UI

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15.3.3, React 18, TypeScript 5.8.3
- **Backend**: Node.js, Express, Sequelize ORM
- **Base de Datos**: Oracle Database con esquema CGBRITO
- **Autenticación**: JWT, bcrypt
- **Estilos**: Tailwind CSS, Radix UI
- **Procesos**: PM2 para producción

## 📋 Prerrequisitos

- Node.js 18+ 
- Oracle Database 19c+
- npm o yarn

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPO>
cd <NOMBRE_DEL_PROYECTO>
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env.local`:
```env
# Base de datos Oracle
DB_HOST=localhost
DB_PORT=1521
DB_NAME=XE
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_SCHEMA=CGBRITO

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# Servidor
PORT=3001
NODE_ENV=development
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3001`

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas del dashboard
│   └── api/               # API routes
├── components/             # Componentes React reutilizables
├── context/                # Contextos de React
├── hooks/                  # Hooks personalizados
├── lib/                    # Utilidades y configuración
├── models/                 # Modelos de Sequelize
└── scripts/                # Scripts de utilidad
```

## 🔐 Sistema de Permisos

### Roles Disponibles

- **ADMIN**: Acceso completo a todos los módulos
- **EJECUTIVO**: Acceso limitado a dashboard, ejecutivos y reportes

### Permisos por Módulo

- `dashboard.access`: Acceso al dashboard principal
- `dashboard.metrics`: Visualización de métricas
- `ejecutivos.read`: Lectura de ejecutivos
- `ejecutivos.update`: Actualización de ejecutivos
- `reports.access`: Acceso a reportes
- `roles.*`: Gestión completa de roles (solo admin)
- `usuarios.*`: Gestión completa de usuarios (solo admin)

## 🗄️ Base de Datos

### Esquema Principal: CGBRITO

- **USERS**: Usuarios del sistema
- **ROLES**: Roles disponibles
- **PERMISSIONS**: Permisos del sistema
- **EJECUTIVOS**: Información de ejecutivos
- **CARTERA_CONTRIBUYENTES**: Cartera de contribuyentes
- **TICKETS**: Sistema de tickets
- **SESSIONS**: Sesiones de usuario (JWT)

## 📱 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting del código

# Scripts de utilidad
node scripts/list-cgkbrito-tables.cjs    # Listar tablas del esquema
node scripts/check-table-structure.cjs   # Verificar estructura de tablas
```

## 🌐 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run start
```

### Con PM2
```bash
npm run build
pm2 start ecosystem.config.js
```

## 🔧 Configuración de Oracle

El sistema está configurado para trabajar con Oracle Database. Asegúrate de:

1. Tener Oracle Client instalado
2. Configurar las variables de entorno correctamente
3. Tener acceso al esquema CGBRITO
4. Instalar el paquete `oracledb`

## 📊 Estado del Proyecto

- ✅ Sistema de autenticación funcional
- ✅ Gestión de roles y permisos
- ✅ Dashboard con métricas
- ✅ CRUD de ejecutivos
- ✅ Sistema de tickets
- ✅ Middleware de protección de rutas
- ✅ UI responsive y moderna

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ usando Next.js y Oracle Database**
