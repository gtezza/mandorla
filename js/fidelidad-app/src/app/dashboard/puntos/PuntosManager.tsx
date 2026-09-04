"use client";

import { useState, useRef } from "react";
import { addPromotionPoint, generateQRToken } from "./actions";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Plus, Download, X } from "lucide-react";

interface Punto {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  created_at: string;
}

export default function PuntosManager({ initialPuntos }: { initialPuntos: Punto[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Modal de QR
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [selectedPuntoName, setSelectedPuntoName] = useState("");
  const qrRef = useRef<SVGSVGElement>(null);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await addPromotionPoint(formData);
    setLoading(false);
    if (res.success) {
      setIsAdding(false);
    } else {
      alert("Error al agregar: " + res.message);
    }
  };

  const handleShowQR = async (punto: Punto) => {
    setLoading(true);
    const res = await generateQRToken(punto.id);
    setLoading(false);
    
    if (res.success && res.token) {
      setQrToken(res.token);
      setSelectedPuntoName(punto.name);
      setQrModalOpen(true);
    } else {
      alert("Error al generar QR: " + res.message);
    }
  };

  const downloadQR = () => {
    if (!qrRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // Configuramos el tamaño del canvas con padding blanco
      const padding = 40;
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2;
      
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, padding, padding);
      }
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${selectedPuntoName.replace(/\s+/g, '_')}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const getQRUrl = () => {
    // URL completa para reclamar los puntos (suponiendo que la app está en fidelidad.gtdata.com.ar)
    // En un entorno dinámico se podría usar window.location.origin
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://fidelidad.gtdata.com.ar";
    return `${baseUrl}/reclamar?token=${qrToken}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-[#c6a96b] text-[#1a0e0d] hover:bg-[#d8bd80] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          {isAdding ? "Cancelar" : "Nuevo Punto de Promoción"}
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#2a1a18] p-6 rounded-xl shadow-sm border border-[#c6a96b]/20">
          <h2 className="text-xl font-bold text-[#f5efe6] font-serif mb-4">Registrar Nuevo Punto</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#f5efe6]/80 mb-1">Nombre de Fantasía</label>
              <input name="name" required className="w-full px-4 py-2 rounded-lg border border-[#c6a96b]/40 focus:ring-2 focus:ring-[#c6a96b] outline-none" placeholder="Ej. Local Centro" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#f5efe6]/80 mb-1">Dirección</label>
              <input name="address" required className="w-full px-4 py-2 rounded-lg border border-[#c6a96b]/40 focus:ring-2 focus:ring-[#c6a96b] outline-none" placeholder="Ej. Av. San Martín 123" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#f5efe6]/80 mb-1">Teléfono</label>
              <input name="phone" required className="w-full px-4 py-2 rounded-lg border border-[#c6a96b]/40 focus:ring-2 focus:ring-[#c6a96b] outline-none" placeholder="Ej. +54 9 11 1234-5678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#f5efe6]/80 mb-1">Nombre del Encargado</label>
              <input name="manager" required className="w-full px-4 py-2 rounded-lg border border-[#c6a96b]/40 focus:ring-2 focus:ring-[#c6a96b] outline-none" placeholder="Ej. Juan Pérez" />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button disabled={loading} type="submit" className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                {loading ? "Guardando..." : "Guardar Punto"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#2a1a18] rounded-xl shadow-sm border border-[#c6a96b]/20 overflow-hidden">
        <table className="w-full text-left text-sm text-[#f5efe6]/70">
          <thead className="bg-[#1a0e0d] border-b border-[#c6a96b]/20 text-[#f5efe6]/80 font-semibold">
            <tr>
              <th className="px-6 py-4">Punto de Venta</th>
              <th className="px-6 py-4">Dirección</th>
              <th className="px-6 py-4">Contacto / Encargado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {initialPuntos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[#f5efe6]/40">
                  No hay puntos de promoción registrados.
                </td>
              </tr>
            ) : (
              initialPuntos.map((punto) => (
                <tr key={punto.id} className="hover:bg-[#c6a96b]/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-[#f5efe6] font-serif">{punto.name}</td>
                  <td className="px-6 py-4">{punto.address}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>{punto.manager}</span>
                      <span className="text-xs text-[#f5efe6]/40">{punto.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleShowQR(punto)}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#c6a96b]/20 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                      Obtener QR
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal del QR */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[#2a1a18] rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
            <button 
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 text-[#f5efe6]/40 hover:text-[#f5efe6] font-serif transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[#f5efe6] font-serif">QR de Promoción</h3>
              <p className="text-sm text-[#f5efe6]/60 mt-1">{selectedPuntoName}</p>
            </div>

            <div className="flex justify-center bg-[#1a0e0d] p-6 rounded-xl border border-[#c6a96b]/20 mb-6">
              <QRCodeSVG 
                value={getQRUrl()} 
                size={220} 
                level="H" 
                includeMargin={true}
                ref={qrRef}
              />
            </div>

            <button 
              onClick={downloadQR}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              Descargar Imagen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
