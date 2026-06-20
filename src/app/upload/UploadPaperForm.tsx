"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";

type UserRole = "faculty" | "hod" | "dean" | "vc" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface UploadPaperFormProps {
  user: User;
}

export default function UploadPaperForm({ user }: UploadPaperFormProps) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  
  const [formData, setFormData] = useState({
    title: "",
    authors: user.name,
    abstract: "",
    keywords: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setSelectedFile(null);
      setFileName("");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      setSelectedFile(null);
      setFileName("");
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 50MB");
      setSelectedFile(null);
      setFileName("");
      return;
    }

    setError("");
    setSelectedFile(file);
    setFileName(file.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedFile) {
      setError("Please select a PDF file");
      return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("pdf", selectedFile);
      submitData.append("title", formData.title);
      submitData.append("authors", formData.authors);
      submitData.append("abstract", formData.abstract);
      submitData.append("keywords", formData.keywords);

      const response = await fetch("/api/papers/upload", {
        method: "POST",
        body: submitData,
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // Invalidate SWR cache for affected endpoints
      await mutate("/api/papers/my-papers");
      await mutate("/api/dashboard/faculty-stats");

      alert("Paper uploaded successfully!");
      router.push("/dashboard/faculty");
      router.refresh();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <main className="px-4 py-6 font-sans">
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Upload Research Paper
        </h1>
        <p className="text-base text-slate-600">
          Share your research contributions with the university community
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3">
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Paper details */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl ring-1 ring-slate-900/5">
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Paper Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-slate-900 mb-2">
                    Paper Title <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter the title of your research paper"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Enter a clear and descriptive title for your research
                  </p>
                </div>

                <div>
                  <label htmlFor="authors" className="block text-sm font-semibold text-slate-900 mb-2">
                    Author(s) <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="authors"
                    name="authors"
                    value={formData.authors}
                    onChange={handleInputChange}
                    placeholder="Your name or co-authors"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Defaults to your profile name. Add co-authors separated by commas.
                  </p>
                </div>

                <div>
                  <label htmlFor="abstract" className="block text-sm font-semibold text-slate-900 mb-2">
                    Abstract <span className="text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    id="abstract"
                    name="abstract"
                    value={formData.abstract}
                    onChange={handleInputChange}
                    placeholder="Brief summary of your research paper"
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Provide a concise summary of your research findings
                  </p>
                </div>

                <div>
                  <label htmlFor="keywords" className="block text-sm font-semibold text-slate-900 mb-2">
                    Keywords <span className="text-slate-400">(comma-separated, optional)</span>
                  </label>
                  <input
                    type="text"
                    id="keywords"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleInputChange}
                    placeholder="e.g., Machine Learning, AI, Research"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Add relevant keywords to help others discover your research
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PDF upload */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl ring-1 ring-slate-900/5 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Upload Document
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="file" className="block text-sm font-semibold text-slate-900 mb-2">
                    Research Paper (PDF) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="file"
                      name="file"
                      onChange={handleFileChange}
                      accept="application/pdf"
                      className="sr-only"
                      required
                    />
                    <label
                      htmlFor="file"
                      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 transition-colors hover:border-blue-400 hover:bg-blue-50"
                    >
                      <svg
                        className="mb-3 h-12 w-12 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75z"
                        />
                      </svg>
                      <span className="text-center">
                        <span className="block font-semibold text-slate-900 text-base mb-1">
                          Click to upload
                        </span>
                        <span className="block text-sm text-slate-600 mb-1">or drag and drop</span>
                        <span className="block text-xs text-slate-500">
                          PDF file only, max 50MB
                        </span>
                      </span>
                    </label>
                  </div>

                  {fileName && selectedFile && (
                    <div className="mt-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                      <div className="flex items-start">
                        <svg
                          className="shrink-0 h-5 w-5 text-green-600 mt-0.5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900">
                            {fileName}
                          </p>
                          <p className="text-xs text-green-700 mt-0.5">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-slate-500">
                    <strong>Only PDF files are allowed</strong>
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isLoading || !selectedFile}
                    className={`w-full rounded-lg px-6 py-3 text-center font-semibold text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isLoading || !selectedFile
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl"
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </span>
                    ) : (
                      "Upload Paper"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/faculty")}
                    className="w-full rounded-lg border-2 border-slate-300 px-6 py-2 text-center font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>

                <div className="rounded-lg bg-blue-50 px-3 py-2 border border-blue-200">
                  <p className="text-xs text-blue-900">
                    <strong>Note:</strong> Your research paper will be immediately available to the university community. Ensure all information is accurate before uploading.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </main>
);
}
