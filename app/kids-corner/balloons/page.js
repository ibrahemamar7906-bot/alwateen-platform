'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Volume2, Sparkles, Trophy } from 'lucide-react'
import styles from './page.module.css'
import { speakWhenReady } from '../../../utils/tts'

const ARABIC_ALPHABET = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي']
const ENGLISH_ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
const MATH_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '15', '20']
const BALLOON_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

function BalloonsGameContent() {
  const router = useRouter()
  const [balloons, setBalloons] = useState([])
  const [targetLetter, setTargetLetter] = useState('')
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  
  const searchParams = useSearchParams()
  const subject = searchParams.get('subject') || 'arabic'

  let sourceItems = ARABIC_ALPHABET
  if (subject === 'english') sourceItems = ENGLISH_ALPHABET
  if (subject === 'math') sourceItems = MATH_NUMBERS
  
  const speak = (text) => {
    const voice = subject === 'english' ? 'US English Female' : 'Arabic Male'
    speakWhenReady(text, voice, { rate: 0.9 })
  }

  const generateTargetLetter = () => {
    const letter = sourceItems[Math.floor(Math.random() * sourceItems.length)]
    setTargetLetter(letter)
    if (subject === 'english') {
      speak(`Where is ${letter}`)
    } else if (subject === 'math') {
      speak(`أين رقم ${letter}`)
    } else {
      speak(`أين حرف ال ${letter}`)
    }
  }

  const startGame = () => {
    setScore(0)
    setGameStarted(true)
    generateTargetLetter()
  }

  useEffect(() => {
    if (!gameStarted) return

    const spawnBalloon = () => {
      const isTarget = Math.random() < 0.35
      const letter = isTarget ? targetLetter : sourceItems[Math.floor(Math.random() * sourceItems.length)]
      
      const newBalloon = {
        id: Math.random().toString(36).substr(2, 9),
        letter: letter,
        color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
        left: Math.floor(Math.random() * 76) + 12,
        speed: Math.random() * 2.5 + 3.5,
      }
      
      setBalloons(prev => [...prev, newBalloon])

      setTimeout(() => {
        setBalloons(prev => prev.filter(b => b.id !== newBalloon.id))
      }, 7000)
    }

    const intervalId = setInterval(spawnBalloon, 1100)
    return () => clearInterval(intervalId)
  }, [gameStarted, targetLetter])

  const handlePop = (balloon) => {
    if (balloon.letter === targetLetter) {
      setScore(s => s + 10)
      speak(subject === 'english' ? 'Great job!' : 'ممتاز يا بطل!')
      setTimeout(() => {
        generateTargetLetter()
      }, 900)
    } else {
      speak(subject === 'english' ? 'Try again!' : 'حاول مرة أخرى')
    }
    setBalloons(prev => prev.filter(b => b.id !== balloon.id))
  }

  return (
    <div className={styles.container} style={{ direction: subject === 'english' ? 'ltr' : 'rtl' }}>
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowRight size={16} style={{ transform: subject === 'english' ? 'rotate(180deg)' : 'none' }} />
          <span>{subject === 'english' ? 'Back' : 'العودة'}</span>
        </button>
        <div className={styles.scoreBoard}>
          <Trophy size={18} color="#f59e0b" />
          <span>{subject === 'english' ? `Score: ${score}` : `النقاط: ${score}`}</span>
        </div>
      </header>

      {!gameStarted ? (
        <div className={styles.startScreen}>
          <h1>🎈 {subject === 'english' ? 'Balloon Pop Game' : 'لعبة بالونات الحروف'}</h1>
          <p>
            {subject === 'english'
              ? 'Find the requested letter and pop the matching balloon!'
              : 'ابحث عن العنصر المطلوب واستمع لصوته ثم قم بفرقعة البالون الصحيح!'}
          </p>
          <button onClick={startGame} className={styles.startBtn}>
            {subject === 'english' ? 'Start Game 🚀' : 'ابدأ اللعب الآن 🚀'}
          </button>
        </div>
      ) : (
        <>
          <div className={styles.targetDisplay}>
            <h2>{subject === 'english' ? 'Find:' : subject === 'math' ? 'ابحث عن رقم:' : 'ابحث عن حرف:'}</h2>
            <div className={styles.bigLetter}>{targetLetter}</div>
            <button 
              onClick={() => {
                if (subject === 'english') speak(`Where is ${targetLetter}`)
                else if (subject === 'math') speak(`أين رقم ${targetLetter}`)
                else speak(`أين حرف ال ${targetLetter}`)
              }} 
              className={styles.audioBtn}
            >
              <Volume2 size={16} />
              <span>{subject === 'english' ? 'Listen again' : 'استمع مجدداً'}</span>
            </button>
          </div>

          <div className={styles.gameArea}>
            {balloons.map(balloon => (
              <div 
                key={balloon.id} 
                className={styles.balloon}
                style={{
                  left: `${balloon.left}%`,
                  backgroundColor: balloon.color,
                  animationDuration: `${balloon.speed}s`
                }}
                onClick={() => handlePop(balloon)}
              >
                {balloon.letter}
                <div className={styles.balloonKnot} style={{ borderBottomColor: balloon.color }}></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function LetterBalloons() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif' }}>
        <p style={{ color: '#059669', fontWeight: 800 }}>جاري تحميل اللعبة... 🎈</p>
      </div>
    }>
      <BalloonsGameContent />
    </Suspense>
  )
}
