// src/app/dashboard/university/UniversityContent.tsx
"use client";

import { useState } from "react";

type UserRole = "faculty" | "hod" | "dean" | "vc" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface UniversityContentProps {
  user: User;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function UniversityContent({ user }: UniversityContentProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "departments">("overview");

  // Mock University Stats
  const universityStats = [
    { label: "Total Colleges", value: "5", color: "blue" },
    { label: "Total Departments", value: "32", color: "green" },
    { label: "Total Faculty", value: "856", color: "amber" },
    { label: "Published Papers", value: "2,847", color: "purple" },
  ];

  // Mock Course Stats
  const courseStats = [
    {
      id: 1,
      name: "B.Tech (4-year)",
      colleges: 4,
      departments: 8,
      faculty: 184,
      papers: 612,
      citations: 2845,
    },
    {
      id: 2,
      name: "B.Pharma (4-year)",
      colleges: 3,
      departments: 5,
      faculty: 98,
      papers: 245,
      citations: 1025,
    },
    {
      id: 3,
      name: "M.Tech (2-year)",
      colleges: 4,
      departments: 7,
      faculty: 156,
      papers: 487,
      citations: 1652,
    },
    {
      id: 4,
      name: "M.Sc (2-year)",
      colleges: 3,
      departments: 6,
      faculty: 124,
      papers: 324,
      citations: 892,
    },
    {
      id: 5,
      name: "MBA (2-year)",
      colleges: 2,
      departments: 3,
      faculty: 72,
      papers: 156,
      citations: 412,
    },
    {
      id: 6,
      name: "Ph.D Programs",
      colleges: 5,
      departments: 18,
      faculty: 228,
      papers: 1023,
      citations: 3245,
    },
  ];

  // Mock Department Stats
  const departmentStats = [
    {
      id: 1,
      name: "Computer Science",
      college: "College of Engineering",
      faculty: 56,
      papers: 128,
      citations: 645,
    },
    {
      id: 2,
      name: "Electrical Engineering",
      college: "College of Engineering",
      faculty: 48,
      papers: 94,
      citations: 512,
    },
    {
      id: 3,
      name: "Mechanical Engineering",
      college: "College of Engineering",
      faculty: 52,
      papers: 108,
      citations: 487,
    },
    {
      id: 4,
      name: "Civil Engineering",
      college: "College of Engineering",
      faculty: 44,
      papers: 78,
      citations: 312,
    },
    {
      id: 5,
      name: "Pharmacology",
      college: "College of Pharmacy",
      faculty: 32,
      papers: 64,
      citations: 285,
    },
    {
      id: 6,
      name: "Pharmaceutical Chemistry",
      college: "College of Pharmacy",
      faculty: 28,
      papers: 58,
      citations: 248,
    },
    {
      id: 7,
      name: "Biology",
      college: "College of Science",
      faculty: 36,
      papers: 74,
      citations: 298,
    },
    {
      id: 8,
      name: "Chemistry",
      college: "College of Science",
      faculty: 32,
      papers: 86,
      citations: 412,
    },
  ];

  return (
    <main className="px-6 py-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">University Dashboard</h1>
        <p className="mt-1 text-slate-600">
          University-wide Research Performance & Leadership Analytics
        </p>
      </div>

      {/* University Stats */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">University Stats</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {universityStats.map((stat, index) => (
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
        {["overview", "courses", "departments"].map((tab) => (
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
              : tab === "courses"
              ? "Course Statistics"
              : "Department Statistics"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-900">University Overview</h2>
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-900">Welcome, Vice Chancellor</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Oversee university-wide research initiatives, monitor institutional performance, and lead academic 
                    excellence across all colleges and departments. Access comprehensive statistics on research output, 
                    faculty performance, and course-wise metrics.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">📊 University Overview</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>• 5 Colleges across campus</li>
                      <li>• 32 Departments total</li>
                      <li>• 856 Faculty members</li>
                      <li>• 2,847 published papers</li>
                      <li>• 6 Academic programs offered</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">🎯 Top Programs</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>✓ Ph.D Programs - 1,023 papers, 3,245 citations</li>
                      <li>✓ B.Tech - 612 papers, 2,845 citations</li>
                      <li>✓ M.Tech - 487 papers, 1,652 citations</li>
                      <li>✓ M.Sc - 324 papers, 892 citations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course Stats Tab */}
        {activeTab === "courses" && (
          <div>
            <h2 className="mb-6 text-xl font-bold text-slate-900">Course-wise Statistics</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Course
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Colleges
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Departments
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Faculty
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Papers
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Citations
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courseStats.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-6 py-4 text-sm font-medium text-slate-900">
                        {course.name}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                          {course.colleges}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                          {course.departments}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center">
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                          {course.faculty}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                          {course.papers}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                        {course.citations}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Department Stats Tab */}
        {activeTab === "departments" && (
          <div>
            <h2 className="mb-6 text-xl font-bold text-slate-900">Department-wise Statistics</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Department
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      College
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Faculty
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Papers
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Citations
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departmentStats.map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-6 py-4 text-sm font-medium text-slate-900">
                        {dept.name}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-sm text-slate-600">
                        {dept.college}
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