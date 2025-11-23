"use client";

import { useEffect, useState } from "react";

interface LoginFormProps {
  handleLogin: (formData: FormData) => Promise<void>;
  errorMessage: string | string[] | null;
}

export function LoginForm({ handleLogin, errorMessage }: LoginFormProps) {
  const [csrf, setCsrf] = useState("");

  useEffect(() => {
    fetch('/api/csrf')
      .then(res => res.json())
      .then(data => setCsrf(data.csrf))
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Admin sign in</h1>

      {errorMessage && (
        <p className="text-red-600 text-sm mt-4">
          {decodeURIComponent(errorMessage as string)}
        </p>
      )}

      <form action={handleLogin} className="mt-6 grid gap-3 rounded-2xl border p-4">
        <input type="hidden" name="csrf" value={csrf} />

        <input
          name="username"
          placeholder="Username"
          className="rounded-xl border px-4 py-3 text-sm"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="rounded-xl border px-4 py-3 text-sm"
        />

        <button 
          className="rounded-xl bg-fuchsia-600 text-white px-4 py-3 text-sm font-semibold"
          disabled={!csrf}
        >
          Sign in
        </button>

        <p className="text-xs text-slate-500">
          Protected area. Authorized staff only.
        </p>
      </form>
    </div>
  );
}
