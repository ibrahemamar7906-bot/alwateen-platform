const fs = require('fs');
const path = require('path');

const dir = 'e:/ãäÕÉ ÇáÌäíÏí/app/teacher-assistant/whiteboard';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Overlay.js'));

files.forEach(f => {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove all lines containing if (!isActive) return null;
    content = content.replace(/^\s*if\s*\(!isActive\)\s*return\s*null;?\s*$/gm, '');
    
    // Find the main return statement of the component.
    // Usually it's   return ( or similar.
    let lines = content.split('\n');
    let inserted = false;
    for (let i = 0; i < lines.length; i++) {
        if (/^ {0,4}return\s*\($/.test(lines[i])) {
            lines.splice(i, 0, '  if (!isActive) return null;');
            inserted = true;
            break;
        }
    }
    
    if (inserted) {
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
        console.log('Fixed ' + f);
    } else {
        console.log('Could not find return in ' + f);
    }
});
