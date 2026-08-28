"use client";

import { useState } from "react";
import {
  Gift,
  Award,
  Sparkles,
  Calculator,
  Calendar,
  Tag,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export interface CanjeProductItem {
  id: string;
  sku: string | null;
  titulo: string;
  descripcion: string;
  puntos: number;
  dinero_adicional: number;
  foto_url: string | null;
  fecha_caducidad: string | null;
  isExpired: boolean;
}

export default function CanjesCalculatorGrid({
  products,
  currentBalance,
  isLoggedIn,
}: {
  products: CanjeProductItem[];
  currentBalance: number;
  isLoggedIn: boolean;
}) {
  // Producto seleccionado para la simulación / cálculo
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    products.length > 0 ? products[0].id : null
  );

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const pointsRequired = selectedProduct ? selectedProduct.puntos : 0;
  const additionalMoney = selectedProduct ? selectedProduct.dinero_adicional : 0;
  const remainingPoints = currentBalance - pointsRequired;
  const hasEnoughPoints = currentBalance >= pointsRequired;
  const pointsMissing = Math.max(0, pointsRequired - currentBalance);

  return (
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. CALCULADORA DE CANJE (Panel Resumen Interactivo)
      ───────────────────────────────────────────────────────────── */}
      {selectedProduct && (
        <section className="bg-[#2a1a18] border-2 border-[#c6a96b]/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          {/* Fondo brillante decorativo */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#c6a96b]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-[#c6a96b]/20 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#3a2220] border border-[#c6a96b]/30">
                <Calculator className="w-5 h-5 text-[#c6a96b]" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#c6a96b] uppercase tracking-wider block">
                  Simulador de Canje
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-[#f5efe6]">
                  {selectedProduct.titulo}
                </h3>
              </div>
            </div>

            {selectedProduct.sku && (
              <span className="font-mono text-xs font-bold text-[#c6a96b] bg-[#3a2220] px-2.5 py-1 rounded-lg border border-[#c6a96b]/30">
                SKU: {selectedProduct.sku}
              </span>
            )}
          </div>

          {/* Métricas del Cálculo: Puntos Requeridos | Saldo Restante | Dinero a Pagar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Puntos a utilizar */}
            <div className="bg-[#3a2220]/90 border border-[#c6a96b]/20 rounded-2xl p-4 text-center">
              <span className="text-xs text-[#f5efe6]/60 block mb-1">Puntos requeridos</span>
              <p className="text-2xl sm:text-3xl font-extrabold font-serif text-[#c6a96b]">
                {pointsRequired} <span className="text-xs font-sans text-[#f5efe6]/70">pts</span>
              </p>
            </div>

            {/* Puntos que le quedan */}
            <div className="bg-[#3a2220]/90 border border-[#c6a96b]/20 rounded-2xl p-4 text-center">
              <span className="text-xs text-[#f5efe6]/60 block mb-1">
                {isLoggedIn ? "Puntos que te quedarán" : "Saldo simulado"}
              </span>
              {isLoggedIn ? (
                <p
                  className={`text-2xl sm:text-3xl font-extrabold font-serif ${
                    hasEnoughPoints ? "text-green-400" : "text-amber-400"
                  }`}
                >
                  {hasEnoughPoints ? remainingPoints : currentBalance}{" "}
                  <span className="text-xs font-sans text-[#f5efe6]/70">pts</span>
                </p>
              ) : (
                <p className="text-sm font-medium text-[#f5efe6]/50 mt-2">Inicia sesión</p>
              )}
            </div>

            {/* Dinero a pagar */}
            <div className="bg-[#3a2220]/90 border border-[#c6a96b]/20 rounded-2xl p-4 text-center">
              <span className="text-xs text-[#f5efe6]/60 block mb-1">Dinero a pagar en caja</span>
              <p className="text-2xl sm:text-3xl font-extrabold font-serif text-amber-300">
                ${additionalMoney.toLocaleString("es-AR")}
              </p>
            </div>
          </div>

          {/* Veredicto / Estado de Viabilidad */}
          <div className="bg-[#1a0e0d]/70 rounded-2xl p-4 border border-[#c6a96b]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {isLoggedIn ? (
              hasEnoughPoints ? (
                <div className="flex items-center gap-2.5 text-green-400 text-xs sm:text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>
                    ¡Excelente! Tienes puntos suficientes. Te quedarán{" "}
                    <strong className="text-white underline">{remainingPoints} pts</strong> y abonarás{" "}
                    <strong className="text-amber-300">${additionalMoney.toLocaleString("es-AR")}</strong> en
                    mostrador.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-amber-400 text-xs sm:text-sm font-semibold">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>
                    Te faltan <strong className="text-white underline">{pointsMissing} pts</strong> para poder
                    canjear este producto.
                  </span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-2 text-[#f5efe6]/80 text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-[#c6a96b]" />
                <span>Inicia sesión para calcular el descuento exacto sobre tus puntos reales.</span>
              </div>
            )}

            {!isLoggedIn && (
              <Link
                href="/login?return_to=/canjes"
                className="bg-[#c6a96b] hover:bg-[#d8bd80] text-[#1a0e0d] text-xs font-bold py-2 px-4 rounded-xl transition-all shadow shrink-0"
              >
                Ingresar para Canjear
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. GRILLA DE PRODUCTOS DISPONIBLES
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#c6a96b] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#c6a96b]" /> Catálogo de Productos para Canjear
            </h3>
            <p className="text-xs text-[#f5efe6]/60 mt-0.5">
              Toca cualquier producto de la grilla para calcular cuántos puntos te quedan y cuánto abonar en caja.
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-[#2a1a18] p-8 rounded-2xl text-center text-sm text-[#f5efe6]/50 border border-[#c6a96b]/20">
            No hay productos disponibles para canjear en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => {
              const isSelected = selectedProductId === p.id;
              const reachesPoints = currentBalance >= p.puntos;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`bg-[#2a1a18] rounded-2xl p-5 border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden group ${
                    isSelected
                      ? "border-[#c6a96b] ring-2 ring-[#c6a96b]/50 shadow-xl bg-[#321e1c]"
                      : "border-[#c6a96b]/20 hover:border-[#c6a96b]/50 hover:bg-[#2e1c1a]"
                  }`}
                >
                  {/* Foto y Datos de Producto */}
                  <div>
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-20 h-20 rounded-xl bg-[#3a2220] border border-[#c6a96b]/30 flex items-center justify-center overflow-hidden shrink-0 shadow">
                        {p.foto_url ? (
                          <img
                            src={p.foto_url}
                            alt={p.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <Gift className="w-8 h-8 text-[#c6a96b]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          {p.sku && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#c6a96b] bg-[#3a2220] px-1.5 py-0.5 rounded border border-[#c6a96b]/20">
                              <Tag className="w-2.5 h-2.5" />
                              {p.sku}
                            </span>
                          )}
                          {p.fecha_caducidad && (
                            <span className="text-[10px] text-[#f5efe6]/50 flex items-center gap-0.5">
                              <Calendar className="w-2.5 h-2.5" />
                              Hasta {new Date(p.fecha_caducidad).toLocaleDateString("es-AR")}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-[#f5efe6] text-base leading-snug">{p.titulo}</h4>
                        <p className="text-xs text-[#f5efe6]/60 line-clamp-2 mt-1">{p.descripcion}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pie de tarjeta con costo mixto y botón de selección */}
                  <div className="pt-3 border-t border-[#c6a96b]/15 flex items-center justify-between mt-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-[#3a2220] border border-[#c6a96b]/40 text-[#c6a96b] font-extrabold text-xs sm:text-sm">
                        {p.puntos} pts
                      </span>
                      {p.dinero_adicional > 0 && (
                        <span className="px-2 py-1 rounded-lg bg-[#4a2c2a] border border-amber-500/30 text-amber-300 font-bold text-xs">
                          + ${p.dinero_adicional.toLocaleString("es-AR")}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                        isSelected
                          ? "bg-[#c6a96b] text-[#1a0e0d] shadow"
                          : "bg-[#3a2220] text-[#f5efe6] hover:bg-[#4a2c2a]"
                      }`}
                    >
                      <span>{isSelected ? "Calculando" : "Seleccionar"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
