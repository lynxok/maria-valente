import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  type MobileFrame,
  TARGET_MOBILE_ASPECT,
  getFrameWidthFraction,
  clampFrame,
  computeFrameTransform,
  migrateLegacyToFrame
} from '../utils/framing'
import { ZoomIn, ZoomOut, AlertTriangle, RotateCcw, Smartphone } from 'lucide-react'

interface MobileFrameEditorProps {
  imageUrl: string
  title?: string
  value?: MobileFrame
  legacyPosition?: string
  legacyScale?: number
  onChange: (frame: MobileFrame) => void
}

export const MobileFrameEditor: React.FC<MobileFrameEditorProps> = ({
  imageUrl,
  title,
  value,
  legacyPosition,
  legacyScale,
  onChange
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [naturalDimensions, setNaturalDimensions] = useState<{ w: number; h: number } | null>(null)

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
  const frame: MobileFrame = value || migrateLegacyToFrame(legacyPosition, legacyScale, imgW, imgH)

  // Calculate actual pixel height in image coordinates
  const framePixelHeight = frame.h * imgH
  const isLowQuality = framePixelHeight < 700

  // Derived relative width fraction (0 to 1+)
  const wFraction = getFrameWidthFraction(frame.h, imgW, imgH)
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

      const newFrame: MobileFrame = {
        cx: dragStart.current.startCx + deltaX,
        cy: dragStart.current.startCy + deltaY,
        h: frame.h
      }

      onChange(clampFrame(newFrame, imgW, imgH, isExpandedBeyondImage))
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
      const targetH = Math.max(0.15, Math.min(1.5, resizeStart.current.startH + deltaH))

      const newFrame: MobileFrame = {
        cx: frame.cx,
        cy: frame.cy,
        h: parseFloat(targetH.toFixed(3))
      }

      onChange(clampFrame(newFrame, imgW, imgH, targetH > 1))
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
  // "Acercar" = smaller h (less image visible, bigger on mobile screen)
  // "Alejar" = larger h (more image visible)
  const adjustZoom = useCallback((newH: number) => {
    const clampedH = Math.max(0.15, Math.min(1.4, newH))
    const newFrame = clampFrame(
      { cx: frame.cx, cy: frame.cy, h: parseFloat(clampedH.toFixed(3)) },
      imgW,
      imgH,
      clampedH > 1
    )
    onChange(newFrame)
  }, [frame.cx, frame.cy, imgW, imgH, onChange])

  // Mouse wheel zoom over container
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.05 : -0.05
    adjustZoom(frame.h + delta)
  }

  // Preview simulation (375 x 812 standard phone)
  const previewTransform = computeFrameTransform(imgW, imgH, frame, 375, 812)

  // Maximum standard h before touching boundaries without overflow
  const maxContainedH = imgW / imgH < TARGET_MOBILE_ASPECT
    ? 1.0
    : Math.min(1.0, (1.0 / TARGET_MOBILE_ASPECT) * (imgW / imgH))

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 bg-white border border-neutral-200 rounded-xs">
      {/* Left side: Canvas with Full Original Image & Interactive Phone Rectangle */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-neutral-800" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
              Encuadre Teléfono Móvil (Proporción 375:812)
            </span>
          </div>
          {title && <span className="text-[11px] text-neutral-500 font-medium">{title}</span>}
        </div>

        <p className="text-[11px] text-neutral-500 mb-3">
          Arrastrá el recuadro sobre la imagen completa para posicionar qué se verá en celulares. Arrastrá las esquinas o usá el slider para alejar/acercar.
        </p>

        {/* Workspace: Image contain box with dark overlay and movable frame */}
        <div
          className="relative bg-neutral-950 rounded-xs overflow-hidden border border-neutral-300 select-none flex items-center justify-center min-h-[300px] max-h-[460px]"
          onWheel={handleWheel}
        >
          {/* Natural Aspect Container for the whole image */}
          <div
            ref={containerRef}
            className="relative max-w-full max-h-full"
            style={{
              aspectRatio: `${imgW} / ${imgH}`,
              width: imgW >= imgH ? '100%' : 'auto',
              height: imgH > imgW ? '420px' : 'auto'
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
              className="absolute inset-0 pointer-events-none bg-black/50"
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

            {/* The Mobile Frame Rectangle */}
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
                375:812 • {Math.round(framePixelHeight)}px
              </div>
            </div>
          </div>
        </div>

        {/* Warning if quality might be low (<700px real) */}
        {isLowQuality && (
          <div className="mt-2.5 flex items-center p-2 bg-amber-50 border border-amber-200 rounded-xs text-amber-800 text-[11px]">
            <AlertTriangle className="w-4 h-4 mr-1.5 shrink-0 text-amber-600" />
            <span>
              <strong>Aviso de calidad:</strong> El encuadre es muy cerrado ({Math.round(framePixelHeight)}px de alto). En pantallas móviles de alta densidad podría verse granulado.
            </span>
          </div>
        )}

        {/* Note if expanded beyond image */}
        {isExpandedBeyondImage && (
          <div className="mt-2 flex items-center p-2 bg-blue-50 border border-blue-200 rounded-xs text-blue-800 text-[11px]">
            <span>
              <strong>Modo obra completa:</strong> El encuadre abarca más que el alto de la foto. En celulares se verá la escultura completa sobre un fondo suave desenfocado de la misma obra, sin deformación.
            </span>
          </div>
        )}

        {/* Controls Bar: Zoom Slider, Step Buttons, Reset */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => adjustZoom(frame.h + 0.1)}
              className="p-1.5 border border-neutral-300 rounded-xs hover:bg-neutral-50 text-neutral-700 cursor-pointer"
              title="Alejar (ver más imagen)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {/* Slider: Left = Acercar (smaller h), Right = Alejar (bigger h) */}
            <div className="flex items-center space-x-2 w-44 sm:w-56">
              <span className="text-[10px] text-neutral-400">Acercar</span>
              <input
                type="range"
                min={0.2}
                max={1.35}
                step={0.02}
                value={frame.h}
                onChange={e => adjustZoom(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
              <span className="text-[10px] text-neutral-400">Alejar</span>
            </div>

            <button
              type="button"
              onClick={() => adjustZoom(frame.h - 0.1)}
              className="p-1.5 border border-neutral-300 rounded-xs hover:bg-neutral-50 text-neutral-700 cursor-pointer"
              title="Acercar (detalle más grande)"
            >
              <ZoomIn className="w-4 h-4" />
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

      {/* Right side: Live Simulated Mobile Phone (375x812) using EXACT public math */}
      <div className="w-full lg:w-48 shrink-0 flex flex-col items-center">
        <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold mb-2">
          Vista Previa Celular (375 × 812)
        </span>

        {/* Miniature Phone Bezel (w: 130px, h: 281px - exact 375:812 scale factor 0.346) */}
        <div className="relative w-[130px] h-[281px] bg-neutral-950 rounded-2xl p-1.5 shadow-xl border-2 border-neutral-800">
          {/* Inner Screen */}
          <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
            {/* Ambient Backdrop if needed */}
            {previewTransform.needsBackdrop && (
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-md scale-110 opacity-70"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
            )}

            {/* Transformed image - Scaled down for miniature view */}
            {(() => {
              const miniScale = 130 / 375
              return (
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
              )
            })()}

            {/* Subtle mobile screen gradient overlay (matches site public style) */}
            <div className="absolute inset-0 bg-black/15 pointer-events-none" />

            {/* Virtual home indicator notch */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/30 rounded-full pointer-events-none" />
          </div>
        </div>

        <span className="text-[10px] text-neutral-400 mt-2 text-center">
          Render 1:1 idéntico a la Home
        </span>
      </div>
    </div>
  )
}
