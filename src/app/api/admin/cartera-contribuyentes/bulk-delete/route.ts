import { NextRequest, NextResponse } from 'next/server';
import { authSequelize } from '@/lib/db';
import { verifyToken } from '@/lib/jwtUtils';

// DELETE - Eliminar múltiples contribuyentes
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  }
  
  const tokenPayload = verifyToken(token);
  if (!tokenPayload) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
  }

  try {
    const { ids } = await req.json();
    
    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 IDs recibidos para eliminación masiva:', ids);
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de IDs válido' },
        { status: 400 }
      );
    }

    // Validar que todos los IDs sean strings válidos
    const validIds = ids.filter(id => typeof id === 'string' && id.trim().length > 0);
    
    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Eliminación masiva iniciada:', ids.length, 'IDs');
    }
    
    if (validIds.length === 0) {
      console.log('❌ No se encontraron IDs válidos');
      return NextResponse.json(
        { error: 'No se proporcionaron IDs válidos' },
        { status: 400 }
      );
    }

    // Limitar la cantidad de IDs para evitar problemas de rendimiento
    const maxIds = 100;
    let finalIds = validIds;
    if (validIds.length > maxIds) {
      console.log(`⚠️ Demasiados IDs (${validIds.length}), limitando a ${maxIds}`);
      finalIds = validIds.slice(0, maxIds);
    }
    
    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 IDs finales después del límite:', finalIds.length);
      console.log('🔍 Primeros 3 IDs finales:', finalIds.slice(0, 3));
    }

    const userRole = tokenPayload.role;
    const userId = tokenPayload.id;

    // Verificar que tenemos IDs válidos antes de generar SQL
    if (finalIds.length === 0) {
      console.log('❌ No hay IDs válidos para procesar');
      return NextResponse.json(
        { error: 'No hay IDs válidos para procesar' },
        { status: 400 }
      );
    }

        // Obtener los contribuyentes que se van a eliminar usando una estrategia diferente
    let contribuyentes: any[] = [];
    
    // Usar concatenación directa pero segura (escapando comillas)
    const escapedIds = finalIds.map(id => `'${id.replace(/'/g, "''")}'`).join(',');
    const sql = `
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      WHERE ID IN (${escapedIds})
    `;
    
    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Procesando ${finalIds.length} contribuyentes`);
    }
    
    try {
      const result = await authSequelize.query(sql, {
        type: 'SELECT'
      }) as any[];
      
      contribuyentes = result;
    } catch (error) {
      console.error('❌ Error en consulta:', error);
      return NextResponse.json(
        { error: 'Error procesando contribuyentes' },
        { status: 500 }
      );
    }
    
    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Contribuyentes encontrados:', contribuyentes.length);
    }

    if (contribuyentes.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron contribuyentes para eliminar' },
        { status: 404 }
      );
    }

    // Verificar permisos para cada contribuyente
    const contribuyentesAEliminar = [];
    const contribuyentesSinPermiso = [];

    for (const contribuyente of contribuyentes) {
      // Solo el usuario que lo creó o un admin puede eliminarlo
      if (userRole === 'ADMIN' || contribuyente.USUARIO_ID === userId) {
        contribuyentesAEliminar.push(contribuyente);
      } else {
        contribuyentesSinPermiso.push(contribuyente);
      }
    }

    if (contribuyentesAEliminar.length === 0) {
      return NextResponse.json(
        { 
          error: 'No tienes permisos para eliminar ninguno de los contribuyentes seleccionados',
          details: 'Solo puedes eliminar contribuyentes que hayas creado tú mismo'
        },
        { status: 403 }
      );
    }

    // Eliminar los contribuyentes autorizados
    const idsAEliminar = contribuyentesAEliminar.map(c => c.ID);
    
    if (idsAEliminar.length > 0) {
          // Usar concatenación directa pero segura (escapando comillas)
    const escapedDeleteIds = idsAEliminar.map(id => `'${id.replace(/'/g, "''")}'`).join(',');
    const deleteSql = `
      DELETE FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      WHERE ID IN (${escapedDeleteIds})
    `;
    
    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Eliminando ${idsAEliminar.length} contribuyentes`);
    }
    
    try {
      await authSequelize.query(deleteSql, {
        type: 'DELETE'
      });
    } catch (error) {
      console.error('❌ Error eliminando contribuyentes:', error);
      return NextResponse.json(
        { error: 'Error eliminando contribuyentes' },
        { status: 500 }
      );
    }
    }

    console.log(`🔍 Eliminación masiva: ${contribuyentesAEliminar.length} contribuyentes eliminados por usuario ${(tokenPayload as any).username || tokenPayload.id}`);

    const result = {
      message: 'Eliminación masiva completada',
      eliminados: contribuyentesAEliminar.length,
      sinPermiso: contribuyentesSinPermiso.length,
      contribuyentesEliminados: contribuyentesAEliminar.map(c => ({
        id: c.ID,
        rif: c.RIF,
        tipo: c.TIPO_CONTRIBUYENTE
      })),
      contribuyentesSinPermiso: contribuyentesSinPermiso.map(c => ({
        id: c.ID,
        rif: c.RIF,
        tipo: c.TIPO_CONTRIBUYENTE
      }))
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('❌ Error en eliminación masiva:', error);
    return NextResponse.json(
      { error: 'Error en eliminación masiva', details: error.message },
      { status: 500 }
    );
  }
} 