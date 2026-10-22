'use client'

import React from 'react'
import { X, Mic, Video, Users2, ShieldCheck, MonitorPlay, MessageSquare, Hand, Grip, Type, HelpCircle, Gamepad2 } from 'lucide-react'

export default function LiveTeacherGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const SectionTitle = ({ title }) => (
    <h3 style={{
      color: '#8b5cf6',
      borderBottom: '2px solid #ede9fe',
      paddingBottom: '8px',
      marginBottom: '16px',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {title}
    </h3>
  )

  const ToolRow = ({ icon, name, desc }) => (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '12px',
      padding: '8px',
      background: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #f1f5f9'
    }}>
      <div style={{ color: '#64748b', background: '#fff', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: '36px', height: '36px' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 'bold', color: '#334155', marginBottom: '2px' }}>{name}</div>
        <div style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  )

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 99999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      direction: 'rtl'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '950px',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle style={{ color: '#8b5cf6' }} />
            دليل المعلم لإدارة الحصة التفاعلية
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: '#fee2e2',
              color: '#ef4444',
              border: 'none',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          
          {/* Section 1: Bottom Bar */}
          <div>
            <SectionTitle title="الشريط السفلي (الأدوات الأساسية)" />
            <ToolRow icon={<Mic size={18} />} name="المايك والكاميرا" desc="تشغيل أو إيقاف صوتك وصورتك." />
            <ToolRow icon={<div style={{width: 14, height: 14, borderRadius: '50%', border: '2px solid currentColor'}} />} name="تسجيل الحصة" desc="تسجيل الشاشة والصوت وحفظها كملف فيديو على جهازك فور الانتهاء." />
            <ToolRow icon={<Grip size={18} />} name="أدوات التدريس" desc="قائمة تضم: السبورة البيضاء، لوحات التخصص (عربي/إنجليزي)، ومعاينة الأكواد (HTML Sandbox)." />
            <ToolRow icon={<Gamepad2 size={18} />} name="الألعاب التعليمية" desc="تشغيل مسابقات تفاعلية للطلاب مثل ماريو، صب واي، من سيربح، وعجلة الحظ." />
            <ToolRow icon={<Users2 size={18} />} name="الوضع الجماعي" desc="لإظهار كاميرات الطلاب معك على الشاشة (إذا تم تفعيله)." />
            <ToolRow icon={<span style={{ fontWeight: 'bold', fontSize: '12px' }}>CC</span>} name="الكابشن (الترجمة)" desc="تحويل كلامك لصوت مكتوب على شاشات الطلاب للتركيز بشكل أفضل." />
          </div>

          {/* Section 2: Header */}
          <div>
            <SectionTitle title="الشريط العلوي (التحكم والفصل)" />
            <ToolRow icon={<span style={{fontSize: '18px'}}>✨</span>} name="الأسئلة" desc="تجهيز الأسئلة والإجابات مسبقاً لاستخدامها داخل الألعاب (الخيارات الصحيحة والخاطئة)." />
            <ToolRow icon={<ShieldCheck size={18} />} name="وضع التركيز" desc="إخفاء كل شيء من أمام الطالب وإجباره على التركيز في الكاميرا الخاصة بك فقط." />
            <ToolRow icon={<span style={{fontSize: '16px'}}>🔇</span>} name="كتم الكل" desc="لإغلاق مايكات جميع الطلاب بضغطة زر واحدة." />
            <ToolRow icon={<MonitorPlay size={18} />} name="تكبير الشاشة" desc="لعرض منصة اللايف بملء الشاشة لتقليل المشتتات." />
            <ToolRow icon={<span style={{fontSize: '18px'}}>⚙️</span>} name="التخصص" desc="لتحديد تخصصك (عربي، إنجليزي، رياضيات) لإظهار الأدوات الخاصة به فقط." />
          </div>

          {/* Section 3: Sidebar */}
          <div>
            <SectionTitle title="القائمة الجانبية (التفاعل)" />
            <ToolRow icon={<Users2 size={18} />} name="قائمة الحضور" desc="تُظهر الطلاب الحاضرين. يمكنك التحكم في مايك أو كاميرا كل طالب من هنا." />
            <ToolRow icon={<Hand size={18} />} name="رفع اليد" desc="عندما يرفع طالب يده، يظهر رقم بجوار الحضور، وتستطيع فتح المايك له للسؤال." />
            <ToolRow icon={<MessageSquare size={18} />} name="الدردشة" desc="التواصل الكتابي. يمكنك قفل الدردشة بالكامل لمنع التشتت أثناء الشرح." />
            <ToolRow icon={<Type size={18} />} name="الأدوات الحية (لوحة الشرف)" desc="ضمن قائمة الألعاب، يمكنك تكريم الطلاب وإعطائهم نقاط أو شهادات تظهر لهم فوراً." />
          </div>

        </div>
        
        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={onClose}
            style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.target.style.background = '#7c3aed'}
            onMouseOut={(e) => e.target.style.background = '#8b5cf6'}
          >
            حسناً، فهمت
          </button>
        </div>
      </div>
    </div>
  )
}
