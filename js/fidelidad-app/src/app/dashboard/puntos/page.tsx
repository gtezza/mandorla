import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PuntosManager from "./PuntosManager";

export default async function PuntosDePromocionPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect("/admin/login");
  }

  // Verificar admin (esto podría abstraerse luego)
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

  // Obtener puntos de promoción
  const { data: puntos } = await supabase.from("promotion_points").select("*").order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#f5efe6] font-serif">Puntos de Promoción</h1>
        <p className="text-[#f5efe6]/60 mt-2">Administra las sucursales y genera sus códigos QR correspondientes.</p>
      </div>

      <PuntosManager initialPuntos={puntos || []} />
    </div>
  );
}
