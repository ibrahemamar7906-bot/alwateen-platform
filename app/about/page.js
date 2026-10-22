import Footer from '../components/Footer'
import { Sparkles, Target, Star } from 'lucide-react'

export default function AboutPage() {
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
        position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px',
        background: 'rgba(52, 211, 153, 0.15)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '-5%', width: '400px', height: '400px',
        background: 'rgba(14, 165, 233, 0.1)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0
      }} />

      <main style={{ flex: 1, maxWidth: '900px', margin: '0 auto', padding: '80px 20px', width: '100%', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(5, 150, 105, 0.1)', color: '#059669',
            padding: '8px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 'bold',
            marginBottom: '16px', border: '1px solid rgba(5, 150, 105, 0.2)'
          }}>
            <Sparkles size={16} /> تعرف علينا
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#0f172a', fontWeight: '900', margin: 0 }}>
            منصة <span style={{ color: '#059669' }}>الوتين</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#64748b', marginTop: '16px', maxWidth: '600px', margin: '16px auto 0' }}>
            المنصة التعليمية الأولى التي تدمج التكنولوجيا باللعب لتعليم ممتع وتأسيس قوي.
          </p>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          padding: 'clamp(24px, 5vw, 50px)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '16px', color: '#059669' }}><Star size={24} /></div>
            <h2 style={{ color: '#0f172a', margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>منصة الوتين للتعليم التفاعلي</h2>
          </div>
          <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: '1.9', marginBottom: '40px' }}>
            نحن منصة تعليمية متطورة تهدف إلى تغيير مفهوم التعليم التقليدي من خلال دمج التكنولوجيا الحديثة مع أساليب التدريس التفاعلية. نؤمن بأن التعليم يجب أن يكون ممتعاً، ولذلك صممنا بيئة تعليمية تجمع بين اللعب والتعلم (Gamification) لترسيخ المعلومات في ذهن الطالب.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '16px', color: '#059669' }}><Target size={24} /></div>
            <h2 style={{ color: '#0f172a', margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>رؤيتنا</h2>
          </div>
          <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: '1.9', marginBottom: '40px' }}>
            أن نصبح المنصة الرائدة في الشرق الأوسط في تقديم محتوى تعليمي ذكي، ينمي مهارات التفكير لدى الأطفال ويمنح المعلمين أدوات احترافية لإدارة الفصول الافتراضية بكل سهولة وإبداع.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '16px', color: '#059669' }}><Sparkles size={24} /></div>
            <h2 style={{ color: '#0f172a', margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>ماذا نقدم؟</h2>
          </div>
          <ul style={{ fontSize: '1.1rem', color: '#475569', lineHeight: '2', paddingLeft: 0, listStyle: 'none', margin: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> فصول افتراضية مباشرة (Live Rooms) مع سبورة تفاعلية.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> ألعاب تعليمية مدمجة (ماريو، صب واي، حرب الدبابات) لترسيخ المعلومات.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#059669' }}>✓</span> مسارات تعليمية تفاعلية للمناهج مع تقييم ذكي ومستمر.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#059669' }}>✓</span> لوحات تحكم مخصصة ومتقدمة لكل من المعلم وولي الأمر والطالب.
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  )
}
