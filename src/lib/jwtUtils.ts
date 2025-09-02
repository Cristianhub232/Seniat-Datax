
import jwt from 'jsonwebtoken';

const SECRET_ENV = process.env.JWT_SECRET;
if (!SECRET_ENV) {
  throw new Error('JWT_SECRET environment variable is not defined');
}
const SECRET: string = SECRET_ENV;
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
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch (err) {
    console.error('❌ Error verificando JWT:', err);
    return null;
  }
}



