export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    // Proxy ke Pollinations Text API dari server US
    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        jsonMode: true,
        seed: Math.floor(Math.random() * 1000000)
      })
    });

    if (!response.ok) throw new Error("Pollinations Server Error");
    
    const textResponse = await response.text();
    res.status(200).json({ text: textResponse });
  } catch (error) {
    console.error("Text Gen Error:", error);
    res.status(500).json({ error: error.message });
  }
}
