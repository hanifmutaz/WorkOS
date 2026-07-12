"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center text-white">
      <p className="mb-2 text-lg font-semibold">Ada yang error, bre</p>
      <p className="mb-6 max-w-sm text-sm text-muted">
        {error.message || "Gagal muat data. Coba cek koneksi ke Supabase lu."}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-background hover:opacity-90"
      >
        Coba lagi
      </button>
    </div>
  );
}
