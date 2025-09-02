'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Secuencia de animaciones
    const timer1 = setTimeout(() => {
      setLogoLoaded(true);
    }, 500);

    const timer2 = setTimeout(() => {
      setShowText(true);
    }, 1200);

    const timer3 = setTimeout(() => {
      setIsVisible(false);
    }, 4500);

    const timer4 = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-white flex items-center justify-center z-50 transition-opacity duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Fondo con patrón sutil */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo con animación */}
        <div className={`transition-all duration-1000 ease-out ${
          logoLoaded 
            ? 'animate-scale-in' 
            : 'scale-75 opacity-0'
        }`}>
          <div className="relative">
            <Image
              src="/Example.jpeg"
              alt="Logo SENIAT"
              width={820}
              height={820}
              className="drop-shadow-lg rounded-lg"
              priority
            />
            {/* Efecto de brillo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/30 to-transparent animate-shimmer rounded-lg"></div>
          </div>
        </div>

        {/* Texto con animación */}
        <div className={`mt-12 transition-all duration-1000 ease-out ${
          showText 
            ? 'animate-fade-in-up' 
            : 'translate-y-4 opacity-0'
        }`}>
          <h1 className="splash-title text-center mb-4">
            Transformación Digital SENIAT
          </h1>
          <p className="splash-acronym text-center mb-4">
            DataFiscal
          </p>
          <p className="splash-subtitle text-center mb-3">
            Rumbo a las 7T - Tecnología, Transparencia y Transformación
          </p>
          <p className="splash-description text-center">
            Plataforma integral para la gestión, análisis y reportes de datos fiscales
          </p>
        </div>

        {/* Indicador de carga */}
        <div className={`mt-8 transition-all duration-500 ease-out ${
          showText ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Línea de progreso sutil */}
        <div className={`mt-6 w-64 h-2 bg-gray-200 rounded-full overflow-hidden transition-all duration-500 ease-out ${
          showText ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full" style={{
            animation: 'progress 4s ease-in-out infinite'
          }}></div>
        </div>
      </div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-float ${
              i % 3 === 0 ? 'w-2 h-2 bg-blue-400/30' : 
              i % 3 === 1 ? 'w-1 h-1 bg-blue-500/20' : 
              'w-0.5 h-0.5 bg-blue-600/15'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>


    </div>
  );
} 