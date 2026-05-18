"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  grades: Record<string, number>;
  total: number;
}

const GRADE_COLORS: Record<string, string> = {
  A: "#22c55e",
  B: "#3b82f6",
  C: "#eab308",
  D: "#f97316",
  F: "#ef4444",
};

export function GradeBreakdownChart({ grades, total }: Props) {
  const data = Object.entries(grades).map(([grade, count]) => ({
    grade,
    students: count,
    percentage: total > 0 ? ((count / total) * 100).toFixed(1) : "0",
  }));

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Grade Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="grade" tick={{ fontSize: 14, fontWeight: "bold" }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number, _name: string, entry: any) => [`${value} students (${entry.payload.percentage}%)`, "Count"]} />
            <Bar dataKey="students" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade] || "#6b7280"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
