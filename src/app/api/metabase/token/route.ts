import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const METABASE_SITE_URL = "http://172.16.56.23:3000";
const METABASE_SECRET_KEY = "39fe95cd5500e77e6f436d2b3d09a43d6e562d91b700a4c94192a666e69fd1dd";

export async function POST(request: NextRequest) {
  try {
    // Crear el payload para el token JWT
    const payload = {
      resource: { dashboard: 17 },
      params: {},
      exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 minutos de expiración
    };

    // Generar el token JWT
    const token = jwt.sign(payload, METABASE_SECRET_KEY);

    // Construir la URL del iframe
    const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;

    return NextResponse.json({
      success: true,
      iframeUrl: iframeUrl,
      token: token,
      expiresIn: "10 minutes"
    });

  } catch (error) {
    console.error("Error generando token de Metabase:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor al generar el token de Metabase"
      },
      { status: 500 }
    );
  }
} 