import { Link } from "wouter";
import { Zap, MessageCircle, Mail, MapPin } from "lucide-react";

const YEAR = new Date().getFullYear();

const waLink = (msg: string) =>
  `https://wa.me/923114661392?text=${encodeURIComponent(msg)}`;

export function Footer() {
  return (
    <footer style={{ background: "#060606", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
      {/* Purple-to-gold gradient top line */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, #a78bfa, #C9A84C, #a78bfa)" }} />

      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Column 1: Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-5 group">
              <Zap className="h-4 w-4 text-[#C9A84C] group-hover:text-[#a78bfa] transition-colors" />
              <span className="font-display text-xl tracking-wider text-white">
                SIGNITIVE{" "}
                <span style={{ color: "#a78bfa" }}>ENTERPRISES</span>
              </span>
            </Link>
            <p className="text-[#555] text-xs leading-relaxed mb-6">
              Premium custom apparel manufacturer exporting globally from Sialkot, Pakistan.
              Streetwear, sports uniforms, and custom workwear shipped to 50+ countries.
            </p>
            <a
              href={waLink("Hi Signitive! I'd like to discuss a custom order.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 h-9 text-xs font-bold uppercase tracking-widest transition-all"
              style={{ background: "#25d366", color: "#000" }}
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Us
            </a>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h3 className="font-display text-sm uppercase tracking-[0.2em] mb-5" style={{ color: "#C9A84C" }}>Platform</h3>
            <ul className="space-y-3">
              {[
                { href: "/studio",  label: "AI Design Studio" },
                { href: "/catalog", label: "Product Catalog"  },
                { href: "/quote",   label: "Bulk Order Quote" },
                { href: "/about",   label: "About Us"         },
                { href: "/contact", label: "Contact"          },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#555] text-xs transition-colors hover:text-[#a78bfa]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h3 className="font-display text-sm uppercase tracking-[0.2em] mb-5" style={{ color: "#C9A84C" }}>Categories</h3>
            <ul className="space-y-3">
              {[
                { label: "Streetwear",      slug: "Streetwear"      },
                { label: "Fitness Wear",    slug: "Fitness Wear"    },
                { label: "Sports Uniforms", slug: "Sports Uniforms" },
                { label: "Boxing",          slug: "Boxing"          },
                { label: "Motocross",       slug: "Motocross"       },
                { label: "Caps & Hats",     slug: "Caps"            },
                { label: "Team Wear",       slug: "Team Wear"       },
                { label: "Sports Goods",    slug: "Sports Goods"    },
              ].map(cat => (
                <li key={cat.slug}>
                  <Link
                    href={`/catalog?category=${encodeURIComponent(cat.slug)}`}
                    className="text-[#555] text-xs transition-colors hover:text-[#a78bfa]"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-display text-sm uppercase tracking-[0.2em] mb-5" style={{ color: "#C9A84C" }}>Contact</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:info@signitiveenterprises.com"
                  className="flex items-start gap-2 text-xs transition-colors hover:text-[#a78bfa]"
                  style={{ color: "#555" }}
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#a78bfa" }} />
                  info@signitiveenterprises.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/923114661392"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-xs transition-colors hover:text-[#25d366]"
                  style={{ color: "#555" }}
                >
                  <MessageCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#25d366" }} />
                  +92 311 4661392
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-xs" style={{ color: "#555" }}>
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#C9A84C" }} />
                  Street No. 02, Gulshan Toheed Town,<br />
                  Defence Road, Sialkot, Pakistan
                </div>
              </li>
              <li className="pt-1">
                <a
                  href="https://signitiveenterprises.trustpass.alibaba.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 h-8 text-xs font-bold uppercase tracking-widest transition-all"
                  style={{ border: "1px solid rgba(255,106,0,0.4)", color: "#FF6A00" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#FF6A00"; (e.currentTarget as HTMLElement).style.background = "rgba(255,106,0,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,106,0,0.4)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  ALI TrustPass ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
          style={{ borderTop: "1px solid rgba(167,139,250,0.1)" }}
        >
          <p className="text-[11px]" style={{ color: "#3a3a3a" }}>
            © {YEAR} Signitive Enterprises. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-[11px]" style={{ color: "#3a3a3a" }}>
            Made in Sialkot 🇵🇰
            <span className="mx-2 opacity-30">·</span>
            <Link href="/privacy" className="hover:text-[#a78bfa] transition-colors">Privacy</Link>
            <span className="mx-2 opacity-30">·</span>
            <Link href="/terms" className="hover:text-[#a78bfa] transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
