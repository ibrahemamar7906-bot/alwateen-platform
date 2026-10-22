const fs = require('fs');

const files = [
  'app/prep-2/grammar/lesson-1/page.js',
  'app/prep-2/grammar/lesson-2/page.js',
  'app/prep-2/reading/lesson-1/page.js',
  'app/prep-2/reading/lesson-2/page.js',
  'app/prep-2/reading/lesson-3/page.js',
  'app/prep-2/reading/lesson-4/page.js',
  'app/prep-2/rhetoric/lesson-1/page.js',
  'app/prep-2/rhetoric/lesson-2/page.js',
  'app/prep-2/texts/lesson-1/page.js',
  'app/prep-2/texts/lesson-2/page.js',
  'app/prep-2/texts/lesson-3/page.js'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Look for const PASSAGE = \n or something similar, and it ends before const PASSAGE_SECTIONS
    const regex = /(const PASSAGE = )([\s\S]*?)(?=\nconst PASSAGE_SECTIONS = \[)/;
    const match = content.match(regex);
    if (match) {
        let text = match[2];
        if (!text.trim().startsWith('`') && !text.trim().startsWith('"') && !text.trim().startsWith("'")) {
           content = content.replace(regex, "$1`\n" + text.trim() + "\n`");
           fs.writeFileSync(file, content, 'utf8');
           console.log('Fixed ' + file);
        } else {
           console.log('Already quoted ' + file);
        }
    } else {
        console.log('No match in ' + file);
    }
  } else {
      console.log('File not found: ' + file);
  }
}
