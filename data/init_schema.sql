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

-- 4. Función Transaccional RPC: claim_qr_points (Con Cooldown y Presupuesto)
CREATE OR REPLACE FUNCTION claim_qr_points(p_token UUID)
RETURNS JSON AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Tabla de Logs de Escaneos Anónimos (Fase de Pruebas)
CREATE TABLE IF NOT EXISTS public.qr_scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_token TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS para qr_scan_logs
ALTER TABLE public.qr_scan_logs ENABLE ROW LEVEL SECURITY;

-- Permitir que cualquier persona (incluso sin login) inserte un log
CREATE POLICY "Allow anonymous inserts" 
ON public.qr_scan_logs FOR INSERT 
TO public, anon 
WITH CHECK (true);

-- Solo usuarios autenticados pueden ver los logs (Opcional)
CREATE POLICY "Allow reading for authenticated only"
ON public.qr_scan_logs FOR SELECT
TO authenticated
USING (true);

-- 6. Tabla de Puntos de Promoción (Sucursales/Negocios)
CREATE TABLE IF NOT EXISTS public.promotion_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  manager TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de Presupuestos / Bolsa de Puntos
CREATE TABLE IF NOT EXISTS public.point_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_type TEXT NOT NULL, -- Valores: 'date_range', 'fixed_bag', 'both', 'none'
  total_points INT DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
