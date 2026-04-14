import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useListProducts, useCreateDesign, getListDesignsQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Wand2, Upload, Type, ZoomIn, ZoomOut, RotateCcw, Save, ShoppingCart, Loader2, Zap, ChevronRight } from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const STYLE_TAGS = [
  { label: "Vintage", prompt: "vintage style, worn look" },
  { label: "Minimalist", prompt: "minimalist, clean lines" },
  { label: "Bold", prompt: "bold, high contrast" },
  { label: "Streetwear", prompt: "streetwear aesthetic, urban" },
  { label: "Luxury", prompt: "luxury, premium, gold accents" },
  { label: "Grunge", prompt: "grunge aesthetic, distressed texture" },
];

const GARMENT_COLORS = [
  { label: "Black",       value: "#0a0a0a",  text: "#ffffff" },
  { label: "White",       value: "#f5f5f0",  text: "#1a1a1a" },
  { label: "Charcoal",    value: "#3a3a3a",  text: "#ffffff" },
  { label: "Navy",        value: "#1a2744",  text: "#ffffff" },
  { label: "Burgundy",    value: "#6b1c2e",  text: "#ffffff" },
  { label: "Olive",       value: "#4a4a1a",  text: "#ffffff" },
  { label: "Royal Blue",  value: "#1a4a9a",  text: "#ffffff" },
  { label: "Red",         value: "#c01a1a",  text: "#ffffff" },
];

const SIZES   = ["XS","S","M","L","XL","2XL","3XL"];
const FABRICS = ["100% Cotton","Polyester Blend","Cotton-Poly Mix"];
const GSM     = ["160gsm","180gsm","220gsm","280gsm"];
const ANGLES  = ["Front","Back","Left Sleeve","Right Sleeve"];

const MAX_PROMPT = 300;

// ─── Garment SVG Mockup ───────────────────────────────────────────────────────

function GarmentSVG({ angle, color, textColor }: { angle: string; color: string; textColor: string }) {
  if (angle === "Front" || angle === "Back") {
    return (
      <svg viewBox="0 0 300 360" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Drop shadow */}
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="rgba(0,0,0,0.5)" />
          </filter>
          <clipPath id="tshirt-clip">
            <path d="M60 40 L0 100 L40 120 L40 330 L260 330 L260 120 L300 100 L240 40 C220 55 190 65 150 65 C110 65 80 55 60 40 Z" />
          </clipPath>
        </defs>
        {/* Garment body */}
        <path
          d="M60 40 L0 100 L40 120 L40 330 L260 330 L260 120 L300 100 L240 40 C220 55 190 65 150 65 C110 65 80 55 60 40 Z"
          fill={color}
          filter="url(#shadow)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        {/* Neck line */}
        <path
          d="M108 38 Q150 80 192 38"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="2"
        />
        {/* Fabric texture lines */}
        <path d="M40 180 L260 180" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <path d="M40 220 L260 220" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <path d="M40 260 L260 260" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        {/* Seam lines */}
        <line x1="40" y1="120" x2="40" y2="330" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 6" />
        <line x1="260" y1="120" x2="260" y2="330" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 6" />
        {/* Print zone indicator */}
        <rect x="95" y="110" width="110" height="120" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" rx="2" />
        {/* View label */}
        <text x="150" y="352" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="sans-serif">{angle.toUpperCase()} VIEW</text>
      </svg>
    );
  }

  if (angle === "Left Sleeve" || angle === "Right Sleeve") {
    const flip = angle === "Right Sleeve";
    return (
      <svg viewBox="0 0 300 360" className="w-full h-full" xmlns="http://www.w3.org/2000/svg"
        style={{ transform: flip ? "scaleX(-1)" : undefined }}>
        <defs>
          <filter id="shadow2" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="rgba(0,0,0,0.5)" />
          </filter>
        </defs>
        {/* Sleeve shape */}
        <path
          d="M40 60 L250 20 L280 140 L260 280 L40 300 Z"
          fill={color}
          filter="url(#shadow2)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        {/* Seam */}
        <line x1="40" y1="60" x2="40" y2="300" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 6" />
        {/* Print zone */}
        <rect x="90" y="100" width="110" height="110" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" rx="2" />
        <text x="150" y="352" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="sans-serif">{angle.toUpperCase()}</text>
      </svg>
    );
  }
  return null;
}

