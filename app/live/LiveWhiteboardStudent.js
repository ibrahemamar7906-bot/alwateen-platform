'use client'

import { useRef, useState, useEffect } from 'react'
import { fabric } from 'fabric'
import { Pen, MousePointer2, Eraser, Highlighter, Square, Circle, Triangle, Minus, ArrowRight, Type, Image as ImageIcon, Video, StickyNote, Undo2, Redo2, Download, Trash2, FolderOpen, Save, Settings2, Maximize, X, ChevronRight, ChevronLeft, Hand, Crosshair, Sparkles } from 'lucide-react'
import styles from '../teacher-assistant/whiteboard/page.module.css'
import SpotlightOverlay from '../teacher-assistant/whiteboard/SpotlightOverlay'
import TimerOverlay from '../teacher-assistant/whiteboard/TimerOverlay'
import BlindOverlay from '../teacher-assistant/whiteboard/BlindOverlay'
import QuranPlayerOverlay from '../teacher-assistant/whiteboard/QuranPlayerOverlay'
import MagnifierOverlay from '../teacher-assistant/whiteboard/MagnifierOverlay'
import MathQuizOverlay from '../teacher-assistant/whiteboard/MathQuizOverlay'
import HangmanOverlay from '../teacher-assistant/whiteboard/HangmanOverlay'
import QuizShowOverlay from '../teacher-assistant/whiteboard/QuizShowOverlay'
import WordSearchOverlay from '../teacher-assistant/whiteboard/WordSearchOverlay'
import QuranOrderGameOverlay from '../teacher-assistant/whiteboard/QuranOrderGameOverlay'
import WordBuilderOverlay from '../teacher-assistant/whiteboard/WordBuilderOverlay'
import PeriodicTableOverlay from '../teacher-assistant/whiteboard/PeriodicTableOverlay'
import ReadyPathwayOverlay from '../teacher-assistant/whiteboard/ReadyPathwayOverlay'
import MemoryGameOverlay from '../teacher-assistant/whiteboard/MemoryGameOverlay'

