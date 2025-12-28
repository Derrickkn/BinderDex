import { describe, it, expect } from 'vitest'
import {
  toggleCardOwnedSchema,
  updateCollectionEntrySchema,
  updateTrackerPreferencesSchema,
  getTrackerPreferencesSchema,
  getSetByIdSchema,
  getSetVariantsWithCollectionSchema,
  getSetVariantsSchema,
  untrackPromoSchema,
  restorePromoSchema,
  resetPromoPreferencesSchema,
  getHiddenPromoCountSchema,
  getHiddenPromosSchema,
  getSetProgressSchema,
  bulkMarkCriteriaSchema,
  bulkMarkAsOwnedSchema,
  bulkUnmarkOwnedSchema,
  getUserCollectionForSetSchema,
  getSetRaritiesSchema,
  getSetReverseHoloRaritiesSchema,
  getSetPokeballRaritiesSchema,
  getSetMasterballRaritiesSchema,
} from '../tracker'

// Valid UUID for testing (used for variant IDs and promo IDs)
const validUuid = '123e4567-e89b-12d3-a456-426614174000'
const invalidUuid = 'invalid-uuid'

// Valid set ID for testing (used for set IDs - alphanumeric format like 'sv8', 'sv8pt5', 'me1')
const validSetId = 'sv8pt5'
const invalidSetId = 'invalid-set-id!'

