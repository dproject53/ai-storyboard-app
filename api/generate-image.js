export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, hfToken } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (hfToken && hfToken.trim() !== '') {
      try {
        const hfResponse = await fetch(
          "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
          {
            headers: {
              Authorization: `Bearer ${hfToken.trim()}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ inputs: prompt }),
          }
        );
        
        if (!hfResponse.ok) {
          const errorData = await hfResponse.json().catch(() => ({}));
          console.error("HF Error:", hfResponse.status, errorData);
          
          if (hfResponse.status === 503 && errorData.error && errorData.error.includes("loading")) {
            const waitTime = errorData.estimated_time || 30;
            return res.status(503).json({ error: `Model AI sedang dipanaskan (loading). Tunggu ${Math.ceil(waitTime)} detik lalu klik Regenerate.` });
          }
          throw new Error(errorData.error || `Hugging Face menolak permintaan (${hfResponse.status})`);
        }

        const imageBuffer = await hfResponse.arrayBuffer();
        const contentType = hfResponse.headers.get('content-type') || 'image/jpeg';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 's-maxage=86400');
        return res.status(200).send(Buffer.from(imageBuffer));
      } catch (e) {
        console.error("HF Fetch error:", e.message);
        return res.status(500).json({ error: e.message });
      }
    } else {
      return res.status(400).json({ error: "Token Hugging Face tidak ditemukan. Silakan isi di menu Settings." });
    }

  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: error.message });
  }
}
