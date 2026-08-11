import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// ── Set to false when maintenance is over and redeploy ────────────────────────
const MAINTENANCE_MODE = false;

export default withAuth(
  function middleware(req: NextRequest) {
    if (MAINTENANCE_MODE) {
      return NextResponse.redirect(new URL("/maintenance", req.url));
    }
    if (req.nextUrl.pathname.startsWith("/auth/login")) {
      return NextResponse.next();
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (MAINTENANCE_MODE) return true;
        const isAuthPage = req.nextUrl.pathname.startsWith("/auth/login");
        if (isAuthPage) return true;
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  // Static assets in public/ must be excluded. Without this, an asset requested
  // by a logged-out user was redirected to /auth/login: the Indian Railways
  // logo on the login page never loaded, and firebase-messaging-sw.js could not
  // register ("script resource is behind a redirect"), so push notifications
  // did not work at all. (issue PGT-1)
  matcher: [
    "/((?!_next|api/auth|favicon.ico|maintenance|firebase-messaging-sw\\.js|manifest\\.json|sw\\.js|workbox-.*|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|json|txt|xml|woff|woff2|ttf|otf|mp4|webm)$).*)",
  ],
};
