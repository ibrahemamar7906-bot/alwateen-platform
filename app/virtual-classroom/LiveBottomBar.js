'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Mic, MicOff, Video, VideoOff,
  MessageSquare, Hand, Gamepad2,
  Smile, LogOut, Users, ChevronUp,
  PenTool, BookOpen, Type, Calculator,
  LayoutList, Map as MapIcon, Train,
  PersonStanding, RefreshCw, Layers,
  Trophy, FileBadge, Users2, Circle, Square, Car, Gamepad, Dices, Sparkles, MonitorPlay, Swords
} from 'lucide-react'
import AudioOutputSelector from '../live/AudioOutputSelector'

export default function LiveBottomBar({
  isTeacher = false,
  isMicOn = false,
  onToggleMic = null,
  isCameraOn = false,
  onToggleCamera = null,
  isHandRaised = false,
  onToggleHand = null,
  activeTab = 'chat',
  onToggleTab = null,
  onLeave = null,
  unreadChat = 0,
  handRaisesCount = 0,
  channel = null,
  currentUserName = '',
  conferenceMode = false,
  onToggleConference = null,
  activeTool = 'whiteboard',
  onSelectTool = null,
  specialty = null,
  captionLanguage = 'ar-SA',
  onChangeCaptionLanguage = null,
  isMyCaptionEnabled = false,
  onToggleMyCaption = null,
  isCaptionOverlayVisible = true,
  onToggleCaptionOverlay = null,
  isAgoraEnabled = false,
  onToggleAgora = null,
}) {
  const [showReactMenu, setShowReactMenu] = useState(false)
  const [showGamesMenu, setShowGamesMenu] = useState(false)
  const [showToolsMenu, setShowToolsMenu] = useState(false)
  const [showCaptionMenu, setShowCaptionMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // ── Recording State ──
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingError, setRecordingError] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const screenStreamRef = useRef(null)
  const micStreamRef = useRef(null)
  const audioCtxRef = useRef(null)

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setIsMobile(w <= 768 || (h <= 500 && w <= 1024))
    }
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      clearInterval(timerRef.current)
      screenStreamRef.current?.getTracks().forEach(t => t.stop())
      micStreamRef.current?.getTracks().forEach(t => t.stop())
      audioCtxRef.current?.close()
    }
  }, [])

  const startRecording = useCallback(async () => {
    setRecordingError(null)
    try {
      // 1. Capture screen (ask user to pick screen/window)
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true, // system audio (Windows Chrome only)
      })
      screenStreamRef.current = screenStream

      // 2. Get mic audio with preferred device & noise cancellation
      let micStream = null
      try {
        const preferredMic = typeof window !== 'undefined' ? localStorage.getItem('aljunaidi_mic_id') : null
        const echoCancel = typeof window !== 'undefined' ? localStorage.getItem('aljunaidi_echo_cancellation') !== 'false' : true
        const noiseSuppress = typeof window !== 'undefined' ? localStorage.getItem('aljunaidi_noise_suppression') !== 'false' : true
        const autoGain = typeof window !== 'undefined' ? localStorage.getItem('aljunaidi_auto_gain') !== 'false' : true

        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: preferredMic && preferredMic !== 'default' ? { exact: preferredMic } : undefined,
            echoCancellation: echoCancel,
            noiseSuppression: noiseSuppress,
            autoGainControl: autoGain
          },
          video: false
        })
        micStreamRef.current = micStream
      } catch (_) {
        // mic not available — fallback or continue with screen audio only
        try {
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
          micStreamRef.current = micStream
        } catch (e2) {}
      }

      // 3. Mix audio tracks using AudioContext
      const audioCtx = new AudioContext()
      audioCtxRef.current = audioCtx
      const dest = audioCtx.createMediaStreamDestination()

      if (screenStream.getAudioTracks().length > 0) {
        audioCtx.createMediaStreamSource(new MediaStream(screenStream.getAudioTracks())).connect(dest)
      }
      if (micStream && micStream.getAudioTracks().length > 0) {
        audioCtx.createMediaStreamSource(micStream).connect(dest)
      }

      // 4. Build final combined stream
      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ])

      // 5. Choose best supported format
      const mimeType = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
      ].find(t => MediaRecorder.isTypeSupported(t)) || ''

      const recorder = new MediaRecorder(combinedStream, mimeType ? { mimeType } : {})
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        clearInterval(timerRef.current)
        setIsRecording(false)
        setRecordingTime(0)

        // Stop all tracks
        screenStream.getTracks().forEach(t => t.stop())
        micStream?.getTracks().forEach(t => t.stop())
        audioCtx.close()

        // Download the file
        const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' })
        const url = URL.createObjectURL(blob)
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'
        const now = new Date()
        const dateStr = `${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}`
        const timeStr = `${now.getHours()}-${now.getMinutes()}`
        const a = document.createElement('a')
        a.href = url
        a.download = `حصة-${dateStr}_${timeStr}.${ext}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(url), 60000)
      }

      recorder.onerror = () => {
        setIsRecording(false)
        setRecordingError('حدث خطأ أثناء التسجيل')
        clearInterval(timerRef.current)
      }

      // Handle if user stops screen share from browser UI
      screenStream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current?.state !== 'inactive') {
          mediaRecorderRef.current.stop()
        }
      }

      recorder.start(1000) // collect data every 1s
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)

    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        setRecordingError('تعذّر بدء التسجيل')
      }
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const quickEmojis = ['👏', '🌟', '💡', '❓', '🎯', '🔥', '❤️', '👍']

  const handleReact = (emoji) => {
    if (channel && channel.state === 'joined') {
      channel.send({ type: 'broadcast', event: 'student_reaction', payload: { emoji, name: currentUserName } })
    }
    setShowReactMenu(false)
  }

  const teachingTools = [
    { id: 'whiteboard',    icon: <PenTool size={18} />,    label: 'السبورة',          always: true },
    { id: 'screenshare',   icon: <MonitorPlay size={18} />,label: 'مشاركة الشاشة',     always: true },
    { id: 'arabic-board',  icon: <BookOpen size={18} />,   label: 'سبورة التأسيس',       specialty: 'arabic' },
    { id: 'english-board', icon: <Type size={18} />,       label: 'سبورة الحروف',   specialty: 'english' },
    { id: 'math-board',    icon: <Calculator size={18} />, label: 'سبورة الأرقام',   specialty: 'math' },
    { id: 'grammar',       icon: <LayoutList size={18} />, label: 'تطبيقات النحو',         specialtyAny: ['arabic','english','general'] },
    { id: 'ready-pathway', icon: <MapIcon size={18} />,    label: 'المسار الجاهز', specialty: 'arabic' },
    { id: 'html-sandbox',  icon: <Type size={18} />,       label: 'محرر الأكواد',  always: true },
  ].filter(t =>
    t.always ||
    (t.specialtyAny && t.specialtyAny.includes(specialty)) ||
    t.specialty === specialty ||
    specialty === 'general'
  )

  const games = [
    { id: 'quran',        icon: <BookOpen size={16} />,       label: 'ترتيب القرآن',    color: '#10b981' },
    { id: 'train',        icon: <Train size={16} />,          label: 'قطار الكلمات',    color: '#3b82f6' },
    { id: 'mario',        icon: <Gamepad size={16} />,        label: 'مغامرات ماريو',  color: '#eab308' },
    { id: 'subway',       icon: <PersonStanding size={16} />, label: 'عداء الكلمات',   color: '#8b5cf6' },
    { id: 'racing',       icon: <Car size={16} />,            label: 'سباق السيارات',  color: '#3b82f6' },
    { id: 'tank',         icon: <Swords size={16} />,         label: 'حرب الدبابات',   color: '#10b981' },
    { id: 'wheel',        icon: <Dices size={16} />,          label: 'عجلة الحظ',      color: '#f97316' },
    { id: 'memory',       icon: <BookOpen size={16} />,       label: 'لعبة الذاكرة',    color: '#14b8a6' },
    { id: 'hangman',      icon: <Type size={16} />,           label: 'المشنقة',         color: '#ef4444' },
    { id: 'quizshow',     icon: <Trophy size={16} />,         label: 'من سيربح',        color: '#f59e0b' },
    { id: 'wordsearch',   icon: <LayoutList size={16} />,     label: 'البحث عن الكلمات',color: '#8b5cf6' },
    { id: 'wordbuilder',  icon: <BookOpen size={16} />,       label: 'تجميع الكلمات',   color: '#3b82f6' },
    { id: 'flashcards',   icon: <Layers size={16} />,         label: 'البطاقات الذكية', color: '#14b8a6' },
    { id: 'leaderboard',  icon: <Trophy size={16} />,         label: 'لوحة الشرف',      color: '#f59e0b' },
    { id: 'certificates', icon: <FileBadge size={16} />,      label: 'شهادات التكريم',  color: '#a78bfa' },
  ]

  const isGameActive  = games.some(g => g.id === activeTool)
  const activeToolObj = teachingTools.find(t => t.id === activeTool)
  const activeGameObj = games.find(g => g.id === activeTool)

  // ── Styles ──
  const iconSize = isMobile ? 18 : 20
  const btn = {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isMobile ? '1px' : '4px',
    cursor: 'pointer',
    padding: isMobile ? '5px 5px' : '6px 12px',
    borderRadius: isMobile ? '8px' : '12px',
    transition: 'all 0.2s',
    position: 'relative',
    flexShrink: isMobile ? 1 : 0,
    minWidth: isMobile ? '36px' : 'auto',
  }
  const lbl = { fontSize: '0.65rem', fontWeight: 700, fontFamily: "'Tajawal', sans-serif" }

  const renderCaptionMenu = () => (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setShowCaptionMenu(p => !p)} title="الكابشن والترجمة النصية" style={{
        ...btn,
        background: isCaptionOverlayVisible || isMyCaptionEnabled ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isCaptionOverlayVisible || isMyCaptionEnabled ? 'rgba(6,182,212,0.4)' : '#374151'}`,
        color: isCaptionOverlayVisible || isMyCaptionEnabled ? '#22d3ee' : '#9ca3af',
      }}>
        <span style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: 900, letterSpacing: '0.5px', lineHeight: 1 }}>CC</span>
        {!isMobile && <span style={lbl}>كابشن</span>}
      </button>

      {showCaptionMenu && (
        <div style={{
          position: isMobile ? 'fixed' : 'absolute', bottom: isMobile ? '60px' : 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
          background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '12px',
          display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '180px',
          boxShadow: '0 -12px 28px rgba(0,0,0,0.5)', zIndex: 300,
        }}>
          {onToggleCaptionOverlay && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#f3f4f6', fontSize: '13px' }}>
              <input type="checkbox" checked={isCaptionOverlayVisible} onChange={onToggleCaptionOverlay} />
              عرض النصوص على شاشتي
            </label>
          )}
          {onToggleMyCaption && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#f3f4f6', fontSize: '13px' }}>
              <input type="checkbox" checked={isMyCaptionEnabled} onChange={onToggleMyCaption} />
              تحويل صوتي إلى نص للجميع
            </label>
          )}
          {onChangeCaptionLanguage && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>لغة التحدث في الحصة:</span>
              <select 
                value={captionLanguage} 
                onChange={(e) => onChangeCaptionLanguage(e.target.value)}
                style={{ background: '#374151', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}
              >
                <option value="ar-SA">العربية</option>
                <option value="en-US">English (US)</option>
                <option value="fr-FR">Français</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <>
    <style>{`
      @keyframes recPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.3; transform: scale(0.7); }
      }
    `}</style>
    {(showToolsMenu || showGamesMenu || showReactMenu || showCaptionMenu) && (
      <div 
        onClick={() => {
          setShowToolsMenu(false)
          setShowGamesMenu(false)
          setShowReactMenu(false)
          setShowCaptionMenu(false)
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 290,
          background: 'transparent',
          cursor: 'default'
        }}
      />
    )}
    <div style={{
      background: '#111827',
      borderTop: '1px solid #1f2937',
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'flex-start' : 'center',
      padding: isMobile ? '0 8px' : '0 16px',
      height: isMobile ? 52 : 72,
      minHeight: isMobile ? 52 : 72,
      zIndex: 10000,
      direction: 'rtl',
      width: '100%',
      flexShrink: 0,
      gap: isMobile ? '6px' : '8px',
      overflowX: isMobile ? 'auto' : 'visible',
      overflowY: isMobile ? 'hidden' : 'visible',
      WebkitOverflowScrolling: 'touch',
    }}>

      {/* ── LEFT: Leave ── */}
      <button onClick={onLeave} title="مغادرة" style={{
        ...btn,
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.25)',
        color: '#f87171',
      }}>
        <LogOut size={iconSize} />
        {!isMobile && <span style={lbl}>مغادرة</span>}
      </button>

      {/* ── CENTER ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '4px', flex: isMobile ? 'none' : 1, justifyContent: isMobile ? 'flex-start' : 'center', overflow: 'visible' }}>

        {/* Mic */}
        <button onClick={onToggleMic} style={{
          ...btn,
          background: isMicOn ? 'rgba(5,150,105,0.15)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${isMicOn ? 'rgba(5,150,105,0.3)' : 'rgba(239,68,68,0.25)'}`,
          color: isMicOn ? '#10b981' : '#f87171',
        }}>
          {isMicOn ? <Mic size={iconSize} /> : <MicOff size={iconSize} />}
          {!isMobile && <span style={lbl}>{isMicOn ? 'مايك' : 'صامت'}</span>}
        </button>

        {/* Camera */}
        <button onClick={onToggleCamera} style={{
          ...btn,
          background: isCameraOn ? 'rgba(5,150,105,0.15)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${isCameraOn ? 'rgba(5,150,105,0.3)' : 'rgba(239,68,68,0.25)'}`,
          color: isCameraOn ? '#10b981' : '#f87171',
        }}>
          {isCameraOn ? <Video size={iconSize} /> : <VideoOff size={iconSize} />}
          {!isMobile && <span style={lbl}>{isCameraOn ? 'كاميرا' : 'مغلقة'}</span>}
        </button>

        {/* Audio Output / Settings Modal */}
        <div style={{ marginLeft: isMobile ? '2px' : '5px' }}>
          <AudioOutputSelector isDark={true} />
        </div>

        {/* ── RECORD BUTTON (Teacher only) ── */}
        {isTeacher && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? `إيقاف التسجيل (${formatTime(recordingTime)})` : 'تسجيل الحصة'}
              style={{
                ...btn,
                background: isRecording ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isRecording ? 'rgba(239,68,68,0.6)' : '#374151'}`,
                color: isRecording ? '#f87171' : '#9ca3af',
                minWidth: isRecording ? (isMobile ? '50px' : '70px') : undefined,
              }}
            >
              {isRecording ? (
                <>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Square size={iconSize - 2} fill="#f87171" />
                    <span style={{
                      position: 'absolute', top: -5, right: -5,
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#ef4444',
                      animation: 'recPulse 1s ease-in-out infinite',
                    }} />
                  </div>
                  {!isMobile && <span style={{ ...lbl, color: '#f87171', letterSpacing: '0.5px' }}>{formatTime(recordingTime)}</span>}
                </>
              ) : (
                <>
                  <Circle size={iconSize} />
                  {!isMobile && <span style={lbl}>تسجيل</span>}
                </>
              )}
            </button>
            {recordingError && (
              <div style={{
                position: isMobile ? 'fixed' : 'absolute', bottom: isMobile ? '60px' : 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
                background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '8px',
                padding: '6px 10px', fontSize: '0.7rem', color: '#fca5a5', whiteSpace: 'nowrap',
                boxShadow: '0 -8px 20px rgba(0,0,0,0.5)', zIndex: 300,
              }}>
                ⚠️ {recordingError}
              </div>
            )}
          </div>
        )}

        {/* ── TEACHER ONLY ── */}
        {isTeacher && (
          <>
            {/* Teaching Tools */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setShowToolsMenu(p => !p); setShowGamesMenu(false) }}
                style={{
                  ...btn,
                  background: activeToolObj ? 'rgba(5,150,105,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeToolObj ? 'rgba(5,150,105,0.4)' : '#374151'}`,
                  color: activeToolObj ? '#10b981' : '#9ca3af',
                }}
              >
                {activeToolObj ? activeToolObj.icon : <PenTool size={iconSize} />}
                {!isMobile && <span style={lbl}>{activeToolObj ? activeToolObj.label : 'الأدوات'}</span>}
                <ChevronUp size={10} style={{ transform: showToolsMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {showToolsMenu && (
                <div style={{
                  position: isMobile ? 'fixed' : 'absolute', bottom: isMobile ? '60px' : 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
                  background: '#1f2937', border: '1px solid #374151', borderRadius: '12px',
                  padding: '12px', boxShadow: '0 -12px 28px rgba(0,0,0,0.6)', zIndex: 300, 
                  width: isMobile ? '92vw' : '450px', maxWidth: '600px',
                  maxHeight: isMobile ? 'calc(100dvh - 80px)' : '420px',
                  overflowY: 'auto'
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 800, padding: '0 4px 8px', marginBottom: '8px' }}>🖊️ أدوات التدريس</div>
                  <div 
                    onWheel={(e) => {
                      if (Math.abs(e.deltaY) > 0) {
                        e.currentTarget.scrollLeft += (e.deltaY > 0 ? 1 : -1) * 40;
                      }
                    }}
                    style={{
                      display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px',
                      WebkitOverflowScrolling: 'touch', direction: 'rtl'
                    }}
                  >
                    {teachingTools.map(t => (
                      <button key={t.id} onClick={() => { onSelectTool?.(t.id); setShowToolsMenu(false) }} style={{
                        flexShrink: 0, width: '80px', height: '70px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        borderRadius: '10px', border: `1px solid ${activeTool === t.id ? '#10b981' : '#374151'}`, cursor: 'pointer',
                        background: activeTool === t.id ? 'rgba(5,150,105,0.2)' : 'rgba(255,255,255,0.03)',
                        color: activeTool === t.id ? '#10b981' : '#d1d5db', fontSize: '0.65rem', fontWeight: 700, transition: '0.2s',
                      }}>
                        {t.icon}<span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Games */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setShowGamesMenu(p => !p); setShowToolsMenu(false) }}
                style={{
                  ...btn,
                  background: isGameActive ? 'rgba(217,119,6,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isGameActive ? 'rgba(217,119,6,0.4)' : '#374151'}`,
                  color: isGameActive ? '#fbbf24' : '#9ca3af',
                }}
              >
                {activeGameObj ? activeGameObj.icon : <Gamepad2 size={iconSize} />}
                {!isMobile && <span style={lbl}>{activeGameObj ? activeGameObj.label : 'الألعاب'}</span>}
                <ChevronUp size={10} style={{ transform: showGamesMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {showGamesMenu && (
                <div style={{
                  position: isMobile ? 'fixed' : 'absolute', bottom: isMobile ? '60px' : 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
                  background: '#1f2937', border: '1px solid #374151', borderRadius: '12px',
                  padding: '12px', boxShadow: '0 -12px 28px rgba(0,0,0,0.6)', zIndex: 300, 
                  width: isMobile ? '92vw' : '450px', maxWidth: '600px',
                  maxHeight: isMobile ? 'calc(100dvh - 80px)' : '420px',
                  overflowY: 'auto'
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 800, padding: '0 4px 8px', marginBottom: '8px' }}>🎮 الألعاب التعليمية</div>
                  <div 
                    onWheel={(e) => {
                      if (Math.abs(e.deltaY) > 0) {
                        e.currentTarget.scrollLeft += (e.deltaY > 0 ? 1 : -1) * 40;
                      }
                    }}
                    style={{
                      display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', borderBottom: '1px solid #374151', marginBottom: '12px',
                      WebkitOverflowScrolling: 'touch', direction: 'rtl'
                    }}
                  >
                    {games.slice(0, 6).map(g => (
                      <button key={g.id} onClick={() => { onSelectTool?.(g.id); setShowGamesMenu(false) }} style={{
                        flexShrink: 0, width: '80px', height: '70px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        borderRadius: '10px', border: `1px solid ${activeTool === g.id ? g.color : '#374151'}`, cursor: 'pointer',
                        background: activeTool === g.id ? `${g.color}22` : 'rgba(255,255,255,0.03)',
                        color: activeTool === g.id ? g.color : '#d1d5db', fontSize: '0.65rem', fontWeight: 700, transition: '0.2s',
                      }}>
                        {g.icon}<span>{g.label}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.65rem', color: '#a78bfa', fontWeight: 800, padding: '0 4px 8px', marginBottom: '8px' }}>📊 إدارة الفصل</div>
                  <div 
                    onWheel={(e) => {
                      if (Math.abs(e.deltaY) > 0) {
                        e.currentTarget.scrollLeft += (e.deltaY > 0 ? 1 : -1) * 40;
                      }
                    }}
                    style={{
                      display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px',
                      WebkitOverflowScrolling: 'touch', direction: 'rtl'
                    }}
                  >
                    {games.slice(6).map(g => (
                      <button key={g.id} onClick={() => { onSelectTool?.(g.id); setShowGamesMenu(false) }} style={{
                        flexShrink: 0, width: '80px', height: '70px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        borderRadius: '10px', border: `1px solid ${activeTool === g.id ? g.color : '#374151'}`, cursor: 'pointer',
                        background: activeTool === g.id ? `${g.color}22` : 'rgba(255,255,255,0.03)',
                        color: activeTool === g.id ? g.color : '#d1d5db', fontSize: '0.65rem', fontWeight: 700, transition: '0.2s',
                      }}>
                        {g.icon}<span>{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Conference */}
            {onToggleConference && (
              <button onClick={onToggleConference} style={{
                ...btn,
                background: conferenceMode ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${conferenceMode ? 'rgba(139,92,246,0.4)' : '#374151'}`,
                color: conferenceMode ? '#c4b5fd' : '#9ca3af',
              }}>
                <Users2 size={iconSize} />
                {!isMobile && <span style={lbl}>جماعي</span>}
              </button>
            )}
            {/* Agora Premium Audio */}
            {onToggleAgora && (
              <button onClick={onToggleAgora} style={{
                ...btn,
                background: isAgoraEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isAgoraEnabled ? 'rgba(16, 185, 129, 0.4)' : '#374151'}`,
                color: isAgoraEnabled ? '#34d399' : '#9ca3af',
              }}>
                <Sparkles size={iconSize} />
                {!isMobile && <span style={lbl}>سيرفر متقدم</span>}
              </button>
            )}

            {/* Captions CC — Teacher */}
            {renderCaptionMenu()}
          </>
        )}

        {/* ── STUDENT ONLY ── */}
        {!isTeacher && (
          <>
            {/* Hand Raise */}
            {onToggleHand && (
              <button onClick={onToggleHand} style={{
                ...btn,
                background: isHandRaised ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isHandRaised ? 'rgba(245,158,11,0.4)' : '#374151'}`,
                color: isHandRaised ? '#fbbf24' : '#9ca3af',
              }}>
                <Hand size={iconSize} />
                {!isMobile && <span style={lbl}>{isHandRaised ? 'يدي مرفوعة' : 'اسأل'}</span>}
              </button>
            )}

            {/* Emoji Reactions */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowReactMenu(p => !p)} style={{
                ...btn,
                background: showReactMenu ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${showReactMenu ? 'rgba(236,72,153,0.4)' : '#374151'}`,
                color: showReactMenu ? '#f472b6' : '#9ca3af',
              }}>
                <Smile size={iconSize} />
                {!isMobile && <span style={lbl}>تفاعل</span>}
              </button>
              {showReactMenu && (
                <div style={{
                  position: isMobile ? 'fixed' : 'absolute', bottom: isMobile ? '60px' : 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
                  background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '10px',
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
                  boxShadow: '0 -12px 28px rgba(0,0,0,0.5)', zIndex: 300,
                }}>
                  {quickEmojis.map(emoji => (
                    <button key={emoji} onClick={() => handleReact(emoji)} style={{
                      background: 'transparent', border: 'none', fontSize: '1.5rem',
                      cursor: 'pointer', padding: '5px', borderRadius: '8px',
                    }}>{emoji}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Captions CC — Student */}
            {renderCaptionMenu()}
          </>
        )}
      </div>

      {/* ── RIGHT: Sidebar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '3px' : '4px', flexShrink: 0 }}>

        {/* Attendance */}
        <button onClick={() => onToggleTab?.('students')} style={{
          ...btn,
          background: activeTab === 'students' ? 'rgba(5,150,105,0.15)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${activeTab === 'students' ? 'rgba(5,150,105,0.4)' : '#374151'}`,
          color: activeTab === 'students' ? '#10b981' : '#9ca3af',
        }}>
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <Users size={iconSize} />
            {handRaisesCount > 0 && (
              <span style={{
                position: 'absolute', top: -7, right: -7, background: '#ef4444', color: '#fff',
                borderRadius: '50%', width: 16, height: 16, fontSize: '0.55rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #111827',
              }}>{handRaisesCount}</span>
            )}
          </span>
          {!isMobile && <span style={lbl}>الحضور</span>}
        </button>

        {/* Chat */}
        <button onClick={() => onToggleTab?.('chat')} style={{
          ...btn,
          background: activeTab === 'chat' ? 'rgba(5,150,105,0.15)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${activeTab === 'chat' ? 'rgba(5,150,105,0.4)' : '#374151'}`,
          color: activeTab === 'chat' ? '#10b981' : '#9ca3af',
        }}>
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <MessageSquare size={iconSize} />
            {unreadChat > 0 && (
              <span style={{
                position: 'absolute', top: -7, right: -7, background: '#059669', color: '#fff',
                borderRadius: '50%', width: 16, height: 16, fontSize: '0.55rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #111827',
              }}>{unreadChat}</span>
            )}
          </span>
          {!isMobile && <span style={lbl}>الدردشة</span>}
        </button>
      </div>

    </div>
    </>
  )
}
