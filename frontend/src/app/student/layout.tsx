"use client";

import { PortalLayout } from "@/components/dashboard/PortalLayout";

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const NAV_ITEMS = [
  { href: "/student", label: "Dashboard", icon: <Icon d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10" /> },
  { href: "/student/exam", label: "My Exams", icon: <Icon d="M9 12h6M9 16h6M9 8h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" /> },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalLayout portalName="Student Portal" navItems={NAV_ITEMS} allowedRoles={["STUDENT"]}>
      {children}
    </PortalLayout>
  );
}
