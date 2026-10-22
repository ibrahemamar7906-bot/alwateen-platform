const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveHtmlSandboxTeacher.js';
let content = fs.readFileSync(file, 'utf8');

const injection = `
  const syncStateRef = useRef({ code, runningCode, isRunning });
  useEffect(() => {
    syncStateRef.current = { code, runningCode, isRunning };
  }, [code, runningCode, isRunning]);

  useEffect(() => {
    if (!channel) return;
    const sub = channel.on('broadcast', { event: 'html_sandbox_action' }, ({ payload }) => {
      if (payload.action === 'request_sync') {
        broadcastSafely('html_sandbox_action', { 
          action: 'sync_state', 
          code: syncStateRef.current.code,
          runningCode: syncStateRef.current.runningCode,
          isRunning: syncStateRef.current.isRunning
        });
      }
    });
    return () => { channel.unsubscribe(); }
  }, [channel]);
`;

if (!content.includes('request_sync')) {
  // Inject before broadcastSafely
  content = content.replace('const broadcastSafely = (event, payload, retries = 5) => {', injection + '\n  const broadcastSafely = (event, payload, retries = 5) => {');
  fs.writeFileSync(file, content, 'utf8');
  console.log('Added sync to LiveHtmlSandboxTeacher');
} else {
  console.log('Already has sync');
}
