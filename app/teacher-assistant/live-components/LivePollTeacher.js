import React, { useState, useEffect, useRef } from 'react';
import { X, BarChart2, Play } from 'lucide-react';
import { removeBroadcastBinding } from '../../utils/realtimeHelper';

export default function LivePollTeacher({ isActive, onClose, channel, students }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [pollActive, setPollActive] = useState(false);
  const [answers, setAnswers] = useState({}); // { studentId: optionIndex }

  const pollStateRef = useRef({ pollActive, question, options });
  useEffect(() => {
    pollStateRef.current = { pollActive, question, options };
  }, [pollActive, question, options]);

  useEffect(() => {
    if (!isActive || !channel) return;
    
    const handleAnswer = ({ payload }) => {
      if (!payload) return;
      setAnswers(prev => ({ ...prev, [payload.studentId]: payload.optionIndex }));
    };
    channel.on('broadcast', { event: 'poll_answer' }, handleAnswer);

    const sendSync = () => {
      const state = pollStateRef.current;
      if (state.pollActive) {
        channel.send({
          type: 'broadcast',
          event: 'start_poll',
          payload: { question: state.question, options: state.options }
        }).catch(() => {});
      }
    };
    channel.on('broadcast', { event: 'global_sync_request' }, sendSync);
    window.addEventListener('on_global_sync_request', sendSync);

    return () => {
      removeBroadcastBinding(channel, 'poll_answer', handleAnswer);
      removeBroadcastBinding(channel, 'global_sync_request', sendSync);
      window.removeEventListener('on_global_sync_request', sendSync);
    };
  }, [isActive, channel]);

  if (!isActive) return null;

  const startPoll = () => {
    if (!question || options.some(o => !o.trim())) return;
    setPollActive(true);
    setAnswers({});
    channel.send({
      type: 'broadcast',
      event: 'start_poll',
      payload: { question, options }
    }).catch(() => {});
  };

  const endPoll = () => {
    setPollActive(false);
    channel.send({
      type: 'broadcast',
      event: 'end_poll',
      payload: {}
    }).catch(() => {});
  };

  const updateOption = (index, val) => {
    const newOps = [...options];
    newOps[index] = val;
    setOptions(newOps);
  };

  const totalAnswers = Object.keys(answers).length;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 100000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal', direction: 'rtl'
    }}>
      <div style={{
        background: '#fff', padding: '0', borderRadius: '20px', width: '90%', maxWidth: '500px',
        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{
          background: '#f8fafc', padding: '20px', display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', borderBottom: '1px solid #e2e8f0'
        }}>
          <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
            <BarChart2 size={24} color='#3b82f6' /> مسابقة سريعة (Poll)
          </h2>
          <button onClick={() => { endPoll(); onClose(); }} style={{
            background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', 
            borderRadius: '50%', padding: '8px', display: 'flex'
          }}><X size={20} /></button>
        </div>

        <div style={{ padding: '20px', background: '#fff' }}>
          {!pollActive ? (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>السؤال:</label>
                <input type="text" value={question} onChange={e => setQuestion(e.target.value)} placeholder="مثال: ما هو ناتج 5 + 7 ؟" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1.1rem' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                {options.map((opt, i) => (
                  <div key={i}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#64748b', fontSize: '0.9rem' }}>خيار {i+1}</label>
                    <input type="text" value={opt} onChange={e => updateOption(i, e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                ))}
              </div>
              <button onClick={startPoll} style={{
                width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
                fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px'
              }}>
                <Play size={20} /> إرسال السؤال للطلاب
              </button>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '20px', textAlign: 'center' }}>{question}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                {options.map((opt, i) => {
                  const count = Object.values(answers).filter(v => v === i).length;
                  const percent = totalAnswers === 0 ? 0 : Math.round((count / totalAnswers) * 100);
                  return (
                    <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0' }}>
                      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: `${percent}%`, background: '#dbeafe', transition: 'width 0.5s' }} />
                      <div style={{ padding: '12px 15px', position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#334155' }}>
                        <span>{opt}</span>
                        <span>{count} ط ({percent}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px' }}>إجمالي الإجابات: {totalAnswers}</p>
              <button onClick={endPoll} style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                background: '#ef4444', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer'
              }}>
                إنهاء المسابقة
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


