'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import confetti from 'canvas-confetti'
import {
  Sparkles, Hand, Eye, EyeOff,
  Pen, Highlighter, Eraser, Crosshair, Trash2,
  ChevronRight, ChevronLeft, Undo2, Shield, X, Maximize2, Minimize2,
  MousePointer2, Palette, ThumbsUp, Sliders, Check
} from 'lucide-react'

// ── 1. One-Euro Filter (1€ Filter) for Zero-Jitter & Instant 60 FPS Tracking ──
class LowPassFilter {
  constructor(alpha = 0) {
    this.alpha = alpha
    this.y = null
    this.s = null
  }
  setAlpha(alpha) {
    this.alpha = Math.max(0, Math.min(1, alpha))
  }
  filter(value) {
    if (this.y === null) {
      this.s = value
      this.y = value
      return value
    }
    this.y = value
    this.s = this.alpha * value + (1 - this.alpha) * this.s
    return this.s
  }
  lastValue() {
    return this.y
  }
}

class OneEuroFilter {
  constructor(freq = 60, minCutoff = 1.2, beta = 0.035, dCutoff = 1.0) {
    this.freq = freq
    this.minCutoff = minCutoff
    this.beta = beta
    this.dCutoff = dCutoff
    this.xFilter = new LowPassFilter()
    this.dxFilter = new LowPassFilter()
    this.lastTime = null
  }
  alpha(cutoff, dt) {
    const tau = 1.0 / (2 * Math.PI * cutoff)
    return 1.0 / (1.0 + tau / dt)
  }
  filter(val, timestamp) {
    if (this.lastTime === null) {
      this.lastTime = timestamp
      return val
    }
    const dt = Math.max(0.001, (timestamp - this.lastTime) / 1000)
    this.lastTime = timestamp

    const prev = this.xFilter.lastValue() !== null ? this.xFilter.lastValue() : val
    const dx = (val - prev) / dt
    this.dxFilter.setAlpha(this.alpha(this.dCutoff, dt))
    const edx = this.dxFilter.filter(dx)

    const cutoff = this.minCutoff + this.beta * Math.abs(edx)
    this.xFilter.setAlpha(this.alpha(cutoff, dt))
    return this.xFilter.filter(val)
  }
  reset() {
    this.xFilter = new LowPassFilter()
    this.dxFilter = new LowPassFilter()
    this.lastTime = null
  }
}

// ── 2. Web Audio Synthesizer for High-Speed Audio Feedback ──
class GestureSFX {
  constructor() {
    this.ctx = null
  }
  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) this.ctx = new AudioCtx()
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
  }
  playPop() {
    this.init()
    if (!this.ctx) return
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(540, now)
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.05)
      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.05)
    } catch (e) {}
  }
  playDing() {
    this.init()
    if (!this.ctx) return
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(880, now)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.25)
    } catch (e) {}
  }
  playModeSwitch() {
    this.init()
    if (!this.ctx) return
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12)
      gain.gain.setValueAtTime(0.28, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.12)
    } catch (e) {}
  }
  playSwipe() {
    this.init()
    if (!this.ctx) return
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.1)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.1)
    } catch (e) {}
  }
  playFanfare() {
    this.init()
    if (!this.ctx) return
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const now = this.ctx.currentTime + idx * 0.08
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now)
        gain.gain.setValueAtTime(0.25, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(now)
        osc.stop(now + 0.3)
      })
    } catch (e) {}
  }
}

const sfx = new GestureSFX()

// Hand landmark connections for skeleton rendering
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],         // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],         // Index
  [5, 9], [9, 10], [10, 11], [11, 12],    // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],  // Ring
  [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [0, 17]                                 // Palm base
]

