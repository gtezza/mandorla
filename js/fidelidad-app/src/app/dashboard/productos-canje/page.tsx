import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import RedemptionProductsManager from "./RedemptionProductsManager";

export default async function ProductosCanjePage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect("/admin/login");
  }

  // Lista de correos administradores MVP
  const ADMIN_EMAILS = [
    "gerardo+test1@gmail.com",
    "gerardo@gtdata.com.ar",
    "gerardo+test2@gmail.com",
    "probando123@hola.com",
  ];

  const userEmail = authData.user.email?.toLowerCase() || "";
  const isAdmin = ADMIN_EMAILS.some((admin) => admin.toLowerCase() === userEmail);

  if (!isAdmin) {
    redirect("/admin/login");
  }

  // Cargar productos de canje desde Supabase
  const { data: products } = await supabase
    .from("redemption_products")
    .select("*")
    .order("created_at", { ascending: false });

  // Cargar categorías
  const { data: categories } = await supabase
    .from("reward_categories")
    .select("*")
    .order("min_points", { ascending: true });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#c6a96b] font-serif tracking-wide">Productos de Canje</h1>
        <p className="text-[#f5efe6]/70 mt-2">
          Gestiona el catálogo de premios y recompensas disponibles para los clientes, definiendo SKU, puntos requeridos, dinero adicional y fechas de vencimiento.
        </p>
      </div>

      <RedemptionProductsManager initialProducts={products || []} categories={categories || []} />
    </div>
  );
}
