import React, { useState, useEffect } from 'react';

export default function ReactionOverlay({ channel }) {
  const [reactions, setReactions] = useState([]);

  useEffect(() => {
    if (!channel) return;
    const handler = (e) => {
      const payload = e.detail;
      const id = Date.now() + Math.random();
      setReactions(prev => [...prev, { id, emoji: payload.emoji, name: payload.name, left: 10 + Math.random() * 70 }]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== id));
      }, 4000); // Remove after 4s
    };
    window.addEventListener('on_student_reaction', handler);
    return () => {
      window.removeEventListener('on_student_reaction', handler);
    };
  }, [channel]);

  return (
    <div style={{ position: 'fixed', bottom: 100, left: 10, width: 'min(200px, 45vw)', height: '400px', pointerEvents: 'none', zIndex: 99999 }}>
      {reactions.map(r => (
        <div
          key={r.id}
          style={{
            position: 'absolute',
            bottom: '0px',
            left: `${r.left}%`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'floatUp 4s ease-out forwards',
            textShadow: '0 2px 5px rgba(0,0,0,0.3)',
            opacity: 0,
          }}
        >
          <div style={{ fontSize: '2rem' }}>{r.emoji}</div>
          <div style={{ fontSize: '0.6rem', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
            {r.name}
          </div>
        </div>
      ))}
      <style>{`@keyframes floatUp { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 10% { opacity: 1; transform: translateY(-20px) scale(1.2); } 20% { transform: translateY(-40px) scale(1); } 100% { transform: translateY(-300px) scale(1); opacity: 0; } }`}</style>
    </div>
  );
}



