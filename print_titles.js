const fs = require('fs');
const path = require('path');
const dirs = fs.readdirSync('app/prep-1/reading-and-texts').filter(f => !f.includes('.'));
for(const d of dirs) {
    const file = path.join('app/prep-1/reading-and-texts', d, 'page.js');
    const content = fs.readFileSync(file, 'utf8');
    const match = content.match(/<h1[^>]*>(.*?)<\/h1>/);
    if (match) console.log(d + ': ' + match[1]);
}