describe('toggleCardOwnedSchema', () => {
  it('accepts valid UUID', () => {
    const result = toggleCardOwnedSchema.safeParse({ variantId: validUuid })
    expect(result.success).toBe(true)
  })

  it('rejects invalid UUID', () => {
    const result = toggleCardOwnedSchema.safeParse({ variantId: invalidUuid })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Invalid UUID')
    }
  })

  it('rejects missing variantId', () => {
    const result = toggleCardOwnedSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('updateCollectionEntrySchema', () => {
  const validData = {
    variantId: validUuid,
    data: {
      quantity: 1,
      condition: 'Near Mint' as const,
      notes: 'Test note',
      acquired_date: '2025-01-01T00:00:00.000Z',
    },
  }

  it('accepts valid collection entry', () => {
    const result = updateCollectionEntrySchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('accepts nullable notes', () => {
    const result = updateCollectionEntrySchema.safeParse({
      ...validData,
      data: { ...validData.data, notes: null },
    })
    expect(result.success).toBe(true)
  })

  it('accepts notes up to 500 characters', () => {
    const result = updateCollectionEntrySchema.safeParse({
      ...validData,
      data: { ...validData.data, notes: 'a'.repeat(500) },
    })
    expect(result.success).toBe(true)
  })

  it('rejects notes over 500 characters', () => {
    const result = updateCollectionEntrySchema.safeParse({
      ...validData,
      data: { ...validData.data, notes: 'a'.repeat(501) },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('500 characters')
    }
  })

  it('rejects negative quantity', () => {
    const result = updateCollectionEntrySchema.safeParse({
      ...validData,
      data: { ...validData.data, quantity: -1 },
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid condition', () => {
    const result = updateCollectionEntrySchema.safeParse({
      ...validData,
      data: { ...validData.data, condition: 'INVALID' },
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid conditions', () => {
    const conditions = ['Mint', 'Near Mint', 'Excellent', 'Good', 'Light Played', 'Played', 'Poor']

    conditions.forEach(condition => {
      const result = updateCollectionEntrySchema.safeParse({
        ...validData,
        data: { ...validData.data, condition },
      })
      expect(result.success).toBe(true)
    })
  })

  it('rejects invalid date format', () => {
    const result = updateCollectionEntrySchema.safeParse({
      ...validData,
      data: { ...validData.data, acquired_date: '01/01/2025' },
    })
    expect(result.success).toBe(false)
  })
})

describe('updateTrackerPreferencesSchema', () => {
  const validPreferences = {
    setId: validSetId,
    preferences: {
      slotConfig: 'NINE' as const,
      includePromos: true,
      includeReverseHolos: false,
      includePokeball: true,
      includeMasterball: false,
    },
  }

  it('accepts valid preferences', () => {
    const result = updateTrackerPreferencesSchema.safeParse(validPreferences)
    expect(result.success).toBe(true)
  })

  it('accepts partial preferences update', () => {
    const result = updateTrackerPreferencesSchema.safeParse({
      setId: validSetId,
      preferences: { slotConfig: 'TWELVE' },
    })
    expect(result.success).toBe(true)
  })

  it('accepts all valid slot configs', () => {
    const configs = ['NINE', 'TWELVE', 'SIXTEEN']

    configs.forEach(slotConfig => {
      const result = updateTrackerPreferencesSchema.safeParse({
        setId: validSetId,
        preferences: { slotConfig },
      })
      expect(result.success).toBe(true)
    })
  })

  it('rejects invalid slot config', () => {
    const result = updateTrackerPreferencesSchema.safeParse({
      setId: validSetId,
      preferences: { slotConfig: 'INVALID' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid setId', () => {
    const result = updateTrackerPreferencesSchema.safeParse({
      setId: invalidSetId,
      preferences: {},
    })
    expect(result.success).toBe(false)
  })
})

describe('bulkMarkCriteriaSchema', () => {
  it('accepts "all" type', () => {
    const result = bulkMarkCriteriaSchema.safeParse({ type: 'all' })
    expect(result.success).toBe(true)
  })

  it('accepts "rarity" type with rarity', () => {
    const result = bulkMarkCriteriaSchema.safeParse({
      type: 'rarity',
      rarity: 'Rare',
    })
    expect(result.success).toBe(true)
  })

  it('rejects "rarity" type without rarity', () => {
    const result = bulkMarkCriteriaSchema.safeParse({ type: 'rarity' })
    expect(result.success).toBe(false)
  })

  it('accepts "variant" type with valid variant', () => {
    const result = bulkMarkCriteriaSchema.safeParse({
      type: 'variant',
      variantType: 'NORMAL',
    })
    expect(result.success).toBe(true)
  })

  it('accepts all valid variant types', () => {
    const variants = ['NORMAL', 'REVERSE_HOLO', 'POKEBALL', 'MASTERBALL']

    variants.forEach(variantType => {
      const result = bulkMarkCriteriaSchema.safeParse({
        type: 'variant',
        variantType,
      })
      expect(result.success).toBe(true)
    })
  })

  it('rejects invalid variant type', () => {
    const result = bulkMarkCriteriaSchema.safeParse({
      type: 'variant',
      variantType: 'INVALID',
    })
    expect(result.success).toBe(false)
  })

  it('accepts "variantWithRarity" type', () => {
    const result = bulkMarkCriteriaSchema.safeParse({
      type: 'variantWithRarity',
      variantType: 'REVERSE_HOLO',
      rarity: 'Rare',
    })
    expect(result.success).toBe(true)
  })

  it('accepts "unowned" type', () => {
    const result = bulkMarkCriteriaSchema.safeParse({ type: 'unowned' })
    expect(result.success).toBe(true)
  })
})

describe('bulkMarkAsOwnedSchema', () => {
  const validBulkMark = {
    setId: validSetId,
    criteria: { type: 'all' as const },
    preferences: {
      slotConfig: 'NINE' as const,
      includePromos: true,
      includeReverseHolos: true,
      includePokeball: true,
      includeMasterball: true,
    },
  }

  it('accepts valid bulk mark request', () => {
    const result = bulkMarkAsOwnedSchema.safeParse(validBulkMark)
    expect(result.success).toBe(true)
  })

  it('rejects missing setId', () => {
    const result = bulkMarkAsOwnedSchema.safeParse({
      criteria: { type: 'all' },
      preferences: validBulkMark.preferences,
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing preferences', () => {
    const result = bulkMarkAsOwnedSchema.safeParse({
      setId: validSetId,
      criteria: { type: 'all' },
    })
    expect(result.success).toBe(false)
  })
})

describe('Set ID validation schemas', () => {
  const schemasToTest = [
    { name: 'getTrackerPreferences', schema: getTrackerPreferencesSchema, field: 'setId' },
    { name: 'getSetById', schema: getSetByIdSchema, field: 'setId' },
    { name: 'resetPromoPreferences', schema: resetPromoPreferencesSchema, field: 'setId' },
    { name: 'getHiddenPromoCount', schema: getHiddenPromoCountSchema, field: 'setId' },
    { name: 'getHiddenPromos', schema: getHiddenPromosSchema, field: 'setId' },
    { name: 'getUserCollectionForSet', schema: getUserCollectionForSetSchema, field: 'setId' },
    { name: 'getSetRarities', schema: getSetRaritiesSchema, field: 'setId' },
    { name: 'getSetReverseHoloRarities', schema: getSetReverseHoloRaritiesSchema, field: 'setId' },
    { name: 'getSetPokeballRarities', schema: getSetPokeballRaritiesSchema, field: 'setId' },
    { name: 'getSetMasterballRarities', schema: getSetMasterballRaritiesSchema, field: 'setId' },
  ]

  schemasToTest.forEach(({ name, schema, field }) => {
    describe(name, () => {
      it('accepts valid set ID', () => {
        const result = schema.safeParse({ [field]: validSetId })
        expect(result.success).toBe(true)
      })

      it('rejects invalid set ID', () => {
        const result = schema.safeParse({ [field]: invalidSetId })
        expect(result.success).toBe(false)
      })
    })
  })
})

describe('untrackPromo and restorePromo schemas', () => {
  const validData = {
    promoId: validUuid,
    setId: validSetId,
  }

  it('untrackPromo accepts valid data', () => {
    const result = untrackPromoSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('restorePromo accepts valid data', () => {
    const result = restorePromoSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects invalid promoId', () => {
    const result = untrackPromoSchema.safeParse({
      ...validData,
      promoId: invalidUuid,
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid setId', () => {
    const result = untrackPromoSchema.safeParse({
      ...validData,
      setId: invalidSetId,
    })
    expect(result.success).toBe(false)
  })
})

describe('getSetVariants schemas', () => {
  const validPreferences = {
    slotConfig: 'NINE' as const,
    includePromos: true,
    includeReverseHolos: true,
    includePokeball: true,
    includeMasterball: true,
  }

  it('getSetVariantsWithCollection accepts valid data', () => {
    const result = getSetVariantsWithCollectionSchema.safeParse({
      setId: validSetId,
      preferences: validPreferences,
    })
    expect(result.success).toBe(true)
  })

  it('getSetVariants accepts valid data', () => {
    const result = getSetVariantsSchema.safeParse({
      setId: validSetId,
      preferences: validPreferences,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing preferences', () => {
    const result = getSetVariantsSchema.safeParse({ setId: validSetId })
    expect(result.success).toBe(false)
  })
})

describe('getSetProgress schema', () => {
  it('accepts valid data', () => {
    const result = getSetProgressSchema.safeParse({
      setId: validSetId,
      preferences: {
        slotConfig: 'NINE',
        includePromos: true,
        includeReverseHolos: true,
        includePokeball: true,
        includeMasterball: true,
      },
    })
    expect(result.success).toBe(true)
  })
})

describe('setIdSchema - valid set ID formats', () => {
  // Test various real set ID formats from Pokemon TCG
  const validSetIds = [
    'sv8',       // Simple alphanumeric
    'sv8pt5',    // With pt suffix (Prismatic Evolutions)
    'me1',       // Mega Evolution set 1
    'me2',       // Mega Evolution set 2
    'zsv10pt5',  // Black Bolt (prefixed)
    'rsv10pt5',  // White Flare (prefixed)
    'sv4pt5',    // Paldean Fates
    'sv5',       // Temporal Forces
  ]

  validSetIds.forEach((setId) => {
    it(`accepts set ID: ${setId}`, () => {
      const result = getSetByIdSchema.safeParse({ setId })
      expect(result.success).toBe(true)
    })
  })

  // Test invalid set ID formats
  const invalidSetIds = [
    '',                  // Empty string
    'set with spaces',   // Contains spaces
    'set-with-dashes',   // Contains dashes
    'SET_UNDERSCORE',    // Contains underscore
    'set!special',       // Contains special characters
    'a'.repeat(25),      // Too long
  ]

  invalidSetIds.forEach((setId) => {
    it(`rejects invalid set ID: "${setId}"`, () => {
      const result = getSetByIdSchema.safeParse({ setId })
      expect(result.success).toBe(false)
    })
  })
})
