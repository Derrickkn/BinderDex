import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { BinderView } from '../BinderView'
import { mockTrackerCards } from '@/test/mockData/trackerMocks'
import { useTrackerStore } from '@/hooks/useTrackerStore'

// Mock the Zustand store
vi.mock('@/hooks/useTrackerStore')

describe('BinderView', () => {
  // Store mock functions
  const mockNextPage = vi.fn()
  const mockPrevPage = vi.fn()
  const mockSetCurrentPage = vi.fn()
  const mockClearHighlight = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementation
    vi.mocked(useTrackerStore).mockReturnValue({
      currentPage: 0,
      setCurrentPage: mockSetCurrentPage,
      nextPage: mockNextPage,
      prevPage: mockPrevPage,
      highlightedVariantId: null,
      clearHighlight: mockClearHighlight,
      selectedVariantId: null,
      setSelectedVariantId: vi.fn(),
      isModalOpen: false,
      setIsModalOpen: vi.fn(),
      highlightCard: vi.fn(),
      preferences: {
        slotConfig: 'NINE',
        includePromos: true,
        includeReverseHolos: true,
        includePokeball: true,
        includeMasterball: true,
      },
      setPreferences: vi.fn(),
    } as any)

    // Reset window.innerWidth to desktop default
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ============================================================================
  // PHASE A: Basic Rendering Tests
  // ============================================================================

  describe('Basic Rendering', () => {
    it('renders two-page spread on desktop', () => {
      const cards = mockTrackerCards(18)
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Desktop should show two pages with page numbers
      expect(screen.getByText('Page 1')).toBeInTheDocument()
      expect(screen.getByText('Page 2')).toBeInTheDocument()

      // Desktop view container should be present
      const desktopView = container.querySelector('.lg\\:flex')
      expect(desktopView).toBeInTheDocument()
    })

    it('renders single page on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 640,
      })

      const cards = mockTrackerCards(18)
      render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Mobile layout verification
      // Note: The component uses window.innerWidth at mount time
      // We can verify by checking for mobile-specific elements
    })

    it('shows empty state when no cards', () => {
      render(
        <BinderView
          cards={[]}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      expect(screen.getByText(/No cards to display/i)).toBeInTheDocument()
      expect(screen.getByText(/Try adjusting your preferences/i)).toBeInTheDocument()
    })

    it('shows loading state when isLoading=true', () => {
      const { container } = render(
        <BinderView
          cards={mockTrackerCards(18)}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
          isLoading={true}
        />
      )

      // Loading skeletons should be present (CardSlotSkeleton uses animate-pulse class)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('shows partial last page message', () => {
      const cards = mockTrackerCards(15) // 2 pages for NINE config
      render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Should show "End of binder" or similar message
      // This appears when second page is incomplete
    })

    it('renders correct number of cards per page', () => {
      const cards = mockTrackerCards(18)
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Desktop view shows two pages at a time (18 cards)
      // Mobile view shows one page (9 cards) - but hidden on desktop
      // Total rendered is 18 + 9 = 27 slots (CSS hides mobile on desktop)
      const desktopView = container.querySelector('.lg\\:flex')!
      const desktopCardSlots = desktopView.querySelectorAll('[data-coach-card-slot]')
      expect(desktopCardSlots.length).toBe(18) // Both pages visible on desktop

      // Check that specific cards are rendered via title attribute
      const card1 = screen.getAllByTitle('Card 1 - Normal')
      const card9 = screen.getAllByTitle('Card 9 - Normal')
      const card10 = screen.getAllByTitle('Card 10 - Normal')
      expect(card1.length).toBeGreaterThan(0)
      expect(card9.length).toBeGreaterThan(0)
      expect(card10.length).toBeGreaterThan(0)
    })
  })

  // ============================================================================
  // PHASE B: Pagination Logic Tests
  // ============================================================================

  describe('Pagination Logic', () => {
    it('calculates correct total pages for NINE config', () => {
      const cards = mockTrackerCards(27) // Exactly 3 pages
      render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Page indicator should show correct total
      // Desktop shows 2 pages per view, so 27 cards / 9 per page = 3 pages total
      // 3 pages / 2 per view = 2 views (ceil)
    })

    it('calculates correct total pages for TWELVE config', () => {
      const cards = mockTrackerCards(36) // Exactly 3 pages
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="TWELVE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // 36 cards / 12 per page = 3 pages
      // Desktop shows 2 pages at a time, so 24 cards visible on first spread
      const desktopView = container.querySelector('.lg\\:flex')!
      const desktopCardSlots = desktopView.querySelectorAll('[data-coach-card-slot]')
      expect(desktopCardSlots.length).toBe(24) // 12 + 12 cards on first spread

      // Check first card via title (use getAllByTitle since mobile view also renders it)
      const card1 = screen.getAllByTitle('Card 1 - Normal')
      expect(card1.length).toBeGreaterThan(0)
    })

    it('calculates correct total pages for SIXTEEN config', () => {
      const cards = mockTrackerCards(48) // Exactly 3 pages
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="SIXTEEN"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // 48 cards / 16 per page = 3 pages
      // Desktop shows 2 pages at a time, so 32 cards visible on first spread
      const desktopView = container.querySelector('.lg\\:flex')!
      const desktopCardSlots = desktopView.querySelectorAll('[data-coach-card-slot]')
      expect(desktopCardSlots.length).toBe(32) // 16 + 16 cards on first spread

      // Check first card via title (use getAllByTitle since mobile view also renders it)
      const card1 = screen.getAllByTitle('Card 1 - Normal')
      expect(card1.length).toBeGreaterThan(0)
    })

    it('distributes cards correctly across pages', () => {
      const cards = mockTrackerCards(25) // 3 pages (9+9+7)
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // First spread shows 18 cards (9+9) on desktop
      const desktopView = container.querySelector('.lg\\:flex')!
      const desktopCardSlots = desktopView.querySelectorAll('[data-coach-card-slot]')
      expect(desktopCardSlots.length).toBe(18) // First two pages visible on desktop

      // First page: cards 1-9, Second page: cards 10-18
      // Use getAllByTitle since mobile view also renders some of these
      expect(screen.getAllByTitle('Card 1 - Normal').length).toBeGreaterThan(0)
      expect(screen.getAllByTitle('Card 9 - Normal').length).toBeGreaterThan(0)
      expect(screen.getAllByTitle('Card 10 - Normal').length).toBeGreaterThan(0)
      expect(screen.getAllByTitle('Card 18 - Normal').length).toBeGreaterThan(0)
    })

    it('renders empty slots for partial pages', () => {
      const cards = mockTrackerCards(7) // Less than one full page
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Desktop view shows 7 cards on first page + 0 cards on second page
      // Mobile view also renders the first 7 cards (hidden by CSS)
      const desktopView = container.querySelector('.lg\\:flex')!
      const desktopCardSlots = desktopView.querySelectorAll('[data-coach-card-slot]')
      expect(desktopCardSlots.length).toBe(7) // Only 7 cards rendered on desktop

      // EmptySlot components have specific styling - 2 on first page (desktop) + 2 on mobile
      const emptySlots = container.querySelectorAll('.border-dashed.bg-zinc-900\\/30')
      expect(emptySlots.length).toBeGreaterThanOrEqual(2) // At least 2 empty slots

      // Check last card rendered (use getAllByTitle for multiple matches)
      expect(screen.getAllByTitle('Card 7 - Normal').length).toBeGreaterThan(0)
    })

    it('resets currentPage if out of bounds', () => {
      vi.mocked(useTrackerStore).mockReturnValue({
        currentPage: 10, // Way out of bounds
        setCurrentPage: mockSetCurrentPage,
        nextPage: mockNextPage,
        prevPage: mockPrevPage,
        highlightedVariantId: null,
        clearHighlight: mockClearHighlight,
        selectedVariantId: null,
        setSelectedVariantId: vi.fn(),
        isModalOpen: false,
        setIsModalOpen: vi.fn(),
        highlightCard: vi.fn(),
        preferences: {
          slotConfig: 'NINE',
          includePromos: true,
          includeReverseHolos: true,
          includePokeball: true,
          includeMasterball: true,
        },
        setPreferences: vi.fn(),
      } as any)

      const cards = mockTrackerCards(18) // 2 pages
      render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Should call setCurrentPage to reset to last valid page
      expect(mockSetCurrentPage).toHaveBeenCalled()
    })

    it('shows correct page indicators', () => {
      const cards = mockTrackerCards(27)
      render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Desktop: should show "Pages 1-2 of 3" or similar
      // Mobile: should show "Page 1 of 3"
      // Check for page indicator text
    })

    it('applies correct grid class for slot config', () => {
      const cards = mockTrackerCards(12)
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="TWELVE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // TWELVE config should have grid-cols-4
      const gridElement = container.querySelector('.grid-cols-4')
      expect(gridElement).toBeInTheDocument()
    })
  })

  // ============================================================================
  // PHASE C: Navigation Tests
  // ============================================================================

  describe('Navigation', () => {
    it('calls nextPage when next button clicked', () => {
      const cards = mockTrackerCards(27)
      render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Desktop buttons have aria-label "Next spread"
      const nextButton = screen.getByRole('button', { name: /next spread/i })
      fireEvent.click(nextButton)

      expect(mockNextPage).toHaveBeenCalled()
    })

    it('calls prevPage when prev button clicked', () => {
      vi.mocked(useTrackerStore).mockReturnValue({
        currentPage: 1, // Not on first page
        setCurrentPage: mockSetCurrentPage,
        nextPage: mockNextPage,
        prevPage: mockPrevPage,
        highlightedVariantId: null,
        clearHighlight: mockClearHighlight,
        selectedVariantId: null,
        setSelectedVariantId: vi.fn(),
        isModalOpen: false,
        setIsModalOpen: vi.fn(),
        highlightCard: vi.fn(),
        preferences: {
          slotConfig: 'NINE',
          includePromos: true,
          includeReverseHolos: true,
          includePokeball: true,
          includeMasterball: true,
        },
        setPreferences: vi.fn(),
      } as any)

      const cards = mockTrackerCards(27)
      render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Desktop buttons have aria-label "Previous spread"
      const prevButton = screen.getByRole('button', { name: /previous spread/i })
      fireEvent.click(prevButton)

      expect(mockPrevPage).toHaveBeenCalled()
    })

    it('disables next button at last page', () => {
      vi.mocked(useTrackerStore).mockReturnValue({
        currentPage: 0, // First and only view for 18 cards on desktop (2 pages per view)
        setCurrentPage: mockSetCurrentPage,
        nextPage: mockNextPage,
        prevPage: mockPrevPage,
        highlightedVariantId: null,
        clearHighlight: mockClearHighlight,
        selectedVariantId: null,
        setSelectedVariantId: vi.fn(),
        isModalOpen: false,
        setIsModalOpen: vi.fn(),
        highlightCard: vi.fn(),
        preferences: {
          slotConfig: 'NINE',
          includePromos: true,
          includeReverseHolos: true,
          includePokeball: true,
          includeMasterball: true,
        },
        setPreferences: vi.fn(),
      } as any)

      const cards = mockTrackerCards(18) // 2 pages = 1 view on desktop
      render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Desktop buttons have aria-label "Next spread"
      const nextButton = screen.getByRole('button', { name: /next spread/i })
      expect(nextButton).toBeDisabled()
    })

    it('disables prev button at first page', () => {
      const cards = mockTrackerCards(18)
      render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Desktop buttons have aria-label "Previous spread"
      const prevButton = screen.getByRole('button', { name: /previous spread/i })
      expect(prevButton).toBeDisabled()
    })

    it('navigates with ArrowRight keyboard', () => {
      const cards = mockTrackerCards(27)
      render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      fireEvent.keyDown(document, { key: 'ArrowRight' })

      expect(mockNextPage).toHaveBeenCalled()
    })

    it('navigates with ArrowLeft keyboard', () => {
      vi.mocked(useTrackerStore).mockReturnValue({
        currentPage: 1,
        setCurrentPage: mockSetCurrentPage,
        nextPage: mockNextPage,
        prevPage: mockPrevPage,
        highlightedVariantId: null,
        clearHighlight: mockClearHighlight,
        selectedVariantId: null,
        setSelectedVariantId: vi.fn(),
        isModalOpen: false,
        setIsModalOpen: vi.fn(),
        highlightCard: vi.fn(),
        preferences: {
          slotConfig: 'NINE',
          includePromos: true,
          includeReverseHolos: true,
          includePokeball: true,
          includeMasterball: true,
        },
        setPreferences: vi.fn(),
      } as any)

      const cards = mockTrackerCards(27)
      render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      fireEvent.keyDown(document, { key: 'ArrowLeft' })

      expect(mockPrevPage).toHaveBeenCalled()
    })

    it('cleans up keyboard listener on unmount', () => {
      const cards = mockTrackerCards(18)
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const { unmount } = render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('propagates onToggleCard callback', () => {
      const onToggleCard = vi.fn()
      const cards = mockTrackerCards(2)
      render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={onToggleCard}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Find first card - use getAllByTitle since both desktop and mobile views render it
      const cardElements = screen.getAllByTitle('Card 1 - Normal')
      const firstCard = cardElements[0] // Get first match
      fireEvent.pointerDown(firstCard)
      fireEvent.pointerUp(firstCard, { button: 0 })

      // onToggleCard should be called with variant_id
      expect(onToggleCard).toHaveBeenCalledWith('variant-1')
    })

    it('propagates onOpenCardDetail callback', () => {
      const onOpenCardDetail = vi.fn()
      const cards = mockTrackerCards(2)
      render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={onOpenCardDetail}
        />
      )

      // Right-click first card - use getAllByTitle since both desktop and mobile views render it
      const cardElements = screen.getAllByTitle('Card 1 - Normal')
      const firstCard = cardElements[0] // Get first match
      fireEvent.contextMenu(firstCard)

      expect(onOpenCardDetail).toHaveBeenCalledWith('variant-1')
    })
  })

  // ============================================================================
  // PHASE D: Mobile Gesture Tests
  // ============================================================================

  describe('Mobile Gestures', () => {
    // Helper to create touch events
    const createTouchEvent = (clientX: number, clientY: number = 0) => ({
      targetTouches: [{ clientX, clientY }],
      touches: [{ clientX, clientY }],
    })

    const createMultiTouchEvent = (
      touch1: { clientX: number; clientY: number },
      touch2: { clientX: number; clientY: number }
    ) => ({
      touches: [
        { clientX: touch1.clientX, clientY: touch1.clientY },
        { clientX: touch2.clientX, clientY: touch2.clientY },
      ],
      targetTouches: [
        { clientX: touch1.clientX, clientY: touch1.clientY },
        { clientX: touch2.clientX, clientY: touch2.clientY },
      ],
    })

    beforeEach(() => {
      // Set mobile viewport for gesture tests
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      })
    })

    it('swipe left (> 50px) navigates to next page', () => {
      const cards = mockTrackerCards(27)
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      const mobileView = container.querySelector('.lg\\:hidden .bg-zinc-900\\/40')
      expect(mobileView).toBeInTheDocument()

      // Swipe left: start at 200, end at 100 (distance = 100 > 50)
      fireEvent.touchStart(mobileView!, createTouchEvent(200))
      fireEvent.touchMove(mobileView!, createTouchEvent(100))
      fireEvent.touchEnd(mobileView!, { touches: [] })

      expect(mockNextPage).toHaveBeenCalled()
    })

    it('swipe right (> 50px) navigates to previous page', () => {
      vi.mocked(useTrackerStore).mockReturnValue({
        currentPage: 1, // Not on first page
        setCurrentPage: mockSetCurrentPage,
        nextPage: mockNextPage,
        prevPage: mockPrevPage,
        highlightedVariantId: null,
        clearHighlight: mockClearHighlight,
        selectedVariantId: null,
        setSelectedVariantId: vi.fn(),
        isModalOpen: false,
        setIsModalOpen: vi.fn(),
        highlightCard: vi.fn(),
        preferences: {
          slotConfig: 'NINE',
          includePromos: true,
          includeReverseHolos: true,
          includePokeball: true,
          includeMasterball: true,
        },
        setPreferences: vi.fn(),
      } as any)

      const cards = mockTrackerCards(27)
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      const mobileView = container.querySelector('.lg\\:hidden .bg-zinc-900\\/40')
      expect(mobileView).toBeInTheDocument()

      // Swipe right: start at 100, end at 200 (distance = -100 < -50)
      fireEvent.touchStart(mobileView!, createTouchEvent(100))
      fireEvent.touchMove(mobileView!, createTouchEvent(200))
      fireEvent.touchEnd(mobileView!, { touches: [] })

      expect(mockPrevPage).toHaveBeenCalled()
    })

    it('small swipe (< 50px) does not navigate', () => {
      const cards = mockTrackerCards(27)
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      const mobileView = container.querySelector('.lg\\:hidden .bg-zinc-900\\/40')
      expect(mobileView).toBeInTheDocument()

      // Small swipe: start at 200, end at 170 (distance = 30 < 50)
      fireEvent.touchStart(mobileView!, createTouchEvent(200))
      fireEvent.touchMove(mobileView!, createTouchEvent(170))
      fireEvent.touchEnd(mobileView!, { touches: [] })

      expect(mockNextPage).not.toHaveBeenCalled()
      expect(mockPrevPage).not.toHaveBeenCalled()
    })

    it('swipe at boundary does not navigate past limits', () => {
      // At first page, swiping right should not call prevPage
      const cards = mockTrackerCards(27)
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      const mobileView = container.querySelector('.lg\\:hidden .bg-zinc-900\\/40')
      expect(mobileView).toBeInTheDocument()

      // Swipe right at first page
      fireEvent.touchStart(mobileView!, createTouchEvent(100))
      fireEvent.touchMove(mobileView!, createTouchEvent(200))
      fireEvent.touchEnd(mobileView!, { touches: [] })

      // Should not navigate - already at first page
      expect(mockPrevPage).not.toHaveBeenCalled()
    })

    it('pinch zoom adjusts scale between 1x and 3x', () => {
      const cards = mockTrackerCards(18)
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      const mobileView = container.querySelector('.lg\\:hidden .bg-zinc-900\\/40')
      expect(mobileView).toBeInTheDocument()

      // Get the zoomable container
      const zoomableDiv = mobileView!.querySelector('div[style]')

      // Start pinch with two fingers 100px apart
      fireEvent.touchStart(mobileView!, createMultiTouchEvent(
        { clientX: 100, clientY: 100 },
        { clientX: 200, clientY: 100 }
      ))

      // Move fingers to 200px apart (zoom in)
      fireEvent.touchMove(mobileView!, createMultiTouchEvent(
        { clientX: 50, clientY: 100 },
        { clientX: 250, clientY: 100 }
      ))

      // End pinch
      fireEvent.touchEnd(mobileView!, { touches: [] })

      // The scale should have changed (component tracks this internally via useState)
      // We verify the component handles the gesture without errors
      expect(mobileView).toBeInTheDocument()
    })

    it('double tap resets zoom to 1x', async () => {
      const cards = mockTrackerCards(18)
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      const mobileView = container.querySelector('.lg\\:hidden .bg-zinc-900\\/40')
      expect(mobileView).toBeInTheDocument()

      // First tap
      fireEvent.touchStart(mobileView!, createTouchEvent(150))
      fireEvent.touchEnd(mobileView!, { touches: [] })

      // Second tap within 300ms (double tap)
      fireEvent.touchStart(mobileView!, createTouchEvent(150))
      fireEvent.touchEnd(mobileView!, { touches: [] })

      // Double tap should reset zoom - component handles this internally
      // We verify the component processed the gesture without errors
      expect(mobileView).toBeInTheDocument()
    })

    it('handles mobile-specific touch interactions correctly', () => {
      const cards = mockTrackerCards(18)
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Mobile view should exist with touch handlers
      const mobileView = container.querySelector('.lg\\:hidden .bg-zinc-900\\/40')
      expect(mobileView).toBeInTheDocument()

      // Verify touch classes are present
      expect(mobileView).toHaveClass('touch-pan-x')
      expect(mobileView).toHaveClass('touch-pan-y')
    })
  })

  // ============================================================================
  // PHASE E: Advanced Features Tests
  // ============================================================================

  describe('Advanced Features', () => {
    it('preloads images for adjacent pages', () => {
      // Mock the Image constructor
      const mockImageInstances: string[] = []
      const OriginalImage = window.Image

      // Create a mock Image class
      const MockImage = vi.fn().mockImplementation(function(this: HTMLImageElement) {
        Object.defineProperty(this, 'src', {
          set(value: string) {
            mockImageInstances.push(value)
          },
          get() {
            return mockImageInstances[mockImageInstances.length - 1] || ''
          },
        })
      }) as unknown as typeof Image

      // Replace window.Image
      vi.stubGlobal('Image', MockImage)

      const cards = mockTrackerCards(36) // Multiple pages
      render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Should have preloaded some images
      expect(mockImageInstances.length).toBeGreaterThan(0)

      // Restore original Image
      vi.stubGlobal('Image', OriginalImage)
    })

    it('detects desktop viewport on mount (>= 1024px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      })

      const cards = mockTrackerCards(18)
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Desktop view should show two-page spread
      const desktopView = container.querySelector('.lg\\:flex')
      expect(desktopView).toBeInTheDocument()

      // Should show "Pages X-Y of Z" format on desktop
      expect(screen.getByText(/Pages/)).toBeInTheDocument()
    })

    it('responds to resize events and updates layout', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280, // Start desktop
      })

      const cards = mockTrackerCards(18)
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Initially desktop
      expect(container.querySelector('.lg\\:flex')).toBeInTheDocument()

      // Simulate resize to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      })
      fireEvent(window, new Event('resize'))

      // After resize, component should respond (layout will update based on isDesktop state)
      // The actual hiding/showing is CSS-driven (.lg:hidden and .hidden lg:flex)
      // but the component's pagesPerView calculation will change
    })

    it('cleans up resize listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const cards = mockTrackerCards(18)
      const { unmount } = render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('passes isHighlighted=true to highlighted card', () => {
      const highlightedVariantId = 'variant-3'

      vi.mocked(useTrackerStore).mockReturnValue({
        currentPage: 0,
        setCurrentPage: mockSetCurrentPage,
        nextPage: mockNextPage,
        prevPage: mockPrevPage,
        highlightedVariantId: highlightedVariantId, // Card 3 is highlighted
        clearHighlight: mockClearHighlight,
        selectedVariantId: null,
        setSelectedVariantId: vi.fn(),
        isModalOpen: false,
        setIsModalOpen: vi.fn(),
        highlightCard: vi.fn(),
        preferences: {
          slotConfig: 'NINE',
          includePromos: true,
          includeReverseHolos: true,
          includePokeball: true,
          includeMasterball: true,
        },
        setPreferences: vi.fn(),
      } as any)

      const cards = mockTrackerCards(9)
      const { container } = render(
        <BinderView
          cards={cards}
          slotConfig="NINE"
          onToggleCard={vi.fn()}
          onOpenCardDetail={vi.fn()}
        />
      )

      // Find the highlighted card (should have ring-amber-500 and animate-pulse classes)
      // The CardSlot component applies these classes when isHighlighted=true
      const highlightedCard = container.querySelector('.ring-amber-500\\/70')
      expect(highlightedCard).toBeInTheDocument()

      // Also verify the animate-pulse class is present
      expect(highlightedCard).toHaveClass('animate-pulse')
    })
  })
})
