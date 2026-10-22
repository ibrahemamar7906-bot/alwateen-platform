'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import { Sparkles, Zap, X } from 'lucide-react'

export default function AssistantTab({ styles, currentUser }) {
  const router = useRouter()
  const specialty = currentUser?.specialty || 'general'
  const [creditsBalance, setCreditsBalance] = useState(currentUser?.ai_credits_balance ?? 50)
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [rechargeLoading, setRechargeLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    if (currentUser?.id) {
      fetchBalance()
    }
  }, [currentUser?.id])

  const fetchBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('ai_credits_balance')
        .eq('id', currentUser.id)
        .single()
      if (!error && data) {
        setCreditsBalance(data.ai_credits_balance ?? 50)
      }
    } catch (err) {
      console.error('Error fetching admin credits:', err)
    }
  }

  const handleRecharge = async (amount) => {
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('يرجى تحديد عدد نقاط صالح')
      return
    }
    setRechargeLoading(true)
    setStatusMsg('')
    try {
      const { data, error } = await supabase.rpc('topup_ai_credits', {
        p_user_id: currentUser.id,
        p_amount: amount,
        p_description: `شحن رصيد AI مباشر لحساب المدير (${amount} كريديت)`
      })

      let newBal = (Number(creditsBalance) || 0) + amount
      if (error) {
        const { error: updErr } = await supabase
          .from('profiles')
          .update({ ai_credits_balance: newBal })
          .eq('id', currentUser.id)
        if (updErr) throw updErr
      } else if (data?.new_balance !== undefined) {
        newBal = Number(data.new_balance)
      }

      setCreditsBalance(newBal)
      setStatusMsg(`✅ تم إضافة ${amount} كريديت بنجاح! الرصيد: ${newBal}`)
      setCustomAmount('')
      setTimeout(() => {
        setStatusMsg('')
        setShowRechargeModal(false)
      }, 1500)
    } catch (err) {
      console.error('Error recharging admin:', err)
      setStatusMsg(`❌ حدث خطأ: ${err.message || 'خطأ غير معروف'}`)
    } finally {
      setRechargeLoading(false)
    }
  }

  const handleSetUnlimited = async () => {
    setRechargeLoading(true)
    setStatusMsg('')
    try {
      const { error: updErr } = await supabase
        .from('profiles')
        .update({ ai_credits_balance: 99999 })
        .eq('id', currentUser.id)
      if (updErr) throw updErr

      setCreditsBalance(99999)
      setStatusMsg('✅ تم تفعيل رصيد غير محدود للمدير (99,999 💎)!')
      setTimeout(() => {
        setStatusMsg('')
        setShowRechargeModal(false)
      }, 1500)
    } catch (err) {
      console.error('Error setting unlimited:', err)
      setStatusMsg(`❌ حدث خطأ: ${err.message || 'خطأ غير معروف'}`)
    } finally {
      setRechargeLoading(false)
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>مساعد المعلم الذكي 🤖</h2>
        <p>أدوات مساعدة لتسهيل عملك في تجهيز المحتوى وتقييم الطلاب.</p>
      </div>

      {/* Admin AI Credits Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
        borderRadius: '16px',
        padding: '16px 20px',
        border: '1.5px solid #ddd6fe',
        marginBottom: '25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#7c3aed', color: 'white', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#4c1d95', fontSize: '1.15rem', fontWeight: 900 }}>
              رصيد أدوات الذكاء الاصطناعي للإدارة 👑
            </h3>
            <p style={{ margin: '4px 0 0 0', color: '#6d28d9', fontSize: '0.88rem' }}>
              رصيدك الحالي لاستخدام أدوات المساعد، الامتحانات، وتوليد الأسئلة: <strong style={{ fontSize: '1rem', color: '#3b0764' }}>{creditsBalance} 💎 كريديت</strong>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setShowRechargeModal(true)}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)'
            }}
          >
            <Zap size={16} /> شحن نقاط للأدمن ⚡
          </button>
        </div>
      </div>
      <div className={styles.toolsGrid} style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
        
        {/* Exam Builder AI */}
        <div className={styles.toolCard} style={{flex: '1 1 300px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '2px solid #86efac'}}>
          <div className={styles.toolIcon} style={{fontSize: '2rem', marginBottom: '10px'}}>🖨️</div>
          <h3 style={{color: '#15803d'}}>منشئ الامتحانات الذكي (AI)</h3>
          <p style={{color: '#666', fontSize: '0.9rem'}}>توليد امتحانات A4 احترافية بنماذج الإجابة والعلامة المائية بنقرة واحدة.</p>
          <button className={styles.toolBtn} onClick={() => router.push('/teacher-assistant/exam-builder')} style={{background: '#16a34a', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px', width: '100%', fontWeight: 'bold'}}>فتح منشئ الامتحانات</button>
        </div>

        {/* Lesson Planner AI */}
        <div className={styles.toolCard} style={{flex: '1 1 300px', background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '2px solid #6ee7b7'}}>
          <div className={styles.toolIcon} style={{fontSize: '2rem', marginBottom: '10px'}}>🧠</div>
          <h3 style={{color: '#065f46'}}>مساعد تحضير الدروس الذكي</h3>
          <p style={{color: '#666', fontSize: '0.9rem'}}>ولّد خطة درس متكاملة، أهداف تعليمية، ملخص، بطاقات واختبار بضغطة زر.</p>
          <button className={styles.toolBtn} onClick={() => router.push('/teacher-assistant/lesson-planner')} style={{background: '#059669', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px', width: '100%', fontWeight: 'bold'}}>تحضير درس جديد</button>
        </div>

        {/* Smart Document Editor */}
        <div className={styles.toolCard} style={{flex: '1 1 300px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '2px solid #93c5fd'}}>
          <div className={styles.toolIcon} style={{fontSize: '2rem', marginBottom: '10px'}}>📄✨</div>
          <h3 style={{color: '#1e40af'}}>محرر المذكرات والمستندات الذكي</h3>
          <p style={{color: '#666', fontSize: '0.9rem'}}>محرر مذكرات وكتب A4 متكامل مدعوم بالذكاء الاصطناعي لإعادة الصياغة والطباعة.</p>
          <button className={styles.toolBtn} onClick={() => router.push('/teacher-assistant/document-editor')} style={{background: '#2563eb', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px', width: '100%', fontWeight: 'bold'}}>فتح محرر المذكرات</button>
        </div>

        {/* Quizzes */}
        <div className={styles.toolCard} style={{flex: '1 1 300px', background: '#f5f3ff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '2px solid #ddd6fe'}}>
          <div className={styles.toolIcon} style={{fontSize: '2rem', marginBottom: '10px'}}>📝</div>
          <h3 style={{color: '#6d28d9'}}>إدارة الاختبارات والـ AI</h3>
          <p style={{color: '#666', fontSize: '0.9rem'}}>قم بإنشاء وتعديل الاختبارات، واستخدم الذكاء الاصطناعي لتوليد الأسئلة فوراً.</p>
          <button className={styles.toolBtn} onClick={() => router.push('/teacher-assistant/quizzes')} style={{background: '#8b5cf6', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px', width: '100%', fontWeight: 'bold'}}>مدير الاختبارات</button>
        </div>

        {/* Live Stream */}
        <div className={styles.toolCard} style={{flex: '1 1 300px', background: 'linear-gradient(135deg, #fee2e2, #fecaca)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '2px solid #ef4444'}}>
          <div className={styles.toolIcon} style={{fontSize: '2rem', marginBottom: '10px'}}>📡</div>
          <h3 style={{color: '#b91c1c'}}>غرفة البث المباشر المتقدمة</h3>
          <p style={{color: '#666', fontSize: '0.9rem'}}>إدارة بث حي تفاعلي مع الطلاب مزود بسبورة وأدوات تحكم متقدمة.</p>
          <button className={styles.toolBtn} onClick={() => router.push('/teacher-assistant/virtual-classroom')} style={{background: '#ef4444', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px', width: '100%', fontWeight: 'bold'}}>بدء البث المباشر</button>
        </div>

        <div className={styles.toolCard} style={{flex: '1 1 300px', background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
          <div className={styles.toolIcon} style={{fontSize: '2rem', marginBottom: '10px'}}>📝</div>
          <h3>السبورة التفاعلية</h3>
          <p style={{color: '#666', fontSize: '0.9rem'}}>افتح سبورة إلكترونية للشرح المباشر للطلاب وتسجيل الشاشة.</p>
          <button className={styles.toolBtn} onClick={() => router.push('/teacher-assistant/whiteboard')} style={{background: '#20c997', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px', width: '100%', fontWeight: 'bold'}}>فتح السبورة</button>
        </div>

        <div className={styles.toolCard} style={{flex: '1 1 300px', background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
          <div className={styles.toolIcon} style={{fontSize: '2rem', marginBottom: '10px'}}>🎓</div>
          <h3>صانع الشهادات</h3>
          <p style={{color: '#666', fontSize: '0.9rem'}}>توليد شهادات تقدير احترافية للطلاب وتصديرها كـ PDF.</p>
          <button className={styles.toolBtn} onClick={() => router.push('/teacher-assistant/certificates')} style={{background: '#2563eb', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px', width: '100%', fontWeight: 'bold'}}>صنع شهادات</button>
        </div>

        <div className={styles.toolCard} style={{flex: '1 1 300px', background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
          <div className={styles.toolIcon} style={{fontSize: '2rem', marginBottom: '10px'}}>🏆</div>
          <h3>لوحة الشرف</h3>
          <p style={{color: '#666', fontSize: '0.9rem'}}>تصميم صورة احترافية بأسماء الطلاب المتفوقين لنشرها.</p>
          <button className={styles.toolBtn} onClick={() => router.push('/teacher-assistant/leaderboard')} style={{background: '#d97706', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px', width: '100%', fontWeight: 'bold'}}>تصميم لوحة شرف</button>
        </div>

        <div className={styles.toolCard} style={{flex: '1 1 300px', background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
          <div className={styles.toolIcon} style={{fontSize: '2rem', marginBottom: '10px'}}>🎡</div>
          <h3>عجلة الأسماء العشوائية</h3>
          <p style={{color: '#666', fontSize: '0.9rem'}}>اختر طالباً عشوائياً للإجابة أو التكريم باستخدام عجلة حظ.</p>
          <button className={styles.toolBtn} onClick={() => router.push('/teacher-assistant/wheel')} style={{background: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px', width: '100%', fontWeight: 'bold'}}>فتح العجلة</button>
        </div>

        <div className={styles.toolCard} style={{flex: '1 1 300px', background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
          <div className={styles.toolIcon} style={{fontSize: '2rem', marginBottom: '10px'}}>📊</div>
          <h3>تقارير أولياء الأمور</h3>
          <p style={{color: '#666', fontSize: '0.9rem'}}>أصدر تقارير أداء احترافية وشاركها مع أولياء الأمور على واتساب كصورة.</p>
          <button className={styles.toolBtn} onClick={() => router.push('/teacher-assistant/report')} style={{background: '#2563eb', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px', width: '100%', fontWeight: 'bold'}}>تصميم تقرير</button>
        </div>

        {/* Flashcards (Arabic/English) */}
        {(specialty === 'arabic' || specialty === 'english' || specialty === 'general') && (
          <div className={styles.toolCard} style={{flex: '1 1 300px', background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
            <div className={styles.toolIcon} style={{fontSize: '2rem', marginBottom: '10px'}}>🃏</div>
            <h3>{specialty === 'english' ? 'البطاقات الإنجليزية' : 'البطاقات النحوية'}</h3>
            <p style={{color: '#666', fontSize: '0.9rem'}}>حول القواعد النحوية المعقدة إلى صور تعليمية (انفوجرافيك).</p>
            <button className={styles.toolBtn} onClick={() => router.push('/teacher-assistant/flashcards')} style={{background: '#9333ea', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px', width: '100%', fontWeight: 'bold'}}>صنع بطاقة</button>
          </div>
        )}

        <div className={styles.toolCard} style={{flex: '1 1 300px', background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
          <div className={styles.toolIcon} style={{fontSize: '2rem', marginBottom: '10px'}}>🗓️</div>
          <h3>الجداول الدراسية</h3>
          <p style={{color: '#666', fontSize: '0.9rem'}}>قم بإعداد خطط أسبوعية لطلابك وصدرها كصور أنيقة.</p>
          <button className={styles.toolBtn} onClick={() => router.push('/teacher-assistant/schedule')} style={{background: '#d97706', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px', width: '100%', fontWeight: 'bold'}}>إنشاء جدول</button>
        </div>

        {/* Kids Corner */}
        <div className={styles.toolCard} style={{flex: '1 1 300px', background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '2px solid #ec4899'}}>
          <div className={styles.toolIcon} style={{fontSize: '2rem', marginBottom: '10px'}}>{specialty === 'math' ? '🔢' : '🧸'}</div>
          <h3 style={{color: '#be185d'}}>
            {specialty === 'math' ? 'أدوات التأسيس للرياضيات' : specialty === 'english' ? 'أدوات التأسيس للغة الإنجليزية' : 'أدوات التأسيس والمرحلة الابتدائية'}
          </h3>
          <p style={{color: '#666', fontSize: '0.9rem'}}>ألعاب تفاعلية وأدوات مخصصة لمشاركتها مع الأطفال.</p>
          <button className={styles.toolBtn} onClick={() => router.push('/kids-corner')} style={{background: '#ec4899', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px', width: '100%', fontWeight: 'bold'}}>زيارة الركن</button>
        </div>

        {/* AI Writing Checker (Arabic/English) */}
        {(specialty === 'arabic' || specialty === 'english' || specialty === 'general') && (
          <div className={styles.toolCard} style={{flex: '1 1 300px', background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '2px solid #0ea5e9'}}>
            <div className={styles.toolIcon} style={{fontSize: '2rem', marginBottom: '10px'}}>📝🤖</div>
            <h3 style={{color: '#0369a1'}}>المصحح الذكي للإملاء</h3>
            <p style={{color: '#666', fontSize: '0.9rem'}}>صحح موضوعات التعبير والإملاء للطلاب فورياً عبر الذكاء الاصطناعي.</p>
            <button className={styles.toolBtn} onClick={() => router.push('/writing-checker')} style={{background: '#0ea5e9', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px', width: '100%', fontWeight: 'bold'}}>فتح المصحح</button>
          </div>
        )}
      </div>

      {/* Admin Recharge Modal */}
      {showRechargeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '15px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowRechargeModal(false)}
              style={{ position: 'absolute', top: '16px', left: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '4px' }}>👑 💎</div>
              <h3 style={{ margin: '0 0 6px 0', color: '#581c87', fontWeight: 900 }}>
                شحن رصيد الذكاء الاصطناعي للأدمن
              </h3>
              <p style={{ margin: 0, color: '#6b21a8', fontSize: '0.88rem' }}>
                رصيدك الحالي: <strong>{creditsBalance} 💎 كريديت</strong>
              </p>
            </div>

            {statusMsg && (
              <div style={{
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '15px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                textAlign: 'center',
                background: statusMsg.includes('✅') ? '#ecfdf5' : '#fef2f2',
                color: statusMsg.includes('✅') ? '#059669' : '#dc2626',
                border: `1px solid ${statusMsg.includes('✅') ? '#a7f3d0' : '#fecaca'}`
              }}>
                {statusMsg}
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>
                شحن سريع:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[100, 500, 1000, 5000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleRecharge(amt)}
                    disabled={rechargeLoading}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#7c3aed',
                      padding: '8px 4px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      cursor: rechargeLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    +{amt} 💎
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleRecharge(parseInt(customAmount, 10)); }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
                  أو اكتب عدد نقاط مخصص:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="مثال: 300 أو 2000"
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      fontWeight: 'bold',
                      fontFamily: 'inherit'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={rechargeLoading || !customAmount}
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: (rechargeLoading || !customAmount) ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {rechargeLoading ? 'جاري الشحن...' : '⚡ شحن'}
                  </button>
                </div>
              </div>
            </form>

            <button
              type="button"
              onClick={handleSetUnlimited}
              disabled={rechargeLoading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '0.92rem',
                cursor: rechargeLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
              }}
            >
              🚀 تفعيل رصيد غير محدود (99,999 💎)
            </button>
          </div>
        </div>
      )}
    </section>
  )
}


