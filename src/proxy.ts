// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/upload",
  "/admin",
];

// Routes that should redirect to dashboard if already logged in
const authRoutes = ["/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  let userRole: string | null = null;

  // Verify token if it exists
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
      userRole = decoded.role;
    } catch (error) {
      // Invalid token - will be treated as not authenticated
      console.error("Invalid token in proxy:", error);
    }
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is auth page (login/landing)
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  // Redirect to login if accessing protected route without valid token
  if (isProtectedRoute && !userRole) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if already logged in and trying to access auth pages
  if (isAuthRoute && userRole) {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  // Role-based access control for specific routes
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (except /api/auth/me which needs protection)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth/login|api/auth/logout|_next/static|_next/image|favicon.ico|public).*)",
  ],
};