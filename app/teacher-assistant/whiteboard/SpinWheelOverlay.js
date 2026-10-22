import React, { useState, useRef, useEffect } from 'react';
import { X, Trophy } from 'lucide-react';
import { renderCheerOnCanvas } from '../../utils/cheerEffects';

export default function SpinWheelOverlay({ isActive, onClose, channel, isStudent }) {
  const [namesText, setNamesText] = useState('أحمد\nمحمد\nعلي\nعمر\nخالد\nيوسف');
  const [winnerPrefix, setWinnerPrefix] = useState('الفائز:');
  const [winner, setWinner] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const canvasRef = useRef(null);
  const currentRotation = useRef(0);

  const stateRef = useRef({ namesText, winnerPrefix, winner });
  useEffect(() => {
    stateRef.current = { namesText, winnerPrefix, winner };
  }, [namesText, winnerPrefix, winner]);

  useEffect(() => {
    if (!channel || !isActive) return;
    
    let hasRequested = false;
    if (isStudent && !hasRequested) {
      channel.send({ type: 'broadcast', event: 'spinwheel_action', payload: { action: 'request_sync' } }).catch(()=>{});
      hasRequested = true;
    }

    const sub = channel.on('broadcast', { event: 'spinwheel_action' }, ({ payload }) => {
      if (isStudent && payload.action === 'sync_state') {
        setNamesText(payload.namesText);
        setWinnerPrefix(payload.winnerPrefix);
        setWinner(payload.winner);
        if (payload.currentRotation && canvasRef.current) {
           currentRotation.current = payload.currentRotation;
           canvasRef.current.style.transform = `rotate(${currentRotation.current}deg)`;
        }
      }
      if (!isStudent && payload.action === 'request_sync') {
        channel.send({ type: 'broadcast', event: 'spinwheel_action', payload: {
          action: 'sync_state',
          namesText: stateRef.current.namesText, 
          winnerPrefix: stateRef.current.winnerPrefix, 
          winner: stateRef.current.winner, 
          currentRotation: currentRotation.current
        }}).catch(()=>{});
      }
      if (isStudent && payload.action === 'spin') {
        doSpinAnimation(payload.targetRotation, payload.spinDuration);
      }
      if (isStudent && payload.action === 'update_names') {
        setNamesText(payload.namesText);
        if (payload.winnerPrefix !== undefined) {
           setWinnerPrefix(payload.winnerPrefix);
        }
      }
    });

    return () => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
    };
  }, [channel, isActive, isStudent]);

  const broadcastState = (action, extraPayload = {}) => {
    if (!channel || isStudent) return;
    channel.send({ type: 'broadcast', event: 'spinwheel_action', payload: { action, ...extraPayload } }).catch(()=>{});
  };

  const names = namesText.split('\n').filter(n => n.trim() !== '');

  const doSpinAnimation = (targetRotation, spinDuration) => {
    setWinner(null);
    setIsSpinning(true);
    const start = performance.now();
    const startRotation = currentRotation.current;

    const animate = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / spinDuration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      currentRotation.current = startRotation + (targetRotation - startRotation) * easeOut;
      
      if (canvasRef.current) {
         canvasRef.current.style.transform = `rotate(${currentRotation.current}deg)`;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const normalizedRotation = currentRotation.current % 360;
        const arcDeg = 360 / names.length;
        const winnerAngle = (360 - normalizedRotation) % 360;
        const index = Math.floor(winnerAngle / arcDeg);
        setWinner(names[index]);
        if (typeof window !== 'undefined') {
            if (typeof renderCheerOnCanvas === 'function') {
                renderCheerOnCanvas(null, 'confetti_rain');
            }
        }
      }
    };
    requestAnimationFrame(animate);
  };

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 10;

    ctx.clearRect(0, 0, width, height);

    if (names.length === 0) {
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fill();
      return;
    }

    const arc = (2 * Math.PI) / names.length;
    const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c'];

    for (let i = 0; i < names.length; i++) {
      const angle = i * arc; // Start angle without rotation
      
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + arc);
      ctx.lineTo(cx, cy);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Tajawal, Arial';
      ctx.fillText(names[i], radius - 20, 5);
      ctx.restore();
    }
  };

  React.useEffect(() => {
    if (isActive) {
      drawWheel();
    }
  }, [namesText, isActive]);

  const spin = () => {
    if (isSpinning || names.length === 0) return;
    
    const spinDuration = 4000;
    const startRotation = currentRotation.current;
    
    const extraSpins = (Math.floor(Math.random() * 5) + 5) * 360;
    const randomOffset = Math.random() * 360;
    const targetRotation = startRotation + extraSpins + randomOffset;
    
    broadcastState('spin', { targetRotation, spinDuration });
    doSpinAnimation(targetRotation, spinDuration);
  };

  if (!isActive) return null;

  if (isStudent) {
     return (
       <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal' }}>
         {winner && (
           <div style={{ marginBottom: '20px', padding: '15px 30px', background: '#f59e0b', color: 'white', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)', animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
             <Trophy size={32} />
             <h2 style={{ margin: 0, fontSize: '2rem' }}>{winnerPrefix} {winner}</h2>
           </div>
         )}
         <div className="spin-canvas-container" style={{ position: 'relative', width: '100%', maxWidth: '400px', aspectRatio: '1' }}>
           <canvas ref={canvasRef} width={400} height={400} style={{ width: '100%', height: '100%', transition: 'transform 0s' }}></canvas>
           <div style={{ position: 'absolute', top: '50%', right: '-15px', transform: 'translateY(-50%)', width: '0', height: '0', borderTop: '15px solid transparent', borderBottom: '15px solid transparent', borderRight: '25px solid #ef4444', filter: 'drop-shadow(-2px 0 2px rgba(0,0,0,0.3))', zIndex: 5 }}></div>
         </div>
       </div>
     );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal'
    }}>
      <style>{`
        .spin-modal-container { display: flex; gap: 20px; background: white; padding: 25px; border-radius: 15px; width: 90%; max-width: 800px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); position: relative; max-height: 95vh; overflow-y: auto; }
        .spin-left-side { flex: 1; display: flex; flex-direction: column; gap: 15px; direction: rtl; }
        .spin-right-side { flex: 1.5; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
        .spin-canvas-container { position: relative; width: 100%; max-width: 400px; aspect-ratio: 1; height: auto; }
        @media (max-width: 768px) {
          .spin-modal-container { flex-direction: column-reverse; padding: 12px; width: 95%; }
          .spin-canvas-container { width: 100%; max-width: 280px; height: auto; margin: 0 auto; }
          .spin-left-side { min-height: 180px; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
      `}</style>
      <div className="spin-modal-container">
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', zIndex: 10
        }}><X size={24} /></button>

        {/* Left Side: Controls */}
        <div className="spin-left-side">
          <h3 style={{ margin: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🎡 عجلة الحظ العشوائية
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>كلمة إعلان النتيجة:</label>
            <input 
              type="text" 
              value={winnerPrefix} 
              onChange={(e) => { setWinnerPrefix(e.target.value); broadcastState('update_names', { winnerPrefix: e.target.value, namesText }); }}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontFamily: 'Tajawal', fontSize: '14px' }}
            />
          </div>

          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>الخيارات (كل خيار في سطر):</p>
          <textarea 
            value={namesText}
            onChange={(e) => { setNamesText(e.target.value); broadcastState('update_names', { namesText: e.target.value }); }}
            disabled={isSpinning}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'none', outline: 'none', minHeight: '100px', fontFamily: 'Tajawal' }}
          />
          <button 
            onClick={spin}
            disabled={isSpinning || names.length === 0}
            style={{
              background: isSpinning ? '#94a3b8' : '#8b5cf6', color: 'white', padding: '12px', borderRadius: '8px',
              border: 'none', cursor: isSpinning ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px', fontFamily: 'Tajawal'
            }}
          >
            {isSpinning ? 'جاري الدوران...' : 'لف العجلة!'}
          </button>
        </div>

        {/* Right Side: Wheel */}
        <div className="spin-right-side">
          
          {/* Wheel Canvas */}
          <div className="spin-canvas-container">
             <canvas ref={canvasRef} width={400} height={400} style={{ width: '100%', height: '100%', transition: 'transform 0s' }}></canvas>
             
             {/* Stationary Pointer */}
             <div style={{
                position: 'absolute',
                top: '50%',
                right: '-10px',
                transform: 'translateY(-50%)',
                width: '0', 
                height: '0', 
                borderTop: '15px solid transparent',
                borderBottom: '15px solid transparent',
                borderRight: '25px solid #334155',
                zIndex: 5
             }}></div>
          </div>
          
          <div style={{ minHeight: '40px', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl' }}>
            {winner && (
              <div style={{ 
                animation: 'bounceIn 0.5s', background: '#fef3c7', color: '#b45309', padding: '10px 30px', 
                borderRadius: '50px', border: '2px solid #f59e0b', fontSize: '24px', fontWeight: 'bold', display: 'flex', gap: '10px', fontFamily: 'Tajawal'
              }}>
                <Trophy size={30} color="#f59e0b" />
                {winnerPrefix} {winner}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
