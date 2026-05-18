"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/examiner", label: "Dashboard" },
  { href: "/examiner/exams", label: "Exams" },
  { href: "/examiner/integrity", label: "AI Integrity" },
  { href: "/examiner/analytics", label: "Analytics" },
];

export default function ExaminerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, fetchProfile } = useAuthStore();

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      router.push("/login");
      return;
    }
    if (!isAuthenticated) fetchProfile();
  }, [isAuthenticated, fetchProfile, router]);

  useEffect(() => {
    if (isAuthenticated && user && user.role !== "EXAMINER" && user.role !== "ADMIN") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-card p-6">
        <Link href="/examiner">
          <h2 className="text-xl font-bold text-primary">INTEGRITY</h2>
          <p className="text-xs text-muted-foreground">Examiner Portal</p>
        </Link>
        <nav className="mt-8 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <p className="text-sm text-muted-foreground">{user?.firstName} {user?.lastName}</p>
          <Button variant="ghost" size="sm" onClick={() => { logout(); router.push("/login"); }} className="mt-2">
            Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
