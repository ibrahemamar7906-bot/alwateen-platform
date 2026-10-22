'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Head from 'next/head'
import { supabase } from '../../utils/supabase'
import styles from './page.module.css'
import { CheckCircle2, ChevronLeft } from 'lucide-react'

function QuizContent() {
  const searchParams = useSearchParams()
  const quizId = searchParams.get('id')
  
  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz] = useState(null)
  const [error, setError] = useState('')
  
  const [step, setStep] = useState('join') // join | quiz | result
  const [studentName, setStudentName] = useState('')
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { questionIndex: selectedOptionIndex }
  const [score, setScore] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (quizId) fetchQuiz()
    else {
      setError('لا يوجد معرف للاختبار.')
      setLoading(false)
    }
  }, [quizId])

  const fetchQuiz = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_quizzes')
        .select('*')
        .eq('id', quizId)
        .eq('is_active', true)
        .single()
      
      if (error || !data) throw new Error('هذا الاختبار غير متاح حالياً.')
      
      setQuiz(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStart = (e) => {
    e.preventDefault()
    if (!studentName.trim()) {
      alert('الرجاء إدخال اسمك أولاً')
      return
    }
    setStep('quiz')
  }

  const handleSelectOption = (optIndex) => {
    setAnswers({ ...answers, [currentIndex]: optIndex })
  }

  const handleNext = () => {
    if (answers[currentIndex] === undefined) {
      alert('الرجاء اختيار إجابة!')
      return
    }
    
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      submitQuiz()
    }
  }

  const submitQuiz = async () => {
    setSubmitting(true)
    try {
      // Calculate Score
      let finalScore = 0
      quiz.questions.forEach((q, idx) => {
        if (answers[idx] === q.correctIndex) {
          finalScore++
        }
      })
      setScore(finalScore)

      // Submit to Supabase Realtime Table
      const { error } = await supabase.from('quiz_submissions').insert([{
        quiz_id: quizId,
        student_name: studentName.trim(),
        score: finalScore,
        total_questions: quiz.questions.length, // Fixed column name
        answers: answers
      }])

      if (error) throw error
      
      setStep('result')
    } catch (e) {
      alert('حدث خطأ أثناء إرسال النتيجة')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{padding:'50px',textAlign:'center'}}>جاري تحميل الاختبار...</div>
  
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.centerScreen}>
          <div className={styles.card} style={{textAlign:'center', color:'#ef4444'}}>
            <h2>❌ عذراً</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── JOIN SCREEN ───
  if (step === 'join') {
    return (
      <div className={styles.container}>
        <Head><title>{quiz.title}</title></Head>
        <div className={styles.centerScreen}>
          <div className={styles.card}>
            <h1 className={styles.title}>{quiz.title}</h1>
            <p className={styles.subtitle}>يتكون هذا الاختبار من {quiz.questions.length} سؤال</p>
            
            <form onSubmit={handleStart}>
              <input 
                type="text" 
                className={styles.input}
                placeholder="أدخل اسمك الثلاثي"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
              />
              <button type="submit" className={styles.btn}>بدء الاختبار 🚀</button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ─── QUIZ SCREEN ───
  if (step === 'quiz') {
    const currentQ = quiz.questions[currentIndex]
    
    return (
      <div className={styles.container}>
        <Head><title>سؤال {currentIndex + 1} | {quiz.title}</title></Head>
        
        <header className={styles.headerBar}>
          <div style={{fontWeight:'bold'}}>{quiz.title}</div>
          <div className={styles.progressPill}>
            سؤال {currentIndex + 1} من {quiz.questions.length}
          </div>
        </header>

        <div className={styles.centerScreen} style={{alignItems: 'flex-start', paddingTop: '40px'}}>
          <div className={styles.card} style={{width: '100%'}}>
            <div className={styles.questionText}>{currentQ.text}</div>
            
            <div className={styles.optionsGrid}>
              {currentQ.options.map((opt, idx) => (
                <button 
                  key={idx}
                  className={`${styles.optionBtn} ${answers[currentIndex] === idx ? styles.selected : ''}`}
                  onClick={() => handleSelectOption(idx)}
                >
                  {opt}
                </button>
              ))}
            </div>

            <button 
              className={styles.btn} 
              style={{marginTop: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}
              onClick={handleNext}
              disabled={submitting}
            >
              {currentIndex < quiz.questions.length - 1 ? (
                <>السؤال التالي <ChevronLeft size={20} /></>
              ) : (
                submitting ? 'جاري التسليم...' : 'تسليم الإجابات ✅'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── RESULT SCREEN ───
  if (step === 'result') {
    const isPass = score >= quiz.questions.length / 2
    return (
      <div className={styles.container}>
        <Head><title>النتيجة النهائية</title></Head>
        <div className={styles.centerScreen}>
          <div className={styles.card}>
            <div className={styles.resultBox}>
              <CheckCircle2 size={64} color="#10b981" style={{marginBottom: '20px'}} />
              <h1 className={styles.title}>تم تسليم إجاباتك بنجاح!</h1>
              <p className={styles.subtitle}>أحسنت يا {studentName}، نتيجتك هي:</p>
              
              <div className={`${styles.scoreCircle} ${!isPass ? styles.low : ''}`}>
                {score} / {quiz.questions.length}
              </div>
              
              <p style={{color: '#64748b'}}>تم إرسال نتيجتك إلى شاشة المعلم.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default function StudentQuizViewWrapper() {
  return (
    <Suspense fallback={<div style={{padding:'50px',textAlign:'center'}}>جاري التحميل...</div>}>
      <QuizContent />
    </Suspense>
  )
}
