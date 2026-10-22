'use client'

import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import styles from './page.module.css'
import { Lock, Zap, ArrowRight, ShieldAlert } from 'lucide-react'

export default function ReportGenerator() {
  const router = useRouter()
  const canvasRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [teacher, setTeacher] = useState(null)
  const [isPremium, setIsPremium] = useState(false)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  const [formData, setFormData] = useState({
    studentName: 'أحمد محمد السيد',
    month: 'أكتوبر',
    grade: '95',
    totalGrade: '100',
    attendance: '100%',
    rating: 'ممتاز',
    notes: 'طالب مجتهد ومتميز، يحافظ على أداء الواجبات بانتظام. أتمنى له دوام التوفيق والنجاح.'
  })

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
      setTeacher({
        name: profile.full_name,
      })
      const now = new Date()
      const subEndDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null
      const isSubscribed = profile.status === 'approved' && (!subEndDate || subEndDate > now)
      if (profile?.role !== 'admin' && profile?.role !== 'assistant' && !isSubscribed) {
        setIsPremium(false)
      } else {
        setIsPremium(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      drawReport()
    }
  }, [formData, loading, isPremium, teacher])

  const drawReport = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = 800
    const height = 1000 // A nice portrait aspect ratio
    
    // Fill background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Draw Header Background (Premium Green Gradient)
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, '#052c16')
    gradient.addColorStop(1, '#198754')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, 180)

    // Draw decorative curves in header
    ctx.beginPath()
    ctx.moveTo(0, 180)
    ctx.quadraticCurveTo(width / 2, 230, width, 180)
    ctx.lineTo(width, 0)
    ctx.lineTo(0, 0)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Header Text
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.font = 'bold 45px Tajawal, sans-serif'
    ctx.fillText('تقرير أداء دوري', width / 2, 35)
    
    ctx.font = '24px Tajawal, sans-serif'
    ctx.fillStyle = '#d1fae5'
    ctx.fillText(teacher?.name ? `إعداد: أ. ${teacher.name}` : 'منصة المستر إبراهيم عمار التعليمية', width / 2, 95)

    // Main Content Box
    const boxMargin = 40
    const boxTop = 220
    const boxWidth = width - (boxMargin * 2)
    const boxHeight = height - boxTop - 80

    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = 'rgba(0,0,0,0.1)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetY = 5
    ctx.beginPath()
    ctx.roundRect(boxMargin, boxTop, boxWidth, boxHeight, 20)
    ctx.fill()
    ctx.shadowColor = 'transparent'
    
    // Draw Border for Box
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 2
    ctx.stroke()

    // Text settings for body
    ctx.fillStyle = '#1e293b'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    
    const rightAlign = width - boxMargin - 40
    let currentY = boxTop + 60

    // Title inside box
    ctx.font = 'bold 30px Tajawal, sans-serif'
    ctx.fillStyle = '#0f5132'
    ctx.textAlign = 'center'
    ctx.fillText(`تقرير شهر ${formData.month}`, width / 2, currentY)
    currentY += 75

    // Line separator
    ctx.beginPath()
    ctx.moveTo(boxMargin + 40, currentY - 20)
    ctx.lineTo(width - boxMargin - 40, currentY - 20)
    ctx.strokeStyle = '#f1f5f9'
    ctx.stroke()

    // Helper to draw a row
    const drawRow = (label, value, y) => {
      ctx.textAlign = 'right'
      ctx.font = 'bold 22px Tajawal, sans-serif'
      ctx.fillStyle = '#64748b'
      ctx.fillText(label, rightAlign, y)
      
      ctx.textAlign = 'left'
      ctx.font = 'bold 24px Tajawal, sans-serif'
      ctx.fillStyle = '#0f172a'
      ctx.fillText(value, boxMargin + 40, y)
    }

    drawRow('اسم الطالب:', formData.studentName, currentY)
    currentY += 65

    // Highlight Grade
    ctx.textAlign = 'right'
    ctx.font = 'bold 22px Tajawal, sans-serif'
    ctx.fillStyle = '#64748b'
    ctx.fillText('الدرجة الكلية:', rightAlign, currentY)
    
    ctx.textAlign = 'left'
    ctx.font = 'bold 28px Tajawal, sans-serif'
    const percentage = (parseFloat(formData.grade) / (parseFloat(formData.totalGrade) || 100)) * 100
    if (percentage >= 90) ctx.fillStyle = '#16a34a'
    else if (percentage >= 75) ctx.fillStyle = '#ca8a04'
    else ctx.fillStyle = '#dc2626'
    ctx.fillText(`${formData.grade} / ${formData.totalGrade}`, boxMargin + 40, currentY)
    currentY += 65

    drawRow('نسبة الحضور:', formData.attendance, currentY)
    currentY += 65

    // Rating with stars
    ctx.textAlign = 'right'
    ctx.font = 'bold 22px Tajawal, sans-serif'
    ctx.fillStyle = '#64748b'
    ctx.fillText('التقييم العام:', rightAlign, currentY)
    
    ctx.textAlign = 'left'
    ctx.font = 'bold 26px Tajawal, sans-serif'
    let stars = ''
    if(formData.rating.includes('ممتاز')) stars = '⭐⭐⭐⭐⭐'
    else if(formData.rating.includes('جيد جدا')) stars = '⭐⭐⭐⭐'
    else if(formData.rating.includes('جيد')) stars = '⭐⭐⭐'
    else if(formData.rating.includes('مقبول')) stars = '⭐⭐'
    else stars = '⭐'
    
    ctx.fillStyle = '#f59e0b'
    ctx.fillText(`${formData.rating} ${stars}`, boxMargin + 40, currentY)
    currentY += 65

    // Line separator
    ctx.beginPath()
    ctx.moveTo(boxMargin + 40, currentY - 20)
    ctx.lineTo(width - boxMargin - 40, currentY - 20)
    ctx.strokeStyle = '#f1f5f9'
    ctx.stroke()
    currentY += 15

    // Notes
    ctx.textAlign = 'right'
    ctx.font = 'bold 22px Tajawal, sans-serif'
    ctx.fillStyle = '#64748b'
    ctx.fillText('ملاحظات المعلم لولي الأمر:', rightAlign, currentY)
    currentY += 35

    ctx.font = '20px Tajawal, sans-serif'
    ctx.fillStyle = '#334155'
    
    // Text wrapping logic
    const words = formData.notes.split(' ')
    let line = ''
    const maxWidth = boxWidth - 80
    const lineHeight = 32

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width
      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line, rightAlign, currentY)
        line = words[i] + ' '
        currentY += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, rightAlign, currentY)

    // Watermark if not premium
    if (!isPremium) {
      ctx.save()
      ctx.translate(width / 2, height / 2 + 50)
      ctx.rotate(-Math.PI / 6)
      ctx.font = 'bold 40px Tajawal, sans-serif'
      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)'
      ctx.textAlign = 'center'
      ctx.fillText('معاينة تجريبية - اشتراك المعلم المميز', 0, 0)
      ctx.restore()
    }

    // Footer
    ctx.textAlign = 'center'
    ctx.font = '16px Tajawal, sans-serif'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('تم إصدار هذا التقرير من منصة الوتين التعليمية', width / 2, height - 30)
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
    a.download = `تقرير_${formData.studentName.replace(/\s+/g, '_')}_${formData.month}.png`
    a.click()
  }

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
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
        <title>صانع تقارير أولياء الأمور | مساعد المعلم</title>
      </Head>
      
      <div className={styles.container}>
        
        {/* Navigation back bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            onClick={() => router.push('/teacher-assistant')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#475569', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <ArrowRight size={16} />
            العودة للوحة المعلم
          </button>

          {!isPremium && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '20px', color: '#92400e', fontSize: '0.85rem', fontWeight: 'bold' }}>
              <Lock size={14} />
              <span>أداة بريميوم 💎 — يلزم الاشتراك للتحميل بدون علامة مائية</span>
            </div>
          )}
        </div>

        <header className={styles.header}>
          <h1>📝 تقرير تقييم الطالب</h1>
          <p>أدخل بيانات الطالب وسيقوم النظام بتوليد تقرير احترافي يمكنك طباعته أو إرساله لولي الأمر.</p>
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
          <div className={styles.content}>
            
            <div className={styles.formSection}>
              <div className={styles.formGroup}>
                <label>اسم الطالب</label>
                <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} className={styles.input} />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>الشهر / الفترة</label>
                  <input type="text" name="month" value={formData.month} onChange={handleChange} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>نسبة الحضور</label>
                  <input type="text" name="attendance" value={formData.attendance} onChange={handleChange} className={styles.input} />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>الدرجة الحاصل عليها</label>
                  <input type="number" name="grade" value={formData.grade} onChange={handleChange} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>الدرجة الكلية</label>
                  <input type="number" name="totalGrade" value={formData.totalGrade} onChange={handleChange} className={styles.input} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>التقييم العام</label>
                <select name="rating" value={formData.rating} onChange={handleChange} className={styles.select}>
                  <option value="ممتاز">ممتاز (5 نجوم)</option>
                  <option value="جيد جداً">جيد جداً (4 نجوم)</option>
                  <option value="جيد">جيد (3 نجوم)</option>
                  <option value="مقبول">مقبول (نجمتين)</option>
                  <option value="ضعيف">ضعيف (نجمة)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>ملاحظات المعلم (نصيحة لولي الأمر)</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} className={styles.textarea} />
              </div>
            </div>

            <div className={styles.previewSection}>
              <div className={styles.canvasContainer}>
                <canvas 
                  ref={canvasRef}
                  width={800}
                  height={1000}
                  className={styles.canvas}
                />
              </div>
              
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
                  <>⬇️ تحميل التقرير (PNG)</>
                ) : (
                  <>
                    <Lock size={16} />
                    تحميل التقرير (يتطلب اشتراك بريميوم)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Upgrade modal popup if non-premium tries to download */}
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
                تقارير أولياء الأمور الاحترافية متاحة مع باقة المعلم المميزة. اشترك الآن لتصدير تقارير غير محدودة بجودة فائقة وباسمك الشخصي.
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
