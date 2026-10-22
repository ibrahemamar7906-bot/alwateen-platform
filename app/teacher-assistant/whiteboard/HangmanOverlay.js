'use client';
import React, { useState, useEffect } from 'react';
import { X, Heart, AlertCircle, Trophy, RefreshCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import AIGameGenerator from '../../components/AIGameGenerator';

const ARABIC_ALPHABET = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split('');

export default function HangmanOverlay({ isActive, onClose, isStudent = false, channel }) {
  const [secretWord, setSecretWord] = useState('');
  const [displayWord, setDisplayWord] = useState('');
  const [hint, setHint] = useState('');
  const [setupMode, setSetupMode] = useState(true);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const maxWrong = 5;

  const currentWord = isStudent ? displayWord : secretWord;
  const isGameWon = !setupMode && currentWord.length > 0 && currentWord.split('').every(char => char === ' ' || guessedLetters.includes(char));
  const isGameOver = wrongGuesses >= maxWrong;

  useEffect(() => {
    if (isActive && !isStudent) {
      setSetupMode(true);
      setSecretWord('');
      setHint('');
      setGuessedLetters([]);
      setWrongGuesses(0);
    }
  }, [isActive, isStudent]);

  const broadcastGame = (action, data) => {
    if (!channel || isStudent) return;
    channel.send({ type: 'broadcast', event: 'HANGMAN_EVENT', payload: { action, ...data } });
  };

  useEffect(() => {
    if (!channel) return;
    const sub = channel.on('broadcast', { event: 'HANGMAN_EVENT' }, ({ payload }) => {
      if (payload.action === 'state_update') {
        setDisplayWord(payload.displayWord || '');
        setHint(payload.hint || '');
        setSetupMode(payload.setupMode);
        setGuessedLetters(payload.guessedLetters || []);
        setWrongGuesses(payload.wrongGuesses || 0);
      }
    });
    return () => {
      // cleanup handled by parent
    };
  }, [channel]);

  useEffect(() => {
    if (isStudent || !channel) return;
    
    const maskedWord = secretWord.split('').map(char => {
      if (char === ' ') return ' ';
      if (guessedLetters.includes(char)) return char;
      return '_';
    }).join('');
    
    const wordToSend = (wrongGuesses >= maxWrong || (secretWord.length > 0 && secretWord.split('').every(c => c === ' ' || guessedLetters.includes(c)))) 
      ? secretWord 
      : maskedWord;

    broadcastGame('state_update', {
      displayWord: wordToSend,
      hint,
      setupMode,
      guessedLetters,
      wrongGuesses
    });
  }, [secretWord, hint, setupMode, guessedLetters, wrongGuesses, isStudent, channel]);

  useEffect(() => {
    if (isGameWon) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, [isGameWon]);

  const startGame = () => {
    if (!secretWord.trim()) {
      alert('يرجى إدخال كلمة السر');
      return;
    }
    setSetupMode(false);
    setGuessedLetters([]);
    setWrongGuesses(0);
  };

  const handleGuess = (letter) => {
    if (guessedLetters.includes(letter) || isGameOver || isGameWon || isStudent) return;

    const newGuessed = [...guessedLetters, letter];
    setGuessedLetters(newGuessed);

    if (!secretWord.includes(letter)) {
      setWrongGuesses(prev => prev + 1);
    }
  };

  if (!isActive) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(15, 23, 42, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal' }}>
      {!isStudent && (
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer', display: 'flex', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
          <X size={24} color="#ef4444" />
        </button>
      )}

      {setupMode && !isStudent ? (
        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '500px', maxWidth: '90%', textAlign: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
          <h2 style={{ color: '#334155', marginBottom: '10px', fontSize: '28px' }}>🔤 إعداد لعبة تخمين الكلمة</h2>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>أدخل الكلمة التي سيقوم الطلاب بتخمينها</p>
          
          <AIGameGenerator 
            promptType="hangman" 
            onGenerated={(data) => {
              if (data && data.length > 0) {
                setSecretWord(data[0].word.replace(/[^ابتثجحخدذرزسشصضطظعغفقكلمنهوي ]/g, ''));
                setHint(data[0].hint);
              }
            }} 
          />

          <input 
            type="text" 
            placeholder="الكلمة السرية (مثال: أكسجين)"
            value={secretWord}
            onChange={(e) => setSecretWord(e.target.value.replace(/[^ابتثجحخدذرزسشصضطظعغفقكلمنهوي ]/g, ''))}
            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '20px', textAlign: 'center', marginBottom: '15px', outline: 'none' }}
          />
          <input 
            type="text" 
            placeholder="تلميح للطلاب (اختياري)"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '16px', textAlign: 'center', marginBottom: '30px', outline: 'none' }}
          />
          
          <button onClick={startGame} style={{ width: '100%', padding: '15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            ابدأ اللعبة 🚀
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '800px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Hearts / Lives */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
            {Array.from({ length: maxWrong }).map((_, i) => (
              <Heart key={i} size={40} fill={i < (maxWrong - wrongGuesses) ? '#ef4444' : '#334155'} color={i < (maxWrong - wrongGuesses) ? '#ef4444' : '#334155'} style={{ transition: 'all 0.3s' }} />
            ))}
          </div>

          {/* Hint */}
          {hint && (
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 25px', borderRadius: '50px', color: '#cbd5e1', marginBottom: '30px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} color="#fbbf24" /> تلميح: {hint}
            </div>
          )}

          {/* Word Display */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '50px', direction: 'rtl' }}>
            {currentWord.split('').map((char, index) => (
              char === ' ' ? <div key={index} style={{ width: '30px' }} /> :
              <div key={index} style={{ 
                width: '60px', height: '70px', background: guessedLetters.includes(char) || isGameOver || char !== '_' ? 'white' : 'rgba(255,255,255,0.1)', 
                borderBottom: guessedLetters.includes(char) || isGameOver || char !== '_' ? 'none' : '4px solid white',
                borderRadius: guessedLetters.includes(char) || isGameOver || char !== '_' ? '12px' : '0',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '40px', fontWeight: 'bold', color: isGameOver && !guessedLetters.includes(char) ? '#ef4444' : '#0f172a',
                boxShadow: guessedLetters.includes(char) || isGameOver || char !== '_' ? '0 10px 25px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.3s'
              }}>
                {(guessedLetters.includes(char) || isGameOver || char !== '_') ? (char === '_' ? '' : char) : ''}
              </div>
            ))}
          </div>

          {/* Game Over / Won Messages */}
          {isGameWon && (
            <div style={{ background: '#10b981', color: 'white', padding: '20px 40px', borderRadius: '15px', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', animation: 'bounce 1s infinite' }}>
              <Trophy size={32} /> ممتاز! إجابة صحيحة
            </div>
          )}
          {isGameOver && (
            <div style={{ background: '#ef4444', color: 'white', padding: '20px 40px', borderRadius: '15px', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
              للأسف، لقد خسرت المحاولة!
            </div>
          )}

          {/* Keyboard */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '700px', direction: 'rtl' }}>
            {ARABIC_ALPHABET.map(letter => {
              const isGuessed = guessedLetters.includes(letter);
              const isCorrect = isGuessed && currentWord.includes(letter);
              const isWrong = isGuessed && !currentWord.includes(letter);
              
              let bg = 'white';
              let color = '#334155';
              let opacity = 1;
              
              if (isCorrect) { bg = '#10b981'; color = 'white'; }
              else if (isWrong) { bg = '#ef4444'; color = 'white'; opacity = 0.5; }

              return (
                <button 
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={isGuessed || isGameOver || isGameWon || isStudent}
                  style={{ 
                    width: '50px', height: '50px', borderRadius: '12px', border: 'none', 
                    fontSize: '24px', fontWeight: 'bold', background: bg, color: color, opacity: opacity,
                    cursor: (isGuessed || isGameOver || isGameWon || isStudent) ? 'default' : 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'all 0.2s'
                  }}
                >
                  {letter}
                </button>
              )
            })}
          </div>

          {(isGameOver || isGameWon) && !isStudent && (
            <button onClick={() => setSetupMode(true)} style={{ marginTop: '40px', padding: '15px 30px', background: 'white', color: '#334155', border: 'none', borderRadius: '50px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RefreshCcw size={20} /> العب مرة أخرى
            </button>
          )}

        </div>
      )}
    </div>
  );
}
