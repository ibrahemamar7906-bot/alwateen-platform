/**
 * Centralized Audio & TTS Engine for Al-Gonady Platform
 * 1. Primary: Next.js /api/tts endpoint (Google Studio TTS, high compatibility across all OS & browsers)
 * 2. Secondary: ResponsiveVoice (Arabic Male / English Female)
 * 3. Tertiary: Browser Web Speech API (SpeechSynthesis)
 */

function dispatchMuteEvent(mute) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ttsmute', { detail: { mute } }));
  }
}

const audioCache = new Map()
let isSpeaking = false
let activeAudio = null

// Global Audio Element used to bypass iOS Safari Autoplay restrictions
// It must be created and unlocked during a user interaction (click/touch),
// and then the exact same element must be reused for all async network TTS.
let globalSharedAudio = null;

export function unlockGlobalAudio() {
  if (typeof window === 'undefined') return;
  if (!globalSharedAudio) {
    globalSharedAudio = new Audio();
  }
  // Play silent base64 audio to unlock
  globalSharedAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
  globalSharedAudio.play().catch(() => {});
}

const ARABIC_LETTER_NAMES = {
  'أ': 'ألف', 'ا': 'ألف', 'إ': 'ألف', 'آ': 'ألف',
  'ب': 'باء', 'ت': 'تاء', 'ث': 'ثاء', 'ج': 'جيم', 'ح': 'حاء', 'خ': 'خاء',
  'د': 'دال', 'ذ': 'ذال', 'ر': 'راء', 'ز': 'زاي', 'س': 'سين', 'ش': 'شين',
  'ص': 'صاد', 'ض': 'ضاد', 'ط': 'طاء', 'ظ': 'ظاء', 'ع': 'عين', 'غ': 'غين',
  'ف': 'فاء', 'ق': 'قاف', 'ك': 'كاف', 'ل': 'لام', 'م': 'ميم', 'ن': 'نون',
  'ه': 'هاء', 'هـ': 'هاء', 'و': 'واو', 'ي': 'ياء'
}

const HARAKAT_NAMES = {
  '\u064E': 'فَتحة',
  '\u064F': 'ضَمَّة',
  '\u0650': 'كَسرة',
  '\u0652': 'سُكون',
  '\u064B': 'تنوين بالفتح',
  '\u064C': 'تنوين بالضم',
  '\u064D': 'تنوين بالكسر'
}

export function formatArabicLetterForSpeech(text) {
  if (!text || text.length > 2) return text
  let baseLetter = text[0]
  let haraka = text[1]

  if (ARABIC_LETTER_NAMES[baseLetter]) {
    let name = ARABIC_LETTER_NAMES[baseLetter]
    if (haraka && HARAKAT_NAMES[haraka]) {
      return `${name}، ${HARAKAT_NAMES[haraka]}، ${text}`
    }
    return `${name}، ${text}`
  }
  return text
}

export function cancelTTS() {
  if (activeAudio) {
    try {
      activeAudio.pause()
      activeAudio.currentTime = 0
    } catch (e) {}
    activeAudio = null
  }
  if (typeof window !== 'undefined') {
    if (window.responsiveVoice) window.responsiveVoice.cancel()
    if (window.speechSynthesis) window.speechSynthesis.cancel()
  }
  dispatchMuteEvent(false)
}

/**
 * Lightweight helper for game pages that need to call responsiveVoice directly.
 * Waits for the script to load before speaking (fixes race condition).
 * Usage: speakWhenReady('مرحباً', 'Arabic Male')
 */
