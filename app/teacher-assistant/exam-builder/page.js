'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Sparkles, Printer, Coins, RefreshCw } from 'lucide-react'
import { supabase } from '../../../utils/supabase'
import ExamBuilderTab from '../../admin-dashboard/components/ExamBuilderTab'

export default function TeacherExamBuilderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [credits, setCredits] = useState(50)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, ai_credits_balance')
        .eq('id', user.id)
        .single()

      if (!profile || !['admin', 'teacher', 'teacher_pro', 'assistant'].includes(profile.role)) {
        alert('هذه الميزة متاحة للمعلمين ومشرفي المنصة فقط.')
        router.push('/student-dashboard')
        return
      }

      setUserRole(profile.role)
      setCredits(profile.ai_credits_balance ?? 50)
    } catch (err) {
      console.error('Error fetching teacher data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreditDeducted = (newBalance) => {
    if (newBalance !== undefined) {
      setCredits(newBalance)
    } else {
      setCredits(prev => Math.max(0, prev - 5))
    }
  }

  const handleRechargeClick = async () => {
    if (userRole === 'admin') {
      const input = prompt('أدخل عدد النقاط / الكريديتس التي تريد إضافتها لحسابك كمدير:', '500')
      if (!input) return
      const amount = parseInt(input, 10)
      if (isNaN(amount) || amount <= 0) {
        alert('يرجى إدخال رقم صحيح.')
        return
      }
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { error } = await supabase.rpc('topup_ai_credits', {
          p_user_id: user.id,
          p_amount: amount,
          p_description: `شحن مباشر للمدير في منشئ الامتحانات (${amount} كريديت)`
        })
        const newCredits = (Number(credits) || 0) + amount
        if (error) {
          await supabase.from('profiles').update({ ai_credits_balance: newCredits }).eq('id', user.id)
        }
        setCredits(newCredits)
        alert(`✅ تم شحن ${amount} كريديت بنجاح! رصيدك الآن: ${newCredits}`)
      } catch (err) {
        alert('خطأ أثناء الشحن: ' + err.message)
      }
    } else {
      router.push('/pricing')
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Tajawal, sans-serif' }}>
        <div style={{ textAlign: 'center', color: '#059669' }}>
          <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 15px' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>جاري فتح منشئ الامتحانات الذكي...</h2>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px', fontFamily: 'Tajawal, sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Navigation & Header Bar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '25px', 
          gap: '15px', 
          flexWrap: 'wrap',
          background: 'white',
          padding: '16px 20px',
          borderRadius: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => router.push('/teacher-assistant')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '42px', 
                height: '42px', 
                borderRadius: '12px', 
                background: '#f1f5f9', 
                border: 'none', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="العودة لأدوات المعلم"
            >
              <ChevronRight size={22} color="#475569" />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: 900 }}>
                  منشئ الامتحانات والاختبارات بالذكاء الاصطناعي 🖨️
                </h1>
                <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                  Gemini 3.8 Flash
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                توليد امتحانات A4 شاملة بنماذج الإجابة والتحكم بالصعوبة والعلامة المائية
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', 
              border: '1.5px solid #ddd6fe', 
              padding: '8px 16px', 
              borderRadius: '20px' 
            }}>
              <Sparkles size={18} color="#8b5cf6" />
              <span style={{ color: '#6d28d9', fontWeight: 800, fontSize: '0.95rem' }}>
                رصيد الذكاء (AI): <strong>{credits}</strong> كريديت
              </span>
            </div>

            <button 
              onClick={handleRechargeClick}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 
                color: 'white', 
                border: 'none', 
                padding: '10px 18px', 
                borderRadius: '12px', 
                fontSize: '0.88rem', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
              }}
            >
              <Coins size={16} />
              <span>{userRole === 'admin' ? '⚡ شحن رصيد الأدمن' : 'شحن رصيد AI'}</span>
            </button>
          </div>
        </div>

        {/* Embedded Exam Builder Tab */}
        <ExamBuilderTab 
          userCredits={credits} 
          onCreditDeducted={handleCreditDeducted} 
        />

      </div>
    </div>
  )
}
