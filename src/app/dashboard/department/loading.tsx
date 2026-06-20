export default function DepartmentDashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar skeleton */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="h-4 w-24 bg-slate-200 rounded mb-2 animate-pulse" />
              <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
