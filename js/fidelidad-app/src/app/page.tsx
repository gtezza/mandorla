import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { QrCode, Gift, Sparkles, LogIn, LogOut, Award } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  let balance = 0;
  if (user) {
    const { data: ledger } = await supabase
      .from("points_ledger")
      .select("points_change")
      .eq("user_id", user.id);

    if (ledger) {
      balance = ledger.reduce((acc, curr) => acc + curr.points_change, 0);
    }
  }

  return (
    <div className="min-h-screen bg-[#1a0e0d] text-[#f5efe6] font-sans flex flex-col items-center justify-between p-4 sm:p-6 selection:bg-[#c6a96b] selection:text-[#1a0e0d]">
      {/* Barra superior minimalista */}
      <header className="w-full max-w-lg flex items-center justify-between py-3">
        <span className="text-xs uppercase tracking-widest text-[#c6a96b]/80 font-medium">
          Fábrica Artesanal · Desde 2021
        </span>
        {user && (
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs text-[#f5efe6]/60 hover:text-[#c6a96b] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
            </button>
          </form>
        )}
      </header>

      {/* Tarjeta Principal de Fidelidad */}
      <main className="w-full max-w-lg my-auto py-6">
        <div className="bg-[#2a1a18] border border-[#c6a96b]/30 rounded-3xl p-8 sm:p-10 shadow-2xl text-center relative overflow-hidden backdrop-blur-sm">
          {/* Luz decorativa de fondo */}
          <div className="absolute -top-16 -left-16 w-44 h-44 bg-[#c6a96b]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-[#6b3d3a]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Título de Marca con Tipografía de Mandorla */}
          <div className="mb-8">
            <span className="text-xs uppercase tracking-[0.25em] text-[#c6a96b] font-semibold block mb-2">
              Club de Beneficios
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold font-serif text-[#c6a96b] tracking-wide mb-3">
              MANDORLA
            </h1>
            <p className="text-sm text-[#f5efe6]/75 max-w-xs mx-auto leading-relaxed">
              Alfajores que saben a tradición. Suma puntos con cada compra y disfruta recompensas exclusivas.
            </p>
          </div>

          {/* Saldo si está logueado */}
          {user && (
            <div className="mb-8 p-4 bg-[#3a2220] border border-[#c6a96b]/20 rounded-2xl">
              <span className="text-xs text-[#c6a96b] uppercase tracking-wider font-semibold block mb-1">
                Tu Saldo Acumulado
              </span>
              <p className="text-3xl font-extrabold text-[#f5efe6] font-serif">
                {balance} <span className="text-lg font-sans font-medium text-[#c6a96b]">puntos</span>
              </p>
            </div>
          )}

          {/* Botonera Principal de Acciones */}
          <div className="space-y-3.5">
            {/* Botón Principal: Escanear QR */}
            <Link
              href="/simulador"
              className="group flex items-center justify-center gap-3 w-full bg-[#c6a96b] hover:bg-[#d8bd80] text-[#1a0e0d] font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-[#c6a96b]/20 active:scale-[0.99] text-base"
            >
              <QrCode className="w-5 h-5 text-[#1a0e0d] group-hover:scale-110 transition-transform" />
              <span>Escanear QR</span>
            </Link>

            {/* Botón Secundario: Ver Canjes */}
            <Link
              href="/canjes"
              className="group flex items-center justify-center gap-3 w-full bg-[#3a2220] hover:bg-[#4a2c2a] text-[#f5efe6] border border-[#c6a96b]/40 font-semibold py-4 px-6 rounded-2xl transition-all shadow-md active:scale-[0.99] text-base"
            >
              <Gift className="w-5 h-5 text-[#c6a96b] group-hover:scale-110 transition-transform" />
              <span>Ver Canjes</span>
            </Link>

            {/* Botón Terciario si no está logueado */}
            {!user && (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full text-xs text-[#f5efe6]/70 hover:text-[#c6a96b] py-2.5 transition-colors font-medium mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>¿Ya tienes cuenta? Iniciar Sesión</span>
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Pie de página con estilo artesanal */}
      <footer className="w-full max-w-lg text-center py-4 text-xs text-[#f5efe6]/40 border-t border-[#c6a96b]/10">
        <p>Mandorla — Alfajores Artesanales</p>
      </footer>
    </div>
  );
}
