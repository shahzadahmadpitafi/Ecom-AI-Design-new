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
        error: "No Gemini API key provided. Please enter your API key in the studio.",
        code: "NO_API_KEY",
      });
    }

    const styles = styleModifiers
      .map((m: string) => STYLE_DESCRIPTIONS[m] || m)
      .join(", ");

    const fullPrompt = `Photorealistic product mockup of a ${garmentColor} ${garmentType}, ${view} view.
Custom printed graphic design: ${prompt}.
Design style: ${styles || "modern streetwear graphic"}.
The design is printed directly on the garment fabric.
Shot style: ghost mannequin or flat lay, professional studio lighting, pure dark background.
The garment looks premium and ready for sale. High resolution, sharp details, realistic fabric texture visible.
No extra text, no watermarks, no background clutter.`;

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
    res.json({ success: true, imageUrl });
  } catch (err: any) {
    console.error("[generate-design]", err);
    res.status(500).json({ error: "Internal server error during image generation" });
  }
});

export default router;
