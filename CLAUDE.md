# BinderDex - Project Context

> Based on Project Plan v4.0 & Technical Specification v4.0 (December 2025)

## Overview

BinderDex is a Pokémon TCG collection management web application featuring a **Unified Binder Builder** that combines two complementary approaches to binder page creation:

- **ChromaDex Mode**: Algorithm-powered page generation based on color analysis and visual harmony
- **Michi Mode**: Full creative control with custom images, slot merging, and scrapbook-style layouts

Both modes share a single canvas editor, allowing users to seamlessly blend automated suggestions with manual creativity.

**Status**: In Development (Solo developer + Claude Code)

## Agent Usage Guidelines

**CRITICAL: Use specialized agents extensively to offload complex work.**

### When to Use Agents

1. **Explore Agent** (`subagent_type: "Explore"`) - Use for ALL codebase exploration tasks:
   - Understanding project structure and architecture
   - Finding how features are implemented
   - Discovering patterns and conventions
   - Searching for specific functionality across multiple files
   - Answering "how does X work?" questions
   - **Always specify thoroughness level**: "quick", "medium", or "very thorough"

   ```typescript
   // Example: When user asks "How does the filter system work?"
   Task(subagent_type: "Explore", prompt: "Perform a very thorough exploration
   of the filter system implementation...")
   ```

2. **Bug Fixer Agent** (`subagent_type: "binderdex-bug-fixer"`) - Use for ALL bugs and errors:
   - Runtime errors and exceptions
   - Failed API calls or database queries
   - Supabase/RLS issues
   - UI rendering bugs
   - Filter system issues
   - Drag-and-drop problems
   - Any deviation from expected behavior
   - Performance issues

   ```typescript
   // Example: When user reports "Cards aren't loading"
   Task(subagent_type: "binderdex-bug-fixer", prompt: "Diagnose and fix
   the card loading issue...")
   ```

3. **Plan Agent** (`subagent_type: "Plan"`) - Use for planning new features:
   - Designing implementation strategies
   - Breaking down complex features
   - Identifying critical files and dependencies

4. **General Purpose Agent** - Use for multi-step tasks requiring multiple tools:
   - Data import workflows
   - Complex refactoring across multiple files
   - Tasks requiring both exploration and implementation

### Agent Usage Rules

- **ALWAYS prefer agents over direct tool use** for exploration and debugging
- **Run agents in parallel** when tasks are independent (single message, multiple Task calls)
- **Provide detailed context** in agent prompts - they can't see conversation history
- **Specify thoroughness** for Explore agents: quick/medium/very thorough
- **Trust agent outputs** - they have specialized knowledge and context

## Core Value Pillars

| Pillar | Description |
|--------|-------------|
| **Browse** | Comprehensive card database with powerful multi-filter search |
| **Track** | Visual master set tracker showing physical binder layout |
| **Build** | Unified builder with manual creation + algorithmic generation |
| **Share** | Community gallery, templates, and social export options |


## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 14 | App Router, Server Components |
| Language | TypeScript | Strict mode enabled |
| Styling | Magic UI (primary) + Tailwind CSS (fallback) | Use Magic UI components first |
| State | Zustand + React Query | Client + server state |
| Database | Supabase PostgreSQL | With Row Level Security |
| Auth | Supabase Auth | Email only (OAuth later) |
| Storage | Supabase Storage | Card images, custom uploads, exports |
| Hosting | Vercel | Preview deployments on PRs |
| Payments | Stripe | Subscriptions + webhooks |
| Drag & Drop | @dnd-kit/core | Modern, accessible drag-drop library |
| Image Processing | Cropper.js + node-vibrant | Client-side cropping, color extraction |
| Testing | Vitest + @testing-library/react | Unit, integration, and hook tests |
| Toast Notifications | Sonner | User feedback for mutations and errors |
| Error Tracking | Sentry | Production error monitoring and alerts |

## Testing Guidelines

**CRITICAL: Run tests before committing. Tests are your safety net for changes.**

### Test Coverage

| Category | Tests | Coverage | Location |
|----------|-------|----------|----------|
| General Utilities | 4 tests | High | `src/lib/utils.test.ts` |
| Custom Error Classes | 32 tests | 100% statements | `src/lib/__tests__/errors.test.ts` |
| Server Action Helpers | 21 tests | 100% statements | `src/lib/__tests__/server-action-helpers.test.ts` |
| Validation Schemas | 54 tests | 100% statements | `src/lib/validation/__tests__/tracker.test.ts` |
| Tracker Utilities | 64 tests | 96%+ statements | `src/lib/tracker/__tests__/utils.test.ts` |
| CardSlot Component | 35 tests | 100% statements, 97.56% branches | `src/components/tracker/__tests__/CardSlot.test.tsx` |
| BinderView Component | 35 tests | 98% statements, 88.15% branches | `src/components/tracker/__tests__/BinderView.test.tsx` |
| Collection Hooks | 15 tests | 78% statements | `src/hooks/tracker/__tests__/useCollection.test.tsx` |
| Preferences Hook | 7 tests | 97% statements | `src/hooks/tracker/__tests__/useTrackerPreferences.test.tsx` |

**Total:** 267 tests covering core tracker functionality, error handling, validation, and components

**Note on Coverage:** Overall coverage is lower (~47%) due to untested server actions/queries (integration-tested in production) and infrastructure code (Sentry configs, error boundaries). Core business logic maintains 70%+ coverage.

### When to Run Tests

