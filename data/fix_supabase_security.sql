-- ==============================================================================
-- SCRIPT DE SEGURIDAD Y RESOLUCIÓN DE ALERTAS EN SUPABASE
-- Tablas protegidas: profiles, points_ledger, qr_tokens, qr_scan_logs,
--                    promotion_points, point_budgets, redemption_products
-- Funciones con search_path fijo: claim_qr_points
-- ==============================================================================

-- 1. HABILITAR ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS PÚBLICAS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.qr_scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.promotion_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.point_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.redemption_products ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. POLÍTICAS DE SEGURIDAD: PROFILES
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 3. POLÍTICAS DE SEGURIDAD: POINTS_LEDGER
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios movimientos" ON public.points_ledger;
CREATE POLICY "Los usuarios pueden ver sus propios movimientos"
  ON public.points_ledger
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. POLÍTICAS DE SEGURIDAD: QR_TOKENS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir lectura de tokens QR a usuarios autenticados" ON public.qr_tokens;
CREATE POLICY "Permitir lectura de tokens QR a usuarios autenticados"
  ON public.qr_tokens
  FOR SELECT
  TO authenticated
  USING (true);

-- ------------------------------------------------------------------------------
-- 5. POLÍTICAS DE SEGURIDAD: QR_SCAN_LOGS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.qr_scan_logs;
CREATE POLICY "Allow anonymous inserts"
  ON public.qr_scan_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow reading for authenticated only" ON public.qr_scan_logs;
CREATE POLICY "Allow reading for authenticated only"
  ON public.qr_scan_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- ------------------------------------------------------------------------------
-- 6. POLÍTICAS DE SEGURIDAD: PROMOTION_POINTS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Lectura publica de puntos de promocion" ON public.promotion_points;
CREATE POLICY "Lectura publica de puntos de promocion"
  ON public.promotion_points
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- ------------------------------------------------------------------------------
-- 7. POLÍTICAS DE SEGURIDAD: POINT_BUDGETS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Lectura de presupuestos para usuarios autenticados" ON public.point_budgets;
CREATE POLICY "Lectura de presupuestos para usuarios autenticados"
  ON public.point_budgets
  FOR SELECT
  TO authenticated
  USING (true);

-- ------------------------------------------------------------------------------
-- 8. POLÍTICAS DE SEGURIDAD: REDEMPTION_PRODUCTS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Lectura pública de productos de canje" ON public.redemption_products;
CREATE POLICY "Lectura pública de productos de canje"
  ON public.redemption_products
  FOR SELECT
  TO public, anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Gestión de productos para admins" ON public.redemption_products;
CREATE POLICY "Gestión de productos para admins"
  ON public.redemption_products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 9. CORRECCIÓN DE SEGURIDAD EN FUNCIONES SECURITY DEFINER (search_path)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_qr_points(p_token UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_qr_record RECORD;
  v_user_id UUID;
  v_current_balance INT;
  v_last_claim TIMESTAMPTZ;
  
  v_budget RECORD;
  v_distributed INT;
  
  v_pp_name TEXT;
BEGIN
  -- Obtener usuario autenticado
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('status', 401, 'message', 'No autorizado');
  END IF;

  -- Buscar token
  SELECT * INTO v_qr_record 
  FROM public.qr_tokens 
  WHERE token = p_token;

  IF NOT FOUND THEN
    RETURN json_build_object('status', 404, 'message', 'Código QR inválido');
  END IF;

  IF NOT v_qr_record.is_active THEN
    RETURN json_build_object('status', 409, 'message', 'El código QR está desactivado');
  END IF;

  IF v_qr_record.expires_at < NOW() THEN
    RETURN json_build_object('status', 410, 'message', 'El código QR ha expirado');
  END IF;

  -- Validar Cooldown (24h)
  SELECT MAX(created_at) INTO v_last_claim 
  FROM public.points_ledger 
  WHERE user_id = v_user_id 
    AND qr_token = p_token;

  IF v_last_claim IS NOT NULL AND (NOW() - v_last_claim) < INTERVAL '24 hours' THEN
    RETURN json_build_object('status', 429, 'message', 'Ya has reclamado este código en las últimas 24 horas');
  END IF;

  -- Validar Presupuesto Activo
  SELECT * INTO v_budget FROM public.point_budgets WHERE is_active = true LIMIT 1;
  IF FOUND AND v_budget.budget_type != 'none' THEN
    
    IF (v_budget.budget_type = 'date_range' OR v_budget.budget_type = 'both') THEN
      IF v_budget.start_date IS NOT NULL AND CURRENT_DATE < v_budget.start_date THEN
          RETURN json_build_object('status', 400, 'message', 'La promoción aún no ha comenzado.');
      END IF;
      IF v_budget.end_date IS NOT NULL AND CURRENT_DATE > v_budget.end_date THEN
          RETURN json_build_object('status', 400, 'message', 'La promoción ha finalizado (fuera de fecha).');
      END IF;
    END IF;

    IF (v_budget.budget_type = 'fixed_bag' OR v_budget.budget_type = 'both') THEN
      -- Calcular puntos entregados
      IF v_budget.budget_type = 'both' THEN
        SELECT COALESCE(SUM(amount), 0) INTO v_distributed
        FROM public.points_ledger
        WHERE DATE(created_at) >= COALESCE(v_budget.start_date, '1970-01-01') 
          AND DATE(created_at) <= COALESCE(v_budget.end_date, '9999-12-31');
      ELSE
        SELECT COALESCE(SUM(amount), 0) INTO v_distributed
        FROM public.points_ledger;
      END IF;

      IF (v_distributed + v_qr_record.points_value) > v_budget.total_points THEN
          RETURN json_build_object('status', 400, 'message', 'La promoción ha finalizado (cupo agotado).');
      END IF;
    END IF;

  END IF;

  -- Obtener nombre del punto de promoción
  SELECT name INTO v_pp_name FROM public.promotion_points WHERE id::text = v_qr_record.store_id;

  -- Proceder a insertar en el ledger
  INSERT INTO public.points_ledger (user_id, amount, description, qr_token)
  VALUES (
    v_user_id, 
    v_qr_record.points_value, 
    'Puntos obtenidos en ' || COALESCE(v_pp_name, 'Punto Promoción ' || SUBSTRING(v_qr_record.store_id FROM 1 FOR 4)), 
    p_token
  );

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
$$;

-- 10. Recargar schema cache
NOTIFY pgrst, 'reload schema';
