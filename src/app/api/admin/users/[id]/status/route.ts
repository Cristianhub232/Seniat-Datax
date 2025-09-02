// src/app/api/admin/users/[id]/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import { authSequelize } from "@/lib/db";
import { z } from "zod";
import { updateUserStatusSchema } from "@/schemas/userSchemas";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!uuidValidate(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = await req.json();
  } catch (err) {
    console.error("[PATCH /api/admin/users/:id/status] JSON parse error:", err);
    return NextResponse.json({ error: "JSON malformado" }, { status: 400 });
  }

  let data: { status: 'active' | 'inactive' | 'suspended' };
  try {
    data = updateUserStatusSchema.parse(parsedBody);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ errors: err.issues }, { status: 400 });
    }
    console.error("[PATCH /api/admin/users/:id/status] Zod error:", err);
    return NextResponse.json(
      { error: "Error validando datos" },
      { status: 400 }
    );
  }

  try {
    const [affected] = await authSequelize.query(
      'UPDATE CGBRITO.USERS SET STATUS = ?, UPDATED_AT = SYSDATE WHERE ID = ?',
      {
        replacements: [data.status, id],
        type: 'UPDATE'
      }
    );

    if (!affected) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error("[PATCH /api/admin/users/:id/status] DB update error:", err);
    return NextResponse.json(
      { error: "Error actualizando estado" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      status: data.status,
      message: data.status === 'active'
        ? "Usuario activado correctamente"
        : data.status === 'inactive'
        ? "Usuario desactivado correctamente"
        : "Usuario suspendido correctamente",
    },
    { status: 200 }
  );
}
