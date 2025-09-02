'use client';

import { useRouter } from 'next/navigation';
import SplashScreen from './SplashScreen';

export default function ClientTestSplash() {
  const router = useRouter();

  const handleSplashComplete = () => {
    console.log('Splash screen completado, redirigiendo al login...');
    // Redirigir directamente al login después del splash screen
    router.push('/login');
  };

  return <SplashScreen onComplete={handleSplashComplete} />;
} 