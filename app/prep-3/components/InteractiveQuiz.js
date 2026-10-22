'use client'

import React, { useState, useCallback } from 'react'
import { CheckCircle2, XCircle, RotateCcw, Volume2, VolumeX, Trophy, Sparkles, ChevronLeft, ArrowRight, HelpCircle } from 'lucide-react'
import { usePrep3Audio } from './Prep3AudioContext'
import ClickableWords from './ClickableWords'

// Web Audio API tone generator for immediate zero-dependency feedback
function playSound(isCorrect) {
  if (typeof window === 'undefined') return
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (isCorrect) {
      // Pleasant high double chime
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1) // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.35)
    } else {
      // Soft gentle buzz
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(260, ctx.currentTime)
      osc.frequency.setValueAtTime(196, ctx.currentTime + 0.12)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    }
  } catch (_) {}
}

export default function InteractiveQuiz({
  quizData,
  questions: propQuestions,
  title = 'اختبار تفاعلي بتصحيح تلقائي',
  lessonTitle,
  id = 'quiz'
}) {
  const { playText, currentId, isSpeaking, stop } = usePrep3Audio()
  
  const questions = propQuestions || quizData?.questions || (Array.isArray(quizData) ? quizData : [])
  const displayTitle = lessonTitle || quizData?.title || title
  const getCorrectAnswer = (q) => q?.correctAnswer || q?.correct || ''
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({}) // { [index]: selectedOption }
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [showReview, setShowReview] = useState(false)

  const currentQ = questions[currentIndex]
  const qSpeechId = `${id}-q-${currentIndex}`
  const isPlayingQuestion = currentId === qSpeechId && isSpeaking

  // Read question and options via ResponsiveVoice
  const handleReadQuestion = () => {
    if (!currentQ) return
    const optionsText = currentQ.options.map((opt, i) => `الخيار ${i + 1}: ${opt}`).join('.. ')
    const fullSpeech = `السؤال: ${currentQ.question}.. الخيارات: ${optionsText}`
    playText(qSpeechId, fullSpeech)
  }

  // Handle selecting an option
  const handleSelectOption = (option) => {
    if (isAnswered) return // Prevent changing answer after selection

    stop()
    const isCorrect = option === getCorrectAnswer(currentQ)
    playSound(isCorrect)

    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: option }))
    setIsAnswered(true)

    if (isCorrect) {
      setScore(prev => prev + 1)
    }
  }

  // Next question or finish
  const handleNext = () => {
    stop()
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsAnswered(false)
    } else {
      setIsFinished(true)
    }
  }

  // Reset & retake
  const handleRestart = () => {
    stop()
    setCurrentIndex(0)
    setSelectedAnswers({})
    setIsAnswered(false)
    setScore(0)
    setIsFinished(false)
    setShowReview(false)
  }

  if (!questions || questions.length === 0) {
    return null
  }

  const percentage = Math.round((score / questions.length) * 100)

  // ══════════════════════════════════════════════════════════════
  // View 1: Results and Score Card
  // ══════════════════════════════════════════════════════════════
  if (isFinished && !showReview) {
    return (
      <div
        id={id}
        style={{
          marginTop: '35px',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '35px 25px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          textAlign: 'center'
        }}
      >
        <div style={{ marginBottom: '15px' }}>
          <Trophy size={60} color={percentage >= 80 ? '#eab308' : '#059669'} style={{ margin: '0 auto' }} />
        </div>

        <h2 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '1.6rem', fontWeight: 800 }}>
          {percentage >= 85 ? 'ممتاز! إتقان تام للمفاهيم 🏆' : percentage >= 60 ? 'أحسنت! أداء جيد جداً 🌟' : 'محاولة جيدة! واصل التدريب 💪'}
        </h2>
        
        <p style={{ color: '#64748b', fontSize: '1.05rem', margin: '0 0 25px 0' }}>
          أتممت اختبار: <strong>{quizData.title || title}</strong>
        </p>

        {/* Score Ring / Pill */}
        <div
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: percentage >= 80 ? '#fefce8' : '#ecfdf5',
            border: `2px solid ${percentage >= 80 ? '#facc15' : '#10b981'}`,
            borderRadius: '20px',
            padding: '20px 40px',
            marginBottom: '25px'
          }}
        >
          <span style={{ fontSize: '2.5rem', fontWeight: 900, color: percentage >= 80 ? '#ca8a04' : '#047857' }}>
            {score} / {questions.length}
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', marginTop: '4px' }}>
            النسبة المئوية: {percentage}%
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={handleRestart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(5,150,105,0.3)',
              fontFamily: 'Tajawal, sans-serif'
            }}
          >
            <RotateCcw size={18} />
            <span>إعادة الاختبار</span>
          </button>

          <button
            onClick={() => setShowReview(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f1f5f9',
              color: '#1e293b',
              border: '1px solid #cbd5e1',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              fontFamily: 'Tajawal, sans-serif'
            }}
          >
            <HelpCircle size={18} />
            <span>مراجعة الإجابات والشرح</span>
          </button>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════
  // View 2: Review All Questions and Explanations
  // ══════════════════════════════════════════════════════════════
  if (isFinished && showReview) {
    return (
      <div
        id={id}
        style={{
          marginTop: '35px',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '30px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '14px' }}>
          <h2 style={{ color: '#059669', margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
            📝 مراجعة الأسئلة وتوضيح الإجابات
          </h2>
          <button
            onClick={handleRestart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Tajawal, sans-serif'
            }}
          >
            <RotateCcw size={16} />
            <span>إعادة الاختبار</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {questions.map((q, idx) => {
            const studentAnswer = selectedAnswers[idx]
            const correctAns = getCorrectAnswer(q)
            const isCorrect = studentAnswer === correctAns

            return (
              <div
                key={q.id || idx}
                style={{
                  background: isCorrect ? '#f0fdf4' : '#fef2f2',
                  border: `2px solid ${isCorrect ? '#86efac' : '#fca5a5'}`,
                  borderRadius: '14px',
                  padding: '18px 22px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                  {isCorrect ? (
                    <CheckCircle2 size={22} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  ) : (
                    <XCircle size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  )}
                  <div>
                    <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.12rem', lineHeight: '1.7' }}>
                      <ClickableWords text={`${idx + 1}. ${q.question}`} />
                    </h4>
                  </div>
                </div>

                <div style={{ paddingRight: '32px', fontSize: '0.98rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ color: isCorrect ? '#15803d' : '#b91c1c' }}>
                    <strong>إجابتك: </strong>
                    <span>{studentAnswer || 'لم يتم الاختيار'}</span>
                  </div>

                  {!isCorrect && (
                    <div style={{ color: '#15803d', fontWeight: 700 }}>
                      <strong>الإجابة الصحيحة: </strong>
                      <span>{correctAns}</span>
                    </div>
                  )}

                  {q.explanation && (
                    <div style={{ marginTop: '8px', background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#334155', fontSize: '0.92rem', lineHeight: '1.7' }}>
                      <strong style={{ color: '#059669' }}>💡 توضيح الإجابة: </strong>
                      <ClickableWords text={q.explanation} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════
  // View 3: Active Question Screen
  // ══════════════════════════════════════════════════════════════
  const selectedOption = selectedAnswers[currentIndex]

  return (
    <div
      id={id}
      style={{
        marginTop: '35px',
        background: '#ffffff',
        borderRadius: '20px',
        padding: '28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 8px 25px rgba(0,0,0,0.04)'
      }}
    >
      {/* Quiz Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              background: '#ecfdf5',
              color: '#059669',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 800,
              border: '1px solid #a7f3d0'
            }}
          >
            اختبار تفاعلي 🎯
          </span>
          <h3 style={{ color: '#0f172a', margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
            {displayTitle}
          </h3>
        </div>

        {/* Score & Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>
            السؤال {currentIndex + 1} من {questions.length}
          </span>
          <span style={{ background: '#f1f5f9', color: '#0f172a', padding: '4px 10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 800 }}>
            النقاط: {score}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ background: '#f1f5f9', height: '6px', borderRadius: '3px', marginBottom: '25px', overflow: 'hidden' }}>
        <div
          style={{
            background: 'linear-gradient(90deg, #10b981, #059669)',
            height: '100%',
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* Question Box */}
      <div
        style={{
          background: '#f8fafc',
          padding: '22px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '15px' }}>
          <h4 style={{ color: '#1e293b', margin: 0, fontSize: '1.25rem', lineHeight: '1.8', fontWeight: 800, flex: 1 }}>
            <ClickableWords text={currentQ.question} />
          </h4>

          {/* Audio Button for Question */}
          <button
            onClick={handleReadQuestion}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isPlayingQuestion ? '#dc2626' : '#ecfdf5',
              color: isPlayingQuestion ? '#ffffff' : '#059669',
              border: '1px solid #a7f3d0',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
              fontFamily: 'Tajawal, sans-serif',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
            title="استمع إلى السؤال والخيارات"
          >
            {isPlayingQuestion ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{isPlayingQuestion ? 'إيقاف' : 'استمع للسؤال'}</span>
          </button>
        </div>
      </div>

      {/* Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
        {currentQ.options.map((opt, idx) => {
          let optionStyle = {
            padding: '16px 20px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            background: '#ffffff',
            color: '#334155',
            fontSize: '1.08rem',
            fontWeight: 700,
            cursor: isAnswered ? 'default' : 'pointer',
            textAlign: 'right',
            fontFamily: 'Tajawal, sans-serif',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }

          const correctAns = getCorrectAnswer(currentQ)

          if (isAnswered) {
            if (opt === correctAns) {
              // Highlight correct answer in green
              optionStyle.border = '2px solid #22c55e'
              optionStyle.background = '#f0fdf4'
              optionStyle.color = '#15803d'
            } else if (opt === selectedOption && opt !== correctAns) {
              // Highlight selected wrong answer in red
              optionStyle.border = '2px solid #ef4444'
              optionStyle.background = '#fef2f2'
              optionStyle.color = '#b91c1c'
            } else {
              optionStyle.opacity = 0.6
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(opt)}
              disabled={isAnswered}
              style={optionStyle}
              onMouseEnter={(e) => {
                if (!isAnswered) {
                  e.currentTarget.style.borderColor = '#059669'
                  e.currentTarget.style.background = '#f0fdf4'
                }
              }}
              onMouseLeave={(e) => {
                if (!isAnswered) {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.background = '#ffffff'
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '2px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    color: '#64748b'
                  }}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </div>

              {isAnswered && opt === correctAns && (
                <CheckCircle2 size={22} color="#16a34a" />
              )}
              {isAnswered && opt === selectedOption && opt !== correctAns && (
                <XCircle size={22} color="#dc2626" />
              )}
            </button>
          )
        })}
      </div>

      {/* Explanation Box (Revealed after answer) */}
      {isAnswered && (
        <div
          style={{
            background: selectedOption === getCorrectAnswer(currentQ) ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${selectedOption === getCorrectAnswer(currentQ) ? '#86efac' : '#fde68a'}`,
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '20px',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            {selectedOption === getCorrectAnswer(currentQ) ? (
              <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={18} /> أحسنت! إجابة صحيحة وممتازة 🎉
              </span>
            ) : (
              <span style={{ color: '#b45309', fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={18} /> إجابة خاطئة - راجع التوضيح لترسيخ المعلومة:
              </span>
            )}
          </div>
          {currentQ.explanation && (
            <p style={{ margin: 0, color: '#334155', fontSize: '1rem', lineHeight: '1.8' }}>
              <ClickableWords text={currentQ.explanation} />
            </p>
          )}
        </div>
      )}

      {/* Footer: Next Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {isAnswered && (
          <button
            onClick={handleNext}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              fontFamily: 'Tajawal, sans-serif',
              boxShadow: '0 4px 15px rgba(5,150,105,0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{currentIndex < questions.length - 1 ? 'السؤال التالي' : 'عرض النتيجة النهائية'}</span>
            <ChevronLeft size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

