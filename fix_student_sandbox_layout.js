const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\components\\LiveHtmlSandboxStudent.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div style=\{\{ display: 'flex', flex: 1, overflow: 'hidden' \}\}>[\s\S]*?<\/div>\s*<\/div>\s*\)\s*\}\s*$/;

const replacement = `
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {!isRunning ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <textarea
              value={code || ''}
              readOnly={!hasControl}
              onChange={(e) => {
                if (hasControl) {
                  setCode(e.target.value);
                  broadcastSafely('html_sandbox_action', { action: 'update_code', code: e.target.value });
                }
              }}
              style={{
                flex: 1, width: '100%', background: '#020617', color: '#a5b4fc', padding: '20px',
                fontFamily: 'monospace', fontSize: '15px', border: 'none', outline: 'none', resize: 'none', direction: 'ltr'
              }}
              placeholder="<!-- سيظهر كود المعلم هنا -->"
              spellCheck="false"
            />
            {!hasControl && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', cursor: 'not-allowed' }} />
            )}
          </div>
        ) : (
          <div style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <iframe
              ref={iframeRef}
              style={{ flex: 1, width: '100%', border: 'none', background: 'white' }}
              title="Student Output"
              sandbox="allow-scripts allow-same-origin allow-modals"
            />
            {!hasControl && (
               <div style={{ position: 'absolute', inset: 0, zIndex: 50, cursor: 'not-allowed' }} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
`;

content = content.replace(regex, replacement.trim());
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed LiveHtmlSandboxStudent layout!');
