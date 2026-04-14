import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import AdminLayout from "./AdminLayout";
import { adminGet, adminPost, adminPut, formatPKR, formatDate, StatusBadge } from "@/lib/admin-api";
import { ChevronLeft, CheckCircle, Clock, Circle, ChevronDown, MessageCircle, Printer, Plus, Save } from "lucide-react";

const STAGE_LABELS: Record<string, string> = {
  order_received:"Order Received", design_approved:"Design Approved", sampling:"Sampling",
  sample_approved:"Sample Approved", cutting:"Cutting", stitching:"Stitching",
  printing:"Printing / Embroidery", quality_check:"Quality Check", packing:"Packing", dispatched:"Dispatched",
};

const STATUSES = ["pending","confirmed","sampling","in_production","quality_check","shipped","delivered","cancelled"];

const WA_TEMPLATES: Record<string, (o: any, c: any) => string> = {
  confirmed:     (o, c) => `Dear ${c?.name || "Customer"}, your order ${o.orderNumber} has been confirmed! Production starts ${new Date().toLocaleDateString()}. Expected delivery: ${o.estimatedDelivery || "TBD"}.`,
  in_production: (o, c) => `Great news ${c?.name || "Customer"}! Your order ${o.orderNumber} is now in production. We'll update you when it's ready.`,
  shipped:       (o, c) => `Dear ${c?.name || "Customer"}, your order ${o.orderNumber} has been dispatched via ${o.shippingMethod || "courier"}. Tracking: ${o.trackingNumber || "pending"}.`,
  delivered:     (o, c) => `Dear ${c?.name || "Customer"}, your order ${o.orderNumber} has been delivered! Thank you for choosing Signitive Enterprises, Sialkot.`,
  payment_due:   (o, c) => `Dear ${c?.name || "Customer"}, the balance payment of ${formatPKR(o.balanceDuePkr)} is due for order ${o.orderNumber}. Please arrange payment at your earliest convenience.`,
};

