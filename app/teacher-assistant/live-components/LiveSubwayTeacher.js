'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MousePointer2, Settings, Users, LogOut, CheckCircle, XCircle, Settings2, Play, RotateCcw, Crosshair } from 'lucide-react'
import { getEducationalQuestion } from '../../utils/questionBank'
import { normalizeQuestion, normalizeQuestions, loadActiveCustomQuestions, saveActiveCustomQuestions } from '../../utils/questionHelper'
import styles from '../../kids-corner/games/subway/page.module.css'
import QuestionManagerModal from '../../components/QuestionManagerModal'
import { removeBroadcastBinding } from '../../utils/realtimeHelper'

export default function LiveSubwayTeacher({ channel, activeControlDevices = [], devices = [], customQuestions: propCustomQuestions, setCustomQuestions: propSetCustomQuestions, specialty = null }) {
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
  const [gameState, setGameState] = useState('running') // running, trainApproaching, answering, jumping, hit, gameOver
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)

  const stateRef = useRef({
    score, lives, gameState, showQuestion, currentQuestion, selectedOption, subjectState, customQuestions
  })

  useEffect(() => {
    stateRef.current = { score, lives, gameState, showQuestion, currentQuestion, selectedOption, subjectState, customQuestions }
  }, [score, lives, gameState, showQuestion, currentQuestion, selectedOption, subjectState, customQuestions])

  // Sync questions from parent when specialty changes
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

  const generateQuestion = useCallback((explicitQuestions = null) => {
    const activeQs = explicitQuestions !== null ? explicitQuestions : stateRef.current.customQuestions;
    const { subjectState } = stateRef.current;
    
    if (activeQs && activeQs.length > 0) {
      const raw = activeQs[Math.floor(Math.random() * activeQs.length)];
      const normalized = normalizeQuestion(raw);
      if (normalized) {
        setCurrentQuestion(normalized);
        return normalized;
      }
    }

    const q = getEducationalQuestion(subjectState, 1);
    const normalized = normalizeQuestion(q);
    setCurrentQuestion(normalized);
    return normalized;
  }, []);

  const handleUpdateQuestions = useCallback((newQs) => {
    const normalized = newQs && newQs.length > 0 ? normalizeQuestions(newQs) : null;
    setCustomQuestions(normalized);
    stateRef.current.customQuestions = normalized;
    if (propSetCustomQuestions) {
      propSetCustomQuestions(normalized);
    }
    
    // Regenerate current question immediately
    const nextQ = generateQuestion(normalized);
    
    if (channel && channel.state === 'joined') {
      channel.send({
        type: 'broadcast',
        event: 'subway_state_sync',
        payload: { 
          score: stateRef.current.score, 
          lives: stateRef.current.lives, 
          gameState: stateRef.current.gameState, 
          showQuestion: stateRef.current.showQuestion, 
          currentQuestion: nextQ, 
          selectedOption: stateRef.current.selectedOption, 
          subjectState: stateRef.current.subjectState 
        }
      }).catch(console.error);
    }
  }, [channel, generateQuestion, propSetCustomQuestions]);

  // Sync prop changes
  useEffect(() => {
    if (propCustomQuestions !== undefined) {
      const normalized = propCustomQuestions ? normalizeQuestions(propCustomQuestions) : null;
      setCustomQuestions(normalized);
      stateRef.current.customQuestions = normalized;
    }
  }, [propCustomQuestions]);

  // Listen to global events
  useEffect(() => {
    const handleCustomEvent = (e) => {
      handleUpdateQuestions(e.detail);
    };

    const handleStorageEvent = (e) => {
      if (e.key === 'active_live_custom_questions') {
        const loaded = loadActiveCustomQuestions();
        handleUpdateQuestions(loaded);
      }
    };

    window.addEventListener('customQuestionsUpdated', handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('customQuestionsUpdated', handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [handleUpdateQuestions]);

  useEffect(() => {
    if (channel && channel.state === 'joined') {
      channel.send({
        type: 'broadcast',
        event: 'subway_state_sync',
        payload: { score, lives, gameState, showQuestion, currentQuestion, selectedOption, subjectState }
      }).catch(console.error)
    }
  }, [score, lives, gameState, showQuestion, currentQuestion, selectedOption, subjectState, channel])

  // Handle global sync request for reconnecting students
  useEffect(() => {
    if (!channel) return;
    const sendSync = () => {
      const s = stateRef.current;
      channel.send({
        type: 'broadcast',
        event: 'subway_state_sync',
        payload: {
          score: s.score,
          lives: s.lives,
          gameState: s.gameState,
          showQuestion: s.showQuestion,
          currentQuestion: s.currentQuestion,
          selectedOption: s.selectedOption,
          subjectState: s.subjectState
        }
      }).catch(console.error);
    };
    channel.on('broadcast', { event: 'global_sync_request' }, sendSync);
    window.addEventListener('on_global_sync_request', sendSync);
    return () => {
      removeBroadcastBinding(channel, 'global_sync_request', sendSync);
      window.removeEventListener('on_global_sync_request', sendSync);
    };
  }, [channel]);

  useEffect(() => {
    startNextCycle()
  }, [])

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
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.5, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'jump') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }
  }

  const startNextCycle = () => {
    setGameState('running')
    setShowQuestion(false)
    setSelectedOption(null)
    
    setTimeout(() => {
      setGameState('trainApproaching')
      setTimeout(() => {
        generateQuestion()
        setGameState('answering')
        setShowQuestion(true)
      }, 1000)
    }, 2000)
  }

  const handleAnswer = (option) => {
    const { currentQuestion, lives } = stateRef.current;
    if (!currentQuestion) return;

    setSelectedOption(option);
    const isCorrect = option === currentQuestion.answer;
    
    if (isCorrect) {
      playSound('correct');
      setTimeout(() => playSound('jump'), 300);
      setGameState('jumping');
      setScore(s => s + 10);
      
      setTimeout(() => {
        startNextCycle();
      }, 1500);
    } else {
      playSound('wrong');
      setGameState('hit');
      setLives(l => l - 1);
      
      setTimeout(() => {
        if (lives - 1 <= 0) {
          setGameState('gameOver');
        } else {
          startNextCycle();
        }
      }, 1500);
    }
  }

  useEffect(() => {
    if (!channel) return;
    const handleSubwayAction = ({ payload }) => {
      if (!payload) return;
      if (payload.action === 'answer') {
        handleAnswer(payload.option);
      }
    };
    channel.on('broadcast', { event: 'subway_action' }, handleSubwayAction);
    return () => {
      removeBroadcastBinding(channel, 'subway_action', handleSubwayAction);
    };
  }, [channel]);

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
            <span>🛹</span> <span>صب واي سيرفرز</span>
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

          <div style={{background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.8rem', fontWeight: 'bold'}}>
            🎯 {score} | {Array.from({length: 3}).map((_, i) => (i < lives ? '❤️' : '🖤')).join('')}
          </div>
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
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', height: '100%', minHeight: 0, borderRadius: '14px', border: '2px solid #e2e8f0', background: '#0f172a'}}>
        <div className={`${styles.container} ${isHit ? styles.shake : ''}`} style={{height: '100%', minHeight: 0, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
          
          <div className={styles.header}>
            <div className={styles.hearts}>
              {Array.from({length: 3}).map((_, i) => (
                <span key={i} style={{opacity: i < lives ? 1 : 0.3}}>❤️</span>
              ))}
            </div>
            <div className={styles.scoreBoard}>
              <span>{score}</span> 🏃‍♂️
            </div>
          </div>

          <div className={styles.gameArea} style={{height: '100%'}}>
            {/* Scenery & Floor */}
            <div className={`${styles.scenery} ${gameState === 'running' ? styles.sceneryScroling : ''}`}></div>
            <div className={`${styles.floor} ${gameState === 'running' ? styles.scrollingFast : ''}`}></div>

            {/* Coins during running phase */}
            {gameState === 'running' && (
              <div className={styles.coinsLayer}>
                <div className={styles.coin}></div>
                <div className={styles.coin}></div>
                <div className={styles.coin}></div>
              </div>
            )}

            {/* Question UI overlay */}
            {showQuestion && currentQuestion && gameState !== 'gameOver' && (
              <div className={styles.questionOverlay}>
                <div className={`${styles.questionCard} ${isHit ? styles.shakeError : ''}`}>
                  <div className={styles.questionText}>
                    {currentQuestion.text}
                  </div>
                  <div className={styles.optionsGrid}>
                    {currentQuestion.options.map((opt, idx) => {
                      let btnClass = styles.optionBtn;
                      if (selectedOption !== null) {
                        if (opt === selectedOption && opt !== currentQuestion.answer) btnClass += ` ${styles.wrong}`;
                        else if (opt === currentQuestion.answer && selectedOption === currentQuestion.answer) btnClass += ` ${styles.correct}`;
                      }
                      return (
                        <button 
                          key={idx} 
                          className={btnClass}
                          onClick={() => selectedOption === null && handleAnswer(opt)}
                          disabled={selectedOption !== null}
                        >
                          <span className={styles.optionNum}>{idx + 1}</span>
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Approaching Train */}
            <div className={`${styles.train} ${styles[gameState]}`}>
              <div className={styles.trainWindow}></div>
              <div className={styles.trainLight}></div>
            </div>

            {/* Player Character */}
            <div className={`${styles.character} ${styles['char_' + gameState]}`}>
              <div className={styles.head}><div className={styles.cap}></div></div>
              <div className={styles.body}></div>
              <div className={`${styles.arm} ${styles.armLeft}`}></div>
              <div className={`${styles.arm} ${styles.armRight}`}></div>
              <div className={`${styles.leg} ${styles.legLeft}`}></div>
              <div className={`${styles.leg} ${styles.legRight}`}></div>
            </div>
          </div>

          {/* Game Over Screen */}
          {gameState === 'gameOver' && (
            <div className={styles.gameOver}>
              <h1 className={styles.winnerText}>انتهت اللعبة!</h1>
              <p className={styles.gameOverScore}>النقاط: {score}</p>
              <button 
                className={styles.restartBtn}
                onClick={() => {
                  setScore(0); setLives(3); startNextCycle();
                }}
              >
                العب مرة أخرى 🔄
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
