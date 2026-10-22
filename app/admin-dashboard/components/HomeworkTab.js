'use client'

export default function HomeworkTab({ 
  homeworks, 
  gradingHomework, 
  setGradingHomework, 
  handleGradeHomework, 
  handleDeleteHomework, 
  styles 
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>إدارة الواجبات المدرسية</h2>
      </div>
      
      {gradingHomework && (
        <div style={{background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '20px', border: '2px solid #3b82f6'}}>
          <h3>تقييم واجب الطالب: {gradingHomework.profiles?.full_name}</h3>
          <p><strong>الدرس:</strong> {gradingHomework.lessons?.title}</p>
          <p><strong>رابط الواجب:</strong> <a href={gradingHomework.file_url} target="_blank" rel="noopener noreferrer" style={{color: '#3b82f6'}}>عرض الملف المرفوع 📄</a></p>
          
          <form onSubmit={handleGradeHomework} style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <div>
              <label>الدرجة الممنوحة:</label>
              <input type="number" required value={gradingHomework.grade || ''} onChange={e => setGradingHomework({...gradingHomework, grade: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}/>
            </div>
            <div>
              <label>ملاحظات (اختياري):</label>
              <textarea value={gradingHomework.feedback || ''} onChange={e => setGradingHomework({...gradingHomework, feedback: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', minHeight: '80px'}}></textarea>
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <button type="submit" style={{background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>حفظ التقييم</button>
              <button type="button" onClick={() => setGradingHomework(null)} style={{background: '#64748b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>الطالب</th>
              <th>الدرس</th>
              <th>حالة الواجب</th>
              <th>تاريخ التسليم</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {homeworks.map(h => (
              <tr key={h.id}>
                <td>
                  <strong>{h.profiles?.full_name || 'غير معروف'}</strong>
                  <div style={{fontSize: '0.8rem', color: '#666'}}>{h.profiles?.phone}</div>
                </td>
                <td>{h.lessons?.title || 'درس محذوف'}</td>
                <td>
                  {h.status === 'graded' ? (
                    <span style={{background: '#d1fae5', color: '#065f46', padding: '3px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold'}}>تم التقييم ({h.grade})</span>
                  ) : (
                    <span style={{background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold'}}>بانتظار التقييم</span>
                  )}
                </td>
                <td dir="ltr">{new Date(h.created_at).toLocaleDateString('ar-EG')}</td>
                <td>
                  <a href={h.file_url} target="_blank" rel="noopener noreferrer" className={styles.actionBtn} style={{background: '#3b82f6', color: 'white', textDecoration: 'none', display: 'inline-block', marginRight: '5px'}}>عرض المرفق</a>
                  <button onClick={() => setGradingHomework(h)} className={`${styles.actionBtn} ${styles.edit}`}>تقييم</button>
                  <button onClick={() => handleDeleteHomework(h.id)} className={`${styles.actionBtn} ${styles.delete}`} style={{marginRight: '5px'}}>حذف</button>
                </td>
              </tr>
            ))}
            {homeworks.length === 0 && (
              <tr>
                <td colSpan="5" className={styles.emptyState}>لا توجد واجبات مسلّمة بعد</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
