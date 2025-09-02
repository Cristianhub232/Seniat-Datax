// app/layout.tsx

import "./globals.css";
import "@/styles/sidebar-animations.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { UserProvider } from "@/context/UserContext";
import { AppProvider } from "@/context/AppContext";

export const metadata = {
  title: "SENIAT DataFiscal",
  description: "Sistema de Gestión Fiscal SENIAT",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="referrer" content="no-referrer-when-downgrade" />
        <style dangerouslySetInnerHTML={{
          __html: `
            link[rel="icon"], 
            link[rel="shortcut icon"], 
            link[rel="apple-touch-icon"] {
              border-radius: 50% !important;
              overflow: hidden !important;
            }
            .favicon-rounded {
              border-radius: 50% !important;
              overflow: hidden !important;
            }
          `
        }} />
      </head>
      <body className="bg-gray-100 font-inter">
        <AppProvider>
          <AuthProvider>
            <UserProvider>
              <Toaster position="top-right" />
              <main>{children}</main>
            </UserProvider>
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}
