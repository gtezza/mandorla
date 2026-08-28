"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function redeemPoints(formData: FormData) {
  const userId = formData.get("user_id") as string;
  const amount = parseInt(formData.get("amount") as string || "0");
  const description = formData.get("description") as string || "Canje de puntos";

  if (!userId || amount <= 0) {
    return { success: false, message: "Datos inválidos para el canje." };
  }

  const supabase = await createClient();

  // Obtener balance actual
  const { data: ledger } = await supabase
    .from("points_ledger")
    .select("amount")
    .eq("user_id", userId);

  const currentBalance = (ledger || []).reduce((sum, record) => sum + record.amount, 0);

  if (currentBalance < amount) {
    return { success: false, message: "Saldo insuficiente para realizar el canje." };
  }

  // Insertar movimiento negativo
  const { error } = await supabase
    .from("points_ledger")
    .insert([
      {
        user_id: userId,
        amount: -amount,
        description: description,
      }
    ]);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/clientes");
  revalidatePath("/dashboard");
  return { success: true };
}
