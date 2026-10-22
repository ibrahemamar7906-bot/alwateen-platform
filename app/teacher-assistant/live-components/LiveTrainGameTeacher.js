'use client'

import { useState, useEffect, useRef } from 'react'
import { arabicLevels, englishLevels, mathLevels } from '../../utils/gameData'
import { removeBroadcastBinding } from '../../utils/realtimeHelper'

export default function LiveTrainGameTeacher({ channel, activeControlDevices = [], devices = [], specialty = null }) {
  const [subject, setSubject] = useState(() => {
    if (specialty === 'english') return 'english'
    if (specialty === 'math') return 'math'
    return 'arabic' // default for arabic or general
  })
  const [currentLevel, setCurrentLevel] = useState(0)
  const [placedLetter, setPlacedLetter] = useState(null)
  const [message, setMessage] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Teacher acts as the server. We keep track of the game state and broadcast it.
  const stateRef = useRef({ subject: 'arabic', currentLevel: 0, placedLetter: null, message: '', isCorrect: false, showConfetti: false })
  const activeControlDevicesRef = useRef(activeControlDevices)
  
  useEffect(() => {
    activeControlDevicesRef.current = activeControlDevices
  }, [activeControlDevices])

  useEffect(() => {
    let newSubject = 'arabic';
    if (specialty === 'english') newSubject = 'english';
    else if (specialty === 'math') newSubject = 'math';
    
    setSubject(newSubject);
    setCurrentLevel(0);
    setPlacedLetter(null);
    setMessage('');
    setIsCorrect(false);
    setShowConfetti(false);
    
    broadcastGameState({ 
      subject: newSubject, 
      currentLevel: 0, 
      placedLetter: null, 
      message: '', 
      isCorrect: false, 
      showConfetti: false 
    });
  }, [specialty]);

  const broadcastGameState = (newState) => {
    stateRef.current = { ...stateRef.current, ...newState }
    if (channel && channel.state === 'joined') {
      if (channel && channel.state === 'joined') channel.send({
        type: 'broadcast',
        event: 'game_state_update',
        payload: stateRef.current
      }).catch(e => console.error(e))
    }
  }

  // When a student joins, we must broadcast the current game state to them.
  // We can listen to `presence` `join` inside the main component and pass it down, or just re-broadcast on interval.
  // But wait, the main component already handles tool changes, so here we just listen to clicks from students.
  
  useEffect(() => {
    if (!channel) return

    let isMounted = true;

    const handleStudentClick = ({ payload }) => {
      if (!isMounted) return;
      // Validate that the click came from the active device
      if (!activeControlDevicesRef.current.includes(payload.deviceId)) return
      
      const { letter } = payload
      
      // Prevent further clicks if already correct
      if (stateRef.current.isCorrect) return

      let levels = arabicLevels;
      if (stateRef.current.subject === 'english') levels = englishLevels;
      if (stateRef.current.subject === 'math') levels = mathLevels;
      
      const levelData = levels[stateRef.current.currentLevel]
      
      if (letter === levelData.correct) {
        setPlacedLetter(letter)
        setMessage('إجابة صحيحة!')
        setIsCorrect(true)
        setShowConfetti(true)
        
        broadcastGameState({ placedLetter: letter, message: 'إجابة صحيحة!', isCorrect: true, showConfetti: true })

        // Auto move to next level after delay
        setTimeout(() => {
          if(stateRef.current.currentLevel + 1 < levels.length) {
            const nextLevel = stateRef.current.currentLevel + 1
            setCurrentLevel(nextLevel)
            setPlacedLetter(null)
            setMessage('')
            setIsCorrect(false)
            setShowConfetti(false)
            broadcastGameState({ currentLevel: nextLevel, placedLetter: null, message: '', isCorrect: false, showConfetti: false })
          } else {
            setMessage('انتهت المستويات!')
            broadcastGameState({ message: 'انتهت المستويات!' })
          }
        }, 3500)
      } else {
        setPlacedLetter(null)
        setMessage('إجابة خاطئة!')
        broadcastGameState({ placedLetter: letter, message: 'إجابة خاطئة!' }) // Show temporarily
        
        setTimeout(() => {
          if (!stateRef.current.isCorrect) {
            setPlacedLetter(null)
            setMessage('')
            broadcastGameState({ placedLetter: null, message: '' })
          }
        }, 1500)
      }
    }

    channel.on('broadcast', { event: 'game_click' }, handleStudentClick)
    
    // Auto broadcast current state when the teacher opens the game tool (if channel is joined)
    if (channel.state === 'joined') {
      broadcastGameState(stateRef.current)
    }
    
    // Handle late joiners requesting state globally
    const handleGlobalSync = () => broadcastGameState(stateRef.current)
    channel.on('broadcast', { event: 'global_sync_request' }, handleGlobalSync)
    window.addEventListener('on_global_sync_request', handleGlobalSync)

    return () => {
      isMounted = false;
      removeBroadcastBinding(channel, 'game_click', handleStudentClick);
      removeBroadcastBinding(channel, 'global_sync_request', handleGlobalSync);
      window.removeEventListener('on_global_sync_request', handleGlobalSync);
    }
  }, [channel])

  // Teacher UI for managing the game
  const changeSubject = (newSubject) => {
    setSubject(newSubject)
    setCurrentLevel(0)
    setPlacedLetter(null)
    setMessage('')
    setIsCorrect(false)
    setShowConfetti(false)
    broadcastGameState({ subject: newSubject, currentLevel: 0, placedLetter: null, message: '', isCorrect: false, showConfetti: false })
  }

  const nextLevelManual = () => {
    let levels = arabicLevels;
    if (subject === 'english') levels = englishLevels;
    if (subject === 'math') levels = mathLevels;
    if(currentLevel + 1 < levels.length) {
      const nextLvl = currentLevel + 1
      setCurrentLevel(nextLvl)
      setPlacedLetter(null)
      setMessage('')
      setIsCorrect(false)
      setShowConfetti(false)
      broadcastGameState({ currentLevel: nextLvl, placedLetter: null, message: '', isCorrect: false, showConfetti: false })
    }
  }

  let currentLevels = arabicLevels;
  if (subject === 'english') currentLevels = englishLevels;
  if (subject === 'math') currentLevels = mathLevels;
  const levelData = currentLevels[currentLevel]
  const activeStudentNames = (devices || [])
    .filter(d => activeControlDevices.includes(d.id || d.deviceId))
    .map(d => d.name)
    .join(', ') || 'أنت (المعلم)'

  return (
    <div style={{padding: 'clamp(6px, 1.5vw, 12px)', background: 'white', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', overflow: 'hidden', height: '100%', boxSizing: 'border-box'}}>
      
      <style>{`
        @keyframes bounceTrain {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatEmoji {
          0% { transform: translateY(20vh) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(-10vh) rotate(360deg) scale(1.5); opacity: 0; }
        }
        .correct-animation {
          animation: bounceTrain 0.5s ease infinite !important;
        }
      `}</style>

      {/* Confetti Effect */}
      {showConfetti && (
        <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100}}>
          {['🌟','🎈','🎉','✨','🏆','🚀','🎈','🎉','🌟','✨'].map((emoji, i) => (
            <div key={i} style={{
              position: 'absolute', 
              left: `${Math.random() * 100}%`,
              fontSize: '2rem',
              animation: `floatEmoji ${1.5 + Math.random()}s linear forwards`,
              animationDelay: `${Math.random() * 0.5}s`
            }}>
              {emoji}
            </div>
          ))}
        </div>
      )}

      {/* Sleek Compact Teacher Control Ribbon */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px', background: '#f8fafc', padding: '6px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', flexShrink: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap'}}>
          <div style={{fontWeight: 'bold', color: '#1e293b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px'}}>
            <span>🚂</span> <span>قطار الكلمات</span>
          </div>

          <div style={{display: 'flex', gap: '4px'}}>
            <button onClick={() => changeSubject('arabic')} style={{padding: '3px 8px', background: subject === 'arabic' ? '#3b82f6' : 'white', color: subject === 'arabic' ? 'white' : '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem'}}>عربي</button>
            <button onClick={() => changeSubject('english')} style={{padding: '3px 8px', background: subject === 'english' ? '#3b82f6' : 'white', color: subject === 'english' ? 'white' : '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem'}}>English</button>
            <button onClick={() => changeSubject('math')} style={{padding: '3px 8px', background: subject === 'math' ? '#3b82f6' : 'white', color: subject === 'math' ? 'white' : '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem'}}>حساب</button>
          </div>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap'}}>
          <div style={{background: activeControlDevices.length > 0 ? '#ecfdf5' : '#f1f5f9', color: activeControlDevices.length > 0 ? '#059669' : '#475569', padding: '3px 8px', borderRadius: '8px', border: activeControlDevices.length > 0 ? '1px solid #a7f3d0' : '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px'}}>
            🎮 تحكم اللعب: 
            <span style={{color: activeControlDevices.length > 0 ? '#047857' : '#1e293b'}}>{activeControlDevices.length > 0 ? activeStudentNames : 'أنت'}</span>
          </div>

          <div style={{background: '#fef3c7', color: '#d97706', padding: '3px 8px', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.75rem', fontWeight: 'bold'}}>
            مستوى {currentLevel + 1}/{currentLevels.length} | الحل: <span style={{color: '#2563eb'}}>{levelData.correct}</span>
          </div>

          <button onClick={nextLevelManual} style={{padding: '3px 8px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold'}} title="تخطي المستوى">
            تخطي ⏭️
          </button>
        </div>
      </div>
      
      {/* Train Display Area */}
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '15px', background: isCorrect ? '#d1fae5' : 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: '14px', textAlign: 'center', border: '2px solid #bfdbfe', overflow: 'hidden', minHeight: 0}}>
        
        {/* Train container */}
        <div key={currentLevel} style={{display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '20px', flexDirection: 'row-reverse', transform: 'scale(clamp(0.55, 1.2vw + 0.5, 0.9))', transformOrigin: 'center center', maxWidth: '100%'}}>
          {/* The Engine */}
          <div className={isCorrect ? 'correct-animation' : ''} style={{background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', width: '120px', minWidth: '120px', height: '110px', borderRadius: '20px 50px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', position: 'relative', boxShadow: '-5px 5px 15px rgba(5, 150, 105, 0.3)'}}>
            🚂
            <div style={{position: 'absolute', bottom: '-20px', display: 'flex', gap: '15px'}}>
              <div style={{width: '25px', height: '25px', background: '#1e293b', borderRadius: '50%', border: '3px solid #cbd5e1'}}></div>
              <div style={{width: '25px', height: '25px', background: '#1e293b', borderRadius: '50%', border: '3px solid #cbd5e1'}}></div>
            </div>
          </div>

          {/* Word Carriage */}
          <div className={isCorrect ? 'correct-animation' : ''} style={{background: 'linear-gradient(135deg, #34d399, #10b981)', color: 'white', padding: '0 30px', minWidth: '150px', height: '110px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', fontWeight: 'bold', position: 'relative', boxShadow: '-5px 5px 15px rgba(16, 185, 129, 0.3)', border: '4px solid white'}}>
            <div style={{display: 'flex', alignItems: 'center', direction: subject === 'arabic' ? 'rtl' : 'ltr'}}>
              <span style={{color: 'white'}}>{levelData.parts[0]}</span>
              <span style={{color: placedLetter ? (isCorrect ? '#064e3b' : '#ef4444') : '#fcd34d', margin: '0 2px'}}>
                {placedLetter || 'ـ؟ـ'}
              </span>
              <span style={{color: 'white'}}>{levelData.parts[1]}</span>
            </div>
            <div style={{position: 'absolute', bottom: '-20px', display: 'flex', gap: '40px'}}>
              <div style={{width: '25px', height: '25px', background: '#1e293b', borderRadius: '50%', border: '3px solid #cbd5e1'}}></div>
              <div style={{width: '25px', height: '25px', background: '#1e293b', borderRadius: '50%', border: '3px solid #cbd5e1'}}></div>
            </div>
          </div>
        </div>

        <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: isCorrect ? '#047857' : '#ef4444', minHeight: '30px'}}>{message}</div>
      </div>
    </div>
  )
}
