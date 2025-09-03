import { NextRequest, NextResponse } from 'next/server';
import { RolePermission } from '@/models/index';
import { verifyToken } from '@/lib/jwtUtils';
import { QueryTypes } from 'sequelize';

// GET /api/admin/roles/[id]/permissions - Obtener permisos del rol
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  }
  if (!verifyToken(token)) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
  }

  try {
    const { id: roleId } = await params;

    // Obtener permisos actuales del rol usando consulta SQL directa
    const permissions = await RolePermission.sequelize!.query(`
      SELECT rp.role_id, rp.permission_id, p.name as permission_name, p.resource_name, p.action_name
      FROM CGBRITO.ROLE_PERMISSIONS rp
      INNER JOIN CGBRITO.PERMISSIONS p ON rp.permission_id = p.id
      WHERE rp.role_id = :roleId
    `, {
      replacements: { roleId },
      type: QueryTypes.SELECT
    }) as any[];

    return NextResponse.json({
      role_id: roleId,
      permissions: permissions.map((perm: any) => ({
        permission_id: perm.permission_id,
        permission_name: perm.permission_name,
        resource: perm.resource_name,
        action: perm.action_name
      }))
    }, { status: 200 });

  } catch (error) {
    console.error('[GET /api/admin/roles/[id]/permissions] Error:', error);
    return NextResponse.json({ error: 'Error obteniendo permisos' }, { status: 500 });
  }
}

// PUT /api/admin/roles/[id]/permissions - Actualizar permisos del rol
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  }
  if (!verifyToken(token)) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
  }

  try {
    const { id: roleId } = await params;
    const body = await req.json();
    const { permissions } = body;

    if (!Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Formato de permisos inválido' }, { status: 400 });
    }

    // Eliminar permisos existentes del rol
    await RolePermission.destroy({
      where: { role_id: roleId }
    });

    // Crear nuevos permisos
    const permissionsToCreate = permissions.map((perm: any) => ({
      role_id: parseInt(roleId),
      permission_id: perm.permission_id
    }));

    if (permissionsToCreate.length > 0) {
      await RolePermission.bulkCreate(permissionsToCreate);
    }

    return NextResponse.json({
      message: 'Permisos actualizados correctamente',
      role_id: roleId,
      permissions_updated: permissionsToCreate.length
    }, { status: 200 });

  } catch (error) {
    console.error('[PUT /api/admin/roles/[id]/permissions] Error:', error);
    return NextResponse.json({ error: 'Error actualizando permisos' }, { status: 500 });
  }
} 