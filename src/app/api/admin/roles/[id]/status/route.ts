import { NextRequest, NextResponse } from "next/server";
import { Role } from "@/models";
import { validate as uuidValidate } from "uuid";

const validStatuses = ["activo", "inactivo"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!uuidValidate(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const { status } = await req.json();

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido. Use "activo" o "inactivo"' },
        { status: 400 }
      );
    }

    const role = await Role.findByPk(id);

    if (!role) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
    }

    role.set("status", status);
    await role.save();

    return NextResponse.json(
      {
        message: `Rol actualizado correctamente: ${status}`,
        role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PUT /api/admin/roles/:id/estado] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
