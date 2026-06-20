"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserRole = "faculty" | "hod" | "dean" | "vc" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export function useUser(redirectTo?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
          if (redirectTo) {
            router.push(redirectTo);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
        if (redirectTo) {
          router.push(redirectTo);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router, redirectTo]);

  return { user, loading };
}
