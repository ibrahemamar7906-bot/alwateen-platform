import Footer from '../components/Footer'
import { ShieldCheck, Sparkles } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Tajawal, sans-serif',
      background: 'radial-gradient(circle at top left, #d1fae5 0%, #f8fafc 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Blobs */}
      <div style={{
        position: 'absolute', top: '10%', right: '-5%', width: '300px', height: '300px',
        background: 'rgba(52, 211, 153, 0.15)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0
      }} />
      
      <main style={{ flex: 1, maxWidth: '900px', margin: '0 auto', padding: '80px 20px', width: '100%', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(5, 150, 105, 0.1)', color: '#059669',
            padding: '8px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 'bold',
            marginBottom: '16px', border: '1px solid rgba(5, 150, 105, 0.2)'
          }}>
            <Sparkles size={16} /> قانوني
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#0f172a', fontWeight: '900', margin: 0 }}>
            سياسة <span style={{ color: '#059669' }}>الخصوصية</span>
          </h1>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          padding: 'clamp(24px, 5vw, 50px)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
          color: '#475569',
          lineHeight: '1.9',
          fontSize: '1.1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
            <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '16px', color: '#059669' }}><ShieldCheck size={24} /></div>
            <h2 style={{ color: '#0f172a', margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
              تاريخ آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
            </h2>
          </div>
          
          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>1. مقدمة</h2>
          <p>
            نحن في "منصة الوتين" نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيف نقوم بجمع واستخدام وحماية المعلومات التي تقدمها لنا عند استخدامك لموقعنا.
          </p>

          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>2. المعلومات التي نجمعها</h2>
          <p>قد نجمع المعلومات التالية:</p>
          <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> معلومات التسجيل مثل الاسم، البريد الإلكتروني، ورقم الهاتف.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> البيانات التعليمية وسجلات التقدم للطلاب في الألعاب والدروس.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> معلومات الدفع والتشفير الآمن (لا نقوم بتخزين أرقام البطاقات الائتمانية).
            </li>
          </ul>

          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>3. كيف نستخدم معلوماتك؟</h2>
          <p>نستخدم هذه المعلومات من أجل:</p>
          <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> تقديم الخدمات التعليمية وإدارة الحسابات.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> تحسين جودة المنصة وتقديم تجربة مخصصة للمستخدم.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> التواصل معك وإرسال الإشعارات والتحديثات المهمة.
            </li>
          </ul>

          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>4. حماية البيانات</h2>
          <p>
            نحن نتخذ إجراءات أمنية وتشفيرية قياسية لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإفصاح. لا نقوم ببيع أو تأجير معلوماتك الشخصية لأي طرف ثالث.
          </p>

          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>5. حقوقك</h2>
          <p>
            يحق لك في أي وقت طلب الوصول إلى بياناتك الشخصية أو تعديلها أو حذفها بالكامل من أنظمتنا عبر التواصل مع الدعم الفني.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
