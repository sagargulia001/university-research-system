import { redirect } from "next/navigation";
import { getUserFromJwt } from "@/lib/auth-server";
import Navbar from "@/components/Navbar";
import CollegeContent from "./CollegeContent";

export default async function CollegePage() {
  const user = await getUserFromJwt();

  if (!user) {
    redirect("/");
  }

  // College dashboards are limited to deans and VCs.
  if (!["dean", "vc"].includes(user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <CollegeContent user={user} />
    </div>
  );
}
