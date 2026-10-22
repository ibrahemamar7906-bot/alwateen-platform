'use client'

import { useState, useEffect, useRef, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../../utils/supabase'
import { pathways } from '../data'
import confetti from 'canvas-confetti'
import { updateStudentScore, logStudentMistake, savePathwayProgress, getPathwayProgress } from '../../../../utils/progress'
import { playTTS, cancelTTS } from '../../../../utils/tts'
import CertificateModal from '../../components/CertificateModal'

// ── Rich Content & Markdown Table Renderer with Interactive Audio ──────────────
function renderFormattedContent(rawText, playVoice) {
  if (!rawText) return null

  // 1. Inline word & bold renderer
  const renderInline = (str, keyPrefix = 'txt') => {
    if (!str) return null
    // Split by bold markdown **text**
    const parts = str.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, pIdx) => {
      const isBold = part.startsWith('**') && part.endsWith('**')
      const cleanPart = isBold ? part.slice(2, -2) : part
      const words = cleanPart.split(' ')

      const renderedWords = words.map((word, wIdx) => {
        if (!word) return null
        const cleanWord = word.replace(/[.,":!؟«»()[\]{}|]/g, '').trim()
        return (
          <span
            key={`${keyPrefix}-${pIdx}-${wIdx}`}
            className="word-tap"
            onClick={(e) => {
              e.stopPropagation()
              if (cleanWord) playVoice(cleanWord)
            }}
            style={{
              cursor: 'pointer',
              display: 'inline',
              margin: '0 1.5px',
              fontWeight: isBold ? 800 : 'inherit',
              color: isBold ? '#064e3b' : 'inherit'
            }}
          >
            {word}{' '}
          </span>
        )
      })

      if (isBold) {
        return (
          <strong
            key={`${keyPrefix}-bld-${pIdx}`}
            style={{
              color: '#064e3b',
              fontWeight: 800,
              background: 'rgba(5,150,105,0.08)',
              padding: '2px 6px',
              borderRadius: '6px',
              margin: '0 2px',
              display: 'inline-block'
            }}
          >
            {renderedWords}
          </strong>
        )
      }
      return <span key={`${keyPrefix}-sp-${pIdx}`}>{renderedWords}</span>
    })
  }

  // 2. Parse text into structured blocks
  const lines = rawText.split('\n')
  const blocks = []
  let currentTable = null

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    // Table row detection
    const isTableLine = trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.split('|').length >= 3

    if (isTableLine) {
      const isDelimiter = /^\|[\s:|-]+\|$/.test(trimmed)
      if (!currentTable) {
        currentTable = {
          type: 'table',
          headers: trimmed.split('|').slice(1, -1).map(c => c.trim()),
          rows: []
        }
      } else if (!isDelimiter) {
        const cells = trimmed.split('|').slice(1, -1).map(c => c.trim())
        currentTable.rows.push(cells)
      }
    } else {
      if (currentTable) {
        blocks.push(currentTable)
        currentTable = null
      }
      if (trimmed.length > 0) {
        // Poetic hemistich detection (single | in the middle)
        const poemParts = trimmed.split(/\s+\|\s+/)
        if (poemParts.length === 2 && !trimmed.startsWith('•') && !trimmed.startsWith('-') && !/^[١-٩]/.test(trimmed)) {
          blocks.push({ type: 'poem', part1: poemParts[0].trim(), part2: poemParts[1].trim() })
        } else {
          blocks.push({ type: 'paragraph', text: trimmed })
        }
      } else {
        blocks.push({ type: 'spacer' })
      }
    }
  }
  if (currentTable) {
    blocks.push(currentTable)
  }

  // 3. Render blocks with Emerald aesthetic
  return blocks.map((block, bIdx) => {
    if (block.type === 'table') {
      return (
        <div
          key={`tbl-${bIdx}`}
          style={{
            overflowX: 'auto',
            margin: '22px 0',
            borderRadius: '16px',
            border: '1.5px solid rgba(5,150,105,0.22)',
            boxShadow: '0 6px 20px rgba(5,150,105,0.08)',
            background: '#ffffff'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white' }}>
                {block.headers.map((h, hIdx) => (
                  <th
                    key={hIdx}
                    style={{
                      padding: '14px 18px',
                      fontWeight: 800,
                      borderBottom: '2px solid rgba(5,150,105,0.3)',
                      whiteSpace: 'nowrap',
                      textAlign: 'right'
                    }}
                  >
                    {renderInline(h, `th-${bIdx}-${hIdx}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    background: rIdx % 2 === 0 ? 'rgba(5,150,105,0.02)' : '#ffffff',
                    borderBottom: '1px solid rgba(5,150,105,0.1)'
                  }}
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      style={{
                        padding: '12px 18px',
                        lineHeight: 1.9,
                        verticalAlign: 'middle',
                        color: '#064e3b',
                        borderLeft: cIdx < row.length - 1 ? '1px solid rgba(5,150,105,0.08)' : 'none'
                      }}
                    >
                      {renderInline(cell, `td-${bIdx}-${rIdx}-${cIdx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (block.type === 'poem') {
      return (
        <div
          key={`pm-${bIdx}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'clamp(10px, 3vw, 24px)',
            margin: '12px 0',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, rgba(5,150,105,0.06), rgba(13,148,136,0.04))',
            borderRadius: '16px',
            border: '1.5px solid rgba(5,150,105,0.18)',
            fontSize: 'clamp(1.05rem, 2.8vw, 1.35rem)',
            fontWeight: 700,
            color: '#064e3b'
          }}
        >
          <div style={{ flex: 1, textAlign: 'right' }}>{renderInline(block.part1, `pm1-${bIdx}`)}</div>
          <span style={{ color: '#059669', fontSize: '1.2rem', userSelect: 'none', padding: '0 8px' }}>✦</span>
          <div style={{ flex: 1, textAlign: 'left' }}>{renderInline(block.part2, `pm2-${bIdx}`)}</div>
        </div>
      )
    }

    if (block.type === 'paragraph') {
      const isHeader = /^([١-٩]️⃣|🎯|💡|📌|🔍|🗺️|📚|📝|⚖️|🛡️|🧩|🌾|🎖️|✨|🔑)/.test(block.text)

      if (isHeader) {
        return (
          <div
            key={`hdr-${bIdx}`}
            style={{
              background: 'linear-gradient(135deg, rgba(5,150,105,0.09), rgba(13,148,136,0.05))',
              borderRight: '5px solid #059669',
              borderRadius: '14px',
              padding: '12px 18px',
              margin: '18px 0 10px 0',
              fontWeight: 800,
              color: '#064e3b',
              fontSize: 'clamp(1.1rem, 3vw, 1.35rem)'
            }}
          >
            {renderInline(block.text, `hdr-${bIdx}`)}
          </div>
        )
      }

      return (
        <p key={`p-${bIdx}`} style={{ marginBottom: '14px', lineHeight: 2.3 }}>
          {renderInline(block.text, `p-${bIdx}`)}
        </p>
      )
    }

    return <div key={`spc-${bIdx}`} style={{ height: '6px' }} />
  })
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '50px', textAlign: 'center', fontFamily: "'Tajawal', sans-serif" }}>جاري التحميل...</div>}>
      <PathwayLessonContent />
    </Suspense>
  )
}

export function PathwayLessonContent({ subjectProp, idProp, channel, isTeacher, hasControl = false }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const subject = subjectProp || searchParams.get('subject') || 'arabic'
  const nodeId = parseInt(idProp || searchParams.get('id') || '1')

  const pathData = pathways[subject] || pathways.arabic || []
  const lessonData = useMemo(() => {
    const node = (pathData || []).find(n => n.id === nodeId)
    if (!node) return null
    const data = { ...node.data }
    if (data.questions && !data.quizzes) data.quizzes = data.questions
    if (!data.options || data.options.length === 0) {
      const correct = data.correct || data.correctWord
      const wrongs = data.wrongOptions || data.wrong || []
      if (correct) {
        data.options = [correct, ...wrongs]
      }
    }
    return { ...node, data }
  }, [pathData, nodeId])
  const isArabic = !['english', 'math_en'].includes(subject)

  const [loading, setLoading] = useState(true)
  const [userMetadata, setUserMetadata] = useState(null)
  const [userId, setUserId] = useState(null)
  const [hearts, setHearts] = useState(3)
  const [stage, setStage] = useState('playing') // playing, success, fail
  const [showCert, setShowCert] = useState(false)
  
  // Quiz specific state
  const [options, setOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [wrongAnswerCount, setWrongAnswerCount] = useState(0) // for hint system
  const [hintActive, setHintActive] = useState(false)
  
  // Story/Song specific state
  const [storyStage, setStoryStage] = useState('reading') // reading, vocab, quiz
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [visitedTabs, setVisitedTabs] = useState(new Set(['reading'])) // tab gating
  const [essayAnswer, setEssayAnswer] = useState('')
  const [showEssayCorrection, setShowEssayCorrection] = useState(false)

  // 🎧 Listening Lesson state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [listenCount, setListenCount] = useState(0)
  const ttsUtteranceRef = useRef(null)
  const isListeningLesson = lessonData?.icon === '🎧'

  // 🔗 Matching quiz state
  const [matchingLeft, setMatchingLeft] = useState(null)   // selected left item index
  const [matchingPairs, setMatchingPairs] = useState({})   // { leftIdx: rightIdx }
  const [matchingShuffledRight, setMatchingShuffledRight] = useState([])

  // 📋 Ordering quiz state
  const [orderItems, setOrderItems] = useState([])          // current user order
  const [orderSelected, setOrderSelected] = useState(null)  // selected item index
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  
  // Canvas state
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const hasDrawnOnCanvas = useRef(false) // validates that student actually drew
  const [canDone, setCanDone] = useState(false) // enables Done button after drawing
  const [brushColor, setBrushColor] = useState('#059669')
  const [brushSize, setBrushSize] = useState(15)
  const [drawScore, setDrawScore] = useState(0)
  const [learnRepeatCount, setLearnRepeatCount] = useState(0) // Tracks child repeating letter shape/sound
  const [traceRound, setTraceRound] = useState(1) // 3-round tracing mastery (1, 2, 3)

  // 🎙️ Speech Recognition (Smart Mic Pronunciation Challenge)
  const [isListening, setIsListening] = useState(false)
  const [speechFeedback, setSpeechFeedback] = useState(null)
  const recognitionRef = useRef(null)

  // SFX and Animation state
  const [animatingOption, setAnimatingOption] = useState(null)
  const [animType, setAnimType] = useState(null) // 'shake' or 'success'

  // Teacher-Student State Sync
  useEffect(() => {
    if (!channel) return
    // Teacher ALWAYS listens. Students listen ONLY if they don't have control.
    if (!isTeacher && hasControl) return

    const originalOn = channel.on.bind(channel) || channel.on
    if (typeof channel.on === 'function') {
      try {
        const sub = channel.on('broadcast', { event: 'student_lesson_state' }, (msg) => {
          const state = msg.payload
          if (!state) return
          if (state.storyStage !== undefined) setStoryStage(state.storyStage)
          if (state.currentQuizIndex !== undefined) setCurrentQuizIndex(state.currentQuizIndex)
          if (state.matchingLeft !== undefined) setMatchingLeft(state.matchingLeft)
          if (state.matchingPairs !== undefined) setMatchingPairs(state.matchingPairs)
          if (state.matchingShuffledRight !== undefined) setMatchingShuffledRight(state.matchingShuffledRight)
          if (state.orderItems !== undefined) setOrderItems(state.orderItems)
          if (state.orderSelected !== undefined) setOrderSelected(state.orderSelected)
          if (state.orderSubmitted !== undefined) setOrderSubmitted(state.orderSubmitted)
          if (state.wrongAnswerCount !== undefined) setWrongAnswerCount(state.wrongAnswerCount)
          if (state.hearts !== undefined) setHearts(state.hearts)
          if (state.hintActive !== undefined) setHintActive(state.hintActive)
          if (state.canDone !== undefined) setCanDone(state.canDone)
          if (state.animatingOption !== undefined) setAnimatingOption(state.animatingOption)
          if (state.animType !== undefined) setAnimType(state.animType)
          if (state.stage !== undefined) setStage(state.stage)
          if (state.essayAnswer !== undefined) setEssayAnswer(state.essayAnswer)
          if (state.showEssayCorrection !== undefined) setShowEssayCorrection(state.showEssayCorrection)
        })
        return () => {}
      } catch (err) {
        console.warn('Sync listener error:', err)
      }
    }
  }, [channel, isTeacher, hasControl])

  useEffect(() => {
    if (!channel) return
    // Only the student WITH control broadcasts their state.
    if (isTeacher || !hasControl) return
    
    const syncState = {
      storyStage, currentQuizIndex, matchingLeft, matchingPairs,
      matchingShuffledRight, orderItems, orderSelected, orderSubmitted,
      wrongAnswerCount, hearts, hintActive, canDone, animatingOption, animType, stage,
      essayAnswer, showEssayCorrection
    }
    channel.send({
      type: 'broadcast',
      event: 'student_lesson_state',
      payload: syncState
    }).catch(() => {})
  }, [
    channel, isTeacher, hasControl, storyStage, currentQuizIndex, matchingLeft, matchingPairs,
    matchingShuffledRight, orderItems, orderSelected, orderSubmitted,
    wrongAnswerCount, hearts, hintActive, canDone, animatingOption, animType, stage,
    essayAnswer, showEssayCorrection
  ])


  const playSFX = (type) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.connect(gain)
      gain.connect(audioCtx.destination)

      if (type === 'correct') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1) // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.3)
      } else if (type === 'wrong') {
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(150, audioCtx.currentTime)
        osc.frequency.setValueAtTime(100, audioCtx.currentTime + 0.1)
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.3)
      } else if (type === 'levelup') {
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(440, audioCtx.currentTime)
        osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.1)
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2)
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.3)
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.6)
      }
    } catch (e) {
      console.warn('AudioContext not supported or blocked')
    }
  }

  // ── Reset ALL lesson state when moving to a new lesson node ──────────────────
  useEffect(() => {
    setStage('playing')
    setHearts(3)
    setWrongAnswerCount(0)
    setHintActive(false)
    setStoryStage('reading')
    setVisitedTabs(new Set(['reading']))
    setCurrentQuizIndex(0)
    setAnimatingOption(null)
    setAnimType(null)
    hasDrawnOnCanvas.current = false
    setCanDone(false)
    setLearnRepeatCount(0)
    setTraceRound(1)
  }, [nodeId]) // triggers on every lesson change

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          setUserMetadata(user.user_metadata)
        }
      } catch (err) {
        console.error('Error fetching user:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (!lessonData) return

    // Set initial options for quiz
    if (lessonData.type === 'quiz_sound' || lessonData.type === 'quiz_word') {
      let opts = []
      if (lessonData.data.options && Array.isArray(lessonData.data.options) && lessonData.data.options.length > 0) {
        opts = [...lessonData.data.options]
      } else {
        const correct = lessonData.data.correct || lessonData.data.correctWord
        const wrongs = lessonData.data.wrongOptions || lessonData.data.wrong || []
        if (correct) opts = [correct, ...wrongs]
      }
      setOptions([...opts].sort(() => Math.random() - 0.5))
    } else if (lessonData.type === 'story' || lessonData.type === 'song' || lessonData.type === 'review' || lessonData.type === 'quiz' || lessonData.type === 'lesson') {
      if (lessonData.data?.quizzes && lessonData.data.quizzes[currentQuizIndex]) {
        const q = lessonData.data.quizzes[currentQuizIndex]
        const opts = q.opts || q.options
        if (opts) {
          setOptions([...opts].sort(() => Math.random() - 0.5))
        }
      }
    }
  }, [currentQuizIndex, storyStage, lessonData])

  // Reset speech recognition state on lesson change
  useEffect(() => {
    setSpeechFeedback(null)
    setIsListening(false)
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch(e) {}
    }
  }, [lessonData])

  // Auto-play sound for quiz_sound lessons
  useEffect(() => {
    if (lessonData && lessonData.type === 'quiz_sound' && !loading) {
      const timer = setTimeout(() => {
        playVoice(lessonData.data.soundToPlay)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [lessonData, loading])

  // 🎧 Auto-play for listening lessons — triggers after 1.2s on load
  useEffect(() => {
    if (lessonData && isListeningLesson && !loading && storyStage === 'reading') {
      const timer = setTimeout(() => {
        handlePlayListening()
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [lessonData, loading]) // eslint-disable-line

  // Initialize matching / ordering state when quiz index changes
  useEffect(() => {
    if (!lessonData) return
    const q = lessonData.data?.quizzes?.[currentQuizIndex]
    if (!q) return

    if (q.type === 'matching' && q.pairs) {
      const rightItems = q.pairs.map(p => p.right)
      setMatchingShuffledRight([...rightItems].sort(() => Math.random() - 0.5))
      setMatchingPairs({})
      setMatchingLeft(null)
    }
    if (q.type === 'order' && q.items) {
      setOrderItems([...q.items].sort(() => Math.random() - 0.5))
      setOrderSelected(null)
      setOrderSubmitted(false)
    }
  }, [currentQuizIndex, lessonData])

  const playVoice = (text, rate = 0.88) => {
    if (!text) return
    // Strip HTML tags if content was accidentally passed (e.g., prep2 data.content)
    const cleanText = typeof text === 'string' && text.includes('<')
      ? text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
      : text
    if (!cleanText) return
    setIsPlayingAudio(true)
    playTTS(cleanText, { 
      isArabic, 
      rate, 
      onEnd: () => setIsPlayingAudio(false) 
    })
  }

  // 🎧 Listening lesson audio controller
  const handlePlayListening = () => {
    if (isPlayingAudio) {
      // Stop current speech
      cancelTTS()
      setIsPlayingAudio(false)
      return
    }
    
    let textToPlay = lessonData?.data?.text
    if (!textToPlay && lessonData?.data?.content) {
      // Strip HTML tags for clean TTS
      textToPlay = lessonData.data.content.replace(/<[^>]*>?/gm, ' ')
    }
    
    if (!textToPlay) return
    playVoice(textToPlay, 0.9)
  }

  const handleComplete = async () => {
    playSFX('levelup')
    playVoice(isArabic ? 'رائع جداً يا بطل!' : 'Awesome Champion!')
    setStage('success')
    
    // Trigger Confetti
    try {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b']
      })
    } catch (e) {}

    // Save Pathway Progress in Supabase + localStorage with XP
    await savePathwayProgress(userId, subject, nodeId, 20)
  }

  const handleFail = () => {
    playSFX('buzz')
    setStage('fail')
    playVoice(isArabic ? 'حاول مرة أخرى' : 'Try again')
  }

  const handleOptionClick = (opt) => {
    if (stage !== 'playing' || animatingOption) return
    
    let isCorrect = false
    let correctAnswer = ''
    if (lessonData.type === 'story' || lessonData.type === 'song' || lessonData.type === 'review' || lessonData.type === 'quiz' || lessonData.type === 'lesson') {
      isCorrect = opt === lessonData.data.quizzes[currentQuizIndex].correct
      correctAnswer = lessonData.data.quizzes[currentQuizIndex].correct
    } else {
      isCorrect = opt === lessonData.data.correct || opt === lessonData.data.correctWord
      correctAnswer = lessonData.data.correct || lessonData.data.correctWord
    }
    
    setAnimatingOption(opt)
    setAnimType(isCorrect ? 'success' : 'shake')

    if (isCorrect) {
      // Reset hint and wrong count on success
      setWrongAnswerCount(0)
      setHintActive(false)
      setTimeout(() => {
        if (lessonData.type === 'story' || lessonData.type === 'song' || lessonData.type === 'review' || lessonData.type === 'quiz' || lessonData.type === 'lesson') {
          if (currentQuizIndex < lessonData.data.quizzes.length - 1) {
            setCurrentQuizIndex(prev => prev + 1)
            setWrongAnswerCount(0)
            setHintActive(false)
          } else {
            handleComplete()
          }
        } else {
          handleComplete()
        }
        setAnimatingOption(null)
      }, 500)
    } else {
      playSFX('buzz')
      const newWrongCount = wrongAnswerCount + 1
      setWrongAnswerCount(newWrongCount)
      // After 2 wrong answers, activate hint (highlight correct answer)
      if (newWrongCount >= 2) {
        setHintActive(true)
        playVoice(isArabic ? `الإجابة الصحيحة هي ${correctAnswer}` : `The correct answer is ${correctAnswer}`)
      } else {
        playVoice(isArabic ? 'خطأ، حاول مرة أخرى' : 'Wrong, try again')
      }
      const newHearts = hearts - 1
      
      if (userMetadata) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            let questionContext = lessonData.title
            if (lessonData.type === 'story' || lessonData.type === 'song' || lessonData.type === 'review' || lessonData.type === 'quiz' || lessonData.type === 'lesson') {
              questionContext = lessonData.data.quizzes[currentQuizIndex]?.q || questionContext
            }
            logStudentMistake(user.id, `pathway_${subject}_node${nodeId}`, `${questionContext} (Answered: ${opt})`).catch(console.error)
          }
        })
      }

      setTimeout(() => {
        setHearts(newHearts)
        if (newHearts <= 0) {
          handleFail()
        }
        setAnimatingOption(null)
      }, 800)
    }
  }

  // --- Canvas Logic for 'write' ---
  const hasDrawnInitial = useRef(false)
  
  useEffect(() => {
    hasDrawnInitial.current = false
  }, [lessonData])
  
  const initCanvas = (canvas) => {
    if (canvas && lessonData && lessonData.type === 'write' && !hasDrawnInitial.current) {
      canvasRef.current = canvas
      hasDrawnInitial.current = true
      
      const drawInitial = () => {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.lineWidth = brushSize
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = brushColor
        
        ctx.font = 'bold 180px Tajawal, Arial'
        ctx.fillStyle = '#94a3b8'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(lessonData.data.letter, canvas.width/2, canvas.height/2 + 15)
      }

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => setTimeout(drawInitial, 10))
      } else {
        setTimeout(drawInitial, 50)
      }
    }
  }

  const startDrawing = (e) => {
    isDrawing.current = true
    draw(e)
  }
  const stopDrawing = () => {
    isDrawing.current = false
    if (canvasRef.current) {
      canvasRef.current.getContext('2d').beginPath()
    }
  }
  const draw = (e) => {
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    // Support touch and mouse
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY)
    ctx.strokeStyle = brushColor
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY)
    // Mark that student has drawn at least something
    if (!hasDrawnOnCanvas.current) {
      hasDrawnOnCanvas.current = true
      setCanDone(true)
    }
  }

  // ── Repetition Handlers (Child Shape Encoding & Muscle Memory) ──────────
  const handleLearnRepeat = () => {
    const nextCount = learnRepeatCount + 1
    setLearnRepeatCount(nextCount)
    
    // Play letter sound
    playVoice(lessonData.data.sound || lessonData.data.letter)

    if (nextCount === 1) {
      playSFX('click')
    } else if (nextCount === 2) {
      playSFX('click')
    } else if (nextCount >= 3) {
      playSFX('levelup')
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      })
    }
  }

  const handleNextTraceRound = () => {
    if (traceRound < 3) {
      playSFX('click')
      const nextRound = traceRound + 1
      setTraceRound(nextRound)
      
      const encouragingMsg = isArabic
        ? (nextRound === 2 
            ? 'ممتاز! كرر رسم الحرف مرة ثانية لتثبيت حركة يدك وشكله في عقلك!' 
            : 'بطل حقيقي! المحاولة الأخيرة واعتمد إتقان الحرف!')
        : (nextRound === 2 
            ? 'Great! Trace it a second time to build muscle memory!' 
            : 'Last attempt! Trace it to master the shape!')
      playVoice(encouragingMsg)

      // Clear canvas and redraw template for the next round
      if (canvasRef.current && lessonData) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.font = 'bold 180px Tajawal, Arial'
        ctx.fillStyle = nextRound === 2 ? '#cbd5e1' : '#e2e8f0'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(lessonData.data.letter, canvas.width / 2, canvas.height / 2 + 15)
        hasDrawnOnCanvas.current = false
        setCanDone(false)
      }
    } else {
      // Round 3 Complete!
      playSFX('levelup')
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } })
      handleComplete()
    }
  }

  // ── Speech Recognition & Voice Pronunciation Engine ─────────────────────
  const normalizeSpeech = (text) => {
    if (!text) return ''
    return text
      .replace(/[\u064B-\u065F\u0670]/g, '') // remove Arabic tashkeel
      .replace(/[أإآء]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .toLowerCase()
      .trim()
  }

  const ARABIC_LETTER_MAPPINGS = {
    'أ': ['الف', 'ا', 'همزه', 'اسد', 'ارنب'],
    'ب': ['باء', 'با', 'ب', 'بطه'],
    'ت': ['تاء', 'تا', 'ت', 'تفاح', 'تمساح', 'تاج'],
    'ث': ['ثاء', 'ثا', 'ث', 'ثعلب', 'ثمار'],
    'ج': ['جيم', 'جي', 'ج', 'جمل', 'جسر'],
    'ح': ['حاء', 'حا', 'ح', 'حصان', 'حوت'],
    'خ': ['خاء', 'خا', 'خ', 'خروف', 'خبز'],
    'د': ['دال', 'دا', 'د', 'ديك', 'دب'],
    'ذ': ['ذال', 'ذا', 'ذ', 'ذئب', 'ذهب'],
    'ر': ['راء', 'را', 'ر', 'رمان', 'رجل'],
    'ز': ['زاي', 'زا', 'زين', 'ز', 'زرافه'],
    'س': ['سين', 'سي', 'س', 'سمكه', 'شمس'],
    'ش': ['شين', 'شي', 'ش', 'شمس', 'شراع'],
    'ص': ['صاد', 'صا', 'ص', 'صقر', 'صندوق'],
    'ض': ['ضاد', 'ضا', 'ض', 'ضفدع', 'ضرس'],
    'ط': ['طاء', 'طا', 'ط', 'طائره', 'طفل'],
    'ظ': ['ظاء', 'ظا', 'ظ', 'ظبي', 'ظفر'],
    'ع': ['عين', 'عي', 'ع', 'عنب', 'عصفور'],
    'غ': ['غين', 'غي', 'غ', 'غزال', 'غراب'],
    'ف': ['فاء', 'فا', 'ف', 'فيل', 'فار'],
    'ق': ['قاف', 'قا', 'ق', 'قرد', 'قلم', 'قطه'],
    'ك': ['كاف', 'كا', 'ك', 'كلب', 'كتاب'],
    'ل': ['لام', 'لا', 'ل', 'ليمون', 'لسان'],
    'م': ['ميم', 'مي', 'م', 'موز', 'مقص'],
    'ن': ['نون', 'نو', 'ن', 'نمله', 'نسر'],
    'ه': ['هاء', 'ها', 'ه', 'هرم', 'هلال'],
    'هـ': ['هاء', 'ها', 'ه', 'هرم', 'هلال'],
    'و': ['واو', 'وو', 'و', 'ورده', 'ولد'],
    'ي': ['ياء', 'يا', 'ي', 'يد', 'يرقه']
  }

  const handleStartVoiceRecognition = (mode = 'learn') => {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!SpeechRecognition) {
      setSpeechFeedback({
        type: 'info',
        text: isArabic 
          ? '💡 المتصفح لا يدعم الميكروفون المباشر. ردد بصوتك العالي واضغط زر التكرار!' 
          : '💡 Voice recognition is not supported in this browser. Repeat aloud!'
      })
      return
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch(e) {}
      }

      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      recognition.lang = isArabic ? 'ar-SA' : 'en-US'
      recognition.interimResults = false
      recognition.maxAlternatives = 3

      setIsListening(true)
      setSpeechFeedback({
        type: 'listening',
        text: isArabic ? '🎙️ استمع إليك الآن... انطق بصوت واضح وقوي!' : '🎙️ Listening now... Speak clearly and loudly!'
      })

      recognition.onresult = (event) => {
        setIsListening(false)
        const transcript = (event.results && event.results[0] && event.results[0][0]?.transcript) || ''
        validateSpokenVoice(transcript, mode)
      }

      recognition.onerror = (event) => {
        setIsListening(false)
        if (event.error === 'not-allowed') {
          setSpeechFeedback({
            type: 'error',
            text: isArabic ? '⚠️ يرجى تفعيل إذن الميكروفون في المتصفح للتحدث!' : '⚠️ Please allow microphone permission to speak!'
          })
        } else {
          setSpeechFeedback({
            type: 'info',
            text: isArabic ? 'لم أسمعك بوضوح. تحدث بالقرب من الميكروفون يا بطل!' : 'Could not hear clearly. Speak closer to the microphone!'
          })
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch (err) {
      setIsListening(false)
      console.warn('Speech recognition start failed:', err)
    }
  }

  const validateSpokenVoice = (rawTranscript, mode) => {
    const normSpoken = normalizeSpeech(rawTranscript)
    
    if (mode === 'quiz_sound') {
      const correctVal = lessonData?.data?.correct || lessonData?.data?.correctWord || ''
      const normCorrect = normalizeSpeech(correctVal)
      const validVariants = ARABIC_LETTER_MAPPINGS[correctVal] || []
      const normVariants = validVariants.map(normalizeSpeech)
      
      const tokens = normSpoken.split(/\s+/)
      const isMatch = tokens.some(t => t === normCorrect || normVariants.includes(t)) || 
                      normSpoken.includes(normCorrect) || 
                      (correctVal && rawTranscript.toLowerCase().includes(correctVal.toLowerCase()))

      if (isMatch) {
        handleOptionClick(correctVal)
        setSpeechFeedback({
          type: 'success',
          text: isArabic ? `🎉 أحسنت يا بطل! سمعتك تقول (${rawTranscript}) وهي الإجابة الصحيحة! ⭐` : `🎉 Excellent! You correctly answered (${rawTranscript})! ⭐`
        })
      } else {
        setSpeechFeedback({
          type: 'try_again',
          text: isArabic ? `سمعتك تقول: "${rawTranscript}". حاول مرة ثانية أو اختر من الأزرار بالأسفل!` : `Heard: "${rawTranscript}". Try again or tap the buttons below!`
        })
      }
      return
    }

    // Default: 'learn' mode
    const targetChar = lessonData?.data?.letter || ''
    const normTarget = normalizeSpeech(targetChar)
    const soundName = normalizeSpeech(lessonData?.data?.sound || '')
    const validVariants = ARABIC_LETTER_MAPPINGS[targetChar] || []
    const normVariants = validVariants.map(normalizeSpeech)

    let isMatch = false
    if (isArabic) {
      const tokens = normSpoken.split(/\s+/)
      isMatch = tokens.some(t => 
        t === normTarget || 
        t === soundName || 
        normVariants.includes(t) ||
        (t.length > 0 && normTarget.length > 0 && t.includes(normTarget))
      ) || normSpoken.includes(normTarget) || normSpoken.includes(soundName)
    } else {
      const tokens = normSpoken.split(/\s+/)
      isMatch = tokens.some(t => t === normTarget || t.startsWith(normTarget)) || normSpoken.includes(normTarget)
    }

    if (isMatch) {
      playSFX('levelup')
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } })
      setLearnRepeatCount(prev => Math.max(3, prev + 1))
      setSpeechFeedback({
        type: 'success',
        text: isArabic ? `🌟 ما شاء الله! نطقت (${rawTranscript}) بدقة وفصاحة مذهلة! (+10 XP) 👏` : `🌟 Amazing! You pronounced (${rawTranscript}) perfectly! 👏`
      })
      playVoice(isArabic ? 'نطق ممتاز يا بطل!' : 'Great job champion!')
    } else {
      playSFX('click')
      setSpeechFeedback({
        type: 'try_again',
        text: isArabic ? `سمعتك تقول: "${rawTranscript}". حاول مرة ثانية وانطق (${targetChar}) بصوت أوضح يا بطل! 😊` : `Heard: "${rawTranscript}". Try again and say (${targetChar}) clearly!`
      })
      playVoice(isArabic ? 'حاول مرة أخرى بصوت واضح' : 'Try once more clearly')
    }
  }

  if (loading || !lessonData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', background: 'var(--bg-main, #f0fdf4)', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #d1fae5', borderTop: '4px solid #059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--primary-dark, #064e3b)', fontWeight: 700 }}>جاري التحميل...</p>
      </div>
    )
  }

  let mascotText = lessonData.desc
  let mascotEmoji = '🦉'
  if (stage === 'success') {
    mascotText = isArabic ? 'أنت بطل رائع!' : 'You are a Champion!'
    mascotEmoji = '🎉'
  } else if (stage === 'fail') {
    mascotText = isArabic ? 'لا بأس، حاول مرة أخرى!' : 'It is ok, try again!'
    mascotEmoji = '💪'
  } else if (animatingOption && animType === 'shake') {
    mascotText = isArabic ? 'أوبس! ركز قليلاً' : 'Oops! Focus a bit'
    mascotEmoji = '🤔'
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'radial-gradient(circle at bottom right, #d1fae5 0%, var(--bg-main, #f0fdf4) 100%)',
      padding: 'clamp(12px, 3vw, 24px)',
      boxSizing: 'border-box',
      direction: isArabic ? 'rtl' : 'ltr',
    }}>
      <style>{`
        .lesson-btn {
          touch-action: manipulation;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          border: none;
          font-family: 'Tajawal', 'Cairo', sans-serif;
          font-weight: 800;
        }
        @media (hover: hover) and (pointer: fine) {
          .lesson-btn:hover { filter: brightness(1.06); transform: translateY(-2px); }
        }
        .lesson-btn:active { transform: translateY(3px) !important; opacity: 0.85; }
        .quiz-btn {
          touch-action: manipulation;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: 'Tajawal', 'Cairo', sans-serif;
        }
        @media (hover: hover) and (pointer: fine) {
          .quiz-btn:hover { filter: brightness(1.04); transform: translateY(-2px); }
        }
        .quiz-btn:active { transform: translateY(4px) !important; }
        .word-tap {
          cursor: pointer; display: inline-block; margin: 0 4px;
          transition: color 0.2s, transform 0.2s;
        }
        @media (hover: hover) and (pointer: fine) {
          .word-tap:hover { color: var(--primary-color, #059669) !important; transform: scale(1.12); }
        }
        .word-tap:active { transform: scale(0.95); }
        .tab-item { transition: all 0.3s ease; cursor: pointer; touch-action: manipulation; }
        .tab-item:active { transform: scale(0.95); }
      `}</style>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* ── Top Bar: Hearts + Progress + Close ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 16px)',
          marginBottom: 'clamp(16px, 3vw, 28px)',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: '50px',
          padding: 'clamp(8px, 2vw, 14px) clamp(14px, 3vw, 20px)',
          boxShadow: 'var(--shadow-sm, 0 4px 12px rgba(5,150,105,0.08))',
        }}>
          {/* Hearts */}
          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
            {[...Array(3)].map((_, i) => (
              <span key={i} style={{ fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', filter: i >= hearts ? 'grayscale(100%) opacity(0.4)' : 'none', transition: 'filter 0.3s' }}>❤️</span>
            ))}
          </div>
          {/* Progress bar */}
          <div style={{ flex: 1, background: 'rgba(5,150,105,0.08)', height: '14px', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{
              width: `${lessonData.data?.quizzes?.length ? Math.min(((currentQuizIndex + 1) / lessonData.data.quizzes.length) * 100, 100) : 50}%`,
              height: '100%',
              background: 'var(--primary-gradient, linear-gradient(90deg, #059669, #34d399))',
              borderRadius: '14px',
              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>
          {/* Close */}
          <button
            className="lesson-btn"
            onClick={() => { if (!channel) router.push(`/kids-corner/pathway?subject=${subject}`); }}
            style={{ background: 'rgba(5,150,105,0.08)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: channel ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'var(--text-muted, #475569)', flexShrink: 0 }}
          >✕</button>
        </div>

        {/* ── Mascot ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 20px)', marginBottom: 'clamp(16px, 3vw, 28px)', animation: 'slideDown 0.5s ease-out' }}>
          <div style={{ fontSize: 'clamp(2.2rem, 7vw, 3.5rem)', animation: animatingOption && animType === 'shake' ? 'shake 0.5s ease-in-out' : 'float 3s ease-in-out infinite', flexShrink: 0 }}>{mascotEmoji}</div>
          <div style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(5,150,105,0.2)',
            padding: 'clamp(10px, 2.5vw, 14px) clamp(16px, 4vw, 24px)',
            borderRadius: isArabic ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
            boxShadow: 'var(--shadow-sm, 0 4px 12px rgba(5,150,105,0.08))',
            color: 'var(--primary-dark, #064e3b)',
            fontSize: 'clamp(0.95rem, 3vw, 1.2rem)',
            fontWeight: 700,
          }}>{mascotText}</div>
        </div>

        {/* ── Main Content ── */}
        {stage === 'playing' && (
          <div style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.7)',
            borderRadius: 'var(--radius-xl, 28px)',
            padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)',
            boxShadow: 'var(--shadow-lg, 0 20px 40px rgba(5,150,105,0.1))',
          }}>
            
            {/* TYPE: UNIT START */}
            {lessonData.type === 'unit_start' && (
              <div style={{ animation: 'zoomIn 0.5s ease-out', textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', marginBottom: '16px' }}>🚀</div>
                <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', color: 'var(--primary-dark, #064e3b)', marginBottom: '12px' }}>{lessonData.title}</h1>
                <p style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', color: 'var(--text-muted, #475569)', marginBottom: 'clamp(28px, 6vw, 48px)', lineHeight: 1.7 }}>{lessonData.desc}</p>
                <button
                  className="lesson-btn"
                  onClick={handleComplete}
                  style={{ padding: 'clamp(12px, 3vw, 16px) clamp(32px, 8vw, 56px)', background: 'var(--primary-gradient, linear-gradient(135deg, #059669, #0d9488))', color: 'white', borderRadius: '50px', fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', boxShadow: '0 8px 20px rgba(5,150,105,0.3)' }}
                >
                  {isArabic ? 'هيا نبدأ 🚀' : "Let's Start 🚀"}
                </button>
              </div>
            )}

            {/* TYPE: STORY / SONG / LESSON */}
            {(lessonData.type === 'story' || lessonData.type === 'song' || lessonData.type === 'lesson') && (
              <div style={{animation: 'zoomIn 0.5s ease-out'}}>
                
                {/* Tabs */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: 'clamp(20px, 4vw, 32px)', background: 'rgba(5,150,105,0.06)', padding: '6px', borderRadius: '50px', border: '1px solid rgba(5,150,105,0.12)' }}>
                  {['reading', 'vocab', 'quiz'].map(tab => {
                    const titles = { reading: 'القراءة 📖', vocab: 'المفردات 📚', quiz: 'التحدي 🎮' }
                    const isActive = storyStage === tab
                    return (
                      <div
                        key={tab}
                        className="tab-item"
                        style={{
                          flex: 1, textAlign: 'center',
                          padding: 'clamp(8px, 2vw, 12px) clamp(10px, 2.5vw, 16px)',
                          borderRadius: '50px', fontWeight: 800,
                          fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)',
                          cursor: 'pointer',
                          background: isActive ? 'var(--primary-gradient, linear-gradient(135deg, #059669, #0d9488))' : 'transparent',
                          color: isActive ? 'white' : 'var(--text-muted, #475569)',
                          boxShadow: isActive ? '0 4px 12px rgba(5,150,105,0.25)' : 'none',
                        }}
                        onClick={() => {
                          setStoryStage(tab)
                          setVisitedTabs(prev => new Set(prev).add(tab))
                        }}
                      >
                        {titles[tab]}
                      </div>
                    )
                  })}
                </div>

                {/* Stage: Reading */}
                {storyStage === 'reading' && (
                  <div>
                    <h2 style={{ color: 'var(--primary-dark, #064e3b)', fontSize: 'clamp(1.3rem, 4vw, 2rem)', marginBottom: 'clamp(12px, 3vw, 20px)', textAlign: 'center' }}>{lessonData.title}</h2>

                    {/* 🎧 LISTENING LESSON PLAYER — shown only for listening nodes */}
                    {isListeningLesson ? (
                      <div style={{
                        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                        borderRadius: '24px',
                        padding: 'clamp(20px, 4vw, 32px)',
                        marginBottom: '24px',
                        boxShadow: '0 16px 40px rgba(79,70,229,0.35)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {/* Decorative waves */}
                        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.4) 20px, rgba(255,255,255,0.4) 21px)', pointerEvents: 'none' }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px', position: 'relative' }}>
                          <div style={{ fontSize: '2.4rem', animation: isPlayingAudio ? 'pulse 1s infinite' : 'none' }}>🎧</div>
                          <div>
                            <div style={{ color: '#a5b4fc', fontWeight: 900, fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', marginBottom: '2px' }}>نص الاستماع</div>
                            <div style={{ color: 'white', fontWeight: 800, fontSize: 'clamp(1rem, 2.8vw, 1.2rem)' }}>{lessonData.title}</div>
                          </div>
                          {listenCount > 0 && (
                            <div style={{ marginRight: 'auto', background: 'rgba(165,180,252,0.2)', color: '#c7d2fe', padding: '4px 12px', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 800, border: '1px solid rgba(165,180,252,0.3)' }}>
                              استمعت {listenCount} {listenCount === 1 ? 'مرة' : 'مرات'} ✓
                            </div>
                          )}
                        </div>

                        {/* Animated waveform bars */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '48px', marginBottom: '20px' }}>
                          {[0.4,0.7,1,0.85,0.6,0.9,0.5,0.75,1,0.65,0.8,0.55,0.9,0.7,0.45].map((h, i) => (
                            <div key={i} style={{
                              width: '5px', borderRadius: '3px',
                              height: `${h * 40}px`,
                              background: isPlayingAudio ? '#818cf8' : 'rgba(165,180,252,0.35)',
                              animation: isPlayingAudio ? `waveBar${i % 4} ${0.6 + i * 0.08}s ease-in-out infinite alternate` : 'none',
                              transition: 'height 0.3s'
                            }} />
                          ))}
                        </div>

                        <style>{`
                          @keyframes waveBar0 { from { transform: scaleY(0.5); } to { transform: scaleY(1.3); } }
                          @keyframes waveBar1 { from { transform: scaleY(0.8); } to { transform: scaleY(0.4); } }
                          @keyframes waveBar2 { from { transform: scaleY(1); } to { transform: scaleY(0.6); } }
                          @keyframes waveBar3 { from { transform: scaleY(0.6); } to { transform: scaleY(1.1); } }
                        `}</style>

                        {/* Play/Stop button */}
                        <button
                          className="lesson-btn"
                          onClick={handlePlayListening}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: isPlayingAudio ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                            color: isPlayingAudio ? '#ef4444' : '#38bdf8',
                            border: `2px solid ${isPlayingAudio ? 'rgba(239, 68, 68, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
                            borderRadius: '12px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {isPlayingAudio ? (
                            <>
                              <span style={{ fontSize: '1.2rem' }}>⏹</span>
                              إيقاف الاستماع
                            </>
                          ) : (
                            <>
                              <span style={{ fontSize: '1.2rem' }}>▶</span>
                              استمع للنص
                            </>
                          )}
                        </button>

                        <p style={{ color: '#a5b4fc', textAlign: 'center', marginTop: '14px', fontSize: '0.82rem', fontWeight: 700 }}>
                          💡 استمع للنص جيداً ثم تابع القراءة والمفردات واختبر نفسك
                        </p>
                      </div>
                    ) : (
                      /* Standard Instructions Banner for non-listening lessons */
                      <div style={{ background: 'rgba(5,150,105,0.07)', border: '1.5px solid rgba(5,150,105,0.2)', borderRadius: '16px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#065f46', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', fontWeight: 700 }}>
                        <span style={{ fontSize: '1.3rem' }}>💡</span>
                        <span>تعليمات: اقرأ النص التالي بعناية، أو اضغط «استمع للنص»، كما يمكنك الضغط على أي كلمة منفردة لسماع نطقها الفصيح.</span>
                      </div>
                    )}

                    {/* Standard read-aloud button — for non-listening lessons only */}
                    {!isListeningLesson && (
                      <div style={{ textAlign: 'center', marginBottom: 'clamp(16px, 4vw, 24px)' }}>
                        <button
                          className="lesson-btn"
                          onClick={() => {
                            const rawText = lessonData.data.text ||
                              (lessonData.data.content
                                ? lessonData.data.content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
                                : '')
                            if (rawText) playVoice(rawText)
                          }}
                          style={{ padding: 'clamp(10px, 2.5vw, 14px) clamp(20px, 5vw, 32px)', background: 'var(--primary-gradient, linear-gradient(135deg, #059669, #0d9488))', color: 'white', borderRadius: '50px', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', boxShadow: '0 6px 16px rgba(5,150,105,0.3)' }}
                        >🔊 استمع للنص كاملاً</button>
                      </div>
                    )}
                    <div style={{ background: 'rgba(5,150,105,0.04)', padding: 'clamp(16px, 4vw, 28px)', borderRadius: '20px', border: '1px solid rgba(5,150,105,0.1)', fontSize: 'clamp(1.1rem, 3.2vw, 1.55rem)', lineHeight: 2.3, textAlign: 'justify', color: 'var(--text-dark, #064e3b)' }}>

                      {/* Visual asset: show image if lesson has imageUrl */}
                      {lessonData.imageUrl && (
                        <div style={{ marginBottom: 'clamp(16px, 4vw, 28px)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(5,150,105,0.15)', border: '2px solid rgba(5,150,105,0.15)' }}>
                          <img
                            src={lessonData.imageUrl}
                            alt={lessonData.title}
                            style={{ width: '100%', display: 'block', maxHeight: '360px', objectFit: 'cover', cursor: 'zoom-in', transition: 'transform 0.3s ease' }}
                            onMouseEnter={e => e.target.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                            onClick={e => {
                              if (e.target.style.position === 'fixed') {
                                Object.assign(e.target.style, { position: '', top: '', left: '', width: '', maxHeight: '', zIndex: '', objectFit: 'cover', cursor: 'zoom-in', borderRadius: '' })
                              } else {
                                Object.assign(e.target.style, { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%) scale(1)', width: '90vw', maxHeight: '90vh', zIndex: '9999', objectFit: 'contain', cursor: 'zoom-out', borderRadius: '12px', boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)' })
                              }
                            }}
                          />
                          <div style={{ background: 'rgba(5,150,105,0.07)', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, color: '#065f46', textAlign: 'center' }}>
                            🖼️ اضغط على الصورة لتكبيرها
                          </div>
                        </div>
                      )}

                      {renderFormattedContent(lessonData.data.text || lessonData.data.content, playVoice)}
                    </div>

                    {isTeacher && lessonData.data.vocab && Object.keys(lessonData.data.vocab).length > 0 && (
                      <div style={{ marginTop: '40px', padding: '20px', borderTop: '2px dashed #cbd5e1' }}>
                        <h3 style={{ color: '#0f172a', marginBottom: '15px', textAlign: 'center' }}>👁️ نسخة المعلم: معاني المفردات (تظهر لك فقط لتسهيل الشرح)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '15px' }}>
                          {Object.keys(lessonData.data.vocab).map(type => {
                            const typeNames = { meaning: 'الكلمة ومعناها', opposite: 'الكلمة ومضادها', plural: 'الكلمة وجمعها', singular: 'الكلمة ومفردها' }
                            const items = lessonData.data.vocab[type]
                            if (!items || items.length === 0) return null
                            return (
                              <div key={type} style={{ background: '#f8fafc', borderRadius: '12px', padding: '15px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ textAlign: 'center', color: '#059669', marginBottom: '10px' }}>{typeNames[type]}</h4>
                                {items.map((item, idx) => (
                                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'white', borderRadius: '8px', marginBottom: '8px', border: '1px solid #e2e8f0', direction: 'rtl' }}>
                                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{item.w}</span>
                                    <span style={{ color: '#0ea5e9' }}>{item.m}</span>
                                  </div>
                                ))}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: 'clamp(20px, 5vw, 32px)' }}>
                      <button className="lesson-btn" onClick={() => { setStoryStage('vocab'); setVisitedTabs(prev => new Set([...prev, 'vocab'])) }} style={{ padding: 'clamp(12px, 3vw, 16px) clamp(28px, 7vw, 48px)', background: 'var(--primary-gradient, linear-gradient(135deg, #059669, #0d9488))', color: 'white', borderRadius: '50px', fontSize: 'clamp(1rem, 3vw, 1.3rem)', boxShadow: '0 8px 20px rgba(5,150,105,0.3)' }}>الانتقال إلى المفردات ⬅️</button>
                    </div>
                  </div>
                )}

                {/* Stage: Vocab */}
                {storyStage === 'vocab' && (
                  <div>
                    <h2 style={{ color: 'var(--primary-dark, #064e3b)', fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: '6px', textAlign: 'center' }}>الثروة اللغوية والمفردات 📚</h2>
                    
                    {/* Arabic Instructions Banner */}
                    <div style={{ background: 'rgba(5,150,105,0.07)', border: '1.5px solid rgba(5,150,105,0.2)', borderRadius: '16px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#065f46', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', fontWeight: 700 }}>
                      <span style={{ fontSize: '1.3rem' }}>💡</span>
                      <span>تعليمات: استعرض معاني ومضادات ومفردات الدرس، واضغط على أي كلمة أو رمز 🔊 للاستماع إلى النطق والمعنى.</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 'clamp(12px, 3vw, 20px)' }}>
                      {Object.keys(lessonData.data.vocab || {}).map(type => {
                        const typeNames = { meaning: 'الكلمة ومعناها', opposite: 'الكلمة ومضادها', plural: 'الكلمة وجمعها', singular: 'الكلمة ومفردها' }
                        const items = lessonData.data.vocab[type]
                        if (!items || items.length === 0) return null
                        return (
                          <div key={type} style={{ background: 'rgba(5,150,105,0.04)', borderRadius: '16px', padding: 'clamp(14px, 3vw, 20px)', border: '1px solid rgba(5,150,105,0.1)' }}>
                            <h3 style={{ textAlign: 'center', color: 'var(--primary-color, #059669)', marginBottom: '12px', fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)' }}>{typeNames[type]}</h3>
                            {items.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(10px, 2vw, 14px)', background: 'white', borderRadius: '14px', marginBottom: '10px', border: '1px solid rgba(5,150,105,0.12)', boxShadow: '0 2px 8px rgba(5,150,105,0.05)', direction: 'rtl' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                  <span className="word-tap" onClick={() => playVoice(item.w)} style={{ fontWeight: 800, color: '#064e3b', fontSize: 'clamp(1rem, 2.5vw, 1.15rem)' }}>{item.w}</span>
                                  <span style={{ color: '#059669', fontSize: '0.9rem', fontWeight: 900 }}>←</span>
                                  <span className="word-tap" onClick={() => playVoice(item.m)} style={{ fontWeight: 700, color: '#0d9488', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>{item.m}</span>
                                </div>
                                <button
                                  onClick={() => playVoice(`${item.w}، معناها ${item.m}`)}
                                  style={{ background: 'rgba(5,150,105,0.08)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0 }}
                                  title="استمع للكلمة ومعناها"
                                >
                                  🔊
                                </button>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(10px, 3vw, 20px)', marginTop: 'clamp(20px, 5vw, 32px)', flexWrap: 'wrap' }}>
                      <button className="lesson-btn" onClick={() => setStoryStage('reading')} style={{ padding: 'clamp(10px, 2.5vw, 14px) clamp(20px, 5vw, 32px)', background: 'rgba(5,150,105,0.08)', color: 'var(--primary-dark, #064e3b)', borderRadius: '50px', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', border: '1.5px solid rgba(5,150,105,0.2)' }}>➡️ العودة للقراءة</button>
                      <button className="lesson-btn" onClick={() => { setStoryStage('quiz'); setVisitedTabs(prev => new Set([...prev, 'quiz'])) }} style={{ padding: 'clamp(10px, 2.5vw, 14px) clamp(28px, 7vw, 48px)', background: 'var(--primary-gradient, linear-gradient(135deg, #059669, #0d9488))', color: 'white', borderRadius: '50px', fontSize: 'clamp(1rem, 3vw, 1.3rem)', boxShadow: '0 8px 20px rgba(5,150,105,0.3)' }}>ابدأ التحدي واختبر فهمك 🎮</button>
                    </div>
                  </div>
                )}

                {/* Stage: Quiz */}
                {storyStage === 'quiz' && (
                  <div>
                    {(() => {
                      const q = lessonData.data.quizzes[currentQuizIndex]
                      const qType = q?.type || 'mcq'

                      return (
                        <>
                          {/* Progress indicator */}
                          <div style={{ textAlign: 'center', marginBottom: 'clamp(8px, 2vw, 14px)', color: 'var(--primary-color, #059669)', fontWeight: 800, fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)' }}>
                            {qType === 'matching' ? '🔗' : qType === 'order' ? '📋' : '🎯'} السؤال {currentQuizIndex + 1} من {lessonData.data.quizzes.length}
                            {qType === 'matching' && <span style={{ color: '#7c3aed', marginRight: '8px' }}> — طابق العمودين</span>}
                            {qType === 'order' && <span style={{ color: '#d97706', marginRight: '8px' }}> — رتّب العناصر</span>}
                            {qType === 'mcq' && <span style={{ color: '#475569', marginRight: '8px' }}> — اختر الإجابة الصحيحة</span>}
                            {qType === 'essay' && <span style={{ color: '#059669', marginRight: '8px' }}> 📝 سؤال مقالي</span>}
                          </div>
                          <h2 style={{ color: 'var(--primary-dark, #064e3b)', fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)', marginBottom: 'clamp(20px, 4vw, 32px)', textAlign: 'center', lineHeight: 1.6 }}>{q.q}</h2>

                          {/* ─── MATCHING TYPE ─── */}
                          {qType === 'matching' && (
                            <div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(10px, 3vw, 20px)' }}>
                                {/* Left column (fixed order) */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  <div style={{ textAlign: 'center', color: '#059669', fontWeight: 900, fontSize: '0.9rem', marginBottom: '6px', background: 'rgba(5,150,105,0.07)', padding: '6px', borderRadius: '8px' }}>العمود أ</div>
                                  {q.pairs.map((pair, lIdx) => {
                                    const isSelected = matchingLeft === lIdx
                                    const isPaired = matchingPairs[lIdx] !== undefined
                                    const isCorrectPaired = isPaired && matchingShuffledRight[matchingPairs[lIdx]] === pair.right
                                    return (
                                      <button
                                        key={lIdx}
                                        className="quiz-btn"
                                        onClick={() => {
                                          if (isPaired) return
                                          setMatchingLeft(isSelected ? null : lIdx)
                                        }}
                                        style={{
                                          padding: 'clamp(10px, 2.5vw, 14px) clamp(12px, 3vw, 18px)',
                                          fontSize: 'clamp(1rem, 2.8vw, 1.3rem)',
                                          fontWeight: 800,
                                          background: isCorrectPaired ? '#d1fae5' : isPaired ? '#fee2e2' : isSelected ? '#ddd6fe' : 'white',
                                          border: `2.5px solid ${isCorrectPaired ? '#10b981' : isPaired ? '#f87171' : isSelected ? '#7c3aed' : '#e2e8f0'}`,
                                          borderRadius: '14px',
                                          color: isCorrectPaired ? '#065f46' : isPaired ? '#991b1b' : isSelected ? '#4c1d95' : '#334155',
                                          cursor: isPaired ? 'default' : 'pointer',
                                          transition: 'all 0.2s',
                                          boxShadow: isSelected ? '0 0 0 3px rgba(124,58,237,0.2)' : 'none',
                                          textAlign: 'right'
                                        }}
                                      >
                                        {isCorrectPaired ? '✅ ' : isPaired ? '❌ ' : isSelected ? '👆 ' : ''}{pair.left}
                                      </button>
                                    )
                                  })}
                                </div>

                                {/* Right column (shuffled) */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  <div style={{ textAlign: 'center', color: '#7c3aed', fontWeight: 900, fontSize: '0.9rem', marginBottom: '6px', background: 'rgba(124,58,237,0.07)', padding: '6px', borderRadius: '8px' }}>العمود ب</div>
                                  {matchingShuffledRight.map((rightItem, rIdx) => {
                                    const alreadyUsed = Object.values(matchingPairs).includes(rIdx)
                                    return (
                                      <button
                                        key={rIdx}
                                        className="quiz-btn"
                                        onClick={() => {
                                          if (matchingLeft === null || alreadyUsed) return
                                          const lIdx = matchingLeft
                                          const newPairs = { ...matchingPairs, [lIdx]: rIdx }
                                          setMatchingPairs(newPairs)
                                          setMatchingLeft(null)
                                          playSFX(rightItem === q.pairs[lIdx].right ? 'ding' : 'buzz')
                                          // Check if all paired
                                          if (Object.keys(newPairs).length === q.pairs.length) {
                                            const allCorrect = q.pairs.every((p, i) => matchingShuffledRight[newPairs[i]] === p.right)
                                            setTimeout(() => {
                                              if (allCorrect) handleComplete()
                                              else handleFail()
                                            }, 600)
                                          }
                                        }}
                                        style={{
                                          padding: 'clamp(10px, 2.5vw, 14px) clamp(12px, 3vw, 18px)',
                                          fontSize: 'clamp(1rem, 2.8vw, 1.3rem)',
                                          fontWeight: 800,
                                          background: alreadyUsed ? '#f0fdf4' : matchingLeft !== null ? '#faf5ff' : 'white',
                                          border: `2.5px solid ${alreadyUsed ? '#d1fae5' : matchingLeft !== null ? '#c4b5fd' : '#e2e8f0'}`,
                                          borderRadius: '14px',
                                          color: alreadyUsed ? '#6ee7b7' : matchingLeft !== null ? '#6d28d9' : '#334155',
                                          cursor: alreadyUsed || matchingLeft === null ? 'default' : 'pointer',
                                          transition: 'all 0.2s',
                                          opacity: alreadyUsed ? 0.6 : 1,
                                          textAlign: 'right'
                                        }}
                                      >
                                        {alreadyUsed ? '✓ ' : ''}{rightItem}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                              <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.82rem', fontWeight: 700, marginTop: '16px' }}>
                                {matchingLeft !== null ? '👆 الآن اختر العنصر المقابل في العمود ب' : '💡 اضغط على عنصر في العمود أ ثم اختر مقابله'}
                              </p>
                            </div>
                          )}

                          {/* ─── ORDERING TYPE ─── */}
                          {qType === 'order' && (
                            <div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                {orderItems.map((item, i) => {
                                  const isItemSelected = orderSelected === i
                                  return (
                                    <button
                                      key={`${item}-${i}`}
                                      className="quiz-btn"
                                      onClick={() => {
                                        if (orderSubmitted) return
                                        if (orderSelected === null) {
                                          setOrderSelected(i)
                                        } else if (orderSelected === i) {
                                          setOrderSelected(null)
                                        } else {
                                          // Swap
                                          const newItems = [...orderItems]
                                          const tmp = newItems[orderSelected]
                                          newItems[orderSelected] = newItems[i]
                                          newItems[i] = tmp
                                          setOrderItems(newItems)
                                          setOrderSelected(null)
                                        }
                                      }}
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: '14px',
                                        padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 22px)',
                                        fontSize: 'clamp(1rem, 2.8vw, 1.25rem)',
                                        fontWeight: 800,
                                        background: isItemSelected ? '#fef9c3' : 'white',
                                        border: `2.5px solid ${isItemSelected ? '#f59e0b' : '#e2e8f0'}`,
                                        borderRadius: '16px',
                                        color: isItemSelected ? '#92400e' : '#334155',
                                        cursor: 'pointer',
                                        textAlign: 'right',
                                        transition: 'all 0.2s',
                                        boxShadow: isItemSelected ? '0 0 0 3px rgba(245,158,11,0.2)' : '0 2px 6px rgba(0,0,0,0.04)'
                                      }}
                                    >
                                      <span style={{ background: isItemSelected ? '#f59e0b' : '#e2e8f0', color: isItemSelected ? 'white' : '#6b7280', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', flexShrink: 0 }}>{i + 1}</span>
                                      <span style={{ flex: 1 }}>{isItemSelected ? '👆 ' : ''}{item}</span>
                                      {orderSelected !== null && orderSelected !== i && (
                                        <span style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: 900 }}>ضع هنا ↕️</span>
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                              {!orderSubmitted ? (
                                <button
                                  className="lesson-btn"
                                  onClick={() => {
                                    setOrderSubmitted(true)
                                    const isCorrect = JSON.stringify(orderItems) === JSON.stringify(q.items)
                                    setTimeout(() => {
                                      if (isCorrect) handleComplete()
                                      else handleFail()
                                    }, 400)
                                  }}
                                  style={{ width: '100%', padding: 'clamp(12px, 3vw, 16px)', background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: 'white', borderRadius: '50px', fontSize: 'clamp(1rem, 2.8vw, 1.15rem)', boxShadow: '0 8px 20px rgba(217,119,6,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                >
                                  ✅ تحقق من الترتيب
                                </button>
                              ) : (
                                <div style={{ textAlign: 'center', padding: '16px', background: '#fef3c7', borderRadius: '16px', color: '#92400e', fontWeight: 800 }}>جاري التحقق...</div>
                              )}
                              <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.82rem', fontWeight: 700, marginTop: '14px' }}>
                                💡 اضغط على عنصر لاختياره، ثم اضغط على المكان الذي تريد نقله إليه
                              </p>
                            </div>
                          )}

                          {/* ─── DEFAULT MCQ TYPE ─── */}
                          {(qType === 'mcq' || (!q.type && q.opts)) && (
                            <>
                              {hintActive && (
                                <div style={{background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '15px', padding: '12px 20px', marginBottom: '16px', textAlign: 'center', fontSize: '1.05rem', fontWeight: 'bold', color: '#92400e', animation: 'zoomIn 0.3s'}}>
                                  <div>💡 تلميح: الإجابة الصحيحة مضاءة باللون الأخضر ({lessonData.data.quizzes?.[currentQuizIndex]?.correct})</div>
                                  {q.explanation && (
                                    <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#78350f', fontWeight: 600, background: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: '10px' }}>
                                      📖 الشرح والتوضيح: {q.explanation}
                                    </div>
                                  )}
                                </div>
                              )}

                              {q.explanation && !hintActive && (
                                <details style={{ marginBottom: '16px', background: 'rgba(5,150,105,0.06)', borderRadius: '12px', padding: '8px 14px', border: '1px solid rgba(5,150,105,0.15)', cursor: 'pointer', textAlign: 'right' }}>
                                  <summary style={{ fontWeight: 800, color: '#065f46', fontSize: '0.88rem', outline: 'none' }}>
                                    💡 اضغط هنا لإظهار الشرح والتوضيح التعليمي
                                  </summary>
                                  <div style={{ marginTop: '8px', fontSize: '0.88rem', color: '#064e3b', lineHeight: 1.7, fontWeight: 500 }}>
                                    {q.explanation}
                                  </div>
                                </details>
                              )}

                              <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px'}}>
                                {options.map((opt, i) => {
                                  const isAnimating = animatingOption === opt
                                  const isCorrectHint = hintActive && opt === (lessonData.data.quizzes?.[currentQuizIndex]?.correct)
                                  let bgColor = isCorrectHint ? '#d1fae5' : '#f8fafc'
                                  let borderColor = isCorrectHint ? '#10b981' : '#e2e8f0'
                                  let shadowColor = isCorrectHint ? '#059669' : '#cbd5e1'
                                  let color = isCorrectHint ? '#065f46' : '#334155'
                                  if (isAnimating) {
                                    if (animType === 'success') { bgColor = '#22c55e'; borderColor = '#16a34a'; shadowColor = '#15803d'; color = 'white' }
                                    else { bgColor = '#ef4444'; borderColor = '#dc2626'; shadowColor = '#991b1b'; color = 'white' }
                                  }
                                  return (
                                    <button key={i} className="quiz-btn" onClick={() => handleOptionClick(opt)} style={{ '--shadow-color': shadowColor, padding: '15px 30px', fontSize: 'clamp(1.2rem, 4vw, 2rem)', fontWeight: 'bold', background: bgColor, border: `3px solid ${borderColor}`, borderRadius: '20px', cursor: 'pointer', color, boxShadow: isAnimating && animType === 'success' ? `0 4px 0 ${shadowColor}` : `0 8px 0 ${shadowColor}`, transform: isAnimating && animType === 'success' ? 'scale(1.1) translateY(4px)' : 'scale(1)', animation: isAnimating && animType === 'shake' ? 'shake 0.4s ease-in-out' : 'none' }}>
                                      {opt}
                                    </button>
                                  )
                                })}
                              </div>
                            </>
                          )}

                          {/* 📝 ESSAY TYPE 📝 */}
                          {qType === 'essay' && (
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                              <textarea
                                value={essayAnswer}
                                onChange={(e) => setEssayAnswer(e.target.value)}
                                disabled={showEssayCorrection}
                                placeholder="اكتب إجابتك هنا..."
                                style={{
                                  width: '100%', minHeight: '120px', padding: '15px', borderRadius: '15px',
                                  border: '2px solid #cbd5e1', fontSize: '1.2rem', fontFamily: 'inherit',
                                  resize: 'vertical', outline: 'none', background: showEssayCorrection ? '#f1f5f9' : '#fff'
                                }}
                              />
                              
                              {!showEssayCorrection ? (
                                <button
                                  onClick={() => setShowEssayCorrection(true)}
                                  disabled={!essayAnswer.trim()}
                                  style={{
                                    padding: '12px 24px', background: essayAnswer.trim() ? '#059669' : '#94a3b8',
                                    color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.2rem',
                                    fontWeight: 'bold', cursor: essayAnswer.trim() ? 'pointer' : 'not-allowed',
                                    alignSelf: 'center'
                                  }}
                                >
                                  إظهار الإجابة الصحيحة
                                </button>
                              ) : (
                                <div style={{ animation: 'zoomIn 0.4s ease-out' }}>
                                  <div style={{
                                    background: '#d1fae5', border: '2px solid #10b981', borderRadius: '12px',
                                    padding: '15px', marginBottom: '15px'
                                  }}>
                                    <h4 style={{ color: '#065f46', margin: '0 0 8px 0', fontSize: '1.1rem' }}>الإجابة النموذجية:</h4>
                                    <p style={{ color: '#064e3b', margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{q.correct}</p>
                                  </div>
                                  
                                  <button
                                    onClick={() => {
                                      setShowEssayCorrection(false)
                                      setEssayAnswer('')
                                      if (currentQuizIndex < lessonData.data.quizzes.length - 1) {
                                        setCurrentQuizIndex(curr => curr + 1)
                                      } else {
                                        playSFX('success')
                                        setStage('review')
                                      }
                                    }}
                                    style={{
                                      padding: '12px 30px', background: '#3b82f6', color: 'white', border: 'none',
                                      borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
                                      width: '100%'
                                    }}
                                  >
                                    التالي
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}
            
                        
            {/* TYPE: LEARN */}
            {lessonData.type === 'learn' && (
              <div style={{ animation: 'zoomIn 0.5s ease-out', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--primary-dark, #064e3b)', fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', marginBottom: 'clamp(8px, 2vw, 14px)' }}>
                  {isArabic ? 'تعلم واقرأ الحرف 🌟' : 'Learn and Read 🌟'}
                </h2>
                
                {/* Repetition Instructions Banner */}
                <div style={{ background: 'rgba(5,150,105,0.07)', border: '1.5px solid rgba(5,150,105,0.2)', borderRadius: '16px', padding: '10px 16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', fontWeight: 700, width: '100%', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '1.3rem' }}>🔁</span>
                  <span>{isArabic ? 'تحدي تثبيت شكل الحرف: انقر على الحرف ٣ مرات وردده بصوت عالٍ لحفظ شكله وصوته!' : 'Tap the letter 3 times and say it out loud to memorize its shape and sound!'}</span>
                </div>

                {/* 3-Star Repetition Tracker */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginBottom: '10px',
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  padding: '6px 18px',
                  borderRadius: '50px'
                }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#475569' }}>
                    {isArabic ? 'تثبيت شكل الحرف بالذاكرة:' : 'Memory Shape Repeat:'}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3].map(step => (
                      <span
                        key={step}
                        style={{
                          fontSize: '1.35rem',
                          filter: learnRepeatCount >= step ? 'none' : 'grayscale(1) opacity(0.3)',
                          transform: learnRepeatCount === step ? 'scale(1.3)' : 'scale(1)',
                          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 900, color: learnRepeatCount >= 3 ? '#059669' : '#d97706' }}>
                    {Math.min(3, learnRepeatCount)} / 3
                  </span>
                </div>

                {/* Interactive Giant Letter */}
                <div
                  onClick={handleLearnRepeat}
                  title={isArabic ? 'اضغط لترديد الحرف وتثبيت شكله' : 'Tap to repeat letter'}
                  style={{
                    fontSize: 'clamp(5rem, 18vw, 9.5rem)',
                    color: 'var(--primary-dark, #064e3b)',
                    textShadow: '0 4px 0 rgba(5,150,105,0.25)',
                    margin: 'clamp(4px, 1.5vw, 12px) 0',
                    fontWeight: 900,
                    lineHeight: 1.1,
                    cursor: 'pointer',
                    userSelect: 'none',
                    animation: learnRepeatCount >= 3 ? 'none' : 'pulse 2s infinite',
                    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)' }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                  onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.92)' }}
                  onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                >
                  {lessonData.data.letter}
                </div>

                {/* Feedback prompt */}
                <p style={{
                  color: learnRepeatCount >= 3 ? '#059669' : '#d97706',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  margin: '0 0 16px 0',
                  animation: learnRepeatCount < 3 ? 'bounce 2s infinite' : 'none'
                }}>
                  {learnRepeatCount === 0 && (isArabic ? '👆 اضغط على الحرف لترديده وتثبيت شكله' : '👆 Tap the letter to hear and repeat its shape')}
                  {learnRepeatCount === 1 && (isArabic ? '🌟 ممتاز! ردد الحرف مرة ثانية (متبقي مرتين)' : '🌟 Great! Repeat it a second time (2 left)')}
                  {learnRepeatCount === 2 && (isArabic ? '🚀 رائع يا بطل! ردد للمرة الأخيرة ليحفظ عقلك شكله!' : '🚀 Amazing! Repeat one last time to master it!')}
                  {learnRepeatCount >= 3 && (isArabic ? '🎉 بطل حقيقي! تم تثبيت شكل وصوت الحرف بنجاح!' : '🎉 Champion! You mastered the letter shape and sound!')}
                </p>

                {/* Action Buttons: Repeat Sound & Smart Microphone */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  marginBottom: 'clamp(14px, 3.5vw, 22px)'
                }}>
                  <button
                    className="lesson-btn"
                    onClick={handleLearnRepeat}
                    style={{
                      padding: 'clamp(9px, 2.2vw, 13px) clamp(16px, 4vw, 24px)',
                      background: learnRepeatCount >= 3
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      borderRadius: '50px',
                      fontSize: 'clamp(0.88rem, 2.3vw, 1.05rem)',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    🔊 {isArabic ? `ردد واستمع (${Math.min(3, learnRepeatCount)}/3)` : `Listen & Repeat (${Math.min(3, learnRepeatCount)}/3)`}
                  </button>

                  <button
                    className="lesson-btn"
                    onClick={() => handleStartVoiceRecognition('learn')}
                    disabled={isListening}
                    style={{
                      padding: 'clamp(9px, 2.2vw, 13px) clamp(16px, 4vw, 24px)',
                      background: isListening
                        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                        : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      borderRadius: '50px',
                      fontSize: 'clamp(0.88rem, 2.3vw, 1.05rem)',
                      boxShadow: isListening ? '0 0 16px rgba(239, 68, 68, 0.6)' : '0 4px 14px rgba(37, 99, 235, 0.25)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      animation: isListening ? 'pulse 1s infinite' : 'none'
                    }}
                  >
                    🎙️ {isListening
                      ? (isArabic ? 'استمع إليك... انطق الآن!' : 'Listening... Speak!')
                      : (isArabic ? 'الميكروفون الذكي (تحدي النطق)' : 'Smart Mic (Voice Challenge)')}
                  </button>
                </div>

                {/* Speech Recognition Feedback Banner */}
                {speechFeedback && (
                  <div style={{
                    margin: '0 auto clamp(14px, 3vw, 22px) auto',
                    maxWidth: '420px',
                    padding: '10px 16px',
                    borderRadius: '16px',
                    fontSize: 'clamp(0.82rem, 2.2vw, 0.92rem)',
                    fontWeight: 700,
                    textAlign: 'center',
                    background: speechFeedback.type === 'success' ? '#d1fae5' : speechFeedback.type === 'listening' ? '#fef3c7' : '#fee2e2',
                    color: speechFeedback.type === 'success' ? '#065f46' : speechFeedback.type === 'listening' ? '#92400e' : '#991b1b',
                    border: `1.5px solid ${speechFeedback.type === 'success' ? '#10b981' : speechFeedback.type === 'listening' ? '#f59e0b' : '#f87171'}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}>
                    {speechFeedback.text}
                  </div>
                )}

                {/* Forms & Harakat */}
                {lessonData.data.forms && (
                  <div style={{ display: 'flex', gap: 'clamp(12px, 3vw, 20px)', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                    <div style={{ flex: 1, minWidth: 'min(100%, 220px)', background: 'rgba(5,150,105,0.05)', padding: 'clamp(14px, 3vw, 20px)', borderRadius: '16px', border: '1px solid rgba(5,150,105,0.12)', textAlign: 'center' }}>
                      <h3 style={{ color: 'var(--text-muted, #475569)', marginBottom: '12px', fontSize: 'clamp(0.85rem, 2vw, 1rem)', fontWeight: 700 }}>أشكال الحرف في الكلمة</h3>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', color: 'var(--primary-dark, #064e3b)', fontWeight: 900, flexWrap: 'wrap' }}>
                        {lessonData.data.forms.map((form, i) => (
                          <div key={i} style={{ background: 'white', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(5,150,105,0.15)', boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(5,150,105,0.07))' }}>{form}</div>
                        ))}
                      </div>
                    </div>
                    {lessonData.data.harakat && (
                      <div style={{ flex: 1, minWidth: 'min(100%, 220px)', background: 'rgba(5,150,105,0.05)', padding: 'clamp(14px, 3vw, 20px)', borderRadius: '16px', border: '1px solid rgba(5,150,105,0.12)', textAlign: 'center' }}>
                        <h3 style={{ color: 'var(--text-muted, #475569)', marginBottom: '12px', fontSize: 'clamp(0.85rem, 2vw, 1rem)', fontWeight: 700 }}>الحركات القصيرة (اضغط للاستماع)</h3>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          {lessonData.data.harakat.map((hObj, i) => (
                            <button key={i} className="lesson-btn" onClick={() => playVoice(hObj.s)} style={{ background: 'white', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(5,150,105,0.15)', boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(5,150,105,0.07))', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: 'var(--primary-color, #059669)', fontWeight: 900 }}>{hObj.h}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div style={{ marginTop: 'clamp(20px, 4vw, 32px)', width: '100%', textAlign: 'center' }}>
                  <button
                    className="lesson-btn"
                    onClick={learnRepeatCount >= 3 ? handleComplete : handleLearnRepeat}
                    style={{
                      padding: 'clamp(12px, 3vw, 16px) clamp(32px, 8vw, 56px)',
                      background: learnRepeatCount >= 3
                        ? 'var(--primary-gradient, linear-gradient(135deg, #059669, #0d9488))'
                        : 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      borderRadius: '50px',
                      fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                      boxShadow: learnRepeatCount >= 3 ? '0 8px 20px rgba(5,150,105,0.3)' : '0 6px 16px rgba(245, 158, 11, 0.3)',
                      maxWidth: '320px',
                      width: '100%',
                      cursor: 'pointer'
                    }}
                  >
                    {learnRepeatCount >= 3
                      ? (isArabic ? 'أحسنت! التالي ➡️' : 'Great! Next ➡️')
                      : (isArabic ? `ردد الحرف أولاً (${3 - learnRepeatCount} متبقية) 🔁` : `Repeat letter first (${3 - learnRepeatCount} left) 🔁`)}
                  </button>
                </div>
              </div>
            )}

            {/* TYPE: WRITE */}
            {lessonData.type === 'write' && (
              <div style={{ animation: 'zoomIn 0.5s ease-out' }}>
                <h2 style={{ color: 'var(--primary-dark, #064e3b)', fontSize: 'clamp(1.3rem, 4vw, 2rem)', marginBottom: 'clamp(8px, 2vw, 14px)', textAlign: 'center' }}>
                  {isArabic ? 'تتبع وكتابة الحرف ✍️' : 'Trace the letter ✍️'}
                </h2>
                
                {/* 3-Round Tracing Progress Tracker */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  padding: '8px 20px',
                  borderRadius: '50px'
                }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#334155' }}>
                    {isArabic ? 'تكرار رسم الحرف (تثبيت حركة اليد):' : 'Tracing Repetition (Hand Muscle Memory):'}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3].map(round => (
                      <span
                        key={round}
                        style={{
                          fontSize: '1.45rem',
                          filter: traceRound > round || (traceRound === round && canDone) ? 'none' : 'grayscale(1) opacity(0.3)',
                          transform: traceRound === round ? 'scale(1.25)' : 'scale(1)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {round === 1 ? '🥉' : round === 2 ? '🥈' : '🥇'}
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#059669' }}>
                    {isArabic ? `المحاولة ${traceRound} من ٣` : `Attempt ${traceRound} of 3`}
                  </span>
                </div>

                {/* Instructions Banner */}
                <div style={{ background: 'rgba(5,150,105,0.07)', border: '1.5px solid rgba(5,150,105,0.2)', borderRadius: '16px', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#065f46', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', fontWeight: 700 }}>
                  <span style={{ fontSize: '1.3rem' }}>✏️</span>
                  <span>
                    {traceRound === 1 && (isArabic ? 'المحاولة الأولى: تتبع رسم الحرف بدقة فوق النموذج الرمادي.' : 'Attempt 1: Trace the letter carefully along the guide.')}
                    {traceRound === 2 && (isArabic ? 'المحاولة الثانية: كرر رسم الحرف مرة ثانية لتثبيت حركته في يدك.' : 'Attempt 2: Trace again to reinforce your hand movement.')}
                    {traceRound === 3 && (isArabic ? 'المحاولة الثالثة: ارسم الحرف بثقة لتوثيق إتقانك الكامل لشكله!' : 'Attempt 3: Draw the letter confidently to master its shape!')}
                  </span>
                </div>

                {/* Drawing Tools */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginBottom: 'clamp(14px, 3vw, 20px)', background: 'rgba(5,150,105,0.04)', padding: 'clamp(12px, 3vw, 18px)', borderRadius: '16px', border: '1px solid rgba(5,150,105,0.1)' }}>
                  <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px'}}>
                    {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#0f172a'].map(c => (
                      <button 
                        key={c}
                        onClick={() => setBrushColor(c)}
                        style={{
                          width: '36px', height: '36px', borderRadius: '50%', background: c, border: brushColor === c ? '3px solid #cbd5e1' : '2px solid transparent',
                          cursor: 'pointer', transform: brushColor === c ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.2s', boxShadow: '0 3px 6px rgba(0,0,0,0.1)'
                        }}
                      />
                    ))}
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '280px'}}>
                    <span style={{fontSize: '1.3rem'}}>🖌️</span>
                    <input 
                      type="range" min="8" max="28" value={brushSize} 
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      style={{flex: 1, accentColor: brushColor, cursor: 'pointer'}}
                    />
                    <div style={{width: `${brushSize}px`, height: `${brushSize}px`, borderRadius: '50%', background: brushColor, border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}></div>
                  </div>
                </div>

                <div style={{display: 'flex', justifyContent: 'center', marginBottom: '20px', width: '100%'}}>
                  <canvas
                    ref={initCanvas}
                    width={300}
                    height={300}
                    style={{
                      border: '3px dashed rgba(5,150,105,0.3)',
                      borderRadius: '20px',
                      cursor: 'crosshair',
                      background: 'white',
                      touchAction: 'none',
                      width: '100%',
                      maxWidth: '280px',
                      height: 'auto',
                      aspectRatio: '1 / 1',
                      display: 'block',
                      margin: '0 auto',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.05)'
                    }}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                  />
                </div>
                {/* Prompt if student hasn't drawn yet */}
                {!canDone && (
                  <p style={{textAlign: 'center', color: '#f59e0b', fontWeight: 'bold', fontSize: '0.98rem', marginBottom: '12px', animation: 'pulse 2s infinite'}}>
                    ✏️ ارسم الحرف أولاً فوق المثال لتأكيد المحاولة ({traceRound}/3)
                  </p>
                )}
                <div style={{display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', width: '100%'}}>
                  <button
                    className="lesson-btn"
                    onClick={() => {
                      if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d')
                        ctx.clearRect(0, 0, 300, 300)
                        ctx.font = 'bold 180px Tajawal, Arial'
                        ctx.fillStyle = traceRound === 1 ? '#94a3b8' : (traceRound === 2 ? '#cbd5e1' : '#e2e8f0')
                        ctx.textAlign = 'center'
                        ctx.textBaseline = 'middle'
                        ctx.fillText(lessonData.data.letter, 150, 165)
                        hasDrawnOnCanvas.current = false
                        setCanDone(false)
                      }
                    }}
                    style={{ padding: 'clamp(10px, 2.5vw, 14px) clamp(16px, 4vw, 24px)', background: 'rgba(5,150,105,0.08)', color: 'var(--primary-dark, #064e3b)', borderRadius: '50px', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', border: '1.5px solid rgba(5,150,105,0.2)', flex: 1, minWidth: '120px', maxWidth: '170px' }}
                  >
                    {isArabic ? 'مسح وإعادة 🧹' : 'Clear & Retry'}
                  </button>
                  <button
                    className="lesson-btn"
                    onClick={canDone ? handleNextTraceRound : undefined}
                    style={{
                      padding: 'clamp(12px, 3vw, 16px) clamp(20px, 5vw, 32px)',
                      background: canDone 
                        ? (traceRound < 3 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'var(--primary-gradient, linear-gradient(135deg, #059669, #0d9488))') 
                        : 'rgba(148,163,184,0.3)',
                      color: canDone ? 'white' : '#94a3b8',
                      borderRadius: '50px',
                      fontSize: 'clamp(0.95rem, 3vw, 1.2rem)',
                      boxShadow: canDone ? '0 8px 20px rgba(5,150,105,0.3)' : 'none',
                      cursor: canDone ? 'pointer' : 'not-allowed',
                      flex: 1, minWidth: '160px', maxWidth: '240px',
                      opacity: canDone ? 1 : 0.6
                    }}
                  >
                    {traceRound < 3
                      ? (isArabic ? `تمت المحاولة (${traceRound}/3) 🌟 التالي` : `Attempt (${traceRound}/3) 🌟 Next`)
                      : (isArabic ? 'اعتماد إتقان شكل الحرف ✅' : 'Mastered & Done ✅')}
                  </button>
                </div>
              </div>
            )}

            {/* TYPE: QUIZ SOUND & WORD */}
            {(lessonData.type === 'quiz_sound' || lessonData.type === 'quiz_word') && (
              <div style={{ animation: 'zoomIn 0.5s ease-out', textAlign: 'center' }}>
                {/* Arabic Instructions Banner */}
                <div style={{ background: 'rgba(5,150,105,0.07)', border: '1.5px solid rgba(5,150,105,0.2)', borderRadius: '16px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#065f46', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', fontWeight: 700, textAlign: 'right' }}>
                  <span style={{ fontSize: '1.3rem' }}>🎧</span>
                  <span>تعليمات: اضغط على زر مكبر الصوت 🔊 للاستماع، ثم اختر الإجابة الصحيحة من الخيارات بالأسفل.</span>
                </div>
                
                {isTeacher && (
                  <div style={{ background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '12px', padding: '10px', marginBottom: '20px', color: '#92400e', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    👁️ نسخة المعلم: الكلمة المطلوبة هي «{lessonData.data.correctWord || lessonData.data.correct}»
                  </div>
                )}

                <h2 style={{ color: 'var(--primary-dark, #064e3b)', fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', marginBottom: 'clamp(16px, 4vw, 24px)' }}>{lessonData.data.questionText}</h2>
                
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginBottom: 'clamp(18px, 4vw, 32px)', flexWrap: 'wrap' }}>
                  <button
                    className="lesson-btn"
                    onClick={() => playVoice(lessonData.data.soundToPlay)}
                    title="اضغط للاستماع للصوت"
                    style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.2rem)', background: 'var(--primary-gradient, linear-gradient(135deg, #059669, #0d9488))', color: 'white', borderRadius: '50%', width: 'clamp(64px, 14vw, 84px)', height: 'clamp(64px, 14vw, 84px)', boxShadow: '0 8px 20px rgba(5,150,105,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    🔊
                  </button>

                  <button
                    className="lesson-btn"
                    onClick={() => handleStartVoiceRecognition('quiz_sound')}
                    disabled={isListening}
                    title="انطق الإجابة بالميكروفون"
                    style={{
                      padding: '12px 22px',
                      background: isListening ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white',
                      borderRadius: '50px',
                      fontSize: 'clamp(0.85rem, 2.3vw, 1rem)',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: isListening ? '0 0 16px rgba(239, 68, 68, 0.6)' : '0 6px 18px rgba(37, 99, 235, 0.25)',
                      animation: isListening ? 'pulse 1s infinite' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <span>🎙️</span>
                    <span>{isListening ? (isArabic ? 'استمع إليك... انطق الآن!' : 'Listening... Speak!') : (isArabic ? 'انطق الإجابة بالمايك' : 'Speak with Mic')}</span>
                  </button>
                </div>

                {speechFeedback && (
                  <div style={{
                    margin: '0 auto 20px auto',
                    maxWidth: '420px',
                    padding: '10px 16px',
                    borderRadius: '16px',
                    fontSize: 'clamp(0.82rem, 2.2vw, 0.92rem)',
                    fontWeight: 700,
                    textAlign: 'center',
                    background: speechFeedback.type === 'success' ? '#d1fae5' : speechFeedback.type === 'listening' ? '#fef3c7' : '#fee2e2',
                    color: speechFeedback.type === 'success' ? '#065f46' : speechFeedback.type === 'listening' ? '#92400e' : '#991b1b',
                    border: `1.5px solid ${speechFeedback.type === 'success' ? '#10b981' : speechFeedback.type === 'listening' ? '#f59e0b' : '#f87171'}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}>
                    {speechFeedback.text}
                  </div>
                )}
                
                {lessonData.data.correctImg && (
                  <div style={{fontSize: 'clamp(4rem, 15vw, 6rem)', marginBottom: '30px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))'}}>{lessonData.data.correctImg}</div>
                )}

                {hintActive && (
                  <div style={{background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '15px', padding: '12px 20px', marginBottom: '20px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold', color: '#92400e', animation: 'zoomIn 0.3s'}}>
                    💡 تلميح: الإجابة الصحيحة مضاءة باللون الأخضر
                  </div>
                )}
                <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px'}}>
                  {options.map((opt, i) => {
                    const isAnimating = animatingOption === opt
                    const isCorrectHint = hintActive && (opt === lessonData.data.correct || opt === lessonData.data.correctWord)
                    let bgColor = isCorrectHint ? '#d1fae5' : '#f8fafc'
                    let borderColor = isCorrectHint ? '#10b981' : '#e2e8f0'
                    let shadowColor = isCorrectHint ? '#059669' : '#cbd5e1'
                    let color = isCorrectHint ? '#065f46' : '#334155'
                    
                    if (isAnimating) {
                      if (animType === 'success') {
                        bgColor = '#22c55e'; borderColor = '#16a34a'; shadowColor = '#15803d'; color = 'white'
                      } else {
                        bgColor = '#ef4444'; borderColor = '#dc2626'; shadowColor = '#991b1b'; color = 'white'
                      }
                    }

                    return (
                      <button 
                        key={i}
                        className="quiz-btn"
                        onClick={() => handleOptionClick(opt)}
                        style={{
                          '--shadow-color': shadowColor,
                          padding: '15px 30px', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: 'bold',
                          background: bgColor, border: `3px solid ${borderColor}`,
                          borderRadius: '20px', cursor: 'pointer', color,
                          boxShadow: isAnimating && animType === 'success' ? `0 4px 0 ${shadowColor}` : `0 8px 0 ${shadowColor}`,
                          transform: isAnimating && animType === 'success' ? 'scale(1.1) translateY(4px)' : 'scale(1)',
                          animation: isAnimating && animType === 'shake' ? 'shake 0.4s ease-in-out' : 'none',
                        }}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* TYPE: BLENDING */}
            {lessonData.type === 'blending' && (() => {
              const blendItems = lessonData.data.letters || (lessonData.data.parts || []).map(p => typeof p === 'string' ? { isolated: p, sound: p } : p)
              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.5s', textAlign: 'center' }}>
                  {/* Arabic/English Instructions Banner */}
                  <div style={{ background: 'rgba(5,150,105,0.07)', border: '1.5px solid rgba(5,150,105,0.2)', borderRadius: '16px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#065f46', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', fontWeight: 700, width: '100%', boxSizing: 'border-box' }}>
                    <span style={{ fontSize: '1.3rem' }}>🪄</span>
                    <span>{isArabic ? 'تعليمات: اضغط على كل حرف لسماع صوته، ثم انقر على زر «ادمج 🪄» لتكوين الكلمة ونطقها.' : 'Tap each letter to hear its sound, then tap "Blend 🪄" to read the word!'}</span>
                  </div>

                  <h2 style={{ color: 'var(--primary-dark, #064e3b)', fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', marginBottom: 'clamp(20px, 5vw, 40px)' }}>{lessonData.data.title || (isArabic ? 'استمع للحروف ثم ادمجها لتكوين الكلمة' : 'Listen and blend the sounds')}</h2>
                  <div style={{ display: 'flex', gap: 'clamp(10px, 3vw, 20px)', marginBottom: 'clamp(28px, 6vw, 50px)', direction: isArabic ? 'rtl' : 'ltr', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {blendItems.map((l, i) => (
                      <div
                        key={i}
                        className="lesson-btn"
                        onClick={() => playVoice(l.sound || l.isolated)}
                        style={{
                          background: 'rgba(5,150,105,0.06)', border: '2px solid rgba(5,150,105,0.2)', borderRadius: '16px',
                          padding: 'clamp(12px, 3vw, 20px) clamp(16px, 4vw, 28px)', fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                          fontWeight: 900, color: 'var(--primary-dark, #064e3b)',
                          boxShadow: 'var(--shadow-md, 0 10px 25px rgba(5,150,105,0.1))',
                          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: storyStage === 'blended' ? 'scale(0)' : 'scale(1)',
                          opacity: storyStage === 'blended' ? 0 : 1,
                          cursor: 'pointer'
                        }}
                      >{l.isolated}</div>
                    ))}
                  </div>
                  {storyStage !== 'blended' ? (
                    <button className="lesson-btn" onClick={() => { setStoryStage('blended'); playVoice(lessonData.data.word) }} style={{ padding: 'clamp(12px, 3vw, 18px) clamp(32px, 8vw, 60px)', background: 'var(--primary-gradient, linear-gradient(135deg, #059669, #0d9488))', color: 'white', borderRadius: '50px', fontSize: 'clamp(1.3rem, 4vw, 2rem)', boxShadow: '0 8px 20px rgba(5,150,105,0.3)' }}>{isArabic ? 'ادمج 🪄' : 'Blend 🪄'}</button>
                  ) : (
                    <div style={{ textAlign: 'center', animation: 'zoomIn 0.5s', width: '100%' }}>
                      <div style={{ fontSize: 'clamp(4rem, 15vw, 8rem)', color: 'var(--primary-color, #059669)', fontWeight: 900, marginBottom: 'clamp(20px, 5vw, 40px)', textShadow: '0 4px 0 rgba(5,150,105,0.3)', background: 'rgba(5,150,105,0.06)', border: '2px dashed rgba(5,150,105,0.3)', borderRadius: '24px', padding: 'clamp(12px, 3vw, 20px)' }}>{lessonData.data.word}</div>
                      <button className="lesson-btn" onClick={handleComplete} style={{ padding: 'clamp(12px, 3vw, 16px) clamp(32px, 8vw, 56px)', background: 'var(--primary-gradient, linear-gradient(135deg, #059669, #0d9488))', color: 'white', borderRadius: '50px', fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)', boxShadow: '0 8px 20px rgba(5,150,105,0.3)' }}>{isArabic ? 'التالي ➡️' : 'Next ➡️'}</button>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* TYPE: REVIEW OR QUIZ */}
            {(lessonData.type === 'review' || lessonData.type === 'quiz') && (
              <div style={{ animation: 'zoomIn 0.5s ease-out' }}>
                {/* Arabic Instructions Banner */}
                <div style={{ background: 'rgba(5,150,105,0.07)', border: '1.5px solid rgba(5,150,105,0.2)', borderRadius: '16px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#065f46', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', fontWeight: 700 }}>
                  <span style={{ fontSize: '1.3rem' }}>🏆</span>
                  <span>تعليمات: أجب عن أسئلة المراجعة الشاملة لتثبيت مهارات الوحدة واجتياز التحدي!</span>
                </div>
                <div style={{ textAlign: 'center', marginBottom: 'clamp(10px, 2.5vw, 20px)', color: 'var(--text-muted, #475569)', fontWeight: 700, fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>السؤال {currentQuizIndex + 1} من {lessonData.data.quizzes.length}</div>
                <h2 style={{ color: 'var(--primary-color, #059669)', fontSize: 'clamp(1.3rem, 4vw, 2rem)', marginBottom: '10px', textAlign: 'center' }}>{lessonData.title} 🏆</h2>
                <h3 style={{ color: 'var(--primary-dark, #064e3b)', fontSize: 'clamp(1.1rem, 3.5vw, 1.8rem)', marginBottom: 'clamp(20px, 5vw, 40px)', textAlign: 'center', lineHeight: 1.5 }}>{lessonData.data.quizzes[currentQuizIndex].q}</h3>
                
                <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px'}}>
                  {options.map((opt, i) => {
                    const isAnimating = animatingOption === opt
                    let bgColor = '#f8fafc'
                    let borderColor = '#e2e8f0'
                    let shadowColor = '#cbd5e1'
                    let color = '#334155'
                    
                    if (isAnimating) {
                      if (animType === 'success') {
                        bgColor = '#22c55e'
                        borderColor = '#16a34a'
                        shadowColor = '#15803d'
                        color = 'white'
                      } else {
                        bgColor = '#ef4444'
                        borderColor = '#dc2626'
                        shadowColor = '#991b1b'
                        color = 'white'
                      }
                    }

                    return (
                      <button
                        key={i}
                        className="quiz-btn"
                        onClick={() => handleOptionClick(opt)}
                        style={{
                          padding: 'clamp(12px, 3vw, 16px) clamp(20px, 5vw, 32px)',
                          fontSize: 'clamp(1.1rem, 3.5vw, 1.8rem)',
                          fontWeight: 800,
                          background: bgColor,
                          border: `2px solid ${borderColor}`,
                          borderRadius: '16px',
                          cursor: 'pointer',
                          color,
                          boxShadow: `0 6px 0 ${shadowColor}`,
                          transform: isAnimating && animType === 'success' ? 'scale(1.05) translateY(3px)' : 'scale(1)',
                          animation: isAnimating && animType === 'shake' ? 'shake 0.4s ease-in-out' : 'none',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          fontFamily: 'Tajawal, Cairo, sans-serif',
                        }}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            {/* TYPE: BALLOON */}
            {lessonData.type === 'balloon' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', animation: 'zoomIn 0.5s ease-out' }}>
                <div style={{ background: 'rgba(5,150,105,0.07)', border: '1.5px solid rgba(5,150,105,0.2)', borderRadius: '16px', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', fontWeight: 700, width: '100%', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '1.3rem' }}>🎈</span>
                  <span>تحدي البالونات: اضغط على البالون الذي يحمل الحرف الصحيح لفرقعته!</span>
                </div>
                <h2 style={{ color: 'var(--primary-dark, #064e3b)', fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', marginBottom: '8px' }}>
                  {lessonData.data.questionText || `فرقع بالون حرف (${lessonData.data.target})`}
                </h2>
                <button
                  className="lesson-btn"
                  onClick={() => playVoice(lessonData.data.sound || lessonData.data.target)}
                  style={{
                    background: 'var(--primary-gradient, linear-gradient(135deg, #059669, #10b981))',
                    color: 'white', padding: '8px 18px', borderRadius: '50px',
                    fontSize: '0.92rem', marginBottom: '22px', boxShadow: '0 4px 12px rgba(5,150,105,0.2)'
                  }}
                >
                  🔊 استمع للحرف المطلوب
                </button>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 85px), 1fr))',
                  gap: '14px', width: '100%', maxWidth: '420px', margin: '0 auto 20px auto'
                }}>
                  {(lessonData.data.options || []).map((item, idx) => {
                    const balloonColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
                    const color = balloonColors[idx % balloonColors.length]
                    const isTarget = item === lessonData.data.target
                    return (
                      <button
                        key={idx}
                        className="lesson-btn"
                        onClick={() => {
                          if (isTarget) {
                            playSFX('levelup')
                            handleComplete()
                          } else {
                            playSFX('buzz')
                            playVoice('حاول مرة أخرى يا بطل!')
                          }
                        }}
                        style={{
                          background: `radial-gradient(circle at 35% 35%, #fff 0%, ${color} 75%)`,
                          width: 'clamp(72px, 18vw, 92px)',
                          height: 'clamp(92px, 23vw, 120px)',
                          borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                          border: 'none',
                          color: 'white',
                          fontSize: 'clamp(1.6rem, 5vw, 2.3rem)',
                          fontWeight: 900,
                          boxShadow: `0 8px 18px ${color}55`,
                          cursor: 'pointer',
                          margin: '0 auto',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          animation: `floatIcon ${2.2 + (idx * 0.3)}s ease-in-out infinite`
                        }}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TYPE: TRAIN */}
            {lessonData.type === 'train' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', animation: 'zoomIn 0.5s ease-out' }}>
                <div style={{ background: 'rgba(5,150,105,0.07)', border: '1.5px solid rgba(5,150,105,0.2)', borderRadius: '16px', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', fontWeight: 700, width: '100%', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '1.3rem' }}>🚂</span>
                  <span>{isArabic ? 'قطار الكلمات: اختر العنصر الصحيح لملء عربة القطار الفارغة!' : 'Train Challenge: Choose the missing item to complete the train car!'}</span>
                </div>
                <h2 style={{ color: 'var(--primary-dark, #064e3b)', fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', marginBottom: '6px' }}>
                  {lessonData.data.title || (isArabic ? 'قطار الكلمات 🚂' : 'Word Train 🚂')}
                </h2>
                {lessonData.data.word && (
                  <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '20px' }}>
                    {isArabic ? 'العنصر المستهدف:' : 'Target:'} <strong style={{ color: '#059669', fontSize: '1.25rem' }}>{lessonData.data.word}</strong>
                  </p>
                )}

                {/* Train Engine & Carriages */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto',
                  maxWidth: '100%', padding: '14px 10px', background: 'rgba(5,150,105,0.04)',
                  borderRadius: '20px', border: '1.5px dashed rgba(5,150,105,0.2)', marginBottom: '22px',
                  scrollbarWidth: 'none', direction: isArabic ? 'rtl' : 'ltr'
                }}>
                  <div style={{ fontSize: 'clamp(2.4rem, 6vw, 3.4rem)', flexShrink: 0 }}>🚂</div>
                  {(lessonData.data.parts || []).map((part, pIdx) => (
                    <div
                      key={pIdx}
                      style={{
                        background: part === '' ? '#fef3c7' : 'white',
                        border: `2.5px solid ${part === '' ? '#f59e0b' : '#10b981'}`,
                        borderRadius: '14px',
                        width: 'clamp(46px, 12vw, 64px)',
                        height: 'clamp(52px, 14vw, 72px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'clamp(1.3rem, 4vw, 1.9rem)',
                        fontWeight: 900,
                        color: part === '' ? '#d97706' : '#064e3b',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                        flexShrink: 0
                      }}
                    >
                      {part === '' ? '؟' : part}
                    </div>
                  ))}
                </div>

                {/* Train Choices */}
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', width: '100%'
                }}>
                  {(lessonData.data.options || []).map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      className="lesson-btn"
                      onClick={() => {
                        const isMatch = opt === lessonData.data.correctPart || 
                                        opt === lessonData.data.target || 
                                        opt === lessonData.data.missing ||
                                        opt === lessonData.data.word
                        if (isMatch) {
                          playSFX('levelup')
                          handleComplete()
                        } else {
                          playSFX('buzz')
                          playVoice(isArabic ? 'حاول مرة ثانية!' : 'Try again, champion!')
                        }
                      }}
                      style={{
                        background: 'white',
                        border: '2.5px solid #059669',
                        borderRadius: '16px',
                        padding: '10px 20px',
                        fontSize: 'clamp(1.2rem, 4vw, 1.7rem)',
                        fontWeight: 800,
                        color: '#064e3b',
                        boxShadow: '0 4px 12px rgba(5,150,105,0.15)',
                        cursor: 'pointer'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TYPE: LESSON (HTML Content) */}
            {lessonData.type === 'lesson' && (
              <div style={{ animation: 'zoomIn 0.5s ease-out', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <style>{`
                  .lesson-content-html h3 {
                    color: var(--primary-dark, #064e3b);
                    font-size: clamp(1.2rem, 3.5vw, 1.6rem);
                    margin-bottom: 12px;
                    border-bottom: 2px solid rgba(5,150,105,0.1);
                    padding-bottom: 8px;
                    margin-top: 24px;
                  }
                  .lesson-content-html h3:first-child {
                    margin-top: 0;
                  }
                  .lesson-content-html p {
                    margin-bottom: 16px;
                  }
                `}</style>
                <div style={{ background: 'rgba(5,150,105,0.07)', border: '1.5px solid rgba(5,150,105,0.2)', borderRadius: '16px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#065f46', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', fontWeight: 700 }}>
                  <span style={{ fontSize: '1.3rem' }}>💡</span>
                  <span>تعليمات: اقرأ النص بعناية لتفهم المهارات والمفاهيم المقررة.</span>
                </div>
                <h2 style={{ color: 'var(--primary-color, #059669)', fontSize: 'clamp(1.3rem, 4vw, 2rem)', marginBottom: '20px', textAlign: 'center' }}>{lessonData.title}</h2>
                <div 
                  className="lesson-content-html"
                  style={{
                    background: 'rgba(5,150,105,0.04)',
                    padding: 'clamp(16px, 4vw, 28px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(5,150,105,0.1)',
                    fontSize: 'clamp(1.1rem, 3.2vw, 1.55rem)',
                    lineHeight: 2.1,
                    textAlign: 'justify',
                    color: 'var(--text-dark, #064e3b)'
                  }}
                  dangerouslySetInnerHTML={{ __html: lessonData.data.content }}
                />
                <div style={{ textAlign: 'center', marginTop: 'clamp(20px, 5vw, 32px)' }}>
                  <button className="lesson-btn" onClick={handleComplete} style={{ padding: 'clamp(12px, 3vw, 16px) clamp(28px, 7vw, 48px)', background: 'var(--primary-gradient, linear-gradient(135deg, #059669, #0d9488))', color: 'white', borderRadius: '50px', fontSize: 'clamp(1rem, 3vw, 1.3rem)', boxShadow: '0 8px 20px rgba(5,150,105,0.3)' }}>أنهيت القراءة 🏆</button>
                </div>
              </div>
            )}
            {/* TYPE: START */}
            {lessonData.type === 'start' && (
              <div style={{ textAlign: 'center', padding: 'clamp(20px, 5vw, 40px)' }}>
                <div style={{ fontSize: 'clamp(4rem, 15vw, 6rem)', marginBottom: 'clamp(12px, 3vw, 20px)', animation: 'bounce 2s infinite' }}>🚀</div>
                <h2 style={{ color: 'var(--primary-color, #059669)', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', marginBottom: '10px' }}>{lessonData.title}</h2>
                <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)', color: 'var(--text-muted, #475569)', marginBottom: 'clamp(20px, 5vw, 32px)' }}>{lessonData.desc}</p>
                <button className="lesson-btn" onClick={handleComplete} style={{ padding: 'clamp(12px, 3vw, 16px) clamp(28px, 7vw, 48px)', background: 'var(--primary-gradient, linear-gradient(135deg, #059669, #0d9488))', color: 'white', borderRadius: '50px', fontSize: 'clamp(1rem, 3vw, 1.3rem)', boxShadow: '0 8px 20px rgba(5,150,105,0.3)' }}>{isArabic ? 'ابدأ الآن 🚀' : 'Start Now 🚀'}</button>
              </div>
            )}
            
            {/* TYPE: FINISH */}
            {lessonData.type === 'finish' && (
              <div style={{ textAlign: 'center', padding: 'clamp(20px, 5vw, 40px)' }}>
                <div style={{ fontSize: 'clamp(4rem, 15vw, 6rem)', marginBottom: 'clamp(12px, 3vw, 20px)' }}>🏆</div>
                <h2 style={{ color: 'var(--primary-color, #059669)', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', marginBottom: '10px' }}>{lessonData.desc}</h2>
                <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)', color: 'var(--text-muted, #475569)', marginBottom: 'clamp(20px, 5vw, 32px)' }}>
                  {isArabic ? 'لقد أنهيت هذا المسار بنجاح واجتزت جميع محطاته بتفوق! 🎉' : 'You completed this pathway successfully! 🎉'}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    className="lesson-btn" 
                    onClick={() => setShowCert(true)} 
                    style={{ 
                      padding: 'clamp(12px, 3vw, 16px) clamp(24px, 5vw, 36px)', 
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                      color: 'white', borderRadius: '50px', fontSize: 'clamp(1rem, 3vw, 1.2rem)', 
                      boxShadow: '0 8px 20px rgba(217,119,6,0.35)', cursor: 'pointer' 
                    }}
                  >
                    📜 {isArabic ? 'عرض شهادة التميز' : 'View Certificate'}
                  </button>
                  <button 
                    className="lesson-btn" 
                    onClick={() => { if (!channel) router.push(`/kids-corner/pathway?subject=${subject}`); }} 
                    style={{ 
                      padding: 'clamp(12px, 3vw, 16px) clamp(24px, 5vw, 36px)', 
                      background: 'var(--primary-gradient, linear-gradient(135deg, #059669, #0d9488))', 
                      color: 'white', borderRadius: '50px', fontSize: 'clamp(1rem, 3vw, 1.2rem)', 
                      boxShadow: '0 8px 20px rgba(5,150,105,0.3)', cursor: 'pointer' 
                    }}
                  >
                    {isArabic ? 'العودة للخريطة 🗺️' : 'Back to Map 🗺️'}
                  </button>
                </div>
              </div>
            )}
            
          </div>
        )}

        {/* ── SUCCESS PANEL ── */}
        {stage === 'success' && (
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '2px solid rgba(5,150,105,0.3)',
            borderRadius: 'var(--radius-xl, 28px)',
            padding: 'clamp(28px, 7vw, 56px) clamp(20px, 5vw, 40px)',
            boxShadow: 'var(--shadow-lg, 0 20px 40px rgba(5,150,105,0.15))',
            animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 'clamp(3.5rem, 12vw, 5.5rem)', marginBottom: '8px', animation: 'bounce 2s infinite' }}>🌟</div>
            <h2 style={{ color: 'var(--primary-dark, #064e3b)', fontSize: 'clamp(1.8rem, 6vw, 3rem)', margin: '0 0 8px' }}>{isArabic ? 'عمل رائع!' : 'Great Job!'}</h2>
            <div style={{ color: 'var(--accent-gold, #fbbf24)', fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 'clamp(20px, 5vw, 36px)', animation: 'scaleUp 1s ease-out' }}>+20 {isArabic ? 'نقاط' : 'Points'} 🪙</div>
            <button className="lesson-btn" onClick={() => { if (!channel) router.push(`/kids-corner/pathway?subject=${subject}&focus=${nodeId + 1}`); else if(hasControl && !isTeacher) setStage('playing'); }} style={{ padding: 'clamp(12px, 3vw, 18px) clamp(32px, 8vw, 64px)', background: 'var(--primary-gradient, linear-gradient(135deg, #059669, #0d9488))', color: 'white', borderRadius: '50px', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', boxShadow: '0 8px 24px rgba(5,150,105,0.35)', maxWidth: '280px', width: '100%' }}>{isArabic ? 'استمرار →' : 'Continue →'}</button>
          </div>
        )}

        {/* ── FAIL PANEL ── */}
        {stage === 'fail' && (
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '2px solid rgba(239,68,68,0.25)',
            borderRadius: 'var(--radius-xl, 28px)',
            padding: 'clamp(28px, 7vw, 56px) clamp(20px, 5vw, 40px)',
            boxShadow: '0 20px 40px rgba(239,68,68,0.08)',
            animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 'clamp(3.5rem, 12vw, 5.5rem)', marginBottom: '12px' }}>💪</div>
            <h2 style={{ color: '#991b1b', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', margin: '0 0 10px' }}>{isArabic ? 'انتهت المحاولات!' : 'Out of lives!'}</h2>
            <p style={{ color: 'var(--text-muted, #475569)', marginBottom: 'clamp(20px, 5vw, 36px)', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>{isArabic ? 'حاول مرة أخرى، أنت قادر على ذلك!' : 'Try again, you can do it!'}</p>
            <button className="lesson-btn" onClick={() => { setHearts(3); setStage('playing') }} style={{ padding: 'clamp(12px, 3vw, 18px) clamp(32px, 8vw, 64px)', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', borderRadius: '50px', fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', boxShadow: '0 8px 20px rgba(239,68,68,0.3)', maxWidth: '280px', width: '100%' }}>{isArabic ? 'حاول مجدداً 🔄' : 'Try Again 🔄'}</button>
          </div>
        )}

      </div>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-15px) rotate(-5deg); }
          50% { transform: translateX(15px) rotate(5deg); }
          75% { transform: translateX(-15px) rotate(-5deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes beat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes slideDown {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* ── STUDENT CERTIFICATE MODAL ── */}
      <CertificateModal
        isOpen={showCert}
        onClose={() => setShowCert(false)}
        studentName={userMetadata?.full_name || userMetadata?.name || (isArabic ? 'بطل المنصة المتميز' : 'Platform Champion')}
        subjectTitle={isArabic ? (subject === 'arabic' ? 'تأسيس اللغة العربية' : 'منهج اللغة العربية') : subject.startsWith('math') ? 'تأسيس الحساب والأرقام' : 'English Alphabet & Phonics'}
        scoreOrXp={450}
        badgeName={isArabic ? 'فارس الحروف والكلمات 👑' : 'Master Champion 🌟'}
      />
    </div>
  )
}
