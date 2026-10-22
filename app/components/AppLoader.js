'use client'

import { useState, useEffect } from 'react'
import styles from './AppLoader.module.css'

export default function AppLoader() {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem('appLoaded')
    
    if (hasLoaded) {
      setLoading(false)
      return
    }

    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15
      if (currentProgress > 100) {
        currentProgress = 100
      }
      setProgress(currentProgress)

      if (currentProgress === 100) {
        clearInterval(interval)
        
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
          const oscillator = audioCtx.createOscillator()
          const gainNode = audioCtx.createGain()
          
          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1)
          
          gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
          gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05)
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5)
          
          oscillator.connect(gainNode)
          gainNode.connect(audioCtx.destination)
          
          oscillator.start(audioCtx.currentTime)
          oscillator.stop(audioCtx.currentTime + 0.5)
        } catch (e) {
          console.warn("Audio playback prevented by browser policy")
        }

        setTimeout(() => {
          setLoading(false)
          sessionStorage.setItem('appLoaded', 'true')
        }, 600)
      }
    }, 150)

    return () => clearInterval(interval)
  }, [])

  if (!loading) return null

  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loaderCard}>
        <div className={styles.logoContainer}>
          <div className={styles.logoPulse}></div>
          <img src="/logo.png" alt="منصة الوتين" className={styles.logoImg} />
        </div>
        
        <div className={styles.loadingText}>
          منصة <span>الوتين</span>
        </div>
        
        <div className={styles.progressBarContainer}>
          <div 
            className={styles.progressBar} 
            style={{ width: progress + '%' }}
          ></div>
        </div>
      </div>
    </div>
  )
}
