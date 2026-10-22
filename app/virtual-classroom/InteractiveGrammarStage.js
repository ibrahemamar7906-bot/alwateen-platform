'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Volume2, VolumeX, Sparkles, BookOpen, 
  CheckCircle2, HelpCircle, Edit3, Award, 
  RotateCcw, Eye, Play, ListPlus
} from 'lucide-react'
import { speakWhenReady } from '../../utils/tts'

const DEFAULT_PASSAGES = [
  {
    id: 'p1',
    title: 'إنّ وأخواتها وفضل العلم',
    text: 'إنَّ العِلْمَ نُورٌ يُضِيءُ دُرُوبَ الحَيَاةِ، وَلَعَلَّ الطَّالِبَ المُجْتَهِدَ يُدْرِكُ قِيمَةَ الوَقْتِ، فَلَيْتَ الشَّبَابَ يَسْتَثْمِرُونَ عُقُولَهُمْ فِي بِنَاءِ الوَطَنِ.',
    highlightIndex: 1, // "العِلْمَ"
    targetWord: 'العِلْمَ',
    question: 'ما إعراب كلمة "العِلْمَ" في الجملة السابقة؟',
    options: [
      'اسم إنّ منصوب وعلامة نصبه الفتحة الظاهرة',
      'خبر إنّ مرفوع وعلامة رفعه الضمة',
      'فاعل مرفوع وعلامة رفعه الضمة',
      'مفعول به منصوب وعلامة نصبه الفتحة'
    ],
    correctIndex: 0,
    explanation: 'العلمَ: اسم إنّ منصوب وعلامة نصبه الفتحة الظاهرة على آخره لأن إنّ حرف ناسخ ينصب المبتدأ ويرفع الخبر.'
  },
  {
    id: 'p2',
    title: 'الفعل المضارع وإعرابه',
    text: 'يَسْعَى المُؤْمِنُ إِلَى الخَيْرِ دَائِمًا، وَلَنْ يَتَوانَى عَنْ نُصْرَةِ الحَقِّ، فَلْتَكُنْ قُدْوَةً لِغَيْرِكَ فِي الإِخْلَاصِ.',
    highlightIndex: 7, // "يَتَوانَى"
    targetWord: 'يَتَوانَى',
    question: 'ما إعراب الفعل "يَتَوانَى"؟',
    options: [
      'فعل مضارع منصوب بلن وعلامة نصبه الفتحة المقدرة للتعذر',
      'فعل مضارع مجزوم بحذف حرف العلة',
      'فعل مضارع مرفوع وعلامة رفعه الضمة المقدرة',
      'فعل ماض مبني على الفتح'
    ],
    correctIndex: 0,
    explanation: 'يَتَوانَى: فعل مضارع منصوب بلن وعلامة نصبه الفتحة المقدرة على الألف منع من ظهورها التعذر.'
  },
  {
    id: 'p3',
    title: 'المشتقات: اسم الفاعل والمفعول',
    text: 'المُعَلِّمُ المِعْطَاءُ مَحْبُوبٌ بَيْنَ طُلَّابِهِ، وَهُوَ حَرِيصٌ عَلَى إِيصَالِ المَعْلُومَةِ بِكُلِّ وُضُوحٍ وَأَمَانَةٍ.',
    highlightIndex: 2, // "مَحْبُوبٌ"
    targetWord: 'مَحْبُوبٌ',
    question: 'ما نوع المشتق في كلمة "مَحْبُوبٌ" وما إعرابه؟',
    options: [
      'اسم مفعول من الفعل الثلاثي (حُبَّ)، وإعرابه خبر أول مرفوع بالضمة',
      'اسم فاعل من الفعل الثلاثي',
      'صيغة مبالغة على وزن مفعول',
      'نعت مرفوع وعلامة رفعه الضمة'
    ],
    correctIndex: 0,
    explanation: 'محبوب: اسم مفعول صيغ من الفعل الثلاثي المبني للمجهول (حُبَّ)، وإعرابه خبر المبتدأ مرفوع بالضمة.'
  }
]

