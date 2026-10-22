const cssModules = require('css-modules-loader-core');
const fs = require('fs');
const core = new cssModules();
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\page.module.css';
const content = fs.readFileSync(file, 'utf8');
core.load(content, file, "", () => {}).then(({ injectableSource, exportTokens }) => {
  console.log("Tokens generated:", Object.keys(exportTokens).length);
}).catch(err => {
  console.log("CSS Module Error:", err);
});
