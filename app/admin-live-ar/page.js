'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { supabase } from '../../utils/supabase'
import {
  Video, VideoOff, Mic, MicOff, RefreshCw,
  Sparkles, Maximize2, Minimize2, ArrowRight,
  Share2, Check, Copy, Settings2, Hand, MousePointer,
  Radio, Users, MessageSquare, Heart, Award, ShieldAlert,
  Download, CircleDot, Play, Pause, ChevronRight, ChevronLeft
} from 'lucide-react'

// Dynamically import ARGameCanvas so it only renders on client
const ARGameCanvas = dynamic(() => import('./ARGameCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#090d16',
      color: '#38bdf8',
      gap: '16px'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid rgba(56, 189, 248, 0.2)',
        borderTopColor: '#38bdf8',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>جاري تشغيل استوديو الواقع المعزز (AR Live)... 🖐️✨</div>
    </div>
  )
})

export default function AdminLiveARPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState(null)
  const [roomId, setRoomId] = useState('ar-studio-beta')
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isMirrored, setIsMirrored] = useState(true)
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [useMouseFallback, setUseMouseFallback] = useState(false)
  const [sensitivity, setSensitivity] = useState(0.085)
  const [gameMode, setGameMode] = useState('colors')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState('chat') // 'chat' | 'settings' | 'students'
  
  // Realtime Chat & Reactions
  const [channel, setChannel] = useState(null)
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'النظام', text: 'مرحباً بك في استوديو البث التفاعلي بالواقع المعزز (AR Live Studio)! 🖐️✨', time: 'الآن', isSystem: true }
  ])
  const [chatInput, setChatInput] = useState('')
  const [reactions, setReactions] = useState([])
  const [onlineCount, setOnlineCount] = useState(1)

  // Recording State
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])

  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
        }
      } catch (e) {}
    }
    checkAuth()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Supabase Realtime Channel
  useEffect(() => {
    if (!roomId) return

    const arChannel = supabase.channel(`ar-room-${roomId}`, {
      config: { broadcast: { ack: false } }
    })

    arChannel
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        triggerReaction(payload.emoji, payload.sender || 'طالب')
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        setChatMessages(prev => [...prev, payload])
      })
      .subscribe()

    setChannel(arChannel)

    return () => {
      supabase.removeChannel(arChannel)
    }
  }, [roomId])

  // Reaction Trigger
  const triggerReaction = (emoji, sender = 'أنا') => {
    const id = Date.now() + Math.random()
    const left = Math.floor(Math.random() * 60) + 20
    const newReaction = { id, emoji, left, sender }

    setReactions(prev => [...prev.slice(-15), newReaction])
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id))
    }, 2800)

    if (channel && channel.state === 'joined') {
      channel.send({
        type: 'broadcast',
        event: 'reaction',
        payload: { emoji, sender }
      })
    }
  }

  // Send Chat
  const handleSendChat = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const msg = {
      id: Date.now().toString(),
      sender: user?.user_metadata?.full_name || 'الأدمن (المعلم)',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      isAdmin: true
    }

    setChatMessages(prev => [...prev, msg])
    if (channel && channel.state === 'joined') {
      channel.send({
        type: 'broadcast',
        event: 'chat',
        payload: msg
      })
    }
    setChatInput('')
  }

  // Copy Student Invite Link
  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const link = `${origin}/live-ar?room=${roomId}`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  // Quick Screen Recording
  const handleToggleRecord = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 30 },
          audio: true
        })
        recordedChunksRef.current = []
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' })
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data)
        }
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `AR_Live_Session_${Date.now()}.webm`
          a.click()
          URL.revokeObjectURL(url)
          stream.getTracks().forEach(t => t.stop())
        }
        mediaRecorderRef.current = recorder
        recorder.start()
        setIsRecording(true)
      } catch (err) {
        console.warn('Recording cancelled or unavailable:', err)
      }
    }
  }

  if (!mounted) return null

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0f1d',
      color: '#f8fafc',
      fontFamily: "'Tajawal', sans-serif",
      direction: 'rtl',
      overflow: 'hidden'
    }}>
      
      {/* ── RESPONSIVE STYLES FOR LAPTOPS & PHONES ── */}
      <style jsx global>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          15% { opacity: 1; transform: translateY(-30px) scale(1.1); }
          85% { opacity: 0.9; }
          100% { transform: translateY(-240px) scale(1.3); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.9); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1280px) {
          .ar-hide-on-laptop { display: none !important; }
          .ar-compact-pad { padding: 5px 8px !important; }
        }
        @media (max-width: 900px) {
          .ar-hide-on-tablet { display: none !important; }
        }
        @media (max-height: 720px) {
          .ar-header-bar { height: 48px !important; min-height: 48px !important; }
          .ar-bottom-dock { bottom: 8px !important; padding: 4px 8px !important; }
        }
      `}</style>

      {/* ── TOP HEADER / NAVIGATION ── */}
      <header className="ar-header-bar" style={{
        height: '56px',
        minHeight: '56px',
        padding: '0 12px',
        background: 'rgba(15, 23, 42, 0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        gap: '8px',
        zIndex: 50,
        overflow: 'hidden'
      }}>
        {/* Right side: App Branding & Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 1 }}>
          <Link
            href="/admin-dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f8fafc',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            <ArrowRight size={15} />
            <span className="ar-hide-on-tablet">لوحة الأدمن</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div style={{
              width: '30px',
              height: '30px',
              minWidth: '30px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}>
              🖐️
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <h1 style={{
                margin: 0,
                fontSize: '0.92rem',
                fontWeight: 900,
                color: '#f8fafc',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {isMobile ? 'AR Live 🖐️' : 'استوديو الواقع المعزز (AR Live)'}
              </h1>
              <div className="ar-hide-on-laptop" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.68rem',
                color: '#a78bfa',
                whiteSpace: 'nowrap'
              }}>
                <span>✨ MediaPipe AI Hands</span>
                <span>•</span>
                <span style={{ color: '#10b981', fontWeight: 800 }}>تجريبي خاص بالإدارة 👑</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Room Info & Share */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <div className="ar-hide-on-tablet" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '4px 10px',
            borderRadius: '20px',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#ef4444',
              display: 'inline-block',
              boxShadow: '0 0 8px #ef4444'
            }} />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#fca5a5' }}>بث تجريبي</span>
          </div>

          <button
            onClick={handleCopyLink}
            title="نسخ رابط الطالب"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '10px',
              background: copiedLink ? '#10b981' : 'rgba(56, 189, 248, 0.15)',
              border: `1px solid ${copiedLink ? '#10b981' : 'rgba(56, 189, 248, 0.3)'}`,
              color: copiedLink ? '#ffffff' : '#38bdf8',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {copiedLink ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedLink ? 'تم النسخ!' : 'رابط الطالب'}</span>
          </button>
        </div>

        {/* Left side: Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            onClick={handleToggleRecord}
            title={isRecording ? 'إيقاف التسجيل' : 'تسجيل الحصة فيديو'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '10px',
              background: isRecording ? '#ef4444' : 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
          >
            <CircleDot size={14} style={{ color: isRecording ? '#ffffff' : '#ef4444' }} />
            <span className="ar-hide-on-tablet">{isRecording ? 'يسجل...' : 'تسجيل'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
            style={{
              padding: '7px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '8px',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <button
            onClick={() => setIsSidebarOpen(p => !p)}
            style={{
              padding: '6px 10px',
              background: isSidebarOpen ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${isSidebarOpen ? 'rgba(139, 92, 246, 0.4)' : 'transparent'}`,
              borderRadius: '8px',
              color: isSidebarOpen ? '#c4b5fd' : '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.78rem',
              fontWeight: 700,
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
          >
            <MessageSquare size={15} />
            <span className="ar-hide-on-tablet">الدردشة</span>
          </button>
        </div>
      </header>

      {/* ── MAIN STAGE AREA ── */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        
        {/* AR Canvas & Camera Container */}
        <main style={{ flex: 1, position: 'relative', height: '100%', overflow: 'hidden' }}>
          <ARGameCanvas
            gameMode={gameMode}
            isCameraOn={isCameraOn}
            isMirrored={isMirrored}
            showSkeleton={showSkeleton}
            sensitivity={sensitivity}
            useMouseFallback={useMouseFallback}
          />

          {/* Floating Reactions Overlay (Corner Positioned with Zero Pointer Events) */}
          <div style={{
            position: 'absolute',
            bottom: '72px',
            right: '16px',
            pointerEvents: 'none',
            zIndex: 35,
            width: '120px',
            height: '240px',
            overflow: 'hidden'
          }}>
            {reactions.map(r => (
              <div
                key={r.id}
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: `${Math.min(r.left, 70)}px`,
                  fontSize: '26px',
                  animation: 'floatUp 2.4s ease-out forwards',
                  filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
                }}
              >
                {r.emoji}
              </div>
            ))}
          </div>

          {/* Bottom Floating Control Bar (Sleek, Compact Dock with No Overlap) */}
          <div className="ar-bottom-dock" style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'nowrap',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '6px 10px',
            borderRadius: '22px',
            boxShadow: '0 12px 35px rgba(0,0,0,0.5)',
            maxWidth: 'calc(100% - 24px)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            boxSizing: 'border-box'
          }}>
            {/* Camera Toggle */}
            <button
              onClick={() => setIsCameraOn(p => !p)}
              title={isCameraOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
              style={{
                width: '36px',
                height: '36px',
                minWidth: '36px',
                borderRadius: '50%',
                border: 'none',
                background: isCameraOn ? 'rgba(56, 189, 248, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: isCameraOn ? '#38bdf8' : '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s'
              }}
            >
              {isCameraOn ? <Video size={17} /> : <VideoOff size={17} />}
            </button>

            {/* Mic Toggle */}
            <button
              onClick={() => setIsMicOn(p => !p)}
              title={isMicOn ? 'كتم المايك' : 'تشغيل المايك'}
              style={{
                width: '36px',
                height: '36px',
                minWidth: '36px',
                borderRadius: '50%',
                border: 'none',
                background: isMicOn ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: isMicOn ? '#10b981' : '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {isMicOn ? <Mic size={17} /> : <MicOff size={17} />}
            </button>

            {/* Mirror Camera */}
            <button
              onClick={() => setIsMirrored(p => !p)}
              title="عكس الكاميرا (مرآة)"
              style={{
                width: '36px',
                height: '36px',
                minWidth: '36px',
                borderRadius: '50%',
                border: 'none',
                background: isMirrored ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                color: isMirrored ? '#c4b5fd' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <RefreshCw size={15} />
            </button>

            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.15)', margin: '0 2px', flexShrink: 0 }} />

            {/* Game Mode Selector */}
            <select
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              style={{
                background: 'rgba(30, 41, 59, 0.95)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                padding: '6px 8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                outline: 'none',
                flexShrink: 0,
                width: '105px'
              }}
            >
              <option value="colors">🎨 ألوان</option>
              <option value="arabic">🔤 عربي</option>
              <option value="math">🔢 حساب</option>
              <option value="bubbles">🫧 فقاعات</option>
            </select>

            {/* Control Type: Hand Tracking vs Mouse */}
            <button
              onClick={() => setUseMouseFallback(p => !p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '10px',
                border: 'none',
                background: useMouseFallback ? '#3b82f6' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: useMouseFallback ? '0 4px 14px rgba(59, 130, 246, 0.4)' : '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              {useMouseFallback ? <MousePointer size={14} /> : <Hand size={14} />}
              <span>{useMouseFallback ? 'ماوس 🖱️' : 'AI 🖐️'}</span>
            </button>

            {/* Hand Skeleton Wireframe Toggle */}
            {!useMouseFallback && (
              <button
                onClick={() => setShowSkeleton(p => !p)}
                title="إظهار/إخفاء شبكة مفاصل اليد (Skeleton)"
                style={{
                  padding: '6px 9px',
                  borderRadius: '10px',
                  border: 'none',
                  background: showSkeleton ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                  color: showSkeleton ? '#22d3ee' : '#64748b',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <span>{showSkeleton ? 'عظام 👁️' : 'عظام 🕶️'}</span>
              </button>
            )}

            {/* Quick Reactions Bar (Top 3 for compact layout) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
              {['👏', '❤️', '🌟'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => triggerReaction(emoji)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '17px',
                    cursor: 'pointer',
                    padding: '2px',
                    flexShrink: 0,
                    transition: 'transform 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.25)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* ── RIGHT PANEL (Chat & Attendees) ── */}
        <aside style={{
          width: isMobile ? (isSidebarOpen ? 'min(340px, 92vw)' : '0px') : (isSidebarOpen ? '320px' : '0px'),
          minWidth: isMobile ? '0px' : (isSidebarOpen ? '320px' : '0px'),
          position: isMobile ? 'absolute' : 'relative',
          right: 0,
          top: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.98)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          zIndex: isMobile ? 60 : 45,
          boxShadow: isMobile && isSidebarOpen ? '-8px 0 35px rgba(0,0,0,0.85)' : 'none'
        }}>
          {/* Sidebar Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '4px 8px',
            background: 'rgba(0, 0, 0, 0.2)'
          }}>
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                title="إغلاق الدردشة"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#f8fafc',
                  borderRadius: '6px',
                  width: '32px',
                  height: '32px',
                  fontSize: '15px',
                  cursor: 'pointer',
                  marginLeft: '4px'
                }}
              >
                ✕
              </button>
            )}
            <button
              onClick={() => setActiveTab('chat')}
              style={{
                flex: 1,
                padding: '10px 4px',
                background: activeTab === 'chat' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: activeTab === 'chat' ? '#38bdf8' : '#94a3b8',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <MessageSquare size={15} />
              <span>الدردشة الحية</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              style={{
                flex: 1,
                padding: '10px 4px',
                background: activeTab === 'settings' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: activeTab === 'settings' ? '#38bdf8' : '#94a3b8',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Settings2 size={15} />
              <span>إعدادات AR</span>
            </button>
          </div>

          {/* Tab 1: Chat Messages */}
          {activeTab === 'chat' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      background: msg.isSystem ? 'rgba(56, 189, 248, 0.1)' : msg.isAdmin ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${msg.isSystem ? 'rgba(56, 189, 248, 0.25)' : msg.isAdmin ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '12px',
                      padding: '10px 12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: msg.isSystem ? '#38bdf8' : msg.isAdmin ? '#c4b5fd' : '#10b981'
                      }}>
                        {msg.sender}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{msg.time}</span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#f1f5f9', lineHeight: 1.4 }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} style={{ padding: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="اكتب رسالة للطلاب أو تفاعل..."
                    style={{
                      flex: 1,
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      color: 'white',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#38bdf8',
                      color: '#0f172a',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 14px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    إرسال
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: AR Settings */}
          {activeTab === 'settings' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>
                  حساسية مسافة القرص (Pinch Sensitivity):
                </label>
                <input
                  type="range"
                  min="0.04"
                  max="0.14"
                  step="0.005"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  <span>أصعب (0.04)</span>
                  <span style={{ color: '#10b981', fontWeight: 800 }}>{sensitivity} (الافتراضي 0.085)</span>
                  <span>أسهل بالقرص (0.14)</span>
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                  طريقة التحكم في البث:
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  • <b>تتبع اليد:</b> ضع يدك أمام الكاميرا، وقم بقرص إصبع الإبهام مع السبابة (🤏) لالتقاط الحروف والألوان ووضعها في المربعات.
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  • <b>الفأرة واللمس:</b> في حال كنت تستخدم جهازاً بدون كاميرا أو إضاءة منخفضة، يمكنك سحب الحروف مباشرة بالفأرة أو اللمس.
                </div>
              </div>

              <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c4b5fd', marginBottom: '6px' }}>
                  👑 وضع المعاينة للأدمن
                </div>
                <div style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                  هذه النسخة غير متاحة للمعلمين في لوحتهم العادية حتى تنتهي من اختبارها والتأكد من ملاءمتها الكاملة لخططك.
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

    </div>
  )
}
