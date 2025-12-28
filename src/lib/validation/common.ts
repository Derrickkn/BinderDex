import { z } from "zod";

/**
 * Common validation schemas and utilities used across the application
 */

// UUID validation
export const uuidSchema = z.string().uuid({ message: "Invalid UUID format" });

// Set ID validation (alphanumeric with optional "pt" suffix, e.g., "sv8", "sv8pt5", "me1", "zsv10pt5")
export const setIdSchema = z
  .string()
  .min(1, { message: "Set ID is required" })
  .max(20, { message: "Set ID is too long" })
  .regex(/^[a-z0-9]+(?:pt[0-9]+)?$/i, {
    message: "Invalid set ID format",
  });

// Positive integer validation
export const positiveIntSchema = z
  .number()
  .int({ message: "Must be an integer" })
  .positive({ message: "Must be a positive number" });

// Non-negative integer validation (allows 0)
export const nonNegativeIntSchema = z
  .number()
  .int({ message: "Must be an integer" })
  .nonnegative({ message: "Cannot be negative" });

// Date string validation (ISO 8601 format)
export const dateStringSchema = z
  .string()
  .datetime({ message: "Invalid date format. Expected ISO 8601 string" })
  .nullable()
  .optional();

// Enum validation helpers
export const createEnumSchema = <T extends string>(
  values: readonly T[],
  name: string
) => {
  return z.enum(values as [T, ...T[]], {
    errorMap: () => ({
      message: `Invalid ${name}. Must be one of: ${values.join(", ")}`,
    }),
  });
};

// Slot config enum
export const slotConfigSchema = createEnumSchema(
  ["NINE", "TWELVE", "SIXTEEN"] as const,
  "slot configuration"
);

// Variant type enum
export const variantTypeSchema = createEnumSchema(
  [
    "NORMAL",
    "REVERSE_HOLO",
    "FIRST_EDITION",
    "SHADOWLESS",
    "UNLIMITED",
    "POKEBALL",
    "MASTERBALL",
  ] as const,
  "variant type"
);

// Card condition enum
export const cardConditionSchema = createEnumSchema(
  ["Mint", "Near Mint", "Excellent", "Good", "Light Played", "Played", "Poor"] as const,
  "card condition"
).nullable().optional();

// Generic error response type
export interface ValidationErrorResponse {
  error: string;
  details?: z.ZodIssue[];
}

/**
 * Formats Zod validation errors into user-friendly messages
 */
export function formatValidationError(error: z.ZodError): ValidationErrorResponse {
  const firstError = error.issues[0];

  return {
    error: firstError?.message || "Validation failed",
    details: error.issues,
  };
}

/**
 * Creates a safe parser that returns a result object instead of throwing
 */
export function createSafeParser<T extends z.ZodType>(schema: T) {
  return (data: unknown) => {
    const result = schema.safeParse(data);

    if (result.success) {
      return { success: true as const, data: result.data };
    } else {
      return {
        success: false as const,
        error: formatValidationError(result.error),
      };
    }
  };
}
