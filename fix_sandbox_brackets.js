const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\components\\LiveHtmlSandboxStudent.js';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
    // Request initial state if joining late
    try {
      channel.send({
        type: 'broadcast',
        event: 'global_sync_request',
        payload: { requestedBy: currentUserName }
      }).catch(e => {});
    } catch(e) {}

    return () => {
      window.removeEventListener('on_sandbox_code_update', handler);
    };
  }, [channel, currentUserName]);

  useEffect(() => {
`;

content = content.replace(
  /\/\/ Request initial state if joining late\n\s*channel\.send\(\{\n\s*type: 'broadcast',\n\s*event: 'global_sync_request',\n\s*payload: \{ requestedBy: currentUserName \}\n\s*\}\)\n\s*useEffect\(\(\) => \{/g,
  replacement.trim() + ' {'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed LiveHtmlSandboxStudent.js bracket syntax error!');
