import { NextRequest, NextResponse } from "next/server";
import { authSequelize } from "@/lib/db";
import { verifyToken } from "@/lib/jwtUtils";
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
    }
    
    const tokenPayload = verifyToken(token);
    if (!tokenPayload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
    }

    // Verificar si el usuario es admin o ejecutivo
    const userRole = tokenPayload.role;
    const isAdmin = userRole === 'ADMIN';
    const isEjecutivo = userRole === 'Ejecutivo';
    
    if (!isAdmin && !isEjecutivo) {
      return NextResponse.json({ error: 'Acceso denegado. Solo administradores y ejecutivos pueden acceder a este módulo.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const fechaInicio = searchParams.get("fechaInicio");
    const fechaFin = searchParams.get("fechaFin");
    const rif = searchParams.get("rif");
    const banco = searchParams.get("banco");
    const dependencia = searchParams.get("dependencia");
    const rifValido = searchParams.get("rifValido");

    // Validar que se proporcionen las fechas obligatorias
    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        { error: "Las fechas de inicio y fin son obligatorias" },
        { status: 400 }
      );
    }

    // Construir la query base
    let query = `
      SELECT 
        cc.rif as "RIF",
        c.APELLIDO_CONTRIBUYENTE as "Apellido Contribuyente",
        mp.MONTO_TOTAL_PAGO as "Monto Total",
        mp.TIPO_DOCUMENTO_PAGO as "Tipo Documento",
        mp.FECHA_RECAUDACION_PAGO as "Fecha Recaudación",
        mp.NUMERO_DOCUMENTO_PAGO as "Número Documento",
        mp.BANCO_PAGO as "Banco",
        mp.PERIODO_PAGO as "Período",
        d.NOMBRE_DEPENDENCIA as "Dependencia",
        tc.DESCRIPCION_TIPO_CONTRIBUYENTE as "Tipo Contribuyente",
        c.ID_CONTRIBUYENTE as "ID Contribuyente",
        b.NOMBRE_BANCO as "Nombre Banco",
        f.DESCRIPCION_FORMULARIO as "Formulario",
        CASE WHEN c.ID_CONTRIBUYENTE IS NOT NULL THEN 'Válido' ELSE 'Inválido' END as "Estado RIF"
      FROM CGBRITO.CARTERA_CONTRIBUYENTES cc 
      LEFT JOIN DBO.MOVIMIENTO_PAGO mp ON mp.RIF_CONTRIBUYENTE_PAGO = cc.RIF
      LEFT JOIN DATOSCONTRIBUYENTE.CONTRIBUYENTE c ON cc.RIF = c.RIF_CONTRIBUYENTE
      LEFT JOIN DATOSCONTRIBUYENTE.DEPENDENCIA d ON mp.DEPENDENCIA_SECTOR_PAGO = d.CODIGO_DEPENDENCIA
      LEFT JOIN DATOSCONTRIBUYENTE.TIPO_CONTRIBUYENTE tc ON c.TIPO_CONTRIBUYENTE = tc.CODIGO_TIPO_CONTRIBUYENTE
      LEFT JOIN dbo.BANCO b ON mp.BANCO_PAGO = b.CODIGO_BANCO
      LEFT JOIN dbo.FORMULARIO f ON mp.TIPO_DOCUMENTO_PAGO = f.CODIGO_FORMULARIO
      WHERE mp.FECHA_RECAUDACION_PAGO IS NOT NULL
        AND mp.FECHA_RECAUDACION_PAGO >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')
        AND mp.FECHA_RECAUDACION_PAGO <= TO_DATE(:fechaFin, 'YYYY-MM-DD')
    `;

    const params: any = {
      fechaInicio: fechaInicio,
      fechaFin: fechaFin
    };

    // Agregar restricción por usuario ejecutivo
    if (isEjecutivo) {
      query += " AND cc.USUARIO_ID = :usuarioId";
      params.usuarioId = tokenPayload.id;
    }

    // Agregar filtros adicionales
    if (rif) {
      query += " AND cc.rif LIKE :rif";
      params.rif = `%${rif}%`;
    }

    if (banco && banco !== "TODOS") {
      query += " AND b.NOMBRE_BANCO = :banco";
      params.banco = banco;
    }

    if (dependencia && dependencia !== "TODAS") {
      query += " AND d.NOMBRE_DEPENDENCIA = :dependencia";
      params.dependencia = dependencia;
    }

    if (rifValido === "VALIDO") {
      query += " AND c.ID_CONTRIBUYENTE IS NOT NULL";
    } else if (rifValido === "INVALIDO") {
      query += " AND c.ID_CONTRIBUYENTE IS NULL";
    }

    query += " ORDER BY mp.FECHA_RECAUDACION_PAGO DESC";

    // Ejecutar la query
    const result = await authSequelize.query(query, {
      replacements: params,
      type: 'SELECT'
    });
    
    console.log('🔍 Debug - Estructura de result:', {
      type: typeof result,
      isArray: Array.isArray(result),
      length: result.length,
      result0Type: typeof result[0],
      result0IsArray: Array.isArray(result[0]),
      result0Length: result[0]?.length
    });
    
    // Asegurar que tenemos un array válido
    let pagosArray: any[] = [];
    if (Array.isArray(result) && result.length > 0 && result[0] && typeof result[0] === 'object' && (result[0] as any).rows) {
      // Sequelize envuelve el resultado de Oracle en un array
      pagosArray = (result[0] as any).rows;
      console.log('✅ Caso: Sequelize envuelto en array con .rows');
    } else if (result && typeof result === 'object' && (result as any).rows) {
      // Resultado directo de Oracle
      pagosArray = (result as any).rows;
      console.log('✅ Caso: Resultado directo de Oracle con .rows');
    } else if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
      // Array directo con filas de datos
      pagosArray = result;
      console.log('✅ Caso: Array directo con filas');
    } else if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'object' && !Array.isArray(result[0])) {
      // Array directo con objetos (ya en formato JSON)
      pagosArray = result;
      console.log('✅ Caso: Array directo con objetos JSON');
    } else {
      console.log('❌ No se pudo extraer array de resultados');
      pagosArray = [];
    }
    
    console.log('🔍 Debug - pagosArray:', {
      length: pagosArray.length,
      isArray: Array.isArray(pagosArray),
      hasMap: typeof pagosArray.map === 'function'
    });
    
    // Debug: Ver la estructura de los primeros elementos
    if (pagosArray.length > 0) {
      console.log('🔍 Debug - Primer elemento:', {
        type: typeof pagosArray[0],
        isArray: Array.isArray(pagosArray[0]),
        value: pagosArray[0],
        keys: typeof pagosArray[0] === 'object' ? Object.keys(pagosArray[0]) : 'N/A'
      });
      
      if (pagosArray.length > 1) {
        console.log('🔍 Debug - Segundo elemento:', {
          type: typeof pagosArray[1],
          isArray: Array.isArray(pagosArray[1]),
          value: pagosArray[1]
        });
      }
    }
    
    // Convertir los resultados a objetos JSON
    let pagos: any[] = [];
    
    if (pagosArray.length > 0 && Array.isArray(pagosArray[0])) {
      // Si cada elemento es un array (filas de datos)
      pagos = pagosArray.map(row => ({
        "RIF": row[0] || '',
        "Apellido Contribuyente": row[1] || '',
        "Monto Total": row[2] || 0,
        "Tipo Documento": row[3] || '',
        "Fecha Recaudación": row[4] ? new Date(row[4]).toLocaleDateString('es-ES') : '',
        "Número Documento": row[5] || '',
        "Banco": row[6] || '',
        "Período": row[7] || '',
        "Dependencia": row[8] || '',
        "Tipo Contribuyente": row[9] || '',
        "ID Contribuyente": row[10] || '',
        "Nombre Banco": row[11] || '',
        "Formulario": row[12] || '',
        "Estado RIF": row[10] ? 'Válido' : 'Inválido'
      }));
    } else if (pagosArray.length > 0 && typeof pagosArray[0] === 'object' && !Array.isArray(pagosArray[0])) {
      // Si cada elemento es un objeto (ya está en formato JSON)
      pagos = pagosArray.map(row => ({
        "RIF": row.RIF || row.rif || '',
        "Apellido Contribuyente": row["Apellido Contribuyente"] || row.apellidoContribuyente || '',
        "Monto Total": row["Monto Total"] || row.montoTotal || 0,
        "Tipo Documento": row["Tipo Documento"] || row.tipoDocumento || '',
        "Fecha Recaudación": row["Fecha Recaudación"] || row.fechaRecaudacion ? new Date(row["Fecha Recaudación"] || row.fechaRecaudacion).toLocaleDateString('es-ES') : '',
        "Número Documento": row["Número Documento"] || row.numeroDocumento || '',
        "Banco": row.Banco || row.banco || '',
        "Período": row.Período || row.periodo || '',
        "Dependencia": row.Dependencia || row.dependencia || '',
        "Tipo Contribuyente": row["Tipo Contribuyente"] || row.tipoContribuyente || '',
        "ID Contribuyente": row["ID Contribuyente"] || row.idContribuyente || '',
        "Nombre Banco": row["Nombre Banco"] || row.nombreBanco || '',
        "Formulario": row.Formulario || row.formulario || '',
        "Estado RIF": row["ID Contribuyente"] || row.idContribuyente ? 'Válido' : 'Inválido'
      }));
    } else {
      console.log('❌ Estructura de datos no reconocida');
      pagos = [];
    }
    
    console.log('🔍 Debug - Pagos convertidos:', {
      count: pagos.length,
      firstPago: pagos.length > 0 ? pagos[0] : 'N/A'
    });

    // Crear el archivo Excel
    const workbook = XLSX.utils.book_new();
    
    // Crear la hoja de datos
    const worksheet = XLSX.utils.json_to_sheet(pagos);
    
    // Ajustar el ancho de las columnas
    const columnWidths = [
      { wch: 15 }, // RIF
      { wch: 25 }, // Apellido Contribuyente
      { wch: 15 }, // Monto Total
      { wch: 15 }, // Tipo Documento
      { wch: 15 }, // Fecha Recaudación
      { wch: 20 }, // Número Documento
      { wch: 10 }, // Banco
      { wch: 10 }, // Período
      { wch: 25 }, // Dependencia
      { wch: 20 }, // Tipo Contribuyente
      { wch: 15 }, // ID Contribuyente
      { wch: 20 }, // Nombre Banco
      { wch: 25 }, // Formulario
      { wch: 10 }  // Estado RIF
    ];
    worksheet['!cols'] = columnWidths;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagos Ejecutados');

    // Generar el buffer del archivo
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Crear la respuesta con el archivo
    const response = new NextResponse(excelBuffer);
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', `attachment; filename="pagos-ejecutados-${fechaInicio}-${fechaFin}.xlsx"`);

    return response;

  } catch (error) {
    console.error("Error generando Excel de pagos ejecutados:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 