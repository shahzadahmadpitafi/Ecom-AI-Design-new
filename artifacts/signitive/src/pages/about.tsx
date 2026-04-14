import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Factory, Award, Globe, Truck, MessageCircle, CheckCircle, Shield } from "lucide-react";
import { waLink } from "@/components/WhatsAppButton";

const CAPABILITIES = [
  { name: "Sublimation Printing", desc: "All-over photo-quality prints that never crack, peel, or fade — ideal for sportswear and complex graphics." },
  { name: "Screen Printing", desc: "Traditional plastisol and water-based inks for vibrant, durable prints on any garment." },
  { name: "Embroidery", desc: "Precision digitized embroidery on caps, polos, patches, and chest logos with up to 15 thread colors." },
  { name: "DTF Printing", desc: "Direct-to-film transfers for complex multi-color designs without minimum order constraints." },
  { name: "Cut & Sew Manufacturing", desc: "Full pattern making, grading, and CMT production from scratch — no limitations on design." },
  { name: "Woven & Knit Labels", desc: "Custom woven brand labels, hang tags, care labels, and neck labels with your full branding." },
];

const PAYMENT_METHODS = ["T/T Bank Transfer", "PayPal", "Wise / TransferWise", "Western Union", "Payoneer"];
const SHIPPING = ["DHL Express", "FedEx International", "UPS Worldwide", "Sea Freight (large orders)"];

