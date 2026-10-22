'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../utils/supabase'
import { buildStudentAIPrompt } from '../../utils/curriculumPrompts'
import { 
  Bot, Sparkles, Send, Copy, Check, RotateCcw, 
  Volume2, VolumeX, BookOpen, Lightbulb, Zap, AlertCircle
} from 'lucide-react'

const STAGE_NAMES = {
  foundation: 'مرحلة التأسيس ورياض الأطفال',
  primary_1: 'الصف الأول الابتدائي',
  primary_2: 'الصف الثاني الابتدائي',
  primary_3: 'الصف الثالث الابتدائي',
  primary_4: 'الصف الرابع الابتدائي',
  primary_5: 'الصف الخامس الابتدائي',
  primary_6: 'الصف السادس الابتدائي',
  prep_1: 'الصف الأول الإعدادي (المنهج الجديد)',
  prep_2: 'الصف الثاني الإعدادي (المنهج الجديد)',
  prep_3: 'الصف الثالث الإعدادي',
  sec_1: 'الصف الأول الثانوي',
  sec_2: 'الصف الثاني الثانوي',
  sec_3: 'الصف الثالث الثانوي'
}

const MODES = [
  { id: 'general', label: 'المعلم الشامل 🌟', desc: 'اسأل عن أي درس أو استفسار علمي' },
  { id: 'grammar', label: 'صائد الإعراب 🎯', desc: 'إعراب مفصل ونموذجي لأي جملة' },
  { id: 'lessons', label: 'شرح وتبسيط 📖', desc: 'شرح مبسط مع أمثلة للدروس والنصوص' },
  { id: 'qa', label: 'حل وتفسير الأسئلة 💡', desc: 'فهم سبب الإجابة الصحيحة خطوة بخطوة' },
  { id: 'quiz', label: 'اختبر فهمي 🧪', desc: 'أسئلة تفاعلية فورية لاختبار استيعابك' }
]

const STAGE_QUICK_SUGGESTIONS = {
  prep_1: {
    general: [
      'ما هي أهم مهارات ودروس الصف الأول الإعدادي (المنهج الجديد)؟',
      'كيف أنظم وقت مذاكرتي للغة العربية وأحفظ النصوص بسهولة؟',
      'لخص لي أهم مهارات وقواعد الفصل الدراسي الأول لـ 1ع'
    ],
    grammar: [
      'اشرح لي الفرق بين الفعل اللازم والفعل المتعدي مع أمثلة',
      'ما هي الأفعال التي تنصب مفعولين أصلهما المبتدأ والخبر (ظن وأخواتها)؟',
      'أعرب لي جملة: (ظننتُ النجاحَ قريباً بالاجتهاد)'
    ],
    lessons: [
      'اشرح لي درس (أسطورة مصرية - الشهيد أحمد منسي) وأهم أفكاره',
      'ما مظاهر الجمال والمعنى الإجمالي في نص (وجه الوطن) لفاروق جويدة؟',
      'لخص لي القيم والعبر المستفادة من درس (رحمة تداوي وعلم يضيء - ابن النفيس)'
    ],
    qa: [
      'كيف أصوغ إجابة نموذجية في استخراج الفعل المزيد وتحديد أحرف الزيادة؟',
      'علل: لماذا يعتبر الفعل (أعطى) متعدياً لمفعولين ليس أصلهما المبتدأ والخبر؟',
      'وضح سبب ضبط أواخر الكلمات والفرق بين الفعل الصحيح والمعتل'
    ],
    quiz: [
      'اختبرني بـ 3 أسئلة في الأفعال التي تنصب مفعولين (أولى إعدادي)',
      'اطرح علي سؤالاً في معاني ومفردات درس مصر مهد العلم',
      'اعطني لغزاً نحوياً ممتعاً في إعراب الضمائر المتصلة والمنفصلة'
    ]
  },
  prep_2: {
    general: [
      'ما هي موضوعات ودروس الصف الثاني الإعدادي (المنهج الجديد)؟',
      'كيف أنظم مراجعة النصوص والقواعد النحوية لـ 2ع بذكاء؟',
      'لخص لي أهم مهارات التعبير والبلاغة المقررة بالمنهج الجديد'
    ],
    grammar: [
      'اشرح لي الفرق بين المعرب والمبني من الأسماء والأفعال مع أمثلة',
      'كيف أحدد أركان أسلوب الشرط وأعرب فعل الشرط وجوابه؟',
      'أعرب لي جملة: (مَن يزرع خيراً يحصد خيراً)'
    ],
    lessons: [
      'لخص لي درس (سيدة المقاومة المصرية - آمنة دهشان) وأهم محطات بطولتها',
      'ما الدروس المستفادة من درس من صقور الوطنية (الشهيد محمد مبروك)؟',
      'وضح مظاهر الجمال في نص (مصر التي في خاطري) أو نص (الكد سبيل المعالي)'
    ],
    qa: [
      'علل: متى يُبنى الفعل المضارع على السكون ومتى يُبنى على الفتح؟',
      'كيف أستخرج اسم شرط وأعرب ما بعده بدقة في الامتحان؟',
      'ما الفرق بين أدوات الشرط الجازمة وغير الجازمة وإعراب ما بعد (لولا)؟'
    ],
    quiz: [
      'اختبرني بـ 3 أسئلة دقيقة في المعرب والمبني (تانية إعدادي)',
      'اطرح علي سؤالين في درس (العبور إلى المستقبل - حرب أكتوبر)',
      'لغز نحوي في علامات جزم الأفعال الخمسة في أسلوب الشرط'
    ]
  }
}

