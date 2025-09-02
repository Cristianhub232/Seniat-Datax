import { NextRequest, NextResponse } from 'next/server';
import { RoleMenuPermission, Menu } from '@/models/index';
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
    const permissions = await RoleMenuPermission.sequelize!.query(`
      SELECT rmp.role_id, rmp.menu_id, rmp.can_view, rmp.can_edit,
             m.id as menu_id, m.key, m.label, m.route, m.section
      FROM app.role_menu_permissions rmp
      LEFT JOIN app.menus m ON rmp.menu_id = m.id
      WHERE rmp.role_id = :roleId
    `, {
      replacements: { roleId },
      type: QueryTypes.SELECT
    }) as any[];

    return NextResponse.json({
      role_id: roleId,
      permissions: permissions.map((perm: any) => ({
        menu_id: perm.menu_id,
        menu: {
          id: perm.menu_id,
          key: perm.key,
          label: perm.label,
          route: perm.route,
          section: perm.section
        },
        can_view: perm.can_view,
        can_edit: perm.can_edit
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
    await RoleMenuPermission.destroy({
      where: { role_id: roleId }
    });

    // Crear nuevos permisos
    const permissionsToCreate = permissions.map((perm: any) => ({
      role_id: roleId,
      menu_id: perm.menu_id,
      can_view: perm.can_view || false,
      can_edit: perm.can_edit || false
    }));

    if (permissionsToCreate.length > 0) {
      await RoleMenuPermission.bulkCreate(permissionsToCreate);
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