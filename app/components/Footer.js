'use client'
import Link from 'next/link'
import { Mail, Phone, MapPin, Sparkles, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      color: '#1e293b',
      padding: '70px 6% 30px',
      fontFamily: 'Tajawal, sans-serif',
      borderTop: '1px solid rgba(255, 255, 255, 0.6)',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '40px',
        borderBottom: '1px solid rgba(26, 46, 134, 0.1)',
        paddingBottom: '45px'
      }}>
        
        {/* About Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2A52C7 0%, #1A2E86 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>و</div>
            <h3 style={{ fontSize: '1.4rem', color: '#1A2E86', margin: 0, fontWeight: 900 }}>منصة الوتين</h3>
          </div>
          <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '0.92rem' }}>
            المنظومة التعليمية التفاعلية المتكاملة. نقدم تعليماً ممتعاً باللعب، فصولاً افتراضية، وأحدث أدوات إدارة الفصول لمساعدة الطالب والمعلم.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '18px', color: '#1e293b', fontWeight: 800 }}>روابط سريعة</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link href="/" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}>الرئيسية</Link></li>
            <li><Link href="/kids-corner" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}>عالم الأطفال 🎈</Link></li>
            <li><Link href="/teacher-assistant" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}>أدوات المعلم 👨‍🏫</Link></li>
            <li><Link href="/pricing" style={{ color: '#1A2E86', fontWeight: 'bold', textDecoration: 'none' }}>الباقات والأسعار 🏷️</Link></li>
            <li><Link href="/register" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}>إنشاء حساب جديد</Link></li>
          </ul>
        </div>

        {/* Legal Policies */}
        <div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '18px', color: '#1e293b', fontWeight: 800 }}>السياسات والشروط</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link href="/privacy" style={{ color: '#475569', textDecoration: 'none' }}>سياسة الخصوصية</Link></li>
            <li><Link href="/terms" style={{ color: '#475569', textDecoration: 'none' }}>الشروط والأحكام</Link></li>
            <li><Link href="/refund" style={{ color: '#475569', textDecoration: 'none' }}>سياسة الاسترجاع (Refund)</Link></li>
            <li><Link href="/shipping" style={{ color: '#475569', textDecoration: 'none' }}>سياسة التسليم (Delivery)</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '18px', color: '#1e293b', fontWeight: 800 }}>تواصل معنا</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.9rem' }}>
              <MapPin size={18} color="#1A2E86" /> مصر - المنوفية - أشمون
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.9rem' }}>
              <Phone size={18} color="#1A2E86" /> 
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>اتصال وواتساب:</span>
                <a href="tel:+201010407906" style={{ color: '#1A2E86', textDecoration: 'none', fontWeight: 'bold' }} dir="ltr">+20 101 040 7906</a>
              </div>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.9rem' }}>
              <Mail size={18} color="#1A2E86" /> contact@alwateen.com
            </li>
          </ul>
        </div>

      </div>

      {/* Copyright */}
      <div style={{ 
        textAlign: 'center', 
        paddingTop: '25px', 
        color: '#64748b', 
        fontSize: '0.88rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontWeight: '500'
      }}>
        <p>© {new Date().getFullYear()} منصة الوتين التعليمية. صُممت بحب وإتقان لخدمة التعليم العربي.</p>
      </div>
    </footer>
  )
}
