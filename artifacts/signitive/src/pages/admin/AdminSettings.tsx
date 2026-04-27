import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { adminGet, adminPut } from "@/lib/admin-api";
import { Save, RefreshCw, Settings2, MessageCircle, DollarSign, Store, Phone } from "lucide-react";

const SECTIONS = [
  {
    title: "Store Identity",
    icon: Store,
    color: "#C9A84C",
    fields: [
      { key: "store_name",    label: "Store Name",    type: "text",   placeholder: "Signitive Enterprises" },
      { key: "store_tagline", label: "Tagline",        type: "text",   placeholder: "World-Class Garments from Sialkot, Pakistan" },
      { key: "store_email",   label: "Email Address",  type: "email",  placeholder: "info@signitive.com" },
      { key: "store_address", label: "Address",        type: "text",   placeholder: "Sialkot, Punjab, Pakistan" },
    ],
  },
  {
    title: "WhatsApp & Phone",
    icon: MessageCircle,
    color: "#25d366",
    fields: [
      { key: "whatsapp_number", label: "WhatsApp Number", type: "tel",  placeholder: "+923001234567" },
      { key: "store_phone",     label: "Phone Number",    type: "tel",  placeholder: "+92 52 1234567" },
    ],
  },
  {
    title: "Pricing & Orders",
    icon: DollarSign,
    color: "#a78bfa",
    fields: [
      { key: "usd_to_pkr_rate", label: "USD → PKR Exchange Rate", type: "number", placeholder: "278" },
      { key: "min_order_qty",   label: "Default Min Order Qty",   type: "number", placeholder: "25" },
    ],
  },
];

export default function AdminSettings() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminGet("/settings");
      setValues(data.settings || {});
      setOriginal(data.settings || {});
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const set = (key: string, val: string) => setValues(v => ({ ...v, [key]: val }));

  const isDirty = JSON.stringify(values) !== JSON.stringify(original);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await adminPut("/settings", values);
      setValues(data.settings || {});
      setOriginal(data.settings || {});
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {} finally { setSaving(false); }
  };

  return (
    <AdminLayout title="Settings">
      <div className="max-w-2xl space-y-6">

        {/* Header bar */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#555]">Configure your store settings. Changes take effect immediately.</p>
          <div className="flex items-center gap-2">
            <button onClick={load}
              className="flex items-center gap-1.5 h-9 px-3 text-[#555] hover:text-white border transition-all"
              style={{ border: "1px solid rgba(167,139,250,0.15)" }}>
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button onClick={handleSave} disabled={!isDirty || saving}
              className="flex items-center gap-2 h-9 px-5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40"
              style={{ background: isDirty ? "#C9A84C" : "rgba(201,168,76,0.15)", color: isDirty ? "#0a0a0a" : "#C9A84C" }}>
              {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          SECTIONS.map(({ title, icon: Icon, color, fields }) => (
            <div key={title} style={{ background: "#111", border: "1px solid rgba(167,139,250,0.1)" }}>
              {/* Section header */}
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.08)" }}>
                <div className="w-7 h-7 flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{title}</h3>
              </div>

              <div className="p-5 space-y-4">
                {fields.map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="text-[9px] uppercase tracking-widest block mb-1.5" style={{ color: "#555" }}>{label}</label>
                    <input
                      type={type}
                      value={values[key] || ""}
                      onChange={e => set(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full h-9 px-3 text-sm text-white outline-none transition-all"
                      style={{ background: "#0a0a0a", border: `1px solid ${values[key] !== original[key] ? color + "50" : "rgba(167,139,250,0.2)"}` }}
                    />
                    {key === "whatsapp_number" && (
                      <p className="text-[10px] mt-1" style={{ color: "#444" }}>
                        Include country code, e.g. +923001234567 — used in WhatsApp order notifications
                      </p>
                    )}
                    {key === "usd_to_pkr_rate" && (
                      <p className="text-[10px] mt-1" style={{ color: "#444" }}>
                        Current mid-market rate — used across the site for USD/PKR currency toggle
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Danger zone */}
        <div style={{ background: "#111", border: "1px solid rgba(239,68,68,0.15)" }}>
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(239,68,68,0.1)" }}>
            <Settings2 className="h-3.5 w-3.5" style={{ color: "#f87171" }} />
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#f87171" }}>System Info</h3>
          </div>
          <div className="px-5 py-4 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span style={{ color: "#555" }}>Admin Credentials</span>
              <span style={{ color: "#444" }}>admin@signitive.com</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span style={{ color: "#555" }}>API Version</span>
              <span style={{ color: "#444" }}>v1.0 — Signitive Platform</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span style={{ color: "#555" }}>Database</span>
              <span style={{ color: "#4ade80" }}>PostgreSQL — Connected</span>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
