import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Maximize2, Minimize2, Trash2, Edit2, ShieldCheck, X } from 'lucide-react';
import { sandboxSyncScript } from '../../live/htmlSandboxSyncScript';

const LiveHtmlSandboxTeacher = ({ channel, currentUserName }) => {
  const [code, setCode] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Tahoma, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; }
    button { padding: 10px 20px; font-size: 18px; cursor: pointer; background: #3b82f6; color: white; border: none; border-radius: 8px; }
    h1 { color: #1e293b; }
  </style>
</head>
<body>
  <h1>مرحباً بك!</h1>
  <p>هذا مجرد كود تجريبي:</p>
  <button id="btn">النقرات: 0</button>
  <script>
    let count = 0;
    document.getElementById('btn').addEventListener('click', function() {
      count++;
      this.innerText = 'النقرات: ' + count;
    });
  </script>
</body>
</html>`);

  const [isRunning, setIsRunning] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layoutMode, setLayoutMode] = useState('full');
  const [scale, setScale] = useState(1);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [runningCode, setRunningCode] = useState('');

  const injectedCode = React.useMemo(() => {
    if (!isRunning || !runningCode) return '';
    if (runningCode.includes('</body>')) {
      return runningCode.replace('</body>', `\n${sandboxSyncScript}\n</body>`);
    }
    return runningCode + `\n${sandboxSyncScript}`;
  }, [runningCode, isRunning]);

  const broadcastSafely = (event, payload, retries = 3) => {
    if (!channel) return;
    let isReady = false;
    if (typeof channel.canPush === 'function') {
      try { isReady = channel.canPush() } catch (_) { isReady = false }
    } else {
      isReady = channel.state === 'joined' && !!channel.socket && typeof channel.socket.isConnected === 'function' && channel.socket.isConnected();
    }
    
    if (isReady) {
      try { channel.send({ type: 'broadcast', event, payload }).catch(()=>{}) } catch(e){}
    } else if (retries > 0) {
      setTimeout(() => broadcastSafely(event, payload, retries - 1), 300);
    }
  };

    useEffect(() => {
    if (layoutMode === 'full' || !containerRef.current) {
      setScale(1); return;
    }
    const updateScale = () => {
      const container = containerRef.current;
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      let targetWidth = 1280, targetHeight = 720;
      if (layoutMode === '16:9') { targetWidth = 1280; targetHeight = 720; }
      else if (layoutMode === '4:3') { targetWidth = 1024; targetHeight = 768; }
      else if (layoutMode === 'A4') { targetWidth = 794; targetHeight = 1123; }
      const padding = 20;
      const scaleX = Math.max(0.1, (clientWidth - padding) / targetWidth);
      const scaleY = Math.max(0.1, (clientHeight - padding) / targetHeight);
      setScale(Math.min(scaleX, scaleY));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [layoutMode, isFullscreen]);

  const handleRun = () => {
    const seed = Math.floor(Math.random() * 1000000);
    const seedScript = `<script>\n      window.__sandboxSeed = ` + seed + `;\n      Math.random = function() {\n        var x = Math.sin(window.__sandboxSeed++) * 10000;\n        return x - Math.floor(x);\n      };\n    </script>\n`;
    
    const finalCode = seedScript + code;
    setRunningCode(finalCode);
    broadcastSafely('sandbox_code_update', { code: finalCode, layoutMode });
  };

  const changeLayout = (mode) => {
    setLayoutMode(mode);
    if (isRunning) {
      broadcastSafely('sandbox_code_update', { code: runningCode, layoutMode: mode });
    }
  };

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'sandbox_sync') {
        if (channel) {
          channel.send({
            type: 'broadcast',
            event: 'sandbox_sync_event',
            payload: { ...e.data, senderName: currentUserName || 'المعلم' }
          });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [channel, currentUserName]);

  useEffect(() => {
    const handler = (e) => {
      const payload = e.detail;
      if (payload.senderName === currentUserName) return; 
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'remote_sandbox_sync',
          payload: payload
        }, '*');
      }
    };
    window.addEventListener('on_sandbox_sync_event', handler);
    return () => window.removeEventListener('on_sandbox_sync_event', handler);
  }, [currentUserName]);

  useEffect(() => {
    if (!channel) return;
    const handler = () => {
      broadcastSafely('sandbox_code_update', { code: runningCode, layoutMode });
    };
    window.addEventListener('on_global_sync_request', handler);
    return () => window.removeEventListener('on_global_sync_request', handler);
  }, [channel, runningCode, layoutMode]);

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0f172a', borderRadius: '12px'
    }}>
      <div style={{
        padding: '12px 20px', background: '#1e293b', display: 'flex', 
        justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ color: '#f8fafc', margin: 0, fontSize: '1.1rem', fontFamily: 'Tajawal' }}>
            محرر الأكواد المباشر (Sandbox)
          </h3>
          <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
            مزامنة حية
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', background: '#020617', borderRadius: '8px', padding: '2px', marginRight: '15px' }}>
             {['full', '16:9', '4:3', 'A4'].map(mode => (
               <button
                 key={mode}
                 onClick={() => changeLayout(mode)}
                 style={{
                   background: layoutMode === mode ? '#3b82f6' : 'transparent',
                   color: layoutMode === mode ? 'white' : '#94a3b8',
                   border: 'none', padding: '4px 12px', borderRadius: '6px',
                   fontSize: '13px', cursor: 'pointer', fontWeight: layoutMode === mode ? 'bold' : 'normal',
                   transition: 'all 0.2s'
                 }}
               >
                 {mode === 'full' ? 'شاشة كاملة' : mode}
               </button>
             ))}
          </div>

          <button onClick={() => { setCode(''); setRunningCode(''); broadcastSafely('sandbox_code_update', { code: '', layoutMode }); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /> مسح الكود</button>
          <button onClick={handleRun} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}><Play size={16} fill="currentColor" /> تحديث العرض للطالب</button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#334155', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>{isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", display: "flex", minWidth: 0, minHeight: 0 }}>
        
        <div style={{ width: '40%', padding: '20px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #334155' }}>
          <div style={{ background: '#1e293b', padding: '12px 16px', borderRadius: '8px 8px 0 0', color: '#cbd5e1', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="#10b981" />
            محرر الأكواد (HTML/JS/CSS)
          </div>
          <textarea 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              flex: 1, width: '100%', background: '#020617', color: '#a5b4fc', border: '1px solid #1e293b', 
              borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '16px', fontFamily: 'monospace',
              fontSize: '15px', resize: 'none', outline: 'none', direction: 'ltr'
            }}
            placeholder="<!-- اكتب الكود هنا -->"
            spellCheck="false"
          />
        </div>
        
        <div ref={containerRef} style={{ 
          flex: 1, minWidth: 0, minHeight: 0, background: layoutMode === "full" ? "#fff" : "#020617",
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          width: isFullscreen ? '100vw' : '100%',
          height: isFullscreen ? '100vh' : '100%',
          zIndex: isFullscreen ? 9999999 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          {isFullscreen && (
            <button 
              onClick={() => setIsFullscreen(false)}
              style={{ position: 'absolute', top: 20, right: 20, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 99999, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
            >
              <X size={24} />
            </button>
          )}
          
                    {layoutMode === 'full' ? (
                <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', position: 'relative' }}>
                  <iframe ref={iframeRef} srcDoc={injectedCode} style={{ flex: 1, width: '100%', height: '100%', border: 'none', background: 'white' }} title="Teacher Output" sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups" />
                </div>
              ) : (
                <div style={{
                  width: (layoutMode === '16:9' ? 1280 : (layoutMode === '4:3' ? 1024 : 794)) * scale,
                  height: (layoutMode === '16:9' ? 720 : (layoutMode === '4:3' ? 768 : 1123)) * scale,
                  position: 'relative',
                  flexShrink: 0
                }}>
                  <div style={{
                    width: layoutMode === '16:9' ? 1280 : (layoutMode === '4:3' ? 1024 : 794),
                    height: layoutMode === '16:9' ? 720 : (layoutMode === '4:3' ? 768 : 1123),
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    background: '#fff',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    display: 'flex',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}>
                    <iframe ref={iframeRef} srcDoc={injectedCode} style={{ flex: 1, width: '100%', height: '100%', border: 'none', background: 'white' }} title="Teacher Output" sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups" />
                  </div>
                </div>
              )}
        </div>
      </div>
    </div>
  );
}

export default LiveHtmlSandboxTeacher;
