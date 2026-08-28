"use client";

import { useState } from "react";
import { redeemPoints } from "./actions";
import { Search, History, MessageCircle, Gift, Download, X } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
}

interface ClientData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  balance: number;
  history: Transaction[];
}

export default function ClientManager({ initialClients }: { initialClients: ClientData[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modales
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState<"earned" | "redeemed" | null>(null);
  
  // Selección
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  
  // Estado UI
  const [loading, setLoading] = useState(false);
  const [redeemError, setRedeemError] = useState("");

  const filteredClients = initialClients.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openRedeemModal = (client: ClientData) => {
    setSelectedClient(client);
    setRedeemError("");
    setRedeemModalOpen(true);
  };

  const openHistoryModal = (client: ClientData, type: "earned" | "redeemed") => {
    setSelectedClient(client);
    setHistoryModalOpen(type);
  };

  const handleRedeem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    setLoading(true);
    setRedeemError("");
    const formData = new FormData(e.currentTarget);
    formData.append("user_id", selectedClient.id);
    
    const res = await redeemPoints(formData);
    setLoading(false);
    
    if (res.success) {
      setRedeemModalOpen(false);
      // Como usamos revalidatePath en el servidor, los datos deberían refrescarse pronto
      // Pero si quisiéramos ser puristas en UX, actualizaríamos initialClients aquí.
      // Next.js hará un refresh en el fondo.
    } else {
      setRedeemError(res.message || "Error desconocido");
    }
  };

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
          placeholder="Buscar por nombre, teléfono o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4 text-right">Saldo Actual</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  No se encontraron clientes.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{client.full_name}</div>
                    <div className="text-xs text-gray-500">{client.email}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">{client.phone}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                      {client.balance} pts
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center justify-center gap-2">
                    <button 
                      onClick={() => openHistoryModal(client, "earned")}
                      title="Ver Detalle de Obtención"
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5 rotate-180" />
                    </button>
                    
                    <button 
                      onClick={() => openHistoryModal(client, "redeemed")}
                      title="Ver Detalle de Canjes"
                      className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <History className="w-5 h-5" />
                    </button>

                    <button 
                      title="Enviar WhatsApp (Próximamente)"
                      className="p-2 text-gray-400 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors cursor-not-allowed"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>

                    <button 
                      onClick={() => openRedeemModal(client)}
                      title="Canjear Puntos Manualmente"
                      className="p-2 text-purple-600 hover:bg-purple-50 hover:text-purple-800 rounded-lg transition-colors ml-2 border border-purple-100 shadow-sm"
                    >
                      <Gift className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Canje de Puntos */}
      {redeemModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
            <button onClick={() => setRedeemModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Canjear Premio</h3>
            <p className="text-sm text-gray-600 mb-4">
              Cliente: <span className="font-bold">{selectedClient.full_name}</span> <br/>
              Saldo: <span className="font-bold text-blue-600">{selectedClient.balance} pts</span>
            </p>

            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Puntos a descontar</label>
                <input 
                  type="number" 
                  name="amount" 
                  required 
                  min="1"
                  max={selectedClient.balance}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none" 
                  placeholder="Ej. 1500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del canje</label>
                <input 
                  type="text" 
                  name="description" 
                  required 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none" 
                  placeholder="Ej. Alfajor de Chocolate" 
                />
              </div>
              
              {redeemError && <p className="text-red-500 text-sm font-medium">{redeemError}</p>}

              <button 
                disabled={loading || selectedClient.balance <= 0} 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? "Procesando..." : "Confirmar Canje"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Historial de Puntos */}
      {historyModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative max-h-[80vh] flex flex-col">
            <button onClick={() => setHistoryModalOpen(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {historyModalOpen === "earned" ? "Detalle de Obtención" : "Detalle de Canjes"}
            </h3>
            <p className="text-sm text-gray-500 pb-4 border-b border-gray-100">{selectedClient.full_name}</p>

            <div className="overflow-y-auto mt-4 space-y-3 flex-1 pr-2">
              {(() => {
                const displayedHistory = selectedClient.history.filter(tx => 
                  historyModalOpen === "earned" ? tx.amount > 0 : tx.amount < 0
                );
                
                if (displayedHistory.length === 0) {
                  return <p className="text-gray-500 text-center py-4">No hay registros de este tipo.</p>;
                }

                return displayedHistory.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{tx.description || "Movimiento general"}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleString('es-AR')}</p>
                    </div>
                    <div className={`font-black ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
