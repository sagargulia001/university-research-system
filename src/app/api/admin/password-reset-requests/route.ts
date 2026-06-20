import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    // Include user details so the admin table can render each request directly.
    const resetRequests = await prisma.passwordResetRequest.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            college: true,
          },
        },
      },
    });

    return NextResponse.json(resetRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching password reset requests:", error);
    // Keep the admin page usable if this secondary list fails.
    return NextResponse.json([], { status: 200 });
  }
}
