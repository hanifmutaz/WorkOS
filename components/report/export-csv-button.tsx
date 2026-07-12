"use client";

type TaskRow = {
  workspace: string;
  project: string;
  task: string;
  status: string;
  priority: string;
  deadline: string | null;
  hours: number;
};

function toCSV(rows: TaskRow[]) {
  const header = ["Workspace", "Project", "Task", "Status", "Priority", "Deadline", "Jam"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;

  const lines = rows.map((r) =>
    [
      escape(r.workspace),
      escape(r.project),
      escape(r.task),
      escape(r.status),
      escape(r.priority),
      escape(r.deadline ?? "-"),
      r.hours.toFixed(2),
    ].join(",")
  );

  return [header.join(","), ...lines].join("\n");
}

export function ExportCSVButton({ rows }: { rows: TaskRow[] }) {
  function handleExport() {
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `workos-report-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="rounded-lg border border-border px-4 py-2 text-sm text-white hover:border-primary"
    >
      ⬇ Export CSV
    </button>
  );
}
