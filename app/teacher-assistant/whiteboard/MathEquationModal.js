import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function MathEquationModal({ isActive, onClose, canvas, color, onSaveHistory }) {
  const [equation, setEquation] = useState('\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');

  if (!isActive) return null;

  const handleAddEquation = () => {
    if (!canvas || !equation.trim()) return;
    
    // CodeCogs LaTeX to high-res transparent PNG
    const hexMatch = (color || '').match(/[0-9a-fA-F]{6}/);
    const cleanColor = hexMatch ? hexMatch[0] : '1e293b';
    const latexWithColor = `\\color[HTML]{${cleanColor}} ${equation.trim()}`;
    const url = `https://latex.codecogs.com/png.image?\\dpi{300}${encodeURIComponent(latexWithColor)}`;
    
    const fabricObj = window.fabric || (typeof fabric !== 'undefined' ? fabric : null);
    if (fabricObj && fabricObj.Image && fabricObj.Image.fromURL) {
      fabricObj.Image.fromURL(url, (img) => {
        if (!img) return;
        
        const vpCenter = canvas.getVpCenter ? canvas.getVpCenter() : null;
        const left = vpCenter ? vpCenter.x : (canvas.width / 2);
        const top = vpCenter ? vpCenter.y : (canvas.height / 2);
        
        img.set({
          left,
          top,
          originX: 'center',
          originY: 'center',
          scaleX: 0.6,
          scaleY: 0.6,
          selectable: true,
          evented: true,
          hasControls: true
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        if (onSaveHistory) onSaveHistory();
        onClose();
      }, { crossOrigin: 'anonymous' });
    }
  };

  const insertSnippet = (snippet) => {
    setEquation(prev => prev ? `${prev} ${snippet}` : snippet);
  };

  const templates = [
    { label: 'كسر ᵃ/ᵦ', snippet: '\\frac{a}{b}' },
    { label: 'جذر √', snippet: '\\sqrt{x}' },
    { label: 'أس xⁿ', snippet: 'x^{2}' },
    { label: 'تكامل ∫', snippet: '\\int_{a}^{b} f(x) dx' },
    { label: 'سيجما Σ', snippet: '\\sum_{i=1}^{n}' },
    { label: 'باي π', snippet: '\\pi' },
    { label: '±', snippet: '\\pm' },
    { label: '×', snippet: '\\times' },
    { label: '÷', snippet: '\\div' },
    { label: 'sin', snippet: '\\sin(\\theta)' },
    { label: 'cos', snippet: '\\cos(\\theta)' },
    { label: 'tan', snippet: '\\tan(\\theta)' },
    { label: '∞', snippet: '\\infty' },
    { label: '≠', snippet: '\\ne' },
    { label: '≤', snippet: '\\le' },
    { label: '≥', snippet: '\\ge' },
    { label: 'α', snippet: '\\alpha' },
    { label: 'Δ', snippet: '\\Delta' }
  ];

  return (
    <div style={{
      position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: '18px', 
      borderRadius: '16px', boxShadow: '0 12px 30px rgba(0,0,0,0.22)', zIndex: 100,
      display: 'flex', flexDirection: 'column', gap: '12px', direction: 'rtl', width: '360px', maxWidth: '92vw', fontFamily: 'Tajawal',
      border: '1px solid #cbd5e1'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '17px', color: '#1e293b', fontWeight: 'bold' }}>∫ إدراج معادلة ورموز رياضية</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
      </div>

      {/* Quick Math Templates */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', maxHeight: '110px', overflowY: 'auto', padding: '2px' }}>
        {templates.map(t => (
          <button
            key={t.label}
            type="button"
            onClick={() => insertSnippet(t.snippet)}
            style={{
              padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0',
              background: '#f8fafc', color: '#334155', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#e0e7ff'}
            onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
          >
            {t.label}
          </button>
        ))}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>كود LaTeX :</label>
        <textarea 
          rows="3"
          placeholder="اكتب أو اضغط على الرموز أعلاه..." 
          value={equation} 
          onChange={e => setEquation(e.target.value)} 
          style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'none', direction: 'ltr', fontSize: '13px', fontFamily: 'monospace' }} 
        />
      </div>

      {/* Preview */}
      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px dashed #cbd5e1' }}>
        {equation.trim() ? (
          <img 
            src={`https://latex.codecogs.com/png.image?\\dpi{150}${encodeURIComponent(`\\color[HTML]{${(color || '').match(/[0-9a-fA-F]{6}/)?.[0] || '1e293b'}} ${equation.trim()}`)}`} 
            alt="معاينة المعادلة" 
            style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain' }} 
          />
        ) : (
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>اكتب معادلة لمعاينتها...</span>
        )}
      </div>

      <button 
        onClick={handleAddEquation} 
        style={{
          background: '#8b5cf6', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
        }}>
        <Check size={18} /> إضافة للسبورة
      </button>
    </div>
  );
}
