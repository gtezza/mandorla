import { Flame, Coins, ShoppingBag, Sparkles } from "lucide-react";

interface InsightsKpiCardsProps {
  burnRate: number;
  totalEarned: number;
  totalRedeemed: number;
  circulatingBalance: number;
  avgRedemptionPoints: number;
  activeCustomersRate: number;
  totalCustomers: number;
  activeCustomersCount: number;
}

export default function InsightsKpiCards({
  burnRate,
  totalEarned,
  totalRedeemed,
  circulatingBalance,
  avgRedemptionPoints,
  activeCustomersRate,
  totalCustomers,
  activeCustomersCount,
}: InsightsKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tasa de Canje (Burn Rate) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tasa de Canje</span>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Flame className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {burnRate.toFixed(1)}%
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {totalRedeemed.toLocaleString()} de {totalEarned.toLocaleString()} pts emitidos
          </p>
        </div>
      </div>

      {/* 2. Pasivo Circulante en Puntos */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Puntos en Circulación</span>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">
            {circulatingBalance.toLocaleString()} pts
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Saldo acumulado en billeteras activas
          </p>
        </div>
      </div>

      {/* 3. Ticket Promedio de Canje */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Promedio por Canje</span>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {avgRedemptionPoints > 0 ? Math.round(avgRedemptionPoints).toLocaleString() : 0} pts
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Puntos promedio por operación de premio
          </p>
        </div>
      </div>

      {/* 4. Tasa de Clientes Activos */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Activación de Base</span>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            {activeCustomersRate.toFixed(1)}%
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">
            {activeCustomersRate.toFixed(1)}%
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {activeCustomersCount} de {totalCustomers} clientes con movimientos
          </p>
        </div>
      </div>
    </div>
  );
}
