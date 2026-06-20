import { redirect } from "next/navigation";
import { getUserFromJwt } from "@/lib/auth-server";
import Navbar from "@/components/Navbar";
import FacultyDashboardContent from "./FacultyDashboardContent";

export default async function FacultyDashboard() {
  const user = await getUserFromJwt();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <FacultyDashboardContent user={user} />
    </div>
  );
}
