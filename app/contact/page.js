import Footer from '../components/Footer'
import { Mail, Phone, MapPin, Sparkles } from 'lucide-react'

export default function ContactPage() {
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
      <div style={{
        position: 'absolute', bottom: '-5%', left: '-5%', width: '400px', height: '400px',
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
            <Sparkles size={16} /> تواصل معنا
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#0f172a', fontWeight: '900', margin: 0 }}>
            نحن هنا <span style={{ color: '#059669' }}>لخدمتكم</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#64748b', marginTop: '16px', maxWidth: '600px', margin: '16px auto 0' }}>
            يسعدنا تواصلكم معنا للرد على استفساراتكم أو تلقي مقترحاتكم. فريق الدعم الفني متواجد دائماً لخدمتكم.
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            <div style={{
              textAlign: 'center', padding: '30px 20px',
              background: 'white', borderRadius: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 20px rgba(0,0,0,0.02)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #059669, #10b981)', width: '60px', height: '60px',
                borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(5, 150, 105, 0.25)'
              }}>
                <Phone color="white" size={28} />
              </div>
              <h3 style={{ marginBottom: '10px', color: '#0f172a', fontWeight: '800' }}>الهاتف (اتصال وواتساب)</h3>
              <a href="tel:+201010407906" style={{ color: '#059669', direction: 'ltr', display: 'inline-block', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>+20 101 040 7906</a>
            </div>

            <div style={{
              textAlign: 'center', padding: '30px 20px',
              background: 'white', borderRadius: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 20px rgba(0,0,0,0.02)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)', width: '60px', height: '60px',
                borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(2, 132, 199, 0.25)'
              }}>
                <Mail color="white" size={28} />
              </div>
              <h3 style={{ marginBottom: '10px', color: '#0f172a', fontWeight: '800' }}>البريد الإلكتروني</h3>
              <p style={{ color: '#475569', fontSize: '1.1rem', fontWeight: '600' }}>contact@alwateen.com</p>
            </div>

            <div style={{
              textAlign: 'center', padding: '30px 20px',
              background: 'white', borderRadius: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 20px rgba(0,0,0,0.02)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', width: '60px', height: '60px',
                borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(139, 92, 246, 0.25)'
              }}>
                <MapPin color="white" size={28} />
              </div>
              <h3 style={{ marginBottom: '10px', color: '#0f172a', fontWeight: '800' }}>العنوان</h3>
              <p style={{ color: '#475569', fontSize: '1.1rem', fontWeight: '600' }}>المنوفية - أشمون</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
