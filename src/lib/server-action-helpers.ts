import { z } from "zod";
import { formatValidationError } from "./validation/common";
import { isAppError, mapSupabaseError, formatErrorResponse } from "./errors";

/**
 * Server action helpers for consistent error handling and input validation
 */

/**
 * Standard server action response format
 */
export type ServerActionResponse<T = void> = {
  data: T | null;
  error: string | null;
};

/**
 * Simple server action response (no data, just error)
 */
export type SimpleServerActionResponse = {
  error: string | null;
};

/**
 * Handles errors in server actions and returns user-friendly messages
 * @internal
 */
function handleServerActionError(error: unknown): string {
  console.error('Server action error:', error);

  // Handle custom app errors
  if (isAppError(error)) {
    return error.userMessage || error.message;
  }

  // Handle generic Error objects (BEFORE Supabase check)
  // Generic errors don't have Supabase-specific codes
  if (error instanceof Error && !('code' in error)) {
    return error.message;
  }

  // Handle Supabase/database errors
  if (error && typeof error === 'object' && ('code' in error || 'message' in error)) {
    const mappedError = mapSupabaseError(error);
    return mappedError.userMessage || mappedError.message;
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Wraps a server action with input validation using Zod schema
 *
 * Usage:
 * ```ts
 * export const myAction = withValidation(
 *   myInputSchema,
 *   async (validatedInput) => {
 *     // Your action logic here with guaranteed valid input
 *     return { data: result, error: null };
 *   }
 * );
 * ```
 *
 * @param schema - Zod schema to validate input against
 * @param action - Server action function that receives validated input
 * @returns Wrapped function that validates input before calling action
 */
export function withValidation<TInput, TOutput>(
  schema: z.ZodType<TInput>,
  action: (validatedInput: TInput) => Promise<ServerActionResponse<TOutput>>
): (input: unknown) => Promise<ServerActionResponse<TOutput>> {
  return async (input: unknown): Promise<ServerActionResponse<TOutput>> => {
    // Validate input
    const validationResult = schema.safeParse(input);

    if (!validationResult.success) {
      const formattedError = formatValidationError(validationResult.error);
      return {
        data: null,
        error: formattedError.error,
      };
    }

    // Execute action with validated input
    try {
      return await action(validationResult.data);
    } catch (error) {
      return {
        data: null,
        error: handleServerActionError(error),
      };
    }
  };
}

/**
 * Variant of withValidation for actions that don't return data (simple error response)
 *
 * Usage:
 * ```ts
 * export const myAction = withSimpleValidation(
 *   myInputSchema,
 *   async (validatedInput) => {
 *     // Your action logic here
 *     return { error: null };
 *   }
 * );
 * ```
 */
export function withSimpleValidation<TInput>(
  schema: z.ZodType<TInput>,
  action: (validatedInput: TInput) => Promise<SimpleServerActionResponse>
): (input: unknown) => Promise<SimpleServerActionResponse> {
  return async (input: unknown): Promise<SimpleServerActionResponse> => {
    // Validate input
    const validationResult = schema.safeParse(input);

    if (!validationResult.success) {
      const formattedError = formatValidationError(validationResult.error);
      return {
        error: formattedError.error,
      };
    }

    // Execute action with validated input
    try {
      return await action(validationResult.data);
    } catch (error) {
      return {
        error: handleServerActionError(error),
      };
    }
  };
}

/**
 * Wraps multiple parameters into a validated server action
 * Useful for actions that take multiple separate parameters
 *
 * Usage:
 * ```ts
 * export async function myAction(param1: string, param2: number) {
 *   return withMultiParamValidation(
 *     z.object({ param1: z.string(), param2: z.number() }),
 *     { param1, param2 },
 *     async (validated) => {
 *       // Your logic with validated.param1, validated.param2
 *       return { data: result, error: null };
 *     }
 *   );
 * }
 * ```
 */
export async function withMultiParamValidation<TInput, TOutput>(
  schema: z.ZodType<TInput>,
  input: unknown,
  action: (validatedInput: TInput) => Promise<ServerActionResponse<TOutput>>
): Promise<ServerActionResponse<TOutput>> {
  // Validate input
  const validationResult = schema.safeParse(input);

  if (!validationResult.success) {
    const formattedError = formatValidationError(validationResult.error);
    return {
      data: null,
      error: formattedError.error,
    };
  }

  // Execute action with validated input
  try {
    return await action(validationResult.data);
  } catch (error) {
    return {
      data: null,
      error: handleServerActionError(error),
    };
  }
}

/**
 * Simple version of withMultiParamValidation for actions with no data return
 */
export async function withSimpleMultiParamValidation<TInput>(
  schema: z.ZodType<TInput>,
  input: unknown,
  action: (validatedInput: TInput) => Promise<SimpleServerActionResponse>
): Promise<SimpleServerActionResponse> {
  // Validate input
  const validationResult = schema.safeParse(input);

  if (!validationResult.success) {
    const formattedError = formatValidationError(validationResult.error);
    return {
      error: formattedError.error,
    };
  }

  // Execute action with validated input
  try {
    return await action(validationResult.data);
  } catch (error) {
    return {
      error: handleServerActionError(error),
    };
  }
}
