import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  IconSettings, 
  IconTools, 
  IconPalette, 
  IconBell, 
  IconMail, 
  IconBrandTelegram, 
  IconBrandWhatsapp,
  IconUser,
  IconShield,
  IconDeviceMobile,
  IconBrandGmail
} from "@tabler/icons-react";

export default function ConfiguracionPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-purple-100 rounded-full">
            <IconSettings className="h-12 w-12 text-purple-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Personalización y configuración avanzada del sistema fiscal
        </p>
      </div>

      {/* Badge de construcción */}
      <div className="flex justify-center">
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 px-4 py-2 text-sm">
          <IconTools className="h-4 w-4 mr-2" />
          Módulo en Desarrollo
        </Badge>
      </div>

      {/* Información principal */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconPalette className="h-6 w-6 text-purple-600" />
            Centro de Personalización
          </CardTitle>
          <CardDescription>
            Configura tu experiencia de usuario y preferencias del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <IconPalette className="h-5 w-5 text-purple-600" />
                Personalización Visual
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Adapta la interfaz de usuario según tus preferencias con temas personalizables, 
                colores institucionales y opciones de accesibilidad para optimizar tu experiencia 
                de trabajo diario.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <IconBell className="h-5 w-5 text-orange-600" />
                Sistema de Notificaciones
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Configura alertas y notificaciones a través de múltiples canales para mantenerte 
                informado sobre eventos importantes del sistema fiscal y actualizaciones críticas.
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <IconShield className="h-5 w-5 text-blue-600" />
              Configuraciones Disponibles
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                <div className="flex items-center gap-2 mb-2">
                  <IconPalette className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium text-gray-900">Temas Visuales</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Selecciona entre temas claros, oscuros o personalizados
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <IconMail className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Notificaciones por Email</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Configura alertas por correo electrónico institucional
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <IconBrandTelegram className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-gray-900">Telegram</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Recibe notificaciones instantáneas en Telegram
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-600">
                <div className="flex items-center gap-2 mb-2">
                  <IconBrandWhatsapp className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-gray-900">WhatsApp</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Alertas directas a tu WhatsApp institucional
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                <div className="flex items-center gap-2 mb-2">
                  <IconUser className="h-5 w-5 text-orange-600" />
                  <h4 className="font-medium text-gray-900">Perfil de Usuario</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Personaliza tu información y preferencias
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center gap-2 mb-2">
                  <IconDeviceMobile className="h-5 w-5 text-red-600" />
                  <h4 className="font-medium text-gray-900">Accesibilidad</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Opciones para mejorar la accesibilidad
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuraciones específicas para fiscal */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconShield className="h-6 w-6 text-blue-600" />
            Configuraciones Especializadas para Fiscal
          </CardTitle>
          <CardDescription>
            Herramientas específicas para funcionarios de la institución fiscal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <IconBrandGmail className="h-5 w-5 text-red-600" />
                Notificaciones Institucionales
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Configura alertas automáticas para eventos críticos como nuevos contribuyentes, 
                pagos pendientes, reportes de auditoría y actualizaciones de normativas fiscales 
                a través de tu correo institucional.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <IconBrandTelegram className="h-5 w-5 text-blue-500" />
                Alertas en Tiempo Real
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Recibe notificaciones instantáneas por Telegram y WhatsApp sobre casos urgentes, 
                alertas de fraude, actualizaciones de cartera y recordatorios de plazos fiscales 
                para mantenerte siempre informado.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <IconShield className="h-4 w-4" />
              Seguridad y Cumplimiento
            </h4>
            <p className="text-sm text-blue-800">
              Todas las configuraciones de notificaciones cumplen con los estándares de seguridad 
              institucionales y están diseñadas para proteger la información fiscal confidencial.
            </p>
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
            Este módulo de configuración está siendo desarrollado para incluir:
          </p>
          <ul className="text-sm text-gray-600 space-y-2 max-w-md mx-auto text-left">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Selector de temas visuales (claro, oscuro, institucional)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Configuración de notificaciones por email
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Integración con Telegram y WhatsApp
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Personalización de dashboard
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Configuración de accesibilidad
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Preferencias de idioma y formato
            </li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            Próximamente disponible para personalizar tu experiencia en Data Fiscal
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 