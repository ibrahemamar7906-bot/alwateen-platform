'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../../../utils/supabase'
import { 
  Plus, Search, Edit2, Trash2, Phone, Save, X, Users, 
  Download, Upload, Check, Printer, UserCheck, Filter, AlertCircle 
} from 'lucide-react'

export default function StudentsTab({ teacherId, teacherName = 'المستر إبراهيم عمار الجندي' }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all')
  
  // Modals
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [formData, setFormData] = useState({ name: '', phone: '', parent_phone: '', grade: '' })
  const [saving, setSaving] = useState(false)

  // Platform Import Modal
  const [showPlatformModal, setShowPlatformModal] = useState(false)
  const [platformStudents, setPlatformStudents] = useState([])
  const [loadingPlatform, setLoadingPlatform] = useState(false)
  const [selectedPlatformIds, setSelectedPlatformIds] = useState([])
  const [platformStageFilter, setPlatformStageFilter] = useState('all')

  // Bulk Import Modal (Excel paste)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [bulkGrade, setBulkGrade] = useState('')
  const [bulkSaving, setBulkSaving] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('teacher_students')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })
      
      if (!error && data) setStudents(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Fetch Platform Registered Students
  const openPlatformImportModal = async () => {
    setShowPlatformModal(true)
    setLoadingPlatform(true)
    setSelectedPlatformIds([])

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, parent_phone, stage, student_code')
        .eq('role', 'student')
        .order('full_name')

      if (!error && data) {
        setPlatformStudents(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingPlatform(false)
    }
  }

  const handleImportSelectedPlatform = async () => {
    if (selectedPlatformIds.length === 0) return

    setLoadingPlatform(true)
    try {
      const selectedProfiles = platformStudents.filter(p => selectedPlatformIds.includes(p.id))
      
      const payload = selectedProfiles.map(p => ({
        teacher_id: teacherId,
        name: p.full_name || 'طالب منصة',
        phone: p.phone || '',
        parent_phone: p.parent_phone || '',
        grade: p.stage || ''
      }))

      const { error } = await supabase.from('teacher_students').insert(payload)
      if (error) throw error

      alert(`✅ تم استيراد ${payload.length} طالب من المنصة بنجاح!`)
      setShowPlatformModal(false)
      fetchStudents()
    } catch (e) {
      alert('❌ حدث خطأ أثناء الاستيراد')
      console.error(e)
    } finally {
      setLoadingPlatform(false)
    }
  }

  // Bulk Add / Excel Paste Handler
  const handleBulkImport = async (e) => {
    e.preventDefault()
    if (!bulkText.trim()) return

    setBulkSaving(true)
    try {
      const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean)
      const toInsert = []

      for (let line of lines) {
        // Can be separated by comma, tab, or semicolon
        const parts = line.split(/[,\t;]/).map(p => p.trim())
        if (parts.length > 0 && parts[0]) {
          toInsert.push({
            teacher_id: teacherId,
            name: parts[0],
            phone: parts[1] || '',
            parent_phone: parts[2] || '',
            grade: parts[3] || bulkGrade || ''
          })
        }
      }

      if (toInsert.length === 0) {
        alert('لم يتم العثور على بيانات صالحة للإضافة!')
        setBulkSaving(false)
        return
      }

      const { error } = await supabase.from('teacher_students').insert(toInsert)
      if (error) throw error

      alert(`✅ تم إضافة ${toInsert.length} طالب بنجاح!`)
      setShowBulkModal(false)
      setBulkText('')
      fetchStudents()
    } catch (err) {
      alert('❌ حدث خطأ أثناء الإضافة الجماعية')
      console.error(err)
    } finally {
      setBulkSaving(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSaving(true)
    try {
      if (editingStudent) {
        const { error } = await supabase
          .from('teacher_students')
          .update({ name: formData.name, phone: formData.phone, parent_phone: formData.parent_phone, grade: formData.grade })
          .eq('id', editingStudent.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('teacher_students')
          .insert([{ teacher_id: teacherId, ...formData }])
        if (error) throw error
      }
      setShowModal(false)
      fetchStudents()
    } catch (e) {
      alert('❌ حدث خطأ أثناء الحفظ')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطالب؟ سيتم حذف جميع بيانات حضوره ومدفوعاته أيضاً.')) return
    try {
      const { error } = await supabase.from('teacher_students').delete().eq('id', id)
      if (error) throw error
      setStudents(prev => prev.filter(s => s.id !== id))
    } catch (e) {
      alert('❌ خطأ في الحذف')
    }
  }

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = (s.name || '').includes(search) || 
                          (s.phone && s.phone.includes(search)) || 
                          (s.parent_phone && s.parent_phone.includes(search))
      const matchGrade = selectedGradeFilter === 'all' || s.grade === selectedGradeFilter
      return matchSearch && matchGrade
    })
  }, [students, search, selectedGradeFilter])

  // Extract unique grades for filter
  const uniqueGrades = useMemo(() => {
    const set = new Set()
    students.forEach(s => {
      if (s.grade) set.add(s.grade)
    })
    return Array.from(set)
  }, [students])

  // Print function
  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      {/* Printable Header */}
      <div className="print-only" style={{ display: 'none', textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>كشف الطلاب - {teacherName}</h2>
        <p style={{ margin: '5px 0' }}>إجمالي الطلاب: {filteredStudents.length} طالب | تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👥</span> إدارة شؤون الطلاب ({students.length})
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            إضافة الطلاب، استيراد طلاب المنصة، اللصق من إكسيل، والتواصل المباشر مع أولياء الأمور
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={openPlatformImportModal}
            style={{
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              color: 'white',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2,132,199,0.25)'
            }}
          >
            <UserCheck size={16} /> استيراد من المنصة
          </button>

          <button 
            onClick={() => setShowBulkModal(true)}
            style={{
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '9px 16px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Upload size={16} /> لصق إكسيل / جماعي
          </button>

          <button 
            onClick={() => { setEditingStudent(null); setFormData({ name: '', phone: '', parent_phone: '', grade: '' }); setShowModal(true) }}
            style={{
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: 'white',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(5,150,105,0.25)'
            }}
          >
            <Plus size={18} /> إضافة طالب
          </button>

          {students.length > 0 && (
            <button
              onClick={handlePrint}
              style={{
                background: '#f8fafc',
                color: '#64748b',
                border: '1px solid #cbd5e1',
                padding: '9px 14px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="طباعة كشف الطلاب"
            >
              <Printer size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '16px', border: '1.5px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <input 
            type="text" 
            placeholder="ابحث بالاسم أو رقم هاتف الطالب أو ولي الأمر..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.92rem', boxSizing: 'border-box' }}
          />
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
        </div>

        {uniqueGrades.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="#64748b" />
            <select
              value={selectedGradeFilter}
              onChange={e => setSelectedGradeFilter(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.88rem', fontWeight: 'bold', color: '#334155' }}
            >
              <option value="all">جميع المراحل ({students.length})</option>
              {uniqueGrades.map((g, i) => (
                <option key={i} value={g}>{g}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#059669', fontWeight: 'bold' }}>
          جاري تحميل قائمة الطلاب...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
          <Users size={48} opacity={0.3} style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>لا يوجد طلاب مطابقين للبحث</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>أضف طلابك يدوياً أو استوردهم بنقرة واحدة من طلاب المنصة المسجلين.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: '550px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1.5px solid #e2e8f0' }}>
                <th style={{ padding: '14px 16px', fontWeight: '800' }}>كود / اسم الطالب</th>
                <th style={{ padding: '14px 16px', fontWeight: '800' }}>المرحلة</th>
                <th style={{ padding: '14px 16px', fontWeight: '800' }}>رقم الطالب</th>
                <th style={{ padding: '14px 16px', fontWeight: '800' }}>رقم ولي الأمر</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', width: '100px' }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, idx) => (
                <tr key={student.id} style={{ borderBottom: idx === filteredStudents.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                        #{idx + 1}
                      </span>
                      <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>{student.name}</span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.82rem', background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                      {student.grade || 'غير محدد'}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    {student.phone ? (
                      <a href={`https://wa.me/${student.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.88rem' }}>
                        <Phone size={13} /> {student.phone}
                      </a>
                    ) : <span style={{ color: '#94a3b8' }}>--</span>}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    {student.parent_phone ? (
                      <a href={`https://wa.me/${student.parent_phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0284c7', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.88rem' }}>
                        <Phone size={13} /> {student.parent_phone}
                      </a>
                    ) : <span style={{ color: '#94a3b8' }}>--</span>}
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      <button onClick={() => { setEditingStudent(student); setFormData(student); setShowModal(true) }} style={{ background: '#f1f5f9', color: '#2563eb', border: 'none', padding: '7px', borderRadius: '8px', cursor: 'pointer' }} title="تعديل"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(student.id)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '7px', borderRadius: '8px', cursor: 'pointer' }} title="حذف"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '24px', padding: '26px', position: 'relative', direction: 'rtl' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '18px', left: '18px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.2rem' }}><X size={20} /></button>
            <h3 style={{ margin: '0 0 18px 0', fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>{editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h3>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '0.88rem' }}>اسم الطالب <span style={{color: 'red'}}>*</span></label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} placeholder="الاسم ثلاثي أو رباعي..." />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '0.88rem' }}>المرحلة الدراسية</label>
                <input type="text" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} placeholder="مثال: الصف الثالث الإعدادي" />
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 180px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '0.88rem' }}>رقم الطالب (واتساب)</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', direction: 'ltr', boxSizing: 'border-box' }} placeholder="010..." />
                </div>
                <div style={{ flex: '1 1 180px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '0.88rem' }}>رقم ولي الأمر (واتساب)</label>
                  <input type="text" value={formData.parent_phone} onChange={e => setFormData({...formData, parent_phone: e.target.value})} style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', direction: 'ltr', boxSizing: 'border-box' }} placeholder="011..." />
                </div>
              </div>
              
              <button disabled={saving} type="submit" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: saving ? 'not-allowed' : 'pointer', marginTop: '10px' }}>
                {saving ? 'جاري الحفظ...' : 'حفظ بيانات الطالب'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Platform Import Modal */}
      {showPlatformModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '650px', maxHeight: '90vh', borderRadius: '24px', padding: '26px', position: 'relative', overflowY: 'auto', direction: 'rtl' }}>
            <button onClick={() => setShowPlatformModal(false)} style={{ position: 'absolute', top: '18px', left: '18px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={24} color="#0284c7" /> استيراد طلاب المنصة المسجلين 📥
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.88rem' }}>
              اختر الطلاب المسجلين بالفعل في المنصة لإضافتهم تلقائياً دون كتابة يدوية
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  if (selectedPlatformIds.length === platformStudents.length) {
                    setSelectedPlatformIds([])
                  } else {
                    setSelectedPlatformIds(platformStudents.map(p => p.id))
                  }
                }}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {selectedPlatformIds.length === platformStudents.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
              </button>

              <span style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 'bold' }}>
                المحدد: {selectedPlatformIds.length} من {platformStudents.length}
              </span>
            </div>

            {loadingPlatform ? (
              <p style={{ textAlign: 'center', padding: '30px', color: '#0284c7' }}>جاري جلب طلاب المنصة...</p>
            ) : platformStudents.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>لا يوجد حسابات طلاب مسجلة بالمنصة حالياً.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto', marginBottom: '20px' }}>
                {platformStudents.map(p => {
                  const isChecked = selectedPlatformIds.includes(p.id)
                  const isAlreadyAdded = students.some(s => s.name === p.full_name || (s.phone && s.phone === p.phone))

                  return (
                    <label
                      key={p.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: `1.5px solid ${isChecked ? '#0284c7' : '#e2e8f0'}`,
                        background: isChecked ? '#f0f9ff' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) setSelectedPlatformIds(prev => prev.filter(id => id !== p.id))
                            else setSelectedPlatformIds(prev => [...prev, p.id])
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: '800', color: '#0f172a' }}>{p.full_name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.phone || 'لا يوجد هاتف'} • المرحلة: {p.stage || 'غير محدد'}</div>
                        </div>
                      </div>

                      {isAlreadyAdded && (
                        <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#047857', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                          مضاف مسبقاً
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowPlatformModal(false)}
                style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                إلغاء
              </button>
              <button
                onClick={handleImportSelectedPlatform}
                disabled={selectedPlatformIds.length === 0 || loadingPlatform}
                style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                استيراد المحددين ({selectedPlatformIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import / Excel Paste Modal */}
      {showBulkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '550px', borderRadius: '24px', padding: '26px', position: 'relative', direction: 'rtl' }}>
            <button onClick={() => setShowBulkModal(false)} style={{ position: 'absolute', top: '18px', left: '18px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>
              📋 إضافة جماعية / لصق من إكسيل
            </h3>
            <p style={{ margin: '0 0 14px 0', color: '#64748b', fontSize: '0.85rem' }}>
              انسخ الأعمدة من ملف Excel أو اكتب كل طالب في سطر بالترتيب: الاسم, رقم الطالب, رقم ولي الأمر, المرحلة
            </p>

            <form onSubmit={handleBulkImport} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  المرحلة الافتراضية (إن لم تكن محددة في السطور):
                </label>
                <input
                  type="text"
                  placeholder="مثال: الصف الأول الثانوي"
                  value={bulkGrade}
                  onChange={e => setBulkGrade(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  بيانات الطلاب (سطر لكل طالب):
                </label>
                <textarea
                  rows="7"
                  required
                  placeholder={`أحمد محمد السيد, 01012345678, 01198765432, الصف الأول الإعدادي\nمحمود علي حسن, 01234567890, 01055566677\nسارة إبراهيم, 01500011122`}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', outline: 'none', fontSize: '0.88rem', fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={bulkSaving}
                  style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {bulkSaving ? 'جاري الإضافة...' : 'إضافة الطلاب الآن 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