const QUICK_SUGGESTIONS = {
  general: [
    'اشرح لي كيف أنظم وقت مذاكرتي للغة العربية؟',
    'ما هي أفضل طريقة لحفظ وتثبيت النصوص الشعرية؟',
    'لخص لي أهم المهارات الأساسية لمرحلتي الدراسية'
  ],
  grammar: [
    'أعرب لي جملة: (العلمُ ينيرُ عقولَ الأجيالِ)',
    'ما الفرق بين الفاعل ونائب الفاعل مع أمثلة؟',
    'كيف أفرّق بسهولة بين النعت والحال في الجملة؟'
  ],
  lessons: [
    'اشرح لي درس اليوم بأسلوب مبسط جداً مع أمثلة واقعية',
    'ما هي الفكرة الرئيسة وأهم القيم المستفادة في هذا الدرس؟',
    'وضح لي مظاهر الجمال في التشبيهات والألفاظ'
  ],
  qa: [
    'عندي سؤال اختيار من متعدد ومش متأكد من الإجابة الصحيحة',
    'علل: لماذا رُفعت هذه الكلمة ولم تُنصب؟',
    'كيف أصيغ إجابة نموذجية كاملة في الامتحان؟'
  ],
  quiz: [
    'اختبرني بـ 3 أسئلة نحوية دقيقة لمرحلتي مع تصحيح إجاباتي',
    'اعطني لغزاً نحوياً ممتعاً لأختبر ذكائي',
    'اطرح علي سؤالاً في المعاني والمفردات'
  ]
}

