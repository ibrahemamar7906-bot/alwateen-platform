import { NextResponse } from 'next/server'

export const dynamic = 'force-static';

// Smart phonetic enhancement for common words that TTS engines mispronounce if untashkeeled
const PHONETIC_MAP = [
  // Passive verbs vs Active
  { pattern: /\bولد\b/g, replacement: 'وُلِدَ' },
  { pattern: /\bتوج\b/g, replacement: 'تُوِّجَ' },
  { pattern: /\bلقي\b/g, replacement: 'لَقِيَ' },
  { pattern: /\bصعد\b/g, replacement: 'صَعِدَ' },
  { pattern: /\bتصدى\b/g, replacement: 'تَصَدَّى' },
  { pattern: /\bتجلت\b/g, replacement: 'تَجَلَّتْ' },
  { pattern: /\bاتسمت\b/g, replacement: 'اتَّسَمَتْ' },
  { pattern: /\bاحترف\b/g, replacement: 'احْتَرَفَ' },
  { pattern: /\bاستشهدنا\b/g, replacement: 'اسْتُشْهِدْنَا' },

  // Proper Nouns and Places
  { pattern: /\bمنسي\b/g, replacement: 'مَنْسِي' },
  { pattern: /\bالبرث\b/g, replacement: 'البَرْث' },
  { pattern: /\bمنيا القمح\b/g, replacement: 'مِنْيَا القَمْح' },
  { pattern: /\bبني قريش\b/g, replacement: 'بَنِي قُرَيْش' },
  { pattern: /\bنجريج\b/g, replacement: 'نَجْرِيج' },
  { pattern: /\bالشيخ زويد\b/g, replacement: 'الشَّيْخ زُوَيِّد' },
  { pattern: /\bعلي فرج\b/g, replacement: 'عَلِي فَرَج' },
  { pattern: /\bأحمد الجندي\b/g, replacement: 'أَحْمَد الجِنْدِي' },

  // Nouns with non-obvious vowels
  { pattern: /\bالسمحة\b/g, replacement: 'السَّمْحَة' },
  { pattern: /\bالصاعقة\b/g, replacement: 'الصَّاعِقَة' },
  { pattern: /\bبؤر\b/g, replacement: 'بُؤَر' },
  { pattern: /\bالخماسي الحديث\b/g, replacement: 'الخُمَاسِي الحَدِيث' },
  { pattern: /\bرءوسنا\b/g, replacement: 'رُؤُوسَنَا' },
  { pattern: /\bغادر\b/g, replacement: 'غَادِر' },
  { pattern: /\bقفل\b/g, replacement: 'قُفْل' },
  { pattern: /\bأكتوبر\b/g, replacement: 'أُكْتُوبَر' },
  { pattern: /\bيوليو\b/g, replacement: 'يُولْيُو' },
  { pattern: /\bطوكيو\b/g, replacement: 'طُوكْيُو' },
  { pattern: /\bباريس\b/g, replacement: 'بَارِيس' },
  { pattern: /\bابن النفيس\b/g, replacement: 'ابْنُ النَّفِيس' },
  { pattern: /\bالبيمارستان\b/g, replacement: 'البِيمَارِسْتَان' },
  { pattern: /\bفاروق جويدة\b/g, replacement: 'فَارُوق جُوَيْدَة' },
  { pattern: /\bكفر الشيخ\b/g, replacement: 'كَفْر الشَّيْخ' },
  { pattern: /\bإبراهيم ناجي\b/g, replacement: 'إِبْرَاهِيم نَاجِي' },
  { pattern: /\bجليلة رضا\b/g, replacement: 'جَلِيلَة رِضَا' },
  { pattern: /\bمشرفة\b/g, replacement: 'مُشَرَّفَة' },
  { pattern: /\bزكي مبارك\b/g, replacement: 'زَكِي مُبَارَك' },
  { pattern: /\bاليازجي\b/g, replacement: 'اليَازِجِي' },
  { pattern: /\bناصيف اليازجي\b/g, replacement: 'نَاصِيف اليَازِجِي' },
  { pattern: /\bالسوربون\b/g, replacement: 'السُّورْبُون' },
  { pattern: /\bسنتريس\b/g, replacement: 'سَنْتِرِيس' }
]

function enhanceArabicPhonetics(text) {
  if (!text) return ''
  let result = text
  for (const { pattern, replacement } of PHONETIC_MAP) {
    result = result.replace(pattern, replacement)
  }
  return result
}

// Dedicated Next.js Server Route for High-Quality Arabic Text-To-Speech
// Bypasses browser-missing voice packs, ResponsiveVoice quota/hangs, and CORS.
export async function GET(request) {
  try {
    const url = request?.url ? new URL(request.url) : null
    const rawText = url?.searchParams?.get('text') || ''
    const lang = url?.searchParams?.get('lang') || 'ar'

    // Clean text: remove HTML tags, limit length per chunk
    const cleanText = rawText.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()

    if (!cleanText) {
      // During Next.js static build export, return a valid 200 response so static generation passes
      return NextResponse.json({ status: 'ready', message: 'TTS Endpoint' }, { status: 200 })
    }

    // Enhance text with accurate phonetics and vowels for unambiguous pronunciation
    const vocalizedText = lang === 'ar' ? enhanceArabicPhonetics(cleanText) : cleanText

    // Google Translate TTS endpoint (high quality, natural Arabic pronunciation)
    // Max 200 characters per request
    const truncatedText = vocalizedText.slice(0, 200)
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(truncatedText)}`

    const response = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    })

    if (!response.ok) {
      return new NextResponse('Failed to synthesize speech', { status: response.status })
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=604800, immutable',
        'Content-Length': audioBuffer.byteLength.toString()
      }
    })
  } catch (err) {
    console.error('TTS Route Error:', err)
    return NextResponse.json({ status: 'error', message: 'Internal TTS Error' }, { status: 200 })
  }
}
