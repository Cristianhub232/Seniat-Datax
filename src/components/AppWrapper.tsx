'use client';

import { useApp } from '@/context/AppContext';
import SplashScreen from './SplashScreen';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const { isInitialized, setInitialized } = useApp();

  if (!isInitialized) {
    return <SplashScreen onComplete={() => setInitialized(true)} />;
  }

  return <>{children}</>;
} 