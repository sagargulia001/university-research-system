"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";

type UserRole = "faculty" | "hod" | "dean" | "vc" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export function useUser(redirectTo?: string) {
  const router = useRouter();
  const { data, error, isLoading } = useSWR<{ user: User }>(
    "/api/auth/me",
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );

  const user = data?.user ?? null;

  // Redirect if unauthorized or error
  if (!isLoading && (error || !user) && redirectTo) {
    router.push(redirectTo);
  }

  return { user, loading: isLoading, error };
}
