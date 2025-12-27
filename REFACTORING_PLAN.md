# BinderDex Refactoring Plan
*Severity-Ordered Roadmap*

**Status**: In Progress
**Created**: December 28, 2025
**Last Updated**: December 28, 2025
**Estimated Total Effort**: 6-8 weeks

## 📊 Overall Progress

| Phase | Status | Tests | Coverage | Notes |
|-------|--------|-------|----------|-------|
| **Phase 1.1**: Test Foundation | ✅ COMPLETE | - | - | Vitest, utilities, mocks ready |
| **Phase 1.2**: Unit Tests | ✅ COMPLETE | 90 tests | 78-97% hooks, 96%+ utils | Server actions & RLS skipped |
| **Phase 1.3**: Component Tests | ✅ COMPLETE | 70 tests | 96.91% components | CardSlot & BinderView tested |
| **Phase 1.4**: E2E Tests | ⏸️ NEXT | - | - | Critical user flows |
| **Phase 2**: Input Validation | ⏸️ PENDING | - | - | Zod schemas needed |
| **Phase 3**: File Splitting | ⏸️ PENDING | - | - | Split actions.ts |
| **Phase 4**: Error Handling | ⏸️ PENDING | - | - | Standard error patterns |

**Current Focus**: Phase 1.4 - E2E Tests (Optional, can proceed to Phase 2)

---

## 🔴 CRITICAL SEVERITY

### 1. Testing Infrastructure Gap
**Risk**: Production bugs, regression issues, optimistic update failures undetected
**Effort**: 2-3 weeks
**Priority**: HIGHEST

#### Phase 1.1: Setup Testing Foundation ✅ COMPLETE

**Step 1: Install Dependencies**
```bash
npm install --save-dev \
  vitest \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom \
  @vitest/ui \
  happy-dom \
  msw@latest
```

**Step 2: Configure Vitest**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 3: Create Test Setup**

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Supabase environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
```

**Step 4: Update package.json scripts**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

**Step 5: Create Test Utilities**

Create `src/test/utils.tsx`:
```typescript
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactElement } from 'react'

// Create a custom render that includes providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient }
}

export * from '@testing-library/react'
export { renderWithProviders as render }
```

Create `src/test/mockData/trackerMocks.ts`:
```typescript
import { TrackerCard, TrackerPreferences } from '@/lib/types/tracker'

export const mockTrackerCard: TrackerCard = {
  id: 'me1-1',
  set_id: 'me1',
  name: 'Charizard',
  number: '1',
  rarity: 'Rare Holo',
  supertype: 'Pokémon',
  subtypes: ['Stage 2'],
  types: ['Fire'],
  hp: 150,
  artist: 'Test Artist',
  national_dex_numbers: [6],
  image_small: 'https://example.com/small.png',
  image_large: 'https://example.com/large.png',
  is_promo: false,
  is_premium: false,
  is_legendary: false,
  is_mythical: false,
  generation: 1,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  variant_id: 'variant-1',
  variant_type: 'NORMAL',
  variant_image_url: null,
  owned: false,
  quantity: 0,
  condition: null,
  notes: null,
  acquired_date: null,
  collection_id: null,
  promo_id: null,
  promo_number: null,
  promo_product_source: null,
  is_promo_untracked: false,
  is_pokemon_center_exclusive: null,
}

export const mockTrackerPreferences: TrackerPreferences = {
  slotConfig: 'NINE',
  includePromos: true,
  includeReverseHolos: true,
  includePokeball: true,
  includeMasterball: true,
}

export const mockTrackerCards = (count: number): TrackerCard[] => {
  return Array.from({ length: count }, (_, i) => ({
    ...mockTrackerCard,
    id: `me1-${i + 1}`,
    name: `Card ${i + 1}`,
    number: String(i + 1),
    variant_id: `variant-${i + 1}`,
  }))
}
```

**Deliverable**: ✅ Working test infrastructure, can run `npm test`

**✅ COMPLETED**: December 28, 2025
- Vitest configured with v8 coverage provider
- Test utilities created (`src/test/utils.tsx`, `src/test/mockData/trackerMocks.ts`)
- Mock data factories available for all tracker types
- CI/CD integration verified in GitHub Actions

---

#### Phase 1.2: Critical Unit Tests ✅ COMPLETE

**Priority Order**:
1. Tracker utilities (pagination, filtering) - Pure functions, easy to test
2. Optimistic update logic - Critical for UX
3. Server actions - Core business logic
4. RLS policies - Security critical

**Step 1: Test Tracker Utilities** (1 day)

Create `src/lib/tracker/__tests__/utils.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import {
  calculateTotalPages,
  getCardsForPage,
  paginateCards,
  calculateProgress,
  sortCardsByNumber,
  getMissingCards,
} from '../utils'
import { mockTrackerCards } from '@/test/mockData/trackerMocks'

