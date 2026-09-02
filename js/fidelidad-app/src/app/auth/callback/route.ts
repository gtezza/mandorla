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
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      // Perfilado Progresivo: Asegurar que el usuario tenga su perfil inicial creado con los datos de Google
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existingProfile) {
        const metadata = data.user.user_metadata || {};
        const fullName = metadata.full_name || metadata.name || data.user.email?.split("@")[0] || "Cliente Mandorla";
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email: data.user.email || "",
          full_name: fullName,
          phone: null,
          address: null,
          birthday: null,
        });
      }

      return NextResponse.redirect(new URL(returnTo, request.url));
    }
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent(error?.message || "Error al autenticar")}`, request.url));
  }

  // Fallback si alguien entra a /auth/callback sin parámetros
  return NextResponse.redirect(
    new URL(`/login?message=Código de verificación ausente`, request.url)
  );
}
