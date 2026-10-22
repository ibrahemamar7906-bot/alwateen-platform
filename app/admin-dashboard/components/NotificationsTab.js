'use client'

export default function NotificationsTab({
  notificationForm,
  setNotificationForm,
  handleSendNotification,
  actionMessage,
  styles
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>إرسال إشعارات للطلاب 📣</h2>
        <p>أرسل تنبيهات ورسائل تظهر في لوحة الطالب مباشرة.</p>
      </div>

      <form onSubmit={handleSendNotification} style={{maxWidth: '600px', margin: '0 auto', background: '#f9f9f9', padding: '30px', borderRadius: '15px', border: '1px solid #eee'}}>
        <div style={{marginBottom: '15px'}}>
          <label>عنوان الإشعار</label>
          <input 
            type="text" 
            required 
            value={notificationForm.title}
            onChange={e => setNotificationForm({...notificationForm, title: e.target.value})}
            placeholder="مثال: تنبيه هام، كورس جديد، مراجعة نهائية..."
            style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}}
          />
        </div>

        <div style={{marginBottom: '15px'}}>
          <label>نص الإشعار</label>
          <textarea 
            required 
            value={notificationForm.message}
            onChange={e => setNotificationForm({...notificationForm, message: e.target.value})}
            placeholder="اكتب تفاصيل الرسالة هنا..."
            style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '100px', resize: 'vertical'}}
          />
        </div>

        <div style={{marginBottom: '20px'}}>
          <label>الطلاب المستهدفين</label>
          <select 
            value={notificationForm.target}
            onChange={e => setNotificationForm({...notificationForm, target: e.target.value})}
            style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}}
          >
            <option value="all">جميع الطلاب (المفعلين والمنتظرين)</option>
            <option value="sec_1">طلاب الصف الأول الثانوي فقط</option>
            <option value="sec_2">طلاب الصف الثاني الثانوي فقط</option>
            <option value="sec_3">طلاب الصف الثالث الثانوي فقط</option>
          </select>
        </div>

        <button 
          type="submit" 
          style={{width: '100%', padding: '15px', marginTop: '10px', fontSize: '1.1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'}}
          disabled={!!actionMessage}
        >
          {actionMessage || 'إرسال الإشعار الآن 🚀'}
        </button>
      </form>
    </section>
  )
}