export default function StudentAITutorTab({ student, onCreditsUpdated, onOpenRecharge }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeMode, setActiveMode] = useState('general')
  const [copiedId, setCopiedId] = useState(null)
  const [speakingId, setSpeakingId] = useState(null)
  const [insufficientCreditsError, setInsufficientCreditsError] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const textareaRef = useRef(null)

  const [selectedStage, setSelectedStage] = useState(student?.stage || 'prep_1')

  useEffect(() => {
    if (student?.stage) {
      setSelectedStage(student.stage)
    }
  }, [student?.stage])

  const stageLabel = STAGE_NAMES[selectedStage] || STAGE_NAMES.prep_1
  const currentCredits = student?.aiCredits ?? 20

  // Load chat history from localStorage
  useEffect(() => {
    if (!student?.id) return
    const storageKey = `junaidi_ai_tutor_${student.id}`
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          return
        }
      }
    } catch (e) {
      console.warn('Failed to load chat history:', e)
    }

    // Default welcome message
    const defaultWelcome = {
      id: 'welcome-msg',
      role: 'assistant',
      content: `أهلاً بك يا بطل **${student?.name?.split(' ')[0] || 'عزيزي الطالب'}**! 🌟\n\nأنا **معلمك الخصوصي الذكي** على منصة الجُنيدي، ومخصص لمرحلتك: **${stageLabel}** 🎓.\n\nيمكنني مساعدتك في:\n- 🎯 **إعراب أي جملة** خطوة بخطوة مع بيان علامات الإعراب.\n- 📖 **شرح وتبسيط الدروس** والقواعد والنصوص المقررة بمنهجك الجديد.\n- 💡 **حل وتفسير أي سؤال** يقف معك.\n- 🧪 **اختبار فهمك** بأسئلة وتحديات سريعة.\n\n⚡ **رصيدك الحالي:** **${currentCredits} كريديت** (الاستهلاك محسوب بالتوكن بدقة واقتصاد تام).\n\nما الذي تود أن نبدأ به اليوم؟ اكتب سؤالك أو اختر من المقترحات السريعة بالأسفل! 👇`,
      timestamp: new Date().toISOString()
    }
    setMessages([defaultWelcome])
  }, [student?.id, student?.name, stageLabel])

  // Save chat history
  useEffect(() => {
    if (!student?.id || messages.length === 0) return
    const storageKey = `junaidi_ai_tutor_${student.id}`
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-30))) // Keep last 30 messages
    } catch (e) {
      console.warn('Failed to save chat history:', e)
    }
  }, [messages, student?.id])

  // Scroll to bottom of internal chat container only (prevents parent page from jumping or rising)
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const timer = setTimeout(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
    }, 50)
    return () => clearTimeout(timer)
  }, [messages, loading])

  // Auto resize textarea
  const handleTextareaChange = (e) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px'
    }
  }

  const handleSendMessage = async (textToSend = null) => {
    const questionText = (textToSend || input).trim()
    if (!questionText || loading) return

    // Credits check (must have positive balance)
    if (currentCredits <= 0 && student?.role !== 'admin') {
      setInsufficientCreditsError(true)
      return
    }

    setInsufficientCreditsError(false)

    const userMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: questionText,
      mode: activeMode,
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('يجب تسجيل الدخول لاستخدام المعلم الذكي.')
      }

      // Build system prompt based on mode and stage using the high-density curriculum blueprint
      const systemPrompt = buildStudentAIPrompt({
        studentName: student?.name,
        stage: selectedStage,
        mode: activeMode,
        stageLabel
      })

      // Prepare conversation history for Gemini (ensure valid user-first sequence and alternate roles)
      const validTurns = updatedMessages
        .filter(m => !m.isError && m.id !== 'welcome-msg')
        .slice(-6);

      // Ensure the history slice starts with a user turn (Gemini requirement)
      let startIndex = validTurns.findIndex(m => m.role === 'user');
      if (startIndex === -1) startIndex = 0;
      const slicedTurns = validTurns.slice(startIndex);

      // Build alternating turns
      const recentHistory = [];
      for (const m of slicedTurns) {
        const geminiRole = m.role === 'assistant' ? 'model' : 'user';
        const msgText = typeof m.content === 'string' ? m.content : '';
        if (!msgText.trim()) continue;

        if (recentHistory.length === 0) {
          if (geminiRole === 'user') {
            recentHistory.push({ role: 'user', parts: [{ text: msgText }] });
          }
        } else {
          const prev = recentHistory[recentHistory.length - 1];
          if (prev.role !== geminiRole) {
            recentHistory.push({ role: geminiRole, parts: [{ text: msgText }] });
          } else if (geminiRole === 'user') {
            // Merge consecutive user messages
            prev.parts[0].text += '\n' + msgText;
          }
        }
      }

      // Fallback if empty: ensure at least the current question is sent as user
      if (recentHistory.length === 0) {
        recentHistory.push({ role: 'user', parts: [{ text: questionText }] });
      }

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          contents: recentHistory,
          systemInstruction: systemPrompt,
          cost: 1, // Fallback
          action: 'student_ai_chat',
          generationConfig: {
            temperature: 0.2, // Low temperature for high grammatical precision and strict curriculum adherence
            topP: 0.95,
                        thinkingConfig: {
              thinkingBudget: 0
            }
          }
        })
      })

      const data = await res.json().catch(() => null)

      if (res.status === 402 || data?.insufficient_credits) {
        setInsufficientCreditsError(true)
        if (data?.current_balance !== undefined && onCreditsUpdated) {
          onCreditsUpdated(data.current_balance)
        }
        throw new Error(data?.error?.message || 'رصيد الذكاء الاصطناعي غير كافٍ. يرجى الشحن للمتابعة.')
      }

      if (!res.ok) {
        throw new Error(data?.error?.message || 'حدث خطأ أثناء التواصل مع المعلم الذكي. يرجى المحاولة لاحقاً.')
      }

      const candidateParts = data?.candidates?.[0]?.content?.parts || []
      const nonThoughtParts = candidateParts.filter(p => typeof p.text === 'string' && !p.thought)
      const answerText = (nonThoughtParts.length > 0 ? nonThoughtParts : candidateParts)
        .map(p => p.text || '')
        .join('') || data?.candidates?.[0]?.content?.parts?.[0]?.text

      if (!answerText || !answerText.trim()) {
        throw new Error('لم يتم استلام إجابة صحيحة من الذكاء الاصطناعي.')
      }

      // Add AI response with token and credit metadata
      const aiMessage = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: answerText,
        isTruncated: !!data?.is_truncated,
        tokensUsed: data?.tokens_used,
        creditsDeducted: data?.credits_deducted,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])

      // Deduct credit in UI immediately
      if (data?.remaining_credits !== undefined && onCreditsUpdated) {
        onCreditsUpdated(data.remaining_credits)
      } else if (onCreditsUpdated) {
        onCreditsUpdated(Math.max(0, Number((currentCredits - 0.2).toFixed(2))))
      }

    } catch (err) {
      console.error('Student AI error:', err)
      const errorMsg = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        isError: true,
        content: `⚠️ **عذراً، حدث خطأ:**\n${err.message || 'تعذر الاتصال بالخدمة، يرجى المحاولة بعد قليل.'}`,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = () => {
    if (!confirm('هل تريد مسح المحادثة وبدء جلسة جديدة مع المعلم الذكي؟')) return
    if (student?.id) {
      try {
        localStorage.removeItem(`junaidi_ai_tutor_${student.id}`)
      } catch (e) {}
    }
    const freshWelcome = {
      id: 'fresh-' + Date.now(),
      role: 'assistant',
      content: `أهلاً بك مجدداً يا **${student?.name?.split(' ')[0] || 'بطل'}**! 🌟\n\nأنا جاهز تماماً لمساعدتك في أي سؤال أو درس جديد. تفضل بكتابة سؤالك!`,
      timestamp: new Date().toISOString()
    }
    setMessages([freshWelcome])
    setInsufficientCreditsError(false)
  }

  const handleStageChange = (newStage) => {
    setSelectedStage(newStage)
    const newStageName = STAGE_NAMES[newStage] || newStage
    const switchNotice = {
      id: 'switch-' + Date.now(),
      role: 'assistant',
      content: `🔄 **تم تحويل تخصص المعلم الذكي إلى:** **${newStageName}** 🎓\n\nأنا الآن على دراية تامة بكافة دروس وقواعد ونصوص هذا الصف بالتحديد بدون أي خلط. كيف نبدأ اليوم؟ تفضل بطرح سؤالك!`,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, switchNotice])
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const handleReadAloud = (text, id) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('ميزة القراءة الصوتية غير مدعومة في متصفحك.')
      return
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }

    window.speechSynthesis.cancel()
    // Clean text from markdown symbols and arrows before reading
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/#{1,6}\s*/g, '')
      .replace(/^[-*•+]\s+/gm, '')
      .replace(/`{1,3}/g, '')
      .replace(/\$\s*\\leftarrow\s*\$|\\leftarrow|←/gi, ' تؤدي إلى ')
      .replace(/\$\s*\\rightarrow\s*\$|\\rightarrow|→/gi, ' تؤدي إلى ')
      .replace(/\$\s*\\Rightarrow\s*\$|\\Rightarrow|⇒/gi, ' ينتج عنها ')
      .replace(/\$\s*\\Leftarrow\s*\$|\\Leftarrow|⇐/gi, ' ينتج عنها ')
      .replace(/\$/g, '')

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'ar-SA'
    utterance.rate = 0.95
    utterance.pitch = 1.0

    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)

    setSpeakingId(id)
    window.speechSynthesis.speak(utterance)
  }

  // Pre-process text to remove LaTeX arrow artifacts and replace with clean Unicode arrows
  const sanitizeFormatting = (str) => {
    if (!str || typeof str !== 'string') return ''
    return str
      .replace(/\$\s*\\leftarrow\s*\$/gi, ' ← ')
      .replace(/\\leftarrow/gi, ' ← ')
      .replace(/\$\s*\\rightarrow\s*\$/gi, ' → ')
      .replace(/\\rightarrow/gi, ' → ')
      .replace(/\$\s*\\Rightarrow\s*\$/gi, ' ⇒ ')
      .replace(/\\Rightarrow/gi, ' ⇒ ')
      .replace(/\$\s*\\Leftarrow\s*\$/gi, ' ⇐ ')
      .replace(/\\Leftarrow/gi, ' ⇐ ')
      .replace(/\$\s*\\leftrightarrow\s*\$/gi, ' ↔ ')
      .replace(/\\leftrightarrow/gi, ' ↔ ')
      .replace(/\\to\b/gi, ' → ')
      .replace(/\\times/gi, ' × ')
      .replace(/\\dots/gi, ' ... ')
      .replace(/\$\s*([←→⇒⇐↔])\s*\$/g, ' $1 ')
  }

  // Helper function to format rich markdown, tables, and clean educational content
  const renderFormattedContent = (content) => {
    const sanitized = sanitizeFormatting(content)
    const lines = sanitized.split('\n')
    const elements = []
    let i = 0

    while (i < lines.length) {
      const rawLine = lines[i]
      const trimmed = rawLine.trim()

      // 1. Markdown Table detection
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines = []
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim())
          i++
        }

        if (tableLines.length >= 2) {
          const parseRow = (rowStr) =>
            rowStr
              .slice(1, -1)
              .split('|')
              .map(c => c.trim())

          const headerCols = parseRow(tableLines[0])
          const isDelimiter = /^\|[\s\-:|]+\|$/.test(tableLines[1])
          const bodyStartIndex = isDelimiter ? 2 : 1
          const bodyRows = tableLines.slice(bodyStartIndex).map(parseRow)

          elements.push(
            <div key={`table-${i}`} style={{ overflowX: 'auto', margin: '14px 0', borderRadius: '12px', border: '1.5px solid #ddd6fe', boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.92rem', background: 'white' }}>
                <thead>
                  <tr style={{ background: '#f5f3ff', borderBottom: '2px solid #ddd6fe' }}>
                    {headerCols.map((th, thIdx) => (
                      <th key={thIdx} style={{ padding: '10px 14px', color: '#5b21b6', fontWeight: '900' }}>
                        {parseInlineMarkdown(th)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9', background: rIdx % 2 === 0 ? 'white' : '#faf5ff' }}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} style={{ padding: '9px 14px', color: '#1e293b' }}>
                          {parseInlineMarkdown(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
          continue
        }
      }

      // 2. Empty line
      if (!trimmed) {
        elements.push(<div key={`empty-${i}`} style={{ height: '8px' }} />)
        i++
        continue
      }

      // 3. Horizontal Dividers (--- or *** or ___)
      if (/^([-*_]){3,}$/.test(trimmed)) {
        elements.push(
          <hr key={`hr-${i}`} style={{ border: 'none', borderTop: '1.5px dashed #c4b5fd', margin: '16px 0' }} />
        )
        i++
        continue
      }

      // 4. Headers & Hashtags (# to ######) - catches all levels cleanly without displaying raw hashes
      const headingMatch = trimmed.match(/^(#{1,6})\s*(.+?)(?:\s+#+)?$/)
      if (headingMatch) {
        const level = headingMatch[1].length
        const headingText = parseInlineMarkdown(headingMatch[2])

        if (level === 1) {
          elements.push(
            <h2 key={`h1-${i}`} style={{ color: '#3b0764', margin: '16px 0 8px 0', fontSize: '1.25rem', fontWeight: '900', borderBottom: '2px solid #ede9fe', paddingBottom: '6px' }}>
              {headingText}
            </h2>
          )
        } else if (level === 2) {
          elements.push(
            <h3 key={`h2-${i}`} style={{ color: '#5b21b6', margin: '14px 0 8px 0', fontSize: '1.15rem', fontWeight: '900' }}>
              {headingText}
            </h3>
          )
        } else if (level === 3) {
          elements.push(
            <h4 key={`h3-${i}`} style={{ color: '#6d28d9', margin: '12px 0 6px 0', fontSize: '1.05rem', fontWeight: '900' }}>
              {headingText}
            </h4>
          )
        } else {
          // Level 4, 5, 6 (specifically solves `#### 1) الضمائر` and similar sub-subheadings)
          elements.push(
            <div key={`hsub-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0 4px 0' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }} />
              <span style={{ color: '#4c1d95', fontSize: '1rem', fontWeight: '800' }}>
                {headingText}
              </span>
            </div>
          )
        }
        i++
        continue
      }

      // 5. Bullet points (- or * or • or +)
      if (/^[-*•+]\s+/.test(trimmed)) {
        const text = trimmed.replace(/^[-*•+]\s+/, '')
        elements.push(
          <div key={`bullet-${i}`} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', margin: '4px 0', paddingRight: '6px' }}>
            <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>•</span>
            <span style={{ flex: 1 }}>{parseInlineMarkdown(text)}</span>
          </div>
        )
        i++
        continue
      }

      // 6. Numbered items (e.g. 1. or 1) or (1) or Arabic numerals ١. or ١) or letters أ) )
      const numMatch = trimmed.match(/^([0-9\u0660-\u0669]+|[أ-ي])[\.\)\-]\s+(.*)/) || trimmed.match(/^\(([0-9\u0660-\u0669]+|[أ-ي])\)\s+(.*)/)
      if (numMatch) {
        elements.push(
          <div key={`num-${i}`} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', margin: '5px 0', paddingRight: '4px' }}>
            <span style={{ background: '#ede9fe', color: '#6d28d9', minWidth: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>
              {numMatch[1]}
            </span>
            <span style={{ flex: 1 }}>{parseInlineMarkdown(numMatch[2])}</span>
          </div>
        )
        i++
        continue
      }

      // 7. Highlighted blockquote / notes
      if (trimmed.startsWith('>')) {
        elements.push(
          <div key={`quote-${i}`} style={{ margin: '8px 0', padding: '10px 14px', background: 'rgba(124, 58, 237, 0.08)', borderRight: '4px solid #7c3aed', borderRadius: '8px', fontSize: '0.92rem', color: '#4c1d95', fontStyle: 'italic' }}>
            {parseInlineMarkdown(trimmed.replace(/^>\s*/, ''))}
          </div>
        )
        i++
        continue
      }

      // 8. Standard paragraph
      elements.push(
        <p key={`p-${i}`} style={{ margin: '4px 0', lineHeight: '1.75' }}>
          {parseInlineMarkdown(rawLine)}
        </p>
      )
      i++
    }

    return elements
  }

  // Parse inline bold, italic, and code
  const parseInlineMarkdown = (text) => {
    if (!text || typeof text !== 'string') return text
    const parts = []
    let lastIdx = 0
    const regex = /(\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g
    let match

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.substring(lastIdx, match.index))
      }
      if (match[2]) {
        // Bold + Italic
        parts.push(
          <strong key={match.index} style={{ color: '#1e1b4b', fontWeight: '900', fontStyle: 'italic' }}>
            {match[2]}
          </strong>
        )
      } else if (match[3]) {
        // Bold
        parts.push(
          <strong key={match.index} style={{ color: '#1e1b4b', fontWeight: '800' }}>
            {match[3]}
          </strong>
        )
      } else if (match[4]) {
        // Italic
        parts.push(
          <em key={match.index} style={{ color: '#4c1d95', fontStyle: 'italic' }}>
            {match[4]}
          </em>
        )
      } else if (match[5]) {
        // Code
        parts.push(
          <code key={match.index} style={{ background: '#f3e8ff', color: '#6d28d9', padding: '2px 6px', borderRadius: '6px', fontSize: '0.9em', fontFamily: 'monospace' }}>
            {match[5]}
          </code>
        )
      }
      lastIdx = regex.lastIndex
    }

    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx))
    }

    return parts.length > 0 ? parts : text
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: '650px', background: 'white', borderRadius: '24px', boxShadow: '0 12px 35px rgba(0,0,0,0.06)', border: '1px solid #ede9fe', overflow: 'hidden', position: 'relative' }}>
      
      {/* Top Header */}
      <div style={{ padding: '16px 22px', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', borderBottom: '1.5px solid #ddd6fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 6px 15px rgba(124, 58, 237, 0.35)', position: 'relative' }}>
            <Bot size={26} />
            <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: '#10b981', border: '2px solid white', borderRadius: '50%' }}></span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#3b0764' }}>المعلم الخصوصي الذكي 🤖</h2>
              <span style={{ background: '#10b981', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>متصل الآن</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#6d28d9', marginTop: '4px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span>مخصص لـ:</span>
              <select
                value={selectedStage}
                onChange={(e) => handleStageChange(e.target.value)}
                style={{
                  background: 'white',
                  border: '1.5px solid #c4b5fd',
                  borderRadius: '8px',
                  color: '#4c1d95',
                  fontWeight: '800',
                  fontSize: '0.78rem',
                  padding: '2px 8px',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
                title="تغيير المرحلة الدراسية للمعلم الذكي"
              >
                {Object.entries(STAGE_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
              <span style={{ color: '#7c3aed' }}>• رفيقك الأذكى للتفوق</span>
            </div>
          </div>
        </div>

        {/* Credits Balance & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            background: currentCredits > 0 ? 'white' : '#fee2e2', 
            padding: '8px 14px', 
            borderRadius: '14px', 
            border: `1.5px solid ${currentCredits > 0 ? '#c4b5fd' : '#fca5a5'}`,
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <Zap size={18} color={currentCredits > 0 ? '#7c3aed' : '#dc2626'} fill={currentCredits > 0 ? '#7c3aed' : '#dc2626'} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 'bold' }}>رصيد الكريديتس</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '900', color: currentCredits > 0 ? '#5b21b6' : '#b91c1c' }}>
                {Number(currentCredits || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>⚡</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenRecharge}
            style={{
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: 'white',
              border: 'none',
              padding: '9px 14px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
              transition: 'all 0.2s'
            }}
          >
            <span>+ شحن رصيد</span>
          </button>

          <button
            onClick={handleClearHistory}
            title="بدء جلسة جديدة ومسح المحادثة"
            style={{
              background: 'white',
              border: '1px solid #cbd5e1',
              color: '#64748b',
              padding: '8px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Modes Bar */}
      <div style={{ padding: '10px 18px', background: '#faf5ff', borderBottom: '1px solid #ede9fe', display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {MODES.map(m => {
          const isSelected = activeMode === m.id
          return (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: isSelected ? '1.5px solid #7c3aed' : '1px solid #e9d5ff',
                background: isSelected ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'white',
                color: isSelected ? 'white' : '#6b21a8',
                fontWeight: isSelected ? '900' : '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isSelected ? '0 3px 10px rgba(124,58,237,0.25)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <span>{m.label}</span>
            </button>
          )
        })}
      </div>

      {/* Insufficient Credits Banner */}
      {insufficientCreditsError && (
        <div style={{ padding: '12px 20px', background: '#fef2f2', borderBottom: '1.5px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontSize: '0.88rem', fontWeight: 'bold' }}>
            <AlertCircle size={20} color="#dc2626" />
            <span>رصيدك من كريديتس الذكاء الاصطناعي نفد! يرجى شحن رصيدك للمتابعة مع المعلم الذكي.</span>
          </div>
          <button
            onClick={onOpenRecharge}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            شحن رصيد الآن 💳
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div 
        ref={messagesContainerRef}
        style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'radial-gradient(circle at 10% 20%, rgba(245, 243, 255, 0.5) 0%, rgba(255, 255, 255, 0.8) 90%)' }}
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user'
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                flexDirection: isUser ? 'row-reverse' : 'row',
                maxWidth: '85%',
                alignSelf: isUser ? 'flex-start' : 'flex-end',
                width: '100%'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: isUser ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1rem',
                flexShrink: 0,
                boxShadow: isUser ? '0 4px 10px rgba(16,185,129,0.3)' : '0 4px 10px rgba(124,58,237,0.3)'
              }}>
                {isUser ? (student?.name ? student.name.charAt(0) : 'ط') : <Bot size={20} />}
              </div>

              {/* Message Bubble */}
              <div style={{
                background: isUser 
                  ? 'linear-gradient(135deg, #059669, #047857)' 
                  : msg.isError ? '#fef2f2' : 'white',
                color: isUser ? 'white' : '#1e293b',
                padding: '16px 20px',
                borderRadius: isUser ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                boxShadow: isUser 
                  ? '0 6px 15px rgba(5,150,105,0.2)' 
                  : '0 4px 16px rgba(0,0,0,0.06)',
                border: isUser ? 'none' : msg.isError ? '1.5px solid #fecaca' : '1px solid #ede9fe',
                fontSize: '0.96rem',
                lineHeight: '1.7',
                position: 'relative',
                wordBreak: 'break-word',
                maxWidth: '100%'
              }}>
                {/* Mode Tag for User Message */}
                {isUser && msg.mode && msg.mode !== 'general' && (
                  <div style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginBottom: '6px', fontWeight: 'bold' }}>
                    {MODES.find(m => m.id === msg.mode)?.label}
                  </div>
                )}

                {/* Content */}
                <div>
                  {isUser ? msg.content : renderFormattedContent(msg.content)}
                </div>

                {/* زر إكمال الإجابة في حال وصول الحد الأقصى */}
                {!isUser && !msg.isError && msg.isTruncated && (
                  <div style={{ marginTop: '10px' }}>
                    <button
                      onClick={() => handleSendQuestion('أكمل الإجابة والشرح بالتفصيل من حيث توقفت ودون تكرار.')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '6px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      <span>تابع اكتمال الإجابة ➡️</span>
                    </button>
                  </div>
                )}

                {/* Action Buttons for AI message */}
                {!isUser && !msg.isError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', justifyContent: 'flex-start' }}>
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      title="نسخ الإجابة"
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        borderRadius: '8px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                    >
                      {copiedId === msg.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      <span>{copiedId === msg.id ? 'تم النسخ!' : 'نسخ'}</span>
                    </button>

                    <button
                      onClick={() => handleReadAloud(msg.content, msg.id)}
                      title="قراءة صوتية"
                      style={{
                        background: speakingId === msg.id ? '#ede9fe' : '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: speakingId === msg.id ? '#7c3aed' : '#64748b',
                        borderRadius: '8px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                    >
                      {speakingId === msg.id ? <VolumeX size={14} color="#7c3aed" /> : <Volume2 size={14} />}
                      <span>{speakingId === msg.id ? 'إيقاف' : 'استمع'}</span>
                    </button>

                    {/* Token & Credit consumption badge */}
                    {msg.tokensUsed !== undefined && msg.tokensUsed > 0 && (
                      <span 
                        title={`استهلاك السؤال: ${msg.tokensUsed} توكن = ${msg.creditsDeducted ?? (msg.tokensUsed / 1000).toFixed(2)} كريديت`}
                        style={{
                          fontSize: '0.72rem',
                          color: '#6d28d9',
                          background: '#f5f3ff',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          border: '1px solid #ddd6fe',
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Zap size={11} color="#7c3aed" fill="#7c3aed" />
                        <span>{msg.tokensUsed} توكن ({msg.creditsDeducted ?? (msg.tokensUsed / 1000).toFixed(2)} ⚡)</span>
                      </span>
                    )}

                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginRight: 'auto' }}>
                      {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Loading Spinner */}
        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', alignSelf: 'flex-end', maxWidth: '80%' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={20} />
            </div>
            <div style={{ background: 'white', padding: '14px 20px', borderRadius: '4px 20px 20px 20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #ede9fe', display: 'flex', alignItems: 'center', gap: '10px', color: '#6d28d9', fontWeight: 'bold', fontSize: '0.9rem' }}>
              <div style={{ width: '18px', height: '18px', border: '3px solid #ede9fe', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span>المعلم الذكي يفكّر ويكتب لك الإجابة النموذجية... 🤖✍️</span>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions Pills */}
      {(() => {
        const stageSuggestions = STAGE_QUICK_SUGGESTIONS[selectedStage]?.[activeMode] || QUICK_SUGGESTIONS[activeMode] || []
        if (!stageSuggestions || stageSuggestions.length === 0) return null
        const stageShortName = STAGE_NAMES[selectedStage]?.split(' ')[1] || 'المنهج'
        return (
          <div style={{ padding: '8px 18px', background: '#faf5ff', borderTop: '1px solid #ede9fe', display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <Sparkles size={14} /> مقترحات ({stageShortName}):
            </span>
            {stageSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(suggestion)}
              disabled={loading}
              style={{
                padding: '5px 12px',
                borderRadius: '16px',
                background: 'white',
                border: '1px dashed #c4b5fd',
                color: '#5b21b6',
                fontSize: '0.78rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#ede9fe'; e.currentTarget.style.borderColor = '#7c3aed'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#c4b5fd'; }}
            >
              {suggestion}
            </button>
          ))}
          </div>
        )
      })()}

      {/* Input Form */}
      <div style={{ padding: '14px 20px', background: 'white', borderTop: '1.5px solid #f1f5f9' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder={`اسأل المعلم الذكي عن أي قاعدة، إعراب، أو درس في ${stageLabel}... (اضغط Enter للإرسال)`}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '18px',
                border: '1.5px solid #cbd5e1',
                outline: 'none',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                lineHeight: '1.5',
                resize: 'none',
                minHeight: '48px',
                maxHeight: '140px',
                background: '#f8fafc',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7c3aed'
                e.target.style.background = 'white'
                e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.15)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1'
                e.target.style.background = '#f8fafc'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: loading || !input.trim() 
                ? '#e2e8f0' 
                : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: loading || !input.trim() ? '#94a3b8' : 'white',
              border: 'none',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: loading || !input.trim() ? 'none' : '0 6px 15px rgba(124, 58, 237, 0.35)',
              transition: 'all 0.2s'
            }}
          >
            <Send size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </form>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.74rem', color: '#64748b', padding: '0 4px' }}>
          <span>💡 كل سؤال يستهلك 1 كريديت فقط من رصيدك.</span>
          <span>Shift + Enter لسطر جديد</span>
        </div>
      </div>
    </div>
  )
}
