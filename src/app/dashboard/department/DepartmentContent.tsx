// src/app/dashboard/department/DepartmentContent.tsx
"use client";

import { useState } from "react";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function DepartmentContent({ user }: DepartmentContentProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "faculty-stats">("overview");

  // Mock Department Stats
  const deptStats = [
    { label: "Total Faculty", value: "24", color: "blue" },
    { label: "Published Papers", value: "87", color: "green" },
    { label: "Total Citations", value: "432", color: "purple" },
    { label: "Avg Citations/Paper", value: "5.0", color: "amber" },
  ];

  // Mock Faculty Stats
  const facultyStats = [
    {
      id: 1,
      name: "Dr. Amit Sharma",
      papers: 8,
      citations: 45,
      lastPublished: "15 Jan 2024",
    },
    {
      id: 2,
      name: "Dr. Neha Verma",
      papers: 6,
      citations: 38,
      lastPublished: "22 Dec 2023",
    },
    {
      id: 3,
      name: "Dr. R. Singh",
      papers: 5,
      citations: 21,
      lastPublished: "10 Nov 2023",
    },
    {
      id: 4,
      name: "Dr. Priya Gupta",
      papers: 7,
      citations: 52,
      lastPublished: "03 Feb 2024",
    },
    {
      id: 5,
      name: "Dr. Rajesh Kumar",
      papers: 9,
      citations: 63,
      lastPublished: "28 Jan 2024",
    },
    {
      id: 6,
      name: "Dr. Anita Desai",
      papers: 4,
      citations: 18,
      lastPublished: "05 Dec 2023",
    },
  ];

  return (
    <main className="px-6 py-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Department Dashboard</h1>
        <p className="mt-1 text-slate-600">
          Computer Science Department - Faculty Performance & Statistics
        </p>
      </div>

      {/* Department Stats */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Department Stats</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {deptStats.map((stat, index) => (
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
      <div className="mb-6 flex gap-4 border-b border-slate-200">
        {["overview", "faculty-stats"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab === "overview" ? "Overview" : "Faculty Statistics"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-900">Department Overview</h2>
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-900">
                    Computer Science Department
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Monitor faculty performance, track research output, and analyze departmental metrics. 
                    This dashboard provides comprehensive insights into your department&apos;s research activities.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">📊 Department Highlights</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>• 24 active faculty members</li>
                      <li>• 87 published research papers</li>
                      <li>• 432 total citations received</li>
                      <li>• 5.0 average citations per paper</li>
                      <li>• Strong research output this year</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">🎯 Top Performers</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>✓ Dr. Rajesh Kumar - 9 papers, 63 citations</li>
                      <li>✓ Dr. Priya Gupta - 7 papers, 52 citations</li>
                      <li>✓ Dr. Amit Sharma - 8 papers, 45 citations</li>
                      <li>✓ Dr. Neha Verma - 6 papers, 38 citations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Faculty Stats Tab */}
        {activeTab === "faculty-stats" && (
          <div>
            <h2 className="mb-6 text-xl font-bold text-slate-900">Faculty Performance Statistics</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Faculty Name
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Papers Published
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Total Citations
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Last Published
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Avg Citations/Paper
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facultyStats.map((faculty) => (
                    <tr key={faculty.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-6 py-4 text-sm font-medium text-slate-900">
                        {faculty.name}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center text-sm text-slate-900">
                        <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                          {faculty.papers}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center text-sm text-slate-900">
                        <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700">
                          {faculty.citations}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-sm text-slate-600">
                        {faculty.lastPublished}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                        {(faculty.citations / faculty.papers).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}