describe('Tracker Utils', () => {
  describe('calculateTotalPages', () => {
    it('calculates correct pages for 9-slot config', () => {
      expect(calculateTotalPages(27, 'NINE')).toBe(3)
      expect(calculateTotalPages(28, 'NINE')).toBe(4)
    })

    it('calculates correct pages for 12-slot config', () => {
      expect(calculateTotalPages(36, 'TWELVE')).toBe(3)
      expect(calculateTotalPages(37, 'TWELVE')).toBe(4)
    })

    it('calculates correct pages for 16-slot config', () => {
      expect(calculateTotalPages(48, 'SIXTEEN')).toBe(3)
      expect(calculateTotalPages(49, 'SIXTEEN')).toBe(4)
    })

    it('returns 0 for empty card list', () => {
      expect(calculateTotalPages(0, 'NINE')).toBe(0)
    })
  })

  describe('getCardsForPage', () => {
    const cards = mockTrackerCards(27)

    it('returns correct cards for page 0', () => {
      const result = getCardsForPage(cards, 0, 'NINE')
      expect(result).toHaveLength(9)
      expect(result[0].number).toBe('1')
      expect(result[8].number).toBe('9')
    })

    it('returns correct cards for page 1', () => {
      const result = getCardsForPage(cards, 1, 'NINE')
      expect(result).toHaveLength(9)
      expect(result[0].number).toBe('10')
      expect(result[8].number).toBe('18')
    })

    it('handles partial last page', () => {
      const result = getCardsForPage(cards, 2, 'NINE')
      expect(result).toHaveLength(9)
      expect(result[0].number).toBe('19')
      expect(result[8].number).toBe('27')
    })
  })

  describe('calculateProgress', () => {
    it('calculates 0% for no owned cards', () => {
      const cards = mockTrackerCards(10)
      const result = calculateProgress(cards)
      expect(result).toEqual({
        totalCards: 10,
        ownedCards: 0,
        percentage: 0,
      })
    })

    it('calculates 50% for half owned', () => {
      const cards = mockTrackerCards(10).map((card, i) => ({
        ...card,
        owned: i < 5,
      }))
      const result = calculateProgress(cards)
      expect(result).toEqual({
        totalCards: 10,
        ownedCards: 5,
        percentage: 50,
      })
    })

    it('calculates 100% for all owned', () => {
      const cards = mockTrackerCards(10).map(card => ({
        ...card,
        owned: true,
      }))
      const result = calculateProgress(cards)
      expect(result).toEqual({
        totalCards: 10,
        ownedCards: 10,
        percentage: 100,
      })
    })

    it('handles empty array', () => {
      const result = calculateProgress([])
      expect(result).toEqual({
        totalCards: 0,
        ownedCards: 0,
        percentage: 0,
      })
    })
  })

  describe('sortCardsByNumber', () => {
    it('sorts numeric card numbers correctly', () => {
      const cards = [
        { ...mockTrackerCards(1)[0], number: '10' },
        { ...mockTrackerCards(1)[0], number: '2' },
        { ...mockTrackerCards(1)[0], number: '1' },
      ]
      const result = sortCardsByNumber(cards)
      expect(result[0].number).toBe('1')
      expect(result[1].number).toBe('2')
      expect(result[2].number).toBe('10')
    })

    it('handles mixed numeric and alphanumeric numbers', () => {
      const cards = [
        { ...mockTrackerCards(1)[0], number: '10' },
        { ...mockTrackerCards(1)[0], number: 'SV1' },
        { ...mockTrackerCards(1)[0], number: '2' },
      ]
      const result = sortCardsByNumber(cards)
      expect(result[0].number).toBe('2')
      expect(result[1].number).toBe('10')
      expect(result[2].number).toBe('SV1')
    })
  })

  describe('getMissingCards', () => {
    it('returns only cards with owned=false', () => {
      const cards = mockTrackerCards(10).map((card, i) => ({
        ...card,
        owned: i < 5,
      }))
      const result = getMissingCards(cards)
      expect(result).toHaveLength(5)
      expect(result.every(card => !card.owned)).toBe(true)
    })

    it('returns empty array if all owned', () => {
      const cards = mockTrackerCards(10).map(card => ({
        ...card,
        owned: true,
      }))
      const result = getMissingCards(cards)
      expect(result).toHaveLength(0)
    })
  })
})
```

**Step 2: Test Optimistic Update Logic** (2 days)

Create `src/hooks/tracker/__tests__/useToggleOwned.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useToggleOwned } from '../useCollection'
import { mockTrackerCard } from '@/test/mockData/trackerMocks'

// Mock the server action
vi.mock('@/lib/tracker/actions', () => ({
  toggleCardOwned: vi.fn(),
}))

import { toggleCardOwned } from '@/lib/tracker/actions'

describe('useToggleOwned', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('optimistically updates card to owned', async () => {
    // Setup: Card initially not owned
    const card = { ...mockTrackerCard, owned: false, quantity: 0 }
    queryClient.setQueryData(['variants', 'me1'], [card])

    vi.mocked(toggleCardOwned).mockResolvedValue({
      owned: true,
      quantity: 1,
    })

    const { result } = renderHook(
      () => useToggleOwned('me1', { slotConfig: 'NINE', includePromos: true, includeReverseHolos: true, includePokeball: true, includeMasterball: true }),
      { wrapper }
    )

    // Act: Toggle card
    result.current.mutate(card.variant_id)

    // Assert: Immediate optimistic update
    const cachedCards = queryClient.getQueryData<typeof card[]>(['variants', 'me1'])
    expect(cachedCards?.[0].owned).toBe(true)
    expect(cachedCards?.[0].quantity).toBe(1)

    // Assert: Server action called
    await waitFor(() => {
      expect(toggleCardOwned).toHaveBeenCalledWith(card.variant_id)
    })
  })

  it('rolls back on server error', async () => {
    const card = { ...mockTrackerCard, owned: false, quantity: 0 }
    queryClient.setQueryData(['variants', 'me1'], [card])

    vi.mocked(toggleCardOwned).mockRejectedValue(new Error('Server error'))

    const { result } = renderHook(
      () => useToggleOwned('me1', { slotConfig: 'NINE', includePromos: true, includeReverseHolos: true, includePokeball: true, includeMasterball: true }),
      { wrapper }
    )

    result.current.mutate(card.variant_id)

    // Wait for error and rollback
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    // Assert: Rolled back to original state
    const cachedCards = queryClient.getQueryData<typeof card[]>(['variants', 'me1'])
    expect(cachedCards?.[0].owned).toBe(false)
    expect(cachedCards?.[0].quantity).toBe(0)
  })

  it('toggles owned to not owned', async () => {
    const card = { ...mockTrackerCard, owned: true, quantity: 1 }
    queryClient.setQueryData(['variants', 'me1'], [card])

    vi.mocked(toggleCardOwned).mockResolvedValue({
      owned: false,
      quantity: 0,
    })

    const { result } = renderHook(
      () => useToggleOwned('me1', { slotConfig: 'NINE', includePromos: true, includeReverseHolos: true, includePokeball: true, includeMasterball: true }),
      { wrapper }
    )

    result.current.mutate(card.variant_id)

    // Assert: Optimistically toggled off
    const cachedCards = queryClient.getQueryData<typeof card[]>(['variants', 'me1'])
    expect(cachedCards?.[0].owned).toBe(false)
    expect(cachedCards?.[0].quantity).toBe(0)
  })
})
```

**Step 3: Test Server Actions** (2 days)

Create `src/lib/tracker/__tests__/actions.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateProgress } from '../utils'

// Note: Testing server actions that use Supabase requires mocking
// We'll test the business logic portions

