'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'

export default function TeachersTab({ 
  styles 
}) {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [durations, setDurations] = useState({})
  const [liveMinutes, setLiveMinutes] = useState({})
  const [planTypes, setPlanTypes] = useState({}) // 'teacher' or 'teacher_pro'
  const [bonusCredits, setBonusCredits] = useState({})
  const [rechargeTarget, setRechargeTarget] = useState(null)
  const [rechargeAmount, setRechargeAmount] = useState(100)
  const [rechargeCustom, setRechargeCustom] = useState('')
  const [rechargeReason, setRechargeReason] = useState('شحن باقة 100 كريديت للمعلم')
  const [rechargeLoading, setRechargeLoading] = useState(false)
  const pageSize = 20

  const handleBonusCreditsChange = (id, val) => {
    setBonusCredits(prev => ({ ...prev, [id]: val }))
  }

  const openRechargeModal = (teacher) => {
    setRechargeTarget(teacher)
    setRechargeAmount(100)
    setRechargeCustom('')
    setRechargeReason('شحن باقة 100 كريديت للمعلم')
  }

  const handleExecuteRecharge = async (e) => {
    if (e) e.preventDefault()
    if (!rechargeTarget) return

    const amount = rechargeCustom ? parseInt(rechargeCustom, 10) : parseInt(rechargeAmount, 10)
    if (isNaN(amount) || amount <= 0) {
      alert('يرجى إدخال عدد كريديت صحيح أكبر من صفر')
      return
    }

    setRechargeLoading(true)
    try {
      const { error: rpcError } = await supabase.rpc('topup_ai_credits', {
        p_user_id: rechargeTarget.id,
        p_amount: amount,
        p_description: rechargeReason || 'شحن باقة رصيد ذكاء اصطناعي للمعلم'
      })

      if (rpcError) {
        console.warn('RPC topup failed, falling back to direct update:', rpcError)
        const currentBal = rechargeTarget.ai_credits_balance ?? 50
        const newBal = currentBal + amount
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ ai_credits_balance: newBal })
          .eq('id', rechargeTarget.id)

        if (updateError) throw updateError
      }

      alert('تم شحن ' + amount + ' كريديت بنجاح للمعلم (' + rechargeTarget.full_name + ')!')
      setRechargeTarget(null)
      fetchTeachers()
    } catch (err) {
      console.error('Error recharging AI credits:', err)
      alert('حدث خطأ أثناء شحن الرصيد: ' + (err.message || 'خطأ غير معروف'))
    } finally {
      setRechargeLoading(false)
    }
  }

  const fetchTeachers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .in('role', ['teacher', 'teacher_pro', 'assistant', 'admin'])
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, count, error } = await query
      
      if (error) throw error
      setTeachers(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Error fetching teachers:', err)
      alert('حدث خطأ أثناء جلب المعلمين')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTeachers()
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, page])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleLiveMinutesChange = (id, val) => {
    setLiveMinutes(prev => ({ ...prev, [id]: val }))
  }

  const handleDurationChange = (id, val) => {
    setDurations(prev => ({ ...prev, [id]: val }))
  }

  const handlePlanTypeChange = (id, val) => {
    setPlanTypes(prev => ({ ...prev, [id]: val }))
  }

  const handleApprove = async (id) => {
    const months = parseInt(durations[id] || '1', 10)
    const mins = parseInt(liveMinutes[id] || '1800', 10)
    const newRole = planTypes[id] || 'teacher' // default to basic
    const defaultBonus = newRole === 'teacher_pro' ? 100 : 50
    const addedCredits = parseInt(bonusCredits[id] !== undefined ? bonusCredits[id] : defaultBonus, 10)
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + months)
    
    try {
      const currentTeacher = teachers.find(t => t.id === id)
      const currentCredits = currentTeacher?.ai_credits_balance ?? 50
      const newCredits = currentCredits + (isNaN(addedCredits) ? 0 : addedCredits)

      const { error } = await supabase
        .from('profiles')
        .update({ 
          status: 'approved',
          role: newRole,
          subscription_end_date: endDate.toISOString(),
          live_minutes_balance: mins,
          ai_credits_balance: newCredits
        })
        .eq('id', id)
      
      if (!error) {
        let planName = 'أساسية (بدون لايف)';
        if (newRole === 'teacher_pro') planName = 'شاملة (مع اللايف)';
        else if (newRole === 'assistant') planName = 'مساعد إداري';
        else if (newRole === 'student') planName = 'طالب';
        
        alert(`تم تغيير الرتبة/الباقة إلى ${planName} لمدة ${months} شهر بنجاح!`)
        fetchTeachers()
      } else {
        throw error
      }
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء تفعيل المعلم')
    }
  }

  const handleDeleteTeacher = async (id) => {
    if(!confirm('هل أنت متأكد من حذف حساب المعلم هذا؟')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if(error) throw error;
      alert('تم الحذف بنجاح!');
      fetchTeachers();
    } catch(err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    }
  }

  const handleMakeAssistant = async (id) => {
    if(!confirm('هل أنت متأكد من تعيين هذا المعلم كمساعد إداري؟')) return;
    try {
      const { error } = await supabase.from('profiles').update({ role: 'assistant' }).eq('id', id);
      if(error) throw error;
      alert('تم التعيين كمساعد بنجاح!');
      fetchTeachers();
    } catch(err) {
      console.error(err);
      alert('حدث خطأ أثناء الترقية');
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2>جميع المعلمين ({totalCount})</h2>
          <p>إدارة وتفعيل حسابات المعلمين</p>
        </div>
        <div style={{ flex: '1', minWidth: '250px', maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="بحث بالاسم أو رقم الهاتف..." 
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
          />
        </div>
      </div>

      <div className={styles.tableContainer} style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s', minHeight: '300px' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>نوع الباقة الحالية</th>
              <th>الاشتراك / التفعيل</th>
              <th>رصيد AI 💎</th>
              <th>رقم الواتساب</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => {
              const now = new Date();
              const subEndDate = teacher.subscription_end_date ? new Date(teacher.subscription_end_date) : null;
              const hasActiveSub = teacher.status === 'approved' && subEndDate && subEndDate > now;
              const isFreeAccount = teacher.status === 'approved' && (!subEndDate || subEndDate <= now);
              
              return (
                <tr key={teacher.id}>
                  <td><strong>{teacher.full_name}</strong></td>
                  <td>
                    {teacher.role === 'admin' ? (
                      <span style={{color: '#b45309', fontWeight: 'bold', background: '#fef3c7', padding: '4px 8px', borderRadius: '8px'}}>👑 مدير المنصة (أدمن)</span>
                    ) : teacher.role === 'teacher_pro' ? (
                      <span style={{color: '#6d28d9', fontWeight: 'bold', background: '#ede9fe', padding: '4px 8px', borderRadius: '8px'}}>شاملة (برو) 🚀</span>
                    ) : teacher.role === 'assistant' ? (
                      <span style={{color: '#059669', fontWeight: 'bold', background: '#d1fae5', padding: '4px 8px', borderRadius: '8px'}}>مساعد إداري 🛡️</span>
                    ) : (
                      <span style={{color: '#4338ca', fontWeight: 'bold', background: '#e0e7ff', padding: '4px 8px', borderRadius: '8px'}}>أساسية 👨‍🏫</span>
                    )}
                  </td>
                  <td>
                    {teacher.role === 'admin' ? (
                      <span style={{color: '#b45309', fontWeight: 'bold', background: '#fef3c7', padding: '6px 10px', borderRadius: '8px', display: 'inline-block', fontSize: '0.85rem'}}>
                        👑 صلاحيات إدارة كاملة دائمًا
                      </span>
                    ) : hasActiveSub ? (
                      <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                        <span style={{color: 'green', fontWeight: 'bold'}}>
                          مفعل ✅ <br/>
                          <small style={{color: '#555', fontWeight: 'normal'}}>
                            subEndDate ? `ينتهي: ${subEndDate.toLocaleDateString('ar-EG')}` : 'اشتراك ساري'
                          </small>
                        </span>
                        <div style={{display: 'flex', gap: '5px', alignItems: 'center', marginTop: '5px', flexWrap: 'wrap'}}>
                          <select 
                            value={planTypes[teacher.id] || teacher.role} 
                            onChange={(e) => handlePlanTypeChange(teacher.id, e.target.value)}
                            style={{padding: '2px', borderRadius: '3px', border: '1px solid #ccc', fontSize: '0.8rem'}}
                          >
                            <option value="teacher">معلم أساسية</option>
                            <option value="teacher_pro">معلم برو</option>
                            <option value="assistant">مساعد إداري</option>
                            <option value="student">إرجاع لطالب</option>
                          </select>
                          <input 
                              type="number" 
                              placeholder="د. سيرفر" 
                              title="دقائق السيرفر المدفوع"
                              value={liveMinutes[teacher.id] || '1800'} 
                              onChange={(e) => handleLiveMinutesChange(teacher.id, e.target.value)}
                              style={{padding: '2px', borderRadius: '3px', border: '1px solid #ccc', fontSize: '0.8rem', width: '70px'}}
                            />
                            <select 
                              value={durations[teacher.id] || '1'} 
                            onChange={(e) => handleDurationChange(teacher.id, e.target.value)}
                            style={{padding: '2px', borderRadius: '3px', border: '1px solid #ccc', fontSize: '0.8rem'}}
                          >
                            <option value="1">شهر</option>
                            <option value="12">سنة</option>
                          </select>
                          <button className={styles.approveBtn} onClick={() => handleApprove(teacher.id)} style={{padding: '3px 8px', fontSize: '0.8rem'}}>تجديد/تغيير</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                        <span style={{color: 'red', fontWeight: 'bold'}}>
                          غير مفعل / منتهي ❌
                        </span>
                        <div style={{display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap'}}>
                          <select 
                            value={planTypes[teacher.id] || teacher.role} 
                            onChange={(e) => handlePlanTypeChange(teacher.id, e.target.value)}
                            style={{padding: '2px', borderRadius: '3px', border: '1px solid #ccc', fontSize: '0.8rem'}}
                          >
                            <option value="teacher">معلم أساسية</option>
                            <option value="teacher_pro">معلم برو</option>
                            <option value="assistant">مساعد إداري</option>
                            <option value="student">إرجاع لطالب</option>
                          </select>
                          <input 
                              type="number" 
                              placeholder="د. سيرفر" 
                              title="دقائق السيرفر المدفوع"
                              value={liveMinutes[teacher.id] || '1800'} 
                              onChange={(e) => handleLiveMinutesChange(teacher.id, e.target.value)}
                              style={{padding: '2px', borderRadius: '3px', border: '1px solid #ccc', fontSize: '0.8rem', width: '70px'}}
                            />
                            <select 
                              value={durations[teacher.id] || '1'} 
                            onChange={(e) => handleDurationChange(teacher.id, e.target.value)}
                            style={{padding: '2px', borderRadius: '3px', border: '1px solid #ccc', fontSize: '0.8rem'}}
                          >
                            <option value="1">شهر</option>
                            <option value="12">سنة</option>
                          </select>
                          <button className={styles.approveBtn} onClick={() => handleApprove(teacher.id)} style={{padding: '3px 8px', fontSize: '0.8rem'}}>تفعيل</button>
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        backgroundColor: (teacher.ai_credits_balance ?? 50) > 0 ? '#f5f3ff' : '#fef2f2',
                        color: (teacher.ai_credits_balance ?? 50) > 0 ? '#6d28d9' : '#b91c1c',
                        border: `1px solid ${(teacher.ai_credits_balance ?? 50) > 0 ? '#ddd6fe' : '#fecaca'}`
                      }}>
                        💎 {teacher.ai_credits_balance ?? 50}
                      </span>
                      <button 
                        onClick={() => openRechargeModal(teacher)}
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)'
                        }}
                        title="شحن رصيد ذكاء اصطناعي للمعلم"
                      >
                        ⚡ شحن / تعديل ✏️
                      </button>
                    </div>
                  </td>
                  <td dir="ltr">
                    <a href={`https://wa.me/2${teacher.phone}`} target="_blank" rel="noopener noreferrer" style={{color: '#25D366', textDecoration: 'none'}}>
                      {teacher.phone}
                    </a>
                  </td>
                  <td>
                    <div className={styles.actions} style={{display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap'}}>
                      <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => handleDeleteTeacher(teacher.id)}>حذف 🗑</button>
                      {teacher.role !== 'assistant' && (
                        <button className={styles.actionBtn} onClick={() => handleMakeAssistant(teacher.id)} style={{background: '#6366f1', color: 'white', padding: '5px 10px', fontSize: '0.8rem'}}>ترقية لمساعد 🛡️</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && teachers.length === 0 && (
              <tr>
                <td colSpan="6" className={styles.emptyState}>لا يوجد معلمين</td>
              </tr>
            )}
            {loading && teachers.length === 0 && (
              <tr>
                <td colSpan="6" className={styles.emptyState}>جاري تحميل البيانات... ⏳</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{ padding: '8px 16px', borderRadius: '5px', border: 'none', background: page === 1 ? '#e2e8f0' : '#3b82f6', color: page === 1 ? '#94a3b8' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          >
            السابق
          </button>
          
          <span style={{ fontWeight: 'bold', color: '#475569' }}>
            صفحة {page} من {totalPages}
          </span>
          
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            style={{ padding: '8px 16px', borderRadius: '5px', border: 'none', background: page === totalPages ? '#e2e8f0' : '#3b82f6', color: page === totalPages ? '#94a3b8' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          >
            التالي
          </button>
        </div>
      )}
      {/* Teacher AI Credits Recharge Modal */}
      {rechargeTarget && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            direction: 'rtl',
            fontFamily: 'inherit'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>💎</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>شحن وتعديل رصيد الذكاء الاصطناعي للمعلم 💎</h3>
              </div>
              <button 
                onClick={() => setRechargeTarget(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', marginBottom: '18px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>المعلم:</span>
                <strong style={{ color: '#0f172a' }}>{rechargeTarget.full_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>الرصيد الحالي:</span>
                <strong style={{ color: '#7c3aed' }}>{rechargeTarget.ai_credits_balance ?? 50} كريديت</strong>
              </div>
            </div>

            
            {/* Tab Switcher between Top-up and Direct Edit */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
              <button
                type="button"
                onClick={() => setModalMode('topup')}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '8px',
                  border: 'none',
                  background: modalMode === 'topup' ? '#ffffff' : 'transparent',
                  color: modalMode === 'topup' ? '#7c3aed' : '#64748b',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  boxShadow: modalMode === 'topup' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                ⚡ شحن باقة إضافية
              </button>
              <button
                type="button"
                onClick={() => setModalMode('set')}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '8px',
                  border: 'none',
                  background: modalMode === 'set' ? '#ffffff' : 'transparent',
                  color: modalMode === 'set' ? '#7c3aed' : '#64748b',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  boxShadow: modalMode === 'set' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                ✏️ تعديل وضبط الرصيد مباشرة
              </button>
            </div>

            {/* Mode 1: Top-up Form */}
            {modalMode === 'topup' && (
              <form onSubmit={handleExecuteRecharge} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.95rem' }}>
                  اختر باقة الشحن أو كمية مخصصة:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                  {[
                    { amount: 100, price: '15 ج', label: '100 💎' },
                    { amount: 300, price: '35 ج', label: '300 💎' },
                    { amount: 1000, price: '80 ج', label: '1000 💎' },
                  ].map(pkg => (
                    <button
                      key={pkg.amount}
                      type="button"
                      onClick={() => {
                        setRechargeAmount(pkg.amount)
                        setRechargeCustom('')
                        setRechargeReason('شحن باقة ' + pkg.amount + ' كريديت للمعلم (' + pkg.price + ')')
                      }}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: (!rechargeCustom && rechargeAmount === pkg.amount) ? '2px solid #8b5cf6' : '1px solid #cbd5e1',
                        background: (!rechargeCustom && rechargeAmount === pkg.amount) ? '#f5f3ff' : '#ffffff',
                        color: (!rechargeCustom && rechargeAmount === pkg.amount) ? '#6d28d9' : '#334155',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '1rem' }}>{pkg.label}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{pkg.price}</div>
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>
                    أو كمية مخصصة:
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="مثال: 50 أو 200 أو 500 كريديت..."
                    value={rechargeCustom}
                    onChange={(e) => {
                      setRechargeCustom(e.target.value)
                      if (e.target.value) {
                        setRechargeReason('شحن مخصص ' + e.target.value + ' كريديت للمعلم')
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: rechargeCustom ? '2px solid #8b5cf6' : '1px solid #cbd5e1',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>
                  سبب الشحن / ملاحظة (اختياري):
                </label>
                <input
                  type="text"
                  value={rechargeReason}
                  onChange={(e) => setRechargeReason(e.target.value)}
                  placeholder="مثال: تجديد اشتراك شهري / شحن مباشر"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={rechargeLoading}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: rechargeLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                    opacity: rechargeLoading ? 0.7 : 1
                  }}
                >
                  {rechargeLoading ? 'جاري الشحن... ⏳' : 'تأكيد وإضافة الرصيد فوراً ⚡'}
                </button>
                <button
                  type="button"
                  onClick={() => setRechargeTarget(null)}
                  disabled={rechargeLoading}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
            )}

            {/* Mode 2: Direct Edit Form */}
            {modalMode === 'set' && (
              <form onSubmit={handleSetExactBalance} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.95rem' }}>
                    الرصيد الجديد المطلوب تحديده للمعلم:
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={directBalance}
                    onChange={e => setDirectBalance(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '2px solid #8b5cf6',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#6d28d9',
                      outline: 'none',
                      textAlign: 'center'
                    }}
                  />
                  <small style={{ color: '#64748b', marginTop: '6px', display: 'block', fontSize: '0.82rem' }}>
                    سيتم استبدال الرصيد الحالي ({rechargeTarget.ai_credits_balance ?? 50}) بهذا الرقم فوراً.
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={rechargeLoading}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff',
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      cursor: rechargeLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      opacity: rechargeLoading ? 0.7 : 1
                    }}
                  >
                    {rechargeLoading ? 'جاري الحفظ... ⏳' : 'حفظ وتعديل الرصيد فوراً 💾'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRechargeTarget(null)}
                    disabled={rechargeLoading}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#475569',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
