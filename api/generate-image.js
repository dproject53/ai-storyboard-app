export default async function handler(req, res) {
  // Hanya menerima metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, hfToken } = req.body;

  if (!hfToken) {
    return res.status(400).json({ error: "Hugging Face Token tidak ditemukan. Harap isi di menu Settings." });
  }

  const modelUrl = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

  try {
    const response = await fetch(modelUrl, {
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      console.error(`HF Error Status: ${response.status}`);
      return res.status(response.status).json({ error: `Gagal menghasilkan gambar (Status: ${response.status})` });
    }

    // Mengubah response menjadi ArrayBuffer untuk dikirim kembali sebagai binary image data
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Set headers dan kirim gambar secara langsung
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (error) {
    console.error("Vercel Serverless Error:", error);
    res.status(500).json({ 
      error: "Terjadi kesalahan internal saat menghubungi Hugging Face via Vercel.",
      details: error.message,
      stack: error.stack
    });
  }
}
