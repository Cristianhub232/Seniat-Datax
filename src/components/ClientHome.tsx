'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SplashScreen from './SplashScreen';

export default function ClientHome() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);

  const handleSplashComplete = () => {
    console.log('🎬 Splash screen completado, iniciando redirección...');
    setIsRedirecting(true);
    setRedirectAttempts(prev => prev + 1);
    
    // Agregar un pequeño delay para asegurar que la transición sea suave
    setTimeout(() => {
      console.log('🚀 Redirigiendo a /login...');
      try {
        // Intentar redirección con Next.js router
        router.push('/login');
        console.log('✅ Router.push ejecutado exitosamente');
        
        // Fallback: verificar si la redirección funcionó después de un tiempo
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            console.log('⚠️ Router.push no funcionó, usando fallback...');
            window.location.href = '/login';
          }
        }, 1000);
        
      } catch (error) {
        console.error('❌ Error en redirección con router:', error);
        // Fallback: redirección manual
        console.log('🔄 Usando fallback de redirección...');
        window.location.href = '/login';
      }
    }, 100);
  };

  // Log para debug
  useEffect(() => {
    console.log('🏠 ClientHome montado');
    console.log('📍 Ruta actual:', window.location.pathname);
    console.log('🔗 URL completa:', window.location.href);
  }, []);

  // Log cuando cambia el estado de redirección
  useEffect(() => {
    if (isRedirecting) {
      console.log('⏳ Estado: Redirigiendo... (intento #' + redirectAttempts + ')');
    }
  }, [isRedirecting, redirectAttempts]);

  // Log cuando cambia la ruta
  useEffect(() => {
    const handleRouteChange = () => {
      console.log('🔄 Cambio de ruta detectado:', window.location.pathname);
    };

    // Escuchar cambios en la URL
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  if (isRedirecting) {
    console.log('⏳ Estado: Redirigiendo...');
  }

  return <SplashScreen onComplete={handleSplashComplete} />;
} 