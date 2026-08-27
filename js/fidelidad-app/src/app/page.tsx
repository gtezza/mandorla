import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 text-white p-6">
      <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-white/20">
        <h1 className="text-4xl font-extrabold mb-4">Mandorla</h1>
        <h2 className="text-xl font-medium text-blue-100 mb-8">Programa de Fidelidad</h2>

        {user ? (
          <div className="bg-white/20 p-6 rounded-2xl mb-8">
            <p className="text-sm uppercase tracking-wider text-blue-200 font-semibold mb-1">Sesión Activa</p>
            <p className="text-lg font-bold">{user.email}</p>
          </div>
        ) : (
          <p className="text-blue-100 mb-8">
            Acumula puntos con cada compra y canjéalos por premios exclusivos.
          </p>
        )}

        <div className="space-y-4">
          {!user && (
            <Link 
              href="/login" 
              className="block w-full bg-white text-blue-900 font-bold py-4 px-6 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              Iniciar Sesión / Registrarse
            </Link>
          )}
          
          <Link 
            href="/simulador" 
            className="block w-full bg-blue-800 text-white font-bold py-4 px-6 rounded-xl border border-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
          >
            Ir al Simulador de Caja (Pruebas)
          </Link>
        </div>
      </div>
      
      <div className="mt-12 text-sm text-blue-300">
        <p>G.T. Data © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
