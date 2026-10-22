/**
 * Unified Custom Game Words & Questions Store
 * Manages custom and AI-generated content across all educational games:
 * - Car Blending
 * - Claw Machine
 * - Blending Rocks
 * - Word Train
 * - Word Puzzle
 * - Memory Game
 * - Arcade Games (Mario, Subway, Tank Battle)
 */

const STORAGE_KEY_AR = 'custom_game_words_arabic'
const STORAGE_KEY_EN = 'custom_game_words_english'
const STORAGE_KEY_QUESTIONS = 'active_live_custom_questions'

// Segment Arabic word into letters preserving attached harakat (diacritics)
export function segmentWordLetters(word, lang = 'arabic') {
  if (!word || typeof word !== 'string') return []
  const clean = word.trim()
  if (!clean) return []

  if (lang === 'arabic' || /[\u0600-\u06FF]/.test(clean)) {
    // Match each base character + any attached diacritics
    const matches = clean.match(/[^\u064B-\u065F\u0670][\u064B-\u065F\u0670]*/g)
    if (matches && matches.length > 0) {
      return matches.map(s => s.trim()).filter(Boolean)
    }
  }

  // English or default fallback
  return clean.split('').filter(s => s.trim().length > 0)
}

export function loadCustomGameWords(lang = 'arabic') {
  if (typeof window === 'undefined') return []
  try {
    const key = lang === 'arabic' ? STORAGE_KEY_AR : STORAGE_KEY_EN
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('Error loading custom game words:', e)
    return []
  }
}

export function saveCustomGameWords(lang = 'arabic', words = []) {
  if (typeof window === 'undefined') return []
  try {
    const key = lang === 'arabic' ? STORAGE_KEY_AR : STORAGE_KEY_EN
    if (Array.isArray(words) && words.length > 0) {
      localStorage.setItem(key, JSON.stringify(words))
    } else {
      localStorage.removeItem(key)
    }
    // Broadcast event for all open game windows/iframes
    window.dispatchEvent(new CustomEvent('customGameWordsUpdated', { detail: { lang, words } }))
    return words
  } catch (e) {
    console.error('Error saving custom game words:', e)
    return []
  }
}

export function clearCustomGameWords(lang = 'arabic') {
  return saveCustomGameWords(lang, [])
}

// Convert arbitrary teacher input (text, array, or AI response) into standard word objects
export function normalizeCustomWord(input, lang = 'arabic') {
  if (!input) return null
  
  if (typeof input === 'string') {
    const clean = input.trim()
    if (!clean) return null
    const letters = segmentWordLetters(clean, lang)
    const missingIdx = Math.floor(letters.length / 2)
    return {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      word: clean,
      letters: letters,
      phonics: letters,
      emoji: '🎯',
      category: 'كلمات المعلم',
      blend12: letters.length >= 2 ? `${letters[0]}${letters[1]}` : letters[0],
      missingIdx: missingIdx,
      soundTarget: letters[missingIdx] || letters[0]
    }
  }

  const word = (input.word || input.text || '').trim()
  if (!word) return null

  let letters = Array.isArray(input.letters) && input.letters.length > 0
    ? input.letters.map(l => String(l).trim())
    : segmentWordLetters(word, lang)

  let phonics = Array.isArray(input.phonics) && input.phonics.length > 0
    ? input.phonics.map(p => String(p).trim())
    : letters

  const missingIdx = typeof input.missingIdx === 'number' 
    ? Math.max(0, Math.min(letters.length - 1, input.missingIdx))
    : Math.floor(letters.length / 2)

  return {
    id: input.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    word: word,
    letters: letters,
    phonics: phonics,
    emoji: input.emoji || '⭐',
    category: input.category || 'كلمات المعلم',
    blend12: input.blend12 || (letters.length >= 2 ? `${letters[0]}${letters[1]}` : letters[0]),
    missingIdx: missingIdx,
    soundTarget: input.soundTarget || letters[missingIdx] || letters[0]
  }
}

