import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load variables from .env.local
dotenv.config({ path: '.env.local' });

const app = express();
const port = 3001;

// Allow requests from our Vite frontend
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.post('/api/generate-image', async (req, res) => {
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

    // Convert response to ArrayBuffer to send back as binary data
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Set headers and send the image directly
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (error) {
    console.error("Backend Hugging Face Error:", error);
    res.status(500).json({ error: "Terjadi kesalahan internal saat menghubungi Hugging Face." });
  }
});

app.listen(port, () => {
  console.log(`🎬 AI Storyboard Backend berjalan di http://localhost:${port}`);
});
