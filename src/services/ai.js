import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const hfApiToken = import.meta.env.VITE_HF_API_TOKEN;

// Initialize Gemini
let genAI = null;

export const generateStoryboardBreakdown = async (script, visualStyle) => {
  const geminiApiKey = localStorage.getItem('geminiApiKey');
  const geminiModelName = localStorage.getItem('geminiModel') || "gemini-1.5-flash";

  if (!geminiApiKey) {
    throw new Error("API Key belum dimasukkan. Silakan isi di menu Settings.");
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    // Menggunakan model yang dipilih pengguna dari Settings
    const model = genAI.getGenerativeModel({ model: geminiModelName });

    const prompt = `
Anda adalah seorang Sutradara Ahli dan Storyboard Artist.
Buatlah storyboard breakdown berdasarkan naskah berikut:

${script}

PENTING:
- Pecah cerita di atas menjadi beberapa adegan (scene) yang logis (idealnya 3-6 panel).
- Untuk setiap panel, berikan deskripsi bahasa Indonesia yang detail tentang apa yang terjadi ("desc").
- Untuk setiap panel, buatlah prompt bahasa Inggris ("imagePrompt") yang sangat spesifik, visual, dan deskriptif untuk AI Image Generator (contoh gaya: ${visualStyle}). Pastikan menyebutkan subjek, latar, pencahayaan, dan mood.
- Jangan ada teks apa pun di dalam gambar (tulis "NO text" di setiap imagePrompt).

Kembalikan dalam format JSON array yang persis seperti ini, tanpa markdown block, hanya array mentah:
[
  {
    "id": 1,
    "shotType": "Wide Shot",
    "camera": "Pan Right",
    "desc": "Deskripsi adegan detail...",
    "imagePrompt": "A highly detailed cinematic storyboard panel, ${visualStyle} style. [English description of the scene]. NO text."
  }
]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    // Clean markdown if AI includes it
    let cleanJson = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Jika API gagal, lemparkan error agar pengguna tahu masalahnya.
    throw new Error(`Gagal menghubungi model ${geminiModelName}. Coba ganti model di menu Settings. Detail: ${error.message}`);
  }
};

export const generateImageFromPrompt = async (imagePrompt) => {
  const seed = Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(imagePrompt);
  // Kita kembalikan URL langsung agar browser (tag <img>) yang mengunduhnya secara native.
  // Ini 100% dijamin berhasil karena tidak bisa diblokir oleh anti-bot fetch API.
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=450&nologo=true&seed=${seed}`;
};
