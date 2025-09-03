'use client';

import { useEffect, useState } from "react";
import type { UserData, MenuStructure } from "@/types/user";

// Menús estáticos para evitar dependencias de base de datos
const staticMenus: MenuStructure = {
  navMain: [
    {
      id: "dashboard",
      title: "Dashboard",
      url: "/dashboard",
      icon: "IconHome",
      items: [],
      metabaseID: null
    },
    {
      id: "usuarios",
      title: "Usuarios",
      url: "/usuarios",
      icon: "IconUsers",
      items: [],
      metabaseID: null
    },
    {
      id: "ejecutivos",
      title: "Ejecutivos",
      url: "/ejecutivos",
      icon: "IconUserCheck",
      items: [],
      metabaseID: null
    },
    {
      id: "cartera-contribuyentes",
      title: "Cartera de Contribuyentes",
      url: "/cartera-contribuyentes",
      icon: "IconBuilding",
      items: [],
      metabaseID: null
    },
    {
      id: "pagos-ejecutados",
      title: "Pagos Ejecutados",
      url: "/pagos-ejecutados",
      icon: "IconReportMoney",
      items: [],
      metabaseID: null
    },
    {
      id: "roles",
      title: "Roles",
      url: "/roles",
      icon: "IconShield",
      items: [],
      metabaseID: null
    },
    {
      id: "notificaciones",
      title: "Notificaciones",
      url: "/notificaciones",
      icon: "IconBell",
      items: [],
      metabaseID: null
    },
    {
      id: "tickets",
      title: "Tickets",
      url: "/tickets",
      icon: "IconTicket",
      items: [],
      metabaseID: null
    }
  ],
  navSecondary: [
    {
      title: "Configuración",
      url: "/configuracion",
      icon: "IconSettings"
    },
    {
      title: "Ayuda",
      url: "/ayuda",
      icon: "IconHelp"
    }
  ],
  upcoming: [
    {
      title: "Metabase",
      url: "/metabase",
      icon: "IconChartPie"
    }
  ],
  documents: [
    {
      name: "Obligaciones Fiscales",
      url: "/GO-43031-18122024-Calendario-SPE-2025-extracto.pdf",
      icon: "IconFileText"
    }
  ]
};

export function useUserProfile(): {
  user: UserData | null;
  menus: MenuStructure | null;
  isLoading: boolean;
} {
  const [user, setUser] = useState<UserData | null>(null);
  const [menus, setMenus] = useState<MenuStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
        const storedMenus = typeof window !== 'undefined' ? localStorage.getItem('user_menus') : null;

        if (storedUser) {
          try {
            const userData: UserData = JSON.parse(storedUser);
            setUser(userData);
          } catch {
            localStorage.removeItem('user_data');
          }
        }

        if (storedMenus) {
          try {
            setMenus(JSON.parse(storedMenus));
            setIsLoading(false);
            return;
          } catch {
            localStorage.removeItem('user_menus');
          }
        }

        // Si no hay menús guardados, intentar obtenerlos del backend
        try {
          const res = await fetch('/api/admin/menus', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            const menuData: MenuStructure = {
              navMain: data.navMain || [],
              navSecondary: data.navSecondary || [],
              upcoming: [],
              documents: data.documents || []
            };
            setMenus(menuData);
            if (typeof window !== 'undefined') {
              localStorage.setItem('user_menus', JSON.stringify(menuData));
            }
            setIsLoading(false);
            return;
          }
        } catch {}

        // Fallback: filtrar estáticos por permisos si tenemos usuario
        const fallback = () => {
          const u = user || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user_data') || 'null') : null);
          const role = (u?.role || '').toUpperCase();
          const perms = Array.isArray(u?.permissions) ? u?.permissions : [];
          const can = (p: string) => perms.includes(p);
          const base: MenuStructure = { navMain: [], navSecondary: [], upcoming: [], documents: staticMenus.documents };
          base.navMain.push({ id: 'dashboard', title: 'Dashboard', url: '/dashboard', icon: 'IconHome', items: [], metabaseID: null });
          if (role === 'ADMIN' || can('tickets.read')) base.navMain.push({ id: 'tickets', title: 'Tickets', url: '/tickets', icon: 'IconTicket', items: [], metabaseID: null });
          if (role === 'ADMIN' || can('cartera.read')) base.navMain.push({ id: 'cartera', title: 'Cartera', url: '/cartera-contribuyentes', icon: 'IconBuilding', items: [], metabaseID: null });
          if (role === 'ADMIN' || can('pagos.read')) base.navMain.push({ id: 'pagos', title: 'Pagos ejecutados', url: '/pagos-ejecutados', icon: 'IconReportMoney', items: [], metabaseID: null });
          if (role === 'ADMIN' || can('obligaciones.read')) base.navMain.push({ id: 'obligaciones', title: 'Obligaciones', url: '/obligaciones', icon: 'IconFileText', items: [], metabaseID: null });
          if (role === 'ADMIN') base.navMain.push({ id: 'usuarios', title: 'Usuarios', url: '/usuarios', icon: 'IconUsers', items: [], metabaseID: null });
          base.navSecondary = staticMenus.navSecondary;
          setMenus(base);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_menus', JSON.stringify(base));
          }
        };

        fallback();
        setIsLoading(false);
      } catch (e) {
        console.error('useUserProfile init error:', e);
        setMenus(staticMenus);
        setIsLoading(false);
      }
    };
    init();
  }, [user]);

  return { user, menus, isLoading };
}

