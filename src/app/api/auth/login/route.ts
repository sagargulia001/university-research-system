import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function POST(request: NextRequest) {
  try {
    const { email, password, role: requestedRole } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Your account is not active. Please contact an administrator." },
        { status: 403 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Admins use a separate login path from academic staff.
    const userRole = user.role.toLowerCase();

    if (requestedRole === "admin") {
      if (userRole !== "admin") {
        return NextResponse.json({ error: "Access Denied" }, { status: 403 });
      }
    } else if (requestedRole === "faculty") {
      const isAcademicStaff = 
        userRole === "faculty" || 
        userRole === "hod" || 
        userRole === "dean" || 
        userRole === "vc";

      if (!isAcademicStaff) {
        return NextResponse.json({ error: "Access Denied" }, { status: 403 });
      }
    }

    const token = jwt.sign(
      { id: user.id, role: userRole },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRole,
      department: user.department,
      college: user.college,
    };

    const response = NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
    });

    // Keep the auth token out of client-side JavaScript.
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
