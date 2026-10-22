'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Trophy, Flame, BarChart2, Sparkles, Volume2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { supabase } from '../../../utils/supabase'
import styles from './page.module.css'
import { speakWhenReady } from '../../../utils/tts'

export default function MathTraining() {
  const router = useRouter()
  
  // Game states
  const [isPlaying, setIsPlaying] = useState(false)
  const [operation, setOperation] = useState('add') // add, sub, mul, div, mix
  const [level, setLevel] = useState('easy') // easy, medium, hard
  
  // Question states
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [currentOp, setCurrentOp] = useState('+')
  const [answers, setAnswers] = useState([])
  const [correctAnswer, setCorrectAnswer] = useState(0)
  
  // Feedback & Score
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isWrong, setIsWrong] = useState(false)

  // Tracking Stats
  const sessionStatsRef = useRef({ add: { correct: 0, wrong: 0 }, sub: { correct: 0, wrong: 0 }, mul: { correct: 0, wrong: 0 }, div: { correct: 0, wrong: 0 } })
  const lastOpRef = useRef('add')

  const speak = (text) => {
    speakWhenReady(text, 'Arabic Male', { rate: 0.9 })
  }

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

  const generateQuestion = () => {
    let n1, n2, ans, opSymbol
    let chosenOp = operation

    if (operation === 'mix') {
      const ops = ['add', 'sub', 'mul', 'div']
      chosenOp = ops[Math.floor(Math.random() * ops.length)]
    }

    if (chosenOp === 'add') {
      opSymbol = '+'
      if (level === 'easy') { n1 = rand(1, 10); n2 = rand(1, 10) }
      else if (level === 'medium') { n1 = rand(10, 50); n2 = rand(10, 50) }
      else { n1 = rand(50, 500); n2 = rand(50, 500) }
      ans = n1 + n2
    } 
    else if (chosenOp === 'sub') {
      opSymbol = '-'
      if (level === 'easy') { n1 = rand(2, 10); n2 = rand(1, n1) }
      else if (level === 'medium') { n1 = rand(20, 99); n2 = rand(1, n1) }
      else { n1 = rand(100, 999); n2 = rand(10, n1) }
      ans = n1 - n2
    }
    else if (chosenOp === 'mul') {
      opSymbol = '×'
      if (level === 'easy') { n1 = rand(1, 5); n2 = rand(1, 10) }
      else if (level === 'medium') { n1 = rand(2, 12); n2 = rand(2, 12) }
      else { n1 = rand(10, 20); n2 = rand(2, 20) }
      ans = n1 * n2
    }
    else if (chosenOp === 'div') {
      opSymbol = '÷'
      let temp1, temp2
      if (level === 'easy') { temp1 = rand(1, 5); temp2 = rand(1, 10) }
      else if (level === 'medium') { temp1 = rand(2, 12); temp2 = rand(2, 12) }
      else { temp1 = rand(5, 20); temp2 = rand(5, 20) }
      n1 = temp1 * temp2
      n2 = temp1
      ans = temp2
    }

    setNum1(n1)
    setNum2(n2)
    setCurrentOp(opSymbol)
    setCorrectAnswer(ans)
    
    let internalOp = 'add'
    if (chosenOp === 'add' || opSymbol === '+') internalOp = 'add'
    else if (chosenOp === 'sub' || opSymbol === '-') internalOp = 'sub'
    else if (chosenOp === 'mul' || opSymbol === '×') internalOp = 'mul'
    else if (chosenOp === 'div' || opSymbol === '÷') internalOp = 'div'
    
    lastOpRef.current = internalOp
    
    // Generate false answers
    const falseAnswers = new Set()
    while(falseAnswers.size < 3) {
      const offset = rand(1, Math.max(5, Math.floor(ans * 0.2))) * (Math.random() > 0.5 ? 1 : -1)
      const fake = ans + offset
      if (fake !== ans && fake >= 0) falseAnswers.add(fake)
    }

    const allOptions = [ans, ...Array.from(falseAnswers)]
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }
    
    setAnswers(allOptions)
    setSelectedAnswer(null)
    setIsWrong(false)
  }

  const startGame = () => {
    setIsPlaying(true)
    setScore(0)
    setStreak(0)
    generateQuestion()
  }

  const handleAnswer = (ans) => {
    if (selectedAnswer !== null) return

    setSelectedAnswer(ans)
    const opKey = lastOpRef.current

    if (ans === correctAnswer) {
      sessionStatsRef.current[opKey].correct += 1
      speak('أحسنت')
      const newStreak = streak + 1
      setStreak(newStreak)
      setScore(score + (10 * (level === 'hard' ? 3 : level === 'medium' ? 2 : 1)) + (newStreak > 3 ? 5 : 0))
      
      if (newStreak > 0 && newStreak % 5 === 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
      
      setTimeout(generateQuestion, 800)
    } else {
      sessionStatsRef.current[opKey].wrong += 1
      speak('حاول مرة أخرى')
      setIsWrong(true)
      setStreak(0)
      setTimeout(() => {
        setSelectedAnswer(null)
        setIsWrong(false)
      }, 1000)
    }
  }

  const handleEndChallenge = async () => {
    setIsPlaying(false)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const currentStats = user.user_metadata?.math_stats || { add: { correct: 0, wrong: 0 }, sub: { correct: 0, wrong: 0 }, mul: { correct: 0, wrong: 0 }, div: { correct: 0, wrong: 0 } }
        
        const newStats = { ...currentStats }
        Object.keys(sessionStatsRef.current).forEach(op => {
          if (!newStats[op]) newStats[op] = { correct: 0, wrong: 0 }
          newStats[op].correct += sessionStatsRef.current[op].correct
          newStats[op].wrong += sessionStatsRef.current[op].wrong
        })

        await supabase.auth.updateUser({
          data: { math_stats: newStats }
        })
        
        sessionStatsRef.current = { add: { correct: 0, wrong: 0 }, sub: { correct: 0, wrong: 0 }, mul: { correct: 0, wrong: 0 }, div: { correct: 0, wrong: 0 } }
      }
    } catch(e) {
      console.error('Error saving math stats', e)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        {/* Header */}
        <header className={styles.header}>
          <button onClick={() => isPlaying ? handleEndChallenge() : router.back()} className={styles.backBtn}>
            <ArrowRight size={16} />
            <span>{isPlaying ? 'إنهاء التدريب' : 'العودة'}</span>
          </button>
          
          <h2 className={styles.titleHeader}>
            <span>🧮</span>
            <span>أكاديمية الحساب الذكي</span>
          </h2>

          <button 
            onClick={() => router.push('/kids-corner/math-training/report')}
            className={styles.reportBtn}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            <BarChart2 size={16} />
            <span>شهادة مستواي</span>
          </button>
        </header>

        {/* Card Body */}
        <div className={styles.card}>
          {!isPlaying ? (
            <>
              <h1 className={styles.title}>اختر التدريب المناسب 🚀</h1>
              <p className={styles.subtitle}>طوّر مهاراتك الحسابية وسرعتك الذهنية من خلال التحديات الممتعة</p>
              
              <div className={styles.sectionLabel}>اختر نوع العملية:</div>
              <div className={styles.grid}>
                <button 
                  className={`${styles.opBtn} ${styles.opBtnAdd} ${operation === 'add' ? styles.opBtnAddActive : ''}`} 
                  onClick={() => setOperation('add')}
                >
                  <span style={{ fontSize: '1.4rem' }}>➕</span>
                  <span>جمع</span>
                </button>
                <button 
                  className={`${styles.opBtn} ${styles.opBtnSub} ${operation === 'sub' ? styles.opBtnSubActive : ''}`} 
                  onClick={() => setOperation('sub')}
                >
                  <span style={{ fontSize: '1.4rem' }}>➖</span>
                  <span>طرح</span>
                </button>
                <button 
                  className={`${styles.opBtn} ${styles.opBtnMul} ${operation === 'mul' ? styles.opBtnMulActive : ''}`} 
                  onClick={() => setOperation('mul')}
                >
                  <span style={{ fontSize: '1.4rem' }}>✖️</span>
                  <span>ضرب</span>
                </button>
                <button 
                  className={`${styles.opBtn} ${styles.opBtnDiv} ${operation === 'div' ? styles.opBtnDivActive : ''}`} 
                  onClick={() => setOperation('div')}
                >
                  <span style={{ fontSize: '1.4rem' }}>➗</span>
                  <span>قسمة</span>
                </button>
                <button 
                  className={`${styles.opBtn} ${styles.opBtnMix} ${operation === 'mix' ? styles.opBtnMixActive : ''}`} 
                  onClick={() => setOperation('mix')}
                >
                  <span style={{ fontSize: '1.4rem' }}>🎲</span>
                  <span>مختلط</span>
                </button>
              </div>

              <div className={styles.sectionLabel}>اختر مستوى الصعوبة:</div>
              <div className={styles.levelRow}>
                <button 
                  className={`${styles.levelBtn} ${level === 'easy' ? styles.levelBtnActive : ''}`} 
                  onClick={() => setLevel('easy')}
                >
                  🌱 سهل
                </button>
                <button 
                  className={`${styles.levelBtn} ${level === 'medium' ? styles.levelBtnActive : ''}`} 
                  onClick={() => setLevel('medium')}
                >
                  ⚡ متوسط
                </button>
                <button 
                  className={`${styles.levelBtn} ${level === 'hard' ? styles.levelBtnActive : ''}`} 
                  onClick={() => setLevel('hard')}
                >
                  🔥 متقدم
                </button>
              </div>

              <button className={styles.startBtn} onClick={startGame}>
                ابدأ التحدي الآن 🚀
              </button>
            </>
          ) : (
            <div className={styles.gameArea}>
              <div className={styles.scoreBoard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Trophy size={18} color="#059669" />
                  <span>النقاط: {score}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className={streak >= 3 ? styles.streakFire : ''}>
                  <Flame size={18} color={streak >= 3 ? '#f59e0b' : '#64748b'} />
                  <span>التتالي: {streak}</span>
                </div>
              </div>
              
              <div className={styles.questionBox}>
                {num1} {currentOp} {num2} = ؟
              </div>

              <div className={styles.answersGrid}>
                {answers.map((ans, idx) => {
                  let btnClass = styles.answerBtn
                  if (selectedAnswer === ans) {
                    btnClass += ans === correctAnswer ? ` ${styles.answerBtnCorrect}` : ` ${styles.answerBtnWrong}`
                  } else if (selectedAnswer !== null && ans === correctAnswer) {
                    btnClass += ` ${styles.answerBtnCorrect}`
                  }

                  return (
                    <button 
                      key={idx} 
                      className={btnClass}
                      onClick={() => handleAnswer(ans)}
                      disabled={selectedAnswer !== null}
                    >
                      {ans}
                    </button>
                  )
                })}
              </div>

              <button className={styles.endBtn} onClick={handleEndChallenge}>
                إنهاء التحدي وحفظ النتائج 🚪
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
