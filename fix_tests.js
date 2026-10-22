const fs = require('fs');
const path = require('path');

const dir = 'e:/„·›«  «·„‰’…/-/app/sec-2/unseen-reading';
for (let i = 11; i <= 20; i++) {
  const file = path.join(dir, 'test-' + i, 'page.js');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix title string literal issue
    content = content.replace(/title="\{PASSAGE\.title\}"/g, 'title={PASSAGE.title}');
    
    // Fix passage object issue
    content = content.replace(/passage=\{PASSAGE\}/g, 'passage={PASSAGE.content ? PASSAGE.content.join(\n\n) : PASSAGE}');
    
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  }
}
