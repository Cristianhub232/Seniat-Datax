"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ICON_MAP } from "@/lib/iconMap";

export function NavTransactional({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: string;
    items?: { metabaseID: number | null }[];
  }[];
}) {
  console.log("NavTransactional - items:", items);
  
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
        Módulos Transaccionales
      </SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item, index) => {
            // Obtener el icono correcto
            const IconComponent = ICON_MAP[item.icon ?? "IconHelp"] || ICON_MAP["IconHelp"];
            
            // Verificar si es el botón de Cartera de Contribuyentes o Pagos Ejecutados
            const isCarteraContribuyentes = item.title === "Cartera de Contribuyentes";
            const isPagosEjecutados = item.title === "Pagos Ejecutados";
            const isHighlighted = isCarteraContribuyentes || isPagosEjecutados;
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a 
                    href={item.url}
                    className={`group relative transition-all duration-300 rounded-lg ${
                      isHighlighted 
                        ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg hover:from-purple-600 hover:to-blue-700 hover:shadow-xl transform hover:scale-105 border-2 border-purple-300" 
                        : "hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    {IconComponent && (
                      <IconComponent 
                        size={22} 
                        className={`transition-colors duration-300 ${
                          isHighlighted 
                            ? "text-white group-hover:text-purple-100" 
                            : "text-gray-600 group-hover:text-blue-600"
                        }`}
                      />
                    )}
                    <span className={`font-medium transition-all duration-300 ${
                      isHighlighted ? "font-semibold" : ""
                    }`}>
                      {item.title}
                    </span>
                    {isHighlighted && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    )}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
} 