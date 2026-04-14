import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Box, Scissors, Truck, Star, CheckCircle } from "lucide-react";
import { useGetFeaturedProducts, getGetFeaturedProductsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featuredProducts, isLoading } = useGetFeaturedProducts({
    query: { queryKey: getGetFeaturedProductsQueryKey() }
  });

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="/hero-bg.png" 
            alt="Luxury streetwear manufacturing" 
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=2070&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 border border-primary/30 bg-background/50 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-medium uppercase tracking-widest text-primary">Premium Apparel Manufacturing</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-wider text-white mb-6 uppercase leading-[0.9] text-shadow-gold animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Design. <br className="md:hidden" /><span className="text-primary">Preview.</span> <br className="md:hidden" />Manufacture.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            From raw concept to global distribution. We build premium custom apparel for streetwear brands, sports teams, and corporate clients with uncompromised precision.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xl tracking-wider h-14 px-8 box-shadow-gold box-shadow-gold-hover transition-all">
              <Link href="/studio">Start Designing <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 font-display text-xl tracking-wider h-14 px-8">
              <Link href="/catalog">Shop Collection</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* MOQ Banner */}
      <div className="bg-primary text-primary-foreground py-3 border-y border-primary/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Global Shipping</span>
            <span className="hidden sm:inline-block">•</span>
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Low MOQ Available</span>
            <span className="hidden sm:inline-block">•</span>
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Premium Quality</span>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold tracking-wider text-white uppercase mb-2">Signature <span className="text-primary">Blanks</span></h2>
              <p className="text-muted-foreground">The foundation of your brand. Premium fabrics, perfect cuts.</p>
            </div>
            <Button asChild variant="link" className="text-primary hover:text-primary/80 font-display tracking-widest text-lg uppercase p-0">
              <Link href="/catalog">View Full Catalog <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="aspect-[3/4] w-full rounded-none" />
                  <Skeleton className="h-6 w-3/4 rounded-none" />
                  <Skeleton className="h-4 w-1/4 rounded-none" />
                </div>
              ))
            ) : featuredProducts?.slice(0, 4).map((product) => (
              <Link key={product.id} href={`/studio?product=${product.id}`} className="group block">
                <div className="glass-card relative aspect-[3/4] mb-4 overflow-hidden bg-muted/20">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <Box className="h-16 w-16" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="font-display tracking-widest uppercase text-primary border border-primary px-6 py-2 bg-background/80 backdrop-blur-sm">
                      Customize
                    </span>
                  </div>
                </div>
                <h3 className="font-display text-xl tracking-wider text-white uppercase group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-muted-foreground text-sm">From PKR {product.basePricePkr.toLocaleString()} / unit</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-card relative overflow-hidden border-y border-border">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-wider text-white uppercase mb-4">The <span className="text-primary">Process</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From imagination to physical product in three precise steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Scissors,
                title: "01. Design & spec",
                desc: "Use our AI studio to visualize your concept or upload your own tech packs. Select fabrics, GSM, and custom detailing."
              },
              {
                icon: Box,
                title: "02. Quote & Sample",
                desc: "Get instant bulk pricing based on tiers. Request a physical sample to verify the cut, fabric, and print quality before mass production."
              },
              {
                icon: Truck,
                title: "03. Manufacture & Ship",
                desc: "We produce your garments in our Sialkot facility using premium techniques, then ship globally directly to your warehouse."
              }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 glass-card relative group">
                <div className="w-16 h-16 rounded-none bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="font-display text-2xl tracking-wider text-white uppercase mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-wider text-white uppercase mb-4">Trusted <span className="text-primary">Globally</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Brands that rely on our manufacturing excellence.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                text: "The quality of the 280gsm oversized hoodies exceeded our expectations. The custom dye job was exactly matched to our Pantone specs.",
                author: "Alex M.",
                brand: "Urban Aesthetics, UK"
              },
              {
                text: "Switched our entire production to Signitive last year. Their attention to detail on complex embroidery files is unmatched in the industry.",
                author: "David L.",
                brand: "Velocity Athletics, USA"
              },
              {
                text: "Fast turnaround times without compromising on quality. The AI design tool made communicating our vision for the summer drop incredibly easy.",
                author: "Sarah J.",
                brand: "Nova Streetwear, AUS"
              }
            ].map((t, i) => (
              <div key={i} className="glass-card p-8 border-l-4 border-l-primary flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-primary mb-6">
                    {Array(5).fill(0).map((_, j) => <Star key={j} className="h-4 w-4 fill-primary" />)}
                  </div>
                  <p className="text-muted-foreground italic mb-8">"{t.text}"</p>
                </div>
                <div>
                  <p className="font-bold text-white uppercase tracking-wider font-display">{t.author}</p>
                  <p className="text-primary text-sm font-medium">{t.brand}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
