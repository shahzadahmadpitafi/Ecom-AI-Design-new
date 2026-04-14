import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCreateQuoteRequest, useCalculateQuote, useListProducts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, Minus, Trash2, Calculator, Send, CheckCircle, MessageCircle, Clock, ArrowRight } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { waLink } from "@/components/WhatsAppButton";

interface QuoteItem {
  productId: number;
  name: string;
  quantity: number;
  basePricePkr: number;
}

const TIERS = [
  { min: 1, max: 49, discount: 0, label: "Starter", color: "text-muted-foreground" },
  { min: 50, max: 99, discount: 10, label: "Growth", color: "text-primary" },
  { min: 100, max: 199, discount: 20, label: "Scale", color: "text-primary" },
  { min: 200, max: Infinity, discount: 25, label: "Enterprise", color: "text-primary" },
];

const TIMELINE: Record<string, string> = {
  "Starter": "7–10 working days",
  "Growth": "10–12 working days",
  "Scale": "12–15 working days",
  "Enterprise": "Contact for timeline",
};

export default function Quote() {
  const { toast } = useToast();
  const { format } = useCurrency();

  const { data: products } = useListProducts({ limit: 200 }, { query: { queryKey: ["listProducts"] } });
  const calculateQuote = useCalculateQuote();
  const createQuoteRequest = useCreateQuoteRequest();

  const [items, setItems] = useState<QuoteItem[]>([]);
  const [calculation, setCalculation] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedProductId, setSelectedProductId] = useState("");
  const [addQty, setAddQty] = useState(25);

  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);

  const currentTier = TIERS.slice().reverse().find(t => totalUnits >= t.min) ?? TIERS[0];
  const nextTier = TIERS.find(t => t.min > totalUnits);
  const progressToNextTier = nextTier ? Math.min((totalUnits / nextTier.min) * 100, 100) : 100;

  const totalBase = items.reduce((s, i) => s + i.basePricePkr * i.quantity, 0);
  const discountAmount = totalBase * (currentTier.discount / 100);
  const totalAfterDiscount = totalBase - discountAmount;

  const addItem = () => {
    if (!selectedProductId) return;
    const product = products?.find(p => p.id.toString() === selectedProductId);
    if (!product) return;
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      setItems(items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + addQty } : i));
    } else {
      setItems([...items, { productId: product.id, name: product.name, quantity: addQty, basePricePkr: product.basePricePkr }]);
    }
    setCalculation(null);
  };

  const removeItem = (id: number) => { setItems(items.filter(i => i.productId !== id)); setCalculation(null); };
  const updateQty = (id: number, qty: number) => {
    if (qty < 1) return;
    setItems(items.map(i => i.productId === id ? { ...i, quantity: qty } : i));
    setCalculation(null);
  };

  const handleCalculate = async () => {
    if (items.length === 0) return;
    setIsCalculating(true);
    try {
      const result = await calculateQuote.mutateAsync({
        data: { items: items.map(i => ({ productId: i.productId, quantity: i.quantity, basePricePkr: i.basePricePkr })) }
      });
      setCalculation(result);
    } catch { toast({ title: "Calculation failed", variant: "destructive" }); }
    finally { setIsCalculating(false); }
  };

  const handleSubmit = async () => {
    if (!customerName || !customerEmail || items.length === 0) {
      toast({ title: "Missing information", description: "Please fill in your name, email, and add at least one product.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const estimatedTotal = calculation?.totalPkr ?? totalAfterDiscount;
      await createQuoteRequest.mutateAsync({
        data: { customerName, customerEmail, customerPhone: customerPhone || null, items: JSON.stringify(items), totalUnits, estimatedTotal, notes: notes || null }
      });
      setIsSubmitted(true);
      toast({ title: "Quote request sent!", description: "We'll respond within 1 hour on WhatsApp." });
    } catch { toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" }); }
    finally { setIsSubmitting(false); }
  };

  const buildWaMessage = () => {
    const lines = ["Hi Signitive! I'd like a quote for:", "", ...items.map(i => `• ${i.name} — ${i.quantity} units (PKR ${i.basePricePkr.toLocaleString()}/unit)`), "", `Total Units: ${totalUnits}`, `Estimated Total: PKR ${Math.round(totalAfterDiscount).toLocaleString()}`, `Discount Tier: ${currentTier.label} (${currentTier.discount}% off)`, "", notes ? `Notes: ${notes}` : ""].filter(l => l !== undefined).join("\n");
    return lines;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-primary/10 border border-primary flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-display text-4xl uppercase tracking-wider text-white mb-4">Quote Sent!</h2>
          <p className="text-muted-foreground mb-2">Thank you, <strong className="text-white">{customerName}</strong>.</p>
          <p className="text-muted-foreground mb-4">We'll respond to <strong className="text-primary">{customerEmail}</strong> within 24 hours.</p>
          <div className="border border-[#25D366]/30 bg-[#25D366]/5 p-4 mb-8">
            <p className="text-sm text-muted-foreground mb-3">For faster response, send your quote on WhatsApp:</p>
            <a href={waLink(buildWaMessage())} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white font-display tracking-wider uppercase">
                <MessageCircle className="mr-2 h-4 w-4" /> Send on WhatsApp
              </Button>
            </a>
          </div>
          <div className="flex gap-3 justify-center">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10 font-display tracking-wider uppercase">
              <Link href="/catalog">Continue Shopping</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider uppercase">
              <Link href="/studio">Design More</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-border/40 bg-[#0f0f0f] py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-primary">Quote</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-wider text-white uppercase mb-3">
            Bulk <span className="text-primary">Quote</span>
          </h1>
          <p className="text-muted-foreground text-lg">Add products, set quantities, and get instant tier-based pricing. No commitment required.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tier Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {TIERS.map(tier => {
            const active = currentTier.label === tier.label && totalUnits > 0;
            return (
              <div key={tier.label} className={`border p-4 text-center transition-all ${active ? "border-primary bg-primary/10" : "border-border/30 bg-card/10"}`}>
                <div className={`font-display text-3xl tracking-wider mb-1 ${active ? "text-primary" : "text-muted-foreground/60"}`}>
                  {tier.discount === 0 ? "Base" : `${tier.discount}% OFF`}
                </div>
                <div className={`font-display text-sm uppercase tracking-widest mb-1 ${active ? "text-primary" : "text-muted-foreground"}`}>{tier.label}</div>
                <div className="text-muted-foreground/60 text-xs">
                  {tier.max === Infinity ? `${tier.min}+ units` : `${tier.min}–${tier.max} units`}
                </div>
                {active && <CheckCircle className="h-4 w-4 text-primary mx-auto mt-2" />}
              </div>
            );
          })}
        </div>

        {/* MOQ Progress Bar */}
        {nextTier && totalUnits > 0 && (
          <div className="mb-8 p-5 border border-border/30 bg-card/10">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-muted-foreground">
                Add <strong className="text-white">{nextTier.min - totalUnits} more units</strong> to unlock{" "}
                <strong className="text-primary">{nextTier.discount}% off</strong> ({nextTier.label} tier)
              </p>
              <p className="text-sm font-mono text-muted-foreground">{totalUnits} / {nextTier.min}</p>
            </div>
            <div className="h-2 bg-muted/30 w-full">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressToNextTier}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground/60 mt-1">
              <span>{currentTier.label}</span>
              <span>{nextTier.label} ({nextTier.discount}% off)</span>
            </div>
          </div>
        )}

        {/* Savings Display */}
        {totalUnits > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="border border-border/30 bg-card/10 p-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Total Units</div>
              <div className="font-display text-2xl text-white">{totalUnits}</div>
            </div>
            <div className="border border-border/30 bg-card/10 p-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Subtotal</div>
              <div className="font-display text-2xl text-muted-foreground line-through">{format(Math.round(totalBase))}</div>
            </div>
            <div className="border border-primary/30 bg-primary/5 p-4">
              <div className="text-xs uppercase tracking-widest text-primary mb-1">You Save</div>
              <div className="font-display text-2xl text-primary">{format(Math.round(discountAmount))}</div>
            </div>
            <div className="border border-primary/50 bg-primary/10 p-4">
              <div className="text-xs uppercase tracking-widest text-primary mb-1">Total ({currentTier.discount}% off)</div>
              <div className="font-display text-2xl text-primary">{format(Math.round(totalAfterDiscount))}</div>
            </div>
          </div>
        )}

        {/* Production Timeline */}
        {totalUnits > 0 && (
          <div className="mb-8 border border-border/30 bg-card/10 p-5 flex items-center gap-4">
            <Clock className="h-6 w-6 text-primary shrink-0" />
            <div>
              <div className="text-white font-semibold">Estimated Production: <span className="text-primary">{TIMELINE[currentTier.label]}</span></div>
              <div className="text-muted-foreground text-sm">After sample approval. Express production available — contact us.</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Products */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Product */}
            <div className="border border-border/30 bg-card/10 p-5">
              <p className="font-display text-lg uppercase tracking-widest text-white mb-4">Add Products</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[180px]">
                  <select
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-border/50 text-foreground px-3 py-2 text-sm appearance-none focus:border-primary outline-none"
                    data-testid="select-add-product"
                  >
                    <option value="">Select a product...</option>
                    {products?.map(p => (
                      <option key={p.id} value={p.id.toString()}>{p.name} — PKR {p.basePricePkr.toLocaleString()}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setAddQty(q => Math.max(1, q - 1))} className="w-9 h-9 border border-border/50 text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center">
                    <Minus className="h-3 w-3" />
                  </button>
                  <Input type="number" value={addQty} onChange={e => setAddQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 bg-[#0a0a0a] border-border/50 text-center" min={1} data-testid="input-add-qty" />
                  <button onClick={() => setAddQty(q => q + 1)} className="w-9 h-9 border border-border/50 text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <Button onClick={addItem} disabled={!selectedProductId} className="bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider uppercase" data-testid="button-add-item">
                  Add
                </Button>
              </div>
            </div>

            {/* Items Table */}
            {items.length === 0 ? (
              <div className="border border-dashed border-border/30 p-12 text-center">
                <p className="text-muted-foreground">No products added yet. Select a product above to get started.</p>
              </div>
            ) : (
              <div className="border border-border/30 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-card/30">
                      <th className="text-left px-4 py-3 font-display uppercase tracking-wider text-muted-foreground text-xs">Product</th>
                      <th className="text-center px-4 py-3 font-display uppercase tracking-wider text-muted-foreground text-xs">Qty</th>
                      <th className="text-right px-4 py-3 font-display uppercase tracking-wider text-muted-foreground text-xs">Unit Price</th>
                      <th className="text-right px-4 py-3 font-display uppercase tracking-wider text-muted-foreground text-xs">Discount</th>
                      <th className="text-right px-4 py-3 font-display uppercase tracking-wider text-muted-foreground text-xs">Total</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => {
                      const unitPrice = item.basePricePkr * (1 - currentTier.discount / 100);
                      const total = unitPrice * item.quantity;
                      return (
                        <tr key={item.productId} className="border-b border-border/30 hover:bg-card/10 transition-colors" data-testid={`row-quote-${item.productId}`}>
                          <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-6 h-6 border border-border/40 text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center"><Minus className="h-3 w-3" /></button>
                              <span className="w-10 text-center">{item.quantity}</span>
                              <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-6 h-6 border border-border/40 text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">PKR {item.basePricePkr.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-primary font-medium">{currentTier.discount > 0 ? `-${currentTier.discount}%` : "—"}</td>
                          <td className="px-4 py-3 text-right font-bold text-white">PKR {Math.round(total).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive transition-colors" data-testid={`button-remove-${item.productId}`}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {items.length > 0 && (
              <Button onClick={handleCalculate} disabled={isCalculating} variant="outline" className="border-primary text-primary hover:bg-primary/10 font-display tracking-wider uppercase" data-testid="button-calculate">
                <Calculator className="h-4 w-4 mr-2" />
                {isCalculating ? "Calculating..." : "Verify Pricing"}
              </Button>
            )}

            {/* Free Sample Upsell */}
            <div className="border border-primary/20 bg-primary/5 p-5">
              <div className="font-display text-lg text-white uppercase tracking-wider mb-2">Not Ready for Bulk?</div>
              <p className="text-muted-foreground text-sm mb-4">Order 1 sample garment — PKR 2,500, fully deducted from your bulk order.</p>
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10 font-display tracking-wider uppercase text-sm">
                <Link href="/contact">Add Sample to Quote <ArrowRight className="ml-2 h-3 w-3" /></Link>
              </Button>
            </div>
          </div>

          {/* Right: Contact + Submit */}
          <div className="space-y-5">
            <div className="border border-border/30 bg-card/10 p-6">
              <p className="font-display text-xl uppercase tracking-widest text-white mb-6">Your Details</p>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Full Name *</Label>
                  <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="John Smith" className="mt-1 bg-[#0a0a0a] border-border/50" data-testid="input-customer-name" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Email *</Label>
                  <Input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="john@brand.com" className="mt-1 bg-[#0a0a0a] border-border/50" data-testid="input-customer-email" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Phone / WhatsApp</Label>
                  <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+1 555 123 4567" className="mt-1 bg-[#0a0a0a] border-border/50" data-testid="input-customer-phone" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Notes</Label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Printing preference, sample requirement, delivery country..." className="mt-1 bg-[#0a0a0a] border-border/50 resize-none" rows={4} data-testid="textarea-notes" />
                </div>
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={isSubmitting || items.length === 0} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xl tracking-widest uppercase h-14" data-testid="button-submit-quote">
              {isSubmitting ? "Sending..." : <><Send className="h-5 w-5 mr-2" /> Request Quote</>}
            </Button>

            {items.length > 0 && (
              <a href={waLink(buildWaMessage())} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white font-display text-xl tracking-widest uppercase h-14">
                  <MessageCircle className="h-5 w-5 mr-2" /> Send Quote to WhatsApp
                </Button>
              </a>
            )}

            <p className="text-xs text-muted-foreground text-center">
              We respond within 1 hour on WhatsApp. All prices in PKR — USD conversion available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
