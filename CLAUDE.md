# BinderDex - Project Context

## Overview

BinderDex is a Pokémon TCG collection management web application. The flagship feature is **ChromaDex**, an AI-powered binder page generator that creates aesthetically cohesive layouts based on color analysis and thematic tagging.

**Status**: In Development (Solo developer + Claude Code)

## Bug Fixing

When the user reports an error, bug, or unexpected behavior in the application, **always use the `binderdex-bug-fixer` agent** to diagnose and fix the issue. This includes:
- Runtime errors and exceptions
- Failed API calls or database queries
- Supabase/RLS issues
- Stripe integration problems
- Claude API failures
- UI rendering bugs
- Filter system issues
- Drag-and-drop problems
- Any deviation from expected behavior

The bug-fixer agent has full context of the BinderDex architecture and can trace through the codebase to identify root causes.

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 14 | App Router, Server Components |
| Language | TypeScript | Strict mode enabled |
| Styling | Magic UI (primary) + Tailwind CSS (fallback) | Use Magic UI components first |
| State | Zustand + React Query | Client + server state |
| Database | Supabase PostgreSQL | With Row Level Security |
| Auth | Supabase Auth | Email only (OAuth later) |
| Storage | Supabase Storage | Card images, exports |
| Hosting | Vercel | Preview deployments on PRs |
| Payments | Stripe | Subscriptions + webhooks |
| AI | Claude API | Card tagging for ChromaDex |

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
| Main Branch | main | Production branch |

## Core Features

### 1. Card Database Browser
- Displays **unique cards only** (NO variants in browse view)
- Shared filter system: text search, set, era, type, rarity, generation, supertype, premium/legendary/mythical toggles
- Responsive grid with infinite scroll and virtualization
- Card detail modal with zoom, metadata, and actions

### 2. Master Set Tracker
- **Visual binder representation** showing what user's physical binder should look like
- Variants (Normal, Reverse Holo, First Edition, etc.) are ONLY shown here
- Slot configurations: 9 (3×3), 12 (3×4), 16 (4×4)
- Dynamic preferences: toggle promos, toggle reverse holos
- Visual states: Owned (full image) vs Missing (greyed placeholder)

### 3. Binder Builder
- **Split-panel layout**: Card Picker (left) + Binder Canvas (right)
- Card Picker uses same filter system as Browse
- Drag-and-drop with @dnd-kit/core
- Page navigation, add/remove pages
- Auto-save with debounce

### 4. ChromaDex (Flagship Feature)
- Uses **same filter system** as Browse Cards
- Generation modes: Color (dominant/palette/harmony), Theme, Hybrid
- Pre-computed data: color extraction (node-vibrant) + AI tagging (Claude Vision)
- Scoring: CIEDE2000 color distance + tag matching + diversity bonus
- Usage limits: Guest=0, Free=3/month, Pro=Unlimited

### 5. Export/Import
- Basic Export (Free): CSV/JSON
- Premium Export (Pro): PDF with card images
- Import: TCGPlayer, Collectr, custom CSV

## Database Schema

### Core Tables
```
sets: id, name, series, era, printed_total, total, release_date, has_reverse_holos, logo_url, symbol_url

cards: id, set_id, name, number, rarity, supertype, subtypes[], types[], hp, artist,
       national_dex_numbers[], image_small, image_large, is_promo, is_premium,
       is_legendary, is_mythical, generation

card_variants: id, card_id, variant_type (NORMAL, REVERSE_HOLO, FIRST_EDITION, etc.), image_url
```

### ChromaDex Tables
```
card_colors: id, card_id, dominant_hex, dominant_hsl, palette, brightness, saturation, warmth

card_tags: id, card_id, tag, category (THEME, SETTING, MOOD, COMPOSITION, SUBJECT), confidence
```

### User Tables
```
user_profiles: id (= auth.users.id), email, display_name, avatar_url, tier,
               chromadex_uses_this_month, chromadex_reset_date

user_collections: id, user_id, variant_id, quantity, condition, notes, acquired_date

subscriptions: id, user_id, stripe_customer_id, stripe_sub_id, status, current_period_end
```

