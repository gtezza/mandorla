-- Script de Inicialización: Motor de Fidelización (Supabase)

-- 1. Tabla de Usuarios (Opcional, si extendemos auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
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

-- 3. Tokens QR Generados (Punto de Venta)
CREATE TABLE IF NOT EXISTS public.qr_tokens (
  token UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT NOT NULL,
  points_value INT NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Función Transaccional RPC: claim_qr_points
CREATE OR REPLACE FUNCTION claim_qr_points(p_token UUID)
RETURNS JSON AS $$
DECLARE
  v_qr_record RECORD;
  v_user_id UUID;
  v_current_balance INT;
BEGIN
  -- Obtener usuario autenticado
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('status', 401, 'message', 'No autenticado');
  END IF;

  -- Bloquear la fila del token para evitar race conditions (Doble escaneo)
  SELECT * INTO v_qr_record 
  FROM public.qr_tokens 
  WHERE token = p_token 
  FOR UPDATE;

  -- Validaciones
  IF NOT FOUND THEN
    RETURN json_build_object('status', 404, 'message', 'Token no encontrado');
  END IF;

  IF v_qr_record.is_used THEN
    RETURN json_build_object('status', 409, 'message', 'Token ya utilizado');
  END IF;

  IF v_qr_record.expires_at < NOW() THEN
    RETURN json_build_object('status', 410, 'message', 'Token expirado');
  END IF;

  -- 1. Marcar como usado
  UPDATE public.qr_tokens 
  SET is_used = TRUE, used_by = v_user_id, used_at = NOW() 
  WHERE token = p_token;

  -- 2. Insertar en ledger
  INSERT INTO public.points_ledger (user_id, amount, description, qr_token)
  VALUES (v_user_id, v_qr_record.points_value, 'Canje de QR en tienda', p_token);

  -- 3. Calcular balance actual
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
