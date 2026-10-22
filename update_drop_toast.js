const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\virtual-classroom\\page.js';
let content = fs.readFileSync(file, 'utf8');

// The original line was: showToast('⚠️ انقطع الاتصال... جاري إعادة الاتصال ⏳', 'warning')
// Let's replace the warning with a clearer message
content = content.replace(
  /showToast\(['"].*?انقطع الاتصال.*?\['"], ['"]warning['"]\)/g,
  "showToast('⚠️ تم قطع الاتصال من شبكتك المحلية... جاري محاولة الاستعادة ⏳', 'warning')"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Updated connection drop toast!');