export function speakWhenReady(text, voice = 'Arabic Male', opts = {}) {
  if (!text || typeof window === 'undefined') return
  const clean = typeof text === 'string' && text.includes('<')
    ? text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
    : text
  if (!clean) return

  const doSpeak = () => {
    cancelTTS()
    if (window.responsiveVoice && typeof window.responsiveVoice.speak === 'function') {
      let timeoutId = setTimeout(() => {
        // Fallback if ResponsiveVoice silently hangs
        if ('speechSynthesis' in window) {
          const utt = new SpeechSynthesisUtterance(clean)
          utt.lang = voice.includes('Arabic') ? 'ar-SA' : 'en-US'
          utt.rate = opts.rate || 0.9
          utt.onend = () => { dispatchMuteEvent(false); if (opts.onend) opts.onend(); }; utt.onerror = () => { dispatchMuteEvent(false); };
          dispatchMuteEvent(true); window.speechSynthesis.speak(utt)
        } else {
          if (opts.onend) opts.onend()
        }
      }, 1500);

      dispatchMuteEvent(true);
      window.responsiveVoice.speak(clean, voice, { 
        rate: 0.9, 
        ...opts,
        onstart: () => {
          clearTimeout(timeoutId)
          if (opts.onstart) opts.onstart()
        },
        onend: () => {
          clearTimeout(timeoutId)
          dispatchMuteEvent(false);
          if (opts.onend) opts.onend()
        },
        onerror: (e) => {
          clearTimeout(timeoutId)
          if (opts.onerror) opts.onerror(e)
          // Fallback immediately on explicit error
          if ('speechSynthesis' in window) {
            const utt = new SpeechSynthesisUtterance(clean)
            utt.lang = voice.includes('Arabic') ? 'ar-SA' : 'en-US'
            utt.rate = opts.rate || 0.9
            utt.onend = () => { dispatchMuteEvent(false); if (opts.onend) opts.onend(); }; utt.onerror = () => { dispatchMuteEvent(false); };
            dispatchMuteEvent(true); window.speechSynthesis.speak(utt)
          }
        }
      })
    } else {
      // Fallback: Web Speech API
      if ('speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(clean)
        utt.lang = voice.includes('Arabic') ? 'ar-SA' : 'en-US'
        utt.rate = opts.rate || 0.9
        utt.onend = () => { dispatchMuteEvent(false); if (opts.onend) opts.onend(); }; utt.onerror = () => { dispatchMuteEvent(false); };
        dispatchMuteEvent(true); window.speechSynthesis.speak(utt)
      } else {
        if (opts.onend) opts.onend()
      }
    }
  }

  if (window.responsiveVoice && typeof window.responsiveVoice.speak === 'function') {
    doSpeak()
  } else {
    // Poll until ready (max 5s)
    const start = Date.now()
    const interval = setInterval(() => {
      if (window.responsiveVoice && typeof window.responsiveVoice.speak === 'function') {
        clearInterval(interval)
        doSpeak()
      } else if (Date.now() - start > 5000) {
        clearInterval(interval)
        doSpeak() // try Web Speech API fallback
      }
    }, 100)
  }
}


/**
 * Waits for ResponsiveVoice to be available (max 5 seconds).
 * Returns true if ready, false if timed out.
 */
function waitForRV(maxMs = 5000) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false)
    if (window.responsiveVoice && typeof window.responsiveVoice.speak === 'function') {
      return resolve(true)
    }
    const start = Date.now()
    const check = setInterval(() => {
      if (window.responsiveVoice && typeof window.responsiveVoice.speak === 'function') {
        clearInterval(check)
        resolve(true)
      } else if (Date.now() - start > maxMs) {
        clearInterval(check)
        console.warn('[TTS] ResponsiveVoice not ready after', maxMs, 'ms — falling back to Web Speech API')
        resolve(false)
      }
    }, 100)
  })
}

export function playTTS(text, options = {}) {
  if (!text || typeof window === 'undefined') return Promise.resolve(false)

  const { isArabic = true, rate = 0.9, onEnd = () => {} } = options

  // Strip HTML tags universally — handles data.content passed by mistake
  let speechText = text.trim()
  if (speechText.includes('<')) {
    speechText = speechText.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
  }
  if (!speechText) return Promise.resolve(false)

  // Format letter if short single Arabic letter
  if (isArabic && speechText.length <= 2) {
    speechText = formatArabicLetterForSpeech(speechText)
  }

  // Stop any currently playing TTS audio
  cancelTTS()

  return new Promise((resolve) => {
    // 1. Try Native SpeechSynthesis first if it has the required language
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices()
      const hasVoice = isArabic ? voices.some(v => v.lang.startsWith('ar')) : voices.some(v => v.lang.startsWith('en'))
      
      if (hasVoice || speechText.length > 200) {
        // Use native immediately (no delay, no chunking limits)
        fallbackToSpeechSynthesis(speechText, isArabic, rate)
          .then(() => { onEnd(); resolve(true) })
          .catch(() => { onEnd(); resolve(false) })
        return
      }
    }

    // 2. Fallback to ResponsiveVoice
    waitForRV().then((rvReady) => {
      if (rvReady) {
        fallbackToResponsiveVoice(speechText, isArabic, rate)
          .then(() => { onEnd(); resolve(true) })
          .catch((e) => {
            console.warn('[TTS] ResponsiveVoice speak failed, trying Web Speech API:', e)
            fallbackToSpeechSynthesis(speechText, isArabic, rate)
              .then(() => { onEnd(); resolve(true) })
              .catch(() => { onEnd(); resolve(false) })
          })
      } else {
        // ResponsiveVoice never loaded — use browser fallback
        fallbackToSpeechSynthesis(speechText, isArabic, rate)
          .then(() => { onEnd(); resolve(true) })
          .catch(() => { onEnd(); resolve(false) })
      }
    })
  })
}


