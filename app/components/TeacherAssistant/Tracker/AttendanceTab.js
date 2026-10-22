'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '../../../../utils/supabase'
import { 
  CalendarCheck, Save, CheckCircle, XCircle, Clock, 
  MessageCircle, Printer, Search, Zap, Check, X, Users, AlertCircle 
} from 'lucide-react'

export default function AttendanceTab({ teacherId, teacherName = 'المستر إبراهيم عمار الجندي' }) {
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState([])
  const [attendanceData, setAttendanceData] = useState({}) // student_id -> status
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Quick scanner / search state
  const [quickInput, setQuickInput] = useState('')
  const [quickFeedback, setQuickFeedback] = useState('')
  const quickInputRef = useRef(null)

  // WhatsApp Absentees Modal
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [customMsgTemplate, setCustomMsgTemplate] = useState(
    `السلام عليكم ورحمة الله وبركاته،\nولي أمر الطالب/ة: {student} 🌸\nنود إحاطتكم علماً بغياب نجلكم/ابنتكم عن حصة اليوم ({date}) بمجموعة ({group}).\nنرجو الاطمئنان عليه ومتابعة ما فاته من واجبات وشرح.\nمع تحيات: {teacher} 👨‍🏫`
  )

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    if (selectedGroup && sessionDate) {
      fetchGroupStudentsAndAttendance()
    } else {
      setStudents([])
      setAttendanceData({})
    }
  }, [selectedGroup, sessionDate])

  const fetchGroups = async () => {
    const { data } = await supabase.from('teacher_groups').select('*').eq('teacher_id', teacherId).order('name')
    if (data) setGroups(data)
    setLoading(false)
  }

  const fetchGroupStudentsAndAttendance = async () => {
    setLoading(true)
    
    // Fetch students in this group (with safety filter)
    const { data: links } = await supabase
      .from('teacher_group_students')
      .select('student_id, teacher_students(id, name, phone, parent_phone, grade)')
      .eq('group_id', selectedGroup)

    if (links) {
      const mappedStudents = links
        .map(l => l.teacher_students)
        .filter(Boolean)
        .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar'))
      
      setStudents(mappedStudents)

      // Fetch existing attendance for this date
      const { data: attendance } = await supabase
        .from('teacher_attendance')
        .select('student_id, status')
        .eq('group_id', selectedGroup)
        .eq('session_date', sessionDate)

      const attMap = {}
      mappedStudents.forEach(s => attMap[s.id] = 'present') // default present
      if (attendance) {
        attendance.forEach(a => {
          if (a.student_id) attMap[a.student_id] = a.status
        })
      }
      setAttendanceData(attMap)
    }
    
    setLoading(false)
  }

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }))
    setSaveSuccess(false)
  }

  const handleMarkAll = (status) => {
    const updated = {}
    students.forEach(s => updated[s.id] = status)
    setAttendanceData(updated)
    setSaveSuccess(false)
  }

  // Quick Attendance via Code / Name / Phone
  const handleQuickSubmit = (e) => {
    e.preventDefault()
    if (!quickInput.trim()) return

    const query = quickInput.trim().toLowerCase()
    const found = students.find(s => {
      const name = (s.name || '').toLowerCase()
      const phone = (s.phone || '').replace(/\D/g, '')
      const parentPhone = (s.parent_phone || '').replace(/\D/g, '')
      const idStr = String(s.id || '').toLowerCase()
      return name.includes(query) || phone.includes(query) || parentPhone.includes(query) || idStr.includes(query)
    })

    if (found) {
      handleStatusChange(found.id, 'present')
      setQuickFeedback(`✅ تم تسجيل حضور الطالب: ${found.name}`)
      setTimeout(() => setQuickFeedback(''), 3500)
      setQuickInput('')
      quickInputRef.current?.focus()
    } else {
      setQuickFeedback(`❌ لم يتم العثور على طالب يطابق "${quickInput}" في هذه المجموعة`)
      setTimeout(() => setQuickFeedback(''), 3500)
    }
  }

  const handleSaveAttendance = async () => {
    if (!selectedGroup || !sessionDate || students.length === 0) return

    setSaving(true)
    setSaveSuccess(false)
    try {
      // Delete existing records for this group & date
      await supabase
        .from('teacher_attendance')
        .delete()
        .eq('group_id', selectedGroup)
        .eq('session_date', sessionDate)

      // Insert new records
      const payload = students.map(s => ({
        group_id: selectedGroup,
        student_id: s.id,
        session_date: sessionDate,
        status: attendanceData[s.id] || 'present'
      }))

      const { error } = await supabase.from('teacher_attendance').insert(payload)
      if (error) throw error

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (e) {
      alert('❌ حدث خطأ أثناء حفظ الغياب')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  // Statistics
  const stats = useMemo(() => {
    const total = students.length
    if (total === 0) return { present: 0, absent: 0, late: 0, percent: 0 }

    let present = 0, absent = 0, late = 0
    students.forEach(s => {
      const st = attendanceData[s.id]
      if (st === 'present') present++
      else if (st === 'absent') absent++
      else if (st === 'late') late++
    })

    const percent = Math.round((present / total) * 100)
    return { present, absent, late, percent, total }
  }, [students, attendanceData])

  // Absent students list
  const absentStudents = useMemo(() => {
    return students.filter(s => attendanceData[s.id] === 'absent')
  }, [students, attendanceData])

  const selectedGroupObj = groups.find(g => g.id === selectedGroup)

  // Print function
  const handlePrint = () => {
    window.print()
  }

  // Generate WhatsApp message for a single student
  const getWhatsAppMessage = (student) => {
    return customMsgTemplate
      .replace(/{student}/g, student.name || 'الطالب')
      .replace(/{group}/g, selectedGroupObj?.name || 'المجموعة')
      .replace(/{date}/g, sessionDate)
      .replace(/{teacher}/g, teacherName)
  }

  const handleSendSingleWhatsApp = (student) => {
    const phone = student.parent_phone || student.phone
    if (!phone) {
      alert(`لا يوجد رقم مسجل لولي أمر الطالب: ${student.name}`)
      return
    }
    const cleanPhone = phone.replace(/\D/g, '')
    const finalPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone
    const msg = getWhatsAppMessage(student)
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div>
      {/* Printable Header (Visible only during print) */}
      <div className="print-only" style={{ display: 'none', textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>كشف الحضور والغياب - {teacherName}</h2>
        <p style={{ margin: '5px 0' }}>المجموعة: {selectedGroupObj?.name || ''} | تاريخ الحصة: {sessionDate}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📅</span> دفتر الحضور والغياب الذكي
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            تحضير فوري، إحصائيات مباشرة، وإرسال تنبيهات الغياب لأولياء الأمور بنقرة واحدة
          </p>
        </div>

        {students.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '9px 16px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              <Printer size={16} /> طباعة الكشف
            </button>
          </div>
        )}
      </div>

      {/* Group & Date Selectors */}
      <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '18px', border: '1.5px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 240px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#334155', fontSize: '0.9rem' }}>
            اختر المجموعة الدراسية
          </label>
          <select 
            value={selectedGroup} 
            onChange={e => setSelectedGroup(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', background: 'white', fontWeight: '600', fontSize: '0.95rem', color: '#1e293b' }}
          >
            <option value="">-- يرجى اختيار مجموعة --</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name} {g.schedule ? `(${g.schedule})` : ''}</option>)}
          </select>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#334155', fontSize: '0.9rem' }}>
            تاريخ الحصة
          </label>
          <input 
            type="date" 
            value={sessionDate} 
            onChange={e => setSessionDate(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', background: 'white', fontFamily: 'inherit', fontWeight: '600', fontSize: '0.95rem', color: '#1e293b' }}
          />
        </div>
      </div>

      {!selectedGroup ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
          <CalendarCheck size={48} opacity={0.3} style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>اختر المجموعة لعرض وتحضير الطلاب</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>حدد المجموعة والتاريخ من الأعلى للبدء في رصد الحضور والغياب.</p>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#059669', fontWeight: 'bold' }}>
          جاري تحميل بيانات المجموعة والطلاب...
        </div>
      ) : students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#ef4444', background: '#fef2f2', borderRadius: '20px', border: '1px solid #fecaca' }}>
          <h3 style={{ margin: '0 0 6px 0' }}>هذه المجموعة فارغة ولا يوجد بها طلاب بعد!</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>يرجى الذهاب إلى تبويب "المجموعات" وربط الطلاب بهذه المجموعة.</p>
        </div>
      ) : (
        <>
          {/* Quick Scanner & Fast Search Bar */}
          <div style={{ background: '#ffffff', border: '1.5px solid #d1fae5', padding: '14px 18px', borderRadius: '16px', marginBottom: '18px', boxShadow: '0 4px 12px rgba(5,150,105,0.06)' }}>
            <form onSubmit={handleQuickSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <input
                  ref={quickInputRef}
                  type="text"
                  placeholder="⚡ تحضير سريع: اكتب كود الطالب، أو اسمه، أو رقمه واضغط Enter..."
                  value={quickInput}
                  onChange={e => setQuickInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 16px 11px 40px',
                    borderRadius: '12px',
                    border: '1.5px solid #a7f3d0',
                    outline: 'none',
                    fontSize: '0.92rem',
                    fontWeight: '600',
                    background: '#f0fdf4',
                    boxSizing: 'border-box'
                  }}
                />
                <Search size={18} color="#059669" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              </div>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  color: 'white',
                  border: 'none',
                  padding: '11px 20px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0
                }}
              >
                <Zap size={16} /> تحضير فوري
              </button>
            </form>

            {quickFeedback && (
              <div style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: 'bold',
                background: quickFeedback.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
                color: quickFeedback.startsWith('✅') ? '#047857' : '#b91c1c',
                border: `1px solid ${quickFeedback.startsWith('✅') ? '#a7f3d0' : '#fca5a5'}`
              }}>
                {quickFeedback}
              </div>
            )}
          </div>

          {/* Real-time Statistics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '18px'
          }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 'bold' }}>إجمالي الطلاب</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>{stats.total}</div>
            </div>

            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 'bold' }}>حضور ({stats.percent}%)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#059669' }}>{stats.present}</div>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: 'bold' }}>غياب</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#dc2626' }}>{stats.absent}</div>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: 'bold' }}>متأخر</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#d97706' }}>{stats.late}</div>
            </div>
          </div>

          {/* Batch Actions Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleMarkAll('present')}
                style={{
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Check size={14} /> تحديد الكل حاضر
              </button>

              <button
                onClick={() => handleMarkAll('absent')}
                style={{
                  background: '#fef2f2',
                  color: '#b91c1c',
                  border: '1px solid #fecaca',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <X size={14} /> تحديد الكل غائب
              </button>
            </div>

            {absentStudents.length > 0 && (
              <button
                onClick={() => setShowWhatsAppModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #25D366, #1ebd59)',
                  color: 'white',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(37,211,102,0.3)'
                }}
              >
                <MessageCircle size={18} />
                <span>إرسال تنبيهات الغياب ({absentStudents.length}) 📲</span>
              </button>
            )}
          </div>

          {/* Desktop & Tablet Table */}
          <div style={{ overflowX: 'auto', marginBottom: '20px', background: 'white', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: '450px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1.5px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 16px', fontWeight: '800' }}>اسم الطالب</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '110px' }}>حاضر ✅</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '110px' }}>غائب ❌</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '110px' }}>متأخر ⏰</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const currentStatus = attendanceData[student.id] || 'present'
                  return (
                    <tr 
                      key={student.id} 
                      style={{ 
                        borderBottom: index === students.length - 1 ? 'none' : '1px solid #f1f5f9',
                        background: currentStatus === 'absent' ? '#fff5f5' : currentStatus === 'late' ? '#fffdf5' : 'transparent',
                        transition: 'background 0.2s'
                      }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.98rem' }}>{student.name}</div>
                        {student.phone && (
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', direction: 'ltr', textAlign: 'right' }}>
                            {student.phone}
                          </div>
                        )}
                      </td>
                      
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'present')}
                          style={{
                            background: currentStatus === 'present' ? '#10b981' : '#f1f5f9',
                            color: currentStatus === 'present' ? 'white' : '#64748b',
                            border: `1.5px solid ${currentStatus === 'present' ? '#059669' : '#cbd5e1'}`,
                            borderRadius: '12px',
                            padding: '8px 14px',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s'
                          }}
                        >
                          <CheckCircle size={16} /> حاضر
                        </button>
                      </td>

                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          style={{
                            background: currentStatus === 'absent' ? '#ef4444' : '#f1f5f9',
                            color: currentStatus === 'absent' ? 'white' : '#64748b',
                            border: `1.5px solid ${currentStatus === 'absent' ? '#dc2626' : '#cbd5e1'}`,
                            borderRadius: '12px',
                            padding: '8px 14px',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s'
                          }}
                        >
                          <XCircle size={16} /> غائب
                        </button>
                      </td>

                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'late')}
                          style={{
                            background: currentStatus === 'late' ? '#f59e0b' : '#f1f5f9',
                            color: currentStatus === 'late' ? 'white' : '#64748b',
                            border: `1.5px solid ${currentStatus === 'late' ? '#d97706' : '#cbd5e1'}`,
                            borderRadius: '12px',
                            padding: '8px 14px',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s'
                          }}
                        >
                          <Clock size={16} /> متأخر
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Save & Feedback Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              {saveSuccess && (
                <span style={{ color: '#059669', fontWeight: 'bold', background: '#ecfdf5', padding: '8px 14px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                  ✅ تم حفظ سجل الغياب بنجاح!
                </span>
              )}
            </div>

            <button 
              onClick={handleSaveAttendance} 
              disabled={saving}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '14px',
                fontWeight: '800',
                fontSize: '1.05rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(37,99,235,0.3)'
              }}
            >
              <Save size={20} />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ الغياب لليوم'}</span>
            </button>
          </div>
        </>
      )}

      {/* WhatsApp Absentees Modal */}
      {showWhatsAppModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            borderRadius: '24px',
            padding: '26px',
            position: 'relative',
            overflowY: 'auto',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            direction: 'rtl'
          }}>
            <button
              onClick={() => setShowWhatsAppModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                left: '18px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={24} color="#25D366" /> إرسال تنبيهات الغياب عبر واتساب 📲
            </h3>
            <p style={{ margin: '0 0 18px 0', color: '#64748b', fontSize: '0.88rem' }}>
              الطلاب الغائبون اليوم في مجموعة ({selectedGroupObj?.name}) - إجمالي: {absentStudents.length} طلاب
            </p>

            {/* Template Box */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '0.88rem', color: '#334155' }}>
                نص الرسالة المعتمد (قابلة للتعديل):
              </label>
              <textarea
                rows="4"
                value={customMsgTemplate}
                onChange={e => setCustomMsgTemplate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.88rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              <small style={{ color: '#64748b', fontSize: '0.78rem' }}>
                المتغيرات المتاحة: {'{student}'} (اسم الطالب), {'{group}'} (المجموعة), {'{date}'} (التاريخ), {'{teacher}'} (المعلم).
              </small>
            </div>

            {/* Absent Students List with 1-click WhatsApp buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
              {absentStudents.map(student => {
                const phone = student.parent_phone || student.phone
                return (
                  <div
                    key={student.id}
                    style={{
                      padding: '12px 16px',
                      background: '#f8fafc',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '800', color: '#0f172a' }}>{student.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                        رقم ولي الأمر: {phone || <span style={{ color: '#ef4444' }}>غير مسجل</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendSingleWhatsApp(student)}
                      disabled={!phone}
                      style={{
                        background: phone ? '#25D366' : '#cbd5e1',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        cursor: phone ? 'pointer' : 'not-allowed',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: phone ? '0 2px 8px rgba(37,211,102,0.3)' : 'none'
                      }}
                    >
                      <MessageCircle size={15} /> إرسال لولي الأمر
                    </button>
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  const phones = absentStudents.map(s => s.parent_phone || s.phone).filter(Boolean).map(p => p.replace(/\D/g, '')).join(',')
                  navigator.clipboard.writeText(phones)
                  alert('✅ تم نسخ أرقام جميع أولياء أمور الغائبين!')
                }}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                نسخ جميع الأرقام
              </button>

              <button
                onClick={() => setShowWhatsAppModal(false)}
                style={{
                  background: '#1e293b',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
