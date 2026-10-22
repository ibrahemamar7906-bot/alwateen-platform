@
import re

with open("app/teacher-assistant/page.js", "r", encoding="utf-8") as f:
    content = f.read()

old_regex = re.compile(r"const handleActivateCode = async \(e\) => \{.*?\} finally \{\s*setActivationLoading\(false\)\s*\}\s*\}", re.DOTALL)

new_content = """  const handleActivateCode = async (e) => {
    e.preventDefault()
    setActivationLoading(true)
    setActivationMessage("")
    try {
      const { activateSubscriptionCode } = await import("../actions/activateCode")
      const res = await activateSubscriptionCode(teacher.id, activationCodeInput)
      
      if (!res.success) {
        setActivationMessage(res.error || "❌ الكود غير صحيح أو مستخدم من قبل.")
        return
      }

      setActivationMessage(`✅ تم التفعيل بنجاح! تمت إضافة ${res.duration} شهور.`)
      setTeacher(prev => ({ ...prev, status: "approved", subscription_end_date: res.newEnd }))

      setTimeout(() => {
        setShowActivationModal(false)
        setActivationCodeInput("")
        setActivationMessage("")
      }, 3000)
    } catch (err) {
      setActivationMessage("⚠️ حدث خطأ في النظام")
    } finally {
      setActivationLoading(false)
    }
  }"""

content = old_regex.sub(new_content, content)

with open("app/teacher-assistant/page.js", "w", encoding="utf-8") as f:
    f.write(content)
@
