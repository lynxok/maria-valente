import React, { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { contentService } from '../services/contentService'

export const CVPage: React.FC = () => {
  const { subpage } = useParams<{ subpage: string }>()
  const cv = contentService.getCV()
  const settings = contentService.getSettings()

  const getPageData = () => {
    switch (subpage) {
      case 'biografia':
        return {
          title: 'Biografía',
          content: cv.biography,
        }
      case 'cv-extendido':
        return {
          title: 'CV Extendido',
          content: cv.extendedCv,
        }
      case 'cv-ingles':
        return {
          title: 'Curriculum Vitae (English)',
          content: cv.biographyEn || cv.biography,
        }
      default:
        return {
          title: 'Biografía',
          content: cv.biography,
        }
    }
  }

  const { title, content } = getPageData()

  // SEO Title
  useEffect(() => {
    document.title = `${title} | ${settings.artistName}`
  }, [title, settings.artistName])

  // Format content paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0)

  return (
    <article className="p-6 md:p-12 max-w-4xl mx-auto">
      {/* Subnav links */}
      <nav 
        className="flex space-x-6 pb-4 mb-8 border-b border-neutral-100 text-xs uppercase tracking-widest"
        aria-label="Secciones del CV"
      >
        <Link
          to="/cv/biografia"
          className={`pb-1 transition-colors ${
            subpage === 'biografia'
              ? 'text-neutral-900 border-b-2 border-neutral-900 font-semibold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Biografía
        </Link>
        <Link
          to="/cv/cv-extendido"
          className={`pb-1 transition-colors ${
            subpage === 'cv-extendido'
              ? 'text-neutral-900 border-b-2 border-neutral-900 font-semibold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          CV Extendido
        </Link>
        <Link
          to="/cv/cv-ingles"
          className={`pb-1 transition-colors ${
            subpage === 'cv-ingles'
              ? 'text-neutral-900 border-b-2 border-neutral-900 font-semibold'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          CV Inglés
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-light tracking-wide text-neutral-900 uppercase">
          {title}
        </h1>
      </header>

      {/* Structured Text Content */}
      <div className="max-w-[65ch]">
        {/* Foto de retrato opcional si está configurada en Admin */}
        {cv.portrait && (
          <div className="mb-8 overflow-hidden rounded-xs border border-neutral-200/80 shadow-xs max-w-xs">
            <img 
              src={cv.portrait} 
              alt={settings.artistName}
              loading="lazy"
              decoding="async"
              className="w-full h-auto object-cover" 
            />
          </div>
        )}

        <div className="space-y-6 text-neutral-800 text-[16px] leading-[1.7] text-left font-light" style={{ fontFamily: "'Raleway', sans-serif" }}>
          {paragraphs.map((para, i) => (
            <p key={i} className="whitespace-pre-line">
              {para}
            </p>
          ))}
        </div>
      </div>
    </article>
  )
}
