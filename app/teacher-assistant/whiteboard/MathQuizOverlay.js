import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, ArrowRight, Play, Calculator, HelpCircle } from 'lucide-react';
import { speakWhenReady } from '../../../utils/tts';
import { renderCheerOnCanvas } from '../../utils/cheerEffects';

export default function MathQuizOverlay({ isActive, onClose }) {
  if (!isActive) return null;

  const [gameState, setGameState] = useState('menu');
  const [operation, setOperation] = useState('add');
  const [level, setLevel] = useState('easy');
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const [activeTable, setActiveTable] = useState(1);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      setGameState('menu');
      setScore(0);
      setStreak(0);
    }
  }, [isActive]);

  const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const generateQuestion = (opType, difficulty) => {
    let num1, num2, answer, operatorSymbol, opText;
    
    let op = opType;
    if (op === 'mixed') {
      const ops = ['add', 'sub', 'mul', 'div'];
      op = ops[Math.floor(Math.random() * ops.length)];
    }

    if (op === 'add') {
      operatorSymbol = '+';
      opText = 'زائد';
      if (difficulty === 'easy') { num1 = getRandom(1, 10); num2 = getRandom(1, 10); }
      else if (difficulty === 'medium') { num1 = getRandom(10, 50); num2 = getRandom(10, 50); }
      else { num1 = getRandom(50, 500); num2 = getRandom(50, 500); }
      answer = num1 + num2;
    } else if (op === 'sub') {
      operatorSymbol = '-';
      opText = 'ناقص';
      if (difficulty === 'easy') { num1 = getRandom(5, 20); num2 = getRandom(1, num1); }
      else if (difficulty === 'medium') { num1 = getRandom(20, 100); num2 = getRandom(1, num1); }
      else { num1 = getRandom(100, 1000); num2 = getRandom(10, num1); }
      answer = num1 - num2;
    } else if (op === 'mul') {
      operatorSymbol = '×';
      opText = 'في';
      if (difficulty === 'easy') { num1 = getRandom(1, 5); num2 = getRandom(1, 10); }
      else if (difficulty === 'medium') { num1 = getRandom(6, 12); num2 = getRandom(2, 12); }
      else { num1 = getRandom(12, 50); num2 = getRandom(5, 20); }
      answer = num1 * num2;
    } else if (op === 'div') {
      operatorSymbol = '÷';
      opText = 'على';
      let b, ans;
      if (difficulty === 'easy') { b = getRandom(1, 5); ans = getRandom(1, 10); }
      else if (difficulty === 'medium') { b = getRandom(2, 12); ans = getRandom(2, 12); }
      else { b = getRandom(5, 20); ans = getRandom(10, 50); }
      num1 = b * ans;
      num2 = b;
      answer = ans;
    }

    const options = new Set([answer]);
    while (options.size < 4) {
      let wrong = answer + getRandom(-10, 10);
      if (wrong !== answer && wrong >= 0) options.add(wrong);
    }

    return {
      num1, num2, operatorSymbol, opText, answer,
      options: Array.from(options).sort(() => Math.random() - 0.5)
    };
  };

  const startNextQuestion = () => {
    const q = generateQuestion(operation, level);
    setQuestion(q);
    setSelectedAnswer(null);
    setIsAnimating(false);
    if (audioEnabled) {
      speakWhenReady(`كم يساوي ${n1} ${op} ${n2}؟`, 'Arabic Male', { rate: 0.9 });
    }
  };

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setGameState('playing');
    startNextQuestion();
  };

  const handleAnswer = (opt) => {
    if (selectedAnswer !== null || isAnimating) return;
    setSelectedAnswer(opt);
    setIsAnimating(true);

    if (opt === question.answer) {
      setScore(s => s + 10);
      setStreak(s => s + 1);
      if (audioEnabled) {
         speakWhenReady('أحسنت إجابة صحيحة', 'Arabic Male');
      }
      if (canvasRef.current) {
         renderCheerOnCanvas(canvasRef.current, 'confetti_rain');
      }
      setTimeout(startNextQuestion, 2000);
    } else {
      setStreak(0);
      if (audioEnabled) {
         const errorAudio = new Audio('/sounds/error.mp3');
         errorAudio.play().catch(e => console.log('Audio play failed:', e));
         speakWhenReady('إجابة خاطئة الصحيح هو ' + question.answer, 'Arabic Male');
      }
      setTimeout(startNextQuestion, 2500);
    }
  };

  const readTableRow = (num1, num2) => {
    if (audioEnabled) {
      speakWhenReady(`${num1} في ${num2} يساوي ${num1 * num2}`, 'Arabic Male');
    }
  };
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column',
      fontFamily: 'Tajawal, sans-serif'
    }}>
      <div style={{
        padding: '15px 20px', background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{
            background: '#fee2e2', border: 'none', width: '36px', height: '36px',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#ef4444'
          }}>
            <X size={20} />
          </button>
          {gameState !== 'menu' && (
            <button onClick={() => setGameState('menu')} style={{
              background: '#e0e7ff', border: 'none', padding: '0 15px',
              borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px',
              cursor: 'pointer', color: '#4338ca', fontWeight: 'bold'
            }}>
              <ArrowRight size={18} /> العودة
            </button>
          )}
        </div>
        
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem', fontWeight: '900' }}>📐 مختبر الرياضيات</h2>
        
        <button onClick={() => setAudioEnabled(!audioEnabled)} style={{
          background: audioEnabled ? '#dcfce7' : '#fee2e2', border: 'none', width: '36px', height: '36px',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: audioEnabled ? '#16a34a' : '#ef4444'
        }}>
          {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100, width: '100%', height: '100%' }} />

        {gameState === 'menu' && (
          <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.8rem', color: '#334155', fontWeight: '900', marginBottom: '10px' }}>اختر اللعبة</h3>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>اختبارات لا نهائية بمستويات ذكية وجداول الضرب الكاملة</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', direction: 'rtl' }}>
              <button onClick={() => setGameState('table')} style={{
                background: '#fff', border: '2px solid #3b82f6', borderRadius: '15px', padding: '20px',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
                boxShadow: '0 4px 6px rgba(59,130,246,0.1)', transition: 'transform 0.2s', gridColumn: 'span 2'
              }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                <span style={{ fontSize: '3rem', marginBottom: '10px' }}>📊</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e3a8a' }}>جدول الضرب الكامل</span>
              </button>
            </div>

            <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'right', direction: 'rtl' }}>
              <h4 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '20px' }}>⚙️ إعدادات الاختبار:</h4>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '10px' }}>العملية الحسابية:</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'add', label: 'جمع ➕', color: '#10b981' },
                    { id: 'sub', label: 'طرح ➖', color: '#ef4444' },
                    { id: 'mul', label: 'ضرب ✖️', color: '#8b5cf6' },
                    { id: 'div', label: 'قسمة ➗', color: '#f59e0b' },
                    { id: 'mixed', label: 'مختلط 🎲', color: '#3b82f6' }
                  ].map(op => (
                    <button key={op.id} onClick={() => setOperation(op.id)} style={{
                      padding: '10px 20px', borderRadius: '10px', border: `2px solid ${operation === op.id ? op.color : '#e2e8f0'}`,
                      background: operation === op.id ? `${op.color}15` : '#fff',
                      color: operation === op.id ? op.color : '#64748b',
                      fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', flex: 1, minWidth: '100px'
                    }}>
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '10px' }}>مستوى الصعوبة:</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { id: 'easy', label: 'سهل ⭐' },
                    { id: 'medium', label: 'متوسط ⭐⭐' },
                    { id: 'hard', label: 'صعب ⭐⭐⭐' }
                  ].map(lvl => (
                    <button key={lvl.id} onClick={() => setLevel(lvl.id)} style={{
                      padding: '10px 20px', borderRadius: '10px', border: `2px solid ${level === lvl.id ? '#334155' : '#e2e8f0'}`,
                      background: level === lvl.id ? '#334155' : '#fff',
                      color: level === lvl.id ? '#fff' : '#64748b',
                      fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', flex: 1
                    }}>
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={startGame} style={{
                width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
                fontSize: '1.4rem', fontWeight: '900', cursor: 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
              }}>
                <Play fill="white" size={24} /> ابدأ الاختبار
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && question && (
          <div style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', alignItems: 'center', direction: 'rtl' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ background: '#fff', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', color: '#10b981', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', fontSize: '1.2rem' }}>
                النقاط: {score}
              </div>
              <div style={{ background: '#fff', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', color: '#f59e0b', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', fontSize: '1.2rem' }}>
                🔥 التتابع: {streak}
              </div>
            </div>

            <div style={{
              background: '#fff', width: '100%', padding: '50px 20px', borderRadius: '30px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.05)', textAlign: 'center', marginBottom: '40px',
              direction: 'ltr'
            }}>
              <h2 style={{ fontSize: '4.5rem', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '5px' }}>
                {question.num1} <span style={{ color: '#3b82f6' }}>{question.operatorSymbol}</span> {question.num2} <span style={{ color: '#94a3b8' }}>=</span> ?
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%', direction: 'ltr' }}>
              {question.options.map((opt, idx) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === question.answer;
                
                let bgColor = '#fff';
                let textColor = '#334155';
                let borderColor = '#e2e8f0';

                if (selectedAnswer !== null) {
                  if (isCorrect) {
                    bgColor = '#10b981'; textColor = '#fff'; borderColor = '#10b981';
                  } else if (isSelected) {
                    bgColor = '#ef4444'; textColor = '#fff'; borderColor = '#ef4444';
                  } else {
                    bgColor = '#f1f5f9'; textColor = '#94a3b8';
                  }
                }

                  return (
                    <button key={idx} onClick={() => handleAnswer(opt)} style={{
                      padding: '25px', borderRadius: '20px', border: '3px solid', borderColor: borderColor,
                    background: bgColor, color: textColor, fontSize: '2.5rem', fontWeight: '900',
                    cursor: selectedAnswer === null ? 'pointer' : 'default',
                    transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                  }} onMouseOver={e => { if (selectedAnswer === null) { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                     onMouseOut={e => { if (selectedAnswer === null) { e.currentTarget.style.borderColor = borderColor; e.currentTarget.style.transform = 'none'; } }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {gameState === 'table' && (
          <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', gap: '20px', direction: 'rtl', height: '100%' }}>
            <div style={{ width: '140px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', paddingRight: '10px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                <button key={num} onClick={() => setActiveTable(num)} style={{
                  padding: '15px', borderRadius: '15px', border: 'none',
                  background: activeTable === num ? '#3b82f6' : '#fff',
                  color: activeTable === num ? '#fff' : '#64748b',
                  fontSize: '1.2rem', fontWeight: '900', cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: 'all 0.2s'
                }}>
                  جدول {num}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, background: '#fff', borderRadius: '30px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e3a8a', textAlign: 'center', marginBottom: '30px', borderBottom: '3px dashed #e2e8f0', paddingBottom: '20px' }}>
                جدول الضرب في {activeTable}
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', direction: 'ltr' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                  <button key={i} onClick={() => readTableRow(activeTable, i)} style={{
                    padding: '20px', borderRadius: '15px', border: '2px solid #e2e8f0',
                    background: '#f8fafc', color: '#334155', fontSize: '1.8rem', fontWeight: '900',
                    display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }} onMouseOver={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#eff6ff'; }}
                     onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}>
                    <span>{activeTable}</span>
                    <span style={{ color: '#3b82f6' }}>×</span>
                    <span>{i}</span>
                    <span style={{ color: '#94a3b8' }}>=</span>
                    <span style={{ color: '#10b981' }}>{activeTable * i}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
