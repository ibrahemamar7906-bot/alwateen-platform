const fs = require('fs');
const cssFile = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\page.module.css';
let css = fs.readFileSync(cssFile, 'utf8');

// We already changed topRightToolbar to left: 16px;
// Let's change topLeftToolbar to right: 16px;
css = css.replace(/\.topLeftToolbar\s*\{[^}]+\}/, (match) => {
    return match.replace(/left:\s*16px;/, 'right: 16px; left: auto;');
});

fs.writeFileSync(cssFile, css, 'utf8');
console.log('Swapped topLeftToolbar to right');
