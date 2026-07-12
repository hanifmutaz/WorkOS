import Link from "next/link";

type Project = {
  id: string;
  name: string;
  status: string;
  priority: string;
};

const STATUS_COLOR: Record<string, string> = {
  planning: "text-muted border-border",
  active: "text-primary border-primary",
  done: "text-green-400 border-green-400",
  archived: "text-muted border-border",
};

const PRIORITY_COLOR: Record<string, string> = {
  low: "bg-slate-500/20 text-slate-300",
  medium: "bg-amber-500/20 text-amber-300",
  high: "bg-red-500/20 text-red-300",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-primary"
    >
      <span className="text-sm text-white">{project.name}</span>
      <div className="flex items-center gap-2">
        <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_COLOR[project.status]}`}>
          {project.status}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs ${PRIORITY_COLOR[project.priority]}`}>
          {project.priority}
        </span>
      </div>
    </Link>
  );
}
