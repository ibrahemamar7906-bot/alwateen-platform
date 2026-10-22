const fs = require('fs');
let content = fs.readFileSync('app/teacher-assistant/page.js', 'utf8');

const oldRegex = /const handleActivateCode = async \(e\) => \{[\s\S]*?\} finally \{[\s\S]*?setActivationLoading\(false\)[\s\S]*?\}[\s\S]*?\}/m;

const newHandle = const handleActivateCode = async (e) => {
    e.preventDefault()
    setActivationLoading(true)
    setActivationMessage('')
    try {
      const { activateSubscriptionCode } = await import('../actions/activateCode')
      const res = await activateSubscriptionCode(teacher.id, activationCodeInput)
      
      if (!res.success) {
        setActivationMessage(res.error || 'الكود غير صحيح أو مستخدم من قبل.')
        return
      }

      setActivationMessage('تم التفعيل بنجاح! تمت إضافة ' + res.duration + ' شهور.')
      setTeacher(prev => ({ ...prev, status: 'approved', subscription_end_date: res.newEnd }))

      setTimeout(() => {
        setShowActivationModal(false)
        setActivationCodeInput('')
        setActivationMessage('')
      }, 3000)
    } catch (err) {
      setActivationMessage('حدث خطأ في النظام')
    } finally {
      setActivationLoading(false)
    }
  };

content = content.replace(oldRegex, newHandle);
fs.writeFileSync('app/teacher-assistant/page.js', content, 'utf8');
