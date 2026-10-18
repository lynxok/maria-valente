import type { ArtworkCategory, SectionMeta, SiteSettings, CVContent } from '../types'

export const initialSections: SectionMeta[] = [
  { id: 'obras', slug: 'obras', title: 'Obras', type: 'obras', order: 1, isActive: true },
  { id: 'intervenciones', slug: 'intervenciones', title: 'Intervenciones', type: 'intervenciones', order: 2, isActive: true },
  { id: 'exposiciones', slug: 'exposiciones', title: 'Exposiciones', type: 'exposiciones', order: 3, isActive: true },
  { id: 'cv', slug: 'cv', title: 'CV', type: 'cv', order: 4, isActive: true },
]

export const initialSiteSettings: SiteSettings = {
  artistName: 'Maria Valente Hupp',
  tagline: 'Artista Plástica',
  email: 'mariavalente1@me.com',
  facebookUrl: 'https://www.facebook.com/mariavalentehupp',
  instagramUrl: '',
  heroImages: [
    'https://mariavalentehupp.com/wp-content/uploads/2016/08/inicio.jpg',
    'https://mariavalentehupp.com/wp-content/uploads/2016/08/inicio-1.jpg',
    'https://mariavalentehupp.com/wp-content/uploads/2016/08/inicio-2.jpg',
    'https://mariavalentehupp.com/wp-content/uploads/2016/08/inicio-3.jpg',
  ],
  heroDurationSeconds: 6,
  heroSlides: [
    {
      id: 'slide-1',
      url: 'https://mariavalentehupp.com/wp-content/uploads/2016/08/inicio.jpg',
      title: 'Obra 01',
      desktopPosition: 'center center',
      mobilePosition: 'center center',
      order: 1
    },
    {
      id: 'slide-2',
      url: 'https://mariavalentehupp.com/wp-content/uploads/2016/08/inicio-1.jpg',
      title: 'Obra 02',
      desktopPosition: 'center center',
      mobilePosition: 'center center',
      order: 2
    },
    {
      id: 'slide-3',
      url: 'https://mariavalentehupp.com/wp-content/uploads/2016/08/inicio-2.jpg',
      title: 'Obra 03',
      desktopPosition: 'center center',
      mobilePosition: 'center center',
      order: 3
    },
    {
      id: 'slide-4',
      url: 'https://mariavalentehupp.com/wp-content/uploads/2016/08/inicio-3.jpg',
      title: 'Obra 04',
      desktopPosition: 'center center',
      mobilePosition: 'center center',
      order: 4
    }
  ]
}

