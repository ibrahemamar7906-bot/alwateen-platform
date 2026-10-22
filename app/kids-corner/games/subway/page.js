'use client'

import { useState, useEffect, Suspense, useCallback, useRef } from 'react'
import { ArrowLeft, Volume2, Heart, Trophy, Settings } from 'lucide-react'
import { getEducationalQuestion } from '../../../utils/questionBank'
import { normalizeQuestion, normalizeQuestions, loadActiveCustomQuestions, saveActiveCustomQuestions } from '../../../utils/questionHelper'
import QuestionManagerModal from '../../../components/QuestionManagerModal'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'
import GameOverModal from '../../components/GameOverModal'

function SubwayInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subject = searchParams.get('subject') || 'math'
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [customQuestions, setCustomQuestions] = useState(() => loadActiveCustomQuestions())

  // Game States: 'running', 'trainApproaching', 'answering', 'jumping', 'hit', 'gameOver'
  const [gameState, setGameState] = useState('running') 
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)
  
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)

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
    return () => {
      clearAllTimeouts()
    }
  }, [])

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
        osc.frequency.setValueAtTime(180, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4)
        gain.gain.setValueAtTime(0.4, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
        osc.start()
        osc.stop(ctx.currentTime + 0.4)
      } else if (type === 'jump') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(300, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.25)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
      }
    } catch (e) {
      console.warn('Audio playback error:', e)
    }
  }

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
    const q = getEducationalQuestion(subject, 1)
    const normalized = normalizeQuestion(q)
    setCurrentQuestion(normalized)
    return normalized
  }, [customQuestions, subject])

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

  const startNextCycle = useCallback(() => {
    setShowQuestion(false)
    setSelectedOption(null)
    setGameState('running')

    addTimeout(() => {
      setGameState('trainApproaching')
      addTimeout(() => {
        generateQuestion()
        setGameState('answering')
        setShowQuestion(true)
      }, 1000)
    }, 1800)
  }, [generateQuestion])

  // Initial Loop Start
  useEffect(() => {
    startNextCycle()
    return () => clearAllTimeouts()
  }, [startNextCycle])

  const handleAnswer = useCallback((option) => {
    if (!currentQuestion || selectedOption !== null) return
    setSelectedOption(option)
    const isCorrect = String(option).trim() === String(currentQuestion.answer).trim()
    
    if (isCorrect) {
      playSound('correct')
      addTimeout(() => playSound('jump'), 200)
      setGameState('jumping')
      setScore(s => s + 10)
      
      addTimeout(() => {
        startNextCycle()
      }, 1400)

    } else {
      playSound('wrong')
      setGameState('hit')
      
      setLives(prevLives => {
        const nextLives = prevLives - 1
        addTimeout(() => {
          if (nextLives <= 0) {
            setGameState('gameOver')
          } else {
            startNextCycle()
          }
        }, 1400)
        return nextLives
      })
    }
  }, [currentQuestion, selectedOption, startNextCycle])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showQuestion && currentQuestion && currentQuestion.options && selectedOption === null) {
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
  }, [showQuestion, currentQuestion, selectedOption, handleAnswer])

  const backLink = subject === 'english' ? '/kids-corner/english' : (subject === 'arabic' ? '/kids-corner/arabic' : '/kids-corner/math')
  const isHit = gameState === 'hit'

  return (
    <div className={`${styles.container} ${isHit ? styles.shake : ''}`}>
      <button className={styles.settingsBtn} onClick={() => setShowSettings(true)} title="إعداد الأسئلة">⚙️</button>
      
      {showSettings && (
        <QuestionManagerModal 
          customQuestions={customQuestions} 
          setCustomQuestions={handleUpdateQuestions} 
          onClose={() => setShowSettings(false)} 
        />
      )}

      <div className={styles.header}>
        <Link href={backLink} className={styles.backBtn}>
          &larr; {subject === 'english' ? 'Back' : 'الركن'}
        </Link>
        <div className={styles.hearts}>
          {Array.from({length: 3}).map((_, i) => (
            <span key={i} style={{opacity: i < lives ? 1 : 0.25}}>❤️</span>
          ))}
        </div>
        <div className={styles.scoreBoard}>
          <span>{score}</span> 🏃‍♂️
        </div>
      </div>

      <div className={styles.gameArea}>
        {/* Scenery & Floor */}
        <div className={`${styles.scenery} ${gameState === 'running' ? styles.sceneryScroling : ''}`}></div>
        <div className={`${styles.floor} ${gameState === 'running' ? styles.scrollingFast : ''}`}></div>

        {/* Coins during running phase */}
        {gameState === 'running' && (
          <div className={styles.coinsLayer}>
            <div className={styles.coin}></div>
            <div className={styles.coin}></div>
            <div className={styles.coin}></div>
          </div>
        )}

        {/* Question Pop-up */}
        {showQuestion && currentQuestion && gameState !== 'gameOver' && (
          <div className={styles.questionOverlay}>
            <div className={`${styles.questionCard} ${isHit ? styles.shakeError : ''}`}>
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

        {/* Approaching Train */}
        <div className={`${styles.train} ${styles[gameState]}`}>
          <div className={styles.trainWindow}></div>
          <div className={styles.trainLight}></div>
        </div>

        {/* CSS Subway Runner Character */}
        <div className={`${styles.character} ${styles['char_' + gameState]}`}>
          <div className={styles.head}>
            <div className={styles.cap}></div>
          </div>
          <div className={styles.body}></div>
          <div className={`${styles.arm} ${styles.armLeft}`}></div>
          <div className={`${styles.arm} ${styles.armRight}`}></div>
          <div className={`${styles.leg} ${styles.legLeft}`}></div>
          <div className={`${styles.leg} ${styles.legRight}`}></div>
        </div>
      </div>

      {gameState === 'gameOver' && (
        <GameOverModal 
          score={score} 
          gameName="subway" 
          subject={subject} 
          onRestart={() => {
            setScore(0)
            setLives(3)
            startNextCycle()
          }} 
        />
      )}
    </div>
  )
}

export default function SubwayGame() {
  return (
    <Suspense fallback={<div style={{padding: '50px', textAlign: 'center', color: '#fff'}}>جاري التحميل...</div>}>
      <SubwayInner />
    </Suspense>
  )
}
