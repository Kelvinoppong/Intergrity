"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ExamSession } from "@/types";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<(ExamSession & { exam: any })[]>([]);

  useEffect(() => {
    if (!user) return;
    api.get(`/students/${user.id}/exams`).then(({ data }) => {
      setSessions(data.data || []);
    }).catch(() => {});
  }, [user]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.firstName}</h1>
        <p className="text-muted-foreground">Your examination dashboard</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Exams</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{sessions.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Submitted</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600">{sessions.filter((s) => s.status === "SUBMITTED").length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-orange-600">{sessions.filter((s) => s.status === "IN_PROGRESS").length}</p></CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Exams</h2>
      <div className="space-y-3">
        {sessions.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{s.exam?.title}</p>
                <p className="text-sm text-muted-foreground">{s.exam?.courseCode}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={s.status === "SUBMITTED" ? "success" : s.status === "IN_PROGRESS" ? "warning" : "secondary"}>
                  {s.status}
                </Badge>
                {s.score !== null && s.score !== undefined && (
                  <span className="text-sm font-medium">{s.score}/{s.maxScore}</span>
                )}
                {s.status === "IN_PROGRESS" && (
                  <Link href={`/student/exam/${s.examId}`}>
                    <Button size="sm">Continue</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {sessions.length === 0 && <p className="text-muted-foreground">No exams assigned yet.</p>}
      </div>
    </div>
  );
}
