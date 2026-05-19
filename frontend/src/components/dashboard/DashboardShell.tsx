"use client";

import * as React from "react";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="relative min-h-full">
      <div className="pointer-events-none absolute inset-0 dashboard-grid opacity-50" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gradient" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export function GlowButton({ variant = "gradient", size = "md", className = "", children, ...rest }: GlowButtonProps) {
  const sizeStyles = {
    sm: "h-9 px-4 text-xs",
    md: "h-10 px-5 text-sm",
    lg: "h-12 px-7 text-base",
  };

  const variantStyles = {
    gradient:
      "bg-gradient-to-b from-white via-white/95 to-white/60 text-slate-900 hover:scale-[1.03] active:scale-95 shadow-lg shadow-white/10",
    ghost: "bg-white/5 text-white hover:bg-white/10 border border-white/10",
    outline: "border border-white/20 text-white hover:bg-white/5",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-50 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function GlowCard({ children, className = "", title, description, action }: GlowCardProps) {
  return (
    <div className={`glow-card p-6 ${className}`}>
      {(title || description || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {description && <p className="mt-0.5 text-sm text-white/50">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
