export default function PublicResearchPage() {
  const papers = [
    {
      teacher: "Dr. Amit Sharma",
      department: "Computer Science",
      topic: "AI-Based Crop Disease Detection",
      date: "12 Jan 2024",
      status: "Published",
    },
    {
      teacher: "Dr. Neha Verma",
      department: "Electrical Engineering",
      topic: "Renewable Energy Optimization Models",
      date: "05 Oct 2023",
      status: "Published",
    },
    {
      teacher: "Dr. R. Singh",
      department: "Psychology",
      topic: "Mental Health Analysis in College Students",
      date: "18 Mar 2024",
      status: "Peer Review",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 font-sans">
      <div className="mx-auto w-[90%]">
        
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-center text-3xl font-bold text-slate-900">
            Research Repository
          </h1>
          <p className="mt-4 text-lg text-slate-500">
            Explore the latest academic contributions from our university faculty.
          </p>
        </div>

        {/* Search and Sort Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          {/* Search Section */}
          <div className="flex gap-2 sm:flex-row flex-col">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <svg
                className="absolute right-3 top-3 h-5 w-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Search By Dropdown */}
            <select className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option value="all">All Fields</option>
              <option value="teacher">Faculty Name</option>
              <option value="topic">Research Topic</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <select className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="default">Sort By</option>
            <option value="faculty-az">Faculty Name (A–Z)</option>
            <option value="department">Department</option>
            <option value="date-latest">Date Published (Latest)</option>
          </select>
        </div>

        {/* Card Container with deeply rounded corners and subtle border */}
        <div className="overflow-hidden rounded-2xl border border-slate-600 bg-white shadow-xl ring-1 ring-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left">
              
              {/* Table Header */}
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="border border-slate-300 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-900">
                    Faculty Author
                  </th>
                  <th className="border border-slate-300 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-900">
                    Department
                  </th>
                  <th className="border border-slate-300 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-900">
                    Research Topic
                  </th>
                  <th className="border border-slate-300 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-900">
                    Date
                  </th>
                  <th className="border border-slate-300 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-900">
                    Action
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100">
                {papers.map((paper, index) => (
                  <tr 
                    key={index} 
                    className="group transition-colors hover:bg-blue-50/30"
                  >
                    {/* Teacher */}
                    <td className="border border-slate-300 px-6 py-5">
                      <div className="flex items-center gap-3">
                        {/* Avatar Placeholder */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                          {paper.teacher.charAt(4)}
                        </div>
                        <span className="font-medium text-slate-900">
                          {paper.teacher}
                        </span>
                      </div>
                    </td>

                    {/* Department (Badge Style) */}
                    <td className="border border-slate-300 px-6 py-5">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-700">
                        {paper.department}
                      </span>
                    </td>

                    {/* Topic */}
                    <td className="border border-slate-300 px-6 py-5 text-sm font-medium text-slate-700">
                      {paper.topic}
                    </td>

                    {/* Date */}
                    <td className="border border-slate-300 px-6 py-5 text-sm text-slate-500">
                      {paper.date}
                    </td>

                    {/* Button */}
                    <td className="border border-slate-300 px-6 py-5 text-center">
                      <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        View Paper
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer with pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
            <span className="text-sm text-slate-500">Showing 3 of 128 papers</span>
            <div className="flex gap-2">
                <button className="rounded-md px-3 py-1 text-sm text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-50">Prev</button>
                <button className="rounded-md px-3 py-1 text-sm text-slate-500 hover:bg-white hover:shadow-sm">Next</button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}