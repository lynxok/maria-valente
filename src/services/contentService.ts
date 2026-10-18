import type { ArtworkCategory, SectionMeta, SiteSettings, CVContent } from '../types'
import { initialSections, initialCategories, initialSiteSettings, initialCVContent } from '../data/initialData'
import { supabase } from './supabaseClient'

const STORAGE_KEYS = {
  SECTIONS: 'mv_sections_v3',
  CATEGORIES: 'mv_categories_v3',
  SETTINGS: 'mv_settings_v3',
  CV: 'mv_cv_v3',
  AUTH: 'mv_admin_session_v1',
}

// Convert DB category row to Frontend ArtworkCategory
function mapDbCategory(row: any): ArtworkCategory {
  return {
    id: row.id,
    slug: row.slug,
    sectionId: row.section_id,
    title: row.title,
    nombre: row.nombre || row.title,
    subtitle: row.subtitle,
    description: row.description,
    coverImage: row.cover_image,
    menuImage: row.menu_image,
    yearPlace: row.year_place,
    order: row.order ?? 0,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    images: Array.isArray(row.images) ? row.images : []
  }
}

// Convert Frontend ArtworkCategory to DB row
function mapCategoryToDb(cat: ArtworkCategory) {
  return {
    id: cat.id,
    slug: cat.slug,
    section_id: cat.sectionId,
    title: cat.title,
    nombre: cat.nombre || cat.title,
    subtitle: cat.subtitle || null,
    description: cat.description || null,
    cover_image: cat.coverImage || null,
    menu_image: cat.menuImage || null,
    year_place: cat.yearPlace || null,
    order: cat.order ?? 0,
    is_active: cat.isActive ?? true,
    images: cat.images || [],
    updated_at: new Date().toISOString()
  }
}