export default function About() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-border/40 py-16 bg-[#0f0f0f]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-primary">About</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-wider text-white uppercase mb-4">
            About <span className="text-primary">Signitive</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl leading-relaxed">
            Premium custom apparel manufacturing from the heart of Sialkot, Pakistan — the city that supplies the world's sportswear.
          </p>
        </div>
      </div>

      {/* Company Story */}
      <section className="py-20 border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-wider text-white uppercase mb-6">
                Our <span className="text-primary">Story</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded in Sialkot — the city that manufactures 70% of the world's surgical instruments and 40% of its footballs — Signitive Enterprises brings the same precision craftsmanship to custom apparel. For over 15 years, we've been supplying streetwear brands, sports teams, and corporate clients across 50+ countries.
                </p>
                <p>
                  What started as a small cut-and-sew operation has grown into a full-service apparel manufacturing house with capabilities spanning sublimation printing, embroidery, DTF, and fully custom pattern development. We're not a middleman — we're the factory.
                </p>
                <p>
                  When you order from Signitive, you're working directly with the people who cut, sew, print, and pack your garments. That direct relationship means better quality, faster turnaround, and prices that middlemen simply can't match.
                </p>
              </div>
              <div className="mt-8 flex gap-4">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider uppercase">
                  <Link href="/catalog">Browse Products <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <a href={waLink("Hi Signitive! I'd like to learn more about your manufacturing capabilities.")} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 font-display tracking-wider uppercase">
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                  </Button>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-square border border-border/30 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop" alt="Manufacturing" className="w-full h-full object-cover opacity-70" />
              </div>
              <div className="aspect-square border border-border/30 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=400&auto=format&fit=crop" alt="Apparel" className="w-full h-full object-cover opacity-70" />
              </div>
              <div className="col-span-2 aspect-video border border-border/30 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop" alt="Factory" className="w-full h-full object-cover opacity-70" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manufacturing Capabilities */}
      <section className="py-20 border-b border-border/30 bg-[#0f0f0f]">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-wider text-white uppercase mb-3">
              Manufacturing <span className="text-primary">Capabilities</span>
            </h2>
            <p className="text-muted-foreground text-lg">Everything you need under one roof — no outsourcing, no compromises.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAPABILITIES.map((cap, i) => (
              <div key={i} className="border border-border/30 bg-card/20 p-6 hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 border border-primary/40 bg-primary/10 flex items-center justify-center mb-4">
                  <Factory className="h-5 w-5 text-primary" />
                </div>
                <div className="font-display text-lg text-white uppercase tracking-wider mb-2">{cap.name}</div>
                <div className="text-muted-foreground text-sm leading-relaxed">{cap.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Factory Photos */}
      <section className="py-20 border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="font-display text-4xl font-bold tracking-wider text-white uppercase mb-3">
              Our <span className="text-primary">Factory</span>
            </h2>
            <p className="text-muted-foreground">Based in Sialkot, Punjab, Pakistan</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=600&auto=format&fit=crop",
            ].map((src, i) => (
              <div key={i} className="aspect-video border border-border/30 overflow-hidden group">
                <img src={src} alt="Factory" className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity" />
              </div>
            ))}
          </div>
          <div className="mt-4 border border-dashed border-border/40 p-8 text-center">
            <p className="text-muted-foreground text-sm uppercase tracking-widest">Real factory photos coming soon · Request a virtual tour on WhatsApp</p>
          </div>
        </div>
      </section>

      {/* International Buyers */}
      <section className="py-20 border-b border-border/30 bg-[#0f0f0f]">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 border border-primary/30 bg-primary/5">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-widest text-primary">International Buyers</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-wider text-white uppercase mb-3">
              Ordering From <span className="text-primary">Abroad?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">Everything you need to know about ordering custom apparel from Pakistan.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="border border-border/30 bg-card/20 p-6">
              <div className="font-display text-sm uppercase tracking-widest text-primary mb-3">Payment Methods</div>
              <div className="space-y-2">
                {PAYMENT_METHODS.map(m => (
                  <div key={m} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-primary/60 shrink-0" />{m}</div>
                ))}
              </div>
            </div>
            <div className="border border-border/30 bg-card/20 p-6">
              <div className="font-display text-sm uppercase tracking-widest text-primary mb-3">Shipping Options</div>
              <div className="space-y-2">
                {SHIPPING.map(s => (
                  <div key={s} className="flex items-center gap-2 text-sm text-muted-foreground"><Truck className="h-4 w-4 text-primary/60 shrink-0" />{s}</div>
                ))}
              </div>
            </div>
            <div className="border border-border/30 bg-card/20 p-6">
              <div className="font-display text-sm uppercase tracking-widest text-primary mb-3">Sampling</div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>We ship samples worldwide before bulk production.</p>
                <p><span className="text-white font-semibold">3–5 days</span> to US/UK/UAE</p>
                <p>PKR 2,500 per sample — deducted from bulk order.</p>
              </div>
            </div>
            <div className="border border-border/30 bg-card/20 p-6">
              <div className="font-display text-sm uppercase tracking-widest text-primary mb-3">MOQ & Response</div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><span className="text-white font-semibold">25 units</span> minimum per design</p>
                <p>Response within <span className="text-white font-semibold">1 hour</span> on WhatsApp</p>
                <p>Dedicated account manager for orders 200+ units</p>
              </div>
            </div>
          </div>
          <div className="border border-[#25D366]/30 bg-[#25D366]/5 p-6 flex flex-col md:flex-row items-center gap-4">
            <MessageCircle className="h-8 w-8 text-[#25D366] shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-white mb-1">Ready to start your order?</div>
              <div className="text-muted-foreground text-sm">Message us on WhatsApp — we typically respond within 1 hour and can guide you through the entire process.</div>
            </div>
            <a href={waLink("Hi Signitive! I'm an international buyer and I'd like to place an order. Please share your catalog and pricing.")} target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#25D366] hover:bg-[#25D366]/90 text-white font-display tracking-wider uppercase shrink-0">
                <MessageCircle className="mr-2 h-4 w-4" /> Start on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Certifications & Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-border/30 bg-card/20 p-8 text-center">
              <Award className="h-10 w-10 text-primary mx-auto mb-4" />
              <div className="font-display text-xl text-white uppercase tracking-wider mb-2">Quality Certified</div>
              <div className="text-muted-foreground text-sm">All products undergo multi-point quality inspection before shipping. Certificates available on request.</div>
            </div>
            <div className="border border-border/30 bg-card/20 p-8 text-center">
              <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
              <div className="font-display text-xl text-white uppercase tracking-wider mb-2">Alibaba Verified</div>
              <div className="text-muted-foreground text-sm">Verified TrustPass supplier on Alibaba with a proven track record of delivering to international buyers.</div>
            </div>
            <div className="border border-border/30 bg-card/20 p-8 text-center">
              <MapPin className="h-10 w-10 text-primary mx-auto mb-4" />
              <div className="font-display text-xl text-white uppercase tracking-wider mb-2">Sialkot Origin</div>
              <div className="text-muted-foreground text-sm">Manufactured in Sialkot — the city responsible for over 40% of the world's hand-stitched footballs and sportswear.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
