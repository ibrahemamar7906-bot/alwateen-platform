'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import { supabase } from '../../../utils/supabase'
import styles from './page.module.css'
import RosterManager from '../../components/TeacherAssistant/RosterManager'
import { Save, Calendar, Check, X, Clock, DollarSign, List, Edit2 } from 'lucide-react'

export default function TeacherLedger() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [teacher, setTeacher] = useState(null)
  const [isPremium, setIsPremium] = useState(false)
  
  // Ledger State
  const [sessionName, setSessionName] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [records, setRecords] = useState([])
  const [editingSessionId, setEditingSessionId] = useState(null)
  
  // History State
  const [savedSessions, setSavedSessions] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  // Roster Manager Modal
  const [showRosterManager, setShowRosterManager] = useState(false)

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
      setTeacher({
        name: profile.full_name,
        id: finalId
      })
      
      await fetchSavedSessions(user.id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedSessions = async (teacherId) => {
    setLoadingHistory(true)
    try {
      const { data, error } = await supabase
        .from('teacher_sessions')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('session_date', { ascending: false })
      
      if (!error && data) {
        setSavedSessions(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleImportRoster = (text) => {
    const names = text.split('\n').map(n => n.trim()).filter(n => n !== '')
    const newRecords = names.map((name, index) => ({
      id: index.toString(),
      name,
      attendance: 'present', // present | absent | late
      payment: 'unpaid',     // unpaid | paid
    }))
    setRecords(newRecords)
    setSessionName('') // Reset editing state if importing fresh list
    setEditingSessionId(null)
  }

  const updateRecord = (id, field, value) => {
    setRecords(prev => prev.map(rec => rec.id === id ? { ...rec, [field]: value } : rec))
  }

  const handleSaveSession = async () => {
    if (!sessionName.trim()) {
      alert('الرجاء إدخال اسم للحصة (مثال: الأسبوع الأول - السبت)')
      return
    }
    if (records.length === 0) {
      alert('الرجاء استيراد أسماء الطلاب أولاً')
      return
    }

    try {
      const payload = {
        teacher_id: teacher.id,
        session_name: sessionName.trim(),
        session_date: sessionDate,
        records: records,
        updated_at: new Date().toISOString()
      }

      let res;
      if (editingSessionId) {
        // Update existing
        res = await supabase
          .from('teacher_sessions')
          .update(payload)
          .eq('id', editingSessionId)
      } else {
        // Insert new
        res = await supabase
          .from('teacher_sessions')
          .insert([payload])
      }

      if (res.error) throw res.error

      alert('✅ تم حفظ سجل الحصة بنجاح!')
      fetchSavedSessions(teacher.id)
      
      // Clear form
      setSessionName('')
      setRecords([])
      setEditingSessionId(null)
      setSessionDate(new Date().toISOString().split('T')[0])
    } catch (e) {
      console.error(e)
      alert('❌ حدث خطأ أثناء الحفظ')
    }
  }

  const loadSession = (session) => {
    setEditingSessionId(session.id)
    setSessionName(session.session_name)
    setSessionDate(session.session_date)
    setRecords(session.records)
  }

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>جاري التحميل...</div>

  const presentCount = records.filter(r => r.attendance === 'present').length
  const absentCount = records.filter(r => r.attendance === 'absent').length
  const lateCount = records.filter(r => r.attendance === 'late').length
  const paidCount = records.filter(r => r.payment === 'paid').length

  return (
    <>
      <Head>
        <title>دفتر الحضور والمصروفات | مساعد المعلم</title>
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>📋 دفتر الحضور والمصروفات الذكي</h1>
          <p>سجل غياب وحضور طلابك ومدفوعاتهم بسهولة، مع إمكانية طباعة تقارير فورية.</p>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
            
            {/* Main Ledger Area */}
            <div>
              <div className={styles.panel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={24} color="#3b82f6" />
                    {editingSessionId ? 'تعديل السجل' : 'حصة جديدة'}
                  </h2>
                  <button 
                    onClick={() => setShowRosterManager(true)}
                    style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '8px 15px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    📂 استيراد الأسماء
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className={styles.formGroup} style={{ flex: 2 }}>
                    <label>اسم الحصة / التفاصيل</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={sessionName}
                      onChange={e => setSessionName(e.target.value)}
                      placeholder="مثال: مجموعة السبت - مراجعة الباب الأول"
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>تاريخ الحصة</label>
                    <input 
                      type="date" 
                      className={styles.input} 
                      value={sessionDate}
                      onChange={e => setSessionDate(e.target.value)}
                    />
                  </div>
                </div>

                {records.length > 0 ? (
                  <>
                    {/* Summary Bar */}
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', padding: '10px', background: '#f8fafc', borderRadius: '10px', fontSize: '0.9rem' }}>
                      <div style={{ color: '#334155', fontWeight: 'bold' }}>الإجمالي: {records.length}</div>
                      <div style={{ color: '#16a34a' }}>حاضر: {presentCount}</div>
                      <div style={{ color: '#dc2626' }}>غائب: {absentCount}</div>
                      <div style={{ color: '#ca8a04' }}>متأخر: {lateCount}</div>
                      <div style={{ color: '#2563eb', borderRight: '1px solid #cbd5e1', paddingRight: '15px', marginRight: 'auto' }}>دفع: {paidCount}</div>
                    </div>

                    {/* Table */}
                    <div className={styles.tableWrapper}>
                      <table className={styles.ledgerTable}>
                        <thead>
                          <tr>
                            <th>م</th>
                            <th>اسم الطالب</th>
                            <th style={{ textAlign: 'center' }}>الغياب والحضور</th>
                            <th style={{ textAlign: 'center' }}>الدفع</th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.map((rec, index) => (
                            <tr key={rec.id}>
                              <td style={{ color: '#64748b' }}>{index + 1}</td>
                              <td style={{ fontWeight: 'bold', color: '#0f172a' }}>{rec.name}</td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  className={`${styles.toggleBtn} ${styles.presentBtn} ${rec.attendance === 'present' ? styles.active : ''}`}
                                  onClick={() => updateRecord(rec.id, 'attendance', 'present')}
                                >
                                  <Check size={14} /> حاضر
                                </button>
                                <button 
                                  className={`${styles.toggleBtn} ${styles.absentBtn} ${rec.attendance === 'absent' ? styles.active : ''}`}
                                  onClick={() => updateRecord(rec.id, 'attendance', 'absent')}
                                >
                                  <X size={14} /> غائب
                                </button>
                                <button 
                                  className={`${styles.toggleBtn} ${styles.lateBtn} ${rec.attendance === 'late' ? styles.active : ''}`}
                                  onClick={() => updateRecord(rec.id, 'attendance', 'late')}
                                >
                                  <Clock size={14} /> متأخر
                                </button>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  className={`${styles.toggleBtn} ${styles.paidBtn} ${rec.payment === 'paid' ? styles.active : ''}`}
                                  onClick={() => updateRecord(rec.id, 'payment', 'paid')}
                                >
                                  <DollarSign size={14} /> دفع
                                </button>
                                <button 
                                  className={`${styles.toggleBtn} ${styles.unpaidBtn} ${rec.payment === 'unpaid' ? styles.active : ''}`}
                                  onClick={() => updateRecord(rec.id, 'payment', 'unpaid')}
                                >
                                  <X size={14} /> لم يدفع
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button className={styles.btnPrimary} style={{ marginTop: '20px' }} onClick={handleSaveSession}>
                      <Save size={18} style={{ verticalAlign: 'middle', marginLeft: '8px' }} />
                      حفظ السجل السحابي
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <List size={48} color="#94a3b8" style={{ marginBottom: '15px' }} />
                    <h3 style={{ margin: '0 0 10px 0', color: '#475569' }}>لم يتم إدراج طلاب بعد</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>اضغط على "استيراد الأسماء" لاختيار قائمة محفوظة أو إضافة أسماء جديدة.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar / History */}
            <aside>
              <div className={styles.panel} style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '1.1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                  السجلات السابقة 📜
                </h3>
                
                {loadingHistory ? (
                  <p style={{ fontSize: '0.9rem', color: '#64748b', textAlign: 'center' }}>جاري التحميل...</p>
                ) : savedSessions.length === 0 ? (
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', textAlign: 'center' }}>لا توجد سجلات سابقة.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '500px', overflowY: 'auto' }}>
                    {savedSessions.map(session => (
                      <div key={session.id} className={styles.historyItem} onClick={() => loadSession(session)}>
                        <div>
                          <div className={styles.historyTitle}>{session.session_name}</div>
                          <div className={styles.historyMeta}>
                            {new Date(session.session_date).toLocaleDateString('ar-EG')} • {session.records.length} طالب
                          </div>
                        </div>
                        <Edit2 size={16} color="#3b82f6" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>

          </div>
        )}
      </div>

      {showRosterManager && (
        <RosterManager 
          teacherId={teacher?.id}
          currentList={records.map(r => r.name).join('\n')}
          onImport={handleImportRoster}
          onClose={() => setShowRosterManager(false)}
        />
      )}
    </>
  )
}
