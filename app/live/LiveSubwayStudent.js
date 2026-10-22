'use client'

import { useState, useEffect } from 'react'
import styles from '../kids-corner/games/subway/page.module.css'

export default function LiveSubwayStudent({ channel, hasControl }) {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameState, setGameState] = useState('running') // running, trainApproaching, answering, jumping, hit, gameOver
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)

  useEffect(() => {
    if (!channel) return;
    let isMounted = true;
    
    const applyState = (payload) => {
      if (!payload) return;
      setScore(payload.score);
      setLives(payload.lives);
      setGameState(payload.gameState);
      setShowQuestion(payload.showQuestion);
      setCurrentQuestion(payload.currentQuestion);
      setSelectedOption(payload.selectedOption);
    };

    const customHandler = (e) => { if (isMounted) applyState(e.detail) }
    window.addEventListener('on_subway_state_sync', customHandler)

    // Request initial state on mount if channel is active
    if (channel && channel.state === 'joined') {
      channel.send({ type: 'broadcast', event: 'global_sync_request', payload: {} }).catch(() => {});
    }

    return () => {
      isMounted = false;
      window.removeEventListener('on_subway_state_sync', customHandler)
    }
  }, [channel])

  const playSound = (type) => {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (type === 'jump') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }
  }

  const handleAnswer = (option) => {
    if (!hasControl || selectedOption !== null) return;
    if (channel && channel.state === 'joined') {
      channel.send({ type: 'broadcast', event: 'subway_action', payload: { action: 'answer', option } }).catch(() => {})
    }
  }

  const isHit = gameState === 'hit';

  return (
    <div style={{width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', background: '#87CEEB', borderRadius: '0 0 28px 28px', pointerEvents: hasControl ? 'auto' : 'none'}}>
      
      {!hasControl && (
        <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', zIndex: 99}}></div>
      )}

      <div className={`${styles.container} ${isHit ? styles.shake : ''}`} style={{height: '100%', minHeight: 0, width: '100%', margin: 0, padding: 0}}>
        
        <div className={styles.header} style={{position: 'absolute', top: '20px', left: '20px', right: '20px', zIndex: 10}}>
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
                        style={{cursor: hasControl ? 'pointer' : 'default'}}
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
          </div>
        )}
      </div>
    </div>
  )
}
