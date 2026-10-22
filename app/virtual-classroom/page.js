'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../utils/supabase'
import LiveTrainGameStudent from '../live/LiveTrainGameStudent'
import LiveMarioStudent from '../live/LiveMarioStudent'
import LiveTankBattleStudent from '../live/LiveTankBattleStudent'
import LiveSubwayStudent from '../live/LiveSubwayStudent'
import LiveRacingStudent from '../live/LiveRacingStudent'
import LiveWheelStudent from '../live/LiveWheelStudent'
import LiveLeaderboardStudent from '../live/LiveLeaderboardStudent'
import LiveCertificatesStudent from '../live/LiveCertificatesStudent'
import LiveCameraBubble from '../live/LiveCameraBubble'
import ReactionOverlay from '../live/ReactionOverlay'
import ARPointerOverlay from '../live/ARPointerOverlay'
import LiveCaptionOverlay from '../live/LiveCaptionOverlay'
import useLiveCaptions from '../live/useLiveCaptions'
import InteractiveGrammarStage from './InteractiveGrammarStage'
import LiveSidebar from './LiveSidebar'
import LiveBottomBar from './LiveBottomBar'
import LiveLobbyModal from './LiveLobbyModal'
import dynamic from 'next/dynamic'
import QuranOrderGameOverlay from '../teacher-assistant/whiteboard/QuranOrderGameOverlay'
import MemoryGameOverlay from '../teacher-assistant/whiteboard/MemoryGameOverlay'
import HangmanOverlay from '../teacher-assistant/whiteboard/HangmanOverlay'
import QuizShowOverlay from '../teacher-assistant/whiteboard/QuizShowOverlay'
import WordSearchOverlay from '../teacher-assistant/whiteboard/WordSearchOverlay'
import WordBuilderOverlay from '../teacher-assistant/whiteboard/WordBuilderOverlay'
import { LessonContent } from '../lesson/page'
import { PathwayLessonContent } from '../kids-corner/pathway/lesson/page'
import { StudentScreenShare } from './P2PScreenShare'
import { useHybridRTC } from '../live/useHybridRTC'
import { RemoteAudio } from '../live/RemoteAudio';
import { 
  Mic, MicOff, Maximize2, Minimize2, Radio, 
  Sun, ShieldCheck, Sparkles, Users, 
  Hand, Gamepad2, Volume2, Video, VideoOff, RefreshCw, X, CheckCircle2, ShieldAlert
} from 'lucide-react'
import AudioOutputSelector, { applyAudioSink, getActiveAudioSinkId } from '../live/AudioOutputSelector'
import { unlockGlobalAudio } from '../../utils/tts'


const LiveHtmlSandboxStudent = dynamic(() => import('../live/components/LiveHtmlSandboxStudent'), { ssr: false })

const LiveWhiteboardStudent = dynamic(() => import('../live/LiveWhiteboardStudent'), { 
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#10b981', fontSize: '1.1rem', fontWeight: 800 }}>
      جاري تحميل السبورة الذكية... 🎨
    </div>
  )
})
const LiveArabicBoardStudent = dynamic(() => import('../live/LiveArabicBoardStudent'), { ssr: false })
const LiveEnglishBoardStudent = dynamic(() => import('../live/LiveEnglishBoardStudent'), { ssr: false })
const LiveMathBoardStudent = dynamic(() => import('../live/LiveMathBoardStudent'), { ssr: false })
const LiveFlashcardsStudent = dynamic(() => import('../live/LiveFlashcardsStudent'), { ssr: false })

