/**
 * Custom error classes for BinderDex
 * Provides type-safe error handling with user-friendly messages
 */

/**
 * Base application error class
 * All custom errors extend from this class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation error - Invalid input data
 * HTTP 400 Bad Request
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Invalid input data', userMessage?: string) {
    super(
      message,
      'VALIDATION_ERROR',
      400,
      userMessage || 'Invalid data. Please check your input.'
    );
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication error - User not logged in
 * HTTP 401 Unauthorized
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', userMessage?: string) {
    super(
      message,
      'AUTH_ERROR',
      401,
      userMessage || 'Please log in to continue'
    );
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization error - User lacks permission
 * HTTP 403 Forbidden
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Permission denied', userMessage?: string) {
    super(
      message,
      'AUTHORIZATION_ERROR',
      403,
      userMessage || "You don't have permission to access this resource"
    );
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not found error - Resource doesn't exist
 * HTTP 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', userMessage?: string) {
    super(
      message,
      'NOT_FOUND',
      404,
      userMessage || 'The requested resource was not found'
    );
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict error - Duplicate or conflicting data
 * HTTP 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflict detected', userMessage?: string) {
    super(
      message,
      'CONFLICT_ERROR',
      409,
      userMessage || 'This action conflicts with existing data'
    );
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Database error - Database operation failed
 * HTTP 500 Internal Server Error
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', userMessage?: string) {
    super(
      message,
      'DATABASE_ERROR',
      500,
      userMessage || 'Something went wrong. Please try again.'
    );
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Network error - Network request failed
 * HTTP 503 Service Unavailable
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed', userMessage?: string) {
    super(
      message,
      'NETWORK_ERROR',
      503,
      userMessage || 'Network error. Please check your connection and try again.'
    );
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Rate limit error - Too many requests
 * HTTP 429 Too Many Requests
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', userMessage?: string) {
    super(
      message,
      'RATE_LIMIT_ERROR',
      429,
      userMessage || 'Too many requests. Please wait a moment and try again.'
    );
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Maps Supabase/Postgres error codes to user-friendly AppError instances
 */
export function mapSupabaseError(error: unknown): AppError {
  if (!error || typeof error !== 'object') {
    return new DatabaseError('Unknown database error');
  }

  const dbError = error as { code?: string; message?: string; details?: string };

  // Authentication required (not logged in)
  if (dbError.code === 'PGRST301' || dbError.code === 'PGRST116') {
    return new AuthenticationError(
      dbError.message || 'Authentication required'
    );
  }

  // Row Level Security violation (permission denied)
  if (dbError.message?.includes('row level security') || dbError.message?.includes('RLS')) {
    return new AuthorizationError(
      dbError.message || 'Permission denied'
    );
  }

  // Unique constraint violation (duplicate data)
  if (dbError.code === '23505') {
    return new ConflictError(
      dbError.message || 'Duplicate data',
      'This item already exists'
    );
  }

  // Foreign key violation (referenced item doesn't exist)
  if (dbError.code === '23503') {
    return new NotFoundError(
      dbError.message || 'Referenced resource not found',
      'The referenced item no longer exists'
    );
  }

  // Check constraint violation (invalid data)
  if (dbError.code === '23514') {
    return new ValidationError(
      dbError.message || 'Check constraint violation',
      'Invalid data. Please check your input.'
    );
  }

  // Not null violation (required field missing)
  if (dbError.code === '23502') {
    return new ValidationError(
      dbError.message || 'Required field missing',
      'Please fill in all required fields'
    );
  }

  // Generic constraint violation (23xxx codes)
  if (dbError.code?.startsWith('23')) {
    return new ValidationError(
      dbError.message || 'Data validation failed',
      'Invalid data. Please check your input.'
    );
  }

  // Connection errors (08xxx codes)
  if (dbError.code?.startsWith('08')) {
    return new NetworkError(
      dbError.message || 'Database connection failed'
    );
  }

  // Generic database error
  return new DatabaseError(
    dbError.message || 'Database operation failed'
  );
}

/**
 * Formats an error for API responses
 */
export function formatErrorResponse(error: unknown): {
  error: string;
  code?: string;
  statusCode?: number;
} {
  if (isAppError(error)) {
    return {
      error: error.userMessage || error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      statusCode: 500,
    };
  }

  return {
    error: 'An unexpected error occurred',
    statusCode: 500,
  };
}
