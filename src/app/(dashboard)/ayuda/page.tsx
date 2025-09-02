import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconHelp, IconTools, IconBook, IconUsers, IconShield, IconFileReport } from "@tabler/icons-react";

export default function AyudaPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-100 rounded-full">
            <IconHelp className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Centro de Ayuda</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Sistema de apoyo tecnológico para funcionarios de la institución fiscal
        </p>
      </div>

      {/* Badge de construcción */}
      <div className="flex justify-center">
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 px-4 py-2 text-sm">
          <IconTools className="h-4 w-4 mr-2" />
          Módulo en Construcción
        </Badge>
      </div>

      {/* Información principal */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBook className="h-6 w-6 text-blue-600" />
            Acerca de Data Fiscal
          </CardTitle>
          <CardDescription>
            Sistema integral de gestión y análisis fiscal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <IconUsers className="h-5 w-5 text-green-600" />
                Orientado al Funcionario
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Esta aplicación está diseñada específicamente para apoyar a los funcionarios 
                de la institución en sus tareas diarias de gestión fiscal, proporcionando 
                herramientas intuitivas y eficientes para el manejo de información tributaria.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <IconShield className="h-5 w-5 text-purple-600" />
                Estudio Fiscal
              </h3>
              <p className="text-gray-600 leading-relaxed">
                El sistema facilita el análisis y estudio de casos fiscales, permitiendo 
                a los funcionarios acceder a información detallada sobre contribuyentes, 
                pagos ejecutados y cartera de contribuyentes de manera organizada y segura.
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <IconFileReport className="h-5 w-5 text-orange-600" />
              Funcionalidades Principales
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Gestión de Usuarios</h4>
                <p className="text-sm text-gray-600">
                  Administración de perfiles y permisos de funcionarios
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Cartera de Contribuyentes</h4>
                <p className="text-sm text-gray-600">
                  Seguimiento y gestión de la cartera tributaria
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Pagos Ejecutados</h4>
                <p className="text-sm text-gray-600">
                  Control y análisis de pagos procesados
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensaje de construcción */}
      <Card className="max-w-4xl mx-auto border-dashed border-2 border-gray-300">
        <CardHeader>
          <CardTitle className="text-center text-gray-700">
            🚧 Módulo en Desarrollo
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Este módulo de ayuda está siendo desarrollado para proporcionar:
          </p>
          <ul className="text-sm text-gray-600 space-y-2 max-w-md mx-auto text-left">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Guías paso a paso para cada funcionalidad
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Tutoriales interactivos
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Preguntas frecuentes (FAQ)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Videos explicativos
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Documentación técnica
            </li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            Próximamente disponible para mejorar tu experiencia con Data Fiscal
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 