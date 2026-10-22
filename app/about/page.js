import Footer from '../components/Footer'
import { Sparkles, Target, Star, BookOpen, GraduationCap, Video, Trophy } from 'lucide-react'

export const metadata = {
  title: 'تعرف علينا | منصة الوتين التعليمية - المستر إبراهيم عمار',
  description: 'تعرف على رؤية ورسالة منصة الوتين التعليمية بإشراف المستر إبراهيم عمار. المنصة الرائدة لتعليم وتأسيس اللغة العربية لجميع مراحل التعليم العام والأزهر.',
}

export default function AboutPage() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Tajawal, sans-serif',
      background: 'radial-gradient(circle at top left, rgba(26,46,134,0.06) 0%, #f8fafc 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Background Blobs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%', width: '350px', height: '350px',
        background: 'rgba(26, 46, 134, 0.08)', borderRadius: '50%', filter: 'blur(70px)', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '-5%', width: '400px', height: '400px',
        background: 'rgba(222, 162, 74, 0.08)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0
      }} />

      <main style={{ flex: 1, maxWidth: '1000px', margin: '0 auto', padding: '60px 20px', width: '100%', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(26, 46, 134, 0.08)', color: '#1A2E86',
            padding: '8px 18px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 800,
            marginBottom: '16px', border: '1px solid rgba(26, 46, 134, 0.2)'
          }}>
            <Sparkles size={16} color="#DEA24A" /> تعرف علينا
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', color: '#0f172a', fontWeight: '900', margin: 0 }}>
            منصة <span style={{ color: '#1A2E86' }}>الوتين</span> التعليمية
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#64748b', marginTop: '14px', maxWidth: '650px', margin: '14px auto 0', lineHeight: 1.6 }}>
            المنصة التعليمية الرائدة للغة العربية لجميع مراحل العام والأزهر بإشراف <strong>المستر إبراهيم عمار</strong>.
          </p>
        </div>

        {/* 🌟 Official Platform Poster Showcase 🌟 */}
        <div style={{
          maxWidth: '920px',
          margin: '0 auto 40px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(26, 46, 134, 0.28), 0 0 0 2px rgba(222, 162, 74, 0.35)',
          background: 'linear-gradient(135deg, #1A2E86 0%, #0F1D5C 100%)'
        }}>
          <img 
            src="/poster.jpg" 
            alt="بوستر منصة الوتين التعليمية - المستر إبراهيم عمار | تعلّم بذكاء.. تميّز بجدارة" 
            style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }}
          />
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          padding: 'clamp(24px, 5vw, 45px)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#eef2ff', padding: '12px', borderRadius: '16px', color: '#1A2E86' }}><Star size={24} /></div>
            <h2 style={{ color: '#0f172a', margin: 0, fontSize: '1.45rem', fontWeight: '800' }}>عن منصة الوتين ورسالتها</h2>
          </div>
          <p style={{ fontSize: '1.08rem', color: '#475569', lineHeight: '1.9', marginBottom: '35px' }}>
            منصة <strong>الوتين</strong> هي بيئة تعليمية ذكية ومتكاملة أسسها <strong>المستر إبراهيم عمار</strong>، لتكون رفيق الطالب من التأسيس الأولي وحتى التميز في الشهادات العامة والأزهرية. نهدف إلى تغيير أساليب الشرح التقليدية من خلال توظيف أحدث أدوات البث المباشر التفاعلي والسبورة الذكية والألعاب المنهجية التي تزيد من تركيز وشغف الطالب.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '16px', color: '#b45309' }}><Target size={24} /></div>
            <h2 style={{ color: '#0f172a', margin: 0, fontSize: '1.45rem', fontWeight: '800' }}>رؤيتنا</h2>
          </div>
          <p style={{ fontSize: '1.08rem', color: '#475569', lineHeight: '1.9', marginBottom: '35px' }}>
            أن تكون منصة الوتين الوجهة التعليمية المعتمدة لطلاب اللغة العربية في مصر، وأن نوفر للمعلمين بيئة تكنولوجية متقدمة ومستقلة لإدارة فصولهم الافتراضية بكل كفاءة وسهولة.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#eef2ff', padding: '12px', borderRadius: '16px', color: '#1A2E86' }}><Sparkles size={24} /></div>
            <h2 style={{ color: '#0f172a', margin: 0, fontSize: '1.45rem', fontWeight: '800' }}>ماذا نقدم في المنصة؟</h2>
          </div>
          <ul style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '2.1', paddingLeft: 0, listStyle: 'none', margin: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ color: '#1A2E86', fontWeight: 900 }}>✓</span> فصول افتراضية وبث مباشر (Live Classroom) مع سبورة تفاعلية متطورة.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ color: '#1A2E86', fontWeight: 900 }}>✓</span> بنك أسئلة متكامل واختبارات إلكترونية تفاعلية مع تصحيح تلقائي وإحصائيات مستوى.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ color: '#1A2E86', fontWeight: 900 }}>✓</span> فيديوهات شرح مبسطة ومذكرات PDF جاهزة للتحميل والطباعة.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ color: '#1A2E86', fontWeight: 900 }}>✓</span> دعم كامل وتغطية شاملة لمناهج العام والأزهر الشريف لكافة المراحل.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#1A2E86', fontWeight: 900 }}>✓</span> لوحات تحكم متقدمة لمتابعة درجات ونقاط الطالب وربطه بولي أمره.
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  )
}
