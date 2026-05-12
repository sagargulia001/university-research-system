// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function POST(request: NextRequest) {
  try {
    const { email, password, role: requestedRole } = await request.json();

    // Find user in database
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

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Role-based access control
    const userRole = user.role.toLowerCase();

    if (requestedRole === "admin") {
      if (userRole !== "admin") {
        return NextResponse.json({ error: "Access Denied" }, { status: 403 });
      }
    } else if (requestedRole === "faculty") {
      // Using OR operators instead of .includes()
      const isAcademicStaff = 
        userRole === "faculty" || 
        userRole === "hod" || 
        userRole === "dean" || 
        userRole === "vc";

      if (!isAcademicStaff) {
        return NextResponse.json({ error: "Access Denied" }, { status: 403 });
      }
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: userRole },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return user data (without password)
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

    // Set httpOnly cookie
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
