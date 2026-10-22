'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Maximize2, Minimize2, RefreshCw, Minus, Video } from 'lucide-react'

export default function LiveCameraBubble({ 
  stream, 
  title = 'المعلم (بث مباشر)', 
  isLocal = false, 
  facingMode = 'user',
  onSwitchCamera = null,
  initialPosition = { x: 15, y: 75 }, isStatic = false
}) {
  const videoRef = useRef(null)
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMini, setIsMini] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState(false)

  // Smart boundary clamping (keeps bubble inside screen during resize or expand)
  useEffect(() => {
    if (typeof window === 'undefined' || isFullscreen || isDragging) return;
    
    const clampPosition = () => {
      let curW = 200, curH = 150;
      if (isMobile) {
        curW = mobileExpanded ? Math.min(window.innerWidth * 0.42, 170) : 70;
        curH = mobileExpanded ? Math.round(curW * 0.75) : 70;
      } else {
        curW = isMini ? 75 : 250;
        curH = isMini ? 75 : 190;
      }

      setPosition(prev => {
        const maxX = Math.max(5, window.innerWidth - curW - 5);
        const maxY = Math.max(5, window.innerHeight - curH - 5);
        const newX = Math.max(5, Math.min(maxX, prev.x));
        const newY = Math.max(5, Math.min(maxY, prev.y));
        
        if (newX !== prev.x || newY !== prev.y) {
          return { x: newX, y: newY };
        }
        return prev;
      });
    };

    clampPosition();
    window.addEventListener('resize', clampPosition);
    return () => window.removeEventListener('resize', clampPosition);
  }, [isMobile, mobileExpanded, isMini, isFullscreen, isDragging]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Single reliable video playback synchronization
  const syncVideoPlayback = useCallback(() => {
    const video = videoRef.current
    if (!video || !stream) return

    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.setAttribute('playsinline', 'true')
    video.setAttribute('webkit-playsinline', 'true')
    
    if (video.srcObject !== stream) {
      const currentTracks = video.srcObject ? video.srcObject.getTracks().map(t => t.id).sort() : [];
      const newTracks = stream.getTracks().map(t => t.id).sort();
      const isSame = currentTracks.length > 0 && currentTracks.length === newTracks.length && currentTracks.every((id, i) => id === newTracks[i]);
      
      if (!isSame) {
        video.srcObject = stream;
      }
    }

    const tryPlay = () => {
      if (!video) return
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn('[LiveCameraBubble] Play waiting for user gesture:', e)
          const unlockTouch = () => {
            if (video) video.play().catch(() => {})
            window.removeEventListener('touchstart', unlockTouch)
            window.removeEventListener('click', unlockTouch)
          }
          window.addEventListener('touchstart', unlockTouch, { once: true })
          window.addEventListener('click', unlockTouch, { once: true })
        })
      }
    }

    video.onloadedmetadata = tryPlay
    video.oncanplay = tryPlay
    tryPlay()
  }, [stream])

  useEffect(() => {
    syncVideoPlayback()

    if (stream) {
      const handleAddTrack = () => syncVideoPlayback()
      stream.onaddtrack = handleAddTrack
      
      const tracks = stream.getVideoTracks()
      tracks.forEach(track => {
        track.onunmute = syncVideoPlayback
      })

      return () => {
        stream.onaddtrack = null
        tracks.forEach(track => {
          track.onunmute = null
        })
      }
    }
  }, [stream, isMini, isFullscreen, syncVideoPlayback])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        setIsFullscreen(false)
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = (e) => {
    if (e && e.stopPropagation) e.stopPropagation()
    setIsFullscreen(prev => {
      const nextState = !prev
      if (nextState) {
        setIsMini(false)
        try {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {})
          } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen()
          }
        } catch (e) {}
      } else {
        try {
          if (document.fullscreenElement || document.webkitFullscreenElement) {
            if (document.exitFullscreen) {
              document.exitFullscreen().catch(() => {})
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen()
            }
          }
        } catch (e) {}
      }
      return nextState
    })
  }

  const handleSwitchCameraClick = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation()
    if (!onSwitchCamera || isSwitching) return
    setIsSwitching(true)
    try {
      await onSwitchCamera()
    } finally {
      setTimeout(() => {
        setIsSwitching(false)
        syncVideoPlayback()
      }, 300)
    }
  }

  // Bubble dimensions
  const normalWidth = isMobile ? 180 : 250
  const normalHeight = isMobile ? 135 : 190
  const miniSize = isMobile ? 65 : 75

  const bubbleWidth = isFullscreen ? '100vw' : (isMini ? miniSize : normalWidth)
  const bubbleHeight = isFullscreen ? '100dvh' : (isMini ? miniSize : normalHeight)

  const handleMouseDown = (e) => {
    if (isFullscreen) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleTouchStart = (e) => {
    if (isFullscreen || !e.touches[0]) return
    setIsDragging(true)
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y
    })
  }

  useEffect(() => {
    if (isFullscreen) return

    const curWidth = typeof bubbleWidth === 'number' ? bubbleWidth : 200
    const curHeight = typeof bubbleHeight === 'number' ? bubbleHeight : 150

    const handleMouseMove = (e) => {
      if (!isDragging) return
      const newX = Math.max(5, Math.min(window.innerWidth - curWidth - 5, e.clientX - dragStart.x))
      const newY = Math.max(5, Math.min(window.innerHeight - curHeight - 5, e.clientY - dragStart.y))
      setPosition({ x: newX, y: newY })
    }

    const handleTouchMove = (e) => {
      if (!isDragging || !e.touches[0]) return
      if (e.cancelable) e.preventDefault()
      const newX = Math.max(5, Math.min(window.innerWidth - curWidth - 5, e.touches[0].clientX - dragStart.x))
      const newY = Math.max(5, Math.min(window.innerHeight - curHeight - 5, e.touches[0].clientY - dragStart.y))
      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => setIsDragging(false)

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, dragStart, isFullscreen, bubbleWidth, bubbleHeight])

  if (!stream && !isLocal) return null

  // Mirror only if local front-facing camera
  const isMirrored = isLocal && facingMode === 'user'

  if (isMobile && !isFullscreen) {
    const circleSize = 70
    const expandedW = Math.min((typeof window !== 'undefined' ? window.innerWidth : 400) * 0.42, 170)
    const expandedH = Math.round(expandedW * 0.75)

    return (
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={() => setMobileExpanded(prev => !prev)}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: mobileExpanded ? `${expandedW}px` : `${circleSize}px`,
          height: mobileExpanded ? `${expandedH}px` : `${circleSize}px`,
          borderRadius: mobileExpanded ? '14px' : '50%',
          zIndex: 99999,
          background: '#0f172a',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.7), 0 0 0 3px #10b981',
          transition: isDragging ? 'none' : 'width 0.25s ease, height 0.25s ease, border-radius 0.25s ease',
          cursor: 'pointer',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* Video always fills */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={true}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            transform: isMirrored ? 'scaleX(-1)' : 'none',
            WebkitTransform: isMirrored ? 'scaleX(-1)' : 'none',
            backgroundColor: '#000',
            display: 'block',
            pointerEvents: 'none',
          }}
        />

        {/* Live dot — always visible */}
        <span style={{
          position: 'absolute', top: '6px', right: '6px',
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#10b981', boxShadow: '0 0 6px #10b981',
          pointerEvents: 'none', zIndex: 2
        }} />

        {/* Controls overlay when expanded */}
        {mobileExpanded && (
          <div
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
              display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
              padding: '4px 6px', gap: '4px', zIndex: 3
            }}
            onClick={e => e.stopPropagation()}
          >
            {onSwitchCamera && (
              <button
                onClick={handleSwitchCameraClick}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <RefreshCw size={12} />
              </button>
            )}
            <button
              onClick={toggleFullscreen}
              style={{ background: 'rgba(59,130,246,0.85)', border: 'none', color: 'white', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Maximize2 size={12} />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      style={
        isStatic ? {
            position: 'relative',
            width: '100%',
            height: '180px',
            borderRadius: '12px',
            overflow: 'hidden',
            touchAction: 'none'
          } : isFullscreen ? {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100dvh',
          zIndex: 999999,
          background: '#000',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none'
        } : isMini ? {
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${miniSize}px`,
          height: `${miniSize}px`,
          zIndex: 99999,
          background: '#0f172a',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0,0,0,0.6), 0 0 0 3px #10b981',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          touchAction: 'none',
          transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        } : {
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${normalWidth}px`,
          height: `${normalHeight}px`,
          zIndex: 99999,
          background: '#0f172a',
          borderRadius: isMobile ? '14px' : '18px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 0 2px rgba(59, 130, 246, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none',
          WebkitTransform: 'translateZ(0)'
        }
      }
      onClick={isMini ? () => setIsMini(false) : undefined}
      title={isMini ? 'انقر لتكبير الكاميرا' : undefined}
    >
      {/* Header / Control Bar (Hidden when minimized as circle) */}
      {!isMini && (
        <div 
          onMouseDown={!isStatic ? handleMouseDown : undefined}
          onTouchStart={!isStatic ? handleTouchStart : undefined}
          style={{
            background: isFullscreen ? 'rgba(15, 23, 42, 0.85)' : 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: isFullscreen ? '12px 20px' : (isMobile ? '4px 8px' : '8px 12px'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: isFullscreen || isStatic ? 'default' : 'grab',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: isFullscreen ? '1.1rem' : (isMobile ? '0.75rem' : '0.85rem'),
            fontWeight: 'bold',
            zIndex: 20,
            touchAction: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 8px #ef4444', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: (isMobile && !isFullscreen) ? 'none' : 'block' }}>{title}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {onSwitchCamera && (
              <button
                onClick={handleSwitchCameraClick}
                disabled={isSwitching}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: 'white',
                  cursor: isSwitching ? 'wait' : 'pointer',
                  padding: isFullscreen ? '8px 12px' : (isMobile ? '3px 6px' : '4px 8px'),
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: isFullscreen ? '0.9rem' : (isMobile ? '0.7rem' : '0.75rem'),
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                title={facingMode === 'user' ? 'التبديل إلى الكاميرا الخلفية 📷' : 'التبديل إلى الكاميرا الأمامية 🤳'}
              >
                <RefreshCw size={isFullscreen ? 16 : 13} style={{ transform: isSwitching ? 'rotate(180deg)' : 'none', transition: 'transform 0.5s' }} />
                <span style={{ display: (isMobile && !isFullscreen) ? 'none' : 'block' }}>{facingMode === 'user' ? 'خلفية' : 'أمامية'}</span>
              </button>
            )}

            {!isFullscreen && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsMini(true); }}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: isMobile ? '3px 6px' : '4px 8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                  fontWeight: 'bold'
                }}
                title="تصغير كأيقونة عائمة"
              >
                <Minus size={13} />
              </button>
            )}

            <button 
              onClick={toggleFullscreen}
              style={{ 
                background: isFullscreen ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer', 
                padding: isFullscreen ? '8px 16px' : (isMobile ? '3px 6px' : '4px 8px'), 
                borderRadius: '8px',
                display: 'flex', 
                alignItems: 'center',
                gap: '4px',
                fontSize: isFullscreen ? '0.9rem' : (isMobile ? '0.7rem' : '0.75rem'),
                fontWeight: 'bold',
                transition: 'all 0.2s',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}
              title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة بالكامل'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 size={16} />
                  <span style={{ display: (isMobile && !isFullscreen) ? 'none' : 'block' }}>تصغير</span>
                </>
              ) : (
                <>
                  <Maximize2 size={14} />
                  <span style={{ display: (isMobile && !isFullscreen) ? 'none' : 'block' }}>{isMobile ? 'تكبير' : 'ملء الشاشة'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Persistent Video Content (Never unmounted, smooth transitions) */}
      <div 
        onMouseDown={isMini ? handleMouseDown : undefined}
        onTouchStart={isMini ? handleTouchStart : undefined}
        onDoubleClick={!isMini ? toggleFullscreen : undefined}
        style={{ 
          flex: 1, 
          width: '100%', 
          height: '100%', 
          position: 'relative', 
          background: '#000', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          overflow: 'hidden', 
          cursor: isMini ? 'pointer' : 'default' 
        }}
      >
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted={true}
          style={{
            width: '100%',
            height: '100%',
            objectFit: isFullscreen ? 'contain' : 'cover',
            transform: isMirrored ? 'scaleX(-1)' : 'none',
            WebkitTransform: isMirrored ? 'scaleX(-1)' : 'none',
            backgroundColor: '#000',
            pointerEvents: 'none'
          }}
        />

        {/* Live Overlay Badge (Normal & Fullscreen mode) */}
        {!isMini && (
          <div style={{ position: 'absolute', bottom: isFullscreen ? '25px' : (isMobile ? '4px' : '8px'), right: isFullscreen ? '25px' : (isMobile ? '4px' : '8px'), background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', padding: isFullscreen ? '8px 16px' : (isMobile ? '2px 6px' : '3px 8px'), borderRadius: '8px', color: '#10b981', fontSize: isFullscreen ? '1rem' : (isMobile ? '0.65rem' : '0.75rem'), fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.6)', pointerEvents: 'none' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
            <span>بث مباشر</span>
          </div>
        )}

        {/* Minimized Indicator Dot */}
        {isMini && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          </div>
        )}

        {/* Floating Quick Controls in Fullscreen */}
        {isFullscreen && (
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 30 }}>
            {onSwitchCamera && (
              <button
                onClick={handleSwitchCameraClick}
                disabled={isSwitching}
                style={{
                  background: 'rgba(37, 99, 235, 0.9)',
                  color: 'white',
                  border: 'none',
                  padding: isMobile ? '8px 16px' : '10px 20px',
                  borderRadius: '50px',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '0.85rem' : '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: isSwitching ? 'wait' : 'pointer',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}
              >
                <RefreshCw size={16} style={{ transform: isSwitching ? 'rotate(180deg)' : 'none', transition: 'transform 0.5s' }} />
                <span>تبديل الكاميرا ({facingMode === 'user' ? 'خلفية' : 'أمامية'})</span>
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              style={{
                background: 'rgba(239, 68, 68, 0.9)',
                color: 'white',
                border: 'none',
                padding: isMobile ? '8px 16px' : '10px 20px',
                borderRadius: '50px',
                fontWeight: 'bold',
                fontSize: isMobile ? '0.85rem' : '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
              }}
            >
              <Minimize2 size={16} />
              <span>تصغير الكاميرا</span>
            </button>
          </div>
        )}
      </div>

    </div>
  )
}