export const contentService = {
  // Subida de imagen a Supabase Storage con fallback a Base64 si falla la red/permiso
  async uploadImage(file: File, folder = 'general'): Promise<string> {
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const sanitizedName = file.name
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-')
      const fileName = `${folder}/${Date.now()}-${sanitizedName}.${ext}`

      const { data, error } = await supabase.storage
        .from('artworks')
        .upload(fileName, file, {
          cacheControl: '31536000',
          upsert: false
        })

      if (error) {
        console.warn('Error subiendo a Supabase Storage, fallback a Base64:', error.message)
        return await this.fileToBase64(file)
      }

      const { data: publicUrlData } = supabase.storage
        .from('artworks')
        .getPublicUrl(data.path)

      return publicUrlData.publicUrl
    } catch (err) {
      console.warn('Fallo inesperado al subir a Storage, fallback a Base64:', err)
      return await this.fileToBase64(file)
    }
  },

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (e) => reject(e)
      reader.readAsDataURL(file)
    })
  },

  // Sincronización inicial desde Supabase a LocalStorage
  async syncFromSupabase(): Promise<boolean> {
    try {
      // 1. Cargar site_content (sections, settings, cv)
      const { data: contentData, error: contentError } = await supabase
        .from('site_content')
        .select('*')

      if (!contentError && contentData && contentData.length > 0) {
        contentData.forEach((row: { key: string; value: any }) => {
          if (row.key === 'sections' && row.value) {
            localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(row.value))
          } else if (row.key === 'settings' && row.value) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(row.value))
          } else if (row.key === 'cv' && row.value) {
            localStorage.setItem(STORAGE_KEYS.CV, JSON.stringify(row.value))
          }
        })
      }

      // 2. Cargar categories
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('order', { ascending: true })

      if (!catError && categoriesData && categoriesData.length > 0) {
        const mapped = categoriesData.map(mapDbCategory)
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(mapped))
      }

      return true
    } catch (err) {
      console.warn('Sync from Supabase failed, relying on localStorage cache:', err)
      return false
    }
  },

  // Migrar datos locales o iniciales hacia Supabase (Seed inicial)
  async pushAllToSupabase(): Promise<{ success: boolean; message: string }> {
    try {
      const sections = this.getSections()
      const categories = this.getCategories()
      const settings = this.getSettings()
      const cv = this.getCV()

      // Guardar en site_content
      const rows: Array<{ key: string; value: any }> = [
        { key: 'sections', value: sections },
        { key: 'settings', value: settings },
        { key: 'cv', value: cv }
      ]

      for (const row of rows) {
        const { error } = await supabase.from('site_content').upsert(row as any)
        if (error) throw new Error(`Error subiendo ${row.key}: ${error.message}`)
      }

      // Guardar categorías
      for (const cat of categories) {
        const dbCat = mapCategoryToDb(cat)
        const { error } = await supabase.from('categories').upsert(dbCat)
        if (error) throw new Error(`Error subiendo categoría ${cat.title}: ${error.message}`)
      }

      return { success: true, message: 'Todos los datos fueron sincronizados con Supabase exitosamente.' }
    } catch (err: any) {
      console.error('Error en pushAllToSupabase:', err)
      return { success: false, message: err?.message || 'Error desconocido al subir datos a Supabase' }
    }
  },

  getSections(): SectionMeta[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SECTIONS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(initialSections))
      return initialSections
    }
    return JSON.parse(raw)
  },

  async saveSections(sections: SectionMeta[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sections))
    try {
      await supabase.from('site_content').upsert({
        key: 'sections',
        value: sections,
        updated_at: new Date().toISOString()
      })
    } catch (err) {
      console.warn('Error syncing sections to Supabase:', err)
    }
  },

  getCategories(): ArtworkCategory[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories))
      return initialCategories
    }
    return JSON.parse(raw)
  },

  getPublicCategoriesBySection(sectionId: string): ArtworkCategory[] {
    return this.getCategories()
      .filter(cat => cat.sectionId === sectionId && cat.isActive && (cat.images?.length || 0) > 0)
      .sort((a, b) => a.order - b.order)
  },

  getCategoriesBySection(sectionId: string): ArtworkCategory[] {
    return this.getCategories()
      .filter(cat => cat.sectionId === sectionId)
      .sort((a, b) => a.order - b.order)
  },

  getCategoryBySlug(slug: string): ArtworkCategory | undefined {
    const SLUG_ALIASES: Record<string, string> = {
      'los-cardinales': 'monjes-peatonal',
      'cardinales': 'monjes-peatonal',
      'vitral': 'vitrales-iglesia',
      'vitrales': 'vitrales-iglesia',
      'muestra': 'entre-fuegos-y-juegos',
      'entre-fuegos': 'entre-fuegos-y-juegos'
    }
    const targetSlug = SLUG_ALIASES[slug.toLowerCase()] || slug
    return this.getCategories().find(c => c.slug === targetSlug || c.slug === slug || c.id === slug)
  },

  async saveCategory(category: ArtworkCategory): Promise<void> {
    const categories = this.getCategories()
    const index = categories.findIndex(c => c.id === category.id)
    if (index >= 0) {
      categories[index] = category
    } else {
      categories.push(category)
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))

    try {
      const dbRow = mapCategoryToDb(category)
      await supabase.from('categories').upsert(dbRow)
    } catch (err) {
      console.warn('Error syncing category to Supabase:', err)
    }
  },

  async deleteCategory(categoryId: string): Promise<void> {
    const categories = this.getCategories().filter(c => c.id !== categoryId)
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))

    try {
      await supabase.from('categories').delete().eq('id', categoryId)
    } catch (err) {
      console.warn('Error deleting category in Supabase:', err)
    }
  },

  getCV(): CVContent {
    const raw = localStorage.getItem(STORAGE_KEYS.CV)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CV, JSON.stringify(initialCVContent))
      return initialCVContent
    }
    return JSON.parse(raw)
  },

  async saveCV(cv: CVContent): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.CV, JSON.stringify(cv))
    try {
      await supabase.from('site_content').upsert({
        key: 'cv',
        value: cv,
        updated_at: new Date().toISOString()
      })
    } catch (err) {
      console.warn('Error syncing CV to Supabase:', err)
    }
  },

  getSettings(): SiteSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    let parsed: SiteSettings = raw ? JSON.parse(raw) : initialSiteSettings
    
    if (!parsed.heroSlides || parsed.heroSlides.length === 0) {
      if (initialSiteSettings.heroSlides && initialSiteSettings.heroSlides.length > 0) {
        parsed.heroSlides = initialSiteSettings.heroSlides
      } else {
        parsed.heroSlides = (parsed.heroImages || []).map((url, i) => ({
          id: `slide-${i + 1}`,
          url,
          title: `Obra 0${i + 1}`,
          desktopPosition: 'center center',
          mobilePosition: 'center center',
          order: i + 1
        }))
      }
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed))
    }
    return parsed
  },

  async saveSettings(settings: SiteSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    try {
      await supabase.from('site_content').upsert({
        key: 'settings',
        value: settings,
        updated_at: new Date().toISOString()
      })
    } catch (err) {
      console.warn('Error syncing settings to Supabase:', err)
    }
  },

  isAdminAuthenticated(): boolean {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true'
  },

  setAdminAuthenticated(state: boolean): void {
    if (state) {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true')
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH)
    }
  }
}
