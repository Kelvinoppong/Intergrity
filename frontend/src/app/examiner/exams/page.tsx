"use client";

import { useEffect, useState } from "react";
import { useExamStore } from "@/store/examStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Exam, Question, QuestionType } from "@/types";

const STATUS_COLORS: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  DRAFT: "secondary",
  PUBLISHED: "success",
  ACTIVE: "warning",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

export default function ExamsPage() {
  const { exams, isLoading, fetchExams, createExam, deleteExam, publishExam } = useExamStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showQuestionBuilder, setShowQuestionBuilder] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", courseCode: "", courseName: "", durationMinutes: 60, institutionId: "" });

  useEffect(() => { fetchExams(); }, [fetchExams]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createExam(form);
    setShowCreate(false);
    setForm({ title: "", courseCode: "", courseName: "", durationMinutes: 60, institutionId: "" });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Exams</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>{showCreate ? "Cancel" : "New Exam"}</Button>
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Create New Exam</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Code</label>
                <Input value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Name</label>
                <Input value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) })} required />
              </div>
              <div className="col-span-2">
                <Button type="submit">Create Exam</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showQuestionBuilder && <QuestionBuilder examId={showQuestionBuilder} onClose={() => setShowQuestionBuilder(null)} />}

      {isLoading ? (
        <p className="text-muted-foreground">Loading exams...</p>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="text-lg font-semibold">{exam.title}</h3>
                  <p className="text-sm text-muted-foreground">{exam.courseCode} - {exam.courseName}</p>
                  <p className="text-sm text-muted-foreground">{exam.durationMinutes} min | {exam._count?.questions || 0} questions | {exam.totalMarks} marks</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_COLORS[exam.status]}>{exam.status}</Badge>
                  <Button variant="outline" size="sm" onClick={() => setShowQuestionBuilder(exam.id)}>Questions</Button>
                  {exam.status === "DRAFT" && (
                    <Button size="sm" onClick={() => publishExam(exam.id)}>Publish</Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => deleteExam(exam.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {exams.length === 0 && <p className="text-muted-foreground">No exams yet. Create your first exam above.</p>}
        </div>
      )}
    </div>
  );
}

function QuestionBuilder({ examId, onClose }: { examId: string; onClose: () => void }) {
  const { addQuestion } = useExamStore();
  const [qForm, setQForm] = useState<{
    type: QuestionType;
    text: string;
    options: string[];
    correctAnswer: string;
    blanks: string[];
    marks: number;
  }>({
    type: "MCQ",
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    blanks: ["", ""],
    marks: 1,
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const payload: Partial<Question> = {
      type: qForm.type,
      text: qForm.text,
      marks: qForm.marks,
    };
    if (qForm.type === "MCQ") {
      payload.options = qForm.options.filter(Boolean);
      payload.correctAnswer = qForm.correctAnswer;
    } else if (qForm.type === "MULTI_BLANK_EQUATION") {
      payload.correctAnswer = qForm.blanks.filter((b) => b !== "");
    } else {
      payload.correctAnswer = qForm.correctAnswer;
    }
    await addQuestion(examId, payload);
    setQForm({ type: "MCQ", text: "", options: ["", "", "", ""], correctAnswer: "", blanks: ["", ""], marks: 1 });
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Add Question</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={qForm.type}
                onChange={(e) => setQForm({ ...qForm, type: e.target.value as QuestionType })}
              >
                <option value="MCQ">Multiple Choice</option>
                <option value="TRUE_FALSE">True / False</option>
                <option value="FILL_IN_BLANK">Fill in the Blank</option>
                <option value="MULTI_BLANK_EQUATION">Multi-Blank Equation</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Marks</label>
              <Input type="number" value={qForm.marks} onChange={(e) => setQForm({ ...qForm, marks: parseInt(e.target.value) })} min={1} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Question Text {qForm.type === "MULTI_BLANK_EQUATION" && <span className="text-xs text-muted-foreground">(use ___ for each blank, e.g. "x + ___ = ___")</span>}</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={qForm.text}
              onChange={(e) => setQForm({ ...qForm, text: e.target.value })}
              required
            />
          </div>

          {qForm.type === "MCQ" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Options</label>
              {qForm.options.map((opt, i) => (
                <Input
                  key={i}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  value={opt}
                  onChange={(e) => {
                    const opts = [...qForm.options];
                    opts[i] = e.target.value;
                    setQForm({ ...qForm, options: opts });
                  }}
                />
              ))}
            </div>
          )}

          {qForm.type === "MULTI_BLANK_EQUATION" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Blank Answers (in order)</label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setQForm({ ...qForm, blanks: [...qForm.blanks, ""] })}>+ Blank</Button>
                  {qForm.blanks.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setQForm({ ...qForm, blanks: qForm.blanks.slice(0, -1) })}>- Blank</Button>
                  )}
                </div>
              </div>
              {qForm.blanks.map((b, i) => (
                <Input
                  key={i}
                  placeholder={`Blank ${i + 1} answer`}
                  value={b}
                  onChange={(e) => {
                    const blanks = [...qForm.blanks];
                    blanks[i] = e.target.value;
                    setQForm({ ...qForm, blanks });
                  }}
                  required
                />
              ))}
            </div>
          )}

          {qForm.type !== "MULTI_BLANK_EQUATION" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Correct Answer</label>
            {qForm.type === "TRUE_FALSE" ? (
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={qForm.correctAnswer}
                onChange={(e) => setQForm({ ...qForm, correctAnswer: e.target.value })}
              >
                <option value="">Select</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            ) : (
              <Input value={qForm.correctAnswer} onChange={(e) => setQForm({ ...qForm, correctAnswer: e.target.value })} required />
            )}
          </div>
          )}

          <Button type="submit">Add Question</Button>
        </form>
      </CardContent>
    </Card>
  );
}
