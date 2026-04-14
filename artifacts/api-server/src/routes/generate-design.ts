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

router.post("/generate-design", async (req, res) => {
  try {
    const { prompt, styleModifiers = [], garmentType = "t-shirt", garmentColor = "black", view = "front" } = req.body;
    const apiKey = (req.headers["x-gemini-key"] as string) || process.env.GEMINI_API_KEY;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!apiKey) {
      return res.status(400).json({
        error: "No Gemini API key provided.",
        code: "NO_API_KEY",
      });
    }

    const styles = styleModifiers
      .map((m: string) => STYLE_DESCRIPTIONS[m] || m)
      .join(", ");

    const VIEW_PROMPTS: Record<string, string> = {
      front: "Front view of the garment facing directly toward the camera. Full front panel visible. Ghost mannequin style.",
      back: "Back view of the garment turned completely around showing the back panel. Same garment, viewed from behind. Any back number or logo fully visible. Ghost mannequin style.",
      "left sleeve": "Left sleeve close-up of the garment. The left arm and shoulder area is the focus. Show the sleeve design, cuff, and shoulder clearly. Same garment colors and style.",
      "right sleeve": "Right sleeve close-up of the garment. The right arm and shoulder area is the focus. Show the sleeve design, cuff, and shoulder clearly. Same garment colors and style.",
    };
    const viewDesc = VIEW_PROMPTS[view?.toLowerCase()] || VIEW_PROMPTS.front;

    const fullPrompt = `Photorealistic product mockup. ${viewDesc}
Garment: ${garmentColor} ${garmentType}.
Custom printed graphic design: ${prompt}.
Design style: ${styles || "modern streetwear graphic"}.
The design is printed directly on the garment fabric. Consistent colors, patterns, and aesthetic across all views.
Professional studio lighting. Pure dark background (#0a0a0a).
High resolution. Realistic fabric texture. No watermarks. No extra text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const status = response.status;
      if (status === 429) {
        return res.status(429).json({ error: "Rate limit reached. Please wait a moment and try again.", code: "RATE_LIMIT" });
      }
      if (status === 400 || status === 403) {
        return res.status(400).json({ error: "Invalid or unauthorized API key.", code: "INVALID_KEY" });
      }
      return res.status(500).json({ error: "Gemini API error", code: "GEMINI_ERROR", details: errData });
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData);

    if (!imagePart?.inlineData) {
      return res.status(500).json({ error: "No image was generated. Try a more descriptive prompt.", code: "NO_IMAGE" });
    }

    const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    res.json({ success: true, imageUrl, engine: "gemini" });
  } catch (err: any) {
    console.error("[generate-design]", err);
    res.status(500).json({ error: "Internal server error during image generation" });
  }
});

export default router;
