import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useListProducts, useCreateDesign } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ScanLine } from "@/components/ui/ScanLine";
import {
  Wand2, Upload, Type, ZoomIn, ZoomOut, RotateCcw, Save,
  ShoppingCart, Loader2, Zap, CheckCircle, MoveIcon, X,
  KeyRound, History, RefreshCw, ChevronRight, Undo2, Plus, Trash2,
  ChevronDown, Lock, Menu, ArrowRight,
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
  "Creating garment design...",
  "Applying fabric texture...",
  "Finalizing your creation...",
];

const VIEW_SWITCH_MESSAGES: Record<string, string[]> = {
  Front:        ["Returning to front view...", "Rendering front panel..."],
  Back:         ["Rotating garment...", "Rendering back view...", "Generating back panel..."],
  "Left Sleeve":  ["Focusing on left sleeve...", "Rendering sleeve detail...", "Generating sleeve view..."],
  "Right Sleeve": ["Focusing on right sleeve...", "Rendering sleeve detail...", "Generating sleeve view..."],
};

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

const QUICK_CHIPS = [
  { icon: "🏏", label: "Pakistan Cricket Kit",   prompt: "Pakistan national cricket team jersey, green and gold star emblem, premium sublimation print, bold typography" },
  { icon: "🦅", label: "Eagle Streetwear",        prompt: "Large eagle with spread wings, vintage distressed print, urban streetwear, gothic lettering" },
  { icon: "🏆", label: "Championship Jersey",     prompt: "Championship sports jersey, bold number graphics, flame design, professional team aesthetic" },
];

// ─── Edit constants ───────────────────────────────────────────────────────────

const GARMENT_PARTS = [
  "Body / Main Panel",
  "Collar",
  "Sleeves",
  "Cuffs",
  "Side Panels",
  "Stripes / Accents",
  "Numbers / Text",
];

const COLOR_SWATCHES = [
  { label: "White",        value: "#f5f5f0" },
  { label: "Black",        value: "#0a0a0a" },
  { label: "Grey",         value: "#888888" },
  { label: "Charcoal",     value: "#3a3a3a" },
  { label: "Navy",         value: "#1a2744" },
  { label: "Royal Blue",   value: "#1a4a9a" },
  { label: "Red",          value: "#c01a1a" },
  { label: "Maroon",       value: "#800020" },
  { label: "Forest Green", value: "#2d5a27" },
  { label: "Olive",        value: "#6b6b2d" },
  { label: "Orange",       value: "#e06000" },
  { label: "Yellow",       value: "#e8c800" },
  { label: "Gold",         value: "#C9A84C" },
  { label: "Purple",       value: "#a78bfa" },
  { label: "Cyan",         value: "#22d3ee" },
  { label: "Hot Pink",     value: "#ec4899" },
  { label: "Burgundy",     value: "#6b1c2e" },
  { label: "Teal",         value: "#0d9488" },
];

const SLEEVE_OPTIONS  = ["Short Sleeve","3/4 Sleeve","Long Sleeve","Sleeveless"];
const COLLAR_OPTIONS  = ["Round Neck","V-Neck","Polo Collar","Mandarin","Hooded"];
const FIT_OPTIONS     = ["Regular Fit","Slim Fit","Oversized","Cropped"];
const LENGTH_OPTIONS  = ["Regular","Long / Hip","Cropped"];

const EDIT_MESSAGES: Record<string, string[]> = {
  colors:      ["Recoloring selected parts...", "Matching fabric texture...", "Applying color changes...", "Blending with garment..."],
  logos_remove:["Removing brand markings...", "Restoring fabric underneath...", "Cleaning garment surface..."],
  logos_add:   ["Placing your logo...", "Matching embroidery style...", "Integrating with fabric...", "Finalizing logo placement..."],
  structure:   ["Restructuring garment...", "Adjusting sleeve length...", "Reshaping garment...", "Applying structural changes..."],
  natural:     ["Reading your instruction...", "Analyzing the garment...", "Applying changes...", "Preserving original design...", "Finalizing edit..."],
};

const NL_SUGGESTIONS = [
  "make the sleeves red",
  "make the collar gold",
  "make the body navy blue",
  "make the cuffs white",
  "remove all brand logos",
  "add number 10 on the back",
  "change side stripes to gold",
  "make it sleeveless",
  "add Pakistan flag on left sleeve",
  "change collar to polo collar",
];

const NL_PLACEHOLDERS = [
  '"make the sleeves red"',
  '"change the collar to gold"',
  '"make the body navy blue"',
  '"add a star on the left chest"',
  '"remove brand logos"',
  '"change cuffs to white"',
];

// ── NL edit intelligence ──
const extractColor = (instruction: string): string => {
  const colors = ["red","blue","green","black","white","gold","navy","purple","yellow","orange","pink","grey","gray","teal","maroon","cyan","silver","brown","cream","beige"];
  return colors.find(c => instruction.toLowerCase().includes(c)) || "the new color";
};

interface EditAnalysis {
  targetParts: string[];
  changeType: "color"|"logo"|"structure"|"text"|"pattern";
  isSpecificPart: boolean;
}

const analyzeEditInstruction = (instruction: string): EditAnalysis => {
  const lower = instruction.toLowerCase();
  const partKeywords: Record<string, string[]> = {
    sleeves:  ["sleeve","sleeves","arm","arms"],
    collar:   ["collar","neck","neckline"],
    body:     ["body","chest","front panel","back panel","torso","main panel"],
    cuffs:    ["cuff","cuffs","wrist"],
    logo:     ["logo","brand","badge","emblem","adidas","nike","puma"],
    number:   ["number","jersey number","shirt number"],
    stripes:  ["stripe","stripes","side panel","side stripe","accent"],
    shoulder: ["shoulder","shoulders"],
    hem:      ["hem","bottom","waistband"],
  };
  const targetParts: string[] = [];
  for (const [part, kws] of Object.entries(partKeywords)) {
    if (kws.some(kw => lower.includes(kw))) targetParts.push(part);
  }
  const changeType =
    /color|colour|red|blue|green|black|white|gold|navy|purple|yellow|orange|pink|grey|gray/i.test(instruction) ? "color" :
    /logo|brand|badge|emblem/i.test(instruction)                                                                  ? "logo" :
    /sleeve|sleeveless|collar|fit|length/i.test(instruction)                                                      ? "structure" :
    /number|text|name|font/i.test(instruction)                                                                    ? "text" : "pattern";
  return { targetParts, changeType, isSpecificPart: targetParts.length > 0 };
};

