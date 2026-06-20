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

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Admin accounts cannot be deleted from this endpoint.
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { message: "Cannot delete admin users" },
        { status: 403 }
      );
    }

    // This is a hard delete, not an access revoke.
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`User ${deletedUser.email} (${deletedUser.name}) permanently deleted from system`);

    return NextResponse.json(
      {
        message: "User deleted permanently. They can now request access again.",
        user: {
          id: deletedUser.id,
          name: deletedUser.name,
          email: deletedUser.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Failed to delete user" },
      { status: 500 }
    );
  }
}
