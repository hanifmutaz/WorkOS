import Link from "next/link";

type Workspace = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <Link
      href={`/workspaces/${workspace.id}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition hover:border-primary"
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
        style={{ backgroundColor: `${workspace.color}22` }}
      >
        {workspace.icon}
      </span>
      <span className="text-sm font-medium text-white">{workspace.name}</span>
    </Link>
  );
}
