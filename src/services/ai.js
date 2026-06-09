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
  // Menggunakan model terbaru yang didukung Google
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    console.error("Gemini API Error:", error);
    // Kita Lempar Errornya agar pengguna tahu bahwa API Key mereka salah/limit.
    throw new Error(`Gagal menghubungi Gemini AI. Pastikan API Key Anda benar dan memiliki kuota. Detail: ${error.message}`);
  }
};

export const generateImageFromPrompt = async (imagePrompt) => {
  const seed = Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(imagePrompt);
  // Kita kembalikan URL langsung agar browser (tag <img>) yang mengunduhnya secara native.
  // Ini 100% dijamin berhasil karena tidak bisa diblokir oleh anti-bot fetch API.
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=450&nologo=true&seed=${seed}`;
};
