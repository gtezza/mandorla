import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SortableTable from "./SortableTable";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

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
    // Si no es admin pero intenta entrar al dashboard, lo sacamos
    redirect("/admin/login");
  }

  // 1. Obtener Datos
  const { data: ledger } = await supabase.from("points_ledger").select("*");
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, email");

  const records = ledger || [];
  const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

  // 2. Unir datos para la tabla
  const tableData = records.map(r => {
    const profile = profilesMap.get(r.user_id);
    return {
      id: r.id,
      full_name: profile?.full_name || "Desconocido",
      email: profile?.email || "Sin correo",
      amount: r.amount,
      created_at: r.created_at,
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
        <h1 className="text-3xl font-bold text-gray-900">Resumen General</h1>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          Actualizado al instante
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Presupuesto / Bolsa */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Bolsa de Puntos</h3>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          
          {hasBudget ? (
            <>
              <p className="text-4xl font-bold text-gray-900 mb-2">{budgetDistributed}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>entregados</span>
                <span className="font-semibold text-gray-900">{budgetLabel}</span>
              </div>
              
              {budgetRemaining !== null && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Saldo Restante</span>
                  <span className={`text-lg font-bold ${budgetRemaining <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {budgetRemaining}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-sm">Sin presupuesto activo</span>
            </div>
          )}
        </div>

        {/* Card Hoy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Puntos Entregados (Hoy)</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{pointsToday}</p>
          
          <div className="flex items-center gap-2">
            <span className={`flex items-center text-sm font-semibold ${diffDaily >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {diffDaily >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {Math.abs(diffDaily)}%
            </span>
            <span className="text-sm text-gray-400">vs ayer ({pointsYesterday})</span>
          </div>
        </div>

        {/* Card Mes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Puntos Entregados (Mes)</h3>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{pointsThisMonth}</p>
          
          <div className="flex items-center gap-2">
            <span className={`flex items-center text-sm font-semibold ${diffMonthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {diffMonthly >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {Math.abs(diffMonthly)}%
            </span>
            <span className="text-sm text-gray-400">vs mes anterior ({pointsLastMonth})</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Transacciones</h2>
        <SortableTable initialData={tableData} />
      </div>
    </div>
  );
}
