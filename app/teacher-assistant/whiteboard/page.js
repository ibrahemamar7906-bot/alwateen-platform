'use client'

import dummyStyles from './page.module.css';

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabase'

// Dynamically load the Whiteboard to prevent SSR issues with Fabric.js accessing 'window'
const WhiteboardComponent = dynamic(() => import('./WhiteboardComponent'), { 
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', backgroundColor: '#f8fafc', color: '#0f5132', fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'Tajawal' }}>
      جاري تحميل محرك السبورة الاحترافي... 🎨
    </div>
  )
})

export default function Page() {
  const router = useRouter()
  const [isPremium, setIsPremium] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (!['teacher', 'teacher_pro', 'admin', 'assistant'].includes(profile?.role)) {
          router.push('/student-dashboard')
          return
        }

        const now = new Date()
        const subEndDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null
        const isActive = profile.status === 'approved' && (!subEndDate || subEndDate > now)
        
        if (profile?.role === 'admin' || profile?.role === 'assistant') setIsAdmin(true)
        if (profile.role !== 'admin' && profile.role !== 'assistant' && !isActive) {
          setIsPremium(false)
        } else {
          setIsPremium(true)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    checkSubscription()
  }, [router])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', backgroundColor: '#f8fafc', color: '#0f5132', fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'Tajawal' }}>
        جاري التحقق من الصلاحيات... ⏳
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100dvh', overflow: 'hidden' }}>
      <WhiteboardComponent isPremium={isPremium} isTeacherDashboard={true} isAdmin={isAdmin} />
    </div>
  )
}


