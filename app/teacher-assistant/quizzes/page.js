'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import QuizManagerTab from '../../admin-dashboard/components/QuizManagerTab'
import { supabase } from '../../../utils/supabase'

export default function TeacherQuizzesPage() {
  const [isPremium, setIsPremium] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status, subscription_end_date')
          .eq('id', user.id)
          .single()

        if (profile) {
          let subStatus = profile.status
          let subEnd = profile.subscription_end_date

          if (profile.role === 'assistant') {
            const { data: link } = await supabase
              .from('assistant_links')
              .select('teacher_id')
              .eq('assistant_id', user.id)
              .eq('status', 'approved')
              .maybeSingle()
            if (link) {
              const { data: tProfile } = await supabase
                .from('profiles')
                .select('status, subscription_end_date')
                .eq('id', link.teacher_id)
                .single()
              if (tProfile) {
                subStatus = tProfile.status
                subEnd = tProfile.subscription_end_date
              }
            }
          }

          const isActive = subStatus === 'approved' &&
            subEnd &&
            new Date(subEnd) > new Date()
          
          if (!isActive && profile.role !== 'admin' && profile.role !== 'teacher_pro') {
            setIsPremium(false)
          } else {
            setIsPremium(true)
            if(profile.role === 'admin') setIsAdmin(true)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>جاري التحميل...</div>

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'Tajawal, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        padding: '20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link href="/teacher-assistant" style={{ 
            color: '#64748b', 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px',
            background: '#f1f5f9',
            padding: '8px 12px',
            borderRadius: '8px',
            fontWeight: 'bold'
          }}>
            <ArrowRight size={18} /> العودة للمساعد الذكي
          </Link>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>📝 إدارة الاختبارات التفاعلية</h1>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {isPremium ? (
          <QuizManagerTab role={isAdmin ? "admin" : "teacher"} isPremium={isPremium} />
        ) : (
          <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#dc2626', marginBottom: '15px' }}>🔒 أداة مدفوعة</h2>
            <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '1.1rem' }}>هذه الأداة متاحة فقط في النسخة المدفوعة (البريميوم). قم بترقية حسابك للوصول إليها.</p>
            <Link href="/pricing" style={{ background: '#059669', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
              الترقية للنسخة المدفوعة 💎
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}


