import { useState, useEffect } from 'react'
import { supabase } from '../../../../utils/supabase'
import { Plus, Edit2, Trash2, Users, X, Link as LinkIcon, LayoutGrid, Search, Copy, CheckSquare, Square } from 'lucide-react'

export default function GroupsTab({ teacherId, teacherName = 'المستر إبراهيم عمار الجندي' }) {
  const [groups, setGroups] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [showModal, setShowModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [formData, setFormData] = useState({ name: '', schedule: '' })
  
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [activeGroupForLink, setActiveGroupForLink] = useState(null)
  const [linkedStudentIds, setLinkedStudentIds] = useState([])
  const [studentSearch, setStudentSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [teacherId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [groupsRes, studentsRes] = await Promise.all([
        supabase.from('teacher_groups').select('*').eq('teacher_id', teacherId).order('created_at', { ascending: false }),
        supabase.from('teacher_students').select('id, name, grade, phone, parent_phone').eq('teacher_id', teacherId).order('name')
      ])
      
      if (groupsRes.data) {
        // Also fetch student counts per group
        const { data: links } = await supabase.from('teacher_group_students').select('group_id')
        const counts = links ? links.reduce((acc, curr) => {
          acc[curr.group_id] = (acc[curr.group_id] || 0) + 1
          return acc
        }, {}) : {}

        const mappedGroups = groupsRes.data.map(g => ({ ...g, studentCount: counts[g.id] || 0 }))
        setGroups(mappedGroups)
      }
      if (studentsRes.data) setAllStudents(studentsRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGroup = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      if (editingGroup) {
        await supabase.from('teacher_groups').update(formData).eq('id', editingGroup.id)
      } else {
        await supabase.from('teacher_groups').insert([{ teacher_id: teacherId, ...formData }])
      }
      setShowModal(false)
      fetchData()
    } catch (e) {
      alert('خطأ في حفظ المجموعة')
    }
  }

  const handleDeleteGroup = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذف جميع سجلات الحضور والمدفوعات الخاصة بها.')) return
    try {
      await supabase.from('teacher_groups').delete().eq('id', id)
      fetchData()
    } catch (e) {
      alert('خطأ في الحذف')
    }
  }

  const openLinkModal = async (group) => {
    setActiveGroupForLink(group)
    setStudentSearch('')
    // Fetch currently linked students
    const { data } = await supabase.from('teacher_group_students').select('student_id').eq('group_id', group.id)
    if (data) {
      setLinkedStudentIds(data.map(d => d.student_id))
    } else {
      setLinkedStudentIds([])
    }
    setShowLinkModal(true)
  }

  const toggleStudentLink = (studentId) => {
    if (linkedStudentIds.includes(studentId)) {
      setLinkedStudentIds(prev => prev.filter(id => id !== studentId))
    } else {
      setLinkedStudentIds(prev => [...prev, studentId])
    }
  }

  const selectAllFiltered = (filtered) => {
    const ids = filtered.map(s => s.id)
    setLinkedStudentIds(prev => Array.from(new Set([...prev, ...ids])))
  }

  const deselectAllFiltered = (filtered) => {
    const ids = new Set(filtered.map(s => s.id))
    setLinkedStudentIds(prev => prev.filter(id => !ids.has(id)))
  }

  const saveLinkedStudents = async () => {
    try {
      // Delete existing
      await supabase.from('teacher_group_students').delete().eq('group_id', activeGroupForLink.id)
      
      // Insert new
      if (linkedStudentIds.length > 0) {
        const payload = linkedStudentIds.map(id => ({ group_id: activeGroupForLink.id, student_id: id }))
        await supabase.from('teacher_group_students').insert(payload)
      }
      
      setShowLinkModal(false)
      fetchData()
    } catch (e) {
      alert('خطأ في حفظ ربط الطلاب')
    }
  }

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

  const copyGroupPhones = async (group) => {
    const { data } = await supabase
      .from('teacher_group_students')
      .select('teacher_students(phone, parent_phone)')
      .eq('group_id', group.id)

    if (data) {
      const phones = data
        .map(d => formatEgyptPhone(d.teacher_students?.parent_phone || d.teacher_students?.phone))
        .filter(Boolean)
        .join('\n')

      if (!phones) {
        alert('لا توجد أرقام هواتف مسجلة لطلاب هذه المجموعة!')
        return
      }

      navigator.clipboard.writeText(phones)
      alert(`✅ تم نسخ أرقام (${phones.split('\n').length}) طالب/ولي أمر لرسالة جماعية بنجاح!`)
    }
  }

  const filteredStudents = allStudents.filter(s => 
    s.name.includes(studentSearch) || (s.grade && s.grade.includes(studentSearch))
  )

  return (
    <div>
      {/* ── Top Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: 900 }}>
            مجموعات التقوية والحصص ({groups.length}) 🏫
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            تنظيم المجموعات حسب الصفوف الدراسية والمواعيد وتوزيع الطلاب
          </p>
        </div>

        <button 
          onClick={() => { setEditingGroup(null); setFormData({ name: '', schedule: '' }); setShowModal(true) }}
          style={{ 
            background: '#2563eb', 
            color: 'white', 
            border: 'none', 
            padding: '12px 22px', 
            borderRadius: '14px', 
            fontWeight: 800, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer',
            boxShadow: '0 6px 15px -2px rgba(37,99,235,0.3)'
          }}
        >
          <Plus size={20} /> إضافة مجموعة جديدة
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px 0', color: '#059669', fontWeight: 'bold' }}>
          جاري تحميل المجموعات...
        </p>
      ) : groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <LayoutGrid size={52} opacity={0.3} style={{ marginBottom: '15px' }} />
          <h3>ليس لديك أي مجموعات مسجلة بعد</h3>
          <p>قم بإنشاء مجموعة ثم اضغط على زر "إدارة الطلاب" لربط طلابك بها.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {groups.map(group => (
            <div 
              key={group.id} 
              style={{ 
                background: 'white', 
                border: '1.5px solid #e2e8f0', 
                borderRadius: '20px', 
                padding: '22px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)', 
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              
              {/* Action Buttons (Top Left in RTL) */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => { setEditingGroup(group); setFormData({ name: group.name, schedule: group.schedule || '' }); setShowModal(true) }} 
                  style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '7px', borderRadius: '10px', cursor: 'pointer' }}
                  title="تعديل اسم أو موعد المجموعة"
                >
                  <Edit2 size={15} />
                </button>
                <button 
                  onClick={() => handleDeleteGroup(group.id)} 
                  style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '7px', borderRadius: '10px', cursor: 'pointer' }}
                  title="حذف المجموعة"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', paddingLeft: '70px', fontSize: '1.15rem', fontWeight: 900 }}>
                  {group.name}
                </h3>
                <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.88rem', minHeight: '20px' }}>
                  📅 {group.schedule || 'لم يتم تحديد موعد ثابت'}
                </p>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 800, fontSize: '0.95rem' }}>
                  <Users size={18} /> {group.studentCount} طالب
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => copyGroupPhones(group)}
                    style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, fontSize: '0.82rem' }}
                    title="نسخ أرقام الطلاب وأولياء الأمور لرسالة جماعية"
                  >
                    <Copy size={14} /> الأرقام
                  </button>

                  <button 
                    onClick={() => openLinkModal(group)}
                    style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '8px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <LinkIcon size={14} /> إدارة الطلاب
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Group Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '420px', borderRadius: '24px', padding: '28px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '18px', left: '18px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', color: '#0f172a' }}>
              {editingGroup ? 'تعديل المجموعة' : 'إضافة مجموعة جديدة'}
            </h3>
            
            <form onSubmit={handleSaveGroup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '0.9rem', color: '#334155' }}>
                  اسم المجموعة <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontWeight: 600 }} 
                  placeholder="مثال: لغة عربية - ثالثة إعدادي (السبت)" 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '0.9rem', color: '#334155' }}>
                  المواعيد (اختياري)
                </label>
                <input 
                  type="text" 
                  value={formData.schedule} 
                  onChange={e => setFormData({...formData, schedule: e.target.value})} 
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} 
                  placeholder="مثال: السبت والثلاثاء 5:00 م" 
                />
              </div>
              
              <button 
                type="submit" 
                style={{ 
                  background: '#2563eb', 
                  color: 'white', 
                  border: 'none', 
                  padding: '14px', 
                  borderRadius: '14px', 
                  fontWeight: 800, 
                  fontSize: '1.05rem', 
                  cursor: 'pointer', 
                  marginTop: '10px' 
                }}
              >
                {editingGroup ? 'حفظ التعديلات' : 'إنشاء المجموعة'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Link Students Modal with Instant Search & Batch Select ── */}
      {showLinkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '540px', maxHeight: '85vh', borderRadius: '24px', padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            
            <button 
              onClick={() => setShowLinkModal(false)} 
              style={{ position: 'absolute', top: '18px', left: '18px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>

            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#0f172a' }}>
              إدارة طلاب: {activeGroupForLink?.name}
            </h3>
            <p style={{ margin: '0 0 14px 0', color: '#64748b', fontSize: '0.85rem' }}>
              حدد الطلاب المنضمين لهذه المجموعة (تم تحديد {linkedStudentIds.length} طالب)
            </p>

            {/* Search Box */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <input 
                type="text" 
                placeholder="بحث بالاسم أو المرحلة..." 
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontWeight: 600 }}
              />
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>

            {/* Quick Select / Deselect Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '0.82rem' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>النتائج ({filteredStudents.length})</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => selectAllFiltered(filteredStudents)}
                  style={{ background: '#ecfdf5', color: '#059669', border: 'none', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                >
                  تحديد المعروض
                </button>
                <button
                  type="button"
                  onClick={() => deselectAllFiltered(filteredStudents)}
                  style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                >
                  إلغاء المعروض
                </button>
              </div>
            </div>
            
            {/* Students Checkbox List */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {allStudents.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 10px' }}>
                  لا يوجد أي طلاب مسجلين. قم بإضافة أو استيراد الطلاب من تبويب "الطلاب" أولاً.
                </p>
              ) : filteredStudents.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                  لا توجد نتائج مطابقة للبحث.
                </p>
              ) : (
                filteredStudents.map(student => {
                  const isChecked = linkedStudentIds.includes(student.id)
                  return (
                    <label 
                      key={student.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '10px 14px', 
                        background: isChecked ? '#ecfdf5' : '#ffffff', 
                        border: isChecked ? '1.5px solid #10b981' : '1px solid #e2e8f0', 
                        borderRadius: '12px', 
                        cursor: 'pointer', 
                        transition: 'all 0.15s ease' 
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => toggleStudentLink(student.id)} 
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#059669' }} 
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>{student.name}</div>
                        {student.grade && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{student.grade}</div>}
                      </div>
                    </label>
                  )
                })
              )}
            </div>

            <button 
              onClick={saveLinkedStudents} 
              style={{ 
                background: '#059669', 
                color: 'white', 
                border: 'none', 
                padding: '14px', 
                borderRadius: '14px', 
                fontWeight: 900, 
                fontSize: '1.05rem', 
                cursor: 'pointer', 
                marginTop: '16px',
                boxShadow: '0 8px 15px -3px rgba(5,150,105,0.3)'
              }}
            >
              حفظ قائمة الطلاب ({linkedStudentIds.length})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
