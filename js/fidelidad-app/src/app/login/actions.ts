"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const returnTo = formData.get("return_to") as string;
  const supabase = await createClient();

  // Obtener el origen para construir la URL de callback
  const originList = await headers();
  // El host fallback por si no se detecta (en dev suele ser localhost:3000)
  const host = originList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  
  // Construir la URL exacta del callback y pasarle el return_to
  const callbackUrl = new URL(`${protocol}://${host}/auth/callback`);
  if (returnTo) {
    callbackUrl.searchParams.set("return_to", returnTo);
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    return redirect(`/login?message=${encodeURIComponent(error.message)}&return_to=${encodeURIComponent(returnTo)}`);
  }

  return redirect(`/login?success=true&return_to=${encodeURIComponent(returnTo)}`);
}