**Required (Manual):**
```bash
# Before every commit
npm test

# Check coverage when making significant changes
npm run test:coverage
```

**Automatic (CI/CD):**
- Tests run automatically on every push via GitHub Actions (`.github/workflows/ci.yml`)
- Pull requests show ✅ if tests pass, ❌ if they fail
- **Do not merge PRs with failing tests**

**Optional (Development):**
```bash
# Watch mode - tests re-run on file save
npm test -- --watch

# Run specific test file
npm test -- src/lib/tracker/__tests__/utils.test.ts

# Run tests matching pattern
npm test -- -t "optimistic update"
```

### Development Workflow with Tests

**When Adding New Features:**
1. Write the feature code
2. Write tests for the new functionality
3. Run `npm test` to verify tests pass
4. Commit both code and tests together

**When Modifying Existing Code:**
1. Make your changes
2. Run `npm test` immediately
3. If tests fail → fix code or update tests
4. Commit only when all tests pass ✅

**When Refactoring:**
1. Run `npm test` BEFORE refactoring (ensure baseline passes)
2. Refactor the code
3. Run `npm test` AFTER refactoring
4. If tests still pass → refactoring is safe ✅
5. If tests fail → you broke something, fix it

**When Debugging:**
1. Write a test that reproduces the bug
2. Run test → it should fail (confirming the bug)
3. Fix the bug
4. Run test → it should pass ✅
5. Commit fix + test together

### Test Utilities

**Mock Data Factories:**
```typescript
import { mockTrackerCards, createMockCard } from '@/test/mockData/trackerMocks'

// Create 10 mock cards
const cards = mockTrackerCards(10)

// Create custom mock card
const card = createMockCard({ owned: true, quantity: 3 })
```

**Test Helpers:**
```typescript
import { renderWithProviders, createQueryClientWrapper } from '@/test/utils'

// For component tests (future)
const { getByText } = renderWithProviders(<MyComponent />)

// For hook tests
const { queryClient, wrapper } = createQueryClientWrapper()
const { result } = renderHook(() => useMyHook(), { wrapper })
```

**Testing Async Mutations:**
```typescript
// Wrap mutations in act() for optimistic updates
await act(async () => {
  result.current.mutate('variant-1')
  await Promise.resolve()
})

// Assert on optimistic state
expect(queryClient.getQueryData(queryKey)).toBe(expectedValue)

// Wait for async completion
await waitFor(() => expect(result.current.isSuccess).toBe(true))
```

### Coverage Thresholds

Current thresholds in `vitest.config.ts`:
- Statements: 70%
- Functions: 70%
- Branches: 65%
- Lines: 70%

**If coverage drops below thresholds:**
1. `npm run test:coverage` will fail
2. Identify untested code in coverage report
3. Add tests to cover new code paths
4. Commit tests with feature code

### Important Testing Rules

1. **NEVER skip tests** - If tests fail, fix them. Don't disable or remove them.
2. **Test business logic, not implementation details** - Test what the function does, not how it does it
3. **Keep tests simple and readable** - Future you will thank current you
4. **Mock external dependencies** - Database calls, API requests, etc.
5. **One assertion per test (when possible)** - Makes failures easier to debug
6. **Use descriptive test names** - `it('marks card as owned when quantity > 0')` not `it('test1')`

### What Gets Tested

**✅ Always Test:**
- Pure utility functions (sorting, filtering, calculations)
- React Query hooks (mutations, optimistic updates, rollbacks)
- UI components (interaction logic, rendering states, event handlers)
- Business logic (pricing, permissions, calculations)
- Edge cases (empty arrays, null values, boundary conditions)

**⏸️ Test Later (Lower Priority):**
- Server actions (already covered by hook tests)
- Database queries (covered by integration tests when needed)
- Visual styling (covered by visual regression tests when needed)

**❌ Don't Test:**
- Third-party libraries (trust they work)
- Simple type definitions
- Configuration files

## Error Handling

**CRITICAL: All errors must provide helpful user feedback. Never let errors disappear silently.**

### Error Handling System Overview

The BinderDex error handling system has six layers:

1. **Custom Error Classes** (`src/lib/errors.ts`) - Type-safe errors with user-friendly messages
2. **Server Action Error Mapping** (`src/lib/server-action-helpers.ts`) - Translates database/API errors
3. **Toast Notifications** (Sonner) - User feedback for all mutations
4. **Error Boundaries** - Prevent crashes, show recovery UI
5. **Query Error States** - Retry UI for failed data fetches
6. **Sentry Integration** - Production error tracking

### Quick Start Guide

**For adding error handling to new features, follow these patterns:**

#### 1. Adding Error Handling to a New Mutation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useMyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      const result = await myServerAction(data)
      if (result.error) {
        throw new Error(result.error)
      }
      return result.data
    },
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['myData'] })

      // Snapshot for rollback
      const previousData = queryClient.getQueryData(['myData'])

      // Optimistic update
      queryClient.setQueryData(['myData'], (old) => {
        // Update logic here
        return newData
      })

      return { previousData }
    },
    onError: (err, _data, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['myData'], context.previousData)
      }
      // Show error toast
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    },
    onSuccess: () => {
      // Show success toast
      toast.success('Saved successfully')

      // Background sync related data
      queryClient.invalidateQueries({
        queryKey: ['relatedData'],
        refetchType: 'none'
      })
    },
  })
}
```

#### 2. Adding Error Handling to a New Query

```typescript
import { useQuery } from '@tanstack/react-query'