const DraggableVideo = ({ video, onClose, hasControl }) => {
  const [pos, setPos] = useState({ x: video.x, y: video.y });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    if (!hasControl) return;
    setIsDragging(true);
    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    });
    e.target.setPointerCapture(e.pointerId);
  }

  const handlePointerMove = (e) => {
    if (isDragging && hasControl) {
      setPos({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    }
  }

  const handlePointerUp = (e) => {
    if (!hasControl) return;
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  }

  return (
    <div style={{
      position: 'absolute', left: pos.x, top: pos.y, width: 400, height: 300,
      background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
      cursor: hasControl ? 'move' : 'default', touchAction: 'none', zIndex: 100,
      display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #cbd5e1'
    }}>
      {hasControl && (
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '-15px', right: '-15px', background: 'red', color: 'white', borderRadius: '50%', border: 'none', width: '30px', height: '30px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={16} />
        </button>
      )}
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          background: '#ef4444', color: '#fff', padding: '8px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', touchAction: 'none'
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>?? ����� ������ {hasControl ? '(���� �������)' : ''}</span>
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

export default function LiveWhiteboardStudent({ channel, hasControl, studentName, studentId, isMobile = false }) {
  const canvasRef = useRef(null)
  const outerContainerRef = useRef(null)
  const innerWrapperRef = useRef(null)
  const baseScaleRef = useRef(1)
  const broadcastTimeoutRef = useRef(null)
  const [uiScale, setUiScale] = useState(1)
  const [canvas, setCanvas] = useState(null)
  const fabricCanvasRef = useRef(null)
  
  const channelRef = useRef(channel)
  const hasControlRef = useRef(hasControl)
  
  useEffect(() => { channelRef.current = channel }, [channel])
  useEffect(() => { hasControlRef.current = hasControl }, [hasControl])
  
  const broadcastSafely = (event, payload, retries = 10) => {
    if (!channelRef.current || (!hasControlRef.current && !isStudentLocallyInControlRef.current)) return
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
    if (!channelRef.current || channelRef.current.state !== 'joined' || !isStudentLocallyInControlRef.current) return;
    if (broadcastTimeoutRef.current) clearTimeout(broadcastTimeoutRef.current);
    broadcastTimeoutRef.current = setTimeout(() => {
      if (isIndependentModeRef.current && lockedPageIndexRef.current !== null) {
        broadcastSafely('student_fabric_state', { pageIndex: currentPageIndexRef.current, state: payloadObj });
      } else {
        // Use a dedicated event so teacher can listen without creating a broadcast loop
        broadcastSafely('student_control_draw', payloadObj);
      }
    }, 150);
  };
  
  // Tool States
  const [tool, setTool] = useState('pen')
  const [isHandRaised, setIsHandRaised] = useState(false) // select, pen, highlighter, eraser, laser, pan
  const [color, setColor] = useState('#0f172a')
  const [lineWidth, setLineWidth] = useState(5)
  const [bgType, setBgType] = useState('blank') // blank, ruled, grid, letters
  const [bgLetter, setBgLetter] = useState('أ')
  const [activeObjType, setActiveObjType] = useState(null)

  // Multiple Pages & Project States
  const [pages, setPages] = useState([{ id: 1, json: null }])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [activeAssignment, setActiveAssignment] = useState(null)
  const [showAssignmentToast, setShowAssignmentToast] = useState(false)
  const [isIndependentMode, setIsIndependentMode] = useState(false)
  const [lockedPageIndex, setLockedPageIndex] = useState(null)
  
  const currentPageIndexRef = useRef(currentPageIndex);
  const activeAssignmentRef = useRef(activeAssignment);
  const isIndependentModeRef = useRef(isIndependentMode);
  const lockedPageIndexRef = useRef(lockedPageIndex);

  useEffect(() => { currentPageIndexRef.current = currentPageIndex; }, [currentPageIndex]);
  useEffect(() => { activeAssignmentRef.current = activeAssignment; }, [activeAssignment]);
  
  useEffect(() => {
    if (activeAssignment && activeAssignment.id === studentId) {
      setShowAssignmentToast(true);
      const timer = setTimeout(() => setShowAssignmentToast(false), 4000); // Hide after 4 seconds
      return () => clearTimeout(timer);
    } else {
      setShowAssignmentToast(false);
    }
  }, [activeAssignment, studentId]);
  useEffect(() => { isIndependentModeRef.current = isIndependentMode; }, [isIndependentMode]);
  useEffect(() => { lockedPageIndexRef.current = lockedPageIndex; }, [lockedPageIndex]);

  // If locked & independent mode, auto grant local drawing control
  const isStudentLocallyInControl = hasControl || (isIndependentMode && lockedPageIndex !== null && lockedPageIndex === currentPageIndex);
  const isStudentLocallyInControlRef = useRef(isStudentLocallyInControl);
  useEffect(() => { isStudentLocallyInControlRef.current = isStudentLocallyInControl; }, [isStudentLocallyInControl]);

  // Library State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)

  // Spotlight States
    const [isSpotlightActive, setIsSpotlightActive] = useState(false)
  const [isHangmanActive, setIsHangmanActive] = useState(false)
  const [isQuizShowActive, setIsQuizShowActive] = useState(false)
  const [isWordSearchActive, setIsWordSearchActive] = useState(false)
    const [isQuranGameActive, setIsQuranGameActive] = useState(false)
    const [isWordBuilderActive, setIsWordBuilderActive] = useState(false)
    const [isPeriodicTableActive, setIsPeriodicTableActive] = useState(false)
    const [isReadyPathwayActive, setIsReadyPathwayActive] = useState(false)
    const [isMemoryGameActive, setIsMemoryGameActive] = useState(false)
    const [customBgImage, setCustomBgImage] = useState(null)
    const [iframes, setIframes] = useState([])
  const [isMathQuizActive, setIsMathQuizActive] = useState(false)
  const [isQuranPlayerActive, setIsQuranPlayerActive] = useState(false)
  const [spotlightShape, setSpotlightShape] = useState('circle')
  const [isSpotlightLocked, setIsSpotlightLocked] = useState(false)

  // New Overlay States
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [isBlindActive, setIsBlindActive] = useState(false)
  const [isMagnifierActive, setIsMagnifierActive] = useState(false)
  const [isMathModalOpen, setIsMathModalOpen] = useState(false)
  const [mathInput, setMathInput] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMobileMenuExpanded, setIsMobileMenuExpanded] = useState(false)
  const [youtubeVideos, setYoutubeVideos] = useState([])
  const [teacherAspectRatio, setTeacherAspectRatio] = useState(0.5625)

  // History States for Undo/Redo
  const historyRef = useRef([])
  const historyIndexRef = useRef(-1)
  const isHistoryUpdateRef = useRef(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const toolRef = useRef(tool)
  const colorRef = useRef(color)
  const lineWidthRef = useRef(lineWidth)

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

  const saveHistory = (currentCanvas) => {
    if (isHistoryUpdateRef.current) return;
    const json = currentCanvas.toJSON(['lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'isFlashcard', 'isMindMapNode', 'frontText', 'backText', 'isFlipped', 'nodeColor']);
    const currentHistory = historyRef.current;
    
    historyRef.current = currentHistory.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(JSON.stringify(json));
    // Cap history to prevent unbounded memory growth (large canvases can be MBs per entry)
    const MAX_HISTORY = 30;
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current = historyRef.current.slice(historyRef.current.length - MAX_HISTORY);
    }
    historyIndexRef.current = historyRef.current.length - 1;
    updateUndoRedoState();
    
    // Remove background from broadcast to prevent exceeding payload size limit
    const broadcastJson = JSON.parse(JSON.stringify(json));
    delete broadcastJson.backgroundImage;
    delete broadcastJson.background;

    // Broadcast state if student has control
    broadcastState(broadcastJson);
  }

  // Handle incoming broadcast
  useEffect(() => {
    if (!channel) return;
    let isMounted = true;

    setTimeout(() => {
      if (isMounted && channel && channel.state === 'joined') {
        if (channel && channel.state === 'joined') { channel.send({ type: 'broadcast', event: 'request_state', payload: {} }).catch(() => {}); }
      }
    }, 1500);
    
    const reactStateHandler = (e) => {
      const payload = e.detail;
      if (!isMounted) return;
      setBgType(payload.bgType || 'blank');
      setBgLetter(payload.bgLetter || 'أ');
      setYoutubeVideos(payload.youtubeVideos || []);
      setIsTimerActive(payload.isTimerActive || false);
      setIsBlindActive(payload.isBlindActive || false);
      setIsMagnifierActive(payload.isMagnifierActive || false);
      setIsSpotlightActive(payload.isSpotlightActive || false);
      setSpotlightShape(payload.spotlightShape || 'circle');
      setIsQuranPlayerActive(payload.isQuranPlayerActive || false);
      setIsMathQuizActive(payload.isMathQuizActive || false);
      setIsHangmanActive(payload.isHangmanActive || false);
      setIsQuizShowActive(payload.isQuizShowActive || false);
      setIsWordSearchActive(payload.isWordSearchActive || false);
      setIsQuranGameActive(payload.isQuranGameActive || false);
      setIsWordBuilderActive(payload.isWordBuilderActive || false);
      setIsPeriodicTableActive(payload.isPeriodicTableActive || false);
      setIsReadyPathwayActive(payload.isReadyPathwayActive || false);
      setIsMemoryGameActive(payload.isMemoryGameActive || false);
      setCustomBgImage(payload.customBgImage || null);
      setIframes(payload.iframes || []);
      if (payload.aspectRatio) setTeacherAspectRatio(payload.aspectRatio);
    };

    const cheerHandler = (e) => {
      if (!isMounted) return;
      if (e.detail && e.detail.type) { window.triggerRemoteCheer && window.triggerRemoteCheer(e.detail.type); }
    };

    const boardConfigHandler = (e) => {
      if (!isMounted) return;
      if (e.detail && e.detail.aspectRatio) setTeacherAspectRatio(e.detail.aspectRatio);
    };

    const pageAssignmentHandler = (e) => {
      if (!isMounted) return;
      const payload = e.detail;
      if (isIndependentModeRef.current && lockedPageIndexRef.current !== null) return;
      setActiveAssignment(payload.assignedTo || null);
      if (payload.pageIndex !== undefined && payload.pageIndex !== currentPageIndexRef.current) setCurrentPageIndex(payload.pageIndex);
    };

    const assignStudentHandler = (e) => {
      if (!isMounted) return;
      const payload = e.detail;
      if (payload.isIndependentMode) {
        if (payload.studentId === studentId) {
          setLockedPageIndex(payload.pageIndex);
          setCurrentPageIndex(payload.pageIndex);
        } else if (lockedPageIndexRef.current === payload.pageIndex) {
          setLockedPageIndex(null);
        }
      }
    };

    const independentModeHandler = (e) => {
      if (!isMounted) return;
      const payload = e.detail;
      setIsIndependentMode(payload.isIndependentMode);
      if (!payload.isIndependentMode) {
        setLockedPageIndex(null);
        setTimeout(() => { if (channel && channel.state === 'joined') channel.send({ type: 'broadcast', event: 'request_state', payload: {} }).catch(() => {}); }, 500);
      }
    };

    const viewportHandler = (e) => {
      if (!isMounted || !fabricCanvasRef.current || !baseScaleRef.current) return;
      if (isIndependentModeRef.current && lockedPageIndexRef.current !== null) return;
      const payload = e.detail;
      const teacherVpt = payload.vpt;
      const teacherBaseScale = payload.baseScale;
      const studentBaseScale = baseScaleRef.current;
      if (!teacherBaseScale) return;
      const scaleRatio = studentBaseScale / teacherBaseScale;
      const newVpt = [
        teacherVpt[0] * scaleRatio, teacherVpt[1], teacherVpt[2],
        teacherVpt[3] * scaleRatio, teacherVpt[4] * scaleRatio, teacherVpt[5] * scaleRatio
      ];
      fabricCanvasRef.current.setViewportTransform(newVpt);
      fabricCanvasRef.current.renderAll();
      syncBackgroundToViewport(newVpt);
    };

    const laserDrawHandler = (e) => {
      if (!isMounted || !fabricCanvasRef.current) return;
      const payload = e.detail;
      const canvas = fabricCanvasRef.current;
      const path = new fabric.Path(payload.path, {
        left: payload.left, top: payload.top, stroke: payload.color, strokeWidth: 6, fill: '',
        selectable: false, evented: false, strokeLineCap: 'round', strokeLineJoin: 'round',
        shadow: new fabric.Shadow({ color: payload.color, blur: 15 })
      });
      canvas.add(path);
      path.animate('opacity', 0, {
        duration: 2000, onChange: canvas.renderAll.bind(canvas), onComplete: () => canvas.remove(path)
      });
    };

    const fabricStateHandler = (e) => {
      const payload = e.detail;
      if (!isMounted || !fabricCanvasRef.current || !payload) return;
      if (payload.isIndependentMode !== undefined) setIsIndependentMode(payload.isIndependentMode);
      if (isIndependentModeRef.current && lockedPageIndexRef.current !== null) return;
      isHistoryUpdateRef.current = true;
      const currentVpt = fabricCanvasRef.current.viewportTransform.slice();
      const currentBg = fabricCanvasRef.current.backgroundImage;
      const currentBgColor = fabricCanvasRef.current.backgroundColor;
      fabricCanvasRef.current.loadFromJSON(payload, () => {
        if (!isMounted || !fabricCanvasRef.current) return;
        fabricCanvasRef.current.setViewportTransform(currentVpt);
        if (!payload.backgroundImage && currentBg) fabricCanvasRef.current.backgroundImage = currentBg;
        if (!payload.background && currentBgColor) fabricCanvasRef.current.backgroundColor = currentBgColor;
        fabricCanvasRef.current.renderAll();
        setTimeout(() => { isHistoryUpdateRef.current = false; }, 80);
      });
    };

    window.addEventListener('on_react_state', reactStateHandler);
    window.addEventListener('on_cheer', cheerHandler);
    window.addEventListener('on_board_config', boardConfigHandler);
    window.addEventListener('on_page_assignment', pageAssignmentHandler);
    window.addEventListener('on_assign_student_to_page', assignStudentHandler);
    window.addEventListener('on_independent_mode_toggle', independentModeHandler);
    window.addEventListener('on_viewport_update', viewportHandler);
    window.addEventListener('on_laser_draw', laserDrawHandler);
    window.addEventListener('on_fabric_state', fabricStateHandler);


    return () => { 
      isMounted = false; 
      window.removeEventListener('on_react_state', reactStateHandler);
      window.removeEventListener('on_cheer', cheerHandler);
      window.removeEventListener('on_board_config', boardConfigHandler);
      window.removeEventListener('on_page_assignment', pageAssignmentHandler);
      window.removeEventListener('on_assign_student_to_page', assignStudentHandler);
      window.removeEventListener('on_independent_mode_toggle', independentModeHandler);
      window.removeEventListener('on_viewport_update', viewportHandler);
      window.removeEventListener('on_laser_draw', laserDrawHandler);
      window.removeEventListener('on_fabric_state', fabricStateHandler);
    };
  }, [channel]);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasRef.current || !canvasRef.current.parentElement) return;
    if (canvasRef.current.parentElement.getElementsByClassName('canvas-container').length > 0) return;

    if (typeof window !== 'undefined' && window.fabric && !window.fabric.FlashcardText) {
      window.fabric.FlashcardText = window.fabric.util.createClass(window.fabric.Textbox, {
        type: 'flashcardText',
        initialize: function(text, options) {
          options = options || {};
          this.callSuper('initialize', text, options);
          this.set({
            isFlashcard: true,
            frontText: options.frontText || text,
            backText: options.backText || '����� �������',
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
          return window.fabric.util.object.extend(this.callSuper('toObject'), {
            isFlashcard: this.isFlashcard, frontText: this.frontText, backText: this.backText,
            isShowingFront: this.isShowingFront, cardColor: this.cardColor, backColor: this.backColor,
            rx: this.rx, ry: this.ry, padding: this.padding
          });
        }
      });
      window.fabric.FlashcardText.fromObject = function(object, callback) {
        return window.fabric.Object._fromObject('FlashcardText', object, callback, 'text');
      };
      
      window.fabric.MindMapText = window.fabric.util.createClass(window.fabric.Textbox, {
        type: 'mindMapText',
        initialize: function(text, options) {
          options = options || {};
          this.callSuper('initialize', text, options);
          this.set({
            isMindMapNode: true,
            mindMapId: options.mindMapId || 'node_' + Math.random().toString(36).substring(2),
            nodeColor: options.nodeColor || '#3b82f6',
            theme: options.theme || 'classic',
            _connectedLines: [],
            rx: 10, ry: 10, padding: 15
          });
        },
        _renderBackground: function(ctx) {
          if (!this.backgroundColor && !this.nodeColor) return;
          var w = this.width + this.padding * 2, h = this.height + this.padding * 2;
          var x = -this.width/2 - this.padding, y = -this.height/2 - this.padding;
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
          return window.fabric.util.object.extend(this.callSuper('toObject'), {
            isMindMapNode: this.isMindMapNode, mindMapId: this.mindMapId, nodeColor: this.nodeColor, theme: this.theme,
            rx: this.rx, ry: this.ry, padding: this.padding
          });
        }
      });
      window.fabric.MindMapText.fromObject = function(object, callback) {
        return window.fabric.Object._fromObject('MindMapText', object, callback, 'text');
      };
    }

    const VIRTUAL_WIDTH = 1920;
    const VIRTUAL_HEIGHT = 1080;

    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: VIRTUAL_WIDTH,
      height: VIRTUAL_HEIGHT,
      isDrawingMode: isStudentLocallyInControlRef.current,
      preserveObjectStacking: true,
      selection: isStudentLocallyInControlRef.current,
      allowTouchScrolling: false  // must be false so touch draws instead of scrolls
    })

    fabricCanvasRef.current = initCanvas;
    setCanvas(initCanvas)
    setTimeout(() => saveHistory(initCanvas), 100);

    // Ensure Fabric's dynamically-generated canvas elements have touch-action:none
    // so the browser doesn't intercept touch events for scrolling while drawing
    const fabricContainer = canvasRef.current?.parentElement;
    if (fabricContainer) {
      fabricContainer.style.touchAction = 'none';
      fabricContainer.querySelectorAll('canvas').forEach(c => {
        c.style.touchAction = 'none';
      });
    }

    // Two-finger pan logic
    let isTwoFingerPanning = false;
    let lastTouchX = 0;
    let lastTouchY = 0;

    initCanvas.on('mouse:down', function(opt) {
      const e = opt.e;
      if (e.touches && e.touches.length === 2) {
        isTwoFingerPanning = true;
        initCanvas.isDrawingMode = false;
        lastTouchX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        lastTouchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      }
    });

    initCanvas.on('mouse:move', function(opt) {
      const e = opt.e;
      if (isTwoFingerPanning && e.touches && e.touches.length === 2) {
        const currentX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const deltaX = currentX - lastTouchX;
        const deltaY = currentY - lastTouchY;
        
        const vpt = this.viewportTransform;
        vpt[4] += deltaX;
        vpt[5] += deltaY;
        this.setViewportTransform(vpt);
        this.requestRenderAll();
        syncBackgroundToViewport(vpt);
        
        lastTouchX = currentX;
        lastTouchY = currentY;
      }
    });

    initCanvas.on('mouse:up', function(opt) {
      if (isTwoFingerPanning) {
        isTwoFingerPanning = false;
        if (isStudentLocallyInControlRef.current && toolRef.current !== 'pan') {
          initCanvas.isDrawingMode = true;
        }
      }
    });

    const handleObjectModified = (e) => {
      // Do not save laser paths in history
      if (e.target && e.target.isLaser) return;
      saveHistory(initCanvas);
    }
    
    const handleObjectChanging = (e) => {
      if (isStudentLocallyInControlRef.current && typeof broadcastSafely === 'function') {
        const json = initCanvas.toJSON(['lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'isFlashcard', 'isMindMapNode', 'frontText', 'backText', 'isFlipped', 'nodeColor']);
        const broadcastJson = JSON.parse(JSON.stringify(json));
        delete broadcastJson.backgroundImage;
        delete broadcastJson.background;
        broadcastState(broadcastJson);
      }
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

        broadcastSafely('laser_draw', { path: path.path, color: colorRef.current })

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
        var e = opt.e;
        var vpt = this.viewportTransform;
        vpt[4] += opt.pointer.x - this.lastPosX;
        vpt[5] += opt.pointer.y - this.lastPosY;
        this.requestRenderAll();
        syncBackgroundToViewport(vpt);
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
                  broadcastState(initCanvas.toJSON(['lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'isFlashcard', 'isMindMapNode', 'frontText', 'backText', 'isFlipped', 'nodeColor']));
                }
              });
            }
          });
        } else if (obj.isMindMapNode && isStudentLocallyInControlRef.current) {
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
              broadcastState(initCanvas.toJSON(['lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'isFlashcard', 'isMindMapNode', 'frontText', 'backText', 'isFlipped', 'nodeColor']));
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
      syncBackgroundToViewport(initCanvas.viewportTransform);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Pinch-to-Zoom for touch devices (2-finger pinch)
    let lastPinchDist = null;
    const getDistance = (t1, t2) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };
    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        lastPinchDist = getDistance(e.touches[0], e.touches[1]);
        e.preventDefault();
      }
    };
    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && lastPinchDist !== null) {
        const newDist = getDistance(e.touches[0], e.touches[1]);
        const scale = newDist / lastPinchDist;
        lastPinchDist = newDist;
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const rect = initCanvas.lowerCanvasEl.getBoundingClientRect();
        const canvasPoint = { x: midX - rect.left, y: midY - rect.top };
        let zoom = initCanvas.getZoom() * scale;
        if (zoom > 5) zoom = 5;
        if (zoom < 0.1) zoom = 0.1;
        initCanvas.zoomToPoint(canvasPoint, zoom);
        syncBackgroundToViewport(initCanvas.viewportTransform);
        e.preventDefault();
      }
    };
    const handleTouchEnd = (e) => {
      if (e.touches.length < 2) lastPinchDist = null;
    };
    const canvasEl = initCanvas.upperCanvasEl || initCanvas.lowerCanvasEl;
    canvasEl.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvasEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvasEl.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      initCanvas.dispose();
      canvasEl.removeEventListener('touchstart', handleTouchStart);
      canvasEl.removeEventListener('touchmove', handleTouchMove);
      canvasEl.removeEventListener('touchend', handleTouchEnd);
    }
  }, [])

  // Responsive Canvas with Virtual Resolution
  useEffect(() => {
    const handleResize = () => {
      if (canvas && outerContainerRef.current && innerWrapperRef.current) {
        const wrapper = outerContainerRef.current;
        const VIRTUAL_WIDTH = 1000;
        const VIRTUAL_HEIGHT = 1000 * teacherAspectRatio;
        
        // Scale to fit wrapper, using the teacher's exact aspect ratio
        const scale = Math.min(wrapper.clientWidth / VIRTUAL_WIDTH, wrapper.clientHeight / VIRTUAL_HEIGHT);
        baseScaleRef.current = scale;
        setUiScale(scale);
        
        // Update Actual Canvas Size
        canvas.setDimensions({
          width: VIRTUAL_WIDTH * scale,
          height: VIRTUAL_HEIGHT * scale
        });
        canvas.setZoom(scale);
        
        // Reset viewport to default top-left origin
        const vpt = canvas.viewportTransform;
        vpt[0] = scale;
        vpt[3] = scale;
        vpt[4] = 0;
        vpt[5] = 0;
        canvas.setViewportTransform(vpt);
        syncBackgroundToViewport(vpt);
        
        innerWrapperRef.current.style.width = `${VIRTUAL_WIDTH * scale}px`;
        innerWrapperRef.current.style.height = `${VIRTUAL_HEIGHT * scale}px`;
        
        canvas.renderAll();
        canvas.calcOffset();
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
  }, [canvas, teacherAspectRatio])

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
    } else if (tool === 'magic') {
      canvas.isDrawingMode = true
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.color = color
      canvas.freeDrawingBrush.width = lineWidth
    } else if (tool === 'laser') {
      canvas.isDrawingMode = false
      canvas.defaultCursor = 'crosshair'
      canvas.selection = false
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
      // Guard: only allow keyboard actions when student has whiteboard control
      if (!hasControlRef.current) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && canvas && tool === 'select') {
        const activeObjects = canvas.getActiveObjects()
        if (activeObjects.length) {
          if (canvas.getActiveObject().isEditing) return
          canvas.discardActiveObject()
          activeObjects.forEach((obj) => { if(!obj.lockMovementX) canvas.remove(obj) })
        }
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
      const jsonStr = historyRef.current[historyIndexRef.current];
      const currentVpt = canvas.viewportTransform.slice(); // Preserve Viewport
      canvas.loadFromJSON(jsonStr, () => {
        canvas.setViewportTransform(currentVpt); // Restore Viewport
        canvas.renderAll();
        syncBackgroundToViewport(currentVpt);
        isHistoryUpdateRef.current = false;
        updateUndoRedoState();
        if (isStudentLocallyInControlRef.current) {
          const payloadObj = JSON.parse(jsonStr);
          delete payloadObj.backgroundImage;
          delete payloadObj.background;
          broadcastState(payloadObj);
        }
      });
    }
  }

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1 && canvas) {
      isHistoryUpdateRef.current = true;
      historyIndexRef.current += 1;
      const jsonStr = historyRef.current[historyIndexRef.current];
      const currentVpt = canvas.viewportTransform.slice(); // Preserve Viewport
      canvas.loadFromJSON(jsonStr, () => {
        canvas.setViewportTransform(currentVpt); // Restore Viewport
        canvas.renderAll();
        syncBackgroundToViewport(currentVpt);
        isHistoryUpdateRef.current = false;
        updateUndoRedoState();
        if (isStudentLocallyInControlRef.current) {
          const payloadObj = JSON.parse(jsonStr);
          delete payloadObj.backgroundImage;
          delete payloadObj.background;
          broadcastState(payloadObj);
        }
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
        cloned.set({ left: obj.left + 20, top: obj.top + 20, evented: true, selectable: true });
        if(cloned.type === 'activeSelection') {
          cloned.canvas = canvas;
          cloned.forEachObject((o) => canvas.add(o));
          cloned.setCoords();
        } else {
          canvas.add(cloned);
        }
        canvas.setActiveObject(cloned);
        canvas.requestRenderAll();
      })
    }
  }

  const zoomIn = () => { if(canvas) { canvas.setZoom(canvas.getZoom() * 1.2); syncBackgroundToViewport(canvas.viewportTransform); } }
  const zoomOut = () => { if(canvas) { canvas.setZoom(canvas.getZoom() / 1.2); syncBackgroundToViewport(canvas.viewportTransform); } }
  const resetZoom = () => {
    if(canvas) {
      canvas.setZoom(baseScaleRef.current);
      canvas.viewportTransform[4] = 0;
      canvas.viewportTransform[5] = 0;
      canvas.requestRenderAll();
      syncBackgroundToViewport(canvas.viewportTransform);
    }
  }

  const addPage = () => {
    if (!canvas) return;
    const json = canvas.toJSON(['lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'isFlashcard', 'isMindMapNode', 'frontText', 'backText', 'isFlipped', 'nodeColor']);
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

  const switchPage = (index) => {
    if (!canvas || index === currentPageIndex || index < 0 || index >= pages.length) return;
    const json = canvas.toJSON(['lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'isFlashcard', 'isMindMapNode', 'frontText', 'backText', 'isFlipped', 'nodeColor']);
    const newPages = [...pages];
    newPages[currentPageIndex].json = json;
    setPages(newPages);
    
    setCurrentPageIndex(index);
    canvas.clear();
    
    const targetJson = newPages[index].json;
    const currentVpt = canvas.viewportTransform.slice(); // Preserve Viewport
    if (targetJson) {
      canvas.loadFromJSON(targetJson, () => {
        canvas.setViewportTransform(currentVpt); // Restore Viewport
        canvas.renderAll();
        syncBackgroundToViewport(currentVpt);
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

  const saveProject = () => {
    if (!canvas) return;
    const currentJson = canvas.toJSON(['lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'isFlashcard', 'isMindMapNode', 'frontText', 'backText', 'isFlipped', 'nodeColor']);
    const newPages = [...pages];
    newPages[currentPageIndex].json = currentJson;
    
    const projectData = JSON.stringify({ pages: newPages, currentPageIndex });
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whiteboard_project.json';
    a.click();
    // Revoke the object URL to free memory
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
          canvas.backgroundColor = 'transparent';
          saveHistory(canvas);
          if (targetJson) {
             canvas.loadFromJSON(targetJson, () => {
               canvas.renderAll();
               syncBackgroundToViewport(canvas.viewportTransform);
               historyRef.current = [];
               historyIndexRef.current = -1;
               saveHistory(canvas);
             });
          }
        }
      } catch (err) {
        alert('ملف غير صالح');
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
          alert('جاري تحميل مكتبة PDF، يرجى المحاولة بعد قليل.');
          return;
       }
       const reader = new FileReader();
       reader.onload = async (f) => {
          const typedarray = new Uint8Array(f.target.result);
          const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
          const numPages = pdf.numPages;
          
          let additionalPages = [];

          for (let i = 1; i <= numPages; i++) {
             const page = await pdf.getPage(i);
             const viewport = page.getViewport({ scale: 2 });
             
             const tempCanvas = document.createElement('canvas');
             const context = tempCanvas.getContext('2d');
             tempCanvas.height = viewport.height;
             tempCanvas.width = viewport.width;
             
             await page.render({ canvasContext: context, viewport }).promise;
             const dataUrl = tempCanvas.toDataURL('image/png');
             
             if (i === 1) {
                fabric.Image.fromURL(dataUrl, (img) => {
                   const canvasAspect = canvas.width / canvas.height;
                   const imgAspect = img.width / img.height;
                   let scaleFactor = canvasAspect >= imgAspect ? canvas.height / img.height : canvas.width / img.width;
                   img.set({ scaleX: scaleFactor, scaleY: scaleFactor, originX: 'center', originY: 'center', left: canvas.width / 2, top: canvas.height / 2 });
                   canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
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
                additionalPages.push({ id: Date.now() + i, json: jsonStr });
             }
          }

          if (additionalPages.length > 0) {
              setPages(prev => [...prev, ...additionalPages]);
          }
       };
       reader.readAsArrayBuffer(file);
    } else {
       const reader = new FileReader();
       reader.onload = (f) => {
          fabric.Image.fromURL(f.target.result, (img) => {
             const canvasAspect = canvas.width / canvas.height;
             const imgAspect = img.width / img.height;
             let scaleFactor = canvasAspect >= imgAspect ? canvas.height / img.height : canvas.width / img.width;
             img.set({ scaleX: scaleFactor, scaleY: scaleFactor, originX: 'center', originY: 'center', left: canvas.width / 2, top: canvas.height / 2 });
             canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
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

  const addText = () => {
    if (!canvas) return
    const text = new fabric.IText('اضغط مرتين للتعديل', {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fontFamily: 'Tajawal', fill: color, fontSize: 40, textAlign: 'right', direction: 'rtl'
    })
    canvas.add(text)
    canvas.setActiveObject(text)
    setTool('select')
    saveHistory(canvas)
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
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, stroke: color, strokeWidth: lineWidth, fill: 'transparent', originX: 'center', originY: 'center'
    })
    canvas.add(arrowPath); canvas.setActiveObject(arrowPath); setTool('select')
  }

  const addRuler = () => {
    if (!canvas) return;
    const rect = new fabric.Rect({ width: 500, height: 60, fill: 'rgba(255,255,255,0.85)', stroke: '#333' });
    const group = [rect];
    for(let i=0; i<=500; i+=10) {
      const h = (i % 50 === 0) ? 30 : (i % 50 === 25 ? 20 : 10);
      group.push(new fabric.Line([i, 0, i, h], { stroke: '#333', strokeWidth: 1 }));
      if(i % 50 === 0 && i !== 0) {
        group.push(new fabric.Text((i/10).toString(), { left: i - 8, top: 35, fontSize: 16, fontFamily: 'Arial' }));
      }
    }
    const ruler = new fabric.Group(group, { ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true });
    canvas.add(ruler); canvas.setActiveObject(ruler); setTool('select');
  }

  const addProtractor = () => {
    if (!canvas) return;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">';
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
        obj.set({ ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, originX: 'center', originY: 'center' });
        canvas.add(obj);
        canvas.setActiveObject(obj);
        setTool('select');
    });
  }

  const addCompass = () => {
    if (!canvas) return;
    setTool('compass');
  }

  const addStar = () => {
    if (!canvas) return;
    const starPath = 'M 50 0 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z';
    const star = new fabric.Path(starPath, {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fill: 'transparent', stroke: color, strokeWidth: lineWidth, scaleX: 1.5, scaleY: 1.5
    });
    canvas.add(star); canvas.setActiveObject(star); setTool('select');
  }

  const addHexagon = () => {
    if (!canvas) return;
    const hex = new fabric.Polygon([
      {x: 50, y: 0}, {x: 100, y: 25}, {x: 100, y: 75},
      {x: 50, y: 100}, {x: 0, y: 75}, {x: 0, y: 25}
    ], {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fill: 'transparent', stroke: color, strokeWidth: lineWidth
    });
    canvas.add(hex); canvas.setActiveObject(hex); setTool('select');
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
        canvas.add(obj); canvas.setActiveObject(obj); setTool('select');
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
        canvas.add(obj); canvas.setActiveObject(obj); setTool('select');
    });
  }

  const addCloud = () => {
    if (!canvas) return;
    const path = "M 35 30 Q 30 10 55 10 Q 75 10 80 25 Q 105 25 100 45 Q 115 65 95 80 Q 90 100 65 95 Q 40 105 25 85 Q 5 80 15 55 Q 5 35 35 30 Z";
    const cloud = new fabric.Path(path, {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fill: 'transparent', stroke: color, strokeWidth: lineWidth, scaleX: 1.5, scaleY: 1.5
    });
    canvas.add(cloud); canvas.setActiveObject(cloud); setTool('select');
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
        canvas.add(obj); canvas.setActiveObject(obj); setTool('select');
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
        canvas.add(obj); canvas.setActiveObject(obj); setTool('select');
    });
  }

  const addEllipse = () => {
    if (!canvas) return;
    const ellipse = new fabric.Ellipse({
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, rx: 60, ry: 30, fill: 'transparent', stroke: color, strokeWidth: lineWidth
    });
    canvas.add(ellipse); canvas.setActiveObject(ellipse); setTool('select');
  }

  const addCheckmark = () => {
    if (!canvas) return;
    const path = "M 10 50 L 40 80 L 90 10";
    const check = new fabric.Path(path, {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fill: 'transparent', stroke: '#10b981', strokeWidth: lineWidth + 2, strokeLineCap: 'round', strokeLineJoin: 'round'
    });
    canvas.add(check); canvas.setActiveObject(check); setTool('select');
  }

  const addCross = () => {
    if (!canvas) return;
    const path = "M 20 20 L 80 80 M 80 20 L 20 80";
    const cross = new fabric.Path(path, {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true, fill: 'transparent', stroke: '#ef4444', strokeWidth: lineWidth + 2, strokeLineCap: 'round'
    });
    canvas.add(cross); canvas.setActiveObject(cross); setTool('select');
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
        canvas.add(obj); canvas.setActiveObject(obj); setTool('select');
    });
  }

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
  const triggerCheer = async (type = 'fireworks', isRemote = false) => {
    if (!isRemote) {
      broadcastSafely('cheer', { type });
    }
    const canvasObj = fabricCanvasRef.current || canvas;
    if (!canvasObj) return;

    try {
      const { playCheerSound } = await import('../utils/soundEffects');
      playCheerSound(type);
    } catch(e) {}

    try {
      const { renderCheerOnCanvas } = await import('../utils/cheerEffects');
      renderCheerOnCanvas(canvasObj, type);
    } catch(e) {}
  };

  const videoRenderLoopRef = useRef(null)

  const toggleVisibility = () => {
    const obj = canvas?.getActiveObject()
    if (!obj) return
    obj.set({ opacity: obj.opacity === 0.2 ? 1 : 0.2 })
    canvas.renderAll()
  }

  const exportToPDF = async () => {
    if (!window.jspdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      document.body.appendChild(script);
      script.onload = () => generatePDF();
    } else {
      generatePDF();
    }
  }

  const generatePDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    
    // We export the current canvas state directly for simplicity and performance.
    const bg = canvas.backgroundColor; canvas.backgroundColor = '#ffffff';
    const dataURL = canvas.toDataURL({ format: 'jpeg', quality: 0.8 });
    canvas.backgroundColor = bg;
    
    doc.addImage(dataURL, 'JPEG', 0, 0, canvas.width, canvas.height);
    doc.save('whiteboard_notes.pdf');
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
      window.alert('رابط يوتيوب غير صالح');
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


  const handleImageUpload = (e) => {
    if (!canvas || !e.target.files[0]) return
    const reader = new FileReader()
    reader.onload = (f) => {
      fabric.Image.fromURL(f.target.result, (img) => {
        img.scaleToWidth(400)
        img.set({ left: 100, top: 100 })
        canvas.add(img)
        canvas.setActiveObject(img)
        setTool('select')
      })
    }
    reader.readAsDataURL(e.target.files[0])
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

  // Update drawing mode when control changes
  useEffect(() => {
    if (canvas) {
      canvas.isDrawingMode = isStudentLocallyInControl && (tool === 'pen' || tool === 'highlighter' || tool === 'laser' || tool === 'magic');
      canvas.selection = isStudentLocallyInControl;
      canvas.getObjects().forEach(obj => {
        obj.selectable = isStudentLocallyInControl;
        obj.evented = isStudentLocallyInControl;
      });
      canvas.renderAll();
    }
  }, [isStudentLocallyInControl, tool, canvas])

  const bgTypeRef = useRef(bgType);
  const bgLetterRef = useRef(bgLetter);
  const aspectRatioRef = useRef(teacherAspectRatio);
  
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
    aspectRatioRef.current = teacherAspectRatio;
    if (fabricCanvasRef.current) syncBackgroundToViewport(fabricCanvasRef.current.viewportTransform);
  }, [bgType, bgLetter, teacherAspectRatio]);

  return (
    <div className={`${styles.container} ${isMobile ? styles.forceMobile : ''}`} ref={outerContainerRef} style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: '#e2e8f0', touchAction: 'none' }}>
      <style>{`
        .canvas-container, .upper-canvas, .lower-canvas {
          touch-action: none !important;
        }
      `}</style>
      {/* Canvas Area */}
      <div ref={innerWrapperRef} className={`${styles.canvasWrapper} ${styles[bgType]}`} style={{ position: 'relative', boxShadow: '0 0 25px rgba(0,0,0,0.15)', overflow: 'hidden', touchAction: 'none' }}>
        {customBgImage && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${customBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, zIndex: 0, pointerEvents: 'none' }} />}
        {iframes.map(iframe => (
          <div key={iframe.id} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 'min(90vw, 600px)', height: 'min(60vh, 400px)', maxWidth: '100%', zIndex: 50, pointerEvents: 'auto', background: 'white', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '10px', background: '#e2e8f0', borderRadius: '10px 10px 0 0', fontWeight: 'bold' }}>{iframe.title || 'أداة'}</div>
            <iframe src={iframe.url} style={{ width: '100%', height: 'calc(100% - 40px)', border: 'none', borderRadius: '0 0 10px 10px' }} />
          </div>
        ))}
        {bgType === 'letters' && (
          <div id="bg-letter-overlay" style={{
             position: 'absolute',
             left: `${500 * uiScale}px`,
             top: `${(1000 * teacherAspectRatio / 2) * uiScale}px`,
             fontSize: '350px', color: '#e2e8f0', fontFamily: 'Arial, Tajawal, sans-serif',
             userSelect: 'none', pointerEvents: 'none', zIndex: 0,
             transform: `translate(-50%, -50%) scale(${uiScale})`,
             transformOrigin: 'center center'
          }}>
            {bgLetter}
          </div>
        )}
        <canvas ref={canvasRef} className={styles.canvas} style={{ position: 'relative', zIndex: 1 }} />
      </div>
      {/* Student Page Assignment Notification */}
      {showAssignmentToast && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '16px',
          fontWeight: 900,
          fontSize: '1.2rem',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'pulse 2s infinite',
          border: '2px solid #ffffff'
        }}>
          <Sparkles size={24} />
          <span>🌟 هذه الصفحة مخصصة لك للإجابة يا {studentName.split(' ')[0]}!</span>
        </div>
      )}

      {/* Student Control Bar - Only visible if student has control */}
      {isStudentLocallyInControl && (
        <div
          onWheel={e => { e.currentTarget.scrollLeft += e.deltaY; }}
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            maxWidth: '96vw',
            overflowX: 'auto',
            zIndex: 40,
            boxSizing: 'border-box',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {/* Drawing Tools */}
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
            <button onClick={() => setTool('select')} title="تحديد وتحريك" style={{ width:'34px',height:'34px',borderRadius:'10px',background:tool==='select'?'#6366f1':'rgba(255,255,255,0.08)',color:tool==='select'?'white':'#94a3b8',border:tool==='select'?'1px solid #818cf8':'1px solid transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s',flexShrink:0 }}><MousePointer2 size={16}/></button>
            <button onClick={() => setTool('pen')} title="قلم" style={{ width:'34px',height:'34px',borderRadius:'10px',background:tool==='pen'?'#2563eb':'rgba(255,255,255,0.08)',color:tool==='pen'?'white':'#94a3b8',border:tool==='pen'?'1px solid #60a5fa':'1px solid transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s',flexShrink:0 }}><Pen size={16}/></button>
            <button onClick={() => setTool('highlighter')} title="تظليل / شادو" style={{ width:'34px',height:'34px',borderRadius:'10px',background:tool==='highlighter'?'#d97706':'rgba(255,255,255,0.08)',color:tool==='highlighter'?'white':'#94a3b8',border:tool==='highlighter'?'1px solid #fbbf24':'1px solid transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s',flexShrink:0 }}><Highlighter size={16}/></button>
            <button onClick={() => setTool('eraser')} title="ممحاة" style={{ width:'34px',height:'34px',borderRadius:'10px',background:tool==='eraser'?'#ef4444':'rgba(255,255,255,0.08)',color:tool==='eraser'?'white':'#94a3b8',border:tool==='eraser'?'1px solid #f87171':'1px solid transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s',flexShrink:0 }}><Eraser size={16}/></button>
            <button onClick={addText} title="نص" style={{ width:'34px',height:'34px',borderRadius:'10px',background:tool==='text'?'#8b5cf6':'rgba(255,255,255,0.08)',color:tool==='text'?'white':'#94a3b8',border:tool==='text'?'1px solid #a78bfa':'1px solid transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s',flexShrink:0 }}><Type size={16}/></button>
          </div>

          <div style={{ width:'1px',height:'24px',background:'rgba(255,255,255,0.12)',flexShrink:0 }} />

          {/* Colors */}
          <div style={{ display:'flex',gap:'4px',alignItems:'center',flexShrink:0 }}>
            {['#0f172a','#ef4444','#f97316','#eab308','#22c55e','#2563eb','#a855f7','#ffffff'].map(c => (
              <button key={c} onClick={() => { setColor(c); if(tool==='eraser'||tool==='select') setTool('pen'); }} style={{ width:'20px',height:'20px',borderRadius:'50%',backgroundColor:c,border:color===c?'2px solid white':'1px solid rgba(255,255,255,0.2)',outline:color===c?'2px solid #60a5fa':'none',cursor:'pointer',padding:0,flexShrink:0,transform:color===c?'scale(1.2)':'scale(1)',transition:'transform 0.15s ease,outline 0.15s ease' }} title={c} />
            ))}
            <label style={{ position:'relative',width:'22px',height:'22px',cursor:'pointer',flexShrink:0 }} title="لون مخصص">
              <div style={{ width:'22px',height:'22px',borderRadius:'50%',background:'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)',border:'1px solid rgba(255,255,255,0.3)' }} />
              <input type="color" value={color} onChange={e=>{ setColor(e.target.value); if(tool==='eraser'||tool==='select') setTool('pen'); }} style={{ position:'absolute',inset:0,opacity:0,width:'100%',height:'100%',cursor:'pointer' }} />
            </label>
          </div>

          <div style={{ width:'1px',height:'24px',background:'rgba(255,255,255,0.12)',flexShrink:0 }} />

          {/* Line Width */}
          <div style={{ display:'flex',alignItems:'center',gap:'4px',flexShrink:0 }}>
            <span style={{ fontSize:'10px',color:'#64748b',fontWeight:700,whiteSpace:'nowrap' }}>سُمك</span>
            <input type="range" min={1} max={30} value={lineWidth} onChange={e=>setLineWidth(Number(e.target.value))} style={{ width:'56px',accentColor:'#2563eb',cursor:'pointer' }} />
            <span style={{ fontSize:'11px',color:'#94a3b8',fontWeight:700,minWidth:'18px',textAlign:'center' }}>{lineWidth}</span>
          </div>

          <div style={{ width:'1px',height:'24px',background:'rgba(255,255,255,0.12)',flexShrink:0 }} />

          {/* Zoom */}
          <div style={{ display:'flex',gap:'3px',alignItems:'center',flexShrink:0 }}>
            <button onClick={zoomIn} title="تكبير" style={{ width:'30px',height:'30px',borderRadius:'8px',background:'rgba(255,255,255,0.08)',color:'#94a3b8',border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:900,lineHeight:1,flexShrink:0 }}>+</button>
            <button onClick={resetZoom} title="إعادة ضبط الزوم" style={{ padding:'0 6px',height:'30px',borderRadius:'8px',background:'rgba(255,255,255,0.08)',color:'#64748b',border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:700,whiteSpace:'nowrap',flexShrink:0 }}>100%</button>
            <button onClick={zoomOut} title="تصغير" style={{ width:'30px',height:'30px',borderRadius:'8px',background:'rgba(255,255,255,0.08)',color:'#94a3b8',border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:900,lineHeight:1,flexShrink:0 }}>−</button>
          </div>

          <div style={{ width:'1px',height:'24px',background:'rgba(255,255,255,0.12)',flexShrink:0 }} />

          {/* Undo */}
          <button onClick={undo} disabled={!canUndo} title="تراجع" style={{ width:'34px',height:'34px',borderRadius:'10px',background:canUndo?'rgba(255,255,255,0.08)':'transparent',color:canUndo?'#94a3b8':'#334155',border:'1px solid transparent',cursor:canUndo?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.15s' }}><Undo2 size={16}/></button>

          {/* Safe Clear - only removes student drawings */}
          <button
            onClick={() => {
              if (!canvas) return;
              canvas.clear();
              canvas.backgroundColor = 'transparent';
              canvas.renderAll();
              saveHistory(canvas);
            }}
            title="مسح رسمي فقط"
            style={{ padding:'0 10px',height:'34px',borderRadius:'10px',background:'rgba(239,68,68,0.12)',color:'#ef4444',border:'1px solid rgba(239,68,68,0.25)',cursor:'pointer',fontSize:'0.78rem',fontWeight:700,display:'flex',alignItems:'center',gap:'4px',whiteSpace:'nowrap',flexShrink:0,transition:'all 0.15s' }}
          >
            <Trash2 size={14}/> مسح
          </button>
        </div>
      )}

      {/* Spotlights and Blinds (View only for students) */}
      <SpotlightOverlay isActive={isSpotlightActive} shape={spotlightShape} isLocked={true} hasControl={false} />
      <BlindOverlay isActive={isBlindActive} onClose={() => {}} hasControl={false} />
      <QuranPlayerOverlay isActive={isQuranPlayerActive} channel={channel} isTeacher={false} />
      <MagnifierOverlay isActive={isMagnifierActive} fabricCanvas={canvas} hasControl={false} />
      <MathQuizOverlay isActive={isMathQuizActive} isStudent={true} onClose={() => {}} />
      <PeriodicTableOverlay isActive={isPeriodicTableActive} isStudent={true} onClose={() => {}} />
      <ReadyPathwayOverlay isActive={isReadyPathwayActive} isStudent={true} onClose={() => {}} />
      <HangmanOverlay isActive={isHangmanActive} isStudent={true} onClose={() => {}} />
      <QuizShowOverlay isActive={isQuizShowActive} isStudent={true} onClose={() => {}} />
      <WordSearchOverlay isActive={isWordSearchActive} isStudent={true} onClose={() => {}} />
      <QuranOrderGameOverlay isActive={isQuranGameActive} isStudent={true} channel={channel} hasControl={hasControl} onClose={() => {}} />
      <WordBuilderOverlay isActive={isWordBuilderActive} isStudent={true} onClose={() => {}} />
      <MemoryGameOverlay isActive={isMemoryGameActive} isStudent={true} onClose={() => {}} />
    </div>
  )
}
















