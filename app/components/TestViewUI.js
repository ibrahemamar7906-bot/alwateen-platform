'use client'
import React, { useState, useEffect } from 'react'
import { BrainCircuit, Lightbulb, CheckCircle2, XCircle, ArrowRight, BookOpen, Quote, Volume2, VolumeX } from 'lucide-react'
import { useRouter } from 'next/navigation'
import styles from './TestViewUI.module.css'

export default function TestViewUI({ title, badge1, badge2, passage, passageSections, vocab, questions, colorScheme = 'teal' }) {
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [playingId, setPlayingId] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const router = useRouter()

  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  const stopAudio = () => {
    if (typeof window !== 'undefined') {
      try {
        if (window.responsiveVoice && typeof window.responsiveVoice.cancel === 'function') {
          window.responsiveVoice.cancel()
        }
      } catch (_) {}
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel()
        }
      } catch (_) {}
    }
    setPlayingId(null)
    setIsSpeaking(false)
  }

  const handlePlayAudio = (id, textToRead) => {
    if (playingId === id && isSpeaking) {
      stopAudio()
      return
    }

    stopAudio()
    if (!textToRead || typeof window === 'undefined') return

    // Clean text: strip HTML, markdown stars, bullet points
    const cleanText = textToRead
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/[*#•]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!cleanText) return

    setPlayingId(id)
    setIsSpeaking(true)

    // 1. Try ResponsiveVoice (loaded globally via layout.js)
    if (window.responsiveVoice && typeof window.responsiveVoice.speak === 'function') {
      try {
        window.responsiveVoice.speak(cleanText, 'Arabic Female', {
          rate: 0.9,
          pitch: 1,
          onstart: () => {
            setPlayingId(id)
            setIsSpeaking(true)
          },
          onend: () => {
            setPlayingId(null)
            setIsSpeaking(false)
          },
          onerror: () => {
            setPlayingId(null)
            setIsSpeaking(false)
          }
        })
        return
      } catch (err) {
        console.warn('ResponsiveVoice speak error, falling back:', err)
      }
    }

    // 2. Fallback to Web SpeechSynthesis
    if ('speechSynthesis' in window) {
      try {
        const utt = new SpeechSynthesisUtterance(cleanText)
        utt.rate = 0.92
        utt.pitch = 1.0
        utt.lang = 'ar-SA'
        const voices = window.speechSynthesis.getVoices()
        const arabicVoice = voices.find(v => v.lang.toLowerCase().startsWith('ar'))
        if (arabicVoice) utt.voice = arabicVoice

        utt.onend = () => {
          setPlayingId(null)
          setIsSpeaking(false)
        }
        utt.onerror = () => {
          setPlayingId(null)
          setIsSpeaking(false)
        }
        window.speechSynthesis.speak(utt)
        return
      } catch (_) {}
    }

    setPlayingId(null)
    setIsSpeaking(false)
  }

  const handleSelect = (qIndex, oIndex) => {
    if (selectedAnswers[qIndex] !== undefined) return
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: oIndex }))
  }

  const score = Object.keys(selectedAnswers).reduce((acc, qIndex) => {
    return acc + (selectedAnswers[qIndex] === questions[qIndex].correct ? 1 : 0)
  }, 0)
  
  const isAllAnswered = Object.keys(selectedAnswers).length === questions.length

  const handleGoBack = () => {
    stopAudio()
    router.back()
  }

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <button onClick={handleGoBack} className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </button>
            <div>
              <div className={styles.subtitle}>
                <BookOpen size={18} />
                <span>{badge1}</span>
                {badge2 && (
                  <>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <span>{badge2}</span>
                  </>
                )}
              </div>
              <h1 className={styles.title}>{title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        
        {/* Reading Passage */}
        <div className={styles.card}>
          <div className={styles.passageHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className={styles.passageIcon}>
                <Quote size={28} />
              </div>
              <h2 className={styles.passageTitle}>المحتوى والنص التعليمي:</h2>
            </div>

            {/* ResponsiveVoice Audio Action Button */}
            <button
              onClick={() => {
                const fullText = (passage || '') + ' ' + (passageSections ? passageSections.map(s => (s.title || '') + '. ' + (s.content || '')).join(' ') : '')
                handlePlayAudio('full-passage', fullText)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: playingId === 'full-passage' && isSpeaking ? '#dc2626' : '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '999px',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: '0 4px 14px rgba(5,150,105,0.3)'
              }}
              title="استمع للدرس بالصوت الذكي"
            >
              {playingId === 'full-passage' && isSpeaking ? (
                <>
                  <VolumeX size={20} />
                  <span>إيقاف الصوت ⏹️</span>
                </>
              ) : (
                <>
                  <Volume2 size={20} />
                  <span>استمع للدرس بالصوت (ResponsiveVoice) 🔊</span>
                </>
              )}
            </button>
          </div>
          
          {passage && (
            <p className={styles.passageText}>{passage}</p>
          )}

          {passageSections && passageSections.map((sec, i) => (
            <div key={i} className={styles.passageSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                {sec.title && <h3 className={styles.passageSectionTitle} style={{ margin: 0 }}>{sec.title}</h3>}
                <button
                  onClick={() => handlePlayAudio(`sec-${i}`, (sec.title || '') + '. ' + (sec.content || ''))}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: playingId === `sec-${i}` && isSpeaking ? '#fee2e2' : '#ecfdf5',
                    color: playingId === `sec-${i}` && isSpeaking ? '#dc2626' : '#059669',
                    border: `1px solid ${playingId === `sec-${i}` && isSpeaking ? '#fca5a5' : '#a7f3d0'}`,
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title="استمع لهذه الجزئية"
                >
                  {playingId === `sec-${i}` && isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span>{playingId === `sec-${i}` && isSpeaking ? 'إيقاف' : 'استمع للفقرة 🔊'}</span>
                </button>
              </div>
              <p className={styles.passageText}>{sec.content}</p>
            </div>
          ))}

          {vocab && vocab.length > 0 && (
            <div className={styles.vocabGrid}>
              {vocab.map((v, i) => (
                <div key={i} className={styles.vocabItem}>
                  <span className={styles.vocabWord}>{v.word}</span>
                  <span className={styles.vocabMeaning}>{v.meaning}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Questions */}
        <div id="questions" className={styles.questionsContainer}>
          {questions.map((q, qIndex) => {
            const isAnswered = selectedAnswers[qIndex] !== undefined
            const isCorrect = selectedAnswers[qIndex] === q.correct

            return (
              <div key={qIndex} className={styles.questionCard}>
                <h3 className={styles.questionTitle}>{qIndex + 1}- {q.q}</h3>
                
                {q.options ? (
                  <div className={styles.optionsGrid}>
                    {q.options.map((opt, oIndex) => {
                      const isSelected = selectedAnswers[qIndex] === oIndex
                      const isThisCorrect = oIndex === q.correct

                      let btnClass = styles.optionBtn
                      if (isAnswered) {
                        btnClass += ' ' + styles.optionBtnDisabled
                        if (isThisCorrect) btnClass += ' ' + styles.optionBtnCorrect
                        else if (isSelected && !isThisCorrect) btnClass += ' ' + styles.optionBtnWrong
                      }

                      return (
                        <button 
                          key={oIndex}
                          className={btnClass}
                          onClick={() => handleSelect(qIndex, oIndex)}
                          disabled={isAnswered}
                        >
                          <span>{opt}</span>
                          {isAnswered && isThisCorrect && <CheckCircle2 className={styles.iconCorrect} size={24} />}
                          {isAnswered && isSelected && !isThisCorrect && <XCircle className={styles.iconWrong} size={24} />}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <textarea 
                      placeholder="اكتب إجابتك هنا للتدريب..." 
                      rows="3" 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                    <button 
                      onClick={() => setSelectedAnswers(prev => { const next = {...prev}; if(next[qIndex]) delete next[qIndex]; else next[qIndex] = true; return next; })}
                      style={{ alignSelf: 'flex-start', background: isAnswered ? '#64748b' : '#059669', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {isAnswered ? 'إخفاء الإجابة النموذجية' : 'إظهار الإجابة النموذجية'}
                    </button>
                    {isAnswered && (
                      <div style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: '15px', borderRadius: '8px', color: '#065f46', marginTop: '10px', fontSize: '1.1rem' }}>
                        <strong>الإجابة النموذجية:</strong>
                        <p style={{ marginTop: '8px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{q.answer}</p>
                      </div>
                    )}
                  </div>
                )}

                {isAnswered && q.tutor && (
                  <div className={styles.tutorBox}>
                    <div className={styles.tutorHeader}>
                      <BrainCircuit size={20} />
                      <span>{isCorrect ? 'إجابة رائعة! التفسير:' : 'حاول مرة أخرى! إليك التفسير:'}</span>
                    </div>
                    <p className={styles.tutorText}>{q.tutor.whyCorrect}</p>
                    
                    {q.tutor.howToGuess && (
                      <div style={{ marginTop: '15px' }}>
                        <div className={styles.tutorHeader} style={{ color: '#0d9488' }}>
                          <Lightbulb size={20} />
                          <span>تلميح وتفكير منطقي:</span>
                        </div>
                        <p className={styles.tutorText}>{q.tutor.howToGuess}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {isAllAnswered && (
          <div className={styles.scoreCard}>
            <h3 className={styles.scoreTitle}>اكتمل التدريب! نتيجتك:</h3>
            <p className={styles.scoreValue}>{score} / {questions.length}</p>
            <button onClick={handleGoBack} className={styles.scoreBtn}>
              العودة للمسار التعليمي
            </button>
          </div>
        )}
        
      </div>
    </div>
  )
}
