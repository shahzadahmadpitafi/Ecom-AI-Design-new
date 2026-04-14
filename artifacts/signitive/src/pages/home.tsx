import { Link } from "wouter";
import { useGetFeaturedProducts, getGetFeaturedProductsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GoldGrid } from "@/components/ui/GoldGrid";
import { ScanLine } from "@/components/ui/ScanLine";
import { PurpleGlow, GoldGlow } from "@/components/ui/PurpleGlow";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { CountUp } from "@/components/ui/CountUp";
import { useCurrency } from "@/contexts/CurrencyContext";
import { waLink } from "@/components/WhatsAppButton";
import { Zap, ArrowDown, ChevronRight, Star, MessageCircle, Package, Globe, Award, Clock, Shield, Truck } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: 500,  suffix: "+", label: "Global Clients"     },
  { value: 50,   suffix: "+", label: "Countries"          },
  { value: 1000, suffix: "K+", label: "Units Produced"    },
  { value: 15,   suffix: "yr", label: "Manufacturing Exp" },
];

const CATEGORIES = [
  { name: "Streetwear",      slug: "Streetwear",      count: 18, Icon: Package },
  { name: "Fitness Wear",    slug: "Fitness Wear",    count: 8,  Icon: Zap     },
  { name: "Sports Uniforms", slug: "Sports Uniforms", count: 7,  Icon: Award   },
  { name: "Boxing",          slug: "Boxing",          count: 7,  Icon: Shield  },
  { name: "Motocross",       slug: "Motocross",       count: 7,  Icon: Truck   },
  { name: "Caps",            slug: "Caps",            count: 4,  Icon: Star    },
  { name: "Team Wear",       slug: "Team Wear",       count: 3,  Icon: Globe   },
  { name: "Sports Goods",    slug: "Sports Goods",    count: 5,  Icon: Package },
];

const STEPS = [
  { n: "01", title: "Design",  desc: "Use the AI Studio or send your artwork. Accepts AI prompts, PDF, PSD, vectors." },
  { n: "02", title: "Sample",  desc: "Physical sample garment shipped in 5–7 working days for your approval." },
  { n: "03", title: "Produce", desc: "Bulk manufacturing begins after sample approval with full quality tracking." },
  { n: "04", title: "QC",      desc: "Every unit individually inspected against your approved sample before packing." },
  { n: "05", title: "Ship",    desc: "DHL / FedEx Express worldwide. 3–5 days to US, UK, UAE, Australia." },
];

const TESTIMONIALS = [
  { quote: "Ordered 200 custom hoodies, quality exceeded expectations. Delivered to UK in 12 days.",     name: "James T.",   location: "United Kingdom" },
  { quote: "The AI design tool is incredible. We launched our streetwear brand in 3 weeks.",               name: "Maria K.",   location: "United States"  },
  { quote: "Best custom manufacturer we've found. MOQ is reasonable and communication is excellent.",      name: "Ahmed R.",   location: "UAE"            },
];

// ─── Marquee ticker ───────────────────────────────────────────────────────────

const TICKER = [
  "Minimum 25 Units",
  "Ships to 50+ Countries",
  "DHL · FedEx Express",
  "AI Design Studio",
  "Screen Print · Sublimation · Embroidery · DTF",
  "Sialkot, Pakistan",
  "15 Years Experience",
  "Sample in 5-7 Days",
];

// ─── Home component ───────────────────────────────────────────────────────────

