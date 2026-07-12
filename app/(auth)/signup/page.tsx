"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 text-center">
          <h1 className="mb-2 text-lg font-semibold text-white">Cek email lu</h1>
          <p className="text-sm text-muted">
            Kalau Supabase project lu masih pake email confirmation, klik link
            konfirmasi yang dikirim ke {email} dulu sebelum login. Kalau
            confirmation-nya udah dimatiin, langsung aja login.
          </p>
          <Link href="/login" className="mt-4 inline-block text-sm text-primary">
            Ke halaman login →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6">
        <h1 className="mb-1 text-xl font-semibold text-white">Daftar WorkOS</h1>
        <p className="mb-6 text-sm text-muted">Bikin akun baru</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
            required
          />
          <input
            type="password"
            placeholder="Password (min. 6 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary"
            required
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Daftar..." : "Daftar"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Udah punya akun?{" "}
          <Link href="/login" className="text-primary">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
