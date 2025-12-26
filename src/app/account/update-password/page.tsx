"use client";

import { useState } from "react";
import { AuthLayout, AuthInput, AuthButton } from "@/components/auth";
import { Particles } from "@/components/magicui/particles";
import { updatePassword } from "@/lib/supabase/auth-actions";

export default function UpdatePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
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

    const result = await updatePassword(formData);
    if (result?.error) {
      setError(result.error);
    }
    // On success, updatePassword redirects to "/"
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      {/* Background Particles */}
      <Particles
        className="absolute inset-0"
        quantity={30}
        staticity={50}
        ease={50}
        color="#a855f7"
      />

      <div className="relative z-10">
        <AuthLayout
          title="Update password"
          subtitle="Enter your new password"
        >
          <form action={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <AuthInput
              label="New Password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
              error={passwordError || undefined}
            />

            <AuthInput
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              autoComplete="new-password"
              required
            />

            <AuthButton>Update Password</AuthButton>
          </form>
        </AuthLayout>
      </div>
    </div>
  );
}
