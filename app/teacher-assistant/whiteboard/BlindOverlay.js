'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, EyeOff } from 'lucide-react'

export default function BlindOverlay({ isActive, onClose, hasControl = true }) {
  if (!isActive) return null;

  const [height, setHeight] = useState(() => typeof window !== 'undefined' ? window.innerHeight : 600);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ y: 0, h: 0 });

  const handlePointerDown = (e) => {
    if (!hasControl) return;
    e.stopPropagation();
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    dragStartRef.current = { y: clientY, h: height };
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const dy = clientY - dragStartRef.current.y;
    setHeight(Math.max(50, dragStartRef.current.h + dy));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove, { passive: false });
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchend', handlePointerUp);
    } else {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging]);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: height,
        backgroundColor: '#0f172a',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        overflow: 'hidden'
      }}
    >
      {hasControl && (
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', top: '20px', right: '20px', background: '#ef4444', color: 'white', 
            border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)', zIndex: 10 
          }}
          title="إغلاق الستارة"
        >
          <X size={22} />
        </button>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.15, color: '#94a3b8', gap: '15px' }}>
        <EyeOff size={100} />
        <span style={{ fontSize: '20px', fontFamily: 'Tajawal', fontWeight: 'bold' }}>ستارة إخفاء الشاشة</span>
      </div>

      {/* Drag handle */}
      <div 
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        style={{
          width: '100%',
          height: '40px',
          backgroundColor: '#334155',
          cursor: hasControl ? 'ns-resize' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.5)',
          touchAction: 'none'
        }}
      >
        <div style={{ width: '60px', height: '8px', backgroundColor: '#94a3b8', borderRadius: '4px' }}></div>
      </div>
    </div>
  );
}
