import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

interface AuthPayload {
  id: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    
    const targetCollege = request.nextUrl.searchParams.get("college");

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { college: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const role = user.role.toLowerCase();
    
    let queryCollege = targetCollege || user.college;

    // Higher roles may drill into colleges outside their own assignment.
    if (targetCollege && targetCollege !== user.college) {
      if (role === "vc" || role === "admin") {
        queryCollege = targetCollege;
      } else {
        return NextResponse.json(
          { message: "Forbidden: You cannot view other colleges" }, 
          { status: 403 }
        );
      }
    }

    // A college is required when there is no assigned college or drill-down target.
    if (!queryCollege) {
      return NextResponse.json(
        { message: "No college specified or assigned." }, 
        { status: 404 }
      );
    }

    const currentYear = new Date().getFullYear();

    const papers = await prisma.paper.findMany({
      where: { college: queryCollege },
      select: {
        id: true,
        downloads: true,
        department: true,
        submittedDate: true,
      },
    });

    const facultyInCollege = await prisma.user.findMany({
      where: { college: queryCollege },
      select: { id: true, department: true },
    });

    const departments = [...new Set(facultyInCollege.map((f) => f.department).filter(Boolean))] as string[];

    const departmentStats = departments.map((dept) => {
      const deptPapers = papers.filter((p) => p.department === dept);
      const deptFaculty = facultyInCollege.filter((f) => f.department === dept);
      const totalDownloads = deptPapers.reduce((sum, p) => sum + p.downloads, 0);
      
      const papersThisYear = deptPapers.filter(
        (p) => new Date(p.submittedDate).getFullYear() === currentYear
      ).length;
      
      return {
        name: dept,
        faculty: deptFaculty.length,
        papers: deptPapers.length,
        downloads: totalDownloads,
        avgDownloads: deptPapers.length > 0 ? (totalDownloads / deptPapers.length).toFixed(1) : "0",
        papersThisYear,
      };
    });

    const totalPapersThisYear = papers.filter(
      (p) => new Date(p.submittedDate).getFullYear() === currentYear
    ).length;

    return NextResponse.json({
      college: queryCollege,
      totalFaculty: facultyInCollege.length,
      totalDepartments: departments.length,
      totalPapers: papers.length,
      totalDownloads: papers.reduce((sum, p) => sum + p.downloads, 0),
      papersThisYear: totalPapersThisYear,
      departmentStats: departmentStats.sort((a, b) => b.papers - a.papers),
    });
    
  } catch (error) {
    console.error("Error fetching college stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch college statistics" }, 
      { status: 500 }
    );
  }
}
