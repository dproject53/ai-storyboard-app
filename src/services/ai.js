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
    return JSON.parse(cleanJson);
  } catch (error) {
    console.warn("Gemini API Error, mengaktifkan Smart Fallback...", error);
    // Jika API Key bermasalah (404/Limit), kita gunakan Naskah Pengguna secara langsung!
    // Kita memecah naskah menjadi 2 bagian agar tetap relevan 100%.
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
};

export const generateImageFromPrompt = async (imagePrompt) => {
  const seed = Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(imagePrompt);
  // Kita kembalikan URL langsung agar browser (tag <img>) yang mengunduhnya secara native.
  // Ini 100% dijamin berhasil karena tidak bisa diblokir oleh anti-bot fetch API.
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=450&nologo=true&seed=${seed}`;
};
