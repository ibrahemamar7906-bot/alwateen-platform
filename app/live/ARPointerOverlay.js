'use client'

import React, { useState, useEffect, useRef } from 'react'

/**
 * ARPointerOverlay
 * Renders the teacher's live Augmented Reality (AR) laser pointer & hand gestures
 * on the student's screen in real-time via Supabase Broadcast.
 */
export default function ARPointerOverlay({ channel }) {
  const [pointer, setPointer] = useState({
    active: false,
    x: 0.5,
    y: 0.5,
    mode: 'laser',
    color: '#ef4444',
    isPinching: false,
    isLaser: true
  })

  const fadeTimerRef = useRef(null)

  useEffect(() => {
    if (!channel) return

    const handleBroadcast = ({ payload }) => {
      if (!payload) return

      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)

      if (!payload.active) {
        setPointer(prev => ({ ...prev, active: false }))
        return
      }

      setPointer({
        active: true,
        x: Math.max(0, Math.min(1, payload.x || 0.5)),
        y: Math.max(0, Math.min(1, payload.y || 0.5)),
        mode: payload.mode || 'laser',
        color: payload.color || '#ef4444',
        isPinching: !!payload.isPinching,
        isLaser: payload.isLaser !== false
      })

      // Auto-hide pointer if no updates received for 1.5 seconds
      fadeTimerRef.current = setTimeout(() => {
        setPointer(prev => ({ ...prev, active: false }))
      }, 1500)
    }

    channel.on('broadcast', { event: 'ar_pointer' }, handleBroadcast)

    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
      if (channel && channel.bindings && Array.isArray(channel.bindings.broadcast)) {
        channel.bindings.broadcast = channel.bindings.broadcast.filter(
          b => !(b.event === 'ar_pointer' && b.handler === handleBroadcast)
        )
      }
    }
  }, [channel])

  if (!pointer.active) return null

  const posX = pointer.x * 100
  const posY = pointer.y * 100
  const glowColor = pointer.color || (pointer.isLaser ? '#ef4444' : '#06b6d4')

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 99998,
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: `${posX}%`,
          top: `${posY}%`,
          transform: 'translate(-50%, -50%)',
          transition: 'left 0.04s linear, top 0.04s linear',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        {/* Pulsing Outer Aura */}
        <div
          style={{
            position: 'absolute',
            width: pointer.isPinching ? '38px' : '28px',
            height: pointer.isPinching ? '38px' : '28px',
            borderRadius: '50%',
            background: glowColor,
            opacity: 0.25,
            filter: 'blur(6px)',
            animation: 'arPulse 1.2s infinite ease-in-out'
          }}
        />

        {/* Outer Ring */}
        <div
          style={{
            position: 'absolute',
            width: pointer.isPinching ? '26px' : '20px',
            height: pointer.isPinching ? '26px' : '20px',
            borderRadius: '50%',
            border: `2px solid ${glowColor}`,
            boxShadow: `0 0 12px ${glowColor}`,
            transition: 'all 0.15s ease'
          }}
        />

        {/* Center Bright Dot */}
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: `0 0 8px #ffffff, 0 0 15px ${glowColor}`
          }}
        />

        {/* Teacher Laser Label */}
        <div
          style={{
            position: 'absolute',
            top: '-24px',
            whiteSpace: 'nowrap',
            background: 'rgba(15, 23, 42, 0.85)',
            border: `1px solid ${glowColor}`,
            color: '#f8fafc',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '0.65rem',
            fontWeight: 800,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}
        >
          <span>{pointer.isPinching ? '✍️ يكتب المعلم' : '🖐️ إشارة المعلم'}</span>
        </div>
      </div>

      <style>{`
        @keyframes arPulse {
          0% { transform: scale(0.9); opacity: 0.3; }
          50% { transform: scale(1.3); opacity: 0.15; }
          100% { transform: scale(0.9); opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
