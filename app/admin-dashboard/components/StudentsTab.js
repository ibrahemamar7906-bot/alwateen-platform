'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'

export default function StudentsTab({ 
  setEditingStudent, 
  styles 
}) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [durations, setDurations] = useState({})
  const [packageFilter, setPackageFilter] = useState('all') // all | vip | basic | free | expired
  const pageSize = 20

  // AI Recharge Modal states
  const [rechargeTarget, setRechargeTarget] = useState(null)
  const [rechargeAmount, setRechargeAmount] = useState(100)
  const [rechargeCustom, setRechargeCustom] = useState('')
  const [rechargeReason, setRechargeReason] = useState('شحن باقة 100 كريديت (15 ج)')
  const [rechargeLoading, setRechargeLoading] = useState(false)
  const [modalMode, setModalMode] = useState('topup') // 'topup' | 'set'
  const [directBalance, setDirectBalance] = useState(20)

  // Package Management Modal states
  const [packageTarget, setPackageTarget] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('student_basic')
  const [liveEnabled, setLiveEnabled] = useState(false)
  const [pkgDuration, setPkgDuration] = useState(1)
  const [pkgBonusCredits, setPkgBonusCredits] = useState(20)
  const [packageSaving, setPackageSaving] = useState(false)

  const openRechargeModal = (student) => {
    setRechargeTarget(student)
    setModalMode('topup')
    setDirectBalance(student.ai_credits_balance ?? 20)
    setRechargeAmount(100)
    setRechargeCustom('')
    setRechargeReason('شحن باقة 100 كريديت (15 ج)')
  }

  const openPackageModal = (student) => {
    setPackageTarget(student)
    const isVip = student.plan_type === 'student_vip' || !!student.has_live
    const currentPlan = isVip ? 'student_vip' : (student.plan_type || 'student_basic')
    setSelectedPlan(currentPlan)
    setLiveEnabled(isVip)
    setPkgDuration(1)
    setPkgBonusCredits(isVip ? 50 : 20)
  }

  const handleSavePackageModal = async (e) => {
    if (e) e.preventDefault()
    if (!packageTarget) return

    setPackageSaving(true)
    const months = parseInt(pkgDuration, 10) || 1
    const isVip = selectedPlan === 'student_vip'
    const bonus = parseInt(pkgBonusCredits, 10) || 0

    try {
      // 1. Try RPC admin_set_student_package
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('admin_set_student_package', {
        p_student_id: packageTarget.id,
        p_plan_type: selectedPlan,
        p_has_live: liveEnabled,
        p_duration_months: months,
        p_bonus_credits: bonus
      })

      if (rpcErr) {
        console.warn('RPC admin_set_student_package failed, updating directly:', rpcErr)
        
        const now = new Date()
        const currentEnd = packageTarget.subscription_end_date ? new Date(packageTarget.subscription_end_date) : null
        const baseDate = (currentEnd && currentEnd > now) ? currentEnd : now
        const newEndDate = new Date(baseDate)
        newEndDate.setMonth(newEndDate.getMonth() + months)

        const currentCreds = Number(packageTarget.ai_credits_balance) || 20
        const newCreds = currentCreds + bonus

        const updateData = {
          status: 'approved',
          plan_type: selectedPlan,
          has_live: liveEnabled,
          subscription_end_date: newEndDate.toISOString(),
          ai_credits_balance: newCreds
        }

        const { error: directErr } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', packageTarget.id)

        if (directErr) {
          // If columns missing in DB, fallback to basic update
          const { error: basicErr } = await supabase
            .from('profiles')
            .update({ status: 'approved', subscription_end_date: newEndDate.toISOString() })
            .eq('id', packageTarget.id)
          if (basicErr) throw basicErr
        }
      }

      alert(`✅ تم تحديث باقة الطالب (${packageTarget.full_name}) وتفعيل (${isVip ? 'باقة VIP مع البث المباشر ⭐' : 'باقة التفوق بدون لايف 🎓'}) بنجاح!`)
      setPackageTarget(null)
      fetchStudents()
    } catch (err) {
      console.error('Error updating package:', err)
      alert('حدث خطأ أثناء تحديث الباقة: ' + (err.message || 'خطأ غير معروف'))
    } finally {
      setPackageSaving(false)
    }
  }

  // Quick Toggle Live for student directly from table
  const handleToggleLive = async (student) => {
    const newLiveState = !student.has_live
    const newPlanType = newLiveState ? 'student_vip' : 'student_basic'

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          has_live: newLiveState,
          plan_type: newPlanType
        })
        .eq('id', student.id)

      if (error) {
        // Fallback update
        console.warn('Direct update failed, might need column addition:', error)
        throw error
      }

      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, has_live: newLiveState, plan_type: newPlanType } : s))
      alert(`✅ تم ${newLiveState ? 'تفعيل البث المباشر (VIP)' : 'إلغاء البث المباشر'} للطالب (${student.full_name}) بنجاح!`)
    } catch (err) {
      console.error('Error toggling live:', err)
      alert('حدث خطأ أثناء تغيير صلاحية البث المباشر: ' + (err.message || ''))
    }
  }

  const handleSetExactBalance = async (e) => {
    if (e) e.preventDefault()
    if (!rechargeTarget) return

    const newBal = Number(directBalance)
    if (isNaN(newBal) || newBal < 0) {
      alert('يرجى إدخال عدد كريديت صحيح (صفر أو أكثر)')
      return
    }

    setRechargeLoading(true)
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ ai_credits_balance: newBal })
        .eq('id', rechargeTarget.id)

      if (updateError) throw updateError

      alert(`✅ تم تعديل رصيد الطالب (${rechargeTarget.full_name}) ليصبح ${newBal} كريديت بنجاح!`)
      setRechargeTarget(null)
      fetchStudents()
    } catch (err) {
      console.error('Error setting exact balance:', err)
      alert('حدث خطأ أثناء تعديل الرصيد: ' + (err.message || 'خطأ غير معروف'))
    } finally {
      setRechargeLoading(false)
    }
  }

  const handleExecuteRecharge = async (e) => {
    if (e) e.preventDefault()
    if (!rechargeTarget) return

    const amount = rechargeCustom ? Number(rechargeCustom) : Number(rechargeAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('يرجى إدخال عدد كريديت صحيح أكبر من صفر')
      return
    }

    setRechargeLoading(true)
    try {
      const { error: rpcError } = await supabase.rpc('topup_ai_credits', {
        p_user_id: rechargeTarget.id,
        p_amount: amount,
        p_description: rechargeReason || 'شحن باقة رصيد ذكاء اصطناعي'
      })

      if (rpcError) {
        console.warn('RPC topup failed, falling back to direct update:', rpcError)
        const currentBal = Number(rechargeTarget.ai_credits_balance) || 20
        const newBal = currentBal + amount
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ ai_credits_balance: newBal })
          .eq('id', rechargeTarget.id)

        if (updateError) throw updateError
      }

      alert('تم شحن ' + amount + ' كريديت بنجاح للطالب (' + rechargeTarget.full_name + ')!')
      setRechargeTarget(null)
      fetchStudents()
    } catch (err) {
      console.error('Error recharging AI credits:', err)
      alert('حدث خطأ أثناء شحن الرصيد: ' + (err.message || 'خطأ غير معروف'))
    } finally {
      setRechargeLoading(false)
    }
  }

  const fetchStudents = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'student')
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, count, error } = await query
      
      if (error) throw error
      setStudents(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Error fetching students:', err)
      alert('حدث خطأ أثناء جلب الطلاب')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents()
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, page])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleDurationChange = (id, val) => {
    setDurations(prev => ({ ...prev, [id]: val }))
  }

  const handleApprove = async (id) => {
    const months = parseInt(durations[id] || '1', 10)
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + months)
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status: 'approved',
          subscription_end_date: endDate.toISOString()
        })
        .eq('id', id)
      
      if (!error) {
        alert(`تم تفعيل الحساب وإضافة اشتراك لمدة ${months} شهر/أشهر بنجاح!`)
        fetchStudents()
      } else {
        throw error
      }
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء إضافة الاشتراك')
    }
  }

  const handleDeleteStudent = async (id) => {
    if(!confirm('هل أنت متأكد من حذف هذا الطالب؟ سيتم حذف جميع بياناته واشتراكاته!')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if(error) throw error;
      alert('تم الحذف بنجاح!');
      fetchStudents();
    } catch(err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    }
  }

  const handleMakeAssistant = async (id) => {
    if(!confirm('هل أنت متأكد من ترقية هذا الحساب ليصبح (مساعد إداري)؟ سيتم نقله إلى قسم المعلمين/المساعدين ولن يظهر كطالب بعد الآن.')) return;
    try {
      const { error } = await supabase.from('profiles').update({ role: 'assistant' }).eq('id', id);
      if(error) throw error;
      alert('تمت الترقية بنجاح! يمكن إدارة المساعدين الآن من تبويبة المعلمين.');
      fetchStudents();
    } catch(err) {
      console.error(err);
      alert('حدث خطأ أثناء الترقية');
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  // Filter students client-side by package
  const filteredStudents = students.filter(student => {
    const now = new Date()
    const subEndDate = student.subscription_end_date ? new Date(student.subscription_end_date) : null
    const hasActiveSub = student.status === 'approved' && subEndDate && subEndDate > now
    const isVip = student.plan_type === 'student_vip' || !!student.has_live

    if (packageFilter === 'vip') return hasActiveSub && isVip
    if (packageFilter === 'basic') return hasActiveSub && !isVip
    if (packageFilter === 'free') return student.status === 'approved' && (!subEndDate || subEndDate <= now)
    if (packageFilter === 'expired') return !hasActiveSub
    return true
  })

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2>جميع الطلاب ({totalCount})</h2>
          <p>إدارة باقات الطلاب: باقة VIP مع البث المباشر ⭐ وباقة التفوق بدون لايف 🎓 ورصيد AI</p>
        </div>
        <div style={{ flex: '1', minWidth: '250px', maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="بحث بالاسم أو رقم الهاتف..." 
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
          />
        </div>
      </div>

      {/* Package Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '15px 0', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', marginLeft: '6px' }}>
          تصفية حسب الباقة:
        </span>
        <button
          onClick={() => setPackageFilter('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: packageFilter === 'all' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
            background: packageFilter === 'all' ? '#eff6ff' : '#fff',
            color: packageFilter === 'all' ? '#1d4ed8' : '#64748b',
            fontWeight: 'bold',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          الكل ({students.length})
        </button>

        <button
          onClick={() => setPackageFilter('vip')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: packageFilter === 'vip' ? '1.5px solid #f59e0b' : '1px solid #fde68a',
            background: packageFilter === 'vip' ? '#fef3c7' : '#fff',
            color: packageFilter === 'vip' ? '#92400e' : '#b45309',
            fontWeight: '900',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>⭐ باقة VIP (مع اللايف 🔴)</span>
        </button>

        <button
          onClick={() => setPackageFilter('basic')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: packageFilter === 'basic' ? '1.5px solid #0284c7' : '1px solid #bae6fd',
            background: packageFilter === 'basic' ? '#e0f2fe' : '#fff',
            color: packageFilter === 'basic' ? '#0369a1' : '#0284c7',
            fontWeight: 'bold',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>🎓 باقة التفوق (بدون لايف)</span>
        </button>

        <button
          onClick={() => setPackageFilter('free')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: packageFilter === 'free' ? '1.5px solid #64748b' : '1px solid #e2e8f0',
            background: packageFilter === 'free' ? '#f1f5f9' : '#fff',
            color: packageFilter === 'free' ? '#0f172a' : '#64748b',
            fontWeight: 'bold',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          🆓 حساب مجاني
        </button>

        <button
          onClick={() => setPackageFilter('expired')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: packageFilter === 'expired' ? '1.5px solid #dc2626' : '1px solid #fecaca',
            background: packageFilter === 'expired' ? '#fee2e2' : '#fff',
            color: packageFilter === 'expired' ? '#991b1b' : '#dc2626',
            fontWeight: 'bold',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          ❌ اشتراك منتهي
        </button>
      </div>

      <div className={styles.tableContainer} style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s', minHeight: '300px' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>المرحلة</th>
              <th>نوع الباقة والاشتراك 📦</th>
              <th>البث المباشر (اللايف) 🔴</th>
              <th>رصيد AI 💎</th>
              <th>رقم الواتساب</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => {
              const now = new Date();
              const subEndDate = student.subscription_end_date ? new Date(student.subscription_end_date) : null;
              const hasActiveSub = student.status === 'approved' && subEndDate && subEndDate > now;
              const isFreeAccount = student.status === 'approved' && (!subEndDate || subEndDate <= now);
              const isVip = (student.plan_type === 'student_vip' || !!student.has_live) && hasActiveSub;
              const isBasic = hasActiveSub && !isVip;
              
              return (
                <tr key={student.id}>
                  <td><strong>{student.full_name}</strong></td>
                  <td>
                    {student.stage === 'primary_1' && 'الصف الأول الابتدائي'}
                    {student.stage === 'primary_2' && 'الصف الثاني الابتدائي'}
                    {student.stage === 'primary_3' && 'الصف الثالث الابتدائي'}
                    {student.stage === 'primary_4' && 'الصف الرابع الابتدائي'}
                    {student.stage === 'primary_5' && 'الصف الخامس الابتدائي'}
                    {student.stage === 'primary_6' && 'الصف السادس الابتدائي'}
                    {student.stage === 'prep_1' && 'الصف الأول الإعدادي'}
                    {student.stage === 'prep_2' && 'الصف الثاني الإعدادي'}
                    {student.stage === 'prep_3' && 'الصف الثالث الإعدادي'}
                    {student.stage === 'sec_1' && 'الصف الأول الثانوي'}
                    {student.stage === 'sec_2' && 'الصف الثاني الثانوي'}
                    {student.stage === 'sec_3' && 'الصف الثالث الثانوي'}
                  </td>

                  {/* Package & Subscription Info */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                      {isVip ? (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                          color: '#92400e',
                          border: '1.5px solid #fcd34d',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: '900',
                          boxShadow: '0 2px 5px rgba(245, 158, 11, 0.15)'
                        }}>
                          <span>⭐ باقة VIP الشاملة</span>
                        </div>
                      ) : isBasic ? (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#e0f2fe',
                          color: '#0369a1',
                          border: '1.5px solid #bae6fd',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 'bold'
                        }}>
                          <span>🎓 باقة التفوق (بدون لايف)</span>
                        </div>
                      ) : isFreeAccount ? (
                        <span style={{ color: '#0284c7', fontWeight: 'bold', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                          حساب مجاني 🆓
                        </span>
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '0.78rem', background: '#fee2e2', padding: '3px 8px', borderRadius: '6px' }}>
                          {student.status === 'pending' ? 'بانتظار الموافقة ⏳' : 'اشتراك منتهي ❌'}
                        </span>
                      )}

                      {subEndDate && hasActiveSub && (
                        <small style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>
                          ينتهي: {subEndDate.toLocaleDateString('ar-EG')}
                        </small>
                      )}

                      <button
                        onClick={() => openPackageModal(student)}
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '2px',
                          boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                        }}
                        title="تغيير باقة الطالب، تفعيل البث المباشر، أو تمديد المدة"
                      >
                        ⚙️ إدارة وتعديل الباقة
                      </button>
                    </div>
                  </td>

                  {/* Live Access Switch */}
                  <td>
                    <button
                      onClick={() => handleToggleLive(student)}
                      title={student.has_live ? "إلغاء صلاحية البث المباشر للطالب" : "منح الطالب صلاحية دخول البث المباشر فوراً"}
                      style={{
                        background: student.has_live ? '#ecfdf5' : '#f8fafc',
                        color: student.has_live ? '#059669' : '#64748b',
                        border: `1.5px solid ${student.has_live ? '#6ee7b7' : '#cbd5e1'}`,
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        fontWeight: '900',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>{student.has_live ? '🔴 متاح (مفعل)' : '⚪ غير مفعل'}</span>
                    </button>
                  </td>

                  {/* AI Credits */}
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
                        backgroundColor: (student.ai_credits_balance ?? 20) > 0 ? '#f0fdf4' : '#fef2f2',
                        color: (student.ai_credits_balance ?? 20) > 0 ? '#15803d' : '#b91c1c',
                        border: `1px solid ${(student.ai_credits_balance ?? 20) > 0 ? '#bbf7d0' : '#fecaca'}`
                      }}>
                        💎 {Number(student.ai_credits_balance ?? 20).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                      <button 
                        onClick={() => openRechargeModal(student)}
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)'
                        }}
                        title="شحن رصيد ذكاء اصطناعي"
                      >
                        ⚡ شحن / تعديل
                      </button>
                    </div>
                  </td>

                  <td dir="ltr">
                    <a href={`https://wa.me/2${student.phone}`} target="_blank" rel="noopener noreferrer" style={{color: '#25D366', textDecoration: 'none', fontWeight: 'bold'}}>
                      {student.phone}
                    </a>
                  </td>

                  <td>
                    <div className={styles.actions} style={{display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap'}}>
                      <button className={`${styles.actionBtn} ${styles.edit}`} onClick={() => setEditingStudent(student)}>تعديل ✏️</button>
                      <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => handleDeleteStudent(student.id)}>حذف 🗑</button>
                      <button className={styles.actionBtn} onClick={() => handleMakeAssistant(student.id)} style={{background: '#6366f1', color: 'white', padding: '5px 10px', fontSize: '0.8rem'}}>ترقية لمساعد 🛡️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && filteredStudents.length === 0 && (
              <tr>
                <td colSpan="7" className={styles.emptyState}>لا يوجد طلاب مطابقين للتصفية المحددة</td>
              </tr>
            )}
            {loading && filteredStudents.length === 0 && (
              <tr>
                <td colSpan="7" className={styles.emptyState}>جاري تحميل البيانات... ⏳</td>
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

      {/* ======================================================== */}
      {/* Modal: Student Package & Live Management ⚙️ */}
      {/* ======================================================== */}
      {packageTarget && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          direction: 'rtl'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '28px',
            width: '92%',
            maxWidth: '520px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', fontWeight: '900' }}>
                  إدارة باقة واشتراك الطالب 📦
                </h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                  الطالب: <strong style={{ color: '#0f172a' }}>{packageTarget.full_name}</strong>
                </p>
              </div>
              <button 
                onClick={() => setPackageTarget(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePackageModal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Plan Type Selector */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b', fontSize: '0.92rem' }}>
                  اختر نوع باقة الاشتراك:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan('student_basic')
                      setLiveEnabled(false)
                      setPkgBonusCredits(20)
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: selectedPlan === 'student_basic' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      background: selectedPlan === 'student_basic' ? '#f0f9ff' : '#fff',
                      color: selectedPlan === 'student_basic' ? '#0369a1' : '#475569',
                      fontWeight: 'bold',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    🎓 باقة التفوق
                    <div style={{ fontSize: '0.75rem', fontWeight: 'normal', marginTop: '4px', opacity: 0.85 }}>
                      (بدون لايف - 60 ج)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan('student_vip')
                      setLiveEnabled(true)
                      setPkgBonusCredits(50)
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: selectedPlan === 'student_vip' ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                      background: selectedPlan === 'student_vip' ? '#fef3c7' : '#fff',
                      color: selectedPlan === 'student_vip' ? '#92400e' : '#475569',
                      fontWeight: '900',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    ⭐ باقة VIP الشاملة
                    <div style={{ fontSize: '0.75rem', fontWeight: 'normal', marginTop: '4px', opacity: 0.85 }}>
                      (مع البث المباشر 🔴 - 100 ج)
                    </div>
                  </button>
                </div>
              </div>

              {/* Live Access Switch */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: liveEnabled ? '#fef3c7' : '#f8fafc',
                border: `1.5px solid ${liveEnabled ? '#fcd34d' : '#e2e8f0'}`,
                borderRadius: '12px'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: liveEnabled ? '#92400e' : '#334155', fontSize: '0.92rem' }}>
                    🔴 صلاحية البث المباشر (Live Access)
                  </div>
                  <small style={{ color: '#64748b', fontSize: '0.78rem' }}>
                    {liveEnabled ? 'مفعل: يحق للطالب دخول القاعة الافتراضية' : 'معطل: لن يتاح له دخول البث'}
                  </small>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.88rem' }}>
                  <input 
                    type="checkbox"
                    checked={liveEnabled}
                    onChange={e => setLiveEnabled(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <span>{liveEnabled ? 'مفعل ✅' : 'معطل ❌'}</span>
                </label>
              </div>

              {/* Duration Selector */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b', fontSize: '0.92rem' }}>
                  مدة الاشتراك المراد تفعيلها / إضافتها:
                </label>
                <select
                  value={pkgDuration}
                  onChange={e => setPkgDuration(parseInt(e.target.value, 10))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 'bold', outline: 'none' }}
                >
                  <option value="1">شهر واحد (+ 1 شهر)</option>
                  <option value="3">ترم كامل (+ 3 أشهر)</option>
                  <option value="6">نصف سنة (+ 6 أشهر)</option>
                  <option value="12">سنة دراسية كاملة (+ 12 شهراً)</option>
                </select>
              </div>

              {/* Bonus AI Credits */}
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontWeight: 'bold', color: '#1e293b', fontSize: '0.92rem' }}>
                  <span>هدية رصيد ذكاء اصطناعي إضافي (AI Credits):</span>
                  <span style={{ color: '#7c3aed', fontSize: '0.82rem' }}>
                    (الرصيد الحالي: {packageTarget.ai_credits_balance ?? 20})
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={pkgBonusCredits}
                  onChange={e => setPkgBonusCredits(parseInt(e.target.value, 10) || 0)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 'bold', outline: 'none' }}
                />
                <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                  افتراضياً: 20 كريديت لباقة التفوق، و 50 كريديت لباقة VIP.
                </small>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={packageSaving}
                  style={{
                    flex: 1,
                    background: selectedPlan === 'student_vip' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: '900',
                    fontSize: '1rem',
                    cursor: packageSaving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                    opacity: packageSaving ? 0.7 : 1
                  }}
                >
                  {packageSaving ? 'جاري الحفظ والتفعيل... ⏳' : 'حفظ وتفعيل الباقة فوراً 🚀'}
                </button>
                <button
                  type="button"
                  onClick={() => setPackageTarget(null)}
                  disabled={packageSaving}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '12px',
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
          </div>
        </div>
      )}

      {/* AI Credits Recharge Modal */}
      {rechargeTarget && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          direction: 'rtl'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            width: '90%',
            maxWidth: '480px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>
                  شحن وتعديل رصيد الذكاء الاصطناعي 💎
                </h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  الطالب: <strong>{rechargeTarget.full_name}</strong>
                </p>
              </div>
              <button 
                onClick={() => setRechargeTarget(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
              <button
                type="button"
                onClick={() => setModalMode('topup')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: modalMode === 'topup' ? '#ffffff' : 'transparent',
                  color: modalMode === 'topup' ? '#7c3aed' : '#64748b',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: modalMode === 'topup' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                + إضافة رصيد (شحن باقة)
              </button>
              <button
                type="button"
                onClick={() => setModalMode('set')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: modalMode === 'set' ? '#ffffff' : 'transparent',
                  color: modalMode === 'set' ? '#7c3aed' : '#64748b',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: modalMode === 'set' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                ✏️ تعيين رصيد محدد مباشرة
              </button>
            </div>

            {/* Mode 1: Topup Form */}
            {modalMode === 'topup' && (
            <form onSubmit={handleExecuteRecharge} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.9rem' }}>
                  اختر الباقة المراد إضافتها للرصيد:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { amount: 100, label: '100 كريديت', price: '15 ج' },
                    { amount: 300, label: '300 كريديت', price: '35 ج' },
                    { amount: 1000, label: '1000 كريديت', price: '80 ج' },
                  ].map(pkg => (
                    <button
                      key={pkg.amount}
                      type="button"
                      onClick={() => {
                        setRechargeAmount(pkg.amount)
                        setRechargeCustom('')
                        setRechargeReason(`شحن باقة ${pkg.label} (${pkg.price})`)
                      }}
                      style={{
                        padding: '10px 6px',
                        borderRadius: '8px',
                        border: (!rechargeCustom && rechargeAmount === pkg.amount) ? '2px solid #8b5cf6' : '1px solid #cbd5e1',
                        background: (!rechargeCustom && rechargeAmount === pkg.amount) ? '#f5f3ff' : '#f8fafc',
                        color: (!rechargeCustom && rechargeAmount === pkg.amount) ? '#6d28d9' : '#334155',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '0.95rem' }}>{pkg.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{pkg.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155', fontSize: '0.9rem' }}>
                  أو اكتب عدداً مخصصاً:
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="مثال: 50، 250، 500..."
                  value={rechargeCustom}
                  onChange={e => {
                    setRechargeCustom(e.target.value)
                    setRechargeReason('شحن مخصص ' + e.target.value + ' كريديت')
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155', fontSize: '0.9rem' }}>
                  ملاحظة / سبب الشحن (للسجل):
                </label>
                <input
                  type="text"
                  value={rechargeReason}
                  onChange={e => setRechargeReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
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
                    الرصيد الجديد المطلوب تحديده للطالب:
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
                    سيتم استبدال الرصيد الحالي ({rechargeTarget.ai_credits_balance ?? 20}) بهذا الرقم فوراً.
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
