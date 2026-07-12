"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { recordAttachment, deleteAttachment, getAttachmentUrl } from "@/app/(dashboard)/attachments/actions";
import { useToast } from "@/components/toast";

type Attachment = {
    id: string;
    file_name: string;
    storage_path: string;
    file_size: number | null;
};

function formatSize(bytes: number | null) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function AttachmentPanel({
    taskId,
    projectId,
    initialAttachments,
}: {
    taskId: string;
    projectId: string;
    initialAttachments: Attachment[];
}) {
    const [attachments, setAttachments] = useState(initialAttachments);
    const [uploading, setUploading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { show } = useToast();
    const supabase = createClient();

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_SIZE) {
            show("File maksimal 10MB", "error");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setUploading(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            show("Sesi login habis, refresh dulu", "error");
            setUploading(false);
            return;
        }

        const storagePath = `${user.id}/${taskId}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
            .from("attachments")
            .upload(storagePath, file);

        if (uploadError) {
            show(uploadError.message, "error");
            setUploading(false);
            return;
        }

        const res = await recordAttachment({
            taskId,
            projectId,
            fileName: file.name,
            storagePath,
            fileSize: file.size,
            mimeType: file.type,
        });

        if (res?.error) {
            show(res.error, "error");
        } else {
            setAttachments((prev) => [
                { id: crypto.randomUUID(), file_name: file.name, storage_path: storagePath, file_size: file.size },
                ...prev,
            ]);
            show("File terupload");
        }

        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    async function handleOpen(storagePath: string) {
        const res = await getAttachmentUrl(storagePath);
        if (res?.error) {
            show(res.error, "error");
            return;
        }
        if (res?.url) window.open(res.url, "_blank");
    }

    function handleDelete(attachmentId: string, storagePath: string) {
        if (confirmDeleteId !== attachmentId) {
            setConfirmDeleteId(attachmentId);
            return;
        }
        startTransition(async () => {
            const res = await deleteAttachment(attachmentId, storagePath, projectId);
            if (res?.error) {
                show(res.error, "error");
                return;
            }
            setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
            show("File dihapus");
        });
    }

    return (
        <div className="mt-2 space-y-1.5">
            {attachments.map((a) => (
                <div
                    key={a.id}
                    className="flex items-center justify-between rounded-md bg-background px-2.5 py-1.5 text-xs"
                >
                    <button
                        onClick={() => handleOpen(a.storage_path)}
                        className="truncate text-primary hover:underline"
                    >
                        📎 {a.file_name}
                    </button>
                    <div className="flex items-center gap-2 text-muted">
                        <span>{formatSize(a.file_size)}</span>
                        <button
                            onClick={() => handleDelete(a.id, a.storage_path)}
                            disabled={isPending}
                            className={confirmDeleteId === a.id ? "text-red-400" : "hover:text-red-400"}
                        >
                            {confirmDeleteId === a.id ? "yakin?" : "hapus"}
                        </button>
                    </div>
                </div>
            ))}

            <label className="inline-block cursor-pointer text-xs text-muted hover:text-primary">
                {uploading ? "Upload..." : "+ Lampirkan file (maks 10MB)"}
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                />
            </label>
        </div>
    );
}