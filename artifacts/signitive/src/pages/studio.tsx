import { useState, useRef, useCallback, useEffect } from "react";
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
import { ScanLine } from "@/components/ui/ScanLine";
import {
  Wand2, Upload, Type, ZoomIn, ZoomOut, RotateCcw, Save,
  ShoppingCart, Loader2, Zap, CheckCircle, MoveIcon, X,
  KeyRound, History, RefreshCw, ChevronRight,
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
  { label: "Black",      value: "#0a0a0a",  isDark: true  },
  { label: "White",      value: "#f5f5f0",  isDark: false },
  { label: "Charcoal",   value: "#3a3a3a",  isDark: true  },
  { label: "Navy",       value: "#1a2744",  isDark: true  },
  { label: "Burgundy",   value: "#6b1c2e",  isDark: true  },
  { label: "Olive",      value: "#4a4a1a",  isDark: true  },
  { label: "Royal Blue", value: "#1a4a9a",  isDark: true  },
  { label: "Red",        value: "#c01a1a",  isDark: true  },
];

const SIZES   = ["XS","S","M","L","XL","2XL","3XL"];
const FABRICS = ["100% Cotton","Polyester Blend","Cotton-Poly Mix"];
const GSM     = ["160gsm","180gsm","220gsm","280gsm"];
const ANGLES  = ["Front","Back","Left Sleeve","Right Sleeve"];
const MAX_PROMPT = 300;

const PRINT_ZONES: Record<string, { top: number; left: number; size: number }> = {
  "Front":        { top: 30,  left: 31.5, size: 37 },
  "Back":         { top: 27,  left: 31.5, size: 37 },
  "Left Sleeve":  { top: 28,  left: 30,   size: 37 },
  "Right Sleeve": { top: 28,  left: 30,   size: 37 },
};

const GENERATING_MESSAGES = [
  "Analyzing your prompt...",
  "Generating design...",
  "Placing on garment...",
  "Finalizing your creation...",
];

const GARMENT_TYPE_MAP: Record<string, string> = {
  "Streetwear":      "t-shirt",
  "Fitness Wear":    "athletic t-shirt",
  "Sports Uniforms": "sports jersey",
  "Boxing":          "boxing shorts",
  "Motocross":       "motocross jersey",
  "Caps":            "baseball cap",
  "Team Wear":       "team jersey",
  "Sports Goods":    "t-shirt",
};

// ─── Design history item ──────────────────────────────────────────────────────

interface HistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
}

// ─── Garment SVG ─────────────────────────────────────────────────────────────

