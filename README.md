# BinderDex 🎴

A comprehensive Pokémon TCG collection management web application featuring visual master set tracking, custom binder building, and algorithmic page generation.

## Quick Start

### Development Server
```bash
# Standard dev mode (errors shown in terminal)
npm run dev

# Dev mode with logging to file (for debugging)
npm run dev:log  # Creates dev.log file

# View recent errors from log
Get-Content dev.log -Tail 50
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Watch mode (tests re-run on save)
npm test -- --watch
```

**Current Test Coverage:** 267 tests across error handling, validation, utilities, components, and hooks.

### Database Operations
```bash
# Import card data from pokemon-tcg-data
npm run db:import

# Import sets only
npm run db:import:sets

# Extract color data for ChromaDex
npm run db:colors

# Generate TypeScript types from Supabase
npm run db:generate-types
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes with Particles background
│   ├── tracker/           # Master Set Tracker pages
│   └── layout.tsx         # Root layout with QueryProvider + ErrorBoundary
├── components/
│   ├── tracker/           # Tracker-specific components
│   ├── ui/                # Reusable UI components
│   ├── providers/         # React Context providers
│   └── ErrorBoundary.tsx  # Global error boundary
├── hooks/
│   └── tracker/           # React Query hooks for tracker features
├── lib/
│   ├── errors.ts          # Custom error classes (8 types)
│   ├── server-action-helpers.ts  # Validation wrappers + error mapping
│   ├── supabase/          # Supabase client setup
│   ├── tracker/           # Tracker business logic
│   │   ├── mutations/     # Server actions (create/update/delete)
│   │   ├── queries/       # Server actions (read)
│   │   └── utils.ts       # Pure utility functions
│   ├── types/             # TypeScript type definitions
│   └── validation/        # Zod schemas for input validation
└── test/                  # Test utilities and mocks
```

## Key Features Implemented

### ✅ Master Set Tracker (Phase 2 Complete)
- Visual binder layout (9-slot, 12-slot, 16-slot configurations)
- Variant support (Normal, Reverse Holo, Pokéball, Masterball, First Edition)
- Optimistic updates with rollback
- Hidden promos management
- Bulk actions (mark by rarity, mark all, clear all)
- Progress tracking with completion percentage
- Pagination-based navigation

### ✅ Error Handling System (Phase 4 Complete)
- **8 Custom Error Classes** - Type-safe errors with user-friendly messages
- **Toast Notifications** - Sonner library for all mutation feedback
- **Error Boundaries** - Prevent crashes, show recovery UI
- **Query Error States** - Retry UI for failed data fetches
- **Sentry Integration** - Production error tracking (configured, needs DSN)
- **267 Tests** - Comprehensive coverage of error handling, validation, and business logic

### 🚧 In Progress
- Card Database Browser
- Unified Binder Builder (ChromaDex + Michi Mode)

## Environment Variables

