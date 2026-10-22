'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../../../utils/supabase'
import LiveSidebar from '../../../virtual-classroom/LiveSidebar'
import LiveBottomBar from '../../../virtual-classroom/LiveBottomBar'
import ReactionOverlay from '../../ReactionOverlay'
import dynamic from 'next/dynamic'
import { useHybridRTC } from '../../useHybridRTC'
import { applyAudioSink, getActiveAudioSinkId } from '../../AudioOutputSelector'
import { Users, Radio } from 'lucide-react'
import { Suspense } from 'react'

const LiveWhiteboardStudent = dynamic(() => import('../../LiveWhiteboardStudent'), { ssr: false })

const TRIAL_MAX_STUDENTS = 3

const RemoteAudio = ({ stream }) => {
  const audioRef = useRef(null)
  useEffect(() => {
    if (!stream) return
    const audio = audioRef.current
    if (audio) { audio.srcObject = stream; audio.muted = false; audio.volume = 1.0; audio.play().catch(() => {}) }
    const unlock = () => { if (audio) { audio.srcObject = stream; audio.play().catch(() => {}) } }
    stream.onaddtrack = unlock
    stream.getAudioTracks().forEach(t => { t.onunmute = unlock })
    window.addEventListener('click', unlock, { once: true })
    window.addEventListener('touchstart', unlock, { once: true })
    if (audio) applyAudioSink(audio, getActiveAudioSinkId())
    return () => { window.removeEventListener('click', unlock); window.removeEventListener('touchstart', unlock) }
  }, [stream])
  return <audio ref={audioRef} autoPlay playsInline style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1 }} />
}

function NameEntryScreen({ onJoin, roomId }) {
  const [name, setName] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('student_live_name')
    if (saved) setName(saved)
  }, [])

  const handleJoin = async () => {
    const trimmed = name.trim()
    if (!trimmed) { setError('من فضلك ادخل اسمك'); return }
    setChecking(true)
    setError('')
    try {
      const tempCh = supabase.channel(`virtual-room-${roomId}`, { config: { broadcast: { ack: false } } })
      let done = false
      const timeout = setTimeout(() => {
        if (!done) { 
          done = true; 
          tempCh.unsubscribe(); 
          setError('تعذر الاتصال بالسيرفر، يرجى المحاولة مرة أخرى.');
          setChecking(false);
        }
      }, 5000)
      tempCh.subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && !done) {
          await new Promise(r => setTimeout(r, 1000)) // Wait for presence to sync
          const state = tempCh.presenceState()
          const studentCount = Object.values(state).flat().filter(p => !p.isTeacher).length
          clearTimeout(timeout)
          done = true
          await tempCh.unsubscribe()
          if (studentCount >= TRIAL_MAX_STUDENTS) {
            setError('الغرفة ممتلئة — وضع التجربة يسمح بـ ' + TRIAL_MAX_STUDENTS + ' طلاب فقط')
            setChecking(false)
          } else {
            localStorage.setItem('student_live_name', trimmed)
            onJoin(trimmed)
          }
        }
      })
    } catch (e) {
      setError('حدث خطأ غير متوقع، يرجى التحقق من الاتصال.');
      setChecking(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Tajawal, sans-serif', direction: 'rtl', padding: 20,
    }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '15%', right: '15%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(16,185,129,0.06)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(139,92,246,0.06)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative' }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>🎓</div>
        <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>غرفة البث المباشر</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 6 }}>أهلاً بك يا بطل</p>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
        padding: '36px 40px', maxWidth: 400, width: '100%', position: 'relative',
      }}>
        <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: 8 }}>اسمك</label>
        <input
          type="text" value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          placeholder="اكتب اسمك هنا..." autoFocus
          style={{
            width: '100%', padding: '14px 16px',
            background: 'rgba(255,255,255,0.08)',
            border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12, color: '#fff', fontSize: '1rem', fontFamily: 'Tajawal',
            outline: 'none', boxSizing: 'border-box', marginBottom: 8,
          }}
        />
        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '0 0 12px' }}>{error}</p>}
        <button
          onClick={handleJoin} disabled={checking}
          style={{
            width: '100%', padding: '14px',
            marginTop: error ? 0 : 12,
            background: checking ? '#334155' : 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', border: 'none', borderRadius: 12,
            fontSize: '1.1rem', fontWeight: 800, cursor: checking ? 'not-allowed' : 'pointer',
            fontFamily: 'Tajawal', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {checking ? 'جاري التحقق...' : (<><Radio size={18} /> ادخل الحصة</>)}
        </button>
      </div>

      <p style={{ color: '#334155', fontSize: '0.8rem', marginTop: 24, textAlign: 'center' }}>
        حد أقصى {TRIAL_MAX_STUDENTS} طلاب في الوضع التجريبي
      </p>
    </div>
  )
}

