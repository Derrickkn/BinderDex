import Link from "next/link";
import { ReactNode } from "react";

// Binder logo component (same as landing page)
const BinderLogo = ({ className = "h-5 w-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 20" fill="none">
    <rect x="0" y="0" width="4" height="20" rx="1" fill="currentColor" opacity="0.6" />
    <circle cx="2" cy="4" r="1.5" fill="currentColor" />
    <circle cx="2" cy="10" r="1.5" fill="currentColor" />
    <circle cx="2" cy="16" r="1.5" fill="currentColor" />
    <rect x="5" y="1" width="18" height="18" rx="1" fill="currentColor" opacity="0.3" />
    <rect x="6" y="2" width="16" height="16" rx="1" fill="currentColor" opacity="0.5" />
  </svg>
);

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-white"
        >
          <BinderLogo className="h-6 w-7" />
          <span className="text-lg font-medium text-zinc-300">BinderDex</span>
        </Link>

        {/* Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-xl font-medium text-white">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-zinc-400">{subtitle}</p>
            )}
          </div>

          {/* Content */}
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-6 text-center text-sm text-zinc-400">{footer}</div>
        )}
      </div>
    </div>
  );
}
