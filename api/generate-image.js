export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Ambil kata kunci dari prompt untuk mencari foto yang relevan
    const keywords = extractKeywords(prompt);
    const flickrUrl = `https://loremflickr.com/800/450/${keywords}`;

    const response = await fetch(flickrUrl, { redirect: 'follow' });

    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 's-maxage=3600');
      return res.status(200).send(Buffer.from(buffer));
    }

    // Jika LoremFlickr juga gagal, gunakan Picsum (gambar acak tapi pasti muncul)
    const picsumResponse = await fetch('https://picsum.photos/800/450', { redirect: 'follow' });
    const buffer = await picsumResponse.arrayBuffer();
    res.setHeader('Content-Type', 'image/jpeg');
    res.status(200).send(Buffer.from(buffer));

  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}

function extractKeywords(prompt) {
  // Daftar kata yang tidak berguna untuk pencarian gambar
  const stopWords = new Set([
    'a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'for', 'is', 'are',
    'was', 'were', 'and', 'or', 'but', 'no', 'not', 'with', 'this', 'that',
    'from', 'by', 'its', 'has', 'have', 'been', 'being', 'their', 'there',
    'highly', 'detailed', 'cinematic', 'storyboard', 'panel', 'style',
    'shot', 'wide', 'close', 'medium', 'establishing', 'text', 'scene',
    'showing', 'shows', 'image', 'illustration', 'drawing', 'picture',
    'sketsa', 'hitam', 'putih', 'comic', 'anime', 'realistic',
    'camera', 'angle', 'view', 'lighting', 'mood', 'tone', 'color',
    'dan', 'di', 'yang', 'sedang', 'akan', 'juga', 'untuk', 'dengan',
    'mereka', 'dari', 'ini', 'itu', 'ada', 'bisa', 'sudah', 'belum',
    'very', 'much', 'more', 'also', 'just', 'like', 'into', 'over'
  ]);

  const words = prompt.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  const unique = [...new Set(words)].slice(0, 3);
  return unique.length > 0 ? unique.join(',') : 'illustration,scene';
}
