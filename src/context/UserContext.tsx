"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { UserData, MenuStructure } from "@/types/user";

interface UserContextType {
  user: UserData | null;
  menus: MenuStructure | null;
  loading: boolean;
  setUser: (user: UserData | null) => void;
  setMenus: (menus: MenuStructure | null) => void;
  clearUserData: () => void;
}

const UserDataContext = createContext<UserContextType>({
  user: null,
  menus: null,
  loading: true,
  setUser: () => {},
  setMenus: () => {},
  clearUserData: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<UserData | null>(null);
  const [menus, setMenusState] = useState<MenuStructure | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Cargar datos desde localStorage en el primer render
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = localStorage.getItem("user_data");
    const storedMenus = localStorage.getItem("user_menus");

    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem("user_data");
      }
    }
    if (storedMenus) {
      try {
        setMenusState(JSON.parse(storedMenus));
      } catch (error) {
        console.error('Error parsing menus data:', error);
        localStorage.removeItem("user_menus");
      }
    }

    setLoading(false);
  }, []);

  const setUser = (data: UserData | null) => {
    setUserState(data);
    if (data) {
      localStorage.setItem("user_data", JSON.stringify(data));
    } else {
      localStorage.removeItem("user_data");
    }
  };

  const setMenus = (data: MenuStructure | null) => {
    setMenusState(data);
    if (data) {
      localStorage.setItem("user_menus", JSON.stringify(data));
    } else {
      localStorage.removeItem("user_menus");
    }
  };

  const clearUserData = () => {
    setUserState(null);
    setMenusState(null);
    localStorage.removeItem("user_data");
    localStorage.removeItem("user_menus");
  };

  return (
    <UserDataContext.Provider
      value={{
        user,
        menus,
        loading,
        setUser,
        setMenus,
        clearUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

// Hook para consumir el contexto
export const useUserData = () => useContext(UserDataContext);
