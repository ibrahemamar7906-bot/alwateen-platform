const fs = require('fs');

// 1. Update CSS
const cssFile = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\page.module.css';
let css = fs.readFileSync(cssFile, 'utf8');
css = css.replace(/\.leftToolbar\s*\{[^}]+\}/, (match) => {
    return match.replace(/left:\s*16px;/, 'right: 16px; left: auto;');
});
fs.writeFileSync(cssFile, css, 'utf8');
console.log('Updated CSS');

// 2. Remove tooltips from JS
function removeTooltips(file) {
    let content = fs.readFileSync(file, 'utf8');
    // Regex to match <span className={styles.tooltip}>...</span>
    content = content.replace(/<span className=\{styles\.tooltip\}>.*?<\/span>/g, '');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Removed tooltips from ' + file);
}

removeTooltips('e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\WhiteboardComponent.js');
removeTooltips('e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js');

