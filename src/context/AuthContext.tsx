"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "@/context/UserContext";
import { toast } from "sonner";
import { UserData, MenuStructure } from "@/types/user";

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  signIn: (credentials: {
    username: string;
    password: string;
  }) => Promise<void>;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  logout: async () => {},
  signIn: async () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, setMenus } = useUserData();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay usuario en localStorage al cargar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("user_data");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUser(user);
          setIsAuthenticated(true);
          
          const menuData = localStorage.getItem("user_menus");
          if (menuData) {
            const menus = JSON.parse(menuData);
            setMenus(menus);
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          clearSession();
        }
      }
    }
  }, [setUser, setMenus]);

  // Iniciar sesión
  const signIn = async (credentials: {
    username: string;
    password: string;
  }) => {
    try {
      console.log('🔐 Iniciando proceso de login...');
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error || "Credenciales inválidas");
      }

      console.log('✅ Login exitoso, configurando sesión...');
      
      // Usar directamente los datos del login
      const userData: UserData = {
        id: result.id,
        username: result.username,
        email: result.email,
        role_id: result.role || 'default',
        avatar: undefined
      };

      setUser(userData);
      setIsAuthenticated(true);
      
      // Menús estáticos
      const staticMenus: MenuStructure = {
        navMain: [
          {
            id: 'dashboard',
            title: 'Dashboard',
            url: '/dashboard',
            icon: 'HomeIcon',
            metabaseID: null,
            items: []
          }
        ],
        navSecondary: [
          { title: 'Usuarios', url: '/users', icon: 'UsersIcon' },
          { title: 'Configuración', url: '/settings', icon: 'CogIcon' }
        ],
        upcoming: [],
        documents: []
      };
      setMenus(staticMenus);

      if (typeof window !== 'undefined') {
        localStorage.setItem("user_data", JSON.stringify(userData));
        localStorage.setItem("user_menus", JSON.stringify(staticMenus));
      }

      console.log('🚀 Redirigiendo al dashboard...');
      
      // Usar redirección directa del navegador para mayor confiabilidad
      if (typeof window !== 'undefined') {
        // Pequeño delay para asegurar que el estado se guarde
        setTimeout(() => {
          console.log('🔄 Ejecutando redirección a dashboard...');
          window.location.href = '/dashboard';
        }, 100);
      }
    } catch (error: any) {
      console.error("⛔ Error en signIn:", error);
      toast.error(error?.message || "Error al iniciar sesión");
      throw error;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    console.log('🚪 Cerrando sesión...');
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.log('⚠️ Error en logout API, continuando...');
    }
    
    clearSession();
    router.push("/login");
  };

  const clearSession = () => {
    console.log('🧹 Limpiando sesión...');
    setUser(null);
    setMenus(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user_data");
      localStorage.removeItem("user_menus");
    }
  };

  const updateUser = (userData: any) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem("user_data", JSON.stringify(userData));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        logout,
        signIn,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
