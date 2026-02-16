// src/app/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginType, setLoginType] = useState<"faculty" | "admin" | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const openModal = (type: "faculty" | "admin") => {
    setLoginType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setLoginType(null);
    setFormData({ email: "", password: "" });
    setError("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: loginType === "faculty" ? "faculty" : "admin",
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Invalid credentials. Please try again.");
      }

      const data = await response.json();
      console.log("Login successful:", data);
      
      // Close modal and redirect
      closeModal();
      router.push("/dashboard");
      router.refresh(); // Force refresh to update middleware state
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
          University Research Portal
        </h1>
        <p className="mb-8 text-center text-slate-500">
          Access and manage academic research
        </p>

        <div className="space-y-4">
          <Link
            href="/public"
            className="block w-full rounded-lg border border-slate-200 px-4 py-3 text-center font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
          >
            Browse Research (Public)
          </Link>

          <button
            onClick={() => openModal("faculty")}
            className="block w-full rounded-lg bg-blue-500 px-4 py-3 text-center font-medium text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg"
          >
            Faculty Login
          </button>

          <button
            onClick={() => openModal("admin")}
            className="block w-full rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
          >
            Admin Login
          </button>
        </div>
      </div>

      {/* Modal Backdrop */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeModal}
        ></div>
      )}

      {/* Login Modal */}
      {isModalOpen && loginType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">
                {loginType === "faculty" ? "Faculty Login" : "Admin Login"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-4">
                  <p className="text-sm text-rose-700">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {loginType === "faculty" ? "Faculty Email" : "Admin Email"}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                {loginType === "faculty" && (
                  <button
                    type="button"
                    className="mt-2 text-xs text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded-lg px-4 py-2.5 text-center font-medium text-white transition-all ${
                  loginType === "faculty"
                    ? isLoading
                      ? "bg-blue-400 cursor-not-allowed opacity-75"
                      : "bg-blue-500 hover:bg-blue-600"
                    : isLoading
                    ? "bg-rose-500 cursor-not-allowed opacity-75"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 px-6 py-4 text-center text-sm text-slate-500">
              {loginType === "faculty" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button className="text-blue-500 hover:text-blue-600 font-medium">
                    Request Access
                  </button>
                </>
              ) : (
                <>
                  Need help?{" "}
                  <button className="text-rose-600 hover:text-rose-700 font-medium">
                    Contact Support
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}