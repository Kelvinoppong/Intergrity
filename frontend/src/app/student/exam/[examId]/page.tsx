"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import { useAutoSave } from "@/hooks/useAutoSave";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Question } from "@/types";

export default function ExamTakingPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sessionId = session?.id || "";

  useAntiCheat({ sessionId, enabled: !!sessionId });
  const { lastSaved, isSaving } = useAutoSave({ sessionId, answers, enabled: !!sessionId });

  useEffect(() => {
    async function init() {
      try {
        const { data: sessionData } = await api.post("/sessions/start", { examId });
        setSession(sessionData.data.session);

        if (sessionData.data.recoveredAnswers) {
          setAnswers(sessionData.data.recoveredAnswers);
        }

        const { data: examData } = await api.get(`/exams/${examId}`);
        setQuestions(examData.data.questions || []);
        setTimeLeft(examData.data.durationMinutes * 60);

        const socket = connectSocket();
        socket.emit("join:exam", { sessionId: sessionData.data.session.id, examId });
      } catch (err: any) {
        alert(err.response?.data?.error?.message || "Failed to start exam");
        router.push("/student");
      }
    }
    init();
    return () => disconnectSocket();
  }, [examId, router]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  function setAnswer(questionId: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !sessionId) return;
    setIsSubmitting(true);
    try {
      const answerList = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
      const { data } = await api.post(`/sessions/${sessionId}/submit`, { answers: answerList });

      const socket = connectSocket();
      socket.emit("exam:submit", { sessionId });

      alert(`Exam submitted! Score: ${data.data.score}/${data.data.maxScore} (${data.data.percentage}%)`);
      router.push("/student");
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, sessionId, answers, router]);

  const q = questions[currentIndex];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between rounded-lg bg-card p-4 shadow">
        <div className="flex items-center gap-4">
          <Badge variant={timeLeft < 300 ? "destructive" : "default"} className="text-lg px-4 py-1">
            {formatTime(timeLeft)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            {isSaving ? "Saving..." : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : "Not saved yet"}
          </span>
          <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Exam"}
          </Button>
        </div>
      </div>

      {q && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question {currentIndex + 1}</CardTitle>
              <Badge variant="outline">{q.marks} mark{q.marks > 1 ? "s" : ""}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-lg">{q.text}</p>

            {q.type === "MCQ" && Array.isArray(q.options) && (
              <div className="space-y-3">
                {q.options.map((opt: string, i: number) => (
                  <label
                    key={i}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                      answers[q.id] === opt ? "border-primary bg-primary/5" : "hover:bg-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswer(q.id, opt)}
                      className="h-4 w-4"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === "TRUE_FALSE" && (
              <div className="flex gap-4">
                {["true", "false"].map((val) => (
                  <label
                    key={val}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border p-4 transition-colors ${
                      answers[q.id] === val ? "border-primary bg-primary/5" : "hover:bg-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === val}
                      onChange={() => setAnswer(q.id, val)}
                      className="h-4 w-4"
                    />
                    <span className="capitalize">{val}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === "FILL_IN_BLANK" && (
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={(answers[q.id] as string) || ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder="Type your answer..."
              />
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}>
          Previous
        </Button>
        <div className="flex flex-wrap gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-8 w-8 rounded-md text-xs font-medium transition-colors ${
                i === currentIndex
                  ? "bg-primary text-primary-foreground"
                  : answers[questions[i]?.id] !== undefined
                    ? "bg-green-100 text-green-700"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))} disabled={currentIndex === questions.length - 1}>
          Next
        </Button>
      </div>
    </div>
  );
}
