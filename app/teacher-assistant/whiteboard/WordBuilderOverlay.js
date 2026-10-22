import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, RefreshCcw, ArrowRight } from 'lucide-react';
import { speakWhenReady } from '../../../utils/tts';
import { renderCheerOnCanvas } from '../../utils/cheerEffects';

const RANDOM_LETTERS = ['أَ','إِ','أُ','بَ','بِ','بُ','تَ','تِ','تُ','ثَ','ثِ','ثُ','جَ','جِ','جُ','حَ','حِ','حُ','خَ','خِ','خُ','دَ','دِ','دُ','ذَ','ذِ','ذُ','رَ','رِ','رُ','زَ','زِ','زُ','سَ','سِ','سُ','شَ','شِ','شُ','صَ','صِ','صُ','ضَ','ضِ','ضُ','طَ','طِ','طُ','ظَ','ظِ','ظُ','عَ','عِ','عُ','غَ','غِ','غُ','فَ','فِ','فُ','قَ','قِ','قُ','كَ','كِ','كُ','لَ','لِ','لُ','مَ','مِ','مُ','نَ','نِ','نُ','هَ','هِ','هُ','وَ','وِ','وُ','يَ','يِ','يُ'];

const WORD_BANK = [
  { id: 1, word: 'لَعِبَ', letters: ['لَ', 'عِ', 'بَ'], emoji: '👦⚽' },
  { id: 2, word: 'شَرِبَ', letters: ['شَ', 'رِ', 'بَ'], emoji: '🥛' },
  { id: 3, word: 'أَكَلَ', letters: ['أَ', 'كَ', 'لَ'], emoji: '🍎' },
  { id: 4, word: 'قَرَأَ', letters: ['قَ', 'رَ', 'أَ'], emoji: '📖' },
  { id: 5, word: 'كَتَبَ', letters: ['كَ', 'تَ', 'بَ'], emoji: '✍️' },
  { id: 6, word: 'سَمِعَ', letters: ['سَ', 'مِ', 'عَ'], emoji: '👂' },
  { id: 7, word: 'فَتَحَ', letters: ['فَ', 'تَ', 'حَ'], emoji: '🚪' },
  { id: 8, word: 'دَخَلَ', letters: ['دَ', 'خَ', 'لَ'], emoji: '🚶‍♂️' },
  { id: 9, word: 'خَرَجَ', letters: ['خَ', 'رَ', 'جَ'], emoji: '🚶‍♀️' },
  { id: 10, word: 'جَلَسَ', letters: ['جَ', 'لَ', 'سَ'], emoji: '🪑' },
  { id: 11, word: 'وَقَفَ', letters: ['وَ', 'قَ', 'فَ'], emoji: '🧍' },
  { id: 12, word: 'رَكِضَ', letters: ['رَ', 'كِ', 'ضَ'], emoji: '🏃' },
  { id: 13, word: 'ضَحِكَ', letters: ['ضَ', 'حِ', 'كَ'], emoji: '😂' },
  { id: 14, word: 'بَكَى', letters: ['بَ', 'كَ', 'ى'], emoji: '😢' },
  { id: 15, word: 'نَامَ', letters: ['نَ', 'ا', 'مَ'], emoji: '😴' },
  { id: 16, word: 'صَحَا', letters: ['صَ', 'حَ', 'ا'], emoji: '🥱' },
  { id: 17, word: 'غَسَلَ', letters: ['غَ', 'سَ', 'لَ'], emoji: '🧼' },
  { id: 18, word: 'مَسَحَ', letters: ['مَ', 'سَ', 'حَ'], emoji: '🧽' },
  { id: 19, word: 'رَسَمَ', letters: ['رَ', 'سَ', 'مَ'], emoji: '🎨' },
  { id: 20, word: 'لَوَّنَ', letters: ['لَ', 'وَّ', 'نَ'], emoji: '🖍️' },
  { id: 21, word: 'قَفَزَ', letters: ['قَ', 'فَ', 'زَ'], emoji: '🦘' },
  { id: 22, word: 'سَبَحَ', letters: ['سَ', 'بَ', 'حَ'], emoji: '🏊' },
  { id: 23, word: 'طَارَ', letters: ['طَ', 'ا', 'رَ'], emoji: '🦅' },
  { id: 24, word: 'نَزَلَ', letters: ['نَ', 'زَ', 'لَ'], emoji: '⬇️' },
  { id: 25, word: 'صَعِدَ', letters: ['صَ', 'عِ', 'دَ'], emoji: '🧗' },
  { id: 26, word: 'شَاهَدَ', letters: ['شَ', 'ا', 'هَ', 'دَ'], emoji: '📺' },
  { id: 27, word: 'سَأَلَ', letters: ['سَ', 'أَ', 'لَ'], emoji: '❓' },
  { id: 28, word: 'عَرَفَ', letters: ['عَ', 'رَ', 'فَ'], emoji: '💡' },
  { id: 29, word: 'فَهِمَ', letters: ['فَ', 'هِ', 'مَ'], emoji: '🧠' },
  { id: 30, word: 'حَفِظَ', letters: ['حَ', 'فِ', 'ظَ'], emoji: '💾' },
  { id: 31, word: 'نَسِيَ', letters: ['نَ', 'سِ', 'يَ'], emoji: '🤷' },
  { id: 32, word: 'طَبَخَ', letters: ['طَ', 'بَ', 'خَ'], emoji: '🍳' },
  { id: 33, word: 'أَخَذَ', letters: ['أَ', 'خَ', 'ذَ'], emoji: '🤲' },
  { id: 34, word: 'أَعْطَى', letters: ['أَ', 'عْ', 'طَ', 'ى'], emoji: '🎁' },
  { id: 35, word: 'حَمَلَ', letters: ['حَ', 'مَ', 'لَ'], emoji: '📦' },
  { id: 36, word: 'وَضَعَ', letters: ['وَ', 'ضَ', 'عَ'], emoji: '🔽' },
  { id: 37, word: 'شَكَرَ', letters: ['شَ', 'كَ', 'رَ'], emoji: '🙏' },
  { id: 38, word: 'غَضِبَ', letters: ['غَ', 'ضِ', 'بَ'], emoji: '😡' },
  { id: 39, word: 'فَرِحَ', letters: ['فَ', 'رِ', 'حَ'], emoji: '😊' },
  { id: 40, word: 'حَزِنَ', letters: ['حَ', 'زِ', 'نَ'], emoji: '😞' },
  { id: 41, word: 'لَبِسَ', letters: ['لَ', 'بِ', 'سَ'], emoji: '👕' },
  { id: 42, word: 'خَلَعَ', letters: ['خَ', 'لَ', 'عَ'], emoji: '👕❌' },
  { id: 43, word: 'نَظَّفَ', letters: ['نَ', 'ظَّ', 'فَ'], emoji: '🧹' },
  { id: 44, word: 'كَنَسَ', letters: ['كَ', 'نَ', 'سَ'], emoji: '🧹' },
  { id: 45, word: 'غَرَسَ', letters: ['غَ', 'رَ', 'سَ'], emoji: '🌱' },
  { id: 46, word: 'قَطَفَ', letters: ['قَ', 'طَ', 'فَ'], emoji: '🌸' },
  { id: 47, word: 'بَنَى', letters: ['بَ', 'نَ', 'ى'], emoji: '🧱' },
  { id: 48, word: 'هَدَمَ', letters: ['هَ', 'دَ', 'مَ'], emoji: '🏚️' },
  { id: 49, word: 'ضَرَبَ', letters: ['ضَ', 'رَ', 'بَ'], emoji: '🥊' },
  { id: 50, word: 'هَرَبَ', letters: ['هَ', 'رَ', 'بَ'], emoji: '🏃‍♂️💨' },
  { id: 51, word: 'رَبَطَ', letters: ['رَ', 'بَ', 'طَ'], emoji: '🎀' },
  { id: 52, word: 'حَصَدَ', letters: ['حَ', 'صَ', 'دَ'], emoji: '🌾' },
  { id: 53, word: 'طَلَبَ', letters: ['طَ', 'لَ', 'بَ'], emoji: '🙋' },
  { id: 54, word: 'كَسَرَ', letters: ['كَ', 'سَ', 'رَ'], emoji: '🔨' },
  { id: 55, word: 'صَنَعَ', letters: ['صَ', 'نَ', 'عَ'], emoji: '🛠️' },
  { id: 56, word: 'بَحَثَ', letters: ['بَ', 'حَ', 'ثَ'], emoji: '🔍' },
  { id: 57, word: 'طَرَقَ', letters: ['طَ', 'رَ', 'قَ'], emoji: '🚪' },
  { id: 58, word: 'صَرَخَ', letters: ['صَ', 'رَ', 'خَ'], emoji: '😱' },
  { id: 59, word: 'بَدَأَ', letters: ['بَ', 'دَ', 'أَ'], emoji: '🏁' },
  { id: 60, word: 'خَتَمَ', letters: ['خَ', 'تَ', 'مَ'], emoji: '📜' },
];

