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
import { useListProducts, useCreateDesign } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import {
  Wand2, Upload, Type, ZoomIn, ZoomOut, RotateCcw, Save,
  ShoppingCart, Loader2, Zap, CheckCircle, MoveIcon, X
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const STYLE_TAGS = [
  { label: "Vintage",    prompt: "vintage style, worn look, aged" },
  { label: "Minimalist", prompt: "minimalist, clean lines, simple" },
  { label: "Bold",       prompt: "bold, high contrast, striking" },
  { label: "Streetwear", prompt: "streetwear aesthetic, urban, graffiti" },
  { label: "Luxury",     prompt: "luxury, premium, gold accents, ornate" },
  { label: "Grunge",     prompt: "grunge aesthetic, distressed texture, dark" },
];

const GARMENT_COLORS = [
  { label: "Black",       value: "#0a0a0a",  text: "#ffffff", isDark: true  },
  { label: "White",       value: "#f5f5f0",  text: "#1a1a1a", isDark: false },
  { label: "Charcoal",    value: "#3a3a3a",  text: "#ffffff", isDark: true  },
  { label: "Navy",        value: "#1a2744",  text: "#ffffff", isDark: true  },
  { label: "Burgundy",    value: "#6b1c2e",  text: "#ffffff", isDark: true  },
  { label: "Olive",       value: "#4a4a1a",  text: "#ffffff", isDark: true  },
  { label: "Royal Blue",  value: "#1a4a9a",  text: "#ffffff", isDark: true  },
  { label: "Red",         value: "#c01a1a",  text: "#ffffff", isDark: true  },
];

const SIZES   = ["XS","S","M","L","XL","2XL","3XL"];
const FABRICS = ["100% Cotton","Polyester Blend","Cotton-Poly Mix"];
const GSM     = ["160gsm","180gsm","220gsm","280gsm"];
const ANGLES  = ["Front","Back","Left Sleeve","Right Sleeve"];
const MAX_PROMPT = 300;

// ─── Print zone defaults per angle ────────────────────────────────────────────

const PRINT_ZONES: Record<string, { top: number; left: number; size: number }> = {
  "Front":        { top: 30,  left: 31.5, size: 37 },
  "Back":         { top: 27,  left: 31.5, size: 37 },
  "Left Sleeve":  { top: 28,  left: 30,   size: 37 },
  "Right Sleeve": { top: 28,  left: 30,   size: 37 },
};

// ─── Garment SVG Mockup ───────────────────────────────────────────────────────

function GarmentSVG({ angle, color }: { angle: string; color: string }) {
  if (angle === "Front" || angle === "Back") {
    return (
      <svg viewBox="0 0 300 360" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="rgba(0,0,0,0.5)" />
          </filter>
          <linearGradient id="fabricSheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
          </linearGradient>
        </defs>
        <path
          d="M60 40 L0 100 L40 120 L40 330 L260 330 L260 120 L300 100 L240 40 C220 55 190 65 150 65 C110 65 80 55 60 40 Z"
          fill={color}
          filter="url(#shadow)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        <path
          d="M60 40 L0 100 L40 120 L40 330 L260 330 L260 120 L300 100 L240 40 C220 55 190 65 150 65 C110 65 80 55 60 40 Z"
          fill="url(#fabricSheen)"
        />
        <path d="M108 38 Q150 80 192 38" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <path d="M40 180 L260 180" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <path d="M40 220 L260 220" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <path d="M40 260 L260 260" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <line x1="40"  y1="120" x2="40"  y2="330" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 6" />
        <line x1="260" y1="120" x2="260" y2="330" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 6" />
        <rect x="95" y="110" width="110" height="120" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="4 4" rx="2" />
        <text x="150" y="352" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="sans-serif">{angle.toUpperCase()} VIEW</text>
      </svg>
    );
  }
  const flip = angle === "Right Sleeve";
  return (
    <svg viewBox="0 0 300 360" className="w-full h-full" xmlns="http://www.w3.org/2000/svg"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <defs>
        <filter id="shadow2" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="rgba(0,0,0,0.5)" />
        </filter>
      </defs>
      <path d="M40 60 L250 20 L280 140 L260 280 L40 300 Z" fill={color} filter="url(#shadow2)"
        stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <line x1="40" y1="60" x2="40" y2="300" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 6" />
      <rect x="90" y="100" width="110" height="110" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="4 4" rx="2" />
      <text x="150" y="352" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="sans-serif">{angle.toUpperCase()}</text>
    </svg>
  );
}

// ─── Draggable Design Overlay ─────────────────────────────────────────────────

interface DesignPos {
  top: number;   // percent
  left: number;  // percent
  size: number;  // percent (width = height)
}

interface DraggableDesignProps {
  imageUrl: string;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  pos: DesignPos;
  onPosChange: (p: DesignPos) => void;
  isLocked: boolean;
}

function DraggableDesign({ imageUrl, canvasRef, pos, onPosChange, isLocked }: DraggableDesignProps) {
  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, top: 0, left: 0 });

  const startDrag = useCallback((e: React.PointerEvent) => {
    if (isLocked) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, top: pos.top, left: pos.left };
  }, [pos, isLocked]);

  const onDrag = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || isLocked) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.mx) / rect.width)  * 100;
    const dy = ((e.clientY - dragStart.current.my) / rect.height) * 100;
    onPosChange({
      ...pos,
      top:  Math.max(0, Math.min(100 - pos.size, dragStart.current.top  + dy)),
      left: Math.max(0, Math.min(100 - pos.size, dragStart.current.left + dx)),
    });
  }, [pos, canvasRef, onPosChange, isLocked]);

  const endDrag = useCallback(() => { dragging.current = false; }, []);

  // Wheel to resize
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (isLocked) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -2 : 2;
    onPosChange({ ...pos, size: Math.max(10, Math.min(80, pos.size + delta)) });
  }, [pos, onPosChange, isLocked]);

  return (
    <div
      onPointerDown={startDrag}
      onPointerMove={onDrag}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onWheel={onWheel}
      data-testid="design-overlay"
      className={`absolute group ${isLocked ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
      style={{
        top:    `${pos.top}%`,
        left:   `${pos.left}%`,
        width:  `${pos.size}%`,
        height: `${pos.size}%`,
        userSelect: "none",
        touchAction: "none",
        zIndex: 10,
      }}
    >
      <img
        src={imageUrl}
        alt="Design on canvas"
        crossOrigin="anonymous"
        draggable={false}
        className="w-full h-full object-contain select-none"
        style={{
          filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.7))",
          pointerEvents: "none",
        }}
      />
      {!isLocked && (
        <div className="absolute inset-0 border-2 border-primary/60 border-dashed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
      {!isLocked && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/80 px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          <MoveIcon className="h-2.5 w-2.5 text-primary" />
          <span className="text-[9px] text-primary uppercase tracking-widest">Drag to move · Scroll to resize</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Studio Component ────────────────────────────────────────────────────

export default function Studio() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);

  const { data: products } = useListProducts({ limit: 200 }, { query: { queryKey: ["listProducts"] } });
  const createDesign = useCreateDesign();

  // State
  const [selectedProduct, setSelectedProduct]     = useState<string>("");
  const [garmentColor, setGarmentColor]            = useState(GARMENT_COLORS[0]);
  const [selectedSize, setSelectedSize]            = useState("L");
  const [selectedFabric, setSelectedFabric]        = useState("100% Cotton");
  const [selectedGsm, setSelectedGsm]              = useState("220gsm");
  const [brandLabel, setBrandLabel]                = useState(false);
  const [activeAngle, setActiveAngle]              = useState("Front");
  const [zoom, setZoom]                            = useState(1);
  const [prompt, setPrompt]                        = useState("");
  const [selectedStyles, setSelectedStyles]        = useState<string[]>([]);
  const [isGenerating, setIsGenerating]            = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl]  = useState<string | null>(null);
  const [generationError, setGenerationError]      = useState(false);
  const [seed, setSeed]                            = useState(() => Math.floor(Math.random() * 99999));
  const [customText, setCustomText]                = useState("");
  const [textColor, setTextColor]                  = useState("#C9A84C");
  const [uploadedImage, setUploadedImage]          = useState<string | null>(null);
  const [designName, setDesignName]                = useState("My Design");
  const [isSaving, setIsSaving]                    = useState(false);
  const [isAccepted, setIsAccepted]                = useState(false);

  // Per-angle design positions (persisted across angle switches)
  const [positions, setPositions] = useState<Record<string, DesignPos>>({});

  const getPos = (angle: string): DesignPos => positions[angle] ?? { ...PRINT_ZONES[angle] };
  const setPos = (angle: string, p: DesignPos) => setPositions(prev => ({ ...prev, [angle]: p }));

  // Reset positions when design changes
  const resetPositions = () => setPositions({});

  const toggleStyle = (label: string) => {
    setSelectedStyles(prev => prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]);
  };

  const buildPrompt = () => {
    const styleParts = STYLE_TAGS.filter(t => selectedStyles.includes(t.label)).map(t => t.prompt).join(", ");
    return [
      prompt.trim(),
      styleParts,
      "apparel graphic design, t-shirt print, high quality vector art, white background, centered, print-ready",
    ].filter(Boolean).join(", ");
  };

  const handleGenerate = async (overrideSeed?: number) => {
    if (!prompt.trim()) return;
    const useSeed = overrideSeed ?? seed;
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setGenerationError(false);
    setIsAccepted(false);
    resetPositions();

    const fullPrompt = buildPrompt();
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=1024&nologo=true&seed=${useSeed}&model=flux`;

    try {
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
        setTimeout(() => reject(new Error("Timeout")), 35000);
      });
      setGeneratedImageUrl(url);
      toast({ title: "Design ready!", description: "Drag to reposition on the canvas." });
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
      setGeneratedImageUrl(null);
      setIsAccepted(false);
      resetPositions();
      toast({ title: "Logo uploaded!", description: "Drag to reposition on the canvas." });
    };
    reader.readAsDataURL(file);
  };

  const handleAccept = () => {
    setIsAccepted(true);
    toast({ title: "Design applied! ✓", description: "Ready to add to quote." });
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
      toast({ title: "Design saved!", description: "Find it in your account." });
    } catch {
      toast({ title: "Save failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToQuote = () => {
    sessionStorage.setItem("quoteProduct", JSON.stringify({
      productId: selectedProduct,
      garmentColor: garmentColor.label,
      size: selectedSize,
      fabric: selectedFabric,
      gsm: selectedGsm,
      designImageUrl: activeDesignImage,
    }));
    setLocation("/quote");
    toast({ title: "Design added to quote!" });
  };

  const selectedProductData = products?.find(p => p.id.toString() === selectedProduct);
  const activeDesignImage = generatedImageUrl || uploadedImage;
  const currentPos = getPos(activeAngle);

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 64px)" }}>

      {/* ── Studio Header ── */}
      <div className="shrink-0 border-b border-border bg-card/60 backdrop-blur px-4 py-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="font-display text-xl tracking-widest uppercase text-white">AI Design Studio</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              value={designName}
              onChange={e => setDesignName(e.target.value)}
              className="w-36 h-8 bg-background border-border text-sm"
              placeholder="Design name..."
              data-testid="input-design-name"
            />
            <Button variant="outline" size="sm"
              className="border-primary text-primary hover:bg-primary/10 font-display tracking-wider uppercase h-8"
              onClick={handleSave} disabled={isSaving} data-testid="button-save-design">
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Save className="h-3 w-3 mr-1.5" />}
              Save
            </Button>
            <Button size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider uppercase h-8"
              onClick={handleAddToQuote} disabled={!activeDesignImage}
              data-testid="button-add-to-quote">
              <ShoppingCart className="h-3 w-3 mr-1.5" /> Add to Quote
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
                <SelectTrigger data-testid="select-product" className="bg-background/60 border-border/60 focus:border-primary h-8 text-sm">
                  <SelectValue placeholder="Choose product..." />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-border max-h-60">
                  {products?.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()} className="text-xs">{p.name}</SelectItem>
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
                  <button key={c.value} title={c.label} onClick={() => setGarmentColor(c)}
                    className="relative flex flex-col items-center gap-1"
                    data-testid={`color-swatch-${c.label.toLowerCase().replace(" ", "-")}`}>
                    <span className="w-9 h-9 block border-2 transition-all relative"
                      style={{
                        backgroundColor: c.value,
                        borderColor: garmentColor.value === c.value ? "#C9A84C" : "transparent",
                        boxShadow: garmentColor.value === c.value ? "0 0 0 1px #C9A84C" : "0 0 0 1px rgba(255,255,255,0.1)",
                      }}>
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
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className="px-2 py-1 text-[11px] font-bold border transition-all"
                    style={{
                      borderColor: selectedSize === s ? "#C9A84C" : "rgba(255,255,255,0.12)",
                      backgroundColor: selectedSize === s ? "#C9A84C" : "transparent",
                      color: selectedSize === s ? "#0a0a0a" : "#888",
                    }}
                    data-testid={`size-${s}`}>{s}</button>
                ))}
              </div>
            </div>

            {/* Fabric */}
            <div className="pb-4 mb-4 border-b border-border/40">
              <Label className="text-[10px] uppercase tracking-widest text-primary mb-2 block">Fabric</Label>
              <Select value={selectedFabric} onValueChange={setSelectedFabric}>
                <SelectTrigger className="bg-background/60 border-border/60 focus:border-primary h-8 text-xs" data-testid="select-fabric">
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
                <SelectTrigger className="bg-background/60 border-border/60 focus:border-primary h-8 text-xs" data-testid="select-gsm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-border">
                  {GSM.map(g => <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Brand Label */}
            <div className="flex items-center justify-between py-2">
              <Label className="text-[10px] uppercase tracking-widest text-primary cursor-pointer" htmlFor="brand-label-toggle">
                Add Brand Label
              </Label>
              <Switch id="brand-label-toggle" checked={brandLabel} onCheckedChange={setBrandLabel}
                data-testid="toggle-brand-label" className="data-[state=checked]:bg-primary" />
            </div>
          </div>
        </div>

        {/* ── CENTER PANEL (Canvas) ── */}
        <div className="flex-1 flex flex-col items-center justify-start bg-[#0a0a0a] p-4 overflow-y-auto">

          {/* Angle tabs */}
          <div className="flex gap-1 mb-4 w-full justify-center flex-wrap">
            {ANGLES.map(angle => (
              <button key={angle} onClick={() => setActiveAngle(angle)}
                className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest border transition-all"
                style={{
                  borderColor: activeAngle === angle ? "#C9A84C" : "rgba(255,255,255,0.15)",
                  backgroundColor: activeAngle === angle ? "#C9A84C" : "transparent",
                  color: activeAngle === angle ? "#0a0a0a" : "#888",
                }}
                data-testid={`angle-${angle.toLowerCase().replace(" ", "-")}`}>
                {angle}
              </button>
            ))}
          </div>

          {/* Canvas frame */}
          <div
            ref={canvasRef}
            className="relative transition-all duration-300 select-none"
            style={{
              width: Math.min(360, (canvasRef.current?.parentElement?.clientWidth ?? 400) - 32) * zoom,
              height: Math.min(360, (canvasRef.current?.parentElement?.clientWidth ?? 400) - 32) * zoom,
              maxWidth: "100%",
              border: "1px solid rgba(201,168,76,0.25)",
              boxShadow: "0 0 40px rgba(201,168,76,0.06)",
              backgroundColor: "#111",
              overflow: "hidden",
            }}
            data-testid="canvas-preview"
          >
            {/* SVG garment — always background */}
            <div className="absolute inset-0">
              <GarmentSVG angle={activeAngle} color={garmentColor.value} />
            </div>

            {/* ── DESIGN OVERLAY (draggable, on top of garment) ── */}
            {activeDesignImage && (
              <DraggableDesign
                imageUrl={activeDesignImage}
                canvasRef={canvasRef}
                pos={currentPos}
                onPosChange={p => setPos(activeAngle, p)}
                isLocked={isAccepted}
              />
            )}

            {/* Custom text overlay */}
            {customText && (
              <div className="absolute pointer-events-none flex items-end justify-center z-20"
                style={{ bottom: "18%", left: "10%", right: "10%", textAlign: "center" }}>
                <span className="font-display text-2xl tracking-widest leading-none"
                  style={{ color: textColor, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
                  {customText}
                </span>
              </div>
            )}

            {/* Generating overlay */}
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-30">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-primary font-display text-sm tracking-widest uppercase">Generating your design...</p>
                <p className="text-muted-foreground text-xs mt-1">10–20 seconds — please wait</p>
              </div>
            )}

            {/* Empty state hint */}
            {!activeDesignImage && !isGenerating && !customText && (
              <div className="absolute inset-0 flex items-end justify-center pb-5 pointer-events-none">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 text-center px-4">
                  Generate a design or upload your logo to see it on your garment
                </p>
              </div>
            )}

            {/* Drag hint (shown when design is placed but not accepted) */}
            {activeDesignImage && !isAccepted && !isGenerating && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none z-20">
                <span className="bg-black/70 text-primary/80 text-[9px] uppercase tracking-widest px-2 py-0.5">
                  Drag to reposition · Scroll to resize · Switch views above
                </span>
              </div>
            )}

            {/* Accepted badge */}
            {isAccepted && (
              <div className="absolute top-2 right-2 z-20 bg-primary/90 px-2 py-0.5 flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-black" />
                <span className="text-[9px] text-black font-bold uppercase tracking-widest">Locked</span>
              </div>
            )}

            {/* Angle badge */}
            <div className="absolute top-2 left-2 z-20">
              <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5"
                style={{ background: "rgba(0,0,0,0.6)", color: "rgba(201,168,76,0.7)" }}>
                {activeAngle}
              </span>
            </div>
          </div>

          {/* Hint below canvas */}
          <p className="text-[10px] text-muted-foreground/40 mt-2 uppercase tracking-widest text-center">
            {activeDesignImage && !isAccepted
              ? "Drag to reposition · Scroll to resize · Switch views above"
              : activeDesignImage && isAccepted
              ? "Design locked — click Accept to unlock"
              : "Design prints in the dashed zone above"}
          </p>

          {/* Accept + Zoom controls */}
          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            {activeDesignImage && !isAccepted && (
              <button
                onClick={handleAccept}
                className="h-8 px-4 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
                data-testid="button-accept-design"
              >
                <CheckCircle className="h-3.5 w-3.5" /> Accept Design
              </button>
            )}
            {isAccepted && (
              <button
                onClick={() => setIsAccepted(false)}
                className="h-8 px-4 border border-border/60 text-muted-foreground text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:border-primary hover:text-primary transition-colors"
              >
                <MoveIcon className="h-3.5 w-3.5" /> Unlock to Edit
              </button>
            )}
            <button onClick={() => setZoom(z => Math.max(0.4, +(z - 0.1).toFixed(1)))}
              className="p-1.5 border border-border/60 text-muted-foreground hover:text-primary hover:border-primary transition-colors" data-testid="button-zoom-out">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, +(z + 0.1).toFixed(1)))}
              className="p-1.5 border border-border/60 text-muted-foreground hover:text-primary hover:border-primary transition-colors" data-testid="button-zoom-in">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setZoom(1)}
              className="p-1.5 border border-border/60 text-muted-foreground hover:text-primary hover:border-primary transition-colors" data-testid="button-reset-zoom">
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

            {/* ── AI Tab ── */}
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
                  placeholder="e.g. A vintage eagle with lightning bolts, gothic lettering, gold and white..."
                  className="resize-none min-h-[90px] text-sm bg-background/60 border-border/60 focus:border-primary"
                  data-testid="textarea-prompt"
                />
              </div>

              <div>
                <Label className="text-[10px] uppercase tracking-widest text-primary mb-2 block">Style Modifiers</Label>
                <div className="flex flex-wrap gap-1.5">
                  {STYLE_TAGS.map(tag => (
                    <button key={tag.label} onClick={() => toggleStyle(tag.label)}
                      className="px-2.5 py-1 text-[11px] font-bold border transition-all uppercase tracking-wider"
                      style={{
                        borderColor: selectedStyles.includes(tag.label) ? "#C9A84C" : "rgba(255,255,255,0.15)",
                        backgroundColor: selectedStyles.includes(tag.label) ? "#C9A84C" : "transparent",
                        color: selectedStyles.includes(tag.label) ? "#0a0a0a" : "#888",
                      }}
                      data-testid={`style-${tag.label.toLowerCase()}`}>
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button
                className="w-full h-12 font-display text-base tracking-widest uppercase flex items-center justify-center gap-2 transition-all relative overflow-hidden group"
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
                {prompt.trim() && !isGenerating && (
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }} />
                )}
                {isGenerating
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                  : <><Zap className="h-4 w-4" /> Generate Design</>
                }
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

              {/* Generated design preview */}
              {generatedImageUrl && !isGenerating && (
                <div className="border border-primary/30 bg-primary/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Generated Design</p>
                    {activeDesignImage === generatedImageUrl && (
                      <div className="flex items-center gap-1 text-[9px] text-green-400 uppercase tracking-widest">
                        <CheckCircle className="h-3 w-3" />
                        <span>Applied to canvas</span>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <img
                      src={generatedImageUrl}
                      alt="Generated design"
                      className="w-full aspect-square object-cover border border-border/30"
                      style={{ background: "#fff" }}
                    />
                    {/* Checkerboard bg hint that it's on white */}
                    <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5">
                      <span className="text-[8px] text-muted-foreground uppercase tracking-widest">White bg preview</span>
                    </div>
                  </div>
                  <button
                    onClick={handleRegenerate}
                    className="mt-2.5 w-full py-2 border border-primary text-primary text-[11px] font-bold uppercase tracking-wider hover:bg-primary/10 transition-colors"
                    data-testid="button-regenerate"
                  >
                    Regenerate with Variation
                  </button>
                  <button
                    onClick={() => { setGeneratedImageUrl(null); setIsAccepted(false); resetPositions(); }}
                    className="mt-1.5 w-full py-1.5 border border-border/40 text-muted-foreground text-[11px] uppercase tracking-wider hover:border-red-500/50 hover:text-red-400 transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="h-3 w-3" /> Remove
                  </button>
                </div>
              )}

              <div className="text-[10px] text-muted-foreground/50 border border-border/30 p-2">
                Powered by Pollinations AI — free, no account required.
              </div>
            </TabsContent>

            {/* ── Upload Tab ── */}
            <TabsContent value="upload" className="p-4 flex flex-col gap-4 m-0">
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-primary mb-2 block">Upload Logo / Artwork</Label>
                <label
                  className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 hover:border-primary p-8 text-center cursor-pointer bg-muted/10 transition-colors"
                  data-testid="dropzone-upload"
                >
                  <Upload className="h-7 w-7 mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">PNG, JPG, SVG</p>
                  <input type="file" accept="image/*,.svg" className="hidden" onChange={handleUpload} data-testid="input-file" />
                </label>

                {uploadedImage && (
                  <div className="mt-3 border border-primary/30 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Uploaded Logo</p>
                      {activeDesignImage === uploadedImage && (
                        <div className="flex items-center gap-1 text-[9px] text-green-400 uppercase tracking-widest">
                          <CheckCircle className="h-3 w-3" />
                          <span>Applied to canvas</span>
                        </div>
                      )}
                    </div>
                    <img src={uploadedImage} alt="Uploaded" className="w-full object-contain max-h-32 bg-white/10" />
                    <button
                      className="mt-2 w-full text-[11px] text-red-400 hover:text-red-300 uppercase tracking-wider font-bold py-1.5 border border-red-500/20 hover:border-red-500/40 transition-colors flex items-center justify-center gap-1"
                      onClick={() => { setUploadedImage(null); setIsAccepted(false); resetPositions(); }}
                    >
                      <X className="h-3 w-3" /> Remove
                    </button>
                  </div>
                )}

                <div className="mt-3 border border-border/20 bg-card/20 p-3">
                  <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest mb-1">Tips for best results:</p>
                  <ul className="text-[10px] text-muted-foreground/60 space-y-1">
                    <li>• PNG with transparent background works best</li>
                    <li>• Upload at 300 DPI or higher for print quality</li>
                    <li>• Drag to reposition on the canvas after upload</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* ── Text Tab ── */}
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
                  <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                    className="w-9 h-9 border border-border cursor-pointer bg-background" data-testid="input-text-color" />
                  <Input value={textColor} onChange={e => setTextColor(e.target.value)}
                    className="bg-background/60 border-border/60 font-mono text-sm w-24 focus:border-primary" data-testid="input-text-color-hex" />
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
              {customText && (
                <button
                  onClick={() => setCustomText("")}
                  className="w-full py-1.5 border border-border/40 text-muted-foreground text-[11px] uppercase tracking-wider hover:border-red-500/50 hover:text-red-400 transition-colors flex items-center justify-center gap-1"
                >
                  <X className="h-3 w-3" /> Clear Text
                </button>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
