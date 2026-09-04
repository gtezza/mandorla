"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Store,
  Wallet,
  Gift,
  HelpCircle,
  LineChart,
  Layers
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    // Exact match for dashboard home, prefix match for others
    const isActive = path === "/dashboard" 
      ? pathname === "/dashboard" 
      : pathname.startsWith(path);
      
    return isActive
      ? "flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg bg-[#c6a96b]/15 text-[#c6a96b] border border-[#c6a96b]/30 shadow-[0_0_15px_rgba(198,169,107,0.1)] transition-all"
      : "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-[#f5efe6]/70 hover:bg-[#c6a96b]/10 hover:text-[#f5efe6] transition-colors";
  };

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      <Link href="/dashboard" className={getLinkClass("/dashboard")}>
        <LayoutDashboard className="w-5 h-5" />
        Métricas
      </Link>
      <Link href="/dashboard/insights" className={getLinkClass("/dashboard/insights")}>
        <LineChart className="w-5 h-5" />
        Insights
      </Link>
      <Link href="/dashboard/clientes" className={getLinkClass("/dashboard/clientes")}>
        <Users className="w-5 h-5" />
        Clientes
      </Link>
      <Link href="/dashboard/categorias-premios" className={getLinkClass("/dashboard/categorias-premios")}>
        <Layers className="w-5 h-5" />
        Categorías de Premios
      </Link>
      <Link href="/dashboard/productos-canje" className={getLinkClass("/dashboard/productos-canje")}>
        <Gift className="w-5 h-5" />
        Productos de Canje
      </Link>
      <Link href="/dashboard/puntos" className={getLinkClass("/dashboard/puntos")}>
        <Store className="w-5 h-5" />
        Puntos de Prom.
      </Link>
      <Link href="/dashboard/presupuesto" className={getLinkClass("/dashboard/presupuesto")}>
        <Wallet className="w-5 h-5" />
        Presupuesto de Puntos
      </Link>
      <Link href="/dashboard/ayuda" className={getLinkClass("/dashboard/ayuda")}>
        <HelpCircle className="w-5 h-5" />
        Ayuda
      </Link>
      <Link href="#" className={getLinkClass("/dashboard/configuracion")}>
        <Settings className="w-5 h-5" />
        Configuración
      </Link>
    </nav>
  );
}
