-- ==============================================================================
-- MIGRACIÓN COMPLETA: LOGIN CON GOOGLE, PERFILADO PROGRESIVO Y SEGURIDAD RLS
-- Proyecto: Fidelización CRM Mandorla
-- Archivo: progressive_profiling_migration.sql
-- ==============================================================================

-- 1. ADAPTACIÓN DE TABLA PROFILES PARA PERFILADO PROGRESIVO (FRICCIÓN CERO)
-- Permitir que teléfono, dirección y cumpleaños sean opcionales inicialmente
ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN address DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN birthday DROP NOT NULL;

-- 2. FUNCIÓN SEGURA PARA CREACIÓN AUTOMÁTICA DE PERFIL (GOOGLE OAUTH & EMAIL)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, address, birthday, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NULL,
    NULL,
    NULL,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = CASE 
      WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END;

  RETURN NEW;
END;
$$;

-- 3. TRIGGER AUTOMÁTICO VINCULADO A AUTH.USERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. POLÍTICAS RLS PARA PERMITIR OPERACIÓN FLUIDA DE USUARIOS
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Los usuarios pueden insertar su propio perfil" ON public.profiles;
CREATE POLICY "Los usuarios pueden insertar su propio perfil"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. RECARGA DE SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
