import { create } from "zustand";
import type { BehavioralFlag } from "@/types";

interface MonitoringState {
  liveFlags: BehavioralFlag[];
  addFlag: (flag: BehavioralFlag) => void;
  clearFlags: () => void;
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
  liveFlags: [],

  addFlag: (flag) =>
    set((s) => ({ liveFlags: [flag, ...s.liveFlags].slice(0, 500) })),

  clearFlags: () => set({ liveFlags: [] }),
}));
