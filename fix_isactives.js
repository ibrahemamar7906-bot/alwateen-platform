const fs = require('fs');
const files = [
  'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\QuizShowOverlay.js',
  'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\WordSearchOverlay.js',
  'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\WordBuilderOverlay.js',
  'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\HangmanOverlay.js',
  'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\StickersLibraryModal.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Fix the broken insertion inside the file
  content = content.replace('  if (!isActive) return null;\n  return (\n', '  return (\n');
  content = content.replace('  if (!isOpen) return null;\n  return (\n', '  return (\n');

  // Inject at the correct place (just after export default function...)
  // We match the export default function and the opening bracket
  if (file.includes('StickersLibraryModal')) {
    content = content.replace(/export default function [a-zA-Z]+\([^)]+\)\s*\{/, match => match + '\n  if (!isActive && typeof isActive !== "undefined") return null;\n  if (typeof isOpen !== "undefined" && !isOpen) return null;\n');
  } else {
    content = content.replace(/export default function [a-zA-Z]+\([^)]+\)\s*\{/, match => match + '\n  if (!isActive) return null;\n');
  }

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed broken isActives');
