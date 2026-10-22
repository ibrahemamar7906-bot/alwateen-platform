'use client'

import { useState, useEffect, useRef } from 'react'
import { speakWhenReady } from '../../../utils/tts'

const ARABIC_DATA = [
  { letter: 'أ', name: 'ألف', forms: 'أ إأ', word: 'أرنب', emoji: '🐇' },
  { letter: 'ب', name: 'باء', forms: 'ب بـ ـبـ ـب', word: 'بيت', emoji: '🏠' },
  { letter: 'ت', name: 'تاء', forms: 'ت تـ ـتـ ـت', word: 'تفاحة', emoji: '🍎' },
  { letter: 'ث', name: 'ثاء', forms: 'ث ثـ ـثـ ـث', word: 'ثعلب', emoji: '🦊' },
  { letter: 'ج', name: 'جيم', forms: 'ج جـ ـجـ ـج', word: 'جمل', emoji: '🐪' },
  { letter: 'ح', name: 'حاء', forms: 'ح حـ ـحـ ـح', word: 'حمار', emoji: '🐴' },
  { letter: 'خ', name: 'خاء', forms: 'خ خـ ـخـ ـخ', word: 'خروف', emoji: '🐑' },
  { letter: 'د', name: 'دال', forms: 'د ـد', word: 'دجاجة', emoji: '🐔' },
  { letter: 'ذ', name: 'ذال', forms: 'ذ ـذ', word: 'ذئب', emoji: '🐺' },
  { letter: 'ر', name: 'راء', forms: 'ر ـر', word: 'رمانة', emoji: '🍎' },
  { letter: 'ز', name: 'زاي', forms: 'ز ـز', word: 'زرافة', emoji: '🦒' },
  { letter: 'س', name: 'سين', forms: 'س سـ ـسـ ـس', word: 'سمكة', emoji: '🐟' },
  { letter: 'ش', name: 'شين', forms: 'ش شـ ـشـ ـش', word: 'شمس', emoji: '☀️' },
  { letter: 'ص', name: 'صاد', forms: 'ص صـ ـصـ ـص', word: 'صقر', emoji: '🦅' },
  { letter: 'ض', name: 'ضاد', forms: 'ض ضـ ـضـ ـض', word: 'ضفدع', emoji: '🐸' },
  { letter: 'ط', name: 'طاء', forms: 'ط طـ ـطـ ـط', word: 'طاووس', emoji: '🦚' },
  { letter: 'ظ', name: 'ظاء', forms: 'ظ ظـ ـظـ ـظ', word: 'ظبي', emoji: '🦌' },
  { letter: 'ع', name: 'عين', forms: 'ع عـ ـعـ ـع', word: 'عصفور', emoji: '🐦' },
  { letter: 'غ', name: 'غين', forms: 'غ غـ ـغـ ـغ', word: 'غزالة', emoji: '🦌' },
  { letter: 'ف', name: 'فاء', forms: 'ف فـ ـفـ ـف', word: 'فيل', emoji: '🐘' },
  { letter: 'ق', name: 'قاف', forms: 'ق قـ ـقـ ـق', word: 'قطة', emoji: '🐱' },
  { letter: 'ك', name: 'كاف', forms: 'ك كـ ـكـ ـك', word: 'كلب', emoji: '🐶' },
  { letter: 'ل', name: 'لام', forms: 'ل لـ ـلـ ـل', word: 'ليمون', emoji: '🍋' },
  { letter: 'م', name: 'ميم', forms: 'م مـ ـمـ ـم', word: 'مكتب', emoji: '🖊️' },
  { letter: 'ن', name: 'نون', forms: 'ن نـ ـنـ ـن', word: 'نمر', emoji: '🐯' },
  { letter: 'هـ', name: 'هاء', forms: 'هـ هـ ـهـ ـه', word: 'هلال', emoji: '🌙' },
  { letter: 'و', name: 'واو', forms: 'و ـو', word: 'وردة', emoji: '🌹' },
  { letter: 'ي', name: 'ياء', forms: 'ي يـ ـيـ ـي', word: 'يد', emoji: '🤚' }
];

