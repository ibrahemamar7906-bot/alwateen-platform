'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'

const questions = [
  { sentence: 'يقرأ الطالبُ الكتابَ بتركيز.', word: 'الطالبُ', answer: 'فاعل مرفوع', options: ['مبتدأ مرفوع', 'فاعل مرفوع', 'مفعول به منصوب', 'خبر مرفوع'] },
  { sentence: 'كان الجوُّ جميلاً اليوم.', word: 'جميلاً', answer: 'خبر كان منصوب', options: ['خبر كان منصوب', 'حال منصوب', 'صفة منصوبة', 'مفعول به'] },
  { sentence: 'إنّ العلمَ نورٌ.', word: 'العلمَ', answer: 'اسم إن منصوب', options: ['مبتدأ منصوب', 'اسم إن منصوب', 'خبر إن مرفوع', 'مضاف إليه'] },
  { sentence: 'رأيتُ عصفوراً يطيرُ.', word: 'عصفوراً', answer: 'مفعول به منصوب', options: ['حال منصوب', 'مفعول به منصوب', 'تمييز منصوب', 'مفعول مطلق'] },
  { sentence: 'الطالبان مجتهدان.', word: 'مجتهدان', answer: 'خبر مرفوع بالألف', options: ['مبتدأ مرفوع', 'صفة مرفوعة', 'خبر مرفوع بالألف', 'فاعل مرفوع'] },
  { sentence: 'شربتُ الماءَ عطشاً.', word: 'عطشاً', answer: 'مفعول لأجله', options: ['حال منصوب', 'مفعول به', 'مفعول مطلق', 'مفعول لأجله'] },
  { sentence: 'سافرتُ إلى مكةَ.', word: 'مكةَ', answer: 'اسم مجرور بالفتحة (ممنوع من الصرف)', options: ['مضاف إليه مجرور', 'اسم مجرور بالكسرة', 'اسم مجرور بالفتحة (ممنوع من الصرف)', 'مفعول به منصوب'] },
  { sentence: 'يا طالبَ العلمِ اجتهد.', word: 'طالبَ', answer: 'منادى مضاف منصوب', options: ['منادى مبني على الضم', 'مفعول به', 'منادى مضاف منصوب', 'مبتدأ'] },
  { sentence: 'اشتريتُ عشرينَ كتاباً.', word: 'عشرينَ', answer: 'مفعول به منصوب بالياء', options: ['تمييز منصوب', 'مفعول به منصوب بالياء', 'حال منصوب', 'مضاف إليه'] },
  { sentence: 'عاد الجيشُ منتصراً.', word: 'منتصراً', answer: 'حال منصوب', options: ['خبر عاد', 'مفعول به', 'حال منصوب', 'تمييز'] },
]

