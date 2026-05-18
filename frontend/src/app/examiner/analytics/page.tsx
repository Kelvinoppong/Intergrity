"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreDistributionChart } from "@/components/analytics/ScoreDistributionChart";
import { GradeBreakdownChart } from "@/components/analytics/GradeBreakdownChart";
import type { Exam } from "@/types";

interface ExamStats {
  totalSubmissions: number;
  maxPossibleScore: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  medianScore: number;
  standardDeviation: number;
  passRate: string | null;
  scoreDistribution: Record<string, number>;
  byGender: Record<string, { count: number; averageScore: number }>;
  byProgram: Record<string, { count: number; averageScore: number }>;
}

interface GradeData {
  boundaries: Record<string, number>;
  grades: Record<string, number>;
  totalStudents: number;
}

export default function AnalyticsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [stats, setStats] = useState<ExamStats | null>(null);
  const [grades, setGrades] = useState<GradeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.get("/exams").then(({ data }) => setExams(data.data || [])).catch(() => {});
  }, []);

  async function loadStats() {
    if (!selectedExamId) return;
    setIsLoading(true);
    try {
      const [statsRes, gradesRes] = await Promise.all([
        api.get(`/analytics/exam/${selectedExamId}`),
        api.get(`/analytics/exam/${selectedExamId}/grades`),
      ]);
      setStats(statsRes.data.data.stats || statsRes.data.data);
      setGrades(gradesRes.data.data);
    } catch {
      setStats(null);
      setGrades(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Exam performance statistics and reporting</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Exam</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
              >
                <option value="">Choose an exam...</option>
                {exams.map((e) => (
                  <option key={e.id} value={e.id}>{e.title} ({e.courseCode})</option>
                ))}
              </select>
            </div>
            <Button onClick={loadStats} disabled={!selectedExamId || isLoading}>
              {isLoading ? "Loading..." : "Load Analytics"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{stats.totalSubmissions}</p>
                <p className="text-sm text-muted-foreground">Submissions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.averageScore?.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">{stats.highestScore}</p>
                <p className="text-sm text-muted-foreground">Highest Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-purple-600">{stats.passRate ? `${stats.passRate}%` : "N/A"}</p>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Summary Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Max Possible Score</span><span className="font-medium">{stats.maxPossibleScore}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Median Score</span><span className="font-medium">{stats.medianScore?.toFixed(1)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Lowest Score</span><span className="font-medium">{stats.lowestScore}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Standard Deviation</span><span className="font-medium">{stats.standardDeviation?.toFixed(2)}</span></div>
                </div>
              </CardContent>
            </Card>

            {stats.scoreDistribution && (
              <ScoreDistributionChart distribution={stats.scoreDistribution} />
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {stats.byGender && Object.keys(stats.byGender).length > 0 && (
              <Card>
                <CardHeader><CardTitle>Performance by Gender</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byGender).map(([gender, data]) => (
                      <div key={gender} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="font-medium">{gender}</p>
                          <p className="text-xs text-muted-foreground">{data.count} students</p>
                        </div>
                        <p className="text-lg font-semibold">{data.averageScore.toFixed(1)} avg</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.byProgram && Object.keys(stats.byProgram).length > 0 && (
              <Card>
                <CardHeader><CardTitle>Performance by Program</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byProgram).map(([program, data]) => (
                      <div key={program} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="font-medium">{program}</p>
                          <p className="text-xs text-muted-foreground">{data.count} students</p>
                        </div>
                        <p className="text-lg font-semibold">{data.averageScore.toFixed(1)} avg</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {grades && <GradeBreakdownChart grades={grades.grades} total={grades.totalStudents} />}
        </>
      )}

      {!stats && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Select an exam to view analytics</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
