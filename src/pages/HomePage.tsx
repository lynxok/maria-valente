import React, { useState, useEffect, useRef } from 'react'
import { contentService } from '../services/contentService'
import type { HeroSlide } from '../types'
import { MobileSlideRenderer } from '../components/MobileSlideRenderer'
import { DesktopSlideRenderer } from '../components/DesktopSlideRenderer'

export const HomePage: React.FC = () => {
  const settings = contentService.getSettings()
  
  // Normalize slides
  const slides: HeroSlide[] = (settings.heroSlides && settings.heroSlides.length > 0)
    ? settings.heroSlides
    : (settings.heroImages || []).map((url, i) => ({
        id: `slide-${i}`,
        url,
        desktopPosition: 'center center',
        mobilePosition: 'center center',
        order: i + 1
      }))

  const generalDuration = (settings.heroDurationSeconds || 6) * 1000

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Touch swipe support
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Set document title
  useEffect(() => {
    document.title = `${settings.artistName} | ${settings.tagline}`
  }, [settings.artistName, settings.tagline])

  // Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Dynamic transition interval configurable from Admin
  useEffect(() => {
    if (slides.length <= 1 || isPaused || prefersReducedMotion) return
    const currentSlide = slides[currentIndex]
    const duration = (currentSlide?.durationSeconds ? currentSlide.durationSeconds * 1000 : generalDuration)

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length)
    }, duration)
    return () => clearInterval(timer)
  }, [slides, currentIndex, isPaused, prefersReducedMotion, generalDuration])

  const prevImage = () => {
    setCurrentIndex(prev => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  const nextImage = () => {
    setCurrentIndex(prev => (prev + 1) % slides.length)
  }

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextImage()
    } else if (isRightSwipe) {
      prevImage()
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  return (
    <div 
      className="relative w-full h-[calc(100vh-53px)] md:h-screen bg-neutral-950 overflow-hidden flex items-center justify-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Carrusel de obras en pantalla completa"
    >
      {/* Background Slides with separate desktop and mobile framing positions */}
      {slides.map((slide, idx) => {
        const isCurrent = idx === currentIndex
        return (
          <React.Fragment key={slide.id || slide.url + idx}>
            {/* Desktop Slide (md+) with Exact Rectangle Framing & computeFrameTransform */}
            <DesktopSlideRenderer
              slide={slide}
              isCurrent={isCurrent}
              prefersReducedMotion={Boolean(prefersReducedMotion)}
            />

            {/* Mobile Slide (< md) with Exact Rectangle Framing & computeFrameTransform */}
            <MobileSlideRenderer
              slide={slide}
              isCurrent={isCurrent}
              prefersReducedMotion={Boolean(prefersReducedMotion)}
            />
          </React.Fragment>
        )
      })}

      {/* Fondo ambiental sutil en mobile si corresponde */}
      <div 
        className="absolute inset-0 bg-black/10 pointer-events-none md:hidden block" 
        aria-hidden="true"
      />

      {/* Pagination dots con área táctil accesible de mínimo 44x44 */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 flex items-center z-20" role="tablist" aria-label="Selector de diapositivas">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`Ir a la obra ${idx + 1} de ${slides.length}`}
              className="w-11 h-11 flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
            >
              <span
                className={`h-2 rounded-full transition-all block ${
                  idx === currentIndex ? 'bg-white w-7' : 'bg-white/40 hover:bg-white/80 w-2'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
