const fs = require('fs');

function fixCSSImport(file, wrongImport, rightImport) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(wrongImport)) {
        content = content.replace(wrongImport, rightImport);
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed in ' + file);
    }
}

fixCSSImport('e:\\منصة الوتين\\app\\teacher-assistant\\virtual-classroom\\page.js', "import '../whiteboard/page.module.css';", "import dummyStyles from '../whiteboard/page.module.css';");
fixCSSImport('e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\page.js', "import './page.module.css';", "import dummyStyles from './page.module.css';");

console.log('Done fixing imports');
