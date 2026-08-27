"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    return redirect("/login");
  }

  const userId = authData.user.id;
  const email = authData.user.email || "";
  
  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const birthday = formData.get("birthday") as string;
  const returnTo = formData.get("return_to") as string || "/";

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email: email,
      full_name: fullName,
      phone: phone,
      address: address,
      birthday: birthday
    });

  if (error) {
    return redirect(`/completar-perfil?error=${encodeURIComponent(error.message)}&return_to=${encodeURIComponent(returnTo)}`);
  }

  // Redirigir de regreso al reclamo de puntos
  return redirect(returnTo);
}
