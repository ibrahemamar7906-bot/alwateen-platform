'use client'

import React, { useState, useEffect, useRef } from 'react'
import styles from '../teacher-assistant/wheel/page.module.css'

export default function LiveWheelStudent({ channel }) {
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
  const rotationRef = useRef(0) // keep a ref so we can animate properly
  const isMountedRef = useRef(true)
  const rafIdRef = useRef(null) // Store rAF ID for cancellation on unmount

  useEffect(() => {
    isMountedRef.current = true
    
    // As soon as student mounts, request state
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
      // Cancel any in-progress rAF to prevent state updates on unmounted component
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    }
  }, [channel])

  useEffect(() => {
    if (!channel) return

    const configHandler = (e) => {
      if (!isMountedRef.current) return
      const p = e.detail
      if (p) {
        setNames(p.names || [])
        setDesignMode(p.designMode || 'fixed')
        setTemplate(p.template || 'classic')
        setDynBg(p.dynBg || 'solid')
        setDynBorder(p.dynBorder || 'none')
        setDynPalette(p.dynPalette || 'blue')
        setCustomColor1(p.customColor1 || '#8b5cf6')
        setCustomColor2(p.customColor2 || '#ec4899')
      }
    }
    const spinHandler = (e) => {
      if (!isMountedRef.current) return
      const p = e.detail
      if (p) spinWheelClient(p.targetRotation, p.winnerName, p.duration)
    }
    window.addEventListener('on_wheel_config', configHandler)
    window.addEventListener('on_wheel_spin', spinHandler)

    return () => {
      window.removeEventListener('on_wheel_config', configHandler)
      window.removeEventListener('on_wheel_spin', spinHandler)
    }
  }, [channel])

  useEffect(() => {
    drawWheel()
  }, [names, rotation, template, designMode, dynBg, dynBorder, dynPalette, customColor1, customColor2])

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
      ctx.fillText('جاري تحميل الأسماء...', centerX, centerY)
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

  const spinWheelClient = (targetRotation, winnerName, duration) => {
    if (isSpinning) return
    setIsSpinning(true)
    setWinner(null)

    let startTime = null
    const startRotation = rotationRef.current
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4)

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      const percentage = Math.min(progress / duration, 1)
      
      const currentRot = startRotation + (targetRotation - startRotation) * easeOutQuart(percentage)
      setRotation(currentRot)
      rotationRef.current = currentRot

      if (progress < duration) {
        rafIdRef.current = requestAnimationFrame(animate)
      } else {
        rafIdRef.current = null;
        setIsSpinning(false)
        setWinner(winnerName)
        try {
          const audio = new Audio('/win-sound.mp3')
          audio.play().catch(e => {}) 
        } catch(e) {}
      }
    }

    rafIdRef.current = requestAnimationFrame(animate)
  }

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent', padding: '10px', overflow: 'hidden' }}>
      <div className={styles.wheelSection} style={{ maxWidth: 'min(90vw, 75vh, 500px)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div className={styles.wheelContainer} style={{ width: '100%', maxWidth: 'min(85vw, 70vh, 480px)', aspectRatio: '1/1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.pointer}></div>
          <canvas 
            ref={canvasRef}
            width={500}
            height={500}
            style={{ width: '100%', height: '100%', borderRadius: '50%', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', display: 'block' }}
          />
        </div>

        {winner && (
          <div className={styles.winnerOverlay} style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '20px', zIndex: 100 }}>
            <h2 style={{fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#e11d48', margin: '0'}}>🎉 الفائز هو 🎉</h2>
            <div className={styles.winnerText} style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}>{winner}</div>
          </div>
        )}
      </div>
    </div>
  )
}
