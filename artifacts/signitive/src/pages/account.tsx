import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useListDesigns, useDeleteDesign, getListDesignsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Trash2, User, Package, Wand2, Clock, RefreshCcw } from "lucide-react";

export default function Account() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: designs, isLoading } = useListDesigns({
    query: { queryKey: getListDesignsQueryKey() }
  });
  const deleteDesign = useDeleteDesign();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteDesign.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListDesignsQueryKey() });
      toast({ title: "Design deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/30 py-12">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 border border-primary flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-bold tracking-wider text-white uppercase">My Account</h1>
            <p className="text-muted-foreground">Saved designs, order history, and profile settings.</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Saved Designs */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl uppercase tracking-widest text-white flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" /> Saved Designs
              </h2>
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10 font-display tracking-wider uppercase text-xs">
                <Link href="/studio">New Design</Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="border border-border p-4">
                    <Skeleton className="h-32 w-full rounded-none mb-3" />
                    <Skeleton className="h-5 w-3/4 rounded-none mb-2" />
                    <Skeleton className="h-4 w-1/2 rounded-none" />
                  </div>
                ))}
              </div>
            ) : designs?.length === 0 ? (
              <div className="border border-dashed border-border p-16 text-center">
                <Wand2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No saved designs yet.</p>
                <Button asChild className="bg-primary text-primary-foreground font-display tracking-wider uppercase">
                  <Link href="/studio">Open Design Studio</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {designs?.map(design => (
                  <div key={design.id} className="border border-border bg-card/30 hover:border-primary/50 transition-all group" data-testid={`card-design-${design.id}`}>
                    <div className="aspect-[4/3] bg-muted/20 border-b border-border flex items-center justify-center">
                      {design.previewUrl ? (
                        <img src={design.previewUrl} alt={design.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                          {design.productName && <p className="text-xs text-muted-foreground">{design.productName}</p>}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-lg tracking-wider text-white uppercase mb-1">{design.name}</h3>
                      {design.prompt && (
                        <p className="text-xs text-muted-foreground italic mb-2 line-clamp-2">"{design.prompt}"</p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                        <Clock className="h-3 w-3" />
                        {new Date(design.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" className="flex-1 border-primary text-primary hover:bg-primary/10 font-display tracking-wider uppercase text-xs h-8" data-testid={`button-edit-design-${design.id}`}>
                          <Link href="/studio">Edit</Link>
                        </Button>
                        <Button asChild className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider uppercase text-xs h-8" data-testid={`button-quote-design-${design.id}`}>
                          <Link href="/quote">Quote</Link>
                        </Button>
                        <button
                          onClick={() => handleDelete(design.id)}
                          disabled={deletingId === design.id}
                          className="w-8 h-8 border border-border text-muted-foreground hover:border-destructive hover:text-destructive flex items-center justify-center transition-colors"
                          data-testid={`button-delete-design-${design.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="border border-border bg-card/30 p-6">
              <h3 className="font-display text-xl uppercase tracking-widest text-white mb-4">Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Saved Designs</span>
                  <span className="font-display text-2xl text-primary">{designs?.length ?? 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Quote Requests</span>
                  <span className="font-display text-2xl text-primary">0</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border border-border bg-card/30 p-6">
              <h3 className="font-display text-xl uppercase tracking-widest text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button asChild className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider uppercase" data-testid="button-open-studio">
                  <Link href="/studio">Open Design Studio</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start border-border text-muted-foreground hover:border-primary hover:text-primary font-display tracking-wider uppercase" data-testid="button-view-catalog">
                  <Link href="/catalog">Browse Catalog</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start border-border text-muted-foreground hover:border-primary hover:text-primary font-display tracking-wider uppercase" data-testid="button-request-quote">
                  <Link href="/quote">Request Quote</Link>
                </Button>
              </div>
            </div>

            {/* Contact */}
            <div className="border border-border bg-card/30 p-6">
              <h3 className="font-display text-xl uppercase tracking-widest text-white mb-4">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">Our team is available via WhatsApp for dedicated support.</p>
              <a
                href="https://wa.me/923114661392"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold uppercase tracking-wider transition-colors"
                data-testid="link-whatsapp-support"
              >
                WhatsApp: +92 311 4661392
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
