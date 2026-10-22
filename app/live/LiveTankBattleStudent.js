'use client'

import { useState, useEffect } from 'react'
import styles from '../kids-corner/games/tank-battle/page.module.css'

export default function LiveTankBattleStudent({ channel, deviceId }) {
  const [healthP1, setHealthP1] = useState(100)
  const [healthP2, setHealthP2] = useState(100)
  const [qP1, setQP1] = useState(null)
  const [qP2, setQP2] = useState(null)
  const [p1Firing, setP1Firing] = useState(false)
  const [p2Firing, setP2Firing] = useState(false)
  const [p1Miss, setP1Miss] = useState(false)
  const [p2Miss, setP2Miss] = useState(false)
  const [explosionP1, setExplosionP1] = useState(false)
  const [explosionP2, setExplosionP2] = useState(false)
  const [shake, setShake] = useState(false)
  const [gameOver, setGameOver] = useState(null)

  const [player1Id, setPlayer1Id] = useState('')
  const [player2Id, setPlayer2Id] = useState('')
  const [subject, setSubject] = useState('math')

  useEffect(() => {
    if (!channel) return;
    let isMounted = true;
    
    // Request state from teacher for late joiners
    const requestTimer = setTimeout(() => {
      if (isMounted && channel && channel.state === 'joined') {
        channel.send({ type: 'broadcast', event: 'tank_request_state', payload: {} }).catch(() => {});
        channel.send({ type: 'broadcast', event: 'global_sync_request', payload: {} }).catch(() => {});
      }
    }, 500);
    
    const applyState = (payload) => {
      if (!payload) return;
      setHealthP1(payload.healthP1)
      setHealthP2(payload.healthP2)
      setQP1(payload.qP1)
      setQP2(payload.qP2)
      setP1Firing(payload.p1Firing)
      setP2Firing(payload.p2Firing)
      setP1Miss(payload.p1Miss)
      setP2Miss(payload.p2Miss)
      setExplosionP1(payload.explosionP1)
      setExplosionP2(payload.explosionP2)
      setShake(payload.shake)
      setGameOver(payload.gameOver)
      setPlayer1Id(payload.player1Id)
      setPlayer2Id(payload.player2Id)
      setSubject(payload.subject)
    };

    const customHandler = (e) => { if (isMounted) applyState(e.detail) }
    window.addEventListener('on_tank_state_sync', customHandler)

    return () => { 
      isMounted = false; 
      window.removeEventListener('on_tank_state_sync', customHandler)
    }
  }, [channel])

  const playSound = (type) => {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (type === 'shoot') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square'; osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }
  }

  const handleAnswer = (player, option) => {
    if (player === 1 && deviceId !== player1Id) return;
    if (player === 2 && deviceId !== player2Id) return;
    
    // Play shoot sound locally for immediate feedback
    playSound('shoot');
    
    if (channel && channel.state === 'joined') {
      channel.send({
        type: 'broadcast',
        event: 'tank_action',
        payload: { player, action: 'answer', option }
      }).catch(console.error)
    }
  }

  const isPlayer1 = deviceId === player1Id;
  const isPlayer2 = deviceId === player2Id;

  return (
    <div style={{width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#e2e8f0', borderRadius: '0 0 28px 28px'}}>
      
      {/* Identity Banner */}
      {(isPlayer1 || isPlayer2) && (
        <div style={{position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: isPlayer1 ? '#3b82f6' : '#ef4444', color: 'white', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '10px'}}>
           <span>⚔️</span> أنت اللاعب {isPlayer1 ? 'الأزرق (P1)' : 'الأحمر (P2)'}!
        </div>
      )}

      <div className={`${styles.container} ${shake ? styles.shake : ''}`} style={{height: '100%', minHeight: 0, margin: 0, padding: 0, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden'}}>
        <div className={styles.topSplit}>
          {/* P1 Blue */}
          <div className={styles.half} style={{opacity: isPlayer1 || (!isPlayer1 && !isPlayer2) ? 1 : 0.6}}>
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
                      onClick={() => handleAnswer(1, opt)}
                      disabled={!isPlayer1}
                      style={{cursor: isPlayer1 ? 'pointer' : 'not-allowed'}}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* P2 Red */}
          <div className={`${styles.half} ${styles.player2}`} style={{opacity: isPlayer2 || (!isPlayer1 && !isPlayer2) ? 1 : 0.6}}>
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
                      onClick={() => handleAnswer(2, opt)}
                      disabled={!isPlayer2}
                      style={{cursor: isPlayer2 ? 'pointer' : 'not-allowed'}}
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
          </div>
        )}
      </div>
    </div>
  )
}
