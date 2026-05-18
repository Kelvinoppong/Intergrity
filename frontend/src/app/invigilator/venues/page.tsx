"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Venue, InvigilatorReport } from "@/types";

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [reports, setReports] = useState<InvigilatorReport[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);

  useEffect(() => {
    api.get("/invigilator/venues").then(({ data }) => setVenues(data.data || [])).catch(() => {});
    api.get("/invigilator/reports").then(({ data }) => setReports(data.data || [])).catch(() => {});
  }, []);

  const filteredReports = selectedVenue
    ? reports.filter((r) => r.venueId === selectedVenue)
    : reports;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Venue Management</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {venues.map((v) => (
          <Card
            key={v.id}
            className={`cursor-pointer transition-colors ${selectedVenue === v.id ? "border-primary" : ""}`}
            onClick={() => setSelectedVenue(selectedVenue === v.id ? null : v.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{v.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Capacity: {v.capacity}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mb-4 text-xl font-semibold">
        Reports {selectedVenue ? "(filtered)" : "(all)"}
      </h2>
      <div className="space-y-3">
        {filteredReports.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex items-start justify-between p-4">
              <div>
                <p className="font-medium">{r.content}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
              <Badge variant={r.severity === "critical" ? "destructive" : r.severity === "warning" ? "warning" : "secondary"}>
                {r.severity}
              </Badge>
            </CardContent>
          </Card>
        ))}
        {filteredReports.length === 0 && <p className="text-muted-foreground">No reports yet.</p>}
      </div>
    </div>
  );
}
