"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const returnTo = formData.get("return_to") as string;
  const supabase = await createClient();

  // MOCK LOGIN FOR TESTING
  const mockPassword = "Mandorla2026Test!";

  // Intenta iniciar sesión con password
  let { error } = await supabase.auth.signInWithPassword({
    email,
    password: mockPassword,
  });

  // Si no existe, créalo
  if (error && error.message.includes("Invalid login credentials")) {
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: mockPassword,
    });
    
    error = signUpError;
  }

  if (error) {
    return redirect(`/login?message=${encodeURIComponent(error.message)}&return_to=${encodeURIComponent(returnTo)}`);
  }

  // En vez de success=true, lo logueamos directamente y redirigimos al origen
  return redirect(returnTo || "/");
}
