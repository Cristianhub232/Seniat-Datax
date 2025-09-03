import { comparePassword } from "@/lib/authUtils";
import { signToken } from "@/lib/jwtUtils";
import { authSequelize } from "@/lib/db";
import crypto from "crypto";

interface LoginResult {
  message?: string;
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  permissions?: string[];
  token?: string;
  error?: string;
}

interface UserRecord {
  ID: string;
  USERNAME: string;
  EMAIL: string;
  PASSWORD_HASH: any;
  FIRST_NAME: string;
  LAST_NAME: string;
  ROLE_ID: number;
  STATUS: string;
  LOGIN_ATTEMPTS: number;
  LOCKED_UNTIL: Date | null;
  LAST_LOGIN: Date | null;
  ROLE_NAME: string;
  ROLE_DESCRIPTION: string;
}

interface SessionRecord {
  USER_ID: string;
  USERNAME: string;
  EMAIL: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  ROLE_NAME: string;
}

export async function loginUser(
  username: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<LoginResult> {
  try {
    console.log(`🔍 Intentando login para usuario: ${username}`);

    // 🔍 Buscar el usuario con su rol usando SQL directo
    const [users] = await authSequelize.query(`
      SELECT u.ID, u.USERNAME, u.EMAIL, u.PASSWORD_HASH, u.FIRST_NAME, u.LAST_NAME, 
             u.ROLE_ID, u.STATUS, u.LOGIN_ATTEMPTS, u.LOCKED_UNTIL, u.LAST_LOGIN,
             r.NAME as ROLE_NAME, r.DESCRIPTION as ROLE_DESCRIPTION
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.USERNAME = :username AND u.STATUS = 'active'
    `, {
      replacements: { username },
      type: 'SELECT'
    });

    if (!users || users.length === 0) {
      console.log(`❌ Usuario no encontrado o inactivo: ${username}`);
      await logAuditEvent(null, 'login_failed', 'auth', null, {
        username,
        reason: 'user_not_found'
      }, ipAddress, userAgent);
      return { error: "Usuario no encontrado o inactivo" };
    }

    const user = (Array.isArray(users) ? users[0] : users) as UserRecord;

    // Verificar si la cuenta está bloqueada
    if (user.LOCKED_UNTIL && new Date() < new Date(user.LOCKED_UNTIL)) {
      console.log(`❌ Cuenta bloqueada para usuario: ${username}`);
      await logAuditEvent(user.ID, 'login_failed', 'auth', null, {
        reason: 'account_locked',
        locked_until: user.LOCKED_UNTIL
      }, ipAddress, userAgent);
      return { error: "Cuenta bloqueada temporalmente" };
    }

    // Verificar contraseña
    let passwordHash = user.PASSWORD_HASH;
    
    // Si es un CLOB de Oracle, convertirlo a string
    if (passwordHash && typeof passwordHash === 'object' && passwordHash.getData) {
      passwordHash = await passwordHash.getData();
    }
    
    const isPasswordValid = await comparePassword(password, passwordHash);

    if (!isPasswordValid) {
      console.log(`❌ Contraseña inválida para usuario: ${username}`);
      
      // Incrementar intentos de login
      const newLoginAttempts = (user.LOGIN_ATTEMPTS || 0) + 1;
      const lockedUntil = newLoginAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      
      await authSequelize.query(`
        UPDATE CGBRITO.USERS 
        SET LOGIN_ATTEMPTS = :loginAttempts, 
            LOCKED_UNTIL = :lockedUntil
        WHERE ID = :userId
      `, {
        replacements: { 
          loginAttempts: newLoginAttempts,
          lockedUntil,
          userId: user.ID
        },
        type: 'UPDATE'
      });

      await logAuditEvent(user.ID, 'login_failed', 'auth', null, {
        reason: 'invalid_password',
        login_attempts: newLoginAttempts
      }, ipAddress, userAgent);

      return { error: "Usuario o contraseña inválidos" };
    }

    // ✅ Login exitoso - resetear intentos de login
    await authSequelize.query(`
      UPDATE CGBRITO.USERS 
      SET LOGIN_ATTEMPTS = 0, 
          LOCKED_UNTIL = NULL,
          LAST_LOGIN = CURRENT_TIMESTAMP
      WHERE ID = :userId
    `, {
      replacements: { userId: user.ID },
      type: 'UPDATE'
    });

    // Obtener permisos del usuario (con manejo de errores)
    let permissions = [];
    try {
      const permissionsResult = await authSequelize.query(`
        SELECT p.NAME
        FROM CGBRITO.PERMISSIONS p
        JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
        WHERE rp.ROLE_ID = :roleId
      `, {
        replacements: { roleId: user.ROLE_ID },
        type: 'SELECT'
      });

      // Corregir el procesamiento de la respuesta de Sequelize
      permissions = Array.isArray(permissionsResult) ? permissionsResult : [permissionsResult];
      
      // Debug: mostrar cuántos permisos se encontraron
      console.log(`🔐 Permisos encontrados para ${username}: ${permissions.length}`);
      if (permissions.length > 0) {
        console.log(`   Primeros 5 permisos: ${permissions.slice(0, 5).map((p: any) => p?.NAME || 'undefined').join(', ')}`);
      }
    } catch (error) {
      console.log('⚠️ No se pudieron obtener permisos, usando array vacío');
      console.log('   Error:', error.message);
      permissions = [];
    }

    // Generar token JWT
    const token = signToken({
      id: user.ID,
      role: user.ROLE_NAME,
    });

    console.log(`✅ Login exitoso para usuario: ${username}`);
    console.log(`   Token generado: ${token.substring(0, 20)}...`);

    // Log de auditoría
    await logAuditEvent(user.ID, 'login_success', 'auth', null, {
      ip_address: ipAddress,
      user_agent: userAgent
    }, ipAddress, userAgent);

    return {
      message: "Login exitoso",
      id: user.ID,
      username: user.USERNAME,
      email: user.EMAIL,
      firstName: user.FIRST_NAME,
      lastName: user.LAST_NAME,
      role: user.ROLE_NAME,
      permissions: permissions.filter((p: any) => p && p.NAME).map((p: any) => p.NAME),
      token,
    };
  } catch (err) {
    console.error("[loginUser] Error:", err);
    return { error: "Error interno del servidor" };
  }
}

export async function logoutUser(
  userId: string,
  token: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ message: string } | { error: string }> {
  try {
    console.log(`🔍 Cerrando sesión para usuario: ${userId}`);

    // Ya no manejamos sesiones en la base de datos, solo log de auditoría
    console.log(`✅ Sesión cerrada para usuario: ${userId}`);

    // Log de auditoría
    await logAuditEvent(userId, 'logout', 'auth', null, {
      ip_address: ipAddress,
      user_agent: userAgent
    }, ipAddress, userAgent);

    return { message: "Sesión cerrada exitosamente" };
  } catch (err) {
    console.error("[logoutUser] Error:", err);
    return { error: "Error al cerrar sesión" };
  }
}

export async function verifySession(
  token: string,
  ipAddress?: string
): Promise<{ valid: boolean; user?: any; error?: string }> {
  try {
    // Verificar JWT directamente en lugar de usar tabla SESSIONS
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'default-secret';
    
    try {
      const decoded = jwt.verify(token, secret);

      // Buscar usuario en la base de datos para verificar que aún existe
      const [users] = await authSequelize.query(`
        SELECT u.ID, u.USERNAME, u.EMAIL, u.FIRST_NAME, u.LAST_NAME, u.ROLE_ID, r.NAME as ROLE_NAME
        FROM CGBRITO.USERS u
        JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
        WHERE u.ID = :userId AND u.STATUS = 'active'
      `, {
        replacements: { userId: decoded.id },
        type: 'SELECT'
      });

      if (!users || users.length === 0) {
        return { valid: false, error: "Usuario no encontrado o inactivo" };
      }

      const user = users[0] as any; // Type assertion para evitar errores de TypeScript

      // Obtener permisos del rol del usuario
      let permissions: string[] = [];
      try {
        const permsResult = await authSequelize.query(`
          SELECT p.NAME
          FROM CGBRITO.PERMISSIONS p
          JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
          WHERE rp.ROLE_ID = :roleId
        `, {
          replacements: { roleId: user.ROLE_ID },
          type: 'SELECT'
        });

        const rows = Array.isArray(permsResult) ? permsResult : [permsResult];
        permissions = rows
          .map((r: any) => (Array.isArray(r) ? r : r))
          .flat()
          .filter((p: any) => p && (p.NAME || p.name))
          .map((p: any) => p.NAME || p.name);
      } catch (permError: any) {
        console.log('⚠️ No se pudieron obtener permisos en verifySession:', permError?.message);
        permissions = [];
      }

      return { 
        valid: true, 
        user: {
          id: user.ID,
          username: user.USERNAME,
          email: user.EMAIL,
          firstName: user.FIRST_NAME,
          lastName: user.LAST_NAME,
          role: user.ROLE_NAME,
          permissions
        }
      };
    } catch (jwtError) {
      return { valid: false, error: "Token inválido o expirado" };
    }
  } catch (err) {
    console.error("[verifySession] Error:", err);
    return { valid: false, error: "Error verificando sesión" };
  }
}

async function logAuditEvent(
  userId: string | null,
  action: string,
  resource: string,
  resourceId: string | null,
  details: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    // Verificar si la tabla AUDIT_LOGS existe antes de intentar insertar
    const tableExists = await authSequelize.query(`
      SELECT COUNT(*) AS TABLE_COUNT
      FROM user_tables 
      WHERE table_name = 'AUDIT_LOGS'
    `, { type: 'SELECT' });

    let count = 0;
    try {
      const row: any = Array.isArray(tableExists) && tableExists.length > 0 ? (tableExists as any)[0] : null;
      if (Array.isArray(row)) {
        count = Number(row[0] ?? 0);
      } else if (row) {
        count = Number(row.TABLE_COUNT ?? row.table_count ?? Object.values(row)[0] ?? 0);
      }
    } catch {
      count = 0;
    }

    if (!count || Number(count) === 0) {
      // La tabla no existe, solo log en consola
      console.log(`📝 [AUDIT] ${action} en ${resource} por usuario ${userId} - IP: ${ipAddress}`);
      return;
    }
    
    // La tabla existe, insertar log
    await authSequelize.query(`
      INSERT INTO CGBRITO.AUDIT_LOGS (USER_ID, ACTION_NAME, RESOURCE_NAME, RESOURCE_ID, DETAILS, IP_ADDRESS, USER_AGENT)
      VALUES (:userId, :action, :resource, :resourceId, :details, :ipAddress, :userAgent)
    `, {
      replacements: {
        userId,
        action,
        resource,
        resourceId,
        details: JSON.stringify(details),
        ipAddress,
        userAgent
      },
      type: 'INSERT'
    });
  } catch (err) {
    // Si hay cualquier error, solo log en consola
    console.log(`📝 [AUDIT] ${action} en ${resource} por usuario ${userId} - IP: ${ipAddress}`);
    console.error("[logAuditEvent] Error:", err);
  }
}
