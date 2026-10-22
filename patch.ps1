$ErrorActionPreference = 'Stop'
$filepath = "e:\منصة الجنيدي\app\teacher-assistant\whiteboard\WhiteboardComponent.js"
$content = [System.IO.File]::ReadAllText($filepath, [System.Text.Encoding]::UTF8)

# 1. Update fabric.MindMapText
$old_mindmap_class = @"
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
    ctx.beginPath();
    ctx.moveTo(x + this.rx, y);
    ctx.lineTo(x + w - this.rx, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + this.ry);
    ctx.lineTo(x + w, y + h - this.ry);
    ctx.quadraticCurveTo(x + w, y + h, x + w - this.rx, y + h);
    ctx.lineTo(x + this.rx, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - this.ry);
    ctx.lineTo(x, y + this.ry);
    ctx.quadraticCurveTo(x, y, x + this.rx, y);
    ctx.closePath();
    ctx.fillStyle = this.nodeColor;
    ctx.fill();
  }
});
"@

$new_mindmap_class = @"
fabric.MindMapText = fabric.util.createClass(fabric.Textbox, {
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
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.nodeColor;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
    } else if (this.theme === 'minimal') {
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.nodeColor;
      ctx.stroke();
      ctx.fillStyle = 'transparent';
    } else {
      ctx.fillStyle = this.nodeColor;
    }
    
    if (this.theme !== 'minimal') {
      ctx.fill();
    }
  }
});
"@
$content = $content.Replace($old_mindmap_class, $new_mindmap_class)
Write-Host "Replaced MindMapText class"

# 2. Update toJSON arrays
$old_tojson = "['lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'isFlashcard', 'isMindMapNode', 'frontText', 'backText', 'isFlipped', 'nodeColor']"
$new_tojson = "['lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'isFlashcard', 'isMindMapNode', 'frontText', 'backText', 'isFlipped', 'nodeColor', 'theme', 'mindMapId', 'isMindMapLine', 'mindMapFromId', 'mindMapToId']"
$content = $content.Replace($old_tojson, $new_tojson)
Write-Host "Replaced toJSON"

# 3. Update createMindMapNode
$old_create_mindmap = @"
  const createMindMapNode = (x, y, textStr, color = '#3b82f6') => {
    const node = new window.fabric.MindMapText(textStr, {
      left: x, top: y, width: 150, fontSize: 20, fill: '#fff', fontFamily: 'Tajawal', fontWeight: 'bold', textAlign: 'center',
      originX: 'center', originY: 'center', selectable: true, evented: true, nodeColor: color
    });
    return node;
  };
"@

$new_create_mindmap = @"
  const createMindMapNode = (x, y, textStr, color = '#3b82f6', theme = 'classic') => {
    const textFill = (theme === 'outline' || theme === 'minimal') ? color : '#fff';
    const node = new window.fabric.MindMapText(textStr, {
      left: x, top: y, width: 150, fontSize: 20, fill: textFill, fontFamily: 'Tajawal', fontWeight: 'bold', textAlign: 'center',
      originX: 'center', originY: 'center', selectable: true, evented: true, nodeColor: color, theme: theme
    });
    return node;
  };

  const handleMindMapImport = (text, theme) => {
    if (!canvas) return;
    const lines = text.split('\n').filter(l => l.trim() !== '');
    const stack = [];
    const startX = 600; 
    let currentY = 150;
    const colors = ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    
    lines.forEach((line) => {
      const rawIndentation = line.match(/^[\t ]*/)[0];
      let level = 0;
      if (rawIndentation.includes('\t')) {
        level = rawIndentation.split('\t').length - 1;
      } else {
        level = Math.floor(rawIndentation.length / 4);
      }
      
      const content = line.trim();
      if (!content) return;
      
      const xPos = startX - (level * 250);
      const yPos = currentY;
      currentY += 100;
      
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
"@
$content = $content.Replace($old_create_mindmap, $new_create_mindmap)
Write-Host "Replaced createMindMapNode"

# Replace branch line
$old_branch_line = @"
const lineObj = new fabric.Line([activeObj.left, activeObj.top, child.left, child.top], {
      stroke: '#94a3b8', strokeWidth: 3, selectable: false, evented: false, strokeDashArray: [5, 5]
    });
"@
$new_branch_line = @"
const lineObj = new fabric.Line([activeObj.left, activeObj.top, child.left, child.top], {
      stroke: '#94a3b8', strokeWidth: 3, selectable: false, evented: false, strokeDashArray: [5, 5],
      isMindMapLine: true, mindMapFromId: activeObj.mindMapId, mindMapToId: child.mindMapId
    });
"@
$content = $content.Replace($old_branch_line, $new_branch_line)
Write-Host "Replaced branch line"

# 4. Update object:moving
$old_moving = @"
    initCanvas.on('object:moving', (e) => {
      const p = e.target;
      if (p && p.isMindMapNode && p._connectedLines) {
        p._connectedLines.forEach(link => {
          if (link.from === p) {
            link.line.set({ x1: p.left, y1: p.top });
          }
          if (link.to === p) {
            link.line.set({ x2: p.left, y2: p.top });
          }
        });
      }
    });
"@
$new_moving = @"
    initCanvas.on('object:moving', (e) => {
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
    });
"@
$content = $content.Replace($old_moving, $new_moving)
Write-Host "Replaced object:moving"

# 5. Modals
if (-not ($content.Contains("import MindMapImportModal"))) {
    $content = $content.Replace("import SmartImportModal from './SmartImportModal'", "import SmartImportModal from './SmartImportModal'`nimport MindMapImportModal from './MindMapImportModal'")
    $content = $content.Replace("const [isSmartImportModalOpen, setIsSmartImportModalOpen] = useState(false)", "const [isSmartImportModalOpen, setIsSmartImportModalOpen] = useState(false)`n  const [isMindMapImportOpen, setIsMindMapImportOpen] = useState(false)")
    
    $old_modal_render = "<SmartImportModal isActive={isSmartImportModalOpen} onClose={() => setIsSmartImportModalOpen(false)} onImport={handleSmartImport} />"
    $new_modal_render = "<SmartImportModal isActive={isSmartImportModalOpen} onClose={() => setIsSmartImportModalOpen(false)} onImport={handleSmartImport} />`n        <MindMapImportModal isActive={isMindMapImportOpen} onClose={() => setIsMindMapImportOpen(false)} onImport={handleMindMapImport} />"
    $content = $content.Replace($old_modal_render, $new_modal_render)
    
    $old_btn = "<button onClick={addMindMapRoot} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', fontSize: '18px' }}>🧠<span className={styles.tooltip}>خريطة ذهنية</span></button>"
    $new_btn = "<button onClick={addMindMapRoot} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', fontSize: '18px' }}>🧠<span className={styles.tooltip}>خريطة ذهنية</span></button>`n              <button onClick={() => setIsMindMapImportOpen(true)} className={styles.toolBtn} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#3b82f6', fontSize: '18px', fontWeight: 'bold' }}>✨<span className={styles.tooltip}>استيراد خريطة</span></button>"
    $content = $content.Replace($old_btn, $new_btn)
    Write-Host "Replaced Modals"
}

[System.IO.File]::WriteAllText($filepath, $content, [System.Text.Encoding]::UTF8)