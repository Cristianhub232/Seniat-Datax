import { NextRequest, NextResponse } from 'next/server';
import { authSequelize } from '@/lib/db';
import { verifyToken } from '@/lib/jwtUtils';
import { QueryTypes } from 'sequelize';

type MenuNodeChild = { id: string; title: string; url: string; icon: string | null; metabaseID: number | null };
type MenuNodeRoot = MenuNodeChild & { items: MenuNodeChild[] };
type SecondaryItem = { title: string; url: string; icon: string };
type MenuStructure = { navMain: MenuNodeRoot[]; navSecondary: SecondaryItem[]; documents: any[] };

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  
  try {
    // Verificar token
    const decoded: any = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Token inválido' }, { status: 403 });

    // Obtener ROLE_ID y permisos del usuario
    const [userRows] = await authSequelize.query(`
      SELECT u.ROLE_ID, r.NAME as ROLE_NAME
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.ID = :userId AND u.STATUS = 'active'
    `, { replacements: { userId: decoded.id }, type: QueryTypes.SELECT });

    const userRow: any = Array.isArray(userRows) ? (userRows.length > 0 ? userRows[0] : null) : userRows;
    if (!userRow) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const roleId = userRow.ROLE_ID;
    const roleName = (userRow.ROLE_NAME || '').toUpperCase();

    let permissions: string[] = [];
    try {
      const perms = await authSequelize.query(`
        SELECT p.NAME FROM CGBRITO.PERMISSIONS p
        JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
        WHERE rp.ROLE_ID = :roleId
      `, { replacements: { roleId }, type: QueryTypes.SELECT });
      const rows = Array.isArray(perms) ? perms : [perms];
      permissions = rows.map((r: any) => (r.NAME || r.name)).filter(Boolean);
    } catch {
      permissions = [];
    }

    // Intentar cargar menús desde BD por ROLE_ID
    const dbMenus = await authSequelize.query(`
      SELECT m.ID, m.NAME, m.ICON, m.ROUTE, m.PARENT_ID, m.ORDER_INDEX, m.IS_ACTIVE
      FROM CGBRITO.MENUS m
      JOIN CGBRITO.ROLE_MENU_PERMISSIONS rmp ON rmp.MENU_ID = m.ID
      WHERE rmp.ROLE_ID = :roleId AND NVL(m.IS_ACTIVE, 1) = 1
      ORDER BY NVL(m.ORDER_INDEX, 999), m.ID
    `, { replacements: { roleId }, type: QueryTypes.SELECT });

    const navMain: MenuNodeRoot[] = [];
    let navSecondary: SecondaryItem[] = [];

    const rows = Array.isArray(dbMenus) ? dbMenus : [dbMenus];
    if (rows.length > 0) {
      // Construir árbol simple (padres con hijos por PARENT_ID)
      const nodeMap: Record<string, MenuNodeRoot & { parentId: any }> = {};
      const childrenMap: Record<string, MenuNodeChild[]> = {};

      for (const r of rows as any[]) {
        const id = String(r.ID);
        const parentId = r.PARENT_ID != null ? String(r.PARENT_ID) : null;
        const node: MenuNodeRoot & { parentId: any } = {
          id,
          title: r.NAME,
          url: r.ROUTE,
          icon: r.ICON || null,
          metabaseID: null,
          items: [],
          parentId
        };
        nodeMap[id] = node;
        if (parentId) {
          if (!childrenMap[parentId]) childrenMap[parentId] = [];
          childrenMap[parentId].push({ id, title: r.NAME, url: r.ROUTE, icon: r.ICON || null, metabaseID: null });
        }
      }

      for (const id in nodeMap) {
        const node = nodeMap[id];
        node.items = childrenMap[id] || [];
        if (!node.parentId) navMain.push({ id: node.id, title: node.title, url: node.url, icon: node.icon, metabaseID: node.metabaseID, items: node.items });
      }

      // Secundarios basados en permisos
      if (roleName === 'ADMIN' || permissions.includes('configuracion.read')) {
        navSecondary.push({ title: 'Configuración', url: '/configuracion', icon: 'IconSettings' });
      }
      if (roleName === 'ADMIN' || permissions.includes('ayuda.read')) {
        navSecondary.push({ title: 'Ayuda', url: '/ayuda', icon: 'IconHelp' });
      }
    } else {
      // Fallback: construir menús a partir de permisos
      const can = (perm: string) => permissions.includes(perm);
      const isAdmin = roleName === 'ADMIN';

      const addMain = (id: string, title: string, url: string, icon: string | null) => {
        navMain.push({ id, title, url, icon, metabaseID: null, items: [] });
      };

      addMain('dashboard', 'Dashboard', '/dashboard', 'IconHome');
      if (isAdmin || can('tickets.read')) addMain('tickets', 'Tickets', '/tickets', 'IconTicket');
      // ADMIN: botones principales adicionales
      if (isAdmin) {
        addMain('usuarios', 'Usuarios', '/usuarios', 'IconUsers');
        addMain('ejecutivos', 'Ejecutivos', '/ejecutivos', 'IconUserCheck');
        addMain('roles', 'Roles', '/roles', 'IconShield');
      }
      if (isAdmin || can('cartera.read')) addMain('cartera', 'Cartera', '/cartera-contribuyentes', 'IconWallet');
      if (isAdmin || can('pagos.read')) addMain('pagos', 'Pagos ejecutados', '/pagos-ejecutados', 'IconCreditCard');
      if (isAdmin || can('obligaciones.read')) addMain('obligaciones', 'Obligaciones', '/obligaciones', 'IconFile');
      if (isAdmin || can('metabase.access')) addMain('metabase', 'Metabase', '/metabase', 'IconChart');
      // Secundarios
      navSecondary = [];
      if (isAdmin || can('configuracion.read')) {
        navSecondary.push({ title: 'Configuración', url: '/configuracion', icon: 'IconSettings' });
      }
      if (isAdmin || can('ayuda.read')) {
        navSecondary.push({ title: 'Ayuda', url: '/ayuda', icon: 'IconHelp' });
      }
    }

    // Deduplicar posibles entradas repetidas en navMain (por id o url)
    const seenIds = new Set<string>();
    const seenUrls = new Set<string>();
    const dedupedNavMain = navMain.filter((item) => {
      const id = item.id ?? '';
      const url = item.url ?? '';
      const isDuplicate = (id && seenIds.has(id)) || (url && seenUrls.has(url));
      if (!isDuplicate) {
        if (id) seenIds.add(id);
        if (url) seenUrls.add(url);
        return true;
      }
      return false;
    });

    const payload: MenuStructure = { navMain: dedupedNavMain, navSecondary, documents: [] };
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/menus] Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}