'use client'

import { useRef, useState, useEffect } from 'react'
import { fabric } from 'fabric'

if (typeof window !== 'undefined') {
  window.fabric = fabric;
}

// Custom Classes for Flashcards and MindMaps
fabric.FlashcardText = fabric.util.createClass(fabric.Textbox, {
  type: 'flashcardText',
  initialize: function(text, options) {
    options = options || {};
    this.callSuper('initialize', text, options);
    this.set({
      isFlashcard: true, backgroundColor: 'rgba(0,0,0,0.01)',
      frontText: options.frontText || text,
      backText: options.backText || 'إعدادات',
      isShowingFront: true,
      cardColor: options.cardColor || '#8b5cf6',
      backColor: options.backColor || '#f59e0b',
      rx: 15, ry: 15, padding: 20
    });
  },
  _renderBackground: function(ctx) {
    if (!this.backgroundColor && !this.cardColor) return;
    var w = this.width + this.padding * 2, h = this.height + this.padding * 2;
    var x = -this.width/2 - this.padding, y = -this.height/2 - this.padding;
    var rx = this.rx, ry = this.ry;
    ctx.beginPath();
    ctx.moveTo(x + rx, y);
    ctx.lineTo(x + w - rx, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + ry);
    ctx.lineTo(x + w, y + h - ry);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rx, y + h);
    ctx.lineTo(x + rx, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - ry);
    ctx.lineTo(x, y + ry);
    ctx.quadraticCurveTo(x, y, x + rx, y);
    ctx.closePath();
    ctx.fillStyle = this.isShowingFront ? this.cardColor : this.backColor;
    ctx.fill();
  },
  toObject: function() {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      isFlashcard: this.isFlashcard, frontText: this.frontText, backText: this.backText,
      isShowingFront: this.isShowingFront, cardColor: this.cardColor, backColor: this.backColor,
      rx: this.rx, ry: this.ry, padding: this.padding
    });
  }
});
fabric.FlashcardText.fromObject = function(object, callback) {
  return fabric.Object._fromObject('FlashcardText', object, callback, 'text');
};

fabric.MindMapText = fabric.util.createClass(fabric.Textbox, {
  type: 'mindMapText',
  initialize: function(text, options) {
    options = options || {};
    this.callSuper('initialize', text, options);
    this.set({
      isMindMapNode: true, backgroundColor: 'rgba(0,0,0,0.01)',
      mindMapId: options.mindMapId || 'node_' + Math.random().toString(36).substring(2),
      nodeColor: options.nodeColor || '#3b82f6',
      theme: options.theme || 'classic',
      _connectedLines: [],
      rx: 10, ry: 10, padding: 15
    });
  },
  _renderBackground: function(ctx) {
    var color = this.nodeColor || '#3b82f6';
    var widthVal = this.width || 160;
    var heightVal = this.height || 40;
    var w = widthVal + this.padding * 2, h = heightVal + this.padding * 2;
    var x = -widthVal/2 - this.padding, y = -heightVal/2 - this.padding;
    var theme = this.theme || 'classic';

    ctx.save();

    if (theme === 'classic') {
      var rx = this.rx; var ry = this.ry;
      ctx.beginPath(); ctx.moveTo(x+rx,y); ctx.lineTo(x+w-rx,y); ctx.quadraticCurveTo(x+w,y,x+w,y+ry); ctx.lineTo(x+w,y+h-ry); ctx.quadraticCurveTo(x+w,y+h,x+w-rx,y+h); ctx.lineTo(x+rx,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-ry); ctx.lineTo(x,y+ry); ctx.quadraticCurveTo(x,y,x+rx,y); ctx.closePath();
      ctx.fillStyle = color; ctx.fill();

    } else if (theme === 'circle') {
      var rx2 = Math.min(w,h)/2;
      ctx.beginPath(); ctx.moveTo(x+rx2,y); ctx.lineTo(x+w-rx2,y); ctx.quadraticCurveTo(x+w,y,x+w,y+rx2); ctx.lineTo(x+w,y+h-rx2); ctx.quadraticCurveTo(x+w,y+h,x+w-rx2,y+h); ctx.lineTo(x+rx2,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-rx2); ctx.lineTo(x,y+rx2); ctx.quadraticCurveTo(x,y,x+rx2,y); ctx.closePath();
      ctx.fillStyle = color; ctx.fill();

    } else if (theme === 'outline') {
      var rx3 = this.rx;
      ctx.beginPath(); ctx.moveTo(x+rx3,y); ctx.lineTo(x+w-rx3,y); ctx.quadraticCurveTo(x+w,y,x+w,y+rx3); ctx.lineTo(x+w,y+h-rx3); ctx.quadraticCurveTo(x+w,y+h,x+w-rx3,y+h); ctx.lineTo(x+rx3,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-rx3); ctx.lineTo(x,y+rx3); ctx.quadraticCurveTo(x,y,x+rx3,y); ctx.closePath();
      ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.stroke(); ctx.fillStyle = '#ffffff'; ctx.fill();

    } else if (theme === 'minimal') {
      ctx.beginPath(); ctx.moveTo(x, y+h); ctx.lineTo(x+w, y+h); ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.stroke();

    } else if (theme === 'gradient') {
      var rx4 = this.rx;
      ctx.beginPath(); ctx.moveTo(x+rx4,y); ctx.lineTo(x+w-rx4,y); ctx.quadraticCurveTo(x+w,y,x+w,y+rx4); ctx.lineTo(x+w,y+h-rx4); ctx.quadraticCurveTo(x+w,y+h,x+w-rx4,y+h); ctx.lineTo(x+rx4,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-rx4); ctx.lineTo(x,y+rx4); ctx.quadraticCurveTo(x,y,x+rx4,y); ctx.closePath();
      var grad = ctx.createLinearGradient(x, y, x+w, y+h);
      grad.addColorStop(0, color); grad.addColorStop(1, '#ffffff22');
      ctx.fillStyle = grad; ctx.fill();

    } else if (theme === 'shadow') {
      ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 12; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 4;
      var rx5 = this.rx;
      ctx.beginPath(); ctx.moveTo(x+rx5,y); ctx.lineTo(x+w-rx5,y); ctx.quadraticCurveTo(x+w,y,x+w,y+rx5); ctx.lineTo(x+w,y+h-rx5); ctx.quadraticCurveTo(x+w,y+h,x+w-rx5,y+h); ctx.lineTo(x+rx5,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-rx5); ctx.lineTo(x,y+rx5); ctx.quadraticCurveTo(x,y,x+rx5,y); ctx.closePath();
      ctx.fillStyle = color; ctx.fill();

    } else if (theme === 'neon') {
      ctx.shadowColor = color; ctx.shadowBlur = 20;
      var rx6 = this.rx;
      ctx.beginPath(); ctx.moveTo(x+rx6,y); ctx.lineTo(x+w-rx6,y); ctx.quadraticCurveTo(x+w,y,x+w,y+rx6); ctx.lineTo(x+w,y+h-rx6); ctx.quadraticCurveTo(x+w,y+h,x+w-rx6,y+h); ctx.lineTo(x+rx6,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-rx6); ctx.lineTo(x,y+rx6); ctx.quadraticCurveTo(x,y,x+rx6,y); ctx.closePath();
      ctx.fillStyle = '#1e1e2e'; ctx.fill(); ctx.shadowBlur = 10; ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.stroke();

    } else if (theme === 'sticky') {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath(); ctx.moveTo(x,y+15); ctx.lineTo(x+w-15,y); ctx.lineTo(x+w,y+15); ctx.lineTo(x+w,y+h); ctx.lineTo(x,y+h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.moveTo(x+w-15,y); ctx.lineTo(x+w,y+15); ctx.lineTo(x+w-15,y+15); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 1; ctx.stroke();

    } else if (theme === 'diamond') {
      var cx = x+w/2, cy = y+h/2;
      ctx.beginPath(); ctx.moveTo(cx,y); ctx.lineTo(x+w,cy); ctx.lineTo(cx,y+h); ctx.lineTo(x,cy); ctx.closePath();
      ctx.fillStyle = color; ctx.fill();

    } else if (theme === 'hexagon') {
      var cx2 = x+w/2, cy2 = y+h/2, r = Math.min(w,h)/2;
      ctx.beginPath();
      for (var i=0; i<6; i++) {
        var angle = (Math.PI/3)*i - Math.PI/6;
        if (i===0) ctx.moveTo(cx2 + r*Math.cos(angle), cy2 + r*Math.sin(angle));
        else ctx.lineTo(cx2 + r*Math.cos(angle), cy2 + r*Math.sin(angle));
      }
      ctx.closePath(); ctx.fillStyle = color; ctx.fill();

    } else if (theme === 'wave') {
      ctx.beginPath(); ctx.moveTo(x+10,y);
      ctx.bezierCurveTo(x+w/4,y-8, x+3*w/4,y+8, x+w-10,y);
      ctx.quadraticCurveTo(x+w,y,x+w,y+10); ctx.lineTo(x+w,y+h-10);
      ctx.bezierCurveTo(x+3*w/4,y+h+8, x+w/4,y+h-8, x+10,y+h);
      ctx.quadraticCurveTo(x,y+h,x,y+h-10); ctx.lineTo(x,y+10); ctx.quadraticCurveTo(x,y,x+10,y); ctx.closePath();
      ctx.fillStyle = color; ctx.fill();

    } else if (theme === 'badge') {
      var cx3 = x+w/2;
      ctx.beginPath(); ctx.moveTo(x+8,y); ctx.lineTo(x+w-8,y); ctx.quadraticCurveTo(x+w,y,x+w,y+8); ctx.lineTo(x+w,y+h-12); ctx.lineTo(cx3,y+h); ctx.lineTo(x,y+h-12); ctx.lineTo(x,y+8); ctx.quadraticCurveTo(x,y,x+8,y); ctx.closePath();
      ctx.fillStyle = color; ctx.fill();

    } else {
      // Classic rounded rectangle fallback for all custom themes and colors
      var rxDef = this.rx || 10; var ryDef = this.ry || 10;
      ctx.beginPath(); ctx.moveTo(x+rxDef,y); ctx.lineTo(x+w-rxDef,y); ctx.quadraticCurveTo(x+w,y,x+w,y+ryDef); ctx.lineTo(x+w,y+h-ryDef); ctx.quadraticCurveTo(x+w,y+h,x+w-rxDef,y+h); ctx.lineTo(x+rxDef,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-ryDef); ctx.lineTo(x,y+ryDef); ctx.quadraticCurveTo(x,y,x+rxDef,y); ctx.closePath();
      ctx.fillStyle = color || '#3b82f6'; ctx.fill();
    }

    ctx.restore();
  },
  toObject: function() {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      isMindMapNode: this.isMindMapNode,
      mindMapId: this.mindMapId,
      nodeColor: this.nodeColor,
      theme: this.theme,
      rx: this.rx, ry: this.ry, padding: this.padding
    });
  }
});
fabric.MindMapText.fromObject = function(object, callback) {
  return fabric.Object._fromObject('MindMapText', object, callback, 'text');
};



import { Pen, Mic, MonitorPlay, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, MousePointer2, Eraser, Highlighter, Square, Circle, Triangle, Minus, ArrowRight, Type, Image as ImageIcon, Video, StickyNote, Undo2, Redo2, Download, Trash2, FolderOpen, Save, Settings2, Maximize, X, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Hand, Crosshair, Sparkles, Calculator as CalculatorIcon, Gamepad2, BookOpen, Volume2, Timer, EyeOff, Layers, BrainCircuit, Sigma, LineChart, Network, Brain, GitBranch, Ruler, FileQuestion, Dna, Hash, ClipboardPaste, Plus, PartyPopper, Camera, FileText, FlaskConical, Palette, Upload } from 'lucide-react'
import styles from './page.module.css'
import SpotlightOverlay from './SpotlightOverlay'
import TimerOverlay from './TimerOverlay'
import BlindOverlay from './BlindOverlay'
import MagnifierOverlay from './MagnifierOverlay'
import SpinWheelOverlay from './SpinWheelOverlay'
import QuranOrderGameOverlay from './QuranOrderGameOverlay'
import AIImageModal from './AIImageModal'
import WordBuilderOverlay from './WordBuilderOverlay'
import PeriodicTableOverlay from './PeriodicTableOverlay'
import ReadyPathwayOverlay from './ReadyPathwayOverlay'
import WordSearchOverlay from './WordSearchOverlay'
import BackgroundsLibraryModal from './BackgroundsLibraryModal'
import StickersLibraryModal from './StickersLibraryModal'
import ScienceLibraryModal from './ScienceLibraryModal'
import MemoryGameOverlay from './MemoryGameOverlay'
import QuranPlayerOverlay from './QuranPlayerOverlay'
import InteractiveMushafOverlay from './InteractiveMushafOverlay'
import GeometryToolsModal from './GeometryToolsModal'
import MathQuizOverlay from './MathQuizOverlay'
import FlashcardModal from './FlashcardModal'
import SmartImportModal from './SmartImportModal'

import MindMapImportModal from './MindMapImportModal'
import MindMapEditPanel from './MindMapEditPanel'
import MathEquationModal from './MathEquationModal'
import SmartGraphModal from './SmartGraphModal'
import HangmanOverlay from './HangmanOverlay'
import QuizShowOverlay from './QuizShowOverlay'
import Calculator from '../../components/Calculator'
import TeacherGameManagerModal from '../../components/TeacherGameManagerModal'

const DraggableVideo = ({ video, onClose }) => {
  const [pos, setPos] = useState({ 
    x: Math.max(10, Math.min(video.x, typeof window !== 'undefined' ? window.innerWidth - 320 : 20)), 
    y: Math.max(10, Math.min(video.y, typeof window !== 'undefined' ? window.innerHeight - 260 : 100)) 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    });
    try { e.target.setPointerCapture(e.pointerId); } catch(err) {}
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      setPos({
        x: Math.max(5, Math.min(e.clientX - offset.x, window.innerWidth - 100)),
        y: Math.max(5, Math.min(e.clientY - offset.y, window.innerHeight - 80))
      });
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try { e.target.releasePointerCapture(e.pointerId); } catch(err) {}
  };

  return (
    <div style={{
      position: 'absolute', left: pos.x, top: pos.y, 
      width: Math.min(400, typeof window !== 'undefined' ? window.innerWidth - 20 : 400), 
      height: 300,
      maxWidth: 'calc(100vw - 20px)',
      background: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 100,
      display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #cbd5e1'
    }}>
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          background: '#ef4444', color: '#fff', padding: '8px 15px', cursor: 'move', display: 'flex', justifyContent: 'space-between', alignItems: 'center', touchAction: 'none'
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>فيديو (YouTube)</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>&times;</button>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        {isDragging && <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}></div>}
        <iframe 
          width="100%" height="100%" 
          src={`https://www.youtube.com/embed/${video.videoId}`} 
          title="YouTube video" frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
        ></iframe>
      </div>
    </div>
  )
}

const DraggableIframe = ({ data, onClose }) => {
  const defaultW = Math.min(600, typeof window !== 'undefined' ? window.innerWidth - 24 : 600);
  const defaultH = Math.min(450, typeof window !== 'undefined' ? window.innerHeight - 80 : 450);
  const [pos, setPos] = useState({ 
    x: Math.max(10, Math.min(data.x, typeof window !== 'undefined' ? window.innerWidth - defaultW - 10 : 20)), 
    y: Math.max(10, Math.min(data.y, typeof window !== 'undefined' ? window.innerHeight - defaultH - 10 : 50)) 
  });
  const [size, setSize] = useState({ w: defaultW, h: defaultH });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  return (
    <div style={{
      position: 'absolute', left: pos.x, top: pos.y, width: size.w, height: size.h,
      maxWidth: 'calc(100vw - 16px)', maxHeight: 'calc(100vh - 40px)',
      background: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 100,
      display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #cbd5e1', resize: 'both'
    }}>
      <div 
        onPointerDown={(e) => { setIsDragging(true); setOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y }); try { e.target.setPointerCapture(e.pointerId); } catch(err) {} }}
        onPointerMove={(e) => { 
          if (isDragging) {
            setPos({ 
              x: Math.max(5, Math.min(e.clientX - offset.x, window.innerWidth - 100)), 
              y: Math.max(5, Math.min(e.clientY - offset.y, window.innerHeight - 80)) 
            }); 
          }
        }}
        onPointerUp={(e) => { setIsDragging(false); try { e.target.releasePointerCapture(e.pointerId); } catch(err) {} }}
        style={{ background: '#0ea5e9', color: '#fff', padding: '8px 15px', cursor: 'move', display: 'flex', justifyContent: 'space-between', alignItems: 'center', touchAction: 'none' }}
      >
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{data.title || 'موقع خارجي'} (نافذة منبثقة)</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        {isDragging && <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}></div>}
        <iframe src={data.url} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
      </div>
    </div>
  )
}

const DraggableCamera = ({ data, onClose }) => {
  const camW = Math.min(320, typeof window !== 'undefined' ? window.innerWidth - 24 : 320);
  const [pos, setPos] = useState({ 
    x: Math.max(10, Math.min(data.x, typeof window !== 'undefined' ? window.innerWidth - camW - 10 : 20)), 
    y: Math.max(10, Math.min(data.y, typeof window !== 'undefined' ? window.innerHeight - 300 : 100)) 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
      .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch(err => alert('تعذر الوصول للكاميرا. يرجى التأكد من منح الإذن للمتصفح.'));
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{
      position: 'absolute', left: pos.x, top: pos.y, width: camW, height: 280,
      maxWidth: 'calc(100vw - 20px)',
      background: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 100,
      display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #cbd5e1'
    }}>
      <div 
        onPointerDown={(e) => { setIsDragging(true); setOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y }); try { e.target.setPointerCapture(e.pointerId); } catch(err) {} }}
        onPointerMove={(e) => { 
          if (isDragging) {
            setPos({ 
              x: Math.max(5, Math.min(e.clientX - offset.x, window.innerWidth - 80)), 
              y: Math.max(5, Math.min(e.clientY - offset.y, window.innerHeight - 80)) 
            }); 
          }
        }}
        onPointerUp={(e) => { setIsDragging(false); try { e.target.releasePointerCapture(e.pointerId); } catch(err) {} }}
        style={{ background: '#10b981', color: '#fff', padding: '8px 15px', cursor: 'move', display: 'flex', justifyContent: 'space-between', alignItems: 'center', touchAction: 'none' }}
      >
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>الكاميرا (Webcam)</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
      </div>
      <div style={{ flex: 1, position: 'relative', background: '#000' }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
      </div>
    </div>
  )
}

const DraggableAnimatedSticker = ({ data, onClose }) => {
  const [pos, setPos] = useState({ 
    x: Math.max(10, Math.min(data.x, typeof window !== 'undefined' ? window.innerWidth - 160 : 50)), 
    y: Math.max(10, Math.min(data.y, typeof window !== 'undefined' ? window.innerHeight - 160 : 50)) 
  });
  const [size, setSize] = useState({ w: 150, h: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  return (
    <div style={{
      position: 'absolute', left: pos.x, top: pos.y, width: size.w, height: size.h,
      maxWidth: 'calc(100vw - 20px)',
      zIndex: 90, display: 'flex', flexDirection: 'column', 
      resize: 'both', overflow: 'hidden'
    }}>
      <div 
        onPointerDown={(e) => { setIsDragging(true); setOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y }); try { e.target.setPointerCapture(e.pointerId); } catch(err) {} }}
        onPointerMove={(e) => { 
          if (isDragging) {
            setPos({ 
              x: Math.max(5, Math.min(e.clientX - offset.x, window.innerWidth - 50)), 
              y: Math.max(5, Math.min(e.clientY - offset.y, window.innerHeight - 50)) 
            }); 
          }
        }}
        onPointerUp={(e) => { setIsDragging(false); try { e.target.releasePointerCapture(e.pointerId); } catch(err) {} }}
        style={{ position: 'absolute', inset: 0, cursor: 'move', touchAction: 'none' }}
      >
         <img src={data.url} alt="Sticker" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
      </div>
      <button onClick={onClose} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: '4px', display: 'flex', zIndex: 91, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
         <X size={16} color="#ef4444" />
      </button>
    </div>
  )
}

const ERASER_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21'%3E%3C/path%3E%3Cpath d='M22 21H7'%3E%3C/path%3E%3Cpath d='m5 11 9 9'%3E%3C/path%3E%3C/svg%3E") 6 18, crosshair`;

