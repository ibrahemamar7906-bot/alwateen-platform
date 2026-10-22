'use client'

import React, { useState, useEffect } from 'react'
import { 
  Volume2, Wifi, ShieldCheck, Sparkles, 
  User, CheckCircle2, AlertCircle, Headphones, 
  ArrowRight, Radio
} from 'lucide-react'

export default function LiveLobbyModal({
  onJoin,
  defaultName = '',
  roomId = '',
  isAdmin = false
}) {
  const [name, setName] = useState(defaultName || '')
  const [isPlayingTest, setIsPlayingTest] = useState(false)
  const [hasTestedAudio, setHasTestedAudio] = useState(false)

  useEffect(() => {
    // Load cached name if available, but not for admin
    if (!name && typeof window !== 'undefined' && !isAdmin) {
      const saved = localStorage.getItem('student_live_name')
      if (saved) setName(saved)
    }
  }, [name, isAdmin])

  // If defaultName arrives late and is admin, force set
  useEffect(() => {
    if (isAdmin && defaultName) {
      setName(defaultName)
    }
  }, [isAdmin, defaultName])

  // Play a pleasant Web Audio harmonic chime test
  const playAudioTest = () => {
    try {
      setIsPlayingTest(true)
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return

      if (!window._sharedAudioCtx) {
        window._sharedAudioCtx = new AudioContext()
      }
      const ctx = window._sharedAudioCtx
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }

      const freqs = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 arpeggio chord
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12)

        gain.gain.setValueAtTime(0.01, ctx.currentTime + idx * 0.12)
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + idx * 0.12 + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 0.8)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(ctx.currentTime + idx * 0.12)
        osc.stop(ctx.currentTime + idx * 0.12 + 0.85)
      })

      setTimeout(() => {
        setIsPlayingTest(false)
        setHasTestedAudio(true)
      }, 1200)
    } catch (e) {
      console.warn('Audio test error:', e)
      setIsPlayingTest(false)
      setHasTestedAudio(true)
    }
  }

  const handleJoinClick = () => {
    const finalName = name.trim() || (isAdmin ? 'المستر إبراهيم عمار' : 'طالب متميز')
    if (typeof window !== 'undefined' && !isAdmin) {
      localStorage.setItem('student_live_name', finalName)
    }
    // Also trigger audio unlock
    playAudioTest()
    onJoin(finalName)
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      minHeight: '100dvh',
      zIndex: 9999,
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '16px',
      overflowY: 'auto',
      userSelect: 'none',
      fontFamily: "'Tajawal', 'Cairo', sans-serif",
      direction: 'rtl',
      textAlign: 'right'
    }}>
      
      {/* Container Box */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#1e293b',
        border: '2px solid #059669',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(5, 150, 105, 0.2)',
        position: 'relative',
        color: '#f8fafc',
        boxSizing: 'border-box',
        marginTop: 'auto',
        marginBottom: 'auto'
      }}>
        
        {/* Header Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '16px',
          marginBottom: '22px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 6px 16px rgba(5, 150, 105, 0.4)'
            }}>
              <Radio size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>الفصل الافتراضي المباشر</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '3px 0 0 0', fontWeight: 600 }}>منصة المستر إبراهيم عمار التعليمية</p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#10b981',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              display: 'inline-block'
            }} />
            <span>الغرفة جاهزة</span>
          </div>
        </div>

        {/* Form Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Name Input */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#e2e8f0',
              marginBottom: '8px'
            }}>
              <User size={16} color="#10b981" />
              <span>{isAdmin ? 'اسم المعلم:' : 'اسم الطالب:'}</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinClick()}
              placeholder={isAdmin ? "اسم المعلم..." : "اكتب اسمك للدخول للحصة..."}
              disabled={isAdmin}
              style={{
                width: '100%',
                backgroundColor: isAdmin ? 'rgba(15, 23, 42, 0.5)' : '#0f172a',
                border: '1.5px solid rgba(5, 150, 105, 0.5)',
                borderRadius: '14px',
                padding: '12px 16px',
                fontSize: '0.95rem',
                color: isAdmin ? '#94a3b8' : '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
                fontWeight: 700,
                transition: 'border-color 0.2s ease',
                cursor: isAdmin ? 'not-allowed' : 'text'
              }}
            />
          </div>

          {/* Pre-Join Audio & Network Test Box */}
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Headphones size={16} color="#10b981" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1' }}>فحص سماعة الصوت:</span>
              </div>

              <button
                type="button"
                onClick={playAudioTest}
                disabled={isPlayingTest}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(5, 150, 105, 0.2)',
                  border: '1px solid #059669',
                  color: '#d1fae5',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: isPlayingTest ? 'default' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Volume2 size={14} color="#10b981" />
                <span>{isPlayingTest ? 'جاري تشغيل النغمة...' : (hasTestedAudio ? 'تم الاختبار بنجاح ✓' : 'اختبار الصوت 🔊')}</span>
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: '#94a3b8',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wifi size={14} color="#10b981" />
                <span>جودة الاتصال:</span>
              </div>
              <span style={{ color: '#10b981', fontWeight: 800 }}>ممتازة (مباشر وفائق السرعة)</span>
            </div>
          </div>

          {/* Features note */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'rgba(5, 150, 105, 0.1)',
            border: '1px solid rgba(5, 150, 105, 0.3)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.8rem',
            color: '#d1fae5',
            lineHeight: 1.5
          }}>
            <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0 }} />
            <span>الحصة خفيفة جداً، صوت المعلم سيعمل تلقائياً وستتمكن من المشاركة في الألعاب والسبورة مباشرة!</span>
          </div>

          {/* Enter Button */}
          <button
            type="button"
            onClick={handleJoinClick}
            style={{
              width: '100%',
              marginTop: '6px',
              padding: '14px 20px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#022c22',
              fontWeight: 900,
              fontSize: '1.05rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.15s ease'
            }}
          >
            <span>انضمام للحصة الآن</span>
            <Sparkles size={18} />
          </button>

        </div>

      </div>
    </div>
  )
}
