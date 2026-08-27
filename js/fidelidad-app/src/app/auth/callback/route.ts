import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  // Si no hay return_to explícito, mandamos al home por defecto
  const returnTo = requestUrl.searchParams.get("return_to") || "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Éxito: Redirigimos al usuario a la página que solicitó (ej: /reclamar)
      return NextResponse.redirect(new URL(returnTo, request.url));
    } else {
      // Error de autenticación
      return NextResponse.redirect(
        new URL(`/login?message=${encodeURIComponent(error.message)}`, request.url)
      );
    }
  }

  // Fallback si alguien entra a /auth/callback sin parámetros
  return NextResponse.redirect(
    new URL(`/login?message=Código de verificación ausente`, request.url)
  );
}
