"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface PortalLayoutProps {
  children: React.ReactNode;
  portalName: string;
  navItems: NavItem[];
  allowedRoles: string[];
}

interface InstitutionBrand {
  name?: string;
  shortName?: string;
  logoUrl?: string;
  primaryColor?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5000";

export function PortalLayout({ children, portalName, navItems, allowedRoles }: PortalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, fetchProfile } = useAuthStore();
  const [brand, setBrand] = useState<InstitutionBrand | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      router.push("/login");
      return;
    }
    if (!isAuthenticated) fetchProfile();
  }, [isAuthenticated, fetchProfile, router]);

  useEffect(() => {
    if (isAuthenticated && user && !allowedRoles.includes(user.role)) {
      router.push("/");
    }
  }, [isAuthenticated, user, router, allowedRoles]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get("/institutions/me").then((r) => setBrand(r.data.data)).catch(() => {});
    }
  }, [isAuthenticated]);

  const logoSrc = brand?.logoUrl?.startsWith("http") ? brand.logoUrl : brand?.logoUrl ? `${API_BASE}${brand.logoUrl}` : null;
  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="flex min-h-screen dashboard-bg text-white">
      <aside
        className={cn(
          "sticky top-0 flex h-screen shrink-0 flex-col border-r border-white/5 bg-slate-950/80 backdrop-blur-xl transition-all duration-300",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <div className="border-b border-white/5 p-4">
          <Link href={navItems[0]?.href || "/"} className="flex items-center gap-3">
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoSrc} alt="Logo" className="h-9 w-9 shrink-0 rounded-lg object-contain ring-1 ring-white/10" />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 ring-1 ring-white/20">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{brand?.shortName || "INTEGRITY"}</p>
                <p className="truncate text-[10px] uppercase tracking-wider text-white/40">{portalName}</p>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-white/10 text-white shadow-inner shadow-white/5"
                    : "text-white/55 hover:bg-white/5 hover:text-white",
                  collapsed && "justify-center",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-500" />
                )}
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-3">
          <div className={cn("mb-3 flex items-center gap-3 rounded-lg p-2", collapsed && "justify-center")}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
              {initials || "?"}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                <p className="truncate text-xs text-white/40">{user?.email}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="flex h-8 flex-1 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
              title={collapsed ? "Expand" : "Collapse"}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={collapsed ? "rotate-180" : ""}>
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="flex h-8 flex-1 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300"
              title="Sign out"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden p-6 md:p-10">{children}</main>
    </div>
  );
}
