'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, GitBranch, X, ChevronDown } from 'lucide-react';
import styles from './page.module.css';

const NODE_COLORS = [
  '#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#ef4444', '#f97316', '#06b6d4', '#475569'
];

const THEMES = [
  { value: 'classic',  label: '🟦 مستطيل' },
  { value: 'circle',   label: '🔵 دائري' },
  { value: 'outline',  label: '⬜ مفرغ' },
  { value: 'minimal',  label: '➖ بسيط' },
  { value: 'gradient', label: '🌈 تدرج' },
  { value: 'shadow',   label: '🌑 ظل' },
  { value: 'neon',     label: '✨ نيون' },
  { value: 'sticky',   label: '📌 ملصق' },
  { value: 'diamond',  label: '💎 ماسي' },
  { value: 'hexagon',  label: '⬡ سداسي' },
  { value: 'wave',     label: '🌊 موجي' },
  { value: 'badge',    label: '🏷️ شارة' },
];

const getTextFill = (theme, color) => {
  if (theme === 'outline' || theme === 'minimal') return color;
  if (theme === 'sticky') return '#713f12';
  if (theme === 'neon') return color;
  return '#ffffff';
};

const MindMapEditPanel = ({ node, canvas, onAddBranch, onAddSibling, onDelete, onSaveHistory, isMobile }) => {
  const [, setTick] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (colorPickerContainerRef.current && !colorPickerContainerRef.current.contains(e.target)) {
        setShowColorPicker(false);
      }
    };
    if (showColorPicker) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [showColorPicker]);

  if (!node || !canvas) return null;

  const isMobileScreen = isMobile || (typeof window !== 'undefined' && window.innerWidth <= 768);

  const changeColor = (color) => {
    node.set({ nodeColor: color, fill: getTextFill(node.theme, color) });
    canvas.requestRenderAll();
    setTick(t => t + 1);
    if (onSaveHistory) onSaveHistory();
  };

  const changeTheme = (theme) => {
    node.set({ theme, fill: getTextFill(theme, node.nodeColor) });
    canvas.requestRenderAll();
    setTick(t => t + 1);
    if (onSaveHistory) onSaveHistory();
  };

  const changeFontSize = (delta) => {
    const currentSize = node.fontSize || 18;
    const newSize = Math.max(10, Math.min(44, currentSize + delta));
    node.set('fontSize', newSize);
    canvas.requestRenderAll();
    setTick(t => t + 1);
    if (onSaveHistory) onSaveHistory();
  };

  const currentColor = node.nodeColor || '#3b82f6';
  const currentTheme = node.theme || 'classic';
  const currentFontSize = node.fontSize || 18;

  return (
    <div
      data-toolbar="true"
      className={styles.floatingMindMapToolbar}
      style={{
        position: 'absolute',
        top: isMobileScreen ? '48px' : '72px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        padding: isMobileScreen ? '3px 6px' : '5px 10px',
        borderRadius: isMobileScreen ? '18px' : '24px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        gap: isMobileScreen ? '4px' : '6px',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        border: '1px solid rgba(203, 213, 225, 0.9)',
        width: 'max-content',
        maxWidth: isMobileScreen ? 'calc(100vw - 12px)' : 'min(94vw, 440px)',
        boxSizing: 'border-box',
        direction: 'rtl',
        overflowX: isMobileScreen ? 'auto' : 'visible',
        scrollbarWidth: 'none'
      }}
    >
      {/* Node Mini Icon */}
      <span style={{ fontSize: isMobileScreen ? '12px' : '14px', flexShrink: 0, cursor: 'default' }} title="تعديل العقدة">
        🗺️
      </span>

      {/* Shape / Theme Dropdown */}
      <select
        value={currentTheme}
        onChange={(e) => changeTheme(e.target.value)}
        style={{
          padding: isMobileScreen ? '2px 4px' : '3px 6px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          background: '#f8fafc',
          fontSize: isMobileScreen ? '10.5px' : '11.5px',
          fontWeight: 'bold',
          color: '#1e293b',
          cursor: 'pointer',
          outline: 'none',
          maxWidth: isMobileScreen ? '85px' : '100px',
          flexShrink: 0
        }}
        title="شكل العقدة"
      >
        {THEMES.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      {/* Color Trigger Popover */}
      <div ref={colorPickerContainerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setShowColorPicker(prev => !prev)}
          title="تغيير لون العقدة"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: isMobileScreen ? '2px 4px' : '3px 6px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: '#f8fafc',
            cursor: 'pointer'
          }}
        >
          <span
            style={{
              width: isMobileScreen ? '14px' : '16px',
              height: isMobileScreen ? '14px' : '16px',
              borderRadius: '50%',
              background: currentColor,
              border: '1.5px solid #ffffff',
              boxShadow: '0 0 0 1px #94a3b8',
              display: 'inline-block'
            }}
          />
          <ChevronDown size={11} color="#64748b" />
        </button>

        {/* Color Palette Popover */}
        {showColorPicker && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(16px)',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
              zIndex: 10050,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              width: '150px'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
              {NODE_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    changeColor(c);
                    setShowColorPicker(false);
                  }}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: c,
                    border: currentColor.toLowerCase() === c.toLowerCase() ? '2px solid #0f172a' : '1.5px solid #ffffff',
                    boxShadow: currentColor.toLowerCase() === c.toLowerCase() ? '0 0 0 1.5px #3b82f6' : '0 1px 2px rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  title={c}
                />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
              <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 'bold' }}>مخصص:</span>
              <input
                type="color"
                value={currentColor.startsWith('#') ? currentColor : '#3b82f6'}
                onChange={(e) => changeColor(e.target.value)}
                style={{ width: '22px', height: '22px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
              />
            </div>
          </div>
        )}
      </div>

      <div style={{ width: '1px', height: '16px', background: '#cbd5e1', flexShrink: 0 }} />

      {/* Font Size A- / A+ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => changeFontSize(-2)}
          style={{
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '5px',
            padding: isMobileScreen ? '2px 4px' : '2px 5px',
            cursor: 'pointer',
            fontSize: isMobileScreen ? '10px' : '11px',
            fontWeight: 'bold',
            color: '#334155',
            lineHeight: 1
          }}
          title="تصغير الخط"
        >
          A-
        </button>
        <span style={{ fontSize: isMobileScreen ? '9.5px' : '10.5px', fontWeight: 'bold', minWidth: '16px', textAlign: 'center', color: '#64748b' }}>
          {currentFontSize}
        </span>
        <button
          type="button"
          onClick={() => changeFontSize(2)}
          style={{
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '5px',
            padding: isMobileScreen ? '2px 4px' : '2px 5px',
            cursor: 'pointer',
            fontSize: isMobileScreen ? '10px' : '11px',
            fontWeight: 'bold',
            color: '#334155',
            lineHeight: 1
          }}
          title="تكبير الخط"
        >
          A+
        </button>
      </div>

      <div style={{ width: '1px', height: '16px', background: '#cbd5e1', flexShrink: 0 }} />

      {/* Add Branch Button */}
      <button
        type="button"
        onClick={onAddBranch}
        title="إضافة فرع جديد"
        style={{
          padding: isMobileScreen ? '3px 6px' : '4px 9px',
          background: '#eff6ff',
          color: '#1d4ed8',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: isMobileScreen ? '10.5px' : '11.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}
      >
        <Plus size={isMobileScreen ? 11 : 13} /> فرع
      </button>

      {/* Add Sibling Button */}
      {onAddSibling && (
        <button
          type="button"
          onClick={onAddSibling}
          title="إضافة فكرة موازية"
          style={{
            padding: isMobileScreen ? '3px 6px' : '4px 9px',
            background: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: isMobileScreen ? '10.5px' : '11.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <GitBranch size={isMobileScreen ? 11 : 13} /> موازية
        </button>
      )}

      {/* Delete Button */}
      <button
        type="button"
        onClick={onDelete}
        title="حذف الفكرة"
        style={{
          padding: isMobileScreen ? '3px 5px' : '4px 6px',
          background: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Trash2 size={isMobileScreen ? 12 : 14} />
      </button>

      {/* Close Button */}
      <button
        type="button"
        onClick={() => {
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        }}
        title="إنهاء التحديد"
        style={{
          padding: isMobileScreen ? '3px 5px' : '4px 6px',
          background: '#f1f5f9',
          color: '#64748b',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <X size={isMobileScreen ? 12 : 14} />
      </button>
    </div>
  );
};

export default MindMapEditPanel;