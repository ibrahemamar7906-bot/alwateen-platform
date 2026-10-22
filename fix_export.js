const fs = require('fs');
const file = 'e:/ملفات المنصة/-/app/teacher-assistant/whiteboard/WhiteboardComponent.js';

let content = fs.readFileSync(file, 'utf8');

const oldExportStart = `  const exportToPDF = async () => {
    if (!canvas) return;
    if (!isPremium && !isAdmin) { setShowPremiumAlert(true); return; }
    
    try {
      const { jsPDF } = await import('jspdf');`;

const newExportStart = `  const exportToPDF = async () => {
    if (!canvas) return;
    if (!isPremium && !isAdmin) { setShowPremiumAlert(true); return; }
    
    const includeBg = window.confirm('هل تريد تصدير الملف بخلفية السبورة الحالية؟\\n\\n- اضغط OK (موافق) لتصدير الخلفية الحالية (صور، مربعات، إلخ).\\n- اضغط Cancel (إلغاء) لتصدير بخلفية بيضاء.');
    
    try {
      const { jsPDF } = await import('jspdf');`;

content = content.replace(oldExportStart, newExportStart);


const oldBgLogic = `        tempCanvas.setViewportTransform([1, 0, 0, 1, -minX + offsetX, -minY + offsetY]);
        tempCanvas.backgroundColor = bgColor;
        tempCanvas.renderAll();`;

const newBgLogic = `        tempCanvas.setViewportTransform([1, 0, 0, 1, -minX + offsetX, -minY + offsetY]);
        
        if (includeBg) {
          if (customBgImage) {
            await new Promise(resolve => {
              fabric.Image.fromURL(customBgImage, (img) => {
                const scaleX = finalW / img.width;
                const scaleY = finalH / img.height;
                const scale = Math.max(scaleX, scaleY);
                img.set({
                  scaleX: scale,
                  scaleY: scale,
                  originX: 'center',
                  originY: 'center',
                  left: finalW / 2,
                  top: finalH / 2
                });
                tempCanvas.setBackgroundImage(img, tempCanvas.renderAll.bind(tempCanvas));
                resolve();
              }, { crossOrigin: 'anonymous' });
            });
          } else {
            tempCanvas.backgroundColor = '#ffffff';
            if (bgType === 'ruled' || bgType === 'grid') {
              const patternCanvas = document.createElement('canvas');
              patternCanvas.width = 40;
              patternCanvas.height = 40;
              const pCtx = patternCanvas.getContext('2d');
              pCtx.fillStyle = '#ffffff';
              pCtx.fillRect(0, 0, 40, 40);
              pCtx.fillStyle = '#e2e8f0';
              if (bgType === 'ruled' || bgType === 'grid') pCtx.fillRect(0, 39, 40, 1);
              if (bgType === 'grid') pCtx.fillRect(39, 0, 1, 40);
              
              const pattern = new fabric.Pattern({ source: patternCanvas, repeat: 'repeat' });
              tempCanvas.setBackgroundColor(pattern, tempCanvas.renderAll.bind(tempCanvas));
            } else {
              tempCanvas.backgroundColor = bgColor;
            }
          }
        } else {
          tempCanvas.setBackgroundImage(null, tempCanvas.renderAll.bind(tempCanvas));
          tempCanvas.backgroundColor = '#ffffff';
        }
        
        tempCanvas.renderAll();`;

content = content.replace(oldBgLogic, newBgLogic);

fs.writeFileSync(file, content, 'utf8');
