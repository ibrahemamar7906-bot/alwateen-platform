import React, { useState } from 'react';
import { Palette, X, Crown, Sparkles, Image as ImageIcon, BookOpen } from 'lucide-react';

const BACKGROUNDS = {
  kids: [
    { id: 'kids_1', name: 'طبيعة كرتونية', url: 'https://images.unsplash.com/photo-1549468057-5b6fb891961f?q=80&w=2070&auto=format&fit=crop' },
    { id: 'kids_2', name: 'ألعاب وأطفال', url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=2070&auto=format&fit=crop' },
    { id: 'kids_3', name: 'غابة الألوان', url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop' },
    { id: 'kids_4', name: 'عالم الفضاء', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop' },
    { id: 'kids_5', name: 'رحلة بحرية', url: 'https://images.unsplash.com/photo-1582967191147-380d1a497046?q=80&w=1964&auto=format&fit=crop' },
    { id: 'kids_6', name: 'حيوانات الغابة', url: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=2070&auto=format&fit=crop' },
    { id: 'kids_7', name: 'السماء الزرقاء', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop' },
    { id: 'kids_8', name: 'شاطئ البحر', url: 'https://images.unsplash.com/photo-1560415755-bd80d06eda60?q=80&w=2112&auto=format&fit=crop' },
    { id: 'kids_9', name: 'غيوم وردية', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2029&auto=format&fit=crop' },
    { id: 'kids_10', name: 'قلعة سحرية', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop' },
    { id: 'kids_11', name: 'ورق حائط أطفال', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop' },
    { id: 'kids_12', name: 'أشكال هندسية', url: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?q=80&w=2070&auto=format&fit=crop' }
  ],
  edu: [
    { id: 'edu_1', name: 'سبورة طباشير مدرسية', url: 'https://images.unsplash.com/photo-1522204680879-19941a39665a?q=80&w=2070&auto=format&fit=crop' },
    { id: 'edu_2', name: 'مكتبة وكتب', url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2190&auto=format&fit=crop' },
    { id: 'edu_3', name: 'تجارب كيمياء', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop' },
    { id: 'edu_4', name: 'معادلات رياضية', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop' },
    { id: 'edu_5', name: 'خريطة العالم القديمة', url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop' },
    { id: 'edu_6', name: 'كود برمجي ومطور', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop' },
    { id: 'edu_7', name: 'آلات وميكانيكا', url: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?q=80&w=2070&auto=format&fit=crop' },
    { id: 'edu_8', name: 'لوحة ألوان رسم', url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=2000&auto=format&fit=crop' }
  ],
  hd: [
    { id: 'hd_1', name: 'طبيعة بحرية', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop' },
    { id: 'hd_2', name: 'طبيعة خضراء', url: 'https://images.unsplash.com/photo-1616628188506-4a982928509c?q=80&w=1935&auto=format&fit=crop' },
    { id: 'hd_3', name: 'جبال ونجوم', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop' },
    { id: 'hd_4', name: 'لوحة هندسية', url: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?q=80&w=1974&auto=format&fit=crop' },
    { id: 'hd_5', name: 'مجرة وكواكب', url: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a85?q=80&w=2070&auto=format&fit=crop' },
    { id: 'hd_6', name: 'ألوان مائية', url: 'https://images.unsplash.com/photo-1603513492128-ba7bc9b3e143?q=80&w=2070&auto=format&fit=crop' },
    { id: 'hd_7', name: 'زهور الربيع', url: 'https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?q=80&w=2072&auto=format&fit=crop' },
    { id: 'hd_8', name: 'الأرض من الفضاء', url: 'https://images.unsplash.com/photo-1516981879613-9f5da904015f?q=80&w=1974&auto=format&fit=crop' },
    { id: 'hd_9', name: 'خلفية خشبية', url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop' },
    { id: 'hd_10', name: 'تجريد ثلاثي الأبعاد', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop' },
    { id: 'hd_11', name: 'موج البحر', url: 'https://images.unsplash.com/photo-1510172951991-856a654063f9?q=80&w=1974&auto=format&fit=crop' },
    { id: 'hd_12', name: 'طريق في الغابة', url: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?q=80&w=2070&auto=format&fit=crop' }
  ]
};

export default function BackgroundsLibraryModal({ isActive, isOpen, onClose, onSelectBackground, isPremium, setShowPremiumAlert }) {
  if (!isActive && typeof isActive !== "undefined" && typeof isOpen !== "undefined" && !isOpen) return null;
  if (typeof isActive !== "undefined" && !isActive) return null;
  if (typeof isOpen !== "undefined" && !isOpen) return null;

  const [activeTab, setActiveTab] = useState('edu'); // 'kids', 'edu', 'hd'

  const handleSelect = (url) => {
    if (!isPremium) {
      setShowPremiumAlert(true);
      return;
    }
    onSelectBackground(url);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 100000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal', direction: 'rtl'
    }}>
      <div style={{
        background: '#f8fafc', padding: '0', borderRadius: '20px', width: '90%', maxWidth: '900px',
        maxHeight: '85vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', borderBottom: '1px solid #e2e8f0'
        }}>
          <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Palette size={28} color="#0ea5e9" /> مكتبة الخلفيات التفاعلية
            {!isPremium && <Crown size={20} color="#eab308" title="ميزة مميزة" />}
          </h2>
          <button onClick={onClose} style={{
            background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', 
            borderRadius: '50%', padding: '8px', display: 'flex'
          }}><X size={24} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 20px', overflowX: 'auto' }}>
          <button 
            onClick={() => setActiveTab('edu')}
            style={{
              padding: '15px 30px', background: 'none', border: 'none', borderBottom: activeTab === 'edu' ? '3px solid #0ea5e9' : '3px solid transparent',
              color: activeTab === 'edu' ? '#0ea5e9' : '#64748b', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
            }}
          >
            <BookOpen size={20} /> خلفيات تعليمية
          </button>
          <button 
            onClick={() => setActiveTab('kids')}
            style={{
              padding: '15px 30px', background: 'none', border: 'none', borderBottom: activeTab === 'kids' ? '3px solid #0ea5e9' : '3px solid transparent',
              color: activeTab === 'kids' ? '#0ea5e9' : '#64748b', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
            }}
          >
            <Sparkles size={20} /> خلفيات أطفال
          </button>
          <button 
            onClick={() => setActiveTab('hd')}
            style={{
              padding: '15px 30px', background: 'none', border: 'none', borderBottom: activeTab === 'hd' ? '3px solid #0ea5e9' : '3px solid transparent',
              color: activeTab === 'hd' ? '#0ea5e9' : '#64748b', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
            }}
          >
            <ImageIcon size={20} /> خلفيات HD مميزة
          </button>
        </div>

        {/* Grid Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '30px', background: '#f1f5f9' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {BACKGROUNDS[activeTab].map(bg => (
              <div 
                key={bg.id}
                onClick={() => handleSelect(bg.url)}
                style={{
                  background: 'white', borderRadius: '15px', overflow: 'hidden', cursor: 'pointer',
                  border: '2px solid transparent', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  position: 'relative'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#0ea5e9'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <div style={{ height: '150px', width: '100%', backgroundImage: `url(${bg.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '1.1rem' }}>{bg.name}</span>
                  {!isPremium && <Crown size={18} color="#eab308" />}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div style={{ background: 'white', padding: '15px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
             هذه الخلفيات تظهر لدى جميع الطلاب المتابعين (يتم مزامنة أي تغيير أو رسم فوقها).
           </span>
           <button 
             onClick={() => { onSelectBackground(null); onClose(); }} 
             style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
             العودة للسبورة البيضاء (بدون خلفية)
           </button>
        </div>

      </div>
    </div>
  );
}
