const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\virtual-classroom\\InteractiveGrammarStage.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /    \/\/ If student, request sync on mount\n\s*if \(!isTeacher\) \{\n\s*channel\.send\(\{\n\s*type: 'broadcast',\n\s*event: 'grammar_sync',\n\s*payload: \{ action: 'request_sync' \}\n\s*\}\)\.catch\(e => \{\}\);\n\s*\}/;

const replacement = `
    // If student, request sync on mount
    if (!isTeacher) {
      let isReady = false;
      if (typeof channel.canPush === 'function') {
        try { isReady = channel.canPush() } catch (_) { isReady = false }
      } else {
        isReady = channel.state === 'joined' && !!channel.socket && typeof channel.socket.isConnected === 'function' && channel.socket.isConnected();
      }
      
      const sendReq = () => {
        try {
          channel.send({
            type: 'broadcast',
            event: 'grammar_sync',
            payload: { action: 'request_sync' }
          }).catch(e => {});
        } catch(e) {}
      };

      if (isReady) {
        sendReq();
      } else {
        setTimeout(sendReq, 2000);
      }
    }
`;

if (content.match(regex)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed crash in InteractiveGrammarStage');
} else {
    console.log('Could not find pattern to replace!');
}
