'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Settings2, Plus, Minus, Type, Play, RotateCcw, X, Upload } from 'lucide-react'
import { getEducationalQuestion } from '../../utils/questionBank'
import { normalizeQuestion, normalizeQuestions, loadActiveCustomQuestions, saveActiveCustomQuestions } from '../../utils/questionHelper'
import styles from '../../kids-corner/games/mario/page.module.css'
import QuestionManagerModal from '../../components/QuestionManagerModal'
import { removeBroadcastBinding } from '../../utils/realtimeHelper'

export default function LiveMarioTeacher({ channel, activeControlDevices, devices = [], customQuestions: propCustomQuestions, setCustomQuestions: propSetCustomQuestions, specialty = null }) {
  const [showSettings, setShowSettings] = useState(false)
  const [customQuestions, setCustomQuestions] = useState(() => {
    if (propCustomQuestions && propCustomQuestions.length > 0) return normalizeQuestions(propCustomQuestions);
    return loadActiveCustomQuestions();
  })
  const [subjectState, setSubjectState] = useState(() => {
    if (specialty === 'arabic') return 'arabic'
    if (specialty === 'english') return 'english'
    return 'math'
  })

  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [streak, setStreak] = useState(0)
  const [gameState, setGameState] = useState('walking') 
  const [blockState, setBlockState] = useState('movingIn')
  const [showCoin, setShowCoin] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [feedback, setFeedback] = useState({ text: '', type: '', show: false })
  const [selectedOption, setSelectedOption] = useState(null)
  const [isShaking, setIsShaking] = useState(false)
  const [showFloatingScore, setShowFloatingScore] = useState(false)

  // Use refs for latest state values in listeners
  const stateRef = useRef({
    gameState, blockState, level, streak, score, currentQuestion, subjectState, customQuestions
  })

  // Shared AudioContext pool � one instance reused across sounds (iOS Safari caps at 6 concurrent instances)
  const audioCtxRef = useRef(null);
  const jumpTimerRefs = useRef([]);
  const answerTimerRefs = useRef([]);

  // Cleanup all pending timers on unmount
  useEffect(() => {
    return () => {
      jumpTimerRefs.current.forEach(t => clearTimeout(t));
      answerTimerRefs.current.forEach(t => clearTimeout(t));
      jumpTimerRefs.current = [];
      answerTimerRefs.current = [];
    };
  }, []);

  useEffect(() => {
    stateRef.current = { gameState, blockState, level, streak, score, currentQuestion, subjectState, customQuestions }
  }, [gameState, blockState, level, streak, score, currentQuestion, subjectState, customQuestions])

  // Sync questions from parent when specialty changes
  useEffect(() => {
    if (propCustomQuestions && propCustomQuestions.length > 0) {
      const normalized = normalizeQuestions(propCustomQuestions)
      setCustomQuestions(normalized)
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
    const { subjectState, level } = stateRef.current;
    
    if (activeQs && activeQs.length > 0) {
      const raw = activeQs[Math.floor(Math.random() * activeQs.length)];
      const normalized = normalizeQuestion(raw);
      if (normalized) {
        setCurrentQuestion(normalized);
        return normalized;
      }
    }

    const q = getEducationalQuestion(subjectState, level);
    const normalized = normalizeQuestion(q);
    setCurrentQuestion(normalized);
    return normalized;
  }, []);

  // Update questions handler
  const handleUpdateQuestions = useCallback((newQs) => {
    const normalized = newQs && newQs.length > 0 ? normalizeQuestions(newQs) : null;
    setCustomQuestions(normalized);
    stateRef.current.customQuestions = normalized;
    if (propSetCustomQuestions) {
      propSetCustomQuestions(normalized);
    }
    
    // Regenerate current question immediately with the new questions
    const nextQ = generateQuestion(normalized);
    
    // Broadcast immediate update to all connected students
    if (channel && channel.state === 'joined') {
      channel.send({
        type: 'broadcast',
        event: 'mario_state_sync',
        payload: { 
          score: stateRef.current.score, 
          level: stateRef.current.level, 
          streak: stateRef.current.streak, 
          gameState: stateRef.current.gameState, 
          blockState: stateRef.current.blockState, 
          showCoin: stateRef.current.showCoin, 
          showQuestion: stateRef.current.showQuestion, 
          currentQuestion: nextQ, 
          feedback: stateRef.current.feedback, 
          selectedOption: stateRef.current.selectedOption, 
          isShaking: stateRef.current.isShaking, 
          showFloatingScore: stateRef.current.showFloatingScore, 
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

  // Listen to global questions update events
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
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    // Reuse shared AudioContext to avoid browser limit (~6 instances on iOS Safari)
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;
    // Resume if suspended (required after user gesture on iOS)
    if (ctx.state === 'suspended') ctx.resume();
    
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

  // Sync state to all clients
  useEffect(() => {
    if (channel && channel.state === 'joined') {
      channel.send({
        type: 'broadcast',
        event: 'mario_state_sync',
        payload: { 
          score, level, streak, gameState, blockState, showCoin, 
          showQuestion, currentQuestion, feedback, selectedOption, 
          isShaking, showFloatingScore, subjectState 
        }
      }).catch(e => console.error(e))
    }
  }, [score, level, streak, gameState, blockState, showCoin, showQuestion, currentQuestion, feedback, selectedOption, isShaking, showFloatingScore, subjectState, channel])

  // Handle global sync request for reconnecting students
  // Uses stateRef to avoid listener accumulation on every state change
  useEffect(() => {
    if (!channel) return;
    const sendSync = () => {
      const s = stateRef.current;
      channel.send({
        type: 'broadcast',
        event: 'mario_state_sync',
        payload: { 
          score: s.score, level: s.level, streak: s.streak, gameState: s.gameState,
          blockState: s.blockState, showCoin: false, showQuestion: s.showQuestion || false,
          currentQuestion: s.currentQuestion, feedback: { text: '', type: '', show: false },
          selectedOption: null, isShaking: false, showFloatingScore: false,
          subjectState: s.subjectState 
        }
      }).catch(console.error);
    }
    const syncReqListener = channel.on('broadcast', { event: 'global_sync_request' }, sendSync);
    window.addEventListener('on_global_sync_request', sendSync);
    return () => {
      removeBroadcastBinding(channel, 'global_sync_request', sendSync);
      window.removeEventListener('on_global_sync_request', sendSync);
    }
  }, [channel]);

  useEffect(() => {
    if (gameState === 'walking' && blockState === 'movingIn') {
      const timer = setTimeout(() => {
        setBlockState('stopped')
        setGameState('ready')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [gameState, blockState])

  const handleJump = () => {
    if (stateRef.current.gameState !== 'ready') return;
    playSound('jump');
    setGameState('jumping');
    
    // Store timeout IDs for cleanup on unmount
    const t1 = setTimeout(() => {
      setBlockState('hit');
      setShowCoin(true);
      const t2 = setTimeout(() => {
        setGameState('answering');
        const t3 = setTimeout(() => {
          setShowCoin(false);
          generateQuestion();
          setShowQuestion(true);
        }, 300);
        jumpTimerRefs.current.push(t3);
      }, 200);
      jumpTimerRefs.current.push(t2);
    }, 200);
    jumpTimerRefs.current.push(t1);
  }

  const handleAnswer = (option) => {
    const { currentQuestion, level, streak } = stateRef.current;
    if (!currentQuestion) return;
    
    setSelectedOption(option);
    const isCorrect = option === currentQuestion.answer;
    
    if (isCorrect) {
      playSound('correct');
      setShowFloatingScore(true);
      setScore(s => s + 10 * level);
      setStreak(s => s + 1);
      
      if (streak + 1 >= 5 && level < 3) {
        setLevel(l => l + 1);
        setStreak(0);
      }
      
      const t1 = setTimeout(() => {
        setShowFloatingScore(false);
        setShowQuestion(false);
        setSelectedOption(null);
        setBlockState('movingOut');
        setGameState('walking');
        const t2 = setTimeout(() => {
          setBlockState('movingIn');
        }, 1000);
        answerTimerRefs.current.push(t2);
      }, 1500);
      answerTimerRefs.current.push(t1);
    } else {
      playSound('wrong');
      setIsShaking(true);
      setStreak(0);
      
      const t3 = setTimeout(() => {
        setIsShaking(false);
        setSelectedOption(null);
      }, 500);
      answerTimerRefs.current.push(t3);
    }
  }

  // Listen to actions from the active student
  useEffect(() => {
    if (!channel) return;
    let isMounted = true;
    
    const actionListener = channel.on('broadcast', { event: 'mario_action' }, ({ payload }) => {
      if (!isMounted) return;
      if (payload.action === 'jump') {
        handleJump();
      } else if (payload.action === 'answer') {
        handleAnswer(payload.option);
      }
    });

    return () => {
      isMounted = false;
      // Properly unsubscribe to avoid ghost listeners
      removeBroadcastBinding(channel, 'mario_action');
    }
  }, [channel])

  const handleRestart = () => {
    setScore(0); setLevel(1); setStreak(0); setGameState('walking'); setBlockState('movingIn'); setShowCoin(false); setShowQuestion(false);
    if (channel && channel.state === 'joined') channel.send({type: 'broadcast', event: 'mario-restart'}).catch(console.error);
  }

  const isWalking = gameState === 'walking' || gameState === 'ready';
  const isJumping = gameState === 'jumping';
  const isScrolling = gameState === 'walking' || gameState === 'ready';
  const activeStudentNames = (devices || [])
    .filter(d => (activeControlDevices || []).includes(d.id || d.deviceId))
    .map(d => d.name)
    .join(', ') || 'الكل (الافتراضي)'

  return (
    <div style={{padding: 'clamp(6px, 1.5vw, 12px)', background: 'white', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', overflow: 'hidden', height: '100%', boxSizing: 'border-box'}}>
      
      {/* Sleek Compact Teacher Control Ribbon */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px', background: '#f8fafc', padding: '6px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', flexShrink: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
          <div style={{fontWeight: 'bold', color: '#1e293b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px'}}>
            <span>🕹️</span> <span>مغامرات ماريو</span>
          </div>
          
          <select 
            value={subjectState} 
            onChange={(e) => setSubjectState(e.target.value)}
            style={{padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer'}}
          >
            <option value="math">رياضيات 🧮</option>
            <option value="arabic">عربي 📖</option>
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
            <span>{customQuestions && customQuestions.length > 0 ? `مخصصة (${customQuestions.length})` : 'إضافة أسئلة'}</span>
          </button>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap'}}>
          <div style={{background: (activeControlDevices || []).length > 0 ? '#ecfdf5' : '#f1f5f9', color: (activeControlDevices || []).length > 0 ? '#059669' : '#475569', padding: '4px 10px', borderRadius: '8px', border: (activeControlDevices || []).length > 0 ? '1px solid #a7f3d0' : '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px'}}>
            <span>🎮 التحكم:</span>
            <span style={{color: (activeControlDevices || []).length > 0 ? '#047857' : '#1e293b'}}>{(activeControlDevices || []).length > 0 ? activeStudentNames : 'الكل'}</span>
          </div>

          <div style={{background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.8rem', fontWeight: 'bold'}}>
            ⭐ {score} نقطة (المستوى {level})
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
      
      {/* Game Preview Area */}
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', height: '100%', minHeight: 0, borderRadius: '14px', border: '2px solid #e2e8f0', background: '#38bdf8'}}>
        <div className={styles.container} style={{height: '100%', minHeight: 0, transform: 'scale(1)', transformOrigin: 'top center', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
          
          <div className={styles.header}>
            <div className={styles.levelIndicator}>المستوى {level}</div>
            <div className={styles.scoreBoard}>
              <span>{score}</span>
              <span className={styles.cssCoin}></span>
            </div>
          </div>

          <div className={`${styles.gameArea} ${isScrolling ? styles.scrolling : ''}`}>
            <div className={styles.clouds}></div>
            <div className={`${styles.block} ${styles[blockState]}`}>
              {blockState === 'hit' || blockState === 'movingOut' ? '' : '?'}
            </div>
            
            {showCoin && (
              <div className={`${styles.coin} ${styles.animate}`}>
                <span className={`${styles.cssCoin} ${styles.cssCoinLarge}`}></span>
              </div>
            )}

            <div className={`${styles.characterShadow} ${isJumping ? styles.jumping : ''}`}></div>

            <div className={`${styles.mario} ${isWalking ? styles.walking : ''} ${isJumping ? styles.jumping : ''} ${gameState === 'answering' ? styles.idle : ''}`}>
              <div className={styles.head}>
                <div className={styles.hat}></div>
                <div className={styles.eye}></div>
                <div className={styles.mustache}></div>
              </div>
              <div className={styles.body}></div>
              <div className={`${styles.arm} ${styles.right}`}></div>
              <div className={`${styles.leg} ${styles.right}`}></div>
              <div className={`${styles.leg} ${styles.left}`}></div>
              <div className={`${styles.arm} ${styles.left}`}></div>
            </div>
          </div>

          {showFloatingScore && <div className={styles.floatingScore}>+{10 * level}</div>}

          {!showQuestion && (
            <div className={styles.controls}>
              <button 
                className={styles.jumpBtn} 
                onClick={handleJump}
                disabled={gameState !== 'ready'}
              >
                {gameState === 'walking' ? 'يمشي..' : 'اقفز!'}
              </button>
            </div>
          )}

          {showQuestion && currentQuestion && (
            <div className={styles.questionOverlay}>
              <div className={`${styles.questionCard} ${isShaking ? styles.shake : ''}`}>
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
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
