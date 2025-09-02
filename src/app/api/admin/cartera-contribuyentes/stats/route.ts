import { NextRequest, NextResponse } from 'next/server';
import { authSequelize } from '@/lib/db';
import { verifyToken } from '@/lib/jwtUtils';

// GET - Obtener estadísticas de contribuyentes
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
    const userRole = tokenPayload.role;
    const userId = tokenPayload.id;

    // Construir la consulta con filtro por rol
    let sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN TIPO_CONTRIBUYENTE = 'NATURAL' THEN 1 ELSE 0 END) as naturales,
        SUM(CASE WHEN TIPO_CONTRIBUYENTE = 'JURIDICO' THEN 1 ELSE 0 END) as juridicos,
        SUM(CASE WHEN TIPO_CONTRIBUYENTE = 'GOBIERNO' THEN 1 ELSE 0 END) as gobierno,
        SUM(CASE WHEN TIPO_CONTRIBUYENTE = 'CONSEJO_COMUNAL' THEN 1 ELSE 0 END) as consejosComunales
      FROM CGBRITO.CARTERA_CONTRIBUYENTES
    `;

    const conditions = [];
    const params: any[] = [];

    // Aplicar filtro por rol del usuario
    if (userRole === 'Ejecutivo' || userRole === 'Auditor Jefe') {
      conditions.push('USUARIO_ID = ?');
      params.push(userId);
    }
    // Si es ADMIN, no se aplica filtro (ve todas las estadísticas)

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    const [stats] = await authSequelize.query(sql, {
      replacements: params,
      type: 'SELECT'
    });

    const result = Array.isArray(stats) ? stats[0] : stats;

    return NextResponse.json({
      total: parseInt((result as any).TOTAL) || 0,
      naturales: parseInt((result as any).NATURALES) || 0,
      juridicos: parseInt((result as any).JURIDICOS) || 0,
      gobierno: parseInt((result as any).GOBIERNO) || 0,
      consejosComunales: parseInt((result as any).CONSEJOSCOMUNALES) || 0
    }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/cartera-contribuyentes/stats] Error:', error);
    return NextResponse.json({ error: 'Error obteniendo estadísticas' }, { status: 500 });
  }
} 