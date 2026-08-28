import QRCode from "react-qr-code";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function SimuladorPage() {
  // UUID que representa el código QR impreso en tienda o sucursal
  const STATIC_QR_TOKEN = "d2fe9131-1c25-4b64-9d65-d06ebed1d7d7";
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const claimUrl = `${SITE_URL}/reclamar?token=${STATIC_QR_TOKEN}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-[#1a0e0d] text-[#f5efe6] font-sans p-4 sm:p-6 selection:bg-[#c6a96b] selection:text-[#1a0e0d]">
      {/* Encabezado */}
      <header className="w-full max-w-md flex items-center justify-between py-3 border-b border-[#c6a96b]/20">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#c6a96b] hover:text-[#f5efe6] transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <span className="font-serif tracking-widest text-base font-bold text-[#c6a96b]">MANDORLA</span>
      </header>

      {/* Tarjeta de Exhibición QR */}
      <main className="w-full max-w-md my-auto py-6">
        <div className="bg-[#2a1a18] p-8 sm:p-10 rounded-3xl shadow-2xl border border-[#c6a96b]/30 flex flex-col items-center text-center relative overflow-hidden">
          {/* Brillos decorativos */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#c6a96b]/10 rounded-full blur-2xl pointer-events-none" />

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c6a96b]/15 text-[#c6a96b] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Punto de Promoción
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#c6a96b] mb-2">
            Escanea y Suma Puntos
          </h1>
          <p className="text-xs sm:text-sm text-[#f5efe6]/70 mb-8 max-w-xs leading-relaxed">
            Apunta la cámara de tu celular hacia el código QR para acumular tus beneficios de Mandorla.
          </p>

          {/* Código QR enmarcado */}
          <div className="p-5 bg-white border-2 border-[#c6a96b] rounded-2xl shadow-xl">
            <QRCode
              value={claimUrl}
              size={220}
              level="H"
              fgColor="#1a0e0d"
              bgColor="#ffffff"
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-[#c6a96b] font-medium tracking-wide">
              ¡Disfruta tus alfajores favoritos!
            </p>
          </div>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="w-full max-w-md text-center py-4 text-xs text-[#f5efe6]/40 border-t border-[#c6a96b]/10">
        <p>Mandorla — Fábrica Artesanal</p>
      </footer>
    </div>
  );
}
