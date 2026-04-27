import { Router } from "express";

const router = Router();

const ALLOWED_HOSTS = ["s.alicdn.com", "alicdn.com", "sc02.alicdn.com"];

router.get("/images/proxy", async (req, res) => {
  const rawUrl = req.query.url as string;
  if (!rawUrl) return res.status(400).json({ error: "Missing url parameter" });

  let targetUrl: string;
  try {
    targetUrl = decodeURIComponent(rawUrl);
    const parsed = new URL(targetUrl);
    if (!ALLOWED_HOSTS.some(h => parsed.hostname.endsWith(h))) {
      return res.status(400).json({ error: "URL not allowed" });
    }
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        "Referer": "https://www.alibaba.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: "Upstream error" });
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
