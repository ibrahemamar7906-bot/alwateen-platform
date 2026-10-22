'use client'

import React from 'react'
import { X, MousePointer2, Hand, Pen, Eraser, Highlighter, Crosshair, Sparkles, Type, Square, Image as ImageIcon, Video, StickyNote, Plus, Download, HelpCircle, Unlock, Mic } from 'lucide-react'

export default function TeacherGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const SectionTitle = ({ title }) => (
    <h3 style={{
      color: '#0ea5e9',
      borderBottom: '2px solid #e0f2fe',
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
      <div style={{ color: '#64748b', background: '#fff', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 'bold', color: '#334155', marginBottom: '2px' }}>{name}</div>
        <div style={{ color: '#64748b', fontSize: '13.5px', lineHeight: 1.5 }}>{desc}</div>
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
      direction: 'rtl',
      fontFamily: 'Tajawal, sans-serif'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '850px',
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
          <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem' }}>
            <HelpCircle style={{ color: '#0ea5e9' }} />
            <span>دليل المعلم لاستخدام السبورة الذكية</span>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          
          {/* Section 1 */}
          <div>
            <SectionTitle title="أدوات الرسم والتفاعل (الشريط الجانبي)" />
            <ToolRow icon={<MousePointer2 size={18} />} name="أداة التحديد" desc="لتحديد أي عنصر على السبورة (نص، رسم، شكل) والتحكم في حجمه أو تدويره أو حذفه." />
            <ToolRow icon={<Hand size={18} />} name="أداة التحريك (Pan)" desc="للتحرك بحرية داخل مساحة السبورة وسحب الشاشة في أي اتجاه." />
            <ToolRow icon={<Pen size={18} />} name="القلم العادي" desc="للكتابة والرسم اليدوي العادي. يمكنك اختيار اللون وسُمك الخط من شريط الخصائص." />
            <ToolRow icon={<Highlighter size={18} />} name="قلم التمييز" desc="قلم نصف شفاف لتمييز الكلمات والعبارات المهمة على السبورة." />
            <ToolRow icon={<Crosshair size={18} />} name="مؤشر الليزر" desc="مؤشر يختفي تلقائياً بعد ثوانٍ للفت انتباه الطلاب أثناء الشرح." />
            <ToolRow icon={<Sparkles size={18} />} name="القلم السحري (Magic)" desc="يرسم أشكالاً عادية ويحولها تلقائياً إلى أشكال هندسية دقيقة." />
            <ToolRow icon={<Eraser size={18} />} name="الممحاة" desc="لمسح الرسومات والخطوط بمجرد الضغط عليها وسحبها." />
          </div>

          {/* Section 2 */}
          <div>
            <SectionTitle title="أدوات الإدراج (الشريط السفلي)" />
            <ToolRow icon={<Type size={18} />} name="إضافة نص" desc="لإدراج نصوص وكتابة فقرات قابلة للتنسيق وتغيير الحجم واللون." />
            <ToolRow icon={<Mic size={18} />} name="الكتابة بالصوت" desc="تحدث في الميكروفون ليتم تحويل صوتك إلى نص مكتوب على السبورة فوراً." />
            <ToolRow icon={<StickyNote size={18} />} name="الملاحظات اللاصقة" desc="لإضافة قصاصات ملاحظات ملونة بألوان مختلفة لكتابة التعليمات والتنبيهات." />
            <ToolRow icon={<Square size={18} />} name="الأشكال الهندسية" desc="إدراج أشكال متنوعة (مربع، دائرة، مثلث، خط، سهم) مع إمكانية تلوينها." />
            <ToolRow icon={<ImageIcon size={18} />} name="إدراج صورة" desc="رفع صورة من جهازك إلى السبورة للشرح عليها أو توضيح مسألة." />
            <ToolRow icon={<Video size={18} />} name="إدراج فيديو" desc="إدراج فيديو للشرح مع أزرار تشغيل وإيقاف وكتم الصوت." />
            
            <div style={{ marginTop: '20px' }} />
            
            <SectionTitle title="إدارة الصفحات والتصدير" />
            <ToolRow icon={<Plus size={18} />} name="إضافة صفحة" desc="إنشاء صفحة جديدة خالية لمتابعة الدرس دون مسح ما تم كتابته." />
            <ToolRow icon={<Unlock size={18} />} name="قفل العناصر" desc="تثبيت عنصر مكانه حتى لا يتحرك بالخطأ أثناء الكتابة فوقه." />
            <ToolRow icon={<Download size={18} />} name="تصدير وحفظ" desc="حفظ السبورة كصورة أو ملف PDF لمشاركتها مع الطلاب بعد الحصة." />
          </div>

        </div>
        
        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={onClose}
            style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
          >
            فهمت ذلك، شكراً
          </button>
        </div>
      </div>
    </div>
  )
}
