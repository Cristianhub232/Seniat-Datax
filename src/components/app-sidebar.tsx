"use client";

import * as React from "react";
import { IconInnerShadowTop } from "@tabler/icons-react";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavTransactional } from "@/components/nav-transactional";
import { NavUpcoming } from "@/components/nav-upcoming";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useUserProfile } from "@/hooks/useUserProfile";
import type { MenuNodeRoot } from "@/types/user";
import Image from "next/image";


export function AppSidebar({...props }) {
  const { user, menus, isLoading } = useUserProfile(); 
  
  // Debug: verificar que los menús se están cargando
  console.log("AppSidebar - menus:", menus);
  console.log("AppSidebar - navMain:", menus?.navMain);
  console.log("AppSidebar - isLoading:", isLoading);
  
  // Mostrar skeleton o nada mientras carga
  if (isLoading || !menus) {
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <a href="#" className="flex items-center justify-center gap-2 w-full h-24">
                  <Image
                    src="/Logo_basado_en_banner.png"
                    alt="Logo"
                    width={720}
                    height={120}
                    className="h-20 w-auto object-contain"
                    priority
                  />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {/* Skeleton loader mientras carga */}
          <div className="space-y-2 p-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#" className="flex items-center justify-center gap-2 w-full h-24">
                <Image
                  src="/Logo_basado_en_banner.png"
                  alt="Logo"
                  width={720}
                  height={120}
                  className="h-20 w-auto object-contain"
                  priority
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={
            (menus?.navMain || [])
              // Ocultar obligaciones por solicitud y separar transaccionales por ruta
              .filter((item: MenuNodeRoot) => 
                item.url !== "/cartera-contribuyentes" && 
                item.url !== "/pagos-ejecutados" &&
                item.url !== "/obligaciones" &&
                item.url !== "/metabase"
              )
              .map((item: MenuNodeRoot) => ({
                ...item,
                icon: item.icon === null ? undefined : item.icon,
              }))
          }
        />
        <NavTransactional
          items={
            (menus?.navMain || [])
              // Mostrar módulos transaccionales por ruta
              .filter((item: MenuNodeRoot) => 
                item.url === "/cartera-contribuyentes" || 
                item.url === "/pagos-ejecutados"
              )
              .map((item: MenuNodeRoot) => ({
                ...item,
                icon: item.icon === null ? undefined : item.icon,
              }))
          }
        />
        <NavDocuments items={menus?.documents || []} />
        <NavUpcoming items={menus?.upcoming || []} />
        <NavSecondary items={menus?.navSecondary || []} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user ?? { avatar: "", username: "", email: "" }} />
      </SidebarFooter>
    </Sidebar>
  );
}