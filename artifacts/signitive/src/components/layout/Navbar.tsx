import { Link, useLocation } from "wouter";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCurrency } from "@/contexts/CurrencyContext";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { currency, toggle } = useCurrency();

  const links = [
    { href: "/studio", label: "Studio" },
    { href: "/catalog", label: "Catalog" },
    { href: "/quote", label: "Quote" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-[#0a0a0a]/90 backdrop-blur supports-[backdrop-filter]:bg-[#0a0a0a]/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-primary text-xl">⚡</span>
            <span className="font-display text-xl font-bold tracking-wider text-white hidden sm:inline-block">
              SIGNITIVE <span className="text-primary">ENTERPRISES</span>
            </span>
            <span className="font-display text-xl font-bold tracking-wider text-white sm:hidden">SIGNITIVE</span>
          </Link>
          <nav className="hidden lg:flex gap-5 ml-4">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-medium uppercase tracking-widest transition-colors hover:text-primary ${location === link.href ? "text-primary" : "text-muted-foreground"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Alibaba TrustPass badge */}
          <a
            href="https://signitiveenterprises.trustpass.alibaba.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 border border-[#FF6A00]/40 bg-[#FF6A00]/5 px-2 py-1 text-xs text-[#FF6A00] hover:border-[#FF6A00] transition-colors"
          >
            <span className="font-bold">ALI</span>
            <span className="text-muted-foreground text-[10px]">TrustPass</span>
          </a>

          {/* Currency toggle */}
          <button
            onClick={toggle}
            className="hidden md:flex items-center gap-1 border border-border/40 px-2.5 py-1.5 text-xs font-mono transition-all hover:border-primary"
            title="Toggle currency"
          >
            <span className={currency === "PKR" ? "text-primary" : "text-muted-foreground"}>PKR</span>
            <span className="text-border/60 mx-0.5">/</span>
            <span className={currency === "USD" ? "text-primary" : "text-muted-foreground"}>USD</span>
          </button>

          <Link href="/account" className="text-muted-foreground hover:text-primary transition-colors hidden sm:block">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Link>
          <Link href="/quote" className="text-muted-foreground hover:text-primary transition-colors">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Quote Cart</span>
          </Link>
          <Button asChild className="hidden lg:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 font-display text-base tracking-wider">
            <Link href="/studio">Start Designing</Link>
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0a0a0a] border-l-border/40">
              <div className="flex flex-col gap-4 pt-10">
                <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 mb-6">
                  <span className="text-primary text-xl">⚡</span>
                  <span className="font-display text-2xl font-bold tracking-wider text-white">SIGNITIVE <span className="text-primary">ENTERPRISES</span></span>
                </Link>
                {links.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-2xl font-display uppercase tracking-widest transition-colors hover:text-primary py-1 ${location === link.href ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-6 border-t border-border/30 pt-6 flex flex-col gap-4">
                  <button onClick={toggle} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-left">
                    <span className="font-mono text-sm">Currency: <strong className="text-primary">{currency}</strong></span>
                    <span className="text-xs text-muted-foreground/60">(tap to switch)</span>
                  </button>
                  <Link href="/account" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-lg font-display uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    <User className="h-5 w-5" /> Account
                  </Link>
                  <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xl tracking-wider h-12 mt-2" onClick={() => setIsOpen(false)}>
                    <Link href="/studio">Start Designing</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
