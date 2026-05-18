"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ModelMetrics } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle>Model Comparison — Precision, Recall, F1</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Legend />
            <Bar dataKey="Precision" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Recall" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="F1" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
