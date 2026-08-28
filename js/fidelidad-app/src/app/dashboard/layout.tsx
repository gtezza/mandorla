import Sidebar from "./Sidebar";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  Store,
  Wallet
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-xl font-bold text-blue-900">CRM Mandorla</span>
        </div>
        
        <Sidebar />

        <div className="p-4 border-t border-gray-100">
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
