import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    const resetToken = typeof token === "string" ? token.trim() : "";
    const newPassword = typeof password === "string" ? password : "";

    if (!resetToken || !newPassword) {
      return NextResponse.json(
        { message: "Reset token and password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Reset link is invalid or expired" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
          status: "ACTIVE",
        },
      });

      await tx.passwordResetRequest.updateMany({
        where: { userId: user.id },
        data: { status: "APPROVED" },
      });
    });

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset failed:", error);
    return NextResponse.json(
      { message: "Unable to reset password" },
      { status: 500 }
    );
  }
}
