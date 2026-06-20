import { redirect } from "next/navigation";
import { getUserFromJwt } from "@/lib/auth-server";
import Navbar from "@/components/Navbar";
import DepartmentContent from "./DepartmentContent";

export default async function DepartmentPage() {
  const user = await getUserFromJwt();

  if (!user) {
    redirect("/");
  }

  // Department dashboards are limited to HODs and higher academic roles.
  if (!["hod", "dean", "vc"].includes(user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <DepartmentContent user={user} />
    </div>
  );
}
