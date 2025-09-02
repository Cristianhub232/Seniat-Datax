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

    // Validar que se proporcionen las fechas obligatorias
    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        { error: "Las fechas de inicio y fin son obligatorias" },
        { status: 400 }
      );
    }

    // Construir la restricción por usuario ejecutivo
    const userRestriction = isEjecutivo ? "AND cc2.USUARIO_ID = :usuarioId" : "";
    const carteraRestriction = isEjecutivo ? "AND cc.USUARIO_ID = :usuarioId" : "";

    // Query para estadísticas reales incluyendo RIFs sin pagos
    const statsQuery = `
      SELECT 
        (SELECT COUNT(DISTINCT mp2.RIF_CONTRIBUYENTE_PAGO) 
         FROM CGBRITO.CARTERA_CONTRIBUYENTES cc2
         INNER JOIN DBO.MOVIMIENTO_PAGO mp2 ON mp2.RIF_CONTRIBUYENTE_PAGO = cc2.RIF
         WHERE mp2.FECHA_RECAUDACION_PAGO >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')
         AND mp2.FECHA_RECAUDACION_PAGO <= TO_DATE(:fechaFin, 'YYYY-MM-DD')
         ${userRestriction}) as total_con_pagos,
        (SELECT SUM(mp2.MONTO_TOTAL_PAGO) 
         FROM CGBRITO.CARTERA_CONTRIBUYENTES cc2
         INNER JOIN DBO.MOVIMIENTO_PAGO mp2 ON mp2.RIF_CONTRIBUYENTE_PAGO = cc2.RIF
         WHERE mp2.FECHA_RECAUDACION_PAGO >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')
         AND mp2.FECHA_RECAUDACION_PAGO <= TO_DATE(:fechaFin, 'YYYY-MM-DD')
         ${userRestriction}) as monto_total,
        (SELECT COUNT(CASE WHEN mp2.MONTO_TOTAL_PAGO > 0 THEN 1 END) 
         FROM CGBRITO.CARTERA_CONTRIBUYENTES cc2
         INNER JOIN DBO.MOVIMIENTO_PAGO mp2 ON mp2.RIF_CONTRIBUYENTE_PAGO = cc2.RIF
         WHERE mp2.FECHA_RECAUDACION_PAGO >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')
         AND mp2.FECHA_RECAUDACION_PAGO <= TO_DATE(:fechaFin, 'YYYY-MM-DD')
         ${userRestriction}) as rif_validos,
        (SELECT COUNT(CASE WHEN mp2.MONTO_TOTAL_PAGO = 0 THEN 1 END) 
         FROM CGBRITO.CARTERA_CONTRIBUYENTES cc2
         INNER JOIN DBO.MOVIMIENTO_PAGO mp2 ON mp2.RIF_CONTRIBUYENTE_PAGO = cc2.RIF
         WHERE mp2.FECHA_RECAUDACION_PAGO >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')
         AND mp2.FECHA_RECAUDACION_PAGO <= TO_DATE(:fechaFin, 'YYYY-MM-DD')
         ${userRestriction}) as rif_invalidos,
        (SELECT COUNT(CASE WHEN TRUNC(mp2.FECHA_RECAUDACION_PAGO) = TRUNC(SYSDATE) THEN 1 END) 
         FROM CGBRITO.CARTERA_CONTRIBUYENTES cc2
         INNER JOIN DBO.MOVIMIENTO_PAGO mp2 ON mp2.RIF_CONTRIBUYENTE_PAGO = cc2.RIF
         WHERE mp2.FECHA_RECAUDACION_PAGO >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')
         AND mp2.FECHA_RECAUDACION_PAGO <= TO_DATE(:fechaFin, 'YYYY-MM-DD')
         ${userRestriction}) as pagos_hoy,
        (SELECT COUNT(CASE WHEN TRUNC(mp2.FECHA_RECAUDACION_PAGO) >= TRUNC(SYSDATE, 'MM') THEN 1 END) 
         FROM CGBRITO.CARTERA_CONTRIBUYENTES cc2
         INNER JOIN DBO.MOVIMIENTO_PAGO mp2 ON mp2.RIF_CONTRIBUYENTE_PAGO = cc2.RIF
         WHERE mp2.FECHA_RECAUDACION_PAGO >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')
         AND mp2.FECHA_RECAUDACION_PAGO <= TO_DATE(:fechaFin, 'YYYY-MM-DD')
         ${userRestriction}) as pagos_mes,
        (SELECT COUNT(*) FROM CGBRITO.CARTERA_CONTRIBUYENTES cc WHERE 1=1 ${carteraRestriction}) as total_cartera,
        (SELECT COUNT(*) FROM CGBRITO.CARTERA_CONTRIBUYENTES cc 
         WHERE NOT EXISTS (
           SELECT 1 FROM DBO.MOVIMIENTO_PAGO mp2 
           WHERE mp2.RIF_CONTRIBUYENTE_PAGO = cc.RIF
           AND mp2.FECHA_RECAUDACION_PAGO >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')
           AND mp2.FECHA_RECAUDACION_PAGO <= TO_DATE(:fechaFin, 'YYYY-MM-DD')
         )
         ${carteraRestriction}) as rif_sin_pagos
      FROM DUAL
    `;

    const params: any = {
      fechaInicio: fechaInicio,
      fechaFin: fechaFin
    };

    // Agregar usuarioId si es ejecutivo
    if (isEjecutivo) {
      params.usuarioId = tokenPayload.id;
    }

    // Ejecutar query en Oracle
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      const result = await connection.execute(statsQuery, params);
      
      const row = result.rows?.[0];
      if (!row) {
        return NextResponse.json({
          total: 0,
          montoTotal: 0,
          rifValidos: 0,
          rifInvalidos: 0,
          pagosHoy: 0,
          pagosMes: 0,
          totalCartera: 0,
          rifSinPagos: 0
        }, { status: 200 });
      }

      const response = {
        total: parseInt(row[0]) || 0,
        montoTotal: parseFloat(row[1]) || 0,
        rifValidos: parseInt(row[2]) || 0,
        rifInvalidos: parseInt(row[3]) || 0,
        pagosHoy: parseInt(row[4]) || 0,
        pagosMes: parseInt(row[5]) || 0,
        totalCartera: parseInt(row[6]) || 0,
        rifSinPagos: parseInt(row[7]) || 0
      };

      return NextResponse.json(response, { status: 200 });
    } catch (dbError) {
      console.error("Error en consulta Oracle de estadísticas:", dbError);
      return NextResponse.json(
        { error: "Error al consultar las estadísticas" },
        { status: 500 }
      );
    } finally {
      if (connection) {
        await connection.close();
      }
    }

  } catch (error) {
    console.error("Error en estadísticas de pagos ejecutados:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 