// src/app/upload/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import UploadPaperForm from "./UploadPaperForm";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

type UserRole = "faculty" | "hod" | "dean" | "vc" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export default async function UploadPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) redirect("/");

  let user: User;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!dbUser) redirect("/");

    user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role.toLowerCase() as UserRole,
    };
  } catch {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <UploadPaperForm user={user} />
    </div>
  );
}
