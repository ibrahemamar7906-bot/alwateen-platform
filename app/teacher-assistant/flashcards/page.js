'use client'

import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import styles from './page.module.css'

export default function FlashcardsGenerator() {
  const [formData, setFormData] = useState({
    title: 'كان وأخواتها',
    rule: 'أفعال ناسخة تدخل على الجملة الاسمية، فترفع المبتدأ ويسمى اسمها، وتنصب الخبر ويسمى خبرها.',
    example1: 'كان الجوُّ جميلاً.',
    example2: 'أصبح الطالبُ نشيطاً.',
    theme: 'classic', // classic, dark, colorful, custom, notebook, glass
    customColor: '#9333ea'
  })
  
  const router = useRouter()
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [csvText, setCsvText] = useState('')

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setCurrentUser(user)
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
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTeacherData()
  }, [router])

  useEffect(() => {
    drawCard()
  }, [formData])

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ')
    let line = ''
    let currentY = y

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
    return currentY + lineHeight
  }

  const drawCard = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = 1080
    const height = 1080 // Square for Instagram/Facebook posts
    
    ctx.clearRect(0, 0, width, height)

    // Set theme colors
    let bgColors, textColor, accentColor, boxColor
    if (formData.theme === 'dark') {
      bgColors = ['#0f172a', '#1e293b']
      textColor = '#f8fafc'
      accentColor = '#38bdf8'
      boxColor = '#334155'
    } else if (formData.theme === 'colorful') {
      bgColors = ['#ec4899', '#8b5cf6']
      textColor = '#ffffff'
      accentColor = '#fde047'
      boxColor = 'rgba(255,255,255,0.2)'
    } else if (formData.theme === 'notebook') {
      bgColors = ['#fdfbf7', '#fefce8']
      textColor = '#1e293b'
      accentColor = '#e11d48'
      boxColor = '#ffffff'
    } else if (formData.theme === 'glass') {
      bgColors = ['#1e1b4b', '#4c1d95']
      textColor = '#ffffff'
      accentColor = '#c084fc'
      boxColor = 'rgba(255, 255, 255, 0.1)'
    } else if (formData.theme === 'custom') {
      bgColors = [formData.customColor, formData.customColor]
      textColor = '#ffffff'
      accentColor = '#ffffff'
      boxColor = 'rgba(0,0,0,0.2)'
    } else {
      // Classic
      bgColors = ['#f8fafc', '#e2e8f0']
      textColor = '#0f172a'
      accentColor = '#0f5132'
      boxColor = '#ffffff'
    }

    // Draw Background
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, bgColors[0])
    gradient.addColorStop(1, bgColors[1])
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Decorative shapes
    if (formData.theme === 'colorful') {
      ctx.beginPath()
      ctx.arc(width, 0, 300, 0, 2 * Math.PI)
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.fill()
      
      ctx.beginPath()
      ctx.arc(0, height, 200, 0, 2 * Math.PI)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(width, 0)
      ctx.lineTo(width, 20)
      ctx.lineTo(0, 20)
      ctx.fillStyle = accentColor
      ctx.fill()
    }

    // Title
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = accentColor
    ctx.font = 'bold 80px Tajawal'
    ctx.fillText(formData.title, width / 2, 80)

    // Subtitle / "القاعدة"
    ctx.fillStyle = textColor
    ctx.font = 'bold 40px Tajawal'
    ctx.fillText('القاعدة', width / 2, 220)

    // Draw Rule Box
    const boxMargin = 80
    const ruleBoxTop = 290
    ctx.fillStyle = boxColor
    ctx.shadowColor = 'rgba(0,0,0,0.1)'
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.roundRect(boxMargin, ruleBoxTop, width - boxMargin*2, 250, 20)
    ctx.fill()
    ctx.shadowColor = 'transparent' // reset

    // Rule Text
    ctx.fillStyle = formData.theme === 'colorful' || formData.theme === 'dark' ? textColor : '#334155'
    ctx.font = '36px Tajawal'
    ctx.textAlign = 'center'
    wrapText(ctx, formData.rule, width / 2, ruleBoxTop + 60, width - boxMargin*2 - 80, 50)

    // Examples Header
    ctx.fillStyle = textColor
    ctx.font = 'bold 40px Tajawal'
    ctx.fillText('أمثلة توضيحية', width / 2, 590)

    // Examples Box
    const examplesBoxTop = 660
    ctx.fillStyle = boxColor
    ctx.shadowColor = 'rgba(0,0,0,0.1)'
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.roundRect(boxMargin, examplesBoxTop, width - boxMargin*2, 250, 20)
    ctx.fill()
    ctx.shadowColor = 'transparent'

    // Example 1
    ctx.fillStyle = formData.theme === 'colorful' || formData.theme === 'dark' ? textColor : '#334155'
    ctx.font = 'bold 36px Tajawal'
    ctx.textAlign = 'right'
    ctx.fillText(`1. ${formData.example1}`, width - boxMargin - 40, examplesBoxTop + 60)

    // Example 2
    ctx.fillText(`2. ${formData.example2}`, width - boxMargin - 40, examplesBoxTop + 150)

    // Footer
    ctx.textAlign = 'center'
    ctx.font = '24px Tajawal'
    ctx.fillStyle = formData.theme === 'colorful' ? 'rgba(255,255,255,0.8)' : '#64748b'
    ctx.fillText('منصة المستر إبراهيم عمار التعليمية', width / 2, height - 60)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `بطاقة_${formData.title.replace(/\s+/g, '_')}.png`
    a.click()
  }

  const handleSaveToSupabase = async () => {
    if (!currentUser) return
    setIsSaving(true)
    try {
      const { error } = await supabase.from('flashcards').insert({
        teacher_id: currentUser.id,
        title: formData.title,
        rule: formData.rule,
        example1: formData.example1,
        example2: formData.example2,
        theme: formData.theme,
        custom_color: formData.customColor
      })
      if (error) throw error
      alert('تم حفظ البطاقة بنجاح في البنك! يمكنك الآن عرضها في البث المباشر.')
    } catch (error) {
      console.error(error)
      alert('حدث خطأ أثناء حفظ البطاقة: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const parseCSVRow = (str) => {
    let result = []
    let cur = ''
    let inQuote = false
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '"') {
        inQuote = !inQuote
      } else if (str[i] === ',' && !inQuote) {
        result.push(cur)
        cur = ''
      } else {
        cur += str[i]
      }
    }
    result.push(cur)
    return result
  }

  const processCsvText = async (text) => {
    if (!currentUser) {
      alert('يجب تسجيل الدخول أولاً')
      return
    }
    const lines = text.split('\n')
    const flashcardsToInsert = []
    
    // Process all lines (if first line has no commas or is exact header, we could skip it, but let's just parse all valid lines)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      if (i === 0 && line.includes('العنوان') && line.includes('القاعدة')) continue // Skip header if present
      
      const row = parseCSVRow(line)
      if (row.length >= 2) {
        flashcardsToInsert.push({
          teacher_id: currentUser.id,
          title: row[0]?.trim() || 'بدون عنوان',
          rule: row[1]?.trim() || '',
          example1: row[2]?.trim() || '',
          example2: row[3]?.trim() || '',
          theme: 'classic',
          custom_color: '#9333ea'
        })
      }
    }

    if (flashcardsToInsert.length > 0) {
      setIsSaving(true)
      try {
        const { error } = await supabase.from('flashcards').insert(flashcardsToInsert)
        if (error) throw error
        alert(`تم استيراد وحفظ ${flashcardsToInsert.length} بطاقة بنجاح في البنك!`)
        setCsvText('') // clear text
      } catch (error) {
        console.error(error)
        alert('حدث خطأ أثناء استيراد البطاقات: ' + error.message)
      } finally {
        setIsSaving(false)
      }
    } else {
      alert('لم يتم العثور على بطاقات صالحة في النص المكتوب.')
    }
  }

  const handleCsvImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const text = event.target.result
      await processCsvText(text)
    }
    reader.readAsText(file, 'utf-8')
    e.target.value = null
  }

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  return (
    <>
      <Head>
        <title>صانع بطاقات القواعد | مساعد المعلم</title>
      </Head>
      
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>صانع البطاقات النحوية 🃏</h1>
          <p>قم بتحويل القواعد النحوية المعقدة إلى صور تعليمية (انفوجرافيك) مبسطة وجذابة للطلاب</p>
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
              <label>عنوان القاعدة (مثال: المفعول المطلق)</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label>شرح القاعدة</label>
              <textarea name="rule" value={formData.rule} onChange={handleChange} className={styles.textarea} />
            </div>

            <div className={styles.formGroup}>
              <label>مثال توضيحي 1</label>
              <input type="text" name="example1" value={formData.example1} onChange={handleChange} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label>مثال توضيحي 2</label>
              <input type="text" name="example2" value={formData.example2} onChange={handleChange} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label>التصميم (Theme)</label>
              <select name="theme" value={formData.theme} onChange={handleChange} className={styles.select} style={{marginBottom: formData.theme === 'custom' ? '10px' : '0'}}>
                <option value="classic">كلاسيكي (أبيض وأخضر)</option>
                <option value="notebook">دفتر ملاحظات (مجاني)</option>
                <option value="colorful">ألوان مبهجة (وردي وبنفسجي)</option>
                <option value="dark" disabled={!isPremium}>الوضع الليلي (أزرق داكن) - مدفوع</option>
                <option value="glass" disabled={!isPremium}>تأثير زجاجي ليلي - مدفوع</option>
                <option value="custom" disabled={!isPremium}>لون مخصص - مدفوع</option>
              </select>

              {formData.theme === 'custom' && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
                  <label>اختر لون البطاقة:</label>
                  <input type="color" name="customColor" value={formData.customColor} onChange={handleChange} style={{ border: 'none', background: 'transparent', width: '40px', height: '40px', cursor: 'pointer' }} />
                </div>
              )}
            </div>
          </div>

          <div className={styles.previewSection}>
            <div className={styles.canvasContainer}>
              <canvas 
                ref={canvasRef}
                width={1080}
                height={1080}
                className={styles.canvas}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className={styles.downloadBtn} onClick={handleDownload} style={{ flex: 1 }}>
                ⬇️ تحميل الصورة (PNG)
              </button>
              
              <button 
                className={styles.downloadBtn} 
                onClick={handleSaveToSupabase}
                disabled={isSaving}
                style={{ flex: 1, backgroundColor: '#10b981', color: 'white', border: 'none' }}
              >
                {isSaving ? 'جاري الحفظ...' : '💾 حفظ في بنك البطاقات'}
              </button>
            </div>
            
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px', fontWeight: 'bold' }}>أو استيراد مجموعة بطاقات دفعة واحدة (CSV):</p>
              
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="الصق بيانات الـ CSV هنا...&#10;العنوان, القاعدة, مثال 1, مثال 2&#10;كان وأخواتها, ترفع المبتدأ وتنصب الخبر, كان الجو جميلاً, أصبح الطالب نشيطاً"
                style={{ width: '100%', height: '90px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '10px', fontSize: '0.8rem', resize: 'vertical', fontFamily: 'monospace' }}
              />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => processCsvText(csvText)}
                  disabled={isSaving || !csvText.trim()}
                  style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flex: 1, minWidth: '150px' }}
                >
                  📥 استيراد من النص
                </button>

                <input 
                  type="file" 
                  accept=".csv" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleCsvImport} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving}
                  style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flex: 1, minWidth: '150px' }}
                >
                  📄 استيراد من ملف
                </button>
              </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
