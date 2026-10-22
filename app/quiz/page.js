'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { supabase } from '../../utils/supabase'
import { useSearchParams } from 'next/navigation'
import { Clock, CheckCircle, AlertCircle, AlertTriangle, ShieldAlert, Trophy, Star, FileText, Palette } from 'lucide-react'
import confetti from 'canvas-confetti'

const THEMES = {
  modern: {
    name: 'أزرق عصري',
    bg: '#f1f5f9',
    cardBg: '#fff',
    text: '#0f172a',
    primary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    primaryShadow: '0 4px 10px rgba(37,99,235,0.3)',
    secondaryText: '#64748b',
    borderColor: '#e2e8f0',
    headerBg: 'rgba(255, 255, 255, 0.9)',
    optionBg: '#f8fafc',
    optionSelectedBg: '#eff6ff',
    optionSelectedBorder: '#3b82f6',
    optionSelectedText: '#1e40af',
    accentColor: '#3b82f6'
  },
  dark: {
    name: 'مظلم (Dark)',
    bg: '#0f172a',
    cardBg: '#1e293b',
    text: '#f8fafc',
    primary: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    primaryShadow: '0 4px 15px rgba(139, 92, 246, 0.5)',
    secondaryText: '#94a3b8',
    borderColor: '#334155',
    headerBg: 'rgba(30, 41, 59, 0.9)',
    optionBg: '#0f172a',
    optionSelectedBg: '#2e1065',
    optionSelectedBorder: '#a855f7',
    optionSelectedText: '#e9d5ff',
    accentColor: '#a855f7'
  },
  elegant: {
    name: 'ذهبي أنيق',
    bg: '#fafaf9',
    cardBg: '#fff',
    text: '#44403c',
    primary: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    primaryShadow: '0 4px 10px rgba(217, 119, 6, 0.3)',
    secondaryText: '#78716c',
    borderColor: '#e7e5e4',
    headerBg: 'rgba(255, 255, 255, 0.95)',
    optionBg: '#fafaf9',
    optionSelectedBg: '#fef3c7',
    optionSelectedBorder: '#d97706',
    optionSelectedText: '#92400e',
    accentColor: '#d97706'
  }
}

function QuizContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [status, setStatus] = useState('loading') // loading, pending, active, closed, finished, blocked
  const [errorMsg, setErrorMsg] = useState('')
  
  const [studentName, setStudentName] = useState('')
  const [hasStarted, setHasStarted] = useState(false)
  
  const [answers, setAnswers] = useState({}) // { questionId: 'Selected Option' }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [score, setScore] = useState(0)
  
  const [warnings, setWarnings] = useState(0)
  const [showWarningModal, setShowWarningModal] = useState(false)
  
  const [leaderboard, setLeaderboard] = useState([])
  
  const [currentTheme, setCurrentTheme] = useState('modern')
  const t = THEMES[currentTheme]

  const [countdownText, setCountdownText] = useState('')
  const [remainingTimeText, setRemainingTimeText] = useState('')
  
  // Ref to hold latest state for event listeners
  const stateRef = useRef({ hasStarted: false, status: 'loading', answers: {}, questions: [], studentName: '' })
  
  useEffect(() => {
    stateRef.current = { hasStarted, status, answers, questions, studentName }
  }, [hasStarted, status, answers, questions, studentName])

  useEffect(() => {
    if (!id) {
      setStatus('error')
      setErrorMsg('رابط الاختبار غير صحيح.')
      return
    }

    if (localStorage.getItem(`aljunaidi_quiz_${id}`)) {
      setStatus('blocked')
    } else {
      fetchQuizData()
    }
  }, [id])

  // Timer for pending quiz: counts down until start time and auto-unlocks
  useEffect(() => {
    if (status !== 'pending' || !quiz?.start_time) return

    const checkPendingTimer = () => {
      const now = new Date()
      const start = new Date(quiz.start_time)
      const diff = start - now

      if (diff <= 0) {
        setCountdownText('')
        fetchQuizData()
      } else {
        const totalSecs = Math.floor(diff / 1000)
        const days = Math.floor(totalSecs / 86400)
        const hours = Math.floor((totalSecs % 86400) / 3600)
        const minutes = Math.floor((totalSecs % 3600) / 60)
        const seconds = totalSecs % 60

        let str = ''
        if (days > 0) str += `${days} يوم و `
        if (hours > 0) str += `${hours} ساعة و `
        str += `${minutes} دقيقة و ${seconds} ثانية`
        setCountdownText(str)
      }
    }

    checkPendingTimer()
    const interval = setInterval(checkPendingTimer, 1000)
    return () => clearInterval(interval)
  }, [status, quiz?.start_time])

  // Timer for active quiz: counts down remaining time and auto-submits when expired
  useEffect(() => {
    if (status !== 'active' || !quiz?.end_time) return

    const checkActiveTimer = () => {
      const now = new Date()
      const end = new Date(quiz.end_time)
      const diff = end - now

      if (diff <= 0) {
        setRemainingTimeText('00:00')
        const current = stateRef.current
        if (current.hasStarted && current.status === 'active') {
          forceSubmit(current, 'time_out')
        } else {
          setStatus('closed')
        }
      } else {
        const totalSecs = Math.floor(diff / 1000)
        const hours = Math.floor(totalSecs / 3600)
        const minutes = Math.floor((totalSecs % 3600) / 60)
        const seconds = totalSecs % 60
        const pad = (n) => String(n).padStart(2, '0')

        if (hours > 0) {
          setRemainingTimeText(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`)
        } else {
          setRemainingTimeText(`${pad(minutes)}:${pad(seconds)}`)
        }
      }
    }

    checkActiveTimer()
    const interval = setInterval(checkActiveTimer, 1000)
    return () => clearInterval(interval)
  }, [status, quiz?.end_time])
  
  // Anti-Cheat System
  useEffect(() => {
    const handleVisibilityChange = () => {
      const current = stateRef.current
      if (document.hidden && current.hasStarted && current.status === 'active') {
        setWarnings(prev => {
          if (prev >= 1) {
            forceSubmit(current, 'cheating')
            return prev + 1
          } else {
            setShowWarningModal(true)
            return prev + 1
          }
        })
      }
    }
    
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  const forceSubmit = async (current, reason = 'cheating') => {
    if (current.status !== 'active') return;
    setStatus('finished') 
    if (reason === 'time_out') {
      alert('انتهى الوقت المحدد للاختبار! تم تسليم إجاباتك تلقائياً.')
    } else {
      alert('تم سحب ورقة الاختبار بسبب تكرار مخالفة قوانين المراقبة والخروج من الصفحة.')
    }
    
    let calculatedScore = 0
    current.questions.forEach(q => {
      if (current.answers[q.id] === q.correct_answer) {
        calculatedScore++
      }
    })
    setScore(calculatedScore)
    setAnswers(current.answers)
    
    await saveSubmission(current.studentName, calculatedScore, current.answers, current.questions.length)
  }

  const fetchQuizData = async () => {
    const { data: quizData, error: quizError } = await supabase.from('quizzes').select('*').eq('id', id).single()
    if (quizError || !quizData) {
      setStatus('error')
      setErrorMsg('الاختبار غير موجود أو تم حذفه.')
      return
    }
    
    setQuiz(quizData)
    
    const now = new Date()
    const start = new Date(quizData.start_time)
    const end = new Date(quizData.end_time)
    
    if (now < start) {
      setStatus('pending')
      return
    } else if (now > end) {
      setStatus('closed')
      return
    }
    
    const { data: questionsData } = await supabase.from('quiz_questions').select('*').eq('quiz_id', id)
    if (questionsData) {
      setQuestions(questionsData)
      setStatus('active')
    }
  }

  const startQuiz = (e) => {
    e.preventDefault()
    if (!studentName.trim()) {
      alert('يرجى كتابة اسمك أولاً')
      return
    }
    
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => console.log(err))
    }
    
    setHasStarted(true)
  }

  const handleSelectOption = (qId, option) => {
    setAnswers(prev => ({ ...prev, [qId]: option }))
  }

  const saveSubmission = async (name, calculatedScore, currentAnswers, totalQs) => {
    localStorage.setItem(`aljunaidi_quiz_${id}`, 'submitted')
    
    let userProfile = null
    try {
      const stored = localStorage.getItem('aljunaidi_userProfile')
      if (stored) userProfile = JSON.parse(stored)
    } catch(e) {}
    
    const { data, error } = await supabase.from('quiz_submissions').insert([{
      quiz_id: id,
      student_name: name,
      score: calculatedScore,
      total_questions: totalQs,
      answers: currentAnswers,
      
    }])

    if (!error) {
      fetchLeaderboard()
    } else {
      console.error("Failed to submit score", error)
    }
    
    fireConfetti()
  }

  const submitQuiz = async (isForced = false) => {
    if (!isForced && Object.keys(answers).length < questions.length) {
      if (!confirm('لم تقم بالإجابة على جميع الأسئلة. هل أنت متأكد من التسليم الآن؟')) return
    }
    
    setIsSubmitting(true)
    let calculatedScore = 0
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        calculatedScore++
      }
    })
    setScore(calculatedScore)
    
    await saveSubmission(studentName, calculatedScore, answers, questions.length)
    
    setStatus('finished')
    setIsSubmitting(false)
  }
  
  const fetchLeaderboard = async () => {
    const { data } = await supabase.from('quiz_submissions').select('student_name, score, total_questions').eq('quiz_id', id).order('score', { ascending: false }).limit(5)
    if (data) setLeaderboard(data)
  }

  const fireConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  }

  // --- Theme Switcher Component ---
  const ThemeSwitcher = () => (
    <div style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 99, background: t.cardBg, padding: '10px', borderRadius: '50px', display: 'flex', gap: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: `1px solid ${t.borderColor}` }}>
      <Palette color={t.text} size={20} style={{ margin: 'auto 5px' }} />
      {Object.keys(THEMES).map(themeKey => (
        <button 
          key={themeKey}
          onClick={() => setCurrentTheme(themeKey)}
          style={{ 
            background: currentTheme === themeKey ? t.primary : 'transparent', 
            color: currentTheme === themeKey ? '#fff' : t.secondaryText, 
            border: 'none', 
            padding: '8px 15px', 
            borderRadius: '30px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
        >
          {THEMES[themeKey].name}
        </button>
      ))}
    </div>
  )

  // --- Rendering States ---

  if (status === 'loading') {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Tajawal', background: t.bg }}>
      <h2 style={{ color: t.accentColor, animation: 'pulse 2s infinite' }}>جاري تحضير الاختبار...</h2>
    </div>
  }
  
  if (status === 'error') {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Tajawal', background: '#fef2f2', color: '#ef4444' }}><h2>{errorMsg}</h2></div>
  }
  
  if (status === 'blocked') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Tajawal', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' }}>
        <ShieldAlert size={80} color="#ef4444" style={{ marginBottom: '20px' }} />
        <h2 style={{ color: '#991b1b', fontSize: '2rem', marginBottom: '10px' }}>غير مصرح بالدخول!</h2>
        <p style={{ color: '#b91c1c', fontSize: '1.2rem', textAlign: 'center', maxWidth: '500px' }}>
          لقد قمت بإجراء هذا الاختبار مسبقاً من هذا الجهاز.<br/>لا يُسمح بإعادة الاختبار مرة أخرى لضمان تكافؤ الفرص.
        </p>
      </div>
    )
  }
  
  if (status === 'pending') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Tajawal', background: t.bg, color: t.text, padding: '20px', textAlign: 'center' }}>
        <Clock size={80} color={t.accentColor} style={{ marginBottom: '20px', animation: 'bounce 2s infinite' }} />
        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>الاختبار لم يبدأ بعد!</h2>
        <p style={{ color: t.secondaryText, fontSize: '1.3rem', marginBottom: '15px' }}>
          موعد بدء الاختبار: <span dir="ltr" style={{ fontWeight: 'bold', color: t.text }}>{new Date(quiz.start_time).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</span>
        </p>
        {countdownText && (
          <div style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid #eab308', color: '#ca8a04', padding: '12px 24px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '10px' }}>
            ⏳ يبدأ تلقائياً خلال: {countdownText}
          </div>
        )}
      </div>
    )
  }
  
  if (status === 'closed') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Tajawal', background: t.bg, color: t.text, padding: '20px', textAlign: 'center' }}>
        <AlertTriangle size={80} color="#ef4444" style={{ marginBottom: '20px' }} />
        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>عفواً، لقد انتهى وقت الاختبار!</h2>
        <p style={{ color: t.secondaryText, fontSize: '1.3rem' }}>
          تم إغلاق الاختبار في: <span dir="ltr" style={{ fontWeight: 'bold' }}>{new Date(quiz.end_time).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</span>
        </p>
      </div>
    )
  }

  if (status === 'finished') {
    return (
      <div style={{ background: t.bg, minHeight: '100vh', padding: '40px 20px', fontFamily: 'Tajawal', direction: 'rtl', transition: 'background 0.5s' }}>
        <ThemeSwitcher />
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Result Card */}
          <div style={{ background: t.cardBg, borderRadius: '24px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center', marginBottom: '40px', border: `2px solid ${t.borderColor}` }}>
            <CheckCircle size={80} color="#10b981" style={{ margin: '0 auto 20px' }} />
            <h1 style={{ color: t.text, marginBottom: '15px', fontSize: '2.5rem' }}>تم تسليم إجاباتك بنجاح، بطلنا {studentName}! 🏆</h1>
            <div style={{ fontSize: '3rem', fontWeight: '900', color: '#10b981', margin: '20px 0', textShadow: '0 2px 10px rgba(16, 185, 129, 0.2)' }}>
              النتيجة: {score} <span style={{ fontSize: '2rem', color: t.secondaryText }}>/</span> {questions.length}
            </div>
            {warnings > 0 && <p style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ تم تسجيل محاولات خروج من الصفحة أثناء الاختبار.</p>}
          </div>

          {/* Leaderboard Section */}
          {leaderboard.length > 0 && (
            <div style={{ background: t.cardBg, borderRadius: '20px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '40px', border: `1px solid ${t.borderColor}` }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: t.text, marginBottom: '20px', fontSize: '1.8rem' }}>
                <Trophy color="#eab308" size={32} /> لوحة الشرف (أوائل الاختبار)
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {leaderboard.map((lb, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: idx === 0 ? 'linear-gradient(90deg, #fef9c3 0%, #fff 100%)' : t.optionBg, padding: '15px 25px', borderRadius: '12px', border: idx === 0 ? '2px solid #fde047' : `1px solid ${t.borderColor}`, transition: 'transform 0.2s', ':hover': { transform: 'scale(1.02)' } }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: idx === 0 ? '#ca8a04' : t.secondaryText }}>#{idx + 1}</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: idx === 0 ? '#334155' : t.text }}>{lb.student_name}</span>
                      {idx === 0 && <Star fill="#eab308" color="#eab308" size={20} />}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0ea5e9', background: '#e0f2fe', padding: '5px 15px', borderRadius: '20px' }}>
                      {lb.score} / {lb.total_questions}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Section */}
          <h3 style={{ marginBottom: '20px', color: t.text, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText color={t.accentColor} /> المراجعة التفصيلية لإجاباتك:
          </h3>
          
          {questions.map((q, index) => {
            const studentAnswer = answers[q.id]
            const isCorrect = studentAnswer === q.correct_answer
            
            return (
              <div key={q.id} style={{ background: t.cardBg, padding: '30px', borderRadius: '20px', marginBottom: '25px', boxShadow: '0 8px 20px rgba(0,0,0,0.03)', border: `2px solid ${isCorrect ? '#10b981' : '#ef4444'}`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, background: isCorrect ? '#10b981' : '#ef4444', color: 'white', padding: '5px 20px', borderBottomLeftRadius: '15px', fontWeight: 'bold' }}>
                  {isCorrect ? 'إجابة صحيحة ✓' : 'إجابة خاطئة ✗'}
                </div>
                
                <h4 style={{ margin: '20px 0 25px 0', fontSize: '1.3rem', color: t.text, lineHeight: '1.6' }}>{index + 1}. {q.question_text}</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  {q.options.map((opt, i) => {
                    let bgColor = t.optionBg
                    let borderColor = t.borderColor
                    let color = t.secondaryText
                    
                    if (opt === q.correct_answer) {
                      bgColor = 'rgba(16, 185, 129, 0.1)'
                      borderColor = '#10b981'
                      color = '#10b981'
                    } else if (opt === studentAnswer && !isCorrect) {
                      bgColor = 'rgba(239, 68, 68, 0.1)'
                      borderColor = '#ef4444'
                      color = '#ef4444'
                    }
                    
                    return (
                      <div key={i} style={{ padding: '15px 20px', borderRadius: '12px', background: bgColor, border: `2px solid ${borderColor}`, color: color, display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {opt} {opt === studentAnswer && ' (إجابتك)'} {opt === q.correct_answer && ' ✓'}
                      </div>
                    )
                  })}
                </div>
                
                {q.explanation && (
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '12px', color: '#3b82f6', borderRight: '5px solid #3b82f6', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>💡 السبب العلمي:</strong> {q.explanation}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // --- Active Quiz State ---
  return (
    <div style={{ background: t.bg, minHeight: '100vh', fontFamily: 'Tajawal', direction: 'rtl', transition: 'background 0.5s' }}>
      
      <ThemeSwitcher />

      {/* Warning Modal */}
      {showWarningModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(239, 68, 68, 0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <ShieldAlert size={100} color="white" style={{ marginBottom: '20px', animation: 'pulse 1s infinite' }} />
          <h1 style={{ color: 'white', fontSize: '3rem', marginBottom: '20px', textAlign: 'center' }}>تحذير شديد اللهجة!</h1>
          <p style={{ color: 'white', fontSize: '1.5rem', textAlign: 'center', maxWidth: '600px', lineHeight: '1.6', marginBottom: '40px' }}>
            لقد قمت بفتح نافذة أخرى أو الخروج من صفحة الاختبار. هذا يعتبر مخالفة لقوانين المراقبة. 
            <br/><br/>
            في حال تكرار ذلك مرة أخرى سيتم سحب ورقة الاختبار وتسليمها تلقائياً بالدرجة الحالية (صفر)!
          </p>
          <button onClick={() => setShowWarningModal(false)} style={{ background: 'white', color: '#ef4444', border: 'none', padding: '15px 40px', fontSize: '1.5rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
            أتعهد بعدم تكرار ذلك، والعودة للاختبار
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ background: t.headerBg, backdropFilter: 'blur(10px)', borderBottom: `1px solid ${t.borderColor}`, padding: '15px 30px', position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'all 0.5s' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: t.text, fontWeight: '900' }}>{quiz.title}</h2>
          {hasStarted && <p style={{ margin: '5px 0 0 0', fontSize: '1rem', color: t.accentColor, fontWeight: 'bold' }}>الطالب: {studentName}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '8px 15px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.05rem' }}>
          <Clock size={20} />
          {remainingTimeText ? (
            <span>الوقت المتبقي: <strong dir="ltr" style={{ color: '#dc2626' }}>{remainingTimeText}</strong> <span style={{ fontSize: '0.85rem', color: '#64748b' }}>(يُغلق: {new Date(quiz.end_time).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})})</span></span>
          ) : (
            <span>يُغلق في: <span dir="ltr">{new Date(quiz.end_time).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}</span></span>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        {!hasStarted ? (
          <div style={{ background: t.cardBg, padding: '50px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', textAlign: 'center', border: `1px solid ${t.borderColor}`, transition: 'all 0.5s' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 30px' }}>
              <FileText size={50} color={t.accentColor} />
            </div>
            <h1 style={{ marginBottom: '15px', color: t.text, fontSize: '2.2rem' }}>مرحباً بك في الاختبار</h1>
            <p style={{ color: t.secondaryText, marginBottom: '40px', fontSize: '1.2rem' }}>يرجى كتابة اسمك الثلاثي للبدء. بمجرد البدء لا تقم بالخروج من الصفحة وإلا سيتم سحب الاختبار.</p>
            
            <form onSubmit={startQuiz}>
              <input 
                type="text" 
                placeholder="أدخل اسمك الثلاثي هنا..." 
                required
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                style={{ width: '100%', maxWidth: '400px', padding: '18px 25px', fontSize: '1.2rem', borderRadius: '12px', border: `2px solid ${t.borderColor}`, marginBottom: '30px', textAlign: 'center', outline: 'none', transition: 'border-color 0.3s', background: t.bg, color: t.text }}
                onFocus={e => e.target.style.borderColor = t.accentColor}
                onBlur={e => e.target.style.borderColor = t.borderColor}
              />
              <br />
              <button type="submit" style={{ background: t.primary, color: '#fff', border: 'none', padding: '18px 60px', fontSize: '1.3rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', boxShadow: t.primaryShadow, transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>
                ابدأ الاختبار الآن 🚀
              </button>
            </form>
          </div>
        ) : (
          <div>
            {questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px', background: t.cardBg, color: t.text, borderRadius: '12px', border: `1px solid ${t.borderColor}` }}>
                لا توجد أسئلة في هذا الاختبار بعد.
              </div>
            ) : (
              <div>
                {/* Progress Bar */}
                <div style={{ background: t.cardBg, padding: '15px 25px', borderRadius: '15px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: `1px solid ${t.borderColor}`, transition: 'all 0.5s' }}>
                  <div style={{ flex: 1, background: t.borderColor, height: '10px', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%`, background: '#10b981', height: '100%', transition: 'width 0.3s ease-out' }}></div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: t.secondaryText, fontSize: '1.1rem' }}>
                    تمت الإجابة: {Object.keys(answers).length} من {questions.length}
                  </div>
                </div>

                {questions.map((q, index) => {
                  const isAnswered = answers[q.id] !== undefined
                  return (
                    <div key={q.id} style={{ background: t.cardBg, padding: '35px', borderRadius: '24px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: isAnswered ? `2px solid ${t.accentColor}` : `2px solid ${t.borderColor}`, transition: 'all 0.3s' }}>
                      <h3 style={{ margin: '0 0 25px 0', color: t.text, lineHeight: '1.6', fontSize: '1.4rem', display: 'flex', gap: '15px' }}>
                        <span style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', background: t.primary, color: 'white', minWidth: '35px', height: '35px', borderRadius: '50%', fontSize: '1.1rem', fontWeight: 'bold', flexShrink: 0, boxShadow: t.primaryShadow }}>{index + 1}</span>
                        {q.question_text}
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {q.options.map((opt, i) => {
                          const isSelected = answers[q.id] === opt
                          return (
                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', background: isSelected ? t.optionSelectedBg : t.optionBg, border: `2px solid ${isSelected ? t.optionSelectedBorder : t.borderColor}`, borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', transform: isSelected ? 'scale(1.01)' : 'scale(1)', boxShadow: isSelected ? `0 4px 15px ${t.optionSelectedBg}` : 'none' }}>
                              <input 
                                type="radio" 
                                name={`question-${q.id}`} 
                                value={opt} 
                                checked={isSelected}
                                onChange={() => handleSelectOption(q.id, opt)}
                                style={{ width: '22px', height: '22px', accentColor: t.accentColor, cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '1.2rem', color: isSelected ? t.optionSelectedText : t.text, fontWeight: isSelected ? 'bold' : 'normal' }}>{opt}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                
                <div style={{ textAlign: 'center', marginTop: '50px', marginBottom: '100px' }}>
                  <button 
                    onClick={() => submitQuiz(false)}
                    disabled={isSubmitting}
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #16a34a 100%)', color: '#fff', border: 'none', padding: '20px 80px', fontSize: '1.5rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(22, 163, 74, 0.4)', transition: 'transform 0.2s', opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    {isSubmitting ? 'جاري التسليم...' : 'تسليم الاختبار ✔️'}
                  </button>
                  <p style={{ marginTop: '15px', color: t.secondaryText, fontSize: '1.1rem' }}>تأكد من مراجعة كل الإجابات قبل التسليم.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Tajawal' }}>جاري التحميل...</div>}>
      <QuizContent />
    </Suspense>
  )
}
