const fs = require('fs');
const cssFile = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\page.module.css';
let css = fs.readFileSync(cssFile, 'utf8');

css = css.replace(/\.topRightToolbar\s*\{[^}]+\}/, (match) => {
    return match.replace(/right:\s*16px;/, 'left: 16px; right: auto;');
});

css = css.replace(/\.topLeftToolbar\s*\{[^}]+\}/, (match) => {
    return match.replace(/left:\s*16px;/, 'right: 16px; left: auto;');
});

fs.writeFileSync(cssFile, css, 'utf8');
console.log('Swapped side toolbars in CSS');
