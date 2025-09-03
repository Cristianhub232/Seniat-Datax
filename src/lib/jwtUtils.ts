
import jwt from 'jsonwebtoken';

// En modo desarrollo, usar un valor por defecto si JWT_SECRET no está disponible
const SECRET = process.env.JWT_SECRET || 'seniat-jwt-secret-key-2024';
const isDev = process.env.NODE_ENV !== "production";

interface TokenPayload {
  id: string;
  role: string;
  iat?: number;
  expiresIn?: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: isDev ? "12h" : "1h" });
}

// ✅ Esta función ahora retorna el payload decodificado o null
export function verifyToken(token: string): TokenPayload | null {
  try {
    if (!SECRET) {
      console.error('❌ JWT_SECRET no está configurado');
      return null;
    }
    
    const decoded = jwt.verify(token, SECRET) as TokenPayload;
    console.log('✅ Token verificado correctamente:', { id: decoded.id, role: decoded.role });
    return decoded;
  } catch (err) {
    console.error('❌ Error verificando JWT:', err);
    return null;
  }
}



