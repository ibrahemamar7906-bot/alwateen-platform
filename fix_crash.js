const fs = require('fs');

function fixSyncCrash(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // Pattern to look for:
    // channel.send({
    //   type: 'broadcast',
    //   event: '..._request',
    //   payload: { action: 'request_sync' }
    // }).catch(...)

    const regex = /channel\.send\(\{\s*type: 'broadcast',\s*event: '[^']+',\s*payload: \{ action: 'request_sync' \}\s*\}\)\.catch\([^)]+\);?/g;
    
    if (content.match(regex)) {
        content = content.replace(regex, (match) => {
            return `
    let isReady = false;
    if (typeof channel.canPush === 'function') {
      try { isReady = channel.canPush() } catch (_) { isReady = false }
    } else {
      isReady = channel.state === 'joined' && !!channel.socket && typeof channel.socket.isConnected === 'function' && channel.socket.isConnected();
    }
    
    if (isReady) {
      ${match}
    } else {
      // Retry in a bit if not connected yet
      setTimeout(() => {
        try { ${match} } catch(e){}
      }, 2000);
    }
`;
        });
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed crash in ' + file);
    } else {
        console.log('No direct channel.send crash found in ' + file);
    }
}

fixSyncCrash('e:\\منصة الوتين\\app\\live\\LiveArabicBoardStudent.js');
fixSyncCrash('e:\\منصة الوتين\\app\\live\\LiveEnglishBoardStudent.js');
fixSyncCrash('e:\\منصة الوتين\\app\\live\\LiveMathBoardStudent.js');
fixSyncCrash('e:\\منصة الوتين\\app\\live\\components\\LiveHtmlSandboxStudent.js');

