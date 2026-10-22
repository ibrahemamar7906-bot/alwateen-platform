const fs = require('fs');

const path = 'e:/ملفات المنصة/-/app/virtual-classroom/page.js';
let code = fs.readFileSync(path, 'utf8');

const games = ['MemoryGameOverlay', 'HangmanOverlay', 'QuizShowOverlay', 'WordSearchOverlay', 'WordBuilderOverlay', 'SpinWheelOverlay'];

games.forEach(game => {
  code = code.replace(new RegExp('<' + game + '[\\s\\S]*?\\/>', 'g'), (match) => {
    if (match.includes('import ')) return match;
    const toolMatch = match.match(/isActive=\\{activeTool === '([^']+)'\\}/);
    if (toolMatch) {
      return '<' + game + ' isActive={activeTool === \\'' + toolMatch[1] + '\\'} isStudent={true} channel={channel} onClose={() => {}} />';
    }
    return match;
  });
});

fs.writeFileSync(path, code);
console.log('Fixed student page');
