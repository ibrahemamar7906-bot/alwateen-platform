const fs = require('fs');
const dir = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\';
const filesToFix = [
  'BackgroundsLibraryModal.js',
  'BlindOverlay.js',
  'QuranPlayerOverlay.js',
  'SpinWheelOverlay.js',
  'SpotlightOverlay.js',
  'StickersLibraryModal.js',
  'TimerOverlay.js',
  'WordBuilderOverlay.js' // It might have been missed or failed the regex earlier
];

filesToFix.forEach(f => {
  const path = dir + f;
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');

  // Check if it already has the check
  const firstLines = content.split('\n').slice(0, 30).join('\n');
  if (!firstLines.includes('!isActive') && !firstLines.includes('!isOpen') && !firstLines.includes('!show')) {
    console.log('Fixing', f);
    
    // Some components might use isOpen instead of isActive
    const isOpenComponent = f.includes('LibraryModal');
    const condition = isOpenComponent ? '  if (!isActive && typeof isActive !== "undefined" && typeof isOpen !== "undefined" && !isOpen) return null;\n  if (typeof isActive !== "undefined" && !isActive) return null;\n  if (typeof isOpen !== "undefined" && !isOpen) return null;\n' : '  if (!isActive) return null;\n';

    // Find export default function XYZ(...) {
    content = content.replace(/export default function [a-zA-Z]+\([^)]*\)\s*\{/, match => match + '\n' + condition);
    fs.writeFileSync(path, content, 'utf8');
  } else {
    console.log('Already has check:', f);
  }
});