export function useMyQuery(id: string) {
  return useQuery({
    queryKey: ['myData', id],
    queryFn: async () => {
      const result = await myServerAction(id)
      if (result.error) {
        throw new Error(result.error)
      }
      return result.data
    },
    enabled: !!id,
  })
}

// In component:
function MyComponent() {
  const { data, isError, error, refetch } = useMyQuery(id)

  // Handle error state
  if (isError) {
    return (
      <div className="error-container">
        <h2>Failed to Load</h2>
        <p>{error?.message}</p>
        <button onClick={() => refetch()}>Try Again</button>
      </div>
    )
  }

  // Handle loading and success states...
}
```

#### 3. Adding Error Handling to a New Server Action

```typescript
import { withMultiParamValidation } from '@/lib/server-action-helpers'
import { AuthenticationError, DatabaseError, NotFoundError } from '@/lib/errors'
import { myActionSchema } from '@/lib/validation/myModule'

export async function myServerAction(param: string) {
  return withMultiParamValidation(
    myActionSchema,
    { param },
    async ({ param }) => {
      const supabase = await createClient()

      // 1. Check authentication
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new AuthenticationError()
      }

      // 2. Fetch data
      const { data, error } = await supabase
        .from('table')
        .select('*')
        .eq('id', param)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('Resource not found')
        }
        throw new DatabaseError(error.message)
      }

      // 3. Return success
      return { data, error: null }
    }
  )
}
```

#### 4. When to Use Which Error Type

| Scenario | Error Type | Example |
|----------|------------|---------|
| User not logged in | `AuthenticationError` | `if (!user) throw new AuthenticationError()` |
| User lacks permission | `AuthorizationError` | `if (resource.userId !== user.id) throw new AuthorizationError()` |
| Resource doesn't exist | `NotFoundError` | `if (!data) throw new NotFoundError('Card not found')` |
| Duplicate resource | `ConflictError` | `if (exists) throw new ConflictError('Already exists')` |
| Database operation failed | `DatabaseError` | `if (error) throw new DatabaseError(error.message)` |
| External API failed | `NetworkError` | `if (response.status >= 500) throw new NetworkError()` |
| Validation failed | `ValidationError` | Automatically handled by `withValidation()` |
| Unknown error | `AppError` | `throw new AppError('Something went wrong')` |

### Custom Error Classes

**Location**: `src/lib/errors.ts`

All errors extend `AppError` base class with:
- Developer message (logged to console/Sentry)
- User message (shown in UI)
- HTTP status code
- Error code for programmatic handling

**Available Error Types:**
```typescript
ValidationError      // 400 - Invalid user input
AuthenticationError  // 401 - User not logged in
AuthorizationError   // 403 - Permission denied
NotFoundError        // 404 - Resource not found
ConflictError        // 409 - Duplicate resource
DatabaseError        // 500 - Database operation failed
NetworkError         // 503 - External service unavailable
AppError             // 500 - Generic application error
```

**Helper Functions:**
- `mapSupabaseError(error)` - Converts Postgres error codes to AppError
- `isAppError(error)` - Type guard for AppError instances

**Usage in Server Actions:**
```typescript
import { AuthenticationError, DatabaseError } from '@/lib/errors'

const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  throw new AuthenticationError() // User message: "Please log in to continue"
}

const { error } = await supabase.from('table').insert(data)
if (error) {
  throw new DatabaseError(error.message) // Logged, but shown as "Database error occurred"
}
```

### Server Action Error Handling

**Location**: `src/lib/server-action-helpers.ts`

All server actions wrapped with validation helpers automatically:
- Catch validation errors → return user-friendly messages
- Catch AppError instances → return userMessage
- Catch Supabase RLS errors → return "You don't have permission..."
- Catch Postgres constraint violations → return "Invalid data. Please check your input."
- Catch unknown errors → return "Something went wrong. Please try again."

**Error Mapping Example:**
```typescript
// Server action throws AuthenticationError
throw new AuthenticationError()

// withValidation catches it and returns:
{ data: null, error: "Please log in to continue" }

// Hook receives error message and shows toast
toast.error("Please log in to continue")
```

### Toast Notifications

**Library**: Sonner (`sonner`)
**Component**: `src/components/ui/toaster.tsx`
**Configuration**:
- Position: top-right
- Duration: 4 seconds
- Rich colors enabled
- Close button enabled

**Usage in Hooks:**
```typescript
import { toast } from 'sonner'

// Success toast
toast.success('Card marked as owned')

// Error toast (from caught error)
toast.error(err instanceof Error ? err.message : 'Failed to update card')

// Error toast (from server action result)
if (result.error) {
  toast.error(result.error)
}
```

**Toast Guidelines:**
- ✅ Success: Brief confirmation ("Card marked as owned", "Changes saved")
- ❌ Error: Include helpful context from error message
- ℹ️ Info: For non-critical updates
- ⏳ Loading: For long-running operations (optional)

**All Mutations Have Toasts:**
- `useToggleOwned` - Error toast on failure
- `useUpdateCollectionEntry` - Error + success toasts
- `useUntrackPromo` - Error + success toasts
- `useRestorePromo` - Error + success toasts
- `useResetHiddenPromos` - Error + success toasts
- `useTrackerPreferences` - Error toast on save failure
- `useBulkActions` (6 functions) - Error + success toasts with counts

### Error Boundaries

**Location**:
- `src/components/ErrorBoundary.tsx` - Generic boundary
- `src/components/tracker/TrackerErrorFallback.tsx` - Tracker-specific UI

**Boundary Placement:**
- **Root Boundary** (via `QueryProvider`) - Catches catastrophic errors, reloads page on retry
- **Tracker Page Boundary** - Catches tracker-specific errors, custom fallback UI

**Features:**
- Catches React rendering errors
- Displays error message to user
- Provides retry button
- Sends errors to Sentry (production)

**Example Fallback UI:**
```typescript
<ErrorBoundary
  fallback={
    <TrackerErrorFallback
      error={new Error("Failed to load tracker")}
      resetErrorBoundary={() => window.location.reload()}
    />
  }
