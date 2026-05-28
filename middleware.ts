import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Debug middleware execution
const debug = (req: NextRequest, message: string, data?: any) => {
  console.log(`[Middleware] ${message} - URL: ${req.nextUrl.pathname}`, data ? data : '');
};

export default withAuth(
  function middleware(req) {
    debug(req, 'Processing request');
    
    // Allow access to the login page even when authenticated
    if (req.nextUrl.pathname.startsWith('/auth/login')) {
      debug(req, 'Login page access');
      return NextResponse.next();
    }
    
    // For protected routes, the withAuth wrapper will handle authentication
    debug(req, 'Protected route access');
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthenticated = !!token;
        const isAuthPage = req.nextUrl.pathname.startsWith('/auth/login');
        
        debug(req, 'Authorization check', { isAuthenticated, isAuthPage, tokenExists: !!token });
        
        // Allow unauthenticated users to access login page
        if (isAuthPage) {
          return true;
        }
        
        // For all other routes, require authentication
        return isAuthenticated;
      },
    },
    pages: {
      signIn: '/auth/login',
    },
  }
);

export const config = {
  matcher: [
    // Protected routes that require authentication
    '/dashboard/:path*',
    // Auth pages
    '/auth/login',
  ],
};