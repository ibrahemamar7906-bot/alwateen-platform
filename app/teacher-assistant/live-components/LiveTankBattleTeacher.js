'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MousePointer2, LogOut, Swords, Target, Crosshair, Users, Crown, Settings } from 'lucide-react'
import { getEducationalQuestion } from '../../utils/questionBank'
import { normalizeQuestion, normalizeQuestions, loadActiveCustomQuestions, saveActiveCustomQuestions } from '../../utils/questionHelper'
import styles from '../../kids-corner/games/tank-battle/page.module.css'
import QuestionManagerModal from '../../components/QuestionManagerModal'
import { removeBroadcastBinding } from '../../utils/realtimeHelper'

export default function LiveTankBattleTeacher({ channel, devices, customQuestions: propCustomQuestions, setCustomQuestions: propSetCustomQuestions, specialty = null }) {
  const [subject, setSubject] = useState(() => {
    if (specialty === 'arabic') return 'arabic'
    if (specialty === 'english') return 'english'
    return 'math'
  })
  const [showSettings, setShowSettings] = useState(false)
  const [customQuestions, setCustomQuestions] = useState(() => {
    if (propCustomQuestions && propCustomQuestions.length > 0) return normalizeQuestions(propCustomQuestions);
    return loadActiveCustomQuestions();
  })

  // 1v1 State
  const [player1Id, setPlayer1Id] = useState('teacher') // Blue
  const [player2Id, setPlayer2Id] = useState('') // Red

  // Game States
  const [healthP1, setHealthP1] = useState(100)
  const [healthP2, setHealthP2] = useState(100)
  const [qP1, setQP1] = useState(null)
  const [qP2, setQP2] = useState(null)

  // FX States
  const [p1Firing, setP1Firing] = useState(false)
  const [p2Firing, setP2Firing] = useState(false)
  const [p1Miss, setP1Miss] = useState(false)
  const [p2Miss, setP2Miss] = useState(false)
  const [explosionP1, setExplosionP1] = useState(false)
  const [explosionP2, setExplosionP2] = useState(false)
  const [shake, setShake] = useState(false)
  const [gameOver, setGameOver] = useState(null)

  // Refs for current state inside listeners
  const stateRef = useRef({
    healthP1, healthP2, qP1, qP2, gameOver, subject, customQuestions, player1Id, player2Id
  })

  useEffect(() => {
    stateRef.current = { healthP1, healthP2, qP1, qP2, gameOver, subject, customQuestions, player1Id, player2Id }
  }, [healthP1, healthP2, qP1, qP2, gameOver, subject, customQuestions, player1Id, player2Id])

  // Sync questions from parent when specialty changes
  useEffect(() => {
    if (propCustomQuestions && propCustomQuestions.length > 0) {
      setCustomQuestions(normalizeQuestions(propCustomQuestions))
    } else if (propCustomQuestions === null) {
      setCustomQuestions(null)
    }
  }, [propCustomQuestions])

  useEffect(() => {
    if (specialty === 'arabic') setSubject('arabic')
    else if (specialty === 'english') setSubject('english')
    else setSubject('math')
  }, [specialty])

  const generateSingleQuestion = useCallback((explicitQuestions = null) => {
    const activeQs = explicitQuestions !== null ? explicitQuestions : stateRef.current.customQuestions;
    const { subject } = stateRef.current;
    
    if (activeQs && activeQs.length > 0) {
      const selected = activeQs[Math.floor(Math.random() * activeQs.length)];
      const normalized = normalizeQuestion(selected);
      if (normalized) {
        return { text: normalized.text, answer: normalized.answer, options: normalized.options, status: null };
      }
    }

    const q = getEducationalQuestion(subject, 1);
    const normalized = normalizeQuestion(q);
    return { text: normalized.text, answer: normalized.answer, options: normalized.options, status: null };
  }, []);

  const generateQuestion = useCallback((player, explicitQuestions = null) => {
    const questionObj = generateSingleQuestion(explicitQuestions);
    if (player === 1) setQP1(questionObj);
    else setQP2(questionObj);
    return questionObj;
  }, [generateSingleQuestion]);

  const handleUpdateQuestions = useCallback((newQs) => {
    const normalized = newQs && newQs.length > 0 ? normalizeQuestions(newQs) : null;
    setCustomQuestions(normalized);
    stateRef.current.customQuestions = normalized;
    if (propSetCustomQuestions) {
      propSetCustomQuestions(normalized);
    }

    // Immediately regenerate questions for both players!
    const newQP1 = generateQuestion(1, normalized);
    const newQP2 = generateQuestion(2, normalized);

    if (channel && channel.state === 'joined') {
      if (channel && channel.state === 'joined') channel.send({
        type: 'broadcast',
        event: 'tank_state_sync',
        payload: {
          healthP1: stateRef.current.healthP1, 
          healthP2: stateRef.current.healthP2, 
          qP1: newQP1, 
          qP2: newQP2, 
          p1Firing: false, p2Firing: false, p1Miss: false, p2Miss: false, 
          explosionP1: false, explosionP2: false, shake: false, gameOver: stateRef.current.gameOver,
          player1Id: stateRef.current.player1Id, player2Id: stateRef.current.player2Id, subject: stateRef.current.subject
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

  // Global events listener
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
    } else if (type === 'shoot') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square'; osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }
  }

  // Broadcast sync
  useEffect(() => {
    if (channel && channel.state === 'joined') {
      if (channel && channel.state === 'joined') channel.send({
        type: 'broadcast',
        event: 'tank_state_sync',
        payload: {
          healthP1, healthP2, qP1, qP2, 
          p1Firing, p2Firing, p1Miss, p2Miss, 
          explosionP1, explosionP2, shake, gameOver,
          player1Id, player2Id, subject
        }
      }).catch(console.error)
    }
  }, [healthP1, healthP2, qP1, qP2, p1Firing, p2Firing, p1Miss, p2Miss, explosionP1, explosionP2, shake, gameOver, player1Id, player2Id, subject, channel])

  // Handle late joiners or reconnecting students requesting state
  useEffect(() => {
    if (!channel) return;
    const sendSync = () => {
      const state = stateRef.current;
      channel.send({
        type: 'broadcast',
        event: 'tank_state_sync',
        payload: {
          healthP1: state.healthP1, healthP2: state.healthP2, qP1: state.qP1, qP2: state.qP2, 
          p1Firing: false, p2Firing: false, p1Miss: false, p2Miss: false, 
          explosionP1: false, explosionP2: false, shake: false, gameOver: state.gameOver,
          player1Id: state.player1Id, player2Id: state.player2Id, subject: state.subject
        }
      }).catch(console.error)
    }
    channel.on('broadcast', { event: 'global_sync_request' }, sendSync)
    channel.on('broadcast', { event: 'tank_request_state' }, sendSync)
    window.addEventListener('on_global_sync_request', sendSync)

    return () => {
      removeBroadcastBinding(channel, 'global_sync_request', sendSync)
      removeBroadcastBinding(channel, 'tank_request_state', sendSync)
      window.removeEventListener('on_global_sync_request', sendSync)
    }
  }, [channel])

  useEffect(() => {
    generateQuestion(1)
    generateQuestion(2)
  }, [generateQuestion])

  const handleAnswer = (player, selected) => {
    const state = stateRef.current;
    if (state.gameOver) return;

    const q = player === 1 ? state.qP1 : state.qP2;
    if (!q) return;

    if (selected === q.answer) {
      playSound('correct');
      if (player === 1) {
        playSound('shoot'); setP1Firing(true); generateQuestion(1);
        setTimeout(() => {
          setP1Firing(false); setExplosionP1(true); setShake(true);
          setHealthP2(h => {
            const newH = Math.max(0, h - 20);
            if (newH === 0) setGameOver('اللاعب الأزرق هو الفائز! 🏆');
            return newH;
          });
          setTimeout(() => { setExplosionP1(false); setShake(false); }, 500);
        }, 400); 
      } else {
        playSound('shoot'); setP2Firing(true); generateQuestion(2);
        setTimeout(() => {
          setP2Firing(false); setExplosionP2(true); setShake(true);
          setHealthP1(h => {
            const newH = Math.max(0, h - 20);
            if (newH === 0) setGameOver('اللاعب الأحمر هو الفائز! 🏆');
            return newH;
          });
          setTimeout(() => { setExplosionP2(false); setShake(false); }, 500);
        }, 400); 
      }
    } else {
      playSound('wrong'); playSound('shoot');
      if (player === 1) {
        setQP1({...q, status: 'wrong'}); setP1Miss(true);
        setTimeout(() => { setQP1({...q, status: null}); setP1Miss(false); }, 500);
      } else {
        setQP2({...q, status: 'wrong'}); setP2Miss(true);
        setTimeout(() => { setQP2({...q, status: null}); setP2Miss(false); }, 500);
      }
    }
  }

  const restart = () => {
    setHealthP1(100); setHealthP2(100); setGameOver(null);
    generateQuestion(1); generateQuestion(2);
  }

  useEffect(() => {
    if (!channel) return;
    const handleTankAction = ({ payload }) => {
      if (!payload) return;
      if (payload.action === 'answer') {
        handleAnswer(payload.player, payload.option);
      }
    };
    channel.on('broadcast', { event: 'tank_action' }, handleTankAction);
    return () => {
      removeBroadcastBinding(channel, 'tank_action', handleTankAction);
    };
  }, [channel]);

  return (
    <div style={{padding: 'clamp(6px, 1.5vw, 12px)', background: 'white', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', overflow: 'hidden', height: '100%', boxSizing: 'border-box'}}>
      
      {/* Sleek Compact Ribbon with 1v1 Controls */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px', background: '#f8fafc', padding: '6px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', flexShrink: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
          <div style={{fontWeight: 'bold', color: '#1e293b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px'}}>
            <span>⚔️</span> <span>معركة الدبابات</span>
          </div>

          <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer'}}>
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

        {/* 1v1 Compact Dropdowns */}
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '4px', background: '#eff6ff', padding: '3px 8px', borderRadius: '8px', border: '1px solid #bfdbfe'}}>
            <span style={{fontSize: '0.8rem'}}>🔵</span>
            <span style={{fontSize: '0.75rem', fontWeight: 'bold', color: '#1d4ed8'}}>P1:</span>
            <select value={player1Id} onChange={e => setPlayer1Id(e.target.value)} style={{padding: '2px 4px', borderRadius: '6px', border: '1px solid #93c5fd', outline: 'none', fontSize: '0.75rem', fontWeight: 'bold', background: 'white', cursor: 'pointer'}}>
               <option value="teacher">المعلم</option>
               {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '4px', background: '#fef2f2', padding: '3px 8px', borderRadius: '8px', border: '1px solid #fecaca'}}>
            <span style={{fontSize: '0.8rem'}}>🔴</span>
            <span style={{fontSize: '0.75rem', fontWeight: 'bold', color: '#b91c1c'}}>P2:</span>
            <select value={player2Id} onChange={e => setPlayer2Id(e.target.value)} style={{padding: '2px 4px', borderRadius: '6px', border: '1px solid #fca5a5', outline: 'none', fontSize: '0.75rem', fontWeight: 'bold', background: 'white', cursor: 'pointer'}}>
               <option value="">(اختر طالب)</option>
               {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </div>
  
      {/* Settings Modal */}
      {showSettings && (
        <QuestionManagerModal 
          customQuestions={customQuestions} 
          setCustomQuestions={handleUpdateQuestions} 
          onClose={() => setShowSettings(false)} 
        />
      )}
      
      {/* Game Area */}
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', height: '100%', minHeight: 0, borderRadius: '14px', border: '2px solid #e2e8f0'}}>
        <div className={`${styles.container} ${shake ? styles.shake : ''}`} style={{height: '100%', minHeight: 0, margin: 0, borderRadius: '14px', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
            <div className={styles.topSplit}>
              {/* P1 Blue */}
              <div className={styles.half}>
                <div className={styles.header}>
                  <div className={styles.playerName}>اللاعب الأزرق</div>
                  <div className={styles.healthBarContainer}>
                    <div className={`${styles.healthFill} ${healthP1 <= 20 ? styles.low : ''}`} style={{width: `${healthP1}%`}}></div>
                    <div className={styles.healthText}>{healthP1}</div>
                  </div>
                </div>
                {qP1 && !gameOver && (
                  <div className={styles.questionArea}>
                    <div className={styles.questionBox}>{qP1.text}</div>
                    <div className={styles.optionsGrid}>
                      {qP1.options.map((opt, i) => (
                        <button 
                          key={i} 
                          className={`${styles.optionBtn} ${qP1.status === 'wrong' ? styles.wrong : ''}`}
                          onClick={() => { if(player1Id === 'teacher') handleAnswer(1, opt) }}
                          disabled={player1Id !== 'teacher'}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* P2 Red */}
              <div className={`${styles.half} ${styles.player2}`}>
                <div className={styles.header}>
                  <div className={styles.playerName}>اللاعب الأحمر</div>
                  <div className={styles.healthBarContainer}>
                    <div className={`${styles.healthFill} ${healthP2 <= 20 ? styles.low : ''}`} style={{width: `${healthP2}%`}}></div>
                    <div className={styles.healthText}>{healthP2}</div>
                  </div>
                </div>
                {qP2 && !gameOver && (
                  <div className={styles.questionArea}>
                    <div className={styles.questionBox}>{qP2.text}</div>
                    <div className={styles.optionsGrid}>
                      {qP2.options.map((opt, i) => (
                        <button 
                          key={i} 
                          className={`${styles.optionBtn} ${qP2.status === 'wrong' ? styles.wrong : ''}`}
                          onClick={() => { if(player2Id === 'teacher') handleAnswer(2, opt) }}
                          disabled={player2Id !== 'teacher'}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.battlefield}>
              <div className={`${styles.tank} ${styles.tankP1} ${p1Firing || p1Miss ? styles.recoil : ''}`}>
                <div className={styles.tracks}></div><div className={styles.tankBody}></div><div className={styles.turret}></div><div className={styles.barrel}></div>
              </div>
              <div className={`${styles.tank} ${styles.tankP2} ${p2Firing || p2Miss ? styles.recoil : ''}`}>
                <div className={styles.tracks}></div><div className={styles.tankBody}></div><div className={styles.turret}></div><div className={styles.barrel}></div>
              </div>

              {p1Firing && <div className={`${styles.projectile} ${styles.p1}`}></div>}
              {p2Firing && <div className={`${styles.projectile} ${styles.p2}`}></div>}
              {p1Miss && <div className={`${styles.projectile} ${styles.p1} ${styles.miss}`}></div>}
              {p2Miss && <div className={`${styles.projectile} ${styles.p2} ${styles.miss}`}></div>}
              {explosionP1 && <div className={`${styles.explosion} ${styles.p1Hit}`}></div>}
              {explosionP2 && <div className={`${styles.explosion} ${styles.p2Hit}`}></div>}
            </div>

            {gameOver && (
              <div className={styles.gameOver}>
                <div className={styles.winnerText}>{gameOver}</div>
                <button className={styles.restartBtn} onClick={restart}>إعادة المعركة 🔄</button>
              </div>
            )}
         </div>
      </div>
    </div>
  )
}
