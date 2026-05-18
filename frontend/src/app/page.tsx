"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, fetchProfile } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchProfile();
  }, [fetchProfile, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!user) return;

    switch (user.role) {
      case "EXAMINER":
        router.push("/examiner");
        break;
      case "STUDENT":
        router.push("/student");
        break;
      case "INVIGILATOR":
        router.push("/invigilator");
        break;
      case "ADMIN":
        router.push("/examiner");
        break;
      default:
        router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">INTEGRITY</h1>
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    </main>
  );
}