>
  {/* App content */}
</ErrorBoundary>
```

### Query Error States

**Pattern**: Check `isError` state from React Query, show retry UI

**Example** (`src/app/tracker/[setId]/page.tsx`):
```typescript
const { data, isError, error, refetch } = useQuery({
  queryKey: ["set", setId],
  queryFn: async () => {
    const result = await getSetById(setId)
    if (result.error) throw new Error(result.error)
    return result.data
  },
})

// Error state - show retry UI
if (isError) {
  return (
    <div className="error-container">
      <h2>Failed to Load</h2>
      <p>{error?.message}</p>
      <button onClick={() => refetch()}>Try Again</button>
    </div>
  )
}
```

**Query Error Handling Locations:**
- `src/app/tracker/[setId]/page.tsx` - Set data, preferences, and cards queries

### Sentry Integration

**Configuration Files:**
- `sentry.client.config.ts` - Browser-side error tracking
- `sentry.server.config.ts` - Server-side error tracking
- `sentry.edge.config.ts` - Edge runtime error tracking
- `next.config.mjs` - Sentry webpack plugin

**Environment Variables Required:**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token
```

**Error Filtering:**
- Validation errors (user mistakes) are NOT sent to Sentry
- Authentication errors (expected) are NOT sent to Sentry
- Database errors, network errors, and unhandled exceptions ARE sent to Sentry

**Error Context:**
- React component stack (from error boundaries)
- User ID (when available)
- Request URL and method
- Error code and type

**Monitoring Checklist:**
1. Check Sentry dashboard weekly for new error patterns
2. Set up alerts for critical errors (database, auth system)
3. Monitor error rate trends
4. Review user-reported errors for patterns

### Error Handling Best Practices

**DO:**
- ✅ Show user-friendly error messages (not technical details)
- ✅ Provide retry buttons for transient failures
- ✅ Log technical details to console and Sentry
- ✅ Use toast notifications for mutation feedback
- ✅ Check query `isError` state and display retry UI
- ✅ Rollback optimistic updates on error
- ✅ Include error context in Sentry reports

**DON'T:**
- ❌ Show raw database error messages to users
- ❌ Let errors disappear silently (always show feedback)
- ❌ Crash the entire app (use error boundaries)
- ❌ Send validation errors to Sentry (noise)
- ❌ Forget to test error states
- ❌ Skip rollback logic in optimistic updates

### Error Testing

**Test All Error Paths:**
```typescript
// Test mutation error with rollback
it('rolls back optimistic update on server error', async () => {
  vi.mocked(toggleCardOwned).mockResolvedValue({
    data: null,
    error: 'Server error',
  })

  await act(async () => {
    result.current.mutate('variant-1')
  })

  await waitFor(() => expect(result.current.isError).toBe(true))

  // Verify rollback
  const cachedData = queryClient.getQueryData(queryKey)
  expect(cachedData).toEqual(previousState)

  // Verify toast
  expect(toast.error).toHaveBeenCalledWith('Server error')
})
```

**Mock Sonner in Tests** (`src/test/setup.tsx`):
```typescript
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  Toaster: () => null,
}))
```

## Code Architecture

### Validation Layer (Zod)

**All server action mutations are validated** using Zod schemas before database operations.

**Location**: `src/lib/validation/`
- `common.ts` - Reusable validation utilities (UUID, enums, dates, numbers)
- `tracker.ts` - Tracker-specific schemas (collection, preferences, bulk actions, promos)

**Validation Helpers**: `src/lib/server-action-helpers.ts`
- `withValidation()` - Wraps actions returning data
- `withSimpleValidation()` - Wraps actions with simple error responses
- `withMultiParamValidation()` - For multi-parameter actions with data
- `withSimpleMultiParamValidation()` - For multi-parameter actions with simple responses

**Example:**
```typescript
export async function toggleCardOwned(variantId: string) {
  return withMultiParamValidation(
    toggleCardOwnedSchema,
    { variantId },
    async ({ variantId }) => {
      // Validated input guaranteed to be UUID
      // ... implementation
    }
  );
}
```

**Benefits:**
- ✅ Runtime type safety beyond TypeScript
- ✅ Protection against invalid UUIDs, malformed data
- ✅ User-friendly error messages
- ✅ Consistent error handling patterns

### Modular Server Actions

**Tracker actions are organized into focused modules** for better maintainability.

**Structure**: `src/lib/tracker/`
```
├── queries/              (Read-only operations)
│   ├── sets.ts          - getAvailableSets, getTrackedSetIds, getSetById, etc.
│   ├── variants.ts      - getSetVariantsWithCollection, getSetVariants
│   ├── collection.ts    - getUserCollectionForSet
│   ├── preferences.ts   - getTrackerPreferences
│   └── promos.ts        - getHiddenPromoCount, getHiddenPromos
├── mutations/            (Write operations)
│   ├── collection.ts    - toggleCardOwned, updateCollectionEntry
│   ├── preferences.ts   - updateTrackerPreferences
│   ├── bulk.ts          - bulkMarkAsOwned, bulkUnmarkOwned
│   └── promos.ts        - untrackPromo, restorePromo, resetPromoPreferences
├── tracker-utils.ts      (Shared utilities)
└── index.ts              (Barrel export - re-exports everything)
```