describe('Tracker Actions - Business Logic', () => {
  describe('Progress Calculation', () => {
    it('correctly calculates progress with filters', () => {
      const cards = [
        { owned: true, is_promo: false, variant_type: 'NORMAL' },
        { owned: true, is_promo: true, variant_type: 'NORMAL' },
        { owned: false, is_promo: false, variant_type: 'NORMAL' },
        { owned: false, is_promo: false, variant_type: 'REVERSE_HOLO' },
      ]

      // Without promos, should be 1/2 = 50%
      const withoutPromos = cards.filter(c => !c.is_promo)
      const progress = calculateProgress(withoutPromos)
      expect(progress.percentage).toBe(33) // 1/3 owned
    })
  })
})
```

**Step 4: Test RLS Policies** (1-2 days)

Create `src/test/database/rls.test.ts`:
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// This requires a test Supabase project or local Supabase instance
// Skip in CI if not available
const supabaseUrl = process.env.TEST_SUPABASE_URL || ''
const supabaseKey = process.env.TEST_SUPABASE_ANON_KEY || ''

const shouldRunRLSTests = supabaseUrl && supabaseKey

describe.skipIf(!shouldRunRLSTests)('RLS Policies', () => {
  let supabase: ReturnType<typeof createClient>
  let testUserId: string

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseKey)

    // Create test user
    const { data } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123',
    })
    testUserId = data.user?.id || ''
  })

  afterAll(async () => {
    // Cleanup
    await supabase.auth.signOut()
  })

  it('user can only read their own collections', async () => {
    // Try to query user_collections - should only return user's data
    const { data, error } = await supabase
      .from('user_collections')
      .select('*')

    expect(error).toBeNull()
    // All returned rows should have the current user_id
    expect(data?.every(row => row.user_id === testUserId)).toBe(true)
  })

  it('user cannot insert collection for another user', async () => {
    const fakeUserId = '00000000-0000-0000-0000-000000000000'

    const { error } = await supabase
      .from('user_collections')
      .insert({
        user_id: fakeUserId, // Different user
        variant_id: 'test-variant',
        quantity: 1,
      })

    // Should fail RLS check
    expect(error).not.toBeNull()
    expect(error?.message).toContain('policy')
  })

  it('public tables are readable by authenticated users', async () => {
    const { data, error } = await supabase
      .from('sets')
      .select('*')
      .limit(1)

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data?.length).toBeGreaterThan(0)
  })
})
```

**Deliverable**: ✅ 80%+ test coverage for critical paths

**✅ COMPLETED**: December 28, 2025
- **68 utility tests** (`src/lib/tracker/__tests__/utils.test.ts`) - 96%+ statement coverage
  - Pagination: calculateTotalPages, getCardsForPage, paginateCards, getPageForCard, getViewForCard
  - Filtering: getMissingCards, filterCardsByPreferences
  - Progress: calculateProgress
  - Sorting: sortCardsByNumber (complex alphanumeric logic)
  - Grid: getGridColsClass, getGridRows
  - Formatting: formatVariantType, formatCondition, formatDate

- **15 useCollection tests** (`src/hooks/tracker/__tests__/useCollection.test.tsx`) - 78.57% statement coverage
  - Optimistic toggle owned (card → owned, owned → card)
  - Optimistic quantity updates
  - Optimistic condition updates
  - Optimistic promo hiding/restoring
  - Error rollback verification
  - Dual-list update patterns

- **7 useTrackerPreferences tests** (`src/hooks/tracker/__tests__/useTrackerPreferences.test.tsx`) - 96.77% statement coverage
  - Slot config changes with Zustand sync
  - Toggle preferences (promos, reverse holos, Pokeball, Masterball)
  - Error rollback with refetch

**Total**: 90 tests passing, all merged to `develop` branch

**Skipped** (deferred to later phases):
- Server action business logic tests (Phase 1.2 Step 3)
- RLS policy tests (Phase 1.2 Step 4) - requires test Supabase instance

**Key Learnings**:
- React Query mutations need `act()` wrapper for optimistic updates
- Mock responses need 50ms delay to properly test optimistic state
- `gcTime: Infinity` prevents premature query data garbage collection in tests

---

#### Phase 1.3: Component Integration Tests ✅ COMPLETE (3-4 days)

**Step 1: Test CardSlot Component**

Create `src/components/tracker/__tests__/CardSlot.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { CardSlot } from '../CardSlot'
import { mockTrackerCard } from '@/test/mockData/trackerMocks'

describe('CardSlot', () => {
  it('renders card image when owned', () => {
    const card = { ...mockTrackerCard, owned: true }
    render(
      <CardSlot
        card={card}
        onToggleCard={vi.fn()}
        onOpenModal={vi.fn()}
      />
    )

    const img = screen.getByAltText(card.name)
    expect(img).toBeInTheDocument()
    expect(img).not.toHaveClass('grayscale')
  })

  it('renders greyscale placeholder when not owned', () => {
    const card = { ...mockTrackerCard, owned: false }
    render(
      <CardSlot
        card={card}
        onToggleCard={vi.fn()}
        onOpenModal={vi.fn()}
      />
    )

    const img = screen.getByAltText(card.name)
    expect(img).toBeInTheDocument()
    expect(img).toHaveClass('grayscale')
  })

  it('calls onToggleCard on click', async () => {
    const onToggle = vi.fn()
    const card = mockTrackerCard

    render(
      <CardSlot
        card={card}
        onToggleCard={onToggle}
        onOpenModal={vi.fn()}
      />
    )

    const slot = screen.getByRole('button')
    fireEvent.click(slot)

    // Debounced, wait for it
    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith(card.variant_id)
    }, { timeout: 200 })
  })

  it('calls onOpenModal on right-click', () => {
    const onOpenModal = vi.fn()
    const card = mockTrackerCard

    render(
      <CardSlot
        card={card}
        onToggleCard={vi.fn()}
        onOpenModal={onOpenModal}
      />
    )

    const slot = screen.getByRole('button')
    fireEvent.contextMenu(slot)

    expect(onOpenModal).toHaveBeenCalledWith(card.variant_id)
  })

  it('shows variant badge for reverse holo', () => {
    const card = { ...mockTrackerCard, variant_type: 'REVERSE_HOLO' }
    render(
      <CardSlot
        card={card}
        onToggleCard={vi.fn()}
        onOpenModal={vi.fn()}
      />
    )

    expect(screen.getByText('RH')).toBeInTheDocument()
  })

  it('shows quantity badge when quantity > 1', () => {
    const card = { ...mockTrackerCard, owned: true, quantity: 3 }
    render(
      <CardSlot
        card={card}
        onToggleCard={vi.fn()}
        onOpenModal={vi.fn()}
      />
    )

    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
```

**Step 2: Test BinderView Pagination**

