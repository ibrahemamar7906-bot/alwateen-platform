const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\components\\LiveHtmlSandboxStudent.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /const injectedCode = runningCode\.replace\([\s\S]*?`<head><script>\$\{sandboxSyncScript\}<\/script>`\s*\)/;
const replacement = `let injectedCode = runningCode;
      if (runningCode.includes('</body>')) {
        injectedCode = runningCode.replace('</body>', \`\\n\${sandboxSyncScript}\\n</body>\`);
      } else {
        injectedCode = runningCode + \`\\n\${sandboxSyncScript}\`;
      }`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed sandboxSyncScript injection in student iframe!');
