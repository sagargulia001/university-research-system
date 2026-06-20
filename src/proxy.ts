import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const protectedRoutes = [
  "/dashboard",
  "/upload",
  "/admin",
];

const authRoutes = ["/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  let userRole: string | null = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
      userRole = decoded.role;
    } catch (error) {
      // Bad tokens fall through as unauthenticated requests.
      console.error("Invalid token in proxy:", error);
    }
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) => pathname === route);

  // Protected pages require a valid auth token.
  if (isProtectedRoute && !userRole) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  // Logged-in users should land on their dashboard instead of auth pages.
  if (isAuthRoute && userRole) {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  // Keep admin pages admin-only at the edge.
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Leave public assets and auth endpoints outside the proxy matcher.
    "/((?!api/auth/login|api/auth/logout|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
