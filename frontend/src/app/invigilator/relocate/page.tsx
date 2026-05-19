"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ActiveSession {
  id: string;
  examId: string;
  ipAddress?: string;
  userAgent?: string;
  startedAt?: string;
  student: { id: string; firstName: string; lastName: string; studentId?: string };
  exam: { id: string; title: string; courseCode: string };
  seatingAssignment?: { seatX: number; seatY: number; seatLabel?: string; venue?: { id: string; name: string } };
}

interface Venue {
  id: string;
  name: string;
  capacity: number;
}

export default function RelocatePage() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null);
  const [form, setForm] = useState({ newIpAddress: "", venueId: "", newSeatX: 0, newSeatY: 0, newSeatLabel: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    setIsLoading(true);
    try {
      const [sessRes, venRes] = await Promise.all([
        api.get("/sessions/active"),
        api.get("/invigilator/venues"),
      ]);
      setSessions(sessRes.data.data || []);
      setVenues(venRes.data.data || []);
    } catch {
      setMessage("Failed to load active sessions");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openRelocate(session: ActiveSession) {
    setSelectedSession(session);
    setForm({
      newIpAddress: session.ipAddress || "",
      venueId: session.seatingAssignment?.venue?.id || "",
      newSeatX: session.seatingAssignment?.seatX || 0,
      newSeatY: session.seatingAssignment?.seatY || 0,
      newSeatLabel: session.seatingAssignment?.seatLabel || "",
    });
    setMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSession) return;
    try {
      await api.patch(`/sessions/${selectedSession.id}/relocate`, form);
      setMessage(`Successfully relocated ${selectedSession.student.firstName} ${selectedSession.student.lastName}`);
      setSelectedSession(null);
      await loadData();
    } catch (err: any) {
      setMessage(err.response?.data?.error?.message || "Relocation failed");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Student Relocation</h1>
        <p className="text-muted-foreground">Move an active exam session to a new computer or seat</p>
      </div>

      {message && (
        <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-800">{message}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Active Exam Sessions</h2>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : sessions.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No active sessions right now.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <Card key={s.id} className={selectedSession?.id === s.id ? "border-primary" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{s.student.firstName} {s.student.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          {s.exam.courseCode} - {s.exam.title}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {s.ipAddress && <Badge variant="outline">IP: {s.ipAddress}</Badge>}
                          {s.seatingAssignment?.venue && <Badge variant="outline">Venue: {s.seatingAssignment.venue.name}</Badge>}
                          {s.seatingAssignment?.seatLabel && <Badge variant="outline">Seat: {s.seatingAssignment.seatLabel}</Badge>}
                        </div>
                      </div>
                      <Button size="sm" onClick={() => openRelocate(s)}>Relocate</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Relocation Form</h2>
          {selectedSession ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{selectedSession.student.firstName} {selectedSession.student.lastName}</CardTitle>
                <CardDescription>{selectedSession.exam.courseCode}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New IP Address</label>
                    <Input value={form.newIpAddress} onChange={(e) => setForm({ ...form, newIpAddress: e.target.value })} placeholder="e.g. 192.168.1.100" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Venue</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.venueId}
                      onChange={(e) => setForm({ ...form, venueId: e.target.value })}
                      required
                    >
                      <option value="">Select venue...</option>
                      {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Seat X</label>
                      <Input type="number" step="0.01" value={form.newSeatX} onChange={(e) => setForm({ ...form, newSeatX: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Seat Y</label>
                      <Input type="number" step="0.01" value={form.newSeatY} onChange={(e) => setForm({ ...form, newSeatY: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Seat Label</label>
                    <Input value={form.newSeatLabel} onChange={(e) => setForm({ ...form, newSeatLabel: e.target.value })} placeholder="e.g. A12" />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">Confirm Relocation</Button>
                    <Button type="button" variant="outline" onClick={() => setSelectedSession(null)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Select an active session to relocate.</CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}