const ARABIC_CURRICULUM_P1_T1 = [
  {
    theme: 'المحور الأول: من أكون',
    subjects: [
      {
        title: 'الموضوع الأول: أسرتي',
        sightWords: ['أنا', 'نحن', 'أبي', 'أمي', 'أخي'],
        letters: ['أ', 'م', 'ب']
      },
      {
        title: 'الموضوع الثاني: عالمي الصغير',
        sightWords: ['هذا', 'هذه'],
        letters: ['ف', 'ن', 'ل', 'ح', 'ر', 'ت']
      }
    ]
  },
  {
    theme: 'المحور الثاني: العالم من حولي',
    subjects: [
      {
        title: 'الموضوع الأول: عالمي الكبير',
        sightWords: ['قال', 'قالت'],
        letters: ['س', 'ج', 'ز', 'د', 'ق', 'ط', 'ش']
      },
      {
        title: 'الموضوع الثاني: أكتشف عالمي',
        sightWords: ['أيضاً', 'في'],
        letters: ['ذ', 'ع', 'و', 'ث', 'خ', 'ص', 'ض', 'ك', 'ي', 'هـ', 'غ', 'ظ']
      }
    ]
  }
];

const ARABIC_CURRICULUM_PREP1 = [
  {
    theme: 'الظواهر اللغوية',
    subjects: [
      {
        title: 'الأسماء الموصولة',
        sightWords: ['الذي', 'التي', 'اللذان', 'اللتان', 'الذين', 'اللاتي', 'اللواتي'],
        letters: []
      },
      {
        title: 'أسماء الإشارة',
        sightWords: ['هذا', 'هذه', 'هذان', 'هاتان', 'هؤلاء', 'ذلك', 'تلك', 'أولئك'],
        letters: []
      }
    ]
  }
];

const ARABIC_CURRICULUM_PREP2 = [
  {
    theme: 'النحو والصرف',
    subjects: [
      {
        title: 'الإعراب والبناء',
        sightWords: ['المعرب من الأسماء', 'المبني من الأسماء', 'المعرب من الأفعال', 'المبني من الأفعال'],
        letters: []
      }
    ]
  }
];

function removeBroadcastBinding(channel, event, callback) {
  if (!channel) return
  try {
    if (channel.bindings && Array.isArray(channel.bindings.broadcast)) {
      const binding = channel.bindings.broadcast.find(b => b.callback === callback)
      if (binding) {
        if (channel.channelAdapter && typeof channel.channelAdapter.off === 'function') {
          channel.channelAdapter.off('broadcast', binding.ref)
        }
        channel.bindings.broadcast = channel.bindings.broadcast.filter(b => b !== binding)
      }
    }
  } catch (e) {
    // safe fallback
  }
}