### Binder Tables
```
binders: id, user_id, name, description, slot_config, type (CUSTOM/MASTER_SET/CHROMADEX),
         master_set_id, is_public, is_curated

binder_pages: id, binder_id, page_number

binder_slots: id, page_id, position, variant_id (nullable)

master_set_preferences: id, user_id, set_id, slot_config, include_promos, include_reverse_holos
```

## Key Architectural Decisions

1. **Variants only in Master Set Tracker** - Browse shows unique cards only to keep counts accurate
2. **Shared filter system** - ONE reusable filter component/hook/store used by Browse, Builder, and ChromaDex
3. **Pre-computed ChromaDex data** - Color extraction and AI tagging run as batch jobs during import
4. **Supabase as sole backend** - Auth + DB + Storage in one platform with RLS

## Data Source

**Repository**: `https://github.com/PokemonTCG/pokemon-tcg-data`

- JSON files for all cards/sets
- Downloaded and processed locally (not API) to avoid rate limits
- Card IDs format: `{setId}-{number}` (e.g., 'sv1-1', 'mee1-25')

**Initial Target Sets**: Mega Evolution Base Set & Phantasmal Flames (2025 series)

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
| Mega Evolution (2025) | NORMAL, REVERSE_HOLO (TBD) |

## Monetization Tiers

| Feature | Guest | Free | Pro ($4.99/mo) |
|---------|-------|------|----------------|
| Browse Cards | Yes | Yes | Yes |
| Master Set Trackers | 1 | 1 | Unlimited |
| Custom Binders | 1 (10 pages) | 1 (10 pages) | Unlimited |
| ChromaDex | No | 3/month | Unlimited |
| Basic Export (CSV) | No | Yes | Yes |
| Premium Export (PDF) | No | No | Yes |
| Import | No | Yes | Yes |
| Ads | Yes | Yes | No |

## Development Phases

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| 0 | Foundation | Next.js, Supabase, Auth, CI/CD, Data pipeline |
| 1 | Card Browser | Grid view, shared filters, search, card modal |
| 2 | Master Set Tracker | Visual binder, preferences, progress, variants |
| 3 | Binder Builder | Split-panel, card picker, drag-drop |
| 4 | ChromaDex | Color extraction, AI tagging, generation UI |
| 5 | Export/Import | CSV, PDF, TCGPlayer/Collectr parsers |
| 6 | Community | Gallery, sharing, curated binders, polish |
| 7 | Launch | Stripe, feature gating, ads |

## Git Conventions

**Branch Strategy**:
- `main` - production (protected, always deployable)
- `develop` - integration branch for ongoing work
- `feature/*` - feature development (e.g., `feature/card-browser`, `feature/chromadex-ui`)
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
   - When `develop` is stable, merge into `main`: `git checkout main && git merge develop`
   - Tag releases: `git tag -a v0.1.0 -m "Phase 0 complete"`

5. **Hotfixes**:
   - Merge hotfix into both `main` AND `develop`
   - Tag the fix on main

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

**Scopes**: `auth`, `db`, `cards`, `binder`, `chromadex`, `filters`, `export`, `ui`, `api`

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

## Important Rules

1. **Never show variants in Browse** - only unique cards
2. **Filter system must be shared** - don't duplicate filter logic
3. **ChromaDex data is pre-computed** - don't call AI at generation time
4. **RLS on all user tables** - enforce at database level
5. **Optimistic updates** - for responsive drag-and-drop UX
6. **URL sync for filters** - filters should be shareable via URL params
7. **Magic UI first** - always use Magic UI components before falling back to plain Tailwind CSS
8. **Use binderdex-bug-fixer agent** - when user reports errors or bugs, use this agent to diagnose and fix

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
ANTHROPIC_API_KEY
DATABASE_URL
```

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Card grid load (50 cards) | < 500ms |
| ChromaDex generation | < 3s |
