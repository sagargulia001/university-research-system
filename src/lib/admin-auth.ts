import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

interface AdminTokenPayload {
  id: string;
  role: string;
}

export function requireAdmin(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Admin authentication required" },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    return null;
  } catch (error) {
    console.error("Admin auth failed:", error);
    return NextResponse.json(
      { message: "Invalid admin session" },
      { status: 401 }
    );
  }
}
