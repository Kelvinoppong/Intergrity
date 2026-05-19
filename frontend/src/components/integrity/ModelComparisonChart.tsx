"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ModelMetrics } from "@/types";
import { GlowCard } from "@/components/dashboard/DashboardShell";

interface Props {
  results: ModelMetrics[];
}

export function ModelComparisonChart({ results }: Props) {
  const data = results.map((r) => ({
    name: r.model.replace(/_/g, " ").toUpperCase(),
    Precision: parseFloat((r.precision_macro * 100).toFixed(1)),
    Recall: parseFloat((r.recall_macro * 100).toFixed(1)),
    F1: parseFloat((r.f1_macro * 100).toFixed(1)),
  }));

  return (
    <GlowCard
      title="Model Comparison"
      description="Precision, Recall and F1 across all 4 GNN models"
    >
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="precisionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="recallGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="f1Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" stopOpacity={1} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
          <Tooltip
            formatter={(value: number) => `${value}%`}
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "white",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }} iconType="circle" />
          <Bar dataKey="Precision" fill="url(#precisionGrad)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Recall" fill="url(#recallGrad)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="F1" fill="url(#f1Grad)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GlowCard>
  );
}