export default function LiveArabicBoardTeacher({ channel }) {
  const [activeTab, setActiveTab] = useState('alphabet') // 'alphabet' | 'curriculum_p1' | 'curriculum_prep1' | 'curriculum_prep2'
  const [activeItem, setActiveItem] = useState(null)
  const [activeHaraka, setActiveHaraka] = useState(null)
  const [isTracing, setIsTracing] = useState(false)
  const [studentHasControl, setStudentHasControl] = useState(true)
  const canvasRef = useRef(null)

  const activeItemRef = useRef(activeItem);
  useEffect(() => { activeItemRef.current = activeItem; }, [activeItem]);
  const activeHarakaRef = useRef(activeHaraka);
  useEffect(() => { activeHarakaRef.current = activeHaraka; }, [activeHaraka]);
  const isTracingRef = useRef(isTracing);
  useEffect(() => { isTracingRef.current = isTracing; }, [isTracing]);
  const studentHasControlRef = useRef(studentHasControl);
  useEffect(() => { studentHasControlRef.current = studentHasControl; }, [studentHasControl]);

  const [isDrawing, setIsDrawing] = useState(false)

  const HARAKAT = [
    { id: 'fatha', char: 'َ', label: 'فتحة ( ـَ )', name: 'فتحة' },
    { id: 'damma', char: 'ُ', label: 'ضمة ( ـُ )', name: 'ضمة' },
    { id: 'kasra', char: 'ِ', label: 'كسرة ( ـِ )', name: 'كسرة' },
  ]

  // Listen for student drawing events
  useEffect(() => {
    if (!channel) return
    let isMounted = true

    const handleBroadcast = ({ payload }) => {
      if (!isMounted || !payload) return
      
      if (payload.action === 'arabic_trace_draw') {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        
        ctx.lineWidth = 15
        ctx.lineCap = 'round'
        ctx.strokeStyle = payload.color || '#2563eb' // Student usually blue
        
        if (payload.type === 'start') {
          ctx.beginPath()
          ctx.moveTo(payload.x, payload.y)
        } else if (payload.type === 'end') {
          ctx.beginPath()
        } else {
          ctx.lineTo(payload.x, payload.y)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(payload.x, payload.y)
        }
      } else if (payload.action === 'arabic_trace_clear') {
        clearCanvasLocal()
      }
    }

    channel.on('broadcast', { event: 'arabic_board_action_student' }, handleBroadcast)

    const handleSyncRequest = ({ payload }) => {
      if (!isMounted) return;
      if (payload?.action === 'request_sync') {
        channel.send({
          type: 'broadcast',
          event: 'arabic_board_action',
          payload: { action: 'sync_state', activeItem: activeItemRef.current, activeHaraka: activeHarakaRef.current, isTracing: isTracingRef.current, studentHasControl: studentHasControlRef.current }
        }).catch(err => console.error('Sync Broadcast error:', err));
      }
    };
    channel.on('broadcast', { event: 'arabic_board_action_request' }, handleSyncRequest);

    const handleGlobalSync = () => {
      if (!isMounted) return;
      channel.send({
        type: 'broadcast',
        event: 'arabic_board_action',
        payload: { action: 'sync_state', activeItem: activeItemRef.current, activeHaraka: activeHarakaRef.current, isTracing: isTracingRef.current, studentHasControl: studentHasControlRef.current }
      }).catch(err => console.error('Global Sync Broadcast error:', err));
    };
    window.addEventListener('on_global_sync_request', handleGlobalSync);

    return () => {
      isMounted = false
      window.removeEventListener('on_global_sync_request', handleGlobalSync)
      removeBroadcastBinding(channel, 'arabic_board_action_student', handleBroadcast)
      removeBroadcastBinding(channel, 'arabic_board_action_request', handleSyncRequest)
    }
  }, [channel])

  const handleLetterClick = (item) => {
    setActiveItem(item)
    setActiveHaraka(null)
    speakWhenReady(`${item.name || item.letter} ${item.word}`, 'Arabic Male')
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'arabic_board_action',
        payload: { action: 'select_letter', item, activeHaraka: null, isTracing, studentHasControl }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }

  const handleWordClick = (word) => {
    const item = {
      type: 'word',
      letter: 'الكلمات البصرية',
      name: 'الكلمات البصرية',
      word: word,
      forms: word,
      emoji: '📖'
    }
    setActiveItem(item)
    setActiveHaraka(null)
    speakWhenReady(word, 'Arabic Male', { rate: 0.85 })
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'arabic_board_action',
        payload: { action: 'select_letter', item, activeHaraka: null, isTracing, studentHasControl }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }

  const handleHarakaClick = (haraka) => {
    if (!activeItem) return
    setActiveHaraka(haraka)
    const charWithHaraka = activeItem.letter + haraka.char
    speakWhenReady(charWithHaraka, 'Arabic Male')
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'arabic_board_action',
        payload: { action: 'set_haraka', haraka }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }

  const handlePronounce = () => {
    if (!activeItem) return
    if (activeHaraka) {
      speakWhenReady(activeItem.letter + activeHaraka.char, 'Arabic Male')
    } else {
      speakWhenReady(`${activeItem.name || activeItem.letter} ${activeItem.word}`, 'Arabic Male')
    }
    if (!channel) return
    channel.send({
      type: 'broadcast',
      event: 'arabic_board_action',
      payload: { action: 'pronounce_letter', item: activeItem, haraka: activeHaraka }
    }).catch(err => console.error('Broadcast error:', err))
  }

  const handleToggleTracing = () => {
    const newTracingState = !isTracing
    setIsTracing(newTracingState)
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'arabic_board_action',
        payload: { action: 'toggle_tracing', isTracing: newTracingState, studentHasControl }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }

  const handleToggleStudentControl = () => {
    const newControlState = !studentHasControl
    setStudentHasControl(newControlState)
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'arabic_board_action',
        payload: { action: 'update_control', studentHasControl: newControlState }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }

  const handleClear = () => {
    setActiveItem(null)
    setActiveHaraka(null)
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'arabic_board_action',
        payload: { action: 'clear' }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }

  const clearCanvas = () => {
    clearCanvasLocal()
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'arabic_board_action',
        payload: { action: 'clear_trace' }
      }).catch(err => console.error('Broadcast error:', err))
    }
  }
  
  const clearCanvasLocal = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  // Teacher Drawing Handlers
  const sendDrawEvent = (x, y, type) => {
    if (!channel) return
    channel.send({
      type: 'broadcast',
      event: 'arabic_board_action',
      payload: { action: 'arabic_trace_draw', x, y, type, color: '#ef4444' } // Teacher color: Red
    }).catch(err => console.error('Broadcast error:', err))
  }

  const startDrawing = (e) => {
    setIsDrawing(true)
    draw(e, 'start')
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.beginPath()
    }
    sendDrawEvent(0, 0, 'end')
  }

  const draw = (e, forceType = null) => {
    if (!isDrawing && forceType !== 'start') return
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    let clientX = e.clientX
    let clientY = e.clientY
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    }
    
    // Calculate normalized coordinates based on internal canvas resolution (320x450) vs display size
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    ctx.lineWidth = 15
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#ef4444' // Teacher color: Red
    
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)

    sendDrawEvent(x, y, forceType || 'draw')
  }

  // Prevent scrolling while drawing on mobile
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const preventScroll = (e) => e.preventDefault()
    canvas.addEventListener('touchstart', preventScroll, { passive: false })
    canvas.addEventListener('touchmove', preventScroll, { passive: false })
    return () => {
      canvas.removeEventListener('touchstart', preventScroll)
      canvas.removeEventListener('touchmove', preventScroll)
    }
  }, [isTracing, activeItem])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      backgroundColor: '#f8fafc', color: '#0f172a', direction: 'rtl',
      fontFamily: "'Tajawal', 'Cairo', sans-serif"
    }}>
      <div style={{
        padding: 'clamp(8px, 1.5vh, 12px) clamp(10px, 2vw, 20px)', backgroundColor: '#064e3b', color: 'white',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', flexShrink: 0
      }}>
        <h2 style={{ margin: 0, fontSize: 'clamp(1rem, 2.5vw, 1.4rem)' }}>سبورة اللغة العربية (لوحة المعلم)</h2>
        <button 
          onClick={handleClear}
          style={{
            backgroundColor: '#ef4444', color: 'white', border: 'none',
            padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)'
          }}
        >
          مسح السبورة
        </button>
      </div>

      {/* Toolbar */}
      <div style={{
        padding: 'clamp(8px, 1.5vh, 12px) clamp(8px, 2vw, 16px)', backgroundColor: '#e2e8f0',
        display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', alignItems: 'center', flexShrink: 0
      }}>
        <button 
          onClick={handlePronounce}
          disabled={!activeItem}
          style={{
            backgroundColor: activeItem ? '#3b82f6' : '#cbd5e1', color: 'white', border: 'none',
            padding: '7px 14px', borderRadius: '8px', cursor: activeItem ? 'pointer' : 'not-allowed',
            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'clamp(0.78rem, 2.2vw, 0.88rem)'
          }}
        >
          <span>🔊</span> {activeHaraka ? `نطق (${activeItem?.letter}${activeHaraka?.char})` : 'نطق الحرف/الكلمة'}
        </button>
        
        {/* Harakat & Tabs Buttons */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '8px',
          backgroundColor: '#f8fafc', padding: '10px', borderRadius: '14px',
          border: '1px solid #cbd5e1', justifyContent: 'center', width: '100%', maxWidth: '850px'
        }}>
          {/* Scrollable Tabs ribbon for mobile */}
          <div style={{
            width: '100%', display: 'flex', gap: '6px', overflowX: 'auto', flexWrap: 'nowrap',
            WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', paddingBottom: '4px'
          }}>
            <button
              onClick={() => setActiveTab('alphabet')}
              style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontWeight: 'bold', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', transition: '0.2s', whiteSpace: 'nowrap',
                backgroundColor: activeTab === 'alphabet' ? '#059669' : '#e2e8f0',
                color: activeTab === 'alphabet' ? 'white' : '#64748b'
              }}
            >
              🔤 الحروف الهجائية
            </button>
            <button
              onClick={() => setActiveTab('curriculum_p1')}
              style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontWeight: 'bold', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', transition: '0.2s', whiteSpace: 'nowrap',
                backgroundColor: activeTab === 'curriculum_p1' ? '#3b82f6' : '#e2e8f0',
                color: activeTab === 'curriculum_p1' ? 'white' : '#64748b'
              }}
            >
              منهج 1 ابتدائي
            </button>
            <button
              onClick={() => setActiveTab('curriculum_prep1')}
              style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontWeight: 'bold', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', transition: '0.2s', whiteSpace: 'nowrap',
                backgroundColor: activeTab === 'curriculum_prep1' ? '#8b5cf6' : '#e2e8f0',
                color: activeTab === 'curriculum_prep1' ? 'white' : '#64748b'
              }}
            >
              منهج 1 إعدادي
            </button>
            <button
              onClick={() => setActiveTab('curriculum_prep2')}
              style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontWeight: 'bold', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', transition: '0.2s', whiteSpace: 'nowrap',
                backgroundColor: activeTab === 'curriculum_prep2' ? '#f59e0b' : '#e2e8f0',
                color: activeTab === 'curriculum_prep2' ? 'white' : '#64748b'
              }}
            >
              منهج 2 إعدادي
            </button>
          </div>

          {/* Harakat row with horizontal scroll on small screens */}
          <div style={{
            display: 'flex', gap: '6px', overflowX: 'auto', flexWrap: 'wrap',
            justifyContent: 'center', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none'
          }}>
            {HARAKAT.map(h => (
              <button
                key={h.id}
                onClick={() => handleHarakaClick(h)}
                disabled={!activeItem}
                style={{
                  backgroundColor: activeHaraka?.id === h.id ? '#8b5cf6' : 'white',
                  color: activeHaraka?.id === h.id ? 'white' : '#475569',
                  border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '8px',
                  cursor: activeItem ? 'pointer' : 'not-allowed', fontWeight: 'bold',
                  fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', transition: '0.2s', display: 'flex', alignItems: 'center',
                  flexShrink: 0
                }}
              >
                <span>{h.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleToggleTracing}
          style={{
            backgroundColor: isTracing ? '#10b981' : '#f59e0b', color: 'white', border: 'none',
            padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'clamp(0.78rem, 2.2vw, 0.88rem)'
          }}
        >
          <span>{isTracing ? '✍️' : '📝'}</span> 
          {isTracing ? 'العودة لعرض الحروف' : 'سبورة التتبع والرسم'}
        </button>

        {isTracing && (
          <>
            <button 
              onClick={handleToggleStudentControl}
              style={{
                backgroundColor: studentHasControl ? '#ef4444' : '#10b981', color: 'white', border: 'none',
                padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'clamp(0.78rem, 2.2vw, 0.88rem)'
              }}
            >
              <span>{studentHasControl ? '🔒' : '🔓'}</span> 
              {studentHasControl ? 'سحب التحكم' : 'إعطاء التحكم للطلاب'}
            </button>
            <button 
              onClick={clearCanvas}
              style={{
                backgroundColor: '#64748b', color: 'white', border: 'none',
                padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'clamp(0.78rem, 2.2vw, 0.88rem)'
              }}
            >
              <span>🗑️</span> مسح الرسم
            </button>
          </>
        )}
      </div>

      <div style={{
        flex: 1, padding: '16px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start', overflowY: 'auto'
      }}>
        
        {isTracing ? (
          /* Tracing Board for Teacher */
          <div style={{ position: 'relative', width: '100%', maxWidth: 'min(400px, 90vw)', maxHeight: 'min(65vh, 520px)', aspectRatio: '10 / 14', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', marginBottom: '35px' }}>
            <div style={{ position: 'absolute', inset: 0, border: '3px dashed #cbd5e1', borderRadius: '24px', pointerEvents: 'none', zIndex: 1 }} />
            
            <svg viewBox="0 0 1000 1400" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
              <text x="500" y="700" textAnchor="middle" dominantBaseline="central" fontSize={activeItem?.forms?.length > 4 ? "200" : "350"} fill="none" stroke="#e2e8f0" strokeWidth="5" strokeDasharray="15,15" fontWeight="bold" fontFamily="Tajawal, Arial, sans-serif">
                {activeItem ? `${activeItem.forms} ${activeHaraka ? activeHaraka.char : ''}` : ''}
              </text>
            </svg>
            <canvas
              ref={canvasRef}
              width={1000}
              height={1400}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 5, borderRadius: '24px', cursor: 'crosshair', touchAction: 'none' }}
            />
            <div style={{ position: 'absolute', bottom: '-30px', width: '100%', textAlign: 'center', color: '#64748b', fontWeight: 'bold', fontSize: '0.85rem' }}>
              الرسم المباشر يظهر للطلاب في نفس اللحظة
            </div>
          </div>
        ) : (
          /* Active Letter Display (Preview) */
          <div style={{
            width: '100%', maxWidth: '500px',
            backgroundColor: activeItem ? '#10b981' : '#e2e8f0',
            color: activeItem ? 'white' : '#cbd5e1',
            borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)', transition: '0.3s', marginBottom: '16px', flexShrink: 0,
            padding: 'clamp(10px, 2vh, 18px)'
          }}>
            {activeItem ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 3vw, 20px)', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span style={{ fontSize: 'clamp(3.5rem, 12vw, 6.5rem)', fontWeight: 'bold', lineHeight: 1 }}>
                    {activeItem.letter}{activeHaraka?.char || ''}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}>{activeItem.emoji}</span>
                    <span style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.8rem)', fontWeight: 'bold' }}>{activeItem.word}</span>
                  </div>
                </div>
                
                {/* Display Forms (أشكال الحرف في الكلمة) */}
                {activeItem.type !== 'word' && activeItem.forms && (
                  <div style={{
                    display: 'flex', gap: '8px', marginTop: '12px', 
                    backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '14px',
                    width: '100%', justifyContent: 'space-around', flexWrap: 'wrap', boxSizing: 'border-box'
                  }}>
                    {(activeItem.forms || '').split(' ').filter(Boolean).map((form, idx) => {
                      const labels = ['منفصل', 'أول الكلمة', 'وسط الكلمة', 'آخر الكلمة'];
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 'clamp(48px, 15vw, 70px)' }}>
                          <span style={{ fontSize: 'clamp(1.4rem, 4.5vw, 2.2rem)', fontWeight: 'bold' }}>{form}</span>
                          <span style={{ fontSize: 'clamp(0.65rem, 2vw, 0.8rem)', opacity: 0.9 }}>{labels[idx] || 'متصل'}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <div style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '4rem', fontWeight: 'bold' }}>؟</span>
              </div>
            )}
          </div>
        )}

        {/* Keyboard / Board */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '800px', width: '100%'
        }}>
          {activeTab === 'alphabet' && ARABIC_DATA.map(item => (
            <button
              key={item.letter}
              onClick={() => handleLetterClick(item)}
              style={{
                width: 'clamp(38px, 9.5vw, 54px)', height: 'clamp(38px, 9.5vw, 54px)', borderRadius: '10px',
                fontSize: 'clamp(1.2rem, 3.8vw, 1.8rem)', fontWeight: 'bold', border: '2px solid #cbd5e1',
                backgroundColor: activeItem?.letter === item.letter ? '#059669' : 'white',
                color: activeItem?.letter === item.letter ? 'white' : '#334155',
                cursor: 'pointer', transition: '0.2s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title={item.name}
            >
              {item.letter}
            </button>
          ))}

          {activeTab.startsWith('curriculum_') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
              {(() => {
                let data = []
                if (activeTab === 'curriculum_p1') data = ARABIC_CURRICULUM_P1_T1
                else if (activeTab === 'curriculum_prep1') data = ARABIC_CURRICULUM_PREP1
                else if (activeTab === 'curriculum_prep2') data = ARABIC_CURRICULUM_PREP2
                
                return data.map((theme, tIdx) => (
                  <div key={tIdx} style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box' }}>
                    <h3 style={{ color: '#0f172a', margin: '0 0 15px 0', fontSize: '1.2rem', borderBottom: '2px solid #3b82f6', paddingBottom: '8px', display: 'inline-block' }}>{theme.theme}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {theme.subjects.map((subj, sIdx) => (
                        <div key={sIdx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                          <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '1rem' }}>{subj.title}</h4>
                          
                          {subj.sightWords.length > 0 && (
                            <div style={{ marginBottom: '10px' }}>
                              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '5px' }}>
                                {activeTab.includes('prep') ? 'التراكيب والكلمات:' : 'الكلمات البصرية:'}
                              </span>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {subj.sightWords.map(word => (
                                  <button
                                    key={word}
                                    onClick={() => handleWordClick(word)}
                                    style={{
                                      padding: 'clamp(5px, 1vh, 8px) clamp(8px, 2vw, 14px)', borderRadius: '8px', fontWeight: 'bold', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                                      border: '1px solid #f59e0b', backgroundColor: activeItem?.word === word ? '#f59e0b' : '#fef3c7',
                                      color: activeItem?.word === word ? 'white' : '#d97706', cursor: 'pointer'
                                    }}
                                  >
                                    {word}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {subj.letters && subj.letters.length > 0 && (
                            <div>
                              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '5px' }}>الحروف المستهدفة:</span>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {subj.letters.map(l => {
                                  const item = ARABIC_DATA.find(d => d.letter === l)
                                  if (!item) return null
                                  return (
                                    <button
                                      key={l}
                                      onClick={() => handleLetterClick(item)}
                                      style={{
                                        width: 'clamp(36px, 8.5vw, 48px)', height: 'clamp(36px, 8.5vw, 48px)', borderRadius: '10px',
                                        fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 'bold', border: '2px solid #cbd5e1',
                                        backgroundColor: activeItem?.letter === l ? '#3b82f6' : 'white',
                                        color: activeItem?.letter === l ? 'white' : '#334155',
                                        cursor: 'pointer', transition: '0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                      }}
                                      title={item.name}
                                    >
                                      {l}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              })()}
            </div>
          )}
        </div>
        
        <p style={{ marginTop: '25px', color: '#64748b', textAlign: 'center', fontSize: '0.85rem' }}>
          * ملاحظة: يمكنك الضغط على أي حرف أو كلمة لتشغيل النطق الصوتي وعرضه على أجهزة الطلاب فوراً.
        </p>
      </div>
    </div>
  )
}
