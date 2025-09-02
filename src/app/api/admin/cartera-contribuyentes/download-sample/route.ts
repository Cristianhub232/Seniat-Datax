import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwtUtils';

// GET - Descargar CSV de prueba
export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  }
  
  const tokenPayload = verifyToken(token);
  if (!tokenPayload) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
  }
  
  try {
    // Crear contenido del CSV de prueba
    const csvContent = `RIF_CONTRIBUYENTE
V123456789
J987654321
E111222333
G444555666
C777888999
P123456789
V987654321
J111222333
E444555666
G777888999`;

    // Crear respuesta con headers para descarga
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="cartera_contribuyentes_ejemplo.csv"',
      },
    });

    return response;
  } catch (error) {
    console.error('[GET /api/admin/cartera-contribuyentes/download-sample] Error:', error);
    return NextResponse.json({ error: 'Error generando CSV de prueba' }, { status: 500 });
  }
} 