'use client'

import { useState, useEffect, useRef } from 'react'
import styles from '../kids-corner/games/mario/page.module.css'

export default function LiveMarioStudent({ channel, hasControl }) {
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameState, setGameState] = useState('walking') 
  const [blockState, setBlockState] = useState('movingIn')
  const [showCoin, setShowCoin] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isShaking, setIsShaking] = useState(false)
  const [showFloatingScore, setShowFloatingScore] = useState(false)

  // Shared AudioContext — reused across sounds (iOS Safari caps at ~6 concurrent instances)
  const audioCtxRef = useRef(null);

  // Listen to teacher's state
  useEffect(() => {
    if (!channel) return;
    let isMounted = true;
    
    const applyState = (payload) => {
      if (!payload) return;
      setScore(payload.score);
      setLevel(payload.level);
      setGameState(payload.gameState);
      setBlockState(payload.blockState);
      setShowCoin(payload.showCoin);
      setShowQuestion(payload.showQuestion);
      setCurrentQuestion(payload.currentQuestion);
      setSelectedOption(payload.selectedOption);
      setIsShaking(payload.isShaking);
      setShowFloatingScore(payload.showFloatingScore);
    };

    const customHandler = (e) => { if (isMounted) applyState(e.detail) }
    window.addEventListener('on_mario_state_sync', customHandler)

    return () => {
      isMounted = false;
      window.removeEventListener('on_mario_state_sync', customHandler)
    }
  }, [channel])

  const playSound = (type) => {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    // Reuse shared AudioContext to avoid iOS Safari browser limit (~6 instances)
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    if (type === 'jump') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }
  }

  const handleJump = () => {
    if (!hasControl || gameState !== 'ready') return;
    playSound('jump');
    if (channel && channel.state === 'joined') {
      channel.send({ type: 'broadcast', event: 'mario_action', payload: { action: 'jump' } }).catch(() => {})
    }
  }

  const handleAnswer = (option) => {
    if (!hasControl || selectedOption !== null) return;
    if (channel && channel.state === 'joined') {
      channel.send({ type: 'broadcast', event: 'mario_action', payload: { action: 'answer', option } }).catch(() => {})
    }
  }

  // Keyboard controls: Space = jump, 1-4 / A-D = answer options
  useEffect(() => {
    if (!hasControl) return;
    const handleKeyDown = (e) => {
      // Ignore if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space' && !showQuestion) {
        e.preventDefault();
        handleJump();
      }
      if (showQuestion && currentQuestion) {
        const keyMap = { 'Digit1': 0, 'Digit2': 1, 'Digit3': 2, 'Digit4': 3,
                         'KeyA': 0, 'KeyB': 1, 'KeyC': 2, 'KeyD': 3 };
        const idx = keyMap[e.code];
        if (idx !== undefined && currentQuestion.options[idx] !== undefined) {
          e.preventDefault();
          handleAnswer(currentQuestion.options[idx]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasControl, gameState, showQuestion, currentQuestion, selectedOption]);

  const isWalking = gameState === 'walking' || gameState === 'ready';
  const isJumping = gameState === 'jumping';
  const isScrolling = gameState === 'walking' || gameState === 'ready';

  return (
    <div style={{width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#5c94fc', borderRadius: '0 0 28px 28px', pointerEvents: hasControl ? 'auto' : 'none'}}>
      
      {/* Dim overlay if not in control */}
      {!hasControl && (
        <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', zIndex: 99}}></div>
      )}

      <div className={styles.container} style={{height: '100%', minHeight: 0, width: '100%', margin: 0, padding: 0, position: 'relative', overflow: 'hidden', overscrollBehavior: 'none', touchAction: 'none'}}>
        
        <div className={styles.header} style={{position: 'absolute', top: '15px', left: '15px', right: '15px', zIndex: 10}}>
          <div className={styles.levelIndicator}>مستوى {level}</div>
          <div className={styles.scoreBoard}>
            <span>{score}</span>
            <span className={styles.cssCoin}></span>
          </div>
        </div>

        <div className={`${styles.gameArea} ${isScrolling ? styles.scrolling : ''}`} style={{height: '100%'}}>
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
          <div className={styles.controls} style={{position: 'absolute', bottom: 'calc(15px + env(safe-area-inset-bottom, 0px))', width: '100%', zIndex: 20, display: 'flex', justifyContent: 'center', padding: '0 15px'}}>
            <button 
              className={styles.jumpBtn} 
              onClick={handleJump}
              disabled={gameState !== 'ready'}
              style={{opacity: hasControl ? 1 : 0.5}}
            >
              {gameState === 'walking' ? 'انتظر..' : 'اقفز!'}
            </button>
          </div>
        )}

        {showQuestion && currentQuestion && (
          <div className={styles.questionOverlay} style={{position: 'absolute', inset: 0, zIndex: 30}}>
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
                      style={{cursor: hasControl ? 'pointer' : 'default'}}
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
  )
}
