'use client'

import React, { useState, useEffect, useRef } from 'react'
import styles from '../../teacher-assistant/leaderboard/page.module.css'
import { removeBroadcastBinding } from '../../utils/realtimeHelper'

export default function LiveLeaderboardTeacher({ channel, peers }) {
  const [formData, setFormData] = useState({
    title: 'لوحة الشرف 🏆',
    subtitle: 'نجوم البث المباشر',
    studentsText: '',
    template: 'gold',
    designMode: 'fixed',
    dynBg: 'solid',
    dynBorder: 'none',
    dynPalette: 'blue',
    customImage: null
  })
  
  const canvasRef = useRef(null)
  const channelRef = useRef(channel)
  const isMountedRef = useRef(true)
  // Cache star positions so they don't re-randomize on every draw (flicker fix)
  const starPositionsRef = useRef([])
  // Cache loaded Image object to avoid async draw race condition
  const cachedImageRef = useRef(null)
  const cachedImageSrcRef = useRef(null)

  // Init with peers
  useEffect(() => {
    isMountedRef.current = true
    if (peers && peers.length > 0 && formData.studentsText === '') {
      const studentNames = peers.filter(p => !p.isTeacher).map(p => `${p.name} - 100`).join('\n')
      if (studentNames) {
        setFormData(prev => ({ ...prev, studentsText: studentNames }))
      }
    }
    return () => { isMountedRef.current = false }
  }, [peers])

  // Sync channel ref
  useEffect(() => {
    channelRef.current = channel
  }, [channel])

  // Broadcast state on change and draw locally
  useEffect(() => {
    drawLeaderboard()
    if (channelRef.current && channelRef.current.state === 'joined') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'leaderboard_state',
        payload: formData
      }).catch(console.error)
    }
  }, [formData])

  const formDataRef = useRef(formData)
  useEffect(() => {
    formDataRef.current = formData
  }, [formData])

  // Handle late students requesting state
  useEffect(() => {
    if (!channel) return;
    const sendSync = () => {
      channel.send({
        type: 'broadcast',
        event: 'leaderboard_state',
        payload: formDataRef.current
      }).catch(console.error)
    }

    channel.on('broadcast', { event: 'request_state' }, sendSync);
    channel.on('broadcast', { event: 'global_sync_request' }, sendSync);
    window.addEventListener('on_global_sync_request', sendSync);

    return () => {
      removeBroadcastBinding(channel, 'request_state', sendSync);
      removeBroadcastBinding(channel, 'global_sync_request', sendSync);
      window.removeEventListener('on_global_sync_request', sendSync);
    }
  }, [channel])

  const handleImageUpload = (e) => {
    if (!e.target.files[0]) return
    const reader = new FileReader()
    reader.onload = (f) => {
      setFormData(prev => ({ ...prev, customImage: f.target.result }))
    }
    reader.readAsDataURL(e.target.files[0])
    e.target.value = null
  }

  const getStudentsList = () => {
    const lines = formData.studentsText.split('\n').map(l => l.trim()).filter(l => l !== '')
    return lines.map(line => {
      const match = line.match(/^(.*?)\s*(?:[-:]|)\s*([0-9]+(?:\.[0-9]+)?%?)$/)
      if (match) {
        return { name: match[1].trim(), score: match[2].trim() }
      }
      return { name: line, score: null }
    })
  }

  const drawLeaderboard = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const canvasWidth = 1080
    const canvasHeight = 1080
    const students = getStudentsList()
    
    let titleColor = '#1e3a8a'
    let subtitleColor = '#475569'
    let dividerColor = '#cbd5e1'
    let baseRankColor = '#334155'
    let footerColor = '#64748b'
    let customImageBorderColor = '#1e3a8a'

    if (formData.designMode === 'dynamic') {
      if (formData.dynBg === 'solid') {
         ctx.fillStyle = formData.dynPalette === 'dark' ? '#0f172a' : (formData.dynPalette === 'green' ? '#f0fdf4' : '#ffffff');
         ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else if (formData.dynBg === 'gradient') {
         const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
         grad.addColorStop(0, formData.dynPalette === 'blue' ? '#eff6ff' : '#fff1f2');
         grad.addColorStop(1, formData.dynPalette === 'blue' ? '#bfdbfe' : '#fecdd3');
         ctx.fillStyle = grad;
         ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else if (formData.dynBg === 'waves') {
         ctx.fillStyle = formData.dynPalette === 'dark' ? '#1e293b' : '#f8fafc';
         ctx.fillRect(0, 0, canvasWidth, canvasHeight);
         ctx.fillStyle = formData.dynPalette === 'blue' ? '#3b82f6' : '#ec4899';
         ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(canvasWidth,0); ctx.bezierCurveTo(canvasWidth-100,200, 100,50, 0,300); ctx.fill();
      } else if (formData.dynBg === 'stars') {
         ctx.fillStyle = '#170529'; ctx.fillRect(0, 0, canvasWidth, canvasHeight);
         ctx.fillStyle = '#ffffff';
         // Use cached positions — regenerate only when count changes to prevent flicker
         if (starPositionsRef.current.length !== 40) {
           starPositionsRef.current = Array.from({ length: 40 }, () => ({
             x: Math.random() * canvasWidth,
             y: Math.random() * canvasHeight,
             r: Math.random() * 3
           }));
         }
         for (const star of starPositionsRef.current) {
           ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2); ctx.fill();
         }
      } else if (formData.dynBg === 'parchment') {
         ctx.fillStyle = '#fef3c7'; ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else if (formData.dynBg === 'geometric') {
         ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvasWidth, canvasHeight);
         ctx.fillStyle = formData.dynPalette === 'green' ? '#22c55e' : '#f59e0b';
         ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(300,0); ctx.lineTo(0,300); ctx.fill();
         ctx.fillStyle = formData.dynPalette === 'blue' ? '#3b82f6' : '#8b5cf6';
         ctx.beginPath(); ctx.moveTo(canvasWidth,canvasHeight); ctx.lineTo(canvasWidth-300,canvasHeight); ctx.lineTo(canvasWidth,canvasHeight-300); ctx.fill();
      }

      ctx.strokeStyle = formData.dynPalette === 'dark' || formData.dynBg === 'stars' ? '#fbbf24' : (formData.dynPalette === 'red' ? '#e11d48' : '#1e3a8a');
      if (formData.dynBorder === 'thin') {
         ctx.lineWidth = 2; ctx.strokeRect(40, 40, canvasWidth-80, canvasHeight-80);
      } else if (formData.dynBorder === 'double') {
         ctx.lineWidth = 8; ctx.strokeRect(30, 30, canvasWidth-60, canvasHeight-60);
         ctx.lineWidth = 2; ctx.strokeRect(45, 45, canvasWidth-90, canvasHeight-90);
      } else if (formData.dynBorder === 'tech') {
         ctx.lineWidth = 4;
         ctx.beginPath(); ctx.moveTo(30,100); ctx.lineTo(30,30); ctx.lineTo(100,30); ctx.stroke();
         ctx.beginPath(); ctx.moveTo(canvasWidth-100,30); ctx.lineTo(canvasWidth-30,30); ctx.lineTo(canvasWidth-30,100); ctx.stroke();
         ctx.beginPath(); ctx.moveTo(30,canvasHeight-100); ctx.lineTo(30,canvasHeight-30); ctx.lineTo(100,canvasHeight-30); ctx.stroke();
         ctx.beginPath(); ctx.moveTo(canvasWidth-100,canvasHeight-30); ctx.lineTo(canvasWidth-30,canvasHeight-30); ctx.lineTo(canvasWidth-30,canvasHeight-100); ctx.stroke();
      } else if (formData.dynBorder === 'ornate') {
         ctx.lineWidth = 15; ctx.setLineDash([20, 20]); ctx.strokeRect(30, 30, canvasWidth-60, canvasHeight-60); ctx.setLineDash([]);
      }

      titleColor = ctx.strokeStyle;
      subtitleColor = (formData.dynBg === 'stars' || formData.dynPalette === 'dark') ? '#cbd5e1' : '#475569';
      dividerColor = subtitleColor;
      baseRankColor = subtitleColor;
      footerColor = subtitleColor;
      customImageBorderColor = ctx.strokeStyle;
    } else {
      if (formData.template === 'gold') {
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 15
        ctx.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60)
        ctx.strokeStyle = '#d97706'
        ctx.lineWidth = 3
        ctx.strokeRect(50, 50, canvasWidth - 100, canvasHeight - 100)
        
        ctx.fillStyle = '#fbbf24'
      } else if (formData.template === 'neon') {
        ctx.fillStyle = '#1e1b4b'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.strokeStyle = '#22d3ee'
        ctx.lineWidth = 8
        ctx.strokeRect(40, 40, canvasWidth - 80, canvasHeight - 80)
        ctx.strokeStyle = '#f472b6'
        ctx.lineWidth = 4
        ctx.strokeRect(50, 50, canvasWidth - 100, canvasHeight - 100)

        ctx.fillStyle = '#22d3ee'
      } else if (formData.template === 'classic') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.strokeStyle = '#1e3a8a'
        ctx.lineWidth = 10
        ctx.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60)
        
        ctx.fillStyle = '#1e3a8a'
      }
      
      if (formData.template === 'gold') { titleColor = '#fbbf24'; subtitleColor = '#f8fafc'; dividerColor = '#475569'; baseRankColor = '#e2e8f0'; footerColor = '#94a3b8'; customImageBorderColor = '#fbbf24'; }
      if (formData.template === 'neon') { titleColor = '#22d3ee'; subtitleColor = '#f472b6'; dividerColor = '#475569'; baseRankColor = '#e0e7ff'; footerColor = '#94a3b8'; customImageBorderColor = '#22d3ee'; }
      if (formData.template === 'classic') { titleColor = '#1e3a8a'; subtitleColor = '#475569'; dividerColor = '#cbd5e1'; baseRankColor = '#334155'; footerColor = '#64748b'; customImageBorderColor = '#1e3a8a'; }
    }

    ctx.fillStyle = titleColor
    ctx.font = 'bold 70px "Tajawal", "Cairo", Arial'
    ctx.textAlign = 'center'
    ctx.fillText(formData.title || 'لوحة الشرف', canvasWidth / 2, 140)

    ctx.fillStyle = subtitleColor
    ctx.font = '35px "Tajawal", "Cairo", Arial'
    ctx.fillText(formData.subtitle || '', canvasWidth / 2, 210)

    ctx.beginPath()
    ctx.moveTo(canvasWidth / 2 - 200, 240)
    ctx.lineTo(canvasWidth / 2 + 200, 240)
    ctx.lineWidth = 2
    ctx.strokeStyle = dividerColor
    ctx.stroke()

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
      
      let colWidth = (canvasWidth - 160) / cols
      let x = canvasWidth - 80 - (colWidth * col) - (colWidth / 2)
      let y = startY + (row * stepY) + (stepY / 2)

      let rankColor = ''
      let prefix = ''
      if (i === 0) {
        rankColor = '#fbbf24'
        prefix = '👑 '
      } else if (i === 1) {
        rankColor = '#cbd5e1'
        prefix = '🥈 '
      } else if (i === 2) {
        rankColor = '#b45309'
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

    ctx.font = '25px "Tajawal", "Cairo", Arial'
    ctx.fillStyle = footerColor
    ctx.textAlign = 'center'
    ctx.fillText('بث مباشر - لوحة الشرف التفاعلية', canvasWidth / 2, 1020)

    if (formData.customImage) {
      // If src changed, load and cache the new image then redraw
      if (formData.customImage !== cachedImageSrcRef.current) {
        cachedImageSrcRef.current = formData.customImage;
        cachedImageRef.current = null; // invalidate cache while loading
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!isMountedRef.current) return;
          cachedImageRef.current = img;
          // Trigger a fresh draw now that the image is loaded
          drawLeaderboard();
        };
        img.src = formData.customImage;
      } else if (cachedImageRef.current) {
        // Image already cached — draw it synchronously (no flicker)
        const img = cachedImageRef.current;
        const imgAspect = img.width / img.height;
        let drawW = 100, drawH = 100;
        if (imgAspect > 1) { drawW = 100 * imgAspect; } else { drawH = 100 / imgAspect; }
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvasWidth / 2, 940, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, canvasWidth / 2 - drawW / 2, 940 - drawH / 2, drawW, drawH);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(canvasWidth / 2, 940, 50, 0, Math.PI * 2, true);
        ctx.lineWidth = 3;
        ctx.strokeStyle = customImageBorderColor;
        ctx.stroke();
      }
    } else {
      // Image removed — invalidate cache
      cachedImageRef.current = null;
      cachedImageSrcRef.current = null;
    }
  }

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  return (
    <div style={{ height: '100%', width: '100%', background: '#fff', borderRadius: '14px', padding: 'clamp(8px, 1.5vw, 16px)', overflowY: 'auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: '16px', flex: 1, alignItems: 'flex-start' }}>
        
        {/* Sidebar Controls */}
        <div style={{ flex: '1 1 280px', background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '3px' }}>العنوان الرئيسي</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', background: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '3px' }}>العنوان الفرعي</label>
            <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', background: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '3px' }}>أسماء الطلاب (والدرجات اختيارياً)</label>
            <textarea name="studentsText" value={formData.studentsText} onChange={handleChange} style={{ width: '100%', height: '110px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', background: 'white', resize: 'vertical' }} placeholder="أحمد محمد - 100&#10;يوسف علي - 98&#10;فاطمة محمود" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '3px' }}>شعار أو صورة (اختياري)</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%', fontSize: '0.8rem' }} />
            {formData.customImage && (
              <button onClick={() => setFormData(prev => ({ ...prev, customImage: null }))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', textAlign: 'right', fontSize: '0.75rem', marginTop: '4px', fontWeight: 'bold' }}>إزالة الصورة ❌</button>
            )}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
               <button onClick={() => setFormData(prev => ({...prev, designMode: 'fixed'}))} style={{ flex: 1, padding: '6px 8px', borderRadius: '8px', border: 'none', background: formData.designMode === 'fixed' ? '#3b82f6' : '#e2e8f0', color: formData.designMode === 'fixed' ? 'white' : '#475569', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>قوالب جاهزة</button>
               <button onClick={() => setFormData(prev => ({...prev, designMode: 'dynamic'}))} style={{ flex: 1, padding: '6px 8px', borderRadius: '8px', border: 'none', background: formData.designMode === 'dynamic' ? '#10b981' : '#e2e8f0', color: formData.designMode === 'dynamic' ? 'white' : '#475569', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>محرك ذكي 👑</button>
            </div>

            {formData.designMode === 'fixed' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '3px' }}>التصميم الجاهز</label>
                <select name="template" value={formData.template} onChange={handleChange} style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: 'white' }}>
                  <option value="classic">الكلاسيكي الأبيض</option>
                  <option value="gold">الذهبي الفاخر</option>
                  <option value="neon">النيون العصري</option>
                </select>
              </div>
            )}

            {formData.designMode === 'dynamic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '2px' }}>نمط الخلفية</label>
                  <select name="dynBg" value={formData.dynBg} onChange={handleChange} style={{ width: '100%', padding: '5px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: 'white' }}>
                    <option value="solid">لون سادة</option>
                    <option value="gradient">تدرج لوني</option>
                    <option value="waves">أمواج مائية</option>
                    <option value="stars">فضاء ونجوم</option>
                    <option value="parchment">ورق كلاسيكي</option>
                    <option value="geometric">أشكال هندسية</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '2px' }}>نمط الإطار</label>
                  <select name="dynBorder" value={formData.dynBorder} onChange={handleChange} style={{ width: '100%', padding: '5px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: 'white' }}>
                    <option value="none">بدون إطار</option>
                    <option value="thin">إطار رفيع بسيط</option>
                    <option value="double">إطار مزدوج كلاسيكي</option>
                    <option value="tech">إطار تكنولوجي رقمي</option>
                    <option value="ornate">إطار مزخرف (منقط)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '2px' }}>لوحة الألوان</label>
                  <select name="dynPalette" value={formData.dynPalette} onChange={handleChange} style={{ width: '100%', padding: '5px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: 'white' }}>
                    <option value="blue">أزرق سماوي</option>
                    <option value="green">أخضر زمردي</option>
                    <option value="red">أحمر قرمزي</option>
                    <option value="dark">وضع ليلي داكن (Dark)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Canvas Preview */}
        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '0' }}>
          <div style={{ width: '100%', maxWidth: 'clamp(280px, 45vw, 550px)', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <canvas 
              ref={canvasRef}
              width={1080}
              height={1080}
              style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.2)', borderRadius: '14px', width: '100%', height: '100%', display: 'block' }}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
