const fetch = require('node-fetch');
async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemini-3.1-flash',
        contents: [{ parts: [{ text: 'You are an expert SVG coder. Write the complete, clean SVG code to draw: قلب انسان ببياناته. It should be a standalone SVG with proper viewBox, colors, and paths. Do not wrap in markdown blocks, output ONLY the raw SVG code.' }] }]
      })
    });
    console.log(res.status);
    const data = await res.json();
    console.log(JSON.stringify(data).substring(0, 200));
  } catch(e) { console.log('Error', e); }
}
test();
