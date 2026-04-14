import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCreateQuoteRequest, useCalculateQuote, useListProducts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, Minus, Trash2, Calculator, Send, ChevronRight, CheckCircle } from "lucide-react";

interface QuoteItem {
  productId: number;
  name: string;
  quantity: number;
  basePricePkr: number;
}

const TIER_LABELS = [
  { units: 50, discount: 10, label: "50+ units → 10% off" },
  { units: 100, discount: 20, label: "100+ units → 20% off" },
  { units: 200, discount: 25, label: "200+ units → 25% off" },
];

export default function Quote() {
  const { toast } = useToast();
  const { data: products } = useListProducts({ limit: 100 }, {
    query: { queryKey: ["listProducts"] }
  });

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
  const [addQty, setAddQty] = useState(12);

  const addItem = () => {
    if (!selectedProductId) return;
    const product = products?.find(p => p.id.toString() === selectedProductId);
    if (!product) return;

    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      setItems(items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + addQty } : i));
    } else {
      setItems([...items, {
        productId: product.id,
        name: product.name,
        quantity: addQty,
        basePricePkr: product.basePricePkr,
      }]);
    }
    setCalculation(null);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(i => i.productId !== id));
    setCalculation(null);
  };

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
        data: {
          items: items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            basePricePkr: i.basePricePkr,
          }))
        }
      });
      setCalculation(result);
    } catch {
      toast({ title: "Calculation failed", variant: "destructive" });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = async () => {
    if (!customerName || !customerEmail || items.length === 0) {
      toast({ title: "Missing information", description: "Please fill in your name, email, and add at least one product.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
      const estimatedTotal = calculation?.totalPkr ?? items.reduce((s, i) => s + i.basePricePkr * i.quantity, 0);

      await createQuoteRequest.mutateAsync({
        data: {
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          items: JSON.stringify(items),
          totalUnits,
          estimatedTotal,
          notes: notes || null,
        }
      });
      setIsSubmitted(true);
      toast({ title: "Quote request sent!", description: "We'll get back to you within 24 hours." });
    } catch {
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const nextTier = TIER_LABELS.find(t => totalUnits < t.units);
  const progressToNextTier = nextTier ? Math.min((totalUnits / nextTier.units) * 100, 100) : 100;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-primary/10 border border-primary flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-display text-4xl uppercase tracking-wider text-white mb-4">Quote Sent!</h2>
          <p className="text-muted-foreground mb-2">Thank you, <strong className="text-white">{customerName}</strong>.</p>
          <p className="text-muted-foreground mb-8">Our team will review your order and send a detailed quote to <strong className="text-primary">{customerEmail}</strong> within 24 hours.</p>
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
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/30 py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-wider text-white uppercase mb-3">
            Bulk <span className="text-primary">Quote</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Add products, set quantities, and get instant tier-based pricing. No commitment required.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Discount Tiers Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {TIER_LABELS.map(tier => (
            <div
              key={tier.units}
              className={`border p-4 text-center transition-all ${totalUnits >= tier.units ? "border-primary bg-primary/10" : "border-border bg-card/30"}`}
            >
              <p className={`font-display text-2xl tracking-widest ${totalUnits >= tier.units ? "text-primary" : "text-muted-foreground"}`}>
                {tier.discount}% OFF
              </p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{tier.units}+ units</p>
              {totalUnits >= tier.units && (
                <CheckCircle className="h-4 w-4 text-primary mx-auto mt-2" />
              )}
            </div>
          ))}
        </div>

        {/* MOQ Progress Bar */}
        {nextTier && (
          <div className="mb-10 p-4 border border-border bg-card/30">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-muted-foreground">
                Add <strong className="text-white">{nextTier.units - totalUnits} more units</strong> to unlock{" "}
                <strong className="text-primary">{nextTier.discount}% off</strong>
              </p>
              <p className="text-sm text-muted-foreground">{totalUnits} / {nextTier.units} units</p>
            </div>
            <Progress value={progressToNextTier} className="h-2 bg-muted" />
            <p className="text-xs text-muted-foreground mt-2">{nextTier.label}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Add products + table */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Product Row */}
            <div className="border border-border bg-card/30 p-4">
              <p className="font-display text-lg uppercase tracking-widest text-white mb-4">Add Products</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[180px]">
                  <select
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    className="w-full bg-background border border-border text-foreground px-3 py-2 text-sm appearance-none"
                    data-testid="select-add-product"
                  >
                    <option value="">Select a product...</option>
                    {products?.map(p => (
                      <option key={p.id} value={p.id.toString()}>{p.name} — PKR {p.basePricePkr.toLocaleString()}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAddQty(q => Math.max(1, q - 1))}
                    className="w-8 h-9 border border-border text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <Input
                    type="number"
                    value={addQty}
                    onChange={e => setAddQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-background border-border text-center"
                    min={1}
                    data-testid="input-add-qty"
                  />
                  <button
                    onClick={() => setAddQty(q => q + 1)}
                    className="w-8 h-9 border border-border text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <Button
                  onClick={addItem}
                  disabled={!selectedProductId}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider uppercase"
                  data-testid="button-add-item"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Quote Table */}
            {items.length === 0 ? (
              <div className="border border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground">No products added yet. Start by selecting a product above.</p>
              </div>
            ) : (
              <div className="border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card/50">
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
                      const discountPct = calculation ? (calculation.discountPercent ?? 0) : 0;
                      const unitPrice = item.basePricePkr * (1 - discountPct / 100);
                      const total = unitPrice * item.quantity;
                      return (
                        <tr key={item.productId} className="border-b border-border/50 hover:bg-card/20 transition-colors" data-testid={`row-quote-${item.productId}`}>
                          <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-6 h-6 border border-border text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-10 text-center">{item.quantity}</span>
                              <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-6 h-6 border border-border text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            PKR {item.basePricePkr.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-primary font-medium">
                            {discountPct > 0 ? `-${discountPct}%` : "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-white">
                            PKR {Math.round(total).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              data-testid={`button-remove-${item.productId}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border bg-card/30">
                      <td colSpan={4} className="px-4 py-3 font-display uppercase tracking-wider text-muted-foreground text-sm">
                        Total Units: <strong className="text-white">{totalUnits}</strong>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {calculation && (
                          <div>
                            <p className="text-sm text-muted-foreground line-through">PKR {Math.round(calculation.subtotalPkr).toLocaleString()}</p>
                            <p className="text-xl font-bold text-primary font-display tracking-wider">PKR {Math.round(calculation.totalPkr).toLocaleString()}</p>
                          </div>
                        )}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {items.length > 0 && (
              <Button
                onClick={handleCalculate}
                disabled={isCalculating}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 font-display tracking-wider uppercase"
                data-testid="button-calculate"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {isCalculating ? "Calculating..." : "Calculate Pricing"}
              </Button>
            )}

            {calculation && (
              <div className="border border-primary/30 bg-primary/5 p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Tier</p>
                    <p className="font-display text-lg text-primary">{calculation.discountTier}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Discount</p>
                    <p className="font-display text-lg text-primary">{calculation.discountPercent}% off</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">You Save</p>
                    <p className="font-display text-lg text-primary">PKR {Math.round(calculation.discountAmountPkr).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Est. Production</p>
                    <p className="font-display text-lg text-white">{calculation.productionDays} days</p>
                  </div>
                </div>
                {calculation.requiresCustomPricing && (
                  <div className="border border-primary/50 bg-primary/10 p-3 mt-2">
                    <p className="text-sm text-primary font-medium">Large order detected — contact us for a custom pricing proposal and dedicated account manager.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Contact Form */}
          <div className="space-y-6">
            <div className="border border-border bg-card/30 p-6">
              <p className="font-display text-xl uppercase tracking-widest text-white mb-6">Your Details</p>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Full Name *</Label>
                  <Input
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="John Smith"
                    className="mt-1 bg-background border-border"
                    data-testid="input-customer-name"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Email *</Label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="john@brand.com"
                    className="mt-1 bg-background border-border"
                    data-testid="input-customer-email"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Phone / WhatsApp</Label>
                  <Input
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="+1 555 123 4567"
                    className="mt-1 bg-background border-border"
                    data-testid="input-customer-phone"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Printing method preference, sample requirement, delivery country..."
                    className="mt-1 bg-background border-border resize-none"
                    rows={4}
                    data-testid="textarea-notes"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xl tracking-widest uppercase h-14"
              data-testid="button-submit-quote"
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <><Send className="h-5 w-5 mr-2" /> Request Quote</>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              We respond within 24 hours. Or reach us directly on{" "}
              <a href="https://wa.me/923114661392" className="text-primary hover:underline">WhatsApp</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
