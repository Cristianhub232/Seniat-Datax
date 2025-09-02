"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconDatabase, IconExternalLink, IconEye, IconEyeOff } from "@tabler/icons-react";

const MetabaseIframe: React.FC = () => {
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showIframe, setShowIframe] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    generateIframeUrl();
  }, []);

  const generateIframeUrl = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Llamada a la API para generar el token JWT
      const response = await fetch("/api/metabase/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al generar el token de Metabase");
      }

      const data = await response.json();
      setIframeUrl(data.iframeUrl);
      setIsLoading(false);
    } catch (err) {
      console.error("Error generando URL del iframe:", err);
      setError("Error al cargar el dashboard de Metabase");
      setIsLoading(false);
    }
  };

  const handleShowIframe = () => {
    setShowIframe(true);
  };

  const handleHideIframe = () => {
    setShowIframe(false);
  };

  if (isLoading) {
    return (
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconDatabase className="h-6 w-6 text-blue-600" />
            Dashboard de Metabase
          </CardTitle>
          <CardDescription>
            Cargando dashboard interactivo de análisis fiscal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconDatabase className="h-6 w-6 text-red-600" />
            Error al Cargar Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={generateIframeUrl} variant="outline">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconDatabase className="h-6 w-6 text-blue-600" />
          Dashboard de Metabase
        </CardTitle>
        <CardDescription>
          Dashboard interactivo de análisis fiscal con datos en tiempo real
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showIframe ? (
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg border-2 border-dashed border-blue-200">
              <IconDatabase className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dashboard Interactivo
              </h3>
              <p className="text-gray-600 mb-4">
                Visualiza análisis avanzados de datos fiscales con gráficos interactivos y reportes en tiempo real
              </p>
              <Button 
                onClick={handleShowIframe}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <IconEye className="h-5 w-5 mr-2" />
                Ver Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Dashboard de Análisis Fiscal
              </h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleHideIframe}
                >
                  <IconEyeOff className="h-4 w-4 mr-2" />
                  Ocultar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <a 
                    href={iframeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <IconExternalLink className="h-4 w-4 mr-2" />
                    Abrir en Nueva Pestaña
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="relative w-full h-[600px] border rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={iframeUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                title="Dashboard de Metabase"
                className="bg-white"
              />
            </div>
            
            <div className="text-sm text-gray-500 text-center">
              <p>Dashboard actualizado en tiempo real • Token válido por 10 minutos</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetabaseIframe; 