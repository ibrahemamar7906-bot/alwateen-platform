import React from 'react';
import { Microscope, X, ExternalLink } from 'lucide-react';

const SCIENCE_MODELS = [
  { id: 'solar', name: 'المجموعة الشمسية 3D', url: 'https://eyes.nasa.gov/apps/solar-system/#/home?rel=0', icon: '🌍', desc: 'محاكاة ثلاثية الأبعاد للكواكب والمجموعة الشمسية.' },
  { id: 'earth', name: 'كوكب الأرض والمناخ 3D', url: 'https://eyes.nasa.gov/apps/earth/#/', icon: '🌎', desc: 'عرض مباشر للأرض والطقس والبيانات.' },
  { id: 'projectile', name: 'حركة المقذوفات', url: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_ar.html', icon: '☄️', desc: 'تجارب تفاعلية في الفيزياء.' },
  { id: 'forces', name: 'القوى والحركة', url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_ar.html', icon: '🧲', desc: 'قوانين نيوتن والقوة والاحتكاك.' },
  { id: 'circuit', name: 'بناء دائرة كهربائية', url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_ar.html', icon: '💡', desc: 'توصيل البطاريات والأسلاك والمصابيح.' },
  { id: 'molecule', name: 'بناء الجزيئات', url: 'https://phet.colorado.edu/sims/html/build-a-molecule/latest/build-a-molecule_ar.html', icon: '🔬', desc: 'كيمياء تفاعلية وبناء الذرات والجزيئات.' },
  { id: 'fractions', name: 'بناء الكسور (رياضيات)', url: 'https://phet.colorado.edu/sims/html/build-a-fraction/latest/build-a-fraction_ar.html', icon: '🍕', desc: 'تعليم تفاعلي للكسور والأرقام.' },
  { id: 'area', name: 'منشئ المساحات', url: 'https://phet.colorado.edu/sims/html/area-builder/latest/area-builder_ar.html', icon: '📐', desc: 'حساب المساحة والمحيط بشكل عملي.' }
];

export default function ScienceLibraryModal({ isActive, onClose, onSelectModel }) {
  if (!isActive) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 100000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal', direction: 'rtl'
    }}>
      <div style={{
        background: '#f8fafc', padding: '0', borderRadius: '20px', width: '90%', maxWidth: '800px',
        maxHeight: '85vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', borderBottom: '1px solid #e2e8f0'
        }}>
          <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Microscope size={28} color="#10b981" /> مكتبة التجارب العلمية (PhET & NASA)
          </h2>
          <button onClick={onClose} style={{
            background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', 
            borderRadius: '50%', padding: '8px', display: 'flex'
          }}><X size={24} /></button>
        </div>

        {/* Grid Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '30px', background: '#f1f5f9' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {SCIENCE_MODELS.map(model => (
              <div 
                key={model.id}
                onClick={() => { onSelectModel(model.url, model.name); onClose(); }}
                style={{
                  background: 'white', borderRadius: '15px', padding: '20px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  border: '2px solid transparent', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#10b981'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '2rem' }}>{model.icon}</span>
                  <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '1.1rem' }}>{model.name}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>{model.desc}</p>
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  <ExternalLink size={14} /> إدراج التجربة للطلاب
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div style={{ background: 'white', padding: '15px 20px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
           <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
             هذه التجارب ستظهر كنافذة تفاعلية (IFrame) داخل السبورة ليتفاعل معها الطلاب مباشرة.
           </span>
        </div>

      </div>
    </div>
  );
}
