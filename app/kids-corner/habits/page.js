'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, Volume2, Sparkles, Trophy, Star } from 'lucide-react'
import confetti from 'canvas-confetti'
import { speakWhenReady } from '../../../utils/tts'

const HABITS = [
  { id: 1, title: 'دعاء الاستيقاظ', desc: 'الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور', icon: '☀️', color: '#f59e0b', audioText: 'الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور' },
  { id: 2, title: 'غسل اليدين والوضوء', desc: 'النظافة من الإيمان، أغسل يدي وأتوضأ للصلاة', icon: '💧', color: '#06b6d4', audioText: 'النظافة من الإيمان، أغسل يدي وأتوضأ للصلاة' },
  { id: 3, title: 'أداء الصلاة', desc: 'أصلي الفروض في وقتها لأرضي ربي وأفوز بالجنة', icon: '🕌', color: '#10b981', audioText: 'أصلي الفروض في وقتها لأرضي ربي وأفوز بالجنة' },
  { id: 4, title: 'بر الوالدين', desc: 'أسمع كلام أمي وأبي وأساعدهما وأبتسم في وجههما', icon: '👨‍👩‍👧‍👦', color: '#ec4899', audioText: 'أسمع كلام أمي وأبي وأساعدهما وأبتسم في وجههما' },
  { id: 5, title: 'آداب الطعام والشراب', desc: 'أقول "بسم الله" بيدي اليمنى و"الحمد لله" بعده', icon: '🍽️', color: '#f97316', audioText: 'أقول بسم الله بيدي اليمنى وأحمد الله بعد الطعام' },
  { id: 6, title: 'أذكار النوم والأحلام', desc: 'باسمك ربي وضعت جنبي وبك أرفعه، وأقرأ آية الكرسي', icon: '🌙', color: '#8b5cf6', audioText: 'باسمك ربي وضعت جنبي وبك أرفعه، وأقرأ آية الكرسي والمعوذات' }
]

export default function DailyHabits() {
  const router = useRouter()
  const [completedHabits, setCompletedHabits] = useState([])

  const toggleHabit = (id) => {
    let updated
    if (completedHabits.includes(id)) {
      updated = completedHabits.filter(i => i !== id)
    } else {
      updated = [...completedHabits, id]
      if (updated.length === HABITS.length) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
    }
    setCompletedHabits(updated)
  }

  const speak = (e, text) => {
    e.stopPropagation()
    speakWhenReady(text, 'Arabic Male', { rate: 0.85 })
  }

  const progressPercent = Math.round((completedHabits.length / HABITS.length) * 100)

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'radial-gradient(circle at 10% 20%, #d1fae5 0%, #ecfdf5 45%, #f0fdf4 100%)',
      padding: 'clamp(14px, 3vw, 28px)',
      paddingBottom: 'calc(clamp(24px, 4vw, 40px) + env(safe-area-inset-bottom, 0px))',
      fontFamily: 'Tajawal, -apple-system, BlinkMacSystemFont, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Header Bar */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: '12px 20px',
          boxShadow: '0 6px 20px rgba(5, 150, 105, 0.06)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <button 
            onClick={() => router.back()} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              background: 'rgba(5, 150, 105, 0.08)',
              color: '#065f46',
              border: '1px solid rgba(5, 150, 105, 0.2)',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              minHeight: '40px'
            }}
          >
            <ArrowRight size={16} />
            <span>العودة</span>
          </button>

          <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', fontWeight: 900, color: '#064e3b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🤲</span>
            <span>عاداتي اليومية وأذكاري</span>
          </h1>

          <div style={{
            background: 'linear-gradient(135deg, #059669, #10b981)',
            padding: '8px 18px',
            borderRadius: '50px',
            color: 'white',
            fontWeight: 800,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
          }}>
            <Trophy size={16} />
            <span>أنجزت: {completedHabits.length} من {HABITS.length}</span>
          </div>
        </header>

        {/* Progress Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: '20px 24px',
          boxShadow: '0 6px 20px rgba(5, 150, 105, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#064e3b', fontSize: '1.05rem' }}>
              🌟 تقدمك اليومي: {progressPercent}%
            </span>
            <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.9rem' }}>
              {completedHabits.length === HABITS.length ? '🎉 أحسنت صنعاً! أتممت كل المهام' : 'واصل إنجاز المهام لتجمع النجوم!'}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            background: 'rgba(5, 150, 105, 0.1)',
            borderRadius: '50px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #059669, #10b981)',
              borderRadius: '50px',
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />
          </div>
        </div>

        {/* Habits Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(260px, 45vw, 420px), 1fr))',
          gap: 'clamp(14px, 2.5vw, 20px)'
        }}>
          {HABITS.map((habit) => {
            const isDone = completedHabits.includes(habit.id)
            return (
              <div 
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                style={{
                  background: isDone ? 'linear-gradient(135deg, rgba(209, 250, 229, 0.95), rgba(236, 253, 245, 0.95))' : 'rgba(255, 255, 255, 0.92)',
                  border: isDone ? '2px solid #059669' : '1.5px solid rgba(5, 150, 105, 0.18)',
                  padding: '24px',
                  borderRadius: '28px',
                  cursor: 'pointer',
                  boxShadow: isDone 
                    ? '0 10px 24px rgba(5, 150, 105, 0.18)' 
                    : '0 6px 18px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '3rem', lineHeight: 1 }}>{habit.icon}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={(e) => speak(e, habit.audioText)}
                      style={{
                        background: 'rgba(5, 150, 105, 0.1)',
                        color: '#065f46',
                        border: 'none',
                        borderRadius: '50%',
                        width: '38px',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title="استمع"
                    >
                      <Volume2 size={18} />
                    </button>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isDone ? '#059669' : 'rgba(5, 150, 105, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDone ? 'white' : '#9ca3af',
                      transition: 'all 0.2s'
                    }}>
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#064e3b', margin: '0 0 6px 0', fontWeight: 900 }}>
                    {habit.title}
                  </h3>
                  <p style={{ color: '#475569', fontSize: '0.98rem', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
                    {habit.desc}
                  </p>
                </div>

                {isDone && (
                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#059669',
                    fontWeight: 800,
                    fontSize: '0.85rem'
                  }}>
                    <Star size={16} fill="#059669" />
                    <span>تم الإنجاز بنجاح! بارك الله فيك</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {completedHabits.length === HABITS.length && (
          <div style={{
            background: 'linear-gradient(135deg, #059669, #10b981)',
            color: 'white',
            padding: '24px 32px',
            borderRadius: '28px',
            textAlign: 'center',
            boxShadow: '0 12px 30px rgba(5, 150, 105, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ fontSize: '2.5rem' }}>🏆✨</div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>
              أنت بطل رائع ومسلم متميز! بارك الله فيك وفي والديك
            </h2>
            <p style={{ margin: 0, opacity: 0.95, fontSize: '1rem', fontWeight: 700 }}>
              حافظ على هذه العادات الطيبة كل يوم لتكون دائماً في القمة!
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