function StudentVirtualClassroomContent() {
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const roomId = searchParams ? searchParams.get('room') : null
  const isTrialMode = searchParams ? searchParams.get('trial') === 'true' : false
  const [deviceId, setDeviceId] = useState('')
  const [studentName, setStudentName] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [hasControl, setHasControl] = useState(false)
  const [activeTool, setActiveTool] = useState('whiteboard')
  const [channel, setChannel] = useState(null)
  const [devices, setDevices] = useState([])
  const [handRaises, setHandRaises] = useState([])
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sidebarTab, setSidebarTab] = useState('chat')
  const [focusMode, setFocusMode] = useState(false)
  const [activeReadyLesson, setActiveReadyLesson] = useState(null)
  const [activeReadySubject, setActiveReadySubject] = useState(null)
  const [isPageFullscreen, setIsPageFullscreen] = useState(false)
  const [isWakeLockActive, setIsWakeLockActive] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  const [toast, setToast] = useState(null) // { text, type: 'success'|'warning'|'info' }
  const [isCaptionOverlayVisible, setIsCaptionOverlayVisible] = useState(false)
  const [isMyCaptionEnabled, setIsMyCaptionEnabled] = useState(false)
  const [captionLanguage, setCaptionLanguage] = useState('ar-SA')
  const [captionPayload, setCaptionPayload] = useState(null)
  const [sandboxCode, setSandboxCode] = useState(null)
  const [roomFull, setRoomFull] = useState(false)
  const wakeLockRef = useRef(null)
  const toastTimerRef = useRef(null)
  const wasDisconnected = useRef(false)

  const showToast = (text, type = 'info') => {
    setToast({ text, type })
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 4000)
  }

  // Responsive detection: mobile / tablet / landscape / standalone
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
    }
    const handleResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setIsMobile(w <= 768 || (h <= 500 && w <= 1024))
      setIsLandscape(w > h)
      setAppHeight()
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  // AudioContext unlock on mobile touch/click
  useEffect(() => {
    const unlockAudio = () => {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        if (!window._sharedAudioCtx) {
          window._sharedAudioCtx = new AudioCtx()
        }
        if (window._sharedAudioCtx.state === 'suspended') {
          window._sharedAudioCtx.resume().catch(() => {})
        }
      }
      
      // Unlock Global Audio element for async network TTS
      unlockGlobalAudio()

      // Unlock HTML5 Audio
      const silentAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA")
      silentAudio.play().catch(() => {})
      
      // Unlock SpeechSynthesis (Crucial for ResponsiveVoice on iOS Safari)
      if ('speechSynthesis' in window) {
        const silentUtt = new SpeechSynthesisUtterance(' ')
        silentUtt.volume = 0
        window.speechSynthesis.speak(silentUtt)
      }
      
      // Warm up ResponsiveVoice with a real (silent) speak call
      // This unlocks its internal audio context so it can fire later
      // from async WebSocket callbacks without user gesture
      const warmUpRV = () => {
        if (window.responsiveVoice && typeof window.responsiveVoice.speak === 'function') {
          window.responsiveVoice.speak('تفعيل', 'Arabic Male', { volume: 0, rate: 1 })
        } else {
          setTimeout(warmUpRV, 500)
        }
      }
      warmUpRV()
    }
    window.addEventListener('touchstart', unlockAudio, { once: true })
    window.addEventListener('click', unlockAudio, { once: true })
    return () => {
      window.removeEventListener('touchstart', unlockAudio)
      window.removeEventListener('click', unlockAudio)
    }
  }, [])

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.user_metadata?.role === 'admin') {
          setIsAdmin(true)
          setStudentName('المستر إبراهيم عمار')
        } else if (session?.user?.user_metadata?.name) {
          setStudentName(session.user.user_metadata.name)
        }
      } catch (err) {
        console.error('Error fetching session:', err)
      }
    }
    fetchSession()
    
    setMounted(true)

    // ── Standalone / PWA persistence ──────────────────────────────────────
    // iOS re-creates the page when PWA is launched — restore previous session
    const SESSION_KEY = `vc_session_${roomId || 'noid'}`
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved) {
        const s = JSON.parse(saved)
        // Tab-specific deviceId: stored in sessionStorage per tab (not shared between tabs)
        // Each tab gets its own unique ID on first load
        if (s.deviceId && s.tabId === window.__vcTabId) {
          setDeviceId(s.deviceId)
          if (s.studentName) setStudentName(s.studentName)
          if (s.hasJoined)   setHasJoined(true)
        } else {
          // New tab or different tab — generate fresh ID
          if (!window.__vcTabId) {
            window.__vcTabId = Math.random().toString(36).substring(2, 9)
          }
          setDeviceId(`device-${window.__vcTabId}`)
        }
      } else {
        if (!window.__vcTabId) {
          window.__vcTabId = Math.random().toString(36).substring(2, 9)
        }
        setDeviceId(`device-${window.__vcTabId}`)
      }
    } catch (_) {
      if (!window.__vcTabId) {
        window.__vcTabId = Math.random().toString(36).substring(2, 9)
      }
      setDeviceId(`device-${window.__vcTabId}`)
    }
  }, [])


  // WebRTC Setup
  const [isAgoraEnabled, setIsAgoraEnabled] = useState(false)

  const { 
    startAudio, 
    stopMedia, 
    toggleMic, 
    toggleCamera, 
    switchCamera, 
    isMicOn, 
    isCameraOn, 
    facingMode, 
    localStream, 
    peers, 
    pingMs,
    networkQuality,
    conferenceMode
  } = useHybridRTC(channel, deviceId, studentName || 'مشارك', false, isAgoraEnabled)

  // Notify student of their own network issues
  const lastPoorNetworkWarning = useRef(0)
  useEffect(() => {
    if (networkQuality === 'poor') {
      const now = Date.now()
      if (now - lastPoorNetworkWarning.current > 30000) { // Max once every 30s
        showToast('⚠️ انتباه: إشارة الإنترنت لديك ضعيفة، قد يتأخر نقل الصوت والصورة', 'warning')
        lastPoorNetworkWarning.current = now
      }
    }
  }, [networkQuality])

  // Warn if initial connection is blocked by their router/ISP
  useEffect(() => {
    if (!hasJoined) {
      const slowTimer = setTimeout(() => {
        showToast('⏳ جاري محاولة تخطي حماية الشبكة لديك للاتصال... يرجى الانتظار', 'warning')
      }, 8000)
      return () => clearTimeout(slowTimer)
    }
  }, [hasJoined])

  // Screen WakeLock — keeps screen on, re-acquired after screen unlock
  const [reconnectTrigger, setReconnectTrigger] = useState(0)
  const noSleepVideoRef = useRef(null)

  // Safe Broadcast Helper to prevent REST API fallback warning
  const broadcastSafely = (event, payload, retries = 12) => {
    if (!channel) return
    let isSocketReady = false
    if (typeof channel.canPush === 'function') {
      try { isSocketReady = channel.canPush() } catch (_) { isSocketReady = false }
    } else {
      isSocketReady = channel.state === 'joined' && !!channel.socket && typeof channel.socket.isConnected === 'function' && channel.socket.isConnected()
    }

    if (isSocketReady) {
      try {
        channel.send({ type: 'broadcast', event, payload }).catch(() => {})
      } catch (e) {}
    } else if (retries > 0 && channel.state !== 'closed') {
      setTimeout(() => broadcastSafely(event, payload, retries - 1), 200)
    }
  }
  
  // Initialize Live Captions for student
  useLiveCaptions({
    channel,
    isEnabled: isMyCaptionEnabled && isMicOn,
    lang: captionLanguage,
    senderName: studentName,
    onCaption: (payload) => setCaptionPayload(payload)
  })

  // Periodic heartbeat broadcast to keep mobile WebSockets and DataChannels alive
  useEffect(() => {
    if (!channel || !hasJoined) return
    const heartbeat = setInterval(() => {
      broadcastSafely('student_presence_pulse', {
        deviceId,
        id: deviceId,
        name: studentName || 'طالب',
        isTeacher: false,
        ping: Date.now()
      })
    }, 15000)
    return () => clearInterval(heartbeat)
  }, [channel, hasJoined])

  // Screen WakeLock & Background Keep-Alive for Student
  useEffect(() => {
    let lockRef = null

    const acquireKeepAlive = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          if (lockRef) { try { await lockRef.release() } catch (_) {} }
          lockRef = await navigator.wakeLock.request('screen')
          wakeLockRef.current = lockRef
          setIsWakeLockActive(true)
          lockRef.addEventListener('release', () => setIsWakeLockActive(false))
        }
      } catch (err) {}

      // Play silent background loop to prevent mobile browser freezing
      try {
        if (noSleepVideoRef.current) {
          noSleepVideoRef.current.play().catch(() => {})
        }
      } catch (e) {}
    }

    if (hasJoined) acquireKeepAlive()

    const handleVisibility = () => {
      const isFocused = document.visibilityState === 'visible' && document.hasFocus();
      broadcastSafely('student_focus', { studentId: deviceId, isFocused });
      
      if (document.visibilityState === 'visible') {
        acquireKeepAlive()
        if (channel && channel.state !== 'joined') {
          setReconnectTrigger(p => p + 1)
        } else if (channel) {
          broadcastSafely('global_sync_request', {})
        }
      }
    }

    const handleWindowFocus = () => {
      broadcastSafely('student_focus', { studentId: deviceId, isFocused: true });
      acquireKeepAlive()
      if (channel && channel.state !== 'joined') {
        setReconnectTrigger(p => p + 1)
      }
    }

    const handleWindowBlur = () => {
      broadcastSafely('student_focus', { studentId: deviceId, isFocused: false });
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleWindowFocus)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('pageshow', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleWindowFocus)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('pageshow', handleVisibility)
      if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {})
    }
  }, [hasJoined, channel])

  // Supabase Channel Subscription with auto-reconnection
  useEffect(() => {
    if (!roomId || !hasJoined) return

    let isSubscribed = true
    let reconnectTimeout = null

    const roomChannel = supabase.channel(`virtual-room-${roomId}`, {
      config: {
        presence: { key: deviceId },
        broadcast: { ack: false }
      }
    })

    const originalOn = roomChannel.on.bind(roomChannel)
    roomChannel.on = (type, filter, callback) => {
      originalOn(type, filter, callback)
      return new Proxy(roomChannel, {
        get(target, prop) {
          if (prop === 'unsubscribe') {
            return () => {
              if (roomChannel.bindings && roomChannel.bindings[type]) {
                roomChannel.bindings[type] = roomChannel.bindings[type].filter(b => 
                  !(b.filter?.event === filter?.event && b.callback === callback)
                )
              }
            }
          }
          const value = target[prop]
          return typeof value === 'function' ? value.bind(target) : value
        }
      })
    }

    roomChannel
      .on('presence', { event: 'sync' }, () => {
        if (!isSubscribed) return
        const state = roomChannel.presenceState()
        const userList = []
        Object.keys(state).forEach(key => {
          state[key].forEach(p => {
            if (p.deviceId && p.deviceId !== deviceId) {
              userList.push(p)
            }
          })
        })
        setDevices(userList)
      })
      .on('broadcast', { event: 'stage_tool_change' }, ({ payload }) => {
        if (!isSubscribed) return
        if (payload && payload.tool) {
          setActiveTool(payload.tool)
        }
      })
      .on('broadcast', { event: 'grant_control' }, ({ payload }) => {
        if (!isSubscribed) return
        if (payload) {
          const deviceIds = payload.deviceIds || (payload.deviceId ? [payload.deviceId] : [])
          const isMe = deviceIds.includes(deviceId)
          setHasControl(isMe)
          if (isMe) {
            showToast('🎉 المعلم منحك التحكم في الشاشة والسبورة! يمكنك الرسم والتفاعل الآن ✏️', 'success')
          }
        }
      })
      .on('broadcast', { event: 'focus_mode_toggle' }, ({ payload }) => {
        if (!isSubscribed) return
        if (payload) {
          setFocusMode(!!payload.focusMode)
        }
      })
      .on('broadcast', { event: 'hand_raise' }, ({ payload }) => {
        if (!isSubscribed || !payload || !payload.deviceId) return
        setHandRaises(prev => {
          if (payload.isRaised) {
            return prev.includes(payload.deviceId) ? prev : [...prev, payload.deviceId]
          } else {
            return prev.filter(id => id !== payload.deviceId)
          }
        })
      })
      .on('broadcast', { event: 'open_ready_lesson' }, ({ payload }) => {
        if (!isSubscribed) return
        if (payload && payload.lessonId) {
          setActiveReadyLesson(payload.lessonId)
          setActiveReadySubject(payload.subject || 'arabic')
        } else {
          setActiveReadyLesson(null)
          setActiveReadySubject(null)
        }
      })
      .on('broadcast', { event: 'stage_tool_change' }, ({ payload }) => {
        if (!isSubscribed) return
        if (payload && payload.tool) {
          setActiveTool(payload.tool)
          // Hide lesson iframe if tool changes away from pathway
          if (payload.tool !== 'ready-pathway') {
            setActiveReadyLesson(null)
            setActiveReadySubject(null)
          }
        }
      })
      .on('broadcast', { event: 'sandbox_sync_event' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_sandbox_sync_event', { detail: payload }))
      })
      // ── Tool Event Forwarders (all tool components listen via CustomEvent) ──
      .on('broadcast', { event: 'arabic_board_action' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_arabic_board_action', { detail: payload }))
      })
      .on('broadcast', { event: 'english_board_action' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_english_board_action', { detail: payload }))
      })
      .on('broadcast', { event: 'math_board_state' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_math_board_state', { detail: payload }))
      })
      .on('broadcast', { event: 'math_board_action' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_math_board_action', { detail: payload }))
      })
      .on('broadcast', { event: 'flashcard_state' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_flashcard_state', { detail: payload }))
      })
      .on('broadcast', { event: 'leaderboard_state' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_leaderboard_state', { detail: payload }))
      })
      .on('broadcast', { event: 'wheel_config' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_wheel_config', { detail: payload }))
      })
      .on('broadcast', { event: 'wheel_spin' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_wheel_spin', { detail: payload }))
      })
      .on('broadcast', { event: 'game_state_update' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_game_state_update', { detail: payload }))
      })
      .on('broadcast', { event: 'mario_state_sync' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_mario_state_sync', { detail: payload }))
      })
      .on('broadcast', { event: 'tank_state_sync' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_tank_state_sync', { detail: payload }))
      })
      .on('broadcast', { event: 'subway_state_sync' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_subway_state_sync', { detail: payload }))
      })
      .on('broadcast', { event: 'math_lab_action' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_math_lab_action', { detail: payload }))
      })
      .on('broadcast', { event: 'start_poll' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_start_poll', { detail: payload }))
      })
      .on('broadcast', { event: 'end_poll' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_end_poll', { detail: payload }))
      })
      .on('broadcast', { event: 'certificate_preview_sync' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_certificate_preview_sync', { detail: payload }))
      })
      .on('broadcast', { event: 'certificate_awarded' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_certificate_awarded', { detail: payload }))
      })
      // ── Whiteboard & Reaction Forwarders ──
      .on('broadcast', { event: 'react_state' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_react_state', { detail: payload }))
      })
      .on('broadcast', { event: 'cheer' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_cheer', { detail: payload }))
      })
      .on('broadcast', { event: 'board_config' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_board_config', { detail: payload }))
      })
      .on('broadcast', { event: 'page_assignment' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_page_assignment', { detail: payload }))
      })
      .on('broadcast', { event: 'assign_student_to_page' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_assign_student_to_page', { detail: payload }))
      })
      .on('broadcast', { event: 'independent_mode_toggle' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_independent_mode_toggle', { detail: payload }))
      })
      .on('broadcast', { event: 'viewport_update' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_viewport_update', { detail: payload }))
      })
      .on('broadcast', { event: 'laser_draw' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_laser_draw', { detail: payload }))
      })
      .on('broadcast', { event: 'fabric_state' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_fabric_state', { detail: payload }))
      })
      .on('broadcast', { event: 'student_reaction' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_student_reaction', { detail: payload }))
      })
      .on('broadcast', { event: 'sandbox_code_update' }, ({ payload }) => {
        if (!isSubscribed) return
        if (payload && payload.code !== undefined) {
          setSandboxCode(payload.code)
        }
        window.dispatchEvent(new CustomEvent('on_sandbox_code_update', { detail: payload }))
      })
      .on('broadcast', { event: 'live_caption' }, ({ payload }) => {
        if (!isSubscribed || !payload) return
        setCaptionPayload(payload)
      })
      .on('broadcast', { event: 'sync_captions_state' }, ({ payload }) => {
        if (!isSubscribed || !payload) return
        if (payload.lang) setCaptionLanguage(payload.lang)
        if (typeof payload.enabled === 'boolean') setIsMyCaptionEnabled(payload.enabled)
      })
      .on('broadcast', { event: 'sync_agora_state' }, ({ payload }) => {
        if (!isSubscribed || !payload) return
        if (typeof payload.enabled === 'boolean') setIsAgoraEnabled(payload.enabled)
      })
      // Notification-only listeners (audio is handled inside useWebRTC)
      .on('broadcast', { event: 'room_full' }, ({ payload }) => {
        if (payload && payload.targetDeviceId === deviceId) {
          setRoomFull(true)
        }
      })
      .on('broadcast', { event: 'force_mute' }, ({ payload }) => {
        if (!isSubscribed) return
        if (payload && payload.target === deviceId) {
          showToast('تم كتم صوتك من قِبَل المعلم 🔇', 'warning')
        }
      })
      .on('broadcast', { event: 'teacher_force_mute_all' }, () => {
        if (!isSubscribed) return
        showToast('كتم المعلم صوت جميع الطلاب 🔇', 'warning')
      })
      .on('broadcast', { event: 'grant_speak' }, ({ payload }) => {
        if (!isSubscribed) return
        if (payload && payload.target === deviceId) {
          showToast('المعلم أذن لك بالتحدث! اضغط على زر المايك 🎙️', 'success')
        }
      })
      .on('broadcast', { event: 'teacher_online' }, ({ payload }) => {
        // المعلم انضم أو أعاد الاتصال — أعلنه بوجودنا فوراً
        if (!isSubscribed) return
        const reAnnounce = (retries = 8) => {
          if (!isSubscribed) return
          const isReady = typeof roomChannel.canPush === 'function'
            ? roomChannel.canPush()
            : (roomChannel.state === 'joined' && (!roomChannel.socket || typeof roomChannel.socket.isConnected !== 'function' || roomChannel.socket.isConnected()))
          if (isReady) {
            roomChannel.send({
              type: 'broadcast',
              event: 'student_joined',
              payload: { deviceId, id: deviceId, name: studentName || 'طالب', isTeacher: false, onlineAt: new Date().toISOString() }
            }).catch(() => {})
          } else if (retries > 0 && roomChannel.state !== 'closed') {
            setTimeout(() => reAnnounce(retries - 1), 300)
          }
        }
        reAnnounce()
      })
      .subscribe(async (status) => {
        if (!isSubscribed) return
        if (status === 'SUBSCRIBED') {
          // Show reconnected toast only if it was previously disconnected
          if (wasDisconnected.current) {
            wasDisconnected.current = false
            showToast('✅ تم استعادة الاتصال بالفصل بنجاح!', 'success')
          }
          const studentPayload = {
            deviceId,
            id: deviceId,
            name: studentName || 'طالب',
            isTeacher: false,
            onlineAt: new Date().toISOString()
          }
          await roomChannel.track(studentPayload)

          // Announce to teacher with retry — مش one-shot عشان مينفعش يضيع
          const announceJoin = (retries = 15) => {
            if (!isSubscribed) return
            const isReady = typeof roomChannel.canPush === 'function'
              ? roomChannel.canPush()
              : (roomChannel.state === 'joined' && (!roomChannel.socket || typeof roomChannel.socket.isConnected !== 'function' || roomChannel.socket.isConnected()))
            if (isReady) {
              roomChannel.send({ type: 'broadcast', event: 'student_joined', payload: studentPayload }).catch(() => {})
              roomChannel.send({ type: 'broadcast', event: 'global_sync_request', payload: studentPayload }).catch(() => {})
            } else if (retries > 0 && roomChannel.state !== 'closed') {
              setTimeout(() => announceJoin(retries - 1), 300)
            }
          }
          announceJoin()
          // Extra safety re-announce after 3s (covers slow teacher-side subscription)
          setTimeout(() => {
            if (!isSubscribed) return
            const isReady = typeof roomChannel.canPush === 'function'
              ? roomChannel.canPush()
              : (roomChannel.state === 'joined' && (!roomChannel.socket || typeof roomChannel.socket.isConnected !== 'function' || roomChannel.socket.isConnected()))
            if (isReady) {
              roomChannel.send({ type: 'broadcast', event: 'student_joined', payload: studentPayload }).catch(() => {})
              roomChannel.send({ type: 'broadcast', event: 'global_sync_request', payload: studentPayload }).catch(() => {})
            }
          }, 3000)
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[VirtualClassroom] Channel status: ${status}, auto-reconnecting...`)
          wasDisconnected.current = true
          showToast('⚠️ انقطع الاتصال بالفصل... جاري إعادة الاتصال ️', 'warning')
          if (isSubscribed) {
            reconnectTimeout = setTimeout(() => {
              setReconnectTrigger(prev => prev + 1)
            }, 1500)
          }
        }
      })

    // Heartbeat pulse every 5s — لو الإعلان الأول ضاع، المعلم يشوف الطالب بعد 5 ثواني بحد أقصى
    let heartbeatCount = 0
    const pulseInterval = setInterval(() => {
      if (!isSubscribed || !roomChannel) return
      const isReady = typeof roomChannel.canPush === 'function' 
        ? roomChannel.canPush() 
        : (roomChannel.state === 'joined' && (!roomChannel.socket || typeof roomChannel.socket.isConnected !== 'function' || roomChannel.socket.isConnected()))
      if (isReady) {
        heartbeatCount++
        const pulsePayload = {
          deviceId,
          id: deviceId,
          name: studentName || 'طالب',
          isTeacher: false
        }
        roomChannel.send({
          type: 'broadcast',
          event: 'student_presence_pulse',
          payload: pulsePayload
        }).catch(() => {})
        // أول 3 heartbeats بيبعت student_joined كمان (تأكيد إضافي)
        if (heartbeatCount <= 3) {
          roomChannel.send({
            type: 'broadcast',
            event: 'student_joined',
            payload: { ...pulsePayload, onlineAt: new Date().toISOString() }
          }).catch(() => {})
        }
      }
    }, 5000)

    const handleBeforeUnload = () => {
      try {
        if (roomChannel && roomChannel.state === 'joined') {
          roomChannel.send({
            type: 'broadcast',
            event: 'student_left',
            payload: { deviceId }
          }).catch(() => {})
        }
      } catch (_) {}
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    setChannel(roomChannel)

    return () => {
      isSubscribed = false
      if (pulseInterval) clearInterval(pulseInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      roomChannel.unsubscribe()
    }
  }, [roomId, hasJoined, deviceId, studentName, reconnectTrigger])

  // Cleanup media only when leaving the page
  useEffect(() => {
    return () => {
      stopMedia()
    }
  }, [])

  // Handle Hand Raise Toggle
  const handleToggleHand = () => {
    const nextState = !isHandRaised
    setIsHandRaised(nextState)
    broadcastSafely('hand_raise', { deviceId, name: studentName, isRaised: nextState })
  }

  const togglePageFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsPageFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsPageFullscreen(false)
    }
  }

  if (!mounted) return null

  // 1. Show Pre-Join Lobby first
  if (!hasJoined) {
    return (
      <LiveLobbyModal
        roomId={roomId}
        defaultName={studentName}
        isAdmin={isAdmin}
        onJoin={(finalName) => {
          setStudentName(finalName)
          setHasJoined(true)
          // ── Persist for standalone PWA reload ──
          try {
            const SESSION_KEY = `vc_session_${roomId || 'noid'}`
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({
              deviceId,
              studentName: finalName,
              hasJoined: true,
              tabId: window.__vcTabId || ''
            }))
          } catch (_) {}
        }}
      />
    )
  }
  // Room full screen
  if (roomFull) {
    return (
      <div dir="rtl" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100dvh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        fontFamily: 'Tajawal, sans-serif', color: 'white', textAlign: 'center', padding: '20px', gap: '20px'
      }}>
        <div style={{ fontSize: '80px' }}>🚫</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: '#f87171' }}>الغرفة ممتلئة</h1>
        <p style={{ fontSize: '16px', color: '#94a3b8', maxWidth: '380px', lineHeight: 1.7, margin: 0 }}>
          وصلت الغرفة للحد الأقصى في الخطة المجانية (3 طلاب).
          <br />برجاء التواصل مع معلمك.
        </p>
        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', padding: '2px', borderRadius: '14px' }}>
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px 30px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#94a3b8' }}>هل أنت معلم وتريد غرفة بلا حدود؟</p>
            <a href="/pricing" style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white',
              padding: '10px 28px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '15px'
            }}>ترقية الاشتراك ✨</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      minHeight: 'var(--app-height, 100vh)',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: "'Tajawal', 'Cairo', sans-serif",
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      {/* Hide Global Floating Elements when inside Live Room */}
      <style>{`
        .whatsapp-float, .pwa-floating-banner { display: none !important; }
      `}</style>
      <style>{`@keyframes toastSlideDown { 0% { transform: translate(-50%, -100%); opacity: 0; } 60% { transform: translate(-50%, 15px); opacity: 1; } 100% { transform: translate(-50%, 0); opacity: 1; } }`}</style>

      {/* Global Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'success' ? '#10b981' : toast.type === 'warning' ? '#f59e0b' : '#3b82f6',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '50px',
          fontWeight: 800,
          fontSize: '0.95rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 999999,
          animation: 'toastSlideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : toast.type === 'warning' ? <ShieldAlert size={20} /> : <Sparkles size={20} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* MIDDLE AREA (Main Stage + Right Panel) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        
        {/* MAIN STAGE (Whiteboards & Games) */}
        <main style={{ 
          flex: 1, 
          display: 'flex', 
          position: 'relative', 
          overflow: 'hidden', 
          padding: isMobile ? '4px' : '10px',
          backgroundColor: '#0d1117'
        }}>
          <div style={{ 
            flex: 1, 
            backgroundColor: '#000', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            position: 'relative',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            
            {/* Stage: Whiteboard */}
            <div style={{ display: activeTool === 'whiteboard' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <LiveWhiteboardStudent channel={channel} hasControl={hasControl} />
            </div>

            {/* Stage: HTML Sandbox */}
            <div style={{ display: activeTool === 'html-sandbox' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveHtmlSandboxStudent channel={channel} currentUserName={studentName} hasControl={hasControl} initialCode={sandboxCode} />
              </div>
            </div>

            {/* Stage: Arabic Board */}
            <div style={{ display: activeTool === 'arabic-board' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveArabicBoardStudent channel={channel} hasControl={hasControl} />
              </div>
            </div>

            {/* Stage: English Board */}
            <div style={{ display: activeTool === 'english-board' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveEnglishBoardStudent channel={channel} hasControl={hasControl} />
              </div>
            </div>

            {/* Stage: Math Board */}
            <div style={{ display: activeTool === 'math-board' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveMathBoardStudent channel={channel} hasControl={hasControl} />
              </div>
            </div>

            {/* Stage: Flashcards */}
            <div style={{ display: activeTool === 'flashcards' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveFlashcardsStudent channel={channel} hasControl={hasControl} />
              </div>
            </div>

            {/* Stage: Grammar Stage */}
            <div style={{ display: activeTool === 'grammar-stage' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <InteractiveGrammarStage 
                  channel={channel} 
                  hasControl={hasControl} 
                  isTeacher={false} 
                  studentId={deviceId}
                  studentName={studentName}
                />
              </div>
            </div>

            {/* Stage: Wheel */}
            <div style={{ display: activeTool === 'wheel' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveWheelStudent channel={channel} />
              </div>
            </div>

            {/* Stage: Subway Game */}
            <div style={{ display: activeTool === 'subway' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveSubwayStudent channel={channel} hasControl={hasControl} />
              </div>
            </div>

            {/* Stage: Racing Game */}
            <div style={{ display: activeTool === 'racing' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveRacingStudent channel={channel} hasControl={hasControl} />
              </div>
            </div>

            {/* Stage: Mario Game */}
            <div style={{ display: activeTool === 'mario' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveMarioStudent channel={channel} hasControl={hasControl} />
              </div>
            </div>

            {/* Stage: Tank Battle Game */}
            <div style={{ display: (activeTool === 'tank' || activeTool === 'tank-battle') ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveTankBattleStudent channel={channel} deviceId={deviceId} hasControl={hasControl} />
              </div>
            </div>

            {/* Stage: Quran Game */}
            <div style={{ display: activeTool === 'quran' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                <QuranOrderGameOverlay isActive={activeTool === 'quran'} isStudent={true} channel={channel} hasControl={hasControl} onClose={() => {}} />
              </div>
            </div>

            {/* Stage: Memory Game */}
            <div style={{ display: activeTool === 'memory' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                <MemoryGameOverlay isActive={activeTool === 'memory'} isStudent={true} channel={channel} onClose={() => {}} />
              </div>
            </div>

            {/* Stage: Hangman */}
            <div style={{ display: activeTool === 'hangman' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                <HangmanOverlay isActive={activeTool === 'hangman'} isStudent={true} channel={channel} onClose={() => {}} />
              </div>
            </div>

            {/* Stage: Quiz Show */}
            <div style={{ display: activeTool === 'quizshow' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                <QuizShowOverlay isActive={activeTool === 'quizshow'} isStudent={true} channel={channel} onClose={() => {}} />
              </div>
            </div>

            {/* Stage: Word Search */}
            <div style={{ display: activeTool === 'wordsearch' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                <WordSearchOverlay isActive={activeTool === 'wordsearch'} isStudent={true} channel={channel} onClose={() => {}} />
              </div>
            </div>

            {/* Stage: Word Builder */}
            <div style={{ display: activeTool === 'wordbuilder' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                <WordBuilderOverlay isActive={activeTool === 'wordbuilder'} isStudent={true} channel={channel} onClose={() => {}} />
              </div>
            </div>

            {/* Stage: Train Game */}
            <div style={{ display: activeTool === 'train' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveTrainGameStudent channel={channel} hasControl={hasControl} deviceId={deviceId} />
              </div>
            </div>

            {/* Stage: Ready Lesson */}
            <div style={{ display: activeTool === 'ready-lesson' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0, backgroundColor: '#0f172a' }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                {(activeTool === 'ready-lesson' && activeReadyLesson) ? (
                  <LessonContent subject={activeReadySubject} lessonIdProp={activeReadyLesson} embeddedProp={true} liveChannel={channel} isTeacher={false} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                    في انتظار اختيار المعلم للدرس المجهز...
                  </div>
                )}
              </div>
            </div>

            {/* Stage: Screen Share */}
            <div style={{ display: activeTool === 'screenshare' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#000' }}>
                {activeTool === 'screenshare' && <StudentScreenShare studentId={deviceId} roomId={roomId} />}
              </div>
            </div>

            {/* Stage: Ready Pathway Lesson */}
            <div style={{ display: activeTool === 'ready-pathway' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0, backgroundColor: '#0f172a' }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                {(activeTool === 'ready-pathway' && activeReadyLesson) ? (
                  <PathwayLessonContent subjectProp={activeReadySubject} idProp={activeReadyLesson} channel={channel} isTeacher={false} hasControl={hasControl} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                    في انتظار اختيار المعلم للدرس...
                  </div>
                )}
              </div>
            </div>

            {/* Stage: Leaderboard */}
            <div style={{ display: activeTool === 'leaderboard' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveLeaderboardStudent channel={channel} />
              </div>
            </div>

            {/* Stage: Certificates */}
            <div style={{ display: activeTool === 'certificates' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveCertificatesStudent channel={channel} deviceId={deviceId} studentName={studentName} />
              </div>
            </div>

            <ReactionOverlay channel={channel} />
            <ARPointerOverlay channel={channel} />

            {/* Live Captions Overlay */}
            <LiveCaptionOverlay isVisible={isCaptionOverlayVisible} isTeacher={false} captionPayload={captionPayload} />
          </div>
        </main>

        {/* RIGHT PANEL (Cameras & Sidebar) */}
        <div style={{
          width: isSidebarOpen ? (isMobile ? '100%' : '320px') : '0',
          position: isMobile ? 'absolute' : 'relative',
          top: 0, bottom: 0, right: 0,
          backgroundColor: '#1e293b',
          borderLeft: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
          zIndex: isMobile ? 90 : 10,
          overflow: 'hidden'
        }}>
          <div style={{ width: isMobile ? '100%' : '320px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Remote Cameras Grid — desktop only inside sidebar */}
            

            {/* Sidebar Content (Chat/Participants) */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {false && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '8px' }}>
                   <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      إغلاق ✕
                   </button>
                </div>
              )}
              <LiveSidebar
                isTeacher={false}
                students={devices}
                handRaises={handRaises}
                isHandRaised={isHandRaised}
                onToggleHand={handleToggleHand}
                activeControlDeviceId={hasControl ? deviceId : null}
                focusMode={focusMode}
                channel={channel}
                currentUserId={deviceId}
                currentUserName={studentName || 'طالب'}
                activeTab={sidebarTab}
                setActiveTab={setSidebarTab}
                onClose={() => setIsSidebarOpen(false)}
              />
            </div>
          </div>
        </div>

        </div>

      {/* FLOATING CAMERAS — Mobile or when sidebar is closed on Desktop */}
      {(localStream && isCameraOn) && (
        <LiveCameraBubble
          stream={localStream}
          title="أنا"
          isLocal={true}
          facingMode={facingMode}
          onSwitchCamera={switchCamera}
          initialPosition={{ x: 350, y: 80 }}
        />
      )}
      {peers.filter(p => p.stream && (p.hasVideo || p.stream.getVideoTracks().length > 0)).map((peer, i) => (
        <LiveCameraBubble
          key={peer.id}
          stream={peer.stream}
          title={peer.name || 'مشارك'}
          isLocal={false}
          initialPosition={{ x: 350, y: 80 + (i + (localStream && isCameraOn ? 1 : 0)) * 160 }}
        />
      ))}

      {/* BOTTOM CONTROL BAR */}
      <LiveBottomBar 
        isTeacher={false}
        isMicOn={isMicOn}
        onToggleMic={toggleMic}
        isCameraOn={isCameraOn}
        onToggleCamera={toggleCamera}
        isHandRaised={isHandRaised}
        onToggleHand={handleToggleHand}
        captionLanguage={captionLanguage}
        isMyCaptionEnabled={isMyCaptionEnabled}
        onToggleMyCaption={() => setIsMyCaptionEnabled(prev => !prev)}
        isCaptionOverlayVisible={isCaptionOverlayVisible}
        onToggleCaptionOverlay={() => setIsCaptionOverlayVisible(prev => !prev)}
        onChangeCaptionLanguage={setCaptionLanguage}
        activeTab={sidebarTab}
        onToggleTab={(tab) => {
          if (isSidebarOpen && sidebarTab === tab) {
            setIsSidebarOpen(false)
          } else {
            setSidebarTab(tab)
            setIsSidebarOpen(true)
          }
        }}
        onLeave={() => window.location.href = '/'}
        channel={channel}
        currentUserName={studentName}
      />
      
      {/* Hidden Audio Players for all streams */}
      {peers.filter(p => p.stream).map(peer => (
        <RemoteAudio key={`audio-${peer.id}`} stream={peer.stream} />
      ))}
    </div>
  )
}
export default function StudentVirtualClassroom() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#ffffff', fontSize: '1.2rem', fontWeight: 800 }}>جاري تحميل الفصل الافتراضي... ⏳</div>}>
      <StudentVirtualClassroomContent />
    </Suspense>
  )
}














// Trigger deploy for Cloudflare environment variables




