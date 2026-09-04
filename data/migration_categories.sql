-- Crear tabla de Categorías / Niveles de Recompensas
CREATE TABLE IF NOT EXISTS public.reward_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  color_theme TEXT DEFAULT 'blue',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.reward_categories ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reward_categories' AND policyname = 'Lectura pública de categorias'
  ) THEN
    CREATE POLICY "Lectura pública de categorias"
      ON public.reward_categories
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Política de gestión para admins (usamos la misma lógica que en products)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reward_categories' AND policyname = 'Gestión de categorias para admins'
  ) THEN
    CREATE POLICY "Gestión de categorias para admins"
      ON public.reward_categories
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Insertar una categoría base por defecto si la tabla está vacía
INSERT INTO public.reward_categories (name, min_points, description, color_theme)
SELECT 'Bronce', 0, 'Categoría inicial para todos los premios', 'gray'
WHERE NOT EXISTS (SELECT 1 FROM public.reward_categories LIMIT 1);
