import { NextRequest, NextResponse } from "next/server";
import { Role } from "@/models/index";
import { verifyToken } from "@/lib/jwtUtils";
import { Op } from "sequelize";

// PUT /api/admin/roles/[id] - Actualizar rol
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!verifyToken(token)) return NextResponse.json({ error: "Token inválido" }, { status: 403 });

  try {
    const { id: roleId } = await params;
    const body = await req.json();
    const { name, description, status } = body;

    // Validar campos requeridos
    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Nombre de rol inválido" },
        { status: 400 }
      );
    }

    // Validar estado
    if (status && !['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    // Buscar el rol
    const role = await Role.findByPk(roleId);
    if (!role) {
      return NextResponse.json(
        { error: "Rol no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el nombre ya existe (excluyendo el rol actual)
    const existingRole = await Role.findOne({ 
      where: { 
        name: name.trim(),
        id: { [Op.ne]: roleId }
      } 
    });
    
    if (existingRole) {
      return NextResponse.json(
        { error: "Ya existe un rol con ese nombre" },
        { status: 409 }
      );
    }

    // Actualizar el rol
    await role.update({
      name: name.trim(),
      description: description?.trim() || null,
      status: status || (role as any).status
    });

    return NextResponse.json(
      { message: "Rol actualizado exitosamente", role },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PUT /api/admin/roles/[id]] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/roles/[id] - Eliminar rol
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!verifyToken(token)) return NextResponse.json({ error: "Token inválido" }, { status: 403 });

  try {
    const { id: roleId } = await params;

    // Buscar el rol
    const role = await Role.findByPk(roleId);
    if (!role) {
      return NextResponse.json(
        { error: "Rol no encontrado" },
        { status: 404 }
      );
    }

    // No permitir eliminar el rol admin
    if ((role as any).name === 'admin') {
      return NextResponse.json(
        { error: "No se puede eliminar el rol administrador" },
        { status: 403 }
      );
    }

    // Eliminar el rol
    await role.destroy();

    return NextResponse.json(
      { message: "Rol eliminado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE /api/admin/roles/[id]] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
