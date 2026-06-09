import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const hfApiToken = import.meta.env.VITE_HF_API_TOKEN;

// Initialize Gemini
let genAI = null;

export const generateStoryboardBreakdown = async (script, visualStyle) => {
  const geminiApiKey = localStorage.getItem("geminiApiKey");
  if (!geminiApiKey) {
    throw new Error("Kunci Gemini API belum diatur. Silakan masukkan di menu Settings.");
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
Anda adalah seorang Sutradara Ahli dan Storyboard Artist.
Saya akan memberikan naskah/ide cerita. Tugas Anda adalah memecahnya menjadi adegan-adegan storyboard (maksimal 4 adegan untuk prototipe ini).

Format yang saya minta adalah array JSON MURNI tanpa markdown, dengan struktur berikut:
[
  {
    "id": 1,
    "shotType": "tipe shot, misal: Wide Shot, Close Up",
    "camera": "pergerakan kamera, misal: Pan Right, Static",
    "desc": "deskripsi visual adegan / aksi / dialog",
    "imagePrompt": "A highly detailed cinematic storyboard panel, \${visualStyle} style. [describe the scene visually based on desc and camera]. NO text or words in the image."
  }
]

Naskah:
"${script}"

Berikan HANYA format JSON murni.
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    // Clean markdown if AI includes it
    let cleanJson = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    // Kadang ada sisa whitespace
    return JSON.parse(cleanJson);
  } catch (error) {
    console.warn("Gemini API Error (Fallback ke Mock Data):", error);
    // Jika API Key bermasalah (sering terjadi 404 karena region/akun baru), 
    // kita berikan data bohongan agar proses pembuatan gambar (Hugging Face) tetap berjalan!
    return [
      {
        id: 1,
        shotType: "Wide Shot",
        camera: "Pan Right",
        desc: "Establishing shot. " + script.substring(0, 50) + "...",
        imagePrompt: `A highly detailed cinematic storyboard panel, ${visualStyle} style. Wide establishing shot of ${script}. NO text.`
      },
      {
        id: 2,
        shotType: "Close Up",
        camera: "Static",
        desc: "Detail karakter utama bereaksi.",
        imagePrompt: `A highly detailed cinematic storyboard panel, ${visualStyle} style. Close up shot of a character's face reacting to the event in: ${script}. NO text.`
      }
    ];
  }
};

export const generateImageFromPrompt = async (imagePrompt) => {
  // Mendeteksi apakah kita berjalan di Production (Vercel) atau Lokal (Vite Dev Server)
  // Vercel menggunakan path '/api/generate-image', sedangkan lokal menggunakan port 3001
  const backendUrl = import.meta.env.PROD 
    ? "/api/generate-image" 
    : "http://localhost:3001/api/generate-image";

  const hfApiToken = localStorage.getItem('hfApiKey');
  if (!hfApiToken) {
    throw new Error("Hugging Face Token belum dimasukkan. Silakan isi di menu Settings.");
  }

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        prompt: imagePrompt,
        hfToken: hfApiToken 
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Gagal menghasilkan gambar (Status: ${response.status})`);
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    return imageUrl;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};
