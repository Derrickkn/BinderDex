# BinderDex Codebase Inventory

**Last Updated**: December 29, 2025
**Total Tests**: 267 passing ✅
**Test Coverage**: 70%+ overall, 96%+ on critical paths

## 📊 Project Statistics

- **Total Files**: ~150 source files
- **Lines of Code**: ~15,000 (estimated)
- **Test Files**: 9 test suites
- **Configuration Files**: 17
- **Documentation Files**: 4 active + 3 archived

## 🗂️ Directory Structure

```
BinderDex/
├── .claude/                          # AI agent configurations
│   ├── agents/
│   │   └── binderdex-bug-fixer.md   # Custom bug-fixing agent
│   └── settings.local.json          # MCP servers, permissions
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI/CD
├── node_modules/                    # NPM dependencies (gitignored)
├── public/                          # Static assets
├── src/
│   ├── app/                         # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout with providers
│   │   ├── page.tsx                # Homepage
│   │   ├── api/
│   │   │   └── proxy-image/        # Image proxy route
│   │   └── tracker/
│   │       └── [setId]/
│   │           └── page.tsx        # Master Set Tracker page
│   ├── components/
│   │   ├── ErrorBoundary.tsx       # Generic error boundary
│   │   ├── providers/
│   │   │   └── QueryProvider.tsx   # React Query provider
│   │   ├── tracker/
│   │   │   ├── CardSlot.tsx        # Individual card slot (35 tests)
│   │   │   ├── BinderView.tsx      # Binder pagination view (35 tests)
│   │   │   ├── TrackerErrorFallback.tsx  # Tracker error UI
│   │   │   └── __tests__/          # Component tests
│   │   └── ui/
│   │       └── toaster.tsx         # Sonner toast wrapper
│   ├── hooks/
│   │   └── tracker/
│   │       ├── useAvailableSets.ts
│   │       ├── useCollection.ts    # 15 tests (optimistic updates)
│   │       ├── useTrackerPreferences.ts  # 7 tests
│   │       ├── useBulkActions.ts
│   │       ├── useSetVariants.ts
│   │       └── __tests__/          # Hook tests
│   ├── lib/
│   │   ├── errors.ts               # 8 custom error classes (32 tests)
│   │   ├── server-action-helpers.ts  # Validation wrappers (21 tests)
│   │   ├── supabase/
│   │   │   ├── client.ts           # Client-side Supabase
│   │   │   └── server.ts           # Server-side Supabase
│   │   ├── tracker/
│   │   │   ├── queries/            # Read operations (5 modules)
│   │   │   │   ├── sets.ts
│   │   │   │   ├── variants.ts
│   │   │   │   ├── collection.ts
│   │   │   │   ├── preferences.ts
│   │   │   │   └── promos.ts
│   │   │   ├── mutations/          # Write operations (4 modules)
│   │   │   │   ├── collection.ts
│   │   │   │   ├── preferences.ts
│   │   │   │   ├── bulk.ts
│   │   │   │   └── promos.ts
│   │   │   ├── tracker-utils.ts    # Utilities (64 tests)
│   │   │   ├── index.ts            # Barrel export
│   │   │   └── __tests__/
│   │   │       └── utils.test.ts
│   │   ├── validation/
│   │   │   ├── common.ts           # Reusable schemas
│   │   │   ├── tracker.ts          # Tracker validation
│   │   │   └── __tests__/
│   │   │       └── tracker.test.ts  # 54 validation tests
│   │   └── __tests__/              # Library tests
│   │       ├── errors.test.ts
│   │       └── server-action-helpers.test.ts
│   ├── stores/
│   │   └── trackerStore.ts         # Zustand state management
│   ├── test/
│   │   ├── setup.tsx               # Vitest configuration
│   │   ├── utils.tsx               # Test utilities
│   │   └── mockData/
│   │       └── trackerMocks.ts     # Mock data factories
│   └── types/
│       └── tracker.ts              # TypeScript types
├── Project Documents/              # Project documentation
│   ├── README.md                   # Documentation index
│   └── archive/                    # Historical documents
│       ├── REFACTORING_PLAN.md
│       ├── SESSION_SUMMARY.md
│       └── TRACKER_ENHANCEMENTS.md
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore patterns
├── CLAUDE.md                       # AI project context (42KB)
├── README.md                       # Project overview (9KB)
├── next.config.mjs                 # Next.js + Sentry config
├── package.json                    # NPM dependencies
├── sentry.client.config.ts         # Sentry browser tracking
├── sentry.server.config.ts         # Sentry server tracking
├── sentry.edge.config.ts           # Sentry edge tracking
├── tailwind.config.ts              # Tailwind CSS config
├── tsconfig.json                   # TypeScript config
└── vitest.config.ts                # Vitest test config
```

## 🧪 Test Files Coverage

