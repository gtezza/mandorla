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
      ? "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 font-semibold"
      : "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors";
  };

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      <Link href="/dashboard" className={getLinkClass("/dashboard")}>
        <LayoutDashboard className="w-5 h-5" />
        Métricas
      </Link>
      <Link href="/dashboard/insights" className={getLinkClass("/dashboard/insights")}>
        <LineChart className="w-5 h-5 text-indigo-600" />
        Insights
      </Link>
      <Link href="/dashboard/clientes" className={getLinkClass("/dashboard/clientes")}>
        <Users className="w-5 h-5" />
        Clientes
      </Link>
      <Link href="/dashboard/categorias-premios" className={getLinkClass("/dashboard/categorias-premios")}>
        <Layers className="w-5 h-5 text-purple-600" />
        Categorías de Premios
      </Link>
      <Link href="/dashboard/productos-canje" className={getLinkClass("/dashboard/productos-canje")}>
        <Gift className="w-5 h-5 text-blue-600" />
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
