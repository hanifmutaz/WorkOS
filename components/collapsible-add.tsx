"use client";

import { useState } from "react";

export function CollapsibleAdd({
    label,
    children,
}: {
    label: string;
    children: (close: () => void) => React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="w-full rounded-lg border border-dashed border-border px-4 py-2 text-left text-sm text-muted hover:border-primary hover:text-primary"
            >
                {label}
            </button>
        );
    }

    return <>{children(() => setOpen(false))}</>;
}