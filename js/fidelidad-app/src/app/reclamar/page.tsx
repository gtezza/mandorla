import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ReclamarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token || typeof token !== "string") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">QR Inválido</h1>
          <p className="text-gray-600">No se detectó un código válido en tu escaneo.</p>
        </div>
      </div>
    );
  }

  // 1. Validar Identidad (Auth Gate)
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  // Si no está logueado, redirigir a un login ficticio retieniendo el token
  // Nota: Deberás crear la página /login luego para manejar el registro
  if (authError || !authData?.user) {
    // redirect(`/login?return_to=/reclamar?token=${token}`);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">¡Casi listo!</h1>
          <p className="text-gray-600 mb-6">
            Inicia sesión o regístrate para sumar los puntos de este código QR a tu cuenta.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg w-full transition-colors opacity-50 cursor-not-allowed">
            (Botón Login: Próximamente)
          </button>
        </div>
      </div>
    );
  }

  // 2. Ejecutar Transacción (Claim Execution)
  const { data: rpcData, error: rpcError } = await supabase.rpc("claim_qr_points", { p_token: token });

  if (rpcError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Conexión</h1>
          <p className="text-gray-600">{rpcError.message}</p>
        </div>
      </div>
    );
  }

  // Interpretar respuesta JSON de la base de datos
  const response = rpcData as { status: number; message?: string; points_awarded?: number; current_balance?: number };

  // Manejo de Error de Cooldown (429) o Token Usado/Inválido
  if (response.status !== 200) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-orange-500 mb-4">
            {response.status === 429 ? "¡Ups! Espera un poco" : "Escaneo Fallido"}
          </h1>
          <p className="text-gray-600">{response.message}</p>
          {response.status === 429 && (
            <p className="mt-4 text-sm text-gray-400">Vuelve a visitarnos mañana para sumar más puntos.</p>
          )}
        </div>
      </div>
    );
  }

  // Éxito: Puntos acreditados
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-4 border-green-500">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">¡Puntos Sumados!</h1>
        <p className="text-lg text-gray-600 mb-8">
          Has ganado <span className="font-bold text-blue-600">{response.points_awarded} puntos</span>.
        </p>
        
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Tu balance actual</p>
          <p className="text-4xl font-black text-blue-900 mt-1">{response.current_balance}</p>
        </div>

        <Link href="/" className="mt-8 block w-full text-gray-500 hover:text-gray-700 underline text-sm transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