export default function Home() {
  const { format } = useCurrency();
  const { data: featuredProducts, isLoading } = useGetFeaturedProducts({
    query: { queryKey: getGetFeaturedProductsQueryKey() },
  });

  return (
    <div className="flex flex-col w-full overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════ HERO ══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: "#0a0a0a" }}>
        <GoldGrid />
        <PurpleGlow className="-top-20 -left-20" />
        <GoldGlow className="-top-20 -right-20" />
        <ScanLine />

        <div className="relative z-10 flex flex-col items-center text-center px-4 py-24 max-w-5xl mx-auto">

          {/* Live badge */}
          <div className="mb-8">
            <LiveBadge>⚡ AI-Powered Custom Manufacturing — Sialkot, Pakistan</LiveBadge>
          </div>

          {/* Headline */}
          <h1 className="font-display tracking-wider leading-none mb-6" style={{ fontSize: "clamp(52px, 10vw, 110px)" }}>
            <span
              className="block text-white"
              style={{ animationDelay: "0s" }}
            >
              DESIGN.
            </span>
            <span
              className="block"
              style={{ color: "#a78bfa", textShadow: "0 0 40px rgba(167,139,250,0.4)" }}
            >
              MANUFACTURE.
            </span>
            <span
              className="block"
              style={{ color: "#C9A84C", textShadow: "0 0 40px rgba(201,168,76,0.4)" }}
            >
              DOMINATE.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-[#a0a0a0] text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
            From your idea to <strong className="text-white">500 units</strong> in <strong style={{ color: "#C9A84C" }}>15 days</strong>.
            Premium custom apparel from Sialkot, shipped worldwide.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-16">
            <Link
              href="/studio"
              className="flex items-center justify-center gap-2 px-8 h-14 font-display text-xl tracking-widest uppercase relative overflow-hidden group"
              style={{ background: "#C9A84C", color: "#0a0a0a", fontWeight: 700 }}
            >
              <span
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
              />
              <Zap className="h-5 w-5 relative" />
              <span className="relative">Start Designing Free</span>
            </Link>
            <Link
              href="/catalog"
              className="flex items-center justify-center gap-2 px-8 h-14 font-display text-xl tracking-widest uppercase transition-all"
              style={{
                border: "1px solid rgba(167,139,250,0.5)",
                color: "#a78bfa",
                background: "transparent",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              Browse Catalog <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 w-full max-w-3xl"
            style={{ borderTop: "1px solid rgba(201,168,76,0.2)" }}
          >
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="text-center py-5 px-4"
                style={{
                  borderRight: i < STATS.length - 1 ? "1px solid rgba(167,139,250,0.15)" : undefined,
                  borderBottom: i < 2 ? "1px solid rgba(167,139,250,0.15)" : undefined,
                }}
              >
                <div className="font-display text-4xl md:text-5xl tracking-wider" style={{ color: "#C9A84C" }}>
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[10px] uppercase tracking-widest text-[#a0a0a0] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom scan line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #a78bfa, #C9A84C, transparent)" }}
        />

        {/* Animated down arrow */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2" style={{ animation: "bounce 2s ease-in-out infinite" }}>
          <ArrowDown className="h-5 w-5" style={{ color: "#C9A84C" }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ TICKER ══ */}
      <div
        className="overflow-hidden py-3"
        style={{ background: "#111", borderTop: "1px solid rgba(167,139,250,0.1)", borderBottom: "1px solid rgba(167,139,250,0.1)" }}
      >
        <div className="animate-marquee flex gap-8 whitespace-nowrap">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="flex items-center gap-3 text-[11px] uppercase tracking-widest shrink-0" style={{ color: "#555" }}>
              <span style={{ color: "#C9A84C" }}>◆</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════ CATEGORIES ══ */}
      <section className="py-20 px-4" style={{ background: "#0a0a0a" }}>
        <div className="container mx-auto max-w-6xl">
          <GoldDivider label="Our Collections" />
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: "rgba(167,139,250,0.1)" }}>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                href={`/catalog?category=${encodeURIComponent(cat.slug)}`}
                className="purple-hover-line group flex flex-col p-6 relative transition-all"
                style={{ background: "#111", borderBottom: "2px solid #C9A84C" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <cat.Icon className="h-8 w-8 transition-colors group-hover:scale-110 duration-200" style={{ color: "#a78bfa" }} />
                  <ChevronRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    style={{ color: "#555" }}
                  />
                </div>
                <h3 className="font-display text-lg tracking-wider text-white leading-tight">{cat.name}</h3>
                <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "#C9A84C" }}>
                  {cat.count} Products
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ AI STUDIO SHOWCASE ══ */}
      <section className="relative py-20 px-4 overflow-hidden" style={{ background: "#0d0d0d" }}>
        <GoldGrid />
        <div className="container mx-auto max-w-6xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: copy */}
            <div>
              <LiveBadge>Core Feature</LiveBadge>
              <h2 className="font-display text-5xl md:text-6xl tracking-wider text-white mt-6 mb-4">
                DESIGN YOUR<br /><span style={{ color: "#C9A84C" }}>COLLECTION</span><br />IN 30 SECONDS
              </h2>
              <div className="space-y-5 mt-8">
                {[
                  { n: "01", t: "Describe",  d: "Type what you want — our AI generates a design in seconds." },
                  { n: "02", t: "Customize", d: "Adjust colors, add your logo, change position and size." },
                  { n: "03", t: "Order",     d: "Submit your quote and we'll manufacture it in bulk." },
                ].map(step => (
                  <div key={step.n} className="flex gap-4">
                    <span className="font-display text-2xl shrink-0 w-10" style={{ color: "#C9A84C" }}>{step.n}</span>
                    <div>
                      <p className="font-display text-lg tracking-wider text-white">{step.t}</p>
                      <p className="text-sm text-[#a0a0a0] leading-relaxed">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 mt-8 px-8 h-14 font-display text-xl tracking-widest uppercase relative overflow-hidden group"
                style={{ background: "#C9A84C", color: "#0a0a0a", fontWeight: 700 }}
              >
                <span
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
                />
                <Zap className="h-5 w-5 relative" />
                <span className="relative">Try AI Studio Free</span>
              </Link>
            </div>

            {/* Right: animated demo card */}
            <div
              className="relative p-6 overflow-hidden animate-purple-border"
              style={{ background: "#111", border: "1px solid rgba(167,139,250,0.3)" }}
            >
              <ScanLine />
              {/* AI ACTIVE badge */}
              <div
                className="absolute top-3 right-3 px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"
                style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-[pulse-dot_1.4s_ease-in-out_infinite]" />
                AI ACTIVE
              </div>

              {/* Mock prompt */}
              <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#a78bfa" }}>Describe Your Design</p>
              <div
                className="p-3 text-sm text-[#a0a0a0] mb-4"
                style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.2)" }}
              >
                Vintage eagle with lightning bolts, gothic lettering...
                <span className="animate-cursor border-r border-[#C9A84C] ml-0.5" />
              </div>

              {/* Mock t-shirt silhouette */}
              <div
                className="flex items-center justify-center py-12"
                style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.1)" }}
              >
                <div className="text-center">
                  <svg viewBox="0 0 120 140" className="w-24 h-28 mx-auto mb-3" style={{ fill: "#1a1a1a", stroke: "rgba(167,139,250,0.4)", strokeWidth: 1 }}>
                    <path d="M24 16 L0 40 L16 48 L16 132 L104 132 L104 48 L120 40 L96 16 C88 22 76 26 60 26 C44 26 32 22 24 16 Z" />
                    <path d="M43 15 Q60 32 77 15" fill="none" stroke="rgba(167,139,250,0.3)" strokeWidth="1" />
                    <rect x="38" y="44" width="44" height="48" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="1" strokeDasharray="3 3" />
                  </svg>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: "#a78bfa" }}>
                    ◆ GENERATING... ◆
                  </p>
                </div>
              </div>

              {/* Style tags */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {["Vintage", "Bold", "Streetwear"].map(tag => (
                  <span key={tag} className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold"
                    style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ FEATURED PRODUCTS ══ */}
      <section className="py-20 px-4" style={{ background: "#0a0a0a" }}>
        <div className="container mx-auto max-w-6xl">
          <GoldDivider label="Best Sellers" />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "rgba(167,139,250,0.08)" }}>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ background: "#111" }} className="p-4">
                    <Skeleton className="w-full aspect-[4/3] mb-3 bg-muted/30" />
                    <Skeleton className="h-5 w-3/4 mb-2 bg-muted/30" />
                    <Skeleton className="h-4 w-1/2 bg-muted/30" />
                  </div>
                ))
              : featuredProducts?.slice(0, 8).map(p => (
                  <div
                    key={p.id}
                    className="purple-hover-line group flex flex-col"
                    style={{ background: "#111" }}
                  >
                    <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                      <img
                        src={p.imageUrl || `https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600&auto=format&fit=crop&q=60`}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div
                        className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                        style={{ background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.4)", color: "#a78bfa" }}
                      >
                        {p.category}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-display text-lg tracking-wider text-white leading-tight mb-1">{p.name}</h3>
                      <p className="text-[11px] text-white/90 mb-0.5">From {format(p.basePricePkr)} / unit</p>
                      <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "#a78bfa" }}>
                        MOQ: {p.minOrderQuantity || 25} units
                      </p>
                      <div className="mt-auto flex gap-2">
                        <Link
                          href={`/studio?product=${p.id}`}
                          className="flex-1 h-8 flex items-center justify-center font-display text-xs tracking-wider uppercase transition-all"
                          style={{ background: "#C9A84C", color: "#0a0a0a" }}
                        >
                          Customize
                        </Link>
                        <Link
                          href="/quote"
                          className="flex-1 h-8 flex items-center justify-center font-display text-xs tracking-wider uppercase transition-all"
                          style={{ border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.08)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          Quote
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-8 h-12 font-display text-base tracking-widest uppercase transition-all"
              style={{ border: "1px solid rgba(167,139,250,0.4)", color: "#a78bfa" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              View All {61}+ Products <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ MANUFACTURING STEPS ══ */}
      <section className="relative py-20 px-4 overflow-hidden" style={{ background: "#0d0d0d" }}>
        <GoldGrid />
        <div className="container mx-auto max-w-6xl relative">
          <GoldDivider label="How We Work" />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-5 gap-0">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative flex flex-col items-center text-center p-6 group">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden sm:block absolute top-10 left-1/2 w-full h-px"
                    style={{ background: "linear-gradient(90deg, rgba(167,139,250,0.5), rgba(201,168,76,0.3))" }}
                  />
                )}
                {/* Number badge */}
                <div
                  className="w-14 h-14 flex items-center justify-center mb-4 relative z-10 transition-all group-hover:scale-105"
                  style={{ border: "1px solid rgba(167,139,250,0.4)", background: "#0a0a0a" }}
                >
                  <span className="font-display text-xl" style={{ color: "#C9A84C" }}>{step.n}</span>
                </div>
                <h3 className="font-display text-xl tracking-wider text-white mb-2">{step.title}</h3>
                <p className="text-xs text-[#a0a0a0] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ TRUST SIGNALS ══ */}
      <section className="py-10 px-4 overflow-hidden" style={{ background: "#0a0a0a", borderTop: "1px solid rgba(201,168,76,0.1)", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 flex-wrap">
            {[
              { label: "Alibaba TrustPass Verified", sub: "Verified Gold Supplier",           color: "#FF6A00" },
              { label: "Sialkot — World Capital of Sportswear", sub: "Premium Manufacturing Hub", color: "#C9A84C" },
              { label: "DHL · FedEx Express",        sub: "Fast Global Shipping",              color: "#a78bfa" },
            ].map(badge => (
              <div
                key={badge.label}
                className="flex items-center gap-3 px-5 py-3 text-center sm:text-left"
                style={{ border: `1px solid ${badge.color}30`, background: `${badge.color}06` }}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: badge.color }}>{badge.label}</p>
                  <p className="text-[10px] text-[#555] mt-0.5">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ TESTIMONIALS ══ */}
      <section className="py-20 px-4" style={{ background: "#0a0a0a" }}>
        <div className="container mx-auto max-w-5xl">
          <GoldDivider label="What Clients Say" />
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "rgba(167,139,250,0.08)" }}>
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="relative p-6 overflow-hidden"
                style={{ background: "#111", border: "1px solid rgba(167,139,250,0.15)" }}
              >
                {/* Giant quote mark */}
                <span
                  className="absolute top-2 left-4 font-display text-8xl leading-none pointer-events-none select-none"
                  style={{ color: "#C9A84C", opacity: 0.08 }}
                >
                  "
                </span>
                <div className="flex gap-0.5 mb-3 relative">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-current" style={{ color: "#C9A84C" }} />
                  ))}
                </div>
                <p className="text-[#a0a0a0] text-sm leading-relaxed mb-4 relative">"{t.quote}"</p>
                <div className="border-t pt-3" style={{ borderColor: "rgba(167,139,250,0.15)" }}>
                  <p className="text-white text-sm font-bold">— {t.name}</p>
                  <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "#a78bfa" }}>{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ FREE SAMPLE CTA ══ */}
      <section
        className="py-20 px-4 text-center relative overflow-hidden"
        style={{
          background: "#0f0f0f",
          borderTop: "1px solid",
          borderBottom: "1px solid",
          borderImage: "linear-gradient(90deg, #a78bfa, #C9A84C) 1",
        }}
      >
        <GoldGrid />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="font-display text-5xl md:text-6xl tracking-wider mb-4" style={{ color: "#C9A84C" }}>
            NOT READY TO COMMIT?
          </h2>
          <p className="text-[#a0a0a0] text-lg mb-2">
            Order 1 sample garment first.
          </p>
          <p className="text-white text-xl font-bold mb-8">
            PKR 2,500 — <span style={{ color: "#C9A84C" }}>fully deducted from your bulk order.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={waLink("Hi! I'd like to order a sample garment to test quality before placing a bulk order.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 h-14 font-display text-xl tracking-widest uppercase relative overflow-hidden group"
              style={{ background: "#C9A84C", color: "#0a0a0a", fontWeight: 700 }}
            >
              <span
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
              />
              <span className="relative">Order a Sample</span>
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 h-14 font-display text-xl tracking-widest uppercase transition-all"
              style={{ border: "1px solid rgba(167,139,250,0.4)", color: "#a78bfa" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <MessageCircle className="h-5 w-5" /> Talk to Us
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════ FOOTER ══ */}
      {/* Footer is in Layout — section ends here */}

    </div>
  );
}
