import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`🔍 Middleware ejecutándose para: ${pathname}`);

  // ✅ Permitir archivos estáticos y APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/fonts') ||
    pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico|css|js|woff|woff2)$/i)
  ) {
    return NextResponse.next();
  }

  // ✅ Permitir solo la página de login y la página principal
  if (pathname === '/login' || pathname === '/') {
    return NextResponse.next();
  }

  // 🔒 Verificar autenticación para rutas protegidas
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    console.log(`🔒 Token no encontrado, redirigiendo a login desde: ${pathname}`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ✅ Token encontrado, permitir acceso
  console.log(`✅ Token válido, permitiendo acceso a: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - root (home page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|$).*)',
  ],
};
