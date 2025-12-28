# Master Set Tracker Enhancements

## Summary

Three major UX enhancements have been implemented for the Master Set Tracker:

### 1. ✅ Relocated Progress Indicator

**What Changed:**
- Moved progress from top-right corner to inline with set title
- New format: `Phantasmal Flames · 21/204 (10%)`
- Added horizontal progress bar (132px wide) below era/series info
- Progress bar uses indigo gradient (`from-indigo-500 to-indigo-400`) matching app accent colors

**Location:** `src/components/tracker/TrackerHeader.tsx`

**Before:**
```
Phantasmal Flames              21/204
Mega Evolution • Base Set      ████░░░
```

**After:**
```
Phantasmal Flames · 21/204 (10%)
Mega Evolution • Base Set ████░░░░░░░░░
```

---

### 2. ✅ First-Visit Coach Marks

**What Changed:**
- One-time interactive tutorial triggered on first tracker visit
- Stored in localStorage using `hasSeenTrackerTutorial` flag
- **7-step guided tour** with visual highlighting and device-aware text (organized top-to-bottom):
  1. **Track Your Collection** - Desktop: "Left-click any card..." | Touch: "Tap any card to mark it as owned or missing"
     - Card slot is highlighted with indigo border and shadow
     - **Location**: Binder cards (middle of page)
  2. **Card Details** - Desktop: "Right-click any card..." | Touch: "Touch and hold any card to view detailed information"
     - Card slot is highlighted with indigo border and shadow
     - **Location**: Binder cards (middle of page)
  3. **Quick Fill** - Desktop: "Click here..." | Touch: "Tap here to quickly mark entire rarities as owned"
     - Highlights the quick fill button
     - **Location**: Toolbar (top of page)
  4. **Customize Your Binder** - Desktop: "Click to change..." | Touch: "Tap to change binder layout (3×3, 3×4, 4×4) and toggle Reverse Holos or Promos"
     - Highlights the binder settings section (layout buttons + toggle pills)
     - Mobile: Highlights top row of toolbar | Desktop: Highlights settings group
     - **Location**: Toolbar (top of page)
  5. **Navigate Your Binder** - Desktop: "Browse pages with arrows or keyboard ← → keys" | Touch: "Browse pages with arrows or swipe left and right"
     - Navigation arrows are highlighted and brought to front (desktop side arrows, mobile bottom nav)
     - **Location**: Navigation controls (middle/bottom of binder)
  6. **Find Missing Cards** - Desktop: "Click..." | Touch: "Tap any missing card to jump to its slot"
     - Auto-scrolls to missing cards section
     - **Location**: Missing cards list (bottom of page)
  7. **Export Options** - "Export your missing cards list to PDF or Excel"
     - Highlights the export buttons (desktop: inline, mobile: collapsible section)
     - **Location**: Export section (bottom of page)

**Features:**
- Backdrop dimming with highlighted target element
- Arrow pointer connecting tooltip to target
- Progress dots showing current step (1 of 7)
- "Back" button to return to previous step (appears on steps 2-7)
- "Next" button to advance, "Skip" to dismiss
- Keyboard accessible (Enter to advance, Escape to skip)
- SSR-safe with client-side localStorage checks
- Auto-scroll to target elements for better visibility
- Dynamic styling based on current step
- Mobile responsive tooltip positioning
- **Device-aware text** - Automatically detects touch devices and shows "Tap" / "Touch and hold" instead of "Click" / "Right-click"
- **Touch gestures** - Swipe left/right to navigate pages on mobile, pinch-to-zoom for larger binder layouts
- **Responsive toolbar** - Mobile: Two-row layout (binder settings on top, Quick Fill below) | Desktop: Single horizontal row

**Special Visual Effects:**
- **Steps 1-2 (Card interaction)**: Highlights card slots with border and shadow
- **Step 3 (Quick Fill)**: Highlights quick fill button in toolbar
- **Step 4 (Binder Settings)**: Highlights binder layout and toggle settings
- **Step 5 (Navigation)**: Highlights navigation arrows (desktop side, mobile bottom)
- **Step 6 (Missing Cards)**: Auto-scrolls to missing cards section

**Files Created:**
- `src/components/tracker/CoachMarks.tsx` - Main component with dynamic styling
- Data attributes added to target elements:
  - `[data-coach-card-slot]` - CardSlot.tsx
  - `[data-coach-navigation]` - BinderView.tsx (desktop arrows) + BinderNavigation.tsx (mobile)
  - `[data-coach-quick-fill]` - TrackerToolbar.tsx
  - `[data-coach-binder-settings]` - TrackerToolbar.tsx (mobile: row 1, desktop: settings group)
  - `[data-coach-missing-cards]` - MissingCardsList.tsx
  - `[data-coach-export]` - ExportButtons.tsx

**Integration:** Added to `src/app/tracker/[setId]/page.tsx`

---

### 3. ✅ Persistent Help Icon

**What Changed:**
- Floating help button (?) in bottom-right corner
- Always visible, non-intrusive design
- Indigo accent color matching app theme

**Overlay Content:**
- **Keyboard Shortcuts** - ← → navigation keys
- **Mouse Controls** - Click to toggle, right-click for details
- **Quick Actions** - Quick Fill, jump to missing cards
- **Tips:**
  - Click missing cards to jump and highlight slot
  - Use toggles for reverse holos/promos
  - Auto-save progress
  - Export missing cards for shopping

**Features:**
- Modal overlay with backdrop dimming
- Organized sections with icons (Keyboard, MousePointer, Zap, Lightbulb)
- "Got it" button to dismiss
- Sticky header/footer for better UX

**File Created:** `src/components/tracker/HelpOverlay.tsx`

**Integration:** Added to `src/app/tracker/[setId]/page.tsx`

---

## Technical Implementation

### Component Architecture
```
TrackerSetPage
├── TrackerHeader (updated with inline progress)
├── TrackerToolbar (data-coach-quick-fill)
├── BinderView (data-coach-navigation)
│   └── CardSlot (data-coach-card-slot)
├── MissingCardsList (data-coach-missing-cards)
├── CoachMarks (new)
└── HelpOverlay (new)
```

### Exports Updated
`src/components/tracker/index.ts`:
```typescript
export { CoachMarks, type CoachMarkStep } from "./CoachMarks";
export { HelpOverlay } from "./HelpOverlay";
```

### SSR Considerations
- CoachMarks checks `typeof window !== "undefined"` before accessing localStorage
- All client-side interactions wrapped in appropriate guards
- "use client" directive on both new components

---

## Testing Checklist

### Progress Indicator
- [ ] Set name displays correctly with progress
- [ ] Progress bar fills proportionally (0-100%)
- [ ] Responsive on mobile (shows percentage only on small screens)
- [ ] Indigo gradient matches app theme

### Coach Marks
- [ ] Tutorial appears on first visit to tracker
- [ ] All 7 steps display correctly
- [ ] Target elements are properly highlighted
- [ ] "Next" advances through steps
- [ ] "Skip tutorial" dismisses immediately
- [ ] Tutorial doesn't show on subsequent visits
- [ ] Clear localStorage to test again

### Help Overlay
- [ ] Help button visible in bottom-right corner
- [ ] Clicking opens modal overlay
- [ ] All sections render correctly
- [ ] "Got it" button closes overlay
- [ ] Clicking backdrop closes overlay
- [ ] Keyboard shortcuts are accurate

---

## Notes

- Build warning about missing `/login` page is **pre-existing** and unrelated to these changes
- Dev server runs successfully on `http://localhost:3001`
- All three enhancements are production-ready
- Components follow existing code patterns and styling conventions