export default function AdminOrderDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [data, setData]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  // Payment modal
  const [paymentModal, setPaymentModal]   = useState(false);
  const [payAmount, setPayAmount]         = useState("");
  const [payMethod, setPayMethod]         = useState("bank_transfer");
  const [payRef, setPayRef]               = useState("");
  const [payNotes, setPayNotes]           = useState("");

  // Edit fields
  const [editStatus, setEditStatus]   = useState("");
  const [editNotes, setEditNotes]     = useState("");
  const [editEstDelivery, setEditEstDelivery] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [editShipping, setEditShipping] = useState("");

  const loadData = async () => {
    try {
      const d = await adminGet(`/orders/${params.id}`);
      setData(d);
      setEditStatus(d.order.status);
      setEditNotes(d.order.specialInstructions || "");
      setEditEstDelivery(d.order.estimatedDelivery || "");
      setEditTracking(d.order.trackingNumber || "");
      setEditShipping(d.order.shippingMethod || "");
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminPut(`/orders/${params.id}`, {
        status: editStatus,
        specialInstructions: editNotes,
        estimatedDelivery: editEstDelivery,
        trackingNumber: editTracking,
        shippingMethod: editShipping,
      });
      if (editStatus !== data.order.status) {
        await adminPost(`/orders/${params.id}/status`, { status: editStatus });
      }
      await loadData();
    } catch {} finally { setSaving(false); }
  };

  const handleStageUpdate = async (orderId: number, stage: string, status: string, notes: string) => {
    await adminPost(`/production/${orderId}/stage`, { stage, status, notes });
    loadData();
  };

  const handlePayment = async () => {
    if (!payAmount) return;
    await adminPost(`/orders/${params.id}/payment`, { amountPkr: Number(payAmount), paymentMethod: payMethod, referenceNumber: payRef, notes: payNotes });
    setPaymentModal(false); setPayAmount(""); setPayRef(""); setPayNotes("");
    loadData();
  };

  const openWhatsApp = (template: string) => {
    const msg = WA_TEMPLATES[template]?.(data.order, data.customer) || "";
    const num = (data.customer?.whatsapp || "923114661392").replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) return <AdminLayout title="Order"><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" /></div></AdminLayout>;
  if (!data) return <AdminLayout title="Order"><p className="text-[#555]">Order not found</p></AdminLayout>;

  const { order, customer, items = [], stages = [], payments = [] } = data;
  const sb = StatusBadge({ status: order.status });

  return (
    <AdminLayout title={order.orderNumber}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/admin/orders")} className="text-[#555] hover:text-white transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-2xl tracking-widest" style={{ color: "#C9A84C" }}>{order.orderNumber}</h1>
            <span style={sb.style}>{sb.label}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => openWhatsApp(order.status)} className="flex items-center gap-1.5 h-8 px-3 text-[10px] font-bold uppercase tracking-wider"
              style={{ border: "1px solid rgba(37,211,102,0.4)", color: "#25d366" }}>
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 h-8 px-3 text-[10px] font-bold uppercase tracking-wider"
              style={{ border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* LEFT: 60% */}
          <div className="lg:col-span-3 space-y-5">
            {/* Customer Info */}
            <div className="p-4" style={{ background: "#111", border: "1px solid rgba(167,139,250,0.1)" }}>
              <h3 className="text-[9px] uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>Customer</h3>
              {customer ? (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label:"Name",    value:customer.name },
                    { label:"WhatsApp",value:customer.whatsapp },
                    { label:"Email",   value:customer.email },
                    { label:"Country", value:customer.country },
                    { label:"Company", value:customer.companyName },
                    { label:"Type",    value:customer.customerType },
                  ].map(({ label, value }) => value ? (
                    <div key={label}>
                      <p className="text-[9px] uppercase tracking-wider text-[#555]">{label}</p>
                      <p className="text-xs text-white mt-0.5">{value}</p>
                    </div>
                  ) : null)}
                </div>
              ) : <p className="text-xs text-[#555]">No customer linked</p>}
            </div>

            {/* Order Items */}
            <div style={{ background: "#111", border: "1px solid rgba(167,139,250,0.1)" }}>
              <h3 className="px-4 py-3 text-[9px] uppercase tracking-widest" style={{ color: "#a78bfa", borderBottom: "1px solid rgba(167,139,250,0.08)" }}>Order Items</h3>
              {items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(167,139,250,0.08)" }}>
                        {["Product","Color","Size","Fabric","GSM","Qty","Unit PKR","Total PKR"].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-[9px] uppercase tracking-widest text-[#444]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: any) => (
                        <tr key={item.id} style={{ borderBottom: "1px solid rgba(167,139,250,0.05)" }}>
                          <td className="px-3 py-2.5">
                            <p className="text-xs font-bold text-white">{item.productName}</p>
                            {item.category && <p className="text-[10px] text-[#555]">{item.category}</p>}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-[#888]">{item.garmentColor || "—"}</td>
                          <td className="px-3 py-2.5 text-xs text-[#888]">{item.garmentSize || "—"}</td>
                          <td className="px-3 py-2.5 text-xs text-[#888]">{item.fabric || "—"}</td>
                          <td className="px-3 py-2.5 text-xs text-[#888]">{item.gsm || "—"}</td>
                          <td className="px-3 py-2.5 text-xs font-bold text-white">{item.quantity}</td>
                          <td className="px-3 py-2.5 text-xs text-[#C9A84C]">{formatPKR(item.unitPricePkr)}</td>
                          <td className="px-3 py-2.5 text-xs font-bold text-[#C9A84C]">{formatPKR(item.totalPricePkr)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4">
                  <p className="text-xs text-[#555]">No items recorded for this order.</p>
                </div>
              )}
            </div>

            {/* Design Image */}
            {order.designImageUrl && (
              <div className="p-4" style={{ background: "#111", border: "1px solid rgba(167,139,250,0.1)" }}>
                <h3 className="text-[9px] uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>Design Preview</h3>
                <img src={order.designImageUrl} alt="Design" className="max-h-48 object-contain" />
                {order.designPrompt && <p className="text-[10px] mt-2 text-[#555] italic">"{order.designPrompt}"</p>}
              </div>
            )}

            {/* Production Timeline */}
            <div className="p-4" style={{ background: "#111", border: "1px solid rgba(167,139,250,0.1)" }}>
              <h3 className="text-[9px] uppercase tracking-widest mb-4" style={{ color: "#a78bfa" }}>Production Timeline</h3>
              <div className="space-y-3">
                {stages.map((stage: any) => {
                  const isDone = stage.status === "completed";
                  const isActive = stage.status === "in_progress";
                  return (
                    <div key={stage.id} className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {isDone
                          ? <CheckCircle className="h-4 w-4" style={{ color: "#C9A84C" }} />
                          : isActive
                            ? <div className="w-4 h-4 rounded-full border-2 animate-pulse" style={{ borderColor: "#a78bfa", background: "rgba(167,139,250,0.2)" }} />
                            : <Circle className="h-4 w-4 text-[#333]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <p className="text-xs font-bold" style={{ color: isDone ? "#C9A84C" : isActive ? "#a78bfa" : "#555" }}>
                            {STAGE_LABELS[stage.stage] || stage.stage}
                          </p>
                          <div className="flex gap-1.5">
                            {!isDone && (
                              <button onClick={() => handleStageUpdate(order.id, stage.stage, "completed", "")}
                                className="text-[9px] uppercase tracking-wider px-2 py-0.5 border transition-all"
                                style={{ border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}>
                                Mark Complete
                              </button>
                            )}
                          </div>
                        </div>
                        {stage.completedAt && <p className="text-[9px] text-[#444] mt-0.5">Completed: {formatDate(stage.completedAt)}</p>}
                        {stage.notes && <p className="text-[10px] text-[#555] mt-0.5 italic">{stage.notes}</p>}
                      </div>
                    </div>
                  );
                })}
                {stages.length === 0 && <p className="text-xs text-[#555]">No production stages yet.</p>}
              </div>
            </div>
          </div>

          {/* RIGHT: 40% */}
          <div className="lg:col-span-2 space-y-4">
            {/* Edit Status + Fields */}
            <div className="p-4" style={{ background: "#111", border: "1px solid rgba(167,139,250,0.1)" }}>
              <h3 className="text-[9px] uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>Edit Order</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Status</label>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                    className="w-full h-9 px-2 text-xs text-white outline-none"
                    style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Est. Delivery</label>
                  <input type="date" value={editEstDelivery} onChange={e => setEditEstDelivery(e.target.value)}
                    className="w-full h-9 px-2 text-xs text-white outline-none"
                    style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }} />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Tracking Number</label>
                  <input value={editTracking} onChange={e => setEditTracking(e.target.value)}
                    placeholder="TRK-123..." className="w-full h-9 px-2 text-xs text-white outline-none"
                    style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }} />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Shipping Method</label>
                  <input value={editShipping} onChange={e => setEditShipping(e.target.value)}
                    placeholder="Leopard Courier..." className="w-full h-9 px-2 text-xs text-white outline-none"
                    style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }} />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Special Instructions</label>
                  <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3}
                    className="w-full px-2 py-1.5 text-xs text-white outline-none resize-none"
                    style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }} />
                </div>
                <button onClick={handleSave} disabled={saving}
                  className="w-full h-9 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  style={{ background: "#C9A84C", color: "#0a0a0a" }}>
                  <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Payment Panel */}
            <div className="p-4" style={{ background: "#111", border: "1px solid rgba(167,139,250,0.1)" }}>
              <h3 className="text-[9px] uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>Payment</h3>
              <div className="space-y-2 mb-3">
                {[
                  { label:"Total",         value: formatPKR(order.totalPkr),       color:"#C9A84C" },
                  { label:"Advance Paid",  value: formatPKR(order.advancePaidPkr), color:"#4ade80" },
                  { label:"Balance Due",   value: formatPKR(order.balanceDuePkr),  color: order.balanceDuePkr > 0 ? "#f87171" : "#4ade80" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-[10px] text-[#555]">{label}</span>
                    <span className="text-sm font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>

              {payments.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  <p className="text-[9px] uppercase tracking-widest text-[#555]">Payment History</p>
                  {payments.map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center px-2 py-1.5"
                      style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
                      <div>
                        <p className="text-[10px] font-bold text-white">{formatPKR(p.amountPkr)}</p>
                        <p className="text-[9px] text-[#555]">{p.paymentMethod} • {formatDate(p.createdAt)}</p>
                        {p.referenceNumber && <p className="text-[9px] text-[#444]">Ref: {p.referenceNumber}</p>}
                      </div>
                      <span className="text-[9px] font-bold text-[#4ade80] uppercase">{p.status}</span>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => setPaymentModal(true)}
                className="w-full h-8 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                style={{ border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C" }}>
                <Plus className="h-3.5 w-3.5" /> Record Payment
              </button>
            </div>

            {/* WhatsApp Templates */}
            <div className="p-4" style={{ background: "#111", border: "1px solid rgba(167,139,250,0.1)" }}>
              <h3 className="text-[9px] uppercase tracking-widest mb-3" style={{ color: "#a78bfa" }}>WhatsApp Templates</h3>
              <div className="space-y-1.5">
                {Object.keys(WA_TEMPLATES).map(key => (
                  <button key={key} onClick={() => openWhatsApp(key)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border text-left transition-all"
                    style={{ border: "1px solid rgba(37,211,102,0.2)", color: "#25d366" }}
                    onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(37,211,102,0.04)"}
                    onMouseLeave={e => (e.currentTarget as any).style.background = ""}>
                    <MessageCircle className="h-3 w-3 flex-shrink-0" /> {key.replace(/_/g," ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-sm p-5 mx-4" style={{ background: "#111", border: "1px solid rgba(201,168,76,0.3)" }}>
            <h3 className="font-display text-base tracking-widest uppercase mb-4" style={{ color: "#C9A84C" }}>Record Payment</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Amount PKR</label>
                <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder={String(Math.round(order.balanceDuePkr || 0))}
                  className="w-full h-9 px-2 text-sm text-white outline-none"
                  style={{ background: "#0a0a0a", border: "1px solid rgba(201,168,76,0.3)" }} />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Method</label>
                <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                  className="w-full h-9 px-2 text-xs text-white outline-none"
                  style={{ background: "#0a0a0a", border: "1px solid rgba(201,168,76,0.3)" }}>
                  {["bank_transfer","paypal","wise","western_union","cash"].map(m => <option key={m} value={m}>{m.replace(/_/g," ")}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Reference #</label>
                <input value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="TXN123..."
                  className="w-full h-9 px-2 text-xs text-white outline-none"
                  style={{ background: "#0a0a0a", border: "1px solid rgba(201,168,76,0.3)" }} />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest text-[#555] block mb-1">Notes</label>
                <input value={payNotes} onChange={e => setPayNotes(e.target.value)}
                  className="w-full h-9 px-2 text-xs text-white outline-none"
                  style={{ background: "#0a0a0a", border: "1px solid rgba(201,168,76,0.3)" }} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setPaymentModal(false)} className="flex-1 h-9 text-xs text-[#555] uppercase tracking-wider border"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
                <button onClick={handlePayment} className="flex-1 h-9 text-xs font-bold uppercase tracking-wider"
                  style={{ background: "#C9A84C", color: "#0a0a0a" }}>Save Payment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
