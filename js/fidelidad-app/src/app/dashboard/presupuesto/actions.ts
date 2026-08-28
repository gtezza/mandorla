"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function setPointBudget(formData: FormData) {
  const budgetType = formData.get("budget_type") as string;
  const totalPoints = parseInt(formData.get("total_points") as string || "0");
  const startDate = formData.get("start_date") as string || null;
  const endDate = formData.get("end_date") as string || null;

  const supabase = await createClient();

  // Desactivar todos los presupuestos actuales
  await supabase
    .from("point_budgets")
    .update({ is_active: false })
    .eq("is_active", true);

  // Insertar el nuevo presupuesto
  const { error } = await supabase.from("point_budgets").insert([
    {
      budget_type: budgetType,
      total_points: totalPoints,
      start_date: startDate ? startDate : null,
      end_date: endDate ? endDate : null,
      is_active: true
    },
  ]);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/presupuesto");
  revalidatePath("/dashboard");
  return { success: true };
}
