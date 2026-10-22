'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, X, Clock } from 'lucide-react'

export default function TimerOverlay({ isActive, onClose }) {
  if (!isActive) return null

  const [pos, setPos] = useState(() => ({
    x: typeof window !== 'undefined' ? Math.max(20, Math.floor((window.innerWidth - 340) / 2)) : 100,
    y: 120
  }))
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 })

  const [mode, setMode] = useState('stopwatch') // 'stopwatch' or 'countdown'
  const [time, setTime] = useState(0) // in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [inputMinutes, setInputMinutes] = useState(5)

  useEffect(() => {
    let interval = null
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => {
          if (mode === 'countdown') {
            if (prev <= 1) {
              setIsRunning(false)
              return 0
            }
            return prev - 1
          } else {
            return prev + 1
          }
        })
      }, 1000)
    } else if (!isRunning && time !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRunning, mode, time])

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    if (mode === 'countdown' && time === 0) {
      setTime(inputMinutes * 60)
    }
    setIsRunning(true)
  }

  const handlePointerDown = (e) => {
    e.stopPropagation()
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)

    dragStartRef.current = {
      x: clientX,
      y: clientY,
      posX: pos.x,
      posY: pos.y
    }
    setIsDragging(true)
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)

    const dx = clientX - dragStartRef.current.x
    const dy = clientY - dragStartRef.current.y

    setPos({
      x: Math.max(10, Math.min((typeof window !== 'undefined' ? window.innerWidth - 340 : 800), dragStartRef.current.posX + dx)),
      y: Math.max(10, Math.min((typeof window !== 'undefined' ? window.innerHeight - 250 : 600), dragStartRef.current.posY + dy))
    })
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove, { passive: false })
      window.addEventListener('touchmove', handlePointerMove, { passive: false })
      window.addEventListener('mouseup', handlePointerUp)
      window.addEventListener('touchend', handlePointerUp)
    } else {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchend', handlePointerUp)
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchend', handlePointerUp)
    }
  }, [isDragging])

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: '320px',
        maxWidth: '92vw',
        backgroundColor: '#0f172a',
        color: 'white',
        borderRadius: '18px',
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
        zIndex: 10000,
        fontFamily: 'Tajawal, sans-serif',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        direction: 'rtl'
      }}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        style={{
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="#38bdf8" />
          <span>المؤقت وساعة الإيقاف</span>
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: 'none',
            color: '#f87171',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title="إغلاق"
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '16px 20px', textAlign: 'center' }}>
        {/* Mode switcher tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '16px',
          background: '#1e293b',
          padding: '4px',
          borderRadius: '10px'
        }}>
          <button
            onClick={() => { setMode('stopwatch'); setTime(0); setIsRunning(false) }}
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: mode === 'stopwatch' ? '#0284c7' : 'transparent',
              color: mode === 'stopwatch' ? 'white' : '#94a3b8',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            ساعة إيقاف
          </button>
          <button
            onClick={() => { setMode('countdown'); setTime(inputMinutes * 60); setIsRunning(false) }}
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: mode === 'countdown' ? '#0284c7' : 'transparent',
              color: mode === 'countdown' ? 'white' : '#94a3b8',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            عد تنازلي
          </button>
        </div>

        {/* Countdown setting */}
        {mode === 'countdown' && !isRunning && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '12px',
            fontSize: '13px',
            color: '#cbd5e1'
          }}>
            <label>الدقائق:</label>
            <input
              type="number"
              value={inputMinutes}
              onChange={(e) => {
                const val = Math.max(1, Math.min(180, Number(e.target.value) || 1));
                setInputMinutes(val);
                setTime(val * 60);
              }}
              style={{
                width: '65px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #475569',
                textAlign: 'center',
                background: '#1e293b',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
              min="1"
              max="180"
            />
          </div>
        )}

        {/* Digital Time Display */}
        <div style={{
          fontSize: '3.2rem',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          letterSpacing: '2px',
          margin: '10px 0 16px',
          color: time <= 10 && mode === 'countdown' ? '#ef4444' : '#38bdf8',
          textShadow: '0 0 20px rgba(56, 189, 248, 0.25)',
          direction: 'ltr'
        }}>
          {formatTime(time)}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {!isRunning ? (
            <button
              onClick={handleStart}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Play size={16} fill="white" />
              <span>بدء</span>
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(false)}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}
            >
              <Pause size={16} fill="white" />
              <span>إيقاف</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsRunning(false)
              setTime(mode === 'countdown' ? inputMinutes * 60 : 0)
            }}
            style={{
              padding: '9px 16px',
              borderRadius: '10px',
              border: 'none',
              background: '#334155',
              color: '#f1f5f9',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            title="تصفير العداد"
          >
            <RotateCcw size={16} />
            <span>تصفير</span>
          </button>
        </div>
      </div>
    </div>
  )
}
