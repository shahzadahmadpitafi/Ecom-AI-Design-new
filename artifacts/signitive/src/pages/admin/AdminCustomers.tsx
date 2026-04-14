import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AdminLayout from "./AdminLayout";
import { adminGet, adminPost, adminPut, formatPKR, formatDate } from "@/lib/admin-api";
import { Search, Plus, MessageCircle, ChevronLeft, Edit2, X } from "lucide-react";

const TYPE_COLORS: Record<string, { color: string; border: string }> = {
  retail:        { color: "#a0a0a0", border: "rgba(160,160,160,0.3)" },
  wholesale:     { color: "#60a5fa", border: "rgba(59,130,246,0.3)"  },
  international: { color: "#a78bfa", border: "rgba(167,139,250,0.3)" },
  vip:           { color: "#C9A84C", border: "rgba(201,168,76,0.3)"  },
};

function CustomerModal({ customer, onClose, onSaved }: { customer: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: customer?.name || "", email: customer?.email || "", whatsapp: customer?.whatsapp || "",
    country: customer?.country || "", city: customer?.city || "", companyName: customer?.companyName || "",
    customerType: customer?.customerType || "retail", notes: customer?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      if (customer?.id) await adminPut(`/customers/${customer.id}`, form);
      else await adminPost("/customers", form);
      onSaved();
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md" style={{ background: "#111", border: "1px solid rgba(167,139,250,0.3)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
          <h3 className="font-display text-base tracking-widest uppercase" style={{ color: "#a78bfa" }}>
            {customer?.id ? "Edit Customer" : "New Customer"}
          </h3>
          <button onClick={onClose} className="text-[#555] hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label:"Name *",      key:"name",        type:"text",  placeholder:"Customer name" },
            { label:"WhatsApp",    key:"whatsapp",    type:"tel",   placeholder:"+923001234567" },
            { label:"Email",       key:"email",       type:"email", placeholder:"email@example.com" },
            { label:"Country",     key:"country",     type:"text",  placeholder:"Pakistan" },
            { label:"City",        key:"city",        type:"text",  placeholder:"Sialkot" },
            { label:"Company",     key:"companyName", type:"text",  placeholder:"Company (optional)" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">{label}</label>
              <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                className="w-full h-9 px-2 text-xs text-white outline-none"
                style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }} />
            </div>
          ))}
          <div>
            <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Customer Type</label>
            <div className="flex gap-1.5 flex-wrap">
              {["retail","wholesale","international","vip"].map(t => (
                <button key={t} onClick={() => set("customerType", t)}
                  className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border transition-all"
                  style={{
                    border: `1px solid ${form.customerType===t ? TYPE_COLORS[t].border : "rgba(255,255,255,0.08)"}`,
                    color: form.customerType===t ? TYPE_COLORS[t].color : "#555",
                    background: form.customerType===t ? `${TYPE_COLORS[t].color}10` : "transparent",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2}
              className="w-full px-2 py-1.5 text-xs text-white outline-none resize-none"
              style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }} />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 h-9 text-xs text-[#555] uppercase tracking-wider border"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
            <button onClick={handleSave} disabled={!form.name || saving}
              className="flex-1 h-9 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              style={{ background: "#C9A84C", color: "#0a0a0a" }}>
              {saving ? "Saving..." : "Save Customer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCustomers() {
  const [, setLocation] = useLocation();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modal, setModal]     = useState<{ open: boolean; customer: any | null }>({ open: false, customer: null });

  const load = async () => {
    setLoading(true);
    try {
      const d = await adminGet(`/customers?search=${encodeURIComponent(search)}&type=${typeFilter}`);
      setCustomers(d.customers || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, typeFilter]);

  return (
    <AdminLayout title="Customers">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 flex-1">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#555]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..."
                className="w-full h-9 pl-9 pr-3 text-sm text-white outline-none"
                style={{ background: "#111", border: "1px solid rgba(167,139,250,0.2)" }} />
            </div>
            <div className="flex gap-1.5">
              {["all","retail","wholesale","international","vip"].map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className="h-9 px-3 text-[10px] font-bold uppercase tracking-wider border transition-all"
                  style={{
                    border: `1px solid ${typeFilter===t ? (TYPE_COLORS[t]?.border || "rgba(201,168,76,0.4)") : "rgba(167,139,250,0.2)"}`,
                    color: typeFilter===t ? (TYPE_COLORS[t]?.color || "#C9A84C") : "#555",
                    background: typeFilter===t ? "rgba(167,139,250,0.06)" : "transparent",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setModal({ open: true, customer: null })}
            className="flex items-center gap-1.5 h-9 px-4 text-xs font-bold uppercase tracking-wider"
            style={{ background: "#C9A84C", color: "#0a0a0a" }}>
            <Plus className="h-3.5 w-3.5" /> New Customer
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "#111", border: "1px solid rgba(167,139,250,0.1)" }}>
          {loading ? (
            <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
                    {["Name","WhatsApp","Country","Orders","Spent PKR","Type","Joined","Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[9px] uppercase tracking-widest text-[#444]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => {
                    const tc = TYPE_COLORS[c.customerType] || TYPE_COLORS.retail;
                    return (
                      <tr key={c.id} style={{ borderBottom: "1px solid rgba(167,139,250,0.05)" }}
                        onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(167,139,250,0.02)"}
                        onMouseLeave={e => (e.currentTarget as any).style.background = ""}>
                        <td className="px-4 py-3">
                          <p className="text-xs font-bold text-white">{c.name}</p>
                          {c.companyName && <p className="text-[10px] text-[#555]">{c.companyName}</p>}
                        </td>
                        <td className="px-4 py-3">
                          {c.whatsapp ? (
                            <a href={`https://wa.me/${c.whatsapp.replace(/[^0-9]/g,"")}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs" style={{ color: "#25d366" }}>
                              <MessageCircle className="h-3 w-3" /> {c.whatsapp}
                            </a>
                          ) : <span className="text-[#555] text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#888]">{c.country || "—"}</td>
                        <td className="px-4 py-3 text-xs text-white">{c.totalOrders}</td>
                        <td className="px-4 py-3 text-xs font-bold" style={{ color: "#C9A84C" }}>{formatPKR(c.totalSpentPkr)}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
                            style={{ border: `1px solid ${tc.border}`, color: tc.color }}>
                            {c.customerType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[10px] text-[#555]">{formatDate(c.createdAt)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setModal({ open: true, customer: c })}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider border transition-all"
                            style={{ border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
                            <Edit2 className="h-3 w-3" /> Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!customers.length && (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-[#555]">No customers found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-[10px] text-[#333]">{customers.length} customers</p>
      </div>

      {modal.open && (
        <CustomerModal customer={modal.customer} onClose={() => setModal({ open: false, customer: null })} onSaved={() => { setModal({ open: false, customer: null }); load(); }} />
      )}
    </AdminLayout>
  );
}
