'use client'

import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowRight, CheckCircle, XCircle, RotateCcw, Save, Play, BookOpen, Volume2, VolumeX } from 'lucide-react'
import { supabase } from '../../../utils/supabase'
import { GRAMMAR_DATA } from './data'
import { usePrep1Audio } from '../components/Prep1AudioContext'
import ClickableWords from '../components/ClickableWords'

export default function GrammarTrainingPage() {
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
  const totalQuestions = GRAMMAR_DATA.reduce((acc, passage) => acc + (passage.questions?.length || 0), 0)
  const currentGlobalQuestion = GRAMMAR_DATA.slice(0, currentPassageIndex).reduce((acc, passage) => acc + (passage.questions?.length || 0), 0) + currentQuestionIndex + 1

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
          .from('student_grammar_progress')
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
        .from('student_grammar_progress')
        .select('current_question_index, total_score, id')
        .eq('student_id', user.id)
        .single()

      if (existing) {
        const maxIndex = Math.max(existing.current_question_index || 0, newGlobalIndex)
        const maxScore = Math.max(existing.total_score || 0, newScore)
        setDbMaxIndex(maxIndex)
        await supabase
          .from('student_grammar_progress')
          .update({ current_question_index: maxIndex, total_score: maxScore, updated_at: new Date() })
          .eq('student_id', user.id)
      } else {
        setDbMaxIndex(newGlobalIndex)
        await supabase
          .from('student_grammar_progress')
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
    
    const currentPassage = GRAMMAR_DATA[currentPassageIndex]
    const currentQ = currentPassage.questions[currentQuestionIndex]
    
    if (option === currentQ.correctAnswer) {
      setTotalScore(prev => prev + 1)
    }
  }

  const handleNext = async () => {
    const currentPassage = GRAMMAR_DATA[currentPassageIndex]
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
    
    if (nextP >= GRAMMAR_DATA.length) {
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

  // Helper to highlight bracketed or target words
  const renderSentenceWithHighlight = (sentence, targetWord) => {
    if (!sentence) return null
    if (sentence.includes('[')) {
      const parts = sentence.split(/(\[[^\]]+\])/g)
      return parts.map((part, index) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const inner = part.slice(1, -1)
          return (
            <strong 
              key={index} 
              style={{ 
                background: '#fef08a', 
                color: '#854d0e', 
                padding: '2px 8px', 
                borderRadius: '6px', 
                borderBottom: '3px solid #eab308',
                display: 'inline-block',
                margin: '0 4px'
              }}
            >
              {inner}
            </strong>
          )
        }
        return <span key={index}>{part}</span>
      })
    }

    if (targetWord) {
      const parts = sentence.split(new RegExp(`(${targetWord})`, 'gi'))
      return parts.map((part, index) => {
        if (part === targetWord) {
          return (
            <strong 
              key={index} 
              style={{ 
                background: '#fef08a', 
                color: '#854d0e', 
                padding: '2px 8px', 
                borderRadius: '6px', 
                borderBottom: '3px solid #eab308',
                display: 'inline-block',
                margin: '0 4px'
              }}
            >
              {part}
            </strong>
          )
        }
        return <span key={index}>{part}</span>
      })
    }

    return sentence
  }

  // --- Rendering ---
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}><h2>جاري التحميل... ⏳</h2></div>

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Tajawal', direction: 'rtl' }}>
        <h2 style={{ color: '#dc2626' }}>🔒 يجب تسجيل الدخول</h2>
        <p style={{ margin: '15px 0 25px', color: '#475569' }}>يرجى تسجيل الدخول لحفظ تقدمك ونقاطك في مسار صائد الإعراب.</p>
        <Link href="/login" style={{ background: '#059669', color: 'white', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold' }}>تسجيل الدخول</Link>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center', fontFamily: 'Tajawal', background: '#f8fafc', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', direction: 'rtl' }}>
        <h1 style={{ color: '#059669', fontSize: '2.5rem', marginBottom: '20px' }}>🎉 مبروك!</h1>
        <h2 style={{ color: '#1e293b', marginBottom: '15px' }}>لقد أكملت مسار التدريب على صائد الإعراب</h2>
        <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '30px' }}>
          نتيجتك النهائية: <strong style={{ color: '#0f5132', fontSize: '1.5rem' }}>{totalScore} / {totalQuestions}</strong>
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button onClick={handleRestart} style={{ background: '#e2e8f0', color: '#1e293b', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={18} /> إعادة التدريب
          </button>
          <Link href="/prep-1/exercises" style={{ background: '#059669', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowRight size={18} /> العودة للتدريبات
          </Link>
        </div>
      </div>
    )
  }

  if (view === 'map') {
    return (
      <>
        <Head>
          <title>خريطة تدريبات صائد الإعراب</title>
        </Head>
        <div style={{ fontFamily: 'Tajawal', maxWidth: '1000px', margin: '0 auto', padding: '20px', minHeight: '100dvh', direction: 'rtl' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <h1 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '2rem' }}>🎯 خريطة صائد الإعراب</h1>
              <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>اختر الدرس للبدء في تدريباته الإعرابية التفاعلية</p>
            </div>
            <Link href="/prep-1/exercises" style={{ background: '#e2e8f0', color: '#334155', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowRight size={18} /> العودة للتدريبات
            </Link>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {GRAMMAR_DATA.map((passage, idx) => {
              const passageStartGlobal = GRAMMAR_DATA.slice(0, idx).reduce((acc, p) => acc + (p.questions?.length || 0), 0)
              const qCount = passage.questions?.length || 0
              const isCompleted = dbMaxIndex >= passageStartGlobal + qCount && qCount > 0
              const isCurrent = dbMaxIndex >= passageStartGlobal && dbMaxIndex < passageStartGlobal + qCount
              
              return (
                <div 
                  key={passage.lessonId || idx}
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
                  <h3 style={{ color: '#0f172a', margin: '0 0 10px 0', fontSize: '1.15rem', lineHeight: '1.6', paddingLeft: isCompleted ? '28px' : '0' }}>
                    {passage.lessonTitle}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#94a3b8', marginTop: '15px' }}>
                    <span>{qCount} أسئلة إعرابية</span>
                    <span style={{ 
                      background: isCompleted ? '#dcfce7' : isCurrent ? '#dbeafe' : '#f1f5f9', 
                      color: isCompleted ? '#166534' : isCurrent ? '#1e40af' : '#475569',
                      padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold'
                    }}>
                      {isCompleted ? 'مكتمل' : isCurrent ? 'قيد التقدم' : 'متاح للتدريب'}
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

  const currentPassage = GRAMMAR_DATA[currentPassageIndex]
  const currentQ = currentPassage.questions[currentQuestionIndex]

  return (
    <>
      <Head>
        <title>تدريب صائد الإعراب | الصف الأول الإعدادي</title>
      </Head>
      <div style={{ fontFamily: 'Tajawal', maxWidth: '1000px', margin: '0 auto', padding: '20px', minHeight: '100dvh', display: 'flex', flexDirection: 'column', direction: 'rtl' }}>
        
        {/* Header & Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎯 تدريب صائد الإعراب
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>{currentPassage.lessonTitle}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {saving && <span style={{ color: '#059669', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}><Save size={16} /> جاري الحفظ...</span>}
            <button onClick={() => setView('map')} style={{ background: '#e2e8f0', color: '#1e293b', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>خريطة الدروس</button>
            <button onClick={handleRestart} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} title="إعادة من البداية"><RotateCcw size={20} /></button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', marginBottom: '25px', overflow: 'hidden' }}>
          <div style={{ background: '#059669', height: '100%', width: `${((currentGlobalQuestion - 1) / totalQuestions) * 100}%`, transition: 'width 0.3s ease' }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#475569', fontWeight: 'bold' }}>
          <span>السؤال {currentGlobalQuestion} من {totalQuestions}</span>
          <span>النقاط: {totalScore}</span>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', flex: 1 }}>
          
          {/* Sentence / Passage Card with Audio and Clickable Words */}
          <div style={{ background: isSpeaking && currentId === `grammar-q-${currentPassageIndex}-${currentQuestionIndex}` ? '#f0fdf4' : '#f8fafc', padding: '25px', borderRadius: '16px', border: isSpeaking && currentId === `grammar-q-${currentPassageIndex}-${currentQuestionIndex}` ? '2px solid #059669' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '2px solid #cbd5e1', paddingBottom: '10px' }}>
              <h3 style={{ color: '#334155', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                <Play size={18} color="#059669" /> اقرأ الجملة بتركيز:
              </h3>
              <button
                onClick={() => playText(`grammar-q-${currentPassageIndex}-${currentQuestionIndex}`, currentQ.sentence)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: isSpeaking && currentId === `grammar-q-${currentPassageIndex}-${currentQuestionIndex}` ? '#dc2626' : '#059669',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  fontFamily: 'Tajawal, sans-serif',
                  boxShadow: isSpeaking && currentId === `grammar-q-${currentPassageIndex}-${currentQuestionIndex}` ? '0 2px 8px rgba(220,38,38,0.3)' : '0 2px 8px rgba(5,150,105,0.25)'
                }}
                title="استمع إلى قراءة الجملة"
              >
                {isSpeaking && currentId === `grammar-q-${currentPassageIndex}-${currentQuestionIndex}` ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span>{isSpeaking && currentId === `grammar-q-${currentPassageIndex}-${currentQuestionIndex}` ? 'إيقاف' : 'قراءة الجملة'}</span>
              </button>
            </div>
            <div style={{ fontSize: '1.35rem', lineHeight: '2.1', color: '#1e293b', margin: 'auto 0', padding: '15px 0' }}>
              <ClickableWords text={currentQ.sentence} highlightTargetWord={currentQ.targetWord} />
            </div>
            <div style={{ marginTop: 'auto', background: '#ecfdf5', padding: '12px 16px', borderRadius: '10px', color: '#047857', fontSize: '0.95rem' }}>
              💡 المطلوب: حدد الموقع الإعرابي السليم للكلمة المميزة باللون الأصفر (يمكنك الضغط على أي كلمة لسماع نطقها).
            </div>
          </div>

          {/* Question & Options */}
          <div>
            <div style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h2 style={{ color: '#0f172a', marginBottom: '20px', fontSize: '1.25rem', lineHeight: '1.6' }}>
                ما الإعراب الصحيح لكلمة <strong style={{ color: '#059669' }}>"{currentQ.targetWord}"</strong> في الجملة؟
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
                    transition: 'all 0.2s',
                    width: '100%'
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
                        {!showExplanation && <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #cbd5e1', flexShrink: 0 }}></div>}
                        <span>{option}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Explanation & Next Button */}
              {showExplanation && (
                <div style={{ marginTop: '25px', padding: '20px', background: selectedOption === currentQ.correctAnswer ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', borderRight: `4px solid ${selectedOption === currentQ.correctAnswer ? '#22c55e' : '#ef4444'}` }}>
                  <h4 style={{ margin: '0 0 10px 0', color: selectedOption === currentQ.correctAnswer ? '#15803d' : '#b91c1c', fontSize: '1.1rem' }}>
                    {selectedOption === currentQ.correctAnswer ? 'إجابة صحيحة وممتازة! 🎉' : 'إجابة غير صحيحة 💡'}
                  </h4>
                  <p style={{ color: '#334155', lineHeight: '1.7', margin: '0 0 20px 0', fontSize: '1.05rem' }}>{currentQ.explanation}</p>
                  
                  <button onClick={handleNext} style={{ width: '100%', background: '#0f172a', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Tajawal', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
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
