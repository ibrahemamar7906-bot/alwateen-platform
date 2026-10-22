'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../utils/supabase'
import styles from '../../teacher-assistant/flashcards/page.module.css'
import { removeBroadcastBinding } from '../../utils/realtimeHelper'

export default function LiveFlashcardsTeacher({ channel }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [savedFlashcards, setSavedFlashcards] = useState([])
  const [showBank, setShowBank] = useState(false)
  const [formData, setFormData] = useState({
    title: 'عنوان البطاقة',
    rule: 'اكتب هنا القاعدة النحوية أو الرياضية أو الفكرة الرئيسية التي تريد إيصالها للطالب.',
    example1: 'المثال الأول هنا.',
    example2: 'المثال الثاني هنا.',
    theme: 'classic',
    customColor: '#9333ea'
  })
  
  const canvasRef = useRef(null)
  const channelRef = useRef(channel)

  // Fetch saved flashcards on mount
  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setCurrentUser(user)
          const { data } = await supabase.from('flashcards').select('*').eq('teacher_id', user.id).order('created_at', { ascending: false })
          if (data) setSavedFlashcards(data)
        }
      } catch (err) {
        console.error('Error fetching flashcards:', err)
      }
    }
    fetchFlashcards()
  }, [])

  // Sync channel ref
  useEffect(() => {
    channelRef.current = channel
  }, [channel])

  // Broadcast state on change and draw locally
  useEffect(() => {
    drawCard()
    if (channelRef.current && channelRef.current.state === 'joined') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'flashcard_state',
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
        event: 'flashcard_state',
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
    const height = 1080
    
    ctx.clearRect(0, 0, width, height)

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
      bgColors = ['#f8fafc', '#e2e8f0']
      textColor = '#0f172a'
      accentColor = '#0f5132'
      boxColor = '#ffffff'
    }

    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, bgColors[0])
    gradient.addColorStop(1, bgColors[1])
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

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

    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = accentColor
    ctx.font = 'bold 80px Tajawal'
    ctx.fillText(formData.title, width / 2, 80)

    ctx.fillStyle = textColor
    ctx.font = 'bold 40px Tajawal'
    ctx.fillText('القاعدة', width / 2, 220)

    const boxMargin = 80
    const ruleBoxTop = 290
    ctx.fillStyle = boxColor
    ctx.shadowColor = 'rgba(0,0,0,0.1)'
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.roundRect(boxMargin, ruleBoxTop, width - boxMargin*2, 250, 20)
    ctx.fill()
    ctx.shadowColor = 'transparent'

    ctx.fillStyle = formData.theme === 'colorful' || formData.theme === 'dark' ? textColor : '#334155'
    ctx.font = '36px Tajawal'
    ctx.textAlign = 'center'
    wrapText(ctx, formData.rule, width / 2, ruleBoxTop + 60, width - boxMargin*2 - 80, 50)

    ctx.fillStyle = textColor
    ctx.font = 'bold 40px Tajawal'
    ctx.fillText('أمثلة توضيحية', width / 2, 590)

    const examplesBoxTop = 660
    ctx.fillStyle = boxColor
    ctx.shadowColor = 'rgba(0,0,0,0.1)'
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.roundRect(boxMargin, examplesBoxTop, width - boxMargin*2, 250, 20)
    ctx.fill()
    ctx.shadowColor = 'transparent'

    ctx.fillStyle = formData.theme === 'colorful' || formData.theme === 'dark' ? textColor : '#334155'
    ctx.font = 'bold 36px Tajawal'
    ctx.textAlign = 'right'
    ctx.fillText(`1. ${formData.example1}`, width - boxMargin - 40, examplesBoxTop + 60)
    ctx.fillText(`2. ${formData.example2}`, width - boxMargin - 40, examplesBoxTop + 150)

    ctx.textAlign = 'center'
    ctx.font = '24px Tajawal'
    ctx.fillStyle = formData.theme === 'colorful' ? 'rgba(255,255,255,0.8)' : '#64748b'
    ctx.fillText('بث مباشر - البطاقات الذكية التفاعلية', width / 2, height - 60)
  }

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  return (
    <div style={{ height: '100%', width: '100%', background: '#fff', borderRadius: '14px', padding: 'clamp(8px, 1.5vw, 16px)', overflowY: 'auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: '16px', flex: 1, alignItems: 'flex-start' }}>
        
        {/* Form Controls */}
        <div style={{ flex: '1 1 280px', background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>إعداد البطاقة</h3>
            {savedFlashcards.length > 0 && (
              <button 
                onClick={() => setShowBank(!showBank)}
                style={{ background: showBank ? '#64748b' : '#3b82f6', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
              >
                {showBank ? 'إخفاء' : '📚 بنك البطاقات'}
              </button>
            )}
          </div>

          {showBank && savedFlashcards.length > 0 && (
            <div style={{ background: '#e2e8f0', padding: '10px', borderRadius: '8px', maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '2px' }}>اختر بطاقة لاستيرادها:</span>
              {savedFlashcards.map(card => (
                <button 
                  key={card.id}
                  onClick={() => {
                    setFormData({
                      title: card.title,
                      rule: card.rule,
                      example1: card.example1 || '',
                      example2: card.example2 || '',
                      theme: card.theme || 'classic',
                      customColor: card.custom_color || '#9333ea'
                    })
                    setShowBank(false)
                  }}
                  style={{ textAlign: 'right', background: 'white', border: '1px solid #cbd5e1', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                >
                  {card.title}
                </button>
              ))}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '3px' }}>عنوان البطاقة</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', background: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '3px' }}>نص القاعدة</label>
            <textarea name="rule" value={formData.rule} onChange={handleChange} style={{ width: '100%', height: '80px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', background: 'white', resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '3px' }}>مثال توضيحي 1</label>
            <input type="text" name="example1" value={formData.example1} onChange={handleChange} style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', background: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '3px' }}>مثال توضيحي 2</label>
            <input type="text" name="example2" value={formData.example2} onChange={handleChange} style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', background: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', marginBottom: '3px' }}>التصميم (Theme)</label>
            <select name="theme" value={formData.theme} onChange={handleChange} style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: 'white', marginBottom: formData.theme === 'custom' ? '8px' : '0' }}>
              <option value="classic">كلاسيكي</option>
              <option value="notebook">ورقة دفتر</option>
              <option value="colorful">ألوان متدرجة</option>
              <option value="dark">الوضع الداكن</option>
              <option value="glass">تأثير الزجاج</option>
              <option value="custom">لون مخصص</option>
            </select>

            {formData.theme === 'custom' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
                <label style={{ fontSize: '0.8rem' }}>اختر لون البطاقة:</label>
                <input type="color" name="customColor" value={formData.customColor} onChange={handleChange} style={{ border: 'none', background: 'transparent', width: '32px', height: '32px', cursor: 'pointer' }} />
              </div>
            )}
          </div>
        </div>

        {/* Card Canvas Preview */}
        <div style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '0' }}>
          <div style={{ width: '100%', maxWidth: 'clamp(260px, 40vw, 450px)', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <canvas 
              ref={canvasRef}
              width={1080}
              height={1080}
              style={{ width: '100%', height: '100%', objectFit: 'contain', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', borderRadius: '16px', background: 'white', display: 'block' }}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
