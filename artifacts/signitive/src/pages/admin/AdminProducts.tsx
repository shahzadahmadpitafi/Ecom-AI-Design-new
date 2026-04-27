import { useState, useEffect, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import { adminGet, adminPost, adminPut, formatPKR } from "@/lib/admin-api";
import { Search, Plus, Edit2, Trash2, X, ChevronDown, Star, Package } from "lucide-react";

const CATEGORIES = [
  "Streetwear", "Leather Jackets", "Fitness Wear", "Sports Uniforms",
  "MMA", "Boxing", "Wrestling", "Motocross", "Sublimation Sportswear",
  "Caps", "Team Wear", "Sports Goods", "Bags",
];

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const STD_COLORS = ["Black", "White", "Grey", "Navy", "Maroon", "Olive", "Royal Blue", "Red", "Forest Green", "Burgundy", "Orange", "Yellow", "Purple", "Pink"];

function TagInput({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) { onChange([...values, v]); setInput(""); }
  };
  return (
    <div>
      <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">{label}</label>
      <div className="flex flex-wrap gap-1 p-2 min-h-[36px]" style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }}>
        {values.map(v => (
          <span key={v} className="flex items-center gap-1 px-2 py-0.5 text-[10px]" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa" }}>
            {v}
            <button onClick={() => onChange(values.filter(x => x !== v))} className="hover:text-red-400"><X className="h-2.5 w-2.5" /></button>
          </span>
        ))}
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="Type & press Enter" className="flex-1 min-w-[100px] text-[11px] text-white outline-none bg-transparent placeholder-[#333]" />
      </div>
    </div>
  );
}

