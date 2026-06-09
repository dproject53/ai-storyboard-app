import https from 'https';

const key = "AIzaSyCXPlFMutP9bU_osDmVYMsC090FT2SpSf8";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

const data = JSON.stringify({
  contents: [{ parts: [{ text: "Hello" }] }]
});

const req = https.request(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.write(data);
req.end();
