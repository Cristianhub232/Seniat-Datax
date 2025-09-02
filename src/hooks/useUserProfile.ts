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
    const storedUser = localStorage.getItem("user_data");

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Filtrar menús según el rol del usuario
        let filteredMenus = { ...staticMenus };
        
        // Si el usuario tiene rol "Auditor Jefe", solo mostrar ejecutivos (sin cartera de contribuyentes)
        if (userData.role === "Auditor Jefe") {
          filteredMenus = {
            navMain: [
              {
                id: "ejecutivos",
                title: "Ejecutivos",
                url: "/ejecutivos",
                icon: "IconUserCheck",
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
            documents: []
          };
        }
        
        // Si el usuario tiene rol "Ejecutivo", mostrar dashboard, cartera de contribuyentes y pagos ejecutados
        if (userData.role === "Ejecutivo") {
          filteredMenus = {
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
            documents: []
          };
        }
        
        setMenus(filteredMenus);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem("user_data");
        setMenus(staticMenus);
      }
    } else {
      // Si no hay usuario, usar menús estáticos
      setMenus(staticMenus);
    }
    
    // Marcar como no cargando después de procesar
    setIsLoading(false);
  }, []);

  return { user, menus, isLoading };
}

