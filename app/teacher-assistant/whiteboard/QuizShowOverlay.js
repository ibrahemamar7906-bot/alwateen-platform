'use client';
import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Users, Phone, Trophy, CheckCircle, XCircle, Upload, ChevronLeft, Wand2 } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import AIGameGenerator from '../../components/AIGameGenerator';
import confetti from 'canvas-confetti';

export default function QuizShowOverlay({ isActive, onClose, isStudent = false, channel }) {
  const [questionsList, setQuestionsList] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [setupMode, setSetupMode] = useState(true);
  
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  
  const [importText, setImportText] = useState('');
  const [activeTab, setActiveTab] = useState('single');

  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
          if (data && data.role === 'admin') setIsAdmin(true);
        });
      }
    });
  }, []);

  useEffect(() => {
    if (isActive && !isStudent) {
      setSetupMode(true);
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswer(0);
      setQuestionsList([]);
      setCurrentQIndex(0);
      resetGameState();
    }
  }, [isActive, isStudent]);

  const resetGameState = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setUsedFiftyFifty(false);
    setHiddenOptions([]);
  };

  const broadcastGame = (action, data) => {
    if (!channel || isStudent) return;
    channel.send({ type: 'broadcast', event: 'QUIZ_EVENT', payload: { action, ...data } });
  };

  useEffect(() => {
    if (!channel) return;
    const sub = channel.on('broadcast', { event: 'QUIZ_EVENT' }, ({ payload }) => {
      if (payload.action === 'state_update') {
        setQuestionsList(payload.questionsList || []);
        setCurrentQIndex(payload.currentQIndex || 0);
        setSetupMode(payload.setupMode);
        setSelectedAnswer(payload.selectedAnswer);
        setShowResult(payload.showResult);
        setUsedFiftyFifty(payload.usedFiftyFifty);
        setHiddenOptions(payload.hiddenOptions || []);
        if (payload.triggerConfetti) {
          confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
        }
      }
    });
    return () => {
      // cleanup handled by parent
    };
  }, [channel]);

  // Sync state when teacher changes it
  useEffect(() => {
    if (isStudent || !channel) return;
    broadcastGame('state_update', {
      questionsList,
      currentQIndex,
      setupMode,
      selectedAnswer,
      showResult,
      usedFiftyFifty,
      hiddenOptions
    });
  }, [questionsList, currentQIndex, setupMode, selectedAnswer, showResult, usedFiftyFifty, hiddenOptions, isStudent, channel]);

  const handleStartSingle = () => {
    if (!question.trim() || options.some(o => !o.trim())) {
      alert('يرجى كتابة السؤال وجميع الاختيارات');
      return;
    }
    setQuestionsList([{ question, options, correctAnswer }]);
    setCurrentQIndex(0);
    setSetupMode(false);
    resetGameState();
  };

  const handleStartBulk = () => {
    if (!importText.trim()) return;
    const lines = importText.split('\n');
    const parsedQuestions = [];
    
    lines.forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 6) {
        parsedQuestions.push({
          question: parts[0].trim(),
          options: [parts[1].trim(), parts[2].trim(), parts[3].trim(), parts[4].trim()],
          correctAnswer: parseInt(parts[5].trim()) - 1
        });
      }
    });

    if (parsedQuestions.length > 0) {
      setQuestionsList(parsedQuestions);
      setCurrentQIndex(0);
      setSetupMode(false);
      resetGameState();
    } else {
      alert('فشل الاستيراد! استخدم الصيغة: السؤال, خيار1, خيار2, خيار3, خيار4, رقم الإجابة الصحيحة (1-4)');
    }
  };

  const nextQuestion = () => {
    if (currentQIndex < questionsList.length - 1) {
       setCurrentQIndex(prev => prev + 1);
       resetGameState();
    } else {
       alert("لقد أنهيت جميع الأسئلة!");
       setSetupMode(true);
    }
  };

  const handleSelectAnswer = (index) => {
    if (showResult || hiddenOptions.includes(index) || isStudent) return;
    setSelectedAnswer(index);
    
    setTimeout(() => {
      setShowResult(true);
      if (index === questionsList[currentQIndex]?.correctAnswer) {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
        broadcastGame('state_update', {
          questionsList,
          currentQIndex,
          setupMode,
          selectedAnswer: index,
          showResult: true,
          usedFiftyFifty,
          hiddenOptions,
          triggerConfetti: true
        });
      }
    }, 2000);
  };

  const handleFiftyFifty = () => {
    if (usedFiftyFifty || showResult || isStudent) return;
    const correctIdx = questionsList[currentQIndex]?.correctAnswer || 0;
    const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIdx);
    const shuffled = wrongIndices.sort(() => 0.5 - Math.random());
    setHiddenOptions([shuffled[0], shuffled[1]]);
    setUsedFiftyFifty(true);
  };

  if (!isActive) return null;

  const hasQuestions = questionsList.length > 0;
  const currentQuestion = questionsList[currentQIndex] || { question: 'في انتظار بدء المسابقة...', options: ['...', '...', '...', '...'], correctAnswer: 0 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'radial-gradient(circle, #1e3a8a 0%, #020617 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal', direction: 'rtl' }}>
      {!isStudent && (
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer', display: 'flex', color: 'white' }}>
          <X size={24} />
        </button>
      )}

      {setupMode && !isStudent ? (
        <div style={{ background: 'white', padding: '0', borderRadius: '20px', width: '700px', maxWidth: '90%', boxShadow: '0 15px 35px rgba(0,0,0,0.5)', overflowX: 'hidden', overflowY: 'auto', maxHeight: '90vh' }}>
          <div style={{ background: '#1e3a8a', padding: '20px', textAlign: 'center', color: 'white' }}>
            <h2 style={{ margin: 0, fontSize: '28px' }}>🏆 إعداد مسابقة المليون</h2>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
             <button onClick={() => setActiveTab('single')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'single' ? 'white' : 'transparent', borderBottom: activeTab === 'single' ? '3px solid #1e3a8a' : '3px solid transparent', color: activeTab === 'single' ? '#1e3a8a' : '#64748b', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>سؤال واحد</button>
             <button onClick={() => setActiveTab('bulk')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'bulk' ? 'white' : 'transparent', borderBottom: activeTab === 'bulk' ? '3px solid #1e3a8a' : '3px solid transparent', color: activeTab === 'bulk' ? '#1e3a8a' : '#64748b', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>استيراد أسئلة (CSV)</button>
             {isAdmin && <button onClick={() => setActiveTab('ai')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'ai' ? 'white' : 'transparent', borderBottom: activeTab === 'ai' ? '3px solid #0ea5e9' : '3px solid transparent', color: activeTab === 'ai' ? '#0ea5e9' : '#64748b', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Wand2 size={18} /> توليد ذكي (AI)</button>}
          </div>
          
          <div style={{ padding: '30px' }}>
             {activeTab === 'single' ? (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>نص السؤال:</label>
                    <input type="text" value={question} onChange={e => setQuestion(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '18px' }} placeholder="اكتب السؤال هنا..." />
                  </div>

                  <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold' }}>الاختيارات (حدد الإجابة الصحيحة بالدائرة):</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                    {options.map((opt, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="radio" name="correct" checked={correctAnswer === i} onChange={() => setCorrectAnswer(i)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                        <input type="text" value={opt} onChange={e => { const newOpts = [...options]; newOpts[i] = e.target.value; setOptions(newOpts); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: correctAnswer === i ? '2px solid #10b981' : '1px solid #cbd5e1' }} placeholder={`اختيار ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                  
                  <button onClick={handleStartSingle} style={{ width: '100%', padding: '15px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>بدء المسابقة 🔥</button>
                </>
             ) : activeTab === 'bulk' ? (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#475569', marginBottom: '15px', marginTop: 0 }}>لإضافة سلسلة أسئلة، قم بلصق النص بالصيغة التالية (يفصل بينها فاصلة):</p>
                    <p style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px', direction: 'ltr', textAlign: 'left', color: '#334155' }}>
                       السؤال, اختيار1, اختيار2, اختيار3, اختيار4, رقم الإجابة الصحيحة (1-4)<br/>
                       ما هي عاصمة مصر؟, القاهرة, أسوان, الجيزة, الإسكندرية, 1
                    </p>
                    <textarea 
                       value={importText} 
                       onChange={e => setImportText(e.target.value)} 
                       style={{ width: '100%', height: '150px', padding: '15px', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '16px', direction: 'rtl' }} 
                       placeholder="الصق أسئلتك هنا..." 
                    />
                  </div>
                  <button onClick={handleStartBulk} style={{ width: '100%', padding: '15px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>بدء المسابقة (سلسلة أسئلة) 🔥</button>
                </>
             ) : activeTab === 'ai' ? (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#475569', marginBottom: '15px', marginTop: 0 }}>توليد أسئلة لمسابقة المليون بالذكاء الاصطناعي:</p>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', background: '#f8fafc' }}>
                       <AIGameGenerator importMode="replace" onGenerated={(newQs) => {
                          const mapped = newQs.map(q => {
                            const wrongs = q.options.filter(o => o !== q.answer);
                            const finalOpts = [wrongs[0], wrongs[1], wrongs[2], q.answer].sort(() => 0.5 - Math.random());
                            return { question: q.text, options: finalOpts, correctAnswer: finalOpts.indexOf(q.answer) };
                          });
                          setQuestionsList(mapped);
                          setCurrentQIndex(0);
                          setSetupMode(false);
                       }} />
                    </div>
                  </div>
                </>
             ) : null}
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '900px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '20px', alignItems: 'center' }}>
             <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '20px' }}>
                {hasQuestions ? `السؤال ${currentQIndex + 1} من ${questionsList.length}` : 'مسابقة المليون'}
             </span>
             <div style={{ display: 'flex', gap: '15px' }}>
                {!isStudent && hasQuestions && (
                  <button onClick={handleFiftyFifty} disabled={usedFiftyFifty} style={{ width: '70px', height: '50px', borderRadius: '30px', background: 'transparent', border: '2px solid #fbbf24', color: usedFiftyFifty ? '#475569' : '#fbbf24', cursor: usedFiftyFifty ? 'not-allowed' : 'pointer', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>50:50</button>
                )}
             </div>
          </div>

          {/* Question Box */}
          <div style={{ width: '100%', padding: '30px', background: 'linear-gradient(90deg, transparent 0%, #1e40af 15%, #1e40af 85%, transparent 100%)', color: 'white', textAlign: 'center', fontSize: '32px', fontWeight: 'bold', border: '2px solid #60a5fa', marginBottom: '40px', position: 'relative' }}>
            {currentQuestion.question}
          </div>

          {/* Options Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' }}>
            {currentQuestion.options.map((opt, i) => {
              const isHidden = hiddenOptions.includes(i);
              const isSelected = selectedAnswer === i;
              const isCorrect = showResult && i === currentQuestion.correctAnswer;
              const isWrong = showResult && isSelected && i !== currentQuestion.correctAnswer;
              
              let bg = 'linear-gradient(90deg, transparent 0%, #0f172a 10%, #0f172a 90%, transparent 100%)';
              let borderColor = '#3b82f6';
              let textColor = 'white';

              if (isSelected && !showResult) {
                bg = 'linear-gradient(90deg, transparent 0%, #d97706 10%, #d97706 90%, transparent 100%)';
                borderColor = '#f59e0b';
              } else if (isCorrect) {
                bg = 'linear-gradient(90deg, transparent 0%, #059669 10%, #059669 90%, transparent 100%)';
                borderColor = '#10b981';
              } else if (isWrong) {
                bg = 'linear-gradient(90deg, transparent 0%, #b91c1c 10%, #b91c1c 90%, transparent 100%)';
                borderColor = '#ef4444';
              }
              return (
                <button 
                  key={i}
                  onClick={() => handleSelectAnswer(i)}
                  disabled={isStudent || showResult || isHidden || !hasQuestions}
                  style={{ 
                    visibility: isHidden ? 'hidden' : 'visible',
                    padding: '20px', background: bg, color: textColor, border: `2px solid ${borderColor}`,
                    fontSize: '24px', fontWeight: 'bold', cursor: (showResult || isStudent || !hasQuestions) ? 'default' : 'pointer',
                    textAlign: 'right', display: 'flex', alignItems: 'center', gap: '15px',
                    transition: 'all 0.3s', borderRadius: '50px'
                  }}
                >
                  <span style={{ color: '#fbbf24' }}>{['أ', 'ب', 'ج', 'د'][i]}:</span> {opt}
                </button>
              )
            })}
          </div>

          {showResult && !isStudent && (
            <div style={{ display: 'flex', gap: '20px', marginTop: '50px' }}>
               {currentQIndex < questionsList.length - 1 ? (
                 <button onClick={nextQuestion} style={{ padding: '15px 40px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '50px', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    السؤال التالي <ChevronLeft size={24} />
                 </button>
               ) : (
                 <button onClick={() => setSetupMode(true)} style={{ padding: '15px 40px', background: '#10b981', color: 'white', border: 'none', borderRadius: '50px', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                    إنهاء المسابقة
                 </button>
               )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}







