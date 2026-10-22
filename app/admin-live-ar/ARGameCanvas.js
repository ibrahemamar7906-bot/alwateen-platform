'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import confetti from 'canvas-confetti'

// 12 Colors data from the video specification
export const COLORS_GAME_DATA = [
  { id: 1, name: 'RED', arabicName: 'أحمر', emoji: '🍎', hex: '#ef4444', distractorLetters: ['T', 'B', 'P'] },
  { id: 2, name: 'ORANGE', arabicName: 'برتقالي', emoji: '🍊', hex: '#f97316', distractorLetters: ['M', 'L'] },
  { id: 3, name: 'YELLOW', arabicName: 'أصفر', emoji: '🍋', hex: '#eab308', distractorLetters: ['K', 'N'] },
  { id: 4, name: 'GREEN', arabicName: 'أخضر', emoji: '🍏', hex: '#22c55e', distractorLetters: ['D', 'S'] },
  { id: 5, name: 'BLUE', arabicName: 'أزرق', emoji: '🫐', hex: '#3b82f6', distractorLetters: ['A', 'C'] },
  { id: 6, name: 'PURPLE', arabicName: 'بنفسجي', emoji: '🍇', hex: '#a855f7', distractorLetters: ['O', 'W'] },
  { id: 7, name: 'PINK', arabicName: 'وردي', emoji: '🌸', hex: '#ec4899', distractorLetters: ['U', 'F'] },
  { id: 8, name: 'BROWN', arabicName: 'بني', emoji: '🟤', hex: '#854d0e', distractorLetters: ['H', 'J'] },
  { id: 9, name: 'BLACK', arabicName: 'أسود', emoji: '🎱', hex: '#1e293b', distractorLetters: ['Z', 'X'] },
  { id: 10, name: 'WHITE', arabicName: 'أبيض', emoji: '🥛', hex: '#e2e8f0', distractorLetters: ['V', 'Q'] },
  { id: 11, name: 'GRAY', arabicName: 'رمادي', emoji: '🔘', hex: '#64748b', distractorLetters: ['Y', 'G'] },
  { id: 12, name: 'GOLD', arabicName: 'ذهبي', emoji: '👑', hex: '#f59e0b', distractorLetters: ['I', 'R'] },
]

export const ARABIC_GAME_DATA = [
  { id: 1, name: 'أسد', englishName: 'Lion', emoji: '🦁', color: '#f59e0b', letters: ['أ', 'س', 'د'], distractors: ['ب', 'ر'] },
  { id: 2, name: 'شمس', englishName: 'Sun', emoji: '☀️', color: '#eab308', letters: ['ش', 'م', 'س'], distractors: ['ف', 'ن'] },
  { id: 3, name: 'قمر', englishName: 'Moon', emoji: '🌙', color: '#38bdf8', letters: ['ق', 'م', 'ر'], distractors: ['ع', 'ل'] },
  { id: 4, name: 'كتاب', englishName: 'Book', emoji: '📖', color: '#10b981', letters: ['ك', 'ت', 'ا', 'ب'], distractors: ['ص', 'د'] },
  { id: 5, name: 'زهرة', englishName: 'Flower', emoji: '🌸', color: '#ec4899', letters: ['ز', 'هـ', 'ر', 'ة'], distractors: ['ط', 'ك'] },
  { id: 6, name: 'علم', englishName: 'Flag', emoji: '🚩', color: '#ef4444', letters: ['ع', 'ل', 'م'], distractors: ['ح', 'ي'] },
]

export const MATH_GAME_DATA = [
  { id: 1, question: '3 + 2 = ?', answer: '5', options: ['4', '5', '6', '7'], emoji: '🔢' },
  { id: 2, question: '7 - 4 = ?', answer: '3', options: ['2', '3', '4', '5'], emoji: '➖' },
  { id: 3, question: '4 × 2 = ?', answer: '8', options: ['6', '8', '10', '12'], emoji: '✖️' },
  { id: 4, question: '9 ÷ 3 = ?', answer: '3', options: ['1', '2', '3', '4'], emoji: '➗' },
  { id: 5, question: '6 + 5 = ?', answer: '11', options: ['10', '11', '12', '13'], emoji: '➕' },
]

// Audio Synthesizer using Web Audio API for fast zero-dependency sound effects
class SoundFX {
  constructor() {
    this.ctx = null
    this.muted = false
  }
  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) this.ctx = new AudioCtx()
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }
  playPop() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(450, now)
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.08)
    } catch (e) {}
  }
  playDing() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(880, now) // A5
      gain.gain.setValueAtTime(0.4, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.35)
    } catch (e) {}
  }
  playFanfare() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const now = this.ctx.currentTime + idx * 0.1
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)
        gain.gain.setValueAtTime(0.35, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(now)
        osc.stop(now + 0.4)
      })
    } catch (e) {}
  }
  playCheer() {
    this.playFanfare()
  }
}

const sfx = new SoundFX()

// Connections between hand landmarks for skeleton rendering
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],         // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],         // Index
  [5, 9], [9, 10], [10, 11], [11, 12],    // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],  // Ring
  [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [0, 17]                                 // Palm base
]

