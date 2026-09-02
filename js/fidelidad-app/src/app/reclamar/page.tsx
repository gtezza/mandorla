import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { Sparkles, Gift, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react";

export default async function ReclamarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token || typeof token !== "string") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0e0d] text-[#f5efe6] p-6">
        <div className="bg-[#2a1a18] p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-red-500/30">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-serif text-red-400 mb-2">Código QR Inválido</h1>
          <p className="text-sm text-[#f5efe6]/70 mb-6">No se detectó un código válido en tu escaneo.</p>
          <Link
            href="/"
            className="inline-block bg-[#3a2220] hover:bg-[#4a2c2a] text-[#f5efe6] text-xs font-semibold py-2.5 px-6 rounded-xl border border-[#c6a96b]/30 transition-all"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  // 1. Validar Identidad (Auth Gate)
  const supabase = await createClient();
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get("user-agent") || "Desconocido";

  // Registro Anónimo de Escaneo
  supabase.from("qr_scan_logs").insert([{ qr_token: token, user_agent: userAgent }]).then();

  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect(`/login?return_to=/reclamar?token=${token}`);
  }

  // 1.5. Perfilado Progresivo: Asegurar perfil base si aún no existe
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", authData.user.id)
    .single();

  if (!profile) {
    const metadata = authData.user.user_metadata || {};
    const fullName = metadata.full_name || metadata.name || authData.user.email?.split("@")[0] || "Cliente Mandorla";
    await supabase.from("profiles").upsert({
      id: authData.user.id,
      email: authData.user.email || "",
      full_name: fullName,
      phone: null,
      address: null,
      birthday: null,
    });
  }

  // 2. Ejecutar Transacción (Claim Execution)
  const { data: rpcData, error: rpcError } = await supabase.rpc("claim_qr_points", { p_token: token });

  if (rpcError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0e0d] text-[#f5efe6] p-6">
        <div className="bg-[#2a1a18] p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-red-500/30">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-serif text-red-400 mb-2">Error al Procesar</h1>
          <p className="text-sm text-[#f5efe6]/70 mb-6">{rpcError.message}</p>
          <Link
            href="/"
            className="inline-block bg-[#3a2220] hover:bg-[#4a2c2a] text-[#f5efe6] text-xs font-semibold py-2.5 px-6 rounded-xl border border-[#c6a96b]/30 transition-all"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  // Interpretar respuesta JSON de la base de datos
  const response = rpcData as { status: number; message?: string; points_awarded?: number; current_balance?: number };

  // Manejo de Error de Cooldown (429) o Token Usado/Inválido
  if (response.status !== 200) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0e0d] text-[#f5efe6] p-6">
        <div className="bg-[#2a1a18] p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-[#c6a96b]/30">
          <div className="w-14 h-14 rounded-full bg-[#3a2220] border border-[#c6a96b]/40 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#c6a96b] mb-2">
            {response.status === 429 ? "¡Puntos ya registrados hoy!" : "Información de la Promoción"}
          </h1>
          <p className="text-sm text-[#f5efe6]/80 mb-4 leading-relaxed">{response.message}</p>
          {response.status === 429 && (
            <p className="text-xs text-[#f5efe6]/50 mb-6">Vuelve a visitarnos mañana para seguir acumulando.</p>
          )}

          <div className="space-y-3">
            <Link
              href="/canjes"
              className="flex items-center justify-center gap-2 w-full bg-[#c6a96b] hover:bg-[#d8bd80] text-[#1a0e0d] font-bold py-3 px-6 rounded-xl transition-all shadow-md text-sm"
            >
              <Gift className="w-4 h-4" />
              <span>Ver Productos a Canjear</span>
            </Link>
            <Link
              href="/"
              className="block text-xs text-[#f5efe6]/60 hover:text-[#c6a96b] transition-colors py-1"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Éxito: Puntos acreditados
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a0e0d] text-[#f5efe6] p-6 selection:bg-[#c6a96b] selection:text-[#1a0e0d]">
      <div className="bg-[#2a1a18] p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-[#c6a96b]/40 relative overflow-hidden">
        {/* Luz de fondo */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#c6a96b]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-[#3a2220] border-2 border-[#c6a96b] text-[#c6a96b] mb-6 shadow-lg">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>

        <span className="text-xs uppercase tracking-widest text-[#c6a96b] font-semibold block mb-1">
          ¡Acreditación Exitosa!
        </span>
        <h1 className="text-3xl font-extrabold font-serif text-[#f5efe6] mb-2">¡Puntos Sumados!</h1>
        <p className="text-sm text-[#f5efe6]/70 mb-6">
          Has ganado <span className="font-bold text-[#c6a96b] text-base">+{response.points_awarded} puntos</span> en tu compra.
        </p>

        {/* Tarjeta de Saldo Actualizado */}
        <div className="bg-[#3a2220] rounded-2xl p-5 border border-[#c6a96b]/30 mb-8">
          <p className="text-xs text-[#c6a96b] uppercase tracking-wider font-semibold">Tu Saldo Total Acumulado</p>
          <p className="text-4xl sm:text-5xl font-black font-serif text-[#f5efe6] mt-2">
            {response.current_balance} <span className="text-base font-sans font-medium text-[#c6a96b]">pts</span>
          </p>
        </div>

        {/* Botonera de Acción */}
        <div className="space-y-3">
          {/* Botón Principal a la Calculadora y Grilla de Canjes */}
          <Link
            href="/canjes"
            className="group flex items-center justify-center gap-2.5 w-full bg-[#c6a96b] hover:bg-[#d8bd80] text-[#1a0e0d] font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-[#c6a96b]/20 active:scale-[0.99] text-base"
          >
            <Gift className="w-5 h-5 text-[#1a0e0d]" />
            <span>Ver Productos a Canjear</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/"
            className="block w-full text-xs text-[#f5efe6]/60 hover:text-[#c6a96b] py-2 transition-colors font-medium"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
