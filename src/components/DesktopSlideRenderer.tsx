import React, { useState, useEffect } from 'react'
import type { HeroSlide } from '../types'
import { computeFrameTransform, migrateLegacyToFrame, type FrameCoord, TARGET_DESKTOP_ASPECT } from '../utils/framing'

interface DesktopSlideRendererProps {
  slide: HeroSlide
  isCurrent: boolean
  prefersReducedMotion: boolean
}

export const DesktopSlideRenderer: React.FC<DesktopSlideRendererProps> = ({
  slide,
  isCurrent,
  prefersReducedMotion
}) => {
  const [naturalDimensions, setNaturalDimensions] = useState<{ w: number; h: number } | null>(null)
  const [viewport, setViewport] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1440,
    h: typeof window !== 'undefined' ? window.innerHeight : 900
  })

  // Measure natural dimensions of image
  useEffect(() => {
    let isMounted = true
    const img = new Image()
    img.src = slide.url
    img.onload = () => {
      if (isMounted && img.naturalWidth) {
        setNaturalDimensions({ w: img.naturalWidth, h: img.naturalHeight })
      }
    }
    if (img.complete && img.naturalWidth) {
      queueMicrotask(() => {
        if (isMounted) {
          setNaturalDimensions({ w: img.naturalWidth, h: img.naturalHeight })
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [slide.url])

  // Track viewport resize
  useEffect(() => {
    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const imgW = naturalDimensions?.w || 1280
  const imgH = naturalDimensions?.h || 853

  // Get frame: either defined or migrated from legacy
  const frame: FrameCoord = slide.desktopFrame || migrateLegacyToFrame(
    slide.desktopPosition,
    slide.desktopScale,
    imgW,
    imgH,
    TARGET_DESKTOP_ASPECT
  )

  // Modos de ajuste:
  // 'cover' (por defecto): llena el 100% de la pantalla sin ninguna franja lateral ni superior.
  // 'blur': preserva el encuadre con barras difuminadas si se aleja más allá de la imagen.
  const fitMode = slide.fitMode || 'cover'

  // Si está en modo cover (llenar toda la pantalla sin franjas laterales):
  let finalWidthPx: number
  let finalHeightPx: number
  let finalTranslateX: number
  let finalTranslateY: number
  let showBackdrop = false

  if (fitMode === 'cover') {
    // Calculamos la escala mínima necesaria para cubrir el 100% del viewport
    const scaleCover = Math.max(viewport.w / imgW, viewport.h / imgH)
    // Respetamos el centro focal (cx, cy) elegido en el editor
    const effectiveScale = Math.max(scaleCover, (viewport.h / (frame.h * imgH)))
    
    finalWidthPx = imgW * effectiveScale
    finalHeightPx = imgH * effectiveScale

    // Centro focal
    const focalX = frame.cx * finalWidthPx
    const focalY = frame.cy * finalHeightPx

    // Centrado en el viewport clampeado para no dejar franjas
    const rawTx = (viewport.w / 2) - focalX
    const rawTy = (viewport.h / 2) - focalY

    // Clamp para garantizar que cubra de borde a borde sin espacios vacíos
    finalTranslateX = Math.min(0, Math.max(viewport.w - finalWidthPx, rawTx))
    finalTranslateY = Math.min(0, Math.max(viewport.h - finalHeightPx, rawTy))
    showBackdrop = false
  } else {
    // Modo 'blur': cálculo matemático exacto del FrameEditor
    const result = computeFrameTransform(imgW, imgH, frame, viewport.w, viewport.h)
    finalWidthPx = result.imgWidthPx
    finalHeightPx = result.imgHeightPx
    finalTranslateX = result.translateX
    finalTranslateY = result.translateY
    showBackdrop = result.needsBackdrop
  }

  return (
    <div
      className={`hidden md:block absolute inset-0 overflow-hidden ${
        prefersReducedMotion ? '' : 'transition-opacity duration-1000 ease-in-out'
      } ${
        isCurrent ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isCurrent}
    >
      {/* Fondo ambiental difuminado suave solo si está activo el modo blur y se ven franjas */}
      {showBackdrop && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110 opacity-70"
          style={{ backgroundImage: `url(${slide.url})` }}
        />
      )}

      {/* Imagen original dibujada con sus proporciones exactas e inalterables */}
      <img
        src={slide.url}
        alt={slide.title || 'Obra'}
        className="absolute top-0 left-0 max-w-none will-change-transform select-none"
        style={{
          width: `${Math.round(finalWidthPx)}px`,
          height: `${Math.round(finalHeightPx)}px`,
          transform: `translate3d(${Math.round(finalTranslateX)}px, ${Math.round(finalTranslateY)}px, 0)`
        }}
        draggable={false}
      />
    </div>
  )
}
