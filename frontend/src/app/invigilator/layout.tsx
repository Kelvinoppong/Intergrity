"use client";

import { PortalLayout } from "@/components/dashboard/PortalLayout";

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const NAV_ITEMS = [
  { href: "/invigilator", label: "Dashboard", icon: <Icon d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10" /> },
  { href: "/invigilator/venues", label: "Venues", icon: <Icon d="M3 21h18M5 21V7l8-4 8 4v14M9 9v.01M9 12v.01M9 15v.01M9 18v.01M15 9v.01M15 12v.01M15 15v.01M15 18v.01" /> },
  { href: "/invigilator/relocate", label: "Relocate", icon: <Icon d="M14 5l7 7-7 7M3 12h18" /> },
];

export default function InvigilatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalLayout portalName="Invigilator Portal" navItems={NAV_ITEMS} allowedRoles={["INVIGILATOR", "ADMIN"]}>
      {children}
    </PortalLayout>
  );
}
