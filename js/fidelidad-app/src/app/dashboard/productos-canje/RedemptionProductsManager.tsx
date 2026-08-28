"use client";

import { useState } from "react";
import {
  Gift,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Award,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Tag,
  Eye,
  Power,
  Sparkles,
} from "lucide-react";
import { createRedemptionProduct, updateRedemptionProduct, toggleProductStatus } from "./actions";

export interface RedemptionProduct {
  id: string;
  sku: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  points_required: number;
  additional_money: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export default function RedemptionProductsManager({
  initialProducts,
}: {
  initialProducts: RedemptionProduct[];
}) {
  const [products, setProducts] = useState<RedemptionProduct[]>(initialProducts);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    initialProducts.length > 0 ? initialProducts[0].id : null
  );
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(initialProducts.length === 0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Estado del formulario (para nuevo o edición)
  const [formData, setFormData] = useState<{
    id?: string;
    sku: string;
    title: string;
    description: string;
    image_url: string;
    points_required: number;
    additional_money: number;
    expires_at: string;
    is_active: boolean;
  }>({
    sku: "",
    title: "",
    description: "",
    image_url: "",
    points_required: 10,
    additional_money: 0,
    expires_at: "",
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Producto actualmente seleccionado
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Sincronizar el formulario cuando se selecciona un producto existente
  const handleSelectProduct = (product: RedemptionProduct) => {
    setIsCreatingNew(false);
    setSelectedProductId(product.id);
    setFeedback(null);
    setFormData({
      id: product.id,
      sku: product.sku || "",
      title: product.title,
      description: product.description || "",
      image_url: product.image_url || "",
      points_required: product.points_required,
      additional_money: product.additional_money,
      expires_at: product.expires_at ? product.expires_at.split("T")[0] : "",
      is_active: product.is_active,
    });
  };

  // Iniciar creación de nuevo producto
  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setSelectedProductId(null);
    setFeedback(null);
    setFormData({
      sku: "",
      title: "",
      description: "",
      image_url: "",
      points_required: 15,
      additional_money: 0,
      expires_at: "",
      is_active: true,
    });
  };

  // Filtrado reactivo de productos
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterStatus === "active") return matchesSearch && product.is_active;
    if (filterStatus === "inactive") return matchesSearch && !product.is_active;
    return matchesSearch;
  });

  // Guardar (Crear o Actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const data = new FormData();
    if (formData.id) data.append("id", formData.id);
    data.append("sku", formData.sku);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("image_url", formData.image_url);
    data.append("points_required", formData.points_required.toString());
    data.append("additional_money", formData.additional_money.toString());
    data.append("expires_at", formData.expires_at);
    data.append("is_active", formData.is_active ? "true" : "false");

    const result = isCreatingNew ? await createRedemptionProduct(data) : await updateRedemptionProduct(data);

    setIsSubmitting(false);

    if (result.success) {
      setFeedback({
        type: "success",
        message: isCreatingNew ? "Producto creado exitosamente." : "Producto actualizado correctamente.",
      });

      // Actualizar lista local optimista
      if (isCreatingNew) {
        const newProd: RedemptionProduct = {
          id: Math.random().toString(), // fallback hasta revalidación
          sku: formData.sku || null,
          title: formData.title,
          description: formData.description || null,
          image_url: formData.image_url || null,
          points_required: formData.points_required,
          additional_money: formData.additional_money,
          expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
          is_active: formData.is_active,
          created_at: new Date().toISOString(),
        };
        setProducts([newProd, ...products]);
        setIsCreatingNew(false);
        setSelectedProductId(newProd.id);
      } else {
        setProducts(
          products.map((p) =>
            p.id === formData.id
              ? {
                  ...p,
                  sku: formData.sku || null,
                  title: formData.title,
                  description: formData.description || null,
                  image_url: formData.image_url || null,
                  points_required: formData.points_required,
                  additional_money: formData.additional_money,
                  expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
                  is_active: formData.is_active,
                }
              : p
          )
        );
      }
    } else {
      setFeedback({ type: "error", message: result.message || "Error al procesar la solicitud." });
    }
  };

  // Alternar estado activo / pausado
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await toggleProductStatus(id, currentStatus);
    if (result.success) {
      setProducts(products.map((p) => (p.id === id ? { ...p, is_active: !currentStatus } : p)));
      if (formData.id === id) {
        setFormData({ ...formData, is_active: !currentStatus });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ─────────────────────────────────────────────────────────────
          COLUMNA MASTER (Izquierda): Listado y Filtros (5 cols)
      ───────────────────────────────────────────────────────────── */}
      <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[750px]">
        {/* Cabecera Master */}
        <div className="p-5 border-b border-gray-100 space-y-3.5 bg-gray-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-gray-900 text-lg">Catálogo ({filteredProducts.length})</h2>
            </div>
            <button
              onClick={handleStartCreate}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isCreatingNew
                  ? "bg-blue-700 text-white shadow"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo
            </button>
          </div>

          {/* Buscador */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por SKU o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white"
            />
          </div>

          {/* Filtros de Estado */}
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterStatus === "all" ? "bg-gray-900 text-white" : "bg-gray-200/80 text-gray-600 hover:bg-gray-300"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterStatus === "active" ? "bg-green-600 text-white" : "bg-gray-200/80 text-gray-600 hover:bg-gray-300"
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterStatus("inactive")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterStatus === "inactive" ? "bg-gray-600 text-white" : "bg-gray-200/80 text-gray-600 hover:bg-gray-300"
              }`}
            >
              Pausados
            </button>
          </div>
        </div>

        {/* Lista con scroll */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-1">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              No se encontraron productos en el catálogo.
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isSelected = !isCreatingNew && selectedProductId === product.id;
              const isExpired = product.expires_at && new Date(product.expires_at) < new Date();

              return (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border text-left ${
                    isSelected
                      ? "bg-blue-50/80 border-blue-300 shadow-sm"
                      : "bg-white hover:bg-gray-50 border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Miniatura de Imagen */}
                    <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <Gift className="w-6 h-6 text-gray-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        {product.sku && (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            <Tag className="w-2.5 h-2.5" />
                            {product.sku}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            !product.is_active
                              ? "bg-gray-100 text-gray-600"
                              : isExpired
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {!product.is_active ? "Pausado" : isExpired ? "Expirado" : "Activo"}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-sm truncate">{product.title}</h3>

                      {/* Esquema de Puntos + $ Dinero */}
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          {product.points_required} pts
                        </span>
                        {product.additional_money > 0 && (
                          <span className="font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            + ${Number(product.additional_money).toLocaleString("es-AR")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          COLUMNA DETAIL (Derecha): Formulario y Previsualización (7 cols)
      ───────────────────────────────────────────────────────────── */}
      <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              {isCreatingNew ? "Nuevo Producto de Canje" : "Detalle y Edición"}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              {isCreatingNew ? "Alta de Recompensa" : formData.title || "Sin título"}
            </h2>
          </div>

          {!isCreatingNew && formData.id && (
            <button
              type="button"
              onClick={() => handleToggleStatus(formData.id!, formData.is_active)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                formData.is_active
                  ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                  : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {formData.is_active ? "Pausar Producto" : "Activar Producto"}
            </button>
          )}
        </div>

        {/* Mensaje de feedback */}
        {feedback && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2.5 ${
              feedback.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle className="w-5 h-5 shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Previsualización de Imagen */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-24 rounded-xl bg-white border border-gray-300 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              {formData.image_url ? (
                <img
                  src={formData.image_url}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-300" />
              )}
            </div>
            <div className="flex-1 w-full space-y-2">
              <div>
                <label htmlFor="image_url" className="block text-xs font-semibold text-gray-700 mb-1">
                  Foto / Imagen del Producto (URL o Ruta Local)
                </label>
                <input
                  id="image_url"
                  type="text"
                  placeholder="Ej. /img/caja alfajores.jpeg o https://..."
                  value={formData.image_url}
                  onChange={(e) => {
                    let val = e.target.value.trim();
                    // Normalización inteligente: si pega ruta absoluta de disco C:\...\img\foto.jpg -> /img/foto.jpg
                    if (val.includes("img\\") || val.includes("img/")) {
                      const fileName = val.split(/[\\\/]/).pop();
                      if (fileName) val = `/img/${fileName}`;
                    }
                    setFormData({ ...formData, image_url: val });
                  }}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white font-mono"
                />
              </div>

              {/* Selector Rápido de Fotos Locales */}
              <div>
                <span className="text-[11px] font-semibold text-gray-500 block mb-1.5">
                  Galería local de productos (haz clic para asignar):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Caja Alfajores", path: "/img/caja alfajores.jpeg" },
                    { label: "Chocolate Blanco", path: "/img/Chocolate Blanco.jpeg" },
                    { label: "Limoncello", path: "/img/Limoncello.jpeg" },
                    { label: "Desayuno Simple", path: "/img/Desayuno simple.jpeg" },
                    { label: "Desayuno Grande", path: "/img/desayuno_grande.jpg" },
                  ].map((imgItem) => (
                    <button
                      key={imgItem.path}
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: imgItem.path })}
                      className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-all ${
                        formData.image_url === imgItem.path
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                      }`}
                    >
                      {imgItem.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fila 1: SKU y Título */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="sku" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Código SKU
              </label>
              <input
                id="sku"
                type="text"
                placeholder="Ej. ALF-TRIP-01"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm font-mono rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Título del Producto / Recompensa <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                placeholder="Ej. Caja x 6 Alfajores Artesanales"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Descripción del Canje
            </label>
            <textarea
              id="description"
              rows={2}
              placeholder="Detalla qué incluye el premio o sabores disponibles..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
          </div>

          {/* Fila 2: Puntos, $ Dinero Adicional y Fecha de Caducidad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div>
              <label htmlFor="points_required" className="block text-xs font-bold text-blue-950 uppercase mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                Puntos Requeridos <span className="text-red-500">*</span>
              </label>
              <input
                id="points_required"
                type="number"
                min="0"
                required
                value={formData.points_required}
                onChange={(e) =>
                  setFormData({ ...formData, points_required: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3.5 py-2 text-sm font-bold text-blue-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none bg-white"
              />
            </div>

            <div>
              <label htmlFor="additional_money" className="block text-xs font-bold text-blue-950 uppercase mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                $ Dinero Adicional
              </label>
              <input
                id="additional_money"
                type="number"
                min="0"
                step="50"
                placeholder="0"
                value={formData.additional_money}
                onChange={(e) =>
                  setFormData({ ...formData, additional_money: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 text-sm font-bold text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none bg-white"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Coloca 0 si el canje es 100% en puntos.
              </span>
            </div>

            <div>
              <label htmlFor="expires_at" className="block text-xs font-bold text-blue-950 uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-600" />
                Fecha de Caducidad
              </label>
              <input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none bg-white text-gray-700"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Dejar vacío si no tiene vencimiento.
              </span>
            </div>
          </div>

          {/* Resumen del Valor del Canje */}
          <div className="bg-gray-100 p-4 rounded-xl flex items-center justify-between text-xs">
            <span className="text-gray-600 font-medium">Esquema para el cliente:</span>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-blue-900">
                {formData.points_required} Puntos
              </span>
              {formData.additional_money > 0 && (
                <span className="font-extrabold text-sm text-amber-800">
                  + ${Number(formData.additional_money).toLocaleString("es-AR")}
                </span>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            {isCreatingNew && initialProducts.length > 0 && (
              <button
                type="button"
                onClick={() => handleSelectProduct(initialProducts[0])}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting ? "Guardando..." : isCreatingNew ? "Crear Producto" : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
