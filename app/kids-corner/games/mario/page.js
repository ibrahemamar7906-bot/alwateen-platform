'use client'

import { useState, useEffect, Suspense, useCallback, useRef } from 'react'
import { ArrowRight, Star, Trophy, RotateCcw, Volume2, VolumeX, Pause, Play, Heart, Settings } from 'lucide-react'
import { getEducationalQuestion } from '../../../utils/questionBank'
import { normalizeQuestion, normalizeQuestions, loadActiveCustomQuestions, saveActiveCustomQuestions } from '../../../utils/questionHelper'
import QuestionManagerModal from '../../../components/QuestionManagerModal'
import { updateStudentScore, logStudentMistake } from '../../../../utils/progress'
import { supabase } from '../../../../utils/supabase'
import confetti from 'canvas-confetti'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './page.module.css'
import Link from 'next/link'
import GameOverModal from '../../components/GameOverModal'

function MarioGameInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subject = searchParams.get('subject') || 'math' // 'math', 'arabic', 'english'
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [customQuestions, setCustomQuestions] = useState(() => loadActiveCustomQuestions())
  const [userId, setUserId] = useState(null)

  const [score, setScore] = useState(0)
  const initialLevel = parseInt(searchParams.get('level') || '1', 10)
  const [level, setLevel] = useState(isNaN(initialLevel) ? 1 : initialLevel)

  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)

  const audioCtxRef = useRef(null)

  const playSound = (type) => {
    if (typeof window === 'undefined') return
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
      
      if (type === 'correct') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(520, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(1040, ctx.currentTime + 0.12)
        gain.gain.setValueAtTime(0.4, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45)
        osc.start()
        osc.stop(ctx.currentTime + 0.45)
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(160, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.35)
        gain.gain.setValueAtTime(0.4, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
        osc.start()
        osc.stop(ctx.currentTime + 0.35)
      } else if (type === 'jump') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(320, ctx.currentTime)
        osc.frequency.linearRampToValueAtTime(640, ctx.currentTime + 0.12)
        gain.gain.setValueAtTime(0.25, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.22)
        osc.start()
        osc.stop(ctx.currentTime + 0.22)
      }
    } catch (e) {
      console.warn('Audio playback error:', e)
    }
  }

  const [streak, setStreak] = useState(0)
  
  // Game States: walking, ready, jumping, answering
  const [gameState, setGameState] = useState('walking') 
  // blockState: movingIn, stopped, hit, movingOut
  const [blockState, setBlockState] = useState('movingIn')
  const [showCoin, setShowCoin] = useState(false)
  
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  
  const [selectedOption, setSelectedOption] = useState(null)
  
  // Game Juice FX
  const [isShaking, setIsShaking] = useState(false)
  const [showFloatingScore, setShowFloatingScore] = useState(false)

  const timeoutsRef = useRef([])
  const addTimeout = (fn, delay) => {
    const id = setTimeout(fn, delay)
    timeoutsRef.current.push(id)
    return id
  }

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setUserId(user.id)
      } catch (e) {
        console.warn(e)
      }
    }
    fetchUser()
  }, [])

  const generateQuestion = useCallback((explicitQs = null) => {
    const activeQs = explicitQs !== null ? explicitQs : customQuestions
    if (activeQs && activeQs.length > 0) {
      const raw = activeQs[Math.floor(Math.random() * activeQs.length)]
      const normalized = normalizeQuestion(raw)
      if (normalized) {
        setCurrentQuestion(normalized)
        return normalized
      }
    }
    
    const q = getEducationalQuestion(subject, level)
    const normalized = normalizeQuestion(q)
    setCurrentQuestion(normalized)
    return normalized
  }, [customQuestions, subject, level])

  // Handle custom questions updates
  const handleUpdateQuestions = useCallback((newQs) => {
    const normalized = newQs && newQs.length > 0 ? normalizeQuestions(newQs) : null
    setCustomQuestions(normalized)
    generateQuestion(normalized)
  }, [generateQuestion])

  useEffect(() => {
    const handleCustomEvent = (e) => {
      handleUpdateQuestions(e.detail)
    }
    const handleStorageEvent = (e) => {
      if (e.key === 'active_live_custom_questions') {
        handleUpdateQuestions(loadActiveCustomQuestions())
      }
    }
    window.addEventListener('customQuestionsUpdated', handleCustomEvent)
    window.addEventListener('storage', handleStorageEvent)
    return () => {
      window.removeEventListener('customQuestionsUpdated', handleCustomEvent)
      window.removeEventListener('storage', handleStorageEvent)
    }
  }, [handleUpdateQuestions])

  // Manage block entrance
  useEffect(() => {
    if (gameState === 'walking' && blockState === 'movingIn') {
      const timer = setTimeout(() => {
        setBlockState('stopped')
        setGameState('ready')
      }, 1600)
      return () => clearTimeout(timer)
    }
  }, [gameState, blockState])

  const handleJump = useCallback(() => {
    if (gameState !== 'ready') return
    
    playSound('jump')
    setGameState('jumping')
    
    // At peak of jump (200ms)
    addTimeout(() => {
      setBlockState('hit')
      setShowCoin(true)
      
      // Mario falls down (after 200ms)
      addTimeout(() => {
        setGameState('answering')
        
        // Show question
        addTimeout(() => {
          setShowCoin(false)
          generateQuestion()
          setShowQuestion(true)
        }, 250)
        
      }, 200)
    }, 200)
  }, [gameState, generateQuestion])

  const handleAnswer = useCallback((option) => {
    if (!currentQuestion || selectedOption !== null) return
    setSelectedOption(option)
    const isCorrect = String(option).trim() === String(currentQuestion.answer).trim()
    
    if (isCorrect) {
      playSound('correct')
      setShowFloatingScore(true)
      const pointsEarned = 10 * level
      setScore(s => s + pointsEarned)
      setStreak(s => s + 1)
      
      if (userId) {
        updateStudentScore(userId, pointsEarned).catch(console.error)
      }
      
      if (streak + 1 >= 5 && level < 3) {
        setLevel(l => l + 1)
        setStreak(0)
        
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#3b82f6', '#ec4899', '#f59e0b']
          })
        } catch (e) {}
      }
      
      addTimeout(() => {
        setShowFloatingScore(false)
        setShowQuestion(false)
        setSelectedOption(null)
        
        // Move to next block
        setBlockState('movingOut')
        setGameState('walking')
        
        addTimeout(() => {
          setBlockState('movingIn')
        }, 800)
      }, 1200)

    } else {
      playSound('wrong')
      setIsShaking(true)
      setStreak(0)
      
      if (userId && currentQuestion) {
        logStudentMistake(userId, 'mario_math', `${currentQuestion.text} (Answered: ${option})`).catch(console.error)
      }
      
      setLives(prev => {
        const newLives = prev - 1
        if (newLives <= 0) {
          addTimeout(() => {
            setGameOver(true)
            setShowQuestion(false)
          }, 800)
        }
        return newLives
      })
      
      addTimeout(() => {
        setIsShaking(false)
        setSelectedOption(null)
      }, 500)
    }
  }, [currentQuestion, selectedOption, level, userId, streak])

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Space / Enter / ArrowUp to jump
      if (['Space', 'ArrowUp', 'KeyW', 'Enter'].includes(e.code) && !showQuestion && gameState === 'ready') {
        e.preventDefault()
        handleJump()
      }
      // 1, 2, 3, 4 to select options
      if (showQuestion && currentQuestion && currentQuestion.options) {
        const keyMap = { 'Digit1': 0, 'Numpad1': 0, 'Digit2': 1, 'Numpad2': 1, 'Digit3': 2, 'Numpad3': 2, 'Digit4': 3, 'Numpad4': 3 }
        if (e.code in keyMap) {
          const idx = keyMap[e.code]
          if (currentQuestion.options[idx] !== undefined) {
            e.preventDefault()
            handleAnswer(currentQuestion.options[idx])
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleJump, handleAnswer, showQuestion, currentQuestion, gameState])

  const backLink = subject === 'english' ? '/kids-corner/english' : (subject === 'arabic' ? '/kids-corner/arabic' : '/kids-corner/math')

  // Determine Mario CSS classes
  const isWalking = gameState === 'walking' || gameState === 'ready'
  const isJumping = gameState === 'jumping'
  const isScrolling = gameState === 'walking' || gameState === 'ready'

  return (
    <div className={styles.container}>
      <button className={styles.settingsBtn} onClick={() => setShowSettings(true)} title="إعداد الأسئلة">⚙️</button>
      
      {showSettings && (
        <QuestionManagerModal 
          customQuestions={customQuestions} 
          setCustomQuestions={handleUpdateQuestions} 
          onClose={() => setShowSettings(false)} 
        />
      )}
      
      {gameOver && (
        <GameOverModal 
          score={score} 
          gameName="mario" 
          subject={subject} 
          onRestart={() => {
            setScore(0)
            setLives(3)
            setGameOver(false)
            setLevel(1)
            setStreak(0)
          }} 
        />
      )}

      {/* Top UI */}
      <div className={styles.topBar}>
        <Link href={backLink} className={styles.backBtn}>
          <ArrowRight size={24} />
        </Link>
        <div className={styles.statsPanel}>
          <div className={styles.lives}>
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={24} fill={i < lives ? '#ef4444' : 'transparent'} color="#ef4444" />
            ))}
          </div>
          <div className={styles.scoreBoard}>
            <Star size={24} color="#fbbf24" fill="#fbbf24" />
            <span className={styles.scoreText}>{score}</span>
          </div>
          <div className={styles.levelBadge}>
            <Trophy size={18} color="#60a5fa" />
            <span>المستوى {level}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Game Area (Clicking triggers jump when ready) */}
      <div 
        className={`${styles.gameArea} ${isScrolling ? styles.scrolling : ''}`}
        onClick={() => {
          if (gameState === 'ready' && !showQuestion) {
            handleJump()
          }
        }}
      >
        <div className={styles.clouds}></div>
        
        {/* Block */}
        <div className={`${styles.block} ${styles[blockState]}`}>
          {blockState === 'hit' || blockState === 'movingOut' ? '' : '?'}
        </div>
        
        {/* Coin Animation */}
        {showCoin && (
          <div className={`${styles.coin} ${styles.animate}`}>
            <span className={`${styles.cssCoin} ${styles.cssCoinLarge}`}></span>
          </div>
        )}

        {/* Shadow */}
        <div className={`${styles.characterShadow} ${isJumping ? styles.jumping : ''}`}></div>

        {/* Mario Pure CSS Sprite */}
        <div className={`${styles.mario} ${isWalking ? styles.walking : ''} ${isJumping ? styles.jumping : ''} ${gameState === 'answering' ? styles.idle : ''}`}>
          <div className={styles.head}>
            <div className={styles.hat}></div>
            <div className={styles.eye}></div>
            <div className={styles.mustache}></div>
          </div>
          <div className={styles.body}></div>
          <div className={`${styles.arm} ${styles.right}`}></div>
          <div className={`${styles.leg} ${styles.right}`}></div>
          <div className={`${styles.leg} ${styles.left}`}></div>
          <div className={`${styles.arm} ${styles.left}`}></div>
        </div>
      </div>

      {/* Floating score text */}
      {showFloatingScore && <div className={styles.floatingScore}>+{10 * level}</div>}

      {/* Action Controls */}
      {!showQuestion && (
        <div className={styles.controls}>
          <button 
            className={styles.jumpBtn} 
            onClick={(e) => {
              e.stopPropagation()
              handleJump()
            }}
            disabled={gameState !== 'ready'}
          >
            {gameState === 'walking' ? (subject === 'english' ? 'Wait..' : 'انتظر..') : (subject === 'english' ? 'JUMP!' : 'اقفز!')}
          </button>
        </div>
      )}

      {/* Question Overlay */}
      {showQuestion && currentQuestion && (
        <div className={styles.questionOverlay}>
          <div className={`${styles.questionCard} ${isShaking ? styles.shake : ''}`}>
            <div className={styles.questionText}>
              {currentQuestion.text}
            </div>
            <div className={styles.optionsGrid}>
              {currentQuestion.options.map((opt, idx) => {
                let btnClass = styles.optionBtn
                if (selectedOption !== null) {
                  if (String(opt).trim() === String(selectedOption).trim() && String(opt).trim() !== String(currentQuestion.answer).trim()) {
                    btnClass += ` ${styles.wrong}`
                  } else if (String(opt).trim() === String(currentQuestion.answer).trim()) {
                    btnClass += ` ${styles.correct}`
                  }
                }
                
                return (
                  <button 
                    key={idx} 
                    className={btnClass}
                    onClick={() => selectedOption === null && handleAnswer(opt)}
                    disabled={selectedOption !== null}
                  >
                    <span className={styles.optionNum}>{idx + 1}</span>
                    <span className={styles.optionLabel}>{opt}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MarioMathGame() {
  return (
    <Suspense fallback={<div style={{padding: '50px', textAlign: 'center', color: '#fff'}}>جاري تحميل اللعبة...</div>}>
      <MarioGameInner />
    </Suspense>
  )
}
