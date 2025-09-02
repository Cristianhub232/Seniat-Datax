import { NextRequest, NextResponse } from 'next/server';
import { authSequelize } from '@/lib/db';
import { verifyToken } from '@/lib/jwtUtils';

// DELETE - Eliminar contribuyente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  }
  
  const tokenPayload = verifyToken(token);
  if (!tokenPayload) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Obtener los datos del contribuyente
    const existingContribuyente = await authSequelize.query(`
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      WHERE ID = ?
    `, {
      replacements: [id],
      type: 'SELECT'
    });

    // Verificar si se encontró el contribuyente
    if (!existingContribuyente || (existingContribuyente as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Contribuyente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener el primer resultado
    const contribuyente = existingContribuyente[0] as any;
    
    const userRole = tokenPayload.role;
    const userId = tokenPayload.id;

    // Verificar permisos: solo el usuario que lo creó o un admin puede eliminarlo
    if (userRole !== 'ADMIN' && contribuyente.USUARIO_ID !== userId) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este contribuyente' },
        { status: 403 }
      );
    }

    // Eliminar el contribuyente
    await authSequelize.query(`
      DELETE FROM CGBRITO.CARTERA_CONTRIBUYENTES WHERE ID = ?
    `, {
      replacements: [id],
      type: 'DELETE'
    });

    console.log(`🔍 Contribuyente eliminado: ${contribuyente.RIF} por usuario ${(tokenPayload as any).username || tokenPayload.id}`);

    return NextResponse.json(
      { 
        message: 'Contribuyente eliminado exitosamente',
        contribuyente: {
          rif: contribuyente.RIF,
          tipo: contribuyente.TIPO_CONTRIBUYENTE
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error eliminando contribuyente:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Error eliminando contribuyente', details: error.message },
      { status: 500 }
    );
  }
} 