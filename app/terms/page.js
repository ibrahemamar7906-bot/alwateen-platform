import Footer from '../components/Footer'
import { FileText, Sparkles } from 'lucide-react'

export default function TermsPage() {
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
            الشروط <span style={{ color: '#059669' }}>والأحكام</span>
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
            <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '16px', color: '#059669' }}><FileText size={24} /></div>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
              مرحباً بك في منصة الوتين التعليمية. باستخدامك لمنصتنا وخدماتنا أو تسجيلك لحساب، فإنك توافق على الالتزام بالشروط والأحكام التالية.
            </p>
          </div>

          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>1. الحساب والتسجيل</h2>
          <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> يجب تقديم معلومات دقيقة وصحيحة عند إنشاء الحساب.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> يتحمل المستخدم مسؤولية الحفاظ على سرية حسابه وكلمة المرور الخاصة به.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> لا يجوز مشاركة الحساب الواحد مع عدة مستخدمين لأغراض تجارية غير مصرح بها.
            </li>
          </ul>

          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>2. الخدمات والاشتراكات</h2>
          <p>
            تقدم المنصة خدمات تعليمية وتفاعلية رقمية تشمل الفصول الافتراضية، والألعاب التعليمية، والأنشطة التفاعلية. يتم تفعيل الاشتراك فور إتمام عملية الدفع بنجاح عبر بوابات الدفع المعتمدة (باي موب - محافظ إلكترونية - بطاقات بنكية).
          </p>

          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>3. الدفع والرسوم</h2>
          <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> جميع المعاملات المالية تتم بعملة الجنيه المصري (EGP).
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> الأسعار المعروضة في صفحة الأسعار نهائية وتشمل الوصول إلى الميزات المحددة لكل خطة.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> تخضع عمليات الاسترجاع لـ <a href="/refund" style={{ color: '#059669', textDecoration: 'underline', fontWeight: 'bold' }}>سياسة الاسترجاع المعتمدة</a>.
            </li>
          </ul>

          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>4. حقوق الملكية الفكرية</h2>
          <p>
            جميع المحتويات، الألعاب، التصاميم، والمواد التعليمية المتاحة على المنصة هي ملك حصري لمنصة الوتين ومحمية بموجب قوانين الملكية الفكرية.
          </p>

          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>5. التواصل والدعم</h2>
          <p>
            في حال وجود أي استفسارات أو شكاوى بخصوص الشروط والأحكام، يرجى التواصل معنا عبر البريد الإلكتروني: <strong>contact@alwateen.com</strong> أو من خلال صفحة <a href="/contact" style={{ color: '#059669', textDecoration: 'underline', fontWeight: 'bold' }}>اتصل بنا</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
