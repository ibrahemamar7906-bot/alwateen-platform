const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\components\\LiveHtmlSandboxStudent.js';
let content = fs.readFileSync(file, 'utf8');

const injection = `
  useEffect(() => {
    if (!channel) return;
    
    // Request sync on mount
    try {
      channel.send({
        type: 'broadcast',
        event: 'html_sandbox_action',
        payload: { action: 'request_sync' }
      }).catch(e => {});
    } catch(e) {}
    
    const sub = channel.on('broadcast', { event: 'html_sandbox_action' }, ({ payload }) => {
      if (payload.action === 'sync_state') {
        if (payload.code !== undefined) setCode(payload.code);
        if (payload.runningCode !== undefined) setRunningCode(payload.runningCode);
        if (payload.isRunning !== undefined) setIsRunning(payload.isRunning);
      } else if (payload.action === 'update_code') {
        setCode(payload.code);
      } else if (payload.action === 'run_code') {
        setRunningCode(payload.runningCode);
        setIsRunning(true);
      } else if (payload.action === 'stop_code') {
        setIsRunning(false);
      }
    });

    return () => { channel.unsubscribe(); }
  }, [channel]);
`;

if (!content.includes('request_sync')) {
  // Inject before return
  content = content.replace('  return (', injection + '\n  return (');
  fs.writeFileSync(file, content, 'utf8');
  console.log('Added sync to LiveHtmlSandboxStudent');
} else {
  console.log('Already has sync');
}
