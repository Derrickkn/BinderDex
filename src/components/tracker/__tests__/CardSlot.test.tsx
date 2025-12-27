import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { CardSlot } from '../CardSlot'
import { createMockCard } from '@/test/mockData/trackerMocks'

describe('CardSlot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================================
  // PHASE A: Basic Rendering Tests
  // ============================================================================

  describe('Basic Rendering', () => {
    it('renders owned card with green ring', () => {
      const card = createMockCard({ owned: true, quantity: 1 })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      const container = screen.getByTitle(/Charizard/i).closest('div')
      // Component uses ring-green-500/30 (with opacity)
      expect(container).toHaveClass('ring-green-500/30')
    })

    it('renders missing card with greyscale and dashed border', () => {
      const card = createMockCard({ owned: false, quantity: 0 })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      const image = screen.getByAltText(card.name)
      // Missing cards have grayscale filter applied
      expect(image).toHaveClass('grayscale')
      // Image starts with opacity-0 before load
      expect(image).toHaveClass('opacity-0')

      // Simulate image load
      fireEvent.load(image)
      // After load, image fades in with opacity-100 (the loaded state)
      // The grayscale filter remains to indicate missing status
      expect(image).toHaveClass('grayscale')
      expect(image).toHaveClass('opacity-100')

      const container = screen.getByTitle(/Charizard/i)
      expect(container).toHaveClass('border-dashed')
    })

    it('has data-owned attribute matching ownership status', () => {
      // isOwned = card.owned && card.quantity > 0, so we need both
      const ownedCard = createMockCard({ owned: true, quantity: 1 })
      const { rerender } = render(
        <CardSlot
          card={ownedCard}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      expect(screen.getByTitle(/Charizard/i)).toHaveAttribute('data-owned', 'true')

      const missingCard = createMockCard({ owned: false, quantity: 0 })
      rerender(
        <CardSlot
          card={missingCard}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      expect(screen.getByTitle(/Charizard/i)).toHaveAttribute('data-owned', 'false')
    })

    it('displays title attribute with card name and variant', () => {
      const card = createMockCard({ variant_type: 'REVERSE_HOLO' })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      expect(screen.getByTitle('Charizard - Reverse Holo')).toBeInTheDocument()
    })

    it('displays image alt text with card name', () => {
      const card = createMockCard({ name: 'Pikachu' })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      expect(screen.getByAltText('Pikachu')).toBeInTheDocument()
    })

    it('renders fallback when image URLs are null', () => {
      const card = createMockCard({
        image_small: '',
        image_large: '',
        variant_image_url: null,
      })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      // Should show card number as fallback
      expect(screen.getByText(card.number)).toBeInTheDocument()
    })

    it('has data-coach-card-slot attribute for tutorial', () => {
      const card = createMockCard()
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      expect(screen.getByTitle(/Charizard/i)).toHaveAttribute('data-coach-card-slot')
    })

    it('uses variant image URL when available', () => {
      const card = createMockCard({
        variant_image_url: 'https://example.com/variant.png',
      })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      const image = screen.getByAltText(card.name)
      expect(image).toHaveAttribute('src', expect.stringContaining('variant.png'))
    })
  })

  // ============================================================================
  // PHASE B: Interaction Tests
  // ============================================================================

  describe('Interaction Tests', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('calls onToggle on click (< 500ms)', () => {
      const onToggle = vi.fn()
      const card = createMockCard()
      render(
        <CardSlot
          card={card}
          onToggle={onToggle}
          onOpenDetail={vi.fn()}
        />
      )

      const slot = screen.getByTitle(/Charizard/i)
      fireEvent.pointerDown(slot, { button: 0 })
      vi.advanceTimersByTime(300) // Less than 500ms
      fireEvent.pointerUp(slot, { button: 0 })

      expect(onToggle).toHaveBeenCalledTimes(1)
    })

    it('calls onOpenDetail on long-press (≥ 500ms)', () => {
      const onOpenDetail = vi.fn()
      const card = createMockCard()
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={onOpenDetail}
        />
      )

      const slot = screen.getByTitle(/Charizard/i)
      fireEvent.pointerDown(slot, { button: 0 })
      vi.advanceTimersByTime(500) // Exactly 500ms
      fireEvent.pointerUp(slot, { button: 0 })

      expect(onOpenDetail).toHaveBeenCalledTimes(1)
    })

    it('does not call onToggle on long-press', () => {
      const onToggle = vi.fn()
      const card = createMockCard()
      render(
        <CardSlot
          card={card}
          onToggle={onToggle}
          onOpenDetail={vi.fn()}
        />
      )

      const slot = screen.getByTitle(/Charizard/i)
      fireEvent.pointerDown(slot, { button: 0 })
      vi.advanceTimersByTime(600) // Long press
      fireEvent.pointerUp(slot, { button: 0 })

      expect(onToggle).not.toHaveBeenCalled()
    })

    it('calls onOpenDetail on right-click and prevents default', () => {
      const onOpenDetail = vi.fn()
      const card = createMockCard()
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={onOpenDetail}
        />
      )

      const slot = screen.getByTitle(/Charizard/i)
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      slot.dispatchEvent(event)

      expect(onOpenDetail).toHaveBeenCalledTimes(1)
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('clears long-press timer on pointer cancel', () => {
      const onOpenDetail = vi.fn()
      const card = createMockCard()
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={onOpenDetail}
        />
      )

      const slot = screen.getByTitle(/Charizard/i)
      fireEvent.pointerDown(slot, { button: 0 })
      vi.advanceTimersByTime(300)
      fireEvent.pointerCancel(slot)
      vi.advanceTimersByTime(300) // Total 600ms, but canceled

      expect(onOpenDetail).not.toHaveBeenCalled()
    })

    it('clears long-press timer on pointer leave', () => {
      const onOpenDetail = vi.fn()
      const card = createMockCard()
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={onOpenDetail}
        />
      )

      const slot = screen.getByTitle(/Charizard/i)
      fireEvent.pointerDown(slot, { button: 0 })
      vi.advanceTimersByTime(300)
      fireEvent.pointerLeave(slot)
      vi.advanceTimersByTime(300)

      expect(onOpenDetail).not.toHaveBeenCalled()
    })

    it('debounces clicks with 150ms cooldown', () => {
      const onToggle = vi.fn()
      const card = createMockCard()
      render(
        <CardSlot
          card={card}
          onToggle={onToggle}
          onOpenDetail={vi.fn()}
        />
      )

      const slot = screen.getByTitle(/Charizard/i)

      // First click
      fireEvent.pointerDown(slot, { button: 0 })
      fireEvent.pointerUp(slot, { button: 0 })
      vi.advanceTimersByTime(100) // Only 100ms

      // Second click (should be ignored due to debounce)
      fireEvent.pointerDown(slot, { button: 0 })
      fireEvent.pointerUp(slot, { button: 0 })

      expect(onToggle).toHaveBeenCalledTimes(1)
    })

    it('allows click after 150ms debounce period', () => {
      const onToggle = vi.fn()
      const card = createMockCard()
      render(
        <CardSlot
          card={card}
          onToggle={onToggle}
          onOpenDetail={vi.fn()}
        />
      )

      const slot = screen.getByTitle(/Charizard/i)

      // First click
      fireEvent.pointerDown(slot, { button: 0 })
      fireEvent.pointerUp(slot, { button: 0 })
      vi.advanceTimersByTime(150) // Exactly 150ms

      // Second click (should work)
      fireEvent.pointerDown(slot, { button: 0 })
      fireEvent.pointerUp(slot, { button: 0 })

      expect(onToggle).toHaveBeenCalledTimes(2)
    })

    it('handles rapid pointer events gracefully', () => {
      const onToggle = vi.fn()
      const onOpenDetail = vi.fn()
      const card = createMockCard()
      render(
        <CardSlot
          card={card}
          onToggle={onToggle}
          onOpenDetail={onOpenDetail}
        />
      )

      const slot = screen.getByTitle(/Charizard/i)

      // Rapid events
      fireEvent.pointerDown(slot, { button: 0 })
      fireEvent.pointerUp(slot, { button: 0 })
      fireEvent.pointerDown(slot, { button: 0 })
      fireEvent.pointerUp(slot, { button: 0 })

      // Should not throw errors
      expect(onToggle).toHaveBeenCalledTimes(1) // First one, second debounced
    })

    it('does not trigger onOpenDetail after pointer cancel, but onToggle still fires on pointerUp', () => {
      const onToggle = vi.fn()
      const onOpenDetail = vi.fn()
      const card = createMockCard()
      render(
        <CardSlot
          card={card}
          onToggle={onToggle}
          onOpenDetail={onOpenDetail}
        />
      )

      const slot = screen.getByTitle(/Charizard/i)
      fireEvent.pointerDown(slot, { button: 0 })
      fireEvent.pointerCancel(slot)
      fireEvent.pointerUp(slot, { button: 0 })

      // After cancel, the long press timer is cleared so onOpenDetail is not called
      // But pointerUp still fires onToggle since isLongPressRef is false
      expect(onToggle).toHaveBeenCalledTimes(1)
      expect(onOpenDetail).not.toHaveBeenCalled()
    })
  })

  // ============================================================================
  // PHASE C: Badge Display Tests
  // ============================================================================

  describe('Badge Display', () => {
    it('shows quantity badge when owned and quantity > 1', () => {
      const card = createMockCard({ owned: true, quantity: 3 })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      expect(screen.getByText('3')).toBeInTheDocument()
      const badge = screen.getByText('3').closest('div')
      expect(badge).toHaveClass('bg-green-500')
    })

    it('hides quantity badge when quantity = 1', () => {
      const card = createMockCard({ owned: true, quantity: 1 })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      // Should not have quantity badge
      const container = screen.getByTitle(/Charizard/i)
      expect(container.textContent).not.toContain('1')
    })

    it('hides quantity badge when not owned', () => {
      const card = createMockCard({ owned: false, quantity: 0 })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      const container = screen.getByTitle(/Charizard/i)
      expect(container.querySelector('.bg-green-500')).not.toBeInTheDocument()
    })

    it('shows RH badge for REVERSE_HOLO variant', () => {
      const card = createMockCard({ variant_type: 'REVERSE_HOLO' })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      expect(screen.getByText('RH')).toBeInTheDocument()
    })

    it('shows PB badge for POKEBALL variant', () => {
      const card = createMockCard({ variant_type: 'POKEBALL' })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      expect(screen.getByText('PB')).toBeInTheDocument()
    })

    it('shows MB badge for MASTERBALL variant', () => {
      const card = createMockCard({ variant_type: 'MASTERBALL' })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      expect(screen.getByText('MB')).toBeInTheDocument()
    })

    it('shows 1E badge for FIRST_EDITION variant', () => {
      const card = createMockCard({ variant_type: 'FIRST_EDITION' })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      expect(screen.getByText('1E')).toBeInTheDocument()
    })

    it('shows SH badge for SHADOWLESS variant', () => {
      const card = createMockCard({ variant_type: 'SHADOWLESS' })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      expect(screen.getByText('SH')).toBeInTheDocument()
    })

    it('shows UL badge for UNLIMITED variant', () => {
      const card = createMockCard({ variant_type: 'UNLIMITED' })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      expect(screen.getByText('UL')).toBeInTheDocument()
    })

    it('hides variant badge for NORMAL variant', () => {
      const card = createMockCard({ variant_type: 'NORMAL' })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      // Should not have variant badges
      expect(screen.queryByText('RH')).not.toBeInTheDocument()
      expect(screen.queryByText('PB')).not.toBeInTheDocument()
      expect(screen.queryByText('MB')).not.toBeInTheDocument()
    })

    it('shows PC badge for Pokemon Center exclusive', () => {
      const card = createMockCard({ is_pokemon_center_exclusive: true })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      expect(screen.getByText('PC')).toBeInTheDocument()
      const badge = screen.getByText('PC').closest('div')
      expect(badge).toHaveClass('bg-amber-600/90')
    })
  })

  // ============================================================================
  // PHASE D: Visual States Tests
  // ============================================================================

  describe('Visual States', () => {
    it('shows highlighted state with amber pulse ring', () => {
      const card = createMockCard()
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
          isHighlighted={true}
        />
      )

      const container = screen.getByTitle(/Charizard/i).closest('div')
      // Component uses ring-amber-500/70 (with opacity)
      expect(container).toHaveClass('ring-amber-500/70')
      expect(container).toHaveClass('animate-pulse')
    })

    it('does not show highlighted state when isHighlighted is false', () => {
      const card = createMockCard()
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
          isHighlighted={false}
        />
      )

      const container = screen.getByTitle(/Charizard/i).closest('div')
      expect(container).not.toHaveClass('ring-amber-500/70')
    })

    it('shows hover overlay text "Click to add" for missing card', () => {
      const card = createMockCard({ owned: false })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      expect(screen.getByText('Click to add')).toBeInTheDocument()
    })

    it('shows hover overlay text "Click to remove" for owned card', () => {
      // isOwned = card.owned && card.quantity > 0
      const card = createMockCard({ owned: true, quantity: 1 })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      expect(screen.getByText('Click to remove')).toBeInTheDocument()
    })

    it('shows loading skeleton before image loads', () => {
      const card = createMockCard()
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      // Loading skeleton should have animate-pulse
      const skeleton = screen.getByTitle(/Charizard/i).querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    it('fades in image after load event', () => {
      // Use owned card so opacity-100 is the expected final state
      const card = createMockCard({ owned: true, quantity: 1 })
      render(
        <CardSlot
          card={card}
          onToggle={vi.fn()}
          onOpenDetail={vi.fn()}
        />
      )

      const image = screen.getByAltText(card.name)

      // Image starts with opacity-0 (before load) - class is on the image itself
      expect(image).toHaveClass('opacity-0')

      // Simulate image load
      fireEvent.load(image)

      // After load, should fade in (opacity-100) for owned cards
      expect(image).toHaveClass('opacity-100')
    })
  })
})
