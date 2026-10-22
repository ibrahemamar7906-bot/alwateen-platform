'use client'

import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import styles from './page.module.css'
import { Lock, ArrowRight, Save, FolderOpen, Trash2, Cloud } from 'lucide-react'

export default function ScheduleMaker() {
  const router = useRouter()
  const canvasRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [teacher, setTeacher] = useState(null)
  const [isPremium, setIsPremium] = useState(false)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  const [title, setTitle] = useState('الخطة الأسبوعية - الصف الأول الثانوي')
  const [schedule, setSchedule] = useState({
    saturday: 'مراجعة البلاغة (التشبيه والاستعارة)\nحل تدريبات الملزمة صـ 15',
    sunday: 'حفظ المعاني الجديدة للنص\nقراءة النص قراءة متأنية',
    monday: 'مشاهدة فيديو (كان وأخواتها) على المنصة\nتدوين الملاحظات',
    tuesday: 'حل الواجب الإلكتروني على المنصة',
    wednesday: 'راحة ☕',
    thursday: 'مراجعة شاملة لما تم دراسته هذا الأسبوع\nتجهيز الأسئلة لحصة المراجعة',
    friday: 'الاختبار الأسبوعي الشامل 📝'
  })

  // Cloud Storage State
  const [savedSchedules, setSavedSchedules] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [currentScheduleId, setCurrentScheduleId] = useState(null)
  const [showSavedList, setShowSavedList] = useState(false)

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
      const now = new Date()
      const subEndDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null
      const isSubscribed = profile.status === 'approved' && (!subEndDate || subEndDate > now)
      if (profile?.role !== 'admin' && profile?.role !== 'assistant' && !isSubscribed) {
        setIsPremium(false)
      } else {
        setIsPremium(true)
      }
      
      // Fetch saved schedules after auth
      await fetchSavedSchedules(finalId)
      
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedSchedules = async (teacherId) => {
    try {
      const { data, error } = await supabase
        .from('teacher_schedules')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('updated_at', { ascending: false })
      
      if (!error && data) {
        setSavedSchedules(data)
      }
    } catch (e) {
      console.error('Error fetching schedules:', e)
    }
  }

  const handleSaveToCloud = async () => {
    if (!teacher || !teacher.id) return
    setIsSaving(true)
    
    try {
      const schedulePayload = {
        teacher_id: teacher.id,
        title: title,
        schedule_data: schedule,
        updated_at: new Date().toISOString()
      }

      if (currentScheduleId) {
        // Update existing
        const { error } = await supabase
          .from('teacher_schedules')
          .update(schedulePayload)
          .eq('id', currentScheduleId)
        if (error) throw error
        alert('✅ تم تحديث الجدول بنجاح!')
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('teacher_schedules')
          .insert([schedulePayload])
          .select()
          .single()
        if (error) throw error
        setCurrentScheduleId(data.id)
        alert('✅ تم حفظ الجدول في حقيبتك بنجاح!')
      }
      
      // Refresh list
      await fetchSavedSchedules(teacher.id)
    } catch (e) {
      console.error(e)
      alert('❌ حدث خطأ أثناء الحفظ!')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadSchedule = (savedObj) => {
    setTitle(savedObj.title)
    setSchedule(savedObj.schedule_data)
    setCurrentScheduleId(savedObj.id)
    setShowSavedList(false)
  }

  const handleDeleteSchedule = async (id, e) => {
    e.stopPropagation()
    if (!confirm('هل أنت متأكد من حذف هذا الجدول نهائياً؟')) return
    
    try {
      const { error } = await supabase
        .from('teacher_schedules')
        .delete()
        .eq('id', id)
      if (error) throw error
      
      setSavedSchedules(prev => prev.filter(s => s.id !== id))
      if (currentScheduleId === id) {
        setCurrentScheduleId(null) // Unlink
      }
    } catch (e) {
      alert('❌ خطأ أثناء الحذف')
    }
  }

  useEffect(() => {
    if (!loading) {
      drawSchedule()
    }
  }, [title, schedule, loading, isPremium, teacher])

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const lines = text.split('\n')
    let currentY = y

    for (let j = 0; j < lines.length; j++) {
      const words = lines[j].split(' ')
      let line = ''
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width
        
        if (testWidth > maxWidth && i > 0) {
          ctx.fillText(line, x, currentY)
          line = words[i] + ' '
          currentY += lineHeight
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, x, currentY)
      currentY += lineHeight
    }
    return currentY
  }

  const drawSchedule = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = 1200
    const height = 1600 // Taller to fit 7 days
    
    ctx.clearRect(0, 0, width, height)

    // Background
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, width, height)

    // Header Background
    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(0, 0, width, 150)
    
    // Pattern or decoration in header
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.beginPath()
    ctx.arc(100, 50, 80, 0, 2 * Math.PI)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(1100, 100, 120, 0, 2 * Math.PI)
    ctx.fill()

    // Title
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#0f5132'
    ctx.font = 'bold 50px Tajawal, sans-serif'
    ctx.fillText(title, width / 2, 75)

    const days = [
      { key: 'saturday', name: 'السبت', color: '#3b82f6' },
      { key: 'sunday', name: 'الأحد', color: '#10b981' },
      { key: 'monday', name: 'الاثنين', color: '#f59e0b' },
      { key: 'tuesday', name: 'الثلاثاء', color: '#8b5cf6' },
      { key: 'wednesday', name: 'الأربعاء', color: '#ec4899' },
      { key: 'thursday', name: 'الخميس', color: '#06b6d4' },
      { key: 'friday', name: 'الجمعة', color: '#ef4444' }
    ]

    let currentY = 180
    const boxMargin = 60
    const boxWidth = width - (boxMargin * 2)
    const boxHeight = 160

    days.forEach((day, index) => {
      // Draw shadow
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetY = 4
      
      // Box background
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.roundRect(boxMargin, currentY, boxWidth, boxHeight, 15)
      ctx.fill()
      ctx.shadowColor = 'transparent'

      // Day label tab
      ctx.fillStyle = day.color
      ctx.beginPath()
      ctx.roundRect(boxMargin, currentY, 180, boxHeight, [15, 0, 0, 15])
      ctx.fill()

      // Day Name
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 36px Tajawal, sans-serif'
      ctx.fillText(day.name, boxMargin + 90, currentY + boxHeight / 2)

      // Tasks text
      ctx.textAlign = 'right'
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#334155'
      ctx.font = '28px Tajawal, sans-serif'
      
      const tasksText = schedule[day.key] || 'لا توجد مهام.'
      wrapText(ctx, tasksText, width - boxMargin - 30, currentY + 30, boxWidth - 240, 40)

      currentY += boxHeight + 25
    })

    // Watermark if not premium
    if (!isPremium) {
      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.rotate(-Math.PI / 6)
      ctx.font = 'bold 60px Tajawal, sans-serif'
      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)'
      ctx.textAlign = 'center'
      ctx.fillText('معاينة تجريبية - اشتراك المعلم المميز', 0, 0)
      ctx.restore()
    }

    // Footer
    ctx.textAlign = 'center'
    ctx.font = 'bold 24px Tajawal, sans-serif'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText(teacher?.name ? `مع تحيات أ. ${teacher.name} - منصة الوتين` : 'مع تحيات المستر إبراهيم عمار', width / 2, height - 50)
  }

  const handleDownload = () => {
    if (!isPremium) {
      setShowUpgradePrompt(true)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `جدول_${title.replace(/\s+/g, '_')}.png`
    a.click()
  }

  const handleScheduleChange = (day, value) => {
    setSchedule({...schedule, [day]: value})
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif' }}>
        <p style={{ fontSize: '1.2rem', color: '#059669', fontWeight: 'bold' }}>جاري التحميل... ⏳</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>مصمم الجداول الدراسية | مساعد المعلم</title>
      </Head>
      
      <div className={styles.container}>
        
        {/* Top Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            onClick={() => router.push('/teacher-assistant')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#475569', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <ArrowRight size={16} />
            العودة للوحة المعلم
          </button>
        </div>

        <header className={styles.header}>
          <h1>📅 صانع الجداول المدرسية</h1>
          <p>قم بتصميم جدول الحصص الخاص بك، احفظه، وشاركه مع طلابك أو اطبع نسخة منه.</p>
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
            
            {/* Editor Area */}
            <div className={styles.formSection}>
              {/* Cloud Storage Top Bar */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '25px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                    <Cloud size={20} color="#059669" /> حقيبة المعلم الذكية
                  </h3>
                  <button 
                    onClick={() => setShowSavedList(!showSavedList)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 'bold',
                      color: '#475569'
                    }}
                  >
                    <FolderOpen size={16} /> {showSavedList ? 'إخفاء الجداول السابقة' : 'فتح جداولي المحفوظة'}
                  </button>
                </div>

                {showSavedList && (
                  <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {savedSchedules.length === 0 ? (
                      <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', margin: '10px 0' }}>لا يوجد جداول محفوظة في حقيبتك حتى الآن.</p>
                    ) : (
                      savedSchedules.map(s => (
                        <div key={s.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: currentScheduleId === s.id ? '#ecfdf5' : '#ffffff',
                          border: currentScheduleId === s.id ? '2px solid #10b981' : '1px solid #e2e8f0',
                          padding: '12px', borderRadius: '8px'
                        }}>
                          <div>
                            <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>{s.title}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>آخر تعديل: {new Date(s.updated_at).toLocaleDateString('ar-EG')}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleLoadSchedule(s)}
                              style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              استرجاع وتعديل
                            </button>
                            <button 
                              onClick={(e) => handleDeleteSchedule(s.id, e)}
                              style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="حذف نهائي"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    {currentScheduleId && (
                      <button 
                        onClick={() => {
                          setCurrentScheduleId(null);
                          setTitle('جدول جديد');
                          setSchedule({saturday:'', sunday:'', monday:'', tuesday:'', wednesday:'', thursday:'', friday:''})
                        }}
                        style={{
                          marginTop: '10px', background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                      >
                        + إنشاء جدول جديد
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>عنوان الجدول (مثال: خطة الأسبوع الأول - الصف الثالث الثانوي)</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className={styles.input} 
                />
              </div>

              <h3 style={{marginTop: '20px', marginBottom: '15px', color: '#0f5132'}}>المهام اليومية:</h3>
              <div className={styles.daysGrid}>
                {[
                  { key: 'saturday', name: 'السبت' },
                  { key: 'sunday', name: 'الأحد' },
                  { key: 'monday', name: 'الاثنين' },
                  { key: 'tuesday', name: 'الثلاثاء' },
                  { key: 'wednesday', name: 'الأربعاء' },
                  { key: 'thursday', name: 'الخميس' },
                  { key: 'friday', name: 'الجمعة' }
                ].map(day => (
                  <div key={day.key} className={styles.dayCard}>
                    <h4>{day.name}</h4>
                    <textarea 
                      value={schedule[day.key]} 
                      onChange={e => handleScheduleChange(day.key, e.target.value)} 
                      className={styles.textarea}
                      placeholder="اكتب المهام هنا (كل مهمة في سطر جديد)..."
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.previewSection}>
              <div className={styles.canvasContainer}>
                <canvas 
                  ref={canvasRef}
                  width={1200}
                  height={1600}
                  className={styles.canvas}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                <button 
                  className={styles.downloadBtn} 
                  onClick={handleDownload}
                  style={{
                    background: isPremium ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isPremium ? (
                    <>⬇️ تحميل الجدول كصورة عالية الدقة (PNG)</>
                  ) : (
                    <>
                      <Lock size={16} />
                      تحميل الجدول (يتطلب اشتراك بريميوم)
                    </>
                  )}
                </button>

                <button 
                  onClick={handleSaveToCloud}
                  disabled={isSaving}
                  style={{
                    background: '#ffffff',
                    color: '#0f5132',
                    border: '2px solid #059669',
                    padding: '15px 30px',
                    borderRadius: '10px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: isSaving ? 0.7 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  <Save size={20} />
                  {isSaving ? 'جاري الحفظ السحابي...' : (currentScheduleId ? 'حفظ التعديلات' : 'حفظ الجدول في الحقيبة الذكية')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade prompt modal */}
        {showUpgradePrompt && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '440px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>💎</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#064e3b', marginBottom: '8px' }}>
                ميزة المشتركين المميزين
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                مصمم الجداول الأسبوعية بدقة الطباعة متاح مع باقة المعلم المميزة. اشترك الآن لتصدير جداول لجميع فصولك ومجموعاتك.
              </p>
              <button 
                onClick={() => router.push('/teacher-assistant')}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
              >
                الذهاب للتفعيل والاشتراك 🚀
              </button>
              <button 
                onClick={() => setShowUpgradePrompt(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                إغلاق والمتابعة في المعاينة
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
