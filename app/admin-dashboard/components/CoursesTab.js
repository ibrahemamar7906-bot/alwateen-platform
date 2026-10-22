'use client'

export default function CoursesTab({ 
  courses, 
  courseForm, 
  setCourseForm, 
  sendCourseNotification, 
  setSendCourseNotification, 
  handleAddCourse, 
  setEditingCourse, 
  handleDeleteCourse, 
  styles 
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>إدارة الكورسات والمراحل 📚</h2>
      </div>
      <form onSubmit={handleAddCourse} style={{background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '20px'}}>
        
        <div style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
          <div style={{flex: 1}}>
            <label>عنوان الكورس (مثال: النحو الشامل)</label>
            <input type="text" required value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}/>
          </div>
          <div style={{flex: 1}}>
            <label>المرحلة الدراسية المرتبطة بالكورس</label>
            <select required value={courseForm.stage} onChange={e => setCourseForm({...courseForm, stage: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}>
              <option value="">-- اختر المرحلة --</option>
              <option value="all">عام لجميع المراحل</option>
              <option value="primary_1">الصف الأول الابتدائي</option>
              <option value="primary_2">الصف الثاني الابتدائي</option>
              <option value="primary_3">الصف الثالث الابتدائي</option>
              <option value="primary_4">الصف الرابع الابتدائي</option>
              <option value="primary_5">الصف الخامس الابتدائي</option>
              <option value="primary_6">الصف السادس الابتدائي</option>
              <option value="prep_1">الصف الأول الإعدادي</option>
              <option value="prep_2">الصف الثاني الإعدادي</option>
              <option value="prep_3">الصف الثالث الإعدادي</option>
              <option value="sec_1">الصف الأول الثانوي</option>
              <option value="sec_2">الصف الثاني الثانوي</option>
              <option value="sec_3">الصف الثالث الثانوي</option>
            </select>
          </div>
        </div>

        <div style={{display: 'flex', gap: '15px'}}>
          <div style={{flex: 2}}>
            <label>وصف الكورس</label>
            <input type="text" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}/>
          </div>
          <div style={{flex: 1}}>
            <label>رابط صورة الغلاف (اختياري)</label>
            <input type="text" value={courseForm.image_url} onChange={e => setCourseForm({...courseForm, image_url: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}} dir="ltr"/>
          </div>
        </div>

        <div className={styles.formGroup} style={{flexDirection: 'row', alignItems: 'center', marginTop: '10px'}}>
          <input 
            type="checkbox" 
            id="notifyStudents" 
            checked={sendCourseNotification}
            onChange={(e) => setSendCourseNotification(e.target.checked)}
            style={{width: 'auto'}}
          />
          <label htmlFor="notifyStudents" style={{margin: 0, cursor: 'pointer'}}>
            إرسال إشعار للطلاب عند إضافة الكورس 📣
          </label>
        </div>

        <button type="submit" style={{padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem'}}>
          إضافة الكورس 📚
        </button>
      </form>

      <div className={styles.sectionHeader}>
        <h2>الكورسات المتاحة</h2>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>الكورس</th>
              <th>المرحلة</th>
              <th>الوصف</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id}>
                <td>{c.title}</td>
                <td>
                    {c.stage === 'all' && 'عام لجميع المراحل'}
                    {c.stage === 'primary_1' && 'الصف الأول الابتدائي'}
                    {c.stage === 'primary_2' && 'الصف الثاني الابتدائي'}
                    {c.stage === 'primary_3' && 'الصف الثالث الابتدائي'}
                    {c.stage === 'primary_4' && 'الصف الرابع الابتدائي'}
                    {c.stage === 'primary_5' && 'الصف الخامس الابتدائي'}
                    {c.stage === 'primary_6' && 'الصف السادس الابتدائي'}
                    {c.stage === 'prep_1' && 'الصف الأول الإعدادي'}
                    {c.stage === 'prep_2' && 'الصف الثاني الإعدادي'}
                    {c.stage === 'prep_3' && 'الصف الثالث الإعدادي'}
                    {c.stage === 'sec_1' && 'الصف الأول الثانوي'}
                    {c.stage === 'sec_2' && 'الصف الثاني الثانوي'}
                    {c.stage === 'sec_3' && 'الصف الثالث الثانوي'}
                </td>
                <td>{c.description || '-'}</td>
                <td>
                  <div className={styles.actions} style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                    <button className={`${styles.actionBtn} ${styles.edit}`} onClick={() => setEditingCourse(c)}>تعديل ✏️</button>
                    <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => handleDeleteCourse(c.id)}>حذف 🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan="4" className={styles.emptyState}>لا توجد كورسات مضافة</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
