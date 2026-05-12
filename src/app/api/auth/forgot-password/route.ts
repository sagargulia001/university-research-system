import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendCredentialEmail } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { message: "The mail isn't registered, request access" },
        { status: 404 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { message: "The mail isn't registered, request access" },
        { status: 400 }
      );
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log(`Password reset for ${normalizedEmail}. Temporary password generated.`);

    // Send the reset email in the background (Fire and forget)
    sendCredentialEmail(
      user.email,
      user.name,
      tempPassword,
      "temp-password"
    ).catch((err) => {
      console.error("Failed to send password reset email in background:", err);
    });

    return NextResponse.json(
      { message: "Mail with new password has been sent to your registered mail" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password request failed:", error);
    return NextResponse.json(
      { message: "Unable to submit password reset request" },
      { status: 500 }
    );
  }
}
