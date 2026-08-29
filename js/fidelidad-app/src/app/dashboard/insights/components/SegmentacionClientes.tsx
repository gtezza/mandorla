"use client";

import { useState } from "react";
import { Award, UserPlus, AlertTriangle, UserX, ChevronRight, CheckCircle2 } from "lucide-react";

export interface SegmentCustomer {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  earned: number;
  redeemed: number;
  balance: number;
  lastActivityDate: string | null;
  daysSinceLastActivity: number | null;
  daysSinceRegistered: number;
}

interface SegmentacionClientesProps {
  vipCustomers: SegmentCustomer[];
  newCustomers: SegmentCustomer[];
  atRiskCustomers: SegmentCustomer[];
  inactiveZeroCustomers: SegmentCustomer[];
  balanceRanges: {
    label: string;
    count: number;
    percentage: number;
    color: string;
  }[];
}

export default function SegmentacionClientes({
  vipCustomers,
  newCustomers,
  atRiskCustomers,
  inactiveZeroCustomers,
  balanceRanges,
}: SegmentacionClientesProps) {
  const [selectedSegment, setSelectedSegment] = useState<"vip" | "new" | "risk" | "zero">("vip");

  const segments = [
    {
      id: "vip" as const,
      title: "Super Fans (VIPs)",
      subtitle: "Top clientes con mayor actividad y puntos",
      count: vipCustomers.length,
      icon: Award,
      color: "amber",
      bgBadge: "bg-amber-100 text-amber-800",
      borderActive: "border-amber-500 ring-2 ring-amber-200",
      data: vipCustomers,
    },
    {
      id: "new" as const,
      title: "Nuevos (Últimos 30 días)",
      subtitle: "Registrados recientemente",
      count: newCustomers.length,
      icon: UserPlus,
      color: "emerald",
      bgBadge: "bg-emerald-100 text-emerald-800",
      borderActive: "border-emerald-500 ring-2 ring-emerald-200",
      data: newCustomers,
    },
    {
      id: "risk" as const,
      title: "En Riesgo (>45 días sin sumar)",
      subtitle: "Clientes antes activos que no regresaron",
      count: atRiskCustomers.length,
      icon: AlertTriangle,
      color: "rose",
      bgBadge: "bg-rose-100 text-rose-800",
      borderActive: "border-rose-500 ring-2 ring-rose-200",
      data: atRiskCustomers,
    },
    {
      id: "zero" as const,
      title: "Sin Actividad (0 puntos)",
      subtitle: "Registrados pero nunca sumaron puntos",
      count: inactiveZeroCustomers.length,
      icon: UserX,
      color: "gray",
      bgBadge: "bg-gray-100 text-gray-800",
      borderActive: "border-gray-500 ring-2 ring-gray-200",
      data: inactiveZeroCustomers,
    },
  ];

  const currentSegment = segments.find((s) => s.id === selectedSegment)!;

  return (
    <div className="space-y-6">
      {/* Distribución de Saldos de Clientes */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-1">
          📊 Distribución de Clientes por Rango de Saldo
        </h3>
        <p className="text-xs text-gray-500 mb-5">
          Muestra cuántos clientes acumulan puntos actualmente y en qué rangos se ubican.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {balanceRanges.map((range, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
              <span className="text-xs font-semibold text-gray-600">{range.label}</span>
              <div className="mt-2">
                <span className="text-2xl font-black text-gray-900">{range.count}</span>
                <span className="text-xs text-gray-500 ml-1.5 font-medium">({range.percentage.toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full ${range.color}`}
                  style={{ width: `${Math.max(range.percentage, 4)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Segmentación RFM y Comportamiento */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="mb-5">
          <h3 className="text-base font-bold text-gray-900">
            👥 Segmentación y Retención de Clientes
          </h3>
          <p className="text-xs text-gray-500">
            Selecciona un segmento para ver el detalle de los clientes que lo componen.
          </p>
        </div>

        {/* Tarjetas de Selección de Segmento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {segments.map((seg) => {
            const Icon = seg.icon;
            const isSelected = selectedSegment === seg.id;
            return (
              <button
                key={seg.id}
                onClick={() => setSelectedSegment(seg.id)}
                type="button"
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? `${seg.borderActive} bg-white shadow-sm`
                    : "border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${seg.bgBadge}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">{seg.count}</span>
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-gray-900">{seg.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{seg.subtitle}</p>
                </div>
                {isSelected && (
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Seleccionado</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Tabla / Lista de Clientes del Segmento Seleccionado */}
        <div className="mt-6 border border-gray-100 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Listado de {currentSegment.title} ({currentSegment.count})
            </span>
          </div>

          {currentSegment.data.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No hay clientes en este segmento actualmente.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {currentSegment.data.map((c) => (
                <div
                  key={c.id}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {c.full_name || "Sin nombre registrado"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {c.email || c.phone || "Sin contacto"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="text-gray-500 block">Saldo Actual</span>
                      <span className="font-bold text-blue-600">{c.balance} pts</span>
                    </div>

                    <div className="text-right">
                      <span className="text-gray-500 block">Total Sumado</span>
                      <span className="font-semibold text-emerald-600">+{c.earned}</span>
                    </div>

                    {c.daysSinceLastActivity !== null ? (
                      <div className="text-right hidden sm:block">
                        <span className="text-gray-500 block">Última Actividad</span>
                        <span className="font-medium text-gray-700">
                          {c.daysSinceLastActivity === 0
                            ? "Hoy"
                            : `Hace ${c.daysSinceLastActivity} d`}
                        </span>
                      </div>
                    ) : (
                      <div className="text-right hidden sm:block">
                        <span className="text-gray-500 block">Registrado</span>
                        <span className="font-medium text-gray-700">
                          {c.daysSinceRegistered === 0
                            ? "Hoy"
                            : `Hace ${c.daysSinceRegistered} d`}
                        </span>
                      </div>
                    )}
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
