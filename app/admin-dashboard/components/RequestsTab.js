'use client'

import { useState } from 'react'

export default function RequestsTab({ 
  requests, 
  trialRequests, 
  durations, 
  handleDurationChange, 
  handleApprove, 
  handleActivateOnly, 
  handleApproveTrial, 
  styles 
}) {
  const [selectedPlans, setSelectedPlans] = useState({})

  const handlePlanChange = (id, val) => {
    setSelectedPlans(prev => ({ ...prev, [id]: val }))
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>طلبات الاشتراك المعلقة ({requests?.length || 0})</h2>
        <p>اختر نوع الباقة (مع البث المباشر VIP أو بدون لايف) والمدة لتفعيل اشتراك الطالب فوراً</p>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>المرحلة الدراسية</th>
              <th>رقم الواتساب</th>
              <th>تحديد الباقة والاشتراك والتفعيل</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => {
              const currentPlan = selectedPlans[req.id] || 'student_basic'
              const isVip = currentPlan === 'student_vip'
              const currentDuration = durations[req.id] || '1'

              return (
                <tr key={req.id}>
                  <td><strong>{req.full_name}</strong></td>
                  <td>
                    {req.stage === 'primary_1' && 'الصف الأول الابتدائي'}
                    {req.stage === 'primary_2' && 'الصف الثاني الابتدائي'}
                    {req.stage === 'primary_3' && 'الصف الثالث الابتدائي'}
                    {req.stage === 'primary_4' && 'الصف الرابع الابتدائي'}
                    {req.stage === 'primary_5' && 'الصف الخامس الابتدائي'}
                    {req.stage === 'primary_6' && 'الصف السادس الابتدائي'}
                    {req.stage === 'prep_1' && 'الصف الأول الإعدادي'}
                    {req.stage === 'prep_2' && 'الصف الثاني الإعدادي'}
                    {req.stage === 'prep_3' && 'الصف الثالث الإعدادي'}
                    {req.stage === 'sec_1' && 'الصف الأول الثانوي'}
                    {req.stage === 'sec_2' && 'الصف الثاني الثانوي'}
                    {req.stage === 'sec_3' && 'الصف الثالث الثانوي'}
                  </td>
                  <td dir="ltr">
                    <a href={`https://wa.me/2${req.phone}`} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', fontWeight: 'bold', textDecoration: 'none' }}>
                      {req.phone}
                    </a>
                  </td>
                  <td>
                    <div className={styles.actions} style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                      <button 
                        className={styles.approveBtn} 
                        onClick={() => handleActivateOnly(req.id)} 
                        style={{background: '#64748b', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 'bold', borderRadius: '8px'}}
                        title="تفعيل حساب مجاني بدون باقة مدفوعة"
                      >
                        قبول (مجاني 🆓)
                      </button>
                      
                      {/* Package and Duration Selector Bar */}
                      <div style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        border: `1.5px solid ${isVip ? '#f59e0b' : '#3b82f6'}`, 
                        borderRadius: '8px', 
                        overflow: 'hidden',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                      }}>
                        {/* Plan Choice: Basic vs VIP */}
                        <select 
                          value={currentPlan} 
                          onChange={(e) => handlePlanChange(req.id, e.target.value)}
                          style={{
                            padding: '6px 10px', 
                            border: 'none', 
                            borderLeft: '1px solid #cbd5e1', 
                            outline: 'none', 
                            background: isVip ? '#fef3c7' : '#eff6ff', 
                            color: isVip ? '#92400e' : '#1e40af', 
                            fontWeight: '900', 
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="student_basic">🎓 باقة التفوق (بدون لايف)</option>
                          <option value="student_vip">⭐ باقة VIP (مع البث المباشر 🔴)</option>
                        </select>

                        {/* Duration Choice */}
                        <select 
                          value={currentDuration} 
                          onChange={(e) => handleDurationChange(req.id, e.target.value)}
                          style={{
                            padding: '6px 8px', 
                            border: 'none', 
                            outline: 'none', 
                            background: '#f8fafc', 
                            fontSize: '0.85rem', 
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="1">شهر واحد</option>
                          <option value="3">3 أشهر (ترم)</option>
                          <option value="6">6 أشهر</option>
                          <option value="12">سنة كاملة</option>
                        </select>

                        {/* Approve Button */}
                        <button 
                          onClick={() => handleApprove(req.id, currentDuration, currentPlan)} 
                          style={{
                            background: isVip ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
                            color: 'white', 
                            padding: '6px 14px', 
                            border: 'none', 
                            cursor: 'pointer', 
                            fontSize: '0.85rem',
                            fontWeight: '900',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          تفعيل الباقة ✅
                        </button>
                      </div>

                      <a 
                        href={`https://wa.me/2${req.phone}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.whatsappBtn}
                        style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '8px' }}
                      >
                        واتساب 💬
                      </a>
                    </div>
                  </td>
                </tr>
              )
            })}
            {(!requests || requests.length === 0) && (
              <tr>
                <td colSpan="4" className={styles.emptyState}>لا توجد طلبات معلقة حالياً ✅</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table for Trial Requests */}
      {trialRequests && trialRequests.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <div className={styles.sectionHeader}>
            <h2>طلبات التجربة المجانية (للمعلمين) 🎁</h2>
            <p>قم بتفعيل 7 أيام تجربة مجانية للمعلمين لاستخدام أدوات المنصة</p>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>رقم الواتساب</th>
                  <th>تاريخ الطلب</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {trialRequests.map(req => (
                  <tr key={req.id}>
                    <td><strong>{req.full_name}</strong></td>
                    <td dir="ltr">{req.phone}</td>
                    <td>{new Date(req.created_at).toLocaleDateString('ar-EG')}</td>
                    <td>
                      <div className={styles.actions} style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                        <button className={styles.approveBtn} onClick={() => handleApproveTrial(req.id)} style={{background: '#8b5cf6'}}>تفعيل 7 أيام مجاناً</button>
                        <a 
                          href={`https://wa.me/2${req.phone}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.whatsappBtn}
                        >
                          واتساب
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
