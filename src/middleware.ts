import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`🔍 [MIDDLEWARE] Interceptando: ${pathname}`);
  
  // ✅ PERMITIR archivos estáticos y APIs públicas específicas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/fonts') ||
    pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico|css|js|woff|woff2)$/i)
  ) {
    console.log(`✅ [MIDDLEWARE] Permitido (estático): ${pathname}`);
    return NextResponse.next();
  }

  // ✅ PERMITIR solo APIs de autenticación específicas (login/logout)
  if (pathname === '/api/auth/login' || pathname === '/api/auth/logout') {
    console.log(`✅ [MIDDLEWARE] Permitido (API auth pública): ${pathname}`);
    return NextResponse.next();
  }

  // ✅ PERMITIR solo la página de login y la página principal
  if (pathname === '/login' || pathname === '/') {
    console.log(`✅ [MIDDLEWARE] Permitido (página pública): ${pathname}`);
    return NextResponse.next();
  }

  // 🔒 BLOQUEAR TODAS LAS DEMÁS RUTAS - Verificar autenticación
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    console.log(`🚨 [MIDDLEWARE] SIN TOKEN - Bloqueando acceso a: ${pathname}`);
    console.log(`🚨 [MIDDLEWARE] Redirigiendo a /login desde: ${pathname}`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ✅ TOKEN PRESENTE - Permitir acceso
  console.log(`✅ [MIDDLEWARE] Token válido - Permitido acceso a: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Interceptar TODAS las rutas excepto las explícitamente permitidas
    '/((?!_next/static|_next/image|favicon.ico|login|$).*)',
  ],
};