Create `.env.local` with these variables (see `.env.example`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://unwqvvdlmbrppfytpeyo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Sentry (Optional - for production error tracking)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=binderdex
SENTRY_AUTH_TOKEN=your-auth-token
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 (App Router) | React framework with SSR |
| Language | TypeScript | Type safety |
| Database | Supabase PostgreSQL | Backend + Auth + Storage |
| State Management | Zustand + React Query | Client + Server state |
| Styling | Magic UI + Tailwind CSS | Component library + utility CSS |
| Validation | Zod | Runtime type validation |
| Testing | Vitest + @testing-library/react | Unit + integration tests |
| Toast Notifications | Sonner | User feedback for mutations |
| Error Tracking | Sentry | Production error monitoring |
| Drag & Drop | @dnd-kit/core | Accessible drag-drop |

## Documentation

**For comprehensive development guidelines, see [CLAUDE.md](./CLAUDE.md):**
- Agent Usage Guidelines (Explore, Bug Fixer, Plan agents)
- Error Handling (Custom errors, toast patterns, Sentry setup)
- Testing Guidelines (Coverage thresholds, test patterns, mocking)
- Code Architecture (Validation layer, optimistic updates, RLS)
- Git Conventions (Branching strategy, commit format)
- Database Schema (Sets, cards, variants, user collections)

## Supabase Project

**Project ID:** `unwqvvdlmbrppfytpeyo`
**Region:** ap-northeast-1
**Database:** PostgreSQL with Row Level Security

Use this project ID for all Supabase MCP operations.

## Common Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run dev:log          # Start dev server with logging to dev.log
npm run build            # Production build
npm run start            # Start production server

# Testing
npm test                 # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Run tests with coverage report

# Database
npm run db:import        # Import all card data
npm run db:import:sets   # Import sets only
npm run db:colors        # Extract color data for ChromaDex
npm run db:generate-types # Generate TypeScript types from Supabase

# Code Quality
npm run lint             # Run ESLint
```

## Recent Updates (December 2024)

### Error Handling System Implementation
- Created 8 custom error classes with user-friendly messages
- Added toast notifications to all 12 mutations
- Implemented error boundaries at root and tracker levels
- Added query error states with retry UI
- Configured Sentry for production error tracking
- Added 107 new tests (160 → 267 total)
- Updated CLAUDE.md with comprehensive error handling guide

### Files Added
- `src/lib/errors.ts` - Custom error class hierarchy
- `src/lib/__tests__/errors.test.ts` - Error class tests (32 tests)
- `src/lib/__tests__/server-action-helpers.test.ts` - Error mapping tests (21 tests)
- `src/lib/validation/__tests__/tracker.test.ts` - Validation tests (54 tests)
- `src/components/ErrorBoundary.tsx` - Generic error boundary
- `src/components/tracker/TrackerErrorFallback.tsx` - Tracker error UI
- `src/components/ui/toaster.tsx` - Sonner toast wrapper
- `sentry.client.config.ts` - Browser error tracking
- `sentry.server.config.ts` - Server error tracking
- `sentry.edge.config.ts` - Edge runtime error tracking
- `.env.example` - Environment variable template

### Files Modified
- All hooks in `src/hooks/tracker/` - Added toast notifications
- All mutations in `src/lib/tracker/mutations/` - Throw custom errors
- `src/lib/server-action-helpers.ts` - Enhanced error mapping
- `src/app/layout.tsx` - Added Toaster component
- `src/app/tracker/[setId]/page.tsx` - Added error boundary + query error handling
- `src/components/providers/QueryProvider.tsx` - Wrapped with ErrorBoundary
- `src/test/setup.tsx` - Mock sonner for tests
- `next.config.mjs` - Sentry webpack plugin
- `package.json` - Added `dev:log` script
- `.gitignore` - Added dev.log

## Known Issues

- ⚠️ **Button component missing**: ErrorBoundary components now use native HTML buttons styled with Tailwind (fixed)
- ℹ️ **Sentry not active**: Needs DSN from Sentry.io account (optional for local dev)

## Next Steps

1. **Set up Sentry** (optional but recommended for production):
   - Create account at https://sentry.io/signup/
   - Create Next.js project
   - Add DSN to `.env.local`

2. **Continue with Phase 3**: Card Database Browser
   - Implement browse cards page
   - Add shared filter system
   - Integrate with existing tracker

3. **Phase 4**: Unified Binder Builder
   - ChromaDex algorithmic generation
   - Michi Mode custom layouts
   - Shared canvas editor

## Support

For questions or issues:
- Check [CLAUDE.md](./CLAUDE.md) for detailed documentation
- Review test files for usage examples
- Use `npm run dev:log` to capture errors for debugging

---

**Status**: Active Development
**Current Phase**: Phase 2 Complete (Master Set Tracker)
**Test Coverage**: 267 tests, ~47% overall (70%+ on business logic)
**Last Updated**: December 2024
