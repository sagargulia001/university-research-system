import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

type UserRole = "faculty" | "hod" | "dean" | "vc" | "admin";

interface AuthPayload extends JwtPayload {
  id: string;
  role: UserRole;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) redirect("/");

  let userId: string;
  let role: UserRole;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    userId = decoded.id;
    role = decoded.role;
  } catch {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) redirect("/");

  switch (role) {
    case "admin":
      redirect("/admin");
    default:
      redirect("/dashboard/faculty");
  }
}
