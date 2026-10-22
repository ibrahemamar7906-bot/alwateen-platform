'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Award, Download, Sparkles, X } from 'lucide-react'

export default function LiveCertificatesStudent({ channel, deviceId, studentName }) {
  const [certData, setCertData] = useState({
    studentName: 'اسم الطالب',
    title: 'شهادة شكر وتقدير',
    reason: 'لتفوقه وبراعته في إجابة الأسئلة وحصوله على المركز الأول',
    teacherName: 'أ/ عبد الله الوتين',
    template: 'gold',
    date: new Date().toLocaleDateString('ar-EG')
  })

  const [awardedModal, setAwardedModal] = useState(null)
  const canvasRef = useRef(null)

  // Listen to live certificate sync and awards
  useEffect(() => {
    if (!channel) return

    const previewHandler = (e) => { if (e.detail) setCertData(e.detail) }
    const awardHandler = (e) => {
      const payload = e.detail
      if (payload) {
        const isMe = payload.targetDeviceId === deviceId || (studentName && payload.studentName.trim() === studentName.trim())
        if (isMe) {
          setAwardedModal(payload)
          playVictorySound()
        }
      }
    }
    window.addEventListener('on_certificate_preview_sync', previewHandler)
    window.addEventListener('on_certificate_awarded', awardHandler)

    // Request latest preview on join
    if (channel && channel.state === 'joined') {
      channel.send({ type: 'broadcast', event: 'global_sync_request', payload: {} }).catch(() => {})
      channel.send({ type: 'broadcast', event: 'request_state', payload: {} }).catch(() => {})
    }

    return () => {
      window.removeEventListener('on_certificate_preview_sync', previewHandler)
      window.removeEventListener('on_certificate_awarded', awardHandler)
    }
  }, [channel, deviceId, studentName])

  // Draw certificate on main view
  useEffect(() => {
    drawCertificate(certData)
  }, [certData])

  const playVictorySound = () => {
    if (typeof window === 'undefined') return
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const now = ctx.currentTime

    // Victory fanfare notes
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + i * 0.15)
      gain.gain.setValueAtTime(0.3, now + i * 0.15)
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.4)
      osc.start(now + i * 0.15)
      osc.stop(now + i * 0.15 + 0.4)
    })
  }

  const drawCertificate = (data) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = 1200
    const height = 850
    canvas.width = width
    canvas.height = height

    const template = data.template || 'gold'

    // Backgrounds based on template
    if (template === 'gold') {
      const grad = ctx.createLinearGradient(0, 0, width, height)
      grad.addColorStop(0, '#ffffff')
      grad.addColorStop(0.5, '#fffdf5')
      grad.addColorStop(1, '#fef9c3')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = '#d97706'
      ctx.lineWidth = 14
      ctx.strokeRect(30, 30, width - 60, height - 60)

      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 4
      ctx.strokeRect(45, 45, width - 90, height - 90)

    } else if (template === 'royal') {
      const grad = ctx.createLinearGradient(0, 0, width, height)
      grad.addColorStop(0, '#0f172a')
      grad.addColorStop(1, '#1e1b4b')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 12
      ctx.strokeRect(30, 30, width - 60, height - 60)

      ctx.strokeStyle = '#818cf8'
      ctx.lineWidth = 4
      ctx.strokeRect(45, 45, width - 90, height - 90)

    } else if (template === 'emerald') {
      const grad = ctx.createLinearGradient(0, 0, width, height)
      grad.addColorStop(0, '#f0fdf4')
      grad.addColorStop(1, '#dcfce7')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = '#059669'
      ctx.lineWidth = 12
      ctx.strokeRect(30, 30, width - 60, height - 60)

      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 4
      ctx.strokeRect(45, 45, width - 90, height - 90)

    } else if (template === 'kids') {
      const grad = ctx.createLinearGradient(0, 0, width, height)
      grad.addColorStop(0, '#eff6ff')
      grad.addColorStop(0.5, '#fdf2f8')
      grad.addColorStop(1, '#fef3c7')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = '#ec4899'
      ctx.lineWidth = 14
      ctx.strokeRect(30, 30, width - 60, height - 60)

      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 4
      ctx.strokeRect(45, 45, width - 90, height - 90)
    }

    ctx.textAlign = 'center'
    const isDark = template === 'royal'
    
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b'
    ctx.font = 'bold 24px Tajawal, sans-serif'
    ctx.fillText('منصة الوتين للتعليم التفاعلي الذكي', width / 2, 110)

    // Title
    ctx.fillStyle = template === 'gold' ? '#b45309' : (template === 'royal' ? '#38bdf8' : (template === 'emerald' ? '#047857' : '#db2777'))
    ctx.font = 'bold 52px Tajawal, sans-serif'
    ctx.fillText(data.title || 'شهادة شكر وتقدير', width / 2, 190)

    // Subtitle
    ctx.fillStyle = isDark ? '#cbd5e1' : '#475569'
    ctx.font = '30px Tajawal, sans-serif'
    ctx.fillText('يَسرّ إدارة المنصة ومعلم المادة منح هذه الشهادة إلى الطالب البطل:', width / 2, 280)

    // Student Name
    ctx.fillStyle = isDark ? '#f8fafc' : '#1e293b'
    ctx.font = 'bold 56px Tajawal, sans-serif'
    ctx.fillText(data.studentName || 'اسم الطالب هنا', width / 2, 380)

    ctx.strokeStyle = template === 'gold' ? '#f59e0b' : (template === 'royal' ? '#6366f1' : (template === 'emerald' ? '#10b981' : '#ec4899'))
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo((width / 2) - 250, 410)
    ctx.lineTo((width / 2) + 250, 410)
    ctx.stroke()

    // Reason
    ctx.fillStyle = isDark ? '#e2e8f0' : '#334155'
    ctx.font = '28px Tajawal, sans-serif'
    const wrapText = (text, x, y, maxWidth, lineHeight) => {
      const words = (text || '').split(' ')
      let line = ''
      let currY = y
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' '
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, x, currY)
          line = words[i] + ' '
          currY += lineHeight
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, x, currY)
    }
    wrapText(data.reason, width / 2, 480, 950, 45)

    // Signatures
    ctx.font = 'bold 26px Tajawal, sans-serif'
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569'

    ctx.textAlign = 'right'
    ctx.fillText(`التاريخ: ${data.date}`, width - 120, 720)

    ctx.textAlign = 'left'
    ctx.fillText(`معلم المادة: ${data.teacherName}`, 120, 720)

    ctx.textAlign = 'center'
    ctx.font = '45px sans-serif'
    ctx.fillText(template === 'gold' ? '🥇' : (template === 'royal' ? '👑' : (template === 'emerald' ? '🌟' : '🎈')), width / 2, 730)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `شهادتي_${certData.studentName || 'طالب'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: 'clamp(8px, 2vh, 15px)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Certificate Canvas */}
      <div style={{ width: '100%', maxWidth: 'min(95vw, 65vh * (1200 / 850), 800px)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', borderRadius: '16px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} />
      </div>

      {/* Floating Download Button */}
      <button 
        onClick={handleDownload}
        style={{ marginTop: 'clamp(8px, 1.5vh, 15px)', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', padding: 'clamp(8px, 1.2vh, 12px) clamp(16px, 3vw, 24px)', borderRadius: '12px', fontWeight: 'bold', fontSize: 'clamp(0.85rem, 2vw, 1rem)', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,158,11,0.4)', flexShrink: 0 }}
      >
        <Download size={18} /> تحميل الشهادة (PNG) 📥
      </button>

      {/* Special Awarded Popup Modal if this student got awarded */}
      {awardedModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ background: 'white', borderRadius: '24px', maxWidth: '480px', width: '100%', maxHeight: '90dvh', overflowY: 'auto', padding: 'clamp(15px, 3vh, 30px)', textAlign: 'center', position: 'relative', boxShadow: '0 25px 60px rgba(245,158,11,0.5)' }}>
            
            <button 
              onClick={() => setAwardedModal(null)}
              style={{ position: 'absolute', top: '12px', left: '12px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={18} />
            </button>

            <div style={{ fontSize: 'clamp(2.5rem, 6vh, 4rem)', marginBottom: '8px', animation: 'bounce 1s infinite' }}>
              🏆🎉
            </div>

            <h2 style={{ color: '#d97706', fontSize: 'clamp(1.3rem, 3.5vw, 1.8rem)', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              مبـــارك يا بطل! 🌟
            </h2>

            <p style={{ color: '#334155', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', margin: '0 0 12px 0' }}>
              لقد قام الأستاذ <strong>{awardedModal.teacherName}</strong> بتكريمك ومنحك:
            </p>

            <div style={{ background: '#fef3c7', border: '2px solid #fcd34d', borderRadius: '14px', padding: 'clamp(8px, 1.5vh, 12px)', color: '#92400e', fontWeight: 'bold', fontSize: 'clamp(1rem, 2.8vw, 1.15rem)', marginBottom: '15px' }}>
              {awardedModal.title} 🥇
            </div>

            <p style={{ color: '#64748b', fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)', margin: '0 0 15px 0', fontStyle: 'italic' }}>
              "{awardedModal.reason}"
            </p>

            <button 
              onClick={handleDownload}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: '#10b981', color: 'white', border: 'none', padding: 'clamp(10px, 1.8vh, 14px)', borderRadius: '12px', fontWeight: 'bold', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
            >
              <Download size={20} /> تنزيل شهادتي التقديرية الآن 📥
            </button>

          </div>
        </div>
      )}

    </div>
  )
}

