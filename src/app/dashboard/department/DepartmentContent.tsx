// src/app/dashboard/department/DepartmentContent.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

type UserRole = "faculty" | "hod" | "dean" | "vc" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface DepartmentContentProps {
  user: User;
}

interface FacultyStat {
  id: string;
  name: string;
  email: string;
  papers: number;
  downloads: number;
  papersThisYear: number;
  downloadsThisYear: number;
  papersByYear: Record<string, number>;
  downloadsByYear: Record<string, number>;
}

interface DepartmentStats {
  department: string;
  totalFaculty: number;
  totalPapers: number;
  totalDownloads: number;
  avgDownloadsPerPaper: number;
  papersThisYear: number;
  facultyStats: FacultyStat[];
  availableYears: number[];
}

export default function DepartmentContent({ user }: DepartmentContentProps) {
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError("");

        const targetDept = searchParams.get("dept"); 
        
        const fetchUrl = targetDept 
          ? `/api/dashboard/department-stats?dept=${encodeURIComponent(targetDept)}` 
          : "/api/dashboard/department-stats";

        const res = await fetch(fetchUrl, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load department stats");
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

  // Filter faculty stats based on selected year
  const getFilteredFacultyStats = () => {
    if (!stats) return [];
    if (selectedYear === "all") return stats.facultyStats;

    return stats.facultyStats.map((faculty) => ({
      ...faculty,
      papers: faculty.papersByYear?.[selectedYear] ?? 0,
      downloads: faculty.downloadsByYear?.[selectedYear] ?? 0,
    }));
  };

  // Get filtered summary stats
  const getFilteredStats = () => {
    if (!stats) return null;
    if (selectedYear === "all") {
      return {
        totalPapers: stats.totalPapers,
        totalDownloads: stats.totalDownloads,
        avgDownloadsPerPaper: stats.avgDownloadsPerPaper,
      };
    }

    const filtered = getFilteredFacultyStats();
    const totalPapers = filtered.reduce((sum, f) => sum + f.papers, 0);
    const totalDownloads = filtered.reduce((sum, f) => sum + f.downloads, 0);
    return {
      totalPapers,
      totalDownloads,
      avgDownloadsPerPaper: totalPapers > 0
        ? parseFloat((totalDownloads / totalPapers).toFixed(1))
        : 0,
    };
  };

  const filteredFaculty = getFilteredFacultyStats();
  const filteredStats = getFilteredStats();

  // Build year options from available years
  const currentYear = new Date().getFullYear();
  const yearOptions = stats?.availableYears?.length
    ? stats.availableYears
    : [currentYear, currentYear - 1, currentYear - 2];

  return (
    <main className="px-6 py-8 font-sans">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {isLoading ? "Department Dashboard" : `Department of ${stats?.department || "N/A"}`}
        </h1>
        <p className="mt-1 text-slate-600">
          Welcome, {user.name}! Monitor faculty performance and research output.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Department Stats</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                <div className="h-8 bg-slate-200 rounded w-1/2" />
              </div>
            ))
          ) : stats ? (
            [
              { label: "Total Faculty", value: stats.totalFaculty, icon: "👥" },
              { label: selectedYear === "all" ? "Total Papers" : `Papers (${selectedYear})`, value: filteredStats?.totalPapers ?? 0, icon: "📄" },
              { label: selectedYear === "all" ? "Total Downloads" : `Downloads (${selectedYear})`, value: filteredStats?.totalDownloads ?? 0, icon: "📥" },
              { label: "Avg Downloads/Paper", value: filteredStats?.avgDownloadsPerPaper ?? 0, icon: "📊" },
            ].map((stat, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 hover:shadow-md transition-shadow"
              >
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
      </div>

      {/* Faculty Stats Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl ring-1 ring-slate-900/5">

        {/* Table Header with Year Filter */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-bold text-slate-900">Faculty Performance Statistics</h2>

          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Years</option>
              {yearOptions.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <p className="text-center text-slate-500 py-8">Loading faculty data...</p>
        ) : filteredFaculty.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Faculty Name
                  </th>
                  <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Email
                  </th>
                  <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                    Papers {selectedYear !== "all" ? `(${selectedYear})` : ""}
                  </th>
                  <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                    Downloads {selectedYear !== "all" ? `(${selectedYear})` : ""}
                  </th>
                  <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                    Avg Downloads/Paper
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFaculty.map((faculty) => (
                  <tr key={faculty.id} className="hover:bg-slate-50">
                    <td className="border border-slate-300 px-6 py-4 text-sm font-medium text-slate-900">
                      {faculty.name}
                    </td>
                    <td className="border border-slate-300 px-6 py-4 text-sm text-slate-600">
                      {faculty.email}
                    </td>
                    <td className="border border-slate-300 px-6 py-4 text-center">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                        {faculty.papers}
                      </span>
                    </td>
                    <td className="border border-slate-300 px-6 py-4 text-center">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                        {faculty.downloads}
                      </span>
                    </td>
                    <td className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      {faculty.papers > 0
                        ? (faculty.downloads / faculty.papers).toFixed(1)
                        : "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8">
            {selectedYear !== "all"
              ? `No faculty data for ${selectedYear}`
              : "No faculty data available"}
          </p>
        )}
      </div>
    </main>
  );
}