function GarmentSVG({ angle, color }: { angle: string; color: string }) {
  if (angle === "Front" || angle === "Back") {
    return (
      <svg viewBox="0 0 300 360" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="rgba(0,0,0,0.5)" />
          </filter>
          <linearGradient id="sheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
          </linearGradient>
        </defs>
        <path d="M60 40 L0 100 L40 120 L40 330 L260 330 L260 120 L300 100 L240 40 C220 55 190 65 150 65 C110 65 80 55 60 40 Z"
          fill={color} filter="url(#shadow)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d="M60 40 L0 100 L40 120 L40 330 L260 330 L260 120 L300 100 L240 40 C220 55 190 65 150 65 C110 65 80 55 60 40 Z"
          fill="url(#sheen)" />
        <path d="M108 38 Q150 80 192 38" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        {[180,220,260].map(y => <path key={y} d={`M40 ${y} L260 ${y}`} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />)}
        <line x1="40" y1="120" x2="40" y2="330" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 6" />
        <line x1="260" y1="120" x2="260" y2="330" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 6" />
        <rect x="95" y="110" width="110" height="120" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="1" strokeDasharray="4 4" rx="2" />
        <text x="150" y="352" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="sans-serif">{angle.toUpperCase()} VIEW</text>
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
      <rect x="90" y="100" width="110" height="110" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="1" strokeDasharray="4 4" rx="2" />
      <text x="150" y="352" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="sans-serif">{angle.toUpperCase()}</text>
    </svg>
  );
}

// ─── Draggable Design Overlay ─────────────────────────────────────────────────

interface DesignPos { top: number; left: number; size: number; }

function DraggableDesign({
  imageUrl, canvasRef, pos, onPosChange, isLocked,
}: {
  imageUrl: string;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  pos: DesignPos;
  onPosChange: (p: DesignPos) => void;
  isLocked: boolean;
}) {
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
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = ((e.clientX - dragStart.current.mx) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.my) / rect.height) * 100;
    onPosChange({
      ...pos,
      top:  Math.max(0, Math.min(100 - pos.size, dragStart.current.top + dy)),
      left: Math.max(0, Math.min(100 - pos.size, dragStart.current.left + dx)),
    });
  }, [pos, canvasRef, onPosChange, isLocked]);

  const endDrag = useCallback(() => { dragging.current = false; }, []);

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
      style={{ top: `${pos.top}%`, left: `${pos.left}%`, width: `${pos.size}%`, height: `${pos.size}%`, userSelect: "none", touchAction: "none", zIndex: 10 }}
    >
      <img
        src={imageUrl}
        alt="Design"
        crossOrigin="anonymous"
        draggable={false}
        className="w-full h-full object-contain select-none"
        style={{ filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.7))", pointerEvents: "none" }}
      />
      {!isLocked && (
        <div className="absolute inset-0 border-2 border-dashed border-[#a78bfa]/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
      {!isLocked && (
        <div
          className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
          style={{ background: "rgba(0,0,0,0.85)" }}
        >
          <MoveIcon className="h-2.5 w-2.5 text-[#C9A84C]" />
          <span className="text-[9px] text-[#C9A84C] uppercase tracking-widest">Drag · Scroll to resize</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Studio ──────────────────────────────────────────────────────────────

export default function Studio() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);

  const { data: products } = useListProducts({ limit: 200 }, { query: { queryKey: ["listProducts"] } });
  const createDesign = useCreateDesign();

  // Core state
  const [selectedProduct, setSelectedProduct]     = useState<string>("");
  const [garmentColor, setGarmentColor]            = useState(GARMENT_COLORS[0]);
  const [selectedSize, setSelectedSize]            = useState("L");
  const [selectedFabric, setSelectedFabric]        = useState("100% Cotton");
  const [selectedGsm, setSelectedGsm]              = useState("220gsm");
  const [brandLabel, setBrandLabel]                = useState(false);
  const [activeAngle, setActiveAngle]              = useState("Front");
  const [zoom, setZoom]                            = useState(1);

  // AI generation
  const [prompt, setPrompt]                        = useState("");
  const [selectedStyles, setSelectedStyles]        = useState<string[]>([]);
  const [isGenerating, setIsGenerating]            = useState(false);
  const [genMessageIdx, setGenMessageIdx]          = useState(0);
  const [generatedImageUrl, setGeneratedImageUrl]  = useState<string | null>(null);
  const [generationError, setGenerationError]      = useState("");
  const [refinePrompt, setRefinePrompt]            = useState("");

  // Upload
  const [uploadedImage, setUploadedImage]          = useState<string | null>(null);

  // Text overlay
  const [customText, setCustomText]                = useState("");
  const [textColor, setTextColor]                  = useState("#C9A84C");

  // Design state
  const [isAccepted, setIsAccepted]                = useState(false);
  const [positions, setPositions]                  = useState<Record<string, DesignPos>>({});
  const [designHistory, setDesignHistory]          = useState<HistoryItem[]>([]);

  // Save
  const [designName, setDesignName]                = useState("My Design");
  const [isSaving, setIsSaving]                    = useState(false);

  // Gemini API key (localStorage fallback)
  const [geminiKey, setGeminiKey]                  = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [keyInput, setKeyInput]                    = useState("");
  const [showKeyInput, setShowKeyInput]            = useState(false);

  // Cycling loading messages
  useEffect(() => {
    if (!isGenerating) { setGenMessageIdx(0); return; }
    const interval = setInterval(() => {
      setGenMessageIdx(i => (i + 1) % GENERATING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const getPos  = (angle: string): DesignPos => positions[angle] ?? { ...PRINT_ZONES[angle] };
  const setPos  = (angle: string, p: DesignPos) => setPositions(prev => ({ ...prev, [angle]: p }));
  const resetPos = () => setPositions({});

  const toggleStyle = (label: string) => {
    setSelectedStyles(prev => prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]);
  };

  const selectedProductData = products?.find(p => p.id.toString() === selectedProduct);
  const garmentType = selectedProductData ? (GARMENT_TYPE_MAP[selectedProductData.category] || "t-shirt") : "t-shirt";

  // ── Generate via Gemini API (with Pollinations.ai fallback) ──
  const doGenerate = async (finalPrompt: string, usePollinations = false) => {
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setGenerationError("");
    setIsAccepted(false);
    resetPos();

    try {
      // Try Gemini first
      if (!usePollinations) {
        const res = await fetch("/api/generate-design", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(geminiKey ? { "x-gemini-key": geminiKey } : {}),
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            styleModifiers: selectedStyles,
            garmentType,
            garmentColor: garmentColor.label,
            view: activeAngle.toLowerCase(),
          }),
        });

        const resData = await res.json().catch(() => ({}));

        if (res.ok && resData.imageUrl) {
          setGeneratedImageUrl(resData.imageUrl);
          addToHistory(finalPrompt, resData.imageUrl);
          toast({ title: "Design generated!", description: "Your garment visualization is ready." });
          return;
        }

        if (resData.code === "NO_API_KEY" || resData.code === "INVALID_KEY") {
          setShowKeyInput(true);
          throw new Error(resData.error || "API key required");
        }
        // Fall through to Pollinations on any other error
      }

      // Pollinations.ai fallback
      const styleParts = STYLE_TAGS.filter(t => selectedStyles.includes(t.label)).map(t => t.prompt).join(", ");
      const fullPrompt = [
        finalPrompt,
        styleParts,
        "apparel graphic design, t-shirt print, high quality vector art, white background, centered, print-ready",
      ].filter(Boolean).join(", ");
      const seed = Math.floor(Math.random() * 99999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;

      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load"));
        img.src = url;
        setTimeout(() => reject(new Error("Timeout")), 35000);
      });

      setGeneratedImageUrl(url);
      addToHistory(finalPrompt, url);
      toast({ title: "Design ready!", description: "Your garment visualization is ready." });
    } catch (err: any) {
      const msg = err.message || "Generation failed";
      setGenerationError(msg);
      toast({ title: "Generation failed", description: msg, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const addToHistory = (p: string, url: string) => {
    setDesignHistory(prev => [
      { id: Date.now().toString(), prompt: p, imageUrl: url, timestamp: Date.now() },
      ...prev,
    ].slice(0, 10));
  };

  const handleGenerate = () => { if (prompt.trim()) doGenerate(prompt.trim()); };

  const handleRegenerate = () => {
    const combined = refinePrompt.trim()
      ? `${prompt.trim()}, ${refinePrompt.trim()}`
      : prompt.trim();
    doGenerate(combined);
  };

  const handleRefineChip = (chip: string) => {
    setRefinePrompt(chip);
    const combined = `${prompt.trim()}, ${chip}`;
    doGenerate(combined);
  };

  const saveGeminiKey = () => {
    if (!keyInput.trim()) return;
    localStorage.setItem("gemini_api_key", keyInput.trim());
    setGeminiKey(keyInput.trim());
    setKeyInput("");
    setShowKeyInput(false);
    toast({ title: "API key saved!", description: "Generating with Gemini AI now." });
    setTimeout(() => handleGenerate(), 100);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setUploadedImage(ev.target?.result as string);
      setGeneratedImageUrl(null);
      setIsAccepted(false);
      resetPos();
      toast({ title: "Logo uploaded!", description: "Drag to reposition on the canvas." });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await createDesign.mutateAsync({
        data: {
          name: designName,
          productId: selectedProduct ? parseInt(selectedProduct) : null,
          designData: JSON.stringify({ garmentColor: garmentColor.value, size: selectedSize, fabric: selectedFabric, gsm: selectedGsm, prompt, styles: selectedStyles, angle: activeAngle }),
          prompt: prompt || null,
          previewUrl: generatedImageUrl || null,
        }
      });
      toast({ title: "Design saved!" });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
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
      designImageUrl: generatedImageUrl || uploadedImage,
    }));
    setLocation("/quote");
  };

  // Generated images fill the canvas; uploaded logos overlay the garment silhouette
  const hasGeneratedImage = !!generatedImageUrl;
  const hasUploadedLogo   = !!uploadedImage;
  const currentPos = getPos(activeAngle);

  // ── Input style helpers ──────────────────────────────────────────────────────
  const panelInput = "bg-[#0a0a0a] border-[rgba(167,139,250,0.2)] text-sm focus:border-[#C9A84C] text-white";

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 64px)" }}>

      {/* ── Header ── */}
      <div
        className="shrink-0 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap"
        style={{ borderBottom: "1px solid rgba(167,139,250,0.15)", background: "rgba(10,10,10,0.95)", backdropFilter: "blur(16px)" }}
      >
        <h1 className="font-display text-xl tracking-widest uppercase text-white">AI Design Studio</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            value={designName}
            onChange={e => setDesignName(e.target.value)}
            className={`w-36 h-8 text-sm ${panelInput}`}
            placeholder="Design name..."
            data-testid="input-design-name"
          />
          <button
            className="flex items-center gap-1.5 h-8 px-3 text-[11px] font-bold uppercase tracking-wider transition-all"
            onClick={handleSave}
            disabled={isSaving}
            style={{ border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C" }}
            data-testid="button-save-design"
          >
            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save
          </button>
          <button
            className="flex items-center gap-1.5 h-8 px-3 text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-40"
            onClick={handleAddToQuote}
            disabled={!generatedImageUrl && !uploadedImage}
            style={{ background: "#C9A84C", color: "#0a0a0a" }}
            data-testid="button-add-to-quote"
          >
            <ShoppingCart className="h-3 w-3" /> Add to Quote
          </button>
        </div>
      </div>

      {/* ── Gemini API Key Banner ── */}
      {showKeyInput && (
        <div
          className="shrink-0 px-4 py-3 flex items-center gap-3 flex-wrap"
          style={{ background: "rgba(167,139,250,0.08)", borderBottom: "1px solid rgba(167,139,250,0.2)" }}
        >
          <KeyRound className="h-4 w-4 shrink-0" style={{ color: "#a78bfa" }} />
          <p className="text-sm text-white flex-1 min-w-[200px]">
            Enter your{" "}
            <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#a78bfa" }}>
              Gemini API key
            </a>{" "}
            to enable AI generation (free tier available):
          </p>
          <Input
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") saveGeminiKey(); }}
            placeholder="AIza..."
            type="password"
            className={`w-64 h-8 text-sm ${panelInput}`}
          />
          <button
            onClick={saveGeminiKey}
            className="h-8 px-3 text-[11px] font-bold uppercase tracking-wider"
            style={{ background: "#C9A84C", color: "#0a0a0a" }}
          >
            Save Key
          </button>
          <button
            onClick={() => { setShowKeyInput(false); doGenerate(prompt.trim(), true); }}
            className="h-8 px-3 text-[11px] uppercase tracking-wider"
            style={{ border: "1px solid rgba(167,139,250,0.3)", color: "#a0a0a0" }}
          >
            Use Pollinations instead
          </button>
          <button onClick={() => setShowKeyInput(false)} className="text-[#555] hover:text-white"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* ── Three-panel body ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <div className="w-full lg:w-60 shrink-0 overflow-y-auto" style={{ background: "#0e0e0e", borderRight: "1px solid rgba(167,139,250,0.1)" }}>
          <div className="p-4 flex flex-col gap-0">

            {/* Product */}
            <div className="pb-4 mb-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
              <Label className="text-[10px] uppercase tracking-widest mb-2 block" style={{ color: "#C9A84C" }}>Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger data-testid="select-product" className={`h-8 text-sm ${panelInput}`}>
                  <SelectValue placeholder="Choose product..." />
                </SelectTrigger>
                <SelectContent className="bg-[#111] max-h-60" style={{ border: "1px solid rgba(167,139,250,0.2)" }}>
                  {products?.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()} className="text-xs">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProductData && (
                <p className="text-[10px] text-[#555] mt-1">{selectedProductData.category} · PKR {selectedProductData.basePricePkr.toLocaleString()}</p>
              )}
            </div>

            {/* Color */}
            <div className="pb-4 mb-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
              <Label className="text-[10px] uppercase tracking-widest mb-2 block" style={{ color: "#C9A84C" }}>Garment Color</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {GARMENT_COLORS.map(c => (
                  <button key={c.value} title={c.label} onClick={() => setGarmentColor(c)}
                    className="flex flex-col items-center gap-1" data-testid={`color-swatch-${c.label.toLowerCase().replace(" ", "-")}`}>
                    <span className="w-9 h-9 block border-2 relative transition-all"
                      style={{
                        backgroundColor: c.value,
                        borderColor: garmentColor.value === c.value ? "#C9A84C" : "transparent",
                        boxShadow: garmentColor.value === c.value ? "0 0 0 1px #C9A84C" : "0 0 0 1px rgba(255,255,255,0.1)",
                      }}>
                      {garmentColor.value === c.value && (
                        <span className="absolute inset-0 flex items-center justify-center text-[#C9A84C] text-base">✓</span>
                      )}
                    </span>
                    <span className="text-[9px] text-[#555] truncate w-full text-center">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="pb-4 mb-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
              <Label className="text-[10px] uppercase tracking-widest mb-2 block" style={{ color: "#C9A84C" }}>Size</Label>
              <div className="flex flex-wrap gap-1">
                {SIZES.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className="px-2 py-1 text-[11px] font-bold border transition-all"
                    style={{
                      borderColor: selectedSize === s ? "#C9A84C" : "rgba(167,139,250,0.2)",
                      backgroundColor: selectedSize === s ? "#C9A84C" : "transparent",
                      color: selectedSize === s ? "#0a0a0a" : "#888",
                    }}
                    data-testid={`size-${s}`}>{s}</button>
                ))}
              </div>
            </div>

            {/* Fabric */}
            <div className="pb-4 mb-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
              <Label className="text-[10px] uppercase tracking-widest mb-2 block" style={{ color: "#C9A84C" }}>Fabric</Label>
              <Select value={selectedFabric} onValueChange={setSelectedFabric}>
                <SelectTrigger className={`h-8 text-xs ${panelInput}`} data-testid="select-fabric"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#111]" style={{ border: "1px solid rgba(167,139,250,0.2)" }}>
                  {FABRICS.map(f => <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* GSM */}
            <div className="pb-4 mb-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
              <Label className="text-[10px] uppercase tracking-widest mb-2 block" style={{ color: "#C9A84C" }}>GSM Weight</Label>
              <Select value={selectedGsm} onValueChange={setSelectedGsm}>
                <SelectTrigger className={`h-8 text-xs ${panelInput}`} data-testid="select-gsm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#111]" style={{ border: "1px solid rgba(167,139,250,0.2)" }}>
                  {GSM.map(g => <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Brand Label */}
            <div className="flex items-center justify-between py-2">
              <Label className="text-[10px] uppercase tracking-widest cursor-pointer" style={{ color: "#C9A84C" }} htmlFor="brand-label-toggle">
                Add Brand Label
              </Label>
              <Switch id="brand-label-toggle" checked={brandLabel} onCheckedChange={setBrandLabel}
                data-testid="toggle-brand-label" className="data-[state=checked]:bg-[#a78bfa]" />
            </div>
          </div>
        </div>

        {/* ── CENTER (Canvas) ── */}
        <div className="flex-1 flex flex-col items-center justify-start p-4 overflow-y-auto" style={{ background: "#0a0a0a" }}>

          {/* Angle tabs */}
          <div className="flex gap-1 mb-4 w-full justify-center flex-wrap">
            {ANGLES.map(angle => (
              <button key={angle} onClick={() => setActiveAngle(angle)}
                className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest border transition-all"
                style={{
                  borderColor: activeAngle === angle ? "#C9A84C" : "rgba(167,139,250,0.2)",
                  backgroundColor: activeAngle === angle ? "#C9A84C" : "transparent",
                  color: activeAngle === angle ? "#0a0a0a" : "#888",
                }}
                data-testid={`angle-${angle.toLowerCase().replace(" ", "-")}`}>
                {angle}
              </button>
            ))}
          </div>

          {/* Canvas */}
          <div
            ref={canvasRef}
            className="relative select-none overflow-hidden"
            data-testid="canvas-preview"
            style={{
              width: 320 * zoom,
              height: 320 * zoom,
              maxWidth: "100%",
              border: "1px solid rgba(201,168,76,0.25)",
              boxShadow: "0 0 40px rgba(201,168,76,0.06)",
              background: "#111",
            }}
          >

            {/* ── CASE 1: AI-Generated image — fills the entire canvas ── */}
            {hasGeneratedImage && !isGenerating && (
              <img
                src={generatedImageUrl!}
                alt="AI-generated garment"
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: "contain", background: "#111" }}
                data-testid="generated-fullscreen-image"
              />
            )}

            {/* ── CASE 2: No generated image — show garment silhouette ── */}
            {!hasGeneratedImage && (
              <div className="absolute inset-0">
                <GarmentSVG angle={activeAngle} color={garmentColor.value} />
              </div>
            )}

            {/* ── Upload logo overlay (only on garment silhouette, not on AI image) ── */}
            {hasUploadedLogo && !hasGeneratedImage && (
              <DraggableDesign
                imageUrl={uploadedImage!}
                canvasRef={canvasRef}
                pos={currentPos}
                onPosChange={p => setPos(activeAngle, p)}
                isLocked={isAccepted}
              />
            )}

            {/* ── Custom text overlay (only on garment silhouette) ── */}
            {customText && !hasGeneratedImage && (
              <div className="absolute pointer-events-none flex items-end justify-center z-20"
                style={{ bottom: "18%", left: "10%", right: "10%", textAlign: "center" }}>
                <span className="font-display text-2xl tracking-widest" style={{ color: textColor, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
                  {customText}
                </span>
              </div>
            )}

            {/* ── Generating overlay ── */}
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 overflow-hidden"
                style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}>
                <ScanLine />
                <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mb-4 relative z-10" />
                <p className="font-display text-sm tracking-widest uppercase relative z-10" style={{ color: "#a78bfa" }}>
                  {GENERATING_MESSAGES[genMessageIdx]}
                </p>
              </div>
            )}

            {/* ── Empty state (no image, no upload, no text) ── */}
            {!hasGeneratedImage && !hasUploadedLogo && !isGenerating && !customText && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="text-center px-4">
                  <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center"
                    style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}>
                    <Zap className="h-5 w-5" style={{ color: "#a78bfa" }} />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-[#555]">
                    Generate a design or upload your logo
                  </p>
                </div>
              </div>
            )}

            {/* ── Upload drag hint (shown for upload/text overlay, not for AI image) ── */}
            {hasUploadedLogo && !hasGeneratedImage && !isAccepted && !isGenerating && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none z-20">
                <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest" style={{ background: "rgba(0,0,0,0.8)", color: "#C9A84C" }}>
                  Drag to reposition · Scroll to resize
                </span>
              </div>
            )}

            {/* ── Locked badge (upload mode only) ── */}
            {isAccepted && hasUploadedLogo && !hasGeneratedImage && (
              <div className="absolute top-2 right-2 z-20 flex items-center gap-1 px-2 py-0.5"
                style={{ background: "rgba(201,168,76,0.9)" }}>
                <CheckCircle className="h-3 w-3 text-black" />
                <span className="text-[9px] text-black font-bold uppercase tracking-widest">Locked</span>
              </div>
            )}

            {/* ── Angle badge ── */}
            <div className="absolute top-2 left-2 z-20">
              <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5"
                style={{ background: "rgba(0,0,0,0.7)", color: "rgba(167,139,250,0.8)" }}>
                {activeAngle}
              </span>
            </div>
          </div>

          {/* Controls below canvas */}
          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            {/* Accept/Unlock only relevant for upload overlay — not needed for full AI image */}
            {hasUploadedLogo && !hasGeneratedImage && !isAccepted && (
              <button onClick={() => setIsAccepted(true)}
                className="h-8 px-4 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ background: "#C9A84C", color: "#0a0a0a" }}
                data-testid="button-accept-design">
                <CheckCircle className="h-3.5 w-3.5" /> Lock Position
              </button>
            )}
            {hasUploadedLogo && !hasGeneratedImage && isAccepted && (
              <button onClick={() => setIsAccepted(false)}
                className="h-8 px-4 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                style={{ border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
                <MoveIcon className="h-3.5 w-3.5" /> Unlock
              </button>
            )}
            {[
              { icon: ZoomOut,   action: () => setZoom(z => Math.max(0.4, +(z - 0.1).toFixed(1))), testId: "button-zoom-out"   },
              { icon: ZoomIn,    action: () => setZoom(z => Math.min(2,   +(z + 0.1).toFixed(1))), testId: "button-zoom-in"    },
              { icon: RotateCcw, action: () => setZoom(1),                                          testId: "button-reset-zoom" },
            ].map(({ icon: Icon, action, testId }) => (
              <button key={testId} onClick={action}
                className="p-1.5 transition-colors text-[#555] hover:text-[#C9A84C]"
                style={{ border: "1px solid rgba(167,139,250,0.15)" }}
                data-testid={testId}>
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
            <span className="text-[11px] text-[#555] w-10 text-center">{Math.round(zoom * 100)}%</span>
          </div>

          {/* ── Design History strip ── */}
          {designHistory.length > 0 && (
            <div className="w-full mt-4 max-w-[320px]">
              <div className="flex items-center gap-2 mb-2">
                <History className="h-3 w-3" style={{ color: "#a78bfa" }} />
                <span className="text-[9px] uppercase tracking-widest" style={{ color: "#555" }}>
                  Session History ({designHistory.length})
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {designHistory.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setGeneratedImageUrl(item.imageUrl); setIsAccepted(false); resetPos(); }}
                    className="shrink-0 relative group"
                    title={item.prompt}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      className="w-12 h-12 object-cover border-2 transition-all"
                      style={{ borderColor: generatedImageUrl === item.imageUrl ? "#C9A84C" : "rgba(167,139,250,0.2)" }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <RefreshCw className="h-3 w-3 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-full lg:w-80 shrink-0 overflow-y-auto" style={{ background: "#0e0e0e", borderLeft: "1px solid rgba(167,139,250,0.1)" }}>
          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="w-full rounded-none h-10"
              style={{ background: "rgba(10,10,10,0.5)", borderBottom: "1px solid rgba(167,139,250,0.15)" }}>
              {[
                { value: "ai",     label: "AI",     Icon: Wand2  },
                { value: "upload", label: "Upload", Icon: Upload },
                { value: "text",   label: "Text",   Icon: Type   },
              ].map(({ value, label, Icon }) => (
                <TabsTrigger key={value} value={value} data-testid={`tab-${value}`}
                  className="flex-1 rounded-none font-display tracking-wider uppercase text-[11px] data-[state=active]:text-[#C9A84C] data-[state=active]:border-b-2 data-[state=active]:border-[#C9A84C]">
                  <Icon className="h-3 w-3 mr-1" /> {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── AI Tab ── */}
            <TabsContent value="ai" className="p-4 flex flex-col gap-4 m-0">

              {/* Prompt */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-[10px] uppercase tracking-widest" style={{ color: "#C9A84C" }}>Describe Your Design</Label>
                  <span className={`text-[10px] ${prompt.length > MAX_PROMPT * 0.9 ? "text-red-400" : "text-[#555]"}`}>
                    {prompt.length}/{MAX_PROMPT}
                  </span>
                </div>
                <Textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value.slice(0, MAX_PROMPT))}
                  placeholder="e.g. A vintage eagle with lightning bolts, gothic lettering..."
                  className={`resize-none min-h-[90px] text-sm ${panelInput}`}
                  data-testid="textarea-prompt"
                />
              </div>

              {/* Style modifiers */}
              <div>
                <Label className="text-[10px] uppercase tracking-widest mb-2 block" style={{ color: "#C9A84C" }}>Style Modifiers</Label>
                <div className="flex flex-wrap gap-1.5">
                  {STYLE_TAGS.map(tag => (
                    <button key={tag.label} onClick={() => toggleStyle(tag.label)}
                      className="px-2.5 py-1 text-[11px] font-bold border transition-all uppercase tracking-wider"
                      style={{
                        borderColor: selectedStyles.includes(tag.label) ? "#a78bfa" : "rgba(167,139,250,0.2)",
                        backgroundColor: selectedStyles.includes(tag.label) ? "#a78bfa" : "transparent",
                        color: selectedStyles.includes(tag.label) ? "#000" : "#888",
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
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                data-testid="button-generate"
                style={{
                  background: !prompt.trim() || isGenerating ? "#1a1a1a" : "#C9A84C",
                  color: !prompt.trim() || isGenerating ? "#444" : "#0a0a0a",
                  cursor: !prompt.trim() || isGenerating ? "not-allowed" : "pointer",
                  border: "1px solid",
                  borderColor: !prompt.trim() || isGenerating ? "rgba(255,255,255,0.05)" : "#C9A84C",
                }}
              >
                {prompt.trim() && !isGenerating && (
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }} />
                )}
                {isGenerating
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                  : <><Zap className="h-4 w-4 relative" /> Generate Design</>
                }
              </button>

              {isGenerating && (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full rounded-none bg-[#1a1a1a]" />
                  <Skeleton className="h-3 w-3/4 rounded-none bg-[#1a1a1a]" />
                  <Skeleton className="h-28 w-full rounded-none bg-[#1a1a1a]" />
                </div>
              )}

              {generationError && !isGenerating && (
                <div className="p-3 text-xs text-red-400" style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
                  {generationError}
                </div>
              )}

              {/* Generated preview */}
              {generatedImageUrl && !isGenerating && (
                <div className="p-3" style={{ border: "1px solid rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.04)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#C9A84C" }}>Generated Design</p>
                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest" style={{ color: "#22c55e" }}>
                      <CheckCircle className="h-3 w-3" /> Applied to canvas
                    </div>
                  </div>
                  <div className="relative">
                    <img src={generatedImageUrl} alt="Generated" className="w-full aspect-square object-cover" style={{ background: "#fff", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>

                  {/* Refine section */}
                  <div className="mt-3">
                    <p className="text-[10px] text-[#555] uppercase tracking-widest mb-1.5">Refine this design</p>
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      {["Make it darker", "Add text", "Change colors", "Make it bigger"].map(chip => (
                        <button key={chip} onClick={() => handleRefineChip(chip)}
                          className="px-2 py-0.5 text-[9px] uppercase tracking-wider border transition-colors"
                          style={{ border: "1px solid rgba(167,139,250,0.2)", color: "#a78bfa" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.1)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                          {chip}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={refinePrompt}
                        onChange={e => setRefinePrompt(e.target.value)}
                        placeholder="Refine this design..."
                        className={`flex-1 h-8 text-xs ${panelInput}`}
                        onKeyDown={e => { if (e.key === "Enter" && refinePrompt.trim()) handleRegenerate(); }}
                      />
                      <button
                        onClick={handleRegenerate}
                        className="h-8 px-2 text-[10px] uppercase tracking-wider"
                        style={{ border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <button onClick={handleRegenerate}
                    className="mt-2.5 w-full py-2 text-[11px] font-bold uppercase tracking-wider transition-colors"
                    style={{ border: "1px solid rgba(167,139,250,0.4)", color: "#a78bfa" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.08)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    data-testid="button-regenerate">
                    Regenerate with Variation
                  </button>
                  <button
                    onClick={() => { setGeneratedImageUrl(null); setIsAccepted(false); resetPos(); }}
                    className="mt-1.5 w-full py-1.5 text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                    style={{ border: "1px solid rgba(239,68,68,0.2)", color: "#666" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.4)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#666"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.2)"; }}>
                    <X className="h-3 w-3" /> Remove
                  </button>
                </div>
              )}

              {geminiKey && (
                <div className="text-[9px] text-[#555] flex items-center gap-1">
                  <KeyRound className="h-2.5 w-2.5" style={{ color: "#a78bfa" }} />
                  Gemini AI active ·{" "}
                  <button onClick={() => { localStorage.removeItem("gemini_api_key"); setGeminiKey(""); }}
                    className="underline hover:text-white">clear key</button>
                </div>
              )}

              <div className="text-[10px] text-[#333] p-2" style={{ border: "1px solid rgba(167,139,250,0.08)" }}>
                {geminiKey ? "Powered by Gemini 2.0 Flash" : "Powered by Pollinations AI — free, no account required"}
              </div>
            </TabsContent>

            {/* ── Upload Tab ── */}
            <TabsContent value="upload" className="p-4 flex flex-col gap-4 m-0">
              <Label className="text-[10px] uppercase tracking-widest mb-1 block" style={{ color: "#C9A84C" }}>Upload Logo / Artwork</Label>
              <label
                className="flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-colors"
                style={{ border: "2px dashed rgba(167,139,250,0.3)" }}
                data-testid="dropzone-upload"
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.6)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.3)"; }}
              >
                <Upload className="h-7 w-7 mb-3 text-[#555]" />
                <p className="text-sm text-[#a0a0a0]">Click to upload</p>
                <p className="text-xs text-[#555] mt-1">PNG, JPG, SVG</p>
                <input type="file" accept="image/*,.svg" className="hidden" onChange={handleUpload} data-testid="input-file" />
              </label>

              {uploadedImage && (
                <div className="p-3" style={{ border: "1px solid rgba(167,139,250,0.3)", background: "rgba(167,139,250,0.04)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#C9A84C" }}>Uploaded Logo</p>
                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest" style={{ color: "#22c55e" }}>
                      <CheckCircle className="h-3 w-3" /> Applied
                    </div>
                  </div>
                  <img src={uploadedImage} alt="Uploaded" className="w-full object-contain max-h-32 bg-white/5" />
                  <button
                    onClick={() => { setUploadedImage(null); setIsAccepted(false); resetPos(); }}
                    className="mt-2 w-full py-1.5 text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                    style={{ border: "1px solid rgba(239,68,68,0.2)", color: "#666" }}>
                    <X className="h-3 w-3" /> Remove
                  </button>
                </div>
              )}

              <div className="p-3" style={{ border: "1px solid rgba(167,139,250,0.08)" }}>
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#555" }}>Best results:</p>
                <ul className="text-[10px] text-[#444] space-y-1">
                  <li>• PNG with transparent background</li>
                  <li>• 300 DPI or higher for print quality</li>
                  <li>• Drag to reposition after upload</li>
                </ul>
              </div>
            </TabsContent>

            {/* ── Text Tab ── */}
            <TabsContent value="text" className="p-4 flex flex-col gap-4 m-0">
              <div>
                <Label className="text-[10px] uppercase tracking-widest mb-1.5 block" style={{ color: "#C9A84C" }}>Custom Text</Label>
                <Input value={customText} onChange={e => setCustomText(e.target.value)}
                  placeholder="YOUR BRAND NAME"
                  className={`font-display tracking-widest ${panelInput}`}
                  data-testid="input-custom-text" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest mb-2 block" style={{ color: "#C9A84C" }}>Text Color</Label>
                <div className="flex items-center gap-2.5">
                  <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                    className="w-9 h-9 border cursor-pointer bg-[#0a0a0a]"
                    style={{ borderColor: "rgba(167,139,250,0.2)" }} data-testid="input-text-color" />
                  <Input value={textColor} onChange={e => setTextColor(e.target.value)}
                    className={`font-mono text-sm w-24 ${panelInput}`} data-testid="input-text-color-hex" />
                </div>
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest mb-1.5 block" style={{ color: "#C9A84C" }}>Font</Label>
                <Select defaultValue="bebas">
                  <SelectTrigger className={`h-8 text-sm ${panelInput}`} data-testid="select-font"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#111]" style={{ border: "1px solid rgba(167,139,250,0.2)" }}>
                    <SelectItem value="bebas">Bebas Neue</SelectItem>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="mono">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3" style={{ border: "1px solid rgba(167,139,250,0.15)", background: "rgba(167,139,250,0.04)" }}>
                <p className="text-[11px] text-[#555] mb-1">Preview:</p>
                <p className="font-display text-2xl tracking-widest truncate" style={{ color: textColor }}>
                  {customText || "YOUR TEXT"}
                </p>
              </div>
              {customText && (
                <button onClick={() => setCustomText("")}
                  className="w-full py-1.5 text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                  style={{ border: "1px solid rgba(239,68,68,0.2)", color: "#666" }}>
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
