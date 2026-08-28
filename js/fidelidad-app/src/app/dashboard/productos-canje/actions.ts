"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createRedemptionProduct(formData: FormData) {
  const sku = (formData.get("sku") as string)?.trim() || null;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const image_url = (formData.get("image_url") as string)?.trim() || null;
  const points_required = parseInt(formData.get("points_required") as string, 10) || 0;
  const additional_money = parseFloat(formData.get("additional_money") as string) || 0.0;
  const expires_at_raw = formData.get("expires_at") as string;
  const is_active = formData.get("is_active") === "true";

  if (!title) {
    return { success: false, message: "El título del producto es obligatorio." };
  }

  if (points_required < 0) {
    return { success: false, message: "Los puntos no pueden ser negativos." };
  }

  const expires_at = expires_at_raw ? new Date(expires_at_raw).toISOString() : null;

  const supabase = await createClient();
  const { error } = await supabase.from("redemption_products").insert([
    {
      sku,
      title,
      description,
      image_url,
      points_required,
      additional_money,
      expires_at,
      is_active,
    },
  ]);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/productos-canje");
  revalidatePath("/canjes");
  return { success: true };
}

export async function updateRedemptionProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const sku = (formData.get("sku") as string)?.trim() || null;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const image_url = (formData.get("image_url") as string)?.trim() || null;
  const points_required = parseInt(formData.get("points_required") as string, 10) || 0;
  const additional_money = parseFloat(formData.get("additional_money") as string) || 0.0;
  const expires_at_raw = formData.get("expires_at") as string;
  const is_active = formData.get("is_active") === "true";

  if (!id) {
    return { success: false, message: "ID de producto inválido." };
  }

  if (!title) {
    return { success: false, message: "El título del producto es obligatorio." };
  }

  const expires_at = expires_at_raw ? new Date(expires_at_raw).toISOString() : null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("redemption_products")
    .update({
      sku,
      title,
      description,
      image_url,
      points_required,
      additional_money,
      expires_at,
      is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/productos-canje");
  revalidatePath("/canjes");
  return { success: true };
}

export async function toggleProductStatus(productId: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("redemption_products")
    .update({
      is_active: !currentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/productos-canje");
  revalidatePath("/canjes");
  return { success: true };
}