**Usage:**
```typescript
// Import from barrel export (clean interface)
import { getAvailableSets, toggleCardOwned } from '@/lib/tracker'

// OR import specific module (if needed)
import { toggleCardOwned } from '@/lib/tracker/mutations/collection'
```

**Benefits:**
- ✅ Clear separation: queries vs mutations
- ✅ Smaller files (~150 lines each vs 1,600+ monolithic)
- ✅ Easier code navigation and reviews
- ✅ Reduced merge conflicts
- ✅ Scalable structure for future features

### Testing Modular Actions

When mocking server actions in tests, **mock the specific module**:

```typescript
// Mock collection mutations
vi.mock('@/lib/tracker/mutations/collection', () => ({
  toggleCardOwned: vi.fn(),
  updateCollectionEntry: vi.fn(),
}))

// Mock preferences queries
vi.mock('@/lib/tracker/queries/preferences', () => ({
  getTrackerPreferences: vi.fn(),
}))
```

## Supabase Project

**All database work must use this project:**

| Property | Value |
|----------|-------|
| **Project Name** | BinderDex |
| **Project ID** | `unwqvvdlmbrppfytpeyo` |
| **Region** | ap-northeast-1 |
| **Database Host** | db.unwqvvdlmbrppfytpeyo.supabase.co |

Use this project ID for all Supabase MCP operations: migrations, SQL execution, table management, edge functions, etc.

## Development Decisions

| Decision | Choice | Notes |
|----------|--------|-------|
| Package Manager | npm | Standard compatibility |
| Auth Strategy | Email only | OAuth (Google/Discord) added later |
| Card Images | Pokemon TCG API hosted | External URLs, can migrate to Supabase Storage later |
| Main Branch | master | Production branch |

## Core Features

### 1. Card Database Browser (FULLY IMPLEMENTED)

**Key Clarification**: Browse Cards displays unique cards only - no variants. This keeps card counts accurate and UI clean. Variants are only relevant in Master Set Tracker.

**Core Features:**
- Displays **unique cards only** (NO variants in browse view)
- Shared filter system: text search, set, era, type, rarity, generation, supertype, premium/legendary/mythical toggles
- Virtual scrolling with react-window for performance
- Responsive grid and list view modes with toggle
- Card detail modal with keyboard navigation (arrow keys, Escape)
- URL synchronization - all filter states are shareable via URL params
- Sticky header matching Tracker design pattern

**Key Components:**
- `BrowseHeader` - Sticky header with navigation and card counts
- `FilterPanel` - Comprehensive filter UI (desktop sidebar, mobile drawer)
- `FilterBar` - Active filter chips with remove buttons
- `SortDropdown` - Sort by name, number, rarity, release date
- `ViewModeToggle` - Grid/list view switcher
- `CardGrid` - Virtualized grid with responsive columns
- `CardListView` - Compact list view for browsing
- `BrowseCardModal` - Full card details with navigation

**Design System:**
- Uses unified color scheme: **indigo** for primary actions/active states
- Matches Master Set Tracker visual language
- Magic UI components: BlurFade animations, responsive layouts
- Consistent spacing, typography, and button patterns

### 2. Master Set Tracker (FULLY IMPLEMENTED)

**Key Clarification**: The Master Set Tracker serves as a visual guide showing what the user's physical binder should look like when completed. Users can look at the virtual binder and see cards they are missing in each specific slot.

**Core Features:**
- **Visual binder representation** showing what user's physical binder should look like
- Variants (Normal, Reverse Holo, First Edition, Pokéball, Masterball) are ONLY shown here
- Slot configurations: 9 (3×3), 12 (3×4), 16 (4×4)
- Dynamic preferences: toggle promos, toggle reverse holos, toggle Pokéball, toggle Masterball
- Visual states: Owned (full image) vs Missing (greyed placeholder)
- Progress tracking: Completion percentage, missing cards list

**Advanced Features:**
- **Hidden Promos Management**: Users can hide/restore promotional cards they don't want to track
- **Bulk Actions (Quick Fill)**: Mark all cards of a specific rarity/variant type at once
- **Optimistic Updates**: Instant UI feedback with background server sync
- **Client-Side Filtering**: Preference changes are instant (no refetch required)
- **Pagination-Based Navigation**: 2-page spreads on desktop, 1-page on mobile
- **Touch Gestures**: Swipe navigation, pinch zoom, long-press for details
- **Interactive Tutorial**: Coach marks system for first-time users

### 3. Unified Binder Builder (Flagship Feature)
The Unified Binder Builder combines ChromaDex's algorithmic page generation with Michi Method's creative freedom into a single, cohesive experience.

**Two Entry Points, One Canvas:**

| Aspect | ChromaDex Mode | Michi Mode |
|--------|----------------|------------|
| Philosophy | "Inspire me" - Algorithm suggests aesthetically cohesive pages | "I have a vision" - Full creative control over every detail |
| Starting Point | Select color/theme + filters, generate page | Blank canvas or template |
| Card Selection | Algorithm picks cards based on color harmony | User manually drags cards from picker |
| After Creation | Opens in shared canvas for manual tweaks | Can use ChromaDex to fill remaining slots |

