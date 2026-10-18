export type SectionType = 'obras' | 'intervenciones' | 'exposiciones' | 'cv' | 'custom'

export interface ArtworkImage {
  id: string
  url: string
  thumbnailUrl?: string
  title?: string
  description?: string
  tecnica?: string
  medidas?: string
  anio?: string
  destacada?: boolean
  parentId?: string
  detailImages?: ArtworkImage[]
  width?: number
  height?: number
  order: number
}

export interface ArtworkCategory {
  id: string
  slug: string
  sectionId: string // e.g. 'obras', 'intervenciones', 'exposiciones'
  title: string
  nombre?: string
  subtitle?: string
  description?: string
  coverImage?: string
  menuImage?: string // Imagen específica opcional para el menú mobile
  yearPlace?: string // ej: "Paraná, 2016" o año/lugar
  order: number
  isActive: boolean
  createdAt: string
  images: ArtworkImage[]
}

export interface CVContent {
  biography: string
  biographyEn?: string
  extendedCv: string
  extendedCvEn?: string
  portrait?: string
  lastUpdated?: string
}

export interface SectionMeta {
  id: string
  slug: string
  title: string
  type: SectionType
  order: number
  isActive: boolean
}

import type { FrameCoord, MobileFrame } from '../utils/framing'

export interface HeroSlide {
  id: string
  url: string
  title?: string
  durationSeconds?: number // Tiempo individual (opcional)
  desktopPosition?: string // Legacy
  mobilePosition?: string  // Legacy
  desktopScale?: number    // Legacy
  mobileScale?: number     // Legacy
  mobileFrame?: MobileFrame // Nuevo modelo exacto { cx, cy, h } (375:812)
  desktopFrame?: FrameCoord // Nuevo modelo exacto { cx, cy, h } (16:9)
  fitMode?: 'cover' | 'blur' // 'cover' llena toda la pantalla sin franjas; 'blur' muestra obra completa con fondo difuminado
  order: number
}

export interface SiteSettings {
  artistName: string
  tagline: string
  email: string
  facebookUrl?: string
  instagramUrl?: string
  heroImages: string[] // Retrocompatibilidad
  heroSlides?: HeroSlide[]
  heroDurationSeconds?: number // Tiempo general de transición (default: 6)
}
