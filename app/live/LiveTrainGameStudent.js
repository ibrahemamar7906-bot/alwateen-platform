'use client'

import { useState, useEffect } from 'react'
import { arabicLevels, englishLevels, mathLevels } from '../utils/gameData'

export default function LiveTrainGameStudent({ channel, hasControl, deviceId }) {
  const [gameState, setGameState] = useState({
    subject: 'arabic',
    currentLevel: 0,
    placedLetter: null,
    message: '',
    isCorrect: false,
    showConfetti: false
  })

  useEffect(() => {
    if (!channel) return
    
    let isMounted = true;

    const handleStateUpdate = ({ payload }) => {
      if (!isMounted) return;
      setGameState(prev => ({ ...prev, ...payload }))
    }

    const customHandler = (e) => handleStateUpdate({ payload: e.detail })
    window.addEventListener('on_game_state_update', customHandler)

    // Request initial state on mount if channel is joined
    if (channel && channel.state === 'joined') {
      channel.send({ type: 'broadcast', event: 'global_sync_request', payload: {} }).catch(() => {});
    }

    return () => {
      isMounted = false;
      window.removeEventListener('on_game_state_update', customHandler)
    }
  }, [channel])

  const handleLetterClick = (letter) => {
    if (!hasControl || gameState.isCorrect) return
    
    // Broadcast click to teacher
    if (channel && channel.state === 'joined') {
      channel.send({
        type: 'broadcast',
        event: 'game_click',
        payload: { letter, deviceId }
      }).catch(e => console.error(e))
    }
  }

  let levels = arabicLevels;
  if (gameState.subject === 'english') levels = englishLevels;
  if (gameState.subject === 'math') levels = mathLevels;
  
  const levelData = levels[gameState.currentLevel]

  if (!levelData) {
    return <div style={{padding: '50px', textAlign: 'center'}}>جاري التحميل...</div>
  }

  return (
    <div style={{width: '100%', height: '100%', minHeight: 0, background: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)', padding: 'clamp(8px, 2vh, 15px)', textAlign: 'center', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', overscrollBehavior: 'none', touchAction: 'none'}}>
      
      <style>{`
        @keyframes bounceTrain {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes moveTrain {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0); }
        }
        @keyframes floatEmoji {
          0% { transform: translateY(100dvh) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(-10vh) rotate(360deg) scale(1.5); opacity: 0; }
        }
        .correct-animation {
          animation: bounceTrain 0.5s ease infinite !important;
        }
        .train-enter {
          animation: moveTrain 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>

      {/* Confetti Effect */}
      {gameState.showConfetti && (
        <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100}}>
          {['🌟','🎈','🎉','✨','🏆','🚀','🎈','🎉','🌟','✨'].map((emoji, i) => (
            <div key={i} style={{
              position: 'absolute', 
              left: `${Math.random() * 100}%`,
              fontSize: '2.5rem',
              animation: `floatEmoji ${1.5 + Math.random()}s linear forwards`,
              animationDelay: `${Math.random() * 0.5}s`
            }}>
              {emoji}
            </div>
          ))}
        </div>
      )}

      <div>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '6px'}}>
          <span style={{fontSize: 'clamp(1.4rem, 3vw, 2rem)'}}>🚂</span>
          <h2 style={{color: 'var(--primary-dark)', margin: 0, fontSize: 'clamp(1.2rem, 3vw, 1.8rem)'}}>قطار الكلمات</h2>
          <span style={{fontSize: 'clamp(1.4rem, 3vw, 2rem)'}}>🚂</span>
        </div>
        <h3 style={{color: '#475569', margin: 0, fontSize: 'clamp(0.95rem, 2vw, 1.2rem)'}}>أكمل الكلمة بالحرف الناقص يا بطل:</h3>
      </div>
      
      {/* Train container */}
      <div key={gameState.currentLevel} className="train-enter" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', margin: '10px 0', flexDirection: 'row-reverse', maxWidth: '95vw'}}>
        
        {/* The Engine */}
        <div className={gameState.isCorrect ? 'correct-animation' : ''} style={{background: 'var(--primary-gradient)', color: 'white', width: 'clamp(80px, 18vw, 120px)', height: 'clamp(70px, 14vh, 100px)', borderRadius: '15px 40px 15px 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(2.5rem, 6vw, 3.8rem)', position: 'relative', boxShadow: '-5px 5px 15px rgba(5, 150, 105, 0.3)', flexShrink: 0}}>
          🚂
          <div style={{position: 'absolute', bottom: '-15px', display: 'flex', gap: '10px'}}>
            <div style={{width: '20px', height: '20px', background: '#1e293b', borderRadius: '50%', border: '2px solid #cbd5e1'}}></div>
            <div style={{width: '20px', height: '20px', background: '#1e293b', borderRadius: '50%', border: '2px solid #cbd5e1'}}></div>
          </div>
        </div>

        {/* Word Carriage */}
        <div className={gameState.isCorrect ? 'correct-animation' : ''} style={{background: 'linear-gradient(135deg, #34d399, #10b981)', color: 'white', padding: '0 clamp(10px, 3vw, 25px)', minWidth: 'clamp(120px, 30vw, 200px)', height: 'clamp(70px, 14vh, 100px)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', fontWeight: 'bold', position: 'relative', boxShadow: '-5px 5px 15px rgba(16, 185, 129, 0.3)', border: '3px solid white'}}>
          <div style={{display: 'flex', alignItems: 'center', direction: gameState.subject === 'arabic' ? 'rtl' : 'ltr'}}>
            <span style={{color: 'white'}}>{levelData.parts[0]}</span>
            <span style={{color: gameState.placedLetter ? (gameState.isCorrect ? '#064e3b' : '#ef4444') : '#fcd34d', margin: '0 2px'}}>
              {gameState.placedLetter || 'ـ؟ـ'}
            </span>
            <span style={{color: 'white'}}>{levelData.parts[1]}</span>
          </div>
          <div style={{position: 'absolute', bottom: '-15px', display: 'flex', gap: '25px'}}>
            <div style={{width: '20px', height: '20px', background: '#1e293b', borderRadius: '50%', border: '2px solid #cbd5e1'}}></div>
            <div style={{width: '20px', height: '20px', background: '#1e293b', borderRadius: '50%', border: '2px solid #cbd5e1'}}></div>
          </div>
        </div>
      </div>

      <div style={{minHeight: '28px', fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontWeight: 'bold', color: gameState.isCorrect ? '#10b981' : '#ef4444', textShadow: '1px 1px 0px rgba(0,0,0,0.1)'}}>
        {gameState.message}
      </div>

      {/* Options */}
      <div style={{display: 'flex', justifyContent: 'center', gap: 'clamp(8px, 2vw, 15px)', flexWrap: 'wrap', maxWidth: '95vw', paddingBottom: 'env(safe-area-inset-bottom, 0px)'}}>
        {levelData.options.map(opt => (
          <button 
            key={opt}
            onClick={() => handleLetterClick(opt)}
            disabled={!hasControl || gameState.isCorrect}
            style={{
              background: 'linear-gradient(to bottom, #ffffff, #f1f5f9)',
              border: '3px solid #94a3b8',
              borderRadius: '16px',
              width: 'clamp(52px, 12vw, 68px)',
              height: 'clamp(52px, 12vw, 68px)',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 'bold',
              color: '#334155',
              cursor: (!hasControl || gameState.isCorrect) ? 'not-allowed' : 'pointer',
              transition: 'transform 0.1s, box-shadow 0.1s',
              boxShadow: '0 4px 0 #94a3b8, 0 8px 10px rgba(0,0,0,0.1)',
              opacity: (!hasControl && !gameState.isCorrect) ? 0.7 : 1
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
