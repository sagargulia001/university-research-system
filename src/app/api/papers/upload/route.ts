// src/app/api/papers/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

interface JWTPayload {
  id: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // 2. Get form data
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const authors = formData.get("authors") as string;
    const abstract = formData.get("abstract") as string;
    const keywords = formData.get("keywords") as string;
    const pdfFile = formData.get("pdf") as File;

    // 3. Validate required fields
    if (!title || !pdfFile) {
      return NextResponse.json(
        { error: "Title and PDF file are required" },
        { status: 400 }
      );
    }

    // 4. Validate file type
    if (pdfFile.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // 5. Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (pdfFile.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 50MB" },
        { status: 400 }
      );
    }

    // 6. Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const sanitizedOriginalName = pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${timestamp}_${randomString}_${sanitizedOriginalName}`;

    // 7. Ensure upload directory exists
    const uploadDir = join(process.cwd(), "public", "uploads", "papers");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 8. Save file to disk
    const filePath = join(uploadDir, uniqueFilename);
    const buffer = Buffer.from(await pdfFile.arrayBuffer());
    await writeFile(filePath, buffer);

    // 9. Get user details for department/college
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        department: true,
        college: true,
      },
    });

    // 10. Create database record
    const paper = await prisma.paper.create({
      data: {
        title,
        authors: authors || null,
        abstract: abstract || null,
        keywords: keywords || null,
        pdfUrl: `/uploads/papers/${uniqueFilename}`,
        uploadedById: decoded.id,
        department: user?.department || null,
        college: user?.college || null,
      },
    });

    return NextResponse.json({
      message: "Paper uploaded successfully",
      paper: {
        id: paper.id,
        title: paper.title,
        pdfUrl: paper.pdfUrl,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