Create `src/components/tracker/__tests__/BinderView.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import { BinderView } from '../BinderView'
import { mockTrackerCards } from '@/test/mockData/trackerMocks'

describe('BinderView', () => {
  it('renders 9 cards per page in NINE config', () => {
    const cards = mockTrackerCards(27)
    render(
      <BinderView
        cards={cards}
        slotConfig="NINE"
        onToggleCard={vi.fn()}
        onOpenModal={vi.fn()}
      />
    )

    // Should show first 9 cards
    expect(screen.getByText('Card 1')).toBeInTheDocument()
    expect(screen.getByText('Card 9')).toBeInTheDocument()
    expect(screen.queryByText('Card 10')).not.toBeInTheDocument()
  })

  it('shows page navigation controls', () => {
    const cards = mockTrackerCards(27)
    render(
      <BinderView
        cards={cards}
        slotConfig="NINE"
        onToggleCard={vi.fn()}
        onOpenModal={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument()
  })

  it('navigates to next page', async () => {
    const cards = mockTrackerCards(27)
    const { user } = render(
      <BinderView
        cards={cards}
        slotConfig="NINE"
        onToggleCard={vi.fn()}
        onOpenModal={vi.fn()}
      />
    )

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    // Should show cards 10-18
    expect(screen.getByText('Card 10')).toBeInTheDocument()
    expect(screen.queryByText('Card 1')).not.toBeInTheDocument()
  })
})
```

**Deliverable**: ✅ Integration tests for all tracker components

**✅ COMPLETED**: December 28, 2025
- **35 CardSlot tests** (`src/components/tracker/__tests__/CardSlot.test.tsx`) - 100% statement coverage, 97.56% branch coverage
  - Basic rendering: owned/missing visual states, attributes, images
  - Interaction tests: click, long-press, right-click, debouncing, pointer events
  - Badge display: quantity, variant types (RH/PB/MB/1E/SH/UL), Pokemon Center badge
  - Visual states: highlighting, loading skeleton, hover overlays

- **35 BinderView tests** (`src/components/tracker/__tests__/BinderView.test.tsx`) - 98% statement coverage, 88.15% branch coverage
  - Basic rendering: desktop/mobile layouts, empty/loading states
  - Pagination logic: slot configs (NINE/TWELVE/SIXTEEN), card distribution
  - Navigation: buttons, keyboard arrows, callbacks, cleanup
  - Mobile gestures: swipe, pinch zoom, double-tap, boundaries
  - Advanced features: image preloading, responsive detection, highlighting

**Total**: 70 component tests passing, all merged to `code-cleanup` branch
**Combined**: 160 total tests (90 Phase 1.1-1.2 + 70 Phase 1.3)

**Coverage Achieved**:
- CardSlot: 100% statements, 97.56% branches, 100% functions ✅
- BinderView: 98% statements, 88.15% branches, 85% functions ✅
- Overall components: 96.91% statement coverage (far exceeds 50% target)

**Key Learnings**:
- Fake timers required for debounce/long-press testing
- Dual-rendering (desktop + mobile) requires scoped queries with `getAllByTitle`
- Zustand store mocking needs per-test custom return values
- Touch event simulation requires synthetic event objects with coordinates

---

#### Phase 1.4: E2E Critical User Flows ⏸️ PENDING (2-3 days)

**Setup Playwright** (or Cypress):
```bash
npm install --save-dev @playwright/test
npx playwright install
```

Create `e2e/tracker.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Master Set Tracker', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/tracker')
  })

  test('user can toggle card ownership', async ({ page }) => {
    // Navigate to a set
    await page.click('text=Mega Evolution')
    await page.waitForURL('/tracker/me1')

    // Click a card to mark as owned
    const card = page.locator('[data-testid="card-slot"]').first()
    await card.click()

    // Wait for optimistic update
    await expect(card).not.toHaveClass(/grayscale/)

    // Verify it persists after reload
    await page.reload()
    await expect(card).not.toHaveClass(/grayscale/)
  })

  test('user can change slot configuration', async ({ page }) => {
    await page.goto('/tracker/me1')

    // Click settings
    await page.click('[data-testid="settings-button"]')

    // Change to 12-slot
    await page.click('text=12 slots')

    // Verify grid layout changed
    const grid = page.locator('[data-testid="binder-page"]')
    await expect(grid).toHaveClass(/grid-cols-4/)
  })

  test('missing cards list navigation works', async ({ page }) => {
    await page.goto('/tracker/me1')

    // Open missing cards
    await page.click('text=Missing Cards')

    // Click a missing card
    await page.click('[data-testid="missing-card"]').first()

    // Should navigate to that card's page and highlight it
    await expect(page.locator('.ring-amber-500')).toBeVisible()
  })
})
```

**Deliverable**: ✅ E2E tests for critical user flows

---

#### Success Criteria for Testing Infrastructure:
- [x] Vitest configured and running ✅
- [x] Test coverage ≥ 80% for utilities ✅ (96%+)
- [x] Test coverage ≥ 60% for hooks ✅ (78% useCollection, 97% useTrackerPreferences)
- [x] Test coverage ≥ 50% for components ✅ (96.91% - CardSlot 100%, BinderView 98%)
- [ ] RLS policies verified (⏸️ DEFERRED - requires test Supabase instance)
- [ ] E2E tests pass for critical flows (⏸️ PENDING - Phase 1.4, optional)
- [x] CI/CD runs tests on every PR ✅ (GitHub Actions configured)

---

### 2. Input Validation Layer Missing
**Risk**: Invalid data reaching database, security vulnerabilities, runtime errors
**Effort**: 1 week
**Priority**: CRITICAL

#### Phase 2.1: Setup Validation Framework (1 day)

**Step 1: Install Zod**
```bash
npm install zod
```

**Step 2: Create Validation Schemas**

Create `src/lib/validation/tracker.ts`:
```typescript
import { z } from 'zod'

// Enums
export const SlotConfigSchema = z.enum(['NINE', 'TWELVE', 'SIXTEEN'])
export const VariantTypeSchema = z.enum([
  'NORMAL',
  'REVERSE_HOLO',
  'FIRST_EDITION',
  'SHADOWLESS',
  'UNLIMITED',
  'POKEBALL',
  'MASTERBALL',
])
export const ConditionSchema = z.enum([
  'MINT',
  'NEAR_MINT',
  'EXCELLENT',
  'GOOD',
  'LIGHT_PLAYED',
  'PLAYED',
  'POOR',
])

// Server action input schemas
export const ToggleOwnedSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID'),
})

export const UpdateCollectionSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID'),
  quantity: z.number().int().min(0).max(99).optional(),
  condition: ConditionSchema.optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
  acquiredDate: z.string().datetime().optional(),
})

export const UpdatePreferencesSchema = z.object({
  setId: z.string().min(1, 'Set ID required'),
  slotConfig: SlotConfigSchema,
  includePromos: z.boolean(),
  includeReverseHolos: z.boolean(),
  includePokeball: z.boolean(),
  includeMasterball: z.boolean(),
})

export const BulkMarkSchema = z.object({
  setId: z.string().min(1),
  rarity: z.string().min(1).optional(),
  variantType: VariantTypeSchema.optional(),
}).refine(
  data => data.rarity || data.variantType,
  { message: 'Either rarity or variantType must be provided' }
)

// Type exports
export type UpdateCollectionInput = z.infer<typeof UpdateCollectionSchema>
export type UpdatePreferencesInput = z.infer<typeof UpdatePreferencesSchema>
export type BulkMarkInput = z.infer<typeof BulkMarkSchema>
```

