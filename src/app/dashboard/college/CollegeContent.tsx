"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type UserRole = "faculty" | "hod" | "dean" | "vc" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface CollegeContentProps {
  user: User;
}

export default function CollegeContent({ user }: CollegeContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [stats, setStats] = useState<{
    college: string;
    totalFaculty: number;
    totalDepartments: number;
    totalPapers: number;
    totalDownloads: number;
    papersThisYear: number;
    departmentStats: Array<{
      name: string;
      faculty: number;
      papers: number;
      downloads: number;
      avgDownloads: string;
      papersThisYear: number;
    }>;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError("");

        // VC drill-downs pass a college in the URL; deans use their assigned college.
        const targetCollege = searchParams.get("college");

        const fetchUrl = targetCollege
          ? `/api/dashboard/college-stats?college=${encodeURIComponent(targetCollege)}`
          : "/api/dashboard/college-stats";

        const res = await fetch(fetchUrl, {
          credentials: "include",
        });
        
        if (!res.ok) throw new Error("Failed to load college stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load statistics");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [searchParams]);

  return (
    <main className="px-6 py-8 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {isLoading ? "College Dashboard" : `College of ${stats?.college || "N/A"}`}
        </h1>
        <p className="mt-1 text-slate-600">
          Welcome, {user.name}! Monitor departmental research output and performance.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-slate-100" />
          ))
        ) : stats ? (
          [
            { label: "Total Departments", value: stats.totalDepartments, icon: "🏢" },
            { label: "Total Papers", value: stats.totalPapers, icon: "📄" },
            { label: "Papers (This Year)", value: stats.papersThisYear, icon: "📅" },
            { label: "Total Downloads", value: stats.totalDownloads, icon: "📥" },
          ].map((stat, index) => (
            <div key={index} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <span className="text-3xl opacity-30">{stat.icon}</span>
              </div>
            </div>
          ))
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
        <h2 className="mb-6 text-xl font-bold text-slate-900">Departmental Statistics</h2>
        
        {isLoading ? (
          <p className="text-center py-8 text-slate-500">Loading department data...</p>
        ) : stats && stats.departmentStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="border border-slate-200 px-6 py-4 text-left text-sm font-semibold text-slate-900">Department Name</th>
                  <th className="border border-slate-200 px-6 py-4 text-center text-sm font-semibold text-slate-900">Faculty</th>
                  <th className="border border-slate-200 px-6 py-4 text-center text-sm font-semibold text-slate-900">Total Papers</th>
                  <th className="border border-slate-200 px-6 py-4 text-center text-sm font-semibold text-slate-900">Papers (This Year)</th>
                  <th className="border border-slate-200 px-6 py-4 text-center text-sm font-semibold text-slate-900">Avg Downloads</th>
                  <th className="border border-slate-200 px-6 py-4 text-center text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.departmentStats.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="border border-slate-200 px-6 py-4 text-sm font-medium text-slate-900">{dept.name}</td>
                    <td className="border border-slate-200 px-6 py-4 text-center">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">{dept.faculty}</span>
                    </td>
                    <td className="border border-slate-200 px-6 py-4 text-center">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">{dept.papers}</span>
                    </td>
                    <td className="border border-slate-200 px-6 py-4 text-center text-sm text-slate-900">
                      {dept.papersThisYear}
                    </td>
                    <td className="border border-slate-200 px-6 py-4 text-center text-sm font-semibold text-slate-900">{dept.avgDownloads}</td>
                    <td className="border border-slate-200 px-6 py-4 text-center">
                      <button 
                        onClick={() => router.push(`/dashboard/department?dept=${encodeURIComponent(dept.name)}`)}
                        className="text-sm font-bold text-blue-600 hover:underline"
                      >
                        Detailed Statistics
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-slate-500">No department data available</p>
        )}
      </div>
    </main>
  );
}
