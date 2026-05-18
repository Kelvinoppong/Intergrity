"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";

interface AutoSaveConfig {
  sessionId: string;
  answers: Record<string, unknown>;
  intervalMs?: number;
  enabled: boolean;
}

export function useAutoSave({ sessionId, answers, intervalMs = 15000, enabled }: AutoSaveConfig) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const answersRef = useRef(answers);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (!enabled || !sessionId) return;

    const socket = getSocket();

    function save() {
      setIsSaving(true);
      socket.emit("answer:save", { sessionId, answers: answersRef.current });
    }

    socket.on("answer:saved", ({ success }: { success: boolean }) => {
      setIsSaving(false);
      if (success) setLastSaved(new Date());
    });

    const interval = setInterval(save, intervalMs);

    return () => {
      clearInterval(interval);
      socket.off("answer:saved");
    };
  }, [sessionId, intervalMs, enabled]);

  return { lastSaved, isSaving };
}
