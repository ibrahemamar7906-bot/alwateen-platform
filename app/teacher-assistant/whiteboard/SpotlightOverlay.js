'use client'

import React, { useState, useRef, useEffect } from 'react'

export default function SpotlightOverlay({ isActive, shape, isLocked }) {
  if (!isActive) return null;

  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ w: 300, h: 300 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  
  const containerRef = useRef(null)
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0, sizeW: 0, sizeH: 0 })

  // Initialize position to center of screen
  useEffect(() => {
    if (isActive && pos.x === 0 && pos.y === 0) {
      setPos({
        x: window.innerWidth / 2 - 150,
        y: window.innerHeight / 2 - 150
      })
    }
  }, [isActive])

  const handlePointerDown = (e, type) => {
    if (isLocked) return; // Prevent interaction if locked
    e.stopPropagation();
    e.preventDefault();
    
    // Support both mouse and touch
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)

    dragStartRef.current = {
      x: clientX,
      y: clientY,
      posX: pos.x,
      posY: pos.y,
      sizeW: size.w,
      sizeH: size.h
    }

    if (type === 'drag') {
      setIsDragging(true)
    } else {
      setIsResizing(true)
    }
  }

  const handlePointerMove = (e) => {
    if (!isDragging && !isResizing) return;
    e.preventDefault();

    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)

    const dx = clientX - dragStartRef.current.x
    const dy = clientY - dragStartRef.current.y

    if (isDragging) {
      setPos({
        x: dragStartRef.current.posX + dx,
        y: dragStartRef.current.posY + dy
      })
    } else if (isResizing) {
      const newW = Math.max(100, dragStartRef.current.sizeW + dx)
      const newH = shape === 'circle' || shape === 'square' 
        ? newW 
        : Math.max(100, dragStartRef.current.sizeH + dy)
      
      setSize({ w: newW, h: newH })
    }
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handlePointerMove, { passive: false })
      window.addEventListener('touchmove', handlePointerMove, { passive: false })
      window.addEventListener('mouseup', handlePointerUp)
      window.addEventListener('touchend', handlePointerUp)
    } else {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchend', handlePointerUp)
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchend', handlePointerUp)
    }
  }, [isDragging, isResizing, shape])
  // Determine border radius based on shape
  let borderRadius = '0';
  if (shape === 'circle') borderRadius = '50%';
  
  // For triangle, we use clip-path on a full screen dark overlay
  if (shape === 'triangle') {
    return (
      <div 
        ref={containerRef}
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 9999, pointerEvents: 'none', overflow: 'hidden'
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.6)', pointerEvents: 'none',
          clipPath: `polygon(0% 0%, 0% 100%, ${pos.x}px 100%, ${pos.x}px ${pos.y + size.h}px, ${pos.x + size.w}px ${pos.y + size.h}px, ${pos.x + size.w / 2}px ${pos.y}px, ${pos.x}px ${pos.y + size.h}px, ${pos.x}px 100%, 100% 100%, 100% 0%)`
        }} />
        <div 
          style={{
            position: 'absolute', left: pos.x, top: pos.y, width: size.w, height: size.h,
            pointerEvents: 'none'
          }}
        >
          {!isLocked && (
            <div 
              style={{
                 position: 'absolute', top: -4, left: -4, right: -4, bottom: -4,
                 border: '4px dashed #0ea5e9',
                 pointerEvents: 'auto',
                 cursor: 'move'
              }}
              onMouseDown={(e) => { e.stopPropagation(); handlePointerDown(e, 'drag'); }}
              onTouchStart={(e) => { e.stopPropagation(); handlePointerDown(e, 'drag'); }}
            >
              <div
                style={{
                  position: 'absolute', right: '-14px', bottom: '-14px', width: '24px', height: '24px',
                  background: '#0ea5e9', borderRadius: '50%', cursor: 'nwse-resize', border: '3px solid white',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)', zIndex: 10,
                  pointerEvents: 'auto'
                }}
                onMouseDown={(e) => { e.stopPropagation(); handlePointerDown(e, 'resize'); }}
                onTouchStart={(e) => { e.stopPropagation(); handlePointerDown(e, 'resize'); }}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!isActive) return null;
  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999, // Above canvas
        pointerEvents: 'none', // Always allow clicks to pass through the main invisible container
        overflow: 'hidden'
      }}
    >
      {/* Dark background using giant box-shadow on the cutout */}
      <div 
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          width: size.w,
          height: size.h,
          borderRadius: borderRadius,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          pointerEvents: 'none', // Let clicks pass through the hole
        }}
      >
        {/* Drag handle area (invisible, covers the border) */}
        {!isLocked && (
          <div 
            style={{
               position: 'absolute', top: -4, left: -4, right: -4, bottom: -4,
               border: '4px dashed #0ea5e9', // 4px draggable border area
               pointerEvents: 'auto',
               cursor: 'move'
            }}
            onMouseDown={(e) => { e.stopPropagation(); handlePointerDown(e, 'drag'); }}
            onTouchStart={(e) => { e.stopPropagation(); handlePointerDown(e, 'drag'); }}
          >
             {/* Resize Handle */}
            <div
              style={{
                position: 'absolute',
                right: '-14px',
                bottom: '-14px',
                width: '24px',
                height: '24px',
                background: '#0ea5e9',
                borderRadius: '50%',
                cursor: 'nwse-resize',
                border: '3px solid white',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                zIndex: 10,
                pointerEvents: 'auto'
              }}
              onMouseDown={(e) => { e.stopPropagation(); handlePointerDown(e, 'resize'); }}
              onTouchStart={(e) => { e.stopPropagation(); handlePointerDown(e, 'resize'); }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
