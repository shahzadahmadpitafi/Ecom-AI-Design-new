import { Router } from "express";

const router = Router();

// Models to try in order
const IMAGE_GEN_MODELS = [
  "gemini-2.0-flash-preview-image-generation",
  "gemini-2.0-flash-exp-image-generation",
  "gemini-2.0-flash-exp",
];

async function tryGeminiEdit(apiKey: string, parts: any[]): Promise<{ ok: boolean; data: any; status: number; model: string }> {
  for (const model of IMAGE_GEN_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      }),
    });

    const data = await response.json().catch(() => ({}));
    console.log(`[edit-design] model=${model} status=${response.status}`);

    if (response.ok) {
      return { ok: true, data, status: response.status, model };
    }

    if (response.status === 429) return { ok: false, data, status: 429, model };
    if (response.status === 400 || response.status === 403) {
      const msg = (data?.error?.message || "").toLowerCase();
      if (msg.includes("api key") || msg.includes("auth") || msg.includes("permission")) {
        return { ok: false, data, status: 400, model };
      }
    }
    if (response.status === 404) {
      console.log(`[edit-design] model ${model} not found, trying next...`);
      continue;
    }

    console.error(`[edit-design] model=${model} error:`, JSON.stringify(data).slice(0, 400));
  }
  return { ok: false, data: { error: { message: "No image generation model available." } }, status: 404, model: "none" };
}

router.post("/edit-design", async (req, res) => {
  try {
    const { currentImageBase64, currentImageMimeType, editPrompt, logoBase64, logoMimeType } = req.body;
    const apiKey = (req.headers["x-gemini-key"] as string) || process.env.GEMINI_API_KEY;

    if (!currentImageBase64) return res.status(400).json({ error: "Current image is required", code: "NO_IMAGE" });
    if (!editPrompt)         return res.status(400).json({ error: "Edit instruction is required", code: "NO_PROMPT" });
    if (!apiKey)             return res.status(400).json({ error: "Gemini API key required for image editing.", code: "NO_API_KEY" });

    const parts: any[] = [
      { inlineData: { mimeType: currentImageMimeType || "image/png", data: currentImageBase64 } },
    ];

    if (logoBase64) {
      parts.push({ inlineData: { mimeType: logoMimeType || "image/png", data: logoBase64 } });
    }

    parts.push({ text: editPrompt });

    const { ok, data, status, model } = await tryGeminiEdit(apiKey, parts);

    if (!ok) {
      if (status === 429) return res.status(429).json({ error: "Rate limit reached. Please wait and try again.", code: "RATE_LIMIT" });
      if (status === 400 || status === 403) return res.status(400).json({ error: "Invalid or unauthorized API key.", code: "INVALID_KEY" });
      if (status === 404) return res.status(404).json({
        error: "Your Gemini API key doesn't have access to image editing models. Get a key from aistudio.google.com.",
        code: "MODEL_NOT_FOUND",
      });
      return res.status(500).json({ error: "Gemini API error", code: "GEMINI_ERROR", details: data });
    }

    console.log(`[edit-design] success with model=${model}`);
    const responseParts = data.candidates?.[0]?.content?.parts ?? [];
    const imagePart = responseParts.find((p: any) => p.inlineData);

    if (!imagePart?.inlineData) {
      console.error("[edit-design] No image in response", JSON.stringify(data).slice(0, 500));
      return res.status(500).json({ error: "No edited image returned. Try a more specific instruction.", code: "NO_IMAGE" });
    }

    res.json({
      success: true,
      imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
      model,
    });
  } catch (err: any) {
    console.error("[edit-design]", err);
    res.status(500).json({ error: "Internal server error during image editing" });
  }
});

export default router;
