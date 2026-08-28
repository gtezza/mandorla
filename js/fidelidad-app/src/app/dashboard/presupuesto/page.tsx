import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import BudgetManager from "./BudgetManager";

export default async function PresupuestoPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect("/admin/login");
  }

  const ADMIN_EMAILS = [
    "gerardo+test1@gmail.com",
    "gerardo@gtdata.com.ar",
    "gerardo+test2@gmail.com",
    "probando123@hola.com"
  ];
  
  const userEmail = authData.user.email?.toLowerCase() || "";
  const isAdmin = ADMIN_EMAILS.some(admin => admin.toLowerCase() === userEmail);
  
  if (!isAdmin) {
    redirect("/admin/login");
  }

  // Obtener presupuesto activo actual
  const { data: activeBudget } = await supabase
    .from("point_budgets")
    .select("*")
    .eq("is_active", true)
    .single();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Presupuesto de Puntos</h1>
        <p className="text-gray-500 mt-2">Configura la cantidad máxima de puntos a distribuir en la plataforma.</p>
      </div>

      <BudgetManager currentBudget={activeBudget} />
    </div>
  );
}
