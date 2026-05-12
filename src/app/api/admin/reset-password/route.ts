import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
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
        { message: "Request ID is required" },
        { status: 400 }
      );
    }

    // 1. Find the pending request and include the user's data
    const resetReq = await prisma.passwordResetRequest.findUnique({
      where: { id: requestId },
      include: { user: true }, // We need the user's name and email!
    });

    if (!resetReq) {
      return NextResponse.json({ message: "Reset request not found" }, { status: 404 });
    }

    if (resetReq.status !== "PENDING") {
      return NextResponse.json({ message: "This request has already been handled" }, { status: 400 });
    }

    if (!resetReq.user) {
      return NextResponse.json({ message: "Associated user not found in database" }, { status: 404 });
    }

    // 2. Generate a fresh temporary password
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 3. Update BOTH the user's password and the request status at the same time
    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetReq.email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" },
      }),
    ]);

    console.log(`Password reset for ${resetReq.email}. Temp password generated.`);

    // Send the reset email in the background (Fire and forget)
    sendCredentialEmail(
      resetReq.user.email,
      resetReq.user.name,
      tempPassword,
      "temp-password" 
    ).catch((err) => {
      console.error("Failed to send reset email in background:", err);
    });
    
    // 5. Send success back to frontend
    return NextResponse.json(
      {
        message: "Password reset successfully",
        temporaryPassword: tempPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { message: "Failed to reset password" },
      { status: 500 }
    );
  }
}