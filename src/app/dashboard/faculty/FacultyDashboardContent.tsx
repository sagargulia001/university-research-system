// src/app/dashboard/faculty/FacultyDashboardContent.tsx
"use client";

import { useState } from "react";

type UserRole = "faculty" | "hod" | "dean" | "vc" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface FacultyDashboardContentProps {
  user: User;
}

export default function FacultyDashboardContent({ user }: FacultyDashboardContentProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "my-papers" | "statistics">("overview");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState<number | null>(null);

  // Mock Faculty Stats
  const facultyStats = [
    { label: "Papers Published", value: "12", color: "blue" },
    { label: "Total Downloads", value: "860", color: "green" },
    { label: "h-Index", value: "8", color: "purple" },
  ];

  // Mock Faculty Papers
  const [myPapers, setMyPapers] = useState([
    {
      id: 1,
      title: "Advanced Machine Learning Techniques",
      submittedDate: "15 Jan 2024",
      downloads: 245,
    },
    {
      id: 2,
      title: "Deep Learning in Computer Vision",
      submittedDate: "08 Dec 2023",
      downloads: 189,
    },
    {
      id: 3,
      title: "Natural Language Processing Applications",
      submittedDate: "22 Nov 2023",
      downloads: 156,
    },
    {
      id: 4,
      title: "Quantum Computing Fundamentals",
      submittedDate: "18 Mar 2024",
      downloads: 42,
    },
    {
      id: 5,
      title: "Blockchain and Distributed Systems",
      submittedDate: "05 Feb 2024",
      downloads: 128,
    },
  ]);

  // Mock Download Trend (for statistics tab)
  const downloadTrend = [
    { month: "Jan 2024", downloads: 125 },
    { month: "Feb 2024", downloads: 142 },
    { month: "Mar 2024", downloads: 156 },
    { month: "Apr 2024", downloads: 178 },
    { month: "May 2024", downloads: 195 },
    { month: "Jun 2024", downloads: 210 },
  ];

  // Handle delete confirmation
  const handleDeleteClick = (paperId: number) => {
    setPaperToDelete(paperId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (paperToDelete !== null) {
      setMyPapers(myPapers.filter(paper => paper.id !== paperToDelete));
      setDeleteConfirmOpen(false);
      setPaperToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setPaperToDelete(null);
  };

  const handleViewClick = (paperId: number) => {
    // TODO: Implement view paper functionality
    console.log("View paper:", paperId);
    alert(`View paper functionality will be implemented. Paper ID: ${paperId}`);
  };

  const getPaperTitle = (paperId: number) => {
    return myPapers.find(paper => paper.id === paperId)?.title || "";
  };

  return (
    <main className="px-6 py-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Faculty Research Dashboard</h1>
        <p className="mt-1 text-slate-600">
          Welcome back, {user.name}! View and manage your research papers and statistics
        </p>
      </div>

      {/* My Stats */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">My Research Stats</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {facultyStats.map((stat, index) => (
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
        {["overview", "my-papers", "statistics"].map((tab) => (
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
              : tab === "my-papers"
              ? "My Papers"
              : "Statistics"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-900">Welcome to Your Dashboard</h2>
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-900">About Your Dashboard</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Manage your research portfolio and view detailed statistics about your academic work. All your publications are organized in one place for easy access and monitoring.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">📚 Your Activity</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>• 12 papers published</li>
                      <li>• 860 total downloads</li>
                      <li>• h-Index: 8</li>
                      <li>• Last upload: 18 Mar 2024</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">🎯 Quick Actions</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>✓ View and manage publications</li>
                      <li>✓ Monitor paper downloads</li>
                      <li>✓ Compare month-wise statistics</li>
                      <li>✓ Upload papers via navbar</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Papers Tab */}
        {activeTab === "my-papers" && (
          <div>
            <h2 className="mb-6 text-xl font-bold text-slate-900">My Published Papers</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Paper Title
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Submitted Date
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Downloads
                    </th>
                    <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myPapers.map((paper) => (
                    <tr key={paper.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-6 py-4 text-sm font-medium text-slate-900">
                        {paper.title}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-sm text-slate-600">
                        {paper.submittedDate}
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center">
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                          {paper.downloads}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleViewClick(paper.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                          >
                            View
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={() => handleDeleteClick(paper.id)}
                            className="text-rose-600 hover:text-rose-700 text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "statistics" && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-6 text-xl font-bold text-slate-900">Your Research Statistics</h2>

              {/* Download Trend */}
              <div className="mb-8">
                <h3 className="mb-4 font-semibold text-slate-900">Downloads Over Time</h3>
                <div className="space-y-2">
                  {downloadTrend.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium text-slate-900">{item.month}</div>
                      <div className="flex-1 bg-slate-200 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-purple-500 h-full flex items-center justify-end pr-2"
                          style={{
                            width: `${(item.downloads / 210) * 100}%`,
                          }}
                        >
                          <span className="text-xs font-semibold text-white">{item.downloads}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paper Statistics */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Paper Count</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Total Papers</span>
                      <span className="text-2xl font-bold text-slate-900">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">This Year</span>
                      <span className="text-lg font-bold text-blue-600">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Last Year</span>
                      <span className="text-lg font-bold text-slate-600">7</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Download Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">This Month</span>
                      <span className="text-lg font-bold text-purple-600">210</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Last Month</span>
                      <span className="text-lg font-bold text-slate-900">195</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Total Downloads</span>
                      <span className="text-lg font-bold text-slate-900">860</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={handleDeleteCancel}
          ></div>

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">
              {/* Modal Header */}
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-bold text-slate-900">Delete Paper</h2>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <svg
                      className="h-10 w-10 text-rose-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900 font-medium mb-2">
                      Are you sure you want to delete this paper?
                    </p>
                    <p className="text-sm text-slate-600 mb-3">
                      <strong>&quot;{getPaperTitle(paperToDelete!)}&quot;</strong>
                    </p>
                    <p className="text-sm text-slate-600">
                      This action cannot be undone. The paper will be permanently removed from your profile.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-200 px-6 py-4 flex gap-3 justify-end">
                <button
                  onClick={handleDeleteCancel}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                >
                  Delete Paper
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}