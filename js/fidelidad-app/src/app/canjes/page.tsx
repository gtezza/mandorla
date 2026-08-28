import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Gift, ArrowLeft, Award, Sparkles, CheckCircle2, History } from "lucide-react";

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

  // Catálogo de premios de Mandorla
  const premios = [
    {
      id: 1,
      titulo: "1 Alfajor Artesanal",
      descripcion: "Elige entre chocolate negro, blanco o dulce de leche clásico.",
      puntos: 10,
      icono: "🍪",
      disponible: currentBalance >= 10,
    },
    {
      id: 2,
      titulo: "Caja x 6 Alfajores",
      descripcion: "Variedad surtida con nuestra receta tradicional desde 2021.",
      puntos: 50,
      icono: "🎁",
      disponible: currentBalance >= 50,
    },
    {
      id: 3,
      titulo: "Caja Premium x 12",
      descripcion: "Edición especial para compartir el auténtico sabor artesanal.",
      puntos: 90,
      icono: "⭐",
      disponible: currentBalance >= 90,
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
              <Award className="w-5 h-5 text-[#c6a96b]" /> Premios Disponibles
            </h3>
            <span className="text-xs text-[#f5efe6]/50">Canje directo en mostrador</span>
          </div>

          <div className="grid gap-3 sm:gap-4">
            {premios.map((premio) => (
              <div
                key={premio.id}
                className="bg-[#2a1a18]/90 border border-[#c6a96b]/20 hover:border-[#c6a96b]/50 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#3a2220] flex items-center justify-center text-2xl border border-[#c6a96b]/20 shrink-0">
                    {premio.icono}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#f5efe6] text-base">{premio.titulo}</h4>
                    <p className="text-xs text-[#f5efe6]/60 line-clamp-1 sm:line-clamp-none">{premio.descripcion}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-3 py-1 rounded-lg bg-[#3a2220] border border-[#c6a96b]/30 text-[#c6a96b] font-extrabold text-sm sm:text-base">
                    {premio.puntos} pts
                  </span>
                  {user && (
                    <p className="text-[10px] mt-1 font-medium text-[#c6a96b]">
                      {premio.disponible ? "¡Alcanzaste los puntos!" : `Faltan ${premio.puntos - currentBalance} pts`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Historial de Canjes (si tiene) */}
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
