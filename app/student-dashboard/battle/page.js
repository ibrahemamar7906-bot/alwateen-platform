'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import styles from './battle.module.css'

export default function BattleArena() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  
  // Game States: 'lobby', 'searching', 'playing', 'finished'
  const [gameState, setGameState] = useState('lobby')
  const gameStateRef = useRef('lobby')
  
  const [opponent, setOpponent] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQIndex, setCurrentQIndex] = useState(0)
  
  const [myScore, setMyScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  
  const channelRef = useRef(null)
  const myChannelId = useRef(`battle_${Date.now()}_${Math.floor(Math.random() * 1000)}`)
  const isHost = useRef(false)

  const updateGameState = (newState) => {
    gameStateRef.current = newState
    setGameState(newState)
  }

  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setUser({ id: user.id, name: profile?.full_name || 'طالب' })
    }
    initUser()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [router])

  const getRandomQuestions = async () => {
    try {
      const { data: allQuestions } = await supabase.from('questions_bank').select('*').limit(30)
      if (allQuestions && allQuestions.length > 0) {
        const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
        return shuffled.slice(0, 5)
      }
    } catch (err) {
      console.error('Error fetching questions for battle:', err)
    }

    // Fallback questions if database bank is empty
    return [
      { question: 'ما هو جمع كلمة "طالب"؟', option_a: 'طلاب', option_b: 'طالبات', option_c: 'أطباء', option_d: 'علماء', correct_option: 'A' },
      { question: 'مضاد كلمة "النور" هو:', option_a: 'الظلام', option_b: 'الشمس', option_c: 'الضياء', option_d: 'الفجر', correct_option: 'A' },
      { question: 'مرادف كلمة "شجاع":', option_a: 'مقدام', option_b: 'جبان', option_c: 'ضعيف', option_d: 'خائف', correct_option: 'A' },
      { question: 'ما هي عاصمة جمهورية مصر العربية؟', option_a: 'القاهرة', option_b: 'الإسكندرية', option_c: 'الجيزة', option_d: 'أسوان', correct_option: 'A' },
      { question: 'الفاعل في الجملة الفعلية يكون دائماً:', option_a: 'مرفوعاً', option_b: 'منصوباً', option_c: 'مجروراً', option_d: 'مجزوماً', correct_option: 'A' }
    ]
  }

  const findMatch = async () => {
    updateGameState('searching')
    
    // Subscribe to a global matchmaking channel
    const lobbyChannel = supabase.channel('global_lobby')
    
    lobbyChannel.on('broadcast', { event: 'looking_for_match' }, async (payload) => {
      if (payload.payload.userId !== user.id && gameStateRef.current === 'searching') {
        // Someone else is looking! Let's invite them to our room.
        isHost.current = true
        
        // Fetch randomized questions
        const qData = await getRandomQuestions()
        
        if (lobbyChannel.state === 'joined') {
          lobbyChannel.send({
            type: 'broadcast',
            event: 'match_found',
            payload: {
              targetUserId: payload.payload.userId,
              roomId: myChannelId.current,
              hostInfo: user,
              questions: qData
            }
          }).catch(() => {})
        }
        
        setupBattleRoom(myChannelId.current, payload.payload.userInfo, qData)
        supabase.removeChannel(lobbyChannel)
      }
    })

    lobbyChannel.on('broadcast', { event: 'match_found' }, (payload) => {
      if (payload.payload.targetUserId === user.id && gameStateRef.current === 'searching') {
        // We got invited!
        isHost.current = false
        setupBattleRoom(payload.payload.roomId, payload.payload.hostInfo, payload.payload.questions)
        supabase.removeChannel(lobbyChannel)
      }
    })

    lobbyChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Broadcast that we are looking
        if (lobbyChannel.state === 'joined') {
          await lobbyChannel.send({
            type: 'broadcast',
            event: 'looking_for_match',
            payload: { userId: user.id, userInfo: user }
          }).catch(() => {})
        }
      }
    })
  }

  const setupBattleRoom = (roomId, oppInfo, qData) => {
    setOpponent(oppInfo)
    setQuestions(qData)
    
    const battleRoom = supabase.channel(roomId)
    channelRef.current = battleRoom

    battleRoom.on('broadcast', { event: 'score_update' }, (payload) => {
      if (payload.payload.userId === oppInfo.id) {
        setOpponentScore(payload.payload.score)
      }
    })

    battleRoom.on('broadcast', { event: 'next_question' }, (payload) => {
      setSelectedOption(null)
      setCurrentQIndex(payload.payload.index)
    })

    battleRoom.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        updateGameState('playing')
      }
    })
  }

  const handleAnswer = async (option) => {
    if (selectedOption) return // Already answered
    
    setSelectedOption(option)
    const currentQ = questions[currentQIndex]
    
    let newScore = myScore
    if (option === currentQ.correct_option) {
      newScore += 10
      setMyScore(newScore)
      
      // Broadcast my new score
      if (channelRef.current && channelRef.current.state === 'joined') {
        await channelRef.current.send({
          type: 'broadcast',
          event: 'score_update',
          payload: { userId: user.id, score: newScore }
        }).catch(() => {})
      }
    }

    // Wait a bit, then move to next question if host
    setTimeout(async () => {
      if (isHost.current) {
        const nextIdx = currentQIndex + 1
        if (nextIdx < questions.length) {
          setCurrentQIndex(nextIdx)
          setSelectedOption(null)
          if (channelRef.current && channelRef.current.state === 'joined') {
            await channelRef.current.send({
              type: 'broadcast',
              event: 'next_question',
              payload: { index: nextIdx }
            }).catch(() => {})
          }
        } else {
          endGame(newScore)
        }
      } else if (currentQIndex + 1 >= questions.length) {
        endGame(newScore)
      }
    }, 2000)
  }

  const endGame = async (finalScore) => {
    setGameState('finished')
    
    // Host saves the battle result
    if (isHost.current) {
      // Determine winner
      let winnerId = null;
      let xpGained = 0;
      if (finalScore > opponentScore) { winnerId = user.id; xpGained = 50; }
      else if (opponentScore > finalScore) { winnerId = opponent.id; xpGained = 50; }
      else { xpGained = 10; } // Draw gives 10 XP to both
      
      try {
        await supabase.from('battles').insert({
          player1_id: user.id,
          player2_id: opponent.id,
          winner_id: winnerId,
          score1: finalScore,
          score2: opponentScore
        })

        // Give XP and update level
        const updatePointsAndLevel = async (playerId, xp) => {
          const { data: profile } = await supabase.from('profiles').select('points').eq('id', playerId).single();
          if (profile) {
            const newPoints = (profile.points || 0) + xp;
            let newLevel = 'مبتدئ';
            if (newPoints >= 500) newLevel = 'متوسط';
            if (newPoints >= 1000) newLevel = 'متقدم';
            if (newPoints >= 2000) newLevel = 'خبير';
            await supabase.from('profiles').update({ points: newPoints, level: newLevel }).eq('id', playerId);
          }
        };

        if (winnerId) {
          await updatePointsAndLevel(winnerId, xpGained);
        } else {
          // Draw
          await updatePointsAndLevel(user.id, xpGained);
          await updatePointsAndLevel(opponent.id, xpGained);
        }
      } catch (err) {
        console.error("Error saving battle:", err)
      }
    }
  }

  if (!user) return <div className={styles.container}><div className={styles.loader}></div></div>

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        {gameState === 'lobby' && (
          <>
            <h1 style={{fontSize: '2.5rem', color: '#38bdf8', marginBottom: '20px'}}>⚔️ تحديات الوتين ⚔️</h1>
            <p style={{fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '30px', lineHeight: '1.6'}}>
              ادخل في تحدٍ مباشر مع طالب آخر في أسئلة عشوائية من بنك الأسئلة!<br/>
              الأسرع والأدق هو الفائز!
            </p>
            <button className={styles.btn} onClick={findMatch}>البحث عن منافس 🔍</button>
            <br />
            <button className={styles.btn} style={{background: 'transparent', border: '1px solid #475569', boxShadow: 'none', marginTop: '10px'}} onClick={() => router.push('/student-dashboard')}>عودة للوحة التحكم</button>
          </>
        )}

        {gameState === 'searching' && (
          <>
            <div className={styles.loader}></div>
            <h2>جاري البحث عن منافس في نفس مستواك...</h2>
            <p style={{color: '#94a3b8', marginTop: '10px'}}>يرجى الانتظار، لا تغلق الصفحة.</p>
          </>
        )}

        {gameState === 'playing' && questions.length > 0 && (
          <>
            <div className={styles.battleHeader}>
              <div className={styles.playerInfo}>
                <div style={{fontSize: '1.2rem'}}>{user.name} (أنت)</div>
                <div className={styles.score}>{myScore}</div>
              </div>
              <div className={styles.vs}>VS</div>
              <div className={styles.playerInfo}>
                <div style={{fontSize: '1.2rem'}}>{opponent.name}</div>
                <div className={styles.score}>{opponentScore}</div>
              </div>
            </div>

            <div className={styles.question}>
              السؤال {currentQIndex + 1} من {questions.length} <br/><br/>
              <strong>{questions[currentQIndex].question}</strong>
            </div>

            <div className={styles.optionsGrid}>
              {['A', 'B', 'C', 'D'].map((opt) => {
                const isSelected = selectedOption === opt
                const isCorrect = questions[currentQIndex].correct_option === opt
                let btnClass = styles.optionBtn
                
                if (selectedOption) {
                  if (isSelected && isCorrect) btnClass += ` ${styles.correct}`
                  else if (isSelected && !isCorrect) btnClass += ` ${styles.wrong}`
                  else if (isCorrect) btnClass += ` ${styles.correct}` // Reveal correct answer
                }

                return (
                  <button 
                    key={opt}
                    className={btnClass}
                    onClick={() => handleAnswer(opt)}
                    disabled={selectedOption !== null}
                  >
                    {opt === 'A' && questions[currentQIndex].option_a}
                    {opt === 'B' && questions[currentQIndex].option_b}
                    {opt === 'C' && questions[currentQIndex].option_c}
                    {opt === 'D' && questions[currentQIndex].option_d}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {gameState === 'finished' && (
          <>
            <h1 style={{fontSize: '3rem', marginBottom: '20px'}}>
              {myScore > opponentScore ? '🎉 لقد فزت! 🎉' : myScore < opponentScore ? '😔 حظ أوفر!' : '🤝 تعادل!'}
            </h1>
            <div className={styles.battleHeader} style={{borderBottom: 'none'}}>
              <div className={styles.playerInfo}>
                <div style={{fontSize: '1.2rem'}}>{user.name}</div>
                <div className={styles.score}>{myScore}</div>
              </div>
              <div className={styles.playerInfo}>
                <div style={{fontSize: '1.2rem'}}>{opponent.name}</div>
                <div className={styles.score}>{opponentScore}</div>
              </div>
            </div>
            
            <div style={{marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center'}}>
              <button className={styles.btn} onClick={() => window.location.reload()}>العب مرة أخرى 🔄</button>
              <button className={styles.btn} style={{background: '#475569'}} onClick={() => router.push('/student-dashboard')}>العودة</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
