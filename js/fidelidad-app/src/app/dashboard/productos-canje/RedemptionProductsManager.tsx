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
  Upload,
  X,
  Layers,
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

export interface Category {
  id: string;
  name: string;
  min_points: number;
  color_theme: string;
}

export default function RedemptionProductsManager({
  initialProducts,
  categories = [],
}: {
  initialProducts: RedemptionProduct[];
  categories?: Category[];
}) {
  const [products, setProducts] = useState<RedemptionProduct[]>(initialProducts);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    initialProducts.length > 0 ? initialProducts[0].id : null
  );
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(initialProducts.length === 0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const getCategoryForPoints = (points: number) => {
    if (!categories || categories.length === 0) return null;
    let matchedCategory = categories[0];
    for (const cat of categories) {
      if (points >= cat.min_points) matchedCategory = cat;
      else break;
    }
    return matchedCategory;
  };

  const getThemeClasses = (color: string) => {
    const themes: Record<string, string> = {
      gray: "bg-gray-800/60 text-gray-300 border-gray-600/50",
      blue: "bg-blue-900/40 text-blue-300 border-blue-800/50",
      green: "bg-emerald-900/40 text-emerald-300 border-emerald-800/50",
      yellow: "bg-[#c6a96b]/20 text-[#c6a96b] border-[#c6a96b]/40",
      purple: "bg-purple-900/40 text-purple-300 border-purple-800/50",
    };
    return themes[color] || themes.gray;
  };

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

    const shouldCreate = isCreatingNew || !formData.id;
    const result = shouldCreate ? await createRedemptionProduct(data) : await updateRedemptionProduct(data);

    setIsSubmitting(false);

    if (result.success) {
      setFeedback({
        type: "success",
        message: shouldCreate ? "Producto creado exitosamente." : "Producto actualizado correctamente.",
      });

      // Actualizar lista local con el producto real
      if (shouldCreate && result.product) {
        const createdProd = result.product as RedemptionProduct;
        setProducts([createdProd, ...products]);
        setIsCreatingNew(false);
        setSelectedProductId(createdProd.id);
        setFormData({
          id: createdProd.id,
          sku: createdProd.sku || "",
          title: createdProd.title,
          description: createdProd.description || "",
          image_url: createdProd.image_url || "",
          points_required: createdProd.points_required,
          additional_money: createdProd.additional_money,
          expires_at: createdProd.expires_at ? createdProd.expires_at.split("T")[0] : "",
          is_active: createdProd.is_active,
        });
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

  // Manejador para carga de imagen desde computadora local (cualquier directorio)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", message: "Por favor, selecciona un archivo de imagen válido." });
      return;
    }

    // Límite de 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: "error", message: "La imagen no debe superar los 5MB." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormData((prev) => ({ ...prev, image_url: reader.result as string }));
        setFeedback({ type: "success", message: `Imagen "${file.name}" cargada localmente con éxito.` });
      }
    };
    reader.onerror = () => {
      setFeedback({ type: "error", message: "Error al leer la imagen seleccionada." });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ─────────────────────────────────────────────────────────────
          COLUMNA MASTER (Izquierda): Listado y Filtros (5 cols)
      ───────────────────────────────────────────────────────────── */}
      <div className="lg:col-span-5 bg-[#2a1a18] rounded-2xl shadow-xl border border-[#c6a96b]/20 overflow-hidden flex flex-col h-[750px]">
        {/* Cabecera Master */}
        <div className="p-5 border-b border-[#c6a96b]/10 space-y-3.5 bg-[#1a0e0d]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#c6a96b]" />
              <h2 className="font-bold text-[#f5efe6] text-lg font-serif">Catálogo ({filteredProducts.length})</h2>
            </div>
            <button
              onClick={handleStartCreate}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isCreatingNew
                  ? "bg-[#c6a96b] text-[#1a0e0d] shadow"
                  : "bg-[#1a0e0d] border border-[#c6a96b]/50 text-[#c6a96b] hover:bg-[#c6a96b]/10 shadow-sm"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo
            </button>
          </div>

          {/* Buscador */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#f5efe6]/40 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por SKU o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#c6a96b]/20 text-xs text-[#f5efe6] focus:ring-2 focus:ring-[#c6a96b] focus:border-transparent outline-none bg-[#2a1a18] placeholder:text-[#f5efe6]/30"
            />
          </div>

          {/* Filtros de Estado */}
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors border ${
                filterStatus === "all" ? "bg-[#c6a96b] text-[#1a0e0d] border-[#c6a96b]" : "bg-[#1a0e0d] text-[#f5efe6]/70 border-[#c6a96b]/30 hover:border-[#c6a96b]/60"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors border ${
                filterStatus === "active" ? "bg-green-600/20 text-green-400 border-green-500/50" : "bg-[#1a0e0d] text-[#f5efe6]/70 border-[#c6a96b]/30 hover:border-[#c6a96b]/60"
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterStatus("inactive")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors border ${
                filterStatus === "inactive" ? "bg-red-600/20 text-red-400 border-red-500/50" : "bg-[#1a0e0d] text-[#f5efe6]/70 border-[#c6a96b]/30 hover:border-[#c6a96b]/60"
              }`}
            >
              Pausados
            </button>
          </div>
        </div>

        {/* Lista con scroll */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#c6a96b]/10 p-2 space-y-1">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-[#f5efe6]/40 text-xs">
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
                      ? "bg-[#c6a96b]/10 border-[#c6a96b] shadow-sm"
                      : "bg-[#1a0e0d] hover:bg-[#c6a96b]/5 border-transparent"
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

                      {/* Esquema de Puntos + $ Dinero + Categoría */}
                      <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                        {(() => {
                          const cat = getCategoryForPoints(product.points_required);
                          if (!cat) return null;
                          return (
                            <span className={`font-bold px-2 py-0.5 rounded border ${getThemeClasses(cat.color_theme)} flex items-center gap-1`}>
                              <Layers className="w-3 h-3" />
                              {cat.name}
                            </span>
                          );
                        })()}
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
      <div className="lg:col-span-7 bg-[#2a1a18] rounded-2xl shadow-xl border border-[#c6a96b]/20 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#c6a96b]/10 mb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#c6a96b]">
              {isCreatingNew ? "Nuevo Producto de Canje" : "Detalle y Edición"}
            </span>
            <h2 className="text-2xl font-bold text-[#f5efe6] mt-1 font-serif">
              {isCreatingNew ? "Alta de Recompensa" : formData.title || "Sin título"}
            </h2>
          </div>

          {!isCreatingNew && formData.id && (
            <button
              type="button"
              onClick={() => handleToggleStatus(formData.id!, formData.is_active)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                formData.is_active
                  ? "bg-red-900/30 text-red-400 hover:bg-red-900/50 border-red-800/50"
                  : "bg-green-900/30 text-green-400 hover:bg-green-900/50 border-green-800/50"
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
          {/* Previsualización y Carga de Imagen */}
          <div className="bg-[#1a0e0d] border border-[#c6a96b]/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Contenedor de Vista Previa con botón para remover */}
            <div className="relative w-28 h-28 rounded-xl bg-[#2a1a18] border border-[#c6a96b]/30 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group">
              {formData.image_url ? (
                <>
                  <img
                    src={formData.image_url}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: "" })}
                    title="Eliminar imagen"
                    className="absolute top-1 right-1 p-1 bg-red-600/80 text-white rounded-full hover:bg-red-500 transition-colors shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-[#f5efe6]/40 gap-1 p-2 text-center">
                  <ImageIcon className="w-8 h-8 text-[#c6a96b]/30" />
                  <span className="text-[10px] leading-tight">Sin imagen</span>
                </div>
              )}
            </div>

            <div className="flex-1 w-full space-y-3">
              {/* Botón Principal: Cargar desde Computadora Local */}
              <div>
                <label className="block text-xs font-semibold text-[#f5efe6]/80 mb-1">
                  Cargar foto local
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-[#2a1a18] border border-[#c6a96b]/40 hover:bg-[#c6a96b]/10 text-[#c6a96b] rounded-lg text-xs font-semibold transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Seleccionar imagen...</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-[#f5efe6]/40">
                    Soporta JPG, PNG, WEBP (hasta 5MB)
                  </span>
                </div>
              </div>

              {/* Opción Manual: URL o Ruta */}
              <div>
                <label htmlFor="image_url" className="block text-[11px] font-medium text-[#f5efe6]/50 mb-1">
                  O introduce una URL / Ruta web manual:
                </label>
                <input
                  id="image_url"
                  type="text"
                  placeholder="Ej. /img/caja alfajores.jpeg o https://..."
                  value={formData.image_url.startsWith("data:") ? "Imagen local cargada (Base64)" : formData.image_url}
                  onChange={(e) => {
                    let val = e.target.value.trim();
                    if (val.includes("img\\") || val.includes("img/")) {
                      const fileName = val.split(/[\\\/]/).pop();
                      if (fileName) val = `/img/${fileName}`;
                    }
                    setFormData({ ...formData, image_url: val });
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#c6a96b]/30 focus:ring-2 focus:ring-[#c6a96b] focus:border-transparent outline-none bg-[#2a1a18] text-[#f5efe6] font-mono placeholder:text-[#f5efe6]/30"
                />
              </div>

              {/* Selector Rápido de Fotos Predeterminadas */}
              <div>
                <span className="text-[11px] font-semibold text-[#f5efe6]/50 block mb-1">
                  Galería predeterminada:
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
                          ? "bg-[#c6a96b] text-[#1a0e0d] border-[#c6a96b] shadow-sm"
                          : "bg-[#2a1a18] text-[#f5efe6]/70 border-[#c6a96b]/30 hover:border-[#c6a96b]/60"
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
              <label htmlFor="sku" className="block text-xs font-bold text-[#f5efe6]/70 uppercase mb-1">
                Código SKU
              </label>
              <input
                id="sku"
                type="text"
                placeholder="Ej. ALF-TRIP-01"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm font-mono rounded-lg border border-[#c6a96b]/30 bg-[#1a0e0d] text-[#f5efe6] focus:ring-2 focus:ring-[#c6a96b] focus:border-transparent outline-none placeholder:text-[#f5efe6]/30"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-xs font-bold text-[#f5efe6]/70 uppercase mb-1">
                Título del Producto / Recompensa <span className="text-[#c6a96b]">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                placeholder="Ej. Caja x 6 Alfajores Artesanales"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#c6a96b]/30 bg-[#1a0e0d] text-[#f5efe6] focus:ring-2 focus:ring-[#c6a96b] focus:border-transparent outline-none placeholder:text-[#f5efe6]/30"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-xs font-bold text-[#f5efe6]/70 uppercase mb-1">
              Descripción del Canje
            </label>
            <textarea
              id="description"
              rows={2}
              placeholder="Detalla qué incluye el premio o sabores disponibles..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#c6a96b]/30 bg-[#1a0e0d] text-[#f5efe6] focus:ring-2 focus:ring-[#c6a96b] focus:border-transparent outline-none placeholder:text-[#f5efe6]/30"
            />
          </div>

          {/* Fila 2: Puntos, $ Dinero Adicional y Fecha de Caducidad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#1a0e0d] p-4 rounded-xl border border-[#c6a96b]/20">
            <div>
              <label htmlFor="points_required" className="block text-xs font-bold text-[#c6a96b] uppercase mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Puntos Requeridos <span className="text-[#c6a96b]">*</span>
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
                className="w-full px-3.5 py-2 text-sm font-bold text-[#f5efe6] rounded-lg border border-[#c6a96b]/30 bg-[#2a1a18] focus:ring-2 focus:ring-[#c6a96b] outline-none"
              />
            </div>

            <div>
              <label htmlFor="additional_money" className="block text-xs font-bold text-[#c6a96b]/80 uppercase mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#c6a96b]" />
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
                className="w-full px-3.5 py-2 text-sm font-bold text-[#f5efe6] rounded-lg border border-[#c6a96b]/30 bg-[#2a1a18] focus:ring-2 focus:ring-[#c6a96b] outline-none"
              />
              <span className="text-[10px] text-[#f5efe6]/40 mt-1 block">
                Coloca 0 si el canje es 100% en puntos.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="expires_at" className="block text-xs font-bold text-[#f5efe6]/70 uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#c6a96b]" />
                  Fecha de Caducidad
                </label>
                {formData.expires_at && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, expires_at: "" })}
                    className="text-[10px] text-[#c6a96b] hover:underline font-semibold"
                  >
                    Hacer permanente
                  </button>
                )}
              </div>
              <input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className={`w-full px-3.5 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-[#c6a96b] outline-none bg-[#2a1a18] text-[#f5efe6] ${
                  formData.expires_at && new Date(formData.expires_at + "T23:59:59") < new Date()
                    ? "border-amber-500/50 bg-amber-900/20"
                    : "border-[#c6a96b]/30"
                }`}
              />
              {formData.expires_at ? (
                new Date(formData.expires_at + "T23:59:59") < new Date() ? (
                  <span className="text-[10px] text-amber-500 font-semibold mt-1 flex items-center gap-1">
                    ⚠️ Fecha pasada: se mostrará como expirado.
                  </span>
                ) : (
                  <span className="text-[10px] text-green-400 font-medium mt-1 block">
                    Válido hasta el {new Date(formData.expires_at + "T12:00:00").toLocaleDateString("es-AR")}.
                  </span>
                )
              ) : (
                <span className="text-[10px] text-[#f5efe6]/40 mt-1 block">
                  Promoción permanente (sin fecha límite).
                </span>
              )}
            </div>
          </div>

          {/* Resumen del Valor del Canje y Categoría */}
          <div className="bg-[#1a0e0d] border border-[#c6a96b]/20 p-4 rounded-xl flex items-center justify-between text-xs">
            <span className="text-[#f5efe6]/70 font-medium">Esquema para el cliente:</span>
            <div className="flex items-center gap-3">
              {(() => {
                const cat = getCategoryForPoints(formData.points_required);
                if (!cat) return null;
                return (
                  <span className={`font-bold text-xs px-2.5 py-1 rounded-md border ${getThemeClasses(cat.color_theme)} flex items-center gap-1 shadow-sm`}>
                    <Layers className="w-3.5 h-3.5" />
                    Nivel {cat.name}
                  </span>
                );
              })()}
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm text-[#c6a96b]">
                  {formData.points_required} pts
                </span>
                {formData.additional_money > 0 && (
                  <span className="font-extrabold text-sm text-[#f5efe6]">
                    + ${Number(formData.additional_money).toLocaleString("es-AR")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c6a96b]/10">
            {isCreatingNew && initialProducts.length > 0 && (
              <button
                type="button"
                onClick={() => handleSelectProduct(initialProducts[0])}
                className="px-4 py-2.5 rounded-lg border border-[#c6a96b]/30 text-[#f5efe6]/70 hover:bg-[#c6a96b]/10 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-[#c6a96b] hover:bg-[#d8bd80] text-[#1a0e0d] font-bold px-6 py-2.5 rounded-lg text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
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
