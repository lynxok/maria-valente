import React, { useEffect, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Mail, X } from 'lucide-react'
import { contentService } from '../services/contentService'
import type { ArtworkCategory } from '../types'

interface MobileMenuModalProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const CURRENT_YEAR = new Date().getFullYear()

export const MobileMenuModal: React.FC<MobileMenuModalProps> = ({
  isOpen,
  onClose,
  triggerRef
}) => {
  const location = useLocation()
  const settings = contentService.getSettings()
  const sections = contentService.getSections().filter(s => s.isActive)

  const modalRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const activeItemRef = useRef<HTMLAnchorElement | null>(null)

  // Cierre suave con callback
  const handleClose = useCallback((callback?: () => void) => {
    onClose()
    if (callback) callback()
    triggerRef.current?.focus()
  }, [onClose, triggerRef])

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, handleClose])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return
    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length > 0) {
      focusable[0].focus()
    }
  }, [isOpen])

  // Scroll automático para que el ítem activo quede visible al abrir
  useEffect(() => {
    if (isOpen && activeItemRef.current && scrollContainerRef.current) {
      // Dejar que termine la animación de entrada antes de scrollear
      const timer = setTimeout(() => {
        activeItemRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }, 120)
      return () => clearTimeout(timer)
    }
  }, [isOpen, location.pathname])

  if (!isOpen) return null

  // Helper para obtener la miniatura óptima (menuImage > destacada > primera)
  const getCategoryThumbnail = (cat: ArtworkCategory): string | undefined => {
    if (cat.menuImage) return cat.menuImage
    const featured = cat.images?.find(img => img.destacada)
    if (featured) return featured.thumbnailUrl || featured.url
    if (cat.coverImage) return cat.coverImage
    return cat.images?.[0]?.thumbnailUrl || cat.images?.[0]?.url
  }

  // Subpáginas de CV
  const cvSubpages = [
    { label: 'Biografía', path: '/cv/biografia', desc: 'Trayectoria y formación' },
    { label: 'CV Extendido', path: '/cv/cv-extendido', desc: 'Premios, salones y publicaciones' },
    { label: 'CV en Inglés', path: '/cv/cv-ingles', desc: 'Biography & exhibitions' }
  ]

  let globalRowIndex = 0

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
      className="fixed inset-0 z-50 bg-white flex flex-col justify-between overflow-hidden animate-fade-in"
    >
      {/* 1. Barra Superior Fija: Nombre a la izquierda y UN solo botón × a la derecha */}
      <div className="h-14 px-4 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white z-20">
        <Link
          to="/"
          onClick={() => handleClose()}
          className="text-base font-light tracking-widest uppercase text-neutral-900 flex items-center h-11 focus-visible:outline-2"
        >
          {settings.artistName}
        </Link>

        {/* UN solo botón X a la derecha */}
        <button
          type="button"
          onClick={() => handleClose()}
          className="w-11 h-11 flex items-center justify-center text-neutral-900 hover:text-neutral-500 cursor-pointer focus-visible:outline-2 focus-visible:outline-neutral-900 -mr-1"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Contenido scrolleable continuo en un solo panel */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 relative"
      >
        <div className="py-4 space-y-6">
          {sections.map(section => {
            const cats = contentService.getPublicCategoriesBySection(section.id)
            if (section.type !== 'cv' && cats.length === 0) return null

            return (
              <div key={section.id} className="relative">
                {/* Título de sección: gris, mayúsculas, letter-spacing amplio, sticky */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs py-2 border-b border-neutral-100 mb-1">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    {section.title}
                  </h3>
                </div>

                {/* Ítems de la sección */}
                {section.type === 'cv' ? (
                  /* Ítems de CV: sin miniatura, solo texto con un › gris, filas de 48px */
                  <div className="divide-y divide-neutral-100">
                    {cvSubpages.map(sub => {
                      const isCurrent = location.pathname === sub.path
                      const staggerDelay = Math.min(300, globalRowIndex++ * 30)

                      return (
                        <Link
                          key={sub.path}
                          ref={isCurrent ? activeItemRef : null}
                          to={sub.path}
                          onClick={() => handleClose()}
                          style={{ animationDelay: `${staggerDelay}ms` }}
                          className={`min-h-[48px] py-3 flex items-center justify-between relative group transition-colors animate-subitem ${
                            isCurrent ? 'bg-neutral-50/80 font-semibold' : 'hover:bg-neutral-50/40'
                          }`}
                        >
                          {/* Raya vertical de 2px a la izquierda para ítem activo */}
                          {isCurrent && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-neutral-900" />
                          )}

                          <div className={isCurrent ? 'pl-3' : 'pl-1'}>
                            <p className={`text-[17px] tracking-wide uppercase ${
                              isCurrent ? 'text-neutral-950 font-semibold' : 'text-neutral-800 font-light'
                            }`}>
                              {sub.label}
                            </p>
                            <p className="text-[11px] text-neutral-400 font-sans">
                              {sub.desc}
                            </p>
                          </div>

                          <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 transition-colors pr-1" />
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  /* Ítems de Obras, Intervenciones, Exposiciones: miniatura 3:4 (~44x56px, object-cover) */
                  <div className="divide-y divide-neutral-100">
                    {cats.map(cat => {
                      const href = `/${section.slug}/${cat.slug}`
                      const isCurrent = location.pathname === href
                      const thumb = getCategoryThumbnail(cat)
                      const staggerDelay = Math.min(300, globalRowIndex++ * 30)

                      // Subtítulo: lugar/año configurado en Admin o conteo de obras
                      const subLabel = cat.yearPlace || `${cat.images?.length || 0} ${cat.images?.length === 1 ? 'obra' : 'obras'}`

                      return (
                        <Link
                          key={cat.id}
                          ref={isCurrent ? activeItemRef : null}
                          to={href}
                          onClick={() => handleClose()}
                          style={{ animationDelay: `${staggerDelay}ms` }}
                          className={`min-h-[56px] py-2 flex items-center relative group transition-colors animate-subitem ${
                            isCurrent ? 'bg-neutral-50/80' : 'hover:bg-neutral-50/40'
                          }`}
                        >
                          {/* Raya vertical de 2px para ítem activo */}
                          {isCurrent && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-10 bg-neutral-900" />
                          )}

                          {/* Miniatura 3:4 (~44x56px, object-cover) */}
                          <div className={`w-[44px] h-[56px] bg-neutral-100 shrink-0 border border-neutral-200 rounded-xs overflow-hidden mr-3.5 flex items-center justify-center ${
                            isCurrent ? 'ml-3' : 'ml-1'
                          }`}>
                            {thumb ? (
                              <img
                                src={thumb}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] text-neutral-400 font-serif">MV</span>
                            )}
                          </div>

                          {/* Nombre de la serie y cantidad de obras / año */}
                          <div className="flex-1 min-w-0 pr-2">
                            <p className={`text-[17px] tracking-wide uppercase truncate ${
                              isCurrent ? 'font-semibold text-neutral-950' : 'font-light text-neutral-800'
                            }`}
                            style={{ fontFamily: "'Raleway', sans-serif" }}
                            >
                              {cat.nombre || cat.title}
                            </p>
                            <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                              {subLabel}
                            </p>
                          </div>

                          <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 transition-colors shrink-0 pr-1" />
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Degradado blanco sutil al pie de la lista para indicar que hay más contenido */}
        <div className="sticky bottom-0 inset-x-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>

      {/* 3. Pie Fijo: Botones píldora Contacto (mailto) y Facebook (mínimo 44px de alto) */}
      <div className="p-4 border-t border-neutral-100 bg-white shrink-0 z-20">
        <div className="grid grid-cols-2 gap-3 mb-2.5">
          {settings.email && (
            <a
              href={`mailto:${settings.email}`}
              className="min-h-[44px] px-4 py-2 border border-neutral-200 hover:border-neutral-900 rounded-full flex items-center justify-center text-xs tracking-wider uppercase text-neutral-800 hover:bg-neutral-50 transition-colors focus-visible:outline-2"
            >
              <Mail className="w-4 h-4 mr-2 text-neutral-600" />
              <span>Contacto</span>
            </a>
          )}

          {settings.facebookUrl && (
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 py-2 border border-neutral-200 hover:border-neutral-900 rounded-full flex items-center justify-center text-xs tracking-wider uppercase text-neutral-800 hover:bg-neutral-50 transition-colors focus-visible:outline-2"
            >
              <svg 
                role="img" 
                viewBox="0 0 32 32" 
                className="w-4 h-4 mr-2 fill-current text-neutral-700" 
                aria-hidden="true"
              >
                <path d="M23.738.214v4.714h-2.804c-1.023 0-1.714.214-2.071.643s-.536 1.071-.536 1.929v3.375h5.232l-.696 5.286h-4.536v13.554h-5.464V16.161H8.309v-5.286h4.554V6.982c0-2.214.62-3.932 1.857-5.152S17.607 0 19.666 0c1.75 0 3.107.071 4.071.214z" />
              </svg>
              <span>Facebook</span>
            </a>
          )}
        </div>

        <p className="text-[11px] text-center uppercase tracking-wider text-neutral-400">
          © {CURRENT_YEAR} {settings.artistName}
        </p>

        {/* Desarrollado por LYNX Consulting (inline al lado) */}
        <div className="mt-2.5 flex items-center justify-center space-x-2 text-neutral-400">
          <span className="text-[10px] tracking-wider uppercase font-light whitespace-nowrap">
            Desarrollado por
          </span>
          <a
            href="https://lnx.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            title="LYNX Consulting"
            className="inline-flex items-center opacity-85 hover:opacity-100 transition-opacity"
          >
            <img
              src="/lynx-logo-black.png"
              alt="LYNX Consulting"
              className="h-5 w-auto object-contain"
            />
          </a>
        </div>
      </div>
    </div>
  )
}