export default function WhiteboardComponent({ isAdmin = false,  isPremium = false, isTeacherDashboard = false }) {
  const canvasRef = useRef(null)
  const [canvas, setCanvas] = useState(null)
  const [activeTextObject, setActiveTextObject] = useState(null)
  const [textUpdateTick, setTextUpdateTick] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isPresenting, setIsPresenting] = useState(false)

  const getCursorStyle = (effect) => {
    if (effect === 'default') return 'default';
    const emojis = { cat: '🐱', octopus: '🐙', magic: '✨', rocket: '🚀', star: '⭐', pencil: '✏️', paw: '🐾' };
    const em = emojis[effect] || '✨';
    return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><text y='24' font-size='24'>${em}</text></svg>") 16 16, auto`;
  };

  useEffect(() => {
    const handleResize = () => {
      const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isSmallScreen || (isMobileUA && window.innerWidth <= 1024));
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('on-whiteboard')
      return () => {
        document.body.classList.remove('on-whiteboard')
      }
    }
  }, [])
  
  // Tool States
  const [tool, setTool] = useState('pen') // select, pen, highlighter, eraser, laser, pan
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const recognitionRef = useRef(null);
  const [color, setColor] = useState('#0f172a')
  const [lineWidth, setLineWidth] = useState(5)
  const [bgType, setBgType] = useState('blank') // blank, ruled, grid
  const [showGamesModal, setShowGamesModal] = useState(false)
  const [showGameManagerModal, setShowGameManagerModal] = useState(false)
  const [showPremiumAlert, setShowPremiumAlert] = useState(false)
  const [activeObjType, setActiveObjType] = useState(null)

  // Multiple Pages & Project States
  const [pages, setPages] = useState([{ id: 1, json: null }])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  // Library State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)

  // Spotlight States
  const [isSpotlightActive, setIsSpotlightActive] = useState(false)
  const [spotlightShape, setSpotlightShape] = useState('circle')
  const [isSpotlightLocked, setIsSpotlightLocked] = useState(false)

  // New Overlay States
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [isBlindActive, setIsBlindActive] = useState(false)
  const [isMagnifierActive, setIsMagnifierActive] = useState(false)
  const [isSpinWheelActive, setIsSpinWheelActive] = useState(false)
  const [isQuranGameActive, setIsQuranGameActive] = useState(false)
  const [isMemoryGameActive, setIsMemoryGameActive] = useState(false)
  const [isPeriodicTableActive, setIsPeriodicTableActive] = useState(false)
  const [isWordBuilderActive, setIsWordBuilderActive] = useState(false)
  const [isReadyPathwayActive, setIsReadyPathwayActive] = useState(false)
  const [isWordSearchActive, setIsWordSearchActive] = useState(false)
  const [activeIframeUrl, setActiveIframeUrl] = useState(null)
  const [isScienceLibraryOpen, setIsScienceLibraryOpen] = useState(false)
  const [isBackgroundsLibraryOpen, setIsBackgroundsLibraryOpen] = useState(false)
  const [isStickersLibraryOpen, setIsStickersLibraryOpen] = useState(false)
  const [isQuranPlayerActive, setIsQuranPlayerActive] = useState(false)
  const [isInteractiveMushafActive, setIsInteractiveMushafActive] = useState(false)
  const [isGeometryToolsModalOpen, setIsGeometryToolsModalOpen] = useState(false)
  const [isMathQuizActive, setIsMathQuizActive] = useState(false)
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false)
  const [isSmartImportModalOpen, setIsSmartImportModalOpen] = useState(false)
  const [isSmartDocumentEditorOpen, setIsSmartDocumentEditorOpen] = useState(false)
  const [isMindMapImportOpen, setIsMindMapImportOpen] = useState(false)
    const [isMathEquationModalOpen, setIsMathEquationModalOpen] = useState(false)
    const [isSmartGraphModalOpen, setIsSmartGraphModalOpen] = useState(false)
    const [isHangmanActive, setIsHangmanActive] = useState(false)
    const [isQuizShowActive, setIsQuizShowActive] = useState(false)
    const [isShapeFilled, setIsShapeFilled] = useState(false)
  
  // Wake Lock API to prevent screen from sleeping
  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        // Silently catch wake lock errors so they don't clutter the console for the user
      }
    };
    requestWakeLock();
    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) { wakeLock.release().catch(console.warn); }
    };
  }, []);
  const [mouseEffect, setMouseEffect] = useState('default')
  const [customBgImage, setCustomBgImage] = useState(null)
  const [isMathModalOpen, setIsMathModalOpen] = useState(false)
  const [mathInput, setMathInput] = useState('')
  const [isCalculatorActive, setIsCalculatorActive] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMobileMenuExpanded, setIsMobileMenuExpanded] = useState(false)
  
  // Toolbar Collapse States
  const [isLeftToolbarExpanded, setIsLeftToolbarExpanded] = useState(false)
  const [isBottomToolbarExpanded, setIsBottomToolbarExpanded] = useState(false)
  const [isTopLeftToolbarExpanded, setIsTopLeftToolbarExpanded] = useState(true)
  const [isTopRightToolbarExpanded, setIsTopRightToolbarExpanded] = useState(true)
  const [isAdvancedToolsExpanded, setIsAdvancedToolsExpanded] = useState(false)
  const [showMobileBottomToolbars, setShowMobileBottomToolbars] = useState(true)
  const [mobileActiveCategory, setMobileActiveCategory] = useState('draw') // 'draw' | 'colors' | 'insert' | 'tools'
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false)

  const [youtubeVideos, setYoutubeVideos] = useState([])

  // Quran Tool State
  const [showQuranModal, setShowQuranModal] = useState(false)
  const [quranSurah, setQuranSurah] = useState(1)
  const [quranAyah, setQuranAyah] = useState(1)
  const [isFetchingAyah, setIsFetchingAyah] = useState(false)

  // Cheers Menu State
  const [showCheersMenu, setShowCheersMenu] = useState(false)
  const cheersBtnRef = useRef(null)
  const [cheersMenuPos, setCheersMenuPos] = useState({ top: 48, left: 16 })

  const handleToggleCheersMenu = (e) => {
    e?.stopPropagation?.()
    if (!showCheersMenu && cheersBtnRef.current) {
      const rect = cheersBtnRef.current.getBoundingClientRect()
      const winW = typeof window !== 'undefined' ? window.innerWidth : 400
      const menuW = 165
      let left = rect.left
      if (left + menuW > winW - 8) {
        left = Math.max(8, winW - menuW - 8)
      }
      if (left < 8) {
        left = 8
      }
      setCheersMenuPos({
        top: Math.max(8, rect.bottom + 6),
        left: left
      })
    }
    setShowCheersMenu(prev => !prev)
  }

  // PDF Export States (دعم التحميل بالخلفية أو بخلفية بيضاء)
  const [showExportPdfModal, setShowExportPdfModal] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [exportProgressText, setExportProgressText] = useState('')

  // Advanced Tools States
  const [cameras, setCameras] = useState([])
  const [iframes, setIframes] = useState([])
  const [animatedStickers, setAnimatedStickers] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])

  // History States for Undo/Redo
  const historyRef = useRef([])
  const historyIndexRef = useRef(-1)
  const isHistoryUpdateRef = useRef(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const toolRef = useRef(tool)
  const colorRef = useRef(color)
  const lineWidthRef = useRef(lineWidth)
  const isShapeFilledRef = useRef(false)

  const handleLineWidthChange = (val) => {
    const num = Number(val);
    setLineWidth(num);
    lineWidthRef.current = num;
    if (canvas) {
      const activeObj = canvas.getActiveObject();
      if (activeObj) {
        if (activeObj.type === 'activeSelection') {
          activeObj.forEachObject((o) => {
            if (o.type === 'path' || o.strokeWidth !== undefined) {
              o.set('strokeWidth', num);
            } else if (o.type === 'i-text' || o.type === 'textbox' || o.type === 'text') {
              o.set('fontSize', Math.max(14, num * 5));
            }
          });
        } else if (activeObj.type === 'i-text' || activeObj.type === 'textbox' || activeObj.type === 'text') {
          activeObj.set('fontSize', Math.max(14, num * 5));
        } else if (activeObj.set) {
          activeObj.set('strokeWidth', num);
        }
        canvas.requestRenderAll();
        saveHistory(canvas);
      }
    }
  };

  const getCenter = () => {
    if (!canvas) return { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    const center = canvas.getVpCenter();
    return { left: center.x, top: center.y };
  }

  useEffect(() => {
    toolRef.current = tool
    colorRef.current = color
    lineWidthRef.current = lineWidth
    isShapeFilledRef.current = isShapeFilled
  }, [tool, color, lineWidth, isShapeFilled])

  // Load PDF.js dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('pdfjs-script')) {
      const script = document.createElement('script');
      script.id = 'pdfjs-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      document.body.appendChild(script);
      
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      };
    }
  }, []);

  const updateUndoRedoState = () => {
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
  }

    const getSafeJson = (c) => {
      const activeObj = c.getActiveObject();
      if (activeObj && activeObj.type === 'activeSelection') {
        const objects = activeObj.getObjects ? [...activeObj.getObjects()] : [];
        c.discardActiveObject();
        const json = c.toJSON(['lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'isFlashcard', 'isMindMapNode', 'frontText', 'backText', 'isFlipped', 'nodeColor', 'theme', 'mindMapId', 'isMindMapLine', 'mindMapFromId', 'mindMapToId']);
        if (objects.length > 0) {
          const newSelection = new fabric.ActiveSelection(objects, { canvas: c });
          c.setActiveObject(newSelection);
        }
        c.requestRenderAll();
        return json;
      }
      return c.toJSON(['lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'isFlashcard', 'isMindMapNode', 'frontText', 'backText', 'isFlipped', 'nodeColor', 'theme', 'mindMapId', 'isMindMapLine', 'mindMapFromId', 'mindMapToId']);
    };

    const saveHistory = (currentCanvas) => {
    if (isHistoryUpdateRef.current) return;
    try {
      const json = getSafeJson(currentCanvas);
      const currentHistory = historyRef.current;
      
      let newHistory = currentHistory.slice(0, historyIndexRef.current + 1);
      newHistory.push(JSON.stringify(json));
      
      // Limit memory to last 30 states to prevent freezing
      if (newHistory.length > 30) {
        newHistory = newHistory.slice(newHistory.length - 30);
      }
      
      historyRef.current = newHistory;
      historyIndexRef.current = historyRef.current.length - 1;
      updateUndoRedoState();
    } catch (err) {
      console.warn("Could not serialize canvas state to history:", err);
    }
  }

  useEffect(() => {
    if (!canvas) return;
    const cursor = getCursorStyle(mouseEffect);
    canvas.defaultCursor = cursor;
    canvas.hoverCursor = cursor;
    canvas.freeDrawingCursor = cursor;
    canvas.moveCursor = cursor;
    canvas.setCursor(cursor);
  }, [canvas, mouseEffect]);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (canvasRef.current.parentElement.getElementsByClassName('canvas-container').length > 0) return;

    // Reduce coordinate precision to drastically reduce JSON size and memory footprint
    fabric.Object.NUM_FRACTION_DIGITS = 2;
    fabric.Object.prototype.lockScalingFlip = true;
    fabric.Object.prototype.minScaleLimit = 0.05;
    fabric.Object.prototype.strokeUniform = true;

    const wrapper = canvasRef.current.parentElement;
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: wrapper.clientWidth,
      height: wrapper.clientHeight,
      isDrawingMode: true,
      preserveObjectStacking: true,
      selection: true,
      allowTouchScrolling: true
    })

    setCanvas(initCanvas)
    const updateActiveText = () => {
      const obj = initCanvas.getActiveObject();
      if (obj && (obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text')) {
        setActiveTextObject(obj);
      } else {
        setActiveTextObject(null);
      }
    };
    initCanvas.on('selection:created', updateActiveText);
    initCanvas.on('selection:updated', updateActiveText);
    initCanvas.on('selection:cleared', updateActiveText);
    setTimeout(() => saveHistory(initCanvas), 100);

    const handleObjectModified = (e) => {
      // Do not save laser paths in history
      if (e.target && e.target.isLaser) return;
      saveHistory(initCanvas);
    }
    
    initCanvas.on('object:added', handleObjectModified);
    initCanvas.on('object:modified', handleObjectModified);
    initCanvas.on('object:removed', handleObjectModified);
    
    const handleObjectChanging = (e) => {
      if (!e.target) return;
      const updateLines = (node) => {
        if (node && node.isMindMapNode && node.mindMapId) {
          let matrix;
          if (node.group) {
            matrix = window.fabric.util.multiplyTransformMatrices(
              node.group.calcTransformMatrix(),
              node.calcOwnMatrix()
            );
          } else {
            matrix = node.calcTransformMatrix();
          }
          const abs = window.fabric.util.qrDecompose(matrix);
          initCanvas.getObjects('line').forEach(line => {
            if (line.isMindMapLine) {
              if (line.mindMapFromId === node.mindMapId) {
                line.set({ x1: abs.translateX, y1: abs.translateY });
              }
              if (line.mindMapToId === node.mindMapId) {
                line.set({ x2: abs.translateX, y2: abs.translateY });
              }
            }
          });
        }
      };
      if (e.target.type === 'activeSelection' || e.target.type === 'group') {
        if (e.target._objects) {
          e.target._objects.forEach(obj => updateLines(obj));
        }
      } else {
        updateLines(e.target);
      }
      initCanvas.renderAll();
    };

    initCanvas.on('object:moving', handleObjectChanging);
    initCanvas.on('object:scaling', handleObjectChanging);
    initCanvas.on('object:rotating', handleObjectChanging);

      initCanvas.on('mouse:dblclick', (e) => {
        if (e.target && e.target.isFlashcard) {
          const isFront = e.target.isShowingFront;
          const newText = isFront ? e.target.backText : e.target.frontText;
          const bgRect = e.target.item(0);
          const txtObj = e.target.item(1);
          e.target.animate('scaleX', 0, {
            duration: 150,
            onChange: initCanvas.renderAll.bind(initCanvas),
            onComplete: () => {
              txtObj.set('text', newText);
              bgRect.set('fill', isFront ? '#f59e0b' : '#8b5cf6');
              e.target.set('isShowingFront', !isFront);
              e.target.animate('scaleX', 1, {
                duration: 150,
                onChange: initCanvas.renderAll.bind(initCanvas)
              });
            }
          });
        } else if (e.target && e.target.isMindMapNode) {
          if (e.target.type === 'mindMapText') {
            const currentText = e.target.text || '';
            const newText = window.prompt('تعديل نص العقدة:', currentText);
            if (newText !== null && newText.trim() !== '') {
              e.target.set('text', newText.trim());
              if (e.target.initDimensions) e.target.initDimensions();
              initCanvas.requestRenderAll();
              saveHistory(initCanvas);
            }
          } else if (typeof e.target.getObjects === 'function') {
            const txtObj = e.target.getObjects().find(o => o.type === 'text' || o.type === 'textbox');
            const rectObj = e.target.getObjects().find(o => o.type === 'rect');
            if (txtObj) {
              const newText = window.prompt('تعديل نص العقدة:', txtObj.text);
              if (newText !== null && newText.trim() !== '') {
                txtObj.set('text', newText.trim());
                if (txtObj.initDimensions) txtObj.initDimensions();
                if (rectObj) {
                  rectObj.set('height', Math.max(60, txtObj.height + 20));
                }
                e.target.addWithUpdate();
                initCanvas.requestRenderAll();
                saveHistory(initCanvas);
              }
            }
          }
        }
      });
    initCanvas.on('path:created', (opt) => {
      const path = opt.path;
      if (toolRef.current === 'laser') {
        path.isLaser = true;
        path.set({
          stroke: colorRef.current,
          strokeWidth: 6,
          shadow: new fabric.Shadow({ color: colorRef.current, blur: 15 }),
          selectable: false,
          evented: false
        });
        
        // Animate opacity to fade out
        path.animate('opacity', 0, {
          duration: 1500,
          onChange: initCanvas.renderAll.bind(initCanvas),
          onComplete: () => {
            initCanvas.remove(path);
          }
        });
      } else if (toolRef.current === 'magic') {
        const pathData = path.path;
        if (!pathData || pathData.length < 3) {
          handleObjectModified({ target: path });
          return;
        }

        let points = [];
        pathData.forEach(p => {
          if (p[1] !== undefined && p[2] !== undefined) {
             points.push({x: p[1], y: p[2]});
          }
        });

        if (points.length < 3) {
           handleObjectModified({ target: path });
           return;
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        points.forEach(p => {
            minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
        });

        const width = maxX - minX;
        const height = maxY - minY;

        initCanvas.remove(path);

        if (width < 15 && height > 20) {
          const line = new fabric.Line([minX, minY, minX, maxY], { stroke: colorRef.current, strokeWidth: lineWidthRef.current });
          initCanvas.add(line);
          handleObjectModified({ target: null });
          return;
        } else if (height < 15 && width > 20) {
          const line = new fabric.Line([minX, minY, maxX, minY], { stroke: colorRef.current, strokeWidth: lineWidthRef.current });
          initCanvas.add(line);
          handleObjectModified({ target: null });
          return;
        }

        const startPoint = points[0];
        const endPoint = points[points.length - 1];
        const dist = Math.sqrt(Math.pow(startPoint.x - endPoint.x, 2) + Math.pow(startPoint.y - endPoint.y, 2));
        const isClosed = dist < Math.max(width, height) * 0.3;

        if (isClosed) {
            const cx = minX + width/2;
            const cy = minY + height/2;
            
            let totalRadius = 0;
            points.forEach(p => {
                totalRadius += Math.sqrt(Math.pow(p.x - cx, 2) + Math.pow(p.y - cy, 2));
            });
            const avgRadius = totalRadius / points.length;
            
            let variance = 0;
            points.forEach(p => {
                variance += Math.pow(Math.sqrt(Math.pow(p.x - cx, 2) + Math.pow(p.y - cy, 2)) - avgRadius, 2);
            });
            const stdDev = Math.sqrt(variance / points.length);
            
            if (stdDev / avgRadius < 0.15) {
                const circle = new fabric.Circle({ left: minX, top: minY, radius: Math.max(width, height)/2, fill: 'transparent', stroke: colorRef.current, strokeWidth: lineWidthRef.current });
                initCanvas.add(circle);
            } else {
                let topPoints = points.filter(p => p.y < minY + height * 0.2);
                if (topPoints.length > 0 && width > 20) {
                    let avgTopX = topPoints.reduce((sum, p) => sum + p.x, 0) / topPoints.length;
                    if (avgTopX > minX + width * 0.3 && avgTopX < minX + width * 0.7) {
                        const triangle = new fabric.Triangle({ left: minX, top: minY, width, height, fill: 'transparent', stroke: colorRef.current, strokeWidth: lineWidthRef.current });
                        initCanvas.add(triangle);
                    } else {
                        const rect = new fabric.Rect({ left: minX, top: minY, width, height, fill: 'transparent', stroke: colorRef.current, strokeWidth: lineWidthRef.current });
                        initCanvas.add(rect);
                    }
                } else {
                    const rect = new fabric.Rect({ left: minX, top: minY, width, height, fill: 'transparent', stroke: colorRef.current, strokeWidth: lineWidthRef.current });
                    initCanvas.add(rect);
                }
            }
        } else {
            initCanvas.add(path);
        }
        handleObjectModified({ target: null });
      } else {
        handleObjectModified({ target: path });
      }
    });

    initCanvas.on('selection:created', (e) => setActiveObjType(e.selected[0].type))
    initCanvas.on('selection:updated', (e) => setActiveObjType(e.selected[0].type))
    initCanvas.on('selection:cleared', () => setActiveObjType(null))

    let compassCenter = null;
    let compassTempLine = null;
    let compassTempCircle = null;
    let compassGroup = null; // Holds the visual realistic compass

    // Stable Eraser Function (with touch tolerance for fingers & stylus)
    const eraseObjectAtOpt = (opt) => {
      let target = initCanvas.findTarget(opt.e, false);
      if (!target && opt.pointer) {
        const pointer = opt.pointer;
        const searchRadius = 16;
        const objects = initCanvas.getObjects();
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          if (obj.isLaser || !obj.evented) continue;
          if (obj.containsPoint && obj.containsPoint(pointer)) {
            target = obj;
            break;
          }
          const b = obj.getBoundingRect ? obj.getBoundingRect(true) : null;
          if (b &&
            pointer.x >= b.left - searchRadius &&
            pointer.x <= b.left + b.width + searchRadius &&
            pointer.y >= b.top - searchRadius &&
            pointer.y <= b.top + b.height + searchRadius
          ) {
            target = obj;
            break;
          }
        }
      }

      if (target && !target.isLaser) {
        if (target.isMindMapNode && target.mindMapId) {
          initCanvas.getObjects('line').forEach(line => {
            if (line.isMindMapLine && (line.mindMapFromId === target.mindMapId || line.mindMapToId === target.mindMapId)) {
              initCanvas.remove(line);
            }
          });
        }
        initCanvas.remove(target);
        initCanvas.requestRenderAll();
        saveHistory(initCanvas);
      }
    };

    // Pan & Compass logic & Audio Playback & Eraser
    initCanvas.on('mouse:down', function(opt) {
      if (toolRef.current === 'eraser') {
        eraseObjectAtOpt(opt);
        return;
      }

      if (toolRef.current === 'select' && opt.target && opt.target.quranAudioUrl) {
        if (window.currentQuranAudio) {
           window.currentQuranAudio.pause();
        }
        const audio = new Audio(opt.target.quranAudioUrl);
        audio.play();
        window.currentQuranAudio = audio;
      }

      if (toolRef.current === 'pan') {
        this.isDragging = true;
        this.selection = false;
        this.lastPosX = opt.pointer.x;
        this.lastPosY = opt.pointer.y;
      } else if (toolRef.current === 'compass') {
        compassCenter = { x: opt.absolutePointer.x, y: opt.absolutePointer.y };
      }
    });
    initCanvas.on('mouse:move', function(opt) {
      const isMouseDown = (opt.e && opt.e.buttons === 1) || (opt.e && opt.e.touches && opt.e.touches.length > 0);
      if (isMouseDown && toolRef.current === 'eraser') {
        eraseObjectAtOpt(opt);
        return;
      }

      if (this.isDragging) {
        var e = opt.e;
        var vpt = this.viewportTransform;
        vpt[4] += opt.pointer.x - this.lastPosX;
        vpt[5] += opt.pointer.y - this.lastPosY;
        this.requestRenderAll();
        this.lastPosX = opt.pointer.x;
        this.lastPosY = opt.pointer.y;
      }
      
      if (toolRef.current === 'compass' && compassCenter) {
         let currentPoint = opt.absolutePointer;
         let radius = Math.sqrt(Math.pow(currentPoint.x - compassCenter.x, 2) + Math.pow(currentPoint.y - compassCenter.y, 2));

         if (!compassTempCircle) {
           compassTempCircle = new fabric.Circle({
             left: compassCenter.x - radius, top: compassCenter.y - radius, radius: radius,
             fill: isShapeFilledRef.current ? `${colorRef.current}33` : 'transparent',
             stroke: colorRef.current, strokeWidth: lineWidthRef.current,
             selectable: false, evented: false, opacity: 0.7, strokeDashArray: [6, 4]
           });
           initCanvas.add(compassTempCircle);
         } else {
           compassTempCircle.set({
             left: compassCenter.x - radius,
             top: compassCenter.y - radius,
             radius: radius
           });
         }

         if (!compassTempLine) {
           compassTempLine = new fabric.Line([compassCenter.x, compassCenter.y, currentPoint.x, currentPoint.y], {
             stroke: colorRef.current, strokeWidth: 1.5, strokeDashArray: [4, 4], selectable: false, evented: false
           });
           initCanvas.add(compassTempLine);
         } else {
           compassTempLine.set({
             x1: compassCenter.x, y1: compassCenter.y,
             x2: currentPoint.x, y2: currentPoint.y
           });
         }

         initCanvas.requestRenderAll();
      }
    });
    initCanvas.on('mouse:up', function(opt) {
      if (toolRef.current === 'pan') {
        this.setViewportTransform(this.viewportTransform);
        this.isDragging = false;
        this.selection = true;
      }
      if (toolRef.current === 'compass' && compassCenter) {
         let currentPoint = opt.absolutePointer;
         let radius = Math.sqrt(Math.pow(currentPoint.x - compassCenter.x, 2) + Math.pow(currentPoint.y - compassCenter.y, 2));
         
         if (compassTempLine) { initCanvas.remove(compassTempLine); compassTempLine = null; }
         if (compassTempCircle) { initCanvas.remove(compassTempCircle); compassTempCircle = null; }
         if (compassGroup) { initCanvas.remove(compassGroup); compassGroup = null; }
         
         if (radius > 8) {
             const finalCircle = new fabric.Circle({
                 left: compassCenter.x - radius, top: compassCenter.y - radius,
                 radius: radius, fill: isShapeFilledRef.current ? `${colorRef.current}33` : 'transparent', stroke: colorRef.current, strokeWidth: lineWidthRef.current,
                 selectable: true, evented: true
             });
             initCanvas.add(finalCircle);
             initCanvas.setActiveObject(finalCircle);
             initCanvas.requestRenderAll();
             saveHistory(initCanvas);
         }
         
         compassCenter = null;
         initCanvas.requestRenderAll();
      }
    });

    // Zoom via wheel
    initCanvas.on('mouse:wheel', function(opt) {
      var delta = opt.e.deltaY;
      var zoom = initCanvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 5) zoom = 5;
      if (zoom < 0.1) zoom = 0.1;
      initCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === canvasRef.current?.parentElement && initCanvas) {
          initCanvas.setWidth(entry.target.clientWidth);
          initCanvas.setHeight(entry.target.clientHeight);
          initCanvas.renderAll();
        }
      }
    });

    if (canvasRef.current && canvasRef.current.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
      
      // Initial set to avoid 0x0
      const initialWidth = canvasRef.current.parentElement.clientWidth || window.innerWidth;
      const initialHeight = canvasRef.current.parentElement.clientHeight || window.innerHeight;
      if (initialWidth > 0 && initialHeight > 0) {
         initCanvas.setWidth(initialWidth);
         initCanvas.setHeight(initialHeight);
         initCanvas.renderAll();
      }
    }

    // Two-finger Touch Gestures (Pinch to Zoom & Pan) for Mobile / Tablets
    let touchState = null;

    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length === 2) {
        e.preventDefault();
        e.stopPropagation();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const rect = initCanvas.upperCanvasEl.getBoundingClientRect();
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const center = {
          x: (t1.clientX + t2.clientX) / 2 - rect.left,
          y: (t1.clientY + t2.clientY) / 2 - rect.top,
        };
        touchState = {
          initialDist: dist,
          initialZoom: initCanvas.getZoom(),
          lastCenter: center,
        };
      } else {
        touchState = null;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length === 2 && touchState) {
        e.preventDefault();
        e.stopPropagation();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const rect = initCanvas.upperCanvasEl.getBoundingClientRect();
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const currentCenter = {
          x: (t1.clientX + t2.clientX) / 2 - rect.left,
          y: (t1.clientY + t2.clientY) / 2 - rect.top,
        };

        // 1. Two-finger Pan
        const deltaX = currentCenter.x - touchState.lastCenter.x;
        const deltaY = currentCenter.y - touchState.lastCenter.y;
        const vpt = initCanvas.viewportTransform;
        vpt[4] += deltaX;
        vpt[5] += deltaY;

        // 2. Pinch Zoom
        if (touchState.initialDist > 0) {
          const scale = currentDist / touchState.initialDist;
          let newZoom = touchState.initialZoom * scale;
          if (newZoom > 5) newZoom = 5;
          if (newZoom < 0.1) newZoom = 0.1;
          initCanvas.zoomToPoint({ x: currentCenter.x, y: currentCenter.y }, newZoom);
        }

        touchState.lastCenter = currentCenter;
        initCanvas.requestRenderAll();
      }
    };

    const handleTouchEnd = (e) => {
      if (e.touches && e.touches.length < 2) {
        touchState = null;
      }
    };

    const upperEl = initCanvas.upperCanvasEl;
    if (upperEl) {
      upperEl.addEventListener('touchstart', handleTouchStart, { capture: true, passive: false });
      upperEl.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
      upperEl.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
      upperEl.addEventListener('touchcancel', handleTouchEnd, { capture: true, passive: false });
    }

    return () => {
      if (upperEl) {
        upperEl.removeEventListener('touchstart', handleTouchStart, { capture: true });
        upperEl.removeEventListener('touchmove', handleTouchMove, { capture: true });
        upperEl.removeEventListener('touchend', handleTouchEnd, { capture: true });
        upperEl.removeEventListener('touchcancel', handleTouchEnd, { capture: true });
      }
      resizeObserver.disconnect();
      initCanvas.dispose();
    }
  }, [])

  useEffect(() => {
    if (!canvas) return

    if (tool === 'select') {
      canvas.isDrawingMode = false
      canvas.defaultCursor = 'default'
      canvas.selection = true
    } else if (tool === 'pan') {
      canvas.isDrawingMode = false
      canvas.defaultCursor = 'grab'
      canvas.selection = false
    } else if (tool === 'pen') {
      canvas.isDrawingMode = true
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.color = color
      canvas.freeDrawingBrush.width = lineWidth
    } else if (tool === 'spray') {
      canvas.isDrawingMode = true
      const sprayBrush = new fabric.SprayBrush(canvas)
      sprayBrush.color = color
      sprayBrush.width = lineWidth * 2
      sprayBrush.density = 25
      sprayBrush.dotWidth = 2
      sprayBrush.dotWidthVariance = 2
      sprayBrush.randomOpacity = true
      sprayBrush.optimizeOverlapping = true
      canvas.freeDrawingBrush = sprayBrush
    } else if (tool === 'calligraphy') {
      canvas.isDrawingMode = true
      const brush = new fabric.PencilBrush(canvas)
      brush.color = color
      brush.width = lineWidth
      // Simulate calligraphy with a tilted shadow
      brush.shadow = new fabric.Shadow({
        blur: 1,
        offsetX: lineWidth / 2,
        offsetY: lineWidth / 4,
        affectStroke: true,
        color: color,
      })
      canvas.freeDrawingBrush = brush
    } else if (tool === 'magic') {
      canvas.isDrawingMode = true
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.color = color
      canvas.freeDrawingBrush.width = lineWidth
    } else if (tool === 'laser') {
      canvas.isDrawingMode = true
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.color = 'transparent' // visual hack to hide normal stroke while drawing
      canvas.freeDrawingBrush.width = 6
    } else if (tool === 'highlighter') {
      canvas.isDrawingMode = true
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      const r = parseInt(color.slice(1, 3), 16) || 0
      const g = parseInt(color.slice(3, 5), 16) || 0
      const b = parseInt(color.slice(5, 7), 16) || 0
      canvas.freeDrawingBrush.color = `rgba(${r}, ${g}, ${b}, 0.3)`
      canvas.freeDrawingBrush.width = lineWidth * 3
    } else if (tool === 'eraser') {
      canvas.isDrawingMode = false
      canvas.defaultCursor = ERASER_CURSOR
      canvas.selection = false
    } else if (tool === 'compass') {
      canvas.isDrawingMode = false
      canvas.defaultCursor = 'crosshair'
      canvas.selection = false
    }

    const isInteractive = tool === 'select'
    canvas.forEachObject((obj) => {
      if(obj.isLaser) return;
      obj.selectable = isInteractive && !obj.lockMovementX
      obj.evented = isInteractive || tool === 'eraser'
    })
    canvas.renderAll()
  }, [canvas, tool, color, lineWidth])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // إيقاف? مؤقتمؤقتإيقاف إيقاف مؤقت إيقاف? مؤقت إيقاف إيقاف مؤقت?
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isEditing) return;

      if (e.ctrlKey || e.metaKey) {
        if ((e.key === 'z' || e.key === 'Z') && e.shiftKey) { e.preventDefault(); redo(); return; }
        if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); undo(); return; }
        if (e.key === 'y' || e.key === 'Y') { e.preventDefault(); redo(); return; }
      }

      if (e.key === 'Tab' && canvas && tool === 'select') {
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.isMindMapNode && !activeObj.isEditing) {
          e.preventDefault();
          addMindMapBranch();
          return;
        }
      }

      if (e.key === 'Enter' && canvas && tool === 'select') {
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.isMindMapNode && !activeObj.isEditing) {
          e.preventDefault();
          addMindMapSibling();
          return;
        }
      }

        if ((e.key === 'Delete' || e.key === 'Backspace') && canvas && tool === 'select') {
          const activeObjects = canvas.getActiveObjects()
          if (activeObjects.length) {
            if (canvas.getActiveObject().isEditing) return
            canvas.discardActiveObject()
            activeObjects.forEach((obj) => { 
              if(!obj.lockMovementX) {
                // Cleanup MindMap lines safely
                if (obj.isMindMapNode) {
                  canvas.getObjects('line').forEach(line => {
                    if (line.isMindMapLine && (line.mindMapFromId === obj.mindMapId || line.mindMapToId === obj.mindMapId)) {
                      canvas.remove(line);
                    }
                  });
                }
                canvas.remove(obj)
              }
            })
            saveHistory(canvas)
          }
        }

      // إيقاف?🔥 ناري!الكاميرا (Webcam)إيقاف
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          setTool('pan');
          break;
        case 'v':
          setTool('select');
          break;
        case 'p':
          setTool('pen');
          break;
        case 'c':
          setTool('calligraphy');
          break;
        case 's':
          setTool('spray');
          break;
        case 'e':
          setTool('eraser');
          break;
        case 'm':
          setTool('magic');
          break;
        case 'l':
          setTool('laser');
          break;
        case 'h':
          setTool('highlighter');
          break;
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canvas, tool])

  // Actions
  const undo = () => {
    if (historyIndexRef.current > 0 && canvas) {
      isHistoryUpdateRef.current = true;
      historyIndexRef.current -= 1;
      canvas.loadFromJSON(historyRef.current[historyIndexRef.current], () => {
        canvas.renderAll();
        isHistoryUpdateRef.current = false;
        updateUndoRedoState();
      });
    }
  }

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1 && canvas) {
      isHistoryUpdateRef.current = true;
      historyIndexRef.current += 1;
      canvas.loadFromJSON(historyRef.current[historyIndexRef.current], () => {
        canvas.renderAll();
        isHistoryUpdateRef.current = false;
        updateUndoRedoState();
      });
    }
  }

  const toggleLock = () => {
    if(!canvas) return;
    const obj = canvas.getActiveObject();
    if(obj) {
      const isLocked = obj.lockMovementX;
      obj.set({
        lockMovementX: !isLocked, lockMovementY: !isLocked,
        lockScalingX: !isLocked, lockScalingY: !isLocked,
        lockRotation: !isLocked, hasControls: isLocked,
        selectable: true // always selectable to allow unlocking
      });
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  }

  const bringForward = () => { if(canvas && canvas.getActiveObject()) canvas.bringForward(canvas.getActiveObject()) }
  const sendBackward = () => { if(canvas && canvas.getActiveObject()) canvas.sendBackwards(canvas.getActiveObject()) }
  const duplicate = () => {
    if(!canvas) return;
    const obj = canvas.getActiveObject();
    if(obj) {
      obj.clone((cloned) => {
        const prepareClone = (o) => {
          if (o.isMindMapNode) {
            o.set('mindMapId', 'node_' + Math.random().toString(36).substring(2));
            o.set('_connectedLines', []);
          }
        };

        cloned.set({ left: obj.left + 20, top: obj.top + 20, evented: true, selectable: true });
        
        if(cloned.type === 'activeSelection') {
          cloned.canvas = canvas;
          cloned.forEachObject((o) => {
            prepareClone(o);
            canvas.add(o);
          });
          cloned.setCoords();
        } else {
          prepareClone(cloned);
          canvas.add(cloned);
        }
        canvas.setActiveObject(cloned);
        canvas.requestRenderAll();
        if(typeof saveHistory === 'function') saveHistory(canvas);
      });
    }
  }


  const zoomIn = () => { if(canvas) canvas.setZoom(canvas.getZoom() * 1.2) }
  const zoomOut = () => { if(canvas) canvas.setZoom(canvas.getZoom() / 1.2) }
  const resetZoom = () => {
    if(canvas) {
      canvas.setZoom(1);
      canvas.viewportTransform[4] = 0;
      canvas.viewportTransform[5] = 0;
      canvas.requestRenderAll();
    }
  }

  const addPage = () => {
    if (!canvas) return;
    if (!isPremium && !isAdmin) { setShowPremiumAlert(true); return; }
    const json = getSafeJson(canvas);
    const newPages = [...pages];
    newPages[currentPageIndex].json = json;
    
    const newPage = { id: Date.now(), json: null };
    newPages.push(newPage);
    
    setPages(newPages);
    setCurrentPageIndex(newPages.length - 1);
    
    canvas.clear();
    historyRef.current = [];
    historyIndexRef.current = -1;
    saveHistory(canvas);
  }

  const deletePage = () => {
    if (!canvas) return;
    if (pages.length <= 1) {
      handleClearCanvas();
      return;
    }
    if (!window.confirm(`هل أنت متأكد من حذف الصفحة رقم (${currentPageIndex + 1})؟`)) {
      return;
    }

    const newPages = pages.filter((_, idx) => idx !== currentPageIndex);
    const newIndex = Math.min(currentPageIndex, newPages.length - 1);
    setPages(newPages);
    setCurrentPageIndex(newIndex);

    canvas.clear();
    const targetJson = newPages[newIndex]?.json;
    if (targetJson) {
      canvas.loadFromJSON(targetJson, () => {
        canvas.renderAll();
        historyRef.current = [];
        historyIndexRef.current = -1;
        saveHistory(canvas);
      });
    } else {
      historyRef.current = [];
      historyIndexRef.current = -1;
      saveHistory(canvas);
    }
  }

  const handleClearCanvas = () => {
    if (!canvas) return;
    if (canvas.getObjects().length === 0) return;
    if (window.confirm('هل أنت متأكد من مسح جميع محتويات الصفحة الحالية؟ لا تقلق، يمكنك التراجع بالضغط على زر التراجع.')) {
      canvas.clear();
      canvas.requestRenderAll();
      saveHistory(canvas);
    }
  }

  const handleExit = (e) => {
    if (canvas && canvas.getObjects().length > 0) {
      if (!window.confirm('هل تريد مغادرة السبورة؟ تأكد من حفظ عملك كصورة أو مشروع لتجنب فقدان أي تعديلات.')) {
        if (e && e.preventDefault) e.preventDefault();
        return;
      }
    }
    window.location.href = isTeacherDashboard ? "/teacher-assistant" : "/";
  }

  const switchPage = (index) => {
    if (!canvas || index === currentPageIndex || index < 0 || index >= pages.length) return;
    const json = getSafeJson(canvas);
    const newPages = [...pages];
    newPages[currentPageIndex].json = json;
    setPages(newPages);
    
    setCurrentPageIndex(index);
    canvas.clear();
    
    const targetJson = newPages[index].json;
    if (targetJson) {
      canvas.loadFromJSON(targetJson, () => {
        canvas.renderAll();
        historyRef.current = [];
        historyIndexRef.current = -1;
        saveHistory(canvas);
      });
    } else {
       historyRef.current = [];
       historyIndexRef.current = -1;
       saveHistory(canvas);
    }
  }

  const togglePresentationMode = async () => {
    if (!isPremium && !isAdmin) { setShowPremiumAlert(true); return; }
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsPresenting(true);
        setTool('laser');
      } else {
        await document.exitFullscreen();
        setIsPresenting(false);
        setTool('select');
      }
    } catch (err) {
      alert('حدث خطأ أثناء التكبير/التصغير.');
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsPresenting(false);
        setTool('select');
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const saveProject = () => {
    if (!canvas) return;
    const currentJson = getSafeJson(canvas);
    const newPages = [...pages];
    newPages[currentPageIndex].json = currentJson;
    
    const projectData = JSON.stringify({ pages: newPages, currentPageIndex });
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whiteboard_project.json';
    a.click();
  }

  const checkIfHasBackground = () => {
    if (canvas && canvas.backgroundImage) return true;
    if (customBgImage) return true;
    if (bgType && bgType !== 'blank') return true;

    if (Array.isArray(pages)) {
      for (const page of pages) {
        if (!page || !page.json) continue;
        let pData = page.json;
        if (typeof pData === 'string') {
          if (pData.includes('"backgroundImage"') && !pData.includes('"backgroundImage":null')) {
            return true;
          }
        } else if (pData.backgroundImage) {
          return true;
        }
      }
    }
    return false;
  };

  const exportToPDF = () => {
    if (!canvas) return;
    if (!isPremium && !isAdmin) { setShowPremiumAlert(true); return; }

    if (checkIfHasBackground()) {
      setShowExportPdfModal(true);
    } else {
      executeExportPdf(false);
    }
  };

  const executeExportPdf = async (includeBackground = true) => {
    if (!canvas) return;
    if (!isPremium && !isAdmin) { setShowPremiumAlert(true); return; }

    setShowExportPdfModal(false);
    setIsExportingPdf(true);
    setExportProgressText('جاري تجهيز وتصدير ملف الـ PDF...');

    try {
      const { jsPDF } = await import('jspdf');

      const currentJson = getSafeJson(canvas);
      const tempCanvasElement = document.createElement('canvas');
      const tempCanvas = new fabric.StaticCanvas(tempCanvasElement);

      let doc = null;

      for (let i = 0; i < pages.length; i++) {
        setExportProgressText(`جاري تصدير صفحة ${i + 1} من ${pages.length}...`);

        const rawJson = (i === currentPageIndex) ? currentJson : pages[i].json;
        let pageData = rawJson;
        if (typeof pageData === 'string') {
          try {
            pageData = JSON.parse(pageData);
          } catch(e) {
            pageData = null;
          }
        }

        pageData = JSON.parse(JSON.stringify(pageData || { version: "5.3.0", objects: [] }));

        if (!includeBackground) {
          // 📄 Case 1: Pure White Background (Remove any textbook or image background)
          delete pageData.backgroundImage;
          pageData.background = '#ffffff';
          tempCanvas.clear();
          await new Promise(resolve => tempCanvas.loadFromJSON(pageData, resolve));
          tempCanvas.backgroundImage = null;
          tempCanvas.backgroundColor = '#ffffff';
        } else {
          // 🖼️ Case 2: Keep Background (Textbook, PDF, Image, or Pattern)
          tempCanvas.clear();
          await new Promise(resolve => tempCanvas.loadFromJSON(pageData, resolve));

          // If customBgImage was set globally on the board and page has no explicit backgroundImage
          if (customBgImage && !tempCanvas.backgroundImage) {
            await new Promise(resolve => {
              fabric.Image.fromURL(customBgImage, (img) => {
                if (img) {
                  const canvasAspect = canvas.width / canvas.height;
                  const imgAspect = img.width / img.height;
                  const scaleFactor = canvasAspect >= imgAspect ? canvas.height / img.height : canvas.width / img.width;
                  img.set({
                    scaleX: scaleFactor,
                    scaleY: scaleFactor,
                    originX: 'center',
                    originY: 'center',
                    left: canvas.width / 2,
                    top: canvas.height / 2
                  });
                  tempCanvas.setBackgroundImage(img, resolve);
                } else {
                  resolve();
                }
              });
            });
          }

          if (!tempCanvas.backgroundImage) {
            const pageBgColor = bgType === 'blackboard' ? '#1a1a1a' : bgType === 'greenboard' ? '#1f4d36' : '#ffffff';
            tempCanvas.backgroundColor = pageBgColor;
          }
        }

        // Determine final dimensions
        let finalW = canvas.width || 1280;
        let finalH = canvas.height || 720;
        let offsetX = 0;
        let offsetY = 0;

        // If no background image was used and drawings are scattered, check bounds
        if (!tempCanvas.backgroundImage) {
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          const objects = tempCanvas.getObjects();
          if (objects.length > 0) {
            objects.forEach(obj => {
              const br = obj.getBoundingRect();
              if (br.left < minX) minX = br.left;
              if (br.top < minY) minY = br.top;
              if (br.left + br.width > maxX) maxX = br.left + br.width;
              if (br.top + br.height > maxY) maxY = br.top + br.height;
            });
          }
          if (minX !== Infinity && (minX < 0 || minY < 0 || maxX > finalW || maxY > finalH)) {
            const padding = 60;
            minX -= padding; minY -= padding; maxX += padding; maxY += padding;
            const contentWidth = maxX - minX;
            const contentHeight = maxY - minY;
            finalW = Math.max(contentWidth, canvas.width);
            finalH = Math.max(contentHeight, canvas.height);
            offsetX = finalW > contentWidth ? (finalW - contentWidth) / 2 : 0;
            offsetY = finalH > contentHeight ? (finalH - contentHeight) / 2 : 0;
            tempCanvas.setViewportTransform([1, 0, 0, 1, -minX + offsetX, -minY + offsetY]);
          } else {
            tempCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
          }
        } else {
          // With background image: ALWAYS 1:1 view so drawings and textbook match 100%
          tempCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        }

        tempCanvas.setWidth(finalW);
        tempCanvas.setHeight(finalH);
        tempCanvas.renderAll();

        const isLandscape = finalW >= finalH;

        if (!doc) {
          doc = new jsPDF({
            orientation: isLandscape ? 'landscape' : 'portrait',
            unit: 'px',
            format: [finalW, finalH],
            hotfixes: ['px_scaling']
          });
        } else {
          doc.addPage([finalW, finalH], isLandscape ? 'landscape' : 'portrait');
        }

        const pdfBgColor = (!includeBackground || (!tempCanvas.backgroundImage && bgType === 'blank')) 
          ? '#ffffff' 
          : (bgType === 'blackboard' ? '#1a1a1a' : bgType === 'greenboard' ? '#1f4d36' : '#ffffff');

        doc.setFillColor(pdfBgColor);
        doc.rect(0, 0, finalW, finalH, 'F');

        let scaleMulti = 2.0;
        if (finalW > 2000 || finalH > 2000 || isMobile) scaleMulti = 1.3;
        if (finalW * finalH > 8000000) scaleMulti = 1.0;

        const imgData = tempCanvas.toDataURL({
          format: 'jpeg',
          quality: 0.94,
          multiplier: scaleMulti
        });

        doc.addImage(imgData, 'JPEG', 0, 0, finalW, finalH);
      }

      tempCanvas.dispose();
      const todayStr = new Date().toISOString().slice(0, 10);
      const bgSuffix = includeBackground ? 'مع_الخلفية' : 'خلفية_بيضاء';
      if (doc) doc.save(`السبورة_الذكية_${bgSuffix}_${todayStr}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('حدث خطأ أثناء تصدير PDF. حاول مرة أخرى.');
    } finally {
      setIsExportingPdf(false);
      setExportProgressText('');
    }
  };

  const loadProject = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      try {
        const data = JSON.parse(f.target.result);
        if (data && data.pages) {
          setPages(data.pages);
          setCurrentPageIndex(data.currentPageIndex || 0);
          const targetJson = data.pages[data.currentPageIndex || 0].json;
          canvas.clear();
          if (targetJson) {
             canvas.loadFromJSON(targetJson, () => {
               canvas.renderAll();
               historyRef.current = [];
               historyIndexRef.current = -1;
               saveHistory(canvas);
             });
          }
        }
      } catch (err) {
        alert('حدث خطأ أثناء العملية.');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  }

  const handleBackgroundUpload = async (e) => {
    if (!canvas || !e.target.files[0]) return;
    const file = e.target.files[0];
    
    if (file.type === 'application/pdf') {
       if (!window.pdfjsLib) {
          alert('مكتبة PDF غير متوفرة.');
          return;
       }
       const reader = new FileReader();
       reader.onload = async (f) => {
          const typedarray = new Uint8Array(f.target.result);
          const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
          const numPages = pdf.numPages;
          
          for (let i = 1; i <= numPages; i++) {
             const page = await pdf.getPage(i);
             // مؤقت? إيقاف? مؤقتإيقاف إيقاف 2.0 مؤقت مؤقت مؤقتإيقاف إيقاف مزيد من الأدوات مؤقت مؤقتإيقاف
             const pdfScale = isMobile ? 1.2 : 1.8;
             const viewport = page.getViewport({ scale: pdfScale });
             
             const tempCanvas = document.createElement('canvas');
             const context = tempCanvas.getContext('2d');
             tempCanvas.height = viewport.height;
             tempCanvas.width = viewport.width;
             
             await page.render({ canvasContext: context, viewport }).promise;
             // مؤقت? مؤقت مؤقت? إيقاف 0.9 إيقاف? 0.6
             const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.85);
             
             if (i === 1) {
                setCustomBgImage(null);
                setBgType('blank');
                fabric.Image.fromURL(dataUrl, (img) => {
                   const canvasAspect = canvas.width / canvas.height;
                   const imgAspect = img.width / img.height;
                   let scaleFactor = canvasAspect >= imgAspect ? canvas.height / img.height : canvas.width / img.width;
                   img.set({ scaleX: scaleFactor, scaleY: scaleFactor, originX: 'center', originY: 'center', left: canvas.width / 2, top: canvas.height / 2 });
                   canvas.setBackgroundImage(img, () => {
                   canvas.renderAll();
                   saveHistory(canvas);
               });
                });
             } else {
                const jsonStr = await new Promise(resolve => {
                    fabric.Image.fromURL(dataUrl, (img) => {
                       const canvasAspect = canvas.width / canvas.height;
                       const imgAspect = img.width / img.height;
                       let scaleFactor = canvasAspect >= imgAspect ? canvas.height / img.height : canvas.width / img.width;
                       img.set({ scaleX: scaleFactor, scaleY: scaleFactor, originX: 'center', originY: 'center', left: canvas.width / 2, top: canvas.height / 2 });
                       
                       const json = {
                          version: "5.3.0",
                          objects: [],
                          background: canvas.backgroundColor || '#ffffff',
                          backgroundImage: img.toObject()
                       };
                       resolve(JSON.stringify(json));
                    });
                });
                
                // إعدادات 🔥 ناري! إيقاف مزيد من الأدوات مؤقت إيقاف🔥 ناري!
                setPages(prev => [...prev, { id: Date.now() + i, json: jsonStr }]);
             }
             
             // مؤقت? مؤقت مزيد من الأدوات مؤقت? 🔥 ناري!إيقاف? (مؤقت ?🔥 ناري!)
             await new Promise(r => setTimeout(r, 20));
          }
       };
       reader.readAsArrayBuffer(file);
    } else {
       const reader = new FileReader();
       reader.onload = (f) => {
          fabric.Image.fromURL(f.target.result, (img) => {
             setCustomBgImage(null);
             setBgType('blank');
             const canvasAspect = canvas.width / canvas.height;
             const imgAspect = img.width / img.height;
             let scaleFactor = canvasAspect >= imgAspect ? canvas.height / img.height : canvas.width / img.width;
             img.set({ scaleX: scaleFactor, scaleY: scaleFactor, originX: 'center', originY: 'center', left: canvas.width / 2, top: canvas.height / 2 });
             canvas.setBackgroundImage(img, () => {
                 canvas.renderAll();
                 saveHistory(canvas);
             });
          });
       };
       reader.readAsDataURL(file);
    }
    e.target.value = null;
  }

  const toggleTextBold = () => {
    const obj = canvas.getActiveObject();
    if(obj && obj.type === 'i-text') {
      obj.set('fontWeight', obj.fontWeight === 'bold' ? 'normal' : 'bold');
      canvas.requestRenderAll();
    }
  }
  const changeFontSize = (delta) => {
    const obj = canvas.getActiveObject();
    if(obj && obj.type === 'i-text') {
      obj.set('fontSize', obj.fontSize + delta);
      canvas.requestRenderAll();
    }
  }

  // Insertion Tools

  const addStickyNote = (noteColor) => {
    if (!canvas) return;
    const text = new fabric.Textbox('اكتب نصاً...', {
      ...getCenter(), width: 200, fontSize: 24, fontFamily: 'Tajawal', fill: '#1e293b', backgroundColor: noteColor, textAlign: 'center', originX: 'center', originY: 'center', shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.1)', blur: 8, offsetX: 2, offsetY: 2 })
    });
    canvas.add(text); canvas.setActiveObject(text); setTool('select'); setIsLibraryOpen(false);
  }

  const addMicroscope = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="' + colorRef.current + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>';
    fabric.Image.fromURL('data:image/svg+xml;utf8,' + encodeURIComponent(svg), (img) => {
      img.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true });
      canvas.add(img); setTool('select'); setIsLibraryOpen(false);
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
    fabric.Image.fromURL('data:image/svg+xml;utf8,' + encodeURIComponent(svg), (img) => {
      img.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true });
      canvas.add(img); setTool('select'); setIsLibraryOpen(false);
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


  const addGeometryTool = (toolId) => {
    if (!canvas) return;
    let svg = '';
    
    if (toolId === 'ruler') {
      svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="60" viewBox="0 0 600 60">';
      svg += '<rect width="600" height="60" fill="rgba(255, 255, 255, 0.5)" stroke="#0ea5e9" stroke-width="2"/>';
      for(let i=0; i<=600; i+=10) {
        let tickHeight = (i % 100 === 0) ? 25 : (i % 50 === 0) ? 15 : 10;
        svg += `<line x1="${i}" y1="0" x2="${i}" y2="${tickHeight}" stroke="#1e293b" stroke-width="1.5"/>`;
        if (i % 100 === 0 && i !== 0 && i !== 600) {
          svg += `<text x="${i}" y="45" font-family="Arial" font-size="16" fill="#1e293b" text-anchor="middle">${i/10}</text>`;
        }
      }
      svg += '</svg>';
    } 
    else if (toolId === 'protractor') {
      svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">';
      svg += '<path d="M 0 200 A 200 200 0 0 1 400 200 Z" fill="rgba(255, 255, 255, 0.5)" stroke="#0ea5e9" stroke-width="2"/>';
      svg += '<path d="M 100 200 A 100 100 0 0 1 300 200 Z" fill="transparent" stroke="#0ea5e9" stroke-width="2"/>';
      svg += '<line x1="180" y1="200" x2="220" y2="200" stroke="#1e293b" stroke-width="2"/>';
      svg += '<line x1="200" y1="180" x2="200" y2="200" stroke="#1e293b" stroke-width="2"/>';
      for(let i=0; i<=180; i+=5) {
        let rad = i * Math.PI / 180;
        let r1 = 200;
        let r2 = (i % 10 === 0) ? 180 : 190;
        let x1 = 200 - r1 * Math.cos(rad);
        let y1 = 200 - r1 * Math.sin(rad);
        let x2 = 200 - r2 * Math.cos(rad);
        let y2 = 200 - r2 * Math.sin(rad);
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1e293b" stroke-width="1.5"/>`;
        if (i % 10 === 0 && i !== 0 && i !== 180) {
          let rText = 165;
          let tx = 200 - rText * Math.cos(rad);
          let ty = 200 - rText * Math.sin(rad);
          svg += `<text x="${tx}" y="${ty+5}" font-family="Arial" font-size="12" fill="#1e293b" text-anchor="middle" transform="rotate(${90-i}, ${tx}, ${ty})">${i}</text>`;
        }
      }
      svg += '</svg>';
    }
    else if (toolId === 'triangle') {
      svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">';
      svg += '<polygon points="0,0 0,300 300,300" fill="rgba(255, 255, 255, 0.5)" stroke="#0ea5e9" stroke-width="2"/>';
      svg += '<polygon points="40,90 40,260 210,260" fill="transparent" stroke="#0ea5e9" stroke-width="2"/>';
      for(let i=0; i<=300; i+=10) {
        let tick = (i % 100 === 0) ? 20 : (i % 50 === 0) ? 15 : 10;
        svg += `<line x1="${i}" y1="300" x2="${i}" y2="${300-tick}" stroke="#1e293b" stroke-width="1.5"/>`;
      }
      for(let i=0; i<=300; i+=10) {
        let tick = (i % 100 === 0) ? 20 : (i % 50 === 0) ? 15 : 10;
        svg += `<line x1="0" y1="${i}" x2="${tick}" y2="${i}" stroke="#1e293b" stroke-width="1.5"/>`;
      }
      svg += '</svg>';
    }
    else if (toolId === 'graph') {
      svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">';
      svg += '<rect width="400" height="400" fill="rgba(255, 255, 255, 0.85)" stroke="#0ea5e9" stroke-width="2"/>';
      for(let i=0; i<=400; i+=20) {
        svg += `<line x1="${i}" y1="0" x2="${i}" y2="400" stroke="#e2e8f0" stroke-width="1"/>`;
        svg += `<line x1="0" y1="${i}" x2="400" y2="${i}" stroke="#e2e8f0" stroke-width="1"/>`;
      }
      svg += '<line x1="200" y1="0" x2="200" y2="400" stroke="#1e293b" stroke-width="2"/>';
      svg += '<line x1="0" y1="200" x2="400" y2="200" stroke="#1e293b" stroke-width="2"/>';
      svg += '<polygon points="200,0 195,10 205,10" fill="#1e293b"/>';
      svg += '<polygon points="400,200 390,195 390,205" fill="#1e293b"/>';
      for(let i=0; i<=400; i+=20) {
        if (i !== 200) {
          svg += `<line x1="197" y1="${i}" x2="203" y2="${i}" stroke="#1e293b" stroke-width="1"/>`;
          svg += `<line x1="${i}" y1="197" x2="${i}" y2="203" stroke="#1e293b" stroke-width="1"/>`;
          if (i % 40 === 0 && i !== 200) {
            let valX = (i - 200) / 20;
            let valY = (200 - i) / 20;
            svg += `<text x="${i}" y="215" font-family="Arial" font-size="10" fill="#1e293b" text-anchor="middle">${valX}</text>`;
            svg += `<text x="185" y="${i+4}" font-family="Arial" font-size="10" fill="#1e293b" text-anchor="end">${valY}</text>`;
          }
        }
      }
      svg += `<text x="190" y="215" font-family="Arial" font-size="12" fill="#1e293b" text-anchor="end">0</text>`;
      svg += `<text x="385" y="190" font-family="Arial" font-size="14" font-weight="bold" fill="#1e293b">X</text>`;
      svg += `<text x="210" y="15" font-family="Arial" font-size="14" font-weight="bold" fill="#1e293b">Y</text>`;
      svg += '</svg>';
    }

    const dataURI = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    fabric.Image.fromURL(dataURI, (img) => {
      img.set({
        ...getCenter(),
        originX: 'center', originY: 'center',
        selectable: true, evented: true, hasControls: true,
        transparentCorners: false, cornerColor: '#0ea5e9', cornerStrokeColor: '#ffffff',
        borderColor: '#0ea5e9', cornerSize: 12, padding: 0
      });
      img.setControlsVisibility({ mt: false, mb: false, ml: false, mr: false });
      if (isMobile) {
        const targetScale = Math.min(1, (window.innerWidth - 30) / (img.width || 400));
        img.scale(targetScale);
      }
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      saveHistory(canvas);
    });
  };

  const createMindMapNode = (x, y, textStr, color = '#3b82f6', theme = 'classic') => {
    const isLight = theme === 'outline' || theme === 'minimal';
    const textFill = isLight ? color : (theme === 'sticky' ? '#713f12' : '#ffffff');
    const MindMapClass = (window.fabric && window.fabric.MindMapText) || fabric.MindMapText;
    const node = new MindMapClass(textStr || 'عقدة جديدة', {
      left: x, top: y, width: 160, fontSize: 18, fill: textFill, fontFamily: 'Tajawal', fontWeight: 'bold', textAlign: 'center',
      originX: 'center', originY: 'center', selectable: true, evented: true, nodeColor: color, theme: theme
    });
    return node;
  };

  const handleMindMapImport = (text, theme) => {
    if (!canvas) return;
    let rawLines = text.split('\n').filter(l => l.trim() !== '');
    if (rawLines.length === 0) return;
    
    let lines = [];
    const isTsv = rawLines.some(l => l.trim().includes('\t'));
    if (isTsv) {
        const tree = {};
        rawLines.forEach(line => {
            const parts = line.split('\t').map(p => p.trim()).filter(p => p);
            let current = tree;
            parts.forEach(part => {
                if (!current[part]) current[part] = {};
                current = current[part];
            });
        });
        const traverse = (node, depth) => {
            Object.keys(node).forEach(key => {
                lines.push('\t'.repeat(depth) + key);
                traverse(node[key], depth + 1);
            });
        };
        traverse(tree, 0);
    } else {
        lines = rawLines;
    }

    const root = { level: -1, children: [] };
    const stack = [root];
    
    lines.forEach((line) => {
      const rawIndentation = line.match(/^[\t ]*/)[0];
      let level = 0;
      if (rawIndentation.includes('\t')) {
        level = (rawIndentation.match(/\t/g) || []).length;
      } else if (rawIndentation.length > 0) {
        level = Math.max(1, Math.round(rawIndentation.length / 2));
      } else {
        level = 0;
      }
      
      const rawContent = line.trim();
      const content = rawContent.replace(/^([-*•#]|\d+[\.\)])\s*/, '').trim() || rawContent;
      if (!content) return;
      
      const nodeData = { level, content, children: [] };
      
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(nodeData);
      }
      stack.push(nodeData);
    });

    const nodeHeight = 60;
    const verticalSpacing = 40;
    const horizontalSpacing = 220;
    
    const calcHeight = (node) => {
      if (node.children.length === 0) {
        node.subtreeHeight = nodeHeight;
        return nodeHeight;
      }
      let h = 0;
      node.children.forEach(c => {
        h += calcHeight(c) + verticalSpacing;
      });
      h -= verticalSpacing;
      node.subtreeHeight = Math.max(nodeHeight, h);
      return node.subtreeHeight;
    };
    
    calcHeight(root);
    
    const paletteMap = {
      blue: ['#1e3a8a', '#2563eb', '#38bdf8', '#0284c7'],
      green: ['#064e3b', '#059669', '#10b981', '#34d399'],
      red: ['#7f1d1d', '#dc2626', '#ef4444', '#f87171'],
      orange: ['#7c2d12', '#ea580c', '#f97316', '#fb923c'],
      purple: ['#581c87', '#7c3aed', '#8b5cf6', '#a78bfa'],
      dark: ['#0f172a', '#1e293b', '#334155', '#475569'],
      sunset: ['#831843', '#db2777', '#f43f5e', '#fb7185'],
      ocean: ['#164e63', '#0891b2', '#06b6d4', '#22d3ee']
    };
    const defaultColors = ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#f97316'];
    const colors = paletteMap[theme] || defaultColors;
    const shapeTheme = (theme && !paletteMap[theme]) ? theme : 'classic';

    const center = getCenter();
    const startX = center.left + 220;
    const startY = center.top;

    let currentY = startY - root.subtreeHeight / 2;

    const renderNode = (nodeData, x, y, parentFabricNode) => {
      const color = colors[(nodeData.level || 0) % colors.length];
      const fNode = createMindMapNode(x, y, nodeData.content, color, shapeTheme);
      canvas.add(fNode);

      if (parentFabricNode) {
        const lineObj = new fabric.Line([parentFabricNode.left, parentFabricNode.top, fNode.left, fNode.top], {
          stroke: '#94a3b8', strokeWidth: 3, selectable: false, evented: false, strokeDashArray: [5, 5],
          isMindMapLine: true, mindMapFromId: parentFabricNode.mindMapId, mindMapToId: fNode.mindMapId
        });
        parentFabricNode._connectedLines.push({ from: parentFabricNode, to: fNode, line: lineObj });
        fNode._connectedLines.push({ from: parentFabricNode, to: fNode, line: lineObj });
        canvas.add(lineObj);
        canvas.sendToBack(lineObj);
      }

      let childY = y - nodeData.subtreeHeight / 2;
      nodeData.children.forEach(c => {
        childY += c.subtreeHeight / 2;
        renderNode(c, x - horizontalSpacing, childY, fNode);
        childY += c.subtreeHeight / 2 + verticalSpacing;
      });
    };

    root.children.forEach(c => {
      currentY += c.subtreeHeight / 2;
      renderNode(c, startX, currentY, null);
      currentY += c.subtreeHeight / 2 + verticalSpacing;
    });

    canvas.renderAll();
    saveHistory(canvas);
  };

  const addMindMapRoot = () => {
    if (!canvas) return;
    const center = getCenter();
    const root = createMindMapNode(center.left, center.top, 'الفكرة الرئيسية', '#1e293b');
    canvas.add(root);
    canvas.setActiveObject(root);
    setTool('select');
    canvas.requestRenderAll();
    saveHistory(canvas);
  };

  const addMindMapBranch = () => {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj || !activeObj.isMindMapNode) return;

    // RTL: children go to the left (X decreases)
    const child = createMindMapNode(activeObj.left - 220, activeObj.top + (Math.random() * 80 - 40), 'فكرة فرعية', activeObj.nodeColor || '#3b82f6', activeObj.theme || 'classic');
    const line = new fabric.Line([activeObj.left, activeObj.top, child.left, child.top], {
      stroke: '#94a3b8', strokeWidth: 3, selectable: false, evented: false, strokeDashArray: [5, 5],
      isMindMapLine: true, mindMapFromId: activeObj.mindMapId, mindMapToId: child.mindMapId
    });

    activeObj._connectedLines.push({ from: activeObj, to: child, line: line });
    child._connectedLines.push({ from: activeObj, to: child, line: line });

    canvas.add(line);
    canvas.add(child);
    canvas.sendToBack(line);
    canvas.setActiveObject(child);
    canvas.renderAll();
    saveHistory(canvas);
  };

  const addMindMapSibling = () => {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj || !activeObj.isMindMapNode) return;

    // Find parent
    const parentLine = activeObj._connectedLines.find(l => l.to === activeObj);
    if (!parentLine) {
      // It's a root node, sibling = new root node? No, usually sibling of root is a new root, but we'll add a branch
      addMindMapBranch();
      return;
    }
    const parent = parentLine.from;
    
    const sibling = createMindMapNode(activeObj.left, activeObj.top + 80, 'فكرة موازية', activeObj.nodeColor || '#3b82f6', activeObj.theme || 'classic');
    const line = new fabric.Line([parent.left, parent.top, sibling.left, sibling.top], {
      stroke: '#94a3b8', strokeWidth: 3, selectable: false, evented: false, strokeDashArray: [5, 5],
      isMindMapLine: true, mindMapFromId: parent.mindMapId, mindMapToId: sibling.mindMapId
    });

    parent._connectedLines.push({ from: parent, to: sibling, line: line });
    sibling._connectedLines.push({ from: parent, to: sibling, line: line });

    canvas.add(line);
    canvas.add(sibling);
    canvas.sendToBack(line);
    canvas.setActiveObject(sibling);
    canvas.renderAll();
    saveHistory(canvas);
  };

  const addFlashcard = (front, back, leftOffset = 0) => {
    if (!canvas) return;
    const center = getCenter();
    const card = new window.fabric.FlashcardText(front, {
      left: center.left + leftOffset, top: center.top,
      width: 250, fontSize: 24, fill: '#fff', fontFamily: 'Tajawal', fontWeight: 'bold', textAlign: 'center',
      originX: 'center', originY: 'center', selectable: true, evented: true,
      frontText: front, backText: back
    });
    canvas.add(card);
    canvas.setActiveObject(card);
    setTool('select');
    canvas.requestRenderAll();
    saveHistory(canvas);
    if (typeof broadcastSafely === 'function') broadcastSafely();
  };

  const flipActiveFlashcard = () => {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.isFlashcard) {
      const isFront = activeObj.isShowingFront;
      activeObj.set({
        text: isFront ? activeObj.backText : activeObj.frontText,
        isShowingFront: !isFront
      });
      canvas.requestRenderAll();
      saveHistory(canvas);
      if (typeof broadcastSafely === 'function') broadcastSafely();
    }
  };

  const handleSmartImport = (text) => {
    if (!canvas) return;
    const lines = text.split('\n').filter(l => l.trim() !== '');
    let offset = 0;
    lines.forEach((line) => {
      const parts = line.split('-');
      const front = parts[0] ? parts[0].trim() : 'سؤال';
      const back = parts[1] ? parts[1].trim() : 'إجابة';
      addFlashcard(front, back, offset);
      offset += 30; // Stack them slightly offset
    });
  };

  const stopVoiceTyping = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecordingVoice(false);
    setVoiceText('');
  };

  const addVoiceText = () => {
    if (!isPremium && !isAdmin) { setShowPremiumAlert(true); return; }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("متصفحك لا يدعم ميزة الإملاء الصوتي. يرجى استخدام متصفح Chrome.");
      return;
    }

    if (isRecordingVoice) {
      stopVoiceTyping();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsRecordingVoice(true);
      setVoiceText('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setVoiceText(final + interim);
    };

    recognition.onerror = (e) => {
      console.error(e);
      stopVoiceTyping();
      if(e.error !== "no-speech") alert("حدث خطأ في التسجيل: " + e.error);
    };

    recognition.start();
  };

  const submitVoiceText = () => {
    if (!canvas || !voiceText.trim()) return;
    const textStr = voiceText.trim();
    const textObj = new fabric.IText(textStr, {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, 
      fontFamily: 'Tajawal', fill: color, fontSize: 36, direction: 'rtl', textAlign: 'right'
    });
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    setTool('select');
    canvas.requestRenderAll();
    saveHistory(canvas);
    stopVoiceTyping();
  };
  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText('اكتب نصاً هنا...', {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fontFamily: 'Tajawal', fill: color, fontSize: 36, textAlign: 'right'
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    setTool('select');
    setTimeout(() => {
      if (text.enterEditing) text.enterEditing();
      if (text.selectAll) text.selectAll();
      canvas.requestRenderAll();
    }, 50);
    saveHistory(canvas);
  };

  const commitShape = (obj) => {
    if (!canvas || !obj) return;
    canvas.add(obj);
    canvas.setActiveObject(obj);
    setTool('select');
    canvas.requestRenderAll();
    saveHistory(canvas);
  };

  const addRect = () => {
    if (!canvas) return;
    const fill = isShapeFilled ? `${color}33` : 'transparent';
    const rect = new fabric.Rect({
      ...getCenter(), originX: 'center', originY: 'center',
      selectable: true, evented: true, hasControls: true,
      width: 120, height: 120, fill, stroke: color, strokeWidth: lineWidth
    });
    commitShape(rect);
  };

  const addCircle = () => {
    if (!canvas) return;
    const fill = isShapeFilled ? `${color}33` : 'transparent';
    const circle = new fabric.Circle({
      ...getCenter(), originX: 'center', originY: 'center',
      selectable: true, evented: true, hasControls: true,
      radius: 60, fill, stroke: color, strokeWidth: lineWidth
    });
    commitShape(circle);
  };

  const addTriangle = () => {
    if (!canvas) return;
    const fill = isShapeFilled ? `${color}33` : 'transparent';
    const triangle = new fabric.Triangle({
      ...getCenter(), originX: 'center', originY: 'center',
      selectable: true, evented: true, hasControls: true,
      width: 120, height: 120, fill, stroke: color, strokeWidth: lineWidth
    });
    commitShape(triangle);
  };

  const addLine = () => {
    if (!canvas) return;
    const center = getCenter();
    const line = new fabric.Line([center.left - 75, center.top, center.left + 75, center.top], {
      originX: 'center', originY: 'center',
      selectable: true, evented: true, hasControls: true,
      stroke: color, strokeWidth: lineWidth
    });
    commitShape(line);
  };

  const addArrow = () => {
    if (!canvas) return;
    const center = getCenter();
    const arrowPath = new fabric.Path('M 0 0 L 120 0 L 105 -12 M 120 0 L 105 12', {
      left: center.left, top: center.top, originX: 'center', originY: 'center',
      selectable: true, evented: true, hasControls: true,
      stroke: color, strokeWidth: lineWidth, strokeLineCap: 'round', strokeLineJoin: 'round',
      fill: 'transparent'
    });
    commitShape(arrowPath);
  };

  const addRuler = () => {
    if (!canvas) return;
    const rulerWidth = isMobile ? 320 : 500;
    const rect = new fabric.Rect({ width: rulerWidth, height: 60, fill: 'rgba(255,255,255,0.85)', stroke: '#333' });
    const group = [rect];
    for(let i=0; i<=rulerWidth; i+=10) {
      const h = (i % 50 === 0) ? 30 : (i % 50 === 25 ? 20 : 10);
      group.push(new fabric.Line([i, 0, i, h], { stroke: '#333', strokeWidth: 1 }));
      if(i % 50 === 0 && i !== 0) {
        group.push(new fabric.Text((i/10).toString(), { left: i - 8, top: 35, fontSize: 16, fontFamily: 'Arial' }));
      }
    }
    const ruler = new fabric.Group(group, { ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true });
    commitShape(ruler);
  }

  const addProtractor = () => {
    if (!canvas) return;
    const pWidth = isMobile ? 300 : 400;
    const pHeight = pWidth / 2;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pWidth}" height="${pHeight}" viewBox="0 0 400 200">`;
    svg += '<path d="M 20 180 A 160 160 0 0 1 380 180 Z" fill="rgba(200, 230, 255, 0.4)" stroke="#333" stroke-width="3"/>';
    // center mark
    svg += '<line x1="200" y1="180" x2="200" y2="170" stroke="#333" stroke-width="2"/>';
    svg += '<circle cx="200" cy="180" r="4" fill="#333"/>';
    // ticks
    for(let i=0; i<=180; i+=10) {
        let angle = i * Math.PI / 180;
        let r1 = 160;
        let r2 = (i % 90 === 0) ? 140 : (i % 45 === 0 ? 145 : 150);
        let x1 = 200 - r1 * Math.cos(angle);
        let y1 = 180 - r1 * Math.sin(angle);
        let x2 = 200 - r2 * Math.cos(angle);
        let y2 = 180 - r2 * Math.sin(angle);
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#333" stroke-width="${i%90===0?3:1}"/>`;
        
        if (i % 30 === 0) {
            let tx = 200 - 125 * Math.cos(angle);
            let ty = 180 - 125 * Math.sin(angle);
            svg += `<text x="${tx}" y="${ty}" font-size="12" text-anchor="middle" dominant-baseline="middle" transform="rotate(${90-i}, ${tx}, ${ty})">${i}</text>`;
        }
    }
    svg += '</svg>';
    
    fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true });
        commitShape(obj);
    });
  }

  const addCompass = () => {
    if (!canvas) return;
    setTool('compass');
  }

  const addStar = () => {
    if (!canvas) return;
    const fill = isShapeFilled ? `${color}33` : 'transparent';
    const starPath = 'M 50 0 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z';
    const star = new fabric.Path(starPath, {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fill, stroke: color, strokeWidth: lineWidth, scaleX: 1.5, scaleY: 1.5
    });
    commitShape(star);
  }

  const addHexagon = () => {
    if (!canvas) return;
    const fill = isShapeFilled ? `${color}33` : 'transparent';
    const hex = new fabric.Polygon([
      {x: 50, y: 0}, {x: 100, y: 25}, {x: 100, y: 75},
      {x: 50, y: 100}, {x: 0, y: 75}, {x: 0, y: 25}
    ], {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fill, stroke: color, strokeWidth: lineWidth
    });
    commitShape(hex);
  }

  const addCylinder = () => {
    if (!canvas) return;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="150" viewBox="0 0 100 150">';
    svg += `<ellipse cx="50" cy="20" rx="40" ry="15" fill="transparent" stroke="${color}" stroke-width="${lineWidth}"/>`;
    svg += `<path d="M 10 20 L 10 130 A 40 15 0 0 0 90 130 L 90 20" fill="transparent" stroke="${color}" stroke-width="${lineWidth}"/>`;
    svg += '</svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true });
        commitShape(obj);
    });
  }

  const addCube = () => {
    if (!canvas) return;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">';
    svg += `<polygon points="20,40 80,40 80,100 20,100" fill="transparent" stroke="${color}" stroke-width="${lineWidth}"/>`;
    svg += `<polygon points="40,20 100,20 100,80 40,80" fill="transparent" stroke="${color}" stroke-width="${lineWidth}"/>`;
    svg += `<line x1="20" y1="40" x2="40" y2="20" stroke="${color}" stroke-width="${lineWidth}"/>`;
    svg += `<line x1="80" y1="40" x2="100" y2="20" stroke="${color}" stroke-width="${lineWidth}"/>`;
    svg += `<line x1="80" y1="100" x2="100" y2="80" stroke="${color}" stroke-width="${lineWidth}"/>`;
    svg += `<line x1="20" y1="100" x2="40" y2="80" stroke="${color}" stroke-width="${lineWidth}"/>`;
    svg += '</svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true });
        commitShape(obj);
    });
  }

  const addCloud = () => {
    if (!canvas) return;
    const fill = isShapeFilled ? `${color}33` : 'transparent';
    const path = "M 35 30 Q 30 10 55 10 Q 75 10 80 25 Q 105 25 100 45 Q 115 65 95 80 Q 90 100 65 95 Q 40 105 25 85 Q 5 80 15 55 Q 5 35 35 30 Z";
    const cloud = new fabric.Path(path, {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fill, stroke: color, strokeWidth: lineWidth, scaleX: 1.5, scaleY: 1.5
    });
    commitShape(cloud);
  }

  const addCone = () => {
    if (!canvas) return;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="150" viewBox="0 0 100 150">';
    svg += `<ellipse cx="50" cy="130" rx="40" ry="15" fill="transparent" stroke="${color}" stroke-width="${lineWidth}"/>`;
    svg += `<path d="M 10 130 L 50 10 L 90 130" fill="transparent" stroke="${color}" stroke-width="${lineWidth}"/>`;
    svg += '</svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true });
        commitShape(obj);
    });
  }

  const addPyramid = () => {
    if (!canvas) return;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">';
    svg += `<polygon points="10,100 110,100 60,10" fill="transparent" stroke="${color}" stroke-width="${lineWidth}"/>`;
    svg += `<line x1="60" y1="10" x2="75" y2="100" stroke="${color}" stroke-width="${lineWidth}"/>`;
    svg += `<line x1="10" y1="100" x2="75" y2="100" stroke="${color}" stroke-width="${lineWidth}"/>`;
    svg += '</svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true });
        commitShape(obj);
    });
  }

  const addEllipse = () => {
    if (!canvas) return;
    const fill = isShapeFilled ? `${color}33` : 'transparent';
    const ellipse = new fabric.Ellipse({
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, rx: 60, ry: 30, fill, stroke: color, strokeWidth: lineWidth
    });
    commitShape(ellipse);
  }

  const addCheckmark = () => {
    if (!canvas) return;
    const path = "M 10 50 L 40 80 L 90 10";
    const check = new fabric.Path(path, {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fill: 'transparent', stroke: '#10b981', strokeWidth: lineWidth + 2, strokeLineCap: 'round', strokeLineJoin: 'round'
    });
    commitShape(check);
  }

  const addCross = () => {
    if (!canvas) return;
    const path = "M 20 20 L 80 80 M 80 20 L 20 80";
    const cross = new fabric.Path(path, {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fill: 'transparent', stroke: '#ef4444', strokeWidth: lineWidth + 2, strokeLineCap: 'round'
    });
    commitShape(cross);
  }

  const addSmiley = () => {
    if (!canvas) return;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">';
    svg += `<circle cx="50" cy="50" r="45" fill="transparent" stroke="${color}" stroke-width="${lineWidth}"/>`;
    svg += `<circle cx="35" cy="40" r="5" fill="${color}"/>`;
    svg += `<circle cx="65" cy="40" r="5" fill="${color}"/>`;
    svg += `<path d="M 30 65 Q 50 85 70 65" fill="transparent" stroke="${color}" stroke-width="${lineWidth}" stroke-linecap="round"/>`;
    svg += '</svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true });
        commitShape(obj);
    });
  }

  const addEmoji = (emojiChar) => {
    if (!canvas) return;
    const text = new fabric.IText(emojiChar, {
      ...getCenter(),
      originX: 'center',
      originY: 'center',
      fontSize: 80,
      selectable: true,
      evented: true,
      hasControls: true
    });
    commitShape(text);
  };

  const addLightbulb = () => {
    if (!canvas) return;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="120" viewBox="0 0 100 120">';
    svg += `<path d="M 30 90 L 70 90 L 65 105 L 35 105 Z" fill="${color}" stroke="#333" stroke-width="2"/>`; // base
    svg += `<path d="M 38 105 L 62 105 L 55 115 L 45 115 Z" fill="#666" />`; // tip
    svg += `<path d="M 50 10 C 25 10 20 40 30 60 C 35 70 30 90 30 90 L 70 90 C 70 90 65 70 70 60 C 80 40 75 10 50 10 Z" fill="rgba(250, 204, 21, 0.3)" stroke="${color}" stroke-width="${lineWidth}"/>`; // glass
    svg += `<path d="M 40 60 Q 50 40 60 60" fill="transparent" stroke="#555" stroke-width="2"/>`; // filament
    svg += '</svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true });
        canvas.add(obj); canvas.setActiveObject(obj); setTool('select');
    });
  }

  const addRotatingGear = () => {
    if (!canvas) return;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <path fill="#475569" d="M85.4,56.6c0.2-2.2,0.4-4.4,0.4-6.6s-0.1-4.4-0.4-6.6l10.9-8.5c1-0.8,1.2-2.2,0.6-3.3l-10.4-18c-0.6-1-1.9-1.5-3.1-1.1 l-12.8,5.1c-2.7-2-5.6-3.8-8.7-5.1L59.3,0.9C59.1,0.4,58,0,56.8,0H36.1c-1.2,0-2.3,0.4-2.5,1l-1.9,13.6c-3.2,1.3-6.1,3.2-8.7,5.1 l-12.8-5.1c-1.1-0.4-2.5,0-3.1,1.1l-10.4,18c-0.6,1-0.4,2.5,0.6,3.3L18.2,45c-0.2,2.2-0.4,4.4-0.4,6.6s0.1,4.4,0.4,6.6L7.3,66.8 c-1,0.8-1.2,2.2-0.6,3.3l10.4,18c0.6,1,1.9,1.5,3.1,1.1l12.8-5.1c2.7,2,5.6,3.8,8.7,5.1L43.6,103c0.2,0.6,1.3,1,2.5,1h20.7 c1.2,0,2.3-0.4,2.5-1l1.9-13.6c3.2-1.3,6.1-3.2,8.7-5.1l12.8,5.1c1.1,0.4,2.5,0,3.1-1.1l10.4-18c0.6-1,0.4-2.5-0.6-3.3L85.4,56.6z M50,71.5c-11.9,0-21.5-9.6-21.5-21.5S38.1,28.5,50,28.5S71.5,38.1,71.5,50S61.9,71.5,50,71.5z"/>
    </svg>`;
    fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, originX: 'center', originY: 'center' });
        canvas.add(obj);
        
        const animate = () => {
          if (!canvas.contains(obj)) return;
          obj.animate('angle', obj.angle + 360, {
            duration: 4000,
            easing: fabric.util.ease.linear,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: animate
          });
        };
        animate();
    });
  }

  const addPulsingStar = () => {
    if (!canvas) return;
    const starPath = 'M 50 0 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z';
    const star = new fabric.Path(starPath, {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fill: '#facc15', stroke: '#ca8a04', strokeWidth: 2, 
      originX: 'center', originY: 'center', scaleX: 1, scaleY: 1
    });
    canvas.add(star);
    
    const animateUp = () => {
      if (!canvas.contains(star)) return;
      star.animate('scaleX', 1.5, { duration: 800, onChange: canvas.renderAll.bind(canvas), onComplete: animateDown });
      star.animate('scaleY', 1.5, { duration: 800 });
    };
    const animateDown = () => {
      if (!canvas.contains(star)) return;
      star.animate('scaleX', 1, { duration: 800, onChange: canvas.renderAll.bind(canvas), onComplete: animateUp });
      star.animate('scaleY', 1, { duration: 800 });
    };
    animateUp();
  }

  const addBlinkingArrow = () => {
    if (!canvas) return;
    const arrow = new fabric.Polygon([
      {x: 0, y: 20}, {x: 50, y: 20}, {x: 50, y: 0}, 
      {x: 100, y: 35}, {x: 50, y: 70}, {x: 50, y: 50}, {x: 0, y: 50}
    ], {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fill: '#ef4444', originX: 'center', originY: 'center'
    });
    canvas.add(arrow);
    
    const animateOut = () => {
      if (!canvas.contains(arrow)) return;
      arrow.animate('opacity', 0.2, { duration: 500, onChange: canvas.renderAll.bind(canvas), onComplete: animateIn });
    };
    const animateIn = () => {
      if (!canvas.contains(arrow)) return;
      arrow.animate('opacity', 1, { duration: 500, onChange: canvas.renderAll.bind(canvas), onComplete: animateOut });
    };
    animateOut();
  }

  const addBeatingHeart = () => {
    if (!canvas) return;
    const betterHeartPath = "M 50 80 Q 90 50 90 30 A 20 20 0 0 0 50 30 A 20 20 0 0 0 10 30 Q 10 50 50 80 Z";
    const betterHeart = new fabric.Path(betterHeartPath, {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fill: '#ef4444', stroke: '#b91c1c', strokeWidth: 2, originX: 'center', originY: 'center'
    });
    canvas.add(betterHeart);
    
    const animateUp = () => {
      if (!canvas.contains(betterHeart)) return;
      betterHeart.animate('scaleX', 1.2, { duration: 300, onChange: canvas.renderAll.bind(canvas), onComplete: animateDown });
      betterHeart.animate('scaleY', 1.2, { duration: 300 });
    };
    const animateDown = () => {
      if (!canvas.contains(betterHeart)) return;
      betterHeart.animate('scaleX', 1, { duration: 400, onChange: canvas.renderAll.bind(canvas), onComplete: () => setTimeout(animateUp, 400) });
      betterHeart.animate('scaleY', 1, { duration: 400 });
    };
    animateUp();
  }

  const addWarningTriangle = () => {
    if (!canvas) return;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">';
    svg += '<polygon points="50,10 90,85 10,85" fill="#facc15" stroke="#ca8a04" stroke-width="4" stroke-linejoin="round"/>';
    svg += '<rect x="46" y="35" width="8" height="30" fill="#1e293b"/>';
    svg += '<circle cx="50" cy="75" r="5" fill="#1e293b"/>';
    svg += '</svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, originX: 'center', originY: 'center' });
        canvas.add(obj);
        
        const animateOut = () => {
          if (!canvas.contains(obj)) return;
          obj.animate('opacity', 0.1, { duration: 300, onChange: canvas.renderAll.bind(canvas), onComplete: animateIn });
        };
        const animateIn = () => {
          if (!canvas.contains(obj)) return;
          obj.animate('opacity', 1, { duration: 300, onChange: canvas.renderAll.bind(canvas), onComplete: () => setTimeout(animateOut, 1000) });
        };
        setTimeout(animateOut, 1000);
    });
  }

  const addRotatingHourglass = () => {
    if (!canvas) return;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="100" viewBox="0 0 80 100">';
    svg += '<polygon points="10,10 70,10 45,50 70,90 10,90 35,50" fill="rgba(200,230,255,0.4)" stroke="#334155" stroke-width="4" stroke-linejoin="round"/>';
    svg += '<line x1="5" y1="10" x2="75" y2="10" stroke="#334155" stroke-width="6" stroke-linecap="round"/>';
    svg += '<line x1="5" y1="90" x2="75" y2="90" stroke="#334155" stroke-width="6" stroke-linecap="round"/>';
    svg += '<polygon points="20,15 60,15 45,40 35,40" fill="#fbbf24"/>'; // sand top
    svg += '<polygon points="35,60 45,60 60,85 20,85" fill="#fbbf24"/>'; // sand bottom
    svg += '</svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, originX: 'center', originY: 'center' });
        canvas.add(obj);
        
        const animate = () => {
          if (!canvas.contains(obj)) return;
          obj.animate('angle', obj.angle + 180, {
            duration: 1000,
            easing: fabric.util.ease.easeInOutBack,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: () => setTimeout(animate, 2000)
          });
        };
        setTimeout(animate, 2000);
    });
  }

  const addSyncArrows = () => {
    if (!canvas) return;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">';
    svg += '<path d="M 50 15 A 35 35 0 0 1 85 50" fill="none" stroke="#2563eb" stroke-width="8" stroke-linecap="round"/>';
    svg += '<polygon points="85,35 100,50 70,50" fill="#2563eb"/>';
    svg += '<path d="M 50 85 A 35 35 0 0 1 15 50" fill="none" stroke="#2563eb" stroke-width="8" stroke-linecap="round"/>';
    svg += '<polygon points="15,65 0,50 30,50" fill="#2563eb"/>';
    svg += '</svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, originX: 'center', originY: 'center' });
        canvas.add(obj);
        
        const animate = () => {
          if (!canvas.contains(obj)) return;
          obj.animate('angle', obj.angle + 360, {
            duration: 2000,
            easing: fabric.util.ease.linear,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: animate
          });
        };
        animate();
    });
  }
  const addSpeechBubble = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="M 10 20 Q 10 10 20 10 L 80 10 Q 90 10 90 20 L 90 70 Q 90 80 80 80 L 40 80 L 15 95 L 20 75 Q 10 70 10 60 Z" fill="transparent" stroke="' + color + '" stroke-width="' + lineWidth + '"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true });
        canvas.add(obj); canvas.setActiveObject(obj); setTool('select');
    });
  }

  const addDiamond = () => {
    if (!canvas) return;
    const diamond = new fabric.Polygon([
      {x: 50, y: 0}, {x: 100, y: 50}, {x: 50, y: 100}, {x: 0, y: 50}
    ], {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fill: 'transparent', stroke: color, strokeWidth: lineWidth
    });
    canvas.add(diamond); canvas.setActiveObject(diamond); setTool('select');
  }

  const addWideArrow = () => {
    if (!canvas) return;
    const arrow = new fabric.Polygon([
      {x: 0, y: 30}, {x: 60, y: 30}, {x: 60, y: 10}, 
      {x: 100, y: 50}, {x: 60, y: 90}, {x: 60, y: 70}, {x: 0, y: 70}
    ], {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fill: 'transparent', stroke: color, strokeWidth: lineWidth
    });
    canvas.add(arrow); canvas.setActiveObject(arrow); setTool('select');
  }

  const addBell = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="M 50 15 A 25 25 0 0 0 25 40 L 25 60 L 15 75 L 85 75 L 75 60 L 75 40 A 25 25 0 0 0 50 15 Z" fill="transparent" stroke="' + color + '" stroke-width="' + lineWidth + '"/><circle cx="50" cy="85" r="8" fill="' + color + '"/><path d="M 45 15 A 5 5 0 0 1 55 15 Z" fill="' + color + '"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true });
        canvas.add(obj); canvas.setActiveObject(obj); setTool('select');
    });
  }

  const addLoadingSpinner = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" stroke-width="8"/><path d="M 50 10 A 40 40 0 0 1 90 50" fill="none" stroke="#3b82f6" stroke-width="8" stroke-linecap="round"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true });
        canvas.add(obj);
        
        const animate = () => {
          if (!canvas.contains(obj)) return;
          obj.animate('angle', obj.angle + 360, {
            duration: 1000, easing: fabric.util.ease.linear, onChange: canvas.renderAll.bind(canvas), onComplete: animate
          });
        };
        animate();
    });
  }

  const addSwingingPendulum = () => {
    if (!canvas) return;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="150" viewBox="0 0 100 150"><line x1="50" y1="10" x2="50" y2="120" stroke="#475569" stroke-width="4"/><circle cx="50" cy="120" r="20" fill="#f59e0b"/><circle cx="50" cy="10" r="5" fill="#1e293b"/></svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), top: getCenter().top - 50, originX: 'center', originY: 'top', selectable: true, evented: true, hasControls: true });
        canvas.add(obj);
        
        const animateRight = () => {
          if (!canvas.contains(obj)) return;
          obj.animate('angle', 45, { duration: 1000, easing: fabric.util.ease.easeInOutQuad, onChange: canvas.renderAll.bind(canvas), onComplete: animateLeft });
        };
        const animateLeft = () => {
          if (!canvas.contains(obj)) return;
          obj.animate('angle', -45, { duration: 1000, easing: fabric.util.ease.easeInOutQuad, onChange: canvas.renderAll.bind(canvas), onComplete: animateRight });
        };
        animateRight();
    });
  }

  const addBouncingBall = () => {
    if (!canvas) return;
    const ball = new fabric.Circle({
      ...getCenter(), radius: 25, fill: '#ef4444', originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true
    });
    canvas.add(ball);
    
    const startY = ball.top;
    const bounceY = startY - 100;

    const animateUp = () => {
      if (!canvas.contains(ball)) return;
      ball.animate('top', bounceY, { duration: 600, easing: fabric.util.ease.easeOutQuad, onChange: canvas.renderAll.bind(canvas), onComplete: animateDown });
      ball.animate('scaleX', 1, { duration: 200 });
      ball.animate('scaleY', 1, { duration: 200 });
    };
    const animateDown = () => {
      if (!canvas.contains(ball)) return;
      ball.animate('top', startY, { duration: 600, easing: fabric.util.ease.easeInQuad, onChange: canvas.renderAll.bind(canvas), onComplete: () => {
         ball.animate('scaleX', 1.2, { duration: 100, onChange: canvas.renderAll.bind(canvas) });
         ball.animate('scaleY', 0.8, { duration: 100, onComplete: animateUp });
      }});
    };
    animateUp();
  }

  const addShakingRocket = () => {
    if (!canvas) return;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">';
    // fire
    svg += '<path d="M 35 80 Q 50 110 65 80 Q 50 90 35 80 Z" fill="#ef4444"/>';
    svg += '<path d="M 40 80 Q 50 100 60 80 Q 50 85 40 80 Z" fill="#facc15"/>';
    // rocket body
    svg += '<path d="M 50 10 C 70 30 70 70 70 80 L 30 80 C 30 70 30 30 50 10 Z" fill="#e2e8f0" stroke="#334155" stroke-width="2"/>';
    // window
    svg += '<circle cx="50" cy="45" r="8" fill="#38bdf8" stroke="#334155" stroke-width="2"/>';
    // fins
    svg += '<path d="M 30 60 L 15 80 L 30 75 Z" fill="#ef4444" stroke="#334155" stroke-width="2" stroke-linejoin="round"/>';
    svg += '<path d="M 70 60 L 85 80 L 70 75 Z" fill="#ef4444" stroke="#334155" stroke-width="2" stroke-linejoin="round"/>';
    svg += '</svg>';
    fabric.loadSVGFromString(svg, (objects, options) => {
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, originX: 'center', originY: 'center' });
        canvas.add(obj);
        
        const animateRight = () => {
          if (!canvas.contains(obj)) return;
          obj.animate('angle', 5, { duration: 50, onChange: canvas.renderAll.bind(canvas), onComplete: animateLeft });
        };
        const animateLeft = () => {
          if (!canvas.contains(obj)) return;
          obj.animate('angle', -5, { duration: 50, onChange: canvas.renderAll.bind(canvas), onComplete: animateCenter });
        };
        const animateCenter = () => {
           if (!canvas.contains(obj)) return;
           obj.animate('angle', 0, { duration: 50, onChange: canvas.renderAll.bind(canvas), onComplete: animateRight });
        }
        animateRight();
    });
  }

  const videoRenderLoopRef = useRef(null)

  const toggleVisibility = () => {
    const obj = canvas?.getActiveObject()
    if (!obj) return
    obj.set({ opacity: obj.opacity === 0.2 ? 1 : 0.2 })
    canvas.renderAll()
  }

  const addMathEquation = () => {
    if (!canvas || !mathInput.trim()) return;
    const cleanColor = (color || '#1e293b').replace('#', '');
    const url = `https://latex.codecogs.com/png.image?\\dpi{300}${encodeURIComponent(`\\color[HTML]{${cleanColor}} ${mathInput.trim()}`)}`;
    fabric.Image.fromURL(url, (img) => {
      if (!img) return;
      img.set({ ...getCenter(), originX: 'center', originY: 'center', scaleX: 0.6, scaleY: 0.6, selectable: true, evented: true, hasControls: true });
      canvas.add(img);
      canvas.setActiveObject(img);
      setTool('select');
      setIsMathModalOpen(false);
      setMathInput('');
    }, { crossOrigin: 'anonymous' });
  }

  const addAxes = () => {
    if (!canvas) return;
    const center = getCenter();
    const length = 400;
    const xAxis = new fabric.Line([center.left - length/2, center.top, center.left + length/2, center.top], { stroke: color, strokeWidth: lineWidth });
    const yAxis = new fabric.Line([center.left, center.top - length/2, center.left, center.top + length/2], { stroke: color, strokeWidth: lineWidth });
    const xArrow = new fabric.Triangle({ left: center.left + length/2 + 5, top: center.top, width: 10, height: 10, fill: color, angle: 90, originX: 'center', originY: 'center' });
    const yArrow = new fabric.Triangle({ left: center.left, top: center.top - length/2 - 5, width: 10, height: 10, fill: color, angle: 0, originX: 'center', originY: 'center' });
    const axesGroup = new fabric.Group([xAxis, yAxis, xArrow, yArrow], { ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true });
    canvas.add(axesGroup); canvas.setActiveObject(axesGroup); setTool('select');
  }

  const handleVideoUpload = (e) => {
    if (!canvas || !e.target.files[0]) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    const videoEl = document.createElement('video');
    videoEl.src = url;
    videoEl.playsInline = true;
    videoEl.crossOrigin = 'anonymous';
    
    videoEl.addEventListener('loadeddata', () => {
      videoEl.width = videoEl.videoWidth;
      videoEl.height = videoEl.videoHeight;
      const center = getCenter();
      const videoObj = new fabric.Image(videoEl, {
        left: center.left,
        top: center.top,
        originX: 'center',
        originY: 'center',
        objectCaching: false,
      });
      const maxW = Math.min(canvas.width * 0.8, isMobile ? 320 : 600);
      if (videoEl.videoWidth > maxW) {
        videoObj.scaleToWidth(maxW);
      }
      canvas.add(videoObj);
      canvas.setActiveObject(videoObj);
      setTool('select');
      canvas.requestRenderAll();
      saveHistory(canvas);
      
      const render = () => {
        if (!canvas || !canvas.contains(videoObj)) {
          if (videoRenderLoopRef.current) {
            cancelAnimationFrame(videoRenderLoopRef.current);
            videoRenderLoopRef.current = null;
          }
          return;
        }
        canvas.requestRenderAll();
        if (!videoEl.paused && !videoEl.ended) {
          videoRenderLoopRef.current = requestAnimationFrame(render);
        } else {
          videoRenderLoopRef.current = null;
        }
      };

      videoEl.addEventListener('play', () => {
        if (videoRenderLoopRef.current) cancelAnimationFrame(videoRenderLoopRef.current);
        videoRenderLoopRef.current = requestAnimationFrame(render);
      });
      videoEl.addEventListener('pause', () => {
        if (videoRenderLoopRef.current) {
          cancelAnimationFrame(videoRenderLoopRef.current);
          videoRenderLoopRef.current = null;
        }
        canvas.requestRenderAll();
      });
      videoEl.addEventListener('ended', () => {
        if (videoRenderLoopRef.current) {
          cancelAnimationFrame(videoRenderLoopRef.current);
          videoRenderLoopRef.current = null;
        }
        canvas.requestRenderAll();
      });
    });
    
    e.target.value = null;
  };

  const addYoutubeVideo = () => {
    const url = window.prompt('أدخل رابط فيديو يوتيوب (YouTube URL):');
    if (!url) return;
    
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      window.alert('رابط يوتيوب غير صحيح.');
      return;
    }

    setYoutubeVideos(prev => [...prev, {
      id: Date.now(),
      videoId,
      x: window.innerWidth > 600 ? window.innerWidth / 2 - 200 : 20,
      y: 100
    }]);
  };

  const playActiveVideo = () => {
    const obj = canvas?.getActiveObject();
    if (obj && obj.getElement && obj.getElement().tagName === 'VIDEO') {
      obj.getElement().play();
    }
  };

  const pauseActiveVideo = () => {
    const obj = canvas?.getActiveObject();
    if (obj && obj.getElement && obj.getElement().tagName === 'VIDEO') {
      obj.getElement().pause();
    }
  };

  const toggleMuteActiveVideo = () => {
    const obj = canvas?.getActiveObject();
    if (obj && obj.getElement && obj.getElement().tagName === 'VIDEO') {
      obj.getElement().muted = !obj.getElement().muted;
    }
  };

  const triggerCheer = async (type = 'fireworks') => {
    const canvasObj = canvas;
    if (!canvasObj) return;

    try {
      const { playCheerSound } = await import('../../utils/soundEffects');
      playCheerSound(type);
    } catch(e) {}

    try {
      const { renderCheerOnCanvas } = await import('../../utils/cheerEffects');
      renderCheerOnCanvas(canvasObj, type);
    } catch(e) {}
  };

  const handleImageUpload = (e) => {
    if (!canvas || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (f) => {
      fabric.Image.fromURL(f.target.result, (img) => {
        if (!img) return;
        const maxW = Math.min(canvas.width * 0.8, isMobile ? 300 : 500);
        if (img.width > maxW) {
          img.scaleToWidth(maxW);
        }
        const center = getCenter();
        img.set({
          left: center.left,
          top: center.top,
          originX: 'center',
          originY: 'center',
          selectable: true,
          evented: true,
          hasControls: true
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        setTool('select');
        canvas.requestRenderAll();
        saveHistory(canvas);
      });
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const colors = [
    { name: 'مؤقت', hex: '#0f172a' }, { name: 'مؤقت', hex: '#2563eb' },
    { name: 'مؤقت', hex: '#dc2626' }, { name: 'مؤقت', hex: '#16a34a' },
    { name: 'برتقالي', hex: '#ea580c' }, { name: 'بنفسجي', hex: '#9333ea' },
  ]

  const isVideo = canvas && canvas.getActiveObject() && canvas.getActiveObject().getElement && canvas.getActiveObject().getElement().tagName === 'VIDEO';

  const addQuranAyah = async () => {
    if (!canvas) return;
    setIsFetchingAyah(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${quranSurah}:${quranAyah}/quran-uthmani`);
      const data = await res.json();
      
      if (data.code === 200) {
        const ayahText = data.data.text + ` ?${data.data.numberInSurah}?`;
        // مؤقتإيقاف إيقاف? مؤقت مؤقت? 🔥 ناري!إيقاف مؤقت? إيقاف? مزيد من الأدوات مؤقت? مؤقت? إيقاف مؤقتإيقاف
        const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${data.data.number}.mp3`;

        const textObj = new fabric.Textbox(ayahText, {
          left: canvas.width / 2,
          top: canvas.height / 2,
          width: Math.min(800, canvas.width - 200),
          fontSize: 40,
          fontFamily: 'Tajawal, Arial',
          textAlign: 'center',
          direction: 'rtl',
          fill: colorRef.current,
          originX: 'center',
          originY: 'center'
        });
        
        // 🔥 ناري! إيقاف مزيد من الأدوات
        const playBtn = new fabric.Text('إيقاف إيقاف', {
          left: canvas.width / 2,
          top: (canvas.height / 2) + 60,
          fontSize: 35,
          originX: 'center',
          originY: 'center',
          hoverCursor: 'pointer',
          selectable: true
        });
        
        // إيقافمكتبة مؤقت? إيقاف? مؤقتمؤقت?
        playBtn.quranAudioUrl = audioUrl;
        
        canvas.add(textObj);
        canvas.add(playBtn);
        canvas.setActiveObject(textObj);
        canvas.renderAll();
        saveHistory(canvas);
        setShowQuranModal(false);
        setTool('select');
      } else {
         alert('الآية غير موجودة.');
      }
    } catch (e) {
      alert('حدث خطأ أثناء جلب الآية. تأكد من اتصالك بالإنترنت.');
    } finally {
      setIsFetchingAyah(false);
    }
  };

  const addTicTacToeGrid = () => {
    if (!canvas) return;
    const size = 300;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const third = size / 3;

    const lineProps = { stroke: colorRef.current, strokeWidth: 5, selectable: false, evented: false };
    
    // Vertical lines
    const v1 = new fabric.Line([cx - size/2 + third, cy - size/2, cx - size/2 + third, cy + size/2], lineProps);
    const v2 = new fabric.Line([cx - size/2 + 2*third, cy - size/2, cx - size/2 + 2*third, cy + size/2], lineProps);
    
    // Horizontal lines
    const h1 = new fabric.Line([cx - size/2, cy - size/2 + third, cx + size/2, cy - size/2 + third], lineProps);
    const h2 = new fabric.Line([cx - size/2, cy - size/2 + 2*third, cx + size/2, cy - size/2 + 2*third], lineProps);

    const group = new fabric.Group([v1, v2, h1, h2], {
      left: cx, top: cy, originX: 'center', originY: 'center', selectable: true, lockScalingX: true, lockScalingY: true
    });

    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
    saveHistory(canvas);
  };

  const handlePasteFromClipboard = async () => {
    if (!isPremium && !isAdmin) {
      setShowPremiumAlert(true);
      return;
    }
    try {
      const clipboardItems = await navigator.clipboard.read();
      let foundImage = false;
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const url = URL.createObjectURL(blob);
            fabric.Image.fromURL(url, (img) => {
              if (img.width > canvas.width * 0.8) img.scaleToWidth(canvas.width * 0.8);
              canvas.add(img);
              canvas.centerObject(img);
              canvas.renderAll();
              saveHistory(canvas);
            });
            foundImage = true;
            return;
          }
        }
      }
      if (!foundImage) alert('لم يتم العثور على صورة في الحافظة.');
    } catch (err) {
      alert('حدث خطأ أثناء اللصق.');
    }
  };

  const takeScreenshot = () => {
    if (!isPremium && !isAdmin) { setShowPremiumAlert(true); return; }
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: 'png', multiplier: isMobile ? 1.5 : 2 });
    const link = document.createElement('a');
    const todayStr = new Date().toISOString().slice(0, 10);
    link.download = `لقطة_السبورة_${todayStr}.png`;
    link.href = dataURL;
    link.click();
  };

  const toggleRecording = async () => {
    if (!isPremium && !isAdmin) { setShowPremiumAlert(true); return; }
    
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    if (isMobile || typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert('تسجيل الشاشة والصوت متاح فقط على أجهزة الكمبيوتر والمكتبي (Desktop / Laptop) عبر متصفحات تدعم مشاركة الشاشة.');
      return;
    }
    
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      let finalStream = displayStream;

      try {
        const voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Use AudioContext to mix system audio and mic audio into a single track
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const dest = audioContext.createMediaStreamDestination();
        
        if (displayStream.getAudioTracks().length > 0) {
          audioContext.createMediaStreamSource(displayStream).connect(dest);
        }
        audioContext.createMediaStreamSource(voiceStream).connect(dest);
        
        const mergedAudioTracks = dest.stream.getAudioTracks();
        finalStream = new MediaStream([
          ...displayStream.getVideoTracks(),
          ...mergedAudioTracks
        ]);

        // Stop mic when screen sharing stops
        displayStream.getVideoTracks()[0].onended = () => {
          voiceStream.getTracks().forEach(track => track.stop());
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        };
      } catch (err) {
        console.warn("Could not get microphone access for recording, falling back to system audio", err);
      }

      mediaRecorderRef.current = new MediaRecorder(finalStream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const todayStr = new Date().toISOString().slice(0, 10);
        a.download = `تسجيل_الدرس_${todayStr}.webm`;
        a.click();
        recordedChunksRef.current = [];
        finalStream.getTracks().forEach(track => track.stop());
        displayStream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert('حدث خطأ أثناء تسجيل الشاشة.');
    }
  };

  const addCamera = () => {
    if (!isPremium && !isAdmin) { setShowPremiumAlert(true); return; }
    setCameras([...cameras, { id: Date.now(), x: window.innerWidth - 350, y: 100 }]);
  };

  const addIframe = () => {
    if (!isPremium && !isAdmin) { setShowPremiumAlert(true); return; }
    const url = prompt('أدخل رابط الموقع (مثل ويكيبيديا أو Phet):', 'https://ar.wikipedia.org/wiki/%D9%85%D8%B5%D8%B1');
    if (url) {
      setIframes([...iframes, { id: Date.now(), url, x: window.innerWidth/2 - 300, y: window.innerHeight/2 - 200 }]);
    }
  };

  const handleSelectSticker = (url) => {
    // Add as a draggable animated overlay instead of embedding in Fabric canvas
    // This preserves GIF/animated WebP animations
    const x = window.innerWidth / 2 - 75;
    const y = window.innerHeight / 2 - 75;
    setAnimatedStickers(prev => [...prev, { id: Date.now(), url, x, y }]);
  };
  const isAnyFullScreenOverlayActive = 
    (typeof isQuranPlayerActive !== 'undefined' && isQuranPlayerActive) || 
    (typeof isInteractiveMushafActive !== 'undefined' && isInteractiveMushafActive) || 
    (typeof isHangmanActive !== 'undefined' && isHangmanActive) || 
    (typeof isQuizShowActive !== 'undefined' && isQuizShowActive) || 
    (typeof isWordSearchActive !== 'undefined' && isWordSearchActive) || 
    (typeof isQuranGameActive !== 'undefined' && isQuranGameActive) || 
    (typeof isWordBuilderActive !== 'undefined' && isWordBuilderActive) || 
    (typeof isPeriodicTableActive !== 'undefined' && isPeriodicTableActive) || 
    (typeof isMathQuizActive !== 'undefined' && isMathQuizActive) || 
    (typeof isMemoryGameActive !== 'undefined' && isMemoryGameActive) || 
    (typeof isReadyPathwayActive !== 'undefined' && isReadyPathwayActive) ||
    (typeof isSpinWheelActive !== 'undefined' && isSpinWheelActive) ||
    Boolean(activeIframeUrl);

  const handleInsertAIImage = (url) => { 
    if (!canvas) return; 
    if (url.startsWith('data:image/svg+xml')) {
      fabric.loadSVGFromURL(url, (objects, options) => {
        if (!objects || objects.length === 0) return;
        const obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true });
        if (obj.width > canvas.width * 0.8) obj.scaleToWidth(canvas.width * 0.8);
        canvas.add(obj);
        canvas.setActiveObject(obj);
        setTool('select');
        saveHistory(canvas);
      });
    } else {
      fabric.Image.fromURL(url, (img) => { 
        img.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, crossOrigin: 'anonymous' }); 
        if (img.width > canvas.width * 0.8) img.scaleToWidth(canvas.width * 0.8); 
        canvas.add(img); 
        canvas.setActiveObject(img); 
        setTool('select'); 
        saveHistory(canvas); 
      });
    }
  };

  return (
    <div 
      className={`${styles.container} ${isMobile ? styles.forceMobile : ''} ${!showMobileBottomToolbars ? styles.mobileToolbarsHidden : ''}`}
      data-mobile-category={mobileActiveCategory}
    >
      {/* Canvas Area */}
      <div 
        className={`${styles.canvasWrapper} ${styles[bgType]}`} 
        style={customBgImage ? { backgroundImage: `url(${customBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : {}}
      >
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

      {!isPresenting && !isAnyFullScreenOverlayActive && (
        <>
          {/* Mobile Category Tab Switcher Bar */}
          {isMobile && showMobileBottomToolbars && (
            <div className={styles.mobileCategoryBar}>
              <button
                type="button"
                className={`${styles.mobileCategoryTab} ${mobileActiveCategory === 'draw' ? styles.mobileCategoryTabActive : ''}`}
                onClick={() => setMobileActiveCategory('draw')}
              >
                <Pen size={13} />
                <span>رسم</span>
              </button>
              <button
                type="button"
                className={`${styles.mobileCategoryTab} ${mobileActiveCategory === 'colors' ? styles.mobileCategoryTabActive : ''}`}
                onClick={() => setMobileActiveCategory('colors')}
              >
                <Palette size={13} />
                <span>ألوان</span>
              </button>
              <button
                type="button"
                className={`${styles.mobileCategoryTab} ${mobileActiveCategory === 'insert' ? styles.mobileCategoryTabActive : ''}`}
                onClick={() => setMobileActiveCategory('insert')}
              >
                <Plus size={13} />
                <span>إدراج</span>
              </button>
              <button
                type="button"
                className={`${styles.mobileCategoryTab} ${mobileActiveCategory === 'tools' ? styles.mobileCategoryTabActive : ''}`}
                onClick={() => setMobileActiveCategory('tools')}
              >
                <Sparkles size={13} />
                <span>أدوات</span>
              </button>
              <button
                type="button"
                className={styles.mobileCategoryTabHide}
                onClick={() => setShowMobileBottomToolbars(false)}
                title="إخفاء الأدوات (مساحة رسم كاملة)"
                aria-label="إخفاء الأدوات"
              >
                <EyeOff size={13} />
              </button>
            </div>
          )}

          {/* Floating Button when Toolbars are Hidden (Clean Canvas Mode) */}
          {!showMobileBottomToolbars && (
            <button
              type="button"
              className={`${styles.mobileCanvasToggle} ${styles.mobileCanvasToggleCollapsed}`}
              onClick={() => setShowMobileBottomToolbars(true)}
              title="إظهار كافة الأدوات"
              aria-label="إظهار كافة الأدوات"
            >
              <Pen size={15} />
              <span>إظهار الأدوات</span>
            </button>
          )}

          {activeObjType === 'flashcardText' && (
          <div style={{ position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'white', padding: '6px 12px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #cbd5e1' }}>
            <button onClick={flipActiveFlashcard} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Tajawal', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>قلب البطاقة (Flip)</span>
            </button>
            <button 
              onClick={() => {
                const activeObj = canvas?.getActiveObject();
                if (activeObj) {
                  canvas.remove(activeObj);
                  canvas.discardActiveObject();
                  canvas.requestRenderAll();
                  saveHistory(canvas);
                  setActiveObjType(null);
                }
              }} 
              style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="حذف البطاقة"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {activeObjType === 'mindMapText' && canvas.getActiveObject() && (
          <MindMapEditPanel 
            node={canvas.getActiveObject()} 
            canvas={canvas} 
            isMobile={isMobile}
            onAddBranch={addMindMapBranch}
            onAddSibling={addMindMapSibling}
            onDelete={() => {
              const obj = canvas.getActiveObject();
              if (obj && !obj.lockMovementX) {
                if (obj.isMindMapNode) {
                  canvas.getObjects('line').forEach(line => {
                    if (line.isMindMapLine && (line.mindMapFromId === obj.mindMapId || line.mindMapToId === obj.mindMapId)) {
                      canvas.remove(line);
                    }
                  });
                }
                canvas.remove(obj);
                canvas.discardActiveObject();
                saveHistory(canvas);
                setActiveObjType(null);
              }
            }}
            onSaveHistory={() => saveHistory(canvas)}
          />
        )}
        {/* Left Toolbar: Core Tools */}
      <div className={`${styles.glassPanel} ${styles.leftToolbar}`} style={{ display: isAnyFullScreenOverlayActive ? 'none' : '' }}>
         <button className={styles.toolBtn} onClick={() => setTool('select')}><MousePointer2 size={20} /></button>
         <button className={styles.toolBtn} onClick={() => setTool('pan')}><Hand size={20} /></button>
         <button className={styles.toolBtn} onClick={() => setTool('pen')}><Pen size={20} /></button>
         <button className={styles.toolBtn} onClick={() => setTool('eraser')}><Eraser size={20} /></button>
         <div style={{ width: '1px', height: '22px', background: '#cbd5e1', margin: '0 4px', alignSelf: 'center' }} className={styles.mobileOnly} />
         <button className={`${styles.toolBtn} ${styles.mobileOnly}`} onClick={undo} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.4 }} title="تراجع"><Undo2 size={18} /></button>
         <button className={`${styles.toolBtn} ${styles.mobileOnly}`} onClick={redo} disabled={!canRedo} style={{ opacity: canRedo ? 1 : 0.4 }} title="إعادة"><Redo2 size={18} /></button>
         <button className={`${styles.toolBtn} ${styles.mobileOnly}`} onClick={handleClearCanvas} style={{ color: '#ef4444' }} title="مسح اللوحة"><Trash2 size={18} /></button>
         {isAdmin && <button className={styles.toolBtn} onClick={() => setIsAIGeneratorOpen(true)} title="رسومات الذكاء الاصطناعي"><BrainCircuit size={20} color="#0ea5e9" /></button>}
         {isAdmin && <button className={styles.toolBtn} onClick={() => window.open('/teacher-assistant/document-editor', '_blank')} title="محرر الملازم الذكي (يفتح في نافذة جديدة)"><FileText size={20} color="#3b82f6" /></button>}
         
         
         {!isLeftToolbarExpanded && !isMobile ? (
            <button className={styles.toolBtn} onClick={() => setIsLeftToolbarExpanded(true)} style={{ color: '#0ea5e9' }} title="توسيع باقي الأدوات">
               <ChevronDown size={20} />
            </button>
         ) : (
            <>
               <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0', width: '100%' }} />
               <button className={styles.toolBtn} onClick={() => setTool('calligraphy')} title="قلم خط عربي"><span role="img" aria-label="قلم خط">🖋️</span></button>
               <button className={styles.toolBtn} onClick={() => setTool('spray')} title="بخاخ"><span role="img" aria-label="بخاخ">💨</span></button>
               <button className={styles.toolBtn} onClick={() => setTool('highlighter')} title="قلم تظليل"><Highlighter size={20} /></button>
               <button className={styles.toolBtn} onClick={() => setTool('laser')} title="مؤشر ليزر"><Crosshair size={20} /></button>
               <button className={styles.toolBtn} onClick={() => setTool('magic')} title="قلم سحري"><Sparkles size={20} /></button>
               
               <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0', width: '100%' }} />
               
               <button className={styles.toolBtn} onClick={() => {
                  if (isTeacherDashboard) {
                     if (!isPremium) setShowPremiumAlert(true);
                     else setShowGamesModal(true);
                  } else if (typeof window !== 'undefined' && window.location.pathname.includes('/free-whiteboard')) {
                     setShowPremiumAlert(true);
                  } else {
                     setShowGamesModal(true);
                  }
               }} title="ألعاب تعليمية"><Gamepad2 size={20} style={{ color: '#8b5cf6' }} /></button>
               
               <button className={styles.toolBtn} onClick={() => setIsScienceLibraryOpen(true)} style={{ color: '#059669' }} title="مكتبة التجارب العلمية">
                 <FlaskConical size={20} />
               </button>
               <button className={styles.toolBtn} onClick={() => { if (!isPremium && !isAdmin) { setShowPremiumAlert(true); return; } setIsReadyPathwayActive(true); }} style={{ color: '#0ea5e9' }} title="المسار الجاهز"><Layers size={20} /></button>
               
               {!isMobile && (
                 <button className={styles.toolBtn} onClick={() => setIsLeftToolbarExpanded(false)} style={{ color: '#ef4444', marginTop: '4px' }} title="طي الأدوات الإضافية">
                    <ChevronUp size={20} />
                 </button>
               )}
            </>
         )}
      </div>

            {/* Floating Text Formatting Toolbar */}
      {activeTextObject && (
        <div 
          data-toolbar="true"
          className={styles.floatingTextToolbar}
        >
          {/* Font Family Selection */}
          <select 
            value={activeTextObject.fontFamily || 'Tajawal'} 
            onChange={(e) => { 
              activeTextObject.set('fontFamily', e.target.value); 
              canvas.requestRenderAll(); 
              saveHistory(canvas);
              setTextUpdateTick(prev => prev + 1); 
            }} 
            style={{ 
              padding: isMobile ? '3px 4px' : '4px 8px', 
              borderRadius: '6px', 
              border: '1px solid #cbd5e1', 
              background: '#f8fafc', 
              fontSize: isMobile ? '11px' : '12px', 
              fontWeight: 600, 
              color: '#1e293b', 
              cursor: 'pointer', 
              outline: 'none', 
              flexShrink: 0 
            }} 
            title="نوع الخط"
          >
            <option value="Tajawal">تجوال</option>
            <option value="Cairo">كايرو</option>
            <option value="Amiri">أميري</option>
            <option value="Arial">Arial</option>
            <option value="Traditional Arabic">تقليدي</option>
          </select>

          <div style={{ width: '1px', height: '18px', background: '#cbd5e1', flexShrink: 0 }} />

          <button 
            type="button"
            onClick={() => { 
              activeTextObject.set('fontWeight', activeTextObject.fontWeight === 'bold' ? 'normal' : 'bold'); 
              canvas.requestRenderAll(); 
              saveHistory(canvas);
              setTextUpdateTick(prev => prev + 1); 
            }} 
            style={{ 
              background: activeTextObject.fontWeight === 'bold' ? '#e2e8f0' : 'transparent', 
              border: 'none', 
              padding: isMobile ? '4px 6px' : '5px 8px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              color: activeTextObject.fontWeight === 'bold' ? '#0f172a' : '#475569',
              flexShrink: 0
            }}
            title="عريض"
          >
            <Bold size={isMobile ? 16 : 18} />
          </button>

          <button 
            type="button"
            onClick={() => { 
              activeTextObject.set('fontStyle', activeTextObject.fontStyle === 'italic' ? 'normal' : 'italic'); 
              canvas.requestRenderAll(); 
              saveHistory(canvas);
              setTextUpdateTick(prev => prev + 1); 
            }} 
            style={{ 
              background: activeTextObject.fontStyle === 'italic' ? '#e2e8f0' : 'transparent', 
              border: 'none', 
              padding: isMobile ? '4px 6px' : '5px 8px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              color: activeTextObject.fontStyle === 'italic' ? '#0f172a' : '#475569',
              flexShrink: 0
            }}
            title="مائل"
          >
            <Italic size={isMobile ? 16 : 18} />
          </button>

          <button 
            type="button"
            onClick={() => { 
              activeTextObject.set('underline', !activeTextObject.underline); 
              canvas.requestRenderAll(); 
              saveHistory(canvas);
              setTextUpdateTick(prev => prev + 1); 
            }} 
            style={{ 
              background: activeTextObject.underline ? '#e2e8f0' : 'transparent', 
              border: 'none', 
              padding: isMobile ? '4px 6px' : '5px 8px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              color: activeTextObject.underline ? '#0f172a' : '#475569',
              flexShrink: 0
            }}
            title="تسطير"
          >
            <Underline size={isMobile ? 16 : 18} />
          </button>
          
          <div style={{ width: '1px', height: '18px', background: '#cbd5e1', flexShrink: 0 }} />
          
          <button 
            type="button"
            onClick={() => { 
              activeTextObject.set('textAlign', 'right'); 
              canvas.requestRenderAll(); 
              saveHistory(canvas);
              setTextUpdateTick(prev => prev + 1); 
            }} 
            style={{ 
              background: activeTextObject.textAlign === 'right' ? '#e2e8f0' : 'transparent', 
              border: 'none', 
              padding: isMobile ? '4px 6px' : '5px 8px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              color: activeTextObject.textAlign === 'right' ? '#0f172a' : '#475569',
              flexShrink: 0
            }}
            title="محاذاة لليمين"
          >
            <AlignRight size={isMobile ? 16 : 18} />
          </button>

          <button 
            type="button"
            onClick={() => { 
              activeTextObject.set('textAlign', 'center'); 
              canvas.requestRenderAll(); 
              saveHistory(canvas);
              setTextUpdateTick(prev => prev + 1); 
            }} 
            style={{ 
              background: activeTextObject.textAlign === 'center' ? '#e2e8f0' : 'transparent', 
              border: 'none', 
              padding: isMobile ? '4px 6px' : '5px 8px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              color: activeTextObject.textAlign === 'center' ? '#0f172a' : '#475569',
              flexShrink: 0
            }}
            title="محاذاة للوسط"
          >
            <AlignCenter size={isMobile ? 16 : 18} />
          </button>

          <button 
            type="button"
            onClick={() => { 
              activeTextObject.set('textAlign', 'left'); 
              canvas.requestRenderAll(); 
              saveHistory(canvas);
              setTextUpdateTick(prev => prev + 1); 
            }} 
            style={{ 
              background: activeTextObject.textAlign === 'left' ? '#e2e8f0' : 'transparent', 
              border: 'none', 
              padding: isMobile ? '4px 6px' : '5px 8px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              color: activeTextObject.textAlign === 'left' ? '#0f172a' : '#475569',
              flexShrink: 0
            }}
            title="محاذاة لليسار"
          >
            <AlignLeft size={isMobile ? 16 : 18} />
          </button>

          <div style={{ width: '1px', height: '18px', background: '#cbd5e1', flexShrink: 0 }} />
          
          {/* Font Size Step Buttons + Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => {
                const currentSize = activeTextObject.fontSize || 40;
                const newSize = Math.max(8, currentSize - 4);
                activeTextObject.set('fontSize', newSize);
                canvas.requestRenderAll();
                saveHistory(canvas);
                setTextUpdateTick(prev => prev + 1);
              }}
              style={{
                width: isMobile ? '22px' : '26px',
                height: isMobile ? '22px' : '26px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#475569',
                padding: 0
              }}
              title="تصغير الخط"
            >
              -
            </button>
            <input 
              type="number" 
              min="8" 
              max="200" 
              value={activeTextObject.fontSize || 40} 
              onChange={(e) => { 
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 8 && val <= 300) {
                  activeTextObject.set('fontSize', val); 
                  canvas.requestRenderAll(); 
                  setTextUpdateTick(prev => prev + 1); 
                }
              }} 
              onBlur={() => {
                saveHistory(canvas);
              }}
              style={{ 
                width: isMobile ? '40px' : '48px', 
                padding: isMobile ? '3px 2px' : '4px 4px', 
                border: '1px solid #cbd5e1', 
                borderRadius: '6px', 
                textAlign: 'center',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: 600,
                color: '#1e293b',
                background: '#f8fafc'
              }} 
              title="حجم الخط" 
            />
            <button
              type="button"
              onClick={() => {
                const currentSize = activeTextObject.fontSize || 40;
                const newSize = Math.min(300, currentSize + 4);
                activeTextObject.set('fontSize', newSize);
                canvas.requestRenderAll();
                saveHistory(canvas);
                setTextUpdateTick(prev => prev + 1);
              }}
              style={{
                width: isMobile ? '22px' : '26px',
                height: isMobile ? '22px' : '26px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#475569',
                padding: 0
              }}
              title="تكبير الخط"
            >
              +
            </button>
          </div>

          <div style={{ width: '1px', height: '18px', background: '#cbd5e1', flexShrink: 0 }} />

          {/* Color Swatch */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }} title="لون النص">
            <input
              type="color"
              value={typeof activeTextObject.fill === 'string' && activeTextObject.fill.startsWith('#') ? activeTextObject.fill : (color.startsWith('#') ? color : '#1e293b')}
              onChange={(e) => {
                activeTextObject.set('fill', e.target.value);
                canvas.requestRenderAll();
                setTextUpdateTick(prev => prev + 1);
              }}
              onBlur={() => {
                saveHistory(canvas);
              }}
              style={{
                width: isMobile ? '24px' : '28px',
                height: isMobile ? '24px' : '28px',
                padding: 0,
                border: '1px solid #cbd5e1',
                borderRadius: '50%',
                cursor: 'pointer',
                background: 'transparent'
              }}
            />
          </div>

          <div style={{ width: '1px', height: '18px', background: '#cbd5e1', flexShrink: 0 }} />

          <button 
            type="button"
            onClick={() => {
              if (activeTextObject) {
                canvas.remove(activeTextObject);
                canvas.discardActiveObject();
                canvas.requestRenderAll();
                saveHistory(canvas);
                setActiveTextObject(null);
              }
            }} 
            style={{ 
              background: '#fee2e2', 
              border: 'none', 
              padding: isMobile ? '4px 6px' : '5px 8px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              flexShrink: 0
            }}
            title="حذف النص"
          >
            <Trash2 size={isMobile ? 16 : 18} />
          </button>
        </div>
      )}

      {/* Bottom Toolbar: Insertion */}
      <div className={`${styles.glassPanel} ${styles.bottomToolbar}`} style={{ display: isAnyFullScreenOverlayActive ? 'none' : '' }}>
         <button className={styles.toolBtn} onClick={() => setIsLibraryOpen(!isLibraryOpen)}><StickyNote size={20} /></button>
         <button className={styles.toolBtn} onClick={() => setShowQuranModal(!showQuranModal)} style={{ color: '#059669' }}><BookOpen size={20} /></button>
         <button className={styles.toolBtn} onClick={() => setIsQuranGameActive(true)} style={{ color: "#059669" }} title="أداة ترتيب الآيات">🧩</button>
         <button className={styles.toolBtn} onClick={addText}><Type size={20} /></button>
         <button className={styles.toolBtn} onClick={addVoiceText} style={{ color: '#ec4899' }}><Mic size={20} /></button>

         {!isBottomToolbarExpanded && !isMobile ? (
            <button className={styles.toolBtn} onClick={() => setIsBottomToolbarExpanded(true)} style={{ color: '#0ea5e9', marginLeft: '5px' }} title="توسيع الأشكال والوسائط">
               <ChevronLeft size={20} />
            </button>
         ) : (
            <>
               <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px' }} />
               <button className={styles.toolBtn} onClick={addRect} title="مستطيل"><Square size={20} /></button>
               <button className={styles.toolBtn} onClick={addCircle} title="دائرة"><Circle size={20} /></button>
               <button className={styles.toolBtn} onClick={addTriangle} title="مثلث"><Triangle size={20} /></button>
               <button className={styles.toolBtn} onClick={addLine} title="خط مستقيم"><Minus size={20} /></button>
               <button className={styles.toolBtn} onClick={addArrow} title="سهم"><ArrowRight size={20} /></button>
               <button 
                  className={`${styles.toolBtn} ${isShapeFilled ? styles.activeTool : ''}`} 
                  onClick={() => setIsShapeFilled(!isShapeFilled)} 
                  style={{ color: isShapeFilled ? '#059669' : '#64748b' }} 
                  title={isShapeFilled ? "نمط التعبئة: ممتلئ (مفعل)" : "نمط التعبئة: مفرغ"}
               >
                  <Palette size={18} />
               </button>
               
               <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px' }} />
               
               <label className={styles.toolBtn} title="إدراج صورة">
                  <ImageIcon size={20} />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
               </label>
               <label className={styles.toolBtn} title="رفع كتاب مدرسي / ملزمة (PDF أو صور)" style={{ color: '#dc2626' }}>
                  <FileText size={20} />
                  <input type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={handleBackgroundUpload} />
               </label>
               <button className={styles.toolBtn} onClick={handlePasteFromClipboard} style={{ color: '#0ea5e9' }} title="لصق من الحافظة"><ClipboardPaste size={20} /></button>
               <label className={styles.toolBtn} title="إدراج فيديو">
                  <Video size={20} />
                  <input type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoUpload} />
               </label>
               <button className={styles.toolBtn} onClick={addYoutubeVideo} style={{ color: '#ef4444' }} title="إدراج فيديو يوتيوب">
                  <Video size={20} />
               </button>
               <button className={styles.toolBtn} onClick={addIframe} style={{ color: "#0284c7" }} title="إضافة موقع/لعبة"><MonitorPlay size={20} /></button>
               <button className={styles.toolBtn} onClick={addCamera} style={{ color: "#10b981" }} title="الكاميرا"><Camera size={20} /></button>
               <button className={styles.toolBtn} onClick={() => setIsStickersLibraryOpen(true)} style={{ color: '#f59e0b' }} title="استيكرات">
                  <Sparkles size={20} />
               </button>

               {!isMobile && (
                 <button className={styles.toolBtn} onClick={() => setIsBottomToolbarExpanded(false)} style={{ color: '#ef4444', marginRight: '5px' }} title="طي الأشكال والوسائط">
                    <ChevronRight size={20} />
                 </button>
               )}
            </>
         )}
      </div>

      {/* Top Left Toolbar: Pages & Save */}
      <div className={`${styles.glassPanel} ${styles.topLeftToolbar}`} style={{ display: isAnyFullScreenOverlayActive ? 'none' : '' }}>
         {!isTopLeftToolbarExpanded && !isMobile ? (
            <button className={styles.toolBtn} onClick={() => setIsTopLeftToolbarExpanded(true)} style={{ color: '#0ea5e9' }} title="توسيع الصفحات والإجراءات">
               <ChevronRight size={20} />
            </button>
         ) : (
            <>
               <button onClick={handleExit} className={styles.toolBtn} style={{ color: '#ef4444' }} title="خروج"><X size={20} /></button>
         
         <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px', alignSelf: 'center' }} />
         <button className={styles.toolBtn} onClick={() => switchPage(currentPageIndex - 1)} disabled={currentPageIndex === 0} title="الصفحة السابقة"><ChevronRight size={20}/></button>
         <span style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: '14px', margin: '0 5px' }}>{currentPageIndex + 1} / {pages.length}</span>
         <button className={styles.toolBtn} onClick={() => switchPage(currentPageIndex + 1)} disabled={currentPageIndex === pages.length - 1} title="الصفحة التالية"><ChevronLeft size={20}/></button>
          <button className={styles.toolBtn} onClick={addPage} style={{ color: '#2563eb' }} title="إضافة صفحة"><Plus size={20} /></button>
          <button 
            className={styles.toolBtn} 
            onClick={deletePage} 
            disabled={pages.length <= 1 && (!canvas || canvas.getObjects().length === 0)} 
            style={{ color: '#ef4444', opacity: (pages.length <= 1 && (!canvas || canvas.getObjects().length === 0)) ? 0.4 : 1 }} 
            title={pages.length > 1 ? "حذف الصفحة الحالية" : "مسح محتويات الصفحة"}
          >
            <Trash2 size={18} />
          </button>
          <button 
            className={styles.toolBtn} 
            onClick={() => setShowMobileBottomToolbars(prev => !prev)} 
            style={{ color: showMobileBottomToolbars ? '#0284c7' : '#10b981' }}
            title={showMobileBottomToolbars ? "مساحة رسم كاملة (إخفاء كافة الأدوات)" : "إظهار كافة الأدوات"}
          >
            {showMobileBottomToolbars ? <EyeOff size={18} /> : <Pen size={18} />}
          </button>

          <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px', alignSelf: 'center' }} />
          
          <button 
            ref={cheersBtnRef}
            className={`${styles.toolBtn} ${showCheersMenu ? styles.activeTool : ''}`} 
            onClick={handleToggleCheersMenu} 
            title="تأثيرات وتشجيع"
            style={{
              background: showCheersMenu ? '#fefce8' : 'transparent',
              borderColor: showCheersMenu ? '#fde047' : 'transparent'
            }}
          >
            <Sparkles size={20} color="#eab308" />
          </button>

         <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px', alignSelf: 'center' }} />
         <button className={styles.toolBtn} onClick={undo} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.5 }} title="تراجع"><Undo2 size={20} /></button>
         <button className={styles.toolBtn} onClick={redo} disabled={!canRedo} style={{ opacity: canRedo ? 1 : 0.5 }} title="إعادة"><Redo2 size={20} /></button>
         
         <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px', alignSelf: 'center' }} />
         <button className={styles.toolBtn} onClick={takeScreenshot} style={{ color: '#059669' }} title="لقطة شاشة"><Camera size={20} /></button>
         <button className={styles.toolBtn} onClick={toggleRecording} style={{ color: isRecording ? '#ef4444' : '#64748b' }} title={isRecording ? "إيقاف التسجيل" : "تسجيل الشاشة"}>
           <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: isRecording ? '#ef4444' : 'transparent', border: isRecording ? 'none' : '2px solid currentcolor' }}></span>
         </button>
         <button className={styles.toolBtn} onClick={exportToPDF} style={{ color: '#dc2626' }} title="تصدير PDF"><FileText size={20} /></button>
         <label className={styles.toolBtn} title="استيراد / رفع ملف PDF أو كتاب مدرسي" style={{ color: '#2563eb' }}>
            <Upload size={20} />
            <input type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={handleBackgroundUpload} />
         </label>
         <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px', alignSelf: 'center' }} />
         <button className={styles.toolBtn} onClick={saveProject} title="حفظ المشروع"><Download size={20} /></button>
         <label className={styles.toolBtn} title="فتح مشروع">
            <FolderOpen size={20} />
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={loadProject} />
         </label>
               <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px', alignSelf: 'center' }} />
               {!isMobile && (
                 <button className={styles.toolBtn} onClick={() => setIsTopLeftToolbarExpanded(false)} style={{ color: '#ef4444' }} title="طي شريط الصفحات والإجراءات">
                    <ChevronLeft size={20} />
                 </button>
               )}
            </>
         )}
      </div>

      {/* 🌟 Fixed Overlay Cheers & Celebration Menu (Never clipped on Mobile or Desktop) */}
      {showCheersMenu && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99998,
              background: 'transparent'
            }}
            onClick={() => setShowCheersMenu(false)}
            onTouchStart={() => setShowCheersMenu(false)}
          />

          <div 
            style={{
              position: 'fixed',
              top: `${cheersMenuPos.top}px`,
              left: `${cheersMenuPos.left}px`,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              width: '165px',
              maxHeight: 'calc(100vh - 60px)',
              overflowY: 'auto',
              direction: 'rtl'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => { triggerCheer('fireworks'); setShowCheersMenu(false); }} 
              className={styles.actionBtn} 
              style={{ textAlign: 'right', padding: '8px 10px', fontSize: '13px', borderRadius: '8px', width: '100%', justifyContent: 'flex-start', background: '#f8fafc', color: '#1e293b' }}
            >
              🎆 ألعاب نارية
            </button>
            <button 
              onClick={() => { triggerCheer('applause'); setShowCheersMenu(false); }} 
              className={styles.actionBtn} 
              style={{ textAlign: 'right', padding: '8px 10px', fontSize: '13px', borderRadius: '8px', width: '100%', justifyContent: 'flex-start', background: '#f8fafc', color: '#1e293b' }}
            >
              👏 تصفيق حار
            </button>
            <button 
              onClick={() => { triggerCheer('magic'); setShowCheersMenu(false); }} 
              className={styles.actionBtn} 
              style={{ textAlign: 'right', padding: '8px 10px', fontSize: '13px', borderRadius: '8px', width: '100%', justifyContent: 'flex-start', background: '#f8fafc', color: '#1e293b' }}
            >
              ✨ عصا سحرية
            </button>
            <button 
              onClick={() => { triggerCheer('victory'); setShowCheersMenu(false); }} 
              className={styles.actionBtn} 
              style={{ textAlign: 'right', padding: '8px 10px', fontSize: '13px', borderRadius: '8px', width: '100%', justifyContent: 'flex-start', background: '#f8fafc', color: '#1e293b' }}
            >
              🏆 احتفال بالفوز
            </button>
            
            <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
            <span style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', fontWeight: 'bold' }}>تأثيرات مميزة ⭐</span>
            
            <button 
              onClick={() => { 
                if (!isPremium && !isAdmin) { setShowPremiumAlert(true); setShowCheersMenu(false); return; }
                triggerCheer('balloons'); 
                setShowCheersMenu(false); 
              }} 
              className={styles.actionBtn} 
              style={{ textAlign: 'right', padding: '8px 10px', fontSize: '13px', borderRadius: '8px', width: '100%', justifyContent: 'flex-start', background: '#f8fafc', color: (!isPremium && !isAdmin) ? '#94a3b8' : '#1e293b' }}
            >
              🎈 إطلاق بالونات
            </button>
            
            <button 
              onClick={() => { 
                if (!isPremium && !isAdmin) { setShowPremiumAlert(true); setShowCheersMenu(false); return; }
                triggerCheer('confetti_rain'); 
                setShowCheersMenu(false); 
              }} 
              className={styles.actionBtn} 
              style={{ textAlign: 'right', padding: '8px 10px', fontSize: '13px', borderRadius: '8px', width: '100%', justifyContent: 'flex-start', background: '#f8fafc', color: (!isPremium && !isAdmin) ? '#94a3b8' : '#1e293b' }}
            >
              🎉 مطر الزينة
            </button>
            
            <button 
              onClick={() => { 
                if (!isPremium && !isAdmin) { setShowPremiumAlert(true); setShowCheersMenu(false); return; }
                triggerCheer('neon_blast'); 
                setShowCheersMenu(false); 
              }} 
              className={styles.actionBtn} 
              style={{ textAlign: 'right', padding: '8px 10px', fontSize: '13px', borderRadius: '8px', width: '100%', justifyContent: 'flex-start', background: '#f8fafc', color: (!isPremium && !isAdmin) ? '#94a3b8' : '#1e293b' }}
            >
              ⚡ أضواء النيون
            </button>
          </div>
        </>
      )}

      {/* Top Right Toolbar: Properties */}
      <div className={`${styles.glassPanel} ${styles.topRightToolbar}`} style={{ display: isAnyFullScreenOverlayActive ? 'none' : '' }}>
         {!isTopRightToolbarExpanded && !isMobile ? (
            <button className={styles.toolBtn} onClick={() => setIsTopRightToolbarExpanded(true)} style={{ color: '#0ea5e9', alignSelf: 'center' }} title="توسيع الألوان والإعدادات">
               <Settings2 size={20} />
            </button>
         ) : (
            <>
               {!isMobile && (
                 <button className={styles.toolBtn} onClick={() => setIsTopRightToolbarExpanded(false)} style={{ color: '#ef4444', alignSelf: 'flex-start', marginBottom: '5px' }} title="طي الألوان والإعدادات">
                    <X size={20} />
                 </button>
               )}
         {isVideo && (
            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
               <button className={styles.actionBtn} onClick={playActiveVideo} style={{ background: '#e0f2fe', color: '#0369a1', flex: 1, padding: '5px' }}>تشغيل</button>
               <button className={styles.actionBtn} onClick={pauseActiveVideo} style={{ background: '#fee2e2', color: '#991b1b', flex: 1, padding: '5px' }}>إيقاف مؤقت</button>
               <button className={styles.actionBtn} onClick={toggleMuteActiveVideo} style={{ padding: '5px' }} title="كتم/إلغاء الكتم">صوت</button>
            </div>
         )}
         <div className={styles.colorsGroup} style={{ justifyContent: 'center' }}>
            {colors.map(c => (
              <button key={c.hex} className={`${styles.colorBtn} ${color === c.hex ? styles.activeColor : ''}`} style={{ backgroundColor: c.hex }} onClick={() => setColor(c.hex)} title={c.name} />
            ))}
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span className={styles.mobileHidden} style={{ fontSize: '12px', color: '#64748b' }}>حجم القلم:</span>
            <input type="range" min="1" max="30" value={lineWidth} onChange={(e) => handleLineWidthChange(e.target.value)} className={styles.rangeInput} style={{ flex: 1 }} />
         </div>
         
         <div style={{ display: 'flex', gap: '5px' }}>
             <button onClick={handleClearCanvas} className={styles.actionBtn} style={{ background: '#fee2e2', color: '#ef4444', flex: 1, padding: '5px' }} title="مسح الكل"><Trash2 size={16} /><span className={styles.mobileHidden}> مسح</span></button>
             <button className={styles.actionBtn} onClick={() => setIsSettingsOpen(!isSettingsOpen)} style={{ flex: 1, padding: '5px' }} title="إعدادات"><Settings2 size={16} /><span className={styles.mobileHidden}> إعدادات</span></button>
         </div>

         <div style={{ display: 'flex', gap: '5px', marginTop: '5px', justifyContent: 'center' }}>
            <button className={styles.actionBtn} onClick={zoomOut} style={{ padding: '5px', flex: 1 }} title="تصغير">-</button>
            <button className={styles.actionBtn} onClick={resetZoom} style={{ padding: '5px', flex: 1 }} title="إعادة العرض">100%</button>
            <button className={styles.actionBtn} onClick={zoomIn} style={{ padding: '5px', flex: 1 }} title="تكبير">+</button>
         </div>
         
         {isSettingsOpen && (
            <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <select className={styles.selectInput} value={bgType} onChange={(e) => { 
                 setBgType(e.target.value); 
                 setCustomBgImage(null); 
                 if (canvas && canvas.backgroundImage) {
                   canvas.setBackgroundImage(null, () => {
                     canvas.renderAll();
                     saveHistory(canvas);
                   });
                 }
               }}>
                 <option value="blank">سبورة بيضاء (فارغة)</option>
                 <option value="ruled">مسطرة (لغة عربية)</option>
                 <option value="grid">مربعات (رياضيات)</option>
               </select>
               <button 
                 onClick={() => setIsBackgroundsLibraryOpen(true)}
                 className={styles.actionBtn} style={{ background: '#0ea5e9', color: 'white', padding: '8px', fontWeight: 'bold' }}>
                 خلفيات إضافية (مميزة)
               </button>
               <select className={styles.selectInput} value={mouseEffect} onChange={(e) => {
                 if (e.target.value !== 'default' && !isPremium && !isAdmin) {
                   setShowPremiumAlert(true);
                   return;
                 }
                 setMouseEffect(e.target.value);
               }}>
                 <option value="default">مؤشر الماوس: عادي</option>
                 <option value="cat">مؤشر: قطة (مميز)</option>
                 <option value="octopus">مؤشر: أخطبوط (مميز)</option>
                 <option value="magic">مؤشر: عصا سحرية (مميز)</option>
                 <option value="rocket">مؤشر: صاروخ (مميز)</option>
                 <option value="star">مؤشر: نجمة (مميز)</option>
               </select>
               <label className={styles.actionBtn} style={{ background: '#e0e7ff', color: '#3730a3', cursor: 'pointer', textAlign: 'center', padding: '8px' }}>
                 صورة / PDF
                 <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleBackgroundUpload} />
               </label>
            </div>
         )}
            </>
         )}
      </div>

      {/* Library Panel (Pop-up) */}
      {isLibraryOpen && (
        <div className={styles.libraryPanel}>
   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
      <h4 style={{ margin: 0, color: '#334155' }}>المكتبة</h4>
      <button onClick={() => setIsLibraryOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
   </div>
   
   <div className={styles.librarySection}>
     <h5>رفع الكتب والمستندات</h5>
     <label className={styles.actionBtn} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', width: '100%', boxSizing: 'border-box' }}>
       <FileText size={18} />
       <span>رفع كتاب مدرسي أو ملزمة (PDF)</span>
       <input type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={(e) => { handleBackgroundUpload(e); setIsLibraryOpen(false); }} />
     </label>
   </div>

   <div className={styles.librarySection}>
     <h5>ملاحظات لاصقة</h5>
     <div className={styles.libraryGrid}>
        <div className={styles.stickyNoteItem} style={{ background: '#fef08a' }} onClick={() => addStickyNote('#fef08a')} title="أصفر"></div>
        <div className={styles.stickyNoteItem} style={{ background: '#a7f3d0' }} onClick={() => addStickyNote('#a7f3d0')} title="أخضر"></div>
        <div className={styles.stickyNoteItem} style={{ background: '#bfdbfe' }} onClick={() => addStickyNote('#bfdbfe')} title="أزرق"></div>
        <div className={styles.stickyNoteItem} style={{ background: '#fbcfe8' }} onClick={() => addStickyNote('#fbcfe8')} title="وردي"></div>
     </div>
   </div>

   <div className={styles.librarySection}>
     <h5>أدوات علمية</h5>
     <div className={styles.libraryGrid}>
        <button className={styles.libraryItem} onClick={addMicroscope} title="ميكروسكوب">🔬<span>مجهر</span></button>
        <button className={styles.libraryItem} onClick={addFlask} title="دورق">⚗️<span>دورق</span></button>
        <button className={styles.libraryItem} onClick={addBook} title="كتاب">📖<span>كتاب</span></button>
        <button className={styles.libraryItem} onClick={addGradCap} title="قبعة تخرج">🎓<span>قبعة</span></button>
        <button className={styles.libraryItem} onClick={addAtom} title="ذرة">⚛️<span>ذرة</span></button>
        <button className={styles.libraryItem} onClick={addTelescope} title="تلسكوب">🔭<span>تلسكوب</span></button>
        <button className={styles.libraryItem} onClick={addGlobe} title="مجسم الكرة الأرضية">🌍<span>أرض</span></button>
        <button className={styles.libraryItem} onClick={addPalette} title="ألوان">🎨<span>ألوان</span></button>
        <button className={styles.libraryItem} onClick={addMusicNote} title="نوتة موسيقية">🎵<span>نوتة</span></button>
        <button className={styles.libraryItem} onClick={() => { if (!isPremium && !isAdmin) { setShowPremiumAlert(true); return; } setIsPeriodicTableActive(true); setIsLibraryOpen(false); }} title="الجدول الدوري">🧪<span>عناصر</span></button>
     </div>
   </div>

   <div className={styles.librarySection}>
     <h5>أدوات هندسية</h5>
     <div className={styles.libraryGrid}>
        <button className={styles.libraryItem} onClick={() => { addRuler(); setIsLibraryOpen(false); }} title="مسطرة">📏<span>مسطرة</span></button>
        <button className={styles.libraryItem} onClick={() => { addProtractor(); setIsLibraryOpen(false); }} title="منقلة">📐<span>منقلة</span></button>
        <button className={styles.libraryItem} onClick={() => { setTool('compass'); setIsLibraryOpen(false); }} title="فرجار (برجل)">📍<span>برجل</span></button>
        <button className={styles.libraryItem} onClick={() => { addAxes(); setIsLibraryOpen(false); }} title="محاور">➕<span>محاور</span></button>
     </div>
   </div>

   <div className={styles.librarySection}>
     <h5>رموز تعبيرية</h5>
     <div className={styles.libraryGrid}>
        <button className={styles.libraryItem} onClick={() => { addEmoji('😀'); setIsLibraryOpen(false); }} title="مبتسم">😀<span>مبتسم</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('😂'); setIsLibraryOpen(false); }} title="يضحك">😂<span>يضحك</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('🥰'); setIsLibraryOpen(false); }} title="حب">🥰<span>حب</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('🤔'); setIsLibraryOpen(false); }} title="يفكر">🤔<span>يفكر</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('😎'); setIsLibraryOpen(false); }} title="نظارة">😎<span>نظارة</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('😭'); setIsLibraryOpen(false); }} title="يبكي">😭<span>يبكي</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('😡'); setIsLibraryOpen(false); }} title="غاضب">😡<span>غاضب</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('🤯'); setIsLibraryOpen(false); }} title="مندهش">🤯<span>مندهش</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('🥳'); setIsLibraryOpen(false); }} title="احتفال">🥳<span>احتفال</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('😴'); setIsLibraryOpen(false); }} title="نائم">😴<span>نائم</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('👍'); setIsLibraryOpen(false); }} title="جيد">👍<span>جيد</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('👎'); setIsLibraryOpen(false); }} title="سيء">👎<span>سيء</span></button>
     </div>
   </div>

   <div className={styles.librarySection}>
     <h5>أشكال متنوعة</h5>
     <div className={styles.libraryGrid}>
        <button className={styles.libraryItem} onClick={() => { addEmoji('⭐'); setIsLibraryOpen(false); }} title="نجمة">⭐<span>نجمة</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('❤️'); setIsLibraryOpen(false); }} title="قلب">❤️<span>قلب</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('🔥'); setIsLibraryOpen(false); }} title="نار">🔥<span>نار</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('✅'); setIsLibraryOpen(false); }} title="صح">✅<span>صح</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('❌'); setIsLibraryOpen(false); }} title="خطأ">❌<span>خطأ</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('💡'); setIsLibraryOpen(false); }} title="فكرة">💡<span>فكرة</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('🏆'); setIsLibraryOpen(false); }} title="كأس">🏆<span>كأس</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('👑'); setIsLibraryOpen(false); }} title="تاج">👑<span>تاج</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('🚀'); setIsLibraryOpen(false); }} title="صاروخ">🚀<span>صاروخ</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('🧠'); setIsLibraryOpen(false); }} title="عقل">🧠<span>عقل</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('⚙️'); setIsLibraryOpen(false); }} title="إعدادات">⚙️<span>إعدادات</span></button>
        <button className={styles.libraryItem} onClick={() => { addEmoji('⏰'); setIsLibraryOpen(false); }} title="ساعة">⏰<span>ساعة</span></button>
     </div>
   </div>

   <div className={styles.librarySection}>
     <h5>أشكال إضافية</h5>
     <div className={styles.libraryGrid}>
        <button className={styles.libraryItem} onClick={() => { addHexagon(); setIsLibraryOpen(false); }} title="سداسي">⬡<span>سداسي</span></button>
        <button className={styles.libraryItem} onClick={() => { addCylinder(); setIsLibraryOpen(false); }} title="أسطوانة">🛢️<span>أسطوانة</span></button>
        <button className={styles.libraryItem} onClick={() => { addCube(); setIsLibraryOpen(false); }} title="مكعب">🧊<span>مكعب</span></button>
        <button className={styles.libraryItem} onClick={() => { addPyramid(); setIsLibraryOpen(false); }} title="هرم">🔺<span>هرم</span></button>
        <button className={styles.libraryItem} onClick={() => { addCone(); setIsLibraryOpen(false); }} title="مخروط">🍦<span>مخروط</span></button>
        <button className={styles.libraryItem} onClick={() => { addEllipse(); setIsLibraryOpen(false); }} title="بيضاوي">⬭<span>بيضاوي</span></button>
        <button className={styles.libraryItem} onClick={() => { addCloud(); setIsLibraryOpen(false); }} title="سحابة">☁️<span>سحابة</span></button>
        <button className={styles.libraryItem} onClick={() => { if(typeof addSpeechBubble === 'function') addSpeechBubble(); else { addRect(); }; setIsLibraryOpen(false); }} title="محادثة">💬<span>محادثة</span></button>
     </div>
   </div>

   <div className={styles.librarySection}>
     <h5>عناصر متحركة</h5>
     <div className={styles.libraryGrid}>
        <button className={styles.libraryItem} onClick={() => { addRotatingGear(); setIsLibraryOpen(false); }} title="ترس دوار">⚙️<span>ترس</span></button>
        <button className={styles.libraryItem} onClick={() => { addPulsingStar(); setIsLibraryOpen(false); }} title="نجمة نابضة">🌟<span>نجمة</span></button>
        <button className={styles.libraryItem} onClick={() => { addBlinkingArrow(); setIsLibraryOpen(false); }} title="سهم يومض">➡️<span>سهم</span></button>
        <button className={styles.libraryItem} onClick={() => { addBeatingHeart(); setIsLibraryOpen(false); }} title="قلب ينبض">💓<span>قلب</span></button>
        <button className={styles.libraryItem} onClick={() => { addWarningTriangle(); setIsLibraryOpen(false); }} title="تحذير">⚠️<span>تحذير</span></button>
        <button className={styles.libraryItem} onClick={() => { addRotatingHourglass(); setIsLibraryOpen(false); }} title="ساعة رملية">⏳<span>ساعة</span></button>
        <button className={styles.libraryItem} onClick={() => { addSyncArrows(); setIsLibraryOpen(false); }} title="تزامن">🔄<span>تزامن</span></button>
        <button className={styles.libraryItem} onClick={() => { addShakingRocket(); setIsLibraryOpen(false); }} title="صاروخ يهتز">🚀<span>صاروخ</span></button>
        <button className={styles.libraryItem} onClick={() => { addLoadingSpinner(); setIsLibraryOpen(false); }} title="تحميل">🌀<span>تحميل</span></button>
        <button className={styles.libraryItem} onClick={() => { addSwingingPendulum(); setIsLibraryOpen(false); }} title="بندول يتأرجح">⚖️<span>بندول</span></button>
        <button className={styles.libraryItem} onClick={() => { addBouncingBall(); setIsLibraryOpen(false); }} title="كرة ترتد">⚽<span>كرة</span></button>
     </div>
   </div>
</div>
)}


      {/* Advanced Overlays Bottom Right */}
      <div className={`${styles.advancedToolsContainer} ${isAdvancedToolsExpanded ? styles.advancedToolsPanel : ''}`} style={{ display: isAnyFullScreenOverlayActive ? 'none' : '' }}>
         {!isAdvancedToolsExpanded && !isMobile ? (
            <button className={styles.toolBtn} onClick={() => setIsAdvancedToolsExpanded(true)} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#0ea5e9' }} title="المزيد من الأدوات">
               <ChevronLeft size={20} />
            </button>
         ) : (
            <>
               <button onClick={() => setIsSpotlightActive(!isSpotlightActive)} className={styles.toolBtn} style={{ background: isSpotlightActive ? '#e0e7ff' : 'white', border: '1px solid #cbd5e1' }}><Crosshair size={20} color={isSpotlightActive ? '#4338ca' : '#475569'} /></button>
               <button onClick={() => setIsTimerActive(!isTimerActive)} className={styles.toolBtn} style={{ background: isTimerActive ? '#e0e7ff' : 'white', border: '1px solid #cbd5e1' }} title="المؤقت"><Timer size={20} color={isTimerActive ? '#4338ca' : '#475569'} /></button>
               <button onClick={() => setIsCalculatorActive(!isCalculatorActive)} className={styles.toolBtn} style={{ background: isCalculatorActive ? '#e0e7ff' : 'white', border: '1px solid #cbd5e1' }}><CalculatorIcon size={20} color={isCalculatorActive ? '#4338ca' : '#475569'} /></button>
               <button onClick={() => setIsBlindActive(!isBlindActive)} className={styles.toolBtn} style={{ background: isBlindActive ? '#e0e7ff' : 'white', border: '1px solid #cbd5e1' }} title="إخفاء الشاشة"><EyeOff size={20} color={isBlindActive ? '#4338ca' : '#475569'} /></button>
               <button onClick={() => setIsFlashcardModalOpen(true)} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#8b5cf6' }} title="إضافة كارت تفاعلي"><Layers size={20} /></button>
                 <button onClick={() => setIsSmartImportModalOpen(true)} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#4338ca' }} title="توليد كروت بالذكاء الاصطناعي"><BrainCircuit size={20} /></button>
                 <button onClick={() => setIsMathEquationModalOpen(true)} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#8b5cf6' }} title="معادلات رياضية"><Sigma size={20} /></button>
                 <button onClick={() => setIsSmartGraphModalOpen(true)} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#3b82f6' }} title="رسم بياني ذكي"><LineChart size={20} /></button>
               <button onClick={addMindMapRoot} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#0ea5e9' }} title="خريطة ذهنية"><Network size={20} /></button>
              <button onClick={() => setIsMindMapImportOpen(true)} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#3b82f6' }} title="توليد خريطة بالذكاء الاصطناعي"><Brain size={20} /></button>
               <button onClick={addMindMapBranch} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#3b82f6' }} title="إضافة فرع"><GitBranch size={20} /></button>
               <button onClick={() => setIsGeometryToolsModalOpen(true)} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#f59e0b' }} title="أدوات هندسية"><Ruler size={20} /></button>
               <button onClick={() => setIsMathQuizActive(true)} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#10b981' }} title="اختبار رياضيات"><FileQuestion size={20} /></button>
               <button onClick={() => setIsQuranPlayerActive(!isQuranPlayerActive)} className={styles.toolBtn} style={{ background: isQuranPlayerActive ? '#e0e7ff' : 'white', border: '1px solid #cbd5e1' }} title="مشغل تلاوة القرآن"><Volume2 size={20} /></button>
               <button onClick={() => setIsInteractiveMushafActive(true)} className={styles.toolBtn} style={{ background: isInteractiveMushafActive ? '#dcfce7' : 'white', border: '1px solid #cbd5e1', color: '#059669' }} title="مصحف التجويد التفاعلي"><BookOpen size={20} /></button>
               <button onClick={() => setIsSpinWheelActive(true)} className={`${styles.toolBtn} ${isSpinWheelActive ? styles.activeTool : ""}`} style={{ background: isSpinWheelActive ? '#e0e7ff' : 'white', border: '1px solid #cbd5e1', color: '#f43f5e' }} title="عجلة الحظ"><Dna size={20} /></button>
               <button onClick={addTicTacToeGrid} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#16a34a' }} title="لعبة XO"><Hash size={20} /></button>
               {!isMobile && (
                 <button className={styles.toolBtn} onClick={() => setIsAdvancedToolsExpanded(false)} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#ef4444' }} title="طي الأدوات المتقدمة">
                    <ChevronRight size={20} />
                 </button>
               )}
            </>
         )}
      </div>

          </>
        )}

      {isPresenting && (
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '15px', background: 'rgba(0,0,0,0.8)', padding: '10px 20px', borderRadius: '50px', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
           <button onClick={() => switchPage(currentPageIndex - 1)} disabled={currentPageIndex === 0} style={{ background: 'none', border: 'none', color: 'white', cursor: currentPageIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentPageIndex === 0 ? 0.5 : 1 }}><ChevronRight size={24} /></button>
           <span style={{ color: 'white', alignSelf: 'center', fontWeight: 'bold' }}>{currentPageIndex + 1} / {pages.length}</span>
           <button onClick={() => switchPage(currentPageIndex + 1)} disabled={currentPageIndex === pages.length - 1} style={{ background: 'none', border: 'none', color: 'white', cursor: currentPageIndex === pages.length - 1 ? 'not-allowed' : 'pointer', opacity: currentPageIndex === pages.length - 1 ? 0.5 : 1 }}><ChevronLeft size={24} /></button>
           
           <div style={{ width: '1px', background: '#475569', margin: '0 5px' }}></div>
           
           <button onClick={() => setTool(tool === 'laser' ? 'select' : 'laser')} style={{ background: tool === 'laser' ? '#ef4444' : 'transparent', border: 'none', color: 'white', padding: '5px', borderRadius: '50%', cursor: 'pointer' }} title="مؤشر الليزر"><Sparkles size={24} /></button>
           <button onClick={togglePresentationMode} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', padding: '5px', cursor: 'pointer' }} title="إنهاء العرض التقديمي"><X size={24} /></button>
        </div>
      )}

      <SpotlightOverlay isActive={isSpotlightActive} shape={spotlightShape} isLocked={isSpotlightLocked} onToggleLock={() => setIsSpotlightLocked(!isSpotlightLocked)} onChangeShape={() => setSpotlightShape(spotlightShape === 'circle' ? 'rect' : 'circle')} />
      <TimerOverlay isActive={isTimerActive} onClose={() => setIsTimerActive(false)} />
      <BlindOverlay isActive={isBlindActive} onClose={() => setIsBlindActive(false)} />
      <MagnifierOverlay isActive={isMagnifierActive} fabricCanvas={canvas} />
      <SpinWheelOverlay isActive={isSpinWheelActive} onClose={() => setIsSpinWheelActive(false)} />
      <QuranOrderGameOverlay isActive={isQuranGameActive} onClose={() => setIsQuranGameActive(false)} />
      <WordBuilderOverlay isActive={isWordBuilderActive} onClose={() => setIsWordBuilderActive(false)} />
      <MemoryGameOverlay isActive={isMemoryGameActive} onClose={() => setIsMemoryGameActive(false)} />
      <PeriodicTableOverlay isActive={isPeriodicTableActive} onClose={() => setIsPeriodicTableActive(false)} />
      <ReadyPathwayOverlay isActive={isReadyPathwayActive} onClose={() => setIsReadyPathwayActive(false)} />
        <WordSearchOverlay isActive={isWordSearchActive} onClose={() => setIsWordSearchActive(false)} />
      <QuranPlayerOverlay isActive={isQuranPlayerActive} onClose={() => setIsQuranPlayerActive(false)} />
      <InteractiveMushafOverlay isActive={isInteractiveMushafActive} onClose={() => setIsInteractiveMushafActive(false)} />
      <GeometryToolsModal isActive={isGeometryToolsModalOpen} onClose={() => setIsGeometryToolsModalOpen(false)} onSelectTool={addGeometryTool} isPremium={isPremium || isAdmin} setShowPremiumAlert={setShowPremiumAlert} />
      <MathQuizOverlay isActive={isMathQuizActive} onClose={() => setIsMathQuizActive(false)} />
      <SmartImportModal isActive={isSmartImportModalOpen} onClose={() => setIsSmartImportModalOpen(false)} onImport={handleSmartImport} />
        <MindMapImportModal isAdmin={isAdmin} isActive={isMindMapImportOpen} onClose={() => setIsMindMapImportOpen(false)} onImport={handleMindMapImport} />
        <MathEquationModal isActive={isMathEquationModalOpen} onClose={() => setIsMathEquationModalOpen(false)} canvas={canvas} color={color} onSaveHistory={() => saveHistory(canvas)} />
        <SmartGraphModal isActive={isSmartGraphModalOpen} onClose={() => setIsSmartGraphModalOpen(false)} canvas={canvas} color={color} onSaveHistory={() => saveHistory(canvas)} />
        <HangmanOverlay isActive={isHangmanActive} onClose={() => setIsHangmanActive(false)} />
          <FlashcardModal isAdmin={isAdmin} isActive={isFlashcardModalOpen} onClose={() => setIsFlashcardModalOpen(false)} onAdd={(f, b) => addFlashcard(f, b)} />
        <QuizShowOverlay isActive={isQuizShowActive} onClose={() => setIsQuizShowActive(false)} />

      
      {/* External Games Iframe Overlay */}
      {activeIframeUrl && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 9999, background: 'white' }}>
          <button 
            onClick={() => setActiveIframeUrl(null)} 
            style={{ 
              position: 'absolute', top: '15px', right: '15px', zIndex: 10000, 
              background: '#ef4444', color: 'white', border: 'none', 
              borderRadius: '50%', width: '40px', height: '40px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}
          >
            <X size={24} />
          </button>
          <iframe src={activeIframeUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
        </div>
      )}
      <BackgroundsLibraryModal 
        isActive={isBackgroundsLibraryOpen} 
        onClose={() => setIsBackgroundsLibraryOpen(false)} 
        onSelectBackground={(url) => { 
          setCustomBgImage(url); 
          if(url) {
            setBgType('blank');
            if (canvas) {
              fabric.Image.fromURL(url, (img) => {
                if (!img) return;
                const canvasAspect = canvas.width / canvas.height;
                const imgAspect = img.width / img.height;
                let scaleFactor = canvasAspect >= imgAspect ? canvas.width / img.width : canvas.height / img.height;
                img.set({ scaleX: scaleFactor, scaleY: scaleFactor, originX: 'center', originY: 'center', left: canvas.width / 2, top: canvas.height / 2 });
                canvas.setBackgroundImage(img, () => {
                  canvas.renderAll();
                  saveHistory(canvas);
                });
              }, { crossOrigin: 'anonymous' });
            }
          }
        }} 
        isPremium={isPremium || isAdmin}
        setShowPremiumAlert={setShowPremiumAlert}
      />
      <AIImageModal isOpen={isAIGeneratorOpen} onClose={() => setIsAIGeneratorOpen(false)} onInsert={handleInsertAIImage} />
      
      <StickersLibraryModal 
        isActive={isStickersLibraryOpen} 
        onClose={() => setIsStickersLibraryOpen(false)} 
        onSelectSticker={handleSelectSticker} 
        isPremium={isPremium || isAdmin}
        setShowPremiumAlert={setShowPremiumAlert}
      />
      <ScienceLibraryModal 
        isActive={isScienceLibraryOpen} 
        onClose={() => setIsScienceLibraryOpen(false)} 
        onSelectModel={(url, name) => setIframes([...iframes, { id: Date.now(), url, title: name, x: window.innerWidth/2 - 300, y: window.innerHeight/2 - 200 }])}
        isPremium={isPremium || isAdmin}
        setShowPremiumAlert={setShowPremiumAlert}
      />
      {isCalculatorActive && <Calculator onClose={() => setIsCalculatorActive(false)} initialPos={{ x: 100, y: 100 }} />}

      {/* Quran Modal */}
      {showQuranModal && (
        <div style={{
          position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: '20px', 
          borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 100,
          display: 'flex', flexDirection: 'column', gap: '15px', direction: 'rtl', width: '320px', fontFamily: 'Tajawal'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f5132' }}>إضافة آية قرآنية</h3>
            <button onClick={() => setShowQuranModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}><X size={20}/></button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px', color: '#475569', fontWeight: 'bold' }}>رقم السورة (1-114):</label>
            <input type="number" min="1" max="114" value={quranSurah} onChange={e => setQuranSurah(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px', color: '#475569', fontWeight: 'bold' }}>رقم الآية:</label>
            <input type="number" min="1" value={quranAyah} onChange={e => setQuranAyah(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>

          <button 
            onClick={addQuranAyah} 
            disabled={isFetchingAyah}
            style={{
              background: '#059669', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
            }}>
            {isFetchingAyah ? 'جاري الإضافة...' : <><BookOpen size={20} /> إضافة الآية للسبورة</>}
          </button>
        </div>
      )}

      {/* Games Modal */}
      {showGamesModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'white', padding: '24px', borderRadius: '24px', width: '100%', maxWidth: '780px', maxHeight: '90vh',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)', position: 'relative', display: 'flex', flexDirection: 'column', direction: 'rtl'
          }}>
            <button onClick={() => setShowGamesModal(false)} style={{
              position: 'absolute', top: '18px', left: '18px', background: 'none', border: 'none',
              cursor: 'pointer', color: '#64748b'
            }}><X size={24} /></button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingLeft: '30px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ color: '#0f5132', margin: '0 0 4px 0', fontSize: '1.4rem', fontFamily: 'Tajawal', fontWeight: 800 }}>🎮 الألعاب والأنشطة التفاعلية في السبورة</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontFamily: 'Tajawal' }}>اختر اللعبة لفتحها داخل مساحة العمل، أو خصص الأسئلة والكلمات بالذكاء الاصطناعي</p>
              </div>

              <button
                onClick={() => {
                  setShowGamesModal(false);
                  setShowGameManagerModal(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
                  flexShrink: 0
                }}
              >
                <span>🤖 إعدادات وأسئلة المعلم / AI</span>
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '12px',
              overflowY: 'auto',
              padding: '6px'
            }}>
              {[
                { title: 'سباق دمج الحروف', icon: '🏎️', desc: 'فونكس وسيارة', action: () => { setActiveIframeUrl('/kids-corner/car-blending'); setShowGamesModal(false); } },
                { title: 'صيد الحروف (Claw)', icon: '🕹️', desc: 'مخلب أركيد حركي', action: () => { setActiveIframeUrl('/kids-corner/claw-machine'); setShowGamesModal(false); } },
                { title: 'تكسير الصخور', icon: '🪨', desc: 'فونكس وتكسير صخور', action: () => { setActiveIframeUrl('/kids-corner/blending-rocks'); setShowGamesModal(false); } },
                { title: 'قطار الكلمات الذكي', icon: '🚂', desc: 'محطات وحروف مفقودة', action: () => { setActiveIframeUrl('/kids-corner/train'); setShowGamesModal(false); } },
                { title: 'تركيب وبازل الكلمات', icon: '🧩', desc: 'ترتيب الحروف', action: () => { setActiveIframeUrl('/kids-corner/puzzle'); setShowGamesModal(false); } },
                { title: 'أنشطة سور القرآن', icon: '🌿', desc: '114 سورة + ترتيب آيات', action: () => { setActiveIframeUrl('/kids-corner/quran-words'); setShowGamesModal(false); } },
                { title: 'ماريو المعرفة', icon: '🍄', desc: 'مغامرات وأسئلة منهج', action: () => { setActiveIframeUrl('/kids-corner/games/mario'); setShowGamesModal(false); } },
                { title: 'الجري السريع (Subway)', icon: '🏃', desc: 'تفادي وسرعة بديهة', action: () => { setActiveIframeUrl('/kids-corner/games/subway'); setShowGamesModal(false); } },
                { title: 'معركة الفضاء', icon: '🚀', desc: 'إطلاق نار وإجابات', action: () => { setActiveIframeUrl('/kids-corner/games/space'); setShowGamesModal(false); } },
                { title: 'لعبة الذاكرة والمطابقة', icon: '🧠', desc: 'كروت الذاكرة المباشرة', action: () => { setIsMemoryGameActive(true); setShowGamesModal(false); } },
                { title: 'مصحف التجويد التفاعلي', icon: '📖', desc: 'تظليل وتلاوة', action: () => { setIsInteractiveMushafActive(true); setShowGamesModal(false); } },
                { title: 'ألعاب القواعد النحوية', icon: '🔤', desc: 'تحديات النحو والصرف', action: () => { setActiveIframeUrl('/grammar-games'); setShowGamesModal(false); } }
              ].map((game, gIdx) => (
                <button
                  key={gIdx}
                  onClick={game.action}
                  style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '14px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f9ff';
                    e.currentTarget.style.borderColor = '#38bdf8';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '2.2rem' }}>{game.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{game.title}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{game.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Teacher Game Manager & AI Generator Modal on Whiteboard */}
      <TeacherGameManagerModal
        isOpen={showGameManagerModal}
        onClose={() => setShowGameManagerModal(false)}
        initialMode="words"
      />

      {/* Premium Alert Modal */}
      {showPremiumAlert && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '15px', maxWidth: '400px',
            textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontFamily: 'Tajawal'
          }}>
            <h3 style={{ color: '#0f5132', marginBottom: '15px', fontSize: '1.5rem' }}>ميزة للمشتركين فقط</h3>
            <p style={{ color: '#475569', marginBottom: '20px', lineHeight: 1.6 }}>
              {isTeacherDashboard 
                ? 'هذه الميزة متاحة فقط في الباقة المتقدمة. قم بترقية حسابك الآن للاستمتاع بكافة الأدوات الذكية!'
                : 'هذه الميزة متاحة للمشتركين فقط. يرجى تسجيل الدخول أو الاشتراك للاستمتاع بكافة الأدوات!'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => { window.location.href = isTeacherDashboard ? '/pricing' : '/login'; }} style={{ background: '#059669', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Tajawal' }}>
                {isTeacherDashboard ? 'ترقية الحساب الآن' : 'تسجيل الدخول'}
              </button>
              <button onClick={() => setShowPremiumAlert(false)} style={{ background: '#e2e8f0', color: '#475569', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Tajawal' }}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {youtubeVideos.map(video => (
        <DraggableVideo 
          key={video.id} 
          video={video} 
          onClose={() => setYoutubeVideos(prev => prev.filter(v => v.id !== video.id))} 
        />
      ))}
      
      {cameras.map(cam => (
        <DraggableCamera 
          key={cam.id} 
          data={cam} 
          onClose={() => setCameras(prev => prev.filter(c => c.id !== cam.id))} 
        />
      ))}

      {iframes.map(ifr => (
        <DraggableIframe 
          key={ifr.id} 
          data={ifr} 
          onClose={() => setIframes(prev => prev.filter(i => i.id !== ifr.id))} 
        />
      ))}

      {animatedStickers.map(sticker => (
        <DraggableAnimatedSticker
          key={sticker.id}
          data={sticker}
          onClose={() => setAnimatedStickers(prev => prev.filter(s => s.id !== sticker.id))}
        />
      ))}
      {/* 🎤 Voice Typing Modal 🎤 */}
      {isRecordingVoice && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal'
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '500px',
            textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', animation: 'zoomIn 0.3s ease-out'
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', background: '#fce7f3', color: '#ec4899',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
              animation: 'pulse 1.5s infinite'
            }}>
              <Mic size={40} />
            </div>
            <h3 style={{ color: '#1e293b', marginBottom: '15px', fontSize: '1.5rem' }}>تحدث الآن...</h3>
            
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px',
              minHeight: '100px', marginBottom: '20px', fontSize: '1.2rem', color: '#334155', direction: 'rtl',
              textAlign: 'right'
            }}>
              {voiceText || <span style={{ color: '#94a3b8' }}>جاري الاستماع...</span>}
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button onClick={stopVoiceTyping} style={{
                padding: '12px 24px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '10px',
                fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', flex: 1
              }}>
                إلغاء
              </button>
              <button onClick={submitVoiceText} disabled={!voiceText.trim()} style={{
                padding: '12px 24px', background: voiceText.trim() ? '#10b981' : '#94a3b8', color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '1.1rem', fontWeight: 'bold', cursor: voiceText.trim() ? 'pointer' : 'not-allowed', flex: 1
              }}>
                إضافة للسبورة
              </button>
            </div>
          </div>
          <style>{`
            @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4); }
              70% { box-shadow: 0 0 0 20px rgba(236, 72, 153, 0); }
              100% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); }
            }
          `}</style>
        </div>
      )}

      {/* 📄 PDF Export Options Modal (تصدير بالخلفية أو بخلفية بيضاء) */}
      {showExportPdfModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px',
            direction: 'rtl',
            fontFamily: 'Tajawal, sans-serif'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowExportPdfModal(false); }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '520px',
              maxWidth: '96vw',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              animation: 'scaleIn 0.2s ease-out'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 22px',
                borderBottom: '1px solid #f1f5f9',
                background: '#f8fafc'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px' }}>📄</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>
                    تصدير السبورة إلى ملف PDF
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    لقد أضفت خلفية / كتاب مدرسي إلى السبورة، اختر نمط التصدير:
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExportPdfModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Choices */}
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Option 1: With Background */}
              <button
                onClick={() => executeExportPdf(true)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: '14px',
                  border: '2px solid #3b82f6',
                  background: '#eff6ff',
                  cursor: 'pointer',
                  textAlign: 'right',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  flexShrink: 0
                }}>
                  🖼️
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#1d4ed8' }}>
                      تصدير بالخلفية (مع الكتاب / الصورة)
                    </span>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 'bold',
                      background: '#2563eb',
                      color: 'white',
                      padding: '2px 7px',
                      borderRadius: '99px'
                    }}>
                      شامل
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#334155', lineHeight: 1.5 }}>
                    يحفظ الملف متضمناً صفحة الكتاب المدرسي أو الخلفية المضافة مع جميع كتاباتك وشروحاتك بدقة عالية.
                  </p>
                </div>
              </button>

              {/* Option 2: White Background */}
              <button
                onClick={() => executeExportPdf(false)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: '14px',
                  border: '2px solid #10b981',
                  background: '#f0fdf4',
                  cursor: 'pointer',
                  textAlign: 'right',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#d1fae5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  flexShrink: 0
                }}>
                  📝
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#047857' }}>
                      تصدير بخلفية بيضاء (الشرح والرسومات فقط)
                    </span>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 'bold',
                      background: '#059669',
                      color: 'white',
                      padding: '2px 7px',
                      borderRadius: '99px'
                    }}>
                      نقي للطباعة
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#334155', lineHeight: 1.5 }}>
                    يستثني الكتاب أو الخلفية ويصدر كتاباتك وملاحظاتك فقط على صفحات بيضاء نقية ومريحة جداً للطباعة.
                  </p>
                </div>
              </button>

            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 22px',
                borderTop: '1px solid #f1f5f9',
                background: '#f8fafc'
              }}
            >
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                💡 إجمالي عدد الصفحات: <strong>{pages.length}</strong>
              </span>
              <button
                onClick={() => setShowExportPdfModal(false)}
                style={{
                  background: 'white',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px 16px',
                  fontSize: '12.5px',
                  fontWeight: 'bold',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⏳ PDF Export Loading Spinner Overlay */}
      {isExportingPdf && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            gap: '14px',
            color: 'white',
            direction: 'rtl',
            fontFamily: 'Tajawal, sans-serif'
          }}
        >
          <div style={{
            width: '46px',
            height: '46px',
            border: '4px solid rgba(255,255,255,0.2)',
            borderTopColor: '#38bdf8',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {exportProgressText || 'جاري تجهيز وتصدير ملف الـ PDF...'}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            يرجى الانتظار لحظات حتى تكتمل المعالجة بدقة عالية
          </div>
        </div>
      )}
    </div>
  )
}










