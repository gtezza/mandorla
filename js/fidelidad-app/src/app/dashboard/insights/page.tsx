import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LineChart, Sparkles } from "lucide-react";
import InsightsKpiCards from "./components/InsightsKpiCards";
import SegmentacionClientes, { SegmentCustomer } from "./components/SegmentacionClientes";
import TopCanjesYPuntosPromocion, {
  TopProductItem,
  TopPromotionPointItem,
} from "./components/TopCanjesYPuntosPromocion";

// MVP Security: Lista de correos con acceso
const ADMIN_EMAILS = [
  "gerardo+test1@gmail.com",
  "gerardo@gtdata.com.ar",
  "gerardo+test2@gmail.com",
  "probando123@hola.com",
];

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect("/admin/login");
  }

  // Verificar si es admin
  const userEmail = authData.user.email?.toLowerCase() || "";
  const isAdmin = ADMIN_EMAILS.some((admin) => admin.toLowerCase() === userEmail);

  if (!isAdmin) {
    redirect("/admin/login");
  }

  // 1. Obtener Datos desde Supabase
  const [
    { data: ledger },
    { data: profiles },
    { data: qrTokens },
    { data: promotionPoints },
    { data: redeemableProducts },
  ] = await Promise.all([
    supabase.from("points_ledger").select("*"),
    supabase.from("profiles").select("*"),
    supabase.from("qr_tokens").select("token, store_id"),
    supabase.from("promotion_points").select("id, name, type"),
    supabase.from("redeemable_products").select("*"),
  ]);

  const records = ledger || [];
  const users = profiles || [];
  const products = redeemableProducts || [];
  const pPoints = promotionPoints || [];
  const qrs = qrTokens || [];

  // Mapeos auxiliares
  const qrToStoreMap = new Map(qrs.map((q) => [q.token, q.store_id]));
  const ppMap = new Map(pPoints.map((p) => [p.id, p]));

  // --- CÁLCULOS KPI GLOBALES ---
  let totalEarned = 0;
  let totalRedeemedAbs = 0;
  let redemptionOperationsCount = 0;

  records.forEach((r) => {
    if (r.amount > 0) {
      totalEarned += r.amount;
    } else if (r.amount < 0) {
      totalRedeemedAbs += Math.abs(r.amount);
      redemptionOperationsCount += 1;
    }
  });

  const circulatingBalance = totalEarned - totalRedeemedAbs;
  const burnRate = totalEarned > 0 ? (totalRedeemedAbs / totalEarned) * 100 : 0;
  const avgRedemptionPoints =
    redemptionOperationsCount > 0 ? totalRedeemedAbs / redemptionOperationsCount : 0;

  // --- SEGMENTACIÓN DE CLIENTES ---
  const now = new Date().getTime();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const clientActivityMap: SegmentCustomer[] = users.map((profile) => {
    const userLedger = records.filter((r) => r.user_id === profile.id);
    let earned = 0;
    let redeemed = 0;
    let latestActivityTime: number | null = null;

    userLedger.forEach((r) => {
      if (r.amount > 0) earned += r.amount;
      if (r.amount < 0) redeemed += Math.abs(r.amount);

      const itemTime = new Date(r.created_at).getTime();
      if (latestActivityTime === null || itemTime > latestActivityTime) {
        latestActivityTime = itemTime;
      }
    });

    const regTime = new Date(profile.created_at || new Date()).getTime();
    const daysSinceRegistered = Math.floor((now - regTime) / ONE_DAY_MS);
    const daysSinceLastActivity =
      latestActivityTime !== null
        ? Math.floor((now - latestActivityTime) / ONE_DAY_MS)
        : null;

    return {
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      earned,
      redeemed,
      balance: earned - redeemed,
      lastActivityDate: latestActivityTime
        ? new Date(latestActivityTime).toISOString()
        : null,
      daysSinceLastActivity,
      daysSinceRegistered,
    };
  });

  // Clientes activos con movimientos
  const activeCustomersCount = clientActivityMap.filter((c) => c.earned > 0).length;
  const totalCustomers = clientActivityMap.length;
  const activeCustomersRate =
    totalCustomers > 0 ? (activeCustomersCount / totalCustomers) * 100 : 0;

  // Segmentos específicos
  // 1. VIPs: Clientes con >= 150 pts acumulados o que hayan hecho canjes
  const vipCustomers = [...clientActivityMap]
    .filter((c) => c.earned >= 100 || c.redeemed > 0)
    .sort((a, b) => b.earned - a.earned);

  // 2. Nuevos: Registrados en los últimos 30 días
  const newCustomers = clientActivityMap
    .filter((c) => c.daysSinceRegistered <= 30)
    .sort((a, b) => a.daysSinceRegistered - b.daysSinceRegistered);

  // 3. En Riesgo: Clientes con actividad histórica pero sin sumar en > 45 días
  const atRiskCustomers = clientActivityMap
    .filter((c) => c.earned > 0 && c.daysSinceLastActivity !== null && c.daysSinceLastActivity > 45)
    .sort((a, b) => (b.daysSinceLastActivity || 0) - (a.daysSinceLastActivity || 0));

  // 4. Inactivos / Registro puro: 0 puntos sumados
  const inactiveZeroCustomers = clientActivityMap
    .filter((c) => c.earned === 0)
    .sort((a, b) => a.daysSinceRegistered - b.daysSinceRegistered);

  // Distribución de saldos
  const range0 = clientActivityMap.filter((c) => c.balance <= 0).length;
  const range1_50 = clientActivityMap.filter((c) => c.balance > 0 && c.balance <= 50).length;
  const range51_150 = clientActivityMap.filter((c) => c.balance > 50 && c.balance <= 150).length;
  const range151plus = clientActivityMap.filter((c) => c.balance > 150).length;

  const balanceRanges = [
    {
      label: "0 pts (Sin saldo)",
      count: range0,
      percentage: totalCustomers > 0 ? (range0 / totalCustomers) * 100 : 0,
      color: "bg-gray-400",
    },
    {
      label: "1 a 50 pts",
      count: range1_50,
      percentage: totalCustomers > 0 ? (range1_50 / totalCustomers) * 100 : 0,
      color: "bg-blue-500",
    },
    {
      label: "51 a 150 pts",
      count: range51_150,
      percentage: totalCustomers > 0 ? (range51_150 / totalCustomers) * 100 : 0,
      color: "bg-indigo-500",
    },
    {
      label: "+150 pts (Alto)",
      count: range151plus,
      percentage: totalCustomers > 0 ? (range151plus / totalCustomers) * 100 : 0,
      color: "bg-amber-500",
    },
  ];

  // --- TOP PRODUCTOS MÁS CANJEADOS ---
  const productRedemptionMap = new Map<
    string,
    { id: string; name: string; pointsCost: number; totalRedemptions: number; totalPointsAbsorbed: number }
  >();

  // Inicializar productos conocidos
  products.forEach((p) => {
    productRedemptionMap.set(p.name.toLowerCase().trim(), {
      id: p.id,
      name: p.name,
      pointsCost: p.points_cost,
      totalRedemptions: 0,
      totalPointsAbsorbed: 0,
    });
  });

  // Procesar canjes en el ledger
  records
    .filter((r) => r.amount < 0)
    .forEach((r) => {
      const desc = r.description || "Canje de premio";
      let matchedName = "Canje general";
      let pointsCost = Math.abs(r.amount);

      // Buscar si el nombre coincide con algún producto
      for (const p of products) {
        if (desc.toLowerCase().includes(p.name.toLowerCase())) {
          matchedName = p.name;
          pointsCost = p.points_cost;
          break;
        }
      }

      const key = matchedName.toLowerCase().trim();
      const existing = productRedemptionMap.get(key) || {
        id: key,
        name: matchedName,
        pointsCost: pointsCost,
        totalRedemptions: 0,
        totalPointsAbsorbed: 0,
      };

      existing.totalRedemptions += 1;
      existing.totalPointsAbsorbed += Math.abs(r.amount);
      productRedemptionMap.set(key, existing);
    });

  const topProducts: TopProductItem[] = Array.from(productRedemptionMap.values())
    .filter((p) => p.totalRedemptions > 0)
    .sort((a, b) => b.totalRedemptions - a.totalRedemptions);

  // --- TOP PUNTOS DE PROMOCIÓN MÁS ACTIVOS ---
  const ppActivityMap = new Map<
    string,
    {
      id: string;
      name: string;
      type: string;
      totalPointsIssued: number;
      totalTransactions: number;
      customersSet: Set<string>;
    }
  >();

  pPoints.forEach((pp) => {
    ppActivityMap.set(pp.id, {
      id: pp.id,
      name: pp.name,
      type: pp.type || "Punto de Promoción",
      totalPointsIssued: 0,
      totalTransactions: 0,
      customersSet: new Set<string>(),
    });
  });

  records
    .filter((r) => r.amount > 0)
    .forEach((r) => {
      let storeId: string | undefined = undefined;

      if (r.qr_token) {
        storeId = qrToStoreMap.get(r.qr_token);
      }

      if (storeId && ppActivityMap.has(storeId)) {
        const item = ppActivityMap.get(storeId)!;
        item.totalPointsIssued += r.amount;
        item.totalTransactions += 1;
        if (r.user_id) item.customersSet.add(r.user_id);
      }
    });

  const topPromotionPoints: TopPromotionPointItem[] = Array.from(ppActivityMap.values())
    .map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      totalPointsIssued: item.totalPointsIssued,
      totalTransactions: item.totalTransactions,
      uniqueCustomers: item.customersSet.size,
    }))
    .sort((a, b) => b.totalPointsIssued - a.totalPointsIssued);

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              Insights & Reportes de Fidelización
            </h1>
            <p className="text-sm text-gray-500">
              Análisis avanzado de retención de clientes, rendimiento de canjes y puntos de promoción.
            </p>
          </div>
        </div>
      </div>

      {/* 1. KPIs Complementarios */}
      <InsightsKpiCards
        burnRate={burnRate}
        totalEarned={totalEarned}
        totalRedeemed={totalRedeemedAbs}
        circulatingBalance={circulatingBalance}
        avgRedemptionPoints={avgRedemptionPoints}
        activeCustomersRate={activeCustomersRate}
        totalCustomers={totalCustomers}
        activeCustomersCount={activeCustomersCount}
      />

      {/* 2. Top Canjes y Puntos de Promoción Activos */}
      <TopCanjesYPuntosPromocion
        topProducts={topProducts}
        topPromotionPoints={topPromotionPoints}
      />

      {/* 3. Segmentación y Retención de Clientes */}
      <SegmentacionClientes
        vipCustomers={vipCustomers}
        newCustomers={newCustomers}
        atRiskCustomers={atRiskCustomers}
        inactiveZeroCustomers={inactiveZeroCustomers}
        balanceRanges={balanceRanges}
      />
    </div>
  );
}
