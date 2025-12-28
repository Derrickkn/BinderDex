/**
 * Sentry Edge Runtime Initialization
 * Migrated from sentry.edge.config.ts
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring - 10% of transactions
  tracesSampleRate: 0.1,

  // Debug mode (disabled in production)
  debug: false,
});
