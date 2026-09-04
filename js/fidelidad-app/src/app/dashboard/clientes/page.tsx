import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ClientManager from "./ClientManager";
import { RedemptionProduct } from "../productos-canje/RedemptionProductsManager";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect("/admin/login");
  }

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

  // 1. Obtener todos los perfiles, movimientos y productos de canje
  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  const { data: ledger } = await supabase.from("points_ledger").select("*").order("created_at", { ascending: false });
  const { data: qrTokens } = await supabase.from("qr_tokens").select("token, store_id");
  const { data: promotionPoints } = await supabase.from("promotion_points").select("id, name");
  const { data: redemptionProducts } = await supabase
    .from("redemption_products")
    .select("*")
    .eq("is_active", true)
    .order("points_required", { ascending: true });

  const ppMap = new Map((promotionPoints || []).map((p) => [p.id, p.name]));
  const qrMap = new Map((qrTokens || []).map((q) => [q.token, q.store_id]));

  // 2. Armar la información estructurada de clientes
  const clientsData = (profiles || []).map((profile) => {
    const userLedger = (ledger || []).filter((r) => r.user_id === profile.id);
    const balance = userLedger.reduce((sum, r) => sum + (r.amount || 0), 0);
    const history = userLedger.map((r) => {
      let description = r.description;
      if (r.qr_token) {
        const storeId = qrMap.get(r.qr_token);
        if (storeId) {
          const ppName = ppMap.get(storeId) || `PP (ID: ${storeId.substring(0, 4)}...)`;
          if (!description || description === "Canje de QR estático en tienda") {
            description = `Puntos obtenidos en ${ppName}`;
          }
        }
      }
      return {
        id: r.id,
        amount: r.amount,
        description: description,
        date: r.created_at,
      };
    });

    return {
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      balance,
      history,
    };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#f5efe6] font-serif">Directorio de Clientes</h1>
        <p className="text-[#f5efe6]/60 mt-2">
          Gestiona el saldo, historial y canje de productos en mostrador con cálculo en tiempo real.
        </p>
      </div>

      <ClientManager
        initialClients={clientsData}
        redemptionProducts={(redemptionProducts as RedemptionProduct[]) || []}
      />
    </div>
  );
}
