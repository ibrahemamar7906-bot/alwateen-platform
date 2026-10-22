import Link from 'next/link'
import { Home, ArrowRight, BookOpen } from 'lucide-react'

export const metadata = {
  title: '404 - الصفحة غير موجودة | منصة الوتين التعليمية',
  description: 'الصفحة التي تبحث عنها غير موجودة في منصة الوتين التعليمية.',
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      fontFamily: 'Tajawal, sans-serif'
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '40px 30px',
        boxShadow: '0 20px 45px rgba(26, 46, 134, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)',
        borderTop: '5px solid #1A2E86'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(26, 46, 134, 0.1), rgba(222, 162, 74, 0.15))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#1A2E86',
          fontSize: '2rem'
        }}>
          🔍
        </div>

        <h1 style={{
          fontSize: '2.4rem',
          fontWeight: 900,
          color: '#1A2E86',
          margin: '0 0 10px 0'
        }}>
          404
        </h1>

        <h2 style={{
          fontSize: '1.3rem',
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 14px 0'
        }}>
          عذراً، هذه الصفحة غير موجودة!
        </h2>

        <p style={{
          fontSize: '0.98rem',
          color: '#64748b',
          lineHeight: 1.6,
          margin: '0 0 28px 0'
        }}>
          يبدو أن الرابط الذي حاولت الوصول إليه قد تم نقله أو غير متاح. يمكنك العودة للصفحة الرئيسية لمنصة الوتين التعليمية ومتابعة دروسك.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #1A2E86, #0F1D5C)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(26, 46, 134, 0.3)'
            }}
          >
            <Home size={18} />
            <span>الصفحة الرئيسية</span>
          </Link>

          <Link
            href="/free-whiteboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f8fafc',
              color: '#1A2E86',
              border: '1.5px solid #cbd5e1',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.95rem',
              textDecoration: 'none'
            }}
          >
            <BookOpen size={18} />
            <span>السبورة التفاعلية</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
