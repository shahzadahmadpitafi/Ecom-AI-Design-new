import { useState } from "react";
import { Zap, CheckCircle, Circle, Clock, Search, MessageCircle } from "lucide-react";

const STAGE_LABELS: Record<string, string> = {
  order_received:"Order Received", design_approved:"Design Approved", sampling:"Sampling",
  sample_approved:"Sample Approved", cutting:"Cutting", stitching:"Stitching",
  printing:"Printing / Embroidery", quality_check:"Quality Check", packing:"Packing", dispatched:"Dispatched",
};

const STATUS_COLORS: Record<string, string> = {
  pending:"#fbbf24", confirmed:"#60a5fa", sampling:"#a78bfa", in_production:"#c4b5fd",
  quality_check:"#22d3ee", shipped:"#67e8f9", delivered:"#4ade80", cancelled:"#f87171",
};

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [whatsapp, setWhatsapp]       = useState("");
  const [result, setResult]           = useState<any>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const qs = whatsapp ? `?whatsapp=${encodeURIComponent(whatsapp)}` : "";
      const res = await fetch(`/api/track/${orderNumber.toUpperCase().trim()}${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stageStatusColor = (status: string) => {
    if (status === "completed")   return "#C9A84C";
    if (status === "in_progress") return "#a78bfa";
    return "#333";
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0a", fontFamily: "Inter, sans-serif" }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 h-14" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
        <a href="/" className="flex items-center gap-2 no-underline">
          <Zap className="h-5 w-5" style={{ color: "#C9A84C" }} />
          <span className="font-display text-base tracking-widest" style={{ color: "#C9A84C", fontFamily:"'Bebas Neue', sans-serif" }}>SIGNITIVE</span>
        </a>
        <a href="https://wa.me/923114661392" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 h-8 px-3 text-xs font-bold no-underline transition-all"
          style={{ border: "1px solid rgba(37,211,102,0.3)", color: "#25d366" }}>
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Us
        </a>
      </nav>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 py-12">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-display tracking-widest mb-3" style={{ fontFamily:"'Bebas Neue', sans-serif", color: "#C9A84C" }}>
              TRACK YOUR ORDER
            </h1>
            <p className="text-xs text-[#555] uppercase tracking-widest">Enter your order number to see real-time production status</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleTrack} className="p-6 mb-6" style={{ background: "#111", border: "1px solid rgba(167,139,250,0.2)" }}>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase tracking-widest mb-1.5" style={{ color: "#a78bfa" }}>Order Number *</label>
                <input
                  value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required
                  placeholder="SE-2025-0001" className="w-full h-11 px-3 text-sm text-white outline-none uppercase"
                  style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.3)", letterSpacing: "0.05em" }} />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-widest mb-1.5" style={{ color: "#a78bfa" }}>
                  WhatsApp Number <span className="text-[#444] normal-case tracking-normal">(optional — for verification)</span>
                </label>
                <input
                  value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                  placeholder="+923001234567" className="w-full h-11 px-3 text-sm text-white outline-none"
                  style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }} />
              </div>
              {error && (
                <div className="p-3 text-xs" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading || !orderNumber}
                className="w-full h-12 flex items-center justify-center gap-2 font-display tracking-widest uppercase text-sm transition-all disabled:opacity-50"
                style={{ background: "#C9A84C", color: "#0a0a0a", fontFamily:"'Bebas Neue', sans-serif" }}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" /> Tracking...</>
                ) : (
                  <><Search className="h-4 w-4" /> Track Order</>
                )}
              </button>
            </div>
          </form>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="p-5" style={{ background: "#111", border: "1px solid rgba(201,168,76,0.25)", borderTop: "2px solid #C9A84C" }}>
                <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
                  <div>
                    <h2 className="font-display text-2xl tracking-widest" style={{ fontFamily:"'Bebas Neue', sans-serif", color:"#C9A84C" }}>
                      {result.order.orderNumber}
                    </h2>
                    {result.customer?.name && <p className="text-xs text-[#888] mt-0.5">{result.customer.name}{result.customer.country ? ` • ${result.customer.country}` : ""}</p>}
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                      style={{
                        background: `${STATUS_COLORS[result.order.status] || "#888"}15`,
                        color: STATUS_COLORS[result.order.status] || "#888",
                        border: `1px solid ${STATUS_COLORS[result.order.status] || "#888"}40`,
                      }}>
                      {result.order.status.replace(/_/g," ")}
                    </span>
                    {result.order.estimatedDelivery && (
                      <p className="text-[10px] text-[#555] mt-1.5">
                        Est. Delivery: <span className="text-white">{new Date(result.order.estimatedDelivery).toLocaleDateString("en-PK", { day:"2-digit", month:"short", year:"numeric" })}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4" style={{ paddingTop: "12px", borderTop: "1px solid rgba(167,139,250,0.1)" }}>
                  {[
                    { label:"Total",   value: result.order.totalPkr ? `PKR ${Math.round(result.order.totalPkr).toLocaleString()}` : "—" },
                    { label:"Payment", value: result.order.paymentStatus || "—" },
                    { label:"Tracking",value: result.order.trackingNumber || "Pending" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[9px] uppercase tracking-widest text-[#555]">{label}</p>
                      <p className="text-xs text-white mt-0.5 font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Production Timeline */}
              {result.stages?.length > 0 && (
                <div className="p-5" style={{ background: "#111", border: "1px solid rgba(167,139,250,0.1)" }}>
                  <h3 className="text-[9px] uppercase tracking-widest mb-5" style={{ color: "#a78bfa" }}>Production Timeline</h3>
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-[7px] top-0 bottom-0 w-px" style={{ background: "rgba(167,139,250,0.15)" }} />
                    <div className="space-y-4">
                      {result.stages.map((stage: any) => {
                        const isDone   = stage.status === "completed";
                        const isActive = stage.status === "in_progress";
                        const color    = stageStatusColor(stage.status);
                        return (
                          <div key={stage.id} className="flex gap-4 relative">
                            <div className="flex-shrink-0 mt-0.5 z-10">
                              {isDone ? (
                                <CheckCircle className="h-3.5 w-3.5" style={{ color: "#C9A84C" }} />
                              ) : isActive ? (
                                <div className="w-3.5 h-3.5 rounded-full border-2 animate-pulse" style={{ borderColor:"#a78bfa", background:"rgba(167,139,250,0.2)" }} />
                              ) : (
                                <Circle className="h-3.5 w-3.5" style={{ color: "#333" }} />
                              )}
                            </div>
                            <div className="flex-1 pb-3" style={{ borderBottom: "1px solid rgba(167,139,250,0.06)" }}>
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <p className="text-xs font-bold" style={{ color: isDone ? "#C9A84C" : isActive ? "#a78bfa" : "#555" }}>
                                  {STAGE_LABELS[stage.stage] || stage.stage}
                                </p>
                                {isDone && stage.completedAt && (
                                  <p className="text-[9px] text-[#444]">
                                    {new Date(stage.completedAt).toLocaleDateString("en-PK", { day:"2-digit", month:"short" })}
                                  </p>
                                )}
                                {isActive && <span className="text-[9px] font-bold" style={{ color:"#a78bfa" }}>● IN PROGRESS</span>}
                              </div>
                              {stage.notes && <p className="text-[10px] text-[#555] mt-0.5 italic">{stage.notes}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact */}
              <div className="p-4 flex items-center justify-between flex-wrap gap-3"
                style={{ background:"rgba(37,211,102,0.04)", border:"1px solid rgba(37,211,102,0.15)" }}>
                <div>
                  <p className="text-xs font-bold text-white">Have questions about your order?</p>
                  <p className="text-[10px] text-[#555]">Contact Signitive Enterprises on WhatsApp for instant support</p>
                </div>
                <a href={`https://wa.me/923114661392?text=${encodeURIComponent(`Hi Signitive! I'm following up on my order ${result.order.orderNumber}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 h-9 px-4 text-xs font-bold no-underline"
                  style={{ border:"1px solid rgba(37,211,102,0.4)", color:"#25d366", background:"rgba(37,211,102,0.06)" }}>
                  <MessageCircle className="h-3.5 w-3.5" /> Chat on WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-[10px] uppercase tracking-widest text-[#333]">
        Signitive Enterprises · Sialkot, Pakistan
      </footer>
    </div>
  );
}
