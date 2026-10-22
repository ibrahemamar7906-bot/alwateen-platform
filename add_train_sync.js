const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveTrainGameTeacher.js';
let content = fs.readFileSync(file, 'utf8');

const injection = `
    const syncReqListener = channel.on('broadcast', { event: 'global_sync_request' }, () => {
      broadcastState({});
    });
    return () => {
      if (syncReqListener) syncReqListener.unsubscribe();
    }
`;

if (!content.includes('global_sync_request')) {
    content = content.replace(/    return \(\) => \{\n\s*\}\n\s*\}, \[channel\]\)/, injection + '\n  }, [channel])');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added global_sync_request to Train Game Teacher');
}