function fallbackToResponsiveVoice(text, isArabic, rate) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.responsiveVoice || typeof window.responsiveVoice.speak !== 'function') {
      return reject(new Error('ResponsiveVoice not available'))
    }

    try {
      const voice = isArabic ? 'Arabic Male' : 'US English Female'
      
      let speakTimeout = setTimeout(() => {
         reject(new Error('ResponsiveVoice timeout'))
      }, 10000)

      window.responsiveVoice.speak(text, voice, {
        rate: rate,
        onstart: () => {
          clearTimeout(speakTimeout)
        },
        onend: () => {
          clearTimeout(speakTimeout)
          resolve(true)
        },
        onerror: (e) => {
          clearTimeout(speakTimeout)
          reject(e)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}


function fallbackToSpeechSynthesis(text, isArabic, rate) {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = rate
        utterance.lang = isArabic ? 'ar-SA' : 'en-US'

        const voices = window.speechSynthesis.getVoices()
        if (isArabic) {
          const arVoice = voices.find(v => v.lang.startsWith('ar'))
          if (arVoice) utterance.voice = arVoice
        } else {
          const enVoice = voices.find(v => v.lang.startsWith('en'))
          if (enVoice) utterance.voice = enVoice
        }

        let keepAliveTimer;

        utterance.onstart = () => {
          dispatchMuteEvent(true);
          // Fix for Chrome 15s timeout bug
          keepAliveTimer = setInterval(() => {
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.pause();
              window.speechSynthesis.resume();
            } else {
              clearInterval(keepAliveTimer);
            }
          }, 10000);
        };

        utterance.onend = () => {
          dispatchMuteEvent(false);
          clearInterval(keepAliveTimer);
          resolve(true);
        };
        
        utterance.onerror = (e) => {
          dispatchMuteEvent(false);
          clearInterval(keepAliveTimer);
          reject(e);
        };

        window.speechSynthesis.speak(utterance)
      } catch (e) {
        console.error('SpeechSynthesis error:', e)
        reject(e)
      }
    } else {
      reject(new Error('SpeechSynthesis not supported'))
    }
  })
}

/**
 * Robust network-based TTS player that works asynchronously inside WebSocket callbacks.
 * Bypasses strict iOS/Safari speechSynthesis requirements by using a standard Audio element
 * (assuming the document was already activated).
 */
export function playNetworkAudio(text, options = {}) {
  if (!text || typeof window === 'undefined') return Promise.resolve(false);
  
  const { isArabic = true, onEnd = () => {} } = options;
  
  let speechText = text.trim();
  if (speechText.includes('<')) {
    speechText = speechText.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  }
  if (!speechText) return Promise.resolve(false);

  if (isArabic && speechText.length <= 2) {
    speechText = formatArabicLetterForSpeech(speechText);
  }

  cancelTTS();

  return new Promise((resolve) => {
    try {
      const lang = isArabic ? 'ar' : 'en';
      // ResponsiveVoice API blocks direct <audio> hotlinking (403 Forbidden).
      // To bypass Safari's async Autoplay block, we MUST use a direct network URL that allows hotlinking.
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(speechText)}`;
      const audio = new Audio(url);
      
      activeAudio = audio;
      
      audio.onended = () => {
        dispatchMuteEvent(false);
        onEnd();
        resolve(true);
      };
      
      audio.onerror = (e) => {
        console.warn('Network Audio failed, falling back to local TTS', e);
        playTTS(speechText, options).then(resolve);
      };
      
      dispatchMuteEvent(true);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn('Network Audio autoplay blocked, falling back to local TTS', e);
          playTTS(speechText, options).then(resolve);
        });
      }
    } catch (e) {
      playTTS(speechText, options).then(resolve);
    }
  });
}

/**
 * Specifically plays ResponsiveVoice using their direct API URL via an Audio element.
 * This is required for asynchronous WebSocket audio on iOS Safari which blocks speechSynthesis.
 */
export function playResponsiveVoiceNetwork(text, isArabic = true) {
  if (!text || typeof window === 'undefined') return Promise.resolve(false);
  
  let speechText = text.trim();
  if (isArabic && speechText.length <= 2) {
    speechText = formatArabicLetterForSpeech(speechText);
  }

  cancelTTS();

  return new Promise((resolve) => {
    try {
      const lang = isArabic ? 'ar' : 'en-GB';
      // Direct access to ResponsiveVoice backend using the API key
      const url = `https://code.responsivevoice.org/getvoice.php?t=${encodeURIComponent(speechText)}&tl=${lang}&sv=g1&vn=&pitch=0.5&rate=0.5&vol=1&key=KPmFvya3`;
      
      // We MUST reuse the globally unlocked audio element for Safari to allow async playback!
      if (!globalSharedAudio) {
        globalSharedAudio = new Audio();
      }
      globalSharedAudio.src = url;
      activeAudio = globalSharedAudio;
      
      globalSharedAudio.onended = () => { dispatchMuteEvent(false); resolve(true); };
      globalSharedAudio.onerror = () => {
        dispatchMuteEvent(false);
        console.warn("Global Audio error, falling back to local TTS");
        playTTS(speechText, { isArabic }).then(resolve);
      };
      
      dispatchMuteEvent(true);
      const playPromise = globalSharedAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error("Global Audio blocked:", err);
          playTTS(speechText, { isArabic }).then(resolve);
        });
      }
    } catch (e) {
      playTTS(speechText, { isArabic }).then(resolve);
    }
  });
}


