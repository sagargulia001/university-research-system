import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

interface JWTPayload {
  id: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    const papers = await prisma.paper.findMany({
      where: { uploadedById: decoded.id },
      select: {
        id: true,
        title: true,
        authors: true,
        downloads: true,
        pdfUrl: true,
        submittedDate: true,
      },
      orderBy: { submittedDate: "desc" },
    });

    return NextResponse.json({ papers });
  } catch (error) {
    console.error("Failed to fetch papers:", error);
    return NextResponse.json(
      { error: "Failed to fetch papers" },
      { status: 500 }
    );
  }
}
