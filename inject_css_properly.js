const fs = require('fs');

function injectCSS(file, cssImport) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes(cssImport)) {
        // Insert right after 'use client'
        content = content.replace(/['"]use client['"];?\n?/, "'use client'\n\n" + cssImport + "\n");
        fs.writeFileSync(file, content, 'utf8');
        console.log('Injected into ' + file);
    }
}

injectCSS('e:\\منصة الوتين\\app\\teacher-assistant\\virtual-classroom\\page.js', "import '../whiteboard/page.module.css';");
injectCSS('e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\page.js', "import './page.module.css';");

console.log('Done');
