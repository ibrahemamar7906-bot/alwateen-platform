'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import styles from './page.module.css'
import RosterManager from '../../components/TeacherAssistant/RosterManager'

export default function LeaderboardGenerator() {
  const router = useRouter()
  const canvasRef = useRef(null)
  
  const [loading, setLoading] = useState(true)
  const [teacher, setTeacher] = useState(null)
  const [isPremium, setIsPremium] = useState(false)
  
  const [title, setTitle] = useState('لوحة الشرف 🏆')
  const [subtitle, setSubtitle] = useState('نجوم الأسبوع - الصف الأول الثانوي')
  const [studentsText, setStudentsText] = useState('أحمد محمد محمود - 100%\nيوسف علي - 98\nفاطمة خالد - 95\nمريم أحمد - 90\nعمر سامي')
  const [template, setTemplate] = useState('gold') // gold, neon, classic
  const [customImage, setCustomImage] = useState(null)
  
  const [showRosterManager, setShowRosterManager] = useState(false)

  const [designMode, setDesignMode] = useState('fixed')
  const [dynBg, setDynBg] = useState('solid') 
  const [dynBorder, setDynBorder] = useState('none')
  const [dynPalette, setDynPalette] = useState('blue')

  useEffect(() => {
    fetchTeacherData()
  }, [])

  useEffect(() => {
    if (!loading) {
      renderPreview()
    }
  }, [title, subtitle, studentsText, template, designMode, dynBg, dynBorder, dynPalette, loading, teacher, customImage])

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
      if (profile.role === 'admin' || isSubscribed) {
        setIsPremium(true)
      } else {
        setIsPremium(false)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    if (!e.target.files[0]) return
    const reader = new FileReader()
    reader.onload = (f) => {
      setCustomImage(f.target.result)
    }
    reader.readAsDataURL(e.target.files[0])
    e.target.value = null
  }

  const getStudentsList = () => {
    const lines = studentsText.split('\n').map(l => l.trim()).filter(l => l !== '')
    return lines.map(line => {
      // Extract score if provided (e.g. "Ahmed - 95" or "Ahmed: 100%")
      const match = line.match(/^(.*?)\s*(?:[-:]|)\s*([0-9]+(?:\.[0-9]+)?%?)$/)
      if (match) {
        return { name: match[1].trim(), score: match[2].trim() }
      }
      return { name: line, score: null }
    })
  }

  const renderLeaderboard = (ctx, canvasWidth, canvasHeight) => {
    return new Promise((resolve) => {
      const students = getStudentsList()
      
      let titleColor = '#1e3a8a'
      let subtitleColor = '#475569'
      let dividerColor = '#cbd5e1'
      let baseRankColor = '#334155'
      let footerColor = '#64748b'
      let customImageBorderColor = '#1e3a8a'

      if (designMode === 'dynamic') {
        if (dynBg === 'solid') {
           ctx.fillStyle = dynPalette === 'dark' ? '#0f172a' : (dynPalette === 'green' ? '#f0fdf4' : '#ffffff');
           ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        } else if (dynBg === 'gradient') {
           const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
           grad.addColorStop(0, dynPalette === 'blue' ? '#eff6ff' : '#fff1f2');
           grad.addColorStop(1, dynPalette === 'blue' ? '#bfdbfe' : '#fecdd3');
           ctx.fillStyle = grad;
           ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        } else if (dynBg === 'waves') {
           ctx.fillStyle = dynPalette === 'dark' ? '#1e293b' : '#f8fafc';
           ctx.fillRect(0, 0, canvasWidth, canvasHeight);
           ctx.fillStyle = dynPalette === 'blue' ? '#3b82f6' : '#ec4899';
           ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(canvasWidth,0); ctx.bezierCurveTo(canvasWidth-100,200, 100,50, 0,300); ctx.fill();
        } else if (dynBg === 'stars') {
           ctx.fillStyle = '#170529'; ctx.fillRect(0, 0, canvasWidth, canvasHeight);
           ctx.fillStyle = '#ffffff';
           for(let i=0; i<40; i++) { ctx.beginPath(); ctx.arc(Math.random()*canvasWidth, Math.random()*canvasHeight, Math.random()*3, 0, Math.PI*2); ctx.fill(); }
        } else if (dynBg === 'parchment') {
           ctx.fillStyle = '#fef3c7'; ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        } else if (dynBg === 'geometric') {
           ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvasWidth, canvasHeight);
           ctx.fillStyle = dynPalette === 'green' ? '#22c55e' : '#f59e0b';
           ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(300,0); ctx.lineTo(0,300); ctx.fill();
           ctx.fillStyle = dynPalette === 'blue' ? '#3b82f6' : '#8b5cf6';
           ctx.beginPath(); ctx.moveTo(canvasWidth,canvasHeight); ctx.lineTo(canvasWidth-300,canvasHeight); ctx.lineTo(canvasWidth,canvasHeight-300); ctx.fill();
        }

        ctx.strokeStyle = dynPalette === 'dark' || dynBg === 'stars' ? '#fbbf24' : (dynPalette === 'red' ? '#e11d48' : '#1e3a8a');
        if (dynBorder === 'thin') {
           ctx.lineWidth = 2; ctx.strokeRect(40, 40, canvasWidth-80, canvasHeight-80);
        } else if (dynBorder === 'double') {
           ctx.lineWidth = 8; ctx.strokeRect(30, 30, canvasWidth-60, canvasHeight-60);
           ctx.lineWidth = 2; ctx.strokeRect(45, 45, canvasWidth-90, canvasHeight-90);
        } else if (dynBorder === 'tech') {
           ctx.lineWidth = 4;
           ctx.beginPath(); ctx.moveTo(30,100); ctx.lineTo(30,30); ctx.lineTo(100,30); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(canvasWidth-100,30); ctx.lineTo(canvasWidth-30,30); ctx.lineTo(canvasWidth-30,100); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(30,canvasHeight-100); ctx.lineTo(30,canvasHeight-30); ctx.lineTo(100,canvasHeight-30); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(canvasWidth-100,canvasHeight-30); ctx.lineTo(canvasWidth-30,canvasHeight-30); ctx.lineTo(canvasWidth-30,canvasHeight-100); ctx.stroke();
        } else if (dynBorder === 'ornate') {
           ctx.lineWidth = 15; ctx.setLineDash([20, 20]); ctx.strokeRect(30, 30, canvasWidth-60, canvasHeight-60); ctx.setLineDash([]);
        }

        titleColor = ctx.strokeStyle;
        subtitleColor = (dynBg === 'stars' || dynPalette === 'dark') ? '#cbd5e1' : '#475569';
        dividerColor = subtitleColor;
        baseRankColor = subtitleColor;
        footerColor = subtitleColor;
        customImageBorderColor = ctx.strokeStyle;
      } else {
        // Backgrounds
        if (template === 'gold') {
        // Dark blue / black with gold accents
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 15
        ctx.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60)
        ctx.strokeStyle = '#d97706'
        ctx.lineWidth = 3
        ctx.strokeRect(50, 50, canvasWidth - 100, canvasHeight - 100)
        
        ctx.fillStyle = '#fbbf24'
      } else if (template === 'neon') {
        // Dark purple with cyan/pink neon vibes
        ctx.fillStyle = '#1e1b4b'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.strokeStyle = '#22d3ee'
        ctx.lineWidth = 8
        ctx.strokeRect(40, 40, canvasWidth - 80, canvasHeight - 80)
        ctx.strokeStyle = '#f472b6'
        ctx.lineWidth = 4
        ctx.strokeRect(50, 50, canvasWidth - 100, canvasHeight - 100)

        ctx.fillStyle = '#22d3ee'
      } else if (template === 'classic') {
        // White/Light with clean blue accents
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.strokeStyle = '#1e3a8a'
        ctx.lineWidth = 10
        ctx.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60)
        
        ctx.fillStyle = '#1e3a8a'
      }
      
      if (template === 'gold') { titleColor = '#fbbf24'; subtitleColor = '#f8fafc'; dividerColor = '#475569'; baseRankColor = '#e2e8f0'; footerColor = '#94a3b8'; customImageBorderColor = '#fbbf24'; }
      if (template === 'neon') { titleColor = '#22d3ee'; subtitleColor = '#f472b6'; dividerColor = '#475569'; baseRankColor = '#e0e7ff'; footerColor = '#94a3b8'; customImageBorderColor = '#22d3ee'; }
      if (template === 'classic') { titleColor = '#1e3a8a'; subtitleColor = '#475569'; dividerColor = '#cbd5e1'; baseRankColor = '#334155'; footerColor = '#64748b'; customImageBorderColor = '#1e3a8a'; }
    }

      // Title
      ctx.fillStyle = titleColor
      ctx.font = 'bold 70px "Tajawal", "Cairo", Arial'
      ctx.textAlign = 'center'
      ctx.fillText(title || 'لوحة الشرف', canvasWidth / 2, 140)

      // Subtitle
      ctx.fillStyle = subtitleColor
      ctx.font = '35px "Tajawal", "Cairo", Arial'
      ctx.fillText(subtitle || 'الطلاب المتميزون', canvasWidth / 2, 210)

      // Divider
      ctx.beginPath()
      ctx.moveTo(canvasWidth / 2 - 200, 240)
      ctx.lineTo(canvasWidth / 2 + 200, 240)
      ctx.lineWidth = 2
      ctx.strokeStyle = dividerColor
      ctx.stroke()

      // Students Grid
      let startY = 320
      let endY = 920
      let availH = endY - startY
      
      let cols = 1
      if (students.length > 10) cols = 2
      if (students.length > 22) cols = 3

      let itemsPerCol = Math.ceil(students.length / cols)
      let stepY = availH / Math.max(itemsPerCol, 1)
      
      let fontSize = Math.min(45, stepY * 0.6)
      if (fontSize < 20) fontSize = 20

      ctx.font = `bold ${fontSize}px "Tajawal", "Cairo", Arial`

      for (let i = 0; i < students.length; i++) {
        let col = Math.floor(i / itemsPerCol)
        let row = i % itemsPerCol
        
        // Calculate X position based on columns (RTL layout)
        let colWidth = (canvasWidth - 160) / cols
        let x = canvasWidth - 80 - (colWidth * col) - (colWidth / 2)
        let y = startY + (row * stepY) + (stepY / 2)

        // Colors based on rank
        let rankColor = ''
        let prefix = ''
        if (i === 0) {
          rankColor = '#fbbf24' // Gold
          prefix = '👑 '
        } else if (i === 1) {
          rankColor = '#cbd5e1' // Silver
          prefix = '🥈 '
        } else if (i === 2) {
          rankColor = '#b45309' // Bronze
          prefix = '🥉 '
        } else {
          rankColor = baseRankColor
        }

        ctx.fillStyle = rankColor
        ctx.textAlign = 'center'
        
        let displayText = `${prefix}${students[i].name}`
        if (students[i].score) {
          displayText += ` (${students[i].score})`
        }

        ctx.fillText(displayText, x, y)
      }

      // Footer
      ctx.font = '25px "Tajawal", "Cairo", Arial'
      ctx.fillStyle = footerColor
      ctx.textAlign = 'center'
      ctx.fillText(`مع تحيات المعلم: أ. ${teacher?.name || ''}`, canvasWidth / 2, 1020)

      // Draw custom image (logo) if provided
      if (customImage) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          ctx.save()
          ctx.beginPath()
          ctx.arc(canvasWidth / 2, 940, 50, 0, Math.PI * 2, true)
          ctx.closePath()
          ctx.clip()
          
          const imgAspect = img.width / img.height
          let drawW = 100, drawH = 100
          if (imgAspect > 1) {
            drawW = 100 * imgAspect
          } else {
            drawH = 100 / imgAspect
          }
          ctx.drawImage(img, canvasWidth / 2 - drawW / 2, 940 - drawH / 2, drawW, drawH)
          ctx.restore()
          
          ctx.beginPath()
          ctx.arc(canvasWidth / 2, 940, 50, 0, Math.PI * 2, true)
          ctx.lineWidth = 3
          ctx.strokeStyle = customImageBorderColor
          ctx.stroke()
          
          resolve()
        }
        img.onerror = resolve
        img.src = customImage
      } else {
        resolve()
      }
    })
  }

  const renderPreview = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    await renderLeaderboard(ctx, canvas.width, canvas.height)
  }

  const handleDownload = async () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    await renderLeaderboard(ctx, canvas.width, canvas.height)
    
    const dataURL = canvas.toDataURL('image/png', 1.0)
    const link = document.createElement('a')
    link.download = `لوحة_الشرف.png`
    link.href = dataURL
    link.click()
  }

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>جاري التحميل...</div>

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <h2>لوحة الشرف 🏆</h2>
          <p>أبرز طلابك المتميزين بتصميم مبهر</p>
        </div>

        <div className={styles.formGroup}>
          <label>العنوان الرئيسي</label>
          <input 
            type="text" 
            className={styles.input} 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>العنوان الفرعي</label>
          <input 
            type="text" 
            className={styles.input} 
            value={subtitle} 
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ margin: 0 }}>أسماء الطلاب (والدرجات اختيارياً)</label>
            <button 
              onClick={() => setShowRosterManager(true)}
              style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              📂 حقيبة القوائم الذكية
            </button>
          </div>
          <div style={{fontSize: '0.8rem', color: '#64748b', marginBottom: '8px'}}>اكتب كل طالب في سطر. أضف الدرجة هكذا: "الاسم - الدرجة" أو فقط "الاسم"</div>
          <textarea 
            className={styles.textarea} 
            value={studentsText} 
            onChange={(e) => setStudentsText(e.target.value)}
            placeholder="أحمد محمد - 100&#10;يوسف علي - 98&#10;فاطمة محمود"
            style={{minHeight: '180px'}}
          />
        </div>

        <div className={styles.formGroup}>
          <label>شعار الدورة / صورتك (اختياري)</label>
          <input 
            type="file" 
            accept="image/*"
            className={styles.input} 
            onChange={handleImageUpload}
          />
          {customImage && (
            <button onClick={() => setCustomImage(null)} style={{background:'none', border:'none', color:'red', cursor:'pointer', textAlign:'right', fontSize:'0.8rem'}}>إزالة الصورة ❌</button>
          )}
        </div>

        <div className={styles.formGroup} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
             <button onClick={() => setDesignMode('fixed')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: designMode === 'fixed' ? '#3b82f6' : '#e2e8f0', color: designMode === 'fixed' ? 'white' : '#475569', cursor: 'pointer', fontWeight: 'bold' }}>قوالب جاهزة</button>
             <button onClick={() => setDesignMode('dynamic')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: designMode === 'dynamic' ? '#10b981' : '#e2e8f0', color: designMode === 'dynamic' ? 'white' : '#475569', cursor: 'pointer', fontWeight: 'bold' }}>محرك ذكي 👑</button>
          </div>

          {designMode === 'fixed' && (
            <>
              <label>التصميم الجاهز</label>
              <select className={styles.select} value={template} onChange={(e) => setTemplate(e.target.value)}>
                <option value="classic">الكلاسيكي الأبيض (مجاني)</option>
                <option value="gold" disabled={!isPremium}>الذهبي الفاخر (مدفوع)</option>
                <option value="neon" disabled={!isPremium}>النيون العصري (مدفوع)</option>
              </select>
            </>
          )}

          {designMode === 'dynamic' && (
            <div style={{ opacity: isPremium ? 1 : 0.5, pointerEvents: isPremium ? 'auto' : 'none', position: 'relative' }}>
              {!isPremium && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{background: '#ef4444', color: 'white', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold'}}>للمشتركين فقط</span></div>}
              
              <label>نمط الخلفية</label>
              <select className={styles.select} value={dynBg} onChange={e => setDynBg(e.target.value)} style={{marginBottom: '10px'}}>
                <option value="solid">لون سادة</option>
                <option value="gradient">تدرج لوني</option>
                <option value="waves">أمواج مائية</option>
                <option value="stars">فضاء ونجوم</option>
                <option value="parchment">ورق كلاسيكي</option>
                <option value="geometric">أشكال هندسية</option>
              </select>

              <label>نمط الإطار</label>
              <select className={styles.select} value={dynBorder} onChange={e => setDynBorder(e.target.value)} style={{marginBottom: '10px'}}>
                <option value="none">بدون إطار</option>
                <option value="thin">إطار رفيع بسيط</option>
                <option value="double">إطار مزدوج كلاسيكي</option>
                <option value="tech">إطار تكنولوجي رقمي</option>
                <option value="ornate">إطار مزخرف (منقط)</option>
              </select>

              <label>لوحة الألوان</label>
              <select className={styles.select} value={dynPalette} onChange={e => setDynPalette(e.target.value)}>
                <option value="blue">أزرق سماوي</option>
                <option value="green">أخضر زمردي</option>
                <option value="red">أحمر قرمزي</option>
                <option value="dark">وضع ليلي داكن (Dark)</option>
              </select>
            </div>
          )}
        </div>

        <div style={{marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <button 
          className={styles.downloadBtn} 
          onClick={handleDownload}
          style={{marginTop: '20px', width: '100%', background: isPremium ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #f59e0b, #d97706)'}}
        >
          {isPremium ? '⬇️ تحميل كصورة عالية الدقة (PNG)' : '⬇️ تحميل اللوحة (مجاني - علامة مائية)'}
        </button>
          <a href="/teacher-assistant" className={styles.btnSecondary} style={{marginTop: '20px', border: 'none', background: 'transparent', color: '#64748b', textDecoration: 'none', textAlign: 'center'}}>
            &rarr; العودة للوحة المعلم
          </a>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <h3>معاينة حية</h3>
        <p className={styles.stats}>عدد الطلاب: <strong>{getStudentsList().length}</strong></p>
        <div className={styles.canvasWrapper}>
          <canvas ref={canvasRef} width="1080" height="1080" style={{width: '100%', maxWidth: '700px', height: 'auto'}}></canvas>
        </div>
      </main>

      {showRosterManager && (
        <RosterManager 
          teacherId={teacher?.id}
          currentList={studentsText}
          onImport={(list) => setStudentsText(list)}
          onClose={() => setShowRosterManager(false)}
        />
      )}
    </div>
  )
}