function TrialStudentRoomContent() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room') || ''
  const [mounted, setMounted] = useState(false)
  const [studentName, setStudentName] = useState(null)
  const [deviceId] = useState(() => 'trial-s-' + Math.random().toString(36).substring(2, 9))
  const [channel, setChannel] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sidebarTab, setSidebarTab] = useState('chat')
  const [handRaised, setHandRaised] = useState(false)
  const [focusMode, setFocusMode] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      document.documentElement.style.setProperty('--app-height', window.innerHeight + 'px')
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
          if (data?.full_name) {
            setStudentName(data.full_name)
            return
          }
        }
        const saved = localStorage.getItem('student_live_name')
        if (saved) setStudentName(saved)
      } catch (e) {
        console.error(e)
      }
    }
    fetchProfile()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!roomId || !studentName || !deviceId) return
    let isActive = true
    const pulsePayload = { deviceId, name: studentName, isTeacher: false }

    const ch = supabase.channel('virtual-room-' + roomId, {
      config: { presence: { key: deviceId }, broadcast: { ack: false } }
    })

    ch
      .on('broadcast', { event: 'tool_state_update' }, ({ payload }) => {
        if (!isActive || !payload) return
      })
      .on('broadcast', { event: 'sync_agora_state' }, ({ payload }) => {
        if (!isActive || !payload) return
        setIsAgoraEnabled(payload.enabled)
      })
      .on('broadcast', { event: 'room_state' }, ({ payload }) => {
        if (!isActive || !payload) return
        setFocusMode(payload.focusMode || false)
      })
      .on('broadcast', { event: 'react_state' }, ({ payload }) => {
        if (!isActive) return
        window.dispatchEvent(new CustomEvent('on_react_state', { detail: payload }))
      })
      .on('broadcast', { event: 'cheer' }, ({ payload }) => {
        if (!isActive) return
        window.dispatchEvent(new CustomEvent('on_cheer', { detail: payload }))
      })
      .on('broadcast', { event: 'board_config' }, ({ payload }) => {
        if (!isActive) return
        window.dispatchEvent(new CustomEvent('on_board_config', { detail: payload }))
      })
      .on('broadcast', { event: 'page_assignment' }, ({ payload }) => {
        if (!isActive) return
        window.dispatchEvent(new CustomEvent('on_page_assignment', { detail: payload }))
      })
      .on('broadcast', { event: 'assign_student_to_page' }, ({ payload }) => {
        if (!isActive) return
        window.dispatchEvent(new CustomEvent('on_assign_student_to_page', { detail: payload }))
      })
      .on('broadcast', { event: 'independent_mode_toggle' }, ({ payload }) => {
        if (!isActive) return
        window.dispatchEvent(new CustomEvent('on_independent_mode_toggle', { detail: payload }))
      })
      .on('broadcast', { event: 'viewport_update' }, ({ payload }) => {
        if (!isActive) return
        window.dispatchEvent(new CustomEvent('on_viewport_update', { detail: payload }))
      })
      .on('broadcast', { event: 'laser_draw' }, ({ payload }) => {
        if (!isActive) return
        window.dispatchEvent(new CustomEvent('on_laser_draw', { detail: payload }))
      })
      .on('broadcast', { event: 'fabric_state' }, ({ payload }) => {
        if (!isActive) return
        window.dispatchEvent(new CustomEvent('on_fabric_state', { detail: payload }))
      })
      .on('broadcast', { event: 'force_mute' }, ({ payload }) => {
        if (!isActive) return
        if (payload?.targetDeviceId === deviceId || payload?.all) {
          window.dispatchEvent(new Event('force_mute_mic'))
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && isActive) {
          await ch.track(pulsePayload)
          ch.send({ type: 'broadcast', event: 'student_joined', payload: pulsePayload }).catch(() => {})
          ch.send({ type: 'broadcast', event: 'global_sync_request', payload: pulsePayload }).catch(() => {})
          setChannel(ch)
          const pulse = setInterval(() => {
            if (!isActive) { clearInterval(pulse); return }
            ch.send({ type: 'broadcast', event: 'student_presence_pulse', payload: pulsePayload }).catch(() => {})
          }, 30000)
        }
      })

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && isActive) {
          ch.send({ type: 'broadcast', event: 'global_sync_request', payload: pulsePayload }).catch(() => {})
        }
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('online', handleVisibilityChange)

      return () => { 
        isActive = false; 
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('online', handleVisibilityChange);
        ch.unsubscribe(); 
        setChannel(null); 
      }
  }, [roomId, studentName, deviceId])

  const [isAgoraEnabled, setIsAgoraEnabled] = useState(false)
  
  const { startAudio, stopMedia, toggleMic, isMicOn, isCameraOn, toggleCamera, peers, pingMs } = useHybridRTC(channel, deviceId, studentName || '', false, isAgoraEnabled)

  const handleHandRaise = () => {
    if (!channel) return
    const next = !handRaised
    setHandRaised(next)
    channel.send({ type: 'broadcast', event: 'hand_raise', payload: { deviceId, action: next ? 'raise' : 'lower' } }).catch(() => {})
  }

  if (!mounted) return null
  if (!studentName) return <NameEntryScreen onJoin={setStudentName} roomId={roomId} />

  return (
    <div style={{ width: '100vw', height: 'var(--app-height, 100vh)', display: 'flex', flexDirection: 'column', background: '#0f172a', fontFamily: 'Tajawal, sans-serif', direction: 'rtl', overflow: 'hidden', position: 'relative' }}>

      <div style={{
        background: 'linear-gradient(90deg, #1e293b, #0f172a)',
        borderBottom: '1px solid rgba(16,185,129,0.2)',
        padding: '5px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <span style={{ color: '#10b981', fontSize: '0.82rem', fontWeight: 700 }}>🔴 بث مباشر</span>
        <span style={{ color: '#475569', fontSize: '0.78rem' }}>مرحباً {studentName} 👋</span>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, position: 'relative' }}>
          <div style={{ flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
              {channel && (
                <LiveWhiteboardStudent
                  channel={channel}
                  hasControl={false}
                  studentName={studentName}
                  studentId={deviceId}
                />
              )}
            </div>
          </div>
        </div>

        {isSidebarOpen && channel && (
          <LiveSidebar
            isTeacher={false}
            studentName={studentName}
            teacherName={studentName}
            onClose={() => setIsSidebarOpen(false)}
            activeTab={sidebarTab}
            setActiveTab={setSidebarTab}
            isMobile={isMobile}
            isSubscribed={false}
            focusMode={focusMode}
            channel={channel}
            roomId={roomId}
            teacherId={deviceId}
            studentId={deviceId}
          />
        )}
      </div>

      <LiveBottomBar
        isTeacher={false}
        isMicOn={isMicOn}
        onToggleMic={toggleMic}
        isCameraOn={isCameraOn}
        onToggleCamera={toggleCamera}
        isHandRaised={handRaised}
        onToggleHand={handleHandRaise}
        activeTab={sidebarTab}
        onToggleTab={(tab) => {
          if (isSidebarOpen && sidebarTab === tab) {
            setIsSidebarOpen(false)
          } else {
            setSidebarTab(tab)
            setIsSidebarOpen(true)
          }
        }}
        isMobile={isMobile}
        pingMs={pingMs}
        channel={channel}
        roomId={roomId}
        teacherId={deviceId}
        onLeave={() => window.location.href = '/'}
      />

      {peers.filter(p => p.stream).map(peer => (
        <RemoteAudio key={'audio-' + peer.id} stream={peer.stream} />
      ))}

      {channel && <ReactionOverlay channel={channel} isTeacher={false} />}
    </div>
  )
}
export default function TrialStudentRoom() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrialStudentRoomContent />
    </Suspense>
  )
}