export default function ARGestureController({
  stream = null, // Reusable camera stream from classroom (prevents hardware locks!)
  channel = null,
  canvas = null,
  fabricCanvasRef = null,
  activeTool = 'pen',
  setActiveTool = () => {},
  activeColor = '#0f172a',
  setActiveColor = () => {},
  lineWidth = 5,
  setLineWidth = () => {},
  undo = () => {},
  redo = () => {},
  clearBoard = () => {},
  onNextPage = () => {},
  onPrevPage = () => {},
  onNextSlide = null,
  onPrevSlide = null,
  onClose = () => {},
  broadcastSafely = null,
  broadcastViewport = null,
  syncBackgroundToViewport = null
}) {
  // References
  const videoRef = useRef(null)
  const pipCanvasRef = useRef(null)
  const overlayCanvasRef = useRef(null)
  const containerRef = useRef(null)

  // 1€ Filters for X and Y cursor tracking
  const filterX = useRef(new OneEuroFilter(60, 1.2, 0.035, 1.0))
  const filterY = useRef(new OneEuroFilter(60, 1.2, 0.035, 1.0))

  // Callback refs to avoid stale closures
  const propsRef = useRef({
    channel, canvas, fabricCanvasRef, activeTool, setActiveTool, activeColor, setActiveColor,
    lineWidth, setLineWidth, undo, redo, clearBoard, onNextPage, onPrevPage, onNextSlide, onPrevSlide,
    onClose, broadcastSafely, broadcastViewport, syncBackgroundToViewport
  })
  propsRef.current = {
    channel, canvas, fabricCanvasRef, activeTool, setActiveTool, activeColor, setActiveColor,
    lineWidth, setLineWidth, undo, redo, clearBoard, onNextPage, onPrevPage, onNextSlide, onPrevSlide,
    onClose, broadcastSafely, broadcastViewport, syncBackgroundToViewport
  }

  // Active Whiteboard Canvas Resolver
  const getActiveCanvas = () => {
    if (propsRef.current.canvas) return propsRef.current.canvas
    if (propsRef.current.fabricCanvasRef?.current) return propsRef.current.fabricCanvasRef.current
    if (typeof window !== 'undefined' && window.__activeFabricCanvas) return window.__activeFabricCanvas
    return null
  }

  const getCanvasTargetEl = () => {
    const c = getActiveCanvas()
    if (c?.upperCanvasEl) return c.upperCanvasEl
    if (typeof document !== 'undefined') {
      return document.querySelector('.canvas-container canvas.upper-canvas') || document.querySelector('canvas.upper-canvas')
    }
    return null
  }

  // State Management
  const [isReady, setIsReady] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [handStatus, setHandStatus] = useState('searching') // 'searching' | 'detected'
  const [currentGestureBadge, setCurrentGestureBadge] = useState('🖐️ مؤشر ليزر')
  const [gestureMode, setGestureMode] = useState('laser') // 'laser' | 'draw'
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [isMirrored, setIsMirrored] = useState(true)
  const [showPip, setShowPip] = useState(false)
  const [isPipMinimized, setIsPipMinimized] = useState(false)
  const [showAirPalette, setShowAirPalette] = useState(false)
  const [dwellClickEnabled, setDwellClickEnabled] = useState(false) // Default false for zero accidental clicks!
  const [hoveredToolId, setHoveredToolId] = useState(null)
  const [hoverProgress, setHoverProgress] = useState(0)
  const [sensitivity, setSensitivity] = useState(1.0)
  const [showSettings, setShowSettings] = useState(false)

  // Tracking state ref (kept outside React re-renders for buttery 60-120fps smoothness)
  const trackingRef = useRef({
    handDetected: false,
    cursorX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    cursorY: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    normX: 0.5,
    normY: 0.5,
    isPinching: false,
    prevPinch: false,
    landmarks: null,
    isFist: false,
    fistFrames: 0,
    prevFistX: null,
    prevFistY: null,
    lastSwipeTime: 0,
    prevPalmX: null,
    peaceSignFrames: 0,
    lastPeaceToggleTime: 0,
    thumbsUpFrames: 0,
    lastThumbsUpTime: 0,
    hoveredElement: null,
    hoverStartTime: 0,
    isDrawingOnCanvas: false,
    lastClickTime: 0,
    lastClickX: 0,
    lastClickY: 0,
    particles: [],
    lastBroadcastTime: 0
  })

  // Quick Colors
  const QUICK_COLORS = [
    { name: 'أسود', hex: '#0f172a' },
    { name: 'أحمر', hex: '#ef4444' },
    { name: 'أزرق', hex: '#2563eb' },
    { name: 'أخضر', hex: '#10b981' },
    { name: 'أصفر', hex: '#f59e0b' }
  ]

  // Page Navigation Triggers
  const triggerNextPage = useCallback(() => {
    sfx.playSwipe()
    if (typeof window !== 'undefined' && typeof window.__whiteboardNextPage === 'function') {
      window.__whiteboardNextPage()
    } else if (typeof propsRef.current.onNextSlide === 'function') {
      propsRef.current.onNextSlide()
    } else {
      propsRef.current.onNextPage()
    }
  }, [])

  const triggerPrevPage = useCallback(() => {
    sfx.playSwipe()
    if (typeof window !== 'undefined' && typeof window.__whiteboardPrevPage === 'function') {
      window.__whiteboardPrevPage()
    } else if (typeof propsRef.current.onPrevSlide === 'function') {
      propsRef.current.onPrevSlide()
    } else {
      propsRef.current.onPrevPage()
    }
  }, [])

  // ── 3. Acquire / Reuse Camera Stream ──
  useEffect(() => {
    let localStreamCreated = null
    const video = videoRef.current
    if (!video) return

    // 1. If classroom already provided an active stream, REUSE IT!
    if (stream && stream.getVideoTracks().some(t => t.readyState === 'live')) {
      video.srcObject = stream
      video.play().catch(() => {})
      return
    }

    // 2. Otherwise, request a lightweight webcam feed strictly for AI hand tracking
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      },
      audio: false
    }).then(newStream => {
      localStreamCreated = newStream
      video.srcObject = newStream
      video.play().catch(() => {})
    }).catch(err => {
      console.warn('AR Camera permission or device busy:', err)
      setErrorMsg('الكاميرا مشغولة في البث أو غير متوفرة. تأكد من تفعيل صلاحيات الكاميرا.')
    })

    return () => {
      // ONLY stop tracks if they were created locally inside this component
      if (localStreamCreated) {
        localStreamCreated.getTracks().forEach(t => t.stop())
      }
    }
  }, [stream])

  // ── 4. Fullscreen Overlay Canvas Resize ──
  useEffect(() => {
    const updateSize = () => {
      const overlay = overlayCanvasRef.current
      if (!overlay) return
      overlay.width = window.innerWidth
      overlay.height = window.innerHeight
    }

    updateSize()
    const timer = setTimeout(updateSize, 300)
    window.addEventListener('resize', updateSize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  // ── 5. Proximity Snap & Clean Click Dispatcher ──
  const findClickableElement = (el) => {
    if (!el || el === document.body || el === document.documentElement) return null
    if (el.closest('#ar-pip-window') || el.closest('#ar-hud-pill') || el.closest('#ar-palette')) return null

    return el.closest('button, a, input, select, textarea, label, [role="button"], [role="tab"], [tabindex], [data-action], [data-air-tool], .cursor-pointer')
  }

  const findClickableNearPoint = (x, y, radius = 24) => {
    if (typeof document === 'undefined') return null
    const el = document.elementFromPoint(x, y)
    const direct = findClickableElement(el)
    if (direct) return direct

    const offsets = [
      [0, -10], [0, 10], [-10, 0], [10, 0],
      [-16, -16], [16, -16], [-16, 16], [16, 16],
      [0, -radius], [0, radius], [-radius, 0], [radius, 0]
    ]

    for (let i = 0; i < offsets.length; i++) {
      const px = x + offsets[i][0]
      const py = y + offsets[i][1]
      if (px > 0 && px < window.innerWidth && py > 0 && py < window.innerHeight) {
        const testEl = document.elementFromPoint(px, py)
        const matched = findClickableElement(testEl)
        if (matched) return matched
      }
    }
    return null
  }

  const triggerCleanClick = (element, clientX, clientY) => {
    if (!element || element.disabled || element.getAttribute('aria-disabled') === 'true') return
    sfx.playDing()

    trackingRef.current.lastClickTime = Date.now()
    trackingRef.current.lastClickX = clientX
    trackingRef.current.lastClickY = clientY

    try { if (typeof element.focus === 'function') element.focus() } catch (e) {}

    // Execute clean native click
    try {
      if (typeof element.click === 'function') {
        element.click()
      } else {
        const opts = { bubbles: true, cancelable: true, view: window, clientX, clientY }
        element.dispatchEvent(new MouseEvent('click', opts))
      }
    } catch (e) {}
  }

  // ── 6. Tool Action Execution in Mid-Air ──
  const executeToolAction = (actionId) => {
    if (!actionId) return
    const activeCanvas = getActiveCanvas()
    const { setActiveTool, setActiveColor, activeTool, clearBoard, undo, lineWidth } = propsRef.current

    if (actionId === 'tool_select') {
      setActiveTool('select')
      if (activeCanvas) { activeCanvas.isDrawingMode = false; activeCanvas.selection = true; }
    } else if (actionId === 'tool_pan') {
      setActiveTool('pan')
      if (activeCanvas) { activeCanvas.isDrawingMode = false; }
    } else if (actionId === 'tool_pen') {
      setActiveTool('pen')
      if (activeCanvas) {
        activeCanvas.isDrawingMode = true
        if (activeCanvas.freeDrawingBrush) {
          activeCanvas.freeDrawingBrush.color = propsRef.current.activeColor || '#0f172a'
          activeCanvas.freeDrawingBrush.width = lineWidth || 5
        }
      }
    } else if (actionId === 'tool_highlighter') {
      setActiveTool('highlighter')
      if (activeCanvas) {
        activeCanvas.isDrawingMode = true
        if (activeCanvas.freeDrawingBrush) {
          activeCanvas.freeDrawingBrush.color = 'rgba(250, 204, 21, 0.4)'
          activeCanvas.freeDrawingBrush.width = 24
        }
      }
    } else if (actionId === 'tool_eraser') {
      setActiveTool('eraser')
      if (activeCanvas) { activeCanvas.isDrawingMode = false; }
    } else if (actionId === 'tool_laser') {
      setActiveTool('laser')
      if (activeCanvas) { activeCanvas.isDrawingMode = false; }
    } else if (actionId === 'action_clear') {
      clearBoard()
      if (activeCanvas) { activeCanvas.clear(); }
    } else if (actionId === 'action_undo') {
      undo()
    } else if (actionId === 'action_next') {
      triggerNextPage()
    } else if (actionId === 'action_prev') {
      triggerPrevPage()
    } else if (actionId.startsWith('color_')) {
      const hex = actionId.replace('color_', '')
      setActiveColor(hex)
      if (activeCanvas && activeCanvas.freeDrawingBrush) {
        activeCanvas.freeDrawingBrush.color = hex
      }
      if (activeTool === 'eraser' || activeTool === 'select' || activeTool === 'pan') {
        setActiveTool('pen')
      }
    }
  }

  // ── 7. MediaPipe Hands Loader & Non-Blocking Asynchronous Loop ──
  useEffect(() => {
    let isMounted = true
    let handsInstance = null
    let animFrameId = null
    let isProcessingFrame = false

    const initMediaPipe = async () => {
      try {
        if (!window.Hands) {
          await new Promise((resolve, reject) => {
            const existingScript = document.querySelector('script[src*="mediapipe/hands"]')
            if (existingScript) {
              if (window.Hands) { resolve(); return }
              existingScript.addEventListener('load', () => resolve())
              existingScript.addEventListener('error', () => reject(new Error('MediaPipe script failed to load')))
              return
            }

            const timeout = setTimeout(() => reject(new Error('MediaPipe script load timeout')), 12000)
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
            script.onload = () => { clearTimeout(timeout); resolve() }
            script.onerror = () => { clearTimeout(timeout); reject(new Error('Failed to load MediaPipe')) }
            document.head.appendChild(script)
          })
        }

        if (!isMounted) return

        const Hands = window.Hands
        handsInstance = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        })

        handsInstance.setOptions({
          maxNumHands: 1, // 1 hand for maximum responsiveness & 0 CPU overhead
          modelComplexity: 0, // Lite model for rock-solid performance
          minDetectionConfidence: 0.4,
          minTrackingConfidence: 0.4
        })

        let lostFrames = 0

        handsInstance.onResults((results) => {
          isProcessingFrame = false
          if (!isMounted) return
          const tracking = trackingRef.current
          const now = performance.now()

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            lostFrames = 0
            const landmarks = results.multiHandLandmarks[0]
            tracking.landmarks = landmarks
            tracking.handDetected = true
            setHandStatus('detected')

            const wrist = landmarks[0]
            const thumbTip = landmarks[4]
            const indexTip = landmarks[8]
            const middleTip = landmarks[12]
            const ringTip = landmarks[16]
            const pinkyTip = landmarks[20]
            const mcp9 = landmarks[9]

            // Distance-invariant hand span
            const handSpan = Math.hypot(mcp9.x - wrist.x, mcp9.y - wrist.y) || 0.2

            // Active tracking tip
            const activeTip = tracking.isPinching
              ? { x: (indexTip.x + thumbTip.x) * 0.5, y: (indexTip.y + thumbTip.y) * 0.5 }
              : indexTip

            // Mirrored Viewport Coordinates
            const rawNormX = isMirrored ? (1 - activeTip.x) : activeTip.x
            const rawNormY = activeTip.y

            // Sensitivity edge expansion
            const centerPad = 0.5
            const scaledNormX = Math.max(0, Math.min(1, centerPad + (rawNormX - centerPad) * sensitivity))
            const scaledNormY = Math.max(0, Math.min(1, centerPad + (rawNormY - centerPad) * sensitivity))

            const targetPixelX = scaledNormX * window.innerWidth
            const targetPixelY = scaledNormY * window.innerHeight

            // 1€ Filter Application: Silky Smooth 60 FPS, 0 Tremor, 0 Lag!
            const smoothX = filterX.current.filter(targetPixelX, now)
            const smoothY = filterY.current.filter(targetPixelY, now)

            tracking.cursorX = smoothX
            tracking.cursorY = smoothY
            tracking.normX = smoothX / window.innerWidth
            tracking.normY = smoothY / window.innerHeight

            // ── GESTURE 1: PINCH (🤏 Click & Air Drawing) ──
            const dIndexThumb = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y)
            const dMidThumb = Math.hypot(thumbTip.x - middleTip.x, thumbTip.y - middleTip.y)
            const pinchRatio = Math.min(dIndexThumb, dMidThumb) / handSpan

            // Hysteresis prevents rapid fluttering
            const isPinching = tracking.isPinching ? (pinchRatio < 0.38) : (pinchRatio < 0.26)
            const prevPinch = tracking.isPinching
            tracking.isPinching = isPinching

            // ── GESTURE 2: FIST (✊ Drag Viewport / Scroll) ──
            const dWrist8 = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y)
            const dWrist5 = Math.hypot(landmarks[5].x - wrist.x, landmarks[5].y - wrist.y)
            const dWrist12 = Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y)
            const dWrist9 = Math.hypot(mcp9.x - wrist.x, mcp9.y - wrist.y)
            const dWrist16 = Math.hypot(ringTip.x - wrist.x, ringTip.y - wrist.y)
            const dWrist13 = Math.hypot(landmarks[13].x - wrist.x, landmarks[13].y - wrist.y)
            const dWrist20 = Math.hypot(pinkyTip.x - wrist.x, pinkyTip.y - wrist.y)
            const dWrist17 = Math.hypot(landmarks[17].x - wrist.x, landmarks[17].y - wrist.y)

            const allFingersCurled = (dWrist8 < dWrist5 * 1.05) &&
                                     (dWrist12 < dWrist9 * 1.05) &&
                                     (dWrist16 < dWrist13 * 1.05) &&
                                     (dWrist20 < dWrist17 * 1.05)

            const isFistInstant = !isPinching && allFingersCurled
            if (isFistInstant) {
              tracking.fistFrames = (tracking.fistFrames || 0) + 1
            } else {
              tracking.fistFrames = 0
            }
            const isFist = tracking.fistFrames >= 5
            tracking.isFist = isFist

            // ── GESTURE 3: PEACE / V-SIGN (✌️ Toggle Laser / Air Pen) ──
            const isIndexExtended = dWrist8 > dWrist5 * 1.3
            const isMiddleExtended = dWrist12 > dWrist9 * 1.3
            const isRingCurled = dWrist16 < dWrist13 * 1.1
            const isPinkyCurled = dWrist20 < dWrist17 * 1.1
            const isPeaceSign = isIndexExtended && isMiddleExtended && isRingCurled && isPinkyCurled && !isPinching && !isFist

            if (isPeaceSign) {
              tracking.peaceSignFrames = (tracking.peaceSignFrames || 0) + 1
              if (tracking.peaceSignFrames === 12 && Date.now() - tracking.lastPeaceToggleTime > 1200) {
                sfx.playModeSwitch()
                setGestureMode(prev => (prev === 'laser' ? 'draw' : 'laser'))
                tracking.lastPeaceToggleTime = Date.now()
                setCurrentGestureBadge(gestureMode === 'laser' ? '✍️ قلم الرسم الهوائي' : '🔴 مؤشر الليزر')
              }
            } else {
              tracking.peaceSignFrames = 0
            }

            // ── GESTURE 4: THUMBS-UP (👍 Student Encouragement & Confetti) ──
            const isThumbUp = (thumbTip.y < landmarks[3].y) && (landmarks[3].y < landmarks[2].y)
            const areOtherFingersCurled = (dWrist8 < dWrist5 * 1.1) && (dWrist12 < dWrist9 * 1.1) && (dWrist16 < dWrist13 * 1.1)
            const isThumbsUp = isThumbUp && areOtherFingersCurled && !isPeaceSign && !isPinching && !isFist

            if (isThumbsUp) {
              tracking.thumbsUpFrames = (tracking.thumbsUpFrames || 0) + 1
              if (tracking.thumbsUpFrames === 14 && Date.now() - tracking.lastThumbsUpTime > 3000) {
                sfx.playFanfare()
                confetti({
                  particleCount: 65,
                  spread: 75,
                  origin: { x: smoothX / window.innerWidth, y: smoothY / window.innerHeight },
                  colors: ['#38bdf8', '#facc15', '#10b981', '#ec4899']
                })
                setCurrentGestureBadge('👍 رائع يا أبطال! ✨')
                tracking.lastThumbsUpTime = Date.now()

                // Broadcast cheer reaction to live students
                if (propsRef.current.channel) {
                  propsRef.current.channel.send({
                    type: 'broadcast',
                    event: 'reaction',
                    payload: { emoji: '🌟', sender: 'المعلم (AR)' }
                  }).catch(() => {})
                }
              }
            } else {
              tracking.thumbsUpFrames = 0
            }

            // ── GESTURE 5: SWIPE (👋 Page Flip) ──
            const palmNormX = isMirrored ? (1 - wrist.x) : wrist.x
            const timeNow = Date.now()
            if (!isFist && !isPinching && !isPeaceSign && !isThumbsUp && tracking.prevPalmX !== null && timeNow - tracking.lastSwipeTime > 1100) {
              const deltaPalmX = palmNormX - tracking.prevPalmX
              if (deltaPalmX < -0.22) {
                triggerNextPage()
                tracking.lastSwipeTime = timeNow
              } else if (deltaPalmX > 0.22) {
                triggerPrevPage()
                tracking.lastSwipeTime = timeNow
              }
            }
            tracking.prevPalmX = palmNormX

            // ── FIST DRAGGING EXECUTION ──
            if (isFist) {
              setCurrentGestureBadge('✊ سحب وتحريك الشاشة')
              const palmX = isMirrored ? (1 - mcp9.x) : mcp9.x
              const palmY = mcp9.y
              if (tracking.prevFistX !== null && tracking.prevFistY !== null) {
                const deltaX = (palmX - tracking.prevFistX) * window.innerWidth * 1.4
                const deltaY = (palmY - tracking.prevFistY) * window.innerHeight * 1.4

                const activeCanvas = getActiveCanvas()
                if (activeCanvas && (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5)) {
                  const vpt = activeCanvas.viewportTransform
                  vpt[4] += deltaX
                  vpt[5] += deltaY
                  activeCanvas.setViewportTransform(vpt)
                  activeCanvas.requestRenderAll()
                  if (typeof window !== 'undefined' && typeof window.__syncBackgroundToViewport === 'function') {
                    window.__syncBackgroundToViewport(vpt)
                  }
                }
              }
              tracking.prevFistX = palmX
              tracking.prevFistY = palmY
            } else {
              if (tracking.prevFistX !== null) {
                if (typeof window !== 'undefined' && typeof window.__broadcastViewport === 'function') {
                  window.__broadcastViewport()
                }
              }
              tracking.prevFistX = null
              tracking.prevFistY = null
            }

            // ── PINCH / CLICK & DRAWING EXECUTION ──
            if (!isFist) {
              const targetEl = getCanvasTargetEl()
              const hitEl = document.elementFromPoint(smoothX, smoothY)
              const isOverCanvas = targetEl && (hitEl === targetEl || hitEl?.closest('.canvas-container'))
              const clickable = findClickableNearPoint(smoothX, smoothY, 26)

              if (isPinching && !prevPinch) {
                // PINCH DOWN
                if (clickable) {
                  const airToolAttr = clickable.getAttribute('data-air-tool')
                  if (airToolAttr) {
                    sfx.playDing()
                    executeToolAction(airToolAttr)
                  } else {
                    triggerCleanClick(clickable, smoothX, smoothY)
                  }
                } else if (isOverCanvas && gestureMode === 'draw') {
                  // Air Pen Drawing Down
                  sfx.playPop()
                  tracking.isDrawingOnCanvas = true
                  const activeCanvas = getActiveCanvas()
                  if (activeCanvas && activeCanvas.isDrawingMode) {
                    const pointer = activeCanvas.getPointer({ clientX: smoothX, clientY: smoothY })
                    if (activeCanvas.freeDrawingBrush) {
                      activeCanvas.freeDrawingBrush.onMouseDown(pointer, { e: { clientX: smoothX, clientY: smoothY } })
                    }
                  }
                } else if (hitEl) {
                  triggerCleanClick(hitEl, smoothX, smoothY)
                }
              } else if (isPinching && prevPinch) {
                // PINCH MOVE / DRAW
                if (tracking.isDrawingOnCanvas) {
                  const activeCanvas = getActiveCanvas()
                  if (activeCanvas && activeCanvas.isDrawingMode && activeCanvas.freeDrawingBrush) {
                    const pointer = activeCanvas.getPointer({ clientX: smoothX, clientY: smoothY })
                    activeCanvas.freeDrawingBrush.onMouseMove(pointer, { e: { clientX: smoothX, clientY: smoothY } })
                  }
                }
              } else if (!isPinching && prevPinch) {
                // PINCH UP
                if (tracking.isDrawingOnCanvas) {
                  const activeCanvas = getActiveCanvas()
                  if (activeCanvas && activeCanvas.isDrawingMode && activeCanvas.freeDrawingBrush) {
                    activeCanvas.freeDrawingBrush.onMouseUp({ e: { clientX: smoothX, clientY: smoothY } })
                  }
                  tracking.isDrawingOnCanvas = false
                }
              }

              // Update Gesture Status Text
              if (isPinching) {
                setCurrentGestureBadge(tracking.isDrawingOnCanvas ? '✍️ رسم وكتابة بالهواء' : '🤏 نقر زر')
              } else if (isPeaceSign) {
                setCurrentGestureBadge('✌️ تبديل الوضع')
              } else if (isThumbsUp) {
                setCurrentGestureBadge('👍 تشجيع الطلاب')
              } else {
                setCurrentGestureBadge(gestureMode === 'laser' ? '🔴 مؤشر ليزر هوائي' : '🖐️ مؤشر يد حر')
              }

              // Optional Dwell Auto-Click
              if (dwellClickEnabled && clickable && !isPinching) {
                if (tracking.hoveredElement !== clickable) {
                  tracking.hoveredElement = clickable
                  tracking.hoverStartTime = Date.now()
                  setHoverProgress(0)
                } else {
                  const elapsed = Date.now() - tracking.hoverStartTime
                  const prog = Math.min(100, Math.floor((elapsed / 750) * 100))
                  setHoverProgress(prog)
                  if (prog >= 100) {
                    triggerCleanClick(clickable, smoothX, smoothY)
                    tracking.hoverStartTime = Date.now() + 1200
                    setHoverProgress(0)
                  }
                }
              } else {
                tracking.hoveredElement = null
                setHoverProgress(0)
              }
            }

            // ── REALTIME BROADCAST TO LIVE STUDENTS ──
            const broadcastNow = Date.now()
            if (propsRef.current.channel && (broadcastNow - tracking.lastBroadcastTime > 34)) {
              tracking.lastBroadcastTime = broadcastNow
              propsRef.current.channel.send({
                type: 'broadcast',
                event: 'ar_pointer',
                payload: {
                  x: tracking.normX,
                  y: tracking.normY,
                  active: true,
                  mode: gestureMode,
                  color: propsRef.current.activeColor,
                  isPinching: tracking.isPinching,
                  isLaser: gestureMode === 'laser' || propsRef.current.activeTool === 'laser'
                }
              }).catch(() => {})
            }

          } else {
            lostFrames++
            if (lostFrames > 10) {
              tracking.handDetected = false
              tracking.landmarks = null
              tracking.isPinching = false
              tracking.isFist = false
              setHandStatus('searching')
              filterX.current.reset()
              filterY.current.reset()

              // Inform students pointer left
              if (propsRef.current.channel && Date.now() - tracking.lastBroadcastTime > 100) {
                propsRef.current.lastBroadcastTime = Date.now()
                propsRef.current.channel.send({
                  type: 'broadcast',
                  event: 'ar_pointer',
                  payload: { active: false }
                }).catch(() => {})
              }
            }
          }
        })

        // Non-blocking asynchronous inference loop
        const processLoop = async () => {
          while (isMounted) {
            const video = videoRef.current
            if (
              !isProcessingFrame &&
              video &&
              video.readyState >= 2 &&
              video.videoWidth > 0 &&
              !video.paused &&
              !video.ended &&
              handsInstance
            ) {
              isProcessingFrame = true
              try {
                await handsInstance.send({ image: video })
              } catch (e) {
                isProcessingFrame = false
              }
            }
            await new Promise(r => setTimeout(r, 16)) // ~60fps poll
          }
        }

        processLoop()
        setIsReady(true)
      } catch (err) {
        console.warn('MediaPipe error:', err)
        setErrorMsg('تعذر تحميل خوارزميات تتبع اليد تلقائياً.')
      }
    }

    initMediaPipe()

    return () => {
      isMounted = false
      if (handsInstance && handsInstance.close) {
        try { handsInstance.close() } catch (e) {}
      }
    }
  }, [isMirrored, sensitivity, gestureMode, dwellClickEnabled])

  // ── 8. 60-120 FPS Visual Render Loop for AR Overlay and PiP ──
  useEffect(() => {
    let animId = null
    const overlay = overlayCanvasRef.current
    const pipCanvas = pipCanvasRef.current
    if (!overlay) return

    const overlayCtx = overlay.getContext('2d')
    const pipCtx = pipCanvas ? pipCanvas.getContext('2d') : null

    const render = () => {
      const tracking = trackingRef.current
      const w = overlay.width
      const h = overlay.height

      overlayCtx.clearRect(0, 0, w, h)

      // 1. Draw Mid-Air Cursor & Stardust Trail
      if (tracking.handDetected) {
        const cx = tracking.cursorX
        const cy = tracking.cursorY
        const isPinching = tracking.isPinching
        const isLaser = gestureMode === 'laser'
        const glowColor = isLaser ? '#ef4444' : (propsRef.current.activeColor || '#06b6d4')

        // Add Stardust Particle
        tracking.particles.push({
          x: cx + (Math.random() - 0.5) * 6,
          y: cy + (Math.random() - 0.5) * 6,
          radius: Math.random() * 3 + 1,
          color: glowColor,
          alpha: 0.8,
          life: 1.0
        })

        // Render and Decay Particles
        overlayCtx.save()
        for (let i = tracking.particles.length - 1; i >= 0; i--) {
          const p = tracking.particles[i]
          p.life -= 0.05
          p.alpha = Math.max(0, p.life)
          if (p.life <= 0) {
            tracking.particles.splice(i, 1)
            continue
          }
          overlayCtx.beginPath()
          overlayCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          overlayCtx.fillStyle = p.color
          overlayCtx.globalAlpha = p.alpha * 0.6
          overlayCtx.fill()
        }
        overlayCtx.restore()

        overlayCtx.save()

        if (tracking.isFist) {
          // Fist Drag Reticle ✊
          overlayCtx.beginPath()
          overlayCtx.arc(cx, cy, 26, 0, Math.PI * 2)
          overlayCtx.fillStyle = 'rgba(234, 179, 8, 0.25)'
          overlayCtx.fill()
          overlayCtx.lineWidth = 3
          overlayCtx.strokeStyle = '#eab308'
          overlayCtx.stroke()

          const ringR = 34 + Math.sin(Date.now() * 0.01) * 4
          overlayCtx.beginPath()
          overlayCtx.arc(cx, cy, ringR, 0, Math.PI * 2)
          overlayCtx.strokeStyle = 'rgba(234, 179, 8, 0.6)'
          overlayCtx.lineWidth = 2
          overlayCtx.setLineDash([5, 5])
          overlayCtx.stroke()
        } else if (isPinching) {
          // Pinch Touch Ripple & Pen Dot 🤏
          overlayCtx.beginPath()
          overlayCtx.arc(cx, cy, 14, 0, Math.PI * 2)
          overlayCtx.fillStyle = glowColor
          overlayCtx.fill()
          overlayCtx.lineWidth = 3
          overlayCtx.strokeStyle = '#ffffff'
          overlayCtx.stroke()

          overlayCtx.beginPath()
          overlayCtx.arc(cx, cy, 24, 0, Math.PI * 2)
          overlayCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
          overlayCtx.lineWidth = 2
          overlayCtx.stroke()
        } else {
          // Hover Cyber Laser Dot 🔴
          overlayCtx.beginPath()
          overlayCtx.arc(cx, cy, isLaser ? 11 : 9, 0, Math.PI * 2)
          overlayCtx.fillStyle = glowColor
          overlayCtx.shadowColor = glowColor
          overlayCtx.shadowBlur = 18
          overlayCtx.fill()

          overlayCtx.beginPath()
          overlayCtx.arc(cx, cy, 3.5, 0, Math.PI * 2)
          overlayCtx.fillStyle = '#ffffff'
          overlayCtx.fill()

          const haloR = 16 + Math.sin(Date.now() * 0.008) * 3
          overlayCtx.beginPath()
          overlayCtx.arc(cx, cy, haloR, 0, Math.PI * 2)
          overlayCtx.strokeStyle = glowColor
          overlayCtx.lineWidth = 1.5
          overlayCtx.setLineDash([4, 4])
          overlayCtx.stroke()

          // Dwell Progress Ring if hovering
          if (hoverProgress > 0) {
            const startAngle = -Math.PI / 2
            const endAngle = startAngle + (Math.PI * 2 * (hoverProgress / 100))
            overlayCtx.beginPath()
            overlayCtx.arc(cx, cy, 26, startAngle, endAngle)
            overlayCtx.strokeStyle = '#10b981'
            overlayCtx.lineWidth = 4
            overlayCtx.setLineDash([])
            overlayCtx.stroke()
          }
        }

        // Click Ripple Feedback
        if (tracking.lastClickTime && (Date.now() - tracking.lastClickTime < 380)) {
          const clickAge = Date.now() - tracking.lastClickTime
          const clickR = 10 + (clickAge / 380) * 34
          const clickAlpha = 1 - (clickAge / 380)
          overlayCtx.beginPath()
          overlayCtx.arc(tracking.lastClickX, tracking.lastClickY, clickR, 0, Math.PI * 2)
          overlayCtx.strokeStyle = `rgba(56, 189, 248, ${clickAlpha})`
          overlayCtx.lineWidth = 3
          overlayCtx.setLineDash([])
          overlayCtx.stroke()
        }

        overlayCtx.restore()
      }

      // 2. Local PiP Hand Skeleton
      if (pipCtx && pipCanvas && showSkeleton && tracking.handDetected && tracking.landmarks) {
        const pw = pipCanvas.width
        const ph = pipCanvas.height
        pipCtx.clearRect(0, 0, pw, ph)

        pipCtx.save()
        pipCtx.strokeStyle = 'rgba(6, 182, 212, 0.85)'
        pipCtx.lineWidth = 2.5
        pipCtx.shadowColor = '#06b6d4'
        pipCtx.shadowBlur = 6

        const mapPt = (pt) => ({
          x: isMirrored ? (1 - pt.x) * pw : pt.x * pw,
          y: pt.y * ph
        })

        HAND_CONNECTIONS.forEach(([i, j]) => {
          const p1 = mapPt(tracking.landmarks[i])
          const p2 = mapPt(tracking.landmarks[j])
          pipCtx.beginPath()
          pipCtx.moveTo(p1.x, p1.y)
          pipCtx.lineTo(p2.x, p2.y)
          pipCtx.stroke()
        })

        tracking.landmarks.forEach((pt, idx) => {
          const p = mapPt(pt)
          pipCtx.beginPath()
          pipCtx.arc(p.x, p.y, idx === 8 || idx === 4 ? 5 : 3, 0, Math.PI * 2)
          pipCtx.fillStyle = idx === 8 ? '#facc15' : idx === 4 ? '#ec4899' : '#22d3ee'
          pipCtx.fill()
        })

        pipCtx.restore()
      } else if (pipCtx && pipCanvas && !tracking.handDetected) {
        pipCtx.clearRect(0, 0, pipCanvas.width, pipCanvas.height)
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [gestureMode, isMirrored, showSkeleton, hoverProgress])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        overflow: 'hidden'
      }}
    >
      {/* Hidden Video for Hand Tracking */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none'
        }}
      />

      {/* AR Fullscreen Overlay Canvas */}
      <canvas
        ref={overlayCanvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none'
        }}
      />

      {/* ── TOP SCI-FI HUD PILL ── */}
      <div
        id="ar-hud-pill"
        style={{
          position: 'fixed',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100000,
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(139, 92, 246, 0.45)',
          borderRadius: '30px',
          padding: '6px 14px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          color: '#f8fafc',
          fontSize: '0.78rem',
          fontWeight: 700
        }}
      >
        {/* Status Dot */}
        <span
          style={{
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            background: handStatus === 'detected' ? '#10b981' : '#f59e0b',
            boxShadow: handStatus === 'detected' ? '0 0 10px #10b981' : 'none',
            display: 'inline-block'
          }}
        />

        {/* Dynamic Live Gesture Recognition Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(139, 92, 246, 0.25)',
            border: '1px solid rgba(167, 139, 250, 0.35)',
            padding: '2px 9px',
            borderRadius: '12px',
            color: '#e9d5ff',
            fontSize: '0.75rem',
            fontWeight: 800
          }}
        >
          <span>{handStatus === 'detected' ? currentGestureBadge : 'ضع يدك أمام الكاميرا... ⏳'}</span>
        </div>

        <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)' }} />

        {/* Toggle Laser / Draw Mode */}
        <button
          onClick={() => {
            sfx.playModeSwitch()
            setGestureMode(m => (m === 'laser' ? 'draw' : 'laser'))
          }}
          title="التبديل بين مؤشر الليزر وقلم الرسم الهوائي (أو ارفع إشارة النصر ✌️)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: gestureMode === 'draw' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.25)',
            border: `1px solid ${gestureMode === 'draw' ? '#34d399' : '#f87171'}`,
            borderRadius: '16px',
            color: gestureMode === 'draw' ? '#6ee7b7' : '#fca5a5',
            padding: '3px 9px',
            fontSize: '0.72rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          {gestureMode === 'draw' ? <Pen size={12} /> : <Crosshair size={12} />}
          <span>{gestureMode === 'draw' ? 'قلم هوائي ✍️' : 'ليزر أحمر 🔴'}</span>
        </button>

        {/* Toggle Air Tools Palette */}
        <button
          onClick={() => setShowAirPalette(p => !p)}
          title={showAirPalette ? 'إخفاء أدوات الرسم' : 'إظهار أدوات الرسم الهوائية'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: showAirPalette ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${showAirPalette ? '#a78bfa' : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: '16px',
            color: showAirPalette ? '#c4b5fd' : '#cbd5e1',
            padding: '3px 9px',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <Palette size={12} />
          <span>الأدوات</span>
        </button>

        {/* Toggle Camera Preview */}
        <button
          onClick={() => setShowPip(p => !p)}
          title={showPip ? 'إخفاء معاينة الكاميرا واليد' : 'إظهار معاينة الكاميرا واليد'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: showPip ? 'rgba(6, 182, 212, 0.35)' : 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${showPip ? '#22d3ee' : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: '16px',
            color: showPip ? '#67e8f9' : '#cbd5e1',
            padding: '3px 9px',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          {showPip ? <EyeOff size={12} /> : <Eye size={12} />}
          <span>معاينة اليد</span>
        </button>

        {/* Toggle Dwell Click */}
        <button
          onClick={() => setDwellClickEnabled(p => !p)}
          title={dwellClickEnabled ? 'تعطيل النقر التلقائي عند التوقف' : 'تفعيل النقر التلقائي عند التوقف على الأزرار'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: dwellClickEnabled ? 'rgba(234, 179, 8, 0.3)' : 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${dwellClickEnabled ? '#fde047' : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: '16px',
            color: dwellClickEnabled ? '#fef08a' : '#94a3b8',
            padding: '3px 9px',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <span>{dwellClickEnabled ? 'نقر بالوقوف ⏱️' : 'نقر بالقرص 🤏'}</span>
        </button>

        {/* Sensitivity Toggle */}
        <button
          onClick={() => setShowSettings(s => !s)}
          title="ضبط حساسية التتبع"
          style={{
            background: showSettings ? 'rgba(139, 92, 246, 0.35)' : 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            color: '#cbd5e1',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Sliders size={12} />
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          title="إغلاق وضع الواقع المعزز"
          style={{
            background: 'rgba(239, 68, 68, 0.25)',
            border: 'none',
            borderRadius: '50%',
            color: '#ef4444',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginLeft: '4px'
          }}
        >
          <X size={13} />
        </button>
      </div>

      {/* ── SENSITIVITY POPOVER ── */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100001,
            pointerEvents: 'auto',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '12px 18px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            color: '#f8fafc',
            fontSize: '0.75rem',
            width: '220px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
            <span>حساسية نطاق اليد:</span>
            <span style={{ color: '#38bdf8' }}>{Math.round(sensitivity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.5"
            step="0.05"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8' }}>
            <span>دقيق وهادئ</span>
            <span>سريع وشامل</span>
          </div>
        </div>
      )}

      {/* ── FLOATING AIR TOOL PALETTE ── */}
      {showAirPalette && (
        <div
          id="ar-palette"
          style={{
            position: 'fixed',
            top: '110px',
            right: '16px',
            zIndex: 100000,
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '10px 8px',
            boxShadow: '0 12px 35px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ fontSize: '0.66rem', color: '#a78bfa', fontWeight: 800, marginBottom: '2px' }}>
            أدوات AR 🖐️
          </div>

          {/* Select Tool */}
          <button
            data-air-tool="tool_select"
            onClick={() => setActiveTool('select')}
            title="تحديد وتحريك العناصر (Select)"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              border: 'none',
              background: activeTool === 'select' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <MousePointer2 size={18} />
          </button>

          {/* Pan Tool */}
          <button
            data-air-tool="tool_pan"
            onClick={() => setActiveTool('pan')}
            title="سحب الشاشة والسبورة (Pan)"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              border: 'none',
              background: activeTool === 'pan' ? '#eab308' : 'rgba(255, 255, 255, 0.08)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Hand size={18} />
          </button>

          <div style={{ width: '28px', height: '1px', background: 'rgba(255,255,255,0.15)', margin: '2px 0' }} />

          {/* Pen Tool */}
          <button
            data-air-tool="tool_pen"
            onClick={() => { setActiveTool('pen'); setGestureMode('draw'); }}
            title="قلم عادي"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              border: 'none',
              background: activeTool === 'pen' && gestureMode === 'draw' ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Pen size={18} />
          </button>

          {/* Highlighter */}
          <button
            data-air-tool="tool_highlighter"
            onClick={() => { setActiveTool('highlighter'); setGestureMode('draw'); }}
            title="قلم تظليل فسفوري"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              border: 'none',
              background: activeTool === 'highlighter' ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Highlighter size={18} />
          </button>

          {/* Eraser */}
          <button
            data-air-tool="tool_eraser"
            onClick={() => setActiveTool('eraser')}
            title="ممحاة"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              border: 'none',
              background: activeTool === 'eraser' ? '#ec4899' : 'rgba(255, 255, 255, 0.08)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Eraser size={18} />
          </button>

          {/* Laser Pointer */}
          <button
            data-air-tool="tool_laser"
            onClick={() => { setActiveTool('laser'); setGestureMode('laser'); }}
            title="مؤشر ليزر هوائي"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              border: 'none',
              background: gestureMode === 'laser' ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Crosshair size={18} />
          </button>

          <div style={{ width: '28px', height: '1px', background: 'rgba(255,255,255,0.15)', margin: '4px 0' }} />

          {/* Color Palette */}
          {QUICK_COLORS.map(c => (
            <button
              key={c.hex}
              data-air-tool={`color_${c.hex}`}
              onClick={() => { setActiveColor(c.hex); if (activeTool === 'eraser') setActiveTool('pen'); }}
              title={`لون ${c.name}`}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                border: activeColor === c.hex ? '3px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.3)',
                background: c.hex,
                cursor: 'pointer',
                boxShadow: activeColor === c.hex ? `0 0 10px ${c.hex}` : 'none'
              }}
            />
          ))}

          <div style={{ width: '28px', height: '1px', background: 'rgba(255,255,255,0.15)', margin: '4px 0' }} />

          {/* Undo */}
          <button
            data-air-tool="action_undo"
            onClick={undo}
            title="تراجع"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Undo2 size={16} />
          </button>

          {/* Clear */}
          <button
            data-air-tool="action_clear"
            onClick={clearBoard}
            title="مسح السبورة"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={16} />
          </button>

          <div style={{ width: '28px', height: '1px', background: 'rgba(255,255,255,0.15)', margin: '4px 0' }} />

          {/* Page Flipping */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              data-air-tool="action_prev"
              onClick={triggerPrevPage}
              title="الصفحة السابقة"
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={14} />
            </button>
            <button
              data-air-tool="action_next"
              onClick={triggerNextPage}
              title="الصفحة التالية"
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── LOCAL PiP CAMERA PREVIEW ── */}
      {showPip && (
        <div
          id="ar-pip-window"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 100000,
            pointerEvents: 'auto',
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(139, 92, 246, 0.4)',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: '0 12px 35px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            width: isPipMinimized ? '160px' : '210px'
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '6px 10px',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 800, color: '#c4b5fd' }}>
              <span>🖐️ يدك بالكاميرا</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setShowSkeleton(p => !p)}
                title={showSkeleton ? 'إخفاء شبكة المفاصل' : 'إظهار شبكة المفاصل'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: showSkeleton ? '#22d3ee' : '#64748b',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                {showSkeleton ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>

              <button
                onClick={() => setIsPipMinimized(p => !p)}
                title={isPipMinimized ? 'تكبير المعاينة' : 'تصغير المعاينة'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                {isPipMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              </button>
            </div>
          </div>

          {!isPipMinimized && (
            <div
              style={{
                position: 'relative',
                width: '210px',
                height: '150px',
                background: '#090d16',
                overflow: 'hidden'
              }}
            >
              <video
                ref={(el) => {
                  if (el && videoRef.current && videoRef.current.srcObject) {
                    el.srcObject = videoRef.current.srcObject
                  }
                }}
                autoPlay
                playsInline
                muted
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: isMirrored ? 'scaleX(-1)' : 'none'
                }}
              />

              <canvas
                ref={pipCanvasRef}
                width={210}
                height={150}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none'
                }}
              />

              {/* Guidance Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  left: '4px',
                  right: '4px',
                  background: 'rgba(0,0,0,0.65)',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  fontSize: '0.62rem',
                  color: '#38bdf8',
                  textAlign: 'center',
                  fontWeight: 700
                }}
              >
                ✌️ نصر للتبديل | 🤏 قرص للنقر | ✊ سحب
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
