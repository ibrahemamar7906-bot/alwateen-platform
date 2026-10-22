'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'
import { UNIFIED_AI_MODELS, DEFAULT_AI_MODEL } from '../../utils/aiModels'
import { Trash2, Edit, Plus, FileText, Download, Users, Copy, Lock, Crown, Bot, Loader2, Sparkles, Clock, Settings, XCircle, CheckCircle2, HelpCircle, ListChecks, Zap } from 'lucide-react'

export default function QuizManagerTab({ styles = {}, role = 'teacher', isPremium = false }) {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', start_time: '', end_time: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [editFormData, setEditFormData] = useState({ title: '', start_time: '', end_time: '' })
  const [submissions, setSubmissions] = useState([])
  
  const [uploadingCsv, setUploadingCsv] = useState(false)
  
  // Question Management Modal States
  const [managingQuiz, setManagingQuiz] = useState(null)
  const [manageTab, setManageTab] = useState('list') // 'list', 'ai', 'manual', 'paste', 'upload'
  const [quizQuestions, setQuizQuestions] = useState([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  
  const [manualQ, setManualQ] = useState({ q: '', a: '', b: '', c: '', d: '', correct: '', exp: '' })
  const [pasteText, setPasteText] = useState('')
  
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiModel, setAiModel] = useState(DEFAULT_AI_MODEL)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiNumQuestions, setAiNumQuestions] = useState(5)
  const [aiDifficulty, setAiDifficulty] = useState('متوسط')
  const [aiQuizType, setAiQuizType] = useState('اختيار من متعدد')
  
  const [showPaywall, setShowPaywall] = useState(false)
  const [viewingAnswers, setViewingAnswers] = useState(null)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  useEffect(() => {
    if (selectedQuiz) {
      handleViewSubmissions(selectedQuiz)
      const channel = supabase.channel(`live-quiz-${selectedQuiz.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quiz_submissions', filter: `quiz_id=eq.${selectedQuiz.id}` }, payload => {
          setSubmissions(prev => [payload.new, ...prev].sort((a,b) => b.score - a.score))
        }).subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }, [selectedQuiz])

  const fetchQuizzes = async () => {
    setLoading(true)
    const { data } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false })
    if (data) {
      try {
        const { data: qCounts } = await supabase.from('quiz_questions').select('quiz_id')
        if (qCounts) {
          const countMap = {}
          qCounts.forEach(item => {
            countMap[item.quiz_id] = (countMap[item.quiz_id] || 0) + 1
          })
          const quizzesWithCount = data.map(q => ({
            ...q,
            questions_count: countMap[q.id] || 0
          }))
          setQuizzes(quizzesWithCount)
          setLoading(false)
          return
        }
      } catch (err) {
        console.warn('Error fetching question counts:', err)
      }
      setQuizzes(data)
    }
    setLoading(false)
  }

  const loadQuizQuestions = async (quizId) => {
    setLoadingQuestions(true)
    const { data } = await supabase.from('quiz_questions').select('*').eq('quiz_id', quizId).order('id', { ascending: true })
    if (data) setQuizQuestions(data)
    setLoadingQuestions(false)
  }

  useEffect(() => {
    if (managingQuiz) {
      loadQuizQuestions(managingQuiz.id)
      setManageTab('list')
    } else {
      setQuizQuestions([])
    }
  }, [managingQuiz])

  const handleDeleteQuestion = async (qId) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return
    const { error } = await supabase.from('quiz_questions').delete().eq('id', qId)
    if (error) alert('خطأ: ' + error.message)
    else {
      setQuizQuestions(prev => prev.filter(q => q.id !== qId))
      setQuizzes(prev => prev.map(q => q.id === managingQuiz.id ? { ...q, questions_count: Math.max(0, (q.questions_count || 1) - 1) } : q))
    }
  }

  const handleDeleteAllQuestions = async () => {
    if (!confirm(`هل أنت متأكد من حذف جميع الأسئلة (${quizQuestions.length} سؤال) في هذا الاختبار؟`)) return
    const { error } = await supabase.from('quiz_questions').delete().eq('quiz_id', managingQuiz.id)
    if (error) alert('خطأ: ' + error.message)
    else {
      setQuizQuestions([])
      setQuizzes(prev => prev.map(q => q.id === managingQuiz.id ? { ...q, questions_count: 0 } : q))
    }
  }

  // Timezone helper functions to fix local time vs UTC database offsets
  const toUtcIsoString = (localInputStr) => {
    if (!localInputStr) return null
    const d = new Date(localInputStr)
    return isNaN(d.getTime()) ? null : d.toISOString()
  }

  const toLocalInputFormat = (isoStr) => {
    if (!isoStr) return ''
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return ''
    const pad = (n) => String(n).padStart(2, '0')
    const year = d.getFullYear()
    const month = pad(d.getMonth() + 1)
    const day = pad(d.getDate())
    const hours = pad(d.getHours())
    const minutes = pad(d.getMinutes())
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'غير محدد'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return 'غير محدد'
    return d.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleCreateQuiz = async (e) => {
    e.preventDefault()
    if (!formData.start_time || !formData.end_time) {
      alert('يرجى تحديد وقت البدء ووقت الانتهاء للاختبار')
      return
    }
    const startIso = toUtcIsoString(formData.start_time)
    const endIso = toUtcIsoString(formData.end_time)
    if (new Date(endIso) <= new Date(startIso)) {
      alert('تنبيه: وقت الغلق يجب أن يكون بعد وقت البدء!')
      return
    }

    setIsSubmitting(true)
    const { data, error } = await supabase.from('quizzes').insert([
      { title: formData.title, start_time: startIso, end_time: endIso }
    ]).select()
    setIsSubmitting(false)
    if (error) alert('خطأ: ' + error.message)
    else {
      setQuizzes([data[0], ...quizzes])
      setFormData({ title: '', start_time: '', end_time: '' })
      setShowForm(false)
    }
  }

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    if (!editingQuiz) return;
    if (!editFormData.start_time || !editFormData.end_time) {
      alert('يرجى تحديد وقت البدء ووقت الغلق');
      return;
    }
    const startIso = toUtcIsoString(editFormData.start_time);
    const endIso = toUtcIsoString(editFormData.end_time);
    if (new Date(endIso) <= new Date(startIso)) {
      alert('تنبيه: وقت الغلق يجب أن يكون بعد وقت البدء!');
      return;
    }

    const { error } = await supabase.from('quizzes').update({
      title: editFormData.title,
      start_time: startIso,
      end_time: endIso
    }).eq('id', editingQuiz.id);
    
    if (error) alert('خطأ في التحديث: ' + error.message);
    else {
      setEditingQuiz(null);
      fetchQuizzes();
    }
  }

  const handleDeleteQuiz = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاختبار؟')) return
    await supabase.from('quizzes').delete().eq('id', id)
    setQuizzes(quizzes.filter(q => q.id !== id))
    if (selectedQuiz?.id === id) setSelectedQuiz(null)
  }

  const handleDeleteSubmission = async (subId) => {
    if (!confirm('هل أنت متأكد من حذف نتيجة هذا الطالب؟')) return;
    const { error } = await supabase.from('quiz_submissions').delete().eq('id', subId);
    if (error) alert('حدث خطأ: ' + error.message);
    else setSubmissions(submissions.filter(s => s.id !== subId));
  }

  const handleCopyLink = (id) => {
    const url = `${window.location.origin}/quiz?id=${id}`
    navigator.clipboard.writeText(url)
    alert('تم نسخ رابط الاختبار: ' + url)
  }

  const parseCSV = (csvText) => {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let insideQuotes = false;
    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i+1];
      if (char === '"' && insideQuotes && nextChar === '"') {
        currentCell += '"'; i++;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentCell.trim()); currentCell = '';
      } else if (char === '\n' && !insideQuotes) {
        currentRow.push(currentCell.trim()); rows.push(currentRow);
        currentRow = []; currentCell = '';
      } else {
        currentCell += char;
      }
    }
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim()); rows.push(currentRow);
    }
    return rows;
  }

  const processCSVData = async (text, quizId) => {
    try {
      const rows = parseCSV(text)
      if (rows.length > 0 && (rows[0][0].includes('السؤال') || rows[0][0].toLowerCase().includes('question'))) {
        rows.shift();
      }
      const questions = rows.map(row => {
        if (row.length < 6) return null;
        const options = [];
        if (row[1]) options.push(row[1]);
        if (row[2]) options.push(row[2]);
        if (row[3]) options.push(row[3]);
        if (row[4]) options.push(row[4]);
        return {
          quiz_id: quizId,
          question_text: row[0],
          options: options,
          correct_answer: row[5],
          explanation: row[6] || null
        }
      }).filter(q => q !== null);

      if (questions.length === 0) throw new Error('لا توجد أسئلة صالحة.')
      const { error } = await supabase.from('quiz_questions').insert(questions)
      if (error) throw error
      alert(`تم إضافة ${questions.length} سؤال بنجاح!`)
      return true
    } catch (err) {
      alert('خطأ في معالجة البيانات: ' + err.message)
      return false
    } finally {
      setUploadingCsv(false)
    }
  }

  const handleUploadCSV = async (e, quizId) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingCsv(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const success = await processCSVData(event.target.result, quizId)
      if (success) {
        await loadQuizQuestions(quizId)
        setManageTab('list')
        fetchQuizzes()
      }
    }
    reader.readAsText(file)
  }

  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) return
    setUploadingCsv(true)
    const success = await processCSVData(pasteText, managingQuiz.id)
    if (success) {
      setPasteText('')
      await loadQuizQuestions(managingQuiz.id)
      setManageTab('list')
      fetchQuizzes()
    }
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!manualQ.correct) {
      alert('يرجى تحديد الإجابة الصحيحة')
      return
    }
    const options = [manualQ.a, manualQ.b, manualQ.c, manualQ.d].filter(o => o.trim() !== '')
    const { error } = await supabase.from('quiz_questions').insert([{
      quiz_id: managingQuiz.id,
      question_text: manualQ.q,
      options: options,
      correct_answer: manualQ.correct,
      explanation: manualQ.exp || null
    }])
    if (error) alert('خطأ: ' + error.message)
    else {
      alert('تم إضافة السؤال بنجاح')
      setManualQ({ q: '', a: '', b: '', c: '', d: '', correct: '', exp: '' })
      await loadQuizQuestions(managingQuiz.id)
      fetchQuizzes()
    }
  }

  const handleAiGenerate = async (autoInsert = true) => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    try {
      const systemPrompt = `أنت خبير التقييم والقياس التربوي وبناء الاختبارات في أداة [إدارة وبناء بنوك الأسئلة والاختبارات التفاعلية] في منصة الجُنيدي التعليمية (alwateen.com).
وظيفتك الأساسية: تأليف وصياغة أسئلة اختبار دقيقة ومعيارية تتبع المعايير التربوية الحديثة بناءً على الموضوع المطلوب.
نوع الأسئلة: ${aiQuizType}
عدد الأسئلة المطلوب صياغتها بالضبط: ${aiNumQuestions} سؤال (يجب الالتزام التام بهذا العدد وتوليد ${aiNumQuestions} سؤال بالتمام والكمال دون زيادة أو نقصان).
مستوى الصعوبة: ${aiDifficulty}

قم بتوليد الأسئلة بصيغة CSV فقط (بدون أي نصوص تمهيدية أو خاتمة وبدون علامات Markdown).
الأعمدة (يجب أن يحتوي الصف الأول على العناوين):
العمود 1: نص السؤال
العمود 2: الخيار أ
العمود 3: الخيار ب
العمود 4: الخيار ج
العمود 5: الخيار د
العمود 6: الإجابة الصحيحة (نص الإجابة مطابق تماماً لأحد الخيارات)
العمود 7: الشرح والتوضيح

مثال للرد:
"السؤال","الخيار أ","الخيار ب","الخيار ج","الخيار د","الإجابة الصحيحة","الشرح والتوضيح"
"ما هي عاصمة مصر؟","القاهرة","الإسكندرية","أسوان","الأقصر","القاهرة","القاهرة هي العاصمة التاريخية لمصر"`;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('يجب تسجيل الدخول لاستخدام المساعد الذكي لتوليد الأسئلة.');
      }

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + '\n\nموضوع الأسئلة والمنهج المطلوب بالتفصيل:\n' + aiPrompt }] }],
          generationConfig: { temperature: 0.2 },
          cost: 5,
          action: 'quiz_generator'
        })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error?.message || 'خطأ أثناء توليد الأسئلة. يرجى التأكد من رصيد الكريديتس.');
      }

      let resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!resultText) {
        throw new Error('تعذر قراءة الأسئلة المولدة.');
      }
      resultText = resultText.replace(/```csv/gi, '').replace(/```/g, '').trim();

      if (autoInsert) {
        const success = await processCSVData(resultText, managingQuiz.id)
        if (success) {
          await loadQuizQuestions(managingQuiz.id)
          setManageTab('list')
          fetchQuizzes()
        }
      } else {
        setPasteText(resultText);
        setManageTab('paste');
      }
    } catch (err) {
      alert('خطأ أثناء التوليد: ' + err.message)
    } finally {
      setAiLoading(false)
    }
  }

  const handleViewSubmissions = async (quiz) => {
    setSelectedQuiz(quiz)
    const { data } = await supabase.from('quiz_submissions').select('*').eq('quiz_id', quiz.id).order('score', { ascending: false })
    if (data) setSubmissions(data)
  }

  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    const BOM = "\uFEFF";
    let csv = BOM + 'اسم الطالب,الدرجة,وقت التسليم\n';
    submissions.forEach(sub => {
      const date = new Date(sub.submitted_at).toLocaleString('ar-EG');
      csv += `"${sub.student_name}",${sub.score} من ${sub.total_questions},"${date}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نتائج_اختبار_${selectedQuiz.title}.csv`;
    a.click();
  }

  const copyTemplateToClipboard = () => {
    const template = 'السؤال,الخيار أ,الخيار ب,الخيار ج,الخيار د,الإجابة الصحيحة,شرح إضافي للطالب\n"ما ناتج جمع 5 و 3؟","8","9","7","10","8","عملية الجمع البسيطة"';
    navigator.clipboard.writeText(template)
    alert('تم نسخ القالب! الصقه في Excel وعدل عليه.')
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Tajawal', direction: 'rtl' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#1e293b' }}>إدارة الاختبارات والواجبات</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#3b82f6', color: 'white', padding: '10px 15px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          {showForm ? <XCircle size={18} /> : <Plus size={18} />}
          {showForm ? 'إغلاق' : 'إنشاء اختبار جديد'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateQuiz} style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>عنوان الاختبار</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>وقت البدء (متاح من)</label>
            <input required type="datetime-local" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>وقت الانتهاء (يغلق في)</label>
            <input required type="datetime-local" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={isSubmitting} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ الاختبار'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 300px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '15px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} /> الاختبارات الحالية
            </h3>
            {quizzes.length === 0 ? <p style={{ color: '#64748b' }}>لا يوجد اختبارات.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {quizzes.map(quiz => {
                  const now = new Date()
                  const start = new Date(quiz.start_time)
                  const end = new Date(quiz.end_time)
                  let statusBadge = { bg: '#f1f5f9', color: '#475569', text: 'مغلق' }
                  if (now < start) {
                    statusBadge = { bg: '#fef9c3', color: '#a16207', text: 'لم يبدأ بعد' }
                  } else if (now >= start && now <= end) {
                    statusBadge = { bg: '#dcfce7', color: '#15803d', text: 'نشط الآن' }
                  } else {
                    statusBadge = { bg: '#fee2e2', color: '#b91c1c', text: 'مغلق' }
                  }

                  return (
                    <div key={quiz.id} style={{ border: `1px solid ${selectedQuiz?.id === quiz.id ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '8px', padding: '15px', cursor: 'pointer', transition: 'all 0.2s', background: selectedQuiz?.id === quiz.id ? '#eff6ff' : 'white' }} onClick={() => handleViewSubmissions(quiz)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem' }}>{quiz.title}</h4>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', background: statusBadge.bg, color: statusBadge.color }}>
                          {statusBadge.text}
                        </span>
                      </div>
                      <div style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={13} color="#10b981" /> يبدأ: {formatDateTime(quiz.start_time)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={13} color="#ef4444" /> ينتهي: {formatDateTime(quiz.end_time)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4338ca', fontWeight: 'bold' }}>
                          <ListChecks size={13} color="#4338ca" /> عدد الأسئلة: {quiz.questions_count !== undefined ? quiz.questions_count : 0} سؤال
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button onClick={(e) => { e.stopPropagation(); setManagingQuiz(quiz); }} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Settings size={14} /> إدارة الأسئلة
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleCopyLink(quiz.id); }} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Copy size={14} /> الرابط
                        </button>
                        <button onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditFormData({ 
                            title: quiz.title, 
                            start_time: toLocalInputFormat(quiz.start_time), 
                            end_time: toLocalInputFormat(quiz.end_time) 
                          }); 
                          setEditingQuiz(quiz); 
                        }} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Edit size={14} /> تعديل
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz.id); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div style={{ flex: '2 1 400px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            {selectedQuiz ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Users size={20} /> نتائج المتقدمين
                  </h3>
                  <button onClick={handleExportCSV} disabled={submissions.length === 0} style={{ background: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Download size={14} /> تصدير Excel
                  </button>
                </div>
                
                {submissions.length === 0 ? <p style={{ color: '#64748b' }}>لم يقم أي طالب بتقديم هذا الاختبار حتى الآن.</p> : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                          <th style={{ padding: '10px' }}>اسم الطالب</th>
                          <th style={{ padding: '10px' }}>الدرجة</th>
                          <th style={{ padding: '10px' }}>وقت التسليم</th>
                          <th style={{ padding: '10px' }}>إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map(sub => (
                          <tr key={sub.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{sub.student_name}</td>
                            <td style={{ padding: '10px' }}>
                              <span style={{ background: (sub.score / sub.total_questions) >= 0.5 ? '#dcfce7' : '#fee2e2', color: (sub.score / sub.total_questions) >= 0.5 ? '#166534' : '#991b1b', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                {sub.score} / {sub.total_questions}
                              </span>
                            </td>
                            <td style={{ padding: '10px', fontSize: '0.85rem', color: '#64748b' }}>
                              {new Date(sub.submitted_at).toLocaleString('ar-EG')}
                            </td>
                            <td style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                              <button onClick={async () => {
                                const { data: qs } = await supabase.from('quiz_questions').select('*').eq('quiz_id', selectedQuiz.id);
                                if (qs) setViewingAnswers({ sub, questions: qs });
                              }} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>عرض الحل</button>
                              <button onClick={() => handleDeleteSubmission(sub.id)} style={{ background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: '10px' }}>
                <FileText size={48} />
                <p>اختر اختباراً من القائمة لعرض تفاصيله ونتائجه</p>
              </div>
            )}
          </div>
        </div>
      )}

      {managingQuiz && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: '800px', borderRadius: '12px', padding: '25px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setManagingQuiz(null)} style={{ position: 'absolute', top: '15px', left: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>إضافة أسئلة: {managingQuiz.title}</h2>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => setManageTab('list')} style={{ padding: '8px 16px', background: manageTab === 'list' ? '#3b82f6' : '#f1f5f9', color: manageTab === 'list' ? 'white' : '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ListChecks size={16} /> الأسئلة الحالية ({quizQuestions.length})
              </button>
              <button onClick={() => { if(!isPremium) setShowPaywall(true); else setManageTab('ai') }} style={{ padding: '8px 16px', background: false ? '#8b5cf6' : '#f5f3ff', color: false ? 'white' : '#7c3aed', border: '1px solid #8b5cf6', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bot size={16} style={{display:'none'}} /> {!isPremium && <Lock size={14} />}
              </button>
              <button onClick={() => setManageTab('manual')} style={{ padding: '8px 16px', background: manageTab === 'manual' ? '#3b82f6' : '#f1f5f9', color: manageTab === 'manual' ? 'white' : '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>+ سؤال يدوي</button>
              <button onClick={() => setManageTab('paste')} style={{ padding: '8px 16px', background: manageTab === 'paste' ? '#3b82f6' : '#f1f5f9', color: manageTab === 'paste' ? 'white' : '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>لصق نص CSV</button>
              <button onClick={() => setManageTab('upload')} style={{ padding: '8px 16px', background: manageTab === 'upload' ? '#3b82f6' : '#f1f5f9', color: manageTab === 'upload' ? 'white' : '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>رفع ملف Excel</button>
            </div>

            {manageTab === 'list' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ListChecks size={22} color="#3b82f6" /> قائمة الأسئلة الحالية في هذا الاختبار ({quizQuestions.length} سؤال)
                  </h3>
                  {quizQuestions.length > 0 && (
                    <button 
                      onClick={handleDeleteAllQuestions} 
                      style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                    >
                      <Trash2 size={15} /> حذف جميع الأسئلة
                    </button>
                  )}
                </div>

                {loadingQuestions ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
                    <p>جاري تحميل الأسئلة...</p>
                  </div>
                ) : quizQuestions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1' }}>
                    <FileText size={48} color="#94a3b8" style={{ marginBottom: '10px' }} />
                    <h4 style={{ margin: '0 0 8px 0', color: '#334155' }}>لا توجد أي أسئلة مضافة في هذا الاختبار بعد!</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
                      يمكنك تحديد أي عدد تريده من الأسئلة وتوليده فوراً بالذكاء الاصطناعي، أو إدخال الأسئلة يدوياً أو رفعها.
                    </p>
                    <button 
                      style={{display: 'none'}} 
                      style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Bot size={18} /> توليد أي عدد من الأسئلة بالذكاء الاصطناعي ⚡
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {quizQuestions.map((q, idx) => (
                      <div key={q.id || idx} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '15px', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1e293b' }}>
                            <span style={{ color: '#3b82f6', marginLeft: '6px' }}>#{idx + 1}</span> {q.question_text}
                          </div>
                          <button 
                            onClick={() => handleDeleteQuestion(q.id)} 
                            title="حذف هذا السؤال"
                            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', flexShrink: 0 }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Options */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: q.explanation ? '10px' : 0 }}>
                          {(q.options || []).map((opt, optIdx) => {
                            const isCorrect = String(opt).trim() === String(q.correct_answer).trim();
                            return (
                              <div 
                                key={optIdx} 
                                style={{ 
                                  padding: '8px 12px', borderRadius: '6px', 
                                  background: isCorrect ? '#ecfdf5' : '#f8fafc', 
                                  border: `1.5px solid ${isCorrect ? '#10b981' : '#e2e8f0'}`,
                                  color: isCorrect ? '#065f46' : '#475569',
                                  fontSize: '0.88rem', fontWeight: isCorrect ? 'bold' : 'normal',
                                  display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                              >
                                {isCorrect ? <CheckCircle2 size={16} color="#10b981" /> : <span style={{ color: '#94a3b8' }}>○</span>}
                                {opt}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div style={{ fontSize: '0.82rem', color: '#64748b', background: '#f1f5f9', padding: '6px 10px', borderRadius: '6px', marginTop: '8px' }}>
                            💡 <strong>الشرح:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {manageTab === 'manual' && (
              <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>نص السؤال *</label>
                  <textarea required rows="2" value={manualQ.q} onChange={e => setManualQ({...manualQ, q: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}></textarea>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>الخيار أ *</label>
                    <input required type="text" value={manualQ.a} onChange={e => setManualQ({...manualQ, a: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>الخيار ب *</label>
                    <input required type="text" value={manualQ.b} onChange={e => setManualQ({...manualQ, b: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>الخيار ج</label>
                    <input type="text" value={manualQ.c} onChange={e => setManualQ({...manualQ, c: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>الخيار د</label>
                    <input type="text" value={manualQ.d} onChange={e => setManualQ({...manualQ, d: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#166534' }}>الإجابة الصحيحة * (يجب أن تطابق أحد الخيارات تماماً)</label>
                  <input required type="text" value={manualQ.correct} onChange={e => setManualQ({...manualQ, correct: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #4ade80' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>شرح إضافي يظهر للطالب (اختياري)</label>
                  <textarea rows="2" value={manualQ.exp} onChange={e => setManualQ({...manualQ, exp: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}></textarea>
                </div>
                <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>حفظ السؤال</button>
              </form>
            )}

            {manageTab === 'paste' && (
              <div>
                <p style={{ marginBottom: '10px', color: '#64748b' }}>الصق الأسئلة بصيغة CSV (قيم مفصولة بفواصل) بحيث يكون كل سؤال في سطر منفصل.</p>
                <button onClick={copyTemplateToClipboard} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' }}>نسخ القالب المطلوب</button>
                <textarea rows="10" value={pasteText} onChange={e => setPasteText(e.target.value)} placeholder='"السؤال","خيار 1","خيار 2","خيار 3","خيار 4","الإجابة الصحيحة","شرح إضافي"' style={{ width: '100%', padding: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'monospace', direction: 'ltr' }}></textarea>
                <button onClick={handlePasteSubmit} disabled={uploadingCsv} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', width: '100%' }}>
                  {uploadingCsv ? 'جاري المعالجة...' : 'اعتماد الأسئلة'}
                </button>
              </div>
            )}

            {manageTab === 'upload' && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <FileText size={48} color="#94a3b8" style={{ marginBottom: '15px' }} />
                <p style={{ marginBottom: '20px', color: '#64748b' }}>ارفع ملف CSV يحتوي على الأسئلة والخيارات.</p>
                <button onClick={copyTemplateToClipboard} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}>نسخ قالب الملف أولاً</button>
                <br/>
                <label style={{ display: 'inline-block', background: '#4f46e5', color: 'white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  اختيار الملف
                  <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => handleUploadCSV(e, managingQuiz.id)} disabled={uploadingCsv} />
                </label>
                {uploadingCsv && <p style={{ marginTop: '10px', color: '#3b82f6' }}>جاري الرفع والمعالجة...</p>}
              </div>
            )}

            {false && (
              <div style={{ padding: '20px', background: '#f5f3ff', borderRadius: '12px', border: '2px solid #ede9fe' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ margin: 0, color: '#6d28d9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={24} /> المساعد الذكي لتوليد أسئلة الاختبار
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#7c3aed', background: '#ede9fe', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                    حدد أي عدد تريده من الأسئلة بدقة
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                  {/* عدد الأسئلة */}
                  <div style={{ background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #c4b5fd' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#6d28d9', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      عدد الأسئلة المطلوب: <span style={{ color: '#059669', fontSize: '1.1rem' }}>{aiNumQuestions} سؤال</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <input 
                        type="number" min="1" max="100" value={aiNumQuestions} 
                        onChange={e => setAiNumQuestions(Math.max(1, parseInt(e.target.value) || 1))} 
                        style={{ width: '85px', padding: '8px', borderRadius: '6px', border: '2px solid #8b5cf6', fontWeight: 'bold', textAlign: 'center', fontSize: '1.1rem', outline: 'none' }} 
                      />
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>أو اختر عدداً سريعاً:</span>
                    </div>
                    {/* Quick chips */}
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {[5, 10, 15, 20, 25, 30, 40, 50].map(cnt => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setAiNumQuestions(cnt)}
                          style={{
                            padding: '4px 8px', borderRadius: '6px',
                            border: aiNumQuestions === cnt ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                            background: aiNumQuestions === cnt ? '#7c3aed' : '#f8fafc',
                            color: aiNumQuestions === cnt ? 'white' : '#475569',
                            fontWeight: 'bold', fontSize: '0.78rem', cursor: 'pointer', transition: '0.2s'
                          }}
                        >
                          {cnt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* نوع الأسئلة */}
                  <div style={{ background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #c4b5fd' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#6d28d9', fontWeight: 'bold', fontSize: '0.9rem' }}>نوع الأسئلة</label>
                    <select value={aiQuizType} onChange={e => setAiQuizType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #c4b5fd', fontFamily: 'inherit', fontWeight: 'bold' }}>
                      <option value="اختيار من متعدد">اختيار من متعدد (4 خيارات مع إجابة صحيحة)</option>
                      <option value="صح وخطأ">صح وخطأ</option>
                      <option value="استنتاجية وفهم عميق">استنتاجية وفهم عميق</option>
                      <option value="تطبيقية ومتنوعة">تطبيقية ومتنوعة</option>
                    </select>
                  </div>

                  {/* المستوى */}
                  <div style={{ background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #c4b5fd' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#6d28d9', fontWeight: 'bold', fontSize: '0.9rem' }}>مستوى الصعوبة</label>
                    <select value={aiDifficulty} onChange={e => setAiDifficulty(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #c4b5fd', fontFamily: 'inherit', fontWeight: 'bold' }}>
                      <option value="سهل">سهل</option>
                      <option value="متوسط">متوسط</option>
                      <option value="صعب">صعب</option>
                      <option value="متدرج (من السهل للصعب)">متدرج (من السهل للصعب)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#4c1d95', fontWeight: 'bold' }}>
                    اكتب موضوع الدرس، المنهج، أو الصق محتوى لإنشاء الأسئلة منه:
                  </label>
                  <textarea 
                    placeholder="مثال: كان وأخواتها للصف الأول الإعدادي، أو درس قراءة محدد، أو الصق نص فقرة وسيقوم الذكاء بتوليد الأسئلة فوراً..." 
                    value={aiPrompt} 
                    onChange={e => setAiPrompt(e.target.value)} 
                    style={{ width: '100%', height: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #c4b5fd', fontFamily: 'inherit', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => handleAiGenerate(true)} 
                    disabled={!aiPrompt.trim() || aiLoading} 
                    style={{ 
                      flex: '1 1 200px',
                      background: 'linear-gradient(135deg, #10b981, #059669)', 
                      color: 'white', padding: '12px 20px', borderRadius: '8px', border: 'none', 
                      cursor: aiPrompt.trim() ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '1rem', 
                      opacity: (!aiPrompt.trim() || aiLoading) ? 0.7 : 1, 
                      display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                    {aiLoading ? 'جاري الصياغة...' : `توليد وإضافة ${aiNumQuestions} سؤال للاختبار مباشرة ⚡`}
                  </button>

                  <button 
                    onClick={() => handleAiGenerate(false)} 
                    disabled={!aiPrompt.trim() || aiLoading} 
                    style={{ 
                      flex: '1 1 180px',
                      background: 'white', color: '#6d28d9', border: '2px solid #8b5cf6',
                      padding: '12px 20px', borderRadius: '8px', 
                      cursor: aiPrompt.trim() ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '0.95rem', 
                      opacity: (!aiPrompt.trim() || aiLoading) ? 0.7 : 1, 
                      display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center'
                    }}
                  >
                    <Sparkles size={18} />
                    معاينة الأسئلة قبل الاعتماد 📝
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

      {editingQuiz && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: '500px', borderRadius: '12px', padding: '25px', position: 'relative' }}>
            <button onClick={() => setEditingQuiz(null)} style={{ position: 'absolute', top: '15px', left: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>تعديل أوقات الاختبار</h2>
            <form onSubmit={handleUpdateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>عنوان الاختبار</label>
                <input type="text" required value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>وقت البدء</label>
                <input type="datetime-local" required value={editFormData.start_time} onChange={e => setEditFormData({...editFormData, start_time: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>وقت الغلق</label>
                <input type="datetime-local" required value={editFormData.end_time} onChange={e => setEditFormData({...editFormData, end_time: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <button type="submit" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                حفظ التعديلات
              </button>
            </form>
          </div>
        </div>
      )}

      {viewingAnswers && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: '700px', borderRadius: '12px', padding: '25px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setViewingAnswers(null)} style={{ position: 'absolute', top: '15px', left: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            <h2 style={{ marginBottom: '10px', color: '#1e293b' }}>إجابات: {viewingAnswers.sub.student_name}</h2>
            <div style={{ marginBottom: '20px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>
              النتيجة: {viewingAnswers.sub.score} / {viewingAnswers.sub.total_questions}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {viewingAnswers.questions.map((q, idx) => {
                const studentAns = viewingAnswers.sub.answers && viewingAnswers.sub.answers[q.id];
                const isCorrect = studentAns === q.correct_answer;
                return (
                  <div key={q.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', background: isCorrect ? '#f0fdf4' : '#fef2f2' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#334155' }}>{idx + 1}. {q.question_text}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.95rem' }}>
                      <div><span style={{ fontWeight: 'bold' }}>إجابة الطالب: </span> 
                        <span style={{ color: isCorrect ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>{studentAns || 'لم يجب'}</span>
                      </div>
                      {!isCorrect && (
                        <div><span style={{ fontWeight: 'bold' }}>الإجابة الصحيحة: </span> 
                          <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{q.correct_answer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
