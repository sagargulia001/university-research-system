import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    // Fetch pending password reset requests AND stitch the user data
    // right into it natively using Prisma's "include" or "select"
    const resetRequests = await prisma.passwordResetRequest.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
      // This single block replaces the manual mapping logic entirely!
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

    // Because of the 'include' above, Prisma automatically formats the 
    // result exactly how your frontend expects it.
    return NextResponse.json(resetRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching password reset requests:", error);
    // Return empty array instead of error to prevent cascading failures
    return NextResponse.json([], { status: 200 });
  }
}