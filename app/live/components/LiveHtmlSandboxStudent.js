'use client'

import React, { useState, useEffect, useRef } from 'react'
import { sandboxSyncScript } from '../htmlSandboxSyncScript'
import { Code, Lock } from 'lucide-react'

export default function LiveHtmlSandboxStudent({ channel, currentUserName, hasControl, initialCode }) {
  const [runningCode, setRunningCode] = useState(initialCode || '')
  const [isRunning, setIsRunning] = useState(!!initialCode)
  const [layoutMode, setLayoutMode] = useState('full')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  // Listen for code updates from teacher
  useEffect(() => {
    if (!channel) return;

    const handler = (e) => {
      const newCode = e.detail.code;
      if (newCode === null || newCode === undefined || newCode === '') {
        setIsRunning(false);
        setRunningCode('');
      } else {
        setRunningCode(newCode);
        setIsRunning(true);
      }
      if (e.detail.layoutMode) setLayoutMode(e.detail.layoutMode);
      if (e.detail.isFullscreen !== undefined) setIsFullscreen(e.detail.isFullscreen);
    }
    window.addEventListener('on_sandbox_code_update', handler);

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
          payload: {}
        }).catch(e => {});
      } catch(e) {}
    };

    if (isReady) requestSync();
    else setTimeout(requestSync, 2000);

    return () => {
      window.removeEventListener('on_sandbox_code_update', handler);
      // cleanup handled by parent
    };
  }, [channel, currentUserName])

  const broadcastSafely = (event, payload, retries = 5) => {
    if (!channel) return;
    let isReady = false;
    if (typeof channel.canPush === 'function') {
      try { isReady = channel.canPush() } catch (_) { isReady = false }
    } else {
      isReady = channel.state === 'joined' && !!channel.socket && typeof channel.socket.isConnected === 'function' && channel.socket.isConnected();
    }
    
    if (isReady) {
      channel.send({ type: 'broadcast', event, payload }).catch(()=>{});
    } else if (retries > 0) {
      setTimeout(() => broadcastSafely(event, payload, retries - 1), 300);
    }
  }

  useEffect(() => {
    if (!isRunning) return;
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'sandbox_sync') {
        broadcastSafely('sandbox_sync_event', { ...e.data, senderName: currentUserName || 'مجهول' });
      }
    }
    window.addEventListener('message', handleMessage);

    const handleTeacherSync = (e) => {
      const payload = e.detail;
      if (payload.senderName === currentUserName) return;
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'remote_sandbox_sync', payload: payload }, '*');
      }
    };
    window.addEventListener('on_sandbox_sync_event', handleTeacherSync);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('on_sandbox_sync_event', handleTeacherSync);
    }
  }, [isRunning, currentUserName, channel])

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

  const injectedCode = React.useMemo(() => {
    if (!isRunning || !runningCode) return '';
    if (runningCode.includes('</body>')) {
      return runningCode.replace('</body>', `\n${sandboxSyncScript}\n</body>`);
    }
    return runningCode + `\n${sandboxSyncScript}`;
  }, [runningCode, isRunning]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e293b', color: 'white', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px', background: '#0f172a', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={18} color="#38bdf8" />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>أكواد الطالب النشطة</span>
        </div>
        {!hasControl && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#94a3b8' }}>
            <Lock size={14} />
            <span>للعرض فقط</span>
          </div>
        )}
      </div>

      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {!isRunning ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#94a3b8', fontSize: '18px', textAlign: 'center', padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <Code size={48} color="#334155" />
              <span>في انتظار المعلم...</span>
            </div>
          </div>
        ) : (
          <div ref={containerRef} style={{ flex: 1, minWidth: 0, minHeight: 0, background: layoutMode === "full" ? "white" : "#020617", position: isFullscreen ? "fixed" : "relative", top: isFullscreen ? 0 : "auto", left: isFullscreen ? 0 : "auto", width: isFullscreen ? "100vw" : "100%", height: isFullscreen ? "100vh" : "100%", zIndex: isFullscreen ? 9999999 : 1, display: "flex", alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {layoutMode === 'full' ? (
                <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', position: 'relative' }}>
                  <iframe ref={iframeRef} srcDoc={injectedCode} style={{ flex: 1, width: '100%', height: '100%', border: 'none', background: 'white' }} title="Student Output" sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups" />
                  {!hasControl && <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'not-allowed', background: 'transparent' }} />}
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
                    <iframe ref={iframeRef} srcDoc={injectedCode} style={{ flex: 1, width: '100%', height: '100%', border: 'none', background: 'white' }} title="Student Output" sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups" />
                    {!hasControl && <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'not-allowed', background: 'transparent' }} />}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  )
}

