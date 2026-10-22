'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Trophy, Sparkles, Volume2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import styles from './page.module.css'
import { speakWhenReady } from '../../../utils/tts'

export default function MathLab() {
  const router = useRouter()
  const [opMode, setOpMode] = useState('add') // 'add' or 'sub'
  const [num1, setNum1] = useState(1)
  const [num2, setNum2] = useState(1)
  const [options, setOptions] = useState([])
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const speak = (text) => {
    speakWhenReady(text, 'Arabic Male', { rate: 0.9 })
  }

  const generateProblem = (currentScore = score, mode = opMode) => {
    let max = 5
    if (currentScore >= 50) max = 10
    if (currentScore >= 100) max = 15
    if (currentScore >= 150) max = 20

    let a = Math.floor(Math.random() * max) + 1
    let b = Math.floor(Math.random() * max) + 1

    if (mode === 'sub') {
      if (a < b) {
        const temp = a
        a = b
        b = temp
      }
      if (a === b) a += 1
    }

    setNum1(a)
    setNum2(b)
    
    const correct = mode === 'add' ? a + b : a - b
    const wrong1 = correct + Math.floor(Math.random() * 3) + 1
    const wrong2 = Math.max(0, correct - (Math.floor(Math.random() * 3) + 1))
    
    const opts = Array.from(new Set([correct, wrong1, wrong2]))
    while (opts.length < 3) {
      opts.push(correct + opts.length + 2)
    }
    opts.sort(() => 0.5 - Math.random())

    setOptions(opts)
    setMessage('')
    setIsSuccess(false)
    
    const opText = mode === 'add' ? 'زائد' : 'ناقص'
    speak(`كم يساوي ${a} ${opText} ${b}`)
  }

  useEffect(() => {
    generateProblem(0, opMode)
  }, [opMode])

  const handleAnswer = (ans) => {
    const expected = opMode === 'add' ? num1 + num2 : num1 - num2
    if (ans === expected) {
      const newScore = score + 10
      setScore(newScore)
      setMessage('أحسنت! إجابة صحيحة 🌟')
      setIsSuccess(true)
      speak('أحسنت يا بطل')
      
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      })

      setTimeout(() => {
        generateProblem(newScore, opMode)
      }, 1500)
    } else {
      setMessage('حاول مرة أخرى يا بطل ❌')
      setIsSuccess(false)
      speak('حاول مرة أخرى')
    }
  }

  const renderVisuals = (count) => {
    const displayCount = Math.min(count, 10)
    const extra = count > 10 ? ` +${count - 10}` : ''
    return (
      <>
        {Array.from({ length: displayCount }).map((_, i) => (
          <span key={i} className={styles.itemIcon}>🍎</span>
        ))}
        {extra && <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#065f46' }}>{extra}</span>}
      </>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        {/* Header */}
        <header className={styles.header}>
          <button onClick={() => router.back()} className={styles.backBtn}>
            <ArrowRight size={16} />
            <span>العودة</span>
          </button>
          
          <h1 className={styles.title}>
            <span>🔢</span>
            <span>مختبر الأرقام والعمليات</span>
          </h1>

          <div className={styles.scoreBoard}>
            <Trophy size={16} />
            <span>النقاط: {score}</span>
          </div>
        </header>

        {/* Game Area */}
        <div className={styles.gameArea}>
          
          {/* Mode Switch */}
          <div className={styles.modeSwitch}>
            <button 
              className={`${styles.modeBtn} ${opMode === 'add' ? styles.modeBtnActive : styles.modeBtnInactive}`}
              onClick={() => setOpMode('add')}
            >
              جمع ( + )
            </button>
            <button 
              className={`${styles.modeBtn} ${opMode === 'sub' ? styles.modeBtnActive : styles.modeBtnInactive}`}
              onClick={() => setOpMode('sub')}
            >
              طرح ( - )
            </button>
          </div>

          {/* Problem Display */}
          <div className={styles.problemBox}>
            <div className={styles.numberGroup}>
              <div className={styles.number}>{num1}</div>
              <div className={styles.visuals}>{renderVisuals(num1)}</div>
            </div>
            
            <div className={styles.operator}>{opMode === 'add' ? '+' : '−'}</div>
            
            <div className={styles.numberGroup}>
              <div className={styles.number}>{num2}</div>
              <div className={styles.visuals}>{renderVisuals(num2)}</div>
            </div>
          </div>

          {/* Status Message */}
          <div className={`${styles.message} ${isSuccess ? styles.messageSuccess : styles.messageError}`}>
            {message}
          </div>

          {/* Options */}
          <div className={styles.options}>
            {options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt)}
                className={styles.optionBtn}
              >
                {opt}
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  )
}
