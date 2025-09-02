import { NextRequest, NextResponse } from 'next/server';
import { authSequelize } from '@/lib/db';
import { verifyToken } from '@/lib/jwtUtils';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  
  try {
    // Verificar token
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Token inválido' }, { status: 403 });

    // Obtener menús de la tabla real de Oracle
    const menus = await authSequelize.query(`
      SELECT 
        ID as id,
        NAME as name,
        PATH as route,
        ICON as icon,
        PARENT_ID as parent_id,
        ORDER_INDEX as order_index,
        IS_ACTIVE as is_active
      FROM CGBRITO.MENUS 
      WHERE IS_ACTIVE = 1 
      ORDER BY ORDER_INDEX
    `, { type: 'SELECT' });

    console.log(`[GET /api/admin/menus] Encontrados ${menus.length} menús`);
    
    return NextResponse.json(menus, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/menus] Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 