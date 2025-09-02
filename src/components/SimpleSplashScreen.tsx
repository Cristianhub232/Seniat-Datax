'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SimpleSplashScreenProps {
  onComplete: () => void;
}

export default function SimpleSplashScreen({ onComplete }: SimpleSplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <Image
          src="/Logo Actual ONT.png"
          alt="Logo ONT"
          width={450}
          height={450}
          className="mx-auto mb-6"
        />
        <h1 className="text-gray-800 text-3xl font-bold mb-3">
          Sistema de Reportes ONT
        </h1>
        <p className="text-gray-600 text-lg mb-2">
          Data Fiscal
        </p>
        <p className="text-gray-500 text-base mb-4">
          Gestión Integral de Planillas
        </p>
        <div className="mt-6 w-48 h-2 bg-gray-200 rounded-full mx-auto">
          <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
} 