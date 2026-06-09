import https from 'https';

const prompt = encodeURIComponent('A beautiful mountain');
const url = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=450&nologo=true`;

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
  }
};

https.get(url, options, (res) => {
  console.log('Status:', res.statusCode);
  if (res.statusCode >= 300 && res.statusCode < 400) {
    console.log('Redirect:', res.headers.location);
  }
}).on('error', (e) => {
  console.error(e);
});
