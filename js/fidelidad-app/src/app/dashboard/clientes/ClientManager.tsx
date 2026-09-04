"use client";

import { useState } from "react";
import {
  Search,
  ArrowDownLeft,
  Clock,
  MessageCircle,
  Gift,
  X,
  Calculator,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Tag,
  DollarSign,
  Calendar,
  Sparkles,
} from "lucide-react";
import { redeemPoints } from "./actions";
import { RedemptionProduct } from "../productos-canje/RedemptionProductsManager";

interface HistoryItem {
  id: string;
  amount: number;
  description: string;
  date: string;
}

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  balance: number;
  history: HistoryItem[];
}

export default function ClientManager({
  initialClients,
  redemptionProducts = [],
}: {
  initialClients: Client[];
  redemptionProducts: RedemptionProduct[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState<"earned" | "redeemed" | null>(null);

  // Producto seleccionado para el canje dentro del catálogo
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    redemptionProducts.length > 0 ? redemptionProducts[0].id : null
  );

  const [loading, setLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  const filteredClients = initialClients.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openRedeemModal = (client: Client) => {
    setSelectedClient(client);
    setRedeemError(null);
    setRedeemSuccess(null);
    if (redemptionProducts.length > 0) {
      setSelectedProductId(redemptionProducts[0].id);
    }
    setRedeemModalOpen(true);
  };

  const openHistoryModal = (client: Client, type: "earned" | "redeemed") => {
    setSelectedClient(client);
    setHistoryModalOpen(type);
  };

  // Producto seleccionado para canjear
  const selectedProduct =
    redemptionProducts.find((p) => p.id === selectedProductId) || redemptionProducts[0];

  const pointsRequired = selectedProduct ? selectedProduct.points_required : 0;
  const additionalMoney = selectedProduct ? Number(selectedProduct.additional_money) || 0 : 0;
  const clientBalance = selectedClient ? selectedClient.balance : 0;
  const remainingBalance = clientBalance - pointsRequired;
  const hasEnoughPoints = clientBalance >= pointsRequired;
  const pointsMissing = Math.max(0, pointsRequired - clientBalance);

  const handleConfirmRedeem = async () => {
    if (!selectedClient || !selectedProduct) return;
    if (!hasEnoughPoints) {
      setRedeemError("El cliente no cuenta con saldo de puntos suficiente para este producto.");
      return;
    }

    setLoading(true);
    setRedeemError(null);

    const desc = `Canje: ${selectedProduct.title}${
      selectedProduct.sku ? ` [${selectedProduct.sku}]` : ""
    }${additionalMoney > 0 ? ` (+ $${additionalMoney.toLocaleString("es-AR")})` : ""}`;

    const formData = new FormData();
    formData.append("user_id", selectedClient.id);
    formData.append("amount", pointsRequired.toString());
    formData.append("description", desc);

    const res = await redeemPoints(formData);
    setLoading(false);

    if (res.success) {
      setRedeemSuccess(
        `¡Canje exitoso! Se descontaron ${pointsRequired} pts por ${selectedProduct.title}.`
      );
      // Actualizar el saldo local del cliente
      selectedClient.balance -= pointsRequired;
      setTimeout(() => {
        setRedeemModalOpen(false);
      }, 1800);
    } else {
      setRedeemError(res.message || "Error desconocido al procesar el canje.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#f5efe6]/40" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-[#c6a96b]/40 rounded-lg leading-5 bg-[#2a1a18] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c6a96b] focus:border-[#c6a96b] sm:text-sm transition-colors"
          placeholder="Buscar por nombre, teléfono o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Clientes */}
      <div className="bg-[#2a1a18] rounded-xl shadow-sm border border-[#c6a96b]/20 overflow-hidden">
        <table className="w-full text-left text-sm text-[#f5efe6]/70">
          <thead className="bg-[#1a0e0d] border-b border-[#c6a96b]/20 text-[#f5efe6]/80 font-semibold">
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
                <td colSpan={4} className="px-6 py-8 text-center text-[#f5efe6]/40">
                  No se encontraron clientes.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-[#c6a96b]/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#f5efe6] font-serif">{client.full_name}</div>
                    <div className="text-xs text-[#f5efe6]/60">{client.email}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#f5efe6]/80">{client.phone}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-[#c6a96b]/20 text-[#c6a96b]">
                      {client.balance} pts
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openHistoryModal(client, "earned")}
                        title="Ver detalle de obtención de puntos"
                        className="p-1.5 text-green-600 hover:bg-green-900/30 rounded-lg transition-colors border border-green-200"
                      >
                        <ArrowDownLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openHistoryModal(client, "redeemed")}
                        title="Ver detalle de canjes realizados"
                        className="p-1.5 text-purple-600 hover:bg-purple-900/30 rounded-lg transition-colors border border-purple-200"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button
                        title="Enviar WhatsApp (Próximamente)"
                        disabled
                        className="p-1.5 text-emerald-600 bg-[#1a0e0d] opacity-40 cursor-not-allowed rounded-lg border border-[#c6a96b]/30"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openRedeemModal(client)}
                        title="Canjear producto por puntos"
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-300 font-medium flex items-center gap-1"
                      >
                        <Gift className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          NUEVO MODAL/PANEL: CATÁLOGO Y CALCULADORA DE PRODUCTOS DE CANJE
      ───────────────────────────────────────────────────────────── */}
      {redeemModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-[#1a0e0d] text-[#f5efe6] rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 relative max-h-[90vh] flex flex-col border-2 border-[#c6a96b]/40">
            {/* Botón Cerrar */}
            <button
              onClick={() => setRedeemModalOpen(false)}
              className="absolute top-5 right-5 text-[#f5efe6]/40 hover:text-[#c6a96b] transition-colors p-1"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Encabezado con datos del cliente */}
            <div className="border-b border-[#c6a96b]/20 pb-4 mb-6">
              <span className="text-xs uppercase tracking-widest text-[#c6a96b] font-semibold flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-[#c6a96b]" /> Mostrador de Canjes Mandorla
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
                <div>
                  <h3 className="text-2xl font-bold font-serif text-[#f5efe6]">
                    {selectedClient.full_name}
                  </h3>
                  <p className="text-xs text-[#f5efe6]/60">
                    {selectedClient.email} {selectedClient.phone ? `· ${selectedClient.phone}` : ""}
                  </p>
                </div>
                <div className="bg-[#2a1a18] px-4 py-2 rounded-2xl border border-[#c6a96b]/30 text-right shrink-0">
                  <span className="text-[10px] text-[#c6a96b] font-semibold uppercase block">Saldo Disponible</span>
                  <span className="text-2xl font-black font-serif text-[#c6a96b]">
                    {selectedClient.balance} <span className="text-xs font-sans text-[#f5efe6]/70">pts</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Mensajes de Feedback */}
            {redeemSuccess && (
              <div className="p-4 rounded-xl bg-green-950/80 border border-green-500/50 text-green-300 text-sm flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-green-400" />
                <span>{redeemSuccess}</span>
              </div>
            )}

            {redeemError && (
              <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-sm flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <span>{redeemError}</span>
              </div>
            )}

            {/* Cuerpo con Scroll: Calculadora y Grilla de Productos */}
            <div className="overflow-y-auto space-y-6 flex-1 pr-1">
              {/* Calculadora Interactiva de Canje */}
              {selectedProduct ? (
                <div className="bg-[#2a1a18] border border-[#c6a96b]/30 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-[#c6a96b]/20 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-[#c6a96b]" />
                      <h4 className="font-bold font-serif text-lg text-[#f5efe6]">
                        Cálculo de Canje: <span className="text-[#c6a96b]">{selectedProduct.title}</span>
                      </h4>
                    </div>
                    {selectedProduct.sku && (
                      <span className="font-mono text-xs font-bold text-[#c6a96b] bg-[#3a2220] px-2 py-0.5 rounded border border-[#c6a96b]/20">
                        SKU: {selectedProduct.sku}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center mb-4">
                    <div className="bg-[#3a2220] p-3 rounded-xl border border-[#c6a96b]/20">
                      <span className="text-[11px] text-[#f5efe6]/60 block mb-0.5">Puntos a Descontar</span>
                      <span className="text-xl font-black font-serif text-[#c6a96b]">
                        -{pointsRequired} pts
                      </span>
                    </div>

                    <div className="bg-[#3a2220] p-3 rounded-xl border border-[#c6a96b]/20">
                      <span className="text-[11px] text-[#f5efe6]/60 block mb-0.5">Puntos Restantes</span>
                      <span
                        className={`text-xl font-black font-serif ${
                          hasEnoughPoints ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {hasEnoughPoints ? remainingBalance : clientBalance} pts
                      </span>
                    </div>

                    <div className="bg-[#3a2220] p-3 rounded-xl border border-[#c6a96b]/20">
                      <span className="text-[11px] text-[#f5efe6]/60 block mb-0.5">Cobrar en Caja ($)</span>
                      <span className="text-xl font-black font-serif text-amber-300">
                        ${additionalMoney.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>

                  {/* Estado / Advertencia */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    {hasEnoughPoints ? (
                      <span className="text-xs text-green-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Puntos suficientes. Al confirmar se descontarán {pointsRequired} pts.
                      </span>
                    ) : (
                      <span className="text-xs text-red-400 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        Puntos insuficientes: le faltan {pointsMissing} pts para este premio.
                      </span>
                    )}

                    <button
                      type="button"
                      disabled={loading || !hasEnoughPoints || !!redeemSuccess}
                      onClick={handleConfirmRedeem}
                      className="w-full sm:w-auto bg-[#c6a96b] hover:bg-[#d8bd80] disabled:opacity-40 text-[#1a0e0d] font-bold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-95 text-xs sm:text-sm"
                    >
                      {loading ? "Procesando canje..." : "Confirmar Canje del Producto"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-[#f5efe6]/50 bg-[#2a1a18] rounded-2xl">
                  No hay productos cargados en el catálogo de canjes.
                </div>
              )}

              {/* Grilla de Selección de Productos */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#c6a96b] uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4" /> Selecciona el Producto a Canjear:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {redemptionProducts.map((product) => {
                    const isSelected = selectedProductId === product.id;
                    const reaches = clientBalance >= product.points_required;

                    return (
                      <div
                        key={product.id}
                        onClick={() => setSelectedProductId(product.id)}
                        className={`bg-[#2a1a18] p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? "border-[#c6a96b] ring-2 ring-[#c6a96b]/40 bg-[#321e1c]"
                            : "border-[#c6a96b]/20 hover:border-[#c6a96b]/50 hover:bg-[#2c1a18]"
                        }`}
                      >
                        <div className="w-16 h-16 rounded-xl bg-[#3a2220] border border-[#c6a96b]/30 flex items-center justify-center overflow-hidden shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Gift className="w-7 h-7 text-[#c6a96b]" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            {product.sku && (
                              <span className="font-mono text-[9px] font-bold text-[#c6a96b] bg-[#3a2220] px-1 py-0.5 rounded">
                                {product.sku}
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                reaches ? "text-green-400 bg-green-950/60" : "text-amber-400 bg-amber-950/60"
                              }`}
                            >
                              {reaches ? "Alcanza" : "Faltan pts"}
                            </span>
                          </div>

                          <h5 className="font-bold text-[#f5efe6] text-sm truncate">{product.title}</h5>

                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-xs font-bold text-[#c6a96b] bg-[#3a2220] px-2 py-0.5 rounded">
                              {product.points_required} pts
                            </span>
                            {Number(product.additional_money) > 0 && (
                              <span className="text-[11px] font-semibold text-amber-300 bg-[#4a2c2a] px-1.5 py-0.5 rounded">
                                + ${Number(product.additional_money).toLocaleString("es-AR")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Historial de Puntos */}
      {historyModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[#2a1a18] rounded-2xl shadow-xl max-w-2xl w-full p-6 relative max-h-[80vh] flex flex-col">
            <button
              onClick={() => setHistoryModalOpen(null)}
              className="absolute top-4 right-4 text-[#f5efe6]/40 hover:text-[#f5efe6] font-serif"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-[#f5efe6] font-serif mb-1">
              {historyModalOpen === "earned" ? "Detalle de Obtención" : "Detalle de Canjes"}
            </h3>
            <p className="text-sm text-[#f5efe6]/60 pb-4 border-b border-[#c6a96b]/20">
              {selectedClient.full_name}
            </p>

            <div className="overflow-y-auto mt-4 space-y-3 flex-1 pr-2">
              {(() => {
                const displayedHistory = selectedClient.history.filter((tx) =>
                  historyModalOpen === "earned" ? tx.amount > 0 : tx.amount < 0
                );

                if (displayedHistory.length === 0) {
                  return <p className="text-[#f5efe6]/60 text-center py-4">No hay registros de este tipo.</p>;
                }

                return displayedHistory.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center p-3 rounded-lg border border-[#c6a96b]/20 bg-[#1a0e0d]"
                  >
                    <div>
                      <p className="font-semibold text-[#f5efe6] font-serif text-sm">
                        {tx.description || "Movimiento general"}
                      </p>
                      <p className="text-xs text-[#f5efe6]/40">{new Date(tx.date).toLocaleString("es-AR")}</p>
                    </div>
                    <div className={`font-black ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount}
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
