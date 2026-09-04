"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Edit2, Trash2, Layers, AlertCircle, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  min_points: number;
  description: string;
  color_theme: string;
  is_active: boolean;
  productCount?: number;
}

const colorThemes = [
  { value: "gray", label: "Plata", bg: "bg-gray-800/60", text: "text-gray-300", border: "border-gray-600/50", accent: "bg-gray-400" },
  { value: "blue", label: "Zafiro", bg: "bg-blue-900/40", text: "text-blue-300", border: "border-blue-800/50", accent: "bg-blue-500" },
  { value: "green", label: "Esmeralda", bg: "bg-emerald-900/40", text: "text-emerald-300", border: "border-emerald-800/50", accent: "bg-emerald-500" },
  { value: "yellow", label: "Oro (Premium)", bg: "bg-[#c6a96b]/20", text: "text-[#c6a96b]", border: "border-[#c6a96b]/40", accent: "bg-[#c6a96b]" },
  { value: "purple", label: "Amatista", bg: "bg-purple-900/40", text: "text-purple-300", border: "border-purple-800/50", accent: "bg-purple-500" },
];

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    min_points: 0,
    description: "",
    color_theme: "blue"
  });

  const openModal = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({
        name: cat.name,
        min_points: cat.min_points,
        description: cat.description || "",
        color_theme: cat.color_theme || "blue"
      });
    } else {
      setEditingCat(null);
      setFormData({
        name: "",
        min_points: 0,
        description: "",
        color_theme: "blue"
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCat(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingCat) {
        // Edit
        const { error } = await supabase
          .from("reward_categories")
          .update({
            name: formData.name,
            min_points: formData.min_points,
            description: formData.description,
            color_theme: formData.color_theme
          })
          .eq("id", editingCat.id);
          
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from("reward_categories")
          .insert([{
            name: formData.name,
            min_points: formData.min_points,
            description: formData.description,
            color_theme: formData.color_theme
          }]);
          
        if (error) throw error;
      }
      
      closeModal();
      router.refresh();
      // Refrescamos localmente temporalmente (idealmente depender del server components)
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Hubo un error al guardar la categoría.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la categoría "${name}"? Los premios se reasignarán automáticamente a la categoría anterior.`)) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("reward_categories")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      router.refresh();
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Hubo un error al eliminar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => openModal()}
          className="bg-[#c6a96b] hover:bg-[#d8bd80] text-[#1a0e0d] px-4 py-2 rounded-lg font-bold flex items-center transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-full bg-[#2a1a18] rounded-xl border border-dashed border-[#c6a96b]/30 p-12 text-center">
            <Layers className="w-12 h-12 text-[#c6a96b]/50 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-[#f5efe6]">Sin categorías</h3>
            <p className="text-[#f5efe6]/60 mt-1">Crea niveles para agrupar tus premios.</p>
          </div>
        ) : (
          categories.map((cat, idx) => {
            const theme = colorThemes.find(t => t.value === cat.color_theme) || colorThemes[0];
            const isFirst = idx === 0;
            
            return (
              <div key={cat.id} className={`bg-[#2a1a18] rounded-2xl shadow-xl border ${theme.border} p-6 flex flex-col relative overflow-hidden group hover:shadow-2xl hover:border-[#c6a96b]/50 transition-all`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${theme.accent}`} />
                
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${theme.bg} ${theme.text} inline-flex items-center`}>
                    <Layers className="w-3 h-3 mr-1.5" />
                    {cat.name}
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(cat)} className="p-1.5 text-[#f5efe6]/40 hover:text-[#c6a96b] hover:bg-[#c6a96b]/10 rounded-md transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!isFirst && (
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-[#f5efe6]/40 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-3xl font-black text-[#c6a96b] font-serif">{cat.min_points}</span>
                  <span className="text-[#f5efe6]/60 ml-1 font-medium">pts mín.</span>
                </div>
                
                <p className="text-sm text-[#f5efe6]/70 flex-1">{cat.description || "Sin descripción"}</p>
                
                <div className="mt-6 pt-4 border-t border-[#c6a96b]/10 flex items-center justify-between text-sm">
                  <span className="text-[#f5efe6]/50">Premios en este nivel:</span>
                  <span className="font-bold text-[#1a0e0d] bg-[#c6a96b] px-2 py-0.5 rounded-md">{cat.productCount}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal ABM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#2a1a18] rounded-2xl shadow-2xl border border-[#c6a96b]/20 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-[#c6a96b]/20 flex justify-between items-center bg-[#1a0e0d]">
              <h3 className="text-lg font-bold text-[#c6a96b] font-serif">
                {editingCat ? "Editar Categoría" : "Nueva Categoría"}
              </h3>
              <button onClick={closeModal} className="text-[#f5efe6]/50 hover:text-[#f5efe6] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#f5efe6]/80 mb-1">Nombre del Nivel</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-[#1a0e0d] text-[#f5efe6] border border-[#c6a96b]/30 rounded-lg focus:ring-2 focus:ring-[#c6a96b] focus:border-[#c6a96b] outline-none transition-all placeholder:text-[#f5efe6]/30"
                  placeholder="Ej: Oro, Premium, VIP..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#f5efe6]/80 mb-1">Puntos Mínimos Requeridos</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={formData.min_points}
                  onChange={e => setFormData({...formData, min_points: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-[#1a0e0d] text-[#f5efe6] border border-[#c6a96b]/30 rounded-lg focus:ring-2 focus:ring-[#c6a96b] focus:border-[#c6a96b] outline-none transition-all"
                />
                <p className="text-xs text-[#f5efe6]/50 mt-1">Cualquier premio que cueste estos puntos o más pertenecerá a esta categoría.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#f5efe6]/80 mb-1">Color / Tema</label>
                <div className="grid grid-cols-5 gap-2">
                  {colorThemes.map(theme => (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => setFormData({...formData, color_theme: theme.value})}
                      className={`h-10 rounded-lg flex items-center justify-center border-2 transition-all ${theme.bg} ${formData.color_theme === theme.value ? 'border-[#c6a96b] shadow-[0_0_10px_rgba(198,169,107,0.3)]' : 'border-transparent hover:border-[#c6a96b]/50'}`}
                      title={theme.label}
                    >
                      {formData.color_theme === theme.value && <Check className={`w-5 h-5 ${theme.text}`} />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#f5efe6]/80 mb-1">Descripción corta (Opcional)</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-[#1a0e0d] text-[#f5efe6] border border-[#c6a96b]/30 rounded-lg focus:ring-2 focus:ring-[#c6a96b] focus:border-[#c6a96b] outline-none transition-all resize-none placeholder:text-[#f5efe6]/30"
                  placeholder="Beneficios exclusivos de este nivel..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-[#f5efe6]/70 font-medium hover:bg-[#c6a96b]/10 hover:text-[#c6a96b] rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-[#c6a96b] hover:bg-[#d8bd80] text-[#1a0e0d] font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
