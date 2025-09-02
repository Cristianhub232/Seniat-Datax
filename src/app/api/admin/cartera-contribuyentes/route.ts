import { NextRequest, NextResponse } from 'next/server';
import { authSequelize } from '@/lib/db';
import { verifyToken } from '@/lib/jwtUtils';

// Función para validar RIF
function validateRIF(rif: string): { isValid: boolean; tipo?: string; error?: string } {
  // Verificar longitud exacta de 10 caracteres
  if (rif.length !== 10) {
    return { 
      isValid: false, 
      error: `El RIF debe tener exactamente 10 caracteres. El RIF proporcionado "${rif}" tiene ${rif.length} caracteres. Recuerde que el formato debe ser: [J/V/E/P/G/C] + 9 dígitos numéricos.` 
    };
  }

  // Verificar que el primer carácter sea válido
  const firstChar = rif.charAt(0).toUpperCase();
  const validChars = ['J', 'V', 'E', 'P', 'G', 'C'];
  
  if (!validChars.includes(firstChar)) {
    return { 
      isValid: false, 
      error: `El primer carácter del RIF debe ser J, V, E, P, G o C. El carácter "${rif.charAt(0)}" no es válido. Recuerde: J=Jurídico, V=Natural, E=Natural, P=Natural, G=Gobierno, C=Consejo Comunal.` 
    };
  }

  // Verificar que los demás caracteres sean números
  const numbers = rif.substring(1);
  if (!/^\d{9}$/.test(numbers)) {
    return { 
      isValid: false, 
      error: `Los últimos 9 caracteres del RIF deben ser números. El RIF "${rif}" contiene caracteres no numéricos después del primer carácter. Ejemplo de formato válido: V123456789.` 
    };
  }

  // Determinar tipo de contribuyente
  let tipo: string;
  switch (firstChar) {
    case 'V':
    case 'E':
      tipo = 'NATURAL';
      break;
    case 'J':
      tipo = 'JURIDICO';
      break;
    case 'G':
      tipo = 'GOBIERNO';
      break;
    case 'C':
      tipo = 'CONSEJO_COMUNAL';
      break;
    case 'P':
      tipo = 'NATURAL'; // Pasaporte se considera natural
      break;
    default:
      tipo = 'NATURAL';
  }

  return { isValid: true, tipo };
}

// GET - Obtener todos los contribuyentes
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
    const rif = searchParams.get('rif');
    const tipo = searchParams.get('tipo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const userRole = tokenPayload.role;
    const userId = tokenPayload.id;

    // Validar parámetros de paginación
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit)); // Máximo 100 por página
    const offset = (validPage - 1) * validLimit;

    let sql = `
      SELECT 
        c.ID,
        c.RIF,
        c.TIPO_CONTRIBUYENTE,
        c.USUARIO_ID,
        c.CREATED_AT,
        c.UPDATED_AT,
        u.USERNAME,
        u.FIRST_NAME,
        u.LAST_NAME
      FROM CGBRITO.CARTERA_CONTRIBUYENTES c
      LEFT JOIN CGBRITO.USERS u ON c.USUARIO_ID = u.ID
    `;
    
    const conditions = [];
    const params: any[] = [];
    
    // Aplicar filtro por rol del usuario
    if (userRole === 'Ejecutivo' || userRole === 'Auditor Jefe') {
      conditions.push('c.USUARIO_ID = ?');
      params.push(userId);
    }
    // Si es ADMIN, no se aplica filtro (ve todos los contribuyentes)
    
    if (rif) {
      conditions.push('c.RIF LIKE ?');
      params.push(`%${rif}%`);
    }
    
    if (tipo) {
      conditions.push('c.TIPO_CONTRIBUYENTE = ?');
      params.push(tipo);
    }
    
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    sql += ' ORDER BY c.CREATED_AT DESC';

    // Obtener el total de registros para la paginación
    const countSql = sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await authSequelize.query(countSql, {
      replacements: params,
      type: 'SELECT'
    }) as any[];
    const totalRecords = countResult[0]?.total || 0;

    // Aplicar paginación
    sql += ` OFFSET ${offset} ROWS FETCH NEXT ${validLimit} ROWS ONLY`;

    const result = await authSequelize.query(sql, {
      replacements: params,
      type: 'SELECT'
    });

    const contribuyentes = Array.isArray(result) ? result : [result];

    // Transformar los datos para que coincidan con el frontend
    const transformedContribuyentes = contribuyentes.map((contribuyente: any) => ({
      id: contribuyente.ID,
      rif: contribuyente.RIF,
      tipoContribuyente: contribuyente.TIPO_CONTRIBUYENTE,
      usuarioId: contribuyente.USUARIO_ID,
      createdAt: contribuyente.CREATED_AT,
      updatedAt: contribuyente.UPDATED_AT,
      usuario: contribuyente.USERNAME ? {
        username: contribuyente.USERNAME,
        firstName: contribuyente.FIRST_NAME,
        lastName: contribuyente.LAST_NAME
      } : null
    }));

    // Calcular información de paginación
    const totalPages = Math.ceil(totalRecords / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;

    return NextResponse.json({
      data: transformedContribuyentes,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalRecords,
        limit: validLimit,
        hasNextPage,
        hasPrevPage
      }
    }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/cartera-contribuyentes] Error:', error);
    return NextResponse.json({ error: 'Error obteniendo contribuyentes' }, { status: 500 });
  }
}

