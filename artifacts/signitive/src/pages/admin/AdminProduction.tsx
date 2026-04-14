import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import AdminLayout from "./AdminLayout";
import { adminGet, adminPost, formatPKR, formatDate, StatusBadge } from "@/lib/admin-api";
import { RefreshCw, Eye } from "lucide-react";

const KANBAN_COLUMNS = [
  { status: "pending",       label: "Pending",         border: "#fbbf24" },
  { status: "confirmed",     label: "Confirmed",        border: "#60a5fa" },
  { status: "sampling",      label: "Sampling",         border: "#a78bfa" },
  { status: "in_production", label: "In Production",    border: "#c4b5fd" },
  { status: "quality_check", label: "QC & Packing",     border: "#22d3ee" },
  { status: "shipped",       label: "Ready to Ship",    border: "#4ade80" },
];

const STATUSES_LIST = KANBAN_COLUMNS.map(c => c.status);

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function urgencyColor(days: number, estDelivery: string | null): string {
  if (!estDelivery) return "#1a1a1a";
  const daysLeft = Math.floor((new Date(estDelivery).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return "rgba(239,68,68,0.15)";
  if (daysLeft <= 3) return "rgba(251,191,36,0.1)";
  return "rgba(34,197,94,0.06)";
}

function OrderCard({ order, customer, onDrop, onView }: any) {
  const days = daysSince(order.createdAt);
  const bg = urgencyColor(days, order.estimatedDelivery);
  const items = (() => { try { return JSON.parse(order.items || "[]"); } catch { return []; } })();
  const totalQty = items.reduce((s: number, i: any) => s + (i.quantity || 0), 0);

  return (
    <div draggable onDragStart={e => e.dataTransfer.setData("orderId", String(order.id))}
      className="p-3 mb-2 cursor-grab active:cursor-grabbing select-none transition-all"
      style={{ background: bg, border: "1px solid rgba(167,139,250,0.15)" }}
      onMouseEnter={e => (e.currentTarget as any).style.borderColor = "rgba(167,139,250,0.4)"}
      onMouseLeave={e => (e.currentTarget as any).style.borderColor = "rgba(167,139,250,0.15)"}>
      <div className="flex items-start justify-between mb-1.5">
        <button onClick={onView} className="text-[11px] font-bold hover:underline" style={{ color: "#C9A84C" }}>
          {order.orderNumber}
        </button>
        <span className="text-[9px] uppercase tracking-wider" style={{ color: days > 7 ? "#f87171" : "#555" }}>
          {days}d
        </span>
      </div>
      <p className="text-[10px] font-bold text-white truncate">{customer?.name || "Guest"}</p>
      {customer?.country && <p className="text-[9px] text-[#555]">{customer.country}</p>}
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] font-bold" style={{ color: "#C9A84C" }}>{formatPKR(order.totalPkr)}</span>
        {totalQty > 0 && <span className="text-[9px] text-[#555]">{totalQty} units</span>}
      </div>
      {order.estimatedDelivery && (
        <p className="text-[9px] mt-1" style={{ color: "#555" }}>Due: {formatDate(order.estimatedDelivery)}</p>
      )}
    </div>
  );
}

export default function AdminProduction() {
  const [, setLocation] = useLocation();
  const [orders, setOrders]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState<"kanban" | "list">("kanban");
  const dragOver                = useRef<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const d = await adminGet("/production");
      setOrders(d.orders || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    dragOver.current = null;
    const orderId = e.dataTransfer.getData("orderId");
    if (!orderId) return;
    try {
      await adminPost(`/orders/${orderId}/status`, { status: targetStatus });
      load();
    } catch {}
  };

  const getColumnOrders = (status: string) => orders.filter(o => o.order.status === status);

  return (
    <AdminLayout title="Production">
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex gap-2 items-center">
          {(["kanban","list"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="h-8 px-4 text-[10px] font-bold uppercase tracking-wider border transition-all"
              style={{
                border: `1px solid ${view===v?"#C9A84C":"rgba(167,139,250,0.2)"}`,
                background: view===v?"rgba(201,168,76,0.1)":"transparent",
                color: view===v?"#C9A84C":"#555",
              }}>
              {v}
            </button>
          ))}
          <button onClick={load} className="h-8 px-3 text-[#555] hover:text-white border ml-auto"
            style={{ border: "1px solid rgba(167,139,250,0.15)" }}>
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" /></div>
        ) : view === "kanban" ? (
          /* Kanban Board */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto">
            {KANBAN_COLUMNS.map(col => {
              const colOrders = getColumnOrders(col.status);
              return (
                <div key={col.status} className="min-h-48"
                  onDragOver={e => { e.preventDefault(); dragOver.current = col.status; }}
                  onDragLeave={() => { dragOver.current = null; }}
                  onDrop={e => handleDrop(e, col.status)}>
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-2 pb-2"
                    style={{ borderBottom: `2px solid ${col.border}` }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">{col.label}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5"
                      style={{ background: `${col.border}20`, color: col.border, border: `1px solid ${col.border}40` }}>
                      {colOrders.length}
                    </span>
                  </div>
                  {/* Cards */}
                  <div className="min-h-16">
                    {colOrders.map(({ order, customer }) => (
                      <OrderCard key={order.id} order={order} customer={customer}
                        onDrop={() => {}} onView={() => setLocation(`/admin/orders/${order.id}`)} />
                    ))}
                    {colOrders.length === 0 && (
                      <div className="h-16 flex items-center justify-center border border-dashed"
                        style={{ borderColor: "rgba(167,139,250,0.1)", color: "#333" }}>
                        <span className="text-[9px] uppercase tracking-wider">Drop here</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div style={{ background: "#111", border: "1px solid rgba(167,139,250,0.1)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
                    {["Order #","Customer","Total PKR","Status","Days in Stage","Est. Delivery",""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[9px] uppercase tracking-widest text-[#444]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(({ order, customer }) => {
                    const sb = StatusBadge({ status: order.status });
                    const days = daysSince(order.createdAt);
                    return (
                      <tr key={order.id} style={{ borderBottom: "1px solid rgba(167,139,250,0.05)" }}
                        onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(167,139,250,0.02)"}
                        onMouseLeave={e => (e.currentTarget as any).style.background = ""}>
                        <td className="px-4 py-3">
                          <button onClick={() => setLocation(`/admin/orders/${order.id}`)} className="font-bold text-xs hover:underline" style={{ color: "#C9A84C" }}>
                            {order.orderNumber}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-xs text-white">{customer?.name || "Guest"}</td>
                        <td className="px-4 py-3 text-xs font-bold" style={{ color: "#C9A84C" }}>{formatPKR(order.totalPkr)}</td>
                        <td className="px-4 py-3"><span style={sb.style}>{sb.label}</span></td>
                        <td className="px-4 py-3 text-xs" style={{ color: days > 7 ? "#f87171" : "#888" }}>{days}d</td>
                        <td className="px-4 py-3 text-[10px] text-[#555]">{formatDate(order.estimatedDelivery)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setLocation(`/admin/orders/${order.id}`)}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider border transition-all"
                            style={{ border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
                            <Eye className="h-3 w-3" /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!orders.length && (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-[#555]">No active orders</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
