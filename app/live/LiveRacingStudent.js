'use client'

import { useState, useEffect, useRef } from 'react'

export default function LiveRacingStudent({ channel, hasControl }) {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameState, setGameState] = useState('waiting') // waiting, running, hit, gameOver
  const [activeCycle, setActiveCycle] = useState(null)
  const [carLane, setCarLane] = useState(1) // 0=left, 1=center, 2=right

  useEffect(() => {
    if (!channel) return;
    let isMounted = true;
    
    const applyState = (payload) => {
      if (!payload || !isMounted) return;
      setScore(payload.score);
      setLives(payload.lives);
      setGameState(payload.gameState);
      if (payload.activeCycle !== undefined) setActiveCycle(payload.activeCycle);
      if (payload.carLane !== undefined) setCarLane(payload.carLane);
    };

    const customHandler = (e) => applyState(e.detail)
    window.addEventListener('on_racing_state_sync', customHandler)

    // Request initial state on mount if channel is joined
    if (channel && channel.state === 'joined') {
      channel.send({ type: 'broadcast', event: 'global_sync_request', payload: {} }).catch(() => {});
    }

    return () => {
      isMounted = false;
      window.removeEventListener('on_racing_state_sync', customHandler)
    }
  }, [channel])

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
      osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.5, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'move') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    }
  }

  const prevScore = useRef(0);
  useEffect(() => {
    if (score > prevScore.current) playSound('correct');
    prevScore.current = score;
  }, [score])

  const prevLives = useRef(3);
  useEffect(() => {
    if (lives < prevLives.current) playSound('wrong');
    prevLives.current = lives;
  }, [lives])

  const handleMove = (newLane) => {
    if (!hasControl || gameState !== 'running') return;
    if (newLane < 0 || newLane > 2) return;
    
    setCarLane(newLane); // optimistic update
    playSound('move');
    
    if (channel && channel.state === 'joined') {
      channel.send({ type: 'broadcast', event: 'racing_action', payload: { action: 'move', lane: newLane } }).catch(() => {})
    }
  }

  // Swipe handlers
  const [touchStartX, setTouchStartX] = useState(null)

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX)
  const handleTouchEnd = (e) => {
    if (!touchStartX) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX - touchEndX

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped Left
        handleMove(carLane - 1)
      } else {
        // Swiped Right
        handleMove(carLane + 1)
      }
    }
    setTouchStartX(null)
  }

  const isHit = gameState === 'hit';

  return (
    <div 
      style={{width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', background: '#22c55e', borderRadius: '0 0 28px 28px', pointerEvents: hasControl ? 'auto' : 'none', display: 'flex', flexDirection: 'column'}}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {!hasControl && (
        <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', zIndex: 99}}></div>
      )}

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
        <div onClick={() => handleMove(0)} style={{ flex: 1, position: 'relative', cursor: 'pointer', zIndex: 10 }}></div>
        <div onClick={() => handleMove(1)} style={{ flex: 1, position: 'relative', cursor: 'pointer', zIndex: 10 }}></div>
        <div onClick={() => handleMove(2)} style={{ flex: 1, position: 'relative', cursor: 'pointer', zIndex: 10 }}></div>

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
        </div>
      )}

      {/* Waiting Screen */}
      {gameState === 'waiting' && !activeCycle && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>استعد للسباق! 🏎️</h1>
          <p>اسحب لليمين واليسار لتغيير الحارة</p>
        </div>
      )}
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
    return () => cancelAnimationFrame(loop);
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
