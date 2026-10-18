-- Schema para María Valente Art Portfolio
-- Ejecutar en: Supabase SQL Editor (https://supabase.com/dashboard/project/pzmyotvuczbszxrpkhdb/sql)

-- 1. Tabla de configuración y contenido general (Key-Value)
CREATE TABLE IF NOT EXISTS public.site_content (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Categorías / Series
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    section_id TEXT NOT NULL,
    title TEXT NOT NULL,
    nombre TEXT,
    subtitle TEXT,
    description TEXT,
    cover_image TEXT,
    menu_image TEXT,
    year_place TEXT,
    "order" INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    images JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 4. Políticas: Lectura pública (Cualquiera puede ver la web)
DROP POLICY IF EXISTS "Public read on site_content" ON public.site_content;
CREATE POLICY "Public read on site_content" 
ON public.site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read on categories" ON public.categories;
CREATE POLICY "Public read on categories" 
ON public.categories FOR SELECT USING (true);

-- 5. Políticas: Escritura pública (temporalmente libre o protegible con Service Role / Auth)
-- Permite guardar cambios desde el panel de administración
DROP POLICY IF EXISTS "Allow write on site_content" ON public.site_content;
CREATE POLICY "Allow write on site_content" 
ON public.site_content FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow write on categories" ON public.categories;
CREATE POLICY "Allow write on categories" 
ON public.categories FOR ALL USING (true) WITH CHECK (true);
