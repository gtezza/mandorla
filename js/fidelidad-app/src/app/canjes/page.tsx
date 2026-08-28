import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Gift, ArrowLeft, Award, Sparkles, History, Tag, DollarSign, Calendar } from "lucide-react";

export default async function CanjesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  let totalPoints = 0;
  let redeemedPoints = 0;
  let currentBalance = 0;
  let redeemHistory: Array<{
    id: string;
    points_change: number;
    description: string;
    created_at: string;
  }> = [];

  if (user) {
    const { data: ledger } = await supabase
      .from("points_ledger")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (ledger) {
      ledger.forEach((tx) => {
        if (tx.points_change > 0) {
          totalPoints += tx.points_change;
        } else {
          redeemedPoints += Math.abs(tx.points_change);
        }
      });
      currentBalance = totalPoints - redeemedPoints;
      redeemHistory = ledger.filter((tx) => tx.points_change < 0 || tx.transaction_type === "redeem");
    }
  }

  // Consultar productos de canje activos desde Supabase
  const { data: dbProducts } = await supabase
    .from("redemption_products")
    .select("*")
    .eq("is_active", true)
    .order("points_required", { ascending: true });

  // Lista de premios (DB real o fallback inicial)
  const premios = dbProducts && dbProducts.length > 0
    ? dbProducts.map((p) => {
        const isExpired = p.expires_at && new Date(p.expires_at) < new Date();
        return {
          id: p.id,
          sku: p.sku,
          titulo: p.title,
          descripcion: p.description || "Elaborado artesanalmente con recetas tradicionales.",
          puntos: p.points_required,
          dinero_adicional: Number(p.additional_money) || 0,
          foto_url: p.image_url,
          fecha_caducidad: p.expires_at,
          disponible: currentBalance >= p.points_required && !isExpired,
          isExpired,
        };
      })
    : [
        {
          id: "1",
          sku: "ALF-01",
          titulo: "1 Alfajor Artesanal",
          descripcion: "Elige entre chocolate negro, blanco o dulce de leche clásico.",
          puntos: 10,
          dinero_adicional: 0,
          foto_url: null,
          fecha_caducidad: null,
          disponible: currentBalance >= 10,
          isExpired: false,
        },
        {
          id: "2",
          sku: "BOX-06",
          titulo: "Caja x 6 Alfajores",
          descripcion: "Variedad surtida con nuestra receta tradicional desde 2021.",
          puntos: 50,
          dinero_adicional: 0,
          foto_url: null,
          fecha_caducidad: null,
          disponible: currentBalance >= 50,
          isExpired: false,
        },
        {
          id: "3",
          sku: "BOX-12",
          titulo: "Caja Premium x 12",
          descripcion: "Edición especial para compartir el auténtico sabor artesanal.",
          puntos: 40,
          dinero_adicional: 2000,
          foto_url: null,
          fecha_caducidad: null,
          disponible: currentBalance >= 40,
          isExpired: false,
        },
      ];

  return (
    <div className="min-h-screen bg-[#1a0e0d] text-[#f5efe6] font-sans flex flex-col items-center justify-between p-4 sm:p-6 selection:bg-[#c6a96b] selection:text-[#1a0e0d]">
      {/* Encabezado */}
      <header className="w-full max-w-xl flex items-center justify-between py-4 border-b border-[#c6a96b]/20">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#c6a96b] hover:text-[#f5efe6] transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </Link>
        <span className="font-serif tracking-widest text-lg font-bold text-[#c6a96b]">MANDORLA</span>
      </header>

      {/* Contenido Principal */}
      <main className="w-full max-w-xl my-8 space-y-6">
        {/* Banner de Saldo de Puntos */}
        <div className="bg-[#2a1a18] border border-[#c6a96b]/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-[#c6a96b]/10 rounded-full blur-2xl pointer-events-none" />

          {user ? (
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c6a96b]/15 text-[#c6a96b] text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Tus Puntos Disponibles
              </span>
              <h2 className="text-5xl sm:text-6xl font-extrabold text-[#c6a96b] font-serif my-2 tracking-tight">
                {currentBalance} <span className="text-xl sm:text-2xl font-sans font-medium text-[#f5efe6]/70">pts</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#f5efe6]/60 mt-1">
                Acumulados: <strong className="text-[#f5efe6]">{totalPoints}</strong> | Canjeados:{" "}
                <strong className="text-[#f5efe6]">{redeemedPoints}</strong>
              </p>
            </div>
          ) : (
            <div>
              <Gift className="w-12 h-12 text-[#c6a96b] mx-auto mb-3" />
              <h2 className="text-2xl font-bold font-serif text-[#f5efe6] mb-2">Catálogo de Premios y Canjes</h2>
              <p className="text-sm text-[#f5efe6]/70 mb-4">
                Inicia sesión para consultar tus puntos y canjear tus alfajores en sucursal.
              </p>
              <Link
                href="/login?return_to=/canjes"
                className="inline-block bg-[#c6a96b] hover:bg-[#d8bd80] text-[#1a0e0d] font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 text-sm"
              >
                Identificarme para Canjear
              </Link>
            </div>
          )}
        </div>

        {/* Listado de Premios Disponibles */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-serif font-bold text-[#c6a96b] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#c6a96b]" /> Catálogo de Recompensas
            </h3>
            <span className="text-xs text-[#f5efe6]/50">Canje directo en sucursales</span>
          </div>

          <div className="grid gap-3.5 sm:gap-4">
            {premios.map((premio) => (
              <div
                key={premio.id}
                className="bg-[#2a1a18]/90 border border-[#c6a96b]/25 hover:border-[#c6a96b]/50 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-md"
              >
                <div className="flex items-start gap-4">
                  {/* Imagen del Producto */}
                  <div className="w-16 h-16 rounded-xl bg-[#3a2220] border border-[#c6a96b]/30 flex items-center justify-center overflow-hidden shrink-0">
                    {premio.foto_url ? (
                      <img
                        src={premio.foto_url}
                        alt={premio.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Gift className="w-7 h-7 text-[#c6a96b]" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {premio.sku && (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#c6a96b] bg-[#3a2220] px-1.5 py-0.5 rounded border border-[#c6a96b]/20">
                          <Tag className="w-2.5 h-2.5" />
                          {premio.sku}
                        </span>
                      )}
                      {premio.fecha_caducidad && (
                        <span className="text-[10px] text-[#f5efe6]/50 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          Hasta {new Date(premio.fecha_caducidad).toLocaleDateString("es-AR")}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-[#f5efe6] text-base">{premio.titulo}</h4>
                    <p className="text-xs text-[#f5efe6]/65 mt-0.5 leading-relaxed">{premio.descripcion}</p>
                  </div>
                </div>

                {/* Badge de Puntos + Dinero */}
                <div className="w-full sm:w-auto text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-[#c6a96b]/15 shrink-0 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                  <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                    <span className="inline-block px-3 py-1 rounded-lg bg-[#3a2220] border border-[#c6a96b]/40 text-[#c6a96b] font-extrabold text-sm sm:text-base">
                      {premio.puntos} pts
                    </span>
                    {premio.dinero_adicional > 0 && (
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-[#4a2c2a] border border-amber-500/30 text-amber-300 font-bold text-xs sm:text-sm">
                        + ${premio.dinero_adicional.toLocaleString("es-AR")}
                      </span>
                    )}
                  </div>

                  {user && (
                    <p className="text-[10px] mt-1.5 font-medium text-[#c6a96b]">
                      {premio.disponible
                        ? "✓ Puntos acumulados suficientes"
                        : `Faltan ${Math.max(0, premio.puntos - currentBalance)} pts`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Historial de Canjes */}
        {user && redeemHistory.length > 0 && (
          <section className="space-y-3 pt-4 border-t border-[#c6a96b]/20">
            <h3 className="text-sm font-semibold text-[#f5efe6]/70 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-[#c6a96b]" /> Historial de tus Canjes
            </h3>
            <div className="space-y-2">
              {redeemHistory.map((h) => (
                <div
                  key={h.id}
                  className="bg-[#2a1a18]/60 border border-[#c6a96b]/10 rounded-xl p-3.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-medium text-[#f5efe6]">{h.description || "Canje de premio en sucursal"}</p>
                    <p className="text-[#f5efe6]/40">{new Date(h.created_at).toLocaleDateString("es-AR")}</p>
                  </div>
                  <span className="font-bold text-red-400 font-mono">
                    {h.points_change} pts
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Pie de página */}
      <footer className="w-full max-w-xl text-center py-4 text-xs text-[#f5efe6]/40 border-t border-[#c6a96b]/10">
        <p>Mandorla — Fábrica Artesanal de Alfajores</p>
      </footer>
    </div>
  );
}
