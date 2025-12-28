import { describe, it, expect } from 'vitest'
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  NetworkError,
  RateLimitError,
  isAppError,
  mapSupabaseError,
  formatErrorResponse,
} from '../errors'

describe('AppError', () => {
  it('creates error with all properties', () => {
    const error = new AppError('Dev message', 'TEST_ERROR', 400, 'User message')

    expect(error.message).toBe('Dev message')
    expect(error.code).toBe('TEST_ERROR')
    expect(error.statusCode).toBe(400)
    expect(error.userMessage).toBe('User message')
    expect(error.name).toBe('AppError')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
  })

  it('defaults to 500 status code', () => {
    const error = new AppError('Dev message', 'TEST_ERROR')
    expect(error.statusCode).toBe(500)
  })
})

describe('ValidationError', () => {
  it('creates with default messages', () => {
    const error = new ValidationError()

    expect(error.message).toBe('Invalid input data')
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.statusCode).toBe(400)
    expect(error.userMessage).toBe('Invalid data. Please check your input.')
    expect(error.name).toBe('ValidationError')
    expect(error).toBeInstanceOf(ValidationError)
    expect(error).toBeInstanceOf(AppError)
  })

  it('creates with custom messages', () => {
    const error = new ValidationError('Missing UUID', 'Please provide a valid ID')

    expect(error.message).toBe('Missing UUID')
    expect(error.userMessage).toBe('Please provide a valid ID')
  })
})

describe('AuthenticationError', () => {
  it('creates with default messages', () => {
    const error = new AuthenticationError()

    expect(error.message).toBe('Authentication required')
    expect(error.code).toBe('AUTH_ERROR')
    expect(error.statusCode).toBe(401)
    expect(error.userMessage).toBe('Please log in to continue')
    expect(error.name).toBe('AuthenticationError')
  })

  it('creates with custom messages', () => {
    const error = new AuthenticationError('Token expired', 'Your session has expired')

    expect(error.message).toBe('Token expired')
    expect(error.userMessage).toBe('Your session has expired')
  })
})

describe('AuthorizationError', () => {
  it('creates with default messages', () => {
    const error = new AuthorizationError()

    expect(error.message).toBe('Permission denied')
    expect(error.code).toBe('AUTHORIZATION_ERROR')
    expect(error.statusCode).toBe(403)
    expect(error.userMessage).toBe("You don't have permission to access this resource")
    expect(error.name).toBe('AuthorizationError')
  })

  it('creates with custom messages', () => {
    const error = new AuthorizationError('RLS violation', 'Access denied')

    expect(error.message).toBe('RLS violation')
    expect(error.userMessage).toBe('Access denied')
  })
})

describe('NotFoundError', () => {
  it('creates with default messages', () => {
    const error = new NotFoundError()

    expect(error.message).toBe('Resource not found')
    expect(error.code).toBe('NOT_FOUND')
    expect(error.statusCode).toBe(404)
    expect(error.userMessage).toBe('The requested resource was not found')
    expect(error.name).toBe('NotFoundError')
  })
})

describe('ConflictError', () => {
  it('creates with default messages', () => {
    const error = new ConflictError()

    expect(error.message).toBe('Conflict detected')
    expect(error.code).toBe('CONFLICT_ERROR')
    expect(error.statusCode).toBe(409)
    expect(error.userMessage).toBe('This action conflicts with existing data')
    expect(error.name).toBe('ConflictError')
  })
})

describe('DatabaseError', () => {
  it('creates with default messages', () => {
    const error = new DatabaseError()

    expect(error.message).toBe('Database operation failed')
    expect(error.code).toBe('DATABASE_ERROR')
    expect(error.statusCode).toBe(500)
    expect(error.userMessage).toBe('Something went wrong. Please try again.')
    expect(error.name).toBe('DatabaseError')
  })
})

describe('NetworkError', () => {
  it('creates with default messages', () => {
    const error = new NetworkError()

    expect(error.message).toBe('Network request failed')
    expect(error.code).toBe('NETWORK_ERROR')
    expect(error.statusCode).toBe(503)
    expect(error.userMessage).toBe('Network error. Please check your connection and try again.')
    expect(error.name).toBe('NetworkError')
  })
})

describe('RateLimitError', () => {
  it('creates with default messages', () => {
    const error = new RateLimitError()

    expect(error.message).toBe('Rate limit exceeded')
    expect(error.code).toBe('RATE_LIMIT_ERROR')
    expect(error.statusCode).toBe(429)
    expect(error.userMessage).toBe('Too many requests. Please wait a moment and try again.')
    expect(error.name).toBe('RateLimitError')
  })
})

