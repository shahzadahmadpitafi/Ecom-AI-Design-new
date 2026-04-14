import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Filter, Package, ArrowRight } from "lucide-react";

const FABRICS = ["All", "100% Cotton", "Polyester Blend", "Cotton-Poly Mix"];
const MOQ_OPTIONS = [
  { label: "All MOQ", value: "all" },
  { label: "12+ units", value: "12" },
  { label: "50+ units", value: "50" },
  { label: "100+ units", value: "100" },
];

export default function Catalog() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFabric, setSelectedFabric] = useState("All");
  const [moqFilter, setMoqFilter] = useState("all");

  const { data: categories, isLoading: catsLoading } = useListCategories({
    query: { queryKey: ["listCategories"] }
  });

  const { data: products, isLoading: productsLoading } = useListProducts(
    selectedCategory !== "All" ? { category: selectedCategory, limit: 100 } : { limit: 100 },
    { query: { queryKey: ["listProducts", selectedCategory] } }
  );

  const filteredProducts = products?.filter(p => {
    if (selectedFabric !== "All" && !p.availableFabrics.includes(selectedFabric)) return false;
    if (moqFilter && moqFilter !== "all" && p.minOrderQty < parseInt(moqFilter)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/30 py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-wider text-white uppercase mb-3">
            Product <span className="text-primary">Catalog</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            {filteredProducts?.length ?? "..."} products across {categories?.length ?? "..."} categories.
            All customizable — your brand, your vision.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-56 shrink-0">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="h-4 w-4 text-primary" />
              <span className="font-display text-lg uppercase tracking-widest text-white">Filter</span>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Category</p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`text-left px-3 py-2 text-sm border transition-all ${selectedCategory === "All" ? "border-primary bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:text-primary hover:border-primary/30"}`}
                  data-testid="filter-category-all"
                >
                  All Categories
                </button>
                {catsLoading ? (
                  Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-none" />)
                ) : categories?.map(cat => (
                  <button
                    key={cat.category}
                    onClick={() => setSelectedCategory(cat.category)}
                    className={`text-left px-3 py-2 text-sm border transition-all ${selectedCategory === cat.category ? "border-primary bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:text-primary hover:border-primary/30"}`}
                    data-testid={`filter-category-${cat.category.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {cat.category}
                    <span className="ml-auto text-xs text-muted-foreground/60">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fabric Filter */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Fabric</p>
              <Select value={selectedFabric} onValueChange={setSelectedFabric}>
                <SelectTrigger className="bg-background border-border" data-testid="select-fabric-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {FABRICS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* MOQ Filter */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Min. Order Qty</p>
              <Select value={moqFilter} onValueChange={setMoqFilter}>
                <SelectTrigger className="bg-background border-border" data-testid="select-moq-filter">
                  <SelectValue placeholder="All MOQ" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {MOQ_OPTIONS.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset */}
            {(selectedCategory !== "All" || selectedFabric !== "All" || moqFilter !== "all") && (
              <Button
                variant="outline"
                className="w-full border-border text-muted-foreground hover:border-primary hover:text-primary font-display tracking-wider uppercase text-xs"
                onClick={() => { setSelectedCategory("All"); setSelectedFabric("All"); setMoqFilter("all"); }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            )}
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {productsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="aspect-[3/4] rounded-none mb-3" />
                    <Skeleton className="h-5 w-3/4 rounded-none mb-2" />
                    <Skeleton className="h-4 w-1/2 rounded-none mb-3" />
                    <Skeleton className="h-9 w-full rounded-none" />
                  </div>
                ))}
              </div>
            ) : filteredProducts?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-2">No products found</h3>
                <p className="text-muted-foreground text-sm mb-6">Try adjusting your filters</p>
                <Button
                  variant="outline"
                  onClick={() => { setSelectedCategory("All"); setSelectedFabric("All"); setMoqFilter(""); }}
                  className="border-primary text-primary hover:bg-primary/10 font-display tracking-wider uppercase"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts?.map(product => (
                  <div key={product.id} className="group" data-testid={`card-product-${product.id}`}>
                    <div className="relative aspect-[3/4] mb-3 bg-card overflow-hidden border border-border group-hover:border-primary/50 transition-all">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-20 h-20 border-2 border-primary/20 flex items-center justify-center">
                            <Package className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-xs text-primary uppercase tracking-widest font-bold">{product.category}</span>
                      </div>
                      {product.featured && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-2 py-0.5">
                            Popular
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-display text-base md:text-lg tracking-wider text-white uppercase mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-xs mb-1">
                      From <span className="text-primary font-bold">PKR {product.basePricePkr.toLocaleString()}</span> / unit
                    </p>
                    <p className="text-muted-foreground/60 text-xs mb-3">MOQ: {product.minOrderQty} units</p>

                    <Button
                      asChild
                      className="w-full bg-transparent border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display tracking-wider uppercase text-xs h-9 transition-all"
                      data-testid={`button-customize-${product.id}`}
                    >
                      <Link href={`/studio?product=${product.id}`}>
                        Customize This <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
