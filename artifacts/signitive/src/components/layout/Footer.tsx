import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <span className="text-primary text-xl">⚡</span>
              <span className="font-display text-2xl font-bold tracking-wider text-white">
                SIGNITIVE <span className="text-primary">ENTERPRISES</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Premium custom apparel manufacturer exporting globally from Pakistan. 
              Specializing in streetwear, sports uniforms, and corporate workwear 
              with uncompromised quality.
            </p>
          </div>
          
          <div>
            <h3 className="font-display text-xl uppercase tracking-widest text-white mb-6">Platform</h3>
            <ul className="space-y-4">
              <li><Link href="/studio" className="text-muted-foreground hover:text-primary transition-colors text-sm">Design Studio</Link></li>
              <li><Link href="/catalog" className="text-muted-foreground hover:text-primary transition-colors text-sm">Product Catalog</Link></li>
              <li><Link href="/quote" className="text-muted-foreground hover:text-primary transition-colors text-sm">Bulk Order Quote</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display text-xl uppercase tracking-widest text-white mb-6">Categories</h3>
            <ul className="space-y-4">
              <li><Link href="/catalog?category=Streetwear" className="text-muted-foreground hover:text-primary transition-colors text-sm">Streetwear</Link></li>
              <li><Link href="/catalog?category=Fitness Wear" className="text-muted-foreground hover:text-primary transition-colors text-sm">Fitness Wear</Link></li>
              <li><Link href="/catalog?category=Sports Wear" className="text-muted-foreground hover:text-primary transition-colors text-sm">Sports Uniforms</Link></li>
              <li><Link href="/catalog?category=Caps" className="text-muted-foreground hover:text-primary transition-colors text-sm">Headwear</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display text-xl uppercase tracking-widest text-white mb-6">Contact</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="mailto:info@signitiveenterprises.com" className="hover:text-primary transition-colors">info@signitiveenterprises.com</a></li>
              <li><a href="https://wa.me/923114661392" className="hover:text-primary transition-colors">+92 311 4661392</a></li>
              <li>Sialkot, Pakistan</li>
              <li className="pt-2">
                <a href="https://signitiveenterprises.trustpass.alibaba.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors uppercase tracking-wider font-semibold text-xs border-b border-primary/30 pb-1">
                  Verified Alibaba Supplier
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Signitive Enterprises. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
