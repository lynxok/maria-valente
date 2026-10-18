import React, { useRef } from 'react'

interface InteractiveFocalPickerProps {
  label: string
  icon: React.ReactNode
  value?: string // e.g. "50% 50%" or "center center"
  imageUrl: string
  aspectRatio: 'desktop' | 'mobile' // desktop is 16:9, mobile is 9:16
  scale?: number // 40% to 150%, default 100
  onChange: (newPos: string) => void
  onScaleChange?: (newScale: number) => void
}

// Convert string like "50% 50%" or keywords to numeric percentages
function parsePosition(posStr?: string): { x: number; y: number } {
  if (!posStr) return { x: 50, y: 50 }

  const parts = posStr.trim().split(/\s+/)
  if (parts.length === 1) {
    if (parts[0] === 'center') return { x: 50, y: 50 }
    if (parts[0] === 'top') return { x: 50, y: 0 }
    if (parts[0] === 'bottom') return { x: 50, y: 100 }
    if (parts[0] === 'left') return { x: 0, y: 50 }
    if (parts[0] === 'right') return { x: 100, y: 50 }
  }

  let x = 50
  let y = 50

  const parseVal = (val: string, isY = false) => {
    if (val.includes('%')) return parseFloat(val) || 50
    if (val === 'center') return 50
    if (val === 'top') return 0
    if (val === 'bottom') return 100
    if (val === 'left') return 0
    if (val === 'right') return 100
    return isY ? 50 : 50
  }

  if (parts.length >= 2) {
    x = parseVal(parts[0], false)
    y = parseVal(parts[1], true)
  }

  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
}

export const InteractiveFocalPicker: React.FC<InteractiveFocalPickerProps> = ({
  label,
  icon,
  value,
  imageUrl,
  aspectRatio,
  scale = 100,
  onChange,
  onScaleChange
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isDragging = useRef(false)

  const { x, y } = parsePosition(value)

  const handlePointerAction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    const relX = Math.round(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)))
    const relY = Math.round(Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)))

    onChange(`${relX}% ${relY}%`)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true
    handlePointerAction(e)

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const relX = Math.round(Math.max(0, Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100)))
      const relY = Math.round(Math.max(0, Math.min(100, ((moveEvent.clientY - rect.top) / rect.height) * 100)))
      onChange(`${relX}% ${relY}%`)
    }

    const onMouseUp = () => {
      isDragging.current = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const isDesktop = aspectRatio === 'desktop'

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-1.5">
        <label className="flex items-center text-[11px] uppercase tracking-wider text-neutral-800 font-semibold">
          {icon}
          <span className="ml-1.5">{label}</span>
        </label>
        <span className="text-[10px] text-neutral-400 font-mono">
          {Math.round(x)}% {Math.round(y)}% {scale !== 100 ? `• Zoom: ${scale}%` : ''}
        </span>
      </div>

      {/* Frame interactivo arrastrable con el mouse */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchMove={handlePointerAction}
        onTouchStart={handlePointerAction}
        title="Hacé click y arrastrá con el mouse para mover el foco exacto de la foto"
        className={`relative bg-neutral-900 rounded-xs overflow-hidden border border-neutral-300 shadow-2xs cursor-crosshair select-none group ${
          isDesktop ? 'w-full aspect-[16/9]' : 'w-28 sm:w-32 aspect-[9/16] mx-auto'
        }`}
      >
        {/* Capa de fondo con desenfoque suave para rellenar vacíos si se aleja el zoom */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-md scale-110 opacity-70"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />

        {/* Imagen principal con foco y zoom interactivo real */}
        <div
          className="absolute inset-0 transition-all duration-75"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: `${x}% ${y}%`,
            backgroundRepeat: 'no-repeat',
            // Si scale >= 100%, mantenemos cover y escalamos con transform hacia adentro.
            // Si scale < 100% (alejar), cambiamos el background-size para que muestre más de la imagen original completa (contain / porcentaje expansivo).
            backgroundSize: scale >= 100 
              ? 'cover' 
              : `${Math.round(100 / (scale / 100))}% ${Math.round(100 / (scale / 100))}%`,
            transform: scale > 100 ? `scale(${scale / 100})` : undefined,
            transformOrigin: `${x}% ${y}%`
          }}
        />

        {/* Retícula visual guía de tercios */}
        <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 border border-white/40">
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
        </div>

        {/* Pin o retículo del punto focal arrastrable */}
        <div
          className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center transition-all duration-75"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <div className="w-4 h-4 rounded-full border-2 border-white shadow-md bg-black/40 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          </div>
        </div>

        {/* Mensaje sutil al pasar el mouse */}
        <div className="absolute bottom-1 inset-x-1 text-center pointer-events-none">
          <span className="text-[9px] text-white/90 bg-black/60 px-1.5 py-0.5 rounded-xs tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity">
            Arrastrá para encuadrar
          </span>
        </div>
      </div>

      {/* Control de Zoom: Alejar / Normal / Acercar */}
      {onScaleChange && (
        <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center space-x-1.5 text-neutral-500">
            <span className="text-[10px] uppercase tracking-wider text-neutral-600 font-medium">
              Zoom:
            </span>
          </div>

          <div className="flex-1 flex items-center space-x-2">
            <span className="text-[9px] text-neutral-500">Alejar</span>
            <input
              type="range"
              min={50}
              max={180}
              step={5}
              value={scale}
              onChange={e => onScaleChange(parseInt(e.target.value) || 100)}
              className="flex-1 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              title={`Nivel de zoom: ${scale}%`}
            />
            <span className="text-[9px] text-neutral-500">Acercar</span>
          </div>

          <button
            type="button"
            onClick={() => onScaleChange(100)}
            className={`text-[10px] px-2 py-0.5 rounded-xs border cursor-pointer transition-colors ${
              scale === 100 
                ? 'bg-neutral-900 text-white border-neutral-900' 
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
            }`}
            title="Restablecer zoom a Normal (100%)"
          >
            {scale === 100 ? 'Normal (100%)' : `${scale}%`}
          </button>
        </div>
      )}
    </div>
  )
}
