"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { connectSocket } from "@/lib/socket";
import { useMonitoringStore } from "@/store/monitoringStore";
import { useAuthStore } from "@/store/authStore";
import { DashboardShell, GlowButton, GlowCard } from "@/components/dashboard/DashboardShell";
import { AnnouncementBadge } from "@/components/dashboard/AnnouncementBadge";
import { GradientHeading } from "@/components/dashboard/GradientHeading";
import { StatCard } from "@/components/dashboard/StatCard";
import type { Venue, BehavioralFlag } from "@/types";

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const FLAG_TONE: Record<string, string> = {
  TAB_SWITCH: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  PASTE_EVENT: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  WINDOW_BLUR: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  USB_DETECTED: "bg-red-500/20 text-red-200 border-red-500/40",
  MULTI_DEVICE: "bg-purple-500/15 text-purple-300 border-purple-500/30",
};

export default function InvigilatorDashboard() {
  const { user } = useAuthStore();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const { liveFlags, addFlag } = useMonitoringStore();
  const [reportContent, setReportContent] = useState("");
  const [severity, setSeverity] = useState("warning");

  useEffect(() => {
    api.get("/invigilator/venues").then(({ data }) => setVenues(data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedVenue) return;
    const venue = venues.find((v) => v.id === selectedVenue);
    if (!venue) return;

    const socket = connectSocket();
    socket.emit("join:monitor", { examId: venue.examId });
    socket.on("flag:new", (flag: BehavioralFlag) => addFlag(flag));

    return () => {
      socket.off("flag:new");
    };
  }, [selectedVenue, venues, addFlag]);

  async function submitReport() {
    if (!selectedVenue || !reportContent.trim()) return;
    try {
      await api.post("/invigilator/reports", { venueId: selectedVenue, content: reportContent, severity });
      setReportContent("");
    } catch {}
  }

  const flagCounts = liveFlags.reduce<Record<string, number>>((acc, f) => {
    acc[f.flagType] = (acc[f.flagType] || 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardShell>
      <header className="mb-10 space-y-5">
        <AnnouncementBadge
          tag={liveFlags.length > 0 ? "Live" : "Status"}
          message={
            liveFlags.length > 0
              ? `${liveFlags.length} behavioral flag${liveFlags.length > 1 ? "s" : ""} in the last session`
              : "All venues clear — monitoring active"
          }
          tone={liveFlags.length > 0 ? "warning" : "success"}
        />

        <GradientHeading
          highlight="Eyes on,"
          title={`${user?.firstName || "Invigilator"}.`}
          subtitle="Real-time behavioral telemetry across every venue you supervise. Flag, report, and respond in seconds."
        />
      </header>

      <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Venues Assigned"
          value={venues.length}
          accent="indigo"
          icon={<Icon d="M3 21h18M5 21V7l8-4 8 4v14" />}
        />
        <StatCard
          label="Live Flags"
          value={liveFlags.length}
          accent="amber"
          icon={<Icon d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />}
        />
        <StatCard
          label="Critical"
          value={(flagCounts.USB_DETECTED || 0) + (flagCounts.MULTI_DEVICE || 0)}
          accent="rose"
          icon={<Icon d="M12 9v4M12 17.01V17M4.93 19.07A10 10 0 1 1 19.07 4.93 10 10 0 0 1 4.93 19.07z" />}
        />
        <StatCard
          label="Active Now"
          value={
            <span className="flex items-center gap-2">
              <span className="live-dot inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 text-emerald-400" />
              {selectedVenue ? "Live" : "Idle"}
            </span>
          }
          accent="emerald"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlowCard title="Your Venues" description="Select to start monitoring">
          {venues.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 py-10 text-center text-sm text-white/40">
              No venues assigned yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {venues.map((v) => {
                const active = selectedVenue === v.id;
                return (
                  <li key={v.id}>
                    <button
                      onClick={() => setSelectedVenue(v.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition ${
                        active
                          ? "border-indigo-400/40 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                          : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{v.name}</p>
                        <p className="text-xs text-white/40">Capacity: {v.capacity}</p>
                      </div>
                      {active && (
                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                          <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400 text-emerald-400" />
                          Live
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </GlowCard>

        <GlowCard
          className="lg:col-span-2"
          title={
            <span className="flex items-center gap-3">
              Live Flag Feed
              {selectedVenue && (
                <span className="flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-rose-400 text-rose-400" />
                  Streaming
                </span>
              )}
            </span>
          }
          description={selectedVenue ? "Behavioral events as they happen" : "Select a venue to begin streaming"}
        >
          {!selectedVenue ? (
            <div className="rounded-lg border border-dashed border-white/10 py-16 text-center text-sm text-white/40">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-white/30">
                <circle cx="12" cy="12" r="3" />
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              </svg>
              Select a venue to start monitoring.
            </div>
          ) : liveFlags.length === 0 ? (
            <div className="rounded-lg border border-dashed border-emerald-500/20 bg-emerald-500/5 py-12 text-center text-sm text-emerald-300/80">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-3">
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              All clear — no flags reported yet.
            </div>
          ) : (
            <ul className="max-h-96 space-y-2 overflow-y-auto scrollbar-thin pr-1">
              {liveFlags.map((flag, i) => (
                <li key={i} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${FLAG_TONE[flag.flagType] || FLAG_TONE.TAB_SWITCH}`}>
                      {flag.flagType.replace(/_/g, " ")}
                    </span>
                    <span className="truncate text-sm text-white/80">Student: <span className="font-mono text-white/50">{flag.studentId.slice(0, 8)}…</span></span>
                  </div>
                  <span className="shrink-0 text-xs text-white/40">{new Date(flag.createdAt).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          )}
        </GlowCard>
      </section>

      {selectedVenue && (
        <section className="mt-6">
          <GlowCard title="File Incident Report" description="Submit a written report to the examiner">
            <div className="space-y-3">
              <div className="flex gap-2">
                {(["info", "warning", "critical"] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition ${
                      severity === sev
                        ? sev === "critical"
                          ? "border-rose-500/40 bg-rose-500/15 text-rose-200"
                          : sev === "warning"
                            ? "border-amber-500/40 bg-amber-500/15 text-amber-200"
                            : "border-blue-500/40 bg-blue-500/15 text-blue-200"
                        : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
              <textarea
                className="auth-input min-h-[100px] w-full rounded-lg p-3 text-sm"
                placeholder="Describe the incident in detail..."
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
              />
              <div className="flex justify-end">
                <GlowButton variant="gradient" onClick={submitReport} disabled={!reportContent.trim()}>
                  Submit Report
                </GlowButton>
              </div>
            </div>
          </GlowCard>
        </section>
      )}
    </DashboardShell>
  );
}
