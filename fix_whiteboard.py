import re

def fix_file(path, is_live):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Imports
    content = content.replace("import FlashcardModal from './FlashcardModal'", "import FlashcardModal from './FlashcardModal'\nimport SmartImportModal from './SmartImportModal'")
    content = content.replace("import FlashcardModal from '../whiteboard/FlashcardModal'", "import FlashcardModal from '../whiteboard/FlashcardModal'\nimport SmartImportModal from './SmartImportModal'")

    # 2. State
    content = content.replace("const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false)", "const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false)\n  const [isSmartImportModalOpen, setIsSmartImportModalOpen] = useState(false)")

    # 3. Fabric Subclasses
    subclasses = r'''
// Custom Classes for Flashcards and MindMaps
fabric.FlashcardText = fabric.util.createClass(fabric.Textbox, {
  type: 'flashcardText',
  initialize: function(text, options) {
    options = options || {};
    this.callSuper('initialize', text, options);
    this.set({
      isFlashcard: true,
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
      isMindMapNode: true,
      nodeColor: options.nodeColor || '#3b82f6',
      _connectedLines: [],
      rx: 10, ry: 10, padding: 15
    });
  },
  _renderBackground: function(ctx) {
    if (!this.backgroundColor && !this.nodeColor) return;
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
    ctx.fillStyle = this.nodeColor;
    ctx.fill();
  },
  toObject: function() {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      isMindMapNode: this.isMindMapNode, nodeColor: this.nodeColor,
      rx: this.rx, ry: this.ry, padding: this.padding
    });
  }
});
fabric.MindMapText.fromObject = function(object, callback) {
  return fabric.Object._fromObject('MindMapText', object, callback, 'text');
};
'''
    content = content.replace("import { fabric } from 'fabric'", "import { fabric } from 'fabric'\n" + subclasses)

    # 4. Replace addFlashcard precisely
    old_addFlashcard = r'''  const addFlashcard = (front, back) => {
    if (!canvas) return;
    const rect = new fabric.Rect({
      width: 250, height: 150, fill: '#8b5cf6', rx: 15, ry: 15,
      originX: 'center', originY: 'center', shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 10, offsetX: 0, offsetY: 5 })
    });
    const textObj = new fabric.Text(front, {
      originX: 'center', originY: 'center', fontSize: 32, fontWeight: 'bold', fill: '#fff',
      fontFamily: 'Tajawal', textAlign: 'center'
    });
    const group = new fabric.Group([rect, textObj], {
      ...getCenter(), originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true
    });
    group.set('isFlashcard', true);
    group.set('frontText', front);
    group.set('backText', back);
    group.set('isShowingFront', true);
    canvas.add(group);
    canvas.setActiveObject(group);
    setTool('select');
  };'''

    old_addFlashcard_live = r'''  const addFlashcard = (front, back) => {
    if (!canvas) return;
    const center = getCenter();
    const rect = new fabric.Rect({
      width: 250, height: 150, fill: '#8b5cf6', rx: 15, ry: 15, originX: 'center', originY: 'center', shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 10, offsetY: 5 })
    });
    const text = new fabric.Text(front, {
      originX: 'center', originY: 'center', fontSize: 30, fill: '#fff', fontFamily: 'Tajawal', fontWeight: 'bold'
    });
    const group = new fabric.Group([rect, text], {
      left: center.left, top: center.top, originX: 'center', originY: 'center', selectable: true, evented: true
    });
    group.set('isFlashcard', true);
    group.set('frontText', front);
    group.set('backText', back);
    group.set('isFlipped', false);
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
    if (typeof broadcastSafely === 'function') broadcastSafely();
  };'''

    new_addFlashcard = r'''  const addFlashcard = (front, back, leftOffset = 0) => {
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
      canvas.renderAll();
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
  };'''

    if is_live:
        content = content.replace(old_addFlashcard_live, new_addFlashcard)
    else:
        content = content.replace(old_addFlashcard, new_addFlashcard)

    # 5. Replace createMindMapNode precisely
    old_createMindMapNode = r'''  const createMindMapNode = (x, y, textStr, color = '#3b82f6') => {
    const rect = new fabric.Rect({
      width: 150, height: 60, fill: color, rx: 10, ry: 10,
      originX: 'center', originY: 'center', shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.2)', blur: 5, offsetY: 3 })
    });
    const text = new fabric.Text(textStr, {
      originX: 'center', originY: 'center', fontSize: 20, fill: '#fff', fontFamily: 'Tajawal', fontWeight: 'bold'
    });
    const group = new fabric.Group([rect, text], {
      left: x, top: y, originX: 'center', originY: 'center', selectable: true, evented: true, hasControls: true
    });
    group.set('isMindMapNode', true);
    group.set('_connectedLines', []);
    group.set('nodeColor', color);
    return group;
  };'''

    old_createMindMapNode_live = r'''  const createMindMapNode = (x, y, textStr, color = '#3b82f6') => {
    const rect = new fabric.Rect({
      width: 150, height: 60, fill: color, rx: 10, ry: 10, originX: 'center', originY: 'center', shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.2)', blur: 5, offsetY: 3 })
    });
    const text = new fabric.Text(textStr, {
      originX: 'center', originY: 'center', fontSize: 20, fill: '#fff', fontFamily: 'Tajawal', fontWeight: 'bold'
    });
    const group = new fabric.Group([rect, text], {
      left: x, top: y, originX: 'center', originY: 'center', selectable: true, evented: true
    });
    group.set('isMindMapNode', true);
    group.set('_connectedLines', []);
    group.set('nodeColor', color);
    return group;
  };'''

    new_createMindMapNode = r'''  const createMindMapNode = (x, y, textStr, color = '#3b82f6') => {
    const node = new window.fabric.MindMapText(textStr, {
      left: x, top: y, width: 150, fontSize: 20, fill: '#fff', fontFamily: 'Tajawal', fontWeight: 'bold', textAlign: 'center',
      originX: 'center', originY: 'center', selectable: true, evented: true, nodeColor: color
    });
    return node;
  };'''

    if is_live:
        content = content.replace(old_createMindMapNode_live, new_createMindMapNode)
    else:
        content = content.replace(old_createMindMapNode, new_createMindMapNode)

    # 6. Flashcard & Smart Import Buttons
    new_btns = r'''<button onClick={() => addFlashcard('سؤال البطاقة (نقرتين للتعديل)', 'إجابة البطاقة')} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#8b5cf6', fontSize: '18px', fontWeight: 'bold' }}>💳<span className={styles.tooltip}>بطاقة تعليمية</span></button>
                 <button onClick={() => setIsSmartImportModalOpen(true)} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#4338ca', fontSize: '18px', fontWeight: 'bold' }}>✨<span className={styles.tooltip}>استيراد ذكي</span></button>'''
    
    content = re.sub(r'<button onClick=\{\(\) => setIsFlashcardModalOpen\(true\)\}.*?</button>', new_btns, content)

    # 7. Render SmartImportModal
    content = re.sub(r'<FlashcardModal isActive=\{isFlashcardModalOpen\}.*? />', '<SmartImportModal isActive={isSmartImportModalOpen} onClose={() => setIsSmartImportModalOpen(false)} onImport={handleSmartImport} />', content)
    
    # 8. Floating Flip Button
    floating_btn = r'''        {activeObjType === 'flashcardText' && (
          <div style={{ position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <button onClick={flipActiveFlashcard} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Tajawal' }}>
              قلب البطاقة (Flip)
            </button>
          </div>
        )}
        {/* Left Toolbar: Core Tools */}'''
    content = content.replace("{/* Left Toolbar: Core Tools */}", floating_btn)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file("e:/منصة الجنيدي/app/teacher-assistant/whiteboard/WhiteboardComponent.js", False)
fix_file("e:/منصة الجنيدي/app/teacher-assistant/live-components/LiveWhiteboardTeacher.js", True)