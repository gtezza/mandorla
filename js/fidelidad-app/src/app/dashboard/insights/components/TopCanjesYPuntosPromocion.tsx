import { Gift, Store, TrendingUp } from "lucide-react";

export interface TopProductItem {
  id: string;
  name: string;
  pointsCost: number;
  totalRedemptions: number;
  totalPointsAbsorbed: number;
}

export interface TopPromotionPointItem {
  id: string;
  name: string;
  type: string;
  totalPointsIssued: number;
  totalTransactions: number;
  uniqueCustomers: number;
}

interface TopCanjesYPuntosPromocionProps {
  topProducts: TopProductItem[];
  topPromotionPoints: TopPromotionPointItem[];
}

export default function TopCanjesYPuntosPromocion({
  topProducts,
  topPromotionPoints,
}: TopCanjesYPuntosPromocionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Top Productos Más Canjeados */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Gift className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              🎁 Top Productos Más Canjeados
            </h3>
          </div>
          <p className="text-xs text-gray-500 mb-5">
            Premios del catálogo ordenados por preferencia de los clientes.
          </p>

          {topProducts.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 bg-gray-50 rounded-xl">
              Aún no se han registrado canjes de productos.
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="p-3.5 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-3 hover:bg-white hover:shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">
                        Valor: <span className="font-semibold text-gray-700">{p.pointsCost} pts</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-black text-blue-600">
                      {p.totalRedemptions} {p.totalRedemptions === 1 ? "canje" : "canjes"}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {p.totalPointsAbsorbed.toLocaleString()} pts redimidos
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Puntos de Promoción Más Activos */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              🏪 Puntos de Promoción Más Activos
            </h3>
          </div>
          <p className="text-xs text-gray-500 mb-5">
            Sucursales, cajas y eventos con mayor tracción y emisión de puntos.
          </p>

          {topPromotionPoints.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 bg-gray-50 rounded-xl">
              Aún no hay actividad registrada en los puntos de promoción.
            </div>
          ) : (
            <div className="space-y-3">
              {topPromotionPoints.map((pp, idx) => (
                <div
                  key={pp.id || idx}
                  className="p-3.5 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-3 hover:bg-white hover:shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{pp.name}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {pp.type || "Punto de Promoción"} • {pp.uniqueCustomers} {pp.uniqueCustomers === 1 ? "cliente" : "clientes"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-black text-emerald-600">
                      +{pp.totalPointsIssued.toLocaleString()} pts
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {pp.totalTransactions} {pp.totalTransactions === 1 ? "emisión" : "emisiones"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
