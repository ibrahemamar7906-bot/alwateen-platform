'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import LiveSidebar from '../../virtual-classroom/LiveSidebar'
import LiveBottomBar from '../../virtual-classroom/LiveBottomBar'
import dynamic from 'next/dynamic'
import { useWebRTC } from '../useWebRTC'
import ReactionOverlay from '../ReactionOverlay'
import { Copy, Check, Users } from 'lucide-react'
import { applyAudioSink, getActiveAudioSinkId } from '../AudioOutputSelector'
import { Suspense } from 'react'

const LiveWhiteboardTeacher = dynamic(() => import('../../teacher-assistant/live-components/LiveWhiteboardTeacher'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#10b981', fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Tajawal' }}>
      جاري تحميل السبورة... 🎨
    </div>
  )
})

const TRIAL_MAX_STUDENTS = 3

const RemoteAudio = ({ stream }) => {
  const audioRef = useRef(null)
  useEffect(() => {
    if (!stream) return
    const audio = audioRef.current
    if (audio) {
      audio.srcObject = stream
      audio.muted = false
      audio.volume = 1.0
      audio.play().catch(() => {})
    }
    const unlockAndPlay = () => { if (audio) { audio.srcObject = stream; audio.play().catch(() => {}) } }
    stream.onaddtrack = unlockAndPlay
    stream.getAudioTracks().forEach(t => { t.onunmute = unlockAndPlay })
    window.addEventListener('click', unlockAndPlay, { once: true })
    window.addEventListener('touchstart', unlockAndPlay, { once: true })
    if (audio) applyAudioSink(audio, getActiveAudioSinkId())
    return () => { window.removeEventListener('click', unlockAndPlay); window.removeEventListener('touchstart', unlockAndPlay) }
  }, [stream])
  return <audio ref={audioRef} autoPlay playsInline style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1 }} />
}

