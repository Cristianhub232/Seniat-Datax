import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/index";
import { verifyToken } from "@/lib/jwtUtils";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!verifyToken(token)) return NextResponse.json({ error: "Token inválido" }, { status: 403 });

  try {
    const decoded = verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json({ error: "Token inválido" }, { status: 403 });
    }

    // Obtener el archivo del FormData
    const formData = await req.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen válida" },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen debe ser menor a 5MB" },
        { status: 400 }
      );
    }

    // Buscar el usuario
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Convertir el archivo a base64 para almacenamiento
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    const avatarUrl = `data:${mimeType};base64,${base64}`;

    console.log(`[POST /api/account/avatar] Procesando imagen: ${file.name}, tamaño: ${file.size} bytes, base64: ${base64.length} caracteres`);

    // Actualizar el avatar del usuario
    try {
      await user.update({
        avatar: avatarUrl
      });
      console.log(`[POST /api/account/avatar] Avatar actualizado exitosamente para usuario: ${decoded.id}`);
    } catch (updateError) {
      console.error('[POST /api/account/avatar] Error actualizando avatar:', updateError);
      return NextResponse.json(
        { error: "Error al guardar el avatar en la base de datos" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Avatar actualizado exitosamente",
        avatar_url: avatarUrl
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/account/avatar] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 