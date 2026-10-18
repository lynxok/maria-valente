import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Mail } from 'lucide-react'
import { contentService } from '../services/contentService'

const currentYear = new Date().getFullYear()

interface SidebarProps {
  onLinkClick?: () => void
  isTransparent?: boolean
  className?: string
  isMobileModal?: boolean
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onLinkClick, 
  isTransparent = false,
  className = '',
  isMobileModal = false
}) => {
  const location = useLocation()
  const settings = contentService.getSettings()
  const sections = contentService.getSections().filter(s => s.isActive)
  const isAdmin = contentService.isAdminAuthenticated()

  // Track accordion state (exclusivo: una sola sección abierta a la vez)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    // Si estamos en una ruta específica, expandir automáticamente esa sección
    const path = location.pathname
    if (path.startsWith('/cv')) return { cv: true }
    const match = path.match(/^\/([^/]+)/)
    if (match && match[1]) {
      const section = sections.find(s => s.slug === match[1])
      if (section) return { [section.id]: true }
    }
    const defaultState: Record<string, boolean> = { obras: true }
    return defaultState
  })

  // Sincronizar automáticamente la sección abierta cuando cambia la ruta
  useEffect(() => {
    const path = location.pathname
    if (path === '/') {
      // En la home mantenemos Obras abierta por defecto
      setOpenSections({ obras: true })
      return
    }
    if (path.startsWith('/cv')) {
      setOpenSections({ cv: true })
      return
    }
    const match = path.match(/^\/([^/]+)/)
    if (match && match[1]) {
      const section = sections.find(s => s.slug === match[1])
      if (section) {
        setOpenSections({ [section.id]: true })
      }
    }
  }, [location.pathname])

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => {
      const willOpen = !prev[sectionId]
      if (willOpen) {
        // Al abrir una sección, todas las demás se colapsan
        return { [sectionId]: true }
      } else {
        // Si se toca la que ya está abierta, se cierra
        return {}
      }
    })
  }

  // Home: texto oscuro legible sobre las fotos y degradado BLANCO sutil
  const textTitleColor = isTransparent 
    ? 'text-neutral-900' 
    : 'text-neutral-900'
  const textSubColor = isTransparent 
    ? 'text-neutral-600' 
    : 'text-neutral-500'
  const sectionTitleColor = isTransparent
    ? 'text-neutral-800 hover:text-neutral-950'
    : 'text-neutral-800 hover:text-neutral-500'
  const borderColor = isTransparent
    ? 'border-neutral-300/60'
    : 'border-neutral-200/70'
  const linkDefaultColor = isTransparent
    ? 'text-neutral-700 hover:text-neutral-950'
    : 'text-neutral-600 hover:text-neutral-900'
  const linkActiveColor = 'text-neutral-950 font-semibold'
  const indicatorActiveColor = 'bg-neutral-900'
  const underlineColor = 'bg-neutral-900/35'

  return (
    <aside 
      className={`w-full md:w-64 lg:w-72 md:h-screen md:sticky md:top-0 ${isMobileModal ? 'flex' : 'hidden md:flex'} flex-col justify-between p-6 md:p-8 z-30 transition-colors ${
        isTransparent 
          ? 'bg-gradient-to-r from-white/90 via-white/50 to-transparent md:border-r-0' 
          : 'bg-white md:border-r border-neutral-100'
      } ${className}`}
      aria-label="Navegación principal"
    >
      <div>
        {/* Brand Header */}
        <div className="mb-10 text-center md:text-left">
          <Link 
            to="/" 
            onClick={onLinkClick}
            className="group block focus-visible:outline-2 focus-visible:outline-neutral-800"
            aria-label="Ir a la página de inicio"
          >
            <h1 className={`text-xl md:text-2xl font-light tracking-wider uppercase transition-colors duration-200 ${textTitleColor}`}>
              {settings.artistName}
            </h1>
            <p className={`text-xs tracking-widest uppercase font-light mt-1 transition-colors duration-200 ${textSubColor}`}>
              {settings.tagline}
            </p>
          </Link>
        </div>

        {/* Dynamic Navigation Accordion */}
        <nav className="space-y-4" aria-label="Secciones del sitio">
          {sections.map((section, sIdx) => {
            const isOpen = !!openSections[section.id]
            const sectionCats = contentService.getPublicCategoriesBySection(section.id)

            if (section.type !== 'cv' && sectionCats.length === 0) {
              return null
            }

            return (
              <div 
                key={section.id} 
                className={`border-b ${borderColor} pb-3 transition-colors duration-200`}
                style={isMobileModal ? { animationDelay: `${sIdx * 40}ms` } : undefined}
              >
                {/* 1. Sección Principal con microanimación en hover/focus */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={isOpen}
                  aria-controls={`section-menu-${section.id}`}
                  className={`group relative w-full flex items-center justify-between text-left text-sm font-medium tracking-wider uppercase py-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-neutral-800 transition-colors duration-200 ${sectionTitleColor}`}
                >
                  <span className="relative inline-block transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-focus-visible:translate-x-1">
                    {section.title}
                    {/* Línea de 1px que crece con scaleX(0 -> 1) */}
                    <span 
                      aria-hidden="true"
                      className={`absolute left-0 -bottom-0.5 h-[1px] w-full ${underlineColor} origin-left scale-x-0 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100`} 
                    />
                  </span>

                  {/* Chevron que rota 90deg y se desplaza translateX(2px) en hover */}
                  <span className="transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5">
                    <ChevronRight 
                      className={`w-3.5 h-3.5 opacity-70 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isOpen ? 'rotate-90' : 'rotate-0'
                      }`} 
                      aria-hidden="true" 
                    />
                  </span>
                </button>

                {/* 3. Desplegable con truco grid-template-rows: 0fr -> 1fr y stagger de hijos */}
                <div 
                  id={`section-menu-${section.id}`}
                  className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className={`mt-2 pl-3 space-y-2 border-l relative ${borderColor}`}>
                      {section.type === 'cv' ? (
                        <>
                          {[
                            { path: '/cv/biografia', label: 'Biografía' },
                            { path: '/cv/cv-extendido', label: 'CV Extendido' },
                            { path: '/cv/cv-ingles', label: 'CV Inglés' }
                          ].map((item, itemIdx) => {
                            const isCurrent = location.pathname === item.path
                            return (
                              <li 
                                key={item.path}
                                className={isOpen ? 'animate-subitem relative group' : 'relative group'}
                                style={{ animationDelay: `${itemIdx * 35}ms` }}
                              >
                                {/* Indicador de 2px en la línea guía con scaleY 0 -> 1 */}
                                <span 
                                  aria-hidden="true"
                                  className={`absolute -left-[13px] top-1/2 -translate-y-1/2 w-[2px] h-3.5 origin-center transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                    isCurrent 
                                      ? `${indicatorActiveColor} scale-y-100 opacity-100` 
                                      : `${indicatorActiveColor} scale-y-0 opacity-0 group-hover:scale-y-100 group-hover:opacity-60 group-focus-within:scale-y-100 group-focus-within:opacity-60`
                                  }`}
                                />
                                <Link
                                  to={item.path}
                                  onClick={onLinkClick}
                                  className={`block text-xs uppercase tracking-wider transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-1 ${
                                    isCurrent ? linkActiveColor : linkDefaultColor
                                  }`}
                                >
                                  {item.label}
                                </Link>
                              </li>
                            )
                          })}
                        </>
                      ) : (
                        sectionCats.map((cat, catIdx) => {
                          const href = `/${section.slug}/${cat.slug}`
                          const isCurrent = location.pathname === href
                          return (
                            <li 
                              key={cat.id}
                              className={isOpen ? 'animate-subitem relative group' : 'relative group'}
                              style={{ animationDelay: `${catIdx * 35}ms` }}
                            >
                              {/* 2 & 4. Indicador de 2px vertical con fade/scaleY */}
                              <span 
                                aria-hidden="true"
                                className={`absolute -left-[13px] top-1/2 -translate-y-1/2 w-[2px] h-3.5 origin-center transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                  isCurrent 
                                    ? `${indicatorActiveColor} scale-y-100 opacity-100` 
                                    : `${indicatorActiveColor} scale-y-0 opacity-0 group-hover:scale-y-100 group-hover:opacity-60 group-focus-within:scale-y-100 group-focus-within:opacity-60`
                                }`}
                              />
                              <Link
                                to={href}
                                onClick={onLinkClick}
                                className={`block text-xs uppercase tracking-wider transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-1 ${
                                  isCurrent ? linkActiveColor : linkDefaultColor
                                }`}
                              >
                                {cat.nombre || cat.title}
                              </Link>
                            </li>
                          )
                        })
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </nav>
      </div>

      {/* Footer / Socials / Admin Access */}
      <div className={`pt-8 border-t ${borderColor} mt-8 transition-colors duration-200`}>
        <div className="flex items-center space-x-3 mb-4">
          {settings.email && (
            <a
              href={`mailto:${settings.email}`}
              title="Enviar correo a María Valente"
              aria-label="Enviar correo electrónico"
              className={`${textSubColor} hover:text-neutral-900 transition-colors duration-200 focus-visible:outline-1`}
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
            </a>
          )}
          {settings.facebookUrl && (
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Perfil de Facebook"
              aria-label="Abrir Facebook de María Valente en pestaña nueva"
              className={`${textSubColor} hover:text-neutral-900 transition-colors duration-200 focus-visible:outline-1 flex items-center justify-center`}
            >
              <svg 
                role="img" 
                viewBox="0 0 32 32" 
                className="w-3.5 h-3.5 fill-current" 
                aria-hidden="true"
              >
                <path d="M23.738.214v4.714h-2.804c-1.023 0-1.714.214-2.071.643s-.536 1.071-.536 1.929v3.375h5.232l-.696 5.286h-4.536v13.554h-5.464V16.161H8.309v-5.286h4.554V6.982c0-2.214.62-3.932 1.857-5.152S17.607 0 19.666 0c1.75 0 3.107.071 4.071.214z" />
              </svg>
            </a>
          )}
          
          {/* Acceso discreto al login / panel admin: solo visible si el usuario ya inició sesión */}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              title="Panel de Administración"
              aria-label="Panel de Administración"
              className={`ml-auto text-[10px] uppercase tracking-wider transition-opacity duration-200 opacity-60 hover:opacity-100 ${textSubColor}`}
            >
              Editar
            </Link>
          )}
        </div>

        <p className={`text-[11px] uppercase tracking-wider transition-colors duration-200 ${textSubColor}`}>
          © {currentYear} {settings.artistName}
        </p>

        {/* Desarrollado por LYNX Consulting (inline al lado) */}
        <div className="mt-3 pt-3 border-t border-neutral-200/50 flex items-center space-x-2">
          <span className={`text-[10px] tracking-wider uppercase font-light whitespace-nowrap ${textSubColor}`}>
            Desarrollado por
          </span>
          <a
            href="https://lnx.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            title="LYNX Consulting"
            className="inline-flex items-center opacity-85 hover:opacity-100 transition-opacity focus-visible:outline-1"
          >
            <img
              src="/lynx-logo-black.png"
              alt="LYNX Consulting"
              className="h-6 w-auto object-contain"
            />
          </a>
        </div>
      </div>
    </aside>
  )
}

import { MobileMenuModal } from './MobileMenuModal'

export const NavbarMobile: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const settings = contentService.getSettings()
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null)

  // Bloqueo de scroll y aria-hidden/inert en el contenido principal mientras el menú está abierto
  useEffect(() => {
    const mainEl = document.querySelector('main')
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      if (mainEl) {
        mainEl.setAttribute('aria-hidden', 'true')
        mainEl.setAttribute('inert', '')
      }
    } else {
      document.body.style.overflow = ''
      if (mainEl) {
        mainEl.removeAttribute('aria-hidden')
        mainEl.removeAttribute('inert')
      }
    }
    return () => {
      document.body.style.overflow = ''
      if (mainEl) {
        mainEl.removeAttribute('aria-hidden')
        mainEl.removeAttribute('inert')
      }
    }
  }, [isOpen])

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-neutral-200 px-4 h-14 flex items-center justify-between">
        <Link 
          to="/" 
          onClick={() => setIsOpen(false)}
          className="text-base font-light tracking-widest uppercase text-neutral-900 min-h-[44px] flex items-center focus-visible:outline-2"
        >
          {settings.artistName}
        </Link>
        
        {/* Botón Hamburguesa accesible con área táctil mínima de 44x44 y precarga de miniaturas */}
        <button
          ref={triggerButtonRef}
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          onMouseEnter={() => {
            // Precarga de miniaturas del menú móvil para apertura instantánea sin parpadeo
            const cats = contentService.getCategories()
            cats.slice(0, 8).forEach(cat => {
              const url = cat.menuImage || cat.images?.find(i => i.destacada)?.thumbnailUrl || cat.coverImage || cat.images?.[0]?.url
              if (url) {
                const img = new Image()
                img.src = url
              }
            })
          }}
          onTouchStart={() => {
            const cats = contentService.getCategories()
            cats.slice(0, 8).forEach(cat => {
              const url = cat.menuImage || cat.images?.find(i => i.destacada)?.thumbnailUrl || cat.coverImage || cat.images?.[0]?.url
              if (url) {
                const img = new Image()
                img.src = url
              }
            })
          }}
          aria-label={isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-expanded={isOpen}
          className="relative w-11 h-11 flex flex-col items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-neutral-900 -mr-1"
        >
          <span 
            className={`w-5 h-0.5 bg-neutral-900 rounded-full transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isOpen ? 'rotate-45 translate-y-1.5' : 'translate-y-0'
            }`} 
          />
          <span 
            className={`w-5 h-0.5 bg-neutral-900 rounded-full my-1 transition-opacity duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`} 
          />
          <span 
            className={`w-5 h-0.5 bg-neutral-900 rounded-full transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-0'
            }`} 
          />
        </button>
      </header>

      {/* Rediseño de Navegación Móvil en 2 Niveles */}
      <MobileMenuModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerButtonRef}
      />
    </>
  )
}
