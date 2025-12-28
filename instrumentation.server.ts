/**
 * Sentry Server-side Initialization (Node.js runtime)
 * Migrated from sentry.server.config.ts
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring - 10% of transactions
  tracesSampleRate: 0.1,

  // Debug mode (disabled in production)
  debug: false,

  // Filter out validation and auth errors (noise reduction)
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Don't send validation errors (user mistakes)
    if (error && typeof error === "object" && "code" in error) {
      const errorCode = (error as { code: string }).code;
      if (errorCode === "VALIDATION_ERROR" || errorCode === "AUTH_ERROR") {
        return null;
      }
    }

    return event;
  },
});
