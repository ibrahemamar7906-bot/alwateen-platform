'use client'

import { useState, useEffect, useRef } from 'react'
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

export default function PathwayMap() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subject = searchParams.get('subject') || 'arabic'

  // REDIRECT PREP AND SEC TO NEW GRID HUB LAYOUT
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

  const activeNodeRef = useRef(null)
  const pathData = pathways[subject] || pathways.arabic

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
    `السلام عليكم يا مستر إبراهيم، أنا الطالب (${userProfile?.full_name || 'ولي أمر'}) وحابب أشترك في منصة الوتين لتفعيل كامل دروس منهج (${SUBJECT_LABELS[subject] || 'اللغة العربية'}).`
  )
  const whatsappUrl = `https://wa.me/201507952002?text=${whatsappMessage}`
  
  const isCardLayout = subject.startsWith('prep') || subject.startsWith('sec')

  const renderCardLayout = () => (
    <div style={{
      minHeight: '100dvh',
      background: '#f8fafc',
      padding: 'clamp(14px, 3vw, 32px) clamp(12px, 3vw, 24px)',
      boxSizing: 'border-box',
      fontFamily: "'Tajawal', sans-serif",
      direction: 'rtl'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', background: 'white', padding: '15px 25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="pm-back-btn" onClick={() => {
            if (subject === 'arabic') router.push('/kids-corner/arabic');
            else if (subject === 'math' || subject === 'math_en') router.push('/kids-corner/math');
            else if (subject === 'english') router.push('/kids-corner/english');
            else router.push('/student-dashboard');
          }} style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={20} color="#334155" />
          </button>
          <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a', fontWeight: '900' }}>{SUBJECT_LABELS[subject] || 'المسار التعليمي'}</h1>
        </div>
        {/* Gamification Stats */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ background: '#fffbeb', color: '#d97706', padding: '8px 15px', borderRadius: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
            <Flame size={18} /> <span className="hide-mobile">{gamification.streak} أيام حماس</span>
          </div>
          <div style={{ background: '#ecfdf5', color: '#10b981', padding: '8px 15px', borderRadius: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
            <Zap size={18} /> <span className="hide-mobile">XP {gamification.xp}</span>
          </div>
        </div>
      </div>

      {/* Content: Vertical list of Unit Cards */}
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {unitsList.map((u, unitIndex) => {
          const unitNodes = pathData.filter(n => n.unit === u.unit && n.type !== 'unit_start');
          return (
            <div key={u.unit} id={`unit-anchor-${u.unit}`} style={{ background: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', paddingBottom: '15px', borderBottom: '2px solid #f1f5f9' }}>
                <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', width: '45px', height: '45px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0, boxShadow: '0 4px 10px rgba(5,150,105,0.3)' }}>
                  {unitIndex + 1}
                </div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a', fontWeight: '900' }}>{u.label}</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {unitNodes.map((node, indexInUnit) => {
                  const isChest = node.type === 'chest';
                  const chestId = `${subject}_chest_${node.id}`;
                  const prevNodeInUnit = indexInUnit > 0 ? unitNodes[indexInUnit - 1] : null;
                  
                  let isUnlocked = false;
                  let isPaidLocked = false;
                  if (userProfile?.role === 'admin' || ['teacher', 'teacher_pro'].includes(userProfile?.role)) {
                    isUnlocked = true;
                  } else if (node.unit === 1) {
                    isUnlocked = prevNodeInUnit ? (completedNodes.includes(prevNodeInUnit.id) || currentProgress > prevNodeInUnit.id) : true;
                  } else if (isSubscribed) {
                    isUnlocked = prevNodeInUnit ? (completedNodes.includes(prevNodeInUnit.id) || currentProgress > prevNodeInUnit.id) : true;
                  } else {
                    const isPrevDone = prevNodeInUnit ? (completedNodes.includes(prevNodeInUnit.id) || currentProgress > prevNodeInUnit.id) : true;
                    if (isPrevDone) isPaidLocked = true;
                  }

                  const isCompleted = completedNodes.includes(node.id) || currentProgress > node.id;
                  const isChestClaimed = gamification.claimedChests?.includes(chestId);
                  
                  if (isChest) {
                    isUnlocked = prevNodeInUnit ? (completedNodes.includes(prevNodeInUnit.id) || currentProgress > prevNodeInUnit.id) : false;
                    if (isChestClaimed) {
                      isUnlocked = true;
                    }
                  }

                  const isCurrent = isUnlocked && !isCompleted;

                  return (
                    <div 
                      key={node.id}
                      onClick={() => handleNodeClick(node, isUnlocked, isPaidLocked, prevNodeInUnit?.title)}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: isCurrent ? '#f0fdf4' : (isCompleted ? '#f8fafc' : '#ffffff'),
                        border: isCurrent ? '2px solid #10b981' : (isCompleted ? '2px solid #e2e8f0' : '2px dashed #cbd5e1'),
                        padding: '16px 20px',
                        borderRadius: '16px',
                        cursor: (isUnlocked || isPaidLocked) ? 'pointer' : 'not-allowed',
                        opacity: isUnlocked || isPaidLocked ? 1 : 0.6,
                        transition: 'all 0.2s ease',
                        transform: shakingNodeId === node.id ? 'translateX(5px)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ 
                          width: '50px', height: '50px', borderRadius: '50%', flexShrink: 0,
                          background: isChest ? '#fef3c7' : (isCompleted ? '#10b981' : (isCurrent ? '#ecfdf5' : '#f1f5f9')),
                          color: isChest ? '#d97706' : (isCompleted ? 'white' : (isCurrent ? '#059669' : '#94a3b8')),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.5rem',
                          boxShadow: isCurrent ? '0 0 15px rgba(16,185,129,0.3)' : 'none'
                        }}>
                          {isCompleted && !isChest ? <CheckCircle2 size={28} /> : (isPaidLocked ? <Lock size={24} /> : (isChest ? <Gift size={24}/> : node.icon))}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', color: isCompleted ? '#64748b' : '#0f172a', fontWeight: 'bold' }}>{node.title}</h3>
                          {isChest && <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#d97706', fontWeight: 'bold' }}>صندوق المكافآت!</p>}
                          {isCurrent && !isChest && <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#059669', fontWeight: 'bold' }}>أكمل من هنا 🚀</p>}
                          {isPaidLocked && <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#d97706', fontWeight: 'bold' }}>متاح للمشتركين فقط 🔒</p>}
                        </div>
                      </div>
                      
                      <div style={{ color: isCompleted ? '#10b981' : '#cbd5e1' }}>
                        {isCompleted ? <CheckCircle2 size={24} /> : (isUnlocked ? <ChevronLeft size={24} color={isCurrent ? '#10b981' : '#94a3b8'} /> : <Lock size={20} />)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        <style>{`
          .hide-mobile { display: inline; }
          @media (max-width: 600px) {
            .hide-mobile { display: none; }
          }
        `}</style>
      </div>
    </div>
  )

  return (
    <>
      {isCardLayout ? renderCardLayout() : (
        <div style={{
      minHeight: '100dvh',
      background: 'radial-gradient(circle at top right, rgba(5, 150, 105, 0.08) 0%, #f0fdf4 100%)',
      padding: 'clamp(14px, 3vw, 32px) clamp(12px, 3vw, 24px)',
      boxSizing: 'border-box',
      direction: 'rtl',
      fontFamily: 'Tajawal, sans-serif'
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

        .pm-back-btn {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(5, 150, 105, 0.2);
          color: #065f46;
          padding: 8px 16px;
          border-radius: 50px;
          font-weight: 800;
          font-size: clamp(0.85rem, 2.5vw, 0.95rem);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pm-back-btn:hover {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          border-color: transparent;
        }

        .pm-unit-pill {
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          border: 1px solid rgba(5, 150, 105, 0.15);
          background: white;
          color: #065f46;
          box-shadow: 0 2px 5px rgba(0,0,0,0.03);
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
          top: -34px;
          background: #064e3b;
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
          white-space: nowrap;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          animation: bounce 1.8s infinite ease-in-out;
          pointer-events: none;
          z-index: 10;
        }
        .pm-tooltip::after {
          content: '';
          position: absolute;
          bottom: -6px; left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #064e3b;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: '620px', margin: '0 auto', paddingBottom: '90px' }}>

        {/* ══════════════════════════════
            SMART GAMIFIED HEADER BAR
        ══════════════════════════════ */}
        <header style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: 'clamp(14px, 3vw, 20px)',
          marginBottom: 'clamp(24px, 4vw, 36px)',
          boxShadow: '0 10px 30px rgba(5, 150, 105, 0.08)',
          position: 'sticky',
          top: '12px',
          zIndex: 100
        }}>
          {/* Top Line: Back + Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap',
            paddingTop: '8px',
            borderTop: '1px solid rgba(5, 150, 105, 0.1)'
          }}>
            {/* Daily Streak */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
              border: '1px solid #fdba74',
              color: '#c2410c',
              padding: '6px 12px',
              borderRadius: '50px',
              fontWeight: 800,
              fontSize: '0.85rem',
              boxShadow: '0 2px 6px rgba(249, 115, 22, 0.1)'
            }}>
              <Flame size={18} color="#ea580c" />
              <span>{gamification.streak} {gamification.streak === 1 ? 'يوم حماس' : 'أيام حماس'}</span>
            </div>

            {/* XP Points */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '1px solid #86efac',
              color: '#15803d',
              padding: '6px 12px',
              borderRadius: '50px',
              fontWeight: 800,
              fontSize: '0.85rem',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.1)'
            }}>
              <Zap size={18} color="#16a34a" />
              <span>{gamification.xp} XP</span>
            </div>

            {/* Subscription Badge */}
            {isSubscribed ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                border: '1px solid #f59e0b',
                color: '#92400e',
                padding: '6px 12px',
                borderRadius: '50px',
                fontWeight: 900,
                fontSize: '0.82rem'
              }}>
                <Crown size={15} color="#d97706" />
                <span>اشتراك مفعل 🌟</span>
              </div>
            ) : (
              <button 
                onClick={() => setShowSubscriptionModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  border: 'none',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '50px',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(5, 150, 105, 0.3)'
                }}
              >
                <Crown size={15} />
                <span>تفعيل الاشتراك 👑</span>
              </button>
            )}

            {/* Total Completed */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              border: '1px solid #93c5fd',
              color: '#1d4ed8',
              padding: '6px 12px',
              borderRadius: '50px',
              fontWeight: 800,
              fontSize: '0.85rem',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.1)'
            }}>
              <Trophy size={18} color="#2563eb" />
              <span>{totalCompleted} مكتمل</span>
            </div>
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

            const offsetX = isUnitStart || isChest ? 0 : Math.sin(index * 1.5) * 65

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
      )}

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
              لقد خضت تجربة مجانية رائعة! للاستمرار في فتح جميع الدروس وبنوك الأسئلة والمتابعة مع مستر إبراهيم الوتين، يمكنك تفعيل الاشتراك الآن:
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
    </>
  )
}
