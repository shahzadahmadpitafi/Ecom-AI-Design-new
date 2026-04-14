import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Zap, Globe, Star, MapPin, Shield, Truck, Clock, ChevronRight, MessageCircle } from "lucide-react";
import { useGetFeaturedProducts, getGetFeaturedProductsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { waLink } from "@/components/WhatsAppButton";

function useCountUp(target: number, duration = 2200, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, start]);
  return count;
}

function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCountUp(value, 2200, started);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="text-center px-4 py-5 md:px-6">
      <div className="font-display text-4xl md:text-5xl text-primary tracking-wider">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-muted-foreground text-xs uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}

const CATEGORIES = [
  { name: "Streetwear", slug: "Streetwear", count: 18, image: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600&auto=format&fit=crop" },
  { name: "Fitness Wear", slug: "Fitness Wear", count: 9, image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop" },
  { name: "Sports Uniforms", slug: "Sports Uniforms", count: 8, image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop" },
  { name: "Boxing", slug: "Boxing", count: 7, image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&auto=format&fit=crop" },
  { name: "Motocross", slug: "Motocross", count: 7, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop" },
  { name: "Caps", slug: "Caps", count: 4, image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop" },
  { name: "Team Wear", slug: "Team Wear", count: 3, image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600&auto=format&fit=crop" },
  { name: "Sports Goods", slug: "Sports Goods", count: 5, image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=600&auto=format&fit=crop" },
];

const STEPS = [
  { n: "01", title: "Design", desc: "Use the AI Studio or send us your artwork. We accept AI, PDF, PSD, and vector formats." },
  { n: "02", title: "Sample", desc: "Receive a physical sample garment in 5–7 working days before bulk production." },
  { n: "03", title: "Production", desc: "Bulk manufacturing begins immediately after sample approval with full quality tracking." },
  { n: "04", title: "QC", desc: "Every unit is individually inspected against your approved sample before packing." },
  { n: "05", title: "Shipping", desc: "DHL / FedEx Express worldwide. Typical transit: 3–5 days to US/UK/UAE/AUS." },
];

const TESTIMONIALS = [
  { quote: "Ordered 200 custom hoodies — quality exceeded expectations. Delivered to UK in 12 days. Will be reordering.", name: "James T.", location: "UK Brand Owner", stars: 5 },
  { quote: "The AI design tool is incredible. We launched our entire streetwear brand in 3 weeks. Communication was excellent throughout.", name: "Maria K.", location: "USA", stars: 5 },
  { quote: "Best custom manufacturer we've found. MOQ is reasonable, prices are competitive, and quality is consistently excellent.", name: "Ahmed R.", location: "UAE", stars: 5 },
];

export default function Home() {
  const { format } = useCurrency();
  const { data: featuredProducts, isLoading } = useGetFeaturedProducts({
    query: { queryKey: getGetFeaturedProductsQueryKey() }
  });

  return (
    <div className="flex flex-col w-full">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=2070&auto=format&fit=crop"
            alt="Premium apparel manufacturing"
            className="w-full h-full object-cover object-center opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/20 via-[#0a0a0a]/60 to-[#0a0a0a]" />
        </div>
        <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center pt-24 pb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 border border-primary/40 bg-primary/10">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-widest text-primary">Sialkot, Pakistan — World Capital of Sportswear</span>
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-[110px] font-display font-bold tracking-wider text-white mb-6 uppercase leading-[0.9]">
            DESIGN.<br /><span className="text-primary">MANUFACTURE.</span><br />DOMINATE.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Pakistan's Premier Custom Apparel Manufacturer — From Your Idea to 500 Units in 15 Days
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xl tracking-wider h-14 px-10">
              <Link href="/studio">Start Designing Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 font-display text-xl tracking-wider h-14 px-10">
              <Link href="/catalog">Browse Catalog</Link>
            </Button>
          </div>
          <div className="w-full max-w-3xl border border-border/40 bg-black/40 backdrop-blur grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border/40">
            <StatCounter value={500} suffix="+" label="Happy Clients" />
            <StatCounter value={50} suffix="+" label="Countries Shipped" />
            <StatCounter value={1000000} suffix="+" label="Units Made" />
            <StatCounter value={15} suffix=" Yrs" label="Experience" />
          </div>
        </div>
      </section>

      {/* ── TICKER ───────────────────────────────────────────── */}
      <div className="bg-primary text-primary-foreground py-3 overflow-hidden">
        <div className="flex gap-16 whitespace-nowrap animate-marquee font-display tracking-widest text-sm uppercase">
          {Array(6).fill(null).map((_, i) => (
            <span key={i} className="flex items-center gap-16 shrink-0">
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" />MOQ 25 Units</span>
              <span className="flex items-center gap-2"><Globe className="h-4 w-4" />Ships Worldwide</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4" />15-Day Production</span>
              <span className="flex items-center gap-2"><Shield className="h-4 w-4" />Quality Guaranteed</span>
              <span className="flex items-center gap-2"><Truck className="h-4 w-4" />DHL / FedEx Express</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── AI STUDIO SHOWCASE ───────────────────────────────── */}
      <section className="bg-[#0f0f0f] py-20 border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-primary/30 bg-primary/5">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium uppercase tracking-widest text-primary">No Design Skills Needed</span>
              </div>
              <h2 className="font-display text-5xl md:text-6xl font-bold tracking-wider text-white uppercase leading-tight mb-6">
                Design Your<br /><span className="text-primary">Collection</span><br />in 30 Seconds
              </h2>
              <div className="space-y-5 mb-8">
                {[
                  { n: "01", title: "Type your design prompt", desc: "Describe your vision in plain English — colors, styles, graphics, mood." },
                  { n: "02", title: "AI generates it on your garment", desc: "Powered by Flux AI, your design appears live on a realistic mockup instantly." },
                  { n: "03", title: "Place your bulk order", desc: "Happy with the design? Add to quote and we'll manufacture it for you." },
                ].map(step => (
                  <div key={step.n} className="flex gap-4">
                    <div className="font-display text-2xl text-primary shrink-0 w-10">{step.n}</div>
                    <div>
                      <div className="font-semibold text-white mb-1">{step.title}</div>
                      <div className="text-muted-foreground text-sm">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xl tracking-wider h-14 px-10">
                <Link href="/studio">Try the AI Studio Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
            <div className="border border-primary/30 bg-card/30 p-6 relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="bg-[#0a0a0a] border border-border/30 p-4 mb-4">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">AI Prompt</div>
                <div className="text-white font-mono text-sm">"Bold dragon with gold foil effect, streetwear style, centered chest print"</div>
              </div>
              <div className="aspect-square bg-[#111] border border-border/20 flex items-center justify-center relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&auto=format&fit=crop"
                  alt="Custom hoodie design preview"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-primary/60 border-dashed w-2/3 h-1/2 flex items-center justify-center">
                    <span className="text-primary/80 text-xs uppercase tracking-widest">Print Zone</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="flex-1 h-9 bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <span className="text-primary text-xs uppercase tracking-widest font-medium">Generating design...</span>
                </div>
                <div className="w-9 h-9 bg-primary flex items-center justify-center"><Zap className="h-4 w-4 text-black" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT CATEGORIES ───────────────────────────────── */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="font-display text-5xl md:text-6xl font-bold tracking-wider text-white uppercase">
              Product <span className="text-primary">Categories</span>
            </h2>
            <p className="text-muted-foreground mt-3 text-lg">60+ products across 8 categories. All customizable, all from Sialkot.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/catalog?category=${encodeURIComponent(cat.slug)}`}>
                <div className="group relative aspect-square overflow-hidden border border-border/30 hover:border-primary transition-all duration-300 cursor-pointer">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-60 group-hover:opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 font-display tracking-wider">{cat.count}</div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <div className="font-display text-lg md:text-xl text-white tracking-wider uppercase">{cat.name}</div>
                    <div className="flex items-center gap-1 text-primary text-xs uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      View All <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="absolute inset-0 border-2 border-primary scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────── */}
      <section className="py-20 bg-[#0f0f0f] border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="font-display text-5xl md:text-6xl font-bold tracking-wider text-white uppercase">
                Best <span className="text-primary">Sellers</span>
              </h2>
              <p className="text-muted-foreground mt-2">Top picks from brands worldwide</p>
            </div>
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10 font-display tracking-wider self-start md:self-auto">
              <Link href="/catalog">View All Products <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoading ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="border border-border/30 bg-card/20">
                <Skeleton className="aspect-square" />
                <div className="p-4 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
              </div>
            )) : featuredProducts?.slice(0, 4).map(product => (
              <Link key={product.id} href={`/catalog`}>
                <div className="group border border-border/30 hover:border-primary transition-all duration-200 bg-card/20 cursor-pointer">
                  <div className="aspect-square overflow-hidden bg-[#111] relative">
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=400&auto=format&fit=crop"}
                      alt={product.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-display tracking-wider px-2 py-0.5">{product.category}</div>
                  </div>
                  <div className="p-4">
                    <div className="font-display text-lg text-white uppercase tracking-wider mb-1">{product.name}</div>
                    <div className="text-primary font-semibold text-sm">From {format(product.basePricePkr)} / unit</div>
                    <div className="text-muted-foreground text-xs mt-1">MOQ: {product.minOrderQty} units</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW WE MANUFACTURE ───────────────────────────────── */}
      <section className="py-20 bg-[#0a0a0a] border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-5xl md:text-6xl font-bold tracking-wider text-white uppercase">
              How We <span className="text-primary">Manufacture</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">From design file to your door — our proven 5-step process</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {STEPS.map((step, i) => (
              <div key={i} className="border border-border/30 bg-card/20 p-6 hover:border-primary/50 transition-colors">
                <div className="font-display text-4xl text-primary mb-4">{step.n}</div>
                <div className="font-display text-xl text-white uppercase tracking-wider mb-2">{step.title}</div>
                <div className="text-muted-foreground text-sm leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST SIGNALS ────────────────────────────────────── */}
      <section className="py-16 bg-[#0f0f0f] border-t border-border/30">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground uppercase tracking-widest text-sm text-center mb-8">Trusted by brands in 50+ countries</p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            {["🇺🇸 USA", "🇬🇧 UK", "🇦🇪 UAE", "🇦🇺 AUS", "🇨🇦 CAN", "🇩🇪 GER", "🇫🇷 FRA", "🇳🇱 NED"].map(c => (
              <div key={c} className="border border-border/40 px-5 py-2 font-display text-sm text-muted-foreground tracking-widest">{c}</div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <a href="https://signitiveenterprises.trustpass.alibaba.com" target="_blank" rel="noopener noreferrer"
              className="border border-[#FF6A00]/40 bg-[#FF6A00]/5 p-5 flex items-center gap-4 hover:border-[#FF6A00] transition-colors">
              <div className="w-12 h-12 bg-[#FF6A00] flex items-center justify-center shrink-0 font-bold text-white text-sm">ALI</div>
              <div>
                <div className="font-semibold text-white">Alibaba TrustPass Verified</div>
                <div className="text-muted-foreground text-sm">Premium verified supplier</div>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </a>
            <div className="border border-border/30 bg-card/20 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0"><MapPin className="h-6 w-6 text-primary" /></div>
              <div>
                <div className="font-semibold text-white">Sialkot Manufacturer 🇵🇰</div>
                <div className="text-muted-foreground text-sm">World Capital of Sportswear</div>
              </div>
            </div>
            <div className="border border-border/30 bg-card/20 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0"><Shield className="h-6 w-6 text-primary" /></div>
              <div>
                <div className="font-semibold text-white">Quality Guaranteed</div>
                <div className="text-muted-foreground text-sm">100% satisfaction or we remake it</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-20 bg-[#0a0a0a] border-t border-border/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-5xl font-bold tracking-wider text-white uppercase text-center mb-12">
            What Clients <span className="text-primary">Say</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="border border-border/40 bg-card/20 p-6 relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <div className="flex gap-1 mb-4">{Array(t.stars).fill(0).map((_, s) => <Star key={s} className="h-4 w-4 fill-primary text-primary" />)}</div>
                <p className="text-white leading-relaxed mb-6">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-primary">{t.name}</div>
                  <div className="text-muted-foreground text-sm">{t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FREE SAMPLE CTA ──────────────────────────────────── */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground uppercase tracking-wider mb-4">
            Not Ready to Commit? Order a Sample First.
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Test our quality with a single sample garment. PKR 2,500 per sample — fully deducted from your bulk order.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-display text-xl tracking-wider h-14 px-10">
              <Link href="/contact">Order a Sample</Link>
            </Button>
            <a href={waLink("Hi Signitive! I'd like to order a sample garment. Please share details and pricing.")} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-display text-xl tracking-wider h-14 px-10 w-full sm:w-auto">
                <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-[#050505] border-t border-border/40 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-primary text-xl">⚡</span>
                <span className="font-display text-2xl font-bold tracking-wider text-white">SIGNITIVE</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">Premium Custom Apparel, Made in Pakistan. Manufacturing excellence since 2010.</p>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                <span>Street No. 02, Gulshan Toheed Town, Defence Road, Sialkot, Punjab, Pakistan</span>
              </div>
            </div>
            <div>
              <div className="font-display text-sm tracking-widest text-primary uppercase mb-4">Quick Links</div>
              <div className="space-y-2">
                {[["Home", "/"], ["AI Studio", "/studio"], ["Catalog", "/catalog"], ["Quote", "/quote"], ["About", "/about"], ["Contact", "/contact"]].map(([label, href]) => (
                  <div key={href}><Link href={href as string} className="text-muted-foreground hover:text-white text-sm transition-colors">{label}</Link></div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-display text-sm tracking-widest text-primary uppercase mb-4">Categories</div>
              <div className="space-y-2">
                {CATEGORIES.map(cat => (
                  <div key={cat.slug}>
                    <Link href={`/catalog?category=${encodeURIComponent(cat.slug)}`} className="text-muted-foreground hover:text-white text-sm transition-colors">{cat.name}</Link>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-display text-sm tracking-widest text-primary uppercase mb-4">Contact</div>
              <div className="space-y-3 text-sm">
                <a href="tel:+923114661392" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">📞 +92 311 4661392</a>
                <a href="mailto:info@signitiveenterprises.com" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">✉️ info@signitiveenterprises.com</a>
                <a href="https://wa.me/923114661392" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#25D366] hover:text-[#25D366]/80 transition-colors">
                  <MessageCircle className="h-4 w-4" /> WhatsApp Chat
                </a>
                <a href="https://signitiveenterprises.trustpass.alibaba.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#FF6A00] hover:text-[#FF6A00]/80 transition-colors">🛒 Alibaba Store</a>
              </div>
            </div>
          </div>
          <div className="border-t border-border/30 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-muted-foreground text-sm">© 2025 Signitive Enterprises. All rights reserved.</div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">Made in Sialkot 🇵🇰</span>
              <span className="text-border">|</span>
              <a href="https://signitiveenterprises.trustpass.alibaba.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white text-xs transition-colors">Alibaba TrustPass Verified</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
