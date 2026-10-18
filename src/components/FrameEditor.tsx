import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  type FrameCoord,
  TARGET_MOBILE_ASPECT,
  TARGET_DESKTOP_ASPECT,
  getFrameWidthFraction,
  clampFrame,
  computeFrameTransform,
  migrateLegacyToFrame
} from '../utils/framing'
import { ZoomIn, ZoomOut, AlertTriangle, RotateCcw, Smartphone, Monitor } from 'lucide-react'

interface FrameEditorProps {
  mode: 'mobile' | 'desktop'
  imageUrl: string
  title?: string
  value?: FrameCoord
  legacyPosition?: string
  legacyScale?: number
  onChange: (frame: FrameCoord) => void
}

export const FrameEditor: React.FC<FrameEditorProps> = ({
  mode,
  imageUrl,
  title,
  value,
  legacyPosition,
  legacyScale,
  onChange
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [naturalDimensions, setNaturalDimensions] = useState<{ w: number; h: number } | null>(null)

  const isDesktop = mode === 'desktop'
  const targetAspect = isDesktop ? TARGET_DESKTOP_ASPECT : TARGET_MOBILE_ASPECT

  // Measure natural dimensions of original image
  useEffect(() => {
    let isMounted = true
    const img = new Image()
    img.src = imageUrl
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
  }, [imageUrl])

  const imgW = naturalDimensions?.w || 1280
  const imgH = naturalDimensions?.h || 853

  // Current frame state: either provided or migrated
  const frame: FrameCoord = value || migrateLegacyToFrame(legacyPosition, legacyScale, imgW, imgH, targetAspect)

  // Calculate actual pixel height in image coordinates
  const framePixelHeight = frame.h * imgH
  const minQualityPx = isDesktop ? 900 : 700
  const isLowQuality = framePixelHeight < minQualityPx

  // Derived relative width fraction (0 to 1+)
  const wFraction = getFrameWidthFraction(frame.h, imgW, imgH, targetAspect)
  const isExpandedBeyondImage = frame.h > 1 || wFraction > 1

  // Handle Dragging of the rectangle
  const isDragging = useRef(false)
  const dragStart = useRef({ mouseX: 0, mouseY: 0, startCx: 0.5, startCy: 0.5 })

  // Handle Resizing from corner handles
  const isResizing = useRef(false)
  const resizeStart = useRef({ mouseY: 0, startH: 1.0 })

  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()
    isDragging.current = true
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    dragStart.current = {
      mouseX: clientX,
      mouseY: clientY,
      startCx: frame.cx,
      startCy: frame.cy
    }

    const onPointerMove = (moveEv: MouseEvent | TouchEvent) => {
      if (!isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const curX = 'touches' in moveEv ? moveEv.touches[0].clientX : moveEv.clientX
      const curY = 'touches' in moveEv ? moveEv.touches[0].clientY : moveEv.clientY

      const deltaX = (curX - dragStart.current.mouseX) / rect.width
      const deltaY = (curY - dragStart.current.mouseY) / rect.height

      const newFrame: FrameCoord = {
        cx: dragStart.current.startCx + deltaX,
        cy: dragStart.current.startCy + deltaY,
        h: frame.h
      }

      onChange(clampFrame(newFrame, imgW, imgH, isExpandedBeyondImage, targetAspect))
    }

    const onPointerUp = () => {
      isDragging.current = false
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('mouseup', onPointerUp)
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('touchend', onPointerUp)
    }

    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('mouseup', onPointerUp)
    window.addEventListener('touchmove', onPointerMove)
    window.addEventListener('touchend', onPointerUp)
  }

  const handleCornerResizeDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()
    isResizing.current = true
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    resizeStart.current = {
      mouseY: clientY,
      startH: frame.h
    }

    const onResizeMove = (moveEv: MouseEvent | TouchEvent) => {
      if (!isResizing.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const curY = 'touches' in moveEv ? moveEv.touches[0].clientY : moveEv.clientY

      // Dragging downward increases rectangle height (alejar)
      const deltaH = ((curY - resizeStart.current.mouseY) / rect.height) * 2
      const targetH = Math.max(0.15, Math.min(1.6, resizeStart.current.startH + deltaH))

      const newFrame: FrameCoord = {
        cx: frame.cx,
        cy: frame.cy,
        h: parseFloat(targetH.toFixed(3))
      }

      onChange(clampFrame(newFrame, imgW, imgH, targetH > 1, targetAspect))
    }

    const onResizeUp = () => {
      isResizing.current = false
      window.removeEventListener('mousemove', onResizeMove)
      window.removeEventListener('mouseup', onResizeUp)
      window.removeEventListener('touchmove', onResizeMove)
      window.removeEventListener('touchend', onResizeUp)
    }

    window.addEventListener('mousemove', onResizeMove)
    window.addEventListener('mouseup', onResizeUp)
    window.addEventListener('touchmove', onResizeMove)
    window.addEventListener('touchend', onResizeUp)
  }

  // Zoom via slider or buttons:
  // "Alejar" (izquierda / -) = larger h (more image visible)
  // "Acercar" (derecha / +) = smaller h (less image visible, bigger in preview)
  const adjustZoom = useCallback((newH: number) => {
    const clampedH = Math.max(0.15, Math.min(1.5, newH))
    const newFrame = clampFrame(
      { cx: frame.cx, cy: frame.cy, h: parseFloat(clampedH.toFixed(3)) },
      imgW,
      imgH,
      clampedH > 1,
      targetAspect
    )
    onChange(newFrame)
  }, [frame.cx, frame.cy, imgW, imgH, targetAspect, onChange])

  // Mouse wheel zoom over container
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    // Scroll down = Alejar (bigger h), scroll up = Acercar (smaller h)
    const delta = e.deltaY > 0 ? 0.05 : -0.05
    adjustZoom(frame.h + delta)
  }

  // Preview simulation dimensions:
  // Mobile: 375 x 812 (mini: 120 x 260)
  // Desktop: 1440 x 810 (mini: 240 x 135)
  const previewSimW = isDesktop ? 1440 : 375
  const previewSimH = isDesktop ? 810 : 812
  const previewTransform = computeFrameTransform(imgW, imgH, frame, previewSimW, previewSimH)

  // Maximum standard h before touching boundaries without overflow
  const maxContainedH = isDesktop
    ? ((imgW / imgH) > TARGET_DESKTOP_ASPECT ? 1.0 : (imgW / imgH) / TARGET_DESKTOP_ASPECT)
    : ((imgW / imgH) < TARGET_MOBILE_ASPECT ? 1.0 : Math.min(1.0, (1.0 / TARGET_MOBILE_ASPECT) * (imgW / imgH)))

  // Miniature scale for preview
  const miniScale = isDesktop ? 250 / 1440 : 120 / 375

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-4 bg-white border border-neutral-200 rounded-xs">
      {/* Left side: Canvas with Full Original Image & Interactive Aspect Rectangle */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {isDesktop ? (
              <Monitor className="w-4 h-4 text-neutral-800" />
            ) : (
              <Smartphone className="w-4 h-4 text-neutral-800" />
            )}
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
              {isDesktop ? 'Encuadre PC / Escritorio (16:9)' : 'Encuadre Teléfono Móvil (375:812)'}
            </span>
          </div>
          {title && <span className="text-[11px] text-neutral-500 font-medium">{title}</span>}
        </div>

        <p className="text-[11px] text-neutral-500 mb-3">
          {isDesktop
            ? 'Arrastrá el recuadro 16:9 sobre la imagen completa para definir el encuadre en computadoras. Arrastrá las esquinas o usá el slider para alejar/acercar.'
            : 'Arrastrá el recuadro sobre la imagen completa para posicionar qué se verá en celulares. Arrastrá las esquinas o usá el slider para alejar/acercar.'}
        </p>

        {/* Workspace: Image contain box with dark overlay and movable frame */}
        <div
          className="relative bg-neutral-950 rounded-xs overflow-hidden border border-neutral-300 select-none flex items-center justify-center min-h-[280px] max-h-[440px]"
          onWheel={handleWheel}
        >
          {/* Natural Aspect Container for the whole image */}
          <div
            ref={containerRef}
            className="relative max-w-full max-h-full"
            style={{
              aspectRatio: `${imgW} / ${imgH}`,
              width: imgW >= imgH ? '100%' : 'auto',
              height: imgH > imgW ? '400px' : 'auto'
            }}
          >
            {/* The full original image uncropped */}
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-contain pointer-events-none block"
            />

            {/* Dark mask overlay outside the rectangle */}
            <div
              className="absolute inset-0 pointer-events-none bg-black/55"
              style={{
                clipPath: `polygon(
                  0% 0%, 100% 0%, 100% 100%, 0% 100%,
                  0% ${Math.max(0, (frame.cy - frame.h / 2) * 100)}%,
                  ${Math.max(0, (frame.cx - wFraction / 2) * 100)}% ${Math.max(0, (frame.cy - frame.h / 2) * 100)}%,
                  ${Math.max(0, (frame.cx - wFraction / 2) * 100)}% ${Math.min(100, (frame.cy + frame.h / 2) * 100)}%,
                  ${Math.min(100, (frame.cx + wFraction / 2) * 100)}% ${Math.min(100, (frame.cy + frame.h / 2) * 100)}%,
                  ${Math.min(100, (frame.cx + wFraction / 2) * 100)}% ${Math.max(0, (frame.cy - frame.h / 2) * 100)}%,
                  0% ${Math.max(0, (frame.cy - frame.h / 2) * 100)}%
                )`
              }}
            />

            {/* The Frame Rectangle */}
            <div
              onMouseDown={handlePointerDown}
              onTouchStart={handlePointerDown}
              className="absolute border-2 border-white shadow-xl cursor-move group transition-shadow"
              style={{
                left: `${(frame.cx - wFraction / 2) * 100}%`,
                top: `${(frame.cy - frame.h / 2) * 100}%`,
                width: `${wFraction * 100}%`,
                height: `${frame.h * 100}%`
              }}
            >
              {/* Desktop Semi-Transparent Sidebar Guide Overlay */}
              {isDesktop && (
                <div 
                  className="absolute inset-y-0 left-0 bg-neutral-900/40 border-r border-white/40 pointer-events-none flex flex-col justify-between p-1.5"
                  style={{ width: '22%' }}
                  title="Área ocupada por el menú / sidebar en computadoras"
                >
                  <span className="text-[9px] text-white/90 font-medium uppercase tracking-wider bg-black/60 px-1 py-0.5 rounded-xs w-max">
                    Menú
                  </span>
                  <span className="text-[8px] text-white/60">
                    Zona lateral
                  </span>
                </div>
              )}

              {/* Internal 3x3 grid guidelines */}
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none">
                <div className="border-r border-b border-white/30" />
                <div className="border-r border-b border-white/30" />
                <div className="border-b border-white/30" />
                <div className="border-r border-b border-white/30" />
                <div className="border-r border-b border-white/30" />
                <div className="border-b border-white/30" />
                <div className="border-r border-white/30" />
                <div className="border-r border-white/30" />
                <div />
              </div>

              {/* Center point indicator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400 border border-white shadow-xs pointer-events-none" />

              {/* Corner Resizing Handles */}
              <div
                onMouseDown={handleCornerResizeDown}
                onTouchStart={handleCornerResizeDown}
                className="absolute -bottom-2 -right-2 w-5 h-5 bg-white border-2 border-neutral-900 rounded-xs cursor-se-resize shadow-md flex items-center justify-center hover:scale-125 transition-transform"
                title="Arrastrá para cambiar tamaño (acercar/alejar)"
              >
                <div className="w-1.5 h-1.5 bg-neutral-900" />
              </div>

              {/* Tag indicator */}
              <div className="absolute -top-6 left-0 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded-xs tracking-wider uppercase font-mono pointer-events-none">
                {isDesktop ? '16:9' : '375:812'} • {Math.round(framePixelHeight)}px
              </div>
            </div>
          </div>
        </div>

        {/* Warning if quality might be low */}
        {isLowQuality && (
          <div className="mt-2.5 flex items-center p-2 bg-amber-50 border border-amber-200 rounded-xs text-amber-800 text-[11px]">
            <AlertTriangle className="w-4 h-4 mr-1.5 shrink-0 text-amber-600" />
            <span>
              <strong>Aviso de calidad:</strong> El encuadre es muy cerrado ({Math.round(framePixelHeight)}px). En pantallas de alta resolución ({isDesktop ? 'Full HD/4K' : 'Retina'}) podría verse granulado.
            </span>
          </div>
        )}

        {/* Note if expanded beyond image */}
        {isExpandedBeyondImage && (
          <div className="mt-2 flex items-center p-2 bg-blue-50 border border-blue-200 rounded-xs text-blue-800 text-[11px]">
            <span>
              <strong>Modo obra completa:</strong> El encuadre abarca más que los límites de la foto. La imagen se mostrará completa sin recortar ni deformar, con un fondo ambiental difuminado de la misma obra.
            </span>
          </div>
        )}

        {/* Controls Bar: Unified Zoom Slider, Step Buttons, Reset */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {/* Botón Alejar (−) a la izquierda */}
            <button
              type="button"
              onClick={() => adjustZoom(frame.h + 0.08)}
              className="p-1.5 border border-neutral-300 rounded-xs hover:bg-neutral-50 text-neutral-700 cursor-pointer flex items-center"
              title="Alejar (ver más imagen)"
            >
              <ZoomOut className="w-4 h-4 mr-1 text-neutral-600" />
              <span className="text-[11px]">Alejar</span>
            </button>

            {/* Slider: Left = Alejar (bigger h), Right = Acercar (smaller h) */}
            <div className="flex items-center space-x-2 w-40 sm:w-52">
              <span className="text-[10px] text-neutral-400">−</span>
              <input
                type="range"
                min={0.2}
                max={1.4}
                step={0.02}
                // Inverted so left = alejar (more h), right = acercar (less h)
                value={1.6 - frame.h}
                onChange={e => adjustZoom(1.6 - parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
              <span className="text-[10px] text-neutral-400">+</span>
            </div>

            {/* Botón Acercar (+) a la derecha */}
            <button
              type="button"
              onClick={() => adjustZoom(frame.h - 0.08)}
              className="p-1.5 border border-neutral-300 rounded-xs hover:bg-neutral-50 text-neutral-700 cursor-pointer flex items-center"
              title="Acercar (detalle más grande)"
            >
              <ZoomIn className="w-4 h-4 mr-1 text-neutral-600" />
              <span className="text-[11px]">Acercar</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => adjustZoom(maxContainedH)}
              className="px-2.5 py-1 text-xs border border-neutral-300 rounded-xs hover:bg-neutral-50 text-neutral-700 cursor-pointer flex items-center"
              title="Ajustar al máximo sin bordes"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              <span>Ajustar al máximo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right side: Live Simulated Preview using EXACT public math */}
      <div className={`shrink-0 flex flex-col items-center ${isDesktop ? 'w-full xl:w-64' : 'w-full xl:w-48'}`}>
        <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold mb-2">
          {isDesktop ? 'Vista Previa PC (16:9 con Menú)' : 'Vista Previa Celular (375 × 812)'}
        </span>

        {isDesktop ? (
          /* Desktop Monitor Frame */
          <div className="relative w-[250px] h-[141px] bg-neutral-950 rounded-md p-1 shadow-xl border-2 border-neutral-800">
            <div className="relative w-full h-full bg-black rounded-xs overflow-hidden">
              {previewTransform.needsBackdrop && (
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-md scale-110 opacity-70"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
              )}

              <img
                src={imageUrl}
                alt=""
                className="absolute top-0 left-0 max-w-none select-none"
                style={{
                  width: `${Math.round(previewTransform.imgWidthPx * miniScale)}px`,
                  height: `${Math.round(previewTransform.imgHeightPx * miniScale)}px`,
                  transform: `translate3d(${Math.round(previewTransform.translateX * miniScale)}px, ${Math.round(previewTransform.translateY * miniScale)}px, 0)`
                }}
                draggable={false}
              />

              {/* Sidebar Transparent Simulation */}
              <div className="absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-black/60 to-transparent p-1.5 flex flex-col justify-between pointer-events-none">
                <div>
                  <div className="w-8 h-1.5 bg-white/80 rounded-xs mb-1" />
                  <div className="w-5 h-1 bg-white/40 rounded-xs mb-3" />
                  <div className="space-y-1">
                    <div className="w-6 h-1 bg-white/50 rounded-xs" />
                    <div className="w-7 h-1 bg-white/50 rounded-xs" />
                    <div className="w-5 h-1 bg-white/50 rounded-xs" />
                  </div>
                </div>
                <div className="w-6 h-1 bg-white/30 rounded-xs" />
              </div>
            </div>
          </div>
        ) : (
          /* Mobile Phone Frame */
          <div className="relative w-[120px] h-[260px] bg-neutral-950 rounded-2xl p-1.5 shadow-xl border-2 border-neutral-800">
            <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
              {previewTransform.needsBackdrop && (
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-md scale-110 opacity-70"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
              )}

              <img
                src={imageUrl}
                alt=""
                className="absolute top-0 left-0 max-w-none select-none"
                style={{
                  width: `${Math.round(previewTransform.imgWidthPx * miniScale)}px`,
                  height: `${Math.round(previewTransform.imgHeightPx * miniScale)}px`,
                  transform: `translate3d(${Math.round(previewTransform.translateX * miniScale)}px, ${Math.round(previewTransform.translateY * miniScale)}px, 0)`
                }}
                draggable={false}
              />

              <div className="absolute inset-0 bg-black/15 pointer-events-none" />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/30 rounded-full pointer-events-none" />
            </div>
          </div>
        )}

        <span className="text-[10px] text-neutral-400 mt-2 text-center">
          Render 1:1 idéntico a la Home
        </span>
      </div>
    </div>
  )
}
