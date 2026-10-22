'use client'

import React, { useState, useEffect, useRef } from 'react'
import styles from '../teacher-assistant/flashcards/page.module.css'

export default function LiveFlashcardsStudent({ channel }) {
  const [formData, setFormData] = useState({
    title: 'جاري تحميل البطاقة...',
    rule: '',
    example1: '',
    example2: '',
    theme: 'classic',
    customColor: '#9333ea'
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
    window.addEventListener('on_flashcard_state', handler)

    return () => {
      window.removeEventListener('on_flashcard_state', handler)
    }
  }, [channel])

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
    ctx.fillText(formData.title || '', width / 2, 80)

    if (formData.rule) {
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
    }

    if (formData.example1 || formData.example2) {
      ctx.fillStyle = textColor
      ctx.font = 'bold 40px Tajawal'
      ctx.fillText('أمثلة توضيحية', width / 2, 590)

      const boxMargin = 80
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
      if (formData.example1) ctx.fillText(`1. ${formData.example1}`, width - boxMargin - 40, examplesBoxTop + 60)
      if (formData.example2) ctx.fillText(`2. ${formData.example2}`, width - boxMargin - 40, examplesBoxTop + 150)
    }

    ctx.textAlign = 'center'
    ctx.font = '24px Tajawal'
    ctx.fillStyle = formData.theme === 'colorful' ? 'rgba(255,255,255,0.8)' : '#64748b'
    ctx.fillText('بث مباشر - البطاقات الذكية التفاعلية', width / 2, height - 60)
  }

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', padding: '10px', overflow: 'hidden' }}>
      <div style={{ width: 'min(88vw, 65vh, 520px)', height: 'min(88vw, 65vh, 520px)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas 
          ref={canvasRef}
          width={1080}
          height={1080}
          style={{ width: '100%', height: '100%', objectFit: 'contain', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', borderRadius: '20px', background: 'white', display: 'block' }}
        />
      </div>
    </div>
  )
}
