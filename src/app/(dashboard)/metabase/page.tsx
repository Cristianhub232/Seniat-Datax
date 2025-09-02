import React from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MetabaseIframe from "@/components/MetabaseIframe";
import { 
  IconTools, 
  IconDatabase, 
  IconChartBar, 
  IconUsers, 
  IconAlertTriangle, 
  IconFileReport,
  IconTrendingUp,
  IconShield,
  IconGraph,
  IconBuilding,
  IconCalculator,
  IconTarget
} from "@tabler/icons-react";

export default function MetabasePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header con Banner */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative w-full max-w-4xl h-48 rounded-xl overflow-hidden shadow-2xl">
            <Image
              src="/metabase_logo_icon_168103.png"
              alt="Metabase Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        {/* Descripción */}
        <div className="space-y-4">
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Plataforma Integral de Reportería Masiva e Integradora de Modelos de Datos
          </p>
          
          {/* Botón de acceso directo */}
          <div className="flex justify-center">
            <Button 
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <a 
                href="http://172.16.56.23:3000/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <IconDatabase className="h-5 w-5" />
                Acceder a Metabase
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Badge de construcción */}
      <div className="flex justify-center">
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 px-4 py-2 text-sm">
          <IconTools className="h-4 w-4 mr-2" />
          Módulo en Desarrollo
        </Badge>
      </div>

      {/* Introducción */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconDatabase className="h-6 w-6 text-blue-600" />
            Plataforma Integral de Análisis Fiscal
          </CardTitle>
          <CardDescription>
            Metabase se presenta como la solución definitiva para la reportería masiva y la integración de modelos de datos fiscales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <IconGraph className="h-5 w-5 text-green-600" />
                Reportería Masiva
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Genera reportes masivos automatizados que integran múltiples fuentes de datos fiscales, 
                proporcionando una visión holística y en tiempo real del panorama tributario regional.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <IconShield className="h-5 w-5 text-purple-600" />
                Integración de Modelos
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Conecta y correlaciona diferentes modelos de datos fiscales, permitiendo análisis 
                cruzados y descubrimiento de patrones ocultos en la información tributaria.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análisis Específicos de Contribuyentes */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-6 w-6 text-blue-600" />
            Análisis Específicos de Contribuyentes
          </CardTitle>
          <CardDescription>
            Dashboard especializado para el seguimiento y análisis detallado de contribuyentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <IconUsers className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Contribuyentes Especiales</h4>
              </div>
              <p className="text-sm text-gray-600">
                Cantidad y distribución de contribuyentes especiales en la región con análisis de comportamiento fiscal
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <IconBuilding className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-gray-900">Contribuyentes Ordinarios</h4>
              </div>
              <p className="text-sm text-gray-600">
                Seguimiento de contribuyentes ordinarios con métricas de cumplimiento y tendencias de declaración
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <IconAlertTriangle className="h-5 w-5 text-red-600" />
                <h4 className="font-medium text-gray-900">Declarando en Cero</h4>
              </div>
              <p className="text-sm text-gray-600">
                Identificación y análisis de contribuyentes que declaran en cero, con alertas de riesgo fiscal
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <IconTarget className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium text-gray-900">Compromisos Vencidos</h4>
              </div>
              <p className="text-sm text-gray-600">
                Seguimiento de compromisos de pagos vencidos con análisis de morosidad y estrategias de cobro
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <IconCalculator className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium text-gray-900">RIF Vencido</h4>
              </div>
              <p className="text-sm text-gray-600">
                Contribuyentes especiales con RIF vencido, incluyendo alertas automáticas y seguimiento de renovación
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
              <div className="flex items-center gap-2 mb-2">
                <IconTrendingUp className="h-5 w-5 text-cyan-600" />
                <h4 className="font-medium text-gray-900">Tendencias Regionales</h4>
              </div>
              <p className="text-sm text-gray-600">
                Análisis de tendencias fiscales por región, sector económico y tipo de contribuyente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Interactivo de Metabase */}
      <MetabaseIframe />

      {/* Funcionalidades Avanzadas */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconChartBar className="h-6 w-6 text-blue-600" />
            Funcionalidades Avanzadas de Análisis
          </CardTitle>
          <CardDescription>
            Herramientas especializadas para el análisis profundo de datos fiscales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <IconFileReport className="h-5 w-5 text-green-600" />
                Reportes Inteligentes
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Análisis de morosidad por sector económico
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Seguimiento de contribuyentes de alto riesgo
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Reportes de cumplimiento por región
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Análisis de tendencias de declaración
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <IconTrendingUp className="h-5 w-5 text-purple-600" />
                Dashboards Interactivos
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  Visualización de cartera por tipo de contribuyente
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  Mapeo geográfico de contribuyentes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  Análisis de comportamiento fiscal
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  Predicciones de riesgo fiscal
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensaje de construcción */}
      <Card className="max-w-4xl mx-auto border-dashed border-2 border-gray-300">
        <CardHeader>
          <CardTitle className="text-center text-gray-700">
            🚧 Integración en Progreso
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            La integración con Metabase está siendo desarrollada para proporcionar:
          </p>
          <ul className="text-sm text-gray-600 space-y-2 max-w-md mx-auto text-left">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Conexión directa con la base de datos fiscal
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Dashboard personalizado para cada rol
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Reportes interactivos y exportables
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Alertas y notificaciones automáticas
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Análisis predictivo y estadístico
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Integración con múltiples fuentes de datos
            </li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            Próximamente disponible para análisis avanzado de datos fiscales
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 