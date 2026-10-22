'use client'
import { useState, useEffect } from 'react'
import { Smartphone } from 'lucide-react'

export default function ForceLandscape() {
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      // Check if it's a mobile device (width <= 900) AND in portrait mode
      const isMobile = window.innerWidth <= 900 || window.innerHeight <= 900;
      const isPortraitMode = window.innerHeight > window.innerWidth;
      
      if (isMobile && isPortraitMode) {
        setIsPortrait(true);
      } else {
        setIsPortrait(false);
      }
    };

    // Initial check
    checkOrientation();

    // Listen to resize and orientation change
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100dvh',
      backgroundColor: '#0f172a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999999,
      fontFamily: 'Tajawal, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <style>{`
        @keyframes rotatePhone {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(-90deg); }
          100% { transform: rotate(-90deg); }
        }
        .animate-rotate-phone {
          animation: rotatePhone 2s ease-in-out infinite alternate;
        }
      `}</style>
      <div className="animate-rotate-phone" style={{ marginBottom: '30px' }}>
        <Smartphone size={100} color="#10b981" />
      </div>
      <h1 style={{ fontSize: '2rem', marginBottom: '15px', color: '#f8fafc' }}>
        برجاء تدوير الهاتف بالعرض
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '400px', lineHeight: '1.6' }}>
        للحصول على أفضل تجربة تعليمية ومساحة رسم كاملة، يرجى تدوير هاتفك أو جهازك اللوحي ليكون في الوضع العرضي (Landscape).
      </p>
    </div>
  );
}
