import https from 'https';

const url = "https://image.pollinations.ai/prompt/a%20beautiful%20mountain?width=800&height=450&nologo=true";

https.get(url, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  let chunks = [];
  res.on('data', d => chunks.push(d));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    console.log('Size:', buffer.length);
  });
}).on('error', (e) => {
  console.error(e);
});
