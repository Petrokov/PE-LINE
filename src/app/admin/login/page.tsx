"use client";

import { useActionState } from "react";
import { signIn, type SignInResult } from "@/lib/actions/auth";

const initialState: SignInResult | null = null;

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary px-4">
      <form
        action={action}
        className="w-full max-w-sm bg-white border border-line rounded-[16px] p-8 space-y-5"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <h1 className="text-xl font-bold text-ink">Admin prijava</h1>

        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">E-mail</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="w-full border border-line rounded-[8px] px-3 py-2 text-sm focus:outline-none focus:border-petrol transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Lozinka</label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full border border-line rounded-[8px] px-3 py-2 text-sm focus:outline-none focus:border-petrol transition-colors"
          />
        </div>

        {state && !state.ok && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-petrol text-white rounded-[10px] py-2.5 text-sm font-semibold disabled:opacity-60 cursor-pointer"
        >
          {pending ? "Prijava..." : "Prijavi se"}
        </button>
      </form>
    </div>
  );
}
