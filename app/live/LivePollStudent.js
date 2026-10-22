import React, { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';

export default function LivePollStudent({ channel, studentId }) {
  const [activePoll, setActivePoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (!channel) return;
    
    const startHandler = (e) => {
      setActivePoll(e.detail);
      setSelectedOption(null);
    }
    const endHandler = () => {
      setActivePoll(null);
      setSelectedOption(null);
    }
    window.addEventListener('on_start_poll', startHandler)
    window.addEventListener('on_end_poll', endHandler)

    return () => {
      window.removeEventListener('on_start_poll', startHandler)
      window.removeEventListener('on_end_poll', endHandler)
    };
  }, [channel]);

  const submitAnswer = (index) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    channel.send({
      type: 'broadcast',
      event: 'poll_answer',
      payload: { studentId, optionIndex: index }
    }).catch(() => {});
  };

  if (!activePoll) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 100000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal', direction: 'rtl'
    }}>
      <div style={{
        background: '#fff', padding: '0', borderRadius: '20px', width: '90%', maxWidth: '400px',
        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{
          background: '#3b82f6', padding: '20px', display: 'flex', justifyContent: 'center', 
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
            <BarChart2 size={24} color='#fff' /> مسابقة سريعة
          </h2>
        </div>

        <div style={{ padding: '30px', background: '#fff', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: '30px' }}>{activePoll.question}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            {activePoll.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              return (
                <button 
                  key={i} 
                  onClick={() => submitAnswer(i)}
                  disabled={selectedOption !== null}
                  style={{ 
                    padding: '15px', borderRadius: '12px', border: `2px solid ${isSelected ? "#3b82f6" : "#e2e8f0"}`,
                    background: isSelected ? '#eff6ff' : '#fff',
                    color: isSelected ? '#1e3a8a' : '#334155',
                    fontSize: '1.1rem', fontWeight: 'bold', cursor: selectedOption !== null ? 'default' : 'pointer',
                    transition: 'all 0.2s', opacity: (selectedOption !== null && !isSelected) ? 0.5 : 1
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          
          {selectedOption !== null && (
            <p style={{ marginTop: '20px', color: '#10b981', fontWeight: 'bold' }}>تم إرسال إجابتك!</p>
          )}
        </div>
      </div>
    </div>
  );
}