// POST - Crear nuevo contribuyente
export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  }
  
  const tokenPayload = verifyToken(token);
  if (!tokenPayload) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
  }
  
  try {
    const { rif } = await req.json();

    if (!rif) {
      return NextResponse.json(
        { error: 'El RIF es requerido' },
        { status: 400 }
      );
    }

    // Validar RIF
    const validation = validateRIF(rif);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const [existingContribuyente] = await authSequelize.query(`
      SELECT ID FROM CGBRITO.CARTERA_CONTRIBUYENTES WHERE RIF = ?
    `, {
      replacements: [rif.toUpperCase()],
      type: 'SELECT'
    });

    if (existingContribuyente && existingContribuyente.length > 0) {
      return NextResponse.json(
        { 
          error: `RIF duplicado en base de datos. El RIF ${rif.toUpperCase()} ya está registrado en el sistema.`,
          details: 'Recuerde que el RIF debe tener exactamente 10 dígitos y no puede estar duplicado en la base de datos.',
          rif: rif.toUpperCase(),
          type: 'DUPLICATE_RIF'
        },
        { status: 409 }
      );
    }

    // 🔒 Verificar límite de contribuyentes para usuarios con rol "Ejecutivo"
    const userRole = tokenPayload.role;
    const userId = tokenPayload.id;
    
    if (userRole === 'Ejecutivo') {
      // Contar contribuyentes actuales del usuario
      const [currentCount] = await authSequelize.query(`
        SELECT COUNT(*) as count FROM CGBRITO.CARTERA_CONTRIBUYENTES WHERE USUARIO_ID = ?
      `, {
        replacements: [userId],
        type: 'SELECT'
      });
      
      const count = Array.isArray(currentCount) ? (currentCount[0] as any)?.COUNT : (currentCount as any)?.COUNT;
      
      if (count >= 1000) {
        return NextResponse.json(
          { 
            error: 'Límite alcanzado. Los usuarios con rol Ejecutivo no pueden exceder de 1000 contribuyentes en su cartera.',
            currentCount: count,
            limit: 1000
          },
          { status: 403 }
        );
      }
    }

    // Crear el contribuyente
    await authSequelize.query(`
      INSERT INTO CGBRITO.CARTERA_CONTRIBUYENTES (RIF, TIPO_CONTRIBUYENTE, USUARIO_ID, CREATED_AT, UPDATED_AT)
      VALUES (?, ?, ?, SYSDATE, SYSDATE)
    `, {
      replacements: [rif.toUpperCase(), validation.tipo, userId],
      type: 'INSERT'
    });

    return NextResponse.json(
      { message: 'Contribuyente agregado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/admin/cartera-contribuyentes] Error:', error);
    return NextResponse.json(
      { error: 'Error agregando contribuyente' },
      { status: 500 }
    );
  }
}

