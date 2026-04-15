import { Router } from "express";

const router = Router();

const IMAGE_MODELS = [
  "gemini-2.0-flash-preview-image-generation",
  "gemini-2.0-flash-exp-image-generation",
];

router.post("/check-gemini", async (req, res) => {
  const apiKey = (req.headers["x-gemini-key"] as string) || "";
  if (!apiKey) return res.status(400).json({ valid: false, error: "No key provided" });

  // Step 1: validate key is real with a text-only model
  let keyValid = false;
  let keyError = "";
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Say OK" }] }] }),
      }
    );
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      keyValid = true;
    } else {
      keyError = d?.error?.message || `HTTP ${r.status}`;
      console.log(`[check-gemini] key invalid: ${keyError}`);
    }
  } catch (e: any) {
    keyError = e.message;
  }

  if (!keyValid) {
    return res.json({ valid: false, imageGenAvailable: false, error: keyError });
  }

  // Step 2: check each image generation model
  const modelResults: Record<string, boolean> = {};
  for (const model of IMAGE_MODELS) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "Generate a small red square image" }] }],
            generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
          }),
        }
      );
      const d = await r.json().catch(() => ({}));
      modelResults[model] = r.ok;
      console.log(`[check-gemini] model=${model} ok=${r.ok} status=${r.status} err=${d?.error?.message?.slice(0, 80) || ""}`);
    } catch (e: any) {
      modelResults[model] = false;
    }
  }

  const imageGenAvailable = Object.values(modelResults).some(Boolean);
  const workingModel = Object.entries(modelResults).find(([, ok]) => ok)?.[0] || null;

  res.json({ valid: true, imageGenAvailable, workingModel, modelResults });
});

export default router;