**Shared Canvas Editor Features:**
- **Left Panel (Card Picker)**: Search bar, full filter system, scrollable card grid, upload button
- **Right Panel (Binder Canvas)**: Visual grid, droppable slots, page navigation, ChromaDex button

**Michi-Specific Features:**
- **Slot Merging**: Select multiple slots → merge into single display area for full-art spreads
- **Custom Image Upload**: PNG/JPG uploads, auto-crop to card dimensions, position controls
- **Templates**: Pre-built layouts (Evolution Line, Type Collection, Artist Tribute)
- **Full-Art Spread Generator**: Upload image → auto-slice into 9/12/16 card-sized segments

**ChromaDex Generation System:**
- Generation modes: Color - Dominant, Color - Palette, Color - Harmony
- Pre-computed data: color extraction using node-vibrant library
- Scoring: CIEDE2000 color distance + diversity bonus
- In-Canvas Options: Generate for entire page, empty slots only, or selected slots
- Uses **same filter system** as Browse Cards

### 4. Export/Import
- Basic Export (Free): CSV/JSON, High-res PNG
- Premium Export (Pro): Print-Ready PDF, Social Export (Instagram/TikTok formats)
- Import: TCGPlayer, Collectr, custom CSV

## Database Schema

### Core Tables
```
sets: id, name, series, era, printed_total, total, release_date, has_reverse_holos,
      has_pokeball_variants, has_masterball_variants, logo_url, symbol_url

cards: id, set_id, name, number, rarity, supertype, subtypes[], types[], hp, artist,
       national_dex_numbers[], image_small, image_large, is_promo, is_premium,
       is_legendary, is_mythical, generation

card_variants: id, card_id, variant_type (NORMAL, REVERSE_HOLO, FIRST_EDITION,
               SHADOWLESS, UNLIMITED, POKEBALL, MASTERBALL), image_url

promo_cards: id, set_id, promo_number, card_name, card_type, product_source,
             is_pokemon_center_exclusive, image_small, image_large
```

### ChromaDex Tables
```
card_colors: id, card_id (UNIQUE), dominant_hex, dominant_hsl (JSONB), palette (JSONB), brightness, saturation, warmth
```

### User Tables
```
user_profiles: id (= auth.users.id), email, display_name, avatar_url, tier,
               chromadex_uses_this_month, chromadex_reset_date

user_collections: id, user_id, variant_id, quantity, condition, notes, acquired_date

user_promo_preferences: id, user_id, set_id, promo_id, is_tracked

subscriptions: id, user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end
```

### Binder Tables (Updated for Unified Builder)
```
binders: id, user_id, name, description, slot_config,
         type (CUSTOM/MASTER_SET/CHROMADEX/MICHI),
         master_set_id, is_public, is_curated, template_id

binder_pages: id, binder_id, page_number

binder_slots: id, page_id, position (0-8/0-11/0-15),
              content_type (CARD/CUSTOM_IMAGE/EMPTY/MERGED),  -- Michi feature
              variant_id (nullable),
              custom_image_url TEXT,                          -- Michi feature
              span_cols INTEGER DEFAULT 1,                    -- Slot merging
              span_rows INTEGER DEFAULT 1,                    -- Slot merging
              crop_data JSONB                                 -- {x, y, zoom, rotation}

master_set_preferences: id, user_id, set_id, slot_config, include_promos, include_reverse_holos, include_pokeball, include_masterball

binder_templates: id, name, description, category, slot_config,
                  layout_data (JSONB), is_premium, preview_image_url, created_by

custom_images: id, user_id, storage_path, original_filename, file_size,
               mime_type, width, height, uploaded_at
```

## Key Architectural Decisions

1. **Unified Binder Builder Architecture** - ChromaDex and Michi Mode share ONE canvas editor with two entry points. Users can blend approaches, algorithm output is always editable.
2. **Extended Slot Model** - `binder_slots` includes `content_type`, `span_cols`, `span_rows`, `custom_image_url`, `crop_data` for Michi features.
3. **Variants only in Master Set Tracker** - Browse shows unique cards only to keep counts accurate
4. **Shared filter system** - ONE reusable filter component/hook/store used by Browse, Builder, and ChromaDex
5. **Pre-computed ChromaDex data** - Color extraction runs as batch job during data import
6. **Supabase as sole backend** - Auth + DB + Storage in one platform with RLS
7. **Input Validation Layer** - All mutations validated with Zod schemas (`src/lib/validation/`) before database operations. Protects against invalid data, SQL injection, and provides user-friendly error messages.
8. **Modular Server Actions** - Tracker actions split into focused modules (`src/lib/tracker/queries/` and `src/lib/tracker/mutations/`) for better organization and maintainability. Barrel export (`index.ts`) provides clean import interface.

## Data Source

**Repository**: `https://github.com/PokemonTCG/pokemon-tcg-data`

- JSON files for all cards/sets
- Downloaded and processed locally (not API) to avoid rate limits
- Card IDs format: `{setId}-{number}` (e.g., 'me1-1', 'me2-25')

**Current Database Status**:
- **20 sets** in production including Mega Evolution (me1, me2), Scarlet & Violet (sv8-sv10, sv8pt5),
  and special releases (zsv10pt5 Black Bolt, rsv10pt5 White Flare)
