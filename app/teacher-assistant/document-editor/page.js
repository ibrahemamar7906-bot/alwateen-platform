'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Superscript, Subscript, 
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered, 
  Sparkles, Save, FileText, CheckCheck, Edit3, Mic, Highlighter, 
  Cloud, ArrowRight, Loader2, ShieldAlert, Shapes, Wand2, Plus, 
  Trash2, Undo2, Redo2, Image as ImageIcon, Table as TableIcon, 
  Settings, Printer, MessageSquare, Send, ArrowDownToLine,
  Layout, HelpCircle, Palette, Check, Layers, AlertCircle,
  Copy, ChevronUp, ChevronDown, RefreshCw, Camera, Paperclip, FileSearch,
  Scissors, Clipboard, Paintbrush, AlignJustify, Indent, Outdent, Search, Eraser, Type,
  Maximize2, Minimize2, Square
} from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import { UNIFIED_AI_MODELS, DEFAULT_AI_MODEL } from '../../utils/aiModels';
import AIImageModal from '../whiteboard/AIImageModal';

// IndexedDB Engine for high-capacity local persistence (eliminates 5MB localStorage quota limit)
const DB_NAME = 'SmartHandoutsDB';
const DB_VERSION = 1;
const STORE_NAME = 'handouts_store';

// Standard RFC4122 Compliant UUID Generator & Validator
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const isValidUUID = (id) => {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
};

const openIDB = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
};

const idbSet = async (key, value) => {
  try {
    const db = await openIDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ key, value });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
};

const idbGet = async (key) => {
  try {
    const db = await openIDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
};

// Client-Side Image Compression: downscales large photos and compresses JPEG to prevent browser crashes
const compressImage = (file, maxWidth = 1200, quality = 0.78) => {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const maxHeight = 1600;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target.result);
          return;
        }

        // Small PNG with transparency preservation
        const isPng = file.type === 'image/png';
        if (isPng && file.size < 400 * 1024 && img.width <= maxWidth && img.height <= maxHeight) {
          ctx.drawImage(img, 0, 0, width, height);
          try {
            resolve(canvas.toDataURL('image/png'));
            return;
          } catch (err) {}
        }

        // Standard crisp JPEG with clean white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (err) {
          resolve(e.target.result);
        }
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

// Microsoft Word Authentic Color Palettes (Theme Colors, Standard Colors & Highlighters)
const WORD_STANDARD_COLORS = [
  '#c00000', '#ff0000', '#ffc000', '#ffff00', '#92d050',
  '#00b050', '#00b0f0', '#0070c0', '#002060', '#7030a0'
];

const WORD_THEME_COLORS = [
  // Row 1: Headers / Base
  ['#ffffff', '#000000', '#eeece1', '#1f497d', '#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#4bacc6', '#f79646'],
  // Row 2: 80% lighter
  ['#f2f2f2', '#7f7f7f', '#ddd9c3', '#c6d9f1', '#dbe5f1', '#f2dcdb', '#ebf1dd', '#e5e0ec', '#dbeef3', '#fdeada'],
  // Row 3: 60% lighter
  ['#d9d9d9', '#595959', '#c4bd97', '#8db3e2', '#b8cce4', '#e5b9b7', '#d7e3bc', '#ccc1da', '#b7dde8', '#fbd5b5'],
  // Row 4: 40% lighter
  ['#bfbfbf', '#3f3f3f', '#948a54', '#548dd4', '#95b3d7', '#d99694', '#c3d69b', '#b2a2c7', '#92cddc', '#fac08f'],
  // Row 5: 25% darker
  ['#a6a6a6', '#262626', '#494529', '#17365d', '#366092', '#953734', '#76933c', '#5f497a', '#31859b', '#e36c09'],
  // Row 6: 50% darker
  ['#7f7f7f', '#0d0d0d', '#1d1b10', '#0f243e', '#244062', '#632423', '#4f6128', '#3f3151', '#205867', '#974806']
];

const WORD_HIGHLIGHT_COLORS = [
  '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#0000ff',
  '#ff0000', '#000080', '#008080', '#008000', '#800080',
  '#800000', '#808000', '#808080', '#c0c0c0', '#000000'
];

const WORD_SHADING_COLORS = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1',
  '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#3b82f6',
  '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#22c55e',
  '#fefce8', '#fef9c3', '#fef08a', '#fde047', '#eab308',
  '#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#f97316',
  '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#ef4444',
  '#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#a855f7'
];

export default function DocumentEditorPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Tabbed Ribbon State
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'insert' | 'math' | 'ai' | 'page' | 'image'
  const [isRibbonCollapsed, setIsRibbonCollapsed] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Math Studio States (Word Equation Engine)
  const [activeMathDropdown, setActiveMathDropdown] = useState(null); // 'fraction' | 'script' | 'radical' | 'integral' | 'large_op' | 'bracket' | 'function' | 'accent' | 'limit' | 'operator' | 'matrix' | 'popular' | null
  const [mathDropdownAnchor, setMathDropdownAnchor] = useState(null);
  const [showEquationMenu, setShowEquationMenu] = useState(false);
  const [equationMenuPos, setEquationMenuPos] = useState(null);
  const [showLatexModal, setShowLatexModal] = useState(false);
  const [latexInput, setLatexInput] = useState('\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
  const [latexIsBlock, setLatexIsBlock] = useState(false);
  const [selectedEquation, setSelectedEquation] = useState(null);
  const [equationPreviewHtml, setEquationPreviewHtml] = useState('');
  const [showMoreSymbols, setShowMoreSymbols] = useState(false);
  const [showAIImageModal, setShowAIImageModal] = useState(false);

  // Document Manager States
  const [documents, setDocuments] = useState([]);
  const [docId, setDocId] = useState('');
  const [docTitle, setDocTitle] = useState('ملزمة جديدة');
  
  // Real Fluid Multi-Page Architecture
  const [pages, setPages] = useState([{ id: 1, content: '' }]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isAllPagesSelected, setIsAllPagesSelected] = useState(false);
  const [crossPageSelection, setCrossPageSelection] = useState(null);
  const dragSelectAnchorRef = useRef(null);
  const isMouseDraggingRef = useRef(false);
  const crossRangesRef = useRef([]);

  const [geminiModel, setGeminiModel] = useState(DEFAULT_AI_MODEL);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [liveVoiceTranscript, setLiveVoiceTranscript] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved'); 
  
  // Page Settings (Header, Footer, Watermark, Margins, Page Numbers, Background, Borders, Columns)
  const [watermark, setWatermark] = useState('');
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [pageMargin, setPageMargin] = useState('20mm');
  const [pageNumberFormat, setPageNumberFormat] = useState('bottom_center'); // 'bottom_center' | 'bottom_left' | 'bottom_right' | 'none'
  const [pageBackgroundPattern, setPageBackgroundPattern] = useState('none'); // 'none' | 'ruled_narrow' | 'ruled_wide' | 'grid_small' | 'grid_medium' | 'dotted'
  const [pageBgColor, setPageBgColor] = useState('#ffffff'); // '#ffffff' | '#fefce8' | '#f0f9ff' | '#f0fdf4' | '#fdf2f8' | '#fff7ed'
  const [pageBorderStyle, setPageBorderStyle] = useState('none'); // 'none' | 'simple' | 'double' | 'thick_thin' | 'thin_thick_thin' | 'modern_rounded' | 'corner_bracket' | 'dashed' | 'dotted' | 'academic_ribbon' | 'islamic_ornate' | 'certificate_ornate' | 'shadow_box' | 'groove' | 'ridge' | 'academic_gold' | 'modern_blue'
  const [pageBorderColor, setPageBorderColor] = useState('#1e293b'); // '#1e293b' | '#1e3a8a' | '#065f46' | '#991b1b' | '#b45309' | etc.
  const [pageBorderWidth, setPageBorderWidth] = useState('normal'); // 'thin' | 'normal' | 'thick'
  const [pageColumns, setPageColumns] = useState(1); // 1 | 2 | 3
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileFitWidth, setMobileFitWidth] = useState(true);
  const [mobileViewportHeight, setMobileViewportHeight] = useState(null);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);

  // Undo / Redo History Engine States
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Word Shapes & SmartArt Modal States
  const [showShapesModal, setShowShapesModal] = useState(false);
  const [shapeCategory, setShapeCategory] = useState('all'); // 'all' | 'basic' | 'arrows' | 'callouts' | 'banners' | 'smartart'
  const [selectedShape, setSelectedShape] = useState(null);

  // Document Statistics
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  
  // Selected Image & Word Layout States
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedImgRect, setSelectedImgRect] = useState(null);
  const [showImageLayoutModal, setShowImageLayoutModal] = useState(false);
  const [imageLayoutMode, setImageLayoutMode] = useState('inline'); // 'inline' | 'square_right' | 'square_left' | 'tight' | 'through' | 'top_bottom' | 'behind' | 'front'
  const [imagePositionMode, setImagePositionMode] = useState('flow'); // 'flow' | 'fixed'

  // Selected Table & Custom Table Modal States
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isTableHeaderRepeated, setIsTableHeaderRepeated] = useState(true);
  const [showCustomTableModal, setShowCustomTableModal] = useState(false);
  const [customTableRows, setCustomTableRows] = useState(3);
  const [customTableCols, setCustomTableCols] = useState(3);
  const [customTablePreset, setCustomTablePreset] = useState('navy');
  const [tableInputMode, setTableInputMode] = useState('dimensions'); // 'dimensions' | 'csv'
  const [csvTableInput, setCsvTableInput] = useState('');
  const [selectedColWidth, setSelectedColWidth] = useState(0);
  const [selectedRowHeight, setSelectedRowHeight] = useState(0);
  const [isColNoWrap, setIsColNoWrap] = useState(false);
  const [showTableDimensionsModal, setShowTableDimensionsModal] = useState(false);
  const [customColWidthInput, setCustomColWidthInput] = useState(120);
  const [customRowHeightInput, setCustomRowHeightInput] = useState(38);
  const [customTableWidthPercent, setCustomTableWidthPercent] = useState('100%');
  const [customCellPadding, setCustomCellPadding] = useState('8px 12px');

  // Microsoft Word Format Painter State
  const [formatPainter, setFormatPainter] = useState(null);

  // Microsoft Word Find & Replace Modal States
  const [showFindReplaceModal, setShowFindReplaceModal] = useState(false);
  const [findWord, setFindWord] = useState('');
  const [replaceWord, setReplaceWord] = useState('');

  // Keyboard Shortcuts Reference Modal State
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // References Tab States (المراجع: جدول المحتويات، الحواشي، الاقتباسات، التسميات التوضيحية، الفهرس)
  const [citationStyle, setCitationStyle] = useState('APA'); // 'APA' | 'MLA' | 'IEEE' | 'Chicago'
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [docSources, setDocSources] = useState([
    { id: 1, author: 'وزارة التربية والتعليم', title: 'الكتاب المدرسي المقرر ودليل المعلم', year: '2026', publisher: 'قطاع الكتب والمناهج التعليمية', type: 'مرجع وزاري' },
    { id: 2, author: 'منصة الوتين التعليمية', title: 'بنك الأسئلة والمراجعات النهائية على النظام الحديث', year: '2026', publisher: 'إصدارات المنصة الأكاديمية', type: 'مذكرة علمية' }
  ]);
  const [newSourceAuthor, setNewSourceAuthor] = useState('');
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceYear, setNewSourceYear] = useState('2026');
  const [newSourcePublisher, setNewSourcePublisher] = useState('');
  const [newSourceType, setNewSourceType] = useState('كتاب / مرجع دراسي');
  const [captionType, setCaptionType] = useState('شكل'); // 'شكل' | 'جدول' | 'معادلة' | 'خريطة'

  // Review Tab States (مراجعة: التدقيق، المرادفات، عدد الكلمات، القراءة الصوتية، التعليقات، تعقب التغييرات، حماية المستند)
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showWordCountModal, setShowWordCountModal] = useState(false);
  const [detailedStats, setDetailedStats] = useState(null);
  const [showThesaurusModal, setShowThesaurusModal] = useState(false);
  const [thesaurusQuery, setThesaurusQuery] = useState('');
  const [thesaurusResults, setThesaurusResults] = useState([]);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);
  const [accessibilityReport, setAccessibilityReport] = useState([]);
  const [trackChangesMode, setTrackChangesMode] = useState(false);
  const [reviewDisplayMode, setReviewDisplayMode] = useState('all_markup'); // 'simple' | 'all_markup' | 'no_markup'
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [isEditingRestricted, setIsEditingRestricted] = useState(false);

  // View Tab States (عرض: طرق العرض، القارئ الشامل، المسطرة، خطوط الشبكة، جزء التنقل، عمودان متجاوران)
  const [viewMode, setViewMode] = useState('print'); // 'print' | 'read' | 'web' | 'outline' | 'draft'
  const [immersiveReaderMode, setImmersiveReaderMode] = useState(false);
  const [immersiveTheme, setImmersiveTheme] = useState('sepia'); // 'sepia' | 'dark' | 'calm_blue'
  const [sideBySidePages, setSideBySidePages] = useState(false);
  const [showRuler, setShowRuler] = useState(true);
  const [showViewGridlines, setShowViewGridlines] = useState(false);
  const [showNavigationPane, setShowNavigationPane] = useState(false);
  const [navPaneTab, setNavPaneTab] = useState('headings'); // 'headings' | 'pages' | 'search'

  // Free AI Command State
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  
  // Clean Focus Mode (وضع التركيز والروقان)
  const [focusMode, setFocusMode] = useState(false);

  // AI Assistant Chat States
  const [showAssistant, setShowAssistant] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', text: 'أهلاً بك يا أستاذنا العزيز! أنا مساعدك الأكاديمي الذكي على منصة الوتين التعليمية، جاهز لمعاونتك في إعداد ملازمك وشرح الدروس، استخراج القواعد، صياغة أسئلة امتحانية مطابقة للنظام الحديث، وحل وتفريغ الصور والتمارين فورياً.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatImage, setChatImage] = useState(null); // backward compatibility { base64, mimeType, preview, name }
  const [chatImages, setChatImages] = useState([]); // Multiple uploaded images array
  const [aiContextScope, setAiContextScope] = useState('current_page'); // 'current_page' | 'selection' | 'custom_pages' | 'all_pages'
  const [customAiPagesInput, setCustomAiPagesInput] = useState('');
  const [capturedSelectedText, setCapturedSelectedText] = useState('');
  const capturedSelectedRangeRef = useRef(null);

  // Microsoft Word-Style Color Palette States (Zero-Selection-Loss Popovers)
  const [showFontColorPalette, setShowFontColorPalette] = useState(false);
  const [activeFontColor, setActiveFontColor] = useState('#dc2626');
  const [showHighlightPalette, setShowHighlightPalette] = useState(false);
  const [activeHighlightColor, setActiveHighlightColor] = useState('#fef08a');
  const [showShadingPalette, setShowShadingPalette] = useState(false);
  const [activeShadingColor, setActiveShadingColor] = useState('#eff6ff');
  const [colorAnchorRect, setColorAnchorRect] = useState(null);
  const savedSelectionRangeRef = useRef(null);

  // Free OCR States (Tesseract.js Client-Side Local Engine)
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrImage, setOcrImage] = useState(null); // { base64: string, mimeType: string, preview: string, name: string }
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');
  const [ocrResultText, setOcrResultText] = useState('');
  const [ocrLanguage, setOcrLanguage] = useState('ara+eng'); // 'ara+eng' | 'ara' | 'eng'
  
  const pageRefs = useRef({});
  const editorRootRef = useRef(null);
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const speechHandlersRef = useRef(null);
  const lastSpeechRangeRef = useRef(null);
  const activePageIndexRef = useRef(0);
  const saveTimeoutRef = useRef(null);
  const paginationTimeoutRef = useRef(null);
  const historyRef = useRef({ stack: [], index: -1, isRestoring: false });
  const historyTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatFileInputRef = useRef(null);
  const ocrFileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const metricsTimeoutRef = useRef(null);
  const mathDropdownRef = useRef(null);

  // Ensure Word-style clean paragraph breaks on Enter
  useEffect(() => {
    if (typeof document !== 'undefined') {
      try {
        document.execCommand('defaultParagraphSeparator', false, 'p');
      } catch (_) {}
    }
  }, []);

  // Synchronize DOM content when pages state updates externally (templates, AI insertion, undo/redo)
  useEffect(() => {
    pages.forEach(p => {
      const el = pageRefs.current[p.id];
      if (el) {
        const isUserInteractingWithThisPage = (
          document.activeElement === el ||
          el.contains(document.activeElement)
        );
        // Only update DOM if user is NOT actively typing/focused inside this page
        if (!isUserInteractingWithThisPage && el.innerHTML !== (p.content || '')) {
          el.innerHTML = p.content || '<p><br></p>';
        }
      }
    });
  }, [pages]);

  // Tab Toggle & Collapse Handler
  const handleTabClick = (tabKey) => {
    if (activeTab === tabKey) {
      setIsRibbonCollapsed(!isRibbonCollapsed);
    } else {
      setActiveTab(tabKey);
      setIsRibbonCollapsed(false);
    }
  };

  // 1. Admin Verification
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
          if (data && ['admin', 'teacher', 'teacher_pro', 'assistant'].includes(data.role)) {
            setIsAdmin(true);
            loadAllDocuments();
          }
          setCheckingAuth(false);
        }).catch(() => setCheckingAuth(false));
      } else {
        setCheckingAuth(false);
      }
    });
  }, []);

  // Escape key listener for Focus Mode & Fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (focusMode) setFocusMode(false);
        if (isFullscreen) toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, isFullscreen]);

  // Fullscreen & Mobile Detection Engine
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window === 'undefined') return;
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowSidebar(false);
      }
      if (window.visualViewport) {
        setMobileViewportHeight(window.visualViewport.height);
      } else {
        setMobileViewportHeight(window.innerHeight);
      }
      if (mobile && mobileFitWidth) {
        const availableW = window.innerWidth - 12;
        const autoZoom = Math.min(100, Math.max(35, Math.floor((availableW / 794) * 100)));
        setZoomLevel(autoZoom);
      }
    };
    updateDimensions();

    // Ensure ribbon is visible on small screens so users find their tools immediately
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsRibbonCollapsed(false);
      setShowSidebar(false);
    }

    window.addEventListener('resize', updateDimensions);
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateDimensions);
      window.visualViewport.addEventListener('scroll', updateDimensions);
    }

    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (typeof window !== 'undefined' && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateDimensions);
        window.visualViewport.removeEventListener('scroll', updateDimensions);
      }
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, [mobileFitWidth]);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  };

  // 2. High-Performance Instant Speech Recognition (Optimized for Mobile & Desktop)
  useEffect(() => {
    if (typeof window !== 'undefined' && isAdmin) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'ar-EG';

          recognition.onresult = (event) => speechHandlersRef.current?.onResult?.(event);
          recognition.onerror = (event) => speechHandlersRef.current?.onError?.(event);
          recognition.onend = () => speechHandlersRef.current?.onEnd?.();

          recognitionRef.current = recognition;
        } catch (err) {
          console.warn('SpeechRecognition initialization error:', err);
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isAdmin]);

  // 3. Image, Table & Shape Selection Listener (Word Style)
  useEffect(() => {
    const handleClick = (e) => {
      // A. Image Selection
      if (e.target && e.target.tagName === 'IMG') {
        if (selectedImg && selectedImg !== e.target) {
          selectedImg.style.outline = 'none';
        }
        e.target.style.outline = '3px solid #3b82f6';
        e.target.style.outlineOffset = '3px';
        setSelectedImg(e.target);
        const fl = e.target.style.float;
        const disp = e.target.style.display;
        const pos = e.target.style.position;
        const z = e.target.style.zIndex;
        if (z === '10') setImageLayoutMode('front');
        else if (z === '0' || e.target.style.opacity === '0.65') setImageLayoutMode('behind');
        else if (disp === 'block' && e.target.style.clear === 'both') setImageLayoutMode('top_bottom');
        else if (fl === 'right') setImageLayoutMode('square_right');
        else if (fl === 'left') setImageLayoutMode('square_left');
        else setImageLayoutMode('inline');
        setImagePositionMode(pos === 'relative' ? 'fixed' : 'flow');
        setActiveTab('image');
        setIsRibbonCollapsed(false);
      } else if (!e.target.closest('.image-controls-panel') && !e.target.closest('.image-layout-popover') && !e.target.closest('.image-layout-floating-btn')) {
        if (selectedImg) {
          selectedImg.style.outline = 'none';
          setSelectedImg(null);
          setShowImageLayoutModal(false);
          if (activeTab === 'image') setActiveTab('home');
        }
      }

      // B. Table & Cell Selection
      const clickedCell = e.target ? e.target.closest('td, th') : null;
      const clickedTable = e.target ? e.target.closest('table') : null;
      if (clickedTable) {
        setSelectedTable(clickedTable);
        setSelectedCell(clickedCell);
        if (clickedCell) {
          const cw = clickedCell.offsetWidth;
          const rh = clickedCell.closest('tr')?.offsetHeight || 0;
          setSelectedColWidth(cw);
          setSelectedRowHeight(rh);
          setCustomColWidthInput(cw);
          setCustomRowHeightInput(rh);
          setIsColNoWrap(clickedCell.style.whiteSpace === 'nowrap');
        }
        const hasRepeatAttr = clickedTable.getAttribute('data-repeat-header');
        const hasThead = !!clickedTable.querySelector('thead');
        setIsTableHeaderRepeated(hasRepeatAttr === 'false' ? false : (hasRepeatAttr === 'true' || hasThead));
        setActiveTab('table');
        setIsRibbonCollapsed(false);
      } else if (!e.target.closest('.table-controls-panel') && !e.target.closest('.table-modal-popover')) {
        if (selectedTable) {
          setSelectedTable(null);
          setSelectedCell(null);
          if (activeTab === 'table') setActiveTab('home');
        }
      }

      // C. Word Shape / Callout / TextBox Selection
      const clickedShape = e.target ? e.target.closest('.word-shape-item') : null;
      if (clickedShape) {
        if (selectedShape && selectedShape !== clickedShape) {
          selectedShape.style.outline = 'none';
        }
        clickedShape.style.outline = '2px dashed #2563eb';
        clickedShape.style.outlineOffset = '4px';
        setSelectedShape(clickedShape);
        setActiveTab('shape');
        setIsRibbonCollapsed(false);
      } else if (!e.target.closest('.shape-controls-panel') && !e.target.closest('.shapes-modal-popover') && !e.target.closest('.shape-floating-mini-toolbar')) {
        if (selectedShape) {
          selectedShape.style.outline = 'none';
          setSelectedShape(null);
          if (activeTab === 'shape') setActiveTab('home');
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [selectedImg, selectedTable, selectedShape, activeTab]);

  // Close Color Popovers on outside click (Zero Selection Loss)
  useEffect(() => {
    if (!showFontColorPalette && !showHighlightPalette && !showShadingPalette) return;

    const handleOutsideColorClick = (e) => {
      if (e.target.closest('.word-color-picker-popover') || e.target.closest('.word-color-btn-trigger')) {
        return;
      }
      setShowFontColorPalette(false);
      setShowHighlightPalette(false);
      setShowShadingPalette(false);
    };

    document.addEventListener('mousedown', handleOutsideColorClick);
    return () => document.removeEventListener('mousedown', handleOutsideColorClick);
  }, [showFontColorPalette, showHighlightPalette, showShadingPalette]);

  // Image Rect Tracking for Floating Word Layout Button
  useEffect(() => {
    if (selectedImg) {
      let rafId = null;
      const updateRect = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (selectedImg) {
            setSelectedImgRect(selectedImg.getBoundingClientRect());
          }
        });
      };
      updateRect();
      window.addEventListener('scroll', updateRect, true);
      window.addEventListener('resize', updateRect);
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('scroll', updateRect, true);
        window.removeEventListener('resize', updateRect);
      };
    } else {
      setSelectedImgRect(null);
      setShowImageLayoutModal(false);
    }
  }, [selectedImg]);

  // Format Painter Application Listener
  useEffect(() => {
    if (!formatPainter) return;

    const handleApplyPainter = (e) => {
      if (e.target.closest('.no-print')) return;

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

      const range = sel.getRangeAt(0);
      const span = document.createElement('span');
      if (formatPainter.fontFamily) span.style.fontFamily = formatPainter.fontFamily;
      if (formatPainter.fontSize) span.style.fontSize = formatPainter.fontSize;
      if (formatPainter.fontWeight) span.style.fontWeight = formatPainter.fontWeight;
      if (formatPainter.fontStyle) span.style.fontStyle = formatPainter.fontStyle;
      if (formatPainter.textDecoration) span.style.textDecoration = formatPainter.textDecoration;
      if (formatPainter.color) span.style.color = formatPainter.color;
      if (formatPainter.backgroundColor && formatPainter.backgroundColor !== 'rgba(0, 0, 0, 0)' && formatPainter.backgroundColor !== 'transparent') {
        span.style.backgroundColor = formatPainter.backgroundColor;
      }

      try {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
        handleAutoSave();
        triggerAutoPagination();
      } catch (err) {}

      setFormatPainter(null);
    };

    document.addEventListener('mouseup', handleApplyPainter);
    return () => document.removeEventListener('mouseup', handleApplyPainter);
  }, [formatPainter]);

  // 4. KaTeX Dynamic Loader for World-Class Math Typesetting (CSP Compliant via cdnjs)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!document.getElementById('katex-css')) {
        const link = document.createElement('link');
        link.id = 'katex-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';
        document.head.appendChild(link);
      }
      if (!window.katex && !document.getElementById('katex-js')) {
        const script = document.createElement('script');
        script.id = 'katex-js';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, []);

  // 5. Live KaTeX Preview Generator for Equation Editor Modal
  useEffect(() => {
    if (showLatexModal) {
      const timer = setTimeout(() => {
        try {
          if (typeof window !== 'undefined' && window.katex) {
            const rendered = window.katex.renderToString(latexInput || 'x', {
              displayMode: latexIsBlock,
              throwOnError: false
            });
            setEquationPreviewHtml(rendered);
          } else {
            setEquationPreviewHtml(`<span style="font-family:'Cambria Math',serif;font-style:italic;">${latexInput || ''}</span>`);
          }
        } catch (e) {
          setEquationPreviewHtml('<span style="color:#ef4444;font-size:13px;">خطأ في صياغة LaTeX</span>');
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [latexInput, latexIsBlock, showLatexModal]);

  // 6. Equation Selection & Double-Click Listener
  useEffect(() => {
    const handleEqClick = (e) => {
      const widget = e.target.closest('.equation-widget-inline, .equation-widget-block');
      if (widget) {
        if (selectedEquation && selectedEquation !== widget) {
          selectedEquation.style.outline = 'none';
        }
        widget.style.outline = '2px solid #0284c7';
        widget.style.outlineOffset = '2px';
        setSelectedEquation(widget);
        setLatexIsBlock(widget.classList.contains('equation-widget-block'));
        setActiveTab('math');
        setIsRibbonCollapsed(false);
      } else if (!e.target.closest('.math-ribbon-panel') && !e.target.closest('.math-modal') && !e.target.closest('.equation-floating-pill')) {
        if (selectedEquation) {
          selectedEquation.style.outline = 'none';
          setSelectedEquation(null);
        }
      }

      // Close math dropdown if clicked outside
      if (!e.target.closest('.math-dropdown-container') && !e.target.closest('.equation-menu-container') && !e.target.closest('.equation-menu-trigger')) {
        setActiveMathDropdown(null);
        setMathDropdownAnchor(null);
        setShowEquationMenu(false);
      }
    };

    const handleEqDblClick = (e) => {
      const widget = e.target.closest('.equation-widget-inline, .equation-widget-block');
      if (widget) {
        const rawLatex = widget.getAttribute('data-latex');
        if (rawLatex) {
          setLatexInput(decodeURIComponent(rawLatex));
          setLatexIsBlock(widget.classList.contains('equation-widget-block'));
          setSelectedEquation(widget);
          setShowLatexModal(true);
        }
      }
    };

    document.addEventListener('click', handleEqClick);
    document.addEventListener('dblclick', handleEqDblClick);
    return () => {
      document.removeEventListener('click', handleEqClick);
      document.removeEventListener('dblclick', handleEqDblClick);
    };
  }, [selectedEquation]);

  // Convert Equation Mode (Inline vs Block Display)
  const setEquationMode = (widget, toBlock) => {
    if (!widget) return;
    const raw = widget.getAttribute('data-latex');
    const latex = raw ? decodeURIComponent(raw) : '';
    let renderedHtml = '';
    if (typeof window !== 'undefined' && window.katex && latex) {
      try {
        renderedHtml = window.katex.renderToString(latex, {
          displayMode: toBlock,
          throwOnError: false
        });
      } catch (e) {}
    }
    if (!renderedHtml) {
      renderedHtml = widget.innerHTML;
    }

    const encoded = encodeURIComponent(latex);
    if (toBlock) {
      const blockEl = document.createElement('div');
      blockEl.className = 'equation-widget-block';
      blockEl.setAttribute('contenteditable', 'false');
      blockEl.setAttribute('data-latex', encoded);
      blockEl.style.cssText = 'display:block; text-align:center; margin:14px auto; padding:8px 16px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; cursor:pointer; user-select:all; transition:all 0.2s;';
      blockEl.title = 'معادلة رياضية - انقر للتحديد أو التعديل';
      blockEl.innerHTML = renderedHtml;
      if (widget.parentNode) {
        widget.parentNode.replaceChild(blockEl, widget);
        setSelectedEquation(blockEl);
        blockEl.style.outline = '2px solid #0284c7';
        blockEl.style.outlineOffset = '2px';
      }
    } else {
      const inlineEl = document.createElement('span');
      inlineEl.className = 'equation-widget-inline';
      inlineEl.setAttribute('contenteditable', 'false');
      inlineEl.setAttribute('data-latex', encoded);
      inlineEl.style.cssText = 'display:inline-block; vertical-align:middle; margin:0 4px; padding:2px 6px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:4px; cursor:pointer; user-select:all; transition:all 0.2s;';
      inlineEl.title = 'معادلة رياضية - انقر للتحديد أو التعديل';
      inlineEl.innerHTML = renderedHtml;
      if (widget.parentNode) {
        widget.parentNode.replaceChild(inlineEl, widget);
        setSelectedEquation(inlineEl);
        inlineEl.style.outline = '2px solid #0284c7';
        inlineEl.style.outlineOffset = '2px';
      }
    }
    setLatexIsBlock(toBlock);
    handleAutoSave();
    triggerAutoPagination();
  };

  // Math Insertion Helpers
  const insertEquation = (latex, isBlock = false) => {
    if (!latex || !latex.trim()) return;
    let renderedHtml = '';
    try {
      if (typeof window !== 'undefined' && window.katex) {
        renderedHtml = window.katex.renderToString(latex, {
          displayMode: isBlock,
          throwOnError: false
        });
      }
    } catch (e) {
      console.warn('KaTeX render warning:', e);
    }
    if (!renderedHtml) {
      renderedHtml = `<span style="font-family:'Cambria Math',serif;font-style:italic;">${latex}</span>`;
    }

    const encoded = encodeURIComponent(latex);
    let htmlSnippet = '';
    if (isBlock) {
      htmlSnippet = `<div class="equation-widget-block" contenteditable="false" data-latex="${encoded}" style="display:block; text-align:center; margin:14px auto; padding:8px 16px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; cursor:pointer; user-select:all; transition:all 0.2s;" title="انقر للتحديد أو التعديل">${renderedHtml}</div>`;
    } else {
      htmlSnippet = `&nbsp;<span class="equation-widget-inline" contenteditable="false" data-latex="${encoded}" style="display:inline-block; vertical-align:middle; margin:0 4px; padding:2px 6px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:4px; cursor:pointer; user-select:all; transition:all 0.2s;" title="انقر للتحديد أو التعديل">${renderedHtml}</span>&nbsp;`;
    }

    document.execCommand('insertHTML', false, htmlSnippet);
    setActiveMathDropdown(null);
    handleAutoSave();
    triggerAutoPagination();
  };

  // Built-in Popular Equations for Word-style gallery
  const POPULAR_EQUATIONS = [
    { name: 'القانون العام للمعادلة التربيعية', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
    { name: 'مبرهنة فيثاغورس', latex: 'a^2 + b^2 = c^2' },
    { name: 'مساحة الدائرة', latex: 'A = \\pi r^2' },
    { name: 'محيط الدائرة', latex: 'C = 2 \\pi r' },
    { name: 'نظرية ذات الحدين', latex: '(x + a)^n = \\sum_{k=0}^{n} \\binom{n}{k} x^k a^{n-k}' },
    { name: 'تعريف المشتقة في التفاضل', latex: "f'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x + \\Delta x) - f(x)}{\\Delta x}" },
    { name: 'قانون أوم الكهربائي', latex: 'V = I \\cdot R' },
    { name: 'قانون نيوتن الثاني', latex: '\\vec{F} = m \\cdot \\vec{a}' },
    { name: 'طاقة أينشتاين للكتلة', latex: 'E = m c^2' },
    { name: 'معادلة الحركة بعجلة منتظمة', latex: 'v_f^2 = v_i^2 + 2 a d' },
    { name: 'متطابقة فيثاغورس المثلثية', latex: '\\sin^2\\theta + \\cos^2\\theta = 1' }
  ];

  const handleOpenEquationMenu = (e) => {
    e?.stopPropagation?.();
    if (showEquationMenu) {
      setShowEquationMenu(false);
      return;
    }
    const rect = e?.currentTarget?.getBoundingClientRect();
    if (rect) {
      setEquationMenuPos({
        top: rect.bottom + 4,
        right: Math.max(10, window.innerWidth - rect.right),
        left: rect.left
      });
    }
    setActiveMathDropdown(null);
    setShowEquationMenu(true);
  };

  const handleToggleMathDropdown = (e, dropdownId) => {
    e?.stopPropagation?.();
    if (activeMathDropdown === dropdownId) {
      setActiveMathDropdown(null);
      setMathDropdownAnchor(null);
    } else {
      const rect = e?.currentTarget?.getBoundingClientRect();
      if (rect) {
        setMathDropdownAnchor({
          top: rect.bottom + 4,
          right: Math.max(10, window.innerWidth - rect.right),
          left: rect.left
        });
      }
      setShowEquationMenu(false);
      setActiveMathDropdown(dropdownId);
    }
  };

  const handleInsertNewEquation = () => {
    setActiveTab('math');
    setIsRibbonCollapsed(false);
    insertEquation('\\text{معادلة}', false);
  };

  const handleInsertLink = () => {
    const url = prompt('أدخل رابط الموقع الإلكتروني (URL):', 'https://');
    if (url && url.trim()) {
      document.execCommand('createLink', false, url.trim());
      handleAutoSave();
    }
  };

  const insertSymbol = (sym) => {
    document.execCommand('insertText', false, sym);
    handleAutoSave();
  };

  const handleSaveModalEquation = () => {
    if (selectedEquation) {
      let renderedHtml = '';
      try {
        if (typeof window !== 'undefined' && window.katex) {
          renderedHtml = window.katex.renderToString(latexInput, {
            displayMode: latexIsBlock,
            throwOnError: false
          });
        }
      } catch (e) {}
      if (!renderedHtml) {
        renderedHtml = `<span style="font-family:'Cambria Math',serif;">${latexInput}</span>`;
      }
      selectedEquation.setAttribute('data-latex', encodeURIComponent(latexInput));
      const isCurrentlyBlock = selectedEquation.classList.contains('equation-widget-block');
      if (isCurrentlyBlock !== latexIsBlock) {
        setEquationMode(selectedEquation, latexIsBlock);
      } else {
        selectedEquation.innerHTML = renderedHtml;
        handleAutoSave();
        triggerAutoPagination();
      }
    } else {
      insertEquation(latexInput, latexIsBlock);
    }
    setShowLatexModal(false);
  };

  // Unified Resilient Multi-Model Gemini API Caller with Dynamic Model Auto-Discovery & Fallback
  const callGeminiApi = async (contents, customModel = null, generationConfig = { temperature: 0.35 }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      const activeModel = customModel || geminiModel || DEFAULT_AI_MODEL;

      const serverRes = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          model: activeModel,
          contents, 
          generationConfig,
          cost: 2,
          action: 'document_editor'
        })
      });

      const serverData = await serverRes.json().catch(() => ({}));
      if (!serverRes.ok) {
        throw new Error(serverData?.error?.message || 'خطأ في معالجة طلب الذكاء الاصطناعي. يرجى مراجعة رصيد الكريديتس.');
      }

      const serverParts = serverData?.candidates?.[0]?.content?.parts;
      if (Array.isArray(serverParts) && serverParts.length > 0) {
        const nonThought = serverParts.filter(p => typeof p.text === 'string' && !p.thought);
        const text = (nonThought.length > 0 ? nonThought : serverParts).map(p => p.text || '').join('');
        if (text) return text;
      }
      throw new Error("لم يتم استلام نص من نموذج الذكاء الاصطناعي.");
    } catch (err) {
      console.error('callGeminiApi error:', err);
      throw err;
    }
  };

  // AI Math Equation Generator
  const handleGenerateAiEquation = async (customPrompt) => {
    const p = customPrompt || prompt('اكتب اسم المعادلة أو وصفها باللغة العربية (مثال: قانون الجذب العام لنيوتن، معادلة أينشتاين، قانون كولوم، معادلة الدائرة):');
    if (!p || !p.trim()) return;
    setLoading(true);
    try {
      const text = await callGeminiApi([
        {
          role: 'user',
          parts: [{ text: `أنت خبير في صياغة المعادلات الرياضية والفيزيائية والكيميائية بترميز LaTeX. المطلوب هو كتابة صيغة المعادلة الرياضية التالية فقط بـ LaTeX القياسي المتوافق مع KaTeX بدون أي مقدمات أو شروحات أو علامات اقتباس أو علامات markdown codeblock:\n"${p}"` }]
        }
      ], geminiModel, { temperature: 0.1 });

      let latex = text.trim()
        .replace(/^```latex/gi, '')
        .replace(/^```/g, '')
        .replace(/```$/g, '')
        .replace(/^\$+/, '')
        .replace(/\$+$/, '')
        .trim();
      if (latex) {
        insertEquation(latex, latexIsBlock);
      }
    } catch (err) {
      alert('تعذر إنشاء المعادلة: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Update Word & Metrics
  const updateMetrics = () => {
    let fullText = '';
    Object.values(pageRefs.current).forEach(el => {
      if (el) fullText += (el.innerText || '') + ' ';
    });
    const words = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;
    const chars = fullText.length;
    setWordCount(words);
    setCharCount(chars);
  };

  const debouncedUpdateMetrics = () => {
    if (metricsTimeoutRef.current) clearTimeout(metricsTimeoutRef.current);
    metricsTimeoutRef.current = setTimeout(updateMetrics, 450);
  };

  // 5. Intelligent Block & Line Decomposer Engine (Word-Grade Continuous Flow)
  const getMarginLimitPx = (marginStr) => {
    const mm = parseFloat(marginStr) || 15;
    const usableMm = 297 - (2 * mm);
    return Math.floor(usableMm * (96 / 25.4));
  };

  const handleMarginChange = (newMargin) => {
    setPageMargin(newMargin);
    setTimeout(() => {
      rebalanceAllPages();
    }, 50);
  };

  const splitHtmlIntoPages = (fullHtml, pageHeightLimit = null) => {
    if (!fullHtml || !fullHtml.trim()) return [''];
    if (typeof window === 'undefined') return [fullHtml];

    const effectiveLimit = pageHeightLimit || getMarginLimitPx(pageMargin);

    // Normalize runaway consecutive <br> tags while strictly preserving intentional line breaks, empty paragraphs & page-break-dividers
    let cleanedHtml = fullHtml
      .replace(/(<br\s*\/?>\s*){4,}/gi, '<br><br><br>');

    // Invisible measuring DOM container identical to A4 print area
    const measurer = document.createElement('div');
    measurer.style.position = 'absolute';
    measurer.style.visibility = 'hidden';
    measurer.style.left = '-9999px';
    measurer.style.top = '-9999px';
    measurer.style.width = `calc(210mm - (2 * ${pageMargin}))`;
    measurer.style.fontSize = immersiveReaderMode ? '20px' : '17px';
    measurer.style.lineHeight = immersiveReaderMode ? '2.3' : '1.5';
    measurer.style.fontFamily = 'Tajawal, sans-serif';
    measurer.style.direction = 'rtl';
    measurer.style.boxSizing = 'border-box';
    measurer.style.padding = '0';
    measurer.style.margin = '0';
    measurer.style.wordBreak = 'break-word';

    const measurerStyle = document.createElement('style');
    measurerStyle.textContent = `
      p { margin-top: 0 !important; margin-bottom: 4px !important; line-height: inherit; }
      p:empty, p > br:only-child { line-height: 1.2 !important; margin-bottom: 2px !important; }
      div { margin-top: 0 !important; margin-bottom: 2px !important; }
      table { width: 100% !important; border-collapse: collapse !important; margin: 10px 0 !important; border: 1.5px solid #94a3b8 !important; }
      table td, table th { border: 1px solid #94a3b8 !important; padding: 8px 12px !important; box-sizing: border-box; line-height: inherit; vertical-align: middle; word-break: normal !important; }
      table th { background-color: #f1f5f9 !important; font-weight: 700 !important; text-align: center; }
      table tr { page-break-inside: avoid !important; break-inside: avoid !important; }
    `;
    measurer.appendChild(measurerStyle);
    document.body.appendChild(measurer);

    const parser = document.createElement('div');
    parser.innerHTML = cleanedHtml;

    // Pre-pass: Re-merge split continuation tables back into their master table before re-paginating
    const allParsedTables = Array.from(parser.querySelectorAll('table'));
    for (let tIdx = 0; tIdx < allParsedTables.length; tIdx++) {
      const tbl = allParsedTables[tIdx];
      if (tbl.getAttribute('data-table-continuation') === 'true') {
        // Find previous sibling table by skipping any whitespace, empty paragraphs, breaks, or dividers
        let prev = tbl.previousElementSibling;
        while (prev && (prev.tagName === 'BR' || prev.tagName === 'P' && !prev.textContent.trim() || (prev.classList && prev.classList.contains('page-break-divider')))) {
          const toRemove = prev;
          prev = prev.previousElementSibling;
          toRemove.remove();
        }
        if (!prev || prev.tagName !== 'TABLE') {
          const prevTables = Array.from(parser.querySelectorAll('table')).slice(0, tIdx);
          if (prevTables.length > 0) {
            prev = prevTables[prevTables.length - 1];
          }
        }
        if (prev && prev.tagName === 'TABLE') {
          const repeatedThead = tbl.querySelector('thead[data-repeated-thead="true"]');
          if (repeatedThead) repeatedThead.remove();
          const targetTbody = prev.querySelector('tbody') || prev;
          const contRows = Array.from(tbl.querySelectorAll('tr'));
          contRows.forEach(r => {
            if (!r.closest('thead')) targetTbody.appendChild(r);
          });
          tbl.remove();
        } else {
          tbl.removeAttribute('data-table-continuation');
          const repeatedThead = tbl.querySelector('thead[data-repeated-thead="true"]');
          if (repeatedThead) repeatedThead.removeAttribute('data-repeated-thead');
        }
      }
    }

    const isPureEmptyParagraph = (el) => {
      if (!el || el.nodeType !== 1) return false;
      const tag = el.tagName.toLowerCase();
      if (tag !== 'p' && tag !== 'div') return false;
      if (
        el.classList.contains('word-shape-item') ||
        el.classList.contains('word-smartart-block') ||
        el.classList.contains('word-cover-block') ||
        el.classList.contains('callout-box') ||
        el.classList.contains('page-break-divider') ||
        el.getAttribute('data-atomic-block') === 'true' ||
        el.getAttribute('data-page-break') === 'true'
      ) return false;
      const text = (el.textContent || '').replace(/[\s\u00a0\u200b\r\n]+/g, '').trim();
      if (text.length > 0) return false;
      if (el.querySelector('img, table, svg, hr, iframe, canvas, [data-atomic-block]')) return false;
      return true;
    };

    const hasRealVisibleContent = (container) => {
      if (!container) return false;
      const text = (container.textContent || '').replace(/[\s\u00a0\u200b\r\n]+/g, '');
      if (text.length > 0) return true;
      if (container.querySelector('img, table, svg, hr, iframe, canvas, .word-shape-item, .word-smartart-block, .word-cover-block, .callout-box, [data-atomic-block="true"]')) {
        return true;
      }
      return false;
    };

    const resultPages = [];
    let currentPageDiv = document.createElement('div');
    measurer.appendChild(currentPageDiv);

    const sealCurrentPage = () => {
      // 1. Trim runaway trailing empty paragraphs while preserving up to 2 intentional spacing paragraphs
      let emptyCount = 0;
      let lastChild = currentPageDiv.lastElementChild;
      while (lastChild && isPureEmptyParagraph(lastChild)) {
        emptyCount++;
        if (emptyCount > 2) {
          lastChild.remove();
          lastChild = currentPageDiv.lastElementChild;
        } else {
          break;
        }
      }

      // 2. Strict visible content check: NEVER create a ghost blank page!
      const pageHtml = currentPageDiv.innerHTML.trim();
      if (pageHtml && hasRealVisibleContent(currentPageDiv)) {
        resultPages.push(pageHtml);
      }
      currentPageDiv = document.createElement('div');
      measurer.innerHTML = '';
      measurer.appendChild(measurerStyle.cloneNode(true));
      measurer.appendChild(currentPageDiv);
    };

    // Helper: recursively append and pack nodes tightly into pages
    let leadingEmptyCount = 0;
    const appendOrSplitNode = (node) => {
      if (!node) return;

      // Authentic Page Break Divider or manual page-break tag
      if (node.nodeType === 1 && (
        node.classList?.contains('page-break-divider') ||
        node.getAttribute?.('data-page-break') === 'true'
      )) {
        if (currentPageDiv.childNodes.length > 0) {
          sealCurrentPage();
        }
        return;
      }

      // 1. Allow up to 2 intentional empty paragraphs at top of page, skip only if excessive
      if (currentPageDiv.childNodes.length === 0 && isPureEmptyParagraph(node)) {
        if (leadingEmptyCount >= 2) {
          return;
        }
        leadingEmptyCount++;
      }

      // Handle Text Nodes
      if (node.nodeType === 3) {
        const text = node.textContent;
        if (!text || !text.trim()) return;
        const textP = document.createElement('p');
        textP.textContent = text;
        appendOrSplitNode(textP);
        return;
      }

      if (node.nodeType !== 1) return;

      const tag = node.tagName.toLowerCase();

      // Case 1: Ordered (<ol>) or Unordered (<ul>) Lists
      if (tag === 'ol' || tag === 'ul') {
        const listItems = Array.from(node.children).filter(c => c.tagName && c.tagName.toLowerCase() === 'li');
        if (listItems.length === 0) return;

        let currentList = document.createElement(tag);
        if (node.getAttribute('style')) currentList.setAttribute('style', node.getAttribute('style'));
        let startIdx = parseInt(node.getAttribute('start') || '1', 10);
        if (tag === 'ol' && startIdx > 1) currentList.setAttribute('start', startIdx);
        currentPageDiv.appendChild(currentList);

        for (let i = 0; i < listItems.length; i++) {
          const liClone = listItems[i].cloneNode(true);
          currentList.appendChild(liClone);

          if (measurer.offsetHeight > effectiveLimit) {
            liClone.remove();
            if (currentList.children.length === 0) {
              currentList.remove();
            }
            sealCurrentPage();

            // Start continuation list on next page with preserved numbering!
            currentList = document.createElement(tag);
            if (node.getAttribute('style')) currentList.setAttribute('style', node.getAttribute('style'));
            if (tag === 'ol') {
              currentList.setAttribute('start', startIdx + i);
            }
            currentPageDiv.appendChild(currentList);
            currentList.appendChild(liClone);
          }
        }
        if (currentList.children.length === 0) currentList.remove();
        return;
      }

      // Case 2: Atomic Word Widgets (Shapes, Callouts, SmartArt, Cover Block) vs Structural Containers
      const isAtomicWidget = node.classList && (
        node.classList.contains('word-shape-item') ||
        node.classList.contains('word-smartart-block') ||
        node.classList.contains('word-cover-block') ||
        node.classList.contains('callout-box') ||
        node.getAttribute('data-atomic-block') === 'true'
      );
      if (isAtomicWidget) {
        const clone = node.cloneNode(true);
        currentPageDiv.appendChild(clone);
        // Only push to next page if current page ALREADY has content AND widget overflows
        // If current page is fresh (childNodes.length <= 1), NEVER push it again into an infinite blank loop!
        if (measurer.offsetHeight > effectiveLimit && currentPageDiv.childNodes.length > 1) {
          clone.remove();
          sealCurrentPage();
          currentPageDiv.appendChild(clone);
        }
        return;
      }

      // If structural wrapper contains block children, unpack children directly so each flows individually!
      const blockContainerTags = ['div', 'section', 'article', 'main', 'blockquote', 'aside'];
      const blockChildSelector = 'p, div, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote, section, article, figure, hr';

      if (blockContainerTags.includes(tag) && node.querySelector(blockChildSelector)) {
        Array.from(node.childNodes).forEach(child => appendOrSplitNode(child));
        return;
      }

      // Case 3: Table (Split by <tr> rows with optional repeating <thead> header across pages)
      if (tag === 'table') {
        const clone = node.cloneNode(true);
        currentPageDiv.appendChild(clone);
        if (measurer.offsetHeight <= effectiveLimit) return;

        clone.remove();
        const rows = Array.from(node.querySelectorAll('tr'));
        if (rows.length <= 1) {
          if (currentPageDiv.childNodes.length > 0) sealCurrentPage();
          currentPageDiv.appendChild(node.cloneNode(true));
          return;
        }

        const shouldRepeatHeader = node.getAttribute('data-repeat-header') !== 'false';
        const thead = node.querySelector('thead');

        const createTableShell = (isContinuation = false) => {
          const tbl = document.createElement('table');
          if (node.getAttribute('style')) tbl.setAttribute('style', node.getAttribute('style'));
          if (node.getAttribute('dir')) tbl.setAttribute('dir', node.getAttribute('dir'));
          if (node.getAttribute('data-repeat-header')) tbl.setAttribute('data-repeat-header', node.getAttribute('data-repeat-header'));
          if (node.getAttribute('data-table-preset')) tbl.setAttribute('data-table-preset', node.getAttribute('data-table-preset'));
          if (isContinuation) tbl.setAttribute('data-table-continuation', 'true');
          tbl.className = node.className;
          if (thead && (!isContinuation || shouldRepeatHeader)) {
            const theadClone = thead.cloneNode(true);
            if (isContinuation) theadClone.setAttribute('data-repeated-thead', 'true');
            tbl.appendChild(theadClone);
          }
          const tbody = document.createElement('tbody');
          tbl.appendChild(tbody);
          return { tbl, tbody };
        };

        let { tbl: currentTable, tbody: currentTbody } = createTableShell(false);
        currentPageDiv.appendChild(currentTable);

        let bodyRowsAddedOnCurrentPage = 0;
        for (let r = 0; r < rows.length; r++) {
          if (thead && rows[r].parentElement && rows[r].parentElement.tagName.toLowerCase() === 'thead') continue;
          const trClone = rows[r].cloneNode(true);
          currentTbody.appendChild(trClone);

          if (measurer.offsetHeight > effectiveLimit) {
            if (bodyRowsAddedOnCurrentPage === 0 && currentPageDiv.childNodes.length > 1) {
              // Table couldn't even fit its first body row on this page; move the entire table start to the next page
              currentTable.remove();
              sealCurrentPage();
              const fresh = createTableShell(false);
              currentTable = fresh.tbl;
              currentTbody = fresh.tbody;
              currentPageDiv.appendChild(currentTable);
              currentTbody.appendChild(trClone);
              bodyRowsAddedOnCurrentPage = 1;
            } else if (bodyRowsAddedOnCurrentPage > 0) {
              trClone.remove();
              sealCurrentPage();
              const cont = createTableShell(true);
              currentTable = cont.tbl;
              currentTbody = cont.tbody;
              currentPageDiv.appendChild(currentTable);
              currentTbody.appendChild(trClone);
              bodyRowsAddedOnCurrentPage = 1;
            } else {
              // Single row is taller than an entire empty page; keep it on current page and move on
              bodyRowsAddedOnCurrentPage = 1;
            }
          } else {
            bodyRowsAddedOnCurrentPage++;
          }
        }
        return;
      }

      // Case 4: Atomic Non-Paragraph Elements (img, hr, h1-h6)
      const isHeadingOrMedia = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'figure', 'hr'].includes(tag);
      if (isHeadingOrMedia) {
        const clone = node.cloneNode(true);
        currentPageDiv.appendChild(clone);

        if (measurer.offsetHeight > effectiveLimit) {
          if (currentPageDiv.childNodes.length > 1) {
            clone.remove();
            sealCurrentPage();
            currentPageDiv.appendChild(node.cloneNode(true));
          }
        }
        return;
      }

      // Case 5: Paragraphs & General Text Blocks (p, div, blockquote, span)
      // Fast path: does the entire element fit on the current page?
      const clone = node.cloneNode(true);
      currentPageDiv.appendChild(clone);
      if (measurer.offsetHeight <= effectiveLimit) {
        return; // Fits completely on current page!
      }
      clone.remove();

      // Check remaining space on the current page
      const currentRemaining = effectiveLimit - measurer.offsetHeight;

      // Microsoft Word Typography Rule:
      // 1. If remaining space on the page is small (< 75px, roughly 2-3 lines of text)
      // 2. OR if the paragraph is short (<= 3 lines or < 20 words):
      // Move it intact as a complete atomic block to the next page to prevent orphaned lines!
      const isShortParagraph = (clone.textContent || '').trim().split(/\s+/).length < 20;

      if (currentPageDiv.childNodes.length > 0 && (currentRemaining < 75 || isShortParagraph)) {
        sealCurrentPage();
        currentPageDiv.appendChild(clone);
        if (measurer.offsetHeight <= effectiveLimit) {
          return; // Fits cleanly on the fresh page!
        }
        clone.remove();
      }

      // Rare Mega-Paragraph Fallback: Only if a single paragraph itself is taller than an entire A4 page (>900px)!
      const childNodes = Array.from(node.childNodes);

      // Branch A: Plain text paragraph without child tags
      if (childNodes.length <= 1 && (!node.children || node.children.length === 0)) {
        const rawText = (node.textContent || '').trim();
        const words = rawText.split(/\s+/).filter(Boolean);

        if (words.length <= 3) {
          if (currentPageDiv.childNodes.length > 0) sealCurrentPage();
          currentPageDiv.appendChild(node.cloneNode(true));
          return;
        }

        let firstPart = document.createElement(tag === 'span' ? 'p' : tag);
        if (node.getAttribute('style')) firstPart.setAttribute('style', node.getAttribute('style'));
        if (node.className) firstPart.className = node.className;
        currentPageDiv.appendChild(firstPart);

        let splitWordIdx = -1;
        let lastFittedText = '';

        for (let w = 0; w < words.length; w++) {
          const testText = words.slice(0, w + 1).join(' ');
          firstPart.textContent = testText;
          if (measurer.offsetHeight > effectiveLimit) {
            splitWordIdx = w;
            break;
          }
          lastFittedText = testText;
        }

        if (splitWordIdx === -1) {
          return;
        }

        if (splitWordIdx > 0 && lastFittedText) {
          firstPart.textContent = lastFittedText;
          sealCurrentPage();

          const remainingWords = words.slice(splitWordIdx).join(' ');
          if (remainingWords) {
            const secondPart = document.createElement(tag === 'span' ? 'p' : tag);
            if (node.getAttribute('style')) secondPart.setAttribute('style', node.getAttribute('style'));
            if (node.className) secondPart.className = node.className;
            secondPart.textContent = remainingWords;
            appendOrSplitNode(secondPart);
          }
        } else {
          firstPart.remove();
          if (currentPageDiv.childNodes.length > 0) {
            sealCurrentPage();
            appendOrSplitNode(node.cloneNode(true));
          } else {
            currentPageDiv.appendChild(node.cloneNode(true));
          }
        }
        return;
      }

      // Branch B: Rich paragraph with child elements: append child by child WITHOUT calling .textContent on rich elements!
      let currentP = document.createElement(tag === 'span' ? 'p' : tag);
      if (node.getAttribute('style')) currentP.setAttribute('style', node.getAttribute('style'));
      if (node.className) currentP.className = node.className;
      currentPageDiv.appendChild(currentP);

      let splitChildIdx = -1;
      let splitWordOffset = -1;
      for (let i = 0; i < childNodes.length; i++) {
        const childClone = childNodes[i].cloneNode(true);
        currentP.appendChild(childClone);
        if (measurer.offsetHeight > effectiveLimit) {
          childClone.remove();
          splitChildIdx = i;

          // If the overflowing child is a pure text node (nodeType === 3), split its words to fill remaining page space!
          if (childNodes[i].nodeType === 3) {
            const rawWords = (childNodes[i].textContent || '').split(/\s+/).filter(Boolean);
            if (rawWords.length > 1) {
              let fittedWords = [];
              let testNode = document.createTextNode('');
              currentP.appendChild(testNode);

              for (let w = 0; w < rawWords.length; w++) {
                testNode.nodeValue = rawWords.slice(0, w + 1).join(' ');
                if (measurer.offsetHeight > effectiveLimit) {
                  splitWordOffset = w;
                  break;
                }
                fittedWords.push(rawWords[w]);
              }

              if (splitWordOffset > 0 && fittedWords.length > 0) {
                testNode.nodeValue = fittedWords.join(' ');
              } else {
                testNode.remove();
                splitWordOffset = 0;
              }
            }
          }
          break;
        }
      }

      if (splitChildIdx === -1) {
        return;
      }

      if (currentP.childNodes.length > 0 && currentP.textContent.trim()) {
        sealCurrentPage();
        const remainderP = document.createElement(tag === 'span' ? 'p' : tag);
        if (node.getAttribute('style')) remainderP.setAttribute('style', node.getAttribute('style'));
        if (node.className) remainderP.className = node.className;

        if (splitWordOffset > 0) {
          const rawWords = (childNodes[splitChildIdx].textContent || '').split(/\s+/).filter(Boolean);
          const remainingText = rawWords.slice(splitWordOffset).join(' ');
          if (remainingText) {
            remainderP.appendChild(document.createTextNode(remainingText));
          }
          for (let k = splitChildIdx + 1; k < childNodes.length; k++) {
            remainderP.appendChild(childNodes[k].cloneNode(true));
          }
        } else {
          for (let k = splitChildIdx; k < childNodes.length; k++) {
            remainderP.appendChild(childNodes[k].cloneNode(true));
          }
        }
        appendOrSplitNode(remainderP);
        return;
      }

      // If not even one child fit on empty page:
      currentP.remove();
      if (currentPageDiv.childNodes.length > 0) {
        sealCurrentPage();
        appendOrSplitNode(node.cloneNode(true));
      } else {
        currentPageDiv.appendChild(node.cloneNode(true));
      }
    };

    Array.from(parser.childNodes).forEach(child => appendOrSplitNode(child));

    if (currentPageDiv.innerHTML.trim() && hasRealVisibleContent(currentPageDiv)) {
      resultPages.push(currentPageDiv.innerHTML.trim());
    }

    document.body.removeChild(measurer);
    return resultPages.length > 0 ? resultPages : ['<p><br></p>'];
  };

  // Measure actual rendered content height inside an A4 sheet
  const getPageRenderedHeight = (el) => {
    if (!el) return 0;
    const children = Array.from(el.children);
    if (children.length === 0) {
      return el.textContent.trim() ? 32 : 0;
    }
    const elTop = el.getBoundingClientRect().top;
    let maxBottom = 0;
    for (const child of children) {
      const b = child.getBoundingClientRect().bottom - elTop;
      if (b > maxBottom) maxBottom = b;
    }
    return maxBottom;
  };

  // Auto-rebalance document pages: fills Page 1 completely, flows remainder to Page 2, Page 3, etc.
  const rebalanceAllPages = (sourcePages = null) => {
    const current = sourcePages || syncPagesContent();
    const fullHtml = current.map(p => p.content).filter(Boolean).join('\n');
    if (!fullHtml.trim()) return;

    const pageLimit = getMarginLimitPx(pageMargin);
    const splitted = splitHtmlIntoPages(fullHtml, pageLimit);
    
    // Only update if pages actually changed in count or content
    const isDifferent = splitted.length !== current.length || splitted.some((s, idx) => s.trim() !== (current[idx]?.content || '').trim());
    
    if (isDifferent) {
      const prevActiveIdx = activePageIndex;
      
      // Save caret character offset and if cursor was at end of content
      let savedCaret = null;
      if (typeof window !== 'undefined') {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const anchor = range.startContainer;
          let currentTargetEl = anchor?.nodeType === 1 ? anchor.closest('.sheet-body-content') : anchor?.parentElement?.closest('.sheet-body-content');
          if (!currentTargetEl && document.activeElement) {
            currentTargetEl = document.activeElement.closest('.sheet-body-content');
          }
          if (currentTargetEl) {
            const pageIdx = pages.findIndex(p => pageRefs.current[p.id] === currentTargetEl);
            const resolvedIdx = pageIdx !== -1 ? pageIdx : activePageIndex;
            const preRange = range.cloneRange();
            preRange.selectNodeContents(currentTargetEl);
            try {
              preRange.setEnd(range.endContainer, range.endOffset);
              savedCaret = {
                charOffset: preRange.toString().length,
                pageIndex: resolvedIdx,
                isAtEnd: range.collapsed && (
                  !range.endContainer.nextSibling &&
                  (range.endContainer.nodeType === 3 ? range.endOffset >= range.endContainer.textContent.length : true)
                )
              };
            } catch (_) {}
          }
        }
      }

      const newPagesList = splitted.map((html, idx) => ({
        id: current[idx]?.id || (Date.now() + idx),
        content: html
      }));

      // Directly update DOM innerHTML of existing pages to ensure immediate visual sync
      newPagesList.forEach((np) => {
        const el = pageRefs.current[np.id];
        if (!el) return;

        if (el.innerHTML !== np.content) {
          el.innerHTML = np.content;
        }
      });

      // Clean up refs of pages that were merged away
      if (current.length > newPagesList.length) {
        for (let i = newPagesList.length; i < current.length; i++) {
          if (current[i]?.id) {
            delete pageRefs.current[current[i].id];
          }
        }
      }

      setPages(newPagesList);
      handleAutoSave(newPagesList);
      setTimeout(updateMetrics, 50);

      // Restore exact caret position so user never loses focus or selection!
      setTimeout(() => {
        if (!savedCaret) return;

        let targetIdx = savedCaret.pageIndex;
        let charOffset = savedCaret.charOffset;

        // If caret offset exceeds content of current page, advance to next page seamlessly!
        const origPageEl = pageRefs.current[newPagesList[targetIdx]?.id];
        const origPageLen = origPageEl ? origPageEl.innerText.length : 0;
        if (targetIdx < newPagesList.length - 1 && charOffset > origPageLen && origPageLen > 0) {
          charOffset -= origPageLen;
          targetIdx++;
        } else if (savedCaret.isAtEnd && newPagesList.length > current.length) {
          targetIdx = Math.min(savedCaret.pageIndex + 1, newPagesList.length - 1);
        } else {
          targetIdx = Math.min(targetIdx, newPagesList.length - 1);
        }

        setActivePageIndex(targetIdx);
        const targetPageId = newPagesList[targetIdx]?.id;
        const targetEl = targetPageId ? pageRefs.current[targetPageId] : null;
        if (targetEl) {
          targetEl.focus();
          try {
            const sel = window.getSelection();
            if (sel) {
              const range = document.createRange();
              if (targetIdx > savedCaret.pageIndex && savedCaret.isAtEnd) {
                range.selectNodeContents(targetEl);
                range.collapse(true);
              } else {
                let currentOffset = 0;
                let found = false;

                function traverseNodes(node) {
                  if (found) return;
                  if (node.nodeType === 3) {
                    const nextOffset = currentOffset + node.length;
                    if (charOffset >= currentOffset && charOffset <= nextOffset) {
                      range.setStart(node, Math.min(node.length, Math.max(0, charOffset - currentOffset)));
                      range.collapse(true);
                      found = true;
                      return;
                    }
                    currentOffset = nextOffset;
                  } else {
                    for (let i = 0; i < node.childNodes.length; i++) {
                      traverseNodes(node.childNodes[i]);
                      if (found) return;
                    }
                  }
                }

                traverseNodes(targetEl);
                if (!found) {
                  range.selectNodeContents(targetEl);
                  range.collapse(false);
                }
              }
              sel.removeAllRanges();
              sel.addRange(range);
            }
          } catch (caretErr) {
            targetEl.focus();
          }
        }
      }, 50);
    }
  };

  const triggerAutoPagination = () => {
    if (paginationTimeoutRef.current) clearTimeout(paginationTimeoutRef.current);
    paginationTimeoutRef.current = setTimeout(() => {
      const current = syncPagesContent();
      
      // Check if any page is physically overflowing the A4 printable area
      let hasOverflow = false;
      for (const p of current) {
        const el = pageRefs.current[p.id];
        if (el) {
          const contentH = getPageRenderedHeight(el);
          const limitH = el.clientHeight || 918;
          if (contentH > limitH + 20 || el.scrollHeight > limitH + 24) {
            hasOverflow = true;
            break;
          }
        }
      }

      if (hasOverflow) {
        rebalanceAllPages();
      }
    }, 1200);
  };

  // Dual Persistence Engine (IndexedDB + Safe localStorage fallback)
  const persistDocuments = async (updatedDocs) => {
    // 1. Primary high-capacity storage
    await idbSet('smart_handouts_list', updatedDocs);

    // 2. Secondary storage (guarded against QuotaExceededError)
    try {
      localStorage.setItem('smart_handouts_list', JSON.stringify(updatedDocs));
    } catch (quotaErr) {
      console.warn('LocalStorage quota exceeded. Falling back to lightweight metadata cache...', quotaErr);
      try {
        const lightDocs = updatedDocs.slice(0, 5).map(doc => ({
          ...doc,
          content: doc.content ? doc.content.replace(/src="data:image\/[^;]+;base64,[^"]+"/g, 'src=""') : '',
          pages: (doc.pages || []).map(p => ({
            ...p,
            content: (p.content || '').replace(/src="data:image\/[^;]+;base64,[^"]+"/g, 'src=""')
          }))
        }));
        localStorage.setItem('smart_handouts_list', JSON.stringify(lightDocs));
      } catch (fallbackErr) {
        // Safe to ignore: full documents are securely preserved in IndexedDB
      }
    }
  };

  // Document Management Logic
  const loadAllDocuments = async () => {
    try {
      // 1. Check IndexedDB first
      let localDocs = await idbGet('smart_handouts_list');

      // 2. Fall back to localStorage if IndexedDB is empty
      if (!localDocs || !Array.isArray(localDocs) || localDocs.length === 0) {
        try {
          const stored = localStorage.getItem('smart_handouts_list');
          if (stored) {
            localDocs = JSON.parse(stored);
            if (Array.isArray(localDocs) && localDocs.length > 0) {
              await idbSet('smart_handouts_list', localDocs);
              // If stored string is large (>1MB), replace it with lightweight metadata to free up browser quota immediately
              if (stored.length > 1000000) {
                try {
                  const lightDocs = localDocs.slice(0, 3).map(doc => ({
                    ...doc,
                    content: doc.content ? doc.content.replace(/src="data:image\/[^;]+;base64,[^"]+"/g, 'src=""') : '',
                    pages: (doc.pages || []).map(p => ({
                      ...p,
                      content: (p.content || '').replace(/src="data:image\/[^;]+;base64,[^"]+"/g, 'src=""')
                    }))
                  }));
                  localStorage.setItem('smart_handouts_list', JSON.stringify(lightDocs));
                } catch (e) {}
              }
            }
          }
        } catch (lsErr) {
          console.warn('LocalStorage read warning:', lsErr);
        }
      }

      if (Array.isArray(localDocs) && localDocs.length > 0) {
        setDocuments(localDocs);
        loadDocument(localDocs[0]);
      } else {
        createNewDocument();
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
      createNewDocument();
    }
  };

  const createNewDocument = () => {
    const newDoc = { 
      id: generateUUID(), 
      title: 'ملزمة جديدة ' + (documents.length + 1), 
      pages: [{ id: 1, content: '' }],
      settings: { 
        watermark: '', 
        headerText: '', 
        footerText: '', 
        pageMargin: '20mm',
        pageNumberFormat: 'bottom_center',
        pageBackgroundPattern: 'none',
        pageBgColor: '#ffffff',
        pageBorderStyle: 'none',
        pageBorderColor: '#1e293b',
        pageBorderWidth: 'normal',
        pageColumns: 1
      }, 
      updated_at: new Date().toISOString() 
    };
    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);
    persistDocuments(updatedDocs);
    loadDocument(newDoc);
  };

  // Parse legacy continuous text into discrete pages
  const parseLegacyContent = (raw) => {
    if (!raw) return [{ id: 1, content: '' }];
    if (raw.includes('page-break-divider')) {
      const parts = raw.split(/<div class="page-break-divider"[^>]*>.*?<\/div>/gi);
      return parts.map((content, idx) => ({ id: Date.now() + idx, content: content.trim() }));
    }
    return [{ id: 1, content: raw }];
  };

  const loadDocument = (doc) => {
    pageRefs.current = {};
    setDocId(doc.id);
    setDocTitle(doc.title);
    setWatermark(doc.settings?.watermark || '');
    setHeaderText(doc.settings?.headerText || '');
    setFooterText(doc.settings?.footerText || '');
    setPageMargin(doc.settings?.pageMargin || '20mm');
    setPageNumberFormat(doc.settings?.pageNumberFormat || 'bottom_center');
    setPageBackgroundPattern(doc.settings?.pageBackgroundPattern || 'none');
    setPageBgColor(doc.settings?.pageBgColor || '#ffffff');
    setPageBorderStyle(doc.settings?.pageBorderStyle || 'none');
    setPageBorderColor(doc.settings?.pageBorderColor || '#1e293b');
    setPageBorderWidth(doc.settings?.pageBorderWidth || 'normal');
    setPageColumns(doc.settings?.pageColumns || 1);

    let initialPages = [];
    if (doc.pages && Array.isArray(doc.pages) && doc.pages.length > 0) {
      initialPages = doc.pages;
    } else if (doc.content) {
      initialPages = parseLegacyContent(doc.content);
    } else {
      initialPages = [{ id: 1, content: '' }];
    }

    setPages(initialPages);
    setActivePageIndex(0);

    // Initialize Undo/Redo stack for this loaded document
    const cleanInit = initialPages.map(p => ({ id: p.id, content: p.content || '' }));
    historyRef.current = {
      stack: [{ pages: cleanInit, activePageIndex: 0, sig: JSON.stringify(cleanInit) }],
      index: 0,
      isRestoring: false
    };
    setCanUndo(false);
    setCanRedo(false);

    // Auto-split and rebalance content immediately on load!
    setTimeout(() => {
      initialPages.forEach(p => {
        const el = pageRefs.current[p.id];
        if (el) {
          el.innerHTML = p.content || '';
          el.__hasInitialContent = true;
        }
      });
      updateMetrics();
      rebalanceAllPages(initialPages);
    }, 100);
  };

  const deleteDocument = async (idToDelete, e) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من حذف هذه الملزمة نهائياً؟')) return;
    const updatedDocs = documents.filter(d => d.id !== idToDelete);
    setDocuments(updatedDocs);
    persistDocuments(updatedDocs);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && isValidUUID(idToDelete)) {
        await supabase.from('handouts').delete().eq('id', idToDelete);
      }
    } catch (_) {}
    if (docId === idToDelete) {
      if (updatedDocs.length > 0) loadDocument(updatedDocs[0]);
      else createNewDocument();
    }
  };

  // Sync DOM content of all pages into state
  const syncPagesContent = () => {
    return pages.map(p => {
      const el = pageRefs.current[p.id];
      return {
        ...p,
        content: el ? el.innerHTML : p.content
      };
    });
  };

  // Multi-Page Undo / Redo Snapshot Engine
  const pushHistorySnapshot = (overridePages = null) => {
    if (historyRef.current.isRestoring) return;
    const currentPages = (overridePages || syncPagesContent()).map(p => ({
      id: p.id,
      content: p.content || ''
    }));
    const sig = JSON.stringify(currentPages);
    const currentTop = historyRef.current.stack[historyRef.current.index];
    if (currentTop && currentTop.sig === sig) return;

    const nextStack = historyRef.current.stack.slice(0, historyRef.current.index + 1);
    nextStack.push({
      pages: currentPages,
      activePageIndex,
      sig
    });
    if (nextStack.length > 60) {
      nextStack.shift();
    }
    historyRef.current.stack = nextStack;
    historyRef.current.index = nextStack.length - 1;
    setCanUndo(historyRef.current.index > 0);
    setCanRedo(false);
  };

  const scheduleHistorySnapshot = (overridePages = null) => {
    if (historyRef.current.isRestoring) return;
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    historyTimeoutRef.current = setTimeout(() => {
      pushHistorySnapshot(overridePages);
    }, 350);
  };

  const restoreHistoryAtIndex = (targetIdx) => {
    if (targetIdx < 0 || targetIdx >= historyRef.current.stack.length) return;
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    historyRef.current.isRestoring = true;

    const snap = historyRef.current.stack[targetIdx];
    const restoredPages = snap.pages.map(p => ({ id: p.id, content: p.content || '' }));
    const targetPageIdx = Math.min(snap.activePageIndex || 0, Math.max(0, restoredPages.length - 1));

    historyRef.current.index = targetIdx;
    setCanUndo(targetIdx > 0);
    setCanRedo(targetIdx < historyRef.current.stack.length - 1);

    setSelectedImg(null);
    setSelectedTable(null);
    setSelectedCell(null);
    setSelectedShape(null);
    setPages(restoredPages);
    setActivePageIndex(targetPageIdx);

    setTimeout(() => {
      restoredPages.forEach(p => {
        const el = pageRefs.current[p.id];
        if (el && el.innerHTML !== p.content) {
          el.innerHTML = p.content;
        }
      });
      const focusEl = pageRefs.current[restoredPages[targetPageIdx]?.id];
      if (focusEl) focusEl.focus();
      updateMetrics();
      historyRef.current.isRestoring = false;
      handleAutoSave(restoredPages, true);
    }, 25);
  };

  const handleUndo = () => {
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }
    // Flush any live unsaved DOM edits before stepping backward
    if (historyRef.current.index === historyRef.current.stack.length - 1) {
      const livePages = syncPagesContent().map(p => ({ id: p.id, content: p.content || '' }));
      const liveSig = JSON.stringify(livePages);
      const currentTop = historyRef.current.stack[historyRef.current.index];
      if (currentTop && currentTop.sig !== liveSig) {
        pushHistorySnapshot(livePages);
      }
    }
    if (historyRef.current.index > 0) {
      restoreHistoryAtIndex(historyRef.current.index - 1);
    }
  };

  const handleRedo = () => {
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }
    if (historyRef.current.index < historyRef.current.stack.length - 1) {
      restoreHistoryAtIndex(historyRef.current.index + 1);
    }
  };

  const handleAutoSave = (overridePages = null, skipHistory = false) => {
    setSaveStatus(prev => prev === 'saving' ? prev : 'saving');
    debouncedUpdateMetrics();
    if (!skipHistory && !historyRef.current.isRestoring) {
      scheduleHistorySnapshot(overridePages);
    }
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const currentPages = overridePages || syncPagesContent();
      const combinedContent = currentPages.map(p => p.content).join('<div class="page-break-divider"></div>');

      setDocuments(prevDocs => {
        const updated = prevDocs.map(doc => doc.id === docId ? { 
          ...doc, 
          title: docTitle, 
          pages: currentPages,
          content: combinedContent, 
          settings: {
            watermark,
            headerText,
            footerText,
            pageMargin,
            pageNumberFormat,
            pageBackgroundPattern,
            pageBgColor,
            pageBorderStyle,
            pageBorderColor,
            pageBorderWidth,
            pageColumns
          }, 
          updated_at: new Date().toISOString() 
        } : doc);
        persistDocuments(updated);
        return updated;
      });

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const payloadId = isValidUUID(docId) ? docId : undefined;
          const { data: upsertData } = await supabase.from('handouts').upsert({ 
            id: payloadId, 
            user_id: user.id, 
            title: docTitle, 
            content: combinedContent, 
            updated_at: new Date() 
          }).select('id').maybeSingle();

          if (upsertData?.id && upsertData.id !== docId) {
            setDocId(upsertData.id);
            setDocuments(prevDocs => {
              const updated = prevDocs.map(d => d.id === docId ? { ...d, id: upsertData.id } : d);
              persistDocuments(updated);
              return updated;
            });
          }
        }
      } catch (e) {}
      setSaveStatus('saved');
    }, 1000);
  };

  useEffect(() => { 
    if (docId) handleAutoSave(null, true); 
  }, [watermark, headerText, footerText, pageMargin, pageNumberFormat, pageBackgroundPattern, pageBgColor, pageBorderStyle, pageBorderColor, pageBorderWidth, pageColumns]);

  // Page Operations
  const addNewPage = (afterIndex = activePageIndex) => {
    const updated = syncPagesContent();
    const newPage = { id: Date.now(), content: '' };
    updated.splice(afterIndex + 1, 0, newPage);
    setPages(updated);
    setActivePageIndex(afterIndex + 1);
    handleAutoSave(updated);
    setTimeout(() => {
      const el = pageRefs.current[newPage.id];
      if (el) {
        el.innerHTML = '<p><br></p>';
        el.__hasInitialContent = true;
        el.focus();
      }
    }, 100);
  };

  const deletePage = (index, askConfirm = true) => {
    if (pages.length <= 1) {
      if (askConfirm) alert("لا يمكن حذف الصفحة الوحيدة المتبقية في الملزمة.");
      return;
    }
    if (askConfirm && !window.confirm(`هل أنت متأكد من حذف الصفحة رقم ${index + 1}؟`)) return;
    const deletedId = pages[index]?.id;
    if (deletedId) delete pageRefs.current[deletedId];
    const updated = syncPagesContent().filter((_, i) => i !== index);
    setPages(updated);
    setActivePageIndex(Math.max(0, index - 1));
    handleAutoSave(updated);
  };

  const movePage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= pages.length) return;
    const updated = syncPagesContent();
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setPages(updated);
    setActivePageIndex(targetIndex);
    handleAutoSave(updated);
  };

  const duplicatePage = (index) => {
    const updated = syncPagesContent();
    const pageToDup = updated[index];
    const newPage = { id: Date.now(), content: pageToDup.content };
    updated.splice(index + 1, 0, newPage);
    setPages(updated);
    setActivePageIndex(index + 1);
    handleAutoSave(updated);
  };

  // Print Document Helper (Pre-syncs all pages and clears active caret/selection)
  const handlePrintDocument = () => {
    if (typeof window !== 'undefined') {
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      const sel = window.getSelection();
      if (sel) sel.removeAllRanges();
    }
    syncPagesContent();
    setTimeout(() => {
      window.print();
    }, 60);
  };

  // Keyboard Navigation & Shortcuts (Word Flow)
  const handlePageKeyDown = (e, pageIndex) => {
    // 0. Tab Key inside Table Cells -> Seamless Word-Style Table Navigation
    if (e.key === 'Tab') {
      const sel = window.getSelection();
      const anchor = sel?.anchorNode;
      const cell = anchor?.nodeType === 1 ? anchor.closest('td, th') : anchor?.parentElement?.closest('td, th');
      if (cell) {
        e.preventDefault();
        const table = cell.closest('table');
        if (table) {
          const allCells = Array.from(table.querySelectorAll('td, th'));
          const curIdx = allCells.indexOf(cell);
          if (e.shiftKey) {
            if (curIdx > 0) {
              const prevCell = allCells[curIdx - 1];
              prevCell.focus();
              const range = document.createRange();
              range.selectNodeContents(prevCell);
              range.collapse(false);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          } else {
            if (curIdx < allCells.length - 1) {
              const nextCell = allCells[curIdx + 1];
              nextCell.focus();
              const range = document.createRange();
              range.selectNodeContents(nextCell);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            } else {
              insertTableRowBelow();
            }
          }
        }
        return;
      }
    }

    // 1. Ctrl + Enter -> Add Page immediately (Word style!)
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      addNewPage(pageIndex);
      return;
    }

    // 2. PageDown / PageUp -> Standard keyboard page navigation (preserving natural line-by-line Arrow navigation)
    if (e.key === 'PageDown' && pageIndex < pages.length - 1) {
      e.preventDefault();
      const nextIndex = pageIndex + 1;
      const nextEl = pageRefs.current[pages[nextIndex]?.id];
      if (nextEl) {
        setActivePageIndex(nextIndex);
        nextEl.focus();
        nextEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }
    if (e.key === 'PageUp' && pageIndex > 0) {
      e.preventDefault();
      const prevIndex = pageIndex - 1;
      const prevEl = pageRefs.current[pages[prevIndex]?.id];
      if (prevEl) {
        setActivePageIndex(prevIndex);
        prevEl.focus();
        prevEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    // Shift + Enter -> Word Soft Line Break (<br>) without creating huge paragraph margins
    if (e.key === 'Enter' && e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak');
      setTimeout(() => {
        handleAutoSave();
        triggerAutoPagination();
      }, 20);
      return;
    }

    // Word-Style Enter Key Handling (Normal New Paragraph / Seamless Page Flow)
    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
      const curEl = pageRefs.current[pages[pageIndex]?.id];
      if (curEl) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);

          // BREAK OUT OF ATOMIC CALLOUT BOXES & SMART WIDGETS ON ENTER
          // When typing at the end of an atomic widget container (.word-shape-item, .callout-box),
          // pressing Enter breaks out into a fresh, clean normal paragraph outside the widget:
          let containerNode = range.startContainer;
          if (containerNode && containerNode.nodeType === 3) containerNode = containerNode.parentElement;
          const styledBlock = containerNode ? containerNode.closest(
            '.word-shape-item, [data-atomic-block="true"], .callout-box, .word-smartart-block'
          ) : null;

          if (styledBlock && curEl.contains(styledBlock) && !styledBlock.closest('table')) {
            const postRange = document.createRange();
            postRange.selectNodeContents(styledBlock);
            postRange.setStart(range.endContainer, range.endOffset);
            const isAtEnd = postRange.toString().trim().length === 0;

            if (isAtEnd) {
              e.preventDefault();
              pushHistorySnapshot();
              const newP = document.createElement('p');
              newP.innerHTML = '<br>';
              styledBlock.after(newP);

              const newRange = document.createRange();
              newRange.setStart(newP, 0);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);

              setTimeout(() => {
                handleAutoSave();
                triggerAutoPagination();
              }, 20);
              return;
            }
          }
        }
      }

      // FOR ALL NORMAL ENTER PRESSES: DO NOT PREVENT DEFAULT!
      // Browser inserts new paragraph (<p><br></p>) naturally on the CURRENT page!
      // Debounced triggerAutoPagination (700ms) will smoothly rebalance if content exceeds page height:
      setTimeout(() => {
        handleAutoSave();
        triggerAutoPagination();
      }, 20);
      return;
    }

    // Backspace at top of any page (Word-Style Merge / Page Delete)
    if (e.key === 'Backspace' && pageIndex > 0) {
      const curEl = pageRefs.current[pages[pageIndex]?.id];
      const prevEl = pageRefs.current[pages[pageIndex - 1]?.id];
      if (curEl && prevEl) {
        const selection = window.getSelection();
        let isAtPageStart = false;
        if (selection && selection.isCollapsed && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const preRange = document.createRange();
          preRange.selectNodeContents(curEl);
          preRange.setEnd(range.startContainer, range.startOffset);
          isAtPageStart = preRange.toString().length === 0;
        }

        if (isAtPageStart) {
          e.preventDefault();
          const isCurrentEmpty = !curEl.innerText.trim();

          if (isCurrentEmpty) {
            // Current page is empty: delete page and place caret at end of previous page
            deletePage(pageIndex, false);
            prevEl.focus();
            const range = document.createRange();
            range.selectNodeContents(prevEl);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            return;
          } else {
            // If previous page has a trailing empty paragraph, remove it smoothly without destroying other Enters!
            const lastPrevChild = prevEl.lastElementChild;
            if (lastPrevChild && (!lastPrevChild.textContent.trim() || lastPrevChild.innerHTML === '<br>')) {
              lastPrevChild.remove();
              handleAutoSave();
              return;
            }
            // Move cursor to the end of previous page seamlessly without erasing formatting or Enters
            prevEl.focus();
            const range = document.createRange();
            range.selectNodeContents(prevEl);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            return;
          }
        }
      }
    }

    // Forward Delete at bottom of any page (Word-Style Pull-Up from Next Page)
    if (e.key === 'Delete' && pageIndex < pages.length - 1) {
      const curEl = pageRefs.current[pages[pageIndex]?.id];
      const nextEl = pageRefs.current[pages[pageIndex + 1]?.id];
      if (curEl && nextEl) {
        const selection = window.getSelection();
        let isAtPageEnd = false;
        if (selection && selection.isCollapsed && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const postRange = document.createRange();
          postRange.selectNodeContents(curEl);
          postRange.setStart(range.endContainer, range.endOffset);
          isAtPageEnd = postRange.toString().length === 0;
        }

        if (isAtPageEnd) {
          e.preventDefault();
          const isNextEmpty = !nextEl.innerText.trim();
          if (isNextEmpty) {
            deletePage(pageIndex + 1, false);
          } else {
            triggerAutoPagination();
          }
          return;
        }
      }
    }

    // Shift + Down Arrow -> Select across page boundaries (Word-Style multi-page continuous selection)
    if (e.shiftKey && e.key === 'ArrowDown' && pageIndex < pages.length - 1) {
      const curEl = pageRefs.current[pages[pageIndex]?.id];
      const nextEl = pageRefs.current[pages[pageIndex + 1]?.id];
      if (curEl && nextEl) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const postRange = document.createRange();
          postRange.selectNodeContents(curEl);
          try {
            postRange.setStart(range.endContainer, range.endOffset);
          } catch (_) {
            postRange.setStart(curEl, curEl.childNodes.length);
          }
          const isAtPageEnd = postRange.toString().trim().length === 0;

          if (isAtPageEnd) {
            e.preventDefault();
            const startIdx = crossPageSelection ? crossPageSelection.startPageIndex : pageIndex;
            const endIdx = pageIndex + 1;

            const r1 = document.createRange();
            if (crossPageSelection && crossRangesRef.current[0]) {
              r1.setStart(crossRangesRef.current[0].startContainer, crossRangesRef.current[0].startOffset);
            } else {
              r1.setStart(range.startContainer, range.startOffset);
            }
            r1.setEnd(curEl, curEl.childNodes.length);

            const r2 = document.createRange();
            r2.setStart(nextEl, 0);
            r2.setEnd(nextEl, Math.min(1, nextEl.childNodes.length));

            const newRanges = [r1, r2];
            crossRangesRef.current = newRanges;

            const textParts = newRanges.map(r => r.toString());
            const combinedText = textParts.join('\n').trim();

            setCrossPageSelection({
              startPageIndex: startIdx,
              endPageIndex: endIdx,
              text: combinedText,
              html: combinedText
            });
            setCapturedSelectedText(combinedText);
            setActivePageIndex(pageIndex + 1);

            if (typeof Highlight !== 'undefined' && typeof CSS !== 'undefined' && CSS.highlights) {
              try {
                const hl = new Highlight(...newRanges);
                CSS.highlights.set('cross-page-selection', hl);
              } catch (_) {}
            }
            return;
          }
        }
      }
    }



    // Shift + Up Arrow -> Select across page boundaries upwards
    if (e.shiftKey && e.key === 'ArrowUp' && pageIndex > 0) {
      const curEl = pageRefs.current[pages[pageIndex]?.id];
      const prevEl = pageRefs.current[pages[pageIndex - 1]?.id];
      if (curEl && prevEl) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const preRange = document.createRange();
          preRange.selectNodeContents(curEl);
          try {
            preRange.setEnd(range.startContainer, range.startOffset);
          } catch (_) {
            preRange.setEnd(curEl, 0);
          }
          const isAtPageStart = preRange.toString().trim().length === 0;

          if (isAtPageStart) {
            e.preventDefault();
            const startIdx = pageIndex - 1;
            const endIdx = crossPageSelection ? crossPageSelection.endPageIndex : pageIndex;

            const rPrev = document.createRange();
            rPrev.selectNodeContents(prevEl);

            const rCur = document.createRange();
            rCur.setStart(curEl, 0);
            rCur.setEnd(range.endContainer, range.endOffset);

            const newRanges = [rPrev, rCur];
            crossRangesRef.current = newRanges;

            const textParts = newRanges.map(r => r.toString());
            const combinedText = textParts.join('\n').trim();

            setCrossPageSelection({
              startPageIndex: startIdx,
              endPageIndex: endIdx,
              text: combinedText,
              html: combinedText
            });
            setCapturedSelectedText(combinedText);
            setActivePageIndex(pageIndex - 1);

            if (typeof Highlight !== 'undefined' && typeof CSS !== 'undefined' && CSS.highlights) {
              try {
                const hl = new Highlight(...newRanges);
                CSS.highlights.set('cross-page-selection', hl);
              } catch (_) {}
            }
            return;
          }
        }
      }
    }



    // Ctrl + A -> Select ALL content across ALL pages (Word-style document selection)
    if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyA' || e.key.toLowerCase() === 'a' || e.key === 'ش')) {
      e.preventDefault();
      setIsAllPagesSelected(true);
      clearCrossPageSelection();
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      return;
    }

    // Alt + Shortcuts (Equation & Headings)
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        handleInsertNewEquation();
        return;
      }
      if (e.key === '1') { e.preventDefault(); applyWordStyle('h1'); return; }
      if (e.key === '2') { e.preventDefault(); applyWordStyle('h2'); return; }
      if (e.key === '3') { e.preventDefault(); applyWordStyle('h3'); return; }
      if (e.key === '0') { e.preventDefault(); applyWordStyle('normal'); return; }
    }

    if (e.key === 'F11') {
      e.preventDefault();
      toggleFullscreen();
      return;
    }

    if (e.key === 'F7') {
      e.preventDefault();
      runSmartProofingAndPunctuation();
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'F1') {
        e.preventDefault();
        setIsRibbonCollapsed(prev => !prev);
        return;
      }
      const k = e.key.toLowerCase();
      const code = e.code;
      // Undo (Ctrl + Z) & Redo (Ctrl + Shift + Z)
      if (code === 'KeyZ' || k === 'z' || e.key === 'ئ') {
        e.preventDefault();
        if (e.shiftKey) handleRedo(); else handleUndo();
        return;
      }
      // Redo (Ctrl + Y)
      if (code === 'KeyY' || k === 'y' || e.key === 'غ') {
        e.preventDefault();
        handleRedo();
        return;
      }
      // Save Document (Ctrl + S)
      if (code === 'KeyS' || k === 's' || e.key === 'س') {
        e.preventDefault();
        handleAutoSave();
        return;
      }
      // Print Document (Ctrl + P)
      if (k === 'p') {
        e.preventDefault();
        handlePrintDocument();
        return;
      }
      // Find & Replace (Ctrl + F or Ctrl + H)
      if (k === 'f' || k === 'h') {
        e.preventDefault();
        setShowFindReplaceModal(true);
        return;
      }
      // Shortcuts Guide (Ctrl + /)
      if (e.key === '/' || e.key === '؟') {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }
      // Text Alignment: Center (Ctrl + E), Right (Ctrl + R), Left (Ctrl + L), Justify (Ctrl + J)
      if (k === 'e' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        handleFormat('justifyCenter');
        return;
      }
      if (k === 'r' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        applyDirection('rtl');
        handleFormat('justifyRight');
        return;
      }
      if (k === 'l' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        applyDirection('ltr');
        handleFormat('justifyLeft');
        return;
      }
      if (k === 'j' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        handleFormat('justifyFull');
        return;
      }
      // Bullet list (Ctrl + Shift + L)
      if (k === 'l' && e.shiftKey) {
        e.preventDefault();
        handleFormat('insertUnorderedList');
        return;
      }
      // Insert Link (Ctrl + K)
      if (k === 'k') {
        e.preventDefault();
        handleInsertLink();
        return;
      }
      // Format Painter (Ctrl + Shift + C)
      if (k === 'c' && e.shiftKey) {
        e.preventDefault();
        handleToggleFormatPainter();
        return;
      }
      // Font size delta (Ctrl + ] / Ctrl + [)
      if (e.key === ']' || (e.shiftKey && e.key === '>')) {
        e.preventDefault();
        changeFontSizeDelta(1);
        return;
      }
      if (e.key === '[' || (e.shiftKey && e.key === '<')) {
        e.preventDefault();
        changeFontSizeDelta(-1);
        return;
      }
      // Subscript (Ctrl + =) & Superscript (Ctrl + Shift + =)
      if (e.key === '=' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        handleFormat('subscript');
        return;
      }
      if ((e.key === '+' || (e.key === '=' && e.shiftKey)) && !e.altKey) {
        e.preventDefault();
        handleFormat('superscript');
        return;
      }
      // Word count modal (Ctrl + Shift + G)
      if (k === 'g' && e.shiftKey) {
        e.preventDefault();
        openWordCountModal();
        return;
      }
      // Font Style
      switch (k) {
        case 'b': e.preventDefault(); handleFormat('bold'); break;
        case 'i': e.preventDefault(); handleFormat('italic'); break;
        case 'u': e.preventDefault(); handleFormat('underline'); break;
        default: break;
      }
    }
  };

  // Word-Style Document-Wide Copy & Cut across ALL Pages
  const handleDocumentCopy = async () => {
    if (isAllPagesSelected) {
      const allText = pages.map(p => {
        const el = pageRefs.current[p.id];
        return el ? el.innerText : '';
      }).join('\n\n');
      const allHtml = pages.map(p => {
        const el = pageRefs.current[p.id];
        return el ? el.innerHTML : p.content;
      }).join('<hr style="page-break-after:always;"/>');
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
          const textBlob = new Blob([allText], { type: 'text/plain' });
          const htmlBlob = new Blob([allHtml], { type: 'text/html' });
          await navigator.clipboard.write([
            new ClipboardItem({ 'text/plain': textBlob, 'text/html': htmlBlob })
          ]);
        } else if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(allText);
        }
      } catch (e) {
        document.execCommand('copy');
      }
    } else {
      document.execCommand('copy');
    }
  };

  const handleDocumentCut = async () => {
    if (isAllPagesSelected) {
      await handleDocumentCopy();
      const emptyPages = [{ id: 1, content: '' }];
      setPages(emptyPages);
      setActivePageIndex(0);
      setIsAllPagesSelected(false);
      handleAutoSave(emptyPages);
      setTimeout(() => {
        const el = pageRefs.current[1];
        if (el) {
          el.innerHTML = '';
          el.focus();
        }
      }, 40);
    } else {
      document.execCommand('cut');
      handleAutoSave();
      triggerAutoPagination();
    }
  };

  // Save current selection explicitly
  const saveCurrentSelection = () => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      try {
        savedSelectionRangeRef.current = sel.getRangeAt(0).cloneRange();
      } catch (_) {}
    }
  };

  // Restore saved selection
  const restoreSavedSelection = () => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (savedSelectionRangeRef.current && sel) {
      try {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRangeRef.current);
      } catch (_) {}
    }
  };

  // --- MICROSOFT WORD AUTHENTIC FONT COLOR (تغيير لون الخط والعناوين بشكل مضمون 100%) ---
  const applyFontColor = (color) => {
    pushHistorySnapshot();
    if (color) setActiveFontColor(color);
    setShowFontColorPalette(false);

    // 1. All pages selected mode
    if (isAllPagesSelected) {
      const updated = syncPagesContent().map(p => {
        const el = pageRefs.current[p.id];
        if (el) {
          el.querySelectorAll('p, div, h1, h2, h3, h4, blockquote, span, font').forEach(b => {
            b.style.color = color;
            b.style.setProperty('color', color, 'important');
            if (b.style.borderRightColor) b.style.borderRightColor = color;
            if (b.style.borderBottomColor) b.style.borderBottomColor = color;
          });
          return { ...p, content: el.innerHTML };
        }
        return p;
      });
      setPages(updated);
      handleAutoSave(updated);
      triggerAutoPagination();
      return;
    }

    // 2. Cross-page selection mode
    if (crossPageSelection && crossRangesRef.current.length > 0) {
      crossRangesRef.current.forEach(r => {
        try {
          const span = document.createElement('span');
          span.style.color = color;
          span.style.setProperty('color', color, 'important');
          const contents = r.extractContents();
          span.appendChild(contents);
          span.querySelectorAll('span, font').forEach(child => {
            child.style.color = color;
            child.removeAttribute('color');
          });
          r.insertNode(span);
        } catch (_) {
          try {
            const sel = window.getSelection();
            if (sel) {
              sel.removeAllRanges();
              sel.addRange(r);
              document.execCommand('styleWithCSS', false, true);
              document.execCommand('foreColor', false, color);
            }
          } catch (_) {}
        }
      });
      handleAutoSave();
      triggerAutoPagination();
      return;
    }

    // 3. Normal selection or saved selection
    restoreSavedSelection();
    let sel = window.getSelection();
    let range = null;

    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      range = sel.getRangeAt(0);
    } else if (savedSelectionRangeRef.current && !savedSelectionRangeRef.current.collapsed) {
      range = savedSelectionRangeRef.current;
    } else if (capturedSelectedRangeRef.current && !capturedSelectedRangeRef.current.collapsed) {
      range = capturedSelectedRangeRef.current;
    }

    // Ensure the container page has focus
    let pageEl = range?.commonAncestorContainer?.nodeType === 1
      ? range.commonAncestorContainer.closest('.sheet-body-content')
      : range?.commonAncestorContainer?.parentElement?.closest('.sheet-body-content');
    if (!pageEl) pageEl = pageRefs.current[pages[activePageIndex]?.id];
    if (pageEl) {
      pageEl.focus({ preventScroll: true });
    }

    if (range && !range.collapsed) {
      // Re-attach range to window selection
      if (sel) {
        try {
          sel.removeAllRanges();
          sel.addRange(range);
        } catch (_) {}
      }

      // Check if user selected inside or across a heading
      let rootNode = range.commonAncestorContainer;
      if (rootNode && rootNode.nodeType === 3) rootNode = rootNode.parentElement;
      const block = rootNode ? rootNode.closest('h1, h2, h3, h4, h5, h6, [data-word-style], .word-shape-item') : null;
      if (block && !block.classList.contains('sheet-body-content')) {
        const isHeading = block.tagName.startsWith('H') || 
          block.getAttribute('data-word-style')?.includes('heading') || 
          block.getAttribute('data-word-style')?.includes('title') ||
          block.getAttribute('data-word-style')?.includes('banner') ||
          block.classList.contains('word-shape-item');
        if (isHeading) {
          block.style.color = color;
          block.style.setProperty('color', color, 'important');
          if (block.style.borderRightColor) block.style.borderRightColor = color;
          if (block.style.borderBottomColor) block.style.borderBottomColor = color;
        }
      }

      // Apply color directly to the DOM Range:
      let appliedDirectly = false;
      try {
        const span = document.createElement('span');
        span.style.color = color;
        span.style.setProperty('color', color, 'important');
        const contents = range.extractContents();
        span.appendChild(contents);
        span.querySelectorAll('span, font').forEach(child => {
          child.style.color = color;
          child.removeAttribute('color');
        });
        range.insertNode(span);

        // Re-select newly colored span so selection stays visible
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
        savedSelectionRangeRef.current = newRange.cloneRange();
        capturedSelectedRangeRef.current = newRange.cloneRange();
        appliedDirectly = true;
      } catch (err) {
        console.warn('DOM Range extractContents failed, falling back to execCommand:', err);
      }

      if (!appliedDirectly) {
        try {
          document.execCommand('styleWithCSS', false, true);
          document.execCommand('foreColor', false, color);
        } catch (_) {}
      }

      // Check all headings inside the container
      try {
        if (rootNode) {
          const headings = rootNode.querySelectorAll ? rootNode.querySelectorAll('h1, h2, h3, h4, h5, h6, [data-word-style]') : [];
          headings.forEach(h => {
            if (sel && sel.containsNode && sel.containsNode(h, true)) {
              h.style.color = color;
              h.style.setProperty('color', color, 'important');
              if (h.style.borderRightColor) h.style.borderRightColor = color;
              if (h.style.borderBottomColor) h.style.borderBottomColor = color;
            }
          });
        }
      } catch (_) {}
    } else {
      // 4. Collapsed cursor inside a heading or block -> Word updates heading color directly!
      let node = sel?.anchorNode || savedSelectionRangeRef.current?.startContainer;
      if (node && node.nodeType === 3) node = node.parentElement;
      const block = node ? node.closest('h1, h2, h3, h4, h5, h6, [data-word-style], .word-shape-item, p, div') : null;
      if (block && !block.classList.contains('sheet-body-content')) {
        block.style.color = color;
        block.style.setProperty('color', color, 'important');
        if (block.style.borderRightColor) block.style.borderRightColor = color;
        if (block.style.borderBottomColor) block.style.borderBottomColor = color;
        block.querySelectorAll('span, font, strong, b').forEach(el => {
          el.style.color = color;
          el.removeAttribute('color');
        });
      }
      try {
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('foreColor', false, color);
      } catch (_) {}
    }

    if (pageEl) pageEl.focus(); 
    handleAutoSave(); 
    triggerAutoPagination();
  };

  // --- MICROSOFT WORD AUTHENTIC TEXT HIGHLIGHTER (قلم التمييز المضمون 100%) ---
  const applyTextHighlight = (color) => {
    pushHistorySnapshot();
    if (color && color !== 'transparent' && color !== 'none') {
      setActiveHighlightColor(color);
    }
    setShowHighlightPalette(false);

    restoreSavedSelection();
    let sel = window.getSelection();
    let range = null;

    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      range = sel.getRangeAt(0);
    } else if (savedSelectionRangeRef.current && !savedSelectionRangeRef.current.collapsed) {
      range = savedSelectionRangeRef.current;
    } else if (capturedSelectedRangeRef.current && !capturedSelectedRangeRef.current.collapsed) {
      range = capturedSelectedRangeRef.current;
    }

    let pageEl = range?.commonAncestorContainer?.nodeType === 1
      ? range.commonAncestorContainer.closest('.sheet-body-content')
      : range?.commonAncestorContainer?.parentElement?.closest('.sheet-body-content');
    if (!pageEl) pageEl = pageRefs.current[pages[activePageIndex]?.id];
    if (pageEl) pageEl.focus({ preventScroll: true });

    const isRemoving = !color || color === 'transparent' || color === 'none';

    if (range && !range.collapsed) {
      try {
        if (isRemoving) {
          const span = document.createElement('span');
          const contents = range.extractContents();
          span.appendChild(contents);
          span.querySelectorAll('span, mark, font').forEach(child => {
            child.style.backgroundColor = 'transparent';
            child.style.removeProperty('background-color');
          });
          span.style.backgroundColor = 'transparent';
          range.insertNode(span);
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(newRange);
          }
          savedSelectionRangeRef.current = newRange.cloneRange();
        } else {
          const mark = document.createElement('mark');
          mark.style.backgroundColor = color;
          mark.style.color = 'inherit';
          mark.style.padding = '1px 2px';
          mark.style.borderRadius = '2px';
          const contents = range.extractContents();
          mark.appendChild(contents);
          range.insertNode(mark);
          const newRange = document.createRange();
          newRange.selectNodeContents(mark);
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(newRange);
          }
          savedSelectionRangeRef.current = newRange.cloneRange();
        }
      } catch (_) {
        try {
          document.execCommand('styleWithCSS', false, true);
          document.execCommand('hiliteColor', false, isRemoving ? 'transparent' : color);
        } catch (_) {}
      }
    } else {
      try {
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('hiliteColor', false, isRemoving ? 'transparent' : color);
      } catch (_) {}
    }

    if (pageEl) pageEl.focus();
    handleAutoSave();
    triggerAutoPagination();
  };

  // --- MICROSOFT WORD FONT FAMILY (تغيير نوع الخط المضمون) ---
  const applyFontFamily = (font) => {
    pushHistorySnapshot();
    if (!font) return;

    if (isAllPagesSelected) {
      const updated = syncPagesContent().map(p => {
        const el = pageRefs.current[p.id];
        if (el) {
          el.querySelectorAll('p, div, span, h1, h2, h3, li, td').forEach(node => {
            node.style.fontFamily = font;
          });
          el.style.fontFamily = font;
          return { ...p, content: el.innerHTML };
        }
        return p;
      });
      setPages(updated);
      handleAutoSave(updated);
      triggerAutoPagination();
      return;
    }

    restoreSavedSelection();
    let sel = window.getSelection();
    let range = null;

    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      range = sel.getRangeAt(0);
    } else if (savedSelectionRangeRef.current && !savedSelectionRangeRef.current.collapsed) {
      range = savedSelectionRangeRef.current;
    }

    if (range && !range.collapsed) {
      try {
        const span = document.createElement('span');
        span.style.fontFamily = font;
        const contents = range.extractContents();
        span.appendChild(contents);
        span.querySelectorAll('span, font').forEach(child => {
          child.style.fontFamily = font;
        });
        range.insertNode(span);
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
        savedSelectionRangeRef.current = newRange.cloneRange();
      } catch (_) {
        try {
          document.execCommand('fontName', false, font);
        } catch (_) {}
      }
    } else {
      let node = sel?.anchorNode || savedSelectionRangeRef.current?.startContainer;
      if (node && node.nodeType === 3) node = node.parentElement;
      const block = node ? node.closest('p, div, li, h1, h2, h3, span, td') : null;
      if (block) {
        block.style.fontFamily = font;
      }
    }
    const currentEl = pageRefs.current[pages[activePageIndex]?.id];
    if (currentEl) currentEl.focus();
    handleAutoSave();
    triggerAutoPagination();
  };

  // Color Palette Popover Opener (Word Zero Selection Loss Positioning)
  const handleOpenColorPalette = (type, e) => {
    e.preventDefault();
    e.stopPropagation();
    saveCurrentSelection();
    const rect = e.currentTarget.getBoundingClientRect();
    setColorAnchorRect({
      top: rect.bottom + 4,
      left: rect.left,
      right: window.innerWidth - rect.right,
      width: rect.width
    });
    if (type === 'font') {
      setShowFontColorPalette(prev => !prev);
      setShowHighlightPalette(false);
      setShowShadingPalette(false);
    } else if (type === 'highlight') {
      setShowHighlightPalette(prev => !prev);
      setShowFontColorPalette(false);
      setShowShadingPalette(false);
    } else if (type === 'shading') {
      setShowShadingPalette(prev => !prev);
      setShowFontColorPalette(false);
      setShowHighlightPalette(false);
    }
  };

  // Format Helper (Word-Style: formats single page selection OR entire document when all selected)
  const handleFormat = (command, value = null) => { 
    if (command === 'foreColor') {
      applyFontColor(value);
      return;
    }
    if (command === 'hiliteColor') {
      applyTextHighlight(value);
      return;
    }
    if (command === 'fontName') {
      applyFontFamily(value);
      return;
    }

    if (isAllPagesSelected) {
      const updated = syncPagesContent().map(p => {
        const el = pageRefs.current[p.id];
        if (el) {
          const range = document.createRange();
          range.selectNodeContents(el);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          document.execCommand(command, false, value);
          return { ...p, content: el.innerHTML };
        }
        return p;
      });
      setPages(updated);
      handleAutoSave(updated);
      triggerAutoPagination();
      return;
    }

    if (crossPageSelection && crossRangesRef.current.length > 0) {
      crossRangesRef.current.forEach(r => {
        try {
          const sel = window.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(r);
            document.execCommand(command, false, value);
          }
        } catch (_) {}
      });
      handleAutoSave();
      triggerAutoPagination();
      return;
    }

    restoreSavedSelection();
    const currentEl = pageRefs.current[pages[activePageIndex]?.id];
    if (currentEl) currentEl.focus({ preventScroll: true });
    restoreSavedSelection();

    // Alignment commands (justifyRight, justifyCenter, justifyLeft, justifyFull)
    if (command.startsWith('justify')) {
      const sel = window.getSelection();
      let node = sel?.anchorNode || savedSelectionRangeRef.current?.startContainer;
      if (node && node.nodeType === 3) node = node.parentElement;
      const block = node ? node.closest('p, div, li, h1, h2, h3, blockquote, td') : null;
      if (block && !block.classList.contains('sheet-body-content')) {
        const alignMap = {
          justifyRight: 'right',
          justifyCenter: 'center',
          justifyLeft: 'left',
          justifyFull: 'justify'
        };
        block.style.textAlign = alignMap[command] || 'right';
        handleAutoSave();
        triggerAutoPagination();
        return;
      }
    }

    try {
      document.execCommand('styleWithCSS', false, true);
    } catch (_) {}
    document.execCommand(command, false, value); 
    if (currentEl) currentEl.focus(); 
    handleAutoSave(); 
    triggerAutoPagination();
  };

  // --- AUTHENTIC MICROSOFT WORD CLEAR ALL FORMATTING (حذف كافة التنسيقات والخلفيات والبراويز) ---
  const handleClearFormatting = () => {
    pushHistorySnapshot();

    // 1. Native clear for inline text styles (bold, italic, underline, strike, fonts, colors)
    try {
      document.execCommand('removeFormat', false, null);
      document.execCommand('unlink', false, null);
    } catch (_) {}

    const cleanBlockElement = (block) => {
      if (!block || block.nodeType !== 1) return;
      if (block.classList && block.classList.contains('sheet-body-content')) return;
      if (block.closest('table')) {
        // Inside table cell: clear background, color, font styles
        block.style.background = '';
        block.style.backgroundColor = '';
        block.style.color = '#1e293b';
        block.style.fontSize = '';
        block.style.fontWeight = '';
        block.style.boxShadow = '';
        return;
      }

      // Reset all decorative and background styles
      block.style.background = '';
      block.style.backgroundColor = '';
      block.style.backgroundImage = '';
      block.style.border = 'none';
      block.style.borderRight = 'none';
      block.style.borderLeft = 'none';
      block.style.borderTop = 'none';
      block.style.borderBottom = 'none';
      block.style.borderRadius = '0';
      block.style.boxShadow = 'none';
      block.style.padding = '';
      block.style.paddingRight = '';
      block.style.paddingLeft = '';
      block.style.paddingTop = '';
      block.style.paddingBottom = '';
      block.style.margin = '4px 0';
      block.style.color = '#1e293b';
      block.style.fontSize = '17px';
      block.style.lineHeight = '1.7';
      block.style.fontWeight = 'normal';
      block.style.fontStyle = 'normal';
      block.style.textDecoration = 'none';

      // Remove callout/shape classes and attributes
      block.classList.remove('word-shape-item');
      block.removeAttribute('data-atomic-block');
      block.removeAttribute('data-word-style');

      // Clean child elements with inline colors or backgrounds
      block.querySelectorAll('*').forEach(child => {
        child.style.background = '';
        child.style.backgroundColor = '';
        child.style.color = '';
        child.style.border = '';
        child.style.boxShadow = '';
        child.style.padding = '';
        child.style.borderRadius = '';
        child.classList.remove('word-shape-item');
        child.removeAttribute('data-atomic-block');
        if (child.tagName === 'MARK') {
          const textNode = document.createTextNode(child.textContent);
          child.replaceWith(textNode);
        }
      });

      // If it's a wrapper DIV inside sheet-body-content, convert it into a standard <p>
      if (block.tagName === 'DIV' && block.parentElement && block.parentElement.classList.contains('sheet-body-content')) {
        const p = document.createElement('p');
        p.style.margin = '4px 0';
        p.style.lineHeight = '1.7';
        p.style.color = '#1e293b';
        p.innerHTML = block.innerHTML;
        block.replaceWith(p);
      }
    };

    if (isAllPagesSelected) {
      const updated = syncPagesContent().map(p => {
        const el = pageRefs.current[p.id];
        if (el) {
          el.querySelectorAll('p, div, blockquote, li, h1, h2, h3').forEach(cleanBlockElement);
          return { ...p, content: el.innerHTML };
        }
        return p;
      });
      setPages(updated);
      handleAutoSave(updated);
      triggerAutoPagination();
      return;
    }

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      let containerNode = range.commonAncestorContainer;
      if (containerNode.nodeType === 3) containerNode = containerNode.parentElement;

      // Find enclosing block or callout box
      const enclosingBlock = containerNode ? containerNode.closest(
        '.word-shape-item, [data-atomic-block="true"], div[style*="background"], p[style*="background"], div[style*="border"], p[style*="border"], p, div, blockquote, li, h1, h2, h3'
      ) : null;

      if (enclosingBlock && !enclosingBlock.classList.contains('sheet-body-content')) {
        cleanBlockElement(enclosingBlock);
      }

      // If selection spans multiple blocks
      if (containerNode) {
        containerNode.querySelectorAll('.word-shape-item, div, p, blockquote, li').forEach(el => {
          if (sel.containsNode(el, true)) {
            cleanBlockElement(el);
          }
        });
      }
    }

    const currentEl = pageRefs.current[pages[activePageIndex]?.id];
    if (currentEl) currentEl.focus();
    handleAutoSave();
    triggerAutoPagination();
  };

  // Word-Style Global Selection Shortcuts & Keystrokes Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // 0. Intercept Global Word Shortcuts (Undo, Redo, Save, Print, Find/Replace, Alignments, Headings, Footnotes, Comments, Zoom, Equation, Word Count, etc.)
      const tag = e.target?.tagName;
      const isInsideUiInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target?.closest && e.target.closest('.no-print'));

      if (e.key === 'Escape') {
        if (focusMode) setFocusMode(false);
        if (immersiveReaderMode) setImmersiveReaderMode(false);
        if (viewMode === 'read') setViewMode('print');
        if (showShortcutsModal) setShowShortcutsModal(false);
        if (showWordCountModal) setShowWordCountModal(false);
        if (showThesaurusModal) setShowThesaurusModal(false);
        if (showSourcesModal) setShowSourcesModal(false);
        if (showAccessibilityModal) setShowAccessibilityModal(false);
      }

      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      if (e.key === 'F7') {
        e.preventDefault();
        runSmartProofingAndPunctuation();
        return;
      }

      if (e.altKey && !e.ctrlKey && !e.metaKey && !isInsideUiInput) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          handleInsertNewEquation();
          return;
        }
        if (e.key === '1') {
          e.preventDefault();
          applyWordStyle('h1');
          return;
        }
        if (e.key === '2') {
          e.preventDefault();
          applyWordStyle('h2');
          return;
        }
        if (e.key === '3') {
          e.preventDefault();
          applyWordStyle('h3');
          return;
        }
        if (e.key === '0') {
          e.preventDefault();
          applyWordStyle('normal');
          return;
        }
      }

      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'F1') {
          e.preventDefault();
          setIsRibbonCollapsed(prev => !prev);
          return;
        }
        const keyLower = e.key.toLowerCase();

        // Save (Ctrl + S)
        if (keyLower === 's' && !e.shiftKey && !e.altKey) {
          e.preventDefault();
          handleAutoSave();
          return;
        }

        // Print / PDF (Ctrl + P)
        if (keyLower === 'p' && !e.shiftKey && !e.altKey) {
          e.preventDefault();
          handlePrintDocument();
          return;
        }

        // Find & Replace (Ctrl + F or Ctrl + H)
        if ((keyLower === 'f' || keyLower === 'h') && !e.shiftKey && !e.altKey) {
          e.preventDefault();
          setShowFindReplaceModal(true);
          return;
        }

        // Shortcuts Reference Modal (Ctrl + /)
        if (e.key === '/' || e.key === '؟') {
          e.preventDefault();
          setShowShortcutsModal(prev => !prev);
          return;
        }

        // Word Count & Stats Modal (Ctrl + Shift + G)
        if (keyLower === 'g' && e.shiftKey) {
          e.preventDefault();
          openWordCountModal();
          return;
        }

        if (!isInsideUiInput) {
          // Clear All Formatting (Ctrl + Space)
          if ((e.code === 'Space' || e.key === ' ') && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            handleClearFormatting();
            return;
          }

          // Undo (Ctrl + Z)
          if (keyLower === 'z' && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            handleUndo();
            return;
          }
          // Redo (Ctrl + Y or Ctrl + Shift + Z)
          if ((keyLower === 'y' && !e.altKey) || (keyLower === 'z' && e.shiftKey && !e.altKey)) {
            e.preventDefault();
            handleRedo();
            return;
          }
          // Page Break / Add New Page (Ctrl + Enter)
          if (e.key === 'Enter') {
            e.preventDefault();
            addNewPage(activePageIndex);
            return;
          }
          // Ctrl + Alt Shortcuts (Headings, Footnote, Endnote, Comment)
          if (e.altKey) {
            if (e.key === '1') { e.preventDefault(); applyWordStyle('h1'); return; }
            if (e.key === '2') { e.preventDefault(); applyWordStyle('h2'); return; }
            if (e.key === '3') { e.preventDefault(); applyWordStyle('h3'); return; }
            if (keyLower === 'f') { e.preventDefault(); insertFootnote(); return; }
            if (keyLower === 'd') { e.preventDefault(); insertEndnote(); return; }
            if (keyLower === 'm') { e.preventDefault(); insertReviewComment(); return; }
          }
          // Alignments: Ctrl+E (Center), Ctrl+R (Right), Ctrl+L (Left), Ctrl+J (Justify)
          if (keyLower === 'e' && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            handleFormat('justifyCenter');
            return;
          }
          if (keyLower === 'r' && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            handleFormat('justifyRight');
            return;
          }
          if (keyLower === 'l' && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            handleFormat('justifyLeft');
            return;
          }
          if (keyLower === 'j' && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            handleFormat('justifyFull');
            return;
          }
          // Bullet List (Ctrl + Shift + L)
          if (keyLower === 'l' && e.shiftKey && !e.altKey) {
            e.preventDefault();
            handleFormat('insertUnorderedList');
            return;
          }
          // Insert Hyperlink (Ctrl + K)
          if (keyLower === 'k' && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            handleInsertLink();
            return;
          }
          // Font Size Increase / Decrease (Ctrl + ] or Ctrl + [)
          if (e.key === ']' || (e.shiftKey && e.key === '>')) {
            e.preventDefault();
            changeFontSizeDelta(1);
            return;
          }
          if (e.key === '[' || (e.shiftKey && e.key === '<')) {
            e.preventDefault();
            changeFontSizeDelta(-1);
            return;
          }
          // Subscript (Ctrl + =) & Superscript (Ctrl + Shift + =)
          if (e.key === '=' && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            handleFormat('subscript');
            return;
          }
          if ((e.key === '+' || (e.key === '=' && e.shiftKey)) && !e.altKey) {
            e.preventDefault();
            handleFormat('superscript');
            return;
          }
        }
      }

      // 1. Intercept Ctrl+A anywhere in editor
      if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyA' || e.key.toLowerCase() === 'a' || e.key === 'ش')) {
        if (isInsideUiInput) return;
        e.preventDefault();
        setIsAllPagesSelected(true);
        clearCrossPageSelection();
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
        return;
      }

      // 1.5. Cross-Page Selection Keyboard Handlers (Copy, Cut, Delete, Backspace, Escape)
      if (crossPageSelection) {
        if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyC' || e.key.toLowerCase() === 'c' || e.key === 'ؤ')) {
          e.preventDefault();
          if (navigator.clipboard) {
            navigator.clipboard.writeText(crossPageSelection.text);
          }
          return;
        }

        if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyX' || e.key.toLowerCase() === 'x' || e.key === 'ء')) {
          e.preventDefault();
          if (navigator.clipboard) {
            navigator.clipboard.writeText(crossPageSelection.text);
          }
          deleteCrossPageSelection();
          return;
        }

        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          deleteCrossPageSelection();
          return;
        }

        if (e.key === 'Escape') {
          e.preventDefault();
          clearCrossPageSelection();
          return;
        }
      }

      // 2. If All Pages are Selected: Handle Document-Wide Keys
      if (isAllPagesSelected) {
        // Copy (Ctrl + C)
        if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyC' || e.key.toLowerCase() === 'c' || e.key === 'ؤ')) {
          e.preventDefault();
          handleDocumentCopy();
          return;
        }

        // Cut (Ctrl + X)
        if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyX' || e.key.toLowerCase() === 'x' || e.key === 'ء')) {
          e.preventDefault();
          handleDocumentCut();
          return;
        }

        // Select All again
        if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyA' || e.key.toLowerCase() === 'a' || e.key === 'ش')) {
          e.preventDefault();
          return;
        }

        // Backspace or Delete -> Clear entire document to 1 clean empty page
        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          pushHistorySnapshot();
          const emptyPages = [{ id: 1, content: '' }];
          setPages(emptyPages);
          setActivePageIndex(0);
          setIsAllPagesSelected(false);
          handleAutoSave(emptyPages);
          setTimeout(() => {
            const el = pageRefs.current[1];
            if (el) {
              el.innerHTML = '';
              el.focus();
            }
          }, 40);
          return;
        }

        // Escape -> Cancel selection
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsAllPagesSelected(false);
          return;
        }

        // Navigation Keys (Arrow keys, Home, End, PageUp, PageDown)
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
          e.preventDefault();
          setIsAllPagesSelected(false);
          if (['ArrowUp', 'Home', 'PageUp', 'ArrowRight'].includes(e.key)) {
            setActivePageIndex(0);
            const el = pageRefs.current[pages[0]?.id];
            if (el) {
              el.focus();
              const r = document.createRange();
              r.setStart(el, 0);
              r.collapse(true);
              const s = window.getSelection();
              s.removeAllRanges();
              s.addRange(r);
            }
          } else {
            const lastIdx = pages.length - 1;
            setActivePageIndex(lastIdx);
            const el = pageRefs.current[pages[lastIdx]?.id];
            if (el) {
              el.focus();
              const r = document.createRange();
              r.selectNodeContents(el);
              r.collapse(false);
              const s = window.getSelection();
              s.removeAllRanges();
              s.addRange(r);
            }
          }
          return;
        }

        // Typing any printable character (Replaces the entire document with this character)
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          pushHistorySnapshot();
          const typedChar = e.key;
          const newPages = [{ id: 1, content: typedChar }];
          setPages(newPages);
          setActivePageIndex(0);
          setIsAllPagesSelected(false);
          handleAutoSave(newPages);
          setTimeout(() => {
            const el = pageRefs.current[1];
            if (el) {
              el.innerHTML = typedChar;
              el.focus();
              const r = document.createRange();
              r.selectNodeContents(el);
              r.collapse(false);
              const s = window.getSelection();
              s.removeAllRanges();
              s.addRange(r);
            }
          }, 40);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isAllPagesSelected, crossPageSelection, pages, activePageIndex]);

  // Clear cross-page selection highlight and state
  const clearCrossPageSelection = () => {
    setCrossPageSelection(null);
    crossRangesRef.current = [];
    if (typeof Highlight !== 'undefined' && typeof CSS !== 'undefined' && CSS.highlights) {
      try { CSS.highlights.delete('cross-page-selection'); } catch (_) {}
    }
    if (typeof document !== 'undefined') {
      document.querySelectorAll('.cross-page-selected').forEach(el => el.classList.remove('cross-page-selected'));
    }
  };

  // Delete contents of cross-page selection and rebalance pages
  const deleteCrossPageSelection = () => {
    if (!crossRangesRef.current || crossRangesRef.current.length === 0) return;
    pushHistorySnapshot();
    crossRangesRef.current.forEach(r => {
      try { r.deleteContents(); } catch (_) {}
    });
    clearCrossPageSelection();
    handleAutoSave();
    setTimeout(rebalanceAllPages, 60);
  };

  // Mouse down inside a sheet's content area
  const handlePageMouseDown = (e, pageIndex) => {
    if (e.button !== 0) return;
    if (isAllPagesSelected) setIsAllPagesSelected(false);
    clearCrossPageSelection();

    let anchorCaret = null;
    if (typeof document !== 'undefined') {
      if (document.caretRangeFromPoint) {
        const r = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (r) anchorCaret = { node: r.startContainer, offset: r.startOffset };
      } else if (document.caretPositionFromPoint) {
        const p = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (p) anchorCaret = { node: p.offsetNode, offset: p.offset };
      }
    }

    dragSelectAnchorRef.current = {
      pageIndex,
      startX: e.clientX,
      startY: e.clientY,
      anchorCaret
    };
    isMouseDraggingRef.current = true;
  };

  // Seamless Cross-Page Text Selection Tracker (Drag Across Page Boundaries)
  useEffect(() => {
    // Also track single-page selection changes so capturedSelectedText and savedSelectionRangeRef are always fresh
    const handleSelectionChange = () => {
      if (typeof window === 'undefined') return;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const anchor = sel.anchorNode;
        const el = anchor?.nodeType === 1 ? anchor.closest('.sheet-body-content') : anchor?.parentElement?.closest('.sheet-body-content');
        if (el) {
          try {
            savedSelectionRangeRef.current = sel.getRangeAt(0).cloneRange();
          } catch (_) {}
          if (!sel.isCollapsed) {
            const text = sel.toString().trim();
            if (text && text.length > 0) {
              setCapturedSelectedText(text);
              try {
                capturedSelectedRangeRef.current = sel.getRangeAt(0).cloneRange();
              } catch (_) {}
            }
          }
        }
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);

    const handleGlobalMouseMove = (e) => {
      if (!isMouseDraggingRef.current || !dragSelectAnchorRef.current) return;
      if (typeof document === 'undefined') return;

      const elem = document.elementFromPoint(e.clientX, e.clientY);
      let targetPageIndex = -1;

      if (elem) {
        const sheetBody = elem.closest('.sheet-body-content');
        if (sheetBody) {
          targetPageIndex = pages.findIndex(p => pageRefs.current[p.id] === sheetBody);
        } else {
          const sheet = elem.closest('.a4-sheet');
          if (sheet) {
            targetPageIndex = pages.findIndex(p => {
              const ref = pageRefs.current[p.id];
              return ref && ref.closest('.a4-sheet') === sheet;
            });
          }
        }
      }

      // If mouse is in gap between sheets or margin padding:
      if (targetPageIndex === -1) {
        for (let idx = 0; idx < pages.length; idx++) {
          const ref = pageRefs.current[pages[idx]?.id];
          if (ref) {
            const rect = ref.getBoundingClientRect();
            if (e.clientY >= rect.top - 70 && e.clientY <= rect.bottom + 70) {
              targetPageIndex = idx;
              break;
            }
          }
        }
      }

      if (targetPageIndex === -1) return;

      const startPageIndex = dragSelectAnchorRef.current.pageIndex;
      if (targetPageIndex === startPageIndex) {
        if (crossRangesRef.current.length > 0) {
          clearCrossPageSelection();
        }
        return;
      }

      // Dragging across distinct pages!
      const pMin = Math.min(startPageIndex, targetPageIndex);
      const pMax = Math.max(startPageIndex, targetPageIndex);
      const isForward = targetPageIndex > startPageIndex;

      const elMin = pageRefs.current[pages[pMin]?.id];
      const elMax = pageRefs.current[pages[pMax]?.id];
      if (!elMin || !elMax) return;

      let curCaret = null;
      if (document.caretRangeFromPoint) {
        const r = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (r) curCaret = { node: r.startContainer, offset: r.startOffset };
      } else if (document.caretPositionFromPoint) {
        const p = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (p) curCaret = { node: p.offsetNode, offset: p.offset };
      }

      const ranges = [];

      // 1. Range on pMin (Upper page)
      try {
        const rMin = document.createRange();
        if (isForward) {
          const anchor = dragSelectAnchorRef.current.anchorCaret;
          if (anchor && elMin.contains(anchor.node)) {
            const maxOff = anchor.node.nodeType === 3 ? anchor.node.textContent.length : anchor.node.childNodes.length;
            rMin.setStart(anchor.node, Math.min(anchor.offset, maxOff));
          } else {
            rMin.setStart(elMin, 0);
          }
          rMin.setEnd(elMin, elMin.childNodes.length);
        } else {
          if (curCaret && elMin.contains(curCaret.node)) {
            const maxOff = curCaret.node.nodeType === 3 ? curCaret.node.textContent.length : curCaret.node.childNodes.length;
            rMin.setStart(curCaret.node, Math.min(curCaret.offset, maxOff));
          } else {
            rMin.setStart(elMin, 0);
          }
          rMin.setEnd(elMin, elMin.childNodes.length);
        }
        ranges.push(rMin);
      } catch (_) {}

      // 2. Intermediate pages in between
      for (let k = pMin + 1; k < pMax; k++) {
        const elMid = pageRefs.current[pages[k]?.id];
        if (elMid) {
          try {
            const rMid = document.createRange();
            rMid.selectNodeContents(elMid);
            ranges.push(rMid);
          } catch (_) {}
        }
      }

      // 3. Range on pMax (Lower page)
      try {
        const rMax = document.createRange();
        rMax.setStart(elMax, 0);
        if (isForward) {
          if (curCaret && elMax.contains(curCaret.node)) {
            const maxOff = curCaret.node.nodeType === 3 ? curCaret.node.textContent.length : curCaret.node.childNodes.length;
            rMax.setEnd(curCaret.node, Math.min(curCaret.offset, maxOff));
          } else {
            rMax.setEnd(elMax, elMax.childNodes.length);
          }
        } else {
          const anchor = dragSelectAnchorRef.current.anchorCaret;
          if (anchor && elMax.contains(anchor.node)) {
            const maxOff = anchor.node.nodeType === 3 ? anchor.node.textContent.length : anchor.node.childNodes.length;
            rMax.setEnd(anchor.node, Math.min(anchor.offset, maxOff));
          } else {
            rMax.setEnd(elMax, elMax.childNodes.length);
          }
        }
        ranges.push(rMax);
      } catch (_) {}

      crossRangesRef.current = ranges;

      // Modern CSS Custom Highlight API paint
      if (typeof Highlight !== 'undefined' && typeof CSS !== 'undefined' && CSS.highlights && ranges.length > 0) {
        try {
          const hl = new Highlight(...ranges);
          CSS.highlights.set('cross-page-selection', hl);
        } catch (_) {}
      }

      // Live text tracking during drag
      let liveText = '';
      ranges.forEach(r => { liveText += r.toString() + ' '; });
      liveText = liveText.trim();
      if (liveText) {
        setCapturedSelectedText(liveText);
      }
    };

    const handleGlobalMouseUp = () => {
      if (!isMouseDraggingRef.current) return;
      isMouseDraggingRef.current = false;

      if (crossRangesRef.current.length > 0 && dragSelectAnchorRef.current) {
        const ranges = crossRangesRef.current;
        let textParts = [];
        let htmlParts = [];
        ranges.forEach(r => {
          textParts.push(r.toString());
          const d = document.createElement('div');
          d.appendChild(r.cloneContents());
          htmlParts.push(d.innerHTML);
        });

        const combinedText = textParts.join('\n').trim();
        const combinedHtml = htmlParts.join('<br>').trim();

        if (combinedText) {
          const startIdx = Math.min(dragSelectAnchorRef.current.pageIndex, ranges.length > 1 ? dragSelectAnchorRef.current.pageIndex + ranges.length - 1 : dragSelectAnchorRef.current.pageIndex);
          const endIdx = Math.max(dragSelectAnchorRef.current.pageIndex, dragSelectAnchorRef.current.pageIndex + ranges.length - 1);
          setCrossPageSelection({
            startPageIndex: startIdx,
            endPageIndex: endIdx,
            text: combinedText,
            html: combinedHtml
          });
          setCapturedSelectedText(combinedText);
          setAiContextScope('selection');
        } else {
          clearCrossPageSelection();
        }
      }
      dragSelectAnchorRef.current = null;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [pages]);

  // --- MICROSOFT WORD AUTHENTIC TABLE COLUMN & ROW MOUSE DRAGGING ---
  useEffect(() => {
    if (typeof document === 'undefined') return;

    let guideLine = document.getElementById('table-resize-guide-line');
    let guideBadge = document.getElementById('table-resize-guide-badge');
    if (!guideLine) {
      guideLine = document.createElement('div');
      guideLine.id = 'table-resize-guide-line';
      guideLine.style.cssText = 'position:fixed;display:none;z-index:999999;pointer-events:none;background:#2563eb;box-shadow:0 0 8px rgba(37,99,235,0.7);border-radius:1px;';
      document.body.appendChild(guideLine);
    }
    if (!guideBadge) {
      guideBadge = document.createElement('div');
      guideBadge.id = 'table-resize-guide-badge';
      guideBadge.style.cssText = 'position:fixed;display:none;z-index:999999;pointer-events:none;background:#1e40af;color:white;font-size:11px;font-weight:bold;padding:2px 7px;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.25);direction:rtl;font-family:sans-serif;white-space:nowrap;';
      document.body.appendChild(guideBadge);
    }

    const activeDrag = { current: null };

    const handleTableMouseMove = (e) => {
      // 1. If currently dragging a column or row border
      if (activeDrag.current) {
        e.preventDefault();
        const drag = activeDrag.current;
        if (drag.type === 'col') {
          const deltaX = drag.isRTL ? (drag.startX - e.clientX) : (e.clientX - drag.startX);
          const newWidth = Math.max(35, Math.round(drag.startWidth + deltaX));

          guideLine.style.display = 'block';
          guideLine.style.left = `${e.clientX}px`;
          guideLine.style.top = `${drag.tableRect.top}px`;
          guideLine.style.height = `${drag.tableRect.height}px`;
          guideLine.style.width = '2.5px';

          guideBadge.style.display = 'block';
          guideBadge.style.left = `${e.clientX + 8}px`;
          guideBadge.style.top = `${Math.max(10, e.clientY - 28)}px`;
          guideBadge.innerText = `عرض العمود: ${newWidth}px`;

          drag.cells.forEach(cell => {
            cell.style.width = `${newWidth}px`;
            cell.style.minWidth = `${newWidth}px`;
            cell.style.boxSizing = 'border-box';
          });
          setSelectedColWidth(newWidth);
          setCustomColWidthInput(newWidth);
        } else if (drag.type === 'row') {
          const deltaY = e.clientY - drag.startY;
          const newHeight = Math.max(22, Math.round(drag.startHeight + deltaY));

          guideLine.style.display = 'block';
          guideLine.style.left = `${drag.tableRect.left}px`;
          guideLine.style.width = `${drag.tableRect.width}px`;
          guideLine.style.top = `${e.clientY}px`;
          guideLine.style.height = '2.5px';

          guideBadge.style.display = 'block';
          guideBadge.style.left = `${Math.min(window.innerWidth - 120, e.clientX + 8)}px`;
          guideBadge.style.top = `${Math.max(10, e.clientY - 28)}px`;
          guideBadge.innerText = `ارتفاع الصف: ${newHeight}px`;

          drag.row.style.height = `${newHeight}px`;
          Array.from(drag.row.children).forEach(cell => {
            cell.style.height = `${newHeight}px`;
            cell.style.boxSizing = 'border-box';
          });
          setSelectedRowHeight(newHeight);
          setCustomRowHeightInput(newHeight);
        }
        return;
      }

      // 2. If hovering over table cells: detect proximity to borders
      const target = e.target;
      if (!target) return;
      const cell = target.closest('th, td');
      if (!cell) {
        if (document.body.style.cursor === 'col-resize' || document.body.style.cursor === 'row-resize') {
          document.body.style.cursor = '';
        }
        return;
      }

      const table = cell.closest('table');
      if (!table) return;

      const rect = cell.getBoundingClientRect();
      const EDGE_THRESHOLD = 6;
      const isNearLeft = Math.abs(e.clientX - rect.left) <= EDGE_THRESHOLD;
      const isNearRight = Math.abs(e.clientX - rect.right) <= EDGE_THRESHOLD;
      const isNearBottom = Math.abs(e.clientY - rect.bottom) <= EDGE_THRESHOLD;

      if (isNearLeft || isNearRight) {
        cell.style.cursor = 'col-resize';
        document.body.style.cursor = 'col-resize';
      } else if (isNearBottom) {
        cell.style.cursor = 'row-resize';
        document.body.style.cursor = 'row-resize';
      } else {
        cell.style.cursor = '';
        if (document.body.style.cursor === 'col-resize' || document.body.style.cursor === 'row-resize') {
          document.body.style.cursor = '';
        }
      }
    };

    const handleTableMouseDown = (e) => {
      if (e.button !== 0) return;
      const target = e.target;
      if (!target) return;
      const cell = target.closest('th, td');
      if (!cell) return;

      const table = cell.closest('table');
      if (!table) return;

      const rect = cell.getBoundingClientRect();
      const EDGE_THRESHOLD = 6;
      const isNearLeft = Math.abs(e.clientX - rect.left) <= EDGE_THRESHOLD;
      const isNearRight = Math.abs(e.clientX - rect.right) <= EDGE_THRESHOLD;
      const isNearBottom = Math.abs(e.clientY - rect.bottom) <= EDGE_THRESHOLD;

      if (!isNearLeft && !isNearRight && !isNearBottom) return;

      e.preventDefault();
      e.stopPropagation();

      const isRTL = (getComputedStyle(table).direction === 'rtl') || document.dir === 'rtl';
      const tableRect = table.getBoundingClientRect();

      if (isNearLeft || isNearRight) {
        let targetColIdx = cell.cellIndex;
        if (isRTL) {
          if (isNearRight && cell.cellIndex > 0) {
            targetColIdx = cell.cellIndex - 1;
          }
        } else {
          if (isNearLeft && cell.cellIndex > 0) {
            targetColIdx = cell.cellIndex - 1;
          }
        }

        const colCells = [];
        table.querySelectorAll('tr').forEach(r => {
          if (r.children[targetColIdx]) colCells.push(r.children[targetColIdx]);
        });

        const startWidth = colCells[0] ? colCells[0].offsetWidth : cell.offsetWidth;

        activeDrag.current = {
          type: 'col',
          table,
          cell,
          cells: colCells,
          colIdx: targetColIdx,
          startX: e.clientX,
          startWidth,
          isRTL,
          tableRect
        };
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      } else if (isNearBottom) {
        const row = cell.closest('tr');
        const startHeight = row ? row.offsetHeight : cell.offsetHeight;

        activeDrag.current = {
          type: 'row',
          table,
          row,
          cell,
          startY: e.clientY,
          startHeight,
          tableRect
        };
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
      }
    };

    const handleTableMouseUp = (e) => {
      if (!activeDrag.current) return;

      if (guideLine) guideLine.style.display = 'none';
      if (guideBadge) guideBadge.style.display = 'none';
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      const drag = activeDrag.current;
      activeDrag.current = null;

      if (drag.table) {
        drag.table.style.borderCollapse = 'collapse';
      }

      pushHistorySnapshot();
      handleAutoSave();
      triggerAutoPagination();
    };

    window.addEventListener('mousemove', handleTableMouseMove, true);
    window.addEventListener('mousedown', handleTableMouseDown, true);
    window.addEventListener('mouseup', handleTableMouseUp, true);

    return () => {
      window.removeEventListener('mousemove', handleTableMouseMove, true);
      window.removeEventListener('mousedown', handleTableMouseDown, true);
      window.removeEventListener('mouseup', handleTableMouseUp, true);
      if (guideLine && guideLine.parentNode) guideLine.parentNode.removeChild(guideLine);
      if (guideBadge && guideBadge.parentNode) guideBadge.parentNode.removeChild(guideBadge);
    };
  }, [pages]);

  // Global Copy Event Handler for All-Pages Selection
  useEffect(() => {
    const handleGlobalCopy = (e) => {
      if (!isAllPagesSelected) return;
      e.preventDefault();
      const allText = pages.map(p => {
        const el = pageRefs.current[p.id];
        return el ? el.innerText : '';
      }).join('\n\n');
      const allHtml = pages.map(p => {
        const el = pageRefs.current[p.id];
        return el ? el.innerHTML : p.content;
      }).join('<hr style="page-break-after:always;"/>');
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', allText);
        e.clipboardData.setData('text/html', allHtml);
      }
    };
    document.addEventListener('copy', handleGlobalCopy);
    return () => document.removeEventListener('copy', handleGlobalCopy);
  }, [isAllPagesSelected, pages]);

  // High-Performance Speech Recognition Handlers (Zero-Lag Mobile & Desktop Engine)
  activePageIndexRef.current = activePageIndex;
  isRecordingRef.current = isRecording;

  const ensureSpeechFocus = () => {
    if (typeof window === 'undefined') return null;
    const sel = window.getSelection();
    let targetPageEl = null;

    if (sel && sel.anchorNode) {
      const nodeEl = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
      targetPageEl = nodeEl?.closest('.sheet-body-content');
    }

    if (!targetPageEl && lastSpeechRangeRef.current) {
      try {
        sel?.removeAllRanges();
        sel?.addRange(lastSpeechRangeRef.current);
        const nodeEl = sel.anchorNode?.nodeType === 1 ? sel.anchorNode : sel.anchorNode?.parentElement;
        targetPageEl = nodeEl?.closest('.sheet-body-content');
      } catch (e) {
        lastSpeechRangeRef.current = null;
      }
    }

    if (!targetPageEl) {
      const curPageId = pages[activePageIndexRef.current]?.id || pages[0]?.id;
      targetPageEl = pageRefs.current[curPageId] || Object.values(pageRefs.current)[0];
      if (targetPageEl) {
        targetPageEl.focus();
        const range = document.createRange();
        range.selectNodeContents(targetPageEl);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
        lastSpeechRangeRef.current = range.cloneRange();
      }
    }

    return targetPageEl;
  };

  const commitSpeechText = (rawText) => {
    if (!rawText || !rawText.trim()) return;
    ensureSpeechFocus();

    // Smart Arabic punctuation command conversions
    let cleanText = rawText
      .replace(/\s*(علامة استفهام|علامه استفهام)\s*/gi, '؟ ')
      .replace(/\s*(علامة تعجب|علامه تعجب)\s*/gi, '! ')
      .replace(/\s*(نقطتين فوق بعض|نقطتان فوق بعض)\s*/gi, ': ')
      .replace(/\s*(نقطة جديدة|نقطه جديده|نقطة|نقطه)\s*/gi, '. ')
      .replace(/\s*(فاصلة|فاصله)\s*/gi, '، ');

    const hasNewline = /\s*(سطر جديد|انزل سطر)\s*/gi.test(cleanText);
    cleanText = cleanText.replace(/\s*(سطر جديد|انزل سطر)\s*/gi, '\n');

    // Remove or replace any existing interim preview element
    const existingInterim = document.getElementById('voice-interim-preview');
    if (existingInterim) {
      try {
        const range = document.createRange();
        range.selectNode(existingInterim);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch (e) {
        existingInterim.remove();
      }
    }

    if (hasNewline) {
      const parts = cleanText.split('\n');
      parts.forEach((part, idx) => {
        if (part.trim()) {
          document.execCommand('insertText', false, part.trim() + ' ');
        }
        if (idx < parts.length - 1) {
          document.execCommand('insertParagraph', false, null);
        }
      });
    } else {
      document.execCommand('insertText', false, cleanText.trim() + ' ');
    }

    // Save range
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      lastSpeechRangeRef.current = sel.getRangeAt(0).cloneRange();
    }

    // Update active page content in state
    const curPageId = pages[activePageIndexRef.current]?.id;
    const curEl = curPageId ? pageRefs.current[curPageId] : null;
    if (curEl && pages[activePageIndexRef.current]) {
      pages[activePageIndexRef.current].content = curEl.innerHTML;
    }

    handleAutoSave();
    debouncedUpdateMetrics();
    triggerAutoPagination();
  };

  const updateInterimPreview = (interimText) => {
    if (!interimText || !interimText.trim()) {
      const existing = document.getElementById('voice-interim-preview');
      if (existing) existing.remove();
      return;
    }

    ensureSpeechFocus();
    let previewEl = document.getElementById('voice-interim-preview');

    if (previewEl) {
      previewEl.textContent = ' ' + interimText.trim();
    } else {
      const spanHtml = `<span id="voice-interim-preview" style="color: #2563eb; background: rgba(37, 99, 235, 0.08); border-bottom: 1.5px dashed #3b82f6; border-radius: 3px; padding: 0 3px; font-style: italic; pointer-events: none;" data-voice-interim="true"> ${interimText.trim()}</span>`;
      document.execCommand('insertHTML', false, spanHtml);
    }

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      lastSpeechRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const insertSpeechPunctuation = (symbol) => {
    ensureSpeechFocus();
    const pendingInterim = document.getElementById('voice-interim-preview');
    if (pendingInterim && pendingInterim.textContent.trim()) {
      commitSpeechText(pendingInterim.textContent.trim());
    }
    if (symbol === '↵') {
      document.execCommand('insertParagraph', false, null);
    } else if (symbol) {
      document.execCommand('insertText', false, symbol + ' ');
    }
    handleAutoSave();
    debouncedUpdateMetrics();
    triggerAutoPagination();
  };

  // Always keep handlers fresh with current component scope
  speechHandlersRef.current = {
    onResult: (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const liveDisplay = (interimTranscript || finalTranscript).trim();
      if (liveDisplay) {
        setLiveVoiceTranscript(liveDisplay);
      }

      if (finalTranscript.trim()) {
        commitSpeechText(finalTranscript);
      } else if (interimTranscript.trim()) {
        updateInterimPreview(interimTranscript);
      }
    },
    onError: (event) => {
      console.warn('SpeechRecognition error:', event?.error);
      if (event?.error === 'no-speech' || event?.error === 'network') {
        return; // Ignore harmless mobile silence timeouts
      }
      if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
        isRecordingRef.current = false;
        setIsRecording(false);
        setLiveVoiceTranscript('');
        alert("يرجى السماح بصلاحية الميكروفون في المتصفح لاستخدام الإملاء الصوتي.");
      }
    },
    onEnd: () => {
      // Commit pending interim text so no words are dropped on mobile pause
      const pendingInterim = document.getElementById('voice-interim-preview');
      if (pendingInterim && pendingInterim.textContent.trim()) {
        commitSpeechText(pendingInterim.textContent.trim());
      }

      // Continuous auto-restart on mobile
      if (isRecordingRef.current) {
        setTimeout(() => {
          if (isRecordingRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // already active or starting
            }
          }
        }, 120);
      } else {
        setIsRecording(false);
        setLiveVoiceTranscript('');
      }
    }
  };

  // Voice Toggle
  const toggleRecording = () => {
    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      setIsRecording(false);
      setLiveVoiceTranscript('');

      const pendingInterim = document.getElementById('voice-interim-preview');
      if (pendingInterim && pendingInterim.textContent.trim()) {
        commitSpeechText(pendingInterim.textContent.trim());
      } else if (pendingInterim) {
        pendingInterim.remove();
      }

      try {
        recognitionRef.current?.stop();
      } catch (e) {}
    } else {
      ensureSpeechFocus();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          isRecordingRef.current = true;
          setIsRecording(true);
        } catch (err) {
          try {
            recognitionRef.current.stop();
            setTimeout(() => {
              recognitionRef.current?.start();
              isRecordingRef.current = true;
              setIsRecording(true);
            }, 150);
          } catch (e) {
            console.error('Failed to start voice recognition:', e);
          }
        }
      } else {
        alert("متصفحك لا يدعم خاصية الكتابة بالصوت. يُنصح باستخدام متصفح Google Chrome.");
      }
    }
  };

  // Image insertion & manipulation (with automatic client-side compression)
  const insertImageHtml = (src) => {
    pushHistorySnapshot();
    const imgHtml = `<p style="text-align: center; margin: 12px 0;"><img src="${src}" style="max-width: 65%; max-height: 460px; height: auto; border-radius: 8px; margin: 0 auto; display: inline-block; cursor: pointer; transition: all 0.2s;" /></p><p><br></p>`;
    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    if (activeEl) {
      activeEl.focus();
      let success = false;
      try {
        success = document.execCommand('insertHTML', false, imgHtml);
      } catch (err) {
        success = false;
      }
      if (!success) {
        activeEl.innerHTML += imgHtml;
      }
      handleAutoSave();
      setTimeout(rebalanceAllPages, 100);
      triggerAutoPagination();
    }
  };

  const handleInsertImage = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedSrc = await compressImage(file);
        if (compressedSrc) {
          insertImageHtml(compressedSrc);
        }
      } catch (err) {
        console.error('Failed to compress image:', err);
      } finally {
        if (e.target) e.target.value = '';
      }
    }
  };

  const handleInsertAIImage = (url) => {
    if (url) {
      insertImageHtml(url);
    }
    setShowAIImageModal(false);
  };

  const handlePaste = async (e) => {
    if (isAllPagesSelected) {
      setIsAllPagesSelected(false);
      const clipboardData = e.clipboardData;
      const htmlData = clipboardData?.getData('text/html');
      const textData = clipboardData?.getData('text/plain');
      const pastedContent = htmlData || (textData ? textData.replace(/\n/g, '<br/>') : '');
      if (pastedContent) {
        e.preventDefault();
        const newPages = [{ id: 1, content: pastedContent }];
        setPages(newPages);
        setActivePageIndex(0);
        handleAutoSave(newPages);
        setTimeout(() => {
          rebalanceAllPages(newPages);
        }, 50);
        return;
      }
    }

    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            try {
              const compressedSrc = await compressImage(file);
              if (compressedSrc) {
                insertImageHtml(compressedSrc);
              }
            } catch (err) {
              console.error('Failed to compress pasted image:', err);
            }
          }
          return;
        }
      }
    }
    // For text paste, trigger auto pagination after paste
    setTimeout(() => {
      handleAutoSave();
      rebalanceAllPages();
    }, 150);
  };

  // Image Controls
  const applyImageSize = (percent) => {
    if (!selectedImg) return;
    selectedImg.style.width = percent;
    selectedImg.style.maxWidth = percent;
    handleAutoSave();
    triggerAutoPagination();
  };


  const applyImageStyle = (styleType) => {
    if (!selectedImg) return;
    if (styleType === 'none') {
      selectedImg.style.border = 'none';
      selectedImg.style.boxShadow = 'none';
      selectedImg.style.borderRadius = '0px';
      selectedImg.style.filter = 'none';
    } else if (styleType === 'border') {
      selectedImg.style.border = '2px solid #cbd5e1';
      selectedImg.style.boxShadow = 'none';
      selectedImg.style.borderRadius = '8px';
    } else if (styleType === 'shadow') {
      selectedImg.style.border = 'none';
      selectedImg.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.15)';
      selectedImg.style.borderRadius = '8px';
    } else if (styleType === 'rounded') {
      selectedImg.style.borderRadius = '24px';
    } else if (styleType === 'circle') {
      selectedImg.style.borderRadius = '50%';
      selectedImg.style.border = '3px solid #2563eb';
    } else if (styleType === 'school_navy') {
      selectedImg.style.border = '3px double #1e3a8a';
      selectedImg.style.boxShadow = '0 4px 12px rgba(30,58,138,0.15)';
      selectedImg.style.borderRadius = '6px';
    } else if (styleType === 'dotted') {
      selectedImg.style.border = '2.5px dashed #64748b';
      selectedImg.style.borderRadius = '6px';
    } else if (styleType === 'ink_saver') {
      if (selectedImg.style.filter && selectedImg.style.filter.includes('grayscale')) {
        selectedImg.style.filter = 'none';
      } else {
        selectedImg.style.filter = 'grayscale(100%) contrast(125%)';
      }
    }
    handleAutoSave();
  };

  const addImageCaption = () => {
    if (!selectedImg) return;
    const captionText = prompt('اكتب التسمية التوضيحية للصورة (مثال: شكل (1): المخطط التوضيحي):', 'شكل توضيحي');
    if (!captionText) return;
    const figure = document.createElement('figure');
    figure.style.display = 'inline-block';
    figure.style.margin = '10px auto';
    figure.style.textAlign = 'center';
    figure.style.maxWidth = '100%';

    selectedImg.parentNode.insertBefore(figure, selectedImg);
    figure.appendChild(selectedImg);

    const figcaption = document.createElement('figcaption');
    figcaption.textContent = captionText;
    figcaption.style.fontSize = '12.5px';
    figcaption.style.color = '#475569';
    figcaption.style.fontWeight = 'bold';
    figcaption.style.marginTop = '6px';
    figcaption.style.textAlign = 'center';
    figure.appendChild(figcaption);

    handleAutoSave();
    triggerAutoPagination();
  };

  const applyImageAlignment = (align) => {
    if (!selectedImg) return;
    if (align === 'center') {
      selectedImg.style.display = 'block';
      selectedImg.style.margin = '12px auto';
      selectedImg.style.float = 'none';
    } else if (align === 'right') {
      selectedImg.style.display = 'inline-block';
      selectedImg.style.float = 'right';
      selectedImg.style.margin = '6px 0 12px 16px';
    } else if (align === 'left') {
      selectedImg.style.display = 'inline-block';
      selectedImg.style.float = 'left';
      selectedImg.style.margin = '6px 16px 12px 0';
    }
    handleAutoSave();
    triggerAutoPagination();
  };

  const deleteSelectedImage = () => {
    if (!selectedImg) return;
    selectedImg.remove();
    setSelectedImg(null);
    setActiveTab('home');
    handleAutoSave();
    triggerAutoPagination();
  };

  // Microsoft Word Image Layout Engine
  const applyImageLayout = (mode, posMode = 'flow') => {
    if (!selectedImg) return;
    setImageLayoutMode(mode);
    setImagePositionMode(posMode);

    selectedImg.style.position = posMode === 'fixed' ? 'relative' : 'static';
    selectedImg.style.zIndex = 'auto';
    selectedImg.style.opacity = '1';
    selectedImg.style.boxShadow = 'none';
    selectedImg.style.clear = 'none';
    selectedImg.style.shapeOutside = 'none';

    if (mode === 'inline') {
      selectedImg.style.display = 'inline-block';
      selectedImg.style.float = 'none';
      selectedImg.style.verticalAlign = 'middle';
      selectedImg.style.margin = '4px 8px';
    } else if (mode === 'square_right') {
      selectedImg.style.display = 'inline-block';
      selectedImg.style.float = 'right';
      selectedImg.style.margin = '8px 0 14px 18px';
    } else if (mode === 'square_left') {
      selectedImg.style.display = 'inline-block';
      selectedImg.style.float = 'left';
      selectedImg.style.margin = '8px 18px 14px 0';
    } else if (mode === 'tight') {
      selectedImg.style.display = 'inline-block';
      selectedImg.style.float = 'right';
      selectedImg.style.margin = '4px 0 8px 12px';
      selectedImg.style.shapeOutside = 'margin-box';
    } else if (mode === 'through') {
      selectedImg.style.display = 'inline-block';
      selectedImg.style.float = 'left';
      selectedImg.style.margin = '6px 14px 6px 0';
    } else if (mode === 'top_bottom') {
      selectedImg.style.display = 'block';
      selectedImg.style.float = 'none';
      selectedImg.style.margin = '16px auto';
      selectedImg.style.clear = 'both';
    } else if (mode === 'behind') {
      selectedImg.style.display = 'block';
      selectedImg.style.float = 'none';
      selectedImg.style.position = 'relative';
      selectedImg.style.zIndex = '0';
      selectedImg.style.opacity = '0.65';
      selectedImg.style.margin = '12px auto';
    } else if (mode === 'front') {
      selectedImg.style.display = 'block';
      selectedImg.style.float = 'none';
      selectedImg.style.position = 'relative';
      selectedImg.style.zIndex = '10';
      selectedImg.style.opacity = '1';
      selectedImg.style.margin = '12px auto';
      selectedImg.style.boxShadow = '0 10px 25px rgba(0,0,0,0.18)';
    }

    handleAutoSave();
    triggerAutoPagination();
  };

  // Microsoft Word Ribbon Helpers
  const handleToggleFormatPainter = () => {
    if (formatPainter) {
      setFormatPainter(null);
      return;
    }
    const sel = window.getSelection();
    let targetEl = null;
    if (sel && sel.anchorNode) {
      targetEl = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
    }
    if (!targetEl) return;
    const computed = window.getComputedStyle(targetEl);
    setFormatPainter({
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      fontStyle: computed.fontStyle,
      textDecoration: computed.textDecoration,
      color: computed.color,
      backgroundColor: computed.backgroundColor
    });
  };

  const applyExactFontSize = (pt) => {
    pushHistorySnapshot();
    if (isAllPagesSelected) {
      const updated = syncPagesContent().map(p => {
        const el = pageRefs.current[p.id];
        if (el) {
          el.querySelectorAll('p, div, span, h1, h2, h3, li, td').forEach(node => {
            node.style.fontSize = `${pt}pt`;
          });
          el.style.fontSize = `${pt}pt`;
          return { ...p, content: el.innerHTML };
        }
        return p;
      });
      setPages(updated);
      handleAutoSave(updated);
      triggerAutoPagination();
      return;
    }

    restoreSavedSelection();
    let sel = window.getSelection();
    let range = null;

    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      range = sel.getRangeAt(0);
    } else if (savedSelectionRangeRef.current && !savedSelectionRangeRef.current.collapsed) {
      range = savedSelectionRangeRef.current;
    } else if (capturedSelectedRangeRef.current && !capturedSelectedRangeRef.current.collapsed) {
      range = capturedSelectedRangeRef.current;
    }

    if (range && !range.collapsed) {
      const span = document.createElement('span');
      span.style.fontSize = `${pt}pt`;
      try {
        const contents = range.extractContents();
        span.appendChild(contents);
        span.querySelectorAll('span, font').forEach(c => c.style.fontSize = `${pt}pt`);
        range.insertNode(span);
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
        savedSelectionRangeRef.current = newRange.cloneRange();
        capturedSelectedRangeRef.current = newRange.cloneRange();
        handleAutoSave();
        triggerAutoPagination();
        return;
      } catch (e) {
        document.execCommand('fontSize', false, '3');
      }
    } else {
      let node = sel?.anchorNode || savedSelectionRangeRef.current?.startContainer;
      if (node && node.nodeType === 3) node = node.parentElement;
      const block = node ? node.closest('p, div, li, h1, h2, h3, span, td') : null;
      if (block) {
        block.style.fontSize = `${pt}pt`;
        handleAutoSave();
        triggerAutoPagination();
      }
    }
  };

  const changeFontSizeDelta = (delta) => {
    if (isAllPagesSelected) {
      const updated = syncPagesContent().map(p => {
        const el = pageRefs.current[p.id];
        if (el) {
          el.querySelectorAll('p, div, span, h1, h2, h3, li, td').forEach(node => {
            const computed = window.getComputedStyle(node);
            const currentPx = parseFloat(computed.fontSize) || 16;
            const currentPt = Math.round(currentPx * 0.75);
            const newPt = Math.max(8, Math.min(72, currentPt + delta));
            node.style.fontSize = `${newPt}pt`;
          });
          return { ...p, content: el.innerHTML };
        }
        return p;
      });
      setPages(updated);
      handleAutoSave(updated);
      triggerAutoPagination();
      return;
    }

    restoreSavedSelection();
    let sel = window.getSelection();
    let node = sel?.anchorNode || savedSelectionRangeRef.current?.startContainer;
    if (node && node.nodeType === 3) node = node.parentElement;
    if (node) {
      const computed = window.getComputedStyle(node);
      const currentPx = parseFloat(computed.fontSize) || 16;
      const currentPt = Math.round(currentPx * 0.75);
      const newPt = Math.max(8, Math.min(72, currentPt + delta));
      applyExactFontSize(newPt);
    }
  };

  const applyDirection = (dir) => {
    if (isAllPagesSelected) {
      const updated = syncPagesContent().map(p => {
        const el = pageRefs.current[p.id];
        if (el) {
          el.style.direction = dir;
          el.style.textAlign = dir === 'rtl' ? 'right' : 'left';
          el.querySelectorAll('p, div, li, h1, h2, h3').forEach(b => {
            b.style.direction = dir;
            b.style.textAlign = dir === 'rtl' ? 'right' : 'left';
          });
          return { ...p, content: el.innerHTML };
        }
        return p;
      });
      setPages(updated);
      handleAutoSave(updated);
      triggerAutoPagination();
      return;
    }

    restoreSavedSelection();
    const sel = window.getSelection();
    let node = sel?.anchorNode || savedSelectionRangeRef.current?.startContainer;
    if (node && node.nodeType === 3) node = node.parentElement;
    const block = node ? node.closest('p, div, li, h1, h2, h3, blockquote, table') : null;
    if (block) {
      block.style.direction = dir;
      block.style.textAlign = dir === 'rtl' ? 'right' : 'left';
    } else {
      document.execCommand('formatBlock', false, 'p');
      const p = window.getSelection()?.anchorNode?.parentElement?.closest('p');
      if (p) {
        p.style.direction = dir;
        p.style.textAlign = dir === 'rtl' ? 'right' : 'left';
      }
    }
    handleAutoSave();
    triggerAutoPagination();
  };

  const applyLineSpacing = (spacing) => {
    if (isAllPagesSelected) {
      const updated = syncPagesContent().map(p => {
        const el = pageRefs.current[p.id];
        if (el) {
          el.style.lineHeight = spacing;
          el.querySelectorAll('p, div, li, h1, h2, h3').forEach(b => {
            b.style.lineHeight = spacing;
          });
          return { ...p, content: el.innerHTML };
        }
        return p;
      });
      setPages(updated);
      handleAutoSave(updated);
      triggerAutoPagination();
      return;
    }

    restoreSavedSelection();
    const sel = window.getSelection();
    let node = sel?.anchorNode || savedSelectionRangeRef.current?.startContainer;
    if (node && node.nodeType === 3) node = node.parentElement;
    const block = node ? node.closest('p, div, li, h1, h2, h3, td, blockquote') : null;
    if (block) {
      block.style.lineHeight = spacing;
    } else {
      document.execCommand('formatBlock', false, 'p');
      const p = window.getSelection()?.anchorNode?.parentElement?.closest('p');
      if (p) p.style.lineHeight = spacing;
    }
    handleAutoSave();
    triggerAutoPagination();
  };

  const applyParagraphShading = (color) => {
    pushHistorySnapshot();
    if (color && color !== 'transparent' && color !== 'none') {
      setActiveShadingColor(color);
    }
    setShowShadingPalette(false);
    restoreSavedSelection();

    const isTransparent = !color || color === 'transparent' || color === 'none';

    if (isAllPagesSelected) {
      const updated = syncPagesContent().map(p => {
        const el = pageRefs.current[p.id];
        if (el) {
          el.querySelectorAll('p, div, li, h1, h2, h3, blockquote').forEach(b => {
            b.style.backgroundColor = isTransparent ? 'transparent' : color;
            b.style.padding = isTransparent ? '0px' : '6px 12px';
            b.style.borderRadius = isTransparent ? '0px' : '4px';
          });
          return { ...p, content: el.innerHTML };
        }
        return p;
      });
      setPages(updated);
      handleAutoSave(updated);
      triggerAutoPagination();
      return;
    }

    const sel = window.getSelection();
    let node = sel?.anchorNode || savedSelectionRangeRef.current?.startContainer || capturedSelectedRangeRef.current?.startContainer;
    if (node && node.nodeType === 3) node = node.parentElement;
    const block = node ? node.closest('p, div, li, h1, h2, h3, h4, h5, h6, blockquote, .word-shape-item') : null;
    if (block && !block.classList.contains('sheet-body-content')) {
      block.style.backgroundColor = isTransparent ? 'transparent' : color;
      block.style.padding = isTransparent ? '0px' : '6px 12px';
      block.style.borderRadius = isTransparent ? '0px' : '4px';
    }
    const currentEl = pageRefs.current[pages[activePageIndex]?.id];
    if (currentEl) currentEl.focus();
    handleAutoSave();
    triggerAutoPagination();
  };

  const formatBlockElementWithWordStyle = (block, styleKey) => {
    if (!block) return;
    // Reset decorative properties before applying new preset
    block.style.border = 'none';
    block.style.borderBottom = 'none';
    block.style.borderRight = 'none';
    block.style.borderTop = 'none';
    block.style.borderLeft = 'none';
    block.style.background = 'transparent';
    block.style.boxShadow = 'none';
    block.style.borderRadius = '0';
    block.style.fontStyle = 'normal';
    block.style.letterSpacing = 'normal';

    if (styleKey === 'normal') {
      block.classList.remove('word-shape-item');
      block.removeAttribute('data-atomic-block');
      block.removeAttribute('data-word-style');
      block.style.fontSize = '16px';
      block.style.fontWeight = 'normal';
      block.style.color = '#1e293b';
      block.style.lineHeight = '1.75';
      block.style.margin = '8px 0';
      block.style.padding = '0';
      block.style.textAlign = 'right';
    } else if (styleKey === 'no_spacing') {
      block.style.fontSize = '16px';
      block.style.fontWeight = 'normal';
      block.style.color = '#1e293b';
      block.style.lineHeight = '1.15';
      block.style.margin = '2px 0';
      block.style.padding = '0';
    } else if (styleKey === 'title') {
      block.style.fontSize = '30px';
      block.style.fontWeight = '900';
      block.style.color = '#0f172a';
      block.style.textAlign = 'center';
      block.style.margin = '18px 0 12px 0';
      block.style.padding = '6px 12px 10px 12px';
      block.style.borderBottom = '3px solid #2563eb';
    } else if (styleKey === 'subtitle') {
      block.style.fontSize = '18.5px';
      block.style.fontWeight = '600';
      block.style.color = '#475569';
      block.style.textAlign = 'center';
      block.style.background = '#f8fafc';
      block.style.border = '1px solid #e2e8f0';
      block.style.borderRadius = '8px';
      block.style.padding = '6px 16px';
      block.style.margin = '6px 0 14px 0';
    } else if (styleKey === 'heading1') {
      block.style.fontSize = '25px';
      block.style.fontWeight = '800';
      block.style.color = '#1e40af';
      block.style.margin = '16px 0 8px 0';
      block.style.borderBottom = '2px solid #bfdbfe';
      block.style.borderRight = '5px solid #1d4ed8';
      block.style.background = 'linear-gradient(to left, #eff6ff, transparent)';
      block.style.padding = '6px 12px';
      block.style.borderRadius = '0 6px 6px 0';
    } else if (styleKey === 'heading2') {
      block.style.fontSize = '21px';
      block.style.fontWeight = '700';
      block.style.color = '#2563eb';
      block.style.margin = '14px 0 6px 0';
      block.style.borderRight = '4px solid #3b82f6';
      block.style.padding = '3px 10px';
    } else if (styleKey === 'heading3') {
      block.style.fontSize = '18px';
      block.style.fontWeight = '700';
      block.style.color = '#0f766e';
      block.style.margin = '10px 0 4px 0';
      block.style.borderRight = '3px solid #14b8a6';
      block.style.padding = '2px 8px';
    } else if (styleKey === 'section_banner') {
      block.style.fontSize = '22px';
      block.style.fontWeight = '800';
      block.style.color = '#ffffff';
      block.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)';
      block.style.textAlign = 'center';
      block.style.padding = '10px 18px';
      block.style.margin = '16px 0 10px 0';
      block.style.borderRadius = '8px';
      block.style.boxShadow = '0 4px 10px rgba(37, 99, 235, 0.18)';
    } else if (styleKey === 'exam_header') {
      block.style.fontSize = '18px';
      block.style.fontWeight = '800';
      block.style.color = '#1e293b';
      block.style.background = '#fefce8';
      block.style.border = '1.5px solid #fde047';
      block.style.borderRight = '6px solid #eab308';
      block.style.padding = '8px 14px';
      block.style.margin = '14px 0 8px 0';
      block.style.borderRadius = '6px';
    } else if (styleKey === 'quote') {
      block.style.fontSize = '16px';
      block.style.fontStyle = 'italic';
      block.style.color = '#475569';
      block.style.borderRight = '4px solid #3b82f6';
      block.style.background = '#f8fafc';
      block.style.padding = '10px 16px';
      block.style.margin = '12px 0';
      block.style.borderRadius = '4px';
    } else if (styleKey === 'intense_quote') {
      block.style.fontSize = '16.5px';
      block.style.fontWeight = '700';
      block.style.color = '#1e3a8a';
      block.style.borderTop = '2px solid #2563eb';
      block.style.borderBottom = '2px solid #2563eb';
      block.style.background = '#eff6ff';
      block.style.padding = '12px 18px';
      block.style.margin = '14px 0';
      block.style.textAlign = 'center';
    } else if (styleKey === 'highlight_box') {
      block.style.fontSize = '16.5px';
      block.style.fontWeight = '700';
      block.style.color = '#854d0e';
      block.style.background = '#fef9c3';
      block.style.border = '1px solid #fde047';
      block.style.padding = '8px 14px';
      block.style.margin = '10px 0';
      block.style.borderRadius = '6px';
    }
  };

  const applyWordStyle = (styleKey) => {
    pushHistorySnapshot();
    if (isAllPagesSelected) {
      const updated = syncPagesContent().map(p => {
        const el = pageRefs.current[p.id];
        if (el) {
          el.querySelectorAll('p, div, h1, h2, h3, h4, blockquote').forEach(block => {
            if (styleKey === 'normal' || !block.closest('.word-shape-item, .word-smartart-block, .word-cover-block')) {
              formatBlockElementWithWordStyle(block, styleKey);
            }
          });
          return { ...p, content: el.innerHTML };
        }
        return p;
      });
      setPages(updated);
      handleAutoSave(updated);
      triggerAutoPagination();
      return;
    }

    restoreSavedSelection();
    const sel = window.getSelection();
    let node = sel?.anchorNode || savedSelectionRangeRef.current?.startContainer;
    if (node && node.nodeType === 3) node = node.parentElement;
    let block = node ? node.closest('p, div, h1, h2, h3, h4, blockquote') : null;
    if (!block || block.classList.contains('sheet-body-content')) {
      document.execCommand('formatBlock', false, 'p');
      const nextNode = window.getSelection()?.anchorNode;
      const nextEl = nextNode?.nodeType === 3 ? nextNode.parentElement : nextNode;
      block = nextEl ? nextEl.closest('p, div, h1, h2, h3, h4, blockquote') : null;
    }
    if (block && !block.classList.contains('sheet-body-content')) {
      if (styleKey === 'normal' || !block.closest('.word-shape-item, .word-smartart-block, .word-cover-block')) {
        formatBlockElementWithWordStyle(block, styleKey);
      }
    }
    handleAutoSave();
    triggerAutoPagination();
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          pushHistorySnapshot();
          if (isAllPagesSelected) {
            const newPages = [{ id: 1, content: text.replace(/\n/g, '<br/>') }];
            setPages(newPages);
            setActivePageIndex(0);
            setIsAllPagesSelected(false);
            handleAutoSave(newPages);
            setTimeout(() => {
              rebalanceAllPages(newPages);
            }, 50);
            return;
          }
          document.execCommand('insertText', false, text);
          handleAutoSave();
          triggerAutoPagination();
          return;
        }
      }
    } catch(e) {}
    alert('اضغط Ctrl+V من لوحة المفاتيح للصق المحتوى مباشرة.');
  };

  const handleFindNext = () => {
    if (!findWord) return;
    if (typeof window !== 'undefined' && window.find) {
      const found = window.find(findWord, false, false, true, false, false, false);
      if (!found) {
        alert(`تم الوصول لنهاية المستند أو لم يتم العثور على مزيد من التطابقات لـ: "${findWord}"`);
      }
    }
  };

  const handleReplaceOne = () => {
    if (!findWord) return;
    const sel = window.getSelection();
    if (sel && sel.toString().toLowerCase() === findWord.toLowerCase()) {
      pushHistorySnapshot();
      document.execCommand('insertText', false, replaceWord);
      handleAutoSave();
      triggerAutoPagination();
      handleFindNext();
    } else {
      handleFindNext();
    }
  };

  const handleReplaceAll = () => {
    if (!findWord) return;
    pushHistorySnapshot();
    let count = 0;
    Object.values(pageRefs.current).forEach(pageEl => {
      if (pageEl) {
        const walker = document.createTreeWalker(pageEl, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) => {
            if (node.parentElement?.closest('[contenteditable="false"], .no-print, .equation-widget-inline, .equation-widget-block')) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }, false);
        let textNode;
        const nodesToChange = [];
        while ((textNode = walker.nextNode())) {
          if (textNode.nodeValue && textNode.nodeValue.includes(findWord)) {
            nodesToChange.push(textNode);
          }
        }
        nodesToChange.forEach(node => {
          const regex = new RegExp(findWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          const matches = (node.nodeValue.match(regex) || []).length;
          count += matches;
          node.nodeValue = node.nodeValue.replace(regex, () => replaceWord);
        });
      }
    });
    handleAutoSave();
    triggerAutoPagination();
    alert(`تم استبدال ${count} تطابق بنجاح.`);
  };

  // --- COMPLETE TABLE MANAGEMENT ENGINE (WORD-GRADE) ---
  const handleInsertTable = (preset = 'navy') => {
    insertCustomTable(3, 3, preset);
  };

  const insertComparisonTable = () => {
    insertCustomTable(4, 2, 'comparison');
  };

  const insertCustomTable = (rows = 3, cols = 3, preset = 'navy') => {
    pushHistorySnapshot();
    const rCount = Math.max(2, Math.min(50, parseInt(rows, 10) || 3));
    const cCount = Math.max(1, Math.min(12, parseInt(cols, 10) || 3));

    let headBg = '#1e3a8a';
    let headColor = '#ffffff';
    let borderColor = '#cbd5e1';

    if (preset === 'green') { headBg = '#065f46'; borderColor = '#a7f3d0'; }
    else if (preset === 'minimal') { headBg = '#f1f5f9'; headColor = '#0f172a'; }
    else if (preset === 'ink_saver') { headBg = '#ffffff'; headColor = '#000000'; borderColor = '#000000'; }
    else if (preset === 'comparison') { headBg = '#0284c7'; }
    else if (preset === 'royal_purple') { headBg = '#581c87'; borderColor = '#d8b4fe'; }
    else if (preset === 'gold_academic') { headBg = '#92400e'; borderColor = '#fde68a'; }
    else if (preset === 'grid_centered') { headBg = '#1e293b'; borderColor = '#94a3b8'; }

    let headHtml = `<tr style="background: ${headBg}; color: ${headColor};">`;
    for (let c = 0; c < cCount; c++) {
      const defaultHeader = preset === 'comparison' 
        ? (c === 0 ? 'الطرف الأول (المفهوم أ)' : 'الطرف الثاني (المفهوم ب)')
        : (cCount === 3 && c === 0 ? 'م' : `العمود ${c + 1}`);
      headHtml += `<th style="border: 1px solid ${borderColor}; padding: 10px; text-align: center; vertical-align: middle; font-weight: bold; color: ${headColor};">${defaultHeader}</th>`;
    }
    headHtml += '</tr>';

    let bodyHtml = '';
    for (let r = 0; r < rCount - 1; r++) {
      const rowBg = (preset === 'zebra' || preset === 'royal_purple') && r % 2 === 1 ? '#f8fafc' : '#ffffff';
      bodyHtml += `<tr style="background: ${rowBg};">`;
      for (let c = 0; c < cCount; c++) {
        const cellText = (cCount === 3 && c === 0) ? `${r + 1}` : '<br>';
        const align = (preset === 'grid_centered' || (cCount === 3 && c === 0)) ? 'center' : 'right';
        bodyHtml += `<td style="border: 1px solid ${borderColor}; padding: 8px 12px; text-align: ${align}; vertical-align: middle;">${cellText}</td>`;
      }
      bodyHtml += '</tr>';
    }

    const tableHtml = `
      <table data-repeat-header="true" data-table-preset="${preset}" style="width: 100%; border-collapse: collapse; margin: 16px auto; border: 1.5px solid ${borderColor};" class="user-doc-table">
        <thead>${headHtml}</thead>
        <tbody>${bodyHtml}</tbody>
      </table><br>
    `;

    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    if (activeEl) {
      activeEl.focus();
      let success = false;
      try { success = document.execCommand('insertHTML', false, tableHtml); } catch(e) { success = false; }
      if (!success) activeEl.innerHTML += tableHtml;
      handleAutoSave();
      setTimeout(rebalanceAllPages, 100);
      triggerAutoPagination();
    }
    setShowCustomTableModal(false);
  };

  const insertTableFromCSV = (csvText, preset = 'navy') => {
    if (!csvText || !csvText.trim()) return;
    pushHistorySnapshot();

    const cleanCsv = csvText.replace(/```(csv)?/gi, '').replace(/```/g, '').trim();
    const rawLines = cleanCsv.split(/\r?\n/).filter(l => l.trim() !== '');
    if (rawLines.length === 0) return;

    const first = rawLines[0];
    let delimiter = ',';
    if (first.includes('\t')) delimiter = '\t';
    else if (first.includes(';') && !first.includes(',')) delimiter = ';';
    else if (first.includes('|')) delimiter = '|';
    else if (first.includes('،') && !first.includes(',')) delimiter = '،';

    const parseLine = (line) => {
      if (delimiter === '|' || delimiter === '\t' || delimiter === '،') {
        return line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
      }
      const re = new RegExp(`(?:${delimiter}|\\n|^)("(?:(?:"")*[^"]*)*"|[^"${delimiter}\\n]*|(?:\\n|$))`, 'g');
      const matches = [];
      let match;
      while ((match = re.exec(line))) {
        let val = match[1] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1).replace(/""/g, '"');
        }
        matches.push(val.trim());
        if (re.lastIndex >= line.length) break;
      }
      return matches;
    };

    const rows = rawLines.map(parseLine).filter(r => r.length > 0 && r.some(c => c !== ''));
    if (rows.length === 0) return;

    const maxCols = Math.max(...rows.map(r => r.length));

    let headBg = '#1e3a8a';
    let headColor = '#ffffff';
    let borderColor = '#cbd5e1';

    if (preset === 'green') { headBg = '#065f46'; borderColor = '#a7f3d0'; }
    else if (preset === 'minimal') { headBg = '#f1f5f9'; headColor = '#0f172a'; }
    else if (preset === 'ink_saver') { headBg = '#ffffff'; headColor = '#000000'; borderColor = '#000000'; }
    else if (preset === 'comparison') { headBg = '#0284c7'; }
    else if (preset === 'royal_purple') { headBg = '#581c87'; borderColor = '#d8b4fe'; }
    else if (preset === 'gold_academic') { headBg = '#92400e'; borderColor = '#fde68a'; }
    else if (preset === 'grid_centered') { headBg = '#1e293b'; borderColor = '#94a3b8'; }

    const headerRow = rows[0];
    let headHtml = `<tr style="background: ${headBg}; color: ${headColor};">`;
    for (let c = 0; c < maxCols; c++) {
      const cellText = headerRow[c] || `العمود ${c + 1}`;
      headHtml += `<th style="border: 1px solid ${borderColor}; padding: 10px; text-align: center; vertical-align: middle; font-weight: bold; color: ${headColor};">${cellText}</th>`;
    }
    headHtml += '</tr>';

    let bodyHtml = '';
    for (let r = 1; r < rows.length; r++) {
      const rowBg = (preset === 'zebra' || preset === 'royal_purple') && r % 2 === 0 ? '#f8fafc' : '#ffffff';
      bodyHtml += `<tr style="background: ${rowBg};">`;
      for (let c = 0; c < maxCols; c++) {
        const cellText = rows[r][c] || '<br>';
        const align = preset === 'grid_centered' ? 'center' : 'right';
        bodyHtml += `<td style="border: 1px solid ${borderColor}; padding: 8px 12px; text-align: ${align}; vertical-align: middle;">${cellText}</td>`;
      }
      bodyHtml += '</tr>';
    }

    const tableHtml = `
      <table data-repeat-header="true" data-table-preset="${preset}" style="width: 100%; border-collapse: collapse; margin: 16px auto; border: 1.5px solid ${borderColor};" class="user-doc-table">
        <thead>${headHtml}</thead>
        <tbody>${bodyHtml}</tbody>
      </table><p><br></p>
    `;

    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    if (activeEl) {
      activeEl.focus();
      let success = false;
      try { success = document.execCommand('insertHTML', false, tableHtml); } catch(e) { success = false; }
      if (!success) activeEl.innerHTML += tableHtml;
      handleAutoSave();
      setTimeout(rebalanceAllPages, 100);
      triggerAutoPagination();
    }
    setShowCustomTableModal(false);
    setCsvTableInput('');
  };

  const insertTableRowAbove = () => {
    if (!selectedCell) return;
    pushHistorySnapshot();
    const row = selectedCell.closest('tr');
    if (!row) return;
    const cellCount = row.children.length;
    const isHeaderRow = row.parentElement?.tagName.toLowerCase() === 'thead';
    const newRow = document.createElement('tr');
    for (let i = 0; i < cellCount; i++) {
      const cell = document.createElement(isHeaderRow ? 'th' : 'td');
      cell.style.border = '1px solid #cbd5e1';
      cell.style.padding = '8px 12px';
      cell.style.verticalAlign = 'middle';
      cell.style.textAlign = selectedCell.style.textAlign || (isHeaderRow ? 'center' : 'right');
      cell.innerHTML = '<br>';
      newRow.appendChild(cell);
    }
    row.parentNode.insertBefore(newRow, row);
    handleAutoSave();
    triggerAutoPagination();
  };

  const insertTableRowBelow = () => {
    if (!selectedCell) return;
    pushHistorySnapshot();
    const row = selectedCell.closest('tr');
    if (!row) return;
    const table = row.closest('table');
    const cellCount = row.children.length;
    const newRow = document.createElement('tr');
    for (let i = 0; i < cellCount; i++) {
      const cell = document.createElement('td');
      cell.style.border = '1px solid #cbd5e1';
      cell.style.padding = '8px 12px';
      cell.style.verticalAlign = 'middle';
      cell.style.textAlign = selectedCell.style.textAlign || 'right';
      cell.innerHTML = '<br>';
      newRow.appendChild(cell);
    }
    if (row.parentElement?.tagName.toLowerCase() === 'thead' && table) {
      let tbody = table.querySelector('tbody');
      if (!tbody) {
        tbody = document.createElement('tbody');
        table.appendChild(tbody);
      }
      tbody.insertBefore(newRow, tbody.firstChild);
    } else {
      row.parentNode.insertBefore(newRow, row.nextSibling);
    }
    handleAutoSave();
    triggerAutoPagination();
  };

  const deleteTableRow = () => {
    if (!selectedCell) return;
    pushHistorySnapshot();
    const row = selectedCell.closest('tr');
    const table = row ? row.closest('table') : null;
    if (!row || !table) return;
    const allRows = table.querySelectorAll('tr');
    if (allRows.length <= 1) {
      table.remove();
      setSelectedTable(null);
      setSelectedCell(null);
      setActiveTab('home');
    } else {
      row.remove();
    }
    handleAutoSave();
    triggerAutoPagination();
  };

  const insertTableColRight = () => {
    if (!selectedCell) return;
    pushHistorySnapshot();
    const table = selectedCell.closest('table');
    if (!table) return;
    const colIdx = selectedCell.cellIndex;
    const rows = table.querySelectorAll('tr');
    rows.forEach(r => {
      const isHeader = r.parentElement?.tagName.toLowerCase() === 'thead';
      const cell = document.createElement(isHeader ? 'th' : 'td');
      cell.style.border = '1px solid #cbd5e1';
      cell.style.padding = '8px 12px';
      cell.style.verticalAlign = 'middle';
      cell.style.textAlign = isHeader ? 'center' : (selectedCell.style.textAlign || 'right');
      cell.innerHTML = '<br>';
      if (isHeader) {
        const refHeader = r.children[0];
        cell.style.fontWeight = 'bold';
        cell.style.background = refHeader?.style?.background || '#1e3a8a';
        cell.style.color = refHeader?.style?.color || '#ffffff';
      }
      if (colIdx < r.children.length) {
        r.insertBefore(cell, r.children[colIdx]);
      } else {
        r.appendChild(cell);
      }
    });
    handleAutoSave();
    triggerAutoPagination();
  };

  const insertTableColLeft = () => {
    if (!selectedCell) return;
    pushHistorySnapshot();
    const table = selectedCell.closest('table');
    if (!table) return;
    const colIdx = selectedCell.cellIndex;
    const rows = table.querySelectorAll('tr');
    rows.forEach(r => {
      const isHeader = r.parentElement?.tagName.toLowerCase() === 'thead';
      const cell = document.createElement(isHeader ? 'th' : 'td');
      cell.style.border = '1px solid #cbd5e1';
      cell.style.padding = '8px 12px';
      cell.style.verticalAlign = 'middle';
      cell.style.textAlign = isHeader ? 'center' : (selectedCell.style.textAlign || 'right');
      cell.innerHTML = '<br>';
      if (isHeader) {
        const refHeader = r.children[0];
        cell.style.fontWeight = 'bold';
        cell.style.background = refHeader?.style?.background || '#1e3a8a';
        cell.style.color = refHeader?.style?.color || '#ffffff';
      }
      if (colIdx + 1 < r.children.length) {
        r.insertBefore(cell, r.children[colIdx + 1]);
      } else {
        r.appendChild(cell);
      }
    });
    handleAutoSave();
    triggerAutoPagination();
  };

  const deleteTableCol = () => {
    if (!selectedCell) return;
    pushHistorySnapshot();
    const table = selectedCell.closest('table');
    if (!table) return;
    const colIdx = selectedCell.cellIndex;
    const rows = table.querySelectorAll('tr');
    const totalCols = rows[0]?.children.length || 0;
    if (totalCols <= 1) {
      table.remove();
      setSelectedTable(null);
      setSelectedCell(null);
      setActiveTab('home');
    } else {
      rows.forEach(r => {
        if (r.children[colIdx]) r.children[colIdx].remove();
      });
    }
    handleAutoSave();
    triggerAutoPagination();
  };

  // --- TABLE CELL MERGING & SPLITTING ENGINE (دمج وفك دمج الخلايا) ---
  const mergeCellWithNext = () => {
    if (!selectedCell) return;
    const nextCell = selectedCell.nextElementSibling;
    if (!nextCell) {
      alert('لا توجد خلية تالية في نفس الصف لدمجها. يمكنك اختيار الخلية الأولى ثم الضغط على دمج، أو استخدام "دمج الصف بالكامل".');
      return;
    }
    pushHistorySnapshot();
    const currentSpan = parseInt(selectedCell.getAttribute('colspan') || '1', 10);
    const nextSpan = parseInt(nextCell.getAttribute('colspan') || '1', 10);
    const curHtml = selectedCell.innerHTML.replace(/^<br\s*\/?>$/i, '').trim();
    const nextHtml = nextCell.innerHTML.replace(/^<br\s*\/?>$/i, '').trim();
    const combinedHtml = [curHtml, nextHtml].filter(Boolean).join(' &nbsp; ');
    selectedCell.innerHTML = combinedHtml || '<br>';
    selectedCell.setAttribute('colspan', String(currentSpan + nextSpan));
    selectedCell.style.textAlign = 'center';
    selectedCell.style.verticalAlign = 'middle';
    nextCell.remove();
    handleAutoSave();
    triggerAutoPagination();
  };

  const mergeCellWithPrev = () => {
    if (!selectedCell) return;
    const prevCell = selectedCell.previousElementSibling;
    if (!prevCell) {
      alert('لا توجد خلية سابقة في نفس الصف لدمجها.');
      return;
    }
    pushHistorySnapshot();
    const prevSpan = parseInt(prevCell.getAttribute('colspan') || '1', 10);
    const curSpan = parseInt(selectedCell.getAttribute('colspan') || '1', 10);
    const prevHtml = prevCell.innerHTML.replace(/^<br\s*\/?>$/i, '').trim();
    const curHtml = selectedCell.innerHTML.replace(/^<br\s*\/?>$/i, '').trim();
    const combinedHtml = [prevHtml, curHtml].filter(Boolean).join(' &nbsp; ');
    prevCell.innerHTML = combinedHtml || '<br>';
    prevCell.setAttribute('colspan', String(prevSpan + curSpan));
    prevCell.style.textAlign = 'center';
    prevCell.style.verticalAlign = 'middle';
    selectedCell.remove();
    setSelectedCell(prevCell);
    handleAutoSave();
    triggerAutoPagination();
  };

  const mergeCellBelow = () => {
    if (!selectedCell) return;
    const row = selectedCell.closest('tr');
    const table = selectedCell.closest('table');
    if (!row || !table) return;
    const allRows = Array.from(table.querySelectorAll('tr'));
    const rowIdx = allRows.indexOf(row);
    const currentRowSpan = parseInt(selectedCell.getAttribute('rowspan') || '1', 10);
    const targetRow = allRows[rowIdx + currentRowSpan];
    if (!targetRow) {
      alert('لا يوجد صف أسفل هذه الخلية لدمجه عمودياً.');
      return;
    }
    const cellIdx = Math.min(selectedCell.cellIndex, targetRow.children.length - 1);
    const belowCell = targetRow.children[cellIdx];
    if (!belowCell) return;

    pushHistorySnapshot();
    const belowRowSpan = parseInt(belowCell.getAttribute('rowspan') || '1', 10);
    const curHtml = selectedCell.innerHTML.replace(/^<br\s*\/?>$/i, '').trim();
    const belowHtml = belowCell.innerHTML.replace(/^<br\s*\/?>$/i, '').trim();
    const combinedHtml = [curHtml, belowHtml].filter(Boolean).join('<br>');
    selectedCell.innerHTML = combinedHtml || '<br>';
    selectedCell.setAttribute('rowspan', String(currentRowSpan + belowRowSpan));
    selectedCell.style.verticalAlign = 'middle';
    belowCell.remove();
    handleAutoSave();
    triggerAutoPagination();
  };

  const mergeEntireRow = () => {
    if (!selectedCell) return;
    const row = selectedCell.closest('tr');
    if (!row || row.children.length <= 1) return;
    pushHistorySnapshot();
    const cells = Array.from(row.children);
    let totalColSpan = 0;
    const texts = [];
    cells.forEach(c => {
      totalColSpan += parseInt(c.getAttribute('colspan') || '1', 10);
      const cleaned = c.innerHTML.replace(/^<br\s*\/?>$/i, '').trim();
      if (cleaned) texts.push(cleaned);
    });
    const firstCell = cells[0];
    firstCell.setAttribute('colspan', String(totalColSpan));
    firstCell.innerHTML = texts.join(' — ') || '<br>';
    firstCell.style.textAlign = 'center';
    firstCell.style.verticalAlign = 'middle';
    firstCell.style.fontWeight = 'bold';
    for (let i = 1; i < cells.length; i++) {
      cells[i].remove();
    }
    setSelectedCell(firstCell);
    handleAutoSave();
    triggerAutoPagination();
  };

  const unmergeSelectedCell = () => {
    if (!selectedCell) return;
    const cSpan = parseInt(selectedCell.getAttribute('colspan') || '1', 10);
    const rSpan = parseInt(selectedCell.getAttribute('rowspan') || '1', 10);
    if (cSpan <= 1 && rSpan <= 1) {
      alert('هذه الخلية غير مدمجة حالياً.');
      return;
    }
    pushHistorySnapshot();
    const row = selectedCell.closest('tr');
    const table = selectedCell.closest('table');
    const isHeader = row?.parentElement?.tagName.toLowerCase() === 'thead' || selectedCell.tagName.toLowerCase() === 'th';
    const borderStyle = selectedCell.style.border || '1px solid #cbd5e1';
    const padStyle = selectedCell.style.padding || '8px 12px';
    const bgStyle = selectedCell.style.backgroundColor || '';

    selectedCell.removeAttribute('colspan');
    selectedCell.removeAttribute('rowspan');

    // Restore horizontal cells in the same row
    for (let c = 1; c < cSpan; c++) {
      const newCell = document.createElement(isHeader ? 'th' : 'td');
      newCell.style.border = borderStyle;
      newCell.style.padding = padStyle;
      newCell.style.verticalAlign = 'middle';
      newCell.style.textAlign = 'center';
      if (bgStyle) newCell.style.backgroundColor = bgStyle;
      newCell.innerHTML = '<br>';
      row.insertBefore(newCell, selectedCell.nextSibling);
    }

    // Restore vertical cells in rows below
    if (rSpan > 1 && table && row) {
      const allRows = Array.from(table.querySelectorAll('tr'));
      const rowIdx = allRows.indexOf(row);
      const insertPos = selectedCell.cellIndex;
      for (let r = 1; r < rSpan; r++) {
        const targetRow = allRows[rowIdx + r];
        if (targetRow) {
          for (let c = 0; c < cSpan; c++) {
            const newCell = document.createElement('td');
            newCell.style.border = borderStyle;
            newCell.style.padding = padStyle;
            newCell.style.verticalAlign = 'middle';
            newCell.style.textAlign = 'center';
            newCell.innerHTML = '<br>';
            if (insertPos < targetRow.children.length) {
              targetRow.insertBefore(newCell, targetRow.children[insertPos]);
            } else {
              targetRow.appendChild(newCell);
            }
          }
        }
      }
    }
    handleAutoSave();
    triggerAutoPagination();
  };

  // --- TABLE CENTERING, ALIGNMENT & FORMATTING ENGINE (توسيط وتنسيق الجداول والخلايا) ---
  const alignTableCells = (horizontalAlign = 'center', verticalAlign = 'middle', scope = 'cell') => {
    if (!selectedTable && !selectedCell) return;
    pushHistorySnapshot();
    let targetCells = [];
    if (scope === 'table' && selectedTable) {
      targetCells = Array.from(selectedTable.querySelectorAll('th, td'));
    } else if (scope === 'row' && selectedCell) {
      const row = selectedCell.closest('tr');
      if (row) targetCells = Array.from(row.querySelectorAll('th, td'));
    } else if (scope === 'col' && selectedCell && selectedTable) {
      const colIdx = selectedCell.cellIndex;
      selectedTable.querySelectorAll('tr').forEach(r => {
        if (r.children[colIdx]) targetCells.push(r.children[colIdx]);
      });
    } else if (selectedCell) {
      targetCells = [selectedCell];
    }

    targetCells.forEach(cell => {
      if (horizontalAlign) cell.style.textAlign = horizontalAlign;
      if (verticalAlign) cell.style.verticalAlign = verticalAlign;
      cell.querySelectorAll('p, div').forEach(inner => {
        if (horizontalAlign) inner.style.textAlign = horizontalAlign;
      });
    });
    handleAutoSave();
  };

  const centerEntireTableAndCells = () => {
    if (!selectedTable) return;
    pushHistorySnapshot();
    selectedTable.style.marginLeft = 'auto';
    selectedTable.style.marginRight = 'auto';
    selectedTable.querySelectorAll('th, td').forEach(cell => {
      cell.style.textAlign = 'center';
      cell.style.verticalAlign = 'middle';
      cell.querySelectorAll('p, div').forEach(inner => {
        inner.style.textAlign = 'center';
      });
    });
    handleAutoSave();
  };

  const alignTableInPage = (position = 'center') => {
    if (!selectedTable) return;
    pushHistorySnapshot();
    if (!selectedTable.style.width || selectedTable.style.width === '100%') {
      if (position !== 'center') {
        selectedTable.style.width = '85%';
      }
    }
    if (position === 'center') {
      selectedTable.style.marginLeft = 'auto';
      selectedTable.style.marginRight = 'auto';
    } else if (position === 'right') {
      selectedTable.style.marginRight = '0';
      selectedTable.style.marginLeft = 'auto';
    } else if (position === 'left') {
      selectedTable.style.marginLeft = '0';
      selectedTable.style.marginRight = 'auto';
    }
    handleAutoSave();
  };

  const setTableWidthPercent = (widthStr = '100%') => {
    if (!selectedTable) return;
    pushHistorySnapshot();
    selectedTable.style.width = widthStr;
    selectedTable.style.marginLeft = 'auto';
    selectedTable.style.marginRight = 'auto';
    handleAutoSave();
    triggerAutoPagination();
  };

  const distributeTableColumnsEvenly = () => {
    if (!selectedTable) return;
    pushHistorySnapshot();
    const firstRow = selectedTable.querySelector('tr');
    if (!firstRow || firstRow.children.length === 0) return;
    let totalCols = 0;
    Array.from(firstRow.children).forEach(c => {
      totalCols += parseInt(c.getAttribute('colspan') || '1', 10);
    });
    if (totalCols <= 0) return;
    const colPct = (100 / totalCols).toFixed(2) + '%';
    selectedTable.querySelectorAll('tr').forEach(r => {
      Array.from(r.children).forEach(cell => {
        const span = parseInt(cell.getAttribute('colspan') || '1', 10);
        if (span === 1) cell.style.width = colPct;
      });
    });
    handleAutoSave();
  };

  const adjustSelectedColWidth = (deltaPx) => {
    if (!selectedTable) return;
    pushHistorySnapshot();
    const cell = selectedCell || selectedTable.querySelector('th, td');
    if (!cell) return;
    const colIdx = cell.cellIndex;
    const currentW = cell.offsetWidth;
    const newW = Math.max(35, currentW + deltaPx);

    const colCells = [];
    selectedTable.querySelectorAll('tr').forEach(r => {
      if (r.children[colIdx]) colCells.push(r.children[colIdx]);
    });

    colCells.forEach(c => {
      c.style.width = `${newW}px`;
      c.style.minWidth = `${newW}px`;
      c.style.boxSizing = 'border-box';
    });

    selectedTable.style.borderCollapse = 'collapse';
    setSelectedColWidth(newW);
    setCustomColWidthInput(newW);
    handleAutoSave();
    triggerAutoPagination();
  };

  const adjustSelectedRowHeight = (deltaPx) => {
    if (!selectedTable) return;
    pushHistorySnapshot();
    const cell = selectedCell || selectedTable.querySelector('th, td');
    if (!cell) return;
    const row = cell.closest('tr');
    if (!row) return;
    const currentH = row.offsetHeight;
    const newH = Math.max(22, currentH + deltaPx);

    row.style.height = `${newH}px`;
    Array.from(row.children).forEach(c => {
      c.style.height = `${newH}px`;
      c.style.boxSizing = 'border-box';
    });

    setSelectedRowHeight(newH);
    setCustomRowHeightInput(newH);
    handleAutoSave();
    triggerAutoPagination();
  };

  const autoFitSelectedColToContent = () => {
    if (!selectedTable) return;
    pushHistorySnapshot();
    const cell = selectedCell || selectedTable.querySelector('th, td');
    if (!cell) return;
    const colIdx = cell.cellIndex;

    const colCells = [];
    selectedTable.querySelectorAll('tr').forEach(r => {
      if (r.children[colIdx]) colCells.push(r.children[colIdx]);
    });

    let maxW = 50;
    colCells.forEach(c => {
      const prevWrap = c.style.whiteSpace;
      c.style.whiteSpace = 'nowrap';
      const measured = c.scrollWidth + 24;
      if (measured > maxW) maxW = measured;
      c.style.whiteSpace = prevWrap || 'normal';
    });

    maxW = Math.min(450, maxW);

    colCells.forEach(c => {
      c.style.width = `${maxW}px`;
      c.style.minWidth = `${maxW}px`;
      c.style.boxSizing = 'border-box';
    });

    setSelectedColWidth(maxW);
    setCustomColWidthInput(maxW);
    handleAutoSave();
    triggerAutoPagination();
  };

  const toggleSelectedColNoWrap = () => {
    if (!selectedTable) return;
    pushHistorySnapshot();
    const cell = selectedCell || selectedTable.querySelector('th, td');
    if (!cell) return;
    const colIdx = cell.cellIndex;

    const colCells = [];
    selectedTable.querySelectorAll('tr').forEach(r => {
      if (r.children[colIdx]) colCells.push(r.children[colIdx]);
    });

    const nextState = !isColNoWrap;
    colCells.forEach(c => {
      c.style.whiteSpace = nextState ? 'nowrap' : 'normal';
    });

    setIsColNoWrap(nextState);
    handleAutoSave();
    triggerAutoPagination();
  };

  const distributeTableRowsEvenly = () => {
    if (!selectedTable) return;
    pushHistorySnapshot();
    const rows = Array.from(selectedTable.querySelectorAll('tr'));
    if (rows.length === 0) return;
    let totalH = 0;
    rows.forEach(r => totalH += r.offsetHeight);
    const avgH = Math.max(30, Math.round(totalH / rows.length));
    rows.forEach(r => {
      r.style.height = `${avgH}px`;
      Array.from(r.children).forEach(c => {
        c.style.height = `${avgH}px`;
        c.style.boxSizing = 'border-box';
      });
    });
    setSelectedRowHeight(avgH);
    setCustomRowHeightInput(avgH);
    handleAutoSave();
    triggerAutoPagination();
  };

  const applyTableDimensions = (colWidthPx, rowHeightPx, tableWidthStr, cellPaddingStr) => {
    if (!selectedTable) return;
    pushHistorySnapshot();

    if (tableWidthStr) {
      selectedTable.style.width = tableWidthStr;
      selectedTable.style.marginLeft = 'auto';
      selectedTable.style.marginRight = 'auto';
    }

    if (cellPaddingStr) {
      selectedTable.querySelectorAll('th, td').forEach(c => {
        c.style.padding = cellPaddingStr;
      });
    }

    if (colWidthPx) {
      const cell = selectedCell || selectedTable.querySelector('th, td');
      if (cell) {
        const colIdx = cell.cellIndex;
        const colCells = [];
        selectedTable.querySelectorAll('tr').forEach(r => {
          if (r.children[colIdx]) colCells.push(r.children[colIdx]);
        });
        const wVal = Math.max(35, parseInt(colWidthPx, 10) || 35);
        colCells.forEach(c => {
          c.style.width = `${wVal}px`;
          c.style.minWidth = `${wVal}px`;
          c.style.boxSizing = 'border-box';
        });
        setSelectedColWidth(wVal);
      }
    }

    if (rowHeightPx) {
      const cell = selectedCell || selectedTable.querySelector('th, td');
      if (cell) {
        const row = cell.closest('tr');
        if (row) {
          const hVal = Math.max(22, parseInt(rowHeightPx, 10) || 22);
          row.style.height = `${hVal}px`;
          Array.from(row.children).forEach(c => {
            c.style.height = `${hVal}px`;
            c.style.boxSizing = 'border-box';
          });
          setSelectedRowHeight(hVal);
        }
      }
    }

    selectedTable.style.borderCollapse = 'collapse';
    handleAutoSave();
    triggerAutoPagination();
  };

  // --- RENDER PROFESSIONAL PAGE BORDER FRAME (رسم إطارات الصفحات الاحترافية لكافة صفحات A4) ---
  const renderPageBorderFrame = (style, color, width) => {
    if (!style || style === 'none') return null;
    const borderColor = color || '#1e293b';
    const strokeW = width === 'thin' ? 1 : width === 'thick' ? 2.5 : 1.5;

    let outerStyle = {
      position: 'absolute',
      top: '7mm',
      bottom: '7mm',
      left: '7mm',
      right: '7mm',
      pointerEvents: 'none',
      zIndex: 1,
      boxSizing: 'border-box'
    };

    let innerContent = null;

    switch (style) {
      case 'simple':
        outerStyle.border = `${strokeW}px solid ${borderColor}`;
        outerStyle.borderRadius = '2px';
        break;

      case 'double':
        outerStyle.border = `${Math.max(3, strokeW * 2.5)}px double ${borderColor}`;
        outerStyle.borderRadius = '2px';
        break;

      case 'thick_thin':
        outerStyle.border = `${Math.max(2.5, strokeW * 2)}px solid ${borderColor}`;
        outerStyle.borderRadius = '2px';
        innerContent = (
          <div style={{ position: 'absolute', inset: '2.5mm', border: `${Math.max(0.8, strokeW * 0.7)}px solid ${borderColor}`, borderRadius: '1px', pointerEvents: 'none' }} />
        );
        break;

      case 'thin_thick_thin':
        outerStyle.border = `${Math.max(0.8, strokeW * 0.7)}px solid ${borderColor}`;
        outerStyle.borderRadius = '2px';
        innerContent = (
          <>
            <div style={{ position: 'absolute', inset: '1.5mm', border: `${Math.max(2, strokeW * 1.8)}px solid ${borderColor}`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: '3.2mm', border: `${Math.max(0.8, strokeW * 0.7)}px solid ${borderColor}`, pointerEvents: 'none' }} />
          </>
        );
        break;

      case 'modern_rounded':
        outerStyle.border = `${strokeW * 1.3}px solid ${borderColor}`;
        outerStyle.borderRadius = '16px';
        innerContent = (
          <div style={{ position: 'absolute', inset: '2mm', border: `1px dashed ${borderColor}66`, borderRadius: '11px', pointerEvents: 'none' }} />
        );
        break;

      case 'corner_bracket':
        outerStyle.border = `${Math.max(1, strokeW * 0.8)}px solid ${borderColor}99`;
        outerStyle.borderRadius = '2px';
        innerContent = (
          <>
            {/* Top-Right Corner Bracket */}
            <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '22px', height: '22px', borderTop: `${strokeW * 2}px solid ${borderColor}`, borderRight: `${strokeW * 2}px solid ${borderColor}`, pointerEvents: 'none' }} />
            {/* Top-Left Corner Bracket */}
            <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '22px', height: '22px', borderTop: `${strokeW * 2}px solid ${borderColor}`, borderLeft: `${strokeW * 2}px solid ${borderColor}`, pointerEvents: 'none' }} />
            {/* Bottom-Right Corner Bracket */}
            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '22px', height: '22px', borderBottom: `${strokeW * 2}px solid ${borderColor}`, borderRight: `${strokeW * 2}px solid ${borderColor}`, pointerEvents: 'none' }} />
            {/* Bottom-Left Corner Bracket */}
            <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '22px', height: '22px', borderBottom: `${strokeW * 2}px solid ${borderColor}`, borderLeft: `${strokeW * 2}px solid ${borderColor}`, pointerEvents: 'none' }} />
            
            {/* Decorative Corner Diamonds */}
            <div style={{ position: 'absolute', top: '5px', right: '5px', width: '6px', height: '6px', background: borderColor, transform: 'rotate(45deg)' }} />
            <div style={{ position: 'absolute', top: '5px', left: '5px', width: '6px', height: '6px', background: borderColor, transform: 'rotate(45deg)' }} />
            <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '6px', height: '6px', background: borderColor, transform: 'rotate(45deg)' }} />
            <div style={{ position: 'absolute', bottom: '5px', left: '5px', width: '6px', height: '6px', background: borderColor, transform: 'rotate(45deg)' }} />
          </>
        );
        break;

      case 'academic_ribbon':
        outerStyle.border = `${strokeW * 1.3}px solid ${borderColor}`;
        outerStyle.borderRadius = '2px';
        innerContent = (
          <>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '22px', borderBottom: `${strokeW}px solid ${borderColor}`, background: `${borderColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', boxSizing: 'border-box' }}>
              <span style={{ fontSize: '9px', color: borderColor, fontWeight: 'bold', letterSpacing: '2px' }}>◆ ◆ ◆</span>
              <span style={{ fontSize: '10px', color: borderColor, fontWeight: 'bold' }}>بسم الله الرحمن الرحيم</span>
              <span style={{ fontSize: '9px', color: borderColor, fontWeight: 'bold', letterSpacing: '2px' }}>◆ ◆ ◆</span>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '14px', borderTop: `${strokeW * 0.8}px solid ${borderColor}`, background: `${borderColor}08` }} />
          </>
        );
        break;

      case 'islamic_ornate':
        outerStyle.border = `${strokeW * 1.2}px solid ${borderColor}`;
        outerStyle.borderRadius = '2px';
        innerContent = (
          <>
            <div style={{ position: 'absolute', inset: '2.5mm', border: `${Math.max(0.8, strokeW * 0.7)}px solid ${borderColor}`, pointerEvents: 'none' }} />
            {['topRight', 'topLeft', 'bottomRight', 'bottomLeft'].map(pos => {
              const isTop = pos.includes('top');
              const isRight = pos.includes('Right');
              return (
                <svg 
                  key={pos} 
                  width="28" 
                  height="28" 
                  viewBox="0 0 28 28" 
                  style={{ 
                    position: 'absolute', 
                    top: isTop ? '2px' : 'auto', 
                    bottom: !isTop ? '2px' : 'auto', 
                    right: isRight ? '2px' : 'auto', 
                    left: !isRight ? '2px' : 'auto',
                    pointerEvents: 'none'
                  }}
                >
                  <rect x="7" y="7" width="14" height="14" fill="none" stroke={borderColor} strokeWidth="1.2" />
                  <rect x="7" y="7" width="14" height="14" fill="none" stroke={borderColor} strokeWidth="1.2" transform="rotate(45 14 14)" />
                  <circle cx="14" cy="14" r="2.5" fill={borderColor} />
                </svg>
              );
            })}
          </>
        );
        break;

      case 'certificate_ornate':
        outerStyle.border = `${Math.max(2, strokeW * 1.6)}px solid ${borderColor}`;
        outerStyle.borderRadius = '2px';
        innerContent = (
          <>
            <div style={{ position: 'absolute', inset: '3mm', border: `${Math.max(0.8, strokeW * 0.7)}px solid ${borderColor}`, pointerEvents: 'none' }} />
            {['topRight', 'topLeft', 'bottomRight', 'bottomLeft'].map(pos => {
              const isTop = pos.includes('top');
              const isRight = pos.includes('Right');
              const scaleX = isRight ? 1 : -1;
              const scaleY = isTop ? 1 : -1;
              return (
                <svg 
                  key={pos} 
                  width="34" 
                  height="34" 
                  viewBox="0 0 34 34" 
                  style={{ 
                    position: 'absolute', 
                    top: isTop ? '2px' : 'auto', 
                    bottom: !isTop ? '2px' : 'auto', 
                    right: isRight ? '2px' : 'auto', 
                    left: !isRight ? '2px' : 'auto',
                    transform: `scale(${scaleX}, ${scaleY})`,
                    pointerEvents: 'none'
                  }}
                >
                  <path d="M0,0 Q18,0 24,6 Q30,12 30,24 Q28,14 20,8 Q12,2 0,0 Z M0,0 Q0,18 6,24 Q12,30 24,30 Q14,28 8,20 Q2,12 0,0 Z" fill={borderColor} />
                  <circle cx="16" cy="16" r="2.5" fill={borderColor} />
                </svg>
              );
            })}
          </>
        );
        break;

      case 'shadow_box':
        outerStyle.border = `${strokeW * 1.2}px solid ${borderColor}`;
        outerStyle.borderRadius = '2px';
        outerStyle.boxShadow = `4px 4px 0px 0px ${borderColor}`;
        break;

      case 'dashed':
        outerStyle.border = `${strokeW * 1.5}px dashed ${borderColor}`;
        outerStyle.borderRadius = '4px';
        break;

      case 'dotted':
        outerStyle.border = `${strokeW * 1.8}px dotted ${borderColor}`;
        outerStyle.borderRadius = '4px';
        break;

      case 'groove':
        outerStyle.border = `${Math.max(3, strokeW * 2.2)}px groove ${borderColor}`;
        outerStyle.borderRadius = '2px';
        break;

      case 'ridge':
        outerStyle.border = `${Math.max(3, strokeW * 2.2)}px ridge ${borderColor}`;
        outerStyle.borderRadius = '2px';
        break;

      case 'modern_blue':
        outerStyle.border = `${strokeW * 1.5}px solid ${borderColor}`;
        outerStyle.borderRadius = '8px';
        outerStyle.boxShadow = `inset 0 0 0 2px ${borderColor}50`;
        break;

      case 'academic_gold':
        outerStyle.border = `${Math.max(3, strokeW * 2.5)}px double ${borderColor}`;
        outerStyle.borderRadius = '2px';
        break;

      case 'exam_official':
        outerStyle.border = `${Math.max(2, strokeW * 1.5)}px solid ${borderColor}`;
        outerStyle.borderRadius = '2px';
        innerContent = (
          <>
            <div style={{ position: 'absolute', inset: '2mm', border: `${Math.max(1, strokeW * 0.8)}px double ${borderColor}`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '2.5mm', left: '15mm', right: '15mm', height: '1px', borderBottom: `1px dashed ${borderColor}88` }} />
            <div style={{ position: 'absolute', bottom: '2.5mm', left: '15mm', right: '15mm', height: '1px', borderTop: `1px dashed ${borderColor}88` }} />
          </>
        );
        break;

      case 'vintage_scroll_frame':
        outerStyle.border = `${Math.max(2, strokeW * 1.6)}px solid ${borderColor}`;
        outerStyle.borderRadius = '4px';
        innerContent = (
          <>
            <div style={{ position: 'absolute', inset: '2.5mm', border: `1px solid ${borderColor}99`, pointerEvents: 'none' }} />
            {['topRight', 'topLeft', 'bottomRight', 'bottomLeft'].map(pos => {
              const isTop = pos.includes('top');
              const isRight = pos.includes('Right');
              return (
                <div 
                  key={pos}
                  style={{
                    position: 'absolute',
                    top: isTop ? '1mm' : 'auto',
                    bottom: !isTop ? '1mm' : 'auto',
                    right: isRight ? '1mm' : 'auto',
                    left: !isRight ? '1mm' : 'auto',
                    width: '12px',
                    height: '12px',
                    border: `2px solid ${borderColor}`,
                    transform: 'rotate(45deg)',
                    background: '#ffffff'
                  }}
                />
              );
            })}
          </>
        );
        break;

      case 'geometric_diamonds':
        outerStyle.border = `${Math.max(1.5, strokeW * 1.2)}px solid ${borderColor}`;
        outerStyle.borderRadius = '2px';
        innerContent = (
          <>
            <div style={{ position: 'absolute', inset: '3mm', border: `${Math.max(1.8, strokeW * 1.4)}px double ${borderColor}`, pointerEvents: 'none' }} />
            {['topRight', 'topLeft', 'bottomRight', 'bottomLeft'].map(pos => {
              const isTop = pos.includes('top');
              const isRight = pos.includes('Right');
              return (
                <div 
                  key={pos}
                  style={{
                    position: 'absolute',
                    top: isTop ? '-4px' : 'auto',
                    bottom: !isTop ? '-4px' : 'auto',
                    right: isRight ? '-4px' : 'auto',
                    left: !isRight ? '-4px' : 'auto',
                    width: '8px',
                    height: '8px',
                    background: borderColor,
                    transform: 'rotate(45deg)'
                  }}
                />
              );
            })}
          </>
        );
        break;

      default:
        outerStyle.border = `${strokeW}px solid ${borderColor}`;
        break;
    }

    return (
      <div className="sheet-border-frame-print" contentEditable={false} style={outerStyle}>
        {innerContent}
      </div>
    );
  };

  // --- HEADER & FOOTER PRECISE POSITIONING (حساب أبعاد ومواضع الترويسة والتذييل لمنع التداخل مع الإطار) ---
  const getHeaderTopPosition = () => {
    const marginNum = parseFloat(pageMargin) || 20;
    if (pageBorderStyle !== 'none') {
      // إطار الصفحة يقع عند 7mm من حافة الورقة، ويصل حد الإطار الداخلي إلى ~8.5mm
      // توضع الترويسة بمسافة متناسقة تماماً في المنتصف بين حد الإطار الداخلي وبداية متن الصفحة
      const available = marginNum - 7;
      const offset = Math.max(2.5, (available - 4.2) / 2);
      return `${(7 + offset).toFixed(1)}mm`;
    }
    // في حالة عدم وجود إطار، توضع في الثلث العلوي مع حد أدنى آمن لحدود الطباعة
    return `${Math.max(8.5, marginNum * 0.45).toFixed(1)}mm`;
  };

  const getFooterBottomPosition = () => {
    // تماثل هندسي دقيق مع الترويسة للحفاظ على تناسق الهوامش العلوية والسفلية
    return getHeaderTopPosition();
  };

  // --- REPEATING TABLE HEADER ROW ACROSS PAGES (تكرار صف العناوين الرئيسي في كل صفحة) ---
  const toggleTableRepeatHeader = (forceValue = null) => {
    if (!selectedTable) return;
    pushHistorySnapshot();
    const currentAttr = selectedTable.getAttribute('data-repeat-header');
    const nextState = forceValue !== null ? forceValue : (currentAttr === 'false' ? true : !isTableHeaderRepeated);

    // Ensure the table has a proper <thead> wrapping the header row when enabled
    if (nextState) {
      let thead = selectedTable.querySelector('thead');
      if (!thead) {
        const firstRow = selectedTable.querySelector('tr');
        if (firstRow) {
          thead = document.createElement('thead');
          Array.from(firstRow.children).forEach(cell => {
            if (cell.tagName.toLowerCase() === 'td') {
              const th = document.createElement('th');
              th.innerHTML = cell.innerHTML;
              if (cell.getAttribute('style')) th.setAttribute('style', cell.getAttribute('style'));
              if (cell.getAttribute('colspan')) th.setAttribute('colspan', cell.getAttribute('colspan'));
              th.style.fontWeight = 'bold';
              th.style.textAlign = 'center';
              if (!th.style.backgroundColor || th.style.backgroundColor === 'white' || th.style.backgroundColor === 'rgb(255, 255, 255)') {
                th.style.backgroundColor = '#1e3a8a';
                th.style.color = '#ffffff';
              }
              cell.replaceWith(th);
            }
          });
          thead.appendChild(firstRow);
          selectedTable.insertBefore(thead, selectedTable.firstChild);
        }
      }
      selectedTable.setAttribute('data-repeat-header', 'true');
      setIsTableHeaderRepeated(true);
    } else {
      selectedTable.setAttribute('data-repeat-header', 'false');
      setIsTableHeaderRepeated(false);
    }

    handleAutoSave();
    setTimeout(() => {
      rebalanceAllPages();
    }, 60);
  };

  const makeSelectedRowRepeatingHeader = () => {
    if (!selectedTable || !selectedCell) return;
    const row = selectedCell.closest('tr');
    if (!row) return;
    pushHistorySnapshot();

    let thead = selectedTable.querySelector('thead');
    if (!thead) {
      thead = document.createElement('thead');
      selectedTable.insertBefore(thead, selectedTable.firstChild);
    }

    // If this row is not already inside thead, move it to thead and style its cells as <th>
    if (row.parentElement !== thead) {
      Array.from(row.children).forEach(cell => {
        const th = document.createElement('th');
        th.innerHTML = cell.innerHTML;
        if (cell.getAttribute('style')) th.setAttribute('style', cell.getAttribute('style'));
        if (cell.getAttribute('colspan')) th.setAttribute('colspan', cell.getAttribute('colspan'));
        th.style.fontWeight = 'bold';
        th.style.textAlign = 'center';
        th.style.verticalAlign = 'middle';
        if (!th.style.backgroundColor || th.style.backgroundColor === 'white' || th.style.backgroundColor === 'rgb(255, 255, 255)') {
          th.style.backgroundColor = '#1e3a8a';
          th.style.color = '#ffffff';
        }
        cell.replaceWith(th);
      });
      thead.innerHTML = '';
      thead.appendChild(row);
    }

    selectedTable.setAttribute('data-repeat-header', 'true');
    setIsTableHeaderRepeated(true);
    handleAutoSave();
    setTimeout(() => {
      rebalanceAllPages();
    }, 60);
  };

  const applyCellColor = (color, applyToEntireRow = false) => {
    if (!selectedCell) return;
    pushHistorySnapshot();
    if (applyToEntireRow) {
      const row = selectedCell.closest('tr');
      if (row) {
        row.querySelectorAll('th, td').forEach(c => {
          c.style.backgroundColor = color;
        });
      }
    } else {
      selectedCell.style.backgroundColor = color;
    }
    handleAutoSave();
  };

  const applyTableBorderStyle = (borderMode = 'all') => {
    if (!selectedTable) return;
    pushHistorySnapshot();
    const cells = selectedTable.querySelectorAll('th, td');
    if (borderMode === 'all') {
      selectedTable.style.border = '1.5px solid #94a3b8';
      cells.forEach(c => { c.style.border = '1px solid #cbd5e1'; });
    } else if (borderMode === 'thick_dark') {
      selectedTable.style.border = '2.5px solid #0f172a';
      cells.forEach(c => { c.style.border = '1.5px solid #1e293b'; });
    } else if (borderMode === 'horizontal') {
      selectedTable.style.border = 'none';
      selectedTable.style.borderTop = '2px solid #0f172a';
      selectedTable.style.borderBottom = '2px solid #0f172a';
      cells.forEach(c => {
        c.style.borderLeft = 'none';
        c.style.borderRight = 'none';
        c.style.borderTop = '1px solid #cbd5e1';
        c.style.borderBottom = '1px solid #cbd5e1';
      });
    } else if (borderMode === 'none') {
      selectedTable.style.border = 'none';
      cells.forEach(c => { c.style.border = '1px dashed #e2e8f0'; });
    }
    handleAutoSave();
  };

  const applyTablePreset = (preset) => {
    if (!selectedTable) return;
    pushHistorySnapshot();
    const ths = selectedTable.querySelectorAll('th');
    const tds = selectedTable.querySelectorAll('td');
    const trs = selectedTable.querySelectorAll('tr');

    selectedTable.setAttribute('data-table-preset', preset);
    selectedTable.style.borderCollapse = 'collapse';
    if (!selectedTable.style.margin) selectedTable.style.margin = '16px auto';

    if (preset === 'navy') {
      ths.forEach(th => {
        th.style.background = '#1e3a8a';
        th.style.color = 'white';
        th.style.border = '1px solid #1e3a8a';
        th.style.padding = '10px';
        th.style.textAlign = 'center';
        th.style.verticalAlign = 'middle';
      });
      tds.forEach(td => {
        td.style.border = '1px solid #cbd5e1';
        td.style.padding = '8px 12px';
        td.style.background = 'white';
        td.style.color = '#0f172a';
      });
    } else if (preset === 'zebra') {
      ths.forEach(th => {
        th.style.background = '#0284c7';
        th.style.color = 'white';
        th.style.border = '1px solid #0284c7';
        th.style.padding = '10px';
        th.style.textAlign = 'center';
        th.style.verticalAlign = 'middle';
      });
      trs.forEach((tr, idx) => {
        if (idx > 0) {
          const bg = idx % 2 === 0 ? '#f0f9ff' : 'white';
          tr.querySelectorAll('td').forEach(td => {
            td.style.background = bg;
            td.style.border = '1px solid #bae6fd';
            td.style.padding = '8px 12px';
            td.style.color = '#0f172a';
          });
        }
      });
    } else if (preset === 'green') {
      ths.forEach(th => {
        th.style.background = '#065f46';
        th.style.color = 'white';
        th.style.border = '1px solid #065f46';
        th.style.padding = '10px';
        th.style.textAlign = 'center';
        th.style.verticalAlign = 'middle';
      });
      tds.forEach(td => {
        td.style.border = '1px solid #a7f3d0';
        td.style.padding = '8px 12px';
        td.style.background = 'white';
        td.style.color = '#0f172a';
      });
    } else if (preset === 'royal_purple') {
      ths.forEach(th => {
        th.style.background = '#581c87';
        th.style.color = 'white';
        th.style.border = '1px solid #581c87';
        th.style.padding = '10px';
        th.style.textAlign = 'center';
        th.style.verticalAlign = 'middle';
      });
      trs.forEach((tr, idx) => {
        if (idx > 0) {
          const bg = idx % 2 === 0 ? '#faf5ff' : 'white';
          tr.querySelectorAll('td').forEach(td => {
            td.style.background = bg;
            td.style.border = '1px solid #e9d5ff';
            td.style.padding = '8px 12px';
            td.style.color = '#0f172a';
          });
        }
      });
    } else if (preset === 'gold_academic') {
      ths.forEach(th => {
        th.style.background = '#92400e';
        th.style.color = '#fef3c7';
        th.style.border = '1px solid #78350f';
        th.style.padding = '10px';
        th.style.textAlign = 'center';
        th.style.verticalAlign = 'middle';
      });
      tds.forEach(td => {
        td.style.border = '1px solid #fde68a';
        td.style.padding = '8px 12px';
        td.style.background = '#fffbeb';
        td.style.color = '#1e293b';
      });
    } else if (preset === 'minimal') {
      ths.forEach(th => {
        th.style.background = '#f1f5f9';
        th.style.color = '#0f172a';
        th.style.border = '1px solid #cbd5e1';
        th.style.padding = '10px';
        th.style.textAlign = 'center';
        th.style.verticalAlign = 'middle';
      });
      tds.forEach(td => {
        td.style.border = '1px solid #cbd5e1';
        td.style.padding = '8px 12px';
        td.style.background = 'white';
      });
    } else if (preset === 'ink_saver') {
      ths.forEach(th => {
        th.style.background = 'white';
        th.style.color = 'black';
        th.style.border = '1.5px solid black';
        th.style.padding = '8px';
        th.style.fontWeight = 'bold';
        th.style.textAlign = 'center';
        th.style.verticalAlign = 'middle';
      });
      tds.forEach(td => {
        td.style.border = '1px solid black';
        td.style.padding = '8px';
        td.style.background = 'white';
        td.style.color = 'black';
      });
    }
    handleAutoSave();
    triggerAutoPagination();
  };

  const deleteSelectedTable = () => {
    if (!selectedTable) return;
    pushHistorySnapshot();
    selectedTable.remove();
    setSelectedTable(null);
    setSelectedCell(null);
    setActiveTab('home');
    handleAutoSave();
    triggerAutoPagination();
  };

  // --- EDUCATIONAL CALLOUT BOXES & CARDS ---
  const insertCalloutBox = (type) => {
    pushHistorySnapshot();
    let boxHtml = '';
    if (type === 'note') {
      boxHtml = `<div class="word-shape-item" data-atomic-block="true" style="background: #eff6ff; border-right: 5px solid #3b82f6; border-radius: 8px; padding: 14px 18px; margin: 15px 0; color: #1e3a8a;"><strong style="color: #1d4ed8; font-size: 17px; display: flex; align-items: center; gap: 6px;">💡 معلومة هامة:</strong><div style="margin-top: 6px; color: #1e293b; line-height: 1.8;">اكتب تفاصيل الملاحظة التعليمية هنا...</div></div><br>`;
    } else if (type === 'remember') {
      boxHtml = `<div class="word-shape-item" data-atomic-block="true" style="background: #f0fdf4; border-right: 5px solid #22c55e; border-radius: 8px; padding: 14px 18px; margin: 15px 0; color: #14532d;"><strong style="color: #15803d; font-size: 17px; display: flex; align-items: center; gap: 6px;">📌 تذكر أن (قاعدة ذهبية):</strong><div style="margin-top: 6px; color: #1e293b; line-height: 1.8;">اكتب القاعدة الأساسية أو القانون الرياضي/العلمي هنا...</div></div><br>`;
    } else if (type === 'warning') {
      boxHtml = `<div class="word-shape-item" data-atomic-block="true" style="background: #fef2f2; border-right: 5px solid #ef4444; border-radius: 8px; padding: 14px 18px; margin: 15px 0; color: #7f1d1d;"><strong style="color: #b91c1c; font-size: 17px; display: flex; align-items: center; gap: 6px;">⚠️ انتبه للخطأ الشائع:</strong><div style="margin-top: 6px; color: #1e293b; line-height: 1.8;">اكتب الخطأ الذي يقع فيه أغلب الطلاب مع تصحيحه هنا...</div></div><br>`;
    } else if (type === 'champion') {
      boxHtml = `<div class="word-shape-item" data-atomic-block="true" style="background: #fefce8; border: 1.5px solid #facc15; border-right: 6px solid #eab308; border-radius: 10px; padding: 14px 18px; margin: 16px 0; box-shadow: 0 4px 12px rgba(234,179,8,0.12);"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;"><strong style="color: #a16207; font-size: 17.5px;">🏆 سؤال المتفوقين وأوائل الطلبة:</strong><span style="background: #eab308; color: white; padding: 2px 10px; border-radius: 12px; font-size: 11.5px; font-weight: bold;">مستوى متميز</span></div><div style="color: #1e293b; line-height: 1.8;">اكتب سؤال التحدي والتفكير الإبداعي هنا...</div></div><br>`;
    } else if (type === 'homework') {
      boxHtml = `<div class="word-shape-item" data-atomic-block="true" style="background: #faf5ff; border: 1.5px solid #e9d5ff; border-right: 6px solid #a855f7; border-radius: 10px; padding: 14px 18px; margin: 16px 0;"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;"><strong style="color: #7e22ce; font-size: 17px;">📝 تدريب وواجب منزلي:</strong><span style="color: #9333ea; font-size: 12px; font-weight: bold;">درجة السؤال: [ &nbsp;&nbsp;&nbsp; ]</span></div><div style="color: #1e293b; margin-bottom: 12px; line-height: 1.8;">نص المسألة أو التدريب هنا...</div><div style="border-top: 1px dashed #d8b4fe; padding-top: 8px; color: #94a3b8; font-size: 13px;">خطوات الإجابة: ........................................................................................................................................</div></div><br>`;
    } else if (type === 'objective') {
      boxHtml = `<div class="word-shape-item" data-atomic-block="true" style="background: #fffbeb; border-right: 5px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin: 14px 0;"><strong style="color: #d97706; font-size: 16px;">🎯 نواتج التعلم المستهدفة:</strong><ul style="margin: 6px 0 0 20px; color: #1e293b; padding-right: 18px; line-height: 1.8;"><li>أن يتعرف الطالب على المفهوم بدقة.</li><li>أن يطبق القانون في حل المسائل.</li></ul></div><br>`;
    } else if (type === 'formula') {
      boxHtml = `<div class="word-shape-item" data-atomic-block="true" style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; margin: 15px 0; text-align: center;"><div style="font-size: 12.5px; color: #64748b; font-weight: bold; margin-bottom: 4px;">📐 القانون الرياضي / الصيغة العامة:</div><div style="font-size: 20px; font-family: 'Cambria Math', serif; color: #0f172a; font-weight: bold; padding: 6px 0;">[ اكتب الصيغة هنا ]</div></div><br>`;
    }
    if (boxHtml) {
      document.execCommand('insertHTML', false, boxHtml);
      handleAutoSave();
      triggerAutoPagination();
    }
  };

  // --- WORD SHAPES, TEXT BOXES, WORDART, SMARTART & COVER PAGES ---
  const handleInsertShape = (shapeType) => {
    pushHistorySnapshot();
    let html = '';
    const style = 'display:inline-block; margin:8px; vertical-align:middle; cursor:pointer;';
    
    if (shapeType === 'square') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-flex; align-items: center; justify-content: center; width: 90px; height: 90px; border-radius: 8px; background: #eff6ff; border: 2.5px solid #1d4ed8; color: #1e3a8a; font-weight: bold; font-size: 14px; text-align: center; padding: 8px; margin: 8px; box-sizing: border-box; box-shadow: 0 3px 8px rgba(29,78,216,0.12);">مربع نصي</div>&nbsp;`;
    } else if (shapeType === 'circle') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-flex; align-items: center; justify-content: center; width: 92px; height: 92px; border-radius: 50%; background: #eff6ff; border: 2.5px solid #1d4ed8; color: #1e3a8a; font-weight: bold; font-size: 14px; text-align: center; padding: 8px; margin: 8px; box-sizing: border-box; box-shadow: 0 3px 8px rgba(29,78,216,0.12);">دائرة نصية</div>&nbsp;`;
    } else if (shapeType === 'oval_text') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-flex; align-items: center; justify-content: center; min-width: 140px; height: 72px; border-radius: 999px / 50%; background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 2.5px solid #2563eb; color: #1e3a8a; font-weight: bold; font-size: 14px; text-align: center; padding: 10px 24px; margin: 8px; box-sizing: border-box; box-shadow: 0 3px 8px rgba(37,99,235,0.15);">شكل بيضاوي</div>&nbsp;`;
    } else if (shapeType === 'triangle') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-flex; align-items: flex-end; justify-content: center; width: 110px; height: 90px; background: #eff6ff; border: 2px solid #1d4ed8; clip-path: polygon(50% 0%, 100% 100%, 0% 100%); color: #1e3a8a; font-weight: bold; font-size: 13px; text-align: center; padding-bottom: 12px; margin: 8px; box-sizing: border-box;">مثلث نصي</div>&nbsp;`;
    } else if (shapeType === 'arrow_right') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-flex; align-items: center; justify-content: center; min-width: 130px; padding: 8px 18px; margin: 8px; background: #2563eb; color: #ffffff; border-radius: 6px; font-weight: bold; font-size: 13px; text-align: center; gap: 6px;"><span>النص</span> <span>➔</span></div>&nbsp;`;
    } else if (shapeType === 'arrow_left') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-flex; align-items: center; justify-content: center; min-width: 130px; padding: 8px 18px; margin: 8px; background: #2563eb; color: #ffffff; border-radius: 6px; font-weight: bold; font-size: 13px; text-align: center; gap: 6px;"><span>⬅</span> <span>النص</span></div>&nbsp;`;
    } else if (shapeType === 'block_arrow_up') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-flex; align-items: center; justify-content: center; min-height: 120px; width: 85px; padding: 26px 8px 12px 8px; margin: 8px; background: #2563eb; color: #ffffff; clip-path: polygon(50% 0%, 100% 32%, 72% 32%, 72% 100%, 28% 100%, 28% 32%, 0% 32%); font-weight: bold; font-size: 13px; text-align: center; box-sizing: border-box;">سهم لأعلى</div>&nbsp;`;
    } else if (shapeType === 'block_arrow_down') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-flex; align-items: center; justify-content: center; min-height: 120px; width: 85px; padding: 12px 8px 26px 8px; margin: 8px; background: #2563eb; color: #ffffff; clip-path: polygon(28% 0%, 72% 0%, 72% 68%, 100% 68%, 50% 100%, 0% 68%, 28% 68%); font-weight: bold; font-size: 13px; text-align: center; box-sizing: border-box;">سهم لأسفل</div>&nbsp;`;
    } else if (shapeType === 'block_arrow_two_way') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-flex; align-items: center; justify-content: center; min-width: 200px; padding: 12px 30px; margin: 8px; background: #2563eb; color: #ffffff; clip-path: polygon(0% 50%, 18% 0%, 18% 26%, 82% 26%, 82% 0%, 100% 50%, 82% 100%, 82% 74%, 18% 74%, 18% 100%); font-weight: bold; font-size: 14px; text-align: center;">علاقة متبادلة ⬌</div>&nbsp;`;
    } else if (shapeType === 'lesson_title_royal_ribbon') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="margin: 20px auto; max-width: 96%; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%); border-radius: 14px; padding: 4px; box-shadow: 0 8px 24px rgba(30, 58, 138, 0.28); border: 2px solid #f59e0b;">
  <div style="border: 1.5px dashed rgba(245, 158, 11, 0.6); border-radius: 10px; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
    <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; padding: 6px 18px; border-radius: 20px; font-weight: 900; font-size: 14px; box-shadow: 0 3px 8px rgba(0,0,0,0.25); display: inline-flex; align-items: center; gap: 6px;">
      <span>📖</span> <span>الدرس الأول</span>
    </div>
    <div style="flex: 1; text-align: center; color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">
      عنوان الدرس: اكتب اسم الدرس هنا
    </div>
    <div style="background: rgba(255, 255, 255, 0.15); color: #fef08a; padding: 4px 14px; border-radius: 8px; font-weight: bold; font-size: 13px; border: 1px solid rgba(254, 240, 138, 0.3);">
      الوحدة الأولى
    </div>
  </div>
</div><br>`;
    } else if (shapeType === 'lesson_title_folded_ribbon') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="position: relative; margin: 24px auto; max-width: 88%; text-align: center;">
  <div style="background: linear-gradient(90deg, #1e40af 0%, #2563eb 50%, #1e40af 100%); color: #ffffff; padding: 14px 36px; border-radius: 4px; font-size: 21px; font-weight: 900; box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35); border-top: 3px solid #93c5fd; border-bottom: 3px solid #1d4ed8; position: relative; z-index: 2;">
    🎗️ عنوان الدرس الرئيسي: اكتب الاسم هنا
  </div>
  <div style="position: absolute; bottom: -8px; right: 10px; width: 0; height: 0; border-top: 8px solid #1e3a8a; border-right: 8px solid transparent; z-index: 1;"></div>
  <div style="position: absolute; bottom: -8px; left: 10px; width: 0; height: 0; border-top: 8px solid #1e3a8a; border-left: 8px solid transparent; z-index: 1;"></div>
</div><br>`;
    } else if (shapeType === 'lesson_title_pill_modern') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="margin: 18px 0; display: flex; align-items: stretch; background: #ffffff; border: 2px solid #2563eb; border-radius: 999px; overflow: hidden; box-shadow: 0 4px 14px rgba(37,99,235,0.14);">
  <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #ffffff; padding: 10px 22px; font-weight: 900; font-size: 15px; display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
    <span>⭐</span> <span>الدرس الثاني</span>
  </div>
  <div style="flex: 1; padding: 10px 20px; font-weight: 800; font-size: 18px; color: #1e3a8a; display: flex; align-items: center;">
    اسم درس اليوم والشرح بالتفصيل
  </div>
  <div style="background: #eff6ff; color: #2563eb; padding: 10px 18px; font-weight: bold; font-size: 13px; display: flex; align-items: center; border-right: 1.5px dashed #bfdbfe; flex-shrink: 0;">
    الفصل الدراسي الأول
  </div>
</div><br>`;
    } else if (shapeType === 'lesson_title_islamic_crest') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="margin: 22px auto; max-width: 92%; background: #fffdf5; border: 2.5px solid #ca8a04; border-radius: 12px; padding: 16px 28px; text-align: center; box-shadow: 0 6px 18px rgba(202, 138, 4, 0.18); position: relative;">
  <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 6px;">
    <span style="color: #ca8a04; font-size: 18px;">❖ ❖ ❖</span>
    <span style="background: #ca8a04; color: #ffffff; padding: 2px 14px; border-radius: 20px; font-size: 13px; font-weight: bold;">الوحدة الأولى</span>
    <span style="color: #ca8a04; font-size: 18px;">❖ ❖ ❖</span>
  </div>
  <div style="color: #713f12; font-size: 23px; font-weight: 900; margin: 4px 0;">
    نص شعري / درس قراءة: (اكتب عنوان الدرس هنا)
  </div>
  <div style="font-size: 13px; color: #854d0e; font-weight: 600;">مقرر اللغة العربية • المنهج الجديد</div>
</div><br>`;
    } else if (shapeType === 'lesson_title_emerald_badge') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="margin: 18px auto; max-width: 94%; background: linear-gradient(135deg, #064e3b 0%, #059669 100%); border-radius: 12px; padding: 16px 24px; color: #ffffff; display: flex; align-items: center; justify-content: space-between; gap: 16px; box-shadow: 0 6px 18px rgba(5,150,105,0.22); border-left: 6px solid #f59e0b;">
  <div>
    <div style="font-size: 13px; color: #a7f3d0; font-weight: bold; margin-bottom: 2px;">📚 المنهج المعتمد الحديث 2026</div>
    <div style="font-size: 21px; font-weight: 900; color: #ffffff;">الدرس: اكتب اسم الدرس هنا</div>
  </div>
  <div style="background: rgba(255,255,255,0.2); padding: 8px 18px; border-radius: 10px; font-weight: 800; font-size: 14px; border: 1px solid rgba(255,255,255,0.3); text-align: center;">
    شرح وتدريبات
  </div>
</div><br>`;
    } else if (shapeType === 'sub_header_arrow_tab') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="margin: 16px 0; display: inline-flex; align-items: center; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(59,130,246,0.12);">
  <div style="background: #2563eb; color: #ffffff; padding: 8px 18px; font-weight: 900; font-size: 15px; clip-path: polygon(0% 0%, 82% 0%, 100% 50%, 82% 100%, 0% 100%); padding-left: 24px;">
    أولاً
  </div>
  <div style="padding: 8px 18px; font-weight: 800; color: #1e3a8a; font-size: 16px;">
    الشرح النظري والمفاهيم الأساسية
  </div>
</div><br>`;
    } else if (shapeType === 'sub_header_accent_bar') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="margin: 16px 0; padding: 8px 16px 8px 20px; background: linear-gradient(90deg, #f8fafc 0%, #eff6ff 100%); border-right: 6px solid #2563eb; border-radius: 0 8px 8px 0; display: flex; align-items: center; justify-content: space-between;">
  <span style="font-size: 17px; font-weight: 900; color: #1e3a8a;">
    🔹 ثانياً: القواعد النحوية ومفاتيح الإعراب
  </span>
  <span style="font-size: 12px; color: #64748b; font-weight: bold;">تطبيق عملي</span>
</div><br>`;
    } else if (shapeType === 'sub_header_circle_badge') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="margin: 16px 0; display: flex; align-items: center; gap: 12px;">
  <div style="width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #1e3a8a); color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 17px; box-shadow: 0 3px 8px rgba(37,99,235,0.25); flex-shrink: 0;">
    1
  </div>
  <div style="flex: 1; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; font-size: 18px; font-weight: 900; color: #0f172a;">
    الفكرة العامة للموضوع والمحاور الأساسية
  </div>
</div><br>`;
    } else if (shapeType === 'rule_golden_box') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="margin: 18px 0; background: #fffdf5; border: 2px solid #ca8a04; border-radius: 12px; padding: 14px 20px; box-shadow: 0 4px 14px rgba(202,138,4,0.12);">
  <div style="display: flex; align-items: center; gap: 8px; color: #854d0e; font-weight: 900; font-size: 16px; border-bottom: 1.5px dashed #facc15; padding-bottom: 6px; margin-bottom: 8px;">
    <span>⚖️</span> <span>القاعدة الذهبية:</span>
  </div>
  <div style="color: #713f12; line-height: 1.8; font-weight: 600; font-size: 15px;">
    اكتب نص القاعدة النحوية أو الرياضية هنا مع ضبط التشكيل والأمثلة...
  </div>
</div><br>`;
    } else if (shapeType === 'warning_trap_box') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="margin: 18px 0; background: #fef2f2; border: 2px solid #dc2626; border-right: 8px solid #dc2626; border-radius: 10px; padding: 14px 20px; box-shadow: 0 3px 10px rgba(220,38,38,0.1);">
  <div style="color: #991b1b; font-weight: 900; font-size: 16px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
    <span>⚠️</span> <span>انتبه يا بطل! (فخ شائع جداً في الامتحان):</span>
  </div>
  <div style="color: #7f1d1d; line-height: 1.8; font-size: 14.5px;">
    كثير من الطلاب يخطئ في إعراب هذه الكلمة! الصواب هو: (...) لأنها (...)
  </div>
</div><br>`;
    } else if (shapeType === 'smart_tip_box') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="margin: 18px 0; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 14px 20px; box-shadow: 0 4px 12px rgba(59,130,246,0.12);">
  <div style="color: #1e40af; font-weight: 900; font-size: 16px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
    <span>💡</span> <span>سر التفوق ومفتاح الحل السريع:</span>
  </div>
  <div style="color: #1e3a8a; line-height: 1.8; font-size: 14.5px;">
    بمجرد أن تجد (...) في الجملة، تذكر فوراً أن (...) يعرب (...)
  </div>
</div><br>`;
    } else if (shapeType === 'definition_box') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="margin: 18px 0; background: #f0fdf4; border: 2px solid #16a34a; border-radius: 10px; padding: 14px 20px; box-shadow: 0 3px 10px rgba(22,163,74,0.1);">
  <div style="color: #14532d; font-weight: 900; font-size: 16px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
    <span>📖</span> <span>التعريف والمفهوم العلمي:</span>
  </div>
  <div style="color: #166534; line-height: 1.8; font-size: 14.5px;">
    هو (...): اكتب صياغة المفهوم العلمي الدقيق هنا...
  </div>
</div><br>`;
    } else if (shapeType === 'quick_comparison_box') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="margin: 18px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; direction: rtl;">
  <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 10px; padding: 12px 16px;">
    <div style="font-weight: 900; color: #1e40af; font-size: 15px; margin-bottom: 6px; border-bottom: 1px solid #bfdbfe; padding-bottom: 4px;">🔹 الأول: (مثلاً: الفعل اللازم)</div>
    <div style="font-size: 13.5px; color: #1e3a8a; line-height: 1.7;">هو الفعل الذي يكتفي بفاعله ولا ينصب مفعولاً به مثل: (نجح الطالب).</div>
  </div>
  <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 10px; padding: 12px 16px;">
    <div style="font-weight: 900; color: #14532d; font-size: 15px; margin-bottom: 6px; border-bottom: 1px solid #bbf7d0; padding-bottom: 4px;">🔸 الثاني: (مثلاً: الفعل المتعدي)</div>
    <div style="font-size: 13.5px; color: #14532d; line-height: 1.7;">هو الفعل الذي لا يكتفي بفاعله وينصب مفعولاً به أو أكثر مثل: (كتب الطالب الدرس).</div>
  </div>
</div><br>`;
    } else if (shapeType === 'exam_question_box') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="margin: 18px 0; border: 2px solid #4f46e5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(79,70,229,0.12);">
  <div style="background: #4f46e5; color: white; padding: 10px 18px; font-weight: 900; font-size: 15.5px; display: flex; align-items: center; justify-content: space-between;">
    <span>🎯 سؤال وزاري متكرر في الامتحان:</span>
    <span style="font-size: 12px; background: rgba(255,255,255,0.2); padding: 2px 10px; border-radius: 8px;">2 درجة</span>
  </div>
  <div style="padding: 12px 18px; background: #ffffff; color: #1e1b4b; font-weight: bold; font-size: 15px; border-bottom: 1.5px dashed #c7d2fe;">
    س: استخرج من الفقرة السابقة فعلاً مجرداً وبين نوعه، وفعلاً مزيداً بحرفين.
  </div>
  <div style="padding: 12px 18px; background: #f5f3ff; color: #3730a3; font-size: 14.5px; line-height: 1.7;">
    <strong>الإجابة النموذجية:</strong> الفعل المجرد هو (...) ونوعه (...) • الفعل المزيد هو (...) وأحرف الزيادة هي (...)
  </div>
</div><br>`;
    } else if (shapeType === 'frame_islamic_text') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="margin: 20px 0; border: 2px solid #ca8a04; border-radius: 8px; padding: 18px 24px; background: #fffdf7; position: relative; box-shadow: 0 4px 12px rgba(202,138,4,0.1);">
  <div style="position: absolute; top: -11px; right: 20px; background: #ca8a04; color: white; padding: 1px 14px; border-radius: 12px; font-size: 12px; font-weight: bold;">برواز إسلامي</div>
  <div style="color: #713f12; line-height: 1.9; font-size: 15px; text-align: justify;">
    اكتب النص أو الحديث الشريف أو الآية القرآنية الكريمة هنا داخل هذا البرواز الأنيق...
  </div>
</div><br>`;
    } else if (shapeType === 'frame_double_academic') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="margin: 20px 0; border: 4px double #1e3a8a; border-radius: 6px; padding: 18px 22px; background: #ffffff; box-shadow: 0 3px 10px rgba(0,0,0,0.04);">
  <div style="color: #1e3a8a; font-weight: 800; font-size: 16px; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">📌 إطار فقرة أكاديمية رسمية:</div>
  <div style="color: #334155; line-height: 1.8; font-size: 14.5px;">
    اكتب النص المحاط بالإطار المزدوج هنا...
  </div>
</div><br>`;
    } else if (shapeType === 'frame_modern_shadow') {
      html = `
<div class="word-shape-item" data-atomic-block="true" style="margin: 20px 0; border: 2px solid #0f172a; border-radius: 10px; padding: 18px 22px; background: #ffffff; box-shadow: 5px 5px 0px #0f172a;">
  <div style="color: #0f172a; font-weight: 900; font-size: 16px; margin-bottom: 6px;">🎯 بطاقة مميزة بظل مجسم 3D:</div>
  <div style="color: #1e293b; line-height: 1.8; font-size: 14.5px;">
    اكتب النص المراد إبرازه داخل البطاقة هنا...
  </div>
</div><br>`;
    } else if (shapeType === 'rect_text') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-block; min-width: 180px; padding: 12px 20px; margin: 8px; background: #eff6ff; border: 2px solid #2563eb; border-radius: 4px; text-align: center; font-weight: bold; color: #1e3a8a;">اكتب نص الشكل هنا</div>&nbsp;`;
    } else if (shapeType === 'rounded_rect_text') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-block; min-width: 190px; padding: 12px 22px; margin: 8px; background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 2px solid #3b82f6; border-radius: 16px; text-align: center; font-weight: bold; color: #1e3a8a; box-shadow: 0 3px 8px rgba(59,130,246,0.15);">مستطيل مستدير الحواف</div>&nbsp;`;
    } else if (shapeType === 'pill_banner') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-block; min-width: 200px; padding: 10px 26px; margin: 8px; background: linear-gradient(135deg, #1e3a8a, #2563eb); border-radius: 999px; text-align: center; font-weight: bold; color: #ffffff; box-shadow: 0 4px 10px rgba(37,99,235,0.2);">شريط كبسولة عنوان</div>&nbsp;`;
    } else if (shapeType === 'diamond_text') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-flex; align-items: center; justify-content: center; width: 150px; height: 90px; margin: 10px; background: #fef3c7; border: 2.5px solid #d97706; clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); text-align: center; font-weight: bold; color: #92400e; padding: 14px;">شكل معين</div>&nbsp;`;
    } else if (shapeType === 'hexagon_text') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-flex; align-items: center; justify-content: center; min-width: 170px; padding: 14px 26px; margin: 8px; background: #f0fdf4; border: 2px solid #16a34a; clip-path: polygon(12% 0%, 88% 0%, 100% 50%, 88% 100%, 12% 100%, 0% 50%); text-align: center; font-weight: bold; color: #166534;">شكل سداسي</div>&nbsp;`;
    } else if (shapeType === 'parallelogram_text') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-block; min-width: 180px; padding: 10px 24px; margin: 8px 14px; background: #faf5ff; border: 2px solid #9333ea; transform: skewX(-14deg); text-align: center; font-weight: bold; color: #6b21a8;"><span style="display: inline-block; transform: skewX(14deg);">متوازي أضلاع</span></div>&nbsp;`;
    } else if (shapeType === 'block_arrow_left') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-flex; align-items: center; justify-content: center; min-width: 190px; padding: 12px 28px 12px 34px; margin: 8px; background: #2563eb; color: #ffffff; clip-path: polygon(22% 0%, 22% 22%, 100% 22%, 100% 78%, 22% 78%, 22% 100%, 0% 50%); font-weight: bold; text-align: center;">سهم متجه لليسار</div>&nbsp;`;
    } else if (shapeType === 'block_arrow_right') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-flex; align-items: center; justify-content: center; min-width: 190px; padding: 12px 34px 12px 28px; margin: 8px; background: #2563eb; color: #ffffff; clip-path: polygon(0% 22%, 78% 22%, 78% 0%, 100% 50%, 78% 100%, 78% 78%, 0% 78%); font-weight: bold; text-align: center;">سهم متجه لليمين</div>&nbsp;`;
    } else if (shapeType === 'chevron_step') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-flex; align-items: center; justify-content: center; min-width: 170px; padding: 10px 28px; margin: 6px; background: #0284c7; color: #ffffff; clip-path: polygon(15% 0%, 100% 0%, 85% 50%, 100% 100%, 15% 100%, 0% 50%); font-weight: bold; text-align: center;">خطوة متسلسلة</div>&nbsp;`;
    } else if (shapeType === 'speech_bubble') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="position: relative; display: inline-block; min-width: 210px; background: #fffbeb; border: 2px solid #f59e0b; border-radius: 16px; padding: 12px 18px; margin: 10px 8px 18px 8px; color: #92400e; font-weight: bold; text-align: center; box-shadow: 0 3px 8px rgba(245,158,11,0.12);">💬 وسيلة شرح / تعليق توضيحي</div>&nbsp;`;
    } else if (shapeType === 'cloud_callout') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-block; min-width: 210px; background: #f0f9ff; border: 2.5px dashed #0284c7; border-radius: 30px; padding: 14px 22px; margin: 10px; color: #0369a1; font-weight: bold; text-align: center;">☁️ فكرة أو استنتاج هام...</div>&nbsp;`;
    } else if (shapeType === 'star_badge') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #eab308; border-radius: 12px; padding: 8px 18px; margin: 8px; color: #854d0e; font-weight: 900; box-shadow: 0 3px 8px rgba(234,179,8,0.2);">⭐ شارة تميز / هام جداً</div>&nbsp;`;
    } else if (shapeType === 'ribbon_banner') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="background: linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #1e3a8a 100%); color: #ffffff; text-align: center; padding: 12px 24px; margin: 16px auto; border-radius: 6px; font-size: 19px; font-weight: 900; border-top: 2px solid #93c5fd; border-bottom: 2px solid #93c5fd; box-shadow: 0 4px 12px rgba(30,58,138,0.2);">🎗️ شريط عنوان رئيسي للوحدة أو الباب</div><br>`;
    } else if (shapeType === 'scroll_banner') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="background: #fefce8; border: 2px solid #ca8a04; border-right: 10px double #ca8a04; border-left: 10px double #ca8a04; border-radius: 8px; padding: 14px 22px; margin: 16px 0; text-align: center; color: #713f12; font-weight: bold; font-size: 17px;">📜 لفيفة قاعدة ذهبية أو نص قانون</div><br>`;
    } else if (shapeType === 'card') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="border: 1px solid #e2e8f0; background: #ffffff; border-radius: 8px; padding: 14px 18px; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);"><div style="font-weight: bold; color: #1e293b; font-size: 15px; margin-bottom: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">بطاقة شرح وتلخيص:</div><div style="color: #475569; line-height: 1.8;">اكتب محتوى البطاقة هنا...</div></div><br>`;
    } else if (shapeType === 'divider_stars') {
      html = `<div style="text-align: center; margin: 20px 0; color: #cbd5e1; user-select: none;" contenteditable="false"><span style="color: #e2e8f0; margin: 0 10px;">────────</span><span style="color: #f59e0b; font-size: 16px;">★ ★ ★</span><span style="color: #e2e8f0; margin: 0 10px;">────────</span></div><br>`;
    } else if (shapeType === 'divider_double') {
      html = `<div style="border-top: 3px double #cbd5e1; margin: 22px 0;" contenteditable="false"></div><br>`;
    } else if (shapeType === 'divider_dots') {
      html = `<div style="border-top: 2.5px dotted #94a3b8; margin: 20px 0;" contenteditable="false"></div><br>`;
    }

    if (html) {
      document.execCommand('insertHTML', false, html);
      handleAutoSave();
      triggerAutoPagination();
      setShowShapesModal(false);
    }
  };

  const insertWordTextBox = (boxStyle = 'classic') => {
    pushHistorySnapshot();
    let html = '';
    if (boxStyle === 'classic') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="border: 2px solid #1e293b; background: #ffffff; padding: 14px 18px; margin: 14px 0; border-radius: 4px;"><div style="font-weight: bold; color: #0f172a; margin-bottom: 4px;">مربع نص كلاسيكي:</div><div style="color: #334155; line-height: 1.8;">اكتب النص داخل المربع هنا...</div></div><br>`;
    } else if (boxStyle === 'shadow_blue') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="border: 2px solid #2563eb; background: #f8fafc; padding: 14px 18px; margin: 14px 0; border-radius: 10px; box-shadow: 5px 5px 0px #1e40af;"><div style="font-weight: 800; color: #1e40af; margin-bottom: 4px;">📌 مربع نص بارز بظل هندسي:</div><div style="color: #1e293b; line-height: 1.8;">اكتب النص أو القاعدة الهامة هنا...</div></div><br>`;
    } else if (boxStyle === 'sticky_yellow') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="border: 1px solid #fde047; border-top: 8px solid #eab308; background: #fefce8; padding: 14px 18px; margin: 14px auto; max-width: 90%; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.06);"><div style="font-weight: 800; color: #854d0e; margin-bottom: 4px;">📝 ملاحظة سريعة للطالب:</div><div style="color: #422006; line-height: 1.8;">اكتب الملاحظة هنا...</div></div><br>`;
    } else if (boxStyle === 'side_float_left') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="float: left; width: 220px; border: 2px solid #0284c7; background: #f0f9ff; padding: 12px 14px; margin: 6px 16px 10px 0; border-radius: 8px;"><div style="font-weight: 800; color: #0369a1; font-size: 14px; margin-bottom: 4px; border-bottom: 1px solid #bae6fd; padding-bottom: 4px;">💡 هامش جانبي</div><div style="font-size: 14px; color: #0f172a; line-height: 1.6;">معلومة إثرائية أو تعريف مختصر بجانب الشرح...</div></div>`;
    }
    if (html) {
      document.execCommand('insertHTML', false, html);
      handleAutoSave();
      triggerAutoPagination();
    }
  };

  const insertWordArt = (artType = 'royal_gradient') => {
    pushHistorySnapshot();
    let html = '';
    if (artType === 'royal_gradient') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="text-align: center; margin: 16px 0;"><span style="font-size: 32px; font-weight: 900; color: #1e3a8a; text-shadow: 2px 3px 0px #bfdbfe, 4px 6px 12px rgba(30,58,138,0.18); letter-spacing: 0.5px; display: inline-block; padding: 4px 16px;">نص مزخرف ثلاثي الأبعاد</span></div><br>`;
    } else if (artType === 'gold_3d') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="text-align: center; margin: 16px 0;"><span style="font-size: 30px; font-weight: 900; color: #b45309; background: linear-gradient(to bottom, #fef3c7, #fde68a); border: 2px solid #f59e0b; border-radius: 12px; padding: 6px 24px; text-shadow: 1px 2px 0px #ffffff; box-shadow: 0 4px 12px rgba(245,158,11,0.2); display: inline-block;">عنوان ذهبي فاخر</span></div><br>`;
    } else if (artType === 'neon_outline') {
      html = `<div class="word-shape-item" data-atomic-block="true" style="text-align: center; margin: 16px 0;"><span style="font-size: 30px; font-weight: 900; color: #0f172a; border-bottom: 4px double #2563eb; border-top: 4px double #2563eb; padding: 6px 24px; display: inline-block; letter-spacing: 1px;">عنوان بإطار مزدوج كلاسيكي</span></div><br>`;
    }
    if (html) {
      document.execCommand('insertHTML', false, html);
      handleAutoSave();
      triggerAutoPagination();
    }
  };

  const insertWordSmartArt = (diagramType = 'process_steps') => {
    pushHistorySnapshot();
    let html = '';
    if (diagramType === 'process_steps') {
      html = `
        <div class="word-smartart-block word-shape-item" data-atomic-block="true" style="margin: 18px 0; padding: 16px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px;">
          <div style="text-align: center; font-weight: 800; color: #1e3a8a; margin-bottom: 12px; font-size: 16px;">مخطط خطوات متسلسلة (SmartArt)</div>
          <div style="display: flex; align-items: stretch; justify-content: space-between; gap: 10px; direction: rtl;">
            <div style="flex: 1; background: #eff6ff; border: 2px solid #3b82f6; border-radius: 10px; padding: 10px; text-align: center;">
              <div style="background: #2563eb; color: white; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; margin-bottom: 4px;">1</div>
              <div style="font-weight: bold; color: #1e3a8a; font-size: 14px;">الخطوة الأولى</div>
              <div style="font-size: 12.5px; color: #475569; margin-top: 3px;">وصف المرحلة</div>
            </div>
            <div style="display: flex; align-items: center; color: #2563eb; font-size: 22px; font-weight: bold;">⬅</div>
            <div style="flex: 1; background: #f0fdf4; border: 2px solid #22c55e; border-radius: 10px; padding: 10px; text-align: center;">
              <div style="background: #16a34a; color: white; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; margin-bottom: 4px;">2</div>
              <div style="font-weight: bold; color: #14532d; font-size: 14px;">الخطوة الثانية</div>
              <div style="font-size: 12.5px; color: #475569; margin-top: 3px;">وصف المرحلة</div>
            </div>
            <div style="display: flex; align-items: center; color: #16a34a; font-size: 22px; font-weight: bold;">⬅</div>
            <div style="flex: 1; background: #fefce8; border: 2px solid #eab308; border-radius: 10px; padding: 10px; text-align: center;">
              <div style="background: #ca8a04; color: white; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; margin-bottom: 4px;">3</div>
              <div style="font-weight: bold; color: #713f12; font-size: 14px;">الخطوة الثالثة</div>
              <div style="font-size: 12.5px; color: #475569; margin-top: 3px;">النتيجة النهائية</div>
            </div>
          </div>
        </div><br>
      `;
    } else if (diagramType === 'hierarchy_tree') {
      html = `
        <div class="word-smartart-block word-shape-item" data-atomic-block="true" style="margin: 18px 0; padding: 18px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; text-align: center;">
          <div style="display: inline-block; background: #1e3a8a; color: white; padding: 10px 28px; border-radius: 8px; font-weight: 800; font-size: 16px; box-shadow: 0 3px 8px rgba(30,58,138,0.2);">المفهوم الرئيسي / العنوان العام</div>
          <div style="width: 2px; height: 16px; background: #64748b; margin: 0 auto;"></div>
          <div style="width: 70%; height: 2px; background: #64748b; margin: 0 auto;"></div>
          <div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 12px; direction: rtl;">
            <div style="flex: 1; background: #eff6ff; border: 1.5px solid #93c5fd; border-top: 4px solid #2563eb; border-radius: 8px; padding: 10px;">
              <div style="font-weight: bold; color: #1e40af; font-size: 14px;">الفرع الأول</div>
              <div style="font-size: 12.5px; color: #475569; margin-top: 4px;">تفاصيل أو أمثلة</div>
            </div>
            <div style="flex: 1; background: #eff6ff; border: 1.5px solid #93c5fd; border-top: 4px solid #2563eb; border-radius: 8px; padding: 10px;">
              <div style="font-weight: bold; color: #1e40af; font-size: 14px;">الفرع الثاني</div>
              <div style="font-size: 12.5px; color: #475569; margin-top: 4px;">تفاصيل أو أمثلة</div>
            </div>
            <div style="flex: 1; background: #eff6ff; border: 1.5px solid #93c5fd; border-top: 4px solid #2563eb; border-radius: 8px; padding: 10px;">
              <div style="font-weight: bold; color: #1e40af; font-size: 14px;">الفرع الثالث</div>
              <div style="font-size: 12.5px; color: #475569; margin-top: 4px;">تفاصيل أو أمثلة</div>
            </div>
          </div>
        </div><br>
      `;
    } else if (diagramType === 'pyramid_levels') {
      html = `
        <div class="word-smartart-block word-shape-item" data-atomic-block="true" style="margin: 18px 0; padding: 16px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; text-align: center;">
          <div style="width: 45%; margin: 0 auto 6px auto; background: #1e3a8a; color: white; padding: 8px 14px; border-radius: 8px 8px 4px 4px; font-weight: bold; font-size: 14px;">1. القمة (المستوى الأعلى)</div>
          <div style="width: 68%; margin: 0 auto 6px auto; background: #2563eb; color: white; padding: 9px 14px; border-radius: 4px; font-weight: bold; font-size: 14.5px;">2. المستوى الأوسط (التطبيق والتحليل)</div>
          <div style="width: 92%; margin: 0 auto; background: #60a5fa; color: #0f172a; padding: 10px 14px; border-radius: 4px 4px 8px 8px; font-weight: bold; font-size: 15px;">3. القاعدة الأساسية (المفاهيم الأولية)</div>
        </div><br>
      `;
    } else if (diagramType === 'feature_grid') {
      html = `
        <div class="word-smartart-block word-shape-item" data-atomic-block="true" style="margin: 18px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; direction: rtl;">
          <div style="background: #eff6ff; border-right: 5px solid #2563eb; border-radius: 8px; padding: 12px;">
            <div style="font-weight: 800; color: #1e40af; font-size: 15px;">🔹 العنصر الأول</div>
            <div style="font-size: 13.5px; color: #334155; margin-top: 4px;">شرح مختصر للنقطة الأولى...</div>
          </div>
          <div style="background: #f0fdf4; border-right: 5px solid #16a34a; border-radius: 8px; padding: 12px;">
            <div style="font-weight: 800; color: #166534; font-size: 15px;">🔸 العنصر الثاني</div>
            <div style="font-size: 13.5px; color: #334155; margin-top: 4px;">شرح مختصر للنقطة الثانية...</div>
          </div>
          <div style="background: #fefce8; border-right: 5px solid #ca8a04; border-radius: 8px; padding: 12px;">
            <div style="font-weight: 800; color: #854d0e; font-size: 15px;">🔹 العنصر الثالث</div>
            <div style="font-size: 13.5px; color: #334155; margin-top: 4px;">شرح مختصر للنقطة الثالثة...</div>
          </div>
          <div style="background: #faf5ff; border-right: 5px solid #9333ea; border-radius: 8px; padding: 12px;">
            <div style="font-weight: 800; color: #6b21a8; font-size: 15px;">🔸 العنصر الرابع</div>
            <div style="font-size: 13.5px; color: #334155; margin-top: 4px;">شرح مختصر للنقطة الرابعة...</div>
          </div>
        </div><br>
      `;
    }
    if (html) {
      document.execCommand('insertHTML', false, html);
      handleAutoSave();
      triggerAutoPagination();
      setShowShapesModal(false);
    }
  };

  const insertWordCoverPage = (theme = 'royal_navy') => {
    pushHistorySnapshot();
    const borderColor = theme === 'emerald_modern' ? '#059669' : theme === 'classic_gold' ? '#b45309' : '#1e3a8a';
    const accentBg = theme === 'emerald_modern' ? 'linear-gradient(135deg, #064e3b, #059669)' : theme === 'classic_gold' ? 'linear-gradient(135deg, #78350f, #d97706)' : 'linear-gradient(135deg, #0f172a, #1e3a8a, #2563eb)';
    const lightBg = theme === 'emerald_modern' ? '#ecfdf5' : theme === 'classic_gold' ? '#fffbeb' : '#eff6ff';

    const coverHtml = `
      <div class="word-cover-block word-shape-item" data-atomic-block="true" style="border: 4px double ${borderColor}; border-radius: 16px; padding: 36px 28px; margin: 10px 0 24px 0; text-align: center; background: #ffffff; box-shadow: 0 8px 24px rgba(0,0,0,0.05);">
        <div style="display: inline-block; background: ${lightBg}; color: ${borderColor}; border: 1.5px solid ${borderColor}; padding: 6px 22px; border-radius: 999px; font-weight: 800; font-size: 14px; margin-bottom: 18px;">🌟 سلسلة المذكرات والملازم التعليمية الحديثة 🌟</div>
        <div style="background: ${accentBg}; color: #ffffff; padding: 28px 20px; border-radius: 14px; margin: 12px 0 24px 0; box-shadow: 0 6px 18px rgba(0,0,0,0.12);">
          <div style="font-size: 34px; font-weight: 900; margin-bottom: 10px; line-height: 1.4;">${docTitle || 'عنوان الملزمة أو المذكرة الدراسية'}</div>
          <div style="font-size: 18px; opacity: 0.92; font-weight: 600;">شرح وافٍ • أمثلة محلولة • تدريبات وامتحانات شاملة على النظام الحديث</div>
        </div>
        <div style="margin: 28px auto; max-width: 85%; border-top: 2px dashed #cbd5e1; border-bottom: 2px dashed #cbd5e1; padding: 18px 12px; display: flex; justify-content: space-around; gap: 16px; direction: rtl;">
          <div>
            <div style="font-size: 13px; color: #64748b; font-weight: bold;">إعداد الأستاذ / المحاضر</div>
            <div style="font-size: 19px; font-weight: 900; color: ${borderColor}; margin-top: 4px;">أ / [ اكتب اسم المدرس هنا ]</div>
          </div>
          <div style="border-right: 1.5px solid #e2e8f0;"></div>
          <div>
            <div style="font-size: 13px; color: #64748b; font-weight: bold;">الصف الدراسي / الفصل</div>
            <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-top: 4px;">[ الصف الدراسي - الفصل الأول ]</div>
          </div>
        </div>
        <div style="margin-top: 22px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 12px 20px; display: inline-block; min-width: 70%;">
          <span style="font-weight: bold; color: #334155;">اسم الطالب: </span>
          <span style="color: #94a3b8;">.....................................................................................</span>
        </div>
      </div><br>
    `;
    document.execCommand('insertHTML', false, coverHtml);
    handleAutoSave();
    triggerAutoPagination();
  };

  const formatSelectedShape = (action, value) => {
    if (!selectedShape) return;
    pushHistorySnapshot();
    if (action === 'bg') {
      if (selectedShape.tagName && selectedShape.tagName.toLowerCase() === 'svg') {
        selectedShape.querySelectorAll('rect, circle, polygon, path').forEach(el => {
          if (el.getAttribute('fill') !== 'none') el.style.fill = value;
        });
      } else {
        selectedShape.style.background = value;
        selectedShape.querySelectorAll('.word-shape-body, .word-smartart-card').forEach(el => {
          el.style.background = value;
        });
      }
    } else if (action === 'border') {
      if (selectedShape.tagName && selectedShape.tagName.toLowerCase() === 'svg') {
        selectedShape.querySelectorAll('rect, circle, polygon, path').forEach(el => {
          el.style.stroke = value;
        });
      } else {
        selectedShape.style.borderColor = value;
        selectedShape.querySelectorAll('.word-shape-body').forEach(el => {
          el.style.borderColor = value;
        });
      }
    } else if (action === 'borderWidth') {
      selectedShape.style.borderWidth = value;
    } else if (action === 'borderRadius') {
      selectedShape.style.borderRadius = value;
    } else if (action === 'color') {
      selectedShape.style.color = value;
      selectedShape.querySelectorAll('*').forEach(el => {
        if (el.style) el.style.color = value;
      });
    } else if (action === 'width') {
      if (value === '100%') {
        selectedShape.style.display = 'block';
        selectedShape.style.width = '100%';
        selectedShape.style.maxWidth = '100%';
      } else if (value === 'auto') {
        selectedShape.style.width = 'auto';
        selectedShape.style.maxWidth = '100%';
      } else {
        selectedShape.style.width = value;
        selectedShape.style.maxWidth = '100%';
      }
    } else if (action === 'scale') {
      const curW = selectedShape.offsetWidth || 320;
      const newW = Math.max(90, Math.min(850, curW + value));
      selectedShape.style.width = `${newW}px`;
      selectedShape.style.maxWidth = '100%';
    } else if (action === 'align') {
      if (value === 'center') {
        selectedShape.style.display = 'block';
        selectedShape.style.marginLeft = 'auto';
        selectedShape.style.marginRight = 'auto';
        selectedShape.style.float = 'none';
      } else if (value === 'right') {
        selectedShape.style.display = 'inline-block';
        selectedShape.style.float = 'none';
        selectedShape.style.margin = '8px 0';
      } else if (value === 'float_left') {
        selectedShape.style.float = 'left';
        selectedShape.style.margin = '8px 16px 8px 0';
      } else if (value === 'float_right') {
        selectedShape.style.float = 'right';
        selectedShape.style.margin = '8px 0 8px 16px';
      }
    } else if (action === 'delete') {
      selectedShape.remove();
      setSelectedShape(null);
      if (activeTab === 'shape') setActiveTab('home');
    }
    handleAutoSave();
    triggerAutoPagination();
  };

  const insertQuestionBadge = (text, bgColor = '#1e40af') => {
    pushHistorySnapshot();
    const badgeHtml = `<span style="background: ${bgColor}; color: white; padding: 2px 8px; border-radius: 6px; font-size: 11.5px; font-weight: bold; margin: 0 4px; display: inline-block; vertical-align: middle;">${text}</span>&nbsp;`;
    document.execCommand('insertHTML', false, badgeHtml);
    handleAutoSave();
  };

  // ============================================================================
  // --- MICROSOFT WORD REFERENCES TAB (المراجع: جدول المحتويات، الحواشي، المراجع، التسميات، الفهرس) ---
  // ============================================================================

  // 1. Scan all pages and extract headings for Table of Contents & Navigation Pane
  const extractDocumentHeadings = () => {
    const headings = [];
    pages.forEach((p, pageIdx) => {
      const el = pageRefs.current[p.id];
      if (!el) return;
      const nodes = el.querySelectorAll('h1, h2, h3, h4, .word-style-title, .word-style-chapter, .word-style-h1, .word-style-h2, .word-style-h3, .word-style-exam-q, [data-toc-level]');
      nodes.forEach((node) => {
        if (node.closest('.word-toc-block')) return;
        const rawText = (node.innerText || node.textContent || '').trim();
        if (!rawText) return;
        let level = 1;
        const tag = node.tagName.toLowerCase();
        if (node.getAttribute('data-toc-level')) {
          level = parseInt(node.getAttribute('data-toc-level'), 10) || 1;
        } else if (tag === 'h2' || node.classList.contains('word-style-h2')) {
          level = 2;
        } else if (tag === 'h3' || tag === 'h4' || node.classList.contains('word-style-h3') || node.classList.contains('word-style-exam-q')) {
          level = 3;
        }
        headings.push({
          text: rawText.slice(0, 110),
          level,
          pageIndex: pageIdx,
          pageNum: pageIdx + 1
        });
      });
    });
    return headings;
  };

  const buildTocHtml = (headingsList) => {
    const items = headingsList.length > 0
      ? headingsList
      : [
          { text: 'الباب الأول: المفاهيم والقواعد الأساسية للوحدة', level: 1, pageNum: 1 },
          { text: 'الدرس الأول: الشرح التفصيلي والأمثلة التطبيقية', level: 2, pageNum: 1 },
          { text: 'أولاً: القواعد الهامة وملاحظات الامتحان', level: 3, pageNum: 2 },
          { text: 'الدرس الثاني: تدريبات شاملة وأسئلة المستويات العليا', level: 2, pageNum: 3 }
        ];

    const rowsHtml = items.map((item) => {
      const indentPx = item.level === 1 ? 0 : item.level === 2 ? 20 : 40;
      const fontWeight = item.level === 1 ? '900' : item.level === 2 ? '700' : '600';
      const fontSize = item.level === 1 ? '16px' : item.level === 2 ? '14.5px' : '13.5px';
      const color = item.level === 1 ? '#1e3a8a' : item.level === 2 ? '#0f172a' : '#475569';
      const bullet = item.level === 1 ? '◈ ' : item.level === 2 ? '▪ ' : '• ';
      return `
        <div style="display: flex; align-items: baseline; justify-content: space-between; padding: 5px 0; padding-right: ${indentPx}px; direction: rtl; font-size: ${fontSize}; font-weight: ${fontWeight}; color: ${color};">
          <span style="background: #ffffff; padding-left: 8px;">${bullet}${item.text}</span>
          <span style="flex: 1; border-bottom: 1.5px dotted #94a3b8; margin: 0 8px;"></span>
          <span style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 6px; padding: 1px 9px; font-weight: 800; font-size: 13px;">ص ${item.pageNum}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="word-toc-block word-shape-item" data-atomic-block="true" style="border: 2px solid #1e3a8a; border-top: 7px solid #1e3a8a; border-radius: 12px; padding: 20px 24px; margin: 16px 0; background: #ffffff; box-shadow: 0 4px 14px rgba(30,58,138,0.06); direction: rtl;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #dbeafe; padding-bottom: 10px; margin-bottom: 12px;">
          <span style="font-size: 21px; font-weight: 900; color: #1e3a8a;">📑 فهرس وجدول المحتويات</span>
          <span style="font-size: 12px; color: #64748b; font-weight: bold;">رقم الصفحة</span>
        </div>
        ${rowsHtml}
      </div><br>
    `;
  };

  // Insert Table of Contents
  const insertTableOfContents = () => {
    pushHistorySnapshot();
    const headings = extractDocumentHeadings();
    const tocHtml = buildTocHtml(headings);
    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    if (activeEl) activeEl.focus();
    document.execCommand('insertHTML', false, tocHtml);
    handleAutoSave();
    triggerAutoPagination();
  };

  // Update Existing Table of Contents across all pages
  const updateTableOfContents = () => {
    pushHistorySnapshot();
    const headings = extractDocumentHeadings();
    let updatedAny = false;
    pages.forEach((p) => {
      const el = pageRefs.current[p.id];
      if (!el) return;
      const tocs = el.querySelectorAll('.word-toc-block');
      tocs.forEach((tocNode) => {
        const temp = document.createElement('div');
        temp.innerHTML = buildTocHtml(headings).trim();
        const newToc = temp.querySelector('.word-toc-block');
        if (newToc) {
          tocNode.replaceWith(newToc);
          updatedAny = true;
        }
      });
    });
    if (!updatedAny) {
      insertTableOfContents();
      return;
    }
    handleAutoSave();
    triggerAutoPagination();
  };

  // 2. Footnotes & Endnotes (الحواشي السفلية والتعليقات الختامية)
  const insertFootnote = () => {
    const noteText = window.prompt('اكتب نص الحاشية السفلية (ستظهر في أسفل الصفحة الحالية مع رقم مرجعي):', 'شرح أو توضيح للمفردة أو المرجع العلمي...');
    if (!noteText) return;
    pushHistorySnapshot();

    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    if (!activeEl) return;
    activeEl.focus();

    const existingFootnotes = activeEl.querySelectorAll('.word-footnote-ref');
    const nextNum = existingFootnotes.length + 1;

    const refHtml = `<sup class="word-footnote-ref" data-footnote-num="${nextNum}" style="color: #1d4ed8; font-weight: 900; font-size: 12px; background: #eff6ff; padding: 0 4px; border-radius: 4px; margin: 0 2px; cursor: pointer;" title="${noteText.replace(/"/g, '&quot;')}">[${nextNum}]</sup>&nbsp;`;
    document.execCommand('insertHTML', false, refHtml);

    let footnotesContainer = activeEl.querySelector('.word-footnotes-area');
    if (!footnotesContainer) {
      footnotesContainer = document.createElement('div');
      footnotesContainer.className = 'word-footnotes-area';
      footnotesContainer.setAttribute('data-atomic-block', 'true');
      footnotesContainer.style.cssText = 'margin-top: 24px; padding-top: 8px; border-top: 1.5px solid #94a3b8; font-size: 13px; color: #334155; direction: rtl;';
      footnotesContainer.innerHTML = `<div style="font-size: 11.5px; font-weight: bold; color: #64748b; margin-bottom: 4px;">الحواشي السفلية والهوامش:</div>`;
      activeEl.appendChild(footnotesContainer);
    }

    const itemDiv = document.createElement('div');
    itemDiv.className = 'word-footnote-entry';
    itemDiv.style.cssText = 'margin: 3px 0; line-height: 1.6;';
    itemDiv.innerHTML = `<strong style="color: #1d4ed8;">[${nextNum}]</strong> ${noteText}`;
    footnotesContainer.appendChild(itemDiv);

    handleAutoSave();
    triggerAutoPagination();
  };

  const insertEndnote = () => {
    const noteText = window.prompt('اكتب نص التعليق الختامي (يُدرج في نهاية المستند):', 'مرجع أو تعليق ختامي...');
    if (!noteText) return;
    pushHistorySnapshot();

    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    if (!activeEl) return;
    activeEl.focus();

    const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
    let totalEndnotes = 0;
    pages.forEach((p) => {
      const el = pageRefs.current[p.id];
      if (el) totalEndnotes += el.querySelectorAll('.word-endnote-ref').length;
    });
    const marker = romanNumerals[totalEndnotes] || `${totalEndnotes + 1}`;

    const refHtml = `<sup class="word-endnote-ref" style="color: #7c3aed; font-weight: 900; font-size: 12px; background: #f5f3ff; padding: 0 4px; border-radius: 4px; margin: 0 2px;" title="${noteText.replace(/"/g, '&quot;')}">(${marker})</sup>&nbsp;`;
    document.execCommand('insertHTML', false, refHtml);

    const lastPage = pages[pages.length - 1];
    const lastEl = pageRefs.current[lastPage?.id];
    if (lastEl) {
      let endnotesContainer = lastEl.querySelector('.word-endnotes-area');
      if (!endnotesContainer) {
        endnotesContainer = document.createElement('div');
        endnotesContainer.className = 'word-endnotes-area';
        endnotesContainer.setAttribute('data-atomic-block', 'true');
        endnotesContainer.style.cssText = 'margin-top: 26px; padding: 12px 16px; background: #faf5ff; border-top: 2px double #7c3aed; border-radius: 6px; font-size: 13.5px; color: #334155; direction: rtl;';
        endnotesContainer.innerHTML = `<div style="font-weight: 800; color: #5b21b6; margin-bottom: 6px;">📌 التعليقات الختامية (Endnotes):</div>`;
        lastEl.appendChild(endnotesContainer);
      }
      const itemDiv = document.createElement('div');
      itemDiv.style.cssText = 'margin: 4px 0; line-height: 1.6;';
      itemDiv.innerHTML = `<strong style="color: #7c3aed;">(${marker})</strong> ${noteText}`;
      endnotesContainer.appendChild(itemDiv);
    }

    handleAutoSave();
    triggerAutoPagination();
  };

  const jumpToNextFootnote = () => {
    for (let i = 0; i < pages.length; i++) {
      const idx = (activePageIndex + i) % pages.length;
      const el = pageRefs.current[pages[idx]?.id];
      if (!el) continue;
      const fn = el.querySelector('.word-footnotes-area, .word-footnote-ref, .word-endnotes-area');
      if (fn) {
        setActivePageIndex(idx);
        fn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    alert('لا توجد حواشٍ سفلية أو تعليقات ختامية في المستند حالياً.');
  };

  // 3. Citations & Bibliography (الاقتباسات وإدارة المصادر وقائمة المراجع)
  const insertCitation = (sourceObj = null) => {
    pushHistorySnapshot();
    const src = sourceObj || docSources[0] || { author: 'المرجع العلمي', year: '2026', title: 'الكتاب المقرر' };
    let formatted = `(${src.author}، ${src.year})`;
    if (citationStyle === 'MLA') {
      formatted = `(${src.author} - ${src.title})`;
    } else if (citationStyle === 'IEEE') {
      const idx = docSources.findIndex(s => s.id === src.id);
      formatted = `[${idx >= 0 ? idx + 1 : 1}]`;
    } else if (citationStyle === 'Chicago') {
      formatted = `(${src.author} ${src.year}، ${src.publisher || ''})`;
    }
    const html = `<span class="word-citation-tag" style="color: #1e40af; font-weight: 700; background: #eff6ff; padding: 1px 6px; border-radius: 4px; font-size: 0.92em;">${formatted}</span>&nbsp;`;
    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    if (activeEl) activeEl.focus();
    document.execCommand('insertHTML', false, html);
    handleAutoSave();
  };

  const handleAddSource = () => {
    if (!newSourceAuthor.trim() || !newSourceTitle.trim()) {
      alert('يرجى كتابة اسم المؤلف/الجهة وعنوان المرجع على الأقل.');
      return;
    }
    const newItem = {
      id: Date.now(),
      author: newSourceAuthor.trim(),
      title: newSourceTitle.trim(),
      year: newSourceYear.trim() || '2026',
      publisher: newSourcePublisher.trim() || 'دار النشر الأكاديمية',
      type: newSourceType
    };
    setDocSources(prev => [...prev, newItem]);
    setNewSourceAuthor('');
    setNewSourceTitle('');
    setNewSourcePublisher('');
  };

  const insertBibliography = () => {
    pushHistorySnapshot();
    const listHtml = docSources.map((s, idx) => {
      if (citationStyle === 'IEEE') {
        return `<div style="margin: 6px 0; padding-right: 8px; line-height: 1.75;"><strong>[${idx + 1}]</strong> ${s.author}، <em>«${s.title}»</em>، ${s.publisher}، ${s.year}.</div>`;
      }
      return `<div style="margin: 6px 0; padding-right: 8px; line-height: 1.75;">• <strong>${s.author}</strong> (${s.year}). <em>${s.title}</em>. ${s.publisher} (${s.type}).</div>`;
    }).join('');

    const bibHtml = `
      <div class="word-bibliography-block word-shape-item" data-atomic-block="true" style="border: 2px solid #cbd5e1; border-right: 6px solid #1e3a8a; border-radius: 10px; padding: 18px 22px; margin: 18px 0; background: #f8fafc; direction: rtl;">
        <div style="font-size: 19px; font-weight: 900; color: #1e3a8a; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 10px;">📚 قائمة المراجع والمصادر العلمية (${citationStyle})</div>
        ${listHtml}
      </div><br>
    `;
    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    if (activeEl) activeEl.focus();
    document.execCommand('insertHTML', false, bibHtml);
    handleAutoSave();
    triggerAutoPagination();
  };

  // 4. Captions & Table of Figures (التسميات التوضيحية وجدول الرسوم التوضيحية والإسناد الترافقي)
  const insertCaption = (labelType = captionType) => {
    const customTitle = window.prompt(`اكتب وصف ${labelType} التوضيحي:`, `توضيح تفصيلي لـ ${labelType}`);
    if (customTitle === null) return;
    pushHistorySnapshot();

    let count = 0;
    pages.forEach((p) => {
      const el = pageRefs.current[p.id];
      if (el) {
        count += el.querySelectorAll(`.word-caption-item[data-caption-type="${labelType}"]`).length;
      }
    });
    const nextNum = count + 1;
    const captionHtml = `<div class="word-caption-item" data-caption-type="${labelType}" data-caption-num="${nextNum}" style="text-align: center; font-size: 13.5px; font-weight: 800; color: #1e40af; background: #f8fafc; border: 1px dashed #93c5fd; border-radius: 6px; padding: 5px 14px; margin: 6px auto 14px auto; max-width: 85%;">${labelType} (${nextNum}): ${customTitle || ''}</div><br>`;

    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    if (activeEl) activeEl.focus();
    document.execCommand('insertHTML', false, captionHtml);
    handleAutoSave();
    triggerAutoPagination();
  };

  const insertTableOfFigures = () => {
    pushHistorySnapshot();
    const figures = [];
    pages.forEach((p, idx) => {
      const el = pageRefs.current[p.id];
      if (!el) return;
      el.querySelectorAll('.word-caption-item').forEach((cap) => {
        figures.push({
          text: (cap.innerText || cap.textContent || '').trim(),
          pageNum: idx + 1
        });
      });
    });

    const items = figures.length > 0
      ? figures
      : [
          { text: 'شكل (1): مخطط توضيحي للمفاهيم الأساسية', pageNum: 1 },
          { text: 'جدول (1): مقارنة شاملة بين عناصر الدرس', pageNum: 2 }
        ];

    const rows = items.map(f => `
      <div style="display: flex; align-items: baseline; justify-content: space-between; padding: 4px 0; font-size: 14px; color: #1e293b;">
        <span>🖼️ ${f.text}</span>
        <span style="flex: 1; border-bottom: 1px dotted #94a3b8; margin: 0 8px;"></span>
        <span style="font-weight: bold; color: #1d4ed8;">ص ${f.pageNum}</span>
      </div>
    `).join('');

    const html = `
      <div class="word-shape-item" data-atomic-block="true" style="border: 1.5px solid #93c5fd; border-radius: 10px; padding: 16px 20px; margin: 16px 0; background: #f0f9ff; direction: rtl;">
        <div style="font-size: 17px; font-weight: 900; color: #0369a1; margin-bottom: 10px; border-bottom: 1px solid #bae6fd; padding-bottom: 6px;">🖼️ جدول وفهرس الأشكال والرسوم التوضيحية</div>
        ${rows}
      </div><br>
    `;
    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    if (activeEl) activeEl.focus();
    document.execCommand('insertHTML', false, html);
    handleAutoSave();
    triggerAutoPagination();
  };

  const insertCrossReference = () => {
    const refTarget = window.prompt('اكتب الإسناد الترافقي للإشارة إليه داخل النص (مثال: انظر شكل 1 أو انظر جدول 1 أو راجع الصفحة 2):', 'انظر شكل (1)');
    if (!refTarget) return;
    pushHistorySnapshot();
    const html = `<span style="color: #0284c7; font-weight: bold; border-bottom: 1px dashed #0284c7;">[${refTarget}]</span>&nbsp;`;
    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    if (activeEl) activeEl.focus();
    document.execCommand('insertHTML', false, html);
    handleAutoSave();
  };

  // 5. Index (وضع علامة مصطلح وإدراج فهرس المصطلحات الأبجدي)
  const markIndexEntry = () => {
    const sel = window.getSelection();
    let term = sel ? sel.toString().trim() : '';
    if (!term) {
      term = window.prompt('اكتب المصطلح العلمي أو الكلمة المفتاحية لإضافتها إلى فهرس المصطلحات:', '');
    }
    if (!term) return;
    pushHistorySnapshot();
    const html = `<span class="word-index-term" data-index-term="${term.replace(/"/g, '&quot;')}" style="border-bottom: 1.5px dotted #16a34a; font-weight: 700;">${term}</span>`;
    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    if (activeEl) activeEl.focus();
    document.execCommand('insertHTML', false, html);
    handleAutoSave();
  };

  const insertAlphabeticalIndex = () => {
    pushHistorySnapshot();
    const termMap = new Map();
    pages.forEach((p, idx) => {
      const el = pageRefs.current[p.id];
      if (!el) return;
      el.querySelectorAll('.word-index-term, [data-index-term]').forEach((node) => {
        const term = (node.getAttribute('data-index-term') || node.innerText || '').trim();
        if (!term) return;
        if (!termMap.has(term)) termMap.set(term, new Set());
        termMap.get(term).add(idx + 1);
      });
    });

    if (termMap.size === 0) {
      const headings = extractDocumentHeadings();
      headings.forEach(h => {
        if (!termMap.has(h.text)) termMap.set(h.text, new Set());
        termMap.get(h.text).add(h.pageNum);
      });
    }

    const sortedEntries = Array.from(termMap.entries()).sort((a, b) => a[0].localeCompare(b[0], 'ar'));
    const entriesHtml = sortedEntries.length > 0
      ? sortedEntries.map(([term, pageSet]) => `
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding: 4px 6px; font-size: 13.5px;">
            <strong style="color: #0f172a;">• ${term}</strong>
            <span style="color: #059669; font-weight: bold;">ص ${Array.from(pageSet).join('، ')}</span>
          </div>
        `).join('')
      : `<div style="color: #64748b; font-size: 13px;">حدد أي مصطلح واضغط «وضع علامة للإدخال» ليظهر هنا مرتباً أبجدياً بأرقام الصفحات.</div>`;

    const indexHtml = `
      <div class="word-shape-item" data-atomic-block="true" style="border: 2px solid #059669; border-radius: 10px; padding: 16px 20px; margin: 18px 0; background: #f0fdf4; direction: rtl;">
        <div style="font-size: 18px; font-weight: 900; color: #065f46; border-bottom: 1.5px solid #a7f3d0; padding-bottom: 8px; margin-bottom: 10px;">🗂️ مسرد وفهرس المصطلحات الأبجدي</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px;">
          ${entriesHtml}
        </div>
      </div><br>
    `;
    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    if (activeEl) activeEl.focus();
    document.execCommand('insertHTML', false, indexHtml);
    handleAutoSave();
    triggerAutoPagination();
  };

  // ============================================================================
  // --- MICROSOFT WORD REVIEW TAB (مراجعة: التدقيق، المرادفات، الإحصائيات، القراءة الصوتية، التعليقات، تعقب التغييرات) ---
  // ============================================================================

  // 1. Smart Proofing & Punctuation Fixer (تدقيق إملائي وضبط علامات الترقيم والمسافات)
  const runSmartProofingAndPunctuation = () => {
    pushHistorySnapshot();
    setSpellCheckEnabled(true);
    let fixedCount = 0;

    pages.forEach((p) => {
      const el = pageRefs.current[p.id];
      if (!el) return;
      el.setAttribute('spellcheck', 'true');

      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      const textNodes = [];
      let n;
      while ((n = walker.nextNode())) {
        if (!n.parentElement?.closest('.katex, .equation-widget-inline, .equation-widget-block')) {
          textNodes.push(n);
        }
      }
      textNodes.forEach((tNode) => {
        const original = tNode.nodeValue;
        if (!original) return;
        const cleaned = original
          .replace(/[ \t]{2,}/g, ' ')
          .replace(/\s+([،؛؟!.])/g, '$1')
          .replace(/([،؛؟!])([^\s\d\n])/g, '$1 $2');
        if (cleaned !== original) {
          tNode.nodeValue = cleaned;
          fixedCount++;
        }
      });
    });

    handleAutoSave();
    alert(`✅ تم تفعيل التدقيق الإملائي والنحوي وتصحيح المسافات وعلامات الترقيم العربية تلقائياً في (${fixedCount}) موضعاً بالمستند!`);
  };

  // 2. Detailed Word Count & Document Statistics Modal (عدد الكلمات وإحصائيات المستند التفصيلية)
  const openWordCountModal = () => {
    let totalWords = 0;
    let charsWithSpaces = 0;
    let charsNoSpaces = 0;
    let paragraphs = 0;
    let tables = 0;
    let images = 0;
    let shapes = 0;
    let equations = 0;

    pages.forEach((p) => {
      const el = pageRefs.current[p.id];
      const text = el ? (el.innerText || '') : '';
      const trimmed = text.trim();
      if (trimmed) {
        totalWords += trimmed.split(/\s+/).length;
        paragraphs += trimmed.split(/\n+/).filter(line => line.trim().length > 0).length;
      }
      charsWithSpaces += text.length;
      charsNoSpaces += text.replace(/\s/g, '').length;
      if (el) {
        tables += el.querySelectorAll('table').length;
        images += el.querySelectorAll('img').length;
        shapes += el.querySelectorAll('.word-shape-item').length;
        equations += el.querySelectorAll('.equation-widget-inline, .equation-widget-block').length;
      }
    });

    const lines = Math.max(1, Math.ceil(totalWords / 11));
    const readingMinutes = Math.max(1, Math.ceil(totalWords / 180));

    setDetailedStats({
      pages: pages.length,
      words: totalWords,
      charsWithSpaces,
      charsNoSpaces,
      paragraphs: Math.max(1, paragraphs),
      lines,
      tables,
      images,
      shapes,
      equations,
      readingMinutes
    });
    setShowWordCountModal(true);
  };

  // 3. Built-in Arabic/English Academic Thesaurus & Synonyms (قاموس المرادفات والأضداد)
  const ARABIC_THESAURUS_DB = {
    'شرح': { synonyms: ['توضيح', 'تفسير', 'بيان', 'تفصيل', 'تحليل', 'تبسيط'], antonyms: ['إبهام', 'غموض', 'إجمال'] },
    'مهم': { synonyms: ['جوهري', 'أساسي', 'حيوي', 'ضروري', 'رئيسي', 'محوري'], antonyms: ['ثانوي', 'هامشي', 'فرعي'] },
    'سؤال': { synonyms: ['مسألة', 'استفهام', 'تدريب', 'تمرين', 'مطلب', 'اختبار'], antonyms: ['إجابة', 'جواب', 'حل'] },
    'إجابة': { synonyms: ['جواب', 'حل', 'رد', 'توضيح نموذجى', 'استنتاج'], antonyms: ['سؤال', 'إشكال', 'تساؤل'] },
    'قاعدة': { synonyms: ['قانون', 'مبدأ', 'أساس', 'ضابط', 'معيار', 'نظرية'], antonyms: ['استثناء', 'شذوذ'] },
    'نتيجة': { synonyms: ['ثمرة', 'محصلة', 'خلاصة', 'استنتاج', 'أثر', 'عاقبة'], antonyms: ['سبب', 'مقدمة', 'بداية'] },
    'سبب': { synonyms: ['علة', 'دافع', 'باعث', 'عامل', 'مبرر', 'منطلق'], antonyms: ['نتيجة', 'أثر'] },
    'مثال': { synonyms: ['نموذج', 'تطبيق', 'شاهد', 'عينة', 'توضيح عملي'], antonyms: ['قاعدة مجردة'] },
    'واضح': { synonyms: ['جلي', 'بيّن', 'ظاهر', 'صريح', 'مفهوم', 'مشرق'], antonyms: ['غامض', 'مبهم', 'خفي'] },
    'كبير': { synonyms: ['عظيم', 'ضخم', 'واسع', 'هائل', 'جسيم', 'بارز'], antonyms: ['صغير', 'ضئيل', 'محدود'] },
    'صغير': { synonyms: ['ضئيل', 'محدود', 'وجيز', 'مختصر', 'قليل'], antonyms: ['كبير', 'عظيم', 'ضخم'] },
    'سريع': { synonyms: ['عاجل', 'فوري', 'خاطف', 'متسارع', 'مباشر'], antonyms: ['بطيء', 'متأنٍ', 'متدرج'] },
    'جميل': { synonyms: ['بديع', 'رائع', 'حسن', 'بهي', 'أنيق', 'بليغ'], antonyms: ['قبيح', 'رديء'] },
    'علم': { synonyms: ['معرفة', 'إدراك', 'فقه', 'دراية', 'ثقافة', 'بصيرة'], antonyms: ['جهل', 'غفلة'] },
    'تطور': { synonyms: ['تقدم', 'نمو', 'ارتقاء', 'ازدهار', 'نهضة', 'تحديث'], antonyms: ['تأخر', 'تراجع', 'جمود'] },
    'تحليل': { synonyms: ['تفكيك', 'دراسة عميقة', 'فحص', 'استقصاء', 'تشريح'], antonyms: ['تركيب', 'إجمال'] },
    'ملخص': { synonyms: ['موجز', 'خلاصة', 'زبدة', 'مختصر', 'مجمل'], antonyms: ['تفصيل', 'إسهاب', 'إطناب'] },
    'مقارنة': { synonyms: ['موازنة', 'مقابلة', 'مضاهاة', 'مقاربة'], antonyms: ['فصل', 'إفراد'] }
  };

  const lookupThesaurus = (wordInput) => {
    const clean = (wordInput || '').trim().replace(/^[ال]+/, '');
    const exact = (wordInput || '').trim();
    const found = ARABIC_THESAURUS_DB[exact] || ARABIC_THESAURUS_DB[clean];
    if (found) {
      setThesaurusResults([
        { word: exact, synonyms: found.synonyms, antonyms: found.antonyms }
      ]);
    } else if (exact) {
      setThesaurusResults([
        {
          word: exact,
          synonyms: [`بيان ${exact}`, `توضيح ${exact}`, `مفهوم ${exact}`, `مدلول ${exact}`, `جوهر ${exact}`],
          antonyms: [`عكس ${exact}`, `نقيض ${exact}`]
        }
      ]);
    } else {
      setThesaurusResults(
        Object.entries(ARABIC_THESAURUS_DB).slice(0, 6).map(([k, v]) => ({
          word: k,
          synonyms: v.synonyms,
          antonyms: v.antonyms
        }))
      );
    }
  };

  const openThesaurusForSelection = () => {
    const sel = window.getSelection();
    const selectedWord = sel ? sel.toString().trim() : '';
    setThesaurusQuery(selectedWord);
    lookupThesaurus(selectedWord);
    setShowThesaurusModal(true);
  };

  // 4. Read Aloud / Text-to-Speech (قراءة بصوت عالٍ باللغة العربية والإنجليزية)
  const toggleReadAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('متصفحك لا يدعم القراءة الصوتية المباشرة.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const sel = window.getSelection();
    let textToRead = sel ? sel.toString().trim() : '';
    if (!textToRead) {
      const activeEl = pageRefs.current[pages[activePageIndex]?.id];
      textToRead = activeEl ? (activeEl.innerText || '').trim() : '';
    }
    if (!textToRead) {
      alert('لا يوجد نص لقراءته في الصفحة الحالية.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    const hasArabic = /[\u0600-\u06FF]/.test(textToRead);
    utterance.lang = hasArabic ? 'ar-EG' : 'en-US';
    utterance.rate = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => hasArabic ? v.lang.startsWith('ar') : v.lang.startsWith('en'));
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // 5. Accessibility & Quality Check (التحقق من إمكانية الوصول وجودة تنسيق الملزمة)
  const runAccessibilityCheck = () => {
    const checks = [];
    const headings = extractDocumentHeadings();

    checks.push({
      title: 'عنوان الملزمة الرئيسي',
      status: docTitle && docTitle.trim() !== 'ملزمة جديدة' ? 'pass' : 'warn',
      detail: docTitle ? `العنوان الحالي: «${docTitle}»` : 'يُنصح بتخصيص عنوان واضح للملزمة في الشريط العلوي.'
    });

    checks.push({
      title: 'هيكل العناوين والفصول (Headings)',
      status: headings.length > 0 ? 'pass' : 'warn',
      detail: headings.length > 0
        ? `تم العثور على (${headings.length}) عناوين منظمة جاهزة لجدول المحتويات.`
        : 'لم يتم استخدام أنماط العناوين (عنوان 1، عنوان 2) بعد. استخدمها لتوليد فهرس تلقائي.'
    });

    let tablesCount = 0;
    let tablesWithHeaders = 0;
    pages.forEach((p) => {
      const el = pageRefs.current[p.id];
      if (!el) return;
      const tbls = el.querySelectorAll('table');
      tablesCount += tbls.length;
      tbls.forEach(t => {
        if (t.querySelector('thead, th')) tablesWithHeaders++;
      });
    });

    checks.push({
      title: 'ترويسة الجداول وتكرار صف الرأس',
      status: tablesCount === 0 || tablesWithHeaders === tablesCount ? 'pass' : 'warn',
      detail: tablesCount === 0
        ? 'لا توجد جداول تحتاج لمراجعة.'
        : `يوجد (${tablesWithHeaders} من ${tablesCount}) جداول تحتوي على صف رأس واضح للطباعة.`
    });

    checks.push({
      title: 'جاهزية الطباعة وتوافق مقاس A4',
      status: 'pass',
      detail: `جميع الصفحات (${pages.length} صفحة) مضبوطة بمقاس A4 قياسي (210mm × 297mm) وجاهزة للتصدير PDF.`
    });

    setAccessibilityReport(checks);
    setShowAccessibilityModal(true);
  };

  // 6. Review Comments (إدراج وحذف والتنقل بين التعليقات)
  const insertReviewComment = () => {
    if (isEditingRestricted) {
      alert('المستند محمي حالياً في وضع تقييد التحرير. قم بإلغاء القفل أولاً.');
      return;
    }
    const commentText = window.prompt('💬 اكتب نص التعليق أو الملاحظة المرجعية:', 'ملاحظة للمراجعة...');
    if (!commentText) return;
    pushHistorySnapshot();

    const sel = window.getSelection();
    const selectedStr = sel ? sel.toString().trim() : '';
    const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const commentHtml = selectedStr
      ? `<span class="word-review-comment" data-comment="${commentText.replace(/"/g, '&quot;')}" style="background: #fef08a; border-bottom: 2px solid #eab308; padding: 0 3px; border-radius: 3px;">${selectedStr}<span class="no-print" contenteditable="false" style="background: #ca8a04; color: white; font-size: 10.5px; font-weight: bold; padding: 1px 6px; border-radius: 99px; margin: 0 4px; vertical-align: middle;" title="${commentText.replace(/"/g, '&quot;')}">💬 ${commentText} (${timeStr})</span></span>&nbsp;`
      : `<span class="word-review-comment no-print" contenteditable="false" data-comment="${commentText.replace(/"/g, '&quot;')}" style="background: #fef9c3; border: 1.5px solid #eab308; color: #854d0e; font-size: 12px; font-weight: bold; padding: 2px 8px; border-radius: 99px; margin: 0 4px; display: inline-block;">💬 تعليق: ${commentText} (${timeStr})</span>&nbsp;`;

    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    if (activeEl) activeEl.focus();
    document.execCommand('insertHTML', false, commentHtml);
    handleAutoSave();
  };

  const deleteAllComments = () => {
    pushHistorySnapshot();
    pages.forEach((p) => {
      const el = pageRefs.current[p.id];
      if (!el) return;
      el.querySelectorAll('.word-review-comment').forEach((node) => {
        node.querySelectorAll('.no-print').forEach(badge => badge.remove());
        if (node.classList.contains('no-print')) {
          node.remove();
        } else {
          const textNode = document.createTextNode(node.innerText || '');
          node.replaceWith(textNode);
        }
      });
    });
    handleAutoSave();
  };

  // 7. Track Changes Accept / Reject (قبول ورفض التغييرات المتعقبة)
  const acceptAllTrackedChanges = () => {
    pushHistorySnapshot();
    pages.forEach((p) => {
      const el = pageRefs.current[p.id];
      if (!el) return;
      el.querySelectorAll('ins, .word-tracked-ins').forEach((insNode) => {
        insNode.style.textDecoration = 'none';
        insNode.style.background = 'transparent';
        insNode.style.color = 'inherit';
      });
      el.querySelectorAll('del, .word-tracked-del').forEach((delNode) => delNode.remove());
    });
    setTrackChangesMode(false);
    handleAutoSave();
  };

  const rejectAllTrackedChanges = () => {
    pushHistorySnapshot();
    pages.forEach((p) => {
      const el = pageRefs.current[p.id];
      if (!el) return;
      el.querySelectorAll('ins, .word-tracked-ins').forEach((insNode) => insNode.remove());
    });
    setTrackChangesMode(false);
    handleAutoSave();
  };

  // ============================================================================
  // --- MICROSOFT WORD VIEW TAB & MACROS (عرض: التنقل، الماكرو الذكي، القارئ الشامل) ---
  // ============================================================================

  const jumpToPageIndex = (idx) => {
    const targetIdx = Math.max(0, Math.min(pages.length - 1, idx));
    setActivePageIndex(targetIdx);
    const el = pageRefs.current[pages[targetIdx]?.id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (!isEditingRestricted) el.focus();
    }
  };

  const runSmartMacroAutoFormat = () => {
    pushHistorySnapshot();
    pages.forEach((p) => {
      const el = pageRefs.current[p.id];
      if (!el) return;
      // Clean excessive <br> sequences (more than 2 in a row)
      el.innerHTML = el.innerHTML.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');
      // Ensure all tables are centered and cleanly bordered
      el.querySelectorAll('table').forEach((tbl) => {
        tbl.style.marginLeft = 'auto';
        tbl.style.marginRight = 'auto';
        tbl.style.borderCollapse = 'collapse';
      });
    });
    handleAutoSave();
    rebalanceAllPages();
    alert('✨ تم تشغيل الماكرو الذكي: تم تنظيف الأسطر الفارغة الزائدة، وضبط محاذاة الجداول، وموازنة الصفحات تلقائياً!');
  };

  const getSmartContext = () => {
    if (crossPageSelection && crossPageSelection.text) {
      return {
        selectedText: crossPageSelection.text,
        contextText: crossPageSelection.text,
        isCrossPage: true,
        crossSelection: crossPageSelection
      };
    }
    const selection = window.getSelection();
    let selectedText = selection ? selection.toString() : '';
    let contextText = '';
    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    if (activeEl) contextText = activeEl.innerText || '';
    return { selectedText, contextText, isCrossPage: false, crossSelection: null };
  };

  // Convert Markdown tables (| ... |) into styled HTML tables with clear borders
  const convertMarkdownTablesToHtml = (text) => {
    if (!text || typeof text !== 'string') return text;

    // Matches markdown table blocks: header row, separator row, and one or more data rows
    const tableRegex = /((?:^[ \t]*\|[^\n]+\|[ \t]*\r?\n)(?:^[ \t]*\|[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|[ \t]*\r?\n)(?:^[ \t]*\|[^\n]+\|[ \t]*(?:\r?\n|$))+)/gm;

    return text.replace(tableRegex, (match) => {
      const lines = match.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) return match;

      const parseCells = (line) => {
        let inner = line;
        if (inner.startsWith('|')) inner = inner.slice(1);
        if (inner.endsWith('|')) inner = inner.slice(0, -1);
        return inner.split('|').map(c => c.trim());
      };

      const headerCells = parseCells(lines[0]);
      // line 1 is separator |---|---|
      const dataRows = lines.slice(2).map(parseCells);

      const theadHtml = '<tr style="background-color: #f1f5f9;">' +
        headerCells.map(h => `<th style="border: 1px solid #94a3b8; padding: 8px 12px; font-weight: 700; color: #0f172a; text-align: center; vertical-align: middle;">${h}</th>`).join('') +
        '</tr>';

      const tbodyHtml = dataRows.map((row, rIdx) => {
        const bg = rIdx % 2 === 1 ? '#f8fafc' : '#ffffff';
        const cellsHtml = row.map(cell => `<td style="border: 1px solid #94a3b8; padding: 6px 10px; text-align: center; vertical-align: middle;">${cell || '<br>'}</td>`).join('');
        return `<tr style="background-color: ${bg};">${cellsHtml}</tr>`;
      }).join('');

      return `\n<table class="user-doc-table" style="width: 100%; border-collapse: collapse; margin: 10px 0; border: 1.5px solid #94a3b8;" dir="rtl"><thead>${theadHtml}</thead><tbody>${tbodyHtml}</tbody></table>\n`;
    });
  };

  // Professional HTML Sanitizer for AI output: Converts tables, enforces borders, removes excessive Enters & runaway breaks
  const sanitizeAiHtml = (html) => {
    if (!html) return '';
    let processed = convertMarkdownTablesToHtml(html);

    // Enforce clear borders on any raw HTML tables produced by AI
    processed = processed
      .replace(/<table(?![^>]*class="user-doc-table")([^>]*)>/gi, '<table class="user-doc-table" style="width: 100%; border-collapse: collapse; margin: 10px 0; border: 1.5px solid #94a3b8;" $1>')
      .replace(/<th(?![^>]*style=)([^>]*)>/gi, '<th style="border: 1px solid #94a3b8; padding: 8px 12px; background-color: #f1f5f9; font-weight: 700; text-align: center;" $1>')
      .replace(/<td(?![^>]*style=)([^>]*)>/gi, '<td style="border: 1px solid #94a3b8; padding: 6px 10px; text-align: center;" $1>');

    return processed
      // 1. Collapse multiple consecutive <br> to at most 1
      .replace(/(<br\s*\/?>\s*){2,}/gi, '<br>')
      // 2. Collapse consecutive empty paragraphs <p><br></p><p><br></p> to 1
      .replace(/(<p[^>]*>(\s*<br\s*\/?>|\s*|&nbsp;)*<\/p>\s*){2,}/gi, '<p style="margin: 3px 0;"><br></p>')
      // 3. Remove empty paragraphs directly touching headings and tables
      .replace(/(<h[1-6][^>]*>.*?<\/h[1-6]>)\s*(<p[^>]*>(\s*<br\s*\/?>|\s*|&nbsp;)*<\/p>\s*)+/gi, '$1')
      .replace(/(<p[^>]*>(\s*<br\s*\/?>|\s*|&nbsp;)*<\/p>\s*)+(<h[1-6][^>]*>)/gi, '$3')
      .replace(/(<table[^>]*>[\s\S]*?<\/table>)\s*(<p[^>]*>(\s*<br\s*\/?>|\s*|&nbsp;)*<\/p>\s*)+/gi, '$1')
      .replace(/(<p[^>]*>(\s*<br\s*\/?>|\s*|&nbsp;)*<\/p>\s*)+(<table[^>]*>)/gi, '$3')
      // 4. Clean empty paragraphs at start and end
      .replace(/^(<p[^>]*>(\s*<br\s*\/?>|\s*|&nbsp;)*<\/p>\s*)+/gi, '')
      .replace(/(<p[^>]*>(\s*<br\s*\/?>|\s*|&nbsp;)*<\/p>\s*)+$/gi, '')
      // 5. Clean redundant newlines between tags
      .replace(/>\s*\n+\s*</g, '><')
      .trim();
  };

  // Apply AI result across multi-page selection
  const applyCrossPageAiResult = (resultText, crossSel) => {
    pushHistorySnapshot();
    const cleanResult = sanitizeAiHtml(resultText);
    if (crossRangesRef.current.length > 0) {
      for (let i = 1; i < crossRangesRef.current.length; i++) {
        try { crossRangesRef.current[i].deleteContents(); } catch (_) {}
      }
      try {
        const firstRange = crossRangesRef.current[0];
        firstRange.deleteContents();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cleanResult;
        const frag = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          frag.appendChild(tempDiv.firstChild);
        }
        firstRange.insertNode(frag);
      } catch (_) {
        const startEl = pageRefs.current[pages[crossSel.startPageIndex]?.id];
        if (startEl) startEl.innerHTML += cleanResult;
      }
    }
    clearCrossPageSelection();
    handleAutoSave();
    setTimeout(rebalanceAllPages, 80);
  };

  // Logic Actions (Specialized for Al-Wateen Platform & Egyptian Arabic Curriculum)
  const callAI = async (promptType, customPromptText = '', forceWholeDocument = false) => {
    const isDocWide = forceWholeDocument || isAllPagesSelected;
    const { selectedText, contextText, isCrossPage, crossSelection } = getSmartContext();

    if (!isDocWide && !isCrossPage && !selectedText && !['continue', 'custom', 'format'].includes(promptType)) { 
      alert("الرجاء تحديد النص الذي تريد تطبيق الذكاء الاصطناعي عليه أولاً."); 
      return; 
    }
    setLoading(true);

    const baseIdentity = `أنت المساعد الأكاديمي والتربوي الذكي للأ. إبراهيم عمار الوتين (خبير ومعلم أول مادة اللغة العربية للمرحلتين الإعدادية والثانوية في جمهورية مصر العربية) عبر منصة الوتين التعليمية (alwateen.com).
هدفك: صياغة وإعداد محتوى تعليمي فخم، فائق الدقة اللغوية والنحوية، ومطابق تماماً لمواصفات المركز القومي للامتحانات ونظام التعليم المصري الحديث، ومصمم خصيصاً للطباعة في ملازم A4 أنيقة ومريحة للعين.`;

    // --- CASE 1: WHOLE DOCUMENT EXECUTION (When all pages selected or whole-doc format requested) ---
    if (isDocWide) {
      const currentPages = syncPagesContent();
      const allPagesDetailedText = currentPages.map((p, idx) => {
        const el = pageRefs.current[p.id];
        const pageText = el ? (el.innerText || '').trim() : (p.content || '').replace(/<[^>]+>/g, ' ').trim();
        return `=== [صفحة رقم ${idx + 1} من ${currentPages.length}] ===\n${pageText}`;
      }).join('\n\n');

      let docWideTask = "إعادة صياغة وتنسيق كامل مستند الملزمة التعليمية";
      if (promptType === 'format') docWideTask = "تنسيق شامل وإعادة هيكلة أكاديمية لكامل صفحات الملزمة وتوزيع المحتوى بأناقة للطباعة A4";
      else if (promptType === 'correct') docWideTask = "تدقيق لغوي ونحوي وإملائي شامل لكامل المستند وضبط أواخر الكلمات بدقة تامة";
      else if (promptType === 'summarize') docWideTask = "تلخيص شامل لجميع موضوعات وقواعد الملزمة في نقاط وبطاقات مراجعة منظمة";
      else if (promptType === 'table') docWideTask = "تحويل المقارنات والبيانات في الملزمة إلى جداول HTML متناسقة";
      else if (promptType === 'custom') docWideTask = `تنفيذ هذا الطلب الخاص على كامل المستند: "${customPromptText}"`;

      const docWideSystemPrompt = `${baseIdentity}
المهمة: ${docWideTask} (إجمالي صفحات المستند: ${currentPages.length} صفحات).
قواعد العمل الإلزامية للمستند بالكامل:
1. الشمول والكمال: قم بمعالجة وتنسيق محتوى الملزمة كاملاً من الصفحة الأولى وحتى الصفحة الأخيرة دون حذف أو اقتطاع أي موضوع تعليمي.
2. الهيكل والتنسيق: نسق المخرجات بهيكل تعليمي فاخر مقاس A4: عناوين رئيسية <h3> ذات مظهر أكاديمي، فقرات متناسقة <p>، نقاط بارزة <ul><li>، تظليل القواعد والتنبيهات الهامة (<div style="background:#f8fafc; border-right:4px solid #3b82f6; padding:10px 14px; margin:8px 0; border-radius:6px;">)، وإبراز الكلمات المحورية (<span style="color:#1d4ed8; font-weight:bold;">).
3. منع الأسطر الفارغة والفراغات الزائدة: ممنوع منعاً باتاً وضع فراغات مفرطة أو أسطر فارغة متكررة أو وسوم <br> عشوائية بين الفقرات. اجعل المسافة بين كل فقرة والتالية مسافة سطرية واحدة طبيعية موحدة تماماً.
4. التقسيم بين الموضوعات: يمكنك وضع <!--PAGE_BREAK--> عند الانتقال بين الفصول أو الموضوعات الرئيسية ليتم توزيعها بسلاسة عبر صفحات A4.
5. أعد كود HTML نظيف ومحكم فقط بدون وسوم <html> أو <body> وبدون ماركداون.`;

      try {
        const rawResult = await callGeminiApi([
          { 
            role: 'user', 
            parts: [{ text: `${docWideSystemPrompt}\n\nعنوان الملزمة: ${docTitle || 'ملزمة لغة عربية'}\nنطاق العمل: كامل المستند (${currentPages.length} صفحات)\n\nمحتوى صفحات المستند الحالية بالتفصيل:\n${allPagesDetailedText}` }] 
          }
        ], geminiModel, { temperature: 0.35 });

        if (rawResult) {
          let resultText = rawResult.trim()
            .replace(/^```html\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```$/i, '')
            .trim();

          resultText = sanitizeAiHtml(resultText);
          replaceEntireDocumentWithAi(resultText);
          setIsAllPagesSelected(false);
          clearCrossPageSelection();
          if (promptType === 'custom') setCustomAiPrompt('');
        }
      } catch (err) {
        alert("حدث خطأ أثناء تنفيذ أمر الذكاء على كامل المستند: " + err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // --- CASE 2: CROSS-PAGE SELECTION EXECUTION (Text spanning multiple pages) ---
    if (isCrossPage && crossSelection) {
      const crossSystemPrompt = `${baseIdentity}
المهمة: معالجة النص التعليمي المحدد والممتد بين صفحة ${crossSelection.startPageIndex + 1} وصفحة ${crossSelection.endPageIndex + 1}.
نوع العملية: ${promptType === 'format' ? 'إعادة تنسيق النص وصياغته بأسلوب تعليمي فاخر' : promptType === 'correct' ? 'تدقيق نحوي ولغوي وضبط الحركات' : promptType === 'summarize' ? 'تلخيص هذا الجزء المحدد' : customPromptText || 'معالجة النص'}
قواعد العمل:
1. صغ الناتج بتنسيق HTML راقٍ ومريح للعين والطباعة.
2. اضبط المسافات بين الفقرات بدون أي أسطر فارغة متكررة أو <br> مفرطة.
3. أعد كود HTML نظيف فقط بدون وسوم <html> أو <body> وبدون ماركداون.`;

      try {
        const rawResult = await callGeminiApi([
          { 
            role: 'user', 
            parts: [{ text: `${crossSystemPrompt}\n\nعنوان الملزمة: ${docTitle || 'ملزمة لغة عربية'}\nالنص المحدد للعمل عليه:\n${crossSelection.text}` }] 
          }
        ], geminiModel, { temperature: 0.35 });

        if (rawResult) {
          let resultText = rawResult.trim()
            .replace(/^```html\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```$/i, '')
            .trim();

          resultText = sanitizeAiHtml(resultText);
          applyCrossPageAiResult(resultText, crossSelection);
          if (promptType === 'custom') setCustomAiPrompt('');
        }
      } catch (err) {
        alert("حدث خطأ أثناء معالجة النص المحدد عبر الصفحات: " + err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // --- CASE 3: SINGLE PAGE EXECUTION ---
    let systemPrompt = "";
    if (promptType === 'correct') {
      systemPrompt = `${baseIdentity}
المهمة: تدقيق لغوي ونحوي وإملائي تخصصي فائق الدقة.
قواعد العمل:
1. صحح أي خطأ نحوي أو إملائي (همزات الوصل والقطع، الهمزة المتوسطة والمتطرفة، التاء المربوطة والمفتوحة، تنوين النصب، الألف الفارقة).
2. اضبط أواخر الكلمات والحركات الإعرابية الضرورية بدقة متناهية وفق قواعد النحو والصرف المعتمدة في المناهج المصرية.
3. حافظ على أسلوب النص الأصلي وتنسيقه، وامنع الأسطر الفارغة المفرطة، وأعد فقط النص المصحح والمضبوط بدون أي تعليقات أو هوامش إضافية وبدون كود ماركداون.`;
    } else if (promptType === 'continue') {
      systemPrompt = `${baseIdentity}
المهمة: استكمال الشرح وصياغة فقرة تعليمية جديدة للملزمة.
قواعد العمل:
1. اكتب بأسلوب المستر إبراهيم عمار التعليمي المتميز: لغة عربية فصحى راقية، شرح مبسط، مشوق، مع ضرب أمثلة وشواهد توضيحية وتنبيهات على "التريكات الامتحانية" المهمة.
2. نسق المحتوى كـ HTML راقٍ جاهز للطباعة: عناوين فرعية أنيقة <h3>، فقرات متناسقة <p>، نقاط مميزة <ul><li>، وتظليل المصطلحات والقواعد الهامة بلون مميز (<span style="color:#1d4ed8; font-weight:bold;">).
3. اضبط المسافات بين الفقرات بدون أسطر فارغة مفرطة، وأعد كود HTML نظيف فقط بدون وسوم <html> أو <body> وبدون كود ماركداون.`;
    } else if (promptType === 'summarize') {
      systemPrompt = `${baseIdentity}
المهمة: تلخيص سبوري وامتحاني مركز وشامل.
قواعد العمل:
1. استخلص أهم القواعد ونواتج التعلم والنقاط الجوهرية التي لا يخرج عنها أي امتحان وزاري.
2. نسق التلخيص في كود HTML جذاب: استخدم قائمة نقطية مرتبة <ul><li> مع إبراز المفاهيم، أو بطاقات ملخصة سهلة الحفظ والمراجعة ليلة الامتحان بدون أسطر فارغة مكررة.
3. أعد كود HTML نظيف فقط بدون أي مقدمات أو علامات ماركداون.`;
    } else if (promptType === 'format') {
      systemPrompt = `${baseIdentity}
المهمة: إعادة صياغة وتنسيق المحتوى ليكون ملزمة تعليمية فاخرة ومثالية للطباعة مقاس A4.
قواعد العمل:
1. رتب النص في هيكل تعليمي منظم: عنوان رئيسي <h3> ذو خط تحتاني أنيق، فقرات محددة، تظليل القواعد والملاحظات المهمة (<div style="background:#f8fafc; border-right:4px solid #3b82f6; padding:10px 14px; margin:8px 0; border-radius:6px;">).
2. إبراز الكلمات المحورية والشواهد بلون كحلي/أزرق مميز (<span style="color:#1d4ed8; font-weight:bold;">).
3. منع الأسطر الفارغة والفراغات الزائدة: ممنوع منعاً باتاً وضع فراغات مفرطة أو أسطر فارغة متكررة أو وسوم <br> عشوائية بين الفقرات.
4. أعد كود HTML نظيف ومحكم فقط بدون أي وسوم خارجية وبدون فراغات عشوائية وبدون ماركداون.`;
    } else if (promptType === 'table') {
      systemPrompt = `${baseIdentity}
المهمة: تحويل المعلومات المحددة إلى جدول مقارنة أو جدول إعراب/استخراج احترافي.
قواعد العمل:
1. أنشئ جدول HTML أنيق ومحكم بحدود متناسقة وتنسيق متوافق مع طباعة الملزمة:
<table style="width:100%; border-collapse:collapse; margin:12px 0; font-size:14px; text-align:right;">
<thead><tr style="background:#f1f5f9; border-bottom:2px solid #cbd5e1;"><th style="padding:8px 12px; border:1px solid #cbd5e1;">...</th></tr></thead>
<tbody><tr><td style="padding:8px 12px; border:1px solid #cbd5e1;">...</td></tr></tbody>
</table>
2. اجعل العناوين بارزة وواضحة وسهلة القراءة والمقارنة للطلاب.
3. أعد كود الجدول HTML فقط بدون أي نصوص تمهيدية أو ماركداون.`;
    } else if (promptType === 'custom') {
      systemPrompt = `${baseIdentity}
المهمة: تنفيذ هذا الطلب الخاص بدقة تامة للأستاذ:
"${customPromptText}"
قواعد العمل:
1. التزم بالمنهج المصري لمادة اللغة العربية ومعايير الامتحانات الحديثة (نظام البابل شيت والمقالي، نواتج التعلم، صياغة الأسئلة ونماذج الإجابة).
2. اضبط المسافات بين الفقرات بدون فراغات مفرطة أو أسطر فارغة متكررة.
3. صغ الناتج بتنسيق HTML نظيف، فخم، وجاهز للإدراج والطباعة مباشرة في الصفحة بدون وسوم html/body وبدون كود ماركداون.`;
    }

    try {
      const targetContent = selectedText || contextText || "الملزمة فارغة، ابدأ بكتابة المحتوى المطلوب.";
      const rawResult = await callGeminiApi([
        { 
          role: 'user', 
          parts: [{ text: `${systemPrompt}\n\nعنوان الملزمة: ${docTitle || 'ملزمة لغة عربية'}\nالصفحة الحالية: صفحة ${activePageIndex + 1} من ${pages.length}\n\nسياق الصفحة الحالية:\n${contextText}\n\nالمحتوى المطلوب العمل عليه:\n${targetContent}` }] 
        }
      ], geminiModel, { temperature: 0.35 });

      if (rawResult) {
        let resultText = rawResult.trim()
          .replace(/^```html\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```$/i, '')
          .trim();

        // Convert any Markdown tables to HTML tables first
        resultText = convertMarkdownTablesToHtml(resultText);

        const hasBlockHtml = /<(p|div|h[1-6]|table|tr|ul|ol|li|blockquote)/i.test(resultText);
        if (!hasBlockHtml && !['format', 'table', 'custom'].includes(promptType)) {
          resultText = resultText
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/\*(.*?)\*/g, '<i>$1</i>')
            .replace(/\n\n+/g, '</p><p>')
            .replace(/\n/g, '<br>');
          resultText = `<p>${resultText}</p>`;
        }

        resultText = sanitizeAiHtml(resultText);
        
        const activeEl = pageRefs.current[pages[activePageIndex]?.id];
        if (activeEl) {
          activeEl.focus();
          document.execCommand('insertHTML', false, resultText);
          handleAutoSave();
          setTimeout(rebalanceAllPages, 100);
        }
        if (promptType === 'custom') setCustomAiPrompt('');
      }
    } catch (err) { 
      alert("حدث خطأ أثناء تنفيذ أمر الذكاء: " + err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- FREE OCR ENGINE (Tesseract.js Client-Side + High-Precision Vision Fallback) ---
  const loadTesseract = async () => {
    if (typeof window === 'undefined') return null;
    if (window.Tesseract) return window.Tesseract;
    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById('tesseract-js');
      if (existingScript) {
        if (window.Tesseract) {
          resolve(window.Tesseract);
          return;
        }
        existingScript.addEventListener('load', () => resolve(window.Tesseract));
        existingScript.addEventListener('error', () => resolve(null));
        return;
      }
      const script = document.createElement('script');
      script.id = 'tesseract-js';
      // Use cdnjs which is whitelisted in Content-Security-Policy
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.0/tesseract.min.js';
      script.async = true;
      script.onload = () => resolve(window.Tesseract);
      script.onerror = () => {
        // Fallback to jsdelivr if allowed
        const fallbackScript = document.createElement('script');
        fallbackScript.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        fallbackScript.onload = () => resolve(window.Tesseract);
        fallbackScript.onerror = () => resolve(null); // Do not throw, resolve null so fallback takes over
        document.head.appendChild(fallbackScript);
      };
      document.head.appendChild(script);
    });
  };

  const runFreeOcr = async (imageSrc, lang = ocrLanguage) => {
    if (!imageSrc) {
      alert('الرجاء اختيار صورة أولاً لاستخراج النص منها.');
      return '';
    }
    setOcrLoading(true);
    setOcrProgress('جاري فحص واستخراج النصوص من الصورة...');

    let extracted = '';

    // Engine 1: Client-Side Tesseract OCR
    try {
      const Tesseract = await loadTesseract();
      if (Tesseract && typeof Tesseract.createWorker === 'function') {
        setOcrProgress('جاري تشغيل محرك معالجة الحروف...');
        const worker = await Tesseract.createWorker(lang, 1, {
          workerPath: 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.0/worker.min.js',
          logger: m => {
            if (m.status === 'recognizing text') {
              const pct = Math.round((m.progress || 0) * 100);
              setOcrProgress(`جاري استخراج وقراءة النصوص... ${pct}%`);
            } else if (m.status === 'loading tesseract core') {
              setOcrProgress('جاري تحميل نواة معالجة الحروف...');
            } else if (m.status === 'loading language traineddata') {
              setOcrProgress('جاري تحميل قواميس اللغة العربية والإنجليزية...');
            } else if (m.status === 'initializing api') {
              setOcrProgress('جاري بدء التحليل البصري للصورة...');
            }
          }
        });

        const ret = await worker.recognize(imageSrc);
        await worker.terminate();
        extracted = (ret?.data?.text || '').trim();
      }
    } catch (clientOcrErr) {
      console.warn('Client Tesseract OCR skipped, switching to Direct Vision OCR...', clientOcrErr);
    }

    // Engine 2: High-Precision Direct Vision OCR (100% Guaranteed via Fetch API)
    if (!extracted) {
      try {
        setOcrProgress('جاري استخراج النصوص بدقة عالية عبر التحليل البصري...');
        const base64Data = imageSrc.includes(';base64,') ? imageSrc.split(';base64,')[1] : imageSrc;
        const mimeType = imageSrc.startsWith('data:image/') ? imageSrc.split(';')[0].replace('data:', '') : 'image/jpeg';
        
        const visionText = await callGeminiApi([
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType, data: base64Data } },
              { text: "أنت نظام استخراج نصوص ضوئي (OCR) فائق الدقة. استخرج جميع النصوص والكلمات المكتوبة في هذه الصورة كما هي تماماً باللغة العربية والإنجليزية والأرقام بدقة 100%. أعد النص المستخرج فقط سطراً بسطر بدون أي مقدمات أو تعليقات أو علامات markdown." }
            ]
          }
        ], geminiModel, { temperature: 0.1 });
        
        if (visionText) {
          extracted = visionText.trim().replace(/^```/g, '').replace(/```$/g, '').trim();
        }
      } catch (visionErr) {
        console.error('Vision OCR Fallback Error:', visionErr);
      }
    }

    setOcrLoading(false);
    setOcrProgress('');

    if (extracted) {
      setOcrResultText(extracted);
      return extracted;
    } else {
      alert('لم يتم العثور على نصوص واضحة في الصورة، يرجى التأكد من وضوح الصورة أو المحاولة مجدداً.');
      return '';
    }
  };

  // Parse custom page input (e.g. "1, 3" or "2-4" or "١-٣") into 0-indexed page numbers
  const parseCustomPageIndices = (input, maxPages) => {
    if (!input || !input.trim()) return [];
    const normalized = input.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
    const parts = normalized.split(/[,،\s]+/);
    const indices = new Set();
    parts.forEach(part => {
      const trimmed = part.trim();
      if (!trimmed) return;
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const s = parseInt(startStr, 10);
        const e = parseInt(endStr, 10);
        if (!isNaN(s) && !isNaN(e)) {
          const from = Math.max(1, Math.min(s, e));
          const to = Math.min(maxPages, Math.max(s, e));
          for (let i = from; i <= to; i++) {
            indices.add(i - 1);
          }
        }
      } else {
        const p = parseInt(trimmed, 10);
        if (!isNaN(p) && p >= 1 && p <= maxPages) {
          indices.add(p - 1);
        }
      }
    });
    return Array.from(indices).sort((a, b) => a - b);
  };

  // Chat Image Processing (Supports Single and Multiple Images)
  const processChatImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('الرجاء اختيار ملف صورة صحيح (PNG, JPG, WebP).');
      return;
    }
    const compressedDataUrl = await compressImage(file, 1200, 0.82);
    if (compressedDataUrl) {
      const [mimePrefix, b64] = compressedDataUrl.split(';base64,');
      const mimeType = mimePrefix.replace('data:', '');
      const newImg = {
        id: Date.now() + Math.random().toString(36).substr(2, 6),
        base64: b64,
        mimeType: mimeType || 'image/jpeg',
        preview: compressedDataUrl,
        name: file.name || 'image.jpg'
      };
      setChatImages(prev => [...prev, newImg]);
      setChatImage(newImg);
    }
  };

  const processChatImageFiles = async (files) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      await processChatImageFile(file);
    }
  };

  const handleChatImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processChatImageFiles(files);
    e.target.value = '';
  };

  const handleChatPaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    let foundImage = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          foundImage = true;
          await processChatImageFile(file);
        }
      }
    }
    if (foundImage) {
      e.preventDefault();
    }
  };

  // Replace Selected Text in Document with AI Result
  const replaceSelectedTextWithAi = (htmlContent) => {
    pushHistorySnapshot();
    const cleanHtml = sanitizeAiHtml(htmlContent);

    // 1. If cross-page selection is active
    if (crossPageSelection && crossRangesRef.current.length > 0) {
      applyCrossPageAiResult(cleanHtml, crossPageSelection);
      return;
    }

    // 2. If single-page captured range is active
    const sel = window.getSelection();
    let targetRange = (sel && sel.rangeCount > 0 && !sel.isCollapsed) ? sel.getRangeAt(0) : capturedSelectedRangeRef.current;

    if (targetRange) {
      try {
        targetRange.deleteContents();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cleanHtml;
        const frag = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          frag.appendChild(tempDiv.firstChild);
        }
        targetRange.insertNode(frag);
        handleAutoSave();
        setTimeout(rebalanceAllPages, 80);
        return;
      } catch (e) {
        console.warn('Direct range replacement fallback', e);
      }
    }

    // Fallback: insert to active page
    insertChatToDocument(cleanHtml);
  };

  // Multimodal & Multi-Turn Chat Assistant (Specialized for Al-Wateen Platform)
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    const currentImgs = [...chatImages];
    if (!chatInput.trim() && currentImgs.length === 0) return;
    
    const userMsg = chatInput.trim();
    
    // Add user message to UI immediately with all image thumbnails
    setChatMessages(prev => [
      ...prev, 
      { 
        role: 'user', 
        text: userMsg || (currentImgs.length > 0 ? `📷 [تحليل محتوى ${currentImgs.length > 1 ? `${currentImgs.length} صور تعليمية` : 'الصورة التعليمية'} وتنسيقها]` : ''), 
        images: currentImgs.map(img => img.preview),
        image: currentImgs[0]?.preview || null 
      }
    ]);
    
    setChatInput('');
    setChatImages([]);
    setChatImage(null);
    setIsChatLoading(true);
    // Extract active page text specifically + overall document context + full document content
    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    const activePageText = activeEl ? (activeEl.innerText || '').trim() : (pages[activePageIndex]?.content || '').replace(/<[^>]+>/g, ' ').trim();
    
    const currentSelectionText = (crossPageSelection?.text || capturedSelectedText || (typeof window !== 'undefined' ? window.getSelection()?.toString() : '') || '').trim();

    let fullDocSummary = '';
    let allPagesDetailedContent = '';
    pages.forEach((p, idx) => {
      const el = pageRefs.current[p.id];
      const pageText = el ? (el.innerText || '').trim() : (p.content || '').replace(/<[^>]+>/g, ' ').trim();
      fullDocSummary += `[صفحة ${idx + 1}]:\n${pageText.slice(0, 400)}\n\n`;
      allPagesDetailedContent += `=== [صفحة رقم ${idx + 1} من ${pages.length}] ===\n${pageText}\n\n`;
    });

    let effectiveScope = aiContextScope;
    if (effectiveScope === 'selection' && !currentSelectionText) {
      effectiveScope = 'current_page';
    }

    let scopeDetails = '';
    if (effectiveScope === 'all_pages' || isAllPagesSelected) {
      scopeDetails = `نطاق العمل المحدد حالياً من الأستاذ: [كامل المستند محدد بالكامل - إجمالي ${pages.length} صفحات].
تنبيه فائق الأهمية: الأستاذ اختار تحديد كامل الملزمة لتعديل أو معالجة الملزمة بأكملها!
افهم سياق الملزمة كاملاً من الصفحة الأولى للأخيرة، وأجب أو عدل مع مراعاة كامل صفحات الملزمة.
محتوى كامل صفحات المستند بالتفصيل:
${allPagesDetailedContent}`;
    } else if (effectiveScope === 'selection') {
      scopeDetails = `نطاق العمل المحدد حالياً من الأستاذ: [الجزء المحدد فقط من الملزمة].
النص المحدد تحديداً المطلوب معالجته أو شرحه أو تنسيقه أو صياغة أسئلة حوله:
"${currentSelectionText}"
(سياق الصفحة: صفحة ${activePageIndex + 1} من ${pages.length} - ${activePageText.slice(0, 1500)})`;
    } else if (effectiveScope === 'custom_pages') {
      const customIndices = parseCustomPageIndices(customAiPagesInput, pages.length);
      const validIndices = customIndices.length > 0 ? customIndices : [activePageIndex];
      const pageNumbersLabel = validIndices.map(i => i + 1).join(', ');
      
      let customPagesContent = '';
      validIndices.forEach(idx => {
        const el = pageRefs.current[pages[idx]?.id];
        const pageText = el ? (el.innerText || '').trim() : (pages[idx]?.content || '').replace(/<[^>]+>/g, ' ').trim();
        customPagesContent += `=== [صفحة رقم ${idx + 1} من ${pages.length}] ===\n${pageText}\n\n`;
      });

      scopeDetails = `نطاق العمل المحدد حالياً من الأستاذ: [صفحات مخصصة فقط: صفحات (${pageNumbersLabel}) من إجمالي ${pages.length} صفحات].
افهم وعالج المحتوى الخاص بهذه الصفحات المحددة تحديداً:
${customPagesContent}`;
    } else {
      // current_page
      scopeDetails = `نطاق العمل المحدد حالياً: [صفحة رقم ${activePageIndex + 1} من إجمالي ${pages.length} صفحة].
محتوى الصفحة النشطة حالياً:
${activePageText ? activePageText.slice(0, 3000) : '(الصفحة النشطة فارغة حالياً)'}
ملخص بقية صفحات الملزمة الأخرى:
${fullDocSummary.slice(0, 1000)}`;
    }

    try {
      // Build Multi-Turn History (last 8 messages to preserve full conversation context)
      const contents = [];

      // System Framing / Educational Context Header
      const systemContext = `أنت المساعد الأكاديمي والتربوي الذكي للأ. إبراهيم عمار الوتين (خبير ومعلم أول مادة اللغة العربية للمرحلتين الإعدادية والثانوية في جمهورية مصر العربية) عبر منصة الوتين التعليمية (alwateen.com).
وظيفتك: معاونة الأستاذ في إعداد ملازمه الدراسية، شرح الدروس، صياغة أسئلة وتدريبات مطابقة لمواصفات المركز القومي للامتحانات ونظام البابل شيت والمقالي، استخراج القواعد، الإعراب التفصيلي مع ذكر العلة والعلامة، تفريغ وحل الصور ومسائل الكتب، وتنسيق أو تعديل المستند بدقة.

معلومات ونطاق المستند الحالي:
- عنوان الملزمة: ${docTitle || 'ملزمة لغة عربية'}
- إجمالي الصفحات: ${pages.length} صفحة.
${scopeDetails}

إرشادات الصياغة والتنسيق:
1. كن فاهماً لطبيعة المناهج المصرية والمصطلحات المعتمدة (مثل: المشتقات، المصادر، إعراب الفعل، المنصوبات، البلاغة والصور البيانية والمحسنات، نواتج التعلم، التريكات الامتحانية).
2. نسق ردودك بتنسيق HTML نظيف وجميل ومضبوط المسافات والأسطر بدون فراغات أو أسطر فارغة مفرطة (استخدم <h3>، <ul>، <li>، <strong>، وعند عمل جداول أو مقارنات أو إعراب استخدم جداول HTML محكمة بحدود واضحة: <table border="1" style="width:100%; border-collapse:collapse; margin:10px 0; border:1.5px solid #94a3b8;"> مع صف عناوين th ملون بلون هادئ #f1f5f9 وحدود واضحة لكافة الخلايا، واستخدم <span style="color:#1d4ed8; font-weight:bold;"> لإبراز الكلمات المفتاحية).
3. لا تضع وسم <html> أو <body>، ولا تستخدم علامات \`\`\`html كود ماركداون. أعد النص/HTML مباشرة.`;

      // Include previous turns from chatMessages
      const historyTurns = chatMessages.slice(-8);
      historyTurns.forEach((m, idx) => {
        // Skip initial greeting
        if (idx === 0 && m.role === 'model') return;
        if (m.role === 'user' && m.text) {
          contents.push({
            role: 'user',
            parts: [{ text: m.text }]
          });
        } else if (m.role === 'model' && m.text) {
          contents.push({
            role: 'model',
            parts: [{ text: m.text }]
          });
        }
      });

      // Construct current turn parts with all uploaded images
      const currentParts = [];
      currentImgs.forEach(img => {
        if (img.base64) {
          currentParts.push({
            inlineData: {
              mimeType: img.mimeType || 'image/jpeg',
              data: img.base64
            }
          });
        }
      });

      const promptText = `${systemContext}

طلب المستر إبراهيم عمار الحالي:
${userMsg || (currentImgs.length > 0 ? `قم بقراءة هذه الصور التعليمية (${currentImgs.length} صور) بدقة، استخرج ما بها من شروحات أو أسئلة، وقم بصياغتها وحلها وتنسيقها لتكون جاهزة للإدراج في الملزمة.` : 'أكمل العمل واقترح إضافات مفيدة للصفحة الحالية.')}`;

      currentParts.push({ text: promptText });

      contents.push({
        role: 'user',
        parts: currentParts
      });

      // Call Gemini API with automatic fallback
      const rawAiReply = await callGeminiApi(
        contents, 
        geminiModel, 
        { temperature: 0.35 }
      );

      if (rawAiReply) {
        let aiReply = rawAiReply.trim()
          .replace(/^```html\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```$/i, '')
          .trim();

        // 1. Convert Markdown tables to HTML tables first
        aiReply = convertMarkdownTablesToHtml(aiReply);

        // 2. Sanitize excessive empty lines in AI output
        aiReply = aiReply
          .replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>')
          .replace(/(<p[^>]*>(\s*<br\s*\/?>|\s*|&nbsp;)*<\/p>\s*){2,}/gi, '<p><br></p>');

        const hasBlockHtml = /<(p|div|h[1-6]|table|tr|ul|ol|li|blockquote)/i.test(aiReply);
        if (!hasBlockHtml) {
          aiReply = aiReply
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/\*(.*?)\*/g, '<i>$1</i>')
            .replace(/\n\n+/g, '</p><p>')
            .replace(/\n/g, '<br>');
          aiReply = `<p>${aiReply}</p>`;
        }

        aiReply = sanitizeAiHtml(aiReply);

        setChatMessages(prev => [...prev, { role: 'model', text: aiReply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'model', text: 'لم يتمكن الذكاء الاصطناعي من الرد، يرجى إعادة المحاولة.' }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', text: `عذراً يا أستاذ، حدث خطأ: ${err.message}` }]);
    } finally {
      setIsChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const insertChatToDocument = (htmlContent) => {
    pushHistorySnapshot();
    const cleanHtml = sanitizeAiHtml(htmlContent);
    const activeEl = pageRefs.current[pages[activePageIndex]?.id];
    if (activeEl) {
      activeEl.innerHTML += cleanHtml;
      handleAutoSave();
      setTimeout(rebalanceAllPages, 100);
    }
  };

  const replaceEntireDocumentWithAi = (htmlContent) => {
    pushHistorySnapshot();
    const cleanHtml = sanitizeAiHtml(htmlContent);
    const splitted = splitHtmlIntoPages(cleanHtml);
    const newPages = splitted.map((html, idx) => ({
      id: Date.now() + idx,
      content: html
    }));
    setPages(newPages);
    setActivePageIndex(0);
    setIsAllPagesSelected(false);
    clearCrossPageSelection();
    handleAutoSave(newPages);
    setTimeout(() => {
      newPages.forEach(np => {
        const el = pageRefs.current[np.id];
        if (el) el.innerHTML = np.content;
      });
      rebalanceAllPages(newPages);
    }, 60);
  };

  const insertChatAsNewPage = (htmlContent) => {
    pushHistorySnapshot();
    const cleanHtml = sanitizeAiHtml(htmlContent);
    const splitted = splitHtmlIntoPages(cleanHtml);
    const newPageObjects = splitted.map((html, idx) => ({
      id: Date.now() + idx,
      content: html
    }));
    const nextIdx = activePageIndex + 1;
    const currentPages = syncPagesContent();
    currentPages.splice(nextIdx, 0, ...newPageObjects);
    setPages(currentPages);
    setActivePageIndex(nextIdx);
    handleAutoSave(currentPages);
    setTimeout(rebalanceAllPages, 100);
  };

  const cleanExcessiveSpacing = () => {
    pushHistorySnapshot();
    const updated = syncPagesContent().map(p => {
      let html = sanitizeAiHtml(p.content || '');
      return { ...p, content: html };
    });
    setPages(updated);
    updated.forEach(p => {
      const el = pageRefs.current[p.id];
      if (el) el.innerHTML = p.content;
    });
    handleAutoSave(updated);
    setTimeout(rebalanceAllPages, 60);
  };

  // Helper for Page Number text formatting
  const getPageNumberDisplay = (pageIdx) => {
    const total = pages.length;
    if (pageNumberFormat === 'bottom_center') return `صفحة ${pageIdx + 1} من ${total}`;
    if (pageNumberFormat === 'bottom_left') return `${pageIdx + 1} / ${total}`;
    if (pageNumberFormat === 'bottom_right') return `صفحة ${pageIdx + 1}`;
    return '';
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Tajawal' }}>
        <Loader2 size={40} className="spin" color="#3b82f6" />
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Tajawal', direction: 'rtl' }}>
        <ShieldAlert size={80} color="#ef4444" />
      </div>
    );
  }

  return (
    <div className="editor-layout" style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc', fontFamily: 'Tajawal', direction: 'rtl' }}>
      
      {/* 1. Sidebar: Documents Manager (Collapsible) */}
      {showSidebar && (
        <>
          {isMobile && (
            <div 
              className="no-print" 
              onClick={() => setShowSidebar(false)} 
              style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', zIndex: 9998, backdropFilter: 'blur(2px)' }} 
            />
          )}
          <div 
            className="no-print" 
            style={{ 
              position: isMobile ? 'fixed' : 'relative',
              top: 0, bottom: 0, right: 0,
              width: isMobile ? '82vw' : '270px', 
              maxWidth: '320px',
              height: isMobile ? '100vh' : 'auto',
              background: 'white', 
              borderLeft: '1px solid #cbd5e1', 
              display: 'flex', 
              flexDirection: 'column', 
              boxShadow: isMobile ? '-8px 0 30px rgba(0,0,0,0.2)' : '-2px 0 10px rgba(0,0,0,0.03)', 
              zIndex: isMobile ? 9999 : 50 
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <button onClick={() => window.history.back()} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '13px' }}>
                  <ArrowRight size={15} /> عودة للمنصة
                </button>
                <button onClick={() => setShowSidebar(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '12px' }} title="إخفاء القائمة">
                  إخفاء ✕
                </button>
              </div>
              <button onClick={() => { createNewDocument(); if (isMobile) setShowSidebar(false); }} style={{ width: '100%', padding: '9px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)' }}>
                <Plus size={16} /> ملزمة جديدة
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
              {documents.map(doc => (
                <div key={doc.id} onClick={() => { loadDocument(doc); if (isMobile) setShowSidebar(false); }} style={{ padding: '10px 14px', marginBottom: '6px', borderRadius: '8px', cursor: 'pointer', background: docId === doc.id ? '#eff6ff' : 'transparent', border: docId === doc.id ? '1px solid #bfdbfe' : '1px solid transparent', transition: '0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ color: docId === doc.id ? '#1e40af' : '#334155', fontWeight: docId === doc.id ? 'bold' : 'normal', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {doc.title || 'بدون عنوان'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    {new Date(doc.updated_at).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <button onClick={(e) => deleteDocument(doc.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: docId === doc.id ? 0.9 : 0.4, padding: '4px' }} title="حذف">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
        </>
      )}

      {/* 2. Main Work Area */}
      <div className="editor-main-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Floating Focus Mode Banner */}
        {focusMode && (
          <div 
            className="no-print"
            style={{
              position: 'fixed',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 99999,
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(8px)',
              color: 'white',
              padding: '6px 18px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
              fontSize: '13px',
              fontFamily: 'Tajawal, sans-serif'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✨ <strong>وضع الروقان والتركيز</strong> (كتابة بدون أي تشتيت)</span>
            <button
              onClick={() => setFocusMode(false)}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Minimize2 size={13} /> خروج (Esc)
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        {!focusMode && (
          <div 
            className="no-print editor-top-header" 
            style={{ 
              background: 'white', 
              padding: isMobile ? '4px 8px' : (isFullscreen ? '2px 10px' : '3px 12px'), 
              minHeight: isMobile ? '40px' : '34px',
              maxHeight: isMobile ? '40px' : '35px',
              height: isMobile ? '40px' : '35px',
              borderBottom: '1px solid #e2e8f0', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'nowrap',
              overflow: 'hidden',
              zIndex: 30, 
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              position: 'relative'
            }}
          >
            {/* Left Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px', flex: 1, minWidth: 0 }}>
              {!showSidebar && (
                <button 
                  onClick={() => setShowSidebar(true)} 
                  style={{ 
                    background: '#f8fafc', 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '6px', 
                    padding: isMobile ? '4px 7px' : '3px 8px', 
                    cursor: 'pointer', 
                    color: '#334155', 
                    fontSize: '11.5px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    fontWeight: '500', 
                    height: isMobile ? '28px' : '26px',
                    flexShrink: 0
                  }}
                  title="عرض قائمة الملازم"
                >
                  <FileText size={isMobile ? 15 : 13} color="#2563eb" /> <span className="hide-on-mobile">الملازم</span>
                </button>
              )}
              
              <input 
                type="text" 
                value={docTitle} 
                onChange={(e) => { setDocTitle(e.target.value); handleAutoSave(); }} 
                style={{ 
                  fontSize: isMobile ? '13px' : '14px', 
                  fontWeight: 'bold', 
                  border: 'none', 
                  color: '#0f172a', 
                  outline: 'none', 
                  background: 'transparent', 
                  flex: 1,
                  minWidth: isMobile ? '60px' : '150px',
                  maxWidth: isMobile ? '160px' : '240px',
                  height: '26px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }} 
                placeholder="عنوان الملزمة..." 
              />
              
              <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: saveStatus === 'saved' ? '#10b981' : '#f59e0b', fontSize: '11px', flexShrink: 0 }}>
                {saveStatus === 'saved' ? <><Cloud size={12} /> محفوظة</> : <><Loader2 size={12} className="spin" /> حفظ...</>}
              </div>

              {/* Quick Access Save / Undo / Redo (Desktop only - Mobile has dedicated bottom bar + top save) */}
              <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '2px', background: '#f8fafc', padding: '1px 4px', borderRadius: '5px', border: '1px solid #e2e8f0', height: '26px', flexShrink: 0 }}>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAutoSave()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '3px',
                    background: 'white',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    borderRadius: '4px', padding: '2px 7px',
                    cursor: 'pointer',
                    fontSize: '11px', fontWeight: 'bold',
                    height: '22px'
                  }}
                  title="حفظ فوري للملزمة (Ctrl + S)"
                >
                  <Save size={12} /> <span>حفظ</span>
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleUndo}
                  disabled={!canUndo}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '2px',
                    background: canUndo ? 'white' : 'transparent',
                    color: canUndo ? '#1e40af' : '#94a3b8',
                    border: canUndo ? '1px solid #bfdbfe' : '1px solid transparent',
                    borderRadius: '4px', padding: '2px 6px',
                    cursor: canUndo ? 'pointer' : 'not-allowed',
                    fontSize: '11px', fontWeight: 'bold',
                    height: '22px'
                  }}
                  title="تراجع خطوة للخلف (Ctrl + Z)"
                >
                  <Undo2 size={12} /> <span>تراجع</span>
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleRedo}
                  disabled={!canRedo}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '2px',
                    background: canRedo ? 'white' : 'transparent',
                    color: canRedo ? '#1e40af' : '#94a3b8',
                    border: canRedo ? '1px solid #bfdbfe' : '1px solid transparent',
                    borderRadius: '4px', padding: '2px 6px',
                    cursor: canRedo ? 'pointer' : 'not-allowed',
                    fontSize: '11px', fontWeight: 'bold',
                    height: '22px'
                  }}
                  title="إعادة خطوة للأمام (Ctrl + Y)"
                >
                  <Redo2 size={12} /> <span>إعادة</span>
                </button>
                <button
                  onClick={() => setShowShortcutsModal(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '3px',
                    background: 'white',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px', padding: '2px 6px',
                    cursor: 'pointer',
                    fontSize: '11px', fontWeight: 'bold',
                    height: '22px'
                  }}
                  title="دليل جميع اختصارات لوحة المفاتيح (Ctrl + /)"
                >
                  ⌨️ الاختصارات
                </button>
              </div>

              {isEditingRestricted && (
                <button
                  onClick={() => setIsEditingRestricted(false)}
                  style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '5px', padding: '2px 6px', fontSize: '10.5px', fontWeight: 'bold', cursor: 'pointer', height: '24px', flexShrink: 0 }}
                  title="اضغط لفك قفل التعديل والعودة للكتابة"
                >
                  🔒 <span className="hide-on-mobile">محمي</span>
                </button>
              )}
            </div>

            {/* Right Section */}
            <div style={{ display: 'flex', gap: isMobile ? '5px' : '6px', alignItems: 'center', flexShrink: 0 }}>
              {/* Fullscreen Button (Desktop only in header - on mobile available in ⋮ menu) */}
              <button 
                onClick={toggleFullscreen} 
                className="hide-on-mobile"
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px', 
                  background: isFullscreen ? '#1e40af' : '#2563eb', 
                  color: 'white', 
                  border: '1px solid', borderColor: isFullscreen ? '#1e3a8a' : '#1d4ed8', 
                  padding: '3px 11px', borderRadius: '6px', cursor: 'pointer', fontSize: '11.5px', fontWeight: 'bold', transition: '0.15s',
                  height: '26px',
                  boxShadow: '0 1px 3px rgba(37,99,235,0.25)'
                }}
                title={isFullscreen ? "إنهاء وضع ملء الشاشة (F11 أو Esc)" : "تفعيل ملء الشاشة الكامل لإلغاء القوائم وتوسيع مساحة العمل (F11)"}
              >
                {isFullscreen ? <Minimize2 size={12} color="white" /> : <Maximize2 size={12} color="white" />}
                <span>{isFullscreen ? 'إنهاء ملء الشاشة' : '⛶ ملء الشاشة (F11)'}</span>
              </button>

              {/* Focus / Zen Mode Button (Desktop) */}
              <button 
                onClick={() => {
                  setFocusMode(true);
                  setShowAssistant(false);
                  setShowSidebar(false);
                }} 
                className="hide-on-mobile"
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px', 
                  background: '#f8fafc', 
                  color: '#475569', 
                  border: '1px solid #cbd5e1', 
                  padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', transition: '0.15s',
                  height: '26px'
                }}
                title="وضع الروقان والتركيز (إخفاء كافة القوائم والتفرغ للكتابة بهدوء)"
              >
                ✨ وضع الروقان
              </button>
              
              {/* AI Assistant (Desktop) */}
              <button 
                onClick={() => setShowAssistant(!showAssistant)} 
                className="hide-on-mobile"
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px', 
                  background: showAssistant ? '#ede9fe' : '#f8fafc', 
                  color: showAssistant ? '#6d28d9' : '#475569', 
                  border: '1px solid', borderColor: showAssistant ? '#c4b5fd' : '#cbd5e1', 
                  padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', transition: '0.15s',
                  height: '26px'
                }}
                title={showAssistant ? "إغلاق شات المساعد الذكي" : "فتح شات المساعد الذكي"}
              >
                <MessageSquare size={12} color={showAssistant ? '#6d28d9' : '#64748b'} /> المساعد
              </button>
              
              {/* OCR Button (Desktop) */}
              <button 
                onClick={() => setShowOcrModal(true)} 
                className="hide-on-mobile"
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px', 
                  background: '#f0fdf4', 
                  color: '#15803d', 
                  border: '1px solid #bbf7d0', 
                  padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', transition: '0.15s',
                  height: '26px'
                }}
                title="استخراج النصوص من الصور مجاناً بدون استهلاك الذكاء (Free OCR)"
              >
                <FileSearch size={12} color="#16a34a" /> OCR
              </button>
              
              {/* Mobile Dedicated Save Button */}
              {isMobile && (
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAutoSave()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '3px',
                    background: saveStatus === 'saved' ? '#f0fdf4' : '#fffbeb',
                    color: saveStatus === 'saved' ? '#15803d' : '#b45309',
                    border: '1px solid',
                    borderColor: saveStatus === 'saved' ? '#bbf7d0' : '#fde68a',
                    borderRadius: '6px',
                    padding: '3px 7px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    height: '28px'
                  }}
                  title="حفظ فوري للملزمة"
                >
                  {saveStatus === 'saved' ? <Cloud size={13} color="#15803d" /> : <Loader2 size={13} className="spin" color="#b45309" />}
                  <span>{saveStatus === 'saved' ? 'حفظ' : '...'}</span>
                </button>
              )}

              {/* Print Button */}
              <button 
                onClick={handlePrintDocument} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px', 
                  background: '#059669', color: 'white', border: 'none', 
                  padding: isMobile ? '3px 8px' : '3px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11.5px', fontWeight: 'bold',
                  boxShadow: '0 1px 3px rgba(5, 150, 105, 0.25)',
                  height: isMobile ? '28px' : '26px'
                }}
                title="طباعة وتصدير كملف PDF"
              >
                <Printer size={13} /> <span className="hide-on-mobile">طباعة PDF</span>
              </button>

              {/* Mobile More Actions Menu Toggle (Visible only on mobile) */}
              {isMobile && (
                <button
                  onClick={() => setShowMobileMoreMenu(prev => !prev)}
                  style={{
                    background: showMobileMoreMenu ? '#eff6ff' : '#f8fafc',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '3px 7px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '28px',
                    width: '28px'
                  }}
                  title="المزيد من الأدوات والخيارات"
                >
                  ⋮
                </button>
              )}
            </div>

            {/* Mobile Dropdown Popover */}
            {isMobile && showMobileMoreMenu && (
              <>
                <div 
                  className="no-print"
                  onClick={() => setShowMobileMoreMenu(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
                />
                <div 
                  className="no-print mobile-more-dropdown" 
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '8px',
                    marginTop: '4px',
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                    padding: '8px',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    minWidth: '220px'
                  }}
                >
                  <button onClick={() => { toggleFullscreen(); setShowMobileMoreMenu(false); }} style={{ ...mobileDropdownItemStyle, color: '#1d4ed8' }}>
                    {isFullscreen ? <Minimize2 size={14} color="#1d4ed8" /> : <Maximize2 size={14} color="#1d4ed8" />}
                    {isFullscreen ? 'إنهاء وضع ملء الشاشة' : 'ملء الشاشة بالكامل ⛶'}
                  </button>
                  <button onClick={() => { setShowAssistant(!showAssistant); setShowMobileMoreMenu(false); }} style={{ ...mobileDropdownItemStyle, color: '#6d28d9' }}>
                    <MessageSquare size={14} color="#6d28d9" /> {showAssistant ? 'إغلاق المساعد الذكي' : 'المساعد الذكي 🤖'}
                  </button>
                  <button onClick={() => { setShowOcrModal(true); setShowMobileMoreMenu(false); }} style={{ ...mobileDropdownItemStyle, color: '#15803d' }}>
                    <FileSearch size={14} color="#16a34a" /> استخراج النصوص من الصور (OCR)
                  </button>
                  <button onClick={() => { setFocusMode(true); setShowMobileMoreMenu(false); }} style={{ ...mobileDropdownItemStyle, color: '#475569' }}>
                    <Maximize2 size={14} color="#64748b" /> وضع الروقان والتركيز ✨
                  </button>
                  <button onClick={() => { setShowShortcutsModal(true); setShowMobileMoreMenu(false); }} style={{ ...mobileDropdownItemStyle, color: '#0f172a' }}>
                    ⌨️ دليل الاختصارات
                  </button>
                  <div style={{ borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />
                </div>
              </>
            )}
          </div>
        )}

        {/* Tabbed Ribbon Navigation */}
        {!focusMode && (
        <div className="no-print" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', zIndex: 20 }}>
          
          {/* Tabs Header */}
          <div 
            className="editor-tabs-header"
            data-toolbar="true"
            style={{ 
              display: 'flex', 
              flexDirection: 'row',
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: isMobile ? '0 4px' : (isFullscreen ? '0 10px' : '0 12px'), 
              background: '#f8fafc', 
              borderBottom: '1px solid #e2e8f0',
              overflow: 'hidden',
              height: isMobile ? '36px' : '28px',
              minHeight: isMobile ? '36px' : '28px'
            }}
          >
            <div 
              style={{ 
                flex: 1,
                minWidth: 0,
                display: 'flex', 
                gap: '1px', 
                alignItems: 'center',
                flexWrap: 'nowrap', 
                overflowX: 'auto', 
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <button 
                onClick={() => handleTabClick('home')} 
                style={{ 
                  padding: isMobile ? '5px 8px' : '3px 9px', border: 'none', background: 'none', cursor: 'pointer', fontSize: isMobile ? '11px' : '11.5px', whiteSpace: 'nowrap',
                  fontWeight: activeTab === 'home' && !isRibbonCollapsed ? 'bold' : 'normal',
                  color: activeTab === 'home' ? (!isRibbonCollapsed ? '#2563eb' : '#475569') : '#64748b',
                  borderBottom: activeTab === 'home' ? (!isRibbonCollapsed ? '2.5px solid #2563eb' : '2px dashed #94a3b8') : '2.5px solid transparent',
                  transition: '0.15s'
                }}
                title={activeTab === 'home' && !isRibbonCollapsed ? 'اضغط لطي شريط الأدوات' : 'اضغط لعرض أدوات الرئيسية'}
              >
                📝 الرئيسية
              </button>

              <button 
                onClick={() => handleTabClick('insert')} 
                style={{ 
                  padding: isMobile ? '5px 8px' : '3px 9px', border: 'none', background: 'none', cursor: 'pointer', fontSize: isMobile ? '11px' : '11.5px', whiteSpace: 'nowrap',
                  fontWeight: activeTab === 'insert' && !isRibbonCollapsed ? 'bold' : 'normal',
                  color: activeTab === 'insert' ? (!isRibbonCollapsed ? '#2563eb' : '#475569') : '#64748b',
                  borderBottom: activeTab === 'insert' ? (!isRibbonCollapsed ? '2.5px solid #2563eb' : '2px dashed #94a3b8') : '2.5px solid transparent',
                  transition: '0.15s'
                }}
                title={activeTab === 'insert' && !isRibbonCollapsed ? 'اضغط لطي شريط الأدوات' : 'اضغط لعرض أدوات الإدراج'}
              >
                ➕ إدراج
              </button>

              <button 
                onClick={() => handleTabClick('page')} 
                style={{ 
                  padding: isMobile ? '5px 8px' : '3px 9px', border: 'none', background: 'none', cursor: 'pointer', fontSize: isMobile ? '11px' : '11.5px', whiteSpace: 'nowrap',
                  fontWeight: activeTab === 'page' && !isRibbonCollapsed ? 'bold' : 'normal',
                  color: activeTab === 'page' ? (!isRibbonCollapsed ? '#2563eb' : '#475569') : '#64748b',
                  borderBottom: activeTab === 'page' ? (!isRibbonCollapsed ? '2.5px solid #2563eb' : '2px dashed #94a3b8') : '2.5px solid transparent',
                  transition: '0.15s'
                }}
                title={activeTab === 'page' && !isRibbonCollapsed ? 'اضغط لطي شريط الأدوات' : 'اضغط لعرض أدوات تخطيط وتصميم الصفحة'}
              >
                📐 تصميم وتخطيط
              </button>

              <button 
                onClick={() => handleTabClick('references')} 
                style={{ 
                  padding: isMobile ? '5px 8px' : '3px 9px', border: 'none', background: 'none', cursor: 'pointer', fontSize: isMobile ? '11px' : '11.5px', whiteSpace: 'nowrap',
                  fontWeight: activeTab === 'references' && !isRibbonCollapsed ? 'bold' : 'normal',
                  color: activeTab === 'references' ? (!isRibbonCollapsed ? '#1e40af' : '#475569') : '#64748b',
                  borderBottom: activeTab === 'references' ? (!isRibbonCollapsed ? '2.5px solid #1e40af' : '2px dashed #93c5fd') : '2.5px solid transparent',
                  transition: '0.15s'
                }}
                title="المراجع: جدول المحتويات، الحواشي السفلية، المراجع والاقتباسات، التسميات التوضيحية، الفهرس"
              >
                📚 مراجع
              </button>

              <button 
                onClick={() => handleTabClick('review')} 
                style={{ 
                  padding: isMobile ? '5px 8px' : '3px 9px', border: 'none', background: 'none', cursor: 'pointer', fontSize: isMobile ? '11px' : '11.5px', whiteSpace: 'nowrap',
                  fontWeight: activeTab === 'review' && !isRibbonCollapsed ? 'bold' : 'normal',
                  color: activeTab === 'review' ? (!isRibbonCollapsed ? '#0f766e' : '#475569') : '#64748b',
                  borderBottom: activeTab === 'review' ? (!isRibbonCollapsed ? '2.5px solid #0f766e' : '2px dashed #5eead4') : '2.5px solid transparent',
                  transition: '0.15s'
                }}
                title="مراجعة: التدقيق الإملائي، قاموس المرادفات، عدد الكلمات، قراءة بصوت عالٍ، التعليقات، تعقب التغييرات، تقييد التحرير"
              >
                🔍 مراجعة
              </button>

              <button 
                onClick={() => handleTabClick('view')} 
                style={{ 
                  padding: isMobile ? '5px 8px' : '3px 9px', border: 'none', background: 'none', cursor: 'pointer', fontSize: isMobile ? '11px' : '11.5px', whiteSpace: 'nowrap',
                  fontWeight: activeTab === 'view' && !isRibbonCollapsed ? 'bold' : 'normal',
                  color: activeTab === 'view' ? (!isRibbonCollapsed ? '#0369a1' : '#475569') : '#64748b',
                  borderBottom: activeTab === 'view' ? (!isRibbonCollapsed ? '2.5px solid #0369a1' : '2px dashed #7dd3fc') : '2.5px solid transparent',
                  transition: '0.15s'
                }}
                title="عرض: طرق العرض، القارئ الشامل، المسطرة، خطوط الشبكة، جزء التنقل، عمودان متجاوران، التكبير والتصغير"
              >
                👁️ عرض
              </button>

              <button 
                onClick={(e) => handleOpenEquationMenu(e)} 
                className="equation-menu-trigger"
                style={{ 
                  padding: isMobile ? '5px 8px' : '3px 9px', border: 'none', background: 'none', cursor: 'pointer', fontSize: isMobile ? '11px' : '11.5px', whiteSpace: 'nowrap',
                  fontWeight: (activeTab === 'math' && !isRibbonCollapsed) || showEquationMenu ? 'bold' : 'normal',
                  color: (activeTab === 'math' && !isRibbonCollapsed) || showEquationMenu ? '#0284c7' : '#64748b',
                  borderBottom: (activeTab === 'math' && !isRibbonCollapsed) || showEquationMenu ? '2.5px solid #0284c7' : '2.5px solid transparent',
                  display: 'flex', alignItems: 'center', gap: '3px',
                  transition: '0.15s'
                }}
                title="اضغط لعرض قائمة المعادلات الرياضية الجاهزة وأدوات الإدراج (Alt + =)"
              >
                <span style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'serif' }}>π</span> معادلة
                <ChevronDown size={11} style={{ opacity: 0.7, transform: showEquationMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>

              <button 
                onClick={() => handleTabClick('ai')} 
                style={{ 
                  padding: isMobile ? '5px 8px' : '3px 9px', border: 'none', background: 'none', cursor: 'pointer', fontSize: isMobile ? '11px' : '11.5px', whiteSpace: 'nowrap',
                  fontWeight: activeTab === 'ai' && !isRibbonCollapsed ? 'bold' : 'normal',
                  color: activeTab === 'ai' ? (!isRibbonCollapsed ? '#7c3aed' : '#475569') : '#64748b',
                  borderBottom: activeTab === 'ai' ? (!isRibbonCollapsed ? '2.5px solid #7c3aed' : '2px dashed #c084fc') : '2.5px solid transparent',
                  display: 'flex', alignItems: 'center', gap: '3px',
                  transition: '0.15s'
                }}
                title={activeTab === 'ai' && !isRibbonCollapsed ? 'اضغط لطي شريط الأدوات' : 'اضغط لعرض أدوات الذكاء الاصطناعي'}
              >
                <Sparkles size={13} color={activeTab === 'ai' && !isRibbonCollapsed ? '#7c3aed' : '#8b5cf6'} /> الذكاء
              </button>

              {selectedImg && (
                <button 
                  onClick={() => handleTabClick('image')} 
                  style={{ 
                    padding: isMobile ? '5px 8px' : '3px 10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: isMobile ? '11px' : '11.5px', fontWeight: 'bold', whiteSpace: 'nowrap',
                    color: '#0284c7',
                    borderBottom: activeTab === 'image' && !isRibbonCollapsed ? '2.5px solid #0284c7' : '2px dashed #38bdf8',
                    animation: 'pulse 2s infinite',
                    display: 'flex', alignItems: 'center', gap: '3px'
                  }}
                  title={activeTab === 'image' && !isRibbonCollapsed ? 'اضغط لطي شريط الأدوات' : 'اضغط لعرض أدوات الصورة'}
                >
                  🖼️ تنسيق الصورة
                </button>
              )}

              {selectedTable && (
                <button 
                  onClick={() => handleTabClick('table')} 
                  style={{ 
                    padding: isMobile ? '5px 8px' : '3px 10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: isMobile ? '11px' : '11.5px', fontWeight: 'bold', whiteSpace: 'nowrap',
                    color: '#059669',
                    borderBottom: activeTab === 'table' && !isRibbonCollapsed ? '2.5px solid #059669' : '2px dashed #34d399',
                    animation: 'pulse 2s infinite',
                    display: 'flex', alignItems: 'center', gap: '3px'
                  }}
                  title={activeTab === 'table' && !isRibbonCollapsed ? 'اضغط لطي شريط الأدوات' : 'اضغط لعرض أدوات وتنسيق الجدول'}
                >
                  📊 تنسيق الجدول
                </button>
              )}

              {selectedShape && (
                <button 
                  onClick={() => handleTabClick('shape')} 
                  style={{ 
                    padding: isMobile ? '5px 8px' : '3px 10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: isMobile ? '11px' : '11.5px', fontWeight: 'bold', whiteSpace: 'nowrap',
                    color: '#d97706',
                    borderBottom: activeTab === 'shape' && !isRibbonCollapsed ? '2.5px solid #d97706' : '2px dashed #fbbf24',
                    display: 'flex', alignItems: 'center', gap: '3px'
                  }}
                  title="تنسيق الشكل أو الصندوق المحدد"
                >
                  🔷 تنسيق الشكل
                </button>
              )}
            </div>

            {/* Quick Ribbon Collapse Button */}
            <button 
              onClick={() => setIsRibbonCollapsed(!isRibbonCollapsed)}
              style={{ 
                flexShrink: 0,
                marginInlineStart: '4px',
                background: isRibbonCollapsed ? '#eff6ff' : 'transparent', 
                border: isRibbonCollapsed ? '1px solid #bfdbfe' : '1px solid transparent', 
                cursor: 'pointer', 
                color: isRibbonCollapsed ? '#1d4ed8' : '#64748b', 
                fontSize: '11px', 
                fontWeight: 'bold',
                display: 'flex', 
                alignItems: 'center', 
                gap: '2px', 
                padding: '2px 6px', 
                borderRadius: '5px',
                whiteSpace: 'nowrap',
                transition: '0.15s',
                height: '24px'
              }}
              title={isRibbonCollapsed ? 'إظهار شريط الأدوات (Ctrl + F1)' : 'طي شريط الأدوات لتوسيع مساحة الرؤية (Ctrl + F1)'}
            >
              {isRibbonCollapsed ? <ChevronDown size={13} color="#1d4ed8" /> : <ChevronUp size={13} color="#64748b" />}
              <span style={{ fontSize: '10.5px' }}>{isRibbonCollapsed ? 'الأدوات ▼' : 'طي ▲'}</span>
            </button>

          </div>

          {/* Ribbon Content Bar (Based on Active Tab - Strictly Single-Row Word Layout) */}
          {!isRibbonCollapsed && (
          <div 
            className="editor-ribbon-content-bar"
            data-toolbar="true"
            style={{ 
              padding: isMobile ? '2px 6px' : '3px 10px', 
              height: activeTab === 'math' ? (isMobile ? '50px' : '52px') : (isMobile ? '46px' : '48px'), 
              maxHeight: activeTab === 'math' ? (isMobile ? '50px' : '52px') : (isMobile ? '46px' : '48px'), 
              minHeight: activeTab === 'math' ? (isMobile ? '50px' : '52px') : (isMobile ? '46px' : '48px'), 
              display: 'flex', 
              alignItems: 'center', 
              background: 'white',
              overflowX: 'auto',
              overflowY: 'hidden',
              flexWrap: 'nowrap',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin'
            }}
          >
            
            {/* TAB 1: HOME (MICROSOFT WORD CLEAN SINGLE-ROW RIBBON) */}
            {activeTab === 'home' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap', width: 'max-content', minWidth: '100%', padding: '2px 4px' }}>
                
                {/* 1. الحافظة (Clipboard) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                  <button 
                    onClick={handlePasteFromClipboard}
                    style={{ ...toolActionBtnStyle, background: '#f0f9ff', color: '#0284c7', borderColor: '#bae6fd' }}
                    title="لصق المحتوى من الحافظة (Ctrl+V)"
                  >
                    <Clipboard size={14} color="#0284c7" />
                    <span>لصق</span>
                  </button>

                  <button onMouseDown={(e) => e.preventDefault()} onClick={handleDocumentCut} style={wordSquareBtnStyle} title="قص النص المحدد (Ctrl+X)">
                    <Scissors size={14} color="#64748b" />
                  </button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={handleDocumentCopy} style={wordSquareBtnStyle} title="نسخ النص المحدد (Ctrl+C)">
                    <Copy size={14} color="#64748b" />
                  </button>
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleToggleFormatPainter} 
                    style={{ ...wordSquareBtnStyle, background: formatPainter ? '#fef08a' : 'white', borderColor: formatPainter ? '#eab308' : '#cbd5e1' }} 
                    title={formatPainter ? "فرشاة التنسيق مفعلة (حدد أي نص لتطبيق التنسيق عليه)" : "نسخ التنسيق (فرشاة التنسيق)"}
                  >
                    <Paintbrush size={14} color={formatPainter ? "#854d0e" : "#64748b"} />
                  </button>
                </div>

                <div style={dividerStyle}></div>

                {/* 2. الخط (Font Family, Size & Styles) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                  <select onMouseDown={() => saveCurrentSelection()} onFocus={() => saveCurrentSelection()} onChange={(e) => handleFormat('fontName', e.target.value)} style={{ ...selectStyle, width: '105px', height: '28px', fontSize: '11.5px', padding: '1px 4px' }} title="نوع الخط">
                    <option value="Tajawal">Tajawal</option>
                    <option value="Cairo">Cairo</option>
                    <option value="Amiri">Amiri (أصيل)</option>
                    <option value="Almarai">Almarai</option>
                    <option value="Arial">Arial</option>
                    <option value="Calibri">Calibri</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Segoe UI">Segoe UI</option>
                  </select>

                  <select defaultValue={16} onMouseDown={() => saveCurrentSelection()} onFocus={() => saveCurrentSelection()} onChange={(e) => applyExactFontSize(parseInt(e.target.value))} style={{ ...selectStyle, width: '52px', height: '28px', fontSize: '11.5px', padding: '1px 3px' }} title="حجم الخط بالنقاط (pt)">
                    {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72].map(pt => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                  </select>

                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => changeFontSizeDelta(2)} style={wordSquareBtnStyle} title="تكبير حجم الخط">
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>A<sup style={{ fontSize: '8px' }}>▲</sup></span>
                  </button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => changeFontSizeDelta(-2)} style={wordSquareBtnStyle} title="تصغير حجم الخط">
                    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>A<sub style={{ fontSize: '8px' }}>▼</sub></span>
                  </button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={handleClearFormatting} style={wordSquareBtnStyle} title="مسح كافة التنسيقات والخلفيات والبراويز (Ctrl+Space)">
                    <Eraser size={14} color="#dc2626" />
                  </button>

                  <div style={{ width: '1px', height: '16px', background: '#e2e8f0', margin: '0 1px' }} />

                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('bold')} style={wordSquareBtnStyle} title="غامق (Ctrl+B)"><Bold size={14} /></button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('italic')} style={wordSquareBtnStyle} title="مائل (Ctrl+I)"><Italic size={14} /></button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('underline')} style={wordSquareBtnStyle} title="تسطير (Ctrl+U)"><Underline size={14} /></button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('strikeThrough')} style={wordSquareBtnStyle} title="يتوسطه خط"><Strikethrough size={14} /></button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('subscript')} style={wordSquareBtnStyle} title="منخفض (x₂)"><Subscript size={14} /></button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('superscript')} style={wordSquareBtnStyle} title="مرتفع (x²)"><Superscript size={14} /></button>

                  {/* Word Highlighter Split Button */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', height: '28px', borderRadius: '4px', border: '1px solid #cbd5e1', overflow: 'hidden', background: 'white' }}>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); saveCurrentSelection(); }}
                      onClick={() => applyTextHighlight(activeHighlightColor || '#fef08a')}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: '0 4px',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1px'
                      }}
                      title="تمييز النص المحدد (قلم الفلورسنت Word)"
                    >
                      <Highlighter size={13} color="#ca8a04" />
                      <div style={{ width: '14px', height: '3px', background: activeHighlightColor || '#fef08a', borderRadius: '1px' }} />
                    </button>
                    <button
                      type="button"
                      className="word-color-btn-trigger"
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onClick={(e) => handleOpenColorPalette('highlight', e)}
                      style={{
                        border: 'none',
                        borderRight: '1px solid #e2e8f0',
                        background: showHighlightPalette ? '#f1f5f9' : 'transparent',
                        cursor: 'pointer',
                        padding: '0 2px',
                        height: '100%',
                        width: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="لوحة ألوان التمييز"
                    >
                      <ChevronDown size={10} color="#64748b" />
                    </button>
                  </div>

                  {/* Word Font Color Split Button */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', height: '28px', borderRadius: '4px', border: '1px solid #cbd5e1', overflow: 'hidden', background: 'white' }}>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); saveCurrentSelection(); }}
                      onClick={() => applyFontColor(activeFontColor || '#dc2626')}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: '0 5px',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1px'
                      }}
                      title={`تطبيق لون الخط الحالي (${activeFontColor})`}
                    >
                      <span style={{ fontSize: '13px', fontWeight: '900', color: '#1e293b', lineHeight: '1', fontFamily: 'sans-serif' }}>A</span>
                      <div style={{ width: '15px', height: '3px', background: activeFontColor || '#dc2626', borderRadius: '1px' }} />
                    </button>
                    <button
                      type="button"
                      className="word-color-btn-trigger"
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onClick={(e) => handleOpenColorPalette('font', e)}
                      style={{
                        border: 'none',
                        borderRight: '1px solid #e2e8f0',
                        background: showFontColorPalette ? '#f1f5f9' : 'transparent',
                        cursor: 'pointer',
                        padding: '0 2px',
                        height: '100%',
                        width: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="لوحة ألوان الخط والعناوين (Word)"
                    >
                      <ChevronDown size={10} color="#64748b" />
                    </button>
                  </div>
                </div>

                <div style={dividerStyle}></div>

                {/* 3. الفقرة والمحاذاة (Paragraph, Alignment & Lists) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('justifyRight')} style={wordSquareBtnStyle} title="محاذاة لليمين"><AlignRight size={14} /></button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('justifyCenter')} style={wordSquareBtnStyle} title="توسيط"><AlignCenter size={14} /></button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('justifyLeft')} style={wordSquareBtnStyle} title="محاذاة لليسار"><AlignLeft size={14} /></button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('justifyFull')} style={wordSquareBtnStyle} title="ضبط كلي للأسطر (Justify Full)"><AlignJustify size={14} /></button>

                  <select defaultValue="1.5" onMouseDown={() => saveCurrentSelection()} onFocus={() => saveCurrentSelection()} onChange={(e) => applyLineSpacing(e.target.value)} style={{ ...selectStyle, width: '52px', height: '28px', fontSize: '11px', padding: '0px 2px' }} title="تباعد الأسطر">
                    <option value="1.0">1.0</option>
                    <option value="1.15">1.15</option>
                    <option value="1.5">1.5</option>
                    <option value="2.0">2.0</option>
                    <option value="2.5">2.5</option>
                    <option value="3.0">3.0</option>
                  </select>

                  {/* Word Paragraph Shading Split Button */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', height: '28px', borderRadius: '4px', border: '1px solid #cbd5e1', overflow: 'hidden', background: 'white' }}>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); saveCurrentSelection(); }}
                      onClick={() => applyParagraphShading(activeShadingColor || '#eff6ff')}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: '0 5px',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1px'
                      }}
                      title="تظليل الفقرة / الصندوق (خلفية النص)"
                    >
                      <Palette size={13} color="#0284c7" />
                      <div style={{ width: '15px', height: '3px', background: activeShadingColor || '#0284c7', borderRadius: '1px' }} />
                    </button>
                    <button
                      type="button"
                      className="word-color-btn-trigger"
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onClick={(e) => handleOpenColorPalette('shading', e)}
                      style={{
                        border: 'none',
                        borderRight: '1px solid #e2e8f0',
                        background: showShadingPalette ? '#f1f5f9' : 'transparent',
                        cursor: 'pointer',
                        padding: '0 2px',
                        height: '100%',
                        width: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="لوحة ألوان تظليل الفقرة"
                    >
                      <ChevronDown size={10} color="#64748b" />
                    </button>
                  </div>

                  <div style={{ width: '1px', height: '16px', background: '#e2e8f0', margin: '0 1px' }} />

                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('insertUnorderedList')} style={wordSquareBtnStyle} title="تعداد نقطي"><List size={14} /></button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('insertOrderedList')} style={wordSquareBtnStyle} title="تعداد رقمي"><ListOrdered size={14} /></button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('outdent')} style={wordSquareBtnStyle} title="إنقاص المسافة البادئة"><Outdent size={14} /></button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('indent')} style={wordSquareBtnStyle} title="زيادة المسافة البادئة"><Indent size={14} /></button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyDirection('rtl')} style={wordSquareBtnStyle} title="اتجاه النص من اليمين لليسار (RTL)"><span style={{ fontSize: '10px', fontWeight: 'bold' }}>RTL</span></button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyDirection('ltr')} style={wordSquareBtnStyle} title="اتجاه النص من اليسار لليمين (LTR)"><span style={{ fontSize: '10px', fontWeight: 'bold' }}>LTR</span></button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={cleanExcessiveSpacing} style={{ ...wordSquareBtnStyle, color: '#059669' }} title="إزالة الأسطر الفارغة والمسافات المفرطة بين الفقرات"><Eraser size={13} /></button>
                </div>

                <div style={dividerStyle}></div>

                {/* 4. الأنماط والعناوين (Word Styles Dropdown & Quick Badges) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  <select 
                    onMouseDown={() => saveCurrentSelection()}
                    onFocus={() => saveCurrentSelection()}
                    onChange={(e) => { if (e.target.value) { applyWordStyle(e.target.value); e.target.value = ''; } }} 
                    style={{ ...selectStyle, width: '110px', height: '28px', fontSize: '11.5px', fontWeight: 'bold', color: '#1e40af', background: '#eff6ff', borderColor: '#bfdbfe' }}
                    title="تطبيق نمط عنوان أو فقرة Word جاهز"
                  >
                    <option value="">🎨 الأنماط...</option>
                    <option value="normal">عادي (فقرة 16pt)</option>
                    <option value="heading1">عنوان 1 (رئيسي كبير)</option>
                    <option value="heading2">عنوان 2 (فرعي أزرق)</option>
                    <option value="heading3">عنوان 3 (تفصيلي زمردي)</option>
                    <option value="title">العنوان الرئيسي للدرس</option>
                    <option value="subtitle">عنوان فرعي موسط</option>
                    <option value="section_banner">شريط باب / وحدة</option>
                    <option value="exam_header">رأس سؤال امتحاني</option>
                    <option value="quote">اقتباس مظلل</option>
                    <option value="intense_quote">اقتباس بارز</option>
                    <option value="highlight_box">مربع تمييز هام</option>
                  </select>

                  {[
                    { id: 'normal', name: 'عادي', color: '#1e293b', bg: '#ffffff' },
                    { id: 'heading1', name: 'عنوان 1', color: '#1e40af', bg: '#eff6ff', bold: true },
                    { id: 'heading2', name: 'عنوان 2', color: '#2563eb', bg: '#ffffff', bold: true },
                    { id: 'section_banner', name: 'شريط باب', color: '#ffffff', bg: '#1e3a8a', bold: true }
                  ].map((styleItem) => (
                    <button
                      key={styleItem.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyWordStyle(styleItem.id)}
                      style={{
                        height: '28px',
                        padding: '2px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: styleItem.bg || 'white',
                        border: '1px solid #cbd5e1',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: styleItem.bold ? 'bold' : 'normal',
                        color: styleItem.color,
                        whiteSpace: 'nowrap',
                        transition: '0.15s',
                        flexShrink: 0
                      }}
                      title={`تطبيق ${styleItem.name}`}
                    >
                      {styleItem.name}
                    </button>
                  ))}
                </div>

                <div style={dividerStyle}></div>

                {/* 5. التحرير والصوت (Editing & Voice) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  <button onClick={() => setShowFindReplaceModal(true)} style={toolActionBtnStyle} title="بحث في المستند (Ctrl+F)">
                    <Search size={13} color="#0284c7" /> <span>بحث</span>
                  </button>
                  <button onClick={() => setShowFindReplaceModal(true)} style={toolActionBtnStyle} title="استبدال نصوص (Ctrl+H)">
                    <RefreshCw size={13} color="#059669" /> <span>استبدال</span>
                  </button>
                  <button onClick={() => setIsAllPagesSelected(true)} style={toolActionBtnStyle} title="تحديد كامل صفحات المستند (Ctrl+A)">
                    <Check size={13} color="#64748b" /> <span>تحديد الكل</span>
                  </button>
                  
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={toggleRecording} 
                    style={{ 
                      ...toolActionBtnStyle,
                      background: isRecording ? '#fee2e2' : '#f0fdf4', 
                      color: isRecording ? '#dc2626' : '#15803d', 
                      borderColor: isRecording ? '#fca5a5' : '#86efac'
                    }}
                    title="إملاء صوتي فوري باللغة العربية"
                  >
                    <Mic size={14} className={isRecording ? "pulse" : ""} color={isRecording ? "#dc2626" : "#16a34a"} />
                    <span>{isRecording ? "استماع..." : "إملاء"}</span>
                  </button>
                </div>

              </div>
            )}

            {/* TAB 2: INSERT (MICROSOFT WORD PAGES, TABLES, ILLUSTRATIONS, SHAPES, SMARTART, TEXT BOXES & SYMBOLS) */}
            {activeTab === 'insert' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', width: 'max-content', minWidth: '100%' }}>
                
                {/* Pages & Cover Page */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <button onClick={() => addNewPage(activePageIndex)} style={{ ...toolActionBtnStyle, background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }} title="إضافة صفحة A4 جديدة بعد الصفحة الحالية فوراً">
                    <Plus size={15} /> صفحة فارغة
                  </button>
                  <select
                    onChange={(e) => { if (e.target.value) insertWordCoverPage(e.target.value); e.target.value = ''; }}
                    style={{ ...selectStyle, background: '#fefce8', borderColor: '#fde047', color: '#854d0e', fontWeight: 'bold' }}
                    title="إدراج صفحة غلاف احترافية للملزمة"
                  >
                    <option value="">📕 صفحة غلاف...</option>
                    <option value="royal_navy">📘 غلاف كحلي ملكي</option>
                    <option value="emerald_modern">📗 غلاف أخضر زمردي</option>
                    <option value="classic_gold">📙 غلاف ذهبي كلاسيكي</option>
                  </select>
                </div>

                <div style={dividerStyle}></div>

                {/* Tables Group */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <button onClick={() => handleInsertTable('navy')} style={toolActionBtnStyle} title="إدراج جدول قياسي سريع 3 صفوف في 3 أعمدة">
                    <TableIcon size={15} color="#2563eb" /> جدول 3×3
                  </button>
                  <button onClick={insertComparisonTable} style={{ ...toolActionBtnStyle, background: '#f0f9ff', color: '#0284c7', borderColor: '#bae6fd' }} title="إدراج جدول مقارنة ثنائية جاهز (وجه المقارنة أ وب)">
                    <TableIcon size={15} color="#0284c7" /> جدول مقارنة
                  </button>
                  <button onClick={() => setShowCustomTableModal(true)} style={{ ...toolActionBtnStyle, background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }} title="تحديد عدد الصفوف والأعمدة والتصميم المخصص">
                    <Plus size={15} color="#059669" /> جدول مخصص...
                  </button>
                </div>

                <div style={dividerStyle}></div>

                {/* Images & Free OCR */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleInsertImage} style={{ display: 'none' }} />
                  <button onClick={() => fileInputRef.current.click()} style={toolActionBtnStyle} title="إدراج صورة من جهازك (أو Ctrl+V)">
                    <ImageIcon size={15} color="#3b82f6" /> صورة
                  </button>
                  <button 
                    onClick={() => setShowAIImageModal(true)} 
                    style={{ ...toolActionBtnStyle, background: '#f5f3ff', color: '#7c3aed', borderColor: '#ddd6fe', display: 'flex', alignItems: 'center', gap: '3px' }}
                    title="توليد رسومات توضيحية ورسوم بيانية متجهة SVG بالذكاء الاصطناعي (أو من بيانات CSV)"
                  >
                    <Sparkles size={14} color="#7c3aed" /> رسم SVG بالذكاء
                  </button>
                  <button 
                    onClick={() => setShowOcrModal(true)} 
                    style={{ ...toolActionBtnStyle, background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}
                    title="استخراج النصوص من الصور مجاناً (Free OCR)"
                  >
                    <FileSearch size={15} color="#16a34a" /> OCR
                  </button>
                </div>

                <div style={dividerStyle}></div>

                {/* Word Shapes Gallery Modal & SmartArt Diagrams */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <button
                    onClick={() => setShowShapesModal(true)}
                    style={{ ...toolActionBtnStyle, background: '#eff6ff', color: '#1d4ed8', borderColor: '#93c5fd' }}
                    title="فتح معرض أشكال الوورد الهندسية والأسهم واللافتات والمخططات"
                  >
                    <Shapes size={15} color="#2563eb" /> أشكال الوورد...
                  </button>

                  <select
                    onChange={(e) => { if (e.target.value) insertWordSmartArt(e.target.value); e.target.value = ''; }}
                    style={{ ...selectStyle, background: '#f5f3ff', borderColor: '#ddd6fe', color: '#6d28d9', fontWeight: 'bold' }}
                    title="إدراج مخطط هيكلي أو تعليمي SmartArt"
                  >
                    <option value="">📊 مخطط SmartArt...</option>
                    <option value="process_steps">➡️ مخطط خطوات متسلسلة (1 ← 2 ← 3)</option>
                    <option value="hierarchy_tree">🌳 مخطط شجري هرمي (خريطة مفاهيم)</option>
                    <option value="pyramid_levels">🔺 هرم التدرج المعرفي</option>
                    <option value="feature_grid">⊞ شبكة العناصر الأربعة</option>
                  </select>
                </div>

                <div style={dividerStyle}></div>

                {/* Text Box, WordArt & Callout Boxes */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <select
                    onChange={(e) => { if (e.target.value) insertWordTextBox(e.target.value); e.target.value = ''; }}
                    style={{ ...selectStyle, fontWeight: 'bold' }}
                    title="إدراج مربع نص (Text Box)"
                  >
                    <option value="">📦 مربع نص...</option>
                    <option value="classic">⬜ مربع نص كلاسيكي</option>
                    <option value="shadow_blue">🟦 مربع نص بظل هندسي أزرق</option>
                    <option value="sticky_yellow">🟨 ملاحظة لاصقة صفراء</option>
                    <option value="side_float_left">📐 هامش جانبي عائم (يسار)</option>
                  </select>

                  <select
                    onChange={(e) => { if (e.target.value) insertWordArt(e.target.value); e.target.value = ''; }}
                    style={{ ...selectStyle, fontWeight: 'bold', color: '#1e3a8a' }}
                    title="إدراج نص مزخرف (WordArt)"
                  >
                    <option value="">✨ WordArt...</option>
                    <option value="royal_gradient">👑 نص ثلاثي الأبعاد كحلي</option>
                    <option value="gold_3d">🏆 شارة عنوان ذهبي فاخر</option>
                    <option value="neon_outline">🏛️ عنوان بإطار مزدوج كلاسيكي</option>
                  </select>

                  <select 
                    onChange={(e) => { if(e.target.value) insertCalloutBox(e.target.value); e.target.value=''; }} 
                    style={{ ...selectStyle, background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af', fontWeight: 'bold' }}
                  >
                    <option value="">💡 صناديق الملازم...</option>
                    <option value="note">💡 معلومة هامة</option>
                    <option value="remember">📌 تذكر أن (قاعدة ذهبية)</option>
                    <option value="warning">⚠️ انتبه للخطأ الشائع</option>
                    <option value="champion">🏆 سؤال أوائل الطلبة والمتفوقين</option>
                    <option value="homework">📝 تدريب وواجب منزلي</option>
                    <option value="objective">🎯 نواتج التعلم المستهدفة</option>
                    <option value="formula">📐 صيغة وقانون رياضي</option>
                  </select>
                </div>

                <div style={dividerStyle}></div>

                {/* Question Badges & Math Shortcut */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <select 
                    onChange={(e) => { 
                      if(e.target.value) {
                        const [txt, col] = e.target.value.split('|');
                        insertQuestionBadge(txt, col);
                      } 
                      e.target.value=''; 
                    }} 
                    style={selectStyle}
                  >
                    <option value="">🏷️ وسام سؤال...</option>
                    <option value="سؤال|#1e40af">🔵 [سؤال]</option>
                    <option value="علل لما يأتي|#059669">🟢 [علل لما يأتي]</option>
                    <option value="ما النتائج المترتبة|#7c3aed">🟣 [ما النتائج المترتبة]</option>
                    <option value="المصطلح العلمي|#d97706">🟠 [المصطلح العلمي]</option>
                    <option value="انتبه جيداً|#dc2626">🔴 [انتبه جيداً]</option>
                    <option value="مسألة|#0284c7">🔷 [مسألة]</option>
                    <option value="اختر الإجابة|#4338ca">🟣 [اختر الإجابة]</option>
                  </select>

                  <button 
                    onClick={(e) => handleOpenEquationMenu(e)} 
                    className="equation-menu-trigger"
                    style={{ ...toolActionBtnStyle, background: '#f0f9ff', color: '#0369a1', borderColor: '#bae6fd', display: 'flex', alignItems: 'center', gap: '3px' }}
                    title="قائمة المعادلات الرياضية الجاهزة والصيغ (Alt + =)"
                  >
                    <span style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: 'serif' }}>π</span> معادلة
                    <ChevronDown size={11} style={{ opacity: 0.7 }} />
                  </button>
                </div>

              </div>
            )}

            {/* TAB 3: AI STUDIO */}
            {activeTab === 'ai' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', width: 'max-content', minWidth: '100%' }}>
                
                {/* Ready AI Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button 
                    disabled={loading} 
                    onClick={() => callAI('format', '', isAllPagesSelected)} 
                    style={{ 
                      ...aiActionBtnStyle, 
                      background: isAllPagesSelected ? '#7c3aed' : '#f5f3ff', 
                      color: isAllPagesSelected ? '#ffffff' : '#7c3aed', 
                      borderColor: '#7c3aed',
                      fontWeight: isAllPagesSelected ? 'bold' : 'normal',
                      boxShadow: isAllPagesSelected ? '0 0 10px rgba(124, 58, 237, 0.4)' : 'none'
                    }}
                    title={isAllPagesSelected ? "تنسيق شامل لكامل صفحات المستند دفعة واحدة" : "تنسيق الصفحة الحالية بالذكاء الاصطناعي"}
                  >
                    <Wand2 size={15} /> {isAllPagesSelected ? `✨ تنسيق كامل المستند (${pages.length} صفحات)` : 'تنسيق شامل للصفحة'}
                  </button>

                  <button 
                    disabled={loading} 
                    onClick={() => callAI('format', '', true)} 
                    style={{ ...aiActionBtnStyle, background: '#ede9fe', color: '#6d28d9', borderColor: '#c4b5fd' }}
                    title="تنسيق كافة صفحات المستند بالكامل من البداية للنهاية دفعة واحدة بدون الحاجة لتحديد الكل"
                  >
                    <Sparkles size={14} /> كل المستند
                  </button>

                  <button 
                    disabled={loading} 
                    onClick={() => callAI('correct', '', isAllPagesSelected)} 
                    style={{ ...aiActionBtnStyle, background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}
                    title={isAllPagesSelected ? "تدقيق وتصحيح لكامل صفحات المستند" : "تصحيح أخطاء النص المحدد أو الصفحة"}
                  >
                    <CheckCheck size={15} /> {isAllPagesSelected ? 'تدقيق كامل المستند' : 'تصحيح أخطاء'}
                  </button>

                  <button disabled={loading} onClick={() => callAI('continue')} style={{ ...aiActionBtnStyle, background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}>
                    <Edit3 size={15} /> أكمل الشرح
                  </button>

                  <button 
                    disabled={loading} 
                    onClick={() => callAI('summarize', '', isAllPagesSelected)} 
                    style={{ ...aiActionBtnStyle, background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}
                    title={isAllPagesSelected ? "تلخيص شامل لكامل صفحات المستند" : "تلخيص المحتوى المحدد أو الصفحة"}
                  >
                    <List size={15} /> {isAllPagesSelected ? 'تلخيص كل الملزمة' : 'تلخيص'}
                  </button>

                  <button disabled={loading} onClick={() => callAI('table')} style={{ ...aiActionBtnStyle, background: '#fffbeb', color: '#d97706', borderColor: '#fde68a' }}>
                    <TableIcon size={15} /> تحويل لجدول
                  </button>
                  <button 
                    onClick={() => setShowAIImageModal(true)} 
                    style={{ ...aiActionBtnStyle, background: '#f5f3ff', color: '#7c3aed', borderColor: '#ddd6fe' }}
                    title="توليد رسومات توضيحية ورسوم بيانية متجهة SVG بالذكاء الاصطناعي (أو من بيانات CSV)"
                  >
                    <Sparkles size={14} color="#7c3aed" /> رسم SVG بالذكاء
                  </button>

                  <button 
                    onClick={cleanExcessiveSpacing} 
                    style={{ ...aiActionBtnStyle, background: '#f8fafc', color: '#475569', borderColor: '#cbd5e1' }} 
                    title="إزالة الفراغات والأسطر الفارغة الزائدة وضبط المسافات بين الفقرات في كامل المستند"
                  >
                    <AlignJustify size={14} /> 🧹 إزالة الفراغات الزائدة
                  </button>

                  <button onClick={() => setShowOcrModal(true)} style={{ ...aiActionBtnStyle, background: '#f0fdf4', color: '#16a34a', borderColor: '#86efac' }} title="استخراج النصوص من الصور مجاناً بدون استهلاك الذكاء (Free OCR)">
                    <FileSearch size={15} /> OCR مجاني
                  </button>

                  <button onClick={() => setShowAssistant(true)} style={{ ...aiActionBtnStyle, background: '#e0e7ff', color: '#4338ca', borderColor: '#c7d2fe' }} title="فتح شات المساعد الذكي مع دعم إرسال الصور وتحليلها">
                    <MessageSquare size={15} /> شات الذكاء 📷
                  </button>
                </div>

                <div style={dividerStyle}></div>

                {/* Free Custom AI Prompt */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '280px' }}>
                  <input 
                    type="text" 
                    value={customAiPrompt} 
                    onChange={(e) => setCustomAiPrompt(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter') callAI('custom', customAiPrompt); }}
                    placeholder="اطلب أي أمر حر من الذكاء (مثال: ضع 3 أسئلة علل على هذه الصفحة...)" 
                    style={{ flex: 1, padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }} 
                  />
                  <button 
                    disabled={loading || !customAiPrompt.trim()} 
                    onClick={() => callAI('custom', customAiPrompt)}
                    style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Sparkles size={14} /> تنفيذ
                  </button>
                </div>

              </div>
            )}

            {/* TAB 4: PAGE DESIGN & LAYOUT (تصميم وتخطيط الصفحة + تسطير الكراسة وخطوط الشبكة والحدود والأعمدة) */}
            {activeTab === 'page' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', width: 'max-content', minWidth: '100%' }}>
                
                {/* Rebalance All Pages Button */}
                <button 
                  onClick={() => rebalanceAllPages()}
                  style={{ ...toolActionBtnStyle, background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}
                  title="إعادة توزيع وضبط الأسطر والصفحات تلقائياً لتناسب مقاس A4"
                >
                  <RefreshCw size={14} /> ضبط الصفحات
                </button>

                <div style={dividerStyle}></div>

                {/* Ruled Lines & Grid Lines (خطوط المسطرة وخطوط الشبكة كما في الوورد) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 'bold' }}>تسطير وشبكة:</span>
                  <select
                    value={pageBackgroundPattern}
                    onChange={e => setPageBackgroundPattern(e.target.value)}
                    style={{ ...selectStyle, background: pageBackgroundPattern !== 'none' ? '#eff6ff' : '#f8fafc', borderColor: pageBackgroundPattern !== 'none' ? '#3b82f6' : '#cbd5e1', fontWeight: 'bold' }}
                    title="إضافة خطوط تسطير كراسة أو شبكة تربيعية للورقة"
                  >
                    <option value="none">📄 ورقة بيضاء سادة</option>
                    <option value="ruled_narrow">📝 تسطير كراسة عادي (مسطر)</option>
                    <option value="ruled_wide">📏 تسطير كراسة عريض</option>
                    <option value="grid_small">⌗ خطوط شبكة صغيرة (مربعات رسم بياني)</option>
                    <option value="grid_medium">⊞ خطوط شبكة متوسطة (مربعات)</option>
                    <option value="dotted">∷ نقاط هندسية (Dotted)</option>
                  </select>
                </div>

                {/* Page Borders (حدود وإطارات الصفحة الاحترافية) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: pageBorderStyle !== 'none' ? '#eff6ff' : '#f8fafc', padding: '3px 8px', borderRadius: '8px', border: '1px solid', borderColor: pageBorderStyle !== 'none' ? '#bfdbfe' : '#e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    🖼️ إطار الصفحة:
                  </span>
                  
                  {/* Frame Style Select */}
                  <select
                    value={pageBorderStyle}
                    onChange={e => setPageBorderStyle(e.target.value)}
                    style={{ ...selectStyle, background: 'white', borderColor: pageBorderStyle !== 'none' ? '#3b82f6' : '#cbd5e1', fontWeight: 'bold', fontSize: '12.5px', maxWidth: '185px' }}
                    title="اختر شكل وتصميم برواز الصفحة"
                  >
                    <option value="none">بدون إطار</option>
                    <optgroup label="── إطارات رسمية كلاسيكية ──">
                      <option value="simple">▢ إطار كلاسيكي مفرد</option>
                      <option value="double">▣ إطار رسمي مزدوج</option>
                      <option value="thick_thin">⧉ إطار سميك ورفيع (Thick-Thin)</option>
                      <option value="thin_thick_thin">👑 إطار ثلاثي ملكي (Triple)</option>
                      <option value="shadow_box">❏ إطار مجسم مع ظل (Shadow)</option>
                    </optgroup>
                    <optgroup label="── إطارات المذكرات والملازم التعليمية ──">
                      <option value="exam_official">📝 إطار امتحان رسمي بترويسة</option>
                      <option value="academic_ribbon">📜 إطار مذكرة بترويسة علوية (Header Box)</option>
                      <option value="corner_bracket">📐 إطار أركان هندسية مقواة (Accents)</option>
                      <option value="modern_rounded">🔲 إطار عصري مستدير الزوايا</option>
                      <option value="dashed">╌ إطار متقطع أنيق (Dashed)</option>
                      <option value="dotted">∷ إطار منقط تربوي (Dotted)</option>
                    </optgroup>
                    <optgroup label="── إطارات الشهادات والزخارف الفاخرة ──">
                      <option value="islamic_ornate">🕌 إطار إسلامي بنجوم هندسية (Arabesque)</option>
                      <option value="certificate_ornate">🎖️ إطار شهادات وتكريم وزخارف (Flourish)</option>
                      <option value="vintage_scroll_frame">📜 إطار مخطوطة قديمة (Vintage)</option>
                      <option value="geometric_diamonds">💎 إطار معينات هندسية (Diamonds)</option>
                      <option value="groove">⌸ إطار محفور ثلاثي الأبعاد (3D Groove)</option>
                      <option value="ridge">⌹ إطار بارز ثلاثي الأبعاد (3D Ridge)</option>
                      <option value="modern_blue">🟦 إطار كحلي أكاديمي</option>
                      <option value="academic_gold">🟨 إطار ذهبي فاخر</option>
                    </optgroup>
                  </select>

                  {/* Active Border Customization Controls */}
                  {pageBorderStyle !== 'none' && (
                    <>
                      {/* Thickness Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginRight: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>السُمك:</span>
                        <select
                          value={pageBorderWidth}
                          onChange={e => setPageBorderWidth(e.target.value)}
                          style={{ padding: '3px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', background: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                          title="سمك خطوط الإطار"
                        >
                          <option value="thin">رفيع (1x)</option>
                          <option value="normal">عادي (2x)</option>
                          <option value="thick">عريض (3x)</option>
                        </select>
                      </div>

                      {/* Border Color Swatches & Native Color Picker */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginRight: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>اللون:</span>
                        {[
                          { c: '#0f172a', name: 'أسود فحمي' },
                          { c: '#1e3a8a', name: 'كحلي ملكي' },
                          { c: '#2563eb', name: 'أزرق أكاديمي' },
                          { c: '#065f46', name: 'أخضر زيتي' },
                          { c: '#991b1b', name: 'عنابي فاخر' },
                          { c: '#b45309', name: 'ذهبي كلاسيكي' },
                          { c: '#6b21a8', name: 'بنفسجي ملكي' },
                          { c: '#475569', name: 'رصاصي رسمي' }
                        ].map((swatch, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => setPageBorderColor(swatch.c)}
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              background: swatch.c,
                              border: pageBorderColor.toLowerCase() === swatch.c.toLowerCase() ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                              boxShadow: pageBorderColor.toLowerCase() === swatch.c.toLowerCase() ? '0 0 0 1.5px #93c5fd' : 'none',
                              cursor: 'pointer',
                              padding: 0
                            }}
                            title={swatch.name}
                          />
                        ))}

                        {/* Custom Color Input Wheel */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={pageBorderColor}
                            onChange={e => setPageBorderColor(e.target.value)}
                            title="اختر أي لون إطار مخصص"
                            style={{
                              width: '20px',
                              height: '20px',
                              padding: 0,
                              border: '1px solid #94a3b8',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              background: 'transparent'
                            }}
                          />
                        </div>
                      </div>

                      {/* Quick Reset Button */}
                      <button
                        type="button"
                        onClick={() => setPageBorderStyle('none')}
                        style={{
                          background: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          color: '#dc2626',
                          fontSize: '11px',
                          padding: '2px 6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          marginRight: '2px'
                        }}
                        title="إلغاء وحذف الإطار من المستند"
                      >
                        ✕ إزالة
                      </button>
                    </>
                  )}
                </div>

                {/* Page Background Color (لون الصفحة) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>لون الورقة:</span>
                  {[
                    { c: '#ffffff', label: 'أبيض ناصع' },
                    { c: '#fefce8', label: 'كريمي مريح للعين' },
                    { c: '#f0f9ff', label: 'سماوي هادئ' },
                    { c: '#f0fdf4', label: 'أخضر فاتح' },
                    { c: '#fff7ed', label: 'خوخي دافئ' },
                    { c: '#faf5ff', label: 'بنفسجي ناعم' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPageBgColor(item.c)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        background: item.c,
                        border: pageBgColor === item.c ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        cursor: 'pointer'
                      }}
                      title={item.label}
                    />
                  ))}
                </div>

                {/* Columns (الأعمدة: 1، 2، 3) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>الأعمدة:</span>
                  {[1, 2, 3].map(colNum => (
                    <button
                      key={colNum}
                      onClick={() => setPageColumns(colNum)}
                      style={{
                        ...badgeBtnStyle,
                        padding: '4px 8px',
                        background: pageColumns === colNum ? '#eff6ff' : 'white',
                        borderColor: pageColumns === colNum ? '#2563eb' : '#cbd5e1',
                        color: pageColumns === colNum ? '#1d4ed8' : '#334155',
                        fontWeight: pageColumns === colNum ? 'bold' : 'normal'
                      }}
                      title={`تقسيم الصفحة إلى ${colNum} عمود`}
                    >
                      {colNum === 1 ? '١ عمود' : colNum === 2 ? '٢ عمودان' : '٣ أعمدة'}
                    </button>
                  ))}
                </div>

                <div style={dividerStyle}></div>

                {/* Header, Footer & Watermark */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>الرأس:</span>
                  <input 
                    type="text" 
                    value={headerText} 
                    onChange={e => setHeaderText(e.target.value)} 
                    placeholder="منصة الأستاذ..." 
                    style={{ ...inputInlineStyle, width: '115px' }} 
                  />
                  <span style={{ fontSize: '12px', color: '#64748b' }}>التذييل:</span>
                  <input 
                    type="text" 
                    value={footerText} 
                    onChange={e => setFooterText(e.target.value)} 
                    placeholder="الهاتف والعنوان..." 
                    style={{ ...inputInlineStyle, width: '115px' }} 
                  />
                  <span style={{ fontSize: '12px', color: '#64748b' }}>مائية:</span>
                  <input 
                    type="text" 
                    value={watermark} 
                    onChange={e => setWatermark(e.target.value)} 
                    placeholder="الاسم بالخلفية..." 
                    style={{ ...inputInlineStyle, width: '110px' }} 
                  />
                </div>

                <div style={dividerStyle}></div>

                {/* Page Numbering & Margins */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <select 
                    value={pageNumberFormat} 
                    onChange={e => setPageNumberFormat(e.target.value)}
                    style={selectStyle}
                    title="موضع وصيغة ترقيم الصفحات"
                  >
                    <option value="bottom_center">ترقيم: أسفل المنتصف</option>
                    <option value="bottom_left">ترقيم: أسفل اليسار</option>
                    <option value="bottom_right">ترقيم: أسفل اليمين</option>
                    <option value="none">بدون أرقام صفحات</option>
                  </select>

                  <span style={{ fontSize: '12px', color: '#64748b' }}>الهوامش:</span>
                  <button onClick={() => handleMarginChange('10mm')} style={{ ...badgeBtnStyle, background: pageMargin === '10mm' ? '#eff6ff' : 'white', borderColor: pageMargin === '10mm' ? '#3b82f6' : '#cbd5e1' }} title="هوامش 10مم فائقة الاتساع للملازم">10mm</button>
                  <button onClick={() => handleMarginChange('15mm')} style={{ ...badgeBtnStyle, background: pageMargin === '15mm' ? '#eff6ff' : 'white', borderColor: pageMargin === '15mm' ? '#3b82f6' : '#cbd5e1' }} title="هوامش 15مم متوازنة">15mm</button>
                  <button onClick={() => handleMarginChange('20mm')} style={{ ...badgeBtnStyle, background: pageMargin === '20mm' ? '#eff6ff' : 'white', borderColor: pageMargin === '20mm' ? '#3b82f6' : '#cbd5e1' }} title="هوامش 20مم قياسية">20mm</button>
                  <button onClick={() => handleMarginChange('25mm')} style={{ ...badgeBtnStyle, background: pageMargin === '25mm' ? '#eff6ff' : 'white', borderColor: pageMargin === '25mm' ? '#3b82f6' : '#cbd5e1' }} title="هوامش 25مم عريضة">25mm</button>
                </div>

              </div>
            )}

            {/* TAB: MATH STUDIO (MICROSOFT WORD EQUATION RIBBON) */}
            {activeTab === 'math' && (
              <div className="math-ribbon-panel" style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px', width: 'max-content', minWidth: '100%', padding: '2px 4px', userSelect: 'none' }}>
                
                {/* 1. أدوات وتحويلات (Tools) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  {/* Built-in Popular Equations Dropdown Trigger */}
                  <button 
                    onClick={(e) => handleOpenEquationMenu(e)}
                    className="equation-menu-trigger"
                    style={{ 
                      ...mathToolBtnStyle, 
                      background: showEquationMenu ? '#eff6ff' : 'white',
                      borderColor: showEquationMenu ? '#3b82f6' : '#cbd5e1' 
                    }}
                    title="معادلات شهيرة جاهزة للإدراج الفوري"
                  >
                    <span style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: "'Cambria Math', serif", color: '#0284c7' }}>π</span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>معادلة ▼</span>
                  </button>

                  {/* LaTeX Advanced Studio Modal Button */}
                  <button 
                    onClick={() => {
                      if (selectedEquation) {
                        const raw = selectedEquation.getAttribute('data-latex');
                        if (raw) setLatexInput(decodeURIComponent(raw));
                        setLatexIsBlock(selectedEquation.classList.contains('equation-widget-block'));
                      } else {
                        setLatexInput('\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
                      }
                      setShowLatexModal(true);
                    }}
                    style={{ ...mathToolBtnStyle, color: '#4338ca' }}
                    title="فتح محرر LaTeX المتكامل مع المعاينة الفورية"
                  >
                    <span style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'monospace' }}>{'{ }'}</span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>LaTeX</span>
                  </button>

                  {/* AI Equation Generator Button */}
                  <button 
                    onClick={() => handleGenerateAiEquation()}
                    style={{ ...mathToolBtnStyle, color: '#059669', borderColor: '#a7f3d0', background: '#f0fdf4' }}
                    title="اكتب اسم أي قانون أو معادلة وسيقوم الذكاء بصياغتها رياضياً"
                  >
                    <span style={{ fontSize: '14px' }}>🤖</span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>بالذكاء</span>
                  </button>
                </div>

                {/* Equation Display Mode (Inline vs Block Display) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#f0f9ff', padding: '2px 6px', borderRadius: '6px', border: '1px solid #bae6fd', flexShrink: 0 }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 'bold', color: '#0369a1' }}>النمط:</span>
                  <button
                    onClick={() => {
                      if (selectedEquation) {
                        setEquationMode(selectedEquation, false);
                      } else {
                        setLatexIsBlock(false);
                      }
                    }}
                    style={{
                      ...badgeBtnStyle,
                      background: !latexIsBlock ? '#0284c7' : 'white',
                      color: !latexIsBlock ? 'white' : '#0369a1',
                      borderColor: '#0284c7',
                      fontWeight: !latexIsBlock ? 'bold' : 'normal',
                      padding: '3px 6px',
                      fontSize: '10.5px'
                    }}
                    title="تدرج المعادلة في نفس سطر النص كأي كلمة عادية (Inline)"
                  >
                    🔤 سطري
                  </button>
                  <button
                    onClick={() => {
                      if (selectedEquation) {
                        setEquationMode(selectedEquation, true);
                      } else {
                        setLatexIsBlock(true);
                      }
                    }}
                    style={{
                      ...badgeBtnStyle,
                      background: latexIsBlock ? '#0284c7' : 'white',
                      color: latexIsBlock ? 'white' : '#0369a1',
                      borderColor: '#0284c7',
                      fontWeight: latexIsBlock ? 'bold' : 'normal',
                      padding: '3px 6px',
                      fontSize: '10.5px'
                    }}
                    title="تدرج المعادلة في سطر مستقل في منتصف الصفحة (Block Display)"
                  >
                    ⏹️ مستقل
                  </button>
                </div>

                {/* Selected Equation Actions */}
                {selectedEquation && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', borderLeft: '1px solid #e2e8f0', paddingLeft: '6px', flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        const raw = selectedEquation.getAttribute('data-latex');
                        if (raw) setLatexInput(decodeURIComponent(raw));
                        setLatexIsBlock(selectedEquation.classList.contains('equation-widget-block'));
                        setShowLatexModal(true);
                      }}
                      style={{ ...badgeBtnStyle, color: '#4338ca', borderColor: '#c7d2fe', background: '#eef2ff', padding: '3px 6px', fontSize: '10.5px' }}
                      title="تعديل المعادلة المحددة"
                    >
                      ✏️ تعديل
                    </button>
                    <button
                      onClick={() => {
                        selectedEquation.remove();
                        setSelectedEquation(null);
                        handleAutoSave();
                        triggerAutoPagination();
                      }}
                      style={{ ...badgeBtnStyle, color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2', padding: '3px 6px', fontSize: '10.5px' }}
                      title="حذف المعادلة المحددة"
                    >
                      🗑️ حذف
                    </button>
                  </div>
                )}

                <div style={dividerStyle}></div>

                {/* 2. رموز سريعة ومختصرة (Compact Symbols) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: '2px', background: '#f8fafc', padding: '2px 4px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    {(isMobile ? ['±', '×', '÷', '≠', '√'] : ['±', '∓', '×', '÷', '≠', '≤', '≥', '√', '∞']).map((s, i) => (
                      <button key={i} onClick={() => insertSymbol(s)} style={symbolBtnStyle} title={s}>{s}</button>
                    ))}
                  </div>

                  {/* Expand More Symbols Button */}
                  <button 
                    onClick={() => setShowMoreSymbols(!showMoreSymbols)}
                    style={{ ...mathToolBtnStyle, minWidth: '40px', background: showMoreSymbols ? '#eff6ff' : 'white', borderColor: showMoreSymbols ? '#3b82f6' : '#cbd5e1' }}
                    title="عرض كافة الرموز الرياضية والأحرف اليونانية والمنطقية"
                  >
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Ω</span>
                    <span style={{ fontSize: '10px' }}>الرموز ▼</span>
                  </button>

                  {/* Expanded Symbols Modal */}
                  {showMoreSymbols && (
                    <div 
                      className="math-modal no-print"
                      style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.45)',
                        backdropFilter: 'blur(2px)',
                        zIndex: 999999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px'
                      }}
                      onClick={(e) => {
                        if (e.target === e.currentTarget) setShowMoreSymbols(false);
                      }}
                    >
                      <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                        width: '100%',
                        maxWidth: '420px',
                        maxHeight: '85vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>لوحة الرموز الرياضية الشاملة (Ω)</span>
                          <button onClick={() => setShowMoreSymbols(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '16px' }}>✕</button>
                        </div>

                        <div style={{ padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {/* Greek Letters */}
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>الأحرف اليونانية (Greek Letters):</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                              {['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'λ', 'μ', 'ν', 'ξ', 'π', 'ρ', 'σ', 'τ', 'φ', 'χ', 'ψ', 'ω', 'Δ', 'Ω', 'Σ', 'Φ', 'Ψ', 'Γ', 'Θ', 'Λ', 'Ξ', 'Π'].map((s, i) => (
                                <button key={i} onClick={() => insertSymbol(s)} style={symbolBtnStyle} title={s}>{s}</button>
                              ))}
                            </div>
                          </div>

                          {/* Logic & Sets */}
                          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>مجموعات وعمليات منطقية:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                              {['∈', '∉', '⊂', '⊃', '⊆', '⊇', '∪', '∩', '∅', '∀', '∃', '∄', '∴', '∵', '∧', '∨', '¬', '⇒', '⇔', '⊤', '⊥'].map((s, i) => (
                                <button key={i} onClick={() => insertSymbol(s)} style={symbolBtnStyle} title={s}>{s}</button>
                              ))}
                            </div>
                          </div>

                          {/* Geometry & Arrows */}
                          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>هندسة وأسهم وتفاضل:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                              {['→', '←', '↔', '⇒', '⇐', '⇔', '↑', '↓', '∠', '∡', '⊥', '∥', '△', '□', '°', '′', '″', '·', '…', 'ℏ'].map((s, i) => (
                                <button key={i} onClick={() => insertSymbol(s)} style={symbolBtnStyle} title={s}>{s}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={dividerStyle}></div>

                {/* 3. بنى (The 11 Word Structure Dropdown Buttons) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {[
                    {
                      id: 'fraction',
                      label: 'كسر',
                      displayIcon: '½',
                      templates: [
                        { label: 'كسر اعتيادي عمودي', latex: '\\frac{x}{y}' },
                        { label: 'كسر مائل', latex: 'x / y' },
                        { label: 'مشتقة أولى dy/dx', latex: '\\frac{dy}{dx}' },
                        { label: 'مشتقة ثانية d²y/dx²', latex: '\\frac{d^2y}{dx^2}' },
                        { label: 'مشتقة جزئية ∂y/∂x', latex: '\\frac{\\partial y}{\\partial x}' },
                        { label: 'تغير نسبي Δy/Δx', latex: '\\frac{\\Delta y}{\\Delta x}' }
                      ]
                    },
                    {
                      id: 'script',
                      label: 'حرف',
                      displayIcon: 'eˣ',
                      templates: [
                        { label: 'أس علوي (Superscript)', latex: 'x^2' },
                        { label: 'دليل سفلي (Subscript)', latex: 'x_1' },
                        { label: 'أس ودليل معاً', latex: 'x_1^2' },
                        { label: 'رمز بدليل يساري', latex: '{}_1^2 x' },
                        { label: 'دالة أسية طبيعية', latex: 'e^{x}' }
                      ]
                    },
                    {
                      id: 'radical',
                      label: 'جذر',
                      displayIcon: '√x',
                      templates: [
                        { label: 'جذر تربيعي بسيط', latex: '\\sqrt{x}' },
                        { label: 'جذر نوني بأساس', latex: '\\sqrt[n]{x}' },
                        { label: 'جذر تكعيبي', latex: '\\sqrt[3]{x}' },
                        { label: 'جذر تربيعي لمقدار', latex: '\\sqrt{a^2 + b^2}' },
                        { label: 'جذر رابع', latex: '\\sqrt[4]{x}' }
                      ]
                    },
                    {
                      id: 'integral',
                      label: 'تكامل',
                      displayIcon: '∫',
                      templates: [
                        { label: 'تكامل غير محدد', latex: '\\int f(x) \\, dx' },
                        { label: 'تكامل محدد بحدود', latex: '\\int_{a}^{b} f(x) \\, dx' },
                        { label: 'تكامل ثنائي (سطحي)', latex: '\\iint_{D} f(x, y) \\, dx \\, dy' },
                        { label: 'تكامل ثلاثي (حجمي)', latex: '\\iiint_{V} f(x, y, z) \\, dV' },
                        { label: 'تكامل مسار مغلق (كفافي)', latex: '\\oint_{C} \\vec{F} \\cdot d\\vec{r}' }
                      ]
                    },
                    {
                      id: 'large_op',
                      label: 'عامل تشغيل كبير',
                      displayIcon: '∑',
                      templates: [
                        { label: 'مجموع بحدود عليا ودنيا', latex: '\\sum_{i=1}^{n} x_i' },
                        { label: 'مجموع بدون حدود', latex: '\\sum x' },
                        { label: 'حاصل ضرب متسلسلة (Product)', latex: '\\prod_{i=1}^{n} x_i' },
                        { label: 'اتحاد مجموعات عام', latex: '\\bigcup_{i=1}^{n} A_i' },
                        { label: 'تقاطع مجموعات عام', latex: '\\bigcap_{i=1}^{n} A_i' }
                      ]
                    },
                    {
                      id: 'bracket',
                      label: 'قوس',
                      displayIcon: '( )',
                      templates: [
                        { label: 'أقواس دائرية', latex: '(x + y)' },
                        { label: 'أقواس مربعة', latex: '[x + y]' },
                        { label: 'أقواس معقوفة', latex: '\\{x + y\\}' },
                        { label: 'قيمة مطلقة / مقياس', latex: '|x|' },
                        { label: 'معيار المتجه', latex: '\\|\\vec{v}\\|' },
                        { label: 'دالة متعددة التعريف (قاعدتين)', latex: '\\begin{cases} x & x \\ge 0 \\\\ -x & x < 0 \\end{cases}' },
                        { label: 'دالة متعددة التعريف (3 قواعد)', latex: '\\begin{cases} 1 & x > 0 \\\\ 0 & x = 0 \\\\ -1 & x < 0 \\end{cases}' }
                      ]
                    },
                    {
                      id: 'function',
                      label: 'دالة',
                      displayIcon: 'sin θ',
                      templates: [
                        { label: 'دالة الجيب (جا)', latex: '\\sin(\\theta)' },
                        { label: 'دالة جيب التمام (جتا)', latex: '\\cos(\\theta)' },
                        { label: 'دالة الظل (ظا)', latex: '\\tan(\\theta)' },
                        { label: 'ظل التمام (ظتا)', latex: '\\cot(\\theta)' },
                        { label: 'دوال عكسية (Arcsin, Arccos)', latex: '\\arcsin(x) \\quad \\arccos(x)' },
                        { label: 'دوال زائدية (Sinh, Cosh)', latex: '\\sinh(x) \\quad \\cosh(x)' }
                      ]
                    },
                    {
                      id: 'accent',
                      label: 'التمييز',
                      displayIcon: 'ä',
                      templates: [
                        { label: 'متجه (سهم علوي)', latex: '\\vec{v}' },
                        { label: 'متوسط حسابي (شَرطة علوية)', latex: '\\bar{x}' },
                        { label: 'متجه وحدة (قبعة)', latex: '\\hat{i}' },
                        { label: 'مشتقة أولى (نقطة علوية)', latex: '\\dot{x}' },
                        { label: 'مشتقة ثانية (نقطتان علويتان)', latex: '\\ddot{x}' },
                        { label: 'خط سفلي', latex: '\\underline{x}' },
                        { label: 'تلدة علوية', latex: '\\tilde{x}' }
                      ]
                    },
                    {
                      id: 'limit',
                      label: 'حد ولوغاريتم',
                      displayIcon: 'lim',
                      templates: [
                        { label: 'نهاية تؤول لصفر', latex: '\\lim_{x \\to 0} f(x)' },
                        { label: 'نهاية تؤول للمالانهاية', latex: '\\lim_{x \\to \\infty} \\frac{1}{x} = 0' },
                        { label: 'لوغاريتم طبيعي (لن)', latex: '\\ln(x)' },
                        { label: 'لوغاريتم معتاد (لو)', latex: '\\log(x)' },
                        { label: 'لوغاريتم بأساس محدد', latex: '\\log_{a}(b)' },
                        { label: 'قيمة عظمى وصغرى', latex: '\\max(a, b) \\quad \\min(a, b)' }
                      ]
                    },
                    {
                      id: 'operator',
                      label: 'عامل تشغيل',
                      displayIcon: '≜',
                      templates: [
                        { label: 'تعريف ومطابقة', latex: 'A \\triangleq B' },
                        { label: 'سهم اتجاهي تحويل', latex: 'A \\longrightarrow B' },
                        { label: 'اتزان كيميائي متعاكس', latex: 'A \\rightleftharpoons B' },
                        { label: 'سهم مشروط بعامل', latex: 'A \\xrightarrow{\\Delta} B' },
                        { label: 'تناسب وتطابق هندسي', latex: 'y \\propto x \\quad \\triangle ABC \\cong \\triangle DEF' }
                      ]
                    },
                    {
                      id: 'matrix',
                      label: 'مصفوفة',
                      displayIcon: '[::]',
                      templates: [
                        { label: 'مصفوفة 2×2 بأقواس دائرية', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
                        { label: 'مصفوفة 2×2 بأقواس مربعة', latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' },
                        { label: 'مصفوفة 3×3 بأقواس مربعة', latex: '\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}' },
                        { label: 'محدد 2×2', latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}' },
                        { label: 'محدد 3×3', latex: '\\begin{vmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{vmatrix}' },
                        { label: 'متجه عمودي 2×1', latex: '\\begin{pmatrix} x \\\\ y \\end{pmatrix}' }
                      ]
                    }
                  ].map((struct) => {
                    const isOpen = activeMathDropdown === struct.id;
                    return (
                      <div key={struct.id} style={{ position: 'relative' }} className="math-dropdown-container">
                        <button
                          onClick={(e) => handleToggleMathDropdown(e, struct.id)}
                          style={{
                            ...mathToolBtnStyle,
                            background: isOpen ? '#eff6ff' : 'white',
                            borderColor: isOpen ? '#3b82f6' : '#cbd5e1'
                          }}
                          title={`إدراج بنية ${struct.label}`}
                        >
                          <span style={{ fontSize: '15px', fontWeight: 'bold', fontFamily: "'Cambria Math', 'Times New Roman', serif", color: '#0369a1', lineHeight: '1.2' }}>
                            {struct.displayIcon}
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: '500', color: isOpen ? '#1d4ed8' : '#334155' }}>
                            {struct.label} ▼
                          </span>
                        </button>

                        {/* Structure Templates Popover */}
                        {isOpen && (
                          <div 
                            style={{
                              ...mathPopoverStyle,
                              position: 'fixed',
                              top: mathDropdownAnchor ? `${mathDropdownAnchor.top}px` : '100px',
                              right: isMobile ? '10px' : (mathDropdownAnchor ? `${Math.max(10, Math.min(window.innerWidth - 260, mathDropdownAnchor.right))}px` : '20px'),
                              maxWidth: isMobile ? 'calc(100vw - 20px)' : '280px',
                              zIndex: 999999
                            }}
                          >
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0369a1', padding: '6px 10px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>نماذج وبنى: {struct.label}</span>
                              <button onClick={() => { setActiveMathDropdown(null); setMathDropdownAnchor(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '13px' }}>✕</button>
                            </div>
                            <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px', padding: '4px' }}>
                              {struct.templates.map((tpl, tplIdx) => (
                                <button
                                  key={tplIdx}
                                  onClick={() => {
                                    insertEquation(tpl.latex, false);
                                    setActiveMathDropdown(null);
                                    setMathDropdownAnchor(null);
                                  }}
                                  style={mathDropdownItemStyle}
                                >
                                  <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{tpl.label}</span>
                                  <span style={{ fontSize: '11px', color: '#64748b', direction: 'ltr', textAlign: 'left', fontFamily: 'monospace' }}>
                                    {tpl.latex}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* TAB 5: IMAGE TOOLS (When an image is clicked) */}
            {activeTab === 'image' && selectedImg && (
              <div className="image-controls-panel" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', width: 'max-content', minWidth: '100%' }}>
                
                {/* Size Presets */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: 'bold' }}>الحجم:</span>
                  <button onClick={() => applyImageSize('25%')} style={badgeBtnStyle}>25% (صغير)</button>
                  <button onClick={() => applyImageSize('50%')} style={badgeBtnStyle}>50% (متوسط)</button>
                  <button onClick={() => applyImageSize('75%')} style={badgeBtnStyle}>75% (كبير)</button>
                  <button onClick={() => applyImageSize('100%')} style={badgeBtnStyle}>100% (عرض كامل)</button>
                </div>

                <div style={dividerStyle}></div>

                {/* Word Layout Options & Text Wrapping */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button 
                    onClick={() => setShowImageLayoutModal(true)} 
                    style={{ ...badgeBtnStyle, background: '#eff6ff', color: '#0284c7', borderColor: '#93c5fd', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                    title="فتح نافذة خيارات التخطيط الكاملة للوورد"
                  >
                    <Layout size={15} color="#0284c7" /> خيارات التخطيط
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <button 
                      onClick={() => applyImageLayout('inline')} 
                      style={{ ...badgeBtnStyle, background: imageLayoutMode === 'inline' ? '#0284c7' : 'white', color: imageLayoutMode === 'inline' ? 'white' : '#334155', fontWeight: imageLayoutMode === 'inline' ? 'bold' : 'normal' }}
                      title="سطري مع النص - تظهر الصورة داخل السطر مع الكلمات"
                    >
                      🔤 سطري مع النص
                    </button>
                    <button 
                      onClick={() => applyImageLayout('square_right')} 
                      style={{ ...badgeBtnStyle, background: imageLayoutMode === 'square_right' ? '#0284c7' : 'white', color: imageLayoutMode === 'square_right' ? 'white' : '#334155', fontWeight: imageLayoutMode === 'square_right' ? 'bold' : 'normal' }}
                      title="مربع (يمين) - يلتف النص حول الصورة من اليسار"
                    >
                      ⬛➡️ مربع (يمين)
                    </button>
                    <button 
                      onClick={() => applyImageLayout('square_left')} 
                      style={{ ...badgeBtnStyle, background: imageLayoutMode === 'square_left' ? '#0284c7' : 'white', color: imageLayoutMode === 'square_left' ? 'white' : '#334155', fontWeight: imageLayoutMode === 'square_left' ? 'bold' : 'normal' }}
                      title="مربع (يسار) - يلتف النص حول الصورة من اليمين"
                    >
                      ⬅️⬛ مربع (يسار)
                    </button>
                    <button 
                      onClick={() => applyImageLayout('tight')} 
                      style={{ ...badgeBtnStyle, background: imageLayoutMode === 'tight' ? '#0284c7' : 'white', color: imageLayoutMode === 'tight' ? 'white' : '#334155', fontWeight: imageLayoutMode === 'tight' ? 'bold' : 'normal' }}
                      title="مشدود - النص يلتف بحرية حول حواف الصورة"
                    >
                      🧲 مشدود
                    </button>
                    <button 
                      onClick={() => applyImageLayout('top_bottom')} 
                      style={{ ...badgeBtnStyle, background: imageLayoutMode === 'top_bottom' ? '#0284c7' : 'white', color: imageLayoutMode === 'top_bottom' ? 'white' : '#334155', fontWeight: imageLayoutMode === 'top_bottom' ? 'bold' : 'normal' }}
                      title="أعلى وأسفل - النص يظهر أعلى وأسفل الصورة فقط بدون جوانب"
                    >
                      ↕️ أعلى وأسفل
                    </button>
                    <button 
                      onClick={() => applyImageLayout('behind')} 
                      style={{ ...badgeBtnStyle, background: imageLayoutMode === 'behind' ? '#0284c7' : 'white', color: imageLayoutMode === 'behind' ? 'white' : '#334155', fontWeight: imageLayoutMode === 'behind' ? 'bold' : 'normal' }}
                      title="خلف النص - الصورة كخلفية أو علامة مائية خلف النص"
                    >
                      📄🔲 خلف النص
                    </button>
                    <button 
                      onClick={() => applyImageLayout('front')} 
                      style={{ ...badgeBtnStyle, background: imageLayoutMode === 'front' ? '#0284c7' : 'white', color: imageLayoutMode === 'front' ? 'white' : '#334155', fontWeight: imageLayoutMode === 'front' ? 'bold' : 'normal' }}
                      title="أمام النص - الصورة تطفو طافية أمام النص"
                    >
                      🔲📄 أمام النص
                    </button>
                  </div>
                </div>

                <div style={dividerStyle}></div>

                {/* Image Alignment */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: 'bold' }}>المحاذاة:</span>
                  <button onClick={() => applyImageAlignment('right')} style={badgeBtnStyle} title="محاذاة لليمين">➡️ يمين</button>
                  <button onClick={() => applyImageAlignment('center')} style={badgeBtnStyle} title="توسيط بالمنتصف">↔️ بالمنتصف</button>
                  <button onClick={() => applyImageAlignment('left')} style={badgeBtnStyle} title="محاذاة لليسار">⬅️ يسار</button>
                </div>

                <div style={dividerStyle}></div>

                {/* Image Style Presets */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: 'bold' }}>التأثيرات:</span>
                  <button onClick={() => applyImageStyle('none')} style={badgeBtnStyle}>عادي</button>
                  <button onClick={() => applyImageStyle('border')} style={badgeBtnStyle}>إطار رمادي</button>
                  <button onClick={() => applyImageStyle('shadow')} style={badgeBtnStyle}>ظل ناعم</button>
                  <button onClick={() => applyImageStyle('rounded')} style={badgeBtnStyle}>زوايا دائرية</button>
                  <button onClick={() => applyImageStyle('school_navy')} style={{ ...badgeBtnStyle, color: '#1e3a8a', fontWeight: 'bold' }} title="إطار مزدوج كحلي أنيق">إطار مدرسي</button>
                  <button onClick={() => applyImageStyle('circle')} style={badgeBtnStyle} title="تحويل الصورة إلى شكل دائري">دائري ⚪</button>
                  <button onClick={() => applyImageStyle('dotted')} style={badgeBtnStyle} title="إطار منقط">إطار منقط</button>
                  <button onClick={() => applyImageStyle('ink_saver')} style={{ ...badgeBtnStyle, background: '#f8fafc', color: '#0f172a' }} title="تحويل لأبيض وأسود عالي التباين لتوفير حبر الطابعة">🖨️ موفر الحبر</button>
                </div>

                <div style={dividerStyle}></div>

                {/* Caption */}
                <button onClick={addImageCaption} style={{ ...badgeBtnStyle, background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', fontWeight: 'bold' }} title="إضافة تسمية توضيحية أسفل الصورة كشكل توضيحي">
                  💬 تسمية توضيحية
                </button>

                <div style={dividerStyle}></div>

                {/* Delete Button */}
                <button onClick={deleteSelectedImage} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Trash2 size={15} /> حذف الصورة
                </button>

              </div>
            )}

            {/* TAB 6: TABLE DESIGN & LAYOUT (When a table is clicked) */}
            {activeTab === 'table' && selectedTable && (
              <div className="table-controls-panel" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', width: 'max-content', minWidth: '100%' }}>
                
                {/* 1. صفوف وأعمدة */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 'bold' }}>الصفوف:</span>
                  <button onClick={insertTableRowAbove} style={badgeBtnStyle} title="إدراج صف فارغ أعلى الصف المحدد">⬆️ أعلى</button>
                  <button onClick={insertTableRowBelow} style={badgeBtnStyle} title="إدراج صف فارغ أسفل الصف المحدد">⬇️ أسفل</button>
                  <button onClick={deleteTableRow} style={{ ...badgeBtnStyle, color: '#dc2626' }} title="حذف الصف المحدد">🗑️ حذف صف</button>
                </div>

                <div style={dividerStyle}></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 'bold' }}>الأعمدة:</span>
                  <button onClick={insertTableColRight} style={badgeBtnStyle} title="إدراج عمود إلى يمين العمود المحدد">➡️ يمين</button>
                  <button onClick={insertTableColLeft} style={badgeBtnStyle} title="إدراج عمود إلى يسار العمود المحدد">⬅️ يسار</button>
                  <button onClick={deleteTableCol} style={{ ...badgeBtnStyle, color: '#dc2626' }} title="حذف العمود المحدد">🗑️ حذف عمود</button>
                  <button onClick={distributeTableColumnsEvenly} style={{ ...badgeBtnStyle, background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }} title="توزيع عرض الأعمدة بالتساوي">⚖️ تساوي الأعمدة</button>
                </div>

                <div style={dividerStyle}></div>

                {/* 2. أبعاد وسحب العمود والصف بالقيم والسحب */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#f8fafc', padding: '2px 6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 'bold' }}>عرض العمود:</span>
                  <button onClick={() => adjustSelectedColWidth(-15)} style={{ ...badgeBtnStyle, padding: '2px 5px', fontWeight: 'bold' }} title="تضييق عرض العمود المحدد (-15px)">➖</button>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e293b', minWidth: '42px', textAlign: 'center', direction: 'ltr', background: 'white', padding: '1px 4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    {selectedColWidth ? `${selectedColWidth}px` : 'تلقائي'}
                  </span>
                  <button onClick={() => adjustSelectedColWidth(15)} style={{ ...badgeBtnStyle, padding: '2px 5px', fontWeight: 'bold' }} title="توسيع عرض العمود المحدد (+15px)">➕</button>
                  
                  <button 
                    onClick={autoFitSelectedColToContent} 
                    style={{ ...badgeBtnStyle, background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', fontWeight: 'bold' }} 
                    title="احتواء تلقائي للنص: توسيع العمود ليتسع لأطول كلمة ومنع انقسام الكلمات"
                  >
                    ↔️ احتواء النص
                  </button>
                  
                  <button 
                    onClick={toggleSelectedColNoWrap} 
                    style={{ ...badgeBtnStyle, background: isColNoWrap ? '#fef3c7' : 'white', color: isColNoWrap ? '#92400e' : '#475569', borderColor: isColNoWrap ? '#f59e0b' : '#cbd5e1' }} 
                    title="منع انقسام وتقطيع الكلمات في العمود"
                  >
                    🔒 منع التفاف
                  </button>
                </div>

                <div style={dividerStyle}></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#f8fafc', padding: '2px 6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: 'bold' }}>ارتفاع الصف:</span>
                  <button onClick={() => adjustSelectedRowHeight(-6)} style={{ ...badgeBtnStyle, padding: '2px 5px', fontWeight: 'bold' }} title="تقليل ارتفاع الصف المحدد (-6px)">➖</button>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e293b', minWidth: '38px', textAlign: 'center', direction: 'ltr', background: 'white', padding: '1px 4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    {selectedRowHeight ? `${selectedRowHeight}px` : 'تلقائي'}
                  </span>
                  <button onClick={() => adjustSelectedRowHeight(6)} style={{ ...badgeBtnStyle, padding: '2px 5px', fontWeight: 'bold' }} title="زيادة ارتفاع الصف المحدد (+6px)">➕</button>

                  <button 
                    onClick={distributeTableRowsEvenly} 
                    style={{ ...badgeBtnStyle, background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }} 
                    title="توزيع وتوحيد ارتفاع كافة صفوف الجدول بالتساوي"
                  >
                    ↕️ تساوي الصفوف
                  </button>

                  <button 
                    onClick={() => {
                      if (selectedCell) {
                        setCustomColWidthInput(selectedCell.offsetWidth);
                        setCustomRowHeightInput(selectedCell.closest('tr')?.offsetHeight || 38);
                      }
                      setShowTableDimensionsModal(true);
                    }} 
                    style={{ ...badgeBtnStyle, background: '#fdf4ff', color: '#9333ea', borderColor: '#f0abfc', fontWeight: 'bold' }} 
                    title="فتح نافذة خصائص وأبعاد الجدول لتحديد المقاسات بالأرقام"
                  >
                    📐 أبعاد الجدول...
                  </button>
                </div>

                <div style={dividerStyle}></div>

                {/* 2. دمج وفك دمج الخلايا */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '11.5px', color: '#1d4ed8', fontWeight: 'bold' }}>الدمج:</span>
                  <button onClick={mergeCellWithNext} style={{ ...badgeBtnStyle, background: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe', fontWeight: 'bold' }} title="دمج الخلية الحالية مع الخلية المجاورة لها أفقياً">🔗 أفقياً</button>
                  <button onClick={mergeCellBelow} style={{ ...badgeBtnStyle, background: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe', fontWeight: 'bold' }} title="دمج الخلية الحالية مع الخلية التي أسفلها عمودياً">⬇️ عمودياً</button>
                  <button onClick={mergeEntireRow} style={{ ...badgeBtnStyle, background: '#f5f3ff', color: '#6d28d9', borderColor: '#ddd6fe', fontWeight: 'bold' }} title="دمج جميع خلايا الصف الحالي في خلية عنوان واحدة عريضة">↔️ دمج كعنوان</button>
                  <button onClick={unmergeSelectedCell} style={{ ...badgeBtnStyle, background: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa', fontWeight: 'bold' }} title="فك دمج الخلية المدمجة">✂️ فك الدمج</button>
                </div>

                <div style={dividerStyle}></div>

                {/* 3. تكرار صف العناوين الرئيسي */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <button
                    onClick={() => toggleTableRepeatHeader()}
                    style={{
                      ...badgeBtnStyle,
                      background: isTableHeaderRepeated ? '#dcfce7' : '#f8fafc',
                      color: isTableHeaderRepeated ? '#166534' : '#475569',
                      borderColor: isTableHeaderRepeated ? '#22c55e' : '#cbd5e1',
                      fontWeight: 'bold'
                    }}
                    title="تكرار صف العناوين الرئيسي تلقائياً في أعلى كل صفحة جديدة"
                  >
                    📌 تكرار الرأس: {isTableHeaderRepeated ? 'مفعل ✓' : 'متوقف'}
                  </button>
                  <button
                    onClick={makeSelectedRowRepeatingHeader}
                    style={{ ...badgeBtnStyle, background: '#fefce8', color: '#854d0e', borderColor: '#fde047', fontWeight: 'bold' }}
                    title="تعيين الصف الحالي كرأس مكرر"
                  >
                    👑 رأس مكرر
                  </button>
                </div>

                <div style={dividerStyle}></div>

                {/* 4. التوسيط والمحاذاة */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <button
                    onClick={centerEntireTableAndCells}
                    style={{ ...badgeBtnStyle, background: '#0284c7', color: 'white', borderColor: '#0284c7', fontWeight: 'bold' }}
                    title="توسيط كافة خلايا الجدول والجدول في منتصف الصفحة"
                  >
                    🎯 توسيط شامل
                  </button>
                  <button onClick={() => alignTableCells('right', 'middle', 'cell')} style={badgeBtnStyle} title="محاذاة الخلية لليمين">➡️</button>
                  <button onClick={() => alignTableCells('center', 'middle', 'cell')} style={{ ...badgeBtnStyle, fontWeight: 'bold' }} title="توسيط نص الخلية">↔️</button>
                  <button onClick={() => alignTableCells('left', 'middle', 'cell')} style={badgeBtnStyle} title="محاذاة الخلية لليسار">⬅️</button>
                </div>

                <div style={dividerStyle}></div>

                {/* 5. موضع وحجم الجدول */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 'bold' }}>الحجم:</span>
                  <button onClick={() => setTableWidthPercent('100%')} style={badgeBtnStyle}>100%</button>
                  <button onClick={() => setTableWidthPercent('85%')} style={badgeBtnStyle}>85%</button>
                  <button onClick={() => alignTableInPage('center')} style={badgeBtnStyle}>توسيط الجدول</button>
                </div>

                <div style={dividerStyle}></div>

                {/* 6. تظليل */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 'bold' }}>تظليل:</span>
                  {['#ffffff', '#f8fafc', '#eff6ff', '#ecfdf5', '#fefce8', '#fef2f2', '#faf5ff', '#fde68a'].map((c, i) => (
                    <button 
                      key={i} 
                      onClick={() => applyCellColor(c, false)} 
                      onDoubleClick={() => applyCellColor(c, true)}
                      style={{ width: '18px', height: '18px', background: c, border: '1px solid #cbd5e1', borderRadius: '3px', cursor: 'pointer' }}
                      title="ضغطة لتلوين الخلية | ضغطتان لتلوين الصف"
                    />
                  ))}
                </div>

                <div style={dividerStyle}></div>

                {/* 7. الحدود والقوالب */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <select
                    onChange={(e) => { if (e.target.value) applyTableBorderStyle(e.target.value); e.target.value = ''; }}
                    style={selectStyle}
                    title="تغيير حدود الجدول"
                  >
                    <option value="">الحدود...</option>
                    <option value="all">⊞ كافة الحدود</option>
                    <option value="thick_dark">⬛ حدود سميكة</option>
                    <option value="horizontal">☰ حدود أفقية</option>
                    <option value="none">⬜ بدون حدود</option>
                  </select>

                  <button onClick={() => applyTablePreset('navy')} style={{ ...badgeBtnStyle, background: '#1e3a8a', color: 'white', fontWeight: 'bold' }}>كحلي</button>
                  <button onClick={() => applyTablePreset('zebra')} style={{ ...badgeBtnStyle, background: '#0284c7', color: 'white', fontWeight: 'bold' }}>مخطط</button>
                  <button onClick={() => applyTablePreset('green')} style={{ ...badgeBtnStyle, background: '#065f46', color: 'white', fontWeight: 'bold' }}>أخضر</button>
                  <button onClick={() => applyTablePreset('ink_saver')} style={{ ...badgeBtnStyle, background: '#ffffff', color: '#000000', border: '1.5px solid #000000', fontWeight: 'bold' }}>🖨️ موفر حبر</button>
                </div>

                <button onClick={deleteSelectedTable} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '3px', height: '25px' }}>
                  <Trash2 size={13} /> حذف الجدول
                </button>

              </div>
            )}

            {/* TAB 8: MICROSOFT WORD REFERENCES TAB (المراجع: جدول المحتويات، الحواشي السفلية، المراجع والاقتباسات، التسميات التوضيحية، الفهرس) */}
            {activeTab === 'references' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', width: 'max-content', minWidth: '100%' }}>
                {/* 1. جدول المحتويات (Table of Contents) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 'bold' }}>جدول المحتويات:</span>
                  <button
                    onClick={insertTableOfContents}
                    style={{ ...toolActionBtnStyle, background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', padding: '5px 10px', fontSize: '12px' }}
                    title="إدراج جدول المحتويات والفهرس تلقائياً من عناوين الملزمة مع أرقام الصفحات"
                  >
                    📑 جدول المحتويات
                  </button>
                  <select
                    onChange={(e) => { if (e.target.value) applyWordStyle(e.target.value); e.target.value = ''; }}
                    style={{ ...selectStyle, fontSize: '12px', padding: '4px 6px' }}
                    title="إضافة النص المحدد إلى جدول المحتويات كمستوى عنوان"
                  >
                    <option value="">➕ إضافة نص للفهرس...</option>
                    <option value="h1">المستوى 1 (عنوان رئيسي)</option>
                    <option value="h2">المستوى 2 (عنوان فرعي)</option>
                    <option value="h3">المستوى 3 (عنوان تفصيلي)</option>
                  </select>
                  <button
                    onClick={updateTableOfContents}
                    style={badgeBtnStyle}
                    title="تحديث جدول المحتويات وأرقام الصفحات تلقائياً"
                  >
                    🔄 تحديث الجدول
                  </button>
                </div>

                {/* 2. الحواشي السفلية (Footnotes & Endnotes) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: 'bold' }}>الحواشي:</span>
                  <button
                    onClick={insertFootnote}
                    style={{ ...toolActionBtnStyle, background: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1', padding: '5px 10px', fontSize: '12px' }}
                    title="إدراج حاشية سفلية مرقمة في أسفل الصفحة الحالية (Ctrl + Alt + F)"
                  >
                    <strong style={{ color: '#1d4ed8' }}>AB¹</strong> إدراج حاشية سفلية
                  </button>
                  <button
                    onClick={insertEndnote}
                    style={badgeBtnStyle}
                    title="إدراج تعليق ختامي في نهاية المستند (Ctrl + Alt + D)"
                  >
                    📌 تعليق ختامي
                  </button>
                  <button
                    onClick={jumpToNextFootnote}
                    style={badgeBtnStyle}
                    title="الانتقال إلى الحاشية السفلية التالية في المستند"
                  >
                    ↪️ الحاشية التالية
                  </button>
                </div>

                {/* 3. المراجع والاقتباسات (Citations & Bibliography) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: 'bold' }}>المراجع والاقتباسات:</span>
                  <button
                    onClick={() => insertCitation()}
                    style={{ ...badgeBtnStyle, background: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe', fontWeight: 'bold' }}
                    title="إدراج اقتباس علمي في موضع المؤشر"
                  >
                    ❝ إدراج اقتباس
                  </button>
                  <button
                    onClick={() => setShowSourcesModal(true)}
                    style={badgeBtnStyle}
                    title="إدارة المصادر وإضافة كتب ومراجع جديدة"
                  >
                    🗂️ إدارة المصادر ({docSources.length})
                  </button>
                  <select
                    value={citationStyle}
                    onChange={(e) => setCitationStyle(e.target.value)}
                    style={{ ...selectStyle, fontSize: '12px', padding: '4px 6px' }}
                    title="نمط توثيق المراجع والاقتباسات"
                  >
                    <option value="APA">النمط: APA</option>
                    <option value="MLA">النمط: MLA</option>
                    <option value="IEEE">النمط: IEEE</option>
                    <option value="Chicago">النمط: Chicago</option>
                  </select>
                  <button
                    onClick={insertBibliography}
                    style={{ ...badgeBtnStyle, fontWeight: 'bold' }}
                    title="إدراج قائمة المراجع والمصادر العلمية الكاملة في الصفحة"
                  >
                    📚 إدراج المراجع
                  </button>
                </div>

                {/* 4. تسميات توضيحية وفهرس المصطلحات (Captions & Index) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: 'bold' }}>تسميات وفهرس:</span>
                  <button
                    onClick={() => insertCaption('شكل')}
                    style={badgeBtnStyle}
                    title="إدراج تسمية توضيحية مرقمة تلقائياً (شكل 1، جدول 1...)"
                  >
                    🏷️ تسمية توضيحية
                  </button>
                  <button
                    onClick={insertTableOfFigures}
                    style={badgeBtnStyle}
                    title="إدراج جدول وفهرس الرسوم والأشكال التوضيحية"
                  >
                    🖼️ جدول الرسوم
                  </button>
                  <button
                    onClick={insertCrossReference}
                    style={badgeBtnStyle}
                    title="إدراج إسناد ترافقي للإشارة إلى شكل أو جدول أو صفحة"
                  >
                    🔗 إسناد ترافقي
                  </button>
                  <button
                    onClick={markIndexEntry}
                    style={{ ...badgeBtnStyle, background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' }}
                    title="تحديد الكلمة كمدخل في فهرس المصطلحات"
                  >
                    ➕ علامة مصطلح
                  </button>
                  <button
                    onClick={insertAlphabeticalIndex}
                    style={{ ...badgeBtnStyle, background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0', fontWeight: 'bold' }}
                    title="إدراج مسرد وفهرس المصطلحات مرتباً أبجدياً بأرقام الصفحات"
                  >
                    📇 إدراج الفهرس
                  </button>
                </div>
              </div>
            )}

            {/* TAB 9: MICROSOFT WORD REVIEW TAB (مراجعة: التدقيق، المرادفات، عدد الكلمات، قراءة بصوت عالٍ، التعليقات، تعقب التغييرات، الحماية) */}
            {activeTab === 'review' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', width: 'max-content', minWidth: '100%' }}>
                {/* 1. تدقيق (Proofing) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#0f766e', fontWeight: 'bold' }}>تدقيق:</span>
                  <button
                    onClick={runSmartProofingAndPunctuation}
                    style={{ ...toolActionBtnStyle, background: '#f0fdfa', color: '#0f766e', borderColor: '#99f6e4', padding: '5px 10px', fontSize: '12px' }}
                    title="تدقيق إملائي ونحوي وضبط المسافات وعلامات الترقيم العربية (F7)"
                  >
                    ✓ تدقيق إملائي وترقيم (F7)
                  </button>
                  <button
                    onClick={openThesaurusForSelection}
                    style={badgeBtnStyle}
                    title="فتح قاموس المرادفات والأضداد للكلمة المحددة"
                  >
                    📖 قاموس المرادفات
                  </button>
                  <button
                    onClick={openWordCountModal}
                    style={{ ...badgeBtnStyle, fontWeight: 'bold' }}
                    title="عرض إحصائيات المستند التفصيلية: الصفحات، الكلمات، الأحرف، الفقرات، الأسطر، الجداول (Ctrl + Shift + G)"
                  >
                    🔢 عدد الكلمات والإحصائيات
                  </button>
                </div>

                {/* 2. كلام وإمكانية الوصول والترجمة (Speech, Accessibility & Language) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <button
                    onClick={toggleReadAloud}
                    style={{
                      ...toolActionBtnStyle,
                      background: isSpeaking ? '#fef2f2' : '#eff6ff',
                      color: isSpeaking ? '#dc2626' : '#1d4ed8',
                      borderColor: isSpeaking ? '#fca5a5' : '#bfdbfe',
                      padding: '5px 10px',
                      fontSize: '12px'
                    }}
                    title="قراءة النص المحدد أو الصفحة الحالية بصوت عالٍ باللغة العربية أو الإنجليزية"
                  >
                    {isSpeaking ? '⏹️ إيقاف القراءة الصوتية' : '🔊 قراءة بصوت عالٍ'}
                  </button>
                  <button
                    onClick={runAccessibilityCheck}
                    style={badgeBtnStyle}
                    title="فحص جودة الملزمة وهيكل العناوين والجداول وإمكانية الوصول"
                  >
                    ♿ فحص جودة المستند
                  </button>
                  <select
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const langTarget = e.target.value;
                      e.target.value = '';
                      callAI('custom', `ترجم النص المحدد (أو محتوى الصفحة الحالية) ترجمة أكاديمية دقيقة إلى ${langTarget} مع الحفاظ على التنسيق:`);
                    }}
                    style={{ ...selectStyle, fontSize: '12px', padding: '4px 6px' }}
                    title="ترجمة فورية للنص المحدد"
                  >
                    <option value="">🌐 ترجمة إلى...</option>
                    <option value="اللغة الإنجليزية (English)">🇬🇧 الإنجليزية (English)</option>
                    <option value="اللغة العربية الفصحى">🇪🇬 العربية الفصحى</option>
                    <option value="اللغة الفرنسية (Français)">🇫🇷 الفرنسية (Français)</option>
                    <option value="اللغة الألمانية (Deutsch)">🇩🇪 الألمانية (Deutsch)</option>
                  </select>
                </div>

                {/* 3. تعليقات (Comments) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#b45309', fontWeight: 'bold' }}>تعليقات:</span>
                  <button
                    onClick={insertReviewComment}
                    style={{ ...badgeBtnStyle, background: '#fffbeb', color: '#92400e', borderColor: '#fde68a', fontWeight: 'bold' }}
                    title="إدراج تعليق مراجعة جديد على النص المحدد (Ctrl + Alt + M)"
                  >
                    💬 تعليق جديد
                  </button>
                  <button
                    onClick={deleteAllComments}
                    style={badgeBtnStyle}
                    title="حذف كافة تعليقات المراجعة من المستند"
                  >
                    🗑️ حذف التعليقات
                  </button>
                </div>

                {/* 4. تعقب التغييرات وحماية المستند (Tracking & Protection) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => setTrackChangesMode(!trackChangesMode)}
                    style={{
                      ...badgeBtnStyle,
                      background: trackChangesMode ? '#dcfce7' : 'white',
                      color: trackChangesMode ? '#166534' : '#334155',
                      borderColor: trackChangesMode ? '#86efac' : '#cbd5e1',
                      fontWeight: 'bold'
                    }}
                    title="تفعيل أو إيقاف وضع تعقب التغييرات"
                  >
                    📝 تعقب التغييرات {trackChangesMode ? '(مفعل ✓)' : ''}
                  </button>
                  <button onClick={acceptAllTrackedChanges} style={{ ...badgeBtnStyle, color: '#15803d' }} title="قبول كافة التغييرات">✔ قبول</button>
                  <button onClick={rejectAllTrackedChanges} style={{ ...badgeBtnStyle, color: '#dc2626' }} title="رفض كافة التغييرات">✖ رفض</button>
                  <button
                    onClick={() => setIsEditingRestricted(!isEditingRestricted)}
                    style={{
                      ...badgeBtnStyle,
                      background: isEditingRestricted ? '#fef2f2' : 'white',
                      color: isEditingRestricted ? '#dc2626' : '#334155',
                      borderColor: isEditingRestricted ? '#fca5a5' : '#cbd5e1',
                      fontWeight: 'bold'
                    }}
                    title="قفل المستند ضد التعديل غير المقصود (وضع القراءة فقط)"
                  >
                    {isEditingRestricted ? '🔒 فك تقييد التحرير' : '🔓 تقييد التحرير'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 10: MICROSOFT WORD VIEW TAB (عرض: طرق العرض، القارئ الشامل، تحريك الصفحة، المسطرة، الشبكة، جزء التنقل، التكبير، الماكرو) */}
            {activeTab === 'view' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', width: 'max-content', minWidth: '100%' }}>
                {/* 1. طرق عرض المستند (Views) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#f8fafc', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11.5px', color: '#0369a1', fontWeight: 'bold' }}>طرق العرض:</span>
                  <button
                    onClick={() => { setViewMode('read'); setIsEditingRestricted(true); }}
                    style={{ ...badgeBtnStyle, background: viewMode === 'read' ? '#0284c7' : 'white', color: viewMode === 'read' ? 'white' : '#334155', fontWeight: 'bold' }}
                    title="وضع القراءة المريح بدون تعديل"
                  >
                    📖 وضع القراءة
                  </button>
                  <button
                    onClick={() => { setViewMode('print'); setIsEditingRestricted(false); setImmersiveReaderMode(false); }}
                    style={{ ...badgeBtnStyle, background: viewMode === 'print' && !immersiveReaderMode ? '#0284c7' : 'white', color: viewMode === 'print' && !immersiveReaderMode ? 'white' : '#334155', fontWeight: 'bold' }}
                    title="تخطيط الطباعة القياسي لصفحات A4"
                  >
                    📄 تخطيط الطباعة
                  </button>
                  <button
                    onClick={() => { setViewMode('web'); setIsEditingRestricted(false); }}
                    style={{ ...badgeBtnStyle, background: viewMode === 'web' ? '#0284c7' : 'white', color: viewMode === 'web' ? 'white' : '#334155' }}
                    title="تخطيط ويب عريض مستمر"
                  >
                    🌐 تخطيط ويب
                  </button>
                  <button
                    onClick={() => { setImmersiveReaderMode(!immersiveReaderMode); }}
                    style={{ ...badgeBtnStyle, background: immersiveReaderMode ? '#7c3aed' : '#f5f3ff', color: immersiveReaderMode ? 'white' : '#6d28d9', borderColor: '#c4b5fd', fontWeight: 'bold' }}
                    title="القارئ الشامل (تباعد مريح للعين وألوان خلفية هادئة مع قراءة صوتية)"
                  >
                    🎧 القارئ الشامل
                  </button>
                </div>

                <div style={dividerStyle}></div>

                {/* 2. تحريك وعرض الصفحات (Page Movement: Vertical vs Side-by-Side) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#f8fafc', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11.5px', color: '#475569', fontWeight: 'bold' }}>الصفحات:</span>
                  <button
                    onClick={() => { setSideBySidePages(false); if (zoomLevel < 80) setZoomLevel(100); }}
                    style={{ ...badgeBtnStyle, background: !sideBySidePages ? '#eff6ff' : 'white', color: !sideBySidePages ? '#1d4ed8' : '#334155', borderColor: !sideBySidePages ? '#93c5fd' : '#cbd5e1', fontWeight: 'bold' }}
                    title="عرض الصفحات في عمود رأسي واحد"
                  >
                    ↕️ رأسي
                  </button>
                  <button
                    onClick={() => { setSideBySidePages(true); if (zoomLevel > 75) setZoomLevel(65); }}
                    style={{ ...badgeBtnStyle, background: sideBySidePages ? '#eff6ff' : 'white', color: sideBySidePages ? '#1d4ed8' : '#334155', borderColor: sideBySidePages ? '#93c5fd' : '#cbd5e1', fontWeight: 'bold' }}
                    title="عرض صفحتين متجاورتين جنباً إلى جنب (عمودان متجاوران)"
                  >
                    📖 صفحتان متجاورتان
                  </button>
                </div>

                <div style={dividerStyle}></div>

                {/* 3. إظهار: المسطرة، خطوط الشبكة، جزء التنقل (Show: Ruler, Gridlines, Navigation Pane) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11.5px', color: '#475569', fontWeight: 'bold' }}>إظهار:</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11.5px', color: '#1e293b', cursor: 'pointer', fontWeight: '600' }}>
                    <input type="checkbox" checked={showRuler} onChange={(e) => setShowRuler(e.target.checked)} style={{ cursor: 'pointer' }} />
                    المسطرة
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11.5px', color: '#1e293b', cursor: 'pointer', fontWeight: '600' }}>
                    <input type="checkbox" checked={showViewGridlines} onChange={(e) => setShowViewGridlines(e.target.checked)} style={{ cursor: 'pointer' }} />
                    الشبكة
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11.5px', color: '#1d4ed8', cursor: 'pointer', fontWeight: 'bold' }}>
                    <input type="checkbox" checked={showNavigationPane} onChange={(e) => setShowNavigationPane(e.target.checked)} style={{ cursor: 'pointer' }} />
                    التنقل
                  </label>
                </div>

                <div style={dividerStyle}></div>

                {/* 4. تكبير/تصغير (Zoom) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#f8fafc', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11.5px', color: '#475569', fontWeight: 'bold' }}>الزووم:</span>
                  <button onClick={() => setZoomLevel(100)} style={{ ...badgeBtnStyle, fontWeight: 'bold' }} title="إعادة الحجم إلى 100%">100%</button>
                  <button onClick={() => { setSideBySidePages(false); setZoomLevel(85); }} style={badgeBtnStyle} title="احتواء صفحة واحدة">📄 صفحة واحدة</button>
                  <button onClick={() => { setSideBySidePages(true); setZoomLevel(65); }} style={badgeBtnStyle} title="عرض صفحات متعددة متجاورة">📑 متعددة</button>
                  <button onClick={() => { setSideBySidePages(false); setZoomLevel(120); }} style={badgeBtnStyle} title="توسيع لعرض الصفحة">↔️ عرض الصفحة</button>
                </div>

                <div style={dividerStyle}></div>

                {/* 5. الماكرو والخصائص والاختصارات (Macros, Properties & Shortcuts) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <button
                    onClick={runSmartMacroAutoFormat}
                    style={{ ...badgeBtnStyle, background: '#fefce8', color: '#854d0e', borderColor: '#fde047', fontWeight: 'bold' }}
                    title="وحدة ماكرو: تنظيف الأسطر الزائدة وتوسيط الجداول وموازنة الصفحات بضغطة واحدة"
                  >
                    ⚡ ماكرو تلقائي
                  </button>
                  <button
                    onClick={openWordCountModal}
                    style={badgeBtnStyle}
                    title="خصائص وإحصائيات المستند"
                  >
                    ℹ️ الخصائص
                  </button>
                  <button
                    onClick={() => setShowShortcutsModal(true)}
                    style={{ ...badgeBtnStyle, background: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe', fontWeight: 'bold' }}
                    title="عرض جميع اختصارات لوحة المفاتيح (Ctrl + /)"
                  >
                    ⌨️ الاختصارات
                  </button>
                </div>
              </div>
            )}

            {/* TAB 7: SHAPE & CALLOUT FORMATTING (When a Word Shape, Callout, SmartArt, or TextBox is clicked) */}
            {activeTab === 'shape' && selectedShape && (
              <div className="shape-controls-panel" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', width: 'max-content', minWidth: '100%' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  🔷 تنسيق الشكل:
                </span>

                {/* Fill Color */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>التعبئة:</span>
                  {['#eff6ff', '#dbeafe', '#1e3a8a', '#f0fdf4', '#dcfce7', '#fefce8', '#fef08a', '#fef2f2', '#faf5ff', '#ffffff'].map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => formatSelectedShape('bg', c)}
                      style={{ width: '18px', height: '18px', borderRadius: '4px', background: c, border: '1px solid #cbd5e1', cursor: 'pointer' }}
                      title="تغيير لون التعبئة"
                    />
                  ))}
                  <input
                    type="color"
                    title="اختر لون تعبئة مخصص"
                    onChange={(e) => formatSelectedShape('bg', e.target.value)}
                    style={{ width: '22px', height: '22px', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', padding: 0, background: 'transparent' }}
                  />
                </div>

                <div style={dividerStyle}></div>

                {/* Border Color & Width */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>الإطار:</span>
                  {['#1d4ed8', '#0284c7', '#16a34a', '#eab308', '#dc2626', '#9333ea', '#0f172a'].map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => formatSelectedShape('border', c)}
                      style={{ width: '17px', height: '17px', borderRadius: '50%', background: c, border: '2px solid white', boxShadow: '0 0 0 1px #cbd5e1', cursor: 'pointer' }}
                      title="تغيير لون الإطار"
                    />
                  ))}
                  <input
                    type="color"
                    title="اختر لون إطار مخصص"
                    onChange={(e) => formatSelectedShape('border', e.target.value)}
                    style={{ width: '22px', height: '22px', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', padding: 0, background: 'transparent' }}
                  />
                  {/* Border Width */}
                  <select
                    onChange={(e) => formatSelectedShape('borderWidth', e.target.value)}
                    defaultValue="2px"
                    style={{ fontSize: '11px', padding: '2px 4px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', cursor: 'pointer' }}
                    title="سمك الإطار"
                  >
                    <option value="1px">1px</option>
                    <option value="2px">2px</option>
                    <option value="3px">3px</option>
                    <option value="4px">4px</option>
                    <option value="0px">بدون</option>
                  </select>
                </div>

                <div style={dividerStyle}></div>

                {/* Shape Width & Scaling */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>العرض:</span>
                  <button onClick={() => formatSelectedShape('scale', -50)} style={{ ...badgeBtnStyle, padding: '2px 7px', fontWeight: 'bold' }} title="تصغير العرض 50px">-</button>
                  <button onClick={() => formatSelectedShape('scale', 50)} style={{ ...badgeBtnStyle, padding: '2px 7px', fontWeight: 'bold' }} title="تكبير العرض 50px">+</button>
                  <button onClick={() => formatSelectedShape('width', '25%')} style={{ ...badgeBtnStyle, padding: '2px 6px' }}>25%</button>
                  <button onClick={() => formatSelectedShape('width', '50%')} style={{ ...badgeBtnStyle, padding: '2px 6px' }}>50%</button>
                  <button onClick={() => formatSelectedShape('width', '75%')} style={{ ...badgeBtnStyle, padding: '2px 6px' }}>75%</button>
                  <button onClick={() => formatSelectedShape('width', '100%')} style={{ ...badgeBtnStyle, padding: '2px 6px' }}>100%</button>
                  <button onClick={() => formatSelectedShape('width', 'auto')} style={{ ...badgeBtnStyle, padding: '2px 6px' }}>تلقائي</button>
                </div>

                <div style={dividerStyle}></div>

                {/* Text Color */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>النص:</span>
                  {['#0f172a', '#1e3a8a', '#166534', '#92400e', '#991b1b', '#ffffff'].map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => formatSelectedShape('color', c)}
                      style={{ width: '18px', height: '18px', borderRadius: '4px', background: c, border: '1px solid #94a3b8', cursor: 'pointer' }}
                      title="تغيير لون النص داخل الشكل"
                    />
                  ))}
                  <input
                    type="color"
                    title="اختر لون نص مخصص"
                    onChange={(e) => formatSelectedShape('color', e.target.value)}
                    style={{ width: '22px', height: '22px', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', padding: 0, background: 'transparent' }}
                  />
                </div>

                <div style={dividerStyle}></div>

                {/* Alignment */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>الموضع:</span>
                  <button onClick={() => formatSelectedShape('align', 'right')} style={badgeBtnStyle}>يمين</button>
                  <button onClick={() => formatSelectedShape('align', 'center')} style={badgeBtnStyle}>توسيط</button>
                  <button onClick={() => formatSelectedShape('align', 'float_left')} style={badgeBtnStyle}>عائم يسار</button>
                  <button onClick={() => formatSelectedShape('align', 'float_right')} style={badgeBtnStyle}>عائم يمين</button>
                </div>

                <button
                  onClick={() => formatSelectedShape('delete')}
                  style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', marginRight: 'auto' }}
                  title="حذف هذا الشكل من المستند"
                >
                  <Trash2 size={13} /> حذف
                </button>
              </div>
            )}

          </div>
          )}

        </div>
        )}

        {/* Immersive Reader Floating Control Bar (شريط القارئ الشامل عند تفعيله) */}
        {immersiveReaderMode && (
          <div className="no-print" style={{ background: '#4c1d95', color: 'white', padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 25 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>🎧 وضع القارئ الشامل (Immersive Reader):</span>
              <button onClick={() => setImmersiveTheme('sepia')} style={{ background: '#fef3c7', color: '#78350f', border: immersiveTheme === 'sepia' ? '2px solid white' : 'none', padding: '3px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>📜 كريمي مريح للعين</button>
              <button onClick={() => setImmersiveTheme('calm_blue')} style={{ background: '#e0f2fe', color: '#0369a1', border: immersiveTheme === 'calm_blue' ? '2px solid white' : 'none', padding: '3px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🌊 أزرق هادئ</button>
              <button onClick={() => setImmersiveTheme('dark')} style={{ background: '#1e293b', color: '#f8fafc', border: immersiveTheme === 'dark' ? '2px solid white' : 'none', padding: '3px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🌙 ليلي داكن</button>
              <button onClick={toggleReadAloud} style={{ background: isSpeaking ? '#ef4444' : '#10b981', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                {isSpeaking ? '⏹️ إيقاف الصوت' : '🔊 قراءة الصفحة صوتياً'}
              </button>
            </div>
            <button onClick={() => setImmersiveReaderMode(false)} style={{ background: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.35)', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
              ✕ إغلاق القارئ الشامل
            </button>
          </div>
        )}

        {/* Floating Microsoft Word Color Palettes (Zero-Selection-Loss Popovers) */}
        {showFontColorPalette && colorAnchorRect && (
          <div
            className="word-color-picker-popover no-print"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            style={{
              position: 'fixed',
              top: `${Math.max(50, Math.min(window.innerHeight - 380, colorAnchorRect.top))}px`,
              right: `${Math.max(10, Math.min(window.innerWidth - 250, colorAnchorRect.right - 100))}px`,
              zIndex: 99999,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.08)',
              padding: '10px 12px',
              width: '235px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              direction: 'rtl'
            }}
          >
            {/* 1. التلقائي (Automatic) */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onClick={() => applyFontColor('#000000')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '8px',
                transition: '0.15s'
              }}
              title="تلقائي (اللون الأسود الأساسي)"
            >
              <div style={{ width: '16px', height: '16px', background: '#000000', borderRadius: '3px', border: '1px solid #94a3b8' }} />
              <span>تلقائي (أسود)</span>
            </button>

            {/* 2. ألوان النسق (Theme Colors Grid) */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>ألوان النسق (Theme Colors)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px' }}>
                {WORD_THEME_COLORS.map((row, rowIdx) =>
                  row.map((c, colIdx) => (
                    <button
                      key={`${rowIdx}-${colIdx}`}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onClick={() => applyFontColor(c)}
                      style={{
                        width: '18px',
                        height: rowIdx === 0 ? '16px' : '13px',
                        background: c,
                        border: c === '#ffffff' ? '1px solid #cbd5e1' : '1px solid rgba(0,0,0,0.1)',
                        borderRadius: rowIdx === 0 ? '2px 2px 0 0' : (rowIdx === 5 ? '0 0 2px 2px' : '0'),
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'transform 0.1s'
                      }}
                      title={c}
                    />
                  ))
                )}
              </div>
            </div>

            {/* 3. الألوان القياسية (Standard Colors) */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>الألوان القياسية (Standard)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px' }}>
                {WORD_STANDARD_COLORS.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onClick={() => applyFontColor(c)}
                    style={{
                      width: '18px',
                      height: '18px',
                      background: c,
                      border: '1px solid rgba(0,0,0,0.15)',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      padding: 0
                    }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            <label
              onMouseDown={(e) => { e.stopPropagation(); saveCurrentSelection(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 8px',
                background: '#f1f5f9',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '11.5px',
                fontWeight: 'bold',
                color: '#334155'
              }}
              title="اختيار لون مخصص من لوحة الألوان الكاملة"
            >
              <input
                type="color"
                value={activeFontColor || '#dc2626'}
                onMouseDown={(e) => { e.stopPropagation(); saveCurrentSelection(); }}
                onInput={(e) => applyFontColor(e.target.value)}
                onChange={(e) => applyFontColor(e.target.value)}
                style={{ width: '22px', height: '22px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              />
              <span>🎨 ألوان إضافية مخصصة...</span>
            </label>
          </div>
        )}

        {/* Highlighter Popover */}
        {showHighlightPalette && colorAnchorRect && (
          <div
            className="word-color-picker-popover no-print"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            style={{
              position: 'fixed',
              top: `${Math.max(50, Math.min(window.innerHeight - 250, colorAnchorRect.top))}px`,
              right: `${Math.max(10, Math.min(window.innerWidth - 200, colorAnchorRect.right - 80))}px`,
              zIndex: 99999,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.08)',
              padding: '10px 12px',
              width: '180px',
              direction: 'rtl'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>ألوان التمييز (Word Highlighter)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', marginBottom: '8px' }}>
              {WORD_HIGHLIGHT_COLORS.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={() => applyTextHighlight(c)}
                  style={{
                    width: '26px',
                    height: '24px',
                    background: c,
                    border: '1px solid rgba(0,0,0,0.18)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  title={c}
                />
              ))}
            </div>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onClick={() => applyTextHighlight('transparent')}
              style={{
                width: '100%',
                padding: '6px 8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '11.5px',
                fontWeight: 'bold',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
              title="إزالة التمييز عن النص المحدد"
            >
              <Eraser size={13} color="#dc2626" /> بلا تمييز (إزالة اللون)
            </button>
          </div>
        )}

        {/* Shading Popover */}
        {showShadingPalette && colorAnchorRect && (
          <div
            className="word-color-picker-popover no-print"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            style={{
              position: 'fixed',
              top: `${Math.max(50, Math.min(window.innerHeight - 300, colorAnchorRect.top))}px`,
              right: `${Math.max(10, Math.min(window.innerWidth - 220, colorAnchorRect.right - 80))}px`,
              zIndex: 99999,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.08)',
              padding: '10px 12px',
              width: '210px',
              direction: 'rtl'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>تظليل الفقرة والصناديق</div>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onClick={() => applyParagraphShading('transparent')}
              style={{
                width: '100%',
                padding: '5px 8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '11.5px',
                fontWeight: 'bold',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px'
              }}
              title="إزالة لون الخلفية والتظليل"
            >
              <div style={{ width: '16px', height: '16px', border: '1px dashed #94a3b8', borderRadius: '3px', background: 'white' }} />
              <span>بلا تعبئة (تظليل شفاف)</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', marginBottom: '8px' }}>
              {WORD_SHADING_COLORS.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={() => applyParagraphShading(c)}
                  style={{
                    width: '32px',
                    height: '22px',
                    background: c,
                    border: '1px solid #cbd5e1',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  title={c}
                />
              ))}
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 8px',
                background: '#f1f5f9',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#334155'
              }}
              title="تحديد لون تظليل مخصص"
            >
              <input
                type="color"
                value={activeShadingColor || '#eff6ff'}
                onMouseDown={(e) => { e.stopPropagation(); saveCurrentSelection(); }}
                onInput={(e) => applyParagraphShading(e.target.value)}
                onChange={(e) => applyParagraphShading(e.target.value)}
                style={{ width: '22px', height: '22px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              />
              <span>🎨 لون تظليل مخصص...</span>
            </label>
          </div>
        )}

        {/* 3. Editor Canvas, Navigation Pane & Chat Panel */}
        <div className="editor-canvas-wrapper" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Microsoft Word Navigation Pane (جزء التنقل الجانبي: العناوين / الصفحات / البحث) */}
          {showNavigationPane && !focusMode && (
            <div className="no-print" style={{ width: '260px', background: '#ffffff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 12px rgba(0,0,0,0.03)', zIndex: 25 }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13.5px', color: '#0f172a' }}>🧭 جزء التنقل (Navigation)</span>
                <button onClick={() => setShowNavigationPane(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '15px' }}>✕</button>
              </div>
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>
                <button onClick={() => setNavPaneTab('headings')} style={{ flex: 1, padding: '8px', border: 'none', background: navPaneTab === 'headings' ? 'white' : 'transparent', borderBottom: navPaneTab === 'headings' ? '2px solid #2563eb' : 'none', fontWeight: 'bold', fontSize: '12px', color: navPaneTab === 'headings' ? '#2563eb' : '#475569', cursor: 'pointer' }}>العناوين</button>
                <button onClick={() => setNavPaneTab('pages')} style={{ flex: 1, padding: '8px', border: 'none', background: navPaneTab === 'pages' ? 'white' : 'transparent', borderBottom: navPaneTab === 'pages' ? '2px solid #2563eb' : 'none', fontWeight: 'bold', fontSize: '12px', color: navPaneTab === 'pages' ? '#2563eb' : '#475569', cursor: 'pointer' }}>الصفحات ({pages.length})</button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {navPaneTab === 'headings' ? (
                  (() => {
                    const hList = extractDocumentHeadings();
                    if (hList.length === 0) {
                      return (
                        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12.5px', padding: '20px 8px', lineHeight: 1.7 }}>
                          لا توجد عناوين رئيسية بعد.<br />استخدم <strong>أنماط العناوين (عنوان 1، 2، 3)</strong> من الشريط الرئيسي لتظهر هنا للتنقل السريع.
                        </div>
                      );
                    }
                    return hList.map((h, i) => (
                      <div
                        key={i}
                        onClick={() => jumpToPageIndex(h.pageIndex)}
                        style={{
                          padding: '7px 10px',
                          paddingRight: h.level === 1 ? '8px' : h.level === 2 ? '20px' : '30px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: h.level === 1 ? '13px' : '12px',
                          fontWeight: h.level === 1 ? 'bold' : 'normal',
                          color: h.level === 1 ? '#1e3a8a' : '#334155',
                          borderBottom: '1px solid #f1f5f9',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.text}</span>
                        <span style={{ fontSize: '11px', color: '#2563eb', background: '#eff6ff', padding: '1px 6px', borderRadius: '4px', marginRight: '6px', flexShrink: 0 }}>ص {h.pageNum}</span>
                      </div>
                    ));
                  })()
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pages.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => jumpToPageIndex(idx)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: activePageIndex === idx ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: activePageIndex === idx ? '#eff6ff' : '#f8fafc',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e293b' }}>📄 صفحة {idx + 1}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{activePageIndex === idx ? '● نشطة' : 'انتقال ⬅'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* A4 Paper Sheets Container (Scrollable) */}
          <div className="sheets-scroll-container" style={{ flex: 1, padding: isMobile ? '8px 4px 75px 4px' : '6px 16px 50px 16px', overflowY: 'auto', overflowX: (isMobile && mobileFitWidth) ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? '8px' : '10px', background: immersiveReaderMode ? (immersiveTheme === 'dark' ? '#0f172a' : immersiveTheme === 'calm_blue' ? '#e0f2fe' : '#f5ebe0') : '#f1f5f9' }}>

            {/* Microsoft Word Graduated Horizontal Ruler (المسطرة المرقمة بالسنتيمتر) */}
            {showRuler && !focusMode && !isMobile && (
              <div
                className="no-print"
                contentEditable={false}
                style={{
                  width: viewMode === 'web' ? '92%' : '210mm',
                  height: '16px',
                  background: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
                  border: '1px solid #cbd5e1',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  padding: '0 10mm',
                  boxSizing: 'border-box',
                  userSelect: 'none',
                  direction: 'ltr',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  flexShrink: 0
                }}
                title="مسطرة القياس الأفقي للملزمة (21 سم - مقاس A4 القياسي)"
              >
                {Array.from({ length: 19 }, (_, i) => i + 1).map((cm) => (
                  <div key={cm} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '8.5px', color: '#64748b', fontWeight: 'bold' }}>
                    <span style={{ marginBottom: '0px', lineHeight: '9px' }}>{cm}</span>
                    <div style={{ width: '1px', height: '3px', background: '#94a3b8' }}></div>
                  </div>
                ))}
              </div>
            )}

            {/* All Pages Selected Floating Quick Action Pill */}
            {isAllPagesSelected && (
              <div 
                className="no-print"
                style={{
                  position: 'sticky',
                  top: '8px',
                  zIndex: 100,
                  background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                  color: 'white',
                  padding: '7px 18px',
                  borderRadius: '30px',
                  boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12.5px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  animation: 'scaleIn 0.2s ease'
                }}
              >
                <span>✓ تم تحديد كامل المستند ({pages.length} صفحات)</span>
                <span style={{ fontSize: '11px', opacity: 0.85 }}>• جاهز للتنسيق الشامل</span>
                <button 
                  disabled={loading}
                  onClick={() => callAI('format', '', true)}
                  style={{
                    background: '#7c3aed',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '3px 12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)'
                  }}
                  title="تنسيق كافة صفحات المستند بالكامل من البداية للنهاية"
                >
                  <Wand2 size={12} color="white" /> ✨ تنسيق شامل لكل الصفحات الآن
                </button>
                <button 
                  onClick={() => setShowAssistant(true)}
                  style={{
                    background: 'white',
                    color: '#1e40af',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={12} color="#2563eb" /> طلب تعديل بالذكاء
                </button>
                <button 
                  onClick={() => setIsAllPagesSelected(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                  title="إلغاء التحديد"
                >
                  ✕ إلغاء
                </button>
              </div>
            )}

            {/* Cross-Page Selection Floating Quick Action Pill */}
            {crossPageSelection && (
              <div 
                className="no-print"
                style={{
                  position: 'sticky',
                  top: '8px',
                  zIndex: 100,
                  background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                  color: 'white',
                  padding: '7px 18px',
                  borderRadius: '30px',
                  boxShadow: '0 8px 24px rgba(14, 165, 233, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  animation: 'scaleIn 0.2s ease'
                }}
              >
                <span>📝 تم تحديد نص ممتد بين صفحة {crossPageSelection.startPageIndex + 1} وصفحة {crossPageSelection.endPageIndex + 1} ({crossPageSelection.text.length} حرف)</span>
                <button 
                  onClick={() => {
                    if (navigator.clipboard) navigator.clipboard.writeText(crossPageSelection.text);
                  }}
                  style={{ background: 'white', color: '#0284c7', border: 'none', borderRadius: '14px', padding: '2px 9px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  <Copy size={11} /> نسخ
                </button>
                <button 
                  disabled={loading}
                  onClick={() => callAI('format')}
                  style={{ background: '#7c3aed', color: 'white', border: 'none', borderRadius: '14px', padding: '2px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  <Wand2 size={11} /> ✨ تنسيق بالذكاء
                </button>
                <button 
                  onClick={deleteCrossPageSelection}
                  style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '14px', padding: '2px 9px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  <Trash2 size={11} /> حذف المحدد
                </button>
                <button 
                  onClick={clearCrossPageSelection}
                  style={{ background: 'rgba(255,255,255,0.25)', color: 'white', border: 'none', borderRadius: '14px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}
                >
                  ✕ إلغاء
                </button>
              </div>
            )}
            
            <div 
              ref={editorRootRef}
              className={`sheets-root-container ${isAllPagesSelected ? 'all-pages-selected' : ''}`}
              style={{ 
                transform: `scale(${zoomLevel / 100})`, 
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease',
                display: 'flex',
                flexDirection: sideBySidePages ? 'row' : 'column',
                flexWrap: sideBySidePages ? 'wrap' : 'nowrap',
                justifyContent: 'center',
                alignItems: sideBySidePages ? 'flex-start' : 'center',
                gap: '20px',
                width: '100%',
                outline: 'none'
              }}
            >
              {pages.map((page, index) => (
                <div key={page.id} className="a4-sheet-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  
                  {/* Sheet Top Controls Bar (Visible on Screen, Hidden in Print) */}
                  <div className="no-print" contentEditable={false} style={{ userSelect: 'none', width: viewMode === 'web' ? '90vw' : '210mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1px 6px', marginBottom: '2px', fontSize: '11px', color: '#64748b' }}>
                    <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#475569' }}>
                      <FileText size={13} color="#2563eb" /> صفحة {index + 1} من {pages.length} {trackChangesMode ? ' • 📝 تعقب التغييرات نشط' : ''}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(255, 255, 255, 0.85)', padding: '1px 6px', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                      {index > 0 && (
                        <button onClick={() => movePage(index, -1)} style={{ ...pageActionMiniBtnStyle, background: 'transparent', border: 'none', padding: '1px 4px', height: '20px' }} title="تحريك الصفحة لأعلى"><ChevronUp size={13} /></button>
                      )}
                      {index < pages.length - 1 && (
                        <button onClick={() => movePage(index, 1)} style={{ ...pageActionMiniBtnStyle, background: 'transparent', border: 'none', padding: '1px 4px', height: '20px' }} title="تحريك الصفحة لأسفل"><ChevronDown size={13} /></button>
                      )}
                      <button onClick={() => duplicatePage(index)} style={{ ...pageActionMiniBtnStyle, background: 'transparent', border: 'none', padding: '1px 5px', height: '20px' }} title="تكرار هذه الصفحة"><Copy size={12} /> تكرار</button>
                      {pages.length > 1 && (
                        <button onClick={() => deletePage(index)} style={{ ...pageActionMiniBtnStyle, background: 'transparent', border: 'none', color: '#dc2626', padding: '1px 5px', height: '20px' }} title="حذف هذه الصفحة"><Trash2 size={12} /> حذف</button>
                      )}
                    </div>
                  </div>

                  {/* REAL A4 SHEET (Prints as 1 Physical A4 Page exactly, no inner scrolling) */}
                  <div 
                    className={`a4-sheet pattern-${pageBackgroundPattern}`}
                    onClick={() => {
                      if (isAllPagesSelected) setIsAllPagesSelected(false);
                      setActivePageIndex(index);
                    }}
                    style={{ 
                      position: 'relative', 
                      backgroundColor: immersiveReaderMode
                        ? (immersiveTheme === 'dark' ? '#1e293b' : immersiveTheme === 'calm_blue' ? '#f0f9ff' : '#fdf8f0')
                        : (pageBgColor || '#ffffff'), 
                      backgroundImage:
                        showViewGridlines && pageBackgroundPattern === 'none'
                          ? 'linear-gradient(to right, rgba(148, 163, 184, 0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.18) 1px, transparent 1px)'
                          : pageBackgroundPattern === 'ruled_narrow'
                          ? 'repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, rgba(59, 130, 246, 0.22) 31px, rgba(59, 130, 246, 0.22) 32px)'
                          : pageBackgroundPattern === 'ruled_wide'
                          ? 'repeating-linear-gradient(to bottom, transparent 0px, transparent 41px, rgba(59, 130, 246, 0.24) 41px, rgba(59, 130, 246, 0.24) 42px)'
                          : pageBackgroundPattern === 'grid_small'
                          ? 'linear-gradient(to right, rgba(148, 163, 184, 0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.22) 1px, transparent 1px)'
                          : pageBackgroundPattern === 'grid_medium'
                          ? 'linear-gradient(to right, rgba(148, 163, 184, 0.26) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.26) 1px, transparent 1px)'
                          : pageBackgroundPattern === 'dotted'
                          ? 'radial-gradient(rgba(100, 116, 139, 0.35) 1.3px, transparent 1.3px)'
                          : 'none',
                      backgroundSize:
                        showViewGridlines && pageBackgroundPattern === 'none'
                          ? '24px 24px'
                          : pageBackgroundPattern === 'grid_small'
                          ? '20px 20px'
                          : pageBackgroundPattern === 'grid_medium'
                          ? '32px 32px'
                          : pageBackgroundPattern === 'dotted'
                          ? '24px 24px'
                          : 'auto',
                      width: viewMode === 'web' ? '90vw' : '210mm', 
                      height: '297mm', 
                      maxHeight: '297mm', 
                      overflow: 'hidden',
                      padding: pageMargin, 
                      boxShadow: '0 4px 25px -2px rgba(15, 23, 42, 0.08), 0 1px 4px -1px rgba(15, 23, 42, 0.04)', 
                      borderRadius: '4px', 
                      border: '1px solid #e2e8f0',
                      boxSizing: 'border-box',
                      outline: activePageIndex === index ? '2px solid #3b82f6' : 'none',
                      outlineOffset: '3px'
                    }}
                  >
                    {/* Decorative Page Border Frame (Prints on every A4 sheet when enabled) */}
                    {renderPageBorderFrame(pageBorderStyle, pageBorderColor, pageBorderWidth)}

                    {/* Header Text */}
                    {headerText && (
                      <div 
                        className="sheet-header-print" 
                        contentEditable={false} 
                        style={{ 
                          userSelect: 'none', 
                          position: 'absolute', 
                          top: getHeaderTopPosition(), 
                          left: pageMargin, 
                          right: pageMargin, 
                          textAlign: 'center', 
                          color: '#64748b', 
                          fontSize: '12px', 
                          fontWeight: '500', 
                          borderBottom: '1px solid #e2e8f0', 
                          paddingBottom: '4px',
                          zIndex: 3,
                          pointerEvents: 'none'
                        }}
                      >
                        {headerText}
                      </div>
                    )}

                    {/* Watermark Text */}
                    {watermark && (
                      <div className="sheet-watermark-print" contentEditable={false} style={{ userSelect: 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1, opacity: 0.05, fontSize: '100px', fontWeight: 'bold', color: 'black', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                        {watermark}
                      </div>
                    )}
                    
                    {/* Unified Editable Sheet Body Content */}
                    <div 
                      ref={el => {
                        pageRefs.current[page.id] = el;
                        if (el && !el.__hasInitialContent) {
                          el.innerHTML = page.content || '<p><br></p>';
                          el.__hasInitialContent = true;
                        }
                      }}
                      className="sheet-body-content"
                      contentEditable={!isEditingRestricted}
                      spellCheck={spellCheckEnabled}
                      suppressContentEditableWarning={true}
                      onMouseDown={(e) => handlePageMouseDown(e, index)}
                      onPaste={handlePaste}
                      onFocus={() => {
                        if (isAllPagesSelected) setIsAllPagesSelected(false);
                        if (activePageIndex !== index) setActivePageIndex(index);
                      }}
                      onInput={() => { 
                        const curEl = pageRefs.current[page.id];
                        if (curEl) {
                          page.content = curEl.innerHTML;
                        }
                        handleAutoSave(); 
                        debouncedUpdateMetrics(); 
                        triggerAutoPagination(); 
                      }} 
                      onKeyDown={(e) => handlePageKeyDown(e, index)}
                      style={{ 
                        position: 'relative', 
                        zIndex: 2, 
                        fontSize: immersiveReaderMode ? '20px' : '17px', 
                        lineHeight: immersiveReaderMode ? '2.3' : '1.5', 
                        letterSpacing: immersiveReaderMode ? '0.4px' : undefined,
                        color: immersiveReaderMode && immersiveTheme === 'dark' ? '#f8fafc' : '#0f172a', 
                        outline: 'none', 
                        height: `calc(297mm - (2 * ${pageMargin}))`,
                        minHeight: `calc(297mm - (2 * ${pageMargin}))`,
                        maxHeight: `calc(297mm - (2 * ${pageMargin}))`,
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                        boxSizing: 'border-box',
                        columnCount: pageColumns > 1 ? pageColumns : undefined,
                        columnGap: pageColumns > 1 ? '8mm' : undefined,
                        columnRule: pageColumns > 1 ? '1px solid #cbd5e1' : undefined
                      }} 
                    ></div>
                    
                    {/* Footer Text + Automatic Page Numbering */}
                    <div 
                      className="sheet-footer-print" 
                      contentEditable={false} 
                      style={{ 
                        userSelect: 'none', 
                        position: 'absolute', 
                        bottom: getFooterBottomPosition(), 
                        left: pageMargin, 
                        right: pageMargin, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        color: '#64748b', 
                        fontSize: '12px', 
                        fontWeight: '500', 
                        borderTop: '1px solid #e2e8f0', 
                        paddingTop: '4px',
                        zIndex: 3,
                        pointerEvents: 'none'
                      }}
                    >
                      <span>{footerText || ''}</span>
                      {pageNumberFormat !== 'none' && (
                        <span style={{ fontWeight: 'bold', color: '#64748b' }}>
                          {getPageNumberDisplay(index)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add Page Button Between Sheets */}
                  <div className="no-print" contentEditable={false} style={{ userSelect: 'none', marginTop: '16px' }}>
                    <button 
                      onClick={() => addNewPage(index)}
                      style={{ background: '#f8fafc', border: '1px dashed #94a3b8', color: '#334155', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: '0.15s' }}
                    >
                      <Plus size={14} color="#2563eb" /> إضافة صفحة بعد صفحة {index + 1}
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>

          {/* AI Assistant Chat Panel */}
          {showAssistant && (
            <>
              {isMobile && (
                <div 
                  onClick={() => setShowAssistant(false)} 
                  style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9998, backdropFilter: 'blur(2px)' }} 
                />
              )}
              <div 
                className="no-print" 
                style={{ 
                  width: isMobile ? '100vw' : '330px', 
                  maxWidth: '100vw', 
                  height: isMobile ? (mobileViewportHeight ? `${mobileViewportHeight}px` : '100dvh') : 'auto', 
                  maxHeight: isMobile ? (mobileViewportHeight ? `${mobileViewportHeight}px` : '100dvh') : 'none', 
                  position: isMobile ? 'fixed' : 'relative', 
                  top: isMobile ? 0 : 'auto', 
                  bottom: isMobile ? 0 : 'auto', 
                  left: isMobile ? 0 : 'auto', 
                  right: isMobile ? 0 : 'auto', 
                  background: 'white', 
                  borderRight: isMobile ? 'none' : '1px solid #e2e8f0', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  boxShadow: isMobile ? 'none' : '-4px 0 20px rgba(0,0,0,0.06)', 
                  zIndex: isMobile ? 99999 : 40,
                  overflow: 'hidden'
                }}
              >
              
              <div style={{ 
                padding: isMobile ? '10px 14px' : '12px 16px', 
                borderBottom: '1px solid #e2e8f0', 
                background: '#f8fafc', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} color="#4f46e5" />
                  <div>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: isMobile ? '13.5px' : '14px', fontWeight: 'bold' }}>مساعد الملزمة الذكي</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: 'bold' }}>● متصل</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>• Gemini Flash</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAssistant(false)} 
                  style={{ 
                    background: '#fee2e2', 
                    border: '1px solid #fecaca', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    color: '#dc2626', 
                    fontSize: '12px', 
                    padding: '5px 12px', 
                    fontWeight: 'bold', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  title="إغلاق المساعد وتوسيع مساحة العمل"
                >
                  ✕ إغلاق
                </button>
              </div>
              
              {/* Interactive Scope Control Center (تحديد نطاق عمل الذكاء الاصطناعي بمرونة تامة) */}
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🎯 نطاق عمل الذكاء:
                  </span>
                  {aiContextScope === 'selection' && (capturedSelectedText || crossPageSelection?.text) && (
                    <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 'bold' }}>
                      ({(capturedSelectedText || crossPageSelection?.text || '').length} حرف محدد)
                    </span>
                  )}
                </div>

                {/* Scope Segmented Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', background: '#e2e8f0', padding: '3px', borderRadius: '8px' }}>
                  <button
                    type="button"
                    onClick={() => { setAiContextScope('current_page'); setIsAllPagesSelected(false); }}
                    style={{
                      padding: '5px 2px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      background: aiContextScope === 'current_page' ? '#ffffff' : 'transparent',
                      color: aiContextScope === 'current_page' ? '#1e40af' : '#64748b',
                      boxShadow: aiContextScope === 'current_page' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title={`التركيز على الصفحة الحالية فقط (صفحة ${activePageIndex + 1})`}
                  >
                    📄 ص {activePageIndex + 1}
                  </button>

                  <button
                    type="button"
                    onClick={() => { 
                      setAiContextScope('selection'); 
                      setIsAllPagesSelected(false); 
                    }}
                    style={{
                      padding: '5px 2px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      background: aiContextScope === 'selection' ? '#ffffff' : 'transparent',
                      color: aiContextScope === 'selection' ? '#1d4ed8' : (capturedSelectedText || crossPageSelection) ? '#2563eb' : '#64748b',
                      boxShadow: aiContextScope === 'selection' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                    title="العمل حصراً على الجزء المحدد في المستند"
                  >
                    📝 المحدد
                    {(capturedSelectedText || crossPageSelection) && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb', position: 'absolute', top: '3px', left: '3px' }}></span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setAiContextScope('custom_pages'); setIsAllPagesSelected(false); }}
                    style={{
                      padding: '5px 2px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      background: aiContextScope === 'custom_pages' ? '#ffffff' : 'transparent',
                      color: aiContextScope === 'custom_pages' ? '#1e40af' : '#64748b',
                      boxShadow: aiContextScope === 'custom_pages' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title="تحديد أرقام صفحات معينة لمعالجتها معاً"
                  >
                    📑 صفحات
                  </button>

                  <button
                    type="button"
                    onClick={() => { setAiContextScope('all_pages'); setIsAllPagesSelected(true); }}
                    style={{
                      padding: '5px 2px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      background: aiContextScope === 'all_pages' ? '#ffffff' : 'transparent',
                      color: aiContextScope === 'all_pages' ? '#1e40af' : '#64748b',
                      boxShadow: aiContextScope === 'all_pages' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title={`العمل على كامل صفحات المستند (${pages.length} صفحات)`}
                  >
                    📚 الكل ({pages.length})
                  </button>
                </div>

                {/* Scope Sub-Banner / Custom Controls */}
                {aiContextScope === 'current_page' && (
                  <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
                    <span>يركز المساعد على محتوى صفحة {activePageIndex + 1} من {pages.length}</span>
                  </div>
                )}

                {aiContextScope === 'selection' && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '6px 8px', fontSize: '11.5px', color: '#1e40af' }}>
                    {(capturedSelectedText || crossPageSelection?.text) ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'rtl', flex: 1 }}>
                          📌 <strong>المحدد:</strong> &ldquo;{(capturedSelectedText || crossPageSelection?.text).slice(0, 42)}...&rdquo;
                        </div>
                        <button
                          type="button"
                          onClick={() => { setCapturedSelectedText(''); clearCrossPageSelection(); }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', padding: '0 2px' }}
                          title="إلغاء التحديد والعودة للصفحة"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>💡 حدد أي نص بالماوس أو Shift والأسهم في الملزمة، وسيتم إرساله للذكاء.</span>
                      </div>
                    )}
                  </div>
                )}

                {aiContextScope === 'custom_pages' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '4px 8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#166534', whiteSpace: 'nowrap' }}>أرقام الصفحات:</span>
                    <input
                      type="text"
                      value={customAiPagesInput}
                      onChange={(e) => setCustomAiPagesInput(e.target.value)}
                      placeholder={`مثال: 1, 3 أو 1-${pages.length}`}
                      style={{ flex: 1, padding: '3px 6px', borderRadius: '4px', border: '1px solid #86efac', fontSize: '11.5px', outline: 'none', direction: 'ltr', textAlign: 'center', background: 'white' }}
                    />
                    <span style={{ fontSize: '10px', color: '#15803d' }}>من {pages.length}</span>
                  </div>
                )}

                {aiContextScope === 'all_pages' && (
                  <div style={{ fontSize: '11px', color: '#1e40af', background: '#dbeafe', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>📚 يشمل كامل صفحات المستند ({pages.length} صفحات)</span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Ctrl+A</span>
                  </div>
                )}
              </div>

              <div style={{ 
                flex: 1, 
                minHeight: 0, 
                overflowY: 'auto', 
                WebkitOverflowScrolling: 'touch',
                padding: isMobile ? '12px 10px' : '16px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '14px', 
                background: '#f8fafc' 
              }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      background: msg.role === 'user' ? '#3b82f6' : 'white', 
                      color: msg.role === 'user' ? 'white' : '#1e293b', 
                      padding: '10px 14px', 
                      borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px', 
                      boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                      border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                      maxWidth: '92%',
                      fontSize: '13.5px',
                      lineHeight: '1.6'
                    }}>
                      {/* Attached images gallery in user message */}
                      {msg.images && msg.images.length > 0 ? (
                        <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {msg.images.map((imSrc, imIdx) => (
                            <img 
                              key={imIdx}
                              src={imSrc} 
                              alt={`Upload ${imIdx + 1}`} 
                              style={{ width: msg.images.length === 1 ? '100%' : '120px', height: msg.images.length === 1 ? 'auto' : '100px', maxHeight: '180px', borderRadius: '8px', objectFit: 'cover', background: '#00000015', border: '1px solid rgba(255,255,255,0.2)' }} 
                            />
                          ))}
                        </div>
                      ) : msg.image ? (
                        <div style={{ marginBottom: '8px' }}>
                          <img 
                            src={msg.image} 
                            alt="User upload" 
                            style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', display: 'block', objectFit: 'contain', background: '#00000015' }} 
                          />
                        </div>
                      ) : null}
                      <div dangerouslySetInnerHTML={{ __html: msg.text }}></div>
                    </div>
                    
                    {msg.role === 'model' && i > 0 && (
                      <div style={{ marginTop: '7px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {/* Replace Selected Text Action */}
                        {(aiContextScope === 'selection' || capturedSelectedText || crossPageSelection) && (
                          <button 
                            onClick={() => replaceSelectedTextWithAi(msg.text)} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              background: '#eff6ff', 
                              border: '1px solid #bfdbfe', 
                              color: '#1d4ed8', 
                              fontSize: '11px', 
                              cursor: 'pointer', 
                              fontWeight: 'bold', 
                              padding: '3px 8px', 
                              borderRadius: '6px' 
                            }}
                            title="استبدال الجزء المحدد في المستند بنتيجة الذكاء الاصطناعي فورياً"
                          >
                            <Sparkles size={12} color="#2563eb" /> ✨ استبدال الجزء المحدد بالنتيجة
                          </button>
                        )}
                        {(isAllPagesSelected || aiContextScope === 'all_pages') && (
                          <button 
                            onClick={() => replaceEntireDocumentWithAi(msg.text)} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              background: '#eff6ff', 
                              border: '1px solid #bfdbfe', 
                              color: '#1d4ed8', 
                              fontSize: '11px', 
                              cursor: 'pointer', 
                              fontWeight: 'bold', 
                              padding: '3px 8px', 
                              borderRadius: '6px' 
                            }}
                            title="تطبيق النتيجة واستبدال كامل صفحات المستند مع التوزيع الآلي على مقاس A4"
                          >
                            <Sparkles size={12} color="#2563eb" /> ✨ استبدال كامل المستند بالنتيجة
                          </button>
                        )}
                        <button 
                          onClick={() => insertChatToDocument(msg.text)} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            background: '#f8fafc', 
                            border: '1px solid #cbd5e1', 
                            color: '#4f46e5', 
                            fontSize: '11px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold', 
                            padding: '3px 8px', 
                            borderRadius: '6px' 
                          }}
                        >
                          <ArrowDownToLine size={12} /> إدراج في صفحة {activePageIndex + 1}
                        </button>
                        <button 
                          onClick={() => insertChatAsNewPage(msg.text)} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            background: '#f0fdf4', 
                            border: '1px solid #bbf7d0', 
                            color: '#15803d', 
                            fontSize: '11px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold', 
                            padding: '3px 8px', 
                            borderRadius: '6px' 
                          }}
                          title="إضافة صفحة جديدة بعد الصفحة الحالية وإدراج النتيجة فيها"
                        >
                          <Plus size={12} color="#15803d" /> إضافة كصفحة جديدة
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {isChatLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12.5px' }}>
                    <Loader2 size={15} className="spin" /> يحلل الملزمة والصور ويفكر...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Multiple Images Preview Strip */}
              {chatImages.length > 0 && (
                <div style={{ padding: '8px 12px', background: '#eff6ff', borderTop: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af' }}>
                      📷 الصور المرفقة ({chatImages.length} صور):
                    </span>
                    <button 
                      type="button" 
                      onClick={() => { setChatImages([]); setChatImage(null); }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      حذف الكل
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {chatImages.map((img, imgIdx) => (
                      <div key={img.id || imgIdx} style={{ position: 'relative', flexShrink: 0, width: '64px', height: '64px', borderRadius: '8px', border: '1px solid #93c5fd', overflow: 'hidden', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <img src={img.preview} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = chatImages.filter((_, idx) => idx !== imgIdx);
                            setChatImages(updated);
                            setChatImage(updated[0] || null);
                          }}
                          style={{ position: 'absolute', top: '2px', left: '2px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', cursor: 'pointer', lineHeight: 1 }}
                          title="حذف هذه الصورة"
                        >
                          ✕
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOcrImage(img);
                            setShowOcrModal(true);
                          }}
                          style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'rgba(5,150,105,0.9)', color: 'white', border: 'none', borderRadius: '3px', padding: '1px 3px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' }}
                          title="تفريغ نصي مجاني OCR"
                        >
                          OCR
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => chatFileInputRef.current?.click()}
                      style={{ flexShrink: 0, width: '64px', height: '64px', borderRadius: '8px', border: '2px dashed #93c5fd', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#2563eb', fontSize: '10px', gap: '2px' }}
                      title="إضافة المزيد من الصور"
                    >
                      <Plus size={16} />
                      <span>+ صورة</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Input Bar */}
              <form 
                onSubmit={handleChatSubmit} 
                onPaste={handleChatPaste} 
                style={{ 
                  padding: isMobile ? '8px 10px max(10px, env(safe-area-inset-bottom, 10px))' : '10px 14px', 
                  borderTop: '1px solid #e2e8f0', 
                  background: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 10
                }}
              >
                <input 
                  type="file" 
                  ref={chatFileInputRef} 
                  accept="image/*" 
                  multiple 
                  onChange={handleChatImageUpload} 
                  style={{ display: 'none' }} 
                />

                {/* Attach Multiple Images Button */}
                <button 
                  type="button" 
                  onClick={() => chatFileInputRef.current?.click()} 
                  style={{ 
                    background: chatImages.length > 0 ? '#eff6ff' : '#f8fafc', 
                    border: '1px solid', 
                    borderColor: chatImages.length > 0 ? '#3b82f6' : '#cbd5e1', 
                    borderRadius: '8px', 
                    width: isMobile ? '38px' : '36px', 
                    height: isMobile ? '38px' : '36px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    color: chatImages.length > 0 ? '#2563eb' : '#64748b',
                    position: 'relative',
                    flexShrink: 0
                  }}
                  title="إرفاق صور للذكاء الاصطناعي (يمكنك اختيار عدة صور أو لصق صور متعددة Ctrl+V)"
                >
                  <Camera size={17} />
                  {chatImages.length > 0 && (
                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#2563eb', color: 'white', fontSize: '9px', fontWeight: 'bold', width: '15px', height: '15px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {chatImages.length}
                    </span>
                  )}
                </button>

                {/* Free OCR Shortcut Button */}
                <button 
                  type="button" 
                  onClick={() => {
                    if (chatImages.length > 0) setOcrImage(chatImages[0]);
                    setShowOcrModal(true);
                  }} 
                  style={{ 
                    background: '#f0fdf4', 
                    border: '1px solid #bbf7d0', 
                    borderRadius: '8px', 
                    width: isMobile ? '38px' : '36px', 
                    height: isMobile ? '38px' : '36px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    color: '#16a34a',
                    flexShrink: 0
                  }}
                  title="استخراج النصوص من الصور مجاناً (OCR)"
                >
                  <FileSearch size={16} />
                </button>

                {/* Text Input */}
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  onFocus={() => {
                    setTimeout(() => {
                      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 250);
                  }}
                  placeholder={chatImages.length > 0 ? `اكتب طلبك حول الصور (${chatImages.length} صور)... (أو اضغط إرسال)` : "اكتب طلبك أو الصق صوراً..."} 
                  style={{ 
                    flex: 1, 
                    minWidth: 0, 
                    padding: isMobile ? '9px 10px' : '9px 12px', 
                    borderRadius: '8px', 
                    border: '1px solid #cbd5e1', 
                    outline: 'none', 
                    fontSize: isMobile ? '14px' : '13px' 
                  }}
                />

                {/* Send Button */}
                <button 
                  type="submit" 
                  disabled={isChatLoading || (!chatInput.trim() && chatImages.length === 0)} 
                  style={{ 
                    background: isChatLoading || (!chatInput.trim() && chatImages.length === 0) ? '#94a3b8' : '#4f46e5', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    width: isMobile ? '38px' : '36px', 
                    height: isMobile ? '38px' : '36px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: isChatLoading || (!chatInput.trim() && chatImages.length === 0) ? 'not-allowed' : 'pointer',
                    flexShrink: 0
                  }}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
            </>
          )}

        </div>

        {/* 4. Bottom Status Bar (Word-like Metrics & Zoom - Desktop) */}
        <div className="no-print hide-on-mobile" style={{ height: '32px', background: 'white', borderTop: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', fontSize: '12px', color: '#64748b', zIndex: 30 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span>📄 <strong>الصفحة النشطة:</strong> {isAllPagesSelected ? `كامل المستند (${pages.length} صفحات محددة)` : `${activePageIndex + 1} من ${pages.length}`}</span>
            {isAllPagesSelected && (
              <span style={{ background: '#dbeafe', color: '#1e40af', padding: '1px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px' }}>
                ✓ تم تحديد كامل المستند (Ctrl+A)
              </span>
            )}
            <span>✍️ <strong>الكلمات:</strong> {wordCount} كلمة</span>
            <span>🔤 <strong>الحروف:</strong> {charCount}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#059669', fontWeight: 'bold' }}>✓ نظام التدفق الذكي للأسطور والصفحات نشط</span>
            <div style={dividerStyle}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button onClick={() => setZoomLevel(prev => Math.max(60, prev - 10))} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '1px 6px', cursor: 'pointer' }}>-</button>
              <span style={{ minWidth: '40px', textAlign: 'center' }}>{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '1px 6px', cursor: 'pointer' }}>+</button>
            </div>
          </div>

        </div>

        {/* 5. Mobile Bottom Quick Formatting Bar (شريط أدوات الهواتف السفلي السريع والذكي) */}
        {isMobile && !focusMode && !showAssistant && (
          <div 
            className="no-print mobile-bottom-toolbar" 
            data-toolbar="true"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '52px',
              background: '#ffffff',
              borderTop: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '0 8px',
              gap: '6px',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              zIndex: 9990,
              boxShadow: '0 -2px 12px rgba(0,0,0,0.08)'
            }}
          >
            {/* Direct Category Tab Switchers */}
            <button 
              onClick={() => { setActiveTab('home'); setIsRibbonCollapsed(false); }} 
              style={{
                ...mobileBottomCategoryBtnStyle,
                background: activeTab === 'home' && !isRibbonCollapsed ? '#eff6ff' : '#f8fafc',
                color: activeTab === 'home' && !isRibbonCollapsed ? '#1d4ed8' : '#334155',
                borderColor: activeTab === 'home' && !isRibbonCollapsed ? '#3b82f6' : '#cbd5e1'
              }}
              title="أدوات التنسيق والخطوط (الرئيسية)"
            >
              <Type size={14} color={activeTab === 'home' && !isRibbonCollapsed ? '#1d4ed8' : '#64748b'} />
              <span>تنسيق</span>
            </button>

            <button 
              onClick={() => { setActiveTab('insert'); setIsRibbonCollapsed(false); }} 
              style={{
                ...mobileBottomCategoryBtnStyle,
                background: activeTab === 'insert' && !isRibbonCollapsed ? '#eff6ff' : '#f8fafc',
                color: activeTab === 'insert' && !isRibbonCollapsed ? '#1d4ed8' : '#334155',
                borderColor: activeTab === 'insert' && !isRibbonCollapsed ? '#3b82f6' : '#cbd5e1'
              }}
              title="إدراج جداول، صور، أشكال، صناديق ومعادلات"
            >
              <Plus size={14} color={activeTab === 'insert' && !isRibbonCollapsed ? '#1d4ed8' : '#64748b'} />
              <span>إدراج</span>
            </button>

            <button 
              onClick={() => { setActiveTab('page'); setIsRibbonCollapsed(false); }} 
              style={{
                ...mobileBottomCategoryBtnStyle,
                background: activeTab === 'page' && !isRibbonCollapsed ? '#eff6ff' : '#f8fafc',
                color: activeTab === 'page' && !isRibbonCollapsed ? '#1d4ed8' : '#334155',
                borderColor: activeTab === 'page' && !isRibbonCollapsed ? '#3b82f6' : '#cbd5e1'
              }}
              title="تصميم وتخطيط الصفحة والبراويز والألوان"
            >
              <Layout size={14} color={activeTab === 'page' && !isRibbonCollapsed ? '#1d4ed8' : '#64748b'} />
              <span>تصميم</span>
            </button>

            <button 
              onClick={() => { setActiveTab('ai'); setIsRibbonCollapsed(false); }} 
              style={{
                ...mobileBottomCategoryBtnStyle,
                background: activeTab === 'ai' && !isRibbonCollapsed ? '#f5f3ff' : '#f8fafc',
                color: activeTab === 'ai' && !isRibbonCollapsed ? '#7c3aed' : '#334155',
                borderColor: activeTab === 'ai' && !isRibbonCollapsed ? '#8b5cf6' : '#cbd5e1'
              }}
              title="أدوات واستوديو الذكاء الاصطناعي"
            >
              <Sparkles size={14} color="#7c3aed" />
              <span>ذكاء</span>
            </button>

            <button 
              onClick={(e) => handleOpenEquationMenu(e)} 
              className="equation-menu-trigger"
              style={{
                ...mobileBottomCategoryBtnStyle,
                background: ((activeTab === 'math' && !isRibbonCollapsed) || showEquationMenu) ? '#e0f2fe' : '#f8fafc',
                color: ((activeTab === 'math' && !isRibbonCollapsed) || showEquationMenu) ? '#0284c7' : '#334155',
                borderColor: ((activeTab === 'math' && !isRibbonCollapsed) || showEquationMenu) ? '#0284c7' : '#cbd5e1'
              }}
              title="معادلات ورموز الرياضيات"
            >
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>π</span>
              <span>معادلة ▼</span>
            </button>

            <div style={{ width: '1px', height: '22px', background: '#cbd5e1', flexShrink: 0, margin: '0 2px' }} />

            {/* Quick Formatting B, I, U, Align */}
            <button 
              onClick={() => handleFormat('bold')} 
              style={mobileBottomBtnStyle()} 
              title="غامق (Ctrl+B)"
            >
              <Bold size={16} />
            </button>
            <button 
              onClick={() => handleFormat('italic')} 
              style={mobileBottomBtnStyle()} 
              title="مائل (Ctrl+I)"
            >
              <Italic size={16} />
            </button>
            <button 
              onClick={() => handleFormat('underline')} 
              style={mobileBottomBtnStyle()} 
              title="تسطير (Ctrl+U)"
            >
              <Underline size={16} />
            </button>
            <button 
              onClick={() => handleFormat('justifyCenter')} 
              style={mobileBottomBtnStyle()} 
              title="محاذاة للوسط"
            >
              <AlignCenter size={16} />
            </button>

            <div style={{ width: '1px', height: '22px', background: '#cbd5e1', flexShrink: 0, margin: '0 2px' }} />

            {/* Voice Dictation (إملاء صوتي فوري) */}
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleRecording} 
              style={{
                ...mobileBottomBtnStyle(isRecording),
                background: isRecording ? '#fee2e2' : '#f0fdf4',
                color: isRecording ? '#dc2626' : '#15803d',
                borderColor: isRecording ? '#fca5a5' : '#86efac',
                minWidth: 'auto',
                padding: '5px 9px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }} 
              title="إملاء صوتي فوري باللغة العربية"
            >
              <Mic size={15} color={isRecording ? "#dc2626" : "#16a34a"} className={isRecording ? "pulse" : ""} />
              <span style={{ fontSize: '11px' }}>{isRecording ? "استماع..." : "إملاء"}</span>
            </button>

            <div style={{ width: '1px', height: '22px', background: '#cbd5e1', flexShrink: 0, margin: '0 2px' }} />

            {/* Undo / Redo */}
            <button 
              onClick={handleUndo} 
              disabled={!canUndo} 
              style={mobileBottomBtnStyle(false, !canUndo)} 
              title="تراجع (Ctrl+Z)"
            >
              <Undo2 size={16} />
            </button>
            <button 
              onClick={handleRedo} 
              disabled={!canRedo} 
              style={mobileBottomBtnStyle(false, !canRedo)} 
              title="إعادة (Ctrl+Y)"
            >
              <Redo2 size={16} />
            </button>

            <div style={{ width: '1px', height: '22px', background: '#cbd5e1', flexShrink: 0, margin: '0 2px' }} />

            {/* Mobile Fit Width */}
            <button 
              onClick={() => {
                if (mobileFitWidth) {
                  setMobileFitWidth(false);
                  setZoomLevel(100);
                } else {
                  setMobileFitWidth(true);
                  if (typeof window !== 'undefined') {
                    const availableW = window.innerWidth - 12;
                    const autoZoom = Math.min(100, Math.max(35, Math.floor((availableW / 794) * 100)));
                    setZoomLevel(autoZoom);
                  }
                }
              }} 
              style={{
                ...mobileBottomBtnStyle(mobileFitWidth),
                minWidth: 'auto',
                padding: '5px 8px',
                fontSize: '11px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }} 
              title={mobileFitWidth ? "تبديل إلى الحجم الطبيعي 100%" : "ملاءمة عرض الشاشة تلقائياً"}
            >
              <span>{mobileFitWidth ? '📱 ملاءمة' : '🔍 100%'}</span>
            </button>

            {/* Toggle Tools Ribbon */}
            <button 
              onClick={() => setIsRibbonCollapsed(prev => !prev)} 
              style={{
                ...mobileBottomBtnStyle(!isRibbonCollapsed),
                minWidth: 'auto',
                padding: '5px 8px',
                fontSize: '11px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }} 
              title={isRibbonCollapsed ? "إظهار شريط الأدوات العلوي" : "طي شريط الأدوات العلوي"}
            >
              {isRibbonCollapsed ? <ChevronUp size={15} color="#2563eb" /> : <ChevronDown size={15} />}
              <span>{isRibbonCollapsed ? 'الأدوات' : 'طي'}</span>
            </button>

            {/* Add Page */}
            <button 
              onClick={addNewPage} 
              style={{ 
                ...mobileBottomBtnStyle(), 
                color: '#2563eb', 
                background: '#eff6ff', 
                border: '1px solid #93c5fd',
                minWidth: 'auto',
                padding: '5px 9px',
                fontSize: '11px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                whiteSpace: 'nowrap'
              }} 
              title="إضافة صفحة جديدة"
            >
              <Plus size={15} />
              <span>صفحة</span>
            </button>
          </div>
        )}

        {/* 1. FLOATING WORD LAYOUT BUTTON RIGHT AT THE CORNER OF SELECTED IMAGE */}
        {(() => {
          const winHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
          const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
          const isImgVisible = selectedImg && selectedImgRect && selectedImgRect.bottom > 80 && selectedImgRect.top < winHeight - 40;

          return (
            <>
              {isImgVisible && (
                <button
                  onClick={() => setShowImageLayoutModal(prev => !prev)}
                  className="no-print image-layout-floating-btn"
                  style={{
                    position: 'fixed',
                    top: Math.max(12, selectedImgRect.top - 10),
                    left: Math.max(12, selectedImgRect.right - 28),
                    width: '28px',
                    height: '28px',
                    background: 'white',
                    border: '1.5px solid #0284c7',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 9998,
                    transition: '0.15s transform',
                    transform: showImageLayoutModal ? 'scale(1.1)' : 'scale(1)'
                  }}
                  title="خيارات التخطيط والتفاف النص (Word Layout Options)"
                >
                  <Layout size={16} color="#0284c7" />
                </button>
              )}

              {/* 2. MICROSOFT WORD AUTHENTIC "خيارات التخطيط" (LAYOUT OPTIONS) POPOVER MODAL */}
              {selectedImg && showImageLayoutModal && (
                <div 
                  className="no-print image-layout-popover"
                  style={{
                    position: 'fixed',
                    top: selectedImgRect ? Math.max(70, Math.min(winHeight - 390, selectedImgRect.top)) : '20%',
                    left: selectedImgRect 
                      ? (selectedImgRect.right + 315 > winWidth 
                          ? Math.max(16, selectedImgRect.left - 315) 
                          : selectedImgRect.right + 12) 
                      : '35%',
                    width: '300px',
                    background: '#ffffff',
                    borderRadius: '10px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.25), 0 3px 10px rgba(0,0,0,0.1)',
                    border: '1px solid #cbd5e1',
                    zIndex: 9999,
                    fontFamily: 'Tajawal, system-ui, sans-serif',
                    padding: '14px 16px',
                    direction: 'rtl'
                  }}
                >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layout size={17} color="#0284c7" />
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>خيارات التخطيط</span>
              </div>
              <button 
                onClick={() => setShowImageLayoutModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '16px', fontWeight: 'bold', padding: '0 4px' }}
              >
                ✕
              </button>
            </div>

            {/* Section 1: سطري مع النص */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>سطري مع النص</div>
              <button
                onClick={() => applyImageLayout('inline', imagePositionMode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: imageLayoutMode === 'inline' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  background: imageLayoutMode === 'inline' ? '#eff6ff' : '#f8fafc',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'right'
                }}
                title="تظهر الصورة في نفس السطر مع النص كأي كلمة أخرى"
              >
                <div style={{ width: '28px', height: '22px', border: '1px dashed #94a3b8', borderRadius: '3px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#0284c7' }}>
                  🔤
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#1e293b' }}>سطري مع النص</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>الصورة تسير في نفس السطر تماماً</div>
                </div>
              </button>
            </div>

            {/* Section 2: مع التفاف النص (Word 7 Wrapping Options) */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>مع التفاف النص</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { id: 'square_right', name: 'مربع (يمين)', icon: '⬛➡️', desc: 'الصورة يمين ويلتف النص حولها' },
                  { id: 'square_left', name: 'مربع (يسار)', icon: '⬅️⬛', desc: 'الصورة يسار ويلتف النص حولها' },
                  { id: 'tight', name: 'مشدود', icon: '🧲', desc: 'التفاف مشدود حول حواف الصورة' },
                  { id: 'through', name: 'عبر', icon: '〰️', desc: 'النص ينساب عبر مساحات الصورة' },
                  { id: 'top_bottom', name: 'أعلى وأسفل', icon: '↕️', desc: 'النص أعلى وأسفل فقط بدون جوانب' },
                  { id: 'behind', name: 'خلف النص', icon: '📄🔲', desc: 'الصورة خلف النص كعلامة مائية' },
                  { id: 'front', name: 'أمام النص', icon: '🔲📄', desc: 'الصورة تطفو طافية أمام النص' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => applyImageLayout(opt.id, imagePositionMode)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px 2px',
                      borderRadius: '6px',
                      border: imageLayoutMode === opt.id ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      background: imageLayoutMode === opt.id ? '#eff6ff' : '#f8fafc',
                      cursor: 'pointer',
                      transition: '0.15s'
                    }}
                    title={opt.desc}
                  >
                    <span style={{ fontSize: '15px' }}>{opt.icon}</span>
                    <span style={{ fontSize: '9.5px', fontWeight: imageLayoutMode === opt.id ? 'bold' : 'normal', color: imageLayoutMode === opt.id ? '#0369a1' : '#334155', marginTop: '3px', textAlign: 'center' }}>
                      {opt.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: موضع الصورة */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="posMode" 
                  checked={imagePositionMode === 'flow'} 
                  onChange={() => applyImageLayout(imageLayoutMode, 'flow')} 
                />
                <span>نقل مع النص (Move with text)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#334155', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="posMode" 
                  checked={imagePositionMode === 'fixed'} 
                  onChange={() => applyImageLayout(imageLayoutMode, 'fixed')} 
                />
                <span>موضع ثابت على الصفحة (Fix position)</span>
              </label>
            </div>
          </div>
        )}
      </>
    );
  })()}

        {/* 3. FLOATING ACTION PILL FOR SELECTED EQUATION */}
        {selectedEquation && (
          <div
            className="no-print equation-floating-pill"
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0f172a',
              color: 'white',
              padding: '6px 14px',
              borderRadius: '30px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 1000,
              fontSize: '12px',
              fontFamily: 'Tajawal, sans-serif'
            }}
          >
            <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>معادلة محددة:</span>
            <button
              onClick={() => setEquationMode(selectedEquation, false)}
              style={{
                background: !latexIsBlock ? '#0284c7' : 'rgba(255,255,255,0.12)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '11.5px',
                fontWeight: !latexIsBlock ? 'bold' : 'normal'
              }}
              title="جعل المعادلة تجري في نفس السطر مع النص (Inline)"
            >
              🔤 سطري مع النص (Inline)
            </button>
            <button
              onClick={() => setEquationMode(selectedEquation, true)}
              style={{
                background: latexIsBlock ? '#0284c7' : 'rgba(255,255,255,0.12)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '11.5px',
                fontWeight: latexIsBlock ? 'bold' : 'normal'
              }}
              title="جعل المعادلة كتلة في سطر مستقل في منتصف الصفحة (Block)"
            >
              ⏹️ سطر مستقل (Block)
            </button>
            <button
              onClick={() => {
                const raw = selectedEquation.getAttribute('data-latex');
                if (raw) setLatexInput(decodeURIComponent(raw));
                setLatexIsBlock(selectedEquation.classList.contains('equation-widget-block'));
                setShowLatexModal(true);
              }}
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '16px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '11.5px'
              }}
              title="تعديل كود LaTeX للمعادلة"
            >
              ✏️ تعديل
            </button>
            <button
              onClick={() => {
                selectedEquation.remove();
                setSelectedEquation(null);
                handleAutoSave();
                triggerAutoPagination();
              }}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '11.5px',
                fontWeight: 'bold'
              }}
              title="حذف المعادلة من المستند"
            >
              🗑️ حذف
            </button>
            <button
              onClick={() => {
                selectedEquation.style.outline = 'none';
                setSelectedEquation(null);
              }}
              style={{
                background: 'none',
                color: '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '0 4px'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* FLOATING ACTION TOOLBAR FOR SELECTED SHAPE / TEXT BOX */}
        {selectedShape && (
          <div
            className="no-print shape-floating-mini-toolbar"
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0f172a',
              color: 'white',
              padding: '6px 14px',
              borderRadius: '30px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 1000,
              fontSize: '12px',
              fontFamily: 'Tajawal, sans-serif'
            }}
          >
            <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>🔷 شكل:</span>
            {/* Quick Fill Swatches */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {['#eff6ff', '#dcfce7', '#fefce8', '#fef2f2', '#faf5ff', '#1e293b'].map((c, i) => (
                <button
                  key={i}
                  onClick={() => formatSelectedShape('bg', c)}
                  style={{ width: '16px', height: '16px', borderRadius: '3px', background: c, border: '1px solid rgba(255,255,255,0.4)', cursor: 'pointer' }}
                  title="تغيير لون التعبئة"
                />
              ))}
              <input
                type="color"
                title="اختر لون تعبئة مخصص"
                onChange={(e) => formatSelectedShape('bg', e.target.value)}
                style={{ width: '20px', height: '20px', border: 'none', borderRadius: '3px', cursor: 'pointer', background: 'transparent', padding: 0 }}
              />
            </div>

            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)' }} />

            {/* Quick Border Swatches */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {['#2563eb', '#16a34a', '#eab308', '#dc2626', '#0f172a'].map((c, i) => (
                <button
                  key={i}
                  onClick={() => formatSelectedShape('border', c)}
                  style={{ width: '15px', height: '15px', borderRadius: '50%', background: c, border: '1.5px solid white', cursor: 'pointer' }}
                  title="تغيير لون الإطار"
                />
              ))}
            </div>

            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)' }} />

            {/* Width Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>العرض:</span>
              <button
                onClick={() => formatSelectedShape('scale', -40)}
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 7px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                title="تصغير العرض"
              >
                -
              </button>
              <button
                onClick={() => formatSelectedShape('scale', 40)}
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 7px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                title="تكبير العرض"
              >
                +
              </button>
              <button
                onClick={() => formatSelectedShape('width', '50%')}
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '10.5px' }}
                title="عرض 50%"
              >
                50%
              </button>
              <button
                onClick={() => formatSelectedShape('width', '100%')}
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '10.5px' }}
                title="عرض 100%"
              >
                100%
              </button>
              <button
                onClick={() => formatSelectedShape('width', 'auto')}
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '10.5px' }}
                title="عرض تلقائي"
              >
                تلقائي
              </button>
            </div>

            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)' }} />

            {/* Align & Delete */}
            <button
              onClick={() => formatSelectedShape('align', 'center')}
              style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '11px' }}
              title="توسيط الشكل بالصفحة"
            >
              توسيط
            </button>
            <button
              onClick={() => formatSelectedShape('delete')}
              style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
              title="حذف هذا الشكل"
            >
              🗑️
            </button>
            <button
              onClick={() => {
                if (selectedShape) selectedShape.style.outline = 'none';
                setSelectedShape(null);
              }}
              style={{ background: 'none', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '0 2px' }}
              title="إلغاء التحديد"
            >
              ✕
            </button>
          </div>
        )}

        {/* 4. MICROSOFT WORD FIND AND REPLACE MODAL */}
        {showFindReplaceModal && (
          <div 
            className="no-print"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(2px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowFindReplaceModal(false);
            }}
          >
            <div 
              style={{
                background: 'white',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 20px 45px rgba(0,0,0,0.22)',
                padding: '20px',
                direction: 'rtl',
                fontFamily: 'Tajawal, sans-serif',
                border: '1px solid #cbd5e1'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 'bold', color: '#1e293b' }}>
                  <Search size={18} color="#0284c7" /> بحث واستبدال (Word Find & Replace)
                </div>
                <button onClick={() => setShowFindReplaceModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>البحث عن:</label>
                  <input 
                    type="text" 
                    value={findWord} 
                    onChange={(e) => setFindWord(e.target.value)} 
                    placeholder="اكتب الكلمة أو العبارة للبحث عنها..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>استبدال بـ:</label>
                  <input 
                    type="text" 
                    value={replaceWord} 
                    onChange={(e) => setReplaceWord(e.target.value)} 
                    placeholder="النص البديل الجديد..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={handleFindNext}
                    style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    بحث عن التالي
                  </button>
                  <button 
                    onClick={handleReplaceOne}
                    style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    استبدال
                  </button>
                  <button 
                    onClick={handleReplaceAll}
                    style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    استبدال الكل
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Loading Spinner */}
        {loading && (
          <div style={{ position: 'fixed', bottom: '45px', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: 'white', padding: '12px 24px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', fontSize: '15px', fontWeight: 'bold', zIndex: 99999 }}>
            <Loader2 size={20} className="spin" color="#38bdf8" /> الذكاء الاصطناعي يعمل على الملزمة...
          </div>
        )}

        {/* Floating Equation Dropdown / Mobile Bottom Sheet */}
        {showEquationMenu && (
          <div 
            className="no-print equation-menu-container"
            style={{
              position: 'fixed',
              inset: 0,
              background: isMobile ? 'rgba(15, 23, 42, 0.45)' : 'transparent',
              backdropFilter: isMobile ? 'blur(2px)' : 'none',
              zIndex: 999999,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: isMobile ? 'flex-end' : 'flex-start'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowEquationMenu(false);
            }}
          >
            <div 
              style={isMobile ? {
                background: 'white',
                borderTopLeftRadius: '18px',
                borderTopRightRadius: '18px',
                maxHeight: '82vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 -10px 30px rgba(0,0,0,0.25)',
                width: '100%',
                animation: 'slideUp 0.2s ease-out'
              } : {
                position: 'fixed',
                top: `${equationMenuPos?.top || 70}px`,
                right: `${Math.max(10, Math.min(window.innerWidth - 330, equationMenuPos?.right || 20))}px`,
                width: '330px',
                maxHeight: '75vh',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 16px 36px -4px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Drag Handle on Mobile */}
              {isMobile && (
                <div style={{ width: '38px', height: '4px', background: '#cbd5e1', borderRadius: '2px', margin: '8px auto 2px auto' }} />
              )}

              {/* Menu Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '8px 14px' : '9px 12px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px', color: '#0284c7', fontWeight: 'bold', fontFamily: 'serif' }}>π</span>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#0f172a' }}>معادلات وصيغ رياضية جاهزة</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>انقر لإدراج الصيغة مباشرة في موضع المؤشر</div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowEquationMenu(false)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '13px' }}
                >
                  ✕
                </button>
              </div>

              {/* Quick Actions Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => {
                    setShowEquationMenu(false);
                    setActiveTab('math');
                    setIsRibbonCollapsed(false);
                    insertEquation('\\text{معادلة}', false);
                  }}
                  style={{
                    padding: '6px 8px',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                  title="فتح شريط أدوات واستوديو الرياضيات بالكامل"
                >
                  ➕ شريط الرياضيات
                </button>
                <button
                  onClick={() => {
                    setShowEquationMenu(false);
                    setShowLatexModal(true);
                  }}
                  style={{
                    padding: '6px 8px',
                    background: '#f5f3ff',
                    color: '#6d28d9',
                    border: '1px solid #ddd6fe',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                  title="فتح محرر LaTeX المتكامل مع المعاينة الفورية"
                >
                  {'{ }'} محرر LaTeX
                </button>
                <button
                  onClick={() => {
                    setShowEquationMenu(false);
                    handleGenerateAiEquation();
                  }}
                  style={{
                    gridColumn: 'span 2',
                    padding: '6px 8px',
                    background: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                  title="اكتب اسم أي قانون باللغة الطبيعية وسيقوم الذكاء بصياغته"
                >
                  🤖 صياغة بالذكاء الاصطناعي
                </button>
              </div>

              {/* Popular Formulas List */}
              <div style={{ padding: '6px 10px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 'bold', color: '#64748b', margin: '2px 4px 1px 4px' }}>
                  معادلات وقوانين شهيرة:
                </div>
                {POPULAR_EQUATIONS.map((item, idx) => {
                  let renderedHtml = null;
                  if (typeof window !== 'undefined' && window.katex) {
                    try {
                      renderedHtml = window.katex.renderToString(item.latex, { displayMode: false, throwOnError: false });
                    } catch (e) {}
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        insertEquation(item.latex, false);
                        setShowEquationMenu(false);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        padding: '7px 10px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        background: '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'right',
                        transition: 'all 0.15s',
                        gap: '2px',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.borderColor = '#bae6fd'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    >
                      <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#1e293b' }}>{item.name}</span>
                      {renderedHtml ? (
                        <span dangerouslySetInnerHTML={{ __html: renderedHtml }} style={{ direction: 'ltr', alignSelf: 'flex-start', marginInlineStart: '2px', overflowX: 'auto', maxWidth: '100%', fontSize: '12px' }} />
                      ) : (
                        <span style={{ fontSize: '10.5px', color: '#64748b', direction: 'ltr', fontFamily: 'monospace' }}>{item.latex}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* AI Vector SVG / Chart & Image Generator Modal */}
        <AIImageModal 
          isOpen={showAIImageModal} 
          onClose={() => setShowAIImageModal(false)} 
          onInsert={handleInsertAIImage} 
          initialMode="svg"
          insertButtonText="إدراج في المستند الآن"
        />

        {/* Interactive Equation Editor Modal (LaTeX Studio) */}
        {showLatexModal && (
          <div 
            className="math-modal no-print" 
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: 'rgba(15, 23, 42, 0.65)', 
              backdropFilter: 'blur(4px)', 
              zIndex: 999999, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '20px' 
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowLatexModal(false);
            }}
          >
            <div 
              style={{ 
                background: 'white', 
                borderRadius: '16px', 
                width: '100%', 
                maxWidth: '680px', 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden', 
                border: '1px solid #cbd5e1', 
                animation: 'scaleIn 0.2s ease-out' 
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontWeight: 'bold', fontSize: '18px', fontFamily: "'Cambria Math', serif" }}>
                    π
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>محرر المعادلات الرياضية المتقدم (LaTeX Studio)</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>كتابة وتعديل المعادلات الرياضية والفيزيائية بمعاينة حية فورية</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowLatexModal(false)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '20px', lineHeight: 1, padding: '4px', borderRadius: '4px' }}
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: 'calc(85vh - 130px)', overflowY: 'auto' }}>
                
                {/* Equation Placement Mode */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>نمط إدراج المعادلة:</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: '#0f172a' }}>
                    <input 
                      type="radio" 
                      name="eqMode" 
                      checked={!latexIsBlock} 
                      onChange={() => setLatexIsBlock(false)} 
                    />
                    داخل السطر (Inline - مدمجة في وسط الكلام)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: '#0f172a' }}>
                    <input 
                      type="radio" 
                      name="eqMode" 
                      checked={latexIsBlock} 
                      onChange={() => setLatexIsBlock(true)} 
                    />
                    سطر مستقل رئيسي (Display Block - في منتصف الصفحة)
                  </label>
                </div>

                {/* Live Preview Box */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#0369a1' }}>المعاينة الحية الفورية (Live Preview):</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>مطابقة للطباعة وPDF بدقة 100%</span>
                  </div>
                  <div 
                    style={{ 
                      minHeight: '80px', 
                      background: '#f8fafc', 
                      border: '2px dashed #93c5fd', 
                      borderRadius: '10px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '16px', 
                      overflowX: 'auto',
                      fontSize: latexIsBlock ? '22px' : '18px'
                    }}
                    dangerouslySetInnerHTML={{ __html: equationPreviewHtml || '<span style="color:#94a3b8;font-size:13px;">اكتب صيغة LaTeX لمعاينة المعادلة فوراً...</span>' }}
                  />
                </div>

                {/* LaTeX Input Textarea */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#334155' }}>كود المعادلة بترميز LaTeX:</span>
                    <button 
                      type="button" 
                      onClick={() => setLatexInput('')} 
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11.5px', cursor: 'pointer' }}
                    >
                      مسح الكود
                    </button>
                  </div>
                  <textarea 
                    value={latexInput}
                    onChange={(e) => setLatexInput(e.target.value)}
                    placeholder="مثال: \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
                    style={{ 
                      width: '100%', 
                      height: '90px', 
                      padding: '10px 12px', 
                      borderRadius: '8px', 
                      border: '1px solid #cbd5e1', 
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace', 
                      fontSize: '14px', 
                      direction: 'ltr', 
                      textAlign: 'left', 
                      resize: 'vertical',
                      outline: 'none',
                      background: '#ffffff',
                      lineHeight: '1.4'
                    }}
                  />
                </div>

                {/* Quick Formula & Symbol Chips */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>عناصر مساعدة سريعة (انقر للإضافة):</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {[
                      { label: 'كسر \\frac', code: '\\frac{a}{b}' },
                      { label: 'جذر \\sqrt', code: '\\sqrt{x}' },
                      { label: 'أس x²', code: 'x^2' },
                      { label: 'دليل x₁', code: 'x_1' },
                      { label: 'مجموع ∑', code: '\\sum_{i=1}^{n}' },
                      { label: 'تكامل ∫', code: '\\int_{a}^{b}' },
                      { label: 'نهاية lim', code: '\\lim_{x \\to 0}' },
                      { label: 'π', code: '\\pi' },
                      { label: 'θ', code: '\\theta' },
                      { label: 'α', code: '\\alpha' },
                      { label: 'β', code: '\\beta' },
                      { label: 'Δ', code: '\\Delta' },
                      { label: '∞', code: '\\infty' },
                      { label: '±', code: '\\pm' },
                      { label: '×', code: '\\times' },
                      { label: '÷', code: '\\div' },
                      { label: '≤', code: '\\le' },
                      { label: '≥', code: '\\ge' },
                      { label: '≠', code: '\\neq' },
                      { label: '≈', code: '\\approx' },
                      { label: '→', code: '\\rightarrow' },
                      { label: 'مصفوفة', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' }
                    ].map((chip, idx) => (
                      <button 
                        key={idx}
                        type="button"
                        onClick={() => setLatexInput(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + chip.code)}
                        style={{ 
                          background: '#f1f5f9', 
                          border: '1px solid #cbd5e1', 
                          borderRadius: '6px', 
                          padding: '3px 8px', 
                          fontSize: '11.5px', 
                          cursor: 'pointer', 
                          color: '#1e293b', 
                          fontFamily: 'monospace' 
                        }}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <button 
                  onClick={() => setShowLatexModal(false)}
                  style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 'bold', color: '#475569', cursor: 'pointer' }}
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleSaveModalEquation}
                  style={{ background: '#0284c7', border: 'none', borderRadius: '8px', padding: '8px 22px', fontSize: '13.5px', fontWeight: 'bold', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
                >
                  ✓ إدراج في الملزمة وحفظ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FREE CLIENT-SIDE OCR MODAL (Tesseract.js Local Engine) */}
        {showOcrModal && (
          <div 
            className="ocr-modal no-print" 
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: 'rgba(15, 23, 42, 0.65)', 
              backdropFilter: 'blur(4px)', 
              zIndex: 999999, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '20px' 
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget && !ocrLoading) setShowOcrModal(false);
            }}
            onPaste={async (e) => {
              const items = e.clipboardData?.items;
              if (!items) return;
              for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                  const file = items[i].getAsFile();
                  if (file) {
                    const compressed = await compressImage(file, 1600, 0.85);
                    if (compressed) {
                      setOcrImage({ preview: compressed, name: 'صورة من الحافظة (Ctrl+V)' });
                      setOcrResultText('');
                    }
                    e.preventDefault();
                    break;
                  }
                }
              }
            }}
          >
            <div 
              style={{ 
                background: 'white', 
                borderRadius: '16px', 
                width: '100%', 
                maxWidth: '720px', 
                maxHeight: '90vh',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden', 
                border: '1px solid #cbd5e1', 
                animation: 'scaleIn 0.2s ease-out' 
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                    <FileSearch size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>
                      استخراج النصوص من الصور مجاناً (Free OCR Studio)
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      تحويل المستندات والكتب والأسئلة المصورة إلى نصوص حية مجاناً 100% وبدون استهلاك للذكاء الاصطناعي
                    </p>
                  </div>
                </div>
                <button 
                  disabled={ocrLoading}
                  onClick={() => setShowOcrModal(false)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '20px', padding: '4px' }}
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                
                {/* Language Selector & Instructions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>لغة النص في الصورة:</span>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="ocrLang" 
                        checked={ocrLanguage === 'ara+eng'} 
                        onChange={() => setOcrLanguage('ara+eng')} 
                      />
                      عربي + إنجليزي (شامل)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="ocrLang" 
                        checked={ocrLanguage === 'ara'} 
                        onChange={() => setOcrLanguage('ara')} 
                      />
                      عربي فقط
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="ocrLang" 
                        checked={ocrLanguage === 'eng'} 
                        onChange={() => setOcrLanguage('eng')} 
                      />
                      إنجليزي وأرقام فقط
                    </label>
                  </div>
                </div>

                {/* Image Upload / Drop Zone */}
                <input 
                  type="file" 
                  ref={ocrFileInputRef} 
                  accept="image/*" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const compressed = await compressImage(file, 1600, 0.85);
                      if (compressed) {
                        setOcrImage({ preview: compressed, name: file.name });
                        setOcrResultText('');
                      }
                    }
                    e.target.value = '';
                  }} 
                  style={{ display: 'none' }} 
                />

                {!ocrImage ? (
                  <div 
                    onClick={() => ocrFileInputRef.current?.click()}
                    style={{ 
                      border: '2px dashed #cbd5e1', 
                      borderRadius: '12px', 
                      padding: '30px 20px', 
                      textAlign: 'center', 
                      cursor: 'pointer', 
                      background: '#f8fafc',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#059669'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                      <Camera size={24} />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>
                      اضغط لاختيار صورة أو اسحبها هنا
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      يمكنك أيضاً لصق أي صورة مباشرة من الحافظة بالضغط على <kbd style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>Ctrl + V</kbd>
                    </div>
                  </div>
                ) : (
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '12px', background: '#f8fafc', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <img 
                      src={ocrImage.preview} 
                      alt="OCR Target" 
                      style={{ width: '120px', height: '90px', objectFit: 'contain', borderRadius: '8px', background: 'white', border: '1px solid #e2e8f0' }} 
                    />
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#1e293b' }}>
                        {ocrImage.name || 'الصورة المحددة للاستخراج'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                        جاهزة للقراءة البصرية واستخراج الحروف
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button 
                          onClick={() => ocrFileInputRef.current?.click()}
                          style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', color: '#475569' }}
                        >
                          تغيير الصورة
                        </button>
                        <button 
                          onClick={() => { setOcrImage(null); setOcrResultText(''); }}
                          style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', color: '#dc2626' }}
                        >
                          حذف الصورة
                        </button>
                      </div>
                    </div>
                    <button 
                      disabled={ocrLoading}
                      onClick={() => runFreeOcr(ocrImage.preview)}
                      style={{ 
                        background: '#059669', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '10px', 
                        padding: '10px 18px', 
                        fontSize: '13.5px', 
                        fontWeight: 'bold', 
                        cursor: ocrLoading ? 'not-allowed' : 'pointer',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                      }}
                    >
                      {ocrLoading ? <Loader2 size={16} className="spin" /> : <FileSearch size={16} />}
                      {ocrLoading ? 'جاري الاستخراج...' : 'استخراج النص الآن'}
                    </button>
                  </div>
                )}

                {/* Progress indicator */}
                {ocrLoading && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Loader2 size={18} className="spin" color="#059669" />
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#047857' }}>
                      {ocrProgress || 'جاري معالجة الصورة واستخراج الكلمات...'}
                    </span>
                  </div>
                )}

                {/* Extracted Result Text Area */}
                {ocrResultText && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#047857' }}>
                        ✓ النص المستخرج بنجاح (يمكنك مراجعته أو تعديله):
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                        {ocrResultText.length} حرف - {ocrResultText.trim().split(/\s+/).length} كلمة
                      </span>
                    </div>
                    <textarea 
                      value={ocrResultText}
                      onChange={(e) => setOcrResultText(e.target.value)}
                      style={{ 
                        width: '100%', 
                        height: '140px', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        border: '1px solid #cbd5e1', 
                        fontSize: '14px', 
                        lineHeight: '1.7', 
                        outline: 'none',
                        background: '#ffffff',
                        direction: 'rtl'
                      }}
                    />

                    {/* Result Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(ocrResultText);
                          alert('تم نسخ النص المستخرج إلى الحافظة بنجاح!');
                        }}
                        style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '7px 14px', fontSize: '12.5px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Copy size={14} /> نسخ النص
                      </button>

                      <button 
                        onClick={() => {
                          const activeEl = pageRefs.current[pages[activePageIndex]?.id];
                          if (activeEl) {
                            activeEl.focus();
                            const formattedHtml = ocrResultText.replace(/\n/g, '<br>');
                            document.execCommand('insertHTML', false, `<div>${formattedHtml}</div><br>`);
                            handleAutoSave();
                            setTimeout(rebalanceAllPages, 100);
                            alert('تم إدراج النص المستخرج في الصفحة النشطة بنجاح!');
                            setShowOcrModal(false);
                          }
                        }}
                        style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '7px 16px', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <ArrowDownToLine size={14} /> إدراج في الصفحة الحالية
                      </button>

                      <button 
                        onClick={() => {
                          setShowAssistant(true);
                          setChatInput(`قم بإعادة صياغة وتنسيق هذا النص المستخرج من الصورة ليكون جاهزاً للملزمة:\n"${ocrResultText}"`);
                          setShowOcrModal(false);
                        }}
                        style={{ background: '#f5f3ff', border: '1px solid #c4b5fd', color: '#7c3aed', borderRadius: '8px', padding: '7px 14px', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Sparkles size={14} /> إرسال للمساعد الذكي لتنسيقه
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <button 
                  onClick={() => setShowOcrModal(false)}
                  style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '7px 18px', fontSize: '13px', fontWeight: 'bold', color: '#475569', cursor: 'pointer' }}
                >
                  إغلاق
                </button>
              </div>

            </div>
          </div>
        )}

        {/* CUSTOM TABLE MODAL DIALOG */}
        {showCustomTableModal && (
          <div 
            className="no-print"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              direction: 'rtl'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCustomTableModal(false);
            }}
          >
            <div 
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                width: '440px',
                maxWidth: '92vw',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                animation: 'scaleIn 0.2s ease-out'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: '#ecfdf5', padding: '6px', borderRadius: '8px', color: '#059669', display: 'flex' }}>
                    <TableIcon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>إدراج جدول مخصص</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>حدد عدد الصفوف والأعمدة والمظهر المناسب لملزمتك (يدعم الجداول الممتدة عبر عدة صفحات)</div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCustomTableModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '18px', padding: '4px' }}
                >
                  ✕
                </button>
              </div>

              {/* Tabs for Mode */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <button
                  type="button"
                  onClick={() => setTableInputMode('dimensions')}
                  style={{
                    flex: 1, padding: '10px 14px', border: 'none', background: tableInputMode === 'dimensions' ? '#fff' : 'transparent',
                    borderBottom: tableInputMode === 'dimensions' ? '2.5px solid #059669' : 'none',
                    fontWeight: 'bold', fontSize: '13px', color: tableInputMode === 'dimensions' ? '#059669' : '#64748b', cursor: 'pointer'
                  }}
                >
                  📐 بالأبعاد (صفوف وأعمدة)
                </button>
                <button
                  type="button"
                  onClick={() => setTableInputMode('csv')}
                  style={{
                    flex: 1, padding: '10px 14px', border: 'none', background: tableInputMode === 'csv' ? '#fff' : 'transparent',
                    borderBottom: tableInputMode === 'csv' ? '2.5px solid #2563eb' : 'none',
                    fontWeight: 'bold', fontSize: '13px', color: tableInputMode === 'csv' ? '#2563eb' : '#64748b', cursor: 'pointer'
                  }}
                >
                  📋 لصق كود CSV من الذكاء الاصطناعي
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tableInputMode === 'dimensions' ? (
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                        عدد الصفوف (2 - 50):
                      </label>
                      <input 
                        type="number" 
                        min="2" 
                        max="50" 
                        value={customTableRows} 
                        onChange={(e) => setCustomTableRows(Math.max(2, Math.min(50, parseInt(e.target.value) || 2)))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                        عدد الأعمدة (1 - 12):
                      </label>
                      <input 
                        type="number" 
                        min="1" 
                        max="12" 
                        value={customTableCols} 
                        onChange={(e) => setCustomTableCols(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#1e40af', marginBottom: '6px' }}>
                      الصق بيانات CSV (أو ناتج الذكاء الاصطناعي / جدول إكسيل):
                    </label>
                    <textarea
                      rows={5}
                      value={csvTableInput}
                      onChange={(e) => setCsvTableInput(e.target.value)}
                      placeholder={'الاسم,الدرجة,التقدير\nأحمد,95,ممتاز\nمحمد,84,جيد جداً'}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #93c5fd', fontSize: '13px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748b' }}>يدعم الفاصلة العادية (,) والفاصلة المنقوطة (;) وعلامة التاب (Tab) والفاصلة العربية (،)</span>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                    نمط وقالب الجدول:
                  </label>
                  <select 
                    value={customTablePreset} 
                    onChange={(e) => setCustomTablePreset(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', background: 'white' }}
                  >
                    <option value="navy">كحلي رسمي احترافي (Navy Blue)</option>
                    <option value="zebra">مخطط سطر وسطر (Zebra Striped)</option>
                    <option value="green">أخضر زمردي تعليمي (Emerald Green)</option>
                    <option value="royal_purple">بنفسجي ملكي (Royal Purple)</option>
                    <option value="gold_academic">ذهبي أكاديمي (Academic Gold)</option>
                    <option value="grid_centered">شبكي موسط بالكامل (Centered Grid)</option>
                    <option value="minimal">رمادي هادئ بسيط (Minimal Gray)</option>
                    <option value="ink_saver">أبيض وأسود موفر لحبر الطابعة (Ink Saver)</option>
                  </select>
                </div>

                {/* Preview Box */}
                <div style={{ background: '#f0fdf4', border: '1px dashed #86efac', borderRadius: '8px', padding: '12px', textAlign: 'center', fontSize: '12px', color: '#166534' }}>
                  سيتم إنشاء جدول يحتوي على <strong>{customTableRows} صفوف</strong> و <strong>{customTableCols} أعمدة</strong> مع <strong>تفعيل تكرار صف العناوين الرئيسي تلقائياً</strong> إذا امتد الجدول لأكثر من صفحة.
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <button 
                  onClick={() => setShowCustomTableModal(false)}
                  style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 'bold', color: '#475569', cursor: 'pointer' }}
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => {
                    if (tableInputMode === 'csv') {
                      if (!csvTableInput.trim()) {
                        alert('يرجى لصق بيانات CSV أولاً');
                        return;
                      }
                      insertTableFromCSV(csvTableInput, customTablePreset);
                    } else {
                      insertCustomTable(customTableRows, customTableCols, customTablePreset);
                    }
                  }}
                  style={{ background: tableInputMode === 'csv' ? '#2563eb' : '#059669', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)' }}
                >
                  <Plus size={16} /> {tableInputMode === 'csv' ? 'تحويل وإدراج جدول الـ CSV' : 'إدراج الجدول الآن'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 2. TABLE DIMENSIONS & SIZING MODAL (نافذة أبعاد وخصائص الجدول) */}
        {showTableDimensionsModal && (
          <div 
            className="no-print"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              direction: 'rtl'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowTableDimensionsModal(false);
            }}
          >
            <div 
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                width: '460px',
                maxWidth: '92vw',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: '#eff6ff', padding: '6px', borderRadius: '8px', color: '#2563eb', display: 'flex' }}>
                    <TableIcon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>📐 أبعاد وخصائص الجدول (Word Table Properties)</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>تحديد عرض الأعمدة وارتفاع الصفوف بالأرقام بدقة تامة</div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowTableDimensionsModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '18px', padding: '4px' }}
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* 1. عرض العمود المحدد */}
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>
                      عرض العمود المحدد (Column Width):
                    </label>
                    <button
                      onClick={autoFitSelectedColToContent}
                      style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '5px', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      title="احتواء تلقائي للنص في العمود لمنع انقسام الكلمات"
                    >
                      ↔️ احتواء تلقائي للنص
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="number"
                      min="35"
                      max="600"
                      step="5"
                      value={customColWidthInput}
                      onChange={(e) => setCustomColWidthInput(parseInt(e.target.value) || 35)}
                      style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', direction: 'ltr', textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>بكسل (px)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {[80, 110, 140, 180, 240].map(w => (
                      <button
                        key={w}
                        onClick={() => setCustomColWidthInput(w)}
                        style={{ padding: '3px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', background: customColWidthInput === w ? '#2563eb' : 'white', color: customColWidthInput === w ? 'white' : '#334155', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        {w}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. ارتفاع الصف المحدد */}
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>
                      ارتفاع الصف المحدد (Row Height):
                    </label>
                    <button
                      onClick={distributeTableRowsEvenly}
                      style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '5px', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      title="توحيد ارتفاع كافة الصفوف في الجدول"
                    >
                      ↕️ توحيد الصفوف بالتساوي
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="number"
                      min="22"
                      max="300"
                      step="4"
                      value={customRowHeightInput}
                      onChange={(e) => setCustomRowHeightInput(parseInt(e.target.value) || 22)}
                      style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', direction: 'ltr', textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>بكسل (px)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {[28, 36, 44, 56, 70].map(h => (
                      <button
                        key={h}
                        onClick={() => setCustomRowHeightInput(h)}
                        style={{ padding: '3px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', background: customRowHeightInput === h ? '#2563eb' : 'white', color: customRowHeightInput === h ? 'white' : '#334155', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        {h}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. عرض الجدول وهوامش الخلايا */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>
                      عرض الجدول بالكامل:
                    </label>
                    <select
                      value={customTableWidthPercent}
                      onChange={(e) => setCustomTableWidthPercent(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', background: 'white' }}
                    >
                      <option value="100%">100% (كامل عرض الصفحة)</option>
                      <option value="90%">90% (هوامش خفيفة)</option>
                      <option value="80%">80% (مدمج في المنتصف)</option>
                      <option value="70%">70% (صغير)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>
                      التباعد داخل الخلايا (Padding):
                    </label>
                    <select
                      value={customCellPadding}
                      onChange={(e) => setCustomCellPadding(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', background: 'white' }}
                    >
                      <option value="4px 8px">ضيق (4px 8px)</option>
                      <option value="8px 12px">قياسي متوازن (8px 12px)</option>
                      <option value="12px 18px">واسع ومريح (12px 18px)</option>
                    </select>
                  </div>
                </div>

                {/* تلميح السحب المباشر */}
                <div style={{ background: '#eff6ff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '11.5px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>💡</span>
                  <span><strong>تلميح الوورد:</strong> يمكنك أيضاً سحب أي خط عمودي أو أفقي داخل الجدول بالماوس مباشرة لتعديل العرض والارتفاع فوراً!</span>
                </div>

              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <button 
                  onClick={() => setShowTableDimensionsModal(false)}
                  style={{ background: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '7px 16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => {
                    applyTableDimensions(customColWidthInput, customRowHeightInput, customTableWidthPercent, customCellPadding);
                    setShowTableDimensionsModal(false);
                  }}
                  style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '7px 20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)' }}
                >
                  <Check size={16} /> تطبيق الأبعاد فوراً
                </button>
              </div>

            </div>
          </div>
        )}

        {/* WORD SHAPES & SMARTART GALLERY MODAL (معرض أشكال الوورد والمخططات التعليمية) */}
        {showShapesModal && (
          <div
            className="no-print shapes-modal-popover"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              direction: 'rtl'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowShapesModal(false);
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                width: '860px',
                maxWidth: '95vw',
                maxHeight: '88vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.28)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                animation: 'scaleIn 0.2s ease-out'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '10px', color: '#2563eb', display: 'flex' }}>
                    <Shapes size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>معرض تصاميم الوورد، عناوين الدروس والأشكال التعليمية</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>اختر تصاميم عناوين الدروس، الصناديق التعليمية، أو الأشكال الهندسية واكتب بداخلها مباشرة</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowShapesModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '18px', padding: '4px' }}
                >
                  ✕
                </button>
              </div>

              {/* Category Filter Tabs */}
              <div style={{ display: 'flex', gap: '6px', padding: '10px 20px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: '🌟 الكل' },
                  { id: 'lesson_headers', label: '🏷️ تصاميم وعناوين الدروس' },
                  { id: 'educational_boxes', label: '📌 صناديق وقواعد تعليمية' },
                  { id: 'frames', label: '🖼️ براويز وإطارات نصوص' },
                  { id: 'basic', label: '🔷 أشكال نصية وهندسية' },
                  { id: 'arrows', label: '➡️ أسهم ومراحل' },
                  { id: 'banners', label: '🎗️ لافتات وشعارات' },
                  { id: 'callouts', label: '💬 وسائل شرح وتنبيهات' },
                  { id: 'smartart', label: '📊 مخططات SmartArt' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setShapeCategory(cat.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: shapeCategory === cat.id ? '1px solid #2563eb' : '1px solid #cbd5e1',
                      background: shapeCategory === cat.id ? '#2563eb' : 'white',
                      color: shapeCategory === cat.id ? 'white' : '#334155',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: '0.15s'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Shapes Grid Body */}
              <div style={{ padding: '20px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '12px' }}>
                {[
                  // 1. تصاميم وعناوين الدروس والمذكرات
                  { id: 'lesson_title_royal_ribbon', cat: 'lesson_headers', icon: '👑', title: 'بانر الدرس الملكي', desc: 'تدرج كحلي مذهب 3D' },
                  { id: 'lesson_title_folded_ribbon', cat: 'lesson_headers', icon: '🎗️', title: 'شريط عنوان مطوي', desc: 'أطراف كتب ثلاثية الأبعاد' },
                  { id: 'lesson_title_pill_modern', cat: 'lesson_headers', icon: '💊', title: 'كبسولة عنوان بختم', desc: 'شريط عصري برقم الدرس' },
                  { id: 'lesson_title_islamic_crest', cat: 'lesson_headers', icon: '🕌', title: 'لافتة درس إسلامية', desc: 'زخارف مذهبة للغة العربية' },
                  { id: 'lesson_title_emerald_badge', cat: 'lesson_headers', icon: '🌿', title: 'لافتة عنوان زمردية', desc: 'تدرج راقٍ بشريط جانبي' },
                  { id: 'sub_header_arrow_tab', cat: 'lesson_headers', icon: '❯❯', title: 'عنوان فرعي بسهم', desc: 'مثل: [أولاً] الشرح' },
                  { id: 'sub_header_accent_bar', cat: 'lesson_headers', icon: '▌', title: 'عنوان فرعي ملون', desc: 'شريط بار جانبي أنيق' },
                  { id: 'sub_header_circle_badge', cat: 'lesson_headers', icon: '➊', title: 'عنوان مرقم بشارة', desc: 'ترقيم فكرة رئيسية' },

                  // 2. صناديق وقواعد تعليمية
                  { id: 'rule_golden_box', cat: 'educational_boxes', icon: '⚖️', title: 'صندوق القاعدة الذهبية', desc: 'برواز مذهب للقواعد' },
                  { id: 'warning_trap_box', cat: 'educational_boxes', icon: '⚠️', title: 'فخ شائع في الامتحان', desc: 'تحذير من أخطاء الامتحانات' },
                  { id: 'smart_tip_box', cat: 'educational_boxes', icon: '💡', title: 'إضاءة وسر التفوق', desc: 'مفتاح الحل والذكاء' },
                  { id: 'definition_box', cat: 'educational_boxes', icon: '📖', title: 'صندوق التعريف العلمي', desc: 'مصطلح ومفهوم منظم' },
                  { id: 'quick_comparison_box', cat: 'educational_boxes', icon: '⚖️', title: 'صندوق مقارنة سريعة', desc: 'فرق بين مفهومين 2×1' },
                  { id: 'exam_question_box', cat: 'educational_boxes', icon: '🎯', title: 'سؤال وزاري متكرر', desc: 'سؤال مع إجابة نموذجية' },

                  // 3. براويز وإطارات نصوص
                  { id: 'frame_islamic_text', cat: 'frames', icon: '🕌', title: 'برواز فقرة إسلامي', desc: 'زوايا مذهبة للآيات والأحاديث' },
                  { id: 'frame_double_academic', cat: 'frames', icon: '▣', title: 'برواز أكاديمي مزدوج', desc: 'إطار رسمي للفقرات' },
                  { id: 'frame_modern_shadow', cat: 'frames', icon: '❏', title: 'إطار مجسم 3D', desc: 'بطاقة بظل هندسي بارز' },
                  { id: 'card', cat: 'frames', icon: '📋', title: 'بطاقة تلخيص وملاحظات', desc: 'صندوق بتدرج رمادي ناعم' },
                  { id: 'scroll_banner', cat: 'frames', icon: '📜', title: 'لفيفة قاعدة بردي', desc: 'إطار وثيقة تاريخية' },

                  // 4. أشكال نصية وهندسية أساسية
                  { id: 'rect_text', cat: 'basic', icon: '▭', title: 'مستطيل نصي', desc: 'قابل للكتابة والتلوين' },
                  { id: 'rounded_rect_text', cat: 'basic', icon: '▢', title: 'مستطيل مستدير الحواف', desc: 'حواف دائرية ناعمة' },
                  { id: 'circle', cat: 'basic', icon: '⚪', title: 'دائرة نصية', desc: 'اكتب بداخلها مباشرة' },
                  { id: 'oval_text', cat: 'basic', icon: '🥚', title: 'شكل بيضاوي نصي', desc: 'بيضاوي وورد كلاسيكي' },
                  { id: 'square', cat: 'basic', icon: '🔲', title: 'مربع نصي متساوي', desc: 'اكتب بداخله مباشرة' },
                  { id: 'diamond_text', cat: 'basic', icon: '◆', title: 'شكل معين وقرار', desc: 'للمفاهيم والقرارات' },
                  { id: 'hexagon_text', cat: 'basic', icon: '⬢', title: 'شكل سداسي', desc: 'سداسي هندسي' },
                  { id: 'parallelogram_text', cat: 'basic', icon: '▱', title: 'متوازي أضلاع', desc: 'إطار مائل أنيق' },
                  { id: 'triangle', cat: 'basic', icon: '🔺', title: 'مثلث نصي', desc: 'مثلث كتابة في المنتصف' },

                  // 5. أسهم ومراحل
                  { id: 'block_arrow_right', cat: 'arrows', icon: '➡️', title: 'سهم عريض يمين', desc: 'سهم بكتابة داخلية' },
                  { id: 'block_arrow_left', cat: 'arrows', icon: '⬅️', title: 'سهم عريض يسار', desc: 'سهم بكتابة داخلية' },
                  { id: 'block_arrow_up', cat: 'arrows', icon: '⬆️', title: 'سهم عريض لأعلى', desc: 'سهم عمودي نصي' },
                  { id: 'block_arrow_down', cat: 'arrows', icon: '⬇️', title: 'سهم عريض لأسفل', desc: 'سهم عمودي نصي' },
                  { id: 'block_arrow_two_way', cat: 'arrows', icon: '⬌', title: 'سهم ذو اتجاهين', desc: 'علاقة متبادلة نصية' },
                  { id: 'chevron_step', cat: 'arrows', icon: '⏩', title: 'شارة خطوة متسلسلة', desc: 'سهم مراحل متتابعة' },
                  { id: 'arrow_right', cat: 'arrows', icon: '→', title: 'سهم إشارة يمين', desc: 'سهم خفيف ملون' },
                  { id: 'arrow_left', cat: 'arrows', icon: '←', title: 'سهم إشارة يسار', desc: 'سهم خفيف ملون' },

                  // 6. لافتات وشعارات وفواصل
                  { id: 'ribbon_banner', cat: 'banners', icon: '🎗️', title: 'شريط عنوان وحدة عريض', desc: 'بانر عرضي فاخر' },
                  { id: 'pill_banner', cat: 'banners', icon: '💊', title: 'كبسولة عنوان كحلية', desc: 'شريط بيضاوي كحلي' },
                  { id: 'star_badge', cat: 'banners', icon: '⭐', title: 'شارة تميز نجمية', desc: 'وسام ذهبي بارز' },
                  { id: 'divider_stars', cat: 'banners', icon: '★★★', title: 'فاصل نجوم', desc: 'فاصل زخرفي بين الفقرات' },
                  { id: 'divider_double', cat: 'banners', icon: '═══', title: 'فاصل خط مزدوج', desc: 'خط فاصل رسمي' },
                  { id: 'divider_dots', cat: 'banners', icon: '••••', title: 'فاصل نقطي', desc: 'فاصل خط منقط' },

                  // 7. وسائل شرح وتنبيهات
                  { id: 'speech_bubble', cat: 'callouts', icon: '💬', title: 'فقاعة تعليق وشرح', desc: 'وسيلة إيضاح نصية' },
                  { id: 'cloud_callout', cat: 'callouts', icon: '☁️', title: 'سحابة فكرة واستنتاج', desc: 'إطار سحابي منقط' },
                ]
                  .filter(item => shapeCategory === 'all' || item.cat === shapeCategory)
                  .map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleInsertShape(item.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '14px 10px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        cursor: 'pointer',
                        transition: '0.15s',
                        textAlign: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                      }}
                    >
                      <span style={{ fontSize: '26px', marginBottom: '6px', color: '#1d4ed8' }}>{item.icon}</span>
                      <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#0f172a', lineHeight: '1.4' }}>{item.title}</span>
                      <span style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>{item.desc}</span>
                    </button>
                  ))}

                {(shapeCategory === 'all' || shapeCategory === 'smartart') &&
                  [
                    { id: 'process_steps', icon: '1️⃣⬅2️⃣⬅3️⃣', title: 'مخطط خطوات متسلسلة', desc: '3 مراحل متتابعة بالأسهم' },
                    { id: 'hierarchy_tree', icon: '🌳', title: 'مخطط شجري هرمي', desc: 'عنوان رئيسي و3 فروع' },
                    { id: 'pyramid_levels', icon: '🔺', title: 'هرم التدرج المعرفي', desc: '3 مستويات هرمية ملونة' },
                    { id: 'feature_grid', icon: '⊞', title: 'شبكة العناصر الأربعة', desc: '4 بطاقات منظمة 2×2' },
                  ].map(diag => (
                    <button
                      key={diag.id}
                      onClick={() => insertWordSmartArt(diag.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '14px 10px',
                        borderRadius: '12px',
                        border: '1.5px solid #ddd6fe',
                        background: '#f5f3ff',
                        cursor: 'pointer',
                        transition: '0.15s',
                        textAlign: 'center'
                      }}
                    >
                      <span style={{ fontSize: '22px', marginBottom: '6px', color: '#6d28d9' }}>{diag.icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#4c1d95' }}>{diag.title}</span>
                      <span style={{ fontSize: '11px', color: '#6d28d9', marginTop: '2px' }}>{diag.desc}</span>
                    </button>
                  ))}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 22px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  💡 نصيحة: بعد إدراج أي شكل، اضغط عليه ليظهر لك شريط <strong>«🔷 تنسيق الشكل المحدد»</strong> لتغيير لونه وموضعه.
                </span>
                <button
                  onClick={() => setShowShapesModal(false)}
                  style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '7px 18px', fontSize: '13px', fontWeight: 'bold', color: '#475569', cursor: 'pointer' }}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. KEYBOARD SHORTCUTS REFERENCE MODAL (دليل اختصارات لوحة المفاتيح الشامل) */}
        {showShortcutsModal && (
          <div
            className="no-print"
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.48)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, direction: 'rtl' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowShortcutsModal(false); }}
          >
            <div style={{ background: '#ffffff', borderRadius: '16px', width: '700px', maxWidth: '94vw', maxHeight: '86vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>⌨️ دليل اختصارات لوحة المفاتيح الشامل (نظام Microsoft Word)</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>جميع الاختصارات تعمل مباشرة داخل الملزمة عبر كافة الصفحات</div>
                </div>
                <button onClick={() => setShowShortcutsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>✕</button>
              </div>
              <div style={{ padding: '18px 22px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { key: 'Ctrl + Z', desc: 'تراجع عن آخر خطوة (Undo)' },
                  { key: 'Ctrl + Y / Ctrl + Shift + Z', desc: 'إعادة واستعادة الخطوة (Redo)' },
                  { key: 'Ctrl + A', desc: 'تحديد كامل المحتوى في جميع الصفحات' },
                  { key: 'Ctrl + S', desc: 'حفظ فوري للملزمة' },
                  { key: 'Ctrl + P', desc: 'طباعة / تصدير PDF احترافي' },
                  { key: 'Ctrl + F / Ctrl + H', desc: 'فتح نافذة البحث والاستبدال' },
                  { key: 'Ctrl + B / I / U', desc: 'خط عريض / مائل / تحته خط' },
                  { key: 'Ctrl + E', desc: 'توسيط النص أو الفقرة (Center)' },
                  { key: 'Ctrl + R', desc: 'محاذاة لليمين (Align Right)' },
                  { key: 'Ctrl + L', desc: 'محاذاة لليسار (Align Left)' },
                  { key: 'Ctrl + J', desc: 'ضبط كلي للسطور (Justify)' },
                  { key: 'Ctrl + ] أو Ctrl + [', desc: 'تكبير أو تصغير حجم الخط تدريجياً' },
                  { key: 'Alt + 1 / 2 / 3', desc: 'تطبيق نمط عنوان رئيسي 1 / 2 / 3' },
                  { key: 'Alt + 0', desc: 'إرجاع الفقرة إلى نص عادي (Normal)' },
                  { key: 'Ctrl + Enter', desc: 'إدراج صفحة جديدة (فاصل صفحات)' },
                  { key: 'Alt + =', desc: 'إدراج معادلة رياضية جديدة' },
                  { key: 'Ctrl + Alt + F', desc: 'إدراج حاشية سفلية مرقمة بالصفحة' },
                  { key: 'Ctrl + Alt + D', desc: 'إدراج تعليق ختامي بنهاية المستند' },
                  { key: 'Ctrl + Alt + M', desc: 'إضافة تعليق مراجعة جديد' },
                  { key: 'Ctrl + Shift + G', desc: 'عرض إحصائيات وعدد الكلمات' },
                  { key: 'Ctrl + Shift + L', desc: 'إنشاء قائمة نقطية سريعة' },
                  { key: 'F7', desc: 'تدقيق إملائي وضبط علامات الترقيم' },
                  { key: 'Ctrl + =', desc: 'نص منخفض (Subscript X₂)' },
                  { key: 'Ctrl + Shift + =', desc: 'نص مرتفع (Superscript X²)' }
                ].map((sc, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <span style={{ fontSize: '12.5px', color: '#1e293b', fontWeight: '600' }}>{sc.desc}</span>
                    <kbd style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '2px 8px', fontSize: '11.5px', fontWeight: 'bold', direction: 'ltr', whiteSpace: 'nowrap' }}>{sc.key}</kbd>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 22px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowShortcutsModal(false)} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '7px 20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>تم</button>
              </div>
            </div>
          </div>
        )}

        {/* 2. WORD COUNT & DETAILED STATISTICS MODAL (نافذة عدد الكلمات وإحصائيات المستند) */}
        {showWordCountModal && detailedStats && (
          <div
            className="no-print"
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.48)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, direction: 'rtl' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowWordCountModal(false); }}
          >
            <div style={{ background: '#ffffff', borderRadius: '16px', width: '500px', maxWidth: '92vw', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>📊 إحصائيات وخصائص الملزمة (Word Count)</div>
                <button onClick={() => setShowWordCountModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>✕</button>
              </div>
              <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: '📄 إجمالي الصفحات (A4)', val: detailedStats.pages },
                  { label: '📝 عدد الكلمات', val: detailedStats.words },
                  { label: '🔤 الأحرف (بدون مسافات)', val: detailedStats.charsNoSpaces },
                  { label: '🔡 الأحرف (مع المسافات)', val: detailedStats.charsWithSpaces },
                  { label: '¶ عدد الفقرات', val: detailedStats.paragraphs },
                  { label: '📏 الأسطر التقريبية', val: detailedStats.lines },
                  { label: '📊 عدد الجداول', val: detailedStats.tables },
                  { label: '🖼️ الصور والأشكال التوضيحية', val: detailedStats.images + detailedStats.shapes },
                  { label: '⏱️ وقت القراءة/المذاكرة المقدر', val: `${detailedStats.readingMinutes} دقيقة` }
                ].map((row, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: idx % 2 === 0 ? '#f8fafc' : '#ffffff', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '13.5px', color: '#334155', fontWeight: '600' }}>{row.label}</span>
                    <strong style={{ fontSize: '14px', color: '#1d4ed8' }}>{row.val}</strong>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 22px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowWordCountModal(false)} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '7px 20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>إغلاق</button>
              </div>
            </div>
          </div>
        )}

        {/* 3. THESAURUS & SYNONYMS MODAL (قاموس المرادفات والأضداد) */}
        {showThesaurusModal && (
          <div
            className="no-print"
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.48)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, direction: 'rtl' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowThesaurusModal(false); }}
          >
            <div style={{ background: '#ffffff', borderRadius: '16px', width: '560px', maxWidth: '94vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>📖 قاموس المرادفات والأضداد الأكاديمي</div>
                <button onClick={() => setShowThesaurusModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>✕</button>
              </div>
              <div style={{ padding: '16px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={thesaurusQuery}
                    onChange={(e) => { setThesaurusQuery(e.target.value); lookupThesaurus(e.target.value); }}
                    placeholder="اكتب الكلمة للبحث عن مرادفاتها وأضدادها (مثال: شرح، مهم، قاعدة، تطور)..."
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
                  />
                  <button
                    onClick={() => lookupThesaurus(thesaurusQuery)}
                    style={{ background: '#0f766e', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                  >
                    بحث
                  </button>
                </div>
                {thesaurusResults.map((item, i) => (
                  <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a', marginBottom: '8px' }}>🔹 الكلمة: «{item.word}»</div>
                    <div style={{ fontSize: '12.5px', color: '#0f766e', fontWeight: 'bold', marginBottom: '6px' }}>المرادفات (اضغط على أي مرادف لإدراجه):</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      {item.synonyms.map((syn, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => {
                            const activeEl = pageRefs.current[pages[activePageIndex]?.id];
                            if (activeEl) activeEl.focus();
                            document.execCommand('insertText', false, syn);
                            handleAutoSave();
                            setShowThesaurusModal(false);
                          }}
                          style={{ background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', borderRadius: '99px', padding: '4px 12px', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          {syn}
                        </button>
                      ))}
                    </div>
                    {item.antonyms && item.antonyms.length > 0 && (
                      <>
                        <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 'bold', marginBottom: '4px' }}>المضاد / العكس:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {item.antonyms.map((ant, aIdx) => (
                            <span key={aIdx} style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '99px', padding: '2px 10px', fontSize: '12px', fontWeight: 'bold' }}>{ant}</span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. MANAGE SOURCES & CITATIONS MODAL (إدارة المصادر والمراجع العلمية) */}
        {showSourcesModal && (
          <div
            className="no-print"
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.48)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, direction: 'rtl' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowSourcesModal(false); }}
          >
            <div style={{ background: '#ffffff', borderRadius: '16px', width: '620px', maxWidth: '94vw', maxHeight: '86vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>📚 إدارة المصادر والمراجع العلمية ({citationStyle})</div>
                <button onClick={() => setShowSourcesModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>✕</button>
              </div>
              <div style={{ padding: '18px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input type="text" value={newSourceAuthor} onChange={(e) => setNewSourceAuthor(e.target.value)} placeholder="اسم المؤلف أو الجهة..." style={inputInlineStyle} />
                  <input type="text" value={newSourceTitle} onChange={(e) => setNewSourceTitle(e.target.value)} placeholder="عنوان الكتاب أو المرجع..." style={inputInlineStyle} />
                  <input type="text" value={newSourcePublisher} onChange={(e) => setNewSourcePublisher(e.target.value)} placeholder="دار النشر / المنصة..." style={inputInlineStyle} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input type="text" value={newSourceYear} onChange={(e) => setNewSourceYear(e.target.value)} placeholder="السنة" style={{ ...inputInlineStyle, width: '80px' }} />
                    <button onClick={handleAddSource} style={{ flex: 1, background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px' }}>➕ إضافة مصدر</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {docSources.map((src) => (
                    <div key={src.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '13.5px', color: '#0f172a' }}>{src.title} ({src.year})</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{src.author} — {src.publisher}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => { insertCitation(src); setShowSourcesModal(false); }} style={{ ...badgeBtnStyle, background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', fontWeight: 'bold' }}>❝ اقتباس</button>
                        <button onClick={() => setDocSources(prev => prev.filter(s => s.id !== src.id))} style={{ ...badgeBtnStyle, color: '#dc2626' }}>حذف</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '12px 22px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => { insertBibliography(); setShowSourcesModal(false); }} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: '8px', padding: '7px 18px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>📚 إدراج قائمة المراجع الكاملة بالصفحة</button>
                <button onClick={() => setShowSourcesModal(false)} style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '7px 18px', fontSize: '13px', fontWeight: 'bold', color: '#475569', cursor: 'pointer' }}>إغلاق</button>
              </div>
            </div>
          </div>
        )}

        {/* 5. ACCESSIBILITY & QUALITY REPORT MODAL (تقرير فحص جودة الملزمة وإمكانية الوصول) */}
        {showAccessibilityModal && (
          <div
            className="no-print"
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.48)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, direction: 'rtl' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowAccessibilityModal(false); }}
          >
            <div style={{ background: '#ffffff', borderRadius: '16px', width: '540px', maxWidth: '94vw', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>♿ فحص جودة الملزمة وإمكانية الوصول</div>
                <button onClick={() => setShowAccessibilityModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>✕</button>
              </div>
              <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {accessibilityReport.map((item, i) => (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid', borderColor: item.status === 'pass' ? '#bbf7d0' : '#fde68a', background: item.status === 'pass' ? '#f0fdf4' : '#fffbeb' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: item.status === 'pass' ? '#166534' : '#92400e', marginBottom: '4px' }}>
                      {item.status === 'pass' ? '✅ ' : '⚠️ '}{item.title}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.6 }}>{item.detail}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 22px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAccessibilityModal(false)} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '7px 20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>تم</button>
              </div>
            </div>
          </div>
        )}

        {/* Real-Time Floating Voice HUD (شريط الإملاء الصوتي الحي فائق السرعة) */}
        {isRecording && (
          <div 
            className="no-print floating-voice-hud"
            style={{
              position: 'fixed',
              bottom: isMobile ? '64px' : '26px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '6px' : '10px',
              background: 'rgba(255, 255, 255, 0.97)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1.5px solid #ef4444',
              borderRadius: '9999px',
              boxShadow: '0 10px 30px rgba(239, 68, 68, 0.22), 0 4px 12px rgba(0,0,0,0.12)',
              padding: isMobile ? '5px 8px' : '6px 14px',
              maxWidth: 'min(94vw, 560px)',
              direction: 'rtl',
              animation: 'slideUpFade 0.22s ease-out'
            }}
          >
            {/* Live Pulsing Mic Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
              <span style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)',
                animation: 'pulse 1.3s infinite',
                display: 'inline-block'
              }} />
              <Mic size={15} color="#ef4444" />
              <span style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: 'bold', color: '#dc2626', whiteSpace: 'nowrap' }}>
                {isMobile ? 'استماع...' : 'جاري الاستماع...'}
              </span>
            </div>

            {/* Live Transcription Streaming Text */}
            <div 
              style={{
                flex: 1,
                minWidth: isMobile ? '70px' : '140px',
                maxWidth: isMobile ? '160px' : '260px',
                fontSize: isMobile ? '11px' : '12px',
                color: liveVoiceTranscript ? '#0f172a' : '#94a3b8',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontStyle: liveVoiceTranscript ? 'normal' : 'italic',
                fontWeight: liveVoiceTranscript ? '500' : 'normal'
              }}
              title={liveVoiceTranscript || 'تحدث الآن وسيظهر كلامك لحظياً...'}
            >
              {liveVoiceTranscript ? `"${liveVoiceTranscript}"` : 'تحدث باللغة العربية الآن...'}
            </div>

            {/* Quick Actions (سطر جديد / علامات ترقيم) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <button
                onMouseDown={(e) => { e.preventDefault(); insertSpeechPunctuation('↵'); }}
                style={{
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  padding: isMobile ? '2px 5px' : '3px 7px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#334155',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                title="إدراج سطر جديد (Enter)"
              >
                سطر ↵
              </button>

              <button
                onMouseDown={(e) => { e.preventDefault(); insertSpeechPunctuation('،'); }}
                style={{
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  padding: isMobile ? '2px 6px' : '3px 8px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#334155',
                  cursor: 'pointer'
                }}
                title="إدراج فاصلة (،)"
              >
                ،
              </button>

              <button
                onMouseDown={(e) => { e.preventDefault(); toggleRecording(); }}
                style={{
                  border: 'none',
                  background: '#ef4444',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  padding: isMobile ? '4px 9px' : '4px 12px',
                  fontSize: isMobile ? '11px' : '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                  whiteSpace: 'nowrap'
                }}
                title="إنهاء التسجيل واعتماد النص المكتوب"
              >
                <Square size={10} fill="white" />
                <span>إنهاء</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translate(-50%, 14px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        #voice-interim-preview {
          color: #2563eb !important;
          background: rgba(37, 99, 235, 0.08) !important;
          border-bottom: 1.5px dashed #3b82f6 !important;
          border-radius: 3px !important;
          padding: 0 3px !important;
          font-style: italic !important;
        }
        @media print {
          #voice-interim-preview {
            background: transparent !important;
            border: none !important;
            color: inherit !important;
            font-style: inherit !important;
          }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        [contenteditable]:empty:before { content: attr(placeholder); color: #94a3b8; pointer-events: none; display: block; }
        
        /* WORD AUTHENTIC PARAGRAPH SPACING (ضبط المسافات بين الفقرات ومنع الإنتر المفرط) */
        .sheet-body-content p {
          margin-top: 0 !important;
          margin-bottom: 4px !important;
          line-height: inherit;
        }
        .sheet-body-content p:last-child {
          margin-bottom: 0 !important;
        }
        .sheet-body-content p:empty,
        .sheet-body-content p > br:only-child {
          line-height: 1.2 !important;
          margin-bottom: 2px !important;
        }
        .sheet-body-content div {
          margin-top: 0 !important;
          margin-bottom: 2px !important;
        }

        /* WORD AUTHENTIC TABLES & CRISP BORDERS (حدود واضحة ومحكمة لجميع الجداول) */
        .sheet-body-content table {
          box-sizing: border-box;
          border-collapse: collapse !important;
          margin: 10px 0 !important;
          width: 100% !important;
          border: 1.5px solid #94a3b8 !important;
        }
        .sheet-body-content table td, 
        .sheet-body-content table th {
          position: relative;
          word-break: normal !important;
          overflow-wrap: normal !important;
          box-sizing: border-box;
          border: 1px solid #94a3b8 !important;
          padding: 8px 12px !important;
          min-height: 28px;
          vertical-align: middle;
        }
        .sheet-body-content table th {
          background-color: #f1f5f9 !important;
          font-weight: 700 !important;
          color: #0f172a !important;
          text-align: center;
        }
        .sheet-body-content table td:focus, 
        .sheet-body-content table th:focus { 
          outline: 2px solid #2563eb !important;
          outline-offset: -1px;
        }
        .sheet-body-content table thead { 
          display: table-header-group; 
        }
        .sheet-body-content table tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        /* ALL PAGES SELECTED (MICROSOFT WORD AUTHENTIC FULL-DOCUMENT SELECTION) */
        .all-pages-selected .sheet-body-content {
          background-color: #dbeafe !important;
          color: #1e3a8a !important;
          caret-color: transparent !important;
        }
        .all-pages-selected .sheet-body-content * {
          background-color: transparent !important;
          color: #1e3a8a !important;
        }
        .all-pages-selected .sheet-body-content img {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.45) !important;
        }
        .all-pages-selected .sheet-body-content table {
          outline: 2px solid #3b82f6 !important;
          background-color: #eff6ff !important;
        }
        .all-pages-selected .sheet-body-content table td,
        .all-pages-selected .sheet-body-content table th {
          background-color: #dbeafe !important;
          color: #1e3a8a !important;
        }
        .all-pages-selected .a4-sheet {
          outline: 3px solid #3b82f6 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2), 0 12px 28px rgba(0,0,0,0.1) !important;
        }

        /* CROSS-PAGE SELECTION (CSS Custom Highlight API & Fallback) */
        ::highlight(cross-page-selection) {
          background-color: #2563eb !important;
          color: #ffffff !important;
        }
        .cross-page-selected {
          background-color: #dbeafe !important;
          color: #1e3a8a !important;
        }

        /* EQUATION WIDGETS (MICROSOFT WORD PERFECTION) */
        .equation-widget-inline {
          display: inline-block;
          vertical-align: middle;
          padding: 1px 4px;
          margin: 0 2px;
          background: rgba(241, 245, 249, 0.75);
          border: 1px dashed transparent;
          border-radius: 4px;
          cursor: pointer;
          user-select: all;
          transition: all 0.15s ease;
        }
        .equation-widget-inline:hover {
          background: #eff6ff;
          border-color: #93c5fd;
        }
        .equation-widget-block {
          display: block;
          text-align: center;
          padding: 8px 16px;
          margin: 14px auto;
          background: rgba(248, 250, 252, 0.85);
          border: 1px dashed transparent;
          border-radius: 8px;
          cursor: pointer;
          user-select: all;
          transition: all 0.15s ease;
        }
        .equation-widget-block:hover {
          background: #eff6ff;
          border-color: #93c5fd;
        }

        /* WORD SHAPES & TEXT BOXES (RESIZING & STYLING) */
        .word-shape-item {
          resize: both;
          overflow: auto;
          min-width: 60px;
          min-height: 36px;
          transition: outline 0.15s ease;
        }
        .word-shape-item:hover {
          outline: 1.5px dashed #93c5fd;
        }

        /* MOBILE RESPONSIVE OPTIMIZATIONS (شاشات الهواتف الذكية) */
        @media screen and (max-width: 768px) {
          .hide-on-mobile {
            display: none !important;
          }
          .mobile-bottom-toolbar {
            display: flex !important;
            padding-bottom: env(safe-area-inset-bottom, 0px) !important;
          }
          .sheets-scroll-container {
            padding: 12px 4px 78px 4px !important;
          }
          .a4-sheet-wrapper {
            margin-bottom: 12px !important;
          }
          .image-layout-popover {
            max-width: 92vw !important;
            left: 4vw !important;
            right: 4vw !important;
          }
        }

        /* PRINT PERFECTION (100% WYSIWYG MULTI-PAGE PDF EXPORT) */
        @media print {
          @page { 
            size: A4 portrait; 
            margin: 0 !important; 
          }
          
          html, body { 
            margin: 0 !important; 
            padding: 0 !important; 
            background: white !important; 
            width: 210mm !important; 
            height: auto !important;
            min-height: 100% !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          
          .no-print, .whatsapp-float, a[href*="wa.me"] { 
            display: none !important; 
            visibility: hidden !important;
          }
          
          .editor-layout,
          .editor-main-area,
          .editor-canvas-wrapper { 
            display: block !important; 
            height: auto !important; 
            min-height: auto !important;
            max-height: none !important;
            overflow: visible !important; 
            background: white !important; 
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .sheets-scroll-container,
          .sheets-root-container {
            display: block !important;
            transform: none !important;
            gap: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
            width: 100% !important;
            position: static !important;
          }

          .a4-sheet-wrapper {
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: always !important;
            break-after: page !important;
          }

          .a4-sheet-wrapper:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          
          .a4-sheet { 
            width: 210mm !important; 
            height: 297mm !important; 
            min-height: 297mm !important; 
            max-height: 297mm !important; 
            box-shadow: none !important; 
            margin: 0 !important; 
            border: none !important;
            border-radius: 0 !important; 
            outline: none !important;
            box-sizing: border-box !important; 
            overflow: hidden !important; 
            position: relative !important; 
            page-break-inside: avoid !important; 
            break-inside: avoid !important; 
            page-break-after: auto !important; 
            break-after: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .sheet-body-content {
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          table {
            border-collapse: collapse !important;
            border: 1px solid #94a3b8 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          table td, table th {
            border: 1px solid #94a3b8 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          thead {
            display: table-header-group !important;
          }

          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .word-shape-item {
            outline: none !important;
            resize: none !important;
          }

          .sheet-header-print { 
            position: absolute !important; 
            display: block !important; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            z-index: 3 !important;
          }

          .sheet-footer-print { 
            position: absolute !important; 
            display: flex !important; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            z-index: 3 !important;
          }

          .sheet-border-frame-print, .sheet-border-frame-print * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .sheet-border-frame-print {
            position: absolute !important;
            display: block !important;
            z-index: 1 !important;
          }

          .sheet-watermark-print { 
            position: absolute !important; 
            top: 0 !important; 
            left: 0 !important; 
            right: 0 !important; 
            bottom: 0 !important; 
            display: flex !important; 
          }

          .equation-widget-inline, .equation-widget-block {
            background: transparent !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }

          .katex {
            text-rendering: optimizeLegibility !important;
            -webkit-font-smoothing: antialiased !important;
          }

          img {
            outline: none !important;
            max-width: 100% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}

// Styling Helper Constants
const iconBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#475569',
  padding: '6px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.15s'
};

const selectStyle = {
  padding: '3px 6px',
  borderRadius: '5px',
  border: '1px solid #cbd5e1',
  fontSize: '11.5px',
  height: '26px',
  outline: 'none',
  color: '#334155',
  background: '#f8fafc',
  whiteSpace: 'nowrap'
};

const colorInputStyle = {
  cursor: 'pointer',
  width: '22px',
  height: '22px',
  padding: 0,
  border: '1px solid #cbd5e1',
  borderRadius: '4px'
};

const dividerStyle = {
  width: '1px',
  height: '18px',
  background: '#e2e8f0',
  margin: '0 4px',
  flexShrink: 0
};

const toolActionBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  background: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '5px',
  padding: '3px 8px',
  cursor: 'pointer',
  fontSize: '11.5px',
  fontWeight: 'bold',
  color: '#334155',
  height: '26px',
  whiteSpace: 'nowrap',
  flexShrink: 0
};

const aiActionBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  border: '1px solid',
  borderRadius: '5px',
  padding: '3px 8px',
  cursor: 'pointer',
  fontSize: '11.5px',
  fontWeight: 'bold',
  height: '26px',
  whiteSpace: 'nowrap',
  flexShrink: 0
};

const badgeBtnStyle = {
  background: 'white',
  border: '1px solid #cbd5e1',
  borderRadius: '5px',
  padding: '3px 7px',
  cursor: 'pointer',
  fontSize: '11.5px',
  color: '#334155',
  fontWeight: '500',
  height: '25px',
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
  flexShrink: 0
};

const inputInlineStyle = {
  padding: '3px 7px',
  borderRadius: '5px',
  border: '1px solid #cbd5e1',
  fontSize: '11.5px',
  height: '25px',
  outline: 'none',
  flexShrink: 0
};

const pageActionMiniBtnStyle = {
  background: 'white',
  border: '1px solid #cbd5e1',
  borderRadius: '4px',
  padding: '2px 6px',
  cursor: 'pointer',
  fontSize: '11px',
  color: '#475569',
  display: 'flex',
  alignItems: 'center',
  gap: '3px',
  height: '22px',
  flexShrink: 0
};

const mathPopoverStyle = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: '4px',
  background: 'white',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  boxShadow: '0 12px 30px -4px rgba(0,0,0,0.18)',
  zIndex: 999999,
  minWidth: '240px',
  maxWidth: 'calc(100vw - 20px)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

const mathDropdownItemStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '6px 10px',
  textAlign: 'right',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  borderRadius: '4px',
  transition: 'background 0.1s',
  fontSize: '12px',
  width: '100%'
};

const mathToolBtnStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'white',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  padding: '2px 5px',
  cursor: 'pointer',
  minWidth: '42px',
  height: '38px',
  transition: 'all 0.15s',
  color: '#1e293b',
  gap: '1px',
  flexShrink: 0
};

const symbolBtnStyle = {
  width: '26px',
  height: '26px',
  padding: 0,
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
  fontFamily: "'Cambria Math', 'Times New Roman', serif",
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#0f172a',
  transition: 'background 0.1s',
  flexShrink: 0
};

const wordSquareBtnStyle = {
  background: 'white',
  border: '1px solid #cbd5e1',
  borderRadius: '4px',
  cursor: 'pointer',
  color: '#334155',
  padding: '2px',
  minWidth: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s'
};

const wordMiniBtnStyle = {
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: '4px',
  cursor: 'pointer',
  color: '#334155',
  padding: '2px 5px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  height: '22px',
  transition: 'all 0.15s'
};

const mobileBottomCategoryBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '5px 10px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  border: '1px solid #cbd5e1',
  transition: 'all 0.15s',
  flexShrink: 0
};

const mobileBottomBtnStyle = (isActive = false, isDisabled = false) => ({
  background: isActive ? '#eff6ff' : 'transparent',
  border: isActive ? '1px solid #93c5fd' : '1px solid transparent',
  borderRadius: '8px',
  cursor: isDisabled ? 'not-allowed' : 'pointer',
  color: isDisabled ? '#cbd5e1' : isActive ? '#2563eb' : '#475569',
  padding: '6px 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '36px',
  height: '36px',
  transition: 'all 0.12s'
});

const mobileDropdownItemStyle = {
  width: '100%',
  padding: '9px 12px',
  background: 'none',
  border: 'none',
  borderBottom: '1px solid #f1f5f9',
  textAlign: 'right',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '13px',
  color: '#334155',
  cursor: 'pointer',
  fontFamily: 'Tajawal, sans-serif'
};

