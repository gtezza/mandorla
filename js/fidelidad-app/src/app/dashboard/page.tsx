import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ArrowUpRight, ArrowDownRight, Activity, Users } from "lucide-react";
import MetricasClientList from "./MetricasClientList";

// MVP Security: Lista de correos con acceso
const ADMIN_EMAILS = [
  "gerardo+test1@gmail.com",
  "gerardo@gtdata.com.ar",
  "gerardo+test2@gmail.com",
  "probando123@hola.com" // Para pruebas del mock
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect("/admin/login");
  }

  // Verificar si es admin
  const userEmail = authData.user.email?.toLowerCase() || "";
  const isAdmin = ADMIN_EMAILS.some(admin => admin.toLowerCase() === userEmail);
  
  if (!isAdmin) {
    redirect("/admin/login");
  }

  // 1. Obtener Datos
  const { data: ledger } = await supabase.from("points_ledger").select("*");
  const { data: profiles } = await supabase.from("profiles").select("*");
  const { data: qrTokens } = await supabase.from("qr_tokens").select("token, store_id");
  const { data: promotionPoints } = await supabase.from("promotion_points").select("id, name");

  const records = ledger || [];
  
  // Mapa de Store ID a Nombre del Punto de Promoción
  const ppMap = new Map((promotionPoints || []).map(p => [p.id, p.name]));
  
  // Mapa de Token QR a Store ID
  const qrMap = new Map((qrTokens || []).map(q => [q.token, q.store_id]));

  // Agrupar datos por cliente para el componente MetricasClientList
  const clientsData = (profiles || []).map(profile => {
    const userLedger = records.filter(r => r.user_id === profile.id);
    let earned = 0;
    let redeemed = 0;
    
    const history = userLedger.map(r => {
      if (r.amount > 0) earned += r.amount;
      if (r.amount < 0) redeemed += r.amount;

      let description = r.description;
      let ppName = undefined;
      
      if (r.qr_token) {
        const storeId = qrMap.get(r.qr_token);
        if (storeId) {
          ppName = ppMap.get(storeId) || `PP (ID: ${storeId.substring(0,4)}...)`;
          // Si el mensaje es el genérico viejo o no tiene, lo reemplazamos
          if (!description || description === 'Canje de QR estático en tienda') {
            description = `Puntos obtenidos en ${ppName}`;
          }
        }
      }

      return {
        id: r.id,
        amount: r.amount,
        description: description,
        date: r.created_at,
        store_id: ppName // Usamos el nombre real en vez del ID puro
      };
    });

    return {
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      earned,
      redeemed,
      balance: earned + redeemed, // O sumar todo el ledger, es lo mismo
      history
    };
  });

  // 3. Calcular Métricas
  const now = new Date();
  
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  let pointsToday = 0;
  let pointsYesterday = 0;
  let pointsThisMonth = 0;
  let pointsLastMonth = 0;

  records.forEach(r => {
    const d = new Date(r.created_at);
    if (d >= todayStart) {
      pointsToday += r.amount;
    } else if (d >= yesterdayStart && d < todayStart) {
      pointsYesterday += r.amount;
    }

    if (d >= thisMonthStart) {
      pointsThisMonth += r.amount;
    } else if (d >= lastMonthStart && d < thisMonthStart) {
      pointsLastMonth += r.amount;
    }
  });

  const calcDiff = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prev) / prev) * 100);
  };

  const diffDaily = calcDiff(pointsToday, pointsYesterday);
  const diffMonthly = calcDiff(pointsThisMonth, pointsLastMonth);

  // 4. Calcular Métricas de Presupuesto
  const { data: activeBudget } = await supabase
    .from("point_budgets")
    .select("*")
    .eq("is_active", true)
    .single();

  let budgetDistributed = 0;
  let budgetRemaining: number | null = null;
  let hasBudget = false;
  let budgetLabel = "Sin Límite";

  if (activeBudget && activeBudget.budget_type !== 'none') {
    hasBudget = true;
    records.forEach(r => {
      const d = new Date(r.created_at);
      let inRange = true;
      if ((activeBudget.budget_type === 'date_range' || activeBudget.budget_type === 'both') && activeBudget.start_date && activeBudget.end_date) {
        const start = new Date(activeBudget.start_date);
        const end = new Date(activeBudget.end_date);
        end.setHours(23, 59, 59, 999);
        if (d < start || d > end) inRange = false;
      }
      if (inRange) {
        budgetDistributed += r.amount;
      }
    });

    if (activeBudget.budget_type === 'fixed_bag' || activeBudget.budget_type === 'both') {
      budgetRemaining = activeBudget.total_points - budgetDistributed;
      budgetLabel = `Límite: ${activeBudget.total_points}`;
    } else if (activeBudget.budget_type === 'date_range') {
      budgetLabel = `Por Fechas (${activeBudget.start_date} a ${activeBudget.end_date})`;
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#c6a96b] font-serif tracking-wide">Resumen General</h1>
        <span className="bg-[#1a0e0d] border border-[#c6a96b]/30 text-[#c6a96b] text-sm font-medium px-3 py-1 rounded-full shadow-sm">
          Actualizado al instante
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Presupuesto / Bolsa */}
        <div className="bg-[#2a1a18] rounded-xl shadow-xl border border-[#c6a96b]/20 p-6 flex flex-col relative overflow-hidden transition-all hover:border-[#c6a96b]/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#f5efe6]/70 font-medium">Bolsa de Puntos</h3>
            <div className="p-2 bg-purple-900/30 rounded-lg border border-purple-500/20">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          
          {hasBudget ? (
            <>
              <p className="text-4xl font-bold text-[#f5efe6] mb-2 font-serif">{budgetDistributed}</p>
              <div className="flex items-center justify-between text-sm text-[#f5efe6]/50">
                <span>entregados</span>
                <span className="font-semibold text-[#c6a96b]">{budgetLabel}</span>
              </div>
              
              {budgetRemaining !== null && (
                <div className="mt-4 pt-4 border-t border-[#c6a96b]/10 flex justify-between items-center">
                  <span className="text-sm font-medium text-[#f5efe6]/70">Saldo Restante</span>
                  <span className={`text-lg font-bold ${budgetRemaining <= 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {budgetRemaining}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#f5efe6]/40">
              <span className="text-sm">Sin presupuesto activo</span>
            </div>
          )}
        </div>

        {/* Card Hoy */}
        <div className="bg-[#2a1a18] rounded-xl shadow-xl border border-[#c6a96b]/20 p-6 flex flex-col relative overflow-hidden transition-all hover:border-[#c6a96b]/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#f5efe6]/70 font-medium">Puntos Entregados (Hoy)</h3>
            <div className="p-2 bg-[#c6a96b]/20 rounded-lg border border-[#c6a96b]/30">
              <Activity className="w-5 h-5 text-[#c6a96b]" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#f5efe6] mb-2 font-serif">{pointsToday}</p>
          
          <div className="flex items-center gap-2">
            <span className={`flex items-center text-sm font-semibold ${diffDaily >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {diffDaily >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {Math.abs(diffDaily)}%
            </span>
            <span className="text-sm text-[#f5efe6]/50">vs ayer ({pointsYesterday})</span>
          </div>
        </div>

        {/* Card Mes */}
        <div className="bg-[#2a1a18] rounded-xl shadow-xl border border-[#c6a96b]/20 p-6 flex flex-col relative overflow-hidden transition-all hover:border-[#c6a96b]/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#f5efe6]/70 font-medium">Puntos Entregados (Mes)</h3>
            <div className="p-2 bg-indigo-900/30 rounded-lg border border-indigo-500/20">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#f5efe6] mb-2 font-serif">{pointsThisMonth}</p>
          
          <div className="flex items-center gap-2">
            <span className={`flex items-center text-sm font-semibold ${diffMonthly >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {diffMonthly >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {Math.abs(diffMonthly)}%
            </span>
            <span className="text-sm text-[#f5efe6]/50">vs mes anterior ({pointsLastMonth})</span>
          </div>
        </div>

        {/* Card Clientes */}
        <div className="bg-[#2a1a18] rounded-xl shadow-xl border border-[#c6a96b]/20 p-6 flex flex-col relative overflow-hidden transition-all hover:border-[#c6a96b]/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#f5efe6]/70 font-medium">Total de Clientes</h3>
            <div className="p-2 bg-orange-900/30 rounded-lg border border-orange-500/20">
              <Users className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#f5efe6] mb-2 font-serif">{(profiles || []).length}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#f5efe6]/50">Registrados en la plataforma</span>
          </div>
        </div>
      </div>

      {/* Listado de Clientes agrupados en Métricas */}
      <MetricasClientList clients={clientsData} />
    </div>
  );
}
