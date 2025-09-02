// src/app/api/admin/users/[id]/hard-delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authSequelize } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id || id.trim() === '') {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    // Primero verificar si el usuario existe
    const [existingUser] = await authSequelize.query(
      'SELECT ID FROM CGBRITO.USERS WHERE ID = ?',
      {
        replacements: [id],
        type: 'SELECT'
      }
    );

    if (!existingUser || (Array.isArray(existingUser) && existingUser.length === 0)) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar registros relacionados primero
    console.log(`🗑️ Eliminando registros relacionados para usuario: ${id}`);
    
    // Eliminar registros de auditoría
    try {
      await authSequelize.query(
        'DELETE FROM CGBRITO.AUDIT_LOGS WHERE USER_ID = ?',
        {
          replacements: [id],
          type: 'DELETE'
        }
      );
      console.log('✅ Registros de auditoría eliminados');
    } catch (error) {
      console.log('⚠️ No se pudieron eliminar registros de auditoría:', error.message);
    }

    // Eliminar sesiones
    try {
      await authSequelize.query(
        'DELETE FROM CGBRITO.SESSIONS WHERE USER_ID = ?',
        {
          replacements: [id],
          type: 'DELETE'
        }
      );
      console.log('✅ Sesiones eliminadas');
    } catch (error) {
      console.log('⚠️ No se pudieron eliminar sesiones:', error.message);
    }

    // Eliminar el usuario
    await authSequelize.query(
      'DELETE FROM CGBRITO.USERS WHERE ID = ?',
      {
        replacements: [id],
        type: 'DELETE'
      }
    );

    return NextResponse.json(
      { message: 'Usuario eliminado exitosamente' },
      { status: 200 }
    );
  } catch (err) {
    console.error('[DELETE hard /admin/users/:id] Error:', err);
    return NextResponse.json(
      { error: 'Error eliminando usuario' },
      { status: 500 }
    );
  }
}
