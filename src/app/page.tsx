"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginType = "faculty" | "admin";
type ModalView = "login" | "forgot-password" | "request-access";
type MessageState = {
  type: "success" | "error";
  text: string;
};

const initialAccessRequest = {
  name: "",
  email: "",
  role: "FACULTY",
  department: "",
  college: "",
  reason: "",
};

async function readApiResponse(response: Response) {
  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
}

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginType, setLoginType] = useState<LoginType | null>(null);
  const [modalView, setModalView] = useState<ModalView>("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [accessRequest, setAccessRequest] = useState(initialAccessRequest);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const openModal = (type: LoginType) => {
    setLoginType(type);
    setModalView("login");
    setIsModalOpen(true);
    setMessage(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setLoginType(null);
    setModalView("login");
    setFormData({ email: "", password: "" });
    setForgotPasswordEmail("");
    setAccessRequest(initialAccessRequest);
    setMessage(null);
    setShowPassword(false);
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccessInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setAccessRequest((prev) => ({ ...prev, [name]: value }));
  };

  const showForgotPassword = () => {
    setForgotPasswordEmail(formData.email);
    setModalView("forgot-password");
    setMessage(null);
  };

  const showRequestAccess = () => {
    setAccessRequest((prev) => ({
      ...prev,
      email: formData.email || prev.email,
    }));
    setModalView("request-access");
    setMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

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

      await readApiResponse(response);
      closeModal();
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "An error occurred during login",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });
      const data = await readApiResponse(response);

      setMessage({
        type: "success",
        text: data.message || "Password reset request submitted",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Unable to submit password reset request",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccessRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/request-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accessRequest),
      });
      const data = await readApiResponse(response);

      setAccessRequest(initialAccessRequest);
      setMessage({
        type: "success",
        text: data.message || "Access request submitted",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Unable to submit access request",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle =
    modalView === "forgot-password"
      ? "Forgot Password"
      : modalView === "request-access"
        ? "Request Access"
        : loginType === "faculty"
          ? "Faculty Login"
          : "Admin Login";

  return (
    <main className="min-h-screen relative flex items-center justify-center bg-slate-50">
      <div className="absolute inset-0 z-0 bg-[url('/background.jpg')] bg-cover bg-center bg-fixed brightness-105"></div>
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-xl ring-1 ring-slate-900/5">        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
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

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeModal}
        />
      )}

      {isModalOpen && loginType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white/90 backdrop-blur-sm shadow-2xl ring-1 ring-slate-900/5">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">
                {modalTitle}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
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

            <div className="px-6 pt-6">
              {message && (
                <div
                  className={`rounded-lg border p-4 ${message.type === "success"
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-rose-200 bg-rose-50"
                    }`}
                >
                  <p
                    className={`text-sm ${message.type === "success"
                        ? "text-emerald-700"
                        : "text-rose-700"
                      }`}
                  >
                    {message.text}
                  </p>
                </div>
              )}
            </div>

            {modalView === "login" && (
              <form
                onSubmit={handleLoginSubmit}
                className="space-y-4 px-6 py-6"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {loginType === "faculty" ? "Faculty Email" : "Admin Email"}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleLoginInputChange}
                    placeholder="Enter email"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleLoginInputChange}
                      placeholder="Enter password"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {loginType === "faculty" && (
                    <button
                      type="button"
                      onClick={showForgotPassword}
                      className="mt-2 text-xs text-blue-500 hover:text-blue-600 font-medium"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-lg px-4 py-2.5 text-center font-medium text-white transition-all ${loginType === "faculty"
                      ? isSubmitting
                        ? "bg-blue-400 cursor-not-allowed opacity-75"
                        : "bg-blue-500 hover:bg-blue-600"
                      : isSubmitting
                        ? "bg-rose-500 cursor-not-allowed opacity-75"
                        : "bg-rose-600 hover:bg-rose-700"
                    }`}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </form>
            )}

            {modalView === "forgot-password" && (
              <form
                onSubmit={handleForgotPasswordSubmit}
                className="space-y-4 px-6 py-6"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Faculty Email
                  </label>
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setModalView("login");
                      setMessage(null);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors ${isSubmitting
                        ? "bg-blue-400 cursor-not-allowed opacity-75"
                        : "bg-blue-500 hover:bg-blue-600"
                      }`}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            )}

            {modalView === "request-access" && (
              <form
                onSubmit={handleAccessRequestSubmit}
                className="space-y-4 px-6 py-6"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={accessRequest.name}
                    onChange={handleAccessInputChange}
                    placeholder="Enter full name"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={accessRequest.email}
                    onChange={handleAccessInputChange}
                    placeholder="Enter email"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={accessRequest.role}
                    onChange={handleAccessInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="FACULTY">Faculty</option>
                    <option value="HOD">HOD</option>
                    <option value="DEAN">Dean</option>
                    <option value="VC">VC</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={accessRequest.department}
                      onChange={handleAccessInputChange}
                      placeholder="Department"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      College
                    </label>
                    <input
                      type="text"
                      name="college"
                      value={accessRequest.college}
                      onChange={handleAccessInputChange}
                      placeholder="College"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    name="reason"
                    value={accessRequest.reason}
                    onChange={handleAccessInputChange}
                    placeholder="Add a short reason"
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setModalView("login");
                      setMessage(null);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors ${isSubmitting
                        ? "bg-blue-400 cursor-not-allowed opacity-75"
                        : "bg-blue-500 hover:bg-blue-600"
                      }`}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            )}

            <div className="border-t border-slate-200 px-6 py-4 text-center text-sm text-slate-500">
              {loginType === "faculty" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={showRequestAccess}
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Request Access
                  </button>
                </>
              ) : (
                <>
                  Need help?{" "}
                  <button
                    type="button"
                    className="text-rose-600 hover:text-rose-700 font-medium"
                  >
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
