'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'
import { FileText, Plus, Upload, Trash2, Link as LinkIcon, RefreshCw, Eye, Download, Edit3, Type, ClipboardPaste, Lock, Crown } from 'lucide-react'
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', start_time: '', end_time: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [submissions, setSubmissions] = useState([])
  
  const [uploadingCsv, setUploadingCsv] = useState(false)
  
  // Question Management Modal States
  const [managingQuiz, setManagingQuiz] = useState(null)
  const [manageTab, setManageTab] = useState('manual') // 'manual', 'paste', 'upload'
  
  const [manualQ, setManualQ] = useState({ q: '', a: '', b: '', c: '', d: '', correct: '', exp: '' })
  const [pasteText, setPasteText] = useState('')
  
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false })
    if (data) setQuizzes(data)
    setLoading(false)
  }

  const handleCreateQuiz = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const { data, error } = await supabase.from('quizzes').insert([
      { 
        title: formData.title, 
        start_time: new Date(formData.start_time).toISOString(), 
        end_time: new Date(formData.end_time).toISOString() 
      }
    ]).select()
    
    if (error) {
      alert('خطأ أثناء إنشاء الاختبار')
    } else {
      setQuizzes([data[0], ...quizzes])
      setShowForm(false)
      setFormData({ title: '', start_time: '', end_time: '' })
    }
    setIsSubmitting(false)
  }

  const handleDeleteQuiz = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاختبار؟ (سيتم حذف أسئلته وإجابات الطلاب أيضاً)')) return
    await supabase.from('quizzes').delete().eq('id', id)
    setQuizzes(quizzes.filter(q => q.id !== id))
    if (selectedQuiz?.id === id) setSelectedQuiz(null)
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
        currentCell += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        currentRow.push(currentCell.trim());
        if (currentRow.some(cell => cell !== '')) rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    
    if (currentCell !== '' || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell !== '')) rows.push(currentRow);
    }
    return rows;
  }
  
  const processCSVData = async (text, quizId) => {
    try {
      const rows = parseCSV(text)
      
      if (rows.length > 0 && (rows[0][0].includes('السؤال') || rows[0][0].toLowerCase().includes('question'))) {
        rows.shift()
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
          explanation: row[6] || ''
        }
      }).filter(q => q !== null)

      if (questions.length === 0) {
        alert('لم يتم العثور على أسئلة صالحة في البيانات المقدمة.')
        return false
      }

      const { error } = await supabase.from('quiz_questions').insert(questions)
      if (error) {
        console.error(error)
        alert('خطأ أثناء حفظ الأسئلة')
        return false
      } else {
        alert(`تم حفظ ${questions.length} سؤال بنجاح!`)
        return true
      }
    } catch (err) {
      console.error(err)
      alert('خطأ في معالجة البيانات')
      return false
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
        setManagingQuiz(null)
      }
      setUploadingCsv(false)
      e.target.value = null
    }
    reader.readAsText(file)
  }
  
  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) return
    setUploadingCsv(true)
    const success = await processCSVData(pasteText, managingQuiz.id)
    if (success) {
      setPasteText('')
      setManagingQuiz(null)
    }
    setUploadingCsv(false)
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!manualQ.correct) {
      alert('يرجى تحديد الإجابة الصحيحة بالضبط كما كتبتها في الخيارات')
      return
    }
    
    setUploadingCsv(true)
    const options = [manualQ.a, manualQ.b, manualQ.c, manualQ.d].filter(o => o.trim() !== '')
    
    const { error } = await supabase.from('quiz_questions').insert([{
      quiz_id: managingQuiz.id,
      question_text: manualQ.q,
      options: options,
      correct_answer: manualQ.correct,
      explanation: manualQ.exp
    }])
    
    if (error) {
      alert('حدث خطأ أثناء إضافة السؤال')
    } else {
      alert('تمت إضافة السؤال بنجاح!')
      setManualQ({ q: '', a: '', b: '', c: '', d: '', correct: '', exp: '' })
    }
    setUploadingCsv(false)
  }

  const handleViewSubmissions = async (quiz) => {
    setSelectedQuiz(quiz)
    const { data } = await supabase.from('quiz_submissions').select('*').eq('quiz_id', quiz.id).order('score', { ascending: false })
    if (data) setSubmissions(data)
  }

  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    const BOM = "\uFEFF";
    let csv = BOM + 'اسم الطالب,النتيجة,تاريخ التسليم\n';
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
    const template = 'السؤال,خيار أ,خيار ب,خيار ج,خيار د,الإجابة الصحيحة,السبب أو التبرير\n"كم عدد الكواكب في المجموعة الشمسية؟","8","9","7","10","8","بلوتو لم يعد يُصنف ككوكب رئيسي"';
    navigator.clipboard.writeText(template)
    alert('تم نسخ النموذج! يمكنك لصقه في إكسيل أو نوت باد وتعديله.')
  }

  return (
    <div className={styles?.card || ''} style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FileText /> إدارة الاختبارات المؤقتة</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => {
              if (quizzes.length >= 1) {
                setShowPaywall(true)
              } else {
                setShowForm(!showForm)
              }
            }}
            style={{ background: quizzes.length >= 1 ? '#eab308' : '#3b82f6', color: quizzes.length >= 1 ? '#422006' : 'white', padding: '10px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}
          >
            {quizzes.length >= 1 ? <><Crown size={18} /> ترقية لإنشاء المزيد</> : <><Plus size={18} /> إنشاء اختبار جديد</>}
          </button>
        </div>
      </div>

      {showPaywall && (
        <div style={{ background: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)', padding: '25px', borderRadius: '12px', marginBottom: '20px', border: '2px solid #fde047', textAlign: 'center' }}>
          <Crown size={48} color="#ca8a04" style={{ marginBottom: '10px' }} />
          <h2 style={{ color: '#854d0e', marginBottom: '10px' }}>وصلت للحد الأقصى للاختبارات المجانية!</h2>
          <p style={{ color: '#713f12', fontSize: '1.1rem', marginBottom: '20px' }}>
            لقد استمتعت بتجربة مجانية بإنشاء اختبار واحد. لإنشاء عدد لا محدود من الاختبارات الاحترافية، يرجى الترقية والاشتراك في الباقة المدفوعة.
          </p>
          <button onClick={() => setShowPaywall(false)} style={{ background: '#ca8a04', color: 'white', padding: '10px 30px', borderRadius: '30px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
            حسناً، فهمت
          </button>
        </div>
      )}

      {showForm && !showPaywall && (
        <form onSubmit={handleCreateQuiz} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>عنوان الاختبار</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>موعد الفتح</label>
              <input required type="datetime-local" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>موعد الإغلاق</label>
              <input required type="datetime-local" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>
          <button disabled={isSubmitting} type="submit" style={{ background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ الاختبار'}
          </button>
        </form>
      )}

      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '12px' }}>عنوان الاختبار</th>
                <th style={{ padding: '12px' }}>يبدأ</th>
                <th style={{ padding: '12px' }}>ينتهي</th>
                <th style={{ padding: '12px' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(quiz => {
                const now = new Date()
                const start = new Date(quiz.start_time)
                const end = new Date(quiz.end_time)
                let statusColor = '#64748b' // Default
                if (now < start) statusColor = '#eab308' // Pending
                else if (now >= start && now <= end) statusColor = '#22c55e' // Active
                else statusColor = '#ef4444' // Closed

                return (
                  <tr key={quiz.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                      <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: statusColor, marginRight: '8px' }}></span>
                      {quiz.title}
                    </td>
                    <td style={{ padding: '12px' }} dir="ltr">{start.toLocaleString('ar-EG')}</td>
                    <td style={{ padding: '12px' }} dir="ltr">{end.toLocaleString('ar-EG')}</td>
                    <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleCopyLink(quiz.id)} title="نسخ الرابط" style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}><LinkIcon size={16} /></button>
                      
                      <button onClick={() => setManagingQuiz(quiz)} title="إدارة وإضافة الأسئلة" style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Edit3 size={16} /> إدارة الأسئلة
                      </button>

                      <button onClick={() => handleViewSubmissions(quiz)} title="عرض النتائج" style={{ background: '#dcfce7', color: '#16a34a', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}><Eye size={16} /></button>
                      
                      <button onClick={() => handleDeleteQuiz(quiz.id)} title="حذف" style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Submissions Section */}
      {selectedQuiz && (
        <div style={{ marginTop: '30px', borderTop: '2px dashed #cbd5e1', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>نتائج اختبار: {selectedQuiz.title}</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleExportCSV} disabled={submissions.length === 0} style={{ background: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Download size={14} /> تصدير Excel
              </button>
              <button onClick={() => handleViewSubmissions(selectedQuiz)} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <RefreshCw size={14} /> تحديث
              </button>
            </div>
          </div>
          
          {submissions.length === 0 ? (
            <p style={{ color: '#64748b' }}>لم يقم أي طالب بحل الاختبار بعد.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '10px' }}>اسم الطالب</th>
                  <th style={{ padding: '10px' }}>النتيجة</th>
                  <th style={{ padding: '10px' }}>وقت التسليم</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{sub.student_name}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ background: sub.score >= sub.total_questions / 2 ? '#dcfce7' : '#fee2e2', color: sub.score >= sub.total_questions / 2 ? '#16a34a' : '#ef4444', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                        {sub.score} / {sub.total_questions}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }} dir="ltr">{new Date(sub.submitted_at).toLocaleString('ar-EG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Manage Questions Modal */}
      {managingQuiz && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: '800px', borderRadius: '12px', padding: '25px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setManagingQuiz(null)} style={{ position: 'absolute', top: '15px', left: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✖</button>
            
            <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>إدارة أسئلة: {managingQuiz.title}</h2>
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
              <button onClick={() => setManageTab('manual')} style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: manageTab === 'manual' ? '3px solid #3b82f6' : 'none', fontWeight: manageTab === 'manual' ? 'bold' : 'normal', color: manageTab === 'manual' ? '#3b82f6' : '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}><Type size={18}/> إدخال يدوي</button>
              <button onClick={() => setManageTab('paste')} style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: manageTab === 'paste' ? '3px solid #3b82f6' : 'none', fontWeight: manageTab === 'paste' ? 'bold' : 'normal', color: manageTab === 'paste' ? '#3b82f6' : '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}><ClipboardPaste size={18}/> لصق نص CSV</button>
              <button onClick={() => setManageTab('upload')} style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: manageTab === 'upload' ? '3px solid #3b82f6' : 'none', fontWeight: manageTab === 'upload' ? 'bold' : 'normal', color: manageTab === 'upload' ? '#3b82f6' : '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}><Upload size={18}/> رفع ملف</button>
            </div>

            {/* Manual Tab */}
            {manageTab === 'manual' && (
              <form onSubmit={handleManualSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>نص السؤال *</label>
                  <textarea required rows="2" value={manualQ.q} onChange={e => setManualQ({...manualQ, q: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}></textarea>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
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

                <div style={{ marginBottom: '15px', background: '#dcfce7', padding: '10px', borderRadius: '6px', border: '1px solid #86efac' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#166534' }}>الإجابة الصحيحة * (انسخها من الخيارات والصقها هنا)</label>
                  <input required type="text" value={manualQ.correct} onChange={e => setManualQ({...manualQ, correct: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #4ade80' }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>السبب العلمي أو التبرير (اختياري، يظهر للطالب بعد التسليم)</label>
                  <textarea rows="2" value={manualQ.exp} onChange={e => setManualQ({...manualQ, exp: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}></textarea>
                </div>

                <button disabled={uploadingCsv} type="submit" style={{ background: '#3b82f6', color: 'white', padding: '12px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '1.1rem' }}>
                  {uploadingCsv ? 'جاري الحفظ...' : 'حفظ وإضافة سؤال آخر'}
                </button>
              </form>
            )}

            {/* Paste Tab */}
            {manageTab === 'paste' && (
              <div>
                <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #bfdbfe' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>طريقة الاستخدام:</h4>
                  <p style={{ margin: '0 0 10px 0', color: '#3b82f6', fontSize: '0.9rem' }}>انسخ النموذج بالضغط على الزر، جهزه في Excel أو Notepad، ثم انسخ كل البيانات مرة أخرى والصقها في المربع أدناه.</p>
                  <button onClick={copyTemplateToClipboard} style={{ background: '#2563eb', color: 'white', padding: '8px 15px', borderRadius: '4px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                    <ClipboardPaste size={14} /> نسخ النموذج الافتراضي
                  </button>
                </div>
                
                <textarea 
                  placeholder="الصق بيانات CSV هنا..." 
                  value={pasteText} 
                  onChange={e => setPasteText(e.target.value)} 
                  style={{ width: '100%', height: '250px', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px', direction: 'ltr', fontFamily: 'monospace' }}
                />
                
                <button onClick={handlePasteSubmit} disabled={!pasteText.trim() || uploadingCsv} style={{ background: '#10b981', color: 'white', padding: '12px 20px', borderRadius: '6px', border: 'none', cursor: pasteText.trim() ? 'pointer' : 'not-allowed', fontWeight: 'bold', width: '100%', fontSize: '1.1rem', opacity: pasteText.trim() ? 1 : 0.5 }}>
                  {uploadingCsv ? 'جاري المعالجة...' : 'حفظ الأسئلة المُدخلة'}
                </button>
              </div>
            )}

            {/* Upload Tab */}
            {manageTab === 'upload' && (
              <div style={{ textAlign: 'center', padding: '40px', border: '2px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc' }}>
                <Upload size={48} color="#94a3b8" style={{ marginBottom: '15px' }} />
                <h3 style={{ marginBottom: '10px', color: '#475569' }}>رفع ملف CSV جاهز</h3>
                <label style={{ display: 'inline-block', background: '#4f46e5', color: 'white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  اختيار الملف
                  <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => handleUploadCSV(e, managingQuiz.id)} disabled={uploadingCsv} />
                </label>
                {uploadingCsv && <p style={{ marginTop: '10px', color: '#3b82f6' }}>جاري الرفع...</p>}
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  )
}
