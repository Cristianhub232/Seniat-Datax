"use client";

import * as React from "react";
import Image from "next/image";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { ICON_MAP } from "@/lib/iconMap";

export function NavUpcoming({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon?: string;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        Próximamente
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const IconComponent = ICON_MAP[item.icon ?? "IconHelp"];
            
            // Diseño especial para Metabase
            if (item.title === "Metabase") {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="group relative overflow-hidden">
                    <a 
                      href={item.url}
                      className="metabase-button tech-glow tech-particles ripple-effect relative block w-full h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg p-3 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 slide-in"
                    >

                      
                      {/* Efecto de ondas de energía */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-1 left-1 w-2 h-2 bg-cyan-400 rounded-full pulse-tech"></div>
                        <div className="absolute top-3 right-2 w-1.5 h-1.5 bg-purple-400 rounded-full pulse-tech" style={{animationDelay: '0.5s'}}></div>
                        <div className="absolute bottom-2 left-3 w-1 h-1 bg-pink-400 rounded-full pulse-tech" style={{animationDelay: '1s'}}></div>
                        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full pulse-tech" style={{animationDelay: '1.5s'}}></div>
                      </div>
                      
                      {/* Líneas tech */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
                        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
                        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-white to-transparent"></div>
                        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-white to-transparent"></div>
                      </div>
                      
                      {/* Contenido principal */}
                      <div className="relative z-10 flex items-center h-full">
                        {/* Icono personalizado de Metabase */}
                        <div className="relative w-10 h-10 mr-3 flex-shrink-0 float">
                          <Image
                            src="/ico-metabase.png"
                            alt="Metabase Icon"
                            width={40}
                            height={40}
                            className="object-contain group-hover:scale-125 transition-transform duration-500 drop-shadow-lg"
                          />
                          {/* Efecto de brillo */}
                          <div className="absolute inset-0 bg-white/30 rounded-full blur-md group-hover:blur-lg transition-all duration-500"></div>
                          {/* Halo de energía */}
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        </div>
                        
                        {/* Texto */}
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-bold text-sm group-hover:text-cyan-100 transition-colors duration-300 drop-shadow-sm">
                            {item.title}
                          </div>
                          <div className="text-cyan-200 text-xs opacity-90 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                            Análisis Avanzado
                          </div>
                        </div>
                        
                        {/* Indicador de estado */}
                        <div className="flex-shrink-0">
                          <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full pulse-tech group-hover:animate-bounce shadow-lg"></div>
                        </div>
                      </div>
                      
                      {/* Borde brillante */}
                      <div className="absolute inset-0 rounded-lg border-2 border-white/30 group-hover:border-white/60 transition-all duration-500"></div>
                      
                      {/* Efecto de esquinas tech */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-cyan-400 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-purple-400 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-pink-400 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-yellow-400 rounded-br-lg"></div>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
            
            // Diseño normal para otros elementos
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="opacity-60 hover:opacity-100 transition-opacity">
                  <a href={item.url}>
                    {IconComponent && <IconComponent size={22} />}
                    <span>{item.title}</span>
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