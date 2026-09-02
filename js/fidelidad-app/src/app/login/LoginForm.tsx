"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Sparkles, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { loginWithEmail } from "./actions";

export default function LoginForm({
  returnTo,
  initialMessage,
}: {
  returnTo: string;
  initialMessage?: string;
}) {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState(initialMessage || "");

  const handleGoogleLogin = async () => {
    try {
      setLoadingGoogle(true);
      setErrorMessage("");
      const supabase = createClient();
      
      const origin = window.location.origin;
      const redirectUrl = `${origin}/auth/callback?return_to=${encodeURIComponent(returnTo)}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoadingGoogle(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Ocurrió un error al conectar con Google.");
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Botón Principal Dominante: Iniciar con Google (Fricción Cero) */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loadingGoogle}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-bold py-4 px-6 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-base group disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loadingGoogle ? (
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{loadingGoogle ? "Conectando con Google..." : "Continuar con Google"}</span>
      </button>

      {/* Beneficios de 1 clic */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>1 clic · Sin contraseñas · Guardado inmediato</span>
      </div>

      {errorMessage && (
        <div className="text-red-600 text-sm text-center font-medium bg-red-50 p-3 rounded-xl border border-red-100">
          {errorMessage}
        </div>
      )}

      {/* Separador */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-gray-200 w-full" />
        <span className="bg-white px-3 text-xs text-gray-400 font-medium uppercase absolute">
          o con correo
        </span>
      </div>

      {/* Alternativa secundaria por correo */}
      {!showEmailForm ? (
        <button
          type="button"
          onClick={() => setShowEmailForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
        >
          <Mail className="w-4 h-4 text-gray-500" />
          <span>Ingresar con correo electrónico</span>
        </button>
      ) : (
        <form action={loginWithEmail} className="space-y-3 pt-1">
          <input type="hidden" name="return_to" value={returnTo} />
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase text-gray-600 mb-1">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@correo.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 px-4 rounded-xl shadow transition-all active:scale-[0.98] text-sm"
          >
            Ingresar con Correo
          </button>
        </form>
      )}
    </div>
  );
}
