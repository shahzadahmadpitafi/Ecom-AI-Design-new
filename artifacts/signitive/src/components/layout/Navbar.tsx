import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

const NAV_LINKS = [
  { href: "/studio",  label: "Studio"  },
  { href: "/catalog", label: "Catalog" },
  { href: "/quote",   label: "Quote"   },
  { href: "/about",   label: "About"   },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [geminiConnected, setGeminiConnected] = useState(false);
  const { currency, toggle } = useCurrency();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Track Gemini key in localStorage
  useEffect(() => {
    const check = () => setGeminiConnected(!!localStorage.getItem("gemini_api_key"));
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  // Re-check when navigating to studio
  useEffect(() => {
    setGeminiConnected(!!localStorage.getItem("gemini_api_key"));
  }, [location]);

  // Close on location change
  useEffect(() => { setIsOpen(false); }, [location]);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          background: scrolled ? "rgba(10,10,10,0.96)" : "rgba(10,10,10,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(167,139,250,0.15)",
        }}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <Zap className="h-5 w-5 text-[#C9A84C] group-hover:text-[#a78bfa] transition-colors" />
            <span className="font-display text-xl tracking-wider text-white hidden sm:inline-block">
              SIGNITIVE{" "}
              <span
                className="transition-colors group-hover:text-[#C9A84C]"
                style={{ color: "#a78bfa" }}
              >
                ENTERPRISES
              </span>
            </span>
            <span className="font-display text-xl tracking-wider text-white sm:hidden">SIGNITIVE</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-6 ml-6">
            {NAV_LINKS.map(link => {
              const active = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-[11px] font-medium uppercase tracking-[0.15em] transition-colors group"
                  style={{ color: active ? "#a78bfa" : "#a0a0a0" }}
                >
                  {link.label}
                  <span
                    className="absolute -bottom-0.5 left-0 h-px bg-[#a78bfa] transition-all duration-300"
                    style={{ width: active ? "100%" : "0%" }}
                    aria-hidden
                  />
                  <span
                    className="absolute -bottom-0.5 left-0 h-px bg-[#a78bfa] opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-300 w-0"
                    aria-hidden
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right: badges + controls */}
          <div className="flex items-center gap-2">
            {/* Alibaba TrustPass */}
            <a
              href="https://signitiveenterprises.trustpass.alibaba.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1 px-2 py-1 text-xs font-bold transition-all"
              style={{
                border: "1px solid rgba(255,106,0,0.4)",
                background: "rgba(255,106,0,0.05)",
                color: "#FF6A00",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "#FF6A00";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,106,0,0.10)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,106,0,0.4)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,106,0,0.05)";
              }}
            >
              ALI <span className="font-normal text-[10px] text-[#a0a0a0] ml-0.5">TrustPass</span>
            </a>

            {/* Gemini AI status badge — only on Studio page */}
            {location === "/studio" && (
              <div
                className="hidden md:flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-all"
                style={{
                  border: `1px solid ${geminiConnected ? "rgba(34,197,94,0.4)" : "rgba(201,168,76,0.35)"}`,
                  background: geminiConnected ? "rgba(34,197,94,0.06)" : "rgba(201,168,76,0.06)",
                  color: geminiConnected ? "#22c55e" : "#C9A84C",
                }}
              >
                {geminiConnected ? "✓ AI" : "⚠ AI"}
              </div>
            )}

            {/* PKR / USD toggle */}
            <button
              onClick={toggle}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#a0a0a0" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "#C9A84C";
                (e.currentTarget as HTMLElement).style.color = "#C9A84C";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                (e.currentTarget as HTMLElement).style.color = "#a0a0a0";
              }}
              title="Toggle currency"
            >
              <span style={{ color: currency === "PKR" ? "#C9A84C" : undefined }}>PKR</span>
              <span className="mx-0.5 opacity-30">/</span>
              <span style={{ color: currency === "USD" ? "#C9A84C" : undefined }}>USD</span>
            </button>

            {/* Quote cart */}
            <Link href="/quote" className="text-[#a0a0a0] hover:text-[#a78bfa] transition-colors p-1.5">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Quote Cart</span>
            </Link>

            {/* CTA — Start Designing */}
            <Link
              href="/studio"
              className="hidden lg:flex items-center gap-1.5 px-4 py-2 font-display text-sm tracking-widest uppercase transition-all relative overflow-hidden group"
              style={{
                background: "#C9A84C",
                color: "#0a0a0a",
                fontWeight: 700,
              }}
            >
              <span
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
              />
              <Zap className="h-3.5 w-3.5 relative" />
              <span className="relative">Start Designing</span>
            </Link>

            {/* Hamburger */}
            <button
              className="lg:hidden p-2 text-[#a0a0a0] hover:text-white transition-colors"
              onClick={() => setIsOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay nav */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col"
          style={{ background: "rgba(10,10,10,0.98)", backdropFilter: "blur(20px)" }}
        >
          <div className="flex items-center justify-between px-4 h-16 border-b"
            style={{ borderColor: "rgba(167,139,250,0.15)" }}>
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <Zap className="h-5 w-5 text-[#C9A84C]" />
              <span className="font-display text-xl tracking-wider text-white">
                SIGNITIVE <span style={{ color: "#a78bfa" }}>ENTERPRISES</span>
              </span>
            </Link>
            <button onClick={() => setIsOpen(false)} className="p-2 text-[#a0a0a0] hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 gap-6">
            {NAV_LINKS.map(link => {
              const active = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="font-display text-4xl tracking-widest uppercase transition-colors"
                  style={{ color: active ? "#a78bfa" : "#555" }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#a78bfa"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#555"; }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="px-8 pb-10 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={toggle}
                className="flex items-center gap-2 text-sm font-mono text-[#a0a0a0]"
              >
                Currency: <span style={{ color: "#C9A84C" }}>{currency}</span>
                <span className="text-xs opacity-50">(tap to switch)</span>
              </button>
            </div>
            <Link
              href="/studio"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 h-14 font-display text-xl tracking-widest uppercase"
              style={{ background: "#C9A84C", color: "#0a0a0a", fontWeight: 700 }}
            >
              <Zap className="h-5 w-5" /> Start Designing
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
