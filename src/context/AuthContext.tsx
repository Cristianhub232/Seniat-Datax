"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "@/context/UserContext";
import { toast } from "sonner";
import { UserData, MenuStructure } from "@/types/user";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  logout: () => Promise<void>;
  signIn: (credentials: {
    username: string;
    password: string;
  }) => Promise<void>;
  updateUser: (userData: any) => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  logout: async () => {},
  signIn: async () => {},
  updateUser: () => {},
  refreshSession: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, setMenus } = useUserData();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUserState] = useState<any>(null);

  // Función para verificar sesión en el backend
  const verifySession = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUserState(data.user);
          // Persistir en UserContext también si está disponible
          try {
            // Guardar en localStorage para mantener permisos tras recarga
            if (typeof window !== 'undefined') {
              // Mantener los menús actuales para evitar parpadeos de UI
              localStorage.setItem("user_data", JSON.stringify(data.user));
            }
          } catch (err) {
            console.error('Error guardando user_data:', err);
          }
          setIsAuthenticated(true);
          return true;
        }
      }
      
      // Sesión inválida
      setIsAuthenticated(false);
      setUserState(null);
      return false;
    } catch (error) {
      console.error("Error verificando sesión:", error);
      setIsAuthenticated(false);
      setUserState(null);
      return false;
    }
  };

  // Función para refrescar la sesión
  const refreshSession = async () => {
    setIsLoading(true);
    await verifySession();
    setIsLoading(false);
  };

  // Verificar sesión al cargar y sincronizar con localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window !== 'undefined') {
        // Primero verificar si hay datos en localStorage
        const userData = localStorage.getItem("user_data");
        const menuData = localStorage.getItem("user_menus");
        
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            
            if (menuData) {
              const parsedMenus = JSON.parse(menuData);
              setMenus(parsedMenus);
            }
            
            // Verificar en el backend si la sesión sigue siendo válida
            const isValid = await verifySession();
            
            if (!isValid) {
              // Sesión expirada en backend, limpiar localStorage
              clearSession();
            }
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            clearSession();
          }
        } else {
          // No hay datos en localStorage, verificar si hay sesión válida en backend
          await verifySession();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
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
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        role: result.user.role || 'default',
        permissions: result.user.permissions || [],
        avatar: undefined
      };

      setUser(userData);
      setUserState(result.user);
      setIsAuthenticated(true);
      
      // Intentar cargar menús dinámicos del backend
      let menusToPersist: MenuStructure | null = null;
      try {
        const res = await fetch('/api/admin/menus', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const menusFromApi: MenuStructure = {
            navMain: data.navMain || [],
            navSecondary: data.navSecondary || [],
            upcoming: [],
            documents: data.documents || []
          };
          setMenus(menusFromApi);
          menusToPersist = menusFromApi;
          if (typeof window !== 'undefined') {
            localStorage.setItem("user_menus", JSON.stringify(menusFromApi));
          }
        } else {
          throw new Error('menus api failed');
        }
      } catch {
        // Fallback a menús estáticos filtrados por permisos
        const baseMenus: MenuStructure = {
          navMain: [
            { id: 'dashboard', title: 'Dashboard', url: '/dashboard', icon: 'HomeIcon', metabaseID: null, items: [] },
          ],
          navSecondary: [],
          upcoming: [],
          documents: []
        };
        const can = (userData.permissions || []).includes.bind(userData.permissions || []);
        const isAdmin = (userData.role || '').toUpperCase() === 'ADMIN';
        if (isAdmin || can('tickets.read')) baseMenus.navMain.push({ id: 'tickets', title: 'Tickets', url: '/tickets', icon: 'IconTicket', metabaseID: null, items: [] });
        if (isAdmin || can('cartera.read')) baseMenus.navMain.push({ id: 'cartera', title: 'Cartera', url: '/cartera-contribuyentes', icon: 'IconWallet', metabaseID: null, items: [] });
        if (isAdmin || can('pagos.read')) baseMenus.navMain.push({ id: 'pagos', title: 'Pagos ejecutados', url: '/pagos-ejecutados', icon: 'IconCreditCard', metabaseID: null, items: [] });
        if (isAdmin || can('obligaciones.read')) baseMenus.navMain.push({ id: 'obligaciones', title: 'Obligaciones', url: '/obligaciones', icon: 'IconFile', metabaseID: null, items: [] });
        if (isAdmin) baseMenus.navMain.push({ id: 'usuarios', title: 'Usuarios', url: '/usuarios', icon: 'IconUsers', metabaseID: null, items: [] });
        setMenus(baseMenus);
        menusToPersist = baseMenus;
        if (typeof window !== 'undefined') {
          localStorage.setItem("user_menus", JSON.stringify(baseMenus));
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem("user_data", JSON.stringify(userData));
        if (menusToPersist) {
          localStorage.setItem("user_menus", JSON.stringify(menusToPersist));
        }
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
    setUserState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user_data");
      localStorage.removeItem("user_menus");
    }
  };

  const updateUser = (userData: any) => {
    setUser(userData);
    setUserState(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem("user_data", JSON.stringify(userData));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        logout,
        signIn,
        updateUser,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
