import { config } from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

// Configuración de la aplicación
export const appConfig = {
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'seniat-jwt-secret-key-2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  // Oracle Database
  oracle: {
    host: process.env.ORACLE_HOST || '172.16.32.73',
    port: parseInt(process.env.ORACLE_PORT || '1521'),
    database: process.env.ORACLE_DATABASE || 'DWREPO',
    username: process.env.ORACLE_USERNAME || 'CGBRITO',
    password: process.env.ORACLE_PASSWORD || 'cgkbrito',
    schema: process.env.ORACLE_SCHEMA || 'CGBRITO',
  },
  
  // API
  api: {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://172.16.56.23:3001',
  },
  
  // NextAuth
  nextauth: {
    secret: process.env.NEXTAUTH_SECRET || 'seniat-datafiscal-secret-key-2024',
    url: process.env.NEXTAUTH_URL || 'http://172.16.56.23:3001',
  },
  
  // Sesión
  session: {
    secret: process.env.SESSION_SECRET || 'seniat-session-secret-2024',
  },
  
  // Entorno
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001'),
};

// Verificar variables críticas
if (!appConfig.jwt.secret) {
  console.warn('⚠️  JWT_SECRET no está definido, usando valor por defecto');
}

if (!appConfig.oracle.host) {
  console.warn('⚠️  ORACLE_HOST no está definido, usando valor por defecto');
}

export default appConfig;
