'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Award, Send, Download, Sparkles, Check, Crown, Star, RefreshCw } from 'lucide-react'
import { removeBroadcastBinding } from '../../utils/realtimeHelper'

export default function LiveCertificatesTeacher({ channel, devices = [] }) {
  const [studentName, setStudentName] = useState('')
  const [selectedDevice, setSelectedDevice] = useState('')
  const [title, setTitle] = useState('شهادة شكر وتقدير')
  const [reason, setReason] = useState('لتفوقه وبراعته في إجابة الأسئلة وحصوله على المركز الأول')
  const [teacherName, setTeacherName] = useState('أ/ عبد الله الوتين')
  const [template, setTemplate] = useState('gold') // gold, royal, emerald, kids
  const [date, setDate] = useState(new Date().toLocaleDateString('ar-EG'))
  const [isSent, setIsSent] = useState(false)

  const canvasRef = useRef(null)
  const channelRef = useRef(channel)

  useEffect(() => {
    channelRef.current = channel
  }, [channel])

  // Select student from connected devices
  const handleSelectDevice = (deviceId) => {
    setSelectedDevice(deviceId)
    const found = (devices || []).find(d => (d.id || d.deviceId) === deviceId)
    if (found) {
      setStudentName(found.name)
    }
  }

  // Draw certificate on canvas whenever state changes
  useEffect(() => {
    drawCertificate()
    // Sync current preview to students
    if (channelRef.current && channelRef.current.state === 'joined') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'certificate_preview_sync',
        payload: { studentName, title, reason, teacherName, template, date }
      }).catch(console.error)
    }
  }, [studentName, title, reason, teacherName, template, date])

  const certStateRef = useRef({ studentName, title, reason, teacherName, template, date })
  useEffect(() => {
    certStateRef.current = { studentName, title, reason, teacherName, template, date }
  }, [studentName, title, reason, teacherName, template, date])

  // Handle late joiners sync request
  useEffect(() => {
    if (!channel) return
    const sendSync = () => {
      channel.send({
        type: 'broadcast',
        event: 'certificate_preview_sync',
        payload: certStateRef.current
      }).catch(console.error)
    }

    channel.on('broadcast', { event: 'global_sync_request' }, sendSync)
    channel.on('broadcast', { event: 'request_state' }, sendSync)
    window.addEventListener('on_global_sync_request', sendSync)

    return () => {
      removeBroadcastBinding(channel, 'global_sync_request', sendSync)
      removeBroadcastBinding(channel, 'request_state', sendSync)
      window.removeEventListener('on_global_sync_request', sendSync)
    }
  }, [channel])

  const drawCertificate = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = 1200
    const height = 850
    canvas.width = width
    canvas.height = height

    // Backgrounds based on template
    if (template === 'gold') {
      const grad = ctx.createLinearGradient(0, 0, width, height)
      grad.addColorStop(0, '#ffffff')
      grad.addColorStop(0.5, '#fffdf5')
      grad.addColorStop(1, '#fef9c3')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      // Outer Golden Border
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

    // Header Logo & Institution
    ctx.textAlign = 'center'
    const isDark = template === 'royal'
    
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b'
    ctx.font = 'bold 24px Tajawal, sans-serif'
    ctx.fillText('منصة الوتين للتعليم التفاعلي الذكي', width / 2, 110)

    // Title
    ctx.fillStyle = template === 'gold' ? '#b45309' : (template === 'royal' ? '#38bdf8' : (template === 'emerald' ? '#047857' : '#db2777'))
    ctx.font = 'bold 52px Tajawal, sans-serif'
    ctx.fillText(title || 'شهادة شكر وتقدير', width / 2, 190)

    // Subtitle
    ctx.fillStyle = isDark ? '#cbd5e1' : '#475569'
    ctx.font = '30px Tajawal, sans-serif'
    ctx.fillText('يَسرّ إدارة المنصة ومعلم المادة منح هذه الشهادة إلى الطالب البطل:', width / 2, 280)

    // Student Name (Big & Highlighted)
    ctx.fillStyle = isDark ? '#f8fafc' : '#1e293b'
    ctx.font = 'bold 56px Tajawal, sans-serif'
    ctx.fillText(studentName || 'اسم الطالب هنا', width / 2, 380)

    // Underline below name
    ctx.strokeStyle = template === 'gold' ? '#f59e0b' : (template === 'royal' ? '#6366f1' : (template === 'emerald' ? '#10b981' : '#ec4899'))
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo((width / 2) - 250, 410)
    ctx.lineTo((width / 2) + 250, 410)
    ctx.stroke()

    // Reason / Text
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
    wrapText(reason, width / 2, 480, 950, 45)

    // Footer Signatures
    ctx.font = 'bold 26px Tajawal, sans-serif'
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569'

    // Date
    ctx.textAlign = 'right'
    ctx.fillText(`التاريخ: ${date}`, width - 120, 720)

    // Teacher
    ctx.textAlign = 'left'
    ctx.fillText(`معلم المادة: ${teacherName}`, 120, 720)

    // Seal Badge in Center
    ctx.textAlign = 'center'
    ctx.font = '45px sans-serif'
    ctx.fillText(template === 'gold' ? '🥇' : (template === 'royal' ? '👑' : (template === 'emerald' ? '🌟' : '🎈')), width / 2, 730)
  }

  // Broadcast celebration to student screen
  const handleSendAward = () => {
    if (!studentName.trim()) {
      alert('يرجى كتابة اسم الطالب أو اختياره من القائمة!')
      return
    }

    if (channelRef.current && channelRef.current.state === 'joined') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'certificate_awarded',
        payload: {
          targetDeviceId: selectedDevice,
          studentName: studentName.trim(),
          title,
          reason,
          teacherName,
          template,
          date
        }
      }).catch(console.error)

      setIsSent(true)
      setTimeout(() => setIsSent(false), 4000)
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `شهادة_${studentName || 'طالب'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', height: '100%', padding: 'clamp(6px, 1.5vw, 14px)', overflowY: 'auto', boxSizing: 'border-box' }}>
      
      {/* Control Panel */}
      <div style={{ flex: '1 1 280px', maxWidth: '100%', background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
          <div style={{ width: '32px', height: '32px', background: '#fef3c7', color: '#d97706', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>صانع الشهادات الفوري</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>كرّم أبطال الحصة مباشرة على شاشاتهم</p>
          </div>
        </div>

        {/* Pick from connected devices */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
            👥 اختيار الطالب من الحضور:
          </label>
          <select 
            value={selectedDevice} 
            onChange={(e) => handleSelectDevice(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#f8fafc', fontWeight: 'bold' }}
          >
            <option value="">-- اختر من قائمة الطلاب المتصلين --</option>
            {devices?.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Student Name */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '3px' }}>اسم الطالب المكرم:</label>
          <input 
            type="text" 
            value={studentName} 
            onChange={e => setStudentName(e.target.value)}
            placeholder="اكتب اسم الطالب هنا"
            style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 'bold', boxSizing: 'border-box' }}
          />
        </div>

        {/* Title */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '3px' }}>عنوان التكريم:</label>
          <select 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
          >
            <option value="شهادة شكر وتقدير">شهادة شكر وتقدير 🏆</option>
            <option value="وسام التفوق والتميز">وسام التفوق والتميز 🌟</option>
            <option value="بطل تحدي النحو">بطل تحدي النحو ⚔️</option>
            <option value="نجم الإملاء والخط">نجم الإملاء والخط ✍️</option>
            <option value="المركز الأول في الحصة">المركز الأول في الحصة 🥇</option>
          </select>
        </div>

        {/* Reason / Praise */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '3px' }}>عبارة التكريم:</label>
          <textarea 
            rows={2}
            value={reason} 
            onChange={e => setReason(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', lineHeight: '1.4', boxSizing: 'border-box' }}
          />
        </div>

        {/* Template Style */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>ثيم وتصميم الشهادة:</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button 
              onClick={() => setTemplate('gold')}
              style={{ padding: '6px', borderRadius: '8px', border: template === 'gold' ? '2px solid #d97706' : '1px solid #e2e8f0', background: template === 'gold' ? '#fef3c7' : 'white', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer', color: '#92400e' }}
            >
              🥇 ذهبي ملكي
            </button>
            <button 
              onClick={() => setTemplate('royal')}
              style={{ padding: '6px', borderRadius: '8px', border: template === 'royal' ? '2px solid #38bdf8' : '1px solid #e2e8f0', background: template === 'royal' ? '#1e293b' : 'white', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer', color: template === 'royal' ? '#38bdf8' : '#334155' }}
            >
              👑 أزرق ليلي
            </button>
            <button 
              onClick={() => setTemplate('emerald')}
              style={{ padding: '6px', borderRadius: '8px', border: template === 'emerald' ? '2px solid #059669' : '1px solid #e2e8f0', background: template === 'emerald' ? '#dcfce7' : 'white', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer', color: '#065f46' }}
            >
              🌟 زمردي فخم
            </button>
            <button 
              onClick={() => setTemplate('kids')}
              style={{ padding: '6px', borderRadius: '8px', border: template === 'kids' ? '2px solid #ec4899' : '1px solid #e2e8f0', background: template === 'kids' ? '#fce7f3' : 'white', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer', color: '#be185d' }}
            >
              🎈 أطفال مبهج
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '6px' }}>
          <button 
            onClick={handleSendAward}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', background: isSent ? '#059669' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 3px 10px rgba(217,119,6,0.3)', transition: '0.2s' }}
          >
            {isSent ? <><Check size={18} /> تم إرسال التكريم بنجاح! 🎉</> : <><Sparkles size={18} /> إرسال وتكريم الطالب الآن 🎓</>}
          </button>

          <button 
            onClick={handleDownload}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            <Download size={14} /> تنزيل صورة الشهادة (PNG)
          </button>
        </div>

      </div>

      {/* Preview Screen (Canvas) */}
      <div style={{ flex: '1 1 320px', background: '#1e293b', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '0' }}>
        <div style={{ width: '100%', maxWidth: '800px', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', borderRadius: '10px', overflow: 'hidden' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </div>

    </div>
  )
}
