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
            // Asignar icono por URL si no viene desde BD
            const fallbackIconKey = item.url === "/cartera-contribuyentes"
              ? "IconWallet"
              : item.url === "/pagos-ejecutados"
              ? "IconCreditCard"
              : "IconChartPie";
            const IconComponent = ICON_MAP[item.icon ?? fallbackIconKey] || ICON_MAP["IconChartPie"];
            
            // Verificar si es el botón de Cartera de Contribuyentes o Pagos Ejecutados
            const isCarteraContribuyentes = item.url === "/cartera-contribuyentes";
            const isPagosEjecutados = item.url === "/pagos-ejecutados";
            const isHighlighted = true; // Todos los módulos transaccionales deben destacar
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a 
                    href={item.url}
                    className={`group relative transition-all duration-300 rounded-2xl border bg-gradient-to-br from-slate-200 via-slate-100 to-white text-slate-800 border-slate-200 hover:border-cyan-300/60 hover:shadow-cyan-400/20 hover:shadow-xl p-3 flex items-center gap-3 overflow-hidden hover:-translate-y-[1px]`}
                  >
                    {/* Icono */}
                    {IconComponent && (
                      <span className="relative">
                        <IconComponent 
                          size={20} 
                          className="text-cyan-600"
                        />
                      </span>
                    )}

                    {/* Texto */}
                    <span className={`font-medium ${isHighlighted ? "tracking-wide" : ""}`}>
                      {item.title}
                    </span>

                    {/* Badge NUEVA */}
                    {(isCarteraContribuyentes || isPagosEjecutados) && (
                      <span className="ml-auto text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm border border-white/20 animate-pulse">Nueva</span>
                    )}

                    {/* Decoración tech */}
                    {isHighlighted && (
                      <span className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,_#a5f3fc_0,_transparent_40%),_radial-gradient(circle_at_70%_80%,_#93c5fd_0,_transparent_40%)]"/>
                    )}

                    {/* Subtle outer ring */}
                    <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5"/>
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