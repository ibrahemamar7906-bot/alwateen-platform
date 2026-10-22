'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getEducationalQuestion } from '../../utils/questionBank'
import { normalizeQuestion, normalizeQuestions, loadActiveCustomQuestions, saveActiveCustomQuestions } from '../../utils/questionHelper'
import QuestionManagerModal from '../../components/QuestionManagerModal'
import { removeBroadcastBinding } from '../../utils/realtimeHelper'

export default function LiveRacingTeacher({ channel, activeControlDevices = [], devices = [], customQuestions: propCustomQuestions, setCustomQuestions: propSetCustomQuestions, specialty = null }) {
  const [subjectState, setSubjectState] = useState(() => {
    if (specialty === 'arabic') return 'arabic'
    if (specialty === 'english') return 'english'
    return 'math'
  })
  const [showSettings, setShowSettings] = useState(false)
  const [customQuestions, setCustomQuestions] = useState(() => {
    if (propCustomQuestions && propCustomQuestions.length > 0) return normalizeQuestions(propCustomQuestions);
    return loadActiveCustomQuestions();
  })

  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameState, setGameState] = useState('waiting') // waiting, running, hit, gameOver
  const [activeCycle, setActiveCycle] = useState(null)
  const [carLane, setCarLane] = useState(1) // 0 = left, 1 = center, 2 = right

  const stateRef = useRef({ score, lives, gameState, activeCycle, carLane, subjectState, customQuestions })

  useEffect(() => {
    stateRef.current = { score, lives, gameState, activeCycle, carLane, subjectState, customQuestions }
  }, [score, lives, gameState, activeCycle, carLane, subjectState, customQuestions])

  useEffect(() => {
    if (propCustomQuestions && propCustomQuestions.length > 0) {
      setCustomQuestions(normalizeQuestions(propCustomQuestions))
    } else if (propCustomQuestions === null) {
      setCustomQuestions(null)
    }
  }, [propCustomQuestions])

  useEffect(() => {
    if (specialty === 'arabic') setSubjectState('arabic')
    else if (specialty === 'english') setSubjectState('english')
    else setSubjectState('math')
  }, [specialty])

  const generateNextCycle = useCallback((explicitQuestions = null) => {
    const activeQs = explicitQuestions !== null ? explicitQuestions : stateRef.current.customQuestions;
    const { subjectState } = stateRef.current;
    
    let raw;
    if (activeQs && activeQs.length > 0) {
      raw = activeQs[Math.floor(Math.random() * activeQs.length)];
    } else {
      raw = getEducationalQuestion(subjectState, 1);
    }
    
    const normalized = normalizeQuestion(raw);
    if (!normalized) return null;

    const shuffledWrong = [...normalized.wrong].sort(() => 0.5 - Math.random());
    const pickedWrong = shuffledWrong.slice(0, 2);
    
    const chosenOptions = [
      { text: normalized.correct, isCorrect: true },
      { text: pickedWrong[0], isCorrect: false },
    ];
    if (pickedWrong.length > 1) {
      chosenOptions.push({ text: pickedWrong[1], isCorrect: false });
    } else {
      chosenOptions.push({ text: 'خطأ', isCorrect: false });
    }

    chosenOptions.sort(() => 0.5 - Math.random());

    return {
      id: Date.now(),
      questionText: normalized.question,
      lanes: chosenOptions.map((opt, idx) => ({ ...opt, laneIndex: idx })),
      startTime: Date.now() + 1000,
      duration: 6000
    };
  }, []);

  const handleUpdateQuestions = useCallback((newQs) => {
    const normalized = newQs && newQs.length > 0 ? normalizeQuestions(newQs) : null;
    setCustomQuestions(normalized);
    stateRef.current.customQuestions = normalized;
    if (propSetCustomQuestions) {
      propSetCustomQuestions(normalized);
    }
  }, [propSetCustomQuestions]);

  useEffect(() => {
    const handleCustomEvent = (e) => handleUpdateQuestions(e.detail);
    const handleStorageEvent = (e) => {
      if (e.key === 'active_live_custom_questions') {
        handleUpdateQuestions(loadActiveCustomQuestions());
      }
    };
    window.addEventListener('customQuestionsUpdated', handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('customQuestionsUpdated', handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [handleUpdateQuestions]);

  const broadcastState = useCallback(() => {
    if (channel && channel.state === 'joined') {
      channel.send({
        type: 'broadcast',
        event: 'racing_state_sync',
        payload: { 
          score: stateRef.current.score, 
          lives: stateRef.current.lives, 
          gameState: stateRef.current.gameState, 
          activeCycle: stateRef.current.activeCycle,
          carLane: stateRef.current.carLane,
          subjectState: stateRef.current.subjectState 
        }
      }).catch(console.error)
    }
  }, [channel])

  useEffect(() => {
    broadcastState();
  }, [score, lives, gameState, activeCycle, carLane, subjectState, broadcastState])

  useEffect(() => {
    if (!channel) return;
    channel.on('broadcast', { event: 'global_sync_request' }, broadcastState);
    window.addEventListener('on_global_sync_request', broadcastState);
    return () => {
      removeBroadcastBinding(channel, 'global_sync_request', broadcastState);
      window.removeEventListener('on_global_sync_request', broadcastState);
    }
  }, [channel, broadcastState]);

  const playSound = (type) => {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (type === 'correct') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.5, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'wrong' || type === 'explosion') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.5, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    }
  }

  const startNextCycle = useCallback(() => {
    setGameState('running');
    const cycle = generateNextCycle();
    setActiveCycle(cycle);
  }, [generateNextCycle]);

  useEffect(() => {
    if (gameState !== 'running' || !activeCycle) return;

    const evalTime = activeCycle.startTime + activeCycle.duration;
    const timeUntilEval = evalTime - Date.now();

    const evaluateCollision = () => {
      const currentLane = stateRef.current.carLane;
      const targetOption = activeCycle.lanes.find(l => l.laneIndex === currentLane);
      
      if (targetOption && targetOption.isCorrect) {
        playSound('correct');
        setScore(s => s + 1);
        startNextCycle();
      } else {
        playSound('explosion');
        setGameState('hit');
        setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) {
            setTimeout(() => setGameState('gameOver'), 1000);
          } else {
            setTimeout(() => startNextCycle(), 2000);
          }
          return newLives;
        });
      }
    };

    if (timeUntilEval <= 0) {
      evaluateCollision();
      return;
    }

    const timerId = setTimeout(evaluateCollision, timeUntilEval);
    return () => clearTimeout(timerId);
  }, [gameState, activeCycle, startNextCycle]);

  useEffect(() => {
    if (!channel) return;
    const handleAction = ({ payload }) => {
      if (!payload) return;
      if (payload.action === 'move') {
        setCarLane(payload.lane);
      }
    };
    channel.on('broadcast', { event: 'racing_action' }, handleAction);
    const customListener = (e) => handleAction(e.detail);
    window.addEventListener('on_racing_action', customListener);
    
    return () => {
      removeBroadcastBinding(channel, 'racing_action', handleAction);
      window.removeEventListener('on_racing_action', customListener);
    }
  }, [channel]);

  const startGame = () => {
    setScore(0)
    setLives(3)
    setCarLane(1)
    startNextCycle()
  }

  const handleManualMove = (lane) => {
    if (gameState !== 'running') return;
    setCarLane(lane);
    if (channel && channel.state === 'joined') {
      channel.send({ type: 'broadcast', event: 'racing_action', payload: { action: 'move', lane } }).catch(console.error);
    }
  }

  const isHit = gameState === 'hit';
  const activeStudentNames = (devices || [])
    .filter(d => (activeControlDevices || []).includes(d.id || d.deviceId))
    .map(d => d.name)
    .join(', ') || 'أنت (المعلم)'

  return (
    <div style={{padding: 'clamp(6px, 1.5vw, 12px)', background: 'white', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', overflow: 'hidden', height: '100%', boxSizing: 'border-box'}}>
      
      {/* Sleek Compact Teacher Ribbon */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px', background: '#f8fafc', padding: '6px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', flexShrink: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
          <div style={{fontWeight: 'bold', color: '#1e293b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px'}}>
            <span>🏎️</span> <span>سباق السيارات</span>
          </div>

          <select value={subjectState} onChange={(e) => setSubjectState(e.target.value)} style={{padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer'}}>
            <option value="math">رياضيات 🔢</option>
            <option value="arabic">عربي 🔤</option>
            <option value="english">إنجليزي 🔠</option>
          </select>
          
          <button 
            onClick={() => setShowSettings(true)} 
            style={{
              padding: '4px 10px', 
              background: customQuestions && customQuestions.length > 0 ? '#10b981' : '#eff6ff', 
              color: customQuestions && customQuestions.length > 0 ? 'white' : '#1d4ed8', 
              border: customQuestions && customQuestions.length > 0 ? '1px solid #059669' : '1px solid #bfdbfe', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 'bold', 
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>⚙️</span>
            <span>{customQuestions && customQuestions.length > 0 ? `الأسئلة (${customQuestions.length})` : 'أسئلة مخصصة'}</span>
          </button>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap'}}>
          <div style={{background: (activeControlDevices || []).length > 0 ? '#ecfdf5' : '#f1f5f9', color: (activeControlDevices || []).length > 0 ? '#059669' : '#475569', padding: '4px 10px', borderRadius: '8px', border: (activeControlDevices || []).length > 0 ? '1px solid #a7f3d0' : '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px'}}>
            🎮 تحكم اللعب:
            <span style={{color: (activeControlDevices || []).length > 0 ? '#047857' : '#1e293b'}}>{(activeControlDevices || []).length > 0 ? activeStudentNames : 'أنت'}</span>
          </div>

          <button onClick={startGame} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            بدء السباق 🏁
          </button>
        </div>
      </div>

      {showSettings && (
        <QuestionManagerModal 
          customQuestions={customQuestions} 
          setCustomQuestions={handleUpdateQuestions} 
          onClose={() => setShowSettings(false)} 
        />
      )}

      {/* Game Area */}
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', height: '100%', minHeight: 0, borderRadius: '14px', border: '2px solid #e2e8f0', background: '#22c55e'}}>
        
        {/* Sky / Question Banner */}
        <div style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', zIndex: 40, width: '90%', maxWidth: '400px' }}>
          {activeCycle && (
            <div style={{ background: 'rgba(255,255,255,0.95)', padding: '15px 20px', borderRadius: '16px', border: '4px solid #10b981', fontSize: '1.2rem', fontWeight: 900, color: '#064e3b', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', textAlign: 'center' }}>
              {activeCycle.questionText}
            </div>
          )}
        </div>

        {/* 3-Lane Road */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '500px', background: '#334155', display: 'flex', borderLeft: '5px solid #cbd5e1', borderRight: '5px solid #cbd5e1', overflow: 'hidden' }}>
          
          {/* Road markings (moving effect) */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', pointerEvents: 'none' }}>
            <div style={{ flex: 1, borderRight: '6px dashed rgba(255,255,255,0.4)', animation: gameState === 'running' ? 'roadMove 0.5s linear infinite' : 'none' }}></div>
            <div style={{ flex: 1, borderRight: '6px dashed rgba(255,255,255,0.4)', animation: gameState === 'running' ? 'roadMove 0.5s linear infinite' : 'none' }}></div>
            <div style={{ flex: 1 }}></div>
          </div>

          <style>{`
            @keyframes roadMove {
              0% { transform: translateY(-50px); }
              100% { transform: translateY(0); }
            }
          `}</style>

          {/* Clickable Lane Overlays */}
          <div onClick={() => handleManualMove(0)} style={{ flex: 1, position: 'relative', cursor: 'pointer', zIndex: 10 }}></div>
          <div onClick={() => handleManualMove(1)} style={{ flex: 1, position: 'relative', cursor: 'pointer', zIndex: 10 }}></div>
          <div onClick={() => handleManualMove(2)} style={{ flex: 1, position: 'relative', cursor: 'pointer', zIndex: 10 }}></div>

          {/* Obstacles */}
          <ObstaclesRenderer activeCycle={activeCycle} gameState={gameState} />

          {/* Car */}
          <div style={{
            position: 'absolute', bottom: '20px', left: `${16.66 + (carLane * 33.33)}%`,
            width: '60px', height: '100px', background: isHit ? '#ef4444' : '#3b82f6',
            borderRadius: '12px', border: '3px solid #1e3a8a',
            transform: 'translateX(-50%)',
            transition: 'left 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
            zIndex: 30, boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
          }}>
            {isHit ? '💥' : '🏎️'}
          </div>
        </div>

        {/* HUD (Lives & Score) */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ background: 'rgba(0,0,0,0.5)', padding: '5px 12px', borderRadius: '20px', display: 'flex', gap: '4px' }}>
            {Array.from({length: 3}).map((_, i) => (
              <span key={i} style={{ opacity: i < lives ? 1 : 0.3, fontSize: '1.2rem' }}>❤️</span>
            ))}
          </div>
          <div style={{ background: 'rgba(0,0,0,0.5)', padding: '5px 12px', borderRadius: '20px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2rem' }}>
            {score} 🏃‍♂️
          </div>
        </div>

        {/* Game Over Screen */}
        {gameState === 'gameOver' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <h1 style={{ fontSize: '3rem', margin: 0, color: '#ef4444' }}>انتهت اللعبة!</h1>
            <p style={{ fontSize: '2rem', margin: '10px 0 30px' }}>النقاط: {score}</p>
            <button 
              style={{ background: '#10b981', color: 'white', border: 'none', padding: '15px 30px', fontSize: '1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={startGame}
            >
              العب مرة أخرى 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const ObstaclesRenderer = ({ activeCycle, gameState }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (gameState !== 'running' || !activeCycle) {
      if (gameState === 'hit') setProgress(1);
      return;
    }
    let raf;
    const loop = () => {
      let p = (Date.now() - activeCycle.startTime) / activeCycle.duration;
      if (p > 1) p = 1;
      if (p < 0) p = 0;
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [gameState, activeCycle]);

  if (!activeCycle) return null;

  return (
    <>
      {activeCycle.lanes.map((laneObj) => {
        return (
          <div key={laneObj.laneIndex} style={{
            position: 'absolute',
            top: `calc(${progress * 100}% - 50px)`,
            left: `${16.66 + (laneObj.laneIndex * 33.33)}%`,
            transform: 'translate(-50%, 0)',
            background: '#fef3c7', border: '3px solid #d97706', borderRadius: '12px',
            padding: '10px', width: '80%', maxWidth: '120px', textAlign: 'center',
            fontSize: '1.1rem', fontWeight: 900, color: '#92400e',
            zIndex: 20, boxShadow: '0 8px 15px rgba(0,0,0,0.3)'
          }}>
            {laneObj.text}
          </div>
        );
      })}
    </>
  );
}
