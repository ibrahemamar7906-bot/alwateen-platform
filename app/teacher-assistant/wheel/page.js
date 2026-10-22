'use client'

import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import styles from './page.module.css'
import RosterManager from '../../components/TeacherAssistant/RosterManager'

export default function WheelOfNames() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [teacher, setTeacher] = useState(null)
  const [isPremium, setIsPremium] = useState(false)

  const [namesText, setNamesText] = useState('أحمد\nمحمد\nمحمود\nعمر\nعلي\nسارة\nمنى\nليلى\nخالد\nيوسف')
  const [names, setNames] = useState([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState(null)
  const [rotation, setRotation] = useState(0)
  const [showRosterManager, setShowRosterManager] = useState(false)
  
  const [designMode, setDesignMode] = useState('fixed')
  const [template, setTemplate] = useState('classic') // classic, rainbow, ocean, sunset, dark, luxury, nature, pastel
  
  const [dynBg, setDynBg] = useState('solid') 
  const [dynBorder, setDynBorder] = useState('none')
  const [dynPalette, setDynPalette] = useState('blue')
  const [customColor1, setCustomColor1] = useState('#8b5cf6')
  const [customColor2, setCustomColor2] = useState('#ec4899')

  const canvasRef = useRef(null)

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
      })
      const now = new Date()
      const subEndDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null
      const isSubscribed = profile.status === 'approved' && (!subEndDate || subEndDate > now)
      
      // Wheel is completely FREE for all teachers to use for engagement
      setIsPremium(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Parse names from textarea
    const parsedNames = namesText.split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0)
    setNames(parsedNames)
  }, [namesText])

  useEffect(() => {
    if (!loading) drawWheel()
  }, [names, rotation, template, designMode, dynBg, dynBorder, dynPalette, customColor1, customColor2, loading])

  const drawWheel = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 10 // 10px padding

    ctx.clearRect(0, 0, width, height)

    let activeColors = ['#FF6B6B', '#4ECDC4']
    let wheelBorder = '#ffffff'
    let wheelBorderWidth = 1
    let textShadow = 'rgba(0,0,0,0.5)'
    let textFill = '#ffffff'
    let centerColor = '#ffffff'

    if (designMode === 'dynamic') {
      if (dynPalette === 'blue') activeColors = ['#eff6ff', '#bfdbfe', '#60a5fa', '#2563eb', '#1e3a8a']
      if (dynPalette === 'green') activeColors = ['#f0fdf4', '#bbf7d0', '#4ade80', '#16a34a', '#14532d']
      if (dynPalette === 'red') activeColors = ['#fff1f2', '#fecdd3', '#fb7185', '#e11d48', '#881337']
      if (dynPalette === 'custom') activeColors = [customColor1, customColor2, '#ffffff']
      if (dynPalette === 'dark') { activeColors = ['#0f172a', '#1e293b', '#334155', '#475569']; textFill = '#fbbf24'; textShadow = 'rgba(0,0,0,0)'; centerColor = '#fbbf24'; }
      
      if (dynBg === 'stars') { textFill = '#ffffff'; wheelBorder = '#fbbf24'; centerColor = '#fbbf24'; }
      
      if (dynBorder === 'none') { wheelBorderWidth = 0; }
      if (dynBorder === 'thin') { wheelBorderWidth = 2; wheelBorder = '#e2e8f0'; }
      if (dynBorder === 'double') { wheelBorderWidth = 6; wheelBorder = dynPalette === 'dark' ? '#fbbf24' : '#1e3a8a'; }
      if (dynBorder === 'tech') { wheelBorderWidth = 4; wheelBorder = '#0ea5e9'; }
      if (dynBorder === 'ornate') { wheelBorderWidth = 3; wheelBorder = '#db2777'; }
      
    } else {
      if (template === 'classic') activeColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB', '#F1C40F', '#E67E22', '#E74C3C', '#2ECC71', '#1ABC9C', '#F39C12', '#D35400']
      if (template === 'pastel') { activeColors = ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff']; textFill = '#333333'; textShadow = 'rgba(255,255,255,0.5)'; wheelBorderWidth = 2; wheelBorder = '#ffffff'; }
      if (template === 'candy') { activeColors = ['#f472b6', '#c084fc', '#38bdf8', '#34d399', '#fbbf24']; textFill = '#ffffff'; textShadow = 'rgba(0,0,0,0.3)'; wheelBorderWidth = 3; wheelBorder = '#ffffff'; }
      if (template === 'rainbow') activeColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']
      if (template === 'ocean') activeColors = ['#0077b6', '#0096c7', '#00b4d8', '#48cae4', '#90e0ef', '#caf0f8']
      if (template === 'sunset') activeColors = ['#ff7b00', '#ff8800', '#ff9500', '#ffa200', '#ffaa00', '#ffb700', '#ffc300']
      if (template === 'dark') { activeColors = ['#1a1a1a', '#333333', '#4d4d4d', '#666666']; textFill = '#fbbf24'; wheelBorder = '#fbbf24'; wheelBorderWidth = 3; centerColor = '#fbbf24'; textShadow = 'rgba(0,0,0,0)' }
      if (template === 'luxury') { activeColors = ['#000000', '#111111', '#222222']; textFill = '#d4af37'; wheelBorder = '#d4af37'; wheelBorderWidth = 5; centerColor = '#d4af37'; textShadow = 'rgba(255,255,255,0.1)'}
      if (template === 'nature') { activeColors = ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7'] }
      if (template === 'neon') { activeColors = ['#ff00ff', '#00ffff', '#00ff00', '#ffff00']; textFill = '#ffffff'; textShadow = '0 0 5px rgba(255,255,255,0.8)'; wheelBorderWidth = 4; wheelBorder = '#ff00ff'; centerColor = '#00ffff'; }
    }

    if (names.length === 0) {
      // Draw empty wheel
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fillStyle = '#f0f0f0'
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = '#ccc'
      ctx.stroke()
      
      ctx.fillStyle = '#999'
      ctx.font = '24px Tajawal'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('أضف أسماء للبدء', centerX, centerY)
      return
    }

    const sliceAngle = (2 * Math.PI) / names.length

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotation)

    // Draw slices
    for (let i = 0; i < names.length; i++) {
      const startAngle = i * sliceAngle
      const endAngle = startAngle + sliceAngle

      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, startAngle, endAngle)
      ctx.closePath()
      
      ctx.fillStyle = activeColors[i % activeColors.length]
      ctx.fill()
      
      if (wheelBorderWidth > 0) {
        ctx.lineWidth = wheelBorderWidth
        ctx.strokeStyle = wheelBorder
        ctx.stroke()
      }

      // Draw text
      ctx.save()
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = textFill
      ctx.font = 'bold 20px Tajawal'
      
      // Add shadow for better readability
      ctx.shadowColor = textShadow
      ctx.shadowBlur = 4
      
      const text = names[i]
      // Truncate long names
      const displayText = text.length > 15 ? text.substring(0, 15) + '...' : text
      ctx.fillText(displayText, radius - 20, 0)
      ctx.restore()
    }

    // Draw center dot
    ctx.beginPath()
    ctx.arc(0, 0, 15, 0, 2 * Math.PI)
    ctx.fillStyle = centerColor
    ctx.fill()
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 5
    if (wheelBorderWidth > 0) {
      ctx.strokeStyle = wheelBorder
      ctx.stroke()
    }

    ctx.restore()
  }

  const spinWheel = () => {
    if (names.length === 0 || isSpinning) return
    
    setIsSpinning(true)
    setWinner(null)
    
    // Calculate a random number of rotations (between 5 and 10)
    const spins = Math.floor(Math.random() * 5) + 5
    
    // Choose a random winning index
    const winningIndex = Math.floor(Math.random() * names.length)
    
    // Calculate the angle per slice
    const sliceAngle = (2 * Math.PI) / names.length
    
    // We want the winning slice to end up at the top (which is -PI/2 relative to standard 0 on right)
    // The pointer is at the top.
    
    // The target angle for the center of the winning slice to be at the top:
    // angle = (winningIndex * sliceAngle) + (sliceAngle / 2)
    // To move it to the top (-PI/2), the rotation needed is:
    // rotation = -PI/2 - angle
    
    // Add extra full rotations
    const extraRotations = spins * 2 * Math.PI
    
    // Because we animate the rotation state from its current value, we need to add to it
    const currentRotationRaw = rotation % (2 * Math.PI)
    
    const targetAngle = -(winningIndex * sliceAngle) - (sliceAngle / 2) - (Math.PI / 2)
    
    // Total new rotation = current rotation + extra spins + adjust to target
    const finalRotation = rotation + extraRotations + (targetAngle - currentRotationRaw) - (2 * Math.PI * 3) // ensure lots of spinning

    // We can't do smooth CSS transitions on canvas drawn every frame easily with just React state for a 5s spin without requestAnimationFrame
    // Actually, it's easier to apply the CSS transition on the canvas container element!
    // But we need to know who won. We already calculated `winningIndex`.
    
    // Let's use a simpler approach: We animate a state value `rotation` using requestAnimationFrame for smooth 60fps
    let startTime = null
    const duration = 5000 // 5 seconds
    const startRotation = rotation
    
    // Random offset inside the winning slice so it doesn't always stop dead center
    const randomOffset = (Math.random() * 0.8 - 0.4) * sliceAngle 
    const finalTarget = rotation + extraRotations + (targetAngle - currentRotationRaw) + randomOffset

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4)

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      const percentage = Math.min(progress / duration, 1)
      
      const currentRot = startRotation + (finalTarget - startRotation) * easeOutQuart(percentage)
      setRotation(currentRot)

      if (progress < duration) {
        requestAnimationFrame(animate)
      } else {
        setIsSpinning(false)
        setWinner(names[winningIndex])
        
        // Optional: play a tada sound
        try {
          const audio = new Audio('/win-sound.mp3') // if exists
          audio.play().catch(e => {}) // ignore error if no sound
        } catch(e) {}
      }
    }

    requestAnimationFrame(animate)
  }

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>جاري التحميل...</div>

  return (
    <>
      <Head>
        <title>عجلة الأسماء | مساعد المعلم</title>
      </Head>
      
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>عجلة الحظ للأسماء 🎡</h1>
          <p>أداة تفاعلية لاختيار الطلاب عشوائياً للمشاركة أو التكريم</p>
        </header>

        <div className={styles.content}>
          
          <div className={styles.inputSection}>
            <div className={styles.formGroup} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                 <button onClick={() => setDesignMode('fixed')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: designMode === 'fixed' ? '#3b82f6' : '#e2e8f0', color: designMode === 'fixed' ? 'white' : '#475569', cursor: 'pointer', fontWeight: 'bold' }}>قوالب العجلة</button>
                 <button onClick={() => setDesignMode('dynamic')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: designMode === 'dynamic' ? '#10b981' : '#e2e8f0', color: designMode === 'dynamic' ? 'white' : '#475569', cursor: 'pointer', fontWeight: 'bold' }}>محرك ذكي 👑</button>
              </div>

              {designMode === 'fixed' && (
                <>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>التصميم الجاهز</label>
                  <select style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1'}} value={template} onChange={(e) => setTemplate(e.target.value)}>
                    <option value="classic">كلاسيكي (مجاني)</option>
                    <option value="pastel">باستيل هادئ (مجاني)</option>
                    <option value="candy">حلوى مبهجة (مجاني)</option>
                    <option value="rainbow" disabled={!isPremium}>ألوان الطيف (مدفوع)</option>
                    <option value="ocean" disabled={!isPremium}>أعماق المحيط (مدفوع)</option>
                    <option value="sunset" disabled={!isPremium}>غروب الشمس (مدفوع)</option>
                    <option value="nature" disabled={!isPremium}>طبيعة خضراء (مدفوع)</option>
                    <option value="dark" disabled={!isPremium}>الوضع الداكن (مدفوع)</option>
                    <option value="luxury" disabled={!isPremium}>فخامة ذهبية (مدفوع)</option>
                    <option value="neon" disabled={!isPremium}>إضاءة نيون (مدفوع)</option>
                  </select>
                </>
              )}

              {designMode === 'dynamic' && (
                <div style={{ opacity: isPremium ? 1 : 0.5, pointerEvents: isPremium ? 'auto' : 'none', position: 'relative' }}>
                  {!isPremium && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{background: '#ef4444', color: 'white', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold'}}>للمشتركين فقط</span></div>}
                  
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>نمط الإطار</label>
                  <select style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '10px'}} value={dynBorder} onChange={e => setDynBorder(e.target.value)}>
                    <option value="none">بدون إطار</option>
                    <option value="thin">إطار رفيع بسيط</option>
                    <option value="double">إطار مزدوج سميك</option>
                    <option value="tech">إطار رقمي تكنولوجي</option>
                    <option value="ornate">إطار مزخرف</option>
                  </select>

                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>لوحة الألوان</label>
                  <select style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: dynPalette === 'custom' ? '10px' : '0'}} value={dynPalette} onChange={e => setDynPalette(e.target.value)}>
                    <option value="blue">تدرجات الأزرق</option>
                    <option value="green">تدرجات الأخضر</option>
                    <option value="red">تدرجات الأحمر</option>
                    <option value="dark">لوحة ليلية داكنة</option>
                    <option value="custom" disabled={!isPremium}>ألوان مخصصة (مدفوع)</option>
                  </select>

                  {dynPalette === 'custom' && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
                      <label>الألوان:</label>
                      <input type="color" value={customColor1} onChange={e => setCustomColor1(e.target.value)} style={{ border: 'none', background: 'transparent', width: '40px', height: '40px', cursor: 'pointer' }} />
                      <input type="color" value={customColor2} onChange={e => setCustomColor2(e.target.value)} style={{ border: 'none', background: 'transparent', width: '40px', height: '40px', cursor: 'pointer' }} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ margin: 0, fontWeight: 'bold' }}>قائمة الأسماء (اسم في كل سطر)</label>
                <button 
                  onClick={() => setShowRosterManager(true)}
                  style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  📂 حقيبة القوائم الذكية
                </button>
              </div>
              <textarea 
                className={styles.textarea}
                value={namesText}
                onChange={(e) => setNamesText(e.target.value)}
                placeholder="أحمد&#10;محمد&#10;محمود"
                disabled={isSpinning}
              />
            </div>
            <p style={{fontSize: '0.9rem', color: '#666', marginTop: '10px'}}>
              العدد الحالي: <strong>{names.length}</strong> أسماء
            </p>
          </div>

          <div className={styles.wheelSection}>
            <div className={styles.wheelContainer}>
              <div className={styles.pointer}></div>
              <canvas 
                ref={canvasRef}
                width={500}
                height={500}
                className={styles.canvas}
              />
            </div>
            
            <button 
              className={styles.spinBtn}
              onClick={spinWheel}
              disabled={isSpinning || names.length === 0}
            >
              {isSpinning ? 'جاري اللف...' : 'لف العجلة! 🎲'}
            </button>

            {/* Winner Modal */}
            {winner && (
              <div className={styles.winnerOverlay}>
                <h2 style={{fontSize: '2rem', color: '#e11d48', margin: '0'}}>🎉 الفائز هو 🎉</h2>
                <div className={styles.winnerText}>{winner}</div>
                <button className={styles.closeBtn} onClick={() => setWinner(null)}>إغلاق</button>
              </div>
            )}

            {showRosterManager && (
              <RosterManager 
                teacherId={teacher?.id}
                currentList={namesText}
                onImport={(list) => setNamesText(list)}
                onClose={() => setShowRosterManager(false)}
              />
            )}
          </div>

        </div>
      </div>
    </>
  )
}
