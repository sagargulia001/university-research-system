import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

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

    const updatedRequest = await prisma.accessRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });

    return NextResponse.json(
      { message: "Access request rejected", request: updatedRequest },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting access request:", error);
    return NextResponse.json(
      { message: "Failed to reject access request" },
      { status: 500 }
    );
  }
}