- **4,108+ cards** across all sets
- **6,514+ variants** (Normal, Reverse Holo, Pokéball, Masterball, etc.)
- **195+ promo cards** with metadata

**Premium Card Identification**:
- Mega Evolution & S/V: `isPremium = true` for 'Illustration Rare', 'Special Illustration Rare'
- Pre-S/V: 'Rare Ultra' requires manual tagging

**Legendary/Mythical**: Static lookup by Pokédex number (not in source data)

## Variant Rules by Era

| Era | Variants |
|-----|----------|
| Base Set | NORMAL, FIRST_EDITION, SHADOWLESS |
| Jungle - Neo | NORMAL, FIRST_EDITION |
| e-Card - B&W | NORMAL, REVERSE_HOLO |
| XY - Sun & Moon | NORMAL, REVERSE_HOLO |
| Sword & Shield | NORMAL, REVERSE_HOLO |
| Scarlet & Violet | NORMAL, REVERSE_HOLO (Commons/Uncommons/Rares only, NOT Double Rare+) |
| Prismatic Evolutions (sv8pt5) | NORMAL, REVERSE_HOLO, POKEBALL (all cards), MASTERBALL (Pokémon only) |
| Mega Evolution (2025) | NORMAL, REVERSE_HOLO (TBD) |

## Monetization Tiers

| Feature | Guest | Free | Pro ($4.99/mo) |
|---------|-------|------|----------------|
| Browse Cards | Yes | Yes | Yes |
| Card Search & Filters | Yes | Yes | Yes |
| Master Set Trackers | 1 | 1 | Unlimited |
| Custom Binders | 1 (10 pages) | 1 (10 pages) | Unlimited |
| Slot Merging (Full-Art Spreads) | No | Yes | Yes |
| Custom Image Upload | No | 5 total | Unlimited |
| ChromaDex Generation | No | 3/month | Unlimited |
| Templates | Basic | Basic | All |
| Basic Export (CSV/PNG) | No | Yes | Yes |
| Premium Export (PDF/Social) | No | No | Yes |
| Import (TCGPlayer, Collectr) | No | Yes | Yes |
| Public Binder Sharing | No | Yes | Yes |
| Ads | Yes | Yes | No |

**Pricing Options:**
- Pro Monthly: $4.99/month
- Pro Yearly: $39.99/year (33% savings)

## Development Phases (21 weeks)

| Phase | Weeks | Focus | Status | Key Deliverables |
|-------|-------|-------|--------|------------------|
| 0 | 1-2 | Foundation | ✅ COMPLETE | Next.js, Supabase, Auth, CI/CD, Data pipeline (20 sets, 4,108+ cards, 6,514+ variants) |
| 1 | 3-4 | Card Browser | ✅ COMPLETE | Grid/list views, virtual scrolling, shared filters, search, card modal, URL sync, design system unification |
| 2 | 5-7 | Master Set Tracker | ✅ COMPLETE | Visual binder, preferences, progress, variants, bulk actions, hidden promos, optimistic updates |
| 3 | 8-11 | Unified Builder Core | 🔄 IN PROGRESS | Canvas editor, card picker, drag-drop, Michi features (slot merging, custom upload) |
| 4 | 12-14 | ChromaDex Integration | ⏸️ PLANNED | Color extraction pipeline, generation algorithm, in-canvas UI |
| 5 | 15-16 | Export/Import | ⏸️ PLANNED | CSV, PNG, PDF generation, TCGPlayer/Collectr parsers |
| 6 | 17-19 | Community | ⏸️ PLANNED | Gallery, sharing, templates library, social export |
| 7 | 20-21 | Launch | ⏸️ PLANNED | Stripe, feature gating, ads, launch prep |

## Git Conventions

**Branch Strategy**:
- `master` - production (protected, always deployable)
- `develop` - integration branch for ongoing work
- `feature/*` - feature development (e.g., `feature/card-browser`, `feature/unified-builder`)
- `hotfix/*` - emergency production fixes

**Workflow**:

1. **Starting new work**:
   - Create feature branch from `develop`: `git checkout -b feature/feature-name develop`
   - For hotfixes, branch from `main`: `git checkout -b hotfix/fix-name main`

2. **During development**:
   - Commit frequently with conventional commit messages
   - Keep commits focused and atomic
   - Push to remote regularly

3. **Completing work**:
   - Ensure all tests pass and code builds
   - Merge feature branch into `develop`: `git checkout develop && git merge feature/feature-name`
   - Delete the feature branch after merge

4. **Releasing to production**:
   - When `develop` is stable, merge into `master`: `git checkout master && git merge develop`
   - Tag releases: `git tag -a v0.1.0 -m "Phase 0 complete"`

5. **Hotfixes**:
   - Merge hotfix into both `master` AND `develop`
   - Tag the fix on master

**Commit Format** (Conventional Commits):
```
feat(scope): description   # New feature
fix(scope): description    # Bug fix
docs: description          # Documentation
style: description         # Formatting
refactor: description      # Code restructuring
test: description          # Tests
chore: description         # Maintenance
```

**Scopes**: `auth`, `db`, `cards`, `binder`, `chromadex`, `michi`, `filters`, `export`, `ui`, `api`

## UI & Styling Guidelines

**Magic UI is the primary component library.** Always check for a Magic UI component before using plain Tailwind CSS.

**Component Priority**:
1. Magic UI components (buttons, cards, animations, backgrounds, text effects, etc.)
2. Custom components built with Magic UI primitives
3. Plain Tailwind CSS (only when no Magic UI equivalent exists)

