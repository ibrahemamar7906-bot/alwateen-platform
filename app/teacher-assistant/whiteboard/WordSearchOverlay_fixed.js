import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Search, RefreshCw, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WordSearchOverlay({ isActive, onClose, isStudent = false, channel }) {
  if (!isActive) return null;

  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState(['مدرسة', 'طالب', 'علم', 'قلم', 'كتاب']);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const gridSize = 10;
  const letters = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي';

  const broadcastGame = (action, data) => {
    if (!channel) return;
    channel.send({ type: 'broadcast', event: 'WORD_SEARCH_SYNC', payload: { action, ...data } });
  };

  useEffect(() => {
    if (!channel) return;
    const sub = channel.on('broadcast', { event: 'WORD_SEARCH_SYNC' }, ({ payload }) => {
      if (payload.action === 'cell_down' && !isStudent) {
        handleCellDown(payload.r, payload.c, true);
      }
      if (payload.action === 'cell_enter' && !isStudent) {
        handleCellEnter(payload.r, payload.c, true);
      }
      if (payload.action === 'cell_up' && !isStudent) {
        handleCellUp(true);
      }
      if (payload.action === 'state_update') {
        setGrid(payload.grid);
        setWords(payload.words);
        setFoundWords(payload.foundWords);
        setSelectedCells(payload.selectedCells);
      }
    });
    return () => {};
  }, [channel]);

  useEffect(() => {
    if (isStudent || !channel) return;
    broadcastGame('state_update', { grid, words, foundWords, selectedCells });
  }, [grid, words, foundWords, selectedCells, channel, isStudent]);


  const generateGrid = () => {
    let newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    // Simplified placement for demo
    let currentWords = [...words];
    
    currentWords.forEach(word => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 50) {
        let dir = Math.floor(Math.random() * 2); // 0: horiz, 1: vert
        let row = Math.floor(Math.random() * gridSize);
        let col = Math.floor(Math.random() * gridSize);
        
        if (dir === 0 && col + word.length <= gridSize) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (newGrid[row][col + i] !== '' && newGrid[row][col + i] !== word[i]) { canPlace = false; break; }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) newGrid[row][col + i] = word[i];
            placed = true;
          }
        } else if (dir === 1 && row + word.length <= gridSize) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (newGrid[row + i][col] !== '' && newGrid[row + i][col] !== word[i]) { canPlace = false; break; }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) newGrid[row + i][col] = word[i];
            placed = true;
          }
        }
        attempts++;
      }
    });

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (newGrid[r][c] === '') {
          newGrid[r][c] = letters.charAt(Math.floor(Math.random() * letters.length));
        }
      }
    }
    setGrid(newGrid);
    setFoundWords([]);
    setSelectedCells([]);
  };

  useEffect(() => {
    if (isActive && !isStudent) {
      generateGrid();
    }
  }, [isActive]);

  const handleCellDown = (r, c, fromSync = false) => {
    if (isStudent && !fromSync) {
      broadcastGame('cell_down', { r, c });
      return;
    }
    if (isStudent) return;
    setIsDragging(true);
    setSelectedCells([{r, c}]);
  };

  const handleCellEnter = (r, c, fromSync = false) => {
    if (isStudent && !fromSync) {
      broadcastGame('cell_enter', { r, c });
      return;
    }
    if (isStudent || !isDragging) return;
    if (!selectedCells.find(cell => cell.r === r && cell.c === c)) {
      setSelectedCells([...selectedCells, {r, c}]);
    }
  };

  const handleCellUp = (fromSync = false) => {
    if (isStudent && !fromSync) {
      broadcastGame('cell_up', {});
      return;
    }
    if (isStudent) return;
    setIsDragging(false);
    
    // Check if selected cells form a word
    const selectedWord = selectedCells.map(cell => grid[cell.r][cell.c]).join('');
    const reversedWord = selectedWord.split('').reverse().join('');
    
    let matchedWord = null;
    if (words.includes(selectedWord)) matchedWord = selectedWord;
    else if (words.includes(reversedWord)) matchedWord = reversedWord;

    if (matchedWord && !foundWords.includes(matchedWord)) {
      const newFound = [...foundWords, matchedWord];
      setFoundWords(newFound);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      
      if (newFound.length === words.length) {
        setTimeout(() => confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } }), 500);
      }
    }
    setSelectedCells([]);
  };
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.95)', zIndex: 40,
      display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal', direction: 'rtl'
    }} onMouseUp={handleCellUp} onTouchEnd={handleCellUp}>
      <div style={{
        background: '#f8fafc', borderRadius: '20px', width: '90%', maxWidth: '800px',
        padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative', maxHeight: '95%', overflowY: 'auto'
      }}>
        {!isStudent && <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px', background: '#fee2e2', border: 'none', 
          cursor: 'pointer', color: '#ef4444', borderRadius: '50%', padding: '8px', display: 'flex'
        }}>
          <X size={24} />
        </button>}
        <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '30px', fontSize: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
          <Search size={32} color="#3b82f6" /> لعبة البحث عن الكلمات
        </h2>

        <div style={{ display: 'flex', gap: '30px', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Word List */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {words.map(w => (
              <div key={w} style={{
                padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.2rem',
                background: foundWords.includes(w) ? '#10b981' : '#e2e8f0',
                color: foundWords.includes(w) ? 'white' : '#475569',
                transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                {foundWords.includes(w) && <Star size={18} fill="white" />} {w}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gap: '5px',
            background: 'white', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }} onMouseLeave={handleCellUp}>
            {grid.map((row, r) => row.map((cell, c) => {
              const isSelected = selectedCells.some(sc => sc.r === r && sc.c === c);
              return (
                <div key={`${r}-${c}`}
                  onMouseDown={() => handleCellDown(r, c)}
                  onMouseEnter={() => handleCellEnter(r, c)}
                  onTouchStart={() => handleCellDown(r, c)}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    const target = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (target && target.dataset.r) {
                      handleCellEnter(parseInt(target.dataset.r), parseInt(target.dataset.c));
                    }
                  }}
                  data-r={r} data-c={c}
                  style={{
                    width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', fontWeight: 'bold', borderRadius: '8px', cursor: isStudent ? 'default' : 'pointer',
                    background: isSelected ? '#3b82f6' : '#f1f5f9',
                    color: isSelected ? 'white' : '#1e293b',
                    userSelect: 'none', transition: 'all 0.1s'
                  }}
                >
                  {cell}
                </div>
              );
            }))}
          </div>

          {!isStudent && (
            <button onClick={generateGrid} style={{
              background: '#3b82f6', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '10px',
              fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
              marginTop: '10px'
            }}>
              <RefreshCw size={20} /> لعبة جديدة
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
