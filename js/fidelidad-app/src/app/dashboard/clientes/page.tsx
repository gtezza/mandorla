import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ClientManager from "./ClientManager";

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
    "probando123@hola.com"
  ];
  
  const userEmail = authData.user.email?.toLowerCase() || "";
  const isAdmin = ADMIN_EMAILS.some(admin => admin.toLowerCase() === userEmail);
  
  if (!isAdmin) {
    redirect("/admin/login");
  }

  // 1. Obtener todos los perfiles de usuarios y el historial de transacciones
  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  const { data: ledger } = await supabase.from("points_ledger").select("*").order("created_at", { ascending: false });

  // 2. Armar la información estructurada de clientes
  const clientsData = (profiles || []).map(profile => {
    const userLedger = (ledger || []).filter(r => r.user_id === profile.id);
    const balance = userLedger.reduce((sum, r) => sum + r.amount, 0);
    const history = userLedger.map(r => ({
      id: r.id,
      amount: r.amount,
      description: r.description,
      date: r.created_at
    }));

    return {
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      balance,
      history
    };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Directorio de Clientes</h1>
        <p className="text-gray-500 mt-2">Gestiona el saldo, historial y canje manual de puntos por premios.</p>
      </div>

      <ClientManager initialClients={clientsData} />
    </div>
  );
}
