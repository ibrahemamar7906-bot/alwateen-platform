'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { getInfinitePuzzleLevel } from '../../utils/infiniteGameGenerator'
import { loadCustomGameWords, formatCustomWordToPuzzleLevel } from '../../utils/customGameStore'
import TeacherGameManagerModal from '../../components/TeacherGameManagerModal'

export default function WordPuzzle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subject = searchParams.get('subject') || 'arabic'
  
  const arabicWords = [
    { word: 'أسد', image: '🦁', hint: 'ملك الغابة' },
    { word: 'تفاحة', image: '🍎', hint: 'فاكهة حمراء لذيذة' },
    { word: 'بطة', image: '🦆', hint: 'طائر يسبح في الماء' },
    { word: 'قطة', image: '🐱', hint: 'حيوان أليف يحب اللعب' },
    { word: 'شمس', image: '☀️', hint: 'تضيء لنا النهار' },
    { word: 'قمر', image: '🌙', hint: 'ينير لنا الليل' },
    { word: 'كلب', image: '🐶', hint: 'حيوان وفي يحرس المنزل' },
    { word: 'شجرة', image: '🌳', hint: 'نبات كبير يعطينا الظل' },
    { word: 'وردة', image: '🌹', hint: 'زهرة جميلة وذات رائحة عطرة' },
    { word: 'كتاب', image: '📖', hint: 'نقرأ فيه لنتعلم' },
    { word: 'سيارة', image: '🚗', hint: 'وسيلة مواصلات تسير في الشارع' },
    { word: 'طائرة', image: '✈️', hint: 'وسيلة تطير في السماء' },
    { word: 'قطار', image: '🚂', hint: 'يمشي على القضبان الحديدية' },
    { word: 'حصان', image: '🐎', hint: 'حيوان سريع وجميل' },
    { word: 'بقرة', image: '🐄', hint: 'تعطينا الحليب اللذيذ' },
    { word: 'فيل', image: '🐘', hint: 'حيوان ضخم له خرطوم طويل' },
    { word: 'عصفور', image: '🐦', hint: 'طائر يطير في السماء' },
    { word: 'سمكة', image: '🐟', hint: 'حيوان يعيش في الماء' },
    { word: 'فراشة', image: '🦋', hint: 'حشرة جميلة بألوان زاهية' },
    { word: 'نحلة', image: '🐝', hint: 'تصنع لنا العسل' },
    { word: 'قرد', image: '🐒', hint: 'يحب أكل الموز' },
    { word: 'زرافة', image: '🦒', hint: 'لها رقبة طويلة جداً' },
    { word: 'نمر', image: '🐅', hint: 'حيوان مفترس وسريع' },
    { word: 'تمساح', image: '🐊', hint: 'يعيش في النهر وله أسنان حادة' },
    { word: 'ثعبان', image: '🐍', hint: 'حيوان يزحف على الأرض' },
    { word: 'ضفدع', image: '🐸', hint: 'يقفز ويحب الماء' },
    { word: 'دجاجة', image: '🐔', hint: 'تعطينا البيض اللذيذ' },
    { word: 'خروف', image: '🐑', hint: 'نأخذ منه الصوف' },
    { word: 'عنب', image: '🍇', hint: 'فاكهة لذيذة تصنع على شكل عنقود' },
    { word: 'موز', image: '🍌', hint: 'فاكهة صفراء يحبها القرد' },
    { word: 'برتقال', image: '🍊', hint: 'فاكهة غنية بفيتامين سي' },
    { word: 'بطيخ', image: '🍉', hint: 'فاكهة صيفية كبيرة ومنعشة' },
    { word: 'فراولة', image: '🍓', hint: 'فاكهة حمراء صغيرة ولذيذة' },
    { word: 'جزر', image: '🥕', hint: 'خضار يقوي النظر ويحبه الأرنب' },
    { word: 'طماطم', image: '🍅', hint: 'خضار أحمر نضعه في السلطة' },
    { word: 'ذرة', image: '🌽', hint: 'نبات أصفر لذيذ ومفيد' },
    { word: 'خبز', image: '🍞', hint: 'نأكله كل يوم ونصنعه من القمح' },
    { word: 'حليب', image: '🥛', hint: 'مشروب أبيض يقوي العظام' },
    { word: 'جبن', image: '🧀', hint: 'طعام لذيذ يصنع من الحليب' }
  ]

  const englishWords = [
    { word: 'APPLE', image: '🍎', hint: 'A red fruit' },
    { word: 'DOG', image: '🐶', hint: 'A loyal pet' },
    { word: 'SUN', image: '☀️', hint: 'Shines in the day' },
    { word: 'CAR', image: '🚗', hint: 'You drive it' },
    { word: 'FISH', image: '🐟', hint: 'Swims in water' },
    { word: 'BIRD', image: '🐦', hint: 'Flies in the sky' },
    { word: 'CAT', image: '🐱', hint: 'Says meow' },
    { word: 'MOON', image: '🌙', hint: 'Shines at night' },
    { word: 'TREE', image: '🌳', hint: 'Has green leaves' },
    { word: 'BOOK', image: '📖', hint: 'You read it' },
    { word: 'STAR', image: '⭐', hint: 'Twinkles in the sky' },
    { word: 'HOUSE', image: '🏠', hint: 'Where you live' },
    { word: 'MILK', image: '🥛', hint: 'White drink from cows' },
    { word: 'BALL', image: '⚽', hint: 'You kick or throw it' },
    { word: 'SHOE', image: '👞', hint: 'You wear it on your foot' },
    { word: 'BREAD', image: '🍞', hint: 'Made from flour, baked' },
    { word: 'FIRE', image: '🔥', hint: 'Hot and bright' },
    { word: 'WATER', image: '💧', hint: 'You drink it when thirsty' },
    { word: 'CHAIR', image: '🪑', hint: 'You sit on it' },
    { word: 'TABLE', image: '🪚', hint: 'You put your food on it' },
    { word: 'CLOCK', image: '⏰', hint: 'Tells the time' },
    { word: 'TRAIN', image: '🚂', hint: 'Moves on tracks' },
    { word: 'PLANE', image: '✈️', hint: 'Flies in the air' },
    { word: 'BOAT', image: '⛵', hint: 'Sails on the sea' },
    { word: 'BEAR', image: '🐻', hint: 'Big furry animal' },
    { word: 'DUCK', image: '🦆', hint: 'Says quack' },
    { word: 'FROG', image: '🐸', hint: 'Jumps and says ribbit' },
    { word: 'LION', image: '🦁', hint: 'King of the jungle' }
  ]

  const mathWords = [
    { word: '1234', image: '🔢', hint: 'رتب الأرقام تصاعدياً' },
    { word: '5678', image: '🔢', hint: 'رتب الأرقام تصاعدياً' },
    { word: '2468', image: '🔢', hint: 'رتب الأرقام الزوجية' },
    { word: '1357', image: '🔢', hint: 'رتب الأرقام الفردية' },
    { word: '1+2=3', image: '➕', hint: 'رتب المعادلة الصحيحة' },
    { word: '5-2=3', image: '➖', hint: 'رتب المعادلة الصحيحة' },
    { word: '2+2=4', image: '➕', hint: 'رتب المعادلة الصحيحة' },
    { word: '4-1=3', image: '➖', hint: 'رتب المعادلة الصحيحة' },
    { word: '10>5', image: '🔟', hint: 'رتب المتباينة الصحيحة' },
    { word: '8<10', image: '🎱', hint: 'رتب المتباينة الصحيحة' },
    { word: '5+5=10', image: '➕', hint: 'رتب المعادلة الصحيحة' },
    { word: '7-3=4', image: '➖', hint: 'رتب المعادلة الصحيحة' },
    { word: '3+4=7', image: '➕', hint: 'رتب المعادلة الصحيحة' },
    { word: '9-5=4', image: '➖', hint: 'رتب المعادلة الصحيحة' },
    { word: '0123', image: '🔢', hint: 'رتب الأرقام تصاعدياً بدءاً من الصفر' },
    { word: '3210', image: '🔢', hint: 'رتب الأرقام تنازلياً' },
    { word: '9876', image: '🔢', hint: 'رتب الأرقام تنازلياً' },
    { word: '6+4=10', image: '➕', hint: 'رتب المعادلة الصحيحة' }
  ]

  let words = arabicWords;
  if (subject === 'english') words = englishWords;
  if (subject === 'math') words = mathWords;

  const [currentLevel, setCurrentLevel] = useState(0)
  const [shuffledLetters, setShuffledLetters] = useState([])
  const [placedLetters, setPlacedLetters] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)
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

  const currentPuzzle = React.useMemo(() => {
    if (customWords && currentLevel < customWords.length) {
      const formatted = formatCustomWordToPuzzleLevel(customWords[currentLevel], subject)
      if (formatted) return formatted
    }
    return getInfinitePuzzleLevel(subject, currentLevel - (customWords ? customWords.length : 0))
  }, [subject, currentLevel, customWords])

  useEffect(() => {
    loadLevel()
  }, [currentLevel, currentPuzzle])

  const loadLevel = () => {
    const word = currentPuzzle.word
    const letters = word.split('').sort(() => Math.random() - 0.5)
    setShuffledLetters(letters)
    setPlacedLetters(Array(word.length).fill(null))
    setShowSuccess(false)
  }

  const handleLetterClick = (letter, idx) => {
    // Find first empty spot
    const emptyIndex = placedLetters.indexOf(null)
    if (emptyIndex === -1) return

    const newPlaced = [...placedLetters]
    newPlaced[emptyIndex] = letter
    setPlacedLetters(newPlaced)

    const newShuffled = [...shuffledLetters]
    newShuffled[idx] = null
    setShuffledLetters(newShuffled)

    // Check win condition
    if (newPlaced.join('') === currentPuzzle.word) {
      setShowSuccess(true)
    }
  }

  const handlePlacedClick = (letter, idx) => {
    if (!letter) return
    
    // Return to shuffled letters
    const emptyShuffledIndex = shuffledLetters.indexOf(null)
    const newShuffled = [...shuffledLetters]
    newShuffled[emptyShuffledIndex] = letter
    setShuffledLetters(newShuffled)

    const newPlaced = [...placedLetters]
    newPlaced[idx] = null
    setPlacedLetters(newPlaced)
  }

  const handleNext = () => {
    setCurrentLevel(prev => prev + 1)
  }

  return (
    <div style={{minHeight: '100dvh', background: 'url(/bg-kids.png) #ccfbf1 center/cover', padding: '40px 20px', fontFamily: 'Tajawal, sans-serif', textAlign: 'center'}}>
      <div style={{background: 'rgba(255,255,255,0.95)', maxWidth: '800px', margin: '0 auto', padding: '40px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
        
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
          <button onClick={() => router.back()} style={{background: '#9ca3af', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold'}}>
            &larr; رجوع
          </button>
          <h1 style={{color: '#14b8a6', margin: 0, fontSize: '2.5rem', textShadow: '2px 2px 0px #ccfbf1'}}>تركيب الكلمات 🧩</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{background: '#fde047', padding: '10px 20px', borderRadius: '20px', fontWeight: '900', fontSize: '1.2rem', color: '#854d0e', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <span>♾️ اللغز رقم {currentLevel + 1}</span>
            </div>
            <button
              onClick={() => setShowTeacherModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.9rem',
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
        </div>

        <div style={{fontSize: '6rem', margin: '20px 0', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.2))'}}>
          {currentPuzzle.image}
        </div>
        
        <p style={{fontSize: '1.5rem', color: '#4b5563', marginBottom: '30px', fontWeight: 'bold'}}>
          💡 تلميح: {currentPuzzle.hint}
        </p>

        {/* Placed Letters (Target) */}
        <div style={{display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px', minHeight: '80px'}} dir={subject === 'arabic' ? 'rtl' : 'ltr'}>
          {placedLetters.map((letter, idx) => (
            <div 
              key={idx} 
              onClick={() => handlePlacedClick(letter, idx)}
              style={{
                width: '80px', height: '80px', 
                background: letter ? '#3b82f6' : '#e5e7eb',
                border: letter ? 'none' : '3px dashed #9ca3af',
                color: 'white',
                fontSize: '3rem',
                fontWeight: 'bold',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                borderRadius: '15px',
                cursor: letter ? 'pointer' : 'default',
                boxShadow: letter ? '0 5px 0px #2563eb' : 'none',
                transform: letter ? 'scale(1)' : 'scale(0.95)',
                transition: 'all 0.2s'
              }}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Shuffled Letters (Source) */}
        <div style={{display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap'}} dir={subject === 'arabic' ? 'rtl' : 'ltr'}>
          {shuffledLetters.map((letter, idx) => (
            <div 
              key={idx} 
              onClick={() => letter && handleLetterClick(letter, idx)}
              style={{
                width: '70px', height: '70px', 
                background: letter ? '#f43f5e' : 'transparent',
                color: 'white',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                borderRadius: '15px',
                cursor: letter ? 'pointer' : 'default',
                boxShadow: letter ? '0 5px 0px #e11d48' : 'none',
                opacity: letter ? 1 : 0,
                transition: 'all 0.2s'
              }}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div style={{marginTop: '40px', animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'}}>
            <h2 style={{color: '#10b981', fontSize: '3rem', margin: '0 0 20px 0'}}>أحسنت بطل! 🎉</h2>
            <button 
              onClick={handleNext}
              style={{background: '#10b981', color: 'white', border: 'none', padding: '15px 40px', borderRadius: '30px', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 5px 0px #059669'}}
            >
              الكلمة التالية &larr;
            </button>
          </div>
        )}

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

        <style>{`
          @keyframes popIn {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  )
}