export const initialCategories: ArtworkCategory[] = [
  // --- OBRAS ---
  {
    id: 'arlequines-y-bufones',
    slug: 'arlequines-y-bufones',
    sectionId: 'obras',
    title: 'Arlequines y bufones',
    nombre: 'Arlequines y bufones',
    order: 1,
    isActive: true,
    createdAt: '2016-08-01',
    description: 'Colección de cerámica escultórica inspirada en personajes carnavalescos, arlequines y bufones.',
    images: [
      {
        id: 'ab-1',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/08/Sin-título-09.jpg',
        title: 'Sin título 09',
        tecnica: 'Cerámica escultórica',
        medidas: '45 × 25 cm',
        anio: '2016',
        destacada: true,
        order: 1,
        detailImages: [
          {
            id: 'ab-1d',
            url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/Sin-título-09detalle-2.jpg',
            title: 'Sin título 09 (Detalle)',
            order: 1
          }
        ]
      },
      {
        id: 'ab-2',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/08/Sin-título-08.jpg',
        title: 'Sin título 08',
        tecnica: 'Cerámica escultórica',
        anio: '2016',
        order: 2,
        detailImages: [
          {
            id: 'ab-2d',
            url: 'https://mariavalentehupp.com/wp-content/uploads/2016/08/Sin-título-08detalle.jpg',
            title: 'Sin título 08 (Detalle)',
            order: 1
          }
        ]
      },
      {
        id: 'ab-3',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/08/Sin-título-01.jpg',
        title: 'Sin título 01',
        tecnica: 'Cerámica policromada',
        anio: '2016',
        order: 3
      },
      {
        id: 'ab-4',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/08/Sin-título-02.jpg',
        title: 'Sin título 02',
        tecnica: 'Cerámica esmaltada',
        order: 4
      },
      {
        id: 'ab-5',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/08/Sin-título-03.jpg',
        title: 'Sin título 03',
        tecnica: 'Cerámica escultórica',
        order: 5
      },
      {
        id: 'ab-6',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/Sin-título-04-1.jpg',
        title: 'Sin título 04',
        tecnica: 'Cerámica',
        order: 6
      },
      {
        id: 'ab-7',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/08/Sin-título-05.jpg',
        title: 'Sin título 05',
        tecnica: 'Cerámica',
        order: 7
      },
      {
        id: 'ab-8',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/08/Sin-título-06.jpg',
        title: 'Sin título 06',
        tecnica: 'Cerámica',
        order: 8
      },
      {
        id: 'ab-9',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/Sin-título-10-2.jpg',
        title: 'Sin título 10',
        tecnica: 'Cerámica escultórica',
        order: 9
      },
      {
        id: 'ab-10',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/08/Sin-título-07.jpg',
        title: 'Sin título 07',
        tecnica: 'Cerámica',
        order: 10
      },
    ]
  },
  {
    id: 'gargolas',
    slug: 'gargolas',
    sectionId: 'obras',
    title: 'Gárgolas',
    nombre: 'Gárgolas',
    order: 2,
    isActive: true,
    createdAt: '2016-08-01',
    description: 'Serie de gárgolas escultóricas y formas zoomórficas en arcilla y pátinas.',
    images: [
      {
        id: 'garg-1',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01-Gito-4.jpg',
        title: 'Gito',
        tecnica: 'Cerámica escultórica',
        destacada: true,
        order: 1,
        detailImages: [
          { id: 'garg-1a', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01a-Gito-2.jpg', title: 'Gito (Vista lateral)', order: 1 },
          { id: 'garg-1b', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01b-Gitodetalle-1.jpg', title: 'Gito (Detalle)', order: 2 },
          { id: 'garg-1c', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01c-Gitodetalle.jpg', title: 'Gito (Primer plano)', order: 3 },
        ]
      },
      {
        id: 'garg-2',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/02-Mariposa-1.jpg',
        title: 'Mariposa',
        tecnica: 'Cerámica escultórica',
        order: 2,
        detailImages: [
          { id: 'garg-2a', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/02d-Mariposa.jpg', title: 'Mariposa (Detalle)', order: 1 }
        ]
      },
      {
        id: 'garg-3',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/04-Gargola.jpg',
        title: 'Gárgola',
        tecnica: 'Arcilla y pátina',
        order: 3,
        detailImages: [
          { id: 'garg-3a', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/04a-Gargola.jpg', title: 'Gárgola (Detalle)', order: 1 }
        ]
      },
      {
        id: 'garg-4',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/05b-AVE-URBANAdetalle.jpg',
        title: 'Ave Urbana',
        tecnica: 'Cerámica escultórica',
        order: 4,
        detailImages: [
          { id: 'garg-4a', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/05a-AVE-URBANAdetalle.jpg', title: 'Ave Urbana (Detalle)', order: 1 }
        ]
      },
      {
        id: 'garg-5',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/07-gargola.jpg',
        title: 'Gárgola guardiana',
        tecnica: 'Cerámica',
        order: 5
      },
      {
        id: 'garg-6',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/08-VIGIAS.jpg',
        title: 'Vigías',
        tecnica: 'Cerámica escultórica',
        order: 6
      }
    ]
  },
  {
    id: 'monjes',
    slug: 'monjes',
    sectionId: 'obras',
    title: 'Monjes',
    nombre: 'Monjes',
    order: 3,
    isActive: true,
    createdAt: '2016-08-01',
    description: 'Figuras monásticas y sobrias que exploran la introspección y la textura de la cerámica cocida.',
    images: [
      {
        id: 'monj-1',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/10-Sin-título.jpg',
        title: 'Sin título 10',
        tecnica: 'Cerámica escultórica',
        destacada: true,
        order: 1
      },
      {
        id: 'monj-2',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/11-Sin-título.jpg',
        title: 'Sin título 11',
        tecnica: 'Cerámica escultórica',
        order: 2
      },
      {
        id: 'monj-3',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01c-Sin-ttulo-6.jpg',
        title: 'Sin título 01',
        tecnica: 'Cerámica escultórica',
        order: 3,
        detailImages: [
          { id: 'monj-3a', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01d-Sin-ttulo-detalle.jpg', title: 'Detalle frontal', order: 1 },
          { id: 'monj-3b', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01e-Sin-ttulo-detalle-1.jpg', title: 'Detalle perfil', order: 2 },
          { id: 'monj-3c', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01f-Sin-ttulo-detalle-2.jpg', title: 'Detalle textura', order: 3 },
        ]
      },
      {
        id: 'monj-4',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/02-Sin-título.jpg',
        title: 'Sin título 02',
        tecnica: 'Cerámica escultórica',
        order: 4,
        detailImages: [
          { id: 'monj-4a', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/02b-Sin-título-detalle-2.jpg', title: 'Detalle', order: 1 }
        ]
      },
      {
        id: 'monj-5',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/03-Sin-título.jpg',
        title: 'Sin título 03',
        tecnica: 'Cerámica',
        order: 5,
        detailImages: [
          { id: 'monj-5a', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/03a-Sin-título-detalle.jpg', title: 'Detalle', order: 1 }
        ]
      },
      {
        id: 'monj-6',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/04-Narciso.jpg',
        title: 'Narciso',
        tecnica: 'Cerámica escultórica',
        order: 6,
        detailImages: [
          { id: 'monj-6a', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/04a-Narciso-detalle-1.jpg', title: 'Narciso (Detalle)', order: 1 }
        ]
      },
      {
        id: 'monj-7',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/05-Sin-título-1.jpg',
        title: 'Sin título 05',
        tecnica: 'Cerámica',
        order: 7
      },
      {
        id: 'monj-8',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/06-Sin-título-2.jpg',
        title: 'Sin título 06',
        tecnica: 'Cerámica',
        order: 8
      },
      {
        id: 'monj-9',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/07-Sin-título-1.jpg',
        title: 'Sin título 07',
        tecnica: 'Cerámica',
        order: 9
      },
      {
        id: 'monj-10',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/12-Sin-título.jpg',
        title: 'Sin título 12',
        tecnica: 'Cerámica',
        order: 10
      },
      {
        id: 'monj-11',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/13-Sin-título.jpg',
        title: 'Sin título 13',
        tecnica: 'Cerámica',
        order: 11
      },
      {
        id: 'monj-12',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/09-Sin-título-1.jpg',
        title: 'Sin título 09',
        tecnica: 'Cerámica',
        order: 12
      }
    ]
  },
  {
    id: 'mujeresdictadores',
    slug: 'mujeresdictadores',
    sectionId: 'obras',
    title: 'Mujeres de los dictadores',
    nombre: 'Mujeres de los dictadores',
    order: 4,
    isActive: true,
    createdAt: '2016-08-01',
    description: 'Serie conceptual sobre arquetipos de poder y autoritarismo femenino.',
    images: [
      { id: 'md-1', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/06-Sin-título.jpg', title: 'Sin título 06', tecnica: 'Cerámica escultórica', destacada: true, order: 1 },
      { id: 'md-2', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/05-Sin-título.jpg', title: 'Sin título 05', tecnica: 'Cerámica escultórica', order: 2 },
      { id: 'md-3', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/07-Sin-título.jpg', title: 'Sin título 07', tecnica: 'Cerámica', order: 3 },
      { id: 'md-4', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01-Sin-título-2.jpg', title: 'Sin título 01', tecnica: 'Cerámica', order: 4 },
      { id: 'md-5', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/03-Sin-ttulo-3.jpg', title: 'Sin título 03', tecnica: 'Cerámica', order: 5 },
      { id: 'md-6', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/04-Sin-ttulo-1.jpg', title: 'Sin título 04', tecnica: 'Cerámica', order: 6 },
      { id: 'md-7', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/08-Sin-título-1.jpg', title: 'Sin título 08', tecnica: 'Cerámica', order: 7 },
      { id: 'md-8', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/09-Sin-título.jpg', title: 'Sin título 09', tecnica: 'Cerámica', order: 8 }
    ]
  },
  {
    id: 'nabateos',
    slug: 'nabateos',
    sectionId: 'obras',
    title: 'Nabateos',
    nombre: 'Nabateos',
    order: 5,
    isActive: true,
    createdAt: '2016-08-01',
    description: 'Estudios de volumetría, pátinas pétreas y referencias a las culturas del desierto.',
    images: [
      {
        id: 'nab-1',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01-sin-titulo.jpg',
        title: 'Sin título 01',
        tecnica: 'Cerámica y pátinas',
        destacada: true,
        order: 1,
        detailImages: [
          { id: 'nab-1a', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01a-sin-titulo.jpg', title: 'Detalle', order: 1 },
          { id: 'nab-1c', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01c-sin-titulo-2.jpg', title: 'Perfil', order: 2 },
          { id: 'nab-1g', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01g-sin-titulo-4.jpg', title: 'Perspectiva', order: 3 },
          { id: 'nab-1i', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01i-sin-titulo-1.jpg', title: 'Primer plano', order: 4 },
          { id: 'nab-1d', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01d-sin-titulo-1.jpg', title: 'Detalle superior', order: 5 },
          { id: 'nab-1f', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01f-sin-titulo.jpg', title: 'Detalle base', order: 6 },
          { id: 'nab-1h', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01h-sin-titulo-1.jpg', title: 'Vista posterior', order: 7 }
        ]
      },
      {
        id: 'nab-2',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/02a-sin-titulo-2.jpg',
        title: 'Sin título 02',
        tecnica: 'Cerámica',
        order: 2
      },
      {
        id: 'nab-3',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/03-sin-titulo.jpg',
        title: 'Sin título 03',
        tecnica: 'Cerámica',
        order: 3
      },
      {
        id: 'nab-4',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/04-sin-titulo.jpg',
        title: 'Sin título 04',
        tecnica: 'Cerámica',
        order: 4
      },
      {
        id: 'nab-5',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/05-sin-titulo.jpg',
        title: 'Sin título 05',
        tecnica: 'Cerámica',
        order: 5
      },
      {
        id: 'nab-6',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/06a-sin-titulo-1.jpg',
        title: 'Sin título 06',
        tecnica: 'Cerámica',
        order: 6
      },
      {
        id: 'nab-7',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/07a-sin-titulo-100x100.jpg',
        title: 'Sin título 07',
        tecnica: 'Cerámica',
        order: 7,
        detailImages: [
          { id: 'nab-7c', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/07c-sin-titulo.jpg', title: 'Detalle', order: 1 }
        ]
      },
      {
        id: 'nab-8',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/08-sin-titulo-2.jpg',
        title: 'Sin título 08',
        tecnica: 'Cerámica',
        order: 8
      },
      {
        id: 'nab-9',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/09-sin-titulo.jpg',
        title: 'Sin título 09',
        tecnica: 'Cerámica',
        order: 9
      },
      {
        id: 'nab-10',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/10-sin-titulo-1.jpg',
        title: 'Sin título 10',
        tecnica: 'Cerámica',
        order: 10
      },
      {
        id: 'nab-11',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/11-sin-titulo.jpg',
        title: 'Sin título 11',
        tecnica: 'Cerámica',
        order: 11
      },
      {
        id: 'nab-12',
        url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/12-sin-titulo.jpg',
        title: 'Sin título 12',
        tecnica: 'Cerámica',
        order: 12
      }
    ]
  },

  // --- INTERVENCIONES ---
  {
    id: 'monjes-peatonal',
    slug: 'monjes-peatonal',
    sectionId: 'intervenciones',
    title: 'Los cardinales',
    nombre: 'Los cardinales',
    order: 1,
    isActive: true,
    createdAt: '2016-08-01',
    description: 'Intervención de arte público urbano en la peatonal de Paraná.',
    images: [
      { id: 'card-1', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/4-Monjes.jpg', title: 'Los cardinales 01', tecnica: 'Intervención urbana', destacada: true, order: 1 },
      { id: 'card-2', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/4-Monjes-4.jpg', title: 'Los cardinales 02', tecnica: 'Intervención urbana', order: 2 },
      { id: 'card-3', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/4-Monjes-1-2.jpg', title: 'Los cardinales 03', tecnica: 'Intervención urbana', order: 3 },
      { id: 'card-4', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/4-Monjes-Retocado.jpg', title: 'Los cardinales 04', tecnica: 'Intervención urbana', order: 4 },
    ]
  },
  {
    id: 'vitrales-iglesia',
    slug: 'vitrales-iglesia',
    sectionId: 'intervenciones',
    title: 'Vitral',
    nombre: 'Vitral',
    order: 2,
    isActive: true,
    createdAt: '2016-08-01',
    description: 'Diseño, manufactura tradicional y restauración de vitrales sagrados.',
    images: [
      { id: 'vit-1', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/DSC00757.jpg', title: 'Vitral sagrado 01', tecnica: 'Vitral tradicional', destacada: true, order: 1 },
      { id: 'vit-2', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/DSC00759.jpg', title: 'Vitral sagrado 02', tecnica: 'Vitral tradicional', order: 2 },
      { id: 'vit-3', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/DSC00742.jpg', title: 'Vitral sagrado 03', tecnica: 'Vitral tradicional', order: 3 },
      { id: 'vit-4', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/DSC00749.jpg', title: 'Vitral sagrado 04', tecnica: 'Vitral tradicional', order: 4 },
      { id: 'vit-5', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/DSC00743.jpg', title: 'Vitral sagrado 05', tecnica: 'Vitral tradicional', order: 5 },
      { id: 'vit-6', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/DSC00741.jpg', title: 'Vitral sagrado 06', tecnica: 'Vitral tradicional', order: 6 },
      { id: 'vit-7', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/vitral-west-chester-ohio-usa.jpg', title: 'Vitral West Chester (Ohio, USA)', tecnica: 'Vitral tradicional', order: 7 },
      { id: 'vit-8', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/DSC00750.jpg', title: 'Vitral sagrado 08', tecnica: 'Vitral tradicional', order: 8 },
    ]
  },

  // --- EXPOSICIONES ---
  {
    id: 'entre-fuegos-y-juegos',
    slug: 'entre-fuegos-y-juegos',
    sectionId: 'exposiciones',
    title: 'Entre fuegos y juegos',
    nombre: 'Entre fuegos y juegos',
    order: 1,
    isActive: true,
    createdAt: '2016-08-01',
    description: 'Exposición junto a la artista plástica Adriana Tessore. Galería El Farol, Paraná – Entre Ríos.',
    images: [
      { id: 'ef-1', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/01-muestra-1.jpg', title: 'Muestra 01', tecnica: 'Escultura / Instalación', destacada: true, order: 1 },
      { id: 'ef-2', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/02-muestra.jpg', title: 'Muestra 02', tecnica: 'Escultura', order: 2 },
      { id: 'ef-3', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/03-muestra-1.jpg', title: 'Muestra 03', tecnica: 'Escultura', order: 3 },
      { id: 'ef-4', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/04-muestra.jpg', title: 'Muestra 04', tecnica: 'Escultura', order: 4 },
      { id: 'ef-5', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/06-muestra-1.jpg', title: 'Muestra 05', tecnica: 'Escultura', order: 5 },
      { id: 'ef-6', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/07-muestra.jpg', title: 'Muestra 06', tecnica: 'Escultura', order: 6 },
      { id: 'ef-7', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/08-muestra.jpg', title: 'Muestra 07', tecnica: 'Escultura', order: 7 },
      { id: 'ef-8', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/09-muestra-1.jpg', title: 'Muestra 08', tecnica: 'Escultura', order: 8 },
      { id: 'ef-9', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/10-muestra.jpg', title: 'Muestra 09', tecnica: 'Escultura', order: 9 },
      { id: 'ef-10', url: 'https://mariavalentehupp.com/wp-content/uploads/2016/07/11-muestra.jpg', title: 'Muestra 10', tecnica: 'Escultura', order: 10 },
    ]
  }
]

export const initialCVContent: CVContent = {
  biography: `Nace en Paraná – Entre Ríos (Argentina), en 1964.

Estudia en la Facultad de Humanidades Arte y Ciencias Sociales – Instituto Superior de Artes Visuales «Profesor Roberto Lopez Carnelli» obteniendo los títulos de Profesora en Artes Visuales – Especialidad Pintura y Especialidad Cerámica. Continúa su formación y obtiene la Licenciatura en Artes Plásticas – Facultad de Ciencias de la Educación – Universidad Nacional de Entre Ríos.

Becaria del Grupo de Intercambio de Estudios, auspiciados por el Rotary Internacional, desarrollado en el Estado de Ohio, USA, durante los meses de Abril y Mayo de 2004. Seleccionada en 2001 para el Programa de Intercambio de grupos de estudio del distrito 4960, Rotary Club de Paraná. Becaria en la XXII Experiencia de Tecnología y Escuela Libre, Seminario de Estudios Cerámicos de Sargadelos, La Coruña, España 1993.

Desde la década de los 90 es docente y participa activamente en la escena local exhibiendo su trabajo en ciudades de Argentina, República Oriental del Uruguay, Estados Unidos, España y Ámsterdam. Sus producciones incluyen cerámica, escultura, vitral, pintura mural y restauración, algunos de sus trabajos los ha realizado en colaboración con otros artistas. Su obra forma parte de colecciones públicas y privadas.`,
  biographyEn: `Born in Paraná – Entre Ríos (Argentina), in 1964.

Graduated as Visual Arts Professor in Painting and Ceramics from Instituto Superior de Artes Visuales «Profesor Roberto Lopez Carnelli» and holds a Bachelor of Fine Arts degree from Universidad Nacional de Entre Ríos (UNER).

Grantee of the Group Study Exchange program sponsored by Rotary International in Ohio, USA (2004). Fellow at the XXII Ceramic Technology & Open School Seminar in Sargadelos, Galicia, Spain (1993).

Active artist and educator since the 1990s, exhibiting extensively across Argentina, Uruguay, USA, Spain, and the Netherlands. Works encompass ceramic sculpture, stained glass, and public restoration projects in public and private collections.`,
  extendedCv: `Nace en Paraná – Entre Ríos (Argentina), en 1964.

MUESTRAS INDIVIDUALES
2000
– Cathedral Square Gallery, Mobile, Alabama, Estados Unidos de Norteamérica. Cerámica Escultórica.
– Ciclo Cultural 2000 de la Facultad de Ciencias Agropecuarias de Oro Verde. Cerámica Escultórica.
1998
– Club “La Luna”. Departamento Victoria. Entre Ríos. Cerámica Escultórica.

MUESTRAS COLECTIVAS
2015
– Feria Itinerante de Arte “Contemporánea”. Ministerio de Cultura y Educación, La Pampa, Chubut, Argentina. Escultura.
2014
– The View. Rosewood Gallery, Kettering, Ohio, USA. Escultura, cerámica.
– Entre Fuegos y Juegos / Entre Juegos y Fuegos, exposición junto a la artista plástica Adriana Tessore. Escultura. Galería El Farol, Paraná – Entre Ríos.

INTERVENCIONES EN ESPACIOS PÚBLICOS E INSTITUCIONES
2009
– Autora de los vitrales de técnica tradicional. Imagen de la Virgen de Lourdes (6m x 4m). Parroquia de la Inmaculada Concepción. Villaguay, Entre Ríos.
2008
– Integrante del equipo encargado de la restauración de los vitrales del duomo central de la Catedral Metropolitana de Paraná, Entre Ríos.

PREMIOS Y DISTINCIONES
2015
– Mención Honorable. 47th Salón de Arte Gran Hamilton, Fitton Center for Creative Arts. Hamilton, Ohio, USA. Escultura Cerámica.
2012
– 1er Premio adquisición “Gobierno de la provincia de Entre Ríos. Obra: “El coleccionista inglés”. XLVIII Salón Anual de Artistas Plásticos de Entre Ríos.`
}
