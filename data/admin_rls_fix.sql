-- ==========================================
-- SCRIPT PARA SOLUCIONAR EL DASHBOARD VACÍO
-- ==========================================
-- El dashboard no muestra los clientes ni sus puntos porque las políticas
-- de seguridad (RLS) actuales solo le permiten a cada usuario ver SUS propios
-- datos. 
--
-- Con estas dos nuevas políticas, le damos permiso a los correos
-- configurados como administradores para poder ver a todos los clientes.

-- 1. Permitir a los administradores ver todos los perfiles
CREATE POLICY "Admins pueden ver todos los perfiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') IN (
      'gerardo+test1@gmail.com', 
      'gerardo@gtdata.com.ar', 
      'gerardo+test2@gmail.com', 
      'probando123@hola.com'
    )
  );

-- 2. Permitir a los administradores ver todos los movimientos de puntos
CREATE POLICY "Admins pueden ver todos los ledgers"
  ON public.points_ledger
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') IN (
      'gerardo+test1@gmail.com', 
      'gerardo@gtdata.com.ar', 
      'gerardo+test2@gmail.com', 
      'probando123@hola.com'
    )
  );
