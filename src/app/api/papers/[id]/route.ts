// src/app/api/papers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

interface JWTPayload {
  id: string;
  role: string;
}

function getTokenPayload(request: NextRequest): JWTPayload | null {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// POST /api/papers/[id] with action=download — increment downloads & return pdfUrl
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getTokenPayload(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const paper = await prisma.paper.update({
      where: { id },
      data: { downloads: { increment: 1 } },
      select: { pdfUrl: true, downloads: true },
    });

    return NextResponse.json({ pdfUrl: paper.pdfUrl, downloads: paper.downloads });
  } catch (error) {
    console.error("Download increment failed:", error);
    return NextResponse.json(
      { error: "Paper not found" },
      { status: 404 }
    );
  }
}

// DELETE /api/papers/[id] — delete paper, only owner can delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getTokenPayload(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify the paper belongs to the requesting user
    const paper = await prisma.paper.findUnique({
      where: { id },
      select: { uploadedById: true },
    });

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    if (paper.uploadedById !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.paper.delete({ where: { id } });

    return NextResponse.json({ message: "Paper deleted successfully" });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json(
      { error: "Failed to delete paper" },
      { status: 500 }
    );
  }
}