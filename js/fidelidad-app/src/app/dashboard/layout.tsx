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
    <div className="flex h-screen bg-[#1a0e0d] font-sans text-[#f5efe6] selection:bg-[#c6a96b] selection:text-[#1a0e0d]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2a1a18] border-r border-[#c6a96b]/20 flex flex-col shadow-2xl z-10">
        <div className="h-16 flex items-center px-6 border-b border-[#c6a96b]/10">
          <span className="text-xl font-bold text-[#c6a96b] font-serif tracking-widest">MANDORLA</span>
        </div>
        
        <Sidebar />

        <div className="p-4 border-t border-[#c6a96b]/10">
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
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
