import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ArrowLeft, Sparkles, History } from "lucide-react";
import CanjesCalculatorGrid, { CanjeProductItem } from "./CanjesCalculatorGrid";

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

  // Consultar categorías (niveles)
  const { data: categories } = await supabase
    .from("reward_categories")
    .select("*")
    .order("min_points", { ascending: true });

  // Calcular si está muy cerca (a un 30% o menos) de llegar al próximo nivel
  let nextLevelName: string | null = null;
  if (user && categories && categories.length > 0) {
    const nextLevel = categories.find((c) => currentBalance < c.min_points);
    if (nextLevel) {
      // Falta un 30% o menos para alcanzar los puntos del nivel
      const pointsNeeded = nextLevel.min_points - currentBalance;
      const thirtyPercentOfTarget = nextLevel.min_points * 0.3;
      if (pointsNeeded <= thirtyPercentOfTarget) {
        nextLevelName = nextLevel.name;
      }
    }
  }

  // Formatear items para el componente interactivo
  const productsList: CanjeProductItem[] =
    dbProducts && dbProducts.length > 0
      ? dbProducts.map((p) => {
          const isExpired = p.expires_at ? new Date(p.expires_at) < new Date() : false;
          return {
            id: p.id,
            sku: p.sku,
            titulo: p.title,
            descripcion: p.description || "Elaborado artesanalmente con recetas tradicionales.",
            puntos: p.points_required,
            dinero_adicional: Number(p.additional_money) || 0,
            foto_url: p.image_url,
            fecha_caducidad: p.expires_at,
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
            foto_url: "/img/caja alfajores.jpeg",
            fecha_caducidad: null,
            isExpired: false,
          },
          {
            id: "2",
            sku: "BOX-06",
            titulo: "Caja x 6 Alfajores",
            descripcion: "Variedad surtida con nuestra receta tradicional desde 2021.",
            puntos: 50,
            dinero_adicional: 0,
            foto_url: "/img/caja alfajores.jpeg",
            fecha_caducidad: null,
            isExpired: false,
          },
          {
            id: "3",
            sku: "BOX-12",
            titulo: "Caja Premium x 12",
            descripcion: "Edición especial para compartir el auténtico sabor artesanal.",
            puntos: 40,
            dinero_adicional: 2000,
            foto_url: "/img/Chocolate Blanco.jpeg",
            fecha_caducidad: null,
            isExpired: false,
          },
        ];

  return (
    <div className="min-h-screen bg-[#1a0e0d] text-[#f5efe6] font-sans flex flex-col items-center justify-between p-4 sm:p-6 selection:bg-[#c6a96b] selection:text-[#1a0e0d]">
      {/* Encabezado */}
      <header className="w-full max-w-4xl flex items-center justify-between py-4 border-b border-[#c6a96b]/20">
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
      <main className="w-full max-w-4xl my-8 space-y-8">
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
              {nextLevelName && (
                <div className="mt-4 inline-block bg-[#c6a96b]/20 border border-[#c6a96b]/40 text-[#c6a96b] px-4 py-2 rounded-xl text-sm font-semibold animate-pulse shadow-lg">
                  🎉 ¡Estás muy cerca de llegar al nivel {nextLevelName}!
                </div>
              )}
            </div>
          ) : (
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c6a96b]/15 text-[#c6a96b] text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Club de Beneficios Mandorla
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#f5efe6] mb-2">
                Simulador de Canjes y Recompensas
              </h2>
              <p className="text-xs sm:text-sm text-[#f5efe6]/70 max-w-md mx-auto mb-4">
                Selecciona cualquier producto para simular el canje y calcular tus puntos restantes y costo en caja.
              </p>
              <Link
                href="/login?return_to=/canjes"
                className="inline-block bg-[#c6a96b] hover:bg-[#d8bd80] text-[#1a0e0d] font-bold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-95 text-xs sm:text-sm"
              >
                Identificarme con mi Cuenta
              </Link>
            </div>
          )}
        </div>

        {/* Grilla y Calculadora Interactiva */}
        <CanjesCalculatorGrid
          products={productsList}
          currentBalance={currentBalance}
          isLoggedIn={!!user}
        />

        {/* Historial de Canjes (si tiene) */}
        {user && redeemHistory.length > 0 && (
          <section className="space-y-3 pt-6 border-t border-[#c6a96b]/20">
            <h3 className="text-sm font-semibold text-[#f5efe6]/70 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-[#c6a96b]" /> Historial de tus Canjes en Sucursal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {redeemHistory.map((h) => (
                <div
                  key={h.id}
                  className="bg-[#2a1a18]/70 border border-[#c6a96b]/15 rounded-xl p-4 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-medium text-[#f5efe6] text-sm">{h.description || "Canje de premio en sucursal"}</p>
                    <p className="text-[#f5efe6]/40 text-[11px] mt-0.5">{new Date(h.created_at).toLocaleDateString("es-AR")}</p>
                  </div>
                  <span className="font-bold text-red-400 font-mono text-sm">
                    {h.points_change} pts
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Pie de página */}
      <footer className="w-full max-w-4xl text-center py-4 text-xs text-[#f5efe6]/40 border-t border-[#c6a96b]/10">
        <p>Mandorla — Fábrica Artesanal de Alfajores</p>
      </footer>
    </div>
  );
}
