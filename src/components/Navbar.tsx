"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type UserRole = "faculty" | "hod" | "dean" | "vc" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      // Leave the session screen even if the logout request fails.
      router.push("/");
    }
  };

  const getRoleDashboardLink = () => {
    switch (user.role) {
      case "hod":
        return { href: "/dashboard/department", label: "Department" };
      case "dean":
        return { href: "/dashboard/college", label: "College" };
      case "vc":
        return { href: "/dashboard/university", label: "University" };
      case "admin":
        return { href: "/admin", label: "Admin" };
      default:
        return null;
    }
  };

  const roleDashboard = getRoleDashboardLink();

  const navItems = [
    { href: "/dashboard/faculty", label: "My Papers" },
    { href: "/upload", label: "Upload Paper" },
    { href: "/public", label: "Public Research" },
    ...(roleDashboard ? [roleDashboard] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors"
            >
              Research Portal
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full capitalize">
                {user.role}
              </span>
            </div>

            <div className="sm:hidden">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full capitalize">
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="md:hidden mt-4 pt-4 border-t border-slate-200 flex flex-col gap-2">
          <div className="px-4 py-2 mb-2 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
