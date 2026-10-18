import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { contentService } from '../../services/contentService'
import type { SectionMeta, ArtworkCategory, CVContent, ArtworkImage, SiteSettings } from '../../types'
import { 
  Plus, Trash2, Edit3, Image, FileText, 
  LogOut, Eye, Star, Sliders,
  Upload, ArrowUp, ArrowDown, Check, X,
  Database, RefreshCw
} from 'lucide-react'
import { FrameEditor } from '../../components/FrameEditor'

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [sections, setSections] = useState<SectionMeta[]>(() => contentService.getSections())
  const [categories, setCategories] = useState<ArtworkCategory[]>(() => contentService.getCategories())
  const [cvContent, setCvContent] = useState<CVContent>(() => contentService.getCV())
  const [settings, setSettings] = useState<SiteSettings>(() => contentService.getSettings())
  const [activeTab, setActiveTab] = useState<'content' | 'hero' | 'cv'>('content')
  const [selectedSectionId, setSelectedSectionId] = useState<string>('obras')
  const [heroSaveNotice, setHeroSaveNotice] = useState<boolean>(false)

  // Modal / Form state for new/edit category
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Partial<ArtworkCategory> | null>(null)

  // Single artwork edit modal inside category
  const [editingImage, setEditingImage] = useState<ArtworkImage | null>(null)

  // Modal for choosing from existing artworks to add to hero
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false)

  // Input for adding by URL
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageTitle, setNewImageTitle] = useState('')

  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null)

  const handleLogout = () => {
    contentService.setAdminAuthenticated(false)
    navigate('/')
  }

  const handleSyncFromSupabase = async () => {
    setIsSyncing(true)
    setSyncStatusMsg('Descargando datos de Supabase...')
    const ok = await contentService.syncFromSupabase()
    if (ok) {
      setSections(contentService.getSections())
      setCategories(contentService.getCategories())
      setCvContent(contentService.getCV())
      setSettings(contentService.getSettings())
      setSyncStatusMsg('¡Datos sincronizados desde la nube!')
    } else {
      setSyncStatusMsg('Error al conectar con Supabase.')
    }
    setIsSyncing(false)
    setTimeout(() => setSyncStatusMsg(null), 3000)
  }

  const handlePushAllToSupabase = async () => {
    if (!confirm('¿Deseas subir todos los datos actuales del navegador hacia Supabase para inicializar la nube?')) return
    setIsSyncing(true)
    setSyncStatusMsg('Subiendo catálogo completo a Supabase...')
    const res = await contentService.pushAllToSupabase()
    setSyncStatusMsg(res.message)
    setIsSyncing(false)
    setTimeout(() => setSyncStatusMsg(null), 4000)
  }

  // Section management: add new section
  const handleAddSection = () => {
    const title = prompt('Nombre de la nueva sección principal (ej. "Grabados", "Esculturas"):')
    if (!title || !title.trim()) return

    const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
    const newSection: SectionMeta = {
      id: slug,
      slug,
      title: title.trim(),
      type: 'custom',
      order: sections.length + 1,
      isActive: true
    }

    const updated = [...sections, newSection]
    setSections(updated)
    contentService.saveSections(updated)
    setSelectedSectionId(newSection.id)
  }

  // Category creation / edit
  const handleOpenCategoryModal = (cat?: ArtworkCategory) => {
    if (cat) {
      setEditingCategory({ ...cat })
    } else {
      setEditingCategory({
        id: `cat-${Date.now()}`,
        slug: '',
        sectionId: selectedSectionId,
        title: '',
        nombre: '',
        description: '',
        order: categories.filter(c => c.sectionId === selectedSectionId).length + 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        images: []
      })
    }
    setIsCategoryModalOpen(true)
  }

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory || !editingCategory.title) return

    const slug = editingCategory.slug || editingCategory.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
    const categoryToSave: ArtworkCategory = {
      id: editingCategory.id || `cat-${Date.now()}`,
      slug,
      sectionId: editingCategory.sectionId || selectedSectionId,
      title: editingCategory.title,
      nombre: editingCategory.nombre || editingCategory.title,
      description: editingCategory.description || '',
      order: editingCategory.order || 1,
      isActive: editingCategory.isActive !== undefined ? editingCategory.isActive : true,
      createdAt: editingCategory.createdAt || new Date().toISOString(),
      images: editingCategory.images || []
    }

    contentService.saveCategory(categoryToSave)
    setCategories(contentService.getCategories())
    setIsCategoryModalOpen(false)
    setEditingCategory(null)
  }

  const handleDeleteCategory = (id: string, title: string) => {
    if (confirm(`¿Estás segura de eliminar la serie "${title}" y todas sus fotos?`)) {
      contentService.deleteCategory(id)
      setCategories(contentService.getCategories())
    }
  }

  // Mark an image as featured in category
  const handleSetFeaturedImage = (imageId: string) => {
    if (!editingCategory) return
    const updatedImages = (editingCategory.images || []).map(img => ({
      ...img,
      destacada: img.id === imageId
    }))
    setEditingCategory({
      ...editingCategory,
      images: updatedImages
    })
  }

  // Adding images to editing category
  const handleAddImageToEditing = () => {
    if (!newImageUrl.trim() || !editingCategory) return
    const newImg: ArtworkImage = {
      id: `img-${Date.now()}`,
      url: newImageUrl.trim(),
      title: newImageTitle.trim() || undefined,
      order: (editingCategory.images?.length || 0) + 1,
      destacada: (editingCategory.images?.length || 0) === 0 // First image default to featured
    }
    setEditingCategory({
      ...editingCategory,
      images: [...(editingCategory.images || []), newImg]
    })
    setNewImageUrl('')
    setNewImageTitle('')
  }

  const handleRemoveImageFromEditing = (imgId: string) => {
    if (!editingCategory) return
    setEditingCategory({
      ...editingCategory,
      images: (editingCategory.images || []).filter(img => img.id !== imgId)
    })
  }

  // Local file upload simulated with FileReader to base64
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !editingCategory) return

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = (loadEvent) => {
        const base64Url = loadEvent.target?.result as string
        if (base64Url) {
          const newImg: ArtworkImage = {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            url: base64Url,
            title: file.name.replace(/\.[^/.]+$/, ''),
            order: (editingCategory.images?.length || 0) + 1,
            destacada: (editingCategory.images?.length || 0) === 0 && index === 0
          }
          setEditingCategory(prev => prev ? ({
            ...prev,
            images: [...(prev.images || []), newImg]
          }) : null)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  // Edit technical fields of an artwork
  const handleSaveArtworkMeta = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingImage || !editingCategory) return

    const updatedImages = (editingCategory.images || []).map(img => 
      img.id === editingImage.id ? editingImage : img
    )
    setEditingCategory({
      ...editingCategory,
      images: updatedImages
    })
    setEditingImage(null)
  }

  // Add detail image to editing image
  const handleAddDetailImageToImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !editingImage) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (loadEvent) => {
        const base64Url = loadEvent.target?.result as string
        if (base64Url) {
          const detailImg: ArtworkImage = {
            id: `detail-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            url: base64Url,
            title: `${editingImage.title || 'Obra'} (Detalle)`,
            order: (editingImage.detailImages?.length || 0) + 1
          }
          setEditingImage(prev => prev ? ({
            ...prev,
            detailImages: [...(prev.detailImages || []), detailImg]
          }) : null)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  // Save CV
  const handleSaveCV = (e: React.FormEvent) => {
    e.preventDefault()
    contentService.saveCV(cvContent)
    alert('CV actualizado correctamente.')
  }

  const saveSettingsWithNotice = (newSettings: SiteSettings) => {
    setSettings(newSettings)
    contentService.saveSettings(newSettings)
    setHeroSaveNotice(true)
    setTimeout(() => {
      setHeroSaveNotice(false)
    }, 2000)
  }

  // Hero Management Handlers
  const handleUploadHeroImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (loadEvent) => {
        const base64Url = loadEvent.target?.result as string
        if (base64Url) {
          const newSlide = {
            id: `hero-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            url: base64Url,
            title: file.name.replace(/\.[^/.]+$/, ''),
            desktopPosition: '50% 50%',
            mobilePosition: '50% 50%',
            order: (settings.heroSlides?.length || 0) + 1
          }
          const updatedSlides = [...(settings.heroSlides || []), newSlide]
          const updated = {
            ...settings,
            heroSlides: updatedSlides,
            heroImages: updatedSlides.map(s => s.url)
          }
          saveSettingsWithNotice(updated)
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleAddExistingArtworkToHero = (artwork: ArtworkImage) => {
    const newSlide = {
      id: `hero-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      url: artwork.url,
      title: artwork.title || 'Obra',
      desktopPosition: '50% 50%',
      mobilePosition: '50% 50%',
      order: (settings.heroSlides?.length || 0) + 1
    }
    const updatedSlides = [...(settings.heroSlides || []), newSlide]
    const updated = {
      ...settings,
      heroSlides: updatedSlides,
      heroImages: updatedSlides.map(s => s.url)
    }
    setSettings(updated)
    contentService.saveSettings(updated)
  }

  const handleRemoveHeroSlide = (sIdx: number) => {
    if (!confirm('¿Quitar esta imagen del fondo de la Home?')) return
    const updatedSlides = (settings.heroSlides || []).filter((_, i) => i !== sIdx)
    const updated = {
      ...settings,
      heroSlides: updatedSlides,
      heroImages: updatedSlides.map(s => s.url)
    }
    setSettings(updated)
    contentService.saveSettings(updated)
  }

  const handleMoveHeroSlide = (sIdx: number, direction: 'up' | 'down') => {
    const slides = [...(settings.heroSlides || [])]
    const targetIdx = direction === 'up' ? sIdx - 1 : sIdx + 1
    if (targetIdx < 0 || targetIdx >= slides.length) return

    const temp = slides[sIdx]
    slides[sIdx] = slides[targetIdx]
    slides[targetIdx] = temp

    const updated = {
      ...settings,
      heroSlides: slides,
      heroImages: slides.map(s => s.url)
    }
    setSettings(updated)
    contentService.saveSettings(updated)
  }

  // Flatten all artworks for gallery picker
  const allArtworkImages = categories.flatMap(cat => 
    (cat.images || []).map(img => ({ ...img, categoryTitle: cat.title }))
  )

  const currentSectionCategories = categories
    .filter(c => c.sectionId === selectedSectionId)
    .sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            target="_blank"
            className="flex items-center text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-200 px-3 py-1.5 rounded-xs bg-white transition-colors"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Ver Sitio Web
          </Link>
          <span className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
            Panel de la Artista
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {syncStatusMsg && (
            <span className="text-xs text-neutral-600 bg-neutral-100 px-3 py-1 rounded-xs animate-fade-in font-medium">
              {syncStatusMsg}
            </span>
          )}

          <button
            type="button"
            onClick={handleSyncFromSupabase}
            disabled={isSyncing}
            title="Traer los últimos cambios guardados en Supabase"
            className="flex items-center text-xs text-neutral-700 hover:text-neutral-900 border border-neutral-200 px-3 py-1.5 rounded-xs bg-white hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar Nube
          </button>

          <button
            type="button"
            onClick={handlePushAllToSupabase}
            disabled={isSyncing}
            title="Subir todo el contenido actual (series, CV, Hero) a Supabase"
            className="flex items-center text-xs text-emerald-700 hover:text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xs bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5 mr-1.5" />
            Subir Todo a Supabase
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer ml-2"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col md:flex-row gap-8">
        {/* Left Navigation Tabs */}
        <aside className="w-full md:w-60 space-y-2">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`w-full text-left px-4 py-3 rounded-xs text-xs uppercase tracking-wider font-medium flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'content'
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Obras & Series</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`w-full text-left px-4 py-3 rounded-xs text-xs uppercase tracking-wider font-medium flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'hero'
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Fondo de la Home</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cv')}
            className={`w-full text-left px-4 py-3 rounded-xs text-xs uppercase tracking-wider font-medium flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'cv'
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Biografía & CV</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white border border-neutral-200 rounded-lg p-6 shadow-2xs">
          {activeTab === 'content' && (
            <div>
              {/* Section Selector Pills */}
              <div className="flex items-center justify-between pb-6 border-b border-neutral-200 mb-6 flex-wrap gap-4">
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {sections
                    .filter(s => s.type !== 'cv')
                    .map(sec => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setSelectedSectionId(sec.id)}
                        className={`px-4 py-2 rounded-xs text-xs uppercase tracking-wider font-medium cursor-pointer transition-colors ${
                          selectedSectionId === sec.id
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {sec.title}
                      </button>
                    ))}
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="p-2 border border-dashed border-neutral-300 rounded-xs text-neutral-500 hover:text-neutral-900 hover:border-neutral-500 text-xs flex items-center cursor-pointer"
                    title="Agregar una nueva sección principal"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenCategoryModal()}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xs text-xs uppercase tracking-widest font-medium flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Nueva Serie / Categoría
                </button>
              </div>

              {/* Category List */}
              <div className="space-y-4">
                {currentSectionCategories.length > 0 ? (
                  currentSectionCategories.map(cat => {
                    const hasPhotos = (cat.images?.length || 0) > 0
                    return (
                      <div
                        key={cat.id}
                        className="border border-neutral-200 rounded-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-300 transition-colors"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                              {cat.nombre || cat.title}
                            </h3>
                            <span className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">
                              {cat.images?.length || 0} fotos
                            </span>
                            {!hasPhotos && (
                              <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full uppercase tracking-wider font-medium">
                                Vacía (oculta en la web)
                              </span>
                            )}
                          </div>
                          {cat.description && (
                            <p className="text-xs text-neutral-500 mt-1 max-w-xl truncate">
                              {cat.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 self-end md:self-auto">
                          <button
                            type="button"
                            onClick={() => handleOpenCategoryModal(cat)}
                            className="px-3 py-1.5 text-xs text-neutral-700 hover:text-neutral-900 border border-neutral-200 rounded-xs flex items-center space-x-1 hover:bg-neutral-50 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-1" />
                            Modificar Obras
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id, cat.nombre || cat.title)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded-xs cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12 border border-dashed border-neutral-200 rounded-md">
                    <p className="text-xs text-neutral-400 uppercase tracking-widest mb-3">
                      No hay series creadas en esta sección.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenCategoryModal()}
                      className="text-xs text-neutral-900 underline uppercase tracking-wider cursor-pointer"
                    >
                      Crear la primera ahora
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'cv' && (
            <form onSubmit={handleSaveCV} className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 mb-1">
                  Foto de Retrato de la Artista (Opcional)
                </h3>
                <p className="text-xs text-neutral-500 mb-2">
                  URL de la imagen o retrato que se mostrará al inicio de la sección de Biografía.
                </p>
                <div className="flex items-center space-x-3">
                  <input
                    type="url"
                    value={cvContent.portrait || ''}
                    onChange={e => setCvContent({ ...cvContent, portrait: e.target.value })}
                    placeholder="https://... /foto-maria-valente.jpg"
                    className="flex-1 p-2.5 border border-neutral-300 rounded-xs text-sm focus:outline-none focus:border-neutral-900"
                  />
                  {cvContent.portrait && (
                    <img 
                      src={cvContent.portrait} 
                      alt="Vista previa" 
                      className="w-12 h-12 object-cover border border-neutral-200 rounded-xs shrink-0" 
                    />
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 mb-1">
                  Biografía
                </h3>
                <p className="text-xs text-neutral-500 mb-2">
                  Texto principal que se mostrará en la página de Biografía.
                </p>
                <textarea
                  rows={8}
                  value={cvContent.biography}
                  onChange={e => setCvContent({ ...cvContent, biography: e.target.value })}
                  className="w-full p-3 border border-neutral-300 rounded-xs text-sm leading-relaxed focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 mb-1">
                  CV Extendido
                </h3>
                <p className="text-xs text-neutral-500 mb-2">
                  Muestras, exposiciones colectivas, intervenciones y distinciones detalladas.
                </p>
                <textarea
                  rows={10}
                  value={cvContent.extendedCv}
                  onChange={e => setCvContent({ ...cvContent, extendedCv: e.target.value })}
                  className="w-full p-3 border border-neutral-300 rounded-xs text-sm leading-relaxed focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 mb-1">
                  Biografía en Inglés
                </h3>
                <p className="text-xs text-neutral-500 mb-2">
                  Versión en idioma inglés para visitantes internacionales.
                </p>
                <textarea
                  rows={8}
                  value={cvContent.biographyEn || ''}
                  onChange={e => setCvContent({ ...cvContent, biographyEn: e.target.value })}
                  className="w-full p-3 border border-neutral-300 rounded-xs text-sm leading-relaxed focus:outline-none focus:border-neutral-900"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-medium rounded-xs cursor-pointer"
              >
                Guardar Cambios de CV
              </button>
            </form>
          )}

          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                    Control del Fondo de la Home
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Ajustá el tiempo de permanencia, agregá o quitá imágenes y definí el encuadre focal con el mouse.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Indicador discreto de Guardado */}
                  {heroSaveNotice && (
                    <div className="flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xs animate-fade-in">
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span>Guardado ✓</span>
                    </div>
                  )}

                  {/* Botón: Elegir de las obras ya cargadas */}
                  <button
                    type="button"
                    onClick={() => setIsGalleryPickerOpen(true)}
                    className="flex items-center px-3 py-1.5 bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-xs uppercase tracking-wider rounded-xs cursor-pointer transition-colors shadow-2xs"
                  >
                    <Image className="w-3.5 h-3.5 mr-1.5 text-neutral-600" />
                    <span>Elegir de Obras Cargadas</span>
                  </button>

                  {/* Botón: Subir nueva foto desde la PC */}
                  <label className="flex items-center px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs uppercase tracking-wider rounded-xs cursor-pointer transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    <span>+ Subir Nueva Imagen</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleUploadHeroImages}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Tiempo de permanencia general */}
              <div className="bg-neutral-50 p-4 rounded-xs border border-neutral-200 max-w-md">
                <label className="block text-xs uppercase tracking-wider text-neutral-800 font-semibold mb-1">
                  Tiempo de permanencia por imagen (segundos)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min={2}
                    max={60}
                    value={settings.heroDurationSeconds || 6}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 6
                      const updated = { ...settings, heroDurationSeconds: val }
                      setSettings(updated)
                      contentService.saveSettings(updated)
                    }}
                    className="w-24 px-3 py-1.5 border border-neutral-300 rounded-xs text-sm bg-white focus:outline-none"
                  />
                  <span className="text-xs text-neutral-500">segundos en pantalla</span>
                </div>
              </div>

              {/* Lista de diapositivas con posición Desktop & Mobile */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider text-neutral-800 font-semibold">
                  Imágenes del Carrusel & Encuadre ({settings.heroSlides?.length || 0})
                </h4>

                <div className="grid grid-cols-1 gap-4">
                  {(settings.heroSlides || []).map((slide, sIdx) => (
                    <div 
                      key={slide.id || sIdx}
                      className="border border-neutral-200 rounded-xs p-4 bg-white flex flex-col lg:flex-row gap-6 items-start lg:items-center"
                    >
                      {/* Controles de Encuadre Unificados (Modelo 1:1 en imagen original) */}
                      <div className="flex-1 w-full space-y-5">
                        {/* Desktop Frame: 16:9 Aspect Ratio with Sidebar Overlay Preview */}
                        <FrameEditor
                          mode="desktop"
                          imageUrl={slide.url}
                          title={slide.title ? `${slide.title} (PC)` : undefined}
                          value={slide.desktopFrame}
                          legacyPosition={slide.desktopPosition}
                          legacyScale={slide.desktopScale}
                          onChange={newFrame => {
                            const updatedSlides = (settings.heroSlides || []).map((s, i) => 
                              i === sIdx ? { ...s, desktopFrame: newFrame } : s
                            )
                            const updated = { ...settings, heroSlides: updatedSlides }
                            saveSettingsWithNotice(updated)
                          }}
                        />

                        {/* Mobile Frame: 375:812 Aspect Ratio */}
                        <FrameEditor
                          mode="mobile"
                          imageUrl={slide.url}
                          title={slide.title ? `${slide.title} (Móvil)` : undefined}
                          value={slide.mobileFrame}
                          legacyPosition={slide.mobilePosition}
                          legacyScale={slide.mobileScale}
                          onChange={newFrame => {
                            const updatedSlides = (settings.heroSlides || []).map((s, i) => 
                              i === sIdx ? { ...s, mobileFrame: newFrame } : s
                            )
                            const updated = { ...settings, heroSlides: updatedSlides }
                            saveSettingsWithNotice(updated)
                          }}
                        />
                      </div>

                      {/* Tiempo individual específico y controles */}
                      <div className="w-full lg:w-48 shrink-0 flex flex-col justify-between pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-neutral-100 lg:pl-4 space-y-3">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-neutral-700 font-semibold mb-1">
                            Título / Referencia
                          </label>
                          <input
                            type="text"
                            placeholder="Nombre de la obra..."
                            value={slide.title || ''}
                            onChange={e => {
                              const updatedSlides = (settings.heroSlides || []).map((s, i) => 
                                i === sIdx ? { ...s, title: e.target.value } : s
                              )
                              const updated = { ...settings, heroSlides: updatedSlides }
                              saveSettingsWithNotice(updated)
                            }}
                            className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs text-xs bg-white focus:outline-none mb-3"
                          />

                          <label className="block text-[11px] uppercase tracking-wider text-neutral-700 font-semibold mb-1">
                            Tiempo en pantalla
                          </label>
                          <input
                            type="number"
                            min={2}
                            max={60}
                            placeholder={`General (${settings.heroDurationSeconds || 6}s)`}
                            value={slide.durationSeconds || ''}
                            onChange={e => {
                              const val = e.target.value ? parseInt(e.target.value) : undefined
                              const updatedSlides = (settings.heroSlides || []).map((s, i) => 
                                i === sIdx ? { ...s, durationSeconds: val } : s
                              )
                              const updated = { ...settings, heroSlides: updatedSlides }
                              saveSettingsWithNotice(updated)
                            }}
                            className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs text-xs bg-white focus:outline-none mb-3"
                          />

                          {/* Selector de Ajuste: Llenar pantalla sin franjas vs Mostrar con fondo difuminado */}
                          <label className="block text-[11px] uppercase tracking-wider text-neutral-700 font-semibold mb-1">
                            Modo de Pantalla
                          </label>
                          <select
                            value={slide.fitMode || 'cover'}
                            onChange={e => {
                              const val = e.target.value as 'cover' | 'blur'
                              const updatedSlides = (settings.heroSlides || []).map((s, i) => 
                                i === sIdx ? { ...s, fitMode: val } : s
                              )
                              const updated = { ...settings, heroSlides: updatedSlides }
                              saveSettingsWithNotice(updated)
                            }}
                            className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs text-xs bg-white focus:outline-none"
                          >
                            <option value="cover">Llenar pantalla (Sin franjas)</option>
                            <option value="blur">Alejar (Con fondo difuminado)</option>
                          </select>
                          <p className="text-[10px] text-neutral-400 mt-1">
                            {slide.fitMode === 'blur' 
                              ? 'Muestra la obra completa con fondo difuminado a los lados' 
                              : 'Cubre el 100% de la pantalla sin ninguna franja lateral'}
                          </p>
                        </div>

                        {/* Slide Position & Actions */}
                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              disabled={sIdx === 0}
                              onClick={() => handleMoveHeroSlide(sIdx, 'up')}
                              className="p-1 rounded-xs border border-neutral-200 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 cursor-pointer"
                              title="Mover antes en la secuencia"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={sIdx === (settings.heroSlides || []).length - 1}
                              onClick={() => handleMoveHeroSlide(sIdx, 'down')}
                              className="p-1 rounded-xs border border-neutral-200 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 cursor-pointer"
                              title="Mover después en la secuencia"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-neutral-400 ml-1">
                              #{sIdx + 1}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveHeroSlide(sIdx)}
                            className="flex items-center text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded-xs hover:bg-red-50 cursor-pointer transition-colors"
                            title="Quitar foto de la home"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            <span>Quitar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!settings.heroSlides || settings.heroSlides.length === 0) && (
                    <div className="py-8 text-center border border-dashed border-neutral-300 rounded-xs bg-neutral-50">
                      <p className="text-xs text-neutral-500 mb-3">No hay diapositivas cargadas en la configuración.</p>
                      <button
                        type="button"
                        onClick={() => {
                          const restored = {
                            ...settings,
                            heroSlides: (settings.heroImages || []).map((url, i) => ({
                              id: `slide-${i + 1}`,
                              url,
                              title: `Obra 0${i + 1}`,
                              desktopPosition: 'center center',
                              mobilePosition: 'center center',
                              order: i + 1
                            }))
                          }
                          setSettings(restored)
                          contentService.saveSettings(restored)
                        }}
                        className="px-4 py-2 bg-neutral-900 text-white text-xs uppercase tracking-wider rounded-xs cursor-pointer hover:bg-neutral-800"
                      >
                        Cargar Fotos Predeterminadas de la Home
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Category Edit / Add Modal */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-xl">
            <h3 className="text-base font-semibold uppercase tracking-wider text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
              {editingCategory.id ? 'Modificar Serie / Obras' : 'Nueva Serie'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Nombre Visible de la Serie
                  </label>
                  <input
                    type="text"
                    value={editingCategory.nombre || editingCategory.title || ''}
                    onChange={e => setEditingCategory({ 
                      ...editingCategory, 
                      nombre: e.target.value,
                      title: e.target.value 
                    })}
                    placeholder="Ej. Mujeres de los dictadores"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xs text-sm focus:outline-none focus:border-neutral-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Slug / URL
                  </label>
                  <input
                    type="text"
                    value={editingCategory.slug || ''}
                    onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    placeholder="mujeresdictadores"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xs text-sm focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Lugar / Año (aparece en el menú mobile)
                  </label>
                  <input
                    type="text"
                    value={editingCategory.yearPlace || ''}
                    onChange={e => setEditingCategory({ ...editingCategory, yearPlace: e.target.value })}
                    placeholder="Ej. Paraná, 2016"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xs text-sm focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Imagen para el Menú (opcional)
                  </label>
                  <input
                    type="url"
                    value={editingCategory.menuImage || ''}
                    onChange={e => setEditingCategory({ ...editingCategory, menuImage: e.target.value })}
                    placeholder="Vacío = toma la obra destacada o primera"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xs text-sm focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                  Descripción o Texto Curatorial
                </label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Breve reseña sobre los materiales, técnicas o concepto de la serie..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xs text-sm focus:outline-none focus:border-neutral-900"
                />
              </div>

              {/* Image Manager inside Series */}
              <div className="pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs uppercase tracking-wider text-neutral-800 font-semibold">
                    Galería de Fotos de Obras
                  </label>
                  <span className="text-[11px] text-neutral-500">
                    Tocá la estrella ★ para marcar la obra destacada
                  </span>
                </div>

                {/* Subir archivo local */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <label className="inline-block px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs uppercase tracking-wider rounded-xs cursor-pointer border border-neutral-300 transition-colors">
                    <span>+ Subir fotos desde la computadora</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleLocalImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* O agregar por URL */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="url"
                    placeholder="O pegar URL de imagen..."
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-xs text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Título (opcional)"
                    value={newImageTitle}
                    onChange={e => setNewImageTitle(e.target.value)}
                    className="w-36 px-3 py-1.5 border border-neutral-300 rounded-xs text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageToEditing}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-900 text-white text-xs uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
                  >
                    Agregar
                  </button>
                </div>

                {/* Preview Grid with Edit & Featured actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-2 bg-neutral-50 rounded-xs border border-neutral-200">
                  {(editingCategory.images || []).map((img, i) => (
                    <div 
                      key={img.id || i} 
                      className={`relative group aspect-[3/4] bg-neutral-200 rounded-xs overflow-hidden border ${
                        img.destacada ? 'border-amber-500 ring-2 ring-amber-400' : 'border-neutral-300'
                      }`}
                    >
                      <img src={img.thumbnailUrl || img.url} alt={img.title} className="w-full h-full object-contain bg-white" />
                      
                      {/* Badge Destacada */}
                      <button
                        type="button"
                        onClick={() => handleSetFeaturedImage(img.id)}
                        className={`absolute top-1 left-1 p-1 rounded-full text-xs cursor-pointer transition-colors ${
                          img.destacada 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-black/50 text-white/70 hover:text-white'
                        }`}
                        title={img.destacada ? 'Obra destacada' : 'Marcar como destacada'}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {/* Botón editar ficha técnica y detalles */}
                      <button
                        type="button"
                        onClick={() => setEditingImage({ ...img })}
                        className="absolute bottom-1 left-1 px-2 py-0.5 bg-neutral-900/80 hover:bg-neutral-900 text-white text-[10px] rounded-xs cursor-pointer"
                        title="Editar ficha (técnica, medidas, año, detalles)"
                      >
                        Ficha
                      </button>

                      {/* Quitar foto */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImageFromEditing(img.id)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Quitar foto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(!editingCategory.images || editingCategory.images.length === 0) && (
                    <p className="col-span-full text-center py-6 text-xs text-neutral-400">
                      No hay fotos cargadas todavía en esta serie.
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs uppercase tracking-wider rounded-xs cursor-pointer hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 text-white text-xs uppercase tracking-widest rounded-xs cursor-pointer hover:bg-neutral-800"
                >
                  Guardar Serie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-Modal: Edit Artwork Details & Technical Sheet */}
      {editingImage && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
              Ficha Técnica de la Obra
            </h4>

            <form onSubmit={handleSaveArtworkMeta} className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={editingImage.title || ''}
                  onChange={e => setEditingImage({ ...editingImage, title: e.target.value })}
                  placeholder="Sin título 09"
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-xs text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Técnica
                  </label>
                  <input
                    type="text"
                    value={editingImage.tecnica || ''}
                    onChange={e => setEditingImage({ ...editingImage, tecnica: e.target.value })}
                    placeholder="Cerámica escultórica"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-xs text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Medidas
                  </label>
                  <input
                    type="text"
                    value={editingImage.medidas || ''}
                    onChange={e => setEditingImage({ ...editingImage, medidas: e.target.value })}
                    placeholder="40 × 20 cm"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-xs text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                  Año
                </label>
                <input
                  type="text"
                  value={editingImage.anio || ''}
                  onChange={e => setEditingImage({ ...editingImage, anio: e.target.value })}
                  placeholder="2016"
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-xs text-xs focus:outline-none"
                />
              </div>

              {/* Fotos de detalle adicionales */}
              <div className="pt-3 border-t border-neutral-200">
                <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1">
                  Fotos de Detalle Asociadas ({editingImage.detailImages?.length || 0})
                </label>
                <label className="inline-block px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] uppercase tracking-wider rounded-xs cursor-pointer border border-neutral-300 mb-2">
                  <span>+ Agregar foto de detalle</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAddDetailImageToImage}
                    className="hidden"
                  />
                </label>

                <div className="flex gap-2 overflow-x-auto p-1 bg-neutral-50 rounded-xs border border-neutral-200">
                  {(editingImage.detailImages || []).map((det, dIdx) => (
                    <div key={det.id || dIdx} className="relative w-12 h-12 bg-neutral-200 shrink-0">
                      <img src={det.url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setEditingImage({
                            ...editingImage,
                            detailImages: (editingImage.detailImages || []).filter(d => d.id !== det.id)
                          })
                        }}
                        className="absolute -top-1 -right-1 p-0.5 bg-red-600 text-white rounded-full text-[9px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {(!editingImage.detailImages || editingImage.detailImages.length === 0) && (
                    <p className="text-[11px] text-neutral-400 p-2">Sin fotos de detalle extra</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditingImage(null)}
                  className="px-3 py-1.5 border border-neutral-300 text-xs uppercase tracking-wider rounded-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-900 text-white text-xs uppercase tracking-wider rounded-xs cursor-pointer"
                >
                  Guardar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Picker Modal: Choose from existing uploaded artwork */}
      {isGalleryPickerOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                  Elegir Obra para el Fondo de la Home
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Seleccioná una obra de tu catálogo cargado para incorporarla al carrusel principal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryPickerOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of existing artworks */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {allArtworkImages.map((art, idx) => {
                  const isAlreadyInHero = (settings.heroSlides || []).some(s => s.url === art.url)
                  return (
                    <div 
                      key={art.id || idx}
                      className="group relative flex flex-col border border-neutral-200 rounded-xs overflow-hidden bg-neutral-50 hover:border-neutral-900 transition-colors"
                    >
                      <div className="aspect-[3/4] bg-neutral-100 overflow-hidden relative">
                        <img 
                          src={art.thumbnailUrl || art.url} 
                          alt={art.title} 
                          className="w-full h-full object-contain bg-white"
                        />
                        {isAlreadyInHero && (
                          <div className="absolute top-1 right-1 bg-emerald-600 text-white p-1 rounded-full text-[10px] shadow-xs" title="Ya está en la Home">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <div className="p-2 flex-1 flex flex-col justify-between bg-white border-t border-neutral-100">
                        <div>
                          <p className="text-[11px] font-medium text-neutral-900 truncate" title={art.title}>
                            {art.title || 'Sin título'}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate">
                            {art.categoryTitle}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            handleAddExistingArtworkToHero(art)
                            setIsGalleryPickerOpen(false)
                          }}
                          className="mt-2 w-full py-1 text-center bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
                        >
                          {isAlreadyInHero ? '+ Agregar de nuevo' : 'Agregar a Home'}
                        </button>
                      </div>
                    </div>
                  )
                })}

                {allArtworkImages.length === 0 && (
                  <div className="col-span-full py-12 text-center text-xs text-neutral-400">
                    No hay obras cargadas todavía en las series. Podés subir una imagen directamente desde tu computadora.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsGalleryPickerOpen(false)}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs uppercase tracking-wider rounded-xs cursor-pointer hover:bg-neutral-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
