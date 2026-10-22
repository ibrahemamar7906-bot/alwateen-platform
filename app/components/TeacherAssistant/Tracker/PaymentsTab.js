import { useState, useEffect } from 'react'
import { supabase } from '../../../../utils/supabase'
import { 
  DollarSign, Save, Calendar, FileText, CheckCircle2, XCircle, AlertCircle, 
  MessageCircle, Printer, X, Copy, Sparkles, Filter 
} from 'lucide-react'

export default function PaymentsTab({ teacherId, teacherName = 'المستر إبراهيم عمار الجندي' }) {
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [students, setStudents] = useState([])
  
  const [paymentData, setPaymentData] = useState({}) // student_id -> { amount, status }
  const [paymentType, setPaymentType] = useState('monthly') // monthly | per_session
  const [paymentReference, setPaymentReference] = useState('شهر أكتوبر')
  const [commonAmount, setCommonAmount] = useState('200')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [reminderTemplate, setReminderTemplate] = useState(
    'السلام عليكم ورحمة الله وبركاته،\nولي أمر الطالب المحترم: {student}\n\nنود تذكير سيادتكم بلطف بسداد اشتراك ({reference}) وقيمته ({amount} ج.م).\nشاكرين لحسن تعاونكم ودعمكم المستمر.\n\nمع تحيات: {teacher} 👨‍🏫'
  )

  useEffect(() => {
    fetchGroups()
  }, [teacherId])

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupStudentsAndPayments()
    } else {
      setStudents([])
      setPaymentData({})
    }
  }, [selectedGroup, paymentType, paymentReference])

  const fetchGroups = async () => {
    const { data } = await supabase.from('teacher_groups').select('*').eq('teacher_id', teacherId).order('name')
    if (data) {
      setGroups(data)
      if (data.length > 0 && !selectedGroup) {
        setSelectedGroup(data[0].id)
      }
    }
    setLoading(false)
  }

  const fetchGroupStudentsAndPayments = async () => {
    setLoading(true)
    
    // Fetch students with phone & parent_phone
    const { data: links } = await supabase
      .from('teacher_group_students')
      .select('student_id, teacher_students(id, name, phone, parent_phone, grade)')
      .eq('group_id', selectedGroup)

    if (links) {
      // Safe filter in case student was deleted
      const mappedStudents = links
        .map(l => l.teacher_students)
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name, 'ar'))

      setStudents(mappedStudents)

      if (paymentReference.trim()) {
        const { data: payments } = await supabase
          .from('teacher_payments')
          .select('student_id, amount_paid, status')
          .eq('group_id', selectedGroup)
          .eq('payment_type', paymentType)
          .eq('payment_reference', paymentReference)

        const pMap = {}
        mappedStudents.forEach(s => pMap[s.id] = { amount: '', status: 'unpaid' })
        if (payments) {
          payments.forEach(p => {
            pMap[p.student_id] = { amount: p.amount_paid !== null ? p.amount_paid : '', status: p.status || 'unpaid' }
          })
        }
        setPaymentData(pMap)
      } else {
        const pMap = {}
        mappedStudents.forEach(s => pMap[s.id] = { amount: '', status: 'unpaid' })
        setPaymentData(pMap)
      }
    }
    
    setLoading(false)
  }

  const handleUpdatePayment = (studentId, field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }))
  }

  // Batch mark all as paid
  const setAllStatus = (status, defaultAmount = null) => {
    setPaymentData(prev => {
      const updated = { ...prev }
      students.forEach(s => {
        const curr = updated[s.id] || {}
        updated[s.id] = {
          ...curr,
          status,
          amount: status === 'paid' && defaultAmount !== null ? defaultAmount : (status === 'unpaid' ? '0' : curr.amount)
        }
      })
      return updated
    })
  }

  // Apply common amount to all students
  const applyCommonAmount = () => {
    if (!commonAmount) return
    setPaymentData(prev => {
      const updated = { ...prev }
      students.forEach(s => {
        const curr = updated[s.id] || {}
        updated[s.id] = {
          ...curr,
          amount: commonAmount,
          status: 'paid'
        }
      })
      return updated
    })
  }

  const handleSavePayments = async () => {
    if (!selectedGroup || !paymentReference.trim() || students.length === 0) {
      alert('يرجى التأكد من اختيار المجموعة وتحديد وصف الدفعة')
      return
    }

    setSaving(true)
    try {
      // Delete existing records for this group & reference to replace them
      await supabase
        .from('teacher_payments')
        .delete()
        .eq('group_id', selectedGroup)
        .eq('payment_type', paymentType)
        .eq('payment_reference', paymentReference)

      // Insert new records
      const payload = students.map(s => {
        const data = paymentData[s.id] || { amount: 0, status: 'unpaid' }
        return {
          group_id: selectedGroup,
          student_id: s.id,
          amount_paid: Number(data.amount) || 0,
          payment_type: paymentType,
          payment_reference: paymentReference,
          status: data.status
        }
      })

      const { error } = await supabase.from('teacher_payments').insert(payload)
      if (error) throw error

      alert('✅ تم حفظ بيانات الحسابات بنجاح')
    } catch (e) {
      console.error(e)
      alert('❌ حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  // Helper for WhatsApp Egyptian phone numbers
  const formatEgyptPhone = (raw) => {
    if (!raw) return ''
    let cleaned = raw.replace(/\D/g, '')
    if (cleaned.startsWith('0')) {
      cleaned = '2' + cleaned
    } else if (!cleaned.startsWith('2') && cleaned.length === 10) {
      cleaned = '20' + cleaned
    }
    return cleaned
  }

  const sendSingleWhatsAppReminder = (student) => {
    const phone = formatEgyptPhone(student.parent_phone || student.phone)
    if (!phone) {
      alert(`لا يوجد رقم مسجل للطالب ${student.name} أو لولي الأمر`)
      return
    }
    const currentData = paymentData[student.id] || {}
    const amountVal = currentData.amount || commonAmount || 'المحدد'
    const msg = reminderTemplate
      .replace(/{student}/g, student.name)
      .replace(/{reference}/g, paymentReference)
      .replace(/{amount}/g, amountVal)
      .replace(/{teacher}/g, teacherName)

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  // Calculate stats
  const totalStudents = students.length
  const paidCount = students.filter(s => paymentData[s.id]?.status === 'paid').length
  const partialCount = students.filter(s => paymentData[s.id]?.status === 'partial').length
  const unpaidCount = students.filter(s => !paymentData[s.id] || paymentData[s.id]?.status === 'unpaid').length
  const totalCollected = students.reduce((sum, s) => sum + (Number(paymentData[s.id]?.amount) || 0), 0)
  const unpaidStudents = students.filter(s => !paymentData[s.id] || paymentData[s.id]?.status !== 'paid')

  const handlePrint = () => {
    window.print()
  }

  const currentGroupName = groups.find(g => g.id === selectedGroup)?.name || 'المجموعة'

  return (
    <div>
      {/* ── Top Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: 900 }}>
            إدارة الحسابات والمصروفات 💰
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            متابعة الاشتراكات الشهرية وتكلفة الحصص وإرسال تذكيرات الدفع لأولياء الأمور
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handlePrint}
            style={{
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={18} /> طباعة الكشف
          </button>

          <button 
            onClick={() => setShowWhatsAppModal(true)}
            disabled={unpaidStudents.length === 0}
            style={{
              background: unpaidStudents.length > 0 ? '#10b981' : '#cbd5e1',
              color: 'white',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: unpaidStudents.length > 0 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MessageCircle size={18} /> تذكير المتأخرين ({unpaidStudents.length})
          </button>
        </div>
      </div>

      {/* ── Controls Bar ── */}
      <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '18px', border: '1.5px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        
        {/* Group Selector */}
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#334155', fontSize: '0.9rem' }}>
            المجموعة
          </label>
          <select 
            value={selectedGroup} 
            onChange={e => setSelectedGroup(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontWeight: 600 }}
          >
            <option value="">-- اختر مجموعة --</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        
        {/* Payment Type */}
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#334155', fontSize: '0.9rem' }}>
            نظام الدفع
          </label>
          <select 
            value={paymentType} 
            onChange={e => setPaymentType(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontWeight: 600 }}
          >
            <option value="monthly">اشتراك شهري</option>
            <option value="per_session">بالحصة / كورس مكثف</option>
          </select>
        </div>

        {/* Payment Reference */}
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#334155', fontSize: '0.9rem' }}>
            {paymentType === 'monthly' ? 'شهر الدفع' : 'وصف الحصص / الكورس'}
          </label>
          <input 
            type="text" 
            placeholder={paymentType === 'monthly' ? "مثال: شهر أكتوبر" : "مثال: حصص المراجعة"}
            value={paymentReference} 
            onChange={e => setPaymentReference(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', boxSizing: 'border-box', fontWeight: 600 }}
          />
        </div>

        {/* Common Amount Batcher */}
        <div style={{ flex: '1 1 200px', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#334155', fontSize: '0.9rem' }}>
              المبلغ الموحد (ج.م)
            </label>
            <input 
              type="number"
              placeholder="200"
              value={commonAmount}
              onChange={e => setCommonAmount(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', boxSizing: 'border-box' }}
            />
          </div>
          <button
            onClick={applyCommonAmount}
            type="button"
            style={{
              padding: '11px 14px',
              borderRadius: '12px',
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title="تطبيق هذا المبلغ وتحديد الكل مدفوع"
          >
            تطبيق على الكل
          </button>
        </div>

      </div>

      {!selectedGroup ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <DollarSign size={52} opacity={0.3} style={{ marginBottom: '15px' }} />
          <h3>قم باختيار المجموعة لعرض الطلاب والحسابات</h3>
        </div>
      ) : loading ? (
        <p style={{ textAlign: 'center', padding: '40px 0', color: '#059669', fontWeight: 'bold' }}>
          جاري تحميل الطلاب وسجلات الدفع...
        </p>
      ) : students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#ef4444' }}>
          <h3>هذه المجموعة فارغة!</h3>
          <p style={{ color: '#64748b' }}>قم بإضافة طلاب للمجموعة من تبويب "المجموعات".</p>
        </div>
      ) : (
        <>
          {/* ── Real-time Stats & Batch Quick Buttons ── */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
            padding: '16px 20px',
            borderRadius: '16px',
            border: '1.5px solid #e2e8f0',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Quick stats badges */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ background: '#f1f5f9', color: '#334155', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800 }}>
                👥 الطلاب: {totalStudents}
              </span>
              <span style={{ background: '#ecfdf5', color: '#047857', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800 }}>
                ✅ تم السداد: {paidCount} ({totalStudents > 0 ? Math.round((paidCount / totalStudents) * 100) : 0}%)
              </span>
              {partialCount > 0 && (
                <span style={{ background: '#fffbeb', color: '#b45309', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800 }}>
                  ⚠️ سداد جزئي: {partialCount}
                </span>
              )}
              <span style={{ background: '#fef2f2', color: '#b91c1c', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800 }}>
                ❌ معلق: {unpaidCount}
              </span>
              <span style={{ background: '#f5f3ff', color: '#6d28d9', padding: '6px 14px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 900 }}>
                💵 الإجمالي المحصل: {totalCollected.toLocaleString()} ج.م
              </span>
            </div>

            {/* Quick batch status buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setAllStatus('paid', commonAmount)}
                style={{
                  background: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  padding: '7px 12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                تحديد الكل سدد ✅
              </button>
              <button
                type="button"
                onClick={() => setAllStatus('unpaid')}
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  padding: '7px 12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                تحديد الكل لم يسدد ❌
              </button>
            </div>
          </div>

          {/* ── Table Container ── */}
          <div style={{ overflowX: 'auto', marginBottom: '20px', background: 'white', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1.5px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 16px', width: '50px' }}>#</th>
                  <th style={{ padding: '14px 16px' }}>اسم الطالب</th>
                  <th style={{ padding: '14px 16px' }}>حالة الدفع</th>
                  <th style={{ padding: '14px 16px' }}>المبلغ المدفوع (ج.م)</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>مراسلة واتساب</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const data = paymentData[student.id] || { amount: '', status: 'unpaid' }
                  return (
                    <tr 
                      key={student.id} 
                      style={{ 
                        borderBottom: index === students.length - 1 ? 'none' : '1px solid #f1f5f9',
                        background: data.status === 'paid' ? '#fcfffd' : data.status === 'partial' ? '#fffdfa' : '#ffffff'
                      }}
                    >
                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>{index + 1}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{student.name}</div>
                        {student.grade && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{student.grade}</div>}
                      </td>
                      
                      <td style={{ padding: '14px 16px' }}>
                        <select 
                          value={data.status}
                          onChange={e => handleUpdatePayment(student.id, 'status', e.target.value)}
                          style={{ 
                            padding: '8px 12px', 
                            borderRadius: '10px', 
                            border: '1.5px solid',
                            borderColor: data.status === 'paid' ? '#a7f3d0' : data.status === 'partial' ? '#fde68a' : '#fecaca',
                            outline: 'none', 
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            background: data.status === 'paid' ? '#ecfdf5' : data.status === 'partial' ? '#fffbeb' : '#fef2f2',
                            color: data.status === 'paid' ? '#047857' : data.status === 'partial' ? '#b45309' : '#b91c1c',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="unpaid">لم يدفع ❌</option>
                          <option value="paid">تم الدفع بالكامل ✅</option>
                          <option value="partial">دفع جزء ⚠️</option>
                        </select>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input 
                            type="number" 
                            min="0"
                            placeholder="0"
                            value={data.amount}
                            onChange={e => handleUpdatePayment(student.id, 'amount', e.target.value)}
                            style={{ 
                              width: '110px', 
                              padding: '8px 12px', 
                              borderRadius: '10px', 
                              border: '1px solid #cbd5e1', 
                              outline: 'none', 
                              fontWeight: 700, 
                              textAlign: 'center' 
                            }}
                          />
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>ج.م</span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => sendSingleWhatsAppReminder(student)}
                          style={{
                            background: data.status === 'paid' ? '#f1f5f9' : '#25D366',
                            color: data.status === 'paid' ? '#94a3b8' : 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer'
                          }}
                          title={data.status === 'paid' ? "إرسال إيصال أو رسالة شكر" : "إرسال تذكير بالسداد"}
                        >
                          <MessageCircle size={15} />
                          {data.status === 'paid' ? 'إشعار' : 'تذكير'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ── Save Button Bar ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button 
              onClick={handleSavePayments} 
              disabled={saving}
              style={{ 
                background: '#059669', 
                color: 'white', 
                border: 'none', 
                padding: '14px 32px', 
                borderRadius: '14px', 
                fontWeight: 900, 
                fontSize: '1.05rem', 
                cursor: saving ? 'not-allowed' : 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                boxShadow: '0 8px 15px -3px rgba(5,150,105,0.3)'
              }}
            >
              <Save size={20} /> {saving ? 'جاري الحفظ...' : 'حفظ كشف الحسابات'}
            </button>
          </div>
        </>
      )}

      {/* ── WhatsApp Reminder Modal ── */}
      {showWhatsAppModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '580px', maxHeight: '90vh', borderRadius: '24px', padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            
            <button 
              onClick={() => setShowWhatsAppModal(false)} 
              style={{ position: 'absolute', top: '18px', left: '18px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>

            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={22} color="#10b981" />
              تذكير أولياء الأمور بالمصروفات 📲
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.85rem' }}>
              مجموعة: <strong>{currentGroupName}</strong> • الدفعة: <strong>{paymentReference}</strong> ({unpaidStudents.length} طلاب متأخرين)
            </p>

            {/* Template Box */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '0.85rem', color: '#334155' }}>
                نص الرسالة (يمكنك تعديله قبل الإرسال):
              </label>
              <textarea
                rows={4}
                value={reminderTemplate}
                onChange={e => setReminderTemplate(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', fontSize: '0.85rem', lineHeight: '1.5', boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                المتغيرات المتاحة: &#123;student&#125; اسم الطالب، &#123;reference&#125; الوصف، &#123;amount&#125; المبلغ، &#123;teacher&#125; اسم المعلم
              </span>
            </div>

            {/* Unpaid Students List */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {unpaidStudents.map((st, i) => {
                const phone = formatEgyptPhone(st.parent_phone || st.phone)
                const data = paymentData[st.id] || {}
                const isPartial = data.status === 'partial'
                return (
                  <div 
                    key={st.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '10px 14px', 
                      background: isPartial ? '#fffbeb' : '#fef2f2', 
                      borderRadius: '12px',
                      border: isPartial ? '1px solid #fde68a' : '1px solid #fee2e2'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                        {i + 1}. {st.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: isPartial ? '#b45309' : '#dc2626', marginTop: '2px' }}>
                        {isPartial ? `دفع جزء (${data.amount} ج.م)` : 'لم يسدد'} • {phone ? `📞 ${phone}` : '❌ لا يوجد هاتف'}
                      </div>
                    </div>

                    <button
                      onClick={() => sendSingleWhatsAppReminder(st)}
                      disabled={!phone}
                      style={{
                        background: phone ? '#25D366' : '#cbd5e1',
                        color: 'white',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: phone ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <MessageCircle size={14} /> إرسال الآن
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Copy numbers button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => {
                  const phones = unpaidStudents
                    .map(s => formatEgyptPhone(s.parent_phone || s.phone))
                    .filter(Boolean)
                    .join('\n')
                  navigator.clipboard.writeText(phones)
                  alert('✅ تم نسخ أرقام أولياء الأمور بنجاح!')
                }}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Copy size={16} /> نسخ جميع الأرقام
              </button>

              <button
                onClick={() => setShowWhatsAppModal(false)}
                style={{
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                تم الإنتهاء
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
