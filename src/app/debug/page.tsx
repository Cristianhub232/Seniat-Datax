'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Página de Debug ✅
        </h1>
        <p className="text-gray-600 mb-4">
          Si puedes ver esta página, el servidor está funcionando correctamente.
        </p>
        <div className="mb-4">
          <p className="text-sm text-gray-500">Contador: {count}</p>
          <button
            onClick={() => setCount(count + 1)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Incrementar
          </button>
        </div>
        <div className="space-y-2">
          <a
            href="/"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors inline-block mr-2"
          >
            Ir a Home
          </a>
          <a
            href="/test-splash"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors inline-block"
          >
            Test Splash
          </a>
        </div>
      </div>
    </div>
  );
} 