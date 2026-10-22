import Footer from '../components/Footer'
import { Rocket, Sparkles } from 'lucide-react'

export default function ShippingPage() {
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
            سياسة <span style={{ color: '#059669' }}>التسليم</span>
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
          
          <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', padding: '20px 25px', borderRadius: '16px', marginBottom: '30px', borderRight: '4px solid #059669', boxShadow: '0 10px 25px rgba(5, 150, 105, 0.1)' }}>
            <h3 style={{ color: '#064e3b', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Rocket size={20} /> ملاحظة هامة (خدمات رقمية فقط)
            </h3>
            <p style={{ margin: 0, fontWeight: 'bold' }}>
              منصة الوتين هي منصة تعليمية تقدم خدمات رقمية واشتراكات إلكترونية فقط. <strong>لا يوجد لدينا أي منتجات مادية (فيزيائية) تتطلب الشحن أو التوصيل.</strong>
            </p>
          </div>

          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>1. كيفية تسليم الخدمة</h2>
          <p>
            بمجرد إتمام عملية الدفع بنجاح (سواء عبر البطاقات البنكية أو المحافظ الإلكترونية)، يتم تفعيل اشتراكك أو الكود الخاص بك <strong>فورياً وبشكل تلقائي</strong>.
          </p>

          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>2. تأكيد التفعيل</h2>
          <p>
            بعد الدفع، سيتم توجيهك إلى صفحة التأكيد وستحصل على الصلاحيات الكاملة للحساب حسب الباقة التي اخترتها. كما قد تتلقى رسالة تأكيد عبر البريد الإلكتروني (إن وجد).
          </p>

          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>3. مشاكل التسليم والتفعيل</h2>
          <p>
            في حال قمت بالدفع ولم يتم تفعيل حسابك تلقائياً خلال دقائق، يُرجى التواصل الفوري مع الدعم الفني عبر وسائل التواصل المتاحة في صفحة "تواصل معنا"، مع إرفاق إيصال الدفع، وسنقوم بتفعيل الحساب يدوياً في أسرع وقت.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
