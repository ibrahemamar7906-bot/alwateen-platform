'use client'

import React, { useState, useEffect, useRef } from 'react'
import styles from '../../teacher-assistant/wheel/page.module.css'
import { removeBroadcastBinding } from '../../utils/realtimeHelper'

export default function LiveWheelTeacher({ channel, peers }) {
  const [namesText, setNamesText] = useState('')
  const [names, setNames] = useState([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState(null)
  const [rotation, setRotation] = useState(0)
  
  const [designMode, setDesignMode] = useState('fixed')
  const [template, setTemplate] = useState('classic')
  const [dynBg, setDynBg] = useState('solid') 
  const [dynBorder, setDynBorder] = useState('none')
  const [dynPalette, setDynPalette] = useState('blue')
  const [customColor1, setCustomColor1] = useState('#8b5cf6')
  const [customColor2, setCustomColor2] = useState('#ec4899')

  const canvasRef = useRef(null)
  const channelRef = useRef(channel)
  const rafIdRef = useRef(null) // Store rAF ID for cancellation on unmount

  useEffect(() => {
    channelRef.current = channel
  }, [channel])

  // Cancel any in-progress animation on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Initialization: load peers only if namesText is empty initially
  useEffect(() => {
    if (peers && peers.length > 0) {
      const studentNames = peers.filter(p => !p.isTeacher).map(p => p.name).join('\n')
      if (studentNames && namesText === '') {
        setNamesText(studentNames)
      }
    }
  }, [peers])

  useEffect(() => {
    const parsedNames = namesText.split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0)
    setNames(parsedNames)
  }, [namesText])

  const configRef = useRef({ names, designMode, template, dynBg, dynBorder, dynPalette, customColor1, customColor2 })
  useEffect(() => {
    configRef.current = { names, designMode, template, dynBg, dynBorder, dynPalette, customColor1, customColor2 }
  }, [names, designMode, template, dynBg, dynBorder, dynPalette, customColor1, customColor2])

  // Broadcast configuration whenever design or names change
  useEffect(() => {
    if (channelRef.current && channelRef.current.state === 'joined' && !isSpinning) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'wheel_config',
        payload: { names, designMode, template, dynBg, dynBorder, dynPalette, customColor1, customColor2 }
      }).catch(e => console.error(e))
    }
    drawWheel()
  }, [names, rotation, template, designMode, dynBg, dynBorder, dynPalette, customColor1, customColor2, isSpinning])

  // Also listen to request_state or global_sync_request from late-joining students
  useEffect(() => {
    if (!channel) return;
    const sendSync = () => {
      channel.send({
        type: 'broadcast',
        event: 'wheel_config',
        payload: configRef.current
      }).catch(console.error)
    }
    
    channel.on('broadcast', { event: 'request_state' }, sendSync)
    channel.on('broadcast', { event: 'global_sync_request' }, sendSync)
    window.addEventListener('on_global_sync_request', sendSync)
    
    return () => {
      removeBroadcastBinding(channel, 'request_state', sendSync)
      removeBroadcastBinding(channel, 'global_sync_request', sendSync)
      window.removeEventListener('on_global_sync_request', sendSync)
    }
  }, [channel])


  const drawWheel = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 10 

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

      ctx.save()
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = textFill
      ctx.font = 'bold 20px Tajawal'
      ctx.shadowColor = textShadow
      ctx.shadowBlur = 4
      
      const text = names[i]
      const displayText = text.length > 15 ? text.substring(0, 15) + '...' : text
      ctx.fillText(displayText, radius - 20, 0)
      ctx.restore()
    }

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
    
    const spins = Math.floor(Math.random() * 5) + 5
    const winningIndex = Math.floor(Math.random() * names.length)
    const sliceAngle = (2 * Math.PI) / names.length
    
    const extraRotations = spins * 2 * Math.PI
    const currentRotationRaw = rotation % (2 * Math.PI)
    const targetAngle = -(winningIndex * sliceAngle) - (sliceAngle / 2) - (Math.PI / 2)
    const randomOffset = (Math.random() * 0.8 - 0.4) * sliceAngle 
    const finalTarget = rotation + extraRotations + (targetAngle - currentRotationRaw) + randomOffset

    const duration = 5000 // 5 seconds

    // Broadcast spin to students
    if (channelRef.current && channelRef.current.state === 'joined') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'wheel_spin',
        payload: { targetRotation: finalTarget, winnerName: names[winningIndex], duration }
      }).catch(e => console.error(e))
    }

    let startTime = null
    const startRotation = rotation
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4)

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      const percentage = Math.min(progress / duration, 1)
      
      const currentRot = startRotation + (finalTarget - startRotation) * easeOutQuart(percentage)
      setRotation(currentRot)

      if (progress < duration) {
        rafIdRef.current = requestAnimationFrame(animate)
      } else {
        rafIdRef.current = null;
        setIsSpinning(false)
        setWinner(names[winningIndex])
        try {
          const audio = new Audio('/win-sound.mp3')
          audio.play().catch(e => {}) 
        } catch(e) {}
      }
    }

    rafIdRef.current = requestAnimationFrame(animate)
  }

  return (
    <div style={{ height: '100%', width: '100%', background: '#fff', borderRadius: '14px', padding: 'clamp(8px, 1.5vw, 16px)', overflowY: 'auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', flex: 1, alignItems: 'flex-start' }}>
        
        {/* Controls / Inputs Section */}
        <div style={{ flex: '1 1 260px', background: '#f8fafc', padding: '12px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', minWidth: '0' }}>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
               <button onClick={() => setDesignMode('fixed')} style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: 'none', background: designMode === 'fixed' ? '#3b82f6' : '#e2e8f0', color: designMode === 'fixed' ? 'white' : '#475569', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>قوالب جاهزة</button>
               <button onClick={() => setDesignMode('dynamic')} style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: 'none', background: designMode === 'dynamic' ? '#10b981' : '#e2e8f0', color: designMode === 'dynamic' ? 'white' : '#475569', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>محرك ذكي 👑</button>
            </div>

            {designMode === 'fixed' && (
              <div>
                <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.8rem'}}>التصميم الجاهز</label>
                <select style={{width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: 'white'}} value={template} onChange={(e) => setTemplate(e.target.value)}>
                  <option value="classic">كلاسيكي (مجاني)</option>
                  <option value="pastel">باستيل هادئ (مجاني)</option>
                  <option value="candy">حلوى مبهجة (مجاني)</option>
                  <option value="rainbow">ألوان الطيف (مدفوع)</option>
                  <option value="ocean">أعماق المحيط (مدفوع)</option>
                  <option value="sunset">غروب الشمس (مدفوع)</option>
                  <option value="nature">طبيعة خضراء (مدفوع)</option>
                  <option value="dark">الوضع الداكن (مدفوع)</option>
                  <option value="luxury">فخامة ذهبية (مدفوع)</option>
                  <option value="neon">إضاءة نيون (مدفوع)</option>
                </select>
              </div>
            )}

            {designMode === 'dynamic' && (
              <div>
                <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.8rem'}}>نمط الإطار</label>
                <select style={{width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '6px', fontSize: '0.8rem', background: 'white'}} value={dynBorder} onChange={e => setDynBorder(e.target.value)}>
                  <option value="none">بدون إطار</option>
                  <option value="thin">إطار رفيع بسيط</option>
                  <option value="double">إطار مزدوج سميك</option>
                  <option value="tech">إطار رقمي تكنولوجي</option>
                  <option value="ornate">إطار مزخرف</option>
                </select>

                <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.8rem'}}>لوحة الألوان</label>
                <select style={{width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: dynPalette === 'custom' ? '6px' : '0', fontSize: '0.8rem', background: 'white'}} value={dynPalette} onChange={e => setDynPalette(e.target.value)}>
                  <option value="blue">تدرجات الأزرق</option>
                  <option value="green">تدرجات الأخضر</option>
                  <option value="red">تدرجات الأحمر</option>
                  <option value="dark">لوحة ليلية داكنة</option>
                  <option value="custom">ألوان مخصصة (مدفوع)</option>
                </select>

                {dynPalette === 'custom' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
                    <label style={{fontSize: '0.8rem'}}>الألوان:</label>
                    <input type="color" value={customColor1} onChange={e => setCustomColor1(e.target.value)} style={{ border: 'none', background: 'transparent', width: '32px', height: '32px', cursor: 'pointer' }} />
                    <input type="color" value={customColor2} onChange={e => setCustomColor2(e.target.value)} style={{ border: 'none', background: 'transparent', width: '32px', height: '32px', cursor: 'pointer' }} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px'}}>
              <label style={{fontWeight: 'bold', color: '#334155', fontSize: '0.8rem'}}>قائمة الأسماء:</label>
              <span style={{fontSize: '0.75rem', color: '#64748b'}}>({names.length} أسماء)</span>
            </div>
            <textarea 
              style={{width: '100%', height: '120px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.85rem', resize: 'vertical', background: 'white', boxSizing: 'border-box'}}
              value={namesText}
              onChange={(e) => setNamesText(e.target.value)}
              placeholder="أحمد&#10;محمد&#10;محمود"
              disabled={isSpinning}
            />
          </div>
        </div>

        {/* Wheel Display Section */}
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', position: 'relative', minWidth: '0' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 'clamp(220px, 40vw, 360px)', aspectRatio: '1/1', marginBottom: '16px' }}>
            <div className={styles.pointer}></div>
            <canvas 
              ref={canvasRef}
              width={500}
              height={500}
              style={{ width: '100%', height: '100%', display: 'block', borderRadius: '50%' }}
            />
          </div>
          
          <button 
            style={{ padding: '10px 24px', fontSize: '1rem', fontWeight: 'bold', color: 'white', background: isSpinning || names.length === 0 ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: 'none', borderRadius: '12px', cursor: isSpinning || names.length === 0 ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s' }}
            onClick={spinWheel}
            disabled={isSpinning || names.length === 0}
          >
            {isSpinning ? 'جاري اللف...' : 'لف العجلة! 🎲'}
          </button>

          {winner && (
            <div className={styles.winnerOverlay}>
              <h2 style={{fontSize: '1.8rem', color: '#e11d48', margin: '0'}}>🎉 الفائز هو 🎉</h2>
              <div className={styles.winnerText}>{winner}</div>
              <button className={styles.closeBtn} onClick={() => setWinner(null)}>إغلاق</button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
