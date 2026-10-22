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
      backText: options.backText || 'إجابة البطاقة',
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
    if (!this.backgroundColor && !this.nodeColor) return;
    var widthVal = this.width || 160;
    var heightVal = this.height || 40;
    var w = widthVal + this.padding * 2, h = heightVal + this.padding * 2;
    var x = -widthVal/2 - this.padding, y = -heightVal/2 - this.padding;
    var rx = this.theme === 'circle' ? Math.min(w,h)/2 : this.rx;
    var ry = this.theme === 'circle' ? Math.min(w,h)/2 : this.ry;
    
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
    
    if (this.theme === 'outline') {
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = this.nodeColor;
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (this.theme === 'minimal') {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.strokeStyle = this.nodeColor;
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      ctx.fillStyle = this.nodeColor;
      ctx.fill();
    }
  },
  toObject: function() {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      isMindMapNode: this.isMindMapNode, mindMapId: this.mindMapId, nodeColor: this.nodeColor, theme: this.theme,
      rx: this.rx, ry: this.ry, padding: this.padding
    });
  }
});
fabric.MindMapText.fromObject = function(object, callback) {
  return fabric.Object._fromObject('MindMapText', object, callback, 'text');
};
import { Pen, Mic, MonitorPlay, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, MousePointer2, Eraser, Highlighter, Square, Circle, Triangle, Minus, ArrowRight, Type, Image as ImageIcon, Video, StickyNote, Undo2, Redo2, Download, Trash2, FolderOpen, Save, Settings2, Maximize, X, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Hand, Crosshair, Sparkles, Plus, Calculator as CalculatorIcon, Volume2, HelpCircle, Timer, EyeOff, Ruler, FileQuestion, Sigma, LineChart, BrainCircuit, Network, Brain, GitBranch, Hash, FlaskConical, Palette, FileText, Upload, Users, BookOpen } from 'lucide-react'
import styles from '../../teacher-assistant/whiteboard/page.module.css'
import SpotlightOverlay from '../../teacher-assistant/whiteboard/SpotlightOverlay'
import TimerOverlay from '../../teacher-assistant/whiteboard/TimerOverlay'
import BlindOverlay from '../../teacher-assistant/whiteboard/BlindOverlay'
import MagnifierOverlay from '../../teacher-assistant/whiteboard/MagnifierOverlay'
import QuranPlayerOverlay from '../../teacher-assistant/whiteboard/QuranPlayerOverlay'
import InteractiveMushafOverlay from '../../teacher-assistant/whiteboard/InteractiveMushafOverlay'
import Calculator from '../../components/Calculator'
import GeometryToolsModal from '../whiteboard/GeometryToolsModal'
import MathQuizOverlay from '../whiteboard/MathQuizOverlay'
import FlashcardModal from '../whiteboard/FlashcardModal'
import SmartImportModal from '../whiteboard/SmartImportModal'
import MindMapImportModal from '../whiteboard/MindMapImportModal'
import MotivationalCardsModal from '../whiteboard/MotivationalCardsModal'
import MathEquationModal from '../whiteboard/MathEquationModal'
import SmartGraphModal from '../whiteboard/SmartGraphModal'
import HangmanOverlay from '../whiteboard/HangmanOverlay'
import QuizShowOverlay from '../whiteboard/QuizShowOverlay'
import LiveRewardsModal from './LiveRewardsModal'
import WordSearchOverlay from '../whiteboard/WordSearchOverlay'
import QuranOrderGameOverlay from '../whiteboard/QuranOrderGameOverlay'
import WordBuilderOverlay from '../whiteboard/WordBuilderOverlay'
import PeriodicTableOverlay from '../whiteboard/PeriodicTableOverlay'
import ReadyPathwayOverlay from '../whiteboard/ReadyPathwayOverlay'
import MemoryGameOverlay from '../whiteboard/MemoryGameOverlay'
import TeacherGuideModal from '../whiteboard/TeacherGuideModal'
import BackgroundsLibraryModal from '../whiteboard/BackgroundsLibraryModal'
import StickersLibraryModal from '../whiteboard/StickersLibraryModal'
import ScienceLibraryModal from '../whiteboard/ScienceLibraryModal'
import LivePollTeacher from './LivePollTeacher'
import { removeBroadcastBinding } from '../../utils/realtimeHelper'