// Parse multiple words from bulk text (comma, newline, or whitespace separated)
export function parseWordsFromBulkText(text, lang = 'arabic') {
  if (!text || typeof text !== 'string') return []
  const items = text
    .split(/[\n,;،]/)
    .map(t => t.trim())
    .filter(t => t.length > 0 && !t.startsWith('#'))

  const results = []
  for (const item of items) {
    const normalized = normalizeCustomWord(item, lang)
    if (normalized) results.push(normalized)
  }
  return results
}

// Convert a custom word into a Train level
export function formatCustomWordToTrainLevel(wordObj, lang = 'arabic') {
  if (!wordObj) return null
  const word = wordObj.word
  const letters = wordObj.letters && wordObj.letters.length > 0 
    ? wordObj.letters 
    : segmentWordLetters(word, lang)
  
  const missingIdx = typeof wordObj.missingIdx === 'number' && wordObj.missingIdx < letters.length
    ? wordObj.missingIdx
    : Math.floor(letters.length / 2)
  
  const correct = letters[missingIdx]
  const segments = letters.map((l, i) => (i === missingIdx ? null : l))

  // Generate 3 plausible distractor letters
  const AR_DISTRACTORS = ['ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ر', 'س', 'ش', 'ص', 'ط', 'ع', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي']
  const EN_DISTRACTORS = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const pool = (lang === 'arabic' || /[\u0600-\u06FF]/.test(word)) ? AR_DISTRACTORS : EN_DISTRACTORS
  
  const distractors = pool
    .filter(d => d !== correct && !letters.includes(d))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  const options = [correct, ...distractors].sort(() => Math.random() - 0.5)

  return {
    word: word,
    emoji: wordObj.emoji || '🚂',
    category: wordObj.category || 'كلمات المعلم',
    segments: segments,
    correct: correct,
    missingIdx: missingIdx,
    options: options
  }
}

// Convert a custom word into a Puzzle level
export function formatCustomWordToPuzzleLevel(wordObj, lang = 'arabic') {
  if (!wordObj) return null
  return {
    word: wordObj.word,
    image: wordObj.emoji || '🧩',
    hint: wordObj.category || 'كلمة محددة من المعلم',
    letters: wordObj.letters || segmentWordLetters(wordObj.word, lang)
  }
}

// Instant smart offline presets library for AI generation fallback
export const SMART_AI_PRESETS = {
  arabic: {
    'حركة الفتح': [
      { word: 'كَتَبَ', letters: ['كَ', 'تَ', 'بَ'], phonics: ['كَ', 'تَ', 'بَ'], emoji: '✍️', category: 'أفعال ماضية' },
      { word: 'قَرَأَ', letters: ['قَ', 'رَ', 'أَ'], phonics: ['قَ', 'رَ', 'أَ'], emoji: '📖', category: 'أفعال ماضية' },
      { word: 'رَسَمَ', letters: ['رَ', 'سَ', 'مَ'], phonics: ['رَ', 'سَ', 'مَ'], emoji: '🎨', category: 'أفعال ماضية' },
      { word: 'أَكَلَ', letters: ['أَ', 'كَ', 'لَ'], phonics: ['أَ', 'كَ', 'لَ'], emoji: '🍎', category: 'أفعال ماضية' },
      { word: 'شَرِبَ', letters: ['شَ', 'رِ', 'بَ'], phonics: ['شَ', 'رِ', 'بَ'], emoji: '🥤', category: 'أفعال ماضية' },
      { word: 'زَرَعَ', letters: ['زَ', 'رَ', 'عَ'], phonics: ['زَ', 'رَ', 'عَ'], emoji: '🌱', category: 'أفعال ماضية' },
      { word: 'حَصَدَ', letters: ['حَ', 'صَ', 'دَ'], phonics: ['حَ', 'صَ', 'دَ'], emoji: '🌾', category: 'أفعال ماضية' },
      { word: 'دَخَلَ', letters: ['دَ', 'خَ', 'لَ'], phonics: ['دَ', 'خَ', 'لَ'], emoji: '🚪', category: 'أفعال ماضية' },
      { word: 'خَرَجَ', letters: ['خَ', 'رَ', 'جَ'], phonics: ['خَ', 'رَ', 'جَ'], emoji: '🏃', category: 'أفعال ماضية' },
      { word: 'سَجَدَ', letters: ['سَ', 'جَ', 'دَ'], phonics: ['سَ', 'جَ', 'دَ'], emoji: '🕌', category: 'أفعال ماضية' }
    ],
    'حيوانات': [
      { word: 'أَسَد', letters: ['أَ', 'سَ', 'د'], phonics: ['أَ', 'سَ', 'د'], emoji: '🦁', category: 'حيوانات' },
      { word: 'فِيل', letters: ['فِ', 'ي', 'ل'], phonics: ['فِ', 'ي', 'ل'], emoji: '🐘', category: 'حيوانات' },
      { word: 'نَمِر', letters: ['نَ', 'مِ', 'ر'], phonics: ['نَ', 'مِ', 'ر'], emoji: '🐯', category: 'حيوانات' },
      { word: 'جَمَل', letters: ['جَ', 'مَ', 'ل'], phonics: ['جَ', 'مَ', 'ل'], emoji: '🐪', category: 'حيوانات' },
      { word: 'غَزَال', letters: ['غَ', 'زَ', 'ا', 'ل'], phonics: ['غَ', 'زَ', 'ا', 'ل'], emoji: '🦌', category: 'حيوانات' },
      { word: 'قِرْد', letters: ['قِ', 'رْ', 'د'], phonics: ['قِ', 'رْ', 'د'], emoji: '🐒', category: 'حيوانات' },
      { word: 'حِصَان', letters: ['حِ', 'صَ', 'ا', 'ن'], phonics: ['حِ', 'صَ', 'ا', 'ن'], emoji: '🐎', category: 'حيوانات' },
      { word: 'أَرْنَب', letters: ['أَ', 'رْ', 'نَ', 'ب'], phonics: ['أَ', 'رْ', 'نَ', 'ب'], emoji: '🐇', category: 'حيوانات' }
    ],
    'فواكه وخضار': [
      { word: 'تُفَّاح', letters: ['تُ', 'فَّ', 'ا', 'ح'], phonics: ['تُ', 'فَّ', 'ا', 'ح'], emoji: '🍎', category: 'فواكه' },
      { word: 'مَوْز', letters: ['مَ', 'وْ', 'ز'], phonics: ['مَ', 'وْ', 'ز'], emoji: '🍌', category: 'فواكه' },
      { word: 'عِنَب', letters: ['عِ', 'نَ', 'ب'], phonics: ['عِ', 'نَ', 'ب'], emoji: '🍇', category: 'فواكه' },
      { word: 'رُمَّان', letters: ['رُ', 'مَّ', 'ا', 'ن'], phonics: ['رُ', 'مَّ', 'ا', 'ن'], emoji: '🫐', category: 'فواكه' },
      { word: 'تَمْر', letters: ['تَ', 'مْ', 'ر'], phonics: ['تَ', 'مْ', 'ر'], emoji: '🌴', category: 'ثمار' },
      { word: 'جَزَر', letters: ['جَ', 'زَ', 'ر'], phonics: ['جَ', 'زَ', 'ر'], emoji: '🥕', category: 'خضار' },
      { word: 'خِيَار', letters: ['خِ', 'يَ', 'ا', 'ر'], phonics: ['خِ', 'يَ', 'ا', 'ر'], emoji: '🥒', category: 'خضار' }
    ],
    'أدوات المدرسة': [
      { word: 'قَلَم', letters: ['قَ', 'لَ', 'م'], phonics: ['قَ', 'لَ', 'م'], emoji: '✏️', category: 'مدرسة' },
      { word: 'كِتَاب', letters: ['كِ', 'تَ', 'ا', 'ب'], phonics: ['كِ', 'تَ', 'ا', 'ب'], emoji: '📚', category: 'مدرسة' },
      { word: 'دَفْتَر', letters: ['دَ', 'فْ', 'تَ', 'ر'], phonics: ['دَ', 'فْ', 'تَ', 'ر'], emoji: '📓', category: 'مدرسة' },
      { word: 'مِسْطَرَة', letters: ['مِ', 'سْ', 'طَ', 'رَ', 'ة'], phonics: ['مِ', 'سْ', 'طَ', 'رَ', 'ة'], emoji: '📏', category: 'مدرسة' },
      { word: 'مِمْحَاة', letters: ['مِ', 'مْ', 'حَ', 'ا', 'ة'], phonics: ['مِ', 'مْ', 'حَ', 'ا', 'ة'], emoji: '🧹', category: 'مدرسة' },
      { word: 'حَقِيبَة', letters: ['حَ', 'قِ', 'ي', 'بَ', 'ة'], phonics: ['حَ', 'قِ', 'ي', 'بَ', 'ة'], emoji: '🎒', category: 'مدرسة' }
    ]
  },
  english: {
    'Short A (at, an, ap)': [
      { word: 'cat', letters: ['c', 'a', 't'], phonics: ['k', 'æ', 't'], emoji: '🐱', category: 'Animals' },
      { word: 'hat', letters: ['h', 'a', 't'], phonics: ['h', 'æ', 't'], emoji: '🎩', category: 'Clothes' },
      { word: 'bat', letters: ['b', 'a', 't'], phonics: ['b', 'æ', 't'], emoji: '🦇', category: 'Animals' },
      { word: 'mat', letters: ['m', 'a', 't'], phonics: ['m', 'æ', 't'], emoji: '🧘', category: 'Objects' },
      { word: 'pan', letters: ['p', 'a', 'n'], phonics: ['p', 'æ', 'n'], emoji: '🍳', category: 'Kitchen' },
      { word: 'fan', letters: ['f', 'a', 'n'], phonics: ['f', 'æ', 'n'], emoji: '🪭', category: 'Objects' },
      { word: 'map', letters: ['m', 'a', 'p'], phonics: ['m', 'æ', 'p'], emoji: '🗺️', category: 'Objects' },
      { word: 'cap', letters: ['c', 'a', 'p'], phonics: ['k', 'æ', 'p'], emoji: '🧢', category: 'Clothes' }
    ],
    'Short O (og, op, ot)': [
      { word: 'dog', letters: ['d', 'o', 'g'], phonics: ['d', 'ɒ', 'g'], emoji: '🐶', category: 'Animals' },
      { word: 'fox', letters: ['f', 'o', 'x'], phonics: ['f', 'ɒ', 'ks'], emoji: '🦊', category: 'Animals' },
      { word: 'box', letters: ['b', 'o', 'x'], phonics: ['b', 'ɒ', 'ks'], emoji: '📦', category: 'Objects' },
      { word: 'hot', letters: ['h', 'o', 't'], phonics: ['h', 'ɒ', 't'], emoji: '🔥', category: 'Weather' },
      { word: 'pot', letters: ['p', 'o', 't'], phonics: ['p', 'ɒ', 't'], emoji: '🍲', category: 'Objects' },
      { word: 'top', letters: ['t', 'o', 'p'], phonics: ['t', 'ɒ', 'p'], emoji: '🔝', category: 'Objects' }
    ],
    'Short U (un, ug, ut)': [
      { word: 'sun', letters: ['s', 'u', 'n'], phonics: ['s', 'ʌ', 'n'], emoji: '☀️', category: 'Nature' },
      { word: 'bus', letters: ['b', 'u', 's'], phonics: ['b', 'ʌ', 's'], emoji: '🚌', category: 'Vehicles' },
      { word: 'cup', letters: ['c', 'u', 'p'], phonics: ['k', 'ʌ', 'p'], emoji: '☕', category: 'Objects' },
      { word: 'bug', letters: ['b', 'u', 'g'], phonics: ['b', 'ʌ', 'g'], emoji: '🐞', category: 'Animals' },
      { word: 'hug', letters: ['h', 'u', 'g'], phonics: ['h', 'ʌ', 'g'], emoji: '🤗', category: 'Actions' },
      { word: 'run', letters: ['r', 'u', 'n'], phonics: ['r', 'ʌ', 'n'], emoji: '🏃', category: 'Actions' }
    ]
  }
}
