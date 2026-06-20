import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Navbar from "@/components/Navbar";
import DepartmentContent from "./DepartmentContent";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

type UserRole = "faculty" | "hod" | "dean" | "vc" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

function getUserDataFromRole(id: string, role: UserRole): User {
  const mockData: Record<UserRole, Omit<User, "id" | "role">> = {
    faculty: { name: "Dr. John Smith", email: "faculty@university.edu" },
    hod: { name: "Dr. Sarah Johnson", email: "hod@university.edu" },
    dean: { name: "Prof. Michael Williams", email: "dean@university.edu" },
    vc: { name: "Dr. Robert Brown", email: "vc@university.edu" },
    admin: { name: "Admin User", email: "admin@university.edu" },
  };

  return {
    id,
    role,
    ...mockData[role],
  };
}

export default async function DepartmentPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) redirect("/");

  let user: User;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: UserRole };
    user = getUserDataFromRole(decoded.id, decoded.role);
    
    // Department dashboards are limited to HODs and higher academic roles.
    if (!["hod", "dean", "vc"].includes(user.role)) {
      redirect("/dashboard");
    }
  } catch {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <DepartmentContent user={user} />
    </div>
  );
}
