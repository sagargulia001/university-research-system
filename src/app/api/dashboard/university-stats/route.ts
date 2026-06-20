import { NextResponse } from "next/server";
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

    // University-wide stats are VC-only.
    if (decoded.role.toLowerCase() !== "vc") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const papers = await prisma.paper.findMany({
      select: {
        id: true,
        downloads: true,
        college: true,
        department: true,
        uploadedById: true,
        submittedDate: true,
      },
    });

    const allUsers = await prisma.user.findMany({
      select: { id: true, college: true, department: true },
    });

    const colleges = [...new Set(allUsers.map((u) => u.college).filter(Boolean))] as string[];
    const departments = [...new Set(allUsers.map((u) => u.department).filter(Boolean))] as string[];
    const currentYear = new Date().getFullYear();

    const collegeStats = colleges.map((college) => {
      const collegePapers = papers.filter((p) => p.college === college);
      const collegeFaculty = allUsers.filter((u) => u.college === college);
      const totalDownloads = collegePapers.reduce((sum, p) => sum + p.downloads, 0);
      const papersThisYear = collegePapers.filter(p => new Date(p.submittedDate).getFullYear() === currentYear).length;

      return {
        name: college,
        faculty: collegeFaculty.length,
        papers: collegePapers.length,
        papersThisYear,
        downloads: totalDownloads,
        avgDownloads: collegePapers.length > 0 ? (totalDownloads / collegePapers.length).toFixed(1) : "0",
      };
    });

    const totalPapersThisYear = papers.filter(p => new Date(p.submittedDate).getFullYear() === currentYear).length;

    const response = NextResponse.json({
      totalColleges: colleges.length,
      totalDepartments: departments.length,
      totalFaculty: allUsers.length,
      totalPapers: papers.length,
      totalDownloads: papers.reduce((sum, p) => sum + p.downloads, 0),
      papersThisYear: totalPapersThisYear,
      collegeStats: collegeStats.sort((a, b) => b.papers - a.papers),
    });
    // Cache headers: private + medium TTL for authenticated user data
    response.headers.set("Cache-Control", "private, max-age=300, must-revalidate");
    return response;
  } catch (error) {
    console.error("Error fetching university stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch university statistics" },
      { status: 500 }
    );
  }
}
