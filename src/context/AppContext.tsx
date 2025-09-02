'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  isInitialized: boolean;
  setInitialized: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Verificar si ya se ha mostrado el splash screen en esta sesión
    const hasShownSplash = sessionStorage.getItem('splashShown');
    
    if (hasShownSplash) {
      setIsInitialized(true);
    }
  }, []);

  const setInitialized = (value: boolean) => {
    setIsInitialized(value);
    if (value) {
      sessionStorage.setItem('splashShown', 'true');
    }
  };

  return (
    <AppContext.Provider value={{ isInitialized, setInitialized }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 