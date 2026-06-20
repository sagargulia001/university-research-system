import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const accessRequests = await prisma.accessRequest.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Revoked users appear in the same queue as access requests.
    const revokedUsers = await prisma.user.findMany({
      where: {
        status: "INACTIVE",
        role: { not: "ADMIN" },
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
      // Mark synthetic rows so the admin UI can distinguish them.
      _type: "revoked_user" as const,
      _revokedAt: user.updatedAt,
    }));

    const allRequests = [...accessRequests, ...revokedAsRequests];

    const response = NextResponse.json(allRequests, { status: 200 });
    // Cache headers: private + short TTL for time-sensitive admin data
    response.headers.set("Cache-Control", "private, max-age=60, must-revalidate");
    return response;
  } catch (error) {
    console.error("Error fetching access requests:", error);
    return NextResponse.json(
      { message: "Failed to fetch access requests" },
      { status: 500 }
    );
  }
}
