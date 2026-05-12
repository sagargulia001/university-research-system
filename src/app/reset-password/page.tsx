"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

type MessageState = {
  type: "success" | "error";
  text: string;
};

async function readApiResponse(response: Response) {
  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message || "Unable to reset password");
  }

  return data;
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(
    token
      ? null
      : {
          type: "error",
          text: "Reset token is missing",
        }
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });
      const data = await readApiResponse(response);

      setPassword("");
      setConfirmPassword("");
      setMessage({
        type: "success",
        text: data.message || "Password updated successfully",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Unable to reset password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`rounded-lg border p-4 ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50"
              : "border-rose-200 bg-rose-50"
          }`}
        >
          <p
            className={`text-sm ${
              message.type === "success" ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          New Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter new password"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          required
          minLength={8}
          disabled={!token || message?.type === "success"}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Confirm Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm new password"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          required
          minLength={8}
          disabled={!token || message?.type === "success"}
        />
      </div>

      <button
        type="submit"
        disabled={!token || isSubmitting || message?.type === "success"}
        className="w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
          Reset Password
        </h1>
        <p className="mb-8 text-center text-slate-500">
          Set a new password for your faculty account
        </p>

        <Suspense
          fallback={
            <p className="py-8 text-center text-sm text-slate-500">
              Loading reset form...
            </p>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-6 text-center text-sm">
          <Link
            href="/"
            className="font-medium text-blue-500 transition-colors hover:text-blue-600"
          >
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