Create `src/lib/validation/common.ts`:
```typescript
import { z } from 'zod'

// Common validation utilities
export const UUIDSchema = z.string().uuid()
export const EmailSchema = z.string().email()
export const URLSchema = z.string().url()

// Pagination
export const PaginationSchema = z.object({
  page: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(20),
})

// Search
export const SearchSchema = z.object({
  query: z.string().min(1).max(100),
  filters: z.record(z.string(), z.any()).optional(),
})

// Error formatting helper
export function formatZodError(error: z.ZodError): string {
  return error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
}
```

---

#### Phase 2.2: Integrate Validation into Server Actions (3-4 days)

**Step 1: Create Validation Wrapper**

Create `src/lib/server-action-helpers.ts`:
```typescript
import { z } from 'zod'
import { formatZodError } from './validation/common'

type ServerActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export function withValidation<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (input: TInput) => Promise<TOutput>
) {
  return async (input: unknown): Promise<ServerActionResult<TOutput>> => {
    try {
      // Validate input
      const validated = schema.parse(input)

      // Execute handler
      const result = await handler(validated)

      return { success: true, data: result }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: formatZodError(error),
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
```

**Step 2: Refactor Server Actions**

Update `src/lib/tracker/actions.ts`:
```typescript
'use server'

import { withValidation } from '@/lib/server-action-helpers'
import {
  ToggleOwnedSchema,
  UpdateCollectionSchema,
  UpdatePreferencesSchema,
  BulkMarkSchema,
} from '@/lib/validation/tracker'

// Before: No validation
export async function toggleCardOwned(variantId: string) {
  // Direct use of variantId - could be invalid!
  const { data, error } = await supabase
    .from('user_collections')
    .update({ quantity: 1 })
    .eq('variant_id', variantId)
  // ...
}

// After: With validation
export const toggleCardOwned = withValidation(
  ToggleOwnedSchema,
  async ({ variantId }) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    // Now we know variantId is a valid UUID
    const { data, error } = await supabase
      .from('user_collections')
      .update({ quantity: 1 })
      .eq('variant_id', variantId)
      .eq('user_id', user.id)

    if (error) throw error
    return { owned: true, quantity: 1 }
  }
)

export const updateCollectionEntry = withValidation(
  UpdateCollectionSchema,
  async (input) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const { variantId, ...updateData } = input

    const { data, error } = await supabase
      .from('user_collections')
      .update({
        quantity: updateData.quantity,
        condition: updateData.condition,
        notes: updateData.notes,
        acquired_date: updateData.acquiredDate,
      })
      .eq('variant_id', variantId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }
)

export const updateTrackerPreferences = withValidation(
  UpdatePreferencesSchema,
  async (input) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const { setId, ...preferences } = input

    const { data, error } = await supabase
      .from('master_set_preferences')
      .upsert({
        user_id: user.id,
        set_id: setId,
        ...preferences,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
)
```

**Step 3: Update Client-Side Calls**

Update hooks to handle validation errors:
```typescript
// src/hooks/tracker/useCollection.ts
export function useToggleOwned(setId: string, preferences: TrackerPreferences) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variantId: string) => {
      const result = await toggleCardOwned({ variantId })

      if (!result.success) {
        throw new Error(result.error)
      }

      return result.data
    },
    onMutate: async (variantId) => {
      // ... optimistic update logic
    },
    onError: (error, variantId, context) => {
      // Show user-friendly error
      toast.error(error.message)

      // Rollback
      if (context?.previousCards) {
        queryClient.setQueryData(queryKey, context.previousCards)
      }
    },
  })
}
```

**Deliverable**: ✅ All server actions validated with Zod

---

#### Phase 2.3: Add Form Validation (2 days)

**Step 1: Install React Hook Form**
```bash
npm install react-hook-form @hookform/resolvers
```

**Step 2: Create Form Component**

Create `src/components/tracker/EditCollectionForm.tsx`:
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UpdateCollectionSchema, type UpdateCollectionInput } from '@/lib/validation/tracker'

