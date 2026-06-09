import https from 'https';

const token = "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";
const url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

const data = JSON.stringify({ inputs: "A beautiful cinematic shot of a mountain" });

const req = https.request(url, {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json' 
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body.substring(0, 500)));
});

req.write(data);
req.end();
