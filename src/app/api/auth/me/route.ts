import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

interface JWTPayload {
  id: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        college: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // API responses use lowercase roles across the client.
    const userResponse = {
      ...user,
      role: user.role.toLowerCase(),
    };

    const response = NextResponse.json({ user: userResponse });
    // Cache headers: private + short TTL for authenticated user data
    response.headers.set("Cache-Control", "private, max-age=60, must-revalidate");
    return response;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
  }
}