// ─── Print Zone coords per angle (for overlaying AI image) ─────────────────

function getPrintZone(angle: string) {
  if (angle === "Front" || angle === "Back") {
    return { top: "30.5%", left: "31.5%", width: "37%", height: "33%" };
  }
  return { top: "28%", left: "30%", width: "37%", height: "30%" };
}

// ─── Main Studio Component ────────────────────────────────────────────────────

export default function Studio() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const { data: products } = useListProducts({ limit: 50 }, {
    query: { queryKey: ["listProducts"] }
  });
  const createDesign = useCreateDesign();

  // State
  const [selectedProduct, setSelectedProduct]   = useState<string>("");
  const [garmentColor, setGarmentColor]          = useState(GARMENT_COLORS[0]);
  const [selectedSize, setSelectedSize]          = useState("L");
  const [selectedFabric, setSelectedFabric]      = useState("100% Cotton");
  const [selectedGsm, setSelectedGsm]            = useState("220gsm");
  const [brandLabel, setBrandLabel]              = useState(false);
  const [activeAngle, setActiveAngle]            = useState("Front");
  const [zoom, setZoom]                          = useState(1);
  const [prompt, setPrompt]                      = useState("");
  const [selectedStyles, setSelectedStyles]      = useState<string[]>([]);
  const [isGenerating, setIsGenerating]          = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generationError, setGenerationError]    = useState(false);
  const [seed, setSeed]                          = useState(() => Math.floor(Math.random() * 99999));
  const [customText, setCustomText]              = useState("");
  const [textColor, setTextColor]                = useState("#C9A84C");
  const [uploadedImage, setUploadedImage]        = useState<string | null>(null);
  const [designName, setDesignName]              = useState("My Design");
  const [isSaving, setIsSaving]                  = useState(false);
  const [canvasSize, setCanvasSize]              = useState(320);

  // Responsive canvas size via ResizeObserver
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const w = e.contentRect.width;
        setCanvasSize(Math.min(w - 32, 360));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const toggleStyle = (label: string) => {
    setSelectedStyles(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  // Build the full AI prompt
  const buildPrompt = (extraSeed?: number) => {
    const stylePrompts = STYLE_TAGS
      .filter(t => selectedStyles.includes(t.label))
      .map(t => t.prompt)
      .join(", ");

    const parts = [
      prompt.trim(),
      stylePrompts,
      "apparel graphic design, high quality vector art, transparent background, white background, centered composition, print-ready artwork",
    ].filter(Boolean).join(", ");

    return parts;
  };

  // Generate via Pollinations.ai (free, no API key)
  const handleGenerate = async (newSeed?: number) => {
    if (!prompt.trim()) return;

    const useSeed = newSeed ?? seed;
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setGenerationError(false);

    const fullPrompt = buildPrompt(useSeed);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=1024&nologo=true&seed=${useSeed}&model=flux`;

    try {
      // Pre-load to detect errors
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
        // Timeout after 30s
        setTimeout(() => reject(new Error("Timeout")), 30000);
      });

      setGeneratedImageUrl(url);
      toast({ title: "Design generated!", description: "Your AI design is ready on the canvas." });
    } catch {
      setGenerationError(true);
      toast({ title: "Generation failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    const newSeed = Math.floor(Math.random() * 99999);
    setSeed(newSeed);
    handleGenerate(newSeed);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setUploadedImage(ev.target?.result as string);
      toast({ title: "Logo uploaded", description: "Your image is now on the canvas." });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const designData = JSON.stringify({
        productId: selectedProduct,
        garmentColor: garmentColor.value,
        garmentColorLabel: garmentColor.label,
        size: selectedSize,
        fabric: selectedFabric,
        gsm: selectedGsm,
        brandLabel,
        prompt,
        styles: selectedStyles,
        generatedImageUrl,
        uploadedImage,
        customText,
        angle: activeAngle,
      });

      await createDesign.mutateAsync({
        data: {
          name: designName,
          productId: selectedProduct ? parseInt(selectedProduct) : null,
          designData,
          prompt: prompt || null,
          previewUrl: generatedImageUrl || null,
        }
      });

      toast({ title: "Design saved!", description: "Saved to your account." });
    } catch {
      toast({ title: "Save failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToQuote = () => {
    // Store studio selection in sessionStorage for quote page to read
    sessionStorage.setItem("quoteProduct", JSON.stringify({
      productId: selectedProduct,
      garmentColor: garmentColor.label,
      size: selectedSize,
      fabric: selectedFabric,
      gsm: selectedGsm,
      designImageUrl: generatedImageUrl,
    }));
    setLocation("/quote");
    toast({ title: "Design added to quote!", description: "Review and submit your bulk order." });
  };

  const selectedProductData = products?.find(p => p.id.toString() === selectedProduct);
  const printZone = getPrintZone(activeAngle);
  const activeDesignImage = generatedImageUrl || uploadedImage;

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 64px)" }}>

      {/* ── Studio Header ── */}
      <div className="shrink-0 border-b border-border bg-card/60 backdrop-blur px-4 py-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="font-display text-xl tracking-widest uppercase text-white">
            AI Design Studio
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              value={designName}
              onChange={e => setDesignName(e.target.value)}
              className="w-36 h-8 bg-background border-border text-sm"
              placeholder="Design name..."
              data-testid="input-design-name"
            />
            <Button
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary/10 font-display tracking-wider uppercase h-8"
              onClick={handleSave}
              disabled={isSaving}
              data-testid="button-save-design"
            >
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Save className="h-3 w-3 mr-1.5" />}
              Save
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider uppercase h-8"
              onClick={handleAddToQuote}
              data-testid="button-add-to-quote"
            >
              <ShoppingCart className="h-3 w-3 mr-1.5" />
              Add to Quote
            </Button>
          </div>
        </div>
      </div>

      {/* ── Three-Panel Body ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <div className="w-full lg:w-60 shrink-0 border-r border-border bg-[#0e0e0e] overflow-y-auto">
          <div className="p-4 flex flex-col gap-0">

            {/* Product */}
            <div className="pb-4 mb-4 border-b border-border/40">
              <Label className="text-[10px] uppercase tracking-widest text-primary mb-2 block">Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger data-testid="select-product"
                  className="bg-background/60 border-border/60 focus:border-primary h-8 text-sm">
                  <SelectValue placeholder="Choose product..." />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-border max-h-60">
                  {products?.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProductData && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {selectedProductData.category} · From PKR {selectedProductData.basePricePkr.toLocaleString()}
                </p>
              )}
            </div>

            {/* Color */}
            <div className="pb-4 mb-4 border-b border-border/40">
              <Label className="text-[10px] uppercase tracking-widest text-primary mb-2 block">Garment Color</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {GARMENT_COLORS.map(c => (
                  <button
                    key={c.value}
                    title={c.label}
                    onClick={() => setGarmentColor(c)}
                    className="relative group flex flex-col items-center gap-1"
                    data-testid={`color-swatch-${c.label.toLowerCase().replace(" ", "-")}`}
                  >
                    <span
                      className="w-9 h-9 block border-2 transition-all duration-150 relative"
                      style={{
                        backgroundColor: c.value,
                        borderColor: garmentColor.value === c.value ? "#C9A84C" : "transparent",
                        boxShadow: garmentColor.value === c.value ? "0 0 0 1px #C9A84C" : "0 0 0 1px rgba(255,255,255,0.1)",
                      }}
                    >
                      {garmentColor.value === c.value && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[#C9A84C] text-base leading-none" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>✓</span>
                        </span>
                      )}
                    </span>
                    <span className="text-[9px] text-muted-foreground leading-none truncate w-full text-center">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="pb-4 mb-4 border-b border-border/40">
              <Label className="text-[10px] uppercase tracking-widest text-primary mb-2 block">Size</Label>
              <div className="flex flex-wrap gap-1">
                {SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className="px-2 py-1 text-[11px] font-bold border transition-all duration-150"
                    style={{
                      borderColor: selectedSize === s ? "#C9A84C" : "rgba(255,255,255,0.12)",
                      backgroundColor: selectedSize === s ? "#C9A84C" : "transparent",
                      color: selectedSize === s ? "#0a0a0a" : "#888",
                    }}
                    data-testid={`size-${s}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Fabric */}
            <div className="pb-4 mb-4 border-b border-border/40">
              <Label className="text-[10px] uppercase tracking-widest text-primary mb-2 block">Fabric</Label>
              <Select value={selectedFabric} onValueChange={setSelectedFabric}>
                <SelectTrigger className="bg-background/60 border-border/60 focus:border-primary h-8 text-xs"
                  data-testid="select-fabric">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-border">
                  {FABRICS.map(f => <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* GSM */}
            <div className="pb-4 mb-4 border-b border-border/40">
              <Label className="text-[10px] uppercase tracking-widest text-primary mb-2 block">GSM Weight</Label>
              <Select value={selectedGsm} onValueChange={setSelectedGsm}>
                <SelectTrigger className="bg-background/60 border-border/60 focus:border-primary h-8 text-xs"
                  data-testid="select-gsm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-border">
                  {GSM.map(g => <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Brand Label Toggle */}
            <div className="flex items-center justify-between py-2">
              <Label className="text-[10px] uppercase tracking-widest text-primary cursor-pointer" htmlFor="brand-label-toggle">
                Add Brand Label
              </Label>
              <Switch
                id="brand-label-toggle"
                checked={brandLabel}
                onCheckedChange={setBrandLabel}
                data-testid="toggle-brand-label"
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </div>

        {/* ── CENTER PANEL (Canvas) ── */}
        <div
          ref={canvasContainerRef}
          className="flex-1 flex flex-col items-center justify-start bg-[#0a0a0a] p-4 overflow-y-auto"
        >
          {/* Angle tabs */}
          <div className="flex gap-1 mb-4 w-full justify-center flex-wrap">
            {ANGLES.map(angle => (
              <button
                key={angle}
                onClick={() => setActiveAngle(angle)}
                className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest border transition-all duration-150"
                style={{
                  borderColor: activeAngle === angle ? "#C9A84C" : "rgba(255,255,255,0.15)",
                  backgroundColor: activeAngle === angle ? "#C9A84C" : "transparent",
                  color: activeAngle === angle ? "#0a0a0a" : "#888",
                }}
                data-testid={`angle-${angle.toLowerCase().replace(" ", "-")}`}
              >
                {angle}
              </button>
            ))}
          </div>

          {/* Canvas frame */}
          <div
            className="relative transition-all duration-300"
            style={{
              width: canvasSize * zoom,
              height: canvasSize * zoom,
              maxWidth: "100%",
              border: "1px solid rgba(201,168,76,0.25)",
              boxShadow: "0 0 40px rgba(201,168,76,0.06)",
              backgroundColor: "#111",
            }}
            data-testid="canvas-preview"
          >
            {/* SVG garment */}
            <div className="absolute inset-0">
              <GarmentSVG angle={activeAngle} color={garmentColor.value} textColor={garmentColor.text} />
            </div>

            {/* AI generated / uploaded design overlay */}
            {activeDesignImage && (
              <div
                className="absolute pointer-events-none"
                style={{
                  top: printZone.top,
                  left: printZone.left,
                  width: printZone.width,
                  height: printZone.height,
                  mixBlendMode: "multiply",
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
                }}
              >
                <img
                  src={activeDesignImage}
                  alt="Design"
                  className="w-full h-full object-contain"
                  style={{ opacity: 0.9 }}
                />
              </div>
            )}

            {/* Custom text overlay */}
            {customText && (
              <div
                className="absolute pointer-events-none flex items-end justify-center"
                style={{ bottom: "18%", left: "10%", right: "10%", textAlign: "center" }}
              >
                <span
                  className="font-display text-2xl tracking-widest leading-none"
                  style={{
                    color: textColor,
                    textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                  }}
                >
                  {customText}
                </span>
              </div>
            )}

            {/* Generating overlay */}
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-primary font-display text-sm tracking-widest uppercase">Generating your design...</p>
                <p className="text-muted-foreground text-xs mt-1">This may take 10-20 seconds</p>
              </div>
            )}

            {/* Empty state */}
            {!activeDesignImage && !isGenerating && !customText && (
              <div className="absolute inset-0 flex items-end justify-center pb-6 pointer-events-none">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">
                  Generate or upload a design →
                </p>
              </div>
            )}

            {/* Angle badge */}
            <div className="absolute top-2 left-2">
              <span
                className="text-[9px] uppercase tracking-widest px-1.5 py-0.5"
                style={{ background: "rgba(0,0,0,0.6)", color: "rgba(201,168,76,0.7)" }}
              >
                {activeAngle}
              </span>
            </div>
          </div>

          {/* Hint */}
          <p className="text-[10px] text-muted-foreground/40 mt-2 uppercase tracking-widest">
            Design prints in the dashed zone above
          </p>

          {/* Zoom controls */}
          <div className="flex items-center gap-1.5 mt-3">
            <button
              onClick={() => setZoom(z => Math.max(0.4, +(z - 0.1).toFixed(1)))}
              className="p-1.5 border border-border/60 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(2, +(z + 0.1).toFixed(1)))}
              className="p-1.5 border border-border/60 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 border border-border/60 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              data-testid="button-reset-zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-full lg:w-80 shrink-0 border-l border-border bg-[#0e0e0e] overflow-y-auto">
          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="w-full rounded-none border-b border-border bg-card/50 h-10">
              <TabsTrigger value="ai"
                className="flex-1 rounded-none font-display tracking-wider uppercase text-[11px] data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
                data-testid="tab-ai">
                <Wand2 className="h-3 w-3 mr-1" /> AI
              </TabsTrigger>
              <TabsTrigger value="upload"
                className="flex-1 rounded-none font-display tracking-wider uppercase text-[11px] data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
                data-testid="tab-upload">
                <Upload className="h-3 w-3 mr-1" /> Upload
              </TabsTrigger>
              <TabsTrigger value="text"
                className="flex-1 rounded-none font-display tracking-wider uppercase text-[11px] data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
                data-testid="tab-text">
                <Type className="h-3 w-3 mr-1" /> Text
              </TabsTrigger>
            </TabsList>

            {/* AI Generate Tab */}
            <TabsContent value="ai" className="p-4 flex flex-col gap-4 m-0">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-[10px] uppercase tracking-widest text-primary">Describe Your Design</Label>
                  <span className={`text-[10px] ${prompt.length > MAX_PROMPT * 0.9 ? "text-red-400" : "text-muted-foreground"}`}>
                    {prompt.length}/{MAX_PROMPT}
                  </span>
                </div>
                <Textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value.slice(0, MAX_PROMPT))}
                  placeholder="e.g. A vintage eagle with lightning bolts, gothic lettering..."
                  className="resize-none min-h-[90px] text-sm bg-background/60 border-border/60 transition-all duration-150 focus:border-primary focus:[box-shadow:0_0_0_1px_#C9A84C]"
                  data-testid="textarea-prompt"
                />
              </div>

              <div>
                <Label className="text-[10px] uppercase tracking-widest text-primary mb-2 block">Style Modifiers</Label>
                <div className="flex flex-wrap gap-1.5">
                  {STYLE_TAGS.map(tag => (
                    <button
                      key={tag.label}
                      onClick={() => toggleStyle(tag.label)}
                      className="px-2.5 py-1 text-[11px] font-bold border transition-all duration-150 uppercase tracking-wider"
                      style={{
                        borderColor: selectedStyles.includes(tag.label) ? "#C9A84C" : "rgba(255,255,255,0.15)",
                        backgroundColor: selectedStyles.includes(tag.label) ? "#C9A84C" : "transparent",
                        color: selectedStyles.includes(tag.label) ? "#0a0a0a" : "#888",
                      }}
                      data-testid={`style-${tag.label.toLowerCase()}`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="w-full h-12 font-display text-base tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-150 relative overflow-hidden group"
                onClick={() => handleGenerate()}
                disabled={isGenerating || !prompt.trim()}
                data-testid="button-generate"
                style={{
                  backgroundColor: !prompt.trim() || isGenerating ? "#1a1a1a" : "#C9A84C",
                  color: !prompt.trim() || isGenerating ? "#444" : "#0a0a0a",
                  cursor: !prompt.trim() || isGenerating ? "not-allowed" : "pointer",
                  border: "1px solid",
                  borderColor: !prompt.trim() || isGenerating ? "rgba(255,255,255,0.08)" : "#C9A84C",
                }}
              >
                {/* Shimmer animation */}
                {prompt.trim() && !isGenerating && (
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }} />
                )}
                {isGenerating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Zap className="h-4 w-4" /> Generate Design</>
                )}
              </button>

              {isGenerating && (
                <div className="space-y-2" data-testid="skeleton-generating">
                  <Skeleton className="h-3 w-full rounded-none bg-muted/40" />
                  <Skeleton className="h-3 w-3/4 rounded-none bg-muted/40" />
                  <Skeleton className="h-28 w-full rounded-none bg-muted/40" />
                </div>
              )}

              {generationError && !isGenerating && (
                <div className="border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-400">
                  Generation failed. Check your connection and try again.
                </div>
              )}

              {generatedImageUrl && !isGenerating && (
                <div className="border border-primary/30 bg-primary/5 p-3">
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-2">Generated Design</p>
                  <img
                    src={generatedImageUrl}
                    alt="Generated design"
                    className="w-full aspect-square object-cover border border-border/30"
                  />
                  <button
                    onClick={handleRegenerate}
                    className="mt-2.5 w-full py-2 border border-primary text-primary text-[11px] font-bold uppercase tracking-wider hover:bg-primary/10 transition-colors"
                    data-testid="button-regenerate"
                  >
                    Regenerate with Variation
                  </button>
                </div>
              )}

              <div className="text-[10px] text-muted-foreground/50 border border-border/30 p-2">
                Powered by Pollinations AI — free, no account required.
              </div>
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="p-4 flex flex-col gap-4 m-0">
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-primary mb-2 block">Upload Logo / Artwork</Label>
                <label
                  className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 hover:border-primary p-8 text-center cursor-pointer bg-muted/10 transition-colors duration-150"
                  data-testid="dropzone-upload"
                >
                  <Upload className="h-7 w-7 mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">PNG, JPG, SVG, PDF</p>
                  <input
                    type="file"
                    accept="image/*,.pdf,.ai,.svg"
                    className="hidden"
                    onChange={handleUpload}
                    data-testid="input-file"
                  />
                </label>
                {uploadedImage && (
                  <div className="mt-3 border border-primary/30 p-2">
                    <img src={uploadedImage} alt="Uploaded" className="w-full object-contain max-h-32" />
                    <button
                      className="mt-2 w-full text-[11px] text-red-400 hover:text-red-300 uppercase tracking-wider font-bold"
                      onClick={() => setUploadedImage(null)}
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground/60 mt-2">Your artwork will be placed in the print zone on the canvas.</p>
              </div>
            </TabsContent>

            {/* Text Tab */}
            <TabsContent value="text" className="p-4 flex flex-col gap-4 m-0">
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-primary mb-1.5 block">Custom Text</Label>
                <Input
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  placeholder="YOUR BRAND NAME"
                  className="bg-background/60 border-border/60 font-display tracking-widest focus:border-primary"
                  data-testid="input-custom-text"
                />
              </div>

              <div>
                <Label className="text-[10px] uppercase tracking-widest text-primary mb-2 block">Text Color</Label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={textColor}
                    onChange={e => setTextColor(e.target.value)}
                    className="w-9 h-9 border border-border cursor-pointer bg-background"
                    data-testid="input-text-color"
                  />
                  <Input
                    value={textColor}
                    onChange={e => setTextColor(e.target.value)}
                    className="bg-background/60 border-border/60 font-mono text-sm w-24 focus:border-primary"
                    data-testid="input-text-color-hex"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[10px] uppercase tracking-widest text-primary mb-1.5 block">Font</Label>
                <Select defaultValue="bebas">
                  <SelectTrigger className="bg-background/60 border-border/60 h-8 text-sm focus:border-primary" data-testid="select-font">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-border">
                    <SelectItem value="bebas">Bebas Neue</SelectItem>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="mono">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border border-primary/20 bg-primary/5 p-3">
                <p className="text-[11px] text-muted-foreground mb-1">Preview:</p>
                <p className="font-display text-2xl tracking-widest truncate" style={{ color: textColor }}>
                  {customText || "YOUR TEXT"}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}
