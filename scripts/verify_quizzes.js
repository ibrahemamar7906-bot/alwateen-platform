const fs = require('fs');
const content = fs.readFileSync('app/prep-3/data/prep3_quizzes.js', 'utf8');

if (content.includes('"---"') || content.includes("'---'")) {
  console.log('FAIL: found --- in quizzes');
} else {
  console.log('PASS: No --- in quizzes');
}

const match = content.match(/\"dictation_lesson-1\"[\s\S]*?\"dictation_lesson-2\"/);
if (match) {
  console.log('dictation_lesson-1:\n' + match[0]);
}

const match3 = content.match(/\"dictation_lesson-3\"[\s\S]*?\"dictation_writing-1\"/);
if (match3) {
  console.log('dictation_lesson-3:\n' + match3[0]);
}

