import { RolePermission } from "@/models/index";
import { QueryTypes } from "sequelize";

type MenuSection = 'main' | 'secondary' | 'document';

interface MenuResponse {
  navMain: MenuNodeRoot[];
  navSecondary: SecondaryItem[];
  documents: DocumentItem[];
}

interface RawMenuItem {
  id: string;
  key: string;
  label: string;
  icon: string | null;
  route: string;
  parentId: string | null;
  orden: number;
  section: MenuSection;
  status: boolean;
  metabaseID?: number | null;
  permissions: {
    canView: boolean;
    canEdit: boolean;
  };
}

type MenuNodeChild = {
  id: string;
  title: string;
  url: string;
  metabaseID?: number | null;
  icon: string | null;
};

type MenuNodeRoot = {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  items: MenuNodeChild[];
  metabaseID?: number | null;
};

type SecondaryItem = {
  title: string;
  url: string;
  icon: string;
};

type DocumentItem = {
  name: string;
  url: string;
  icon: string;
};

type NodeMapItem = MenuNodeRoot & { parentId: string | null };

export async function getMenusByRole(
  role: string,
  options?: { onlyDisabled?: boolean }
): Promise<MenuResponse> {
  try {
    const isAdmin = role === "admin";
    
    const where = options?.onlyDisabled
      ? { status: false }
      : isAdmin
        ? undefined
        : { status: true };

    // Para admin, obtener todos los menús sin join
    if (isAdmin) {
      // TODO: Implementar cuando se tenga el modelo Menu
      const rawMenus: RawMenuItem[] = [];

      const navMain: MenuNodeRoot[] = [];
      const navSecondary: SecondaryItem[] = [];
      const documents: DocumentItem[] = [];

      for (const menu of rawMenus) {
        const baseNode = {
          id: menu.id,
          title: menu.label,
          url: menu.route,
          icon: menu.icon,
          parentId: menu.parentId,
          items: [],
        };

        if (menu.section === 'main') {
          navMain.push(baseNode);
        } else if (menu.section === 'secondary') {
          navSecondary.push({
            title: baseNode.title,
            url: baseNode.url,
            icon: baseNode.icon ?? 'IconHelp',
          });
        } else if (menu.section === 'document') {
          documents.push({
            name: baseNode.title,
            url: baseNode.url,
            icon: baseNode.icon ?? 'IconDatabase',
          });
        }
      }

      return { navMain, navSecondary, documents };
    }

    // Para usuarios no admin, usar consulta SQL directa
    try {
      // TODO: Implementar cuando se tenga el modelo Menu
      const rawMenus: RawMenuItem[] = [];

      const navMain: MenuNodeRoot[] = [];
      const navSecondary: SecondaryItem[] = [];
      const documents: DocumentItem[] = [];

      const nodeMap: Record<string, NodeMapItem> = {};

      for (const menu of rawMenus) {
        const baseNode = {
          id: menu.id,
          title: menu.label,
          url: menu.route,
          icon: menu.icon,
          parentId: menu.parentId,
          items: [],
        };

        if (menu.section === 'main') {
          nodeMap[menu.id] = baseNode;
        } else if (menu.section === 'secondary') {
          navSecondary.push({
            title: baseNode.title,
            url: baseNode.url,
            icon: baseNode.icon ?? 'IconHelp',
          });
        } else if (menu.section === 'document') {
          documents.push({
            name: baseNode.title,
            url: baseNode.url,
            icon: baseNode.icon ?? 'IconDatabase',
          });
        }
      }

      for (const id in nodeMap) {
        const node = nodeMap[id];
        if (node.parentId && nodeMap[node.parentId]) {
          nodeMap[node.parentId].items?.push(node);
        } else {
          navMain.push(node);
        }
      }

      for (const parent of navMain) {
        parent.items = Array.isArray(parent.items)
          ? parent.items.map((child): MenuNodeChild => {
            const raw = rawMenus.find(m => m.id === child.id);
            return {
              id: child.id,
              title: child.title,
              url: child.url,
              icon: child.icon,
              metabaseID: raw?.metabaseID ?? null,
            };
          })
          : [];
      }

      return { navMain, navSecondary, documents };
    } catch (error) {
      console.log("⚠️ Tablas de menús no encontradas, usando menús estáticos");
      // Si las tablas no existen, devolver menús estáticos
      return {
        navMain: [
          { id: "dashboard", title: "Dashboard", url: "/dashboard", icon: "IconHome", items: [], metabaseID: null },
          { id: "usuarios", title: "Usuarios", url: "/usuarios", icon: "IconUsers", items: [], metabaseID: null },
          { id: "roles", title: "Roles", url: "/roles", icon: "IconShield", items: [], metabaseID: null },
          { id: "notificaciones", title: "Notificaciones", url: "/notificaciones", icon: "IconBell", items: [], metabaseID: null }
        ],
        navSecondary: [
          { title: "Configuración", url: "/configuracion", icon: "IconSettings" },
          { title: "Ayuda", url: "/ayuda", icon: "IconHelp" }
        ],
        documents: []
      };
    }
  } catch (error) {
    console.error("❌ Error en getMenusByRole:", error);
    throw error;
  }
}