function TrialTeacherRoomContent() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room') || ''
  const [mounted, setMounted] = useState(false)
  const [teacherId] = useState(() => `trial-teacher-${Math.random().toString(36).substring(2, 9)}`)
  const [channel, setChannel] = useState(null)
  const [students, setStudents] = useState([])
  const [activeTool, setActiveTool] = useState('whiteboard')
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sidebarTab, setSidebarTab] = useState('chat')
  const [handRaises, setHandRaises] = useState([])
  const [copiedLink, setCopiedLink] = useState(false)
  const [classTimer, setClassTimer] = useState('00:00')
  const [toast, setToast] = useState(null)
  const [isSubscribed] = useState(false) // Trial always false

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      const w = window.innerWidth
      setIsMobile(w <= 768)
      if (w > 768) setIsSidebarOpen(true)
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Timer
  useEffect(() => {
    let seconds = 0
    const t = setInterval(() => {
      seconds++
      const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
      const secs = (seconds % 60).toString().padStart(2, '0')
      setClassTimer(`${mins}:${secs}`)
    }, 1000)
    return () => clearInterval(t)
  }, [])

  // Setup Supabase Realtime channel
  useEffect(() => {
    if (!roomId || !teacherId) return
    let isActive = true

    const addOrUpdateStudent = (p) => {
      if (!p || p.isTeacher) return
      setStudents(prev => {
        const exists = prev.find(d => d.deviceId === (p.deviceId || p.id))
        if (exists) return prev.map(d => d.deviceId === (p.deviceId || p.id) ? { ...d, ...p, deviceId: p.deviceId || p.id } : d)
        return [...prev, { ...p, deviceId: p.deviceId || p.id }]
      })
    }

    const ch = supabase.channel(`trial-room-${roomId}`, {
      config: { presence: { key: teacherId }, broadcast: { ack: false } }
    })

    ch
      .on('presence', { event: 'sync' }, () => {
        if (!isActive) return
        const state = ch.presenceState()
        const list = []
        Object.keys(state).forEach(key => {
          const entries = state[key]
          entries.forEach(entry => {
            if (!entry.isTeacher) list.push(entry)
          })
        })
        setStudents(list)
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        if (!isActive || !Array.isArray(newPresences)) return
        newPresences.forEach(p => addOrUpdateStudent(p))
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        if (!isActive || !Array.isArray(leftPresences)) return
        const leftIds = leftPresences.map(p => p.deviceId || p.id).filter(Boolean)
        setStudents(prev => prev.filter(d => !leftIds.includes(d.deviceId || d.id)))
      })
      .on('broadcast', { event: 'student_presence_pulse' }, ({ payload }) => {
        if (!isActive || !payload || payload.isTeacher) return
        addOrUpdateStudent(payload)
      })
      .on('broadcast', { event: 'hand_raise' }, ({ payload }) => {
        if (!isActive) return
        if (payload?.action === 'raise') {
          setHandRaises(prev => prev.includes(payload.deviceId) ? prev : [...prev, payload.deviceId])
        } else {
          setHandRaises(prev => prev.filter(id => id !== payload.deviceId))
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && isActive) {
          await ch.track({ isTeacher: true, teacherId, name: 'معلم' })
          setChannel(ch)
        }
      })

    return () => {
      isActive = false
      ch.unsubscribe()
      setChannel(null)
      setStudents([])
    }
  }, [roomId, teacherId])

  const { startAudio, stopMedia, toggleMic, toggleCamera, isMicOn, isCameraOn, localStream, peers, pingMs, forceMuteStudent, grantSpeakToStudent } = useWebRTC(channel, teacherId, 'معلم', true)

  const handleCopyLink = () => {
    const joinLink = `${window.location.origin}/live/trial/join?room=${roomId}`
    navigator.clipboard.writeText(joinLink).then(() => {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    })
  }

  if (!mounted) return null

  const studentCount = students.length
  const joinLink = typeof window !== 'undefined' ? `${window.location.origin}/live/trial/join?room=${roomId}` : ''

  return (
    <div style={{ width: '100vw', height: 'var(--app-height, 100vh)', display: 'flex', flexDirection: 'column', background: '#0f172a', fontFamily: 'Tajawal, sans-serif', direction: 'rtl', overflow: 'hidden', position: 'relative' }}>

      {/* Trial Banner */}
      <div style={{
        background: 'linear-gradient(90deg, #059669, #10b981)',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        gap: 8,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
            🎯 وضع تجريبي مجاني
          </span>
          <span style={{ background: 'rgba(0,0,0,0.2)', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Users size={12} /> {studentCount} / {TRIAL_MAX_STUDENTS} طلاب
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleCopyLink}
            style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: '#fff', padding: '4px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Tajawal' }}
          >
            {copiedLink ? <><Check size={12} /> تم النسخ!</> : <><Copy size={12} /> نسخ رابط الطلاب</>}
          </button>
          <a href="/pricing" style={{ background: '#fff', color: '#059669', padding: '4px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
            ⬆️ اشترك
          </a>
        </div>
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        {/* Whiteboard area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, position: 'relative' }}>
          <div style={{ display: activeTool === 'whiteboard' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
              <LiveWhiteboardTeacher channel={channel} students={students} isMobile={isMobile} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {isSidebarOpen && channel && (
          <LiveSidebar
            isTeacher={true}
            students={students}
            handRaises={handRaises}
            activeControlDeviceId={null}
            channel={channel}
            teacherId={teacherId}
            teacherName="معلم"
            onClose={() => setIsSidebarOpen(false)}
            activeTab={sidebarTab}
            setActiveTab={setSidebarTab}
            isMobile={isMobile}
            isSubscribed={false}
            forceMuteStudent={forceMuteStudent}
            grantSpeakToStudent={grantSpeakToStudent}
            onHandRaiseClear={(id) => setHandRaises(prev => prev.filter(x => x !== id))}
          />
        )}
      </div>

      {/* Bottom Bar */}
      <LiveBottomBar
        isMicOn={isMicOn}
        isCameraOn={isCameraOn}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        activeTab={sidebarTab}
        onToggleTab={(tab) => {
          if (isSidebarOpen && sidebarTab === tab) {
            setIsSidebarOpen(false)
          } else {
            setSidebarTab(tab)
            setIsSidebarOpen(true)
          }
        }}
        isTeacher={true}
        studentCount={studentCount}
        handRaisesCount={handRaises.length}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        isMobile={isMobile}
        pingMs={pingMs}
        channel={channel}
        roomId={roomId}
        teacherId={teacherId}
        onLeave={() => window.location.href = '/'}
      />

      {/* Remote Audio */}
      {peers.filter(p => p.stream).map(peer => (
        <RemoteAudio key={`audio-${peer.id}`} stream={peer.stream} />
      ))}

      {/* ReactionOverlay */}
      {channel && <ReactionOverlay channel={channel} isTeacher={true} />}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '10px 20px', borderRadius: 10, fontFamily: 'Tajawal', fontWeight: 700, zIndex: 9999 }}>
          {toast.msg}
        </div>
      )}

      {/* Save attempt blocker */}
      <style>{`
        .save-blocked { display: none !important; }
      `}</style>
    </div>
  )
}

export default function TrialTeacherRoom() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrialTeacherRoomContent />
    </Suspense>
  )
}