describe('isAppError', () => {
  it('returns true for AppError instances', () => {
    expect(isAppError(new AppError('test', 'TEST'))).toBe(true)
    expect(isAppError(new ValidationError())).toBe(true)
    expect(isAppError(new AuthenticationError())).toBe(true)
    expect(isAppError(new DatabaseError())).toBe(true)
  })

  it('returns false for non-AppError values', () => {
    expect(isAppError(new Error('test'))).toBe(false)
    expect(isAppError('error string')).toBe(false)
    expect(isAppError(null)).toBe(false)
    expect(isAppError(undefined)).toBe(false)
    expect(isAppError({})).toBe(false)
  })
})

describe('mapSupabaseError', () => {
  it('maps PGRST301 to AuthenticationError', () => {
    const error = mapSupabaseError({ code: 'PGRST301', message: 'JWT expired' })

    expect(error).toBeInstanceOf(AuthenticationError)
    expect(error.statusCode).toBe(401)
  })

  it('maps PGRST116 to AuthenticationError', () => {
    const error = mapSupabaseError({ code: 'PGRST116' })

    expect(error).toBeInstanceOf(AuthenticationError)
  })

  it('maps RLS violation to AuthorizationError', () => {
    const error = mapSupabaseError({
      message: 'new row violates row level security policy'
    })

    expect(error).toBeInstanceOf(AuthorizationError)
    expect(error.statusCode).toBe(403)
  })

  it('maps 23505 (unique constraint) to ConflictError', () => {
    const error = mapSupabaseError({
      code: '23505',
      message: 'duplicate key value violates unique constraint'
    })

    expect(error).toBeInstanceOf(ConflictError)
    expect(error.statusCode).toBe(409)
    expect(error.userMessage).toBe('This item already exists')
  })

  it('maps 23503 (foreign key) to NotFoundError', () => {
    const error = mapSupabaseError({
      code: '23503',
      message: 'foreign key constraint violation'
    })

    expect(error).toBeInstanceOf(NotFoundError)
    expect(error.statusCode).toBe(404)
    expect(error.userMessage).toBe('The referenced item no longer exists')
  })

  it('maps 23514 (check constraint) to ValidationError', () => {
    const error = mapSupabaseError({
      code: '23514',
      message: 'check constraint violation'
    })

    expect(error).toBeInstanceOf(ValidationError)
    expect(error.statusCode).toBe(400)
  })

  it('maps 23502 (not null) to ValidationError', () => {
    const error = mapSupabaseError({
      code: '23502',
      message: 'null value in column violates not-null constraint'
    })

    expect(error).toBeInstanceOf(ValidationError)
    expect(error.userMessage).toBe('Please fill in all required fields')
  })

  it('maps generic 23xxx codes to ValidationError', () => {
    const error = mapSupabaseError({
      code: '23999',
      message: 'some constraint violation'
    })

    expect(error).toBeInstanceOf(ValidationError)
  })

  it('maps 08xxx (connection) codes to NetworkError', () => {
    const error = mapSupabaseError({
      code: '08006',
      message: 'connection failure'
    })

    expect(error).toBeInstanceOf(NetworkError)
    expect(error.statusCode).toBe(503)
  })

  it('maps unknown errors to DatabaseError', () => {
    const error = mapSupabaseError({
      code: '99999',
      message: 'unknown error'
    })

    expect(error).toBeInstanceOf(DatabaseError)
    expect(error.statusCode).toBe(500)
  })

  it('handles null/undefined gracefully', () => {
    expect(mapSupabaseError(null)).toBeInstanceOf(DatabaseError)
    expect(mapSupabaseError(undefined)).toBeInstanceOf(DatabaseError)
  })

  it('handles non-object errors', () => {
    expect(mapSupabaseError('error string')).toBeInstanceOf(DatabaseError)
    expect(mapSupabaseError(123)).toBeInstanceOf(DatabaseError)
  })
})

describe('formatErrorResponse', () => {
  it('formats AppError with all fields', () => {
    const error = new ValidationError('Dev message', 'User message')
    const response = formatErrorResponse(error)

    expect(response).toEqual({
      error: 'User message',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
    })
  })

  it('uses error.message if userMessage not set', () => {
    const error = new AppError('Test error', 'TEST_CODE', 400)
    const response = formatErrorResponse(error)

    expect(response.error).toBe('Test error')
  })

  it('formats generic Error', () => {
    const error = new Error('Generic error')
    const response = formatErrorResponse(error)

    expect(response).toEqual({
      error: 'Generic error',
      statusCode: 500,
    })
  })

  it('handles unknown error types', () => {
    const response = formatErrorResponse('string error')

    expect(response).toEqual({
      error: 'An unexpected error occurred',
      statusCode: 500,
    })
  })

  it('handles null/undefined', () => {
    expect(formatErrorResponse(null)).toEqual({
      error: 'An unexpected error occurred',
      statusCode: 500,
    })

    expect(formatErrorResponse(undefined)).toEqual({
      error: 'An unexpected error occurred',
      statusCode: 500,
    })
  })
})
