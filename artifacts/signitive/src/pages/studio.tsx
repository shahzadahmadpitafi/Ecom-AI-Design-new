import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useListProducts, useCreateDesign, getListDesignsQueryKey, useCalculateQuote } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import {
  Wand2, Upload, Type, ZoomIn, ZoomOut, RotateCcw, Save, ShoppingCart, Loader2
} from "lucide-react";

const STYLE_TAGS = ["Vintage", "Minimalist", "Bold", "Streetwear", "Luxury", "Grunge"];
const GARMENT_COLORS = [
  { label: "Black", value: "#0a0a0a" },
  { label: "White", value: "#f5f5f5" },
  { label: "Charcoal", value: "#444444" },
  { label: "Navy", value: "#1a2744" },
  { label: "Burgundy", value: "#6b1c2e" },
  { label: "Forest Green", value: "#1a3a2a" },
  { label: "Royal Blue", value: "#1a4a9a" },
  { label: "Red", value: "#c01a1a" },
];
const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const FABRICS = ["100% Cotton", "Polyester Blend", "Cotton-Poly Mix"];
const GSM = ["160gsm", "180gsm", "220gsm", "280gsm"];
const ANGLES = ["Front", "Back", "Left Sleeve", "Right Sleeve"];

export default function Studio() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: products } = useListProducts({ limit: 50 }, {
    query: { queryKey: ["listProducts"] }
  });

  const createDesign = useCreateDesign();

  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [garmentColor, setGarmentColor] = useState("#0a0a0a");
  const [selectedSize, setSelectedSize] = useState("L");
  const [selectedFabric, setSelectedFabric] = useState("100% Cotton");
  const [selectedGsm, setSelectedGsm] = useState("220gsm");
  const [brandLabel, setBrandLabel] = useState(false);
  const [activeAngle, setActiveAngle] = useState("Front");
  const [zoom, setZoom] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesign, setGeneratedDesign] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [textColor, setTextColor] = useState("#C9A84C");
  const [designName, setDesignName] = useState("My Design");
  const [isSaving, setIsSaving] = useState(false);

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Enter a prompt", description: "Describe the design you want to generate.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setGeneratedDesign(null);
    // Simulate AI generation
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));
    setGeneratedDesign(`AI Design: "${prompt}" — ${selectedStyles.join(", ") || "Default Style"}`);
    setIsGenerating(false);
    toast({ title: "Design generated!", description: "Your AI design is ready. Adjust placement on the canvas." });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const designData = JSON.stringify({
        productId: selectedProduct,
        garmentColor,
        size: selectedSize,
        fabric: selectedFabric,
        gsm: selectedGsm,
        brandLabel,
        prompt,
        styles: selectedStyles,
        generatedDesign,
        customText,
        angle: activeAngle,
      });

      await createDesign.mutateAsync({
        data: {
          name: designName,
          productId: selectedProduct ? parseInt(selectedProduct) : null,
          designData,
          prompt: prompt || null,
        }
      });

      toast({ title: "Design saved!", description: "Your design has been saved to your account." });
    } catch {
      toast({ title: "Save failed", description: "Could not save design. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToQuote = () => {
    setLocation("/quote");
    toast({ title: "Added to quote", description: "Navigate to the quote page to finalize your order." });
  };

  const selectedProductData = products?.find(p => p.id.toString() === selectedProduct);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Studio Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur px-4 py-3">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <h1 className="font-display text-2xl tracking-widest uppercase text-white">AI Design Studio</h1>
          <div className="flex items-center gap-2">
            <Input
              value={designName}
              onChange={e => setDesignName(e.target.value)}
              className="w-40 bg-background border-border text-sm font-medium"
              placeholder="Design name..."
              data-testid="input-design-name"
            />
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 font-display tracking-wider uppercase"
              onClick={handleSave}
              disabled={isSaving}
              data-testid="button-save-design"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider uppercase"
              onClick={handleAddToQuote}
              data-testid="button-add-to-quote"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Quote
            </Button>
          </div>
        </div>
      </div>

      {/* Studio Panels */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 min-h-0">

        {/* LEFT PANEL: Product Selector */}
        <div className="w-full lg:w-64 border-r border-border bg-card/30 overflow-y-auto p-4 flex flex-col gap-4">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Product</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger data-testid="select-product" className="bg-background border-border">
                <SelectValue placeholder="Select product..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-64">
                {products?.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProductData && (
              <p className="text-xs text-muted-foreground mt-1">{selectedProductData.category} · {selectedProductData.subcategory}</p>
            )}
          </div>

          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Garment Color</Label>
            <div className="flex flex-wrap gap-2">
              {GARMENT_COLORS.map(c => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => setGarmentColor(c.value)}
                  className={`w-8 h-8 border-2 transition-all ${garmentColor === c.value ? "border-primary scale-110" : "border-border"}`}
                  style={{ backgroundColor: c.value }}
                  data-testid={`color-swatch-${c.label.toLowerCase()}`}
                />
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Size</Label>
            <div className="flex flex-wrap gap-1">
              {SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-2 py-1 text-xs font-medium border transition-all ${selectedSize === s ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary"}`}
                  data-testid={`size-${s}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Fabric</Label>
            <Select value={selectedFabric} onValueChange={setSelectedFabric}>
              <SelectTrigger className="bg-background border-border" data-testid="select-fabric">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {FABRICS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">GSM Weight</Label>
            <Select value={selectedGsm} onValueChange={setSelectedGsm}>
              <SelectTrigger className="bg-background border-border" data-testid="select-gsm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {GSM.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 p-3 border border-border bg-muted/20">
            <Checkbox
              id="brandLabel"
              checked={brandLabel}
              onCheckedChange={v => setBrandLabel(!!v)}
              data-testid="checkbox-brand-label"
            />
            <Label htmlFor="brandLabel" className="text-sm cursor-pointer">Add Brand Label</Label>
          </div>
        </div>

        {/* CENTER PANEL: Canvas Preview */}
        <div className="flex-1 flex flex-col items-center justify-center bg-background p-4 min-h-[400px] lg:min-h-0 relative">
          {/* Angle Tabs */}
          <div className="flex gap-1 mb-6">
            {ANGLES.map(angle => (
              <button
                key={angle}
                onClick={() => setActiveAngle(angle)}
                className={`px-3 py-1.5 text-xs font-medium uppercase tracking-widest border transition-all ${activeAngle === angle ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary"}`}
                data-testid={`angle-${angle.toLowerCase().replace(" ", "-")}`}
              >
                {angle}
              </button>
            ))}
          </div>

          {/* Canvas Area */}
          <div
            className="relative border border-primary/30 bg-muted/10 overflow-hidden transition-all duration-300"
            style={{
              width: `${300 * zoom}px`,
              height: `${380 * zoom}px`,
              backgroundColor: garmentColor,
              maxWidth: "100%",
            }}
            data-testid="canvas-preview"
          >
            {/* Ghost mannequin / flat-lay placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                {/* T-shirt silhouette SVG */}
                <svg viewBox="0 0 200 240" className="w-48 h-56 opacity-20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 30 L0 80 L30 90 L30 220 L170 220 L170 90 L200 80 L160 30 L130 50 C120 60 80 60 70 50 Z" fill="white" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
            </div>

            {/* Design overlay */}
            {generatedDesign && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-4">
                  <div
                    className="text-xs font-bold uppercase tracking-widest p-3 border"
                    style={{ color: "#C9A84C", borderColor: "#C9A84C", backgroundColor: "rgba(0,0,0,0.5)" }}
                  >
                    {generatedDesign}
                  </div>
                </div>
              </div>
            )}

            {customText && (
              <div className="absolute bottom-16 inset-x-0 flex items-center justify-center">
                <span className="font-display text-3xl tracking-widest" style={{ color: textColor }}>
                  {customText}
                </span>
              </div>
            )}

            {/* Angle label */}
            <div className="absolute top-2 right-2 text-xs text-muted-foreground/50 uppercase tracking-widest">{activeAngle}</div>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              className="p-2 border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all"
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(2, z + 0.1))}
              className="p-2 border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all"
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-2 border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all"
              data-testid="button-reset-zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Design Input */}
        <div className="w-full lg:w-80 border-l border-border bg-card/30 overflow-y-auto">
          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="w-full rounded-none border-b border-border bg-card/50">
              <TabsTrigger value="ai" className="flex-1 rounded-none font-display tracking-wider uppercase text-xs" data-testid="tab-ai">
                <Wand2 className="h-3 w-3 mr-1" /> AI Generate
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex-1 rounded-none font-display tracking-wider uppercase text-xs" data-testid="tab-upload">
                <Upload className="h-3 w-3 mr-1" /> Upload
              </TabsTrigger>
              <TabsTrigger value="text" className="flex-1 rounded-none font-display tracking-wider uppercase text-xs" data-testid="tab-text">
                <Type className="h-3 w-3 mr-1" /> Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="p-4 flex flex-col gap-4 m-0">
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Describe Your Design</Label>
                <Textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="A vintage 90s eagle with neon lightning bolts, distressed texture..."
                  className="bg-background border-border resize-none min-h-[100px] text-sm"
                  data-testid="textarea-prompt"
                />
              </div>

              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Style</Label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleStyle(tag)}
                      className={`px-3 py-1 text-xs font-medium border transition-all uppercase tracking-wider ${selectedStyles.includes(tag) ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary"}`}
                      data-testid={`style-${tag.toLowerCase()}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg tracking-widest uppercase h-12"
                onClick={handleGenerate}
                disabled={isGenerating}
                data-testid="button-generate"
              >
                {isGenerating ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</>
                ) : (
                  <><Wand2 className="h-4 w-4 mr-2" /> Generate Design</>
                )}
              </Button>

              {isGenerating && (
                <div className="space-y-2" data-testid="skeleton-generating">
                  <Skeleton className="h-4 w-full rounded-none" />
                  <Skeleton className="h-4 w-3/4 rounded-none" />
                  <Skeleton className="h-32 w-full rounded-none" />
                </div>
              )}

              {generatedDesign && !isGenerating && (
                <div className="border border-primary/30 p-3 bg-primary/5">
                  <p className="text-xs text-primary font-medium uppercase tracking-wider mb-2">Generated Design</p>
                  <p className="text-xs text-muted-foreground">{generatedDesign}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerate}
                    className="mt-3 w-full border-primary text-primary hover:bg-primary/10 font-display tracking-wider uppercase text-xs"
                    data-testid="button-regenerate"
                  >
                    Regenerate
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="p-4 flex flex-col gap-4 m-0">
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Upload Your Logo</Label>
                <div
                  className="border-2 border-dashed border-border hover:border-primary transition-colors p-8 text-center cursor-pointer bg-muted/10"
                  data-testid="dropzone-upload"
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">PNG, SVG, AI files accepted</p>
                  <input
                    id="file-input"
                    type="file"
                    accept=".png,.svg,.ai,.pdf"
                    className="hidden"
                    onChange={() => toast({ title: "File uploaded", description: "Background will be removed automatically." })}
                    data-testid="input-file"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Background will be auto-removed on upload.</p>
              </div>
            </TabsContent>

            <TabsContent value="text" className="p-4 flex flex-col gap-4 m-0">
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Custom Text</Label>
                <Input
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  placeholder="YOUR BRAND NAME"
                  className="bg-background border-border font-display tracking-widest"
                  data-testid="input-custom-text"
                />
              </div>

              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Text Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={textColor}
                    onChange={e => setTextColor(e.target.value)}
                    className="w-10 h-10 border border-border cursor-pointer bg-background"
                    data-testid="input-text-color"
                  />
                  <Input
                    value={textColor}
                    onChange={e => setTextColor(e.target.value)}
                    className="bg-background border-border font-mono text-sm w-28"
                    data-testid="input-text-color-hex"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Font Style</Label>
                <Select defaultValue="bebas">
                  <SelectTrigger className="bg-background border-border" data-testid="select-font">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="bebas">Bebas Neue (Display)</SelectItem>
                    <SelectItem value="inter">Inter (Body)</SelectItem>
                    <SelectItem value="mono">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
