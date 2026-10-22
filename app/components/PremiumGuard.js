'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../../utils/supabase'

export default function PremiumGuard({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use window.location.search instead of useSearchParams to avoid static export issues
        const search = typeof window !== 'undefined' ? window.location.search : ''
        const fullPath = `${pathname}${search}`
        const loginUrl = `/login?redirect=${encodeURIComponent(fullPath)}`

        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push(loginUrl)
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status, subscription_end_date')
          .eq('id', user.id)
          .single()

        if (!profile) {
          router.push(loginUrl)
          return
        }

        // Admins have full access
        if (profile.role === 'admin') {
          setAuthorized(true)
          setLoading(false)
          return
        }

        // Teachers and Students need to be approved and have an active subscription
        const now = new Date()
        const subEndDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null
        
        const isPremium = profile.status === 'approved' && subEndDate && subEndDate > now
        
        if (!isPremium) {
          if (['teacher', 'teacher_pro'].includes(profile.role)) {
            router.push('/teacher-assistant?locked=true')
          } else {
            router.push('/student-dashboard?locked=true')
          }
          return
        }

        // Feature lock: basic teachers cannot access virtual-classroom
        if (pathname.includes('/virtual-classroom') && profile.role === 'teacher') {
          router.push('/teacher-assistant?locked=true')
          return
        }

        setAuthorized(true)
      } catch (err) {
        console.error('Error checking premium status:', err)
        const search = typeof window !== 'undefined' ? window.location.search : ''
        const fullPath = `${pathname}${search}`
        router.push(`/login?redirect=${encodeURIComponent(fullPath)}`)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, pathname])

  if (loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', width: '100vw', background: '#f8fafc', fontFamily: 'Tajawal, sans-serif'}}>
        <h2 style={{color: '#3b82f6'}}>جاري التحقق من الاشتراك... ⏳</h2>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return <>{children}</>
}
