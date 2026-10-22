'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Mic, MicOff, Play, Pause, Square, Download, Trash2,
  RefreshCw, Volume2, Radio, CheckCircle2, Sliders, AlertCircle,
  FileAudio, Clock, Sparkles, X, ChevronDown
} from 'lucide-react'
import styles from './AudioRecorderTab.module.css'

export default function AudioRecorderTab() {
  // Device & permission state
  const [devices, setDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [permissionError, setPermissionError] = useState('')
  const [isScanning, setIsScanning] = useState(false)

  // Testing & level meter state
  const [isTestingMic, setIsTestingMic] = useState(false)
  const [liveVolume, setLiveVolume] = useState(0)

  // Recording engine state
  const [recordingState, setRecordingState] = useState('idle') // 'idle' | 'recording' | 'paused'
  const [timer, setTimer] = useState(0)
  const [recordings, setRecordings] = useState([])

  // Audio quality settings
  const [echoCancellation, setEchoCancellation] = useState(true)
  const [noiseSuppression, setNoiseSuppression] = useState(true)
  const [autoGainControl, setAutoGainControl] = useState(true)
  const [qualityBitrate, setQualityBitrate] = useState('128') // 192, 128, 64

  // Refs
  const mediaStreamRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animFrameRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerIntervalRef = useRef(null)
  const timerCountRef = useRef(0)
  const canvasRef = useRef(null)

  // 1. Initial scan for audio devices
  useEffect(() => {
    fetchAudioDevices(false)

    // Listen for USB or Bluetooth mic plug/unplug
    if (navigator?.mediaDevices?.addEventListener) {
      const handleDeviceChange = () => fetchAudioDevices(false)
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStreams()
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [])

  // 2. Fetch Audio Input Devices
  const fetchAudioDevices = async (requestPermission = false) => {
    setIsScanning(true)
    setPermissionError('')
    try {
      if (!navigator?.mediaDevices?.enumerateDevices) {
        setPermissionError('متصفحك الحالي لا يدعم اكتشاف أجهزة الصوت.')
        setIsScanning(false)
        return
      }

      if (requestPermission) {
        try {
          const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          tempStream.getTracks().forEach(t => t.stop())
          setPermissionGranted(true)
        } catch (permErr) {
          console.warn('Microphone permission prompt:', permErr)
          setPermissionError('يرجى السماح بصلاحية الميكروفون من إعدادات المتصفح.')
          setIsScanning(false)
          return
        }
      }

      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = allDevices.filter(d => d.kind === 'audioinput')

      const hasLabels = audioInputs.some(d => d.label && d.label.trim().length > 0)
      if (hasLabels) {
        setPermissionGranted(true)
      }

      setDevices(audioInputs)

      // Restore saved preferred microphone from localStorage
      const savedMic = typeof window !== 'undefined' ? localStorage.getItem('admin_preferred_mic_id') : null
      if (savedMic && audioInputs.some(d => d.deviceId === savedMic)) {
        setSelectedDeviceId(savedMic)
      } else if (audioInputs.length > 0) {
        setSelectedDeviceId(prev => (prev && audioInputs.some(d => d.deviceId === prev)) ? prev : audioInputs[0].deviceId)
      }
    } catch (err) {
      console.error('Error fetching audio devices:', err)
      setPermissionError(err.message || 'حدث خطأ أثناء فحص الميكروفونات.')
    } finally {
      setIsScanning(false)
    }
  }

  // Handle Device Selection change
  const handleDeviceChange = (e) => {
    const newId = e.target.value
    setSelectedDeviceId(newId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_preferred_mic_id', newId)
    }

    // If we were testing, switch mic test to the newly chosen device
    if (isTestingMic) {
      startMicTest(newId)
    }
  }

  // 3. Audio Meter & Waveform Visualizer
  const setupAudioMeter = (stream) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) return

      const ctx = new AudioContextClass()
      audioContextRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateMeter = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)

        // Calculate average volume
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const avg = sum / dataArray.length
        const volumePercent = Math.min(100, Math.round((avg / 128) * 100))
        setLiveVolume(volumePercent)

        // Draw waveform on canvas if present
        drawCanvasWave(dataArray)

        animFrameRef.current = requestAnimationFrame(updateMeter)
      }

      updateMeter()
    } catch (err) {
      console.error('Audio meter setup error:', err)
    }
  }

  // Draw smooth voice waveform on canvas
  const drawCanvasWave = (dataArray) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height)
    bgGrad.addColorStop(0, '#f8fafc')
    bgGrad.addColorStop(1, '#f1f5f9')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, width, height)

    // Wave line
    ctx.lineWidth = 3
    ctx.strokeStyle = recordingState === 'recording' ? '#ef4444' : '#10b981'
    ctx.beginPath()

    const sliceWidth = width / dataArray.length
    let x = 0

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0
      const y = (v * height) / 2

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      x += sliceWidth
    }

    ctx.lineTo(width, height / 2)
    ctx.stroke()
  }

  // 4. Test Microphone Live (Before Recording)
  const toggleMicTest = async () => {
    if (isTestingMic) {
      stopMicTest()
    } else {
      await startMicTest(selectedDeviceId)
    }
  }

  const startMicTest = async (deviceIdToUse) => {
    stopMicTest()
    try {
      const constraints = {
        audio: {
          deviceId: deviceIdToUse && deviceIdToUse !== 'default' ? { exact: deviceIdToUse } : undefined,
          echoCancellation,
          noiseSuppression,
          autoGainControl,
        }
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      mediaStreamRef.current = stream
      setPermissionGranted(true)
      setIsTestingMic(true)
      setupAudioMeter(stream)
    } catch (err) {
      console.error('Error starting mic test:', err)
      alert('تعذر فتح الميكروفون المختار: ' + (err.message || 'يرجى مراجعة الصلاحيات'))
    }
  }

  const stopMicTest = () => {
    cleanupStreams()
    setIsTestingMic(false)
    setLiveVolume(0)
  }

  // Cleanup active audio streams and audio contexts
  const cleanupStreams = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close()
      } catch (e) {}
      audioContextRef.current = null
    }
    analyserRef.current = null
  }

  // 5. Start Recording
  const handleStartRecording = async () => {
    try {
      // Stop mic testing if it was on
      stopMicTest()

      const constraints = {
        audio: {
          deviceId: selectedDeviceId && selectedDeviceId !== 'default' ? { exact: selectedDeviceId } : undefined,
          echoCancellation,
          noiseSuppression,
          autoGainControl,
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      mediaStreamRef.current = stream
      setPermissionGranted(true)

      // Start audio meter & waveform
      setupAudioMeter(stream)

      // Select supported audio MIME type
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : MediaRecorder.isTypeSupported('audio/ogg')
          ? 'audio/ogg'
          : ''
      }

      const bps = qualityBitrate === '192' ? 192000 : qualityBitrate === '128' ? 128000 : 64000
      const options = mimeType ? { mimeType, audioBitsPerSecond: bps } : {}
      const recorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const finalMime = mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: finalMime })
        const url = URL.createObjectURL(blob)

        const ext = finalMime.includes('mp4') ? 'mp4' : finalMime.includes('ogg') ? 'ogg' : 'mp3'
        const now = new Date()
        const dateStr = now.toLocaleDateString('ar-EG', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
        const timeFormatted = formatDuration(timerCountRef.current)
        const defaultTitle = `تسجيل_صوتي_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}`

        const currentMicLabel = devices.find(d => d.deviceId === selectedDeviceId)?.label || 'الميكروفون المختار'

        const newRecording = {
          id: Date.now(),
          title: defaultTitle,
          url,
          blob,
          duration: timeFormatted,
          size: `${(blob.size / (1024 * 1024)).toFixed(2)} MB`,
          date: dateStr,
          micLabel: currentMicLabel,
          ext
        }

        setRecordings(prev => [newRecording, ...prev])
        cleanupStreams()
        setLiveVolume(0)
      }

      recorder.start(250) // slice chunks every 250ms
      setRecordingState('recording')
      setTimer(0)
      timerCountRef.current = 0

      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          timerCountRef.current = prev + 1
          return prev + 1
        })
      }, 1000)

    } catch (err) {
      console.error('Error starting recording:', err)
      alert('تعذر بدء التسجيل: ' + (err.message || 'يرجى مراجعة صلاحيات الميكروفون'))
    }
  }

  // 6. Pause / Resume Recording
  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause()
      setRecordingState('paused')
      clearInterval(timerIntervalRef.current)
    }
  }

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume()
      setRecordingState('recording')
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          timerCountRef.current = prev + 1
          return prev + 1
        })
      }, 1000)
    }
  }

  // 7. Stop & Save Recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recordingState !== 'idle') {
      mediaRecorderRef.current.stop()
      setRecordingState('idle')
      clearInterval(timerIntervalRef.current)
    }
  }

  // 8. Cancel Recording
  const handleCancelRecording = () => {
    if (confirm('هل أنت متأكد من إلغاء التسجيل وحذفه؟')) {
      if (mediaRecorderRef.current && recordingState !== 'idle') {
        mediaRecorderRef.current.ondataavailable = null
        mediaRecorderRef.current.onstop = null
        mediaRecorderRef.current.stop()
        cleanupStreams()
        setRecordingState('idle')
        clearInterval(timerIntervalRef.current)
        setTimer(0)
        setLiveVolume(0)
      }
    }
  }

  // 9. Download Recording File
  const handleDownload = (rec) => {
    const a = document.createElement('a')
    a.href = rec.url
    let filename = (rec.title || 'تسجيل_صوتي').trim()
    if (!filename.endsWith(`.${rec.ext}`)) {
      filename += `.${rec.ext}`
    }
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // 10. Delete Recording from session
  const handleDeleteRecording = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا التسجيل؟')) {
      setRecordings(prev => prev.filter(r => r.id !== id))
    }
  }

  // Update recording title inline
  const handleTitleChange = (id, newTitle) => {
    setRecordings(prev => prev.map(r => r.id === id ? { ...r, title: newTitle } : r))
  }

  // Helper format seconds to HH:MM:SS
  const formatDuration = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const selectedDeviceName = devices.find(d => d.deviceId === selectedDeviceId)?.label || 'الميكروفون الافتراضي'

  return (
    <div className={styles.container}>

      {/* ─── HEADER BANNER ─── */}
      <div className={styles.headerCard}>
        <div className={styles.headerInfo}>
          <h2>
            <Mic size={28} />
            استوديو ومسجل الصوت الاحترافي 🎙️
          </h2>
          <p>
            اختر بنفسك الميكروفون المستخدم في التسجيل (USB، سماعة رأس، ميكروفون خارجي) بدون أن يختار اللاب توب عشوائياً.
          </p>
        </div>
        <div className={styles.headerBadges}>
          <span className={styles.badgePill}>
            <Radio size={14} />
            تحكم كامل بجهاز الإدخال
          </span>
          <span className={styles.badgePill}>
            <Sparkles size={14} />
            عزل الضوضاء والصدى AI
          </span>
          <span className={styles.badgePill}>
            <Download size={14} />
            تحميل فوري بجودة عالية
          </span>
        </div>
      </div>

      {/* ─── MICROPHONE DEVICE SELECTOR CARD ─── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>
              <Sliders size={20} color="#059669" />
              اختيار الميكروفون وجهاز التسجيل الصوتي
            </h3>
            <p className={styles.cardSubtitle}>
              حدد بدقة أي ميكروفون تريد استخدامه من الأجهزة المتصلة بجهازك (لاب توب / مايك خارجي / سماعات).
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.84rem', color: '#059669', fontWeight: 'bold' }}>
              الميكروفون النشط: <strong>{selectedDeviceName}</strong>
            </span>
          </div>
        </div>

        {permissionError && (
          <div style={{
            background: '#fef2f2',
            border: '1.5px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '16px',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{permissionError}</span>
            </div>
            <button
              onClick={() => fetchAudioDevices(true)}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              منح الإذن الآن
            </button>
          </div>
        )}

        <div className={styles.micSelectWrapper}>
          <div className={styles.selectGroup}>
            <select
              className={styles.micSelect}
              value={selectedDeviceId}
              onChange={handleDeviceChange}
              disabled={recordingState !== 'idle'}
            >
              {devices.length === 0 ? (
                <option value="">
                  {permissionGranted ? 'لم يتم العثور على ميكروفونات' : 'اضغط تحديث لاكتشاف الميكروفونات المتصلة'}
                </option>
              ) : (
                devices.map((device, index) => (
                  <option key={device.deviceId || index} value={device.deviceId}>
                    🎤 {device.label || `ميكروفون إدخال #${index + 1}`} {device.deviceId === 'default' ? '(الافتراضي)' : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Test Mic Button */}
          <button
            type="button"
            className={`${styles.micActionBtn} ${isTestingMic ? styles.btnTestingActive : styles.btnTestMic}`}
            onClick={toggleMicTest}
            disabled={recordingState !== 'idle'}
            title="تحدث لتتأكد من عمل الميكروفون المختار"
          >
            <Volume2 size={18} />
            <span>{isTestingMic ? 'إيقاف فحص الصوت ⏹️' : 'فحص واختبار الصوت 🎙️'}</span>
          </button>

          {/* Refresh Devices Button */}
          <button
            type="button"
            className={`${styles.micActionBtn} ${styles.btnRefresh}`}
            onClick={() => fetchAudioDevices(true)}
            disabled={isScanning || recordingState !== 'idle'}
            title="إعادة فحص الأجهزة المتصلة مثل USB أو سماعات البلوتوث"
          >
            <RefreshCw size={17} className={isScanning ? 'animate-spin' : ''} />
            <span>تحديث الميكروفونات</span>
          </button>
        </div>

        {/* Live Audio Level Meter */}
        <div className={styles.meterContainer}>
          <div className={styles.meterHeader}>
            <span>مستوى التقاط الصوت اللحظي (VU Meter):</span>
            <span style={{
              color: liveVolume > 85 ? '#ef4444' : liveVolume > 50 ? '#10b981' : '#64748b'
            }}>
              {liveVolume}% {liveVolume > 85 ? '⚠️ مرتفع جداً' : liveVolume > 15 ? '✓ ممتاز ونقي' : 'هادئ'}
            </span>
          </div>

          <div className={styles.meterBarBg}>
            <div
              className={styles.meterBarFill}
              style={{ width: `${liveVolume}%` }}
            />
          </div>

          <div className={styles.meterHints}>
            <span>0 dB (صامت)</span>
            <span>-12 dB (مستوى مثالي)</span>
            <span>0 dB Peak (ذروة)</span>
          </div>
        </div>
      </div>

      {/* ─── RECORDING STUDIO CONSOLE ─── */}
      <div className={`${styles.studioConsole} ${recordingState === 'recording' ? styles.recordingActiveBg : ''}`}>

        {/* State Badge */}
        <div className={`${styles.statusIndicator} ${
          recordingState === 'recording' ? styles.statusRecording :
          recordingState === 'paused' ? styles.statusPaused : styles.statusIdle
        }`}>
          {recordingState === 'recording' && <span className={styles.pulsingDot} />}
          {recordingState === 'recording' ? 'جاري التسجيل الصوتي الآن...' :
           recordingState === 'paused' ? 'التسجيل متوقف مؤقتاً ⏸️' :
           'الاستوديو جاهز لبدء التسجيل 🎙️'}
        </div>

        {/* Giant Timer */}
        <div className={`${styles.timerDisplay} ${recordingState === 'recording' ? styles.timerRecording : ''}`}>
          {formatDuration(timer)}
        </div>

        {/* Visualizer Canvas */}
        <canvas
          ref={canvasRef}
          className={styles.waveformCanvas}
          width={600}
          height={80}
        />

        {/* Action Controls */}
        <div className={styles.controlsRow}>
          {recordingState === 'idle' ? (
            <button
              type="button"
              className={`${styles.recordMainBtn} ${styles.btnStartRecord}`}
              onClick={handleStartRecording}
            >
              <Mic size={24} />
              <span>بدء التسجيل الآن</span>
            </button>
          ) : (
            <>
              {/* Stop & Save */}
              <button
                type="button"
                className={`${styles.recordMainBtn} ${styles.btnStopRecord}`}
                onClick={handleStopRecording}
              >
                <Square size={20} />
                <span>إنهاء وحفظ التسجيل 💾</span>
              </button>

              {/* Pause / Resume */}
              {recordingState === 'recording' ? (
                <button
                  type="button"
                  className={styles.btnSecondaryControl}
                  onClick={handlePauseRecording}
                >
                  <Pause size={18} />
                  <span>إيقاف مؤقت</span>
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.btnSecondaryControl}
                  onClick={handleResumeRecording}
                >
                  <Play size={18} />
                  <span>استئناف</span>
                </button>
              )}

              {/* Cancel & Discard */}
              <button
                type="button"
                className={`${styles.btnSecondaryControl} ${styles.btnCancelRecord}`}
                onClick={handleCancelRecording}
              >
                <X size={18} />
                <span>إلغاء</span>
              </button>
            </>
          )}
        </div>

      </div>

      {/* ─── AUDIO QUALITY & ENHANCEMENT SETTINGS ─── */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          <Sparkles size={20} color="#059669" />
          إعدادات معالجة ونقاء الصوت (DSP)
        </h3>
        <p className={styles.cardSubtitle}>
          خيارات مدمجة بالذكاء الاصطناعي لعزل الضوضاء وتحسين التقاط صوتك عبر اللاب توب.
        </p>

        <div className={styles.settingsGrid}>
          {/* Echo Cancellation */}
          <div
            className={styles.toggleItem}
            onClick={() => setEchoCancellation(!echoCancellation)}
          >
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>إلغاء الصدى المحيطي</span>
              <span className={styles.toggleDesc}>منع تكرار صدى الغرفة واللاب توب</span>
            </div>
            <div className={`${styles.toggleSwitch} ${echoCancellation ? styles.toggleActive : ''}`}>
              <div className={styles.toggleKnob} />
            </div>
          </div>

          {/* Noise Suppression */}
          <div
            className={styles.toggleItem}
            onClick={() => setNoiseSuppression(!noiseSuppression)}
          >
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>عزل الضوضاء (Noise Filter)</span>
              <span className={styles.toggleDesc}>حجب صوت المروحة والتشويش الخارجي</span>
            </div>
            <div className={`${styles.toggleSwitch} ${noiseSuppression ? styles.toggleActive : ''}`}>
              <div className={styles.toggleKnob} />
            </div>
          </div>

          {/* Auto Gain Control */}
          <div
            className={styles.toggleItem}
            onClick={() => setAutoGainControl(!autoGainControl)}
          >
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>موازنة الصوت التلقائية (AGC)</span>
              <span className={styles.toggleDesc}>موازنة نبرات الصوت الهادئة والعالية</span>
            </div>
            <div className={`${styles.toggleSwitch} ${autoGainControl ? styles.toggleActive : ''}`}>
              <div className={styles.toggleKnob} />
            </div>
          </div>

          {/* Quality Bitrate Selector */}
          <div className={styles.toggleItem} style={{ cursor: 'default' }}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>جودة ومعدل البت (Bitrate)</span>
              <span className={styles.toggleDesc}>دقة ونقاء ملف الصوت المسجل</span>
            </div>
            <select
              value={qualityBitrate}
              onChange={(e) => setQualityBitrate(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                fontFamily: 'inherit',
                color: '#0f172a'
              }}
            >
              <option value="192">استوديو نقي (192 kbps)</option>
              <option value="128">متوازن وعالي (128 kbps)</option>
              <option value="64">حجم خفيف (64 kbps)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── SAVED RECORDINGS LIBRARY ─── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>
              <FileAudio size={20} color="#059669" />
              التسجيلات المحفوظة ({recordings.length})
            </h3>
            <p className={styles.cardSubtitle}>
              استمع للتسجيلات التي سجلتها خلال هذه الجلسة وقم بتحميلها فوراً لجهاز اللاب توب بصيغة صوت عالية النقاء.
            </p>
          </div>
          {recordings.length > 0 && (
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من مسح جميع تسجيلات هذه الجلسة؟')) {
                  setRecordings([])
                }
              }}
              style={{
                background: 'none',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              مسح الكل
            </button>
          )}
        </div>

        {recordings.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎙️</div>
            <p>لا توجد تسجيلات بعد في هذه الجلسة.</p>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              اختر الميكروفون بالأعلى واضغط على "بدء التسجيل الآن".
            </span>
          </div>
        ) : (
          <div className={styles.recordingsList}>
            {recordings.map((rec) => (
              <div key={rec.id} className={styles.recordingItem}>
                <div className={styles.recordingInfo}>
                  <input
                    type="text"
                    className={styles.recordingTitleInput}
                    value={rec.title}
                    onChange={(e) => handleTitleChange(rec.id, e.target.value)}
                    title="انقر لتعديل اسم الملف قبل التحميل"
                  />
                  <div className={styles.recordingMeta}>
                    <span className={styles.metaBadge}>
                      <Clock size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                      {rec.duration}
                    </span>
                    <span className={styles.metaBadge}>💾 {rec.size}</span>
                    <span className={styles.metaBadge}>🎤 {rec.micLabel}</span>
                    <span style={{ fontSize: '0.78rem' }}>📅 {rec.date}</span>
                  </div>
                </div>

                <div className={styles.recordingPlayer}>
                  {/* HTML5 Audio Player */}
                  <audio
                    src={rec.url}
                    controls
                    className={styles.recordingAudio}
                    preload="metadata"
                  />

                  {/* Direct Download Button */}
                  <button
                    type="button"
                    className={styles.downloadBtn}
                    onClick={() => handleDownload(rec)}
                    title="تحميل الملف الصوتي لجهازك الآن"
                  >
                    <Download size={16} />
                    <span>تحميل الصوت</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteRecording(rec.id)}
                    title="حذف هذا التسجيل"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── TEACHER RECORDING TIPS ─── */}
      <div className={styles.tipsCard}>
        <div className={styles.tipsIcon}>💡</div>
        <div className={styles.tipsContent}>
          <h4>نصائح ذهبية لتسجيل صوت فائق النقاء من اللاب توب:</h4>
          <p>
            • إذا قمت بتوصيل ميكروفون خارجي (USB) أو سماعة رأس، اضغط على <strong>"تحديث الميكروفونات"</strong> ثم اختر اسم جهازك من القائمة لتتأكد من أن اللاب توب لا يسجل من الميكروفون المدمج.
            <br />
            • اضغط على <strong>"فحص واختبار الصوت"</strong> وتحدث بشكل طبيعي وتأكد من أن مؤشر الصوت (VU Meter) يتحرك في المنطقة الخضراء.
            <br />
            • يفضل تفعيل ميزة <strong>"عزل الضوضاء"</strong> لتفادي صوت مروحة اللاب توب، والحفاظ على مسافة 15 إلى 20 سم من الميكروفون.
          </p>
        </div>
      </div>

    </div>
  )
}
