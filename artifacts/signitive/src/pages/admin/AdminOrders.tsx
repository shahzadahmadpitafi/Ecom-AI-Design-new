import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import AdminLayout from "./AdminLayout";
import { adminGet, adminPost, formatPKR, formatDate, StatusBadge } from "@/lib/admin-api";
import { Search, Download, Eye, MessageCircle, ChevronDown, RefreshCw, Plus, X, Trash2 } from "lucide-react";

const STATUSES = ["all","pending","confirmed","sampling","in_production","quality_check","shipped","delivered","cancelled"];
const PAYMENT_STATUSES = ["all","unpaid","partial","paid"];
const CATEGORIES = ["Streetwear","Leather Jackets","Fitness Wear","Sports Uniforms","MMA","Boxing","Wrestling","Motocross","Sublimation Sportswear","Caps","Team Wear","Sports Goods","Bags"];

function WhatsAppButton({ whatsapp, orderNumber, status }: { whatsapp: string; orderNumber: string; status: string }) {
  const templates: Record<string, string> = {
    confirmed:     `Your order ${orderNumber} has been confirmed! Production starts soon. Expected delivery will be shared shortly.`,
    in_production: `Great news! Your order ${orderNumber} is now in production. We'll keep you updated!`,
    shipped:       `Your order ${orderNumber} has been dispatched! Tracking details to follow.`,
    delivered:     `Your order ${orderNumber} has been delivered! Thank you for choosing Signitive Enterprises.`,
  };
  const msg = templates[status] || `Update on your order ${orderNumber}: Status is now ${status.replace(/_/g," ")}. Contact us for details.`;
  const number = whatsapp.replace(/[^0-9]/g, "");
  const url = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-all"
      style={{ border: "1px solid rgba(37,211,102,0.3)", color: "#25d366" }}
      onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(37,211,102,0.06)"}
      onMouseLeave={e => (e.currentTarget as any).style.background = "transparent"}>
      <MessageCircle className="h-3 w-3" /> WA
    </a>
  );
}

interface OrderItem {
  productName: string;
  category: string;
  quantity: number;
  unitPricePkr: number;
  garmentColor: string;
  garmentSize: string;
}

function CreateOrderModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [items, setItems] = useState<OrderItem[]>([
    { productName: "", category: "Streetwear", quantity: 25, unitPricePkr: 0, garmentColor: "Black", garmentSize: "M" },
  ]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminGet("/customers").then(d => setCustomers(d.customers || [])).catch(console.error);
  }, []);

  const addItem = () => setItems(prev => [...prev, { productName: "", category: "Streetwear", quantity: 25, unitPricePkr: 0, garmentColor: "Black", garmentSize: "M" }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const setItem = (i: number, k: keyof OrderItem, v: any) => setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

  const totalPkr = items.reduce((s, it) => s + (it.unitPricePkr * it.quantity), 0);

  const handleCreate = async () => {
    if (!items.some(it => it.productName.trim())) { setError("Add at least one product"); return; }
    setSaving(true);
    setError("");
    try {
      await adminPost("/orders", {
        customerId,
        items: items.filter(it => it.productName.trim()).map(it => ({
          ...it,
          quantity: Number(it.quantity),
          unitPricePkr: Number(it.unitPricePkr),
          totalPricePkr: Number(it.unitPricePkr) * Number(it.quantity),
        })),
        totalPkr,
        specialInstructions,
        estimatedDelivery: estimatedDelivery || null,
      });
      onCreated();
    } catch (e: any) {
      setError(e.message || "Failed to create order");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-4" style={{ background: "#111", border: "1px solid rgba(201,168,76,0.3)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
          <h3 className="font-display text-base tracking-widest uppercase" style={{ color: "#C9A84C" }}>New Order</h3>
          <button onClick={onClose} className="text-[#555] hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Customer */}
          <div>
            <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1.5">Customer</label>
            <select value={customerId ?? ""} onChange={e => setCustomerId(e.target.value ? Number(e.target.value) : null)}
              className="w-full h-9 px-3 text-xs text-white outline-none"
              style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }}>
              <option value="">— Guest / Walk-in —</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}{c.companyName ? ` (${c.companyName})` : ""}</option>
              ))}
            </select>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9px] uppercase tracking-widest text-[#555]">Order Items</label>
              <button onClick={addItem} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#a78bfa" }}>
                <Plus className="h-3 w-3" /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="p-3 space-y-2" style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.12)" }}>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Product Name *</label>
                      <input value={item.productName} onChange={e => setItem(i, "productName", e.target.value)}
                        placeholder="e.g. Custom Hoodie" className="w-full h-8 px-2 text-xs text-white outline-none"
                        style={{ background: "#111", border: "1px solid rgba(167,139,250,0.15)" }} />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Category</label>
                      <select value={item.category} onChange={e => setItem(i, "category", e.target.value)}
                        className="w-full h-8 px-2 text-xs text-white outline-none"
                        style={{ background: "#111", border: "1px solid rgba(167,139,250,0.15)" }}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Qty</label>
                      <input type="number" min={1} value={item.quantity} onChange={e => setItem(i, "quantity", Number(e.target.value))}
                        className="w-full h-8 px-2 text-xs text-white outline-none"
                        style={{ background: "#111", border: "1px solid rgba(167,139,250,0.15)" }} />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Unit Price PKR</label>
                      <input type="number" min={0} value={item.unitPricePkr} onChange={e => setItem(i, "unitPricePkr", Number(e.target.value))}
                        className="w-full h-8 px-2 text-xs text-white outline-none"
                        style={{ background: "#111", border: "1px solid rgba(167,139,250,0.15)" }} />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Color</label>
                      <input value={item.garmentColor} onChange={e => setItem(i, "garmentColor", e.target.value)}
                        placeholder="Black" className="w-full h-8 px-2 text-xs text-white outline-none"
                        style={{ background: "#111", border: "1px solid rgba(167,139,250,0.15)" }} />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Size</label>
                      <input value={item.garmentSize} onChange={e => setItem(i, "garmentSize", e.target.value)}
                        placeholder="M" className="w-full h-8 px-2 text-xs text-white outline-none"
                        style={{ background: "#111", border: "1px solid rgba(167,139,250,0.15)" }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold" style={{ color: "#C9A84C" }}>
                      Line Total: {formatPKR(item.quantity * item.unitPricePkr)}
                    </p>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(i)} className="text-[#555] hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extra fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1.5">Estimated Delivery</label>
              <input type="date" value={estimatedDelivery} onChange={e => setEstimatedDelivery(e.target.value)}
                className="w-full h-9 px-3 text-xs text-white outline-none"
                style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)", colorScheme: "dark" }} />
            </div>
            <div className="flex items-end">
              <div className="w-full p-3" style={{ background: "#0a0a0a", border: "1px solid rgba(201,168,76,0.2)" }}>
                <p className="text-[9px] uppercase tracking-widest text-[#555]">Order Total</p>
                <p className="text-xl font-bold font-display mt-0.5" style={{ color: "#C9A84C" }}>{formatPKR(totalPkr)}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1.5">Special Instructions</label>
            <textarea value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} rows={2}
              placeholder="Branding, packaging, label requirements..."
              className="w-full px-3 py-2 text-xs text-white outline-none resize-none"
              style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }} />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 h-10 text-xs text-[#555] uppercase tracking-wider border"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
            <button onClick={handleCreate} disabled={saving}
              className="flex-1 h-10 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              style={{ background: "#C9A84C", color: "#0a0a0a" }}>
              {saving ? "Creating..." : "Create Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [, setLocation] = useLocation();
  const [orders, setOrders]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [payFilter, setPayFilter]         = useState("all");
  const [showStatusMenu, setShowStatusMenu] = useState<number | null>(null);
  const [showCreate, setShowCreate]         = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminGet(`/orders?status=${statusFilter}&paymentStatus=${payFilter}&search=${encodeURIComponent(search)}`);
      setOrders(data.orders || []);
    } catch {} finally { setLoading(false); }
  }, [statusFilter, payFilter, search]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const updateStatus = async (orderId: number, status: string) => {
    await adminPost(`/orders/${orderId}/status`, { status });
    setShowStatusMenu(null);
    loadOrders();
  };

  const handleExport = () => { window.open("/api/admin/orders-export", "_blank"); };

  const allStatuses = STATUSES.filter(s => s !== "all");

  return (
    <AdminLayout title="Orders">
      <div className="space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#555]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search order #, customer, phone..." className="w-full h-9 pl-9 pr-3 text-sm text-white outline-none"
              style={{ background: "#111", border: "1px solid rgba(167,139,250,0.2)" }} />
          </div>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs text-white outline-none uppercase tracking-wider"
            style={{ background: "#111", border: "1px solid rgba(167,139,250,0.2)" }}>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
          </select>

          <select value={payFilter} onChange={e => setPayFilter(e.target.value)}
            className="h-9 px-3 text-xs text-white outline-none uppercase tracking-wider"
            style={{ background: "#111", border: "1px solid rgba(167,139,250,0.2)" }}>
            {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button onClick={loadOrders} className="h-9 px-3 text-[#555] hover:text-white border transition-all"
            style={{ border: "1px solid rgba(167,139,250,0.15)" }}>
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <button onClick={handleExport} className="flex items-center gap-1.5 h-9 px-3 text-xs font-bold uppercase tracking-wider border transition-all"
            style={{ border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}>
            <Download className="h-3.5 w-3.5" /> CSV
          </button>

          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 h-9 px-4 text-xs font-bold uppercase tracking-wider"
            style={{ background: "#C9A84C", color: "#0a0a0a" }}>
            <Plus className="h-3.5 w-3.5" /> New Order
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "#111", border: "1px solid rgba(167,139,250,0.1)" }}>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
                    {["Order #","Customer","Total PKR","Payment","Status","Date","Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[9px] uppercase tracking-widest" style={{ color: "#444" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(({ order, customer }: any) => {
                    const sb  = StatusBadge({ status: order.status });
                    const psb = StatusBadge({ status: order.paymentStatus, type: "payment" });
                    return (
                      <tr key={order.id} style={{ borderBottom: "1px solid rgba(167,139,250,0.05)" }}
                        onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(167,139,250,0.02)"}
                        onMouseLeave={e => (e.currentTarget as any).style.background = ""}>
                        <td className="px-4 py-3">
                          <button onClick={() => setLocation(`/admin/orders/${order.id}`)}
                            className="font-bold text-xs hover:underline" style={{ color: "#C9A84C" }}>
                            {order.orderNumber}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-white font-medium">{customer?.name || "Guest"}</p>
                          {customer?.whatsapp && <p className="text-[10px] text-[#555]">{customer.whatsapp}</p>}
                          {customer?.country  && <p className="text-[10px] text-[#333]">{customer.country}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-bold" style={{ color: "#C9A84C" }}>{formatPKR(order.totalPkr)}</p>
                          {order.balanceDuePkr > 0 && <p className="text-[10px] text-red-400">Due: {formatPKR(order.balanceDuePkr)}</p>}
                        </td>
                        <td className="px-4 py-3"><span style={psb.style}>{psb.label}</span></td>
                        <td className="px-4 py-3">
                          <div className="relative inline-block">
                            <button onClick={() => setShowStatusMenu(showStatusMenu === order.id ? null : order.id)}
                              className="flex items-center gap-1" style={sb.style}>
                              {sb.label} <ChevronDown className="h-2.5 w-2.5" />
                            </button>
                            {showStatusMenu === order.id && (
                              <div className="absolute left-0 top-full mt-1 z-20 w-44 overflow-hidden"
                                style={{ background: "#111", border: "1px solid rgba(167,139,250,0.3)" }}>
                                {allStatuses.map(s => {
                                  const bs = StatusBadge({ status: s });
                                  return (
                                    <button key={s} onClick={() => updateStatus(order.id, s)}
                                      className="w-full text-left px-3 py-2 text-[10px] uppercase tracking-wider transition-colors"
                                      style={{ color: bs.style.color }}
                                      onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(167,139,250,0.08)"}
                                      onMouseLeave={e => (e.currentTarget as any).style.background = ""}>
                                      {s.replace(/_/g," ")}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[10px] text-[#555]">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setLocation(`/admin/orders/${order.id}`)}
                              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider border transition-all"
                              style={{ border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
                              <Eye className="h-3 w-3" /> View
                            </button>
                            {customer?.whatsapp && (
                              <WhatsAppButton whatsapp={customer.whatsapp} orderNumber={order.orderNumber} status={order.status} />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!orders.length && (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-[#555]">
                      No orders found {search || statusFilter !== "all" ? "— try adjusting filters" : ""}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-[10px] text-[#333]">{orders.length} orders shown</p>
      </div>

      {showCreate && (
        <CreateOrderModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadOrders(); }} />
      )}
    </AdminLayout>
  );
}
