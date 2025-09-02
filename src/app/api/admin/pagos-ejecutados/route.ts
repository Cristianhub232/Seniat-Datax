import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwtUtils";
import oracledb from "oracledb";

// Configuración Oracle para SENIAT
const oracleConfig = {
  host: process.env.ORACLE_HOST || '172.16.32.73',
  port: parseInt(process.env.ORACLE_PORT || '1521'),
  database: process.env.ORACLE_DATABASE || 'DWREPO',
  username: process.env.ORACLE_USERNAME || 'CGBRITO',
  password: process.env.ORACLE_PASSWORD || 'cgkbrito',
  schema: process.env.ORACLE_SCHEMA || 'CGBRITO'
};

// Configuración de la conexión Oracle
const dbConfig = {
  connectString: `${oracleConfig.host}:${oracleConfig.port}/${oracleConfig.database}`,
  user: oracleConfig.username,
  password: oracleConfig.password
};

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

    // Inicializar parámetros
    const params: any = {
      fechaInicio: fechaInicio,
      fechaFin: fechaFin
    };

    // Construir la query real con Oracle
    let query = `
      SELECT 
        cc.rif,
        c.APELLIDO_CONTRIBUYENTE,
        mp.MONTO_TOTAL_PAGO,
        mp.TIPO_DOCUMENTO_PAGO,
        mp.FECHA_RECAUDACION_PAGO,
        mp.NUMERO_DOCUMENTO_PAGO,
        mp.BANCO_PAGO,
        mp.PERIODO_PAGO,
        d.NOMBRE_DEPENDENCIA,
        tc.DESCRIPCION_TIPO_CONTRIBUYENTE,
        c.ID_CONTRIBUYENTE,
        b.NOMBRE_BANCO,
        f.DESCRIPCION_FORMULARIO
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

    // Filtro de RIF válido (simplificado - se puede mejorar)
    if (rifValido && rifValido !== "TODOS") {
      if (rifValido === "VALIDO") {
        query += " AND mp.MONTO_TOTAL_PAGO > 0";
      } else if (rifValido === "INVALIDO") {
        query += " AND mp.MONTO_TOTAL_PAGO = 0";
      }
    }

    query += " ORDER BY mp.FECHA_RECAUDACION_PAGO DESC";

    // Ejecutar query en Oracle
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      const result = await connection.execute(query, params);
      
      // Transformar los datos al formato esperado por el frontend
      const transformedPagos = result.rows?.map((row: any, index: number) => ({
        id: `${row[0]}-${row[5]}-${index}`,
        rif: row[0] || '',
        apellidoContribuyente: row[1] || 'N/A',
        montoTotalPago: parseFloat(row[2]) || 0,
        tipoDocumentoPago: row[3] || '',
        fechaRecaudacionPago: row[4] ? new Date(row[4]).toISOString().split('T')[0] : '',
        numeroDocumentoPago: row[5] || '',
        bancoPago: row[6] || '',
        periodoPago: row[7] || '',
        nombreDependencia: row[8] || 'N/A',
        descripcionTipoContribuyente: row[9] || 'N/A',
        idContribuyente: row[10] || null,
        nombreBanco: row[11] || 'N/A',
        descripcionFormulario: row[12] || 'N/A',
        rifValido: parseFloat(row[2]) > 0 // Simplificado: RIF válido si tiene monto > 0
      })) || [];

      return NextResponse.json(transformedPagos, { status: 200 });
    } catch (dbError) {
      console.error("Error en consulta Oracle:", dbError);
      return NextResponse.json(
        { error: "Error al consultar la base de datos" },
        { status: 500 }
      );
    } finally {
      if (connection) {
        await connection.close();
      }
    }

  } catch (error) {
    console.error("Error en pagos ejecutados:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 