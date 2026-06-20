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
    
    const targetDept = request.nextUrl.searchParams.get("dept");

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { department: true, college: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const role = user.role.toLowerCase();
    
    let queryDepartment = targetDept || user.department;

    // Higher roles may drill into departments outside their own assignment.
    if (targetDept && targetDept !== user.department) {
      if (role === "dean" || role === "vc" || role === "admin") {
        queryDepartment = targetDept;
      } else {
        return NextResponse.json(
          { message: "Forbidden: You cannot view other departments" }, 
          { status: 403 }
        );
      }
    }

    // A department is required when there is no assigned department or drill-down target.
    if (!queryDepartment) {
      return NextResponse.json(
        { message: "No department specified or assigned." }, 
        { status: 404 }
      );
    }

    const papers = await prisma.paper.findMany({
      where: { department: queryDepartment },
      select: {
        id: true,
        downloads: true,
        uploadedById: true,
        submittedDate: true,
      },
    });

    const faculty = await prisma.user.findMany({
      where: { department: queryDepartment },
      select: { id: true, name: true, email: true },
    });

    const yearsSet = new Set<number>();
    papers.forEach((p) => yearsSet.add(new Date(p.submittedDate).getFullYear()));
    const availableYears = Array.from(yearsSet).sort((a, b) => b - a);

    const facultyStats = faculty.map((f) => {
      const facultyPapers = papers.filter((p) => p.uploadedById === f.id);
      const papersByYear: Record<string, number> = {};
      const downloadsByYear: Record<string, number> = {};

      facultyPapers.forEach((p) => {
        const year = new Date(p.submittedDate).getFullYear().toString();
        papersByYear[year] = (papersByYear[year] || 0) + 1;
        downloadsByYear[year] = (downloadsByYear[year] || 0) + p.downloads;
      });

      return {
        id: f.id,
        name: f.name,
        email: f.email,
        papers: facultyPapers.length,
        downloads: facultyPapers.reduce((sum, p) => sum + p.downloads, 0),
        papersByYear,
        downloadsByYear,
      };
    });

    const totalPapers = papers.length;
    const totalDownloads = papers.reduce((sum, p) => sum + p.downloads, 0);

    const response = NextResponse.json({
      department: queryDepartment,
      totalFaculty: faculty.length,
      totalPapers,
      totalDownloads,
      avgDownloadsPerPaper: totalPapers > 0 ? parseFloat((totalDownloads / totalPapers).toFixed(1)) : 0,
      availableYears,
      facultyStats: facultyStats.sort((a, b) => b.papers - a.papers),
    });
    // Cache headers: private + medium TTL for authenticated user data
    response.headers.set("Cache-Control", "private, max-age=300, must-revalidate");
    return response;

  } catch (error) {
    console.error("Error fetching department stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch department statistics" },
      { status: 500 }
    );
  }
}
