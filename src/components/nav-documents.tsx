"use client";

import { IconDots, IconFileText } from "@tabler/icons-react";
import { ICON_MAP } from "@/lib/iconMap";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { ModalSearch } from "@/components/modalSearch";

export function NavDocuments({
  items,
}: {
  items: {
    name: string;
    url: string;
    icon?: string;
  }[];
}) {
  // Si no hay items, mostrar solo el título de la sección
  if (!items || items.length === 0) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Documents</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <IconDots className="text-sidebar-foreground/70" />
              <span>No hay documentos disponibles</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const IconComponent = item.icon ? ICON_MAP[item.icon] || IconFileText : IconFileText;
          
          return (
            <SidebarMenuItem
              key={item.name}
              className="flex items-center gap-2"
            >
              <SidebarMenuButton
                asChild
                className="w-full"
              >
                <Link href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <IconDots className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
} 