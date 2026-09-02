import LoginForm from "./LoginForm";
import { Sparkles, Gift } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const returnTo = params.return_to || "/";
  const message = params.message;

  const isClaiming = returnTo.includes("/reclamar");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a0e0d] text-[#f5efe6] p-4 sm:p-6 relative overflow-hidden">
      {/* Fondo decorativo premium */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#c6a96b]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#c6a96b]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white text-gray-900 p-7 sm:p-9 rounded-3xl shadow-2xl max-w-md w-full border border-[#c6a96b]/30 relative z-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#1a0e0d] border-2 border-[#c6a96b] flex items-center justify-center mx-auto mb-4 text-[#c6a96b] shadow-md">
            {isClaiming ? <Gift className="w-7 h-7" /> : <Sparkles className="w-7 h-7" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a0e0d] font-serif mb-1.5">
            {isClaiming ? "Guardar mis Puntos" : "Bienvenido a Mandorla"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {isClaiming
              ? "Identifícate con 1 clic para acreditar tus puntos de compra de inmediato."
              : "Ingresa para consultar tu saldo acumulado y canjear premios."}
          </p>
        </div>

        <LoginForm returnTo={returnTo} initialMessage={message} />
      </div>
    </div>
  );
}
