'use client'

import React, { useState, useEffect, useRef } from 'react'
import styles from '../teacher-assistant/leaderboard/page.module.css'

export default function LiveLeaderboardStudent({ channel }) {
  const [formData, setFormData] = useState({
    title: 'جاري التحميل...',
    subtitle: '',
    studentsText: '',
    template: 'gold',
    designMode: 'fixed',
    dynBg: 'solid',
    dynBorder: 'none',
    dynPalette: 'blue',
    customImage: null
  })
  
  const canvasRef = useRef(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    
    if (channel && channel.state === 'joined') {
      channel.send({
        type: 'broadcast',
        event: 'request_state',
        payload: {}
      }).catch(console.error)
      channel.send({
        type: 'broadcast',
        event: 'global_sync_request',
        payload: {}
      }).catch(console.error)
    }

    return () => {
      isMountedRef.current = false
    }
  }, [channel])

  useEffect(() => {
    if (!channel) return

    const handler = (e) => {
      if (!isMountedRef.current) return
      if (e.detail) setFormData(e.detail)
    }
    window.addEventListener('on_leaderboard_state', handler)

    return () => {
      window.removeEventListener('on_leaderboard_state', handler)
    }
  }, [channel])

  useEffect(() => {
    drawLeaderboard()
  }, [formData])

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
         for(let i=0; i<40; i++) { ctx.beginPath(); ctx.arc(Math.random()*canvasWidth, Math.random()*canvasHeight, Math.random()*3, 0, Math.PI*2); ctx.fill(); }
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
      }
      img.src = formData.customImage
    }
  }

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', padding: '10px', overflow: 'hidden' }}>
      <div style={{ maxWidth: 'min(92vw, 75vh, 650px)', width: '100%', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas 
          ref={canvasRef}
          width={1080}
          height={1080}
          style={{ width: '100%', height: '100%', objectFit: 'contain', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', borderRadius: '20px', background: 'white', display: 'block' }}
        />
      </div>
    </div>
  )
}
