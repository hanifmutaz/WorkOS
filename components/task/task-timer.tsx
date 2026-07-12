"use client";

import { useEffect, useState, useTransition } from "react";
import { startTimer, stopTimer } from "@/app/(dashboard)/tasks/time-actions";

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}j ${m}m`;
  if (m > 0) return `${m}m ${s}d`;
  return `${s}d`;
}

export function TaskTimer({
  taskId,
  projectId,
  baseSeconds,
  runningEntryId,
  runningStartedAt,
}: {
  taskId: string;
  projectId: string;
  baseSeconds: number;
  runningEntryId: string | null;
  runningStartedAt: string | null;
}) {
  const isRunning = !!runningEntryId;
  const [liveSeconds, setLiveSeconds] = useState(() => {
    if (!runningStartedAt) return 0;
    return Math.floor((Date.now() - new Date(runningStartedAt).getTime()) / 1000);
  });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isRunning || !runningStartedAt) return;
    const interval = setInterval(() => {
      setLiveSeconds(Math.floor((Date.now() - new Date(runningStartedAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, runningStartedAt]);

  function handleToggle() {
    startTransition(async () => {
      if (isRunning && runningEntryId) {
        await stopTimer(runningEntryId, projectId);
      } else {
        await startTimer(taskId, projectId);
      }
    });
  }

  const total = baseSeconds + (isRunning ? liveSeconds : 0);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted">{formatDuration(total)}</span>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`rounded-md px-2 py-0.5 text-xs ${
          isRunning
            ? "bg-red-500/20 text-red-300"
            : "bg-primary/20 text-primary"
        }`}
      >
        {isRunning ? "⏸ Stop" : "▶ Start"}
      </button>
    </div>
  );
}
