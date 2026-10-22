'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../../utils/supabase'
import styles from './page.module.css'
import { LogOut } from 'lucide-react'

export default function StudentPresentationView() {
  const [step, setStep] = useState('join') // join | live
  const [roomCode, setRoomCode] = useState('')
  const [studentName, setStudentName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Live State
  const [room, setRoom] = useState(null)
  const [deck, setDeck] = useState(null)

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!roomCode.trim() || !studentName.trim()) {
      setError('الرجاء إدخال كود الغرفة واسمك')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Find active room
      const { data: roomData, error: roomErr } = await supabase
        .from('live_rooms')
        .select('*')
        .eq('room_code', roomCode.trim())
        .eq('is_active', true)
        .single()
      
      if (roomErr || !roomData) {
        throw new Error('كود الغرفة غير صحيح أو البث منتهي')
      }

      setRoom(roomData)

      // 2. Fetch Deck
      const { data: deckData, error: deckErr } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('id', roomData.deck_id)
        .single()
      
      if (deckErr || !deckData) {
        // If RLS blocked it or it's missing
        console.error(deckErr)
        throw new Error('لا يمكن جلب البطاقات (برجاء إبلاغ المعلم بتحديث صلاحيات العرض)')
      }

      setDeck(deckData)
      setStep('live')
      subscribeToRoom(roomData.id)

    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToRoom = (roomId) => {
    const channel = supabase.channel(`room_${roomId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'live_rooms', 
        filter: `id=eq.${roomId}` 
      }, (payload) => {
        const newRoomState = payload.new
        setRoom(newRoomState)
        
        // If teacher ended session
        if (!newRoomState.is_active) {
          alert('قام المعلم بإنهاء البث المباشر')
          handleLeave()
        }
      })
      .subscribe()
      
    window.currentLiveChannel = channel
  }

  const handleLeave = () => {
    if (window.currentLiveChannel) {
      supabase.removeChannel(window.currentLiveChannel)
    }
    setStep('join')
    setRoomCode('')
    setRoom(null)
    setDeck(null)
  }

  useEffect(() => {
    return () => {
      if (window.currentLiveChannel) {
        supabase.removeChannel(window.currentLiveChannel)
      }
    }
  }, [])

  if (step === 'join') {
    return (
      <div className={styles.container}>
        <Head>
          <title>الانضمام للحصة المباشرة</title>
        </Head>
        
        <main className={styles.joinScreen}>
          <div className={styles.joinCard}>
            <div className={styles.logo}>🎓</div>
            <h1 className={styles.title}>الحصة التفاعلية المباشرة</h1>
            <p className={styles.subtitle}>أدخل كود الغرفة الذي أعطاه لك المعلم لتنضم فوراً</p>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleJoin}>
              <input 
                type="text" 
                className={styles.input}
                placeholder="كود الغرفة (مثال: 123456)" 
                value={roomCode}
                onChange={e => setRoomCode(e.target.value)}
                maxLength={6}
              />
              <input 
                type="text" 
                className={styles.input}
                placeholder="اسمك الثلاثي" 
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
              />
              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? 'جاري الاتصال...' : 'انضمام للبث 🚀'}
              </button>
            </form>
          </div>
        </main>
      </div>
    )
  }

  // LIVE VIEW
  const currentCard = deck?.cards[room?.current_slide_index || 0]

  return (
    <div className={styles.liveScreen}>
      <Head>
        <title>بث مباشر | {deck?.title}</title>
      </Head>

      <header className={styles.liveHeader}>
        <div style={{ fontWeight: 'bold' }}>{deck?.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span className={styles.studentName}>👤 {studentName}</span>
          <button onClick={handleLeave} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="مغادرة البث">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className={styles.mainArea}>
        {currentCard ? (
          <div className={`${styles.flashcard} ${room?.is_flipped ? styles.flipped : ''}`}>
            <div className={styles.flashcardInner}>
              <div className={styles.flashcardFront}>
                {currentCard.front}
              </div>
              <div className={styles.flashcardBack}>
                {currentCard.back}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.waitingBox}>
            <div className={styles.loader}></div>
            <h2>في انتظار المعلم...</h2>
            <p>الشاشة ستتحدث تلقائياً بمجرد بدء المعلم للدرس.</p>
          </div>
        )}
      </main>
    </div>
  )
}
