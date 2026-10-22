'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Sparkles, Volume2 } from 'lucide-react'
import { speakWhenReady } from '../../../utils/tts'
import { getInfiniteTrainLevel } from '../../utils/infiniteGameGenerator'
import { loadCustomGameWords, formatCustomWordToTrainLevel } from '../../utils/customGameStore'
import TeacherGameManagerModal from '../../components/TeacherGameManagerModal'

function TrainGameContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subject = searchParams.get('subject') || 'arabic'
  
  const arabicLevels = [
    { word: 'أسد', parts: ['', 'سَد'], correct: 'أ', options: ['أ', 'ب', 'ت', 'س'] },
    { word: 'كلب', parts: ['كَلـ', ''], correct: 'ب', options: ['ب', 'ن', 'م', 'ل'] },
    { word: 'شمس', parts: ['شَـ', 'ـس'], correct: 'م', options: ['م', 'ق', 'ف', 'ع'] },
    { word: 'قمر', parts: ['', 'ـمَر'], correct: 'ق', options: ['ق', 'ك', 'غ', 'ع'] },
    { word: 'بطة', parts: ['', 'ـطَّة'], correct: 'ب', options: ['ب', 'ت', 'ث', 'ن'] },
    { word: 'نحلة', parts: ['نَـ', 'ـلَة'], correct: 'ح', options: ['ح', 'خ', 'ج', 'ع'] },
    { word: 'فيل', parts: ['فِـ', 'ـل'], correct: 'ي', options: ['ي', 'ب', 'ت', 'ث'] },
    { word: 'عصفور', parts: ['عُـ', 'ـفُور'], correct: 'ص', options: ['ص', 'ض', 'ط', 'ظ'] },
    { word: 'سيارة', parts: ['سَـ', 'ـارَة'], correct: 'ي', options: ['ي', 'ب', 'ت', 'ث'] },
    { word: 'كتاب', parts: ['كِـ', 'ـاب'], correct: 'ت', options: ['ت', 'ب', 'ث', 'ن'] }
  ]

  const englishLevels = [
    { word: 'APPLE', parts: ['APPL', ''], correct: 'E', options: ['A', 'E', 'I', 'O'] },
    { word: 'BOOK', parts: ['B', 'OK'], correct: 'O', options: ['O', 'E', 'A', 'I'] },
    { word: 'CAT', parts: ['C', 'T'], correct: 'A', options: ['A', 'O', 'E', 'U'] },
    { word: 'DOG', parts: ['DO', ''], correct: 'G', options: ['G', 'C', 'P', 'B'] },
    { word: 'SUN', parts: ['S', 'N'], correct: 'U', options: ['U', 'A', 'I', 'O'] },
    { word: 'MOON', parts: ['M', 'ON'], correct: 'O', options: ['A', 'E', 'I', 'O'] },
    { word: 'TREE', parts: ['TR', 'E'], correct: 'E', options: ['A', 'O', 'I', 'E'] },
    { word: 'FISH', parts: ['FI', 'H'], correct: 'S', options: ['S', 'C', 'T', 'R'] },
  ]

  const mathLevels = [
    { word: '1, 2, 3, 4', parts: ['1, 2, ', ', 4'], correct: '3', options: ['1', '3', '5', '7'] },
    { word: '5, 6, 7, 8', parts: ['5, ', ', 7, 8'], correct: '6', options: ['4', '6', '8', '9'] },
    { word: '10, 20, 30', parts: ['10, ', ', 30'], correct: '20', options: ['15', '20', '25', '40'] },
    { word: '2 + 2 = 4', parts: ['2 + 2 = ', ''], correct: '4', options: ['3', '4', '5', '6'] },
    { word: '5 + 1 = 6', parts: ['5 + ', ' = 6'], correct: '1', options: ['1', '2', '3', '4'] },
  ]

  const [currentLevel, setCurrentLevel] = useState(0)
  const [placedLetter, setPlacedLetter] = useState(null)
  const [message, setMessage] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [customWords, setCustomWords] = useState(() => loadCustomGameWords(subject === 'english' ? 'english' : 'arabic'))

  // Sync with Teacher Game Store
  useEffect(() => {
    const handleWordsUpdate = (e) => {
      const updated = e.detail?.words || loadCustomGameWords(subject === 'english' ? 'english' : 'arabic')
      setCustomWords(updated)
      setCurrentLevel(0)
    }
    setCustomWords(loadCustomGameWords(subject === 'english' ? 'english' : 'arabic'))
    window.addEventListener('customGameWordsUpdated', handleWordsUpdate)
    return () => window.removeEventListener('customGameWordsUpdated', handleWordsUpdate)
  }, [subject])

  // Infinite Train Level Generator + Teacher Custom Words
  const levelData = React.useMemo(() => {
    if (customWords && currentLevel < customWords.length) {
      const formatted = formatCustomWordToTrainLevel(customWords[currentLevel], subject)
      if (formatted) {
        return {
          word: formatted.word,
          parts: [
            formatted.segments.slice(0, formatted.missingIdx).filter(Boolean).join(''),
            formatted.segments.slice(formatted.missingIdx + 1).filter(Boolean).join('')
          ],
          correct: formatted.correct,
          options: formatted.options,
          category: formatted.category
        }
      }
    }
    return getInfiniteTrainLevel(subject, currentLevel - (customWords ? customWords.length : 0))
  }, [subject, currentLevel, customWords])

  const handleLetterClick = (letter) => {
    if (isCorrect) return
    setPlacedLetter(letter)
    
    if (letter === levelData.correct) {
      setMessage(subject === 'english' ? 'Awesome job! Correct! 🎉' : 'أحسنت يا بطل! إجابة صحيحة 🎉')
      setIsCorrect(true)
      setShowConfetti(true)
      const voice = subject === 'english' ? 'US English Female' : 'Arabic Male'
        speakWhenReady(subject === 'english' ? 'Great job' : 'أحسنت', voice)
        setTimeout(() => {
          speakWhenReady(levelData.word, voice)
        }, 1200)
      
      setTimeout(() => {
        setCurrentLevel(prev => prev + 1)
        setPlacedLetter(null)
        setMessage('')
        setIsCorrect(false)
        setShowConfetti(false)
      }, 2500)
    } else {
      setMessage(subject === 'english' ? 'Try again! 🤔' : 'حاول مرة أخرى يا ذكي! 🤔')
      const voice = subject === 'english' ? 'US English Female' : 'Arabic Male'
        speakWhenReady(subject === 'english' ? 'Try again' : 'حاول مرة أخرى', voice)
      setTimeout(() => {
        setPlacedLetter(null)
        setMessage('')
      }, 1500)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'radial-gradient(circle at 10% 20%, #d1fae5 0%, #ecfdf5 45%, #f0fdf4 100%)',
      padding: 'clamp(14px, 3vw, 36px)',
      paddingBottom: 'calc(clamp(24px, 5vw, 48px) + env(safe-area-inset-bottom, 0px))',
      fontFamily: 'Tajawal, -apple-system, BlinkMacSystemFont, sans-serif',
      direction: subject === 'english' ? 'ltr' : 'rtl',
      boxSizing: 'border-box',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header Bar */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: '12px 20px',
          boxShadow: '0 6px 20px rgba(5, 150, 105, 0.06)',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <button 
            onClick={() => router.back()} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              background: 'rgba(5, 150, 105, 0.08)',
              color: '#065f46',
              border: '1px solid rgba(5, 150, 105, 0.2)',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              minHeight: '40px'
            }}
          >
            <ArrowRight size={16} style={{ transform: subject === 'english' ? 'rotate(180deg)' : 'none' }} />
            <span>{subject === 'english' ? 'Back' : 'العودة'}</span>
          </button>

          <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)', fontWeight: 900, color: '#064e3b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🚂</span>
            <span>{subject === 'english' ? 'Word Train' : 'قطار الكلمات الذكي'}</span>
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(5, 150, 105, 0.12)',
              padding: '6px 16px',
              borderRadius: '50px',
              color: '#065f46',
              fontWeight: 900,
              fontSize: '0.88rem',
              border: '1.5px solid rgba(5, 150, 105, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>♾️ المحطة {currentLevel + 1}</span>
            </div>

            <button
              onClick={() => setShowTeacherModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}
              title="إدارة كلمات المعلم والتوليد بالذكاء الاصطناعي"
            >
              <Sparkles size={16} />
              <span>إعدادات وأسئلة المعلم / ذكاء اصطناعي 🤖</span>
              {customWords && customWords.length > 0 && (
                <span style={{ background: '#38bdf8', color: '#0369a1', padding: '1px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>
                  {customWords.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Main Card */}
        <main style={{
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          padding: 'clamp(20px, 4vw, 36px)',
          borderRadius: '28px',
          boxShadow: '0 10px 30px rgba(5, 150, 105, 0.08)',
        }}>
          
          <h2 style={{ color: '#064e3b', marginBottom: '24px', fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)', fontWeight: 800 }}>
            {subject === 'english' ? 'Complete the missing letter:' : 'أكمل الكلمة بالحرف الناقص يا بطل:'}
          </h2>
          
          {/* Train Visualization */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '32px',
            flexDirection: subject === 'arabic' ? 'row-reverse' : 'row',
            flexWrap: 'wrap'
          }}>
            {/* Locomotive */}
            <div style={{
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: 'white',
              width: '90px',
              height: '90px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              boxShadow: '0 8px 20px rgba(5, 150, 105, 0.25)'
            }}>
              🚂
            </div>

            {/* Word Carriage */}
            <div style={{
              background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
              border: '2.5px solid #059669',
              padding: '0 24px',
              minWidth: '160px',
              height: '90px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontWeight: 900,
              boxShadow: '0 8px 20px rgba(5, 150, 105, 0.12)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', direction: subject === 'arabic' ? 'rtl' : 'ltr' }}>
                <span style={{ color: '#064e3b' }}>{levelData.parts[0]}</span>
                <span style={{
                  color: placedLetter ? (isCorrect ? '#059669' : '#ef4444') : '#f59e0b',
                  margin: '0 4px',
                  borderBottom: placedLetter ? 'none' : '3px dashed #f59e0b',
                  padding: '0 4px'
                }}>
                  {placedLetter || '؟'}
                </span>
                <span style={{ color: '#064e3b' }}>{levelData.parts[1]}</span>
              </div>
            </div>
          </div>

          {/* Feedback Message */}
          <div style={{
            minHeight: '40px',
            fontSize: 'clamp(1.1rem, 3.2vw, 1.4rem)',
            fontWeight: 800,
            color: isCorrect ? '#059669' : '#ef4444',
            marginBottom: '24px'
          }}>
            {message}
          </div>

          {/* Options Grid */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(10px, 2.5vw, 18px)', flexWrap: 'wrap' }}>
            {levelData.options.map((opt, i) => (
              <button 
                key={opt + i}
                onClick={() => handleLetterClick(opt)}
                disabled={isCorrect}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid rgba(5, 150, 105, 0.25)',
                  borderRadius: '20px',
                  width: 'clamp(64px, 15vw, 84px)',
                  height: 'clamp(64px, 15vw, 84px)',
                  fontSize: 'clamp(1.8rem, 4.5vw, 2.5rem)',
                  fontWeight: 900,
                  color: '#064e3b',
                  cursor: isCorrect ? 'default' : 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 6px 16px rgba(5, 150, 105, 0.1)',
                  fontFamily: 'inherit'
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          {showConfetti && (
            <div style={{ marginTop: '24px', color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Sparkles size={20} />
              <span>جاري الانتقال للكلمة التالية... 🚂✨</span>
            </div>
          )}
        </main>
        {/* Teacher Game Manager & AI Generator Modal */}
        <TeacherGameManagerModal
          isOpen={showTeacherModal}
          onClose={() => setShowTeacherModal(false)}
          initialMode="words"
          lang={subject === 'english' ? 'english' : 'arabic'}
          onWordsUpdated={(newWords) => {
            setCustomWords(newWords)
            setCurrentLevel(0)
          }}
        />
      </div>
    </div>
  )
}

export default function TrainGame() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif' }}>
        <p style={{ color: '#059669', fontWeight: 800 }}>جاري تحميل قطار الكلمات... 🚂</p>
      </div>
    }>
      <TrainGameContent />
    </Suspense>
  )
}
