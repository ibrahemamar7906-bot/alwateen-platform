const fs = require('fs');
const path = 'e:/منصة الوتين/app/teacher-assistant/whiteboard/WhiteboardComponent.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
content = content.replace(
  "import { fabric } from 'fabric'",
  "import { fabric } from 'fabric'\nimport { Pen, MousePointer2, Eraser, Highlighter, Square, Circle, Triangle, Minus, ArrowRight, Type, Image as ImageIcon, Video, StickyNote, Undo2, Redo2, Download, Trash2, FolderOpen, Save, Settings2, Maximize, X, ChevronRight, ChevronLeft, Hand, Laser, Sparkles } from 'lucide-react'"
);

// 2. Add isSettingsOpen
content = content.replace(
  "const [mathInput, setMathInput] = useState('')",
  "const [mathInput, setMathInput] = useState('')\n  const [isSettingsOpen, setIsSettingsOpen] = useState(false)"
);

// 3. Add Sticky Note and SVGs before addText
const stickyNotesCode = `
  const addStickyNote = (noteColor) => {
    if (!canvas) return;
    const text = new fabric.Textbox('ملاحظة...', {
      ...getCenter(), width: 200, fontSize: 24, fontFamily: 'Tajawal', fill: '#1e293b', backgroundColor: noteColor, textAlign: 'center', originX: 'center', originY: 'center', shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.1)', blur: 8, offsetX: 2, offsetY: 2 })
    });
    canvas.add(text); canvas.setActiveObject(text); setTool('select'); setIsLibraryOpen(false);
  }

  const addMicroscope = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="' + colorRef.current + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true });
      canvas.add(obj); setTool('select'); setIsLibraryOpen(false);
    });
  }

  const addFlask = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="' + colorRef.current + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true });
      canvas.add(obj); setTool('select'); setIsLibraryOpen(false);
    });
  }

  const addBook = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="' + colorRef.current + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true });
      canvas.add(obj); setTool('select'); setIsLibraryOpen(false);
    });
  }

  const addGradCap = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="' + colorRef.current + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true });
      canvas.add(obj); setTool('select'); setIsLibraryOpen(false);
    });
  }

  const addText = () => {
`;
content = content.replace("  const addText = () => {", stickyNotesCode);

// 4. Replace the return statement
const returnIndex = content.indexOf("  return (\n    <div className={styles.container}>");

const newUI = fs.readFileSync('e:/منصة الوتين/ui.txt', 'utf8');

content = content.slice(0, returnIndex) + newUI;
fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated WhiteboardComponent.js');