// Shuffle array
const shuffle = (array) => {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

export default function GrammarGames() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [shuffledQuestions, setShuffledQuestions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [addingPoints, setAddingPoints] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    checkUser()
    
    // Prepare game
    setShuffledQuestions(shuffle([...questions]).slice(0, 5)) // 5 random questions per game
  }, [router])

  const startGame = () => {
    setGameStarted(true)
    setGameEnded(false)
    setCurrentQIndex(0)
    setScore(0)
    setSelectedOption(null)
    setIsCorrect(null)
    setShuffledQuestions(shuffle([...questions]).slice(0, 5))
  }

  const handleSelect = (option) => {
    if (selectedOption) return // already answered
    setSelectedOption(option)
    const correct = option === shuffledQuestions[currentQIndex].answer
    setIsCorrect(correct)
    if (correct) setScore(score + 1)
    
    setTimeout(() => {
      if (currentQIndex < shuffledQuestions.length - 1) {
        setCurrentQIndex(currentQIndex + 1)
        setSelectedOption(null)
        setIsCorrect(null)
      } else {
        endGame(score + (correct ? 1 : 0))
      }
    }, 1500)
  }

  const endGame = async (finalScore) => {
    setGameEnded(true)
    if (finalScore === 5 && user) {
      setAddingPoints(true)
      try {
        const { data: profile } = await supabase.from('profiles').select('points').eq('id', user.id).single()
        if (profile) {
          await supabase.from('profiles').update({ points: (profile.points || 0) + 20 }).eq('id', user.id)
          alert('🎉 مبروك! لأنك أجبت على كل الأسئلة بشكل صحيح، تم إضافة 20 نقطة إلى رصيدك!')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setAddingPoints(false)
      }
    }
  }

  return (
    <div style={{minHeight: '100dvh', background: 'radial-gradient(circle at top left, #d1fae5 0%, var(--bg-main) 100%)', color: 'var(--text-dark)', fontFamily: 'var(--font-cairo)', padding: '20px'}}>
      <button onClick={() => router.push('/student-dashboard')} style={{background: 'var(--bg-card)', color: 'var(--text-dark)', border: '1px solid rgba(0,0,0,0.1)', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
        &larr; العودة للوحة القيادة
      </button>

      <div style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
        <h1 style={{fontSize: '3rem', marginBottom: '10px', color: 'var(--primary-dark)', textShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'}}>
          🎯 صائد الإعراب
        </h1>
        <p style={{fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '40px', fontWeight: 'bold'}}>
          تحدَّ نفسك في قواعد النحو والإعراب، واكسب النقاط! (مخصص للمرحلتين الإعدادية والثانوية)
        </p>

        {!gameStarted && !gameEnded && (
          <div style={{background: 'var(--bg-card)', padding: '40px', borderRadius: '30px', border: 'var(--glass-border)', boxShadow: 'var(--shadow-lg)'}}>
            <h2 style={{fontSize: '2rem', marginBottom: '20px', color: 'var(--primary-dark)'}}>هل أنت مستعد للتحدي؟</h2>
            <p style={{marginBottom: '30px', fontSize: '1.1rem', color: 'var(--text-muted)'}}>سُيعرض عليك 5 جمل، وعليك اختيار الإعراب الصحيح للكلمة المظللة. أجب على الـ 5 بشكل صحيح لتربح 20 نقطة!</p>
            <button onClick={startGame} style={{background: 'var(--primary-gradient)', color: 'white', border: 'none', padding: '15px 40px', fontSize: '1.5rem', fontWeight: 'bold', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(5, 150, 105, 0.3), 0 4px 0 #047857', transition: 'all 0.2s'}} onMouseDown={e => {e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = 'none'}} onMouseUp={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(5, 150, 105, 0.3), 0 4px 0 #047857'}}>
              ابدأ التحدي الآن 🚀
            </button>
          </div>
        )}

        {gameStarted && !gameEnded && (
          <div style={{animation: 'fadeIn 0.5s'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-dark)'}}>
              <span>السؤال: {currentQIndex + 1} / 5</span>
              <span>النقاط: {score}</span>
            </div>

            <div style={{background: 'white', color: '#1e1b4b', padding: '40px 20px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'}}>
              <h3 style={{fontSize: '2rem', marginBottom: '30px', lineHeight: '1.6'}}>
                {shuffledQuestions[currentQIndex].sentence.split(shuffledQuestions[currentQIndex].word).map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span style={{color: 'var(--primary-dark)', background: '#d1fae5', padding: '0 8px', borderRadius: '8px', borderBottom: '3px solid var(--primary-color)'}}>
                        {shuffledQuestions[currentQIndex].word}
                      </span>
                    )}
                  </span>
                ))}
              </h3>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                {shuffledQuestions[currentQIndex].options.map((opt, idx) => {
                  let btnBg = 'var(--bg-card)'
                  let btnColor = 'var(--text-dark)'
                  if (selectedOption === opt) {
                    btnBg = isCorrect ? '#10b981' : '#ef4444'
                    btnColor = 'white'
                  } else if (selectedOption && opt === shuffledQuestions[currentQIndex].answer) {
                    btnBg = '#10b981'
                    btnColor = 'white'
                  }

                  return (
                    <button 
                      key={idx}
                      onClick={() => handleSelect(opt)}
                      disabled={selectedOption !== null}
                      style={{
                        background: btnBg,
                        color: btnColor,
                        padding: '15px',
                        borderRadius: '15px',
                        border: '2px solid rgba(0,0,0,0.1)',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        cursor: selectedOption ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                      }}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {gameEnded && (
          <div style={{background: 'var(--bg-card)', padding: '40px', borderRadius: '30px', animation: 'fadeIn 0.5s', border: 'var(--glass-border)', boxShadow: 'var(--shadow-lg)'}}>
            <h2 style={{fontSize: '2.5rem', marginBottom: '20px', color: 'var(--primary-dark)'}}>
              {score === 5 ? '🏆 ممتاز جداً!' : score >= 3 ? '👍 أحسنت!' : '💪 لا بأس، تدرب أكثر!'}
            </h2>
            <p style={{fontSize: '1.5rem', marginBottom: '30px', color: 'var(--text-muted)'}}>نتيجتك: {score} من 5</p>
            
            {score === 5 && (
              <div style={{background: 'radial-gradient(circle, #d1fae5 0%, #a7f3d0 100%)', color: '#065f46', padding: '20px', borderRadius: '20px', marginBottom: '30px', fontWeight: 'bold', border: '2px dashed var(--primary-color)'}}>
                {addingPoints ? '⏳ جاري إضافة النقاط...' : '🎉 تم إضافة 20 نقطة لرصيدك!'}
              </div>
            )}

            <button onClick={startGame} style={{background: 'var(--primary-gradient)', color: 'white', border: 'none', padding: '15px 40px', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(5, 150, 105, 0.3), 0 4px 0 #047857', transition: 'all 0.2s'}} onMouseDown={e => {e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = 'none'}} onMouseUp={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(5, 150, 105, 0.3), 0 4px 0 #047857'}}>
              🔄 العب مرة أخرى
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
