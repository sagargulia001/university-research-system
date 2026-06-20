import { redirect } from "next/navigation";
import { getUserFromJwt } from "@/lib/auth-server";
import Navbar from "@/components/Navbar";
import UniversityContent from "./UniversityContent";

export default async function UniversityPage() {
  const user = await getUserFromJwt();

  if (!user) {
    redirect("/");
  }

  // University dashboard access stays VC-only.
  if (user.role !== "vc") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <UniversityContent user={user} />
    </div>
  );
}
