'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const Prep3AudioContext = createContext(null)

export function usePrep3Audio() {
  const context = useContext(Prep3AudioContext)
  if (!context) {
    throw new Error('usePrep3Audio must be used within a Prep3AudioProvider')
  }
  return context
}

/**
 * Intelligently splits Arabic text into short, natural sentence / phrase chunks
 * that can be played seamlessly without hitting TTS character or timeout limits.
 */
function splitIntoSentenceChunks(text) {
  if (!text) return []

  const clean = text
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/[\r\n]+/g, ' . ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!clean) return []

  // Split on sentence boundaries (period, question mark, exclamation, semicolon, colon)
  const rawParts = clean.split(/(?<=[.!?؟؛:])\s+/g)
  const chunks = []

  for (const part of rawParts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    // If chunk is still long (> 110 chars), split further by commas or conjunctions
    if (trimmed.length > 110) {
      const subParts = trimmed.split(/(?<=[،,])\s+/g)
      let currentSub = ''
      for (const sp of subParts) {
        const spTrimmed = sp.trim()
        if (!spTrimmed) continue
        if (currentSub && currentSub.length + spTrimmed.length > 100) {
          chunks.push(currentSub.trim())
          currentSub = spTrimmed
        } else {
          currentSub = currentSub ? `${currentSub} ${spTrimmed}` : spTrimmed
        }
      }
      if (currentSub.trim()) {
        chunks.push(currentSub.trim())
      }
    } else {
      chunks.push(trimmed)
    }
  }

  // Keep only chunks containing actual words
  return chunks.filter(c => /[\u0600-\u06FF\w]/.test(c))
}

