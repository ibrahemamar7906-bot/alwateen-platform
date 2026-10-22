const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\components\\LiveHtmlSandboxStudent.js';

const newContent = `
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { sandboxSyncScript } from '../htmlSandboxSyncScript'
import { Code, Lock } from 'lucide-react'

export default function LiveHtmlSandboxStudent({ channel, currentUserName, hasControl, initialCode }) {
  const [code, setCode] = useState(initialCode || null)
  const [runningCode, setRunningCode] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const iframeRef = useRef(null)

  // Sync with initialCode if it changes from parent
  useEffect(() => {
    if (initialCode !== undefined && initialCode !== null) {
      setCode(initialCode)
    }
  }, [initialCode])

  // Listen for code updates from teacher
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
      // We don't unsubscribe the channel, it's global
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
      channel.send({
        type: 'broadcast',
        event,
        payload
      }).catch(e => console.warn('Broadcast failed:', e));
    } else if (retries > 0) {
      setTimeout(() => broadcastSafely(event, payload, retries - 1), 500);
    }
  }

  // Effect to update iframe when runningCode changes and isRunning is true
  useEffect(() => {
    if (isRunning && iframeRef.current && runningCode) {
      const injectedCode = runningCode.replace(
        '<head>',
        \`<head><script>\${sandboxSyncScript}</script>\`
      )
      const doc = iframeRef.current.contentWindow.document
      doc.open()
      doc.write(injectedCode)
      doc.close()
    }
  }, [runningCode, isRunning])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e293b', color: 'white', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px', background: '#0f172a', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={18} color="#38bdf8" />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>المعمل البرمجي</span>
        </div>
        {!hasControl && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#94a3b8' }}>
            <Lock size={14} />
            <span>للمشاهدة فقط</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Editor (Read Only for Student if !hasControl) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #334155', position: 'relative' }}>
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
              flex: 1, width: '100%', background: '#1e293b', color: '#f8fafc', padding: '15px',
              fontFamily: 'monospace', fontSize: '14px', border: 'none', outline: 'none', resize: 'none', direction: 'ltr'
            }}
            placeholder="<!-- سيظهر كود المعلم هنا -->"
          />
          {!hasControl && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', cursor: 'not-allowed' }} />
          )}
        </div>

        {/* Output */}
        <div style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {isRunning ? (
            <iframe
              ref={iframeRef}
              style={{ flex: 1, width: '100%', border: 'none', background: 'white' }}
              title="Student Output"
              sandbox="allow-scripts allow-same-origin allow-modals"
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: '#f8fafc' }}>
              <span>في انتظار تشغيل الكود من المعلم...</span>
            </div>
          )}
          {/* Prevent student interaction with the output if they don't have control */}
          {!hasControl && isRunning && (
             <div style={{ position: 'absolute', inset: 0, zIndex: 50, cursor: 'not-allowed' }} />
          )}
        </div>
      </div>
    </div>
  )
}
`

fs.writeFileSync(file, newContent.trim(), 'utf8');
console.log('Completely fixed LiveHtmlSandboxStudent.js');
