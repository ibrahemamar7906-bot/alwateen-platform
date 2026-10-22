'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * LiveCaptionOverlay - Displays real-time captions/subtitles at the bottom of the screen
 * 
 * Receives the captionPayload prop from the parent component which listens to the 
 * 'live_caption' broadcast event.
 * 
 * @param {Object} props
 * @param {boolean} props.isVisible - Whether to show the caption overlay
 * @param {boolean} props.isTeacher - Whether this is the teacher's view
 */
export default function LiveCaptionOverlay({ isVisible = true, isTeacher = false, captionPayload = null }) {
  const [captionLines, setCaptionLines] = useState([]) // Array of { id, text, senderName, isFinal, timestamp }
  const [interimText, setInterimText] = useState('')
  const [interimSender, setInterimSender] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const fadeTimeoutRefs = useRef({})
  const lineIdRef = useRef(0)

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Add a final caption line and schedule its removal
  const addFinalLine = useCallback((text, senderName) => {
    const id = ++lineIdRef.current
    setCaptionLines(prev => {
      // Keep only last 2 lines + the new one
      const kept = prev.slice(-2)
      return [...kept, { id, text, senderName, isFinal: true, timestamp: Date.now() }]
    })
    setInterimText('')
    setInterimSender('')

    // Auto-remove after 5 seconds with fade
    fadeTimeoutRefs.current[id] = setTimeout(() => {
      setCaptionLines(prev => prev.filter(l => l.id !== id))
      delete fadeTimeoutRefs.current[id]
    }, 5000)
  }, [])

  // React to incoming caption payloads (Teacher & Student)
  useEffect(() => {
    if (!isVisible || !captionPayload) return
    
    if (captionPayload.isFinal && captionPayload.text) {
      addFinalLine(captionPayload.text, captionPayload.senderName)
    } else if (captionPayload.text) {
      setInterimText(captionPayload.text)
      setInterimSender(captionPayload.senderName || '')
    }
  }, [captionPayload, isVisible, addFinalLine])

  // Cleanup all timeouts
  useEffect(() => {
    return () => {
      Object.values(fadeTimeoutRefs.current).forEach(clearTimeout)
    }
  }, [])

  // Don't render if not visible or no content
  if (!isVisible) return null
  const hasContent = captionLines.length > 0 || interimText
  if (!hasContent) return null

  return (
    <div style={{
      position: 'absolute',
      bottom: isMobile ? 60 : 80,
      left: '50%',
      transform: 'translateX(-50%)',
      width: isMobile ? '92%' : '70%',
      maxWidth: '800px',
      zIndex: 90,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      direction: 'rtl',
    }}>
      {/* Final caption lines */}
      {captionLines.map((line) => (
        <div
          key={line.id}
          style={{
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: '10px',
            padding: isMobile ? '8px 14px' : '10px 20px',
            animation: 'captionFadeIn 0.3s ease-out',
            maxWidth: '100%',
          }}
        >
          <p style={{
            margin: 0,
            color: '#ffffff',
            fontFamily: "'Tajawal', sans-serif",
            fontSize: isMobile ? '15px' : '19px',
            fontWeight: 600,
            lineHeight: 1.6,
            textAlign: 'center',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            wordBreak: 'break-word',
          }}>
            {line.senderName && <span style={{ color: '#fbbf24', fontWeight: 800, marginLeft: '6px' }}>{line.senderName}:</span>}
            {line.text}
          </p>
        </div>
      ))}

      {/* Interim (partial) text */}
      {interimText && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          borderRadius: '10px',
          padding: isMobile ? '6px 12px' : '8px 18px',
          maxWidth: '100%',
        }}>
          <p style={{
            margin: 0,
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: "'Tajawal', sans-serif",
            fontSize: isMobile ? '14px' : '17px',
            fontWeight: 500,
            fontStyle: 'italic',
            lineHeight: 1.5,
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
            wordBreak: 'break-word',
          }}>
            {interimSender && <span style={{ color: 'rgba(251, 191, 36, 0.8)', fontWeight: 800, marginLeft: '6px' }}>{interimSender}:</span>}
            {interimText}...
          </p>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes captionFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
