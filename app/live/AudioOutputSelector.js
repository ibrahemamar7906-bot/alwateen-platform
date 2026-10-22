'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Volume2, Headphones, Smartphone, Check, Music, X, Settings2, Mic, Sparkles, Sliders } from 'lucide-react'

// Global audio sink ID tracking
let currentGlobalSinkId = 'default'
export const getActiveAudioSinkId = () => currentGlobalSinkId

export const applyAudioSink = async (audioElement, sinkId = currentGlobalSinkId) => {
  if (!audioElement || typeof audioElement.setSinkId !== 'function') return false
  // Protect against bogus sink IDs like 'communications' or 'undefined'
  const targetId = (!sinkId || sinkId === 'default' || sinkId === 'communications' || sinkId === 'undefined') ? '' : sinkId
  try {
    await audioElement.setSinkId(targetId)
    return true
  } catch (err) {
    console.warn('[AudioSink] Failed to set sink ID:', err)
    if (targetId !== '') {
      try { await audioElement.setSinkId('') } catch (_) {}
    }
    return false
  }
}

export default function AudioOutputSelector({ isDark = true }) {
  const [isOpen, setIsOpen] = useState(false)
  const [outputDevices, setOutputDevices] = useState([])
  const [inputDevices, setInputDevices] = useState([])
  
  const [selectedSinkId, setSelectedSinkId] = useState('default')
  const [selectedMicId, setSelectedMicId] = useState('default')
  
  const [isTestingSound, setIsTestingSound] = useState(false)
  const [supportsSetSinkId, setSupportsSetSinkId] = useState(true)

  const [speakerBoost, setSpeakerBoost] = useState(1.0)
  const [micBoost, setMicBoost] = useState(1.0)

  // ── Advanced DSP / Audio Processing Settings ──
  const [echoCancellation, setEchoCancellation] = useState(true)
  const [noiseSuppression, setNoiseSuppression] = useState(true)
  const [autoGainControl, setAutoGainControl] = useState(true)
  const [qualityBitrate, setQualityBitrate] = useState('128') // 192, 128, 64

  // ── Live Mic Level Meter State ──
  const [isTestingMic, setIsTestingMic] = useState(false)
  const [liveMicLevel, setLiveMicLevel] = useState(0)
  const micTestStreamRef = useRef(null)
  const micAudioCtxRef = useRef(null)
  const micAnimFrameRef = useRef(null)

  useEffect(() => {
    // Load initial settings
    setSpeakerBoost(parseFloat(localStorage.getItem('aljunaidi_speaker_boost') || '1.0'))
    setMicBoost(parseFloat(localStorage.getItem('aljunaidi_mic_boost') || '1.0'))
    
    const savedMic = localStorage.getItem('aljunaidi_mic_id')
    if (savedMic) setSelectedMicId(savedMic)
    
    const savedSink = localStorage.getItem('aljunaidi_sink_id')
    if (savedSink) {
      if (savedSink === 'communications' || savedSink === 'undefined') {
        localStorage.removeItem('aljunaidi_sink_id')
        setSelectedSinkId('default')
        currentGlobalSinkId = 'default'
      } else {
        setSelectedSinkId(savedSink)
        currentGlobalSinkId = savedSink
      }
    }

    // Load DSP preferences
    setEchoCancellation(localStorage.getItem('aljunaidi_echo_cancellation') !== 'false')
    setNoiseSuppression(localStorage.getItem('aljunaidi_noise_suppression') !== 'false')
    setAutoGainControl(localStorage.getItem('aljunaidi_auto_gain') !== 'false')
    setQualityBitrate(localStorage.getItem('aljunaidi_mic_bitrate') || '128')
  }, [])

  // Cleanup mic test on modal close or unmount
  useEffect(() => {
    if (!isOpen) {
      stopMicLiveTest()
    }
  }, [isOpen])

  const notifyMicConfigChange = (newConfig) => {
    window.dispatchEvent(new CustomEvent('micconfigchange', { detail: newConfig }))
  }

  const handleSpeakerBoostChange = (val) => {
    setSpeakerBoost(val)
    localStorage.setItem('aljunaidi_speaker_boost', val)
    window.dispatchEvent(new CustomEvent('speakervolumechange', { detail: { volume: val } }))
  }

  const handleMicBoostChange = (val) => {
    setMicBoost(val)
    localStorage.setItem('aljunaidi_mic_boost', val)
    window.dispatchEvent(new CustomEvent('micvolumechange', { detail: { volume: val } }))
  }

  const handleToggleEcho = () => {
    const next = !echoCancellation
    setEchoCancellation(next)
    localStorage.setItem('aljunaidi_echo_cancellation', next ? 'true' : 'false')
    notifyMicConfigChange({ echoCancellation: next, noiseSuppression, autoGainControl, bitrate: qualityBitrate })
  }

  const handleToggleNoise = () => {
    const next = !noiseSuppression
    setNoiseSuppression(next)
    localStorage.setItem('aljunaidi_noise_suppression', next ? 'true' : 'false')
    notifyMicConfigChange({ echoCancellation, noiseSuppression: next, autoGainControl, bitrate: qualityBitrate })
  }

  const handleToggleAutoGain = () => {
    const next = !autoGainControl
    setAutoGainControl(next)
    localStorage.setItem('aljunaidi_auto_gain', next ? 'true' : 'false')
    notifyMicConfigChange({ echoCancellation, noiseSuppression, autoGainControl: next, bitrate: qualityBitrate })
  }

  const handleBitrateChange = (val) => {
    setQualityBitrate(val)
    localStorage.setItem('aljunaidi_mic_bitrate', val)
    notifyMicConfigChange({ echoCancellation, noiseSuppression, autoGainControl, bitrate: val })
  }

  const updateDevices = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      setSupportsSetSinkId(false)
      return
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const outputs = devices.filter(d => d.kind === 'audiooutput')
      const inputs = devices.filter(d => d.kind === 'audioinput')

      if (outputs.length > 0) {
        setOutputDevices(outputs)
      } else {
        setOutputDevices([])
      }
      
      if (inputs.length > 0) {
        setInputDevices(inputs)
      } else {
        setInputDevices([{ deviceId: 'default', label: 'المايك الافتراضي (Default Mic)' }])
      }
    } catch (e) {
      console.warn('[AudioOutputSelector] enumerateDevices warning:', e)
    }
  }, [])

  useEffect(() => {
    if (typeof HTMLMediaElement !== 'undefined' && !('setSinkId' in HTMLMediaElement.prototype)) {
      setSupportsSetSinkId(false)
    }

    if (isOpen) {
      updateDevices()
    }

    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', updateDevices)
      return () => navigator.mediaDevices.removeEventListener('devicechange', updateDevices)
    }
  }, [updateDevices, isOpen])

  const handleSelectOutput = async (deviceId) => {
    const safeId = (!deviceId || deviceId === 'communications') ? 'default' : deviceId
    setSelectedSinkId(safeId)
    currentGlobalSinkId = safeId
    if (safeId === 'default') {
      localStorage.removeItem('aljunaidi_sink_id')
    } else {
      localStorage.setItem('aljunaidi_sink_id', safeId)
    }

    const allAudios = document.querySelectorAll('audio, video')
    allAudios.forEach(el => {
      applyAudioSink(el, safeId)
    })

    window.dispatchEvent(new CustomEvent('audiosinkchange', { detail: { sinkId: safeId } }))
  }

  const handleSelectInput = async (deviceId) => {
    setSelectedMicId(deviceId)
    localStorage.setItem('aljunaidi_mic_id', deviceId)
    window.dispatchEvent(new CustomEvent('micdevicechange', { detail: { deviceId } }))
    
    // If mic test is currently running, switch to new device
    if (isTestingMic) {
      startMicLiveTest(deviceId)
    }
  }

  // ── Live Mic Level Test (VU Meter) ──
  const toggleMicLiveTest = async () => {
    if (isTestingMic) {
      stopMicLiveTest()
    } else {
      await startMicLiveTest(selectedMicId)
    }
  }

  const startMicLiveTest = async (devId) => {
    stopMicLiveTest()
    try {
      const constraints = {
        audio: {
          deviceId: devId && devId !== 'default' ? { exact: devId } : undefined,
          echoCancellation,
          noiseSuppression,
          autoGainControl,
        }
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      micTestStreamRef.current = stream

      const AudioCtxClass = window.AudioContext || window.webkitAudioContext
      if (!AudioCtxClass) return

      const ctx = new AudioCtxClass()
      micAudioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      const buffer = new Uint8Array(analyser.frequencyBinCount)
      setIsTestingMic(true)

      const tick = () => {
        if (!analyser) return
        analyser.getByteFrequencyData(buffer)
        let sum = 0
        for (let i = 0; i < buffer.length; i++) sum += buffer[i]
        const avg = sum / buffer.length
        const percent = Math.min(100, Math.round((avg / 128) * 100))
        setLiveMicLevel(percent)
        micAnimFrameRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch (e) {
      console.warn('Mic live test error:', e)
      setIsTestingMic(false)
    }
  }

  const stopMicLiveTest = () => {
    if (micAnimFrameRef.current) {
      cancelAnimationFrame(micAnimFrameRef.current)
      micAnimFrameRef.current = null
    }
    if (micTestStreamRef.current) {
      micTestStreamRef.current.getTracks().forEach(t => t.stop())
      micTestStreamRef.current = null
    }
    if (micAudioCtxRef.current && micAudioCtxRef.current.state !== 'closed') {
      try { micAudioCtxRef.current.close() } catch (e) {}
      micAudioCtxRef.current = null
    }
    setIsTestingMic(false)
    setLiveMicLevel(0)
  }

  const playTestSound = async () => {
    setIsTestingSound(true)
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        const ctx = new AudioCtx()
        
        if (typeof ctx.setSinkId === 'function' && selectedSinkId !== 'default') {
          try { await ctx.setSinkId(selectedSinkId) } catch (e) {}
        }

        const now = ctx.currentTime
        const playTone = (freq, startTime, duration) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, startTime)
          
          gain.gain.setValueAtTime(0, startTime)
          gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
          
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(startTime)
          osc.stop(startTime + duration)
        }

        playTone(523.25, now, 0.4)
        playTone(659.25, now + 0.15, 0.4)
        playTone(783.99, now + 0.3, 0.6)
        playTone(1046.50, now + 0.45, 0.8)
      }
    } catch (e) {}

    setTimeout(() => {
      setIsTestingSound(false)
    }, 1200)
  }

  const getOutputIcon = (label = '', id = '') => {
    const l = (label + ' ' + id).toLowerCase()
    if (l.includes('headphone') || l.includes('headset') || l.includes('ear') || l.includes('buds') || l.includes('airpod') || l.includes('سماعة') || l.includes('بلوتوث')) {
      return <Headphones size={15} color="#38bdf8" />
    }
    return <Volume2 size={15} color="#38bdf8" />
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        title="إعدادات الصوت والمايك"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: '5px 5px',
          borderRadius: '8px',
          transition: 'all 0.2s',
        }}
      >
        <Settings2 size={20} />
        <span style={{ fontSize: '0.65rem', fontWeight: 700, fontFamily: "'Tajawal', sans-serif" }}>الصوت</span>
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 999999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Tajawal', sans-serif",
            padding: '16px'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: isDark ? '#1e293b' : '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              direction: 'rtl',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0'
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute', top: '16px', left: '16px',
                background: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
                border: 'none', borderRadius: '50%',
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: isDark ? '#cbd5e1' : '#475569',
                transition: 'background 0.2s'
              }}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <h3 style={{ margin: '0 0 4px 0', color: isDark ? 'white' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 900 }}>
              <Settings2 size={22} color="#10b981" />
              إعدادات الصوت والمايكروفون 🎙️
            </h3>
            <p style={{ margin: '0 0 18px 0', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
              تحكم كامل في الميكروفون المختار، نقاء الصوت، وعزل الصدى في كلا السيرفرين (P2P و Agora).
            </p>

            {/* ── SECTION 1: MICROPHONE INPUT SELECTION ── */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mic size={16} color="#10b981" />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    اختر المايكروفون (التحدث)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={toggleMicLiveTest}
                  style={{
                    background: isTestingMic ? '#10b981' : (isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5'),
                    border: `1px solid ${isTestingMic ? '#059669' : '#10b981'}`,
                    color: isTestingMic ? '#ffffff' : '#10b981',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {isTestingMic ? '⏹️ إيقاف الفحص' : '🎙️ فحص المايك'}
                </button>
              </div>

              {/* Live VU Meter when testing */}
              {isTestingMic && (
                <div style={{
                  marginBottom: '10px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: isDark ? 'rgba(0,0,0,0.3)' : '#f1f5f9',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '4px' }}>
                    <span>التقاط الصوت اللحظي (تحدث الآن):</span>
                    <span style={{ fontWeight: 800, color: liveMicLevel > 80 ? '#ef4444' : '#10b981' }}>{liveMicLevel}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: isDark ? '#334155' : '#cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${liveMicLevel}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 70%, #ef4444 100%)',
                      transition: 'width 0.08s ease'
                    }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                {inputDevices.map((dev, idx) => {
                  const isSelected = selectedMicId === dev.deviceId || (selectedMicId === 'default' && dev.deviceId === 'default')
                  return (
                    <div
                      key={dev.deviceId || idx}
                      onClick={() => handleSelectInput(dev.deviceId)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #10b981' : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0'),
                        background: isSelected ? (isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5') : (isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc'),
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Mic size={14} color="#10b981" />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isDark ? '#fff' : '#0f172a' }}>
                          {dev.label || `مايكروفون (${idx + 1})`}
                        </div>
                      </div>
                      {isSelected && <Check size={16} color="#10b981" strokeWidth={3} />}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── SECTION 2: DSP & AUDIO PROCESSING CARDS (Echo, Noise, AGC, Bitrate) ── */}
            <div style={{
              marginBottom: '20px',
              padding: '14px',
              borderRadius: '16px',
              background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Sparkles size={16} color="#10b981" />
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  معالجة ونقاء الصوت الذكي (DSP)
                </h4>
              </div>

              {/* 2x2 Grid for Toggles */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px'
              }}>
                {/* 1. Echo Cancellation */}
                <div
                  onClick={handleToggleEcho}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '85px',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.84rem', color: isDark ? '#fff' : '#0f172a' }}>
                      إلغاء الصدى
                    </div>
                    {/* Switch */}
                    <div style={{
                      width: '36px', height: '20px',
                      background: echoCancellation ? '#10b981' : (isDark ? '#475569' : '#cbd5e1'),
                      borderRadius: '10px',
                      position: 'relative',
                      transition: 'background 0.2s',
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: '16px', height: '16px',
                        background: '#ffffff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        right: echoCancellation ? '18px' : '2px',
                        transition: 'right 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '4px', lineHeight: 1.3 }}>
                    منع تكرار صدى الغرفة واللاب توب
                  </div>
                </div>

                {/* 2. Noise Suppression */}
                <div
                  onClick={handleToggleNoise}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '85px',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.84rem', color: isDark ? '#fff' : '#0f172a' }}>
                      عزل الضوضاء
                    </div>
                    {/* Switch */}
                    <div style={{
                      width: '36px', height: '20px',
                      background: noiseSuppression ? '#10b981' : (isDark ? '#475569' : '#cbd5e1'),
                      borderRadius: '10px',
                      position: 'relative',
                      transition: 'background 0.2s',
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: '16px', height: '16px',
                        background: '#ffffff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        right: noiseSuppression ? '18px' : '2px',
                        transition: 'right 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '4px', lineHeight: 1.3 }}>
                    حجب صوت المروحة والتشويش
                  </div>
                </div>

                {/* 3. Auto Gain Control (AGC) */}
                <div
                  onClick={handleToggleAutoGain}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '85px',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.84rem', color: isDark ? '#fff' : '#0f172a' }}>
                      موازنة الصوت (AGC)
                    </div>
                    {/* Switch */}
                    <div style={{
                      width: '36px', height: '20px',
                      background: autoGainControl ? '#10b981' : (isDark ? '#475569' : '#cbd5e1'),
                      borderRadius: '10px',
                      position: 'relative',
                      transition: 'background 0.2s',
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: '16px', height: '16px',
                        background: '#ffffff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        right: autoGainControl ? '18px' : '2px',
                        transition: 'right 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '4px', lineHeight: 1.3 }}>
                    موازنة النبرات الهادئة والعالية
                  </div>
                </div>

                {/* 4. Bitrate & Quality Selector */}
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '85px'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.84rem', color: isDark ? '#fff' : '#0f172a', marginBottom: '4px' }}>
                    جودة ومعدل البت
                  </div>
                  <select
                    value={qualityBitrate}
                    onChange={(e) => handleBitrateChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1',
                      background: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      fontFamily: 'inherit',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="128">متوازن وعالي (128k)</option>
                    <option value="64">خفيف للنت الضعيف (64k)</option>
                    <option value="192">استوديو نقي (192k)</option>
                  </select>
                </div>
              </div>

              {/* Anti-Ducking notice */}
              <div style={{
                marginTop: '12px',
                padding: '8px 12px',
                borderRadius: '10px',
                background: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
                border: isDark ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid #a7f3d0',
                color: isDark ? '#a7f3d0' : '#065f46',
                fontSize: '0.74rem',
                lineHeight: 1.4
              }}>
                <strong>🛡️ ميزة الحفاظ على علو الصوت (Anti-Ducking):</strong> المنصة تقوم تلقائياً بتعويض وتضخيم صوت الطرف الآخر بنسبة 45% عند فتح المايك لمنع انخفاض الصوت المعتاد في الويندوز والمتصفحات!
              </div>
            </div>
            </div>

            {/* ── SECTION 3: SPEAKERS / OUTPUT SELECTION ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Volume2 size={16} color="#38bdf8" />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  السماعات (الاستماع)
                </h4>
              </div>

              {outputDevices.length === 0 ? (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: isDark ? 'rgba(56, 189, 248, 0.08)' : '#f0f9ff',
                  border: isDark ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid #bae6fd',
                  color: isDark ? '#e0f2fe' : '#0369a1',
                  fontSize: '0.82rem',
                  lineHeight: '1.5'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '6px' }}>
                    <Smartphone size={16} color="#38bdf8" />
                    <span>توجيه الصوت عبر نظام الجهاز تلقائياً</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#475569' }}>
                    يتحكم جهازك تلقائياً في مخرج الصوت (سماعة الرأس / مكبر الصوت / البلوتوث) وفق الجهاز المتصل.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                  {outputDevices.map((dev, idx) => {
                    const isSelected = selectedSinkId === dev.deviceId || (selectedSinkId === 'default' && (dev.deviceId === 'default' || dev.deviceId === ''))
                    const icon = getOutputIcon(dev.label, dev.deviceId)
                    return (
                      <div
                        key={dev.deviceId || idx}
                        onClick={() => handleSelectOutput(dev.deviceId)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #3b82f6' : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0'),
                          background: isSelected ? (isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff') : (isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc'),
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {icon}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isDark ? '#fff' : '#0f172a' }}>
                            {dev.label || `سماعة (${idx + 1})`}
                          </div>
                        </div>
                        {isSelected && <Check size={16} color="#3b82f6" strokeWidth={3} />}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── SECTION 4: ADVANCED AUDIO BOOST SLIDERS ── */}
            <div style={{ marginTop: '10px', paddingTop: '14px', borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sliders size={16} color="#f59e0b" />
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                  تضخيم وقوة الصوت (Boost)
                </h4>
              </div>

              {/* Speaker Boost */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <span>السماعات (صوت الآخرين)</span>
                  <span style={{ fontWeight: 'bold', color: speakerBoost > 1.5 ? '#ef4444' : '#10b981' }}>{Math.round(speakerBoost * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" max="3.0" step="0.1" 
                  value={speakerBoost} 
                  onChange={(e) => handleSpeakerBoostChange(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                />
              </div>

              {/* Mic Boost */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <span>المايك (صوتي للآخرين)</span>
                  <span style={{ fontWeight: 'bold', color: micBoost > 1.5 ? '#ef4444' : '#3b82f6' }}>{Math.round(micBoost * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" max="3.0" step="0.1" 
                  value={micBoost} 
                  onChange={(e) => handleMicBoostChange(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* ── ACTION BUTTONS ── */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={playTestSound}
                disabled={isTestingSound}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '14px',
                  border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                  background: isTestingSound ? 'rgba(16,185,129,0.3)' : (isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9'),
                  color: isDark ? 'white' : '#1e293b',
                  fontSize: '0.88rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <Music size={16} color={isTestingSound ? '#34d399' : (isDark ? 'white' : '#1e293b')} />
                <span>{isTestingSound ? 'جاري العزف...' : 'نغمة اختبار'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  fontSize: '0.88rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                }}
              >
                حفظ وإغلاق
              </button>
            </div>

          </div>
        </div>
      , document.body)}
    </>
  )
}
