"use client";

import { useState, useEffect } from "react";

type UserRole = "faculty" | "hod" | "dean" | "vc" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface Paper {
  id: string;
  title: string;
  authors: string | null;
  downloads: number;
  pdfUrl: string;
  submittedDate: string;
}

interface FacultyDashboardContentProps {
  user: User;
}

interface DashboardStats {
  totalPapers: number;
  totalDownloads: number;
  avgDownloads: number;
  papersThisYear: number;
  papersLastYear: number;
  monthlyDownloads: Record<string, number>;
}

export default function FacultyDashboardContent({ user }: FacultyDashboardContentProps) {
  const [activeTab, setActiveTab] = useState<"my-papers" | "statistics">("my-papers");
  const [myPapers, setMyPapers] = useState<Paper[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoadingPapers, setIsLoadingPapers] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [papersError, setPapersError] = useState("");
  const [statsError, setStatsError] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState<Paper | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) return;
      setIsLoadingPapers(true);
      setPapersError("");
      try {
        const res = await fetch("/api/papers/my-papers", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load papers");
        const data = await res.json() as { papers: Paper[] };
        if (!cancelled) setMyPapers(data.papers);
      } catch {
        if (!cancelled) setPapersError("Could not load your papers. Please try again.");
      } finally {
        if (!cancelled) setIsLoadingPapers(false);
      }
    };

    const loadStats = async () => {
      if (cancelled) return;
      setIsLoadingStats(true);
      setStatsError("");
      try {
        const res = await fetch("/api/dashboard/faculty-stats", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load stats");
        const data = await res.json() as DashboardStats;
        if (!cancelled) setDashboardStats(data);
      } catch {
        if (!cancelled) setStatsError("Could not load statistics.");
      } finally {
        if (!cancelled) setIsLoadingStats(false);
      }
    };

    void Promise.resolve().then(() => {
      load();
      loadStats();
    });

    return () => { cancelled = true; };
  }, [retryCount]);

  const retryFetch = () => setRetryCount((c) => c + 1);

  const totalDownloads = myPapers.reduce((sum, p) => sum + p.downloads, 0);
  const totalPapers = myPapers.length;
  const displayStats = dashboardStats || {
    totalPapers,
    totalDownloads,
    avgDownloads: totalPapers > 0 ? Math.round(totalDownloads / totalPapers) : 0,
    papersThisYear: 0,
    papersLastYear: 0,
    monthlyDownloads: {},
  };

  const handleViewClick = async (paper: Paper) => {
    setViewingId(paper.id);
    try {
      const response = await fetch(`/api/papers/${paper.id}`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setMyPapers((prev) =>
          prev.map((p) => p.id === paper.id ? { ...p, downloads: data.downloads } : p)
        );
        window.open(data.pdfUrl, "_blank", "noopener,noreferrer");
      } else {
        window.open(paper.pdfUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      window.open(paper.pdfUrl, "_blank", "noopener,noreferrer");
    } finally {
      setViewingId(null);
    }
  };

  const handleDeleteClick = (paper: Paper) => {
    setPaperToDelete(paper);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!paperToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/papers/${paperToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Delete failed");
      setMyPapers((prev) => prev.filter((p) => p.id !== paperToDelete.id));
      setDeleteConfirmOpen(false);
      setPaperToDelete(null);
    } catch {
      // Keep modal open, user can retry
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (isDeleting) return;
    setDeleteConfirmOpen(false);
    setPaperToDelete(null);
  };

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));

  const downloadTrend = (() => {
    const grouped: Record<string, number> = {};
    myPapers.forEach((p) => {
      const key = new Intl.DateTimeFormat("en-IN", {
        month: "short",
        year: "numeric",
      }).format(new Date(p.submittedDate));
      grouped[key] = (grouped[key] || 0) + p.downloads;
    });
    const entries = Object.entries(grouped).slice(-6);
    const max = Math.max(...entries.map(([, v]) => v), 1);
    return entries.map(([month, downloads]) => ({ month, downloads, max }));
  })();

  const thisYear = new Date().getFullYear();
  const papersThisYear = myPapers.filter(
    (p) => new Date(p.submittedDate).getFullYear() === thisYear
  ).length;
  const papersLastYear = myPapers.filter(
    (p) => new Date(p.submittedDate).getFullYear() === thisYear - 1
  ).length;

  return (
    <main className="px-6 py-8 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Faculty Research Dashboard</h1>
        <p className="mt-1 text-slate-600">
          Welcome back, {user.name}! View and manage your research papers and statistics.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">My Research Stats</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[
            { label: "Papers Published", value: displayStats.totalPapers, icon: "📄" },
            { label: "Total Downloads", value: displayStats.totalDownloads.toLocaleString(), icon: "📥" },
            { label: "Avg Downloads", value: displayStats.avgDownloads, icon: "📊" },
            { label: "Papers This Year", value: papersThisYear, icon: "📈" },
          ].map((stat) => (
            <div
              key={stat.label}
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
          ))}
        </div>
      </div>

      <div className="mb-6 flex gap-4 border-b border-slate-200 overflow-x-auto">
        {["my-papers", "statistics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab === "my-papers" ? "My Papers" : "Statistics"}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl ring-1 ring-slate-900/5">

        {activeTab === "my-papers" && (
          <div>
            <h2 className="mb-6 text-xl font-bold text-slate-900">My Published Papers</h2>

            {isLoadingPapers ? (
              <p className="py-8 text-center text-slate-500">Loading your papers...</p>
            ) : papersError ? (
              <div className="py-8 text-center">
                <p className="text-rose-600 text-sm">{papersError}</p>
                <button
                  onClick={retryFetch}
                  className="mt-3 text-sm text-blue-500 hover:text-blue-600 font-medium"
                >
                  Try again
                </button>
              </div>
            ) : myPapers.length === 0 ? (
              <p className="py-8 text-center text-slate-500">
                No papers yet. Upload your first paper using the navbar.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">Paper Title</th>
                      <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">Submitted Date</th>
                      <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">Downloads</th>
                      <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myPapers.map((paper) => (
                      <tr key={paper.id} className="hover:bg-slate-50">
                        <td className="border border-slate-300 px-6 py-4 text-sm font-medium text-slate-900">
                          {paper.title}
                        </td>
                        <td className="border border-slate-300 px-6 py-4 text-sm text-slate-600">
                          {formatDate(paper.submittedDate)}
                        </td>
                        <td className="border border-slate-300 px-6 py-4 text-center">
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                            {paper.downloads}
                          </span>
                        </td>
                        <td className="border border-slate-300 px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleViewClick(paper)}
                              disabled={viewingId === paper.id}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {viewingId === paper.id ? "Opening..." : "View"}
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => handleDeleteClick(paper)}
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
            )}
          </div>
        )}

        {activeTab === "statistics" && (
          <div className="space-y-6">
            <h2 className="mb-6 text-xl font-bold text-slate-900">Your Research Statistics</h2>

            {statsError && (
              <p className="text-sm text-rose-600">{statsError}</p>
            )}

            {isLoadingStats ? (
              <p className="text-center text-slate-500 py-8">Loading statistics...</p>
            ) : (
              <>
                {downloadTrend.length > 0 ? (
                  <div className="mb-8">
                    <h3 className="mb-4 font-semibold text-slate-900">Downloads by Upload Month</h3>
                    <div className="space-y-2">
                      {downloadTrend.map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium text-slate-900 shrink-0">{item.month}</div>
                          <div className="flex-1 bg-slate-200 rounded-full h-6 overflow-hidden">
                            <div
                              className="bg-purple-500 h-full flex items-center justify-end pr-2 transition-all"
                              style={{ width: `${(item.downloads / item.max) * 100}%` }}
                            >
                              <span className="text-xs font-semibold text-white">{item.downloads}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No download data yet.</p>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Paper Count</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Total Papers</span>
                        <span className="text-2xl font-bold text-slate-900">{totalPapers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">This Year ({thisYear})</span>
                        <span className="text-lg font-bold text-blue-600">{papersThisYear}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Last Year ({thisYear - 1})</span>
                        <span className="text-lg font-bold text-slate-600">{papersLastYear}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Download Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Total Downloads</span>
                        <span className="text-2xl font-bold text-purple-600">{totalDownloads.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Most Downloaded</span>
                        <span className="text-lg font-bold text-slate-900">
                          {myPapers.length > 0 ? Math.max(...myPapers.map((p) => p.downloads)) : 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Avg per Paper</span>
                        <span className="text-lg font-bold text-slate-900">
                          {totalPapers > 0 ? Math.round(totalDownloads / totalPapers) : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {deleteConfirmOpen && paperToDelete && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={handleDeleteCancel}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-bold text-slate-900">Delete Paper</h2>
              </div>
              <div className="px-6 py-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <svg className="h-10 w-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 mb-2">
                      Are you sure you want to delete this paper?
                    </p>
                    <p className="text-sm text-slate-600 mb-3">
                      <strong>&quot;{paperToDelete.title}&quot;</strong>
                    </p>
                    <p className="text-sm text-slate-600">
                      This action cannot be undone. The paper will be permanently removed from your profile.
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 px-6 py-4 flex gap-3 justify-end">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Paper"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
