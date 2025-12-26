"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout, AuthInput, AuthButton } from "@/components/auth";
import { resetPassword } from "@/lib/supabase/auth-actions";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);

    const result = await resetPassword(formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.success);
    }
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="We'll send you a link to reset your password"
      footer={
        <>
          Remember your password?{" "}
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
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <AuthButton>Send Reset Link</AuthButton>
      </form>
    </AuthLayout>
  );
}
