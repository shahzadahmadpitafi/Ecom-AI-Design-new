import { Router } from "express";

const router = Router();

const STYLE_DESCRIPTIONS: Record<string, string> = {
  Vintage:    "vintage distressed aesthetic, worn texture, retro color palette",
  Bold:       "bold graphic design, high contrast, strong typography",
  Streetwear: "urban streetwear aesthetic, oversized graphic, graffiti elements",
  Luxury:     "premium luxury embroidery look, sophisticated ornate design",
  Grunge:     "grunge aesthetic, dark tones, rough edges, punk influence",
  Minimalist: "clean minimal design, single color, simple elegant lines",
};

// Models to try in order — preview requires allowlist, exp is broadly available
const IMAGE_GEN_MODELS = [
  "gemini-2.0-flash-preview-image-generation",
  "gemini-2.0-flash-exp-image-generation",
  "gemini-2.0-flash-exp",
];

async function tryGeminiGenerate(apiKey: string, body: object): Promise<{ ok: boolean; data: any; status: number; model: string }> {
  for (const model of IMAGE_GEN_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    console.log(`[generate-design] model=${model} status=${response.status}`);

    if (response.ok) {
      return { ok: true, data, status: response.status, model };
    }

    if (response.status === 429) {
      return { ok: false, data, status: 429, model };
    }
    if (response.status === 400 || response.status === 403) {
      const msg = (data?.error?.message || "").toLowerCase();
      if (msg.includes("api key") || msg.includes("auth") || msg.includes("permission")) {
        return { ok: false, data, status: 400, model };
      }
    }
    if (response.status === 404) {
      console.log(`[generate-design] model ${model} not found, trying next...`);
      continue;
    }

    console.error(`[generate-design] model=${model} error:`, JSON.stringify(data).slice(0, 400));
  }
  return { ok: false, data: { error: { message: "No image generation model is available for your API key." } }, status: 404, model: "none" };
}

router.post("/generate-design", async (req, res) => {
  try {
    const { prompt, styleModifiers = [], garmentType = "t-shirt", garmentColor = "black", view = "front" } = req.body;
    const apiKey = (req.headers["x-gemini-key"] as string) || process.env.GEMINI_API_KEY;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    if (!apiKey) {
      return res.status(400).json({ error: "No Gemini API key provided.", code: "NO_API_KEY" });
    }

    const styles = styleModifiers.map((m: string) => STYLE_DESCRIPTIONS[m] || m).join(", ");

    const VIEW_PROMPTS: Record<string, string> = {
      front:         "Front view of the garment facing directly toward the camera. Full front panel visible. Ghost mannequin style.",
      back:          "Back view of the garment turned completely around showing the back panel. Same garment, viewed from behind. Ghost mannequin style.",
      "left sleeve": "Left sleeve close-up of the garment. The left arm and shoulder area is the focus.",
      "right sleeve":"Right sleeve close-up of the garment. The right arm and shoulder area is the focus.",
    };
    const viewDesc = VIEW_PROMPTS[view?.toLowerCase()] || VIEW_PROMPTS.front;

    const fullPrompt = `Photorealistic product mockup. ${viewDesc}
Garment: ${garmentColor} ${garmentType}.
Custom printed graphic design: ${prompt}.
Design style: ${styles || "modern streetwear graphic"}.
The design is printed directly on the garment fabric.
Professional studio lighting. Pure dark background (#0a0a0a).
High resolution. Realistic fabric texture. No watermarks. No extra text.`;

    const { ok, data, status, model } = await tryGeminiGenerate(apiKey, {
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
    });

    if (!ok) {
      if (status === 429) return res.status(429).json({ error: "Rate limit reached. Please wait a moment and try again.", code: "RATE_LIMIT" });
      if (status === 400 || status === 403) return res.status(400).json({ error: "Invalid or unauthorized API key.", code: "INVALID_KEY" });
      if (status === 404) return res.status(404).json({
        error: "Your Gemini API key doesn't have access to image generation models. Get a key from aistudio.google.com and make sure image generation is enabled.",
        code: "MODEL_NOT_FOUND",
      });
      return res.status(500).json({ error: "Gemini API error", code: "GEMINI_ERROR", details: data });
    }

    console.log(`[generate-design] success with model=${model}`);
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData);

    if (!imagePart?.inlineData) {
      console.error("[generate-design] No image in response", JSON.stringify(data).slice(0, 400));
      return res.status(500).json({ error: "No image was generated. Try a more descriptive prompt.", code: "NO_IMAGE" });
    }

    const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    res.json({ success: true, imageUrl, engine: "gemini", model });
  } catch (err: any) {
    console.error("[generate-design]", err);
    res.status(500).json({ error: "Internal server error during image generation" });
  }
});

export default router;
