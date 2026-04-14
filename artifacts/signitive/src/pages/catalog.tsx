import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Filter, Package, ArrowRight, MessageCircle, Search, X } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { waLink } from "@/components/WhatsAppButton";

const FABRICS = ["All", "100% Cotton", "100% Polyester", "Polyester-Spandex", "Poly-Cotton Blend", "Sublimation", "Leather"];
const MOQ_OPTIONS = [
  { label: "All MOQ", value: "all" },
  { label: "25+ units", value: "25" },
  { label: "50+ units", value: "50" },
  { label: "100+ units", value: "100" },
];

export default function Catalog() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialCategory = params.get("category") ?? "All";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedFabric, setSelectedFabric] = useState("All");
  const [moqFilter, setMoqFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customizableOnly, setCustomizableOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    const cat = params.get("category");
    if (cat) setSelectedCategory(cat);
  }, [search]);

  const { format } = useCurrency();

  const { data: categories, isLoading: catsLoading } = useListCategories({
    query: { queryKey: ["listCategories"] }
  });

  const { data: products, isLoading: productsLoading } = useListProducts(
    selectedCategory !== "All" ? { category: selectedCategory, limit: 200 } : { limit: 200 },
    { query: { queryKey: ["listProducts", selectedCategory] } }
  );

  const filteredProducts = products?.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.subcategory.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedFabric !== "All" && !p.availableFabrics.some(f => f.toLowerCase().includes(selectedFabric.toLowerCase()))) return false;
    if (moqFilter && moqFilter !== "all" && p.minOrderQty < parseInt(moqFilter)) return false;
    if (customizableOnly && !p.isCustomizable) return false;
    if (minPrice && p.basePricePkr < parseInt(minPrice)) return false;
    if (maxPrice && p.basePricePkr > parseInt(maxPrice)) return false;
    return true;
  });

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedFabric("All");
    setMoqFilter("all");
    setSearchQuery("");
    setCustomizableOnly(false);
    setMinPrice("");
    setMaxPrice("");
  };

  const hasFilters = selectedCategory !== "All" || selectedFabric !== "All" || moqFilter !== "all" || searchQuery || customizableOnly || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-border/40 bg-[#0f0f0f] py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-primary">Catalog</span>
            {selectedCategory !== "All" && (<><span>/</span><span className="text-white">{selectedCategory}</span></>)}
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-wider text-white uppercase mb-3">
            Product <span className="text-primary">Catalog</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            {filteredProducts?.length ?? "..."} products across {categories?.length ?? "..."} categories. All customizable — your brand, your vision.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products... (e.g. hoodie, boxing gloves, rashguard)"
            className="pl-12 pr-10 bg-[#0f0f0f] border-border/50 h-12 text-white placeholder:text-muted-foreground/60 focus:border-primary"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-56 shrink-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <span className="font-display text-lg uppercase tracking-widest text-white">Filters</span>
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Clear</button>
              )}
            </div>

            {/* Categories */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Category</p>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`text-left px-3 py-2 text-sm border transition-all ${selectedCategory === "All" ? "border-primary bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:text-primary hover:border-primary/30"}`}
                >
                  All Categories
                </button>
                {catsLoading ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-none" />) : categories?.map(cat => (
                  <button
                    key={cat.category}
                    onClick={() => setSelectedCategory(cat.category)}
                    className={`text-left px-3 py-2 text-sm border transition-all flex items-center justify-between ${selectedCategory === cat.category ? "border-primary bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:text-primary hover:border-primary/30"}`}
                  >
                    <span>{cat.category}</span>
                    <span className="text-xs opacity-50">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fabric */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Fabric Type</p>
              <div className="flex flex-col gap-0.5">
                {FABRICS.map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFabric(f)}
                    className={`text-left px-3 py-2 text-sm border transition-all ${selectedFabric === f ? "border-primary bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:text-primary hover:border-primary/30"}`}
                  >{f}</button>
                ))}
              </div>
            </div>

            {/* MOQ */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Min Order Qty</p>
              <div className="flex flex-col gap-0.5">
                {MOQ_OPTIONS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setMoqFilter(m.value)}
                    className={`text-left px-3 py-2 text-sm border transition-all ${moqFilter === m.value ? "border-primary bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:text-primary hover:border-primary/30"}`}
                  >{m.label}</button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Price Range (PKR)</p>
              <div className="flex gap-2">
                <Input value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" className="bg-[#0f0f0f] border-border/50 text-xs h-9 text-white" type="number" />
                <Input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" className="bg-[#0f0f0f] border-border/50 text-xs h-9 text-white" type="number" />
              </div>
            </div>

            {/* Customizable Toggle */}
            <div className="mb-6">
              <button
                onClick={() => setCustomizableOnly(v => !v)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm border transition-all ${customizableOnly ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:border-primary/30 hover:text-primary"}`}
              >
                <div className={`w-4 h-4 border flex items-center justify-center shrink-0 ${customizableOnly ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                  {customizableOnly && <span className="text-black text-[10px] font-bold">✓</span>}
                </div>
                Customizable Only
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {productsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="border border-border/30">
                    <Skeleton className="aspect-square rounded-none" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4 rounded-none" />
                      <Skeleton className="h-4 w-1/2 rounded-none" />
                      <Skeleton className="h-9 w-full rounded-none" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-2">No products found</h3>
                <p className="text-muted-foreground text-sm mb-6">Try adjusting your filters or search</p>
                <Button variant="outline" onClick={clearFilters} className="border-primary text-primary hover:bg-primary/10 font-display tracking-wider uppercase">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts?.map(product => (
                  <div key={product.id} className="group border border-border/30 hover:border-primary transition-all duration-200 bg-card/10" data-testid={`card-product-${product.id}`}>
                    <div className="relative aspect-square overflow-hidden bg-[#111]">
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=400&auto=format&fit=crop"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="bg-primary text-primary-foreground text-xs font-display tracking-wider px-2 py-0.5">{product.category}</span>
                      </div>
                      {product.featured && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-white text-black text-xs font-bold uppercase tracking-wider px-2 py-0.5">Popular</span>
                        </div>
                      )}
                      {!product.isCustomizable && (
                        <div className="absolute bottom-2 right-2">
                          <span className="bg-black/80 text-muted-foreground text-xs px-2 py-0.5 border border-border/40">Std Only</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider uppercase text-xs h-9 px-4" data-testid={`button-customize-${product.id}`}>
                          <Link href={`/studio?product=${product.id}`}>Customize <ArrowRight className="h-3 w-3 ml-1" /></Link>
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="font-display text-base md:text-lg tracking-wider text-white uppercase mb-1 group-hover:text-primary transition-colors line-clamp-1">{product.name}</div>
                      <div className="text-xs text-muted-foreground/60 mb-2">{product.subcategory}</div>
                      <div className="text-primary font-semibold text-sm mb-1">From {format(product.basePricePkr)} / unit</div>
                      <div className="text-muted-foreground/60 text-xs mb-3">MOQ: {product.minOrderQty} units</div>
                      <div className="flex gap-2">
                        <Button asChild className="flex-1 bg-transparent border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display tracking-wider uppercase text-xs h-9 transition-all" size="sm">
                          <Link href={`/studio?product=${product.id}`}>Customize</Link>
                        </Button>
                        <Link href={`/quote`}>
                          <Button variant="ghost" className="border border-border/40 text-muted-foreground hover:border-primary/50 hover:text-white text-xs h-9 px-3" size="sm">
                            Quote
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Can't find what you need */}
            {!productsLoading && (
              <div className="mt-12 border border-border/30 bg-card/10 p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <div className="font-display text-2xl text-white uppercase tracking-wider mb-2">Can't Find What You Need?</div>
                  <div className="text-muted-foreground">We manufacture almost anything. Send us your requirements and we'll produce it.</div>
                </div>
                <a href={waLink("Hi Signitive! I'm looking for a custom product not on your catalog. Can you help?")} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#25D366] hover:bg-[#25D366]/90 text-white font-display tracking-wider uppercase shrink-0">
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Inquiry
                  </Button>
                </a>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