const EN_RANDOM_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const EN_WORD_BANK = [
  { id: 101, word: 'cat', letters: ['c', 'a', 't'], emoji: '🐱' },
  { id: 102, word: 'dog', letters: ['d', 'o', 'g'], emoji: '🐶' },
  { id: 103, word: 'sun', letters: ['s', 'u', 'n'], emoji: '☀️' },
  { id: 104, word: 'car', letters: ['c', 'a', 'r'], emoji: '🚗' },
  { id: 105, word: 'hat', letters: ['h', 'a', 't'], emoji: '🎩' },
  { id: 106, word: 'pen', letters: ['p', 'e', 'n'], emoji: '🖊️' },
  { id: 107, word: 'bed', letters: ['b', 'e', 'd'], emoji: '🛏️' },
  { id: 108, word: 'cup', letters: ['c', 'u', 'p'], emoji: '☕' },
  { id: 109, word: 'box', letters: ['b', 'o', 'x'], emoji: '📦' },
  { id: 110, word: 'key', letters: ['k', 'e', 'y'], emoji: '🔑' },
  { id: 111, word: 'book', letters: ['b', 'o', 'o', 'k'], emoji: '📖' },
  { id: 112, word: 'tree', letters: ['t', 'r', 'e', 'e'], emoji: '🌳' },
  { id: 113, word: 'fish', letters: ['f', 'i', 's', 'h'], emoji: '🐟' },
  { id: 114, word: 'bird', letters: ['b', 'i', 'r', 'd'], emoji: '🐦' },
  { id: 115, word: 'star', letters: ['s', 't', 'a', 'r'], emoji: '⭐' },
  { id: 116, word: 'moon', letters: ['m', 'o', 'o', 'n'], emoji: '🌙' },
  { id: 117, word: 'apple', letters: ['a', 'p', 'p', 'l', 'e'], emoji: '🍎' },
  { id: 118, word: 'water', letters: ['w', 'a', 't', 'e', 'r'], emoji: '💧' },
  { id: 119, word: 'house', letters: ['h', 'o', 'u', 's', 'e'], emoji: '🏠' },
  { id: 120, word: 'train', letters: ['t', 'r', 'a', 'i', 'n'], emoji: '🚂' },
  { id: 121, word: 'ball', letters: ['b', 'a', 'l', 'l'], emoji: '⚽' },
  { id: 122, word: 'shoe', letters: ['s', 'h', 'o', 'e'], emoji: '👟' },
  { id: 123, word: 'door', letters: ['d', 'o', 'o', 'r'], emoji: '🚪' },
  { id: 124, word: 'time', letters: ['t', 'i', 'm', 'e'], emoji: '⌚' },
  { id: 125, word: 'play', letters: ['p', 'l', 'a', 'y'], emoji: '🎮' },
  { id: 126, word: 'work', letters: ['w', 'o', 'r', 'k'], emoji: '💼' },
  { id: 127, word: 'food', letters: ['f', 'o', 'o', 'd'], emoji: '🍲' },
  { id: 128, word: 'milk', letters: ['m', 'i', 'l', 'k'], emoji: '🥛' },
  { id: 129, word: 'cake', letters: ['c', 'a', 'k', 'e'], emoji: '🍰' },
  { id: 130, word: 'fire', letters: ['f', 'i', 'r', 'e'], emoji: '🔥' },
  { id: 131, word: 'snow', letters: ['s', 'n', 'o', 'w'], emoji: '❄️' },
  { id: 132, word: 'rain', letters: ['r', 'a', 'i', 'n'], emoji: '🌧️' },
  { id: 133, word: 'wind', letters: ['w', 'i', 'n', 'd'], emoji: '🌬️' },
  { id: 134, word: 'road', letters: ['r', 'o', 'a', 'd'], emoji: '🛣️' },
  { id: 135, word: 'hand', letters: ['h', 'a', 'n', 'd'], emoji: '✋' },
  { id: 136, word: 'face', letters: ['f', 'a', 'c', 'e'], emoji: '😃' },
  { id: 137, word: 'hair', letters: ['h', 'a', 'i', 'r'], emoji: '💇' },
  { id: 138, word: 'nose', letters: ['n', 'o', 's', 'e'], emoji: '👃' },
  { id: 139, word: 'ears', letters: ['e', 'a', 'r', 's'], emoji: '👂' },
  { id: 140, word: 'eyes', letters: ['e', 'y', 'e', 's'], emoji: '👀' },
  { id: 141, word: 'king', letters: ['k', 'i', 'n', 'g'], emoji: '👑' },
  { id: 142, word: 'queen', letters: ['q', 'u', 'e', 'e', 'n'], emoji: '👸' },
  { id: 143, word: 'baby', letters: ['b', 'a', 'b', 'y'], emoji: '👶' },
  { id: 144, word: 'girl', letters: ['g', 'i', 'r', 'l'], emoji: '👧' },
  { id: 145, word: 'boy', letters: ['b', 'o', 'y'], emoji: '👦' },
  { id: 146, word: 'duck', letters: ['d', 'u', 'c', 'k'], emoji: '🦆' },
  { id: 147, word: 'bear', letters: ['b', 'e', 'a', 'r'], emoji: '🐻' },
  { id: 148, word: 'lion', letters: ['l', 'i', 'o', 'n'], emoji: '🦁' },
  { id: 149, word: 'tiger', letters: ['t', 'i', 'g', 'e', 'r'], emoji: '🐯' },
  { id: 150, word: 'frog', letters: ['f', 'r', 'o', 'g'], emoji: '🐸' },
  { id: 151, word: 'ant', letters: ['a', 'n', 't'], emoji: '🐜' },
  { id: 152, word: 'bee', letters: ['b', 'e', 'e'], emoji: '🐝' },
  { id: 153, word: 'desk', letters: ['d', 'e', 's', 'k'], emoji: '🪑' },
  { id: 154, word: 'bag', letters: ['b', 'a', 'g'], emoji: '🎒' },
  { id: 155, word: 'ship', letters: ['s', 'h', 'i', 'p'], emoji: '🚢' },
  { id: 156, word: 'boat', letters: ['b', 'o', 'a', 't'], emoji: '⛵' },
  { id: 157, word: 'blue', letters: ['b', 'l', 'u', 'e'], emoji: '🔵' },
  { id: 158, word: 'red', letters: ['r', 'e', 'd'], emoji: '🔴' },
  { id: 159, word: 'pink', letters: ['p', 'i', 'n', 'k'], emoji: '🎀' },
  { id: 160, word: 'gold', letters: ['g', 'o', 'l', 'd'], emoji: '🪙' }
];

