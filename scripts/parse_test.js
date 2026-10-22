const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('prep3_curriculum_safe.txt', 'utf8');
const sections = content.split('###').filter(s => s.trim().length > 0);

console.log('Total sections:', sections.length);
sections.forEach((s, i) => {
  const firstLine = s.trim().split('\n')[0].replace(/\*\*/g, '').trim();
  console.log(`${i + 1}: ${firstLine}`);
});
