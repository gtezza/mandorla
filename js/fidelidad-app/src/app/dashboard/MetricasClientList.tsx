"use client";

import { useState } from "react";
import { Download, Gift, MessageCircle, X } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  store_id?: string;
}

interface ClientData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  earned: number;
  redeemed: number;
  balance: number;
  history: Transaction[];
}

export default function MetricasClientList({ clients }: { clients: ClientData[] }) {
  const [modalType, setModalType] = useState<"earned" | "redeemed" | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

  const openModal = (client: ClientData, type: "earned" | "redeemed") => {
    setSelectedClient(client);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedClient(null);
    setModalType(null);
  };

  const displayedHistory = selectedClient?.history.filter(tx => 
    modalType === "earned" ? tx.amount > 0 : tx.amount < 0
  ) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#c6a96b] font-serif mb-4">Resumen de Clientes</h2>
      
      <div className="bg-[#2a1a18] rounded-xl shadow-xl border border-[#c6a96b]/20 overflow-hidden">
        <table className="w-full text-left text-sm text-[#f5efe6]/80">
          <thead className="bg-[#1a0e0d] border-b border-[#c6a96b]/20 text-[#c6a96b] font-semibold">
            <tr>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4 text-right">Puntos Obtenidos</th>
              <th className="px-6 py-4 text-right">Puntos Canjeados</th>
              <th className="px-6 py-4 text-right">Saldo Actual</th>
              <th className="px-6 py-4 text-center">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c6a96b]/10">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[#f5efe6]/40">
                  No hay clientes registrados.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="hover:bg-[#c6a96b]/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#f5efe6]">{client.full_name}</div>
                    <div className="text-xs text-[#f5efe6]/50">{client.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-green-400">
                    +{client.earned}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-red-400">
                    {client.redeemed}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-[#c6a96b]/20 text-[#c6a96b] border border-[#c6a96b]/30">
                      {client.balance} pts
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center justify-center gap-2">
                    <button 
                      onClick={() => openModal(client, "earned")}
                      title="Ver Detalle de Obtención"
                      className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-colors border border-transparent hover:border-green-500/30"
                    >
                      <Download className="w-5 h-5 rotate-180" />
                    </button>
                    
                    <button 
                      onClick={() => openModal(client, "redeemed")}
                      title="Ver Detalle de Canjes"
                      className="p-2 text-purple-400 hover:bg-purple-900/30 rounded-lg transition-colors border border-transparent hover:border-purple-500/30"
                    >
                      <Gift className="w-5 h-5" />
                    </button>

                    <button 
                      title="Enviar WhatsApp (Próximamente)"
                      className="p-2 text-[#f5efe6]/30 hover:bg-green-900/10 hover:text-green-500/50 rounded-lg transition-colors cursor-not-allowed"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Historial */}
      {modalType && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#2a1a18] rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[80vh] flex flex-col border border-[#c6a96b]/20">
            <button onClick={closeModal} className="absolute top-4 right-4 text-[#f5efe6]/40 hover:text-[#c6a96b]">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-[#c6a96b] font-serif mb-1">
              {modalType === "earned" ? "Detalle de Obtención" : "Detalle de Canjes"}
            </h3>
            <p className="text-sm text-[#f5efe6]/60 pb-4 border-b border-[#c6a96b]/10">{selectedClient.full_name}</p>

            <div className="overflow-y-auto mt-4 space-y-3 flex-1 pr-2">
              {displayedHistory.length === 0 ? (
                <p className="text-[#f5efe6]/50 text-center py-4">No hay registros de este tipo.</p>
              ) : (
                displayedHistory.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg border border-[#c6a96b]/10 bg-[#1a0e0d]">
                    <div>
                      <p className="font-semibold text-[#f5efe6] text-sm">{tx.description || "Movimiento general"}</p>
                      <p className="text-xs text-[#f5efe6]/40 mt-1">{new Date(tx.date).toLocaleString('es-AR')}</p>
                    </div>
                    <div className={`font-black ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
