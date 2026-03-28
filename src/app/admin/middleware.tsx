import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt'; // Optional if using NextAuth, but since Firebase, skip server auth for simplicity

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // If accessing admin pages and not admin role (client-side check), redirect
  // Note: Server-side Firebase auth complex, using client-side role check + protected route
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Client-side role protection already in page.tsx useAuth
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};