const buildPreciseEditPrompt = (userInstruction: string): string => {
  const analysis = analyzeEditInstruction(userInstruction);
  const partDescriptions: Record<string, string> = {
    sleeves:  "ONLY the sleeve panels (the fabric covering the arms from shoulder seam to cuff). Do NOT touch the front body panel, back body panel, collar, or any other part.",
    collar:   "ONLY the collar/neckline area. Do NOT touch the body, sleeves, or any other part.",
    body:     "ONLY the main body panel (front/back chest area). Do NOT touch the sleeves, collar, or any other part.",
    cuffs:    "ONLY the cuff area at the end of the sleeves. Do NOT touch the sleeve body, main body, collar, or any other part.",
    logo:     /remove|erase|delete|clean|strip|wipe/i.test(userInstruction)
      ? "REMOVE AND ERASE all logos, badges, brand emblems, manufacturer marks, and labels completely. Fill the area underneath with matching fabric texture and color. The fabric surface should look clean, unmarked, as if it was never printed. Do NOT change any colors, patterns, or other garment elements."
      : "ONLY the logo/badge/emblem design. Do NOT change any colors or other design elements.",
    stripes:  "ONLY the stripe/accent areas. Do NOT touch the main body color, sleeves, collar, or any other part.",
    shoulder: "ONLY the shoulder yoke area. Do NOT touch the main body, sleeves, or any other part.",
    number:   "ONLY the number/text element on the garment. Do NOT change any colors, logos, or other elements.",
    hem:      "ONLY the hem/waistband area at the bottom. Do NOT touch body, sleeves, collar, or any other part.",
  };

  if (analysis.isSpecificPart) {
    const targetDesc = analysis.targetParts.map(p => partDescriptions[p] || p).join("\n");
    return `You are making a HIGHLY PRECISE surgical edit to this garment image.

EDIT INSTRUCTION: "${userInstruction}"

EXACT TARGET:
${targetDesc}

STRICT PRESERVATION RULES:
- The main body/front panel color must remain EXACTLY as it is in the input image
- Every color that is NOT on the target part must remain EXACTLY the same
- Every logo, badge, number, and text element must remain EXACTLY the same
- The garment silhouette and shape must remain EXACTLY the same
- The background must remain dark/black exactly as in the input
- The lighting and shadows must remain consistent

MENTAL MODEL: Imagine using Photoshop with a precise selection mask. You have selected ONLY ${analysis.targetParts.join(" and ")}. Everything outside this selection is completely locked and cannot change.

Apply: ${userInstruction}
Only to: ${analysis.targetParts.join(" and ")}
Preserve: literally everything else

Output: photorealistic garment, dark background, professional product photography.`;
  }

  // Generic fallback — list explicit preserve items
  const mentionsSleeves  = /sleeve|arm/i.test(userInstruction);
  const mentionsCollar   = /collar|neck/i.test(userInstruction);
  const mentionsBody     = /body|chest|front|back|panel|torso/i.test(userInstruction);
  const mentionsCuffs    = /cuff|wrist/i.test(userInstruction);
  const mentionsLogo     = /logo|brand|badge|emblem/i.test(userInstruction);
  const mentionsNumber   = /number|jersey num/i.test(userInstruction);
  const mentionsStripes  = /stripe|side panel|accent/i.test(userInstruction);
  const preserveList: string[] = [];
  if (!mentionsSleeves) preserveList.push("sleeves (keep their EXACT current color, pattern, and design)");
  if (!mentionsCollar)  preserveList.push("collar (keep its EXACT current color and style)");
  if (!mentionsBody)    preserveList.push("body/chest/front panel (keep its EXACT current color and design)");
  if (!mentionsCuffs)   preserveList.push("cuffs (keep their EXACT current color)");
  if (!mentionsLogo)    preserveList.push("all logos, badges, and emblems (keep them exactly as they are)");
  if (!mentionsNumber)  preserveList.push("any numbers or text on the garment (keep them exactly as they are)");
  if (!mentionsStripes) preserveList.push("all stripes, accents, and side panels (keep their EXACT current colors)");

  return `You are making a SURGICAL EDIT to this garment image.

WHAT TO CHANGE: "${userInstruction}"

WHAT TO ABSOLUTELY NOT CHANGE (preserve these EXACTLY as they appear in the image):
${preserveList.map(p => `• ${p}`).join("\n")}

CRITICAL RULES:
1. ONLY modify the specific part(s) the user mentioned
2. Every other part of the garment must be PIXEL-PERFECT identical to the input image
3. The change must look naturally manufactured
4. Same lighting, same shadows, same fabric texture on unchanged parts
5. Same background (dark/black)
6. Same garment shape and silhouette
7. Do NOT reinterpret the overall design — only apply the one specific change

Think of this as Photoshop — you are using a selection mask on ONLY the mentioned part. Everything outside the selection stays untouched.

Output: photorealistic garment on dark background, professional studio lighting.`;
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface DesignPos   { top: number; left: number; size: number; }
interface HistoryItem { id: string; prompt: string; imageUrl: string; timestamp: number; label: "Generated" | "Edited"; }
interface ColorEdit   { part: string; color: string; colorLabel: string; }

// ─── Garment SVG ─────────────────────────────────────────────────────────────

function GarmentSVG({ angle, color }: { angle: string; color: string }) {
  if (angle === "Front" || angle === "Back") {
    return (
      <svg viewBox="0 0 300 360" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="gshadow"><feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="rgba(0,0,0,0.5)" /></filter>
          <linearGradient id="gsheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
          </linearGradient>
        </defs>
        <path d="M60 40 L0 100 L40 120 L40 330 L260 330 L260 120 L300 100 L240 40 C220 55 190 65 150 65 C110 65 80 55 60 40 Z"
          fill={color} filter="url(#gshadow)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d="M60 40 L0 100 L40 120 L40 330 L260 330 L260 120 L300 100 L240 40 C220 55 190 65 150 65 C110 65 80 55 60 40 Z"
          fill="url(#gsheen)" />
        <path d="M108 38 Q150 80 192 38" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        {[180,220,260].map(y => <path key={y} d={`M40 ${y} L260 ${y}`} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />)}
        <rect x="95" y="110" width="110" height="120" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="1" strokeDasharray="4 4" rx="2" />
      </svg>
    );
  }
  const flip = angle === "Right Sleeve";
  return (
    <svg viewBox="0 0 300 360" className="w-full h-full" xmlns="http://www.w3.org/2000/svg"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <defs>
        <filter id="sshadow"><feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="rgba(0,0,0,0.5)" /></filter>
      </defs>
      <path d="M40 60 L250 20 L280 140 L260 280 L40 300 Z" fill={color} filter="url(#sshadow)"
        stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x="90" y="100" width="110" height="110" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="1" strokeDasharray="4 4" rx="2" />
    </svg>
  );
}

// ─── Draggable Design Overlay ─────────────────────────────────────────────────

function DraggableDesign({ imageUrl, canvasRef, pos, onPosChange, isLocked }: {
  imageUrl: string; canvasRef: React.RefObject<HTMLDivElement | null>;
  pos: DesignPos; onPosChange: (p: DesignPos) => void; isLocked: boolean;
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
    onPosChange({ ...pos, top: Math.max(0, Math.min(100 - pos.size, dragStart.current.top + dy)), left: Math.max(0, Math.min(100 - pos.size, dragStart.current.left + dx)) });
  }, [pos, canvasRef, onPosChange, isLocked]);
  const endDrag = useCallback(() => { dragging.current = false; }, []);
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (isLocked) return;
    e.preventDefault();
    onPosChange({ ...pos, size: Math.max(10, Math.min(80, pos.size + (e.deltaY > 0 ? -2 : 2))) });
  }, [pos, onPosChange, isLocked]);

  return (
    <div onPointerDown={startDrag} onPointerMove={onDrag} onPointerUp={endDrag} onPointerLeave={endDrag} onWheel={onWheel}
      className={`absolute group ${isLocked ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
      style={{ top: `${pos.top}%`, left: `${pos.left}%`, width: `${pos.size}%`, height: `${pos.size}%`, userSelect: "none", touchAction: "none", zIndex: 10 }}>
      <img src={imageUrl} alt="Logo" draggable={false} crossOrigin="anonymous" className="w-full h-full object-contain select-none" style={{ pointerEvents: "none" }} />
      {!isLocked && <div className="absolute inset-0 border-2 border-dashed border-[#a78bfa]/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}
    </div>
  );
}

// ─── Edit Panel ───────────────────────────────────────────────────────────────

interface EditPanelProps {
  editTab: "colors"|"logos"|"structure"; setEditTab: (t:"colors"|"logos"|"structure")=>void;
  selectedPart: string|null; setSelectedPart:(p:string|null)=>void;
  selectedColor:string|null; setSelectedColor:(c:string|null)=>void;
  pendingColorEdits:ColorEdit[]; setPendingColorEdits:React.Dispatch<React.SetStateAction<ColorEdit[]>>;
  removeBrand:boolean; setRemoveBrand:(v:boolean)=>void;
  logoUploadBase64:string|null; setLogoUploadBase64:(v:string|null)=>void; setLogoUploadMimeType:(v:string)=>void;
  selectedSleeve:string|null; setSelectedSleeve:(v:string|null)=>void;
  selectedCollar:string|null; setSelectedCollar:(v:string|null)=>void;
  selectedFit:string|null; setSelectedFit:(v:string|null)=>void;
  selectedLength:string|null; setSelectedLength:(v:string|null)=>void;
  isEditing:boolean; undoStack:HistoryItem[]; onApplyEdit:()=>void; onUndo:()=>void;
  panelRef:React.RefObject<HTMLDivElement|null>;
}

function EditPanel({ editTab, setEditTab, selectedPart, setSelectedPart, selectedColor, setSelectedColor,
  pendingColorEdits, setPendingColorEdits, removeBrand, setRemoveBrand, logoUploadBase64, setLogoUploadBase64,
  setLogoUploadMimeType, selectedSleeve, setSelectedSleeve, selectedCollar, setSelectedCollar, selectedFit,
  setSelectedFit, selectedLength, setSelectedLength, isEditing, undoStack, onApplyEdit, onUndo, panelRef }: EditPanelProps) {

  const addToQueue = () => {
    if (!selectedPart || !selectedColor) return;
    const colorLabel = COLOR_SWATCHES.find(c => c.value === selectedColor)?.label || selectedColor;
    setPendingColorEdits(prev => [...prev.filter(e => e.part !== selectedPart), { part: selectedPart, color: selectedColor, colorLabel }]);
    setSelectedPart(null); setSelectedColor(null);
  };
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setLogoUploadMimeType(file.type || "image/png");
    const reader = new FileReader();
    reader.onload = ev => setLogoUploadBase64((ev.target?.result as string).split(",")[1]);
    reader.readAsDataURL(file);
  };
  const canApply =
    (editTab === "colors"    && (pendingColorEdits.length > 0 || (selectedPart && selectedColor))) ||
    (editTab === "logos"     && (removeBrand || !!logoUploadBase64)) ||
    (editTab === "structure" && (selectedSleeve || selectedCollar || selectedFit || selectedLength));
  const pill = (active: boolean) => ({
    border: `1px solid ${active ? "#C9A84C" : "rgba(167,139,250,0.3)"}`,
    background: active ? "rgba(201,168,76,0.08)" : "transparent",
    color: active ? "#C9A84C" : "#a0a0a0",
  });

  return (
    <div ref={panelRef} data-testid="edit-panel"
      style={{ background: "#111", border: "1px solid rgba(167,139,250,0.2)", borderTopWidth: 2, borderTopColor: "#a78bfa" }}
      className="mt-3">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: "#a78bfa" }}>◆ EDIT DESIGN</span>
        {undoStack.length > 0 && (
          <button onClick={onUndo} disabled={isEditing}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider disabled:opacity-40"
            style={{ border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
            <Undo2 className="h-3 w-3" /> Undo
          </button>
        )}
      </div>
      <div className="flex" style={{ borderBottom: "1px solid rgba(167,139,250,0.15)" }}>
        {(["colors","logos","structure"] as const).map(tab => (
          <button key={tab} onClick={() => setEditTab(tab)} className="px-3 py-2 text-[10px] uppercase tracking-[0.15em] transition-colors"
            style={{ color: editTab===tab?"#a78bfa":"#555", borderBottom:`2px solid ${editTab===tab?"#a78bfa":"transparent"}`, background:"transparent" }}>
            {tab==="colors"?"🎨 Colors":tab==="logos"?"🏷️ Logos":"📐 Structure"}
          </button>
        ))}
      </div>
      <div className="p-4 space-y-3">
        {editTab === "colors" && (
          <>
            <div>
              <p className="text-[9px] uppercase tracking-widest mb-2" style={{color:"#555"}}>Select Garment Part</p>
              <div className="flex flex-wrap gap-1.5">
                {GARMENT_PARTS.map(part => (
                  <button key={part} onClick={() => setSelectedPart(selectedPart===part?null:part)}
                    className="px-2 py-1 text-[9px] uppercase tracking-wider transition-all" style={pill(selectedPart===part)}>
                    {part}
                  </button>
                ))}
              </div>
            </div>
            {selectedPart && (
              <div>
                <p className="text-[9px] uppercase tracking-widest mb-2" style={{color:"#555"}}>Color for <span style={{color:"#C9A84C"}}>{selectedPart}</span></p>
                <div className="grid grid-cols-6 gap-1.5">
                  {COLOR_SWATCHES.map(sw => (
                    <button key={sw.value} title={sw.label} onClick={() => setSelectedColor(sw.value)}
                      className="w-full aspect-square transition-all"
                      style={{ background:sw.value, border:`2px solid ${selectedColor===sw.value?"#C9A84C":"transparent"}`, outline:`1px solid ${selectedColor===sw.value?"#C9A84C":"rgba(255,255,255,0.1)"}`, outlineOffset:selectedColor===sw.value?2:0 }} />
                  ))}
                </div>
                {selectedPart && selectedColor && (
                  <button onClick={addToQueue} className="mt-2 w-full flex items-center justify-center gap-1.5 h-8 text-[10px] font-bold uppercase tracking-wider"
                    style={{ border:"1px solid rgba(167,139,250,0.4)", color:"#a78bfa" }}>
                    <Plus className="h-3 w-3" /> Add to Queue
                  </button>
                )}
              </div>
            )}
            {pendingColorEdits.length > 0 && (
              <div className="space-y-1">
                {pendingColorEdits.map((edit, i) => (
                  <div key={i} className="flex items-center justify-between px-2 py-1"
                    style={{ background:"rgba(201,168,76,0.05)", border:"1px solid rgba(201,168,76,0.2)" }}>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 block" style={{ background:edit.color, border:"1px solid rgba(255,255,255,0.2)" }} />
                      <span className="text-[10px] text-white">{edit.part}</span>
                      <span className="text-[9px]" style={{color:"#C9A84C"}}>→ {edit.colorLabel}</span>
                    </div>
                    <button onClick={() => setPendingColorEdits(prev => prev.filter((_,j)=>j!==i))} className="text-[#555] hover:text-red-400">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {editTab === "logos" && (
          <div className="space-y-4">
            {/* Remove logos */}
            <div style={{ border: "1px solid rgba(239,68,68,0.15)", background: "#0f0f0f", padding: "10px 12px" }}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={removeBrand} onChange={e=>setRemoveBrand(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#ef4444]" />
                <div>
                  <p className="text-xs font-bold text-white">Remove all brand logos / badges</p>
                  <p className="text-[10px]" style={{color:"#555"}}>Erases existing marks and restores clean fabric underneath</p>
                </div>
              </label>
            </div>
            {/* Upload logo */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] uppercase tracking-widest" style={{color:"#C9A84C"}}>Place Your Own Logo</p>
                <span className="text-[8px] px-1.5 py-0.5" style={{ background:"rgba(167,139,250,0.1)", color:"#a78bfa", border:"1px solid rgba(167,139,250,0.2)" }}>Requires Gemini Key</span>
              </div>
              <label className="flex flex-col items-center justify-center p-4 cursor-pointer transition-all"
                style={{ border:"2px dashed rgba(167,139,250,0.3)" }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor="rgba(167,139,250,0.6)"}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor="rgba(167,139,250,0.3)"}>
                {logoUploadBase64
                  ? <div className="text-center">
                      <img src={`data:image/png;base64,${logoUploadBase64}`} alt="" className="h-14 object-contain mx-auto mb-2 bg-white/10 p-1" />
                      <p className="text-[10px] font-bold" style={{color:"#25d366"}}>✓ Logo ready — click Apply Edit below</p>
                    </div>
                  : <>
                      <Upload className="h-6 w-6 mb-2" style={{color:"#a78bfa"}} />
                      <p className="text-[10px] font-semibold text-white mb-0.5">Upload PNG / SVG / JPG</p>
                      <p className="text-[9px]" style={{color:"#555"}}>Logo will be placed on the chest area</p>
                    </>
                }
                <input type="file" accept="image/*,.svg" className="hidden" onChange={handleLogoUpload} />
              </label>
              {logoUploadBase64 && <button onClick={()=>setLogoUploadBase64(null)} className="mt-1.5 w-full flex items-center justify-center gap-1 py-1 text-[10px]" style={{border:"1px solid rgba(239,68,68,0.2)", color:"#ef4444"}}><Trash2 className="h-3 w-3" /> Remove logo</button>}
              {!logoUploadBase64 && (
                <p className="text-[8px] mt-2 text-center" style={{color:"#333"}}>
                  Add Gemini API key via AI Configuration (bottom of left panel) to enable logo placement
                </p>
              )}
            </div>
          </div>
        )}
        {editTab === "structure" && (
          <div className="space-y-4">
            {[
              { label:"Sleeve Length", opts:SLEEVE_OPTIONS, val:selectedSleeve, set:setSelectedSleeve },
              { label:"Collar Style",  opts:COLLAR_OPTIONS, val:selectedCollar, set:setSelectedCollar },
              { label:"Fit",           opts:FIT_OPTIONS,    val:selectedFit,    set:setSelectedFit    },
              { label:"Length",        opts:LENGTH_OPTIONS, val:selectedLength, set:setSelectedLength  },
            ].map(({ label, opts, val, set }) => (
              <div key={label}>
                <p className="text-[9px] uppercase tracking-widest mb-2" style={{color:"#C9A84C"}}>{label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {opts.map(opt => (
                    <button key={opt} onClick={()=>set(val===opt?null:opt)} className="px-2 py-1 text-[9px] uppercase tracking-wider transition-all" style={pill(val===opt)}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={onApplyEdit} disabled={!canApply||isEditing}
          className="w-full h-11 flex items-center justify-center gap-2 font-display text-sm tracking-widest uppercase transition-all disabled:opacity-40 relative overflow-hidden group"
          style={{ background:canApply&&!isEditing?"#a78bfa":"#1a1a1a", color:canApply&&!isEditing?"#000":"#444" }}>
          {isEditing ? <><Loader2 className="h-4 w-4 animate-spin" /> Applying Edit...</> : <><Zap className="h-4 w-4" /> Apply Edit</>}
        </button>
      </div>
    </div>
  );
}

// ─── Product Left Panel (shared for desktop sidebar + mobile drawer) ──────────

function ProductPanel({ products, selectedProduct, setSelectedProduct, selectedSize, setSelectedSize,
  selectedFabric, setSelectedFabric, selectedGsm, setSelectedGsm,
  garmentColor, setGarmentColor, brandLabel, setBrandLabel }: any) {

  const categories = useMemo(() => {
    if (!products) return [];
    return [...new Set(products.map((p: any) => p.category))] as string[];
  }, [products]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categoryProducts = useMemo(() => {
    if (!products || !selectedCategory) return [];
    return products.filter((p: any) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="flex flex-col gap-0 p-4">
      {/* Category Pills */}
      <div className="pb-4 mb-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
        <Label className="text-[9px] uppercase tracking-[0.25em] mb-2 block" style={{ color: "#a78bfa" }}>Category</Label>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat: string) => (
            <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className="px-2 py-1 text-[9px] uppercase tracking-wider transition-all"
              style={{ border:`1px solid ${selectedCategory===cat?"#C9A84C":"rgba(167,139,250,0.2)"}`, background:selectedCategory===cat?"#C9A84C":"transparent", color:selectedCategory===cat?"#0a0a0a":"#888" }}>
              {cat.replace(" Wear","").replace(" Uniforms","").replace("Sports Goods","Goods")}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {selectedCategory && categoryProducts.length > 0 && (
        <div className="pb-4 mb-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
          <Label className="text-[9px] uppercase tracking-[0.25em] mb-2 block" style={{ color: "#a78bfa" }}>Products</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {categoryProducts.map((product: any) => {
              const isSelected = selectedProduct === product.id.toString();
              return (
                <button key={product.id} onClick={() => setSelectedProduct(isSelected ? "" : product.id.toString())}
                  className="p-2 text-left transition-all relative"
                  style={{ background:"#0a0a0a", border:`1px solid ${isSelected?"#C9A84C":"rgba(167,139,250,0.2)"}` }}>
                  {isSelected && <CheckCircle className="absolute top-1.5 right-1.5 h-3 w-3" style={{color:"#C9A84C"}} />}
                  <span className="text-[9px] uppercase tracking-wide text-white block leading-tight pr-3">{product.name}</span>
                  <span className="text-[10px] font-bold mt-0.5 block" style={{color:"#C9A84C"}}>PKR {Number(product.basePricePkr).toLocaleString()}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Garment Color */}
      <div className="pb-4 mb-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
        <Label className="text-[9px] uppercase tracking-[0.25em] mb-2 block" style={{ color: "#a78bfa" }}>Garment Color</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {GARMENT_COLORS.map(c => (
            <button key={c.value} title={c.label} onClick={() => setGarmentColor(c)} className="flex flex-col items-center gap-1">
              <span className="w-9 h-9 block border-2 relative transition-all"
                style={{ backgroundColor:c.value, borderColor:garmentColor.value===c.value?"#C9A84C":"transparent", boxShadow:garmentColor.value===c.value?"0 0 0 1px #C9A84C":"0 0 0 1px rgba(255,255,255,0.1)" }}>
                {garmentColor.value===c.value && <span className="absolute inset-0 flex items-center justify-center text-[#C9A84C] text-base">✓</span>}
              </span>
              <span className="text-[9px] text-[#555] truncate w-full text-center">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="pb-4 mb-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
        <Label className="text-[9px] uppercase tracking-[0.25em] mb-2 block" style={{ color: "#a78bfa" }}>Size</Label>
        <div className="flex flex-wrap gap-1">
          {SIZES.map(s => (
            <button key={s} onClick={() => setSelectedSize(s)}
              className="px-2 py-1 text-[11px] font-bold border transition-all"
              style={{ borderColor:selectedSize===s?"#C9A84C":"rgba(167,139,250,0.2)", backgroundColor:selectedSize===s?"#C9A84C":"transparent", color:selectedSize===s?"#0a0a0a":"#888" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Fabric */}
      <div className="pb-4 mb-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
        <Label className="text-[9px] uppercase tracking-[0.25em] mb-2 block" style={{ color: "#a78bfa" }}>Fabric</Label>
        <div className="flex flex-col gap-1">
          {FABRICS.map(f => (
            <button key={f} onClick={() => setSelectedFabric(f)}
              className="px-2 py-1.5 text-[10px] text-left transition-all"
              style={{ border:`1px solid ${selectedFabric===f?"#C9A84C":"rgba(167,139,250,0.2)"}`, background:selectedFabric===f?"rgba(201,168,76,0.08)":"transparent", color:selectedFabric===f?"#C9A84C":"#888" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* GSM */}
      <div className="pb-4 mb-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
        <Label className="text-[9px] uppercase tracking-[0.25em] mb-2 block" style={{ color: "#a78bfa" }}>GSM Weight</Label>
        <div className="flex flex-wrap gap-1">
          {GSM.map(g => (
            <button key={g} onClick={() => setSelectedGsm(g)}
              className="px-2 py-1 text-[10px] border transition-all"
              style={{ borderColor:selectedGsm===g?"#C9A84C":"rgba(167,139,250,0.2)", backgroundColor:selectedGsm===g?"rgba(201,168,76,0.08)":"transparent", color:selectedGsm===g?"#C9A84C":"#888" }}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Label toggle */}
      <div className="flex items-center justify-between py-2">
        <Label className="text-[9px] uppercase tracking-[0.25em] cursor-pointer" style={{ color: "#a78bfa" }} htmlFor="brand-label-toggle">Brand Label</Label>
        <Switch id="brand-label-toggle" checked={brandLabel} onCheckedChange={setBrandLabel} className="data-[state=checked]:bg-[#a78bfa]" />
      </div>
    </div>
  );
}

// ─── Main Studio ──────────────────────────────────────────────────────────────

export default function Studio() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const canvasRef    = useRef<HTMLDivElement>(null);
  const editPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const apiKeyRef    = useRef<HTMLDivElement>(null);
  const genBtnRef    = useRef<HTMLButtonElement>(null);

  const { data: products } = useListProducts({ limit: 200 }, { query: { queryKey: ["listProducts"] } });
  const createDesign = useCreateDesign();

  // ── Core garment state ──
  const [selectedProduct, setSelectedProduct] = useState("");
  const [garmentColor, setGarmentColor]       = useState(GARMENT_COLORS[0]);
  const [selectedSize, setSelectedSize]       = useState("L");
  const [selectedFabric, setSelectedFabric]   = useState("100% Cotton");
  const [selectedGsm, setSelectedGsm]         = useState("220gsm");
  const [brandLabel, setBrandLabel]           = useState(false);
  const [activeAngle, setActiveAngle]         = useState("Front");
  const [zoom, setZoom]                       = useState(1);

  // ── AI generation ──
  const [prompt, setPrompt]                   = useState("");
  const [selectedStyles, setSelectedStyles]   = useState<string[]>([]);
  const [isGenerating, setIsGenerating]       = useState(false);
  const [genMessageIdx, setGenMessageIdx]     = useState(0);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [refinePrompt, setRefinePrompt]       = useState("");

  // ── View switching ──
  const [currentView, setCurrentView]         = useState<string>("Front");
  const [viewCache, setViewCache]             = useState<Record<string, string>>({});
  const [isViewSwitching, setIsViewSwitching] = useState(false);
  const [viewSwitchMsgIdx, setViewSwitchMsgIdx] = useState(0);
  const [currentPrompt, setCurrentPrompt]     = useState("");
  const [currentStyleModifiers, setCurrentStyleModifiers] = useState<string[]>([]);
  // Refs for stable values inside async closures (avoids stale state)
  const currentPromptRef              = useRef("");
  const currentStyleModifiersRef      = useRef<string[]>([]);
  const garmentTypeRef                = useRef("t-shirt");
  const garmentColorRef               = useRef("Black");

  // ── Upload ──
  const [uploadedImage, setUploadedImage]     = useState<string | null>(null);
  const [isAccepted, setIsAccepted]           = useState(false);
  const [positions, setPositions]             = useState<Record<string, DesignPos>>({});

  // ── Text overlay ──
  const [customText, setCustomText]           = useState("");
  const [textColor, setTextColor]             = useState("#C9A84C");

  // ── History & undo ──
  const [designHistory, setDesignHistory]     = useState<HistoryItem[]>([]);
  const [undoStack, setUndoStack]             = useState<HistoryItem[]>([]);

  // ── Gemini key ──
  const [geminiKey, setGeminiKey]             = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [keyInput, setKeyInput]               = useState("");
  const [apiKeyOpen, setApiKeyOpen]           = useState(false);

  // ── Generate button UX ──
  const [isShaking, setIsShaking]             = useState(false);

  // ── Save ──
  const [designName, setDesignName]           = useState("My Design");
  const [isSaving, setIsSaving]               = useState(false);

  // ── Mobile drawer ──
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  // ── Natural language edit state ──
  const [nlEditText, setNlEditText]           = useState("");
  const [nlInstruction, setNlInstruction]     = useState(""); // shown in overlay
  const [showAllNlSuggestions, setShowAllNlSuggestions] = useState(false);
  const [placeholderIdx, setPlaceholderIdx]   = useState(0);
  const [showPartClarification, setShowPartClarification] = useState<{ instruction: string; color: string } | null>(null);

  // ── Edit panel state ──
  const [editTab, setEditTab]                 = useState<"colors"|"logos"|"structure">("colors");
  const [isEditing, setIsEditing]             = useState(false);
  const [editMsgIdx, setEditMsgIdx]           = useState(0);
  const [editMsgSet, setEditMsgSet]           = useState<string[]>(EDIT_MESSAGES.colors);
  const [selectedPart, setSelectedPart]       = useState<string|null>(null);
  const [selectedColor, setSelectedColor]     = useState<string|null>(null);
  const [pendingColorEdits, setPendingColorEdits] = useState<ColorEdit[]>([]);
  const [removeBrand, setRemoveBrand]         = useState(false);
  const [logoUploadBase64, setLogoUploadBase64] = useState<string|null>(null);
  const [logoUploadMimeType, setLogoUploadMimeType] = useState("image/png");
  const [selectedSleeve, setSelectedSleeve]   = useState<string|null>(null);
  const [selectedCollar, setSelectedCollar]   = useState<string|null>(null);
  const [selectedFit, setSelectedFit]         = useState<string|null>(null);
  const [selectedLength, setSelectedLength]   = useState<string|null>(null);

  // ── Cycling messages ──
  useEffect(() => {
    if (!isGenerating) { setGenMessageIdx(0); return; }
    const t = setInterval(() => setGenMessageIdx(i => (i+1) % GENERATING_MESSAGES.length), 2000);
    return () => clearInterval(t);
  }, [isGenerating]);
  useEffect(() => {
    if (!isEditing) { setEditMsgIdx(0); return; }
    const t = setInterval(() => setEditMsgIdx(i => (i+1) % editMsgSet.length), 2000);
    return () => clearInterval(t);
  }, [isEditing, editMsgSet]);
  useEffect(() => {
    if (!isViewSwitching) { setViewSwitchMsgIdx(0); return; }
    const msgs = VIEW_SWITCH_MESSAGES[currentView] || ["Loading view..."];
    const t = setInterval(() => setViewSwitchMsgIdx(i => (i+1) % msgs.length), 2000);
    return () => clearInterval(t);
  }, [isViewSwitching, currentView]);

  // ── Derived ──
  const getPos   = (angle: string): DesignPos => positions[angle] ?? { ...PRINT_ZONES[angle] };
  const setPos   = (angle: string, p: DesignPos) => setPositions(prev => ({ ...prev, [angle]: p }));
  const resetPos = () => setPositions({});
  const toggleStyle = (label: string) => setSelectedStyles(prev => prev.includes(label) ? prev.filter(s=>s!==label) : [...prev,label]);
  const addToHistory = (p: string, url: string, label: "Generated"|"Edited" = "Generated") =>
    setDesignHistory(prev => [{ id: Date.now().toString(), prompt: p, imageUrl: url, timestamp: Date.now(), label }, ...prev].slice(0,10));

  const selectedProductData = products?.find(p => p.id.toString() === selectedProduct);
  const garmentType = selectedProductData ? (GARMENT_TYPE_MAP[selectedProductData.category] || "t-shirt") : "t-shirt";
  const hasGeneratedImage = !!generatedImageUrl;
  const hasUploadedLogo   = !!uploadedImage;
  const currentPos = getPos(activeAngle);
  const currentEditMsg = editMsgSet[editMsgIdx % editMsgSet.length] || "Applying edit...";

  // ── Notify Navbar of key changes ──
  const notifyKeyChange = () => {
    window.dispatchEvent(new Event("storage"));
  };

  // ── Rotate NL input placeholder every 3s ──
  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx(i => (i + 1) % NL_PLACEHOLDERS.length), 3000);
    return () => clearInterval(id);
  }, []);

  const getImageBase64 = (): { base64: string; mimeType: string } | null => {
    if (!generatedImageUrl) return null;
    if (generatedImageUrl.startsWith("data:")) {
      const [meta, data] = generatedImageUrl.split(",");
      return { base64: data, mimeType: meta.split(":")[1]?.split(";")[0] || "image/png" };
    }
    return null;
  };

  const buildEditPrompt = (): string => {
    if (editTab === "colors") {
      const all = [...pendingColorEdits];
      if (selectedPart && selectedColor) {
        const lbl = COLOR_SWATCHES.find(c=>c.value===selectedColor)?.label||selectedColor;
        if (!all.find(e=>e.part===selectedPart)) all.push({ part:selectedPart, color:selectedColor, colorLabel:lbl });
      }
      if (all.length===0) return "";
      return `Edit this garment image. ${all.map(e=>`Change the ${e.part} color to ${e.colorLabel} (hex ${e.color})`).join(". ")}. Keep all design graphics, logos, patterns, and fabric texture exactly the same. Only change the specified garment part colors. Photorealistic, naturally dyed fabric. Dark background. Professional product photography.`;
    }
    if (editTab === "logos") {
      const parts = [];
      if (removeBrand) parts.push("Remove all existing brand logos, badges, labels, and manufacturer markings. Restore fabric texture cleanly.");
      if (logoUploadBase64) parts.push("Add the logo from the second image onto the center chest area. Make it look naturally screen-printed or embroidered, matching the fabric lighting and texture.");
      return `${parts.join(" ")} Keep all colors and structural elements exactly the same. Photorealistic. Dark background.`;
    }
    if (editTab === "structure") {
      const parts = [];
      if (selectedSleeve) parts.push(`Change the sleeve length to ${selectedSleeve}. Make the sleeves look originally manufactured this way.`);
      if (selectedCollar) parts.push(`Change the collar style to a ${selectedCollar}. Adapt the neckline naturally.`);
      if (selectedFit)    parts.push(`Change the fit to ${selectedFit}. The garment should look naturally ${selectedFit}.`);
      if (selectedLength) parts.push(`Change the garment body length to ${selectedLength}.`);
      return `Edit this garment image. ${parts.join(" ")} Keep all colors, patterns, logos, and design elements exactly the same. Photorealistic. Dark background.`;
    }
    return "";
  };

  // ── View-switch generate via Pollinations (no crossOrigin needed — just display URL) ──
  const generateViewWithPollinations = async (viewPrompt: string, view: string): Promise<string> => {
    const styles = currentStyleModifiersRef.current;
    const styleParts = STYLE_TAGS.filter(t => styles.includes(t.label)).map(t => t.prompt).join(", ");
    const promptBase = viewPrompt || currentPromptRef.current;
    const full = [promptBase, styleParts, `${view} view`, "apparel graphic design, professional product mockup, dark background, high quality"].filter(Boolean).join(", ");
    const seed = Math.floor(Math.random() * 99999);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(full)}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;
    // Load without crossOrigin so CORS never blocks it; we just need the URL for display
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // resolve anyway — browser will still display the URL
      img.src = url;
      setTimeout(() => resolve(), 45000);
    });
    return url;
  };

  // ── Handle view tab click ──
  const handleViewChange = async (newView: string) => {
    if (newView === currentView) return;
    setActiveAngle(newView);
    setCurrentView(newView);

    if (!generatedImageUrl) return;

    if (viewCache[newView]) {
      setGeneratedImageUrl(viewCache[newView]);
      return;
    }

    const prevImageUrl = generatedImageUrl;
    const prevView = currentView; // capture for rollback
    setIsViewSwitching(true);
    const viewKey = newView.toLowerCase();

    // Read stable values from refs (avoids stale closure issue)
    const prompt = currentPromptRef.current;
    const styles = currentStyleModifiersRef.current;
    const gType  = garmentTypeRef.current;
    const gColor = garmentColorRef.current;

    try {
      if (geminiKey) {
        const res = await fetch("/api/generate-design", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-gemini-key": geminiKey },
          body: JSON.stringify({ prompt, styleModifiers: styles, garmentType: gType, garmentColor: gColor, view: viewKey }),
        });
        const resData = await res.json().catch(() => ({}));
        if (res.ok && resData.imageUrl) {
          setViewCache(prev => ({ ...prev, [newView]: resData.imageUrl }));
          setGeneratedImageUrl(resData.imageUrl);
          return;
        }
      }
      // Pollinations fallback — no CORS constraint, returns URL for display
      const imgUrl = await generateViewWithPollinations(prompt, viewKey);
      setViewCache(prev => ({ ...prev, [newView]: imgUrl }));
      setGeneratedImageUrl(imgUrl);
    } catch {
      setCurrentView(prevView);
      setActiveAngle(prevView);
      setGeneratedImageUrl(prevImageUrl);
      toast({ title: "Could not load this view", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsViewSwitching(false);
    }
  };

  // ── Pollinations (client-side, with canvas→base64 conversion for editing) ──
  const generateWithPollinations = async (promptWithProduct: string, finalPrompt: string) => {
    const styleParts = STYLE_TAGS.filter(t => selectedStyles.includes(t.label)).map(t => t.prompt).join(", ");
    const full = [promptWithProduct, styleParts, "apparel graphic design, professional product mockup, dark background, high quality"].filter(Boolean).join(", ");
    const seed = Math.floor(Math.random() * 99999);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(full)}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;

    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = url;
      setTimeout(() => reject(new Error("Image load timed out")), 45000);
    });

    let imageDataUrl: string;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 1024;
      canvas.height = img.naturalHeight || 1024;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    } catch {
      imageDataUrl = url;
    }

    setGeneratedImageUrl(imageDataUrl);
    addToHistory(finalPrompt, imageDataUrl, "Generated");
    setUndoStack([]);
    setViewCache({ Front: imageDataUrl });
    toast({ title: "Design ready!", description: "Generated with Pollinations AI. Add a Gemini key for AI editing." });
  };

  // ── Generate ──
  const doGenerate = async (finalPrompt: string, _fallback = false) => {
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setViewCache({});
    setCurrentView("Front");
    setActiveAngle("Front");
    resetPos();

    const savedPrompt = finalPrompt;
    const savedStyles = [...selectedStyles];
    setCurrentPrompt(savedPrompt);
    setCurrentStyleModifiers(savedStyles);
    // Keep refs in sync so async closures always read the latest values
    currentPromptRef.current = savedPrompt;
    currentStyleModifiersRef.current = savedStyles;
    garmentTypeRef.current = garmentType;
    garmentColorRef.current = garmentColor.label;

    const productSuffix = selectedProductData ? ` on a ${garmentColor.label} ${selectedProductData.name}` : "";
    const promptWithProduct = finalPrompt + productSuffix;

    const cacheAndPrefetch = (imageUrl: string) => {
      setViewCache({ Front: imageUrl });
      if (geminiKey) {
        setTimeout(async () => {
          try {
            const res = await fetch("/api/generate-design", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-gemini-key": geminiKey },
              body: JSON.stringify({ prompt: promptWithProduct, styleModifiers: savedStyles, garmentType, garmentColor: garmentColor.label, view: "back" }),
            });
            const d = await res.json().catch(() => ({}));
            if (res.ok && d.imageUrl) setViewCache(prev => ({ ...prev, Back: d.imageUrl }));
          } catch { /* silent */ }
        }, 2000);
      }
    };

    try {
      if (geminiKey) {
        const res = await fetch("/api/generate-design", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-gemini-key": geminiKey },
          body: JSON.stringify({ prompt: promptWithProduct, styleModifiers: savedStyles, garmentType, garmentColor: garmentColor.label, view: "front" }),
        });
        const resData = await res.json().catch(() => ({}));

        if (res.ok && resData.imageUrl) {
          setGeneratedImageUrl(resData.imageUrl);
          addToHistory(finalPrompt, resData.imageUrl, "Generated");
          setUndoStack([]);
          cacheAndPrefetch(resData.imageUrl);
          toast({ title: "Design generated!", description: "Your garment visualization is ready." });
          return;
        }

        if (resData.code === "INVALID_KEY") {
          toast({ title: "API key issue", description: resData.error, variant: "destructive" });
          setApiKeyOpen(true);
          setTimeout(() => apiKeyRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 200);
          return;
        }

        toast({ title: "Switching to Pollinations AI", description: "Gemini unavailable — using free AI instead.", variant: "default" });
      }

      await generateWithPollinations(promptWithProduct, finalPrompt);
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message || "Try again", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    doGenerate(prompt.trim());
  };

  const handleGenWithPollinations = () => {
    if (!prompt.trim()) return;
    doGenerate(prompt.trim());
  };

  const handleQuickChip = (chip: typeof QUICK_CHIPS[0]) => {
    setPrompt(chip.prompt);
    setTimeout(() => doGenerate(chip.prompt), 50);
  };

  const handleRegenerate = () => {
    const combined = refinePrompt.trim() ? `${prompt.trim()}, ${refinePrompt.trim()}` : prompt.trim();
    doGenerate(combined);
  };

  // ── Strip logo/brand references from prompt for clean regeneration ──
  const stripLogoKeywords = (p: string): string =>
    p.replace(/\b(logo|badge|emblem|crest|badge|patch|brand|adidas|nike|puma|reebok|under armour|hummel|joma|kappa|star|stripes?|flag|insignia|coat of arms|symbol|mark|label|print|graphics?)\b/gi, "")
     .replace(/\s{2,}/g, " ")
     .trim();

  const buildLogoRemovalPollinationsUrl = (basePrompt: string): string => {
    const cleanedPrompt = stripLogoKeywords(basePrompt);
    const combined = [
      cleanedPrompt,
      "plain fabric surface, no logos, no text, no prints, no badges, no emblems",
      "professional product mockup, dark background, high quality",
    ].filter(Boolean).join(", ");
    const negativeText = "logo,badge,emblem,crest,star,patch,brand name,label,screen print,text,lettering,insignia,coat of arms";
    const seed = Math.floor(Math.random() * 99999);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(combined)}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux&negative_prompt=${encodeURIComponent(negativeText)}`;
  };

  // ── Apply Edit ──
  const handleApplyEdit = async () => {
    if (!generatedImageUrl) {
      toast({ title: "No design to edit", description: "Generate a design first, then use the edit tools.", variant: "destructive" }); return;
    }
    const editPrompt = buildEditPrompt(); if (!editPrompt) return;

    // Build a simplified prompt suffix for Pollinations fallback
    const buildPollinationsEditSuffix = (): string => {
      const parts: string[] = [];
      if (editTab === "structure") {
        if (selectedSleeve) parts.push(selectedSleeve.toLowerCase());
        if (selectedCollar) parts.push(`${selectedCollar.toLowerCase()} collar`);
        if (selectedFit) parts.push(`${selectedFit.toLowerCase()} fit`);
        if (selectedLength) parts.push(`${selectedLength.toLowerCase()} length`);
      }
      if (editTab === "colors" && pendingColorEdits.length > 0) {
        parts.push(pendingColorEdits.map(e => `${e.part} in ${e.colorLabel}`).join(", "));
      }
      if (editTab === "logos" && removeBrand) parts.push("no brand logos, clean fabric");
      return parts.filter(Boolean).join(", ");
    };

    // Pollinations regeneration with edit baked into prompt
    const applyWithPollinations = async () => {
      const basePrompt = currentPromptRef.current || prompt.trim();

      // Logo removal gets a special URL that strips brand words + uses negative_prompt
      let url: string;
      if (editTab === "logos" && removeBrand) {
        url = buildLogoRemovalPollinationsUrl(basePrompt);
      } else {
        const suffix = buildPollinationsEditSuffix();
        const combined = [basePrompt, suffix, "apparel graphic design, professional product mockup, dark background, high quality"].filter(Boolean).join(", ");
        const seed = Math.floor(Math.random() * 99999);
        url = `https://image.pollinations.ai/prompt/${encodeURIComponent(combined)}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;
      }
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
        setTimeout(() => resolve(), 45000);
      });
      setGeneratedImageUrl(url);
      setViewCache(prev => ({ ...prev, [currentView]: url }));
      addToHistory(editPrompt, url, "Edited");
      setPendingColorEdits([]); setSelectedPart(null); setSelectedColor(null);
      setRemoveBrand(false); setLogoUploadBase64(null);
      setSelectedSleeve(null); setSelectedCollar(null); setSelectedFit(null); setSelectedLength(null);
      toast({ title: "Edit applied!", description: "Your garment has been updated." });
    };

    // Logo-add always requires Gemini (binary image injection)
    if (editTab === "logos" && logoUploadBase64 && !geminiKey) {
      setApiKeyOpen(true);
      setTimeout(() => apiKeyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
      toast({ title: "API key required", description: "Logo placement requires a Gemini API key.", variant: "destructive" }); return;
    }

    let msgSet = EDIT_MESSAGES.colors;
    if (editTab==="logos") msgSet = logoUploadBase64 ? EDIT_MESSAGES.logos_add : EDIT_MESSAGES.logos_remove;
    if (editTab==="structure") msgSet = EDIT_MESSAGES.structure;
    setEditMsgSet(msgSet);
    const currentLabel: "Generated"|"Edited" = undoStack.length===0?"Generated":"Edited";
    setUndoStack(prev => [{ id:Date.now().toString(), prompt, imageUrl:generatedImageUrl!, timestamp:Date.now(), label:currentLabel }, ...prev].slice(0,10));
    setIsEditing(true);

    const imageData = getImageBase64();

    try {
      // Try Gemini if we have both a key and base64 image data
      if (geminiKey && imageData) {
        const res = await fetch("/api/edit-design", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-gemini-key": geminiKey },
          body: JSON.stringify({ currentImageBase64:imageData.base64, currentImageMimeType:imageData.mimeType, editPrompt, logoBase64:logoUploadBase64, logoMimeType:logoUploadMimeType }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.imageUrl) {
          setGeneratedImageUrl(data.imageUrl);
          addToHistory(editPrompt, data.imageUrl, "Edited");
          setViewCache(prev => ({ ...prev, [currentView]: data.imageUrl }));
          setPendingColorEdits([]); setSelectedPart(null); setSelectedColor(null);
          setRemoveBrand(false); setLogoUploadBase64(null);
          setSelectedSleeve(null); setSelectedCollar(null); setSelectedFit(null); setSelectedLength(null);
          toast({ title: "Edit applied!", description: "Your garment has been updated." });
          return;
        }
        if (data.code === "NO_API_KEY" || data.code === "INVALID_KEY") {
          setUndoStack(prev => prev.slice(1));
          setApiKeyOpen(true);
          toast({ title: "API key issue", description: data.error, variant: "destructive" }); return;
        }
        if (data.code === "RATE_LIMIT") {
          setUndoStack(prev => prev.slice(1));
          toast({ title: "Rate limit", description: data.error, variant: "destructive" }); return;
        }
        // Gemini failed for another reason — fall through to Pollinations below
        toast({ title: "Switching to AI regeneration", description: "Gemini unavailable — applying edit via free AI.", variant: "default" });
      }

      // Pollinations fallback: regenerate with edit baked into prompt
      await applyWithPollinations();
    } catch (err: any) {
      setUndoStack(prev => prev.slice(1));
      toast({ title: "Edit failed", description: err.message || "Try again", variant: "destructive" });
    } finally { setIsEditing(false); }
  };

  const handleUndo = () => {
    if (undoStack.length===0) return;
    const [prev, ...rest] = undoStack;
    setGeneratedImageUrl(prev.imageUrl); setUndoStack(rest);
    toast({ title: "Undo applied" });
  };

  // ── Natural language edit (core — skips clarification check) ──
  const applyNlEdit = async (instruction: string) => {
    if (!generatedImageUrl) {
      toast({ title: "Generate a design first", description: "Then describe your edit below.", variant: "destructive" }); return;
    }
    if (!instruction.trim()) return;

    const analysis = analyzeEditInstruction(instruction);
    const editPrompt = buildPreciseEditPrompt(instruction);

    // Pollinations fallback: bake instruction into the regeneration prompt
    const applyNlWithPollinations = async (): Promise<string> => {
      const base = currentPromptRef.current || prompt.trim();
      const isLogoRemoval = analysis.targetParts.includes("logo") && /remove|erase|delete|clean|strip/i.test(instruction);

      const url = isLogoRemoval
        ? buildLogoRemovalPollinationsUrl(base)
        : (() => {
            const combined = [base, instruction, "apparel graphic design, professional product mockup, dark background, high quality"].filter(Boolean).join(", ");
            const seed = Math.floor(Math.random() * 99999);
            return `https://image.pollinations.ai/prompt/${encodeURIComponent(combined)}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;
          })();
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
        setTimeout(() => resolve(), 45000);
      });
      return url;
    };

    setEditMsgSet(EDIT_MESSAGES.natural);
    setNlInstruction(instruction);
    const lbl: "Generated"|"Edited" = undoStack.length===0?"Generated":"Edited";
    setUndoStack(prev => [{ id:Date.now().toString(), prompt, imageUrl:generatedImageUrl!, timestamp:Date.now(), label:lbl }, ...prev].slice(0,10));
    setIsEditing(true);

    try {
      const imageData = getImageBase64();
      if (geminiKey && imageData) {
        const res = await fetch("/api/edit-design", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-gemini-key": geminiKey },
          body: JSON.stringify({ currentImageBase64: imageData.base64, currentImageMimeType: imageData.mimeType, editPrompt }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.imageUrl) {
          setGeneratedImageUrl(data.imageUrl);
          setViewCache(prev => ({ ...prev, [currentView]: data.imageUrl }));
          addToHistory(instruction, data.imageUrl, "Edited");
          const parts = analysis.targetParts.length > 0 ? `Changed: ${analysis.targetParts.join(" + ")}` : "Edit applied";
          toast({ title: parts, description: `"${instruction}"` });
          return;
        }
        if (data.code === "INVALID_KEY" || data.code === "NO_API_KEY") {
          setUndoStack(prev => prev.slice(1));
          setApiKeyOpen(true);
          toast({ title: "API key issue", description: data.error, variant: "destructive" }); return;
        }
        if (data.code === "RATE_LIMIT") {
          setUndoStack(prev => prev.slice(1));
          toast({ title: "Rate limit", description: data.error, variant: "destructive" }); return;
        }
        toast({ title: "Switching to AI regeneration", description: "Applying edit via free AI...", variant: "default" });
      }
      const newUrl = await applyNlWithPollinations();
      setGeneratedImageUrl(newUrl);
      setViewCache(prev => ({ ...prev, [currentView]: newUrl }));
      addToHistory(instruction, newUrl, "Edited");
      const parts2 = analysis.targetParts.length > 0 ? `Changed: ${analysis.targetParts.join(" + ")}` : "Edit applied";
      toast({ title: parts2, description: `"${instruction}"` });
    } catch (err: any) {
      setUndoStack(prev => prev.slice(1));
      toast({ title: "Edit failed", description: err.message || "Try again", variant: "destructive" });
    } finally {
      setIsEditing(false);
      setNlInstruction("");
    }
  };

  // ── handleNaturalLanguageEdit: does clarification check then delegates to applyNlEdit ──
  const handleNaturalLanguageEdit = async (instruction: string) => {
    const analysis = analyzeEditInstruction(instruction);
    if (!analysis.isSpecificPart && analysis.changeType === "color") {
      setShowPartClarification({ instruction, color: extractColor(instruction) });
      return;
    }
    await applyNlEdit(instruction);
  };

  const handleEditQuickChip = (type: string) => {
    if (type==="color") setEditTab("colors");
    else if (type==="logo") { setEditTab("logos"); setRemoveBrand(false); }
    else if (type==="remove-brand") { setEditTab("logos"); setRemoveBrand(true); }
    else if (type==="full-sleeve") { setEditTab("structure"); setSelectedSleeve("Long Sleeve"); }
    else if (type==="half-sleeve") { setEditTab("structure"); setSelectedSleeve("Short Sleeve"); }
    setTimeout(() => {
      editPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  const saveGeminiKey = () => {
    if (!keyInput.trim()) return;
    localStorage.setItem("gemini_api_key", keyInput.trim());
    setGeminiKey(keyInput.trim()); setKeyInput("");
    notifyKeyChange();
    toast({ title: "✓ Gemini AI connected!", description: "Full generation and editing now available." });
  };

  const clearGeminiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setGeminiKey("");
    notifyKeyChange();
    toast({ title: "API key removed" });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await createDesign.mutateAsync({ data: { name:designName, productId:selectedProduct?parseInt(selectedProduct):null, designData:JSON.stringify({garmentColor:garmentColor.value,size:selectedSize,fabric:selectedFabric,gsm:selectedGsm,prompt,styles:selectedStyles}), prompt:prompt||null, previewUrl:generatedImageUrl||null } });
      toast({ title: "Design saved!" });
    } catch { toast({ title: "Save failed", variant: "destructive" }); }
    finally { setIsSaving(false); }
  };

  const handleAddToQuote = () => {
    sessionStorage.setItem("quoteProduct", JSON.stringify({ productId:selectedProduct, garmentColor:garmentColor.label, size:selectedSize, fabric:selectedFabric, gsm:selectedGsm, designImageUrl:generatedImageUrl||uploadedImage }));
    setLocation("/quote");
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setUploadedImage(ev.target?.result as string); setGeneratedImageUrl(null); setIsAccepted(false); resetPos(); toast({ title: "Logo uploaded!", description: "Drag to reposition." }); };
    reader.readAsDataURL(file);
  };

  const panelInput = "bg-[#0a0a0a] border-[rgba(167,139,250,0.2)] text-sm focus:border-[#C9A84C] text-white";

  const leftPanelContent = (
    <ProductPanel
      products={products}
      selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct}
      selectedSize={selectedSize} setSelectedSize={setSelectedSize}
      selectedFabric={selectedFabric} setSelectedFabric={setSelectedFabric}
      selectedGsm={selectedGsm} setSelectedGsm={setSelectedGsm}
      garmentColor={garmentColor} setGarmentColor={setGarmentColor}
      brandLabel={brandLabel} setBrandLabel={setBrandLabel}
    />
  );

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 64px)" }}>

      {/* ── Header ── */}
      <div className="shrink-0 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap"
        style={{ borderBottom: "1px solid rgba(167,139,250,0.15)", background: "rgba(10,10,10,0.95)", backdropFilter: "blur(16px)" }}>

        {/* Mobile drawer trigger */}
        <button className="lg:hidden flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold"
          style={{ border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa", padding: "6px 12px" }}
          onClick={() => setShowMobileDrawer(true)}>
          <Menu className="h-3.5 w-3.5" /> Product Options
        </button>

        <h1 className="hidden lg:block font-display text-xl tracking-widest uppercase text-white">AI Design Studio</h1>

        <div className="flex items-center gap-2 flex-wrap ml-auto">
          <Input value={designName} onChange={e => setDesignName(e.target.value)}
            className={`w-32 h-8 text-sm ${panelInput}`} placeholder="Design name..." />
          <button onClick={handleSave} disabled={isSaving}
            className="flex items-center gap-1.5 h-8 px-3 text-[11px] font-bold uppercase tracking-wider transition-all"
            style={{ border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C" }}>
            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
          </button>
          <button onClick={handleAddToQuote} disabled={!generatedImageUrl && !uploadedImage}
            className="flex items-center gap-1.5 h-8 px-3 text-[11px] font-bold uppercase tracking-wider disabled:opacity-40"
            style={{ background: "#C9A84C", color: "#0a0a0a" }}>
            <ShoppingCart className="h-3 w-3" /> Add to Quote
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowMobileDrawer(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 overflow-y-auto flex flex-col"
            style={{ background: "#0e0e0e", borderRight: "1px solid rgba(167,139,250,0.15)" }}>
            <div className="flex items-center justify-between p-4 shrink-0" style={{ borderBottom: "1px solid rgba(167,139,250,0.15)" }}>
              <span className="font-display text-sm tracking-widest uppercase" style={{ color: "#a78bfa" }}>Product Options</span>
              <button onClick={() => setShowMobileDrawer(false)} className="text-[#555] hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">{leftPanelContent}</div>
          </div>
        </div>
      )}

      {/* ── Three-panel body ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

        {/* ── LEFT PANEL (desktop only) ── */}
        <div className="hidden lg:flex w-60 shrink-0 flex-col overflow-y-auto" style={{ background: "#0e0e0e", borderRight: "1px solid rgba(167,139,250,0.1)" }}>
          {leftPanelContent}
        </div>

        {/* ── CENTER (Canvas) ── */}
        <div className="flex-1 flex flex-col items-center justify-start p-4 overflow-y-auto" style={{ background: "#0a0a0a" }}>

          {/* Angle tabs */}
          <div className="flex gap-1 mb-4 w-full justify-center flex-wrap">
            {ANGLES.map(angle => {
              const isActive = currentView === angle;
              const isCached = !!viewCache[angle];
              const isThisLoading = isViewSwitching && currentView === angle;
              return (
                <button key={angle}
                  onClick={() => handleViewChange(angle)}
                  disabled={isViewSwitching}
                  className="relative px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest border transition-all"
                  style={{
                    borderColor: isActive ? "#C9A84C" : isCached ? "rgba(201,168,76,0.4)" : "rgba(167,139,250,0.2)",
                    backgroundColor: isActive ? "#C9A84C" : "transparent",
                    color: isActive ? "#0a0a0a" : isCached ? "#C9A84C" : "#888",
                    boxShadow: isActive ? "0 0 12px rgba(201,168,76,0.3)" : "none",
                    opacity: isViewSwitching && !isActive ? 0.5 : 1,
                    cursor: isViewSwitching ? "wait" : "pointer",
                  }}>
                  {isThisLoading ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> ...
                    </span>
                  ) : (
                    <>
                      {angle}
                      {isCached && !isActive && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: "#C9A84C" }} />
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Canvas */}
          <div ref={canvasRef} className="relative select-none overflow-hidden"
            style={{
              width: 320 * zoom, height: 320 * zoom, maxWidth: "100%",
              border: "1px solid rgba(201,168,76,0.25)",
              boxShadow: "0 0 40px rgba(201,168,76,0.06)", background: "#111",
            }}>

            {/* AI-Generated → fills entire canvas */}
            {hasGeneratedImage && !isGenerating && (
              <img src={generatedImageUrl!} alt="AI-generated garment"
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: "contain", background: "#111" }}
                data-testid="generated-fullscreen-image" />
            )}

            {/* No generated image → garment silhouette */}
            {!hasGeneratedImage && (
              <div className="absolute inset-0">
                <GarmentSVG angle={activeAngle} color={garmentColor.value} />
              </div>
            )}

            {/* Uploaded logo overlay (on silhouette only) */}
            {hasUploadedLogo && !hasGeneratedImage && (
              <DraggableDesign imageUrl={uploadedImage!} canvasRef={canvasRef}
                pos={currentPos} onPosChange={p => setPos(activeAngle, p)} isLocked={isAccepted} />
            )}

            {/* Text overlay */}
            {customText && !hasGeneratedImage && (
              <div className="absolute pointer-events-none flex items-end justify-center z-20"
                style={{ bottom: "18%", left: "10%", right: "10%", textAlign: "center" }}>
                <span className="font-display text-2xl tracking-widest" style={{ color: textColor, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
                  {customText}
                </span>
              </div>
            )}

            {/* View-switching overlay (ghost of previous image) */}
            {isViewSwitching && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
                {generatedImageUrl && (
                  <img src={generatedImageUrl} alt="" className="absolute inset-0 w-full h-full"
                    style={{ objectFit: "contain", opacity: 0.3 }} />
                )}
                <div className="absolute inset-0" style={{ background: "rgba(10,10,10,0.65)" }} />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                  <p className="font-display text-sm tracking-widest uppercase" style={{ color: "#C9A84C" }}>
                    {(VIEW_SWITCH_MESSAGES[currentView] || ["Loading..."])[viewSwitchMsgIdx % (VIEW_SWITCH_MESSAGES[currentView]?.length || 1)]}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
                  <div className="h-full w-1/2 animate-gen-progress" style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }} />
                </div>
              </div>
            )}

            {/* Generating/Editing overlay */}
            {(isGenerating || isEditing) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 overflow-hidden"
                style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(4px)" }}>
                <ScanLine />
                <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mb-4 relative z-10" />
                <p className="font-display text-sm tracking-widest uppercase relative z-10" style={{ color: "#a78bfa" }}>
                  {isEditing ? currentEditMsg : GENERATING_MESSAGES[genMessageIdx]}
                </p>
                {/* Show NL instruction text during natural language edit */}
                {nlInstruction && (
                  <p className="text-[11px] mt-2 px-6 text-center relative z-10 italic leading-relaxed" style={{ color: "#C9A84C", maxWidth: "260px" }}>
                    "{nlInstruction}"
                  </p>
                )}
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
                  <div className="h-full w-1/2 animate-gen-progress" style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }} />
                </div>
              </div>
            )}

            {/* Enhanced empty state */}
            {!hasGeneratedImage && !hasUploadedLogo && !isGenerating && !customText && (
              <div className="absolute inset-0 animate-canvas-pulse flex flex-col items-center justify-center z-10 pointer-events-none">
                <div className="text-center px-6 pointer-events-auto">
                  <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}>
                    <Zap className="h-7 w-7 text-shadow-gold" style={{ color: "#C9A84C" }} />
                  </div>
                  <p className="font-display text-xl tracking-widest uppercase mb-1" style={{ color: "#555" }}>
                    Your Design Appears Here
                  </p>
                  <p className="text-[10px] mb-4" style={{ color: "#333" }}>
                    Type a prompt and click Generate, or upload your logo
                  </p>
                  <div className="flex flex-col gap-2 mb-4">
                    {QUICK_CHIPS.map(chip => (
                      <button key={chip.label} onClick={() => handleQuickChip(chip)}
                        className="px-3 py-2 text-[10px] uppercase tracking-wider border transition-all text-left"
                        style={{ border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa", background: "rgba(167,139,250,0.04)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.1)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.5)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.25)"; }}>
                        {chip.icon} {chip.label}
                      </button>
                    ))}
                  </div>
                  <div className="text-[9px] uppercase tracking-widest" style={{ color: "#2a2a2a" }}>
                    Or switch to Upload tab to place your logo
                  </div>
                </div>
              </div>
            )}

            {/* Upload drag hint */}
            {hasUploadedLogo && !hasGeneratedImage && !isAccepted && !isGenerating && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none z-20">
                <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest" style={{ background: "rgba(0,0,0,0.8)", color: "#C9A84C" }}>
                  Drag · Scroll to resize
                </span>
              </div>
            )}

            {/* Locked badge */}
            {isAccepted && hasUploadedLogo && !hasGeneratedImage && (
              <div className="absolute top-2 right-2 z-20 flex items-center gap-1 px-2 py-0.5" style={{ background: "rgba(201,168,76,0.9)" }}>
                <CheckCircle className="h-3 w-3 text-black" />
                <span className="text-[9px] text-black font-bold uppercase tracking-widest">Locked</span>
              </div>
            )}

            {/* View badge */}
            <div className="absolute top-2 left-2 z-20">
              <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5" style={{ background: "rgba(0,0,0,0.7)", color: "rgba(167,139,250,0.8)" }}>
                {currentView}
              </span>
            </div>
          </div>

          {/* Controls below canvas */}
          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            {hasUploadedLogo && !hasGeneratedImage && !isAccepted && (
              <button onClick={() => setIsAccepted(true)}
                className="h-8 px-4 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ background: "#C9A84C", color: "#0a0a0a" }}>
                <CheckCircle className="h-3.5 w-3.5" /> Lock Position
              </button>
            )}
            {hasUploadedLogo && !hasGeneratedImage && isAccepted && (
              <button onClick={() => setIsAccepted(false)}
                className="h-8 px-4 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
                <MoveIcon className="h-3.5 w-3.5" /> Unlock
              </button>
            )}
            {[
              { icon: ZoomOut,   action: () => setZoom(z=>Math.max(0.4,+(z-0.1).toFixed(1))), tip: "-" },
              { icon: ZoomIn,    action: () => setZoom(z=>Math.min(2,  +(z+0.1).toFixed(1))), tip: "+" },
              { icon: RotateCcw, action: () => setZoom(1),                                     tip: "⟳" },
            ].map(({ icon: Icon, action, tip }) => (
              <button key={tip} onClick={action} className="p-1.5 transition-colors text-[#555] hover:text-[#C9A84C]"
                style={{ border: "1px solid rgba(167,139,250,0.15)" }}>
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
            <span className="text-[11px] text-[#555] w-10 text-center">{Math.round(zoom*100)}%</span>
          </div>

          {/* Natural language edit input — below canvas (Place 1) */}
          {hasGeneratedImage && !isGenerating && (
            <div className="w-full max-w-sm mt-4" style={{ border: "1px solid rgba(167,139,250,0.2)", borderTop: "2px solid #a78bfa", background: "#0f0f0f" }}>
              <div className="px-3 pt-3 pb-1">
                <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: "#a78bfa" }}>✏ Describe Your Edit</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nlEditText}
                    onChange={e => setNlEditText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && nlEditText.trim() && !isEditing) { handleNaturalLanguageEdit(nlEditText.trim()); setNlEditText(""); } }}
                    disabled={isEditing}
                    placeholder={NL_PLACEHOLDERS[placeholderIdx]}
                    className="flex-1 text-[12px] bg-[#1a1a1a] text-white px-3 py-2 outline-none"
                    style={{ border: "1px solid rgba(167,139,250,0.2)", fontFamily: "Inter, sans-serif" }}
                    onFocus={e => (e.target.style.borderColor = "#a78bfa")}
                    onBlur={e => (e.target.style.borderColor = "rgba(167,139,250,0.2)")}
                  />
                  <button
                    onClick={() => { if (nlEditText.trim() && !isEditing) { handleNaturalLanguageEdit(nlEditText.trim()); setNlEditText(""); } }}
                    disabled={!nlEditText.trim() || isEditing}
                    className="px-4 text-sm font-bold transition-all"
                    style={{ background: nlEditText.trim() && !isEditing ? "#a78bfa" : "#1a1a1a", color: nlEditText.trim() && !isEditing ? "#000" : "#444", cursor: nlEditText.trim() && !isEditing ? "pointer" : "not-allowed" }}>
                    {isEditing ? "..." : "→"}
                  </button>
                </div>
                {/* Part clarification UI */}
                {showPartClarification && (
                  <div className="mt-2" style={{ background: "#111", border: "1px solid rgba(201,168,76,0.3)", padding: "10px" }}>
                    <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: "#C9A84C" }}>
                      WHICH PART? — Make {showPartClarification.color} on...
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["Sleeves","Body / Chest","Collar","Cuffs","Side Stripes","Full Garment"].map(part => (
                        <button key={part} onClick={() => {
                          const refined = `make the ${part.toLowerCase()} ${showPartClarification.color}`;
                          setShowPartClarification(null);
                          applyNlEdit(refined);
                        }}
                          className="text-[10px] px-3 py-1.5 transition-all"
                          style={{ background: "transparent", border: "1px solid rgba(167,139,250,0.4)", color: "#a78bfa", cursor: "pointer", letterSpacing: "0.5px" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.08)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                          {part}
                        </button>
                      ))}
                      <button onClick={() => setShowPartClarification(null)}
                        className="text-[10px] px-3 py-1.5"
                        style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(showAllNlSuggestions ? NL_SUGGESTIONS : NL_SUGGESTIONS.slice(0, 5)).map(s => (
                    <button key={s} onClick={() => setNlEditText(s)}
                      className="text-[9px] px-2 py-1 transition-all"
                      style={{ border: "1px solid rgba(167,139,250,0.2)", color: "#555", background: "transparent" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.5)"; (e.currentTarget as HTMLElement).style.color = "#a78bfa"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.2)"; (e.currentTarget as HTMLElement).style.color = "#555"; }}>
                      {s}
                    </button>
                  ))}
                  <button onClick={() => setShowAllNlSuggestions(v => !v)}
                    className="text-[9px] px-2 py-1"
                    style={{ border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C", background: "transparent" }}>
                    {showAllNlSuggestions ? "less" : "more..."}
                  </button>
                </div>
                <p className="text-[9px] mt-2 pb-2" style={{ color: "#333", letterSpacing: "0.5px" }}>
                  Say which part to change · Press Enter or → to apply
                </p>
              </div>
            </div>
          )}

          {/* Product Info Card */}
          {selectedProductData && (
            <div className="w-full max-w-sm mt-3"
              style={{ background: "#111", borderTop: "2px solid #C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}>
              <div className="p-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm truncate">{selectedProductData.name}</p>
                  <p className="text-[10px] mt-0.5 truncate" style={{ color: "#C9A84C" }}>{selectedProductData.category}</p>
                  <p className="text-[10px] mt-1 text-[#555]">
                    From PKR {Number(selectedProductData.basePricePkr).toLocaleString()}
                  </p>
                </div>
                <Link href={`/quote?product=${selectedProductData.id}`}
                  className="shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-3 py-2 whitespace-nowrap transition-all"
                  style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.2)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.1)"; }}>
                  Get Bulk Quote <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {/* ── Session History ── */}
          {designHistory.length > 0 && (
            <div className="w-full mt-4 max-w-sm">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <History className="h-3 w-3" style={{ color: "#a78bfa" }} />
                  <span className="text-[9px] uppercase tracking-widest" style={{ color: "#555" }}>
                    Session History ({designHistory.length})
                  </span>
                </div>
                <button onClick={() => setDesignHistory([])}
                  className="text-[9px] uppercase tracking-widest text-[#333] hover:text-red-400 transition-colors flex items-center gap-1">
                  <X className="h-2.5 w-2.5" /> Clear
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {designHistory.map(item => (
                  <div key={item.id} className="shrink-0 relative group cursor-pointer" title={item.prompt}
                    onClick={() => { setGeneratedImageUrl(item.imageUrl); setUndoStack([]); }}>
                    <img src={item.imageUrl} alt={item.prompt}
                      className="w-[72px] h-[72px] object-cover border-2 transition-all"
                      style={{ borderColor: generatedImageUrl===item.imageUrl?"#C9A84C":"rgba(167,139,250,0.2)" }}
                      onMouseEnter={e => { if (generatedImageUrl!==item.imageUrl) (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.6)"; }}
                      onMouseLeave={e => { if (generatedImageUrl!==item.imageUrl) (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.2)"; }} />
                    <span className="absolute bottom-0 left-0 right-0 text-center text-[7px] uppercase tracking-wider py-0.5"
                      style={{ background:"rgba(0,0,0,0.8)", color:item.label==="Edited"?"#a78bfa":"#C9A84C" }}>
                      {item.label}
                    </span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-40 py-1 px-2 text-[9px] leading-tight opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                      style={{ background:"rgba(17,17,17,0.95)", border:"1px solid rgba(167,139,250,0.3)", color:"#a0a0a0" }}>
                      {item.prompt.slice(0,80)}{item.prompt.length>80?"...":""}
                    </div>
                    <div className="absolute inset-0 bottom-5 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <RefreshCw className="h-3 w-3 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div ref={rightPanelRef} className="w-full lg:w-80 shrink-0 overflow-y-auto flex flex-col"
          style={{ background: "#0e0e0e", borderLeft: "1px solid rgba(167,139,250,0.1)" }}>

          <Tabs defaultValue="ai" className="w-full flex-1 flex flex-col">
            <TabsList className="w-full rounded-none h-10 shrink-0"
              style={{ background: "rgba(10,10,10,0.5)", borderBottom: "1px solid rgba(167,139,250,0.15)" }}>
              {[
                { value:"ai",     label:"AI",     Icon:Wand2  },
                { value:"upload", label:"Upload", Icon:Upload },
                { value:"text",   label:"Text",   Icon:Type   },
              ].map(({ value, label, Icon }) => (
                <TabsTrigger key={value} value={value}
                  className="flex-1 rounded-none font-display tracking-wider uppercase text-[11px] data-[state=active]:text-[#C9A84C] data-[state=active]:border-b-2 data-[state=active]:border-[#C9A84C]">
                  <Icon className="h-3 w-3 mr-1" /> {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── AI Tab ── */}
            <TabsContent value="ai" className="flex-1 flex flex-col gap-0 m-0">
              <div className="p-4 flex flex-col gap-4">

                {/* Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-[9px] uppercase tracking-[0.25em]" style={{ color: "#a78bfa" }}>Describe Your Design</Label>
                    <span className={`text-[10px] ${prompt.length > MAX_PROMPT*0.9 ? "text-red-400" : "text-[#555]"}`}>{prompt.length}/{MAX_PROMPT}</span>
                  </div>
                  <Textarea value={prompt} onChange={e => setPrompt(e.target.value.slice(0,MAX_PROMPT))}
                    placeholder="e.g. A vintage eagle with lightning bolts, gothic lettering..."
                    className={`resize-none min-h-[90px] text-sm ${panelInput}`} />
                  {selectedProductData && (
                    <p className="text-[9px] mt-1.5" style={{ color: "#555" }}>
                      Will generate on: <span style={{ color: "#C9A84C" }}>{garmentColor.label} {selectedProductData.name}</span>
                    </p>
                  )}
                </div>

                {/* Style modifiers */}
                <div>
                  <Label className="text-[9px] uppercase tracking-[0.25em] mb-2 block" style={{ color: "#a78bfa" }}>Style Modifiers</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {STYLE_TAGS.map(tag => (
                      <button key={tag.label} onClick={() => toggleStyle(tag.label)}
                        className="px-2.5 py-1 text-[11px] font-bold border transition-all uppercase tracking-wider"
                        style={{ borderColor:selectedStyles.includes(tag.label)?"#a78bfa":"rgba(167,139,250,0.2)", backgroundColor:selectedStyles.includes(tag.label)?"#a78bfa":"transparent", color:selectedStyles.includes(tag.label)?"#000":"#888" }}>
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop: "1px solid rgba(167,139,250,0.15)" }} />

                {/* GENERATE BUTTON */}
                <div className="space-y-2">
                  <button ref={genBtnRef}
                    className={`w-full h-12 font-display text-base tracking-widest uppercase flex items-center justify-center gap-2 transition-all relative overflow-hidden group ${isShaking ? "animate-shake" : ""}`}
                    onClick={handleGenerate}
                    disabled={isGenerating || isEditing || !prompt.trim()}
                    style={{
                      background: !prompt.trim() || isGenerating || isEditing ? "#1a1a1a" : "#C9A84C",
                      color: !prompt.trim() || isGenerating || isEditing ? "#444" : "#0a0a0a",
                      cursor: !prompt.trim() || isGenerating || isEditing ? "not-allowed" : "pointer",
                      border: "1px solid",
                      borderColor: !prompt.trim() || isGenerating || isEditing ? "rgba(255,255,255,0.05)" : "#C9A84C",
                    }}>
                    {/* Shimmer */}
                    {prompt.trim() && !isGenerating && !isEditing && geminiKey && (
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }} />
                    )}
                    {/* Progress fill when generating */}
                    {isGenerating && (
                      <span className="absolute inset-0 overflow-hidden pointer-events-none">
                        <span className="absolute inset-0 animate-gen-progress opacity-20"
                          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)", width: "60%" }} />
                      </span>
                    )}
                    <span className="relative flex items-center gap-2">
                      {isGenerating
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                        : <><Zap className="h-4 w-4" /> Generate Design</>
                      }
                    </span>
                  </button>

                  {/* Pollinations fallback (subtle) */}
                  {!geminiKey && prompt.trim() && !isGenerating && (
                    <button onClick={handleGenWithPollinations}
                      className="w-full py-1.5 text-[10px] uppercase tracking-wider text-[#444] transition-colors"
                      style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#888"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#444"; }}>
                      Use Pollinations (free, no key) →
                    </button>
                  )}
                </div>

                {/* Generated design section */}
                {generatedImageUrl && !isGenerating && (
                  <>
                    <div className="p-3" style={{ border: "1px solid rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.04)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#C9A84C" }}>Generated Design</p>
                        <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest" style={{ color: "#22c55e" }}>
                          <CheckCircle className="h-3 w-3" /> On canvas
                        </div>
                      </div>
                      <img src={generatedImageUrl} alt="Generated" className="w-full aspect-square object-cover"
                        style={{ background: "#fff", border: "1px solid rgba(255,255,255,0.1)" }} />

                      {/* Refine */}
                      <div className="mt-3">
                        <p className="text-[9px] text-[#555] uppercase tracking-widest mb-1.5">Refine prompt</p>
                        <div className="flex gap-1.5 mb-2 flex-wrap">
                          {["Make it darker","Add text","Change colors","Make it bigger"].map(chip => (
                            <button key={chip} onClick={() => { setRefinePrompt(chip); doGenerate(`${prompt.trim()}, ${chip}`); }}
                              className="px-2 py-0.5 text-[9px] uppercase tracking-wider border transition-colors"
                              style={{ border:"1px solid rgba(167,139,250,0.2)", color:"#a78bfa" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.1)"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                              {chip}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input value={refinePrompt} onChange={e => setRefinePrompt(e.target.value)}
                            placeholder="Refine this design..." className={`flex-1 h-8 text-xs ${panelInput}`}
                            onKeyDown={e => { if (e.key==="Enter"&&refinePrompt.trim()) handleRegenerate(); }} />
                          <button onClick={handleRegenerate} className="h-8 px-2 text-[10px]"
                            style={{ border:"1px solid rgba(167,139,250,0.3)", color:"#a78bfa" }}>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2.5">
                        <button onClick={handleRegenerate}
                          className="flex-1 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors"
                          style={{ border:"1px solid rgba(167,139,250,0.4)", color:"#a78bfa" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.08)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                          Regenerate
                        </button>
                        <button onClick={() => { setGeneratedImageUrl(null); setUndoStack([]); }}
                          className="px-3 py-2 text-[11px] uppercase tracking-wider transition-colors flex items-center gap-1"
                          style={{ border:"1px solid rgba(239,68,68,0.2)", color:"#666" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#666"; }}>
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Natural language edit — right panel (Place 2) */}
                    <div style={{ border: "1px solid rgba(167,139,250,0.2)", borderTop: "2px solid #a78bfa", background: "#0a0a0a", marginBottom: "12px" }}>
                      <div className="px-3 pt-3 pb-2">
                        <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: "#a78bfa" }}>✏ Describe Your Edit</p>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={nlEditText}
                            onChange={e => setNlEditText(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && nlEditText.trim() && !isEditing) { handleNaturalLanguageEdit(nlEditText.trim()); setNlEditText(""); } }}
                            disabled={isEditing}
                            placeholder={NL_PLACEHOLDERS[placeholderIdx]}
                            className="flex-1 text-[11px] bg-[#1a1a1a] text-white px-2 py-2 outline-none"
                            style={{ border: "1px solid rgba(167,139,250,0.2)", fontFamily: "Inter, sans-serif" }}
                            onFocus={e => (e.target.style.borderColor = "#a78bfa")}
                            onBlur={e => (e.target.style.borderColor = "rgba(167,139,250,0.2)")}
                          />
                          <button
                            onClick={() => { if (nlEditText.trim() && !isEditing) { handleNaturalLanguageEdit(nlEditText.trim()); setNlEditText(""); } }}
                            disabled={!nlEditText.trim() || isEditing}
                            className="px-3 text-sm font-bold transition-all"
                            style={{ background: nlEditText.trim() && !isEditing ? "#a78bfa" : "#1a1a1a", color: nlEditText.trim() && !isEditing ? "#000" : "#444" }}>
                            {isEditing ? "..." : "→"}
                          </button>
                        </div>
                        {/* Part clarification UI — right panel */}
                        {showPartClarification && (
                          <div className="mt-2" style={{ background: "#0f0f0f", border: "1px solid rgba(201,168,76,0.3)", padding: "8px" }}>
                            <p className="text-[8px] uppercase tracking-widest mb-1.5" style={{ color: "#C9A84C" }}>
                              WHICH PART? — {showPartClarification.color}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {["Sleeves","Body","Collar","Cuffs","Side Stripes","Full Garment"].map(part => (
                                <button key={part} onClick={() => {
                                  const refined = `make the ${part.toLowerCase()} ${showPartClarification.color}`;
                                  setShowPartClarification(null);
                                  applyNlEdit(refined);
                                }}
                                  className="text-[9px] px-2 py-1"
                                  style={{ background: "transparent", border: "1px solid rgba(167,139,250,0.35)", color: "#a78bfa", cursor: "pointer" }}>
                                  {part}
                                </button>
                              ))}
                              <button onClick={() => setShowPartClarification(null)}
                                className="text-[9px] px-2 py-1"
                                style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer" }}>
                                ✕
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {NL_SUGGESTIONS.slice(0, 4).map(s => (
                            <button key={s} onClick={() => setNlEditText(s)}
                              className="text-[8px] px-1.5 py-0.5 transition-all"
                              style={{ border: "1px solid rgba(167,139,250,0.18)", color: "#444", background: "transparent" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#a78bfa"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.4)"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#444"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.18)"; }}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* EDIT PANEL */}
                    <EditPanel
                      editTab={editTab} setEditTab={setEditTab}
                      selectedPart={selectedPart} setSelectedPart={setSelectedPart}
                      selectedColor={selectedColor} setSelectedColor={setSelectedColor}
                      pendingColorEdits={pendingColorEdits} setPendingColorEdits={setPendingColorEdits}
                      removeBrand={removeBrand} setRemoveBrand={setRemoveBrand}
                      logoUploadBase64={logoUploadBase64} setLogoUploadBase64={setLogoUploadBase64}
                      setLogoUploadMimeType={setLogoUploadMimeType}
                      selectedSleeve={selectedSleeve} setSelectedSleeve={setSelectedSleeve}
                      selectedCollar={selectedCollar} setSelectedCollar={setSelectedCollar}
                      selectedFit={selectedFit} setSelectedFit={setSelectedFit}
                      selectedLength={selectedLength} setSelectedLength={setSelectedLength}
                      isEditing={isEditing} undoStack={undoStack}
                      onApplyEdit={handleApplyEdit} onUndo={handleUndo}
                      panelRef={editPanelRef}
                    />
                  </>
                )}
              </div>

              {/* ── API Configuration (collapsible, always at bottom of AI tab) ── */}
              <div ref={apiKeyRef} className="mt-auto shrink-0"
                style={{ borderTop: "1px solid rgba(167,139,250,0.12)" }}>
                <button
                  onClick={() => setApiKeyOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 transition-colors"
                  style={{ background: apiKeyOpen ? "rgba(167,139,250,0.06)" : "transparent" }}
                  onMouseEnter={e => { if (!apiKeyOpen) (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.04)"; }}
                  onMouseLeave={e => { if (!apiKeyOpen) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-3.5 w-3.5" style={{ color: "#a78bfa" }} />
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: "#a78bfa" }}>⚙ AI Configuration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {geminiKey
                      ? <span className="text-[9px] font-bold px-2 py-0.5" style={{ background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", color:"#22c55e" }}>✓ Connected</span>
                      : <span className="text-[9px] font-bold px-2 py-0.5" style={{ background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.25)", color:"#C9A84C" }}>⚠ Key Required</span>
                    }
                    <ChevronDown className="h-3.5 w-3.5 text-[#555] transition-transform" style={{ transform: apiKeyOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </div>
                </button>

                {apiKeyOpen && (
                  <div className="px-4 pb-4 space-y-3" style={{ background: "#0f0f0f", border: "1px solid rgba(201,168,76,0.12)" }}>
                    {geminiKey ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 py-2">
                          <CheckCircle className="h-4 w-4" style={{ color: "#22c55e" }} />
                          <span className="text-xs text-white">Gemini AI connected</span>
                        </div>
                        <p className="text-[10px]" style={{ color: "#555" }}>Full image generation and AI editing active</p>
                        <button onClick={clearGeminiKey}
                          className="text-[10px] uppercase tracking-wider text-[#555] hover:text-red-400 transition-colors underline">
                          Remove API key
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-2">
                        <p className="text-[10px]" style={{ color: "#555" }}>
                          Get a free key at{" "}
                          <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer"
                            className="underline" style={{ color: "#a78bfa" }}>aistudio.google.com</a>
                        </p>
                        <Input value={keyInput} onChange={e => setKeyInput(e.target.value)}
                          onKeyDown={e => { if (e.key==="Enter") saveGeminiKey(); }}
                          placeholder="AIza..." type="password" className={`h-8 text-sm ${panelInput}`} />
                        <button onClick={saveGeminiKey} disabled={!keyInput.trim()}
                          className="w-full h-8 text-[11px] font-bold uppercase tracking-wider disabled:opacity-40"
                          style={{ background: "#C9A84C", color: "#0a0a0a" }}>
                          Save Key &amp; Connect
                        </button>
                        <button onClick={handleGenWithPollinations} disabled={!prompt.trim() || isGenerating}
                          className="w-full py-1.5 text-[10px] uppercase tracking-wider text-[#444] transition-colors disabled:opacity-40"
                          style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#888"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#444"; }}>
                          Skip — use Pollinations (free)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Upload Tab ── */}
            <TabsContent value="upload" className="p-4 flex flex-col gap-4 m-0">
              <Label className="text-[9px] uppercase tracking-[0.25em] mb-1 block" style={{ color: "#a78bfa" }}>Upload Logo / Artwork</Label>
              <label className="flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-colors"
                style={{ border:"2px dashed rgba(167,139,250,0.3)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.6)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.3)"; }}>
                <Upload className="h-7 w-7 mb-3 text-[#555]" />
                <p className="text-sm text-[#a0a0a0]">Click to upload</p>
                <p className="text-xs text-[#555] mt-1">PNG, JPG, SVG</p>
                <input type="file" accept="image/*,.svg" className="hidden" onChange={handleUpload} />
              </label>
              {uploadedImage && (
                <div className="p-3" style={{ border:"1px solid rgba(167,139,250,0.3)", background:"rgba(167,139,250,0.04)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{color:"#C9A84C"}}>Uploaded Logo</p>
                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest" style={{color:"#22c55e"}}><CheckCircle className="h-3 w-3" /> Applied</div>
                  </div>
                  <img src={uploadedImage} alt="Uploaded" className="w-full object-contain max-h-32 bg-white/5" />
                  <button onClick={() => { setUploadedImage(null); setIsAccepted(false); resetPos(); }}
                    className="mt-2 w-full py-1.5 text-[11px] uppercase tracking-wider flex items-center justify-center gap-1"
                    style={{ border:"1px solid rgba(239,68,68,0.2)", color:"#666" }}>
                    <X className="h-3 w-3" /> Remove
                  </button>
                </div>
              )}
              <div className="p-3" style={{ border:"1px solid rgba(167,139,250,0.08)" }}>
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{color:"#555"}}>Best results:</p>
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
                <Label className="text-[9px] uppercase tracking-[0.25em] mb-1.5 block" style={{color:"#a78bfa"}}>Custom Text</Label>
                <Input value={customText} onChange={e => setCustomText(e.target.value)}
                  placeholder="YOUR BRAND NAME" className={`font-display tracking-widest ${panelInput}`} />
              </div>
              <div>
                <Label className="text-[9px] uppercase tracking-[0.25em] mb-2 block" style={{color:"#a78bfa"}}>Text Color</Label>
                <div className="flex items-center gap-2.5">
                  <input type="color" value={textColor} onChange={e=>setTextColor(e.target.value)} className="w-9 h-9 border cursor-pointer bg-[#0a0a0a]" style={{borderColor:"rgba(167,139,250,0.2)"}} />
                  <Input value={textColor} onChange={e=>setTextColor(e.target.value)} className={`font-mono text-sm w-24 ${panelInput}`} />
                </div>
              </div>
              <div className="p-3" style={{ border:"1px solid rgba(167,139,250,0.15)", background:"rgba(167,139,250,0.04)" }}>
                <p className="text-[11px] text-[#555] mb-1">Preview:</p>
                <p className="font-display text-2xl tracking-widest truncate" style={{color:textColor}}>
                  {customText || "YOUR TEXT"}
                </p>
              </div>
              {customText && (
                <button onClick={() => setCustomText("")}
                  className="w-full py-1.5 text-[11px] uppercase tracking-wider flex items-center justify-center gap-1"
                  style={{ border:"1px solid rgba(239,68,68,0.2)", color:"#666" }}>
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
