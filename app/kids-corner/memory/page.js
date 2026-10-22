'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './page.module.css'
import { speakWhenReady } from '../../../utils/tts'
import { ARABIC_WORDS_BANK, ENGLISH_WORDS_BANK } from '../../utils/infiniteGameGenerator'

const ARABIC_LETTERS = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي']
const ENGLISH_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
const MATH_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', '15', '20', '25', '30']

function MemoryMatchInner() {
  const router = useRouter()
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [solved, setSolved] = useState([])
  const [disabled, setDisabled] = useState(false)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [isWon, setIsWon] = useState(false)

  const searchParams = useSearchParams()
  const subject = searchParams.get('subject') || 'arabic'

  let sourceItems = ARABIC_LETTERS
  if (subject === 'english') sourceItems = ENGLISH_LETTERS
  if (subject === 'math') sourceItems = MATH_NUMBERS

  const speak = (text) => {
    const voice = subject === 'english' ? 'US English Female' : 'Arabic Male'
    speakWhenReady(text, voice, { rate: 0.9 })
  }

  const initializeGame = (keepScore = false) => {
    if (!keepScore) setScore(0)
    setIsWon(false)
    setSolved([])
    setFlipped([])
    setDisabled(false)

    // In alternating rounds, use emojis or letters for endless variety
    let pool = sourceItems
    if (subject === 'arabic' && round % 2 === 0) {
      pool = ARABIC_WORDS_BANK.map(w => `${w.emoji} ${w.word}`)
    } else if (subject === 'english' && round % 2 === 0) {
      pool = ENGLISH_WORDS_BANK.map(w => `${w.emoji} ${w.word}`)
    }

    const shuffledItems = [...pool].sort(() => 0.5 - Math.random())
    const selectedItems = shuffledItems.slice(0, 6)
    
    // Create pairs and shuffle
    const paired = [...selectedItems, ...selectedItems]
      .sort(() => 0.5 - Math.random())
      .map((item, index) => ({ id: index, letter: item }))

    setCards(paired)
  }

  const nextRound = () => {
    setRound(r => r + 1)
    setScore(s => s + 50)
    initializeGame(true)
  }

  useEffect(() => {
    initializeGame(false)
  }, [subject])

  const handleCardClick = (index) => {
    if (disabled || flipped.includes(index) || solved.includes(index)) return

    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)
    
    // Read card value
    speak(cards[index].letter.replace(/[\u{1F300}-\u{1F9FF}]/gu, ''))

    if (newFlipped.length === 2) {
      setDisabled(true)
      const firstIndex = newFlipped[0]
      const secondIndex = newFlipped[1]

      if (cards[firstIndex].letter === cards[secondIndex].letter) {
        setSolved(prev => [...prev, firstIndex, secondIndex])
        setScore(s => s + 20)
        speak('رائع')
        setFlipped([])
        setDisabled(false)
        
        // Check win
        if (solved.length + 2 === cards.length) {
          setIsWon(true)
          speak('عمل رائع لقد فزت')
        }
      } else {
        setTimeout(() => {
          setFlipped([])
          setDisabled(false)
        }, 1000)
      }
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>العودة</button>
        <div className={styles.scoreBoard}>
          <span>♾️ الجولة {round}</span>
          <span style={{ margin: '0 8px' }}>•</span>
          <span>النقاط: {score} ⭐️</span>
        </div>
        <button onClick={() => initializeGame(false)} className={styles.restartBtn}>إعادة من البداية 🔄</button>
      </header>

      <div className={styles.gameWrapper}>
        <h1 className={styles.title}>تحدي الذاكرة اللانهائي 🧠</h1>
        
        {isWon && (
          <div className={styles.winBanner}>
            <h2>🎉 مبرووووك! أتممت الجولة {round} بنجاح! 🎉</h2>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '14px' }}>
              <button onClick={nextRound} className={styles.restartBtnLarge} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: 'white', cursor: 'pointer' }}>
                الجولة التالية ⏩ (+50 نقطة)
              </button>
              <button onClick={() => initializeGame(true)} className={styles.restartBtnLarge} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', cursor: 'pointer' }}>
                إعادة هذه الجولة 🔄
              </button>
            </div>
          </div>
        )}

        <div className={styles.grid}>
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || solved.includes(index)
            return (
              <div 
                key={index} 
                className={`${styles.card} ${isFlipped ? styles.flipped : ''} ${solved.includes(index) ? styles.solved : ''}`}
                onClick={() => handleCardClick(index)}
              >
                <div className={styles.cardInner}>
                  <div className={styles.cardFront}>
                    ❓
                  </div>
                  <div className={styles.cardBack}>
                    {card.letter}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function MemoryMatch() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <MemoryMatchInner />
    </Suspense>
  )
}
