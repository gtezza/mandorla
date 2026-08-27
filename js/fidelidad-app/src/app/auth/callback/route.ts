import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as any;
  // Si no hay return_to explícito, mandamos al home por defecto
  const returnTo = requestUrl.searchParams.get("return_to") || "/";

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(new URL(returnTo, request.url));
    }
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent(error.message)}`, request.url));
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(returnTo, request.url));
    }
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent(error.message)}`, request.url));
  }

  // Fallback si alguien entra a /auth/callback sin parámetros
  return NextResponse.redirect(
    new URL(`/login?message=Código de verificación ausente`, request.url)
  );
}
