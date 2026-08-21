import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SmoothCarouselProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerRight?: React.ReactNode;
  className?: string;
  itemClassName?: string;
  showArrows?: boolean;
  showDots?: boolean;
  showFadeEdges?: boolean;
  gap?: 'sm' | 'md' | 'lg';
  totalItems?: number;
  activeIndex?: number;
  onItemChange?: (index: number) => void;
  id?: string;
}

export const SmoothCarousel: React.FC<SmoothCarouselProps> = ({
  children,
  title,
  subtitle,
  headerRight,
  className = '',
  showArrows = true,
  showDots = true,
  showFadeEdges = true,
  gap = 'md',
  totalItems,
  onItemChange,
  id,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  // Check scroll boundary states
  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const isAtStart = scrollLeft <= 4;
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 6;

    setCanScrollLeft(!isAtStart);
    setCanScrollRight(!isAtEnd);

    // Calculate approximate active child index
    const childrenCount = totalItems || el.children.length;
    if (childrenCount > 0 && scrollWidth > clientWidth) {
      const scrollFraction = scrollLeft / (scrollWidth - clientWidth);
      const computedIndex = Math.min(
        childrenCount - 1,
        Math.max(0, Math.round(scrollFraction * (childrenCount - 1)))
      );
      setCurrentIndex(computedIndex);
      if (onItemChange) {
        onItemChange(computedIndex);
      }
    }
  }, [totalItems, onItemChange]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollState();
    const handleScroll = () => {
      requestAnimationFrame(updateScrollState);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScrollState);

    // Observe size changes
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState]);

  // Smooth scroll helpers
  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.75;
    const targetScroll =
      direction === 'left' ? el.scrollLeft - scrollAmount : el.scrollLeft + scrollAmount;

    el.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  const scrollToIndex = (index: number) => {
    const el = containerRef.current;
    if (!el) return;

    const children = Array.from(el.children) as HTMLElement[];
    if (children[index]) {
      children[index].scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
        block: 'nearest',
      });
      setCurrentIndex(index);
    }
  };

  // Mouse Drag to Scroll Handling (Enables intuitive desktop touch-like scrolling)
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;

    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = containerRef.current;
    if (!el) return;

    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag sensitivity
    if (Math.abs(walk) > 4) {
      setHasMoved(true);
    }
    el.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const gapClasses = {
    sm: 'gap-2.5',
    md: 'gap-4',
    lg: 'gap-5',
  }[gap];

  const count = totalItems || (containerRef.current ? containerRef.current.children.length : 0);

  return (
    <div id={id} className={`relative flex flex-col ${className}`}>
      {/* HEADER WITH TITLE & CONTROLS */}
      {(title || subtitle || showArrows || headerRight) && (
        <div className="flex items-center justify-between gap-3 mb-3.5 px-0.5">
          <div>
            {title && (
              <div className="text-base font-extrabold text-[#161922] dark:text-white tracking-tight">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {subtitle}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {headerRight}

            {showArrows && (
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-2xl border border-slate-200/70 dark:border-zinc-700/80 shrink-0">
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    canScrollLeft
                      ? 'bg-white dark:bg-zinc-700 text-[#161922] dark:text-white shadow-xs hover:scale-105 active:scale-95'
                      : 'text-slate-300 dark:text-zinc-600 cursor-not-allowed opacity-50'
                  }`}
                  title="Défiler vers la gauche"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    canScrollRight
                      ? 'bg-white dark:bg-zinc-700 text-[#161922] dark:text-white shadow-xs hover:scale-105 active:scale-95'
                      : 'text-slate-300 dark:text-zinc-600 cursor-not-allowed opacity-50'
                  }`}
                  title="Défiler vers la droite"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CAROUSEL TRACK CONTAINER */}
      <div className="relative group">
        {/* LEFT FADE GRADIENT OVERLAY */}
        {showFadeEdges && canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-zinc-900 to-transparent pointer-events-none z-10 opacity-90 transition-opacity" />
        )}

        {/* RIGHT FADE GRADIENT OVERLAY */}
        {showFadeEdges && canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent pointer-events-none z-10 opacity-90 transition-opacity" />
        )}

        {/* SCROLLABLE TRACK */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex ${gapClasses} overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-0.5 cursor-grab active:cursor-grabbing select-none`}
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {children}
        </div>
      </div>

      {/* BOTTOM PAGINATION DOTS (IF ENABLED) */}
      {showDots && count > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3 pt-1">
          {Array.from({ length: count }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              style={idx === currentIndex ? { backgroundColor: 'var(--accent-color)' } : undefined}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-5 shadow-xs'
                  : 'w-1.5 bg-slate-300 dark:bg-zinc-700 hover:bg-slate-400 dark:hover:bg-zinc-600'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
