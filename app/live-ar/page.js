'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { supabase } from '../../utils/supabase'
import {
  MessageSquare, Heart, Sparkles, ArrowRight,
  Maximize2, Minimize2, Video, VideoOff, Mic, MicOff,
  Hand, MousePointer, ShieldCheck
} from 'lucide-react'

const ARGameCanvas = dynamic(() => import('../admin-live-ar/ARGameCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#090d16',
      color: '#38bdf8',
      fontWeight: 800
    }}>
      جاري تحميل تجربة الواقع المعزز التفاعلية... 🖐️✨
    </div>
  )
})

function StudentARLiveContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const room = searchParams.get('room') || 'ar-studio-beta'

  const [studentName, setStudentName] = useState('طالب متفاعل')
  const [hasEntered, setHasEntered] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'المعلم', text: 'أهلاً بك في حصة الواقع المعزز التفاعلية! 🖐️✨ جرب التفاعل بالأيدي.', time: 'الآن', isAdmin: true }
  ])
  const [chatInput, setChatInput] = useState('')
  const [reactions, setReactions] = useState([])
  const [channel, setChannel] = useState(null)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [useMouseFallback, setUseMouseFallback] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Realtime Supabase
  useEffect(() => {
    if (!room || !hasEntered) return

    const arChannel = supabase.channel(`ar-room-${room}`, {
      config: { broadcast: { ack: false } }
    })

    arChannel
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        triggerLocalReaction(payload.emoji, payload.sender)
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        setChatMessages(prev => [...prev, payload])
      })
      .subscribe()

    setChannel(arChannel)

    return () => {
      supabase.removeChannel(arChannel)
    }
  }, [room, hasEntered])

  const triggerLocalReaction = (emoji, sender) => {
    const id = Date.now() + Math.random()
    const left = Math.floor(Math.random() * 60) + 20
    setReactions(prev => [...prev.slice(-15), { id, emoji, left, sender }])
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id))
    }, 2800)
  }

  const sendReaction = (emoji) => {
    triggerLocalReaction(emoji, studentName)
    if (channel && channel.state === 'joined') {
      channel.send({
        type: 'broadcast',
        event: 'reaction',
        payload: { emoji, sender: studentName }
      })
    }
  }

  const handleSendChat = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const msg = {
      id: Date.now().toString(),
      sender: studentName,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      isAdmin: false
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

  if (!hasEntered) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #090d16 100%)',
        fontFamily: "'Tajawal', sans-serif",
        direction: 'rtl',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          padding: '36px',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
        }}>
          <div style={{ fontSize: '50px', marginBottom: '12px' }}>🖐️✨</div>
          <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px' }}>
            الانضمام للبث التفاعلي بالواقع المعزز
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
            ستتمكن من استخدام يدك أمام الكاميرا أو الفأرة للتفاعل مع الحروف والفقاعات!
          </p>

          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="اكتب اسمك للمشاركة..."
            style={{
              width: '100%',
              background: 'rgba(30, 41, 59, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: 'white',
              fontSize: '1rem',
              fontFamily: 'inherit',
              marginBottom: '20px',
              outline: 'none',
              textAlign: 'center'
            }}
          />

          <button
            onClick={() => setHasEntered(true)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '1.1rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(16, 185, 129, 0.4)'
            }}
          >
            دخول الحصة الآن 🚀
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#090d16',
      fontFamily: "'Tajawal', sans-serif",
      direction: 'rtl',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <header style={{
        height: '56px',
        padding: '0 16px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '20px' }}>🖐️✨</div>
          <span style={{ fontWeight: 800, color: 'white', fontSize: '1rem' }}>
            حصة الواقع المعزز التفاعلية
          </span>
          <span style={{
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#10b981',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '0.75rem',
            fontWeight: 800
          }}>
            مباشر ●
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setUseMouseFallback(p => !p)}
            style={{
              padding: '6px 12px',
              background: useMouseFallback ? '#3b82f6' : 'rgba(255,255,255,0.08)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {useMouseFallback ? <MousePointer size={14} /> : <Hand size={14} />}
            <span>{useMouseFallback ? 'مود الماوس' : 'تتبع اليد بالـ AI'}</span>
          </button>

          <button
            onClick={() => setIsSidebarOpen(p => !p)}
            style={{
              padding: '6px 12px',
              background: isSidebarOpen ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.08)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MessageSquare size={14} />
            <span>الدردشة</span>
          </button>
        </div>
      </header>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        <main style={{ flex: 1, position: 'relative', height: '100%' }}>
          <ARGameCanvas
            gameMode="colors"
            isCameraOn={isCameraOn}
            isMirrored={true}
            showSkeleton={true}
            useMouseFallback={useMouseFallback}
          />

          {/* Floating Reactions */}
          <div style={{
            position: 'absolute',
            bottom: '90px',
            right: '20px',
            pointerEvents: 'none',
            zIndex: 35,
            width: '160px',
            height: '320px',
            overflow: 'hidden'
          }}>
            {reactions.map(r => (
              <div
                key={r.id}
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: `${r.left}px`,
                  fontSize: '30px',
                  animation: 'floatUp 2.8s ease-out forwards'
                }}
              >
                {r.emoji}
              </div>
            ))}
          </div>

          {/* Student Emoji Bar */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '6px 16px',
            borderRadius: '20px'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '6px' }}>أرسل تفاعلك:</span>
            {['❤️', '👏', '🌟', '🔥', '💡'].map(emoji => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '22px',
                  cursor: 'pointer',
                  padding: '4px',
                  transition: 'transform 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.3)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {emoji}
              </button>
            ))}
          </div>
        </main>

        {/* Sidebar */}
        {isSidebarOpen && (
          <aside style={{
            width: '300px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 45
          }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chatMessages.map(msg => (
                <div key={msg.id} style={{
                  background: msg.isAdmin ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '8px 12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: msg.isAdmin ? '#c4b5fd' : '#10b981' }}>
                      {msg.sender}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{msg.time}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#f1f5f9' }}>{msg.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} style={{ padding: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="اكتب رسالة..."
                  style={{
                    flex: 1,
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  إرسال
                </button>
              </div>
            </form>
          </aside>
        )}
      </div>

      <style jsx global>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.6); opacity: 1; }
          50% { transform: translateY(-150px) scale(1.2); opacity: 0.9; }
          100% { transform: translateY(-300px) scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function StudentARLivePage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <StudentARLiveContent />
    </Suspense>
  )
}
