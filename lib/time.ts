type TimeEntry = {
  id: string;
  task_id: string;
  started_at: string;
  ended_at: string | null;
};

export function aggregateTimeEntries(entries: TimeEntry[]) {
  const map: Record<
    string,
    { baseSeconds: number; runningEntryId: string | null; runningStartedAt: string | null }
  > = {};

  for (const entry of entries) {
    if (!map[entry.task_id]) {
      map[entry.task_id] = { baseSeconds: 0, runningEntryId: null, runningStartedAt: null };
    }

    if (entry.ended_at) {
      const seconds =
        (new Date(entry.ended_at).getTime() - new Date(entry.started_at).getTime()) / 1000;
      map[entry.task_id].baseSeconds += seconds;
    } else {
      map[entry.task_id].runningEntryId = entry.id;
      map[entry.task_id].runningStartedAt = entry.started_at;
    }
  }

  return map;
}
