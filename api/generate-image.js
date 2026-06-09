export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, hfToken } = req.body;

    if (!hfToken || hfToken.trim() === '') {
      return res.status(400).json({ error: "Token Hugging Face tidak ditemukan. Silakan isi di menu Settings." });
    }

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
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
      
      // Jika model sedang loading (biasa terjadi di Hugging Face)
      if (hfResponse.status === 503 && errorData.error && errorData.error.includes("loading")) {
        const waitTime = errorData.estimated_time || 30;
        return res.status(503).json({ error: `Model AI sedang dipanaskan (loading). Silakan tunggu sekitar ${Math.ceil(waitTime)} detik dan klik Regenerate.` });
      }
      
      return res.status(hfResponse.status).json({ error: errorData.error || "Hugging Face menolak permintaan. Pastikan Token valid." });
    }

    const imageBuffer = await hfResponse.arrayBuffer();
    const contentType = hfResponse.headers.get('content-type') || 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 's-maxage=86400');
    res.status(200).send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: error.message });
  }
}
