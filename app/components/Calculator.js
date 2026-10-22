'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Delete } from 'lucide-react';

export default function Calculator({ onClose, initialPos = { x: 50, y: 50 } }) {
  const [pos, setPos] = useState(initialPos);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  const [display, setDisplay] = useState('0');
  const [previousVal, setPreviousVal] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    });
    try { e.target.setPointerCapture(e.pointerId); } catch(err) {}
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      const maxX = typeof window !== 'undefined' ? window.innerWidth - 80 : 500;
      const maxY = typeof window !== 'undefined' ? window.innerHeight - 80 : 500;
      setPos({
        x: Math.max(5, Math.min(maxX, e.clientX - offset.x)),
        y: Math.max(5, Math.min(maxY, e.clientY - offset.y))
      });
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try { e.target.releasePointerCapture(e.pointerId); } catch(err) {}
  };

  const calculate = (a, b, op) => {
    const num1 = parseFloat(a);
    const num2 = parseFloat(b);
    if (isNaN(num1) || isNaN(num2)) return b;
    switch (op) {
      case '+': return (num1 + num2).toString();
      case '-': return (num1 - num2).toString();
      case '×': return (num1 * num2).toString();
      case '÷': return num2 === 0 ? 'Error' : (num1 / num2).toString();
      case '^': return Math.pow(num1, num2).toString();
      default: return b;
    }
  };

  const handleImmediateOp = useCallback((op) => {
    if (op === 'π') {
      setDisplay(Math.PI.toString());
      setWaitingForNewValue(true);
      return;
    }
    if (op === 'e') {
      setDisplay(Math.E.toString());
      setWaitingForNewValue(true);
      return;
    }

    const num = parseFloat(display);
    if (isNaN(num)) return;
    
    let result = display;
    switch (op) {
      case '√':
        result = num < 0 ? 'Error' : Math.sqrt(num).toString();
        break;
      case 'x²':
        result = Math.pow(num, 2).toString();
        break;
      case 'sin':
        result = Math.sin(num * Math.PI / 180).toFixed(8).replace(/\.?0+$/, ''); // Use degrees
        break;
      case 'cos':
        result = Math.cos(num * Math.PI / 180).toFixed(8).replace(/\.?0+$/, '');
        break;
      case 'tan':
        result = Math.tan(num * Math.PI / 180).toFixed(8).replace(/\.?0+$/, '');
        break;
      case 'log':
        result = num <= 0 ? 'Error' : Math.log10(num).toString();
        break;
      case 'ln':
        result = num <= 0 ? 'Error' : Math.log(num).toString();
        break;
    }
    setDisplay(result);
    setWaitingForNewValue(true);
  }, [display]);

  const handleDigit = useCallback((digit) => {
    if (waitingForNewValue) {
      setDisplay(digit);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  }, [display, waitingForNewValue]);

  const handleOperator = useCallback((op) => {
    if (operation && !waitingForNewValue) {
      const result = calculate(previousVal, display, operation);
      setDisplay(result);
      setPreviousVal(result);
    } else {
      setPreviousVal(display);
    }
    setOperation(op);
    setWaitingForNewValue(true);
  }, [display, operation, previousVal, waitingForNewValue]);

  const handleEqual = useCallback(() => {
    if (operation && previousVal) {
      const result = calculate(previousVal, display, operation);
      setDisplay(result);
      setPreviousVal(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  }, [display, operation, previousVal]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setPreviousVal(null);
    setOperation(null);
    setWaitingForNewValue(false);
  }, []);
  
  const handleDelete = useCallback(() => {
    if (waitingForNewValue) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  }, [display, waitingForNewValue]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (/[0-9.]/.test(key)) {
        handleDigit(key);
      } else if (key === '+' || key === '-') {
        handleOperator(key);
      } else if (key === '*' || key === 'x') {
        handleOperator('×');
      } else if (key === '/') {
        handleOperator('÷');
      } else if (key === '^') {
        handleOperator('^');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEqual();
      } else if (key === 'Backspace') {
        handleDelete();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        handleClear();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleOperator, handleEqual, handleDelete, handleClear]);

  return (
    <div style={{
      position: 'absolute',
      left: pos.x,
      top: pos.y,
      width: '340px',
      background: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: 'Tajawal, sans-serif',
      direction: 'ltr'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        .calc-btn {
          border: none;
          background: #f8fafc;
          color: #334155;
          font-size: 1.15rem;
          font-weight: 700;
          padding: 12px 0;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .calc-btn:hover {
          filter: brightness(0.95);
          transform: translateY(-1px);
        }
        .calc-btn:active {
          filter: brightness(0.9);
          transform: translateY(1px);
        }
        .calc-btn-op {
          background: #eff6ff;
          color: #3b82f6;
        }
        .calc-btn-adv {
          background: #f5f3ff;
          color: #8b5cf6;
          font-size: 1.05rem;
        }
        .calc-btn-danger {
          background: #fef2f2;
          color: #ef4444;
        }
        .calc-btn-warn {
          background: #fffbeb;
          color: #f59e0b;
        }
        .calc-btn-eq {
          background: linear-gradient(135deg, #2A52C7, #1A2E86);
          color: white;
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
        }
        .calc-btn-eq:hover {
          filter: brightness(1.1);
          box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
        }
      `}} />

      {/* Header / Drag Handle */}
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          background: '#0f172a',
          color: '#fff',
          padding: '12px 18px',
          cursor: 'move',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          touchAction: 'none'
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🧮 آلة حاسبة علمية
        </span>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
          <X size={16} />
        </button>
      </div>

      {/* Display Screen */}
      <div style={{
        background: '#f8fafc',
        padding: '24px 20px',
        textAlign: 'right',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          fontSize: '1rem', 
          color: '#94a3b8', 
          minHeight: '24px',
          marginBottom: '4px',
          fontWeight: '600'
        }}>
          {previousVal != null && operation ? `${previousVal} ${operation}` : ''}
        </div>
        <div style={{
          fontSize: '2.2rem',
          fontWeight: '800',
          color: '#0f172a',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          letterSpacing: '-1px'
        }}>
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        padding: '16px',
        background: '#ffffff'
      }}>
        {/* Row 1 */}
        <button onClick={() => handleImmediateOp('sin')} className="calc-btn calc-btn-adv">sin</button>
        <button onClick={() => handleImmediateOp('cos')} className="calc-btn calc-btn-adv">cos</button>
        <button onClick={() => handleImmediateOp('tan')} className="calc-btn calc-btn-adv">tan</button>
        <button onClick={handleClear} className="calc-btn calc-btn-danger">C</button>
        <button onClick={handleDelete} className="calc-btn calc-btn-warn"><Delete size={18} /></button>
        
        {/* Row 2 */}
        <button onClick={() => handleImmediateOp('log')} className="calc-btn calc-btn-adv">log</button>
        <button onClick={() => handleDigit('7')} className="calc-btn">7</button>
        <button onClick={() => handleDigit('8')} className="calc-btn">8</button>
        <button onClick={() => handleDigit('9')} className="calc-btn">9</button>
        <button onClick={() => handleOperator('÷')} className="calc-btn calc-btn-op">÷</button>
        
        {/* Row 3 */}
        <button onClick={() => handleImmediateOp('ln')} className="calc-btn calc-btn-adv">ln</button>
        <button onClick={() => handleDigit('4')} className="calc-btn">4</button>
        <button onClick={() => handleDigit('5')} className="calc-btn">5</button>
        <button onClick={() => handleDigit('6')} className="calc-btn">6</button>
        <button onClick={() => handleOperator('×')} className="calc-btn calc-btn-op">×</button>
        
        {/* Row 4 */}
        <button onClick={() => handleImmediateOp('x²')} className="calc-btn calc-btn-adv">x²</button>
        <button onClick={() => handleDigit('1')} className="calc-btn">1</button>
        <button onClick={() => handleDigit('2')} className="calc-btn">2</button>
        <button onClick={() => handleDigit('3')} className="calc-btn">3</button>
        <button onClick={() => handleOperator('-')} className="calc-btn calc-btn-op">-</button>
        
        {/* Row 5 */}
        <button onClick={() => handleImmediateOp('√')} className="calc-btn calc-btn-adv">√</button>
        <button onClick={() => handleDigit('0')} className="calc-btn">0</button>
        <button onClick={() => handleDigit('.')} className="calc-btn">.</button>
        <button onClick={handleEqual} className="calc-btn calc-btn-eq">=</button>
        <button onClick={() => handleOperator('+')} className="calc-btn calc-btn-op">+</button>
      </div>
    </div>
  );
}
