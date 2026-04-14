import { Link, useLocation } from "wouter";
import { ShoppingCart, User, Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/studio", label: "Studio" },
    { href: "/catalog", label: "Catalog" },
    { href: "/quote", label: "Quote" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-primary text-xl">⚡</span>
            <span className="font-display text-2xl font-bold tracking-wider text-white hidden sm:inline-block">
              SIGNITIVE <span className="text-primary">ENTERPRISES</span>
            </span>
            <span className="font-display text-2xl font-bold tracking-wider text-white sm:hidden">
              SIGNITIVE
            </span>
          </Link>
          <nav className="hidden md:flex gap-6 ml-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium uppercase tracking-widest transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/account" className="text-muted-foreground hover:text-primary transition-colors hidden sm:block">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Link>
          <Link href="/quote" className="text-muted-foreground hover:text-primary transition-colors">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Quote Cart</span>
          </Link>
          <Button asChild className="hidden md:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg tracking-wider">
            <Link href="/studio">Start Designing</Link>
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-l-border">
              <div className="flex flex-col gap-6 pt-10">
                <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 mb-8">
                  <span className="text-primary text-xl">⚡</span>
                  <span className="font-display text-2xl font-bold tracking-wider text-white">
                    SIGNITIVE <span className="text-primary">ENTERPRISES</span>
                  </span>
                </Link>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-2xl font-display uppercase tracking-widest transition-colors hover:text-primary ${
                      location === link.href ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-8 border-t border-border pt-8 flex flex-col gap-4">
                  <Link href="/account" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-lg font-display uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    <User className="h-5 w-5" /> Account
                  </Link>
                  <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xl tracking-wider h-12 mt-4" onClick={() => setIsOpen(false)}>
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
