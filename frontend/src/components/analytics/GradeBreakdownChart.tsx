"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { GlowCard } from "@/components/dashboard/DashboardShell";

interface Props {
  grades: Record<string, number>;
  total: number;
}

const GRADE_COLORS: Record<string, string> = {
  A: "#34d399",
  B: "#60a5fa",
  C: "#fbbf24",
  D: "#fb923c",
  F: "#f87171",
};

export function GradeBreakdownChart({ grades, total }: Props) {
  const data = Object.entries(grades).map(([grade, count]) => ({
    grade,
    students: count,
    percentage: total > 0 ? ((count / total) * 100).toFixed(1) : "0",
  }));

  return (
    <GlowCard title="Grade Breakdown" description={`Total students graded: ${total}`}>
      <div className="mb-5 flex flex-wrap gap-2">
        {data.map((d) => (
          <div
            key={d.grade}
            className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-slate-950"
              style={{ backgroundColor: GRADE_COLORS[d.grade] || "#94a3b8" }}
            >
              {d.grade}
            </span>
            <div className="text-xs">
              <p className="font-semibold text-white">{d.students}</p>
              <p className="text-white/40">{d.percentage}%</p>
            </div>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="grade" tick={{ fontSize: 14, fontWeight: "bold", fill: "rgba(255,255,255,0.7)" }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
          <Tooltip
            formatter={(value: number, _name: string, entry: any) => [`${value} students (${entry.payload.percentage}%)`, "Count"]}
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "white",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar dataKey="students" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade] || "#94a3b8"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlowCard>
  );
}
