import React, { useState } from 'react';
import { X, Check, LineChart } from 'lucide-react';

const PRESETS = [
  { label: 'f(x) = x', eq: 'x', title: 'دالة خطية' },
  { label: 'f(x) = x²', eq: 'x^2', title: 'دالة تربيعية' },
  { label: 'f(x) = sin(x)', eq: 'sin(x)', title: 'دالة جيبية' },
  { label: 'f(x) = cos(x)', eq: 'cos(x)', title: 'دالة جيب التمام' },
  { label: 'f(x) = 2ˣ', eq: '2^x', title: 'دالة أسية' },
  { label: 'f(x) = 1/x', eq: '1/x', title: 'دالة كسرية' }
];

const preprocessEquation = (rawEq) => {
  if (!rawEq) return '';
  let eq = rawEq.trim().toLowerCase();
  
  // Implicit multiplication: 2x, 5x, 3(x) -> 2*x, 5*x, 3*(x)
  eq = eq.replace(/(\d+)\s*([a-z\(])/g, '$1 * $2');
  eq = eq.replace(/\)\s*(\d+|[a-z])/g, ') * $1');
  
  // Math functions
  eq = eq.replace(/\b(sin|cos|tan|asin|acos|atan|sqrt|cbrt|abs|log|exp|floor|ceil|round)\s*\(/g, 'Math.$1(');
  
  // Math constants
  eq = eq.replace(/\b(pi)\b/g, 'Math.PI');
  eq = eq.replace(/\b(e)\b/g, 'Math.E');
  
  // Exponentiation ^ to **
  eq = eq.replace(/\^/g, '**');
  
  return eq;
};

export default function SmartGraphModal({ isActive, onClose, canvas, color, onSaveHistory }) {
  const [equation, setEquation] = useState('x^2');

  if (!isActive) return null;

  const handleAddGraph = () => {
    if (!canvas || !equation.trim()) return;

    try {
      const safeEq = preprocessEquation(equation);
      // Validate function with sample values
      const func = new Function('x', `return (${safeEq});`);
      
      const width = canvas ? Math.min(320, Math.max(240, Math.floor(canvas.width * 0.75))) : 300;
      const height = width;
      const scale = width / 14; // 1 unit = scale px
      const centerX = width / 2;
      const centerY = height / 2;

      let pathStr = '';
      let isDrawing = false;

      for (let px = 0; px <= width; px += 2) {
        const x = (px - centerX) / scale;
        let y;
        try {
          y = func(x);
        } catch (e) {
          continue;
        }

        // Prevent infinite or NaN or out of bounds
        if (isNaN(y) || !isFinite(y) || Math.abs(y) > 100) {
          isDrawing = false;
          continue;
        }

        const py = centerY - (y * scale);
        
        // Clamp to plotting viewport
        if (py < -50 || py > height + 50) {
          isDrawing = false;
          continue;
        }

        if (!isDrawing || pathStr === '') {
          pathStr += `M ${px} ${py} `;
          isDrawing = true;
        } else {
          pathStr += `L ${px} ${py} `;
        }
      }

      if (!pathStr.trim()) {
        throw new Error('لا يمكن رسم هذه الدالة في نطاق العرض الحالي.');
      }

      // Draw Grid & Axes
      const bgRect = new window.fabric.Rect({
        left: 0, top: 0, width, height, fill: '#f8fafc',
        stroke: '#e2e8f0', strokeWidth: 1.5, rx: 12, ry: 12, selectable: false
      });

      const xAxis = new window.fabric.Line([10, centerY, width - 10, centerY], {
        stroke: '#94a3b8', strokeWidth: 1.5, selectable: false
      });
      const yAxis = new window.fabric.Line([centerX, 10, centerX, height - 10], {
        stroke: '#94a3b8', strokeWidth: 1.5, selectable: false
      });

      // Axis labels
      const xLabel = new window.fabric.Text('X', {
        left: width - 20, top: centerY + 6, fontSize: 13, fill: '#64748b',
        fontFamily: 'Tajawal', fontWeight: 'bold', selectable: false
      });
      const yLabel = new window.fabric.Text('Y', {
        left: centerX + 6, top: 8, fontSize: 13, fill: '#64748b',
        fontFamily: 'Tajawal', fontWeight: 'bold', selectable: false
      });

      const graphColor = color && color !== '#000000' && color !== '#ffffff' ? color : '#2563eb';
      const path = new window.fabric.Path(pathStr, {
        fill: '',
        stroke: graphColor,
        strokeWidth: 3,
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        objectCaching: false
      });

      const group = new window.fabric.Group([bgRect, xAxis, yAxis, xLabel, yLabel, path], {
        left: canvas.width / 2,
        top: canvas.height / 2,
        originX: 'center',
        originY: 'center',
        cornerColor: '#3b82f6',
        cornerStrokeColor: '#ffffff',
        transparentCorners: false
      });

      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
      if (onSaveHistory) onSaveHistory();
      onClose();
    } catch (err) {
      alert('معادلة غير صالحة: ' + (err.message || 'يرجى التأكد من الصيغة، مثل x^2 أو sin(x) أو 2x+1'));
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 100000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)', fontFamily: 'Tajawal, sans-serif', direction: 'rtl', padding: '16px'
    }}>
      <div style={{
        background: '#fff', padding: '22px 24px', borderRadius: '18px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', width: '100%', maxWidth: '390px',
        display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LineChart size={22} color="#3b82f6" />
            <span>رسم دالة بيانية ذكية</span>
          </h3>
          <button 
            onClick={onClose} 
            style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18}/>
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13.5px', color: '#475569', fontWeight: 'bold' }}>
            معادلة الدالة f(x) :
          </label>
          <input 
            type="text" 
            placeholder="مثال: x^2 أو sin(x) أو 2x+1" 
            value={equation} 
            onChange={e => setEquation(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleAddGraph()}
            style={{ 
              padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', 
              outline: 'none', direction: 'ltr', fontSize: '16px', fontWeight: 'bold', color: '#1e293b' 
            }} 
          />
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            استخدم x كمتغير. يمكنك كتابة sin(x), cos(x), x^2, 2x بدون علامة ضرب.
          </span>
        </div>

        {/* Quick Presets */}
        <div>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>
            نماذج سريعة جاهزة:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {PRESETS.map((p) => (
              <button
                key={p.eq}
                type="button"
                onClick={() => setEquation(p.eq)}
                title={p.title}
                style={{
                  padding: '7px 4px', borderRadius: '8px',
                  border: equation === p.eq ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                  background: equation === p.eq ? '#eff6ff' : '#f8fafc',
                  color: equation === p.eq ? '#2563eb' : '#475569',
                  fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', direction: 'ltr',
                  transition: 'all 0.15s'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleAddGraph} 
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', 
            padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', 
            fontWeight: 'bold', fontSize: '15px', display: 'flex', justifyContent: 'center', 
            alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
            marginTop: '4px'
          }}
        >
          <Check size={18} />
          <span>إدراج الرسم البياني على السبورة</span>
        </button>
      </div>
    </div>
  );
}