function ProductModal({ product, onClose, onSaved }: { product: any; onClose: () => void; onSaved: () => void }) {
  const isNew = !product?.id;
  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "Streetwear",
    subcategory: product?.subcategory || "",
    description: product?.description || "",
    basePricePkr: product?.basePricePkr || "",
    minOrderQty: product?.minOrderQty || 25,
    isCustomizable: product?.isCustomizable ?? true,
    featured: product?.featured ?? false,
    imageUrl: product?.imageUrl || "",
    availableColors: product?.availableColors || [],
    availableSizes: product?.availableSizes || [],
    availableFabrics: product?.availableFabrics || [],
    availableGsm: product?.availableGsm || [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const toggleSize = (s: string) => {
    set("availableSizes", form.availableSizes.includes(s)
      ? form.availableSizes.filter((x: string) => x !== s)
      : [...form.availableSizes, s]);
  };

  const handleSave = async () => {
    if (!form.name || !form.category || !form.basePricePkr) {
      setError("Name, Category, and Price are required."); return;
    }
    setSaving(true); setError("");
    try {
      if (isNew) await adminPost("/products", form);
      else await adminPut(`/products/${product.id}`, form);
      onSaved();
    } catch (e: any) {
      setError(e.message || "Failed to save");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-auto" style={{ background: "#111", border: "1px solid rgba(167,139,250,0.3)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10" style={{ background: "#111", borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
          <h3 className="font-display text-base tracking-widest uppercase" style={{ color: "#a78bfa" }}>
            {isNew ? "Add Product" : "Edit Product"}
          </h3>
          <button onClick={onClose} className="text-[#555] hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          {error && <p className="text-xs text-red-400 px-3 py-2" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</p>}

          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Product Name *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Boxing Gloves"
                className="w-full h-9 px-3 text-xs text-white outline-none"
                style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }} />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Category *</label>
              <select value={form.category} onChange={e => set("category", e.target.value)}
                className="w-full h-9 px-3 text-xs text-white outline-none"
                style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Subcategory</label>
              <input value={form.subcategory} onChange={e => set("subcategory", e.target.value)} placeholder="e.g. Boxing Gloves"
                className="w-full h-9 px-3 text-xs text-white outline-none"
                style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }} />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Price (PKR) *</label>
              <input type="number" value={form.basePricePkr} onChange={e => set("basePricePkr", e.target.value)} placeholder="e.g. 3500"
                className="w-full h-9 px-3 text-xs text-white outline-none"
                style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }} />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Min Order Qty</label>
              <input type="number" value={form.minOrderQty} onChange={e => set("minOrderQty", parseInt(e.target.value))} placeholder="25"
                className="w-full h-9 px-3 text-xs text-white outline-none"
                style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="Product description..."
              className="w-full px-3 py-2 text-xs text-white outline-none resize-none"
              style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }} />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Image URL</label>
            <input value={form.imageUrl} onChange={e => set("imageUrl", e.target.value)} placeholder="https://..."
              className="w-full h-9 px-3 text-xs text-white outline-none"
              style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }} />
          </div>

          {/* Sizes */}
          <div>
            <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-2">Sizes</label>
            <div className="flex flex-wrap gap-1.5">
              {APPAREL_SIZES.map(s => (
                <button key={s} onClick={() => toggleSize(s)}
                  className="px-3 py-1 text-xs transition-all"
                  style={{
                    background: form.availableSizes.includes(s) ? "rgba(201,168,76,0.15)" : "transparent",
                    color: form.availableSizes.includes(s) ? "#C9A84C" : "#555",
                    border: `1px solid ${form.availableSizes.includes(s) ? "rgba(201,168,76,0.4)" : "rgba(85,85,85,0.3)"}`,
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-2">Colors (quick select)</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {STD_COLORS.map(c => (
                <button key={c} onClick={() => {
                  set("availableColors", form.availableColors.includes(c)
                    ? form.availableColors.filter((x: string) => x !== c)
                    : [...form.availableColors, c]);
                }}
                  className="px-2.5 py-0.5 text-[10px] transition-all"
                  style={{
                    background: form.availableColors.includes(c) ? "rgba(201,168,76,0.15)" : "transparent",
                    color: form.availableColors.includes(c) ? "#C9A84C" : "#555",
                    border: `1px solid ${form.availableColors.includes(c) ? "rgba(201,168,76,0.4)" : "rgba(85,85,85,0.3)"}`,
                  }}>
                  {c}
                </button>
              ))}
            </div>
            <TagInput label="Custom colors" values={form.availableColors} onChange={v => set("availableColors", v)} />
          </div>

          {/* Fabrics */}
          <TagInput label="Fabrics" values={form.availableFabrics} onChange={v => set("availableFabrics", v)} />

          {/* Toggles */}
          <div className="flex gap-4">
            {[
              { key: "isCustomizable", label: "Customizable" },
              { key: "featured", label: "Featured" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => set(key, !(form as any)[key])}
                  className="w-8 h-4 relative transition-all"
                  style={{ background: (form as any)[key] ? "rgba(201,168,76,0.4)" : "rgba(85,85,85,0.2)", border: `1px solid ${(form as any)[key] ? "#C9A84C" : "#333"}` }}>
                  <div className="absolute top-0.5 h-3 w-3 transition-all"
                    style={{ background: (form as any)[key] ? "#C9A84C" : "#555", left: (form as any)[key] ? "calc(100% - 14px)" : "2px" }} />
                </div>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: (form as any)[key] ? "#C9A84C" : "#555" }}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4" style={{ borderTop: "1px solid rgba(167,139,250,0.1)" }}>
          <button onClick={onClose} className="px-4 py-2 text-xs uppercase tracking-widest text-[#555] hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 text-xs uppercase tracking-widest font-bold transition-all"
            style={{ background: saving ? "rgba(201,168,76,0.2)" : "rgba(201,168,76,0.15)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.4)" }}>
            {saving ? "Saving…" : isNew ? "Add Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ product, onClose, onDeleted }: { product: any; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      });
      onDeleted();
    } catch {} finally { setDeleting(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm p-6" style={{ background: "#111", border: "1px solid rgba(239,68,68,0.3)" }}>
        <h3 className="font-display text-base tracking-widest uppercase text-red-400 mb-2">Delete Product</h3>
        <p className="text-sm text-[#aaa] mb-4">Are you sure you want to delete <span className="text-white font-bold">{product.name}</span>? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-xs uppercase tracking-widest text-[#555] hover:text-white">Cancel</button>
          <button onClick={handleDelete} disabled={deleting}
            className="px-5 py-2 text-xs uppercase tracking-widest font-bold text-red-400 transition-all"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  "Streetwear": "#a78bfa", "Leather Jackets": "#C9A84C", "Fitness Wear": "#22d3ee",
  "Sports Uniforms": "#34d399", "MMA": "#f87171", "Boxing": "#fb923c",
  "Wrestling": "#e879f9", "Motocross": "#facc15", "Sublimation Sportswear": "#38bdf8",
  "Caps": "#a3e635", "Team Wear": "#60a5fa", "Sports Goods": "#f472b6",
  "Bags": "#94a3b8",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [modal, setModal]       = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [stats, setStats]       = useState({ total: 0, categories: 0, featured: 0 });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await adminGet(`/products${params}`);
      setProducts(data.products || []);
      const cats = new Set((data.products || []).map((p: any) => p.category));
      const feat = (data.products || []).filter((p: any) => p.featured).length;
      setStats({ total: data.total || 0, categories: cats.size, featured: feat });
    } catch {} finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = filterCat === "All" ? products : products.filter(p => p.category === filterCat);
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category))).sort()];

  return (
    <AdminLayout title="Products">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Products", value: stats.total, color: "#a78bfa" },
          { label: "Categories",     value: stats.categories, color: "#C9A84C" },
          { label: "Featured",       value: stats.featured, color: "#22d3ee" },
        ].map(s => (
          <div key={s.label} className="p-4" style={{ background: "#0d0d0d", border: "1px solid rgba(167,139,250,0.1)" }}>
            <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: "#555" }}>{s.label}</p>
            <p className="text-2xl font-bold font-display" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-[200px] flex items-center gap-2 h-9 px-3"
          style={{ background: "#0d0d0d", border: "1px solid rgba(167,139,250,0.15)" }}>
          <Search className="h-3.5 w-3.5 text-[#555] flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
            className="flex-1 text-xs text-white bg-transparent outline-none placeholder-[#333]" />
        </div>

        {/* Category filter */}
        <div className="relative flex items-center h-9 px-3 gap-2 cursor-pointer"
          style={{ background: "#0d0d0d", border: "1px solid rgba(167,139,250,0.15)" }}>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full" />
          <span className="text-xs text-[#aaa]">{filterCat}</span>
          <ChevronDown className="h-3 w-3 text-[#555]" />
        </div>
        {/* Real select */}
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="h-9 px-3 text-xs text-white outline-none"
          style={{ background: "#0d0d0d", border: "1px solid rgba(167,139,250,0.15)" }}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Add */}
        <button onClick={() => { setSelected(null); setModal("add"); }}
          className="flex items-center gap-2 h-9 px-4 text-xs uppercase tracking-widest font-bold transition-all"
          style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}>
          <Plus className="h-3.5 w-3.5" /> Add Product
        </button>
      </div>

      {/* Table */}
      <div style={{ border: "1px solid rgba(167,139,250,0.1)" }}>
        {/* Table header */}
        <div className="grid text-[9px] uppercase tracking-widest px-4 py-2.5"
          style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 80px", borderBottom: "1px solid rgba(167,139,250,0.08)", color: "#444" }}>
          <span>Product</span>
          <span>Category</span>
          <span>Price PKR</span>
          <span>MOQ</span>
          <span>Featured</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#555] text-sm">Loading products…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="h-8 w-8 mx-auto mb-3 text-[#333]" />
            <p className="text-sm text-[#555]">No products found</p>
          </div>
        ) : (
          filtered.map((p, i) => (
            <div key={p.id}
              className="grid items-center px-4 py-3 transition-colors hover:bg-white/[0.02]"
              style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 80px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(167,139,250,0.05)" : "none" }}>
              {/* Name */}
              <div className="flex items-center gap-3 min-w-0">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt="" className="w-8 h-8 object-cover flex-shrink-0" style={{ border: "1px solid rgba(167,139,250,0.1)" }} />
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ background: "#1a1a1a" }}>
                    <Package className="h-3.5 w-3.5 text-[#333]" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs text-white font-medium truncate">{p.name}</p>
                  {p.subcategory && <p className="text-[10px] text-[#555] truncate">{p.subcategory}</p>}
                </div>
              </div>

              {/* Category */}
              <span className="text-[10px] px-2 py-0.5 inline-block truncate"
                style={{ color: CATEGORY_COLORS[p.category] || "#a78bfa", background: `${CATEGORY_COLORS[p.category] || "#a78bfa"}15`, border: `1px solid ${CATEGORY_COLORS[p.category] || "#a78bfa"}30` }}>
                {p.category}
              </span>

              {/* Price */}
              <span className="text-xs font-mono" style={{ color: "#C9A84C" }}>
                {formatPKR(p.basePricePkr)}
              </span>

              {/* MOQ */}
              <span className="text-xs text-[#666]">{p.minOrderQty} pcs</span>

              {/* Featured */}
              <div>
                {p.featured ? (
                  <Star className="h-3.5 w-3.5" style={{ color: "#C9A84C", fill: "#C9A84C" }} />
                ) : (
                  <Star className="h-3.5 w-3.5 text-[#333]" />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => { setSelected(p); setModal("edit"); }}
                  className="p-1.5 text-[#555] hover:text-[#a78bfa] transition-colors">
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => { setSelected(p); setModal("delete"); }}
                  className="p-1.5 text-[#555] hover:text-red-400 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-[10px] text-[#444] mt-3">{filtered.length} products shown{filterCat !== "All" ? ` in ${filterCat}` : ""}</p>

      {/* Modals */}
      {(modal === "add" || modal === "edit") && (
        <ProductModal
          product={modal === "edit" ? selected : null}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchProducts(); }}
        />
      )}
      {modal === "delete" && selected && (
        <DeleteConfirm
          product={selected}
          onClose={() => setModal(null)}
          onDeleted={() => { setModal(null); fetchProducts(); }}
        />
      )}
    </AdminLayout>
  );
}
