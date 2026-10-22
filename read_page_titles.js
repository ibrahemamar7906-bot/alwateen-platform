const fs = require('fs');
const data = fs.readFileSync('e:/منصة الوتين/app/kids-corner/pathway/prep2_data.js', 'utf8');

const pages = ['103', '160', '167', '181', '195'];
pages.forEach(p => {
  const match = data.match(new RegExp(`title: 'ص ${p}\\)',[\\s\\S]*?content: \`<h3>النص الأصلي<\\/h3><p>(.*?)<\\/p>`));
  if (match) {
    console.log(`Page ${p} starts with: ${match[1].substring(0, 50)}`);
  }
});
