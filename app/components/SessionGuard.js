'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { supabase } from '../../utils/supabase'
import { Suspense } from 'react'

function SessionGuardInner({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isChecking, setIsChecking] = useState(true)

  const isTrialMode = searchParams?.get('trial') === 'true'

  const isPublicPath = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/register' || 
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/pricing' ||
    pathname === '/about' ||
    pathname === '/contact' ||
    pathname === '/terms' ||
    pathname === '/privacy' ||
    pathname === '/refund' ||
    pathname === '/shipping' ||
    pathname.startsWith('/free-whiteboard') ||
    pathname.startsWith('/teacher-assistant') ||
    pathname.startsWith('/sec-') ||
    pathname.startsWith('/prep-') ||
    pathname.startsWith('/primary-') ||
    pathname.startsWith('/virtual-classroom') ||
    pathname.startsWith('/try-live') ||
    pathname.startsWith('/live/trial') ||
    pathname.startsWith('/azkar') ||
    pathname.startsWith('/quiz') ||
    pathname.startsWith('/quick-quiz') ||
    isTrialMode

  useEffect(() => {
    let subscription = null;
    let isActive = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          sessionStorage.removeItem('reloaded_for_auth');
          if (!isPublicPath) {
            router.push('/login')
          }
          setIsChecking(false)
          return
        }

        const user = session.user
        if (!user) return
        sessionStorage.removeItem('reloaded_for_auth');

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('active_session_id')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (profile) {
          const localSessionId = localStorage.getItem('active_session_id')
          
          if (profile.active_session_id && profile.active_session_id !== localSessionId) {
            console.log('Session mismatch detected. Logging out.')
            await supabase.auth.signOut()
            localStorage.removeItem('active_session_id')
            router.push('/login?error=session_conflict')
            return
          }
        }

        if (!subscription) {
          const channelName = `session-guard-${user.id}-${Date.now()}-${Math.random()}`
          subscription = supabase.channel(channelName)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${user.id}`,
              },
              async (payload) => {
                const newSessionId = payload.new.active_session_id
                const localSessionId = localStorage.getItem('active_session_id')
                if (newSessionId && newSessionId !== localSessionId) {
                  console.log('Realtime session conflict detected. Logging out.')
                  await supabase.auth.signOut()
                  localStorage.removeItem('active_session_id')
                  router.push('/login?error=session_conflict')
                }
              }
            )
            .subscribe()
        }

      } catch (e) {
        console.error('Session guard error:', e)
        // If the session is invalid or expired (401 Unauthorized from REST or Realtime), force sign out
        // to clear the broken local session and allow the user to continue as anon or re-login.
        if (e?.status === 401 || e?.message?.includes('Auth') || e?.code === 'PGRST301' || e?.message?.includes('JWT')) {
          console.warn('Session is invalid. Forcing sign out...');
          if (sessionStorage.getItem('reloaded_for_auth')) {
             console.error('Already reloaded for auth, skipping to prevent infinite loop.');
             return;
          }
          sessionStorage.setItem('reloaded_for_auth', 'true');
          await supabase.auth.signOut().catch(()=>{});
          localStorage.removeItem('active_session_id');
          if (!isPublicPath) {
             router.push('/login');
          } else {
             window.location.reload();
          }
        }
      } finally {
        if (isActive) {
          setIsChecking(false)
        }
      }
    }

    checkSession()

    const handleFocus = () => {
      checkSession()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      isActive = false
      window.removeEventListener('focus', handleFocus)
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [pathname, router, isPublicPath])

  if (isChecking && !isPublicPath) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', color: '#0f5132', fontFamily: 'Tajawal, sans-serif', fontSize: '1.2rem', fontWeight: 'bold' }}>
        جاري التحقق من الجلسة... 🛡️
      </div>
    )
  }

  return <>{children}</>
}

export default function SessionGuard({ children }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <SessionGuardInner>{children}</SessionGuardInner>
    </Suspense>
  )
}

