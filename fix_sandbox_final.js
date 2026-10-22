const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\components\\LiveHtmlSandboxStudent.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /\/\/ Listen for code updates from teacher\s*useEffect\(\(\) => \{[\s\S]*?\}, \[channel, currentUserName\]\)/;

const replacement = `
  // Sync logic
  useEffect(() => {
    if (!channel) return;

    const handler = (e) => {
      setCode(e.detail.code)
    }
    window.addEventListener('on_sandbox_code_update', handler);

    // Request initial state if joining late
    let isReady = false;
    if (typeof channel.canPush === 'function') {
      try { isReady = channel.canPush() } catch (_) { isReady = false }
    } else {
      isReady = channel.state === 'joined' && !!channel.socket && typeof channel.socket.isConnected === 'function' && channel.socket.isConnected();
    }

    const requestSync = () => {
      try {
        channel.send({
          type: 'broadcast',
          event: 'global_sync_request',
          payload: { requestedBy: currentUserName }
        }).catch(e => {});

        channel.send({
          type: 'broadcast',
          event: 'html_sandbox_action',
          payload: { action: 'request_sync' }
        }).catch(e => {});
      } catch(e) {}
    };

    if (isReady) {
      requestSync();
    } else {
      setTimeout(requestSync, 2000);
    }

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

    return () => {
      window.removeEventListener('on_sandbox_code_update', handler);
      // We don't unsubscribe the entire channel here, it's managed globally
    };
  }, [channel, currentUserName])
`;

content = content.replace(regex, replacement.trim());
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed LiveHtmlSandboxStudent.js!');
