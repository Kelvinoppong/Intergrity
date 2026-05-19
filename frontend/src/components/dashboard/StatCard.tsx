"use client";

import * as React from "react";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  delta?: { value: string; positive?: boolean };
  accent?: "indigo" | "purple" | "emerald" | "amber" | "rose" | "blue";
}

const ACCENTS = {
  indigo: "from-indigo-500/30 via-indigo-500/0 to-transparent",
  purple: "from-purple-500/30 via-purple-500/0 to-transparent",
  emerald: "from-emerald-500/30 via-emerald-500/0 to-transparent",
  amber: "from-amber-500/30 via-amber-500/0 to-transparent",
  rose: "from-rose-500/30 via-rose-500/0 to-transparent",
  blue: "from-blue-500/30 via-blue-500/0 to-transparent",
};

const ICON_BG = {
  indigo: "bg-indigo-500/15 text-indigo-300",
  purple: "bg-purple-500/15 text-purple-300",
  emerald: "bg-emerald-500/15 text-emerald-300",
  amber: "bg-amber-500/15 text-amber-300",
  rose: "bg-rose-500/15 text-rose-300",
  blue: "bg-blue-500/15 text-blue-300",
};

export function StatCard({ label, value, icon, delta, accent = "indigo" }: StatCardProps) {
  return (
    <div className="glow-card relative overflow-hidden p-5">
      <div className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-60 blur-2xl ${ACCENTS[accent]}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {delta && (
            <p className={`text-xs font-medium ${delta.positive ? "text-emerald-400" : "text-rose-400"}`}>
              {delta.positive ? "▲" : "▼"} {delta.value}
            </p>
          )}
        </div>
        {icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${ICON_BG[accent]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
