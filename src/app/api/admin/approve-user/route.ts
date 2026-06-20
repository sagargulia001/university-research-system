import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { sendCredentialEmail } from "@/lib/mail";

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { requestId } = await request.json();

    if (!requestId) {
      return NextResponse.json(
        { message: "Access request ID is required" },
        { status: 400 }
      );
    }

    const accessRequest = await prisma.accessRequest.findUnique({
      where: { id: requestId },
    });

    if (!accessRequest) {
      return NextResponse.json(
        { message: "Access request not found" },
        { status: 404 }
      );
    }

    if (accessRequest.status !== "PENDING") {
      return NextResponse.json(
        { message: "This access request has already been handled" },
        { status: 400 }
      );
    }

    const temporaryPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: accessRequest.email },
      });
      const createdUser = !existingUser;

      const user = existingUser
        ? await tx.user.update({
            where: { id: existingUser.id },
            data: { status: "ACTIVE" },
          })
        : await tx.user.create({
            data: {
              name: accessRequest.name,
              email: accessRequest.email,
              role: accessRequest.role,
              department: accessRequest.department,
              college: accessRequest.college,
              status: "ACTIVE",
              password: hashedPassword,
            },
          });

      const updatedRequest = await tx.accessRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" },
      });

      return { user, request: updatedRequest, createdUser };
    });

    if (result.createdUser) {
      console.log(
        `Approved access for ${result.user.email}. Temporary password: ${temporaryPassword}`
      );
      
      // Send email in the background so approval returns quickly.
      sendCredentialEmail(
        result.user.email,
        result.user.name,
        temporaryPassword,
        "temp-password"
      ).catch((err) => {
        console.error("Failed to send approval email in background:", err);
      });
    }
    
    const safeUser = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      department: result.user.department,
      college: result.user.college,
      status: result.user.status,
    };

    return NextResponse.json(
      {
        message: "Access request approved",
        user: safeUser,
        temporaryPassword: result.createdUser ? temporaryPassword : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving access request:", error);
    return NextResponse.json(
      { message: "Failed to approve access request" },
      { status: 500 }
    );
  }
}
