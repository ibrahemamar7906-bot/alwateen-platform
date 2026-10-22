'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import { 
  Plus, Trash2, Download, Upload, Save, Printer, ArrowRight, 
  Sparkles, FileSpreadsheet, CheckCircle2, Play, BookOpen, Layers,
  Copy, FileText, Check, HelpCircle, RefreshCw, Eye
} from 'lucide-react'
import { normalizeQuestions, saveActiveCustomQuestions } from '../../utils/questionHelper'

export default function QuestionBankPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [teacher, setTeacher] = useState({ name: 'المعلم', id: '' })
  
  // Current Working Questions
  const [packageName, setPackageName] = useState('حزمة أسئلة جديدة')
  const [questions, setQuestions] = useState([
    {
      text: 'ما هي عاصمة مصر؟',
      answer: 'القاهرة',
      w1: 'الإسكندرية',
      w2: 'الجيزة',
      w3: 'أسوان'
    },
    {
      text: 'مضاد كلمة (النور) هو:',
      answer: 'الظلام',
      w1: 'الضياء',
      w2: 'الشمس',
      w3: 'النهار'
    },
    {
      text: 'أي من الكلمات التالية فعل ماضٍ؟',
      answer: 'كَتَبَ',
      w1: 'يكتب',
      w2: 'اكتب',
      w3: 'كتابة'
    }
  ])

  // Single Question Input Form
  const [newQ, setNewQ] = useState({ text: '', answer: '', w1: '', w2: '', w3: '' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [bulkTextInput, setBulkTextInput] = useState('')
  const [showBulkModal, setShowBulkModal] = useState(false)

  // Saved Packages in LocalStorage / Cloud
  const [savedPackages, setSavedPackages] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [copiedNotification, setCopiedNotification] = useState(false)
  const [printIncludeAnswers, setPrintIncludeAnswers] = useState(false)

  useEffect(() => {
    fetchTeacherData()
  }, [router])

  const fetchTeacherData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!['teacher', 'teacher_pro', 'admin', 'assistant'].includes(profile?.role)) {
        router.push('/student-dashboard')
        return
      }
      if (profile) {
      let finalId = user.id;
                                    if (profile?.role === 'assistant') {
        const { data: link } = await supabase
          .from('assistant_links')
          .select('teacher_id')
          .eq('assistant_id', user.id)
          .eq('status', 'approved')
          .maybeSingle();
          
        if (link) {
          finalId = link.teacher_id;
        } else {
          router.push('/assistant-link');
          return;
        }
      } 
      setTeacher({ name: profile.full_name || 'المعلم', id: finalId, role: profile?.role })
        await loadSavedPackages(finalId, profile?.role)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadSavedPackages = async (teacherId, role) => {
    try {
      let query = supabase.from('teacher_question_banks').select('*');
      if (role !== 'admin' && role !== 'assistant') {
        query = query.eq('teacher_id', teacherId);
      }
      const { data, error } = await query.order('updated_at', { ascending: false });
      
      if (!error && data) {
        setSavedPackages(data)
      }
    } catch (e) {
      console.error('Error fetching question banks:', e)
    }
  }

  // --- Actions ---

  const handleAddSingleQuestion = () => {
    if (!newQ.text.trim() || !newQ.answer.trim() || !newQ.w1.trim()) {
      alert('يرجى ملء نص السؤال والإجابة الصحيحة وخيار خاطئ واحد على الأقل!')
      return
    }

    setQuestions(prev => [
      ...prev,
      {
        text: newQ.text.trim(),
        answer: newQ.answer.trim(),
        w1: newQ.w1.trim(),
        w2: newQ.w2.trim() || 'إجابة أخرى',
        w3: newQ.w3.trim() || 'خيار آخر'
      }
    ])
    setNewQ({ text: '', answer: '', w1: '', w2: '', w3: '' })
    setShowAddModal(false)
  }

  const handleDeleteQuestion = (index) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== index))
  }

  // Download Arabic Excel / CSV Template
  const handleDownloadTemplate = () => {
    // UTF-8 BOM (\uFEFF) ensures Arabic characters open properly in Microsoft Excel
    const header = "السؤال,الإجابة الصحيحة,خيار خاطئ 1,خيار خاطئ 2,خيار خاطئ 3\n"
    const sample1 = "ما هو ناتج جمع 5 + 7 ؟,12,10,14,15\n"
    const sample2 = "ما هي عاصمة جمهورية مصر العربية؟,القاهرة,الإسكندرية,الأقصر,الجيزة\n"
    const sample3 = "جمع كلمة (طالب) هو:,طلاب,طالبات,معلمون,طبيب\n"
    
    const csvContent = "\uFEFF" + header + sample1 + sample2 + sample3
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "نموذج_أسئلة_منصة_الوتين.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Export Current Questions to Excel / CSV
  const handleExportCSV = () => {
    if (questions.length === 0) {
      alert('لا توجد أسئلة في القائمة لتصديرها!')
      return
    }

    let csvContent = "\uFEFFالسؤال,الإجابة الصحيحة,خيار خاطئ 1,خيار خاطئ 2,خيار خاطئ 3\n"
    questions.forEach(q => {
      // Clean commas or quotes
      const clean = (str) => `"${(str || '').replace(/"/g, '""')}"`
      csvContent += `${clean(q.text)},${clean(q.answer)},${clean(q.w1)},${clean(q.w2)},${clean(q.w3)}\n`
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${packageName.replace(/\s+/g, '_')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Upload Excel / CSV
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target.result
        const lines = content.split(/\r?\n/)
        const parsed = []

        // Regex for CSV split handling quotes
        const parseLine = (text) => {
          const re = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g
          const matches = []
          let match
          while ((match = re.exec(text))) {
            let val = match[1]
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1).replace(/""/g, '"')
            }
            matches.push(val.trim())
            if (re.lastIndex >= text.length) break
          }
          return matches
        }

        // Detect if line 0 is a header
        let startIndex = 0
        if (lines.length > 0 && (lines[0].includes('السؤال') || lines[0].toLowerCase().includes('question'))) {
          startIndex = 1
        }

        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue

          let cols = []
          if (line.includes(',')) {
            cols = parseLine(line)
          } else if (line.includes(';') || line.includes('\t')) {
            cols = line.split(/[;\t]/).map(c => c.trim())
          }

          if (cols.length >= 2) {
            parsed.push({
              text: cols[0] || 'سؤال بدون عنوان',
              answer: cols[1] || 'إجابة',
              w1: cols[2] || 'خيار 1',
              w2: cols[3] || 'خيار 2',
              w3: cols[4] || 'خيار 3'
            })
          }
        }

        if (parsed.length > 0) {
          setQuestions(prev => [...prev, ...parsed])
          alert(`🎉 تم بنجاح استيراد ${parsed.length} سؤال وإضافتها للقائمة!`)
        } else {
          alert('تعذر قراءة الأسئلة من الملف. يرجى التأكد من الالتزام بنموذج الإكسيل.')
        }
      } catch (err) {
        console.error(err)
        alert('حدث خطأ أثناء قراءة الملف!')
      }
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  // Bulk Text Parser (Easy Paste from WhatsApp/Word)
  const handleBulkTextParse = () => {
    if (!bulkTextInput.trim()) return
    const lines = bulkTextInput.split('\n')
    const parsed = []

    lines.forEach(line => {
      const trimmed = line.trim()
      if (!trimmed) return
      // Format 1: Question | Answer | w1 | w2 | w3
      // Format 2: Question - Answer - w1 - w2 - w3
      let parts = []
      if (trimmed.includes('|')) parts = trimmed.split('|')
      else if (trimmed.includes(' - ')) parts = trimmed.split(' - ')
      else if (trimmed.includes('،')) parts = trimmed.split('،')
      else parts = trimmed.split(',')

      parts = parts.map(p => p.trim()).filter(Boolean)

      if (parts.length >= 2) {
        parsed.push({
          text: parts[0],
          answer: parts[1],
          w1: parts[2] || 'خيار 1',
          w2: parts[3] || 'خيار 2',
          w3: parts[4] || 'خيار 3'
        })
      }
    })

    if (parsed.length > 0) {
      setQuestions(prev => [...prev, ...parsed])
      setBulkTextInput('')
      setShowBulkModal(false)
      alert(`🎉 تم تحويل ${parsed.length} سؤال وإضافتها بنجاح!`)
    } else {
      alert('يرجى التأكد من التنسيق (السؤال | الإجابة | خيار1 | خيار2 | خيار3)')
    }
  }

  // Save Package
  const handleSavePackage = async () => {
    if (questions.length === 0) {
      alert('لا توجد أسئلة لحفظها!')
      return
    }
    if (!teacher || !teacher.id) return
    setIsSaving(true)

    try {
      const normalized = normalizeQuestions(questions)
      const pkgName = packageName.trim() || 'حزمة أسئلة بدون اسم'

      // Check if package with this name already exists
      const existing = savedPackages.find(p => p.package_name === pkgName)

      const payload = {
        teacher_id: teacher.id,
        package_name: pkgName,
        questions: normalized,
        updated_at: new Date().toISOString()
      }

      if (existing) {
        // Update
        const { error } = await supabase
          .from('teacher_question_banks')
          .update(payload)
          .eq('id', existing.id)
        if (error) throw error
      } else {
        // Insert
        const { error } = await supabase
          .from('teacher_question_banks')
          .insert([payload])
        if (error) throw error
      }

      await loadSavedPackages(teacher.id, teacher.role)
      
      // Also save in active session for live room games and broadcast
      saveActiveCustomQuestions(normalized)

      alert(`✅ تم حفظ حزمة (${pkgName}) سحابياً بنجاح وتفعيلها في ألعاب البث المباشر!`)
    } catch (e) {
      console.error(e)
      alert('❌ حدث خطأ أثناء الحفظ السحابي')
    } finally {
      setIsSaving(false)
    }
  }

  // Load a Saved Package
  const handleLoadPackage = (pkg) => {
    if (confirm(`هل تريد تحميل حزمة "${pkg.package_name}" واستبدال الأسئلة الحالية وتفعيلها في الألعاب؟`)) {
      setPackageName(pkg.package_name)
      const normalized = normalizeQuestions(pkg.questions)
      setQuestions(normalized)
      // Set as active custom questions for live games and broadcast
      saveActiveCustomQuestions(normalized)
    }
  }

  // Delete a Saved Package
  const handleDeletePackage = async (pkgId, e) => {
    e.stopPropagation()
    if (confirm('هل أنت متأكد من حذف هذه الحزمة من حقيبتك السحابية؟')) {
      try {
        const { error } = await supabase
          .from('teacher_question_banks')
          .delete()
          .eq('id', pkgId)
        if (error) throw error
        setSavedPackages(prev => prev.filter(p => p.id !== pkgId))
      } catch (err) {
        alert('❌ خطأ أثناء الحذف')
      }
    }
  }

  // Print Sheet for Offline Classroom
  const handlePrint = () => {
    if (questions.length === 0) {
      alert('أضف بعض الأسئلة أولاً لطباعتها!')
      return
    }
    window.print()
  }

  // Launch In Game
  const handleLaunchGame = (gameRoute) => {
    if (questions.length === 0) {
      alert('أضف بعض الأسئلة أولاً لتشغيل اللعبة!')
      return
    }
    // Save current questions to localStorage for live games and broadcast
    const normalized = normalizeQuestions(questions)
    saveActiveCustomQuestions(normalized)
    router.push(gameRoute)
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', fontFamily: 'Tajawal, sans-serif', paddingBottom: '60px' }}>
      
      {/* Header - Screen View Only */}
      <header className="no-print" style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '15px 30px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={() => router.push('/teacher-assistant')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '10px', color: '#475569', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
            >
              <ArrowRight size={18} /> العودة للأدوات
            </button>
            <div>
              <h1 style={{ fontSize: '1.4rem', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                📦 بنك الأسئلة ومصمم الألعاب 🎮
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleSavePackage}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.25)', fontSize: '0.95rem' }}
            >
              <Save size={18} /> حفظ في المكتبة 💾
            </button>
            
            <button 
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.25)', fontSize: '0.95rem' }}
            >
              <Printer size={18} /> طباعة ورقة السنتر 🖨️
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================
          PRINTABLE SHEET (Visible ONLY when printing - window.print)
          ======================================================== */}
      <div className="print-only" style={{ display: 'none', padding: '20px', color: '#000', direction: 'rtl' }}>
        
        {/* Printable Header */}
        <div style={{ border: '2px solid #000', borderRadius: '12px', padding: '15px 20px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '1.4rem' }}>منصة الوتين للتعليم التفاعلي</h2>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>ورقة عمل / اختبار: {packageName}</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.95rem' }}>إعداد الأستاذ: {teacher.name}</p>
          </div>
          <div style={{ textAlign: 'left', fontSize: '0.95rem', lineHeight: '1.8' }}>
            <div>اسم الطالب: .................................................</div>
            <div>المجموعة / الحصة: .......................................</div>
            <div>الدرجة: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / {questions.length}</div>
          </div>
        </div>

        {/* Questions Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {questions.map((q, idx) => {
            // Shuffle options deterministically or pseudo
            const allOpts = [q.answer, q.w1, q.w2, q.w3].filter(Boolean)
            return (
              <div key={idx} style={{ paddingBottom: '12px', borderBottom: '1px dashed #999', pageBreakInside: 'avoid' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 'bold', marginBottom: '10px' }}>
                  {idx + 1}. {q.text}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', paddingRight: '20px', fontSize: '1rem' }}>
                  {allOpts.map((opt, oIdx) => {
                    const letters = ['( أ )', '( ب )', '( ج )', '( د )']
                    return (
                      <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 'bold' }}>{letters[oIdx]}</span>
                        <span>{opt}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Answer Key (Optional at Bottom) */}
        {printIncludeAnswers && (
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #000', pageBreakInside: 'avoid' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>🔑 نموذج الإجابة الصحيحة (للمعلم):</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', fontSize: '0.9rem' }}>
              {questions.map((q, idx) => (
                <div key={idx} style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                  <strong>س{idx + 1}:</strong> {q.answer}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>


      {/* ========================================================
          SCREEN VIEW
          ======================================================== */}
      <main className="no-print" style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* Banner with 3 Super Simple Steps */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', borderRadius: '24px', padding: '30px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px' }}>
                <Sparkles size={14} /> أسهل طريقة لإدارة أسئلة الحصص
              </span>
              <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px 0' }}>جهّز أسئلتك مرة واحدة، واستخدمها أوفلاين وأونلاين!</h2>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem', maxWidth: '650px', lineHeight: '1.6' }}>
                يمكنك تحميل نموذج إكسيل فارغ وتعبئته، أو رفع ملف أسئلة جاهز، أو كتابة الأسئلة يدوياً لتطبعها لطلاب السنتر أو تشغلها كألعاب مباشرة في الحصة.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={handleDownloadTemplate}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', fontSize: '0.95rem' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <Download size={18} color="#38bdf8" /> تنزيل نموذج Excel فارغ 📥
              </button>

              <label 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#38bdf8', color: '#0f172a', padding: '12px 22px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', fontSize: '0.95rem', boxShadow: '0 4px 15px rgba(56,189,248,0.4)' }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Upload size={18} /> رفع ملف أسئلة (Excel/CSV) 📁
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '25px', alignItems: 'start' }}>
          
          {/* LEFT / MAIN COLUMN: Current Working Question Set */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              
              {/* Package Title & Counter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}>اسم الحزمة الحالية:</label>
                  <input 
                    type="text" 
                    value={packageName} 
                    onChange={e => setPackageName(e.target.value)}
                    placeholder="مثال: مراجعة كان وأخواتها - 6 ابتدائي"
                    style={{ width: '100%', fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '8px 12px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ background: '#f1f5f9', color: '#334155', padding: '6px 14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    عدد الأسئلة: {questions.length}
                  </span>
                  
                  <button 
                    onClick={() => setShowAddModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    <Plus size={16} /> إضافة سؤال ✍️
                  </button>

                  <button 
                    onClick={() => setShowBulkModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#8b5cf6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    <FileText size={16} /> لصق نص سريع 📋
                  </button>
                </div>
              </div>

              {/* Questions List */}
              {questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', border: '2px dashed #cbd5e1', borderRadius: '16px', margin: '10px 0' }}>
                  <BookOpen size={48} style={{ margin: '0 auto 15px', color: '#cbd5e1' }} />
                  <h3 style={{ margin: '0 0 10px 0', color: '#475569' }}>لا توجد أي أسئلة في هذه الحزمة حالياً</h3>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>اضغط على "إضافة سؤال" أو قم برفع ملف Excel جاهز لتبدأ فوراً!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {questions.map((q, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', transition: 'all 0.2s', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#1e293b', lineHeight: '1.5' }}>
                          <span style={{ color: '#3b82f6', marginLeft: '6px' }}>#{idx + 1}</span> {q.text}
                        </h4>
                        <button 
                          onClick={() => handleDeleteQuestion(idx)}
                          style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="حذف السؤال"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Options preview */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.9rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold' }}>
                          ✓ {q.answer}
                        </span>
                        {[q.w1, q.w2, q.w3].filter(Boolean).map((wrong, wIdx) => (
                          <span key={wIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '8px' }}>
                            ✗ {wrong}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Actions */}
              {questions.length > 0 && (
                <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <button 
                    onClick={() => setQuestions([])}
                    style={{ background: 'transparent', border: '1px solid #fca5a5', color: '#ef4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                  >
                    مسح جميع الأسئلة
                  </button>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={handleExportCSV}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      <Download size={16} /> تنزيل كملف Excel/CSV
                    </button>
                    <button 
                      onClick={handleSavePackage}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      <Save size={16} /> حفظ الحزمة
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT COLUMN: Fast Game Launch & Saved Packages Library */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* Direct Play & Live Room Launch */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🎮 تشغيل في الألعاب والبث المباشر
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 15px 0' }}>
                استخدم أسئلتك الحالية فوراً في الألعاب التفاعلية مع الطلاب:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  onClick={() => handleLaunchGame('/admin-dashboard/live')}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '12px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}
                >
                  <span>📡 فتح غرفة البث المباشر (Live)</span>
                  <Play size={16} />
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '5px' }}>
                  <button 
                    onClick={() => handleLaunchGame('/admin-dashboard/live')}
                    style={{ background: '#fdf2f8', border: '1px solid #fbcfe8', color: '#db2777', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center' }}
                  >
                    🍄 ماريو الذكي
                  </button>
                  <button 
                    onClick={() => handleLaunchGame('/admin-dashboard/live')}
                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center' }}
                  >
                    💥 حرب الدبابات
                  </button>
                  <button 
                    onClick={() => handleLaunchGame('/admin-dashboard/live')}
                    style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center' }}
                  >
                    🚆 صب واي الحروف
                  </button>
                  <button 
                    onClick={() => handleLaunchGame('/admin-dashboard/live')}
                    style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center' }}
                  >
                    🚂 قطار الألعاب
                  </button>
                </div>
              </div>
            </div>

            {/* Print Options Card */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🖨️ إعدادات طباعة السنتر (أوفلاين)
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 15px 0' }}>
                تجهيز ورقة الاختبار للطباعة وتوزيعها في الحصص الحضورية:
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '12px', marginBottom: '15px' }}>
                <input 
                  type="checkbox" 
                  id="includeAnswers" 
                  checked={printIncludeAnswers} 
                  onChange={e => setPrintIncludeAnswers(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6' }}
                />
                <label htmlFor="includeAnswers" style={{ fontSize: '0.9rem', color: '#334155', cursor: 'pointer', fontWeight: 'bold' }}>
                  إدراج نموذج الإجابة في أسفل الورقة (للمعلم)
                </label>
              </div>

              <button 
                onClick={handlePrint}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
              >
                <Printer size={18} /> معاينة وطباعة الورقة الآن 🖨️
              </button>
            </div>

            {/* Saved Packages Library */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📚 مكتبة الحزم المحفوظة ({savedPackages.length})
                </h3>
              </div>

              {savedPackages.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', margin: '20px 0' }}>لم تحفظ أي حزم بعد</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
                  {savedPackages.map(pkg => (
                    <div 
                      key={pkg.id} 
                      onClick={() => handleLoadPackage(pkg)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 15px', cursor: 'pointer', transition: '0.2s' }}
                      onMouseOver={e => e.currentTarget.style.borderColor = '#3b82f6'}
                      onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '0.95rem' }}>{pkg.package_name || pkg.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                          {pkg.questions?.length || 0} سؤال • {pkg.updated_at ? new Date(pkg.updated_at).toLocaleDateString('ar-EG') : pkg.date}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={(e) => handleDeletePackage(pkg.id, e)}
                          style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                          title="حذف الحزمة"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* ========================================================
          MODAL: ADD SINGLE QUESTION
          ======================================================== */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '600px', padding: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1e293b' }}>إضافة سؤال جديد ✍️</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>نص السؤال:</label>
                <input 
                  type="text" 
                  value={newQ.text} 
                  onChange={e => setNewQ({...newQ, text: e.target.value})}
                  placeholder="مثال: من هو مؤلف كتاب كليلة ودمنة؟"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '6px' }}>الإجابة الصحيحة (ستظهر باللون الأخضر):</label>
                <input 
                  type="text" 
                  value={newQ.answer} 
                  onChange={e => setNewQ({...newQ, answer: e.target.value})}
                  placeholder="مثال: عبد الله بن المقفع"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '2px solid #86efac', background: '#f0fdf4', fontSize: '1rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '4px' }}>خيار خاطئ 1:</label>
                  <input 
                    type="text" 
                    value={newQ.w1} 
                    onChange={e => setNewQ({...newQ, w1: e.target.value})}
                    placeholder="مثال: الجاحظ"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fca5a5', fontSize: '0.95rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '4px' }}>خيار خاطئ 2 (اختياري):</label>
                  <input 
                    type="text" 
                    value={newQ.w2} 
                    onChange={e => setNewQ({...newQ, w2: e.target.value})}
                    placeholder="مثال: الأصمعي"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fca5a5', fontSize: '0.95rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '4px' }}>خيار خاطئ 3 (اختياري):</label>
                  <input 
                    type="text" 
                    value={newQ.w3} 
                    onChange={e => setNewQ({...newQ, w3: e.target.value})}
                    placeholder="مثال: المتنبي"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fca5a5', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                <button 
                  onClick={() => setShowAddModal(false)}
                  style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleAddSingleQuestion}
                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  إضافة للقائمة ✅
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: BULK TEXT PASTE (From Word / WhatsApp)
          ======================================================== */}
      {showBulkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '700px', padding: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', color: '#1e293b' }}>لصق أسئلة متعددة دفعة واحدة 📋</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 15px 0' }}>
              انسخ أسئلتك من الواتساب أو ملف الوورد والصقها هنا، وافصل بين السؤال والإجابات بعلامة ( | ) أو فاصلة:
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 15px', marginBottom: '15px', fontSize: '0.85rem', color: '#475569' }}>
              <strong>مثال على التنسيق:</strong><br />
              ما هي عاصمة السعودية؟ | الرياض | مكة | جدة | الدمام<br />
              ناتج 4 × 5 ؟ | 20 | 15 | 25 | 30
            </div>

            <textarea 
              rows={8}
              value={bulkTextInput}
              onChange={e => setBulkTextInput(e.target.value)}
              placeholder="الصق الأسئلة هنا..."
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', lineHeight: '1.6' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
              <button 
                onClick={() => setShowBulkModal(false)}
                style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                إلغاء
              </button>
              <button 
                onClick={handleBulkTextParse}
                style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                تحويل وإضافة للبنك 🚀
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Print CSS */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
        }
      `}</style>

    </div>
  )
}
