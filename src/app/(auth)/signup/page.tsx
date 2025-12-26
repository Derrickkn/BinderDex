"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout, AuthInput, AuthButton } from "@/components/auth";
import { signUp } from "@/lib/supabase/auth-actions";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    setPasswordError(null);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Client-side validation
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.success);
    }
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start organizing your collection"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline">
            Sign in
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

        {/* Success Alert */}
        {success && (
          <div className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
            {success}
          </div>
        )}

        <AuthInput
          label="Display Name"
          name="displayName"
          type="text"
          placeholder="Your name"
          autoComplete="name"
        />

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
          placeholder="At least 6 characters"
          autoComplete="new-password"
          required
          error={passwordError || undefined}
        />

        <AuthInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          required
        />

        <AuthButton>Create Account</AuthButton>
      </form>
    </AuthLayout>
  );
}