export default function InteractiveGrammarStage({
  isTeacher = false,
  channel = null,
  hasControl = false
}) {
  const [passages, setPassages] = useState(DEFAULT_PASSAGES)
  const [selectedPassageIndex, setSelectedPassageIndex] = useState(0)
  const [activeWordIndex, setActiveWordIndex] = useState(1)
  const [showQuiz, setShowQuiz] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [customTextModal, setCustomTextModal] = useState(false)
  const [customInputText, setCustomInputText] = useState('')
  const [customInputTitle, setCustomInputTitle] = useState('')

  const currentPassage = passages[selectedPassageIndex] || DEFAULT_PASSAGES[0]
    const words = currentPassage.text.split(' ')

  const syncStateRef = useRef({ passages, selectedPassageIndex, activeWordIndex, showQuiz });
  useEffect(() => {
    syncStateRef.current = { passages, selectedPassageIndex, activeWordIndex, showQuiz };
  }, [passages, selectedPassageIndex, activeWordIndex, showQuiz]);


  // Real-time synchronization via Supabase
  useEffect(() => {
    if (!channel) return

    const sub = channel.on('broadcast', { event: 'grammar_sync' }, ({ payload }) => {
      if (!payload) return
      if (payload.customPassages) {
        setPassages(payload.customPassages)
      }
      if (typeof payload.selectedPassageIndex === 'number') {
        setSelectedPassageIndex(payload.selectedPassageIndex)
      }
      if (typeof payload.activeWordIndex === 'number') {
        setActiveWordIndex(payload.activeWordIndex)
      }
      if (typeof payload.showQuiz === 'boolean') {
        setShowQuiz(payload.showQuiz)
      }
      if (payload.showResult) {
        setShowResult(true)
      }
      if (payload.resetQuiz) {
        setSelectedAnswer(null)
        setShowResult(false)
      }
      if (payload.speakText) {
        speakTextLocal(payload.speakText)
      }
    })

    const globalSub = channel.on('broadcast', { event: 'global_sync_request' }, () => {
      if (isTeacher) {
        const state = syncStateRef.current;
        broadcastSync({
          customPassages: state.passages,
          selectedPassageIndex: state.selectedPassageIndex,
          activeWordIndex: state.activeWordIndex,
          showQuiz: state.showQuiz,
          resetQuiz: false
        })
      }
      
    })


    // If student, request sync on mount
    if (!isTeacher) {
      let isReady = false;
      if (typeof channel.canPush === 'function') {
        try { isReady = channel.canPush() } catch (_) { isReady = false }
      } else {
        isReady = channel.state === 'joined' && !!channel.socket && typeof channel.socket.isConnected === 'function' && channel.socket.isConnected();
      }
      
      const sendReq = () => {
        try {
          channel.send({
            type: 'broadcast',
            event: 'grammar_sync',
            payload: { action: 'request_sync' }
          }).catch(e => {});
        } catch(e) {}
      };

      if (isReady) {
        sendReq();
      } else {
        setTimeout(sendReq, 2000);
      }
    }


    return () => {
      // if (sub) sub.unsubscribe() // Disabled to prevent destroying the global Supabase channel
    }
  }, [channel])

  // Sync action helper
  const broadcastSync = (data) => {
    if (!channel) return
    const isReady = typeof channel.canPush === 'function'
      ? channel.canPush()
      : (channel.state === 'joined' && !!channel.socket && typeof channel.socket.isConnected === 'function' && channel.socket.isConnected())
    if (!isReady) return
    try {
      channel.send({
        type: 'broadcast',
        event: 'grammar_sync',
        payload: data
      }).catch(() => {})
    } catch (e) {
      console.warn('Grammar sync error:', e)
    }
  }

  // Text-To-Speech (speakWhenReady handles race condition + fallback)
  const speakTextLocal = (text) => {
    if (!text) return
    setIsSpeaking(true)
    speakWhenReady(text, 'Arabic Female', {
      pitch: 1,
      rate: 0.85,
      onend: () => setIsSpeaking(false),
      onerror: () => setIsSpeaking(false)
    })
  }

  const handleSpeak = (text) => {
    speakTextLocal(text)
    if (isTeacher || hasControl) {
      broadcastSync({ speakText: text })
    }
  }

  const handleSelectWord = (idx) => {
    if (!isTeacher && !hasControl) return
    setActiveWordIndex(idx)
    broadcastSync({ activeWordIndex: idx })
  }

  const handlePassageChange = (idx) => {
    if (!isTeacher && !hasControl) return
    setSelectedPassageIndex(idx)
    setActiveWordIndex(passages[idx]?.highlightIndex ?? 0)
    setShowQuiz(false)
    setShowResult(false)
    setSelectedAnswer(null)
    broadcastSync({
      selectedPassageIndex: idx,
      activeWordIndex: passages[idx]?.highlightIndex ?? 0,
      showQuiz: false,
      resetQuiz: true
    })
  }

  const handleToggleQuiz = () => {
    if (!isTeacher && !hasControl) return
    const nextState = !showQuiz
    setShowQuiz(nextState)
    setShowResult(false)
    setSelectedAnswer(null)
    broadcastSync({ showQuiz: nextState, resetQuiz: true })
  }

  const handleAnswerSubmit = (idx) => {
    setSelectedAnswer(idx)
    setShowResult(true)
    if (isTeacher || hasControl) {
      broadcastSync({ showResult: true })
    }
  }

  const handleAddCustomPassage = () => {
    if (!customInputText.trim()) return
    const newPassage = {
      id: `custom-${Date.now()}`,
      title: customInputTitle.trim() || 'قطعة إعرابية مخصصة',
      text: customInputText.trim(),
      highlightIndex: 0,
      targetWord: customInputText.trim().split(' ')[0] || '',
      question: 'حدد إعراب الكلمة المظللة في السياق:',
      options: ['مرفوع', 'منصوب', 'مجرور', 'مجزوم'],
      correctIndex: 0,
      explanation: 'تحليل ونقاش نحوي مع المعلم.'
    }
    const newPassagesList = [...passages, newPassage];
    setPassages(newPassagesList);
    setCustomTextModal(false);
    setCustomInputText('');
    setCustomInputTitle('');
    
    const newIdx = newPassagesList.length - 1;
    setSelectedPassageIndex(newIdx);
    setActiveWordIndex(0);
    setShowQuiz(false);
    setShowResult(false);
    setSelectedAnswer(null);
    
    broadcastSync({
      customPassages: newPassagesList,
      selectedPassageIndex: newIdx,
      activeWordIndex: 0,
      showQuiz: false,
      resetQuiz: true
    });
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 'clamp(12px, 2vw, 24px)',
      background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)',
      userSelect: 'none',
      direction: 'rtl',
      textAlign: 'right',
      fontFamily: "'Tajawal', 'Cairo', sans-serif",
      overflowY: 'auto',
      boxSizing: 'border-box'
    }}>
      
      {/* 1. Header Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        border: '1px solid rgba(5, 150, 105, 0.4)',
        borderRadius: '18px',
        padding: '12px 18px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        flexShrink: 0
      }}>
        
        {/* Title & Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)'
          }}>
            <BookOpen size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{currentPassage.title}</span>
              <span style={{
                fontSize: '0.72rem',
                backgroundColor: 'rgba(5, 150, 105, 0.3)',
                color: '#d1fae5',
                border: '1px solid #059669',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 800
              }}>
                تطبيقي مباشر 📜
              </span>
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0 0', fontWeight: 600 }}>
              تظليل الكلمات ونطقها متزامن لحظياً بين المعلم وجميع الطلاب
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* TTS Read Full Text */}
          <button
            onClick={() => handleSpeak(currentPassage.text)}
            disabled={isSpeaking}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#059669',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 800,
              border: 'none',
              cursor: isSpeaking ? 'default' : 'pointer',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
            }}
          >
            <Volume2 size={16} />
            <span>{isSpeaking ? 'جاري القراءة...' : 'قراءة النص الصوتي (TTS)'}</span>
          </button>

          {/* Quiz Toggle (Teacher/Controller) */}
          {(isTeacher || hasControl) && (
            <button
              onClick={handleToggleQuiz}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 800,
                border: showQuiz ? '1px solid #f59e0b' : '1px solid #059669',
                backgroundColor: showQuiz ? '#d97706' : '#1e293b',
                color: showQuiz ? '#ffffff' : '#d1fae5',
                cursor: 'pointer',
                boxShadow: showQuiz ? '0 4px 12px rgba(217, 119, 6, 0.4)' : 'none'
              }}
            >
              <HelpCircle size={16} />
              <span>{showQuiz ? 'إخفاء سؤال الإعراب' : 'بدء تحدي الإعراب 🎯'}</span>
            </button>
          )}

          {/* Add Custom Passage Modal Button (Teacher) */}
          {isTeacher && (
            <button
              onClick={() => setCustomTextModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                padding: '8px 12px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <ListPlus size={16} color="#10b981" />
              <span>إضافة نص</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Interactive Passage Stage */}
      <div style={{ margin: 'auto 0', padding: '16px 0' }}>
        <div style={{
          maxWidth: '850px',
          margin: '0 auto',
          backgroundColor: '#1e293b',
          border: '2px solid rgba(5, 150, 105, 0.6)',
          borderRadius: '24px',
          padding: 'clamp(20px, 4vw, 36px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* The Words Box */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px 14px',
            lineHeight: 2.4,
            fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
            fontWeight: 800,
            color: '#f8fafc',
            textAlign: 'center',
            userSelect: 'text'
          }}>
            {words.map((word, idx) => {
              const isHighlighted = idx === activeWordIndex
              return (
                <span
                  key={idx}
                  onClick={() => handleSelectWord(idx)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: isHighlighted 
                      ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' 
                      : 'transparent',
                    color: isHighlighted ? '#022c22' : '#f8fafc',
                    fontWeight: isHighlighted ? 900 : 800,
                    boxShadow: isHighlighted ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none',
                    transform: isHighlighted ? 'scale(1.08)' : 'scale(1)',
                    display: 'inline-block'
                  }}
                  title={isTeacher || hasControl ? 'انقر لتظليل هذه الكلمة لجميع الطلاب' : 'كلمة في النص'}
                >
                  {word}
                </span>
              )
            })}
          </div>

          {/* Word Action Bar (Read selected word) */}
          <div style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <span style={{ color: '#10b981', fontWeight: 800 }}>الكلمة المحددة:</span>
              <span style={{
                backgroundColor: '#0f172a',
                padding: '4px 12px',
                borderRadius: '10px',
                fontWeight: 900,
                color: '#ffffff',
                border: '1px solid rgba(5, 150, 105, 0.4)',
                fontSize: '1rem'
              }}>
                {words[activeWordIndex] || '---'}
              </span>
            </div>

            <button
              onClick={() => handleSpeak(words[activeWordIndex])}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#0f172a',
                border: '1px solid #059669',
                color: '#d1fae5',
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <Volume2 size={14} />
              <span>نطق الكلمة فقط 🔊</span>
            </button>
          </div>

        </div>

        {/* 3. Interactive Quiz Question Modal / Container */}
        {showQuiz && currentPassage.question && (
          <div style={{
            maxWidth: '750px',
            margin: '20px auto 0',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '2px solid #10b981',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(16px)'
          }}>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              marginBottom: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              paddingBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  display: 'inline-block'
                }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#d1fae5', margin: 0 }}>
                  {currentPassage.question}
                </h3>
              </div>
              <span style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '2px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>
                سؤال إعرابي 🎯
              </span>
            </div>

            {/* Multiple Choice Answers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px'
            }}>
              {currentPassage.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx
                const isCorrect = idx === currentPassage.correctIndex

                let btnBg = '#1e293b'
                let btnBorder = 'rgba(255, 255, 255, 0.1)'
                let btnColor = '#f8fafc'

                if (showResult) {
                  if (isCorrect) {
                    btnBg = '#059669'
                    btnBorder = '#10b981'
                    btnColor = '#ffffff'
                  } else if (isSelected) {
                    btnBg = '#e11d48'
                    btnBorder = '#f43f5e'
                    btnColor = '#ffffff'
                  } else {
                    btnBg = 'rgba(30, 41, 59, 0.5)'
                    btnBorder = 'transparent'
                    btnColor = '#64748b'
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={showResult && !isTeacher}
                    onClick={() => handleAnswerSubmit(idx)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '16px',
                      border: `1.5px solid ${btnBorder}`,
                      backgroundColor: btnBg,
                      color: btnColor,
                      textAlign: 'right',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: showResult && !isTeacher ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      boxShadow: showResult && isCorrect ? '0 4px 16px rgba(16, 185, 129, 0.4)' : 'none'
                    }}
                  >
                    <span>{opt}</span>
                    {showResult && isCorrect && <CheckCircle2 size={20} color="#ffffff" style={{ flexShrink: 0 }} />}
                  </button>
                )
              })}
            </div>

            {/* Explanation Note */}
            {showResult && currentPassage.explanation && (
              <div style={{
                marginTop: '16px',
                padding: '14px 16px',
                backgroundColor: 'rgba(5, 150, 105, 0.2)',
                border: '1.5px solid #10b981',
                borderRadius: '16px',
                color: '#d1fae5',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                lineHeight: 1.5
              }}>
                <Sparkles size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ fontWeight: 900, color: '#ffffff', display: 'block', marginBottom: '4px' }}>💡 التعليل النموذجي:</span>
                  <span>{currentPassage.explanation}</span>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* 4. Bottom Passages Switcher Carousel Bar */}
      <div style={{
        marginTop: '12px',
        paddingTop: '10px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        overflowX: 'auto',
        flexShrink: 0
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', flexShrink: 0 }}>
          اختر القطعة:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
          {passages.map((p, idx) => (
            <button
              key={p.id || idx}
              onClick={() => handlePassageChange(idx)}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                border: selectedPassageIndex === idx ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: selectedPassageIndex === idx ? '#059669' : '#1e293b',
                color: selectedPassageIndex === idx ? '#ffffff' : '#94a3b8',
                boxShadow: selectedPassageIndex === idx ? '0 2px 8px rgba(5, 150, 105, 0.4)' : 'none'
              }}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Custom Passage Modal */}
      {customTextModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: '#1e293b',
            border: '2px solid #059669',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
            textAlign: 'right'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit3 size={20} color="#10b981" />
              <span>إضافة قطعة نحوية جديدة للشرح</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>عنوان القطعة:</label>
                <input
                  type="text"
                  value={customInputTitle}
                  onChange={(e) => setCustomInputTitle(e.target.value)}
                  placeholder="مثال: البدل وأنواعه"
                  style={{
                    width: '100%',
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '0.9rem',
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>نص القطعة (مع التشكيل إن وجد):</label>
                <textarea
                  rows={4}
                  value={customInputText}
                  onChange={(e) => setCustomInputText(e.target.value)}
                  placeholder="اكتب القطعة النحوية هنا..."
                  style={{
                    width: '100%',
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '0.9rem',
                    color: '#ffffff',
                    outline: 'none',
                    lineHeight: 1.6,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setCustomTextModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                إلغاء
              </button>
              <button
                onClick={handleAddCustomPassage}
                disabled={!customInputText.trim()}
                style={{
                  padding: '8px 20px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)'
                }}
              >
                حفظ وبدء الشرح 🚀
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}





