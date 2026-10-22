const fs = require('fs');
const content = fs.readFileSync('e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\WhiteboardComponent.js', 'utf8');

const stack = [];
for (let i = 0; i < content.length; i++) {
  if (content[i] === '{') stack.push(i);
  else if (content[i] === '}') {
    if (stack.length === 0) {
      console.log('UNMATCHED CLOSING BRACE AT INDEX', i);
      console.log(content.substring(Math.max(0, i-50), i+50));
      process.exit(1);
    }
    stack.pop();
  }
}
if (stack.length > 0) {
  console.log('UNMATCHED OPENING BRACES:', stack.length);
} else {
  console.log('BALANCED');
}