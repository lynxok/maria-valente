import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { contentService } from '../services/contentService'
import type { ArtworkImage } from '../types'
import { X, ChevronLeft, ChevronRight, Maximize2, Layers } from 'lucide-react'

export const GalleryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const category = categorySlug ? contentService.getCategoryBySlug(categorySlug) : undefined
  const settings = contentService.getSettings()
  const isAdmin = contentService.isAdminAuthenticated()

  // Lightbox state: track current artwork and detail sub-index
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkImage | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0) // 0: main image, >0: detail images
  
  // Ref for focus trap & restore focus
  const triggerButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const modalRef = useRef<HTMLDivElement | null>(null)

  // Touch swipe support in lightbox
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // SEO Title
  useEffect(() => {
    if (category) {
      document.title = `${category.nombre || category.title} | ${settings.artistName}`
    }
  }, [category, settings.artistName])

  // Category images
  const allImages = React.useMemo(() => category?.images || [], [category?.images])
  const featuredArtwork = allImages.find(img => img.destacada) || allImages[0]

  const openLightbox = (artwork: ArtworkImage, detailIdx: number = 0) => {
    setSelectedArtwork(artwork)
    setActiveImageIndex(detailIdx)
  }

  const closeLightbox = React.useCallback(() => {
    const closedId = selectedArtwork?.id
    setSelectedArtwork(null)
    setActiveImageIndex(0)
    if (closedId && triggerButtonRefs.current[closedId]) {
      setTimeout(() => triggerButtonRefs.current[closedId]?.focus(), 50)
    }
  }, [selectedArtwork])

  const goToNextArtwork = React.useCallback(() => {
    if (!selectedArtwork) return
    const currentIndex = allImages.findIndex(img => img.id === selectedArtwork.id)
    const nextIdx = (currentIndex + 1) % allImages.length
    setSelectedArtwork(allImages[nextIdx])
    setActiveImageIndex(0)
  }, [selectedArtwork, allImages])

  const goToPrevArtwork = React.useCallback(() => {
    if (!selectedArtwork) return
    const currentIndex = allImages.findIndex(img => img.id === selectedArtwork.id)
    const prevIdx = (currentIndex === 0 ? allImages.length - 1 : currentIndex - 1)
    setSelectedArtwork(allImages[prevIdx])
    setActiveImageIndex(0)
  }, [selectedArtwork, allImages])

  // Keyboard navigation & focus trap inside lightbox
  useEffect(() => {
    if (!selectedArtwork) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox()
      } else if (e.key === 'ArrowRight') {
        goToNextArtwork()
      } else if (e.key === 'ArrowLeft') {
        goToPrevArtwork()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    // Focus close button inside modal
    const closeBtn = modalRef.current?.querySelector('button')
    closeBtn?.focus()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedArtwork, activeImageIndex, closeLightbox, goToNextArtwork, goToPrevArtwork])

  if (!category) {
    return (
      <div className="p-8 md:p-12 text-center max-w-xl mx-auto">
        <h2 className="text-xl font-normal text-neutral-800 uppercase tracking-widest mb-3">
          Categoría no encontrada
        </h2>
        <p className="text-sm text-neutral-500 mb-6">
          La categoría o serie solicitada no existe o fue modificada.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2 text-xs uppercase tracking-widest border border-neutral-300 hover:border-neutral-900 transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    )
  }

  // Lista aplanada de imágenes del lightbox (obra principal + sus detalles)
  const currentArtworkImageList = selectedArtwork ? [
    selectedArtwork,
    ...(selectedArtwork.detailImages || [])
  ] : []

  const currentDisplayImage = currentArtworkImageList[activeImageIndex] || selectedArtwork

  // Swipe handlers in modal
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50) goToNextArtwork()
    if (diff < -50) goToPrevArtwork()
    touchStartX.current = null
    touchEndX.current = null
  }

  // Formato de ficha técnica: Título · Técnica · Medidas · Año
  const formatFicha = (img?: ArtworkImage) => {
    if (!img) return ''
    const parts: string[] = []
    if (img.title) parts.push(img.title)
    if (img.tecnica) parts.push(img.tecnica)
    if (img.medidas) parts.push(img.medidas)
    if (img.anio) parts.push(img.anio)
    return parts.join(' · ')
  }

  return (
    <div className="p-4 sm:p-6 md:p-12 max-w-6xl mx-auto">
      {/* Category Header */}
      <header className="mb-6 md:mb-10 pb-3 md:pb-4 border-b border-neutral-100 flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-light tracking-wider text-neutral-900 uppercase">
            {category.nombre || category.title}
          </h1>
          {category.description && (
            <p className="mt-2 md:mt-3 text-xs sm:text-sm text-neutral-600 max-w-3xl leading-relaxed">
              {category.description}
            </p>
          )}
        </div>

        {isAdmin && (
          <Link
            to="/admin/dashboard"
            className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors shrink-0"
            title="Ir al panel admin"
          >
            Admin
          </Link>
        )}
      </header>

      {/* Obra Destacada Grande (Recupera la impronta original sin recortes) */}
      {featuredArtwork && (
        <section className="mb-8 md:mb-14 bg-neutral-50/60 p-3 sm:p-6 md:p-8 rounded-xs border border-neutral-100" aria-label="Obra destacada">
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <button
              type="button"
              onClick={() => openLightbox(featuredArtwork, 0)}
              className="group relative cursor-pointer focus-visible:outline-2 focus-visible:outline-neutral-900 overflow-hidden"
              aria-label={`Ver obra destacada en tamaño completo: ${featuredArtwork.title || 'Obra destacada'}`}
            >
              <img
                src={featuredArtwork.url}
                alt={featuredArtwork.title || category.title}
                decoding="async"
                className="max-h-[360px] sm:max-h-[460px] md:max-h-[580px] w-auto object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all flex items-end justify-end p-3">
                <span className="p-2 bg-white/90 text-neutral-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <Maximize2 className="w-4 h-4" />
                </span>
              </div>
            </button>

            {/* Ficha técnica de la obra destacada */}
            <div className="mt-4 text-center">
              <p className="text-sm font-medium tracking-wider text-neutral-900 uppercase">
                {featuredArtwork.title || 'Sin título'}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {formatFicha(featuredArtwork)}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Grilla de Miniaturas en Proporción 3:4 sin recortes bruscos */}
      {allImages.length > 0 ? (
        <section aria-label="Catálogo de la serie">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-6">
            Catálogo completo ({allImages.length})
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8">
            {allImages.map(image => (
              <div key={image.id} className="flex flex-col">
                <button
                  type="button"
                  ref={el => { triggerButtonRefs.current[image.id] = el }}
                  onClick={() => openLightbox(image, 0)}
                  aria-label={`Abrir detalle de ${image.title || 'obra'}`}
                  className="group relative aspect-[3/4] bg-neutral-100 overflow-hidden cursor-pointer rounded-xs border border-neutral-200/80 transition-all hover:border-neutral-400 focus-visible:outline-2 focus-visible:outline-neutral-900 p-2 flex items-center justify-center"
                >
                  <img
                    src={image.thumbnailUrl || image.url}
                    alt={image.title || category.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                  />

                  {/* Indicador de imágenes de detalle adicionales */}
                  {image.detailImages && image.detailImages.length > 0 && (
                    <span 
                      className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded-xs flex items-center space-x-1"
                      title={`${image.detailImages.length + 1} fotos disponibles`}
                    >
                      <Layers className="w-3 h-3 mr-0.5" />
                      <span>+{image.detailImages.length}</span>
                    </span>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-end p-2.5">
                    <div className="text-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity w-full flex items-center justify-between">
                      <span className="text-[11px] font-medium truncate bg-white/90 px-2 py-0.5 rounded-xs">
                        {image.title || 'Ver obra'}
                      </span>
                      <span className="p-1.5 bg-white/90 rounded-full">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </button>

                {/* Reseña al pie de la miniatura */}
                <div className="mt-2 text-left">
                  <h3 className="text-xs font-medium tracking-wide uppercase text-neutral-800 truncate">
                    {image.title || 'Sin título'}
                  </h3>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    {[image.tecnica, image.anio].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="py-20 text-center border border-dashed border-neutral-200 rounded-lg">
          <p className="text-sm text-neutral-400 uppercase tracking-widest">
            Aún no se han añadido obras a esta colección.
          </p>
        </div>
      )}

      {/* Lightbox Modal Profesional */}
      {selectedArtwork && currentDisplayImage && (
        <div 
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Visor de obra: ${selectedArtwork.title || 'Detalle'}`}
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Botón de cierre */}
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Cerrar visor de imagen (Escape)"
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2.5 transition-colors cursor-pointer rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navegación entre obras */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={goToPrevArtwork}
                aria-label="Obra anterior (flecha izquierda)"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 transition-colors cursor-pointer rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white hidden sm:block"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                type="button"
                onClick={goToNextArtwork}
                aria-label="Obra siguiente (flecha derecha)"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 transition-colors cursor-pointer rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white hidden sm:block"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Contenedor Principal de la Imagen y Ficha */}
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center w-full">
            <div className="relative max-h-[72vh] flex items-center justify-center">
              <img
                src={currentDisplayImage.url}
                alt={currentDisplayImage.title || selectedArtwork.title || category.title}
                decoding="async"
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-xs shadow-2xl"
              />
            </div>

            {/* Selector de vistas de detalle si esta obra tiene fotos adicionales */}
            {currentArtworkImageList.length > 1 && (
              <div className="flex space-x-2 mt-3" aria-label="Fotos de la obra y detalles">
                {currentArtworkImageList.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`Ver foto ${idx + 1}`}
                    className={`w-10 h-10 rounded-xs overflow-hidden border-2 cursor-pointer transition-all ${
                      activeImageIndex === idx ? 'border-white scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.thumbnailUrl || img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Ficha técnica descriptiva bajo la obra */}
            <div className="mt-4 text-center max-w-2xl px-4">
              <p className="text-white text-sm tracking-widest uppercase font-light">
                {currentDisplayImage.title || selectedArtwork.title || 'Sin título'}
              </p>
              <p className="text-neutral-400 text-xs mt-1 tracking-wide">
                {formatFicha(currentDisplayImage.tecnica ? currentDisplayImage : selectedArtwork)}
              </p>
              
              {/* Contador de obras (ej. 4 / 12) */}
              <p className="text-neutral-500 text-[11px] mt-2 font-mono" aria-live="polite">
                {allImages.findIndex(img => img.id === selectedArtwork.id) + 1} / {allImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
