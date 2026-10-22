'use client'

import React, { useRef } from 'react'
import { Award, Printer, Share2, X, Star, Crown, CheckCircle2 } from 'lucide-react'

export default function CertificateModal({
  isOpen,
  onClose,
  studentName = 'بطل المنصة المتميز',
  subjectTitle = 'تأسيس اللغة العربية',
  scoreOrXp = 250,
  badgeName = 'فارس القراءة والتأسيس',
  date = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
}) {
  const certRef = useRef(null)

  if (!isOpen) return null

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const handleShareWhatsApp = () => {
    const text = `🎉 مبارك للبطل (${studentName})! حصل على شهادة التفوق في (${subjectTitle}) مع وسام (${badgeName}) ونقاط خبرة ${scoreOrXp} XP من منصة المستر إبراهيم عمار! 🌟🚀`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(12px, 3vw, 24px)',
      zIndex: 9999,
      animation: 'fadeIn 0.3s ease',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '680px',
        width: '100%',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
        position: 'relative',
        overflow: 'hidden',
        border: '3px solid #facc15',
        margin: 'auto'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            background: 'rgba(0, 0, 0, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'background 0.2s ease'
          }}
          aria-label="إغلاق"
        >
          <X size={20} color="#475569" />
        </button>

        {/* PRINTABLE CERTIFICATE AREA */}
        <div id="printable-certificate" ref={certRef} style={{
          padding: 'clamp(20px, 4vw, 36px)',
          background: 'radial-gradient(circle at 50% 30%, #fffdf0 0%, #ffffff 80%)',
          textAlign: 'center',
          position: 'relative',
          border: '2px dashed rgba(202, 138, 4, 0.35)',
          margin: 'clamp(10px, 2.5vw, 16px)',
          borderRadius: '18px',
          boxSizing: 'border-box'
        }}>
          {/* Header Seal & Stars */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <Star size={18} fill="#f59e0b" color="#f59e0b" />
            <Star size={24} fill="#eab308" color="#eab308" />
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(245, 158, 11, 0.4)',
              fontSize: '1.8rem'
            }}>
              👑
            </div>
            <Star size={24} fill="#eab308" color="#eab308" />
            <Star size={18} fill="#f59e0b" color="#f59e0b" />
          </div>

          <div style={{
            fontSize: 'clamp(0.85rem, 2.2vw, 1rem)',
            color: '#854d0e',
            fontWeight: 800,
            letterSpacing: '1px',
            marginBottom: '4px'
          }}>
            منصة المستر إبراهيم عمار للتعليم الذكي 🌟
          </div>

          <h1 style={{
            fontSize: 'clamp(1.5rem, 4.5vw, 2.2rem)',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 12px 0'
          }}>
            شَهَادَةُ تَمَيُّزٍ وَإِتْقَانٍ
          </h1>

          <p style={{ color: '#475569', fontSize: 'clamp(0.88rem, 2.2vw, 1rem)', margin: '0 0 10px 0', fontWeight: 600 }}>
            تَشْهَدُ إِدَارَةُ الْمَنَصَّةِ بِأَنَّ الْبَطَلَ الْمُتَمَيِّزَ:
          </p>

          {/* Student Name */}
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #fefce8, #fef08a)',
            border: '2px solid #eab308',
            borderRadius: '16px',
            padding: 'clamp(8px, 2vw, 14px) clamp(20px, 4vw, 36px)',
            fontSize: 'clamp(1.3rem, 4vw, 1.9rem)',
            fontWeight: 900,
            color: '#713f12',
            margin: '0 0 14px 0',
            boxShadow: '0 4px 14px rgba(234, 179, 8, 0.25)'
          }}>
            {studentName} 🎖️
          </div>

          <p style={{
            color: '#334155',
            fontSize: 'clamp(0.85rem, 2.2vw, 0.98rem)',
            lineHeight: 1.6,
            maxWidth: '520px',
            margin: '0 auto 16px auto',
            fontWeight: 600
          }}>
            قَدْ أَتَمَّ بِنَجَاحٍ وَاجْتِهَادٍ مَحَطَّاتِ «<strong style={{ color: '#059669' }}>{subjectTitle}</strong>» 
            وَحَصَلَ عَلَى <strong style={{ color: '#d97706' }}>{scoreOrXp} نقطة خبرة (XP)</strong> 
            مَعَ اسْتِحْقَاقِهِ لِوَسَامِ «<strong style={{ color: '#059669' }}>{badgeName}</strong>».
          </p>

          {/* Badges Grid */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            margin: '0 0 20px 0'
          }}>
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '12px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              color: '#166534',
              fontWeight: 800
            }}>
              <CheckCircle2 size={16} color="#16a34a" />
              <span>إتقان المهارات ١٠٠٪</span>
            </div>
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fde047',
              borderRadius: '12px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              color: '#854d0e',
              fontWeight: 800
            }}>
              <Crown size={16} color="#ca8a04" />
              <span>فارس المسار الصغير</span>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '14px',
            borderTop: '1.5px dashed rgba(202, 138, 4, 0.3)',
            marginTop: '10px'
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>تاريخ المنح:</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b' }}>{date}</div>
            </div>

            {/* Official Stamp */}
            <div style={{
              border: '2px solid #ca8a04',
              borderRadius: '50%',
              width: '64px',
              height: '64px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ca8a04',
              fontSize: '0.62rem',
              fontWeight: 900,
              transform: 'rotate(-8deg)',
              background: '#fffdf0'
            }}>
              <Award size={22} color="#ca8a04" />
              <span>معتمد رسمي</span>
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>المشرف العام:</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#064e3b' }}>المستر إبراهيم عمار</div>
            </div>
          </div>
        </div>

        {/* MODAL ACTION BUTTONS */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '16px clamp(16px, 4vw, 28px)',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
              transition: 'transform 0.15s ease'
            }}
          >
            <Printer size={18} />
            <span>طباعة الشهادة 🖨️</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.25)',
              transition: 'transform 0.15s ease'
            }}
          >
            <Share2 size={18} />
            <span>مشاركة الإنجاز على واتساب 📲</span>
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: auto;
            margin: 0;
            padding: 40px;
            border: 4px solid #ca8a04;
          }
        }
      `}</style>
    </div>
  )
}
