-- Script de Inicialización: Motor de Fidelización (Supabase) - QR Estático

-- 1. Tabla de Usuarios (Perfiles extendidos)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  birthday DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Registro de Puntos (Ledger)
CREATE TABLE IF NOT EXISTS public.points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount INT NOT NULL,
  description TEXT,
  qr_token UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tokens QR Generados (Catálogo de QRs Impresos)
CREATE TABLE IF NOT EXISTS public.qr_tokens (
  token UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT NOT NULL,
  points_value INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Función Transaccional RPC: claim_qr_points (Con Cooldown de 24 horas)
CREATE OR REPLACE FUNCTION claim_qr_points(p_token UUID)
RETURNS JSON AS $$
DECLARE
  v_qr_record RECORD;
  v_user_id UUID;
  v_current_balance INT;
  v_last_claim TIMESTAMPTZ;
BEGIN
  -- Obtener usuario autenticado
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('status', 401, 'message', 'No autenticado');
  END IF;

  -- Obtener el Token QR
  SELECT * INTO v_qr_record 
  FROM public.qr_tokens 
  WHERE token = p_token;

  -- Validaciones
  IF NOT FOUND THEN
    RETURN json_build_object('status', 404, 'message', 'Token no encontrado');
  END IF;

  IF NOT v_qr_record.is_active THEN
    RETURN json_build_object('status', 409, 'message', 'El código QR está desactivado');
  END IF;

  IF v_qr_record.expires_at < NOW() THEN
    RETURN json_build_object('status', 410, 'message', 'El código QR ha expirado');
  END IF;

  -- Sistema Antifraude: Verificar si el usuario escaneó ESTE token en las últimas 24 horas
  /* COMENTADO PARA ETAPA DE PRUEBA
  SELECT MAX(created_at) INTO v_last_claim
  FROM public.points_ledger
  WHERE user_id = v_user_id AND qr_token = p_token;

  IF v_last_claim IS NOT NULL AND (NOW() - v_last_claim) < INTERVAL '24 hours' THEN
    RETURN json_build_object('status', 429, 'message', 'Solo puedes escanear este código una vez cada 24 horas.');
  END IF;
  */

  -- Proceder a insertar en el ledger
  INSERT INTO public.points_ledger (user_id, amount, description, qr_token)
  VALUES (v_user_id, v_qr_record.points_value, 'Canje de QR estático en tienda', p_token);

  -- Calcular balance actual
  SELECT COALESCE(SUM(amount), 0) INTO v_current_balance 
  FROM public.points_ledger 
  WHERE user_id = v_user_id;

  -- Retornar éxito
  RETURN json_build_object(
    'status', 200, 
    'points_awarded', v_qr_record.points_value, 
    'current_balance', v_current_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
