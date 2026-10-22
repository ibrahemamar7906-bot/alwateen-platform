'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import { pathways } from './data'
import { playTTS } from '../../../utils/tts'
import confetti from 'canvas-confetti'
import { 
  getStudentGamificationData, 
  claimChestReward, 
  recordStudentActivityAndXP, 
  getPathwayProgress,
  getCompletedNodes,
  savePathwayProgress 
} from '../../../utils/progress'
import { 
  Sparkles, Flame, Zap, Trophy, Award, Gift, CheckCircle2, 
  Lock, ArrowLeft, AlertCircle, Compass, ChevronLeft, MessageCircle, Star, Crown, X 
} from 'lucide-react'
import CertificateModal from '../components/CertificateModal'

const SUBJECT_LABELS = {
  arabic: 'تأسيس اللغة العربية 🇸🇦',
  primary1_arabic: 'منهج أولى ابتدائي 🇸🇦',
  primary2_arabic: 'منهج تانية ابتدائي 🇸🇦',
  primary3_arabic: 'منهج تالتة ابتدائي 🇸🇦',
  primary4_arabic: 'منهج رابعة ابتدائي 🇸🇦',
  primary5_arabic: 'منهج خامسة ابتدائي 🇸🇦',
  primary6_arabic: 'منهج سادسة ابتدائي 🇸🇦',
  prep1_arabic: 'منهج أولى إعدادي 🇸🇦',
  prep2_arabic: 'منهج تانية إعدادي 🇸🇦',
  prep3_arabic: 'منهج تالتة إعدادي 🇸🇦',
  sec1_arabic: 'منهج أولى ثانوي 🇸🇦',
  sec2_arabic: 'منهج تانية ثانوي 🇸🇦',
  sec3_arabic: 'منهج تالتة ثانوي 🇸🇦',
  english: 'تأسيس الإنجليزية 🔠',
  math: 'تأسيس الحساب 🔢',
  math_en: 'Math Pathway 🔢',
}

function PathwayMapContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subject = searchParams.get('subject') || 'arabic'

  // REDIRECT ALL PREP AND SEC TO NEW GRID HUB LAYOUT
  useEffect(() => {
    if (subject.startsWith('prep') || subject.startsWith('sec')) {
      const grade = subject.split('_')[0]
      const formattedGrade = grade.replace('prep', 'prep-').replace('sec', 'sec-')
      router.replace(`/${formattedGrade}`)
    }
  }, [subject, router])

  const targetUnitParam = searchParams.get('unit')
  const focusParam = searchParams.get('focus')

  const [loading, setLoading] = useState(true)
  const [currentProgress, setCurrentProgress] = useState(1)
  const [completedNodes, setCompletedNodes] = useState([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  
  const [gamification, setGamification] = useState({ streak: 1, xp: 150, claimedChests: [] })
  const [activeChestModal, setActiveChestModal] = useState(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [selectedLockedNode, setSelectedLockedNode] = useState(null)
  const [claiming, setClaiming] = useState(false)
  const [toastNotice, setToastNotice] = useState(null)
  const [shakingNodeId, setShakingNodeId] = useState(null)
  const [selectedUnitFilter, setSelectedUnitFilter] = useState(null)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [mascotBubble, setMascotBubble] = useState(true)
  const [mascotText, setMascotText] = useState('')
  const [mascotJumping, setMascotJumping] = useState(false)

  const activeNodeRef = useRef(null)
  const pathData = pathways[subject] || pathways.arabic

  const MASCOT_PHRASES = [
    'أنت أذكى وأشطر بطل رأيته اليوم! 🌟',
    'واصل يا عبقري، كل محطة تنجزها ترفع من مستواك وتزيد خبرتك! 🚀',
    'ما شاء الله على تركيزك واجتهادك.. منصتنا فخورة بك جداً! 🏅',
    'الحروف والكلمات سهلة جداً لأنك بطل التأسيس المغوار! 📚',
    'إذا تعثرت في أي تدريب، كرر وحاول.. الأبطال يتعلمون من التكرار! 🛡️',
    'أنت تقترب خطوة بخطوة من الحصول على الشهادة الذهبية المعتمدة! 🎓'
  ]

  const handleMascotClick = () => {
    playSFX('click')
    setMascotJumping(true)
    setTimeout(() => setMascotJumping(false), 600)
    
    const randomPhrase = MASCOT_PHRASES[Math.floor(Math.random() * MASCOT_PHRASES.length)]
    setMascotText(randomPhrase)
    setMascotBubble(true)
    playTTS(randomPhrase, { force: true })
  }

  const playSFX = (type) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      if (type === 'click') {
        osc.frequency.setValueAtTime(600, audioCtx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1)
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.1)
      } else if (type === 'locked') {
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(200, audioCtx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.2)
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.2)
      }
    } catch(e) {}
  }

  // Extract distinct units for navigation
  const unitsList = Array.from(new Set(pathData.map(n => n.unit).filter(Boolean))).map(u => {
    const firstNode = pathData.find(n => n.unit === u)
    const isStart = firstNode?.type === 'unit_start'
    let unitLabel = `الوحدة ${u}`
    if (isStart && firstNode.title) {
      unitLabel = firstNode.title.replace('بداية الوحدة:', '').replace('الوحدة الأولى:', '').replace('الوحدة الثانية:', '').replace('الوحدة الثالثة:', '').trim()
    }
    return {
      unit: u,
      label: unitLabel,
      firstNodeId: firstNode?.id || 1,
      isUnlocked: true // All unit tracks have open free trial access to start
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        let subActive = false
        if (user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, status, subscription_end_date, full_name, phone')
              .eq('id', user.id)
              .single()

            if (profile) {
              setUserProfile(profile)
              const subEnd = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null
              subActive = profile.role === 'admin' || 
                          (profile.status === 'approved' && (!subEnd || subEnd > new Date())) || 
                          (subEnd && subEnd > new Date())
            }
          } catch (pe) {
            console.warn('Profile fetch warning:', pe)
          }
        }
        setIsSubscribed(subActive)

        // Fetch Pathway Progress & Completed list
        const p = await getPathwayProgress(user?.id, subject)
        const cList = await getCompletedNodes(user?.id, subject)
        
        // Fetch Gamification Streak & XP
        const gData = await getStudentGamificationData(user?.id)

        // Auto-heal logic: If current progress is stuck on a chest node
        const pathwayNodes = pathways[subject] || pathways.arabic
        const currentNode = pathwayNodes.find(n => n.id === p)
        if (currentNode && currentNode.type === 'chest') {
          const chestId = `${subject}_chest_${currentNode.id}`
          if (gData.claimedChests?.includes(chestId) || p === currentNode.id) {
            await savePathwayProgress(user?.id, subject, currentNode.id, 0)
          }
        }

        setCurrentProgress(p)
        setCompletedNodes(cList)
        setGamification(gData)

        // Automatically record daily visit
        const updated = await recordStudentActivityAndXP(user?.id, 5)
        if (updated.success) {
          setGamification(prev => ({
            ...prev,
            streak: updated.streak,
            xp: updated.xp
          }))
        }
      } catch (err) {
        console.error('Error fetching progress & gamification', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [subject])

  // Scroll to target unit or current active node on load
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        if (targetUnitParam) {
          const uNum = parseInt(targetUnitParam)
          const targetEl = document.getElementById(`unit-anchor-${uNum}`)
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
          }
        }
        if (focusParam) {
          const focusEl = document.getElementById(`node-${focusParam}`)
          if (focusEl) {
            focusEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
          }
        }
        if (activeNodeRef.current) {
          activeNodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 350)
    }
  }, [loading, currentProgress, targetUnitParam, focusParam])

  // Mascot dynamic greeting and motivation based on child progress
  useEffect(() => {
    if (!loading && pathData && pathData.length > 0) {
      const nextChest = pathData.find(n => n.type === 'chest' && !completedNodes.includes(n.id) && !gamification.claimedChests?.includes(`${subject}_chest_${n.id}`))
      const currentId = typeof currentProgress === 'number' ? currentProgress : 1
      const remainingToChest = nextChest ? Math.max(1, nextChest.id - currentId) : 0

      let initialSpeech = ''
      if (gamification.streak > 1) {
        initialSpeech = `أهلاً يا بطل! سلسلة حماسك متواصلة لليوم الـ ${gamification.streak} على التوالي 🔥!`
      } else if (remainingToChest > 0 && remainingToChest <= 5) {
        initialSpeech = `مرحباً يا بطل! أنت على بُعد ${remainingToChest} محطات فقط من صندوق المكافآت القادم 🎁!`
      } else if (completedNodes.length >= pathData.length) {
        initialSpeech = 'مبارك يا أسطورة! لقد أتممت جميع مراحل هذا المسار بامتياز 👑!'
      } else {
        initialSpeech = 'أهلاً بك يا بطل! اضغط عليّ في أي وقت لأشجعك 🌟، وهيا لنبدأ رحلة التعلم!'
      }
      setMascotText(initialSpeech)
    }
  }, [loading, completedNodes, currentProgress, gamification.streak, gamification.claimedChests, subject])

  const scrollToUnit = (unitNumber) => {
    setSelectedUnitFilter(unitNumber)
    const targetEl = document.getElementById(`unit-anchor-${unitNumber}`)
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleOpenChest = (node) => {
    setActiveChestModal(node)
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch (e) {}
  }

  const handleClaimChest = async () => {
    if (!activeChestModal || claiming) return
    setClaiming(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const chestId = `${subject}_chest_${activeChestModal.id}`
      const res = await claimChestReward(user?.id, chestId, 50, activeChestModal.data?.badge || 'بطل الوحدة 🏅')
      
      await savePathwayProgress(user?.id, subject, activeChestModal.id, 50)
      setCompletedNodes(prev => Array.from(new Set([...prev, activeChestModal.id])))

      setGamification(prev => ({
        ...prev,
        xp: (res && res.xp) || (prev.xp + 50),
        claimedChests: [...(prev.claimedChests || []), chestId]
      }))

      try {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 }
        })
      } catch (e) {}
    } catch (err) {
      console.error('Error claiming chest:', err)
    } finally {
      setClaiming(false)
      setActiveChestModal(null)
    }
  }

  const handleNodeClick = (node, isUnlocked, isPaidLocked, prevNodeTitle) => {
    if (isUnlocked) {
      playSFX('click')
      if (node.type === 'chest') {
        handleOpenChest(node)
      } else {
        router.push(`/kids-corner/pathway/lesson?subject=${subject}&id=${node.id}`)
      }
    } else if (isPaidLocked) {
      playSFX('locked')
      setShakingNodeId(node.id)
      setTimeout(() => setShakingNodeId(null), 500)
      setSelectedLockedNode(node)
      setShowSubscriptionModal(true)
    } else {
      playSFX('locked')
      setShakingNodeId(node.id)
      setTimeout(() => setShakingNodeId(null), 500)
      
      const msg = `يجب إنهاء المرحلة السابقة أولاً. قم بإنهاء "${prevNodeTitle || 'الدرس السابق'}" لكي تفتح هذه المرحلة!`
      setToastNotice({
        title: node.title || 'مرحلة مغلقة 🔒',
        message: msg
      })
      // Speak the warning to the student!
      playTTS(msg, { force: true })
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', background: 'var(--bg-main, #f0fdf4)', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #d1fae5', borderTop: '4px solid #059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#064e3b', fontWeight: 800, fontSize: '1.1rem' }}>جاري تحميل خريطة ومسارات المنهج...</p>
      </div>
    )
  }

  const isArabic = !['english', 'math_en'].includes(subject)
  const totalCompleted = completedNodes.length

  const whatsappMessage = encodeURIComponent(
    `السلام عليكم يا المستر إبراهيم عمار، أنا الطالب (${userProfile?.full_name || 'ولي أمر'}) وحابب أشترك في منصة الوتين لتفعيل كامل دروس منهج (${SUBJECT_LABELS[subject] || 'اللغة العربية'}).`
  )
  const whatsappUrl = `https://wa.me/201507952002?text=${whatsappMessage}`

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'radial-gradient(circle at top right, rgba(5, 150, 105, 0.08) 0%, #f0fdf4 100%)',
      padding: 'clamp(8px, 2.5vw, 24px) clamp(8px, 2.5vw, 18px)',
      boxSizing: 'border-box',
      direction: 'rtl',
      fontFamily: 'Tajawal, sans-serif',
      overflowX: 'hidden',
      width: '100%'
    }}>
      <style>{`
        .pm-node {
          touch-action: manipulation;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), filter 0.3s;
          display: flex; flex-direction: column; align-items: center;
        }
        @media (hover: hover) and (pointer: fine) {
          .pm-node.unlocked:hover { transform: var(--node-offset) scale(1.08) !important; }
          .pm-node.locked:hover { transform: var(--node-offset) scale(1.03) !important; }
        }
        .pm-node.unlocked:active { transform: var(--node-offset) scale(0.95) !important; }
        
        .pm-chest-pulse {
          animation: chestPulse 2s infinite;
        }
        @keyframes chestPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35); }
          50% { transform: scale(1.08); box-shadow: 0 14px 36px rgba(245, 158, 11, 0.6); }
        }

        .shake-anim {
          animation: shake-anim 0.4s ease-in-out;
        }
        @keyframes shake-anim {
          0%, 100% { transform: scale(1) translateX(0); }
          25% { transform: scale(1.05) translateX(-5px); }
          75% { transform: scale(1.05) translateX(5px); }
        }

        .pm-trial-glow {
          animation: trialGlow 2s infinite alternate;
        }
        @keyframes trialGlow {
          0% { box-shadow: 0 0 12px rgba(16, 185, 129, 0.4); transform: scale(1); }
          100% { box-shadow: 0 0 24px rgba(16, 185, 129, 0.8); transform: scale(1.03); }
        }

        .pm-mascot-container {
          position: fixed;
          bottom: clamp(14px, 3vw, 24px);
          left: clamp(12px, 3vw, 24px);
          z-index: 95;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          pointer-events: none;
        }
        .pm-mascot-bubble {
          pointer-events: auto;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(12px);
          border: 2px solid #a7f3d0;
          border-radius: 18px 18px 18px 4px;
          padding: 10px 14px;
          max-width: clamp(210px, 45vw, 270px);
          box-shadow: 0 10px 25px rgba(5, 150, 105, 0.15);
          font-size: clamp(0.78rem, 2vw, 0.88rem);
          font-weight: 700;
          color: #064e3b;
          line-height: 1.5;
          animation: popBubble 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
        }
        @keyframes popBubble {
          0% { opacity: 0; transform: scale(0.7) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .pm-mascot-btn {
          pointer-events: auto;
          width: clamp(52px, 8vw, 64px);
          height: clamp(52px, 8vw, 64px);
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: 3px solid #ffffff;
          box-shadow: 0 8px 24px rgba(5, 150, 105, 0.35);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(1.8rem, 4vw, 2.3rem);
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          user-select: none;
          animation: mascotFloat 3s ease-in-out infinite;
        }
        .pm-mascot-btn:hover {
          transform: scale(1.12);
        }
        .pm-mascot-btn:active {
          transform: scale(0.92);
        }
        .pm-mascot-btn.jumping {
          animation: mascotJump 0.5s ease;
        }
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes mascotJump {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.25) translateY(-16px); }
        }

        .pm-header {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 12px 18px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px rgba(5, 150, 105, 0.08);
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          box-sizing: border-box;
        }

        .pm-back-btn {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(5, 150, 105, 0.2);
          color: #065f46;
          padding: 6px 14px;
          border-radius: 50px;
          font-weight: 800;
          font-size: clamp(0.8rem, 2.2vw, 0.92rem);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
        }
        .pm-back-btn:hover {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          border-color: transparent;
        }

        .pm-stats-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          flex-wrap: nowrap;
          overflow-x: auto;
          padding-top: 6px;
          padding-bottom: 2px;
          border-top: 1px solid rgba(5, 150, 105, 0.1);
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .pm-stats-bar::-webkit-scrollbar { display: none; }

        .pm-stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 50px;
          font-weight: 800;
          font-size: 0.8rem;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .pm-unit-pill {
          padding: 5px 12px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          border: 1px solid rgba(5, 150, 105, 0.15);
          background: white;
          color: #065f46;
          box-shadow: 0 2px 5px rgba(0,0,0,0.03);
          flex-shrink: 0;
        }
        .pm-unit-pill:hover {
          background: #ecfdf5;
          border-color: #10b981;
          color: #047857;
        }
        .pm-unit-pill.active {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
        }

        .pm-tooltip {
          position: absolute;
          top: -30px;
          background: #064e3b;
          color: white;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 20px;
          white-space: nowrap;
          max-width: 140px;
          text-overflow: ellipsis;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          animation: bounce 1.8s infinite ease-in-out;
          pointer-events: none;
          z-index: 10;
        }
        .pm-tooltip::after {
          content: '';
          position: absolute;
          bottom: -5px; left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid #064e3b;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .pm-header {
            padding: 8px 10px !important;
            border-radius: 16px !important;
            margin-bottom: 14px !important;
            gap: 6px !important;
          }
          .pm-stat-pill {
            padding: 4px 8px !important;
            font-size: 0.74rem !important;
          }
          .pm-unit-pill {
            padding: 4px 9px !important;
            font-size: 0.74rem !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: '580px', margin: '0 auto', paddingBottom: '90px', width: '100%', boxSizing: 'border-box' }}>

        {/* ══════════════════════════════
            SMART GAMIFIED HEADER BAR
        ══════════════════════════════ */}
        <header className="pm-header">
          {/* Top Line: Back + Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <button className="pm-back-btn" onClick={() => {
              if (subject === 'arabic') router.push('/kids-corner/arabic');
              else if (subject === 'math' || subject === 'math_en') router.push('/kids-corner/math');
              else if (subject === 'english') router.push('/kids-corner/english');
              else router.push('/student-dashboard');
            }}>
              <ArrowLeft size={16} />
              <span>العودة</span>
            </button>

            <h1 style={{
              margin: 0,
              fontSize: 'clamp(1.05rem, 3.8vw, 1.4rem)',
              fontWeight: 900,
              color: '#064e3b',
              textAlign: 'center',
            }}>
              {SUBJECT_LABELS[subject] || subject}
            </h1>

            <button 
              className="pm-back-btn"
              style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}
              onClick={() => {
                if (activeNodeRef.current) {
                  activeNodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
              }}
              title="الذهاب للمحطة الحالية"
            >
              <Compass size={16} color="#059669" />
              <span>مكاني</span>
            </button>
          </div>

          {/* Stats Bar: Streak, XP, Progress & VIP Status */}
          <div className="pm-stats-bar">
            {/* Daily Streak */}
            <div className="pm-stat-pill" style={{
              background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
              border: '1px solid #fdba74',
              color: '#c2410c',
              boxShadow: '0 2px 6px rgba(249, 115, 22, 0.1)'
            }}>
              <Flame size={16} color="#ea580c" />
              <span>{gamification.streak} {gamification.streak === 1 ? 'يوم حماس' : 'أيام'}</span>
            </div>

            {/* XP Points */}
            <div className="pm-stat-pill" style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '1px solid #86efac',
              color: '#15803d',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.1)'
            }}>
              <Zap size={16} color="#16a34a" />
              <span>{gamification.xp} XP</span>
            </div>

            {/* Subscription Badge */}
            {isSubscribed ? (
              <div className="pm-stat-pill" style={{
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                border: '1px solid #f59e0b',
                color: '#92400e',
              }}>
                <Crown size={14} color="#d97706" />
                <span>اشتراك مفعل 🌟</span>
              </div>
            ) : (
              <button 
                onClick={() => setShowSubscriptionModal(true)}
                className="pm-stat-pill"
                style={{
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(5, 150, 105, 0.3)'
                }}
              >
                <Crown size={14} />
                <span>تفعيل 👑</span>
              </button>
            )}

            {/* Total Completed */}
            <div className="pm-stat-pill" style={{
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              border: '1px solid #93c5fd',
              color: '#1d4ed8',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.1)'
            }}>
              <Trophy size={16} color="#2563eb" />
              <span>{totalCompleted} مكتمل</span>
            </div>

            {/* Certificate Pill */}
            {totalCompleted >= 3 && (
              <button
                onClick={() => setShowCertificateModal(true)}
                className="pm-stat-pill"
                style={{
                  background: 'linear-gradient(135deg, #fef9c3, #fef08a)',
                  border: '1px solid #eab308',
                  color: '#854d0e',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(234, 179, 8, 0.25)'
                }}
              >
                <Award size={15} color="#ca8a04" />
                <span>شهادتي 📜</span>
              </button>
            )}
          </div>

          {/* Quick Units Scroll Bar */}
          {unitsList.length > 1 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingTop: '6px',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}>
              {unitsList.map(u => (
                <button
                  key={u.unit}
                  className={`pm-unit-pill ${selectedUnitFilter === u.unit ? 'active' : ''}`}
                  onClick={() => scrollToUnit(u.unit)}
                >
                  📖 {u.label}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* ══════════════════════════════
            PATHWAY TRACK NODES
        ══════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(28px, 6vw, 44px)', position: 'relative' }}>

          {/* Vertical Progress Line */}
          <div style={{
            position: 'absolute',
            top: '45px', bottom: '45px',
            width: '10px',
            background: 'rgba(5,150,105,0.12)',
            borderRadius: '10px',
            zIndex: 0,
          }}>
            <div style={{
              width: '100%',
              height: `${(Math.min(totalCompleted, pathData.length) / Math.max(1, pathData.length)) * 100}%`,
              background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
              borderRadius: '10px',
              transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 14px rgba(5, 150, 105, 0.5)',
            }} />
          </div>

          {pathData.map((node, index) => {
            const isUnitStart = node.type === 'unit_start'
            const isChest = node.type === 'chest'
            const chestId = `${subject}_chest_${node.id}`
            const isChestClaimed = gamification.claimedChests?.includes(chestId)

            // Section-Based Unlocking Logic:
            const unitNodes = pathData.filter(n => n.unit === node.unit && n.type !== 'unit_start')
            const indexInUnit = unitNodes.findIndex(n => n.id === node.id)
            const isFirstInUnit = indexInUnit === 0
            const prevNodeInUnit = indexInUnit > 0 ? unitNodes[indexInUnit - 1] : null

            // A node is completed if its id is recorded in completedNodes
            const isCompleted = completedNodes.includes(node.id) || (typeof currentProgress === 'number' && currentProgress > node.id)

            // 1. Admin / Teacher: ALWAYS UNLOCKED
            // 2. Unit Start
            // 3. Entire Unit 1 (Free Trial)
            // 4. Subscribed student: Unlocks sequentially
            let isUnlocked = false
            let isPaidLocked = false

            if (userProfile?.role === 'admin' || ['teacher', 'teacher_pro'].includes(userProfile?.role)) {
              isUnlocked = true
            } else if (isUnitStart) {
              isUnlocked = true
            } else if (node.unit === 1) {
              // Free Trial Unit 1 for all!
              isUnlocked = prevNodeInUnit ? (completedNodes.includes(prevNodeInUnit.id) || currentProgress > prevNodeInUnit.id) : true
            } else if (isSubscribed) {
              // Subscribed user: Unlocks sequentially within unit
              isUnlocked = prevNodeInUnit ? (completedNodes.includes(prevNodeInUnit.id) || currentProgress > prevNodeInUnit.id) : true
            } else {
              // Non-subscribed user on subsequent units: Paid Lock
              const isPrevDone = prevNodeInUnit ? (completedNodes.includes(prevNodeInUnit.id) || currentProgress > prevNodeInUnit.id) : true
              if (isPrevDone) {
                isPaidLocked = true // User completed preview, next requires subscription!
              } else {
                isPaidLocked = false // Needs previous node in sequence first
              }
              isUnlocked = false
            }

            const isCurrent = isUnlocked && !isCompleted

            const waveAmp = typeof window !== 'undefined' && window.innerWidth < 640 ? 34 : 54
            const offsetX = isUnitStart || isChest ? 0 : Math.sin(index * 1.35) * waveAmp

            // 1. Unit Start Banner
            if (isUnitStart) {
              return (
                <div
                  key={node.id}
                  id={`unit-anchor-${node.unit || 1}`}
                  ref={isCurrent ? activeNodeRef : null}
                  style={{
                    zIndex: 2,
                    width: '100%',
                    maxWidth: '440px',
                    margin: '10px 0',
                  }}
                  onClick={() => handleNodeClick(node, true, false, null)}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                    color: 'white',
                    padding: '16px 22px',
                    borderRadius: '24px',
                    textAlign: 'center',
                    boxShadow: '0 12px 28px rgba(5, 150, 105, 0.28)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '4px' }}>
                      {node.icon || '🚀'}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 'clamp(1.05rem, 3.2vw, 1.3rem)' }}>{node.title}</div>
                    <div style={{ fontSize: '0.88rem', opacity: 0.95, marginTop: '2px', fontWeight: 600 }}>{node.desc}</div>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      padding: '4px 14px',
                      borderRadius: '50px',
                      fontSize: '0.8rem',
                      fontWeight: 800
                    }}>
                      🌟 البداية مفتوحة للجميع
                    </span>
                  </div>
                </div>
              )
            }

            // 2. Mystery Reward Chest Node
            if (isChest) {
              return (
                <div
                  key={node.id}
                  ref={isCurrent ? activeNodeRef : null}
                  className={`pm-node ${isUnlocked ? 'unlocked' : 'locked'}`}
                  style={{
                    zIndex: 2,
                    cursor: 'pointer',
                    opacity: isUnlocked ? 1 : 0.65,
                  }}
                  onClick={() => handleNodeClick(node, isUnlocked, isPaidLocked, prevNodeInUnit?.title)}
                >
                  <div className={isUnlocked && !isChestClaimed ? 'pm-chest-pulse' : ''} style={{
                    width: 'clamp(76px, 16vw, 96px)',
                    height: 'clamp(76px, 16vw, 96px)',
                    borderRadius: '26px',
                    background: isChestClaimed
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : isUnlocked 
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : '#cbd5e1',
                    border: '4px solid white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(2rem, 5vw, 2.6rem)',
                    boxShadow: isUnlocked ? '0 10px 25px rgba(245, 158, 11, 0.35)' : 'none',
                    color: 'white',
                    transition: 'all 0.3s ease',
                  }}>
                    {isChestClaimed ? '🎉' : isUnlocked ? '🎁' : '🔒'}
                  </div>

                  <div style={{
                    marginTop: '8px',
                    background: 'white',
                    padding: '4px 14px',
                    borderRadius: '50px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: isChestClaimed ? '#059669' : isUnlocked ? '#d97706' : '#94a3b8',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}>
                    {isChestClaimed ? 'تم الاستلام ✨' : isUnlocked ? 'افتح المكافأة! 🎁' : 'صندوق مقفل 🔒'}
                  </div>
                </div>
              )
            }

            // 3. Regular Lesson / Quiz Nodes
            const circleBg = isCurrent
              ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
              : isCompleted
                ? 'linear-gradient(135deg, #34d399, #10b981)'
                : isPaidLocked
                  ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                  : 'rgba(255,255,255,0.92)'

            const circleShadow = isCurrent
              ? '0 12px 28px rgba(5,150,105,0.45)'
              : isCompleted
                ? '0 8px 20px rgba(52,211,153,0.3)'
                : isPaidLocked
                  ? '0 6px 18px rgba(245, 158, 11, 0.25)'
                  : '0 4px 12px rgba(0,0,0,0.06)'

            return (
              <div
                key={node.id}
                ref={isCurrent ? activeNodeRef : null}
                className={`pm-node ${isUnlocked ? 'unlocked' : 'locked'}`}
                style={{
                  zIndex: 1,
                  '--node-offset': `translateX(${offsetX}px)`,
                  transform: `translateX(${offsetX}px)`,
                  opacity: isUnlocked ? 1 : 0.65,
                  cursor: 'pointer',
                  filter: !isUnlocked && !isPaidLocked ? 'grayscale(80%)' : 'none',
                }}
                onClick={() => handleNodeClick(node, isUnlocked, isPaidLocked, prevNodeInUnit?.title)}
              >
                {/* Node Circle */}
                <div 
                  className={`pm-node-circle ${isFirstInUnit && !isCompleted ? 'pm-trial-glow' : ''} ${shakingNodeId === node.id ? 'shake-anim' : ''}`}
                  style={{
                    width: 'clamp(68px, 14vw, 88px)',
                    height: 'clamp(68px, 14vw, 88px)',
                    borderRadius: '50%',
                    background: circleBg,
                    border: isPaidLocked ? '4px solid #f59e0b' : '5px solid white',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                    boxShadow: circleShadow,
                    color: 'white',
                    transform: isCurrent ? 'scale(1.12)' : 'scale(1)',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? '✅' : isUnlocked ? node.icon : isPaidLocked ? '👑' : '🔒'}

                  {isFirstInUnit && !isCompleted && (
                    <div className="pm-tooltip" style={{ background: '#059669' }}>
                      🌟 تجربة مجانية مفتوحة
                    </div>
                  )}

                  {isCurrent && !isFirstInUnit && (
                    <div className="pm-tooltip">
                      {isArabic ? 'أكمل من هنا 🚀' : 'Start Here 🚀'}
                    </div>
                  )}
                </div>

                {/* Node Label */}
                <div style={{
                  marginTop: '10px',
                  background: isCurrent 
                    ? 'linear-gradient(135deg, #059669, #10b981)' 
                    : isPaidLocked
                      ? 'linear-gradient(135deg, #fffbeb, #fef3c7)'
                      : 'rgba(255, 255, 255, 0.95)',
                  color: isCurrent 
                    ? 'white' 
                    : isPaidLocked 
                      ? '#92400e' 
                      : isUnlocked 
                        ? '#064e3b' 
                        : '#64748b',
                  padding: '6px 14px',
                  borderRadius: '50px',
                  fontSize: 'clamp(0.78rem, 2.4vw, 0.88rem)',
                  fontWeight: 800,
                  maxWidth: '220px',
                  textAlign: 'center',
                  boxShadow: isCurrent ? '0 6px 16px rgba(5, 150, 105, 0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
                  border: isPaidLocked ? '1px solid #fde68a' : '1px solid rgba(5, 150, 105, 0.12)',
                  whiteSpace: 'normal',
                  lineHeight: '1.3',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  justifyContent: 'center'
                }}>
                  {isPaidLocked && <Crown size={13} color="#d97706" />}
                  <span>{node.title}</span>
                </div>

                {/* Subtitle / Free trial tag */}
                {isFirstInUnit && (
                  <div style={{
                    marginTop: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    color: '#059669',
                    background: '#d1fae5',
                    padding: '2px 8px',
                    borderRadius: '20px'
                  }}>
                    ✨ متاح للتجربة
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ══════════════════════════════
          TOAST NOTICE MODAL
      ══════════════════════════════ */}
      {toastNotice && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(16px)',
          color: 'white',
          padding: '14px 20px',
          borderRadius: '20px',
          zIndex: 2000,
          maxWidth: '90vw',
          width: '380px',
          boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.15)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <AlertCircle size={20} color="#facc15" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '2px', color: '#fef08a' }}>
                {toastNotice.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                {toastNotice.message}
              </div>
            </div>
            <button 
              onClick={() => setToastNotice(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          VIP SUBSCRIPTION MODAL
      ══════════════════════════════ */}
      {showSubscriptionModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.72)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 3000,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '28px',
            padding: 'clamp(22px, 5vw, 32px)',
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
            border: '2px solid #a7f3d0',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setShowSubscriptionModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: '#f1f5f9',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>

            {/* Glowing Crown Icon */}
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              border: '2px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              fontSize: '2.2rem',
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.25)'
            }}>
              👑
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#064e3b', margin: '0 0 6px 0' }}>
              فتح المنهج كاملاً والاشتراك المميز
            </h2>

            {selectedLockedNode && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                color: '#166534',
                padding: '6px 12px',
                borderRadius: '50px',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'inline-block',
                marginBottom: '14px'
              }}>
                مطلوب اشتراك لفتح: {selectedLockedNode.title}
              </div>
            )}

            <p style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, margin: '0 0 16px 0', lineHeight: 1.5 }}>
              لقد خضت تجربة مجانية رائعة! للاستمرار في فتح جميع الدروس وبنوك الأسئلة والمتابعة مع المستر إبراهيم عمار، يمكنك تفعيل الاشتراك الآن:
            </p>

            {/* Features List */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '14px',
              textAlign: 'right',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                <CheckCircle2 size={18} color="#059669" />
                <span>فتح جميع وحدات وفروع المنهج كاملاً (قراءة، نصوص، نحو، إملاء، بلاغة، تعبير)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                <CheckCircle2 size={18} color="#059669" />
                <span>استماع ونطق صوتي فصيح لكل كلمة في المنهج (Word-Tap TTS)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                <CheckCircle2 size={18} color="#059669" />
                <span>أكثر من 300 سؤال تدريبي واختبارات الشهور ونصف العام</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                <CheckCircle2 size={18} color="#059669" />
                <span>تقارير متابعة دورية لولي الأمر وشهادات تقدير معتمدة</span>
              </div>
            </div>

            {/* Direct WhatsApp CTA Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                color: 'white',
                textDecoration: 'none',
                padding: '14px 20px',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: '1rem',
                boxShadow: '0 8px 24px rgba(37, 211, 102, 0.35)',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                marginBottom: '10px'
              }}
            >
              <MessageCircle size={22} />
              <span>تفعيل الاشتراك عبر واتساب 💬</span>
            </a>

            <button
              onClick={() => setShowSubscriptionModal(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              متابعة التصفح المجاني
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          MYSTERY REWARD CHEST MODAL
      ══════════════════════════════ */}
      {activeChestModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '28px',
            padding: 'clamp(24px, 5vw, 36px)',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: '2px solid #fef08a',
            position: 'relative'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '12px', animation: 'bounce 1.5s infinite' }}>
              🎁
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#064e3b', margin: '0 0 8px 0' }}>
              مبارك! فتحت صندوق المكافآت 🎉
            </h2>

            <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 20px 0' }}>
              لقد أتممت هذا القسم بنجاح واجتهاد! إليك هديتك التشجيعية وسيتم فتح المحطات التالية لك فوراً:
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #fefce8, #fef08a)',
              border: '1.5px solid #facc15',
              borderRadius: '20px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div>
                <div style={{ fontSize: '1.8rem' }}>⚡</div>
                <div style={{ fontWeight: 900, color: '#854d0e', fontSize: '1.1rem' }}>+50 XP</div>
                <div style={{ fontSize: '0.75rem', color: '#a16207' }}>نقاط خبرة</div>
              </div>
              <div style={{ width: '1px', height: '40px', background: '#eab308' }} />
              <div>
                <div style={{ fontSize: '1.8rem' }}>🏅</div>
                <div style={{ fontWeight: 900, color: '#854d0e', fontSize: '1.1rem' }}>وسام بطل</div>
                <div style={{ fontSize: '0.75rem', color: '#a16207' }}>إنجاز الوحدة</div>
              </div>
            </div>

            <button
              onClick={handleClaimChest}
              disabled={claiming}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: 'white',
                border: 'none',
                padding: '14px 24px',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(5, 150, 105, 0.35)',
                transition: 'transform 0.2s ease'
              }}
            >
              {claiming ? 'جاري الاستلام...' : 'استلم المكافأة وافتح النشاط التالي 🚀'}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          INTERACTIVE MASCOT COMPANION ("شاطر")
      ══════════════════════════════ */}
      <div className="pm-mascot-container">
        {mascotBubble && mascotText && (
          <div className="pm-mascot-bubble">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
              <span>{mascotText}</span>
              <button
                onClick={() => setMascotBubble(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '2px',
                  lineHeight: 1
                }}
                title="إخفاء الرسالة"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <button
          className={`pm-mascot-btn ${mascotJumping ? 'jumping' : ''}`}
          onClick={handleMascotClick}
          title="اضغط على رفيقك شاطر للتشجيع والمكافآت!"
        >
          🦁
        </button>
      </div>

      {/* ══════════════════════════════
          STUDENT CERTIFICATE MODAL
      ══════════════════════════════ */}
      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        studentName={userProfile?.full_name || 'بطل المنصة المتميز'}
        subjectTitle={SUBJECT_LABELS[subject] || 'تأسيس اللغة العربية'}
        scoreOrXp={gamification.xp || 150}
        badgeName={subject === 'english' ? 'Star Explorer 🌟' : subject.startsWith('math') ? 'بطل الحساب والأرقام 🔢' : 'فارس الحروف والكلمات 👑'}
      />
    </div>
  )
}

export default function PathwayMap() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>جاري التحميل...</div>}>
      <PathwayMapContent />
    </Suspense>
  )
}
