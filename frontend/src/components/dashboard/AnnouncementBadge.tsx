"use client";

import Link from "next/link";
import * as React from "react";

interface AnnouncementBadgeProps {
  tag?: string;
  message: string;
  href?: string;
  ctaLabel?: string;
  tone?: "default" | "warning" | "success";
}

const TONES = {
  default: "border-white/15 bg-white/5 text-white/80",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
};

const TAG_TONES = {
  default: "bg-indigo-500/20 text-indigo-200 border-indigo-400/30",
  warning: "bg-amber-500/20 text-amber-100 border-amber-400/30",
  success: "bg-emerald-500/20 text-emerald-100 border-emerald-400/30",
};

export function AnnouncementBadge({
  tag = "New",
  message,
  href,
  ctaLabel,
  tone = "default",
}: AnnouncementBadgeProps) {
  const content = (
    <span className={`group inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs backdrop-blur-md transition-all hover:scale-[1.02] hover:border-white/30 ${TONES[tone]}`}>
      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TAG_TONES[tone]}`}>
        {tag}
      </span>
      <span className="font-medium">{message}</span>
      {href && (
        <span className="flex items-center gap-1 pr-1 text-white/60 transition-colors group-hover:text-white">
          {ctaLabel || "Read more"}
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
