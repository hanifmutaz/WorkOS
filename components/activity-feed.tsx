type ActivityLog = {
  id: string;
  entity_type: string;
  entity_name: string;
  action: string;
  detail: string | null;
  created_at: string;
};

const ACTION_LABEL: Record<string, string> = {
  created: "bikin",
  updated: "ubah",
  deleted: "hapus",
  status_changed: "ubah status",
};

const ENTITY_ICON: Record<string, string> = {
  workspace: "📁",
  project: "📦",
  task: "✅",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "baru aja";
  if (minutes < 60) return `${minutes}m lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  return `${days}h lalu`;
}

export function ActivityFeed({ logs }: { logs: ActivityLog[] }) {
  if (!logs.length) {
    return <p className="text-sm text-muted">Belum ada aktivitas.</p>;
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5"
        >
          <div className="flex items-center gap-2 text-sm">
            <span>{ENTITY_ICON[log.entity_type]}</span>
            <span className="text-muted">{ACTION_LABEL[log.action]}</span>
            <span className="text-white">{log.entity_name}</span>
            {log.detail && <span className="text-xs text-muted">({log.detail})</span>}
          </div>
          <span className="text-xs text-muted">{timeAgo(log.created_at)}</span>
        </div>
      ))}
    </div>
  );
}
