'use client'

import { useState, useEffect, Suspense, useCallback, useRef } from 'react'
import { ArrowLeft, Swords, Target, Crosshair, Users, Bot, Crown, Settings, RotateCcw } from 'lucide-react'
import { getEducationalQuestion } from '../../../utils/questionBank'
import { normalizeQuestion, normalizeQuestions, loadActiveCustomQuestions, saveActiveCustomQuestions } from '../../../utils/questionHelper'
import QuestionManagerModal from '../../../components/QuestionManagerModal'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'
import GameOverModal from '../../components/GameOverModal'

function TankGameInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subject = searchParams.get('subject') || 'math'
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [customQuestions, setCustomQuestions] = useState(() => loadActiveCustomQuestions())

  // Game Mode: '2p' (Two Players) or '1p_ai' (Single Player vs AI)
  const [gameMode, setGameMode] = useState('1p_ai')

  // Game States
  const [healthP1, setHealthP1] = useState(100) // P1 (Right Side - Blue)
  const [healthP2, setHealthP2] = useState(100) // P2 / AI (Left Side - Red)
  
  const [qP1, setQP1] = useState(null)
  const [qP2, setQP2] = useState(null)

  // FX States
  const [p1Firing, setP1Firing] = useState(false)
  const [p2Firing, setP2Firing] = useState(false)
  const [p1Miss, setP1Miss] = useState(false)
  const [p2Miss, setP2Miss] = useState(false)
  
  const [explosionP1, setExplosionP1] = useState(false)
  const [explosionP2, setExplosionP2] = useState(false)
  const [shake, setShake] = useState(false)
  
  const [gameOver, setGameOver] = useState(null)

  const audioCtxRef = useRef(null)
  const timeoutsRef = useRef([])

  const addTimeout = (fn, delay) => {
    const id = setTimeout(fn, delay)
    timeoutsRef.current.push(id)
    return id
  }

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  useEffect(() => {
    return () => clearAllTimeouts()
  }, [])

  const generateSingleQuestion = useCallback((explicitQs = null) => {
    const activeQs = explicitQs !== null ? explicitQs : customQuestions
    if (activeQs && activeQs.length > 0) {
      const selected = activeQs[Math.floor(Math.random() * activeQs.length)]
      const normalized = normalizeQuestion(selected)
      if (normalized) {
        return { text: normalized.text, answer: normalized.answer, options: normalized.options, status: null }
      }
    }
    const q = getEducationalQuestion(subject, 1)
    const normalized = normalizeQuestion(q)
    return { text: normalized.text, answer: normalized.answer, options: normalized.options, status: null }
  }, [customQuestions, subject])

  const generateQuestion = useCallback((player, explicitQs = null) => {
    const questionObj = generateSingleQuestion(explicitQs)
    if (player === 1) setQP1(questionObj)
    else setQP2(questionObj)
    return questionObj
  }, [generateSingleQuestion])

  useEffect(() => {
    generateQuestion(1)
    generateQuestion(2)
  }, [generateQuestion])

  // Handle custom questions updates
  const handleUpdateQuestions = useCallback((newQs) => {
    const normalized = newQs && newQs.length > 0 ? normalizeQuestions(newQs) : null
    setCustomQuestions(normalized)
    generateQuestion(1, normalized)
    generateQuestion(2, normalized)
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
        osc.frequency.setValueAtTime(500, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(0.4, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
        osc.start()
        osc.stop(ctx.currentTime + 0.4)
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(150, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.35)
        gain.gain.setValueAtTime(0.4, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
        osc.start()
        osc.stop(ctx.currentTime + 0.35)
      } else if (type === 'shoot') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'square'
        osc.frequency.setValueAtTime(120, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.2)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
        osc.start()
        osc.stop(ctx.currentTime + 0.2)
      }
    } catch (e) {
      console.warn('Audio playback error:', e)
    }
  }

  const handleAnswer = useCallback((player, selected) => {
    if (gameOver) return

    const q = player === 1 ? qP1 : qP2
    if (!q) return

    const isCorrect = String(selected).trim() === String(q.answer).trim()

    if (isCorrect) {
      playSound('correct')
      if (player === 1) {
        playSound('shoot')
        setP1Firing(true)
        generateQuestion(1)
        
        addTimeout(() => {
          setP1Firing(false)
          setExplosionP1(true) // Explodes P2
          setShake(true)
          setHealthP2(h => {
            const newH = Math.max(0, h - 20)
            if (newH === 0) {
              setGameOver(subject === 'english' ? 'Blue Tank Wins! 🏆' : 'اللاعب الأزرق هو الفائز! 🏆')
            }
            return newH
          })
          
          addTimeout(() => {
            setExplosionP1(false)
            setShake(false)
          }, 450)
        }, 350) 
      } else {
        playSound('shoot')
        setP2Firing(true)
        generateQuestion(2)
        
        addTimeout(() => {
          setP2Firing(false)
          setExplosionP2(true) // Explodes P1
          setShake(true)
          setHealthP1(h => {
            const newH = Math.max(0, h - 20)
            if (newH === 0) {
              setGameOver(gameMode === '1p_ai' ? (subject === 'english' ? 'Robot Won! 🤖' : 'الروبوت هو الفائز! 🤖') : (subject === 'english' ? 'Red Tank Wins! 🏆' : 'اللاعب الأحمر هو الفائز! 🏆'))
            }
            return newH
          })
          
          addTimeout(() => {
            setExplosionP2(false)
            setShake(false)
          }, 450)
        }, 350)
      }
    } else {
      playSound('wrong')
      playSound('shoot')
      if (player === 1) {
        setQP1(prev => ({...prev, status: 'wrong'}))
        setP1Miss(true)
        
        addTimeout(() => {
          setQP1(prev => ({...prev, status: null}))
          setP1Miss(false)
        }, 450)
      } else {
        setQP2(prev => ({...prev, status: 'wrong'}))
        setP2Miss(true)
        
        addTimeout(() => {
          setQP2(prev => ({...prev, status: null}))
          setP2Miss(false)
        }, 450)
      }
    }
  }, [gameOver, qP1, qP2, generateQuestion, subject, gameMode])

  // AI Opponent Loop for 1-Player mode
  useEffect(() => {
    if (gameMode !== '1p_ai' || gameOver || !qP2) return

    const aiDelay = Math.floor(Math.random() * 2500) + 3000 // 3s to 5.5s
    const timer = setTimeout(() => {
      if (gameOver || !qP2) return
      // 75% chance correct, 25% wrong
      const isCorrect = Math.random() < 0.75
      let chosen = qP2.answer
      if (!isCorrect && qP2.options && qP2.options.length > 1) {
        const wrongOpts = qP2.options.filter(o => String(o).trim() !== String(qP2.answer).trim())
        chosen = wrongOpts[Math.floor(Math.random() * wrongOpts.length)] || qP2.answer
      }
      handleAnswer(2, chosen)
    }, aiDelay)

    return () => clearTimeout(timer)
  }, [gameMode, gameOver, qP2, handleAnswer])

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return

      // Player 1 (Blue): 1, 2, 3, 4 or Numpad 1-4 or U, I, J, K
      if (qP1 && qP1.options) {
        const p1Keys = { 'Digit1': 0, 'Numpad1': 0, 'Digit2': 1, 'Numpad2': 1, 'Digit3': 2, 'Numpad3': 2, 'Digit4': 3, 'Numpad4': 3, 'KeyU': 0, 'KeyI': 1, 'KeyJ': 2, 'KeyK': 3 }
        if (e.code in p1Keys) {
          const idx = p1Keys[e.code]
          if (qP1.options[idx] !== undefined) {
            e.preventDefault()
            handleAnswer(1, qP1.options[idx])
          }
        }
      }

      // Player 2 (Red): Q, W, A, S
      if (gameMode === '2p' && qP2 && qP2.options) {
        const p2Keys = { 'KeyQ': 0, 'KeyW': 1, 'KeyA': 2, 'KeyS': 3 }
        if (e.code in p2Keys) {
          const idx = p2Keys[e.code]
          if (qP2.options[idx] !== undefined) {
            e.preventDefault()
            handleAnswer(2, qP2.options[idx])
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameOver, qP1, qP2, gameMode, handleAnswer])

  const restart = () => {
    setHealthP1(100)
    setHealthP2(100)
    setGameOver(null)
    generateQuestion(1)
    generateQuestion(2)
  }

  const backLink = subject === 'english' ? '/kids-corner/english' : (subject === 'arabic' ? '/kids-corner/arabic' : '/kids-corner/math')

  return (
    <div className={`${styles.container} ${shake ? styles.shake : ''}`}>
      <button className={styles.settingsBtn} onClick={() => setShowSettings(true)} title="إعداد الأسئلة">⚙️</button>
      
      {showSettings && (
        <QuestionManagerModal 
          customQuestions={customQuestions} 
          setCustomQuestions={handleUpdateQuestions} 
          onClose={() => setShowSettings(false)} 
        />
      )}

      {/* Top Bar with Mode Switcher & Navigation */}
      <div className={styles.topBar}>
        <Link href={backLink} className={styles.backBtn}>
          &larr; {subject === 'english' ? 'Back' : 'الركن'}
        </Link>
        
        {/* Mode Selector */}
        <div className={styles.modeToggle}>
          <button 
            className={`${styles.modeBtn} ${gameMode === '1p_ai' ? styles.activeMode : ''}`}
            onClick={() => { setGameMode('1p_ai'); restart(); }}
          >
            <Bot size={16} /> {subject === 'english' ? '1P vs Robot' : 'ضد الروبوت 🤖'}
          </button>
          <button 
            className={`${styles.modeBtn} ${gameMode === '2p' ? styles.activeMode : ''}`}
            onClick={() => { setGameMode('2p'); restart(); }}
          >
            <Users size={16} /> {subject === 'english' ? '2 Players' : 'لاعبان 👥'}
          </button>
        </div>
      </div>

      {/* Top Split Screen Area (Q&A for both players) */}
      <div className={styles.topSplit}>
        {/* Player 1 - Blue (Right side) */}
        <div className={styles.half}>
          <div className={styles.header}>
            <div className={styles.playerName}>{subject === 'english' ? 'Player 1 🔵' : 'اللاعب الأزرق 🔵'}</div>
            <div className={styles.healthBarContainer}>
              <div className={`${styles.healthFill} ${healthP1 <= 20 ? styles.low : ''}`} style={{width: `${healthP1}%`}}></div>
              <div className={styles.healthText}>{healthP1}%</div>
            </div>
          </div>
          {qP1 && !gameOver && (
            <div className={styles.questionArea}>
              <div className={styles.questionBox}>{qP1.text}</div>
              <div className={styles.optionsGrid}>
                {qP1.options.map((opt, i) => (
                  <button 
                    key={i} 
                    className={`${styles.optionBtn} ${qP1.status === 'wrong' ? styles.wrong : ''}`}
                    onClick={() => handleAnswer(1, opt)}
                  >
                    <span className={styles.keyBadge}>{i + 1}</span>
                    <span className={styles.optText}>{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Player 2 - Red (Left side) */}
        <div className={`${styles.half} ${styles.player2}`}>
          <div className={styles.header}>
            <div className={styles.playerName}>
              {gameMode === '1p_ai' ? (subject === 'english' ? 'Smart Robot 🤖' : 'الروبوت الذكي 🤖') : (subject === 'english' ? 'Player 2 🔴' : 'اللاعب الأحمر 🔴')}
            </div>
            <div className={styles.healthBarContainer}>
              <div className={`${styles.healthFill} ${healthP2 <= 20 ? styles.low : ''}`} style={{width: `${healthP2}%`}}></div>
              <div className={styles.healthText}>{healthP2}%</div>
            </div>
          </div>
          {qP2 && !gameOver && (
            <div className={styles.questionArea}>
              <div className={styles.questionBox}>{qP2.text}</div>
              <div className={styles.optionsGrid}>
                {qP2.options.map((opt, i) => {
                  const p2KeyLabels = ['Q', 'W', 'A', 'S']
                  return (
                    <button 
                      key={i} 
                      className={`${styles.optionBtn} ${qP2.status === 'wrong' ? styles.wrong : ''}`}
                      onClick={() => handleAnswer(2, opt)}
                      disabled={gameMode === '1p_ai'}
                    >
                      {gameMode === '2p' && <span className={styles.keyBadge}>{p2KeyLabels[i]}</span>}
                      <span className={styles.optText}>{opt}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Battlefield Area */}
      <div className={styles.battlefield}>
        {/* Tank 1 - Blue */}
        <div className={`${styles.tank} ${styles.tankP1} ${p1Firing || p1Miss ? styles.recoil : ''}`}>
          <div className={styles.tracks}></div>
          <div className={styles.tankBody}></div>
          <div className={styles.turret}></div>
          <div className={styles.barrel}></div>
        </div>

        {/* Tank 2 - Red */}
        <div className={`${styles.tank} ${styles.tankP2} ${p2Firing || p2Miss ? styles.recoil : ''}`}>
          <div className={styles.tracks}></div>
          <div className={styles.tankBody}></div>
          <div className={styles.turret}></div>
          <div className={styles.barrel}></div>
        </div>

        {/* Projectiles & Explosions */}
        {p1Firing && <div className={`${styles.projectile} ${styles.p1}`}></div>}
        {p2Firing && <div className={`${styles.projectile} ${styles.p2}`}></div>}

        {p1Miss && <div className={`${styles.projectile} ${styles.p1} ${styles.miss}`}></div>}
        {p2Miss && <div className={`${styles.projectile} ${styles.p2} ${styles.miss}`}></div>}

        {explosionP1 && <div className={`${styles.explosion} ${styles.p1Hit}`}></div>}
        {explosionP2 && <div className={`${styles.explosion} ${styles.p2Hit}`}></div>}
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <GameOverModal 
          score={healthP1 > 0 && healthP2 <= 0 ? 100 : 0} 
          gameName="tank-battle" 
          subject={subject} 
          onRestart={restart} 
        />
      )}
    </div>
  )
}

export default function TankBattleGame() {
  return (
    <Suspense fallback={<div style={{padding: '50px', textAlign: 'center', color: '#fff'}}>جاري التحميل...</div>}>
      <TankGameInner />
    </Suspense>
  )
}