export function Prep3AudioProvider({ children }) {
  const [currentId, setCurrentId] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [activeWord, setActiveWord] = useState(null)
  const [sequenceIndex, setSequenceIndex] = useState(-1)

  const currentSequenceRef = useRef(null)
  const isSequenceCancelledRef = useRef(false)
  const activeWordTimeoutRef = useRef(null)
  const activeAudioRef = useRef(null)

  // Mobile audio unlocking and SpeechSynthesis voice preloading
  useEffect(() => {
    if (typeof window === 'undefined') return

    const unlock = () => {
      try {
        const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA')
        silentAudio.volume = 0.01
        silentAudio.play().catch(() => {})
      } catch (_) {}

      if ('speechSynthesis' in window) {
        try {
          const u = new SpeechSynthesisUtterance(' ')
          u.volume = 0
          window.speechSynthesis.speak(u)
        } catch (_) {}
      }
    }

    window.addEventListener('touchstart', unlock, { once: true, passive: true })
    window.addEventListener('click', unlock, { once: true, passive: true })

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.getVoices()
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices()
          }
        }
      } catch (_) {}
    }

    return () => {
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('click', unlock)
    }
  }, [])

  // Immediately stop all speech, active audio elements, and timers
  const stop = useCallback(() => {
    isSequenceCancelledRef.current = true
    currentSequenceRef.current = null
    setSequenceIndex(-1)
    setCurrentId(null)
    setIsSpeaking(false)
    setActiveWord(null)

    if (activeWordTimeoutRef.current) {
      clearTimeout(activeWordTimeoutRef.current)
      activeWordTimeoutRef.current = null
    }

    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause()
        activeAudioRef.current.currentTime = 0
        activeAudioRef.current.src = ''
      } catch (_) {}
      activeAudioRef.current = null
    }

    if (typeof window !== 'undefined') {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel()
        }
      } catch (_) {}
      try {
        if (window.responsiveVoice && typeof window.responsiveVoice.cancel === 'function') {
          window.responsiveVoice.cancel()
        }
      } catch (_) {}
    }
  }, [])

  // Engine 2 fallback: Web Speech Synthesis with Arabic voice detection
  const speakViaSynthesis = useCallback((chunkText, onEnd, onError) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd()
      return
    }

    try {
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(chunkText)
      utt.rate = 0.92
      utt.pitch = 1.0
      utt.lang = 'ar-SA'

      const voices = window.speechSynthesis.getVoices()
      const arabicVoice = voices.find(v => 
        v.lang.toLowerCase().startsWith('ar') ||
        v.name.toLowerCase().includes('arabic') ||
        v.name.toLowerCase().includes('hoda') ||
        v.name.toLowerCase().includes('maged') ||
        v.name.toLowerCase().includes('tarik') ||
        v.name.toLowerCase().includes('salma') ||
        v.name.toLowerCase().includes('zariyah') ||
        v.name.toLowerCase().includes('naayf') ||
        v.name.toLowerCase().includes('العربية')
      )

      if (arabicVoice) {
        utt.voice = arabicVoice
        utt.lang = arabicVoice.lang
      }

      let ended = false
      const finish = () => {
        if (!ended) {
          ended = true
          if (onEnd) onEnd()
        }
      }

      utt.onend = finish
      utt.onerror = () => {
        // Fallback to ResponsiveVoice if available
        if (window.responsiveVoice && typeof window.responsiveVoice.speak === 'function') {
          try {
            window.responsiveVoice.speak(chunkText, 'Arabic Female', {
              rate: 0.9,
              onend: finish,
              onerror: finish
            })
            return
          } catch (_) {}
        }
        finish()
      }

      window.speechSynthesis.speak(utt)
    } catch (_) {
      if (onEnd) onEnd()
    }
  }, [])

  // Core single chunk speaker: Engine 1 (/api/tts streaming) -> Engine 2 (SpeechSynthesis) -> Engine 3 (ResponsiveVoice)
  const speakChunk = useCallback((chunkText, onEndCallback, onErrorCallback) => {
    if (!chunkText || typeof window === 'undefined') {
      if (onEndCallback) onEndCallback()
      return
    }

    const cleanChunk = chunkText.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
    if (!cleanChunk) {
      if (onEndCallback) onEndCallback()
      return
    }

    // Try High-Quality Dedicated /api/tts streaming
    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(cleanChunk)}&lang=ar`
      const audio = new Audio(audioUrl)
      activeAudioRef.current = audio

      let isHandled = false
      const handleSuccess = () => {
        if (!isHandled) {
          isHandled = true
          activeAudioRef.current = null
          if (onEndCallback) onEndCallback()
        }
      }

      const handleFailure = () => {
        if (!isHandled) {
          isHandled = true
          activeAudioRef.current = null
          // Fallback to SpeechSynthesis
          speakViaSynthesis(cleanChunk, onEndCallback, onErrorCallback)
        }
      }

      audio.onended = handleSuccess
      audio.onerror = handleFailure

      // Safety timeout: if network hangs, fallback automatically
      const safetyTimeoutMs = Math.max(5000, cleanChunk.length * 200)
      const safetyTimer = setTimeout(() => {
        if (!isHandled) {
          try { audio.pause() } catch (_) {}
          handleFailure()
        }
      }, safetyTimeoutMs)

      audio.addEventListener('ended', () => clearTimeout(safetyTimer), { once: true })

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(handleFailure)
      }
    } catch (err) {
      speakViaSynthesis(cleanChunk, onEndCallback, onErrorCallback)
    }
  }, [speakViaSynthesis])

  // Play a single clicked word
  const playWord = useCallback((rawWord) => {
    if (!rawWord) return
    const cleanWord = rawWord.replace(/^[«"'\(\[\{]+|[»"'\)\]\}\.\,\،\؛\:\?\!]+$/g, '').trim()
    if (!cleanWord) return

    stop()
    const wordId = `word-${cleanWord}-${Date.now()}`
    setCurrentId(wordId)
    setIsSpeaking(true)
    setActiveWord(cleanWord)

    speakChunk(cleanWord, () => {
      setIsSpeaking(false)
      setCurrentId(null)
      activeWordTimeoutRef.current = setTimeout(() => {
        setActiveWord(null)
      }, 400)
    })
  }, [stop, speakChunk])

  // Play an entire paragraph / text chunk by chunk with natural cadence
  const playText = useCallback((id, text) => {
    if (!text) return

    // If already playing this ID, toggle off (pause/stop)
    if (currentId === id && isSpeaking) {
      stop()
      return
    }

    stop()
    isSequenceCancelledRef.current = false
    setCurrentId(id)
    setIsSpeaking(true)
    setActiveWord(null)

    const chunks = splitIntoSentenceChunks(text)
    if (chunks.length === 0) {
      setIsSpeaking(false)
      setCurrentId(null)
      return
    }

    let chunkIdx = 0

    const playNextChunk = () => {
      if (isSequenceCancelledRef.current) return

      if (chunkIdx >= chunks.length) {
        setIsSpeaking(false)
        setCurrentId(null)
        return
      }

      const currentChunk = chunks[chunkIdx]
      chunkIdx++

      speakChunk(currentChunk, () => {
        if (!isSequenceCancelledRef.current) {
          // Natural sentence pause between sentences (200ms)
          setTimeout(playNextChunk, 200)
        }
      }, () => {
        if (!isSequenceCancelledRef.current) {
          setTimeout(playNextChunk, 200)
        }
      })
    }

    playNextChunk()
  }, [currentId, isSpeaking, stop, speakChunk])

  // Play a sequence of items (like poem verses) sequentially
  const playSequence = useCallback((id, items, onComplete) => {
    if (!items || items.length === 0) return

    if (currentId === id && isSpeaking) {
      stop()
      return
    }

    stop()
    isSequenceCancelledRef.current = false
    currentSequenceRef.current = items
    setCurrentId(id)
    setIsSpeaking(true)

    let index = 0

    const speakNext = () => {
      if (isSequenceCancelledRef.current) return
      if (index >= items.length) {
        setIsSpeaking(false)
        setCurrentId(null)
        setSequenceIndex(-1)
        if (onComplete) onComplete()
        return
      }

      setSequenceIndex(index)
      const currentItemText = items[index]
      index++

      speakChunk(currentItemText, () => {
        if (!isSequenceCancelledRef.current) {
          // Pause slightly between verses (700ms) for natural poetic cadence
          setTimeout(speakNext, 700)
        }
      }, () => {
        if (!isSequenceCancelledRef.current) {
          setTimeout(speakNext, 700)
        }
      })
    }

    speakNext()
  }, [currentId, isSpeaking, stop, speakChunk])

  const value = {
    currentId,
    isSpeaking,
    activeWord,
    sequenceIndex,
    playWord,
    playText,
    playSequence,
    stop
  }

  return (
    <Prep3AudioContext.Provider value={value}>
      {children}
    </Prep3AudioContext.Provider>
  )
}

