'use client'

import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowRight, CheckCircle, XCircle, RotateCcw, Save, Play, Volume2, VolumeX } from 'lucide-react'
import { supabase } from '../../../utils/supabase'
import { INFERENCE_DATA } from './data'
import { usePrep1Audio } from '../components/Prep1AudioContext'
import ClickableWords from '../components/ClickableWords'

export default function InferenceTrainingPage() {
  const { playText, currentId, isSpeaking } = usePrep1Audio()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // State for progress
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  
  const [view, setView] = useState('map') // 'map' or 'play'
  
  const [isFinished, setIsFinished] = useState(false)
  const [saving, setSaving] = useState(false)

  // Calculate total questions for progress bar
  const totalQuestions = INFERENCE_DATA.reduce((acc, passage) => acc + passage.questions.length, 0)
  const currentGlobalQuestion = INFERENCE_DATA.slice(0, currentPassageIndex).reduce((acc, passage) => acc + passage.questions.length, 0) + currentQuestionIndex + 1

  const [dbMaxIndex, setDbMaxIndex] = useState(0)

  useEffect(() => {
    const fetchUserAndProgress = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setLoading(false)
          return
        }
        setUser(session.user)

        // Fetch Progress
        const { data: progressData } = await supabase
          .from('student_inference_progress')
          .select('*')
          .eq('student_id', session.user.id)
          .single()

        if (progressData) {
          setDbMaxIndex(progressData.current_question_index || 0)
          setTotalScore(progressData.total_score || 0)
        }
      } catch (err) {
        console.error('Error fetching progress', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUserAndProgress()
  }, [])

  const saveProgress = async (newGlobalIndex, newScore) => {
    if (!user) return
    setSaving(true)
    try {
      const { data: existing } = await supabase
        .from('student_inference_progress')
        .select('current_question_index, total_score, id')
        .eq('student_id', user.id)
        .single()

      if (existing) {
        const maxIndex = Math.max(existing.current_question_index || 0, newGlobalIndex)
        const maxScore = Math.max(existing.total_score || 0, newScore)
        setDbMaxIndex(maxIndex)
        await supabase
          .from('student_inference_progress')
          .update({ current_question_index: maxIndex, total_score: maxScore, updated_at: new Date() })
          .eq('student_id', user.id)
      } else {
        setDbMaxIndex(newGlobalIndex)
        await supabase
          .from('student_inference_progress')
          .insert({ student_id: user.id, current_question_index: newGlobalIndex, total_score: newScore })
      }
    } catch (err) {
      console.error('Error saving progress', err)
    } finally {
      setSaving(false)
    }
  }

  const handleOptionSelect = (option) => {
    if (selectedOption || showExplanation) return // Prevent multiple clicks
    setSelectedOption(option)
    setShowExplanation(true)
    
    const currentPassage = INFERENCE_DATA[currentPassageIndex]
    const currentQ = currentPassage.questions[currentQuestionIndex]
    
    if (option === currentQ.correctAnswer) {
      setTotalScore(prev => prev + 1)
    }
  }

  const handleNext = async () => {
    const currentPassage = INFERENCE_DATA[currentPassageIndex]
    let nextP = currentPassageIndex
    let nextQ = currentQuestionIndex + 1
    
    if (nextQ >= currentPassage.questions.length) {
      nextP += 1
      nextQ = 0
    }
    
    setSelectedOption(null)
    setShowExplanation(false)
    
    const newGlobalIndex = currentGlobalQuestion
    
    // Save progress
    const currentQData = currentPassage.questions[currentQuestionIndex]
    const isCorrect = selectedOption === currentQData.correctAnswer
    const newScore = isCorrect ? totalScore + 1 : totalScore
    await saveProgress(newGlobalIndex, newScore)
    
    if (nextP >= INFERENCE_DATA.length) {
      setIsFinished(true)
    } else if (nextQ === 0) {
      // Finished a passage, return to map
      setView('map')
    } else {
      setCurrentPassageIndex(nextP)
      setCurrentQuestionIndex(nextQ)
    }
  }

  const handleRestart = async () => {
    setCurrentPassageIndex(0)
    setCurrentQuestionIndex(0)
    setTotalScore(0)
    setSelectedOption(null)
    setShowExplanation(false)
    setIsFinished(false)
    setView('map')
  }

  // --- Rendering ---
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}><h2>جاري التحميل... ⏳</h2></div>

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Tajawal' }}>
        <h2 style={{ color: '#dc2626' }}>🔒 يجب تسجيل الدخول</h2>
        <p>يرجى تسجيل الدخول لحفظ تقدمك في مسار استنتاج المعاني.</p>
        <Link href="/login" style={{ background: '#059669', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none' }}>تسجيل الدخول</Link>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center', fontFamily: 'Tajawal', background: '#f8fafc', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h1 style={{ color: '#059669', fontSize: '2.5rem', marginBottom: '20px' }}>🎉 مبروك!</h1>
        <h2 style={{ color: '#1e293b', marginBottom: '15px' }}>لقد أكملت مسار التدريب على استنتاج المعاني</h2>
        <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '30px' }}>
          نتيجتك النهائية: <strong style={{ color: '#0f5132', fontSize: '1.5rem' }}>{totalScore} / {totalQuestions}</strong>
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button onClick={handleRestart} style={{ background: '#e2e8f0', color: '#1e293b', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={18} /> إعادة التدريب
          </button>
          <Link href="/student-dashboard" style={{ background: '#059669', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowRight size={18} /> العودة للوحة القيادة
          </Link>
        </div>
      </div>
    )
  }

  if (view === 'map') {
    return (
      <>
        <Head>
          <title>خريطة تدريبات استنتاج المعاني</title>
        </Head>
        <div style={{ fontFamily: 'Tajawal', maxWidth: '1000px', margin: '0 auto', padding: '20px', minHeight: '100dvh' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <h1 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '2rem' }}>🗺️ خريطة استنتاج المعاني</h1>
              <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>اختر الدرس للبدء في تدريباته الخاصة</p>
            </div>
            <Link href="/prep-1/exercises" style={{ background: '#e2e8f0', color: '#334155', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
              العودة للتدريبات
            </Link>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {INFERENCE_DATA.map((passage, idx) => {
              // Calculate if unlocked (all are open now as requested, but we can show progress)
              const passageStartGlobal = INFERENCE_DATA.slice(0, idx).reduce((acc, p) => acc + p.questions.length, 0)
              const isCompleted = dbMaxIndex >= passageStartGlobal + passage.questions.length
              const isCurrent = dbMaxIndex >= passageStartGlobal && dbMaxIndex < passageStartGlobal + passage.questions.length
              
              return (
                <div 
                  key={passage.id}
                  onClick={() => {
                    setCurrentPassageIndex(idx);
                    setCurrentQuestionIndex(0);
                    setSelectedOption(null);
                    setShowExplanation(false);
                    setView('play');
                  }}
                  style={{
                    background: 'white',
                    border: '2px solid',
                    borderColor: isCompleted ? '#10b981' : isCurrent ? '#3b82f6' : '#e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)' }}
                >
                  {isCompleted && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', color: '#10b981' }}>
                      <CheckCircle size={24} />
                    </div>
                  )}
                  <h3 style={{ color: '#0f172a', margin: '0 0 10px 0', fontSize: '1.2rem', paddingRight: '25px' }}>{passage.unit}</h3>
                  <p style={{ color: '#64748b', margin: '0 0 15px 0' }}>{passage.title}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
                    <span>{passage.questions.length} أسئلة</span>
                    <span style={{ 
                      background: isCompleted ? '#dcfce7' : isCurrent ? '#dbeafe' : '#f1f5f9', 
                      color: isCompleted ? '#166534' : isCurrent ? '#1e40af' : '#475569',
                      padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold'
                    }}>
                      {isCompleted ? 'مكتمل' : isCurrent ? 'قيد التقدم' : 'متاح للتجربة'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  const currentPassage = INFERENCE_DATA[currentPassageIndex]
  const currentQ = currentPassage.questions[currentQuestionIndex]

  // Highlight the target word in the text
  const highlightedText = currentPassage.text.split(new RegExp(`(${currentQ.word})`, 'gi')).map((part, index) => {
    if (part.toLowerCase() === currentQ.word.toLowerCase()) {
      return <strong key={index} style={{ background: '#fef08a', color: '#854d0e', padding: '2px 6px', borderRadius: '4px', borderBottom: '2px solid #eab308' }}>{part}</strong>
    }
    return part
  })

  return (
    <>
      <Head>
        <title>تدريب استنتاج المعاني | مساعد المعلم</title>
      </Head>
      <div style={{ fontFamily: 'Tajawal', maxWidth: '1000px', margin: '0 auto', padding: '20px', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header & Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '1.5rem' }}>💡 تدريب استنتاج المعاني</h1>
            <p style={{ color: '#64748b', margin: 0 }}>{currentPassage.unit}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {saving && <span style={{ color: '#059669', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}><Save size={16} /> جاري الحفظ...</span>}
            <button onClick={() => setView('map')} style={{ background: '#e2e8f0', color: '#1e293b', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>عودة للفهرس</button>
            <button onClick={handleRestart} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} title="إعادة من البداية"><RotateCcw size={20} /></button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', marginBottom: '30px', overflow: 'hidden' }}>
          <div style={{ background: '#059669', height: '100%', width: `${((currentGlobalQuestion - 1) / totalQuestions) * 100}%`, transition: 'width 0.3s ease' }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#475569', fontWeight: 'bold' }}>
          <span>السؤال {currentGlobalQuestion} من {totalQuestions}</span>
          <span>النقاط: {totalScore}</span>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', flex: 1 }}>
          
          {/* Right Column: Passage with Audio and Clickable Words */}
          <div style={{ background: isPlayingPassage ? '#f0fdf4' : '#f8fafc', padding: '25px', borderRadius: '16px', border: isPlayingPassage ? '2px solid #059669' : '1px solid #e2e8f0', transition: 'all 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '2px solid #cbd5e1', paddingBottom: '10px' }}>
              <h3 style={{ color: '#334155', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                <Play size={18} color="#059669" /> اقرأ النص التالي:
              </h3>
              <button
                onClick={() => playText(`inference-passage-${currentPassageIndex}`, currentPassage.text)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: isPlayingPassage ? '#dc2626' : '#059669',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  fontFamily: 'Tajawal, sans-serif',
                  boxShadow: isPlayingPassage ? '0 2px 8px rgba(220,38,38,0.3)' : '0 2px 8px rgba(5,150,105,0.25)'
                }}
                title="استمع لقراءة الفقرة"
              >
                {isPlayingPassage ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span>{isPlayingPassage ? 'إيقاف' : 'قراءة الفقرة'}</span>
              </button>
            </div>
            <p style={{ fontSize: '1.25rem', lineHeight: '2.1', color: '#1e293b' }}>
              <ClickableWords text={currentPassage.text} highlightTargetWord={currentQ.word} />
            </p>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '12px' }}>
              💡 يمكنك الاستماع للفقرة كاملة أو الضغط على أي كلمة في النص لسماع نطقها فوراً.
            </div>
          </div>

          {/* Left Column: Question & Options */}
          <div>
            <div style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h2 style={{ color: '#0f172a', marginBottom: '20px', fontSize: '1.3rem' }}>
                استنتج من السياق: ما معنى كلمة <strong style={{ color: '#059669' }}>"{currentQ.word}"</strong> المظللة في النص؟
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentQ.options.map((option, idx) => {
                  let btnStyle = {
                    padding: '16px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    background: 'white',
                    color: '#334155',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: selectedOption ? 'default' : 'pointer',
                    textAlign: 'right',
                    fontFamily: 'Tajawal',
                    transition: 'all 0.2s'
                  }

                  if (showExplanation) {
                    if (option === currentQ.correctAnswer) {
                      btnStyle.border = '2px solid #22c55e'
                      btnStyle.background = '#f0fdf4'
                      btnStyle.color = '#15803d'
                    } else if (option === selectedOption && option !== currentQ.correctAnswer) {
                      btnStyle.border = '2px solid #ef4444'
                      btnStyle.background = '#fef2f2'
                      btnStyle.color = '#b91c1c'
                    }
                  } else {
                    if (selectedOption === option) {
                      btnStyle.border = '2px solid #059669'
                      btnStyle.background = '#f0fdf4'
                    }
                  }

                  return (
                    <button 
                      key={idx} 
                      onClick={() => handleOptionSelect(option)}
                      style={btnStyle}
                      disabled={!!selectedOption}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {showExplanation && option === currentQ.correctAnswer && <CheckCircle size={20} color="#22c55e" />}
                        {showExplanation && option === selectedOption && option !== currentQ.correctAnswer && <XCircle size={20} color="#ef4444" />}
                        {!showExplanation && <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #cbd5e1' }}></div>}
                        {option}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Explanation & Next Button */}
              {showExplanation && (
                <div style={{ marginTop: '25px', padding: '20px', background: selectedOption === currentQ.correctAnswer ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', borderLeft: `4px solid ${selectedOption === currentQ.correctAnswer ? '#22c55e' : '#ef4444'}` }}>
                  <h4 style={{ margin: '0 0 10px 0', color: selectedOption === currentQ.correctAnswer ? '#15803d' : '#b91c1c' }}>
                    {selectedOption === currentQ.correctAnswer ? 'إجابة صحيحة! 🎉' : 'إجابة غير صحيحة 💡'}
                  </h4>
                  <p style={{ color: '#334155', lineHeight: '1.6', margin: '0 0 20px 0' }}>{currentQ.explanation}</p>
                  
                  <button onClick={handleNext} style={{ width: '100%', background: '#0f172a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Tajawal', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    السؤال التالي <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
