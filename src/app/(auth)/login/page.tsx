"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout, AuthInput, AuthButton } from "@/components/auth";
import { signIn } from "@/lib/supabase/auth-actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-white hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form action={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <AuthInput
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <AuthInput
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-end">
          <Link
            href="/reset-password"
            className="text-sm text-zinc-400 hover:text-white"
          >
            Forgot password?
          </Link>
        </div>

        <AuthButton>Sign In</AuthButton>
      </form>
    </AuthLayout>
  );
}
