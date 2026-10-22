import SURAHS_METADATA from './surahs_metadata.json'
import OFFLINE_AYAHS from './offline_ayahs.json'

const BASMALAH_PREFIX = /^(\uFEFF)?بِسْمِ\s+(?:ٱ|ا)للَّهِ\s+(?:ٱ|ا)لرَّحْمَٰنِ\s+(?:ٱ|ا)لرَّحِيمِ\s*/
const isWaqf = (token) => /^[\u06D6-\u06DC\u06DF-\u06E4\u06E9\u06EA\u06ED\u0610-\u0614]+$/.test(token.trim())

// In-memory cache for loaded surahs
const surahCache = new Map()

// Initialize offline cache
if (OFFLINE_AYAHS) {
  Object.keys(OFFLINE_AYAHS).forEach((idStr) => {
    const id = parseInt(idStr, 10)
    const meta = SURAHS_METADATA.find(s => s.id === id)
    if (meta) {
      surahCache.set(id, {
        ...meta,
        ayahs: OFFLINE_AYAHS[idStr]
      })
    }
  })
}

export function getAllSurahs() {
  return SURAHS_METADATA
}

export function getFilteredSurahs(category = 'all', searchQuery = '') {
  let list = SURAHS_METADATA

  if (category === 'juz_30') {
    list = list.filter(s => s.id >= 78)
  } else if (category === 'juz_29') {
    list = list.filter(s => s.id >= 67 && s.id <= 77)
  } else if (category === 'short') {
    list = list.filter(s => s.id >= 93)
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().replace(/[\u064B-\u0652]/g, '').toLowerCase()
    list = list.filter(s => {
      const cleanName = s.name.replace(/[\u064B-\u0652]/g, '').toLowerCase()
      const eng = (s.englishName || '').toLowerCase()
      return cleanName.includes(q) || eng.includes(q) || s.id.toString() === q
    })
  }

  return list
}

export async function loadSurahData(surahId) {
  const id = parseInt(surahId, 10)
  if (surahCache.has(id)) {
    return surahCache.get(id)
  }

  // Check sessionStorage in browser
  if (typeof window !== 'undefined') {
    try {
      const cached = sessionStorage.getItem(`quran_surah_${id}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        surahCache.set(id, parsed)
        return parsed
      }
    } catch (_) {}
  }

  const meta = SURAHS_METADATA.find(s => s.id === id) || {
    id,
    name: `سورة رقم ${id}`,
    englishName: `Surah ${id}`,
    ayahsCount: 0
  }

  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani,ar.alafasy`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()

    const textEdition = json.data && json.data[0] ? json.data[0] : null
    const audioEdition = json.data && json.data[1] ? json.data[1] : null

    if (!textEdition || !textEdition.ayahs) {
      throw new Error('Invalid Quran data format')
    }

    const ayahs = textEdition.ayahs.map((a, idx) => {
      let cleanText = a.text.trim().replace(/^\uFEFF/, '')
      if (id !== 1 && id !== 9 && a.numberInSurah === 1) {
        cleanText = cleanText.replace(BASMALAH_PREFIX, '')
      }
      const words = cleanText.split(/\s+/).filter(w => w.length > 0 && !isWaqf(w))
      const audioUrl = (audioEdition && audioEdition.ayahs && audioEdition.ayahs[idx]) 
        ? audioEdition.ayahs[idx].audio 
        : `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${a.number}.mp3`

      return {
        num: a.numberInSurah,
        text: cleanText,
        words: words,
        audio: audioUrl
      }
    })

    const result = {
      ...meta,
      ayahs
    }

    surahCache.set(id, result)
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`quran_surah_${id}`, JSON.stringify(result))
      } catch (_) {}
    }

    return result
  } catch (err) {
    console.error(`Failed to fetch surah ${id}:`, err)
    // Fallback to offline if exists
    if (OFFLINE_AYAHS && OFFLINE_AYAHS[id]) {
      const fallback = {
        ...meta,
        ayahs: OFFLINE_AYAHS[id]
      }
      surahCache.set(id, fallback)
      return fallback
    }
    throw err
  }
}
