export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url)
    const text = url.searchParams.get('text')
    const lang = url.searchParams.get('lang') || 'ar'

    if (!text || text.trim().length === 0) {
      return new Response('Text is required', { status: 400 })
    }

    const sanitizedText = text.trim().slice(0, 200)
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(sanitizedText)}`

    const res = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    })

    if (!res.ok) {
      return new Response('Failed to fetch audio from TTS provider', { status: 502 })
    }

    const audioBuffer = await res.arrayBuffer()

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=604800, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 })
  }
}
