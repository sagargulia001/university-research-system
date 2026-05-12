import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const REQUESTABLE_ROLES = ["FACULTY", "HOD", "DEAN", "VC"] as const;
type RequestableRole = (typeof REQUESTABLE_ROLES)[number];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role, department, college, reason } = body;
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

    if (!REQUESTABLE_ROLES.includes(normalizedRole as RequestableRole)) {
      return NextResponse.json(
        { message: "Select a valid faculty access role" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account already exists for this email" },
        { status: 409 }
      );
    }

    const existingPendingRequest = await prisma.accessRequest.findFirst({
      where: {
        email: normalizedEmail,
        status: "PENDING",
      },
    });

    if (existingPendingRequest) {
      return NextResponse.json(
        { message: "An access request is already waiting for admin review" },
        { status: 200 }
      );
    }

    const newRequest = await prisma.accessRequest.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        role: normalizedRole as RequestableRole,
        department: department ? String(department).trim() : null,
        college: college ? String(college).trim() : null,
        reason: reason ? String(reason).trim() : null,
      },
    });

    return NextResponse.json(
      {
        message: "Access request submitted successfully",
        request: newRequest,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Request Access Error:", error);
    return NextResponse.json(
      { message: "An error occurred while saving your request" },
      { status: 500 }
    );
  }
}
