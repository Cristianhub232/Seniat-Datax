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
                    className={`group relative transition-all duration-300 rounded-xl border ${
                      isHighlighted 
                        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700 hover:border-cyan-400/60 hover:shadow-cyan-500/20 hover:shadow-xl"
                        : "hover:bg-blue-50 hover:text-blue-700 border-transparent"
                    } p-3 flex items-center gap-3 overflow-hidden`}
                  >
                    {/* Icono */}
                    {IconComponent && (
                      <span className="relative">
                        <IconComponent 
                          size={22} 
                          className={`${isHighlighted ? "text-cyan-300" : "text-gray-600 group-hover:text-blue-600"}`}
                        />
                      </span>
                    )}

                    {/* Texto */}
                    <span className={`font-medium ${isHighlighted ? "tracking-wide" : ""}`}>
                      {item.title}
                    </span>

                    {/* Badge NUEVA */}
                    {isHighlighted && (
                      <span className="ml-auto text-[10px] uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md border border-white/10">Nueva</span>
                    )}

                    {/* Decoración tech */}
                    {isHighlighted && (
                      <span className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,_#22d3ee_0,_transparent_40%),_radial-gradient(circle_at_70%_80%,_#3b82f6_0,_transparent_40%)]"/>
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