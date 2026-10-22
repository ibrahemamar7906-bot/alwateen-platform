'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import confetti from 'canvas-confetti'
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle, Sparkles } from 'lucide-react'

export default function PwaInstallPrompt() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [installedSuccess, setInstalledSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window === 'undefined') return

    // 1. Check if already running in standalone / PWA installed mode
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true || 
      document.referrer.includes('android-app://')

    setIsStandalone(isStandaloneMode)
    if (isStandaloneMode) return

    // 2. Detect iOS devices (iPhone/iPad/iPod)
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream
    setIsIOS(isAppleDevice)

    // 3. Listen for Android / Chrome / Edge beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Check if user dismissed recently
      const dismissedUntil = localStorage.getItem('pwa_prompt_dismissed_until')
      if (!dismissedUntil || Date.now() > parseInt(dismissedUntil, 10)) {
        setTimeout(() => {
          setShowBanner(true)
        }, 2000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 4. Listen for app installed event
    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setShowBanner(false)
      setShowIOSGuide(false)
      setIsStandalone(true)
      setInstalledSuccess(true)
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } })
      } catch (e) {}
      setTimeout(() => setInstalledSuccess(false), 5000)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    // 5. For iOS users who haven't dismissed and haven't installed
    if (isAppleDevice && !isStandaloneMode) {
      const dismissedUntil = localStorage.getItem('pwa_prompt_dismissed_until')
      if (!dismissedUntil || Date.now() > parseInt(dismissedUntil, 10)) {
        setTimeout(() => {
          setShowBanner(true)
        }, 3000)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true)
      return
    }

    if (!deferredPrompt) {
      // Fallback for browsers that support install but didn't fire event yet
      setShowIOSGuide(true)
      return
    }

    try {
      deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false)
        setDeferredPrompt(null)
        setInstalledSuccess(true)
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } })
        } catch (e) {}
        setTimeout(() => setInstalledSuccess(false), 5000)
      } else {
        dismissBanner(24) // snooze 24h
      }
    } catch (err) {
      console.error('PWA prompt error:', err)
    }
  }

  const dismissBanner = (hours = 24) => {
    setShowBanner(false)
    const expireTime = Date.now() + hours * 60 * 60 * 1000
    localStorage.setItem('pwa_prompt_dismissed_until', expireTime.toString())
  }

  const isHiddenRoute = pathname && (
    pathname.includes('whiteboard') || 
    pathname.includes('document-editor') || 
    pathname.includes('virtual-classroom') || 
    pathname.includes('/live')
  )

  if (!mounted || isStandalone || isHiddenRoute) return null

  return (
    <>
      {/* ?? Success Toast ?? */}
      {installedSuccess && (
        <div className="no-print" style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #1A2E86, #2A52C7)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '50px',
          zIndex: 99999,
          boxShadow: '0 10px 30px rgba(5,150,105,0.4)',
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'pwaSlideDown 0.4s ease',
          direction: 'rtl'
        }}>
          <CheckCircle size={20} />
          <span>تم تثبيت تطبيق منصة الوتين بنجاح! ??</span>
        </div>
      )}

      {/* ?? Floating Smart Install Banner ?? */}
      {showBanner && (
        <div className="pwa-floating-banner no-print" style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          maxWidth: '460px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '2px solid #a7f3d0',
          borderRadius: '24px',
          padding: '16px 20px',
          zIndex: 9999,
          boxShadow: '0 20px 45px rgba(5, 150, 105, 0.22)',
          animation: 'pwaSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          direction: 'rtl',
          fontFamily: 'Tajawal, sans-serif'
        }}>
          {/* Close button */}
          <button
            onClick={() => dismissBanner(48)}
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: '#f1f5f9',
              border: 'none',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
            title="إغلاق"
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            {/* App Icon */}
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #1A2E86, #2A52C7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.6rem',
              boxShadow: '0 6px 16px rgba(5,150,105,0.3)',
              flexShrink: 0
            }}>
              ??
            </div>

            <div style={{ flex: 1, paddingLeft: '24px' }}>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: '#064e3b', marginBottom: '2px' }}>
                تثبيت منصة الوتين كتطبيق ??
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, lineHeight: 1.35 }}>
                تصفح فائق السرعة، ملء الشاشة، وتجربة سلسة بضغطة زر دون الحاجة للمتصفح!
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleInstallClick}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #1A2E86 0%, #2A52C7 100%)',
                color: 'white',
                border: 'none',
                padding: '11px 16px',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(5,150,105,0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <Download size={18} />
              <span>تثبيت التطبيق الآن ?</span>
            </button>

            <button
              onClick={() => dismissBanner(24)}
              style={{
                background: '#f8fafc',
                color: '#64748b',
                border: '1px solid #cbd5e1',
                padding: '11px 16px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              لاحقاً
            </button>
          </div>
        </div>
      )}

      {/* ?? Persistent Floating Install Mini Badge (When Banner is Dismissed) ?? */}
      {!showBanner && !isStandalone && (deferredPrompt || isIOS) && (
        <button
          className="pwa-floating-banner no-print"
          onClick={handleInstallClick}
          style={{
            position: 'fixed',
            bottom: '22px',
            left: '22px',
            background: 'linear-gradient(135deg, #1A2E86, #2A52C7)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.8)',
            padding: '10px 18px',
            borderRadius: '50px',
            fontWeight: 900,
            fontSize: '0.85rem',
            cursor: 'pointer',
            zIndex: 9990,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(5, 150, 105, 0.4)',
            transition: 'transform 0.2s ease',
            direction: 'rtl'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          title="تثبيت المنصة كتطبيق على جهازك"
        >
          <Smartphone size={18} />
          <span>تثبيت التطبيق ??</span>
        </button>
      )}

      {/* ?? iOS / Safari Step-by-Step Installation Modal ?? */}
      {showIOSGuide && (
        <div className="no-print" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.72)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 99999,
          animation: 'pwaFadeIn 0.3s ease',
          direction: 'rtl',
          fontFamily: 'Tajawal, sans-serif'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '28px',
            padding: '24px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            position: 'relative',
            animation: 'pwaSlideUp 0.3s ease'
          }}>
            {/* Close */}
            <button
              onClick={() => setShowIOSGuide(false)}
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: '#f1f5f9',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '6px' }}>??</div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: 900, color: '#064e3b' }}>
                تثبيت المنصة على الآيفون / الآيباد
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                اتبع الخطوات البسيطة التالية لإضافة المنصة إلى شاشتك الرئيسية:
              </p>
            </div>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>
                  <Share size={18} />
                </div>
                <div style={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: 800 }}>
                  1. اضغط على زر المشاركة <strong>(Share)</strong> أسفل المتصفح في Safari ?.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>
                  <PlusSquare size={18} />
                </div>
                <div style={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: 800 }}>
                  2. مرر للأسفل واختر <strong>«إضافة إلى الصفحة الرئيسية»</strong> (Add to Home Screen ?).
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>
                  ?
                </div>
                <div style={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: 800 }}>
                  3. اضغط <strong>«إضافة» (Add)</strong> في أعلى الزاوية ليظهر التطبيق في شاشتك فوراً!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #1A2E86 0%, #2A52C7 100%)',
                color: 'white',
                border: 'none',
                padding: '13px',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(5,150,105,0.3)'
              }}
            >
              فهمت، شكراً لك! ??
            </button>
          </div>
        </div>
      )}

      {/* ?? CSS Keyframes ?? */}
      <style>{`
        @keyframes pwaSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pwaSlideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes pwaFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media print {
          .pwa-floating-banner,
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>
    </>
  )
}
