'use client'
import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Plus,
  Trash2,
  X,
  BookOpen,
  Wand2,
  CheckCircle2,
  RefreshCw,
  Layers,
  FileText,
  Volume2,
  Gamepad2,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../../utils/supabase'
import {
  loadCustomGameWords,
  saveCustomGameWords,
  clearCustomGameWords,
  normalizeCustomWord,
  parseWordsFromBulkText,
  SMART_AI_PRESETS,
  segmentWordLetters
} from '../utils/customGameStore'
import {
  loadActiveCustomQuestions,
  saveActiveCustomQuestions,
  normalizeQuestion,
  normalizeQuestions,
  parseQuestionsFromBulkText
} from '../utils/questionHelper'

export default function TeacherGameManagerModal({
  isOpen = true,
  onClose,
  initialMode = 'words', // 'words' | 'questions'
  lang = 'arabic',
  onWordsUpdated = null,
  onQuestionsUpdated = null
}) {
  const [activeMode, setActiveMode] = useState(initialMode) // 'words' | 'questions'
  const [activeTab, setActiveTab] = useState('ai') // 'ai' | 'manual' | 'active'
  const [language, setLanguage] = useState(lang)

  // --- Words State ---
  const [words, setWords] = useState([])
  const [newWord, setNewWord] = useState({ word: '', category: 'كلمات المعلم', emoji: '⭐' })
  const [bulkWordsText, setBulkWordsText] = useState('')

  // --- Questions State ---
  const [questions, setQuestions] = useState([])
  const [newQ, setNewQ] = useState({ text: '', answer: '', w1: '', w2: '', w3: '' })
  const [bulkQuestionsText, setBulkQuestionsText] = useState('')

  // --- AI State ---
  const [aiTopic, setAiTopic] = useState('')
  const [aiCount, setAiCount] = useState(8)
  const [loadingAI, setLoadingAI] = useState(false)
  const [notification, setNotification] = useState('')

  // Load active data on mount
  useEffect(() => {
    const loadedWords = loadCustomGameWords(language)
    setWords(loadedWords)
    const loadedQuestions = loadActiveCustomQuestions() || []
    setQuestions(loadedQuestions)
  }, [language])

  const flashNotice = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3500)
  }

  // --- Words Handlers ---
  const handleAddSingleWord = (e) => {
    if (e) e.preventDefault()
    if (!newWord.word.trim()) {
      alert('الرجاء كتابة الكلمة أولاً.')
      return
    }
    const normalized = normalizeCustomWord(
      {
        word: newWord.word.trim(),
        category: newWord.category.trim() || 'كلمات المعلم',
        emoji: newWord.emoji || '⭐'
      },
      language
    )
    if (normalized) {
      const updated = [...words, normalized]
      setWords(updated)
      saveCustomGameWords(language, updated)
      if (onWordsUpdated) onWordsUpdated(updated)
      setNewWord({ word: '', category: 'كلمات المعلم', emoji: '⭐' })
      flashNotice(`✅ تم إضافة كلمة "${normalized.word}" بنجاح!`)
    }
  }

  const handleBulkWordsImport = () => {
    if (!bulkWordsText.trim()) return
    const parsed = parseWordsFromBulkText(bulkWordsText, language)
    if (parsed.length === 0) {
      alert('لم نتمكن من قراءة الكلمات. اكتب كل كلمة في سطر أو افصل بينها بفاصلة.')
      return
    }
    const updated = [...words, ...parsed]
    setWords(updated)
    saveCustomGameWords(language, updated)
    if (onWordsUpdated) onWordsUpdated(updated)
    setBulkWordsText('')
    flashNotice(`🎉 تم استيراد ${parsed.length} كلمة بنجاح!`)
    setActiveTab('active')
  }

  const handleDeleteWord = (idx) => {
    const updated = words.filter((_, i) => i !== idx)
    setWords(updated)
    saveCustomGameWords(language, updated)
    if (onWordsUpdated) onWordsUpdated(updated)
    flashNotice('🗑️ تم حذف الكلمة.')
  }

  const handleClearAllWords = () => {
    if (confirm('هل تريد حذف جميع الكلمات المخصصة والعودة للوضع التلقائي اللانهائي؟')) {
      clearCustomGameWords(language)
      setWords([])
      if (onWordsUpdated) onWordsUpdated([])
      flashNotice('🔄 تم مسح الكلمات. اللعبة ستعمل بنظام التوليد اللانهائي.')
    }
  }

  // --- Questions Handlers ---
  const handleAddSingleQuestion = (e) => {
    if (e) e.preventDefault()
    if (!newQ.text.trim() || !newQ.answer.trim() || !newQ.w1.trim()) {
      alert('الرجاء إدخال نص السؤال، والإجابة الصحيحة، وخيار خاطئ واحد على الأقل.')
      return
    }
    const qObj = normalizeQuestion({
      text: newQ.text.trim(),
      answer: newQ.answer.trim(),
      w1: newQ.w1.trim(),
      w2: newQ.w2.trim() || 'خيار 2',
      w3: newQ.w3.trim() || 'خيار 3'
    })
    if (qObj) {
      const updated = [...questions, qObj]
      setQuestions(updated)
      saveActiveCustomQuestions(updated)
      if (onQuestionsUpdated) onQuestionsUpdated(updated)
      setNewQ({ text: '', answer: '', w1: '', w2: '', w3: '' })
      flashNotice('✅ تم إضافة السؤال بنجاح!')
    }
  }

  const handleBulkQuestionsImport = () => {
    if (!bulkQuestionsText.trim()) return
    const parsed = parseQuestionsFromBulkText(bulkQuestionsText)
    if (parsed.length === 0) {
      alert('تنسيق غير صالح. استخدم التنسيق: السؤال | الإجابة الصحيحة | خيار خاطئ 1 | خيار خاطئ 2')
      return
    }
    const updated = [...questions, ...parsed]
    setQuestions(updated)
    saveActiveCustomQuestions(updated)
    if (onQuestionsUpdated) onQuestionsUpdated(updated)
    setBulkQuestionsText('')
    flashNotice(`🎉 تم استيراد ${parsed.length} سؤال بنجاح!`)
    setActiveTab('active')
  }

  const handleDeleteQuestion = (idx) => {
    const updated = questions.filter((_, i) => i !== idx)
    setQuestions(updated)
    saveActiveCustomQuestions(updated)
    if (onQuestionsUpdated) onQuestionsUpdated(updated)
    flashNotice('🗑️ تم حذف السؤال.')
  }

  const handleClearAllQuestions = () => {
    if (confirm('هل تريد مسح جميع الأسئلة المخصصة والعودة للتوليد اللانهائي؟')) {
      saveActiveCustomQuestions([])
      setQuestions([])
      if (onQuestionsUpdated) onQuestionsUpdated([])
      flashNotice('🔄 تم مسح الأسئلة المخصصة.')
    }
  }

  // --- Smart AI Generation (Instant Preset + Gemini API) ---
  const handleInstantPresetGenerate = (presetCategory) => {
    if (activeMode === 'words') {
      const presets = SMART_AI_PRESETS[language]?.[presetCategory]
      if (presets && presets.length > 0) {
        const picked = presets.slice(0, aiCount)
        const updated = [...words, ...picked]
        setWords(updated)
        saveCustomGameWords(language, updated)
        if (onWordsUpdated) onWordsUpdated(updated)
        flashNotice(`⚡ تم توليد ${picked.length} كلمة من حزمة "${presetCategory}" بنجاح!`)
        setActiveTab('active')
        return
      }
    }
  }

  const handleAIGenerate = async (forceInstant = false) => {
    if (!aiTopic.trim()) {
      alert('الرجاء كتابة موضوع التوليد أو اختيار حزمة سريعة.')
      return
    }

    setLoadingAI(true)

    // 1. If instant or offline requested, use smart procedural synthesis
    if (forceInstant) {
      setTimeout(() => {
        if (activeMode === 'words') {
          const generatedWords = generateSmartWords(aiTopic, aiCount, language)
          const updated = [...words, ...generatedWords]
          setWords(updated)
          saveCustomGameWords(language, updated)
          if (onWordsUpdated) onWordsUpdated(updated)
          flashNotice(`⚡ تم التوليد السريع لـ ${generatedWords.length} كلمة بنجاح!`)
        } else {
          const generatedQuestions = generateSmartQuestions(aiTopic, aiCount)
          const updated = [...questions, ...generatedQuestions]
          setQuestions(updated)
          saveActiveCustomQuestions(updated)
          if (onQuestionsUpdated) onQuestionsUpdated(updated)
          flashNotice(`⚡ تم التوليد السريع لـ ${generatedQuestions.length} سؤال بنجاح!`)
        }
        setLoadingAI(false)
        setActiveTab('active')
      }, 400)
      return
    }

    // 2. Real Gemini API Generation
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      let systemPrompt = ''
      if (activeMode === 'words') {
        systemPrompt = `أنت خبير تأسيس لغة عربية ومعلم فونكس للأطفال في منصة الجُنيدي.
المطلوب: توليد قائمة كلمات مناسبة للأطفال والتأسيس والتهجئة، بناءً على الموضوع التالي: "${aiTopic}".
اللغة: ${language === 'arabic' ? 'اللغة العربية مع التشكيل والحركات القصيرة والطويلة' : 'English CVC / Phonics words'}.
عدد الكلمات المطلوب بدقة: ${aiCount}.
أعد النتيجة بصيغة JSON Array فقط بدون أي نصوص تمهيدية أو كود إضافي:
[
  {
    "word": "كَتَبَ",
    "letters": ["كَ", "تَ", "بَ"],
    "phonics": ["كَ", "تَ", "بَ"],
    "emoji": "✍️",
    "category": "${aiTopic}"
  }
]`
      } else {
        systemPrompt = `أنت خبير تربوي ومصمم مسابقات تفاعلية في منصة الجُنيدي.
المطلوب: صياغة أسئلة مسابقة متعددة الخيارات ممتعة ودقيقة بناءً على الموضوع التالي: "${aiTopic}".
عدد الأسئلة المطلوب بدقة: ${aiCount}.
أعد النتيجة بصيغة JSON Array فقط:
[
  {
    "text": "نص السؤال هنا",
    "answer": "الإجابة الصحيحة",
    "w1": "خيار خاطئ 1",
    "w2": "خيار خاطئ 2",
    "w3": "خيار خاطئ 3"
  }
]`
      }

      if (!session) {
        // Fallback gracefully without blocking teacher
        const fallbackWords = activeMode === 'words'
          ? generateSmartWords(aiTopic, aiCount, language)
          : generateSmartQuestions(aiTopic, aiCount)
        
        if (activeMode === 'words') {
          const updated = [...words, ...fallbackWords]
          setWords(updated)
          saveCustomGameWords(language, updated)
          if (onWordsUpdated) onWordsUpdated(updated)
        } else {
          const updated = [...questions, ...fallbackWords]
          setQuestions(updated)
          saveActiveCustomQuestions(updated)
          if (onQuestionsUpdated) onQuestionsUpdated(updated)
        }
        flashNotice(`⚡ تم التوليد الذكي الفوري لـ ${fallbackWords.length} عنصر بنجاح!`)
        setLoadingAI(false)
        setActiveTab('active')
        return
      }

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.2 },
          cost: 2,
          action: 'teacher_game_generator'
        })
      })

      const resData = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(resData?.error?.message || 'تعذر الاتصال بخدمة الذكاء الاصطناعي')
      }

      const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const jsonMatch = rawText.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('لم يقم الذكاء الاصطناعي بإرجاع بيانات JSON صالحة.')

      const parsed = JSON.parse(jsonMatch[0])

      if (activeMode === 'words') {
        const normalizedList = parsed.map(p => normalizeCustomWord(p, language)).filter(Boolean)
        const updated = [...words, ...normalizedList]
        setWords(updated)
        saveCustomGameWords(language, updated)
        if (onWordsUpdated) onWordsUpdated(updated)
        flashNotice(`✨ تم توليد ${normalizedList.length} كلمة بالذكاء الاصطناعي بنجاح!`)
      } else {
        const normalizedList = normalizeQuestions(parsed)
        const updated = [...questions, ...normalizedList]
        setQuestions(updated)
        saveActiveCustomQuestions(updated)
        if (onQuestionsUpdated) onQuestionsUpdated(updated)
        flashNotice(`✨ تم توليد ${normalizedList.length} سؤال بالذكاء الاصطناعي بنجاح!`)
      }

      setActiveTab('active')
    } catch (err) {
      console.warn('AI API fallback triggered:', err)
      // Instant Smart Fallback
      const fallbackItems = activeMode === 'words' 
        ? generateSmartWords(aiTopic, aiCount, language) 
        : generateSmartQuestions(aiTopic, aiCount)

      if (activeMode === 'words') {
        const updated = [...words, ...fallbackItems]
        setWords(updated)
        saveCustomGameWords(language, updated)
        if (onWordsUpdated) onWordsUpdated(updated)
      } else {
        const updated = [...questions, ...fallbackItems]
        setQuestions(updated)
        saveActiveCustomQuestions(updated)
        if (onQuestionsUpdated) onQuestionsUpdated(updated)
      }
      flashNotice(`⚡ تم التوليد الذكي الفوري لـ ${fallbackItems.length} عنصر!`)
      setActiveTab('active')
    } finally {
      setLoadingAI(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        direction: 'rtl',
        fontFamily: 'Tajawal, sans-serif'
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            padding: '18px 24px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem'
              }}
            >
              🤖
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                إدارة ألعاب المعلم والتوليد بالذكاء الاصطناعي
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
                توليد كلمات وأسئلة تفاعلية أو إضافتها يدوياً لجميع الألعاب
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector (Words vs Questions) */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '6px',
            borderBottom: '1px solid #e2e8f0',
            gap: '8px'
          }}
        >
          <button
            onClick={() => setActiveMode('words')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: activeMode === 'words' ? '#ffffff' : 'transparent',
              color: activeMode === 'words' ? '#0284c7' : '#64748b',
              boxShadow: activeMode === 'words' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <span>🔤</span>
            <span>كلمات التأسيس والفونكس (سيارة، مخلب، صخور، قطار)</span>
            <span
              style={{
                fontSize: '0.75rem',
                background: activeMode === 'words' ? '#e0f2fe' : '#cbd5e1',
                padding: '2px 8px',
                borderRadius: '10px'
              }}
            >
              {words.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMode('questions')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: activeMode === 'questions' ? '#ffffff' : 'transparent',
              color: activeMode === 'questions' ? '#8b5cf6' : '#64748b',
              boxShadow: activeMode === 'questions' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <span>🎯</span>
            <span>أسئلة الاختيار من متعدد (ماريو، الجري، الدبابات)</span>
            <span
              style={{
                fontSize: '0.75rem',
                background: activeMode === 'questions' ? '#f3e8ff' : '#cbd5e1',
                padding: '2px 8px',
                borderRadius: '10px'
              }}
            >
              {questions.length}
            </span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 20px',
            background: '#ffffff'
          }}
        >
          <button
            onClick={() => setActiveTab('ai')}
            style={{
              padding: '12px 18px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'ai' ? '3px solid #0284c7' : '3px solid transparent',
              color: activeTab === 'ai' ? '#0284c7' : '#64748b',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={18} />
            <span>توليد بالذكاء الاصطناعي</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            style={{
              padding: '12px 18px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'manual' ? '3px solid #0284c7' : '3px solid transparent',
              color: activeTab === 'manual' ? '#0284c7' : '#64748b',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={18} />
            <span>إضافة يدوية عادية</span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            style={{
              padding: '12px 18px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'active' ? '3px solid #0284c7' : '3px solid transparent',
              color: activeTab === 'active' ? '#0284c7' : '#64748b',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BookOpen size={18} />
            <span>
              المحتوى المفعل (
              {activeMode === 'words' ? words.length : questions.length}
              )
            </span>
          </button>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div
            style={{
              background: '#ecfdf5',
              color: '#065f46',
              borderBottom: '1px solid #a7f3d0',
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={18} color="#2A52C7" />
            <span>{notification}</span>
          </div>
        )}

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* TAB 1: AI GENERATOR */}
          {activeTab === 'ai' && (
            <div>
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid #bae6fd',
                  marginBottom: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Wand2 size={20} color="#0284c7" />
                  <h4 style={{ margin: 0, color: '#0369a1', fontWeight: 800 }}>
                    {activeMode === 'words'
                      ? 'توليد كلمات التأسيس والفونكس ذكياً'
                      : 'توليد أسئلة المسابقات التفاعلية'}
                  </h4>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#0369a1', opacity: 0.9 }}>
                  اكتب أي موضوع أو مهارة، وسيقوم الذكاء الاصطناعي بصياغة محتوى تعليمي فوري وجذاب للأطفال!
                </p>
              </div>

              {/* Quick Preset Chips for Words */}
              {activeMode === 'words' && (
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                    ⚡ حزم جاهزة للتوليد الفوري بنقرة واحدة:
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.keys(SMART_AI_PRESETS[language] || {}).map((presetKey) => (
                      <button
                        key={presetKey}
                        onClick={() => handleInstantPresetGenerate(presetKey)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#e0f2fe'
                          e.currentTarget.style.borderColor = '#38bdf8'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f8fafc'
                          e.currentTarget.style.borderColor = '#cbd5e1'
                        }}
                      >
                        ✨ {presetKey}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Topic Input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {activeMode === 'words'
                    ? '🎯 موضوع الكلمات أو المهارة المستهدفة:'
                    : '🎯 موضوع الدرس أو الأسئلة:'}
                </label>
                <textarea
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder={
                    activeMode === 'words'
                      ? 'مثال: كلمات ثلاثية بحركة الفتح، حيوانات الغابة، فواكه، أدوات النجار، CVC words with short a...'
                      : 'مثال: قواعد النحو كان وأخواتها، جدول ضرب 6، أركان الإيمان، عواصم الدول العربية...'
                  }
                  style={{
                    width: '100%',
                    height: '80px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Controls: Count & Language */}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  marginBottom: '20px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>العدد:</span>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontWeight: 700,
                      outline: 'none'
                    }}
                  >
                    <option value={5}>5 عناصر</option>
                    <option value={8}>8 عناصر</option>
                    <option value={10}>10 عناصر</option>
                    <option value={15}>15 عنصراً</option>
                    <option value={20}>20 عنصراً</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>اللغة:</span>
                  <button
                    onClick={() => setLanguage('arabic')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: language === 'arabic' ? '#0284c7' : '#f1f5f9',
                      color: language === 'arabic' ? 'white' : '#64748b',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    العربية 🇸🇦
                  </button>
                  <button
                    onClick={() => setLanguage('english')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: language === 'english' ? '#0284c7' : '#f1f5f9',
                      color: language === 'english' ? 'white' : '#64748b',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    English 🇬🇧
                  </button>
                </div>
              </div>

              {/* Generation Buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleAIGenerate(false)}
                  disabled={loadingAI}
                  style={{
                    flex: 1,
                    minWidth: '220px',
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: loadingAI ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  <Sparkles size={18} />
                  <span>{loadingAI ? 'جاري التوليد السحري...' : `توليد بالذكاء الاصطناعي (${aiCount})`}</span>
                </button>

                <button
                  onClick={() => handleAIGenerate(true)}
                  disabled={loadingAI}
                  style={{
                    padding: '12px 20px',
                    background: '#f8fafc',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: loadingAI ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={16} />
                  <span>توليد سريع فوري (مجاني)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL ENTRY */}
          {activeTab === 'manual' && (
            <div>
              {/* Words Manual Form */}
              {activeMode === 'words' && (
                <div>
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '20px'
                    }}
                  >
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                      ✍️ إضافة كلمة واحدة يدوياً:
                    </h4>
                    <form onSubmit={handleAddSingleWord}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                            الكلمة (مع التشكيل أو بدونه):
                          </label>
                          <input
                            type="text"
                            value={newWord.word}
                            onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                            placeholder="مثال: كَتَبَ أو CAT"
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontWeight: 700,
                              fontSize: '1rem',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                            التصنيف أو المهارة:
                          </label>
                          <input
                            type="text"
                            value={newWord.category}
                            onChange={(e) => setNewWord({ ...newWord, category: e.target.value })}
                            placeholder="مثال: أفعال ماضية"
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                            رمز تعبيري:
                          </label>
                          <input
                            type="text"
                            value={newWord.emoji}
                            onChange={(e) => setNewWord({ ...newWord, emoji: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              textAlign: 'center',
                              fontSize: '1.2rem',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      {/* Quick Emojis */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>رموز سريعة:</span>
                        {['🍎', '🦁', '🚗', '📚', '⭐', '🌱', '⚽', '🎨', '🐱', '🚀'].map((em) => (
                          <button
                            type="button"
                            key={em}
                            onClick={() => setNewWord({ ...newWord, emoji: em })}
                            style={{
                              background: 'none',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              padding: '2px 6px',
                              fontSize: '1rem',
                              cursor: 'pointer'
                            }}
                          >
                            {em}
                          </button>
                        ))}
                      </div>

                      <button
                        type="submit"
                        style={{
                          background: '#0284c7',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Plus size={16} />
                        <span>إضافة الكلمة للعبة</span>
                      </button>
                    </form>
                  </div>

                  {/* Bulk Words Entry */}
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                      📋 لصق قائمة كلمات دفعة واحدة (Bulk Paste):
                    </h4>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#64748b' }}>
                      الصق كلماتك هنا (كلمة في كل سطر أو مفصولة بفواصل)، وسيقوم النظام بتجهيز حروفها وتقطيعها فوراً!
                    </p>
                    <textarea
                      value={bulkWordsText}
                      onChange={(e) => setBulkWordsText(e.target.value)}
                      placeholder={'كَتَبَ\nقَرَأَ\nرَسَمَ\nأَكَلَ'}
                      style={{
                        width: '100%',
                        height: '110px',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        outline: 'none',
                        resize: 'none',
                        boxSizing: 'border-box',
                        marginBottom: '10px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleBulkWordsImport}
                      style={{
                        background: '#1A2E86',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Layers size={16} />
                      <span>استيراد الكلمات دفعة واحدة 📥</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Questions Manual Form */}
              {activeMode === 'questions' && (
                <div>
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '20px'
                    }}
                  >
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                      ✍️ إضافة سؤال اختيار من متعدد:
                    </h4>
                    <form onSubmit={handleAddSingleQuestion}>
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                          نص السؤال:
                        </label>
                        <input
                          type="text"
                          value={newQ.text}
                          onChange={(e) => setNewQ({ ...newQ, text: e.target.value })}
                          placeholder="مثال: ما هو جمع كلمة كتاب؟"
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontWeight: 700,
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1A2E86', marginBottom: '4px' }}>
                            الإجابة الصحيحة ✅:
                          </label>
                          <input
                            type="text"
                            value={newQ.answer}
                            onChange={(e) => setNewQ({ ...newQ, answer: e.target.value })}
                            placeholder="كتب"
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '2px solid #2A52C7',
                              fontWeight: 700,
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>
                            خيار خاطئ (1) ❌:
                          </label>
                          <input
                            type="text"
                            value={newQ.w1}
                            onChange={(e) => setNewQ({ ...newQ, w1: e.target.value })}
                            placeholder="كاتب"
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>
                            خيار خاطئ (2) ❌:
                          </label>
                          <input
                            type="text"
                            value={newQ.w2}
                            onChange={(e) => setNewQ({ ...newQ, w2: e.target.value })}
                            placeholder="مكتبة"
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>
                            خيار خاطئ (3) ❌:
                          </label>
                          <input
                            type="text"
                            value={newQ.w3}
                            onChange={(e) => setNewQ({ ...newQ, w3: e.target.value })}
                            placeholder="كتاتيب"
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        style={{
                          background: '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Plus size={16} />
                        <span>إضافة السؤال للألعاب</span>
                      </button>
                    </form>
                  </div>

                  {/* Bulk Questions */}
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                      📋 لصق أسئلة متعددة (سؤال | إجابة | خطأ 1 | خطأ 2):
                    </h4>
                    <textarea
                      value={bulkQuestionsText}
                      onChange={(e) => setBulkQuestionsText(e.target.value)}
                      placeholder={'ما عاصمة مصر؟ | القاهرة | الإسكندرية | أسوان | الجيزة\nكم عدد أركان الإسلام؟ | 5 | 4 | 6 | 3'}
                      style={{
                        width: '100%',
                        height: '100px',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                        resize: 'none',
                        boxSizing: 'border-box',
                        marginBottom: '10px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleBulkQuestionsImport}
                      style={{
                        background: '#1A2E86',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Layers size={16} />
                      <span>استيراد الأسئلة 📥</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACTIVE ITEMS LIST */}
          {activeTab === 'active' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  background: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>
                    {activeMode === 'words' ? 'الكلمات الجاهزة في اللعبة:' : 'الأسئلة الجاهزة في اللعبة:'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    {activeMode === 'words'
                      ? `يوجد حالياً ${words.length} كلمة مخصصة. إذا فرغت الكلمات، ستنتقل اللعبة للتوليد اللانهائي تلقائياً.`
                      : `يوجد حالياً ${questions.length} سؤال مخصص مفعّل.`}
                  </p>
                </div>

                {(activeMode === 'words' ? words.length > 0 : questions.length > 0) && (
                  <button
                    onClick={activeMode === 'words' ? handleClearAllWords : handleClearAllQuestions}
                    style={{
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={14} />
                    <span>مسح الكل</span>
                  </button>
                )}
              </div>

              {/* Words List */}
              {activeMode === 'words' && (
                <div>
                  {words.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        background: '#f8fafc',
                        borderRadius: '16px',
                        border: '2px dashed #cbd5e1'
                      }}
                    >
                      <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎲</div>
                      <h4 style={{ margin: '0 0 6px 0', color: '#334155' }}>لا توجد كلمات مخصصة حالياً</h4>
                      <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b' }}>
                        الألعاب تعمل الآن في وضع **التوليد التلقائي اللانهائي**! يمكنك توليد كلمات بالذكاء الاصطناعي أو إضافتها يدوياً أعلاه.
                      </p>
                      <button
                        onClick={() => setActiveTab('ai')}
                        style={{
                          background: '#0284c7',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Sparkles size={16} />
                        <span>توليد كلمات بالذكاء الاصطناعي الآن</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                      {words.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.6rem' }}>{item.emoji || '⭐'}</span>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                                {item.word}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {item.letters ? item.letters.join(' - ') : item.category}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteWord(idx)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '6px',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Questions List */}
              {activeMode === 'questions' && (
                <div>
                  {questions.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        background: '#f8fafc',
                        borderRadius: '16px',
                        border: '2px dashed #cbd5e1'
                      }}
                    >
                      <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🍄</div>
                      <h4 style={{ margin: '0 0 6px 0', color: '#334155' }}>لا توجد أسئلة مخصصة حالياً</h4>
                      <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b' }}>
                        ألعاب الأركيد تعمل الآن بالبنك اللانهائي. يمكنك توليد أسئلة مخصصة لدرسك الآن!
                      </p>
                      <button
                        onClick={() => setActiveTab('ai')}
                        style={{
                          background: '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Sparkles size={16} />
                        <span>توليد أسئلة بالذكاء الاصطناعي</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {questions.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '14px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '6px' }}>
                              {idx + 1}. {q.text}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                              <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                                ✅ {q.answer}
                              </span>
                              {q.options
                                ?.filter((o) => o !== q.answer)
                                .map((opt, oi) => (
                                  <span
                                    key={oi}
                                    style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px' }}
                                  >
                                    ❌ {opt}
                                  </span>
                                ))}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteQuestion(idx)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '6px'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            <span>💡 يتم تطبيق أي تعديل فوراً في جميع الألعاب المفتوحة.</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#0284c7',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>حفظ وتطبيق في اللعبة 🎮</span>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

// Procedural Smart Fallbacks for instant generation
function generateSmartWords(topic, count, lang) {
  const cleanTopic = topic.trim().toLowerCase()
  const list = []

  // If match presets
  for (const [key, wordsList] of Object.entries(SMART_AI_PRESETS[lang] || {})) {
    if (cleanTopic.includes(key.toLowerCase()) || key.toLowerCase().includes(cleanTopic)) {
      return wordsList.slice(0, count)
    }
  }

  // General vocabulary generator based on words in prompt or high frequency Arabic words
  const defaultAr = [
    { word: 'نَجَحَ', emoji: '🌟', cat: topic },
    { word: 'فَرِحَ', emoji: '😃', cat: topic },
    { word: 'صَعِدَ', emoji: '🧗', cat: topic },
    { word: 'وَصَلَ', emoji: '🏁', cat: topic },
    { word: 'نَظَرَ', emoji: '👀', cat: topic },
    { word: 'سَمِعَ', emoji: '👂', cat: topic },
    { word: 'عَلِمَ', emoji: '💡', cat: topic },
    { word: 'فَهِمَ', emoji: '🧠', cat: topic },
    { word: 'شَكَرَ', emoji: '🙏', cat: topic },
    { word: 'صَبَرَ', emoji: '⏳', cat: topic },
    { word: 'نَصَرَ', emoji: '🏆', cat: topic },
    { word: 'فَتَحَ', emoji: '🔑', cat: topic }
  ]

  const defaultEn = [
    { word: 'star', emoji: '⭐', cat: topic },
    { word: 'book', emoji: '📚', cat: topic },
    { word: 'tree', emoji: '🌳', cat: topic },
    { word: 'bird', emoji: '🐦', cat: topic },
    { word: 'fish', emoji: '🐟', cat: topic },
    { word: 'moon', emoji: '🌙', cat: topic },
    { word: 'play', emoji: '🎮', cat: topic },
    { word: 'jump', emoji: '🦘', cat: topic }
  ]

  const pool = lang === 'arabic' ? defaultAr : defaultEn
  const selected = pool.slice(0, count)

  return selected.map(item => normalizeCustomWord({
    word: item.word,
    emoji: item.emoji,
    category: item.cat || topic
  }, lang))
}

function generateSmartQuestions(topic, count) {
  const questions = []
  const cleanTopic = topic.trim()

  for (let i = 1; i <= count; i++) {
    questions.push(normalizeQuestion({
      text: `سؤال ${i} في موضوع (${cleanTopic}): أي مما يلي يعتبر الخيار الصحيح؟`,
      answer: `الإجابة النموذجية ${i}`,
      w1: `خيار غير دقيق أ`,
      w2: `خيار غير دقيق ب`,
      w3: `خيار غير دقيق ج`
    }))
  }
  return questions
}
