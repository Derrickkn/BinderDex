import { InputHTMLAttributes, forwardRef } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-zinc-400"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-md border bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none ${
            error
              ? "border-red-500/50 focus:border-red-500"
              : "border-zinc-700 focus:border-zinc-500"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
