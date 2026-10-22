import Footer from '../components/Footer'
import { RefreshCcw, Sparkles } from 'lucide-react'

export default function RefundPage() {
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
            سياسة <span style={{ color: '#059669' }}>الاسترجاع</span>
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
            <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '16px', color: '#059669' }}><RefreshCcw size={24} /></div>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
              نحن في منصة الوتين نهتم برضا عملائنا. نرجو منك قراءة شروط الاسترجاع والإلغاء بعناية قبل إتمام عملية الشراء.
            </p>
          </div>

          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>1. شروط استرجاع الأموال</h2>
          <p>نظراً لطبيعة الخدمات الرقمية التي نقدمها، يُسمح بطلب استرجاع الأموال ضمن الشروط التالية فقط:</p>
          <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> أن يتم طلب الاسترجاع خلال <strong>14 يوماً</strong> كحد أقصى من تاريخ الدفع.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> ألا يكون المستخدم قد استهلك الخدمة (لم يقم المعلم بإنشاء غرف، ولم يقم الطالب بلعب الألعاب). يتم مراجعة السجلات.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> وجود خلل تقني جسيم يمنع الاستفادة من الخدمة وعجز فريق الدعم عن حله.
            </li>
          </ul>

          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>2. الحالات التي لا يشملها الاسترجاع</h2>
          <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#ef4444' }}>
              <span>✖</span> تجاوز مدة 14 يوماً من تاريخ الاشتراك.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#ef4444' }}>
              <span>✖</span> استخدام الحساب والاستفادة من الخدمات بالفعل.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#ef4444' }}>
              <span>✖</span> مخالفة المستخدم لشروط وأحكام المنصة مما أدى إلى حظر حسابه.
            </li>
          </ul>

          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>3. طريقة طلب الاسترجاع</h2>
          <p>
            لتقديم طلب استرجاع، يرجى إرسال رسالة إلى البريد الإلكتروني <strong>contact@alwateen.com</strong> أو التواصل عبر الواتساب الموضح في صفحة "تواصل معنا"، مع تزويدنا بالتفاصيل التالية:
          </p>
          <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> رقم الهاتف المسجل في المنصة أو البريد الإلكتروني.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> إيصال الدفع أو رقم العملية.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> سبب طلب الاسترجاع.
            </li>
          </ul>

          <h2 style={{ color: '#0f172a', marginTop: '30px', marginBottom: '15px', fontWeight: '800' }}>4. معالجة الطلب</h2>
          <p>
            سيتم مراجعة طلبك خلال 2 إلى 5 أيام عمل. في حال الموافقة، سيتم إعادة المبلغ لنفس وسيلة الدفع المستخدمة (البطاقة البنكية أو المحفظة الإلكترونية)، وقد يستغرق ظهور المبلغ في حسابك من 7 إلى 14 يوم عمل حسب سياسة البنك الخاص بك.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