// POST - Cargar CSV
export async function PUT(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  }
  
  const tokenPayload = verifyToken(token);
  if (!tokenPayload) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
  }
  
  try {
    const { rifs } = await req.json();

    if (!Array.isArray(rifs)) {
      return NextResponse.json(
        { error: 'Se requiere un array de RIFs' },
        { status: 400 }
      );
    }

    // 🔒 Verificar límite de contribuyentes para usuarios con rol "Ejecutivo"
    const userRole = tokenPayload.role;
    const userId = tokenPayload.id;
    
    if (userRole === 'Ejecutivo') {
      // Contar contribuyentes actuales del usuario
      const [currentCount] = await authSequelize.query(`
        SELECT COUNT(*) as count FROM CGBRITO.CARTERA_CONTRIBUYENTES WHERE USUARIO_ID = ?
      `, {
        replacements: [userId],
        type: 'SELECT'
      });
      
      const count = Array.isArray(currentCount) ? (currentCount[0] as any)?.COUNT : (currentCount as any)?.COUNT;
      const availableSlots = 1000 - count;
      
      if (count >= 1000) {
        return NextResponse.json(
          { 
            error: 'Límite alcanzado. Los usuarios con rol Ejecutivo no pueden exceder de 1000 contribuyentes en su cartera.',
            currentCount: count,
            limit: 1000
          },
          { status: 403 }
        );
      }
      
      // Verificar si la carga masiva excedería el límite
      if (rifs.length > availableSlots) {
        return NextResponse.json(
          { 
            error: `No se pueden cargar ${rifs.length} contribuyentes. Solo quedan ${availableSlots} espacios disponibles.`,
            currentCount: count,
            limit: 1000,
            availableSlots,
            requestedCount: rifs.length
          },
          { status: 403 }
        );
      }
    }

    const results = {
      success: 0,
      errors: [] as Array<{ rif: string; error: string }>
    };

    for (const rif of rifs) {
      try {
        // Validar RIF
        const validation = validateRIF(rif);
        if (!validation.isValid) {
          results.errors.push({ rif, error: validation.error! });
          continue;
        }

        // Verificar si ya existe
        const [existingContribuyente] = await authSequelize.query(`
          SELECT ID FROM CGBRITO.CARTERA_CONTRIBUYENTES WHERE RIF = ?
        `, {
          replacements: [rif.toUpperCase()],
          type: 'SELECT'
        });

        if (existingContribuyente && existingContribuyente.length > 0) {
          results.errors.push({ 
            rif, 
            error: `RIF duplicado en base de datos. El RIF ${rif.toUpperCase()} ya está registrado en el sistema. Recuerde que el RIF debe tener exactamente 10 dígitos y no puede estar duplicado.`
          });
          continue;
        }

        // Crear el contribuyente
        await authSequelize.query(`
          INSERT INTO CGBRITO.CARTERA_CONTRIBUYENTES (RIF, TIPO_CONTRIBUYENTE, USUARIO_ID, CREATED_AT, UPDATED_AT)
          VALUES (?, ?, ?, SYSDATE, SYSDATE)
        `, {
          replacements: [rif.toUpperCase(), validation.tipo, userId],
          type: 'INSERT'
        });

        results.success++;
      } catch (error) {
        results.errors.push({ rif, error: 'Error interno del servidor' });
      }
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/admin/cartera-contribuyentes] Error:', error);
    return NextResponse.json(
      { error: 'Error procesando CSV' },
      { status: 500 }
    );
  }
} 