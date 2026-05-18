"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { connectSocket } from "@/lib/socket";
import { useMonitoringStore } from "@/store/monitoringStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Venue, BehavioralFlag } from "@/types";

export default function InvigilatorDashboard() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const { liveFlags, addFlag } = useMonitoringStore();
  const [reportContent, setReportContent] = useState("");

  useEffect(() => {
    api.get("/invigilator/venues").then(({ data }) => setVenues(data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedVenue) return;

    const venue = venues.find((v) => v.id === selectedVenue);
    if (!venue) return;

    const socket = connectSocket();
    socket.emit("join:monitor", { examId: venue.examId });

    socket.on("flag:new", (flag: BehavioralFlag) => {
      addFlag(flag);
    });

    return () => {
      socket.off("flag:new");
    };
  }, [selectedVenue, venues, addFlag]);

  async function submitReport() {
    if (!selectedVenue || !reportContent.trim()) return;
    try {
      await api.post("/invigilator/reports", {
        venueId: selectedVenue,
        content: reportContent,
        severity: "warning",
      });
      setReportContent("");
    } catch {}
  }

  const FLAG_COLORS: Record<string, string> = {
    TAB_SWITCH: "bg-yellow-100 text-yellow-800",
    PASTE_EVENT: "bg-red-100 text-red-800",
    WINDOW_BLUR: "bg-orange-100 text-orange-800",
    USB_DETECTED: "bg-red-200 text-red-900",
    MULTI_DEVICE: "bg-purple-100 text-purple-800",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Invigilator Dashboard</h1>
        <p className="text-muted-foreground">Monitor exam venues in real-time</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Venues</h2>
          {venues.map((v) => (
            <Card
              key={v.id}
              className={`cursor-pointer transition-colors ${selectedVenue === v.id ? "border-primary" : ""}`}
              onClick={() => setSelectedVenue(v.id)}
            >
              <CardContent className="p-4">
                <p className="font-medium">{v.name}</p>
                <p className="text-sm text-muted-foreground">Capacity: {v.capacity}</p>
              </CardContent>
            </Card>
          ))}
          {venues.length === 0 && <p className="text-muted-foreground">No venues assigned.</p>}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedVenue && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Live Flag Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 space-y-2 overflow-y-auto">
                    {liveFlags.length === 0 && (
                      <p className="text-sm text-muted-foreground">No flags reported yet. Monitoring...</p>
                    )}
                    {liveFlags.map((flag, i) => (
                      <div key={i} className="flex items-center justify-between rounded-md border p-3">
                        <div className="flex items-center gap-3">
                          <span className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${FLAG_COLORS[flag.flagType] || "bg-gray-100"}`}>
                            {flag.flagType.replace(/_/g, " ")}
                          </span>
                          <span className="text-sm">Student: {flag.studentId.slice(0, 8)}...</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(flag.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>File Report</CardTitle></CardHeader>
                <CardContent>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Describe the incident..."
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                  />
                  <Button className="mt-3" onClick={submitReport} disabled={!reportContent.trim()}>
                    Submit Report
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {!selectedVenue && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Select a venue to start monitoring</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
