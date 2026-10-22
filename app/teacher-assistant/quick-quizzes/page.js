'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import { supabase } from '../../../utils/supabase'
import styles from './page.module.css'
import { Plus, Save, Play, Trash2, CheckCircle2, Copy, Users, Activity, Edit, RefreshCw } from 'lucide-react'

export default function QuickQuizzes() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [teacher, setTeacher] = useState(null)
  
  // View Modes: 'builder' | 'live'
  const [viewMode, setViewMode] = useState('builder')
  
  // Builder State
  const [editingQuizId, setEditingQuizId] = useState(null)
  const [quizTitle, setQuizTitle] = useState('')
  const [questions, setQuestions] = useState([])
  const [qText, setQText] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(0)
  
  // Saved Quizzes
  const [savedQuizzes, setSavedQuizzes] = useState([])
  const [saving, setSaving] = useState(false)

  // Live State
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [viewingAnswers, setViewingAnswers] = useState(null)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    fetchTeacherData()
  }, [])

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

      const now = new Date()
      const subEndDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null
      const isSubscribed = profile.status === 'approved' && (!subEndDate || subEndDate > now)
      
      if (profile?.role !== 'admin' && profile?.role !== 'assistant' && !isSubscribed) {
        setIsPremium(false)
      } else {
        setIsPremium(true)
      }
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
      setTeacher({ id: finalId, role: profile?.role })
      await fetchSavedQuizzes(finalId, profile?.role)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedQuizzes = async (teacherId, role) => {
    let query = supabase.from('teacher_quizzes').select('*');
    if (role !== 'admin' && role !== 'assistant') {
      query = query.eq('teacher_id', teacherId);
    }
    const { data } = await query.order('created_at', { ascending: false });
    if (data) setSavedQuizzes(data);
  }

  const handleAddQuestion = () => {
    if (!qText.trim() || options.some(o => !o.trim())) {
      alert('الرجاء إدخال نص السؤال وجميع الخيارات الأربعة!')
      return
    }
    const newQ = {
      id: Date.now().toString(),
      text: qText.trim(),
      options: options.map(o => o.trim()),
      correctIndex
    }
    setQuestions([...questions, newQ])
    setQText('')
    setOptions(['', '', '', ''])
    setCorrectIndex(0)
  }

  const handleSaveQuiz = async () => {
    if (!quizTitle.trim()) { alert('الرجاء إدخال اسم الاختبار!'); return; }
    if (questions.length === 0) { alert('أضف سؤالاً واحداً على الأقل!'); return; }

    setSaving(true)
    try {
      const payload = {
        teacher_id: teacher.id,
        title: quizTitle.trim(),
        questions,
        is_active: true
      }
      const { error } = await supabase.from('teacher_quizzes').insert([payload])
      if (error) throw error
      alert('✅ تم حفظ الاختبار بنجاح!')
      setQuizTitle('')
      setQuestions([])
      fetchSavedQuizzes(teacher.id, teacher.role)
    } catch (e) {
      alert('❌ حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

      const handleEditQuiz = (q) => {
      setEditingQuizId(q.id)
      setQuizTitle(q.title)
      setQuestions(q.questions || [])
      setViewMode('builder')
    }

    const handleResetSubmissions = async (quizId) => {
      if (!confirm("تحذير ⚠️: هل أنت متأكد أنك تريد مسح جميع إجابات ودرجات الطلاب القديمة لهذا الاختبار؟ (هذا الإجراء لا يمكن التراجع عنه)")) return;
      try {
        const { error } = await supabase.from('quiz_submissions').delete().eq('quiz_id', quizId);
        if (error) throw error;
        alert("تم مسح بيانات الطلاب القديمة بنجاح! يمكنك الآن استخدام الاختبار من جديد.");
        if (activeQuiz && activeQuiz.id === quizId) setSubmissions([]);
      } catch(e) {
        alert("حدث خطأ أثناء مسح البيانات.");
      }
    }

    const handleDeleteQuiz = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاختبار؟')) return
    await supabase.from('teacher_quizzes').delete().eq('id', id)
    setSavedQuizzes(savedQuizzes.filter(q => q.id !== id))
  }

  const startLiveQuiz = async (quiz) => {
    setActiveQuiz(quiz)
    setSubmissions([])
    setViewMode('live')
    
    // Fetch initial submissions if any
    const { data } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('created_at', { ascending: false })
    if (data) setSubmissions(data)

    // Subscribe to realtime submissions
    const channel = supabase.channel(`quiz_${quiz.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'quiz_submissions', 
        filter: `quiz_id=eq.${quiz.id}` 
      }, (payload) => {
        setSubmissions(prev => [payload.new, ...prev])
      })
      .subscribe()
      
    window.currentQuizChannel = channel
  }

  const stopLiveQuiz = () => {
    if (window.currentQuizChannel) {
      supabase.removeChannel(window.currentQuizChannel)
    }
    setActiveQuiz(null)
    setViewMode('builder')
  }

  const copyLink = () => {
    const link = `${window.location.origin}/quick-quiz?id=${activeQuiz.id}`
    navigator.clipboard.writeText(link)
    alert('تم نسخ الرابط!')
  }

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>جاري التحميل...</div>

  // ─── LIVE DASHBOARD VIEW ───
  if (viewMode === 'live' && activeQuiz) {
    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/quick-quiz?id=${activeQuiz.id}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(link)}`

    return (
      <div className={styles.container}>
        <Head><title>النتائج المباشرة | {activeQuiz.title}</title></Head>
        
        <div className={styles.liveDashboard}>
          <div className={styles.liveHeader}>
            <div>
              <h1 style={{margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <Activity color="#38bdf8" /> النتائج المباشرة (Live)
              </h1>
              <h2 style={{margin: 0, color: '#94a3b8'}}>{activeQuiz.title}</h2>
            </div>
            <button className={styles.btnPrimary} style={{width: 'auto', background: '#ef4444'}} onClick={stopLiveQuiz}>
              إغلاق لوحة النتائج
            </button>
          </div>

          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            {/* QR Code Column */}
            <div style={{ textAlign: 'center', background: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155' }}>
              <h3 style={{marginTop: 0}}>امسح الباركود للبدء</h3>
              <div className={styles.qrContainer}>
                <img src={qrUrl} alt="QR Code" width={200} height={200} />
              </div>
              <div style={{ marginTop: '15px' }}>
                <button className={styles.copyBtn} onClick={copyLink} style={{width: '100%', justifyContent: 'center'}}>
                  <Copy size={16} /> نسخ رابط الاختبار
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '10px' }}>
                لا يحتاج الطلاب إلى تسجيل دخول
              </p>
            </div>

            {/* Submissions Column */}
            <div style={{ flex: 1 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                <Users /> التسليمات ({submissions.length})
              </h3>
              
              {submissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                  <div className={styles.loader}></div>
                  <p>في انتظار تسليمات الطلاب...</p>
                </div>
              ) : (
                <div className={styles.submissionsGrid}>
                  {submissions.map(sub => (
                    <div key={sub.id} className={styles.submissionCard}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>👤 {sub.student_name}</div>
                      <div className={`${styles.scorePill} ${sub.score < (sub.total_questions || sub.total) / 2 ? styles.low : ''}`}>
                        {sub.score} / {sub.total_questions || sub.total}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── BUILDER VIEW ───
  return (
    <>
      <Head><title>الاختبارات السريعة | مساعد المعلم</title></Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>⚡ صانع الاختبارات السريعة بالباركود</h1>
          <p>صمم اختباراً في ثوانٍ، اعرض الباركود، وشاهد درجات الطلاب تتدفق لحظياً!</p>
        </header>

        {!isPremium ? (
          <div style={{ textAlign: 'center', padding: '50px', background: 'var(--bg-card)', borderRadius: '15px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#dc2626', marginBottom: '15px' }}>🔒 أداة مدفوعة</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '1.1rem' }}>هذه الأداة متاحة فقط في النسخة المدفوعة (البريميوم). قم بترقية حسابك للوصول إليها.</p>
            <Link href="/pricing" style={{ background: '#059669', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
              الترقية للنسخة المدفوعة 💎
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            
            {/* Builder */}
          <div>
            <div className={styles.panel}>
              <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>بناء اختبار جديد</h2>
              
              <div className={styles.formGroup}>
                <label>عنوان الاختبار</label>
                <input 
                  type="text" className={styles.input}
                  value={quizTitle} onChange={e => setQuizTitle(e.target.value)}
                  placeholder="مثال: اختبار سريع (الفصل الأول)"
                />
              </div>

              <div className={styles.questionBuilder}>
                <h3 style={{ margin: '0 0 15px 0' }}>إضافة سؤال</h3>
                <input 
                  type="text" className={styles.input} style={{marginBottom: '10px'}}
                  value={qText} onChange={e => setQText(e.target.value)}
                  placeholder="نص السؤال..."
                />
                
                <div className={styles.optionsGrid}>
                  {[0,1,2,3].map(i => (
                    <div key={i} className={styles.optionWrapper} style={{ borderColor: correctIndex === i ? '#10b981' : '#e2e8f0' }}>
                      <input 
                        type="radio" name="correctOption" 
                        className={styles.radioInput}
                        checked={correctIndex === i}
                        onChange={() => setCorrectIndex(i)}
                      />
                      <input 
                        type="text" className={styles.input} style={{border: 'none', padding: '5px', background: 'transparent'}}
                        value={options[i]}
                        onChange={e => {
                          const newOpts = [...options]; newOpts[i] = e.target.value; setOptions(newOpts);
                        }}
                        placeholder={`الخيار ${i+1}`}
                      />
                    </div>
                  ))}
                </div>
                <p style={{fontSize: '0.8rem', color: '#64748b'}}>* حدد الدائرة بجوار الإجابة الصحيحة</p>

                <button className={styles.btnPrimary} style={{marginTop: '15px', background: '#475569'}} onClick={handleAddQuestion}>
                  <Plus size={18} /> أضف السؤال للاختبار
                </button>
              </div>

              {questions.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4>الأسئلة المضافة ({questions.length}):</h4>
                  {questions.map((q, i) => (
                    <div key={q.id} className={styles.questionPreview}>
                      <div style={{ fontWeight: 'bold' }}>{i+1}. {q.text}</div>
                      <div style={{ fontSize: '0.9rem', color: '#10b981', marginTop: '5px' }}>
                        <CheckCircle2 size={14} style={{verticalAlign:'middle'}}/> الإجابة: {q.options[q.correctIndex]}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button className={styles.btnPrimary} onClick={handleSaveQuiz} disabled={saving}>
                <Save size={20} /> {saving ? 'جاري الحفظ...' : 'حفظ الاختبار'}
              </button>
            </div>
          </div>

            {/* Saved Quizzes */}
            <aside>
              <div className={styles.panel}>
                <h3 style={{ margin: '0 0 15px 0' }}>اختباراتي السابقة</h3>
                {savedQuizzes.length === 0 ? (
                  <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>لا توجد اختبارات.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {savedQuizzes.map(q => (
                      <div key={q.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong style={{display: 'block', marginBottom: '5px'}}>{q.title}</strong>
                          <button onClick={() => handleDeleteQuiz(q.id)} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer'}}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>
                          {q.questions?.length || 0} أسئلة
                        </div>
                        <button className={styles.btnPrimary} style={{padding: '8px', fontSize: '0.9rem'}} onClick={() => startLiveQuiz(q)}>
                          <Play size={16} /> عرض نتائج / باركود
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}
