"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "REVOKED";
type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "REJECTED";
type UserRole = "FACULTY" | "HOD" | "DEAN" | "VC" | "ADMIN";

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string | null;
  college: string | null;
  reason: string | null;
  status: RequestStatus;
  createdAt: string;
  _type?: "revoked_user";
  _revokedAt?: string;
}

interface FacultyUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string | null;
  college: string | null;
  status: UserStatus;
  createdAt: string;
}

type Notice = {
  type: "success" | "error";
  text: string;
};

// Modal shown after approve (temp password) or reset link generation
interface CredentialModal {
  type: "temp-password" | "reset-link";
  name: string;
  email: string;
  role?: string;
  value: string; // the temp password or reset URL
}

async function readAdminResponse(response: Response) {
  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    resetUrl?: string;
    temporaryPassword?: string;
  };

  if (!response.ok) {
    throw new Error(data.message || "Admin action failed");
  }

  return data;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${copied
        ? "bg-green-100 text-green-700 border border-green-300"
        : "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
        }`}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function SuccessModal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <style>{`
          @keyframes tickmark {
            0% {
              stroke-dashoffset: 76;
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              stroke-dashoffset: 0;
              opacity: 1;
            }
          }
          .tick-animate {
            animation: tickmark 0.6s ease-in-out forwards;
          }
        `}</style>
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 text-center py-8 px-6">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path className="tick-animate" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" strokeDasharray="76" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Success!</h2>
          <p className="text-slate-600 text-sm">{message}</p>
        </div>
      </div>
    </>
  );
}

function CredentialDialog({
  modal,
  onClose,
}: {
  modal: CredentialModal;
  onClose: () => void;
}) {
  const isPassword = modal.type === "temp-password";

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isPassword ? "bg-green-100" : "bg-blue-100"}`}>
                {isPassword ? (
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {isPassword ? "Account Created" : "Reset Link Generated"}
              </h2>
            </div>
            <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{modal.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{modal.email}</p>
              {modal.role && (
                <span className="mt-2 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  {modal.role}
                </span>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                {isPassword
                  ? "Temporary Password — share this with the faculty member:"
                  : "Password Reset Link — share this with the faculty member:"}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono text-slate-800 whitespace-nowrap">
                  {modal.value}
                </code>
                <CopyButton value={modal.value} />
              </div>
            </div>

            <div className={`rounded-lg border px-4 py-3 ${isPassword ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`}>
              <p className={`text-xs ${isPassword ? "text-amber-800" : "text-blue-800"}`}>
                {isPassword
                  ? "⚠️ This password will not be shown again. Make sure to copy and share it now."
                  : "ℹ️ This link expires in 24 hours. Share it with the faculty member promptly."}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <button onClick={onClose} className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700">
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function DeleteConfirmDialog({
  dialog,
  onConfirm,
  onCancel,
  isLoading,
}: {
  dialog: DeleteConfirmDialog;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900">Delete User Permanently</h2>
            </div>
            <button onClick={onCancel} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-slate-700 font-medium">
              Are you sure you want to permanently delete this user?
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{dialog.userName}</p>
              <p className="text-xs text-slate-500 mt-0.5">{dialog.userEmail}</p>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-red-800">⚠️ This action is irreversible:</p>
              <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                <li>All user data will be permanently removed from the system</li>
                <li>The user can request access again using the same email</li>
                <li>This cannot be undone</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 px-6 py-4 flex gap-3">
            <button onClick={onCancel} disabled={isLoading} className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={isLoading} className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
              {isLoading ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

interface DeleteConfirmDialog {
  userId: string;
  userName: string;
  userEmail: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"faculty-access" | "requests" | "add-user">("faculty-access");
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [faculty, setFaculty] = useState<FacultyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [credentialModal, setCredentialModal] = useState<CredentialModal | null>(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<DeleteConfirmDialog | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "FACULTY" as UserRole,
    department: "",
    college: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const router = useRouter();

  const loadAdminData = useCallback(async () => {
    try {
      const [accessResponse, usersResponse] = await Promise.all([
        fetch("/api/admin/access-requests", { credentials: "include" }),
        fetch("/api/admin/users", { credentials: "include" }),
      ]);

      try {
        const accessData = await readAdminResponse(accessResponse);
        setAccessRequests(accessData as unknown as AccessRequest[]);
      } catch (error) {
        console.error("Error loading access requests:", error);
        setAccessRequests([]);
      }

      try {
        const usersData = await readAdminResponse(usersResponse);
        const users = usersData as unknown as FacultyUser[];
        setFaculty(users.filter((user) => user.role !== "ADMIN" && (user.status === "ACTIVE" || user.status === "INACTIVE")));
      } catch (error) {
        console.error("Error loading users:", error);
        setFaculty([]);
      }

      setNotice(null);
    } catch (error) {
      console.error("Critical error loading admin data:", error);
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Unable to load admin data" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAdminData();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadAdminData]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  const runAdminAction = async (
    key: string,
    url: string,
    payload: Record<string, string>,
    successText: string,
    modalContext?: {
      type: "temp-password" | "reset-link";
      name: string;
      email: string;
      role?: string;
    }
  ) => {
    setActionKey(key);
    setNotice(null);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await readAdminResponse(response);

      if (modalContext && data.temporaryPassword) {
        setCredentialModal({ ...modalContext, value: data.temporaryPassword });
      } else if (modalContext && data.resetUrl) {
        setCredentialModal({ ...modalContext, value: data.resetUrl });
      } else {
        setNotice({ type: "success", text: data.message || successText });
      }

      await loadAdminData();
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Unable to complete admin action" });
    } finally {
      setActionKey(null);
    }
  };

  const pendingRequests = accessRequests.filter((req) => req.status === "PENDING");
  const inactiveUsers = faculty.filter((user) => user.status === "INACTIVE");

  const stats = [
    { label: "Approved Faculty", value: faculty.length },
    { label: "Pending Access Requests", value: pendingRequests.length },
    { label: "Inactive Users", value: inactiveUsers.length },
  ];

  const isWorking = (key: string) => actionKey === key;

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.role) errors.role = "Role is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setNotice({ type: "error", text: "Please fix form errors" });
      return;
    }
    
    // Store data before clearing
    const userData = { ...formData };
    
    // Show success modal
    setSuccessMessage(`User added successfully! Login credentials have been sent to ${userData.email}`);
    
    // Clear form immediately for fast feedback
    setFormData({ name: "", email: "", role: "FACULTY", department: "", college: "" });
    setFormErrors({});

    // Auto-dismiss message after 1.5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 1500);

    // Call API in background (no await, no loading state)
    fetch("/api/admin/add-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        college: userData.college,
      }),
      credentials: "include",
    }).then(() => {
      // Reload data in background after a short delay (after message shows)
      setTimeout(() => {
        loadAdminData().catch(() => {
          // Silently fail if reload fails
        });
      }, 1500);
    }).catch((error) => {
      console.error("Error adding user:", error);
      // Don't show error since we already showed success
    });
  };

  const handleDeleteUser = (userId: string, userName: string, userEmail: string) => {
    setDeleteConfirmDialog({ userId, userName, userEmail });
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirmDialog) return;
    const targetUserId = deleteConfirmDialog.userId;
    setDeleteConfirmDialog(null);
    await runAdminAction(`delete:${targetUserId}`, "/api/admin/delete-user", { userId: targetUserId }, "User deleted permanently");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 font-sans">
      {credentialModal && <CredentialDialog modal={credentialModal} onClose={() => setCredentialModal(null)} />}
      {deleteConfirmDialog && (
        <DeleteConfirmDialog
          dialog={deleteConfirmDialog}
          onConfirm={confirmDeleteUser}
          onCancel={() => setDeleteConfirmDialog(null)}
          isLoading={isWorking(`delete:${deleteConfirmDialog.userId}`)}
        />
      )}
      {successMessage && <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />}

      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="mt-1 text-slate-600">Manage faculty access and requests</p>
        </div>
        <button onClick={handleLogout} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
          Logout
        </button>
      </div>

      {notice && (
        <div className={`mb-6 rounded-lg border p-4 ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          <p className="wrap-break-word text-sm">{notice.text}</p>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
            <p className="text-sm text-slate-600">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex gap-4 border-b border-slate-200">
        {["faculty-access", "requests", "add-user"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab ? "border-blue-500 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900"}`}
          >
            {tab === "faculty-access" ? "Approved Users" : tab === "requests" ? "Access Requests" : "Add User"}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
        {isLoading ? (
          <p className="py-8 text-center text-slate-500">Loading admin data...</p>
        ) : (
          <>
            {activeTab === "faculty-access" && (
              <div>
                <h2 className="mb-6 text-xl font-bold text-slate-900">Approved Faculty Members</h2>
                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Revoke Access (Temporary)</p>
                      <p className="text-xs text-blue-800">Deactivates the user account. User data is preserved and can be restored later if needed.</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Delete Permanently (Irreversible)</p>
                      <p className="text-xs text-blue-800">Completely removes user from the system. They can request access again with the same email.</p>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                        <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">Role</th>
                        <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">Department</th>
                        <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                        <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">Added Date</th>
                        <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">Status</th>
                        <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {faculty.map((member) => (
                        <tr key={member.id} className={member.status === "INACTIVE" ? "bg-slate-50" : "hover:bg-slate-50"}>
                          <td className="border border-slate-300 px-6 py-4 text-sm font-medium text-slate-900">{member.name}</td>
                          <td className="border border-slate-300 px-6 py-4 text-sm text-slate-700">{member.role}</td>
                          <td className="border border-slate-300 px-6 py-4 text-sm text-slate-700">{member.department || "Not provided"}</td>
                          <td className="border border-slate-300 px-6 py-4 text-sm text-slate-600">{member.email}</td>
                          <td className="border border-slate-300 px-6 py-4 text-sm text-slate-600">{formatDate(member.createdAt)}</td>
                          <td className="border border-slate-300 px-6 py-4 text-center text-sm">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${member.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700"}`}>{member.status}</span>
                          </td>
                          <td className="border border-slate-300 px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              {member.status === "ACTIVE" ? (
                                <button disabled={isWorking(`revoke:${member.id}`)} onClick={() => runAdminAction(`revoke:${member.id}`, "/api/admin/revoke-access", { userId: member.id }, "Access revoked")} className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60">
                                  {isWorking(`revoke:${member.id}`) ? "Revoking..." : "Revoke Access"}
                                </button>
                              ) : (
                                <button disabled={isWorking(`reactivate:${member.id}`)} onClick={() => runAdminAction(`reactivate:${member.id}`, "/api/admin/reactivate", { userId: member.id }, "Access reactivated")} className="rounded-lg border border-green-500 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60">
                                  {isWorking(`reactivate:${member.id}`) ? "Reactivating..." : "Reactivate"}
                                </button>
                              )}
                              <button disabled={isWorking(`delete:${member.id}`)} onClick={() => handleDeleteUser(member.id, member.name, member.email)} className="rounded-lg border border-red-500 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60">
                                {isWorking(`delete:${member.id}`) ? "Deleting..." : "Delete Permanently"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {faculty.length === 0 && <p className="py-8 text-center text-slate-500">No approved faculty members.</p>}
              </div>
            )}

            {activeTab === "requests" && (
              <div>
                <h2 className="mb-6 text-xl font-bold text-slate-900">Faculty Access Requests</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                        <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">Role</th>
                        <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">Department</th>
                        <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                        <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                        <th className="border border-slate-300 px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                        <th className="border border-slate-300 px-6 py-4 text-center text-sm font-semibold text-slate-900">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-slate-50">
                          <td className="border border-slate-300 px-6 py-4 text-sm font-medium text-slate-900">{request.name}</td>
                          <td className="border border-slate-300 px-6 py-4 text-sm text-slate-700">{request.role}</td>
                          <td className="border border-slate-300 px-6 py-4 text-sm text-slate-700">{request.department || "Not provided"}</td>
                          <td className="border border-slate-300 px-6 py-4 text-sm text-slate-600">{request.email}</td>
                          <td className="border border-slate-300 px-6 py-4 text-sm text-slate-600">{formatDate(request.createdAt)}</td>
                          <td className="border border-slate-300 px-6 py-4 text-sm">
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span>
                          </td>
                          <td className="border border-slate-300 px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button disabled={isWorking(`approve:${request.id}`)} onClick={() => runAdminAction(`approve:${request.id}`, "/api/admin/approve-user", { requestId: request.id }, "Access request approved", { type: "temp-password", name: request.name, email: request.email, role: request.role })} className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60">
                                {isWorking(`approve:${request.id}`) ? "Approving..." : "Approve"}
                              </button>
                              <button disabled={isWorking(`reject:${request.id}`)} onClick={() => runAdminAction(`reject:${request.id}`, "/api/admin/reject-user", { requestId: request.id }, "Access request rejected")} className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60">
                                {isWorking(`reject:${request.id}`) ? "Rejecting..." : "Reject"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {accessRequests.length === 0 && <p className="py-8 text-center text-slate-500">No pending access requests or revoked users.</p>}
              </div>
            )}

            {activeTab === "add-user" && (
              <div>
                <h2 className="mb-6 text-xl font-bold text-slate-900">Add New User</h2>
                <div className="max-w-2xl">
                  <form onSubmit={handleAddUser} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">Full Name <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter faculty member's full name" className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${formErrors.name ? "border-red-500 bg-red-50 focus:border-red-600" : "border-slate-300 bg-white focus:border-blue-500"}`} />
                      {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">Email Address <span className="text-red-500">*</span></label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter email address" className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${formErrors.email ? "border-red-500 bg-red-50 focus:border-red-600" : "border-slate-300 bg-white focus:border-blue-500"}`} />
                      {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">Role <span className="text-red-500">*</span></label>
                      <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-colors ${formErrors.role ? "border-red-500 bg-red-50 focus:border-red-600" : "border-slate-300 bg-white focus:border-blue-500"}`}>
                        <option value="FACULTY">Faculty</option>
                        <option value="HOD">Head of Department (HOD)</option>
                        <option value="DEAN">Dean</option>
                        <option value="VC">Vice Chancellor (VC)</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      {formErrors.role && <p className="mt-1 text-xs text-red-600">{formErrors.role}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">Department <span className="text-slate-500">(Optional)</span></label>
                      <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="e.g., Computer Science" className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">College <span className="text-slate-500">(Optional)</span></label>
                      <input type="text" value={formData.college} onChange={(e) => setFormData({ ...formData, college: e.target.value })} placeholder="e.g., College of Engineering" className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button type="submit" disabled={isWorking("add-user")} className="flex-1 rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
                        {isWorking("add-user") ? "Adding User..." : "Add User"}
                      </button>
                      <button type="button" onClick={() => { setFormData({ name: "", email: "", role: "FACULTY", department: "", college: "" }); setFormErrors({}); }} className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                        Clear
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}