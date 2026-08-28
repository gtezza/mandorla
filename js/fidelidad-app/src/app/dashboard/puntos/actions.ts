"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addPromotionPoint(formData: FormData) {
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const manager = formData.get("manager") as string;

  const supabase = await createClient();

  const { error } = await supabase.from("promotion_points").insert([
    {
      name,
      address,
      phone,
      manager,
    },
  ]);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/puntos");
  return { success: true };
}

export async function generateQRToken(storeId: string) {
  const supabase = await createClient();

  // Verificar si ya tiene un token
  const { data: existingTokens } = await supabase
    .from("qr_tokens")
    .select("token")
    .eq("store_id", storeId)
    .eq("is_active", true);

  if (existingTokens && existingTokens.length > 0) {
    return { success: true, token: existingTokens[0].token };
  }

  // Generar uno nuevo para un año (por ejemplo)
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const { data, error } = await supabase
    .from("qr_tokens")
    .insert([
      {
        store_id: storeId,
        points_value: 100, // Hardcoded 100 por el momento
        expires_at: expiresAt.toISOString(),
      },
    ])
    .select("token")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, token: data.token };
}
