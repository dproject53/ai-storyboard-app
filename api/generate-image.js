export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, hfToken } = req.body;
    let imageBuffer = null;
    let contentType = 'image/jpeg';

    if (hfToken && hfToken.trim() !== '') {
      try {
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
        if (hfResponse.ok) {
          imageBuffer = await hfResponse.arrayBuffer();
          contentType = hfResponse.headers.get('content-type') || 'image/jpeg';
        } else {
          console.warn("Hugging Face API failed, falling back to Pollinations");
        }
      } catch (e) {
        console.warn("HF Fetch error:", e.message);
      }
    }

    // Fallback to Pollinations if HF fails or no token
    if (!imageBuffer) {
      const seed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(prompt);
      const pollUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=450&nologo=true&seed=${seed}`;
      
      const pollResponse = await fetch(pollUrl);
      if (!pollResponse.ok) throw new Error("Semua server gambar gagal memproses permintaan.");
      imageBuffer = await pollResponse.arrayBuffer();
      contentType = pollResponse.headers.get('content-type') || 'image/jpeg';
    }

    // Send the image back to the client
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 's-maxage=86400');
    res.status(200).send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error("Image Gen Error:", error);
    res.status(500).json({ error: error.message });
  }
}
