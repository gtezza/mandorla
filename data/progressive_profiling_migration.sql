-- ==============================================================================
-- MIGRACIÓN: PERFILADO PROGRESIVO Y AUTENTICACIÓN GOOGLE
-- 1. Permitir que los campos phone, address y birthday sean opcionales (NULL)
--    al crearse el usuario automáticamente desde Google OAuth.
-- 2. Trigger automático opcional para crear el perfil básico al crearse un usuario en auth.users.
-- ==============================================================================

-- 1. Hacer campos opcionales en public.profiles para registro rápido (Fricción Cero)
ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN address DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN birthday DROP NOT NULL;

-- 2. Función y Trigger automático al registrarse con Google u otro proveedor
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

-- Crear el trigger en auth.users si no existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Notificar recarga de schema
NOTIFY pgrst, 'reload schema';