export default function ARGameCanvas({
  gameMode = 'colors', // 'colors' | 'arabic' | 'math' | 'bubbles'
  isCameraOn = true,
  isMirrored = true,
  showSkeleton = true,
  sensitivity = 0.085, // pinch distance threshold (0.085 for natural, easy pinching)
  useMouseFallback = false,
  onScoreUpdate = null,
  externalStream = null
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const internalVideoRef = useRef(null)

  // Stable refs for real-time tracking without re-triggering MediaPipe init
  const isMirroredRef = useRef(isMirrored)
  const sensitivityRef = useRef(sensitivity)
  const handleStartGameRef = useRef(null)

  useEffect(() => {
    isMirroredRef.current = isMirrored
  }, [isMirrored])

  useEffect(() => {
    sensitivityRef.current = sensitivity
  }, [sensitivity])
  
  // Hand tracking state refs (separated from React state for 60fps performance)
  const trackingRef = useRef({
    handDetected: false,
    cursorX: 0,
    cursorY: 0,
    isPinching: false,
    landmarks: null,
    rawPinchDist: 1.0,
    pinchFeedback: 'normal', // 'normal' | 'hover' | 'pinch_miss' | 'grabbed'
    hoveredBubbleId: null,
    grabbedBubble: null,
    dragOffset: { x: 0, y: 0 }
  })

  // Game state refs
  const gameStateRef = useRef({
    started: false,
    currentIndex: 0,
    score: 0,
    totalCount: 12,
    allClear: false,
    bubbles: [],
    slots: [],
    particles: [],
    starsCount: 0
  })

  const [aiLoading, setAiLoading] = useState(true)
  const [aiError, setAiError] = useState(null)
  const [handStatus, setHandStatus] = useState('searching') // 'searching' | 'detected' | 'mouse'
  const [currentScore, setCurrentScore] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [activeItem, setActiveItem] = useState(COLORS_GAME_DATA[0])

  // Setup / Load current item
  const setupItem = useCallback((mode, index) => {
    let itemData = null
    let letters = []
    let distractors = []
    let totalItems = 12

    if (mode === 'colors') {
      const idx = index % COLORS_GAME_DATA.length
      itemData = COLORS_GAME_DATA[idx]
      letters = itemData.name.split('')
      distractors = itemData.distractorLetters || ['T', 'B', 'P']
      totalItems = COLORS_GAME_DATA.length
    } else if (mode === 'arabic') {
      const idx = index % ARABIC_GAME_DATA.length
      itemData = ARABIC_GAME_DATA[idx]
      letters = itemData.letters
      distractors = itemData.distractors || ['ت', 'و']
      totalItems = ARABIC_GAME_DATA.length
    } else if (mode === 'math') {
      const idx = index % MATH_GAME_DATA.length
      itemData = MATH_GAME_DATA[idx]
      letters = [itemData.answer]
      distractors = itemData.options.filter(o => o !== itemData.answer)
      totalItems = MATH_GAME_DATA.length
    } else {
      totalItems = 20
      itemData = { name: 'فرقعة الفقاعات 🫧', emoji: '🫧', hex: '#06b6d4' }
      letters = ['⭐', '💎', '🎯', '🔥', '✨']
      distractors = ['🎈', '🎉', '🌟']
    }

    setActiveItem(itemData)
    gameStateRef.current.currentIndex = index
    gameStateRef.current.totalCount = totalItems

    // Create target slots based on letters
    const canvas = canvasRef.current
    const w = canvas ? canvas.width : 1280
    const h = canvas ? canvas.height : 720
    const isMobile = w < 640 || (w < 850 && h > w)
    const isShort = h < 740

    // Calculate responsive slot size constrained by both width AND height
    const maxSlotW = isMobile ? (w * 0.92) : (w * 0.75)
    const slotCount = Math.max(letters.length, 3)
    const slotSpacing = isMobile ? Math.max(5, Math.min(8, Math.floor(w * 0.02))) : (isShort ? 9 : 14)
    const maxSlotByHeight = Math.floor(h * (isShort ? 0.095 : 0.115))
    const slotSize = Math.min(
      isMobile ? 46 : (isShort ? 54 : 72),
      maxSlotByHeight,
      Math.max(28, Math.floor((maxSlotW - (slotCount - 1) * slotSpacing) / slotCount))
    )
    const totalSlotsW = letters.length * slotSize + (letters.length - 1) * slotSpacing
    const startX = (w - totalSlotsW) / 2

    // Place slots comfortably above bottom bar
    const bottomToolbarSpace = isMobile ? 60 : (isShort ? 66 : 78)
    const slotY = h - bottomToolbarSpace - slotSize - (isShort ? 6 : 10)

    const slots = letters.map((char, i) => ({
      index: i,
      expected: char,
      current: null,
      x: startX + i * (slotSize + slotSpacing),
      y: slotY,
      width: slotSize,
      height: slotSize,
      isCorrect: false
    }))
    gameStateRef.current.slots = slots

    // Create floating bubbles
    const allTokens = [...letters, ...distractors]
    // shuffle
    for (let i = allTokens.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTokens[i], allTokens[j]] = [allTokens[j], allTokens[i]]
    }

    const cardBottom = isMobile ? 132 : (isShort ? 106 : 156)
    const radius = Math.min(isMobile ? 25 : (isShort ? 29 : 38), Math.max(17, slotSize * 0.52))
    const topLimit = cardBottom + 10
    const bottomLimit = slotY - radius - 10
    const availableH = Math.max(60, bottomLimit - topLimit)
    const centerY = topLimit + availableH * 0.5

    const bubbles = allTokens.map((char, i) => {
      const angle = (i / allTokens.length) * Math.PI * 2
      const cx = w * 0.5 + Math.cos(angle) * (w * (isMobile ? 0.36 : 0.30))
      const cy = centerY + Math.sin(angle) * (availableH * 0.38)

      return {
        id: `bubble-${i}-${char}`,
        char,
        x: Math.max(radius + 15, Math.min(w - radius - 15, cx)),
        y: Math.max(topLimit + radius, Math.min(bottomLimit, cy)),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius,
        color: itemData.hex || itemData.color || '#3b82f6',
        scale: 1,
        isPlaced: false,
        phase: Math.random() * Math.PI * 2
      }
    })
    gameStateRef.current.bubbles = bubbles
  }, [])

  // Start game
  const handleStartGame = useCallback(() => {
    sfx.init()
    sfx.playDing()
    gameStateRef.current.started = true
    gameStateRef.current.score = 0
    gameStateRef.current.allClear = false
    setIsGameStarted(true)
    setIsGameOver(false)
    setCurrentScore(0)
    setupItem(gameMode, 0)
  }, [gameMode, setupItem])

  useEffect(() => {
    handleStartGameRef.current = handleStartGame
  }, [handleStartGame])

  // Handle word/question completion
  const checkCompletion = useCallback(() => {
    const slots = gameStateRef.current.slots
    if (!slots || slots.length === 0) return

    const allFilled = slots.every(s => s.isCorrect)
    if (allFilled) {
      sfx.playFanfare()
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']
      })

      // Add star burst particles
      for (let i = 0; i < 30; i++) {
        gameStateRef.current.particles.push({
          x: canvasRef.current ? canvasRef.current.width / 2 : 640,
          y: canvasRef.current ? canvasRef.current.height * 0.75 : 500,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.8) * 10,
          size: Math.random() * 8 + 4,
          color: ['#facc15', '#4ade80', '#60a5fa', '#f472b6'][Math.floor(Math.random() * 4)],
          life: 1.0,
          char: '⭐'
        })
      }

      const nextScore = gameStateRef.current.score + 1
      gameStateRef.current.score = nextScore
      setCurrentScore(nextScore)
      if (onScoreUpdate) onScoreUpdate(nextScore)

      const nextIdx = gameStateRef.current.currentIndex + 1
      if (nextIdx >= gameStateRef.current.totalCount) {
        // ALL CLEAR!
        setTimeout(() => {
          sfx.playCheer()
          gameStateRef.current.allClear = true
          setIsGameOver(true)
          confetti({
            particleCount: 120,
            spread: 120,
            origin: { y: 0.5 }
          })
        }, 1200)
      } else {
        setTimeout(() => {
          setupItem(gameMode, nextIdx)
        }, 1400)
      }
    }
  }, [gameMode, onScoreUpdate, setupItem])

  // Resize canvas to match display size
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current
      const canvas = canvasRef.current
      if (!container || !canvas) return

      const rect = container.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width
        canvas.height = rect.height
        setupItem(gameMode, gameStateRef.current.currentIndex)
      }
    }

    updateSize()
    const timer = setTimeout(updateSize, 200)
    window.addEventListener('resize', updateSize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateSize)
    }
  }, [gameMode, setupItem])

  // Camera Stream Setup
  useEffect(() => {
    let localStream = null
    const video = internalVideoRef.current

    if (externalStream && video) {
      video.srcObject = externalStream
      video.play().catch(() => {})
      return
    }

    if (isCameraOn && video) {
      navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user'
        },
        audio: false
      }).then(stream => {
        localStream = stream
        video.srcObject = stream
        video.play().catch(() => {})
      }).catch(err => {
        console.warn('Camera access denied or unavailable, fallback active:', err)
        setAiError('الكاميرا غير متوفرة أو تم رفض الإذن، يعمل بنظام الماوس واللمس البديل')
        setHandStatus('mouse')
      })
    } else if (video) {
      video.srcObject = null
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop())
      }
    }
  }, [isCameraOn, externalStream])

  // Global window pointerup to release grabbed bubble cleanly
  useEffect(() => {
    const handleGlobalUp = () => {
      const tracking = trackingRef.current
      if (tracking.isPinching) {
        releaseGrabbedBubble()
        tracking.isPinching = false
      }
    }
    window.addEventListener('pointerup', handleGlobalUp)
    return () => window.removeEventListener('pointerup', handleGlobalUp)
  }, [])

  // Pinch / Grab / Drop core logic
  const handlePinchInteraction = (x, y, isPinching, prevPinch) => {
    const tracking = trackingRef.current
    const state = gameStateRef.current

    // Check hover over bubbles
    let hovered = null
    for (const bubble of state.bubbles) {
      if (bubble.isPlaced) continue
      const dist = Math.hypot(x - bubble.x, y - bubble.y)
      if (dist < bubble.radius * 1.35) {
        hovered = bubble
        break
      }
    }

    tracking.hoveredBubbleId = hovered ? hovered.id : null

    // Pinch initiated: Grab bubble
    if (isPinching && !prevPinch) {
      if (hovered) {
        tracking.grabbedBubble = hovered
        tracking.dragOffset = { x: hovered.x - x, y: hovered.y - y }
        tracking.pinchFeedback = 'grabbed'
        sfx.playPop()
      } else {
        tracking.pinchFeedback = 'pinch_miss'
      }
    } else if (isPinching && tracking.grabbedBubble) {
      tracking.pinchFeedback = 'grabbed'
      tracking.grabbedBubble.x = x + tracking.dragOffset.x
      tracking.grabbedBubble.y = y + tracking.dragOffset.y
      tracking.grabbedBubble.vx = 0
      tracking.grabbedBubble.vy = 0
    } else if (!isPinching && prevPinch && tracking.grabbedBubble) {
      releaseGrabbedBubble()
    } else if (!isPinching) {
      tracking.pinchFeedback = hovered ? 'hover' : 'normal'
    }
  }

  // Release grabbed bubble onto slot or back to free float
  const releaseGrabbedBubble = () => {
    const tracking = trackingRef.current
    const state = gameStateRef.current
    const grabbed = tracking.grabbedBubble
    if (!grabbed) return

    let matchedSlot = null
    for (const slot of state.slots) {
      if (slot.isCorrect) continue
      const slotCenterX = slot.x + slot.width / 2
      const slotCenterY = slot.y + slot.height / 2
      const dist = Math.hypot(grabbed.x - slotCenterX, grabbed.y - slotCenterY)

      if (dist < slot.width * 1.25 && slot.expected === grabbed.char) {
        matchedSlot = slot
        break
      }
    }

    if (matchedSlot) {
      matchedSlot.current = grabbed.char
      matchedSlot.isCorrect = true
      grabbed.isPlaced = true
      grabbed.x = matchedSlot.x + matchedSlot.width / 2
      grabbed.y = matchedSlot.y + matchedSlot.height / 2

      sfx.playDing()

      for (let i = 0; i < 15; i++) {
        state.particles.push({
          x: grabbed.x,
          y: grabbed.y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          size: Math.random() * 5 + 3,
          color: grabbed.color,
          life: 0.8,
          char: '✨'
        })
      }

      checkCompletion()
    } else {
      grabbed.vx = (Math.random() - 0.5) * 2
      grabbed.vy = (Math.random() - 0.5) * 2
    }

    tracking.grabbedBubble = null
    tracking.pinchFeedback = 'normal'
  }

  // Accurate Canvas Coordinate Mapping
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  // Mouse & Touch fallback handlers directly on Canvas
  const handlePointerDown = (e) => {
    try {
      if (e.target && e.target.setPointerCapture) {
        e.target.setPointerCapture(e.pointerId)
      }
    } catch (err) {}
    const { x, y } = getCanvasCoords(e)
    const tracking = trackingRef.current
    tracking.cursorX = x
    tracking.cursorY = y
    tracking.isPinching = true
    handlePinchInteraction(x, y, true, false)
  }

  const handlePointerMove = (e) => {
    const { x, y } = getCanvasCoords(e)
    const tracking = trackingRef.current
    tracking.cursorX = x
    tracking.cursorY = y
    handlePinchInteraction(x, y, tracking.isPinching, tracking.isPinching)
  }

  const handlePointerUp = (e) => {
    try {
      if (e.target && e.target.releasePointerCapture) {
        e.target.releasePointerCapture(e.pointerId)
      }
    } catch (err) {}
    const { x, y } = getCanvasCoords(e)
    const tracking = trackingRef.current
    handlePinchInteraction(x, y, false, true)
    tracking.isPinching = false
  }

  // Load MediaPipe Hands via CDN and initialize
  useEffect(() => {
    if (useMouseFallback) {
      setHandStatus('mouse')
      setAiLoading(false)
      return
    }

    let isMounted = true
    let handsInstance = null
    let animFrameId = null

    const initMediaPipe = async () => {
      try {
        setAiLoading(true)

        // Ensure MediaPipe Hands script is loaded
        if (!window.Hands) {
          await new Promise((resolve, reject) => {
            const existingScript = document.querySelector('script[src*="mediapipe/hands"]')
            if (existingScript) {
              if (window.Hands) {
                resolve()
                return
              }
              existingScript.addEventListener('load', () => resolve())
              existingScript.addEventListener('error', () => reject(new Error('MediaPipe script failed to load')))
              return
            }

            const timeout = setTimeout(() => reject(new Error('MediaPipe script loading timeout')), 15000)

            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
            script.onload = () => {
              clearTimeout(timeout)
              resolve()
            }
            script.onerror = () => {
              clearTimeout(timeout)
              reject(new Error('MediaPipe script failed to load'))
            }
            document.head.appendChild(script)
          })
        }

        if (!isMounted) return

        const Hands = window.Hands
        handsInstance = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        })

        handsInstance.setOptions({
          maxNumHands: 1, // 1 hand for maximum responsiveness and low CPU
          modelComplexity: 0, // 0 = LITE MODEL: 4x faster, lightweight on laptops & mobile
          minDetectionConfidence: 0.35,
          minTrackingConfidence: 0.35
        })

        let lostCount = 0

        handsInstance.onResults((results) => {
          if (!isMounted) return
          const tracking = trackingRef.current
          const canvas = canvasRef.current
          const video = internalVideoRef.current
          if (!canvas) return

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            lostCount = 0
            const landmarks = results.multiHandLandmarks[0]
            tracking.landmarks = landmarks
            tracking.handDetected = true
            setHandStatus('detected')

            const indexTip = landmarks[8]
            const thumbTip = landmarks[4]

            const normX = isMirroredRef.current ? (1 - indexTip.x) : indexTip.x
            const normY = indexTip.y

            // Coordinate mapping with object-fit: cover correction
            let targetX = normX * canvas.width
            let targetY = normY * canvas.height

            if (video && video.videoWidth > 0 && video.videoHeight > 0) {
              const vw = video.videoWidth
              const vh = video.videoHeight
              const cw = canvas.width
              const ch = canvas.height
              const videoAspect = vw / vh
              const canvasAspect = cw / ch

              let scale, offsetX = 0, offsetY = 0
              if (canvasAspect > videoAspect) {
                scale = cw / vw
                offsetY = (ch - vh * scale) / 2
              } else {
                scale = ch / vh
                offsetX = (cw - vw * scale) / 2
              }
              targetX = offsetX + normX * vw * scale
              targetY = offsetY + normY * vh * scale
            }

            // Smooth responsive cursor movement
            tracking.cursorX += (targetX - tracking.cursorX) * 0.6
            tracking.cursorY += (targetY - tracking.cursorY) * 0.6

            // Pinch calculation
            const dx = (thumbTip.x - indexTip.x)
            const dy = (thumbTip.y - indexTip.y)
            const pinchDist = Math.hypot(dx, dy)
            tracking.rawPinchDist = pinchDist

            const isPinching = pinchDist < sensitivityRef.current
            const prevPinch = tracking.isPinching
            tracking.isPinching = isPinching

            // If game not started, check if pinching start button
            if (!gameStateRef.current.started && isPinching && !prevPinch) {
              const startBtn = document.getElementById('ar-start-btn')
              if (startBtn) {
                const rect = startBtn.getBoundingClientRect()
                const canvasRect = canvas.getBoundingClientRect()
                const screenX = canvasRect.left + (tracking.cursorX / canvas.width) * canvasRect.width
                const screenY = canvasRect.top + (tracking.cursorY / canvas.height) * canvasRect.height
                if (screenX >= rect.left && screenX <= rect.right && screenY >= rect.top && screenY <= rect.bottom) {
                  if (handleStartGameRef.current) handleStartGameRef.current()
                  return
                }
              }
            }

            handlePinchInteraction(tracking.cursorX, tracking.cursorY, isPinching, prevPinch)
          } else {
            lostCount++
            // Maintain detection for 12 frames (~400ms) to prevent jitter/flickering
            if (lostCount > 12) {
              tracking.handDetected = false
              tracking.landmarks = null
              setHandStatus('searching')
              if (tracking.grabbedBubble) {
                releaseGrabbedBubble()
              }
            }
          }
        })

        // Sequential prediction loop throttled to 30 FPS inference (saves 50% CPU)
        let isLoopRunning = true
        let lastInferenceTime = 0
        const runPredictionLoop = async () => {
          while (isMounted && isLoopRunning) {
            const video = internalVideoRef.current
            const now = performance.now()
            if (
              now - lastInferenceTime >= 32 &&
              video &&
              video.readyState >= 2 &&
              video.videoWidth > 0 &&
              !video.paused &&
              !video.ended &&
              handsInstance
            ) {
              lastInferenceTime = now
              try {
                await handsInstance.send({ image: video })
              } catch (e) {
                // Silently skip frame error
              }
            }
            await new Promise(resolve => {
              animFrameId = requestAnimationFrame(resolve)
            })
          }
        }

        runPredictionLoop()
        setAiLoading(false)
      } catch (err) {
        console.warn('MediaPipe initialization warning (falling back to mouse):', err)
        setAiError('تعذر تحميل مكتبة تتبع اليد تلقائياً. تم تفعيل نظام الفأرة والشاشة اللمسية 🖱️')
        setHandStatus('mouse')
        setAiLoading(false)
      }
    }

    initMediaPipe()

    return () => {
      isMounted = false
      if (animFrameId) {
        cancelAnimationFrame(animFrameId)
      }
      if (handsInstance && handsInstance.close) {
        try { handsInstance.close() } catch (e) {}
      }
    }
  }, [useMouseFallback])

  // 60 FPS Render Animation Loop (drawLoop)
  useEffect(() => {
    let animId = null
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const render = () => {
      const w = canvas.width
      const h = canvas.height
      const tracking = trackingRef.current
      const state = gameStateRef.current

      // Clear Canvas
      ctx.clearRect(0, 0, w, h)

      // ── 1. Draw Hand Skeleton (if enabled and detected) ──
      if (showSkeleton && tracking.handDetected && tracking.landmarks) {
        ctx.save()
        const landmarks = tracking.landmarks
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.75)'
        ctx.lineWidth = 3
        ctx.shadowColor = '#06b6d4'
        ctx.shadowBlur = 8

        const video = internalVideoRef.current
        let scale = 1, offsetX = 0, offsetY = 0
        if (video && video.videoWidth > 0 && video.videoHeight > 0) {
          const vw = video.videoWidth
          const vh = video.videoHeight
          const videoAspect = vw / vh
          const canvasAspect = w / h
          if (canvasAspect > videoAspect) {
            scale = w / vw
            offsetY = (h - vh * scale) / 2
          } else {
            scale = h / vh
            offsetX = (w - vw * scale) / 2
          }
        }

        const mapPt = (pt) => {
          const normX = isMirrored ? (1 - pt.x) : pt.x
          const normY = pt.y
          if (scale !== 1 || offsetX !== 0 || offsetY !== 0) {
            return {
              x: offsetX + normX * video.videoWidth * scale,
              y: offsetY + normY * video.videoHeight * scale
            }
          }
          return {
            x: normX * w,
            y: normY * h
          }
        }

        HAND_CONNECTIONS.forEach(([i, j]) => {
          const p1 = mapPt(landmarks[i])
          const p2 = mapPt(landmarks[j])

          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        })

        // Draw joints
        landmarks.forEach((pt, idx) => {
          const p = mapPt(pt)
          ctx.beginPath()
          ctx.arc(p.x, p.y, idx === 8 || idx === 4 ? 7 : 4, 0, Math.PI * 2)
          ctx.fillStyle = idx === 8 ? '#facc15' : idx === 4 ? '#ec4899' : '#22d3ee'
          ctx.fill()
        })
        ctx.restore()
      }

      // ── 2. Screen: Draw Active Game (Cards, Slots, Bubbles) ──
      if (state.started) {
        const item = activeItem || COLORS_GAME_DATA[0]
        const isMobile = w < 640 || (w < 850 && h > w)
        const isShort = h < 740
        const cardW = Math.min(isMobile ? 320 : (isShort ? 360 : 440), w * (isMobile ? 0.90 : 0.60))
        const cardH = isMobile ? 84 : (isShort ? 90 : 130)
        const cardX = (w - cardW) / 2
        const cardY = isMobile ? 48 : (isShort ? 14 : 26)

        ctx.save()
        // Glassmorphism Card (zero shadowBlur for 60fps)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
        ctx.beginPath()
        ctx.roundRect(cardX, cardY, cardW, cardH, isMobile || isShort ? 14 : 20)
        ctx.fill()

        // Glowing border
        ctx.lineWidth = 2
        ctx.strokeStyle = item.hex || item.color || '#38bdf8'
        ctx.stroke()

        // 2.5D Big Emoji
        ctx.font = `${isMobile ? 32 : (isShort ? 36 : 52)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(item.emoji, cardX + (isMobile ? 38 : (isShort ? 44 : 70)), cardY + cardH / 2)

        // Word Title & Arabic description
        ctx.textAlign = 'right'
        ctx.fillStyle = '#ffffff'
        ctx.font = `bold ${isMobile ? 20 : (isShort ? 22 : 30)}px "Tajawal", sans-serif`
        ctx.fillText(item.name, cardX + cardW - (isMobile || isShort ? 14 : 26), cardY + (isMobile ? 26 : (isShort ? 28 : 44)))

        ctx.fillStyle = item.hex || item.color || '#94a3b8'
        ctx.font = `bold ${isMobile ? 12 : (isShort ? 13 : 18)}px "Tajawal", sans-serif`
        ctx.fillText(item.arabicName || item.englishName || 'اسحب الحروف لتكوين الكلمة', cardX + cardW - (isMobile || isShort ? 14 : 26), cardY + (isMobile ? 52 : (isShort ? 54 : 80)))

        // Progress badge (e.g. 1 / 12)
        const badgeW = isMobile ? 65 : (isShort ? 72 : 98)
        const badgeH = isMobile ? 18 : (isShort ? 20 : 24)
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.beginPath()
        ctx.roundRect(cardX + cardW - (isMobile || isShort ? 80 : 120), cardY + cardH - (isMobile || isShort ? 22 : 30), badgeW, badgeH, 10)
        ctx.fill()
        ctx.fillStyle = '#f8fafc'
        ctx.font = `${isMobile || isShort ? 10 : 12}px "Tajawal", sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(`${state.currentIndex + 1} من ${state.totalCount}`, cardX + cardW - (isMobile || isShort ? 80 : 120) + badgeW / 2, cardY + cardH - (isMobile || isShort ? 9 : 14))

        ctx.restore()

        // ── Drop Slots ──
        state.slots.forEach((slot) => {
          ctx.save()
          ctx.beginPath()
          ctx.roundRect(slot.x, slot.y, slot.width, slot.height, isMobile || isShort ? 10 : 14)

          if (slot.isCorrect) {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.35)'
            ctx.strokeStyle = '#10b981'
            ctx.lineWidth = 3
          } else {
            ctx.fillStyle = 'rgba(30, 41, 59, 0.75)'
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
          }
          ctx.fill()
          ctx.stroke()

          if (slot.isCorrect) {
            ctx.fillStyle = '#ffffff'
            ctx.font = `bold ${Math.floor(slot.width * 0.55)}px "Tajawal", sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(slot.current, slot.x + slot.width / 2, slot.y + slot.height / 2)
          } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
            ctx.font = `bold ${Math.floor(slot.width * 0.45)}px "Tajawal", sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('؟', slot.x + slot.width / 2, slot.y + slot.height / 2)
          }
          ctx.restore()
        })

        // ── Floating Bubbles ──
        const topLimit = cardY + cardH + 10
        const bottomLimit = state.slots[0] ? (state.slots[0].y - 10) : (h * 0.75)

        state.bubbles.forEach((bubble) => {
          if (bubble.isPlaced) return

          if (tracking.grabbedBubble !== bubble) {
            bubble.x += bubble.vx
            bubble.y += bubble.vy + Math.sin(Date.now() * 0.003 + bubble.phase) * 0.35

            if (bubble.x - bubble.radius < 12) { bubble.x = 12 + bubble.radius; bubble.vx *= -1 }
            if (bubble.x + bubble.radius > w - 12) { bubble.x = w - 12 - bubble.radius; bubble.vx *= -1 }
            if (bubble.y - bubble.radius < topLimit) { bubble.y = topLimit + bubble.radius; bubble.vy *= -1 }
            if (bubble.y + bubble.radius > bottomLimit) { bubble.y = bottomLimit - bubble.radius; bubble.vy *= -1 }
          }

          const isHovered = tracking.hoveredBubbleId === bubble.id
          const isGrabbed = tracking.grabbedBubble === bubble
          const r = bubble.radius * (isGrabbed ? 1.2 : isHovered ? 1.12 : 1.0)

          ctx.save()
          // Zero blur for ordinary bubbles to ensure 60fps on phones!
          if (isGrabbed || isHovered) {
            ctx.shadowColor = bubble.color
            ctx.shadowBlur = 10
          }

          const bGrad = ctx.createRadialGradient(
            bubble.x - r * 0.3, bubble.y - r * 0.3, r * 0.1,
            bubble.x, bubble.y, r
          )
          bGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)')
          bGrad.addColorStop(0.35, bubble.color + 'cc')
          bGrad.addColorStop(0.85, bubble.color + '66')
          bGrad.addColorStop(1, 'rgba(255, 255, 255, 0.4)')

          ctx.beginPath()
          ctx.arc(bubble.x, bubble.y, r, 0, Math.PI * 2)
          ctx.fillStyle = bGrad
          ctx.fill()

          ctx.lineWidth = isGrabbed ? 3.5 : isHovered ? 3 : 2
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
          ctx.stroke()

          // Glossy bubble highlight
          ctx.beginPath()
          ctx.ellipse(bubble.x - r * 0.35, bubble.y - r * 0.35, r * 0.28, r * 0.16, -Math.PI / 4, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
          ctx.fill()

          ctx.fillStyle = '#ffffff'
          ctx.font = `bold ${Math.floor(r * 0.9)}px "Tajawal", sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(bubble.char, bubble.x, bubble.y + 2)

          ctx.restore()
        })
      }

      // ── Star / Sparkle Particles ──
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.25
        p.life -= 0.02

        if (p.life <= 0) {
          state.particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = p.life
        if (p.char) {
          ctx.font = `${p.size * 2}px serif`
          ctx.fillText(p.char, p.x, p.y)
        } else {
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      // ── Draw AR Cursor Feedback (4 States) ──
      if (tracking.handDetected || useMouseFallback) {
        const cx = tracking.cursorX
        const cy = tracking.cursorY
        const fb = tracking.pinchFeedback
        ctx.save()

        if (fb === 'grabbed') {
          ctx.beginPath()
          ctx.arc(cx, cy, 26, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(16, 185, 129, 0.4)'
          ctx.fill()
          ctx.lineWidth = 3
          ctx.strokeStyle = '#10b981'
          ctx.shadowColor = '#10b981'
          ctx.shadowBlur = 18
          ctx.stroke()

          ctx.fillStyle = '#10b981'
          ctx.font = 'bold 20px "Segoe UI", sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('✔️', cx, cy)

          if (tracking.grabbedBubble) {
            ctx.beginPath()
            ctx.setLineDash([4, 4])
            ctx.moveTo(cx, cy)
            ctx.lineTo(tracking.grabbedBubble.x, tracking.grabbedBubble.y)
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)'
            ctx.lineWidth = 2
            ctx.stroke()
          }
        } else if (fb === 'pinch_miss') {
          ctx.beginPath()
          ctx.arc(cx, cy, 22, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'
          ctx.fill()
          ctx.lineWidth = 3
          ctx.strokeStyle = '#ef4444'
          ctx.shadowColor = '#ef4444'
          ctx.shadowBlur = 16
          ctx.stroke()
        } else if (fb === 'hover') {
          ctx.beginPath()
          const pulseR = 26 + Math.sin(Date.now() * 0.01) * 3
          ctx.arc(cx, cy, pulseR, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(250, 204, 21, 0.25)'
          ctx.fill()
          ctx.lineWidth = 3
          ctx.strokeStyle = '#facc15'
          ctx.setLineDash([6, 6])
          ctx.shadowColor = '#facc15'
          ctx.shadowBlur = 18
          ctx.stroke()
        } else {
          ctx.beginPath()
          ctx.arc(cx, cy, 18, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(56, 189, 248, 0.3)'
          ctx.fill()
          ctx.lineWidth = 2.5
          ctx.strokeStyle = '#38bdf8'
          ctx.shadowColor = '#38bdf8'
          ctx.shadowBlur = 12
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(cx, cy, 4, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
        }

        ctx.restore()
      }

      // ── Victory Modal if game completed ──
      if (state.allClear) {
        ctx.save()
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
        ctx.fillRect(0, 0, w, h)

        const boxW = Math.min(520, w * 0.85)
        const boxH = 320
        const bx = (w - boxW) / 2
        const by = (h - boxH) / 2

        ctx.fillStyle = 'rgba(30, 41, 59, 0.95)'
        ctx.beginPath()
        ctx.roundRect(bx, by, boxW, boxH, 24)
        ctx.fill()
        ctx.lineWidth = 3
        ctx.strokeStyle = '#10b981'
        ctx.shadowColor = '#10b981'
        ctx.shadowBlur = 30
        ctx.stroke()

        ctx.textAlign = 'center'
        ctx.fillStyle = '#10b981'
        ctx.font = 'bold 44px "Tajawal", sans-serif'
        ctx.fillText('All Clear! 🎉', w / 2, by + 70)

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 24px "Tajawal", sans-serif'
        ctx.fillText('أحسنت! أتممت جميع الكلمات بنجاح باهر ⭐⭐⭐', w / 2, by + 125)

        ctx.fillStyle = '#94a3b8'
        ctx.font = '18px "Tajawal", sans-serif'
        ctx.fillText(`النتيجة النهائية: ${state.score} من ${state.totalCount}`, w / 2, by + 170)

        ctx.restore()
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [showSkeleton, isMirrored, useMouseFallback, activeItem])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#090d16',
        userSelect: 'none'
      }}
    >
      {/* Underlying Webcam Video */}
      <video
        ref={internalVideoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: isMirrored ? 'scaleX(-1)' : 'none',
          opacity: isCameraOn ? 1 : 0,
          transition: 'opacity 0.4s ease'
        }}
      />

      {/* Futuristic Background if Camera is off */}
      {!isCameraOn && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 40%, #1e1b4b 0%, #090d16 80%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ fontSize: '48px' }}>🖐️✨</div>
          <div style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 700 }}>
            الكاميرا متوقفة — يمكنك التفاعل بالفأرة أو تشغيل الكاميرا من الأعلى
          </div>
        </div>
      )}

      {/* AR Canvas Overlay */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 10,
          cursor: useMouseFallback ? 'default' : 'none',
          touchAction: 'none'
        }}
      />

      {/* ── Start Instructions HTML Overlay ── */}
      {!isGameStarted && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 30,
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.92)',
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '24px',
            padding: '24px 20px',
            maxWidth: '520px',
            width: '92%',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>🎮🖐️</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 8px 0' }}>
              لعبة الواقع المعزز التفاعلية باليد (AR Hands)
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.55, margin: '0 0 20px 0' }}>
              ضع يدك أمام الكاميرا، وقم بقرص أصابعك (الإبهام + السبابة 🤏) لالتقاط الحروف والألوان ووضعها في المربعات، أو المس واسحب بإصبعك مباشرة!
            </p>

            <button
              id="ar-start-btn"
              onClick={handleStartGame}
              onPointerDown={handleStartGame}
              style={{
                width: '115px',
                height: '115px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #34d399 0%, #059669 100%)',
                border: '4px solid #ecfdf5',
                color: 'white',
                fontSize: '1.35rem',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 0 35px rgba(16, 185, 129, 0.6), 0 10px 25px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                transition: 'transform 0.18s, box-shadow 0.18s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <span style={{ fontSize: '26px' }}>🚀</span>
              <span>ابدأ!</span>
            </button>
          </div>
        </div>
      )}

      {/* Glassmorphic AI Status Banner */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        maxWidth: '220px',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '20px',
        padding: '4px 10px',
        color: '#f8fafc',
        fontSize: '0.70rem',
        fontWeight: 700,
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {aiLoading ? (
          <>
            <span style={{ display: 'inline-block', width: '7px', height: '7px', minWidth: '7px', borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1s infinite' }} />
            <span>جاري التحميل... ⏳</span>
          </>
        ) : handStatus === 'detected' ? (
          <>
            <span style={{ display: 'inline-block', width: '7px', height: '7px', minWidth: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span>اليد متصلة ✨ (قرص 🤏)</span>
          </>
        ) : handStatus === 'mouse' ? (
          <>
            <span style={{ display: 'inline-block', width: '7px', height: '7px', minWidth: '7px', borderRadius: '50%', background: '#3b82f6' }} />
            <span>الماوس واللمس 🖱️</span>
          </>
        ) : (
          <>
            <span style={{ display: 'inline-block', width: '7px', height: '7px', minWidth: '7px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
            <span>ضع يدك 🖐️ أو اسحب</span>
          </>
        )}
      </div>

      {/* Current Score Pill */}
      {isGameStarted && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(250, 204, 21, 0.3)',
          borderRadius: '20px',
          padding: '4px 10px',
          color: '#facc15',
          fontSize: '0.74rem',
          fontWeight: 800,
          boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
        }}>
          <span>⭐ النقاط:</span>
          <span style={{ color: '#ffffff', fontSize: '0.88rem' }}>{currentScore}</span>
        </div>
      )}

      {/* Floating Action when Game Over */}
      {isGameOver && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 35,
          display: 'flex',
          gap: '14px'
        }}>
          <button
            onClick={handleStartGame}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '14px 28px',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>إعادة اللعب 🔄</span>
          </button>
        </div>
      )}
    </div>
  )
}
