"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext"; // Asegúrate de que la ruta sea correcta
import { toast } from "sonner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn } = useAuth();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value || '');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value || '');
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prevenir múltiples envíos
    if (isSubmitting) {
      return;
    }

    console.log('🔍 Datos del formulario:', { username, password });
    console.log('🔍 Username length:', username?.length);
    console.log('🔍 Password length:', password?.length);
    console.log('🔍 Username type:', typeof username);
    console.log('🔍 Password type:', typeof password);

    // Validación en el frontend
    if (!username || !password || username.trim() === '' || password.trim() === '') {
      toast.error('Por favor, complete todos los campos');
      return;
    }

    // Validar que no sean solo espacios en blanco
    if (username.trim().length === 0 || password.trim().length === 0) {
      toast.error('Los campos no pueden estar vacíos');
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn({ username: username.trim(), password: password.trim() });
      // El toast de éxito ya lo maneja internamente `signIn()`
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al iniciar sesión";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center">
          <img src="/logocr.png" alt="Logo SENIAT" className="h-32 w-auto mb-6" />
          <p className="text-sm text-center text-gray-600 mb-6">
            Sistema de Gestión Fiscal
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario SENIAT
            </label>
            <input
              type="text"
              placeholder="Ingrese su usuario"
              value={username}
              onChange={handleUsernameChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={handlePasswordChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2 rounded" /> Recuérdame
            </label>
            <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
              ¿Olvidó su contraseña?
            </a>
          </div>
          <button
            type="submit"
            aria-busy={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>Cargando...</span>
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
