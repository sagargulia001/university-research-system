import {NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

interface AuthPayload {
  id: string;
  role: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    const userId = decoded.id;

    const papers = await prisma.paper.findMany({
      where: { uploadedById: userId },
      select: {
        id: true,
        downloads: true,
        submittedDate: true,
      },
    });

    const totalPapers = papers.length;
    const totalDownloads = papers.reduce((sum, p) => sum + p.downloads, 0);
    const avgDownloads = totalPapers > 0 ? Math.round(totalDownloads / totalPapers) : 0;

    const thisYear = new Date().getFullYear();
    const papersThisYear = papers.filter(
      (p) => new Date(p.submittedDate).getFullYear() === thisYear
    ).length;
    const papersLastYear = papers.filter(
      (p) => new Date(p.submittedDate).getFullYear() === thisYear - 1
    ).length;

    const monthlyDownloads: Record<string, number> = {};
    papers.forEach((p) => {
      const date = new Date(p.submittedDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyDownloads[key] = (monthlyDownloads[key] || 0) + p.downloads;
    });

    return NextResponse.json({
      totalPapers,
      totalDownloads,
      avgDownloads,
      papersThisYear,
      papersLastYear,
      monthlyDownloads,
    });
  } catch (error) {
    console.error("Error fetching faculty stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