export default function WordBuilderOverlay({ isActive, onClose, isStudent = false, channel }) {
  if (!isActive) return null;

  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'won'
  const [selectedWord, setSelectedWord] = useState(null);
  const [language, setLanguage] = useState('ar');


  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [options, setOptions] = useState([]);
  
  const [audioEnabled, setAudioEnabled] = useState(true);
  const canvasRef = useRef(null);

  const broadcastGame = (action, data) => {
    if (!channel) return;
    channel.send({ type: 'broadcast', event: 'WORD_BUILDER_SYNC', payload: { action, ...data } });
  };

  useEffect(() => {
    if (!channel) return;
    const sub = channel.on('broadcast', { event: 'WORD_BUILDER_SYNC' }, ({ payload }) => {
      if (payload.action === 'click_letter' && !isStudent) {
        handleLetterClick(payload.option, payload.index);
      }
      if (payload.action === 'state_update') {
        setGameState(payload.gameState);
        setSelectedWord(payload.selectedWord);
        setCurrentLetterIndex(payload.currentLetterIndex);
        setOptions(payload.options);
        setLanguage(payload.language);
      }
    });
    return () => {};
  }, [channel]);

  useEffect(() => {
    if (isStudent || !channel) return;
    broadcastGame('state_update', { gameState, selectedWord, currentLetterIndex, options, language });
  }, [gameState, selectedWord, currentLetterIndex, options, language, channel, isStudent]);


  useEffect(() => {
    if (!isActive) {
      setGameState('menu');
      setSelectedWord(null);
    }
  }, [isActive]);

  const startGame = (wordObj) => {
    setSelectedWord(wordObj);
    setCurrentLetterIndex(0);
    
    // Generate 15 options
    let newOptions = [...wordObj.letters];
    const lettersPool = language === 'en' ? EN_RANDOM_LETTERS : RANDOM_LETTERS;
    while (newOptions.length < 15) {
      const randomChar = lettersPool[Math.floor(Math.random() * lettersPool.length)];
      if (!newOptions.includes(randomChar)) {
        newOptions.push(randomChar);
      }
    }
    // Shuffle
    newOptions = newOptions.sort(() => Math.random() - 0.5);
    setOptions(newOptions.map((char, i) => ({ id: i, char, status: 'idle' })));
    setGameState('playing');
  };

  const handleLetterClick = (option, index) => {
    if (isStudent) {
      broadcastGame('click_letter', { option, index });
      return;
    }
    if (gameState !== 'playing' || option.status === 'correct') return;

    const correctLetter = selectedWord.letters[currentLetterIndex];

    if (option.char === correctLetter) {
      if (audioEnabled) {
        speakWhenReady(option.char, language === 'en' ? 'US English Female' : 'Arabic Male');
      }

      setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, status: 'correct' } : opt));
      setCurrentLetterIndex(prev => prev + 1);

      if (currentLetterIndex + 1 === selectedWord.letters.length) {
        if (audioEnabled) {
          setTimeout(() => {
            speakWhenReady(selectedWord.word, language === 'en' ? 'US English Female' : 'Arabic Male');
          }, 800);
        }
        setGameState('won');
        if (canvasRef.current) {
          renderCheerOnCanvas(canvasRef.current, 'confetti_rain');
        }
      }
    } else {
      if (audioEnabled) {
        const errorAudio = new Audio('/sounds/error.mp3');
        errorAudio.play().catch(e => console.log('Audio play failed:', e));
      }
      setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, status: 'wrong' } : opt));
      setTimeout(() => {
        setOptions(prev => prev.map((opt, i) => (i === index && opt.status === 'wrong') ? { ...opt, status: 'idle' } : opt));
      }, 500);
    }
  };

  
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100000,
      backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column',
      fontFamily: 'Tajawal, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        height: '60px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isStudent && <button onClick={onClose} style={{
            background: '#fee2e2', border: 'none', width: '36px', height: '36px',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#ef4444'
          }}>
            <X size={20} />
          </button>}
          {!isStudent && gameState !== 'menu' && (
            <button onClick={() => setGameState('menu')} style={{
              background: '#e0e7ff', border: 'none', padding: '8px 15px',
              borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px',
              cursor: 'pointer', color: '#4338ca', fontWeight: 'bold'
            }}>
              <ArrowRight size={18} />
              العودة للقائمة
            </button>
          )}
        </div>
        
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem', fontWeight: '900' }}>🧩 تجميع الكلمات</h2>
        
        <button onClick={() => setAudioEnabled(!audioEnabled)} style={{
          background: audioEnabled ? '#dcfce7' : '#fee2e2', border: 'none', width: '36px', height: '36px',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: audioEnabled ? '#16a34a' : '#ef4444'
        }}>
          {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', position: 'relative' }}>
        
        {/* Confetti Canvas */}
        
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100, width: '100%', height: '100%' }} />

        {gameState === 'menu' && !isStudent && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#334155', fontWeight: '800' }}>اختر الكلمة للبدء</h3>
              <p style={{ color: '#64748b', marginBottom: '15px' }}>60 كلمة تفاعلية لكل لغة للتدريب على النطق والإملاء</p>
              <div style={{ display: 'flex', gap: '10px', background: '#f1f5f9', padding: '5px', borderRadius: '12px' }}>
                <button 
                  onClick={() => setLanguage('ar')}
                  style={{ padding: '8px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', background: language === 'ar' ? '#3b82f6' : 'transparent', color: language === 'ar' ? 'white' : '#64748b', transition: 'all 0.2s' }}
                >
                  عربي
                </button>
                <button 
                  onClick={() => setLanguage('en')}
                  style={{ padding: '8px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', background: language === 'en' ? '#3b82f6' : 'transparent', color: language === 'en' ? 'white' : '#64748b', transition: 'all 0.2s' }}
                >
                  English
                </button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px' }}>
              {(language === 'en' ? EN_WORD_BANK : WORD_BANK).map((w) => (
                <button
                  key={w.id}
                  onClick={() => startGame(w)}
                  style={{
                    background: '#fff', border: '2px solid #e2e8f0', borderRadius: '15px',
                    padding: '15px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '10px', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none'; }}
                >
                  <span style={{ fontSize: '2.5rem' }}>{w.emoji}</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#1e293b' }}>{w.word}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'won') && selectedWord && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '800px', margin: '0 auto', height: '100%', justifyContent: 'center' }}>
            
            {/* Image / Emoji */}
            <div style={{ fontSize: '6rem', marginBottom: '10px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
              {selectedWord.emoji}
            </div>

            {/* Ghost Word */}
            <div style={{
              marginBottom: '20px', direction: language === 'en' ? 'ltr' : 'rtl',
              fontSize: '4.5rem', fontWeight: '900'
            }}>
              {selectedWord.letters.map((letter, idx) => (
                <span key={idx} style={{
                  color: idx < currentLetterIndex ? '#10b981' : '#cbd5e1',
                  transition: 'color 0.3s ease',
                  textShadow: idx < currentLetterIndex ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none'
                }}>
                  {letter}
                </span>
              ))}
            </div>

            {/* Empty Slots */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', direction: language === 'en' ? 'ltr' : 'rtl' }}>
              {selectedWord.letters.map((letter, idx) => {
                const isFilled = idx < currentLetterIndex;
  return (
                  <div key={idx} style={{
                    width: '70px', height: '80px',
                    border: isFilled ? '3px solid #10b981' : '3px dashed #94a3b8',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', fontWeight: '900', color: '#10b981',
                    background: isFilled ? '#ecfdf5' : 'transparent',
                    boxShadow: isFilled ? '0 10px 15px -3px rgba(16, 185, 129, 0.2)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {isFilled ? letter : ''}
                  </div>
                );
              })}
            </div>

            {/* Keyboard Options */}
            {gameState === 'playing' || isStudent ? (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px',
                background: '#fff', padding: '25px', borderRadius: '20px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.05)', direction: language === 'en' ? 'ltr' : 'rtl'
              }}>
                {options.map((opt, idx) => {
                  const isWrong = opt.status === 'wrong';
                  const isCorrect = opt.status === 'correct';
  return (
                    <button
                      key={opt.id}
                      onClick={() => handleLetterClick(opt, idx)}
                      style={{
                        width: '65px', height: '65px',
                        fontSize: '1.8rem', fontWeight: 'bold',
                        border: 'none', borderRadius: '12px',
                        cursor: isCorrect ? 'default' : 'pointer',
                        background: isCorrect ? '#f1f5f9' : isWrong ? '#fee2e2' : '#eff6ff',
                        color: isCorrect ? '#cbd5e1' : isWrong ? '#ef4444' : '#1e3a8a',
                        boxShadow: isCorrect ? 'none' : '0 4px 6px rgba(0,0,0,0.05)',
                        transform: isWrong ? 'translate(2px, 0)' : 'none',
                        transition: 'all 0.1s'
                      }}
                      onMouseOver={(e) => { if (!isCorrect && !isWrong) e.currentTarget.style.transform = 'scale(1.05)'; }}
                      onMouseOut={(e) => { if (!isCorrect && !isWrong) e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      {opt.char}
                    </button>
                  );
                })}
              </div>
            ) : null}
            
            {/* Play Again Button - Teacher Only */}
            {gameState === 'won' && !isStudent && (
              <button
                onClick={() => setGameState('menu')}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: '#fff', border: 'none', borderRadius: '30px',
                  padding: '15px 40px', fontSize: '1.5rem', fontWeight: 'bold',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                  boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)',
                  marginTop: '20px'
                }}
              >
                <RefreshCcw size={24} />
                العب كلمة أخرى
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* CSS Animation for Shake */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-5deg); }
          50% { transform: translateX(5px) rotate(5deg); }
          75% { transform: translateX(-5px) rotate(-5deg); }
        }
      `}} />
    </div>
  );
}