const DraggableVideo = ({ video, onClose }) => {
  const [pos, setPos] = useState({ x: video.x, y: video.y });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    });
    e.target.setPointerCapture(e.pointerId);
  }

  const handlePointerMove = (e) => {
    if (isDragging) {
      setPos({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    }
  }

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  }

  return (
    <div style={{
      position: 'absolute', left: pos.x, top: pos.y, width: 400, height: 300,
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
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>📺 فيديو يوتيوب (اسحب للتحريك)</span>
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

export default function LiveWhiteboardTeacher({
  channel,
  students = [],
  isMobile = false,
  isAdmin = false,
  isARActive: externalIsARActive,
  setIsARActive: externalSetIsARActive
}) {
  const [internalIsMobile, setInternalIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => {
      const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      const isMobileLandscape = window.innerHeight <= 500 && window.innerWidth <= 1024;
      setInternalIsMobile(isSmallScreen || isMobileLandscape || (isMobileUA && window.innerWidth <= 1024));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);
  const effectiveMobile = isMobile || internalIsMobile;

  const canvasRef = useRef(null)
  const outerContainerRef = useRef(null)
  const innerWrapperRef = useRef(null)
  const baseScaleRef = useRef(1)
    const clipboardRef = useRef(null)
  const broadcastTimeoutRef = useRef(null)
  const lastBroadcastTimeRef = useRef(0)
  const [uiScale, setUiScale] = useState(1)
  const [canvas, setCanvas] = useState(null)
    const [activeTextObject, setActiveTextObject] = useState(null)
    const [textUpdateTick, setTextUpdateTick] = useState(0)
  const fabricCanvasRef = useRef(null)
  
  const channelRef = useRef(channel)
  useEffect(() => { channelRef.current = channel }, [channel])

  const broadcastSafely = (event, payload, retries = 10) => {
    if (!channelRef.current) return
    const ch = channelRef.current
    let isReady = false
    if (typeof ch.canPush === 'function') {
      try { isReady = ch.canPush() } catch (_) { isReady = false }
    } else {
      isReady = ch.state === 'joined' && !!ch.socket && typeof ch.socket.isConnected === 'function' && ch.socket.isConnected()
    }
    if (isReady) {
      ch.send({ type: 'broadcast', event, payload }).catch((err) => { console.warn('Broadcast failed:', err) })
    } else if (retries > 0 && ch.state !== 'closed') {
      setTimeout(() => broadcastSafely(event, payload, retries - 1), 200)
    }
  }

  const broadcastState = (payloadObj) => {
    if (!channelRef.current) return;
    
    const now = Date.now();
    const timeSinceLast = now - lastBroadcastTimeRef.current;
    
    if (timeSinceLast >= 150) {
      if (broadcastTimeoutRef.current) {
        clearTimeout(broadcastTimeoutRef.current);
        broadcastTimeoutRef.current = null;
      }
      broadcastSafely('fabric_state', payloadObj);
      lastBroadcastTimeRef.current = now;
    } else {
      if (!broadcastTimeoutRef.current) {
        broadcastTimeoutRef.current = setTimeout(() => {
          broadcastSafely('fabric_state', payloadObj);
          lastBroadcastTimeRef.current = Date.now();
          broadcastTimeoutRef.current = null;
        }, 150 - timeSinceLast);
      }
    }
  };
  
  // Tool States
  const [tool, setTool] = useState('pen') // select, pen, highlighter, eraser, laser, pan
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const recognitionRef = useRef(null);
  const [color, setColor] = useState('#0f172a')
  const [lineWidth, setLineWidth] = useState(5)

  const handleLineWidthChange = (val) => {
    const num = Number(val);
    setLineWidth(num);
    if (canvas) {
      const activeObj = canvas.getActiveObject();
      if (activeObj) {
        if (activeObj.type === 'activeSelection') {
          activeObj.forEachObject((o) => {
            if (o.type === 'path' || o.strokeWidth !== undefined) {
              o.set('strokeWidth', num);
            } else if (o.type === 'i-text' || o.type === 'textbox' || o.type === 'text') {
              o.set('fontSize', Math.max(14, num * 5));
              if (typeof o.initDimensions === 'function') o.initDimensions();
            }
            o.setCoords();
          });
          activeObj.setCoords();
        } else if (activeObj.type === 'i-text' || activeObj.type === 'textbox' || activeObj.type === 'text') {
          activeObj.set('fontSize', Math.max(14, num * 5));
          if (typeof activeObj.initDimensions === 'function') activeObj.initDimensions();
          activeObj.setCoords();
        } else if (activeObj.set) {
          activeObj.set('strokeWidth', num);
          activeObj.setCoords();
        }
        canvas.requestRenderAll();
        saveHistory(canvas);
      }
    }
  };
  const [bgType, setBgType] = useState('blank') // blank, ruled, grid, letters
  const [bgLetter, setBgLetter] = useState('أ')
  const [isLandscape, setIsLandscape] = useState(true)
  const [activeObjType, setActiveObjType] = useState(null)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [internalARActive, setInternalARActive] = useState(false)
  const isARActive = externalIsARActive !== undefined ? externalIsARActive : internalARActive
  const setIsARActive = externalSetIsARActive || setInternalARActive

  // Multiple Pages & Project States
  const [pages, setPages] = useState([{ id: 1, json: null, assignedTo: null }])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  // PDF Export States (دعم التحميل بالخلفية أو بخلفية بيضاء)
  const [showExportPdfModal, setShowExportPdfModal] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [exportProgressText, setExportProgressText] = useState('')
  
  // Assign Page to Student
  const [isIndependentMode, setIsIndependentMode] = useState(false);
  const isIndependentModeRef = useRef(false);
  const [pdfModalData, setPdfModalData] = useState(null)
  const [pdfStartPage, setPdfStartPage] = useState(1)
  const [pdfEndPage, setPdfEndPage] = useState(1)
  const [isPdfLoading, setIsPdfLoading] = useState(false)

  useEffect(() => {
    document.body.classList.add('on-whiteboard');
    return () => {
      document.body.classList.remove('on-whiteboard');
    };
  }, []);

  useEffect(() => {
    isIndependentModeRef.current = isIndependentMode;
    // Broadcast the mode change
    broadcastSafely('independent_mode_toggle', { isIndependentMode });
    
    // If turning on independent mode, lock all previously assigned students
    if (isIndependentMode) {
      pages.forEach((page, index) => {
        if (page.assignedTo) {
          setTimeout(() => {
            broadcastSafely('assign_student_to_page', {
              studentId: page.assignedTo.id,
              pageIndex: index,
              isIndependentMode: true
            });
          }, index * 50); // Stagger broadcasts slightly
        }
      });
    }
  }, [isIndependentMode]);

  const assignPageToStudent = (studentId, studentName) => {
    const newPages = [...pages];
    if (studentId === 'none') {
      newPages[currentPageIndex].assignedTo = null;
    } else {
      newPages[currentPageIndex].assignedTo = { id: studentId, name: studentName };
    }
    setPages(newPages);
    
    // Targeted event for independent mode lock
    broadcastSafely('assign_student_to_page', {
      studentId: studentId === 'none' ? null : studentId,
      pageIndex: currentPageIndex,
      isIndependentMode: isIndependentModeRef.current
    });
    
    // Broadcast Assignment for display
    broadcastSafely('page_assignment', { 
      pageIndex: currentPageIndex, 
      assignedTo: newPages[currentPageIndex].assignedTo 
    });
  }
  const currentPageIndexRef = useRef(0)
  const pagesRef = useRef(pages)
  
  useEffect(() => {
    currentPageIndexRef.current = currentPageIndex;
  }, [currentPageIndex]);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

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
  const [isCalculatorActive, setIsCalculatorActive] = useState(false)
  const [isQuranPlayerActive, setIsQuranPlayerActive] = useState(false)
  const [isInteractiveMushafActive, setIsInteractiveMushafActive] = useState(false)
  const [isGeometryToolsModalOpen, setIsGeometryToolsModalOpen] = useState(false)
  const [isMathQuizActive, setIsMathQuizActive] = useState(false)
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false)
  const [isSmartImportModalOpen, setIsSmartImportModalOpen] = useState(false)
  const [isMindMapImportOpen, setIsMindMapImportOpen] = useState(false)
  const [isMotivationalModalOpen, setIsMotivationalModalOpen] = useState(false)
    const [isMathEquationModalOpen, setIsMathEquationModalOpen] = useState(false)
    const [isSmartGraphModalOpen, setIsSmartGraphModalOpen] = useState(false)
    const [isHangmanActive, setIsHangmanActive] = useState(false)
    const [isQuizShowActive, setIsQuizShowActive] = useState(false)
  const [isWordSearchActive, setIsWordSearchActive] = useState(false)
  const [isQuranGameActive, setIsQuranGameActive] = useState(false)
  const [isWordBuilderActive, setIsWordBuilderActive] = useState(false)
  const [isPeriodicTableActive, setIsPeriodicTableActive] = useState(false)
  const [isReadyPathwayActive, setIsReadyPathwayActive] = useState(false)
  const [isMemoryGameActive, setIsMemoryGameActive] = useState(false)
  const [isBackgroundsLibraryOpen, setIsBackgroundsLibraryOpen] = useState(false)
  const [isStickersLibraryOpen, setIsStickersLibraryOpen] = useState(false)
  const [isScienceLibraryOpen, setIsScienceLibraryOpen] = useState(false)
  const [customBgImage, setCustomBgImage] = useState(null)
  const [iframes, setIframes] = useState([])
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false)
  const [isPollModalOpen, setIsPollModalOpen] = useState(false)
  const [showGamesModal, setShowGamesModal] = useState(false)
  const [isAdvancedToolsExpanded, setIsAdvancedToolsExpanded] = useState(false)
    const [raisedHands, setRaisedHands] = useState([])
  const [isMathModalOpen, setIsMathModalOpen] = useState(false)
  const [mathInput, setMathInput] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMobileMenuExpanded, setIsMobileMenuExpanded] = useState(false)
    const [isPresenting, setIsPresenting] = useState(false)
  const [isLeftToolbarExpanded, setIsLeftToolbarExpanded] = useState(false)
  const [isTopLeftToolbarExpanded, setIsTopLeftToolbarExpanded] = useState(true)
  const [isTopRightToolbarExpanded, setIsTopRightToolbarExpanded] = useState(true)
  const [isBottomToolbarExpanded, setIsBottomToolbarExpanded] = useState(false)
  const [showMobileBottomToolbars, setShowMobileBottomToolbars] = useState(true)
  const [mobileActiveCategory, setMobileActiveCategory] = useState('draw') // 'draw' | 'colors' | 'insert' | 'tools'
  const [showCheers, setShowCheers] = useState(false)
  const [youtubeVideos, setYoutubeVideos] = useState([])

  // History States for Undo/Redo
  const historyRef = useRef([])
  const historyIndexRef = useRef(-1)
  const isHistoryUpdateRef = useRef(false)
  const hasControlRef = useRef(true) // Teacher always has control
  const aspectRatioRef = useRef(1.3333) // 3:4 Portrait A4
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // React State Ref for broadcast closure
  const reactStateRef = useRef({
    bgType: 'blank', bgLetter: '', youtubeVideos: [], isTimerActive: false, isBlindActive: false, isMagnifierActive: false, isSpotlightActive: false, spotlightShape: 'circle', isQuranPlayerActive: false, isMathQuizActive: false
  });

  const toolRef = useRef(tool)
  const colorRef = useRef(color)
  const lineWidthRef = useRef(lineWidth)
  // Refs to provide latest bgType/bgLetter to ResizeObserver (avoids stale closure over React state)
  const bgTypeRef = useRef(bgType)
  const bgLetterRef = useRef(bgLetter)

  useEffect(() => {
    bgTypeRef.current = bgType;
    bgLetterRef.current = bgLetter;
  }, [bgType, bgLetter]);

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

  const getCenter = () => {
    if (!canvas) return { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    const center = canvas.getVpCenter();
    return { left: center.x, top: center.y };
  }

  useEffect(() => {
    toolRef.current = tool
    colorRef.current = color
    lineWidthRef.current = lineWidth
  }, [tool, color, lineWidth])

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
      
      if (newHistory.length > 30) {
        newHistory = newHistory.slice(newHistory.length - 30);
      }
      
      historyRef.current = newHistory;
      historyIndexRef.current = historyRef.current.length - 1;
      updateUndoRedoState();
      
      // Broadcast state to all students, including the independent mode flag
      broadcastState({ ...json, isIndependentMode: isIndependentModeRef.current });
    } catch (err) {
      console.warn("Could not serialize canvas state to history:", err);
    }
  }

  // Throttle ref lives outside the effect so it survives re-renders
  const syncThrottleTimeoutRef = useRef(null);

  // Handle incoming broadcasts
  useEffect(() => {
    if (!channel) return;
    let isMounted = true;
    
    // Listen for student's independent drawing
    const handleStudentFabricState = ({ payload }) => {
      if (!isMounted || !payload) return;
      const { pageIndex, state } = payload;
      
      // Update the pages array silently
      setPages(prevPages => {
        const newPages = [...prevPages];
        if (newPages[pageIndex]) {
          newPages[pageIndex].json = state;
        }
        return newPages;
      });

      // If the teacher is currently viewing this exact page, load it onto the canvas!
      if (currentPageIndexRef.current === pageIndex && fabricCanvasRef.current) {
        isHistoryUpdateRef.current = true;
        const currentVpt = fabricCanvasRef.current.viewportTransform.slice();
        const currentBg = fabricCanvasRef.current.backgroundImage;
        const currentBgColor = fabricCanvasRef.current.backgroundColor;

        fabricCanvasRef.current.loadFromJSON(state, () => {
          if (!isMounted || !fabricCanvasRef.current) return;
          fabricCanvasRef.current.setViewportTransform(currentVpt);
          
          if (!state.backgroundImage && currentBg) {
             fabricCanvasRef.current.backgroundImage = currentBg;
          }
          if (!state.background && currentBgColor) {
             fabricCanvasRef.current.backgroundColor = currentBgColor;
          }

          fabricCanvasRef.current.renderAll();
          setTimeout(() => { isHistoryUpdateRef.current = false; }, 80);
        });
      }
    };
    channel.on('broadcast', { event: 'student_fabric_state' }, handleStudentFabricState);

    // Listen for student_control_draw: fires when teacher granted control and student draws
    const handleControlledStudentState = ({ payload }) => {
      if (!isMounted || !fabricCanvasRef.current || !payload) return;

      isHistoryUpdateRef.current = true;
      const currentVpt = fabricCanvasRef.current.viewportTransform.slice();
      const currentBg = fabricCanvasRef.current.backgroundImage;
      const currentBgColor = fabricCanvasRef.current.backgroundColor;

      fabricCanvasRef.current.loadFromJSON(payload, () => {
        if (!isMounted || !fabricCanvasRef.current) return;
        fabricCanvasRef.current.setViewportTransform(currentVpt);
        if (!payload.backgroundImage && currentBg) {
           fabricCanvasRef.current.backgroundImage = currentBg;
        }
        if (!payload.background && currentBgColor) {
           fabricCanvasRef.current.backgroundColor = currentBgColor;
        }
        fabricCanvasRef.current.renderAll();
        setTimeout(() => { isHistoryUpdateRef.current = false; }, 80);
      });
    };
    channel.on('broadcast', { event: 'student_control_draw' }, handleControlledStudentState);

    const handleDisabledState = ({ payload }) => {
      if (!isMounted || !fabricCanvasRef.current || !payload) return;
      isHistoryUpdateRef.current = true;
      const currentVpt = fabricCanvasRef.current.viewportTransform.slice();
      const currentBg = fabricCanvasRef.current.backgroundImage;
      const currentBgColor = fabricCanvasRef.current.backgroundColor;

      fabricCanvasRef.current.loadFromJSON(payload, () => {
        if (!isMounted || !fabricCanvasRef.current) return;
        fabricCanvasRef.current.setViewportTransform(currentVpt);
        
        if (!payload.backgroundImage && currentBg) {
           fabricCanvasRef.current.backgroundImage = currentBg;
        }
        if (!payload.background && currentBgColor) {
           fabricCanvasRef.current.backgroundColor = currentBgColor;
        }
        
        fabricCanvasRef.current.renderAll();
        
        const json = getSafeJson(fabricCanvasRef.current);
        setPages(prevPages => {
          const newPages = [...prevPages];
          if (newPages[currentPageIndexRef.current]) {
            newPages[currentPageIndexRef.current].json = json;
          }
          return newPages;
        });

        setTimeout(() => {
          isHistoryUpdateRef.current = false;
        }, 80);
      });
    };
    channel.on('broadcast', { event: 'teacher_sync_disabled_for_security' }, handleDisabledState);

    const handleLaserDraw = ({ payload }) => {
      if (!isMounted || !fabricCanvasRef.current) return;
      const canvas = fabricCanvasRef.current;
      const path = new fabric.Path(payload.path, {
        left: payload.left,
        top: payload.top,
        stroke: payload.color,
        strokeWidth: 6,
        fill: '',
        selectable: false,
        evented: false,
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        shadow: new fabric.Shadow({ color: payload.color, blur: 15 })
      });
      canvas.add(path);
      path.animate('opacity', 0, {
        duration: 2000,
        onChange: canvas.renderAll.bind(canvas),
        onComplete: () => canvas.remove(path)
      });
    };
    channel.on('broadcast', { event: 'laser_draw' }, handleLaserDraw);

    const handleCheer = ({ payload }) => {
      if (!isMounted) return;
      if (payload && payload.type) {
         window.triggerRemoteCheer && window.triggerRemoteCheer(payload.type);
      }
    };
    channel.on('broadcast', { event: 'cheer' }, handleCheer);

    const handleSyncResponse = () => {
      if (!isMounted || !fabricCanvasRef.current || !channelRef.current) return;
      // Use ref-based throttle that survives re-renders
      if (syncThrottleTimeoutRef.current) return;
      syncThrottleTimeoutRef.current = setTimeout(() => {
        syncThrottleTimeoutRef.current = null;
      }, 500);

      broadcastSafely('react_state', { ...reactStateRef.current, aspectRatio: aspectRatioRef.current });
      broadcastSafely('board_config', { aspectRatio: aspectRatioRef.current });
      if (baseScaleRef.current && fabricCanvasRef.current) {
        broadcastSafely('viewport_update', { vpt: fabricCanvasRef.current.viewportTransform, baseScale: baseScaleRef.current });
      }
      if (fabricCanvasRef.current) {
        const json = getSafeJson(fabricCanvasRef.current);
        broadcastState(json);
      }
      if (pagesRef.current && pagesRef.current[currentPageIndexRef.current]) {
        broadcastSafely('page_assignment', { 
          pageIndex: currentPageIndexRef.current, 
          assignedTo: pagesRef.current[currentPageIndexRef.current].assignedTo || null
        });
      }
    };

    channel.on('broadcast', { event: 'request_state' }, handleSyncResponse);
    channel.on('broadcast', { event: 'global_sync_request' }, handleSyncResponse);
    window.addEventListener('on_global_sync_request', handleSyncResponse);

    const handleReactState = ({ payload }) => {
      if (!isMounted) return;
      setBgType(payload.bgType || 'blank');
      setBgLetter(payload.bgLetter || '?');
      setYoutubeVideos(payload.youtubeVideos || []);
      setIsTimerActive(payload.isTimerActive || false);
      setIsBlindActive(payload.isBlindActive || false);
      setIsMagnifierActive(payload.isMagnifierActive || false);
      setIsSpotlightActive(payload.isSpotlightActive || false);
      setSpotlightShape(payload.spotlightShape || 'circle');
    };
    channel.on('broadcast', { event: 'react_state' }, handleReactState);

    return () => {
      isMounted = false;
      removeBroadcastBinding(channel, 'student_fabric_state', handleStudentFabricState);
      removeBroadcastBinding(channel, 'student_control_draw', handleControlledStudentState);
      removeBroadcastBinding(channel, 'teacher_sync_disabled_for_security', handleDisabledState);
      removeBroadcastBinding(channel, 'laser_draw', handleLaserDraw);
      removeBroadcastBinding(channel, 'cheer', handleCheer);
      removeBroadcastBinding(channel, 'request_state', handleSyncResponse);
      removeBroadcastBinding(channel, 'global_sync_request', handleSyncResponse);
      removeBroadcastBinding(channel, 'react_state', handleReactState);
      window.removeEventListener('on_global_sync_request', handleSyncResponse);
      // Clear pending broadcast timeout
      if (broadcastTimeoutRef.current) clearTimeout(broadcastTimeoutRef.current);
    };
  }, [channel]);

  const broadcastViewport = () => {
    if (channelRef.current && fabricCanvasRef.current) {
      broadcastSafely('viewport_update', {
        vpt: fabricCanvasRef.current.viewportTransform,
        baseScale: baseScaleRef.current
      });
    }
  };

  // Broadcast React States (Overlays, bg)
  useEffect(() => {
    if (channelRef.current) {
      reactStateRef.current = { bgType, bgLetter, youtubeVideos, isTimerActive, isBlindActive, isMagnifierActive, isSpotlightActive, spotlightShape, isQuranPlayerActive, isMathQuizActive, isHangmanActive, isQuizShowActive, isWordSearchActive, isQuranGameActive, isWordBuilderActive, isPeriodicTableActive, isReadyPathwayActive, isMemoryGameActive, customBgImage, iframes };
      broadcastSafely('react_state', { ...reactStateRef.current, aspectRatio: aspectRatioRef.current });
    }
  }, [bgType, bgLetter, youtubeVideos, isTimerActive, isBlindActive, isMagnifierActive, isSpotlightActive, spotlightShape, isQuranPlayerActive, isMathQuizActive, isHangmanActive, isQuizShowActive, isWordSearchActive, isQuranGameActive, isWordBuilderActive, isPeriodicTableActive, isReadyPathwayActive, isMemoryGameActive, customBgImage, iframes]);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasRef.current || !canvasRef.current.parentElement) return;
    if (canvasRef.current.parentElement.getElementsByClassName('canvas-container').length > 0) return;

    fabric.Object.NUM_FRACTION_DIGITS = 2;
    fabric.Object.prototype.lockScalingFlip = true;
    fabric.Object.prototype.minScaleLimit = 0.05;
    fabric.Object.prototype.strokeUniform = true;

    const VIRTUAL_WIDTH = 1920;
    const VIRTUAL_HEIGHT = 1080;

    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: VIRTUAL_WIDTH,
      height: VIRTUAL_HEIGHT,
      isDrawingMode: true,
      preserveObjectStacking: true,
      selection: true,
      allowTouchScrolling: false
    })

    fabricCanvasRef.current = initCanvas;
    setCanvas(initCanvas)
    if (typeof window !== 'undefined') {
      window.__activeFabricCanvas = initCanvas;
      window.__broadcastViewport = broadcastViewport;
    }
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
    
    const handleObjectChanging = (e) => {
      if (e.target && e.target.isLaser) return;
      
      const updateLines = (node) => {
        if (node && node.isMindMapNode && node.mindMapId) {
          const matrix = node.calcTransformMatrix();
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
      
      const json = getSafeJson(initCanvas);
      broadcastState(json);
    };

    initCanvas.on('object:added', handleObjectModified);
    initCanvas.on('object:modified', handleObjectModified);
    initCanvas.on('object:removed', handleObjectModified);
    initCanvas.on('text:changed', handleObjectModified);
    initCanvas.on('object:moving', handleObjectChanging);
    initCanvas.on('object:scaling', handleObjectChanging);
    initCanvas.on('object:rotating', handleObjectChanging);
    initCanvas.on('path:created', (opt) => {
      const path = opt.path;
      if (toolRef.current === 'laser') {
        path.isLaser = true;
        path.set({
          stroke: colorRef.current,
          strokeWidth: 6,
          shadow: new fabric.Shadow({ color: colorRef.current, blur: 15 }),
          selectable: false,
          evented: false,
        });

        broadcastSafely('laser_draw', { path: path.path, color: colorRef.current, left: path.left, top: path.top })

        path.animate('opacity', 0, {
          duration: 2000,
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
      } else {
      }
    });

    initCanvas.on('selection:created', (e) => setActiveObjType(e.selected[0].type))
    initCanvas.on('selection:updated', (e) => setActiveObjType(e.selected[0].type))
    initCanvas.on('selection:cleared', () => setActiveObjType(null))

    let compassCenter = null;
    let compassTempLine = null;
    let compassTempCircle = null;
    let compassGroup = null; // Holds the visual realistic compass

    // Pan & Compass logic
    initCanvas.on('mouse:down', function(opt) {
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
      if (this.isDragging) {
        if (toolRef.current === 'pan') {
          // Calculate delta manually ? opt.e.movementX/Y is undefined on touch events
          const deltaX = opt.pointer.x - this.lastPosX;
          const deltaY = opt.pointer.y - this.lastPosY;
          const vpt = this.viewportTransform;
          vpt[4] += deltaX;
          vpt[5] += deltaY;
          this.setViewportTransform(vpt);
          this.requestRenderAll();
          syncBackgroundToViewport(vpt);
        }
        this.lastPosX = opt.pointer.x;
        this.lastPosY = opt.pointer.y;
      }
      
      if (toolRef.current === 'compass' && compassCenter) {
         let currentPoint = opt.absolutePointer;
         let radius = Math.sqrt(Math.pow(currentPoint.x - compassCenter.x, 2) + Math.pow(currentPoint.y - compassCenter.y, 2));
         
         if (compassTempLine) initCanvas.remove(compassTempLine);
         if (compassTempCircle) initCanvas.remove(compassTempCircle);
         if (compassGroup) initCanvas.remove(compassGroup);
         
         compassTempLine = new fabric.Line([compassCenter.x, compassCenter.y, currentPoint.x, currentPoint.y], {
             stroke: colorRef.current, strokeWidth: 1, strokeDashArray: [5, 5], selectable: false, evented: false
         });
         compassTempCircle = new fabric.Circle({
             left: compassCenter.x - radius, top: compassCenter.y - radius, radius: radius,
             fill: 'transparent', stroke: colorRef.current, strokeWidth: lineWidthRef.current,
             selectable: false, evented: false, opacity: 0.5
         });
         initCanvas.add(compassTempLine);
         initCanvas.add(compassTempCircle);
         
         // --- Drawing the realistic Compass ---
         if (radius > 5) {
             let cx = compassCenter.x;
             let cy = compassCenter.y;
             let px = currentPoint.x;
             let py = currentPoint.y;
             
             let mx = (cx + px) / 2;
             let my = (cy + py) / 2;
             
             let dx = px - cx;
             let dy = py - cy;
             let dist = Math.sqrt(dx*dx + dy*dy);
             
             let nx = -dy / dist;
             let ny = dx / dist;
             
             // Ensure the hinge is always "above" the center
             let height = Math.max(150, dist * 1.5); 
             if (ny > 0) { nx = -nx; ny = -ny; }
             
             let hx = mx + nx * height;
             let hy = my + ny * height;
             
             let leg1 = new fabric.Line([hx, hy, cx, cy], { stroke: '#94a3b8', strokeWidth: 8, strokeLinecap: 'round' });
             let leg2 = new fabric.Line([hx, hy, px, py], { stroke: '#94a3b8', strokeWidth: 8, strokeLinecap: 'round' });
             let hinge = new fabric.Circle({ left: hx, top: hy, radius: 12, fill: '#334155', originX: 'center', originY: 'center' });
             let needle = new fabric.Circle({ left: cx, top: cy, radius: 4, fill: '#ef4444', originX: 'center', originY: 'center' });
             
             let angle = Math.atan2(py - hy, px - hx) * 180 / Math.PI;
             let pencil = new fabric.Triangle({ 
                 left: px, top: py, width: 15, height: 30, fill: '#f59e0b', 
                 originX: 'center', originY: 'top', angle: angle - 90 
             });
             
             compassGroup = new fabric.Group([leg1, leg2, hinge, needle, pencil], { selectable: false, evented: false });
             initCanvas.add(compassGroup);
         }
         // ------------------------------------

         initCanvas.renderAll();
      }
    });
    initCanvas.on('mouse:up', function(opt) {
      if (toolRef.current === 'pan') {
        this.setViewportTransform(this.viewportTransform);
        this.isDragging = false;
        this.selection = true;
        broadcastViewport();
      }
      if (toolRef.current === 'compass' && compassCenter) {
         let currentPoint = opt.absolutePointer;
         let radius = Math.sqrt(Math.pow(currentPoint.x - compassCenter.x, 2) + Math.pow(currentPoint.y - compassCenter.y, 2));
         
         if (compassTempLine) initCanvas.remove(compassTempLine);
         if (compassTempCircle) initCanvas.remove(compassTempCircle);
         if (compassGroup) initCanvas.remove(compassGroup);
         
         if (radius > 5) {
             const finalCircle = new fabric.Circle({
                 left: compassCenter.x - radius, top: compassCenter.y - radius,
                 radius: radius, fill: 'transparent', stroke: colorRef.current, strokeWidth: lineWidthRef.current
             });
             initCanvas.add(finalCircle);
             handleObjectModified({ target: finalCircle });
         }
         
         compassCenter = null;
         compassTempLine = null;
         compassTempCircle = null;
         compassGroup = null;
         initCanvas.renderAll();
      }
    });

      initCanvas.on('mouse:dblclick', function(opt) {
        const obj = opt.target;
        if (!obj) return;
        if (obj.isFlashcard) {
          const isFront = obj.get('isFlipped');
          const newText = isFront ? obj.get('backText') : obj.get('frontText');
          const bgRect = obj.item(0);
          const txtObj = obj.item(1);
          obj.animate('scaleX', 0, {
            duration: 150,
            onChange: initCanvas.renderAll.bind(initCanvas),
            onComplete: () => {
              txtObj.set('text', newText);
              bgRect.set('fill', isFront ? '#f59e0b' : '#8b5cf6');
              obj.set('isFlipped', !isFront);
              obj.animate('scaleX', 1, {
                duration: 150,
                onChange: initCanvas.renderAll.bind(initCanvas),
                onComplete: () => {
                  saveHistory(initCanvas);
                }
              });
            }
          });
        } else if (obj.isMindMapNode) {
          const textObj = obj.getObjects().find(o => o.type === 'text' || o.type === 'textbox');
          const rectObj = obj.getObjects().find(o => o.type === 'rect');
          if (textObj) {
            const newText = window.prompt('تعديل النص:', textObj.text);
            if (newText !== null && newText.trim() !== '') {
              textObj.set('text', newText.trim());
              if (textObj.initDimensions) textObj.initDimensions();
              if (rectObj) {
                rectObj.set('height', Math.max(60, textObj.height + 20));
              }
              obj.addWithUpdate();
              initCanvas.requestRenderAll();
              saveHistory(initCanvas);
            }
          }
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
      broadcastViewport();
      syncBackgroundToViewport(initCanvas.viewportTransform);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Pinch-to-Zoom for touch devices (2-finger pinch)
    let lastPinchDist = null;
    const getPinchDist = (t1, t2) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };
    const onPinchStart = (e) => {
      if (e.touches.length === 2) {
        lastPinchDist = getPinchDist(e.touches[0], e.touches[1]);
        e.preventDefault();
      }
    };
    const onPinchMove = (e) => {
      if (e.touches.length === 2 && lastPinchDist !== null) {
        const newDist = getPinchDist(e.touches[0], e.touches[1]);
        const scale = newDist / lastPinchDist;
        lastPinchDist = newDist;
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const rect = initCanvas.lowerCanvasEl.getBoundingClientRect();
        const pt = { x: midX - rect.left, y: midY - rect.top };
        let zoom = initCanvas.getZoom() * scale;
        if (zoom > 5) zoom = 5;
        if (zoom < 0.1) zoom = 0.1;
        initCanvas.zoomToPoint(pt, zoom);
        broadcastViewport();
        syncBackgroundToViewport(initCanvas.viewportTransform);
        e.preventDefault();
      }
    };
    const onPinchEnd = (e) => { if (e.touches.length < 2) lastPinchDist = null; };
    const tcEl = initCanvas.upperCanvasEl || initCanvas.lowerCanvasEl;
    tcEl.addEventListener('touchstart', onPinchStart, { passive: false });
    tcEl.addEventListener('touchmove', onPinchMove, { passive: false });
    tcEl.addEventListener('touchend', onPinchEnd, { passive: true });

    return () => {
      if (typeof window !== 'undefined' && window.__activeFabricCanvas === initCanvas) {
        window.__activeFabricCanvas = null;
        window.__broadcastViewport = null;
      }
      initCanvas.dispose();
      tcEl.removeEventListener('touchstart', onPinchStart);
      tcEl.removeEventListener('touchmove', onPinchMove);
      tcEl.removeEventListener('touchend', onPinchEnd);
    }
  }, [])

  // Responsive Canvas with Virtual Resolution
  useEffect(() => {
    const handleResize = () => {
      if (fabricCanvasRef.current && outerContainerRef.current && innerWrapperRef.current) {
        const wrapper = outerContainerRef.current;
        const VIRTUAL_WIDTH = 1000;
        
        // Toggle between Portrait (3:4) and Landscape (16:9)
        const teacherAspectRatio = isLandscape ? 0.5625 : 1.3333;
        aspectRatioRef.current = teacherAspectRatio;
        
        const VIRTUAL_HEIGHT = 1000 * teacherAspectRatio;
        
        // Scale to fit wrapper perfectly
        const scale = Math.min(wrapper.clientWidth / VIRTUAL_WIDTH, wrapper.clientHeight / VIRTUAL_HEIGHT);
        baseScaleRef.current = scale;
        setUiScale(scale);
        
        // Update Actual Canvas Size
        fabricCanvasRef.current.setDimensions({
          width: VIRTUAL_WIDTH * scale,
          height: VIRTUAL_HEIGHT * scale
        });
        
        // Restore logical view but scaled
        const vpt = fabricCanvasRef.current.viewportTransform;
        vpt[0] = scale;
        vpt[3] = scale;
        vpt[4] = 0;
        vpt[5] = 0;
        fabricCanvasRef.current.setViewportTransform(vpt);
        syncBackgroundToViewport(vpt);
        
        innerWrapperRef.current.style.width = `${VIRTUAL_WIDTH * scale}px`;
        innerWrapperRef.current.style.height = `${VIRTUAL_HEIGHT * scale}px`;
        
        fabricCanvasRef.current.renderAll();
        fabricCanvasRef.current.calcOffset();
        
        // Broadcast new aspect ratio to students
        broadcastSafely('board_config', {
          bgType: bgTypeRef.current,
          bgLetter: bgLetterRef.current,
          aspectRatio: teacherAspectRatio
        });
      }
    }
    const observer = new ResizeObserver(() => {
      handleResize();
    });
    
    if (outerContainerRef.current) {
      observer.observe(outerContainerRef.current);
    }
    
    return () => {
      if (outerContainerRef.current) {
        observer.unobserve(outerContainerRef.current);
      }
      observer.disconnect();
    }
  }, [channel, isLandscape])



  useEffect(() => {
    if (!canvas) return

    canvas.off('mouse:down', handleEraserDown);
    canvas.off('mouse:move', handleEraserMove);

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
      sprayBrush.width = lineWidth * 3
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
      canvas.defaultCursor = 'url(https://cdn-icons-png.flaticon.com/32/1880/1880471.png) 16 16, crosshair'
      canvas.selection = false
      canvas.on('mouse:down', handleEraserDown);
      canvas.on('mouse:move', handleEraserMove);
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

  const handleEraserDown = (opt) => {
    if (toolRef.current === 'eraser') {
      const target = canvas.findTarget(opt.e, false);
      if (target && !target.isLaser) {
        canvas.remove(target);
      }
    }
  };

  const handleEraserMove = (opt) => {
    const isMouseDown = (opt.e.buttons === 1) || (opt.e.touches && opt.e.touches.length > 0);
    if (isMouseDown && toolRef.current === 'eraser') {
      const target = canvas.findTarget(opt.e, false);
      if (target && !target.isLaser) {
        canvas.remove(target);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
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
            broadcastSafely('canvas_update', JSON.stringify(canvas.toJSON(['id', 'selectable', 'isLocked'])))
          }
        }
        };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [canvas, tool]);

  const handleSelectSticker = (url) => {
    if (!canvas) return;
    fabric.Image.fromURL(url, (img) => {
      img.set({
        ...getCenter(),
        originX: 'center',
        originY: 'center',
        selectable: true,
        evented: true,
      });
      img.scaleToWidth(150);
      canvas.add(img);
      setTool('select');
      saveHistory(canvas);
      broadcastSafely('canvas_update', JSON.stringify(canvas.toJSON(['id', 'selectable', 'isLocked'])));
    });
  }
  const handleGenerateMotivationalCards = (phrases) => {
    if (!canvas || phrases.length === 0) return;
    const cardsPerRow = 5;
    const cardWidth = 120;
    const cardHeight = 120;
    const spacingX = 20;
    const spacingY = 20;
    const startX = 50;
    const startY = 100;
    
    phrases.forEach((phrase, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      const x = startX + col * (cardWidth + spacingX);
      const y = startY + row * (cardHeight + spacingY);

      const flashcard = new fabric.FlashcardText(`${index + 1}`, {
        left: x,
        top: y,
        fontSize: 40,
        fill: '#ffffff',
        fontFamily: 'Tajawal',
        textAlign: 'center',
        width: cardWidth,
        isFlashcard: true, backgroundColor: 'rgba(0,0,0,0.01)',
        frontText: `${index + 1}`,
        backText: phrase,
        isShowingFront: true,
        cardColor: '#f59e0b',
        backColor: '#10b981',
      });
      canvas.add(flashcard);
    });
    canvas.requestRenderAll();
    saveState();
  };

  const handleSmartImport = (text) => {
    if (!canvas) return;
    const lines = text.split('\n').filter(l => l.trim() !== '');
    let offset = 0;
    lines.forEach((line) => {
      const parts = line.split('-');
      const front = parts[0] ? parts[0].trim() : 'السؤال';
      const back = parts[1] ? parts[1].trim() : 'الإجابة';
      addFlashcard(front, back, offset);
      offset += 30; // Stack them slightly offset
    });
  };

  const createMindMapNode = (x, y, textStr, color = '#3b82f6', theme = 'classic') => {
    const textFill = (theme === 'outline' || theme === 'minimal') ? color : '#fff';
    const MindMapClass = (window.fabric && window.fabric.MindMapText) || fabric.MindMapText;
    const node = new MindMapClass(textStr, {
      left: x, top: y, width: 150, fontSize: 20, fill: textFill, fontFamily: 'Tajawal', fontWeight: 'bold', textAlign: 'center',
      originX: 'center', originY: 'center', selectable: true, evented: true, nodeColor: color, theme: theme
    });
    return node;
  };

  const handleMindMapImport = (text, theme) => {
    if (!canvas) return;
      let rawLines = text.split('\n').filter(l => l.trim() !== '');
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
      const stack = [];
    
    // Layout variables
      const startX = 800; 
      let currentY = 150;
      const levelY = {};
      const colors = ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
      
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
        
        const xPos = startX - (level * 250);
        
        if (!levelY[level]) levelY[level] = 150;
        let minY = 150;
        for (let i = 0; i <= level; i++) {
            if (levelY[i] > minY) minY = levelY[i];
        }
        
        const yPos = minY;
        levelY[level] = yPos + 100;
        for (let i = level + 1; i < 10; i++) {
            levelY[i] = levelY[level];
        }
        
        const color = colors[level % colors.length];
      const node = createMindMapNode(xPos, yPos, content, color, theme);
      canvas.add(node);
      
      const currentObj = { level, node };
      
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      
      if (stack.length > 0) {
        const parentNode = stack[stack.length - 1].node;
        const lineObj = new fabric.Line([parentNode.left, parentNode.top, node.left, node.top], {
          stroke: '#94a3b8', strokeWidth: 3, selectable: false, evented: false, strokeDashArray: [5, 5],
        isMindMapLine: true, mindMapFromId: parentNode.mindMapId, mindMapToId: node.mindMapId
      });
        parentNode._connectedLines.push({ from: parentNode, to: node, line: lineObj });
        node._connectedLines.push({ from: parentNode, to: node, line: lineObj });
        canvas.add(lineObj);
        canvas.sendToBack(lineObj);
      }
      
      stack.push(currentObj);
    });
    
    canvas.renderAll();
    if (typeof broadcastSafely === 'function') broadcastSafely();
  };

  const addMindMapRoot = () => {
    if (!canvas) return;
    const center = getCenter();
    const root = createMindMapNode(center.left, center.top, 'فكرة رئيسية', '#1e293b');
    canvas.add(root);
    canvas.setActiveObject(root);
    setTool('select');
    broadcastSafely();
  };

  const addMindMapBranch = () => {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj || !activeObj.isMindMapNode) return;

    const child = createMindMapNode(activeObj.left + 200, activeObj.top + (Math.random() * 100 - 50), 'فكرة فرعية', '#3b82f6');
    const line = new fabric.Line([activeObj.left, activeObj.top, child.left, child.top], {
      stroke: '#94a3b8', strokeWidth: 3, selectable: false, evented: false, strokeDashArray: [5, 5],
        isMindMapLine: true, mindMapFromId: activeObj.mindMapId, mindMapToId: child.mindMapId
      });

    if(!activeObj._connectedLines) activeObj.set('_connectedLines', []);
    if(!child._connectedLines) child.set('_connectedLines', []);

    activeObj._connectedLines.push({ from: activeObj, to: child, line: line });
    child._connectedLines.push({ from: activeObj, to: child, line: line });

    canvas.add(line);
    canvas.add(child);
    canvas.sendToBack(line);
    canvas.setActiveObject(child);
    canvas.renderAll();
    emitUpdate();
  };

  const emitUpdate = () => {
    const currentCanvas = fabricCanvasRef.current || canvas;
    if (currentCanvas) {
      const json = getSafeJson(currentCanvas);
      broadcastState({ ...json, isIndependentMode: isIndependentModeRef.current });
    }
  };

  const undo = () => {
    if (historyIndexRef.current > 0 && canvas) {
      isHistoryUpdateRef.current = true;
      historyIndexRef.current -= 1;
      const currentVpt = canvas.viewportTransform ? canvas.viewportTransform.slice() : null;
      canvas.loadFromJSON(historyRef.current[historyIndexRef.current], () => {
        if (currentVpt) {
          canvas.setViewportTransform(currentVpt);
          syncBackgroundToViewport(currentVpt);
        }
        canvas.renderAll();
        isHistoryUpdateRef.current = false;
        updateUndoRedoState();
        emitUpdate();
      });
    }
  }

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1 && canvas) {
      isHistoryUpdateRef.current = true;
      historyIndexRef.current += 1;
      const currentVpt = canvas.viewportTransform ? canvas.viewportTransform.slice() : null;
      canvas.loadFromJSON(historyRef.current[historyIndexRef.current], () => {
        if (currentVpt) {
          canvas.setViewportTransform(currentVpt);
          syncBackgroundToViewport(currentVpt);
        }
        canvas.renderAll();
        isHistoryUpdateRef.current = false;
        updateUndoRedoState();
        emitUpdate();
      });
    }
  }

  const togglePresentationMode = async () => {
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
      emitUpdate();
    }
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

  // ========== Basic Shape & Text Insertion ==========
  const addText = () => {
    if (!canvas) return
    const text = new fabric.IText('اكتب هنا', {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fontFamily: 'Tajawal', fill: color, fontSize: 40, textAlign: 'right'
    })
    canvas.add(text)
    canvas.setActiveObject(text)
    setTool('select')
  }

  const addRect = () => {
    if (!canvas) return
    const rect = new fabric.Rect({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, width: 100, height: 100, fill: 'transparent', stroke: color, strokeWidth: lineWidth })
    canvas.add(rect); canvas.setActiveObject(rect); setTool('select')
  }

  const addCircle = () => {
    if (!canvas) return
    const circle = new fabric.Circle({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, radius: 50, fill: 'transparent', stroke: color, strokeWidth: lineWidth })
    canvas.add(circle); canvas.setActiveObject(circle); setTool('select')
  }

  const addTriangle = () => {
    if (!canvas) return
    const triangle = new fabric.Triangle({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, width: 100, height: 100, fill: 'transparent', stroke: color, strokeWidth: lineWidth })
    canvas.add(triangle); canvas.setActiveObject(triangle); setTool('select')
  }

  const addLine = () => {
    if (!canvas) return
    const line = new fabric.Line([50, 50, 200, 50], { ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, stroke: color, strokeWidth: lineWidth })
    canvas.add(line); canvas.setActiveObject(line); setTool('select')
  }

  const addArrow = () => {
    if (!canvas) return
    const arrowPath = new fabric.Path('M 0 0 L 100 0 L 90 -10 M 100 0 L 90 10', {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, stroke: color, strokeWidth: lineWidth, fill: 'transparent'
    })
    canvas.add(arrowPath); canvas.setActiveObject(arrowPath); setTool('select')
  }

  const addStickyNote = (noteColor) => {
    if (!canvas) return;
    const text = new fabric.Textbox('اكتب نصاً...', {
      ...getCenter(), width: 200, fontSize: 24, fontFamily: 'Tajawal', fill: '#1e293b', backgroundColor: noteColor, textAlign: 'center', originX: 'center', originY: 'center', shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.1)', blur: 8, offsetX: 2, offsetY: 2 })
    });
    canvas.add(text); canvas.setActiveObject(text); setTool('select'); setIsLibraryOpen(false);
  }

  // ========== Voice Typing ==========
  const stopVoiceTyping = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecordingVoice(false);
    setVoiceText('');
  };

  const addVoiceText = () => {
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
      fontFamily: 'Tajawal', fill: color, fontSize: 40, direction: 'rtl', textAlign: 'right'
    });
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    setTool('select');
    stopVoiceTyping();
  };

  // ========== Page Management ==========
  const addPage = () => {
    if (!canvas) return;
    const json = getSafeJson(canvas);
    const newPages = [...pages];
    newPages[currentPageIndex].json = json;
    
    const newPage = { id: Date.now(), json: null, assignedTo: null };
    newPages.push(newPage);
    
    setPages(newPages);
    setCurrentPageIndex(newPages.length - 1);
    
    canvas.clear();
    historyRef.current = [];
    historyIndexRef.current = -1;
    saveHistory(canvas);
    emitUpdate();
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

  // Expose Page Navigation APIs globally for AR Gesture Controller
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__whiteboardNextPage = () => {
        if (currentPageIndex < pages.length - 1) {
          switchPage(currentPageIndex + 1);
        }
      };
      window.__whiteboardPrevPage = () => {
        if (currentPageIndex > 0) {
          switchPage(currentPageIndex - 1);
        }
      };
      window.__whiteboardAddPage = () => {
        addPage();
      };
      window.__whiteboardSwitchPage = (idx) => {
        switchPage(idx);
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.__whiteboardNextPage = null;
        window.__whiteboardPrevPage = null;
        window.__whiteboardAddPage = null;
        window.__whiteboardSwitchPage = null;
      }
    };
  }, [currentPageIndex, pages, canvas]);

  // ========== Save / Load Project ==========
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
        alert('حدث خطأ أثناء تحميل المشروع.');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  }

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
    broadcastSafely();
  };

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
    if (checkIfHasBackground()) {
      setShowExportPdfModal(true);
    } else {
      executeExportPdf(false);
    }
  };

  const executeExportPdf = async (includeBackground = true) => {
    if (!canvas) return;

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
          delete pageData.backgroundImage;
          pageData.background = '#ffffff';
          tempCanvas.clear();
          await new Promise(resolve => tempCanvas.loadFromJSON(pageData, resolve));
          tempCanvas.backgroundImage = null;
          tempCanvas.backgroundColor = '#ffffff';
        } else {
          tempCanvas.clear();
          await new Promise(resolve => tempCanvas.loadFromJSON(pageData, resolve));

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

        const finalW = canvas.width || 1280;
        const finalH = canvas.height || 720;

        tempCanvas.setWidth(finalW);
        tempCanvas.setHeight(finalH);
        tempCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
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
      if (doc) doc.save(`سبورة_البث_المباشر_${bgSuffix}_${todayStr}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF in Live:', err);
      alert('حدث خطأ أثناء تصدير PDF. حاول مرة أخرى.');
    } finally {
      setIsExportingPdf(false);
      setExportProgressText('');
    }
  };

  const addMathEquation = () => {
    if (!canvas || !mathInput.trim()) return;
    const cleanColor = (color || '#1e293b').replace('#', '');
    const url = `https://latex.codecogs.com/png.image?\dpi{300}${encodeURIComponent(`\color[HTML]{${cleanColor}} ${mathInput.trim()}`)}`;
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
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
  };

  const handleVideoUpload = (e) => {
    if (!canvas || !e.target.files[0]) return
    const file = e.target.files[0]
    const url = URL.createObjectURL(file)
    const videoEl = document.createElement('video')
    videoEl.src = url
    videoEl.playsInline = true
    
    videoEl.addEventListener('loadeddata', () => {
      videoEl.width = videoEl.videoWidth
      videoEl.height = videoEl.videoHeight
      const videoObj = new fabric.Image(videoEl, {
        left: 100,
        top: 100,
        objectCaching: false,
      })
      if (videoEl.videoWidth > 600) {
        videoObj.scaleToWidth(600)
      }
      canvas.add(videoObj)
      canvas.setActiveObject(videoObj)
      setTool('select')
      
      const renderLoop = () => {
        if (canvas) canvas.renderAll()
        fabric.util.requestAnimFrame(renderLoop)
      }
      fabric.util.requestAnimFrame(renderLoop)
    })
    
    e.target.value = null
  }

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
  }

  const playActiveVideo = () => {
    const obj = canvas?.getActiveObject()
    if (obj && obj.getElement && obj.getElement().tagName === 'VIDEO') {
      obj.getElement().play()
    }
  }

  const pauseActiveVideo = () => {
    const obj = canvas?.getActiveObject()
    if (obj && obj.getElement && obj.getElement().tagName === 'VIDEO') {
      obj.getElement().pause()
    }
  }

  const toggleMuteActiveVideo = () => {
    const obj = canvas?.getActiveObject()
    if (obj && obj.getElement && obj.getElement().tagName === 'VIDEO') {
      obj.getElement().muted = !obj.getElement().muted
      // force update to reflect mute state (optional, but good for UI if we had a state)
    }
  }

  const triggerCheer = async (type = 'fireworks', isRemote = false) => {
    if (!isRemote) {
      broadcastSafely('cheer', { type });
    }
    const canvasObj = fabricCanvasRef.current || canvas;
    if (!canvasObj) return;

    try {
      const { playCheerSound } = await import('../../utils/soundEffects');
      playCheerSound(type);
    } catch(e) { console.error('Audio load failed:', e); }

    try {
      const { renderCheerOnCanvas } = await import('../../utils/cheerEffects');
      renderCheerOnCanvas(canvasObj, type);
    } catch(e) { console.error('Cheer render failed:', e); }
  }

  const processPdfPages = async (typedarray, start, end) => {
    setPdfModalData(null);
    setIsPdfLoading(true);
    
    try {
      const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
      
      const newPages = [...pages];
      if (canvas) {
        newPages[currentPageIndex].json = canvas.toJSON();
      }

      for (let i = start; i <= end; i++) {
         const page = await pdf.getPage(i);
         const viewport = page.getViewport({ scale: 2.0 });
         
         const tempCanvas = document.createElement('canvas');
         const context = tempCanvas.getContext('2d');
         tempCanvas.height = viewport.height;
         tempCanvas.width = viewport.width;
         
         await page.render({ canvasContext: context, viewport }).promise;
         const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.9);
         
         if (i === start) {
            await new Promise(resolve => {
               fabric.Image.fromURL(dataUrl, (img) => {
                  const canvasAspect = canvas.width / canvas.height;
                  const imgAspect = img.width / img.height;
                  let scaleFactor = canvasAspect >= imgAspect ? canvas.height / img.height : canvas.width / img.width;
                  img.set({ scaleX: scaleFactor, scaleY: scaleFactor, originX: 'center', originY: 'center', left: canvas.width / 2, top: canvas.height / 2 });
                  canvas.setBackgroundImage(img, () => {
                     canvas.renderAll();
                     resolve();
                  });
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
            newPages.push({ id: Date.now() + i, json: jsonStr, assignedTo: null });
         }
      }
      setPages(newPages);
      emitUpdate();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء معالجة ملف PDF');
    } finally {
      setIsPdfLoading(false);
    }
  }

  const handleBackgroundUpload = async (e) => {
    if (!canvas || !e.target.files[0]) return;
    const file = e.target.files[0];
    
    if (file.type === 'application/pdf') {
       if (!window.pdfjsLib) {
          alert('مكتبة PDF لم تحمل بعد. يرجى الانتظار قليلاً.');
          return;
       }
       const reader = new FileReader();
       reader.onload = async (f) => {
          const typedarray = new Uint8Array(f.target.result);
          const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
          setPdfModalData({ typedarray, numPages: pdf.numPages });
          setPdfStartPage(1);
          setPdfEndPage(pdf.numPages);
       };
       reader.readAsArrayBuffer(file);
       e.target.value = null;
    } else {
       const reader = new FileReader();
       reader.onload = (f) => {
         const imgObj = new Image();
         imgObj.onload = () => {
            const tmpCanvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = imgObj.width;
            let height = imgObj.height;
            if (width > height) {
              if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
              if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }
            tmpCanvas.width = width;
            tmpCanvas.height = height;
            const ctx = tmpCanvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(imgObj, 0, 0, width, height);
            const data = tmpCanvas.toDataURL('image/jpeg', 0.6);
            
            fabric.Image.fromURL(data, (img) => {
               const canvasAspect = canvas.width / canvas.height;
               const imgAspect = img.width / img.height;
               let scaleFactor = canvasAspect >= imgAspect ? canvas.height / img.height : canvas.width / img.width;
               img.set({ scaleX: scaleFactor, scaleY: scaleFactor, originX: 'center', originY: 'center', left: canvas.width / 2, top: canvas.height / 2 });
               canvas.setBackgroundImage(img, () => {
                  canvas.renderAll();
                  emitUpdate();
               });
            });
         };
         imgObj.src = f.target.result;
       };
       reader.readAsDataURL(file);
       e.target.value = null;
    }
  }

  const handleImageUpload = (e) => {
    if (!canvas || !e.target.files[0]) return
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (f) => {
      const imgObj = new Image();
      imgObj.onload = () => {
         const tmpCanvas = document.createElement('canvas');
         const MAX_WIDTH = 1200;
         const MAX_HEIGHT = 1200;
         let width = imgObj.width;
         let height = imgObj.height;
         if (width > height) {
           if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
         } else {
           if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
         }
         tmpCanvas.width = width;
         tmpCanvas.height = height;
         const ctx = tmpCanvas.getContext('2d');
         ctx.fillStyle = '#ffffff';
         ctx.fillRect(0, 0, width, height);
         ctx.drawImage(imgObj, 0, 0, width, height);
         const data = tmpCanvas.toDataURL('image/jpeg', 0.6);
         
         fabric.Image.fromURL(data, (img) => {
           img.scaleToWidth(400)
           img.set({ left: 100, top: 100 })
           canvas.add(img)
           canvas.setActiveObject(img)
           setTool('select')
         })
      };
      imgObj.src = f.target.result;
    }
    reader.readAsDataURL(file)
    e.target.value = null
  }

  const colors = [
    { name: 'أسود', hex: '#0f172a' }, { name: 'أزرق', hex: '#2563eb' },
    { name: 'أحمر', hex: '#dc2626' }, { name: 'أخضر', hex: '#16a34a' },
    { name: 'برتقالي', hex: '#ea580c' }, { name: 'بنفسجي', hex: '#9333ea' },
  ]

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.triggerRemoteCheer = (type) => triggerCheer(type, true);
    }
  }, [canvas]);

  const isVideo = canvas && canvas.getActiveObject() && canvas.getActiveObject().getElement && canvas.getActiveObject().getElement().tagName === 'VIDEO';

  const syncBackgroundToViewport = (vpt) => {
    if (!innerWrapperRef.current) return;
    
    // Sync Notebook/Grid CSS
    if (bgTypeRef.current === 'notebook') {
      innerWrapperRef.current.style.backgroundSize = `100% ${40 * vpt[0]}px`;
      innerWrapperRef.current.style.backgroundPosition = `0px ${vpt[5]}px`;
    } else if (bgTypeRef.current === 'grid') {
      innerWrapperRef.current.style.backgroundSize = `${40 * vpt[0]}px ${40 * vpt[0]}px`;
      innerWrapperRef.current.style.backgroundPosition = `${vpt[4]}px ${vpt[5]}px`;
    } else {
      innerWrapperRef.current.style.backgroundSize = '';
      innerWrapperRef.current.style.backgroundPosition = '';
    }
    
    // Sync bgLetter div
    const bgLetterDiv = document.getElementById('bg-letter-overlay');
    if (bgLetterDiv && aspectRatioRef.current) {
      const logicalX = 500;
      const logicalY = 1000 * aspectRatioRef.current / 2;
      const physicalX = logicalX * vpt[0] + vpt[4];
      const physicalY = logicalY * vpt[0] + vpt[5];
      
      bgLetterDiv.style.left = `${physicalX}px`;
      bgLetterDiv.style.top = `${physicalY}px`;
      bgLetterDiv.style.transform = `translate(-50%, -50%) scale(${vpt[0]})`;
    }
  };

  useEffect(() => { 
    bgTypeRef.current = bgType; 
    bgLetterRef.current = bgLetter; 
    if (fabricCanvasRef.current) syncBackgroundToViewport(fabricCanvasRef.current.viewportTransform);
  }, [bgType, bgLetter]);
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
    (typeof isReadyPathwayActive !== 'undefined' && isReadyPathwayActive);

  return (
    <div 
      className={`${styles.container} ${effectiveMobile ? styles.forceMobile : ''} ${!showMobileBottomToolbars ? styles.mobileToolbarsHidden : ''}`} 
      data-mobile-category={mobileActiveCategory}
      ref={outerContainerRef} 
      style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: '#e2e8f0', touchAction: 'none' }}
    >
      <style>{`
        .canvas-container, .upper-canvas, .lower-canvas {
          touch-action: none !important;
        }
      `}</style>
      {/* Canvas Area */}
      <div ref={innerWrapperRef} className={`${styles.canvasWrapper} ${styles[bgType]}`} style={{ position: 'relative', boxShadow: '0 0 25px rgba(0,0,0,0.15)', overflow: 'hidden', touchAction: 'none' }}>
        {customBgImage && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${customBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, zIndex: 0, pointerEvents: 'none' }} />}
          {bgType === 'letters' && (
          <div id="bg-letter-overlay" style={{
             position: 'absolute',
             left: `${500 * uiScale}px`,
             top: `${(1000 * aspectRatioRef.current / 2) * uiScale}px`,
             fontSize: '350px', color: '#e2e8f0', fontFamily: 'Arial, Tajawal, sans-serif',
             userSelect: 'none', pointerEvents: 'none', zIndex: 0,
             transform: `translate(-50%, -50%) scale(${uiScale})`,
             transformOrigin: 'center center'
          }}>
            {bgLetter}
          </div>
        )}
        
        {iframes.map(iframe => (
          <div key={iframe.id} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 'min(90vw, 600px)', height: 'min(60vh, 400px)', maxWidth: '100%', zIndex: 50, pointerEvents: 'auto', background: 'white', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '10px', background: '#e2e8f0', borderRadius: '10px 10px 0 0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
              <span>{iframe.title || 'نموذج 3D'}</span>
              <button onClick={() => setIframes(prev => prev.filter(i => i.id !== iframe.id))} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <iframe src={iframe.url} style={{ width: '100%', height: 'calc(100% - 40px)', border: 'none', borderRadius: '0 0 10px 10px' }} />
          </div>
        ))}
        <canvas ref={canvasRef} className={styles.canvas} style={{ position: 'relative', zIndex: 1 }} />
        {pdfModalData && (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
        <h3 style={{ color: '#1e293b', fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>استخراج صفحات الـ PDF</h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>هذا الملف يحتوي على <strong style={{color:'#3b82f6'}}>{pdfModalData.numPages}</strong> صفحة.</p>
        
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '25px', direction: 'rtl' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>من صفحة</label>
            <input type="number" min="1" max={pdfModalData.numPages} value={pdfStartPage} onChange={e => setPdfStartPage(e.target.value)} style={{ width: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', outline: 'none' }} />
          </div>
          <span style={{ alignSelf: 'flex-end', paddingBottom: '10px', color: '#94a3b8', fontWeight: 'bold' }}>-</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>إلى صفحة</label>
            <input type="number" min="1" max={pdfModalData.numPages} value={pdfEndPage} onChange={e => setPdfEndPage(e.target.value)} style={{ width: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', outline: 'none' }} />
          </div>
        </div>

        {(parseInt(pdfEndPage) || 0) - (parseInt(pdfStartPage) || 0) > 20 && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '20px' }}>
            <strong>تنبيه:</strong> اختيار أكثر من 20 صفحة قد يستغرق وقتاً طويلاً ويستهلك ذاكرة المتصفح.
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={() => setPdfModalData(null)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
          <button onClick={() => { let s = parseInt(pdfStartPage) || 1; let e = parseInt(pdfEndPage) || s; if (s < 1) s = 1; if (e < s) e = s; if (e > pdfModalData.numPages) e = pdfModalData.numPages; processPdfPages(pdfModalData.typedarray, s, e); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)' }}>بدء الشرح</button>
        </div>
      </div>
    </div>
  )}
  {isPdfLoading && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#3b82f6', fontWeight: 'bold' }}>
                <Sparkles size={40} className="animate-spin" style={{ marginBottom: '10px' }} />
                <span>جاري تحميل PDF...</span>
             </div>
          </div>
        )}
      </div>

            {!isPresenting && !isAnyFullScreenOverlayActive && (
        <>
          {/* Mobile Category Tab Switcher Bar */}
          {effectiveMobile && showMobileBottomToolbars && (
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
          <div style={{ position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <button onClick={flipActiveFlashcard} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Tajawal' }}>
              قلب البطاقة (Flip)
            </button>
          </div>
        )}
        {/* Left Toolbar: Core Tools */}
      <div className={`${styles.glassPanel} ${styles.leftToolbar}`} style={{ display: isAnyFullScreenOverlayActive ? 'none' : '' }}>
         <button className={`${styles.toolBtn} ${tool === 'select' ? styles.activeTool : ''}`} onClick={() => setTool('select')}><MousePointer2 size={20} /></button>
         <button className={`${styles.toolBtn} ${tool === 'pan' ? styles.activeTool : ''}`} onClick={() => setTool('pan')}><Hand size={20} /></button>
         <button className={`${styles.toolBtn} ${tool === 'pen' ? styles.activeTool : ''}`} onClick={() => setTool('pen')}><Pen size={20} /></button>
         <button className={`${styles.toolBtn} ${tool === 'eraser' ? styles.activeTool : ''}`} onClick={() => setTool('eraser')}><Eraser size={20} /></button>
         {true && (
           <button
             className={`${styles.toolBtn} ${isARActive ? styles.activeTool : ''}`}
             onClick={() => setIsARActive(prev => !prev)}
             style={{
               background: isARActive ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' : 'rgba(139, 92, 246, 0.12)',
               color: isARActive ? '#ffffff' : '#8b5cf6',
               border: `1.5px solid ${isARActive ? '#8b5cf6' : 'rgba(139, 92, 246, 0.35)'}`,
               boxShadow: isARActive ? '0 0 10px rgba(139, 92, 246, 0.5)' : 'none',
               cursor: 'pointer'
             }}
             title="تفعيل/إغلاق وضع الواقع المعزز وتتبع اليد في الهواء (خاص بالإدارة) 🖐️"
           >
             <Sparkles size={18} />
           </button>
         )}
         <div style={{ width: '1px', height: '22px', background: '#cbd5e1', margin: '0 4px', alignSelf: 'center' }} className={styles.mobileOnly} />
         <button className={`${styles.toolBtn} ${styles.mobileOnly}`} onClick={undo} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.4 }} title="تراجع"><Undo2 size={18} /></button>
         <button className={`${styles.toolBtn} ${styles.mobileOnly}`} onClick={redo} disabled={!canRedo} style={{ opacity: canRedo ? 1 : 0.4 }} title="إعادة"><Redo2 size={18} /></button>
         <button className={`${styles.toolBtn} ${styles.mobileOnly}`} onClick={() => { if (canvas) { canvas.clear(); saveHistory(canvas); broadcastSafely('board-cleared', {}); } }} style={{ color: '#ef4444' }} title="مسح اللوحة"><Trash2 size={18} /></button>
         
         {!isLeftToolbarExpanded && !effectiveMobile ? (
            <button className={styles.toolBtn} onClick={() => setIsLeftToolbarExpanded(true)} style={{ color: '#0ea5e9' }} title="توسيع باقي الأدوات">
               <ChevronDown size={20} />
            </button>
         ) : (
            <>
               <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0', width: '100%' }} />
               <button className={`${styles.toolBtn} ${tool === 'calligraphy' ? styles.activeTool : ''}`} onClick={() => setTool('calligraphy')}><span role="img" aria-label="قلم خط">🖋️</span></button>
               <button className={`${styles.toolBtn} ${tool === 'spray' ? styles.activeTool : ''}`} onClick={() => setTool('spray')}><span role="img" aria-label="بخاخ">💨</span></button>
               <button className={`${styles.toolBtn} ${tool === 'highlighter' ? styles.activeTool : ''}`} onClick={() => setTool('highlighter')}><Highlighter size={20} /></button>
               <button className={`${styles.toolBtn} ${tool === 'laser' ? styles.activeTool : ''}`} onClick={() => setTool('laser')}><Crosshair size={20} /></button>
               <button className={`${styles.toolBtn} ${tool === 'magic' ? styles.activeTool : ''}`} onClick={() => setTool('magic')}><Sparkles size={20} /></button>
               
               <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0', width: '100%' }} />
               {!effectiveMobile && (
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
          <button 
            type="button"
            onClick={() => { 
              activeTextObject.set('fontWeight', activeTextObject.fontWeight === 'bold' ? 'normal' : 'bold'); 
              canvas.requestRenderAll(); 
              setTextUpdateTick(prev => prev + 1); 
              saveHistory(canvas); 
              broadcastSafely(); 
            }} 
            style={{ 
              background: activeTextObject.fontWeight === 'bold' ? '#e2e8f0' : 'transparent', 
              border: 'none', 
              padding: effectiveMobile ? '4px 6px' : '5px 8px', 
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
            <Bold size={effectiveMobile ? 16 : 18} />
          </button>

          <button 
            type="button"
            onClick={() => { 
              activeTextObject.set('fontStyle', activeTextObject.fontStyle === 'italic' ? 'normal' : 'italic'); 
              canvas.requestRenderAll(); 
              setTextUpdateTick(prev => prev + 1); 
              saveHistory(canvas); 
              broadcastSafely(); 
            }} 
            style={{ 
              background: activeTextObject.fontStyle === 'italic' ? '#e2e8f0' : 'transparent', 
              border: 'none', 
              padding: effectiveMobile ? '4px 6px' : '5px 8px', 
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
            <Italic size={effectiveMobile ? 16 : 18} />
          </button>

          <button 
            type="button"
            onClick={() => { 
              activeTextObject.set('underline', !activeTextObject.underline); 
              canvas.requestRenderAll(); 
              setTextUpdateTick(prev => prev + 1); 
              saveHistory(canvas); 
              broadcastSafely(); 
            }} 
            style={{ 
              background: activeTextObject.underline ? '#e2e8f0' : 'transparent', 
              border: 'none', 
              padding: effectiveMobile ? '4px 6px' : '5px 8px', 
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
            <Underline size={effectiveMobile ? 16 : 18} />
          </button>
          
          <div style={{ width: '1px', height: '18px', background: '#cbd5e1', flexShrink: 0 }} />
          
          <button 
            type="button"
            onClick={() => { 
              activeTextObject.set('textAlign', 'right'); 
              canvas.requestRenderAll(); 
              setTextUpdateTick(prev => prev + 1); 
              saveHistory(canvas); 
              broadcastSafely(); 
            }} 
            style={{ 
              background: activeTextObject.textAlign === 'right' ? '#e2e8f0' : 'transparent', 
              border: 'none', 
              padding: effectiveMobile ? '4px 6px' : '5px 8px', 
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
            <AlignRight size={effectiveMobile ? 16 : 18} />
          </button>

          <button 
            type="button"
            onClick={() => { 
              activeTextObject.set('textAlign', 'center'); 
              canvas.requestRenderAll(); 
              setTextUpdateTick(prev => prev + 1); 
              saveHistory(canvas); 
            }} 
            style={{ 
              background: activeTextObject.textAlign === 'center' ? '#e2e8f0' : 'transparent', 
              border: 'none', 
              padding: effectiveMobile ? '4px 6px' : '5px 8px', 
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
            <AlignCenter size={effectiveMobile ? 16 : 18} />
          </button>

          <button 
            type="button"
            onClick={() => { 
              activeTextObject.set('textAlign', 'left'); 
              canvas.requestRenderAll(); 
              setTextUpdateTick(prev => prev + 1); 
              saveHistory(canvas); 
            }} 
            style={{ 
              background: activeTextObject.textAlign === 'left' ? '#e2e8f0' : 'transparent', 
              border: 'none', 
              padding: effectiveMobile ? '4px 6px' : '5px 8px', 
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
            <AlignLeft size={effectiveMobile ? 16 : 18} />
          </button>

          <div style={{ width: '1px', height: '18px', background: '#cbd5e1', flexShrink: 0 }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <span style={{ fontSize: effectiveMobile ? '11px' : '12px', color: '#64748b', fontWeight: 600 }}>A</span>
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
                  saveHistory(canvas); 
                }
              }} 
              style={{ 
                width: effectiveMobile ? '44px' : '52px', 
                padding: effectiveMobile ? '3px 4px' : '4px 6px', 
                border: '1px solid #cbd5e1', 
                borderRadius: '6px', 
                textAlign: 'center',
                fontSize: effectiveMobile ? '12px' : '13px',
                fontWeight: 600,
                color: '#1e293b',
                background: '#f8fafc'
              }} 
              title="حجم الخط" 
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
              padding: effectiveMobile ? '4px 6px' : '5px 8px', 
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
            <Trash2 size={effectiveMobile ? 16 : 18} />
          </button>
        </div>
      )}

      {/* Bottom Toolbar: Insertion */}
      <div className={`${styles.glassPanel} ${styles.bottomToolbar}`} style={{ display: isAnyFullScreenOverlayActive ? 'none' : '' }}>
         {!isBottomToolbarExpanded && !effectiveMobile ? (
            <button className={styles.toolBtn} onClick={() => setIsBottomToolbarExpanded(true)} style={{ color: '#0ea5e9' }} title="توسيع الأشكال والوسائط">
               <ChevronUp size={20} />
            </button>
         ) : (
            <>
               <button className={styles.toolBtn} onClick={() => setIsLibraryOpen(!isLibraryOpen)}><StickyNote size={20} /></button>
               <button className={styles.toolBtn} onClick={addText}><Type size={20} /></button>
           <button className={styles.toolBtn} onClick={addVoiceText} style={{ color: '#ec4899' }}><Mic size={20} /></button>
               <button className={styles.toolBtn} onClick={addRect}><Square size={20} /></button>
               <button className={styles.toolBtn} onClick={addCircle}><Circle size={20} /></button>
               <button className={styles.toolBtn} onClick={addTriangle}><Triangle size={20} /></button>
               <button className={styles.toolBtn} onClick={addLine}><Minus size={20} /></button>
               <button className={styles.toolBtn} onClick={addArrow}><ArrowRight size={20} /></button>
               
               <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px' }} />
               
               <label className={styles.toolBtn} title="إدراج صورة">
                  <ImageIcon size={20} />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
               </label>
               <label className={styles.toolBtn} title="رفع كتاب مدرسي أو ملزمة (PDF أو صور)" style={{ color: '#dc2626' }}>
                  <FileText size={20} />
                  <input type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={handleBackgroundUpload} />
               </label>
               <label className={styles.toolBtn} title="إدراج فيديو">
                  <Video size={20} />
                  <input type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoUpload} />
               </label>
               <button className={styles.toolBtn} onClick={addYoutubeVideo} style={{ color: '#ef4444' }} title="إدراج فيديو يوتيوب">
                  <Video size={20} />
               </button>
               
               <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px' }} />
               {!effectiveMobile && (
                 <button className={styles.toolBtn} onClick={() => setIsBottomToolbarExpanded(false)} style={{ color: '#ef4444' }} title="طي الأشكال والوسائط">
                    <ChevronDown size={20} />
                 </button>
               )}
            </>
         )}
      </div>

      {/* Top Left Toolbar: Pages & Save */}
      <div className={`${styles.glassPanel} ${styles.topLeftToolbar}`} style={{ display: isAnyFullScreenOverlayActive ? 'none' : '' }}>
         {!isTopLeftToolbarExpanded && !effectiveMobile ? (
            <button className={styles.toolBtn} onClick={() => setIsTopLeftToolbarExpanded(true)} style={{ color: '#0ea5e9' }} title="توسيع الصفحات والإجراءات">
               <ChevronLeft size={20} />
            </button>
         ) : (
            <>
               {!effectiveMobile && (
                 <button className={styles.toolBtn} onClick={() => setIsTopLeftToolbarExpanded(false)} style={{ color: '#ef4444', marginRight: '-5px' }} title="طي شريط الصفحات والإجراءات">
                    <ChevronRight size={20} />
                 </button>
               )}
               <a href="/teacher-assistant" onClick={(e) => { if (!window.confirm('هل تريد إنهاء والعودة للوحة التحكم؟')) e.preventDefault(); }} className={styles.toolBtn} style={{ color: '#ef4444' }} title="خروج"><X size={20} /></a>
               <button className={styles.toolBtn} onClick={() => setShowGuideModal(true)} style={{ color: '#10b981' }} title="دليل المعلم"><HelpCircle size={20} /></button>
         
         <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px', alignSelf: 'center' }} />
         <button className={styles.toolBtn} onClick={() => switchPage(currentPageIndex - 1)} disabled={currentPageIndex === 0} title="الصفحة السابقة"><ChevronRight size={20}/></button>
         <span style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: '14px', margin: '0 5px' }}>{currentPageIndex + 1} / {pages.length}</span>
          <button className={styles.toolBtn} onClick={() => switchPage(currentPageIndex + 1)} disabled={currentPageIndex === pages.length - 1} title="الصفحة التالية"><ChevronLeft size={20}/></button>
          <button className={styles.toolBtn} onClick={addPage} style={{ color: '#2563eb' }} title="إضافة صفحة"><Plus size={20} /></button>
          <button 
            className={styles.toolBtn} 
            onClick={() => setShowMobileBottomToolbars(prev => !prev)} 
            style={{ color: showMobileBottomToolbars ? '#0284c7' : '#10b981' }}
            title={showMobileBottomToolbars ? "مساحة رسم كاملة (إخفاء كافة الأدوات)" : "إظهار كافة الأدوات"}
          >
            {showMobileBottomToolbars ? <EyeOff size={18} /> : <Pen size={18} />}
          </button>
           <button className={styles.toolBtn} onClick={() => setIsStickersLibraryOpen(true)} style={{ color: '#f59e0b' }} title="استيكرات"><Sparkles size={20} /></button>
           {true && (
             <button 
               className={styles.toolBtn} 
               onClick={() => setIsARActive(prev => !prev)} 
               style={{ 
                 background: isARActive ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' : 'rgba(139, 92, 246, 0.12)', 
                 color: isARActive ? '#ffffff' : '#8b5cf6', 
                 border: `1.5px solid ${isARActive ? '#8b5cf6' : 'rgba(139, 92, 246, 0.35)'}`,
                 boxShadow: isARActive ? '0 0 10px rgba(139, 92, 246, 0.5)' : 'none',
                 gap: '4px',
                 padding: '0 8px',
                 width: 'auto',
                 borderRadius: '8px'
               }} 
               title="تفعيل/إغلاق وضع الواقع المعزز وتتبع اليد في الهواء (خاص بالإدارة) 🖐️"
             >
               <Sparkles size={16} />
               <span className={styles.mobileHidden} style={{ fontSize: '11px', fontWeight: 'bold' }}>AR 🖐️</span>
             </button>
           )}

         <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
           <button 
             className={styles.toolBtn} 
             onClick={() => setShowCheers(!showCheers)}
             style={{ background: showCheers ? '#f1f5f9' : 'transparent', padding: '0 8px', width: 'auto', gap: '4px' }}
           >
             <span role="img" aria-label="احتفال">🎉</span>
             {!showCheers && <span className={styles.mobileHidden} style={{ fontSize: '12px', fontWeight: 'bold' }}>تشجيع</span>}
           </button>
           
           {showCheers && (
             <>
               <button className={styles.toolBtn} onClick={() => { triggerCheer('fireworks'); setShowCheers(false); }}><span role="img" aria-label="احتفال">🎉</span></button>
               <button className={styles.toolBtn} onClick={() => { triggerCheer('applause'); setShowCheers(false); }}><span role="img" aria-label="تصفيق">👏</span></button>
               <button className={styles.toolBtn} onClick={() => { triggerCheer('magic'); setShowCheers(false); }}><span role="img" aria-label="سحري">✨</span></button>
               <button className={styles.toolBtn} onClick={() => { triggerCheer('victory'); setShowCheers(false); }}><span role="img" aria-label="انتصار">✌️</span></button>
             </>
           )}
         </div>

         <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px', alignSelf: 'center' }} />
         
         {/* Independent Mode Toggle */}
         <button 
           className={styles.toolBtn} 
           onClick={() => setIsIndependentMode(!isIndependentMode)} 
           style={{ 
             color: isIndependentMode ? '#ffffff' : '#f59e0b',
             backgroundColor: isIndependentMode ? '#f59e0b' : 'transparent',
             border: isIndependentMode ? 'none' : '1px solid #f59e0b',
             width: 'auto',
             padding: '0 4px',
             fontSize: '11px',
             fontWeight: 'bold',
             display: 'flex',
             alignItems: 'center',
             gap: '2px',
             marginRight: '2px'
           }}
         >
           {isIndependentMode ? (
             <><span role="img" aria-label="تصفيق">👏</span><span className={styles.mobileHidden}>تنشيط</span></>
           ) : (
             <><span role="img" aria-label="تصفيق">👏</span><span className={styles.mobileHidden}>إيقاف التنشيط</span></>
           )}
           
         </button>

         <div style={{ width: '1px', height: '16px', background: '#cbd5e1', margin: '0 4px', alignSelf: 'center' }} />
         
         {/* Page Assignment Dropdown */}
         <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
           <Users size={12} color={pages[currentPageIndex]?.assignedTo ? '#166534' : '#64748b'} style={{ position: 'absolute', right: '5px', pointerEvents: 'none' }} />
           <select 
             value={pages[currentPageIndex]?.assignedTo?.id || 'none'}
             onChange={(e) => {
               const val = e.target.value;
               if (val === 'none') assignPageToStudent('none', '');
               else {
                 const st = students.find(s => (s.id || s.deviceId) === val);
                 if (st) assignPageToStudent(val, st.name || 'طالب');
               }
             }}
             style={{
               padding: '2px 4px 2px 20px', // space for the absolute icon
               borderRadius: '6px',
               border: 'none',
               fontSize: '11px',
               background: pages[currentPageIndex]?.assignedTo ? '#dcfce7' : 'transparent',
               color: pages[currentPageIndex]?.assignedTo ? '#166534' : '#475569',
               fontWeight: 'bold',
               outline: 'none',
               cursor: 'pointer',
               maxWidth: '65px',
               textOverflow: 'ellipsis',
               appearance: 'none',
               WebkitAppearance: 'none'
             }}
           >
             <option value="none">الكل</option>
             {students.filter(s => !s.isTeacher).map(st => (
               <option key={st.id || st.deviceId} value={st.id || st.deviceId}>
                 {st.name?.split(' ')[0] || 'طالب'}
               </option>
             ))}
           </select>
         </div>
         
         <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px', alignSelf: 'center' }} />
         <button className={styles.toolBtn} onClick={undo} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.5 }}><Undo2 size={20} /></button>
         <button className={styles.toolBtn} onClick={redo} disabled={!canRedo} style={{ opacity: canRedo ? 1 : 0.5 }}><Redo2 size={20} /></button>
         
         <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px', alignSelf: 'center' }} />
         <button className={styles.toolBtn} onClick={exportToPDF} style={{ color: '#dc2626' }} title="تصدير PDF"><FileText size={20} /></button>
         <label className={styles.toolBtn} title="استيراد / رفع ملف PDF أو كتاب مدرسي" style={{ color: '#2563eb' }}>
            <Upload size={20} />
            <input type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={handleBackgroundUpload} />
         </label>
         <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px', alignSelf: 'center' }} />
         <button className={styles.toolBtn} onClick={saveProject}><Download size={20} /></button>
         <label className={styles.toolBtn}>
            <FolderOpen size={20} />
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={loadProject} />
         </label>
            </>
         )}
      </div>

      {/* Top Right Toolbar: Properties */}
      <div className={`${styles.glassPanel} ${styles.topRightToolbar}`} style={{ display: isAnyFullScreenOverlayActive ? 'none' : '' }}>
         {!isTopRightToolbarExpanded && !effectiveMobile ? (
            <button className={styles.toolBtn} onClick={() => setIsTopRightToolbarExpanded(true)} style={{ color: '#0ea5e9', alignSelf: 'center' }} title="توسيع الألوان والإعدادات">
               <Settings2 size={20} />
               <ChevronRight size={16} style={{ marginRight: '-5px' }} />
            </button>
         ) : (
            <>
               {!effectiveMobile && (
                 <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '5px' }}>
                    <button className={styles.toolBtn} onClick={() => setIsTopRightToolbarExpanded(false)} style={{ color: '#ef4444', height: '24px', padding: '0 5px' }} title="طي الألوان والإعدادات">
                       <ChevronLeft size={20} />
                    </button>
                 </div>
               )}
         {isVideo && (
            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
               <button className={styles.actionBtn} onClick={playActiveVideo} style={{ background: '#e0f2fe', color: '#0369a1', flex: 1, padding: '5px' }}>تشغيل</button>
               <button className={styles.actionBtn} onClick={pauseActiveVideo} style={{ background: '#fee2e2', color: '#991b1b', flex: 1, padding: '5px' }}>إيقاف مؤقت</button>
               <button className={styles.actionBtn} onClick={toggleMuteActiveVideo} style={{ padding: '5px' }} title="كتم / صوت">كتم الصوت</button>
            </div>
         )}
         <div className={styles.colorsGroup} style={{ justifyContent: 'center' }}>
            {colors.map(c => (
              <button key={c.hex} className={`${styles.colorBtn} ${color === c.hex ? styles.activeColor : ''}`} style={{ backgroundColor: c.hex }} onClick={() => setColor(c.hex)} title={c.name} />
            ))}
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span className={styles.mobileHidden} style={{ fontSize: '12px', color: '#64748b' }}>السُمك:</span>
            <input type="range" min="1" max="30" value={lineWidth} onChange={(e) => handleLineWidthChange(e.target.value)} className={styles.rangeInput} style={{ flex: 1 }} />
         </div>
         
         <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
             <button onClick={() => {if(canvas){ canvas.clear(); canvas.backgroundColor='transparent'; saveHistory(canvas); }}} className={styles.actionBtn} style={{ background: '#fee2e2', color: '#ef4444', flex: 1, padding: '5px' }} title="حذف الكل"><Trash2 size={16} /><span className={styles.mobileHidden}> حذف الكل</span></button>
             <button className={styles.actionBtn} onClick={() => setIsSettingsOpen(!isSettingsOpen)} style={{ flex: 1, padding: '5px' }} title="تعديل"><Settings2 size={16} /><span className={styles.mobileHidden}> إعدادات</span></button>
         </div>
         
         {isSettingsOpen && (
            <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <div className={styles.settingGroup}>
                 <label>أبعاد وشكل السبورة:</label>
                 <div style={{ display: 'flex', gap: '5px' }}>
                   <button onClick={() => setIsLandscape(true)} style={{ flex: 1, padding: '4px', background: isLandscape ? '#059669' : '#e2e8f0', color: isLandscape ? '#fff' : '#475569', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>🖥️ شاشة عريضة (16:9)</button>
                   <button onClick={() => setIsLandscape(false)} style={{ flex: 1, padding: '4px', background: !isLandscape ? '#059669' : '#e2e8f0', color: !isLandscape ? '#fff' : '#475569', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>📄 طولي (3:4)</button>
                 </div>
               </div>
               <div className={styles.settingGroup}>
                <label>نوع الخلفية:</label>
                <select className={styles.selectInput} value={bgType} onChange={(e) => setBgType(e.target.value)}>
                    <option value="blank">سبورة بيضاء</option>
                    <option value="ruled">مسطرة</option>
                    <option value="grid">مربعات</option>
                    <option value="letters">سبورة الحروف</option>
                  </select>
              </div>
              
              {bgType === 'letters' && (
                <div className={styles.settingGroup}>
                  <label>الحرف / الرمز:</label>
                  <select className={styles.selectInput} value={bgLetter} onChange={(e) => setBgLetter(e.target.value)}>
                    {['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي', 'Aa', 'Bb', 'Cc', 'Dd', 'Ee', '1', '2', '3'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              )}
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
              <h4 style={{ margin: 0, color: '#334155' }}>مكتبة الأشكال</h4>
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
             <h5>أدوات تفاعلية</h5>
             <div className={styles.libraryGrid}>
                <div className={styles.stickyNoteItem} style={{ background: '#fef08a' }} onClick={() => addStickyNote('#fef08a')} title="تعديل"></div>
                <div className={styles.stickyNoteItem} style={{ background: '#a7f3d0' }} onClick={() => addStickyNote('#a7f3d0')} title="تعديل"></div>
                <div className={styles.stickyNoteItem} style={{ background: '#bfdbfe' }} onClick={() => addStickyNote('#bfdbfe')} title="تعديل"></div>
                <div className={styles.stickyNoteItem} style={{ background: '#fbcfe8' }} onClick={() => addStickyNote('#fbcfe8')} title="تعديل"></div>
             </div>
           </div>

           <div className={styles.librarySection}>
             <h5>رسومات متحركة</h5>
             <div className={styles.libraryGrid}>
                <button className={styles.libraryItem} onClick={addMicroscope} title="تعديل">مجهر<span>مجهر</span></button>
                <button className={styles.libraryItem} onClick={addFlask} title="تعديل">⚗️<span>دورق</span></button>
                <button className={styles.libraryItem} onClick={addBook} title="تعديل">كتاب<span>كتاب</span></button>
                <button className={styles.libraryItem} onClick={() => { addBeatingHeart(); setIsLibraryOpen(false); }} title="تعديل">إيقاف<span>مسح الكل</span></button>
                <button className={styles.libraryItem} onClick={() => { addWarningTriangle(); setIsLibraryOpen(false); }} title="تعديل">كتاب<span>كتاب</span></button>
                <button className={styles.libraryItem} onClick={() => { addRotatingHourglass(); setIsLibraryOpen(false); }} title="تعديل">⏳<span>ساعة رملية</span></button>
                <button className={styles.libraryItem} onClick={() => { addSyncArrows(); setIsLibraryOpen(false); }} title="تعديل">مجهر<span>مجهر</span></button>
                <button className={styles.libraryItem} onClick={() => { addShakingRocket(); setIsLibraryOpen(false); }} title="تعديل">كتاب<span>كتاب</span></button>
                <button className={styles.libraryItem} onClick={() => { addLoadingSpinner(); setIsLibraryOpen(false); }} title="تعديل">تحميل<span>تحميل</span></button>
                <button className={styles.libraryItem} onClick={() => { addSwingingPendulum(); setIsLibraryOpen(false); }} title="تعديل">كتاب<span>كتاب</span></button>
                <button className={styles.libraryItem} onClick={() => { addBouncingBall(); setIsLibraryOpen(false); }} title="تعديل">إيقاف<span>مسح الكل</span></button>
             </div>
           </div>
        </div>
      )}

          </>
        )}

      {isPresenting && (
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '15px', background: 'rgba(0,0,0,0.8)', padding: '10px 20px', borderRadius: '50px', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
           <button onClick={() => switchPage(currentPageIndex - 1)} disabled={currentPageIndex === 0} style={{ background: 'none', border: 'none', color: 'white', cursor: currentPageIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentPageIndex === 0 ? 0.5 : 1 }}><ChevronRight size={24} /></button>
           <span style={{ color: 'white', alignSelf: 'center', fontWeight: 'bold' }}>{currentPageIndex + 1} / {pages.length}</span>
           <button onClick={() => switchPage(currentPageIndex + 1)} disabled={currentPageIndex === pages.length - 1} style={{ background: 'none', border: 'none', color: 'white', cursor: currentPageIndex === pages.length - 1 ? 'not-allowed' : 'pointer', opacity: currentPageIndex === pages.length - 1 ? 0.5 : 1 }}><ChevronLeft size={24} /></button>
           
           <div style={{ width: '1px', background: '#475569', margin: '0 5px' }}></div>
           
           <button onClick={() => setTool(tool === 'laser' ? 'select' : 'laser')} style={{ background: tool === 'laser' ? '#ef4444' : 'transparent', border: 'none', color: 'white', padding: '5px', borderRadius: '50%', cursor: 'pointer' }} title="تعديل"><Sparkles size={24} /></button>
           <button onClick={togglePresentationMode} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', padding: '5px', cursor: 'pointer' }} title="تعديل"><X size={24} /></button>
        </div>
      )}

      <SpotlightOverlay isActive={isSpotlightActive} shape={spotlightShape} isLocked={isSpotlightLocked} />
      <TimerOverlay isActive={isTimerActive} onClose={() => setIsTimerActive(false)} />
      <BlindOverlay isActive={isBlindActive} onClose={() => setIsBlindActive(false)} onStateChange={(s) => broadcastSafely('tool_state_update', { tool: 'blind', state: s })} />
      <MagnifierOverlay isActive={isMagnifierActive} onClose={() => setIsMagnifierActive(false)} onStateChange={(s) => broadcastSafely('tool_state_update', { tool: 'magnifier', state: s })} />
      <QuranPlayerOverlay isActive={isQuranPlayerActive} onClose={() => { setIsQuranPlayerActive(false); broadcastSafely('tool_state_update', { tool: 'quran', state: false }); }} channel={channel} isTeacher={true} />
      <InteractiveMushafOverlay isActive={isInteractiveMushafActive} onClose={() => setIsInteractiveMushafActive(false)} channel={channel} isTeacher={true} />
      {isCalculatorActive && <Calculator onClose={() => setIsCalculatorActive(false)} />}
      <GeometryToolsModal isActive={isGeometryToolsModalOpen} onClose={() => setIsGeometryToolsModalOpen(false)} onSelectTool={addGeometryTool} isPremium={true} setShowPremiumAlert={() => {}} />
      <MathQuizOverlay channel={channel} isActive={isMathQuizActive} onClose={() => setIsMathQuizActive(false)} />

      {/* Advanced Overlays Bottom Right */}
      <div className={styles.advancedToolsContainer} style={{ display: isAnyFullScreenOverlayActive ? 'none' : '' }}>
        {!isAdvancedToolsExpanded && !effectiveMobile ? (
          <button className={styles.toolBtn} onClick={() => setIsAdvancedToolsExpanded(true)} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#0ea5e9' }} title="المزيد من الأدوات">
            <ChevronLeft size={20} />
          </button>
        ) : (
          <>
            <button onClick={() => setIsSpotlightActive(!isSpotlightActive)} className={`${styles.toolBtn} ${isSpotlightActive ? styles.activeTool : ''}`} style={{ background: isSpotlightActive ? '#e0e7ff' : 'white', border: '1px solid #cbd5e1' }}><Crosshair size={20} color={isSpotlightActive ? '#4338ca' : '#475569'} /></button>
            <button onClick={() => setIsTimerActive(!isTimerActive)} className={`${styles.toolBtn} ${isTimerActive ? styles.activeTool : ""}`} style={{ background: isTimerActive ? '#e0e7ff' : 'white', border: '1px solid #cbd5e1' }} title="المؤقت"><Timer size={20} color={isTimerActive ? '#4338ca' : '#475569'} /></button>
            <button onClick={() => setIsCalculatorActive(!isCalculatorActive)} className={`${styles.toolBtn} ${isCalculatorActive ? styles.activeTool : ''}`} style={{ background: isCalculatorActive ? '#e0e7ff' : 'white', border: '1px solid #cbd5e1' }}><CalculatorIcon size={20} color={isCalculatorActive ? '#4338ca' : '#475569'} /></button>
            <button onClick={() => setIsBlindActive(!isBlindActive)} className={`${styles.toolBtn} ${isBlindActive ? styles.activeTool : ""}`} style={{ background: isBlindActive ? '#e0e7ff' : 'white', border: '1px solid #cbd5e1' }} title="إخفاء الشاشة"><EyeOff size={20} color={isBlindActive ? '#4338ca' : '#475569'} /></button>
            <button onClick={() => setIsGeometryToolsModalOpen(true)} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#f59e0b' }} title="أدوات هندسية"><Ruler size={20} /></button>
            <button onClick={() => setIsMathQuizActive(true)} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#10b981' }} title="اختبار رياضيات"><FileQuestion size={20} /></button>
            <button onClick={() => { const s = !isQuranPlayerActive; setIsQuranPlayerActive(s); broadcastSafely('tool_state_update', { tool: 'quran', state: s }); }} className={`${styles.toolBtn} ${isQuranPlayerActive ? styles.activeTool : ''}`} style={{ background: isQuranPlayerActive ? '#e0e7ff' : 'white', border: '1px solid #cbd5e1' }}><Volume2 size={20} /></button>
            <button onClick={() => setIsInteractiveMushafActive(true)} className={`${styles.toolBtn} ${isInteractiveMushafActive ? styles.activeTool : ''}`} style={{ background: isInteractiveMushafActive ? '#dcfce7' : 'white', border: '1px solid #cbd5e1', color: '#059669' }} title="مصحف التجويد التفاعلي"><BookOpen size={20} /></button>
            <button onClick={() => setIsMathModalOpen(true)} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#ec4899', fontSize: '18px', fontWeight: 'bold' }}>π</button>
            <button onClick={() => setIsMathEquationModalOpen(true)} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#8b5cf6' }} title="معادلات رياضية"><Sigma size={20} /></button>
            <button className={styles.toolBtn} onClick={() => setIsScienceLibraryOpen(true)} style={{ color: '#059669' }} title="مكتبة التجارب العلمية"><FlaskConical size={20} /></button>
            <button onClick={() => setIsMotivationalModalOpen(true)} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#f59e0b', fontSize: '18px', fontWeight: 'bold' }}>🌟</button>
            <button onClick={() => setIsPollModalOpen(true)} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#3b82f6', fontSize: '18px', fontWeight: 'bold' }}>📊</button>
            <button onClick={addMindMapRoot} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#0ea5e9' }} title="خريطة ذهنية"><Network size={20} /></button>
              <button onClick={() => setIsMindMapImportOpen(true)} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#3b82f6' }} title="توليد خريطة بالذكاء الاصطناعي"><Brain size={20} /></button>
            <button onClick={addMindMapBranch} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#3b82f6' }} title="إضافة فرع"><GitBranch size={20} /></button>
            <button onClick={addTicTacToeGrid} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#16a34a' }} title="لعبة XO"><Hash size={20} /></button>
            {!effectiveMobile && (
              <button className={styles.toolBtn} onClick={() => setIsAdvancedToolsExpanded(false)} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#ef4444' }} title="طي الأدوات المتقدمة">
                <ChevronRight size={20} />
              </button>
            )}
          </>
        )}
      </div>
            <SmartImportModal isActive={isSmartImportModalOpen} onClose={() => setIsSmartImportModalOpen(false)} onImport={handleSmartImport} />
        <MindMapImportModal isAdmin={isAdmin} isActive={isMindMapImportOpen} onClose={() => setIsMindMapImportOpen(false)} onImport={handleMindMapImport} />
        <FlashcardModal isAdmin={isAdmin} isActive={isFlashcardModalOpen} onClose={() => setIsFlashcardModalOpen(false)} onAdd={(f, b) => addFlashcard(f, b)} />
        <MotivationalCardsModal isActive={isMotivationalModalOpen} onClose={() => setIsMotivationalModalOpen(false)} onGenerate={handleGenerateMotivationalCards} />
        <MathEquationModal isActive={isMathEquationModalOpen} onClose={() => setIsMathEquationModalOpen(false)} canvas={canvas} color={color} />
        <SmartGraphModal isActive={isSmartGraphModalOpen} onClose={() => setIsSmartGraphModalOpen(false)} canvas={canvas} color={color} />
        <HangmanOverlay channel={channel} isActive={isHangmanActive} onClose={() => { setIsHangmanActive(false); broadcastSafely('tool_state_update', { tool: 'hangman', state: false }); }} />
        <QuizShowOverlay channel={channel} isActive={isQuizShowActive} onClose={() => { setIsQuizShowActive(false); broadcastSafely('tool_state_update', { tool: 'quizshow', state: false }); }} />
        <WordSearchOverlay channel={channel} isActive={isWordSearchActive} onClose={() => { setIsWordSearchActive(false); broadcastSafely('tool_state_update', { tool: 'wordsearch', state: false }); }} />
      
          <BackgroundsLibraryModal isActive={isBackgroundsLibraryOpen} onClose={() => setIsBackgroundsLibraryOpen(false)} onSelectBackground={(url) => { setCustomBgImage(url); if(url) setBgType('blank'); }} isPremium={true} setShowPremiumAlert={() => {}} />
          <StickersLibraryModal isActive={isStickersLibraryOpen} onClose={() => setIsStickersLibraryOpen(false)} onSelectSticker={handleSelectSticker} isPremium={true} setShowPremiumAlert={() => {}} />
          <ScienceLibraryModal isActive={isScienceLibraryOpen} onClose={() => setIsScienceLibraryOpen(false)} onSelectModel={(url, name) => setIframes([...iframes, { id: Date.now(), url, title: name, x: Math.max(10, window.innerWidth/2 - 300), y: Math.max(10, window.innerHeight/2 - 200) }])} isPremium={true} setShowPremiumAlert={() => {}} />
          <QuranOrderGameOverlay channel={channel} isActive={isQuranGameActive} onClose={() => setIsQuranGameActive(false)} />
          <WordBuilderOverlay channel={channel} isActive={isWordBuilderActive} onClose={() => setIsWordBuilderActive(false)} />
          <PeriodicTableOverlay channel={channel} isActive={isPeriodicTableActive} onClose={() => setIsPeriodicTableActive(false)} />
          <ReadyPathwayOverlay channel={channel} isActive={isReadyPathwayActive} onClose={() => setIsReadyPathwayActive(false)} />
          <MemoryGameOverlay channel={channel} isActive={isMemoryGameActive} onClose={() => setIsMemoryGameActive(false)} />
          <LiveRewardsModal isActive={isRewardsModalOpen} onClose={() => setIsRewardsModalOpen(false)} students={students} onAward={(studentId, type) => broadcastSafely('student_reward', { studentId, type })} />
      
      {/* Games Modal for Live Teacher */}
      {showGamesModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative'
          }}>
            <button onClick={() => setShowGamesModal(false)} style={{
              position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none',
              cursor: 'pointer', color: '#64748b'
            }}><X size={24} /></button>
            <h3 style={{ color: '#0f5132', marginBottom: '20px', fontSize: '1.5rem', textAlign: 'center', fontFamily: 'Tajawal' }}>
              🎮 الألعاب التعليمية التفاعلية
            </h3>
            <p style={{ textAlign: 'center', color: '#475569', marginBottom: '20px', fontFamily: 'Tajawal' }}>
              اختر اللعبة المناسبة لدرسك. سيتم إطلاق اللعبة مباشرة على شاشات الطلاب.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
               <button onClick={() => { setIsHangmanActive(true); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }}>
                  <span style={{ fontSize: '2.5rem' }}>🔤</span>
                  
                </button>
               <button onClick={() => { setIsQuizShowActive(true); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }}>
                  <span style={{ fontSize: '2.5rem' }}>❓</span>
                  
                  </button>
                  <button onClick={() => { setIsWordSearchActive(true); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }}>
                    <span style={{ fontSize: '2.5rem' }}>🔍</span>
                    
                  </button>
                  <button onClick={() => { setIsMemoryGameActive(true); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }}>
                    <span style={{ fontSize: '2.5rem' }}>🧠</span>
                    
                  </button>
                  <button onClick={() => { setIsWordBuilderActive(true); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }}>
                    <span style={{ fontSize: '2.5rem' }}>🧩</span>
                    
                  </button>
                  <button onClick={() => { setIsQuranGameActive(true); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }} title="ترتيب آيات القرآن">
                    <span style={{ fontSize: '2.5rem' }}>📖</span>
                  </button>
                  <button onClick={() => { setIframes(prev => [...prev, { id: Date.now(), url: '/kids-corner/blending-rocks', title: 'صخور الفونكس', x: Math.max(10, window.innerWidth/2 - 350), y: Math.max(10, window.innerHeight/2 - 250) }]); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }} title="تكسير الصخور (الفونكس)">
                    <span style={{ fontSize: '2.5rem' }}>🪨</span>
                  </button>
                  <button onClick={() => { setIframes(prev => [...prev, { id: Date.now(), url: '/kids-corner/car-blending', title: 'سباق سيارة الكلمات', x: Math.max(10, window.innerWidth/2 - 350), y: Math.max(10, window.innerHeight/2 - 250) }]); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }} title="سباق سيارة دمج الكلمات">
                    <span style={{ fontSize: '2.5rem' }}>🏎️</span>
                  </button>
                  <button onClick={() => { setIframes(prev => [...prev, { id: Date.now(), url: '/kids-corner/quran-words', title: 'ترتيب كلمات الآية', x: Math.max(10, window.innerWidth/2 - 350), y: Math.max(10, window.innerHeight/2 - 250) }]); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }} title="ترتيب كلمات الآية القرآنية">
                    <span style={{ fontSize: '2.5rem' }}>🌿</span>
                  </button>
                  <button onClick={() => { setIframes(prev => [...prev, { id: Date.now(), url: '/kids-corner/claw-machine', title: 'مخلب صيد الحروف', x: Math.max(10, window.innerWidth/2 - 350), y: Math.max(10, window.innerHeight/2 - 250) }]); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }} title="مخلب صيد الحروف">
                    <span style={{ fontSize: '2.5rem' }}>🕹️</span>
                  </button>
                  <button onClick={() => { setIsInteractiveMushafActive(true); setShowGamesModal(false); }} className={styles.toolBtn} style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '15px' }} title="مصحف التجويد التفاعلي والتظليل">
                    <span style={{ fontSize: '2.5rem' }}>📑</span>
                  </button>
            </div>
          </div>
        </div>
      )}
      <LivePollTeacher isActive={isPollModalOpen} onClose={() => setIsPollModalOpen(false)} channel={channel} students={students} />
      {youtubeVideos.map(video => (
        <DraggableVideo 
          key={video.id} 
          video={video} 
          onClose={() => setYoutubeVideos(prev => prev.filter(v => v.id !== video.id))} 
        />
      ))}

      <TeacherGuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} />
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


























































