/**
 * Sentry Client-side Initialization
 * Migrated from sentry.client.config.ts
 * https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Router transition tracking for navigation events
 * Required for capturing navigation performance
 */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

export function register() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Performance monitoring - 10% of transactions
    tracesSampleRate: 0.1,

    // Debug mode (disabled in production)
    debug: false,

    // Session Replay for error debugging
    // Capture 100% of sessions with errors, 10% of normal sessions
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,

    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

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
}
