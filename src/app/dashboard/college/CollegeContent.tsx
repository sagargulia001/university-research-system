// src/app/dashboard/college/CollegeContent.tsx
"use client";

import { useState } from "react";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CollegeContent({ user }: CollegeContentProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "dept-stats" | "comparison">("overview");

  // Mock College Stats
  const collegeStats = [
    { label: "Total Departments", value: "8", color: "blue" },
    { label: "Total Faculty", value: "186", color: "green" },
    { label: "Published Papers", value: "542", color: "amber" },
    { label: "Total Citations", value: "2,374", color: "purple" },
  ];

  // Mock Department Stats
  const departmentStats = [
    {
      id: 1,
      name: "Computer Science",
      faculty: 24,
      papers: 87,
      citations: 432,
      avgCitations: 5.0,
    },
    {
      id: 2,
      name: "Electrical Engineering",
      faculty: 19,
      papers: 64,
      citations: 298,
      avgCitations: 4.7,
    },
    {
      id: 3,
      name: "Psychology",
      faculty: 15,
      papers: 52,
      citations: 187,
      avgCitations: 3.6,
    },
    {
      id: 4,
      name: "Business Administration",
      faculty: 22,
      papers: 78,
      citations: 312,
      avgCitations: 4.0,
    },
    {
      id: 5,
      name: "Mechanical Engineering",
      faculty: 20,
      papers: 69,
      citations: 276,
      avgCitations: 4.0,
    },
    {
      id: 6,
      name: "Chemistry",
      faculty: 18,
      papers: 71,
      citations: 356,
      avgCitations: 5.0,
    },
    {
      id: 7,
      name: "Biology",
      faculty: 16,
      papers: 58,
      citations: 198,
      avgCitations: 3.4,
    },
    {
      id: 8,
      name: "Physics",
      faculty: 17,
      papers: 63,
      citations: 315,
      avgCitations: 5.0,
    },
  ];

  return (
    <main className="px-6 py-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">College Dashboard</h1>
        <p className="mt-1 text-slate-600">
          College of Engineering - Departmental Performance & Analytics
        </p>
      </div>

      {/* College Stats */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">College Stats</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {collegeStats.map((stat, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5"
            >
              <p className="text-sm text-slate-600">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-slate-200 overflow-x-auto">
        {["overview", "dept-stats", "comparison"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab === "overview"
              ? "Overview"
              : tab === "dept-stats"
              ? "Department Statistics"
              : "Department Comparison"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-900">College Overview</h2>
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-900">College of Engineering</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Monitor all department performance, compare research metrics, and analyze college-wide statistics. 
                    This dashboard provides comprehensive insights into your college&apos;s research excellence.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">📊 College Highlights</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>• Computer Science leads with 87 papers</li>
                      <li>• College average citations: 4.4 per paper</li>
                      <li>• Physics & Chemistry top in citation rate (5.0)</li>
                      <li>• 8 departments, 542 total publications</li>
                      <li>• 186 faculty members contributing</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">🎯 Top Performing Departments</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>✓ Computer Science - 87 papers, 432 citations</li>
                      <li>✓ Business Admin - 78 papers, 312 citations</li>
                      <li>✓ Chemistry - 71 papers, 356 citations</li>
                      <li>✓ Mechanical Eng - 69 papers, 276 citations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Department Stats Tab */}
        {activeTab === "dept-stats" && (
          <div>
            <h2 className="mb-6 text-xl font-bold text-slate-900">Department Statistics</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Department
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Faculty
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Papers
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Total Citations
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Avg Citations/Paper
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departmentStats.map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-6 py-4 text-sm font-medium text-slate-900">
                        {dept.name}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                          {dept.faculty}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                          {dept.papers}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center">
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                          {dept.citations}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                        {dept.avgCitations.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Department Comparison Tab */}
        {activeTab === "comparison" && (
          <div>
            <h2 className="mb-6 text-xl font-bold text-slate-900">Department Performance Comparison</h2>
            <div className="space-y-6">
              {/* Papers Published Comparison */}
              <div>
                <h3 className="mb-4 font-semibold text-slate-900">Papers Published by Department</h3>
                <div className="space-y-2">
                  {departmentStats
                    .sort((a, b) => b.papers - a.papers)
                    .map((dept) => (
                      <div key={dept.id} className="flex items-center gap-4">
                        <div className="w-40 text-sm font-medium text-slate-900 truncate">
                          {dept.name}
                        </div>
                        <div className="flex-1 bg-slate-200 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full flex items-center justify-end pr-2"
                            style={{
                              width: `${(dept.papers / 87) * 100}%`,
                            }}
                          >
                            <span className="text-xs font-semibold text-white">
                              {dept.papers}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Average Citations Comparison */}
              <div>
                <h3 className="mb-4 font-semibold text-slate-900">Average Citations per Paper</h3>
                <div className="space-y-2">
                  {departmentStats
                    .sort((a, b) => b.avgCitations - a.avgCitations)
                    .map((dept) => (
                      <div key={dept.id} className="flex items-center gap-4">
                        <div className="w-40 text-sm font-medium text-slate-900 truncate">
                          {dept.name}
                        </div>
                        <div className="flex-1 bg-slate-200 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-green-500 h-full flex items-center justify-end pr-2"
                            style={{
                              width: `${(dept.avgCitations / 5.0) * 100}%`,
                            }}
                          >
                            <span className="text-xs font-semibold text-white">
                              {dept.avgCitations.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}