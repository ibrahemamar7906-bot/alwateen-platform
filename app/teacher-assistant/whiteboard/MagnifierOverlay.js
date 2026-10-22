'use client'

import React, { useEffect, useRef, useState } from 'react'

export default function MagnifierOverlay({ isActive, fabricCanvas }) {
  const [pos, setPos] = useState({ x: -1000, y: -1000 })
  const magnifierRef = useRef(null)
  const reqRef = useRef(null)

  useEffect(() => {
    if (!isActive || !fabricCanvas) return;

    const handleMove = (e) => {
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : null);
      if (clientX !== null && clientY !== null) {
        setPos({ x: clientX, y: clientY });
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchstart', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchstart', handleMove);
    };
  }, [isActive, fabricCanvas]);

  useEffect(() => {
    if (!isActive || !fabricCanvas || !magnifierRef.current) {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      return;
    }

    const radius = 100;
    const zoom = 2.5;

    const renderLoop = () => {
      const sourceCanvas = fabricCanvas.getElement(); // the lower html5 canvas
      if (!sourceCanvas) return;

      const magCanvas = magnifierRef.current;
      if (!magCanvas) return;
      const ctx = magCanvas.getContext('2d');
      if (!ctx) return;
      
      // Clear magnifier
      ctx.clearRect(0, 0, magCanvas.width, magCanvas.height);
      
      // Calculate source coordinates (centered around mouse / touch)
      const rect = sourceCanvas.getBoundingClientRect();
      const sx = pos.x - rect.left - (radius / zoom);
      const sy = pos.y - rect.top - (radius / zoom);
      const sw = (radius * 2) / zoom;
      const sh = (radius * 2) / zoom;

      // Draw the zoomed portion
      try {
        ctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, radius * 2, radius * 2);

        // Also draw the upper-canvas (the interactive one with active objects)
        const upperCanvas = fabricCanvas.upperCanvasEl;
        if (upperCanvas) {
           ctx.drawImage(upperCanvas, sx, sy, sw, sh, 0, 0, radius * 2, radius * 2);
        }
      } catch (err) {}

      reqRef.current = requestAnimationFrame(renderLoop);
    };

    reqRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isActive, fabricCanvas, pos]);

  if (!isActive) return null;

  return (
    <div 
      style={{
        position: 'absolute',
        left: pos.x - 100,
        top: pos.y - 100,
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        border: '4px solid #3b82f6',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
        backgroundColor: 'white'
      }}
    >
      <canvas 
        ref={magnifierRef} 
        width="200" 
        height="200" 
        style={{ width: '100%', height: '100%' }}
      />
      {/* Crosshair */}
      <div style={{ position: 'absolute', top: '50%', left: '45%', right: '45%', height: '1px', background: 'rgba(255,0,0,0.5)' }} />
      <div style={{ position: 'absolute', left: '50%', top: '45%', bottom: '45%', width: '1px', background: 'rgba(255,0,0,0.5)' }} />
    </div>
  );
}