export function EditCollectionForm({
  variantId,
  initialData,
  onSubmit,
}: {
  variantId: string
  initialData?: Partial<UpdateCollectionInput>
  onSubmit: (data: UpdateCollectionInput) => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCollectionInput>({
    resolver: zodResolver(UpdateCollectionSchema),
    defaultValues: {
      variantId,
      ...initialData,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="quantity">Quantity</label>
        <input
          id="quantity"
          type="number"
          {...register('quantity', { valueAsNumber: true })}
          className="input"
        />
        {errors.quantity && (
          <p className="text-red-500 text-sm">{errors.quantity.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="condition">Condition</label>
        <select id="condition" {...register('condition')} className="select">
          <option value="">Select condition</option>
          <option value="MINT">Mint</option>
          <option value="NEAR_MINT">Near Mint</option>
          <option value="EXCELLENT">Excellent</option>
          <option value="GOOD">Good</option>
          <option value="LIGHT_PLAYED">Light Played</option>
          <option value="PLAYED">Played</option>
          <option value="POOR">Poor</option>
        </select>
        {errors.condition && (
          <p className="text-red-500 text-sm">{errors.condition.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          {...register('notes')}
          className="textarea"
          maxLength={500}
        />
        {errors.notes && (
          <p className="text-red-500 text-sm">{errors.notes.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary"
      >
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

**Deliverable**: ✅ Client-side + server-side validation in place

---

#### Success Criteria for Validation:
- [ ] Zod schemas for all server actions
- [ ] withValidation wrapper in use
- [ ] Form validation with react-hook-form
- [ ] User-friendly error messages
- [ ] Validation tests at 90%+ coverage

---

### 3. Large Monolithic Files
**Risk**: Maintainability issues, merge conflicts, difficult testing
**Effort**: 1 week
**Priority**: HIGH

#### Phase 3.1: Split tracker/actions.ts (3-4 days)

**Current State**: 1,546 lines, 30+ functions in one file

**Target Structure**:
```
src/lib/tracker/
  ├─ queries/
  │   ├─ sets.ts           // Set-related queries
  │   ├─ variants.ts       // Variant queries
  │   ├─ collection.ts     // Collection queries
  │   ├─ preferences.ts    // Preference queries
  │   └─ promos.ts         // Promo queries
  ├─ mutations/
  │   ├─ collection.ts     // Collection mutations
  │   ├─ preferences.ts    // Preference mutations
  │   ├─ bulk.ts           // Bulk operations
  │   └─ promos.ts         // Promo mutations
  └─ utils.ts              // Keep existing utilities
```

**Step 1: Create Query Modules** (Day 1)

Create `src/lib/tracker/queries/sets.ts`:
```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { withValidation } from '@/lib/server-action-helpers'

const GetSetByIdSchema = z.object({
  setId: z.string().min(1),
})

/**
 * Fetch all available sets with card counts
 */
export async function getAvailableSets() {
  const supabase = createServerClient()

  const { data: sets, error } = await supabase
    .from('sets')
    .select(`
      *,
      cards(count)
    `)
    .order('release_date', { ascending: false })

  if (error) throw error

  return sets.map(set => ({
    ...set,
    card_count: set.cards[0].count,
  }))
}

/**
 * Fetch a single set by ID
 */
export const getSetById = withValidation(
  GetSetByIdSchema,
  async ({ setId }) => {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('sets')
      .select(`
        *,
        cards(count)
      `)
      .eq('id', setId)
      .single()

    if (error) throw error

    return {
      ...data,
      card_count: data.cards[0].count,
    }
  }
)

/**
 * Get set IDs that the user has cards for
 */
export async function getTrackedSetIds() {
  const supabase = createServerClient()
  const user = await getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('user_collections')
    .select('card_variants(card_id, cards(set_id))')
    .eq('user_id', user.id)
    .gt('quantity', 0)

  if (error) throw error

  // Extract unique set IDs
  const setIds = new Set(
    data
      .map(c => c.card_variants?.cards?.set_id)
      .filter(Boolean) as string[]
  )

  return Array.from(setIds)
}
```

Create `src/lib/tracker/queries/variants.ts`:
```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { withValidation } from '@/lib/server-action-helpers'

const GetVariantsSchema = z.object({
  setId: z.string().min(1),
  // Always fetch all variants, filter client-side
})

/**
 * Fetch all variants for a set with user collection data
 * CRITICAL: This query is optimized to fetch ALL variants once
 * Client-side filtering applied based on preferences
 */
export const getSetVariantsWithCollection = withValidation(
  GetVariantsSchema,
  async ({ setId }) => {
    const supabase = createServerClient()
    const user = await getCurrentUser()

    // Fetch regular cards with variants
    const { data: cardVariants, error: cardsError } = await supabase
      .from('cards')
      .select(`
        *,
        card_variants!inner(
          id,
          variant_type,
          image_url,
          user_collections(
            id,
            quantity,
            condition,
            notes,
            acquired_date
          )
        )
      `)
      .eq('set_id', setId)
      .eq('card_variants.user_collections.user_id', user?.id || '')
      .order('number')

    if (cardsError) throw cardsError

    // Fetch promo cards separately (no FK relationship)
    const { data: promos, error: promosError } = await supabase
      .from('promo_cards')
      .select('*')
      .eq('set_id', setId)

    if (promosError) throw promosError

    // Fetch hidden promo preferences
    const { data: hiddenPromos, error: hiddenError } = await supabase
      .from('user_promo_preferences')
      .select('promo_id')
      .eq('set_id', setId)
      .eq('user_id', user?.id || '')
      .eq('is_tracked', false)

    if (hiddenError) throw hiddenError

    const hiddenPromoIds = new Set(hiddenPromos.map(p => p.promo_id))

    // Transform to TrackerCard format
    // ... (keep existing transformation logic)

    return trackerCards
  }
)
```

Create `src/lib/tracker/queries/preferences.ts`:
```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { withValidation } from '@/lib/server-action-helpers'
import type { TrackerPreferences } from '@/lib/types/tracker'

const GetPreferencesSchema = z.object({
  setId: z.string().min(1),
})

const DEFAULT_PREFERENCES: TrackerPreferences = {
  slotConfig: 'NINE',
  includePromos: true,
  includeReverseHolos: true,
  includePokeball: true,
  includeMasterball: true,
}

/**
 * Get user's tracker preferences for a set
 * Returns defaults for guests or if no preferences saved
 */
export const getTrackerPreferences = withValidation(
  GetPreferencesSchema,
  async ({ setId }) => {
    const supabase = createServerClient()
    const user = await getCurrentUser()

    if (!user) return DEFAULT_PREFERENCES

    const { data, error } = await supabase
      .from('master_set_preferences')
      .select('*')
      .eq('user_id', user.id)
      .eq('set_id', setId)
      .single()

    if (error) {
      // No preferences saved yet
      return DEFAULT_PREFERENCES
    }

    return {
      slotConfig: data.slot_config,
      includePromos: data.include_promos,
      includeReverseHolos: data.include_reverse_holos,
      includePokeball: data.include_pokeball,
      includeMasterball: data.include_masterball,
    }
  }
)
```

**Step 2: Create Mutation Modules** (Day 2)

Create `src/lib/tracker/mutations/collection.ts`:
```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { withValidation } from '@/lib/server-action-helpers'
import {
  ToggleOwnedSchema,
  UpdateCollectionSchema,
} from '@/lib/validation/tracker'

/**
 * Toggle card owned status
 * Creates/updates collection entry
 */
export const toggleCardOwned = withValidation(
  ToggleOwnedSchema,
  async ({ variantId }) => {
    const supabase = createServerClient()
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    // Check if entry exists
    const { data: existing } = await supabase
      .from('user_collections')
      .select('*')
      .eq('user_id', user.id)
      .eq('variant_id', variantId)
      .single()

    if (existing) {
      // Toggle
      const newQuantity = existing.quantity > 0 ? 0 : 1
      const { error } = await supabase
        .from('user_collections')
        .update({ quantity: newQuantity })
        .eq('id', existing.id)

      if (error) throw error

      return {
        owned: newQuantity > 0,
        quantity: newQuantity,
      }
    } else {
      // Create new entry
      const { error } = await supabase
        .from('user_collections')
        .insert({
          user_id: user.id,
          variant_id: variantId,
          quantity: 1,
        })

      if (error) throw error

      return {
        owned: true,
        quantity: 1,
      }
    }
  }
)

/**
 * Update collection entry details
 */
export const updateCollectionEntry = withValidation(
  UpdateCollectionSchema,
  async ({ variantId, ...updates }) => {
    const supabase = createServerClient()
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
      .from('user_collections')
      .update({
        quantity: updates.quantity,
        condition: updates.condition,
        notes: updates.notes,
        acquired_date: updates.acquiredDate,
      })
      .eq('user_id', user.id)
      .eq('variant_id', variantId)
      .select()
      .single()

    if (error) throw error
    return data
  }
)
```

Create `src/lib/tracker/mutations/bulk.ts`:
```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { withValidation } from '@/lib/server-action-helpers'
import { BulkMarkSchema } from '@/lib/validation/tracker'

/**
 * Bulk mark cards as owned by criteria
 */
export const bulkMarkAsOwned = withValidation(
  BulkMarkSchema,
  async ({ setId, rarity, variantType }) => {
    const supabase = createServerClient()
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    // Get variant IDs matching criteria
    let query = supabase
      .from('card_variants')
      .select('id, card_id, cards!inner(set_id, rarity)')
      .eq('cards.set_id', setId)

    if (rarity) {
      query = query.eq('cards.rarity', rarity)
    }

    if (variantType) {
      query = query.eq('variant_type', variantType)
    }

    const { data: variants, error } = await query

    if (error) throw error

    // Upsert collection entries
    const entries = variants.map(v => ({
      user_id: user.id,
      variant_id: v.id,
      quantity: 1,
    }))

    const { error: upsertError } = await supabase
      .from('user_collections')
      .upsert(entries, {
        onConflict: 'user_id,variant_id',
      })

    if (upsertError) throw upsertError

    return {
      count: entries.length,
    }
  }
)

/**
 * Bulk unmark cards as owned
 */
export const bulkUnmarkOwned = withValidation(
  BulkMarkSchema,
  async ({ setId, rarity, variantType }) => {
    const supabase = createServerClient()
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    // Similar to bulkMarkAsOwned but update quantity to 0
    // ... implementation
  }
)
```

Create `src/lib/tracker/mutations/promos.ts`:
```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { withValidation } from '@/lib/server-action-helpers'
import { z } from 'zod'

const UntrackPromoSchema = z.object({
  promoId: z.string().uuid(),
  setId: z.string().min(1),
})

/**
 * Hide a promo from tracker
 */
export const untrackPromo = withValidation(
  UntrackPromoSchema,
  async ({ promoId, setId }) => {
    const supabase = createServerClient()
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
      .from('user_promo_preferences')
      .upsert({
        user_id: user.id,
        set_id: setId,
        promo_id: promoId,
        is_tracked: false,
      })

    if (error) throw error
  }
)

/**
 * Restore a hidden promo
 */
export const restorePromo = withValidation(
  UntrackPromoSchema,
  async ({ promoId, setId }) => {
    const supabase = createServerClient()
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
      .from('user_promo_preferences')
      .delete()
      .eq('user_id', user.id)
      .eq('set_id', setId)
      .eq('promo_id', promoId)

    if (error) throw error
  }
)
```

**Step 3: Create Index Files** (Day 3)

Create `src/lib/tracker/queries/index.ts`:
```typescript
// Re-export all queries
export * from './sets'
export * from './variants'
export * from './collection'
export * from './preferences'
export * from './promos'
```

Create `src/lib/tracker/mutations/index.ts`:
```typescript
// Re-export all mutations
export * from './collection'
export * from './preferences'
export * from './bulk'
export * from './promos'
```

**Step 4: Update Imports** (Day 4)

Update all files that import from `actions.ts`:

```typescript
// Before
import { getAvailableSets, toggleCardOwned } from '@/lib/tracker/actions'

// After
import { getAvailableSets } from '@/lib/tracker/queries'
import { toggleCardOwned } from '@/lib/tracker/mutations'
```

**Step 5: Delete Old File**

Once all imports updated and tests pass:
```bash
git rm src/lib/tracker/actions.ts
```

**Deliverable**: ✅ Modular tracker data access layer

---

#### Success Criteria for File Splitting:
- [ ] No file exceeds 300 lines
- [ ] Clear separation: queries vs mutations
- [ ] All tests still pass
- [ ] All imports updated
- [ ] Old actions.ts deleted

---

## 🟡 MEDIUM SEVERITY

### 4. Inconsistent Error Handling
**Risk**: Poor UX, difficult debugging, inconsistent user feedback
**Effort**: 3-4 days
**Priority**: MEDIUM

#### Phase 4.1: Standardize Error Handling (3-4 days)

**Step 1: Create Error Classes** (Day 1)

Create `src/lib/errors.ts`:
```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'DATABASE_ERROR', 500, details)
    this.name = 'DatabaseError'
  }
}

// User-friendly error messages
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.message
  }

  if (error instanceof AuthenticationError) {
    return 'Please log in to continue'
  }

  if (error instanceof AuthorizationError) {
    return 'You do not have permission to perform this action'
  }

  if (error instanceof NotFoundError) {
    return error.message
  }

  if (error instanceof DatabaseError) {
    return 'A database error occurred. Please try again.'
  }

  return 'An unexpected error occurred. Please try again.'
}
```

**Step 2: Update Server Actions** (Day 2)

```typescript
import { AuthenticationError, DatabaseError } from '@/lib/errors'

export const toggleCardOwned = withValidation(
  ToggleOwnedSchema,
  async ({ variantId }) => {
    const supabase = createServerClient()
    const user = await getCurrentUser()

    if (!user) {
      throw new AuthenticationError()
    }

    const { data, error } = await supabase
      .from('user_collections')
      .update({ quantity: 1 })
      .eq('variant_id', variantId)
      .eq('user_id', user.id)

    if (error) {
      throw new DatabaseError('Failed to update collection', error)
    }

    return data
  }
)
```

**Step 3: Add Error Boundaries** (Day 3)

Create `src/app/error.tsx`:
```typescript
'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error tracking service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Something went wrong!
            </h2>
            <p className="text-gray-600 mb-4">
              {error.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
```

Create `src/app/tracker/[setId]/error.tsx`:
```typescript
'use client'

export default function TrackerError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-2">
        Failed to load tracker
      </h2>
      <p className="text-gray-600 mb-4">
        {error.message}
      </p>
      <button onClick={reset} className="btn btn-primary">
        Retry
      </button>
    </div>
  )
}
```

**Step 4: Add Toast Notifications** (Day 4)

```bash
npm install sonner
```

Create `src/components/providers/ToastProvider.tsx`:
```typescript
'use client'

import { Toaster } from 'sonner'

export function ToastProvider() {
  return <Toaster position="top-right" />
}
```

Update hooks to use toast:
```typescript
import { toast } from 'sonner'

export function useToggleOwned(setId: string, preferences: TrackerPreferences) {
  return useMutation({
    mutationFn: toggleCardOwned,
    onError: (error) => {
      toast.error(getUserFriendlyMessage(error))
    },
    onSuccess: () => {
      toast.success('Card updated')
    },
  })
}
```

**Deliverable**: ✅ Consistent error handling across app

---

### 5. Missing Repository Pattern
**Risk**: Difficult to test, tight coupling to Supabase
**Effort**: 1 week
**Priority**: MEDIUM

#### Phase 5.1: Introduce Repository Layer (Optional - Can Skip)

**Note**: This is a more advanced refactor. Consider skipping if time is limited.

Create `src/lib/repositories/TrackerRepository.ts`:
```typescript
import { createServerClient } from '@/lib/supabase/server'
import type { TrackerCard } from '@/lib/types/tracker'

export interface ITrackerRepository {
  getSetVariants(setId: string): Promise<TrackerCard[]>
  toggleOwned(userId: string, variantId: string): Promise<{ owned: boolean; quantity: number }>
  // ... other methods
}

export class SupabaseTrackerRepository implements ITrackerRepository {
  constructor(private supabase = createServerClient()) {}

  async getSetVariants(setId: string): Promise<TrackerCard[]> {
    const { data, error } = await this.supabase
      .from('cards')
      .select('...')
      .eq('set_id', setId)

    if (error) throw new DatabaseError('Failed to fetch variants', error)
    return data
  }

  async toggleOwned(userId: string, variantId: string) {
    // ... implementation
  }
}

// For testing, can create mock repository
export class MockTrackerRepository implements ITrackerRepository {
  async getSetVariants() {
    return mockTrackerCards(10)
  }

  async toggleOwned() {
    return { owned: true, quantity: 1 }
  }
}
```

**Benefit**: Easier to test, but adds complexity. **Skip if time-constrained.**

---

## 🟢 LOW SEVERITY

### 6. Magic UI Abstraction Layer
**Risk**: Vendor lock-in (low risk, Magic UI is stable)
**Effort**: 2-3 days
**Priority**: LOW

#### Phase 6.1: Create UI Abstraction (Optional)

Create `src/components/ui/animations.tsx`:
```typescript
// Abstraction layer over Magic UI
import { BlurFade as MagicBlurFade } from '@/components/magicui/blur-fade'
import { AnimatedGradientText as MagicGradientText } from '@/components/magicui/animated-gradient-text'

// Can swap implementation later if needed
export const FadeIn = MagicBlurFade
export const GradientText = MagicGradientText

// Use as:
// import { FadeIn } from '@/components/ui/animations'
```

**Recommendation**: Skip this unless planning to switch component libraries.

---

### 7. API Route Organization
**Risk**: None (only 1 route currently)
**Effort**: 1 day
**Priority**: VERY LOW

Create structure for future routes:
```
src/app/api/
  ├─ proxy-image/route.ts
  ├─ webhooks/
  │   └─ stripe/
  │       └─ route.ts
  ├─ export/
  │   ├─ csv/route.ts
  │   └─ pdf/route.ts
  └─ chromadex/
      └─ generate/route.ts
```

**Recommendation**: Address when implementing those features, not now.

---

## 📊 REFACTORING ROADMAP TIMELINE

### Week 1: Critical Testing ✅ COMPLETED (Dec 28, 2025)
- **Days 1-3**: ✅ Setup test infrastructure + utilities tests
- **Days 4-5**: ✅ Optimistic update tests (server action tests deferred)

**Achievements**:
- 90 tests passing (68 utility, 15 useCollection, 7 useTrackerPreferences)
- 96%+ coverage for utilities, 78-97% for hooks
- Merged to develop branch

### Week 2: Critical Testing + Validation ⏸️ IN PROGRESS
- **Days 1-2**: ✅ COMPLETE - Component tests (Phase 1.3) - 70 tests, 96.91% coverage
- **Days 3-5**: ⏸️ **CURRENT** - Validation layer implementation (Phase 2)
  - Phase 1.4 (E2E tests) marked as optional, can proceed directly to Phase 2

### Week 3: File Organization
- **Days 1-4**: Split actions.ts into modules
- **Day 5**: Update all imports, verify tests

### Week 4: Error Handling + Polish
- **Days 1-3**: Standardize error handling
- **Days 4-5**: Documentation + final testing

---

## ✅ SUCCESS CRITERIA

### Critical (Must Complete)
- [x] Test coverage ≥ 70% overall ✅ (160 tests total: 78-96% hooks, 96%+ utils, 96.91% components)
- [ ] All server actions have validation (⏸️ Phase 2 - Input Validation Layer)
- [ ] No file exceeds 300 lines (⏸️ Phase 3 - File Splitting, actions.ts is 1546 lines)
- [ ] Error boundaries in place (⏸️ Phase 4 - Error Handling)
- [x] All tests passing ✅ (160/160 tests passing on code-cleanup branch)

### Medium (Should Complete)
- [ ] Consistent error handling
- [ ] User-friendly error messages
- [ ] Toast notifications working

### Low (Nice to Have)
- [ ] Repository pattern (optional)
- [ ] UI abstraction layer (optional)

---

## 🚀 ROLLOUT STRATEGY

1. **Create feature branch**: `git checkout -b refactor/critical-improvements`
2. **Complete in phases**: Merge each phase to develop as completed
3. **Run full test suite** before each merge
4. **Update documentation** as you go
5. **Final merge to master** after all phases complete

---

## 📝 NOTES

- **Parallel work possible**: Testing and validation can be done simultaneously
- **Incremental rollout**: Each phase delivers value independently
- **Backward compatible**: Refactors maintain existing APIs
- **Low risk**: Changes are well-tested before merging

---

**Estimated Total Effort**: 4 weeks
**Recommended Team Size**: 1-2 developers
**Blocking Dependencies**: None, can start immediately
