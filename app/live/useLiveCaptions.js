'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

/**
 * useLiveCaptions - Custom hook for continuous speech recognition & broadcasting
 * 
 * Used by the TEACHER to:
 * 1. Continuously recognize speech via Web Speech API
 * 2. Broadcast interim & final caption text to students via Supabase channel
 * 
 * @param {Object} options
 * @param {Object} options.channel - Supabase realtime channel
 * @param {boolean} options.isEnabled - Whether captions are enabled
 * @param {string} options.lang - Recognition language (default: 'ar-SA')
 * @param {string} options.senderName - Name of the speaker
 * @param {function} options.onCaption - Callback when a caption is generated
 * @returns {{ isActive, error, supported }}
 */
export default function useLiveCaptions({ channel, isEnabled = false, lang = 'ar-SA', senderName = '', onCaption = null }) {
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState(null)
  const [supported, setSupported] = useState(true)

  const recognitionRef = useRef(null)
  const channelRef = useRef(channel)
  const isEnabledRef = useRef(isEnabled)
  const restartTimeoutRef = useRef(null)
  const lastInterimBroadcastRef = useRef(0)
  const shouldRestartRef = useRef(false)
  const isStoppingRef = useRef(false)
  const senderNameRef = useRef(senderName)
  const onCaptionRef = useRef(onCaption)

  // Keep refs in sync
  useEffect(() => { channelRef.current = channel }, [channel])
  useEffect(() => { isEnabledRef.current = isEnabled }, [isEnabled])
  useEffect(() => { senderNameRef.current = senderName }, [senderName])
  useEffect(() => { onCaptionRef.current = onCaption }, [onCaption])

  // Broadcast helper
  const broadcastCaption = useCallback((event, payload) => {
    const ch = channelRef.current
    if (!ch) return

    if (ch.state === 'joined') {
      ch.send({ type: 'broadcast', event, payload }).catch(() => {})
    }
  }, [])

  // Throttled interim broadcast (max every 300ms)
  const broadcastInterim = useCallback((text) => {
    const now = Date.now()
    if (now - lastInterimBroadcastRef.current >= 300) {
      const payload = { text, isFinal: false, timestamp: now, senderName: senderNameRef.current }
      broadcastCaption('live_caption', payload)
      if (onCaptionRef.current) onCaptionRef.current(payload)
      lastInterimBroadcastRef.current = now
    }
  }, [broadcastCaption])

  // Final result broadcast (no throttle)
  const broadcastFinal = useCallback((text) => {
    const payload = { text, isFinal: true, timestamp: Date.now(), senderName: senderNameRef.current }
    broadcastCaption('live_caption', payload)
    if (onCaptionRef.current) onCaptionRef.current(payload)
  }, [broadcastCaption])

  // Start recognition
  const startRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      setError('متصفحك لا يدعم التعرف على الصوت. يرجى استخدام Google Chrome.')
      return
    }

    // Clean up any existing instance
    if (recognitionRef.current) {
      try {
        isStoppingRef.current = true
        recognitionRef.current.abort()
      } catch (_) {}
      recognitionRef.current = null
    }

    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      console.log('[LiveCaptions] Started listening...')
      setIsActive(true)
      setError(null)
      isStoppingRef.current = false
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Update local display
      if (finalTranscript) {
        broadcastFinal(finalTranscript)
      } else if (interimTranscript) {
        broadcastInterim(interimTranscript)
      }
    }

    recognition.onerror = (event) => {
      console.warn('[LiveCaptions] Recognition error:', event.error)
      
      // Don't show error for "no-speech" - this is normal
      if (event.error === 'no-speech') {
        // Auto-restart after brief silence
        if (isEnabledRef.current && !isStoppingRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (isEnabledRef.current) startRecognition()
          }, 500)
        }
        return
      }

      if (event.error === 'not-allowed') {
        setError('يرجى السماح بالوصول للمايكروفون لتفعيل الكابشن')
        isStoppingRef.current = true
      } else if (event.error === 'aborted') {
        isStoppingRef.current = true
      } else if (event.error === 'network') {
        setError('خطأ في الاتصال بخدمة التعرف على الصوت')
      } else {
        setError(`خطأ: ${event.error}`)
      }
    }

    recognition.onend = () => {
      setIsActive(false)
      
      // Auto-restart if still enabled (Chrome stops after ~60s)
      if (isEnabledRef.current && !isStoppingRef.current) {
        shouldRestartRef.current = true
        restartTimeoutRef.current = setTimeout(() => {
          if (isEnabledRef.current && shouldRestartRef.current) {
            startRecognition()
          }
        }, 300)
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (e) {
      console.error('[LiveCaptions] Failed to start:', e)
      setError('فشل في بدء التعرف على الصوت')
    }
  }, [lang, broadcastFinal, broadcastInterim])

  // Stop recognition
  const stopRecognition = useCallback(() => {
    shouldRestartRef.current = false
    isStoppingRef.current = true

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (_) {}
      recognitionRef.current = null
    }

    setIsActive(false)
  }, [])

  // React to isEnabled changes
  useEffect(() => {
    if (isEnabled) {
      startRecognition()
    } else {
      stopRecognition()
    }

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
    }
  }, [isEnabled, startRecognition, stopRecognition, broadcastCaption])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false
      isStoppingRef.current = true
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current)
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch (_) {}
      }
    }
  }, [])

  return { isActive, error, supported }
}
