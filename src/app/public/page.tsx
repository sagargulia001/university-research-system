import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PublicResearchSearchParams = {
  q?: string | string[];
  searchBy?: string | string[];
  sort?: string | string[];
};

type PublicResearchPageProps = {
  searchParams?: Promise<PublicResearchSearchParams>;
};

type SearchField = "all" | "teacher" | "topic";
type SortOption = "default" | "faculty-az" | "department" | "date-latest";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitial(name: string) {
  const displayName = name.replace(/^(Dr\.|Prof\.)\s+/i, "").trim();
  return displayName.charAt(0).toUpperCase() || "?";
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getSearchField(value: string): SearchField {
  return value === "teacher" || value === "topic" ? value : "all";
}

function getSortOption(value: string): SortOption {
  if (
    value === "faculty-az" ||
    value === "department" ||
    value === "date-latest"
  ) {
    return value;
  }

  return "default";
}

function getSearchWhere(query: string, searchBy: SearchField): Prisma.PaperWhereInput {
  if (!query) return {};

  const containsQuery = {
    contains: query,
    mode: "insensitive" as const,
  };

  if (searchBy === "teacher") {
    return {
      uploadedBy: {
        is: {
          name: containsQuery,
        },
      },
    };
  }

  if (searchBy === "topic") {
    return {
      title: containsQuery,
    };
  }

  return {
    OR: [
      { title: containsQuery },
      { authors: containsQuery },
      { department: containsQuery },
      { college: containsQuery },
      { keywords: containsQuery },
      {
        uploadedBy: {
          is: {
            name: containsQuery,
          },
        },
      },
    ],
  };
}

function getOrderBy(sort: SortOption): Prisma.PaperOrderByWithRelationInput[] {
  if (sort === "faculty-az") {
    return [{ uploadedBy: { name: "asc" } }, { submittedDate: "desc" }];
  }

  if (sort === "department") {
    return [{ department: "asc" }, { submittedDate: "desc" }];
  }

  return [{ submittedDate: "desc" }];
}

export default async function PublicResearchPage({
  searchParams,
}: PublicResearchPageProps) {
  const params = (await searchParams) ?? {};
  const query = getParam(params.q).trim();
  const searchBy = getSearchField(getParam(params.searchBy));
  const sort = getSortOption(getParam(params.sort));

  const papers = await prisma.paper.findMany({
    where: getSearchWhere(query, searchBy),
    select: {
      id: true,
      title: true,
      department: true,
      pdfUrl: true,
      submittedDate: true,
      uploadedBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: getOrderBy(sort),
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 font-sans">
      <div className="mx-auto w-[90%]">
        
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>

        <div className="mb-10 text-center">
          <h1 className="mb-2 text-center text-3xl font-bold text-slate-900">
            Research Repository
          </h1>
          <p className="mt-4 text-lg text-slate-500">
            Explore the latest academic contributions from our university faculty.
          </p>
        </div>

        {/* Controls */}
        <form
          action="/public"
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end"
        >
          <div className="flex gap-2 sm:flex-row flex-col">
            <div className="relative flex-1 sm:flex-none">
              <input
                name="q"
                type="text"
                placeholder="Search..."
                defaultValue={query}
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

            <select
              name="searchBy"
              defaultValue={searchBy}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Fields</option>
              <option value="teacher">Faculty Name</option>
              <option value="topic">Research Topic</option>
            </select>
          </div>

          <select
            name="sort"
            defaultValue={sort}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="default">Sort By</option>
            <option value="faculty-az">Faculty Name (A-Z)</option>
            <option value="department">Department</option>
            <option value="date-latest">Date Published (Latest)</option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Apply
          </button>

          {(query || searchBy !== "all" || sort !== "default") && (
            <a
              href="/public"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Clear
            </a>
          )}
        </form>

        {/* Papers table */}
        <div className="overflow-hidden rounded-2xl border border-slate-600 bg-white shadow-xl ring-1 ring-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left">
              
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

              <tbody className="divide-y divide-slate-100">
                {papers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="border border-slate-300 px-6 py-10 text-center text-sm text-slate-500"
                    >
                      No research papers found.
                    </td>
                  </tr>
                ) : (
                papers.map((paper) => (
                  <tr 
                    key={paper.id} 
                    className="group transition-colors hover:bg-blue-50/30"
                  >
                    <td className="border border-slate-300 px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                          {getInitial(paper.uploadedBy.name)}
                        </div>
                        <span className="font-medium text-slate-900">
                          {paper.uploadedBy.name}
                        </span>
                      </div>
                    </td>

                    <td className="border border-slate-300 px-6 py-5">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-700">
                        {paper.department ?? "University"}
                      </span>
                    </td>

                    <td className="border border-slate-300 px-6 py-5 text-sm font-medium text-slate-700">
                      {paper.title}
                    </td>

                    <td className="border border-slate-300 px-6 py-5 text-sm text-slate-500">
                      {formatDate(paper.submittedDate)}
                    </td>

                    <td className="border border-slate-300 px-6 py-5 text-center">
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        View Paper
                      </a>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
            <span className="text-sm text-slate-500">
              {query
                ? `Showing ${papers.length} ${
                    papers.length === 1 ? "result" : "results"
                  } for "${query}"`
                : `Showing ${papers.length} ${
                    papers.length === 1 ? "paper" : "papers"
                  }`}
            </span>
            <div className="flex gap-2">
                <button disabled className="rounded-md px-3 py-1 text-sm text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-50">Prev</button>
                <button disabled className="rounded-md px-3 py-1 text-sm text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-50">Next</button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
