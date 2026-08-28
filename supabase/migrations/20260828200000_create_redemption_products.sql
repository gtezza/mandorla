-- Migración: Creación de la tabla de productos de canje con SKU y soporte RLS

CREATE TABLE IF NOT EXISTS public.redemption_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  points_required INTEGER NOT NULL CHECK (points_required >= 0),
  additional_money NUMERIC(10, 2) DEFAULT 0.00 CHECK (additional_money >= 0),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.redemption_products ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'redemption_products' AND policyname = 'Lectura pública de productos de canje'
  ) THEN
    CREATE POLICY "Lectura pública de productos de canje" 
      ON public.redemption_products 
      FOR SELECT 
      USING (true);
  END IF;
END $$;

-- Política de gestión total para usuarios autenticados / admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'redemption_products' AND policyname = 'Gestión de productos para admins'
  ) THEN
    CREATE POLICY "Gestión de productos para admins" 
      ON public.redemption_products 
      FOR ALL 
      TO authenticated 
      USING (true) 
      WITH CHECK (true);
  END IF;
END $$;
