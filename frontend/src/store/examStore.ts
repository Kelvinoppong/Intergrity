import { create } from "zustand";
import api from "@/lib/api";
import type { Exam, Question } from "@/types";

interface ExamState {
  exams: Exam[];
  currentExam: Exam | null;
  isLoading: boolean;

  fetchExams: (params?: Record<string, string>) => Promise<void>;
  fetchExam: (id: string) => Promise<void>;
  createExam: (data: Partial<Exam>) => Promise<Exam>;
  updateExam: (id: string, data: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  publishExam: (id: string) => Promise<void>;
  addQuestion: (examId: string, question: Partial<Question>) => Promise<void>;
  addBulkQuestions: (examId: string, questions: Partial<Question>[]) => Promise<void>;
}

export const useExamStore = create<ExamState>((set) => ({
  exams: [],
  currentExam: null,
  isLoading: false,

  fetchExams: async (params) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/exams", { params });
      set({ exams: data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchExam: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/exams/${id}`);
      set({ currentExam: data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  createExam: async (examData) => {
    const { data } = await api.post("/exams", examData);
    set((s) => ({ exams: [data.data, ...s.exams] }));
    return data.data;
  },

  updateExam: async (id, examData) => {
    const { data } = await api.put(`/exams/${id}`, examData);
    set((s) => ({ exams: s.exams.map((e) => (e.id === id ? data.data : e)) }));
  },

  deleteExam: async (id) => {
    await api.delete(`/exams/${id}`);
    set((s) => ({ exams: s.exams.filter((e) => e.id !== id) }));
  },

  publishExam: async (id) => {
    const { data } = await api.patch(`/exams/${id}/publish`);
    set((s) => ({ exams: s.exams.map((e) => (e.id === id ? data.data : e)) }));
  },

  addQuestion: async (examId, question) => {
    await api.post(`/questions/exam/${examId}`, question);
  },

  addBulkQuestions: async (examId, questions) => {
    await api.post(`/questions/exam/${examId}/bulk`, { questions });
  },
}));
