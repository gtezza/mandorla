import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CategoryManager from "./CategoryManager";

export default async function RewardCategoriesPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect("/admin/login");
  }

  // Obtener categorías ordenadas por puntos mínimos
  const { data: categories, error } = await supabase
    .from("reward_categories")
    .select("*")
    .order("min_points", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
  }

  // Obtener productos para contar cuántos hay en cada categoría (asignación automática)
  const { data: products } = await supabase
    .from("redemption_products")
    .select("id, points_required");

  const categoriesData = categories || [];
  const productsData = products || [];

  // Calcular conteo automático de productos por categoría
  const categoriesWithStats = categoriesData.map((cat, index) => {
    const nextCat = categoriesData[index + 1];
    const productCount = productsData.filter(p => {
      // Un producto pertenece a esta categoría si sus puntos requeridos son >= min_points
      // y < min_points de la SIGUIENTE categoría (si existe)
      if (nextCat) {
        return p.points_required >= cat.min_points && p.points_required < nextCat.min_points;
      } else {
        return p.points_required >= cat.min_points;
      }
    }).length;

    return {
      ...cat,
      productCount
    };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorías de Premios</h1>
          <p className="text-gray-500 mt-2">
            Gestiona los niveles para agrupar automáticamente los premios según sus puntos requeridos.
          </p>
        </div>
      </div>

      <CategoryManager initialCategories={categoriesWithStats} />
    </div>
  );
}
