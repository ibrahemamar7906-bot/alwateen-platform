const fs = require('fs');
const file = 'e:\\ملفات المنصة\\-\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js';
let content = fs.readFileSync(file, 'utf8');

const oldCode =                 const numPages = pdf.numPages;
                
                let additionalPages = [];
                const virtualWidth = 1000;
                const virtualHeight = 1000 * 1.3333;
                
                for (let i = 1; i <= numPages; i++) {
                   const page = await pdf.getPage(i);
                   // Render at a higher scale for better readability, compression handles size
                   const viewport = page.getViewport({ scale: 1.5 });
                   
                   const tempCanvas = document.createElement('canvas');
                   const context = tempCanvas.getContext('2d');
                   tempCanvas.height = viewport.height;
                   tempCanvas.width = viewport.width;
                   
                   await page.render({ canvasContext: context, viewport }).promise;
                   const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.6);
                   
                   if (i === 1) {;

const newCode =                 const numPages = pdf.numPages;
                
                let startPage = 1;
                let endPage = numPages;
                
                if (numPages > 1) {
                    const input = window.prompt('هذا الكتاب يحتوي على ' + numPages + ' صفحة.\\nأدخل الصفحات التي تريد استخراجها للسبورة (مثال: 1-5 أو 10):', '1-' + Math.min(numPages, 5));
                    if (!input) {
                        setIsPdfLoading(false);
                        return;
                    }
                    const parts = input.split('-');
                    startPage = Math.max(1, parseInt(parts[0]) || 1);
                    endPage = parts.length > 1 ? Math.min(numPages, parseInt(parts[1]) || numPages) : startPage;
                    
                    if (endPage - startPage > 20) {
                        const confirmLarge = window.confirm('لقد اخترت استخراج ' + (endPage - startPage + 1) + ' صفحة مرة واحدة. هذا قد يستهلك ذاكرة الجهاز. هل تريد الاستمرار؟');
                        if (!confirmLarge) {
                            setIsPdfLoading(false);
                            return;
                        }
                    }
                }
                
                let additionalPages = [];
                const virtualWidth = 1000;
                const virtualHeight = 1000 * 1.3333;
                
                for (let i = startPage; i <= endPage; i++) {
                   const page = await pdf.getPage(i);
                   // Render at a higher scale for better readability, compression handles size
                   const viewport = page.getViewport({ scale: 1.5 });
                   
                   const tempCanvas = document.createElement('canvas');
                   const context = tempCanvas.getContext('2d');
                   tempCanvas.height = viewport.height;
                   tempCanvas.width = viewport.width;
                   
                   await page.render({ canvasContext: context, viewport }).promise;
                   const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.6);
                   
                   if (i === startPage) {;

content = content.replace(oldCode, newCode);
fs.writeFileSync(file, content);
console.log('Replaced successfully');