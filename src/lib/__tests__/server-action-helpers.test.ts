import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'
import {
  withValidation,
  withSimpleValidation,
  withMultiParamValidation,
  withSimpleMultiParamValidation,
} from '../server-action-helpers'
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
  NotFoundError,
  ConflictError,
} from '../errors'

// Mock console.error to avoid noise in test output
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('withValidation', () => {
  const testSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
  })

  it('validates input successfully and calls action', async () => {
    const action = vi.fn().mockResolvedValue({ data: 'success', error: null })
    const wrappedAction = withValidation(testSchema, action)

    const result = await wrappedAction({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test',
    })

    expect(result).toEqual({ data: 'success', error: null })
    expect(action).toHaveBeenCalledWith({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test',
    })
  })

  it('returns validation error for invalid input', async () => {
    const action = vi.fn()
    const wrappedAction = withValidation(testSchema, action)

    const result = await wrappedAction({ id: 'invalid-uuid', name: 'Test' })

    expect(result.data).toBeNull()
    expect(result.error).toContain('Invalid UUID')
    expect(action).not.toHaveBeenCalled()
  })

  it('handles AppError and returns user message', async () => {
    const action = vi.fn().mockRejectedValue(new AuthenticationError())
    const wrappedAction = withValidation(testSchema, action)

    const result = await wrappedAction({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test',
    })

    expect(result.data).toBeNull()
    expect(result.error).toBe('Please log in to continue')
  })

  it('handles custom AppError with custom message', async () => {
    const action = vi.fn().mockRejectedValue(
      new ValidationError('Invalid data format', 'Please check your input')
    )
    const wrappedAction = withValidation(testSchema, action)

    const result = await wrappedAction({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test',
    })

    expect(result.data).toBeNull()
    expect(result.error).toBe('Please check your input')
  })

  it('handles Supabase auth error (PGRST301)', async () => {
    const action = vi.fn().mockRejectedValue({
      code: 'PGRST301',
      message: 'JWT expired',
    })
    const wrappedAction = withValidation(testSchema, action)

    const result = await wrappedAction({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test',
    })

    expect(result.data).toBeNull()
    expect(result.error).toBe('Please log in to continue')
  })

  it('handles Supabase RLS violation', async () => {
    const action = vi.fn().mockRejectedValue({
      message: 'new row violates row level security policy',
    })
    const wrappedAction = withValidation(testSchema, action)

    const result = await wrappedAction({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test',
    })

    expect(result.data).toBeNull()
    expect(result.error).toBe("You don't have permission to access this resource")
  })

  it('handles unique constraint violation (23505)', async () => {
    const action = vi.fn().mockRejectedValue({
      code: '23505',
      message: 'duplicate key value violates unique constraint',
    })
    const wrappedAction = withValidation(testSchema, action)

    const result = await wrappedAction({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test',
    })

    expect(result.data).toBeNull()
    expect(result.error).toBe('This item already exists')
  })

  it('handles foreign key violation (23503)', async () => {
    const action = vi.fn().mockRejectedValue({
      code: '23503',
      message: 'foreign key constraint violation',
    })
    const wrappedAction = withValidation(testSchema, action)

    const result = await wrappedAction({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test',
    })

    expect(result.data).toBeNull()
    expect(result.error).toBe('The referenced item no longer exists')
  })

  it('handles generic Error', async () => {
    const action = vi.fn().mockRejectedValue(new Error('Something went wrong'))
    const wrappedAction = withValidation(testSchema, action)

    const result = await wrappedAction({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test',
    })

    expect(result.data).toBeNull()
    // Generic errors get the message from the Error object
    expect(result.error).toBe('Something went wrong')
  })

  it('handles unknown error types', async () => {
    const action = vi.fn().mockRejectedValue('string error')
    const wrappedAction = withValidation(testSchema, action)

    const result = await wrappedAction({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test',
    })

    expect(result.data).toBeNull()
    expect(result.error).toBe('An unexpected error occurred. Please try again.')
  })
})

