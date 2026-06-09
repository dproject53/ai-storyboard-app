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
    let cleanJson = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.warn("Gemini API sibuk/error, mencoba server cadangan gratis (Pollinations AI)...", error);
    try {
      // Menggunakan server AI gratis (Pollinations) sebagai cadangan utama!
      // Server ini sangat tangguh dan tidak peduli dengan limit API Key.
      const response = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          jsonMode: true,
          seed: Math.floor(Math.random() * 1000000)
        })
      });
      
      if (!response.ok) throw new Error("Server cadangan juga penuh.");
      const textResponse = await response.text();
      let cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (fallbackError) {
      console.error("Semua server AI lumpuh:", fallbackError);
      // Jika kedua server mati, gunakan Smart Splitter sebagai benteng pertahanan terakhir!
      const words = script.split(' ');
      const mid = Math.floor(words.length / 2) || 1;
      const part1 = words.slice(0, mid).join(' ');
      const part2 = words.slice(mid).join(' ');

      return [
        {
          id: 1,
          shotType: "Wide Shot",
          camera: "Pan Right",
          desc: "Scene 1: " + (part1 || "Adegan awal"),
          imagePrompt: `A highly detailed cinematic storyboard panel, ${visualStyle} style. Wide establishing shot of ${part1}. NO text.`
        },
        {
          id: 2,
          shotType: "Close Up",
          camera: "Static",
          desc: "Scene 2: " + (part2 || "Karakter bereaksi"),
          imagePrompt: `A highly detailed cinematic storyboard panel, ${visualStyle} style. Close up shot reacting to: ${part2}. NO text.`
        }
      ];
    }
  }
};

export const generateImageFromPrompt = async (imagePrompt) => {
  const hfToken = localStorage.getItem('hfApiKey') || '';
  
  // Meminta server Vercel (Backend) untuk mengambilkan gambar.
  // Ini 100% membobol blokir ISP karena browser hanya berkomunikasi dengan Vercel!
  const response = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: imagePrompt, hfToken })
  });

  if (!response.ok) {
    let errorMsg = "Gagal mengambil gambar dari server Vercel.";
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch (e) { }
    throw new Error(errorMsg);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
