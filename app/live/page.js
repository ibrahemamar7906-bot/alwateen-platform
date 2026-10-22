'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabase'
import { Loader2, MonitorPlay, Lock, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LiveStudentLobby() {
  const router = useRouter()
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [accessDenied, setAccessDenied] = useState(null) // null | 'need_vip' | 'need_login' | 'expired'
  const [status, setStatus] = useState('البحث عن بث مباشر للأستاذ...')
  const [error, setError] = useState(false)
  const [retryTrigger, setRetryTrigger] = useState(0)

  // 1. Check user authorization & package
  useEffect(() => {
    const verifyLiveAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          setAccessDenied('need_login')
          setCheckingAccess(false)
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status, subscription_end_date, plan_type, has_live')
          .eq('id', session.user.id)
          .single()

        // Teachers and admins always have access
        if (['teacher', 'teacher_pro', 'admin', 'assistant'].includes(profile?.role)) {
          setCheckingAccess(false)
          return
        }

        // Student checks
        const now = new Date()
        const subEndDate = profile?.subscription_end_date ? new Date(profile.subscription_end_date) : null
        const isSubscriptionActive = profile?.status === 'approved' && subEndDate && subEndDate > now

        if (!isSubscriptionActive) {
          setAccessDenied('expired')
          setCheckingAccess(false)
          return
        }

        // Check if student has Live permission or VIP plan
        const hasLivePermission = !!profile?.has_live || profile?.plan_type === 'student_vip'
        if (!hasLivePermission) {
          setAccessDenied('need_vip')
          setCheckingAccess(false)
          return
        }

        // Access granted!
        setCheckingAccess(false)
      } catch (err) {
        console.error('Error verifying live access:', err)
        setCheckingAccess(false)
      }
    }

    verifyLiveAccess()
  }, [router])

  // 2. Connect to lobby if authorized
  useEffect(() => {
    if (checkingAccess || accessDenied) return

    let isActive = true
    setError(false)
    setStatus('البحث عن بث مباشر للأستاذ...')

    const timeout = setTimeout(() => {
      if (isActive) {
        setError(true)
        setStatus('عذراً، الأستاذ لم يبدأ البث المباشر بعد. يرجى الانتظار والمحاولة لاحقاً.')
      }
    }, 10000)

    const lobbyChannel = supabase.channel('global-lobby', {
      config: { broadcast: { ack: false } }
    })

    lobbyChannel
      .on('broadcast', { event: 'current_room' }, ({ payload }) => {
        if (!isActive) return
        clearTimeout(timeout)
        setStatus('تم العثور على بث مباشر! جاري توجيهك للقاعة...')
        setTimeout(() => {
          router.push(`/virtual-classroom?room=${payload.roomId}`)
        }, 1000)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && isActive) {
          await lobbyChannel.send({
            type: 'broadcast',
            event: 'request_room'
          })
        }
      })

    return () => {
      isActive = false
      clearTimeout(timeout)
      lobbyChannel.unsubscribe()
    }
  }, [checkingAccess, accessDenied, router, retryTrigger])

  // Render Access Denied: Need VIP Screen
  if (accessDenied === 'need_vip') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
        fontFamily: 'Tajawal, sans-serif',
        direction: 'rtl',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '40px 30px',
          borderRadius: '28px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          maxWidth: '480px',
          width: '100%',
          border: '2px solid rgba(251, 191, 36, 0.4)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            color: '#b45309',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 20px rgba(245, 158, 11, 0.25)'
          }}>
            <Lock size={40} />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #fcd34d',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '900',
            marginBottom: '15px'
          }}>
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>ميزة خاصة بمشتركي باقة VIP</span>
          </div>

          <h2 style={{ color: '#0f172a', marginBottom: '12px', fontWeight: '900', fontSize: '1.4rem' }}>
            البث المباشر غير مفعل في باقتك الحالية
          </h2>

          <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.7', marginBottom: '25px' }}>
            أهلاً بك يا بطل! أنت مشترك حالياً في <strong>باقة التفوق (بدون لايف) 🎓</strong>.
            لحضور حصص البث المباشر التفاعلية والتحدث بالصوت والصورة مع الأستاذ، يمكنك الترقية إلى <strong>باقة VIP الشاملة ⭐</strong>.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              href="/pricing"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                padding: '14px 20px',
                borderRadius: '14px',
                fontSize: '1.05rem',
                fontWeight: '900',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)'
              }}
            >
              <span>ترقية إلى باقة VIP مع اللايف ⭐</span>
            </Link>

            <Link
              href="/student-dashboard"
              style={{
                background: '#f8fafc',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '12px 20px',
                borderRadius: '14px',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ArrowRight size={16} />
              <span>العودة للوحة التحكم ومتابعة الدروس</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Render Access Denied: Need Login or Expired
  if (accessDenied) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        fontFamily: 'Tajawal, sans-serif',
        direction: 'rtl',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '35px',
          borderRadius: '24px',
          textAlign: 'center',
          maxWidth: '440px',
          width: '100%'
        }}>
          <h2 style={{ color: '#0f172a', marginBottom: '10px' }}>
            {accessDenied === 'need_login' ? 'يرجى تسجيل الدخول' : 'الاشتراك غير سارٍ'}
          </h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>
            {accessDenied === 'need_login'
              ? 'يجب تسجيل الدخول بحسابك للوصول إلى قاعات البث المباشر.'
              : 'اشتراكك منتهٍ أو بانتظار التجديد. يرجى تجديد الاشتراك للمتابعة.'}
          </p>
          <Link
            href={accessDenied === 'need_login' ? '/login' : '/pricing'}
            style={{
              display: 'block',
              background: '#2563eb',
              color: 'white',
              padding: '12px',
              borderRadius: '12px',
              fontWeight: 'bold',
              textDecoration: 'none'
            }}
          >
            {accessDenied === 'need_login' ? 'تسجيل الدخول' : 'تجديد الاشتراك'}
          </Link>
        </div>
      </div>
    )
  }

  // Normal Lobby Screen
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'url(/bg-students.jpg) center/cover fixed',
      fontFamily: 'Tajawal, sans-serif',
      direction: 'rtl'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '40px',
        borderRadius: '30px',
        textAlign: 'center',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        maxWidth: '460px',
        width: '90%'
      }}>
        <div style={{
          background: error ? '#fef2f2' : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          width: '80px',
          height: '80px',
          borderRadius: '25px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: error ? '#ef4444' : '#3b82f6',
          boxShadow: error ? '0 10px 20px rgba(239, 68, 68, 0.1)' : '0 10px 20px rgba(59, 130, 246, 0.1)'
        }}>
          {checkingAccess ? (
            <Loader2 size={40} className="spinner" style={{ animation: 'spin 1.5s linear infinite' }} />
          ) : error ? (
            <MonitorPlay size={40} />
          ) : (
            <Loader2 size={40} className="spinner" style={{ animation: 'spin 2s linear infinite' }} />
          )}
        </div>
        
        <h2 style={{ color: '#1e293b', marginBottom: '15px', fontWeight: '900' }}>البث المباشر (VIP)</h2>
        
        <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '30px' }}>
          {checkingAccess ? 'جاري التحقق من صلاحيات الباقة...' : status}
        </p>

        {error && (
          <button 
            onClick={() => setRetryTrigger(prev => prev + 1)}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '15px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              marginBottom: '15px'
            }}
          >
            حاول مرة أخرى 🔄
          </button>
        )}

        <button 
          onClick={() => router.push('/student-dashboard')}
          style={{
            background: 'white',
            color: '#64748b',
            border: '1px solid #e2e8f0',
            padding: '12px 30px',
            borderRadius: '15px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          العودة للوحة التحكم
        </button>
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
