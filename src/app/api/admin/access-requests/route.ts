import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    // Fetch pending access requests
    const accessRequests = await prisma.accessRequest.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch revoked (INACTIVE) users
    const revokedUsers = await prisma.user.findMany({
      where: {
        status: "INACTIVE",
        role: { not: "ADMIN" }, // Exclude admin users
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        college: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Convert revoked users to AccessRequest format for consistent display
    const revokedAsRequests = revokedUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      college: user.college,
      reason: null,
      status: "REVOKED" as const,
      createdAt: user.createdAt,
      // Add metadata for frontend
      _type: "revoked_user" as const,
      _revokedAt: user.updatedAt,
    }));

    // Combine both with pending requests first
    const allRequests = [...accessRequests, ...revokedAsRequests];

    return NextResponse.json(allRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching access requests:", error);
    return NextResponse.json(
      { message: "Failed to fetch access requests" },
      { status: 500 }
    );
  }
}
