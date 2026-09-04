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
  { value: "gray", label: "Gris (Base)", bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
  { value: "blue", label: "Azul (Básico)", bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  { value: "green", label: "Verde (Regular)", bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  { value: "yellow", label: "Dorado (Premium)", bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
  { value: "purple", label: "Púrpura (Elite)", bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Sin categorías</h3>
            <p className="text-gray-500 mt-1">Crea niveles para agrupar tus premios.</p>
          </div>
        ) : (
          categories.map((cat, idx) => {
            const theme = colorThemes.find(t => t.value === cat.color_theme) || colorThemes[0];
            const isFirst = idx === 0;
            
            return (
              <div key={cat.id} className={`bg-white rounded-2xl shadow-sm border ${theme.border} p-6 flex flex-col relative overflow-hidden group hover:shadow-md transition-all`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${theme.bg.replace('100', '500')}`} />
                
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${theme.bg} ${theme.text} inline-flex items-center`}>
                    <Layers className="w-3 h-3 mr-1.5" />
                    {cat.name}
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(cat)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!isFirst && (
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-3xl font-black text-gray-900">{cat.min_points}</span>
                  <span className="text-gray-500 ml-1 font-medium">pts mín.</span>
                </div>
                
                <p className="text-sm text-gray-600 flex-1">{cat.description || "Sin descripción"}</p>
                
                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Premios en este nivel:</span>
                  <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{cat.productCount}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal ABM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingCat ? "Editar Categoría" : "Nueva Categoría"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Nivel</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ej: Oro, Premium, VIP..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Puntos Mínimos Requeridos</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={formData.min_points}
                  onChange={e => setFormData({...formData, min_points: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Cualquier premio que cueste estos puntos o más pertenecerá a esta categoría.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color / Tema</label>
                <div className="grid grid-cols-5 gap-2">
                  {colorThemes.map(theme => (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => setFormData({...formData, color_theme: theme.value})}
                      className={`h-10 rounded-lg flex items-center justify-center border-2 transition-all ${theme.bg} ${formData.color_theme === theme.value ? 'border-blue-600 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-300'}`}
                      title={theme.label}
                    >
                      {formData.color_theme === theme.value && <Check className={`w-5 h-5 ${theme.text}`} />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción corta (Opcional)</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="Beneficios exclusivos de este nivel..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
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
