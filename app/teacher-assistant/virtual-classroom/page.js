'use client'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import dummyStyles from '../whiteboard/page.module.css';

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import LiveTrainGameTeacher from '../live-components/LiveTrainGameTeacher'
import LiveMarioTeacher from '../live-components/LiveMarioTeacher'
import LiveTankBattleTeacher from '../live-components/LiveTankBattleTeacher'
import LiveSubwayTeacher from '../live-components/LiveSubwayTeacher'
import LiveRacingTeacher from '../live-components/LiveRacingTeacher'
import LiveWheelTeacher from '../live-components/LiveWheelTeacher'
import LiveFlashcardsTeacher from '../live-components/LiveFlashcardsTeacher'
import LiveLeaderboardTeacher from '../live-components/LiveLeaderboardTeacher'
import LiveCertificatesTeacher from '../live-components/LiveCertificatesTeacher'
import LiveArabicBoardTeacher from '../live-components/LiveArabicBoardTeacher'
import LiveMathBoardTeacher from '../live-components/LiveMathBoardTeacher'
import LiveReadyPathway from '../live-components/LiveReadyPathway'
import AdminLiveAIStudio from '../live-components/AdminLiveAIStudio'
import { TeacherScreenShare } from '../../virtual-classroom/P2PScreenShare'
import QuestionManagerModal from '../../components/QuestionManagerModal'
import QuranOrderGameOverlay from '../whiteboard/QuranOrderGameOverlay'
import MemoryGameOverlay from '../whiteboard/MemoryGameOverlay'
import HangmanOverlay from '../whiteboard/HangmanOverlay'
import QuizShowOverlay from '../whiteboard/QuizShowOverlay'
import WordSearchOverlay from '../whiteboard/WordSearchOverlay'
import WordBuilderOverlay from '../whiteboard/WordBuilderOverlay'
import LiveCameraBubble from '../../live/LiveCameraBubble'
import ReactionOverlay from '../../live/ReactionOverlay'
import InteractiveGrammarStage from '../../virtual-classroom/InteractiveGrammarStage'
import LiveSidebar from '../../virtual-classroom/LiveSidebar'
import LiveBottomBar from '../../virtual-classroom/LiveBottomBar'
import LiveCaptionOverlay from '../../live/LiveCaptionOverlay'
import useLiveCaptions from '../../live/useLiveCaptions'
import dynamic from 'next/dynamic'
import { useHybridRTC } from '../../live/useHybridRTC'
import { RemoteAudio } from '../../live/RemoteAudio';
import { 
  Mic, MicOff, Video, VideoOff, Users, 
  BookOpen, Award, Star, Maximize2, Minimize2, 
  RefreshCw, Sun, Wifi, ShieldAlert, PhoneOff, 
  Monitor, FileText, Gamepad2, ChevronDown, 
  Copy, Check, VolumeX, Sparkles,
  PenTool, Type, Calculator, LayoutList, Map as MapIcon, Train, Gamepad, PersonStanding, Dices, Layers, Trophy, FileBadge, HelpCircle, Edit2
} from 'lucide-react'
import AudioOutputSelector, { applyAudioSink, getActiveAudioSinkId } from '../../live/AudioOutputSelector'
import { loadQuestionsBySpecialty, getBuiltinQuestions } from '../../utils/questionHelper'
import LiveTeacherGuideModal from '../../virtual-classroom/LiveTeacherGuideModal'

// Remote Audio Component for Hearing Students

const LiveHtmlSandboxTeacher = dynamic(() => import('../live-components/LiveHtmlSandboxTeacher'), { ssr: false })

const LiveWhiteboardTeacher = dynamic(() => import('../live-components/LiveWhiteboardTeacher'), { 
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#10b981', fontSize: '1.1rem', fontWeight: 800 }}>
      جاري تحميل السبورة الذكية... 🎨
    </div>
  )
})

const LiveEnglishBoardTeacher = dynamic(() => import('../live-components/LiveEnglishBoardTeacher'), { ssr: false })
const LiveMathLabTeacher = dynamic(() => import('../live-components/LiveMathLabTeacher'), { ssr: false })
const ARGestureController = dynamic(() => import('../whiteboard/ARGestureController'), { ssr: false })

function TeacherVirtualClassroomContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isTrialMode = searchParams.get('trial') === 'true'
  const trialRoomId = searchParams.get('room')
  const TRIAL_MAX_STUDENTS = 3
  const [mounted, setMounted] = useState(false)
  const [roomId, setRoomId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [channel, setChannel] = useState(null)
  const [devices, setDevices] = useState([])
  const [activeControlDevices, setActiveControlDevices] = useState([])
  const [activeTool, setActiveTool] = useState('whiteboard') 
  const [specialty, setSpecialty] = useState(null)
  const [liveMinutes, setLiveMinutes] = useState(null) // 'arabic', 'math', 'english', 'general'
  const [loadingSpecialty, setLoadingSpecialty] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [customQuestions, setCustomQuestions] = useState(null) // questions for games
    const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [handRaises, setHandRaises] = useState([])
  const [focusMode, setFocusMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sidebarTab, setSidebarTab] = useState('chat')
  const [copiedLink, setCopiedLink] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimerRef = useRef(null)

  const showToast = (text, type = 'info') => {
    setToast({ text, type })
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 4000)
  }
  const [classTimer, setClassTimer] = useState('00:00')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isWakeLockActive, setIsWakeLockActive] = useState(false)
  const [isCaptionsEnabled, setIsCaptionsEnabled] = useState(false)
  const [captionLanguage, setCaptionLanguage] = useState('ar-SA')
  const [isCaptionOverlayVisible, setIsCaptionOverlayVisible] = useState(false)
  const [captionPayload, setCaptionPayload] = useState(null)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [isARActive, setIsARActive] = useState(false)
  
  const isCaptionsEnabledRef = useRef(isCaptionsEnabled)
  const captionLanguageRef = useRef(captionLanguage)
  
  useEffect(() => { isCaptionsEnabledRef.current = isCaptionsEnabled }, [isCaptionsEnabled])
  useEffect(() => { captionLanguageRef.current = captionLanguage }, [captionLanguage])
  
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  const [isSmallDesktop, setIsSmallDesktop] = useState(false)
  const [isPaidTeacher, setIsPaidTeacher] = useState(false)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const isPaidTeacherRef = useRef(false)
  const [teacherDisplayName, setTeacherDisplayName] = useState('معلم')
  const wakeLockRef = useRef(null)

  // Responsive detection: mobile / tablet / smallDesktop / landscape
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
    }
    const handleResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const mobile = w <= 768 || (h <= 500 && (isTouch || isMobileUA || w <= 1024));
      setIsMobile(mobile)
      setIsTablet(w >= 768 && w < 1024)
      setIsSmallDesktop(w >= 1024 && w < 1280)
      setIsLandscape(w > h)
      if (mobile) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
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

  // Auto-load questions when specialty changes
  useEffect(() => {
    if (!specialty) return
    // 1) Try saved specialty questions first
    const saved = loadQuestionsBySpecialty(specialty)
    if (saved && saved.length > 0) {
      setCustomQuestions(saved)
      return
    }
    // 2) Fall back to builtin questions for this specialty
    if (specialty !== 'general') {
      const builtins = getBuiltinQuestions(specialty)
      if (builtins && builtins.length > 0) {
        setCustomQuestions(builtins)
      }
    }
  }, [specialty])

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
    }
    window.addEventListener('touchstart', unlockAudio, { once: true })
    window.addEventListener('click', unlockAudio, { once: true })
    return () => {
      window.removeEventListener('touchstart', unlockAudio)
      window.removeEventListener('click', unlockAudio)
    }
  }, [])

  // Fetch Current User and Profile Specialty
  useEffect(() => {
    if (isTrialMode) {
      // In trial mode: skip auth entirely
      setTeacherDisplayName('معلم تجريبي')
      setLoadingSpecialty(false)
      setSpecialty('general')
      return
    }
    const fetchUserSpecialty = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setCurrentUser(user)
          // Try full profile first, fallback to just id if columns missing
          let profile = null
          const { data: p1, error: e1 } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (!e1) {
            profile = p1
          } else {
            console.warn('Profiles fetch error:', e1)
          }

          if (profile) {
            if (profile.specialty) setSpecialty(profile.specialty)
            if (typeof profile.live_minutes_balance !== 'undefined') {
              setLiveMinutes(profile.live_minutes_balance)
            }
          }
          
          const isAdmin = profile?.role === 'admin' || profile?.role === 'assistant' || user.user_metadata?.role === 'admin' || profile?.is_admin === true
            setIsAdminUser(isAdmin)
          const paid = isAdmin || profile?.is_subscribed || false
          setIsPaidTeacher(paid)
          isPaidTeacherRef.current = paid
          
          if (isAdmin) {
            setTeacherDisplayName('المستر إبراهيم عمار')
          } else if (profile?.full_name) {
            setTeacherDisplayName(`أ. ${profile.full_name}`)
          } else {
            setTeacherDisplayName('معلم')
          }
        }
      } catch (err) {
        console.error('Error fetching user specialty:', err)
      } finally {
        setLoadingSpecialty(false)
      }
    }
    fetchUserSpecialty()
  }, [isTrialMode])

  // Initialize Room & Teacher ID — PERSISTENT across refreshes
  useEffect(() => {
    setMounted(true)

    if (isTrialMode && trialRoomId) {
      // Trial mode: use the room from URL, generate temp teacher ID
      setRoomId(trialRoomId)
      const trialTeacher = `trial-teacher-${Math.random().toString(36).substring(2, 9)}`
      setTeacherId(trialTeacher)
      return
    }

    // RoomId: load from storage or create a default once
    let storedRoom = localStorage.getItem('teacher_virtual_room_id')
    if (!storedRoom) {
      storedRoom = 'class-main-1'
      localStorage.setItem('teacher_virtual_room_id', storedRoom)
    }
    setRoomId(storedRoom)

    // TeacherId: NEVER regenerate on refresh — load from storage or create once
    let storedTeacher = localStorage.getItem('teacher_virtual_teacher_id')
    if (!storedTeacher) {
      storedTeacher = `teacher-${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem('teacher_virtual_teacher_id', storedTeacher)
    }
    setTeacherId(storedTeacher)

    // Restore active tool from previous session (so accidental refreshes don't ruin the class)
    const savedTool = localStorage.getItem('teacher_virtual_active_tool')
    if (savedTool) {
      setActiveTool(savedTool)
    }

    // Restore active control device (so if a student was controlling the board, they don't lose it)
    const savedControl = localStorage.getItem('teacher_virtual_active_control')
    if (savedControl) {
      try {
        const parsed = JSON.parse(savedControl)
        if (Array.isArray(parsed)) setActiveControlDevices(parsed)
      } catch (e) {
        setActiveControlDevices([savedControl])
      }
    }
  }, [])

  // Persist active tool on change
  useEffect(() => {
    if (activeTool) {
      localStorage.setItem('teacher_virtual_active_tool', activeTool)
    }
  }, [activeTool])

  // Persist active control on change
  useEffect(() => {
    if (activeControlDevices && activeControlDevices.length > 0) {
      localStorage.setItem('teacher_virtual_active_control', JSON.stringify(activeControlDevices))
    } else {
      localStorage.removeItem('teacher_virtual_active_control')
    }
  }, [activeControlDevices])

  // Regenerate BOTH roomId and teacherId — only called when teacher explicitly clicks "تغيير الغرفة"
  const regenerateRoom = () => {
    const newRoom = `class-${Math.random().toString(36).substring(2, 7)}`
    const newTeacher = `teacher-${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem('teacher_virtual_room_id', newRoom)
    localStorage.setItem('teacher_virtual_teacher_id', newTeacher)
    // Hard reload to re-establish Supabase channel with new IDs
    window.location.reload()
  }

  // Class duration timer
  useEffect(() => {
    let seconds = 0
    const timerInterval = setInterval(() => {
      seconds++
      const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
      const secs = (seconds % 60).toString().padStart(2, '0')
      setClassTimer(`${mins}:${secs}`)
    }, 1000)
    return () => clearInterval(timerInterval)
  }, [])
  const [isAgoraEnabled, setIsAgoraEnabled] = useState(false)
  const isAgoraEnabledRef = useRef(isAgoraEnabled)
  const syncTimeoutRef = useRef(null)
  useEffect(() => { isAgoraEnabledRef.current = isAgoraEnabled }, [isAgoraEnabled])

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
    forceMuteStudent,
    grantSpeakToStudent,
    conferenceMode,
    enableConferenceMode,
    disableConferenceMode
  } = useHybridRTC(channel, teacherId, teacherDisplayName, true, isAgoraEnabled)

  const handleToggleAgora = () => {
    if (isTrialMode) {
      alert('ميزة السيرفر المدفوع غير متاحة في النسخة التجريبية 🔒')
      return
    }
    if (!isAgoraEnabled && !isAdminUser && (liveMinutes === null || liveMinutes <= 0)) {
      alert('عفواً، ليس لديك رصيد كافٍ لتشغيل السيرفر المدفوع. يرجى شحن باقتك من لوحة التحكم.')
      return
    }
    const newState = !isAgoraEnabled
    setIsAgoraEnabled(newState)
    broadcastSafely('sync_agora_state', { enabled: newState })
  }

  // === Minute Decrement Logic (only when paid server is ON) ===
  useEffect(() => {
    if (!currentUser || isTrialMode || !isAgoraEnabled || isAdminUser) return;
    const interval = setInterval(async () => {
      try {
        const { data: p } = await supabase.from('profiles').select('live_minutes_balance').eq('id', currentUser.id).single();
        if (p) {
          const participantsCount = 1 + (peers ? peers.length : 0);
          const newBal = Math.max(0, p.live_minutes_balance - participantsCount);
          await supabase.from('profiles').update({ live_minutes_balance: newBal }).eq('id', currentUser.id);
          setLiveMinutes(newBal);
          if (newBal <= 0) {
            alert('لقد نفذ رصيد دقائق السيرفر المدفوع! سيتم تحويلك تلقائياً للسيرفر المجاني.');
            setIsAgoraEnabled(false);
            broadcastSafely('sync_agora_state', { enabled: false });
          }
        }
      } catch (err) { console.error('Minute deduction error:', err); }
    }, 60000);
    return () => clearInterval(interval);
  }, [currentUser, isTrialMode, isAgoraEnabled, isAdminUser]);

  // Live Captions — continuous speech-to-text broadcast
  const { isActive: isCaptionsActive, error: captionsError } = useLiveCaptions({ 
    channel, 
    isEnabled: isCaptionsEnabled && isMicOn, 
    lang: captionLanguage, 
    senderName: teacherDisplayName,
    onCaption: (payload) => setCaptionPayload(payload)
  })

  // Broadcast caption state to students when it changes
  useEffect(() => {
    broadcastSafely('sync_captions_state', { enabled: isCaptionsEnabled, lang: captionLanguage })
  }, [isCaptionsEnabled, captionLanguage])

  // Show error if captions fail
  useEffect(() => {
    if (captionsError) {
      showToast(captionsError, 'warning')
    }
  }, [captionsError])

  const [reconnectTrigger, setReconnectTrigger] = useState(0)
  const noSleepVideoRef = useRef(null)

  // Screen WakeLock & Background Keep-Alive for Teacher
  useEffect(() => {
    let lockRef = null

    const acquireKeepAlive = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          if (lockRef) {
            try { await lockRef.release() } catch (_) {}
          }
          lockRef = await navigator.wakeLock.request('screen')
          wakeLockRef.current = lockRef
          setIsWakeLockActive(true)
          lockRef.addEventListener('release', () => {
            setIsWakeLockActive(false)
          })
        }
      } catch (err) {}

      // Play silent background loop to prevent mobile browser freezing
      try {
        if (noSleepVideoRef.current) {
          noSleepVideoRef.current.play().catch(() => {})
        }
      } catch (e) {}
    }

    acquireKeepAlive()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        acquireKeepAlive()
        if (channel && channel.state !== 'joined') {
          setReconnectTrigger(p => p + 1)
        }
      }
    }

    const handleWindowFocus = () => {
      acquireKeepAlive()
      if (channel && channel.state !== 'joined') {
        setReconnectTrigger(p => p + 1)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleWindowFocus)
    window.addEventListener('pageshow', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleWindowFocus)
      window.removeEventListener('pageshow', handleVisibility)
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
      }
    }
  }, [channel])

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

  const activeToolRef = useRef(activeTool)
  useEffect(() => { activeToolRef.current = activeTool }, [activeTool])

  const activeControlDevicesRef = useRef(activeControlDevices)
  useEffect(() => { activeControlDevicesRef.current = activeControlDevices }, [activeControlDevices])

  const focusModeRef = useRef(focusMode)
  useEffect(() => { focusModeRef.current = focusMode }, [focusMode])

  // Cleanup media only when leaving the page
  useEffect(() => {
    return () => {
      stopMedia()
    }
  }, [])

  // Supabase Channel & Realtime Management with auto-reconnection
  useEffect(() => {
    if (!roomId || !teacherId) return

    let isSubscribed = true
    let reconnectTimeout = null

    const roomChannel = supabase.channel(`virtual-room-${roomId}`, {
      config: {
        presence: { key: teacherId },
        broadcast: { ack: false }
      }
    })

    // Patch .on() so that calling .unsubscribe() on its result only removes the specific listener
    // This prevents child tools from accidentally disconnecting the entire WebSocket.
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

    setChannel(roomChannel)

    // Lobby Channel: Answer requests from students looking for the active room
    const lobbyChannel = supabase.channel('global-lobby', {
      config: { broadcast: { ack: false } }
    })
    lobbyChannel.on('broadcast', { event: 'request_room' }, () => {
      lobbyChannel.send({
        type: 'broadcast',
        event: 'current_room',
        payload: { roomId }
      })
    }).subscribe()

    const FREE_MAX_STUDENTS = 3

    const addOrUpdateStudent = (studentObj) => {
      if (!studentObj) return
      const sId = studentObj.deviceId || studentObj.id || studentObj.userId
      if (!sId || sId === teacherId) return
      setDevices(prev => {
        const isNew = !prev.find(d => (d.deviceId || d.id) === sId)
        // Free plan: max 3 students — use ref to get current value inside closure
        const isFree = !isPaidTeacherRef.current && !isTrialMode
        if (isNew && isFree && prev.length >= FREE_MAX_STUDENTS) {
          // Notify the student their join was rejected
          roomChannel.send({
            type: 'broadcast',
            event: 'room_full',
            payload: { targetDeviceId: sId, maxStudents: FREE_MAX_STUDENTS }
          }).catch(() => {})
          return prev
        }
        // Trial mode: max 3 students (no notification needed)
        if (isNew && isTrialMode && prev.length >= TRIAL_MAX_STUDENTS) return prev

        const existingIdx = prev.findIndex(d => (d.deviceId || d.id) === sId)
        const updated = {
          deviceId: sId,
          id: sId,
          name: studentObj.name || studentObj.userName || 'طالب',
          isTeacher: false,
          onlineAt: studentObj.onlineAt || new Date().toISOString()
        }
        if (existingIdx >= 0) {
          const next = [...prev]
          next[existingIdx] = { ...next[existingIdx], ...updated }
          return next
        }
        return [...prev, updated]
      })
    }

    roomChannel
      .on('presence', { event: 'sync' }, () => {
        if (!isSubscribed) return
        const state = roomChannel.presenceState()
        const userList = []
        Object.keys(state).forEach(key => {
          state[key].forEach(p => {
            const pId = p.deviceId || p.id || key
            if (pId && pId !== teacherId) {
              userList.push({
                deviceId: pId,
                id: pId,
                name: p.name || 'طالب',
                isTeacher: false,
                onlineAt: p.onlineAt || new Date().toISOString()
              })
            }
          })
        })
        setDevices(prev => {
          // Merge with any students already discovered via broadcast
          const map = new Map()
          userList.forEach(u => map.set(u.deviceId, u))
          prev.forEach(u => {
            if (!map.has(u.deviceId || u.id)) {
              map.set(u.deviceId || u.id, u)
            }
          })
          return Array.from(map.values())
        })
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        if (!isSubscribed || !Array.isArray(newPresences)) return
        newPresences.forEach(p => addOrUpdateStudent(p))
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        if (!isSubscribed || !Array.isArray(leftPresences)) return
        const leftIds = leftPresences.map(p => p.deviceId || p.id).filter(Boolean)
        setDevices(prev => prev.filter(d => !leftIds.includes(d.deviceId || d.id)))
      })
      .on('broadcast', { event: 'student_presence_pulse' }, ({ payload }) => {
        if (!isSubscribed || !payload || payload.isTeacher) return
        addOrUpdateStudent(payload)
      })
      .on('broadcast', { event: 'student_left' }, ({ payload }) => {
        if (!isSubscribed || !payload || !payload.deviceId) return
        setDevices(prev => prev.filter(d => (d.deviceId || d.id) !== payload.deviceId))
      })
      .on('broadcast', { event: 'student_joined' }, ({ payload }) => {
        if (!isSubscribed || !payload) return
        addOrUpdateStudent(payload)
      })
      .on('broadcast', { event: 'webrtc_join' }, ({ payload }) => {
        if (!isSubscribed || !payload || payload.isTeacher) return
        addOrUpdateStudent({
          deviceId: payload.userId,
          name: payload.userName || 'طالب',
          isTeacher: false
        })
      })
      .on('broadcast', { event: 'classroom_chat' }, ({ payload }) => {
        if (!isSubscribed || !payload || payload.isTeacher) return
        addOrUpdateStudent({
          deviceId: payload.senderId,
          name: payload.senderName || 'طالب',
          isTeacher: false
        })
      })
      .on('broadcast', { event: 'global_sync_request' }, ({ payload }) => {
        if (!isSubscribed || roomChannel.state !== 'joined') return
        if (payload && (payload.deviceId || payload.userId) && !payload.isTeacher) {
          addOrUpdateStudent(payload)
        }
        const safeSend = (event, payload, retries = 12) => {
          let isSocketReady = false
          if (typeof roomChannel.canPush === 'function') {
            try { isSocketReady = roomChannel.canPush() } catch (_) { isSocketReady = false }
          } else {
            isSocketReady = roomChannel.state === 'joined' && !!roomChannel.socket && typeof roomChannel.socket.isConnected === 'function' && roomChannel.socket.isConnected()
          }
          if (isSocketReady) {
            roomChannel.send({ type: 'broadcast', event, payload }).catch(() => {})
          } else if (retries > 0 && roomChannel.state !== 'closed') {
            setTimeout(() => safeSend(event, payload, retries - 1), 200)
          }
        }

        // Debounce the sync to prevent network spam if 50 students join in the same second
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
        syncTimeoutRef.current = setTimeout(() => {
          // 1. Send the active tool FIRST so the student's UI can switch and mount the component
          safeSend('stage_tool_change', { tool: activeToolRef.current })
          safeSend('sync_captions_state', { enabled: isCaptionsEnabledRef.current, lang: captionLanguageRef.current })
          safeSend('sync_agora_state', { enabled: isAgoraEnabledRef.current })
          safeSend('focus_mode_toggle', { focusMode: focusModeRef.current })
          
          if (activeControlDevicesRef.current && activeControlDevicesRef.current.length > 0) {
            safeSend('grant_control', { deviceIds: activeControlDevicesRef.current })
          }
        }, 300) // 300ms batch window
        
        // 2. Delay the deep state sync (paths, codes, game states) to give the student's React time to mount the new tool!
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('on_global_sync_request', { detail: payload }))
        }, 2000)
      })
      .on('broadcast', { event: 'sandbox_sync_event' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_sandbox_sync_event', { detail: payload }))
      })
      .on('broadcast', { event: 'sandbox_code_update' }, ({ payload }) => {
        if (!isSubscribed) return
        window.dispatchEvent(new CustomEvent('on_sandbox_code_update', { detail: payload }))
      })
      .on('broadcast', { event: 'hand_raise' }, ({ payload }) => {
        if (!isSubscribed || !payload || !payload.deviceId) return
        addOrUpdateStudent({ deviceId: payload.deviceId, name: payload.name || 'طالب' })
        setHandRaises(prev => {
          if (payload.isRaised) {
            // Play a short notification chime for new hand raises
            if (!prev.includes(payload.deviceId)) {
              try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext
                if (AudioCtx) {
                  if (!window._sharedAudioCtx) window._sharedAudioCtx = new AudioCtx()
                  const ctx = window._sharedAudioCtx
                  if (ctx.state === 'suspended') ctx.resume()
                  const osc = ctx.createOscillator()
                  const gain = ctx.createGain()
                  osc.type = 'sine'
                  osc.frequency.setValueAtTime(880, ctx.currentTime)
                  osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1)
                  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
                  gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.03)
                  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5)
                  osc.connect(gain)
                  gain.connect(ctx.destination)
                  osc.start(ctx.currentTime)
                  osc.stop(ctx.currentTime + 0.55)
                }
              } catch (_) {}
            }
            return prev.includes(payload.deviceId) ? prev : [...prev, payload.deviceId]
          } else {
            return prev.filter(id => id !== payload.deviceId)
          }
        })
      })
      .on('broadcast', { event: 'live_caption' }, ({ payload }) => {
        if (!isSubscribed || !payload) return
        setCaptionPayload(payload)
      })
      .subscribe(async (status) => {
        if (!isSubscribed) return
        if (status === 'SUBSCRIBED') {
          await roomChannel.track({
            deviceId: teacherId,
            name: teacherDisplayName,
            isTeacher: true,
            onlineAt: new Date().toISOString()
          })
          // أعلم الطلاب اللي موجودين إن المعلم اتصل — يعيدوا إعلان وجودهم
          const announceTeacher = (retries = 10) => {
            if (!isSubscribed) return
            const isReady = typeof roomChannel.canPush === 'function'
              ? roomChannel.canPush()
              : (roomChannel.state === 'joined' && (!roomChannel.socket || typeof roomChannel.socket.isConnected !== 'function' || roomChannel.socket.isConnected()))
            if (isReady) {
              roomChannel.send({ type: 'broadcast', event: 'teacher_online', payload: { teacherId } }).catch(() => {})
            } else if (retries > 0 && roomChannel.state !== 'closed') {
              setTimeout(() => announceTeacher(retries - 1), 300)
            }
          }
          announceTeacher()
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[TeacherVirtualClassroom] Channel status: ${status}, auto-reconnecting...`)
          if (isSubscribed) {
            reconnectTimeout = setTimeout(() => {
              setReconnectTrigger(prev => prev + 1)
            }, 1500)
          }
        }
      })

    setChannel(roomChannel)

    return () => {
      isSubscribed = false
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      roomChannel.unsubscribe()
      lobbyChannel.unsubscribe()
    }
  }, [roomId, teacherId, reconnectTrigger])

  // Select Stage Tool
  const handleSelectTool = (toolName) => {
    setActiveTool(toolName)
    
    broadcastSafely('stage_tool_change', { tool: toolName })
  }

  // Grant Interactive Game/Stage Control to Student
  const handleGrantControl = (studentDeviceId) => {
    let nextDevices = []
    if (activeControlDevices.includes(studentDeviceId)) {
      nextDevices = activeControlDevices.filter(id => id !== studentDeviceId)
    } else {
      nextDevices = [...activeControlDevices, studentDeviceId]
    }
    setActiveControlDevices(nextDevices)
    broadcastSafely('grant_control', { deviceIds: nextDevices })
  }

  // Toggle Focus Mode (Lock chat for students)
  const handleToggleFocus = () => {
    const nextState = !focusMode
    setFocusMode(nextState)
    broadcastSafely('focus_mode_toggle', { focusMode: nextState })
  }

  // Mute All Students
  const handleMuteAll = () => {
    // Send targeted force_mute to each known student for guaranteed delivery
    devices.forEach(d => {
      const id = d.deviceId || d.id
      if (id) broadcastSafely('force_mute', { target: id })
    })
    // Also broadcast global mute-all as fallback
    broadcastSafely('teacher_force_mute_all', {})
  }

  const copyRoomLink = () => {
    const url = isTrialMode
      ? `${window.location.origin}/virtual-classroom?trial=true&room=${roomId}`
      : `${window.location.origin}/virtual-classroom?room=${roomId}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleEditName = () => {
    const newName = window.prompt("أدخل الاسم الذي سيظهر للطلاب:", teacherDisplayName)
    if (newName && newName.trim()) {
      setTeacherDisplayName(newName.trim())
    }
  }

  const togglePageFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  // Sync fullscreen state with browser (handles Escape key exit)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  if (!mounted) return null

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
      {/* Hide Global Floating Elements in Teacher Room */}
      <style>{`
        .whatsapp-float, .pwa-floating-banner { display: none !important; }
      `}</style>
      
      {/* Background Silent Video Keep-Alive for iOS Safari / Mobile */}
      <video
        playsInline
        webkit-playsinline="true"
        muted
        loop
        autoPlay
        src="data:video/mp4;base64,AAAAHGZ0eXBtcDQyAAAAAG1wNDJpc29tYXZjMQAAADpmcmVlAAAABG1kYXQAAAAAAAAB/wAAAChtdmhkAAAAAAAAAAAAAAAAAAAD6AAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAcbWRhdAAAAAYBAwAEAAACAAAAGHRyYWsAAAA8dGtoZAAAAAEAAAABAAAAAAAAAAAAAAABAAAAAAAAA+gAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAC1bWRpYQAAACRtaGRyAAAAAAAAAAAAAAAAAAA+gAAAPoAAAAAAAEAAAAAAACFoZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAARGF0YUhBTkRsZXIAAAAAbWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADGR1cmwAAAABAAAAY3N0YmwAAABTc3RzZAAAAAAAAAABAAAAT2F2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAYABgAAAAAAABAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAABdzdHRzAAAAAAAAAAEAAAABAAA+gAAAAAAUc3Rzc0AAAAAAAAABAAAAAQAAABhzdHNjAAAAAAAAAAEAAAABAAAAAQAAAAEAAAAUc3RzenAAAAAAAAAFAAAAAQAAABRzdGNvAAAAAAAAAAEAAAA4"
        style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
      {/* 0. SPECIALTY SELECTION OVERLAY */}
      {!loadingSpecialty && !specialty && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.97)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          overflowY: 'auto',
          padding: '20px 16px', backdropFilter: 'blur(10px)'
        }}>
          <div style={{ width: '100%', maxWidth: '900px', margin: 'auto', paddingTop: '20px', paddingBottom: '20px' }}>
            <h1 style={{ color: 'white', marginBottom: '8px', fontSize: 'clamp(1.3rem, 4vw, 2rem)', textAlign: 'center' }}>مرحباً بك في استوديو البث المباشر 🎛️</h1>
            <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)', textAlign: 'center' }}>يرجى تحديد تخصصك لتجهيز أدوات الشرح المناسبة لك:</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', width: '100%' }}>
              <button onClick={async () => {
                setSpecialty('arabic')
                if (currentUser) await supabase.from('profiles').update({ specialty: 'arabic' }).eq('id', currentUser.id)
              }} style={{ background: '#059669', color: 'white', border: 'none', padding: '20px 16px', borderRadius: '16px', cursor: 'pointer', fontSize: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', transition: '0.2s', boxShadow: '0 10px 25px rgba(5,150,105,0.3)' }}>
                <span style={{ fontSize: '2.5rem' }}>🇸🇦</span>
                <strong>عربي</strong>
                <span style={{ fontSize: '0.82rem', color: '#d1fae5', textAlign: 'center' }}>سبورة الحروف والتشكيل</span>
              </button>
              <button onClick={async () => {
                setSpecialty('math')
                if (currentUser) await supabase.from('profiles').update({ specialty: 'math' }).eq('id', currentUser.id)
              }} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '20px 16px', borderRadius: '16px', cursor: 'pointer', fontSize: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', transition: '0.2s', boxShadow: '0 10px 25px rgba(59,130,246,0.3)' }}>
                <span style={{ fontSize: '2.5rem' }}>🔢</span>
                <strong>حساب</strong>
                <span style={{ fontSize: '0.82rem', color: '#dbeafe', textAlign: 'center' }}>أرقام وعمليات حسابية</span>
              </button>
              <button onClick={async () => {
                setSpecialty('english')
                if (currentUser) await supabase.from('profiles').update({ specialty: 'english' }).eq('id', currentUser.id)
              }} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '20px 16px', borderRadius: '16px', cursor: 'pointer', fontSize: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', transition: '0.2s', boxShadow: '0 10px 25px rgba(139,92,246,0.3)' }}>
                <span style={{ fontSize: '2.5rem' }}>🔠</span>
                <strong>إنجليزي</strong>
                <span style={{ fontSize: '0.82rem', color: '#ede9fe', textAlign: 'center' }}>حروف وصوتيات</span>
              </button>
              <button onClick={async () => {
                setSpecialty('general')
                if (currentUser) await supabase.from('profiles').update({ specialty: 'general' }).eq('id', currentUser.id)
              }} style={{ background: '#475569', color: 'white', border: 'none', padding: '20px 16px', borderRadius: '16px', cursor: 'pointer', fontSize: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', transition: '0.2s', boxShadow: '0 10px 25px rgba(71,85,105,0.3)' }}>
                <span style={{ fontSize: '2.5rem' }}>📚</span>
                <strong>ماث</strong>
                <span style={{ fontSize: '0.82rem', color: '#e2e8f0', textAlign: 'center' }}>يظهر الأدوات المشتركة فقط</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TEACHER TOPBAR — Unified Professional Bar
          ══════════════════════════════════════════ */}
      <header style={{
        height: `calc(${isLandscape ? '44px' : '48px'} + env(safe-area-inset-top, 0px))`,
        minHeight: `calc(${isLandscape ? '44px' : '48px'} + env(safe-area-inset-top, 0px))`,
        backgroundColor: '#111827',
        borderBottom: '1px solid #1f2937',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingRight: `calc(12px + env(safe-area-inset-right, 0px))`,
        paddingLeft: `calc(12px + env(safe-area-inset-left, 0px))`,
        paddingBottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isMobile ? 'flex-start' : 'space-between',
        position: 'relative',
        zIndex: 50,
        flexShrink: 0,
        gap: '12px',
        overflowX: isMobile ? 'auto' : 'visible',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}>

        {/* ── ZONE 1: Identity (Left) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.3)', borderRadius: '20px', padding: '3px 10px', flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'livePulse 1.4s ease-in-out infinite', flexShrink: 0 }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#34d399', letterSpacing: '0.5px' }}>{classTimer}</span>
          </div>
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '0.6rem', color: '#6b7280', fontWeight: 600 }}>غرفة</span>
              <span style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '5px', padding: '2px 7px', fontSize: '0.7rem', fontWeight: 900, color: '#d1d5db', letterSpacing: '1px' }}>{roomId}</span>
            </div>
          )}
          <button onClick={copyRoomLink} title="نسخ رابط الغرفة" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: copiedLink ? 'rgba(5,150,105,0.2)' : '#1f2937', border: `1px solid ${copiedLink ? '#059669' : '#374151'}`, color: copiedLink ? '#34d399' : '#9ca3af', padding: '4px 9px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
            {copiedLink ? <Check size={11} /> : <Copy size={11} />}
            {!isMobile && <span>{copiedLink ? 'تم النسخ' : 'نسخ الرابط'}</span>}
          </button>
          
          <button onClick={handleEditName} title="تعديل اسمك المعروض للطلاب" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px dashed #4b5563', color: '#9ca3af', padding: '4px 9px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
            <Edit2 size={11} />
            {!isMobile && <span>{teacherDisplayName}</span>}
          </button>
        </div>

        {/* ── ZONE 3: Action Controls (Right) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>

          {/* Global AR Live Hand Controller (Universal Virtual Mouse) */}
          <button
            onClick={() => setIsARActive(prev => !prev)}
            title={isARActive ? 'إيقاف تحكم الواقع المعزز (AR)' : 'تشغيل تحكم الواقع المعزز (AR) باليد عبر الشاشة كاملة'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '7px',
              cursor: 'pointer',
              background: isARActive
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              border: isARActive ? '1px solid #34d399' : '1px solid #a78bfa',
              color: 'white',
              fontWeight: 800,
              fontSize: '0.72rem',
              boxShadow: isARActive
                ? '0 0 12px rgba(16, 185, 129, 0.6)'
                : '0 2px 8px rgba(139, 92, 246, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            <Sparkles size={13} />
            {!isMobile && <span>{isARActive ? 'إيقاف AR 🖐️' : 'لايف AR 🖐️'}</span>}
          </button>

          {/* Question bank */}
          <button onClick={() => setShowQuestionModal(true)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            padding: '4px 8px', borderRadius: '7px', background: '#1f2937',
            border: '1px solid #374151', color: '#9ca3af', cursor: 'pointer',
          }}>
            <Sparkles size={14} />
            {!isMobile && <span style={{ fontSize: '0.55rem', fontWeight: 700, lineHeight: 1 }}>أسئلة</span>}
          </button>

          {/* Teacher Guide */}
          <button onClick={() => setShowGuideModal(true)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            padding: '4px 8px', borderRadius: '7px', cursor: 'pointer',
            background: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.4)',
            color: '#c4b5fd',
          }}>
            <BookOpen size={14} />
            {!isMobile && <span style={{ fontSize: '0.55rem', fontWeight: 700, lineHeight: 1 }}>التعليمات</span>}
          </button>

          {/* Focus mode */}
          <button onClick={handleToggleFocus} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            padding: '4px 8px', borderRadius: '7px', cursor: 'pointer',
            background: focusMode ? 'rgba(245,158,11,0.15)' : '#1f2937',
            border: `1px solid ${focusMode ? '#f59e0b' : '#374151'}`,
            color: focusMode ? '#fbbf24' : '#9ca3af',
          }}>
            <ShieldAlert size={14} />
            {!isMobile && <span style={{ fontSize: '0.55rem', fontWeight: 700, lineHeight: 1 }}>{focusMode ? 'تركيز' : 'تركيز'}</span>}
          </button>

          {/* Mute all */}
          <button onClick={handleMuteAll} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            padding: '4px 8px', borderRadius: '7px', background: '#1f2937',
            border: '1px solid #374151', color: '#9ca3af', cursor: 'pointer',
          }}>
            <VolumeX size={14} />
            {!isMobile && <span style={{ fontSize: '0.55rem', fontWeight: 700, lineHeight: 1 }}>كتم الكل</span>}
          </button>

          <div style={{ width: 1, height: 28, background: '#374151', margin: '0 2px' }} />

          {/* Fullscreen */}
          <button onClick={togglePageFullscreen} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            padding: '4px 8px', borderRadius: '7px', background: '#1f2937',
            border: '1px solid #374151', color: '#9ca3af', cursor: 'pointer',
          }}>
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {!isMobile && <span style={{ fontSize: '0.55rem', fontWeight: 700, lineHeight: 1 }}>{isFullscreen ? 'تصغير' : 'تكبير'}</span>}
          </button>

          {/* Specialty */}
          <button onClick={() => { setSpecialty(null); setActiveTool('whiteboard') }} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            padding: '4px 8px', borderRadius: '7px', background: '#1f2937',
            border: '1px solid #374151', color: '#9ca3af', cursor: 'pointer', fontSize: '13px',
          }}>
            ⚙️
            {!isMobile && <span style={{ fontSize: '0.55rem', fontWeight: 700, lineHeight: 1, fontFamily: 'Tajawal' }}>التخصص</span>}
          </button>
        </div>

        <style>{`
          @keyframes livePulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
            50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(16,185,129,0); }
          }
        `}</style>
      </header>

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
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    <LiveWhiteboardTeacher
                      channel={channel}
                      students={devices}
                      isMobile={isMobile}
                      isAdmin={isAdminUser}
                      isARActive={isARActive}
                      setIsARActive={setIsARActive}
                    />
                  </div>
              </div>

              {/* Stage: HTML Sandbox */}
              <div style={{ display: activeTool === 'html-sandbox' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    <LiveHtmlSandboxTeacher channel={channel} currentUserName={teacherDisplayName} />
                  </div>
              </div>

              {/* Stage: Arabic Board */}
              <div style={{ display: activeTool === 'arabic-board' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    {(specialty === 'arabic' || specialty === 'general') && <LiveArabicBoardTeacher channel={channel} />}
                  </div>
              </div>

              {/* Stage: English Board */}
              <div style={{ display: activeTool === 'english-board' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    {(specialty === 'english' || specialty === 'general') && <LiveEnglishBoardTeacher channel={channel} />}
                  </div>
              </div>

              {/* Stage: Math Board */}
              <div style={{ display: activeTool === 'math-board' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    {(specialty === 'math' || specialty === 'general') && <LiveMathBoardTeacher channel={channel} />}
                  </div>
              </div>

              {/* Stage: Grammar & ResponsiveVoice */}
              <div style={{ display: activeTool === 'grammar' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    <InteractiveGrammarStage isTeacher={true} channel={channel} hasControl={true} />
                  </div>
              </div>

              {/* Stage: Screen Share */}
              <div style={{ display: activeTool === 'screenshare' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#0f172a' }}>
                    <TeacherScreenShareWrapper channel={channel} roomId={roomId} activeTool={activeTool} />
                  </div>
              </div>

              {/* Stage: Ready Pathway (Teacher View) */}
              <div style={{ display: activeTool === 'ready-pathway' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    <LiveReadyPathway channel={channel} isTeacher={true} />
                  </div>
              </div>

              {/* Stage: Quran Game */}
              <div style={{ display: activeTool === 'quran' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                    <QuranOrderGameOverlay isActive={activeTool === 'quran'} channel={channel} onClose={() => handleSelectTool('whiteboard')} />
                  </div>
              </div>

              {/* Stage: Memory Game */}
              <div style={{ display: activeTool === 'memory' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                    <MemoryGameOverlay isActive={activeTool === 'memory'} channel={channel} onClose={() => handleSelectTool('whiteboard')} />
                  </div>
              </div>

              {/* Stage: Hangman */}
              <div style={{ display: activeTool === 'hangman' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                    <HangmanOverlay isActive={activeTool === 'hangman'} channel={channel} onClose={() => handleSelectTool('whiteboard')} />
                  </div>
              </div>

              {/* Stage: Quiz Show */}
              <div style={{ display: activeTool === 'quizshow' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                    <QuizShowOverlay isActive={activeTool === 'quizshow'} channel={channel} onClose={() => handleSelectTool('whiteboard')} />
                  </div>
              </div>

              {/* Stage: Word Search */}
              <div style={{ display: activeTool === 'wordsearch' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                    <WordSearchOverlay isActive={activeTool === 'wordsearch'} channel={channel} onClose={() => handleSelectTool('whiteboard')} />
                  </div>
              </div>

              {/* Stage: Word Builder */}
              <div style={{ display: activeTool === 'wordbuilder' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                    <WordBuilderOverlay isActive={activeTool === 'wordbuilder'} channel={channel} onClose={() => handleSelectTool('whiteboard')} />
                  </div>
              </div>

              {/* Stage: Train Game */}
              <div style={{ display: activeTool === 'train' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    <LiveTrainGameTeacher channel={channel} devices={devices} activeControlDevices={activeControlDevices} onGrantControl={handleGrantControl} specialty={specialty} />
                  </div>
              </div>

              {/* Stage: Mario */}
              <div style={{ display: activeTool === 'mario' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    <LiveMarioTeacher channel={channel} devices={devices} activeControlDevices={activeControlDevices} onGrantControl={handleGrantControl} customQuestions={customQuestions} setCustomQuestions={setCustomQuestions} specialty={specialty} />
                  </div>
              </div>

              {/* Stage: Tank Battle */}
              <div style={{ display: (activeTool === 'tank' || activeTool === 'tank-battle') ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    <LiveTankBattleTeacher channel={channel} devices={devices} activeControlDevices={activeControlDevices} customQuestions={customQuestions} setCustomQuestions={setCustomQuestions} specialty={specialty} />
                  </div>
              </div>

              {/* Stage: Subway Runner */}
              <div style={{ display: activeTool === 'subway' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    <LiveSubwayTeacher channel={channel} devices={devices} activeControlDevices={activeControlDevices} onGrantControl={handleGrantControl} customQuestions={customQuestions} setCustomQuestions={setCustomQuestions} specialty={specialty} />
                  </div>
              </div>

              {/* Stage: Racing Game */}
              <div style={{ display: activeTool === 'racing' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    <LiveRacingTeacher channel={channel} devices={devices} activeControlDevices={activeControlDevices} onGrantControl={handleGrantControl} customQuestions={customQuestions} setCustomQuestions={setCustomQuestions} specialty={specialty} />
                  </div>
              </div>

              {/* Stage: Wheel of Fortune */}
              <div style={{ display: activeTool === 'wheel' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    <LiveWheelTeacher channel={channel} devices={devices} />
                  </div>
              </div>

              {/* Stage: Flashcards */}
              <div style={{ display: activeTool === 'flashcards' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    <LiveFlashcardsTeacher channel={channel} />
                  </div>
              </div>

              {/* Stage: Leaderboard */}
              <div style={{ display: activeTool === 'leaderboard' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    <LiveLeaderboardTeacher channel={channel} devices={devices} />
                  </div>
              </div>

              {/* Stage: Certificates */}
              <div style={{ display: activeTool === 'certificates' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    <LiveCertificatesTeacher channel={channel} devices={devices} />
                  </div>
              </div>

              {/* Floating Student Reactions */}
              <ReactionOverlay channel={channel} />

              {/* Live Captions Overlay */}
              <LiveCaptionOverlay isVisible={isCaptionOverlayVisible} isTeacher={true} captionPayload={captionPayload} />

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
                  isTeacher={true}
                  students={devices}
                  handRaises={handRaises}
                  activeControlDeviceIds={activeControlDevices}
                  onGrantControl={handleGrantControl}
                  onGrantMic={grantSpeakToStudent}
                  onMuteStudent={forceMuteStudent}
                  focusMode={focusMode}
                  channel={channel}
                  currentUserId={teacherId}
                  currentUserName={teacherDisplayName}
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
            title={peer.name || 'طالب'}
            isLocal={false}
            initialPosition={{ x: 350, y: 80 + (i + (localStream && isCameraOn ? 1 : 0)) * 160 }}
          />
        ))}

        {/* BOTTOM CONTROL BAR */}
        <LiveBottomBar
          isTeacher={true}
          isMicOn={isMicOn}
          onToggleMic={toggleMic}
          isCameraOn={isCameraOn}
          onToggleCamera={toggleCamera}
          conferenceMode={conferenceMode}
          onToggleConference={() => conferenceMode ? disableConferenceMode() : enableConferenceMode()}
          isAgoraEnabled={isAgoraEnabled}
          onToggleAgora={handleToggleAgora}
          activeTool={activeTool}
          onSelectTool={handleSelectTool}
          specialty={specialty}
          captionLanguage={captionLanguage}
          onChangeCaptionLanguage={setCaptionLanguage}
          isMyCaptionEnabled={isCaptionsEnabled}
          onToggleMyCaption={() => {
            setIsCaptionsEnabled(prev => {
              if (!prev && !isMicOn) {
                showToast('تنبيه: الكابشن يحتاج لتشغيل الميكروفون لكي يعمل', 'info')
              }
              return !prev
            })
          }}
          isCaptionOverlayVisible={isCaptionOverlayVisible}
          onToggleCaptionOverlay={() => setIsCaptionOverlayVisible(prev => !prev)}
          activeTab={sidebarTab}
          onToggleTab={(tab) => {
            if (isSidebarOpen && sidebarTab === tab) {
              setIsSidebarOpen(false)
            } else {
              setSidebarTab(tab)
              setIsSidebarOpen(true)
            }
          }}
          onLeave={() => window.location.href = '/teacher-assistant'}
          channel={channel}
          currentUserName={teacherDisplayName}
          handRaisesCount={handRaises.length}
        />
        
        {/* Modals & Overlays */}
        {showQuestionModal && (
          <QuestionManagerModal
            onClose={() => setShowQuestionModal(false)}
            specialty={specialty}
            customQuestions={customQuestions}
            setCustomQuestions={setCustomQuestions}
          />
        )}        {/* Hidden Audio Players for all streams */}
        {peers.filter(p => p.stream).map(peer => (
          <RemoteAudio key={`audio-${peer.id}`} stream={peer.stream} />
        ))}

        
        <LiveTeacherGuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} />
        {isAdminUser && <AdminLiveAIStudio channel={channel} />}

        {/* Global AR Virtual Mouse Controller across Entire Live Classroom */}
        {isARActive && (
          <ARGestureController
            onClose={() => setIsARActive(false)}
            channel={channel}
            stream={localStream}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            onNextPage={() => {
              if (typeof window !== 'undefined' && typeof window.__whiteboardNextPage === 'function') {
                window.__whiteboardNextPage()
              } else if (channel) {
                channel.send({ type: 'broadcast', event: 'page_next', payload: {} }).catch(() => {})
              }
            }}
            onPrevPage={() => {
              if (typeof window !== 'undefined' && typeof window.__whiteboardPrevPage === 'function') {
                window.__whiteboardPrevPage()
              } else if (channel) {
                channel.send({ type: 'broadcast', event: 'page_prev', payload: {} }).catch(() => {})
              }
            }}
          />
        )}
      </div>
    )
  }

// --- P2P SCREEN SHARE WRAPPER ---
function TeacherScreenShareWrapper({ channel, roomId, activeTool }) {
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (activeTool === 'screenshare' && !stream) {
      setError(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        setError('مشاركة الشاشة غير مدعومة على متصفحات وتطبيقات الموبايل لدواعي أمنية من نظام التشغيل.');
        return;
      }
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
        .then(s => {
          setStream(s)
          s.getVideoTracks()[0].onended = () => {
            setStream(null)
          }
        })
        .catch(err => {
          setError('تعذر التقاط الشاشة. تأكد من إعطاء الصلاحيات.');
        })
    } else if (activeTool !== 'screenshare') {
      if(stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
      setError(null);
    }
  }, [activeTool, stream])

  if (activeTool !== 'screenshare') return null;

  if (error) return <div style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100%', color:'#ef4444', textAlign:'center', gap:'10px', padding:'20px'}}><div>{error}</div><button onClick={() => setError(null)} style={{padding:'8px 16px', background:'#3b82f6', color:'white', borderRadius:'8px', border:'none', cursor:'pointer'}}>حاول مرة أخرى</button></div>
  if (!stream) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100%',color:'white'}}>جاري طلب صلاحية الشاشة...</div>

  return <TeacherScreenShare stream={stream} roomId={roomId} />
}

export default function VirtualClassroomTeacher() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#10b981', fontFamily: 'Tajawal', fontSize: '1.2rem' }}>جاري تحميل الغرفة... 🎥</div>}>
      <TeacherVirtualClassroomContent />
    </Suspense>
  )






































}
// fixed build brace