| Test File | Tests | Coverage | Location |
|-----------|-------|----------|----------|
| **errors.test.ts** | 32 | 100% | `src/lib/__tests__/` |
| **server-action-helpers.test.ts** | 21 | 100% | `src/lib/__tests__/` |
| **tracker.test.ts** | 54 | 100% | `src/lib/validation/__tests__/` |
| **utils.test.ts** | 64 | 96%+ | `src/lib/tracker/__tests__/` |
| **CardSlot.test.tsx** | 35 | 100% | `src/components/tracker/__tests__/` |
| **BinderView.test.tsx** | 35 | 98% | `src/components/tracker/__tests__/` |
| **useCollection.test.tsx** | 15 | 78% | `src/hooks/tracker/__tests__/` |
| **useTrackerPreferences.test.tsx** | 7 | 97% | `src/hooks/tracker/__tests__/` |
| **utils.test.ts** (general) | 4 | High | `src/lib/__tests__/` |

**Total**: 267 tests across 9 test suites

## 📦 Key Dependencies

### Production
- **next**: 14.2.24 - React framework
- **react**: 18.3.1 - UI library
- **@tanstack/react-query**: 5.62.11 - Server state management
- **zustand**: 5.0.2 - Client state management
- **@supabase/supabase-js**: 2.47.10 - Backend client
- **zod**: 3.24.1 - Runtime validation
- **sonner**: 1.7.3 - Toast notifications
- **@sentry/nextjs**: 8.46.0 - Error tracking
- **@dnd-kit/core**: (planned) - Drag and drop
- **magic-ui**: Custom UI components

### Development
- **vitest**: 2.1.8 - Test runner
- **@testing-library/react**: 16.1.0 - Component testing
- **@testing-library/user-event**: 14.5.2 - User interaction testing
- **happy-dom**: 16.7.5 - DOM simulation
- **typescript**: 5.7.2 - Type safety
- **tailwindcss**: 3.4.17 - CSS framework
- **eslint**: 8 - Linting

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| **.env.example** | Environment variable template |
| **.eslintrc.json** | ESLint configuration |
| **.gitignore** | Git ignore patterns |
| **.mcp.json** | MCP server configuration |
| **next.config.mjs** | Next.js + Sentry webpack config |
| **package.json** | NPM dependencies and scripts |
| **postcss.config.mjs** | PostCSS configuration |
| **sentry.*.config.ts** | Sentry error tracking (3 files) |
| **tailwind.config.ts** | Tailwind CSS configuration |
| **tsconfig.json** | TypeScript compiler options |
| **vercel.json** | Vercel deployment config |
| **vitest.config.ts** | Vitest test configuration |

## 📝 Documentation Files

### Active (Root Level)
- **README.md** - Project overview, quick start
- **CLAUDE.md** - Comprehensive AI context
- **.env.example** - Setup template

### Archived (Project Documents/archive/)
- **REFACTORING_PLAN.md** - Complete refactoring roadmap (all phases ✅)
- **SESSION_SUMMARY.md** - Error handling implementation notes
- **TRACKER_ENHANCEMENTS.md** - UX enhancements documentation

## 🗄️ Supabase Schema

### Core Tables
- **sets** - TCG set metadata (20 sets)
- **cards** - Card data (4,108+ cards)
- **card_variants** - Variant types (6,514+ variants)
- **promo_cards** - Promotional cards (195+)

### User Tables
- **user_profiles** - User accounts
- **user_collections** - Owned cards
- **user_promo_preferences** - Hidden promos
- **master_set_preferences** - Tracker preferences
- **subscriptions** - Stripe subscriptions

### Future (Not Yet Implemented)
- **binders** - Custom binder creations
- **binder_pages** - Binder page layouts
- **binder_slots** - Individual card slots
- **binder_templates** - Pre-built templates
- **custom_images** - User-uploaded images
- **card_colors** - ChromaDex color data

## 🎯 Current Status

**Phase**: Ready for new feature development
**Branch**: develop
**Last Major Update**: Error handling system (Dec 28, 2025)

### Completed Phases
- ✅ Phase 0: Foundation (Next.js, Supabase, Auth)
- ✅ Phase 2: Master Set Tracker (fully implemented)
- ✅ Testing Infrastructure (267 tests)
- ✅ Input Validation (Zod schemas)
- ✅ File Organization (modular structure)
- ✅ Error Handling (custom errors, toast, Sentry)

### Next Up
- Phase 1: Card Database Browser
- Phase 3: Unified Binder Builder (ChromaDex + Michi Mode)

## 📊 Code Quality Metrics

- **Test Coverage**: 70%+ overall
- **Critical Path Coverage**: 96%+
- **Max File Size**: <300 lines (after refactoring)
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint configured
- **CI/CD**: GitHub Actions on every push

---

**Generated**: December 29, 2025
**Refactoring Status**: ✅ All critical phases complete
