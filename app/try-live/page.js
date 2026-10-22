'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

function generateRoomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export default function TryLivePage() {
  const router = useRouter()

  const handleStart = () => {
    const roomId = generateRoomId()
    router.push(`/teacher-assistant/virtual-classroom?trial=true&room=${roomId}`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Tajawal, sans-serif',
      direction: 'rtl',
      padding: '20px',
    }}>
      {/* Floating background shapes */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(16,185,129,0.05)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(139,92,246,0.05)', filter: 'blur(80px)' }} />
      </div>

      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: 'center', position: 'relative' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎥</div>
        <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, margin: 0 }}>
          جرّب البث المباشر
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: 8 }}>
          بدون تسجيل — فوري وسهل
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: '40px 48px',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'right' }}>
            {[
              { icon: '✅', text: 'السبورة التفاعلية + كل الأدوات والألعاب' },
              { icon: '✅', text: 'البث المباشر بالكاميرا والميكروفون' },
              { icon: '✅', text: 'الدردشة والحضور' },
              { icon: '✅', text: 'حتى 3 طلاب في التجربة' },
              { icon: '❌', text: 'التسجيل والحفظ (يتطلب اشتراك)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ color: item.icon === '❌' ? '#64748b' : '#e2e8f0', fontSize: '0.95rem' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          style={{
            width: '100%',
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            fontSize: '1.2rem',
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'Tajawal, sans-serif',
            boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 32px rgba(16,185,129,0.4)' }}
          onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 24px rgba(16,185,129,0.3)' }}
        >
          🚀 ابدأ حصة تجريبية الآن
        </button>

        <p style={{ color: '#475569', fontSize: '0.82rem', marginTop: 16 }}>
          كل حصة تحصل على رابط جديد — سريع وبدون أي إجراءات
        </p>
      </div>

      {/* Footer link */}
      <p style={{ color: '#475569', marginTop: 32, fontSize: '0.9rem' }}>
        تريد رابطاً ثابتاً وطلاباً غير محدودين؟{' '}
        <a href="/pricing" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 700 }}>اشترك الآن</a>
      </p>
    </div>
  )
}