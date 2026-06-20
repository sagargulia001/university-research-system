import { cache } from "react";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export type UserRole = "faculty" | "hod" | "dean" | "vc" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthPayload {
  id: string;
  role: string;
}

/**
 * Server-side cached auth helper. Wraps jwt.verify() + prisma.user.findUnique()
 * in React's cache() so it only runs once per request, not once per component.
 * Eliminates N+1 auth lookups on dashboard pages.
 */
export const getUserFromJwt = cache(async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!dbUser) return null;

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role.toLowerCase() as UserRole,
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
});
