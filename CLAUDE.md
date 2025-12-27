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

### 1. Card Database Browser

**Key Clarification**: Browse Cards displays unique cards only - no variants. This keeps card counts accurate and UI clean. Variants are only relevant in Master Set Tracker.

- Displays **unique cards only** (NO variants in browse view)
- Shared filter system: text search, set, era, type, rarity, generation, supertype, premium/legendary/mythical toggles
- Responsive grid with infinite scroll and virtualization
- Card detail modal with zoom, metadata, and actions

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

| Phase | Weeks | Focus | Key Deliverables |
|-------|-------|-------|------------------|
| 0 | 1-2 | Foundation | Next.js, Supabase, Auth, CI/CD, Data pipeline |
| 1 | 3-4 | Card Browser | Grid view, shared filters, search, card modal |
| 2 | 5-7 | Master Set Tracker | Visual binder, preferences, progress, variants |
| 3 | 8-11 | Unified Builder Core | Canvas editor, card picker, drag-drop, Michi features (slot merging, custom upload) |
| 4 | 12-14 | ChromaDex Integration | Color extraction pipeline, generation algorithm, in-canvas UI |
| 5 | 15-16 | Export/Import | CSV, PNG, PDF generation, TCGPlayer/Collectr parsers |
| 6 | 17-19 | Community | Gallery, sharing, templates library, social export |
| 7 | 20-21 | Launch | Stripe, feature gating, ads, launch prep |

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

## Important Rules

1. **Use agents extensively** - Offload exploration to Explore agents, bugs to binderdex-bug-fixer agent
2. **Never show variants in Browse** - only unique cards
3. **Filter system must be shared** - don't duplicate filter logic
4. **ChromaDex data is pre-computed** - colors extracted during data import, not at runtime
5. **RLS on all user tables** - enforce at database level
6. **Optimistic updates** - for responsive drag-and-drop UX
7. **URL sync for filters** - filters should be shareable via URL params
8. **Magic UI first** - always use Magic UI components before falling back to plain Tailwind CSS
9. **Unified Builder architecture** - ChromaDex and Michi share the same canvas editor

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
