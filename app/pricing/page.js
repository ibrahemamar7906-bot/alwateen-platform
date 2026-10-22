'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabase'
import styles from './page.module.css'
import { 
  Check, Copy, MessageCircle, Phone, Sparkles, ShieldCheck, 
  Zap, ArrowRight, X, Bot, Coins, Star, GraduationCap, School, BookOpen 
} from 'lucide-react'

export default function PricingPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('students') // 'students' | 'teachers' | 'ai_credits'
  const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly' | 'term' | 'yearly'
  const [userRole, setUserRole] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [copiedNumber, setCopiedNumber] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, phone')
          .eq('id', session.user.id)
          .single()
        if (profile) {
          setUserRole(profile.role)
          setUserProfile(profile)
          if (['teacher', 'teacher_pro', 'admin'].includes(profile.role)) {
            setActiveCategory('teachers')
          }
        }
      }
    }
    fetchUser()
  }, [])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedNumber(text)
    setTimeout(() => setCopiedNumber(null), 2500)
  }

  const getWhatsAppLink = (planType) => {
    let planName = ''
    let price = ''
    let duration = ''
    
    if (planType === 'student_basic') {
      planName = 'خطة الطالب - باقة التفوق (بدون لايف) 🎓'
      price = billingCycle === 'monthly' ? '60' : billingCycle === 'term' ? '250' : '450'
      duration = billingCycle === 'monthly' ? 'الاشتراك الشهري (+ 20 كريديت AI)' : billingCycle === 'term' ? 'اشتراك الترم (+ 20 كريديت AI/شهر)' : 'الاشتراك السنوي (+ 20 كريديت AI/شهر)'
    } else if (planType === 'student_vip') {
      planName = 'خطة الطالب - باقة VIP الشاملة (مع البث المباشر) ⭐'
      price = billingCycle === 'monthly' ? '100' : billingCycle === 'term' ? '400' : '700'
      duration = billingCycle === 'monthly' ? 'الاشتراك الشهري (+ 50 كريديت AI)' : billingCycle === 'term' ? 'اشتراك الترم (+ 50 كريديت AI/شهر)' : 'الاشتراك السنوي (+ 50 كريديت AI/شهر)'
    } else if (planType === 'teacher_basic') {
      planName = 'خطة المعلم التفاعلي (حضوري وسنتر) 👨‍🏫'
      price = billingCycle === 'monthly' ? '75' : billingCycle === 'term' ? '300' : '550'
      duration = billingCycle === 'monthly' ? 'الاشتراك الشهري (+ 50 كريديت AI)' : billingCycle === 'term' ? 'اشتراك الترم (+ 50 كريديت AI/شهر)' : 'الاشتراك السنوي (+ 50 كريديت AI/شهر)'
    } else if (planType === 'teacher_pro') {
      planName = 'خطة المعلم الشاملة (برو مع البث المباشر) 🚀'
      price = billingCycle === 'monthly' ? '150' : billingCycle === 'term' ? '600' : '1000'
      duration = billingCycle === 'monthly' ? 'الاشتراك الشهري (+ 100 كريديت AI)' : billingCycle === 'term' ? 'اشتراك الترم (+ 100 كريديت AI/شهر)' : 'الاشتراك السنوي (+ 100 كريديت AI/شهر)'
    } else if (planType === 'credits_100') {
      planName = 'شحن رصيد الذكاء الاصطناعي (100 كريديت) 💎'
      price = '15'
      duration = 'رصيد إضافي دائم'
    } else if (planType === 'credits_300') {
      planName = 'شحن رصيد الذكاء الاصطناعي (300 كريديت) 💎'
      price = '35'
      duration = 'رصيد إضافي دائم (الأكثر توفيراً)'
    } else if (planType === 'credits_1000') {
      planName = 'شحن رصيد الذكاء الاصطناعي (1000 كريديت) 💎'
      price = '80'
      duration = 'رصيد إضافي دائم (باقة المحترفين)'
    }

    const userName = userProfile?.full_name ? `الاسم: ${userProfile.full_name}` : 'مشترك جديد'
    
    const text = encodeURIComponent(
      `السلام عليكم يا المستر إبراهيم عمار، أنا (${userName}) وأرغب في الاشتراك وتفعيل (${planName} - ${duration} بقيمة ${price} ج.م) عبر منصة الوتين التعليمية.\nمرفق لسيادتكم إيصال التحويل للتفعيل فوراً.`
    )
    return `https://wa.me/201507952002?text=${text}`
  }

  return (
    <div className={styles.pageContainer}>

      {/* Decorative Background Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(26,46,134,0.12) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      <div className={styles.contentWrapper}>

        {/* Back Link */}
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => router.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'white',
              border: '1px solid #cbd5e1',
              padding: '8px 18px',
              borderRadius: '50px',
              color: '#065f46',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            <ArrowRight size={16} />
            <span>العودة للمنصة</span>
          </button>
        </div>

        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 22px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '30px', color: 'white', fontWeight: 900, marginBottom: '18px', boxShadow: '0 6px 18px rgba(245, 158, 11, 0.3)', animation: 'pulse 2s infinite' }}>
            <Sparkles size={18} />
            <span>باقات الاشتراك والتفوق - منصة المستر إبراهيم عمار</span>
          </div>
          <h1 className={styles.headerTitle}>
            استثمر في مستقبلك بأفضل الأسعار
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#475569', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6, fontWeight: 600 }}>
            اختر باقتك التعليمية واستمتع بأقوى أدوات المناهج والألعاب التفاعلية والذكاء الاصطناعي
          </p>
        </div>

        {/* Category Tabs: Students / Teachers / AI Credits */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveCategory('students')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '16px',
              border: activeCategory === 'students' ? '2px solid #1A2E86' : '1.5px solid #cbd5e1',
              background: activeCategory === 'students' ? 'linear-gradient(135deg, #1A2E86, #2A52C7)' : 'white',
              color: activeCategory === 'students' ? 'white' : '#334155',
              fontWeight: 900,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: activeCategory === 'students' ? '0 6px 20px rgba(26,46,134,0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
              transition: 'all 0.25s ease'
            }}
          >
            <GraduationCap size={20} />
            <span>باقات الطلاب 🎓</span>
          </button>

          <button
            onClick={() => setActiveCategory('teachers')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '16px',
              border: activeCategory === 'teachers' ? '2px solid #3b82f6' : '1.5px solid #cbd5e1',
              background: activeCategory === 'teachers' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'white',
              color: activeCategory === 'teachers' ? 'white' : '#334155',
              fontWeight: 900,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: activeCategory === 'teachers' ? '0 6px 20px rgba(59,130,246,0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
              transition: 'all 0.25s ease'
            }}
          >
            <School size={20} />
            <span>باقات المعلمين 👨‍🏫</span>
          </button>


        </div>

        {/* Free Word-like Feature Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
          border: '1.5px solid #93c5fd',
          borderRadius: '16px',
          padding: '14px 20px',
          maxWidth: '850px',
          margin: '0 auto 30px auto',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textAlign: 'right',
          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.06)'
        }}>
          <div style={{ background: '#3b82f6', color: 'white', borderRadius: '50%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookOpen size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 900, color: '#1e3a8a', fontSize: '0.96rem', marginBottom: '3px' }}>
              هدية مجانية 100% لجميع الطلاب والمعلمين:
            </div>
            <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, fontWeight: 600 }}>
              محرر الكتابة وتنسيق النصوص وتدقيق الإملاء الأساسي (شبيه ببرنامج Word) <strong>مجاني بالكامل للجميع بدون أي رسوم</strong>. الكريديتس مخصصة حصرياً للميزات المتقدمة للذكاء الاصطناعي (مثل تصحيح التعبير التفصيلي وتوليد الأسئلة التلقائي).
            </div>
          </div>
        </div>

        {/* Billing Toggle (Shown for Students and Teachers) */}
        {activeCategory !== 'ai_credits' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '35px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.9)', padding: '6px', borderRadius: '16px', display: 'flex', gap: '6px', flexWrap: 'wrap', backdropFilter: 'blur(10px)', border: '1.5px solid #a7f3d0', boxShadow: '0 4px 14px rgba(26,46,134,0.08)' }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '10px 22px',
                  borderRadius: '12px',
                  border: 'none',
                  background: billingCycle === 'monthly' ? 'linear-gradient(135deg, #1A2E86, #2A52C7)' : 'transparent',
                  color: billingCycle === 'monthly' ? 'white' : '#64748b',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                شهري 📅
              </button>
              <button
                onClick={() => setBillingCycle('term')}
                style={{
                  padding: '10px 22px',
                  borderRadius: '12px',
                  border: 'none',
                  background: billingCycle === 'term' ? 'linear-gradient(135deg, #1A2E86, #2A52C7)' : 'transparent',
                  color: billingCycle === 'term' ? 'white' : '#64748b',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                ترم كامل (توفير ممتاز) 🎒
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                style={{
                  padding: '10px 22px',
                  borderRadius: '12px',
                  border: 'none',
                  background: billingCycle === 'yearly' ? 'linear-gradient(135deg, #1A2E86, #2A52C7)' : 'transparent',
                  color: billingCycle === 'yearly' ? 'white' : '#64748b',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                سنوي (أعلى توفير) 🎁
              </button>
            </div>
          </div>
        )}

        {/* Quick Payment Instructions Banner */}
        <div style={{
          background: 'white',
          border: '1.5px solid #86efac',
          borderRadius: '20px',
          padding: '18px 24px',
          maxWidth: '850px',
          margin: '0 auto 35px auto',
          boxShadow: '0 6px 20px rgba(5, 150, 105, 0.08)',
          textAlign: 'right'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#065f46', fontWeight: 900, fontSize: '1.05rem' }}>
            <Zap size={20} color="#1A2E86" />
            <span>خطوات التفعيل الفوري (فودافون كاش أو إنستاباي):</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '12px' }}>
            <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '14px', border: '1px solid #d1fae5' }}>
              <div style={{ fontWeight: 800, color: '#0F1D5C', fontSize: '0.9rem', marginBottom: '4px' }}>1. تحويل القيمة 💸</div>
              <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                حول المبلغ المطلوب عبر فودافون كاش أو تطبيق إنستاباي.
              </div>
            </div>

            <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '14px', border: '1px solid #d1fae5' }}>
              <div style={{ fontWeight: 800, color: '#0F1D5C', fontSize: '0.9rem', marginBottom: '4px' }}>2. تصوير الإيصال 📸</div>
              <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                التقط لقطة شاشة (Screenshot) واضحة لإشعار التحويل.
              </div>
            </div>

            <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '14px', border: '1px solid #d1fae5' }}>
              <div style={{ fontWeight: 800, color: '#0F1D5C', fontSize: '0.9rem', marginBottom: '4px' }}>3. تفعيل الحساب 🚀</div>
              <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                اضغط زر الواتساب وأرسل الصورة لالمستر إبراهيم عمار ليتم تفعيل حسابك مباشرة.
              </div>
            </div>
          </div>

          {/* Numbers Bar */}
          <div style={{
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '1px dashed #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>أرقام فودافون كاش وإنستاباي المعتمدة:</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['01507952002'].map(num => (
                <button
                  key={num}
                  onClick={() => copyToClipboard(num)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontWeight: 900,
                    fontSize: '0.92rem',
                    color: '#0F1D5C',
                    cursor: 'pointer',
                    direction: 'ltr'
                  }}
                  title="انقر لنسخ الرقم"
                >
                  <Copy size={14} color="#64748b" />
                  <span>{num}</span>
                  {copiedNumber === num && <span style={{ color: '#1A2E86', fontSize: '0.75rem', fontWeight: 800 }}>✓ تم النسخ</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION 1: STUDENT PLANS ── */}
        {activeCategory === 'students' && (
          <div className={styles.cardsContainer} style={{ width: '100%' }}>

            {/* Plan 1: باقة التفوق (المسجلة + الألعاب) */}
            <div className={styles.pricingCard} style={{ border: '2px solid #2A52C7' }}>
              <div style={{ position: 'absolute', top: '20px', left: '20px', padding: '4px 12px', background: '#dcfce7', color: '#15803d', borderRadius: '15px', fontSize: '0.82rem', fontWeight: 800 }}>
                مذاكرة ذكية 🎒
              </div>

              <h2 style={{ fontSize: '1.75rem', marginBottom: '8px', color: '#064e3b', fontWeight: 900, marginTop: '8px' }}>
                باقة التفوق
              </h2>
              <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.92rem', minHeight: '44px' }}>
                الرحلة التفاعلية المتكاملة في المناهج والألعاب والتحديات وصائد الإعراب.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '3.2rem', fontWeight: 900, color: '#1A2E86' }}>
                  {billingCycle === 'monthly' ? '60' : billingCycle === 'term' ? '250' : '450'}
                </span>
                <span style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 700 }}> ج.م / {billingCycle === 'monthly' ? 'شهر' : billingCycle === 'term' ? 'ترم' : 'سنة'}</span>
              </div>

              {/* AI Bonus Pill */}
              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '8px 12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#6d28d9', fontWeight: 800, fontSize: '0.86rem' }}>
                <Bot size={18} color="#7c3aed" />
                <span>هدية إضافية: <strong>+ 20 كريديت AI شهرياً</strong> للتصحيح الذكي</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px 0', display: 'flex', flexDirection: 'column', gap: '11px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#1A2E86" /> فتح جميع دروس ووحدات المنهج لمرحلتك الدراسية
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#1A2E86" /> جميع الألعاب التفاعلية (ماريو، قطار النحو، صب واي)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#1A2E86" /> ساحة المبارزات الحية (PvP Battles) مع زملائك
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#1A2E86" /> بنك الأسئلة واختبارات الشهور بنظام منع الغش
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#1A2E86" /> محرر الكتابة والتدقيق الإملائي مجاناً 100%
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#1A2E86" /> لوحة الشرف ونظام النقاط والأوسمة (Gamification)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#1A2E86" /> بوابة ولي الأمر لمتابعة الدرجات والحماس اليومي
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.92rem', fontWeight: 700, textDecoration: 'line-through' }}>
                  <X size={18} color="#ef4444" /> حصص البث المباشر (اللايف) غير متوفرة
                </li>
              </ul>

              <a
                href={getWhatsAppLink('student_basic')}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '14px',
                  fontSize: '1.02rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #1A2E86 0%, #0F1D5C 100%)',
                  color: 'white',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  boxShadow: '0 8px 20px rgba(5, 150, 105, 0.25)',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  textAlign: 'center'
                }}
              >
                <MessageCircle size={20} />
                <span>اشترك في باقة التفوق 💬</span>
              </a>
            </div>

            {/* Plan 2: باقة VIP الشاملة (مع اللايف) */}
            <div className={styles.pricingCard} style={{ border: '2.5px solid #f59e0b', transform: 'scale(1.02)' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', padding: '5px 20px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 900, boxShadow: '0 4px 12px rgba(245,158,11,0.35)' }}>
                الأكثر طلباً وتميزاً ⭐
              </div>
              <div style={{ position: 'absolute', top: '20px', left: '20px', padding: '4px 12px', background: '#fef3c7', color: '#b45309', borderRadius: '15px', fontSize: '0.82rem', fontWeight: 800 }}>
                مع البث المباشر 📡
              </div>

              <h2 style={{ fontSize: '1.75rem', marginBottom: '8px', color: '#92400e', fontWeight: 900, marginTop: '8px' }}>
                باقة VIP الشاملة
              </h2>
              <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.92rem', minHeight: '44px' }}>
                حضور حصص البث المباشر التفاعلية مع الأستاذ أسبوعياً ومتابعة شخصية مستمرة.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '3.2rem', fontWeight: 900, color: '#d97706' }}>
                  {billingCycle === 'monthly' ? '100' : billingCycle === 'term' ? '400' : '700'}
                </span>
                <span style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 700 }}> ج.م / {billingCycle === 'monthly' ? 'شهر' : billingCycle === 'term' ? 'ترم' : 'سنة'}</span>
              </div>

              {/* AI Bonus Pill */}
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px', padding: '8px 12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 800, fontSize: '0.86rem' }}>
                <Bot size={18} color="#d97706" />
                <span>هدية إضافية: <strong>+ 50 كريديت AI شهرياً</strong> للتصحيح والأسئلة</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px 0', display: 'flex', flexDirection: 'column', gap: '11px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#f59e0b" /> <strong>كل مميزات باقة التفوق كاملة بدون استثناء</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#f59e0b" /> <strong>حضور حصص البث المباشر (Live) أسبوعياً مع الأستاذ</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#f59e0b" /> السبورة التفاعلية المتزامنة لحظياً أثناء البث
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#f59e0b" /> المشاركة في الألعاب الجماعية وعجلة الحظ في اللايف
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#f59e0b" /> التفاعل الصوتي ورفع اليد لطرح الأسئلة المباشرة
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#f59e0b" /> تصحيح الواجبات الدورية ومتابعة درجات التقييم
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#f59e0b" /> شهادات تقدير دورية معتمدة من الأستاذ للمتفوقين
                </li>
              </ul>

              <a
                href={getWhatsAppLink('student_vip')}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '14px',
                  fontSize: '1.02rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  textAlign: 'center'
                }}
              >
                <MessageCircle size={20} />
                <span>اشترك في باقة VIP الشاملة 💬</span>
              </a>
            </div>

          </div>
        )}

        {/* ── SECTION 2: TEACHER PLANS ── */}
        {activeCategory === 'teachers' && (
          <div className={styles.cardsContainer} style={{ width: '100%' }}>

            {/* Teacher Plan 1: المعلم التفاعلي */}
            <div className={styles.pricingCard} style={{ border: '2px solid #3b82f6' }}>
              <div style={{ position: 'absolute', top: '20px', left: '20px', padding: '4px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: '15px', fontSize: '0.82rem', fontWeight: 800 }}>
                حضوري وسنتر 👨‍🏫
              </div>

              <h2 style={{ fontSize: '1.75rem', marginBottom: '8px', color: '#1e3a8a', fontWeight: 900, marginTop: '8px' }}>
                المعلم التفاعلي
              </h2>
              <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.92rem', minHeight: '44px' }}>
                أقوى أدوات الشرح الحضوري بالسبورة الذكية والألعاب وإدارة الحضور والاختبارات.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '3.2rem', fontWeight: 900, color: '#2563eb' }}>
                  {billingCycle === 'monthly' ? '75' : billingCycle === 'term' ? '300' : '550'}
                </span>
                <span style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 700 }}> ج.م / {billingCycle === 'monthly' ? 'شهر' : billingCycle === 'term' ? 'ترم' : 'سنة'}</span>
              </div>

              {/* AI Bonus Pill */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '8px 12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontWeight: 800, fontSize: '0.86rem' }}>
                <Bot size={18} color="#2563eb" />
                <span>هدية إضافية: <strong>+ 50 كريديت AI شهرياً</strong> لصياغة الامتحانات</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px 0', display: 'flex', flexDirection: 'column', gap: '11px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#2563eb" /> السبورة الذكية التفاعلية بكل أدوات الرسم والمعامل
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#2563eb" /> تشغيل الألعاب التعليمية التفاعلية داخل الحصة والسنتر
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#2563eb" /> محرر الامتحانات المطبوعة A4 بدون AI مجاناً بالكامل
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#2563eb" /> دفتر المتابعة الإلكتروني ورصد حضور ودرجات ومصروفات الطلاب
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#2563eb" /> صانع الشهادات التقديرية PDF ولوحات شرف المتفوقين
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#2563eb" /> تقارير أولياء الأمور الذكية ومشاركتها عبر واتساب
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.92rem', fontWeight: 700, textDecoration: 'line-through' }}>
                  <X size={18} color="#ef4444" /> البث المباشر (اللايف) غير متوفر
                </li>
              </ul>

              <a
                href={getWhatsAppLink('teacher_basic')}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '14px',
                  fontSize: '1.02rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  textAlign: 'center'
                }}
              >
                <MessageCircle size={20} />
                <span>اشتراك المعلم التفاعلي 💬</span>
              </a>
            </div>

            {/* Teacher Plan 2: المعلم برو (مع البث المباشر) */}
            <div className={styles.pricingCard} style={{ border: '2.5px solid #8b5cf6', transform: 'scale(1.02)' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', padding: '5px 20px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 900, boxShadow: '0 4px 12px rgba(139,92,246,0.35)' }}>
                الأقوى للمعلم الأونلاين 🚀
              </div>
              <div style={{ position: 'absolute', top: '20px', left: '20px', padding: '4px 12px', background: '#ede9fe', color: '#6d28d9', borderRadius: '15px', fontSize: '0.82rem', fontWeight: 800 }}>
                شامل البث المباشر 📡
              </div>

              <h2 style={{ fontSize: '1.75rem', marginBottom: '8px', color: '#5b21b6', fontWeight: 900, marginTop: '8px' }}>
                المعلم الشامل (برو)
              </h2>
              <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.92rem', minHeight: '44px' }}>
                فصول افتراضية وبث مباشر صوت وفيديو عالي الاستقرار مع براند المعلم وربط المساعدين.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '3.2rem', fontWeight: 900, color: '#7c3aed' }}>
                  {billingCycle === 'monthly' ? '150' : billingCycle === 'term' ? '600' : '1000'}
                </span>
                <span style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 700 }}> ج.م / {billingCycle === 'monthly' ? 'شهر' : billingCycle === 'term' ? 'ترم' : 'سنة'}</span>
              </div>

              {/* AI Bonus Pill */}
              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '8px 12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#6d28d9', fontWeight: 800, fontSize: '0.86rem' }}>
                <Bot size={18} color="#7c3aed" />
                <span>هدية إضافية: <strong>+ 100 كريديت AI شهرياً</strong> للامتحانات والتلخيص</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px 0', display: 'flex', flexDirection: 'column', gap: '11px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#8b5cf6" /> <strong>كل مميزات خطة المعلم التفاعلي بالكامل</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#8b5cf6" /> <strong>إنشاء غرف بث مباشر صوت وفيديو لا محدودة لطلابك</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#8b5cf6" /> تخصيص اسم المعلم وشعاره (براندك الخاص) في البث
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#8b5cf6" /> إطلاق الألعاب التعليمية والسبورة التفاعلية أثناء اللايف
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#8b5cf6" /> أدوات التحكم (كتم الجميع، وضع المحاضرة، طابور المشاركة)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#8b5cf6" /> ربط حسابات المساعدين الإداريين (Assistant Link) لرصد الدرجات
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '0.92rem', fontWeight: 700 }}>
                  <Check size={18} color="#8b5cf6" /> رصيد دقائق بث مدفوعة شهرياً مع تقنية التبديل التلقائي
                </li>
              </ul>

              <a
                href={getWhatsAppLink('teacher_pro')}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '14px',
                  fontSize: '1.02rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.35)',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  textAlign: 'center'
                }}
              >
                <MessageCircle size={20} />
                <span>اشتراك المعلم برو 💬</span>
              </a>
            </div>

          </div>
        )}

        {/* ── SECTION 3: AI CREDITS PACKAGES ── */}
        {false && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '20px', fontWeight: 800, fontSize: '0.9rem', marginBottom: '10px' }}>
                <Coins size={16} />
                <span>رصيد دائم لا تنتهي صلاحيته بمجرد الشحن</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', color: '#4c1d95', fontWeight: 900, margin: '0 0 8px 0' }}>
                باقات شحن رصيد الذكاء الاصطناعي (AI Credits)
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.96rem', maxWidth: '640px', margin: '0 auto' }}>
                اشحن رصيد إضافي لاستخدامه في تصحيح مواضيع التعبير، استخراج الأسئلة من صور الكتب، وتوليد الاختبارات الفورية.
              </p>
            </div>

            <div className={styles.cardsContainer} style={{ width: '100%' }}>

              {/* Pack 1: 100 Credits */}
              <div className={styles.pricingCard} style={{ border: '1.5px solid #c4b5fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ padding: '6px 12px', background: '#f5f3ff', color: '#6d28d9', borderRadius: '12px', fontWeight: 800, fontSize: '0.82rem' }}>
                    باقة الانطلاق ⚡
                  </div>
                  <Coins size={24} color="#8b5cf6" />
                </div>

                <h3 style={{ fontSize: '1.6rem', color: '#4c1d95', fontWeight: 900, margin: '0 0 6px 0' }}>
                  100 كريديت
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px', minHeight: '38px' }}>
                  مثالية لتجربة ميزات الذكاء الاصطناعي وسؤال المساعد الذكي.
                </p>

                <div style={{ marginBottom: '22px' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 900, color: '#7c3aed' }}>15</span>
                  <span style={{ color: '#64748b', fontSize: '1rem', fontWeight: 700 }}> ج.م (دفعة واحدة)</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '0.88rem', fontWeight: 700 }}>
                    <Check size={16} color="#7c3aed" /> تصحيح حتى 30 موضوع تعبير تفصيلياً
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '0.88rem', fontWeight: 700 }}>
                    <Check size={16} color="#7c3aed" /> 100 استفسار وسؤال للمساعد الذكي
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '0.88rem', fontWeight: 700 }}>
                    <Check size={16} color="#7c3aed" /> توليد 20 نموذج اختبار قصير بالـ AI
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '0.88rem', fontWeight: 700 }}>
                    <Check size={16} color="#7c3aed" /> الرصيد متاح في حسابك بدون تاريخ انتهاء
                  </li>
                </ul>

                <a
                  href={getWhatsAppLink('credits_100')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.98rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    borderRadius: '14px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.25)',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  <MessageCircle size={18} />
                  <span>شحن 100 كريديت (15 ج)</span>
                </a>
              </div>

              {/* Pack 2: 300 Credits (Most Popular) */}
              <div className={styles.pricingCard} style={{ border: '2.5px solid #8b5cf6', transform: 'scale(1.02)' }}>
                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', padding: '4px 18px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 900, boxShadow: '0 4px 10px rgba(139,92,246,0.3)' }}>
                  الأكثر توفيراً وطلباً ⭐
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', marginTop: '6px' }}>
                  <div style={{ padding: '6px 12px', background: '#ede9fe', color: '#5b21b6', borderRadius: '12px', fontWeight: 800, fontSize: '0.82rem' }}>
                    باقة التميز ⭐
                  </div>
                  <Sparkles size={24} color="#7c3aed" />
                </div>

                <h3 style={{ fontSize: '1.6rem', color: '#4c1d95', fontWeight: 900, margin: '0 0 6px 0' }}>
                  300 كريديت
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px', minHeight: '38px' }}>
                  الباقة المفضلة للطلاب المتفوقين والمعلمين لصياغة ومراجعة الدروس.
                </p>

                <div style={{ marginBottom: '22px' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 900, color: '#6d28d9' }}>35</span>
                  <span style={{ color: '#64748b', fontSize: '1rem', fontWeight: 700 }}> ج.م (وفر 10 ج)</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '0.88rem', fontWeight: 700 }}>
                    <Check size={16} color="#6d28d9" /> تصحيح حتى 100 موضوع تعبير تفصيلياً
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '0.88rem', fontWeight: 700 }}>
                    <Check size={16} color="#6d28d9" /> استخراج وتوليد امتحانات شاملة من صور الكتب
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '0.88rem', fontWeight: 700 }}>
                    <Check size={16} color="#6d28d9" /> تلخيص الدروس ورسم الخرائط الذهنية الذكية
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '0.88rem', fontWeight: 700 }}>
                    <Check size={16} color="#6d28d9" /> رصيد إضافي دائم في الحساب فور التحويل
                  </li>
                </ul>

                <a
                  href={getWhatsAppLink('credits_300')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '13px',
                    fontSize: '1rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    color: 'white',
                    borderRadius: '14px',
                    textDecoration: 'none',
                    boxShadow: '0 6px 18px rgba(109, 40, 217, 0.3)',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  <MessageCircle size={18} />
                  <span>شحن 300 كريديت (35 ج) 💬</span>
                </a>
              </div>

              {/* Pack 3: 1000 Credits */}
              <div className={styles.pricingCard} style={{ border: '1.5px solid #c4b5fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ padding: '6px 12px', background: '#f5f3ff', color: '#6d28d9', borderRadius: '12px', fontWeight: 800, fontSize: '0.82rem' }}>
                    باقة المحترفين 🚀
                  </div>
                  <Zap size={24} color="#8b5cf6" />
                </div>

                <h3 style={{ fontSize: '1.6rem', color: '#4c1d95', fontWeight: 900, margin: '0 0 6px 0' }}>
                  1000 كريديت
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px', minHeight: '38px' }}>
                  أعلى توفير مخصص للمعلمين والسناتر وصناع المحتوى التعليمي.
                </p>

                <div style={{ marginBottom: '22px' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 900, color: '#7c3aed' }}>80</span>
                  <span style={{ color: '#64748b', fontSize: '1rem', fontWeight: 700 }}> ج.م (وفر 70 ج)</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '0.88rem', fontWeight: 700 }}>
                    <Check size={16} color="#7c3aed" /> صياغة وتوليد عشرات الامتحانات الشاملة لجميع المراحل
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '0.88rem', fontWeight: 700 }}>
                    <Check size={16} color="#7c3aed" /> تصحيح واجبات وتعبير مئات الطلاب شهرياً
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '0.88rem', fontWeight: 700 }}>
                    <Check size={16} color="#7c3aed" /> أفضل سعر لكل نقطة ذكاء اصطناعي (0.08 ج فقط)
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '0.88rem', fontWeight: 700 }}>
                    <Check size={16} color="#7c3aed" /> أولوية المعالجة وسرعة استجابة فائقة
                  </li>
                </ul>

                <a
                  href={getWhatsAppLink('credits_1000')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.98rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    borderRadius: '14px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.25)',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  <MessageCircle size={18} />
                  <span>شحن 1000 كريديت (80 ج)</span>
                </a>
              </div>

            </div>
          </div>
        )}

        {/* Support & Direct Help Section */}
        <div style={{ marginTop: '60px', textAlign: 'center' }}>
          <p style={{ color: '#064e3b', marginBottom: '18px', fontWeight: 900, fontSize: '1.1rem' }}>
            هل لديك أي استفسار أو ترغب في الاشتراك؟ تواصل معنا مباشرة:
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '30px' }}>
            <a 
              href="https://wa.me/201507952002" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '12px 24px', 
                background: '#25D366', 
                color: 'white', 
                borderRadius: '14px', 
                fontWeight: 800, 
                textDecoration: 'none', 
                boxShadow: '0 4px 12px rgba(37,211,102,0.3)' 
              }}
            >
              <MessageCircle size={20} />
              <span>محادثة واتساب مباشرة (01507952002)</span>
            </a>
            <a 
              href="tel:01507952002" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '12px 24px', 
                background: 'white', 
                color: '#065f46', 
                borderRadius: '14px', 
                fontWeight: 800, 
                border: '1.5px solid #1A2E86',
                textDecoration: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)' 
              }}
            >
              <Phone size={18} />
              <span>اتصال هاتفي مباشر</span>
            </a>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ padding: '10px 18px', background: 'white', borderRadius: '12px', color: '#065f46', border: '1px solid #d1fae5', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#1A2E86" />
              <span>تحويل فوري عبر فودافون كاش وإنستاباي</span>
            </div>
            <div style={{ padding: '10px 18px', background: 'white', borderRadius: '12px', color: '#065f46', border: '1px solid #d1fae5', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} color="#1A2E86" />
              <span>تفعيل سريع ومباشر للحساب</span>
            </div>
            <div style={{ padding: '10px 18px', background: 'white', borderRadius: '12px', color: '#065f46', border: '1px solid #d1fae5', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#1A2E86" />
              <span>متابعة شخصية من المستر إبراهيم عمار</span>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
      `}</style>
    </div>
  )
}
