"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email atau password salah. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card bg-white p-8 shadow-soft">
      <div className="mb-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-teal-deep text-white">
          <LogIn className="h-6 w-6" />
        </span>
        <h1 className="mt-3 text-lg font-extrabold text-neutral-espresso">
          Masuk ke Dashboard Admin
        </h1>
        <p className="mt-1 text-xs text-neutral-slate">
          Khusus untuk Kepala Sekolah, Operator, dan Guru
        </p>
      </div>

      <div>
        <label className="text-sm font-semibold text-neutral-espresso">
          Email
        </label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field mt-1.5"
          placeholder="nama@sdnpanderejogempol.sch.id"
        />
      </div>

      <div className="mt-4">
        <label className="text-sm font-semibold text-neutral-espresso">
          Password
        </label>
        <div className="relative mt-1.5">
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-slate hover:text-neutral-espresso"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-button bg-primary-teal px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        {loading ? "Memproses..." : "Masuk"}
      </button>

      <p className="mt-5 text-center text-xs text-neutral-slate">
        Lupa password? Hubungi Super Admin/Operator sekolah untuk reset akun.
      </p>
    </form>
  );
}