describe('withSimpleValidation', () => {
  const testSchema = z.object({ id: z.string().uuid() })

  it('validates successfully and returns error: null', async () => {
    const action = vi.fn().mockResolvedValue({ error: null })
    const wrappedAction = withSimpleValidation(testSchema, action)

    const result = await wrappedAction({
      id: '123e4567-e89b-12d3-a456-426614174000',
    })

    expect(result).toEqual({ error: null })
  })

  it('returns validation error for invalid input', async () => {
    const action = vi.fn()
    const wrappedAction = withSimpleValidation(testSchema, action)

    const result = await wrappedAction({ id: 'invalid' })

    expect(result.error).toContain('Invalid UUID')
    expect(action).not.toHaveBeenCalled()
  })

  it('handles AppError', async () => {
    const action = vi.fn().mockRejectedValue(new AuthorizationError())
    const wrappedAction = withSimpleValidation(testSchema, action)

    const result = await wrappedAction({
      id: '123e4567-e89b-12d3-a456-426614174000',
    })

    expect(result.error).toBe("You don't have permission to access this resource")
  })
})

describe('withMultiParamValidation', () => {
  const testSchema = z.object({
    variantId: z.string().uuid(),
    quantity: z.number().int().nonnegative(),
  })

  it('validates successfully', async () => {
    const action = vi.fn().mockResolvedValue({ data: 'success', error: null })

    const result = await withMultiParamValidation(
      testSchema,
      {
        variantId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 5,
      },
      action
    )

    expect(result).toEqual({ data: 'success', error: null })
  })

  it('returns validation error', async () => {
    const action = vi.fn()

    const result = await withMultiParamValidation(
      testSchema,
      { variantId: 'invalid', quantity: 5 },
      action
    )

    expect(result.data).toBeNull()
    expect(result.error).toContain('Invalid UUID')
    expect(action).not.toHaveBeenCalled()
  })

  it('handles AppError', async () => {
    const action = vi.fn().mockRejectedValue(new NotFoundError())

    const result = await withMultiParamValidation(
      testSchema,
      {
        variantId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 5,
      },
      action
    )

    expect(result.data).toBeNull()
    expect(result.error).toBe('The requested resource was not found')
  })

  it('handles database errors', async () => {
    const action = vi.fn().mockRejectedValue({
      code: '23502',
      message: 'null value in column violates not-null constraint',
    })

    const result = await withMultiParamValidation(
      testSchema,
      {
        variantId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 5,
      },
      action
    )

    expect(result.data).toBeNull()
    expect(result.error).toBe('Please fill in all required fields')
  })
})

describe('withSimpleMultiParamValidation', () => {
  const testSchema = z.object({ setId: z.string().uuid() })

  it('validates successfully', async () => {
    const action = vi.fn().mockResolvedValue({ error: null })

    const result = await withSimpleMultiParamValidation(
      testSchema,
      { setId: '123e4567-e89b-12d3-a456-426614174000' },
      action
    )

    expect(result).toEqual({ error: null })
  })

  it('returns validation error', async () => {
    const action = vi.fn()

    const result = await withSimpleMultiParamValidation(
      testSchema,
      { setId: 'invalid' },
      action
    )

    expect(result.error).toContain('Invalid UUID')
    expect(action).not.toHaveBeenCalled()
  })

  it('handles AppError', async () => {
    const action = vi.fn().mockRejectedValue(new ConflictError())

    const result = await withSimpleMultiParamValidation(
      testSchema,
      { setId: '123e4567-e89b-12d3-a456-426614174000' },
      action
    )

    expect(result.error).toBe('This action conflicts with existing data')
  })
})

describe('error logging', () => {
  it('logs errors to console', async () => {
    const consoleSpy = vi.spyOn(console, 'error')
    const action = vi.fn().mockRejectedValue(new Error('Test error'))
    const wrappedAction = withValidation(z.object({}), action)

    await wrappedAction({})

    expect(consoleSpy).toHaveBeenCalledWith('Server action error:', expect.any(Error))
  })
})
