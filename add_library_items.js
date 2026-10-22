const fs = require('fs');
const path = 'e:/منصة الوتين/app/teacher-assistant/whiteboard/WhiteboardComponent.js';
let content = fs.readFileSync(path, 'utf8');

const newFunctions = `
  const addAtom = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="' + colorRef.current + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(45 12 12)"/><ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-45 12 12)"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true });
      canvas.add(obj); setTool('select'); setIsLibraryOpen(false);
    });
  }

  const addTelescope = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="' + colorRef.current + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"/><path d="m13.56 11.747 4.332-.924"/><path d="m16 21-3.105-6.21"/><path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"/><path d="m6.158 8.633 1.114 4.456"/><path d="m8 21 3.105-6.21"/><circle cx="12" cy="13" r="2"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true });
      canvas.add(obj); setTool('select'); setIsLibraryOpen(false);
    });
  }

  const addPalette = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="' + colorRef.current + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="' + colorRef.current + '"/><circle cx="17.5" cy="10.5" r=".5" fill="' + colorRef.current + '"/><circle cx="8.5" cy="7.5" r=".5" fill="' + colorRef.current + '"/><circle cx="6.5" cy="12.5" r=".5" fill="' + colorRef.current + '"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true });
      canvas.add(obj); setTool('select'); setIsLibraryOpen(false);
    });
  }

  const addGlobe = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="' + colorRef.current + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true });
      canvas.add(obj); setTool('select'); setIsLibraryOpen(false);
    });
  }

  const addMusicNote = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="' + colorRef.current + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true });
      canvas.add(obj); setTool('select'); setIsLibraryOpen(false);
    });
  }

  const addThumbsUp = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="' + colorRef.current + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true });
      canvas.add(obj); setTool('select'); setIsLibraryOpen(false);
    });
  }

  const addTrophy = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="' + colorRef.current + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true });
      canvas.add(obj); setTool('select'); setIsLibraryOpen(false);
    });
  }

  const addMedal = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="' + colorRef.current + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><polyline points="12 18 10.5 16.5 12 15 13.5 16.5 12 18"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true });
      canvas.add(obj); setTool('select'); setIsLibraryOpen(false);
    });
  }

  const addSadFace = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="' + colorRef.current + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true });
      canvas.add(obj); setTool('select'); setIsLibraryOpen(false);
    });
  }

`;

content = content.replace("  const addText = () => {", newFunctions + "\n  const addText = () => {");

const uiEdu = `
                <button className={styles.libraryItem} onClick={addAtom} title="ذرة">⚛️<span>فيزياء</span></button>
                <button className={styles.libraryItem} onClick={addTelescope} title="تلسكوب">🔭<span>فضاء</span></button>
                <button className={styles.libraryItem} onClick={addGlobe} title="كرة أرضية">🌍<span>جغرافيا</span></button>
                <button className={styles.libraryItem} onClick={addPalette} title="ألوان">🎨<span>رسم</span></button>
                <button className={styles.libraryItem} onClick={addMusicNote} title="موسيقى">🎵<span>موسيقى</span></button>
`;
content = content.replace('<button className={styles.libraryItem} onClick={addGradCap} title="تخرج">🎓<span>نجاح</span></button>', '<button className={styles.libraryItem} onClick={addGradCap} title="تخرج">🎓<span>نجاح</span></button>\n' + uiEdu);

const uiStickers = `
                <button className={styles.libraryItem} onClick={addThumbsUp} title="إعجاب">👍<span>ممتاز</span></button>
                <button className={styles.libraryItem} onClick={addTrophy} title="كأس">🏆<span>بطل</span></button>
                <button className={styles.libraryItem} onClick={addMedal} title="ميدالية">🏅<span>أول</span></button>
                <button className={styles.libraryItem} onClick={addSadFace} title="حزين">🙁<span>حزين</span></button>
`;
content = content.replace('<button className={styles.libraryItem} onClick={() => { addLightbulb(); setIsLibraryOpen(false); }} title="فكرة">💡<span>فكرة</span></button>', '<button className={styles.libraryItem} onClick={() => { addLightbulb(); setIsLibraryOpen(false); }} title="فكرة">💡<span>فكرة</span></button>\n' + uiStickers);

const uiAdvanced = `
                <button className={styles.libraryItem} onClick={() => { if(typeof addSpeechBubble === 'function') addSpeechBubble(); else { addRect(); }; setIsLibraryOpen(false); }} title="محادثة">💬<span>محادثة</span></button>
`;
content = content.replace('<button className={styles.libraryItem} onClick={() => { addCloud(); setIsLibraryOpen(false); }} title="سحابة">💭<span>سحابة</span></button>', '<button className={styles.libraryItem} onClick={() => { addCloud(); setIsLibraryOpen(false); }} title="سحابة">💭<span>سحابة</span></button>\n' + uiAdvanced);

fs.writeFileSync(path, content, 'utf8');
console.log('Added more library items successfully.');
