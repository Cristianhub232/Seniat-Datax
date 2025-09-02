"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ICON_MAP } from "@/lib/iconMap";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: string;
    items?: { metabaseID: number | null }[];
  }[];
}) {
  console.log("NavMain - items:", items);
  
  if (!items || items.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <div className="text-sm text-gray-500 px-3 py-2">
            No hay menús disponibles
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item, index) => {
            // Obtener el icono correcto
            const IconComponent = ICON_MAP[item.icon ?? "IconHelp"] || ICON_MAP["IconHelp"];
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a 
                    href={item.url}
                    className="group relative transition-all duration-300 hover:bg-blue-50 hover:text-blue-700 rounded-lg"
                  >
                    {IconComponent && (
                      <IconComponent 
                        size={22} 
                        className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300"
                      />
                    )}
                    <span className="font-medium transition-all duration-300">
                      {item.title}
                    </span>
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
