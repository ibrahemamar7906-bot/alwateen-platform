'use client'

export default function QATab({ 
  studentQuestions, 
  answeringQuestion, 
  setAnsweringQuestion, 
  handleAnswerQuestion, 
  handleDeleteQuestion, 
  styles 
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>أسئلة الطلاب ومناقشاتهم</h2>
      </div>
      
      {answeringQuestion && (
        <div style={{background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '20px', border: '2px solid #3b82f6'}}>
          <h3>الرد على: {answeringQuestion.profiles?.full_name}</h3>
          <p><strong>الدرس:</strong> {answeringQuestion.lessons?.title}</p>
          <div style={{background: '#f8fafc', padding: '15px', borderRadius: '10px', margin: '15px 0'}}>
            <strong>السؤال:</strong>
            <p style={{marginTop: '5px', fontSize: '1.1rem'}}>{answeringQuestion.question}</p>
          </div>
          
          <form onSubmit={handleAnswerQuestion} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <div>
              <label>الرد / الإجابة:</label>
              <textarea required value={answeringQuestion.answer || ''} onChange={e => setAnsweringQuestion({...answeringQuestion, answer: e.target.value})} style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', minHeight: '100px'}}></textarea>
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <button type="submit" style={{background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>حفظ الرد</button>
              <button type="button" onClick={() => setAnsweringQuestion(null)} style={{background: '#64748b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>إلغاء</button>
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
              <th>السؤال</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {studentQuestions.map(q => (
              <tr key={q.id}>
                <td>
                  <strong>{q.profiles?.full_name || 'غير معروف'}</strong>
                  <div style={{fontSize: '0.8rem', color: '#666'}}>{new Date(q.created_at).toLocaleDateString('ar-EG')}</div>
                </td>
                <td>{q.lessons?.title || 'درس محذوف'}</td>
                <td>
                  <div style={{maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={q.question}>
                    {q.question}
                  </div>
                </td>
                <td>
                  {q.answer ? (
                    <span style={{background: '#d1fae5', color: '#065f46', padding: '3px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold'}}>تم الرد</span>
                  ) : (
                    <span style={{background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold'}}>بانتظار الرد</span>
                  )}
                </td>
                <td>
                  <button onClick={() => setAnsweringQuestion(q)} className={`${styles.actionBtn} ${q.answer ? styles.edit : styles.approve}`}>{q.answer ? 'تعديل الرد' : 'رد على السؤال'}</button>
                  <button onClick={() => handleDeleteQuestion(q.id)} className={`${styles.actionBtn} ${styles.delete}`} style={{marginRight: '5px'}}>حذف</button>
                </td>
              </tr>
            ))}
            {studentQuestions.length === 0 && (
              <tr>
                <td colSpan="5" className={styles.emptyState}>لا توجد أسئلة بعد</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