**Available Magic UI Categories**:

- **Buttons**: shimmer-button, rainbow-button, shiny-button, pulsating-button, ripple-button, interactive-hover-button
- **Text Animations**: text-animate, aurora-text, number-ticker, animated-gradient-text, typing-animation, line-shadow-text, animated-shiny-text, text-reveal, hyper-text, word-rotate, scroll-based-velocity, sparkles-text, morphing-text, spinning-text
- **Backgrounds**: animated-grid-pattern, dot-pattern, ripple, retro-grid, flickering-grid, warp-background, grid-pattern, interactive-grid-pattern
- **Special Effects**: animated-beam, border-beam, shine-border, magic-card, meteors, confetti, particles, neon-gradient-card, cool-mode
- **Components**: bento-grid, animated-list, dock, marquee, file-tree, avatar-circles, terminal, hero-video-dialog, globe, tweet-card, orbiting-circles, icon-cloud, animated-circular-progress-bar, code-comparison, scroll-progress, lens, pointer
- **Device Mocks**: safari, iphone (formerly iphone-15-pro), android
- **Animations**: blur-fade

**Magic UI MCP Tools**:
- `getUIComponents` - List all available components
- `getButtons` - Button component implementations
- `getBackgrounds` - Background pattern implementations
- `getTextAnimations` - Text animation implementations
- `getSpecialEffects` - Special effect implementations
- `getComponents` - Core component implementations
- `getDeviceMocks` - Device mockup implementations
- `getAnimations` - Animation implementations

## Design System

**CRITICAL: Use unified color semantics across all features for visual consistency.**

### Color Semantics (Master Set Tracker is Source of Truth)

| Color | Usage | Tailwind Classes | Examples |
|-------|-------|------------------|----------|
| **Indigo** | Primary actions, active states, navigation highlights | `indigo-600`, `indigo-500`, `indigo-400`, `indigo-300` | Active buttons, selected filters, focus rings, navigation links |
| **Green** | Success states, owned cards, positive actions | `green-600`, `green-500` | "Mark as Owned" button, success toasts, completion indicators |
| **Emerald** | Active toggles, enabled states | `emerald-400`, `emerald-900` | Toggle switches, preference indicators |
| **Red** | Danger, destructive actions, errors | `red-600`, `red-500`, `red-400` | Delete buttons, error messages, clear filters |
| **Amber** | Warnings, promo badges, special items | `amber-500`, `amber-600` | Warning toasts, promotional card indicators |
| **Zinc** | Backgrounds, borders, neutral elements | `zinc-900`, `zinc-800`, `zinc-700`, `zinc-600`, `zinc-500`, `zinc-400` | Backgrounds, borders, disabled states, secondary text |

### Semantic Color Rules

**DO:**
- ✅ Use **indigo** for all primary actions and active states (NOT blue)
- ✅ Use **green** for success feedback and owned/completed states
- ✅ Use **red** for destructive actions and errors
- ✅ Use **zinc** grays for neutral UI elements
- ✅ Apply consistent focus rings: `focus:ring-2 focus:ring-indigo-500`

**DON'T:**
- ❌ Use blue for primary actions (outdated - replaced with indigo)
- ❌ Mix color semantics (e.g., red for success, green for danger)
- ❌ Use semantic colors for Pokémon type badges (Fire=orange, Water=blue, etc. are correct)

### Typography Patterns

**Consistent across all features:**
- Page titles: `text-3xl md:text-4xl font-bold`
- Section headers: `text-lg font-semibold`
- Button text: `text-sm font-medium`
- Metadata: `text-sm text-zinc-400`
- Labels: `text-xs text-zinc-500`

### Button Patterns

**Standard Button:**
```typescript
className="px-4 py-2.5 text-sm font-medium rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
```

**Primary Action Button:**
```typescript
className="px-4 py-2.5 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
```

**Success Button:**
```typescript
className="px-4 py-2.5 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
```

**Icon Button:**
```typescript
className="h-8 w-8 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
```

### Spacing Patterns

- Component padding: `px-4 py-3` (standard), `px-6 py-4` (large)
- Section gaps: `space-y-4` (compact), `space-y-6` (standard), `space-y-8` (spacious)
- Grid gaps: `gap-3` (tight), `gap-4` (standard), `gap-6` (loose)
- Modal content: `space-y-5` for sections, `gap-5 sm:gap-6` for flex layouts

## Important Rules

1. **Use agents extensively** - Offload exploration to Explore agents, bugs to binderdex-bug-fixer agent
2. **Run tests before committing** - `npm test` must pass before any commit. Tests are your safety net.
3. **Validate all mutations** - Use Zod schemas from `src/lib/validation/` for all server action mutations
4. **Import from tracker barrel** - Use `import { ... } from '@/lib/tracker'` for clean imports
5. **Never show variants in Browse** - only unique cards
6. **Filter system must be shared** - don't duplicate filter logic
7. **ChromaDex data is pre-computed** - colors extracted during data import, not at runtime
8. **RLS on all user tables** - enforce at database level
9. **Optimistic updates** - for responsive drag-and-drop UX
10. **URL sync for filters** - filters should be shareable via URL params
11. **Magic UI first** - always use Magic UI components before falling back to plain Tailwind CSS
12. **Unified Builder architecture** - ChromaDex and Michi share the same canvas editor

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_SITE_URL
```

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Card grid load (50 cards) | < 500ms |
| ChromaDex generation | < 3s |
