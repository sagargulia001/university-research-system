import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Update user status back to active
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" }, 
    });
    
    const safeUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      college: updatedUser.college,
      status: updatedUser.status,
    };

    return NextResponse.json(
      { message: "Access reactivated", user: safeUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error reactivating access:", error);
    return NextResponse.json(
      { message: "Failed to reactivate access" },
      { status: 500 }
    );
  }
}