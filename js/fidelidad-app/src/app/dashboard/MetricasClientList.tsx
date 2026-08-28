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
      <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen de Clientes</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4 text-right">Puntos Obtenidos</th>
              <th className="px-6 py-4 text-right">Puntos Canjeados</th>
              <th className="px-6 py-4 text-right">Saldo Actual</th>
              <th className="px-6 py-4 text-center">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No hay clientes registrados.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{client.full_name}</div>
                    <div className="text-xs text-gray-500">{client.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-green-600">
                    +{client.earned}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-red-500">
                    {client.redeemed}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                      {client.balance} pts
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center justify-center gap-2">
                    <button 
                      onClick={() => openModal(client, "earned")}
                      title="Ver Detalle de Obtención"
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5 rotate-180" />
                    </button>
                    
                    <button 
                      onClick={() => openModal(client, "redeemed")}
                      title="Ver Detalle de Canjes"
                      className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <Gift className="w-5 h-5" />
                    </button>

                    <button 
                      title="Enviar WhatsApp (Próximamente)"
                      className="p-2 text-gray-400 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors cursor-not-allowed"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative max-h-[80vh] flex flex-col">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {modalType === "earned" ? "Detalle de Obtención" : "Detalle de Canjes"}
            </h3>
            <p className="text-sm text-gray-500 pb-4 border-b border-gray-100">{selectedClient.full_name}</p>

            <div className="overflow-y-auto mt-4 space-y-3 flex-1 pr-2">
              {displayedHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay registros de este tipo.</p>
              ) : (
                displayedHistory.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{tx.description || "Movimiento general"}</p>
                      {modalType === "earned" && tx.store_id && (
                        <p className="text-xs font-medium text-blue-600 mt-0.5">Sucursal: {tx.store_id}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{new Date(tx.date).toLocaleString('es-AR')}</p>
                    </div>
                    <div className={`font-black ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
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
