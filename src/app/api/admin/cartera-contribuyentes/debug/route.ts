import { NextRequest, NextResponse } from 'next/server';
import { authSequelize } from '@/lib/db';
import { verifyToken } from '@/lib/jwtUtils';

// GET - Debug endpoint para verificar consultas SQL
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }

    console.log('🔍 Debug - ID recibido:', id);
    console.log('🔍 Debug - Tipo de ID:', typeof id);
    console.log('🔍 Debug - Longitud del ID:', id.length);

    // Probar diferentes consultas
    const results: any = {
      id: id,
      type: typeof id,
      length: id.length,
      queries: {}
    };

    // 1. Consulta COUNT simple
    try {
      const [countResult] = await authSequelize.query(`
        SELECT COUNT(*) as count
        FROM CGBRITO.CARTERA_CONTRIBUYENTES 
        WHERE ID = ?
      `, {
        replacements: [id],
        type: 'SELECT'
      });
      
      results.queries.count = {
        success: true,
        result: countResult,
        count: (countResult[0] as any)?.count
      };
    } catch (error) {
      results.queries.count = {
        success: false,
        error: error.message
      };
    }

    // 2. Consulta SELECT simple
    try {
      const [selectResult] = await authSequelize.query(`
        SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
        FROM CGBRITO.CARTERA_CONTRIBUYENTES 
        WHERE ID = ?
      `, {
        replacements: [id],
        type: 'SELECT'
      });
      
      results.queries.select = {
        success: true,
        result: selectResult,
        length: selectResult.length
      };
    } catch (error) {
      results.queries.select = {
        success: false,
        error: error.message
      };
    }

    // 3. Consulta con LIKE
    try {
      const [likeResult] = await authSequelize.query(`
        SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
        FROM CGBRITO.CARTERA_CONTRIBUYENTES 
        WHERE ID LIKE ?
      `, {
        replacements: [`%${id}%`],
        type: 'SELECT'
      });
      
      results.queries.like = {
        success: true,
        result: likeResult,
        length: likeResult.length
      };
    } catch (error) {
      results.queries.like = {
        success: false,
        error: error.message
      };
    }

    // 4. Consulta sin WHERE para ver todos los IDs
    try {
      const [allResult] = await authSequelize.query(`
        SELECT ID, RIF
        FROM CGBRITO.CARTERA_CONTRIBUYENTES 
        WHERE ROWNUM <= 5
      `, {
        type: 'SELECT'
      });
      
      results.queries.all = {
        success: true,
        result: allResult,
        length: allResult.length
      };
    } catch (error) {
      results.queries.all = {
        success: false,
        error: error.message
      };
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('❌ Error en debug:', error);
    return NextResponse.json(
      { error: 'Error en debug', details: error.message },
      { status: 500 }
    );
  }
} 