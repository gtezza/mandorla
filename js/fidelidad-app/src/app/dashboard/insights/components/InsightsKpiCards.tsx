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
      <div className="bg-[#2a1a18] p-5 rounded-2xl border border-[#c6a96b]/20 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#f5efe6]/60">Tasa de Canje</span>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Flame className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#f5efe6] font-serif">
            {burnRate.toFixed(1)}%
          </div>
          <p className="mt-1 text-xs text-[#f5efe6]/60">
            {totalRedeemed.toLocaleString()} de {totalEarned.toLocaleString()} pts emitidos
          </p>
        </div>
      </div>

      {/* 2. Pasivo Circulante en Puntos */}
      <div className="bg-[#2a1a18] p-5 rounded-2xl border border-[#c6a96b]/20 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#f5efe6]/60">Puntos en Circulación</span>
          <div className="p-2.5 bg-[#c6a96b]/10 text-[#c6a96b] rounded-xl">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#c6a96b]">
            {circulatingBalance.toLocaleString()} pts
          </div>
          <p className="mt-1 text-xs text-[#f5efe6]/60">
            Saldo acumulado en billeteras activas
          </p>
        </div>
      </div>

      {/* 3. Ticket Promedio de Canje */}
      <div className="bg-[#2a1a18] p-5 rounded-2xl border border-[#c6a96b]/20 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#f5efe6]/60">Promedio por Canje</span>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#f5efe6] font-serif">
            {avgRedemptionPoints > 0 ? Math.round(avgRedemptionPoints).toLocaleString() : 0} pts
          </div>
          <p className="mt-1 text-xs text-[#f5efe6]/60">
            Puntos promedio por operación de premio
          </p>
        </div>
      </div>

      {/* 4. Tasa de Clientes Activos */}
      <div className="bg-[#2a1a18] p-5 rounded-2xl border border-[#c6a96b]/20 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#f5efe6]/60">Activación de Base</span>
          <div className="p-2.5 bg-purple-900/30 text-purple-600 rounded-xl">
            {activeCustomersRate.toFixed(1)}%
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">
            {activeCustomersRate.toFixed(1)}%
          </div>
          <p className="mt-1 text-xs text-[#f5efe6]/60">
            {activeCustomersCount} de {totalCustomers} clientes con movimientos
          </p>
        </div>
      </div>
    </div>
  );
}
