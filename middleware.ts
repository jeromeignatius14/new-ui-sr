import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// ── Set to false when maintenance is over and redeploy ────────────────────────
const MAINTENANCE_MODE = true;

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
  matcher: ["/((?!_next|api/auth|favicon.ico|maintenance).*)"],
};
