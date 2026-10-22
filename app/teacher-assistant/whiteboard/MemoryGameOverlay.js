import React, { useState, useEffect } from 'react';
import { X, RefreshCcw, Upload, Wand2 } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import AIGameGenerator from '../../components/AIGameGenerator';
import confetti from 'canvas-confetti';

const DEFAULT_PAIRS = [
  { p1: '🍎', p2: 'تفاحة' },
  { p1: '🚗', p2: 'سيارة' },
  { p1: '🐶', p2: 'كلب' },
  { p1: '⚽', p2: 'كرة' },
  { p1: '🌞', p2: 'شمس' },
  { p1: '📚', p2: 'كتاب' },
  { p1: '💻', p2: 'حاسوب' },
  { p1: '⏰', p2: 'ساعة' }
];

export default function MemoryGameOverlay({ isActive, onClose, isStudent = false, channel }) {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState([]);
  const [moves, setMoves] = useState(0);
  const [setupMode, setSetupMode] = useState(false);
  const [importText, setImportText] = useState('');
  const [customPairs, setCustomPairs] = useState(DEFAULT_PAIRS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAIPaste, setShowAIPaste] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
          if (data && data.role === 'admin') setIsAdmin(true);
        });
      }
    });
  }, []);

  const stateRef = React.useRef({ cards, flippedIndices, matchedIndices, moves });
  useEffect(() => {
    stateRef.current = { cards, flippedIndices, matchedIndices, moves };
  }, [cards, flippedIndices, matchedIndices, moves]);

  useEffect(() => {
    if (!channel || !isActive) return;
    
    let hasRequested = false;
    if (isStudent && !hasRequested) {
      channel.send({ type: 'broadcast', event: 'memory_action', payload: { action: 'request_sync' } }).catch(()=>{});
      hasRequested = true;
    }

    const sub = channel.on('broadcast', { event: 'memory_action' }, ({ payload }) => {
      if (isStudent && payload.action === 'sync_state') {
        setCards(payload.cards);
        setFlippedIndices(payload.flippedIndices);
        setMatchedIndices(payload.matchedIndices);
        setMoves(payload.moves);
      }
      if (!isStudent && payload.action === 'request_sync') {
        channel.send({ type: 'broadcast', event: 'memory_action', payload: {
          action: 'sync_state',
          cards: stateRef.current.cards, 
          flippedIndices: stateRef.current.flippedIndices, 
          matchedIndices: stateRef.current.matchedIndices, 
          moves: stateRef.current.moves
        }}).catch(()=>{});
      }
      
      if (payload.action === 'flip' && isStudent) {
        setFlippedIndices(payload.flippedIndices);
        setMoves(payload.moves);
        if (payload.matchedIndices) {
          setMatchedIndices(payload.matchedIndices);
        }
      }
      
      if (payload.action === 'reset' && isStudent) {
        setCards(payload.cards);
        setFlippedIndices([]);
        setMatchedIndices([]);
        setMoves(0);
      }
    });

    return () => {};
  }, [channel, isActive, isStudent]);

  const broadcastState = (action, extraPayload = {}) => {
    if (!channel || isStudent) return;
    channel.send({ type: 'broadcast', event: 'memory_action', payload: { action, ...extraPayload } }).catch(()=>{});
  };

  useEffect(() => {
    if (isActive && !isStudent) {
      initializeGame(customPairs);
    }
  }, [isActive, customPairs]);

  const initializeGame = (pairsToUse) => {
    let allCards = [];
    pairsToUse.forEach((pair, index) => {
       allCards.push({ content: pair.p1, pairId: index, id: Math.random() });
       allCards.push({ content: pair.p2, pairId: index, id: Math.random() });
    });
    
    const shuffled = allCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedIndices([]);
    setMoves(0);
    broadcastState('reset', { cards: shuffled });
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const lines = importText.split('\n');
    const newPairs = [];
    lines.forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 2) {
        newPairs.push({ p1: parts[0].trim(), p2: parts[1].trim() });
      }
    });
    if (newPairs.length > 0) {
      const limited = newPairs.slice(0, 10);
      setCustomPairs(limited);
      setSetupMode(false);
      initializeGame(limited);
    } else {
      alert('لم يتم العثور على أزواج صحيحة. استخدم صيغة (الكلمة, المرادف)');
    }
  };

  const handleCardClick = (index) => {
    if (flippedIndices.length === 2 || flippedIndices.includes(index) || matchedIndices.includes(index) || isStudent) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    let currentMoves = moves;

    if (newFlipped.length === 2) {
      currentMoves += 1;
      setMoves(currentMoves);
      const [first, second] = newFlipped;
      if (cards[first].pairId === cards[second].pairId) {
        const newMatched = [...matchedIndices, first, second];
        setMatchedIndices(newMatched);
        setFlippedIndices([]);
        broadcastState('flip', { flippedIndices: [], matchedIndices: newMatched, moves: currentMoves });
        if (newMatched.length === cards.length) {
           confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
      } else {
        broadcastState('flip', { flippedIndices: newFlipped, moves: currentMoves });
        setTimeout(() => {
          setFlippedIndices([]);
          broadcastState('flip', { flippedIndices: [], moves: currentMoves });
        }, 1000);
      }
    } else {
        broadcastState('flip', { flippedIndices: newFlipped, moves: currentMoves });
    }
  };

  if (!isActive) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.9)', zIndex: 4000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal', direction: 'rtl'
    }}>
      <div style={{
        background: '#fff', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '800px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🧠 لعبة الذاكرة والتوصيل
          </h2>
          {!isStudent && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setSetupMode(!setupMode)} style={{ background: '#fef3c7', border: 'none', color: '#d97706', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', gap: '5px' }}><Upload size={20} /> استيراد الكلمات</button>
            <button onClick={() => initializeGame(customPairs)} style={{ background: '#e0e7ff', border: 'none', color: '#3730a3', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><RefreshCcw size={20} /></button>
            <button onClick={onClose} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          )}
        </div>
        {setupMode && !isStudent ? (
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#334155' }}>إعداد الكلمات المزدوجة</h3>
              {isAdmin && (
                <button onClick={() => setShowAIPaste(!showAIPaste)} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Wand2 size={16} /> توليد ذكي (AI)
                </button>
              )}
            </div>
            
            {showAIPaste ? (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', background: '#fff', marginBottom: '15px' }}>
                 <AIGameGenerator promptType="pairs" importMode="replace" onGenerated={(newQs) => {
                    // map question + answer to pairs for memory game
                    const mappedPairs = newQs.map(q => ({ p1: q.text, p2: q.answer })).slice(0, 10);
                    setCustomPairs(mappedPairs);
                    setSetupMode(false);
                    setShowAIPaste(false);
                    initializeGame(mappedPairs);
                 }} />
              </div>
            ) : (
              <>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: 0 }}>اكتب كل زوج من الكلمات في سطر يفصل بينهما فاصلة (مثال: تفاحة, Apple)</p>
                <textarea 
                   value={importText} 
                   onChange={e => setImportText(e.target.value)} 
                   style={{ width: '100%', height: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px', fontFamily: 'monospace' }}
                   placeholder="تفاحة, Apple
سيارة, Car
كتاب, Book"
                />
                <button onClick={handleImport} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>حفظ وبدء</button>
              </>
            )}
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '15px', color: '#64748b', fontSize: '1.1rem' }}>
              عدد المحاولات: <strong>{moves}</strong>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: cards.length > 12 ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)', gap: '15px', perspective: '1000px' }}>
              {cards.map((card, index) => {
                const isFlipped = flippedIndices.includes(index) || matchedIndices.includes(index);
                return (
                  <div 
                    key={card.id} 
                    onClick={() => handleCardClick(index)}
                    style={{
                      height: '100px', cursor: 'pointer', position: 'relative',
                      transformStyle: 'preserve-3d', transition: 'transform 0.5s',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                  >
                    {/* Back (Hidden) */}
                    <div style={{
                      position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '15px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', color: 'white'
                    }}>?</div>
                    
                    {/* Front (Content) */}
                    <div style={{
                      position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                      background: matchedIndices.includes(index) ? '#dcfce7' : '#fff', 
                      border: matchedIndices.includes(index) ? '2px solid #22c55e' : '2px solid #cbd5e1',
                      borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: card.content.length > 5 ? '1.2rem' : '2rem', textAlign: 'center', padding: '10px',
                      transform: 'rotateY(180deg)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontWeight: 'bold', color: '#1e293b'
                    }}>
                      {card.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {matchedIndices.length === cards.length && cards.length > 0 && (
              <div style={{ marginTop: '20px', textAlign: 'center', padding: '15px', background: '#dcfce7', color: '#166534', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.2rem' }}>
                ممتاز! لقد قمت بتوصيل جميع البطاقات في {moves} محاولات.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}



