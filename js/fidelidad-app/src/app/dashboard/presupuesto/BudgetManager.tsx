"use client";

import { useState } from "react";
import { setPointBudget } from "./actions";

interface Budget {
  id: string;
  budget_type: string;
  total_points: number;
  start_date: string | null;
  end_date: string | null;
}

export default function BudgetManager({ currentBudget }: { currentBudget: Budget | null }) {
  const [budgetType, setBudgetType] = useState(currentBudget?.budget_type || "none");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    const formData = new FormData(e.currentTarget);
    const res = await setPointBudget(formData);
    
    setLoading(false);
    if (res.success) {
      setMessage("Presupuesto guardado exitosamente.");
    } else {
      setMessage("Error al guardar: " + res.message);
    }
  };

  const showPointsField = budgetType === "fixed_bag" || budgetType === "both";
  const showDateFields = budgetType === "date_range" || budgetType === "both";

  return (
    <div className="bg-[#2a1a18] p-6 rounded-xl shadow-sm border border-[#c6a96b]/20">
      <h2 className="text-xl font-bold text-[#f5efe6] font-serif mb-6">Configuración Actual</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[#f5efe6]/80 mb-2">Modo de Presupuesto</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-colors ${budgetType === 'date_range' ? 'border-[#c6a96b] bg-[#c6a96b]/10' : 'border-[#c6a96b]/30 hover:bg-[#1a0e0d]'}`}>
              <input type="radio" name="budget_type" value="date_range" checked={budgetType === 'date_range'} onChange={() => setBudgetType('date_range')} className="mt-1 mr-3 text-[#c6a96b]" />
              <div>
                <span className="block font-medium text-[#f5efe6] font-serif">Por Fechas</span>
                <span className="text-sm text-[#f5efe6]/60">Límite establecido por un rango de fechas.</span>
              </div>
            </label>

            <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-colors ${budgetType === 'fixed_bag' ? 'border-[#c6a96b] bg-[#c6a96b]/10' : 'border-[#c6a96b]/30 hover:bg-[#1a0e0d]'}`}>
              <input type="radio" name="budget_type" value="fixed_bag" checked={budgetType === 'fixed_bag'} onChange={() => setBudgetType('fixed_bag')} className="mt-1 mr-3 text-[#c6a96b]" />
              <div>
                <span className="block font-medium text-[#f5efe6] font-serif">Por Bolsa (Monto)</span>
                <span className="text-sm text-[#f5efe6]/60">Bolsa global de puntos sin restricciones de fecha.</span>
              </div>
            </label>

            <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-colors ${budgetType === 'both' ? 'border-[#c6a96b] bg-[#c6a96b]/10' : 'border-[#c6a96b]/30 hover:bg-[#1a0e0d]'}`}>
              <input type="radio" name="budget_type" value="both" checked={budgetType === 'both'} onChange={() => setBudgetType('both')} className="mt-1 mr-3 text-[#c6a96b]" />
              <div>
                <span className="block font-medium text-[#f5efe6] font-serif">Ambas</span>
                <span className="text-sm text-[#f5efe6]/60">Bolsa de puntos acotada por rango de fechas.</span>
              </div>
            </label>

            <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-colors ${budgetType === 'none' ? 'border-[#c6a96b] bg-[#c6a96b]/10' : 'border-[#c6a96b]/30 hover:bg-[#1a0e0d]'}`}>
              <input type="radio" name="budget_type" value="none" checked={budgetType === 'none'} onChange={() => setBudgetType('none')} className="mt-1 mr-3 text-[#c6a96b]" />
              <div>
                <span className="block font-medium text-[#f5efe6] font-serif">Ninguna</span>
                <span className="text-sm text-[#f5efe6]/60">Puntos ilimitados. Sin validaciones.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#c6a96b]/20">
          {showPointsField && (
            <div>
              <label className="block text-sm font-medium text-[#f5efe6]/80 mb-1">Cantidad Total de Puntos de la Bolsa</label>
              <input 
                type="number" 
                name="total_points" 
                required 
                min="0"
                defaultValue={currentBudget?.total_points || 0}
                className="w-full sm:w-1/2 px-4 py-2 rounded-lg border border-[#c6a96b]/40 focus:ring-2 focus:ring-[#c6a96b] outline-none" 
              />
            </div>
          )}

          {showDateFields && (
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-[#f5efe6]/80 mb-1">Fecha de Inicio</label>
                <input 
                  type="date" 
                  name="start_date" 
                  required
                  defaultValue={currentBudget?.start_date ? currentBudget.start_date.substring(0, 10) : ""}
                  className="w-full px-4 py-2 rounded-lg border border-[#c6a96b]/40 focus:ring-2 focus:ring-[#c6a96b] outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#f5efe6]/80 mb-1">Fecha de Fin</label>
                <input 
                  type="date" 
                  name="end_date" 
                  required
                  defaultValue={currentBudget?.end_date ? currentBudget.end_date.substring(0, 10) : ""}
                  className="w-full px-4 py-2 rounded-lg border border-[#c6a96b]/40 focus:ring-2 focus:ring-[#c6a96b] outline-none" 
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-6 mt-6 border-t border-[#c6a96b]/20">
          <button 
            disabled={loading} 
            type="submit" 
            className="bg-[#c6a96b] text-[#1a0e0d] hover:bg-[#d8bd80] disabled:opacity-50 text-white font-bold py-2 px-8 rounded-lg transition-colors"
          >
            {loading ? "Guardando..." : "Guardar Configuración"}
          </button>
          
          {message && (
            <span className={`text-sm font-medium ${message.includes("Error") ? "text-red-500" : "text-green-600"}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
