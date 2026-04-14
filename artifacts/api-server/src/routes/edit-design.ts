import { Router } from "express";

const router = Router();

router.post("/edit-design", async (req, res) => {
  try {
    const { currentImageBase64, currentImageMimeType, editPrompt, logoBase64, logoMimeType } = req.body;
    const apiKey = (req.headers["x-gemini-key"] as string) || process.env.GEMINI_API_KEY;

    if (!currentImageBase64) {
      return res.status(400).json({ error: "Current image is required", code: "NO_IMAGE" });
    }
    if (!editPrompt) {
      return res.status(400).json({ error: "Edit instruction is required", code: "NO_PROMPT" });
    }
    if (!apiKey) {
      return res.status(400).json({
        error: "Gemini API key required for image editing. Please enter your key in the studio.",
        code: "NO_API_KEY",
      });
    }

    const parts: any[] = [
      {
        inlineData: {
          mimeType: currentImageMimeType || "image/png",
          data: currentImageBase64,
        },
      },
    ];

    if (logoBase64) {
      parts.push({
        inlineData: {
          mimeType: logoMimeType || "image/png",
          data: logoBase64,
        },
      });
    }

    parts.push({ text: editPrompt });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: { responseModalities: ["image", "text"] },
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return res.status(429).json({ error: "Rate limit reached. Please wait and try again.", code: "RATE_LIMIT" });
      }
      if (status === 400 || status === 403) {
        return res.status(400).json({ error: "Invalid or unauthorized API key.", code: "INVALID_KEY" });
      }
      const errData = await response.json().catch(() => ({}));
      return res.status(500).json({ error: "Gemini API error", details: errData });
    }

    const data = await response.json();
    const responseParts = data.candidates?.[0]?.content?.parts ?? [];
    const imagePart = responseParts.find((p: any) => p.inlineData);

    if (!imagePart?.inlineData) {
      return res.status(500).json({ error: "No edited image returned. Try a more specific instruction.", code: "NO_IMAGE" });
    }

    res.json({
      success: true,
      imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
    });
  } catch (err: any) {
    console.error("[edit-design]", err);
    res.status(500).json({ error: "Internal server error during image editing" });
  }
});

export default router;
