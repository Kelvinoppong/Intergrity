"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExaminerDashboard() {
  const [stats, setStats] = useState({ exams: 0, published: 0, active: 0, completed: 0 });

  useEffect(() => {
    api.get("/exams").then(({ data }) => {
      const exams = data.data || [];
      setStats({
        exams: exams.length,
        published: exams.filter((e: any) => e.status === "PUBLISHED").length,
        active: exams.filter((e: any) => e.status === "ACTIVE").length,
        completed: exams.filter((e: any) => e.status === "COMPLETED").length,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { title: "Total Exams", value: stats.exams, color: "text-blue-600" },
    { title: "Published", value: stats.published, color: "text-green-600" },
    { title: "Active", value: stats.active, color: "text-orange-600" },
    { title: "Completed", value: stats.completed, color: "text-gray-600" },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your examination activity</p>
        </div>
        <Link href="/examiner/exams">
          <Button>Create Exam</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/examiner/exams"><Button variant="outline" className="w-full justify-start">Manage Exams</Button></Link>
            <Link href="/examiner/integrity"><Button variant="outline" className="w-full justify-start">AI Integrity Dashboard</Button></Link>
            <Link href="/examiner/analytics"><Button variant="outline" className="w-full justify-start">View Analytics</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
