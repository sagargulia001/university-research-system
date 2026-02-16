"use client";

import { useState } from "react";
// import Link from "next/link";
import { useRouter } from "next/navigation";


export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"requests" | "faculty-access" | "password-reset">("requests");

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      // Redirect to home page
      router.push("/");
      router.refresh(); // Clear cache
    } catch (error) {
      console.error("Logout failed:", error);
      // Still redirect even if logout fails
      router.push("/");
    }
  };

  // Mock data for pending faculty access requests
  const accessRequests = [
    {
      id: 1,
      name: "Dr. Priya Gupta",
      department: "Computer Science",
      email: "priya.gupta@uni.edu",
      requestDate: "04 Feb 2024",
      status: "Pending",
    },
    {
      id: 2,
      name: "Dr. Rajesh Kumar",
      department: "Electrical Engineering",
      email: "rajesh.kumar@uni.edu",
      requestDate: "03 Feb 2024",
      status: "Pending",
    },
    {
      id: 3,
      name: "Dr. Sarah Johnson",
      department: "Psychology",
      email: "sarah.johnson@uni.edu",
      requestDate: "02 Feb 2024",
      status: "Pending",
    },
  ];

  // Mock data for approved faculty
  const approvedFaculty = [
    {
      id: 1,
      name: "Dr. Amit Sharma",
      department: "Computer Science",
      email: "amit.sharma@uni.edu",
      approvedDate: "15 Jan 2024",
    },
    {
      id: 2,
      name: "Dr. Neha Verma",
      department: "Electrical Engineering",
      email: "neha.verma@uni.edu",
      approvedDate: "20 Dec 2023",
    },
    {
      id: 3,
      name: "Dr. R. Singh",
      department: "Psychology",
      email: "r.singh@uni.edu",
      approvedDate: "10 Dec 2023",
    },
  ];

  // Mock data for password reset requests
  const passwordResetRequests = [
    {
      id: 1,
      name: "Dr. Amit Sharma",
      email: "amit.sharma@uni.edu",
      requestDate: "05 Feb 2024",
      status: "Pending",
    },
    {
      id: 2,
      name: "Dr. Neha Verma",
      email: "neha.verma@uni.edu",
      requestDate: "04 Feb 2024",
      status: "Pending",
    },
  ];

  // Stats
  const stats = [
    { label: "Pending Access Requests", value: accessRequests.length, color: "blue" },
    { label: "Approved Faculty", value: approvedFaculty.length, color: "green" },
    { label: "Password Reset Requests", value: passwordResetRequests.length, color: "amber" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 font-sans">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="mt-1 text-slate-600">Manage faculty access and requests</p>
        </div>

        <button
              onClick={handleLogout}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Logout
            </button>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5"
          >
            <p className="text-sm text-slate-600">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-slate-200">
        {["requests", "faculty-access", "password-reset"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab === "requests"
              ? "Access Requests"
              : tab === "faculty-access"
              ? "Approved Faculty"
              : "Password Resets"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
        {/* Access Requests Tab */}
        {activeTab === "requests" && (
          <div>
            <h2 className="mb-6 text-xl font-bold text-slate-900">
              Faculty Access Requests
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Name
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Department
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Email
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Request Date
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accessRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-6 py-4 text-sm font-medium text-slate-900">
                        {request.name}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-sm text-slate-700">
                        {request.department}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-sm text-slate-600">
                        {request.email}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-sm text-slate-600">
                        {request.requestDate}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 transition-colors">
                            Approve
                          </button>
                          <button className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600 transition-colors">
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {accessRequests.length === 0 && (
              <p className="py-8 text-center text-slate-500">
                No pending access requests.
              </p>
            )}
          </div>
        )}

        {/* Approved Faculty Tab */}
        {activeTab === "faculty-access" && (
          <div>
            <h2 className="mb-6 text-xl font-bold text-slate-900">
              Approved Faculty Members
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Name
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Department
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Email
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Approval Date
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvedFaculty.map((faculty) => (
                    <tr key={faculty.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-6 py-4 text-sm font-medium text-slate-900">
                        {faculty.name}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-sm text-slate-700">
                        {faculty.department}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-sm text-slate-600">
                        {faculty.email}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-sm text-slate-600">
                        {faculty.approvedDate}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center">
                        <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                          Revoke Access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Password Reset Requests Tab */}
        {activeTab === "password-reset" && (
          <div>
            <h2 className="mb-6 text-xl font-bold text-slate-900">
              Password Reset Requests
            </h2>
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
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Request Date
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {passwordResetRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-6 py-4 text-sm font-medium text-slate-900">
                        {request.name}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-sm text-slate-600">
                        {request.email}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-sm text-slate-600">
                        {request.requestDate}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                          {request.status}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center">
                        <button className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 transition-colors">
                          Send Reset Link
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {passwordResetRequests.length === 0 && (
              <p className="py-8 text-center text-slate-500">
                No pending password reset requests.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
