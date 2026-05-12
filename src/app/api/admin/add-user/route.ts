import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { sendCredentialEmail } from "@/lib/mail";

const USER_ROLES = ["FACULTY", "HOD", "DEAN", "VC", "ADMIN"] as const;
type UserRole = (typeof USER_ROLES)[number];

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { name, email, role, department, college } = await request.json();
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedRole =
      typeof role === "string" ? role.trim().toUpperCase() : "";

    if (!name || !normalizedEmail || !normalizedRole) {
      return NextResponse.json(
        { message: "Name, email, and role are required" },
        { status: 400 }
      );
    }

    if (!USER_ROLES.includes(normalizedRole as UserRole)) {
      return NextResponse.json(
        { message: "Select a valid role" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    const tempPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        role: normalizedRole as UserRole,
        department: department ? String(department).trim() : null,
        college: college ? String(college).trim() : null,
        status: "ACTIVE",
        password: hashedPassword,
      },
    });

    console.log(
      `New user created with email: ${normalizedEmail}`
    );

    sendCredentialEmail(
      normalizedEmail,
      String(name).trim(),
      tempPassword,
      "temp-password"
    ).catch((err) => {
      console.error("Failed to send welcome email in background:", err);
    });

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      college: newUser.college,
      status: newUser.status,
    };

    return NextResponse.json(
      {
        message: "User added successfully",
        user: safeUser,
        temporaryPassword: tempPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json(
      { message: "Failed to add user" },
      { status: 500 }
    );
  }
}